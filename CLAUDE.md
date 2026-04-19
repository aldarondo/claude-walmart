# claude-walmart

## Project Purpose
MCP server wrapping the Walmart Open API for product search and price lookup.
Exposes tools callable by Claude skills or any MCP client.

**Limitation:** No cart management is available via the Walmart API.
The tools return product info and direct product URLs for purchase on Walmart.com.

## Key Commands
```bash
npm install     # install dependencies
npm start       # run locally (stdio mode)
npm test        # run unit tests
```

## Setup
1. Obtain a Walmart API key at https://developer.walmart.com (free affiliate/open API tier)
2. Copy `.env.example` → `.env` and fill in `WALMART_API_KEY`
3. Run `npm install` then `npm start` to verify

## API Notes
- Base URL: `https://api.walmart.com/v1`
- Auth: `?apiKey=KEY` query param (no OAuth needed)
- `GET /search?query=QUERY&numItems=N` — product search
- `GET /items/:itemId` — item detail lookup
- Walmart deprecated their public affiliate API in ~2020. If the endpoint returns errors,
  a third-party proxy (e.g. BlueCart API at https://api.bluecartapi.com) may be needed.
  Update `BASE` in `src/api.js` and adjust request params accordingly.

## Testing Requirements
- Unit tests in `tests/` with Jest and `unstable_mockModule`
- Run before marking any task complete: `npm test`

## After Every Completed Task
- Move task to Completed in ROADMAP.md with today's date

## Git Rules
- Never push without Charles confirming
- solo/auto-push OK

@~/Documents/GitHub/CLAUDE.md
