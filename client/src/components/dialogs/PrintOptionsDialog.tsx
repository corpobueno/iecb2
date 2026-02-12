import { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { Printer, Download, MessageCircle, Share2 } from 'lucide-react';
import { toTel } from '../../utils/functions';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import jsPDF from 'jspdf';

interface PrintOptionsDialogProps {
  open: boolean;
  onClose: () => void;

  // Função genérica de geração de PDF
  generatePdfFn: () => Promise<jsPDF | null>;

  // Dados para customização
  documentName: string; // Ex: "transacao-123" ou "orcamento-456"
  documentId: string | number;
  clientPhone?: string;
  clientName?: string;

  // Callbacks opcionais
  onSuccess?: () => void;
  onMarkAsPrinted?: () => Promise<void>;
}

export const PrintOptionsDialog = ({
  open,
  onClose,
  generatePdfFn,
  documentName,
  documentId,
  clientPhone,
  clientName,
  onSuccess,
  onMarkAsPrinted
}: PrintOptionsDialogProps) => {
  const { showSnackbarMessage } = useSnackbar();
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar se o navegador suporta Web Share API
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;

  const handlePrint = useCallback(async () => {
    setIsGenerating(true);
    try {
      const doc = await generatePdfFn();
      if (!doc) {
        setIsGenerating(false);
        return;
      }

      // Abrir em nova aba para impressão
      try {
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        setTimeout(() => {
          window.open(pdfUrl, '_blank');
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        }, 0);
      } catch (error: any) {
        showSnackbarMessage(`Erro ao abrir PDF para impressão: ${error.message}`, 'error');
        console.error('[PDF] Erro ao criar blob ou abrir janela:', error);
        setIsGenerating(false);
        return;
      }

      if (onMarkAsPrinted) {
        await onMarkAsPrinted();
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsGenerating(false);
      onClose();
    } catch (error: any) {
      showSnackbarMessage(`Erro ao imprimir PDF: ${error.message || 'Erro desconhecido'}`, 'error');
      console.error('[PDF] Erro no processo de impressão:', error);
      setIsGenerating(false);
    }
  }, [generatePdfFn, onMarkAsPrinted, onSuccess, showSnackbarMessage, onClose]);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const doc = await generatePdfFn();
      if (!doc) {
        setIsGenerating(false);
        return;
      }

      // Baixar o PDF
      try {
        doc.save(`${documentName}.pdf`);
      } catch (error: any) {
        showSnackbarMessage(`Erro ao salvar arquivo PDF: ${error.message}. Verifique as permissões de download.`, 'error');
        console.error('[PDF] Erro ao salvar arquivo:', error);
        setIsGenerating(false);
        return;
      }

      if (onMarkAsPrinted) {
        await onMarkAsPrinted();
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsGenerating(false);
      onClose();
    } catch (error: any) {
      showSnackbarMessage(`Erro ao baixar PDF: ${error.message || 'Erro desconhecido'}`, 'error');
      console.error('[PDF] Erro no processo de download:', error);
      setIsGenerating(false);
    }
  }, [generatePdfFn, documentName, onMarkAsPrinted, onSuccess, showSnackbarMessage, onClose]);

  const handleWhatsApp = useCallback(async () => {
    if (!clientPhone) {
      showSnackbarMessage('Telefone do cliente não disponível', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const doc = await generatePdfFn();
      if (!doc) {
        setIsGenerating(false);
        return;
      }

      // Baixar o PDF automaticamente para o usuário poder enviar
      const fileName = `${documentName}.pdf`;
      try {
        doc.save(fileName);
      } catch (error: any) {
        showSnackbarMessage(`Erro ao salvar PDF para WhatsApp: ${error.message}`, 'error');
        console.error('[PDF] Erro ao salvar para WhatsApp:', error);
        setIsGenerating(false);
        return;
      }

      // Formatar número de telefone (remover caracteres especiais)
      const phoneNumber = clientPhone.replace(/\D/g, '');

      // Mensagem personalizada
      const message = `Olá ${clientName}! Segue o documento nº ${documentId}.`;

      // Tentar copiar a mensagem para área de transferência
      try {
        await navigator.clipboard.writeText(message);
        showSnackbarMessage(`PDF baixado como "${fileName}". Mensagem copiada! Cole no WhatsApp e anexe o arquivo.`, 'success');
      } catch (clipboardError) {
        showSnackbarMessage(`PDF baixado como "${fileName}". Anexe o arquivo no WhatsApp.`, 'info');
      }

      // Abrir WhatsApp Web/App diretamente com o número (sem mensagem pré-preenchida)
      const whatsappUrl = `https://wa.me/${phoneNumber}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 500);

      if (onMarkAsPrinted) {
        await onMarkAsPrinted();
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsGenerating(false);
      onClose();
    } catch (error: any) {
      showSnackbarMessage(`Erro ao processar WhatsApp: ${error.message || 'Erro desconhecido'}`, 'error');
      console.error('[PDF] Erro no processo de WhatsApp:', error);
      setIsGenerating(false);
    }
  }, [generatePdfFn, clientPhone, clientName, documentName, documentId, onMarkAsPrinted, onSuccess, showSnackbarMessage, onClose]);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const doc = await generatePdfFn();
      if (!doc) {
        setIsGenerating(false);
        return;
      }

      // Converter PDF para blob
      let pdfBlob: Blob;
      let file: File;
      try {
        pdfBlob = doc.output('blob');
        const fileName = `${documentName}.pdf`;
        file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      } catch (error: any) {
        showSnackbarMessage(`Erro ao preparar PDF para compartilhamento: ${error.message}`, 'error');
        console.error('[PDF] Erro ao criar blob/file:', error);
        setIsGenerating(false);
        return;
      }

      // Mensagem para compartilhar
      const message = `Documento nº ${documentId}${clientName ? ` - ${clientName}` : ''}`;

      // Verificar se pode compartilhar este tipo de arquivo
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Documento ${documentId}`,
            text: message,
            files: [file],
          });

          showSnackbarMessage('Documento compartilhado com sucesso', 'success');

          if (onMarkAsPrinted) {
            await onMarkAsPrinted();
          }

          if (onSuccess) {
            onSuccess();
          }

          setIsGenerating(false);
          onClose();
        } catch (shareError: any) {
          if (shareError.name === 'AbortError') {
            console.log('[PDF] Compartilhamento cancelado pelo usuário');
            setIsGenerating(false);
          } else {
            showSnackbarMessage(`Erro ao compartilhar: ${shareError.message}`, 'error');
            console.error('[PDF] Erro no compartilhamento:', shareError);
            setIsGenerating(false);
          }
        }
      } else {
        const reason = !navigator.canShare
          ? 'API de compartilhamento não disponível'
          : 'Compartilhamento de arquivos PDF não suportado';
        showSnackbarMessage(`Seu dispositivo não suporta compartilhamento de arquivos. ${reason}`, 'warning');
        setIsGenerating(false);
      }
    } catch (error: any) {
      showSnackbarMessage(`Erro ao compartilhar documento: ${error.message || 'Erro desconhecido'}`, 'error');
      console.error('[PDF] Erro no processo de compartilhamento:', error);
      setIsGenerating(false);
    }
  }, [generatePdfFn, documentName, documentId, clientName, onMarkAsPrinted, onSuccess, showSnackbarMessage, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Opções de Documento</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handlePrint} disabled={isGenerating}>
              <ListItemIcon>
                {isGenerating ? <CircularProgress size={20} /> : <Printer size={20} />}
              </ListItemIcon>
              <ListItemText
                primary="Imprimir"
                secondary="Abrir janela de impressão"
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={handleDownload} disabled={isGenerating}>
              <ListItemIcon>
                {isGenerating ? <CircularProgress size={20} /> : <Download size={20} />}
              </ListItemIcon>
              <ListItemText
                primary="Baixar PDF"
                secondary="Salvar documento no dispositivo"
              />
            </ListItemButton>
          </ListItem>

          {canShare && (
            <ListItem disablePadding>
              <ListItemButton onClick={handleShare} disabled={isGenerating}>
                <ListItemIcon>
                  {isGenerating ? <CircularProgress size={20} /> : <Share2 size={20} />}
                </ListItemIcon>
                <ListItemText
                  primary="Compartilhar"
                  secondary="Compartilhar via WhatsApp, email, etc"
                />
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleWhatsApp}
              disabled={!clientPhone || isGenerating}
            >
              <ListItemIcon>
                {isGenerating ? <CircularProgress size={20} /> : <MessageCircle size={20} />}
              </ListItemIcon>
              <ListItemText
                primary="Enviar via WhatsApp"
                secondary={
                  clientPhone
                    ? clientPhone.length > 11
                      ? `Baixa PDF e abre chat com ${toTel(clientPhone)}`
                      : 'Telefone com formato incorreto'
                    : "Telefone não disponível"
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};
