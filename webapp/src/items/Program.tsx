import { memo } from 'react';
import { BsBox } from "react-icons/bs";
import { ProgramToolboxItem, ToolboxItem } from '../interfaces/ToolboxItem';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { Input, Textarea, VStack, Text, Flex, Select, Divider, Tag, TagLabel, Wrap, WrapItem, CloseButton, MenuItemOption, MenuOptionGroup, MenuList, Menu, MenuButton, Button, Checkbox } from '@chakra-ui/react';
import { sectorEnum } from '../interfaces/project';

export class Program implements ProgramToolboxItem {
  identifier: string;
  type: 'program' = 'program';
  name: string;
  description: string;
  programId: string;
  account: string[];
  instruction: string[];
  security: string[];
  sector: sectorEnum[];

  constructor(
    id: string,
    name: string,
    description: string,
    programId: string,
    account: string[] = [],
    instruction: string[] = [],
    security: string[] = [],
    sector: sectorEnum[] = [],
  ) {
    this.identifier = id;
    this.type = 'program';
    this.name = name;
    this.description = description;
    this.programId = programId;
    this.account = account;
    this.instruction = instruction;
    this.security = security;
    this.sector = sector;
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

  setSecurity(security: string[]): void {
    this.security = security;
  }

  setSector(sector: sectorEnum[]): void {
    this.sector = sector;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'program',
      position,
      data: { label: this.name, item: this },
    };
  }

  // placeholder before implementation of node specific renderProperties method
  renderProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Name *</Text>
          <Input
            placeholder="Name"
            value={values.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            fontSize="xs"
          />
        </Flex>
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Description *</Text>
          <Textarea
            placeholder="Description"
            value={values.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            fontSize="xs"
          />
        </Flex>
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Program ID</Text>
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
    handleRemoveInstruction: (instructionId: string) => void
  ): JSX.Element {
    return (
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Name *</Text>
          <Input
            placeholder="Name"
            value={values.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            fontSize="xs"
            bg="white"
          />
        </Flex>
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Description *</Text>
          <Textarea
            placeholder="Description"
            value={values.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            fontSize="xs"
            bg="white"
          />
        </Flex>

        {/* Sector Tags Section */}
        <Wrap>
          {Array.isArray(values.sector) && values.sector.length > 0 ? (
            values.sector.map((sector: sectorEnum) => (
              <WrapItem key={sector}>
                <Tag size="sm" variant="subtle" colorScheme="blue">
                  <TagLabel>{sector}</TagLabel>
                  <CloseButton
                    size="sm"
                    onClick={() => {
                      const updatedSectors = values.sector.filter((s: string) => s !== sector);
                      onChange('sector', updatedSectors);
                    }}
                    ml={2}
                  />
                </Tag>
              </WrapItem>
            ))
          ) : (
            <Text fontSize="xs" color="gray.500">No sectors selected</Text>
          )}
        </Wrap>

        {/* Sector Dropdown Menu */}
        <Select
          placeholder="Select a sector"
          size="sm"
          fontSize="xs"
          value=""
          bg="white"
          onChange={(e) => {
            const selectedSector = e.target.value;
            if (!Array.isArray(values.sector)) {
              values.sector = []; // Initialize as an empty array if undefined
            }
            if (!values.sector.includes(selectedSector)) {
              onChange('sector', [...values.sector, selectedSector]);
            }
          }}
        >
          {Object.values(sectorEnum).map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </Select>

        {/* Security Tags Section */}
        <Wrap>
          {Array.isArray(values.security) && values.security.length > 0 ? (
            values.security.map((sec: string) => (
              <WrapItem key={sec}>
                <Tag size="sm" variant="subtle" colorScheme="purple">
                  <TagLabel>{sec}</TagLabel>
                  <CloseButton
                    size="sm"
                    onClick={() => {
                      const updatedSecurity = values.security.filter((s: string) => s !== sec);
                      onChange('security', updatedSecurity);
                    }}
                    ml={2}
                  />
                </Tag>
              </WrapItem>
            ))
          ) : (
            <Text fontSize="xs" color="gray.500">No security level selected</Text>
          )}
        </Wrap>

        {/* Security Dropdown Menu */}
        <Select
          placeholder="Select a security"
          size="sm"
          fontSize="xs"
          value=""
          bg="white"
          onChange={(e) => {
            const selectedSecurity = e.target.value;
            if (!Array.isArray(values.security)) {
              values.security = []; // Initialize as an empty array if undefined
            }
            if (!values.security.includes(selectedSecurity)) {
              onChange('security', [...values.security, selectedSecurity]);
            }
          }}
        >
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </Select>


        {/* Program ID Section */}
        <Flex direction="column" gap={2}>
          <Text fontSize="xs" fontWeight="medium">Program ID</Text>
          <Input
            placeholder="Program ID"
            value={values.programId || ''}
            onChange={(e) => onChange('programId', e.target.value)}
            fontSize="xs"
            bg="white"
          />
        </Flex>

        {/* Accounts Section */}
        <Divider my={2} />
        <Text fontSize="xs" fontWeight="medium">Accounts:</Text>
        <Wrap>
          {connectedAccounts.length > 0 ? (
            connectedAccounts.map((account) => (
              <WrapItem key={account.id}>
                <Tag size="sm" fontSize="xs" variant="subtle" colorScheme="blue">
                  <TagLabel>{account.name || 'Unnamed Account'}</TagLabel>
                  <CloseButton
                    size="2xs"
                    onClick={() => handleRemoveAccount(account.id)}
                    ml={2}
                  />
                </Tag>
              </WrapItem>
            ))
          ) : (
            <Text fontSize="xs" color="gray.500">No accounts connected</Text>
          )}
        </Wrap>
        <Select
          placeholder="Select an account to connect"
          value=""
          onChange={(e) => handleAddAccount(e.target.value)}
          size="xs"
          fontSize="xs"
          bg="white"
        >
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))
          ) : (
            <option disabled>No accounts available</option>
          )}
        </Select>

        {/* Instructions Section */}
        <Divider my={4} />
        <Text fontSize="xs" fontWeight="medium">Instructions:</Text>
        <Wrap>
          {connectedInstructions.length > 0 ? (
            connectedInstructions.map((instruction) => (
              <WrapItem key={instruction.id}>
                <Tag size="sm" fontSize="xs" variant="subtle" colorScheme="green">
                  <TagLabel>{instruction.name || 'Unnamed Instruction'}</TagLabel>
                  <CloseButton
                    size="2xs"
                    onClick={() => handleRemoveInstruction(instruction.id)}
                    ml={2}
                  />
                </Tag>
              </WrapItem>
            ))
          ) : (
            <Text fontSize="xs" color="gray.500">
              No instructions connected
            </Text>
          )}
        </Wrap>
        <Select
          placeholder="Select an instruction to connect"
          value=""
          onChange={(e) => handleAddInstruction(e.target.value)}
          size="xs"
          fontSize="xs"
          bg="white"
        >
          {instructions.length > 0 ? (
            instructions.map((instruction) => (
              <option key={instruction.id} value={instruction.id}>
                {instruction.name}
              </option>
            ))
          ) : (
            <option disabled>No instructions available</option>
          )}
        </Select>
      </Flex>
    );
  }

  getPropertyFields(): string[] {
    return [
      'name',
      'description',
      'programId',
      'account',
      'instruction',
      'sector',
      'security',
    ];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      programId: this.programId || '',
      account: this.account || [],
      instruction: this.instruction || [],
      sector: this.sector || [],
      security: this.security || 'Public',
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    if (values.programId) this.programId = values.programId;
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
}
