## What it does

A fantasy-cricket marketplace where the rules are in contracts, not on a server. It runs on **Base Sepolia**, a testnet.

1. The factory owner creates a game with a list of players. This deploys a contract that holds the player list and starts the game.
2. Each team registers by paying 0.001 ETH and receives 100 "Dream Tokens". The tokens are a plain balance in the contract, not an ERC-20.
3. **Chainlink Automation** calls the contract on a timer. The calls alternate between opening an auction for the next player and closing it. Closing gives the player to the highest bidder.
4. While an auction is open, teams bid. The price is set by the contract and rises in steps (1, 3, 5, 7, 9, 11, 16, 21 and so on). Outbid tokens come back through a withdrawal.
5. After the last player, the contract sends a **Chainlink Functions** request. A short script stored in the contract fetches each player's T20 batting rank from a cricket API.
6. The callback scores each team, picks the winner, and unlocks the prize: 70% to the winner and 30% to the treasury.

## History

It began in January 2023, using Chainlink Any API and an external adapter written in Node. In December 2024 the contracts moved from Hardhat to Foundry. In May 2025 the oracle moved from Any API to Chainlink Functions.

## Where to look

- The **live demo** is linked above. It is a Next.js app that reads the deployed factory and its games directly.
- The excerpts in this folder are pinned to the last commit that compiles, whose interface matches the deployed contract: the Automation upkeep, the Functions request and callback, and the auction ledger.

Testnet only. It has not been used with real money.
