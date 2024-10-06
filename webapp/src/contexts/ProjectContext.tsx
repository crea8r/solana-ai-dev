import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';

interface CodeFile {
  name: string;
  path: string;
  content: string;
}

interface InMemoryProject {
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes?: CodeFile[];
}

interface ProjectContextType {
  project: InMemoryProject | null;
  setProject: (project: InMemoryProject | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [project, setProject] = useState<InMemoryProject | null>(null);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
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
