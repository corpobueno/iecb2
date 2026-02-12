import { useState, useEffect } from 'react';
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface UseKanbanDragDropProps {
  onDragEnd?: (event: DragEndEvent) => void;
  onDragStart?: () => void;
  enableFastHorizontalScroll?: boolean;
}

export const useKanbanDragDrop = ({
  onDragEnd,
  onDragStart,
  enableFastHorizontalScroll = true,
}: UseKanbanDragDropProps = {}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Custom fast horizontal auto-scroll
  useEffect(() => {
    if (!enableFastHorizontalScroll || !activeId || !dragPosition) return;

    const handleFastScroll = () => {
      const scrollContainer =
        document.querySelector('.kanban-container') ||
        document.querySelector('[class*="kanban"]') ||
        document.querySelector('[style*="overflow-x"]');

      if (!scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const { x } = dragPosition;

      const baseSpeed = 25;
      const maxSpeed = 40;
      const edgeThreshold = 100;

      let scrollSpeed = 0;

      // Scroll left
      if (x < containerRect.left + edgeThreshold) {
        const distance = Math.max(0, (containerRect.left + edgeThreshold) - x);
        const speedMultiplier = Math.min(distance / edgeThreshold, 1);
        scrollSpeed = -(baseSpeed + (maxSpeed - baseSpeed) * speedMultiplier);
      }
      // Scroll right
      else if (x > containerRect.right - edgeThreshold) {
        const distance = Math.max(0, x - (containerRect.right - edgeThreshold));
        const speedMultiplier = Math.min(distance / edgeThreshold, 1);
        scrollSpeed = baseSpeed + (maxSpeed - baseSpeed) * speedMultiplier;
      }

      if (scrollSpeed !== 0) {
        scrollContainer.scrollLeft = Math.max(0, scrollContainer.scrollLeft + scrollSpeed);
      }
    };

    const intervalId = setInterval(handleFastScroll, 12);
    return () => clearInterval(intervalId);
  }, [activeId, dragPosition, enableFastHorizontalScroll]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    onDragStart?.();

    if (enableFastHorizontalScroll) {
      const handleMouseMove = (e: MouseEvent) => {
        setDragPosition({ x: e.clientX, y: e.clientY });
      };

      const handlePointerMove = (e: PointerEvent) => {
        setDragPosition({ x: e.clientX, y: e.clientY });
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('pointermove', handlePointerMove, { passive: true });

      const cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('pointermove', handlePointerMove);
        setDragPosition(null);
      };

      (window as any).__dragCleanup = cleanup;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);

    if ((window as any).__dragCleanup) {
      (window as any).__dragCleanup();
      delete (window as any).__dragCleanup;
    }

    onDragEnd?.(event);
  };

  return {
    sensors,
    activeId,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
