-- =====================================================
-- SCRIPT DE TESTE COMPLETO DO BANCO DE DADOS
-- Integra Recife - Plataforma de Eventos
-- Data: 24 de Outubro de 2025
-- =====================================================
-- 
-- OBJETIVO:
-- Testar todas as tabelas, views, índices e políticas
-- para garantir que tudo está funcionando corretamente
-- 
-- COMO USAR:
-- 1. Copie este script completo
-- 2. Cole no SQL Editor do Supabase
-- 3. Clique em RUN
-- 4. Verifique se todos os testes passaram (✅)
-- =====================================================

\echo '═══════════════════════════════════════════════════'
\echo '🧪 INICIANDO TESTES DO BANCO DE DADOS'
\echo '═══════════════════════════════════════════════════'
\echo ''

-- =====================================================
-- TESTE #1: VERIFICAR TABELAS PRINCIPAIS
-- =====================================================

\echo '📋 TESTE #1: Verificar se todas as 11 tabelas existem...'

SELECT 
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Esperado: 11, Encontrado: ' || COUNT(*)
  END as resultado,
  'Tabelas principais' as teste
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'usuarios', 'eventos', 'favoritos', 'avaliacoes',
    'projetos', 'membros_projeto', 'canais_chat',
    'mensagens_chat', 'notificacoes', 'inscricoes',
    'armazenamento_chave_valor'
  );

-- =====================================================
-- TESTE #2: VERIFICAR VIEWS
-- =====================================================

\echo '📊 TESTE #2: Verificar views de relatórios...'

SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Esperado: 2, Encontrado: ' || COUNT(*)
  END as resultado,
  'Views de relatórios' as teste
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('estatisticas_eventos', 'projetos_com_equipe');

-- =====================================================
-- TESTE #3: VERIFICAR CANAIS PADRÃO
-- =====================================================

\echo '💬 TESTE #3: Verificar canais de chat padrão...'

SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Esperado: 5, Encontrado: ' || COUNT(*) || ' canais'
  END as resultado,
  'Canais de chat padrão' as teste
FROM canais_chat;

-- Listar os canais criados
SELECT 'Canais existentes:' as info;
SELECT nome, tipo, descricao FROM canais_chat ORDER BY criado_em;

-- =====================================================
-- TESTE #4: VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- =====================================================

\echo '👤 TESTE #4: Verificar estrutura da tabela usuarios...'

SELECT 
  CASE 
    WHEN COUNT(*) >= 7 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Faltam colunas'
  END as resultado,
  'Estrutura tabela usuarios' as teste
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name IN ('id', 'email', 'nome', 'avatar', 'tipo', 'telefone', 'bio');

-- Verificar se o constraint de tipo está correto
SELECT 
  CASE 
    WHEN check_clause LIKE '%cidadao%' THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Tipo deve aceitar "cidadao"'
  END as resultado,
  'Constraint tipo usuarios' as teste
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%usuarios_tipo%';

-- =====================================================
-- TESTE #5: VERIFICAR RLS (Row Level Security)
-- =====================================================

\echo '🔒 TESTE #5: Verificar RLS ativo...'

SELECT 
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Nem todas as tabelas têm RLS ativo'
  END as resultado,
  'RLS ativo em todas as tabelas' as teste
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'usuarios', 'eventos', 'favoritos', 'avaliacoes',
    'projetos', 'membros_projeto', 'canais_chat',
    'mensagens_chat', 'notificacoes', 'inscricoes',
    'armazenamento_chave_valor'
  );

-- =====================================================
-- TESTE #6: VERIFICAR POLÍTICAS RLS
-- =====================================================

\echo '📜 TESTE #6: Verificar políticas RLS...'

SELECT 
  CASE 
    WHEN COUNT(*) >= 25 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Poucas políticas: ' || COUNT(*)
  END as resultado,
  'Políticas RLS criadas' as teste
FROM pg_policies
WHERE schemaname = 'public';

-- =====================================================
-- TESTE #7: VERIFICAR ÍNDICES
-- =====================================================

\echo '🔍 TESTE #7: Verificar índices criados...'

SELECT 
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Poucos índices: ' || COUNT(*)
  END as resultado,
  'Índices para performance' as teste
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND indexname LIKE 'idx_%';

-- =====================================================
-- TESTE #8: VERIFICAR TRIGGERS
-- =====================================================

\echo '⚡ TESTE #8: Verificar triggers de timestamp...'

SELECT 
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Poucos triggers: ' || COUNT(*)
  END as resultado,
  'Triggers de atualização' as teste
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_atualizar_%';

-- =====================================================
-- TESTE #9: VERIFICAR RELACIONAMENTOS (FOREIGN KEYS)
-- =====================================================

\echo '🔗 TESTE #9: Verificar relacionamentos entre tabelas...'

SELECT 
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASSOU'
    ELSE '⚠️ AVISO - Poucos relacionamentos: ' || COUNT(*)
  END as resultado,
  'Foreign Keys' as teste
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';

-- =====================================================
-- TESTE #10: VERIFICAR SE PODE INSERIR USUÁRIO
-- =====================================================

\echo '✍️ TESTE #10: Testar inserção de usuário...'

-- Tentar inserir usuário de teste (será revertido)
BEGIN;

