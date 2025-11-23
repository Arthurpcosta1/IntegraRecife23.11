-- =====================================================
-- CORREÇÃO DA FOREIGN KEY DOS ROTEIROS TURÍSTICOS
-- Corrige referência de auth.users para usuarios
-- =====================================================

-- 1. VERIFICAR A CONSTRAINT ATUAL
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'roteiros_turisticos';

-- 2. REMOVER A CONSTRAINT ANTIGA
-- (O nome exato da constraint pode variar, ajuste se necessário)
ALTER TABLE roteiros_turisticos 
  DROP CONSTRAINT IF EXISTS roteiros_turisticos_usuario_criador_fkey;

-- 3. ADICIONAR A NOVA CONSTRAINT CORRETA
ALTER TABLE roteiros_turisticos
  ADD CONSTRAINT roteiros_turisticos_usuario_criador_fkey 
  FOREIGN KEY (usuario_criador) 
  REFERENCES usuarios(id) 
  ON DELETE CASCADE;

-- 4. VERIFICAR SE FOI CORRIGIDO
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'roteiros_turisticos';

-- Resultado esperado:
-- constraint_name: roteiros_turisticos_usuario_criador_fkey
-- table_name: roteiros_turisticos
-- column_name: usuario_criador
-- foreign_table_name: usuarios ✅ (não auth.users)
-- foreign_column_name: id

-- 5. TESTE DE INSERÇÃO
-- Execute este comando para testar se está funcionando:
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
  'Roteiro de Teste FK', 
  'Testando a correção da foreign key',
  'Descrição completa do teste',
  '1 hora',
  'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
  'publicado',
  (SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1)
) RETURNING *;
*/

-- 6. LIMPAR TESTE (opcional)
-- DELETE FROM roteiros_turisticos WHERE titulo = 'Roteiro de Teste FK';
