// __tests__/server.test.js
const request = require('supertest');
const nock = require('nock');
require('./setup');
const app = require('../server');

describe('Akoya Integration Tests', () => {
  beforeAll(() => {
    // Enable network connection for localhost
    nock.enableNetConnect('127.0.0.1');
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('API Proxy', () => {
    test('Proxy should require authorization token', async () => {
      await request(app)
        .get('/api/proxy/accounts-info/v2/mikomo')
        .expect(401)
        .expect({ error: 'No token provided' });
    });

    test('Proxy should forward requests to Akoya with token', async () => {
      // Log the mock setup
      console.log('Setting up mock for successful request');
      
      const akoyaMock = nock('https://sandbox-products.ddp.akoya.com')
        .persist()
        .get('/accounts-info/v2/mikomo')
        .reply(200, {
          accounts: [
            {
              depositAccount: {
                accountId: 'test_account_id',
                accountType: 'CHECKING'
              }
            }
          ]
        });

      console.log('Mock is pending:', !akoyaMock.isDone());

      const response = await request(app)
        .get('/api/proxy/accounts-info/v2/mikomo')
        .set('Authorization', 'Bearer test_token');

      console.log('Response received:', response.status, response.body);
      console.log('Mock was called:', akoyaMock.isDone());

      expect(response.status).toBe(200);
      expect(response.body.accounts).toBeDefined();
      expect(response.body.accounts[0].depositAccount.accountId).toBe('test_account_id');
    });

    test('Proxy should handle Akoya API errors', async () => {
      console.log('Setting up mock for error request');

      const akoyaMock = nock('https://sandbox-products.ddp.akoya.com')
        .persist()
        .get('/accounts-info/v2/mikomo')
        .reply(401, {
          code: 602,
          message: 'Customer not authorized'
        });

      console.log('Mock is pending:', !akoyaMock.isDone());

      const response = await request(app)
        .get('/api/proxy/accounts-info/v2/mikomo')
        .set('Authorization', 'Bearer test_token');

      console.log('Response received:', response.status, response.body);
      console.log('Mock was called:', akoyaMock.isDone());

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe(602);
    });
 

  // Add test to verify the actual request being made by the server
  test('DEBUG: Log actual request details', async () => {
    let requestLog;
    
    const akoyaMock = nock('https://sandbox-products.ddp.akoya.com')
      .persist()
      .get('/accounts-info/v2/mikomo')
      .reply(function(uri, requestBody) {
        requestLog = {
          url: uri,
          method: this.req.method,
          headers: this.req.headers
        };
        return [418, { message: 'Debug response' }];
      });

    const response = await request(app)
      .get('/api/proxy/accounts-info/v2/mikomo')
      .set('Authorization', 'Bearer test_token');

    console.log('Actual request made:', requestLog);
    console.log('Response received:', response.status, response.body);
  });
});
});
// Also, make sure your server.js proxy endpoint looks like this:

app.all('/api/proxy/:akoyaPath(*)', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const akoyaPath = req.params.akoyaPath;
        const url = `${AKOYA_BASE_URL}/${akoyaPath}`;
        
        console.log('Proxying request to:', url);
        console.log('With token:', token.substring(0, 10) + '...');

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // If Akoya returns an error status
        if (!response.ok) {
            return res.status(500).json({
                error: data.message || 'Error from Akoya API',
                code: data.code,
                original_status: response.status
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});