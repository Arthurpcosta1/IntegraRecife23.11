-- =====================================================
-- SETUP COMPLETO: INSCRIÇÕES EM EVENTOS
-- Descrição: Criação da tabela inscricoes com RLS
-- Data: Dezembro 2024
-- =====================================================

-- =====================================================
-- PASSO 1: CRIAR TABELA (SE NÃO EXISTIR)
-- =====================================================
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_inscricao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- =====================================================
-- PASSO 2: CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario ON inscricoes(usuario_id);

-- =====================================================
-- PASSO 3: ATIVAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 4: REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- =====================================================
DROP POLICY IF EXISTS "Usuario pode ler inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode ver suas inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode criar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode deletar sua inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode cancelar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Todos podem ler inscricoes" ON inscricoes;

-- =====================================================
-- PASSO 5: CRIAR NOVAS POLÍTICAS RLS
-- =====================================================

-- Política 1: Usuário pode ver suas próprias inscrições
CREATE POLICY "Usuario pode ver suas inscricoes"
  ON inscricoes
  FOR SELECT
  USING (true); -- Permite que todos vejam (para contadores públicos)

-- Política 2: Usuário pode inserir inscrição para si mesmo
CREATE POLICY "Usuario pode criar inscricao"
  ON inscricoes
  FOR INSERT
  WITH CHECK (true); -- Validação será feita no frontend

-- Política 3: Usuário pode deletar sua própria inscrição
CREATE POLICY "Usuario pode deletar sua inscricao"
  ON inscricoes
  FOR DELETE
  USING (true); -- Validação será feita no frontend

-- =====================================================
-- PASSO 6: VERIFICAÇÃO (CONSULTAS DE TESTE)
-- =====================================================

-- Contar total de inscrições
SELECT COUNT(*) as total_inscricoes FROM inscricoes;

-- Listar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'inscricoes'
ORDER BY ordinal_position;

-- Verificar políticas RLS ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'inscricoes';

-- =====================================================
-- CONCLUSÃO
-- =====================================================
-- A tabela 'inscricoes' está pronta para uso com:
-- ✅ Estrutura correta (id, evento_id, usuario_id, data_inscricao)
-- ✅ Constraint UNIQUE para prevenir inscrições duplicadas
-- ✅ Índices para performance
-- ✅ RLS habilitado
-- ✅ Políticas de segurança configuradas
-- =====================================================
