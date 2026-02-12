import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React, { useRef } from "react";

export const LeadsKanban: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const amount = 320; // largura de uma coluna
      containerRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // Arrasto com mouse/touch
  let isDown = false, startX = 0, scrollLeft = 0;
  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft = containerRef.current?.scrollLeft || 0;
  };
  const onMouseLeave = () => { isDown = false; };
  const onMouseUp = () => { isDown = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = x - startX;
    if (containerRef.current) containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <IconButton onClick={() => scroll('left')} sx={{ position: 'absolute', left: 0, top: '50%', zIndex: 10 }}><ArrowBackIosNewIcon /></IconButton>
      <Box
        ref={containerRef}
        sx={{ display: 'flex', overflowX: 'auto', alignItems: 'flex-start', cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {children}
      </Box>
      <IconButton onClick={() => scroll('right')} sx={{ position: 'absolute', right: 0, top: '50%', zIndex: 10 }}><ArrowForwardIosIcon /></IconButton>
    </Box>
  );
};