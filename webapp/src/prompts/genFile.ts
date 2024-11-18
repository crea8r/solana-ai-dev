import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { genIns } from './genIns';
import { genState } from './genState';
import { genLib } from './genLib';
import { genSdk } from './genSdk';
import { genTests } from './genTests';

const textGenerator = (
  program_name: string,
  program_description: string,
  account_text: string,
  instruction_text: string,
  sdk_text: string,
  tests_text: string,
  file_name: string,
  file_path: string,
  stateContent?: string,
  additionalPrompt?: string
) => {
  const general_instruction = `I want to develop a Solana program using Anchor framework, test cases using typescript and a typescript SDK to interact with the program.
--- File structure for the Anchor program ---
Please structure the project into multiple files for ease of management.
Account-related code should be in state.rs
Each instruction should be in its own file, grouped by groups of users.
!important - The function inside the file should be run_[the name of the file]
Remember to add mod.rs in the folder and sub-folders in the instructions.
The mod.rs file should include 'pub use [filename]::*;' at the beginning of the file.
The code you are generating is Solana Anchor program, it only relate to rust, typescript, json, md and toml code.
DO NOT use any other programming language. Stay focus, do not be lazy, do not make things up!

--- Library ---
Use @coral-xyz/anchor for typescript test code

--- The test ---
Write test cases using typescript for each of the functions. The test-case should use the SDK.

--- The TypeScript SDK ---
The SDK should provide a high-level interface for interacting with the ${program_name} Solana program.
It should include:
1. Functions for each instruction:
   - Each function should be named after the instruction in camelCase format.
   - Functions should accept parameters as arguments and internally map the accounts required for the instruction.
   - Generate an Anchor 'Transaction' object using the instruction logic.

2. Account fetching utilities:
   - Provide methods to fetch all accounts of each type defined in the program.
   - For each account, include a structured data type that maps fields (e.g., account data and metadata) to their corresponding types.
   - Ensure these functions are efficient and compatible with filters.

3. Integration:
   - Use '@coral-xyz/anchor' to interact with the program.
   - Create a main SDK class that initializes with the 'AnchorProvider', 'Idl', and program ID.
   - Include helper methods for interacting with program instructions and fetching account data.

The SDK should be TypeScript-friendly, properly typed, and adhere to Solana and Anchor development best practices.\n`;


  const program_insruction = `--- The app ---
  This is a ${program_name} for ${program_description}.
  Give me the code for the ${file_name} at this path ${file_path} related to the root folder. The code should be text, friendly to display in browser. Omit any additional instruction, I just need the code.
  \n`;
  const additional_context = `${stateContent ? `--- Additional Context from state.rs ---\n${stateContent}\n\n` : ''}${additionalPrompt ? `--- Additional Context ---\n${additionalPrompt}\n\n` : ''}`;
  return (
    general_instruction +
    program_insruction +
    additional_context +
    account_text +
    instruction_text +
    sdk_text +
    tests_text
  );
};

const genFile = (
  nodes: Node[],
  edges: Edge[],
  fileName: string,
  filePath: string,
  stateContent: string,
  instructionContents?: string[],
) => {
  const programs = nodes.filter((node) => node.type === 'program');

  let all_text = '';

  programs.forEach((program) => {
    const program_data = program.data.item as Program;

    // Collect all instruction nodes connected to the program
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

    if (fileName === 'lib.rs') {
      const libPrompt = `
      I need to generate a \`lib.rs\` file for a Solana Anchor program. Follow the template below and generate only the sections marked for JSON output.

      --- Template ---
      use anchor_lang::prelude::*;

      declare_id!("program_id"); // no info required here

      pub mod instructions;
      pub mod state;

      {{instructionImports}}

      #[program]
      pub mod ${program_data.getName()} {
          use super::*;

          {{programFunctions}}
      }

      --- Required Information ---
      1. \`instructionImports\`: Use the instruction context mapping to generate imports in the format: \`use instructions::module_name::{ContextName, ParamsName};\`
      2. \`programFunctions\`: Generate functions for each instruction, reusing their context and parameters.
      3. Strictly follow the structure in the template. Return the data as a JSON object with \`instructionImports\` and \`programFunctions\` keys.
      !Return the required information only, do not include any other text in the json response.
      `;
    } else {
      // find all account nodes that connected to a program node
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
          let account_text = account_name + ' is ' + account_desc +
            '; with data structure as ' +
            account_json;

          const edge = accountEdges.find((edge) => edge.target === account.id);
          if (edge) account_text += '; the seed is ' + edge.data?.label;

          all_account_text += account_text + '\n' + genState(nodes, edges) + '\n';
        });
      }

      let all_instruction_text = '';
      if (instructionNodes.length) {
        all_instruction_text += `There are ${instructionNodes.length} instructions in this program.\n`;

        instructionNodes.forEach((instruction) => {
          const instruction_data = instruction.data.item as Instruction;
          
          const instruction_prompt = genIns(instruction_data);
          const instruction_name = instruction_data.getName();
          const instruction_desc = instruction_data.getDescription();
          const instruction_params = instruction_data.getParameters();
          const instruction_ai = instruction_data.getAiInstruction();
          let instruction_text = `
          ${instruction_name} is an instruction, ${instruction_desc} with parameters:
          ${instruction_params}, and logic as follows:
          ${instruction_ai}
          ${stateContent ? `--- Additional Context from state.rs ---\n${stateContent}\n\n` : ''}
          ${instruction_prompt}
          `;
          all_instruction_text += instruction_text + '\n';
        });
      }

      let all_sdk_text = '';
      all_sdk_text += genSdk();

      let all_tests_text = '';
      all_tests_text += genTests();

      all_text +=
        textGenerator(
          program_data.getName(),
          program_data.getDescription(),
          all_account_text,
          all_instruction_text,
          all_sdk_text,
          all_tests_text,
          fileName,
          filePath,
          stateContent
        ) + '\n';
    }
  });
  return all_text;
};

export default genFile;
