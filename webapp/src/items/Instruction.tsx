// src/items/Instruction.ts
import { memo } from 'react';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select, Text, Button, Divider, Flex, Wrap, WrapItem, Tag, TagLabel, CloseButton, Box, IconButton } from '@chakra-ui/react';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { IoTrashOutline } from "react-icons/io5";
import { IoIosCode } from 'react-icons/io';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { pascalToSpaced } from '../utils/itemUtils';

export class Instruction implements ToolboxItem {
  identifier: string;
  type: 'instruction' = 'instruction';
  name: { snake: string; pascal: string; };
  description: string;
  accounts: { name: string; type: string; constraints?: string[] }[];
  params: { name: string; type: string }[];
  events: any[];
  error_codes: any[];

  constructor(
    id: string,
    name: { snake: string; pascal: string } = { snake: 'instruction', pascal: 'Instruction' },
    description: string = '',
    accounts: { name: string; type: string; constraints?: string[] }[] = [],
    params: { name: string; type: string }[] = [],
    events: any[] = [],
    errorCodes: any[] = []
  ) {
    this.identifier = id;
    this.name = { snake: name.snake, pascal: name.pascal };
    this.description = description;
    this.accounts = accounts;
    this.params = params;
    this.events = events;
    this.error_codes = errorCodes;
  }

  getNameSnake(): string { return this.name.snake; }
  setNameSnake(name: string): void { this.name.snake = name; }

  getNamePascal(): string { return this.name.pascal; }
  setNamePascal(name: string): void { this.name.pascal = name; }

  getDescription(): string {  return this.description; }
  setDescription(description: string): void { this.description = description;  }

  getType(): 'instruction' { return this.type; }

  getAccounts(): { name: string; type: string; constraints?: string[] }[] {
    return this.accounts;
  }

  setAccounts(accounts: { name: string; type: string; constraints?: string[] }[]): void {
    this.accounts = accounts;
  }

  getParams(): { name: string; type: string }[] {
    return this.params;
  }

