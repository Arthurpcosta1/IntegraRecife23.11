import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  Star,
  Folder,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileSpreadsheet,
  FileText,
  DownloadCloud
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts@2.15.2';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Event {
  id: number;
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  rating: number;
  reviewCount: number;
  liked: boolean;
}

interface ManagerialReportsProps {
  events: Event[];
}

export const ManagerialReports: React.FC<ManagerialReportsProps> = ({ events }) => {
  const [loading, setLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exportPeriod, setExportPeriod] = useState('30dias');
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    totalEvents: 0,
    avgRating: 0,
    totalFavorites: 0,
    lastMonthGrowth: {
      users: 0,
      projects: 0,
      events: 0
    }
  });

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [popularEventsData, setPopularEventsData] = useState<any[]>([]);

  // Buscar dados reais do banco
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);

      // 1. Total de usuários
      const { count: totalUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      // 2. Projetos ativos
      const { count: activeProjects } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .in('status', ['planejamento', 'em_andamento']);

      // 3. Total de eventos
      const { count: totalEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      // 4. Média de avaliações
      const { data: avaliacoes } = await supabase
        .from('avaliacoes')
        .select('nota');
      
      const avgRating = avaliacoes && avaliacoes.length > 0
        ? avaliacoes.reduce((sum, a) => sum + (a.nota || 0), 0) / avaliacoes.length
        : 0;

      // 5. Total de favoritos
      const { count: totalFavorites } = await supabase
        .from('favoritos')
        .select('*', { count: 'exact', head: true });

      // 6. Crescimento do último mês
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { count: newUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', oneMonthAgo.toISOString());

      const { count: newProjects } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', oneMonthAgo.toISOString());

      const { count: newEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', oneMonthAgo.toISOString());

      // 7. Eventos por categoria nos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: eventsByMonth } = await supabase
        .from('eventos')
        .select('categoria, criado_em')
        .gte('criado_em', sixMonthsAgo.toISOString());

      // Processar dados por mês e categoria
      const monthsData = processMonthlyData(eventsByMonth || []);

      // 8. Eventos mais populares (por favoritos)
      const { data: popularEvents } = await supabase
        .from('eventos')
        .select(`
          id,
          titulo,
          data,
          categoria,
          imagem
        `)
        .order('id', { ascending: false })
        .limit(50);

      // Buscar avaliações e favoritos para cada evento
      const eventsWithStats = await Promise.all(
        (popularEvents || []).map(async (event) => {
          const { count: favCount } = await supabase
            .from('favoritos')
            .select('*', { count: 'exact', head: true })
            .eq('evento_id', event.id);

          const { data: ratings } = await supabase
            .from('avaliacoes')
            .select('nota')
            .eq('evento_id', event.id);

          const avgRating = ratings && ratings.length > 0
            ? ratings.reduce((sum, r) => sum + (r.nota || 0), 0) / ratings.length
            : 0;

          return {
            ...event,
            favoritos: favCount || 0,
            media_avaliacoes: avgRating,
            num_avaliacoes: ratings?.length || 0
          };
        })
      );

      // Ordenar por favoritos e pegar top 10
      const topEvents = eventsWithStats
        .sort((a, b) => b.favoritos - a.favoritos)
        .slice(0, 10)
        .map((event, index) => ({
          ...event,
          posicao: index + 1
        }));

      // Calcular percentuais de crescimento
      const userGrowth = totalUsers ? Math.round((newUsers || 0) / totalUsers * 100) : 0;
      const projectGrowth = activeProjects ? Math.round((newProjects || 0) / activeProjects * 100) : 0;
      const eventGrowth = totalEvents ? Math.round((newEvents || 0) / totalEvents * 100) : 0;

      setRealStats({
        totalUsers: totalUsers || 0,
        activeProjects: activeProjects || 0,
        totalEvents: totalEvents || 0,
        avgRating,
        totalFavorites: totalFavorites || 0,
        lastMonthGrowth: {
          users: userGrowth,
          projects: projectGrowth,
          events: eventGrowth
        }
      });

      setCategoryData(monthsData);
      setPopularEventsData(topEvents);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  // Processar dados mensais por categoria
  const processMonthlyData = (events: any[]) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const months: any[] = [];

    // Criar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        monthNum: date.getMonth(),
        Música: 0,
        Teatro: 0,
        Gastronomia: 0,
        Arte: 0,
        Festival: 0,
        Outros: 0
      });
    }

    // Contar eventos por mês e categoria
    events.forEach(event => {
      const eventDate = new Date(event.criado_em);
      const monthIndex = months.findIndex(m => 
        m.monthNum === eventDate.getMonth() && 
        m.year === eventDate.getFullYear()
      );

      if (monthIndex >= 0) {
        const categoria = event.categoria || 'Outros';
        if (months[monthIndex][categoria] !== undefined) {
          months[monthIndex][categoria]++;
        } else {
          months[monthIndex].Outros++;
        }
      }
    });

    return months.map(m => ({
      month: m.month,
      Música: m.Música,
      Teatro: m.Teatro,
      Gastronomia: m.Gastronomia,
      Arte: m.Arte,
      Festival: m.Festival,
      Outros: m.Outros
    }));
  };

  // Configuração do gráfico
  const chartConfig: ChartConfig = {
    Música: {
      label: "Música",
      color: "#e48e2c",
    },
    Teatro: {
      label: "Teatro",
      color: "#b31a4d",
    },
    Gastronomia: {
      label: "Gastronomia",
      color: "#4a920f",
    },
    Arte: {
      label: "Arte",
      color: "#0e7490",
    },
    Festival: {
      label: "Festival",
      color: "#582bac",
    },
    Outros: {
      label: "Outros",
      color: "#64748b",
    },
  };

  // Função de exportação com configurações do modal
  const handleExportReport = () => {
    setShowExportDialog(false);
    
    // Filtrar dados por período
    const filteredData = getFilteredDataByPeriod();
    
    // Exportar de acordo com o formato selecionado
    if (exportFormat === 'xlsx') {
      exportToExcel(filteredData);
    } else if (exportFormat === 'csv') {
      exportToCSV(filteredData);
    } else if (exportFormat === 'pdf') {
      exportToPDF(filteredData);
    }
  };

  // Filtrar dados por período
  const getFilteredDataByPeriod = () => {
    const now = new Date();
    let startDate = new Date();

    switch (exportPeriod) {
      case '7dias':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30dias':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'este_mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'mes_passado':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'ano_inteiro':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return {
      startDate,
      endDate: now,
      stats: realStats,
      categoryData,
      popularEventsData
    };
  };

  // Exportar para Excel
  const exportToExcel = (data: any) => {
    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();

      // ==================== ABA 1: RESUMO EXECUTIVO ====================
      const resumoData = [
        ['RELATÓRIO GERENCIAL - PLATAFORMA DE EVENTOS DO RECIFE'],
        ['Gerado em: ' + new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })],
        [''],
        ['INDICADORES PRINCIPAIS'],
        ['Métrica', 'Valor Atual', 'Crescimento (último mês)'],
        ['Total de Usuários', realStats.totalUsers, `+${realStats.lastMonthGrowth.users}%`],
        ['Projetos Ativos', realStats.activeProjects, `+${realStats.lastMonthGrowth.projects}%`],
        ['Total de Eventos', realStats.totalEvents, `+${realStats.lastMonthGrowth.events}%`],
        ['Média de Avaliações', realStats.avgRating.toFixed(2) + ' ⭐', ''],
        ['Total de Favoritos', realStats.totalFavorites, ''],
        [''],
      ];

      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);

      // Formatação da aba Resumo
      wsResumo['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');

      // ==================== ABA 2: EVENTOS MAIS POPULARES ====================
      const eventosData = [
        ['RANKING - EVENTOS MAIS POPULARES'],
        ['Top 10 eventos com melhor desempenho'],
        [''],
        ['Posição', 'Nome do Evento', 'Data', 'Categoria', 'Média Avaliações', 'Nº Avaliações', 'Total de Favoritos']
      ];

      popularEventsData.forEach(event => {
        eventosData.push([
          event.posicao,
          event.titulo,
          new Date(event.data).toLocaleDateString('pt-BR'),
          event.categoria || 'Sem categoria',
          event.media_avaliacoes.toFixed(2),
          event.num_avaliacoes,
          event.favoritos
        ]);
      });

      eventosData.push([]);
      eventosData.push(['']);
      eventosData.push(['ESTATÍSTICAS DO RANKING']);
      eventosData.push(['Total de favoritos no Top 10:', popularEventsData.reduce((sum, e) => sum + e.favoritos, 0)]);
      eventosData.push(['Média de avaliações do Top 10:', (popularEventsData.reduce((sum, e) => sum + e.media_avaliacoes, 0) / popularEventsData.length).toFixed(2)]);

      const wsEventos = XLSX.utils.aoa_to_sheet(eventosData);

      // Formatação da aba Eventos
      wsEventos['!cols'] = [
        { wch: 10 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(wb, wsEventos, 'Top 10 Eventos');

      // ==================== ABA 3: DISTRIBUIÇÃO POR CATEGORIA ====================
      const categoriasData = [
        ['DISTRIBUIÇÃO DE EVENTOS POR CATEGORIA'],
        ['Análise dos últimos 6 meses'],
        [''],
        ['Mês', 'Música', 'Teatro', 'Gastronomia', 'Arte', 'Festival', 'Outros', 'TOTAL']
      ];

      categoryData.forEach(month => {
        const total = month.Música + month.Teatro + month.Gastronomia + month.Arte + month.Festival + month.Outros;
        categoriasData.push([
          month.month,
          month.Música,
          month.Teatro,
          month.Gastronomia,
          month.Arte,
          month.Festival,
          month.Outros,
          total
        ]);
      });

      // Adicionar totais
      categoriasData.push([]);
      const totalMusica = categoryData.reduce((sum, m) => sum + m.Música, 0);
      const totalTeatro = categoryData.reduce((sum, m) => sum + m.Teatro, 0);
      const totalGastronomia = categoryData.reduce((sum, m) => sum + m.Gastronomia, 0);
      const totalArte = categoryData.reduce((sum, m) => sum + m.Arte, 0);
      const totalFestival = categoryData.reduce((sum, m) => sum + m.Festival, 0);
      const totalOutros = categoryData.reduce((sum, m) => sum + m.Outros, 0);
      const grandTotal = totalMusica + totalTeatro + totalGastronomia + totalArte + totalFestival + totalOutros;

      categoriasData.push([
        'TOTAL GERAL',
        totalMusica,
        totalTeatro,
        totalGastronomia,
        totalArte,
        totalFestival,
        totalOutros,
        grandTotal
      ]);

      categoriasData.push([]);
      categoriasData.push(['PERCENTUAL POR CATEGORIA']);
      categoriasData.push([
        'Categoria',
        'Música',
        'Teatro',
        'Gastronomia',
        'Arte',
        'Festival',
        'Outros'
      ]);
      categoriasData.push([
        'Percentual',
        ((totalMusica / grandTotal * 100) || 0).toFixed(1) + '%',
        ((totalTeatro / grandTotal * 100) || 0).toFixed(1) + '%',
        ((totalGastronomia / grandTotal * 100) || 0).toFixed(1) + '%',
        ((totalArte / grandTotal * 100) || 0).toFixed(1) + '%',
        ((totalFestival / grandTotal * 100) || 0).toFixed(1) + '%',
        ((totalOutros / grandTotal * 100) || 0).toFixed(1) + '%'
      ]);

      const wsCategorias = XLSX.utils.aoa_to_sheet(categoriasData);

      // Formatação da aba Categorias
      wsCategorias['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, wsCategorias, 'Por Categoria');

      // ==================== GERAR E BAIXAR ====================
      const periodLabel = {
        '7dias': '7_dias',
        '30dias': '30_dias',
        'este_mes': 'este_mes',
        'mes_passado': 'mes_passado',
        'ano_inteiro': 'ano_inteiro'
      }[exportPeriod] || '30_dias';

      const fileName = `Relatorio_Gerencial_${periodLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Relatório Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar para CSV
  const exportToCSV = (data: any) => {
    try {
      const csvData = popularEventsData.map(event => ({
        Posição: event.posicao,
        Evento: event.titulo,
        Data: new Date(event.data).toLocaleDateString('pt-BR'),
        Categoria: event.categoria || 'Sem categoria',
        'Média Avaliação': event.media_avaliacoes.toFixed(1),
        'Num. Avaliações': event.num_avaliacoes,
        Favoritos: event.favoritos
      }));

      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const periodLabel = {
        '7dias': '7_dias',
        '30dias': '30_dias',
        'este_mes': 'este_mes',
        'mes_passado': 'mes_passado',
        'ano_inteiro': 'ano_inteiro'
      }[exportPeriod] || '30_dias';

      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_Gerencial_${periodLabel}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Relatório CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar relatório CSV');
    }
  };

  // Exportar para PDF (simplificado)
  const exportToPDF = (data: any) => {
    toast.info('Exportação para PDF em desenvolvimento. Use Excel ou CSV por enquanto.');
  };

  if (loading) {
    return (
      <div className="main-screen flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dados do relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-screen">
      {/* Header */}
      <div className="screen-header mb-6">
        <div>
          <h1 className="screen-title">Relatórios Gerenciais</h1>
          <p className="screen-subtitle">Análise completa de métricas e desempenho da plataforma</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total de Eventos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos (último mês)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {realStats.lastMonthGrowth.events > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{realStats.lastMonthGrowth.events}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{realStats.lastMonthGrowth.events}%</span>
                </>
              )} vs mês anterior
            </p>
          </CardContent>
        </Card>

        {/* Total de Usuários */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {realStats.lastMonthGrowth.users > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{realStats.lastMonthGrowth.users}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{realStats.lastMonthGrowth.users}%</span>
                </>
              )} vs mês anterior
            </p>
          </CardContent>
        </Card>

        {/* Média de Avaliações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média de Avaliações</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realStats.avgRating.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em {realStats.totalFavorites} avaliações
            </p>
          </CardContent>
        </Card>

        {/* Projetos Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {realStats.lastMonthGrowth.projects > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{realStats.lastMonthGrowth.projects}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{realStats.lastMonthGrowth.projects}%</span>
                </>
              )} vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Eventos por Categoria (Últimos 6 Meses)
          </CardTitle>
          <CardDescription>
            Distribuição de eventos cadastrados por categoria nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Música" fill="var(--color-Música)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Teatro" fill="var(--color-Teatro)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastronomia" fill="var(--color-Gastronomia)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Arte" fill="var(--color-Arte)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Festival" fill="var(--color-Festival)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outros" fill="var(--color-Outros)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Eventos Mais Populares */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Eventos Mais Populares
            </CardTitle>
            <CardDescription>
              Ranking dos 10 eventos com melhor desempenho
            </CardDescription>
          </div>
          <Button onClick={() => setShowExportDialog(true)} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </CardHeader>
        <CardContent>
          {popularEventsData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nome do Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Avaliações</TableHead>
                  <TableHead className="text-center">Favoritos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popularEventsData.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.posicao}
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px]">
                      {event.titulo}
                    </TableCell>
                    <TableCell>
                      {new Date(event.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {event.categoria || 'Sem categoria'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{event.media_avaliacoes.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {event.num_avaliacoes}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {event.favoritos}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento cadastrado ainda
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Exportação */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Exportar Relatório Gerencial
            </DialogTitle>
            <DialogDescription>
              Selecione o formato e o período desejado para a exportação dos dados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Formato do Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="export-format" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Formato do Arquivo
              </Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Excel (.xlsx)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>CSV (.csv)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {exportFormat === 'xlsx' && '📊 Recomendado: Inclui múltiplas abas e formatação avançada'}
                {exportFormat === 'csv' && '📄 Simples: Compatível com qualquer planilha'}
              </p>
            </div>

            {/* Período do Relatório */}
            <div className="space-y-2">
              <Label htmlFor="export-period" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período do Relatório
              </Label>
              <Select value={exportPeriod} onValueChange={setExportPeriod}>
                <SelectTrigger id="export-period">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="este_mes">Este Mês</SelectItem>
                  <SelectItem value="mes_passado">Mês Passado</SelectItem>
                  <SelectItem value="ano_inteiro">Ano Inteiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview de informações */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Resumo da Exportação:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Formato: {exportFormat.toUpperCase()}</p>
                <p>• Período: {
                  exportPeriod === '7dias' ? 'Últimos 7 dias' :
                  exportPeriod === '30dias' ? 'Últimos 30 dias' :
                  exportPeriod === 'este_mes' ? 'Este Mês' :
                  exportPeriod === 'mes_passado' ? 'Mês Passado' :
                  'Ano Inteiro'
                }</p>
                <p>• Total de eventos: {popularEventsData.length}</p>
                <p>• Data de geração: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportReport} className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              Baixar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};