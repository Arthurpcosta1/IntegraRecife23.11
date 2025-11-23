-- =====================================================
-- SCRIPT DE TESTE: Avaliações de Eventos
-- Plataforma Integra Recife
-- =====================================================
-- Este script adiciona algumas avaliações de teste
-- para verificar se o sistema está funcionando
-- =====================================================

-- IMPORTANTE: Substitua os UUIDs abaixo pelos IDs reais
-- de eventos e usuários do seu banco de dados

-- Para encontrar IDs de eventos:
-- SELECT id, titulo FROM eventos LIMIT 5;

-- Para encontrar IDs de usuários:
-- SELECT id, nome, email FROM usuarios LIMIT 5;

-- =====================================================
-- EXEMPLO DE INSERÇÃO DE AVALIAÇÕES
-- =====================================================

-- Você pode executar este comando para inserir avaliações de teste:
/*
INSERT INTO avaliacoes (evento_id, usuario_id, nota, comentario)
VALUES
  ('SEU_EVENTO_ID_AQUI', 'SEU_USUARIO_ID_AQUI', 5, 'Evento incrível! Amei a organização e o ambiente.'),
  ('SEU_EVENTO_ID_AQUI', 'OUTRO_USUARIO_ID_AQUI', 4, 'Muito bom, apenas o estacionamento estava lotado.'),
  ('SEU_EVENTO_ID_AQUI', 'MAIS_UM_USUARIO_ID_AQUI', 5, 'Experiência maravilhosa, recomendo muito!');
*/

-- =====================================================
-- CONSULTAS ÚTEIS PARA VERIFICAR AVALIAÇÕES
-- =====================================================

-- Ver todas as avaliações com informações de eventos e usuários
SELECT 
  a.id,
  a.nota,
  a.comentario,
  a.criado_em,
  e.titulo as evento,
  u.nome as usuario
FROM avaliacoes a
JOIN eventos e ON a.evento_id = e.id
JOIN usuarios u ON a.usuario_id = u.id
ORDER BY a.criado_em DESC;

-- Calcular média de avaliações por evento
SELECT 
  e.id,
  e.titulo,
  COUNT(a.id) as total_avaliacoes,
  ROUND(AVG(a.nota), 2) as media_avaliacoes
FROM eventos e
LEFT JOIN avaliacoes a ON e.id = a.evento_id
GROUP BY e.id, e.titulo
ORDER BY media_avaliacoes DESC NULLS LAST;

-- Ver eventos sem avaliações
SELECT 
  e.id,
  e.titulo,
  e.categoria,
  e.data_inicio
FROM eventos e
LEFT JOIN avaliacoes a ON e.id = a.evento_id
WHERE a.id IS NULL
ORDER BY e.data_inicio;

-- Ver comentários mais recentes
SELECT 
  e.titulo as evento,
  u.nome as usuario,
  a.nota,
  a.comentario,
  a.criado_em
FROM avaliacoes a
JOIN eventos e ON a.evento_id = e.id
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.comentario IS NOT NULL
  AND a.comentario != ''
ORDER BY a.criado_em DESC
LIMIT 10;
