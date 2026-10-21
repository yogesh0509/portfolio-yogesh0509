'use client'

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/lib/ansi/screen";
import { capIdle, parseCast } from "@/lib/cast/parse";
import type { Line } from "@/lib/terminal/types";
import LineView from "./LineView";

interface Props {
  url: string;
  title: string;
  /** Set by Ctrl+C: stop playing now, keeping what has been shown. */
  stopped: boolean;
  onDone: () => void;
}

const SPEEDS = [1, 2, 4];
const noop = () => {};

/**
 * Replays a recorded terminal session. Timing comes from the recording itself (pauses longer than
 * the recording's idle limit are shortened), and the output goes through a small screen buffer so
 * progress bars and colours look as they did live.
 */
export default function CastPlayer({ url, title, stopped, onDone }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "done" | "error">("loading");
  const [speed, setSpeed] = useState(1);

  const speedRef = useRef(1);
  const stoppedRef = useRef(stopped);
  const onDoneRef = useRef(onDone);
  const skipRef = useRef<() => void>(noop);

  useEffect(() => {
    stoppedRef.current = stopped;
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cast = parseCast(await res.text());
        if (cancelled) return;

        const limit = cast.header.idleTimeLimit ?? 1;
        const events = capIdle(cast.events, limit);
        const screen = new Screen(Math.min(Math.max(cast.header.width, 40), 160));
        const when = cast.header.timestamp ? new Date(cast.header.timestamp * 1000).toISOString().slice(0, 10) : null;
        setNote(`${when ? `Recorded ${when}. ` : ""}${cast.header.title ? `${cast.header.title}. ` : ""}Pauses longer than ${limit} s are shortened.`);

        let index = 0;
        let playhead = 0;
        let last = performance.now();
        let finished = false;

        const flush = (until: number) => {
          let changed = false;
          while (index < events.length && events[index].time <= until) {
            screen.write(events[index].data);
            index += 1;
            changed = true;
          }
          if (changed) setLines(screen.lines());
        };
        const finish = (showRest: boolean) => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timer);
          if (showRest) flush(Infinity);
          setStatus("done");
          onDoneRef.current();
        };
        skipRef.current = () => finish(true);

        // Visitors who ask for reduced motion get the final output at once.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          finish(true);
          return;
        }

        setStatus("playing");
        const tick = () => {
          if (cancelled || finished) return;
          if (stoppedRef.current) {
            finish(false);
            return;
          }
          const now = performance.now();
          playhead += ((now - last) / 1000) * speedRef.current;
          last = now;
          flush(playhead);
          if (index >= events.length) finish(false);
          else timer = window.setTimeout(tick, 30);
        };
        tick();
      } catch {
        if (cancelled) return;
        setStatus("error");
        onDoneRef.current();
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [url]);

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speedRef.current) + 1) % SPEEDS.length];
    speedRef.current = next;
    setSpeed(next);
  };

  if (status === "error") return <p className="text-[#ef2929]">Could not load the recording of “{title}”.</p>;

  return (
    <div className="my-1">
      {note && <p className="text-xs opacity-70">{note}</p>}
      {/* The screen changes many times a second, so it is not announced; the finished output can be read normally. */}
      <div aria-live="off" className="overflow-x-auto py-1">
        {lines.map((line, i) => (
          <LineView key={i} line={line} run={noop} wrap={false} />
        ))}
      </div>
      {status === "loading" && <p className="opacity-70">Loading the recording…</p>}
      {status === "playing" && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <button type="button" onClick={() => skipRef.current()} className="rounded-sm border border-white/25 px-2 py-0.5 hover:bg-white/10">
            Skip to the end
          </button>
          <button type="button" onClick={cycleSpeed} className="rounded-sm border border-white/25 px-2 py-0.5 hover:bg-white/10" aria-label={`Playback speed ${speed}x. Click to change.`}>
            {speed}×
          </button>
          <span className="opacity-70">Ctrl+C stops</span>
        </div>
      )}
      {status === "done" && <p className="sr-only">The replay has finished.</p>}
    </div>
  );
}