INSERT INTO usuarios (email, nome, tipo) 
VALUES ('teste@exemplo.com', 'Usuário Teste', 'cidadao');

SELECT '✅ PASSOU - Inserção de cidadao funciona' as resultado, 'Insert usuarios tipo cidadao' as teste;

ROLLBACK;

-- Testar inserção de admin
BEGIN;

INSERT INTO usuarios (email, nome, tipo) 
VALUES ('admin@exemplo.com', 'Admin Teste', 'admin');

SELECT '✅ PASSOU - Inserção de admin funciona' as resultado, 'Insert usuarios tipo admin' as teste;

ROLLBACK;

-- =====================================================
-- TESTE #11: VERIFICAR SE PODE CRIAR EVENTO
-- =====================================================

\echo '📅 TESTE #11: Testar criação de evento...'

BEGIN;

INSERT INTO eventos (titulo, descricao, data_inicio, localizacao, categoria) 
VALUES (
  'Evento Teste',
  'Descrição do evento teste',
  NOW() + INTERVAL '1 day',
  'Recife Antigo',
  'Teste'
);

SELECT '✅ PASSOU - Criação de evento funciona' as resultado, 'Insert eventos' as teste;

ROLLBACK;

-- =====================================================
-- TESTE #12: VERIFICAR SE PODE CRIAR MENSAGEM CHAT
-- =====================================================

\echo '💬 TESTE #12: Testar criação de mensagem no chat...'

BEGIN;

-- Pegar o primeiro canal disponível
DO $$
DECLARE
  canal_id UUID;
  usuario_id UUID;
BEGIN
  SELECT id INTO canal_id FROM canais_chat LIMIT 1;
  
  -- Criar usuário temporário
  INSERT INTO usuarios (email, nome, tipo) 
  VALUES ('temp@exemplo.com', 'Temp', 'cidadao')
  RETURNING id INTO usuario_id;
  
  -- Criar mensagem
  INSERT INTO mensagens_chat (canal_id, usuario_id, usuario_nome, usuario_avatar, conteudo)
  VALUES (
    canal_id,
    usuario_id,
    'Temp',
    'https://example.com/avatar.png',
    'Mensagem de teste'
  );
  
  RAISE NOTICE '✅ PASSOU - Criação de mensagem funciona';
END $$;

ROLLBACK;

-- =====================================================
-- TESTE #13: VERIFICAR VIEW DE ESTATÍSTICAS
-- =====================================================

\echo '📈 TESTE #13: Testar view de estatísticas...'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM estatisticas_eventos LIMIT 1) OR 
         NOT EXISTS (SELECT 1 FROM eventos LIMIT 1) 
    THEN '✅ PASSOU - View funciona (ou sem dados)'
    ELSE '❌ FALHOU'
  END as resultado,
  'View estatisticas_eventos' as teste;

-- =====================================================
-- TESTE #14: VERIFICAR VIEW DE PROJETOS COM EQUIPE
-- =====================================================

\echo '👥 TESTE #14: Testar view de projetos com equipe...'

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM projetos_com_equipe LIMIT 1) OR 
         NOT EXISTS (SELECT 1 FROM projetos LIMIT 1) 
    THEN '✅ PASSOU - View funciona (ou sem dados)'
    ELSE '❌ FALHOU'
  END as resultado,
  'View projetos_com_equipe' as teste;

-- =====================================================
-- TESTE #15: LISTAR TABELAS EXTRAS/SUSPEITAS
-- =====================================================

\echo '🔍 TESTE #15: Procurar tabelas extras/suspeitas...'

SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_name IN (
      'usuarios', 'eventos', 'favoritos', 'avaliacoes',
      'projetos', 'membros_projeto', 'canais_chat',
      'mensagens_chat', 'notificacoes', 'inscricoes',
      'armazenamento_chave_valor'
    ) THEN '✅ ESSENCIAL'
    WHEN table_name IN ('estatisticas_eventos', 'projetos_com_equipe') THEN '✅ VIEW'
    ELSE '⚠️ EXTRA - Considere remover'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
ORDER BY status DESC, table_name;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

\echo ''
\echo '═══════════════════════════════════════════════════'
\echo '📊 RESUMO DOS TESTES'
\echo '═══════════════════════════════════════════════════'

SELECT 
  'ESTRUTURA' as categoria,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
  (SELECT COUNT(*) FROM information_schema.views 
   WHERE table_schema = 'public') as total_views,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as total_indices;

SELECT 
  'SEGURANÇA' as categoria,
  (SELECT COUNT(*) FROM pg_tables 
   WHERE schemaname = 'public' AND rowsecurity = true) as tabelas_com_rls,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public') as total_politicas;

SELECT 
  'DADOS' as categoria,
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM eventos) as total_eventos,
  (SELECT COUNT(*) FROM canais_chat) as total_canais,
  (SELECT COUNT(*) FROM mensagens_chat) as total_mensagens;

\echo ''
\echo '✅ TESTES CONCLUÍDOS!'
\echo ''
\echo 'Verifique os resultados acima:'
\echo '- ✅ = Teste passou'
\echo '- ⚠️ = Aviso (não crítico)'
\echo '- ❌ = Teste falhou (precisa correção)'
\echo ''
\echo 'Se houver tabelas EXTRAS, execute: limpar-tabelas-extras.sql'
\echo '═══════════════════════════════════════════════════'
