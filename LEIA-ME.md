# Vehicle Store — Site + Painel do lojista

Site multipágina em HTML, CSS e JavaScript puro, com painel administrativo em `/admin` e banco de dados no Supabase (plano gratuito).

---

## 1. Ver o site agora (modo demonstração)

Com as chaves do Supabase vazias em `data/config.js`, o site funciona sozinho:

- o estoque vem de `data/veiculos.json` (12 veículos de exemplo);
- os formulários montam a mensagem e abrem o WhatsApp da loja;
- o painel mostra o aviso “Configure o Supabase para ativar o painel”.

> Abrir os arquivos com dois cliques (`file://`) não carrega o estoque, porque o navegador bloqueia a leitura do JSON. Publique (passo 4) ou rode um servidor local: na pasta do site, `npx serve` ou `python -m http.server`, e abra `http://localhost:3000` (ou `:8000`).

---

## 2. Editar os dados da loja — `data/config.js`

Abra o arquivo num editor de texto (Bloco de Notas, VS Code) e troque o que está marcado com `TROCAR`:

| Campo | O que colocar |
|---|---|
| `nome`, `complemento` | Nome da loja e complemento do logo |
| `telefone` | Como aparece no site, ex.: `(31) 3333-4444` |
| `whatsapp` | **Só números**, com 55 + DDD: `5531999998888` |
| `endereco`, `cep`, `mapsUrl` | Endereço e link “Como chegar” do Google Maps |
| `horario` | Ex.: `Segunda a sexta, das 8h às 18h. Sábado, das 8h às 12h.` |
| `vendedores` | Nome, cargo e WhatsApp de cada vendedor |
| `logo`, `heroImg`, `lojaImg` | Caminho das imagens em `assets/img/` |

Quando o Supabase estiver ativo, tudo isso passa a ser editado pelo painel (**Configurações** e **Vendedores**) e o `config.js` vira só o valor-padrão.

## 3. Editar o estoque de demonstração — `data/veiculos.json`

Cada veículo segue este modelo (copie um bloco, troque os dados e mantenha as vírgulas entre os blocos):

```json
{
  "id": "jeep-compass-longitude-2024",
  "marca": "Jeep", "modelo": "Compass", "versao": "LONGITUDE",
  "anoFabricacao": 2024, "anoModelo": 2024, "km": 50617,
  "cambio": "Automático", "combustivel": "Flex", "carroceria": "SUV",
  "cor": "Cinza", "portas": 4, "preco": 137900,
  "opcionais": ["Ar-condicionado", "Multimídia"],
  "descricao": "Texto do anúncio.",
  "fotos": ["assets/img/veiculos/compass-1.jpg"],
  "destaque": true, "dataCadastro": "2026-10-01"
}
```

- `id` precisa ser único, sem espaços nem acentos.
- `"status": "reservado"` (opcional) mostra a etiqueta **Reservado**; `"vendido"` ou `"oculto"` esconde do site.
- As fotos atuais são ilustrações (`assets/img/veiculos/*.svg`). Coloque as fotos reais na mesma pasta e troque os caminhos.

---

## 4. Ativar o painel com o Supabase (passo a passo)

