import type { DeployedContract, FeaturedProject } from "../../content/config";
import { parseSignature, type Signature } from "./abi";
import { NETWORKS } from "./networks";
import { isChecksummed, selectorOf } from "./selectors.server";
import type { TerminalContract } from "./types";

const STARKNET_ADDRESS = /^0x[0-9a-f]{1,64}$/;

/**
 * Validates and prepares every configured contract. It throws at build time on a mistake, because
 * a wrong address on a portfolio is worse than a failed build: an EVM address without a correct
 * EIP-55 checksum is almost certainly a typo.
 */
export function buildContracts(projects: FeaturedProject[]): TerminalContract[] {
  const seen = new Set<string>();
  return projects.flatMap((project) =>
    (project.contracts ?? []).map((contract: DeployedContract): TerminalContract => {
      const network = NETWORKS[contract.network];
      const label = `${project.slug}/${contract.name} on ${network.name}`;

      if (network.kind === "evm" && !isChecksummed(contract.address)) {
        throw new Error(`${label}: "${contract.address}" is not a correctly checksummed EVM address`);
      }
      if (network.kind === "starknet" && !STARKNET_ADDRESS.test(contract.address)) {
        throw new Error(`${label}: "${contract.address}" is not a lower-case hexadecimal Starknet address`);
      }
      if (network.kind === "bitcoin") throw new Error(`${label}: Bitcoin has no contracts`);
      if (network.kind !== "evm" && (contract.calls?.length ?? 0) > 0) {
        throw new Error(`${label}: read calls are only supported on EVM networks`);
      }

      const key = `${contract.network}:${contract.address.toLowerCase()}`;
      if (seen.has(key)) throw new Error(`${label}: this address is listed twice`);
      seen.add(key);

      return {
        project: project.slug,
        name: contract.name,
        network: contract.network,
        address: contract.address,
        note: contract.note,
        calls: (contract.calls ?? []).map((call) => {
          const parsed: Signature = parseSignature(call.signature);
          if (parsed.outputs.length === 0) throw new Error(`${label}: ${call.signature} has no return types, so nothing could be shown`);
          return { signature: call.signature, selector: selectorOf(call.signature), inputs: parsed.inputs, outputs: parsed.outputs, summary: call.summary };
        }),
      };
    }),
  );
}
