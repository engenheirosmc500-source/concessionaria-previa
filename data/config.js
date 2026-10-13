/* =========================================================================
   CONFIGURAÇÃO DO SITE — Vehicle Store
   -------------------------------------------------------------------------
   1) SUPABASE: cole aqui a "Project URL" e a "anon public key" do seu
      projeto (Supabase > Project Settings > API). NUNCA cole a service_role.
      Com as duas chaves vazias o site funciona em MODO DEMONSTRAÇÃO:
      - o estoque vem de data/veiculos.json
      - os formulários abrem o WhatsApp da loja
      - o painel /admin mostra "Configure o Supabase para ativar o painel"
   2) DADOS DA LOJA: usados no modo demonstração e como valores-padrão.
      Com o Supabase ativo, o que for salvo em Painel > Configurações
      substitui estes valores automaticamente.
   ========================================================================= */
window.SITE_CONFIG = {
  supabaseUrl: '',      // ex.: 'https://abcdefgh.supabase.co'
  supabaseAnonKey: '',  // ex.: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'

  loja: {
    nome: 'Vehicle Store',
    complemento: 'Auto Parts & Services',
    telefone: '(00) 0000-0000',                       // TROCAR
    whatsapp: '5500000000000',                        // TROCAR — só números, com 55 + DDD
    email: 'contato@sualoja.com.br',                  // TROCAR (opcional)
    endereco: 'Rua Exemplo, 123 - Centro, Sua Cidade - UF', // TROCAR
    cep: '00000-000',                                 // TROCAR
    mapsUrl: 'https://maps.google.com/?q=Vehicle+Store', // TROCAR — link "Como chegar"
    horario: 'Segunda a sexta, das 8h às 18h. Sábado, das 8h às 12h.',
    instagram: '',                                    // ex.: 'https://instagram.com/sualoja'
    facebook: '',
    historia: '',   // vazio = usa o texto-padrão da seção "Conheça a loja"
    rodapeTexto: 'Veículos seminovos selecionados, atendimento transparente e as melhores oportunidades para você comprar, vender ou trocar seu veículo.',
    logo: 'assets/img/logo.png',            // logo para fundo claro (header)
    logoClaro: 'assets/img/logo-claro.png', // logo para fundo escuro (painel/login)
    heroImg: 'assets/img/hero.jpg',
    heroIlustrativa: false,                  // mostra o selo "Imagem ilustrativa" na hero
    lojaImg: 'assets/img/loja.jpg',
    paginaLojaImg: 'assets/img/loja.jpg'
  },

  // IDENTIDADE VISUAL — cores do site (formato #RRGGBB). Com o Supabase ativo,
  // são trocadas pelo painel em Configurações › Identidade visual.
  tema: {
    primaria: '#8F6A12', // botões, menu ativo, nome do modelo, faixa CTA
    escura: '#0B1128',   // rodapé, botão escuro, barra lateral do painel
    destaque: '#D4A537', // detalhes sobre fundo escuro (links do rodapé, estrela)
    fundo: '#F7F7F8'     // fundo das áreas de conteúdo
  },

  // Vendedores exibidos no menu "Vendedores" e no rodapé (TROCAR)
  vendedores: [
    { nome: 'Carlos', cargo: 'Vendedor', whatsapp: '5500000000001' },
    { nome: 'Juliana', cargo: 'Vendedora', whatsapp: '5500000000002' }
  ],

  // Mensagens do WhatsApp. Variáveis: {nome_loja} {veiculo} {preco} {link} {vendedor}
  mensagens: {
    geral: 'Olá! Vim pelo site da {nome_loja} e gostaria de atendimento.',
    veiculo: 'Olá! Tenho interesse no {veiculo} anunciado por {preco} no site. Link: {link}',
    vendedor: 'Olá, {vendedor}! Vim pelo site da {nome_loja} e gostaria de atendimento.'
  },

  // Faixas de preço da busca da home (min/max em reais; null = sem limite)
  faixasPreco: [
    { rotulo: 'Até R$ 50 mil', min: null, max: 50000 },
    { rotulo: 'R$ 50 a 80 mil', min: 50000, max: 80000 },
    { rotulo: 'R$ 80 a 120 mil', min: 80000, max: 120000 },
    { rotulo: 'R$ 120 a 200 mil', min: 120000, max: 200000 },
    { rotulo: 'Acima de R$ 200 mil', min: 200000, max: null }
  ],

  seo: {
    titulo: 'Vehicle Store | Seminovos selecionados',
    descricao: 'Seminovos selecionados, atendimento transparente e as melhores oportunidades para comprar, vender ou trocar seu veículo.',
    imagem: 'assets/img/og-image.jpg'
  }
};
