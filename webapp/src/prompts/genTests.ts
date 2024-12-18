export const genTests = () => {
    const testsPrompt = `
    --- Tests Template ---
    Here is the template for generating the tests.rs file:
    
    --- JSON Structure ---
    Provide the output strictly as a JSON object in this exact format:
    {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Test File AI Response Schema",
    "type": "object",
    "properties": {
      "program_name": {
        "type": "string",
        "description": "The name of the program, used for naming and references."
      },
      "program_id": {
        "type": "string",
        "description": "The unique ID of the Solana program."
      },
      "instructions": {
        "type": "array",
        "description": "Details of instructions to create test cases.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the instruction."
            },
            "description": {
              "type": "string",
              "description": "A brief description of what the instruction does."
            },
            "params": {
              "type": "array",
              "description": "A list of parameters for the instruction.",
              "items": {
                "type": "string",
                "description": "The name of the parameter."
              }
            }
          },
          "required": ["name", "description", "params"],
          "additionalProperties": false
        }
      },
      "accounts": {
        "type": "array",
        "description": "Details of accounts to be initialized in tests.",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the account."
            },
            "description": {
              "type": "string",
              "description": "A brief description of the account."
            },
            "fields": {
              "type": "array",
              "description": "The fields within the account structure.",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the field."
                  },
                  "type": {
                    "type": "string",
                    "description": "The type of the field, e.g., 'u64', 'String'."
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
    return testsPrompt;
};
