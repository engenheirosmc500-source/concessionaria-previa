// =============================================================================
// Edge Function "admin-usuarios" (OPCIONAL, recomendada)
// Envia convites oficiais por e-mail e cria usuários com senha provisória
// sem precisar liberar o cadastro público no Supabase.
//
// Publicar (uma vez), no terminal, dentro da pasta do projeto:
//   npx supabase login
//   npx supabase functions deploy admin-usuarios --project-ref SEU_PROJECT_REF
//
// A chave service_role fica SOMENTE aqui no servidor (variável automática
// SUPABASE_SERVICE_ROLE_KEY) — nunca no site.
// =============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1) Quem está chamando precisa ser Administrador ativo
    const authHeader = req.headers.get('Authorization') ?? '';
    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: u } = await caller.auth.getUser();
    if (!u?.user) return json({ erro: 'Sessão inválida. Entre novamente.' }, 401);
    const { data: perfil } = await caller.from('profiles').select('funcao, ativo').eq('id', u.user.id).single();
    if (!perfil || perfil.funcao !== 'admin' || !perfil.ativo) return json({ erro: 'Apenas Administradores podem convidar usuários.' }, 403);

    // 2) Dados do convite
    const { acao, nome, email, funcao, senha, redirectTo } = await req.json();
    if (!email || !nome) return json({ erro: 'Informe nome e e-mail.' }, 400);
    if (!['admin', 'vendedor'].includes(funcao)) return json({ erro: 'Função inválida.' }, 400);

    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    let userId: string | undefined;

    if (acao === 'criar') {
      if (!senha || String(senha).length < 8) return json({ erro: 'Senha provisória muito curta.' }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email, password: senha, email_confirm: true, user_metadata: { nome },
      });
      if (error) return json({ erro: /already/i.test(error.message) ? 'Este e-mail já tem cadastro.' : error.message }, 400);
      userId = data.user?.id;
    } else {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { nome }, redirectTo });
      if (error) return json({ erro: /already/i.test(error.message) ? 'Este e-mail já tem cadastro. Use “Reenviar convite”.' : error.message }, 400);
      userId = data.user?.id;
    }

    // 3) Ativa o perfil com a função escolhida
    const { error: e2 } = await admin.from('profiles')
      .update({ nome, funcao, ativo: true, trocar_senha: acao === 'criar' })
      .eq('id', userId);
    if (e2) return json({ erro: e2.message }, 400);

    return json({ ok: true, id: userId });
  } catch (e) {
    return json({ erro: (e as Error).message }, 500);
  }
});
