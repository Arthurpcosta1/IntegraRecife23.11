-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA membros_projeto
-- =====================================================

-- 1. Ver todas as colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- 2. Ver todas as constraints e foreign keys
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'membros_projeto'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Ver alguns registros de exemplo
SELECT * FROM membros_projeto LIMIT 5;

-- 4. Contar registros
SELECT COUNT(*) as total_membros FROM membros_projeto;
