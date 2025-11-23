import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface ShareEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: string;
  };
}

export const ShareEventDialog: React.FC<ShareEventDialogProps> = ({ isOpen, onClose, event }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Gerar URL do evento
  const eventUrl = `${window.location.origin}?evento=${event.id}`;

  // Gerar URL do QR Code usando uma API pública
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`;

  // Copiar link para área de transferência
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success('Link copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  // Compartilhar no WhatsApp
  const handleWhatsAppShare = () => {
    const text = `Confira este evento: ${event.title}\n📅 ${event.date} às ${event.time}\n📍 ${event.location}\n\n${eventUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Compartilhar no Instagram (abre o Instagram - usuário pode compartilhar manualmente)
  const handleInstagramShare = () => {
    toast.info('Baixe a imagem e compartilhe no Instagram!');
    handleDownloadCard();
  };

  // Baixar Card como imagem
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    try {
      // Clonar o elemento para não afetar o visual
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      // Usar html2canvas para converter o card em imagem
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Forçar cores RGB em vez de oklch
          const clonedElement = clonedDoc.querySelector('[data-card-ref]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.background = 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)';
          }
        }
      });

      // Remover o clone
      document.body.removeChild(clone);

      // Converter para blob e fazer download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `evento-${event.title.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Card baixado com sucesso!');
        }
      });
    } catch (error) {
      console.error('❌ Erro ao baixar card:', error);
      toast.error('Erro ao baixar card: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  // Baixar QR Code
  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qrcode-evento-${event.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code baixado com sucesso!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Evento
          </DialogTitle>
          <DialogDescription>
            Compartilhe este evento nas redes sociais ou baixe o card e QR code
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Card de Marketing */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-600">Pré-visualização do Card</h3>
            <div 
              ref={cardRef}
              data-card-ref="true"
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg overflow-hidden shadow-lg"
            >
              {/* Imagem do Evento */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {event.category}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-6 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{event.date} às {event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Recife Cultural</span>
                    <div className="bg-purple-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-purple-700">Garanta seu lugar!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Download */}
            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadCard}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Card
              </Button>
            </div>
          </div>

          {/* QR Code e Compartilhamento */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-600">QR Code</h3>
            
            {/* QR Code */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code do evento"
                  className="w-64 h-64"
                />
              </div>
              <p className="mt-4 text-sm text-gray-600 text-center">
                Escaneie para acessar o evento
              </p>
              <Button 
                onClick={handleDownloadQR}
                variant="outline"
                className="mt-4 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar QR Code
              </Button>
            </div>

            {/* Botões de Compartilhamento Social */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-600">Compartilhar em</h3>
              
              <Button
                onClick={handleWhatsAppShare}
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>

              <Button
                onClick={handleInstagramShare}
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-pink-50 hover:border-pink-500 hover:text-pink-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full justify-start gap-3 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? 'Link Copiado!' : 'Copiar Link'}
              </Button>
            </div>

            {/* URL do Evento */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">URL do Evento</p>
              <p className="text-sm text-gray-700 break-all font-mono">{eventUrl}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
