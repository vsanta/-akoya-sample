// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Make sure we have required environment variables
const requiredEnvVars = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AKOYA_BASE_URL = process.env.AKOYA_BASE_URL;

app.use(express.static('public'));
app.use(express.json());
// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Initial page serving
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle the OAuth callback
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).send('No authorization code received');
    }

    try {
        // Exchange the code for tokens
        const tokenResponse = await fetch('https://sandbox-idp.ddp.akoya.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const tokens = await tokenResponse.json();
        res.redirect(`/products.html?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).send('Error exchanging authorization code for tokens');
    }
});

app.get('/api/auth', (req, res) => {
    const authUrl = new URL('https://sandbox-idp.ddp.akoya.com/auth');
    authUrl.searchParams.append('connector', 'mikomo');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI);
    authUrl.searchParams.append('scope', 'openid offline_access');
    authUrl.searchParams.append('state', req.query.state || Math.random().toString(36).substring(7));
    
    res.json({ url: authUrl.toString() });
});


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

module.exports = app;
// Only listen if this file is run directly (not required as a module)
if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}