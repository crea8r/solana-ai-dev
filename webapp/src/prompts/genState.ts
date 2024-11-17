import { Edge, Node } from 'react-flow-renderer';
import { Account } from '../items/Account';

export const genState = (nodes: Node[], edges: Edge[]) => {
  // Filter all account nodes
  const accountNodes = nodes.filter((node) => node.type === 'account');

  // Generate structured JSON for accounts
  let accountsJson = accountNodes.map((node) => {
    const accountData = node.data.item as Account;

    return {
      name: accountData.getName(),
      description: accountData.getDescription(),
      data_structure: accountData.getJson(),
    };
  });

  const templatePrompt = `
--- State Template ---
Here is the template for generating the state.rs file:

\`\`\`rust
use anchor_lang::prelude::*;

#[account]
pub struct {AccountName} {
    // Fields for the account
}

// Additional structs, enums, or constants as needed
\`\`\`

--- Generate Content ---
Please provide the following in structured JSON format:
1. Accounts: List each account with its fields and types.
2. Additional context, such as constants or enums, if required.

Provide the required state details in the following strict JSON format:
{
  "accounts": [
    {
      "name": "{account_name}",
      "description": "{account_description}",
      "data_structure": {data_structure_as_json}
    }
  ]
}

### Field Descriptions:
1. "name": The account name as a string.
2. "description": A description of the account.
3. "data_structure": The structure of the account as JSON.

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or arrays as placeholders).
- Do not include any extraneous text or explanations outside the JSON object.
`;

  return templatePrompt + '\n' + JSON.stringify({ accounts: accountsJson }, null, 2);
};
