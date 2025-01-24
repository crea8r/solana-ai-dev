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
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useProjectContext } from "../../contexts/ProjectContext";
import { renderElement } from "../../utils/uiUtils2";

const UISpace = () => {
  const { projectContext } = useProjectContext();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const uiStructure = useMemo(() => {
    return (
      projectContext?.details?.uiStructure || {
        header: { title: "Program Interface", navigationMenu: [] },
        mainSection: { layout: "vertical", elements: [] },
      }
    );
  }, [projectContext.details]);


  const handleButtonAction = (element: any) => {
    toast({
      title: `${element.label} clicked`,
      description: element.description || "Button action triggered",
      status: "info",
      duration: 3000,
    });
  };

  return (
    <Box width="100%" shadow="md" borderRadius="md">
      {/* Header */}
      <Flex
        bg="gray.100"
        width="100%"
        p={2}
        shadow="md"
        justifyContent="space-between"
        alignItems="center"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm" fontWeight="bold">
          {uiStructure.header?.title || "Program Interface"}
        </Text>
        <Flex alignItems="center" gap={4}>
          {uiStructure.header?.navigationMenu && uiStructure.header.navigationMenu.length > 0 && (
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
                Menu
              </MenuButton>
              <MenuList>
                {uiStructure.header.navigationMenu.map((menuItem: string) => (
                  <MenuItem key={menuItem}>{menuItem}</MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
          {/*
          <IconButton
            aria-label="Toggle Dark Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
          */}
        </Flex>
      </Flex>

      {/* Main Section */}
      <Flex direction={uiStructure.mainSection?.layout === "vertical" ? "column" : "row"} p={4}>
        {uiStructure.mainSection?.elements?.map((element: any) =>
          renderElement(element)
        )}
      </Flex>

      {/*}
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
      */}

      {/*
      <Flex mt={6} position="sticky" bottom="0" bg="white" py={4}>
        <Button colorScheme="blue" mr={2}>
          Submit
        </Button>
        <Button variant="outline">Cancel</Button>
      </Flex>
      */}
    </Box>
  );
};

export default UISpace;
