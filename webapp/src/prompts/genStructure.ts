import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';

interface TextGeneratorOptions {
  programName: string;
  programDescription: string;
  accountText?: string; 
  instructionText?: string; 
  libraryVersion?: string; // default Anchor version
}

const generateGeneralInstructions = (libraryVersion: string) => {
  return `
    I want to develop a Solana program using Anchor framework, test cases using typescript and a typescript SDK to interact with the program.
    --- File structure for the Anchor program ---
    Please structure the project into multiple files for ease of management.
    Account-related code should be in state.rs.
    Each instruction should be in its own file, grouped by groups of users.
    The function inside the file should be run_[the name of the file].
    Remember to add mod.rs in the folder and sub-folders in the instructions.
    The mod.rs file should include 'pub use [filename]::*;' at the beginning of the file.
    --- Library ---
    Use @coral-xyz/anchor for typescript test code.
    Use Anchor version >= ${libraryVersion}
    --- The test ---
    Write test cases using typescript for each of the functions. The test-case should use the SDK.
    --- The ts SDK ---
    The SDK should cover all instructions and function to get all accounts with filters.\n
    `;
};

const generateProgramInstruction = (programName: string, programDescription: string) => {
  return `
    --- The app ---
    This is a ${programName} for ${programDescription}.
    Return me the project structure as a json object with an array of objects, each object has a key 'name' and 'children' (array of objects).
    The json should remove every unnecessary space, newline so it can be easily parsed by browser JSON.\n
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
    const instructionParams = instructionData.getParameters();
    const instructionLogic = instructionData.getAiInstruction();

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
    libraryVersion = '0.30.1',
  } = options;

  const generalInstructions = generateGeneralInstructions(libraryVersion);
  const programInstructions = generateProgramInstruction(programName, programDescription);

  // Final text composition
  return `${generalInstructions}${programInstructions}${accountText}${instructionText}`;
};

const genStructure = (nodes: Node[], edges: Edge[]) => {
  const programs = nodes.filter((node) => node.type === 'program');
  let allText = '';

  programs.forEach((program) => {
    const programData = program.data.item as Program;
    const accountNodes = findNodesByType(nodes, edges, program.id, 'account');
    const instructionNodes = findNodesByType(nodes, edges, program.id, 'instruction');
    const accountEdges = edges.filter((edge) => edge.source === program.id && accountNodes.some((node) => node.id === edge.target));

    const allAccountText = generateAccountText(accountNodes, accountEdges);
    const allInstructionText = generateInstructionText(instructionNodes);

    allText +=
      textGenerator({
        programName: programData.getName(),
        programDescription: programData.getDescription(),
        accountText: allAccountText,
        instructionText: allInstructionText,
      }) + '\n';
  });

  return allText;
};

export default genStructure;