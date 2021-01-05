##### [<< Back to index](README.md)

<a name="module_DiscoveryServer"></a>

## DiscoveryServer
Local network discovery service provider. UDP Server

**Example**  
```js
Discovery.discover({port: 10001}, (err, msg, info) => {
	if(err) return console.error(err);
	if(msg && info) console.log(`[10001] Message from ${info.address}: ${msg.toString()}`);
});
```
**Example**  
```js
class MyDiscovery extends Discovery.Discover {
	onMessage(msg, info) {
		if(msg === 'cookie') super.onMessage(msg, info);
	}
}

const discovery = new Discover(configOrPort);
	discovery.on('stop', () => { console.log('stop') });
	discovery.on('error', (e) => { 
		discovery.removeAllListeners('stop');
		discovery.stop(); 
		console.error(e);
	});
	discovery.on('found', ({msg, info}) => { console.log(msg.toString(), info) });
	discovery.start();
```

* [DiscoveryServer](#module_DiscoveryServer)
    * [.Server](#module_DiscoveryServer.Server) ⇐ <code>DiscoveryClient.Discover</code>
        * [new Server(config)](#new_module_DiscoveryServer.Server_new)
    * [.serve(configOrPort, cb)](#module_DiscoveryServer.serve)

<a name="module_DiscoveryServer.Server"></a>

### discovery.Server ⇐ <code>DiscoveryClient.Discover</code>
UDP provider server class. Can be extended to fit specific needs

**Kind**: static class of [<code>DiscoveryServer</code>](#module_DiscoveryServer)  
**Extends**: <code>DiscoveryClient.Discover</code>  
**Emits**: <code>event:error</code>, <code>event:start</code>, <code>event:stop</code>, <code>event:message</code>  
**Access**: public  
<a name="new_module_DiscoveryServer.Server_new"></a>

#### new Server(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>DiscoverConfig</code> \| <code>Number</code> | DiscoverConfig configuration object or port number |

<a name="module_DiscoveryServer.serve"></a>

### discovery.serve(configOrPort, cb)
Simple way to start a service provide

**Kind**: static method of [<code>DiscoveryServer</code>](#module_DiscoveryServer)  

| Param | Type | Description |
| --- | --- | --- |
| configOrPort | <code>DiscoverConfig</code> \| <code>Number</code> | DiscoverConfig object or port number to run discovery server on |
| cb | <code>function</code> | callback |

