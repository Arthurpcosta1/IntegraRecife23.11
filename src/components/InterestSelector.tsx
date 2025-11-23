import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Check } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface InterestSelectorProps {
  userId: string;
  onClose: () => void;
  isRequired?: boolean;
  title?: string;
  description?: string;
}

const CATEGORIAS_DISPONIVEIS = [
  { id: 'Música', nome: 'Música', emoji: '🎵', cor: '#e48e2c' },
  { id: 'Teatro', nome: 'Teatro', emoji: '🎭', cor: '#b31a4d' },
  { id: 'Gastronomia', nome: 'Gastronomia', emoji: '🍽️', cor: '#4a920f' },
  { id: 'Festival', nome: 'Festival', emoji: '🎉', cor: '#582bac' },
  { id: 'Esportes', nome: 'Esportes', emoji: '⚽', cor: '#2c5aa0' },
  { id: 'Arte', nome: 'Arte', emoji: '🎨', cor: '#8e44ad' }
];

export const InterestSelector: React.FC<InterestSelectorProps> = ({ 
  userId, 
  onClose, 
  isRequired = false,
  title = 'Interesses e Notificações',
  description = 'Selecione as categorias de eventos que você gostaria de receber notificações'
}) => {
  const [interesses, setInteresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUserInterests();
  }, [userId]);

  const loadUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('interesses')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar interesses:', error);
        return;
      }

      if (data && data.interesses) {
        setInteresses(data.interesses);
      }
    } catch (error) {
      console.error('Erro ao carregar interesses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleInteresse = (categoria: string) => {
    setInteresses(prev => 
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleSave = async () => {
    if (interesses.length === 0) {
      toast.error('Selecione pelo menos um interesse');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          interesses,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar interesses:', error);
        toast.error('Erro ao salvar interesses');
        return;
      }

      toast.success('✅ Interesses salvos com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="modal-overlay" onClick={isRequired ? undefined : onClose}>
        <div className="modal-content interest-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={isRequired ? undefined : onClose}>
      <div className="modal-content interest-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <Bell size={24} className="modal-icon" />
            <h2>{title}</h2>
          </div>
          {!isRequired && (
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          )}
        </div>

        <div className="interest-modal-content">
          <p className="interest-description">
            {description}
          </p>
          
          <div className="interesses-grid">
            {CATEGORIAS_DISPONIVEIS.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={`interesse-card ${interesses.includes(categoria.id) ? 'selected' : ''}`}
                onClick={() => toggleInteresse(categoria.id)}
                style={{
                  borderColor: interesses.includes(categoria.id) ? categoria.cor : 'transparent',
                  backgroundColor: interesses.includes(categoria.id) ? `${categoria.cor}20` : 'transparent'
                }}
              >
                <span className="interesse-emoji">{categoria.emoji}</span>
                <span className="interesse-nome">{categoria.nome}</span>
                {interesses.includes(categoria.id) && (
                  <div className="interesse-check" style={{ backgroundColor: categoria.cor }}>
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {interesses.length > 0 && (
            <p className="selected-count">
              {interesses.length} {interesses.length === 1 ? 'interesse selecionado' : 'interesses selecionados'}
            </p>
          )}

          {isRequired && interesses.length === 0 && (
            <p className="warning-text">
              ⚠️ Você precisa selecionar pelo menos um interesse para continuar
            </p>
          )}
        </div>

        <div className="modal-actions">
          {!isRequired && (
            <button onClick={onClose} className="secondary-btn" disabled={loading}>
              Cancelar
            </button>
          )}
          <button onClick={handleSave} className="primary-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};