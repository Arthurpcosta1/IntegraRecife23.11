import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client (admin)
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Helper para verificar autenticação
const verificarAutenticacao = async (accessToken: string | undefined) => {
  if (!accessToken) {
    return { erro: true, mensagem: 'Token de acesso não fornecido' };
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { erro: true, mensagem: 'Não autorizado' };
  }
  
  return { erro: false, usuario: user };
};

// Health check endpoint
app.get("/make-server-2afcbce1/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ ROTAS DE AUTENTICAÇÃO ============

// Rota de cadastro de usuário
app.post("/make-server-2afcbce1/cadastro", async (c) => {
  try {
    const { email, senha, nome, tipo } = await c.req.json();
    
    if (!email || !senha || !nome || !tipo) {
      return c.json({ erro: 'Campos obrigatórios faltando' }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirmar email automaticamente pois servidor de email não foi configurado
      user_metadata: { nome, tipo }
    });
    
    if (authError) {
      console.log('Erro ao criar usuário no Auth:', authError);
      return c.json({ erro: authError.message }, 400);
    }
    
    // Salvar dados do usuário no KV
    await kv.set(`usuario:${authData.user.id}`, {
      id: authData.user.id,
      email,
      nome,
      tipo,
      dataCriacao: new Date().toISOString()
    });
    
    return c.json({ 
      sucesso: true,
      usuario: {
        id: authData.user.id,
        email,
        nome,
        tipo
      }
    });
  } catch (error) {
    console.log('Erro no cadastro:', error);
    return c.json({ erro: 'Erro ao cadastrar usuário: ' + error.message }, 500);
  }
});

// ============ ROTAS DE ADMINISTRAÇÃO DE USUÁRIOS ============

// Listar todos os usuários (apenas admin)
app.get("/make-server-2afcbce1/usuarios", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const auth = await verificarAutenticacao(accessToken);
    
    if (auth.erro) {
      return c.json({ erro: auth.mensagem }, 401);
    }
    
    // Buscar dados do usuário logado
    const usuarioLogado = await kv.get(`usuario:${auth.usuario.id}`);
    
    if (usuarioLogado?.tipo !== 'admin') {
      return c.json({ erro: 'Acesso negado. Apenas administradores.' }, 403);
    }
    
    // Buscar todos os usuários
    const usuarios = await kv.getByPrefix('usuario:');
    
    return c.json({ 
      sucesso: true,
      usuarios: usuarios.map(u => ({
        id: u.id,
        email: u.email,
        nome: u.nome,
        tipo: u.tipo,
        dataCriacao: u.dataCriacao
      }))
    });
  } catch (error) {
    console.log('Erro ao listar usuários:', error);
    return c.json({ erro: 'Erro ao listar usuários: ' + error.message }, 500);
  }
});

