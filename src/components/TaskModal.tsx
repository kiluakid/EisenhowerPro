import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { QuadrantType } from '../types';
import { useAppContext } from '../AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ isOpen, onClose }: Props) {
  const { addTask, activeCalendarId } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [quadrant, setQuadrant] = useState<QuadrantType>('do');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNotes('');
      setDueDate('');
      setQuadrant('do');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      notes: notes.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      quadrant,
      calendarId: activeCalendarId,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Nova Tarefa</h2>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:bg-zinc-100 dark:text-slate-400 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-700 dark:text-slate-500">Título</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow text-zinc-900 dark:text-slate-200 text-sm"
                  placeholder="O que precisa ser feito?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-700 dark:text-slate-500">Data de Vencimento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow text-zinc-900 dark:text-slate-200 text-sm [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-700 dark:text-slate-500">Quadrante</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'do', label: 'Fazer', color: 'border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20' },
                    { val: 'decide', label: 'Agendar', color: 'border-indigo-500 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
                    { val: 'delegate', label: 'Delegar', color: 'border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20' },
                    { val: 'delete', label: 'Eliminar', color: 'border-zinc-500 text-zinc-700 dark:text-slate-400 bg-zinc-50 dark:bg-white/5' },
                  ].map(q => (
                    <button
                      key={q.val}
                      type="button"
                      onClick={() => setQuadrant(q.val as QuadrantType)}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        quadrant === q.val 
                          ? q.color 
                          : 'border-zinc-200 dark:border-white/5 bg-transparent text-zinc-600 dark:text-slate-500 hover:border-zinc-300 dark:hover:border-white/10 dark:hover:text-slate-300'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-700 dark:text-slate-500">Notas (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-2 h-24 resize-none bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow text-zinc-900 dark:text-slate-200 text-sm"
                  placeholder="Adicionar contexto, links ou detalhes..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-[#1A1A1A] hover:bg-zinc-200 dark:hover:bg-white/5 dark:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-md transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
