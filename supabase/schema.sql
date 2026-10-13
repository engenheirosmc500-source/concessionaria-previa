-- =============================================================================
--  Vehicle Store — Banco de dados (Supabase / PostgreSQL)
--  Como usar: Supabase > SQL Editor > New query > cole TUDO > Run.
--  O script pode ser executado mais de uma vez com segurança (idempotente).
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. TABELAS
-- -----------------------------------------------------------------------------

-- Perfis dos usuários do painel (1 linha por usuário do Supabase Auth)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null default '',
  email         text,
  funcao        text not null default 'vendedor' check (funcao in ('admin','vendedor')),
  ativo         boolean not null default false,   -- novos cadastros nascem INATIVOS (só o admin ativa)
  telefone      text,
  avatar        text,
  trocar_senha  boolean not null default false,
  ultimo_acesso timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Vendedores exibidos no site (menu "Vendedores" e rodapé)
create table if not exists public.vendedores (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cargo       text not null default 'Vendedor',
  whatsapp    text not null,                       -- só números, com 55 + DDD
  foto        text,
  ativo       boolean not null default true,
  ordem       int not null default 0,
  profile_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Veículos
create table if not exists public.veiculos (
  id              text primary key default gen_random_uuid()::text,  -- ex.: "jeep-compass-longitude-2024-a1b2"
  marca           text not null,
  modelo          text not null,
  versao          text,
  ano_fabricacao  int  not null check (ano_fabricacao between 1900 and 2100),
  ano_modelo      int  not null check (ano_modelo between 1900 and 2100),
  km              int  not null default 0 check (km >= 0),
  cambio          text not null,
  combustivel     text,
  carroceria      text,
  cor             text,
  portas          int,
  preco           numeric(12,2) not null default 0 check (preco >= 0),
  consulte        boolean not null default false,  -- exibe "Consulte" no lugar do preço
  opcionais       text[] not null default '{}',
  descricao       text,
  destaque        boolean not null default false,
  status          text not null default 'disponivel' check (status in ('disponivel','reservado','vendido','oculto')),
  placa           text,                            -- PRIVADO (nunca é enviado ao site público)
  vendedor_id     uuid references public.vendedores(id) on delete set null,
  vendido_em      date,
  valor_venda     numeric(12,2),
  data_cadastro   date not null default current_date,
  created_by      uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists veiculos_status_idx on public.veiculos (status);
create index if not exists veiculos_data_idx on public.veiculos (data_cadastro desc);

-- Fotos dos veículos (a de menor "ordem" é a capa)
create table if not exists public.veiculo_fotos (
  id          uuid primary key default gen_random_uuid(),
  veiculo_id  text not null references public.veiculos(id) on delete cascade on update cascade,
  url         text not null,
  path        text,               -- caminho no bucket "veiculos" (para apagar o arquivo)
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists veiculo_fotos_veiculo_idx on public.veiculo_fotos (veiculo_id, ordem);

-- Leads (tudo que chega pelos formulários do site)
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('contato','avaliacao','financiamento','interesse')),
  nome            text not null check (char_length(nome) between 1 and 120),
  telefone        text check (char_length(telefone) <= 30),
  email           text check (char_length(email) <= 160),
  mensagem        text check (char_length(mensagem) <= 5000),
  dados           jsonb not null default '{}',
  veiculo_id      text references public.veiculos(id) on delete set null on update cascade,
  fotos           text[] not null default '{}' check (cardinality(fotos) <= 8),  -- caminhos no bucket privado "leads-fotos"
  status          text not null default 'novo' check (status in ('novo','em_atendimento','proposta','concluido','perdido')),
  responsavel_id  uuid references public.profiles(id) on delete set null,
  motivo_perda    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Anotações internas dos leads
create table if not exists public.lead_notas (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  autor_id    uuid default auth.uid() references public.profiles(id) on delete set null,
  texto       text not null check (char_length(texto) between 1 and 5000),
  created_at  timestamptz not null default now()
);
create index if not exists lead_notas_lead_idx on public.lead_notas (lead_id, created_at desc);

-- Configurações da loja (linha única, id = 1). "dados" guarda:
-- { loja: {...}, mensagens: {...}, faixasPreco: [...], seo: {...} }
create table if not exists public.configuracoes (
  id          int primary key default 1 check (id = 1),
  dados       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);
insert into public.configuracoes (id, dados) values (1, '{}') on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. FUNÇÕES AUXILIARES
-- -----------------------------------------------------------------------------

-- Usuário logado é da equipe (perfil ativo)?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ativo);
$$;

-- Usuário logado é Administrador ativo?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and ativo and funcao = 'admin');
$$;

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','vendedores','veiculos','leads','configuracoes'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Cria o perfil automaticamente quando um usuário é criado no Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém o e-mail do perfil igual ao do Auth
create or replace function public.handle_user_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;
drop trigger if exists on_auth_user_email on auth.users;
create trigger on_auth_user_email after update of email on auth.users
  for each row execute function public.handle_user_email();

