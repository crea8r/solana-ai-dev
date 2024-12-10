import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { Project, ProjectDetails, ProjectInfoToSave } from '../interfaces/project';
import { getWalletInfo } from '../api/wallet';

export const transformToProjectInfoToSave = (project: Project): ProjectInfoToSave => ({
  id: project.id,
  name: project.name,
  description: project.description,
  walletPublicKey: project.walletPublicKey,
  aiModel: project.aiModel,
  apiKey: project.apiKey,
  details: {
    nodes: project.details.nodes,
    edges: project.details.edges,
    isAnchorInit: project.details.isAnchorInit,
    isCode: project.details.isCode,
    aiFilePaths: project.details.aiFilePaths,
    aiStructure: project.details.aiStructure,
    uiResults: project.details.uiResults,
    aiInstructions: project.details.aiInstructions,
    sdkFunctions: project.details.sdkFunctions,
    buildStatus: project.details.buildStatus,
    deployStatus: project.details.deployStatus,
    isSdk: project.details.isSdk,
    isUi: project.details.isUi,
    genUiClicked: project.details.genUiClicked,
    idl: project.details.idl,
    sdk: project.details.sdk,
    walletPublicKey: project.details.walletPublicKey,
    walletSecretKey: project.details.walletSecretKey,
    programId: project.details.programId,
    pdas: project.details.pdas,
  },
});

interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
  projectInfoToSave: ProjectInfoToSave;
  setProjectInfoToSave: Dispatch<SetStateAction<ProjectInfoToSave>>;
  stateContent: string;
  setStateContent: Dispatch<SetStateAction<string>>;
  updateInstructions: (instructions: ProjectDetails['aiInstructions']) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  let savedProject: Project | null = null;
  const [projectContext, setProjectContext] = useState<Project>(() => {
    const savedProject = sessionStorage.getItem('projectContext');
    return savedProject
      ? JSON.parse(savedProject)
      : {
        id: '',
        rootPath: '',
        name: '',
        description: '',
        aiModel: 'codestral-latest',
        apiKey: '',
        walletPublicKey: '',
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
          uiResults: [],
          aiInstructions: [],
          sdkFunctions: [],
          buildStatus: false,
          deployStatus: false,
          isSdk: false,
          isUi: false,
          genUiClicked: false,
          idl: { fileName: '', content: '', parsed: { instructions: [], accounts: [] } },
          sdk: { fileName: '', content: '' },
          walletPublicKey: '',
          walletSecretKey: '',
          programId: '',
          pdas: [],
        },
      };
  });

  const updateInstructions = (instructions: ProjectDetails['aiInstructions']) => {
    setProjectContext((prev) => ({
      ...prev,
      aiInstructions: instructions,
    }));
  };

  const [projectInfoToSave, setProjectInfoToSave] = useState<ProjectInfoToSave>(transformToProjectInfoToSave(projectContext));
  const [stateContent, setStateContent] = useState<string>('');

  useEffect(() => {
    if (projectContext) sessionStorage.setItem('projectContext', JSON.stringify(projectContext));
    setProjectInfoToSave(transformToProjectInfoToSave(projectContext));
  }, [projectContext]);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const walletInfo = await getWalletInfo(projectContext.id);
        setProjectContext((prev) => ({
          ...prev,
          walletPublicKey: walletInfo.publicKey,
        }));
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
      }
    };

    fetchWalletInfo();
  }, [projectContext.id]);

  return (
    <ProjectContext.Provider
      value={{
        projectContext,
        setProjectContext,
        projectInfoToSave,
        setProjectInfoToSave,
        stateContent,
        setStateContent,
        updateInstructions,
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
