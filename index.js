const client = require('./src/client');
const server = require('./src/server');

module.exports = {
	...client,
	...server,
}