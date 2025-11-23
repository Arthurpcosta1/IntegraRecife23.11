-- =====================================================
-- CORRIGIR COLUNA DE DATA NA TABELA membros_projeto
-- =====================================================

-- Este script verifica e corrige a coluna de data na tabela membros_projeto
-- A coluna pode ter diferentes nomes dependendo de quando foi criada

-- 1. Verificar estrutura atual
SELECT 
    'Estrutura atual da tabela membros_projeto:' as info;

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- 2. Adicionar coluna data_adicao se não existir
DO $$ 
BEGIN
    -- Verificar se data_adicao já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'membros_projeto' 
        AND column_name = 'data_adicao'
    ) THEN
        -- Verificar se existe adicionado_em para renomear
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'membros_projeto' 
            AND column_name = 'adicionado_em'
        ) THEN
            ALTER TABLE membros_projeto 
            RENAME COLUMN adicionado_em TO data_adicao;
            RAISE NOTICE '✅ Coluna adicionado_em renomeada para data_adicao!';
        
        -- Verificar se existe criado_em para renomear
        ELSIF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'membros_projeto' 
            AND column_name = 'criado_em'
        ) THEN
            ALTER TABLE membros_projeto 
            RENAME COLUMN criado_em TO data_adicao;
            RAISE NOTICE '✅ Coluna criado_em renomeada para data_adicao!';
        
        -- Se não existe nenhuma, criar nova
        ELSE
            ALTER TABLE membros_projeto 
            ADD COLUMN data_adicao TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE '✅ Coluna data_adicao criada!';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  Coluna data_adicao já existe!';
    END IF;
END $$;

-- 3. Verificar estrutura final
SELECT 
    '✅ Estrutura final da tabela membros_projeto:' as resultado;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- 4. Mensagem final
SELECT '✅ Correção aplicada! A coluna data_adicao está disponível.' as status;
