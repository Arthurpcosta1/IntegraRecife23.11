import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Loader2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  categoryColor: string;
  liked: boolean;
}

interface CalendarScreenProps {
  events: Event[];
  onEventClick: (eventId: number) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ events, onEventClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<string>('todos');
  const [secretaria, setSecretaria] = useState<string>('todas');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDatabase, setUsingDatabase] = useState(false);

  // Carregar eventos do banco de dados
  useEffect(() => {
    loadEventsFromDatabase();
  }, []);

  // Recarregar eventos quando os eventos do props mudarem
  useEffect(() => {
    if (events.length > 0 && !usingDatabase) {
      console.log('Eventos atualizados via props:', events.length);
    }
  }, [events]);

  const loadEventsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) {
        console.log('Usando eventos locais (banco não disponível)');
        setUsingDatabase(false);
      } else if (data && data.length > 0) {
        console.log('✅ Eventos carregados do banco:', data.length);
        setDbEvents(data);
        setUsingDatabase(true);
        toast.success(`Calendário conectado! ${data.length} eventos encontrados`);
      } else {
        console.log('Nenhum evento no banco, usando locais');
        setUsingDatabase(false);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setUsingDatabase(false);
    } finally {
      setLoading(false);
    }
  };

  // Converter string de data ou timestamp para Date object
  const parseEventDate = (dateStr: string | Date): Date => {
    // Se já é um Date, retornar
    if (dateStr instanceof Date) {
      return dateStr;
    }

    // Tentar formato ISO/timestamp primeiro (do banco de dados)
    try {
      const isoDate = parseISO(dateStr);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
    } catch (e) {
      // Continuar para outros formatos
    }

    // Formato: "15 de Outubro, 2025" ou "15 de outubro, 2025" ou "7 de novembro de 2005"
    const months: { [key: string]: number } = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
      'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
      'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
      // Também aceitar maiúsculas
      'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
      'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
      'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
    };
    
    const parts = dateStr.split(' ');
    if (parts.length >= 4) {
      const day = parseInt(parts[0]);
      const monthName = parts[2].replace(',', '').toLowerCase();
      const yearStr = parts.length === 5 ? parts[4] : parts[3]; // "7 de novembro de 2005" tem 5 partes
      const year = parseInt(yearStr.replace(',', ''));
      const month = months[monthName];
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    // Formato: "DD/MM/YYYY" ou "DD-MM-YYYY"
    const dateRegex = /(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/;
    const match = dateStr.match(dateRegex);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // Meses em JS são 0-indexed
      const year = parseInt(match[3]);
      return new Date(year, month, day);
    }

    // Formato: "YYYY-MM-DD" (padrão do input date)
    const isoRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    const isoMatch = dateStr.match(isoRegex);
    if (isoMatch) {
      const year = parseInt(isoMatch[1]);
      const month = parseInt(isoMatch[2]) - 1;
      const day = parseInt(isoMatch[3]);
      return new Date(year, month, day);
    }

    console.warn('Formato de data não reconhecido:', dateStr);
    return new Date();
  };

  // Combinar eventos locais e do banco
  const allEvents = useMemo(() => {
    if (usingDatabase && dbEvents.length > 0) {
      // Converter eventos do banco para o formato local
      return dbEvents.map(dbEvent => ({
        id: dbEvent.id, // ✅ CORREÇÃO: usar o ID real do banco
        title: dbEvent.titulo,
        date: dbEvent.data_inicio,
        time: format(parseISO(dbEvent.data_inicio), 'HH:mm'),
        location: dbEvent.localizacao,
        image: dbEvent.imagem || 'https://images.unsplash.com/photo-1672841821756-fc04525771c2',
        category: dbEvent.categoria,
        categoryColor: dbEvent.cor_categoria || '#e48e2c',
        liked: false
      }));
    }
    return events;
  }, [events, dbEvents, usingDatabase]);

  // Filtrar eventos por tipo
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filtro por tipo
    if (eventType !== 'todos') {
      filtered = filtered.filter(event => {
        const category = event.category.toLowerCase();
        return category === eventType.toLowerCase();
      });
    }

    // Filtro por secretaria (baseado na categoria)
    if (secretaria !== 'todas') {
      if (secretaria === 'cultura') {
        filtered = filtered.filter(e => 
          ['música', 'teatro', 'festival'].includes(e.category.toLowerCase())
        );
      } else if (secretaria === 'turismo') {
        filtered = filtered.filter(e => 
          ['gastronomia'].includes(e.category.toLowerCase())
        );
      }
    }

    return filtered;
  }, [allEvents, eventType, secretaria]);

  // Dias com eventos
  const daysWithEvents = useMemo(() => {
    return filteredEvents.map(event => parseEventDate(event.date));
  }, [filteredEvents]);

  // Eventos do dia selecionado
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return filteredEvents.filter(event => 
      isSameDay(parseEventDate(event.date), selectedDay)
    );
  }, [selectedDay, filteredEvents]);

  // Aplicar filtros de período
  const applyPeriodFilter = (period: 'today' | 'week' | 'month') => {
    const today = new Date();
    
    switch (period) {
      case 'today':
        setDateRange({ from: today, to: today });
        setSelectedDate(today);
        break;
      case 'week':
        setDateRange({ 
          from: startOfWeek(today, { locale: ptBR }),
          to: endOfWeek(today, { locale: ptBR })
        });
        break;
      case 'month':
        setDateRange({ 
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
    }
  };

  // Customizar dias com eventos no calendário
  const modifiers = {
    hasEvent: daysWithEvents,
  };

  const modifiersClassNames = {
    hasEvent: 'has-event-day',
  };

  if (loading) {
    return (
      <div className="main-screen">
        <div className="screen-header">
          <h1 className="screen-title">Calendário de Eventos</h1>
          <p className="screen-subtitle">Carregando eventos...</p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="main-screen">
      {/* Header */}
      <div className="screen-header mb-8">
        <div>
          <h1 className="screen-title">Calendário de Eventos</h1>
          <p className="screen-subtitle" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Visualize todos os eventos e atrações em um calendário interativo
          </p>
        </div>
      </div>

      {/* Status e Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {usingDatabase && (
          <Card className="border-l-4 shadow-sm" style={{ borderLeftColor: '#10b981' }}>
            <CardContent className="py-3 px-4">
              <p className="text-sm flex items-center gap-2">
                <span style={{ color: '#10b981' }}>✅</span>
                <span><strong>{allEvents.length}</strong> eventos carregados do banco</span>
              </p>
            </CardContent>
          </Card>
        )}
        <Card className="border-l-4 shadow-sm" style={{ borderLeftColor: '#d946ef' }}>
          <CardContent className="py-3 px-4">
            <p className="text-sm flex items-center gap-2">
              <span style={{ color: '#d946ef' }}>💡</span>
              <span>Para projetos conjuntos, acesse o menu "Projetos"</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros com novo design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {/* Filtro de Tipo de Evento */}
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="h-11 border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-sm">
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">🎭 Todos</SelectItem>
            <SelectItem value="música">🎵 Música</SelectItem>
            <SelectItem value="teatro">🎪 Teatro</SelectItem>
            <SelectItem value="gastronomia">🍴 Gastronomia</SelectItem>
            <SelectItem value="festival">🎉 Festival</SelectItem>
            <SelectItem value="oficina">🎨 Oficina</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Secretaria */}
        <Select value={secretaria} onValueChange={setSecretaria}>
          <SelectTrigger className="h-11 border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-sm">
            <SelectValue placeholder="Secretaria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">📋 Todas</SelectItem>
            <SelectItem value="cultura">🎭 Cultura</SelectItem>
            <SelectItem value="turismo">🗺️ Turismo</SelectItem>
          </SelectContent>
        </Select>

        {/* Botões de Período */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyPeriodFilter('today')}
            className="flex-1 h-11 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyPeriodFilter('week')}
            className="flex-1 h-11 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            Semana
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyPeriodFilter('month')}
            className="flex-1 h-11 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            Mês
          </Button>
        </div>

        {/* Seletor de Data Personalizado */}
        <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-11 justify-start border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  setDateRange(range as { from: Date | undefined; to: Date | undefined });
                }
              }}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Calendário Principal com novo design */}
      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="pb-6 border-b bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" style={{ color: '#1f2937' }}>
                Calendário Mensal
              </CardTitle>
              <CardDescription className="mt-2 text-base" style={{ color: '#6b7280' }}>
                {filteredEvents.length} eventos encontrados
              </CardDescription>
            </div>
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-2 shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                color: '#374151',
                border: '1px solid #d1d5db'
              }}
            >
              Clique nos dias marcados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-10 bg-white">
          <div className="calendar-wrapper">
            <style>{`
              /* Melhorias no calendário */
              .calendar-wrapper .rdp {
                --rdp-cell-size: 52px;
                --rdp-accent-color: hsl(var(--primary));
                --rdp-background-color: hsl(var(--primary) / 0.1);
                margin: 0 auto;
              }

              .calendar-wrapper .rdp-months {
                justify-content: center;
              }

              .calendar-wrapper .rdp-month {
                width: 100%;
                max-width: 100%;
              }

              .calendar-wrapper .rdp-caption {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 1rem 0 1.5rem;
                font-size: 1.125rem;
                font-weight: 600;
                color: hsl(var(--foreground));
              }

              .calendar-wrapper .rdp-head_cell {
                font-weight: 600;
                font-size: 0.875rem;
                color: hsl(var(--muted-foreground));
                padding: 0.75rem;
                text-transform: lowercase;
              }

              .calendar-wrapper .rdp-cell {
                padding: 0.25rem;
              }

              .calendar-wrapper .rdp-button {
                width: 48px;
                height: 48px;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: all 0.2s;
              }

              .calendar-wrapper .rdp-button:hover:not(.rdp-day_selected) {
                background-color: hsl(var(--accent));
              }

              .calendar-wrapper .rdp-day_today:not(.rdp-day_selected) {
                background-color: hsl(var(--accent));
                font-weight: 600;
              }

              .calendar-wrapper .rdp-day_selected {
                background-color: hsl(var(--primary)) !important;
                color: white !important;
                font-weight: 700;
              }

              .calendar-wrapper .rdp-day_outside {
                opacity: 0.4;
              }
              
              .has-event-day {
                position: relative;
                font-weight: 700;
              }
              
              .has-event-day:not(.rdp-day_selected) {
                color: hsl(var(--primary)) !important;
              }
              
              .has-event-day::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 44px;
                height: 44px;
                border-radius: 0.5rem;
                background: linear-gradient(135deg, rgba(194, 33, 105, 0.12), rgba(194, 33, 105, 0.22));
                border: 2px solid rgba(194, 33, 105, 0.5);
                z-index: -1;
              }
              
              .has-event-day::after {
                content: '•';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 20px;
                line-height: 1;
                font-weight: 900;
              }
              
              .has-event-day:not(.rdp-day_selected)::after {
                color: hsl(var(--primary));
              }
              
              .has-event-day.rdp-day_selected::after {
                color: white;
              }
              
              .has-event-day:hover::before {
                background: linear-gradient(135deg, rgba(194, 33, 105, 0.22), rgba(194, 33, 105, 0.35));
                border-color: rgba(194, 33, 105, 0.7);
                transform: translate(-50%, -50%) scale(1.05);
                transition: all 0.2s ease;
              }
              
              /* Adicionar cursor pointer para dias com eventos */
              .has-event-day {
                cursor: pointer !important;
              }
              
              /* Melhorar visualização do dia selecionado */
              [data-selected="true"] {
                background-color: hsl(var(--primary)) !important;
                color: white !important;
              }
              
              [data-selected="true"].has-event-day::before {
                border-color: white;
                background: rgba(255, 255, 255, 0.2);
              }
            `}</style>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onDayClick={(day) => {
                const hasEvents = daysWithEvents.some(eventDate => 
                  isSameDay(eventDate, day)
                );
                if (hasEvents) {
                  setSelectedDay(day);
                }
              }}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border mx-auto"
              locale={ptBR}
            />
          </div>

          {/* Legenda */}
          <div className="mt-8 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted">
            <p className="text-sm font-semibold mb-4 text-foreground">Legenda:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(194, 33, 105, 0.12), rgba(194, 33, 105, 0.22))',
                  border: '2px solid rgba(194, 33, 105, 0.5)'
                }}>
                  <span className="text-primary font-bold text-sm">16</span>
                  <span className="absolute -bottom-1 text-primary text-lg font-black">•</span>
                </div>
                <span className="text-sm font-medium text-foreground">Com eventos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                  20
                </div>
                <span className="text-sm font-medium text-foreground">Selecionado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-bold text-sm shadow-sm">
                  {new Date().getDate()}
                </div>
                <span className="text-sm font-medium text-foreground">Hoje</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet lateral com eventos do dia */}
      <Sheet open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl">
              Eventos de {selectedDay && format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </SheetTitle>
            <SheetDescription className="text-base mt-2">
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Nenhum evento neste dia</p>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                  onClick={() => {
                    onEventClick(event.id);
                    setSelectedDay(null);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>

                        <Badge 
                          className="mt-3 shadow-sm"
                          style={{ backgroundColor: event.categoryColor }}
                        >
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};