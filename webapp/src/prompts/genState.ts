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

--- JSON Structure ---
Provide the output strictly as a JSON object in this exact format:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "accounts": {
      "type": "array",
      "description": "List of accounts used in the program.",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the account."
          },
          "description": {
            "type": "string",
            "description": "A brief description of the account's purpose or role."
          },
          "data_structure": {
            "type": "object",
            "description": "JSON representation of the account's fields and types.",
            "properties": {
              "fields": {
                "type": "array",
                "description": "List of fields in the account structure.",
                "items": {
                  "type": "object",
                  "properties": {
                    "field_name": {
                      "type": "string",
                      "description": "The name of the field."
                    },
                    "field_type": {
                      "type": "string",
                      "description": "The data type of the field (e.g., u64, String)."
                    },
                    "attributes": {
                      "type": "array",
                      "description": "Optional attributes for the field (e.g., mutability, serialization).",
                      "items": {
                        "type": "string"
                      }
                    }
                  },
                  "required": ["field_name", "field_type", "attributes"],
                  "additionalProperties": false
                }
              }
            },
            "required": ["fields"],
            "additionalProperties": false
          }
        },
        "required": ["name", "description", "data_structure"],
        "additionalProperties": false
      }
    },
    "additional_context": {
      "type": "string",
      "description": "Any additional context, constants, or enums required for the state.rs file."
    }
  },
  "required": ["accounts", "additional_context"],
  "additionalProperties": false
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