-- Protege campos sensíveis do perfil e impede remover o último Administrador
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Quem não é admin não muda função, status de acesso nem e-mail (nem o próprio).
  -- auth.uid() nulo = SQL Editor / service_role (Edge Function) -> liberado.
  if auth.uid() is not null and not public.is_admin() then
    new.funcao := old.funcao;
    new.ativo  := old.ativo;
    new.email  := old.email;
  end if;
  if old.funcao = 'admin' and old.ativo and (new.funcao <> 'admin' or not new.ativo) then
    if not exists (select 1 from public.profiles where funcao = 'admin' and ativo and id <> old.id) then
      raise exception 'Não é possível remover o último Administrador.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile before update on public.profiles
  for each row execute function public.protect_profile();

create or replace function public.protect_last_admin_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.funcao = 'admin' and old.ativo and not exists (select 1 from public.profiles where funcao = 'admin' and ativo and id <> old.id) then
    raise exception 'Não é possível remover o último Administrador.';
  end if;
  return old;
end $$;
drop trigger if exists trg_protect_last_admin on public.profiles;
create trigger trg_protect_last_admin before delete on public.profiles
  for each row execute function public.protect_last_admin_delete();

-- Leads vindos do site sempre entram como "novo" e sem responsável
create or replace function public.sanitize_new_lead()
returns trigger language plpgsql as $$
begin
  if not public.is_staff() then
    new.status := 'novo';
    new.responsavel_id := null;
    new.motivo_perda := null;
    new.created_at := now();
  end if;
  return new;
end $$;
drop trigger if exists trg_sanitize_lead on public.leads;
create trigger trg_sanitize_lead before insert on public.leads
  for each row execute function public.sanitize_new_lead();

-- -----------------------------------------------------------------------------
-- 3. SEGURANÇA (RLS) — regras garantidas no banco, não só na interface
-- -----------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.vendedores    enable row level security;
alter table public.veiculos      enable row level security;
alter table public.veiculo_fotos enable row level security;
alter table public.leads         enable row level security;
alter table public.lead_notas    enable row level security;
alter table public.configuracoes enable row level security;

-- Remove políticas antigas (para poder rodar o script de novo)
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
    and tablename in ('profiles','vendedores','veiculos','veiculo_fotos','leads','lead_notas','configuracoes') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- PROFILES: cada um vê o próprio; a equipe vê a equipe; só admin altera os outros
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy profiles_delete_admin on public.profiles for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- VENDEDORES: público lê os ativos; equipe lê todos; só admin escreve
create policy vendedores_select_public on public.vendedores for select to anon, authenticated
  using (ativo or public.is_staff());
create policy vendedores_write_admin on public.vendedores for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- VEÍCULOS: público lê disponíveis/reservados; equipe lê tudo, cadastra e edita; só admin exclui
create policy veiculos_select on public.veiculos for select to anon, authenticated
  using (status in ('disponivel','reservado') or public.is_staff());
create policy veiculos_insert_staff on public.veiculos for insert to authenticated
  with check (public.is_staff());
create policy veiculos_update_staff on public.veiculos for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy veiculos_delete_admin on public.veiculos for delete to authenticated
  using (public.is_admin());

-- Colunas privadas: o visitante anônimo não consegue ler placa, vendedor nem valor de venda
revoke select on public.veiculos from anon;
grant select (id, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, combustivel, carroceria,
              cor, portas, preco, consulte, opcionais, descricao, destaque, status, data_cadastro, created_at)
  on public.veiculos to anon;

-- FOTOS: seguem a visibilidade do veículo
create policy fotos_select on public.veiculo_fotos for select to anon, authenticated
  using (public.is_staff() or exists (select 1 from public.veiculos v where v.id = veiculo_id and v.status in ('disponivel','reservado')));
create policy fotos_write_staff on public.veiculo_fotos for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- LEADS: público só INSERE (nunca lê). Admin vê tudo; vendedor vê os dele + sem responsável
create policy leads_insert_public on public.leads for insert to anon, authenticated
  with check (true);
