import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';

interface CodeFile {
  name: string;
  path: string;
  content: string;
}

// project detail coming from the server
// created_at: string
// description: string
// details: any // nodes, edges, files, ...
// fileTree: []any // []{ext, name, path, type: "file"|"description"}
// id: string
// last_updated: string
// name: string
// org_id: string
// recentTasks: []any // []{created_at, id, last_updated, name, status}
// root_path: string

// fileTree fetched from the server, not always the real data structure
// how do I decide if it is the latest data structure?

// TODO: those are information fetched from the server, how you want to keep them in the client?

// in the client, you are dealing with these info:
// nodes: Node[], edges: Edge[], files: FileTreeItemType, codes?: CodeFile[]
// later on, you will have docfiles: FileTreeItemType, docs: DocFile[]

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
