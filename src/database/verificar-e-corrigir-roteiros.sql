-- =====================================================
-- VERIFICAR E CORRIGIR ROTEIROS TURISTICOS
-- =====================================================

-- 1. Ver todos os roteiros e seus status
SELECT 
    id,
    titulo,
    status,
    usuario_criador,
    criado_em,
    numero_pontos
FROM roteiros_turisticos
ORDER BY criado_em DESC;

-- 2. Ver quantos roteiros existem por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM roteiros_turisticos
GROUP BY status;

-- 3. CORRIGIR: Publicar todos os roteiros que estão como 'rascunho' ou NULL
UPDATE roteiros_turisticos
SET status = 'publicado'
WHERE status IS NULL OR status = 'rascunho' OR status != 'publicado';

-- 4. Verificar novamente
SELECT 
    'Roteiros publicados:' as info,
    COUNT(*) as quantidade
FROM roteiros_turisticos
WHERE status = 'publicado';

-- 5. Ver detalhes dos roteiros publicados
SELECT 
    id,
    titulo,
    descricao,
    duracao_estimada,
    status,
    numero_pontos,
    TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as data_criacao
FROM roteiros_turisticos
WHERE status = 'publicado'
ORDER BY criado_em DESC;

-- 6. Verificar se existem pontos de interesse
SELECT 
    r.titulo as roteiro,
    COUNT(p.id) as qtd_pontos
FROM roteiros_turisticos r
LEFT JOIN pontos_interesse p ON p.roteiro_id = r.id
WHERE r.status = 'publicado'
GROUP BY r.id, r.titulo
ORDER BY r.titulo;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT '✅ Verificação completa! Todos os roteiros devem estar visíveis agora.' as status;
