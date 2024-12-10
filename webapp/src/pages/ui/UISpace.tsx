import React, { useMemo } from "react";
import { useProjectContext } from "../../contexts/ProjectContext";
import { Box, Flex, Text, Switch, HStack } from "@chakra-ui/react";
import InstructionCard from "./InstructionCard";
import AccountCard from "./AccountCard";

const UISpace = ({
  toggleState,
  onToggleChange,
}: {
  toggleState: boolean;
  onToggleChange: (checked: boolean) => void;
}) => {
  const { projectContext } = useProjectContext();

  const instructions = useMemo(() => {
    const parsedInstructions =
      projectContext.details.idl?.parsed?.instructions || [];
    return parsedInstructions;
  }, [projectContext.details.idl.parsed]);

  const accounts = useMemo(() => {
    const parsedAccounts = projectContext.details.idl?.parsed?.accounts || [];
    return parsedAccounts;
  }, [projectContext.details.idl.parsed]);

  const isUIGenerated = instructions.length > 0;

  return (
    <Box width="100%" maxHeight="100%" overflowY="auto">
      <HStack justifyContent="center" mt={4} mb={4} spacing={6}>
        <Text fontSize="lg" fontWeight="medium" color="gray.600">
          Simple
        </Text>
        <Switch
          size="lg"
          isChecked={toggleState}
          onChange={(e) => onToggleChange(e.target.checked)}
          sx={{
            ".chakra-switch__track": {
              backgroundColor: toggleState ? "#a9b7ff" : "gray.200",
            },
            ".chakra-switch__thumb": {
              backgroundColor: "white",
            },
          }}
        />
        <Text fontSize="lg" fontWeight="medium" color="gray.600">
          Advanced
        </Text>
      </HStack>

      {isUIGenerated && (
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
          {instructions.map((instruction) => (
            <InstructionCard
              key={instruction.name}
              instruction={instruction}
              isSimpleMode={!toggleState}
            />
          ))}
          <AccountCard
            key={accounts[0].name}
            account={accounts[0]}
            isSimpleMode={!toggleState}
          />
        </Flex>
      )}
    </Box>
  );
};

export default UISpace;
