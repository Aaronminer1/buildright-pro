import React, { createContext, useContext } from 'react';
import type { Project, ChecklistState } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  checklistState: ChecklistState;
  toggleChecklistItem: (phaseId: string, itemId: string) => void;
  resetPhaseChecklist: (phaseId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useLocalStorage<Project[]>('brp_projects', []);
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string | null>('brp_active', null);
  const [checklistState, setChecklistState] = useLocalStorage<ChecklistState>('brp_checklists', {});

  const addProject = (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const project: Project = {
      ...p,
      id: `proj_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [...prev, project]);
    setActiveProjectId(project.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setActiveProjectId(prev => prev === id ? null : prev);
  };

  const toggleChecklistItem = (phaseId: string, itemId: string) => {
    setChecklistState(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        [itemId]: !prev[phaseId]?.[itemId],
      },
    }));
  };

  const resetPhaseChecklist = (phaseId: string) => {
    setChecklistState(prev => ({ ...prev, [phaseId]: {} }));
  };

  return (
    <AppContext.Provider value={{
      projects,
      addProject,
      updateProject,
      deleteProject,
      activeProjectId,
      setActiveProjectId,
      checklistState,
      toggleChecklistItem,
      resetPhaseChecklist,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
