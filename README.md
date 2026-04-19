# claude-walmart

MCP server wrapping the Walmart Open API for product search and price lookup. Exposes tools callable by Claude skills or any MCP client.

## Features
- Product search by keyword
- Item detail lookup by ID
- Normalized product results (name, price, URL, rating)
- BlueCart API fallback if official Walmart endpoint is unavailable

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| MCP SDK | @modelcontextprotocol/sdk |
| HTTP | node-fetch |
| Container | Docker Compose |

## Getting Started

```bash
npm install

# Copy and fill env vars
cp .env.example .env   # set WALMART_API_KEY

# Run locally (stdio mode)
npm start

# Run tests
npm test

# Deploy on NAS
docker compose up -d
docker compose logs -f
```

## Setup

1. Obtain a Walmart API key at https://developer.walmart.com (free affiliate/open API tier)
2. Copy `.env.example` → `.env` and set `WALMART_API_KEY`
3. Run `npm install` then `npm start` to verify

> **Note:** Walmart deprecated their public affiliate API ~2020. If endpoints return errors, set `BLUECART_API_KEY` and update `BASE` in `src/api.js` to use the BlueCart proxy.

## Project Status
Active development. See [ROADMAP.md](ROADMAP.md) for what's planned.

---
**Publisher:** Xity Software, LLC
