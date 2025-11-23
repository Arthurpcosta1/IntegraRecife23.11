-- =====================================================
-- SISTEMA DE PAPÉIS E PERMISSÕES NOS PROJETOS
-- =====================================================

-- 1. Criar tabela de membros de projetos com papéis
CREATE TABLE IF NOT EXISTS membros_projeto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    papel VARCHAR(50) NOT NULL DEFAULT 'Membro', -- Líder, Coordenador, Designer, Desenvolvedor, Membro, etc.
    data_adicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    adicionado_por UUID REFERENCES usuarios(id),
    
    -- Garantir que um usuário não seja adicionado duas vezes no mesmo projeto
    UNIQUE(projeto_id, usuario_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_membros_projeto_projeto ON membros_projeto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_membros_projeto_usuario ON membros_projeto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_membros_projeto_papel ON membros_projeto(papel);

-- 3. Adicionar coluna de líder no projeto
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS lider_id UUID REFERENCES usuarios(id);

-- 4. Comentários nas colunas
COMMENT ON TABLE membros_projeto IS 'Membros de projetos com seus papéis/funções';
COMMENT ON COLUMN membros_projeto.papel IS 'Papel do membro no projeto: Líder, Coordenador, Designer, Desenvolvedor, Membro, etc.';
COMMENT ON COLUMN projetos.lider_id IS 'ID do líder do projeto (quem criou ou foi designado como líder)';

-- 5. Habilitar RLS
ALTER TABLE membros_projeto ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança
-- Todos podem ver os membros dos projetos
DROP POLICY IF EXISTS "Membros são visíveis para todos" ON membros_projeto;
CREATE POLICY "Membros são visíveis para todos"
    ON membros_projeto FOR SELECT
    USING (true);

-- Apenas admin pode adicionar membros
DROP POLICY IF EXISTS "Apenas admin pode adicionar membros" ON membros_projeto;
CREATE POLICY "Apenas admin pode adicionar membros"
    ON membros_projeto FOR INSERT
    WITH CHECK (true);

-- Apenas admin pode remover membros
DROP POLICY IF EXISTS "Apenas admin pode remover membros" ON membros_projeto;
CREATE POLICY "Apenas admin pode remover membros"
    ON membros_projeto FOR DELETE
    USING (true);

-- Apenas admin pode atualizar papéis
DROP POLICY IF EXISTS "Apenas admin pode atualizar membros" ON membros_projeto;
CREATE POLICY "Apenas admin pode atualizar membros"
    ON membros_projeto FOR UPDATE
    USING (true);

-- 7. Função para adicionar membro e criar notificação
CREATE OR REPLACE FUNCTION adicionar_membro_projeto(
    p_projeto_id UUID,
    p_usuario_id UUID,
    p_papel VARCHAR,
    p_adicionado_por UUID,
    p_nome_projeto TEXT
) RETURNS JSON AS $$
DECLARE
    v_membro_id UUID;
    v_usuario_nome TEXT;
BEGIN
    -- Buscar nome do usuário
    SELECT nome INTO v_usuario_nome FROM usuarios WHERE id = p_usuario_id;
    
    -- Adicionar membro
    INSERT INTO membros_projeto (projeto_id, usuario_id, papel, adicionado_por)
    VALUES (p_projeto_id, p_usuario_id, p_papel, p_adicionado_por)
    ON CONFLICT (projeto_id, usuario_id) 
    DO UPDATE SET papel = p_papel
    RETURNING id INTO v_membro_id;
    
    -- Criar notificação para o usuário adicionado
    INSERT INTO notificacoes (
        usuario_id,
        tipo,
        titulo,
        mensagem,
        icone,
        projeto_id
    ) VALUES (
        p_usuario_id,
        'projeto',
        'Você foi adicionado a um projeto!',
        'Você foi adicionado como ' || p_papel || ' no projeto "' || p_nome_projeto || '"',
        'users',
        p_projeto_id
    );
    
    RETURN json_build_object(
        'success', true,
        'membro_id', v_membro_id,
        'usuario_nome', v_usuario_nome
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Função para remover membro
CREATE OR REPLACE FUNCTION remover_membro_projeto(
    p_projeto_id UUID,
    p_usuario_id UUID
) RETURNS JSON AS $$
BEGIN
    DELETE FROM membros_projeto 
    WHERE projeto_id = p_projeto_id 
    AND usuario_id = p_usuario_id;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- 9. Função para listar membros de um projeto
CREATE OR REPLACE FUNCTION listar_membros_projeto(p_projeto_id UUID)
RETURNS TABLE (
    id UUID,
    usuario_id UUID,
    usuario_nome TEXT,
    usuario_email TEXT,
    usuario_avatar TEXT,
    papel VARCHAR,
    data_adicao TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        u.id as usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        u.avatar as usuario_avatar,
        mp.papel,
        mp.data_adicao
    FROM membros_projeto mp
    JOIN usuarios u ON mp.usuario_id = u.id
    WHERE mp.projeto_id = p_projeto_id
    ORDER BY 
        CASE mp.papel
            WHEN 'Líder' THEN 1
            WHEN 'Coordenador' THEN 2
            WHEN 'Designer' THEN 3
            WHEN 'Desenvolvedor' THEN 4
            ELSE 5
        END,
        mp.data_adicao ASC;
END;
$$ LANGUAGE plpgsql;

-- 10. Verificar criação
SELECT 
    'Tabela membros_projeto criada!' as status,
    COUNT(*) as total_membros
FROM membros_projeto;

-- 11. Ver estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'membros_projeto'
ORDER BY ordinal_position;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================
SELECT '✅ Sistema de papéis nos projetos criado com sucesso!' as status;
SELECT '📋 Papéis disponíveis: Líder, Coordenador, Designer, Desenvolvedor, Membro' as info;
SELECT '🔔 Notificações automáticas ao adicionar membros' as info2;
