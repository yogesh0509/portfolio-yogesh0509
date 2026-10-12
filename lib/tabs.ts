/**
 * Editor tabs with VS Code's "preview tab" behaviour: opening a file shows it in an italic
 * preview tab, and the next file you open replaces that preview. Double-clicking a tab (or
 * its file in the explorer) pins it so it stays.
 */

export interface Tab {
  url: string;
  pinned: boolean;
}

export type TabAction =
  | { type: "visit"; url: string }
  | { type: "pin"; url: string }
  | { type: "close"; url: string }
  | { type: "closeAll" }
  | { type: "restore"; tabs: Tab[]; known: ReadonlySet<string>; current: string };

export function tabsReducer(state: Tab[], action: TabAction): Tab[] {
  switch (action.type) {
    case "visit": {
      if (state.some((t) => t.url === action.url)) return state;
      const preview = state.findIndex((t) => !t.pinned);
      if (preview === -1) return [...state, { url: action.url, pinned: false }];
      return state.map((t, i) => (i === preview ? { url: action.url, pinned: false } : t));
    }
    case "pin":
      // A fast double-click pins before the first click's navigation has finished, so the tab
      // may not exist yet. Open it pinned instead of dropping the request.
      return state.some((t) => t.url === action.url)
        ? state.map((t) => (t.url === action.url ? { ...t, pinned: true } : t))
        : [...state, { url: action.url, pinned: true }];
    case "close":
      return state.filter((t) => t.url !== action.url);
    case "closeAll":
      return [];
    case "restore": {
      const seen = new Set<string>();
      const kept = action.tabs.filter((t) => {
        if (!action.known.has(t.url) || seen.has(t.url)) return false;
        seen.add(t.url);
        return true;
      });
      // Only one preview tab can exist; keep the last one stored.
      const lastPreview = kept.map((t) => t.pinned).lastIndexOf(false);
      const cleaned = kept.filter((t, i) => t.pinned || i === lastPreview);
      return tabsReducer(cleaned, { type: "visit", url: action.current });
    }
  }
}

/** Where to go after closing a tab: the neighbour that takes its place, or null when none is left. */
export function nextAfterClose(tabs: Tab[], closedUrl: string): string | null {
  const index = tabs.findIndex((t) => t.url === closedUrl);
  if (index === -1) return null;
  const rest = tabs.filter((t) => t.url !== closedUrl);
  if (rest.length === 0) return null;
  return rest[Math.min(index, rest.length - 1)].url;
}

export const TABS_STORAGE_KEY = "portfolio.tabs.v1";

export function serializeTabs(tabs: Tab[]): string {
  return JSON.stringify(tabs);
}

/** Never throws: anything unexpected in storage means "no saved tabs". */
export function parseTabs(raw: string | null): Tab[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.flatMap((item): Tab[] =>
      item && typeof item === "object" && typeof (item as Tab).url === "string" && typeof (item as Tab).pinned === "boolean"
        ? [{ url: (item as Tab).url, pinned: (item as Tab).pinned }]
        : [],
    );
  } catch {
    return [];
  }
}
