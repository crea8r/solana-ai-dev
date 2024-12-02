import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { Account } from "../../types/uiTypes";

interface AccountCardProps {
  account: Account;
}

const placeholderAccount: Account = {
  name: "Placeholder Account",
  description: "This is a placeholder account for demonstration purposes.",
  fields: [
    { name: "field1", type: "string" },
    { name: "field2", type: "number" },
  ],
};

const AccountCard: React.FC<AccountCardProps> = ({ account = placeholderAccount }) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" width="300px" bg="white" shadow="md">
      <Text fontSize="lg" fontWeight="bold" color="#7f7de8">
        {account.name}
      </Text>
      <Text mt={2} fontSize="sm" color="gray.600">
        {account.description}
      </Text>
      {account.fields.map((field, idx) => (
        <Text key={idx} fontSize="sm" color="gray.500">
          {field.name}: {field.type}
        </Text>
      ))}
    </Box>
  );
};

export default AccountCard;
