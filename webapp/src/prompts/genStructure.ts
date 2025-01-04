import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import structureSchema from '../data/ai_schema/structure_schema.json';

interface TextGeneratorOptions {
  programName: string;
  programDescription: string;
  accountText?: string; 
  instructionText?: string; 
  libraryVersion?: string;
}

const generateGeneralInstructions = (programName: string, programDescription: string, libraryVersion: string) => {
  return `
    I want to develop a Solana program using the Anchor framework, test cases using TypeScript, and a TypeScript SDK to interact with the program.

    --- The App ---
    This is a ${programName} for ${programDescription}.

    --- File Structure ---
    Please generate the project file structure for an Anchor-based Solana program as a JSON object. The structure should follow the default Anchor project generated on initialization.

    **Additional Files to Include:**
    - src/instructions/mod.rs: A mod.rs file that aggregates all instruction files.
    - src/lib.rs: A lib.rs file that serves as the program's entry point.

    **Important Exclusions:**
    - Do **not** include the following files in the output:
      - \`/Cargo.toml\`
      - \`/Anchor.toml\`
      - \`programs/${programName}/Cargo.toml\`
      - \`programs/${programName}/Xargo.toml\`

    **Directory Rules**:
    - Each program should have its own directory (e.g., programs/${programName}) that includes:

     - **Accounts**:
      - **state.rs**: Account-related code, located directly under \`src/\`. !important DO NOT put the state.rs file in any other directory or in an 'accounts' directory.

    Instructions:
      - Each instruction should be in its own file.
      - The function name inside the file should be called run_[the name of the file].
      - instruction files in the src/instructions directory (instruction related code).

    --- Library ---
    Use @coral-xyz/anchor for TypeScript test code.
    Use Anchor version >= ${libraryVersion}

    --- Test Cases ---
    Write test cases using TypeScript for each of the functions. The test case should use the SDK.

    --- The TypeScript SDK ---
    The SDK should cover all instructions and functions to get all accounts with filters.\n
    **Include the SDK file (\`sdk/index.ts\`) in the file structure.**
  `;
};

const generateProgramInstruction = (programName: string, programDescription: string) => {
  return `
    --- The App ---
    This is a project called "${programName}" designed for "${programDescription}".
    Generate a valid JSON object representing the file structure for this project. Ensure the following requirements are met:

    - **Structure Rules**:
      1. Every object in the JSON must include:
         - "name" (string): The name of the file or directory.
         - "type" (string): Specify "file" for files and "directory" for directories.
         - "path" (string): The full relative path to the file or directory (e.g., "programs/${programName}/src/instructions/run_initialize.rs").
         - "ext" (string or null): The file extension (e.g., ".rs" for Rust files). Use null for directories.
         - "children" (array of objects or null): An array of child objects for directories. Use "children": [] for directories with no children. Use null for files.
      
      2. Directories must include:
         - "type": "directory"
         - "children" (empty array if no children).
      
      3. Files must include:
         - "type": "file"
         - "ext" (e.g., ".rs").
         - "children": null (since files cannot have children).

    - !IMPORTANT! **Specific Directories**:
      1. All instructions must be located in a directory named "instructions" under "programs/${programName}/src".
      2. Each instruction file must follow the naming convention "run_instruction_name.rs", where "instruction_name" matches the name of the instruction in lowercase snake_case format (!except for the mod.rs file).

    - **Files to Include**:
      1. Each instruction must be in its own file in the "src/instructions" directory.
      2. Include \`src/state.rs\` as the file containing account-related code, located directly under \`src/\`.
      3. Include \`src/instructions/mod.rs\` to aggregate all instructions. (make sure the mod.rs is called mod.rs)
      4. Include \`src/lib.rs\` as the entry point for the program.
      5. **Include the SDK file at \`sdk/index.ts\` for the TypeScript SDK.**
      6. **Include the test file at \`tests/${programName}.test.ts\` for the TypeScript tests.**

    - **Output Requirements**:
      - The root object must represent the root directory and include all child files and directories.
      - Do not include unnecessary explanations or comments in the output.
      - Ensure that the JSON object is strictly valid and adheres to the provided schema.

    --- JSON Structure ---
    Provide the output strictly as a JSON object in this exact format:
    ${JSON.stringify(structureSchema, null, 2)}
  `;
};

