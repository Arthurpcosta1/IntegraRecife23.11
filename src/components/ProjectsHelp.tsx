import React from 'react';
import { Info, Calendar, Folder, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export const ProjectsHelp: React.FC = () => {
  return (
    <Alert className="mb-6" style={{ 
      background: 'rgba(33, 150, 243, 0.1)', 
      borderColor: '#2196f3' 
    }}>
      <Info className="h-4 w-4" style={{ color: '#2196f3' }} />
      <AlertTitle style={{ color: 'var(--primary-color)' }}>
        📚 Entendendo Eventos e Projetos
      </AlertTitle>
      <AlertDescription style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
        <div className="space-y-2 mt-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: '#e48e2c' }} />
            <p>
              <strong>Eventos</strong> são atividades pontuais (shows, festivais, teatro) 
              que você cria no <strong>Painel Admin → Aba Eventos</strong>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Folder className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: '#4a920f' }} />
            <p>
              <strong>Projetos</strong> são iniciativas maiores e contínuas 
              (revitalização de espaços, parcerias culturais) gerenciados aqui
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 p-2 rounded" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
            <span style={{ fontSize: '0.9rem' }}>
              💡 <strong>Dica:</strong> Se você criou um evento e ele não aparece aqui, 
              é porque eventos e projetos são módulos separados!
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
