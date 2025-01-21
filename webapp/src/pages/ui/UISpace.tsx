import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Grid,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useProjectContext } from "../../contexts/ProjectContext";

const UISpace = () => {
  const { projectContext } = useProjectContext();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const uiStructure = useMemo(() => {
    console.log("projectContext:", projectContext);
    return projectContext?.details?.uiStructure || {};
  }, [projectContext.details]);

  const renderFormElement = (element: any) => {
    switch (element.type) {
      case "text":
        return (
          <Box key={element.id} mb={4}>
            <Text fontWeight="bold">{element.label}</Text>
            <Input
              value={element.description || ""}
              placeholder={element.placeholder}
              isReadOnly
              variant="filled"
            />
          </Box>
        );
      case "input":
        return (
          <Box key={element.id} mb={4}>
            <Text fontWeight="bold">{element.label}</Text>
            <Input
              type={element.inputType || "text"}
              placeholder={element.placeholder}
              isRequired={element.validation?.required}
            />
            <Text fontSize="sm" color="gray.500">
              {element.description}
            </Text>
          </Box>
        );
      case "button":
        return (
          <Button
            key={element.id}
            colorScheme="blue"
            isDisabled={element.disabledByDefault}
            onClick={() => handleButtonAction(element)}
            mb={2}
          >
            {element.label}
          </Button>
        );
      default:
        return null;
    }
  };

  const handleButtonAction = (element: any) => {
    toast({
      title: `${element.label} clicked`,
      description: element.description,
      status: "info",
      duration: 3000,
    });
  };

  return (
    <Box p={6} maxWidth="900px" mx="auto">
      <Flex
        bg="gray.100"
        p={4}
        shadow="md"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="2xl" fontWeight="bold">
          {uiStructure.header?.title || "Program Interface"}
        </Text>
        <Flex alignItems="center" gap={4}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Menu
            </MenuButton>
            <MenuList>
              {uiStructure.header?.navigationMenu?.map((menuItem: string) => (
                <MenuItem key={menuItem}>{menuItem}</MenuItem>
              ))}
            </MenuList>
          </Menu>
          <IconButton
            aria-label="Toggle Dark Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>

      <Accordion allowMultiple mt={4}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="bold">
              {uiStructure.mainSection?.title || "Main Form"}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {uiStructure.mainSection?.formElements.map((element: any) =>
                renderFormElement(element)
              )}
            </Grid>
          </AccordionPanel>
        </AccordionItem>

        {uiStructure.confirmationModal && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                {uiStructure.confirmationModal.title || "Confirmation"}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {uiStructure.confirmationModal.content.fields.map((field: any) =>
                renderFormElement(field)
              )}
            </AccordionPanel>
          </AccordionItem>
        )}

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="bold">
              {uiStructure.feedbackSection?.title || "Transaction Status"}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {uiStructure.feedbackSection?.elements.map((element: any) =>
              renderFormElement(element)
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Flex mt={6} position="sticky" bottom="0" bg="white" py={4}>
        <Button colorScheme="blue" mr={2}>
          Submit
        </Button>
        <Button variant="outline">Cancel</Button>
      </Flex>
    </Box>
  );
};

export default UISpace;
