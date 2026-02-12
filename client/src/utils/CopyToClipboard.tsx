import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CopyToClipboardProps {
  text: string;
  onCopy?: () => void;
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  tooltipTitle?: string;
  successTooltipTitle?: string;
  fontSize?: number;
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  onCopy,
  size = 'small',
  color = 'default',
  tooltipTitle = 'Copiar',
  successTooltipTitle = 'Copiado!',
  fontSize
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy();

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Tooltip
      title={copied ? successTooltipTitle : tooltipTitle}
      arrow
      placement="top"
    >
      <IconButton
        onClick={handleCopy}
        color={color}
        size={size}
        aria-label="copiar para área de transferência"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        {copied ? (
          <CheckIcon sx={fontSize ? { fontSize } : {}} color="success" />
        ) : (
          <ContentCopyIcon sx={fontSize ? { fontSize } : {}} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// Função utilitária para copiar texto (pode ser usada diretamente também)
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};