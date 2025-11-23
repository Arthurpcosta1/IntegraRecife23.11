-- =====================================================
-- FIX: Adicionar política DELETE para projetos
-- =====================================================
-- Execute este script no SQL Editor do Supabase

DROP POLICY IF EXISTS "Criador pode deletar projeto" ON projetos;
CREATE POLICY "Criador pode deletar projeto" 
  ON projetos FOR DELETE 
  USING (true);

-- Verificar políticas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename = 'projetos'
ORDER BY cmd;
