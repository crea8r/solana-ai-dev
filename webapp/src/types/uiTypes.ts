import { Idl } from "@coral-xyz/anchor";

export interface InstructionContextAccount {
    name: string;
    isSigner: boolean;
    isWritable: boolean;
}
  
export interface Instruction {
    name: string;
    description: string;
    params: string[];
    context: {
      accounts: InstructionContextAccount[];
    };
}

export interface AccountField {
  name: string;
  type: string;
}
  
export interface Account {
    name: string;
    description: string;
    fields: AccountField[];
}

export interface InstructionCard {
  function_name: string;
  params_fields: InstructionCardParamField[];
}

export interface InstructionCardParamField {
  name: string;
  type: string;
  expected_source: string;
  valueSource: string;
}