import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Share2, Star, ArrowLeft, Navigation } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { ShareEventDialog } from './ShareEventDialog';

interface EventDetailScreenProps {
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: string;
    categoryColor: string;
    description: string;
    rating: number;
    reviewCount: number;
  };
  onBack: () => void;
  onRate: (eventId: number, eventName: string) => void;
  onRatingAdded?: () => void; // Callback para recarregar avaliações
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ event, onBack, onRate, onRatingAdded }) => {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Carregar avaliações do banco de dados
  useEffect(() => {
    loadRatings();
  }, [event.id]);

  // Expor função para recarregar avaliações
  useEffect(() => {
    if (onRatingAdded) {
      // Adicionar listener global para recarregar quando uma avaliação for adicionada
      const handleReload = () => loadRatings();
      window.addEventListener('rating-added', handleReload);
      return () => window.removeEventListener('rating-added', handleReload);
    }
  }, [onRatingAdded]);

  const loadRatings = async () => {
    try {
      console.log('🔍 Carregando avaliações para evento:', event.id);
      
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('evento_id', event.id);

      if (error) {
        console.error('❌ Erro ao carregar avaliações:', error);
        setRating(event.rating || 0);
        setReviewCount(event.reviewCount || 0);
        return;
      }

      console.log('📊 Avaliações encontradas:', data?.length || 0);

      if (data && data.length > 0) {
        const totalNota = data.reduce((sum, av) => sum + av.nota, 0);
        const media = totalNota / data.length;
        console.log('⭐ Média calculada:', media, 'Total:', data.length);
        setRating(media);
        setReviewCount(data.length);
        setAvaliacoes(data);
      } else {
        console.log('ℹ️ Nenhuma avaliação encontrada, usando valores padrão');
        setRating(0);
        setReviewCount(0);
        setAvaliacoes([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
      setRating(0);
      setReviewCount(0);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={18} 
          fill={i <= rating ? '#ffd700' : 'none'}
          stroke={i <= rating ? '#ffd700' : '#ccc'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="detail-screen">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="detail-image-container">
        <ImageWithFallback 
          src={event.image} 
          alt={event.title}
          className="detail-image"
        />
      </div>

      <div className="detail-content">
        <div className="detail-header">
          <h1 className="detail-title">{event.title}</h1>
          <div className="detail-category" style={{ backgroundColor: event.categoryColor }}>
            {event.category}
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="info-item">
            <Calendar size={24} className="info-icon" />
            <div>
              <div className="info-label">Data</div>
              <div className="info-value">{event.date}</div>
            </div>
          </div>
          <div className="info-item">
            <Clock size={24} className="info-icon" />
            <div>
              <div className="info-label">Horário</div>
              <div className="info-value">{event.time}</div>
            </div>
          </div>
          <div className="info-item">
            <MapPin size={24} className="info-icon" />
            <div>
              <div className="info-label">Local</div>
              <div className="info-value">{event.location}</div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Descrição</h2>
          <p className="detail-description">{event.description}</p>
        </div>

        <div className="detail-section">
          <h2>Avaliações</h2>
          <div className="rating-container">
            <div className="stars-display">
              {renderStars(rating)}
            </div>
            <span className="rating-text">
              {reviewCount > 0 ? `${rating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'avaliação' : 'avaliações'})` : 'Sem avaliações ainda'}
            </span>
          </div>
          <button className="secondary-btn" onClick={() => onRate(event.id, event.title)}>
            {reviewCount > 0 ? 'Adicionar Avaliação' : 'Seja o Primeiro a Avaliar'}
          </button>
          
          {/* Lista de comentários */}
          {avaliacoes.length > 0 && avaliacoes.some(av => av.comentario) && (
            <div className="avaliacoes-list" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Comentários</h3>
              {avaliacoes.filter(av => av.comentario).map((av, index) => (
                <div key={index} className="avaliacao-item" style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {renderStars(av.nota)}
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-primary)' }}>{av.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button className="primary-btn">
            <Navigation size={20} />
            Como Chegar
          </button>
          <button className="primary-btn" onClick={() => setShowShareDialog(true)}>
            <Share2 size={20} />
            Compartilhar
          </button>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      <ShareEventDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        event={event}
      />
    </div>
  );
};