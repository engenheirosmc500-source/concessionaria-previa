/* =========================================================================
   estoque.js — listagem com filtros/ordenação/paginação, página de detalhe
   do veículo e página de favoritos.
   ========================================================================= */
(function () {
  'use strict';
  var A = window.App, CFG = window.SITE_CONFIG;
  var qs = A.qs, qsa = A.qsa, esc = A.esc, icon = A.icon;
  var PAGE = document.body.getAttribute('data-page');
  var POR_PAGINA = 12;

  var BASE_CAMBIO = ['Automático', 'Manual', 'CVT', 'Automatizado'];
  var BASE_COMB = ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico', 'Etanol', 'GNV'];
  var BASE_CARR = ['Hatch', 'Sedã', 'SUV', 'Picape', 'Utilitário', 'Caminhão', 'Van', 'Cupê', 'Conversível', 'Moto'];

  function uniq(arr) { var s = {}, o = []; arr.forEach(function (x) { if (x && !s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function sortBR(a, b) { return String(a).localeCompare(String(b), 'pt-BR'); }
  function opts(list, sel, todos) {
    return '<option value="">' + (todos || 'Todos') + '</option>' + list.map(function (v) { return '<option' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('');
  }

  /* =====================================================================
     ESTOQUE
     ===================================================================== */
  function initEstoque() {
    var todos = [], estado = {};
    var grid = qs('#grid'), contador = qs('#contador'), pag = qs('#paginacao');
    var F = {
      q: qs('#f-q'), marca: qs('#f-marca'), modelo: qs('#f-modelo'), cambio: qs('#f-cambio'),
      combustivel: qs('#f-combustivel'), carroceria: qs('#f-carroceria'),
      precoDe: qs('#f-preco-de'), precoAte: qs('#f-preco-ate'), anoDe: qs('#f-ano-de'), anoAte: qs('#f-ano-ate')
    };
    var ordem = qs('#ordem');
    var KEYS = ['q', 'marca', 'modelo', 'cambio', 'combustivel', 'carroceria', 'precoDe', 'precoAte', 'anoDe', 'anoAte', 'ordem', 'pagina'];

    function lerURL() {
      var p = new URLSearchParams(location.search);
      estado = {};
      KEYS.forEach(function (k) { if (p.get(k)) estado[k] = p.get(k); });
      estado.pagina = Math.max(1, parseInt(estado.pagina || '1', 10) || 1);
      estado.ordem = estado.ordem || 'recentes';
    }
    function gravarURL(push) {
      var p = new URLSearchParams();
      KEYS.forEach(function (k) {
        var v = estado[k];
        if (v === undefined || v === null || v === '') return;
        if (k === 'pagina' && Number(v) === 1) return;
        if (k === 'ordem' && v === 'recentes') return;
        p.set(k, v);
      });
      var u = location.pathname + (p.toString() ? '?' + p.toString() : '');
      if (push) history.pushState(null, '', u); else history.replaceState(null, '', u);
    }

    function preencherSelects() {
      var marcas = uniq(todos.map(function (v) { return v.marca; })).sort(sortBR);
      F.marca.innerHTML = opts(marcas, estado.marca);
      preencherModelos();
      F.cambio.innerHTML = opts(uniq(BASE_CAMBIO.concat(todos.map(function (v) { return v.cambio; }))), estado.cambio);
      F.combustivel.innerHTML = opts(uniq(BASE_COMB.concat(todos.map(function (v) { return v.combustivel; }))), estado.combustivel);
      F.carroceria.innerHTML = opts(uniq(BASE_CARR.concat(todos.map(function (v) { return v.carroceria; }))), estado.carroceria);
    }
    function preencherModelos() {
      var m = F.marca.value;
      var modelos = uniq(todos.filter(function (v) { return !m || v.marca === m; }).map(function (v) { return v.modelo; })).sort(sortBR);
      F.modelo.innerHTML = opts(modelos, estado.modelo);
      F.modelo.disabled = !modelos.length;
    }
    function estadoParaForm() {
      F.q.value = estado.q || '';
      F.precoDe.value = estado.precoDe ? A.money(estado.precoDe) : '';
      F.precoAte.value = estado.precoAte ? A.money(estado.precoAte) : '';
      F.anoDe.value = estado.anoDe || ''; F.anoAte.value = estado.anoAte || '';
      ordem.value = estado.ordem;
      preencherSelects();
    }
    function formParaEstado() {
      estado.q = F.q.value.trim();
      ['marca', 'modelo', 'cambio', 'combustivel', 'carroceria'].forEach(function (k) { estado[k] = F[k].value; });
      var pd = A.parseMoney(F.precoDe.value), pa = A.parseMoney(F.precoAte.value);
      estado.precoDe = pd ? Math.round(pd) : ''; estado.precoAte = pa ? Math.round(pa) : '';
      estado.anoDe = A.onlyDigits(F.anoDe.value).slice(0, 4); estado.anoAte = A.onlyDigits(F.anoAte.value).slice(0, 4);
      delete estado.faixa;
      estado.pagina = 1;
    }

    function filtrar() {
      var q = A.norm(estado.q), termos = q ? q.split(/\s+/) : [];
      var pd = Number(estado.precoDe) || 0, pa = Number(estado.precoAte) || Infinity;
      var ad = Number(estado.anoDe) || 0, aa = Number(estado.anoAte) || Infinity;
      var lista = todos.filter(function (v) {
        if (termos.length) {
          var hay = A.norm([v.marca, v.modelo, v.versao].join(' '));
          for (var i = 0; i < termos.length; i++) if (hay.indexOf(termos[i]) < 0) return false;
        }
        if (estado.marca && v.marca !== estado.marca) return false;
        if (estado.modelo && v.modelo !== estado.modelo) return false;
        if (estado.cambio && v.cambio !== estado.cambio) return false;
        if (estado.combustivel && v.combustivel !== estado.combustivel) return false;
        if (estado.carroceria && v.carroceria !== estado.carroceria) return false;
        if ((pd || pa !== Infinity) && (v.consulte || v.preco < pd || v.preco > pa)) return false;
        if (v.anoModelo < ad || v.anoModelo > aa) return false;
        return true;
      });
      var ord = {
        recentes: function (a, b) { return String(b.dataCadastro || '').localeCompare(String(a.dataCadastro || '')); },
        'menor-preco': function (a, b) { return a.preco - b.preco; },
        'maior-preco': function (a, b) { return b.preco - a.preco; },
        'menor-km': function (a, b) { return a.km - b.km; },
        'ano': function (a, b) { return (b.anoModelo - a.anoModelo) || (b.anoFabricacao - a.anoFabricacao); }
      }[estado.ordem] || null;
      if (ord) lista.sort(ord);
      return lista;
    }

    function render(scroll) {
      var lista = filtrar();
      var total = lista.length, paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
      if (estado.pagina > paginas) estado.pagina = paginas;
      var ini = (estado.pagina - 1) * POR_PAGINA;
      contador.innerHTML = '<strong>' + total + '</strong> ' + (total === 1 ? 'veículo encontrado' : 'veículos encontrados');
      if (!total) {
        grid.style.display = 'block';
        grid.innerHTML = '<div class="empty"><span class="ic">' + icon('search') + '</span><h2>Nenhum veículo encontrado com esses filtros.</h2>' +
          '<p>Tente ampliar a busca ou fale com a nossa equipe.</p><div class="actions"><button type="button" class="btn btn-primary" id="limpar-vazio">Limpar filtros</button>' +
          '<a class="link-arrow" href="' + esc(A.waLink(CFG.loja.whatsapp, 'Olá! Não encontrei no site o carro que procuro. Podem me ajudar?')) + '" target="_blank" rel="noopener">Conte o que procura que a gente encontra pra você →</a></div></div>';
        qs('#limpar-vazio').addEventListener('click', limpar);
        pag.innerHTML = '';
        return;
      }
      grid.style.display = '';
      grid.innerHTML = lista.slice(ini, ini + POR_PAGINA).map(function (v) { return A.cardVeiculo(v); }).join('');
      A.reveal(grid);
      pag.innerHTML = paginas > 1 ?
        (estado.pagina > 1 ? '<button type="button" class="prev" data-p="' + (estado.pagina - 1) + '">← Anterior</button>' : '') +
        '<span>Página ' + estado.pagina + ' de ' + paginas + '</span>' +
        (estado.pagina < paginas ? '<button type="button" data-p="' + (estado.pagina + 1) + '">Próxima →</button>' : '') : '';
      if (scroll) { var top = qs('.stock-main').getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({ top: top, behavior: 'smooth' }); }
    }

    function limpar() {
      estado = { ordem: estado.ordem || 'recentes', pagina: 1 };
      estadoParaForm(); gravarURL(true); render(false);
    }

    // eventos
    qs('#filtros-form').addEventListener('submit', function (e) {
      e.preventDefault(); formParaEstado(); gravarURL(true); render(true); fecharFiltros();
    });
    qs('#limpar').addEventListener('click', limpar);
    F.marca.addEventListener('change', function () { estado.modelo = ''; preencherModelos(); });
    ordem.addEventListener('change', function () { estado.ordem = ordem.value; estado.pagina = 1; gravarURL(true); render(false); });
    pag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return;
      estado.pagina = Number(b.getAttribute('data-p')); gravarURL(true); render(true);
    });
    window.addEventListener('popstate', function () { lerURL(); estadoParaForm(); render(false); });

    // drawer de filtros (mobile)
    var painel = qs('#filtros'), ov = qs('#filtros-overlay');
    function abrirFiltros() { painel.classList.add('is-open'); ov.classList.add('is-open'); document.body.classList.add('no-scroll'); qs('#btn-filtros').setAttribute('aria-expanded', 'true'); }
    function fecharFiltros() { painel.classList.remove('is-open'); ov.classList.remove('is-open'); document.body.classList.remove('no-scroll'); qs('#btn-filtros').setAttribute('aria-expanded', 'false'); }
    qs('#btn-filtros').addEventListener('click', abrirFiltros);
    qs('#fechar-filtros').addEventListener('click', fecharFiltros);
    ov.addEventListener('click', fecharFiltros);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && painel.classList.contains('is-open')) fecharFiltros(); });

    lerURL();
    grid.innerHTML = A.skeletons(8);
    DB.getVeiculos().then(function (l) {
      todos = l;
      A.Fav.clean(l.map(function (v) { return v.id; }));
      estadoParaForm(); render(false);
    }).catch(function () {
      grid.innerHTML = '<div class="empty"><span class="ic">' + icon('alert') + '</span><h2>Não foi possível carregar o estoque.</h2><p>Atualize a página ou fale com a gente pelo WhatsApp.</p></div>';
    });
  }

  /* =====================================================================
     DETALHE DO VEÍCULO
     ===================================================================== */
  function initDetalhe() {
    var root = qs('#detalhe');
    var id = new URLSearchParams(location.search).get('id');
    root.innerHTML = '<div class="detail"><div class="skel" style="aspect-ratio:4/3"></div><div class="skel" style="height:420px"></div></div>';

    DB.getVeiculo(id).then(function (v) {
      if (!v) { naoEncontrado(); return; }
      render(v);
      DB.getVeiculos().then(function (l) { relacionados(v, l); });
    }).catch(naoEncontrado);

    function naoEncontrado() {
      qs('#breadcrumb-atual').textContent = 'Veículo não encontrado';
      root.innerHTML = '<div class="empty"><span class="ic">' + icon('car') + '</span><h2>Este veículo não está mais disponível.</h2>' +
        '<p>Ele pode ter sido vendido. Veja outras opções no nosso estoque.</p><div class="actions"><a class="btn btn-primary" href="estoque.html">Ver estoque <span class="arrow">→</span></a></div></div>';
    }

    function render(v) {
      var nome = A.nomeVeiculo(v);
      document.title = v.marca + ' ' + v.modelo + ' ' + (v.versao || '') + ' ' + v.anoModelo + ' | ' + CFG.loja.nome;
      var md = qs('meta[name=description]'); if (md) md.setAttribute('content', nome + ' — ' + A.kmFmt(v.km) + ', ' + v.cambio + '. ' + A.precoTexto(v) + ' na ' + CFG.loja.nome + '.');
      var ogt = qs('meta[property="og:title"]'); if (ogt) ogt.setAttribute('content', nome);
      var ogi = qs('meta[property="og:image"]'); if (ogi && v.fotos[0]) ogi.setAttribute('content', A.absLink(A.url(v.fotos[0])));
      qs('#breadcrumb-atual').textContent = v.marca + ' ' + v.modelo;

      var fotos = v.fotos.length ? v.fotos : ['assets/img/veiculos/hatch-1.svg'];
      var reservado = v.status === 'reservado';
      var chips = [
        [icon('calendar'), v.anoFabricacao + '/' + v.anoModelo], [icon('gauge'), A.kmFmt(v.km)], [icon('gear'), v.cambio],
        [icon('fuel'), v.combustivel], [icon('palette'), v.cor], [icon('car'), v.carroceria]
      ].filter(function (c) { return c[1]; }).map(function (c) { return '<span class="chip">' + c[0] + esc(c[1]) + '</span>'; }).join('');

      var ficha = [['Marca', v.marca], ['Modelo', v.modelo], ['Versão', v.versao], ['Ano', v.anoFabricacao + '/' + v.anoModelo], ['Quilometragem', A.kmFmt(v.km)],
        ['Câmbio', v.cambio], ['Combustível', v.combustivel], ['Carroceria', v.carroceria], ['Cor', v.cor], ['Portas', v.portas]]
        .filter(function (r) { return r[1] !== undefined && r[1] !== null && r[1] !== ''; })
        .map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');

      root.innerHTML =
        '<div class="detail">' +
        '<div class="gallery"><div class="main" id="gal-main" role="button" tabindex="0" aria-label="Ampliar foto">' +
        (reservado ? '<span class="tag-status" style="position:absolute;top:14px;left:14px;z-index:2;background:var(--dark);color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:6px">Reservado</span>' : '') +
        '<img id="gal-img" src="' + esc(A.url(fotos[0])) + '" alt="' + esc(nome) + ' — foto 1">' +
        (fotos.length > 1 ? '<button type="button" class="gal-nav prev" aria-label="Foto anterior">' + icon('chevron-left') + '</button><button type="button" class="gal-nav next" aria-label="Próxima foto">' + icon('chevron-right') + '</button>' : '') +
        '<span class="gal-count" id="gal-count">1 / ' + fotos.length + '</span></div>' +
        (fotos.length > 1 ? '<div class="thumbs-row" id="gal-thumbs">' + fotos.map(function (f, i) { return '<button type="button" data-i="' + i + '" class="' + (i ? '' : 'is-active') + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(A.url(f)) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<aside class="buy-card">' +
        '<h1>' + esc(v.marca) + ' <span class="model">' + esc(v.modelo) + '</span></h1>' +
        '<p class="version">' + esc(v.versao) + '</p>' +
        '<div class="price-box"><span class="price-label">Valor anunciado</span>' + (v.consulte ? '<span class="price">Consulte</span>' : '<span class="price"><small>R$</small>' + A.money(v.preco) + '</span>') + '</div>' +
        '<div class="chips">' + chips + '</div>' +
        '<button type="button" class="btn btn-primary" id="btn-interesse">' + (reservado ? 'Avise-me se liberar' : 'Tenho interesse') + ' <span class="arrow">→</span></button>' +
        '<a class="btn btn-outline" href="financiamento.html?veiculo=' + encodeURIComponent(v.id) + '">' + icon('percent') + ' Simular financiamento</a>' +
        '<div class="buy-actions"><button type="button" data-fav="' + esc(v.id) + '" aria-pressed="false">' + icon('heart') + '<span data-fav-text>Salvar nos favoritos</span></button>' +
        '<button type="button" id="btn-share">' + icon('share') + 'Compartilhar</button></div>' +
        '</aside></div>' +
        '<div class="detail-blocks">' +
        '<section class="block"><h2>Ficha técnica</h2><dl class="spec-grid">' + ficha + '</dl></section>' +
        (v.opcionais && v.opcionais.length ? '<section class="block"><h2>Opcionais</h2><ul class="opc-list">' + v.opcionais.map(function (o) { return '<li>' + icon('check') + esc(o) + '</li>'; }).join('') + '</ul></section>' : '') +
        (v.descricao ? '<section class="block"><h2>Sobre este veículo</h2><p class="desc">' + esc(v.descricao) + '</p></section>' : '') +
        '</div>' +
        '<section class="related" id="relacionados" hidden><span class="eyebrow">Outras opções</span><h2 class="h2">Você também pode gostar<span class="dot">.</span></h2><div class="grid-cars" id="rel-grid"></div></section>';

      A.syncFavButtons();
      galeria(fotos, nome);

      qs('#btn-interesse').addEventListener('click', function () {
        var msg = reservado
          ? 'Olá! Vi que o ' + nome + ' está reservado. Podem me avisar se ele for liberado? Link: ' + A.absLink(A.linkVeiculo(v))
          : A.msgVeiculo(v);
        if (!DB.demo && DB.client) {
          DB.inserirLead({ tipo: 'interesse', nome: 'Visitante do site (WhatsApp)', telefone: '', veiculo_id: v.id, mensagem: msg, dados: { origem: reservado ? 'avise-me' : 'tenho-interesse', veiculo: nome, preco: A.precoTexto(v) } }).catch(function (e) { console.warn(e); });
        }
        A.abrirWhatsApp(CFG.loja.whatsapp, msg);
      });
      qs('#btn-share').addEventListener('click', function () {
        var data = { title: nome, text: nome + ' — ' + A.precoTexto(v), url: location.href };
        if (navigator.share) { navigator.share(data).catch(function () {}); return; }
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { A.toast('Link copiado.'); }, function () { A.toast(location.href, 4000); });
        else A.toast(location.href, 4000);
      });
    }

    function galeria(fotos, nome) {
      var i = 0, img = qs('#gal-img'), count = qs('#gal-count'), thumbs = qs('#gal-thumbs');
      var lb = qs('#lightbox'), lbImg = qs('#lb-img'), lbCount = qs('#lb-count');
      function go(n) {
        i = (n + fotos.length) % fotos.length;
        img.src = A.url(fotos[i]); img.alt = nome + ' — foto ' + (i + 1);
        count.textContent = (i + 1) + ' / ' + fotos.length;
        if (thumbs) qsa('button', thumbs).forEach(function (b, k) { b.classList.toggle('is-active', k === i); });
        if (lb.classList.contains('is-open')) { lbImg.src = A.url(fotos[i]); lbImg.alt = img.alt; lbCount.textContent = count.textContent; }
      }
      qsa('#gal-main .gal-nav').forEach(function (b) {
        b.addEventListener('click', function (e) { e.stopPropagation(); go(i + (b.classList.contains('next') ? 1 : -1)); });
      });
      if (thumbs) thumbs.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) go(Number(b.getAttribute('data-i'))); });
      function abrir() { lb.classList.add('is-open'); document.body.classList.add('no-scroll'); go(i); qs('#lb-close').focus(); }
      function fechar() { lb.classList.remove('is-open'); document.body.classList.remove('no-scroll'); qs('#gal-main').focus(); }
      qs('#gal-main').addEventListener('click', abrir);
      qs('#gal-main').addEventListener('keydown', function (e) { if (e.key === 'Enter') abrir(); });
      qs('#lb-close').addEventListener('click', fechar);
      qs('#lb-prev').addEventListener('click', function () { go(i - 1); });
      qs('#lb-next').addEventListener('click', function () { go(i + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') fechar();
        if (e.key === 'ArrowRight') go(i + 1);
        if (e.key === 'ArrowLeft') go(i - 1);
      });
      // swipe
      [qs('#gal-main'), lb].forEach(function (el) {
        var x0 = null;
        el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend', function (e) {
          if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
          if (Math.abs(dx) > 40) { e.preventDefault(); go(i + (dx < 0 ? 1 : -1)); }
        });
      });
      if (fotos.length < 2) { qs('#lb-prev').hidden = true; qs('#lb-next').hidden = true; }
    }

    function relacionados(v, l) {
      var outros = l.filter(function (o) { return o.id !== v.id; });
      var score = function (o) {
        var s = 0;
        if (o.carroceria === v.carroceria) s += 3;
        if (!v.consulte && !o.consulte && Math.abs(o.preco - v.preco) <= v.preco * 0.3) s += 2;
        if (o.marca === v.marca) s += 1;
        return s;
      };
      var rel = outros.sort(function (a, b) { return score(b) - score(a); }).slice(0, 4);
      if (!rel.length) return;
      qs('#rel-grid').innerHTML = rel.map(function (o) { return A.cardVeiculo(o); }).join('');
      qs('#relacionados').hidden = false;
      A.reveal(qs('#relacionados'));
    }
  }

  /* =====================================================================
     FAVORITOS
     ===================================================================== */
  function initFavoritos() {
    var grid = qs('#fav-grid'), vazio = qs('#fav-vazio'), c1 = qs('#fav-c1'), c2 = qs('#fav-c2');
    function contadores(n) {
      c1.textContent = n + (n === 1 ? ' veículo encontrado.' : ' veículos encontrados.');
      c2.innerHTML = '<strong>' + n + '</strong> ' + (n === 1 ? 'veículo nos seus favoritos' : 'veículos nos seus favoritos');
      grid.hidden = n === 0; vazio.hidden = n !== 0;
    }
    grid.innerHTML = A.skeletons(4);
    DB.getVeiculos().then(function (l) {
      var ids = A.Fav.clean(l.map(function (v) { return v.id; }));
      var map = {}; l.forEach(function (v) { map[String(v.id)] = v; });
      var favs = ids.map(function (id) { return map[id]; }).filter(Boolean);
      grid.innerHTML = favs.map(function (v) { return A.cardVeiculo(v); }).join('');
      A.syncFavButtons();
      A.reveal(grid);
      contadores(favs.length);
    }).catch(function () { grid.innerHTML = ''; contadores(A.Fav.list().length); });

    document.addEventListener('favorito:toggle', function (e) {
      if (e.detail.added) return;
      var card = e.detail.button.closest('.car-card');
      if (!card) return;
      card.classList.add('removing');
      setTimeout(function () {
        card.remove();
        contadores(qsa('.car-card', grid).length);
      }, 200);
    });
  }

  function boot() {
    if (PAGE === 'estoque') initEstoque();
    if (PAGE === 'veiculo') initDetalhe();
    if (PAGE === 'favoritos') initFavoritos();
  }
  // main.js dispara "app:ready" depois de montar o layout
  if (A.isReady) boot(); else document.addEventListener('app:ready', boot);
})();
