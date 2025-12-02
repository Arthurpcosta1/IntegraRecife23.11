import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, Clock, UserPlus, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Convite {
  id: string;
  token: string;
  email_destinatario: string;
  criado_em: string;
  expira_em: string;
  usado: boolean;
  usado_em: string | null;
}

interface AdminInvitesProps {
  currentUserId: string;
}

export const AdminInvites: React.FC<AdminInvitesProps> = ({ currentUserId }) => {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [criando, setCriando] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('convites_admin')
        .select('*')
        .eq('criado_por', currentUserId)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      setConvites(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarToken = (): string => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return token;
  };

  const validarEmail = (email: string): boolean => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const criarConvite = async () => {
    if (!emailDestino.trim()) {
      toast.error('Digite um email válido');
      return;
    }

    if (!validarEmail(emailDestino)) {
      toast.error('Email inválido');
      return;
    }

    // Verificar se já existe convite ativo para este email
    const conviteExistente = convites.find(
      c => c.email_destinatario === emailDestino && !c.usado && new Date(c.expira_em) > new Date()
    );

    if (conviteExistente) {
      toast.error('Já existe um convite ativo para este email');
      return;
    }

    setCriando(true);

    try {
      const token = gerarToken();
      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + 7); // 7 dias de validade

      const { data, error } = await supabase
        .from('convites_admin')
        .insert([{
          token: token,
          email_destinatario: emailDestino,
          criado_por: currentUserId,
          expira_em: expiraEm.toISOString(),
          usado: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Convite criado com sucesso!');
      setShowCreateDialog(false);
      setEmailDestino('');
      await carregarConvites();

      // Copiar link automaticamente
      const link = `${window.location.origin}?invite=${token}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link do convite copiado para a área de transferência!');

    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite: ' + error.message);
    } finally {
      setCriando(false);
    }
  };

  const copiarLink = async (token: string) => {
    try {
      const link = `${window.location.origin}?invite=${token}`;
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      toast.success('Link copiado para a área de transferência!');
      
      setTimeout(() => {
        setCopiedToken(null);
      }, 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const revogarConvite = async (conviteId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja revogar o convite para ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('convites_admin')
        .delete()
        .eq('id', conviteId);

      if (error) throw error;

      toast.success('Convite revogado com sucesso!');
      await carregarConvites();
    } catch (error: any) {
      console.error('Erro ao revogar convite:', error);
      toast.error('Erro ao revogar convite: ' + error.message);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const conviteExpirado = (expiraEm: string) => {
    return new Date(expiraEm) < new Date();
  };

  const getStatusBadge = (convite: Convite) => {
    if (convite.usado) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle size={14} className="mr-1" />
        Usado
      </Badge>;
    }
    
    if (conviteExpirado(convite.expira_em)) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        <Clock size={14} className="mr-1" />
        Expirado
      </Badge>;
    }

    return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
      <Mail size={14} className="mr-1" />
      Pendente
    </Badge>;
  };

  const convitesAtivos = convites.filter(c => !c.usado && !conviteExpirado(c.expira_em));
  const convitesUsados = convites.filter(c => c.usado);
  const convitesExpirados = convites.filter(c => !c.usado && conviteExpirado(c.expira_em));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus size={24} />
                Convites de Administrador
              </CardTitle>
              <CardDescription>
                Convide novos administradores para gerenciar a plataforma
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus size={18} className="mr-2" />
              Criar Convite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Ativos</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{convitesAtivos.length}</p>
                </div>
                <Mail size={32} className="text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Usados</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{convitesUsados.length}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expirados</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{convitesExpirados.length}</p>
                </div>
                <Clock size={32} className="text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Convites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Convites</CardTitle>
            <Button variant="outline" size="sm" onClick={carregarConvites} disabled={loading}>
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw size={32} className="animate-spin text-gray-400" />
            </div>
          ) : convites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>Nenhum convite criado ainda</p>
              <p className="text-sm mt-2">Clique em "Criar Convite" para convidar novos administradores</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convites.map((convite) => (
                    <TableRow key={convite.id}>
                      <TableCell className="font-medium">{convite.email_destinatario}</TableCell>
                      <TableCell>{getStatusBadge(convite)}</TableCell>
                      <TableCell>{formatarData(convite.criado_em)}</TableCell>
                      <TableCell>{formatarData(convite.expira_em)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!convite.usado && !conviteExpirado(convite.expira_em) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copiarLink(convite.token)}
                              >
                                {copiedToken === convite.token ? (
                                  <>
                                    <Check size={16} className="mr-1 text-green-600" />
                                    Copiado
                                  </>
                                ) : (
                                  <>
                                    <Copy size={16} className="mr-1" />
                                    Copiar Link
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => revogarConvite(convite.id, convite.email_destinatario)}
                              >
                                <Trash2 size={16} className="mr-1" />
                                Revogar
                              </Button>
                            </>
                          )}
                          {(convite.usado || conviteExpirado(convite.expira_em)) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revogarConvite(convite.id, convite.email_destinatario)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remover
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar Convite */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={24} />
              Criar Convite de Administrador
            </DialogTitle>
            <DialogDescription>
              Digite o email da pessoa que você deseja convidar para ser administrador.
              O convite expira em 7 dias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Convidado</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                value={emailDestino}
                onChange={(e) => setEmailDestino(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    criarConvite();
                  }
                }}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Como funciona:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                <li>Um link único será gerado e copiado automaticamente</li>
                <li>Envie o link para o email do convidado</li>
                <li>Ao acessar o link, a pessoa poderá se cadastrar como admin</li>
                <li>O convite expira em 7 dias</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={criando}>
              Cancelar
            </Button>
            <Button onClick={criarConvite} disabled={criando}>
              {criando ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Criar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
