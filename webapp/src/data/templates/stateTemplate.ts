export const getStateTemplate = (
  fileDetails: {
    account_name: string;
    struct_name: string;
    fields: { name: string; type: string; attributes?: string[] }[];
    description?: string;
    role: string;
  }[]
): string => {
  // Filter program-defined accounts based on the 'role'
  const programAccountDetails = fileDetails.filter((detail) => detail.role === 'program_account');

  // Generate the Rust structs for each program-defined account
  const accounts = programAccountDetails
    .map(({ account_name, struct_name, fields, description }) => {
      const fieldsStr = fields
        .map(({ name, type, attributes }) => {
          const attributeStr = attributes?.length
            ? attributes.map((attr) => `    #[${attr}]`).join('\n') + '\n'
            : '';
          return `${attributeStr}    pub ${name}: ${type},`;
        })
        .join('\n');

      const descriptionStr = description
        ? `#[doc = "${description}"]\n`
        : '';

      return `
${descriptionStr}#[account]
pub struct ${struct_name} {
${fieldsStr}
}
`;
    })
    .join('\n');

  return `
use anchor_lang::prelude::*;

${accounts}
`;
};