-- =====================================================
-- LIMPAR NOTIFICAÇÕES DUPLICADAS E ANTIGAS
-- =====================================================

-- Ver estatísticas antes de limpar
SELECT 
    'Total de notificações' as tipo,
    COUNT(*) as quantidade
FROM notificacoes
UNION ALL
SELECT 
    'Não lidas',
    COUNT(*)
FROM notificacoes
WHERE lida = false
UNION ALL
SELECT 
    'Lidas',
    COUNT(*)
FROM notificacoes
WHERE lida = true
UNION ALL
SELECT 
    'Mais de 30 dias',
    COUNT(*)
FROM notificacoes
WHERE criado_em < NOW() - INTERVAL '30 days';

-- =====================================================
-- OPÇÃO 1: Deletar notificações lidas com mais de 7 dias
-- =====================================================
DELETE FROM notificacoes
WHERE lida = true 
  AND criado_em < NOW() - INTERVAL '7 days';

-- =====================================================
-- OPÇÃO 2: Deletar notificações muito antigas (mais de 30 dias)
-- =====================================================
DELETE FROM notificacoes
WHERE criado_em < NOW() - INTERVAL '30 days';

-- =====================================================
-- OPÇÃO 3: Manter apenas as 100 notificações mais recentes por usuário
-- =====================================================
DELETE FROM notificacoes
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY criado_em DESC) as rn
        FROM notificacoes
    ) t
    WHERE rn > 100
);

-- =====================================================
-- DELETAR NOTIFICAÇÕES DUPLICADAS
-- Mantém apenas a mais recente de cada duplicata
-- =====================================================
DELETE FROM notificacoes a
USING notificacoes b
WHERE a.id < b.id
  AND a.usuario_id = b.usuario_id
  AND a.titulo = b.titulo
  AND a.mensagem = b.mensagem
  AND a.tipo = b.tipo
  AND ABS(EXTRACT(EPOCH FROM (a.criado_em - b.criado_em))) < 60; -- menos de 1 minuto de diferença

-- =====================================================
-- Ver estatísticas depois de limpar
-- =====================================================
SELECT 
    'Total de notificações' as tipo,
    COUNT(*) as quantidade
FROM notificacoes
UNION ALL
SELECT 
    'Não lidas',
    COUNT(*)
FROM notificacoes
WHERE lida = false
UNION ALL
SELECT 
    'Lidas',
    COUNT(*)
FROM notificacoes
WHERE lida = true;

-- =====================================================
-- Ver notificações recentes por usuário
-- =====================================================
SELECT 
    u.nome,
    u.email,
    COUNT(*) as total_notificacoes,
    COUNT(*) FILTER (WHERE n.lida = false) as nao_lidas
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
GROUP BY u.id, u.nome, u.email
ORDER BY total_notificacoes DESC;

-- =====================================================
-- CRIAR FUNÇÃO DE LIMPEZA AUTOMÁTICA (OPCIONAL)
-- =====================================================
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS void AS $$
BEGIN
    -- Deletar notificações lidas com mais de 7 dias
    DELETE FROM notificacoes
    WHERE lida = true 
      AND criado_em < NOW() - INTERVAL '7 days';
    
    -- Deletar notificações antigas (mais de 30 dias)
    DELETE FROM notificacoes
    WHERE criado_em < NOW() - INTERVAL '30 days';
    
    -- Manter apenas 100 notificações mais recentes por usuário
    DELETE FROM notificacoes
    WHERE id IN (
        SELECT id
        FROM (
            SELECT 
                id,
                ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY criado_em DESC) as rn
            FROM notificacoes
        ) t
        WHERE rn > 100
    );
    
    RAISE NOTICE 'Notificações antigas limpas com sucesso';
END;
$$ LANGUAGE plpgsql;

-- Executar limpeza
SELECT limpar_notificacoes_antigas();

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT '✅ Notificações duplicadas e antigas removidas!' as status;
