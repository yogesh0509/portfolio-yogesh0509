import type { Color, Line, Span } from "../terminal/types";

/**
 * A small terminal screen, enough to replay what cargo, forge, npm and python print.
 * It understands text, colours (16, 256 and true colour), carriage return, newline, backspace,
 * tabs, erasing lines and the screen, and moving the cursor. Everything else (window titles,
 * hyperlinks, cursor visibility, mouse modes) is read and ignored, so it never reaches the page.
 */

interface Style {
  fg?: Color;
  rgb?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  inverse?: boolean;
}

interface Cell {
  ch: string;
  style: Style;
}

const NAMED: Color[] = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];
const BRIGHT: Color[] = ["brightBlack", "brightRed", "brightGreen", "brightYellow", "brightBlue", "brightMagenta", "brightCyan", "brightWhite"];
// Ubuntu's palette with the five colours that are too dark on the terminal background lightened.
// These must match the .t-* rules in app/globals.css (a test checks that).
export const NAMED_RGB = ["#8b8d89", "#f44747", "#4e9a06", "#c4a000", "#729fcf", "#ad7fa8", "#06989a", "#d3d7cf"];
export const BRIGHT_RGB = ["#888a85", "#ff5c5c", "#8ae234", "#fce94f", "#729fcf", "#ad7fa8", "#34e2e2", "#eeeeec"];

/** CSS colour for an entry of the 256-colour palette. */
export function color256(n: number): string {
  if (n < 8) return NAMED_RGB[n];
  if (n < 16) return BRIGHT_RGB[n - 8];
  if (n < 232) {
    const i = n - 16;
    const level = (v: number) => (v === 0 ? 0 : 55 + v * 40);
    return `rgb(${level(Math.floor(i / 36))}, ${level(Math.floor(i / 6) % 6)}, ${level(i % 6)})`;
  }
  const gray = 8 + (n - 232) * 10;
  return `rgb(${gray}, ${gray}, ${gray})`;
}

/** Rows kept after scrolling. The buffer may grow to twice this before the oldest half is dropped, so scrolling is amortised O(1). */
const MAX_ROWS = 5000;
const ROW_LIMIT = MAX_ROWS * 2;
/** An escape sequence longer than this is not a real one: it is discarded instead of buffered forever. */
const MAX_PENDING = 65536;

export class Screen {
  private rows: Cell[][] = [[]];
  private row = 0;
  private col = 0;
  private style: Style = {};
  private saved: { row: number; col: number } | null = null;
  /** Unfinished escape sequence carried over to the next write (a chunk can end mid-sequence). */
  private pending = "";

  constructor(readonly width = 100) {}

