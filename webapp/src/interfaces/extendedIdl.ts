export interface ExtendedIdl {
    version: string; 
    name: string;
    address: string;
    metadata: Record<string, any>;
    instructions: ExtendedIdlInstruction[];
    accounts: ExtendedIdlAccount[];
    errors?: ExtendedIdlError[];
    events?: ExtendedIdlEvent[];
  }
  
export interface ExtendedIdlInstruction {
    name: string;
    discriminator: string;
    accounts: ExtendedIdlAccountItem[];
    args: ExtendedIdlArg[];
  }
  
export interface ExtendedIdlAccountItem {
    name: string;
    writable: boolean;
    signer: boolean;
    constraints?: string[];
  }
  
export interface ExtendedIdlArg {
    name: string;
    type: string;
  }
  
export interface ExtendedIdlAccount {
    name: string;
    type: {
      kind: "struct";
      fields: ExtendedIdlField[];
    };
  }
  
export interface ExtendedIdlField {
    name: string;
    type: string;
  }
  
export interface ExtendedIdlError {
    code: number;
    name: string;
    msg: string;
  }
  
export interface ExtendedIdlEvent {
    name: string;
    fields: ExtendedIdlEventField[];
  }
  
export interface ExtendedIdlEventField {
    name: string;
    type: string;
    index: boolean;
  }
  