import { AbiError, decodeOutputs, encodeArgs, canonical, parseSignature } from "../../chain/abi";
import { addressUrl, isNetworkId, NETWORKS, type Network, type NetworkId } from "../../chain/networks";
import { bitcoinTipHash, blockHeight, ethCall, RpcError } from "../../chain/rpc";
import type { TerminalContract } from "../../chain/types";
import { blank, bold, cmd, dim, error, link, plain } from "../text";
import type { Command, Env, Line, Result } from "../types";

const ok = (lines: Line[]): Result => ({ lines });
const fail = (text: string, status = 1): Result => ({ lines: [error(text)], status });

/** Network-level failures become one readable line; anything else is a bug and propagates. */
function failure(prefix: string, cause: unknown): Result {
  if (cause instanceof RpcError || cause instanceof AbiError) return fail(`${prefix}${cause.message}`);
  throw cause;
}

/** Removes `--flag value` and `-f value` from the arguments and returns the value. */
function takeOption(args: string[], names: string[]): { value: string | undefined; rest: string[] } {
  const rest: string[] = [];
  let value: string | undefined;
  for (let i = 0; i < args.length; i += 1) {
    if (names.includes(args[i]) && i + 1 < args.length) {
      value = args[i + 1];
      i += 1;
    } else rest.push(args[i]);
  }
  return { value, rest };
}

// ---------------------------------------------------------------------------------------------
// bitcoin-cli

const bitcoinCli: Command = {
  name: "bitcoin-cli",
  group: "chain",
  summary: "ask the Bitcoin network for its height (getblockcount)",
  usage: "bitcoin-cli getblockcount | bitcoin-cli getbestblockhash",
  complete: (args) => ["getblockcount", "getbestblockhash"].filter((s) => s.startsWith(args[0] ?? "")),
  async run(args, _s, env) {
    const [method] = args;
    if (!method) return fail("error: too few parameters (need at least command)");
    try {
      if (method === "getblockcount") return ok([plain(String(await blockHeight(NETWORKS.bitcoin, { fetchImpl: env.fetch })))]);
      if (method === "getbestblockhash") return ok([plain(await bitcoinTipHash({ fetchImpl: env.fetch }))]);
    } catch (cause) {
      return failure("error: could not reach mempool.space: ", cause);
    }
    return fail("error code: -32601\nerror message:\nMethod not found");
  },
};

// ---------------------------------------------------------------------------------------------
// cast (Foundry)

const evmNetwork = (id: string | undefined, fallback: NetworkId): Network | null => {
  const wanted = id ?? fallback;
  return isNetworkId(wanted) && NETWORKS[wanted].kind === "evm" ? NETWORKS[wanted] : null;
};

const evmIds = () => Object.values(NETWORKS).filter((n) => n.kind === "evm").map((n) => n.id);

/** Finds a configured contract by address (any case) or by name, optionally on one network. */
function findContract(contracts: TerminalContract[], target: string, network: string | undefined): TerminalContract | "ambiguous" | null {
  const wanted = target.toLowerCase();
  const matches = contracts.filter(
    (c) => (c.address.toLowerCase() === wanted || c.name.toLowerCase() === wanted) && (network === undefined || c.network === network),
  );
  if (matches.length === 0) return null;
  return matches.length === 1 ? matches[0] : "ambiguous";
}

function callList(contracts: TerminalContract[]): Line[] {
  const out: Line[] = [plain("`cast call` reads the functions listed below. Click one to run it."), blank()];
  for (const c of contracts.filter((x) => x.calls.length > 0)) {
    out.push([bold(`${c.name}`), dim(`  ${NETWORKS[c.network].name}  ${c.address}`)]);
    for (const call of c.calls) {
      const text = `cast call ${c.address} "${call.signature}"`;
      out.push([{ text: "  " }, cmd(text), dim(`  ${call.summary}`)]);
    }
  }
  return out;
}

