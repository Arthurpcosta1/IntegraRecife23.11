-- =====================================================
-- SCRIPT: Corrigir Políticas RLS da Tabela Inscricoes
-- Descrição: Implementa políticas de segurança mais restritivas
-- Data: Dezembro 2024
-- =====================================================

-- Ativar RLS na tabela (se ainda não estiver)
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Todos podem ler inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode criar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode cancelar inscricao" ON inscricoes;
DROP POLICY IF EXISTS "Usuario pode deletar inscricao" ON inscricoes;

-- =====================================================
-- NOVA POLÍTICA: Leitura
-- Usuário pode ver suas próprias inscrições
-- Admins podem ver todas as inscrições
-- =====================================================
CREATE POLICY "Usuario pode ver proprias inscricoes"
ON inscricoes FOR SELECT
USING (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo = 'admin'
  )
);

-- =====================================================
-- NOVA POLÍTICA: Inserção
-- Usuário pode criar inscrição apenas para si mesmo
-- =====================================================
CREATE POLICY "Usuario pode criar propria inscricao"
ON inscricoes FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- =====================================================
-- NOVA POLÍTICA: Atualização
-- Usuário pode atualizar suas próprias inscrições
-- (para mudar status, por exemplo)
-- =====================================================
CREATE POLICY "Usuario pode atualizar propria inscricao"
ON inscricoes FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- =====================================================
-- NOVA POLÍTICA: Deleção
-- Usuário pode deletar (cancelar) suas próprias inscrições
-- =====================================================
CREATE POLICY "Usuario pode deletar propria inscricao"
ON inscricoes FOR DELETE
USING (usuario_id = auth.uid());

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename = 'inscricoes'
ORDER BY policyname;

-- =====================================================
-- TESTE DAS POLÍTICAS (COMENTADO)
-- Execute estes comandos manualmente para testar
-- =====================================================

/*
-- 1. Verificar se RLS está ativo
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'inscricoes';

-- 2. Testar inserção (deve funcionar apenas se usuario_id = auth.uid())
INSERT INTO inscricoes (usuario_id, evento_id) 
VALUES (auth.uid(), 'uuid-do-evento');

-- 3. Testar leitura (deve retornar apenas as próprias inscrições)
SELECT * FROM inscricoes;

-- 4. Testar deleção (deve funcionar apenas para próprias inscrições)
DELETE FROM inscricoes WHERE id = 'uuid-da-inscricao';
*/
