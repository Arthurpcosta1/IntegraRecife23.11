-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- Plataforma Integra Recife - Eventos do Recife
-- Versão: 1.0
-- Data: 20 de Outubro de 2025
-- =====================================================

-- =====================================================
-- TABELA: usuarios
-- Descrição: Armazena informações dos usuários da plataforma
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  avatar TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'cidadao')),
  telefone TEXT,
  bio TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: eventos
-- Descrição: Armazena os eventos da cidade do Recife
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  localizacao TEXT NOT NULL,
  endereco_completo TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  imagem TEXT,
  categoria TEXT NOT NULL,
  cor_categoria TEXT,
  capacidade INTEGER,
  preco DECIMAL(10, 2) DEFAULT 0,
  organizador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('ativo', 'cancelado', 'concluido', 'adiado')) DEFAULT 'ativo',
  destaque BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: favoritos
-- Descrição: Armazena os eventos favoritados pelos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, evento_id)
);

-- =====================================================
-- TABELA: avaliacoes
-- Descrição: Armazena as avaliações dos eventos pelos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- =====================================================
-- TABELA: projetos
-- Descrição: Armazena projetos conjuntos entre organizadores
-- =====================================================
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  status TEXT CHECK (status IN ('planejamento', 'em-andamento', 'concluido', 'cancelado')) DEFAULT 'planejamento',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  data_inicio DATE,
  data_fim DATE,
  orcamento DECIMAL(12, 2),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: membros_projeto
-- Descrição: Relaciona usuários com projetos (equipe)
-- =====================================================
CREATE TABLE IF NOT EXISTS membros_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  papel TEXT,
  adicionado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(projeto_id, usuario_id)
);

-- =====================================================
-- TABELA: canais_chat
-- Descrição: Armazena os canais do sistema de chat/fórum
-- =====================================================
CREATE TABLE IF NOT EXISTS canais_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('geral', 'evento', 'projeto')),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: mensagens_chat
-- Descrição: Armazena as mensagens enviadas nos canais
-- =====================================================
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES canais_chat(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_nome TEXT NOT NULL,
  usuario_avatar TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: notificacoes
-- Descrição: Armazena as notificações dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'sucesso', 'alerta', 'erro')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  link TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: inscricoes
-- Descrição: Armazena inscrições de usuários em eventos
-- =====================================================
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('confirmada', 'pendente', 'cancelada')) DEFAULT 'confirmada',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_organizador ON eventos(organizador_id);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_evento ON favoritos(evento_id);

-- Índices para avaliacoes
CREATE INDEX IF NOT EXISTS idx_avaliacoes_evento ON avaliacoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_criado_por ON projetos(criado_por);

-- Índices para membros_projeto
CREATE INDEX IF NOT EXISTS idx_membros_projeto_projeto ON membros_projeto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_membros_projeto_usuario ON membros_projeto(usuario_id);

-- Índices para canais_chat
CREATE INDEX IF NOT EXISTS idx_canais_tipo ON canais_chat(tipo);
CREATE INDEX IF NOT EXISTS idx_canais_evento ON canais_chat(evento_id);
CREATE INDEX IF NOT EXISTS idx_canais_projeto ON canais_chat(projeto_id);

