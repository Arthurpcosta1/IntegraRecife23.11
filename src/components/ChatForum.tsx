import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, Search, Pin, Paperclip, Smile, MoreVertical, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  canal_id: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_avatar: string;
  conteudo: string;
  criado_em: string;
  fixada?: boolean;
}

interface Channel {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'geral' | 'evento' | 'projeto';
}

interface ChatForumProps {
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const ChatForum: React.FC<ChatForumProps> = ({ currentUser }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar canais
  useEffect(() => {
    loadChannels();
  }, []);

  // Carregar mensagens quando mudar de canal
  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel.id);
    }
  }, [activeChannel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannels = async () => {
    try {
      // Tentar carregar do banco de dados
      const { data, error } = await supabase
        .from('canais_chat')
        .select('*')
        .order('criado_em', { ascending: true });

      if (error) {
        // Se der erro (tabela não existe), usar canais locais
        console.log('❌ Erro ao carregar canais:', error);
        toast.error('⚠️ Erro ao conectar com o banco de dados. Verifique a configuração.', {
          duration: 5000
        });
        loadLocalChannels();
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ Canais carregados do banco:', data.length);
        setChannels(data);
        setActiveChannel(data[0]);
        toast.success('🎉 Chat conectado ao banco de dados!', {
          duration: 3000
        });
      } else {
        // Se não houver canais no banco, criar os canais padrão
        console.log('⚠️ Nenhum canal encontrado. Criando canais padrão...');
        await createDefaultChannels();
      }
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      loadLocalChannels();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultChannels = async () => {
    try {
      // Criar canais padrão no banco
      const defaultChannels = [
        { nome: 'geral', descricao: 'Discussões gerais sobre eventos do Recife', tipo: 'geral' },
        { nome: 'festival-rec-beat', descricao: 'Tudo sobre o Festival Rec-Beat 2025', tipo: 'evento' },
        { nome: 'projetos-culturais', descricao: 'Discussões sobre projetos conjuntos', tipo: 'projeto' },
        { nome: 'carnaval-olinda', descricao: 'Planejamento e dicas para o Carnaval', tipo: 'evento' },
        { nome: 'gastronomia', descricao: 'Eventos gastronômicos e culinária', tipo: 'geral' }
      ];

      const { error } = await supabase
        .from('canais_chat')
        .insert(defaultChannels);

      if (error) {
        console.error('Erro ao criar canais padrão:', error);
        toast.error('Erro ao criar canais. Usando modo local.');
        loadLocalChannels();
      } else {
        console.log('✅ Canais padrão criados com sucesso!');
        // Recarregar canais do banco
        await loadChannels();
      }
    } catch (error) {
      console.error('Erro ao criar canais padrão:', error);
      loadLocalChannels();
    }
  };

  const loadLocalChannels = () => {
    const defaultChannels: Channel[] = [
      { id: 'local-1', nome: 'geral', descricao: 'Discussões gerais sobre eventos do Recife', tipo: 'geral' },
      { id: 'local-2', nome: 'festival-rec-beat', descricao: 'Tudo sobre o Festival Rec-Beat 2025', tipo: 'evento' },
      { id: 'local-3', nome: 'projetos-culturais', descricao: 'Discussões sobre projetos conjuntos', tipo: 'projeto' },
      { id: 'local-4', nome: 'carnaval-olinda', descricao: 'Planejamento e dicas para o Carnaval', tipo: 'evento' },
      { id: 'local-5', nome: 'gastronomia', descricao: 'Eventos gastronômicos e culinária', tipo: 'geral' }
    ];
    setChannels(defaultChannels);
    setActiveChannel(defaultChannels[0]);
  };

  const loadMessages = async (canalId: string) => {
    try {
      // Tentar carregar do banco
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('*')
        .eq('canal_id', canalId)
        .order('criado_em', { ascending: true });

      if (error) {
        // Se der erro, usar mensagens locais (localStorage)
        loadLocalMessages(canalId);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      loadLocalMessages(canalId);
    }
  };

  const loadLocalMessages = (canalId: string) => {
    const stored = localStorage.getItem(`chat_messages_${canalId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChannel || sending) return;

    // Verificar se está usando canais locais
    if (activeChannel.id.startsWith('local-')) {
      const newMessage: Message = {
        id: Date.now().toString(),
        canal_id: activeChannel.id,
        usuario_id: currentUser.id,
        usuario_nome: currentUser.name,
        usuario_avatar: currentUser.avatar,
        conteudo: messageInput.trim(),
        criado_em: new Date().toISOString(),
        fixada: false
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_messages_${activeChannel.id}`, JSON.stringify(updatedMessages));
      toast.warning('⚠️ Usando modo local. Configure o banco em "Config. Banco"');
      setMessageInput('');
      return;
    }

    setSending(true);
    try {
      // Tentar salvar no banco
      const { data, error } = await supabase
        .from('mensagens_chat')
        .insert({
          canal_id: activeChannel.id,
          usuario_id: currentUser.id,
          usuario_nome: currentUser.name,
          usuario_avatar: currentUser.avatar,
          conteudo: messageInput.trim(),
          fixada: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar mensagem:', error);
        toast.error(`Erro ao salvar: ${error.message}`, {
          duration: 5000
        });
      } else {
        console.log('✅ Mensagem salva com sucesso!', data);
        // Recarregar mensagens
        await loadMessages(activeChannel.id);
        toast.success('Mensagem enviada!');
      }

      setMessageInput('');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(`Erro: ${error?.message || 'Erro desconhecido'}`, {
        duration: 5000
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getChannelIcon = (tipo: Channel['tipo']) => {
    switch (tipo) {
      case 'projeto':
        return '📁';
      case 'evento':
        return '🎉';
      default:
        return '#';
    }
  };

  const channelMessages = messages.filter(m => m.canal_id === activeChannel?.id);
  const pinnedMessages = channelMessages.filter(m => m.fixada);

  if (loading) {
    return (
      <div className="chat-forum-container">
        <div className="empty-chat">
          <Loader2 size={48} className="animate-spin" />
          <p>Carregando chat...</p>
        </div>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className="chat-forum-container">
        <div className="empty-chat">
          <Hash size={64} />
          <p>Nenhum canal disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-forum-container">
      {/* Sidebar com Canais */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Fórum e Chat</h2>
          <p className="chat-subtitle">Conecte-se com a comunidade</p>
        </div>

        <div className="search-channels">
          <Search size={18} />
          <input 
            type="text"
            placeholder="Buscar canais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="channels-list">
          <h3 className="channels-section-title">CANAIS</h3>
          {channels
            .filter(c => c.nome.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${activeChannel?.id === channel.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel)}
              >
                <span className="channel-icon">{getChannelIcon(channel.tipo)}</span>
                <div className="channel-info">
                  <span className="channel-name">{channel.nome}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="chat-main">
        {/* Header do Canal */}
        <div className="chat-header">
          <div className="chat-channel-info">
            <h2>
              <span className="channel-hash">{getChannelIcon(activeChannel.tipo)}</span>
              {activeChannel.nome}
            </h2>
            <p>{activeChannel.descricao}</p>
          </div>
          <div className="chat-header-actions">
            <button className="icon-btn" title="Membros">
              <Users size={20} />
            </button>
            <button className="icon-btn" title="Mais opções">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Mensagens Fixadas */}
        {pinnedMessages.length > 0 && (
          <div className="pinned-messages">
            <Pin size={16} />
            <div className="pinned-content">
              {pinnedMessages.map(msg => (
                <div key={msg.id} className="pinned-message">
                  <strong>{msg.usuario_nome}:</strong> {msg.conteudo}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Mensagens */}
        <div className="messages-container">
          {channelMessages.length === 0 ? (
            <div className="empty-chat">
              <Hash size={64} />
              <h3>Bem-vindo ao #{activeChannel.nome}</h3>
              <p>Seja o primeiro a enviar uma mensagem neste canal!</p>
            </div>
          ) : (
            channelMessages.map(message => (
              <div key={message.id} className="message-item">
                <ImageWithFallback 
                  src={message.usuario_avatar}
                  alt={message.usuario_nome}
                  className="message-avatar"
                />
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-author">{message.usuario_nome}</span>
                    <span className="message-time">{formatTime(message.criado_em)}</span>
                  </div>
                  <div className="message-text">{message.conteudo}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <form className="message-input-container" onSubmit={handleSendMessage}>
          <div className="message-input-wrapper">
            <button type="button" className="message-action-btn" title="Anexar arquivo">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder={`Enviar mensagem em #${activeChannel.nome}`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="message-input"
              disabled={sending}
            />
            <button type="button" className="message-action-btn" title="Emoji">
              <Smile size={20} />
            </button>
            <button 
              type="submit" 
              className="send-message-btn"
              disabled={!messageInput.trim() || sending}
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};