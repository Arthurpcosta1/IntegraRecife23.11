/**
 * Componente: LoadingSpinner
 * Indicador de carregamento reutilizável
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  fullScreen = false 
}) => {
  const spinnerSize = sizeMap[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 
        size={spinnerSize} 
        className="animate-spin" 
        style={{ color: 'var(--accent-color)' }}
      />
      {text && (
        <p style={{
          color: 'var(--primary-color)',
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-body)'
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};
