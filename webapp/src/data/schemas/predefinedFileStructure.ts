import { FileTreeItemType } from "../../interfaces/file";
import { pascalToSnake } from "../../utils/uiUtils";

export const predefinedFileStructure = (
    normalizedProgramName: string,
    instructionNodes: { name: string }[],
  ): FileTreeItemType => {
    
    const customInstructionFiles: FileTreeItemType[] = instructionNodes.map((instructionNode) => ({
      name: `run_${pascalToSnake(instructionNode.name)}.rs`,
      type: "file",
      path: `programs/${normalizedProgramName}/src/instructions/run_${pascalToSnake(instructionNode.name)}.rs`,
      ext: ".rs",
      children: undefined,
    }));
    console.log('customInstructionFiles', customInstructionFiles);
    console.log('snake name', pascalToSnake(instructionNodes[0].name));
  
    return {
      name: "programs",
      type: "directory",
      path: `programs/`,
      children: [
        {
          name: normalizedProgramName,
          type: "directory",
          path: `programs/${normalizedProgramName}`,
          children: [
            {
              name: "src",
              type: "directory",
              path: `programs/${normalizedProgramName}/src`,
              children: [
                {
                  name: "state.rs",
                  type: "file",
                  path: `programs/${normalizedProgramName}/src/state.rs`,
                  ext: ".rs",
                },
                {
                  name: "lib.rs",
                  type: "file",
                  path: `programs/${normalizedProgramName}/src/lib.rs`,
                  ext: ".rs",
                },
                {
                  name: "instructions",
                  type: "directory",
                  path: `programs/${normalizedProgramName}/src/instructions`,
                  children: [
                    ...customInstructionFiles,
                    {
                      name: "mod.rs",
                      type: "file",
                      path: `programs/${normalizedProgramName}/src/instructions/mod.rs`,
                      ext: ".rs",
                    },
                  ],
                },
              ],
            },
            {
              name: "Cargo.toml",
              type: "file",
              path: `programs/${normalizedProgramName}/Cargo.toml`,
              ext: ".toml",
            },
            {
              name: "Xargo.toml",
              type: "file",
              path: `programs/${normalizedProgramName}/Xargo.toml`,
              ext: ".toml",
            },
          ],
        },
      ],
    };
  };
  
