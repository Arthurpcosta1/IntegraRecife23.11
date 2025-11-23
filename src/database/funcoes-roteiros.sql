-- =====================================================
-- FUNÇÕES E PROCEDURES PARA ROTEIROS TURÍSTICOS
-- =====================================================

-- Função para incrementar visualizações de roteiros
CREATE OR REPLACE FUNCTION increment_tour_views(tour_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE roteiros_turisticos
  SET visualizacoes = visualizacoes + 1
  WHERE id = tour_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION increment_tour_views IS 'Incrementa o contador de visualizações de um roteiro';

-- Função para obter estatísticas de roteiros
CREATE OR REPLACE FUNCTION get_tour_statistics()
RETURNS TABLE(
  total_roteiros BIGINT,
  total_pontos BIGINT,
  total_visualizacoes BIGINT,
  roteiro_mais_visto TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT rt.id)::BIGINT as total_roteiros,
    COUNT(pi.id)::BIGINT as total_pontos,
    COALESCE(SUM(rt.visualizacoes), 0)::BIGINT as total_visualizacoes,
    COALESCE((
      SELECT titulo 
      FROM roteiros_turisticos 
      WHERE status = 'publicado' 
      ORDER BY visualizacoes DESC 
      LIMIT 1
    ), 'N/A') as roteiro_mais_visto
  FROM roteiros_turisticos rt
  LEFT JOIN pontos_interesse pi ON pi.roteiro_id = rt.id
  WHERE rt.status = 'publicado';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION get_tour_statistics IS 'Retorna estatísticas gerais sobre roteiros turísticos';

-- Função para buscar roteiros com filtro
CREATE OR REPLACE FUNCTION search_tours(search_term TEXT)
RETURNS TABLE(
  id BIGINT,
  titulo TEXT,
  descricao TEXT,
  duracao_estimada TEXT,
  numero_pontos INTEGER,
  visualizacoes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.titulo,
    rt.descricao,
    rt.duracao_estimada,
    rt.numero_pontos,
    rt.visualizacoes
  FROM roteiros_turisticos rt
  WHERE rt.status = 'publicado'
    AND (
      rt.titulo ILIKE '%' || search_term || '%' 
      OR rt.descricao ILIKE '%' || search_term || '%'
    )
  ORDER BY rt.criado_em DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION search_tours IS 'Busca roteiros por título ou descrição';
