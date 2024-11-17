import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { Project, ProjectInfoToSave } from '../interfaces/project';

// Define transformation function
export const transformToProjectInfoToSave = (project: Project): ProjectInfoToSave => ({
  id: project.id,
  name: project.name,
  description: project.description,
  details: {
    nodes: project.details.nodes,
    edges: project.details.edges,
    isAnchorInit: project.details.isAnchorInit,
    isCode: project.details.isCode,
    aiFilePaths: project.details.aiFilePaths,
    aiStructure: project.details.aiStructure,
  },
  aiModel: project.aiModel,
  apiKey: project.apiKey,
});

interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
  projectInfoToSave: ProjectInfoToSave;
  setProjectInfoToSave: Dispatch<SetStateAction<ProjectInfoToSave>>;
  stateContent: string;
  setStateContent: Dispatch<SetStateAction<string>>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [projectContext, setProjectContext] = useState<Project>({
    id: '',
    rootPath: '',
    name: '',
    description: '',
    details: {
      nodes: [],
      edges: [],
      files: { name: '', type: 'directory', children: [] },
      codes: [],
      docs: [],
      isAnchorInit: false,
      isCode: false,
      aiFilePaths: [],
      aiStructure: '',
      stateContent: '',
    },
    aiModel: '',
    apiKey: '',
  });

  // State for projectInfoToSave, initially synchronized with projectContext
  const [projectInfoToSave, setProjectInfoToSave] = useState<ProjectInfoToSave>(
    transformToProjectInfoToSave(projectContext)
  );

  // State for stateContent
  const [stateContent, setStateContent] = useState<string>('');

  // Synchronize projectInfoToSave whenever projectContext changes
  useEffect(() => {
    setProjectInfoToSave(transformToProjectInfoToSave(projectContext));
  }, [projectContext]);

  return (
    <ProjectContext.Provider
      value={{
        projectContext,
        setProjectContext,
        projectInfoToSave,
        setProjectInfoToSave,
        stateContent,
        setStateContent,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
