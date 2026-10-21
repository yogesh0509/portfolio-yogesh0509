'use client'

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { BuildInfo } from "@/lib/build-info.server";
import type { PortEntry } from "@/lib/ports";
import {
  nextAfterClose,
  parseTabs,
  serializeTabs,
  TABS_STORAGE_KEY,
  tabsReducer,
  type Tab,
  type TabAction,
} from "@/lib/tabs";
import { explorerFiles } from "@/lib/vfs/tree";
import type { ExplorerNode } from "@/lib/vfs/types";

export type PanelMode = "auto" | "open" | "closed" | "maximized";
export type PanelTab = "terminal" | "ports";

/** The résumé page is not a VFS file, but it opens in a tab like one. */
export const RESUME_URL = "/resume";

export interface SiteProfile {
  name: string;
  handle: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

export interface SystemInfo {
  os: string;
  distro: string;
  kernel: string;
  kernelVersion: string;
  aptVersion: string;
  arch: string;
  user: string;
  host: string;
  osRelease: readonly string[];
}

export interface WorkbenchData {
  tree: ExplorerNode[];
  ports: PortEntry[];
  build: BuildInfo;
  syncedAt: string | null;
  profile: SiteProfile;
  system: SystemInfo;
}

interface Workbench extends WorkbenchData {
  files: ExplorerNode[];
  activeUrl: string;
  activeFile: ExplorerNode | null;

  tabs: Tab[];
  pinTab: (url: string) => void;
  closeTab: (url: string) => void;
  closeAllTabs: () => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  explorerVisible: boolean;
  toggleExplorer: () => void;
  focusMode: boolean;
  toggleFocusMode: () => void;

  panel: PanelMode;
  panelTab: PanelTab;
  setPanelTab: (tab: PanelTab) => void;
  togglePanel: () => void;
  maximizePanel: () => void;
  openPanel: (tab?: PanelTab) => void;
  closePanel: () => void;
  /** True once the panel has been shown, so the terminal is only loaded when first needed. */
  panelEverShown: boolean;

  quickOpen: { open: boolean; initial: string };
  openQuickOpen: (initial?: string) => void;
  closeQuickOpen: () => void;
}

const WorkbenchContext = createContext<Workbench | null>(null);

export function useWorkbench(): Workbench {
  const value = useContext(WorkbenchContext);
  if (!value) throw new Error("useWorkbench must be used inside <WorkbenchProvider>");
  return value;
}

const DESKTOP = "(min-width: 768px)";

/** Tabs plus whether the saved tabs have been read yet (so we never overwrite them before then). */
interface TabsState {
  tabs: Tab[];
  restored: boolean;
}

function tabsStateReducer(state: TabsState, action: TabAction): TabsState {
  return { tabs: tabsReducer(state.tabs, action), restored: state.restored || action.type === "restore" };
}

/** True at the md breakpoint and above. False on the server, so the first render matches the HTML. */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );
}

