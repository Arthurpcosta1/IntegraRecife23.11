import React, { useState } from 'react';
import { Plus, Folder, Users, Calendar, CheckCircle, Clock, AlertCircle, Search, Filter, MoreVertical } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planejamento' | 'em-andamento' | 'concluido' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta';
  startDate: string;
  endDate: string;
  budget: number;
  team: string[];
  progress: number;
  createdBy: string;
  createdAt: Date;
}

interface ProjectsModuleProps {
  currentUser: {
    id: string;
    name: string;
    type: 'admin' | 'cidadao';
  };
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ currentUser }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Festival de Música do Recife Antigo',
      description: 'Organização de festival cultural com múltiplos palcos e apresentações ao longo de 3 dias no bairro histórico.',
      category: 'Música',
      status: 'em-andamento',
      priority: 'alta',
      startDate: '2025-11-01',
      endDate: '2025-11-15',
      budget: 250000,
      team: ['João Silva', 'Maria Santos', 'Pedro Costa'],
      progress: 65,
      createdBy: 'Admin Principal',
      createdAt: new Date(2025, 9, 1)
    },
    {
      id: '2',
      title: 'Revitalização do Paço do Frevo',
      description: 'Projeto de modernização e expansão do espaço cultural dedicado ao frevo pernambucano.',
      category: 'Infraestrutura',
      status: 'planejamento',
      priority: 'media',
      startDate: '2026-01-10',
      endDate: '2026-06-30',
      budget: 500000,
      team: ['Ana Lima', 'Carlos Mendes'],
      progress: 15,
      createdBy: 'Secretaria de Cultura',
      createdAt: new Date(2025, 9, 10)
    },
    {
      id: '3',
      title: 'Workshop de Gastronomia Nordestina',
      description: 'Série de workshops gratuitos ensinando pratos típicos da culinária pernambucana.',
      category: 'Gastronomia',
      status: 'em-andamento',
      priority: 'baixa',
      startDate: '2025-10-20',
      endDate: '2025-12-20',
      budget: 50000,
      team: ['Juliana Chef', 'Roberto Alves'],
      progress: 80,
      createdBy: 'Associação de Chefs',
      createdAt: new Date(2025, 8, 15)
    },
    {
      id: '4',
      title: 'Exposição de Arte Contemporânea',
      description: 'Curadoria e montagem de exposição com artistas locais no Museu de Arte Moderna.',
      category: 'Arte',
      status: 'concluido',
      priority: 'media',
      startDate: '2025-08-01',
      endDate: '2025-09-30',
      budget: 120000,
      team: ['Fernanda Artista', 'Lucas Curador', 'Beatriz Designer'],
      progress: 100,
      createdBy: 'Museu MAM',
      createdAt: new Date(2025, 7, 1)
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Música',
    status: 'planejamento' as Project['status'],
    priority: 'media' as Project['priority'],
    startDate: '',
    endDate: '',
    budget: '',
    team: ''
  });

  const categories = ['Música', 'Teatro', 'Gastronomia', 'Arte', 'Infraestrutura', 'Educação', 'Turismo'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: Number(formData.budget),
      team: formData.team.split(',').map(t => t.trim()),
      progress: 0,
      createdBy: currentUser.name,
      createdAt: new Date()
    };

    setProjects(prev => [newProject, ...prev]);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      category: 'Música',
      status: 'planejamento',
      priority: 'media',
      startDate: '',
      endDate: '',
      budget: '',
      team: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'concluido': return '#4caf50';
      case 'em-andamento': return '#2196f3';
      case 'planejamento': return '#ff9800';
      case 'cancelado': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'concluido': return <CheckCircle size={18} />;
      case 'em-andamento': return <Clock size={18} />;
      case 'planejamento': return <AlertCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em-andamento': return 'Em Andamento';
      case 'planejamento': return 'Planejamento';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: projects.length,
    planejamento: projects.filter(p => p.status === 'planejamento').length,
    emAndamento: projects.filter(p => p.status === 'em-andamento').length,
    concluidos: projects.filter(p => p.status === 'concluido').length,
    orcamentoTotal: projects.reduce((acc, p) => acc + p.budget, 0)
  };

  if (currentUser.type !== 'admin') {
    return (
      <div className="access-denied">
        <AlertCircle size={64} />
        <h2>Acesso Negado</h2>
        <p>Apenas administradores podem acessar o módulo de projetos conjuntos.</p>
      </div>
    );
  }

  return (
    <div className="projects-module">
      <div className="projects-header">
        <div>
          <h1 className="screen-title">Projetos Conjuntos</h1>
          <p className="screen-subtitle">Gerencie projetos culturais e colaborativos da cidade</p>
        </div>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          Novo Projeto
        </button>
      </div>

      {/* Estatísticas */}
      <div className="projects-stats-grid">
        <div className="project-stat-card">
          <Folder size={24} className="stat-icon" style={{ color: '#2196f3' }} />
          <div>
            <p className="stat-label">Total de Projetos</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="project-stat-card">
          <AlertCircle size={24} className="stat-icon" style={{ color: '#ff9800' }} />
          <div>
            <p className="stat-label">Em Planejamento</p>
            <p className="stat-value">{stats.planejamento}</p>
          </div>
        </div>
        <div className="project-stat-card">
          <Clock size={24} className="stat-icon" style={{ color: '#2196f3' }} />
          <div>
            <p className="stat-label">Em Andamento</p>
            <p className="stat-value">{stats.emAndamento}</p>
          </div>
        </div>
        <div className="project-stat-card">
          <CheckCircle size={24} className="stat-icon" style={{ color: '#4caf50' }} />
          <div>
            <p className="stat-label">Concluídos</p>
            <p className="stat-value">{stats.concluidos}</p>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Projeto */}
      {showForm && (
        <div className="project-form-container">
          <div className="form-header">
            <h2>Criar Novo Projeto</h2>
          </div>
          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Título do Projeto *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Ex: Festival Cultural do Recife"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Descreva os objetivos e escopo do projeto..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Categoria *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridade *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Data de Início *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Data de Término *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Orçamento (R$) *</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  placeholder="50000"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="team">Equipe (separado por vírgulas)</label>
                <input
                  type="text"
                  id="team"
                  name="team"
                  placeholder="João Silva, Maria Santos, Pedro Costa"
                  value={formData.team}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                Criar Projeto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="projects-filters">
        <div className="search-project">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-status">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="em-andamento">Em Andamento</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-message">
            Nenhum projeto encontrado. Clique em "Novo Projeto" para começar!
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-title-section">
                  <h3>{project.title}</h3>
                  <span className="project-category-badge">{project.category}</span>
                </div>
                <button className="icon-btn">
                  <MoreVertical size={18} />
                </button>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-meta">
                <div className="project-meta-item">
                  <Calendar size={16} />
                  <span>{new Date(project.startDate).toLocaleDateString('pt-BR')} - {new Date(project.endDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="project-meta-item">
                  <Users size={16} />
                  <span>{project.team.length} membros</span>
                </div>
              </div>

              <div className="project-progress">
                <div className="progress-header">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="project-footer">
                <div className="project-status" style={{ color: getStatusColor(project.status) }}>
                  {getStatusIcon(project.status)}
                  <span>{getStatusLabel(project.status)}</span>
                </div>
                <div 
                  className="project-priority"
                  style={{ 
                    backgroundColor: `${getPriorityColor(project.priority)}20`,
                    color: getPriorityColor(project.priority)
                  }}
                >
                  Prioridade {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </div>
              </div>

              <div className="project-budget">
                Orçamento: R$ {project.budget.toLocaleString('pt-BR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
