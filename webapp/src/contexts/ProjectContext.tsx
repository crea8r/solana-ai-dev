import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { Project, ProjectDetails, ProjectInfoToSave, triggerType } from '../interfaces/project';
import { getWalletInfo } from '../api/wallet';
import { ProgramContext, InstructionContext, AccountContext } from '../interfaces/project';
import { intervalEnum, orderEnum } from '../interfaces/project';

export const transformToProjectInfoToSave = (project: Project): ProjectInfoToSave => ({
  id: project.id,
  name: project.name,
  description: project.description,
  details: {
    nodes: project.details.nodes,
    edges: project.details.edges,
    designIdl: project.details.designIdl,
    uiStructure: project.details.uiStructure,
    isAnchorInit: project.details.isAnchorInit,
    isCode: project.details.isCode,
    files: project.details.files,
    filePaths: project.details.filePaths.map(filePath => filePath.path),
    fileTree: project.details.fileTree,
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
    programId: project.details.programId,
    pdas: project.details.pdas,
    keyFeatures: project.details.keyFeatures,
    userInteractions: project.details.userInteractions,
    sectorContext: project.details.sectorContext,
    optimizationGoals: project.details.optimizationGoals,
    uiHints: project.details.uiHints, 
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
  updateKeyFeatures: (features: string[]) => void; 
  updateUserInteractions: (interactions: string[]) => void; 
  updateUiHints: (hints: string[]) => void; 
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectContext, setProjectContext] = useState<Project>(() => {
    const savedProject = sessionStorage.getItem('projectContext');
    return savedProject
      ? JSON.parse(savedProject)
      : {
          id: '',
          rootPath: '',
          name: '',
          description: '',
          details: {
            nodes: [],
            edges: [],
            designIdl: {},
            uiStructure: {},
            files: { name: '', type: 'directory', children: [] },
            codes: [],
            docs: [],
            isAnchorInit: false,
            isCode: false,
            filePaths: [],
            fileTree: { name: '', type: 'directory', children: [] },
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
            programId: '',
            pdas: [],
            keyFeatures: [],
            userInteractions: [],
            sectorContext: '',
            optimizationGoals: [],
            uiHints: [],
          },
        };
  });

  const [projectInfoToSave, setProjectInfoToSave] = useState<ProjectInfoToSave>(transformToProjectInfoToSave(projectContext));
  const [stateContent, setStateContent] = useState<string>('');

  const updateKeyFeatures = (features: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        keyFeatures: features,
      },
    }));
  };

  const updateUserInteractions = (interactions: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        userInteractions: interactions,
      },
    }));
  };

  const updateUiHints = (hints: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        uiHints: hints,
      },
    }));
  };

  const updateInstructions = (instructions: ProjectDetails['aiInstructions']) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        aiInstructions: instructions,
      },
    }));
  };

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
        updateKeyFeatures, 
        updateUserInteractions, 
        updateUiHints,
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
