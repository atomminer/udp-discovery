const DiscoveryClient = require('./client');
/**
 * Local network discovery service provider. UDP Server
 * @module DiscoveryServer
 * @typicalname discovery
 * 
 * @example
 * ```js
 * Discovery.discover({port: 10001}, (err, msg, info) => {
 * 	if(err) return console.error(err);
 * 	if(msg && info) console.log(`[10001] Message from ${info.address}: ${msg.toString()}`);
 * });
 * ```
 * 
 * @example
 * ```js
 * class MyDiscovery extends Discovery.Discover {
 * 	onMessage(msg, info) {
 * 		if(msg === 'cookie') super.onMessage(msg, info);
 * 	}
 * }
 * 
 * const discovery = new Discover(configOrPort);
 * 	discovery.on('stop', () => { console.log('stop') });
 * 	discovery.on('error', (e) => { 
 * 		discovery.removeAllListeners('stop');
 * 		discovery.stop(); 
 * 		console.error(e);
 * 	});
 * 	discovery.on('found', ({msg, info}) => { console.log(msg.toString(), info) });
 * 	discovery.start();
 * ```
 */

/**
 * UDP provider server class. Can be extended to fit specific needs
 * @class 
 * @extends {DiscoveryClient.Discover}
 * @param {DiscoverConfig|Number} config DiscoverConfig configuration object or port number
 * @fires error
 * @fires start
 * @fires stop
 * @fires message
 * @alias module:DiscoveryServer.Server
 * @public
 */
class Server extends DiscoveryClient.Discover {
	constructor(configOrPort) {
		super(configOrPort);
		this._isServer = true;
	}

	onMessage(msg, info) {
		// ref: https://nodejs.org/api/events.html#events_events
		// When the EventEmitter object emits an event, all of the functions attached to that specific 
		// event are called synchronously. Any values returned by the called listeners are ignored and discarded.
		// hacky solution, but let it be
		const incoming = msg.toString();
		const obj =  {msg: msg.toString(), info};
		this.emit('message', obj);
	}
}

/**
 * Simple way to start a service provide
 *
 * @param {DiscoverConfig|Number} configOrPort DiscoverConfig object or port number to run discovery server on
 * @param {Function} cb callback
 * @alias module:DiscoveryServer.serve
 */
const serve = (configOrPort, cb) => {
	if(!cb) throw new Error('Callback can not be null or undefined');
	const server = new Server(configOrPort);
	server.on('message', ({msg, info}) => {
		const response = cb(msg, info);
		if(response) server.send(response, info.port, info.address);
	});
	server.start();
	return server;
}

module.exports = {
	Server,
	serve,
}