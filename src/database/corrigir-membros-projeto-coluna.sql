-- =====================================================
-- CORREÇÃO: Adicionar coluna adicionado_por em membros_projeto
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
    'Verificando tabela membros_projeto...' as status;

-- 2. Ver estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- 3. Adicionar coluna adicionado_por se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'membros_projeto' 
        AND column_name = 'adicionado_por'
    ) THEN
        ALTER TABLE membros_projeto 
        ADD COLUMN adicionado_por UUID REFERENCES usuarios(id);
        
        RAISE NOTICE '✅ Coluna adicionado_por adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  Coluna adicionado_por já existe!';
    END IF;
END $$;

-- 4. Verificar estrutura após correção
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- 5. Mensagem final
SELECT '✅ Correção aplicada! A coluna adicionado_por agora está disponível.' as resultado;
