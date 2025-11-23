-- =====================================================
-- SCRIPT DE LIMPEZA - REMOVER TABELAS EXTRAS
-- Integra Recife - Plataforma de Eventos
-- Data: 24 de Outubro de 2025
-- =====================================================
-- 
-- OBJETIVO:
-- Remover tabelas e views que foram criadas por engano
-- durante a correção com IA do Supabase
-- 
-- IMPORTANTE:
-- Este script é SEGURO de executar. Ele só remove
-- objetos que NÃO são usados pelo sistema.
-- =====================================================

-- Mostrar tabelas ANTES da limpeza
SELECT 'TABELAS ANTES DA LIMPEZA:' as status;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_name;

-- =====================================================
-- REMOVER TABELA SUSPEITA #1: loja_chaves_d7c47b33
-- =====================================================
-- Esta tabela tem um nome com hash aleatório e não é
-- usada pelo sistema. Provavelmente é resto de migração.

DROP TABLE IF EXISTS loja_chaves_d7c47b33 CASCADE;

SELECT 'Tabela loja_chaves_d7c47b33 removida (se existia)' as status;

-- =====================================================
-- REMOVER TABELA/VIEW SUSPEITA #2: "Projetos criados"
-- =====================================================
-- Esta pode ser uma view ou tabela extra criada pela IA.
-- Vamos tentar remover como VIEW primeiro, depois como TABLE.

DROP VIEW IF EXISTS "Projetos criados" CASCADE;
DROP TABLE IF EXISTS "Projetos criados" CASCADE;

SELECT 'Tabela/View "Projetos criados" removida (se existia)' as status;

-- =====================================================
-- VERIFICAR OUTRAS TABELAS SUSPEITAS
-- =====================================================
-- Se houver outras tabelas com nomes estranhos, adicione aqui:

-- Exemplo:
-- DROP TABLE IF EXISTS nome_suspeito CASCADE;

-- =====================================================
-- MOSTRAR RESULTADO FINAL
-- =====================================================

SELECT 'TABELAS APÓS LIMPEZA:' as status;
SELECT table_name, table_type, 
       CASE 
         WHEN table_name IN (
           'usuarios', 'eventos', 'favoritos', 'avaliacoes',
           'projetos', 'membros_projeto', 'canais_chat',
           'mensagens_chat', 'notificacoes', 'inscricoes',
           'armazenamento_chave_valor'
         ) THEN '✅ ESSENCIAL'
         WHEN table_name IN ('estatisticas_eventos', 'projetos_com_equipe') THEN '✅ VIEW'
         ELSE '⚠️ VERIFICAR'
       END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
ORDER BY 
  CASE 
    WHEN table_name IN (
      'usuarios', 'eventos', 'favoritos', 'avaliacoes',
      'projetos', 'membros_projeto', 'canais_chat',
      'mensagens_chat', 'notificacoes', 'inscricoes',
      'armazenamento_chave_valor'
    ) THEN 1
    WHEN table_name IN ('estatisticas_eventos', 'projetos_com_equipe') THEN 2
    ELSE 3
  END,
  table_name;

-- =====================================================
-- CONTAGEM FINAL
-- =====================================================

SELECT 'VERIFICAÇÃO FINAL:' as status;

SELECT 
  'Tabelas principais' as tipo,
  COUNT(*) as total,
  CASE WHEN COUNT(*) = 11 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'usuarios', 'eventos', 'favoritos', 'avaliacoes',
    'projetos', 'membros_projeto', 'canais_chat',
    'mensagens_chat', 'notificacoes', 'inscricoes',
    'armazenamento_chave_valor'
  )

UNION ALL

SELECT 
  'Views' as tipo,
  COUNT(*) as total,
  CASE WHEN COUNT(*) = 2 THEN '✅ OK' ELSE '❌ ERRO' END as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('estatisticas_eventos', 'projetos_com_equipe');

-- =====================================================
-- VERIFICAR CANAIS PADRÃO
-- =====================================================

SELECT 'CANAIS DE CHAT PADRÃO:' as status;
SELECT id, nome, tipo, descricao 
FROM canais_chat 
ORDER BY criado_em;

-- Deve retornar 5 canais:
-- 1. geral
-- 2. festival-rec-beat
-- 3. projetos-culturais
-- 4. carnaval-olinda
-- 5. gastronomia

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ LIMPEZA CONCLUÍDA!' as status;
SELECT 'Verifique os resultados acima para confirmar que tudo está correto.' as mensagem;