async function castCall(args: string[], env: Env): Promise<Result> {
  const { value: rpc, rest } = takeOption(args, ["--rpc-url", "-r"]);
  const [target, signatureText, ...values] = rest;
  const contracts = env.data.contracts;
  if (!target || target === "--list") return ok(callList(contracts));
  if (!signatureText) return fail('usage: cast call <address | name> "<function signature>" [args...] [--rpc-url <network>]');

  const contract = findContract(contracts, target, rpc);
  if (contract === "ambiguous") return fail(`cast: "${target}" exists on several networks; pass an address, or add --rpc-url <network>`);
  if (!contract) {
    return {
      lines: [error(`cast: ${target} is not one of the contracts listed on this site.`), [{ text: "To see what can be called, run " }, cmd("cast call --list"), { text: "." }]],
      status: 1,
    };
  }

  let wanted: ReturnType<typeof parseSignature>;
  try {
    wanted = parseSignature(signatureText);
  } catch (cause) {
    return failure("cast: ", cause);
  }
  const call = contract.calls.find((c) => canonical(parseSignature(c.signature)) === canonical(wanted));
  if (!call) {
    return {
      lines: [error(`cast: ${wanted.name}(${wanted.inputs.join(",")}) is not a function this site calls on ${contract.name}.`), [{ text: "See " }, cmd("cast call --list")]],
      status: 1,
    };
  }

  try {
    const data = `0x${call.selector}${encodeArgs(call.inputs, values)}`;
    const raw = await ethCall(NETWORKS[contract.network], contract.address, data, { fetchImpl: env.fetch });
    return ok(decodeOutputs(raw, call.outputs).map(plain));
  } catch (cause) {
    return failure("Error: ", cause);
  }
}

const cast: Command = {
  name: "cast",
  group: "chain",
  summary: "read a chain, Foundry style (block-number, call)",
  usage: 'cast block-number [--rpc-url <network>] | cast chain-id [--rpc-url <network>] | cast call <address|name> "<signature>" [--rpc-url <network>] | cast call --list',
  complete(args, _s, env) {
    const last = args[args.length - 1] ?? "";
    if (args.length <= 1) return ["block-number", "chain-id", "call"].filter((s) => s.startsWith(last));
    if (args[0] === "call" && args.length === 2) return ["--list", ...env.data.contracts.filter((c) => c.calls.length > 0).map((c) => c.address)].filter((s) => s.toLowerCase().startsWith(last.toLowerCase()));
    if (args[args.length - 2] === "--rpc-url" || args[args.length - 2] === "-r") return evmIds().filter((s) => s.startsWith(last));
    return [];
  },
  async run(args, _s, env) {
    const [sub, ...rest] = args;
    if (sub === "call") return castCall(rest, env);

    if (sub === "block-number" || sub === "chain-id") {
      const { value: rpc, rest: extra } = takeOption(rest, ["--rpc-url", "-r"]);
      if (extra.length > 0) return fail(`cast ${sub}: unexpected argument "${extra[0]}"`);
      const network = evmNetwork(rpc, "ethereum");
      if (!network) return fail(`cast: unknown network "${rpc}". Try one of: ${evmIds().join(", ")}`);
      if (sub === "chain-id") return ok([plain(String(network.chainId))]);
      try {
        return ok([plain(String(await blockHeight(network, { fetchImpl: env.fetch })))]);
      } catch (cause) {
        return failure("Error: ", cause);
      }
    }
    if (!sub) return fail("usage: cast <block-number | chain-id | call> ...");
    return fail(`error: unrecognized subcommand '${sub}'`, 2);
  },
};

// ---------------------------------------------------------------------------------------------
// starkli (Starknet)

const starkli: Command = {
  name: "starkli",
  group: "chain",
  summary: "ask Starknet for its block number",
  usage: "starkli block-number [--network mainnet|sepolia]",
  complete: (args) => (args.length <= 1 ? ["block-number"].filter((s) => s.startsWith(args[0] ?? "")) : ["mainnet", "sepolia"]),
  async run(args, _s, env) {
    const [sub, ...rest] = args;
    if (sub !== "block-number") return fail(sub ? `error: unrecognized subcommand '${sub}'` : "usage: starkli block-number [--network mainnet|sepolia]", 2);
    const { value: net } = takeOption(rest, ["--network"]);
    const id = net === undefined || net === "mainnet" ? "starknet" : net === "sepolia" ? "starknet-sepolia" : null;
    if (!id) return fail(`starkli: unknown network "${net}". Try mainnet or sepolia.`);
    try {
      return ok([plain(String(await blockHeight(NETWORKS[id], { fetchImpl: env.fetch })))]);
    } catch (cause) {
      return failure("Error: ", cause);
    }
  },
};

export const chainCommands: Command[] = [bitcoinCli, cast, starkli];

/** Block explorer link for a contract, used by the README table. */
export const explorerLink = (contract: Pick<TerminalContract, "network" | "address">) => link(contract.address, addressUrl(NETWORKS[contract.network], contract.address));