const generateAccountText = (accountNodes: Node[], accountEdges: Edge[]) => {
  let accountText = `There are ${accountNodes.length} accounts in this program.\n`;

  accountNodes.forEach((account) => {
    const accountData = account.data.item as Account;
    const accountName = accountData.getName();
    const accountDesc = accountData.getDescription();
    const accountJson = accountData.getJson();

    let accountDetails = `${accountName} is ${accountDesc}; with data structure as ${accountJson}`;
    const edge = accountEdges.find((edge) => edge.target === account.id);
    if (edge) {
      accountDetails += `; the seed is ${edge.data?.label}`;
    }

    accountText += `${accountDetails}\n`;
  });

  return accountText;
};

const generateInstructionText = (instructionNodes: Node[]) => {
  let instructionText = `There are ${instructionNodes.length} instructions in this program.\n`;

  instructionNodes.forEach((instruction) => {
    const instructionData = instruction.data.item as Instruction;
    const instructionName = instructionData.getName();
    const instructionDesc = instructionData.getDescription();
    const instructionParams = instructionData.getParams();
    const instructionLogic = instructionData.getLogic();

    let instructionDetails = `${instructionName} is an instruction, ${instructionDesc} with parameters: ${instructionParams}; and logic as following: ${instructionLogic}`;
    instructionText += `${instructionDetails}\n`;
  });

  return instructionText;
};

const findNodesByType = (nodes: Node[], edges: Edge[], programId: string, nodeType: string) => {
  return nodes.filter((node) => {
    return (
      node.type === nodeType &&
      edges.some(
        (edge) => edge.target === node.id && edge.source === programId
      )
    );
  });
};

 const textGenerator = (options: TextGeneratorOptions) => {
  const {
    programName,
    programDescription,
    accountText = '',
    instructionText = '',
    libraryVersion = '0.30.0',
  } = options;

  const generalInstructions = generateGeneralInstructions(programName, programDescription, libraryVersion);
  const programInstructions = generateProgramInstruction(programName, programDescription);

  // Final text composition
  return `${generalInstructions}${programInstructions}${accountText}${instructionText}`;
};

const generateInstructionContent = (instructionData: Instruction) => {
  const instructionName = instructionData.getName();
  const instructionLogic = instructionData.getLogic();
  return `
    // ${instructionName} instruction logic
    pub fn run_${instructionName.toLowerCase()}() {
      ${instructionLogic}
    }
  `;
};

const addDirectoryToProject = (directoryPath: string) => {
  // Logic to add a directory to the project structure
  console.log(`Directory added: ${directoryPath}`);
};

const addFileToProject = (file: { name: string; path: string; type: string; ext: string; content: string }) => {
  // Logic to add a file to the project structure
  console.log(`File added: ${file.path}`);
};

const genStructure = (_programName: string, nodes: Node[], edges: Edge[]) => {
  const programs = nodes.filter((node) => node.type === 'program');
  let allText = '';

  programs.forEach((program) => {
    const programData = program.data.item as Program;
    const accountNodes = findNodesByType(nodes, edges, program.id, 'account');
    const instructionNodes = findNodesByType(nodes, edges, program.id, 'instruction');
    const accountEdges = edges.filter((edge) => edge.source === program.id && accountNodes.some((node) => node.id === edge.target));

    const allAccountText = generateAccountText(accountNodes, accountEdges);
    const allInstructionText = generateInstructionText(instructionNodes);

    // Generate instructions directory and files
    const instructionsDir = `programs/${_programName}/src/instructions`;
    const instructionFiles = instructionNodes.map((instruction) => {
      const instructionData = instruction.data.item as Instruction;
      const instructionName = instructionData.getName();
      const fileName = `run_${instructionName.toLowerCase()}.rs`;
      return {
        name: fileName,
        path: `${instructionsDir}/${fileName}`,
        type: 'file',
        ext: '.rs',
        content: generateInstructionContent(instructionData),
      };
    });

    allText +=
      textGenerator({
        programName: _programName,
        programDescription: programData.getDescription(),
        accountText: allAccountText,
        instructionText: allInstructionText,
      }) + '\n';

    // Add instructions directory and files to the project structure
    addDirectoryToProject(instructionsDir);
    instructionFiles.forEach((file) => addFileToProject(file));
  });

  return allText;
};

export default genStructure;