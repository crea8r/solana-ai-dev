import { memo } from 'react';
import { BsBox } from "react-icons/bs";
import { ProgramToolboxItem, ToolboxItem } from '../interfaces/ToolboxItem';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { 
    Input, 
    Textarea, 
    VStack, 
    Text, Flex, Select, Divider, Tag, TagLabel, Wrap, WrapItem, CloseButton, MenuItemOption, MenuOptionGroup, MenuList, Menu, MenuButton, Button, Checkbox, Switch, Box, IconButton, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge } from '@chakra-ui/react';
import { IoMdClose } from "react-icons/io";

export class Program implements ProgramToolboxItem {
  identifier: string;
  type: 'program' = 'program';
  name: string;
  description: string;
  programId: string;
  account: string[];
  instruction: string[];
  isPublic: boolean;
  version?: string;
  events?: { name: string; fields: { name: string; type: string }[] }[];
  errorCodes?: { code: number; name: string; msg: string }[];

  constructor(
    id: string,
    name: string,
    description: string,
    programId: string,
    account: string[] = [],
    instruction: string[] = [],
    isPublic: boolean = true,
    version?: string,
    events: { name: string; fields: { name: string; type: string }[] }[] = [],
    errorCodes: { code: number; name: string; msg: string }[] = []
  ) {
    this.identifier = id;
    this.type = 'program';
    this.name = name;
    this.description = description;
    this.programId = programId;
    this.account = account;
    this.instruction = instruction;
    this.isPublic = isPublic;
    this.version = version;
    this.events = events;
    this.errorCodes = errorCodes;
  }

  getType(): 'program' { return this.type; }

  getName(): string { return this.name; }
  setName(name: string): void {  this.name = name; }

  getDescription(): string { return this.description; }
  setDescription(description: string): void { this.description = description; }

  getProgramId(): string { return this.programId; }
  setProgramId(programId: string): void { this.programId = programId; }

  setAccounts(accounts: { id: string; name: string }[]): void {
    this.account = accounts.map((account) => account.id);
  }

  setInstructions(instructions: { id: string; name: string }[]): void {
    this.instruction = instructions.map((instruction) => instruction.id);
  }

