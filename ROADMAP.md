# claude-walmart Roadmap

## [Human] Prerequisite
- [ ] Obtain Walmart API key at https://developer.walmart.com
      → Copy `.env.example` to `.env`, set `WALMART_API_KEY`

## In Progress

## Backlog

### [Code] Core
- [ ] Verify live API response shape against `normalise()` once API key is available; adjust field mapping if needed
- [ ] Add `npm install` + smoke test to confirm MCP server starts cleanly

### [Code] Enhancements
- [ ] Support BlueCart API fallback if official Walmart endpoint is deprecated
  - Update `BASE` URL and param names in `src/api.js`
  - Add `BLUECART_API_KEY` to `.env.example`
- [ ] Add `search_by_upc` tool — lookup product by UPC/barcode
- [ ] Add optional `category` filter to `search_products`
- [ ] Add `search_by_upc` tool — lookup product by UPC/barcode

## Completed
- [2026-04-19] Scaffold project: package.json, src/api.js, src/index.js, .env.example, .gitignore, CLAUDE.md, ROADMAP.md
- [2026-04-19] SSE transport pattern: src/server.js (factory), src/index.js (stdio), src/serve.js (SSE on port 8772), docker-compose.yml, unit tests (5 passing)
- [2026-04-19] Deployed to Synology NAS (port 8772); container running — blocked on Walmart API key in `.env`

## 🚫 Blocked

- ❌ [docker-monitor:no-ghcr-image] Container `claude-walmart` uses `node:20-alpine` — migrate to `ghcr.io/aldarondo/...` with a GitHub Actions build-push workflow — 2026-04-22 08:00 UTC
