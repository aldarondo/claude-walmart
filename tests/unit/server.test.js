import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

// Mock api module — no real HTTP calls
const mockSearchProducts = jest.fn();
const mockGetItemDetails = jest.fn();

jest.unstable_mockModule('../../src/api.js', async () => ({
  searchProducts:  mockSearchProducts,
  getItemDetails:  mockGetItemDetails,
}));

const { createServer } = await import('../../src/server.js');

/** Spin up a server+client pair over InMemoryTransport */
async function makeClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  await server.connect(serverTransport);

  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(clientTransport);
  return client;
}

beforeEach(() => {
  mockSearchProducts.mockReset();
  mockGetItemDetails.mockReset();
});

describe('search_products', () => {
  test('returns formatted product list', async () => {
    mockSearchProducts.mockResolvedValue([
      {
        itemId: '123456',
        name: 'Organic Oat Milk',
        price: 3.98,
        salePrice: null,
        categoryPath: 'Dairy/Milk',
        productUrl: 'https://www.walmart.com/ip/123456',
        imageUrl: '',
      },
    ]);

    const client = await makeClient();
    const result = await client.callTool({ name: 'search_products', arguments: { query: 'oat milk' } });

    const text = result.content[0].text;
    expect(text).toContain('Organic Oat Milk');
    expect(text).toContain('123456');
    expect(text).toContain('$3.98');
    expect(mockSearchProducts).toHaveBeenCalledWith(expect.any(String), 'oat milk', 10);
  });

  test('returns no-results message when list is empty', async () => {
    mockSearchProducts.mockResolvedValue([]);

    const client = await makeClient();
    const result = await client.callTool({ name: 'search_products', arguments: { query: 'xyznotaproduct' } });

    expect(result.content[0].text).toContain('No products found');
  });

  test('shows sale price when available', async () => {
    mockSearchProducts.mockResolvedValue([
      {
        itemId: '789',
        name: 'Sale Item',
        price: 10.00,
        salePrice: 7.99,
        categoryPath: 'Grocery',
        productUrl: 'https://www.walmart.com/ip/789',
        imageUrl: '',
      },
    ]);

    const client = await makeClient();
    const result = await client.callTool({ name: 'search_products', arguments: { query: 'sale item' } });

    const text = result.content[0].text;
    expect(text).toContain('$7.99');
    expect(text).toContain('was $10.00');
  });
});

describe('get_item_details', () => {
  test('returns formatted item details', async () => {
    mockGetItemDetails.mockResolvedValue({
      itemId: '987654',
      name: 'Great Value Whole Milk',
      upc: '078742365008',
      price: 3.48,
      salePrice: null,
      categoryPath: 'Dairy/Milk',
      shortDescription: 'Fresh whole milk',
      imageUrl: 'https://i5.walmartimages.com/img/milk.jpg',
      productUrl: 'https://www.walmart.com/ip/987654',
    });

    const client = await makeClient();
    const result = await client.callTool({ name: 'get_item_details', arguments: { item_id: '987654' } });

    const text = result.content[0].text;
    expect(text).toContain('Great Value Whole Milk');
    expect(text).toContain('987654');
    expect(text).toContain('078742365008');
    expect(text).toContain('$3.48');
    expect(mockGetItemDetails).toHaveBeenCalledWith(expect.any(String), '987654');
  });

  test('surfaces error when api throws', async () => {
    mockGetItemDetails.mockRejectedValue(new Error('Item not found'));

    const client = await makeClient();
    const result = await client.callTool({ name: 'get_item_details', arguments: { item_id: '000' } });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Item not found');
  });
});
