# Akoya API Integration Demo

⚠️ **DEMO/LEARNING PURPOSES ONLY - NOT FOR PRODUCTION USE** ⚠️

A simple Node.js application demonstrating Akoya's API OAuth2 flow and data retrieval capabilities.

## Disclaimer

This is sample code intended for learning and demonstration only. It:
- Is NOT production-ready
- Does NOT represent best practices
- Lacks proper security measures
- Comes with NO support or maintenance
- Should NOT be used as a base for production applications

For production implementations, please:
1. Consult [Akoya's official documentation](https://docs.akoya.com)
2. Implement proper security measures
3. Follow your organization's standards
4. Consider security expert consultation

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm
- Akoya Data Recipient Hub account
- Sandbox app credentials from Akoya

### Sandbox App Setup
1. Log into the [Akoya Data Recipient Hub](https://recipient.ddp.akoya.com)
2. Create a new Sandbox application
3. Configure the Redirect URI in your app settings:
   ```
   http://localhost:3000/callback
   ```
   ⚠️ This must exactly match the REDIRECT_URI in your .env file
4. Note your Client ID and Client Secret

### Application Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Add your credentials to .env
CLIENT_ID=your_akoya_client_id
CLIENT_SECRET=your_akoya_client_secret
REDIRECT_URI=http://localhost:3000/callback    # Must match Sandbox app config
```

### Running
```bash
# Start server
node server.js
```

### Testing
1. Visit `http://localhost:3000`
2. Click "Connect to Bank"
3. Login with test credentials:
   ```
   Username: mikomo_14
   Password: mikomo_14
   ```

## Features
- OAuth2 authentication flow
- Basic token management
- Available endpoints:
  - Account Information
  - Balances
  - Investments
  - Transactions
  - Customer Information

## Project Structure
```
├── server.js              # Express server & proxy
├── public/
│   ├── index.html        # OAuth flow page
│   └── products.html     # Data display
├── .env                  # Credentials (not in repo)
├── .env.example          # Environment template
└── package.json          # Dependencies
```

## Security Notes
- Never commit `.env`
- Keep credentials secure
- Don't expose secrets to frontend
- Ensure Redirect URIs match exactly between app config and .env

## License

MIT License - Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS"**, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.