  write(data: string): void {
    const text = this.pending + data;
    this.pending = "";
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (ch === "\x1b") {
        const consumed = this.escape(text, i);
        if (consumed === 0) {
          // Incomplete: wait for more. A "sequence" that never ends is not a sequence, so cap what is kept.
          const rest = text.slice(i);
          this.pending = rest.length > MAX_PENDING ? "" : rest;
          return;
        }
        i += consumed;
      } else {
        this.control(ch);
        i += 1;
      }
    }
  }

  private control(ch: string): void {
    switch (ch) {
      case "\r":
        this.col = 0;
        return;
      case "\n":
        this.row += 1;
        this.col = 0;
        this.ensureRow();
        return;
      case "\b":
        this.col = Math.max(0, this.col - 1);
        return;
      case "\t":
        this.col = Math.min(this.width - 1, (Math.floor(this.col / 8) + 1) * 8);
        return;
      case "\x07":
      case "\x00":
        return;
      default:
        if (ch < " " && ch !== " ") return; // other control characters have no visible effect
        this.put(ch);
    }
  }

  private ensureRow(): void {
    if (this.row >= ROW_LIMIT) {
      // Either ordinary scrolling (the cursor is exactly at the limit) or an absurd cursor jump from a
      // hostile recording. Clamp the jump, then drop the oldest rows so memory stays bounded.
      if (this.row > ROW_LIMIT) this.row = ROW_LIMIT;
      this.rows.splice(0, MAX_ROWS);
      this.row -= MAX_ROWS;
      if (this.saved) this.saved = { ...this.saved, row: Math.max(0, this.saved.row - MAX_ROWS) };
    }
    while (this.rows.length <= this.row) this.rows.push([]);
  }

  private put(ch: string): void {
    if (this.col >= this.width) {
      this.row += 1;
      this.col = 0;
    }
    this.ensureRow();
    const line = this.rows[this.row];
    while (line.length < this.col) line.push({ ch: " ", style: {} });
    line[this.col] = { ch, style: { ...this.style } };
    this.col += 1;
  }

  /** Returns the number of characters consumed, or 0 if the sequence is not complete yet. */
  private escape(text: string, start: number): number {
    const next = text[start + 1];
    if (next === undefined) return 0;

    if (next === "[") {
      // CSI: parameters, intermediates, then a final byte in @-~
      let j = start + 2;
      while (j < text.length && /[0-?]/.test(text[j])) j += 1;
      while (j < text.length && /[ -/]/.test(text[j])) j += 1;
      if (j >= text.length) return 0;
      this.csi(text.slice(start + 2, j), text[j]);
      return j + 1 - start;
    }
    if (next === "]") {
      // OSC (window title, hyperlinks): ends at BEL or ESC \
      for (let j = start + 2; j < text.length; j += 1) {
        if (text[j] === "\x07") return j + 1 - start;
        if (text[j] === "\x1b" && text[j + 1] === "\\") return j + 2 - start;
        if (text[j] === "\x1b" && j + 1 >= text.length) return 0;
      }
      return 0;
    }
    if (next === "(" || next === ")" || next === "*" || next === "+") return text.length > start + 2 ? 3 : 0; // charset selection
    if (next === "7") {
      this.saved = { row: this.row, col: this.col };
      return 2;
    }
    if (next === "8") {
      if (this.saved) ({ row: this.row, col: this.col } = this.saved);
      return 2;
    }
    if (next === "c") {
      this.reset();
      return 2;
    }
    return 2; // any other two-character escape: ignore
  }

  private reset(): void {
    this.rows = [[]];
    this.row = 0;
    this.col = 0;
    this.style = {};
  }

  private csi(params: string, final: string): void {
    const private_ = params.startsWith("?") || params.startsWith(">");
    if (private_) return; // cursor visibility, bracketed paste, mouse: nothing to draw
    const nums = params === "" ? [] : params.split(";").map((p) => (p === "" ? 0 : Number.parseInt(p, 10) || 0));
    const n = (index: number, fallback = 1) => (nums[index] ? nums[index] : fallback);

    switch (final) {
      case "m":
        this.sgr(nums.length === 0 ? [0] : nums);
        return;
      case "A":
        this.row = Math.max(0, this.row - n(0));
        return;
      case "B":
        this.row += n(0);
        this.ensureRow();
        return;
      case "C":
        this.col = Math.min(this.width - 1, this.col + n(0));
        return;
      case "D":
        this.col = Math.max(0, this.col - n(0));
        return;
      case "E":
        this.row += n(0);
        this.col = 0;
        this.ensureRow();
        return;
      case "F":
        this.row = Math.max(0, this.row - n(0));
        this.col = 0;
        return;
      case "G":
        this.col = Math.min(this.width - 1, n(0) - 1);
        return;
      case "H":
      case "f":
        this.row = n(0) - 1;
        this.col = Math.min(this.width - 1, n(1) - 1);
        this.ensureRow();
        return;
      case "d":
        this.row = n(0) - 1;
        this.ensureRow();
        return;
      case "J":
        this.eraseDisplay(nums[0] ?? 0);
        return;
      case "K":
        this.eraseLine(nums[0] ?? 0);
        return;
      case "X": {
        const line = this.rows[this.row] ?? [];
        const end = Math.min(this.col + n(0), line.length); // never loop past the end of the line
        for (let k = this.col; k < end; k += 1) line[k] = { ch: " ", style: {} };
        return;
      }
      case "s":
        this.saved = { row: this.row, col: this.col };
        return;
      case "u":
        if (this.saved) ({ row: this.row, col: this.col } = this.saved);
        return;
      default:
        return; // insert/delete, scroll regions, device queries: ignored
    }
  }

  private eraseLine(mode: number): void {
    this.ensureRow();
    const line = this.rows[this.row];
    if (mode === 0) line.length = Math.min(line.length, this.col);
    else if (mode === 1) for (let k = 0; k <= Math.min(this.col, line.length - 1); k += 1) line[k] = { ch: " ", style: {} };
    else line.length = 0;
  }

  private eraseDisplay(mode: number): void {
    this.ensureRow();
    if (mode === 0) {
      this.eraseLine(0);
      this.rows.length = this.row + 1;
    } else if (mode === 1) {
      for (let r = 0; r < this.row; r += 1) this.rows[r] = [];
      this.eraseLine(1);
    } else {
      this.rows = [[]];
      this.row = 0;
      this.col = 0;
    }
  }

  private sgr(codes: number[]): void {
    for (let i = 0; i < codes.length; i += 1) {
      const c = codes[i];
      if (c === 0) this.style = {};
      else if (c === 1) this.style.bold = true;
      else if (c === 2) this.style.dim = true;
      else if (c === 3) this.style.italic = true;
      else if (c === 4) this.style.underline = true;
      else if (c === 7) this.style.inverse = true;
      else if (c === 22) {
        this.style.bold = false;
        this.style.dim = false;
      } else if (c === 23) this.style.italic = false;
      else if (c === 24) this.style.underline = false;
      else if (c === 27) this.style.inverse = false;
      else if (c >= 30 && c <= 37) this.setFg(NAMED[c - 30]);
      else if (c >= 90 && c <= 97) this.setFg(BRIGHT[c - 90]);
      else if (c === 39) this.setFg(undefined);
      else if (c >= 40 && c <= 47) this.style.bg = NAMED_RGB[c - 40];
      else if (c >= 100 && c <= 107) this.style.bg = BRIGHT_RGB[c - 100];
      else if (c === 49) this.style.bg = undefined;
      else if (c === 38 || c === 48) {
        const target = c === 38 ? "fg" : "bg";
        let colour: string | undefined;
        if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
          colour = color256(Math.min(255, Math.max(0, codes[i + 2])));
          i += 2;
        } else if (codes[i + 1] === 2 && codes[i + 4] !== undefined) {
          const [r, g, b] = [codes[i + 2], codes[i + 3], codes[i + 4]].map((v) => Math.min(255, Math.max(0, v)));
          colour = `rgb(${r}, ${g}, ${b})`;
          i += 4;
        }
        if (colour) {
          if (target === "fg") {
            this.style.fg = undefined;
            this.style.rgb = colour;
          } else this.style.bg = colour;
        }
      }
    }
  }

  private setFg(fg: Color | undefined): void {
    this.style.fg = fg;
    this.style.rgb = undefined;
  }

  /** The screen as styled lines. Trailing blank rows and trailing spaces are dropped. */
  lines(): Line[] {
    const out: Line[] = this.rows.map((cells) => {
      let end = cells.length;
      while (end > 0 && cells[end - 1].ch === " " && !cells[end - 1].style.bg && !cells[end - 1].style.inverse) end -= 1;
      const spans: Span[] = [];
      for (const cell of cells.slice(0, end)) {
        const span = toSpan(cell);
        const last = spans[spans.length - 1];
        if (last && sameStyle(last, span)) last.text += span.text;
        else spans.push(span);
      }
      return spans;
    });
    while (out.length > 0 && out[out.length - 1].length === 0) out.pop();
    return out;
  }
}

