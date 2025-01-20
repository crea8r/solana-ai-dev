import React, { memo } from 'react';
import { Node } from 'react-flow-renderer';
import { ToolboxItem } from '../interfaces/ToolboxItem';
import { VStack, Input, Textarea, Text, Checkbox, Flex, Box, Switch, Button, IconButton } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { VscJson } from 'react-icons/vsc';
import { pascalToSpaced } from '../utils/itemUtils';
import { IoIosCloseCircleOutline } from 'react-icons/io';

export class Account implements ToolboxItem {
  identifier: string;
  type: 'account' = 'account';
  name: { snake: string; pascal: string };
  description: string;
  role: string;
  is_mutable: boolean;
  is_signer: boolean;
  fields: { name: string; type: string }[];

  constructor(
    id: string,
    name: { snake: string; pascal: string } = { snake: 'account', pascal: 'Account' },
    description: string = '',
    role: string = '',
    is_mutable: boolean = true,
    is_signer: boolean = false,
    fields: { name: string; type: string }[] = [],
  ) {
    this.identifier = id;
    this.name = name;
    this.description = description;
    this.role = role;
    this.is_mutable = is_mutable;
    this.is_signer = is_signer;
    this.fields = fields;
  }

  getNameSnake(): string { return this.name.snake; }
  setNameSnake(name: string): void { this.name.snake = name; }

  getNamePascal(): string { return this.name.pascal; }
  setNamePascal(name: string): void { this.name.pascal = name; }

  getDescription(): string {  return this.description; }
  setDescription(description: string): void { this.description = description; }

  getRole(): string { return this.role; }
  setRole(role: string): void { this.role = role; }

  getIsMutable(): boolean { return this.is_mutable; }
  setIsMutable(is_mutable: boolean): void { this.is_mutable = is_mutable; }

  getIsSigner(): boolean { return this.is_signer; }
  setIsSigner(is_signer: boolean): void { this.is_signer = is_signer; }

  getFields(): { name: string; type: string }[] { return this.fields; }
  setFields(fields: { name: string; type: string }[]): void { this.fields = fields; }

  getType(): 'account' { return this.type; }

  toNode(position: { x: number; y: number }): Node {
    return {
      id: this.identifier,
      type: 'account',
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
      <VStack spacing={4} align="stretch">
        <Text fontSize="xs" fontWeight="medium">Account Properties Placeholder</Text>
      </VStack>
    );
  }

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
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
        {/* Account Details Section */}
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
              Account Details
            </Text>
          </Flex>
          <Flex direction="column" gap={4}>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Name *</Text>
              <Input
                placeholder="Account Name"
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

            {/* Mutable Checkbox */}
            <Flex alignItems="center" gap={4} mt={4}>
              <Text fontSize="xs" fontWeight="semibold">Mutable *</Text>
              <Switch
                size="sm"
                colorScheme="blackAlpha"
                isChecked={values.is_mutable}
                onChange={(e) => onChange('is_mutable', e.target.checked)}
              />
              <Text fontSize="xs">Can Modify</Text>
            </Flex>

            {/* Signer Checkbox */}
            <Flex alignItems="center" gap={4}>
              <Text fontSize="xs" fontWeight="semibold">Signer *</Text>
              <Switch
                size="sm"
                colorScheme="blackAlpha"
                isChecked={values.is_signer}
                onChange={(e) => onChange('is_signer', e.target.checked)}
              />
              <Text fontSize="xs">Requires Signature</Text>
            </Flex>
          </Flex>
        </Box>

        {/* Fields Section */}
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
              Fields
            </Text>
          </Flex>
          <Flex gap={4} mb={2}>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Name</Text>
            <Text fontWeight="bold" fontSize="xs" flex="1" textAlign="center">Type</Text>
            <Box width="30px"></Box>
          </Flex>
          {values.fields?.map((field: any, index: number) => (
            <Flex key={index} gap={2} mb={2} alignItems="center">
              <Input
                placeholder="Field Name"
                value={field.name || ''}
                onChange={(e) =>
                  onChange('fields', [
                    ...values.fields.slice(0, index),
                    { ...field, name: e.target.value },
                    ...values.fields.slice(index + 1),
                  ])
                }
                fontSize="xs"
                size="xs"
                bg="white"
              />
              <Input
                placeholder="Type (e.g., u64, String)"
                value={field.type || ''}
                onChange={(e) =>
                  onChange('fields', [
                    ...values.fields.slice(0, index),
                    { ...field, type: e.target.value },
                    ...values.fields.slice(index + 1),
                  ])
                }
                fontSize="xs"
                size="xs"
                bg="white"
              />
              <IconButton
                size="xs"
                icon={<IoIosCloseCircleOutline />}
                aria-label="Remove field"
                bg="transparent"
                color="red.400"
                _hover={{ color: "red.600" }}
                onClick={() =>
                  onChange(
                    'fields',
                    values.fields.filter((_: any, i: number) => i !== index)
                  )
                }
              />
            </Flex>
          ))}
          <Button
            size="xs"
            mt={2}
            onClick={() =>
              onChange('fields', [...(values.fields || []), { name: '', type: '' }])
            }
          >
            Add Field
          </Button>
        </Box>
      </VStack>
    );
  }

  getPropertyFields(): string[] {
    return ['name', 'description', 'is_mutable', 'is_signer'];
  }

  getPropertyValues(): any {
    return {
      name: this.name || '',
      description: this.description || '',
      is_mutable: this.is_mutable,
      is_signer: this.is_signer,
      fields: this.fields || []
    };
  }

  setPropertyValues(values: any): void {
    this.name = values.name;
    this.description = values.description;
    this.is_mutable = values.is_mutable;
    this.is_signer = values.is_signer;
    this.fields = values.fields || [];
  }

  getIcon(): IconType {
    return VscJson;
  }

  static NodeType = memo(({ data }: NodeProps) => {
    return (
      <div style={{ background: 'lavender', padding: 10, borderRadius: 5 }}>
        <Handle type="target" position={Position.Top} />
        <div>{data.label}</div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  });

}