export function WorkbenchProvider({ data, children }: { data: WorkbenchData; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const files = useMemo(() => explorerFiles(data.tree), [data.tree]);
  const known = useMemo(() => new Set([...files.map((f) => f.url ?? f.path), RESUME_URL]), [files]);
  const activeFile = useMemo(() => files.find((f) => f.url === pathname) ?? null, [files, pathname]);

  // --- tabs ---
  const [tabsState, dispatch] = useReducer(tabsStateReducer, null, (): TabsState => ({
    tabs: known.has(pathname) ? [{ url: pathname, pinned: false }] : [],
    restored: false,
  }));
  const { tabs } = tabsState;

  useEffect(() => {
    // Runs once in the browser: sessionStorage does not exist on the server, so saved tabs can
    // only be read after hydration without causing a mismatch.
    let saved: Tab[] = [];
    try {
      saved = parseTabs(window.sessionStorage.getItem(TABS_STORAGE_KEY));
    } catch {
      // Storage can be blocked (private windows, site data off); start with the current page.
    }
    dispatch({ type: "restore", tabs: saved, known, current: known.has(pathname) ? pathname : "/" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore only once, on mount
  }, []);

  useEffect(() => {
    if (known.has(pathname)) dispatch({ type: "visit", url: pathname });
  }, [pathname, known]);

  useEffect(() => {
    if (!tabsState.restored) return; // do not overwrite saved tabs with the pre-restore state
    try {
      window.sessionStorage.setItem(TABS_STORAGE_KEY, serializeTabs(tabs));
    } catch {
      // Storage unavailable: tabs simply do not survive a reload.
    }
  }, [tabs, tabsState.restored]);

  const pinTab = useCallback((url: string) => dispatch({ type: "pin", url }), []);
  const closeTab = useCallback(
    (url: string) => {
      const next = nextAfterClose(tabs, url);
      dispatch({ type: "close", url });
      if (url === pathname) router.push(next ?? "/");
    },
    [tabs, pathname, router],
  );
  const closeAllTabs = useCallback(() => {
    dispatch({ type: "closeAll" });
    router.push("/");
  }, [router]);

  // --- layout state ---
  // The drawer remembers which page it was opened on, so it closes by itself on navigation.
  const [drawer, setDrawer] = useState<{ open: boolean; path: string }>({ open: false, path: pathname });
  const drawerOpen = drawer.open && drawer.path === pathname;
  const setDrawerOpen = useCallback((open: boolean) => setDrawer({ open, path: pathname }), [pathname]);

  const [explorerVisible, setExplorerVisible] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [panel, setPanel] = useState<PanelMode>("auto");
  const [panelTab, setPanelTab] = useState<PanelTab>("terminal");
  const isDesktop = useIsDesktop();

  // "auto" shows the panel on desktop and hides it on phones (CSS does the hiding). The terminal
  // code is loaded the first time the panel can be seen, and stays loaded after that so its
  // history survives closing the panel.
  const panelVisible = panel === "open" || panel === "maximized" || (panel === "auto" && isDesktop);
  const [shownOnce, setShownOnce] = useState(false);
  const panelEverShown = shownOnce || panelVisible;

  const togglePanel = useCallback(() => {
    if (panelVisible) setShownOnce(true);
    setPanel(panelVisible ? "closed" : "open");
  }, [panelVisible]);
  const maximizePanel = useCallback(() => setPanel((p) => (p === "maximized" ? "open" : "maximized")), []);
  const openPanel = useCallback((tab?: PanelTab) => {
    if (tab) setPanelTab(tab);
    setPanel((p) => (p === "maximized" ? p : "open"));
  }, []);
  const closePanel = useCallback(() => {
    setShownOnce(true);
    setPanel("closed");
  }, []);

  // --- Quick Open (closes on navigation, like the drawer) ---
  const [quick, setQuick] = useState<{ open: boolean; initial: string; path: string }>({ open: false, initial: "", path: pathname });
  const quickOpen = { open: quick.open && quick.path === pathname, initial: quick.initial };
  const openQuickOpen = useCallback((initial = "") => setQuick({ open: true, initial, path: pathname }), [pathname]);
  const closeQuickOpen = useCallback(() => setQuick((q) => ({ ...q, open: false })), []);

  // --- keyboard shortcuts ---
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      // Ctrl+P is left alone on the résumé page so the browser can still print it.
      if (mod && !event.shiftKey && !event.altKey && key === "p" && pathname !== RESUME_URL) {
        event.preventDefault();
        openQuickOpen("");
      } else if (event.key === "F1") {
        event.preventDefault();
        openQuickOpen(">");
      } else if (event.ctrlKey && event.key === "`") {
        event.preventDefault();
        togglePanel();
      } else if (event.altKey && key === "w") {
        event.preventDefault();
        closeTab(pathname);
      } else if (event.key === "Escape") {
        setDrawer((d) => (d.open ? { ...d, open: false } : d));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, openQuickOpen, togglePanel, closeTab]);

  const value: Workbench = {
    ...data,
    files,
    activeUrl: pathname,
    activeFile,
    tabs,
    pinTab,
    closeTab,
    closeAllTabs,
    drawerOpen,
    setDrawerOpen,
    explorerVisible,
    toggleExplorer: () => setExplorerVisible((v) => !v),
    focusMode,
    toggleFocusMode: () => setFocusMode((v) => !v),
    panel,
    panelTab,
    setPanelTab,
    togglePanel,
    maximizePanel,
    openPanel,
    closePanel,
    panelEverShown,
    quickOpen,
    openQuickOpen,
    closeQuickOpen,
  };

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}
