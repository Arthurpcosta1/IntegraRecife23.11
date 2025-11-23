import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Info, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';

interface Notification {
  id: string;
  tipo: 'info' | 'sucesso' | 'alerta' | 'erro';
  titulo: string;
  mensagem: string;
  criado_em: string;
  lida: boolean;
  link?: string;
}

interface NotificationSystemProps {
  currentUser: { id: string; name: string } | null;
}

// Mapear tipo do banco para o tipo da interface
const tipoMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  'info': 'info',
  'sucesso': 'success',
  'alerta': 'warning',
  'erro': 'error'
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.lida).length;

  // Carregar notificações do banco ao montar
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      // Configurar polling a cada 30 segundos
      const interval = setInterval(() => {
        loadNotificationsQuietly();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', currentUser.id)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationsQuietly = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', currentUser.id)
        .order('criado_em', { ascending: false });

      if (!error && data) {
        const previousUnread = notifications.filter(n => !n.lida).length;
        const newUnread = data.filter(n => !n.lida).length;
        
        setNotifications(data);
        
        // Mostrar toast apenas se houver novas notificações não lidas
        if (newUnread > previousUnread) {
          const newOnes = data.filter(n => !n.lida).slice(0, newUnread - previousUnread);
          if (newOnes.length > 0) {
            toast.info(`🔔 ${newOnes.length} nova${newOnes.length > 1 ? 's' : ''} notificação${newOnes.length > 1 ? 'ões' : ''}!`);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar como lida:', error);
        toast.error('Erro ao atualizar notificação');
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', currentUser.id)
        .eq('lida', false);

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        toast.error('Erro ao atualizar notificações');
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar notificação:', error);
        toast.error('Erro ao remover notificação');
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getIcon = (tipo: Notification['tipo']) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle size={20} className="notification-icon success" />;
      case 'alerta':
        return <AlertCircle size={20} className="notification-icon warning" />;
      case 'erro':
        return <AlertCircle size={20} className="notification-icon error" />;
      case 'info':
      default:
        return <Info size={20} className="notification-icon info" />;
    }
  };

  const formatTimestamp = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Data desconhecida';
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Agora mesmo';
      if (minutes < 60) return `${minutes} min atrás`;
      if (hours < 24) return `${hours}h atrás`;
      return `${days}d atrás`;
    } catch (error) {
      console.error('Erro ao formatar timestamp:', error);
      return 'Data inválida';
    }
  };

  return (
    <>
      {/* Botão de Notificações */}
      <button 
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Painel de Notificações */}
      {showPanel && (
        <>
          <div className="notification-overlay" onClick={() => setShowPanel(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <h2>Notificações</h2>
              <div className="notification-actions">
                <button onClick={loadNotifications} className="refresh-btn" title="Atualizar" disabled={loading}>
                  <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-read">
                    <Check size={16} />
                    Marcar todas como lidas
                  </button>
                )}
                <button onClick={() => setShowPanel(false)} className="close-panel">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={48} />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${notification.lida ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      {getIcon(notification.tipo)}
                      <div className="notification-text">
                        <h3>{notification.titulo}</h3>
                        <p>{notification.mensagem}</p>
                        <span className="notification-time">{formatTimestamp(notification.criado_em)}</span>
                      </div>
                    </div>
                    <div className="notification-item-actions">
                      {!notification.lida && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="mark-read-btn"
                          title="Marcar como lida"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="delete-notification-btn"
                        title="Remover"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};