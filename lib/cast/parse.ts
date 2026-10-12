/**
 * Reader for asciicast files, the format `asciinema rec` writes. Both versions are supported:
 *   v2: one JSON header line, then [absolute seconds, type, data] lines.
 *   v3: the same, but each time is the gap since the previous event, and `#` comment lines are allowed.
 * Only the output events matter for a replay; input, markers and resizes are skipped.
 */

export interface CastHeader {
  version: 2 | 3;
  width: number;
  height: number;
  /** Unix time the recording started, if recorded. */
  timestamp?: number;
  /** Free text, used here for "what was run, and at which commit". */
  title?: string;
  /** Longest pause to keep, in seconds. */
  idleTimeLimit?: number;
}

export interface CastEvent {
  /** Seconds since the recording started. */
  time: number;
  data: string;
}

export interface Cast {
  header: CastHeader;
  events: CastEvent[];
  /** Exit status, when the file recorded one (v3 "x" event). */
  exitStatus?: number;
}

export class CastError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const num = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

export function parseCast(text: string): Cast {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "" && !line.startsWith("#"));
  if (lines.length === 0) throw new CastError("The recording is empty");

  let raw: unknown;
  try {
    raw = JSON.parse(lines[0]);
  } catch {
    throw new CastError("The recording's first line is not valid JSON");
  }
  if (!isRecord(raw)) throw new CastError("The recording has no header");
  const version = raw.version;
  if (version !== 2 && version !== 3) throw new CastError(`Unsupported asciicast version: ${String(version)}`);

  // v2 puts the size at the top level; v3 nests it under "term".
  const term = isRecord(raw.term) ? raw.term : {};
  const width = num(version === 3 ? term.cols : raw.width) ?? 80;
  const height = num(version === 3 ? term.rows : raw.height) ?? 24;

  const header: CastHeader = {
    version,
    width,
    height,
    timestamp: num(raw.timestamp),
    title: typeof raw.title === "string" ? raw.title : undefined,
    idleTimeLimit: num(raw.idle_time_limit) ?? num(raw.idle_time_limit),
  };

  const events: CastEvent[] = [];
  let exitStatus: number | undefined;
  let clock = 0;
  for (const line of lines.slice(1)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new CastError("The recording contains a line that is not valid JSON");
    }
    if (!Array.isArray(parsed) || parsed.length < 2) throw new CastError("The recording contains a malformed event");
    const [t, type, data] = parsed as [unknown, unknown, unknown];
    const seconds = num(t);
    if (seconds === undefined || typeof type !== "string") throw new CastError("The recording contains a malformed event");

    // v3 stores the gap since the previous event; v2 stores the time itself.
    clock = version === 3 ? clock + seconds : seconds;
    if (type === "o" && typeof data === "string") events.push({ time: clock, data });
    else if (type === "x") exitStatus = num(Number(data));
  }
  return { header, events, exitStatus };
}

/**
 * Shortens every pause longer than `limit` seconds to exactly `limit`, so a replay does not sit
 * silent while a slow command thinks. Event order is unchanged.
 */
export function capIdle(events: CastEvent[], limit: number): CastEvent[] {
  if (!(limit > 0)) return events;
  let previousOriginal = 0;
  let adjusted = 0;
  return events.map((event) => {
    const gap = Math.max(0, event.time - previousOriginal);
    previousOriginal = event.time;
    adjusted += Math.min(gap, limit);
    return { time: adjusted, data: event.data };
  });
}

/** Total playing time in seconds after capping. */
export function duration(events: CastEvent[]): number {
  return events.length === 0 ? 0 : events[events.length - 1].time;
}

/** Serialises events as an asciicast v2 file. Used by the recorder. */
export function writeCastV2(header: Omit<CastHeader, "version">, events: CastEvent[], env: Record<string, string> = {}): string {
  const head: Record<string, unknown> = {
    version: 2,
    width: header.width,
    height: header.height,
    ...(header.timestamp !== undefined ? { timestamp: header.timestamp } : {}),
    ...(header.idleTimeLimit !== undefined ? { idle_time_limit: header.idleTimeLimit } : {}),
    env,
    ...(header.title ? { title: header.title } : {}),
  };
  return [JSON.stringify(head), ...events.map((e) => JSON.stringify([Math.round(e.time * 1e6) / 1e6, "o", e.data]))].join("\n") + "\n";
}
