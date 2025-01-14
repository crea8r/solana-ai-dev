// src/items/Instruction.ts
import { memo } from 'react';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Select, Text, Button, Divider, Flex, Wrap, WrapItem, Tag, TagLabel, CloseButton, Box, IconButton } from '@chakra-ui/react';
import { Node, Handle, Position, NodeProps } from 'react-flow-renderer';
import { IconType } from 'react-icons';
import { IoTrashOutline } from "react-icons/io5";
import { IoIosCode } from 'react-icons/io';
import { IoIosCloseCircleOutline } from "react-icons/io";

export class Instruction implements ToolboxItem {
  identifier: string;
  type: 'instruction' = 'instruction';
  name: string;
  description: string;
  accounts: string[];
  params: { name: string; type: string }[];

  constructor(
    id: string,
    name: string,
    description: string,
    accounts: string[] = [],
    params: { name: string; type: string }[] = []
  ) {
    this.identifier = id;
    this.name = name;
    this.description = description;
    this.accounts = accounts;
    this.params = params;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getType(): 'instruction' {
    return this.type;
  }

  getAccounts(): string[] {
    return this.accounts;
  }

  setAccounts(accounts: string[]): void {
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
      data: { label: this.name, item: this },
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
    const connectedAccounts = this.accounts.map((accountId: string) => {
      return {
        id: accountId,
        name: accountId,
      };
    });

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
        {/* Instruction Details Section */}
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
              Instruction Details
            </Text>
          </Flex>
          <Flex direction="column" gap={4}>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Name *</Text>
              <Input
                placeholder="Instruction Name"
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
              Connected Accounts
            </Text>
          </Flex>
          <Wrap spacing={2} mb={3}>
            {values.accounts?.length > 0 ? (
              values.accounts.map((accountId: string, index: number) => {
                const account = connectedAccounts.find((acc) => acc.id === accountId);
                return (
                  <WrapItem key={index}>
                    <Tag size="sm" variant="subtle" colorScheme="blue">
                      <TagLabel>{account ? account.name : `Unnamed Account (${accountId})`}</TagLabel>
                      <IconButton
                        icon={<IoIosCloseCircleOutline />}
                        size="xs"
                        fontSize="xs"
                        bg="transparent"
                        aria-label="Remove account"
                        onClick={() =>
                          onChange(
                            'accounts',
                            values.accounts.filter((_: any, i: number) => i !== index)
                          )
                        }
                      />
                    </Tag>
                  </WrapItem>
                );
              })
            ) : (
              <Text fontSize="xs" color="gray.500">No accounts connected</Text>
            )}
          </Wrap>
          <Select
            placeholder="Select an account to connect"
            onChange={(e) => {
              const accountId = e.target.value;
              if (!values.accounts.includes(accountId)) {
                onChange('accounts', [...values.accounts, accountId]);
              }
            }}
            size="xs"
            fontSize="xs"
            padding="2"
            bg="white"
            borderColor="gray.300"
            borderRadius="md"
          >
            {connectedAccounts.map((account: any) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </Box>

        {/* Arguments Section */}
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
              Arguments
            </Text>
          </Flex>
          <Flex gap={4} mb={2}>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Name</Text>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Type</Text>
            <Box width="30px"></Box> {/* Placeholder for spacing */}
          </Flex>
          {values.params?.map((param: any, index: number) => (
            <Flex key={index} gap={2} mb={2} alignItems="center">
              <Input
                placeholder="Argument Name"
                value={param.name || ''}
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
                aria-label="Remove argument"
                bg="transparent"
                color="red.400"
                _hover={{ color: "red.600" }}
                onClick={() =>
                  onChange(
                    'params',
                    values.params.filter((_: any, i: number) => i !== index)
                  )
                }
              />
            </Flex>
          ))}
          <Button
            size="xs"
            mt={2}
            onClick={() =>
              onChange('params', [...(values.params || []), { name: '', type: '' }])
            }
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
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.accounts = values.accounts || [];
    this.params = values.params || [];
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
}
