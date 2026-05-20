import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { useAppContext } from '../AppContext';
import { Edit2, Trash2, Clock, StickyNote, ChevronDown } from 'lucide-react';
import EditTaskModal from './EditTaskModal';

interface Props {
  task: Task;
}

export default function TaskItem({ task }: Props) {
  const { deleteTask } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now();
  const hoverBorderColor = 
    task.quadrant === 'do' ? 'dark:hover:border-red-500/50 hover:border-red-300' :
    task.quadrant === 'decide' ? 'dark:hover:border-indigo-500/50 hover:border-indigo-300' :
    task.quadrant === 'delegate' ? 'dark:hover:border-orange-500/50 hover:border-orange-300' :
    'dark:hover:border-slate-500/50 hover:border-zinc-300';
    
  const dateColor = 
    task.quadrant === 'do' ? 'text-red-500 dark:text-red-400' :
    task.quadrant === 'decide' ? 'text-indigo-500 dark:text-indigo-400' :
    task.quadrant === 'delegate' ? 'text-orange-500 dark:text-orange-400' :
    'text-zinc-500 dark:text-slate-500';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-white/5 rounded-lg p-3 shadow-sm hover:shadow-md dark:hover:shadow-none transition-all relative group ${hoverBorderColor}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{task.title}</h4>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 dark:text-slate-500">
              {task.dueDate && (
                <div className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-red-600 dark:text-red-500 font-semibold' : dateColor}`}>
                  <Clock className="w-3 h-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {task.notes && (
                <div className="flex items-center gap-1">
                  <StickyNote className="w-3 h-3" />
                  <span>Notas</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-black/40 rounded-lg p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-blue-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors rounded-md"
              title="Editar Tarefa"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors rounded-md"
              title="Excluir Tarefa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {task.notes && (
          <div className="mt-2 text-[11px] text-zinc-600 dark:text-slate-400">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors mb-1"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? 'Ocultar Notas' : 'Mostrar Notas'}
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="pt-1 whitespace-pre-wrap">{task.notes}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      
      {isEditOpen && <EditTaskModal task={task} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />}
    </>
  );
}
