import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Tour {
  id: number;
  title: string;
  description: string;
  duration: string;
  image: string;
  pointsOfInterest: number;
  views?: number;
  status?: string;
}

interface ToursScreenProps {
  tours: Tour[];
  onTourClick: (tourId: number) => void;
  currentUser: { id: string; type: string } | null;
  onToursUpdate: (tours: Tour[]) => void;
}

export const ToursScreen: React.FC<ToursScreenProps> = ({ 
  tours, 
  onTourClick, 
  currentUser,
  onToursUpdate 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTour, setNewTour] = useState({
    titulo: '',
    descricao: '',
    descricao_completa: '',
    duracao_estimada: '',
    imagem: ''
  });

  // Carregar roteiros do banco de dados
  useEffect(() => {
    loadToursFromDatabase();
  }, []);

  const loadToursFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .select('*, pontos_interesse(count)')
        .eq('status', 'publicado')
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao carregar roteiros:', error);
        return;
      }

      if (data) {
        const formattedTours = data.map((tour: any) => ({
          id: tour.id,
          title: tour.titulo,
          description: tour.descricao,
          duration: tour.duracao_estimada,
          image: tour.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          pointsOfInterest: tour.numero_pontos || 0,
          views: tour.visualizacoes || 0,
          status: tour.status
        }));
        
        onToursUpdate(formattedTours);
        console.log('✅ Roteiros carregados do banco:', formattedTours.length);
      }
    } catch (error) {
      console.error('Erro ao carregar roteiros:', error);
    }
  };

  const handleCreateTour = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para criar roteiros');
      return;
    }

    if (currentUser.type !== 'admin') {
      toast.error('Apenas administradores podem criar roteiros');
      return;
    }

    if (!newTour.titulo || !newTour.descricao || !newTour.duracao_estimada) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .insert([{
          titulo: newTour.titulo,
          descricao: newTour.descricao,
          descricao_completa: newTour.descricao_completa || newTour.descricao,
          duracao_estimada: newTour.duracao_estimada,
          imagem: newTour.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          status: 'publicado',
          usuario_criador: currentUser.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Roteiro criado com sucesso!');
      setShowCreateModal(false);
      setNewTour({
        titulo: '',
        descricao: '',
        descricao_completa: '',
        duracao_estimada: '',
        imagem: ''
      });

      // Recarregar roteiros
      await loadToursFromDatabase();
    } catch (error: any) {
      console.error('Erro ao criar roteiro:', error);
      toast.error('Erro ao criar roteiro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (tourId: number) => {
    try {
      await supabase.rpc('increment_tour_views', { tour_id: tourId });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  };

  const handleTourClick = async (tourId: number) => {
    await incrementViews(tourId);
    onTourClick(tourId);
  };

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tours-screen">
      <div className="screen-header">
        <div>
          <h1 className="screen-title">Roteiros Temáticos</h1>
          <p className="screen-subtitle">
            Explore a cidade de forma guiada com nossos roteiros especiais
          </p>
        </div>
        {currentUser && currentUser.type === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="create-tour-button"
            style={{
              background: 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(236, 72, 153, 0.35)';
            }}
          >
            <Plus size={20} />
            Criar Roteiro
          </button>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div className="search-bar mb-6">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar roteiros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Grid de Roteiros */}
      <div className="tours-grid">
        {filteredTours.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg opacity-60">
              {searchQuery ? 'Nenhum roteiro encontrado' : 'Nenhum roteiro disponível'}
            </p>
            {currentUser && currentUser.type === 'admin' && !searchQuery && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="mt-4"
                style={{
                  background: 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                  transition: 'all 0.3s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '600',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(236, 72, 153, 0.35)';
                }}
              >
                <Plus size={18} />
                Criar Primeiro Roteiro
              </button>
            )}
          </div>
        ) : (
          filteredTours.map((tour) => (
            <div 
              key={tour.id} 
              className="tour-card"
              onClick={() => handleTourClick(tour.id)}
            >
              <div className="tour-image-wrapper">
                <ImageWithFallback 
                  src={tour.image} 
                  alt={tour.title}
                  className="tour-image"
                />
                <div className="tour-badge">
                  <MapPin size={14} />
                  {tour.pointsOfInterest} pontos
                </div>
                {tour.views !== undefined && tour.views > 0 && (
                  <div className="tour-views-badge">
                    <Eye size={14} />
                    {tour.views}
                  </div>
                )}
              </div>
              <div className="tour-card-content">
                <h3 className="tour-title">{tour.title}</h3>
                <p className="tour-description">{tour.description}</p>
                <div className="tour-duration">
                  <Clock size={16} />
                  <span>Duração estimada: {tour.duration}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criar Roteiro */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={24} />
              Criar Novo Roteiro Turístico
            </DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um roteiro turístico personalizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título do Roteiro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Ex: Roteiro das Pontes do Recife"
                value={newTour.titulo}
                onChange={(e) => setNewTour({ ...newTour, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">
                Descrição Breve <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descrição curta que aparecerá no card do roteiro"
                value={newTour.descricao}
                onChange={(e) => setNewTour({ ...newTour, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao_completa">Descrição Completa</Label>
              <Textarea
                id="descricao_completa"
                placeholder="Descrição detalhada que aparecerá na página do roteiro"
                value={newTour.descricao_completa}
                onChange={(e) => setNewTour({ ...newTour, descricao_completa: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao">
                Duração Estimada <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duracao"
                placeholder="Ex: 2-3 horas"
                value={newTour.duracao_estimada}
                onChange={(e) => setNewTour({ ...newTour, duracao_estimada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem">URL da Imagem</Label>
              <Input
                id="imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                value={newTour.imagem}
                onChange={(e) => setNewTour({ ...newTour, imagem: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Deixe em branco para usar uma imagem padrão
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTour} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Roteiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};