const dotenv = require('dotenv');
const path = require('path');

console.log('Setup file loaded!');
process.env.TEST_VAR = 'test';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });
