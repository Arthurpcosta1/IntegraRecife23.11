import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Trash2, Edit, RefreshCw, Eye, Clock, MapPin } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface Draft {
  id: number;
  titulo: string;
  descricao: string;
  descricao_completa: string;
  duracao_estimada: string;
  imagem: string;
  numero_pontos: number;
  criado_em: string;
  atualizado_em: string;
}

interface ToursDraftsManagerProps {
  currentUserId: string;
  onDraftPublished?: () => void;
}

export const ToursDraftsManager: React.FC<ToursDraftsManagerProps> = ({
  currentUserId,
  onDraftPublished,
}) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, [currentUserId]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roteiros_turisticos')
        .select('*')
        .eq('status', 'rascunho')
        .eq('usuario_criador', currentUserId)
        .order('atualizado_em', { ascending: false });

      if (error) throw error;

      setDrafts(data || []);
      console.log('✅ Rascunhos carregados:', data?.length || 0);
    } catch (error: any) {
      console.error('Erro ao carregar rascunhos:', error);
      toast.error('Erro ao carregar rascunhos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (draftId: number) => {
    if (!confirm('Deseja publicar este roteiro? Ele ficará visível para todos os usuários.')) {
      return;
    }

    setPublishing(draftId);

    try {
      const { error } = await supabase
        .from('roteiros_turisticos')
        .update({ status: 'publicado' })
        .eq('id', draftId);

      if (error) throw error;

      toast.success('Roteiro publicado com sucesso!');
      await loadDrafts();
      onDraftPublished?.();
    } catch (error: any) {
      console.error('Erro ao publicar roteiro:', error);
      toast.error('Erro ao publicar roteiro: ' + error.message);
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (draftId: number) => {
    if (!confirm('Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeleting(draftId);

    try {
      const { error } = await supabase
        .from('roteiros_turisticos')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      toast.success('Rascunho excluído com sucesso!');
      await loadDrafts();
    } catch (error: any) {
      console.error('Erro ao excluir rascunho:', error);
      toast.error('Erro ao excluir rascunho: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = (draft: Draft) => {
    setSelectedDraft(draft);
    setShowPreviewDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={64} className="mx-auto mb-4 opacity-20" />
        <h3 className="text-xl mb-2 opacity-70">Nenhum rascunho encontrado</h3>
        <p className="opacity-50">
          Quando você salvar um roteiro como rascunho, ele aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl flex items-center gap-2">
            <FileText size={28} />
            Rascunhos
          </h2>
          <p className="text-sm opacity-60 mt-1">
            {drafts.length} {drafts.length === 1 ? 'rascunho salvo' : 'rascunhos salvos'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDrafts}>
          <RefreshCw size={16} className="mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Lista de Rascunhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => (
          <Card key={draft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <ImageWithFallback
                src={draft.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800'}
                alt={draft.titulo}
                className="w-full h-48 object-cover"
              />
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 bg-yellow-500 text-white"
              >
                <FileText size={14} className="mr-1" />
                Rascunho
              </Badge>
              {draft.numero_pontos > 0 && (
                <Badge variant="secondary" className="absolute top-2 left-2 bg-white/90">
                  <MapPin size={14} className="mr-1" />
                  {draft.numero_pontos} {draft.numero_pontos === 1 ? 'ponto' : 'pontos'}
                </Badge>
              )}
            </div>

            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{draft.titulo}</CardTitle>
              <p className="text-sm opacity-60 line-clamp-2">{draft.descricao}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Informações */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 opacity-70">
                  <Clock size={16} />
                  <span>Duração: {draft.duracao_estimada}</span>
                </div>
                <div className="opacity-50 text-xs">
                  Atualizado em: {formatDate(draft.atualizado_em)}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handlePreview(draft)}
                >
                  <Eye size={16} className="mr-1" />
                  Ver
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handlePublish(draft.id)}
                  disabled={publishing === draft.id}
                >
                  {publishing === draft.id ? (
                    <>
                      <RefreshCw size={16} className="mr-1 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-1" />
                      Publicar
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(draft.id)}
                  disabled={deleting === draft.id}
                >
                  {deleting === draft.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Preview */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDraft && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText size={24} />
                  {selectedDraft.titulo}
                </DialogTitle>
                <DialogDescription>
                  Visualização do rascunho
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Imagem */}
                <ImageWithFallback
                  src={selectedDraft.imagem || 'https://images.unsplash.com/photo-1661721097539-44f58bb849d8?w=800'}
                  alt={selectedDraft.titulo}
                  className="w-full h-64 object-cover rounded-lg"
                />

                {/* Informações */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-sm opacity-60">Duração Estimada</p>
                    <p className="font-medium">{selectedDraft.duracao_estimada}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Pontos de Interesse</p>
                    <p className="font-medium">
                      {selectedDraft.numero_pontos}{' '}
                      {selectedDraft.numero_pontos === 1 ? 'ponto' : 'pontos'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Criado em</p>
                    <p className="font-medium text-sm">{formatDate(selectedDraft.criado_em)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Atualizado em</p>
                    <p className="font-medium text-sm">{formatDate(selectedDraft.atualizado_em)}</p>
                  </div>
                </div>

                {/* Descrição Breve */}
                <div>
                  <h4 className="font-medium mb-2">Descrição Breve</h4>
                  <p className="text-sm opacity-80">{selectedDraft.descricao}</p>
                </div>

                {/* Descrição Completa */}
                {selectedDraft.descricao_completa && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição Completa</h4>
                    <p className="text-sm opacity-80 whitespace-pre-wrap">
                      {selectedDraft.descricao_completa}
                    </p>
                  </div>
                )}

                {/* Alerta se não tiver pontos */}
                {selectedDraft.numero_pontos === 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Este roteiro ainda não tem pontos de interesse adicionados.
                      Você pode adicionar após publicar.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewDialog(false)}
                >
                  Fechar
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowPreviewDialog(false);
                    handlePublish(selectedDraft.id);
                  }}
                  disabled={publishing === selectedDraft.id}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Publicar Roteiro
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
