import { fileApi } from '../api/file';
import { taskApi } from '../api/task';
import { FileTreeItemType } from '../interfaces/file';
import { parse, stringify } from 'smol-toml'
import { getInstructionTemplate, getLibRsTemplate, getModRsTemplate, getSdkTemplate, getStateTemplate, getTestTemplate } from '../data/fileTemplates';
import instructionSchema from '../data/ai_schema/instruction_schema.json';
import stateSchema from '../data/ai_schema/state_schema.json';
import sdkSchema from '../data/ai_schema/sdk_schema.json';
import testSchema from '../data/ai_schema/test_schema.json';
import Ajv from 'ajv';
import path from 'path-browserify';

const walletsFolder = process.env.WALLETS_FOLDER || '/root/projects/solana-ai-dev/wallets';

type CargoToml = {
  package?: { name?: string; };
  lib?: { name?: string; };
  dependencies?: {
    [key: string]: {
      version?: string;
      features?: string[];
    };
  };
};

type RootAnchorToml = {
  programs?: {
    localnet?: {
      [key: string]: string;
    };
  };
};

type InstructionContext = {
  context: string;
  params: string;
  accounts: { name: string; type: string; attributes: string[] }[];
  paramsFields: { name: string; type: string }[];
  errorCodes: { name: string; msg: string }[];
};

export const pollTaskStatus = (taskId: string, pollDesc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
          try {
              const { task } = await taskApi.getTask(taskId);
              //console.log('task', task);

              if (task.status === 'succeed' || task.status === 'warning') {
                  //console.log(`${pollDesc} succeeded.`);
                  clearInterval(interval);
                  if (task.result) {
                    resolve(task.result);
                  } else {
                    reject(new Error('Task result is undefined'));
                  }

              } else if (task.status === 'failed') {
                  clearInterval(interval);
                  reject(new Error('Task failed'));
              }
          } catch (error) {
              console.error('Error fetching task status:', error);
              clearInterval(interval);
              reject(error);
          }
      }, 2000);
  });
};

export function setFileTreePaths(
    item: FileTreeItemType,
    parentPath: string = ''
): void {
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
    item.path = currentPath;
  
    if (item.children) {
      for (const child of item.children) {
        setFileTreePaths(child, currentPath);
      }
    }
}

export function getFileList(
  item: FileTreeItemType,
  fileList: { name: string; path: string }[] = []
): { name: string; path: string }[] {
  if (!item || !item.name) {
    console.error('Invalid item encountered:', item);
    return fileList;
  }

  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      getFileList(child, fileList);
    }
  } else {
    const path = item.path || item.name;
    fileList.push({ name: item.name, path });
  }

  return fileList;
}

export function extractCodeBlock(text: string): string {
    const lines = text.split('\n');
    let isInCodeBlock = false;
    const codeBlockLines: string[] = [];
  
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (isInCodeBlock) {
          break; // End of code block
        } else {
          isInCodeBlock = true; // Start of code block
          continue; // Skip the opening ```
        }
      }
  
      if (isInCodeBlock) {
        codeBlockLines.push(line);
      }
    }
  
    return codeBlockLines.join('\n');
}

