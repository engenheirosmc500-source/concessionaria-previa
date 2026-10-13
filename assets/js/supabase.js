/* =========================================================================
   supabase.js — cliente Supabase + funções de dados compartilhadas
   (site público e painel). Em modo demonstração usa data/veiculos.json.
   ========================================================================= */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  var BASE = (document.body && document.body.getAttribute('data-base')) || '';
  var demo = !(CFG.supabaseUrl && CFG.supabaseAnonKey);

  // Colunas públicas de veículos (placa, vendedor e valor de venda ficam privados)
  var COLS_PUBLICAS = 'id,marca,modelo,versao,ano_fabricacao,ano_modelo,km,cambio,combustivel,carroceria,cor,portas,preco,consulte,opcionais,descricao,destaque,status,data_cadastro,veiculo_fotos(url,ordem)';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = function () { reject(new Error('Falha ao carregar o SDK do Supabase')); };
      document.head.appendChild(s);
    });
  }

  // "Manter conectado": localStorage quando marcado, sessionStorage quando não.
  var authStorage = {
    _pick: function () {
      try { return localStorage.getItem('vs_manter') === '0' ? sessionStorage : localStorage; } catch (e) { return null; }
    },
    getItem: function (k) { try { var s = this._pick(); return s ? s.getItem(k) : null; } catch (e) { return null; } },
    setItem: function (k, v) { try { var s = this._pick(); if (s) s.setItem(k, v); } catch (e) {} },
    removeItem: function (k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} }
  };

  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function merge(target, src) {
    if (!isObj(src)) return target;
    Object.keys(src).forEach(function (k) {
      var v = src[k];
      if (v === null || v === undefined || v === '') return;
      if (isObj(v) && isObj(target[k])) merge(target[k], v);
      else target[k] = v;
    });
    return target;
  }

  function mapVeiculo(r) {
    var fotos = (r.veiculo_fotos || []).slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); }).map(function (f) { return f.url; });
    return {
      id: r.id, marca: r.marca, modelo: r.modelo, versao: r.versao || '',
      anoFabricacao: r.ano_fabricacao, anoModelo: r.ano_modelo, km: Number(r.km || 0),
      cambio: r.cambio, combustivel: r.combustivel, carroceria: r.carroceria, cor: r.cor, portas: r.portas,
      preco: Number(r.preco || 0), consulte: !!r.consulte, opcionais: r.opcionais || [], descricao: r.descricao || '',
      fotos: fotos, destaque: !!r.destaque, dataCadastro: r.data_cadastro, status: r.status || 'disponivel'
    };
  }


  /* -----------------------------------------------------------------------
     TEMA (identidade visual) — cores escolhidas no painel viram variáveis
     CSS. Variações (hover, fundo suave, texto legível) são calculadas aqui,
     garantindo contraste mesmo quando o dono escolhe uma cor clara.
     ----------------------------------------------------------------------- */
  var TEMA_PADRAO = { primaria: '#8F6A12', escura: '#0B1128', destaque: '#D4A537', fundo: '#F7F7F8' };
  var Cor = {
    valida: function (h) { return /^#[0-9a-f]{6}$/i.test(String(h || '')); },
    rgb: function (h) { h = String(h).replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); },
    hex: function (c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase(); },
    lum: function (h) {
      var c = Cor.rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    },
    contraste: function (a, b) { var x = Cor.lum(a), y = Cor.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); },
    misturar: function (a, b, t) { var x = Cor.rgb(a), y = Cor.rgb(b); return Cor.hex(x.map(function (v, i) { return v + (y[i] - v) * t; })); },
    escurecer: function (h, t) { return Cor.misturar(h, '#000000', t); },
    clarear: function (h, t) { return Cor.misturar(h, '#FFFFFF', t); },
    // escurece até atingir o contraste mínimo contra o fundo
    legivel: function (h, fundo, min) {
      var c = h, i = 0;
      while (Cor.contraste(c, fundo) < min && i < 30) { c = Cor.escurecer(h, (++i) * 0.04); }
      return c;
    }
  };
  function calcularTema(t) {
    t = t || {};
    var p = Cor.valida(t.primaria) ? t.primaria.toUpperCase() : TEMA_PADRAO.primaria;
    var d = Cor.valida(t.escura) ? t.escura.toUpperCase() : TEMA_PADRAO.escura;
    var g = Cor.valida(t.destaque) ? t.destaque.toUpperCase() : TEMA_PADRAO.destaque;
    var f = Cor.valida(t.fundo) ? t.fundo.toUpperCase() : TEMA_PADRAO.fundo;
    var onP = Cor.contraste('#FFFFFF', p) >= 4.5 ? '#FFFFFF' : (Cor.contraste('#111827', p) >= Cor.contraste('#FFFFFF', p) ? '#111827' : '#FFFFFF');
    var rgb = Cor.rgb(p);
    return {
      '--primary': p,
      '--primary-hover': Cor.escurecer(p, 0.12),
      '--primary-soft': 'rgba(' + rgb.join(', ') + ', .08)',
      '--primary-text': Cor.legivel(p, '#FFFFFF', 4.5),
      '--on-primary': onP,
      '--dark': d,
      '--dark-2': Cor.clarear(d, 0.08),
      '--gold': g,
      '--bg-soft': f
    };
  }
  function aplicarTema(t, alvo) {
    var vars = calcularTema(t), el = alvo || document.documentElement;
    Object.keys(vars).forEach(function (k) { el.style.setProperty(k, vars[k]); });
    if (!alvo) {
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', vars['--dark']);
    }
    return vars;
  }
  // 1) cores do config.js; 2) última identidade salva (evita "piscar" a cor antiga)
  aplicarTema(CFG.tema);
  if (!demo) { try { var cache = JSON.parse(localStorage.getItem('vs_tema') || 'null'); if (cache) aplicarTema(cache); } catch (e) {} }

  var cacheVeiculos = null;

  var DB = {
    demo: demo,
    client: null,
    config: CFG,
    base: BASE,
    mapVeiculo: mapVeiculo,
    Cor: Cor, TEMA_PADRAO: TEMA_PADRAO, calcularTema: calcularTema, aplicarTema: aplicarTema,
    ready: null,

    getVeiculos: function () {
      if (cacheVeiculos) return Promise.resolve(cacheVeiculos);
      var p;
      if (demo || !DB.client) {
        p = fetch(BASE + 'data/veiculos.json', { cache: 'no-cache' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (lista) {
            return lista.filter(function (v) { var s = v.status || 'disponivel'; return s === 'disponivel' || s === 'reservado'; })
              .map(function (v) { v.status = v.status || 'disponivel'; return v; });
          });
      } else {
        p = DB.client.from('veiculos').select(COLS_PUBLICAS).in('status', ['disponivel', 'reservado'])
          .order('data_cadastro', { ascending: false })
          .then(function (res) { if (res.error) throw res.error; return res.data.map(mapVeiculo); });
      }
      return p.then(function (l) { cacheVeiculos = l; return l; }).catch(function (e) {
        console.error('[estoque]', e);
        throw e;
      });
    },

    getVeiculo: function (id) {
      return DB.getVeiculos().then(function (l) {
        return l.filter(function (v) { return String(v.id) === String(id); })[0] || null;
      });
    },

    /* Grava um lead. lead = {tipo, nome, telefone, email, mensagem, dados, veiculo_id}
       arquivos = File[] (só no formulário de venda) */
    inserirLead: function (lead, arquivos) {
      if (demo || !DB.client) return Promise.reject(new Error('demo'));
      var uploads = (arquivos || []).map(function (f, i) {
        var ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        var path = (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + '/' + (i + 1) + '.' + ext;
        return DB.client.storage.from('leads-fotos').upload(path, f, { contentType: f.type, upsert: false })
          .then(function (r) { if (r.error) throw r.error; return path; });
      });
      return Promise.all(uploads).then(function (paths) {
        var row = {
          tipo: lead.tipo, nome: lead.nome, telefone: lead.telefone, email: lead.email || null,
          mensagem: lead.mensagem || null, dados: lead.dados || {}, veiculo_id: lead.veiculo_id || null,
          fotos: paths
        };
        return DB.client.from('leads').insert(row).then(function (r) { if (r.error) throw r.error; return true; });
      });
    }
  };

  DB.ready = (function () {
    if (demo) return Promise.resolve(DB);
    return loadScript(SDK_URL).then(function () {
      DB.client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: authStorage, storageKey: 'vs-auth' }
      });
      return Promise.all([
        DB.client.from('configuracoes').select('dados').eq('id', 1).maybeSingle(),
        DB.client.from('vendedores').select('nome,cargo,whatsapp,foto,ordem').eq('ativo', true).order('ordem', { ascending: true })
      ]).then(function (res) {
        var conf = res[0], vend = res[1];
        if (!conf.error && conf.data && conf.data.dados) {
          var d = conf.data.dados;
          if (d.loja) {
            merge(CFG.loja, d.loja);
            // estes campos podem ser apagados de propósito (ex.: logo vazio = usar o nome em texto)
            ['logo', 'logoClaro', 'complemento', 'instagram', 'facebook', 'email', 'historia'].forEach(function (k) {
              if (typeof d.loja[k] === 'string') CFG.loja[k] = d.loja[k];
            });
          }
          if (d.tema) {
            CFG.tema = d.tema; aplicarTema(d.tema);
            try { localStorage.setItem('vs_tema', JSON.stringify(d.tema)); } catch (e) {}
          }
          if (d.mensagens) merge(CFG.mensagens, d.mensagens);
          if (Array.isArray(d.faixasPreco) && d.faixasPreco.length) CFG.faixasPreco = d.faixasPreco;
          if (d.seo) merge(CFG.seo, d.seo);
        }
        if (!vend.error && vend.data && vend.data.length) CFG.vendedores = vend.data;
        return DB;
      });
    }).catch(function (e) {
      console.warn('[Supabase] usando dados locais:', e);
      return DB;
    });
  })();

  window.DB = DB;
})();
