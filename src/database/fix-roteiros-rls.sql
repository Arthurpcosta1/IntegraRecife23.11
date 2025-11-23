-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA ROTEIROS TURÍSTICOS
-- Remove políticas antigas e cria novas mais permissivas
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Todos podem visualizar roteiros publicados" ON roteiros_turisticos;
DROP POLICY IF EXISTS "Usuários autenticados podem criar roteiros" ON roteiros_turisticos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios roteiros" ON roteiros_turisticos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios roteiros" ON roteiros_turisticos;

DROP POLICY IF EXISTS "Todos podem visualizar pontos de interesse" ON pontos_interesse;
DROP POLICY IF EXISTS "Usuários podem criar pontos nos seus roteiros" ON pontos_interesse;
DROP POLICY IF EXISTS "Usuários podem atualizar pontos dos seus roteiros" ON pontos_interesse;
DROP POLICY IF EXISTS "Usuários podem deletar pontos dos seus roteiros" ON pontos_interesse;

-- 2. DESABILITAR RLS TEMPORARIAMENTE (para testes)
ALTER TABLE roteiros_turisticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_interesse DISABLE ROW LEVEL SECURITY;

-- OU SE PREFERIR MANTER RLS ATIVO COM POLÍTICAS MAIS PERMISSIVAS:

-- 3. CRIAR POLÍTICAS PERMISSIVAS (OPÇÃO ALTERNATIVA)
-- Descomente as linhas abaixo se quiser manter RLS ativo:

/*
-- Habilitar RLS novamente
ALTER TABLE roteiros_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_interesse ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para roteiros_turisticos
CREATE POLICY "Permitir leitura de roteiros publicados"
  ON roteiros_turisticos
  FOR SELECT
  USING (status = 'publicado');

CREATE POLICY "Permitir criação de roteiros"
  ON roteiros_turisticos
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de roteiros"
  ON roteiros_turisticos
  FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão de roteiros"
  ON roteiros_turisticos
  FOR DELETE
  USING (true);

-- Políticas permissivas para pontos_interesse
CREATE POLICY "Permitir leitura de pontos"
  ON pontos_interesse
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir criação de pontos"
  ON pontos_interesse
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de pontos"
  ON pontos_interesse
  FOR UPDATE
  USING (true);

CREATE POLICY "Permitir exclusão de pontos"
  ON pontos_interesse
  FOR DELETE
  USING (true);
*/

-- 4. VERIFICAÇÃO
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('roteiros_turisticos', 'pontos_interesse')
ORDER BY tablename, policyname;

-- 5. TESTAR INSERÇÃO
-- Execute este comando após aplicar o script acima para testar:
/*
INSERT INTO roteiros_turisticos (
  titulo, 
  descricao, 
  descricao_completa, 
  duracao_estimada, 
  imagem, 
  status, 
  usuario_criador
) VALUES (
  'Teste de Roteiro', 
  'Descrição teste', 
  'Descrição completa teste',
  '2 horas',
  'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
  'publicado',
  '00000000-0000-0000-0000-000000000000'
) RETURNING *;
*/
