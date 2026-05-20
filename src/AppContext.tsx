import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AppData, Calendar, Task } from './types';

interface AppContextType {
  tasks: Task[];
  calendars: Calendar[];
  activeCalendarId: string;
  isDark: boolean;
  isLoading: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCalendars: React.Dispatch<React.SetStateAction<Calendar[]>>;
  setActiveCalendarId: (id: string) => void;
  toggleTheme: () => void;
  saveData: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([{ id: 'default', name: 'Minha Matriz' }]);
  const [activeCalendarId, setActiveCalendarId] = useState<string>('default');
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark(d => !d), []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data: AppData = await res.json();
          if (data.tasks) setTasks(data.tasks);
          if (data.calendars && data.calendars.length > 0) {
            setCalendars(data.calendars);
            setActiveCalendarId(data.calendars[0].id);
          }
          return;
        }
      } catch (e) {
        console.warn("Server unavailable, falling back to local storage:", e);
      }
      
      // Fallback to local storage
      const localData = localStorage.getItem('eisenhower_data');
      if (localData) {
        try {
          const data: AppData = JSON.parse(localData);
          if (data.tasks) setTasks(data.tasks);
          if (data.calendars && data.calendars.length > 0) {
            setCalendars(data.calendars);
            setActiveCalendarId(data.calendars[0].id);
          }
        } catch (e) {
          console.error("Local storage data corrupt", e);
        }
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const saveData = useCallback(async () => {
    const dataObj = { tasks, calendars };
    
    // Always save to local storage as fallback/sync
    localStorage.setItem('eisenhower_data', JSON.stringify(dataObj));
    
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj),
      });
      if (!res.ok) throw new Error('Failed to save to server');
    } catch (e) {
      console.warn("Could not save to server. Saved locally instead.", e);
    }
  }, [tasks, calendars]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    tasks,
    calendars,
    activeCalendarId,
    isDark,
    isLoading,
    setTasks,
    setCalendars,
    setActiveCalendarId,
    toggleTheme,
    saveData,
    addTask,
    updateTask,
    deleteTask,
  }), [tasks, calendars, activeCalendarId, isDark, isLoading, toggleTheme, saveData, addTask, updateTask, deleteTask]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
