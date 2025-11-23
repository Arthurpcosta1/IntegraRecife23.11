-- =====================================================
-- SCHEMA PARA ROTEIROS TURÍSTICOS
-- Sistema de Gestão de Conteúdo e Roteiros (RF10)
-- =====================================================

-- Tabela de Roteiros Turísticos
CREATE TABLE IF NOT EXISTS roteiros_turisticos (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  descricao_completa TEXT,
  duracao_estimada TEXT NOT NULL,
  imagem TEXT,
  numero_pontos INTEGER DEFAULT 0,
  usuario_criador UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'publicado' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  visualizacoes INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pontos de Interesse dos Roteiros
CREATE TABLE IF NOT EXISTS pontos_interesse (
  id BIGSERIAL PRIMARY KEY,
  roteiro_id BIGINT REFERENCES roteiros_turisticos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  imagem TEXT,
  ordem INTEGER NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  endereco TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_roteiros_status ON roteiros_turisticos(status);
CREATE INDEX IF NOT EXISTS idx_roteiros_usuario ON roteiros_turisticos(usuario_criador);
CREATE INDEX IF NOT EXISTS idx_pontos_roteiro ON pontos_interesse(roteiro_id);
CREATE INDEX IF NOT EXISTS idx_pontos_ordem ON pontos_interesse(roteiro_id, ordem);

-- Políticas de segurança RLS (Row Level Security)
-- NOTA: RLS desabilitado porque usamos autenticação customizada (não Supabase Auth)
-- A segurança é gerenciada no nível da aplicação

-- Desabilitar RLS nas tabelas (permite uso com autenticação customizada)
ALTER TABLE roteiros_turisticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_interesse DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS COMENTADAS
-- Usamos autenticação customizada, então RLS está desabilitado
-- A segurança é gerenciada no nível da aplicação
-- =====================================================

/*
-- Políticas para roteiros_turisticos (NÃO USAR - COMENTADAS)

CREATE POLICY "Todos podem visualizar roteiros publicados"
  ON roteiros_turisticos
  FOR SELECT
  USING (status = 'publicado' OR auth.uid() = usuario_criador);

CREATE POLICY "Usuários autenticados podem criar roteiros"
  ON roteiros_turisticos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_criador);

CREATE POLICY "Usuários podem atualizar seus próprios roteiros"
  ON roteiros_turisticos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_criador)
  WITH CHECK (auth.uid() = usuario_criador);

CREATE POLICY "Usuários podem deletar seus próprios roteiros"
  ON roteiros_turisticos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_criador);

-- Políticas para pontos_interesse (NÃO USAR - COMENTADAS)

CREATE POLICY "Todos podem visualizar pontos de interesse"
  ON pontos_interesse
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roteiros_turisticos rt
      WHERE rt.id = pontos_interesse.roteiro_id
      AND (rt.status = 'publicado' OR rt.usuario_criador = auth.uid())
    )
  );

CREATE POLICY "Usuários podem criar pontos nos seus roteiros"
  ON pontos_interesse
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roteiros_turisticos rt
      WHERE rt.id = pontos_interesse.roteiro_id
      AND rt.usuario_criador = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar pontos dos seus roteiros"
  ON pontos_interesse
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roteiros_turisticos rt
      WHERE rt.id = pontos_interesse.roteiro_id
      AND rt.usuario_criador = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar pontos dos seus roteiros"
  ON pontos_interesse
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roteiros_turisticos rt
      WHERE rt.id = pontos_interesse.roteiro_id
      AND rt.usuario_criador = auth.uid()
    )
  );
*/

-- Função para atualizar numero_pontos automaticamente
CREATE OR REPLACE FUNCTION atualizar_numero_pontos()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE roteiros_turisticos
  SET numero_pontos = (
    SELECT COUNT(*) FROM pontos_interesse
    WHERE roteiro_id = COALESCE(NEW.roteiro_id, OLD.roteiro_id)
  )
  WHERE id = COALESCE(NEW.roteiro_id, OLD.roteiro_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o número de pontos
DROP TRIGGER IF EXISTS trigger_atualizar_numero_pontos ON pontos_interesse;
CREATE TRIGGER trigger_atualizar_numero_pontos
  AFTER INSERT OR DELETE ON pontos_interesse
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_numero_pontos();

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_atualizar_timestamp ON roteiros_turisticos;
CREATE TRIGGER trigger_atualizar_timestamp
  BEFORE UPDATE ON roteiros_turisticos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- Comentários nas tabelas para documentação
COMMENT ON TABLE roteiros_turisticos IS 'Armazena os roteiros turísticos criados pelos usuários';
COMMENT ON TABLE pontos_interesse IS 'Armazena os pontos de interesse de cada roteiro turístico';

COMMENT ON COLUMN roteiros_turisticos.titulo IS 'Nome do roteiro turístico';
COMMENT ON COLUMN roteiros_turisticos.descricao IS 'Descrição breve do roteiro';
COMMENT ON COLUMN roteiros_turisticos.descricao_completa IS 'Descrição detalhada do roteiro';
COMMENT ON COLUMN roteiros_turisticos.duracao_estimada IS 'Tempo estimado para completar o roteiro (ex: "2-3 horas")';
COMMENT ON COLUMN roteiros_turisticos.numero_pontos IS 'Número total de pontos de interesse no roteiro';
COMMENT ON COLUMN roteiros_turisticos.status IS 'Status do roteiro: rascunho, publicado ou arquivado';
COMMENT ON COLUMN roteiros_turisticos.visualizacoes IS 'Número de visualizações do roteiro';

COMMENT ON COLUMN pontos_interesse.nome IS 'Nome do ponto de interesse';
COMMENT ON COLUMN pontos_interesse.descricao IS 'Descrição do ponto de interesse';
COMMENT ON COLUMN pontos_interesse.ordem IS 'Ordem do ponto no roteiro (1, 2, 3...)';
COMMENT ON COLUMN pontos_interesse.latitude IS 'Coordenada de latitude do ponto';
COMMENT ON COLUMN pontos_interesse.longitude IS 'Coordenada de longitude do ponto';
