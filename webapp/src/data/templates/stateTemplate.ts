export const getStateTemplate = (
  nodes: {
    type: string;
    data: {
      item: {
        name: { pascal: string };
        description?: string;
        fields: { name: string; type: string; attributes?: string[] }[];
      };
    };
  }[]
): string => {
  const accountNodes = nodes.filter((node) => node.type === 'account');

  const accounts = accountNodes
    .map(({ data: { item } }) => {
      const account_name = item.name.pascal;
      const struct_name = `${item.name.pascal}Struct`;
      const description = item.description;
      const fields = item.fields;

      const fieldsStr = fields
        .map(({ name, type, attributes }) => {
          const attributeStr = attributes?.length
            ? attributes.map(attr => `    #[${attr}]`).join('\n') + '\n'
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