-- Índices para mensagens_chat
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens_chat(canal_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens_chat(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_criado_em ON mensagens_chat(criado_em);

-- Índices para notificacoes
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Índices para inscricoes
CREATE INDEX IF NOT EXISTS idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario ON inscricoes(usuario_id);

-- Índices para armazenamento_chave_valor
CREATE INDEX IF NOT EXISTS idx_armazenamento_chave ON armazenamento_chave_valor(chave);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE canais_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE armazenamento_chave_valor ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: usuarios
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler usuarios" ON usuarios;
CREATE POLICY "Todos podem ler usuarios" 
  ON usuarios FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar usuarios" ON usuarios;
CREATE POLICY "Todos podem criar usuarios" 
  ON usuarios FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode atualizar proprio perfil" ON usuarios;
CREATE POLICY "Usuario pode atualizar proprio perfil" 
  ON usuarios FOR UPDATE 
  USING (true);

-- =====================================================
-- POLÍTICAS: eventos
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler eventos" ON eventos;
CREATE POLICY "Todos podem ler eventos" 
  ON eventos FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar eventos" ON eventos;
CREATE POLICY "Todos podem criar eventos" 
  ON eventos FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Organizador pode atualizar evento" ON eventos;
CREATE POLICY "Organizador pode atualizar evento" 
  ON eventos FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Organizador pode deletar evento" ON eventos;
CREATE POLICY "Organizador pode deletar evento" 
  ON eventos FOR DELETE 
  USING (true);

-- =====================================================
-- POLÍTICAS: favoritos
-- =====================================================
DROP POLICY IF EXISTS "Usuario pode ler seus favoritos" ON favoritos;
CREATE POLICY "Usuario pode ler seus favoritos" 
  ON favoritos FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Usuario pode criar favorito" ON favoritos;
CREATE POLICY "Usuario pode criar favorito" 
  ON favoritos FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode deletar favorito" ON favoritos;
CREATE POLICY "Usuario pode deletar favorito" 
  ON favoritos FOR DELETE 
  USING (true);

-- =====================================================
-- POLÍTICAS: avaliacoes
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler avaliacoes" ON avaliacoes;
CREATE POLICY "Todos podem ler avaliacoes" 
  ON avaliacoes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Usuario pode criar avaliacao" ON avaliacoes;
CREATE POLICY "Usuario pode criar avaliacao" 
  ON avaliacoes FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode atualizar sua avaliacao" ON avaliacoes;
CREATE POLICY "Usuario pode atualizar sua avaliacao" 
  ON avaliacoes FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Usuario pode deletar sua avaliacao" ON avaliacoes;
CREATE POLICY "Usuario pode deletar sua avaliacao" 
  ON avaliacoes FOR DELETE 
  USING (true);

-- =====================================================
-- POLÍTICAS: projetos
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler projetos" ON projetos;
CREATE POLICY "Todos podem ler projetos" 
  ON projetos FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar projetos" ON projetos;
CREATE POLICY "Todos podem criar projetos" 
  ON projetos FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Criador pode atualizar projeto" ON projetos;
CREATE POLICY "Criador pode atualizar projeto" 
  ON projetos FOR UPDATE 
  USING (true);

-- =====================================================
-- POLÍTICAS: membros_projeto
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler membros" ON membros_projeto;
CREATE POLICY "Todos podem ler membros" 
  ON membros_projeto FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem adicionar membros" ON membros_projeto;
CREATE POLICY "Todos podem adicionar membros" 
  ON membros_projeto FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: canais_chat
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler canais" ON canais_chat;
CREATE POLICY "Todos podem ler canais" 
  ON canais_chat FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar canais" ON canais_chat;
CREATE POLICY "Todos podem criar canais" 
  ON canais_chat FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: mensagens_chat
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler mensagens" ON mensagens_chat;
CREATE POLICY "Todos podem ler mensagens" 
  ON mensagens_chat FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar mensagens" ON mensagens_chat;
CREATE POLICY "Todos podem criar mensagens" 
  ON mensagens_chat FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode deletar sua mensagem" ON mensagens_chat;
CREATE POLICY "Usuario pode deletar sua mensagem" 
  ON mensagens_chat FOR DELETE 
  USING (true);

-- =====================================================
-- POLÍTICAS: notificacoes
-- =====================================================
DROP POLICY IF EXISTS "Usuario pode ler suas notificacoes" ON notificacoes;
CREATE POLICY "Usuario pode ler suas notificacoes" 
  ON notificacoes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Sistema pode criar notificacoes" ON notificacoes;
CREATE POLICY "Sistema pode criar notificacoes" 
  ON notificacoes FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode atualizar suas notificacoes" ON notificacoes;
CREATE POLICY "Usuario pode atualizar suas notificacoes" 
  ON notificacoes FOR UPDATE 
  USING (true);

-- =====================================================
-- POLÍTICAS: inscricoes
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler inscricoes" ON inscricoes;
CREATE POLICY "Todos podem ler inscricoes" 
  ON inscricoes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Usuario pode criar inscricao" ON inscricoes;
CREATE POLICY "Usuario pode criar inscricao" 
  ON inscricoes FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario pode cancelar inscricao" ON inscricoes;
CREATE POLICY "Usuario pode cancelar inscricao" 
  ON inscricoes FOR UPDATE 
  USING (true);

-- =====================================================
-- POLÍTICAS: armazenamento_chave_valor
-- =====================================================
DROP POLICY IF EXISTS "Todos podem ler armazenamento" ON armazenamento_chave_valor;
CREATE POLICY "Todos podem ler armazenamento" 
  ON armazenamento_chave_valor FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Todos podem criar armazenamento" ON armazenamento_chave_valor;
CREATE POLICY "Todos podem criar armazenamento" 
  ON armazenamento_chave_valor FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Todos podem atualizar armazenamento" ON armazenamento_chave_valor;
CREATE POLICY "Todos podem atualizar armazenamento" 
  ON armazenamento_chave_valor FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Todos podem deletar armazenamento" ON armazenamento_chave_valor;
CREATE POLICY "Todos podem deletar armazenamento" 
  ON armazenamento_chave_valor FOR DELETE 
  USING (true);

-- =====================================================
-- TABELA: armazenamento_chave_valor
-- Descrição: Armazena dados no formato chave-valor (KV Store)
-- =====================================================
CREATE TABLE IF NOT EXISTS armazenamento_chave_valor (
  chave TEXT PRIMARY KEY NOT NULL,
  valor JSONB NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DADOS INICIAIS - CANAIS PADRÃO
-- =====================================================

INSERT INTO canais_chat (nome, descricao, tipo) VALUES
  ('geral', 'Discussões gerais sobre eventos do Recife', 'geral'),
  ('festival-rec-beat', 'Tudo sobre o Festival Rec-Beat 2025', 'evento'),
  ('projetos-culturais', 'Discussões sobre projetos conjuntos', 'projeto'),
  ('carnaval-olinda', 'Planejamento e dicas para o Carnaval', 'evento'),
  ('gastronomia', 'Eventos gastronômicos e culinária', 'geral')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar o campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_atualizar_usuarios ON usuarios;
CREATE TRIGGER trigger_atualizar_usuarios
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_eventos ON eventos;
CREATE TRIGGER trigger_atualizar_eventos
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_avaliacoes ON avaliacoes;
CREATE TRIGGER trigger_atualizar_avaliacoes
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_projetos ON projetos;
CREATE TRIGGER trigger_atualizar_projetos
  BEFORE UPDATE ON projetos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_armazenamento ON armazenamento_chave_valor;
CREATE TRIGGER trigger_atualizar_armazenamento
  BEFORE UPDATE ON armazenamento_chave_valor
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View: Estatísticas de eventos
CREATE OR REPLACE VIEW estatisticas_eventos AS
SELECT 
  e.id,
  e.titulo,
  e.categoria,
  COUNT(DISTINCT f.id) as total_favoritos,
  COUNT(DISTINCT i.id) as total_inscricoes,
  COUNT(DISTINCT a.id) as total_avaliacoes,
  COALESCE(AVG(a.nota), 0) as media_avaliacoes
FROM eventos e
LEFT JOIN favoritos f ON e.id = f.evento_id
LEFT JOIN inscricoes i ON e.id = i.evento_id
LEFT JOIN avaliacoes a ON e.id = a.evento_id
GROUP BY e.id, e.titulo, e.categoria;

-- View: Projetos com equipe
CREATE OR REPLACE VIEW projetos_com_equipe AS
SELECT 
  p.*,
  COUNT(mp.id) as total_membros,
  STRING_AGG(u.nome, ', ') as nomes_membros
FROM projetos p
LEFT JOIN membros_projeto mp ON p.id = mp.projeto_id
LEFT JOIN usuarios u ON mp.usuario_id = u.id
GROUP BY p.id;

-- =====================================================
-- VERIFICAÇÃO DO SCHEMA
-- =====================================================

-- Listar todas as tabelas criadas
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Contar registros nos canais
SELECT 'Total de canais criados:' as info, COUNT(*) as total FROM canais_chat;
