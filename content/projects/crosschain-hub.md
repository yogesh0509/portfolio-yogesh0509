## What it does

A small relay for calling a function on a contract on another chain, built on **Chainlink CCIP** (Cross-Chain Interoperability Protocol). CCIP carries the message; this project adds the pieces around it.

1. A client posts the target function's ABI, its arguments and the target contract to the Node API.
2. The API returns the sender contract for the current chain, the CCIP chain selector and receiver for the target chain, and the payload: the target address and the encoded function call.
3. The user's wallet calls `crossChainCall` on the sender contract. It builds a CCIP message, asks the router for the fee, pays it in the native token or LINK, and sends the message.
4. On the destination chain, the CCIP router calls the receiver, which decodes the payload and calls the target contract.

A small demo app casts a vote on a `Voter` contract on another chain.

## What is mine, and what is not

The sender contract is adapted from Chainlink's CCIP starter kit (its `BasicMessageSender`). My changes are sending a raw byte payload, checking the balance before sending, and approving the exact fee for each call. The receiver also reuses the starter kit's structure.

The parts I wrote are the payload relay design, the receiver's dispatching of the decoded call, the payload-building API, and the demo.

## Testnets

It targets the CCIP testnets Ethereum Sepolia and Avalanche Fuji. An earlier configuration used Polygon Mumbai, which no longer exists.
