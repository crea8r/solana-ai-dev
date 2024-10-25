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
    isCode: project.details.isCode,
  },
});

interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
  projectInfoToSave: ProjectInfoToSave; 
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
    },
  });

  // Create a useRef to store the latest ProjectInfoToSave
  const projectInfoToSaveRef = useRef<ProjectInfoToSave>(transformToProjectInfoToSave(projectContext));

  // useEffect to update ref when projectContext changes
  useEffect(() => {
    projectInfoToSaveRef.current = transformToProjectInfoToSave(projectContext);
  }, [projectContext]);

  return (
    <ProjectContext.Provider
      value={{ 
        projectContext, 
        setProjectContext, 
        projectInfoToSave: projectInfoToSaveRef.current
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
