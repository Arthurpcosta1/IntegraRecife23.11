-- =====================================================
-- ADICIONAR COLUNAS DE INTERESSES E FOTO_PERFIL
-- Versão Corrigida com Verificação
-- =====================================================

-- Passo 1: Verificar se as colunas já existem
DO $$ 
BEGIN
    -- Adicionar coluna interesses se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'interesses'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN interesses TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Coluna interesses adicionada com sucesso';
    ELSE
        RAISE NOTICE '⚠️ Coluna interesses já existe';
    END IF;

    -- Adicionar coluna foto_perfil se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'foto_perfil'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT DEFAULT 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400';
        RAISE NOTICE '✅ Coluna foto_perfil adicionada com sucesso';
    ELSE
        RAISE NOTICE '⚠️ Coluna foto_perfil já existe';
    END IF;
END $$;

-- Passo 2: Atualizar foto_perfil para quem tem avatar
UPDATE usuarios 
SET foto_perfil = COALESCE(avatar, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400')
WHERE foto_perfil IS NULL OR foto_perfil = '';

-- Passo 3: Criar índice GIN para busca eficiente por interesses
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_usuarios_interesses'
    ) THEN
        CREATE INDEX idx_usuarios_interesses ON usuarios USING GIN (interesses);
        RAISE NOTICE '✅ Índice idx_usuarios_interesses criado com sucesso';
    ELSE
        RAISE NOTICE '⚠️ Índice idx_usuarios_interesses já existe';
    END IF;
END $$;

-- Passo 4: Adicionar comentários de documentação
COMMENT ON COLUMN usuarios.interesses IS 'Categorias de eventos de interesse do usuário: Música, Teatro, Gastronomia, Festival, Esportes, Arte';
COMMENT ON COLUMN usuarios.foto_perfil IS 'URL da foto de perfil do usuário';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Contar usuários com interesses configurados
SELECT 
    'Total de usuários' as categoria,
    COUNT(*) as quantidade
FROM usuarios
UNION ALL
SELECT 
    'Com interesses configurados',
    COUNT(*)
FROM usuarios
WHERE interesses IS NOT NULL AND array_length(interesses, 1) > 0
UNION ALL
SELECT 
    'Com foto de perfil',
    COUNT(*)
FROM usuarios
WHERE foto_perfil IS NOT NULL AND foto_perfil != '';

-- =====================================================
-- EXEMPLOS DE USO
-- =====================================================

-- Exemplo 1: Atualizar interesses de um usuário específico
-- UPDATE usuarios 
-- SET interesses = ARRAY['Música', 'Teatro', 'Arte']
-- WHERE email = 'seu-email@example.com';

-- Exemplo 2: Buscar usuários interessados em Música
-- SELECT nome, email, interesses 
-- FROM usuarios 
-- WHERE 'Música' = ANY(interesses);

-- Exemplo 3: Buscar usuários com múltiplos interesses
-- SELECT nome, email, interesses 
-- FROM usuarios 
-- WHERE interesses @> ARRAY['Música', 'Teatro']::TEXT[];

-- Exemplo 4: Adicionar um novo interesse sem perder os existentes
-- UPDATE usuarios 
-- SET interesses = array_append(interesses, 'Gastronomia')
-- WHERE email = 'seu-email@example.com'
-- AND NOT ('Gastronomia' = ANY(interesses));

-- Exemplo 5: Remover um interesse
-- UPDATE usuarios 
-- SET interesses = array_remove(interesses, 'Arte')
-- WHERE email = 'seu-email@example.com';

-- Exemplo 6: Listar todas as categorias de interesse únicas
-- SELECT DISTINCT unnest(interesses) as categoria
-- FROM usuarios
-- WHERE interesses IS NOT NULL
-- ORDER BY categoria;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT '✅ Script executado com sucesso! Verifique os resultados acima.' as status;
