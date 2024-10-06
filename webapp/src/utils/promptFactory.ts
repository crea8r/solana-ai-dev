import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';

const textGenerator = (
  program_name: string,
  program_description: string,
  account_text: string,
  instruction_text: string
) => {
  const general_instruction = `I want to develop a Solana program using Anchor framework, test cases using typescript and a typescript SDK to interact with the program.
--- File structure for the Anchor program ---
Please structure the project into multiple files for ease of management.
Account-related code should be in state.rs
Each instruction should be in its own file, grouped by groups of users.
The function inside the file should be run_[the name of the file]
Remember to add mod.rs in the folder and sub-folders in the instructions.
The mod.rs file should include 'pub use [filename]::*;' at the beginning of the file.
--- Library ---
Use @coral-xyz/anchor for typescript test code
Use Anchor version >= 0.30.0
--- The test ---
Write test cases using typescript for each of the functions. The test-case should use the SDK.
--- The ts SDK ---
The SDK should cover all instructions and function to get all accounts with filters.\n`;
  const program_insruction = `--- The app ---
  This is a ${program_name} for ${program_description}.\n`;
  return (
    general_instruction + program_insruction + account_text + instruction_text
  );
};

export const prompt = (nodes: Node[], edges: Edge[]) => {
  const programs = nodes.filter((node) => node.type === 'program');
  let all_text = '';
  programs.forEach((program) => {
    // find all account nodes that connected to a program node
    const program_data = program.data.item as Program;
    const accountNodes = nodes.filter((node) => {
      return (
        node.type === 'account' &&
        edges.some(
          (edge) =>
            edge.target === node.id &&
            programs.some((program) => program.id === edge.source)
        )
      );
    });
    console.log('nodes', nodes);
    console.log('edges', edges);
    // find all instruction nodes that connected to a program node
    const instructionNodes = nodes.filter((node) => {
      return (
        node.type === 'instruction' &&
        edges.some(
          (edge) =>
            edge.target === node.id &&
            programs.some((program) => program.id === edge.source)
        )
      );
    });
    // find all edges that connected from the program node to the account nodes
    const accountEdges = edges.filter(
      (edge) =>
        edge.source === program.id &&
        accountNodes.some((node) => node.id === edge.target)
    );
    let all_account_text = '';
    if (accountNodes.length) {
      all_account_text += `There are ${accountNodes.length} accounts in this program.\n`;
      accountNodes.forEach((account) => {
        const account_data = account.data.item as Account;
        const account_name = account_data.getName();
        const account_desc = account_data.getDescription();
        const account_json = account_data.getJson();
        let account_text =
          account_name +
          ' is ' +
          account_desc +
          '; with data structure as ' +
          account_json;
        const edge = accountEdges.find((edge) => edge.target === account.id);
        if (edge) {
          account_text += '; the seed is ' + edge.data?.label;
        }
        all_account_text += account_text + '\n';
      });
    }
    let all_instruction_text = '';
    if (instructionNodes.length) {
      all_instruction_text += `There are ${instructionNodes.length} instructions in this program.\n`;
      instructionNodes.forEach((instruction) => {
        const instruction_data = instruction.data.item as Instruction;
        const instruction_name = instruction_data.getName();
        const instruction_desc = instruction_data.getDescription();
        const instruction_params = instruction_data.getParameters();
        const instruction_ai = instruction_data.getAiInstruction();
        let instruction_text =
          instruction_name +
          ' is a instruction, ' +
          instruction_desc +
          ' with parameters:' +
          instruction_params +
          '; and logic as following: ' +
          instruction_ai;
        all_instruction_text += instruction_text + '\n';
      });
    }
    all_text +=
      textGenerator(
        program_data.getName(),
        program_data.getDescription(),
        all_account_text,
        all_instruction_text
      ) + '\n';
  });
  return all_text;
};
