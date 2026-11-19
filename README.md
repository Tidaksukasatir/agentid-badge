# Agent ID Pioneer Badge

A free, soulbound NFT badge for Binance Agent ID holders — built for the [Binance Agent ID Hackathon](https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf).

## What it is

Any wallet holding a Binance Agent ID (`name.ai`) can claim **one free badge** (gas only). The badge is **soulbound**: it can be minted but never transferred, so it stays bound to the Agent ID holder who claimed it.

- **Use case:** Agent ID as access control / identity gating. Holding an Agent ID is the credential; the badge is the proof.
- **Max supply:** 10,000 badges, 1 per wallet.
- **Cost to claim:** free (gas only).
- **Chain:** BNB Chain (BSC, chain 56).

## Contracts

| | |
|---|---|
| Badge | `0x3E182eC2698Aee0229281417D1410F65A66AF237` (predicted CREATE2 address; update after deploy) |
| Agent ID registry | `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` (SPACE ID Agent ID, ERC-721, non-transferable) |

Deployment uses the canonical Deterministic Deployment Proxy (CREATE2 factory) at `0x4e59b44847b379578588920ca78fbf26c0b4956c`, because the Binance Agentic Wallet CLI cannot send contract-creation transactions directly. The badge constructor takes the owner address explicitly (the factory is `msg.sender` at deploy time).

## How it works

- `claim()` — checks `AGENT_ID_REGISTRY.balanceOf(msg.sender) > 0`, checks the caller has not claimed, mints token ID `totalMinted + 1`.
- `isEligible(address)` — view: Agent ID held + not claimed + supply remains.
- `hasClaimed(address)` — view: whether an address already claimed.
- Soulbound: `_update` reverts on any transfer between two live addresses; minting and burning are allowed.
- All badges share one metadata document (`tokenURI` returns the base URI); the artwork is the same for every holder.

## Website

`website/` is a static site (GitHub Pages). Connect a wallet on BNB Chain, it checks Agent ID ownership, and claims the badge.

## Development

```bash
npm install
npx hardhat compile
```

Solidity 0.8.24, OpenZeppelin Contracts 5.6.1, optimizer enabled (runs 200), EVM target Cancun.

## License

MIT. See `contracts/AgentIDPioneerBadge.sol` (`SPDX-License-Identifier: MIT`).
