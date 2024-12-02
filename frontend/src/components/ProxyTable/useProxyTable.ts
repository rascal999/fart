import { useState, useRef, useEffect, useCallback } from 'react';
import { Column, ProxyTableState, ProxyTableHandlers } from './types';
import { ProxyLog } from '../../types/proxy';

const initialColumns: Column[] = [
  { id: 'id', width: 60, label: 'ID', sortable: true, visible: true, priority: true },
  { id: 'timestamp', width: 140, label: 'Timestamp', sortable: true, visible: true, priority: true },
  { id: 'method', width: 70, label: 'Method', sortable: true, visible: true, priority: true },
  { id: 'url', width: 280, label: 'URL', sortable: true, visible: true, priority: true },
  { id: 'status', width: 70, label: 'Status', sortable: true, visible: true, priority: true },
  { id: 'content_length', width: 100, label: 'Response Length', sortable: true, visible: true, priority: true },
  { id: 'actions', width: 130, label: 'Actions', sortable: false, visible: true }
];

const initialColumnOrder = initialColumns.map(col => col.id);

export const useProxyTable = (): [ProxyTableState, ProxyTableHandlers] => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialColumnOrder);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ProxyTableState['contextMenu']>(null);
  const resizingColumnRef = useRef<number | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || resizingColumnRef.current === null) return;

    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(50, startWidthRef.current + diff);
    
    setColumns(prev => prev.map((col, index) => 
      index === resizingColumnRef.current 
        ? { ...col, width: newWidth }
        : col
    ));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    resizingColumnRef.current = null;
    document.body.style.cursor = 'default';
  }, []);

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
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const startResize = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingColumnRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = columns[index].width;
  }, [columns]);

  const handleDragStart = useCallback((columnId: string) => {
    setIsDragging(true);
    setDraggedColumn(columnId);
    setTargetColumn(null);
  }, []);

  const handleDragOver = useCallback((columnId: string) => {
    if (!draggedColumn || draggedColumn === columnId) return;
    setTargetColumn(columnId);
  }, [draggedColumn]);

  const handleDrop = useCallback(() => {
    if (!draggedColumn || !targetColumn) return;

    setColumnOrder(prev => {
      const newOrder = [...prev];
      const draggedIdx = newOrder.indexOf(draggedColumn);
      const targetIdx = newOrder.indexOf(targetColumn);
      
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedColumn);
      
      return newOrder;
    });
  }, [draggedColumn, targetColumn]);

  const handleDragEnd = useCallback(() => {
    if (targetColumn) {
      handleDrop();
    }
    setIsDragging(false);
    setDraggedColumn(null);
    setTargetColumn(null);
  }, [targetColumn, handleDrop]);

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, visible }
        : col
    ));
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent, log: ProxyLog) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      log
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return [
    {
      columns,
      columnOrder,
      isResizing,
      resizingColumnRef: resizingColumnRef.current,
      startX: startXRef.current,
      startWidth: startWidthRef.current,
      contextMenu,
      isDragging,
      draggedColumn,
      targetColumn
    },
    {
      handleMouseMove,
      handleMouseUp,
      startResize,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleColumnVisibilityChange,
      handleContextMenu,
      handleCloseContextMenu
    }
  ];
};
