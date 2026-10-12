/**
 * Splits a command line into words the way a shell does for simple cases: spaces separate
 * words, single and double quotes group them, and a backslash escapes the next character.
 * A quote that is never closed takes the rest of the line (forgiving, not an error).
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inWord = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === "\\" && quote === '"' && i + 1 < input.length) current += input[++i];
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      inWord = true;
    } else if (ch === "\\" && i + 1 < input.length) {
      current += input[++i];
      inWord = true;
    } else if (/\s/.test(ch)) {
      if (inWord) tokens.push(current);
      current = "";
      inWord = false;
    } else {
      current += ch;
      inWord = true;
    }
  }
  if (inWord) tokens.push(current);
  return tokens;
}

export interface ParsedCommand {
  name: string;
  args: string[];
}

/** Null for an empty line. */
export function parseCommand(input: string): ParsedCommand | null {
  const [name, ...args] = tokenize(input);
  return name === undefined ? null : { name, args };
}

/** Splits flags from operands: "-l", "-la" and "--oneline" are flags, "-" and everything else are operands. */
export function splitFlags(args: string[]): { flags: Set<string>; operands: string[] } {
  const flags = new Set<string>();
  const operands: string[] = [];
  let literal = false;
  for (const arg of args) {
    if (literal || arg === "-" || !arg.startsWith("-")) operands.push(arg);
    else if (arg === "--") literal = true;
    else if (arg.startsWith("--")) flags.add(arg);
    else for (const ch of arg.slice(1)) flags.add(`-${ch}`);
  }
  return { flags, operands };
}
