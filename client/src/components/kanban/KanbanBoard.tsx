import { ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  AutoScrollOptions,
} from '@dnd-kit/core';
import { Box } from '@mui/material';

interface KanbanBoardProps {
  children: ReactNode;
  sensors: any;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  dragOverlay?: ReactNode;
  autoScrollOptions?: AutoScrollOptions;
}

export const KanbanBoard = ({
  children,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragOverlay,
  autoScrollOptions,
}: KanbanBoardProps) => {
  const defaultAutoScrollOptions: AutoScrollOptions = {
    interval: 5,
    acceleration: 15,
    threshold: {
      x: 0.15,
      y: 0.2
    },
    layoutShiftCompensation: false
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
      autoScroll={autoScrollOptions || defaultAutoScrollOptions}
    >
      <Box sx={{ width: '100%', height: '100%' }}>
        {children}
      </Box>

      {dragOverlay && (
        <DragOverlay>
          {dragOverlay}
        </DragOverlay>
      )}
    </DndContext>
  );
};
