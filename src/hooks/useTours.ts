/**
 * Custom Hook: useTours
 * Gerencia roteiros turísticos e pontos de interesse
 */

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Tour, TourPoint, TourFromDatabase } from '../types';
import { toast } from 'sonner@2.0.3';

interface UseToursReturn {
  tours: Tour[];
  loading: boolean;
  error: Error | null;
  loadTours: () => Promise<void>;
  loadTourPoints: (tourId: number) => Promise<TourPoint[]>;
}

const formatTourFromDatabase = (dbTour: TourFromDatabase): Tour => ({
  id: dbTour.id,
  title: dbTour.titulo,
  description: dbTour.descricao,
  fullDescription: dbTour.descricao_completa,
  duration: dbTour.duracao_estimada,
  image: dbTour.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
  pointsOfInterest: dbTour.numero_pontos || 0,
  views: dbTour.visualizacoes || 0,
  points: []
});

export const useTours = (): UseToursReturn => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('roteiros_turisticos')
        .select('*')
        .eq('status', 'publicado')
        .order('criado_em', { ascending: false });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const formattedTours = data.map(formatTourFromDatabase);
        setTours(formattedTours);
      } else {
        setTours([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erro ao carregar roteiros');
      setError(errorMessage);
      toast.error('Erro ao carregar roteiros turísticos');
      console.error('Erro ao carregar roteiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTourPoints = async (tourId: number): Promise<TourPoint[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('pontos_interesse')
        .select('*')
        .eq('roteiro_id', tourId)
        .order('ordem', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        return data.map(point => ({
          id: point.id,
          name: point.nome,
          description: point.descricao,
          image: point.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          order: point.ordem,
          latitude: point.latitude,
          longitude: point.longitude,
          endereco: point.endereco
        }));
      }

      return [];
    } catch (err) {
      console.error('Erro ao carregar pontos do roteiro:', err);
      toast.error('Erro ao carregar pontos de interesse');
      return [];
    }
  };

  return {
    tours,
    loading,
    error,
    loadTours,
    loadTourPoints
  };
};