function toSpan({ ch, style }: Cell): Span {
  const span: Span = { text: ch };
  // Reverse video swaps foreground and background; a default-coloured side falls back to the terminal's own colours.
  if (style.inverse) {
    span.rgb = style.bg ?? "#300a24";
    span.bg = style.rgb ?? (style.fg ? FG_RGB[style.fg] : "#eeeeec");
  } else {
    if (style.fg) span.fg = style.fg;
    if (style.rgb) span.rgb = style.rgb;
    if (style.bg) span.bg = style.bg;
  }
  if (style.bold) span.bold = true;
  if (style.dim) span.dim = true;
  if (style.italic) span.italic = true;
  if (style.underline) span.underline = true;
  return span;
}

const FG_RGB: Record<Color, string> = {
  black: NAMED_RGB[0], red: NAMED_RGB[1], green: NAMED_RGB[2], yellow: NAMED_RGB[3], blue: NAMED_RGB[4], magenta: NAMED_RGB[5], cyan: NAMED_RGB[6], white: NAMED_RGB[7],
  brightBlack: BRIGHT_RGB[0], brightRed: BRIGHT_RGB[1], brightGreen: BRIGHT_RGB[2], brightYellow: BRIGHT_RGB[3], brightBlue: BRIGHT_RGB[4], brightMagenta: BRIGHT_RGB[5], brightCyan: BRIGHT_RGB[6], brightWhite: BRIGHT_RGB[7],
};

function sameStyle(a: Span, b: Span): boolean {
  return a.fg === b.fg && a.rgb === b.rgb && a.bg === b.bg && !!a.bold === !!b.bold && !!a.dim === !!b.dim && !!a.italic === !!b.italic && !!a.underline === !!b.underline;
}