// Excluir usuário (apenas admin)
app.delete("/make-server-2afcbce1/usuarios/:id", async (c) => {
  try {
    const usuarioId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const auth = await verificarAutenticacao(accessToken);
    
    if (auth.erro) {
      return c.json({ erro: auth.mensagem }, 401);
    }
    
    // Buscar dados do usuário logado
    const usuarioLogado = await kv.get(`usuario:${auth.usuario.id}`);
    
    if (usuarioLogado?.tipo !== 'admin') {
      return c.json({ erro: 'Acesso negado. Apenas administradores.' }, 403);
    }
    
    // Não permitir que o admin exclua a si mesmo
    if (auth.usuario.id === usuarioId) {
      return c.json({ erro: 'Você não pode excluir sua própria conta' }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Excluir do Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(usuarioId);
    
    if (deleteError) {
      console.log('Erro ao excluir usuário do Auth:', deleteError);
      return c.json({ erro: deleteError.message }, 400);
    }
    
    // Excluir do KV
    await kv.del(`usuario:${usuarioId}`);
    
    // Excluir avaliações do usuário
    const avaliacoes = await kv.getByPrefix('avaliacao:');
    for (const avaliacao of avaliacoes) {
      if (avaliacao.usuarioId === usuarioId) {
        await kv.del(`avaliacao:${avaliacao.id}`);
      }
    }
    
    return c.json({ sucesso: true, mensagem: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.log('Erro ao excluir usuário:', error);
    return c.json({ erro: 'Erro ao excluir usuário: ' + error.message }, 500);
  }
});

// ============ ROTAS DE EVENTOS ============

// Criar evento (apenas admin)
app.post("/make-server-2afcbce1/eventos", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const auth = await verificarAutenticacao(accessToken);
    
    if (auth.erro) {
      return c.json({ erro: auth.mensagem }, 401);
    }
    
    const usuarioLogado = await kv.get(`usuario:${auth.usuario.id}`);
    
    if (usuarioLogado?.tipo !== 'admin') {
      return c.json({ erro: 'Acesso negado. Apenas administradores.' }, 403);
    }
    
    const eventoData = await c.req.json();
    const eventoId = `evento_${Date.now()}`;
    
    const evento = {
      id: eventoId,
      ...eventoData,
      dataCriacao: new Date().toISOString(),
      criadoPor: auth.usuario.id,
      avaliacoes: [],
      mediaAvaliacoes: 0,
      totalAvaliacoes: 0
    };
    
    await kv.set(`evento:${eventoId}`, evento);
    
    return c.json({ sucesso: true, evento });
  } catch (error) {
    console.log('Erro ao criar evento:', error);
    return c.json({ erro: 'Erro ao criar evento: ' + error.message }, 500);
  }
});

// Listar eventos
app.get("/make-server-2afcbce1/eventos", async (c) => {
  try {
    const eventos = await kv.getByPrefix('evento:');
    
    return c.json({ sucesso: true, eventos });
  } catch (error) {
    console.log('Erro ao listar eventos:', error);
    return c.json({ erro: 'Erro ao listar eventos: ' + error.message }, 500);
  }
});

// Excluir evento (apenas admin)
app.delete("/make-server-2afcbce1/eventos/:id", async (c) => {
  try {
    const eventoId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const auth = await verificarAutenticacao(accessToken);
    
    if (auth.erro) {
      return c.json({ erro: auth.mensagem }, 401);
    }
    
    const usuarioLogado = await kv.get(`usuario:${auth.usuario.id}`);
    
    if (usuarioLogado?.tipo !== 'admin') {
      return c.json({ erro: 'Acesso negado. Apenas administradores.' }, 403);
    }
    
    await kv.del(`evento:${eventoId}`);
    
    // Excluir avaliações do evento
    const avaliacoes = await kv.getByPrefix('avaliacao:');
    for (const avaliacao of avaliacoes) {
      if (avaliacao.eventoId === eventoId) {
        await kv.del(`avaliacao:${avaliacao.id}`);
      }
    }
    
    return c.json({ sucesso: true, mensagem: 'Evento excluído com sucesso' });
  } catch (error) {
    console.log('Erro ao excluir evento:', error);
    return c.json({ erro: 'Erro ao excluir evento: ' + error.message }, 500);
  }
});

// ============ ROTAS DE AVALIAÇÕES ============

// Criar avaliação
app.post("/make-server-2afcbce1/avaliacoes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const auth = await verificarAutenticacao(accessToken);
    
    if (auth.erro) {
      return c.json({ erro: auth.mensagem }, 401);
    }
    
    const { eventoId, nota, comentario } = await c.req.json();
    
    if (!eventoId || !nota) {
      return c.json({ erro: 'Campos obrigatórios faltando' }, 400);
    }
    
    const avaliacaoId = `avaliacao_${Date.now()}`;
    const usuarioLogado = await kv.get(`usuario:${auth.usuario.id}`);
    
    const avaliacao = {
      id: avaliacaoId,
      eventoId,
      usuarioId: auth.usuario.id,
      nomeUsuario: usuarioLogado?.nome || 'Usuário',
      nota,
      comentario: comentario || '',
      dataAvaliacao: new Date().toISOString()
    };
    
    await kv.set(`avaliacao:${avaliacaoId}`, avaliacao);
    
    return c.json({ sucesso: true, avaliacao });
  } catch (error) {
    console.log('Erro ao criar avaliação:', error);
    return c.json({ erro: 'Erro ao criar avaliação: ' + error.message }, 500);
  }
});

// Listar avaliações de um evento
app.get("/make-server-2afcbce1/avaliacoes/:eventoId", async (c) => {
  try {
    const eventoId = c.req.param('eventoId');
    const todasAvaliacoes = await kv.getByPrefix('avaliacao:');
    
    const avaliacoesDoEvento = todasAvaliacoes.filter(a => a.eventoId === eventoId);
    
    return c.json({ sucesso: true, avaliacoes: avaliacoesDoEvento });
  } catch (error) {
    console.log('Erro ao listar avaliações:', error);
    return c.json({ erro: 'Erro ao listar avaliações: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);