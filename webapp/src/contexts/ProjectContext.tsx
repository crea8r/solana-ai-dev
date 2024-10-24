import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Edge, Node } from 'react-flow-renderer';
import { FileTreeItemType } from '../components/FileTree';
import { Docs } from './DocsContext';
import { CodeFile } from './CodeFileContext';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { ProjectInfoToSave } from '../interfaces/project';

interface ProjectDetails {
  nodes: Node[];
  edges: Edge[];
}

export interface SavedProject {
  id?: string;
  rootPath?: string;
  name: string;
  description: string;
  details: ProjectDetails;
  files: FileTreeItemType;
  codes?: CodeFile[];
  docs?: Docs[];
  projectSaved: boolean;
  anchorInitCompleted: boolean;
  filesAndCodesGenerated: boolean;
}

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

  // Initialize savedProject with default values
  const [savedProject, setSavedProject] = useState<SavedProject>({
    id: '',
    rootPath: '',
    name: '',
    description: '',
    details: {
      nodes: [],
      edges: [],
    },
    files: { name: '', children: [] },
    codes: [],
    docs: [],
    projectSaved: false,
    anchorInitCompleted: false,
    filesAndCodesGenerated: false,
  });

  const updateSavedProject = (updatedData: Partial<SavedProject>) => {
    setSavedProject((prevProject) => {
      // Merge existing savedProject state with new updatedData
      const newProject = {
        id: updatedData.id ?? prevProject.id,
        rootPath: updatedData.rootPath ?? prevProject.rootPath,
        name: updatedData.name ?? prevProject.name,
        description: updatedData.description ?? prevProject.description,
        details: {
          nodes: updatedData.details?.nodes ?? prevProject.details.nodes,
          edges: updatedData.details?.edges ?? prevProject.details.edges,
        },
        files: updatedData.files ?? prevProject.files,
        codes: updatedData.codes ?? prevProject.codes,
        docs: updatedData.docs ?? prevProject.docs,
        projectSaved: updatedData.projectSaved ?? prevProject.projectSaved,
        anchorInitCompleted: updatedData.anchorInitCompleted ?? prevProject.anchorInitCompleted,
        filesAndCodesGenerated: updatedData.filesAndCodesGenerated ?? prevProject.filesAndCodesGenerated,
      };
      return newProject;
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

  /*
  useEffect(() => {
    if (savedProject) {
      console.log(`[Project Context] savedProject updated: \n Project ID: ${savedProject.id} \n Root Path: ${savedProject.rootPath} \n Name: ${savedProject.name} \n Description: ${savedProject.description}`);
    }
  }, [savedProject]);

  useEffect(() => {
      if (project) {
      console.log(`[Project Context] project updated: \n Project Name: ${project.name} \n ProjectDescription: ${project.description} \n Nodes: ${JSON.stringify(project.nodes)}`);
    }
  }, [project]);
  */

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
