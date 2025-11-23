import React from 'react';
import { Heart, Search, Filter, Calendar, Music, Theater, Utensils } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  categoryColor: string;
  liked: boolean;
}

interface MainScreenProps {
  events: Event[];
  onEventClick: (eventId: number) => void;
  onToggleLike: (eventId: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ 
  events, 
  onEventClick, 
  onToggleLike,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="main-screen">
      <div className="screen-header">
        <h1 className="screen-title">Integra Recife</h1>
        <p className="screen-subtitle">Descubra os melhores eventos e experiências da cidade</p>
      </div>

      {/* Barra de Busca */}
      <div className="search-section">
        <div className="search-box-large">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por eventos ou locais"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="quick-filters">
        <button className="filter-btn active">
          <Calendar size={16} />
          Hoje
        </button>
        <button className="filter-btn">
          <Calendar size={16} />
          Este Fim de Semana
        </button>
        <button className="filter-btn">
          <Music size={16} />
          Música
        </button>
        <button className="filter-btn">
          <Theater size={16} />
          Teatro
        </button>
        <button className="filter-btn">
          <Utensils size={16} />
          Gastronomia
        </button>
        <button className="filter-btn-advanced">
          <Filter size={16} />
          Filtros Avançados
        </button>
      </div>

      {/* Cards de Eventos */}
      <div className="events-grid">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="event-card-main"
            onClick={() => onEventClick(event.id)}
          >
            <div className="event-image-wrapper">
              <ImageWithFallback 
                src={event.image} 
                alt={event.title}
                className="event-image"
              />
              <button 
                className="favorite-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(event.id);
                }}
              >
                <Heart 
                  size={20} 
                  fill={event.liked ? '#ff4757' : 'none'}
                  stroke={event.liked ? '#ff4757' : '#fff'}
                />
              </button>
            </div>
            <div className="event-card-content">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-details">
                <div className="event-date">
                  <Calendar size={14} />
                  {event.date}
                </div>
                <div className="event-location">{event.location}</div>
              </div>
              <div className="event-category" style={{ backgroundColor: event.categoryColor }}>
                {event.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
