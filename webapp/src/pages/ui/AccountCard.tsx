import React from "react";
import { Box, Text, VStack, HStack, Divider } from "@chakra-ui/react";
import { Account } from "../../types/uiTypes";

const placeholderAccount = {
  name: "Placeholder Account",
  description: "This is a placeholder account.",
  fields: [
    { name: "field1", type: "string" },
    { name: "field2", type: "number" },
  ],
};

interface AccountCardProps {
  account: Account;
  isSimpleMode: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, isSimpleMode }) => {
  const accountData = account;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      shadow="md"
      width="320px"
    >
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.800">
          {accountData.name}
        </Text>
        {!isSimpleMode &&
          accountData.fields.map((field, idx) => (
            <Box key={idx}>
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                {field.name} ({field.type})
              </Text>
            </Box>
          ))}
      </VStack>
    </Box>
  );
};

export default AccountCard;