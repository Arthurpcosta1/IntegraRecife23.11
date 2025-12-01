/**
 * =====================================================
 * UTILITÁRIO: Atualizador de Status de Eventos
 * =====================================================
 * Funções para verificar e atualizar status de eventos
 * baseado na data atual
 */

import { supabase } from './supabase/client';

/**
 * Tipos de status permitidos para eventos
 */
export type EventStatus = 'ativo' | 'inativo' | 'cancelado' | 'concluido' | 'adiado';

/**
 * Verifica se um evento já passou
 */
export const isEventPast = (eventDate: Date): boolean => {
  const now = new Date();
  return eventDate < now;
};

/**
 * Atualiza status de um evento específico se já passou
 */
export const updateEventStatusIfPast = async (eventId: number | string, eventDate: Date): Promise<boolean> => {
  try {
    // Verificar se o evento já passou
    if (!isEventPast(eventDate)) {
      console.log(`✓ Evento ${eventId} ainda não passou`);
      return false;
    }

    console.log(`⏰ Evento ${eventId} já passou, atualizando status...`);

    // Atualizar status para 'concluido'
    const { error } = await supabase
      .from('eventos')
      .update({ 
        status: 'concluido',
        atualizado_em: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('status', 'ativo'); // Só atualiza se estiver ativo

    if (error) {
      console.error('❌ Erro ao atualizar status do evento:', error);
      return false;
    }

    console.log(`✅ Status do evento ${eventId} atualizado para 'concluido'`);
    return true;

  } catch (error) {
    console.error('❌ Erro ao verificar/atualizar evento:', error);
    return false;
  }
};

/**
 * Atualiza status de todos os eventos que já passaram
 */
export const updateAllPastEventsStatus = async (): Promise<number> => {
  try {
    console.log('🔄 Iniciando atualização de eventos passados...');

    const now = new Date().toISOString();

    // Buscar eventos ativos que já passaram
    const { data: pastEvents, error: fetchError } = await supabase
      .from('eventos')
      .select('id, titulo, data_inicio')
      .eq('status', 'ativo')
      .lt('data_inicio', now);

    if (fetchError) {
      console.error('❌ Erro ao buscar eventos passados:', fetchError);
      return 0;
    }

    if (!pastEvents || pastEvents.length === 0) {
      console.log('✓ Nenhum evento passado encontrado');
      return 0;
    }

    console.log(`📊 Encontrados ${pastEvents.length} eventos passados`);

    // Atualizar todos de uma vez
    const { error: updateError } = await supabase
      .from('eventos')
      .update({ 
        status: 'concluido',
        atualizado_em: now
      })
      .eq('status', 'ativo')
      .lt('data_inicio', now);

    if (updateError) {
      console.error('❌ Erro ao atualizar eventos:', updateError);
      return 0;
    }

    console.log(`✅ ${pastEvents.length} eventos atualizados para 'concluido'`);
    return pastEvents.length;

  } catch (error) {
    console.error('❌ Erro ao atualizar eventos passados:', error);
    return 0;
  }
};

/**
 * Hook/Função para verificar status ao carregar eventos
 */
export const checkAndUpdateEventStatus = async (event: {
  id: number | string;
  data_inicio: string;
  status: string;
}): Promise<EventStatus> => {
  // Se o evento não está ativo, retornar status atual
  if (event.status !== 'ativo') {
    return event.status as EventStatus;
  }

  // Verificar se já passou
  const eventDate = new Date(event.data_inicio);
  const isPast = isEventPast(eventDate);

  if (isPast) {
    // Atualizar no banco (fire and forget)
    updateEventStatusIfPast(event.id, eventDate).catch(console.error);
    return 'concluido';
  }

  return 'ativo';
};

/**
 * Obter label em português para o status
 */
export const getStatusLabel = (status: EventStatus): string => {
  const labels: Record<EventStatus, string> = {
    'ativo': 'Ativo',
    'inativo': 'Inativo',
    'cancelado': 'Cancelado',
    'concluido': 'Concluído',
    'adiado': 'Adiado'
  };
  return labels[status] || status;
};

/**
 * Obter cor do badge para o status
 */
export const getStatusColor = (status: EventStatus): string => {
  const colors: Record<EventStatus, string> = {
    'ativo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'inativo': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'concluido': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'adiado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