export const amendConfigFile = async (
  userId: string,
  projectId: string,
  fileName: string,
  filePath: string,
  programDirName: string
): Promise<string> => {
  console.log('amendConfigFile filePath', filePath);

  const oldContentResponse = await fileApi.getFileContent(projectId, filePath);
  const taskId = oldContentResponse.taskId;
  const _pollDesc = `Getting ${fileName} content to amend content.`;
  const oldContent = await pollTaskStatus(taskId, _pollDesc);

  let updatedToml = oldContent;

  if (fileName === 'Cargo.toml') {
    const lines = oldContent.split('\n');
    const dependenciesStartIndex = lines.findIndex((line) => line.trim() === '[dependencies]');

    if (dependenciesStartIndex !== -1) {
      const updatedLines = lines.filter(
        (line, index) =>
          !(index > dependenciesStartIndex && line.trim().startsWith('anchor-lang'))
      );

      updatedLines.splice(dependenciesStartIndex + 1, 0, 'anchor-lang = { version = "0.30.1", features = ["init-if-needed"] }');

      updatedToml = updatedLines.join('\n');
    }
  }

  if (fileName === 'Anchor.toml') {
    const parsedToml = parse(oldContent) as Record<string, any>;

    if (parsedToml.programs?.localnet) {
      const localnet = parsedToml.programs.localnet;

      const [oldKey, address] = Object.entries(localnet)[0]; 
      console.log(`Old Key: ${oldKey}, Address: ${address}`);
      delete localnet[oldKey];
      localnet[programDirName] = address;

      delete parsedToml.programs;
      parsedToml['programs.localnet'] = localnet;

    } else  throw new Error('[programs.localnet] section not found in Anchor.toml');

    if (parsedToml.provider) {
      parsedToml.provider.cluster = 'Devnet';
      if (walletsFolder === '') throw new Error('WALLETS_FOLDER environment variable is not set');
      const userWalletPath = path.join(walletsFolder, `${userId}.json`);
      parsedToml.provider.wallet = userWalletPath;

    } else {
      throw new Error('[provider] section not found in Anchor.toml');
    }

    updatedToml = stringify(parsedToml);
  }

  const res = await fileApi.updateFile(projectId, filePath, updatedToml);
  const updatedFileContent = await pollTaskStatus(res.taskId, `Updating ${fileName} content.`);
  return updatedFileContent;
};

