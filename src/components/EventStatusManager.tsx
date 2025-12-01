/**
 * =====================================================
 * COMPONENTE: Gerenciador de Status de Eventos
 * =====================================================
 * Componente invisível que atualiza automaticamente
 * o status de eventos que já passaram
 */

import { useEffect, useState } from 'react';
import { updateAllPastEventsStatus } from '../utils/eventStatusUpdater';
import { toast } from 'sonner';

interface EventStatusManagerProps {
  /** Se deve rodar ao montar o componente */
  runOnMount?: boolean;
  /** Intervalo de atualização automática em minutos (0 = desabilitado) */
  autoUpdateInterval?: number;
  /** Se deve mostrar notificações toast */
  showToasts?: boolean;
}

export const EventStatusManager: React.FC<EventStatusManagerProps> = ({
  runOnMount = true,
  autoUpdateInterval = 0,
  showToasts = false
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updatedCount, setUpdatedCount] = useState<number>(0);

  const runUpdate = async (isAutomatic = false) => {
    try {
      console.log('🔄 Verificando eventos passados...');
      const count = await updateAllPastEventsStatus();
      
      setLastUpdate(new Date());
      setUpdatedCount(count);

      if (count > 0) {
        console.log(`✅ ${count} eventos atualizados para 'concluido'`);
        if (showToasts) {
          toast.success(`${count} evento(s) marcado(s) como concluído`, {
            description: isAutomatic ? 'Atualização automática' : undefined
          });
        }
      } else {
        console.log('✓ Nenhum evento precisou ser atualizado');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status de eventos:', error);
      if (showToasts) {
        toast.error('Erro ao atualizar eventos', {
          description: 'Verifique o console para mais detalhes'
        });
      }
    }
  };

  // Rodar ao montar
  useEffect(() => {
    if (runOnMount) {
      runUpdate(false);
    }
  }, [runOnMount]);

  // Atualização automática
  useEffect(() => {
    if (autoUpdateInterval > 0) {
      const intervalMs = autoUpdateInterval * 60 * 1000;
      const interval = setInterval(() => {
        runUpdate(true);
      }, intervalMs);

      console.log(`⏰ Atualização automática configurada: a cada ${autoUpdateInterval} minutos`);

      return () => clearInterval(interval);
    }
  }, [autoUpdateInterval]);

  // Componente invisível - não renderiza nada
  return null;
};

/**
 * Hook customizado para usar o gerenciador de forma programática
 */
export const useEventStatusUpdater = () => {
  const updateNow = async () => {
    return await updateAllPastEventsStatus();
  };

  return { updateNow };
};
