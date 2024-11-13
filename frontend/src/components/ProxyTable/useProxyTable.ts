import { useState, useRef, useEffect } from 'react';
import { Column, ProxyTableState, ProxyTableHandlers } from './types';
import { ProxyLog } from '../../types/proxy';

const initialColumns: Column[] = [
  { id: 'id', width: 60, label: 'ID', sortable: true },
  { id: 'timestamp', width: 140, label: 'Timestamp', sortable: true },
  { id: 'method', width: 70, label: 'Method', sortable: true },
  { id: 'url', width: 280, label: 'URL', sortable: true },
  { id: 'status', width: 70, label: 'Status', sortable: true },
  { id: 'actions', width: 130, label: 'Actions', sortable: false }
];

export const useProxyTable = (): [ProxyTableState, ProxyTableHandlers] => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isResizing, setIsResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<ProxyTableState['contextMenu']>(null);
  const resizingColumnRef = useRef<number | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || resizingColumnRef.current === null) return;

    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(50, startWidthRef.current + diff);
    
    setColumns(prev => prev.map((col, index) => 
      index === resizingColumnRef.current 
        ? { ...col, width: newWidth }
        : col
    ));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    resizingColumnRef.current = null;
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing]);

  const startResize = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingColumnRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = columns[index].width;
  };

  const handleContextMenu = (event: React.MouseEvent, log: ProxyLog) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      log
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return [
    {
      columns,
      isResizing,
      resizingColumnRef: resizingColumnRef.current,
      startX: startXRef.current,
      startWidth: startWidthRef.current,
      contextMenu
    },
    {
      handleMouseMove,
      handleMouseUp,
      startResize,
      handleContextMenu,
      handleCloseContextMenu
    }
  ];
};
