export const extractWarnings = (log: string): { message: string; file: string; line: string; help?: string }[] => {
    const warningRegex = /warning: (.+?)\n\s+--> (.+?):(\d+:\d+)\n\s+\|\n.+?\n\s+\|\s+(.+?)(?=\n\s+warning:|\Z)/gs;
    const matches = [];
    let match;
  
    while ((match = warningRegex.exec(log)) !== null) {
      matches.push({
        message: match[1].trim(), // Extracted warning message
        file: match[2].trim(), // File path
        line: match[3].trim(), // Line and column numbers
        help: match[4].trim(), // Optional help message
      });
    }
  
    return matches;
  };
