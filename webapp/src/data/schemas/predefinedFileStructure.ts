import { FileTreeItemType } from "../../interfaces/file";
import { pascalToSnake } from "../../utils/uiUtils";

export const predefinedFileStructure = (
    normalizedProgramName: string,
    instructionNames: string[],
  ): FileTreeItemType => {
    const customInstructionFiles: FileTreeItemType[] = instructionNames.map((instructionName) => ({
      name: `${instructionName}`,
      type: "file",
      path: `programs/${normalizedProgramName}/src/instructions/${instructionName}.rs`,
      ext: ".rs",
      children: undefined,
    }));
  
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
          ],
        },
      ],
    };
  };
  
