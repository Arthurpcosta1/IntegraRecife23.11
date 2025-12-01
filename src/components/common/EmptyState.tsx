/**
 * Componente: EmptyState
 * Estado vazio com mensagem amigável
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--card-bg-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <Icon size={40} style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
      </div>
      
      <h3 style={{
        color: 'var(--primary-color)',
        fontSize: '1.25rem',
        fontWeight: '600',
        margin: 0
      }}>
        {title}
      </h3>
      
      {description && (
        <p style={{
          color: 'var(--primary-color)',
          opacity: 0.7,
          maxWidth: '400px',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
