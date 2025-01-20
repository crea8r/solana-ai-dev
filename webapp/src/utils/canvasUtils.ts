import { ExtendedIdl } from "../interfaces/extendedIdl";



export function createInstructionNodes(idl: ExtendedIdl) {
    return idl.instructions.map((instruction: any, index: any) => ({
      id: `instruction-${index}`,
      type: 'instruction',
      label: instruction.name,
      data: instruction,
      width: 180,
      height: 60,
    }));
}
  
export function createAccountNodes(idl: ExtendedIdl, instructions: any[]) {
const uniqueAccounts = new Map<string, any>();

instructions.forEach((instruction: any) => {
    instruction.accounts.forEach((account: any) => {
    const accountId = account.name;
    if (!uniqueAccounts.has(accountId)) {
        uniqueAccounts.set(accountId, {
        id: `account-${accountId}`,
        type: 'account',
        label: accountId,
        data: account,
        width: 160,
        height: 50,
        });
    }
    });
});

return Array.from(uniqueAccounts.values());
}
  
export function createEdges(idl: ExtendedIdl) {
const edges: any[] = [];

idl.instructions.forEach((instruction, instructionIndex) => {
    const sourceId = `instruction-${instructionIndex}`;
    instruction.accounts.forEach((account: any) => {
    const targetId = `account-${account.name}`;
    edges.push({
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'solana',
    });
    });
});

return edges;
}
