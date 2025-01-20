import { predefinedFileStructure } from "../data/schemas/predefinedFileStructure";
import { FileTreeItemType } from "../interfaces/file";
import { normalizeName, getFileList, setFileTreePaths, pascalToSnake } from "./genCodeUtils";
import { fileApi } from "../api/file";
import { amendConfigFile } from "../utils/genCodeUtils";
import { getLibRsTemplate } from "../data/templates/libTemplate";
import { getInstructionTemplate } from "../data/templates/insTemplate";
import { getModRsTemplate } from "../data/fileTemplates";
import { getStateTemplate } from "../data/templates/stateTemplate";
import { genLogicPrompt } from "../prompts/genLogic";
import { promptAI } from "../services/prompt";
import func_logic_schema from '../data/ai_schema/func_logic_schema.json';


export interface GeneratedFileData {
    fileTree: FileTreeItemType;
    filePaths: { name: string; path: string }[];
}

type InstructionDetails = {
    instruction_name: string;
    context: string;
    params: string;
};

export const getFilesToGenerate = (programName: string, instructionNames: string[]): { name: string; path: string }[] => {
    const normalizedProgramName = normalizeName(programName);
  
    const filesToGenerate: { name: string; path: string }[] = [
        { name: "lib.rs", path: `programs/${normalizedProgramName}/src/lib.rs`},
        { name: "state.rs", path: `programs/${normalizedProgramName}/src/state.rs`},
        { name: "mod.rs", path: `programs/${normalizedProgramName}/src/instructions/mod.rs`},
    ];
  
    const instructionFiles = instructionNames.map((instructionName) => {
      const fileName = `${instructionName}.rs`;
        return {name: fileName, path: `programs/${normalizedProgramName}/src/instructions/${fileName}`};
    });
  
    return [...filesToGenerate, ...instructionFiles];
};

export function getInstructionNamesSnake(nodes: any[]): string[] {
    return nodes
      .filter((node) => node.type === "instruction")
      .map((node) => {
        const name = node.data?.item?.name?.snake; // Safely access `getName` function
        if (!name) console.error("Instruction node is missing a name:", node);
        return name || "default_instruction_name";
      });
}

export const getExistingFilePaths = (_nodes: FileTreeItemType[]) => {
    const existingFilePaths = new Set<string>();
    for (const node of _nodes) {
      if (node.type === 'file' && node.path) {
        existingFilePaths.add(node.path);
      } else if (node.type === 'directory' && node.children) {
        getExistingFilePaths(node.children);
      }
    }
    return existingFilePaths;
};

export async function setupProjectDirectory(
  rootPath: string,
  normalizedProgramName: string,
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const existingFilesResponse = await fileApi.getDirectoryStructure(rootPath);
    if (!existingFilesResponse) {
      console.error("Directory structure not found");
      return;
    }

    await fileApi.renameDirectory(rootPath, normalizedProgramName);

    const cargoFilePath = `programs/${normalizedProgramName}/Cargo.toml`;
    const anchorFilePath = `Anchor.toml`;

    await amendConfigFile(userId, projectId, "Cargo.toml", cargoFilePath, normalizedProgramName);
    await amendConfigFile(userId, projectId, "Anchor.toml", anchorFilePath, normalizedProgramName);

    //console.log(`Project directory setup completed for ${normalizedProgramName}`);
  } catch (error) {
    console.error("Error during project directory setup:", error);
  }
}
  
export function generateFileTreeAndPaths(
normalizedProgramName: string,
instructionNames: string[]
): GeneratedFileData {
// Generate the file tree structure based on program name and instruction nodes
const fileTree: FileTreeItemType = predefinedFileStructure(normalizedProgramName, instructionNames);

// Helper function to set file paths within the file tree
function setFileTreePaths(item: FileTreeItemType, currentPath = '') {
    if (item.type === 'directory' && item.children) {
    item.path = `${currentPath}/${item.name}`;
    for (const child of item.children) {
        setFileTreePaths(child, item.path);
    }
    } else {
    item.path = `${currentPath}/${item.name}`;
    }
}

// Set paths for the file tree
setFileTreePaths(fileTree);

// Helper function to flatten the file tree into an array of file paths
function flattenFileTree(item: FileTreeItemType, fileList: { name: string; path: string }[] = []): { name: string; path: string }[] {
    if (item.type === 'file') {
    fileList.push({ name: item.name, path: item.path || item.name });
    }
    if (item.children && item.children.length > 0) {
    for (const child of item.children) {
        flattenFileTree(child, fileList);
    }
    }
    return fileList;
}

// Get the flattened file list
let filePaths = flattenFileTree(fileTree);

// Add 'run_' prefix and convert to snake_case for instruction file paths
filePaths = filePaths.map((file) => {
    const instructionsPrefix = `/programs/${normalizedProgramName}/src/instructions/`;
    if (file.path.includes(instructionsPrefix)) {
    const pathParts = file.path.split('/');
    const fileName = pathParts.pop();
    if (fileName) {
        const directoryPath = pathParts.join('/');
        const newFileName = `run_${pascalToSnake(fileName)}`;
        return {
        ...file,
        name: newFileName,
        path: `${directoryPath}/${newFileName}`,
        };
    }
    }
    return file;
});

return {
    fileTree, // Entire directory structure
    filePaths, // Array of file paths
};
}

