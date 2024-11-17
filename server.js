
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

const dotenv = require('dotenv');
dotenv.config();
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


app.get('/api/proxy/*', async (req, res) => {
    try {
        const akoyaPath = req.url.replace('/api/proxy/', '');
        console.log('akoyaPath:', akoyaPath);


        const token = req.headers.authorization?.split(' ')[1];
        console.log('token:', token);
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Get the path after /proxy/
        
        const url = `${AKOYA_BASE_URL}/${akoyaPath}`;
        
        console.log('Proxying request to:', url);
        console.log('Token:', token.substring(0, 10) + '...');

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
