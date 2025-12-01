import React, { useState } from 'react';
import { Heart, Calendar, Bell, Settings as SettingsIcon, User, Edit2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileSettings } from './ProfileSettings';

interface ProfileEvent {
  id: number;
  title: string;
  date: string;
  image: string;
  hasRated?: boolean;
}

interface ProfileScreenProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
  favoriteEvents: ProfileEvent[];
  pastEvents: ProfileEvent[];
  onEventClick: (eventId: number) => void;
  onRateEvent: (eventId: number) => void;
  onUpdateUser: (updatedUser: { name: string; avatar: string }) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  favoriteEvents, 
  pastEvents,
  onEventClick,
  onRateEvent,
  onUpdateUser
}) => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <>
      <div className="profile-screen">
        <div className="profile-header">
          <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
            <ImageWithFallback 
              src={user.avatar} 
              alt={user.name}
              className="profile-avatar"
            />
            <button 
              className="edit-avatar-btn"
              onClick={() => setShowSettings(true)}
              title="Editar perfil"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '36px',
                height: '36px',
                background: 'var(--accent-color)',
                border: '3px solid var(--bg-body)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
            >
              <Edit2 size={16} />
            </button>
          </div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-subtitle">Amante da cultura do Recife</p>
        </div>

      {/* Meus Eventos Favoritos */}
      <div className="profile-section">
        <div className="section-header">
          <Heart size={24} className="section-icon" />
          <h2>Meus Eventos Favoritos</h2>
        </div>
        <div className="profile-events-list">
          {favoriteEvents.length === 0 ? (
            <p className="empty-message">Você ainda não favoritou nenhum evento</p>
          ) : (
            favoriteEvents.map((event) => (
              <div 
                key={event.id} 
                className="profile-event-item"
                onClick={() => onEventClick(event.id)}
              >
                <ImageWithFallback 
                  src={event.image} 
                  alt={event.title}
                  className="profile-event-image"
                />
                <div className="profile-event-info">
                  <h3>{event.title}</h3>
                  <p>{event.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        className="secondary-btn full-width" 
        style={{ marginTop: '20px' }}
        onClick={() => setShowSettings(true)}
      >
        <SettingsIcon size={20} />
        Configurações e Interesses
      </button>
      </div>

      {showSettings && (
        <ProfileSettings
          currentUser={user}
          onClose={() => setShowSettings(false)}
          onUpdate={onUpdateUser}
        />
      )}
    </>
  );
};