export async function fetchAndExtractFilePaths(rootPath: string): Promise<Set<string>> {
  try {
    const existingFilesResponse = await fileApi.getDirectoryStructure(rootPath);
    if (!existingFilesResponse) throw new Error("Directory structure not found");

    const traverseFileTree = (nodes: FileTreeItemType[], filePaths: Set<string>) => {
      for (const node of nodes) {
        if (node.type === "file" && node.path) {
          filePaths.add(node.path); // Add file path to the set
        } else if (node.type === "directory" && node.children) {
          traverseFileTree(node.children, filePaths); // Recursively traverse directories
        }
      }
    };

    // Create a Set to store unique file paths
    const existingFilePaths = new Set<string>();
    traverseFileTree(existingFilesResponse, existingFilePaths);

    return existingFilePaths; // Return the set of file paths
  } catch (error) {
    console.error("Error fetching or extracting file paths:", error);
    throw error; // Propagate the error
  }
}

export async function updateOrCreateFile(
    projectId: string,
    filePath: string,
    codeContent: string,
    existingFilePaths: Set<string>
  ): Promise<void> {
    try {
      if (existingFilePaths.has(filePath)) {
        await fileApi.updateFile(projectId, filePath, codeContent);
        //console.log(`Updated file: ${filePath}`);
      } else {
        await fileApi.createFile(projectId, filePath, codeContent);
        //console.log(`Created new file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error handling file ${filePath}:`, error);
      throw error;
    }
}

export function processAiOutput(
  aiOutput: { 
    instructions: { 
      instruction_name: string; 
      function_logic: string; 
      additional_imports: string[] 
    }[] 
  }
): {
  instructions: { 
    instruction_name: string; 
    function_logic: string; 
    additional_imports: string[] 
  }[];
} {
  try {
    if (typeof aiOutput === "string") {
      aiOutput = JSON.parse(aiOutput);
    }

    if (!aiOutput || typeof aiOutput !== "object") {
      throw new Error("Invalid AI output structure: aiOutput is not an object");
    }

    const { instructions = [] } = aiOutput;

    if (!Array.isArray(instructions)) {
      throw new Error("Invalid AI output structure: instructions is not an array");
    }

    const processedInstructions = instructions
      .map((instruction: any) => {
        if (
          !instruction.instruction_name ||
          !instruction.function_logic ||
          !Array.isArray(instruction.additional_imports)
        ) {
          console.warn("Instruction missing required fields or invalid structure:", instruction);
          return null;
        }

        return {
          instruction_name: instruction.instruction_name,
          function_logic: instruction.function_logic,
          additional_imports: instruction.additional_imports,
        };
      })
      .filter((item: any) => item !== null);

    return {
      instructions: processedInstructions as { 
        instruction_name: string; 
        function_logic: string; 
        additional_imports: string[] 
      }[]
    };
  } catch (error) {
    console.error("Error processing AI output:", error);
    return { instructions: [] };
  }
}

export async function aiGenOutput(
  fileSet: Set<{ name: string; path: string; content: string }>,
  projectContext: any
): Promise<{ instruction_name: string; function_logic: string; additional_imports: string[] }[]> {
  try {
    const _idl = projectContext.details.designIdl;
    const _description = projectContext.description;
    const _prompt = genLogicPrompt(_idl, _description, fileSet);
    const _schema = func_logic_schema;

    const aiOutput = await promptAI(_prompt, _schema);
    return processAiOutput(aiOutput).instructions;
  } catch (error) {
    console.error("Error calling AI API for function logic:", error);
    return [];
  }
}

export async function getDetailsByFileType(
  nodes: any[],
  fileType: string,
  programName: string,
  programId: string,
  projectContext: any
): Promise<any[] | any> {
  if (!nodes) { console.error("Invalid project context or missing nodes."); return []; }

  switch (fileType) {
    case "instruction":
      return nodes
        .filter((node: any) => node.type === "instruction")
        .map((node: any) => {
          const item = node.data?.item;
          if (!item) { console.warn("Instruction node missing details:", node); return null;  }
          return {
            name: item.name.snake,
            context_name: `${item.name.pascal}`,
            params_name: `${item.name.pascal}Params`,
            error_enum_name: `${item.name.pascal}ErrorCode`,
            doc_description: item.description ? item.description : "",
            accounts:
              item.accounts?.map((account: any) => ({
                name: typeof account === "string" ? account : account.name,
                type: account.type || "AccountInfo",
                constraints: account.constraints || [],
              })) || [],
            params:
              item.params?.map((param: any) => ({
                name: param.name,
                type: param.type,
              })) || [],
            error_codes: 
              item.error_codes?.map((error: any) => ({
                code: error.code,
                name: error.name,
                msg: error.msg, 
              })) || [],
            events:
              item.events?.map((event: any) => ({
                name: event.name,
                fields: event.fields,
              })) || [],
            function_logic: "",
            imports: item.imports || [],
          };
        })
        .filter((detail: any) => detail !== null);

    case "state":
      return nodes
        .filter((node: any) => node.type === "account")
        .map((node: any) => {
          const item = node.data?.item;
          if (!item || !item.name?.pascal) {
            console.warn("State node missing details:", node);
            return null;
          }
          return {
            account_name: item.name?.pascal,
            struct_name: `${item.name?.pascal}`,
            fields: item.fields || [],
            description: item.description || "",
            role: item.role || "",
          };
        })
        .filter((detail: any) => detail !== null);

    case "lib":
      return nodes
        .filter((node: any) => node.type === "instruction")
        .map((node: any) => {
          const item = node.data?.item;
          if (!item || !item.name.snake) {
            console.warn("Instruction node missing details:", node);
            return null;
          }
          return {
            instruction_name: item.name.snake,
            context: `${item.name.pascal}`,
            params: `${item.name.pascal}Params`,
            description: item.description || "No description provided",
            program_name: programName,
            program_id: programId,
          };
        })
        .filter((detail: any) => detail !== null);

    case "mod":
      return nodes
        .filter((node: any) => node.type === "instruction")
        .map((node: any) => {
          const item = node.data?.item;
          return item?.name.snake || null;
        })
        .filter((name: string | null) => !!name);

    default:
      console.error(`Unsupported file type: ${fileType}`);
      return [];
  }
}

export async function generateFileContent(
  fileTask: { name: string; path: string },
  programName: string,
  nodes: any[],
  programId: string,
  projectContext: any
): Promise<{ fileDetails: any[]; codeContent: string }> {
  let codeContent = '';
  let fileDetails: any[] = [];
  const file_name = fileTask.name.replace('.rs', '');

  if (fileTask.path.includes('/instructions/') && file_name !== 'mod') {
    fileDetails = await getDetailsByFileType(nodes, 'instruction', programName, programId, projectContext);
    const matchingInstructionDetails = fileDetails.find((detail) => detail.name === file_name);
    if (!matchingInstructionDetails) {
      console.error(`No matching instruction details found for ${file_name}`);
      return { fileDetails: [], codeContent: '' };
    }
    console.log("matchingInstructionDetails", matchingInstructionDetails);
    codeContent = getInstructionTemplate(matchingInstructionDetails);
  } else {
    switch (file_name) {
      case 'lib':
        fileDetails = await getDetailsByFileType(nodes, 'lib', programName, programId, projectContext);
        codeContent = getLibRsTemplate(programName, programId, fileDetails);
        break;

      case 'state':
        fileDetails = await getDetailsByFileType(nodes, 'state', programName, programId, projectContext);
        console.log("fileDetails state", fileDetails);
        codeContent = getStateTemplate(fileDetails);
        break;

      case 'mod':
        fileDetails = await getDetailsByFileType(nodes, 'mod', programName, programId, projectContext);
        codeContent = getModRsTemplate(fileDetails);
        break;

      default:
        console.warn('Unknown file type for:', fileTask.name);
        return { fileDetails: [], codeContent: '' };
    }
  }

  return { fileDetails, codeContent };
}

export async function insertAiOutputIntoFiles(
  fileSet: Set<{ name: string; path: string; content: string }>,
  aiOutput: { instruction_name: string; function_logic: string }[],
  details: Map<string, any>
): Promise<Set<{ name: string; path: string; content: string }>> {
  const updatedFileSet = new Set<{ name: string; path: string; content: string }>();

  console.log("aiOutput", aiOutput);

  const aiOutputMap = aiOutput.reduce((map, output) => {
    map[output.instruction_name] = {
      function_logic: output.function_logic,
    };
    return map;
  }, {} as Record<string, { function_logic: string }>);

  for (const file of fileSet) {
    const isInstructionFile = file.path.includes("/instructions/") && file.name !== "mod.rs";
    let updatedContent = file.content;

    if (isInstructionFile) {
      const instructionName = file.name.replace(".rs", "");
      const instructionData = aiOutputMap[instructionName];

      if (instructionData && details.has(instructionName)) {
        const { function_logic } = instructionData;
        const { context_name, params_name } = details.get(instructionName);

        const usesCtx = /ctx\./.test(function_logic);
        const usesParams = /params\./.test(function_logic);

        updatedContent = updatedContent.replace(
          /(pub fn \w+\()ctx: Context<\w+>, params: \w+\)/,
          (match, start) => {
            const ctxPrefix = usesCtx ? "ctx" : "_ctx";
            const paramsPrefix = usesParams ? "params" : "_params";
            return `${start}${ctxPrefix}: Context<${context_name}>, ${paramsPrefix}: ${params_name})`;
          }
        );

        updatedContent = updatedContent.replace("// AI_FUNCTION_LOGIC", function_logic);
      } else {
        console.warn(`No AI logic or details found for instruction: ${instructionName}`);
      }
    }

    updatedFileSet.add({ ...file, content: updatedContent });
  }

  return updatedFileSet;
}



  

  
  
  