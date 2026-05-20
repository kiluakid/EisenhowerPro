import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Moon, Sun, Save, Plus, Calendar as CalendarIcon, Bell, SortAsc, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskBoard from './TaskBoard';
import TaskModal from './TaskModal';

export default function Dashboard() {
  const { isDark, toggleTheme, saveData, activeCalendarId, calendars, setActiveCalendarId, setCalendars, tasks } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'due' | 'name'>('due');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeCalendar = calendars.find(c => c.id === activeCalendarId);

  // Urgent tasks: due within the next 24 hours OR overdue, AND in "do" or "decide" quadrant
  const urgentTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.calendarId !== activeCalendarId) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate).getTime();
      const now = Date.now();
      const hoursDiff = (due - now) / (1000 * 60 * 60);
      return hoursDiff <= 24 && (t.quadrant === 'do' || t.quadrant === 'decide');
    });
  }, [tasks, activeCalendarId]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveData();
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Eisenhower<span className="text-indigo-500 dark:text-indigo-400">Pro</span></h1>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-black/40 rounded-lg p-1 border border-transparent dark:border-white/5 overflow-x-auto">
            {calendars.map(cal => (
              <button
                key={cal.id}
                onClick={() => setActiveCalendarId(cal.id)}
                className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                  activeCalendarId === cal.id
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-[#1A1A1A] dark:text-white dark:shadow-none'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline mr-1.5 text-xs opacity-70">
                  {/* Just use a small dot for the calendar icon in elegant design */
                   cal.id === activeCalendarId ? '•' : ''}
                </span>
                {cal.name}
              </button>
            ))}
            <button
              onClick={() => {
                const name = prompt("Digite o nome do novo calendário/projeto:");
                if (name && name.trim()) {
                  const id = crypto.randomUUID();
                  setCalendars(prev => [...prev, { id, name: name.trim() }]);
                  setActiveCalendarId(id);
                }
              }}
              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-800 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              title="Novo Calendário"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors relative text-zinc-600 dark:text-slate-400"
              title="Notificações"
            >
                <Bell className="w-5 h-5" />
                {urgentTasks.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-200"
                  >
                    <div className="p-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#141414]">
                      <h3 className="font-semibold text-sm">Tarefas Urgentes</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {urgentTasks.length === 0 ? (
                        <p className="p-4 text-xs text-center text-zinc-500 dark:text-slate-500">Nenhuma tarefa urgente para breve.</p>
                      ) : (
                        urgentTasks.map(t => (
                          <div key={t.id} className="p-2 text-sm hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg mb-1 flex items-start gap-2 border border-transparent dark:hover:border-white/5">
                            <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
                            <div>
                              <p className="font-medium">{t.title}</p>
                              <p className="text-xs text-zinc-500">Vencimento: {new Date(t.dueDate!).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'due' ? 'name' : 'due')}
            className="p-1.5 sm:p-2 rounded hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-600 dark:text-slate-400"
            title={`Ordenar por: ${sortOrder === 'due' ? 'Vencimento' : 'Nome'}`}
          >
            {sortOrder === 'due' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-600 dark:text-slate-400"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-md transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-50"
          >
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar Matriz'}</span>
            <Save className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {activeCalendar?.name || 'Matriz'}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1A1A1A] dark:hover:bg-white/5 text-zinc-900 dark:text-white text-sm font-semibold rounded-md transition-all border border-zinc-200 dark:border-white/10 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Tarefa
          </button>
        </div>

        <TaskBoard sortOrder={sortOrder} />
      </main>

      {/* Footer */}
      <footer className="h-8 bg-white dark:bg-black border-t border-zinc-200 dark:border-white/5 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="text-[9px] text-zinc-500 dark:text-slate-500 uppercase tracking-widest">Matriz EisenhowerPro v1.0.0</div>
        <div className="text-[9px] text-zinc-500 dark:text-slate-500">Salvamento automático disponível</div>
      </footer>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
