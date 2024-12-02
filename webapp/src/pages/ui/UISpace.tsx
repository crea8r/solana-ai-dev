import React, { useEffect, useMemo } from "react";
import { useProjectContext } from "../../contexts/ProjectContext";
import { Box, Flex } from "@chakra-ui/react";
import InstructionCard from "./InstructionCard";
import AccountCard from "./AccountCard";
import { Account, Instruction } from "../../types/uiTypes";
import { processInstructions } from "../../utils/uiUtils";
import { userInfo } from "os";

const UISpace = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const { nodes } = projectContext.details;

  // Memoized instruction and account nodes
  const instructionNodes = useMemo(
    () => nodes.filter((node) => node.type === "instruction"),
    [nodes]
  );
  const accountNodes = useMemo(
    () => nodes.filter((node) => node.type === "account"),
    [nodes]
  );

  const instructions = useMemo(() => {
    const parsedInstructions = projectContext.details.idl?.parsed?.instructions;
  
    if (!parsedInstructions || parsedInstructions.length === 0) {
      return [];
    }
  
    console.log("instructions:", parsedInstructions);
  
    if (parsedInstructions[0]?.description) return parsedInstructions;
  
    return [];
  }, [projectContext.details.idl.parsed.instructions]);


  const accounts = useMemo(() => {
    console.log(" idl.parsed.accounts:", projectContext.details.idl.parsed.accounts);
    return projectContext.details.idl.parsed.accounts;
  }, []);

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
        {instructions.length > 0 && instructions[0].description &&
          instructions.map((instruction) => (
            <InstructionCard key={instruction.name} instruction={instruction} />
          ))}
        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.name} account={account} />
          ))}
      </Flex>
    </Box>
  );
};

export default UISpace;
