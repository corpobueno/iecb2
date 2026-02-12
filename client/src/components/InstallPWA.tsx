import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Fab, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GetAppIcon from '@mui/icons-material/GetApp';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta quando o app é instalado
    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      setIsInstalled(true);
      setShowInstall(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('O navegador não permite instalação neste momento. Tente novamente mais tarde ou use o menu do navegador.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleClose = () => {
    setShowInstall(false);
  };

  // Se já está instalado, não mostra nada
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Snackbar automático */}
      <Snackbar
        open={showInstall}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={handleClose}
      >
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              startIcon={<DownloadIcon />}
            >
              Instalar
            </Button>
          }
          onClose={handleClose}
        >
          Instale o Sysnode como aplicativo
        </Alert>
      </Snackbar>

      {/* Botão flutuante fixo (para teste e acesso fácil) */}
      {deferredPrompt && (
        <Tooltip title="Instalar Aplicativo" placement="left">
          <Fab
            color="primary"
            aria-label="install"
            onClick={handleInstall}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <GetAppIcon />
          </Fab>
        </Tooltip>
      )}
    </>
  );
};
