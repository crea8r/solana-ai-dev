import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';

interface TextGeneratorOptions {
  programName: string;
  programDescription: string;
  accountText?: string; 
  instructionText?: string; 
  libraryVersion?: string;
}

const generateGeneralInstructions = (libraryVersion: string) => {
  return `
    I want to develop a Solana program using Anchor framework, test cases using TypeScript, and a TypeScript SDK to interact with the program.
    --- File structure for the Anchor program ---
    The root folder should include:
    - Cargo.toml: This file should define the workspace and include all program members.
    Each program should have its own directory (e.g., programs/subscription_service) that includes:
    - Cargo.toml: specific to that program to manage dependencies.
    - src/lib.rs: with the main logic for the program.
    Account-related code should be in state.rs.
    Each instruction should be in its own file.
    The function inside the file should be run_[the name of the file].
    Remember to add mod.rs in the folder and sub-folders in the instructions.
    Do not produce mod.rs file for the project root folder.
    The mod.rs file should include 'pub use [filename]::*;' at the beginning of the file.


    --- Library ---
    Use @coral-xyz/anchor for TypeScript test code.
    Use Anchor version >= ${libraryVersion}
    --- The test ---
    Write test cases using TypeScript for each of the functions. The test case should use the SDK.
    --- The TypeScript SDK ---
    The SDK should cover all instructions and functions to get all accounts with filters.\n
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
    libraryVersion = '0.30.0',
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