export function extractCodeBlock(text: string): string {
  const lines = text.split('\n');
  let isInCodeBlock = false;
  const codeBlockLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (isInCodeBlock) {
        break; // End of code block
      } else {
        isInCodeBlock = true; // Start of code block
        continue; // Skip the opening ```
      }
    }

    if (isInCodeBlock) {
      codeBlockLines.push(line);
    }
  }

  return codeBlockLines.join('\n');
}

export function shortenText(text: string, maxLength?: number): string {
  maxLength = maxLength || 30;
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + '...';
}