export const ensureInstructionNaming = async (
  projectId: string,
  instructionPaths: string[],
  programDirName: string
): Promise<void> => {
  if (!instructionPaths) return;

  for (const filePath of instructionPaths) {
    try {
      const fileContentResponse = await fileApi.getFileContent(projectId, filePath);
      const taskId = fileContentResponse.taskId;
      const pollDesc = `Getting ${filePath} content to change function names.`;
      console.log('pollDesc', pollDesc);
      const fileContent = await pollTaskStatus(taskId, pollDesc);
      console.log('fileContent', fileContent);

      const updatedContent = fileContent.replace(
        /pub fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        (match, functionName) => {
          if (!functionName.startsWith('run_')) {
            const newFunctionName = `run_${functionName}`;
            console.log(`Renaming function: ${functionName} to ${newFunctionName}`);
            return `pub fn ${newFunctionName}`;
          }
          return match;
        }
      );

      if (updatedContent !== fileContent) {
        await fileApi.updateFile(projectId, filePath, updatedContent);
        console.log(`Updated function names in ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
};

export const sortFilesByPriority = (
  files: FileTreeItemType[],
  aiProgramDirectoryName: string
): FileTreeItemType[] => {
  return files.sort((a, b) => {
    const getPriority = (file: FileTreeItemType): number => {
      if (file.path?.endsWith('state.rs')) return 1; // Highest priority
      if (file.path?.includes('/instructions/')) return 2; // Medium priority
      if (file.path?.endsWith('lib.rs')) return 3; // Lower priority
      return 4; // Lowest priority
    };

    return getPriority(a) - getPriority(b);
  });
};

export const normalizeName = (name: string): string => {
  if (!name) {
    throw new Error('Name cannot be empty');
  }
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/^_+|_+$/g, '');
};

export const getNormalizedInstructionNames = (
  nodes: { type: string; data: { label: string } }[]
): string[] => {
  return nodes
    .filter(node => node.type === 'instruction')
    .map(node => node.data.label)
    .filter(Boolean)
    .map(label => `run_${normalizeName(label)}`);
};

export const snakeToPascal = (snakeStr: string): string => {
  return snakeStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const extractProgramIdFromAnchorToml = async (
  projectId: string,
  anchorTomlPath: string,
  programDirName: string
): Promise<string> => {
  try {
    const anchorTomlContentResponse = await fileApi.getFileContent(projectId, anchorTomlPath);
    const anchorTomlContentTaskId = anchorTomlContentResponse.taskId;
    const pollDesc = `Getting Anchor.toml content.`;
    const anchorTomlContent = await pollTaskStatus(anchorTomlContentTaskId, pollDesc);

    const parsedToml = parse(anchorTomlContent) as Record<string, any>;

    console.log("!!! parsedToml", parsedToml);

    const programSection = parsedToml['programs.localnet'];
    if (!programSection)  throw new Error('No [programs.localnet] section found in Anchor.toml');

    const programId = programSection[programDirName];
    if (!programId) throw new Error(`Program ID for "${programDirName}" not found in Anchor.toml`);

    return programId;
  } catch (error) {
    console.error('Error parsing Anchor.toml:', error);
    throw error;
  }
};

export const extractInstructionContext = async (
  projectId: string,
  instructions: string[],
  instructionPaths: string[]
): Promise<Record<string, InstructionContext>> => {
  const instructionContextMapping: Record<string, InstructionContext> = {};

  for (let index = 0; index < instructions.length; index++) {
    const instructionName = instructions[index];
    try {
      const contentTaskId = await fileApi.getFileContent(
        projectId,
        instructionPaths[index]
      );
      const pollDesc = `Getting ${instructionName} content.`;
      const content = await pollTaskStatus(contentTaskId.taskId, pollDesc);

      if (!content) {
        console.error(`Empty or invalid content for instruction: ${instructionName}`);
        continue;
      }

      console.log(`Instruction Content for ${instructionName}:\n`, content);

      // Extract function signature
      const funcRegex = /\bfn\s+(\w+)\s*\(\s*ctx:\s*Context<([^>]+)>(?:,\s*params:\s*([^,)]+))?\s*\)/;
      console.log("funcRegex", funcRegex);

      const funcMatch = content.match(funcRegex);
      if (!funcMatch) {
        console.error(`Function signature not found in ${instructionName}`);
        continue;
      }

      const contextStruct = funcMatch ? funcMatch[1] : '';
      const paramsStruct = funcMatch ? funcMatch[2] : '';

      if (!contextStruct) throw new Error(`Context struct not found for instruction: ${instructionName}`);
      if (!paramsStruct) console.warn(`Params struct not found for instruction: ${instructionName}`);

      // Extract accounts
      const accountsRegex = new RegExp(
        `#[derive\\(Accounts\\)]\\s*pub struct ${contextStruct}<'info>\\s*{([\\s\\S]*?)}`
      );
      const accountsMatch = content.match(accountsRegex);
      const accounts = [];
      if (accountsMatch) {
        const accountsContent = accountsMatch[1];
        const accountRegex = /((?:\s*#\[[^\]]+\]\s*)*)\s*pub\s+(\w+):\s+([^\s,]+),/g;
        let match;
        while ((match = accountRegex.exec(accountsContent)) !== null) {
          const attrBlock = match[1];
          const name = match[2];
          const type = match[3];
          const attributes = attrBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('#['));
          accounts.push({ name, type, attributes });
        }
      }

      // Extract params fields
      const paramsRegex = new RegExp(
        `#[derive\\(AnchorSerialize,\\s*AnchorDeserialize\\)]\\s*pub struct ${paramsStruct}\\s*{([\\s\\S]*?)}`
      );
      const paramsMatch = content.match(paramsRegex);
      const paramsFields = [];
      if (paramsMatch) {
        const paramsContent = paramsMatch[1];
        const fieldRegex = /\s*pub\s+(\w+):\s+([^\s,]+),/g;
        let match;
        while ((match = fieldRegex.exec(paramsContent)) !== null) {
          const name = match[1];
          const type = match[2];
          paramsFields.push({ name, type });
        }
      }

      // Extract error codes
      const errorRegex = /#[error_code]\s*pub enum \w+\s*{([\s\S]*?)}/;
      const errorMatch = content.match(errorRegex);
      const errorCodes = [];
      if (errorMatch) {
        const errorContent = errorMatch[1];
        const errorCodeRegex = /#[msg\("([^"]+\)"\)]\s*(\w+),/g;
        let match;
        while ((match = errorCodeRegex.exec(errorContent)) !== null) {
          const msg = match[1];
          const name = match[2];
          errorCodes.push({ name, msg });
        }
      } else {
        console.warn(`Error codes not found for instruction: ${instructionName}`);
      }

      instructionContextMapping[instructionName] = {
        context: contextStruct,
        params: paramsStruct,
        accounts,
        paramsFields,
        errorCodes,
      };
    } catch (error) {
      console.error(`Error getting ${instructionName} content:`, error);
    }
  }

  return instructionContextMapping;
};

export const extractStateStructs = async (
  projectId: string,
  stateRsPath: string
): Promise<{ name: string; fields: { name: string; type: string }[] }[]> => {
  try {
    const contentTaskId = await fileApi.getFileContent(projectId, stateRsPath);
    const pollDesc = `Getting state.rs content.`;
    const content = await pollTaskStatus(contentTaskId.taskId, pollDesc);

    // Regex to match #[account] structs
    const structRegex = /#\[account\]\s*pub struct (\w+)\s*{([^}]*)}/g;

    const structs = [];
    let match;

    // Iterate over matches for structs
    while ((match = structRegex.exec(content)) !== null) {
      const name = match[1]; // Struct name
      const fieldsContent = match[2]; // Struct fields block

      // Regex to match fields within the struct
      const fieldRegex = /\s*pub\s+(\w+):\s+([^\s,]+)[,]?/g;

      const fields = [];
      let fieldMatch;

      // Iterate over matches for fields
      while ((fieldMatch = fieldRegex.exec(fieldsContent)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        fields.push({ name: fieldName, type: fieldType });
      }

      // Add the struct to the result
      structs.push({ name, fields });
    }

    console.log("structs", structs);
    return structs;
  } catch (error) {
    console.error(`Error extracting state structs:`, error);
    return [];
  }
};

export function extractJSON(content: string): string {
  try {
    // Step 1: Remove Markdown enclosures
    const cleanedContent = content
      .replace(/```json/g, '') // Remove opening markdown enclosure
      .replace(/```/g, '') // Remove closing markdown enclosure
      .trim(); // Remove unnecessary whitespace

    // Step 2: Attempt to parse and validate as JSON directly
    try {
      JSON.parse(cleanedContent); // If this works, it's valid JSON
      return cleanedContent; // Return it as is
    } catch {
      // Step 3: Fallback to regex to extract JSON if parsing fails
      const jsonMatch = cleanedContent.match(/({[\s\S]*})|(\[[\s\S]*\])/); // Match JSON object or array
      if (!jsonMatch) {
        throw new Error('No JSON object found in the content.');
      }

      const extractedJSON = jsonMatch[0];
      JSON.parse(extractedJSON); // Validate extracted JSON
      return extractedJSON; // Return the valid JSON
    }
  } catch (error) {
    console.error('Error extracting JSON:', error, 'Content:', content);
    throw new Error('Failed to extract JSON from AI response.');
  }
}

export function validateFileTree(tree: any): FileTreeItemType | null {
  if (!tree || typeof tree.name !== 'string' || typeof tree.type !== 'string') {
    console.error('Invalid file tree item:', tree);
    return null;
  }

  if (tree.type !== 'file' && tree.type !== 'directory') {
    console.error('Invalid type for file tree item:', tree.type);
    return null;
  }

  if (tree.children && !Array.isArray(tree.children)) {
    console.error('Invalid children for file tree item:', tree.children);
    return null;
  }

  // Validate children recursively
  if (tree.children) {
    tree.children = tree.children.map((child: any) => validateFileTree(child)).filter(Boolean);
  }

  return tree as FileTreeItemType;
}


// ------------------------------------------------------------------------------------------------

// state
export interface AIStateOutput {
  accounts: {
    name: string;
    description: string;
    data_structure: {
      fields: { field_name: string; field_type: string; attributes: string[] }[];
    };
  }[];
  additional_context: string;
}
export const processAIStateOutput = async (
  projectId: string,
  normalizedProgramName: string,
  aiJson: string,
): Promise<string> => {
  const ajv = new Ajv();
  const validate = ajv.compile(stateSchema);

  try {
    const jsonContent = extractJSON(aiJson);
    let aiData: AIStateOutput = JSON.parse(jsonContent);

    aiData = sanitizeAIOutput(aiData, stateSchema);

    const valid = validate(aiData);
    if (!valid) {
      console.error('AI JSON does not conform to schema:', validate.errors);
      throw new Error('Invalid AI JSON structure.');
    }

    const codeContent = getStateTemplate(aiData.accounts);

    const filePath = `programs/${normalizedProgramName}/src/state.rs`;
    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated file: ${filePath}`);
    return codeContent;

  } catch (error) {
    console.error('Error processing AI state output:', error);
    throw error;
  }
};

// instructions
export interface AIInstructionOutput {
  function_name: string;
  context_struct: string;
  params_struct: string;
  accounts: { name: string; type: string; attributes: string[] }[];
  params_fields: { name: string; type: string }[];
  error_codes: { name: string; msg: string }[];
  function_logic: string;
  accounts_structure: { name: string; description: string; data_structure: object }[];
}
export const processAIInstructionOutput = async (
  projectId: string,
  normalizedProgramName: string,
  instructionName: string,
  aiJson: string,
): Promise<{ codeContent: string; aiData: AIInstructionOutput }> => {
  const ajv = new Ajv();
  const validate = ajv.compile(instructionSchema);

  try {
    const jsonContent = extractJSON(aiJson);
    let aiData: AIInstructionOutput = JSON.parse(jsonContent);

    aiData = sanitizeAIOutput(aiData, instructionSchema);

    const valid = validate(aiData);
    if (!valid) {
      console.error('AI JSON does not conform to schema:', validate.errors);
      throw new Error('Invalid AI JSON structure.');
    }

    const codeContent = getInstructionTemplate(
      instructionName,
      aiData.function_name,
      aiData.function_logic,
      aiData.context_struct,
      aiData.params_struct,
      aiData.accounts,
      aiData.params_fields,
      aiData.error_codes
    );

    const filePath = `programs/${normalizedProgramName}/src/instructions/${instructionName}.rs`;
    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated file: ${filePath}`);
    return { codeContent, aiData };

  } catch (error) {
    console.error('Error processing AI instruction output:', error);
    throw error;
  }
};


// instructions mod
export interface AIModRsOutput {
  instructions: string[];
  additional_context?: string;
}
export const processAIModRsOutput = async (
  projectId: string,
  normalizedProgramName: string,
  aiJson: string,
): Promise<string> => {
  const ajv = new Ajv();
  const validate = ajv.compile({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "instructions": {
        "type": "array",
        "items": {
          "type": "string",
          "description": "List of instruction file names."
        }
      },
      "additional_context": {
        "type": "string",
        "description": "Optional additional context for the mod.rs file."
      }
    },
    "required": ["instructions"],
    "additionalProperties": false
  });

  try {
    const aiData: AIModRsOutput = JSON.parse(aiJson);

    const valid = validate(aiData);
    if (!valid) {
      console.error('AI JSON does not conform to schema:', validate.errors);
      throw new Error('Invalid AI JSON structure.');
    }

    const codeContent = getModRsTemplate(aiData.instructions, aiData.additional_context);

    const filePath = `programs/${normalizedProgramName}/src/instructions/mod.rs`;

    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated file: ${filePath}`);
    return codeContent;

  } catch (error) {
    console.error('Error processing AI mod.rs output:', error);
    throw error;
  }
};

// lib
// Define the expected structure of the AI response for lib.rs
export interface AILibOutput {
  program_name: string;
  program_id: string;
  instruction_context_mapping: {
    instruction_name: string;
    context: string;
    params: string;
  }[];
}

// Utility function to process the AI-generated JSON for lib.rs
export const processAILibOutput = async (
  projectId: string,
  programId: string,
  normalizedProgramName: string,
  aiJson: string,
  instructionDetails: { instruction_name: string; context: string; params: string }[]
): Promise<string> => {
  const ajv = new Ajv();
  const libSchema = {
    type: 'object',
    properties: {
      program_name: { type: 'string' },
      program_id: { type: 'string' },
      instruction_context_mapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            instruction_name: { type: 'string' },
            context: { type: 'string' },
            params: { type: 'string' },
          },
          required: ['instruction_name', 'context', 'params'],
        },
      },
    },
    required: ['program_name', 'program_id', 'instruction_context_mapping'],
  };

  const validate = ajv.compile(libSchema);

  try {
    // Parse the AI-generated JSON
    const aiData: AILibOutput = JSON.parse(aiJson);

    // Validate the AI response against the schema
    const valid = validate(aiData);
    if (!valid) {
      console.error('AI JSON does not conform to schema:', validate.errors);
      throw new Error('Invalid AI JSON structure.');
    }

    const codeContent = getLibRsTemplate(normalizedProgramName, programId, instructionDetails);

    // Define the file path for lib.rs
    const filePath = `programs/${normalizedProgramName}/src/lib.rs`;

    // Update the lib.rs file
    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated file: ${filePath}`);
    return codeContent;
  } catch (error) {
    console.error('Error processing AI lib.rs output:', error);
    throw error;
  }
};

