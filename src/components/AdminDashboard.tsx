import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Clock, Image as ImageIcon, Tag, FileText, Users, LayoutDashboard, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  categoryColor: string;
  description: string;
  rating: number;
  reviewCount: number;
}

interface AdminDashboardProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id' | 'rating' | 'reviewCount'>) => void;
  onDeleteEvent: (eventId: number) => void;
  accessToken?: string;
}

type AdminTab = 'eventos' | 'usuarios';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, onAddEvent, onDeleteEvent, accessToken }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('eventos');
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    image: '',
    category: 'Música',
    description: ''
  });

  // Carregar eventos do banco ao montar
  useEffect(() => {
    loadEventsFromDatabase();
  }, []);

  const loadEventsFromDatabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao carregar eventos:', error);
        toast.error('Erro ao carregar eventos do banco');
      } else if (data) {
        setDbEvents(data);
        console.log('✅ Eventos carregados do banco:', data.length);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarNotificacoesParaInteressados = async (categoria: string, tituloEvento: string, eventoId: string) => {
    try {
      // Buscar usuários que têm interesse nesta categoria
      const { data: usuariosInteressados, error: queryError } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .contains('interesses', [categoria]);

      if (queryError) {
        console.error('Erro ao buscar usuários interessados:', queryError);
        return;
      }

      if (!usuariosInteressados || usuariosInteressados.length === 0) {
        console.log('ℹ️ Nenhum usuário interessado na categoria', categoria);
        return;
      }

      console.log(`📢 ${usuariosInteressados.length} usuários interessados em ${categoria}`);

      // Criar notificação para cada usuário interessado
      const notificacoes = usuariosInteressados.map(usuario => ({
        usuario_id: usuario.id,
        tipo: 'info',
        titulo: `Novo evento de ${categoria}!`,
        mensagem: `O evento "${tituloEvento}" foi adicionado ao calendário. Confira os detalhes!`,
        lida: false,
        link: `/evento/${eventoId}`
      }));

      const { error: insertError } = await supabase
        .from('notificacoes')
        .insert(notificacoes);

      if (insertError) {
        console.error('Erro ao criar notificações:', insertError);
      } else {
        console.log(`✅ ${notificacoes.length} notificações criadas com sucesso!`);
        toast.success(`📬 ${notificacoes.length} usuários foram notificados!`);
      }
    } catch (error) {
      console.error('Erro ao criar notificações:', error);
    }
  };

  const categories = [
    { name: 'Música', color: '#e48e2c' },
    { name: 'Teatro', color: '#b31a4d' },
    { name: 'Gastronomia', color: '#4a920f' },
    { name: 'Festival', color: '#582bac' },
    { name: 'Esportes', color: '#2c5aa0' },
    { name: 'Arte', color: '#8e44ad' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const selectedCategory = categories.find(c => c.name === formData.category);
    
    // Combinar data e hora no formato ISO
    const dateTimeStr = `${formData.date}T${formData.time}:00`;
    
    try {
      // Salvar no banco de dados
      const { data: dbEvent, error } = await supabase
        .from('eventos')
        .insert({
          titulo: formData.title,
          descricao: formData.description,
          data_inicio: dateTimeStr,
          data_fim: dateTimeStr,
          localizacao: formData.location,
          categoria: formData.category,
          cor_categoria: selectedCategory?.color || '#e48e2c',
          imagem: formData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          status: 'ativo',
          capacidade: 1000,
          preco: 0,
          destaque: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar evento:', error);
        toast.error('Erro ao salvar evento no banco de dados');
        return;
      }

      console.log('✅ Evento salvo no banco:', dbEvent);
      toast.success('Evento criado com sucesso!');

      // Criar notificações para usuários interessados
      await criarNotificacoesParaInteressados(formData.category, formData.title, dbEvent.id);

      // Recarregar eventos do banco
      await loadEventsFromDatabase();

      // Atualizar estado do App.tsx
      onAddEvent({
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        image: formData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        category: formData.category,
        categoryColor: selectedCategory?.color || '#e48e2c',
        description: formData.description,
        liked: false
      });

      // Reset form
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        image: '',
        category: 'Música',
        description: ''
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Abrir dialog de edição
  const handleEditEvent = async (eventId: number) => {
    try {
      const { data: event, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Erro ao buscar evento:', error);
        toast.error('Erro ao carregar dados do evento');
        return;
      }

      if (event) {
        // Extrair data e hora do campo data_inicio
        const dataInicio = new Date(event.data_inicio);
        const dateStr = dataInicio.toISOString().split('T')[0];
        const timeStr = dataInicio.toTimeString().substring(0, 5);

        setEditingEvent({
          ...event,
          dateStr,
          timeStr
        });
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      toast.error('Erro ao carregar evento');
    }
  };

  // Salvar edições do evento
  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      const selectedCategory = categories.find(c => c.name === editingEvent.categoria);
      const dateTimeStr = `${editingEvent.dateStr}T${editingEvent.timeStr}:00`;

      const { error } = await supabase
        .from('eventos')
        .update({
          titulo: editingEvent.titulo,
          descricao: editingEvent.descricao,
          data_inicio: dateTimeStr,
          data_fim: dateTimeStr,
          localizacao: editingEvent.localizacao,
          categoria: editingEvent.categoria,
          cor_categoria: selectedCategory?.color || editingEvent.cor_categoria,
          imagem: editingEvent.imagem,
          status: editingEvent.status || 'ativo',
          capacidade: editingEvent.capacidade || 1000,
          preco: editingEvent.preco || 0,
          destaque: editingEvent.destaque || false
        })
        .eq('id', editingEvent.id);

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        toast.error('Erro ao salvar alterações');
        return;
      }

      toast.success('Evento atualizado com sucesso!');
      setShowEditDialog(false);
      setEditingEvent(null);
      await loadEventsFromDatabase();

    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  // Deletar evento do banco
  const handleDeleteEventFromDB = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Erro ao deletar evento:', error);
        toast.error('Erro ao excluir evento');
        return;
      }

      toast.success('Evento excluído com sucesso!');
      await loadEventsFromDatabase();
      onDeleteEvent(eventId);

    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1 className="screen-title">Painel Administrativo</h1>
          <p className="screen-subtitle">Gerencie eventos, usuários e conteúdo da plataforma</p>
        </div>
        {activeTab === 'eventos' && (
          <button 
            className="primary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={20} />
            Novo Evento
          </button>
        )}
      </div>

      {/* Abas de Navegação */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'eventos' ? 'active' : ''}`}
          onClick={() => setActiveTab('eventos')}
        >
          <LayoutDashboard size={20} />
          Eventos
        </button>
        <button 
          className={`admin-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <Users size={20} />
          Usuários
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'usuarios' ? (
        accessToken ? (
          <UserManagement accessToken={accessToken} />
        ) : (
          <div className="empty-message">
            Faça login para gerenciar usuários.
          </div>
        )
      ) : (
        <div className="eventos-content">

      {/* Estatísticas */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(194, 33, 105, 0.1)' }}>
            <Calendar size={24} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="stat-content">
            <h3>Total de Eventos</h3>
            <p>{events.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(228, 142, 44, 0.1)' }}>
            <Tag size={24} style={{ color: '#e48e2c' }} />
          </div>
          <div className="stat-content">
            <h3>Categorias</h3>
            <p>{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Formulário de Criar Evento */}
      {showForm && (
        <div className="event-form-container">
          <div className="form-header">
            <h2>Criar Novo Evento</h2>
          </div>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">
                  <FileText size={18} />
                  Título do Evento *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Ex: Festival de Música do Recife"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  <Tag size={18} />
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={18} />
                  Local *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Ex: Teatro de Santa Isabel"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">
                  <Calendar size={18} />
                  Data *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">
                  <Clock size={18} />
                  Horário *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">
                <ImageIcon size={18} />
                URL da Imagem (opcional)
              </label>
              <input
                type="url"
                id="image"
                name="image"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <FileText size={18} />
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Descreva o evento em detalhes..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                Criar Evento
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Lista de Eventos */}
        <div className="admin-events-list">
          <div className="flex items-center justify-between mb-4">
            <h2>Eventos Criados</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEventsFromDatabase}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
          <div className="events-table">
            {loading ? (
              <div className="empty-message">
                <RefreshCw className="animate-spin h-6 w-6 mx-auto mb-2" />
                Carregando eventos...
              </div>
            ) : dbEvents.length === 0 ? (
              <div className="empty-message">
                Nenhum evento cadastrado ainda. Clique em "Novo Evento" para começar!
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Local</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dbEvents.map(event => (
                    <tr key={event.id}>
                      <td className="font-medium">{event.titulo}</td>
                      <td>
                        <span className="category-badge" style={{ backgroundColor: event.cor_categoria || '#e48e2c' }}>
                          {event.categoria}
                        </span>
                      </td>
                      <td>{new Date(event.data_inicio).toLocaleDateString('pt-BR')}</td>
                      <td>{event.localizacao}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event.id)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEventFromDB(event.id)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Dialog de Edição de Evento */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no evento publicado
            </DialogDescription>
          </DialogHeader>

          {editingEvent && (
            <div className="grid gap-4 py-4">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="edit-titulo">Título do Evento *</Label>
                <Input
                  id="edit-titulo"
                  value={editingEvent.titulo || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, titulo: e.target.value })}
                  placeholder="Ex: Festival de Música do Recife"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="edit-categoria">Categoria *</Label>
                <Select 
                  value={editingEvent.categoria} 
                  onValueChange={(value) => setEditingEvent({ ...editingEvent, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-data">Data *</Label>
                  <Input
                    id="edit-data"
                    type="date"
                    value={editingEvent.dateStr || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, dateStr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hora">Horário *</Label>
                  <Input
                    id="edit-hora"
                    type="time"
                    value={editingEvent.timeStr || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, timeStr: e.target.value })}
                  />
                </div>
              </div>

              {/* Local */}
              <div className="space-y-2">
                <Label htmlFor="edit-local">Local *</Label>
                <Input
                  id="edit-local"
                  value={editingEvent.localizacao || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, localizacao: e.target.value })}
                  placeholder="Ex: Teatro de Santa Isabel"
                />
              </div>

              {/* Imagem */}
              <div className="space-y-2">
                <Label htmlFor="edit-imagem">URL da Imagem</Label>
                <Input
                  id="edit-imagem"
                  type="url"
                  value={editingEvent.imagem || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, imagem: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {editingEvent.imagem && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img 
                      src={editingEvent.imagem} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição *</Label>
                <Textarea
                  id="edit-descricao"
                  value={editingEvent.descricao || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, descricao: e.target.value })}
                  placeholder="Descreva o evento em detalhes..."
                  rows={5}
                />
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacidade">Capacidade</Label>
                  <Input
                    id="edit-capacidade"
                    type="number"
                    value={editingEvent.capacidade || 0}
                    onChange={(e) => setEditingEvent({ ...editingEvent, capacidade: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-preco">Preço (R$)</Label>
                  <Input
                    id="edit-preco"
                    type="number"
                    step="0.01"
                    value={editingEvent.preco || 0}
                    onChange={(e) => setEditingEvent({ ...editingEvent, preco: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingEvent.status || 'ativo'} 
                    onValueChange={(value) => setEditingEvent({ ...editingEvent, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};