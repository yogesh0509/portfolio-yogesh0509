'use client'

import { useEffect, useState } from "react";
import { blockUrl, NETWORKS, type NetworkId } from "@/lib/chain/networks";
import { blockHeight } from "@/lib/chain/rpc";

const SHOWN: { id: NetworkId; symbol: string; label: string }[] = [
  { id: "bitcoin", symbol: "₿", label: "Bitcoin" },
  { id: "ethereum", symbol: "Ξ", label: "Ethereum" },
  { id: "starknet", symbol: "STRK", label: "Starknet" },
];

const REFRESH_MS = 60_000;
type Heights = Partial<Record<NetworkId, number>>;

/**
 * Live block heights from public endpoints, fetched in the visitor's browser. They refresh once a
 * minute while the tab is visible and the screen is wide enough to show them. A provider that is
 * down simply disappears: the site never shows a stale or broken number.
 */
function useChainHeights(): Heights {
  const [heights, setHeights] = useState<Heights>({});

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      window.clearTimeout(timer);
      const visible = document.visibilityState === "visible";
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      if (visible && wide) {
        const results = await Promise.allSettled(SHOWN.map(({ id }) => blockHeight(NETWORKS[id], { timeoutMs: 6000 })));
        if (cancelled) return;
        const next: Heights = {};
        results.forEach((result, i) => {
          if (result.status === "fulfilled") next[SHOWN[i].id] = result.value;
        });
        setHeights(next);
      }
      if (!cancelled) timer = window.setTimeout(poll, REFRESH_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    void poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return heights;
}

export default function ChainHeights() {
  const heights = useChainHeights();
  const available = SHOWN.filter(({ id }) => heights[id] !== undefined);
  if (available.length === 0) return null;
  return (
    <div className="hidden items-stretch lg:flex" aria-label="Current block heights">
      {available.map(({ id, symbol, label }) => {
        const height = heights[id] as number;
        return (
          <a
            key={id}
            href={blockUrl(NETWORKS[id], height)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 hover:bg-[#2a2d2e]"
            title={`${label} block ${height.toLocaleString("en-US")}, read live from a public endpoint. Click to open it.`}
          >
            <span aria-hidden>{symbol}</span>
            <span className="sr-only">{label} block</span>
            {height.toLocaleString("en-US")}
          </a>
        );
      })}
    </div>
  );
}
