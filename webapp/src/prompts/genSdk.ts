export const genSdk = () => {
    const sdkPrompt = `
    --- SDK Template ---
    Here is the template for generating the sdk.rs file:
    
    --- JSON Structure ---
    Provide the output strictly as a JSON object in this exact format:
    {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "program_name": {
        "type": "string",
        "description": "The name of the program, used for class and function names."
      },
      "program_id": {
        "type": "string",
        "description": "The unique ID of the Solana program."
      },
      "instructions": {
        "type": "array",
        "description": "Details about the program instructions.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the instruction in camelCase format."
            },
            "description": {
              "type": "string",
              "description": "A description of what the instruction does."
            },
            "params": {
              "type": "array",
              "description": "The list of parameters for the instruction.",
              "items": {
                "type": "string"
              }
            }
          },
          "required": ["name", "description", "params"],
          "additionalProperties": false
        }
      },
      "accounts": {
        "type": "array",
        "description": "Details about the program accounts.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the account."
            },
            "description": {
              "type": "string",
              "description": "A description of the account."
            },
            "fields": {
              "type": "array",
              "description": "The fields within the account structure.",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The field name."
                  },
                  "type": {
                    "type": "string",
                    "description": "The field type, e.g., 'u64', 'String'."
                  }
                },
                "required": ["name", "type"],
                "additionalProperties": false
              }
            }
          },
          "required": ["name", "description", "fields"],
          "additionalProperties": false
        }
      }
    },
    "required": ["program_name", "program_id", "instructions", "accounts"],
    "additionalProperties": false
    }
    `;
    return sdkPrompt;
};
