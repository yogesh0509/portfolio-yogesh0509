## What it does

A cross-chain yield product lets users deposit tokens into Starknet vaults and earn on Ethereum. This relayer is the off-chain engine in the middle.

1. It listens to Starknet for vault deposit and withdrawal events through an Apibara stream (a hosted Starknet event indexer).
2. It writes every event to a Postgres ledger. Each row moves through a status, from the vault, to bridge initiated, to deposited on an Ethereum strategy, and finally to withdrawal completed.
3. When enough has been deposited, or enough time has passed, it batches the deposits and sends them to Ethereum through StarkGate, the Starknet–Ethereum bridge.
4. From one Ethereum wallet it supplies the funds to Aave or Compound.
5. Withdrawals run in reverse and send the funds back to the vault on Starknet.

A monitor checks the Starknet transactions every hour, claims funds that have reached Ethereum, re-runs stuck batches, and reports problems to a Discord channel. A small Express API serves user activity and positions.

## Why a ledger

Events can be seen twice when the indexer restarts and re-reads a few blocks. Each row is keyed by block, transaction and event index, and it is checked before it is inserted, so replaying a block does not count a deposit twice.

## Status

The code is in TypeScript, about 4,300 lines, with Prisma for the database. Its configuration covers the Sepolia testnet only. It depends on in-house SDKs that are not public, so the repository can be read but not built or run from GitHub alone.

The repository's package metadata names the team it was written for (APY). It is a single commit, so authorship of individual files is not shown by the history.
