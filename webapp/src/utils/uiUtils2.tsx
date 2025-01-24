import React from "react";
import { Flex, Box, Text, Input, Button, Tooltip } from "@chakra-ui/react"; // Importing Chakra UI components
import { FaPlus, FaMinus } from "react-icons/fa"; // Importing optional example icons

// Function to render elements based on their type
const renderElement = (element: any) => {
  // Wrapper component to handle layout for elements
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    element.wrapperProperties ? (
      <Flex
        key={element.id}
        justifyContent={element.wrapperProperties.justifyContent || "flex-start"}
        alignItems={element.wrapperProperties.alignItems || "center"}
        width={element.wrapperProperties.width || "auto"}
        mb={4}
      >
        {children}
      </Flex>
    ) : (
      <Box key={element.id} mb={4}>
        {children}
      </Box>
    );

  // Switch to render elements based on their type
  switch (element.type) {
    case "text":
      return (
        <Wrapper>
          <Tooltip label={element.tooltip || ""} hasArrow>
            <Text
              fontSize={element.properties?.fontSize || "md"}
              color={element.properties?.color || "black"}
              fontWeight={element.properties?.fontWeight || "normal"}
            >
              {element.value || ""}
            </Text>
          </Tooltip>
        </Wrapper>
      );
    case "input":
      return (
        <Wrapper>
          <Text fontWeight="bold">{element.label}</Text>
          <Input
            type={element.inputType || "text"}
            placeholder={element.placeholder}
            isRequired={element.validation?.required}
          />
          <Text fontSize="sm" color="gray.500">
            {element.description}
          </Text>
        </Wrapper>
      );
    case "buttonWrapper":
      return (
        <Flex
          key={element.id}
          direction={element.flexProperties?.direction || "row"}
          gap={element.flexProperties?.gap || 4}
          justifyContent={element.flexProperties?.justifyContent || "flex-start"}
          alignItems={element.flexProperties?.alignItems || "flex-start"}
          mb={4}
        >
          {element.buttons.map((button: any) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.id}
                colorScheme={button.colorScheme || "blue"}
                leftIcon={Icon ? <Icon /> : undefined}
                onClick={() => handleButtonAction(button)}
              >
                {button.label}
              </Button>
            );
          })}
        </Flex>
      );
    case "button":
      const ButtonIcon = element.icon;
      return (
        <Wrapper>
          <Button
            key={element.id}
            colorScheme={element.colorScheme || "blue"}
            leftIcon={ButtonIcon ? <ButtonIcon /> : undefined}
            onClick={() => handleButtonAction(element)}
            mb={2}
          >
            {element.label}
          </Button>
        </Wrapper>
      );
    default:
      return null;
  }
};

// Helper function to handle button actions
const handleButtonAction = (button: any) => {
  alert(`Button clicked: ${button.label}`); // Replace with your actual logic
};

// Export the renderElement and handleButtonAction functions
export { renderElement, handleButtonAction };

// To ensure TypeScript treats this file as a module
export {};
