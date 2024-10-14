import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';
import { Docs } from './DocsContext';
import { CodeFile } from './CodeFileContext';

export interface InMemoryProject {
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes?: CodeFile[];
  docs?: Docs[];
}

interface ProjectContextType {
  project: InMemoryProject | null;
  setProject: (project: InMemoryProject | null) => void;
  updateProject: (updatedData: Partial<InMemoryProject>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [project, setProject] = useState<InMemoryProject | null>(null);

  const updateProject = (updatedData: Partial<InMemoryProject>) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        ...updatedData,
      };
    });
  };

  return (
    <ProjectContext.Provider value={{ project, setProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
