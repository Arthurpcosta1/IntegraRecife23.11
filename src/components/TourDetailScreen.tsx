import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Navigation, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface PointOfInterest {
  id: number;
  name: string;
  description: string;
  image: string;
  order: number;
  latitude?: number;
  longitude?: number;
  endereco?: string;
}

interface TourDetailScreenProps {
  tour: {
    id: number;
    title: string;
    duration: string;
    description: string;
    fullDescription?: string;
    points: PointOfInterest[];
  };
  onBack: () => void;
  currentUser: { id: string; type: string } | null;
  onPointsUpdate?: () => void;
}

export const TourDetailScreen: React.FC<TourDetailScreenProps> = ({ 
  tour, 
  onBack,
  currentUser,
  onPointsUpdate 
}) => {
  const [points, setPoints] = useState<PointOfInterest[]>(tour.points || []);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PointOfInterest | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [newPoint, setNewPoint] = useState({
    nome: '',
    descricao: '',
    imagem: '',
    endereco: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    loadPointsFromDatabase();
    checkOwnership();
  }, [tour.id]);

  const checkOwnership = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .select('usuario_criador')
        .eq('id', tour.id)
        .single();

      if (data) {
        setIsOwner(data.usuario_criador === currentUser.id);
      }
    } catch (error) {
      console.error('Erro ao verificar proprietário:', error);
    }
  };

  const loadPointsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('pontos_interesse')
        .select('*')
        .eq('roteiro_id', tour.id)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao carregar pontos:', error);
        return;
      }

      if (data) {
        const formattedPoints = data.map((point: any) => ({
          id: point.id,
          name: point.nome,
          description: point.descricao,
          image: point.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          order: point.ordem,
          latitude: point.latitude,
          longitude: point.longitude,
          endereco: point.endereco
        }));
        
        setPoints(formattedPoints);
      }
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
    }
  };

  const handleAddPoint = async () => {
    if (!currentUser || !isOwner) {
      toast.error('Você não tem permissão para adicionar pontos');
      return;
    }

    if (!newPoint.nome || !newPoint.descricao) {
      toast.error('Preencha o nome e a descrição do ponto');
      return;
    }

    setLoading(true);

    try {
      const nextOrder = points.length + 1;

      const { data, error } = await supabase
        .from('pontos_interesse')
        .insert([{
          roteiro_id: tour.id,
          nome: newPoint.nome,
          descricao: newPoint.descricao,
          imagem: newPoint.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          ordem: nextOrder,
          endereco: newPoint.endereco || null,
          latitude: newPoint.latitude ? parseFloat(newPoint.latitude) : null,
          longitude: newPoint.longitude ? parseFloat(newPoint.longitude) : null
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Ponto de interesse adicionado!');
      setShowAddPointModal(false);
      setNewPoint({
        nome: '',
        descricao: '',
        imagem: '',
        endereco: '',
        latitude: '',
        longitude: ''
      });

      // Recarregar pontos
      await loadPointsFromDatabase();
      if (onPointsUpdate) onPointsUpdate();
    } catch (error: any) {
      console.error('Erro ao adicionar ponto:', error);
      toast.error('Erro ao adicionar ponto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoint = async (pointId: number) => {
    if (!currentUser || !isOwner) {
      toast.error('Você não tem permissão para deletar pontos');
      return;
    }

    if (!confirm('Tem certeza que deseja deletar este ponto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pontos_interesse')
        .delete()
        .eq('id', pointId);

      if (error) throw error;

      toast.success('Ponto deletado com sucesso!');
      await loadPointsFromDatabase();
      if (onPointsUpdate) onPointsUpdate();
    } catch (error: any) {
      console.error('Erro ao deletar ponto:', error);
      toast.error('Erro ao deletar ponto: ' + error.message);
    }
  };

  return (
    <div className="detail-screen">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="detail-header">
        <h1 className="detail-title">{tour.title}</h1>
        <div className="tour-meta">
          <span>
            <Clock size={18} />
            {tour.duration}
          </span>
          <span>
            <MapPin size={18} />
            {points.length} pontos de interesse
          </span>
        </div>
      </div>

      <p className="detail-description">
        {tour.fullDescription || tour.description}
      </p>

      {/* Mapa Interativo Placeholder */}
      <div className="map-container">
        <div className="map-placeholder">
          <MapPin size={48} />
          <p>Mapa Interativo do Roteiro</p>
          <p className="map-subtext">Visualização dos {points.length} pontos de interesse</p>
        </div>
      </div>

      {/* Pontos de Interesse */}
      <div className="points-section">
        <div className="flex items-center justify-between mb-4">
          <h2>Pontos de Interesse</h2>
          {isOwner && (
            <Button onClick={() => setShowAddPointModal(true)} className="gap-2">
              <Plus size={18} />
              Adicionar Ponto
            </Button>
          )}
        </div>

        {points.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg opacity-60 mb-4">Nenhum ponto de interesse cadastrado</p>
            {isOwner && (
              <Button onClick={() => setShowAddPointModal(true)} className="gap-2">
                <Plus size={18} />
                Adicionar Primeiro Ponto
              </Button>
            )}
          </div>
        ) : (
          <div className="points-list">
            {points.map((point) => (
              <div key={point.id} className="point-item">
                <div className="point-number">{point.order}</div>
                <div className="point-image-wrapper">
                  <ImageWithFallback 
                    src={point.image} 
                    alt={point.name}
                    className="point-image"
                  />
                </div>
                <div className="point-content">
                  <h3 className="point-name">{point.name}</h3>
                  <p className="point-description">{point.description}</p>
                  {point.endereco && (
                    <p className="point-address">
                      <MapPin size={14} className="inline mr-1" />
                      {point.endereco}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <div className="point-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePoint(point.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-actions">
        <button className="primary-btn full-width">
          <Navigation size={20} />
          Iniciar Navegação
        </button>
      </div>

      {/* Modal de Adicionar Ponto */}
      <Dialog open={showAddPointModal} onOpenChange={setShowAddPointModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={24} />
              Adicionar Ponto de Interesse
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome do Ponto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Ponte Maurício de Nassau"
                value={newPoint.nome}
                onChange={(e) => setNewPoint({ ...newPoint, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descrição do ponto de interesse"
                value={newPoint.descricao}
                onChange={(e) => setNewPoint({ ...newPoint, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Ex: Av. Rio Branco, Recife Antigo"
                value={newPoint.endereco}
                onChange={(e) => setNewPoint({ ...newPoint, endereco: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="-8.063173"
                  value={newPoint.latitude}
                  onChange={(e) => setNewPoint({ ...newPoint, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="-34.871120"
                  value={newPoint.longitude}
                  onChange={(e) => setNewPoint({ ...newPoint, longitude: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem">URL da Imagem</Label>
              <Input
                id="imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                value={newPoint.imagem}
                onChange={(e) => setNewPoint({ ...newPoint, imagem: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Deixe em branco para usar uma imagem padrão
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPointModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPoint} disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Ponto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};