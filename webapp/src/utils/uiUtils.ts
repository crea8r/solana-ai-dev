export const matchInstruction = (nodeName: string, aiInstructions: any[]): any | undefined => {
    const nodeWords = nodeName.toLowerCase().split(/(?=[A-Z])|_|-/).map(word => word.trim()); // Split CamelCase, snake_case, or kebab-case into words
    return aiInstructions.find((instruction) => {
      const functionNameWords = instruction.function_name.toLowerCase().split(/_|-/); // Split snake_case or kebab-case
      return nodeWords.every((word) => functionNameWords.includes(word));
    });
};
export const handleCallInstruction = async (sdkFunction: any, inputs: any) => {
    try {
      const result = await sdkFunction(...inputs);
      console.log("Instruction Result:", result);
    } catch (error) {
      console.error("Error calling instruction:", error);
    }
  };