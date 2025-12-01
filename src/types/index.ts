/**
 * Tipos centralizados da aplicação Integra Recife
 * Mantém consistência e type-safety em toda a aplicação
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'cidadao';

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserRole;
  avatar?: string;
  accessToken?: string;
}

export interface UserProfile extends User {
  telefone?: string;
  bio?: string;
  interesses: string[];
  createdAt?: string;
}

// ============================================
// EVENT TYPES
// ============================================

export type EventCategory = 'Música' | 'Teatro' | 'Gastronomia' | 'Festival' | 'Esportes' | 'Arte';

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: EventCategory;
  categoryColor: string;
  description: string;
  rating: number;
  reviewCount: number;
  liked?: boolean;
}

export interface EventFromDatabase {
  id: number;
  titulo: string;
  data_inicio: string;
  localizacao: string;
  imagem: string;
  categoria: EventCategory;
  cor_categoria: string;
  descricao: string;
  criado_em?: string;
  criado_por?: string;
}

// ============================================
// RATING TYPES
// ============================================

export interface Rating {
  id: string;
  evento_id: number;
  usuario_id: string;
  nota: number;
  comentario?: string;
  criado_em: string;
  usuarios?: {
    nome: string;
  };
}

// ============================================
// TOUR TYPES
// ============================================

export interface TourPoint {
  id: number;
  name: string;
  description: string;
  image: string;
  order: number;
  latitude?: number;
  longitude?: number;
  endereco?: string;
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  fullDescription?: string;
  duration: string;
  image: string;
  pointsOfInterest: number;
  views?: number;
  points?: TourPoint[];
}

export interface TourFromDatabase {
  id: number;
  titulo: string;
  descricao: string;
  descricao_completa?: string;
  duracao_estimada: string;
  imagem: string;
  numero_pontos: number;
  visualizacoes: number;
  status: 'rascunho' | 'publicado';
  criado_em: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'info' | 'sucesso' | 'alerta' | 'erro';

export interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  criado_em: string;
  lida: boolean;
  link?: string;
  usuario_id: string;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'planejamento' | 'em_andamento' | 'concluido' | 'cancelado';
export type MemberRole = 'Coordenador' | 'Desenvolvedor' | 'Designer' | 'Membro' | string;

export interface ProjectMember {
  id: string;
  usuario_id: string;
  projeto_id: string;
  papel: MemberRole;
  adicionado_em: string;
  usuarios?: {
    nome: string;
    email: string;
    avatar?: string;
  };
}

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  status: ProjectStatus;
  criado_por: string;
  criado_em: string;
  atualizado_em?: string;
  membros?: ProjectMember[];
  recursos?: ProjectResource[];
}

export interface ProjectResource {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao?: string;
  tipo: 'documento' | 'link' | 'arquivo' | 'outro';
  url?: string;
  criado_em: string;
  criado_por: string;
}

// ============================================
// CHAT & FORUM TYPES
// ============================================

export interface ChatMessage {
  id: string;
  usuario_id: string;
  mensagem: string;
  criado_em: string;
  usuarios?: {
    nome: string;
    avatar?: string;
  };
}

// ============================================
// SCREEN TYPES
// ============================================

export type Screen = 
  | 'main' 
  | 'eventDetail' 
  | 'tours' 
  | 'tourDetail' 
  | 'profile' 
  | 'admin' 
  | 'chat' 
  | 'reports' 
  | 'projects' 
  | 'calendar' 
  | 'managerialReports';

// ============================================
// COMPONENT PROPS TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  name: string;
  type: UserRole;
  accessToken?: string;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}
