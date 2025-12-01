/**
 * Custom Hook: useEvents
 * Gerencia estado e operações relacionadas a eventos
 */

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Event, EventFromDatabase } from '../types';
import { toast } from 'sonner@2.0.3';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: Error | null;
  loadEvents: () => Promise<void>;
  toggleLike: (eventId: number) => void;
  getFavoriteEvents: () => Event[];
}

/**
 * Converte evento do formato do banco para o formato da aplicação
 */
const formatEventFromDatabase = (dbEvent: EventFromDatabase): Event => {
  const eventDate = new Date(dbEvent.data_inicio);
  
  return {
    id: dbEvent.id,
    title: dbEvent.titulo,
    date: eventDate.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    time: eventDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    location: dbEvent.localizacao,
    image: dbEvent.imagem || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: dbEvent.categoria,
    categoryColor: dbEvent.cor_categoria || '#e48e2c',
    description: dbEvent.descricao,
    rating: 0,
    reviewCount: 0,
    liked: false
  };
};

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const formattedEvents = data.map(formatEventFromDatabase);
        setEvents(formattedEvents);
      } else {
        // Fallback para eventos mockados se o banco estiver vazio
        setEvents([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erro ao carregar eventos');
      setError(errorMessage);
      toast.error('Erro ao carregar eventos');
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (eventId: number) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId 
          ? { ...event, liked: !event.liked } 
          : event
      )
    );
  };

  const getFavoriteEvents = (): Event[] => {
    return events.filter(event => event.liked);
  };

  return {
    events,
    loading,
    error,
    loadEvents,
    toggleLike,
    getFavoriteEvents
  };
};
