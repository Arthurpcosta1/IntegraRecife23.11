import React, { useState, useMemo } from 'react';
import { Heart, Search, Calendar, Music, Theater, Utensils } from 'lucide-react';
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
  // Estados para filtros
  const [activeFilter, setActiveFilter] = useState<string>('todos');

  // Função para verificar se um evento está "Este Fim de Semana"
  const isThisWeekend = (eventDateStr: string) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 6 = Sábado
    
    // Calcular o próximo sábado
    const daysUntilSaturday = currentDay === 6 ? 0 : (6 - currentDay + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    nextSaturday.setHours(0, 0, 0, 0);
    
    // Calcular o próximo domingo
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    nextSunday.setHours(23, 59, 59, 999);
    
    // Converter a data do evento para comparação
    // Formato esperado: "15 de Outubro, 2025"
    const months: { [key: string]: number } = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
      'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
      'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };
    
    const parts = eventDateStr.toLowerCase().replace(',', '').split(' de ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        const eventDate = new Date(year, month, day);
        return eventDate >= nextSaturday && eventDate <= nextSunday;
      }
    }
    
    return false;
  };

  // Função para verificar se evento é hoje
  const isToday = (eventDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const months: { [key: string]: number } = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
      'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
      'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };
    
    const parts = eventDateStr.toLowerCase().replace(',', '').split(' de ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        const eventDate = new Date(year, month, day);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      }
    }
    
    return false;
  };

  // Filtrar eventos baseado no filtro ativo
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Aplicar filtro de categoria ou data
    if (activeFilter === 'hoje') {
      filtered = filtered.filter(event => isToday(event.date));
    } else if (activeFilter === 'fim-de-semana') {
      filtered = filtered.filter(event => isThisWeekend(event.date));
    } else if (activeFilter === 'Música' || activeFilter === 'Teatro' || activeFilter === 'Gastronomia') {
      filtered = filtered.filter(event => event.category === activeFilter);
    }

    return filtered;
  }, [events, activeFilter]);

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
        <button 
          className={`filter-btn ${activeFilter === 'hoje' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'hoje' ? 'todos' : 'hoje')}
        >
          <Calendar size={16} />
          Hoje
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'fim-de-semana' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'fim-de-semana' ? 'todos' : 'fim-de-semana')}
        >
          <Calendar size={16} />
          Este Fim de Semana
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Música' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'Música' ? 'todos' : 'Música')}
        >
          <Music size={16} />
          Música
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Teatro' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'Teatro' ? 'todos' : 'Teatro')}
        >
          <Theater size={16} />
          Teatro
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'Gastronomia' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'Gastronomia' ? 'todos' : 'Gastronomia')}
        >
          <Utensils size={16} />
          Gastronomia
        </button>
      </div>

      {/* Cards de Eventos */}
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
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
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--secondary-color)'
          }}>
            <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>🔍 Nenhum evento encontrado</p>
            <p style={{ opacity: 0.7 }}>
              {activeFilter === 'hoje' && 'Não há eventos programados para hoje.'}
              {activeFilter === 'fim-de-semana' && 'Não há eventos programados para este fim de semana.'}
              {(activeFilter === 'Música' || activeFilter === 'Teatro' || activeFilter === 'Gastronomia') && 
                `Não há eventos de ${activeFilter} no momento.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};