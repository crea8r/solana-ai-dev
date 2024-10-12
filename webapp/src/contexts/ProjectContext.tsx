import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';

interface CodeFile {
  name: string;
  path: string;
  content: string;
}

interface Docs {
  title: string;
  content: string;
  lastUpdated: Date; 
}

interface InMemoryProject {
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes?: CodeFile[];
  docs?: Docs[]; 
}

interface ProjectContextType {
  project: InMemoryProject | null;
  setProject: (project: InMemoryProject | null) => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  updateFiles: (files: FileTreeItemType) => void;
  updateCodes: (codes: CodeFile[]) => void;
  updateDocs: (docs: Docs[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [project, setProject] = useState<InMemoryProject | null>(null);

  const updateNodes = (nodes: Node[]) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        nodes,
      };
    });
  };

  const updateEdges = (edges: Edge[]) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        edges,
      };
    });
  };
  
  const updateFiles = (files: FileTreeItemType) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        files,  // Update files while keeping the rest intact
      };
    });
  };

  const updateCodes = (codes: CodeFile[]) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        codes,  // Update codes while keeping the rest intact
      };
    });
  };

  const updateDocs = (docs: Docs[]) => {
    setProject((prevProject) => {
      if (!prevProject) return null;
      return {
        ...prevProject,
        docs,
      };
    });
  };
  
  

  return (
    <ProjectContext.Provider value={{
      project, 
      setProject, 
      updateNodes, 
      updateEdges, 
      updateFiles, 
      updateCodes, 
      updateDocs
    }}>
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
