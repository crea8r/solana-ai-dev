import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { Project, ProjectDetails, ProjectInfoToSave, triggerType } from '../interfaces/project';
import { getWalletInfo } from '../api/wallet';
import { ProgramContext, InstructionContext, AccountContext } from '../interfaces/project';
import { intervalEnum, orderEnum } from '../interfaces/project';

// Updated transform function to include additional user input fields, including uiHints
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
    // New fields added
    keyFeatures: project.details.keyFeatures,
    userInteractions: project.details.userInteractions,
    sectorContext: project.details.sectorContext,
    optimizationGoals: project.details.optimizationGoals,
    uiHints: project.details.uiHints, // Added uiHints for UI generation
  },
});

// Updated interface for ProjectContextType
interface ProjectContextType {
  projectContext: Project;
  setProjectContext: Dispatch<SetStateAction<Project>>;
  projectInfoToSave: ProjectInfoToSave;
  setProjectInfoToSave: Dispatch<SetStateAction<ProjectInfoToSave>>;
  stateContent: string;
  setStateContent: Dispatch<SetStateAction<string>>;
  updateInstructions: (instructions: ProjectDetails['aiInstructions']) => void;
  updateKeyFeatures: (features: string[]) => void; // New updater for keyFeatures
  updateUserInteractions: (interactions: string[]) => void; // New updater for userInteractions
  updateUiHints: (hints: string[]) => void; // New updater for uiHints
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const defaultProgram: ProgramContext = {
  id: '',
  name: '',
  description: '',
  account: [],
  instruction: [],
  dependencies: [],
  security: '',
  sector: [],
}

const defaultInstruction: InstructionContext = {
  id: '',
  name: '',
  description: '',
  programId: [],
  category: [],
  params: [{
    name: '',
    type: '',
    input_source: [],
    default_value: '',
    validation: [],
  }],
  logic: [],
  output: [{
    name: '',
    type: '',
    description: '',
  }],
  pda: [{
    name: '',
    seeds: [],
    bump: 0,
  }],
  authenticated_accounts: [{
    name: '',
    public_key: [],
  }],
  relationships: [{
    name: '',
    type: '',
    description: '',
  }],
  state_changes: [{
    account_id: '',
    account_name: '',
    before: '',
    after: '',
  }],
  events: [{
    name: '',
    description: '',
    fields: [{
      name: '',
      type: '',
    }],
  }],
  conditions: [
    { condition: '', order: orderEnum.before },
    { condition: '', order: orderEnum.after },
  ],
  triggers: [{
    type: triggerType.event,
    description: '',
    source: [{ name: '', description: '' }],
    schedule: [{
      time: '',
      interval: intervalEnum.daily,
      description: '', // template literal insertion of values
    }],
    account: [{
      id: '',
      name: '',
      description: '',
      state: [],
    }],
  }],
} 

const defaultAccount: AccountContext = {
  id: '',
  name: '',
  description: '',
  publicKey: '',
  category: [],
  programId: [],
  is_mutable: false,
  is_signer: false,
  is_writable: false,
  initialized_by: [],
  structure: {
    key: '',
    value: '',
  },
}

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
            program: [defaultProgram],
            instruction: [defaultInstruction],
            accounts: [defaultAccount],
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
            programId: '',
            pdas: [],
            // New fields added to default state
            keyFeatures: [],
            userInteractions: [],
            sectorContext: '',
            optimizationGoals: [],
            uiHints: [], // Added default state for uiHints
          },
        };
  });

  const [projectInfoToSave, setProjectInfoToSave] = useState<ProjectInfoToSave>(transformToProjectInfoToSave(projectContext));
  const [stateContent, setStateContent] = useState<string>('');

  // Updater for keyFeatures
  const updateKeyFeatures = (features: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        keyFeatures: features,
      },
    }));
  };

  // Updater for userInteractions
  const updateUserInteractions = (interactions: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        userInteractions: interactions,
      },
    }));
  };

  // Updater for uiHints (new addition)
  const updateUiHints = (hints: string[]) => {
    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        uiHints: hints,
      },
    }));
  };

  // Updater for aiInstructions
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
        updateKeyFeatures, // Exposed updater for keyFeatures
        updateUserInteractions, // Exposed updater for userInteractions
        updateUiHints, // Exposed updater for uiHints
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
