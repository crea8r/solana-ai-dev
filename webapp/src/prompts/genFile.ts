import { Edge, Node } from 'react-flow-renderer';
import { Program } from '../items/Program';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { genStatePrompt } from './genState';
import { genInstructionPrompt } from './genIns';
import { genSdkPrompt } from './genSdk';
import { genTestsPrompt } from './genTests';
import { snakeToPascal } from '../utils/genCodeUtils';

const lifetimePrompt = `
**Important Guidelines for Lifetime Annotations and Struct Definitions in Anchor Programs:**

1. **Lifetime Annotations (\`<'info>\`):**  
   Always include the \`<'info>\` lifetime annotation on all accounts and Anchor-specific types such as \`Account\`, \`AccountInfo\`, and \`Program\`. For example:  
   \`\`\`rust
   pub struct ExampleContext<'info> {
       pub example_account: Account<'info, ExampleStruct<'info>>,
       pub info_account: AccountInfo<'info>,
   }
   \`\`\`

2. **Using \`Pubkey\`:**  
   Always use \`Pubkey\` (capitalized correctly) as the type for public keys. Do not use \`PubKey\` or other incorrect variations.

3. **Consistent Struct Usage:**  
   Ensure \`<'info>\` is consistently applied to both \`AccountInfo<'info>\` and associated structs referenced in context definitions. Example:  
   \`\`\`rust
   pub struct IncrementContext<'info> {
       pub counter_account: Account<'info, CounterAccount<'info>>,
       pub system_program: Program<'info, System>,
   }
   \`\`\`

4. **PhantomData for Lifetimes:**  
   Include \`PhantomData\` in structs like \`CounterAccount\` to satisfy the lifetime requirement if no explicit references exist. Example:  
   \`\`\`rust
   pub struct CounterAccount<'info> {
       pub field: u64,
       pub _phantom: PhantomData<&'info ()>,
   }
   \`\`\`

Follow these instructions exactly to ensure that all accounts and structs include the required lifetime annotations, avoiding errors during compilation.
`;


const getConnectedNodes = (
  nodes: Node[],
  edges: Edge[],
  programId: string,
  nodeType: string
): Node[] => {
  return nodes.filter(node => {
    return (
      node.type === nodeType &&
      edges.some(edge => edge.target === node.id && edge.source === programId)
    );
  });
};

const extractProgramInfo = (nodes: Node[]) => {
  const programNode = nodes.find(node => node.type === 'program');
  const programData = programNode?.data.item as Program;
  return {
    programName: programData?.getName() || '',
    programDescription: programData?.getDescription() || '',
    programNodeId: programNode?.id || '',
  };
};

const extractAccountsInfo = (nodes: Node[], edges: Edge[], programId: string) => {
  const accountNodes = getConnectedNodes(nodes, edges, programId, 'account');
  return accountNodes.map(node => {
    const accountData = node.data.item as Account;
    return {
      name: accountData.getName(),
      description: accountData.getDescription(),
      dataStructure: accountData.getJson(),
    };
  });
};

const extractInstructionsInfo = (nodes: Node[], edges: Edge[], programId: string) => {
  const instructionNodes = getConnectedNodes(nodes, edges, programId, 'instruction');
  return instructionNodes.map(node => {
    const instructionData = node.data.item as Instruction;
    return {
      name: instructionData.getName(),
      description: instructionData.getDescription(),
      parameters: instructionData.getParameters(),
      logic: instructionData.getAiInstruction(),
    };
  });
};