create policy leads_select on public.leads for select to authenticated
  using (public.is_admin() or (public.is_staff() and (responsavel_id = auth.uid() or responsavel_id is null)));
create policy leads_update on public.leads for update to authenticated
  using (public.is_admin() or (public.is_staff() and (responsavel_id = auth.uid() or responsavel_id is null)))
  with check (public.is_admin() or (public.is_staff() and (responsavel_id = auth.uid() or responsavel_id is null)));
create policy leads_delete_admin on public.leads for delete to authenticated
  using (public.is_admin());

-- NOTAS: quem enxerga o lead enxerga e escreve as notas
create policy notas_select on public.lead_notas for select to authenticated
  using (public.is_staff() and exists (select 1 from public.leads l where l.id = lead_id));
create policy notas_insert on public.lead_notas for insert to authenticated
  with check (public.is_staff() and autor_id = auth.uid() and exists (select 1 from public.leads l where l.id = lead_id));
create policy notas_delete_admin on public.lead_notas for delete to authenticated
  using (public.is_admin());

-- CONFIGURAÇÕES: público lê; só admin grava
create policy config_select on public.configuracoes for select to anon, authenticated using (true);
create policy config_write_admin on public.configuracoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin() and id = 1);

-- -----------------------------------------------------------------------------
-- 4. STORAGE (fotos)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('veiculos',    'veiculos',    true,  10485760, array['image/jpeg','image/png','image/webp']),
  ('leads-fotos', 'leads-fotos', false,  8388608, array['image/jpeg','image/png','image/webp']),
  ('site',        'site',        true,   5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "veiculos: equipe envia"   on storage.objects;
drop policy if exists "veiculos: equipe altera"  on storage.objects;
drop policy if exists "veiculos: equipe apaga"   on storage.objects;
drop policy if exists "leads-fotos: site envia"  on storage.objects;
drop policy if exists "leads-fotos: equipe le"   on storage.objects;
drop policy if exists "leads-fotos: admin apaga" on storage.objects;
drop policy if exists "site: envia"              on storage.objects;
drop policy if exists "site: altera"             on storage.objects;
drop policy if exists "site: apaga"              on storage.objects;

-- Bucket público "veiculos": qualquer um vê (URL pública); só a equipe envia/apaga
create policy "veiculos: equipe envia"  on storage.objects for insert to authenticated with check (bucket_id = 'veiculos' and public.is_staff());
create policy "veiculos: equipe altera" on storage.objects for update to authenticated using (bucket_id = 'veiculos' and public.is_staff());
create policy "veiculos: equipe apaga"  on storage.objects for delete to authenticated using (bucket_id = 'veiculos' and public.is_staff());

-- Bucket PRIVADO "leads-fotos": o site envia (limite de tipo e 8 MB acima); só a equipe lê (URL assinada)
create policy "leads-fotos: site envia"  on storage.objects for insert to anon, authenticated with check (bucket_id = 'leads-fotos');
create policy "leads-fotos: equipe le"   on storage.objects for select to authenticated using (bucket_id = 'leads-fotos' and public.is_staff());
create policy "leads-fotos: admin apaga" on storage.objects for delete to authenticated using (bucket_id = 'leads-fotos' and public.is_admin());

-- Bucket público "site": logo, hero, fotos de vendedores (admin) e avatares (cada um na sua pasta)
create policy "site: envia" on storage.objects for insert to authenticated with check (
  bucket_id = 'site' and (public.is_admin() or (public.is_staff() and (storage.foldername(name))[1] = 'avatars' and (storage.foldername(name))[2] = auth.uid()::text)));
create policy "site: altera" on storage.objects for update to authenticated using (bucket_id = 'site' and public.is_admin());
create policy "site: apaga"  on storage.objects for delete to authenticated using (bucket_id = 'site' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. TEMPO REAL (leads aparecem no painel sem recarregar)
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leads') then
    alter publication supabase_realtime add table public.leads;
  end if;
end $$;

-- =============================================================================
-- 6. PRIMEIRO ADMINISTRADOR (o dono)
-- -----------------------------------------------------------------------------
-- a) Supabase > Authentication > Users > "Add user" > "Create new user":
--    informe o e-mail do dono e uma senha, e marque "Auto Confirm User".
-- b) Rode o comando abaixo trocando o e-mail:
--
--    update public.profiles
--       set funcao = 'admin', ativo = true, nome = 'Nome do Dono'
--     where email = 'dono@sualoja.com.br';
--
-- c) Pronto! Entre pelo escudo no topo do site (Área do lojista).
-- =============================================================================
