/**
 * Componente: PasswordRequirements
 * Exibe requisitos de senha com feedback visual
 */

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { getPasswordRequirements } from '../../utils/validation';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements = getPasswordRequirements(password);

  const requirementsList = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: requirements.minLength },
    { key: 'hasUpperCase', label: 'Letra maiúscula', met: requirements.hasUpperCase },
    { key: 'hasLowerCase', label: 'Letra minúscula', met: requirements.hasLowerCase },
    { key: 'hasNumber', label: 'Número', met: requirements.hasNumber },
    { key: 'hasSpecialChar', label: 'Caractere especial (!@#$%...)', met: requirements.hasSpecialChar }
  ];

  if (!password) return null;

  return (
    <div style={{
      marginTop: '8px',
      padding: '16px',
      background: 'var(--card-bg-color)',
      borderRadius: '8px',
      fontSize: '0.875rem'
    }}>
      <div style={{ 
        marginBottom: '8px', 
        fontWeight: '600', 
        color: 'var(--primary-color)' 
      }}>
        Requisitos da senha:
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {requirementsList.map(req => (
          <div
            key={req.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: req.met ? '#4a920f' : 'var(--primary-color)',
              opacity: req.met ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}
          >
            {req.met ? <Check size={16} /> : <Circle size={16} />}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
