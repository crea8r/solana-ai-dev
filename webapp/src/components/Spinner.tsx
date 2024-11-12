import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = () => (
  <Box
    as="span"
    display="inline-block"
    width="12px"
    height="12px"
    border="2px solid"
    borderColor="gray.500"
    borderTopColor="transparent"
    borderRadius="50%"
    animation={`${rotate} 1s linear infinite`}
    mr={2}
  />
);