// sdk
export interface AISdkOutput {
  program_name: string;
  instructions: {
    name: string;
    description: string;
    params: string[];
    context: {
      accounts: {
        name: string;
        isSigner: boolean;
        isWritable: boolean;
      }[];
    };
  }[];
  accounts: {
    name: string;
    description: string;
    fields: { name: string; type: string }[];
  }[];
}

export const processAISdkOutput = async (
  projectId: string,
  programId: string,
  normalizedProgramName: string,
  aiJson: string
): Promise<string> => {
  const ajv = new Ajv();
  const validate = ajv.compile(sdkSchema);

  try {
    const jsonContent = extractJSON(aiJson);
    let aiData: AISdkOutput = JSON.parse(jsonContent);
    aiData = sanitizeAIOutput(aiData, sdkSchema);

    const valid = validate(aiData);
    if (!valid) {
      console.error('AI JSON does not conform to schema:', validate.errors);
      throw new Error('Invalid AI JSON structure.');
    }

    const codeContent = getSdkTemplate(
      aiData.program_name,
      programId,
      aiData.instructions,
      aiData.accounts
    );

    const filePath = `sdk/${normalizedProgramName}_sdk.ts`;
    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated SDK file: ${filePath}`);
    return codeContent;
  } catch (error) {
    console.error('Error processing AI SDK output:', error);
    throw error;
  }
};

// test
export interface AITestOutput {
  program_name: string;
  program_id: string;
  instructions: {
    name: string;
    description: string;
    params: string[];
  }[];
  accounts: {
    name: string;
    description: string;
    fields: { name: string; type: string }[];
  }[];
}

export const processAITestOutput = async (
  projectId: string,
  normalizedProgramName: string,
  aiJson: string
): Promise<string> => {
  const ajv = new Ajv();
  const validate = ajv.compile(testSchema); // Replace with the actual test schema JSON import

  try {
    const jsonContent = extractJSON(aiJson);
    let aiData: AITestOutput = JSON.parse(jsonContent);

    aiData = sanitizeAIOutput(aiData, testSchema);

    const valid = validate(aiData);
    if (!valid) {
      console.error("AI JSON does not conform to schema:", validate.errors);
      throw new Error("Invalid AI JSON structure.");
    }

    // Generate test file content using the template
    const codeContent = getTestTemplate(
      aiData.program_name,
      aiData.program_id,
      aiData.instructions,
      aiData.accounts
    );

    const filePath = `tests/${normalizedProgramName}.test.ts`;
    await fileApi.updateFile(projectId, filePath, codeContent);

    console.log(`Successfully processed and updated Test file: ${filePath}`);
    return codeContent;
  } catch (error) {
    console.error("Error processing AI Test output:", error);
    throw error;
  }
};

const sanitizeAIOutput = (aiData: any, schema: any): any => {
  const sanitized: Record<string, any> = {};

  for (const key of Object.keys(schema.properties)) {
    if (schema.required.includes(key)) {
      sanitized[key] = aiData[key] ?? getDefaultForType(schema.properties[key]);
    } else if (key in aiData) {
      sanitized[key] = aiData[key];
    }
  }

  for (const key of Object.keys(aiData)) {
    if (!schema.properties[key]) {
      console.warn(`Removing unexpected property: ${key}`);
    }
  }

  return sanitized;
};

const getDefaultForType = (propertySchema: any): any => {
  switch (propertySchema.type) {
    case "string":
      return "";
    case "array":
      return [];
    case "object":
      return {};
    default:
      return null;
  }
};

export const parseSdkFunctions = (
  sdkFileContent: string,
  setProjectContext: React.Dispatch<React.SetStateAction<any>>
) => {
  const functionRegex = /async\s+(\w+)\s*\(([^)]*)\)/g;
  const parsedFunctions: {
    function_name: string;
    params: { name: string; type: string }[];
  }[] = [];

  let match;
  while ((match = functionRegex.exec(sdkFileContent)) !== null) {
    const [_, functionName, paramsString] = match;
    const params = paramsString
      .split(',')
      .map((param) => param.trim())
      .filter((param) => param)
      .map((param) => {
        const [name, type] = param.split(':').map((p) => p.trim());
        return { name, type: type || 'unknown' };
      });

    parsedFunctions.push({ function_name: functionName, params });
  }

  setProjectContext((prevContext: any) => ({
    ...prevContext,
    details: {
      ...prevContext.details,
      sdkFunctions: parsedFunctions,
    },
  }));

  return parsedFunctions;
};


