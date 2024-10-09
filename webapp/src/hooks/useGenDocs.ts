import { useProject } from '../contexts/ProjectContext';

export const useGenDocs = () => {
  const { project } = useProject();

  if (!project) {
    return null;
  }

  const { nodes, edges, files, codes } = project;

  // Log the user data context
  // console.log('Nodes:', nodes);
  // console.log('Edges:', edges);
  // console.log('Files:', files);
  // console.log('Codes:', codes);

  // Check if any of the required data is missing
  if (!nodes || !edges || !files || !codes) {
    // console.warn('Missing data for documentation generation');
    return null;
  }

  // Convert objects to strings
  const nodesStr = JSON.stringify(nodes, null, 2);
  const edgesStr = JSON.stringify(edges, null, 2);
  const filesStr = JSON.stringify(files, null, 2);
  const codesStr = JSON.stringify(codes, null, 2);

  const docs_prompt = `I want you to generate a comprehensive documentation wiki page for the specified Solana dApp. The dApp's structure includes an on-chain program, instructions, and a test script.
Use the following inputs to generate the documentation:

File Structure:
${filesStr}
Code Files:
${codesStr}
Here is a graph where nodes represent on-chain entities (programs, instructions, or accounts) and edges depict their connections and relationships.
Nodes:
${nodesStr}
Edges:
${edgesStr}

Using this information, generate a detailed wiki page that includes the following sections:

1. Overview
- Summarize the dApp's purpose and core feature/functionality.
2. File Structure
- List and explain the main directories and files within the project in a tree structure.
- Provide brief descriptions of the role of each major file or folder.
3. On-Chain Data
- Use the nodes and edges from the graph to describe each on-chain account and program.
- Provide a detailed explanation of the instructions that interact with these accounts and programs, including their purpose and expected inputs/outputs.
Describe the relationships between accounts, including ownership and state management, as illustrated by the graph edges.
4. Test Script
- Give an explanation of how the test script functions and what it tests in the programs.
5. Key Actions & Interactions
- Based on the nodes and edges in the graph, explain the key actions users can take within the dApp, such as sending transactions, interacting with programs, or managing on-chain assets.
Include a step-by-step description of the most important workflows, mapping each step to the corresponding program instruction and frontend/backend interaction.
8. Error Handling and Debugging (if applicable)
- Explain how errors are handled both (including transaction failures, invalid instructions, etc).
- Provide examples from the codebase on how errors are logged and resolved.
- Display this information only if defined, leave empty if not defined.
9. Tokenomics & Asset Management (if applicable)
- If the dApp deals with tokens or NFTs, explain how these assets are managed on-chain, including minting, transferring, and staking mechanisms.
- Use the graph definition to describe the flow of assets between accounts and programs.
10. Security & Best Practices (if applicable)
- Outline the security features built into the dApp, such as access control, secure key management, and multi-signature wallets.
- Include any security-related logic found in the Solana program or backend code.
- Display this information only if defined, leave empty if not defined.
11. Installation & Deployment
- Provide a step-by-step guide on how to set up the dApp locally using the file structure and code files.
- Include instructions for deploying the Solana program to the devnet or mainnet, and how to configure the frontend and backend services for production.
`;

  // console.log(docs_prompt); // Log the docs_prompt before returning it
  return docs_prompt;
};
