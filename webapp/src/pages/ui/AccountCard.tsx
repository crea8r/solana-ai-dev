import { Text, Box } from "@chakra-ui/react";
import { AccountField } from "../../types/uiTypes";
import { Flex } from "@chakra-ui/react";

const AccountCard = ({ accounts }: { accounts: any[] }) => {
    return (
      <Flex wrap="wrap" gap={4}>
        {accounts.map((account, idx) => (
          <Box
            key={idx}
            borderWidth="1px"
            borderRadius="md"
            p={4}
            bg="white"
            shadow="md"
            minWidth="300px"
            maxWidth="350px"
          >
            <Text fontWeight="bold" fontSize="lg" color="purple.500">
              {account.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {account.description}
            </Text>
            {account.fields.map((field: AccountField, idx: number) => (
              <Text key={idx} fontSize="sm" color="gray.500">
                {field.name}: {field.type}
              </Text>
            ))}
          </Box>
        ))}
      </Flex>
    );
  };
  
  export default AccountCard;
