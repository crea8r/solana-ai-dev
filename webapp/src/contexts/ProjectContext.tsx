import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useRef } from 'react';
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
});

interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
  projectInfoToSave: ProjectInfoToSave;
  setProjectInfoToSave: Dispatch<SetStateAction<ProjectInfoToSave>>;
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
    },
  });

  // State for projectInfoToSave, initially synchronized with projectContext
  const [projectInfoToSave, setProjectInfoToSave] = useState<ProjectInfoToSave>(
    transformToProjectInfoToSave(projectContext)
  );

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
