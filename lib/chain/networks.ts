/**
 * Public, key-free endpoints the site talks to from the visitor's browser. Each one was checked
 * to allow cross-origin browser requests (CORS) for any origin. They are rate-limited public
 * services: calls are made only on request or once a minute while the tab is visible.
 */

export type NetworkKind = "bitcoin" | "evm" | "starknet";

export interface Network {
  id: string;
  kind: NetworkKind;
  name: string;
  /** JSON-RPC endpoint (EVM and Starknet). */
  rpc?: string;
  chainId?: number;
  /** Base URL of a block explorer. */
  explorer: string;
  testnet: boolean;
}

export const NETWORKS = {
  bitcoin: { id: "bitcoin", kind: "bitcoin", name: "Bitcoin", explorer: "https://mempool.space", testnet: false },
  ethereum: { id: "ethereum", kind: "evm", name: "Ethereum", rpc: "https://ethereum-rpc.publicnode.com", chainId: 1, explorer: "https://etherscan.io", testnet: false },
  starknet: { id: "starknet", kind: "starknet", name: "Starknet", rpc: "https://starknet-rpc.publicnode.com", explorer: "https://starkscan.co", testnet: false },
  sepolia: { id: "sepolia", kind: "evm", name: "Ethereum Sepolia", rpc: "https://ethereum-sepolia-rpc.publicnode.com", chainId: 11155111, explorer: "https://sepolia.etherscan.io", testnet: true },
  "base-sepolia": { id: "base-sepolia", kind: "evm", name: "Base Sepolia", rpc: "https://sepolia.base.org", chainId: 84532, explorer: "https://sepolia.basescan.org", testnet: true },
  fuji: { id: "fuji", kind: "evm", name: "Avalanche Fuji", rpc: "https://api.avax-test.network/ext/bc/C/rpc", chainId: 43113, explorer: "https://testnet.snowtrace.io", testnet: true },
  mordor: { id: "mordor", kind: "evm", name: "Ethereum Classic Mordor", rpc: "https://rpc.mordor.etccooperative.org", chainId: 63, explorer: "https://etc-mordor.blockscout.com", testnet: true },
  "starknet-sepolia": { id: "starknet-sepolia", kind: "starknet", name: "Starknet Sepolia", rpc: "https://starknet-sepolia-rpc.publicnode.com", explorer: "https://sepolia.starkscan.co", testnet: true },
} as const satisfies Record<string, Network>;

export type NetworkId = keyof typeof NETWORKS;

export const isNetworkId = (value: string): value is NetworkId => Object.hasOwn(NETWORKS, value);

export const addressUrl = (network: Network, address: string): string =>
  network.kind === "starknet" ? `${network.explorer}/contract/${address}` : `${network.explorer}/address/${address}`;

export const blockUrl = (network: Network, height: number): string => `${network.explorer}/block/${height}`;