export const genFile = (
  nodes: Node[],
  edges: Edge[],
  fileName: string,
  filePath: string,
  stateContent: string,
  additionalPrompt?: string
): string => {
  // Extract program information
  const { programName, programDescription, programNodeId } = extractProgramInfo(nodes);

  // Extract accounts and instructions
  const accounts = extractAccountsInfo(nodes, edges, programNodeId);
  const instructions = extractInstructionsInfo(nodes, edges, programNodeId);

  // General instruction applicable to all files
  const generalInstruction = `
You are an AI assistant tasked with generating code for a Solana program using the Anchor framework.

--- Important Guidelines ---
- **STRICTLY FOLLOW THE INSTRUCTIONS**: Do not deviate from the instructions provided.
- **NO ADDITIONAL TEXT**: Only provide the code requested, without any explanations or additional text.
- **LANGUAGE**: Use Rust for \`*.rs\` files and TypeScript for \`*.ts\` files.
- **FRAMEWORKS**: Use \`@coral-xyz/anchor\` for TypeScript code.
- **BEST PRACTICES**: Follow Solana and Anchor best practices.
- **CODE STRUCTURE**: Structure the project into multiple files for ease of management.

--- Project Information ---
- **Program Name**: ${programName}
- **Program Description**: ${programDescription}

--- Project Structure ---
- Account-related code should be in \`state.rs\`.
- Each instruction should be in its own file.
- The function inside each instruction file should be named \`run_[instruction_name]\`.
- Include \`mod.rs\` files in folders with proper exports.

${additionalPrompt ? `--- Additional Instructions ---\n${additionalPrompt}` : ''}

!--- It is very important that you DO NOT return any other text than the JSON object in the response! no additonal explanations apart from the JSON object ---!

  I want to develop a Solana program using Anchor framework, test cases using typescript and a typescript SDK to interact with the program.
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
The SDK should provide a high-level interface for interacting with the ${programName} Solana program.
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

Important Rules for Struct Definitions and Contexts in Solana Anchor Programs:

Lifetime Annotations (<'info>):
Always include the <'info> lifetime annotation in all struct definitions where accounts or Anchor-specific types (e.g., Account, Program, or Signer) are used. For example:

pub struct ExampleContext<'info> {
    pub example_account: Account<'info, ExampleStruct<'info>>,
}
Using Pubkey:
Always use Pubkey (capitalized correctly) as the type for public keys. Do not use PubKey or other variations.

PhantomData for Lifetimes:
For account structs like CounterAccount, include PhantomData to satisfy the 'info lifetime requirement when no references are explicitly used. For example:

pub struct CounterAccount<'info> {
    pub field: u64,
    pub _phantom: PhantomData<&'info ()>,
}
Params Structs:
Avoid including accounts (like Account or Signer) in the Params struct. These structs should only include additional parameters passed as input.

Consistent Struct Usage:
Ensure <'info> is consistently added to both Account and associated structs like CounterAccount within contexts. 
Example:
pub counter_account: Account<'info, CounterAccount<'info>>,
pub counter_account: AccountInfo<'info>, (in state.rs)
Follow these rules to ensure the program builds successfully without lifetime-related or type mismatch errors.

The SDK should be TypeScript-friendly, properly typed, and adhere to Solana and Anchor development best practices.\n

In all instruction files, make sure to include <'info> after any Account type that references a program account. For example, instead of writing Account<'info, CounterAccount>, it should be Account<'info, CounterAccount<'info>> to properly include the lifetime annotation. This ensures the lifetime is specified and adheres to Anchor's requirements.

Additionally, use Pubkey (with a lowercase "k") as the correct type for public keys in Solana. Replace any occurrences of PubKey or other variations with Pubkey to align with the Solana SDK's conventions.

${lifetimePrompt}
`;

  let promptContent = '';

  if (fileName === 'state.rs') {
    promptContent = genStatePrompt(programName, programDescription, accounts, instructions, generalInstruction);
  } else if (fileName.endsWith('.rs')) {
    let instructionName = snakeToPascal(fileName.replace('.rs', ''));
    if (instructionName.startsWith('Run')) instructionName = instructionName.replace(/^Run/, '');

    console.log(`Instruction Name: ${instructionName}`);
    const instruction = instructions.find(instr => instr.name === instructionName);
    console.log(`Instruction: ${instruction}`);
    promptContent = genInstructionPrompt(
      programName,
      programDescription,
      instruction!,
      accounts,
      stateContent,
      generalInstruction
    );
  } else if (fileName === 'index.ts' && filePath.includes('sdk')) {
    promptContent = genSdkPrompt(
      programName,
      programDescription,
      accounts,
      instructions,
      stateContent,
      generalInstruction
    );
  } else if (fileName.endsWith('.test.ts')) {
    promptContent = genTestsPrompt(
      programName,
      programDescription,
      accounts,
      instructions,
      stateContent,
      generalInstruction
    );
  }
  // Handle other file types if necessary

  return promptContent;
};

export default genFile;
