import { Instruction } from "../items/Instruction";

export const genIns = (instruction: Instruction) => {
  const instructionName = instruction.getName();
  const contextStruct = `${instructionName}Context`;
  const paramsStruct = `${instructionName}Params`;

  const templatePrompt = `
--- Instruction Template ---
Here is the template for generating instruction files:

\`\`\`rust
use anchor_lang::prelude::*;
use crate::state::*;

pub fn ${instructionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
    // Instruction logic here
    Ok(())
}

#[derive(Accounts)]
pub struct ${contextStruct}<'info> {
    // List of accounts involved
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ${paramsStruct} {
    // List of parameters
}

#[error_code]
pub enum ${instructionName}ErrorCode {
    // Error codes
}
\`\`\`

--- JSON Structure ---
  Provide the output strictly as a JSON object in this exact format:
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "function_name": {
        "type": "string",
        "description": "The name of the function in snake_case format prefixed with 'run_'."
      },
      "context_struct": {
        "type": "string",
        "description": "The struct name for the context, e.g., InstructionNameContext."
      },
      "params_struct": {
        "type": "string",
        "description": "The struct name for the parameters, e.g., InstructionNameParams."
      },
      "accounts": {
        "type": "array",
        "description": "A list of accounts with attributes and types. If the account references a custom data structure, use 'Account<'info, StructName>'.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Account name as a string."
            },
            "type": {
              "type": "string",
              "description": "Account type, e.g., 'Account<'info, StructName>', 'Signer<'info>', 'Program<'info>'."
            },
            "attributes": {
              "type": "array",
              "description": "A list of attributes for the account.",
              "items": {
                "type": "string"
              },
              "additionalProperties": false
            }
          },
          "required": ["name", "type", "attributes"],
          "additionalProperties": false
        }
      },
      "params_fields": {
        "type": "array",
        "description": "A list of parameter fields for the instruction.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Parameter name as a string."
            },
            "type": {
              "type": "string",
              "description": "Parameter type, e.g., 'u64', 'String'."
            }
          },
          "required": ["name", "type"],
          "additionalProperties": false
        }
      },
      "error_codes": {
        "type": "array",
        "description": "A list of error codes for the instruction.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Error code name in PascalCase."
            },
            "msg": {
              "type": "string",
              "description": "A human-readable error message."
            }
          },
          "required": ["name", "msg"],
          "additionalProperties": false
        }
      },
      "function_logic": {
        "type": "string",
        "description": "The main function logic as a string. Ensure all error codes referenced here are defined in 'error_codes'."
      },
      "state_context": {
        "type": "string",
        "description": "The generated state.rs file content, used to provide context for instruction generation."
      },
      "accounts_structure": {
        "type": "array",
        "description": "Accounts structure for the state.rs file, linked with accounts to ensure consistency.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The account name. This name should be referenced in the accounts section as a custom data structure."
            },
            "description": {
              "type": "string",
              "description": "A description of the account."
            },
            "data_structure": {
              "type": "object",
              "description": "The structure of the account as JSON, including fields and their types.",
              "properties": {
                "fields": {
                  "type": "array",
                  "description": "A list of fields in the account structure.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string", "description": "Field name." },
                      "type": { "type": "string", "description": "Field type." }
                    },
                    "required": ["name", "type"],
                    "additionalProperties": false
                  }
                },
                "methods": {
                  "type": "array",
                  "description": "A list of methods or operations associated with the account.",
                  "items": { "type": "string" }
                }
              },
              "required": ["fields", "methods"],
              "additionalProperties": false
            }
          },
          "required": ["name", "description", "data_structure"],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "function_name",
      "context_struct",
      "params_struct",
      "accounts",
      "params_fields",
      "error_codes",
      "function_logic",
      "state_context",
      "accounts_structure"
    ],
    "additionalProperties": false
  }

### Field Descriptions:
1. "function_name": The name of the function, which should be "${instructionName}".
2. "context_struct": The struct name for context (e.g., ${contextStruct}).
3. "params_struct": The struct name for parameters (e.g., ${paramsStruct}).
4. "accounts": A list of accounts used by the instruction, each with:
   - "name": Account name as a string.
   - "type": Account type (e.g., "Account<'info, StructName'>", "Signer<'info'>").
   - "attributes": A list of attributes (e.g., ["init", "mut", "signer"]).
5. "params_fields": A list of parameter fields, each with:
   - "name": Parameter name as a string.
   - "type": Parameter type (e.g., "u64", "String").
6. "error_codes": A list of error codes, each with:
   - "name": Error code name in PascalCase.
   - "msg": A human-readable error message.
7. "function_logic": A string containing the main function logic.

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or empty arrays as placeholders).
- The "function_name" should be "${instructionName}".
- **Do not include any extraneous text, explanations, or code fences (\`\`\`json).**
- **Provide only the JSON object as the response.**
`;

  return templatePrompt;
};

