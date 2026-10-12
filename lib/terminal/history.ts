/** Command history with bash-like ↑/↓ navigation. Pure, so it can be tested without a browser. */

export interface HistoryCursor {
  /** Position in the history; `history.length` means "the line being typed". */
  index: number;
  /** What was being typed before the user pressed ↑, restored when they come back down. */
  draft: string;
}

export const freshCursor = (history: string[]): HistoryCursor => ({ index: history.length, draft: "" });

/** Adds a command, skipping blanks and an immediate repeat of the previous command. */
export function pushHistory(history: string[], command: string): string[] {
  const trimmed = command.trim();
  if (trimmed === "" || history[history.length - 1] === trimmed) return history;
  return [...history, trimmed];
}

export function navigate(
  history: string[],
  cursor: HistoryCursor,
  direction: "up" | "down",
  current: string,
): { value: string; cursor: HistoryCursor } {
  if (direction === "up") {
    if (history.length === 0 || cursor.index === 0) return { value: current, cursor };
    const draft = cursor.index === history.length ? current : cursor.draft;
    const index = cursor.index - 1;
    return { value: history[index], cursor: { index, draft } };
  }
  if (cursor.index >= history.length) return { value: current, cursor };
  const index = cursor.index + 1;
  return { value: index === history.length ? cursor.draft : history[index], cursor: { index, draft: cursor.draft } };
}
