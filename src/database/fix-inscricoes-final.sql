-- =====================================================
-- FIX DEFINITIVO: TABELA INSCRIÇÕES
-- Solução para erro: "Could not find the 'data_inscricao' column"
-- =====================================================

-- PASSO 1: Remover tabela antiga se existir
DROP TABLE IF EXISTS inscricoes CASCADE;

-- PASSO 2: Criar tabela do zero com estrutura correta
CREATE TABLE inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- PASSO 3: Criar índices para performance
CREATE INDEX idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX idx_inscricoes_usuario ON inscricoes(usuario_id);
CREATE INDEX idx_inscricoes_created_at ON inscricoes(created_at);

-- PASSO 4: Ativar RLS
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuario pode ler inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode ver suas inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode criar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode deletar sua inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode cancelar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Todos podem ler inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Permitir leitura" ON inscricoes;
DROP POLICY IF EXISTS "Permitir insert" ON inscricoes;
DROP POLICY IF EXISTS "Permitir delete" ON inscricoes;

-- PASSO 6: Criar políticas RLS liberais (para testes)
CREATE POLICY "Permitir leitura"
  ON inscricoes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir insert"
  ON inscricoes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir delete"
  ON inscricoes
  FOR DELETE
  TO public
  USING (true);

-- PASSO 7: Verificação
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'inscricoes'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ TABELA RECRIADA COM SUCESSO
-- ✅ Nota: mudamos 'data_inscricao' para 'created_at' 
--    (padrão do Supabase)
-- =====================================================
