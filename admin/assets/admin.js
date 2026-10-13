/* =========================================================================
   admin.js — núcleo do painel: sessão, permissões, layout (sidebar/topbar),
   modais, uploads com compressão, CSV e utilidades compartilhadas.
   Cada página do painel tem um <script> próprio no final do HTML.
   ========================================================================= */
(function () {
  'use strict';
  var A = window.App, CFG = window.SITE_CONFIG;
  var qs = A.qs, qsa = A.qsa, esc = A.esc, icon = A.icon;

  var Admin = window.Admin = {
    sb: null, user: null, profile: null, isAdmin: false,
    STATUS_VEIC: { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido', oculto: 'Oculto' },
    STATUS_LEAD: { novo: 'Novo', em_atendimento: 'Em atendimento', proposta: 'Proposta enviada', concluido: 'Concluído', perdido: 'Perdido' },
    TIPO_LEAD: { interesse: 'Interesse em veículo', avaliacao: 'Avaliação', financiamento: 'Financiamento', contato: 'Contato' },
    CAMBIOS: ['Automático', 'Manual', 'CVT', 'Automatizado'],
    COMBUSTIVEIS: ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico', 'Etanol', 'GNV'],
    CARROCERIAS: ['Hatch', 'Sedã', 'SUV', 'Picape', 'Utilitário', 'Caminhão', 'Van', 'Cupê', 'Conversível', 'Moto']
  };

  var MENU = [
    { id: 'dashboard', label: 'Dashboard', href: 'index.html', icon: 'dashboard' },
    { id: 'veiculos', label: 'Veículos', href: 'veiculos.html', icon: 'car' },
    { id: 'leads', label: 'Leads', href: 'leads.html', icon: 'inbox', badge: true },
    { sep: true, admin: true },
    { id: 'vendedores', label: 'Vendedores', href: 'vendedores.html', icon: 'users', admin: true },
    { id: 'usuarios', label: 'Usuários', href: 'usuarios.html', icon: 'key', admin: true },
    { id: 'configuracoes', label: 'Configurações', href: 'configuracoes.html', icon: 'settings', admin: true }
  ];

  /* ------------------------------ util ------------------------------ */
  Admin.iniciais = function (n) {
    var p = String(n || '?').trim().split(/\s+/);
    return ((p[0] || '')[0] || '?').toUpperCase() + (p.length > 1 ? (p[p.length - 1][0] || '').toUpperCase() : '');
  };
  Admin.avatar = function (p, size) {
    var s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
    return '<span class="avatar"' + s + '>' + (p && p.avatar ? '<img src="' + esc(p.avatar) + '" alt="">' : esc(Admin.iniciais(p && p.nome))) + '</span>';
  };
  Admin.chip = function (kind, val) {
    var map = kind === 'veic' ? Admin.STATUS_VEIC : kind === 'lead' ? Admin.STATUS_LEAD : Admin.TIPO_LEAD;
    var cls = kind === 'tipo' ? 't-' : 's-';
    return '<span class="chip-s ' + cls + esc(val) + '">' + esc(map[val] || val) + '</span>';
  };
  Admin.titulo = function (v) { return esc(v.marca) + ' <span>' + esc(v.modelo) + '</span>'; };
  Admin.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms || 250); }; };
  Admin.siteUrl = function (p) { return A.absLink('../' + (p || '')); };
  Admin.dias = function (d) { if (!d) return 0; return Math.max(0, Math.floor((Date.now() - new Date(d + (String(d).length === 10 ? 'T12:00:00' : '')).getTime()) / 86400000)); };
  Admin.dataBR = function (d) { if (!d) return '—'; var x = new Date(d + (String(d).length === 10 ? 'T12:00:00' : '')); return x.toLocaleDateString('pt-BR'); };
  Admin.dataHoraBR = function (d) { if (!d) return '—'; return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); };
  Admin.uuid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2); };
  // Telefone salvo "(31) 99999-9999" -> "5531999999999"
  Admin.waNumero = function (t) { var d = A.onlyDigits(t); if (d && d.length <= 11) d = '55' + d; return d; };
  Admin.capa = function (v) {
    var f = (v.veiculo_fotos || []).slice().sort(function (a, b) { return a.ordem - b.ordem; })[0];
    return f ? f.url : A.url('assets/img/veiculos/hatch-1.svg');
  };
  Admin.slug = function (s) { return A.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); };

  Admin.erro = function (e, padrao) {
    console.error(e);
    var m = (e && (e.message || e.error_description)) || '';
    if (/row-level security|permission denied|not allowed/i.test(m)) m = 'Você não tem permissão para esta ação.';
    else if (/último Administrador/i.test(m)) m = 'Não é possível remover o último Administrador.';
    else if (/Failed to fetch|NetworkError/i.test(m)) m = 'Sem conexão com o servidor. Verifique sua internet.';
    else if (!m) m = padrao || 'Algo deu errado. Tente novamente.';
    A.toast(m, 4000);
  };

  // Compressão no navegador: máx. 1600px, WebP ~80%
  Admin.comprimir = function (file, max, q) {
    max = max || 1600; q = q || 0.8;
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(file);
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, r = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { resolve(b && b.size < file.size * 1.2 ? b : file); }, 'image/webp', q);
      };
      img.onerror = function () { URL.revokeObjectURL(u); resolve(file); };
      img.src = u;
    });
  };
  Admin.uploadPublico = function (bucket, path, blob) {
    return Admin.sb.storage.from(bucket).upload(path, blob, { contentType: blob.type || 'image/webp', cacheControl: '31536000', upsert: false })
      .then(function (r) {
        if (r.error) throw r.error;
        return { path: path, url: Admin.sb.storage.from(bucket).getPublicUrl(path).data.publicUrl };
      });
  };
  // Upload de imagem do site (logo, hero, avatar…) para o bucket público "site"
  Admin.uploadImagemSite = function (file, pasta, max) {
    return Admin.comprimir(file, max || 2000, 0.85).then(function (blob) {
      var ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'png').toLowerCase();
      return Admin.uploadPublico('site', (pasta || 'imagens') + '/' + Admin.uuid() + '.' + ext, blob);
    });
  };

  // Indicador de força da senha (0–4)
  Admin.forca = function (pw) {
    pw = pw || ''; var s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    if (pw.length < 8) s = Math.min(s, 1);
    var info = [['Muito fraca', '#B42318'], ['Fraca', '#D9480F'], ['Razoável', '#B7791F'], ['Boa', '#2F855A'], ['Forte', '#15803D']][s];
    return { score: s, label: info[0], cor: info[1], pct: (s + 1) * 20 };
  };
  Admin.bindForca = function (input, bar, lbl) {
    function up() { var f = Admin.forca(input.value); bar.style.width = input.value ? f.pct + '%' : '0'; bar.style.background = f.cor; lbl.textContent = input.value ? 'Força da senha: ' + f.label : 'Mínimo de 8 caracteres.'; }
    input.addEventListener('input', up); up();
  };

  Admin.csv = function (linhas, nome) {
    var txt = linhas.map(function (l) {
      return l.map(function (c) { c = c == null ? '' : String(c); return /[";\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';');
    }).join('\r\n');
    var blob = new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome || 'export.csv';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  Admin.beep = function () {
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      var ctx = new C(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  /* ------------------------------ modal ------------------------------ */
  Admin.modal = function (o) {
    return new Promise(function (resolve) {
      var bg = document.createElement('div');
      bg.className = 'modal-bg';
      bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdl-t">' +
        '<div class="modal-head"><h2 id="mdl-t">' + esc(o.title || '') + '</h2><button type="button" class="icon-sq" data-x aria-label="Fechar">' + icon('x') + '</button></div>' +
        '<form class="modal-body" novalidate>' + (o.body || '') + '</form>' +
        '<div class="modal-foot">' + (o.cancel === false ? '' : '<button type="button" class="btn btn-outline btn-sm" data-x>' + esc(o.cancelText || 'Cancelar') + '</button>') +
        '<button type="button" class="btn btn-sm ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-ok>' + esc(o.confirmText || 'Confirmar') + '</button></div></div>';
      document.body.appendChild(bg);
      var last = document.activeElement;
      requestAnimationFrame(function () { bg.classList.add('is-open'); var f = bg.querySelector('input,select,textarea,[data-ok]'); if (f) f.focus(); });
      A.applyMasks(bg);
      if (o.onOpen) o.onOpen(bg);
      function close(val) {
        bg.classList.remove('is-open'); document.removeEventListener('keydown', key);
        setTimeout(function () { bg.remove(); if (last && last.focus) last.focus(); }, 200);
        resolve(val);
      }
      function key(e) { if (e.key === 'Escape') close(false); }
      document.addEventListener('keydown', key);
      bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-x]')) close(false); });
      var okBtn = bg.querySelector('[data-ok]');
      function ok() {
        if (!o.onConfirm) return close(true);
        var r = o.onConfirm(bg);
        if (r === false) return;
        if (r && r.then) {
          okBtn.classList.add('is-loading'); var t = okBtn.innerHTML; okBtn.innerHTML = '<span class="spinner"></span>';
          r.then(function (v) { if (v === false) { okBtn.classList.remove('is-loading'); okBtn.innerHTML = t; return; } close(v === undefined ? true : v); },
            function (e) { okBtn.classList.remove('is-loading'); okBtn.innerHTML = t; Admin.erro(e); });
        } else close(r === undefined ? true : r);
      }
      okBtn.addEventListener('click', ok);
      bg.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); ok(); });
    });
  };
  Admin.confirmar = function (texto, o) {
    o = o || {};
    return Admin.modal({ title: o.title || 'Tem certeza?', body: '<p>' + esc(texto) + '</p>', confirmText: o.confirmText || 'Confirmar', danger: o.danger });
  };

  /* --------------------------- menus "⋯" ---------------------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-menu]');
    qsa('.pop-menu.is-open').forEach(function (m) { if (!t || m !== t.nextElementSibling) m.classList.remove('is-open'); });
    if (t) {
      e.stopPropagation();
      var m = t.nextElementSibling, open = m.classList.toggle('is-open');
      if (open) { // posição fixa: não é cortado por tabelas com rolagem
        var r = t.getBoundingClientRect();
        m.style.position = 'fixed'; m.style.right = 'auto';
        var w = m.offsetWidth, h = m.offsetHeight;
        m.style.left = Math.max(8, r.right - w) + 'px';
        m.style.top = (r.bottom + 6 + h > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
      }
    }
  });
  window.addEventListener('scroll', function () { qsa('.pop-menu.is-open').forEach(function (m) { m.classList.remove('is-open'); }); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') qsa('.pop-menu.is-open').forEach(function (m) { m.classList.remove('is-open'); }); });

  /* ---------------------------- modo demo ---------------------------- */
  function telaDemo() {
    document.body.classList.remove('adm-loading');
    var b = qs('.adm-boot'); if (b) b.remove();
    document.body.innerHTML = '<div class="login-side" style="min-height:100vh"><div class="card" style="max-width:640px">' +
      '<div class="notice">' + icon('alert') + '<div><h2>Configure o Supabase para ativar o painel</h2>' +
      '<p>O site está em <strong>modo demonstração</strong>: o estoque vem de <code>data/veiculos.json</code> e os formulários abrem o WhatsApp.</p>' +
      '<ol><li>Crie um projeto gratuito em supabase.com e rode <code>supabase/schema.sql</code> no SQL Editor.</li>' +
      '<li>Copie a <em>Project URL</em> e a <em>anon public key</em> em Project Settings › API.</li>' +
      '<li>Cole as duas em <code>data/config.js</code> e publique o site de novo.</li></ol>' +
      '<p style="margin-top:10px">O passo a passo completo está no arquivo <code>LEIA-ME.md</code>.</p></div></div>' +
      '<p style="margin-top:18px"><a class="link-arrow" href="../index.html">← Voltar para o site</a></p></div></div>';
  }
  Admin.telaDemo = telaDemo;

  /* ---------------------------- layout ---------------------------- */
  function renderShell(o) {
    var p = Admin.profile, L = CFG.loja;
    var nav = MENU.filter(function (m) { return !m.admin || Admin.isAdmin; }).map(function (m) {
      if (m.sep) return '<div class="sep" role="separator"></div>';
      return '<a href="' + m.href + '"' + (m.id === o.page ? ' class="is-active" aria-current="page"' : '') + '>' + icon(m.icon) + '<span>' + m.label + '</span>' +
        (m.badge ? '<span class="count" id="badge-leads" hidden>0</span>' : '') + '</a>';
    }).join('');
    var crumb = '<a href="index.html">Painel</a>' + (o.crumbs || []).map(function (c) { return ' / ' + (c.href ? '<a href="' + c.href + '">' + esc(c.label) + '</a>' : esc(c.label)); }).join('');
    var action = '';
    if (o.action) action = '<a class="btn btn-primary btn-sm" href="' + o.action.href + '"' + (o.action.id ? ' id="' + o.action.id + '"' : '') + '>' + icon(o.action.icon || 'plus') + '<span class="lbl">' + esc(o.action.label) + '</span></a>';

    var shell = document.createElement('div');
    shell.className = 'adm-shell';
    shell.innerHTML =
      '<aside class="adm-side" id="adm-side" aria-label="Menu do painel">' +
      '<a class="logo" href="index.html">' + A.marca(true) + '</a>' +
      '<nav class="adm-nav">' + nav + '</nav>' +
      '<div class="adm-side-foot"><a href="../index.html" target="_blank" rel="noopener">' + icon('external') + ' Ver site ↗</a>' +
      '<div class="user-card"><div class="who">' + Admin.avatar(p) + '<div><strong>' + esc(p.nome || p.email) + '</strong><small>' + (Admin.isAdmin ? 'Administrador' : 'Vendedor') + '</small></div></div>' +
      '<div class="links"><a href="perfil.html">' + icon('user') + ' Meu perfil</a><button type="button" id="btn-sair">' + icon('logout') + ' Sair</button></div></div></div>' +
      '</aside><div class="adm-overlay" id="adm-overlay"></div>' +
      '<div class="adm-body"><header class="adm-top">' +
      '<button type="button" class="icon-sq adm-burger" id="adm-burger" aria-label="Abrir menu" aria-expanded="false">' + icon('menu') + '</button>' +
      '<div class="titles"><h1>' + esc(o.title) + '</h1><div class="crumb">' + crumb + '</div></div>' +
      '<div class="right"><form class="adm-search" id="adm-search" role="search"><label class="sr-only" for="adm-q">Buscar veículo</label>' + icon('search') +
      '<input class="input" id="adm-q" placeholder="Buscar veículo (marca, modelo, placa)" autocomplete="off"></form>' + action + '</div>' +
      '</header></div>';
    var main = qs('#adm-main');
    shell.querySelector('.adm-body').appendChild(main);
    document.body.insertBefore(shell, document.body.firstChild);

    qs('#adm-search').addEventListener('submit', function (e) {
      e.preventDefault(); var q = qs('#adm-q').value.trim();
      location.href = 'veiculos.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
    qs('#btn-sair').addEventListener('click', function () {
      Admin.sb.auth.signOut().finally(function () { location.replace('login.html'); });
    });
    var side = qs('#adm-side'), ov = qs('#adm-overlay'), bur = qs('#adm-burger');
    function setSide(open) { side.classList.toggle('is-open', open); ov.classList.toggle('is-open', open); bur.setAttribute('aria-expanded', open); document.body.classList.toggle('no-scroll', open); }
    bur.addEventListener('click', function () { setSide(true); });
    ov.addEventListener('click', function () { setSide(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && side.classList.contains('is-open')) setSide(false); });
  }

  function contarLeadsNovos() {
    Admin.sb.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'novo').then(function (r) {
      var b = qs('#badge-leads'); if (!b || r.error) return;
      b.textContent = r.count || 0; b.hidden = !r.count;
    });
  }
  Admin.contarLeadsNovos = contarLeadsNovos;

  /* ---------------------------- init ---------------------------- */
  Admin.init = function (o) {
    o = o || {};
    document.body.classList.add('adm-loading');
    var boot = document.createElement('div'); boot.className = 'adm-boot'; boot.innerHTML = '<span class="spinner"></span> Carregando painel…';
    document.body.appendChild(boot);

    return DB.ready.then(function () {
      if (DB.demo || !DB.client) { telaDemo(); return new Promise(function () {}); }
      Admin.sb = DB.client;
      return Admin.sb.auth.getSession();
    }).then(function (r) {
      var s = r.data && r.data.session;
      if (!s) {
        var next = location.pathname.split('/').pop() + location.search;
        location.replace('login.html?next=' + encodeURIComponent(next));
        return new Promise(function () {});
      }
      Admin.user = s.user;
      return Admin.sb.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
    }).then(function (r) {
      var p = r.data;
      if (!p || !p.ativo) {
        return Admin.sb.auth.signOut().finally(function () { location.replace('login.html?desativado=1'); }).then(function () { return new Promise(function () {}); });
      }
      Admin.profile = p; Admin.isAdmin = p.funcao === 'admin';
      if (o.adminOnly && !Admin.isAdmin) { location.replace('index.html'); return new Promise(function () {}); }
      if (p.trocar_senha && o.page !== 'perfil') { location.replace('perfil.html?trocar=1'); return new Promise(function () {}); }
      try {
        if (!sessionStorage.getItem('vs_acesso')) {
          sessionStorage.setItem('vs_acesso', '1');
          Admin.sb.from('profiles').update({ ultimo_acesso: new Date().toISOString() }).eq('id', p.id).then(function () {});
        }
      } catch (e) {}
      renderShell(o);
      document.body.classList.remove('adm-loading'); boot.remove();
      contarLeadsNovos();
      Admin.sb.channel('badge-leads').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, Admin.debounce(contarLeadsNovos, 400)).subscribe();
      Admin.sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT') location.replace('login.html'); });
      return { sb: Admin.sb, profile: p };
    }).catch(function (e) {
      console.error(e);
      boot.innerHTML = '<div class="card" style="max-width:480px;text-align:center"><p>Não foi possível carregar o painel.</p><p class="muted" style="font-size:13px;margin:8px 0 16px">' + esc(e.message || '') + '</p><a class="btn btn-primary btn-sm" href="login.html">Entrar novamente</a></div>';
      return new Promise(function () {});
    });
  };

  /* Lista de vendedores (para selects) */
  Admin.vendedores = function () {
    return Admin.sb.from('vendedores').select('id,nome,whatsapp,ativo,profile_id').order('ordem').then(function (r) { return r.data || []; });
  };
  Admin.usuarios = function () {
    return Admin.sb.from('profiles').select('id,nome,email,funcao,ativo,telefone').order('nome').then(function (r) { return r.data || []; });
  };
})();
