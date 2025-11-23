-- =====================================================
-- VERIFICAÇÃO COMPLETA - SISTEMA DE ROTEIROS
-- Execute este script para diagnosticar problemas
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
SELECT 
  'Tabelas Existentes' as verificacao,
  table_name,
  CASE 
    WHEN table_name IN ('roteiros_turisticos', 'pontos_interesse') 
    THEN '✅' 
    ELSE '❌' 
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('roteiros_turisticos', 'pontos_interesse', 'usuarios');

-- 2. VERIFICAR RLS (Row Level Security)
SELECT 
  'Status RLS' as verificacao,
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ Desabilitado (correto)'
    WHEN rowsecurity = true THEN '⚠️ Habilitado (pode causar problemas)'
    ELSE '❌ Erro'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('roteiros_turisticos', 'pontos_interesse');

-- 3. VERIFICAR FOREIGN KEYS
SELECT 
  'Foreign Keys' as verificacao,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS tabela_referenciada,
  CASE 
    WHEN ccu.table_name = 'usuarios' THEN '✅ Correto'
    WHEN ccu.table_name = 'users' THEN '❌ Incorreto (deve ser usuarios)'
    ELSE '⚠️ Verificar'
  END as status
FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('roteiros_turisticos', 'pontos_interesse');

-- 4. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
  'Colunas - roteiros_turisticos' as verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'roteiros_turisticos'
ORDER BY ordinal_position;

-- 5. VERIFICAR SE HÁ USUÁRIOS NA TABELA
SELECT 
  'Usuários Cadastrados' as verificacao,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN tipo = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN tipo = 'cidadao' THEN 1 END) as cidadaos
FROM usuarios;

-- 6. VERIFICAR ROTEIROS EXISTENTES
SELECT 
  'Roteiros Cadastrados' as verificacao,
  COUNT(*) as total_roteiros,
  COUNT(CASE WHEN status = 'publicado' THEN 1 END) as publicados,
  COUNT(CASE WHEN status = 'rascunho' THEN 1 END) as rascunhos
FROM roteiros_turisticos;

-- 7. VERIFICAR POLÍTICAS RLS (se existirem)
SELECT 
  'Políticas RLS Ativas' as verificacao,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('roteiros_turisticos', 'pontos_interesse');

-- 8. TESTE DE PERMISSÕES - Simular Insert
-- (Apenas mostra o comando, não executa)
SELECT 
  'Teste de Insert' as verificacao,
  'Execute manualmente para testar:' as instrucao,
  $$
  INSERT INTO roteiros_turisticos (
    titulo, 
    descricao, 
    duracao_estimada, 
    status, 
    usuario_criador
  ) VALUES (
    'Teste de Permissões',
    'Verificando se consegue inserir',
    '1 hora',
    'publicado',
    (SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1)
  ) RETURNING id, titulo, status;
  $$ as comando_sql;

-- =====================================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- =====================================================

/*
✅ TUDO OK SE:
1. Tabelas existem: roteiros_turisticos, pontos_interesse, usuarios
2. RLS está desabilitado (rowsecurity = false)
3. Foreign key aponta para 'usuarios' (não 'users')
4. Existem usuários cadastrados
5. Não há políticas RLS ativas

⚠️ PROBLEMAS COMUNS:
- RLS habilitado → Execute: ALTER TABLE roteiros_turisticos DISABLE ROW LEVEL SECURITY;
- FK aponta para 'users' → Execute: /database/fix-roteiros-foreign-key.sql
- Sem usuários → Faça login na aplicação primeiro
- Políticas RLS ativas → Execute: DROP POLICY "nome_da_policy" ON roteiros_turisticos;

❌ ERROS CRÍTICOS:
- Tabelas não existem → Execute: /database/schema-roteiros.sql
- Tabela usuarios não existe → Execute: /database/schema-completo.sql
*/
