-- =====================================================
-- Adicionar campos de interesses e foto_perfil
-- na tabela usuarios
-- =====================================================

-- Adicionar campo de interesses (array de categorias)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS interesses TEXT[] DEFAULT '{}';

-- Adicionar campo foto_perfil (substitui avatar)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS foto_perfil TEXT DEFAULT 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400';

-- Comentários para documentação
COMMENT ON COLUMN usuarios.interesses IS 'Categorias de eventos de interesse do usuário: Música, Teatro, Gastronomia, Festival, Esportes, Arte';
COMMENT ON COLUMN usuarios.foto_perfil IS 'URL da foto de perfil do usuário';

-- Índice para melhorar performance de busca por interesses
CREATE INDEX IF NOT EXISTS idx_usuarios_interesses ON usuarios USING GIN (interesses);

-- Atualizar avatar existente para foto_perfil (migração)
UPDATE usuarios 
SET foto_perfil = COALESCE(avatar, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400')
WHERE foto_perfil IS NULL;

-- =====================================================
-- Exemplo de uso:
-- =====================================================
-- Inserir usuário com interesses:
-- INSERT INTO usuarios (email, nome, tipo, interesses)
-- VALUES ('user@example.com', 'João Silva', 'cidadao', ARRAY['Música', 'Festival', 'Arte']);

-- Buscar usuários interessados em Música:
-- SELECT * FROM usuarios WHERE 'Música' = ANY(interesses);

-- Atualizar interesses de um usuário:
-- UPDATE usuarios 
-- SET interesses = ARRAY['Música', 'Teatro', 'Gastronomia']
-- WHERE id = 'user_id_here';
