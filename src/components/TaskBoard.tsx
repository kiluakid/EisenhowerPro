import React, { useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { QuadrantType, Task } from '../types';
import TaskItem from './TaskItem';

const QUADRANTS: { type: QuadrantType; title: string; subtitle: string; colorClass: string; bgClass: string; headerClass: string; titleWrapperClass: string }[] = [
  {
    type: 'do',
    title: 'Fazer Primeiro',
    subtitle: 'Urgente & Importante',
    colorClass: 'text-red-700 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-[#141414] border-red-200 dark:border-red-900/30 overflow-hidden',
    headerClass: 'border-b border-red-200/50 dark:border-white/5 bg-red-100/50 dark:bg-red-950/10',
    titleWrapperClass: 'text-[11px] font-bold uppercase tracking-widest',
  },
  {
    type: 'decide',
    title: 'Agendar',
    subtitle: 'Importante, Não Urgente',
    colorClass: 'text-indigo-700 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-[#141414] border-indigo-200 dark:border-indigo-900/30 overflow-hidden',
    headerClass: 'border-b border-indigo-200/50 dark:border-white/5 bg-indigo-100/50 dark:bg-indigo-950/10',
    titleWrapperClass: 'text-[11px] font-bold uppercase tracking-widest',
  },
  {
    type: 'delegate',
    title: 'Delegar',
    subtitle: 'Urgente, Não Importante',
    colorClass: 'text-orange-700 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-[#141414] border-orange-200 dark:border-orange-900/30 overflow-hidden',
    headerClass: 'border-b border-orange-200/50 dark:border-white/5 bg-orange-100/50 dark:bg-orange-950/10',
    titleWrapperClass: 'text-[11px] font-bold uppercase tracking-widest',
  },
  {
    type: 'delete',
    title: 'Eliminar',
    subtitle: 'Não Urgente, Não Importante',
    colorClass: 'text-zinc-600 dark:text-slate-500',
    bgClass: 'bg-zinc-50 dark:bg-[#141414] border-zinc-200 dark:border-white/5 overflow-hidden',
    headerClass: 'border-b border-zinc-200/50 dark:border-white/5 bg-zinc-100/50 dark:bg-transparent',
    titleWrapperClass: 'text-[11px] font-bold uppercase tracking-widest',
  }
];

interface Props {
  sortOrder: 'due' | 'name';
}

export default function TaskBoard({ sortOrder }: Props) {
  const { tasks, activeCalendarId } = useAppContext();

  const activeTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.calendarId === activeCalendarId);
    
    // Sort tasks
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.title.localeCompare(b.title);
      } else {
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });
    
    return filtered;
  }, [tasks, activeCalendarId, sortOrder]);

  const getTasksForQuadrant = (type: QuadrantType) => activeTasks.filter(t => t.quadrant === type);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1 h-full min-h-[600px]">
      {QUADRANTS.map(q => {
        const quadrantTasks = getTasksForQuadrant(q.type);
        
        return (
          <div
            key={q.type}
            className={`flex flex-col rounded-2xl border transition-colors ${q.bgClass}`}
          >
            <div className={`px-5 py-3 flex items-center justify-between ${q.headerClass}`}>
              <span className={`${q.titleWrapperClass} ${q.colorClass}`}>
                {q.title} <span className="hidden sm:inline lowercase text-[10px] font-normal opacity-70">({q.subtitle})</span>
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full inline-block ${
                q.type === 'do' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                q.type === 'decide' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                q.type === 'delegate' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                'bg-zinc-500/20 text-zinc-700 dark:text-slate-400'
              }`}>
                {quadrantTasks.length} {quadrantTasks.length === 1 ? 'Tarefa' : 'Tarefas'}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar">
              {quadrantTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-40">
                  <span className="text-sm border border-dashed rounded-lg px-4 py-8 w-full text-center border-current">
                    Sem tarefas aqui
                  </span>
                </div>
              ) : (
                quadrantTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