  setIsPublic(isPublic: boolean): void {
    this.isPublic = isPublic;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'program',
      position,
      data: { label: this.name, item: this },
    };
  }

  renderProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <Flex direction="column" gap={4}> 
        <Flex direction="column" gap={4}>
          <Text fontSize="xs" fontWeight="semibold">Name *</Text>
          <Input
            placeholder="Name"
            value={values.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            fontSize="xs"
          />
        </Flex>
        <Flex direction="column" gap={4}>
          <Text fontSize="xs" fontWeight="semibold">Description *</Text>
          <Textarea
            placeholder="Description"
            value={values.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            fontSize="xs"
          />
        </Flex>
        <Flex direction="column" gap={4}>
          <Text fontSize="xs" fontWeight="semibold">Program ID</Text>
          <Input
            placeholder="Program ID"
            value={values.programId || ""}
            onChange={(e) => onChange("programId", e.target.value)}
            fontSize="xs"
          />
        </Flex>
      </Flex>
    );
  }

  renderProgramProperties(
    accounts: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any,
    handleAddAccount: (accountId: string) => void,
    connectedAccounts: { id: string; name: string }[],
    handleRemoveAccount: (accountId: string) => void,
    instructions: { id: string; name: string }[],
    connectedInstructions: { id: string; name: string }[],
    handleAddInstruction: (instructionId: string) => void,
    handleRemoveInstruction: (instructionId: string) => void,
    version: string,
    description: string,
    tags: string[],
    events: { name: string; fields: { name: string; type: string }[] }[] = [],
    errorCodes: { code: number; name: string; msg: string }[] = []
  ): JSX.Element {
    return (
      <VStack
        spacing={6} 
        align="stretch" 
        padding="4" 
        bg="white" 
        borderRadius="md" 
        boxShadow="sm"
        width="100%"
      >
        {/* Program Details Section */}
        <Box 
          padding="4" 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="md" 
          fontSize="xs"
          fontFamily="IBM Plex Mono"
        >
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" mb={5}>
              Program Details
            </Text>
          </Flex>
          <Flex direction="column" gap={4}>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Name *</Text>
              <Input
                placeholder="Program Name"
                value={values.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
                fontSize="xs"
                size="xs"
              />
            </Flex>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Description *</Text>
              <Textarea
                placeholder="Description"
                value={values.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                fontSize="xs"
                size="xs"
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
              />
            </Flex>
            <Flex direction="column">
              <Text fontSize="xs" fontWeight="semibold">Program ID</Text>
              <Input
                placeholder="Program ID"
                value={values.programId || ''}
                onChange={(e) => onChange('programId', e.target.value)}
                fontSize="xs"
                size="xs"
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
              />
            </Flex>
          </Flex>

          {/* Public/Private Toggle */}
          <Flex alignItems="center" gap={4} mt={4}>
            <Text fontSize="xs">Private</Text>
            <Switch
              size="sm"
              colorScheme="blackAlpha"
              isChecked={values.isPublic}
              onChange={(e) => onChange('isPublic', e.target.checked)}
            />
            <Text fontSize="xs">Public</Text>
          </Flex>
        </Box>

        {/* Accounts Section */}
        <Box 
          padding="4" 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="md"
          fontSize="xs"
          fontFamily="IBM Plex Mono"
        >
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" mb={5}>
              Accounts
            </Text>
          </Flex>
          <Wrap spacing={2} mb={3}>
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((account) => (
                <WrapItem key={account.id}>
                  <Tag size="xs" fontSize="xs" px="1" variant="subtle" bg="gray.50" border="1px solid" borderColor="#80a3ff" color="gray.800">
                    <TagLabel fontSize="2xs">{account.name || 'Unnamed Account'}</TagLabel>
                    <IconButton
                      icon={<IoMdClose />}
                      size="xs"
                      fontSize="xs"
                      ml={1}
                      mr={-1}
                      bg="transparent"
                      aria-label="Remove account"
                      onClick={() => handleRemoveAccount(account.id)}
                    />
                  </Tag>
                </WrapItem>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">
                No accounts connected
              </Text>
            )}
          </Wrap>
          <Select
            placeholder="Select an account to connect"
            onChange={(e) => handleAddAccount(e.target.value)}
            size="xs"
            fontSize="xs"
            padding="2"
            bg="white"
            borderColor="gray.300"
            borderRadius="md"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </Box>

        {/* Instructions Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontSize="xs" fontFamily="IBM Plex Mono">
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" mb={5}>
              Instructions
            </Text>
          </Flex>
          <Wrap spacing={2} mb={3}>
            {connectedInstructions.length > 0 ? (
              connectedInstructions.map((instruction) => (
                <WrapItem key={instruction.id}>
                  <Tag size="xs" fontSize="xs" px="1" variant="subtle" bg="gray.50" border="1px solid" borderColor="#80a3ff" color="gray.800">
                    <TagLabel fontSize="2xs">{instruction.name || 'Unnamed Instruction'}</TagLabel>
                    <IconButton
                      icon={<IoMdClose />}
                      size="xs"
                      fontSize="xs"
                      ml={1}
                      mr={-1}
                      bg="transparent"
                      aria-label="Remove instruction"
                      onClick={() => handleRemoveInstruction(instruction.id)}
                    />
                  </Tag>
                </WrapItem>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">
                No instructions connected
              </Text>
            )}
          </Wrap>
          <Select
            placeholder="Select an instruction to connect"
            onChange={(e) => handleAddInstruction(e.target.value)}
            size="xs"
            fontSize="xs"
            padding="2"
            bg="white"
            borderColor="gray.300"
            borderRadius="md"
          >
            {instructions.map((instruction) => (
              <option key={instruction.id} value={instruction.id}>
                {instruction.name}
              </option>
            ))}
          </Select>
        </Box>

        {/* Events Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontFamily="IBM Plex Mono">
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" mb={5}>
              Events
            </Text>
          </Flex>
          <Accordion allowToggle>
            {events.length ? (
              events.map((event, index) => (
                <AccordionItem key={index} border="none" fontSize="xs">
                  <h2>
                    <AccordionButton
                      padding="2"
                      borderRadius="sm"
                      bg="gray.50"
                      fontSize="xs"
                      _hover={{ bg: 'gray.100' }}
                      _expanded={{ bg: 'blue.50', color: 'blue.700' }}
                    >
                      <Box flex="1" textAlign="left" display="flex" gap="2" alignItems="center">
                        <Text fontWeight="semibold">{event.name}</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel paddingY="2" pl={4}>
                    <VStack align="start" spacing={2} pl={4}>
                      {event.fields?.map((field, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap="2">
                          <Badge colorScheme="blue">{field.type}</Badge>
                          <Text fontSize="xs">{field.name}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">No events added</Text>
            )}
          </Accordion>
        </Box>

        {/* Error Codes Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontFamily="IBM Plex Mono">
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Text fontSize="sm" fontWeight="semibold" mb={5}>
              Error Codes
            </Text>
          </Flex>
          <Accordion allowToggle>
            {errorCodes.length ? (
              errorCodes.map((error, index) => (
                <AccordionItem key={index} border="none">
                  <h2>
                    <AccordionButton
                      padding="2"
                      borderRadius="sm"
                      bg="gray.50"
                      fontSize="xs"
                      _hover={{ bg: 'gray.100' }}
                      _expanded={{ bg: 'red.50', color: 'red.700' }}
                    >
                      <Box flex="1" textAlign="left" display="flex" gap="2" alignItems="center">
                        <Badge colorScheme="red">{error.code}</Badge>
                        <Text fontWeight="semibold">{error.name}</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel paddingY="2" pl={4}>
                    <Text fontSize="xs" color="gray.600">{error.msg}</Text>
                  </AccordionPanel>
                </AccordionItem>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">No error codes added</Text>
            )}
          </Accordion>
        </Box>
      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return [
      'name',
      'description',
      'programId',
      'account',
      'instruction',
      'isPublic',
      'events',
      'errorCodes'
    ];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      programId: this.programId || '',
      account: this.account || [],
      instruction: this.instruction || [],
      isPublic: this.isPublic || false,
      version: this.version || '',
      events: this.events || [],
      errorCodes: this.errorCodes || [],
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    if (values.programId) this.programId = values.programId;
    if (values.version) this.version = values.version;
    this.events = values.events || [];
    this.errorCodes = values.errorCodes || [];
  }

  getIcon(): IconType {
    return BsBox;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div
        style={{
          background: 'white',
          color: 'black',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Handle type='target' position={Position.Top} />
        <div>{data.label}</div>
        <Handle type='source' position={Position.Bottom} />
      </div>
    );
  });

  getVersion(): string | undefined { return this.version; }
  setVersion(version: string): void { this.version = version; }

  getEvents(): { name: string; fields: { name: string; type: string }[] }[] | undefined { 
    return this.events; 
  }

  setEvents(events: { name: string; fields: { name: string; type: string }[] }[]): void { 
    this.events = events; 
  }

  getErrorCodes(): { code: number; name: string; msg: string }[] | undefined { 
    return this.errorCodes; 
  }

  setErrorCodes(errorCodes: { code: number; name: string; msg: string }[]): void { 
    this.errorCodes = errorCodes; 
  }
}