  setParams(params: { name: string; type: string }[]): void {
    this.params = params;
  }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'instruction',
      position,
      data: { label: pascalToSpaced(this.name.pascal), item: this },
    };
  }

  renderProperties(): JSX.Element {
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="xs" fontWeight="medium">Instruction Properties Placeholder</Text>
      </VStack>
    );
  }

  renderInstructionProperties(
    nodes: any[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <VStack spacing={6} align="stretch" padding="4" bg="white" borderRadius="md" boxShadow="sm" width="100%">
        {/* Instruction Details Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontSize="xs" fontFamily="IBM Plex Mono">
          <Text fontSize="sm" fontWeight="semibold" mb={5} textAlign="center">Instruction Details</Text>
          <Flex direction="column" gap={4}>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Name *</Text>
              <Input
                placeholder="Instruction Name"
                value={values.name?.pascal || ''}
                onChange={(e) => onChange('name', { snake: values.name.snake, pascal: e.target.value })}
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
                fontSize="xs"
                size="xs"
              />
            </Flex>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Description</Text>
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
          </Flex>
        </Box>

        {/* Connected Accounts Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontSize="xs" fontFamily="IBM Plex Mono">
          <Text fontSize="sm" fontWeight="semibold" mb={5} textAlign="center">Connected Accounts</Text>
          <Flex direction="column" gap={4}>
            {values.accounts?.map((account: any, index: number) => (
              <Box key={index} padding="3" border="1px solid" borderColor="gray.300" borderRadius="md" bg="gray.50">
                <Flex direction="row" gap={4} mb={2} alignItems="center">
                  <Text fontWeight="bold" fontSize="xs">Account Name:</Text>
                  <Input
                    value={account.name.snake || ''}
                    placeholder="Account Name"
                    onChange={(e) =>
                      onChange('accounts', [
                        ...values.accounts.slice(0, index),
                        { ...account, name: e.target.value },
                        ...values.accounts.slice(index + 1),
                      ])
                    }
                    fontSize="xs"
                    size="xs"
                    bg="white"
                  />
                </Flex>
                <Flex direction="row" gap={4} mb={2} alignItems="center">
                  <Text fontWeight="bold" fontSize="xs">Account Type:</Text>
                  <Input
                    value={account.type || ''}
                    placeholder="Account Type (e.g., AccountInfo, Program)"
                    onChange={(e) =>
                      onChange('accounts', [
                        ...values.accounts.slice(0, index),
                        { ...account, type: e.target.value },
                        ...values.accounts.slice(index + 1),
                      ])
                    }
                    fontSize="xs"
                    size="xs"
                    bg="white"
                  />
                </Flex>
                <Flex direction="column" gap={2} mb={2}>
                  <Text fontWeight="bold" fontSize="xs">Constraints:</Text>
                  {account.constraints?.map((attr: string, attrIndex: number) => (
                    <Flex key={attrIndex} gap={2} alignItems="center">
                      <Input
                        value={attr || ''}
                        placeholder="Attribute (e.g., signer, mut, payer)"
                        onChange={(e) =>
                          onChange('accounts', [
                            ...values.accounts.slice(0, index),
                            {
                              ...account,
                              constraints: account.constraints.map((a: string, i: number) =>
                                i === attrIndex ? e.target.value : a
                              ),
                            },
                            ...values.accounts.slice(index + 1),
                          ])
                        }
                        fontSize="xs"
                        size="xs"
                        bg="white"
                      />
                      <IconButton
                        icon={<IoIosCloseCircleOutline />}
                        size="xs"
                        aria-label="Remove attribute"
                        bg="transparent"
                        color="red.400"
                        _hover={{ color: 'red.600' }}
                        onClick={() =>
                          onChange('accounts', [
                            ...values.accounts.slice(0, index),
                            {
                              ...account,
                              constraints: account.constraints.filter((_: string, i: number) => i !== attrIndex),
                            },
                            ...values.accounts.slice(index + 1),
                          ])
                        }
                      />
                    </Flex>
                  ))}
                  <Button
                    size="xs"
                    mt={2}
                    onClick={() =>
                      onChange('accounts', [
                        ...values.accounts.slice(0, index),
                        { ...account, constraints: [...(account.constraints || []), ''] },
                        ...values.accounts.slice(index + 1),
                      ])
                    }
                  >
                    Add Constraint
                  </Button>
                </Flex>
                <IconButton
                  mt={2}
                  icon={<IoTrashOutline />}
                  aria-label="Remove account"
                  bg="transparent"
                  color="red.400"
                  _hover={{ color: 'red.600' }}
                  onClick={() =>
                    onChange('accounts', values.accounts.filter((_: any, i: number) => i !== index))
                  }
                />
              </Box>
            ))}
            <Button
              size="xs"
              mt={2}
              onClick={() =>
                onChange('accounts', [...(values.accounts || []), { name: '', type: 'Account', constraints: [] }])
              }
            >
              Add Account
            </Button>
          </Flex>
        </Box>

        {/* Parameters Section */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md" fontSize="xs" fontFamily="IBM Plex Mono">
          <Text fontSize="sm" fontWeight="semibold" mb={5} textAlign="center">Parameters</Text>
          <Flex gap={4} mb={2}>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Name</Text>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Type</Text>
            <Box width="30px"></Box>
          </Flex>
          {values.params?.map((param: any, index: number) => (
            <Flex key={index} gap={2} mb={2} alignItems="center">
              <Input
                placeholder="Parameter Name"
                value={param.name.snake || ''}
                onChange={(e) =>
                  onChange('params', [
                    ...values.params.slice(0, index),
                    { ...param, name: e.target.value },
                    ...values.params.slice(index + 1),
                  ])
                }
                fontSize="xs"
                size="xs"
                bg="white"
              />
              <Input
                placeholder="Type (e.g., u64, String)"
                value={param.type || ''}
                onChange={(e) =>
                  onChange('params', [
                    ...values.params.slice(0, index),
                    { ...param, type: e.target.value },
                    ...values.params.slice(index + 1),
                  ])
                }
                fontSize="xs"
                size="xs"
                bg="white"
              />
              <IconButton
                size="xs"
                icon={<IoIosCloseCircleOutline />}
                aria-label="Remove parameter"
                bg="transparent"
                color="red.400"
                _hover={{ color: 'red.600' }}
                onClick={() =>
                  onChange('params', values.params.filter((_: any, i: number) => i !== index))
                }
              />
            </Flex>
          ))}
          <Button
            size="xs"
            mt={2}
            onClick={() => onChange('params', [...(values.params || []), { name: '', type: '' }])}
          >
            Add Argument
          </Button>
        </Box>
      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return ['name', 'description', 'accounts', 'params'];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      accounts: this.accounts || [],
      params: this.params || [],
      events: this.events || [],
      error_codes: this.error_codes || [],
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.accounts = values.accounts || [];
    this.params = values.params || [];
    this.events = values.events || [];
    this.error_codes = values.errorCodes || [];
  }

  getIcon(): IconType {
    return IoIosCode;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div style={{ border: '2px solid green', padding: 10, borderRadius: 5 }}>
        <Handle type='target' position={Position.Top} />
        <div>{data.label}</div>
        <Handle type='source' position={Position.Bottom} />
      </div>
    );
  });

  getEvents(): any[] {
    return this.events;
  }

  setEvents(events: any[]): void {
    this.events = events;
  }

  getErrorCodes(): any[] {
    return this.error_codes;
  }

  setErrorCodes(errorCodes: any[]): void {
    this.error_codes = errorCodes;
  }
}
