[![node version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen?style=plastic)](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen?style=plastic) [![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/atomminer/udp-discovery?style=plastic)](https://img.shields.io/github/languages/code-size/atomminer/udp-discovery?style=plastic) [![DeepScan grade](https://deepscan.io/api/teams/12301/projects/15403/branches/306462/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=12301&pid=15403&bid=306462)

Network UDP discovery module
==============

Designed to easily locate your services/nodes running on the local network.

#### Motivation:

It is way easier to broadcast a request packet and track responses vs hard-coding IP:port for each node on DHCP enabled network.
Comes in pretty handy when used on the cluster server with multiple network interfaces and headless nodes.

##### How it works

Client broadcast handshake message in the local network and wait for response(s) to track IP's and response message. Handshake message 
and response behavior can be easily modified to handle specific needs.

##### Installation
`udp-discovery` can be installed via npm. Requires node 10+. 
```bash
npm install atomminer/udp-discovery
```

##### Usage
Send a cookie if handshake messages is asking for one. Ignore message if sender doesn't want a cookie:
```js
const Discovery = require('udp-discovery');

const server = Discovery.serve({port: 10002}, (msg, info) => {
	if(msg === 'I want a cookie') return 'cookie';
});
```
Request a cookie example:
```js
Discovery.discover({port: 10002, handshake: "I want a cookie"}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) {
		if(msg.toString() === 'cookie') console.log(`We've got a cookie from ${info.address}`);
	}
	else console.log('[10002] Scan finised');
});
```

More real-life example would be to respond with the list of running services and their respective port numbers:

```js
const Discovery = require('udp-discovery');
...
var APIServer = API.start();
var WWWServer = WWW.start();
var IPCServer = IPC.start();

const server = Discovery.serve({port: 10003}, (msg, info) => {
	try{
		const inmsg = JSON.parse(msg);
		if(inmsg && inmsg.discover) {
			if(inmsg.discover === '*') return { api: APIServer.port, www: WWWServer.port, ipc: IPCServer.port };
			else if(inmsg.discover === 'api' && APIServer.running) return { api: APIServer.port };
			else if(inmsg.discover === 'www' && WWWServer.running) return { www: WWWServer.port };
		}
	}
	catch(e) {
	}
});
```
UDP Scan client could look something like this:
```js
Discovery.discover({port: 10003}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) console.log(`Message from ${info.address}: ${msg.toString()}`);
});
```
or
```js
Discovery.discover({port: 10003, handshake: {discover: 'api'}}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) console.log(`Discovered API on ${info.address}: ${msg.toString()}`);
});
```

##### Reference API
[Reference API](docs/README.md)


##### License
This software is released under MIT license
