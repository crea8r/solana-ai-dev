import { Node } from 'react-flow-renderer';
import { Account } from '../Account';
import { Box, Input, Text, VStack } from '@chakra-ui/react';
import { pascalToSpaced } from '../../utils/itemUtils';

export class TokenAccount extends Account {
  spl_type: 'mint' | 'token';
  mint_address: string;
  owner: string;

  constructor(
    id: string,
    name: { snake: string; pascal: string } = { snake: 'token_account', pascal: 'TokenAccount' },
    description: string = '',
    role: string = 'token_account',
    is_mutable: boolean = true,
    is_signer: boolean = false,
    fields: { name: string; type: string }[] = [],
    spl_type: 'mint' | 'token' = 'token',
    mint_address: string = '',
    owner: string = ''
  ) {
    super(id, name, description, role, is_mutable, is_signer, fields);
    this.name = name;
    this.spl_type = spl_type;
    this.mint_address = mint_address;
    this.owner = owner;
  }

  getType(): 'token_account' {
    return 'token_account';
  }

  renderAccountProperties(
    programs: { id: string; name: string }[],
    onChange: (field: string, value: any) => void,
    values: any
  ): JSX.Element {
    return (
      <VStack spacing={6} align="stretch">
        {/* Token Account Details */}
        <Box padding="4" border="1px solid" borderColor="gray.200" borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold">Token Account Properties</Text>
          <Input
            placeholder="Mint Address"
            value={values.mint_address || ''}
            onChange={(e) => onChange('mint_address', e.target.value)}
          />
          <Input
            placeholder="Owner Address"
            value={values.owner || ''}
            onChange={(e) => onChange('owner', e.target.value)}
          />
          <Text fontSize="xs">Account Type: {this.spl_type === 'mint' ? 'Mint Account' : 'Token Account'}</Text>
        </Box>

        {super.renderAccountProperties(programs, onChange, values)}
      </VStack>
    );
  }

  toNode(position: { x: number; y: number }): Node {
    console.log('TokenAccount toNode label:', pascalToSpaced(this.name.pascal));
    return {
      id: this.identifier,
      type: this.getType(),
      position,
      data: { label: pascalToSpaced(this.name.pascal), item: this, isTokenAccount: true },
    };
  }
}
