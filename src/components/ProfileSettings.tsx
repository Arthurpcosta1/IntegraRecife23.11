import React, { useState, useEffect } from 'react';
import { User, Camera, Save, X, Bell, Mail, Phone, Edit, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface ProfileSettingsProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
  onClose: () => void;
  onUpdate: (updatedUser: { name: string; avatar: string }) => void;
}

const CATEGORIAS_DISPONIVEIS = [
  { id: 'Música', nome: 'Música', emoji: '🎵', cor: '#e48e2c' },
  { id: 'Teatro', nome: 'Teatro', emoji: '🎭', cor: '#b31a4d' },
  { id: 'Gastronomia', nome: 'Gastronomia', emoji: '🍽️', cor: '#4a920f' },
  { id: 'Festival', nome: 'Festival', emoji: '🎉', cor: '#582bac' },
  { id: 'Esportes', nome: 'Esportes', emoji: '⚽', cor: '#2c5aa0' },
  { id: 'Arte', nome: 'Arte', emoji: '🎨', cor: '#8e44ad' }
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  currentUser, 
  onClose, 
  onUpdate 
}) => {
  const [nome, setNome] = useState(currentUser.name);
  const [fotoPerfil, setFotoPerfil] = useState(currentUser.avatar);
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [interesses, setInteresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [currentUser.id]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome, avatar, telefone, bio, interesses')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return;
      }

      if (data) {
        setNome(data.nome || currentUser.name);
        setFotoPerfil(data.avatar || currentUser.avatar);
        setTelefone(data.telefone || '');
        setBio(data.bio || '');
        setInteresses(data.interesses || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
    if (!nome.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    if (interesses.length === 0) {
      toast.error('Selecione pelo menos um interesse');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome,
          avatar: fotoPerfil,
          telefone: telefone || null,
          bio: bio || null,
          interesses,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil');
        return;
      }

      toast.success('✅ Perfil atualizado com sucesso!');
      onUpdate({ name: nome, avatar: fotoPerfil });
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content profile-settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configurações de Perfil</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="profile-settings-content">
          {/* Foto de Perfil */}
          <div className="profile-photo-section">
            <div className="photo-preview">
              <ImageWithFallback 
                src={fotoPerfil}
                alt={nome}
                className="profile-photo-large"
              />
            </div>
            <div className="photo-input-group">
              <label>URL da Foto de Perfil</label>
              <input
                type="url"
                value={fotoPerfil}
                onChange={(e) => setFotoPerfil(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="photo-input"
              />
              <p className="input-hint">
                Cole a URL de uma imagem (JPG, PNG, GIF)
              </p>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="form-section">
            <h3>Informações Básicas</h3>
            
            <div className="form-group">
              <label>
                <User size={18} />
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                E-mail
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="disabled-input"
              />
              <p className="input-hint">O e-mail não pode ser alterado</p>
            </div>

            <div className="form-group">
              <label>
                <Phone size={18} />
                Telefone (opcional)
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(81) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label>
                <Edit size={18} />
                Biografia (opcional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
                maxLength={200}
              />
              <p className="input-hint">{bio.length}/200 caracteres</p>
            </div>
          </div>

          {/* Interesses */}
          <div className="form-section">
            <h3>
              <Bell size={20} />
              Interesses e Notificações
            </h3>
            <p className="section-description">
              Selecione as categorias de eventos que você gostaria de receber notificações
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
          </div>

          {/* Botões de Ação */}
          <div className="modal-actions">
            <button onClick={onClose} className="secondary-btn" disabled={loading}>
              Cancelar
            </button>
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
    </div>
  );
};