import React, { useEffect, useState, useMemo } from "react";
import { useProjectContext } from "../../contexts/ProjectContext";
import { Box, Button, Input, Text, Flex } from "@chakra-ui/react";
import { Edge, Node } from "react-flow-renderer";
import { 
  handleCallInstruction, 
  handleInputChange,
} from "../../utils/uiUtils";
import InstructionCard from "./InstructionCard";
import AccountCard from "./AccountCard";
import { Account, Instruction } from "../../types/uiTypes";


const UISpace = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [instructionInputs, setInstructionInputs] = useState<{ [key: string]: string[] }>({});
  const [uiGenerated, setUiGenerated] = useState(false);

  useEffect(() => {
    const initialInputs: { [key: string]: string[] } = {};
    instructions.forEach((instruction: any) => {initialInputs[instruction.function_name] = instruction.params_fields.map((param: any) => param.default_value || "");});
    setInstructionInputs(initialInputs);

    console.log("instructionInputs:", instructionInputs);
    console.log("instructions:", instructions);
  }, [instructions]);

  return (
    <Box width="100%" maxHeight="100%" overflowY="auto">
      <Flex
        direction="row"
        flexWrap="wrap"
        justifyContent="space-evenly"
        alignItems="flex-start"
        gap={4}
        p={4}
        width="100%"
        maxHeight="100%"
        overflowY="auto"
        bg="gray.50"
        shadow="md"
      >
        <InstructionCard instructions={instructions} />
        <AccountCard accounts={accounts} />
      </Flex>
    </Box>
  );
};

export default UISpace;
