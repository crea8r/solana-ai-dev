import { APP_CONFIG } from '../config/appConfig';
import fs from 'fs';
import path from 'path';


/* store in JSON file
export const getValidBetaCodes = (): Set<string> => {
  const filePath = path.join(__dirname, '../config/betaCodes.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(data);
  return new Set(json.codes.map((code: string) => code.toUpperCase()));
};
*/


// store in .env / appConfig.ts
export const getValidBetaCodes = (): Set<string> => {
  if (!APP_CONFIG.BETA_CODE) throw new Error('BETA_CODE is not set in appConfig.ts');
  const codes = APP_CONFIG.BETA_CODE;
  if (codes) console.log("codes", codes);
  return new Set(codes.split(',').map(code => code.trim().toUpperCase()));
};
