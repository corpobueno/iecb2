import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React, { useRef, useCallback, useState } from "react";

interface KanbanContainerProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const KanbanContainer: React.FC<KanbanContainerProps> = ({
  children,
  showNavigation = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (containerRef.current) {
      const amount = 320;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (containerRef.current && e.shiftKey) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  // Drag to scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Verificar se o clique foi diretamente no container ou em um elemento vazio
    const target = e.target as HTMLElement;
    const isCard = target.closest('[data-kanban-card]');
    const isButton = target.closest('button');
    const isInput = target.closest('input');

    // Não iniciar drag se clicou em um card, botão ou input
    if (isCard || isButton || isInput) return;

    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
      containerRef.current.style.cursor = 'grabbing';
      containerRef.current.style.userSelect = 'none';
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador para velocidade do scroll
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.userSelect = '';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
        containerRef.current.style.userSelect = '';
      }
    }
  }, [isDragging]);

  return (
    <Box sx={{ position: 'relative', width: 'calc(100% - 22px)', mx: 1.2 }}>
      {showNavigation && (
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            opacity: 0.7,
            bgcolor: 'background.default',
            left: 0.5,
            top: '50%',
            zIndex: 10,
            '&:hover': { opacity: 1 }
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}

      <Box
        ref={containerRef}
        className="kanban-container"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          alignItems: 'flex-start',
          gap: 2,
          cursor: 'grab',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
          },
        }}
      >
        {children}
      </Box>

      {showNavigation && (
        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            opacity: 0.7,
            bgcolor: 'background.default',
            right: 0.5,
            top: '50%',
            zIndex: 10,
            '&:hover': { opacity: 1 }
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}
    </Box>
  );
};
