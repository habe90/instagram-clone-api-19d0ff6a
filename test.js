const assert = require('assert');
const app = require('./server');

assert.ok(app, 'Express app treba biti eksportovan iz server.js');
console.log('Smoke test prošao: server.js se ispravno učitava.');
