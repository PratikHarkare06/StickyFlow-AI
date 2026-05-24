import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  count: number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, children, count }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-card-app/50 border border-border-app rounded-[2rem] p-4 lg:p-6 min-h-[500px] shadow-sm transition-colors",
        isOver && "bg-white/5 border-accent-blue/50"
      )}
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl font-black">{title}</h3>
        <span className="bg-text-app/10 text-text-app text-xs font-bold px-3 py-1 rounded-full">{count}</span>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};
