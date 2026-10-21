import { findCommand, visibleNames } from "./registry";
import type { Env, Session } from "./types";

export interface Completion {
  /** Where in the input the word being completed starts. */
  start: number;
  /** Every candidate for that word. */
  candidates: string[];
  /** What to put in place of the word: the unique match, or the longest shared prefix. Null when nothing is gained. */
  insert: string | null;
}

function commonPrefix(words: string[]): string {
  if (words.length === 0) return "";
  let prefix = words[0];
  for (const word of words.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < word.length && prefix[i] === word[i]) i += 1;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

/** Tab completion for the end of the input line. */
export function complete(input: string, session: Session, env: Env): Completion {
  const endsWithSpace = /\s$/.test(input);
  const words = input.trim() === "" ? [] : input.trim().split(/\s+/);
  const partial = endsWithSpace || words.length === 0 ? "" : words[words.length - 1];
  const start = input.length - partial.length;

  let candidates: string[];
  if (words.length === 0 || (words.length === 1 && !endsWithSpace)) {
    candidates = [...new Set(visibleNames())].filter((n) => n.startsWith(partial.toLowerCase())).sort();
  } else {
    const command = findCommand(words[0]);
    const args = [...words.slice(1).slice(0, endsWithSpace ? undefined : -1), partial];
    candidates = command?.complete?.(args, session, env) ?? [];
  }
  candidates = [...new Set(candidates)];

  let insert: string | null = null;
  if (candidates.length === 1) {
    const only = candidates[0];
    insert = only.endsWith("/") ? only : `${only} `;
  } else if (candidates.length > 1) {
    const shared = commonPrefix(candidates);
    if (shared.length > partial.length) insert = shared;
  }
  return { start, candidates, insert };
}
