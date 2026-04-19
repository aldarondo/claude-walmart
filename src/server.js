/**
 * claude-walmart MCP server factory.
 * Call createServer() to get a configured Server instance without a transport.
 *
 * Env vars required:
 *   WALMART_API_KEY  - API key from https://developer.walmart.com
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { searchProducts, getItemDetails } from './api.js';

const API_KEY = process.env.WALMART_API_KEY ?? '';

export function createServer() {
  const server = new Server(
    { name: 'claude-walmart', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_products',
        description:
          'Search Walmart for products by keyword. Returns item IDs, names, regular price, sale price, category, and product URLs. ' +
          'No cart management available via API — use the productUrl to view or purchase on Walmart.com.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search terms, e.g. "wireless headphones" or "organic oat milk"',
            },
            limit: {
              type: 'number',
              description: 'Max number of results to return (default: 10, max: 25)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_item_details',
        description:
          'Get full product details for a Walmart item by its item ID. Returns name, price, sale price, description, category, UPC, and product URL. ' +
          'No cart management available via API — use the productUrl to view or purchase on Walmart.com.',
        inputSchema: {
          type: 'object',
          properties: {
            item_id: {
              type: 'string',
              description: 'Walmart item ID (obtained from search_products results)',
            },
          },
          required: ['item_id'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'search_products': {
          const { query, limit = 10 } = args;
          const results = await searchProducts(API_KEY, query, limit);
          if (results.length === 0) {
            return { content: [{ type: 'text', text: `No products found for "${query}".` }] };
          }
          const text = results
            .map((item, i) => {
              const priceStr = item.salePrice != null
                ? `$${item.salePrice.toFixed(2)} (was $${item.price?.toFixed(2) ?? '?'})`
                : item.price != null
                ? `$${item.price.toFixed(2)}`
                : 'Price unavailable';
              return [
                `${i + 1}. ${item.name}`,
                `   Item ID:  ${item.itemId}`,
                `   Price:    ${priceStr}`,
                `   Category: ${item.categoryPath || 'N/A'}`,
                `   URL:      ${item.productUrl || 'N/A'}`,
              ].join('\n');
            })
            .join('\n\n');
          return { content: [{ type: 'text', text }] };
        }

        case 'get_item_details': {
          const { item_id } = args;
          const item = await getItemDetails(API_KEY, item_id);
          const priceStr = item.salePrice != null
            ? `$${item.salePrice.toFixed(2)} (was $${item.price?.toFixed(2) ?? '?'})`
            : item.price != null
            ? `$${item.price.toFixed(2)}`
            : 'Price unavailable';
          const text = [
            `Name:         ${item.name}`,
            `Item ID:      ${item.itemId}`,
            `UPC:          ${item.upc || 'N/A'}`,
            `Price:        ${priceStr}`,
            `Category:     ${item.categoryPath || 'N/A'}`,
            `Description:  ${item.shortDescription || 'N/A'}`,
            `Image:        ${item.imageUrl || 'N/A'}`,
            `URL:          ${item.productUrl || 'N/A'}`,
          ].join('\n');
          return { content: [{ type: 'text', text }] };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  });

  return server;
}
