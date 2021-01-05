const udp = require('dgram');
const EventEmitter = require('events').EventEmitter;

/**
 * Local network discovery service using UDP broadcast messages and UDP server(s) to locate running services in the local network
 * @module DiscoveryClient
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
 * Default UDP discovery config
 * @namespace DiscoverConfig
 * @property {Number} port=10001 Default port to scan network nodes on
 * @property {Number} tomeout=1500 Default length of scan in ms
 * @property {string} broadcast='255.255.255.255' Network broadcast address. Use default to broadcast
 * initla messages thtough all available interfaces (tested on Linux), or calculate you own broadcast 
 * address for specific interface using its IP and netmask via following formula `broadcast = (~netmask) | (IP)`.
 * IPv6 should use `ff:ff:ff:ff:ff:ff` as a broadcast address
 * @property {string} handshake Message to broadcast
*/
const defaultDiscoverOpts = {
	port: 10001,
	timeout: 1500,
	broadcast: "255.255.255.255", // (~netmask) | (IP address)
	handshake: '{"discover":"*"}',
}

/**
 * UDP discovery class. Can be extended to fit specific needs
 * @class 
 * @extends {EventEmitter}
 * @param {DiscoverConfig|Number} config DiscoverConfig configuration object or port number
 * @fires error
 * @fires start
 * @fires stop
 * @fires found
 * @alias module:DiscoveryClient.Discover
 * @public
 */
class Discover extends EventEmitter {
	constructor(configOrPort) { 
		super();
		if(typeof configOrPort === 'object') {
			this.opts = {...defaultDiscoverOpts, ...configOrPort};
		}
		else if(isFinite(configOrPort) || configOrPort === undefined) {
			this.opts = defaultDiscoverOpts;
			if(typeof configOrPort === 'number') this.opts.port = configOrPort;
		}
		else throw new Error('Discover() configOrPort must be either object or  port number');
		if(this.opts.port < 1 || this.opts.port > 65535) throw new Error('Discover() port must n the [1-65535] range');
		this._running = false;
		this._socket = null;
		this._address = null;
		this._scanTimeout = null;
		this._isServer = false;
	}

	/**
	 * If Discovery is still running
	 * @readonly
	 * @instance
	 */
	get running() { return this._running; }

	/**
	 * Current instance config object.
	 * @readonly
	 * @instance
	 */
	get config() { return this.opts; }

	/**
	 * Last known address discovery socket was/is working on. See: Socket::AddressInfo
	 * @readonly
	 * @instance
	 */
	get address() {return this._address; }

	/**
	 * Message to use for discover handshake. Can be overloaded by subclass
	 * @readonly
	 * @instance
	 */
	get discoveryMessage() { return this.config.handshake || '{"discover":"*"}'; }

	/**
	 * Start UDP scan
	 * @instance
	 */
	start() {
		if(this.running) {
			this.onError(new Error('Discovery is already in the running state'));
			return;
		}
		if(!this._socket) this._socket = udp.createSocket({type: "udp4", reuseAddr: true});

		this._socket.on('message', this.onMessage.bind(this));
		this._socket.on('listening', this.onConnect.bind(this));
		this._socket.on('error', this.onError.bind(this));
		this._socket.on('close', this.onClose.bind(this));

		if(!this._isServer) {
			this._scanTimeout = setTimeout(() => {
				process.nextTick(() => { this.stop(); })
			}, this.opts.timeout);
		}

		this._socket.bind(this._isServer ? this.config.port : undefined);
	}

	/**
	 * Stop UDP scan
	 * @instance
	 */
	stop() {
		if(this._scanTimeout) clearTimeout(this._scanTimeout);
		if(this._socket) {
			this._socket.close();
			this._socket = null;
		}
		this._scanTimeout = null;
		this._running = false;
		this.emit('stop');
	}


	/**
	 * Send message
	 * @param {string|Buffer|object} msg Message to send
	 * @param {Number} port	Port number
	 * @param {string} host Host to send message to
	 * @instance
	 */
	send(msg, port, host) {
		var m = typeof msg === 'object' ? JSON.stringify(msg) : msg;
		this._socket.send(m, 0, m.length, port, host);
	}

	onError(e) {
		this.emit('error', e);
	}

	onClose() {
		this.emit('close');
	}

	onConnect() {
		if(!this._isServer) this._socket.setBroadcast(true);
		this._address = this._socket.address();
		this._running = true;
		this.emit('start');

		const msg = this.discoveryMessage;
		if(!this._isServer) this.send(msg, this.opts.port, this.opts.broadcast);
	}

	onMessage(msg, info) {
		this.emit('found', {msg, info});
	}
}

/**
 * Simple way to discover/broadcast message with callback
 *
 * @param {DiscoverConfig|Number} configOrPort DiscoverConfig object or port number to run discovery on
 * @param {Function} cb callback
 * @alias module:DiscoveryClient.discover
 */
const discover = (configOrPort, cb) => {
	if(!cb) throw new Error('Callback can not be null or undefined');
	const discovery = new Discover(configOrPort);
	discovery.on('stop', () => { cb && cb(null, null, null); });
	discovery.on('error', (e) => { 
		discovery.removeAllListeners('stop');
		discovery.stop(); 
		cb && cb(e, null, null);
	});
	discovery.on('found', ({msg, info}) => { cb && cb(null, msg, info); });
	discovery.start();
}

 module.exports = {
	Discover,
	discover,
 }