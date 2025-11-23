import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface RatingScreenProps {
  eventId: number;
  eventName: string;
  onClose: () => void;
  onSubmit: (eventId: number, rating: number, comment: string) => void;
}

export const RatingScreen: React.FC<RatingScreenProps> = ({ eventId, eventName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(eventId, rating, comment);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>O que você achou de</h2>
          <h1>{eventName}?</h1>
        </div>

        <div className="rating-section">
          <p className="rating-label">Sua avaliação</p>
          <div className="stars-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="star-btn"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={48} 
                  fill={(hoveredRating || rating) >= star ? '#ffd700' : 'none'}
                  stroke={(hoveredRating || rating) >= star ? '#ffd700' : '#ccc'}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rating-selected">
              {rating === 1 && 'Não gostei'}
              {rating === 2 && 'Poderia ser melhor'}
              {rating === 3 && 'Bom'}
              {rating === 4 && 'Muito bom'}
              {rating === 5 && 'Excelente!'}
            </p>
          )}
        </div>

        <div className="comment-section">
          <label htmlFor="comment">Escreva seu comentário (opcional)</label>
          <textarea
            id="comment"
            placeholder="Escreva seu comentário aqui..."
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button 
          className="primary-btn full-width"
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          Enviar Avaliação
        </button>
      </div>
    </div>
  );
};