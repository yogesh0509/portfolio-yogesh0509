/**
 * Just enough of the Ethereum ABI to make a read-only `eth_call` and show the answer:
 * signatures in `cast` style, argument encoding for static types, and decoding of the result
 * (integers, addresses, booleans, fixed bytes, strings, bytes and arrays of static types).
 * It does no hashing: function selectors are computed at build time (see selectors.server.ts).
 */

export class AbiError extends Error {}

export interface Signature {
  name: string;
  inputs: string[];
  outputs: string[];
}

/** Parses "name(uint256,address)(bool,string)". The second group, the return types, is optional. */
export function parseSignature(text: string): Signature {
  const cleaned = text.trim().replace(/^function\s+/, "").replace(/\s+/g, "");
  const match = /^([A-Za-z_$][A-Za-z0-9_$]*)\(([^()]*)\)(?:\(([^()]*)\))?$/.exec(cleaned);
  if (!match) throw new AbiError(`Not a function signature: ${text}`);
  const list = (group: string | undefined) => (group ? group.split(",").filter(Boolean) : []);
  return { name: match[1], inputs: list(match[2]), outputs: list(match[3]) };
}

/** The form that is hashed to get the selector: name and input types only. */
export const canonical = (s: Signature): string => `${s.name}(${s.inputs.join(",")})`;

const WORD = 64; // hex characters in one 32-byte word

const strip0x = (hex: string) => (hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex);

const INT = /^(u?)int(\d{0,3})$/;
const BYTES_N = /^bytes(\d{1,2})$/;

function intBits(type: string): number | null {
  const m = INT.exec(type);
  if (!m) return null;
  const bits = m[2] === "" ? 256 : Number(m[2]);
  if (bits < 8 || bits > 256 || bits % 8 !== 0) throw new AbiError(`Unsupported type: ${type}`);
  return bits;
}

const isStatic = (type: string) => intBits(type) !== null || type === "address" || type === "bool" || BYTES_N.test(type);
const isDynamicArray = (type: string) => type.endsWith("[]") && isStatic(type.slice(0, -2));
const isDynamic = (type: string) => type === "string" || type === "bytes" || isDynamicArray(type);

// ---------------------------------------------------------------------------------------------
// encoding (arguments are static types only)

export function encodeArgs(types: string[], values: string[]): string {
  if (types.length !== values.length) throw new AbiError(`Expected ${types.length} argument(s), got ${values.length}`);
  return types
    .map((type, i) => {
      const value = values[i];
      const bits = intBits(type);
      if (bits !== null) {
        let n: bigint;
        try {
          n = BigInt(value);
        } catch {
          throw new AbiError(`Not a number: ${value}`);
        }
        const signed = !type.startsWith("u");
        const limit = 1n << BigInt(signed ? bits - 1 : bits);
        if (signed ? n < -limit || n >= limit : n < 0n || n >= limit) throw new AbiError(`${value} does not fit in ${type}`);
        return (n < 0n ? n + (1n << 256n) : n).toString(16).padStart(WORD, "0");
      }
      if (type === "address") {
        if (!/^0x[0-9a-fA-F]{40}$/.test(value)) throw new AbiError(`Not an address: ${value}`);
        return value.slice(2).toLowerCase().padStart(WORD, "0");
      }
      if (type === "bool") {
        if (value !== "true" && value !== "false") throw new AbiError(`Not a boolean: ${value}`);
        return (value === "true" ? "1" : "0").padStart(WORD, "0");
      }
      const fixed = BYTES_N.exec(type);
      if (fixed) {
        const n = Number(fixed[1]);
        if (n < 1 || n > 32 || !new RegExp(`^0x[0-9a-fA-F]{${n * 2}}$`).test(value)) throw new AbiError(`Not a ${type}: ${value}`);
        return value.slice(2).toLowerCase().padEnd(WORD, "0");
      }
      throw new AbiError(`Cannot encode an argument of type ${type}`);
    })
    .join("");
}

// ---------------------------------------------------------------------------------------------
// decoding

/** An integer with `cast`'s scientific hint for large values: 100000000000000 [1e14]. */
export function formatBig(value: bigint): string {
  const abs = value < 0n ? -value : value;
  if (abs < 100000n) return value.toString();
  const digits = abs.toString();
  const mantissa = `${digits[0]}${digits.length > 1 ? `.${digits.slice(1, 4)}` : ""}`.replace(/\.?0+$/, "");
  return `${value.toString()} [${value < 0n ? "-" : ""}${mantissa}e${digits.length - 1}]`;
}

function readWord(hex: string, byteOffset: number): string {
  const start = byteOffset * 2;
  const word = hex.slice(start, start + WORD);
  if (word.length < WORD) throw new AbiError("The response is shorter than expected");
  return word;
}

const toNumber = (word: string, what: string): number => {
  const n = BigInt(`0x${word}`);
  if (n > 0xffffffffn) throw new AbiError(`Implausible ${what} in the response`);
  return Number(n);
};

function decodeStatic(type: string, word: string): string {
  const bits = intBits(type);
  if (bits !== null) {
    let n = BigInt(`0x${word}`) & ((1n << BigInt(bits)) - 1n);
    if (!type.startsWith("u") && n >> BigInt(bits - 1) === 1n) n -= 1n << BigInt(bits);
    return formatBig(n);
  }
  if (type === "address") return `0x${word.slice(24)}`;
  if (type === "bool") return BigInt(`0x${word}`) === 0n ? "false" : "true";
  const fixed = BYTES_N.exec(type);
  if (fixed) return `0x${word.slice(0, Number(fixed[1]) * 2)}`;
  throw new AbiError(`Cannot decode type ${type}`);
}

/** Decodes an eth_call result into one printable string per return value. */
export function decodeOutputs(result: string, types: string[]): string[] {
  const hex = strip0x(result).toLowerCase();
  if (!/^[0-9a-f]*$/.test(hex) || hex.length % 2 !== 0) throw new AbiError("The response is not hexadecimal");
  if (types.length === 0) return [];
  if (hex.length === 0) throw new AbiError("The call returned no data (is this address a contract on this network?)");

  return types.map((type, i) => {
    const head = readWord(hex, i * 32);
    if (isStatic(type)) return decodeStatic(type, head);
    if (!isDynamic(type)) throw new AbiError(`Cannot decode type ${type}`);

    const offset = toNumber(head, "offset");
    const length = toNumber(readWord(hex, offset), "length");
    const start = offset + 32;
    if (type === "string" || type === "bytes") {
      const body = hex.slice(start * 2, (start + length) * 2);
      if (body.length < length * 2) throw new AbiError("The response is shorter than expected");
      if (type === "bytes") return `0x${body}`;
      const bytes = Uint8Array.from(body.match(/../g) ?? [], (b) => Number.parseInt(b, 16));
      return JSON.stringify(new TextDecoder().decode(bytes));
    }
    const element = type.slice(0, -2);
    const items = Array.from({ length }, (_, k) => decodeStatic(element, readWord(hex, start + k * 32)));
    return `[${items.join(", ")}]`;
  });
}
