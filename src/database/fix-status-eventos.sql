-- =====================================================
-- FIX: STATUS DE EVENTOS - Adicionar 'inativo' e automatizar
-- Descrição: Corrige constraint e adiciona automação
-- =====================================================

-- =====================================================
-- PASSO 1: Remover constraint antiga
-- =====================================================
ALTER TABLE eventos 
  DROP CONSTRAINT IF EXISTS eventos_status_check;

-- =====================================================
-- PASSO 2: Adicionar constraint nova (com 'inativo')
-- =====================================================
ALTER TABLE eventos
  ADD CONSTRAINT eventos_status_check 
  CHECK (status IN ('ativo', 'inativo', 'cancelado', 'concluido', 'adiado'));

-- =====================================================
-- PASSO 3: Atualizar eventos que já passaram
-- =====================================================
-- Marcar como 'concluido' eventos cuja data já passou
UPDATE eventos
SET 
  status = 'concluido',
  atualizado_em = NOW()
WHERE 
  data_inicio < NOW()
  AND status = 'ativo';

-- =====================================================
-- PASSO 4: Criar função para atualizar status automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_status_eventos()
RETURNS void AS $$
BEGIN
  -- Marcar eventos passados como 'concluido'
  UPDATE eventos
  SET 
    status = 'concluido',
    atualizado_em = NOW()
  WHERE 
    data_inicio < NOW()
    AND status = 'ativo';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASSO 5: Criar trigger para executar automaticamente
-- (Opcional - executa a cada INSERT/UPDATE)
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_atualizar_status_eventos()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a data do evento já passou e status é 'ativo', mudar para 'concluido'
  IF NEW.data_inicio < NOW() AND NEW.status = 'ativo' THEN
    NEW.status = 'concluido';
    NEW.atualizado_em = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_status_eventos ON eventos;
CREATE TRIGGER trigger_status_eventos
  BEFORE INSERT OR UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_status_eventos();

-- =====================================================
-- PASSO 6: Verificação
-- =====================================================
-- Ver quantos eventos foram atualizados
SELECT 
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE data_inicio < NOW()) as eventos_passados
FROM eventos
GROUP BY status;

-- Ver eventos concluídos recentemente
SELECT 
  id,
  titulo,
  data_inicio,
  status,
  atualizado_em
FROM eventos
WHERE status = 'concluido'
ORDER BY data_inicio DESC
LIMIT 10;

-- =====================================================
-- ✅ PRONTO! 
-- =====================================================
-- Agora você pode:
-- 1. Usar status 'inativo' manualmente
-- 2. Eventos antigos são marcados como 'concluido' automaticamente
-- 3. Trigger previne eventos passados de ficarem 'ativo'
-- 
-- Para rodar manualmente a atualização de status:
-- SELECT atualizar_status_eventos();
-- =====================================================
