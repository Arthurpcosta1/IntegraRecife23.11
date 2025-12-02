import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Share2, Star, ArrowLeft, Navigation, UserPlus, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { ShareEventDialog } from './ShareEventDialog';
import { toast } from 'sonner@2.0.3';

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
  userId?: string; // ID do usuário logado
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ event, onBack, onRate, onRatingAdded, userId }) => {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [userRating, setUserRating] = useState<{ nota: number; comentario: string | null } | null>(null);
  
  // Estados para inscrição
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Carregar avaliações do banco de dados
  useEffect(() => {
    loadRatings();
  }, [event.id]);

  // Verificar se usuário está inscrito no evento
  useEffect(() => {
    if (userId) {
      checkSubscription();
    } else {
      setIsLoadingSubscription(false);
    }
  }, [event.id, userId]);

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
        .select(`
          *,
          usuarios!avaliacoes_usuario_id_fkey (
            nome
          )
        `)
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

        // Verificar se o usuário atual já avaliou o evento
        if (userId) {
          const userAvaliacao = data.find(av => av.usuario_id === userId);
          if (userAvaliacao) {
            setUserHasRated(true);
            setUserRating({ nota: userAvaliacao.nota, comentario: userAvaliacao.comentario });
          }
        }
      } else {
        console.log('ℹ️ Nenhuma avaliação encontrada, usando valores padrão');
        setRating(0);
        setReviewCount(0);
        setAvaliacoes([]);
        setUserHasRated(false);
        setUserRating(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
      setRating(0);
      setReviewCount(0);
    }
  };

  const checkSubscription = async () => {
    try {
      console.log('🔍 Verificando inscrição para evento:', event.id);
      
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', event.id)
        .eq('usuario_id', userId);

      if (error) {
        console.error('❌ Erro ao verificar inscrição:', error);
        setIsSubscribed(false);
        setIsLoadingSubscription(false);
        return;
      }

      console.log('📊 Inscrições encontradas:', data?.length || 0);

      if (data && data.length > 0) {
        console.log('✅ Usuário está inscrito no evento');
        setIsSubscribed(true);
        setIsLoadingSubscription(false);
      } else {
        console.log('ℹ️ Usuário não está inscrito no evento');
        setIsSubscribed(false);
        setIsLoadingSubscription(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar inscrição:', error);
      setIsSubscribed(false);
      setIsLoadingSubscription(false);
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

  // Função para abrir Google Maps com a localização do evento
  const handleOpenMaps = () => {
    const address = encodeURIComponent(event.location + ', Recife, PE, Brasil');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
    toast.success('Abrindo Google Maps...');
  };

  // Função para inscrever-se/cancelar inscrição no evento (TOGGLE)
  const handleSubscribe = async () => {
    // Verificar se usuário está logado
    if (!userId) {
      toast.error('❌ Você precisa estar logado para se inscrever', {
        description: 'Faça login para continuar'
      });
      return;
    }

    setIsLoadingSubscription(true);

    try {
      if (!isSubscribed) {
        // ===================================
        // CASO 1: INSCREVER NO EVENTO
        // ===================================
        console.log('📝 Inscrevendo usuário no evento...');
        
        const { error } = await supabase
          .from('inscricoes')
          .insert({
            evento_id: event.id,
            usuario_id: userId
          });

        if (error) {
          // Verificar se já está inscrito (violação de constraint UNIQUE)
          if (error.code === '23505') {
            console.log('ℹ️ Usuário já estava inscrito, atualizando estado local');
            setIsSubscribed(true);
            toast.info('Você já está inscrito neste evento');
          } else {
            throw error;
          }
        } else {
          console.log('✅ Inscrição realizada com sucesso');
          setIsSubscribed(true);
          toast.success('✅ Inscrição confirmada!', {
            description: `Você está inscrito em ${event.title}`
          });
        }
      } else {
        // ===================================
        // CASO 2: CANCELAR INSCRIÇÃO
        // ===================================
        console.log('🗑️ Cancelando inscrição do evento...');
        
        const { error } = await supabase
          .from('inscricoes')
          .delete()
          .eq('evento_id', event.id)
          .eq('usuario_id', userId);

        if (error) {
          throw error;
        }

        console.log('✅ Inscrição cancelada com sucesso');
        setIsSubscribed(false);
        toast.success('Inscrição cancelada', {
          description: 'Você pode se inscrever novamente a qualquer momento'
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar inscrição:', error);
      toast.error('Erro ao processar inscrição', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setIsLoadingSubscription(false);
    }
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
          {userId ? (
            <button 
              className="secondary-btn" 
              onClick={() => onRate(event.id, event.title)}
              style={userHasRated ? {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none'
              } : undefined}
            >
              {userHasRated ? '✏️ Editar Minha Avaliação' : (reviewCount > 0 ? '⭐ Adicionar Avaliação' : '⭐ Seja o Primeiro a Avaliar')}
            </button>
          ) : (
            <p style={{ 
              padding: '12px', 
              background: 'var(--card-bg-color)', 
              borderRadius: '8px',
              textAlign: 'center',
              color: 'var(--primary-color)',
              opacity: 0.7
            }}>
              Faça login para avaliar este evento
            </p>
          )}
          
          {/* Lista de comentários */}
          {avaliacoes.length > 0 && avaliacoes.some(av => av.comentario) && (
            <div className="avaliacoes-list" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Comentários</h3>
              {avaliacoes.filter(av => av.comentario).map((av, index) => (
                <div key={index} className="avaliacao-item" style={{
                  padding: '15px',
                  backgroundColor: 'var(--card-bg-color)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '2px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'var(--accent-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {av.usuarios?.nome?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <strong style={{ color: 'var(--primary-color)' }}>
                        {av.usuarios?.nome || 'Usuário Anônimo'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {renderStars(av.nota)}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--primary-color)', opacity: 0.8, lineHeight: '1.5' }}>
                    {av.comentario}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button className="primary-btn" onClick={handleOpenMaps}>
            <Navigation size={20} />
            Como Chegar
          </button>
          <button className="primary-btn" onClick={() => setShowShareDialog(true)}>
            <Share2 size={20} />
            Compartilhar
          </button>
          <button 
            className={isSubscribed ? "primary-btn-subscribed" : "primary-btn"}
            onClick={handleSubscribe}
            disabled={isLoadingSubscription}
          >
            {isSubscribed ? <Check size={20} /> : <UserPlus size={20} />}
            {isLoadingSubscription ? 'Carregando...' : isSubscribed ? 'Inscrito ✅' : 'Inscrever-se'}
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