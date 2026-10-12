## What ZeroXBridge is

A cross-chain liquidity bridge design: lock assets on Ethereum and mint a pegged token on Starknet, using zero-knowledge proofs (per its README). It has Solidity contracts for the Ethereum side, Cairo contracts for Starknet, and a Rust sequencer that watches both chains. The contracts exist only as testnet deployments.

## What I did

I contributed to a team project, so most of the code is other people's. Mine is:

- **L1 deployment script (TypeScript).** It deploys the Ethereum contracts through `forge script` in dependency order, skips what is already deployed, and saves its state after every step so a failed run can resume.
- **L2 deployment script (TypeScript, starknet.js).** It declares and deploys the Cairo contracts, recovers when a class is already declared, and sets up the links between the contracts. I ran it on Starknet Sepolia in June 2025.
- **A fix to the Merkle mountain range (MMR) indexing** in the Cairo bridge contract: how a commitment's leaf index and the peaks are stored, with tests. Follow-up commits by other contributors changed the final index formula, so I do not claim the finished math.
- **A Starknet burn-event fetcher in the Rust sequencer.** It reads burn events page by page and keeps its place in a Postgres table, so a restart resumes where it stopped.

The excerpts here are pinned to the commits where those files were mine, because later commits by others reworked two of them.

## Status

Sepolia testnet only, with no real activity on chain.
