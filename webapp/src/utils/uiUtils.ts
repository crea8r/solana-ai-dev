import { uiPrompt } from "../prompts/genUI";
import { promptAI } from "../services/prompt";
import uiSchema from "../data/ai_schema/uiSchema.json";
export const matchInstruction = (nodeName: string, aiInstructions: any[]): any | undefined => {
  console.log("aiInstructions:", aiInstructions);
  if(!aiInstructions) {
    console.error("No AI instructions found");
    return undefined;
  }
  const normalizedNodeName = 'run_' + nodeName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/^_+|_+$/g, '');

  return aiInstructions.find((instruction) => instruction.function_name === normalizedNodeName);
};

export const handleCallInstruction = async (sdkFunction: any, inputs: any) => {
  try {
    const result = await sdkFunction(...inputs);
    console.log("Instruction Result:", result);
  } catch (error) {
    console.error("Error calling instruction:", error);
  }
};

export const handleInputChange = (
  instructionKey: string,
  paramIdx: number,
  value: string,
  setInstructionInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
) => {
  setInstructionInputs((prev) => {
    const prevInputs = prev[instructionKey] || [];
    const newInputs = [...prevInputs];
    newInputs[paramIdx] = value;
    return {
      ...prev,
      [instructionKey]: newInputs,
    };
  });
};

export const generateUI = async (
  aiInstructions: any[],
  aiModel: string,
  apiKey: string,
  walletPublicKey: string
): Promise<
    {
      function_name: string;
      params_fields: {
        name: string;
        type: string;
        expected_source: string;
        valueSource: string;
      }[];
    }[]
  > => {
  if (!Array.isArray(aiInstructions) || aiInstructions.length === 0) throw new Error("No AI instructions to process.");
  if (!aiModel) throw new Error("AI model is required.");
  if (!apiKey) throw new Error("API key is required.");
  if (!walletPublicKey) throw new Error("Wallet public key is required.");
  const processedResults: any[] = [];

  for (const instruction of aiInstructions) {
    try {
      const instructionOutput = {
        function_name: instruction.function_name,
        instruction_description: instruction.description,
        params_fields: instruction.params_fields,
      };

      const prompt = uiPrompt(instructionOutput);
      const uiJsonResponse = await promptAI(prompt, aiModel, apiKey, uiSchema, "ui");

      if (!uiJsonResponse) { console.error(`No response for instruction: ${instruction.function_name}`); continue; }

      const parsedResponse = JSON.parse(uiJsonResponse);
      console.log(`UI JSON for ${instruction.function_name}:`, parsedResponse);

      const updatedParams = parsedResponse.params_fields.map((param: any) => {
        let valueSource = "user"; 
        switch (param.expected_source) {
          case "walletPublicKey":
            valueSource = walletPublicKey;
            break;
          case "linkedAccount":
            valueSource = "linkedAccountSelector";
            break;
          case "systemProgram":
            valueSource = "SystemProgram";
            break;
          case "none":
          default:
            valueSource = "user";
        }

        return {
          ...param,
          valueSource,
        };
      });

      processedResults.push({
        function_name: instruction.function_name,
        params_fields: updatedParams,
      });


    } catch (error) {
      console.error(
        `Error processing instruction: ${instruction.function_name}`,
        error
      );
    }
  }

  console.log("Processed AI Instructions:", processedResults);
  return processedResults;
};