import type { NetworkId } from "./networks";

/** A deployed contract with everything the browser needs to call it. Selectors are computed at build time. */
export interface TerminalContract {
  project: string;
  name: string;
  network: NetworkId;
  address: string;
  note?: string;
  calls: { signature: string; selector: string; inputs: string[]; outputs: string[]; summary: string }[];
}