1. **Criar o projeto** — entre em [supabase.com](https://supabase.com), crie uma conta e clique em **New project** (plano Free). Guarde a senha do banco.
2. **Criar as tabelas** — no menu **SQL Editor › New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. Deve aparecer “Success”.
3. **Criar o usuário do dono** — **Authentication › Users › Add user › Create new user**: e-mail do dono + senha, marque **Auto Confirm User**.
4. **Tornar o dono Administrador** — de volta ao **SQL Editor**, rode (trocando o e-mail):
   ```sql
   update public.profiles set funcao = 'admin', ativo = true, nome = 'Nome do Dono'
   where email = 'dono@sualoja.com.br';
   ```
5. **Copiar as chaves** — **Project Settings › API**: copie a **Project URL** e a chave **anon public**. Cole as duas em `data/config.js`:
   ```js
   supabaseUrl: 'https://xxxx.supabase.co',
   supabaseAnonKey: 'eyJhbGciOi...',
   ```
   ⚠️ Nunca use a chave `service_role` no site.
6. **Endereço do site no Auth** — **Authentication › URL Configuration**:
   - *Site URL*: o endereço publicado (ex.: `https://sualoja.netlify.app`);
   - *Redirect URLs*: adicione `https://sualoja.netlify.app/admin/recuperar-senha.html`.
   Sem isso, os links de “Esqueci minha senha” e de convite não funcionam.
7. **Publicar** — escolha um:
   - **Netlify**: em app.netlify.com › *Add new site › Deploy manually*, arraste a pasta do site.
   - **Vercel**: `npx vercel` dentro da pasta, ou importe pelo painel.
   - **Hostinger**: Gerenciador de Arquivos › `public_html` › envie todos os arquivos e pastas.
8. **Primeiro acesso** — no site publicado, clique no **escudo** ao lado do coração (Área do lojista) e entre com o e-mail e a senha do dono.
9. **Começar a usar**:
   - **Configurações**: confira nome, WhatsApp, endereço, logo e imagens;
   - **Vendedores**: cadastre a equipe (aparece no menu e no rodapé);
   - **Veículos**: com o banco vazio, o botão **Importar estoque de demonstração** copia os 12 exemplos — ou cadastre os seus com **+ Novo veículo**.

### Convidar vendedores (Usuários e acessos)

Há dois jeitos, e o painel escolhe sozinho:

- **Recomendado — Edge Function** (convite oficial por e-mail, cadastro público fechado): instale o [Supabase CLI](https://supabase.com/docs/guides/cli) e rode, na pasta do site:
  ```bash
  npx supabase login
  npx supabase functions deploy admin-usuarios --project-ref SEU_PROJECT_REF
  ```
  Depois, em **Authentication › Providers › Email**, você pode desligar *Allow new users to sign up*.
- **Sem a Edge Function**: deixe *Allow new users to sign up* **ligado** e *Confirm email* **desligado**. Contas novas nascem **inativas** e só funcionam depois que um Administrador as ativa; o convite cria a conta e envia o link para a pessoa definir a senha.

---

## 5. O que fica onde

```
index.html, estoque.html, veiculo.html, …   páginas do site
assets/css/style.css                        visual (cores em :root)
assets/js/main.js                           header, rodapé, favoritos, WhatsApp, formulários
assets/js/estoque.js                        filtros, detalhe do veículo, favoritos
assets/js/supabase.js                       conexão com o banco
data/config.js                              chaves + dados da loja
data/veiculos.json                          estoque de demonstração
admin/                                      painel do lojista
supabase/schema.sql                         banco, permissões e armazenamento
supabase/functions/admin-usuarios/          convites (opcional)
```

## 6. Identidade visual (nome, logotipo e cores)

No painel: **Configurações › Identidade visual** (só Administrador).

- **Nome da empresa e complemento**: mudam em todo o site: topo, rodapé, título das abas do navegador, mensagens do WhatsApp e informações para o Google.
- **Logotipo**: envie uma versão para fundo claro (topo do site) e outra para fundo escuro (painel e login). Com o botão **Usar só o nome (sem imagem)**, o site mostra o nome escrito com as cores da marca.
- **Cores**: quatro cores com paleta livre (ou digite o código, ex.: `#C8102E`), sete combinações prontas e **Restaurar cores originais**. A prévia ao lado mostra o resultado na hora.
  - O site ajusta sozinho o tom do botão ao passar o mouse, o texto dos botões (branco ou escuro) e o tom usado em textos sobre o fundo branco. Assim até um amarelo forte continua legível.
  - Uma cor escura clara demais para o rodapé, ou um fundo escuro demais, aparece marcado em vermelho e o painel não deixa salvar.
- Depois de **Salvar identidade visual**, as mudanças aparecem para todos os visitantes na hora.

No modo demonstração (sem Supabase), as cores ficam em `data/config.js`, no bloco `tema`.

**Permissões**: Administrador acessa tudo. Vendedor cadastra/edita veículos (não exclui), vê os próprios leads e os sem responsável, e edita o próprio perfil. As regras também valem no banco (RLS).
