/* =========================================================================
   main.js — utilitários, componentes globais (top bar, header, CTA, rodapé,
   WhatsApp, toast), favoritos, máscaras, formulários e páginas simples.
   Também é carregado no painel (body[data-area="admin"]) só pelos utilitários.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Ícones (Lucide, stroke 1.75)
     --------------------------------------------------------------------- */
  var I = {
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    gear: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    fuel: '<line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  };
  var WA_PATH = '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>';

  function icon(name, cls) {
    if (name === 'whatsapp') return '<svg class="icon icon-fill ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + WA_PATH + '</svg>';
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (I[name] || '') + '</svg>';
  }

  /* ---------------------------------------------------------------------
     Utilitários
     --------------------------------------------------------------------- */
  var CFG = window.SITE_CONFIG || {};
  var BASE = document.body.getAttribute('data-base') || '';
  var nfMoney = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nfInt = new Intl.NumberFormat('pt-BR');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(p) {
    if (!p) return '';
    if (/^(https?:|data:|blob:|\/)/.test(p)) return p;
    return BASE + p;
  }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  function money(n) { return nfMoney.format(Number(n) || 0); }
  function moneyBRL(n) { return 'R$ ' + money(n); }
  function kmFmt(n) { n = Number(n) || 0; return n === 0 ? '0 km' : nfInt.format(n) + ' km'; }
  function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }
  function parseMoney(s) {
    if (typeof s === 'number') return s;
    var d = onlyDigits(s); if (!d) return null;
    return Number(d) / 100;
  }
  function parseIntBR(s) { var d = onlyDigits(s); return d ? Number(d) : null; }
  function fill(tpl, vars) {
    return String(tpl || '').replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function relTime(date) {
    var d = new Date(date), s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'agora mesmo';
    var m = Math.floor(s / 60); if (m < 60) return 'há ' + m + ' min';
    var h = Math.floor(m / 60); if (h < 24) return 'há ' + h + (h === 1 ? ' hora' : ' horas');
    var dd = Math.floor(h / 24); if (dd < 30) return 'há ' + dd + (dd === 1 ? ' dia' : ' dias');
    return d.toLocaleDateString('pt-BR');
  }
  function store(key, val) {
    try {
      if (val === undefined) { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function nomeVeiculo(v) { return [v.marca, v.modelo, v.versao, v.anoModelo].filter(Boolean).join(' '); }
  function precoTexto(v) { return v.consulte ? 'Consulte' : moneyBRL(v.preco); }
  function linkVeiculo(v) { return 'veiculo.html?id=' + encodeURIComponent(v.id); }
  function absLink(rel) { try { return new URL(rel, location.href).href; } catch (e) { return rel; } }

  /* ---------------------------------------------------------------------
     WhatsApp
     --------------------------------------------------------------------- */
  function waLink(numero, mensagem) {
    var n = onlyDigits(numero || CFG.loja.whatsapp);
    return 'https://wa.me/' + n + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
  }
  function abrirWhatsApp(numero, mensagem) {
    var w = window.open(waLink(numero, mensagem), '_blank', 'noopener');
    if (!w) location.href = waLink(numero, mensagem);
  }
  function msgGeral() { return fill(CFG.mensagens.geral, { nome_loja: CFG.loja.nome }); }
  function msgVendedor(v) { return fill(CFG.mensagens.vendedor, { nome_loja: CFG.loja.nome, vendedor: v.nome }); }
  function msgVeiculo(v) {
    return fill(CFG.mensagens.veiculo, {
      nome_loja: CFG.loja.nome, veiculo: nomeVeiculo(v), preco: precoTexto(v),
      link: absLink(linkVeiculo(v))
    });
  }

  /* ---------------------------------------------------------------------
     Toast
     --------------------------------------------------------------------- */
  var toastEl, toastTimer;
  function toast(msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastTimer);
    toastEl.classList.remove('is-show'); void toastEl.offsetWidth; toastEl.classList.add('is-show');
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, ms || 2500);
  }

  /* ---------------------------------------------------------------------
     Máscaras
     --------------------------------------------------------------------- */
  function maskPhone(v) {
    var d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function maskMoney(v) {
    var d = onlyDigits(v).replace(/^0+/, '').slice(0, 12);
    if (!d) return '';
    while (d.length < 3) d = '0' + d;
    return money(Number(d) / 100);
  }
  function maskInt(v) { var d = onlyDigits(v).replace(/^0+(?=\d)/, '').slice(0, 7); return d ? nfInt.format(Number(d)) : ''; }
  function maskPlate(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); }
  var MASKS = { phone: maskPhone, money: maskMoney, int: maskInt, km: maskInt, plate: maskPlate };
  function applyMasks(ctx) {
    qsa('[data-mask]', ctx).forEach(function (el) {
      if (el._masked) return; el._masked = true;
      var fn = MASKS[el.getAttribute('data-mask')]; if (!fn) return;
      el.addEventListener('input', function () { el.value = fn(el.value); });
      if (el.value) el.value = fn(el.value);
    });
  }

  /* ---------------------------------------------------------------------
     Favoritos
     --------------------------------------------------------------------- */
  var FAV_KEY = 'vs_favoritos';
  var Fav = {
    list: function () { var l = store(FAV_KEY); return Array.isArray(l) ? l.map(String) : []; },
    save: function (l) { store(FAV_KEY, l); Fav.updateBadge(); document.dispatchEvent(new CustomEvent('favoritos:change', { detail: l })); },
    has: function (id) { return Fav.list().indexOf(String(id)) > -1; },
    toggle: function (id) {
      id = String(id);
      var l = Fav.list(), i = l.indexOf(id), added;
      if (i > -1) { l.splice(i, 1); added = false; } else { l.push(id); added = true; }
      Fav.save(l);
      toast(added ? 'Veículo adicionado aos favoritos.' : 'Veículo removido dos favoritos.');
      return added;
    },
    // remove IDs que não estão mais no estoque (vendidos/ocultos)
    clean: function (validIds) {
      var set = {}; validIds.forEach(function (i) { set[String(i)] = 1; });
      var l = Fav.list(), n = l.filter(function (i) { return set[i]; });
      if (n.length !== l.length) Fav.save(n);
      return n;
    },
    updateBadge: function () {
      var c = Fav.list().length;
      qsa('[data-fav-count]').forEach(function (b) { b.textContent = c; });
      qsa('[data-fav-label]').forEach(function (b) { b.setAttribute('aria-label', 'Meus favoritos (' + c + ')'); });
    }
  };

  function syncFavButtons() {
    qsa('[data-fav]').forEach(function (b) {
      var on = Fav.has(b.getAttribute('data-fav'));
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var lbl = b.querySelector('[data-fav-text]');
      if (lbl) lbl.textContent = on ? 'Salvo nos favoritos' : 'Salvar nos favoritos';
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var id = b.getAttribute('data-fav');
    var added = Fav.toggle(id);
    syncFavButtons();
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    document.dispatchEvent(new CustomEvent('favorito:toggle', { detail: { id: id, added: added, button: b } }));
  });

  /* ---------------------------------------------------------------------
     Card de veículo
     --------------------------------------------------------------------- */
  function cardVeiculo(v, opts) {
    opts = opts || {};
    var foto = (v.fotos && v.fotos[0]) ? url(v.fotos[0]) : url('assets/img/veiculos/hatch-1.svg');
    var fav = Fav.has(v.id);
    var nome = esc(v.marca) + ' ' + esc(v.modelo);
    var ano = (v.anoFabricacao || '') + (v.anoModelo ? '/' + v.anoModelo : '');
    var href = opts.href || url(linkVeiculo(v));
    return '<article class="car-card' + (opts.reveal === false ? '' : ' reveal') + '" data-id="' + esc(v.id) + '">' +
      '<div class="ph"><img src="' + esc(foto) + '" alt="' + esc(nomeVeiculo(v)) + '" loading="lazy" width="400" height="300">' +
      (v.status === 'reservado' ? '<span class="tag-status">Reservado</span>' : '') +
      '<button type="button" class="fav-btn' + (fav ? ' is-active' : '') + '" data-fav="' + esc(v.id) + '" aria-pressed="' + fav + '" aria-label="Favoritar ' + nome + '">' + icon('heart') + '</button></div>' +
      '<div class="body">' +
      '<h3><a class="stretched" href="' + esc(href) + '">' + esc(v.marca) + ' <span class="model">' + esc(v.modelo) + '</span></a></h3>' +
      '<p class="version">' + esc(v.versao) + '</p>' +
      '<div class="specs"><span>' + icon('calendar') + ano + '</span><span>' + icon('gauge') + kmFmt(v.km) + '</span><span>' + icon('gear') + esc(v.cambio || '') + '</span></div>' +
      '<div class="price-row"><div><span class="price-label">Valor anunciado</span>' +
      (v.consulte ? '<span class="price">Consulte</span>' : '<span class="price"><small>R$</small>' + money(v.preco) + '</span>') +
      '</div><span class="go" aria-hidden="true">' + icon('arrow-right') + '</span></div>' +
      '</div></article>';
  }
  /* Logo da loja: imagem, ou o nome em texto quando não há imagem */
  function marca(escuro, h) {
    var L = CFG.loja, src = escuro ? (L.logoClaro || L.logo) : L.logo;
    if (src) return '<img src="' + esc(url(src)) + '" alt="' + esc(L.nome) + '"' + (h ? ' style="height:' + h + 'px"' : '') + '>';
    return '<span class="brand-text' + (escuro ? ' on-dark' : '') + '">' + esc(L.nome) + (L.complemento ? '<small>' + esc(L.complemento) + '</small>' : '') + '</span>';
  }
  function skeletons(n) { var h = ''; for (var i = 0; i < n; i++) h += '<div class="skel skel-card"></div>'; return h; }

  /* ---------------------------------------------------------------------
     Animação de entrada
     --------------------------------------------------------------------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -40px 0px', threshold: .05 }) : null;
  function reveal(ctx) {
    qsa('.reveal:not(.is-in)', ctx).forEach(function (el, i) {
      if (!io) { el.classList.add('is-in'); return; }
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Exposição global
     --------------------------------------------------------------------- */
  var App = window.App = {
    icon: icon, esc: esc, url: url, norm: norm, money: money, moneyBRL: moneyBRL, kmFmt: kmFmt, nfInt: nfInt,
    onlyDigits: onlyDigits, parseMoney: parseMoney, parseIntBR: parseIntBR, fill: fill, relTime: relTime,
    store: store, qs: qs, qsa: qsa, toast: toast, waLink: waLink, abrirWhatsApp: abrirWhatsApp,
    msgGeral: msgGeral, msgVendedor: msgVendedor, msgVeiculo: msgVeiculo, nomeVeiculo: nomeVeiculo,
    precoTexto: precoTexto, linkVeiculo: linkVeiculo, absLink: absLink,
    maskPhone: maskPhone, maskMoney: maskMoney, maskInt: maskInt, applyMasks: applyMasks,
    marca: marca, Fav: Fav, syncFavButtons: syncFavButtons, cardVeiculo: cardVeiculo, skeletons: skeletons, reveal: reveal,
    config: function () { return CFG; }
  };

  // No painel, apenas os utilitários acima são usados.
  if (document.body.getAttribute('data-area') === 'admin') return;

  /* =====================================================================
     SITE PÚBLICO — componentes globais
     ===================================================================== */
  var PAGE = document.body.getAttribute('data-page') || '';
  var MENU = [
    { id: 'estoque', label: 'Estoque', href: 'estoque.html' },
    { id: 'venda', label: 'Venda seu veículo', href: 'venda-seu-veiculo.html' },
    { id: 'financiamento', label: 'Financiamento', href: 'financiamento.html' },
    { id: 'loja', label: 'A loja', href: 'a-loja.html' },
    { id: 'vendedores' },
    { id: 'contato', label: 'Contato', href: 'contato.html' }
  ];
  function activeId() { return PAGE === 'veiculo' ? 'estoque' : PAGE; }

  function renderTopbar() {
    var L = CFG.loja;
    return '<div class="topbar"><div class="container">' +
      '<span class="hide-sm">' + icon('clock') + esc(L.horario) + '</span>' +
      '<div class="right"><a href="tel:' + onlyDigits(L.telefone) + '">' + icon('phone') + esc(L.telefone) + '</a>' +
      '<a class="talk" href="' + esc(waLink(L.whatsapp, msgGeral())) + '" target="_blank" rel="noopener">Fale com a loja →</a></div>' +
      '</div></div>';
  }

  function sellersMenu() {
    var vs = CFG.vendedores || [];
    if (!vs.length) return '<p style="padding:10px 12px;color:var(--muted);font-size:14px">Fale com a loja pelo WhatsApp.</p>';
    return vs.map(function (v) {
      return '<a role="menuitem" href="' + esc(waLink(v.whatsapp, msgVendedor(v))) + '" target="_blank" rel="noopener"><span><strong>' + esc(v.nome) + '</strong><small>' + esc(v.cargo || 'Vendedor') + '</small></span><span class="wa">' + icon('whatsapp') + '</span></a>';
    }).join('');
  }

  function renderHeader() {
    var L = CFG.loja, act = activeId();
    var nav = MENU.map(function (m) {
      if (m.id === 'vendedores') {
        return '<div class="dd"><button type="button" id="dd-vend-btn" aria-haspopup="true" aria-expanded="false" aria-controls="dd-vend">Vendedores ' + icon('chevron-down') + '</button>' +
          '<div class="dd-menu" id="dd-vend" role="menu" aria-labelledby="dd-vend-btn">' + sellersMenu() + '</div></div>';
      }
      return '<a href="' + m.href + '"' + (m.id === act ? ' class="is-active" aria-current="page"' : '') + '>' + m.label + '</a>';
    }).join('');
    var favCount = Fav.list().length;
    return '<header class="site-header" id="site-header"><div class="container">' +
      '<a class="brand" href="index.html" aria-label="' + esc(L.nome) + ' — página inicial">' + marca(false) + '</a>' +
      '<div class="header-right">' +
      '<nav class="nav-pill" aria-label="Menu principal">' + nav + '</nav>' +
      '<a class="icon-btn" href="favoritos.html" data-fav-label aria-label="Meus favoritos (' + favCount + ')" data-tip="Meus favoritos">' + icon('heart') + '<span class="badge" data-fav-count>' + favCount + '</span></a>' +
      '<a class="icon-btn" id="shield-btn" href="admin/login.html" aria-label="Área do lojista" data-tip="Área do lojista">' + icon('shield-check') + '</a>' +
      '<button type="button" class="icon-btn burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer">' + icon('menu') + '</button>' +
      '</div></div></header>';
  }

  function renderDrawer() {
    var L = CFG.loja, act = activeId();
    var links = MENU.filter(function (m) { return m.id !== 'vendedores'; }).map(function (m) {
      return '<a href="' + m.href + '"' + (m.id === act ? ' class="is-active" aria-current="page"' : '') + '>' + m.label + '</a>';
    }).join('');
    var vs = (CFG.vendedores || []).map(function (v) {
      return '<a href="' + esc(waLink(v.whatsapp, msgVendedor(v))) + '" target="_blank" rel="noopener"><span><strong>' + esc(v.nome) + '</strong><small>' + esc(v.cargo || 'Vendedor') + '</small></span><span style="color:var(--whatsapp);font-size:20px">' + icon('whatsapp') + '</span></a>';
    }).join('');
    return '<div class="drawer-overlay" id="drawer-overlay"></div>' +
      '<aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">' +
      '<div class="drawer-head">' + marca(false) + '<button type="button" class="icon-btn" id="drawer-close" aria-label="Fechar menu">' + icon('x') + '</button></div>' +
      '<nav aria-label="Menu mobile"><a href="index.html"' + (act === 'home' ? ' class="is-active"' : '') + '>Início</a>' + links + '<a href="favoritos.html"' + (act === 'favoritos' ? ' class="is-active"' : '') + '>Meus favoritos</a></nav>' +
      (vs ? '<div class="drawer-sellers"><h3>Vendedores</h3>' + vs + '</div>' : '') +
      '<div class="drawer-foot"><p>' + icon('clock') + ' ' + esc(L.horario) + '</p><p style="margin-top:8px">' + icon('phone') + ' <a href="tel:' + onlyDigits(L.telefone) + '">' + esc(L.telefone) + '</a></p></div>' +
      '</aside>';
  }

  function renderCTA() {
    return '<section class="cta-band" aria-label="Fale com a gente"><div class="container">' +
      '<div><span class="eyebrow">A próxima escolha pode ser a sua</span><h2>Vamos encontrar seu próximo carro?</h2></div>' +
      '<a class="btn btn-white is-primary" href="' + esc(waLink(CFG.loja.whatsapp, msgGeral())) + '" target="_blank" rel="noopener">Converse com a gente <span class="arrow">→</span></a>' +
      '</div></section>';
  }

  function renderFooter() {
    var L = CFG.loja;
    var vs = (CFG.vendedores || []).map(function (v) {
      return '<a class="seller" href="' + esc(waLink(v.whatsapp, msgVendedor(v))) + '" target="_blank" rel="noopener"><strong>' + esc(v.nome) + '</strong><small>' + esc(v.cargo || 'Vendedor') + '</small></a>';
    }).join('');
    var socials = '';
    if (L.instagram) socials += '<a href="' + esc(L.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + icon('instagram') + '</a>';
    if (L.facebook) socials += '<a href="' + esc(L.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook">' + icon('facebook') + '</a>';
    return '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div><span class="fname">' + esc(L.nome) + '</span><p>' + esc(L.rodapeTexto) + '</p>' + (socials ? '<div class="socials">' + socials + '</div>' : '') + '</div>' +
      '<div><h3>Explore</h3><ul><li><a href="estoque.html">Estoque</a></li><li><a href="venda-seu-veiculo.html">Venda seu veículo</a></li><li><a href="financiamento.html">Financiamento</a></li><li><a href="a-loja.html">A loja</a></li><li><a href="contato.html">Contato</a></li></ul></div>' +
      '<div><h3>Encontre a loja</h3><p class="addr">' + esc(L.endereco) + (L.cep ? '<br>CEP ' + esc(L.cep) : '') + '</p><p style="margin-bottom:12px">' + esc(L.horario) + '</p><a class="gold-link" href="' + esc(L.mapsUrl) + '" target="_blank" rel="noopener">Como chegar ↗</a></div>' +
      '<div><h3>Vamos conversar</h3><p style="margin-bottom:14px"><a href="tel:' + onlyDigits(L.telefone) + '">' + icon('phone') + ' ' + esc(L.telefone) + '</a></p>' + vs +
      '<p style="margin-top:14px"><a class="gold-link" href="contato.html">Enviar uma mensagem →</a></p></div>' +
      '</div>' +
      '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(L.nome) + '. Todos os direitos reservados.</span><a href="privacidade.html">Privacidade</a></div>' +
      '</div></footer>';
  }

  function renderWhats() {
    return '<a class="wa-float" href="' + esc(waLink(CFG.loja.whatsapp, msgGeral())) + '" target="_blank" rel="noopener" aria-label="Fale com a loja pelo WhatsApp">' + icon('whatsapp') + '<span>Fale com a loja</span></a>';
  }

  function mountLayout() {
    var main = qs('main');
    var top = document.createElement('div');
    top.innerHTML = '<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>' + renderTopbar() + renderHeader();
    while (top.firstChild) document.body.insertBefore(top.firstChild, main);
    if (main && !main.id) main.id = 'conteudo';
    var bottom = document.createElement('div');
    bottom.innerHTML = renderCTA() + renderFooter() + renderWhats() + renderDrawer();
    while (bottom.firstChild) document.body.appendChild(bottom.firstChild);
    bindHeader();
  }

  function bindHeader() {
    var header = qs('#site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Dropdown vendedores
    var btn = qs('#dd-vend-btn'), menu = qs('#dd-vend');
    function setDD(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
      if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    }
    if (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); setDD(btn.getAttribute('aria-expanded') !== 'true'); });
      btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); setDD(true); } });
      menu.addEventListener('keydown', function (e) {
        var items = qsa('a', menu), i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
        if (e.key === 'Tab' && ((i === items.length - 1 && !e.shiftKey) || (i === 0 && e.shiftKey))) setDD(false);
      });
      document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) { btn.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); } });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setDD(false); btn.focus(); } });
    }

    // Drawer mobile
    var burger = qs('#burger'), drawer = qs('#drawer'), ov = qs('#drawer-overlay'), close = qs('#drawer-close');
    function setDrawer(open) {
      drawer.classList.toggle('is-open', open); ov.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
      if (open) close.focus(); else burger.focus();
    }
    burger.addEventListener('click', function () { setDrawer(true); });
    close.addEventListener('click', function () { setDrawer(false); });
    ov.addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false); });

    // Escudo: se já houver sessão, vai direto ao painel
    if (window.DB && DB.client) {
      DB.client.auth.getSession().then(function (r) { if (r.data && r.data.session) qs('#shield-btn').setAttribute('href', 'admin/'); }).catch(function () {});
    }
  }

  /* Preenche elementos com data-loja="campo" */
  function bindLojaData() {
    var L = CFG.loja;
    qsa('[data-loja]').forEach(function (el) {
      var k = el.getAttribute('data-loja');
      if (k === 'nome-upper') el.textContent = String(L.nome).toUpperCase();
      else if (k === 'endereco-completo') el.textContent = L.endereco + (L.cep ? ', CEP ' + L.cep : '');
      else if (L[k] != null) el.textContent = L[k];
    });
    qsa('[data-wa]').forEach(function (el) { el.setAttribute('href', waLink(CFG.loja.whatsapp, msgGeral())); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); });
  }

  /* =====================================================================
     HOME
     ===================================================================== */
  function initHome() {
    var L = CFG.loja;
    var hero = qs('.hero');
    if (hero) {
      hero.style.backgroundImage = 'url("' + url(L.heroImg) + '")';
      if (!L.heroIlustrativa) { var t = qs('.hero .tag-ilustrativa'); if (t) t.remove(); }
    }
    var img = qs('#about-img'); if (img) img.src = url(L.lojaImg);

    // faixas de preço
    var sel = qs('#busca-faixa');
    if (sel) {
      sel.innerHTML = '<option value="">Todas as faixas</option>' + (CFG.faixasPreco || []).map(function (f, i) { return '<option value="' + i + '">' + esc(f.rotulo) + '</option>'; }).join('');
      qs('#busca-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var p = new URLSearchParams();
        var q = qs('#busca-q').value.trim(); if (q) p.set('q', q);
        if (sel.value !== '') {
          var f = CFG.faixasPreco[Number(sel.value)];
          p.set('faixa', sel.value);
          if (f.min != null) p.set('precoDe', f.min);
          if (f.max != null) p.set('precoAte', f.max);
        }
        location.href = 'estoque.html' + (p.toString() ? '?' + p.toString() : '');
      });
    }

    var grid = qs('#ultimas');
    if (grid) {
      grid.innerHTML = skeletons(8);
      DB.getVeiculos().then(function (l) {
        Fav.clean(l.map(function (v) { return v.id; }));
        var ord = l.slice().sort(function (a, b) {
          if (!!b.destaque !== !!a.destaque) return b.destaque ? 1 : -1;
          return String(b.dataCadastro || '').localeCompare(String(a.dataCadastro || ''));
        }).slice(0, 8);
        grid.innerHTML = ord.length ? ord.map(function (v) { return cardVeiculo(v); }).join('') : '<p class="muted">Em breve novos veículos por aqui.</p>';
        reveal(grid);
      }).catch(function () { grid.innerHTML = '<p class="muted">Não foi possível carregar o estoque agora. <a class="link-arrow" href="estoque.html">Tente o estoque completo →</a></p>'; });
    }

    // JSON-LD AutoDealer
    var ld = {
      '@context': 'https://schema.org', '@type': 'AutoDealer', name: L.nome, description: CFG.seo.descricao,
      url: location.origin + location.pathname.replace(/index\.html$/, ''), logo: L.logo ? absLink(url(L.logo)) : undefined, image: absLink(url(CFG.seo.imagem)),
      telephone: L.telefone, email: L.email || undefined,
      address: { '@type': 'PostalAddress', streetAddress: L.endereco, postalCode: L.cep, addressCountry: 'BR' },
      openingHours: L.horario, sameAs: [L.instagram, L.facebook].filter(Boolean)
    };
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* =====================================================================
     A LOJA
     ===================================================================== */
  function initLoja() {
    var L = CFG.loja;
    var img = qs('#loja-img'); if (img) img.src = url(L.paginaLojaImg || L.lojaImg);
    var t = qs('#loja-historia');
    if (t && L.historia) { t.textContent = L.historia; t.style.whiteSpace = 'pre-line'; }
  }

  /* =====================================================================
     FORMULÁRIOS (venda, financiamento, contato)
     ===================================================================== */
  var FOTO_MAX = 8, FOTO_MB = 8, FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

  function fieldOf(el) { return el.closest('.field') || el.closest('.check-field'); }
  function setError(el, msg) {
    var f = fieldOf(el); if (!f) return;
    var err = f.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; err.setAttribute('role', 'alert'); f.appendChild(err); }
    err.textContent = msg || '';
    f.classList.toggle('has-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err.id === '') err.id = 'err-' + (el.id || el.name);
    el.setAttribute('aria-describedby', err.id);
  }
  function validateField(el) {
    var v = (el.type === 'checkbox') ? el.checked : String(el.value || '').trim();
    var req = el.hasAttribute('required');
    if (el.type === 'checkbox') { if (req && !v) return 'Você precisa marcar esta opção para continuar.'; return ''; }
    if (req && !v) return 'Preencha este campo.';
    if (v && el.getAttribute('data-mask') === 'phone') { var d = onlyDigits(v); if (d.length < 10 || d.length > 11) return 'Informe um telefone válido com DDD.'; }
    if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Informe um e-mail válido.';
    if (el.hasAttribute('minlength') && v && v.length < Number(el.getAttribute('minlength'))) return 'Escreva um pouco mais (mínimo de ' + el.getAttribute('minlength') + ' caracteres).';
    return '';
  }

  function labelOf(form, el) {
    var l = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
    return (el.getAttribute('data-label') || (l ? l.textContent : el.name)).replace(/\s*\*\s*$/, '').trim();
  }

  function initForm(form) {
    var tipo = form.getAttribute('data-form');
    var files = [];
    applyMasks(form);

    var inputs = qsa('input, select, textarea', form).filter(function (el) { return el.name && el.type !== 'file'; });
    inputs.forEach(function (el) {
      var ev = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'blur';
      el.addEventListener(ev, function () { setError(el, validateField(el)); });
      el.addEventListener('input', function () { if (fieldOf(el) && fieldOf(el).classList.contains('has-error')) setError(el, validateField(el)); });
    });

    // Dropzone de fotos
    var dz = qs('.dropzone', form), fileInput = qs('input[type=file]', form), thumbs = qs('.thumbs', form), count = qs('.files-count', form);
    function renderFiles() {
      if (!thumbs) return;
      thumbs.innerHTML = files.map(function (f, i) {
        return '<div class="t"><img src="' + f._url + '" alt="Foto ' + (i + 1) + '"><button type="button" data-rm="' + i + '" aria-label="Remover foto ' + (i + 1) + '">' + icon('x') + '</button></div>';
      }).join('');
      count.textContent = files.length === 0 ? 'Nenhuma foto selecionada.' : files.length === 1 ? '1 foto selecionada' : files.length + ' fotos selecionadas';
    }
    function addFiles(list) {
      var erros = [];
      Array.prototype.forEach.call(list, function (f) {
        if (files.length >= FOTO_MAX) { erros.push('Limite de ' + FOTO_MAX + ' fotos.'); return; }
        if (FOTO_TIPOS.indexOf(f.type) < 0) { erros.push('"' + f.name + '" não é JPEG, PNG ou WebP.'); return; }
        if (f.size > FOTO_MB * 1024 * 1024) { erros.push('"' + f.name + '" tem mais de ' + FOTO_MB + ' MB.'); return; }
        f._url = URL.createObjectURL(f); files.push(f);
      });
      if (erros.length) toast(erros[0], 3500);
      renderFiles();
    }
    if (dz) {
      dz.addEventListener('click', function () { fileInput.click(); });
      dz.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
      fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-over'); }); });
      dz.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });
      thumbs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-rm]'); if (!b) return;
        var i = Number(b.getAttribute('data-rm')); URL.revokeObjectURL(files[i]._url); files.splice(i, 1); renderFiles();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      inputs.forEach(function (el) {
        if (el.closest('[hidden]')) { setError(el, ''); return; }
        var m = validateField(el); setError(el, m); if (m && !first) first = el;
      });
      if (first) { first.focus(); toast('Confira os campos destacados.'); return; }

      // monta os dados
      var get = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
      var dados = {}, linhas = [];
      inputs.forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio' && !el.checked) return;
        if (el.closest('[hidden]')) return;
        var val = el.tagName === 'SELECT' ? (el.value ? el.options[el.selectedIndex].text : '') : String(el.value || '').trim();
        if (!val) return;
        var lab = labelOf(form, el);
        if (['nome', 'telefone', 'email', 'mensagem'].indexOf(el.name) < 0) dados[el.name] = val;
        linhas.push('*' + lab + ':* ' + val);
      });
      var lead = {
        tipo: tipo, nome: get('nome'), telefone: get('telefone'), email: get('email'),
        mensagem: get('mensagem'), dados: dados, veiculo_id: get('veiculo_id') || null
      };
      if (lead.veiculo_id === '__nenhum') lead.veiculo_id = null;

      var titulos = { contato: 'Contato pelo site', avaliacao: 'Quero vender meu veículo', financiamento: 'Financiamento' };
      var msg = '*' + titulos[tipo] + ' — ' + CFG.loja.nome + '*\n\n' + linhas.join('\n');
      if (tipo === 'avaliacao' && files.length) msg += '\n\n_Vou enviar ' + files.length + ' foto(s) nesta conversa._';

      var btn = qs('button[type=submit]', form);
      var success = function (viaWa) {
        var box = document.createElement('div');
        box.className = 'success-box';
        box.innerHTML = '<div class="ic">' + icon('check-circle') + '</div><h2>Recebemos sua solicitação!</h2>' +
          '<p>' + (viaWa ? 'Finalize o envio na conversa do WhatsApp que abrimos para você.' : 'Em breve nossa equipe entra em contato.') + '</p>' +
          '<a class="btn btn-wa" href="' + esc(waLink(CFG.loja.whatsapp, msg)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' Falar agora no WhatsApp</a>';
        var card = form.closest('.form-card');
        form.style.display = 'none';
        card.appendChild(box);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      if (DB.demo || !DB.client) {
        if (tipo === 'avaliacao') toast('Envie as fotos na conversa que vai abrir.', 3500);
        abrirWhatsApp(CFG.loja.whatsapp, msg);
        success(true);
        return;
      }
      btn.classList.add('is-loading'); var old = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Enviando...';
      DB.inserirLead(lead, files).then(function () { success(false); })
        .catch(function (err) {
          console.error(err);
          btn.classList.remove('is-loading'); btn.innerHTML = old;
          toast('Não conseguimos enviar agora. Vamos abrir o WhatsApp para você.', 3500);
          setTimeout(function () { abrirWhatsApp(CFG.loja.whatsapp, msg); }, 900);
        });
    });
  }

  function initFinanciamento() {
    var sel = qs('#fin-veiculo'), valor = qs('#fin-valor');
    var troca = qsa('input[name=troca]'), trocaBox = qs('#troca-box');
    troca.forEach(function (r) { r.addEventListener('change', function () {
      var sim = qs('input[name=troca]:checked').value === 'Sim';
      trocaBox.hidden = !sim; qs('#fin-troca-qual').required = sim;
    }); });
    DB.getVeiculos().then(function (l) {
      var pre = new URLSearchParams(location.search).get('veiculo');
      sel.innerHTML = '<option value="">Selecione</option><option value="__nenhum">Ainda não escolhi</option>' +
        l.map(function (v) { return '<option value="' + esc(v.id) + '" data-preco="' + (v.consulte ? '' : v.preco) + '">' + esc(nomeVeiculo(v)) + ' — ' + esc(precoTexto(v)) + '</option>'; }).join('');
      if (pre && l.some(function (v) { return String(v.id) === pre; })) sel.value = pre;
      sel.dispatchEvent(new Event('change'));
    });
    sel.addEventListener('change', function () {
      var o = sel.options[sel.selectedIndex];
      var p = o && o.getAttribute('data-preco');
      if (p) valor.value = money(p); else if (sel.value === '__nenhum') valor.value = '';
    });
  }

  /* =====================================================================
     Boot
     ===================================================================== */
  /* Troca o nome-padrão gravado no HTML pelo nome configurado (título da aba, SEO, compartilhamento) */
  function aplicarNomeLoja() {
    var L = CFG.loja, PADRAO = 'Vehicle Store';
    if (PAGE === 'home' && CFG.seo) {
      if (CFG.seo.titulo) document.title = CFG.seo.titulo;
      var d = qs('meta[name="description"]'); if (d && CFG.seo.descricao) d.setAttribute('content', CFG.seo.descricao);
    }
    if (L.nome && L.nome !== PADRAO) {
      document.title = document.title.split(PADRAO).join(L.nome);
      qsa('meta[name="description"], meta[property^="og:"]').forEach(function (m) {
        var c = m.getAttribute('content'); if (c && c.indexOf(PADRAO) > -1) m.setAttribute('content', c.split(PADRAO).join(L.nome));
      });
    }
    var fav = qs('link[rel="icon"]'); if (fav && L.logo) fav.setAttribute('href', url(L.logo));
  }

  function boot() {
    aplicarNomeLoja();
    mountLayout();
    bindLojaData();
    Fav.updateBadge();
    applyMasks(document);
    qsa('form[data-form]').forEach(initForm);
    if (PAGE === 'home') initHome();
    if (PAGE === 'loja') initLoja();
    if (PAGE === 'financiamento') initFinanciamento();
    reveal(document);
    App.isReady = true;
    document.dispatchEvent(new CustomEvent('app:ready'));
  }

  (window.DB ? DB.ready : Promise.resolve()).then(boot, boot);
})();
