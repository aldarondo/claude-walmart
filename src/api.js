/**
 * Walmart Open API client.
 * Docs: https://developer.walmart.com
 *
 * Base URL: https://api.walmart.com/v1
 * Auth:     ?apiKey=KEY query param on every request
 *
 * Note: Walmart deprecated their public affiliate API in 2020.
 * If the official endpoint returns 4xx/5xx, you will need a third-party
 * proxy (e.g. BlueCart API at https://api.bluecartapi.com) or a fresh
 * API key from https://developer.walmart.com (Supplier/Affiliate program).
 */

import fetch from 'node-fetch';

const BASE = 'https://api.walmart.com/v1';
const TIMEOUT_MS = 15_000;

/**
 * Low-level GET helper.
 * @param {string} apiKey
 * @param {string} path  - e.g. '/search'
 * @param {Record<string, string|number>} params
 */
async function get(apiKey, path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Walmart API error ${res.status}: ${body.slice(0, 200)}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Normalise a raw Walmart item object into a consistent shape.
 * @param {Object} item - raw item from Walmart API response
 * @returns {{ itemId, name, price, salePrice, categoryPath, productUrl, imageUrl }}
 */
function normalise(item) {
  return {
    itemId:       String(item.itemId ?? item.walmartId ?? ''),
    name:         item.name ?? '',
    price:        item.msrp ?? item.price ?? null,
    salePrice:    item.salePrice ?? null,
    categoryPath: item.categoryPath ?? item.category ?? '',
    productUrl:   item.productUrl ?? '',
    imageUrl:     item.thumbnailImage ?? item.mediumImage ?? item.largeImage ?? '',
    upc:          item.upc ?? '',
    shortDescription: item.shortDescription ?? '',
  };
}

/**
 * Search Walmart products.
 *
 * @param {string} apiKey
 * @param {string} query      - search terms
 * @param {number} [limit=10] - max results (1-25)
 * @returns {Promise<Array<{ itemId, name, price, salePrice, categoryPath, productUrl, imageUrl }>>}
 */
export async function searchProducts(apiKey, query, limit = 10) {
  if (!apiKey) throw new Error('WALMART_API_KEY is not set');
  if (!query?.trim()) throw new Error('query must not be empty');

  const clampedLimit = Math.min(Math.max(1, limit), 25);
  const data = await get(apiKey, '/search', { query: query.trim(), numItems: clampedLimit });

  // API returns { items: [...] } or { query: ..., items: [...] }
  const items = data?.items ?? data?.results ?? [];
  return items.map(normalise);
}

/**
 * Get full details for a single Walmart item by ID.
 *
 * @param {string} apiKey
 * @param {string|number} itemId
 * @returns {Promise<{ itemId, name, price, salePrice, categoryPath, productUrl, imageUrl, ... }>}
 */
export async function getItemDetails(apiKey, itemId) {
  if (!apiKey) throw new Error('WALMART_API_KEY is not set');
  if (!itemId) throw new Error('itemId must not be empty');

  const data = await get(apiKey, `/items/${itemId}`);
  return normalise(data);
}
