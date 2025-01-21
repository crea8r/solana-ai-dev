import { Node } from 'react-flow-renderer';
import { Account } from '../Account';
import { Box, Input, Text, VStack, Flex } from '@chakra-ui/react';
import { pascalToSpaced } from '../../utils/itemUtils';

export class MintAccount extends Account<'mint_account'> {
  decimals: number;
  mintAuthority: string;

  constructor(
    id: string,
    name: { snake: string; pascal: string } = { snake: 'mint_account', pascal: 'MintAccount' },
    description: string = '',
    role: string = 'mint_account',
    is_mutable: boolean = true,
    is_signer: boolean = false,
    fields: { name: string; type: string }[] = [],
    decimals: number = 0,
    mintAuthority: string = ''
  ) {
    super(id, name, description, role, is_mutable, is_signer, fields);
    this.name = name;
    this.decimals = decimals;
    this.mintAuthority = mintAuthority;
  }

  getType(): 'mint_account' {
    return 'mint_account';
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
        {/* Mint Account Details */}
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
              Mint Account Properties
            </Text>
          </Flex>
          <Flex direction="column" gap={4}>
            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Decimals</Text>
              <Input
                placeholder="Decimals"
                type="number"
                value={values.decimals || ''}
                onChange={(e) => onChange('decimals', parseInt(e.target.value, 10))}
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
                fontSize="xs"
                size="xs"
              />
            </Flex>

            <Flex direction="column" gap={2}>
              <Text fontSize="xs" fontWeight="semibold">Mint Authority</Text>
              <Input
                placeholder="Mint Authority"
                value={values.mintAuthority || ''}
                onChange={(e) => onChange('mintAuthority', e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderRadius="md"
                fontSize="xs"
                size="xs"
              />
            </Flex>
          </Flex>
        </Box>

        {super.renderAccountProperties(programs, onChange, values)}
      </VStack>
    );
  }

  toNode(position: { x: number; y: number }): Node {
    console.log('MintAccount toNode label:', pascalToSpaced(this.name.pascal));
    return {
      id: this.identifier,
      type: this.getType(),
      position,
      data: { label: pascalToSpaced(this.name.pascal), item: this, isMintAccount: true },
    };
  }
}