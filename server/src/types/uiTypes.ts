export interface IdlAccount {
    name: string;
    isSigner?: boolean;
    isWritable?: boolean;
    [key: string]: any;
  }
  
  export interface IdlArgument {
    name: string;
    type: string | { defined: string };
  }
  
  export interface IdlInstruction {
    name: string;
    args: IdlArgument[];
    accounts: IdlAccount[];
    [key: string]: any;
  }
  
  export interface ParsedIdl {
    version: string;
    name: string;
    instructions: IdlInstruction[];
    accounts?: IdlAccount[];
    types?: any[];
    [key: string]: any;
  }
  
  export interface InstructionDetails {
    params: IdlArgument[];
    accounts: IdlAccount[];
    paramTypes: Record<string, string>;
  }
  