import fs from 'fs';
import pdf from 'pdf-parse';

export async function parsePdf(filePath: string) {
  const file = await fs.promises.readFile(filePath);
  const data = await pdf(file);
  return data.text;
}
