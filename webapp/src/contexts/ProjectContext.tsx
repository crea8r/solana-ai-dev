import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { Project } from '../interfaces/project';

interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
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
      docs: [], // remove this later to save docs on server like code files
      isAnchorInit: false,
      isCode: false,
    },
  });

  return (
    <ProjectContext.Provider value={{ projectContext: projectContext, setProjectContext: setProjectContext}}>
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
