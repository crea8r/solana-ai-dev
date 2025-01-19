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
import { pascalToSpaced } from '../utils/itemUtils';

export class Program implements ProgramToolboxItem {
  identifier: string;
  type: 'program' = 'program';
  name: { snake: string; pascal: string };
  description: string;
  programId: string;
  account: string[];
  instruction: string[];
  isPublic: boolean;
  version: string;
  events?: { name: string; fields: { name: string; type: string }[] }[];
  errorCodes?: { code: number; name: string; msg: string }[];

  constructor(
    id: string,
    name: { snake: string; pascal: string },
    description: string,
    programId: string,
    isPublic: boolean = true,
    version: string = '',
    account: string[] = [],
    instruction: string[] = [],

  ) {
    this.identifier = id;
    this.type = 'program';
    this.name = name;
    this.description = description;
    this.programId = programId;
    this.isPublic = isPublic;
    this.version = version;
    this.account = account;
    this.instruction = instruction;
  }

  getType(): 'program' { return this.type; }

  getNameSnake(): string { return this.name.snake; }
  setNameSnake(name: string): void {  this.name.snake = name; }
  getNamePascal(): string { return this.name.pascal; }
  setNamePascal(name: string): void { this.name.pascal = name; }

  getDescription(): string { return this.description; }
  setDescription(description: string): void { this.description = description; }

  getProgramId(): string { return this.programId; }
  setProgramId(programId: string): void { this.programId = programId; }

  getIsPublic(): boolean { return this.isPublic; }
  setIsPublic(isPublic: boolean): void { this.isPublic = isPublic; }

  getVersion(): string { return this.version || ''; }
  setVersion(version: string): void { this.version = version; }

  setAccounts(accounts: { id: string; name: string }[]): void {this.account = accounts.map((account) => account.id);}
  setInstructions(instructions: { id: string; name: string }[]): void {this.instruction = instructions.map((instruction) => instruction.id);}


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
            value={values.name?.pascal || ""}
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
                value={values.name?.pascal || ''}
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

      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return [
      'name',
      'description',
      'programId',
      'isPublic',
      'version',
      'account',
      'instruction',
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
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    if (values.programId) this.programId = values.programId;
    if (values.version) this.version = values.version;
    this.account = values.account || [];
    this.instruction = values.instruction || [];
    this.isPublic = values.isPublic || false;
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
