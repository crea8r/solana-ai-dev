import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';
import { Docs } from './DocsContext';
import { CodeFile } from './CodeFileContext';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { ProjectInfoToSave } from '../interfaces/project';

export interface InMemoryProject {
  //id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  files: FileTreeItemType;
  codes?: CodeFile[];
  docs?: Docs[];
}

interface Program {
  id: string;
  label: string;
  localValues: {
    name: string;
    description?: string;
  };
}

interface ProjectDetails {
  nodes: Node[];
  edges: Edge[];
}

export interface SavedProject {
  id?: string | undefined;
  name: string;
  description: string;
  details: ProjectDetails;
  rootPath: string;
}

interface ProjectContextType {
  project: InMemoryProject | null;
  savedProject: SavedProject | null;
  setProject: (project: InMemoryProject | null) => void;
  updateProject: (updatedData: Partial<InMemoryProject>) => void;
  updateSavedProject: (updatedData: Partial<SavedProject>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [project, setProject] = useState<InMemoryProject | null>(null);
  const [savedProject, setSavedProject] = useState<SavedProject | null>(null);

  const updateSavedProject = (updatedData: Partial<SavedProject>) => {
    setSavedProject((prevProject) => {
      if (!prevProject) {
        return {
          id: updatedData.id || undefined,
          name: updatedData.name || '',
          description: updatedData.description || '',
          details: {
            nodes: updatedData.details?.nodes || [],
            edges: updatedData.details?.edges || [],
          },
          files: { name: '', children: [] },
          rootPath: updatedData.rootPath || '',
          codes: [],
          docs: [],
        };
      }
      return {
        ...prevProject,
        ...updatedData,
        id: updatedData.id || prevProject.id,
        details: {
          nodes: updatedData.details?.nodes || prevProject.details.nodes,
          edges: updatedData.details?.edges || prevProject.details.edges,
        },
        rootPath: updatedData.rootPath || prevProject.rootPath,
      };
    });
  };

  const updateProject = (updatedData: Partial<InMemoryProject>) => {
    setProject((prevProject) => {
      if (!prevProject) {
        return {
          name: updatedData.name || '[Project Context] Project name',
          description: updatedData.description || '[Project Context] project description',
          nodes: updatedData.nodes || [],
          edges: updatedData.edges || [],
          files: updatedData.files || { name: '', children: [] },
          codes: updatedData.codes || [],
          docs: updatedData.docs || [],
        };
      }
      return {
        ...prevProject,
        ...updatedData,
        nodes: updatedData.nodes || prevProject.nodes,
      };
    });
  };

  useEffect(() => {
    if (project) {
      console.log('[Project Context] Project updated:', project);
    }
  }, [project]);

  return (
    <ProjectContext.Provider value={{ project, savedProject, setProject, updateProject, updateSavedProject }}>
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
