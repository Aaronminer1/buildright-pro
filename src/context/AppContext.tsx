import React, { createContext, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Project, ChecklistState } from '../types';

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
  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').toArray(), []) ?? [];

  const activeIdRow = useLiveQuery(() => db.settings.get('activeProjectId'), []);
  const activeProjectId: string | null =
    activeIdRow === undefined ? null : ((activeIdRow?.value ?? null) as string | null);

  const checklistRows = useLiveQuery(() => db.checklistPhases.toArray(), []) ?? [];
  const checklistState: ChecklistState = Object.fromEntries(
    checklistRows.map(r => [r.phaseId, r.items])
  );

  const addProject = (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const project: Project = { ...p, id: `proj_${Date.now()}`, createdAt: now, updatedAt: now };
    db.transaction('rw', [db.projects, db.settings], async () => {
      await db.projects.add(project);
      await db.settings.put({ key: 'activeProjectId', value: project.id });
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    db.projects.update(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const deleteProject = (id: string) => {
    db.transaction('rw', [db.projects, db.settings], async () => {
      await db.projects.delete(id);
      if (activeProjectId === id) {
        await db.settings.put({ key: 'activeProjectId', value: null });
      }
    });
  };

  const setActiveProjectId = (id: string | null) => {
    db.settings.put({ key: 'activeProjectId', value: id });
  };

  const toggleChecklistItem = (phaseId: string, itemId: string) => {
    db.checklistPhases.get(phaseId).then(existing => {
      const items = { ...(existing?.items ?? {}), [itemId]: !existing?.items?.[itemId] };
      db.checklistPhases.put({ phaseId, items });
    });
  };

  const resetPhaseChecklist = (phaseId: string) => {
    db.checklistPhases.put({ phaseId, items: {} });
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
