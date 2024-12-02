import React, { useRef, useCallback } from 'react';
import { Box } from '@mui/material';

interface ResizablePanelProps {
  isSideBySide: boolean;
  splitPosition: number;
  onSplitChange: (position: number) => void;
  children: [React.ReactNode, React.ReactNode];
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  isSideBySide,
  splitPosition,
  onSplitChange,
  children
}) => {
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      if (isSideBySide) {
        const position = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        onSplitChange(Math.min(Math.max(position, 20), 80));
      } else {
        const position = ((e.clientY - containerRect.top) / containerRect.height) * 100;
        onSplitChange(Math.min(Math.max(position, 20), 80));
      }
    };

    const stopDragging = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
  }, [isSideBySide, onSplitChange]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: isSideBySide ? 'row' : 'column',
        height: '600px',
        position: 'relative',
        gap: 0
      }}
    >
      <Box
        sx={{
          [isSideBySide ? 'width' : 'height']: `${splitPosition}%`,
          position: 'relative',
          p: 0.5
        }}
      >
        {children[0]}
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          backgroundColor: '#f0f0f0',
          ...(isSideBySide
            ? {
                width: '4px',
                height: '100%',
                left: `${splitPosition}%`,
                transform: 'translateX(-50%)',
                cursor: 'col-resize'
              }
            : {
                height: '4px',
                width: '100%',
                top: `${splitPosition}%`,
                transform: 'translateY(-50%)',
                cursor: 'row-resize'
              }),
          zIndex: 1,
          '&:hover': {
            backgroundColor: '#bdbdbd'
          }
        }}
        onMouseDown={startDragging}
      />
      
      <Box
        sx={{
          [isSideBySide ? 'width' : 'height']: `${100 - splitPosition}%`,
          position: 'relative',
          p: 0.5
        }}
      >
        {children[1]}
      </Box>
    </Box>
  );
};
