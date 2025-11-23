import React, { useState, useEffect } from 'react';
import { MainScreen } from './components/MainScreen';
import { EventDetailScreen } from './components/EventDetailScreen';
import { ToursScreen } from './components/ToursScreen';
import { TourDetailScreen } from './components/TourDetailScreen';
import { RatingScreen } from './components/RatingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatForum } from './components/ChatForum';
import { ProjectsModuleEnhanced } from './components/ProjectsModuleEnhanced';
import { NotificationSystem } from './components/NotificationSystem';
import { CalendarScreen } from './components/CalendarScreen';
import { ManagerialReports } from './components/ManagerialReports';
import { InterestSelector } from './components/InterestSelector';
import { Toaster } from './components/ui/sonner';
import { Calendar, MapPin, Heart, User, Menu, X, LogOut, Settings, MessageSquare, BarChart3, Folder, FileText } from 'lucide-react';
import { supabase } from './utils/supabase/client';
import { getOrCreateUUID } from './utils/uuid';

type Screen = 'main' | 'eventDetail' | 'tours' | 'tourDetail' | 'profile' | 'admin' | 'chat' | 'reports' | 'projects' | 'calendar' | 'managerialReports';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingEventName, setRatingEventName] = useState('');
  const [ratingEventId, setRatingEventId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [nextEventId, setNextEventId] = useState(5);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [needsInterests, setNeedsInterests] = useState(false);

  // Carregar eventos do banco de dados no início
  useEffect(() => {
    if (isAuthenticated && !eventsLoaded) {
      loadEventsFromDatabase();
    }
  }, [isAuthenticated]);

  const loadEventsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (data && data.length > 0) {
        console.log('✅ Eventos carregados do banco:', data.length);
        
        // Converter eventos do banco para o formato local
        const formattedEvents = data.map((dbEvent: any) => {
          const eventDate = new Date(dbEvent.data_inicio);
          return {
            id: dbEvent.id,
            title: dbEvent.titulo,
            date: eventDate.toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }).replace(' de ', ' de '),
            time: eventDate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            location: dbEvent.localizacao,
            image: dbEvent.imagem || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            category: dbEvent.categoria,
            categoryColor: dbEvent.cor_categoria || '#e48e2c',
            liked: false,
            description: dbEvent.descricao,
            rating: 0,
            reviewCount: 0
          };
        });
        
        // Atualizar o estado de eventos com os do banco
        setEvents(formattedEvents);
        setEventsLoaded(true);
        console.log('✅ Estado de eventos atualizado com dados do banco');
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Festival Rec-Beat 2025",
      date: "15 de Outubro, 2025",
      time: "18:00",
      location: "Cais da Alfândega",
      image: "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjAwMjAyODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Música",
      categoryColor: "#e48e2c",
      liked: false,
      description: "O maior festival de música independente do Nordeste retorna ao Recife! Três dias de shows com artistas nacionais e internacionais, food trucks e muito mais. Uma celebração da cultura musical brasileira no coração do Recife Antigo.",
      rating: 4.5,
      reviewCount: 328
    },
    {
      id: 2,
      title: "Teatro de Santa Isabel - Ariano Suassuna",
      date: "20 de Outubro, 2025",
      time: "20:30",
      location: "Teatro de Santa Isabel",
      image: "https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjAwMDM1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Teatro",
      categoryColor: "#b31a4d",
      liked: true,
      description: "Espetáculo emocionante baseado na obra do mestre Ariano Suassuna. Uma homenagem ao maior dramaturgo nordestino, apresentando elementos do teatro de cordel e da cultura popular brasileira.",
      rating: 5,
      reviewCount: 156
    },
    {
      id: 3,
      title: "Festival Gastronômico do Recife",
      date: "25 de Outubro, 2025",
      time: "17:00",
      location: "Parque Dona Lindu",
      image: "https://images.unsplash.com/photo-1742646802610-9d4c9628b793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZ2FzdHJvbm9teSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYwMDUzOTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Gastronomia",
      categoryColor: "#4a920f",
      liked: false,
      description: "Descubra os sabores do Recife! Festival com mais de 50 restaurantes participantes, workshops de culinária, degustações e apresentações de chefs renomados. Uma verdadeira festa para os amantes da boa comida.",
      rating: 4.8,
      reviewCount: 445
    },
    {
      id: 4,
      title: "Carnaval de Olinda 2026",
      date: "14 de Fevereiro, 2026",
      time: "08:00",
      location: "Ladeiras de Olinda",
      image: "https://images.unsplash.com/photo-1681830059111-0600ef0c4958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBiZWFjaHxlbnwxfHx8fDE3NjAwNTM5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Festival",
      categoryColor: "#582bac",
      liked: true,
      description: "O melhor carnaval de rua do Brasil! Blocos tradicionais, frevo no pé e muita alegria pelas ladeiras históricas de Olinda. Uma experiência cultural única e inesquecível.",
      rating: 5,
      reviewCount: 1203
    }
  ]);

  // Estado de roteiros turísticos
  const [tours, setTours] = useState<any[]>([]);
  const [toursLoaded, setToursLoaded] = useState(false);

  // Carregar roteiros do banco de dados
  useEffect(() => {
    if (isAuthenticated && !toursLoaded) {
      loadToursFromDatabase();
    }
  }, [isAuthenticated]);

  const loadToursFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .select('*')
        .eq('status', 'publicado')
        .order('criado_em', { ascending: false });

      if (data && data.length > 0) {
        const formattedTours = data.map((tour: any) => ({
          id: tour.id,
          title: tour.titulo,
          description: tour.descricao,
          fullDescription: tour.descricao_completa,
          duration: tour.duracao_estimada,
          image: tour.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          pointsOfInterest: tour.numero_pontos || 0,
          views: tour.visualizacoes || 0,
          points: [] // Will be loaded when viewing details
        }));
        
        setTours(formattedTours);
        setToursLoaded(true);
        console.log('✅ Roteiros carregados do banco:', formattedTours.length);
      } else {
        // Se não houver roteiros, inicializar com array vazio
        setTours([]);
        setToursLoaded(true);
      }
    } catch (error) {
      console.error('Erro ao carregar roteiros:', error);
      setTours([]);
      setToursLoaded(true);
    }
  };

  // Função para carregar pontos de interesse de um roteiro específico
  const loadTourPoints = async (tourId: number) => {
    try {
      const { data, error } = await supabase
        .from('pontos_interesse')
        .select('*')
        .eq('roteiro_id', tourId)
        .order('ordem', { ascending: true });

      if (data) {
        return data.map((point: any) => ({
          id: point.id,
          name: point.nome,
          description: point.descricao,
          image: point.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800',
          order: point.ordem,
          latitude: point.latitude,
          longitude: point.longitude,
          endereco: point.endereco
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar pontos do roteiro:', error);
      return [];
    }
  };

  // Dados mockados para compatibilidade (caso o banco esteja vazio)
  const mockTours = [
    {
      id: 1,
      title: "Roteiro das Pontes do Recife",
      description: "Conheça as famosas pontes que conectam o Recife e fazem da cidade a 'Veneza Brasileira'",
      duration: "2-3 horas",
      image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
      pointsOfInterest: 5,
      fullDescription: "Um passeio pelas principais pontes da cidade do Recife, descobrindo a história e arquitetura que tornam essas estruturas tão especiais.",
      points: [
        {
          id: 1,
          name: "Ponte Maurício de Nassau",
          description: "A ponte mais antiga do Recife, construída em 1643 pelo conde holandês.",
          image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
          order: 1
        },
        {
          id: 2,
          name: "Ponte Buarque de Macedo",
          description: "Ponte histórica que liga o bairro de Santo Antônio ao Recife.",
          image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
          order: 2
        },
        {
          id: 3,
          name: "Ponte da Boa Vista",
          description: "Uma das pontes mais movimentadas, oferece vista panorâmica do Rio Capibaribe.",
          image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
          order: 3
        },
        {
          id: 4,
          name: "Ponte Limoeiro",
          description: "Conecta os bairros de São José e Santo Amaro.",
          image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
          order: 4
        },
        {
          id: 5,
          name: "Ponte Giratória",
          description: "Ponte móvel única no Brasil, permite a passagem de embarcações.",
          image: "https://images.unsplash.com/photo-1713108535704-d5616dace24b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBjaXR5fGVufDF8fHx8MTc2MDA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
          order: 5
        }
      ]
    },
    {
      id: 2,
      title: "Roteiro do Recife Antigo",
      description: "Viaje no tempo e conheça a história do bairro mais antigo da cidade",
      duration: "3-4 horas",
      image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      pointsOfInterest: 7,
      fullDescription: "Explore o coração histórico do Recife, visitando igrejas centenárias, praças e construções que contam a história da cidade.",
      points: [
        {
          id: 1,
          name: "Marco Zero",
          description: "Praça principal do Recife Antigo, ponto de partida ideal para explorar a região.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 1
        },
        {
          id: 2,
          name: "Torre Malakoff",
          description: "Antigo observatório astronômico, hoje centro cultural.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 2
        },
        {
          id: 3,
          name: "Sinagoga Kahal Zur Israel",
          description: "Primeira sinagoga das Américas, construída em 1636.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 3
        },
        {
          id: 4,
          name: "Rua do Bom Jesus",
          description: "Rua charmosa com casarões coloridos e vida noturna agitada.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 4
        },
        {
          id: 5,
          name: "Paço do Frevo",
          description: "Museu dedicado ao frevo, patrimônio imaterial da humanidade.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 5
        },
        {
          id: 6,
          name: "Embaixada dos Bonecos Gigantes",
          description: "Centro de preservação dos famosos bonecos gigantes de Olinda.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 6
        },
        {
          id: 7,
          name: "Cais da Alfândega",
          description: "Antigo porto, hoje área de lazer com bares e restaurantes.",
          image: "https://images.unsplash.com/photo-1661721097539-44f58bb849d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwYnVpbGRpbmclMjBjaHVyY2h8ZW58MXx8fHwxNzYwMDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
          order: 7
        }
      ]
    }
  ];

  const handleLogin = async (userData: { email: string; name: string; type: 'admin' | 'cidadao'; accessToken?: string }) => {
    let userId = getOrCreateUUID(userData.email);
    
    // Validar e normalizar o tipo de usuário
    let tipoUsuario: 'admin' | 'cidadao' = userData.type;
    if (tipoUsuario !== 'admin' && tipoUsuario !== 'cidadao') {
      console.warn(`⚠️ Tipo de usuário inválido: "${tipoUsuario}". Usando "cidadao" como padrão.`);
      tipoUsuario = 'cidadao';
    }
    
    let userInterests: string[] = [];
    
    try {
      // Buscar usuário no banco
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, interesses')
        .eq('email', userData.email)
        .single();
      
      if (data && data.id) {
        // Usuário existe, usar o UUID do banco
        userId = data.id;
        userInterests = data.interesses || [];
        console.log('✅ Usuário encontrado no banco:', userId);
        console.log('📋 Interesses do usuário:', userInterests);
      } else {
        // Usuário não existe, criar no banco
        console.log('⚠️ Usuário não encontrado, criando no banco...');
        const { data: newUser, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            email: userData.email,
            nome: userData.name,
            tipo: tipoUsuario,
            avatar: null,
            telefone: null,
            bio: null,
            interesses: []
          })
          .select('id')
          .single();
        
        if (newUser && newUser.id) {
          userId = newUser.id;
          console.log('✅ Usuário criado no banco:', userId);
        } else {
          console.error('❌ Erro ao criar usuário:', insertError);
          // Se falhar, usar UUID gerado localmente
          console.log('⚠️ Usando UUID gerado localmente');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar/criar usuário:', error);
    }
    
    const userWithId = {
      ...userData,
      id: userId
    };
    
    setCurrentUser(userWithId);
    setIsAuthenticated(true);
    
    // Verificar se é cidadão e não tem interesses
    if (tipoUsuario === 'cidadao' && userInterests.length === 0) {
      console.log('⚠️ Usuário cidadão sem interesses - mostrando modal obrigatório');
      setNeedsInterests(true);
      setShowInterestModal(true);
    }
    
    if (userData.type === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('main');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('main');
  };

  const handleAddEvent = async (newEvent: Omit<typeof events[0], 'id' | 'rating' | 'reviewCount' | 'liked'>) => {
    // Recarregar eventos do banco de dados para pegar o novo evento
    await loadEventsFromDatabase();
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const [userAvatar, setUserAvatar] = useState("https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400");

  // Carregar foto de perfil do banco
  useEffect(() => {
    if (currentUser) {
      loadUserAvatar();
    }
  }, [currentUser]);

  const loadUserAvatar = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('avatar, nome, interesses')
        .eq('id', currentUser.id)
        .single();

      if (data && data.avatar) {
        setUserAvatar(data.avatar);
        // Atualizar também o nome se mudou
        if (data.nome && data.nome !== currentUser.name) {
          setCurrentUser({ ...currentUser, name: data.nome });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  const handleUpdateUser = (updatedUser: { name: string; avatar: string }) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, name: updatedUser.name });
      setUserAvatar(updatedUser.avatar);
    }
  };

  const user = {
    id: currentUser?.id || "",
    email: currentUser?.email || "",
    name: currentUser?.name || "Usuário",
    avatar: userAvatar
  };

  const [pastEventsState, setPastEvents] = useState([
    {
      id: 101,
      title: "Carnaval de Olinda 2025",
      date: "10 de Fevereiro, 2025",
      image: "https://images.unsplash.com/photo-1681830059111-0600ef0c4958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBiZWFjaHxlbnwxfHx8fDE3NjAwNTM5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      hasRated: false
    },
    {
      id: 102,
      title: "Festival Rec-Beat 2024",
      date: "15 de Setembro, 2024",
      image: "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjAwMjAyODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      hasRated: true
    }
  ]);

  const favoriteEvents = events.filter(e => e.liked);
  const pastEvents = pastEventsState;

  const handleToggleLike = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, liked: !event.liked } : event
    ));
  };

  const handleEventClick = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentScreen('eventDetail');
  };

  const handleTourClick = async (tourId: number) => {
    setSelectedTourId(tourId);
    
    // Carregar pontos do roteiro antes de mostrar
    const points = await loadTourPoints(tourId);
    
    // Atualizar o tour com os pontos
    setTours(tours.map(tour => 
      tour.id === tourId ? { ...tour, points } : tour
    ));
    
    setCurrentScreen('tourDetail');
  };

  const handleBack = () => {
    if (currentScreen === 'eventDetail') {
      setCurrentScreen('main');
    } else if (currentScreen === 'tourDetail') {
      setCurrentScreen('tours');
    }
  };

  const handleOpenRating = (eventId: number, eventName: string) => {
    setRatingEventName(eventName);
    setRatingEventId(eventId);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (eventId: number, rating: number, comment: string) => {
    if (!currentUser) {
      alert('Você precisa estar logado para avaliar um evento.');
      return;
    }

    try {
      console.log('📝 Salvando avaliação:', { eventId, rating, comment, usuarioId: currentUser.id });

      // Salvar avaliação na tabela avaliacoes do Supabase
      const { data, error } = await supabase
        .from('avaliacoes')
        .upsert({
          evento_id: eventId,
          usuario_id: currentUser.id,
          nota: rating,
          comentario: comment || null
        }, {
          onConflict: 'evento_id,usuario_id'
        })
        .select();

      if (error) {
        console.error('❌ Erro ao salvar avaliação:', error);
        throw error;
      }

      console.log('✅ Avaliação salva com sucesso:', data);

      // Atualizar o evento localmente
      const mainEvent = events.find(e => e.id === eventId);
      if (mainEvent) {
        // Recarregar as avaliações para atualizar a média
        const { data: avaliacoes } = await supabase
          .from('avaliacoes')
          .select('nota')
          .eq('evento_id', eventId);

        if (avaliacoes && avaliacoes.length > 0) {
          const totalNota = avaliacoes.reduce((sum, av) => sum + av.nota, 0);
          const media = totalNota / avaliacoes.length;
          
          setEvents(events.map(e => 
            e.id === eventId 
              ? { 
                  ...e, 
                  rating: media,
                  reviewCount: avaliacoes.length
                } 
              : e
          ));
        }
      }

      // Atualizar nos eventos passados
      const pastEvent = pastEvents.find(e => e.id === eventId);
      if (pastEvent) {
        setPastEvents(pastEvents.map(e => 
          e.id === eventId ? { ...e, hasRated: true } : e
        ));
      }

      alert('✅ Avaliação enviada com sucesso! ⭐');
      setShowRatingModal(false);
      
      // Disparar evento para recarregar avaliações
      window.dispatchEvent(new Event('rating-added'));
    } catch (error) {
      console.error('❌ Erro ao enviar avaliação:', error);
      alert('❌ Erro ao enviar avaliação. Por favor, tente novamente.');
    }
  };

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const selectedTour = selectedTourId ? tours.find(t => t.id === selectedTourId) : null;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Toaster para notificações */}
      <Toaster position="top-right" richColors />
      
      {/* Sistema de Notificações */}
      <NotificationSystem currentUser={currentUser ? { id: currentUser.id, name: currentUser.name } : null} />
      
      {/* Modal Obrigatório de Interesses */}
      {showInterestModal && currentUser && (
        <InterestSelector
          userId={currentUser.id}
          onClose={() => {
            setShowInterestModal(false);
            setNeedsInterests(false);
          }}
          isRequired={needsInterests}
          title="Bem-vindo! Selecione seus interesses"
          description="Para começar, selecione as categorias de eventos que você gostaria de receber notificações. Isso nos ajuda a personalizar sua experiência!"
        />
      )}
      
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1>Integra Recife</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Navigation Bar */}
      <nav className={`app-nav ${menuOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h2>Integra Recife</h2>
          <button className="close-menu" onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="nav-user-info">
          <div className="nav-avatar">
            <User size={24} />
          </div>
          <div className="nav-user-details">
            <p className="nav-user-name">{currentUser?.name}</p>
            <span className="nav-user-type">
              {currentUser?.type === 'admin' ? 'Administrador' : 'Cidadão'}
            </span>
          </div>
        </div>

        <ul className="nav-list">
          {currentUser?.type === 'admin' ? (
            <li 
              className={currentScreen === 'admin' ? 'active' : ''}
              onClick={() => {
                setCurrentScreen('admin');
                setMenuOpen(false);
              }}
            >
              <Settings size={20} />
              <span>Painel Admin</span>
            </li>
          ) : null}
          <li 
            className={currentScreen === 'main' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('main');
              setMenuOpen(false);
            }}
          >
            <Calendar size={20} />
            <span>Eventos</span>
          </li>
          <li 
            className={currentScreen === 'tours' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('tours');
              setMenuOpen(false);
            }}
          >
            <MapPin size={20} />
            <span>Roteiros</span>
          </li>
          <li 
            className={currentScreen === 'calendar' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('calendar');
              setMenuOpen(false);
            }}
          >
            <Calendar size={20} />
            <span>Calendário</span>
          </li>
          <li 
            className={currentScreen === 'chat' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('chat');
              setMenuOpen(false);
            }}
          >
            <MessageSquare size={20} />
            <span>Chat/Fórum</span>
          </li>
          {currentUser?.type === 'admin' && (
            <>
              <li 
                className={currentScreen === 'reports' ? 'active' : ''}
                onClick={() => {
                  setCurrentScreen('reports');
                  setMenuOpen(false);
                }}
              >
                <BarChart3 size={20} />
                <span>Relatórios</span>
              </li>
              <li 
                className={currentScreen === 'projects' ? 'active' : ''}
                onClick={() => {
                  setCurrentScreen('projects');
                  setMenuOpen(false);
                }}
              >
                <Folder size={20} />
                <span>Projetos</span>
              </li>
              <li 
                className={currentScreen === 'managerialReports' ? 'active' : ''}
                onClick={() => {
                  setCurrentScreen('managerialReports');
                  setMenuOpen(false);
                }}
              >
                <FileText size={20} />
                <span>Relatórios Gerenciais</span>
              </li>
            </>
          )}
          <li 
            className={currentScreen === 'profile' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('profile');
              setMenuOpen(false);
            }}
          >
            <User size={20} />
            <span>Perfil</span>
          </li>
        </ul>

        <div className="nav-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentScreen === 'admin' && currentUser?.type === 'admin' && (
          <AdminDashboard 
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            accessToken={currentUser?.accessToken}
          />
        )}

        {currentScreen === 'main' && (
          <MainScreen 
            events={events}
            onEventClick={handleEventClick}
            onToggleLike={handleToggleLike}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentScreen === 'eventDetail' && selectedEvent && (
          <EventDetailScreen 
            event={selectedEvent}
            onBack={handleBack}
            onRate={() => handleOpenRating(selectedEvent.id, selectedEvent.title)}
          />
        )}

        {currentScreen === 'tours' && (
          <ToursScreen 
            tours={tours}
            onTourClick={handleTourClick}
            currentUser={currentUser}
            onToursUpdate={setTours}
          />
        )}

        {currentScreen === 'tourDetail' && selectedTour && (
          <TourDetailScreen 
            tour={{
              id: selectedTour.id,
              title: selectedTour.title,
              duration: selectedTour.duration,
              description: selectedTour.fullDescription,
              fullDescription: selectedTour.fullDescription,
              points: selectedTour.points || []
            }}
            onBack={handleBack}
            currentUser={currentUser}
            onPointsUpdate={loadToursFromDatabase}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen 
            user={user}
            favoriteEvents={favoriteEvents}
            pastEvents={pastEvents}
            onEventClick={handleEventClick}
            onRateEvent={(eventId) => {
              const event = pastEvents.find(e => e.id === eventId);
              handleOpenRating(event?.id || 0, event?.title || '');
            }}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {currentScreen === 'chat' && currentUser && (
          <ChatForum 
            currentUser={{
              id: currentUser.id,
              name: currentUser.name,
              avatar: user.avatar
            }}
          />
        )}

        {currentScreen === 'reports' && currentUser?.type === 'admin' && (
          <ManagerialReports events={events} />
        )}

        {currentScreen === 'managerialReports' && currentUser?.type === 'admin' && (
          <ManagerialReports events={events} />
        )}

        {currentScreen === 'projects' && currentUser && (
          <ProjectsModuleEnhanced 
            currentUser={{
              id: currentUser.id,
              name: currentUser.name,
              type: currentUser.type
            }}
          />
        )}

        {currentScreen === 'calendar' && (
          <CalendarScreen 
            events={events}
            onEventClick={handleEventClick}
          />
        )}
      </main>

      {/* Rating Modal */}
      {showRatingModal && ratingEventId !== null && (
        <RatingScreen 
          eventId={ratingEventId}
          eventName={ratingEventName}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}