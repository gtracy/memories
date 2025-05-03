'use strict'

const app = require('./app');

// for easier testing, you can provide a specific spreadsheet
// row on the command line when running locally
//    > node app.local.js 733
//
const args = process.argv.slice(2);
// If no arguments are provided, default to 2720
const date = args[0] || 2720;
app.handler(date);
