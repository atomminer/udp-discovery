const Discovery = require('./index');

//////////////////////////////////////////////////////////////////////////////////////////////
// Discovery servers
console.log('Strating srv1');
const srv1 = Discovery.serve({port: 10002}, (msg, info) => {
	if(msg === 'I want a cookie') return 'cookie';
});

console.log('Strating srv2');
const srv2 = Discovery.serve({port: 10003}, (msg, info) => {
	try{
		const inmsg = JSON.parse(msg);
		if(inmsg && inmsg.discover && inmsg.discover === '*') {
			return {
				api: 1234,
				www: 8080,
				ipc: 3456
			};
		}
	}
	catch(e) {
		console.error(e);
		return;
	}
});

//////////////////////////////////////////////////////////////////////////////////////////////
// Discovery clients
class MyDiscovery extends Discovery.Discover {
	onMessage(msg, info) {
		//console.log(`[class:10001] Message from ${info.address}: ${msg.toString()}`);
		super.onMessage(msg, info);
	}
}

console.log('Starting clients -----------------------------');
Discovery.discover({port: 10003}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) console.log(`[10003] Message from ${info.address}: ${msg.toString()}`);
});

Discovery.discover({port: 10002, handshake: "I want a cookie"}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) {
		if(msg.toString() === 'cookie') console.log(`[10002] We've got a cookie from ${info.address}`);
		else console.log(`[10002] Msg from ${info.address}: ${msg.toString()}`);
	}
	else console.log('[10002] Scan finised');
});

const cd = new MyDiscovery();
cd.on('found', ({msg, info}) => {
	console.log(`[class:10003] Message from ${info.address}: ${msg.toString()}`);
})
cd.start();

setTimeout(() => {
	srv1.stop();
	srv2.stop();
}, 5000);