-- =====================================================
-- CORRIGIR TIPOS DE USUÁRIOS
-- =====================================================

-- 1. Ver tipos atuais
SELECT 
    tipo,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY tipo;

-- 2. Ver usuários com tipos inválidos
SELECT 
    id,
    email,
    nome,
    tipo
FROM usuarios
WHERE tipo NOT IN ('admin', 'cidadao') OR tipo IS NULL;

-- 3. CORRIGIR: Normalizar 'citizen' para 'cidadao'
UPDATE usuarios
SET tipo = 'cidadao'
WHERE LOWER(tipo) = 'citizen' OR tipo NOT IN ('admin', 'cidadao') OR tipo IS NULL;

-- 4. Verificar correção
SELECT 
    'Tipos após correção:' as info,
    tipo,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY tipo
ORDER BY tipo;

-- 5. Ver todos os usuários
SELECT 
    id,
    email,
    nome,
    tipo,
    TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as data_criacao
FROM usuarios
ORDER BY criado_em DESC;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT '✅ Tipos de usuário corrigidos! Todos devem estar como "admin" ou "cidadao".' as status;
