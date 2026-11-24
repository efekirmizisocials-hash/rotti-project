/**
 * useProjects (showcase build): localStorage-backed, no auth, no realtime.
 */

import { useCallback } from "react";
import { create } from "zustand";
import { Project } from "../types";
import { newId, readCollection, writeCollection } from "../mocks/localDb";
import { buildSeedProjects } from "../mocks/seed";

const STORAGE_KEY = "projects";

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, "id">) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

function load(): Project[] {
  const stored = readCollection<Project[]>(STORAGE_KEY);
  if (stored) return stored;
  const seeded = buildSeedProjects();
  writeCollection(STORAGE_KEY, seeded);
  return seeded;
}

const useProjectsStore = create<{ projects: Project[] }>(() => ({
  projects: load(),
}));

useProjectsStore.subscribe((state, prev) => {
  if (state.projects !== prev.projects)
    writeCollection(STORAGE_KEY, state.projects);
});

/** Restores the original seed data (used by the "Reset demo" button). */
export function resetProjects(): void {
  useProjectsStore.setState({ projects: buildSeedProjects() });
}

export function useProjects(): UseProjectsReturn {
  const projects = useProjectsStore((s) => s.projects);

  const addProject = useCallback(
    async (project: Omit<Project, "id">): Promise<Project> => {
      const created: Project = { ...project, id: newId() };
      useProjectsStore.setState((s) => ({
        projects: [...s.projects, created],
      }));
      return created;
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>): Promise<Project> => {
      let updated: Project | undefined;
      useProjectsStore.setState((s) => ({
        projects: s.projects.map((p) => {
          if (p.id !== id) return p;
          updated = { ...p, ...updates };
          return updated;
        }),
      }));
      if (!updated) throw new Error(`Project not found: ${id}`);
      return updated;
    },
    [],
  );

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    useProjectsStore.setState((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const refetch = useCallback(async () => {
    useProjectsStore.setState({ projects: load() });
  }, []);

  return {
    projects,
    loading: false,
    error: null,
    addProject,
    updateProject,
    deleteProject,
    refetch,
  };
}

export default useProjects;
