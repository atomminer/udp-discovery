##### [<< Back to index](README.md)

<a name="module_DiscoveryClient"></a>

## DiscoveryClient
Local network discovery service using UDP broadcast messages and UDP server(s) to locate running services in the local network

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

* [DiscoveryClient](#module_DiscoveryClient)
    * _static_
        * [.Discover](#module_DiscoveryClient.Discover) ⇐ <code>EventEmitter</code>
            * [new Discover(config)](#new_module_DiscoveryClient.Discover_new)
            * [.running](#module_DiscoveryClient.Discover+running)
            * [.config](#module_DiscoveryClient.Discover+config)
            * [.address](#module_DiscoveryClient.Discover+address)
            * [.discoveryMessage](#module_DiscoveryClient.Discover+discoveryMessage)
            * [.start()](#module_DiscoveryClient.Discover+start)
            * [.stop()](#module_DiscoveryClient.Discover+stop)
            * [.send(msg, port, host)](#module_DiscoveryClient.Discover+send)
        * [.discover(configOrPort, cb)](#module_DiscoveryClient.discover)
    * _inner_
        * [~DiscoverConfig](#module_DiscoveryClient..DiscoverConfig) : <code>object</code>

<a name="module_DiscoveryClient.Discover"></a>

### discovery.Discover ⇐ <code>EventEmitter</code>
UDP discovery class. Can be extended to fit specific needs

**Kind**: static class of [<code>DiscoveryClient</code>](#module_DiscoveryClient)  
**Extends**: <code>EventEmitter</code>  
**Emits**: <code>event:error</code>, <code>event:start</code>, <code>event:stop</code>, <code>event:found</code>  
**Access**: public  

* [.Discover](#module_DiscoveryClient.Discover) ⇐ <code>EventEmitter</code>
    * [new Discover(config)](#new_module_DiscoveryClient.Discover_new)
    * [.running](#module_DiscoveryClient.Discover+running)
    * [.config](#module_DiscoveryClient.Discover+config)
    * [.address](#module_DiscoveryClient.Discover+address)
    * [.discoveryMessage](#module_DiscoveryClient.Discover+discoveryMessage)
    * [.start()](#module_DiscoveryClient.Discover+start)
    * [.stop()](#module_DiscoveryClient.Discover+stop)
    * [.send(msg, port, host)](#module_DiscoveryClient.Discover+send)

<a name="new_module_DiscoveryClient.Discover_new"></a>

#### new Discover(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>DiscoverConfig</code> \| <code>Number</code> | DiscoverConfig configuration object or port number |

<a name="module_DiscoveryClient.Discover+running"></a>

#### discover.running
If Discovery is still running

**Kind**: instance property of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
**Read only**: true  
<a name="module_DiscoveryClient.Discover+config"></a>

#### discover.config
Current instance config object.

**Kind**: instance property of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
**Read only**: true  
<a name="module_DiscoveryClient.Discover+address"></a>

#### discover.address
Last known address discovery socket was/is working on. See: Socket::AddressInfo

**Kind**: instance property of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
**Read only**: true  
<a name="module_DiscoveryClient.Discover+discoveryMessage"></a>

#### discover.discoveryMessage
Message to use for discover handshake. Can be overloaded by subclass

**Kind**: instance property of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
**Read only**: true  
<a name="module_DiscoveryClient.Discover+start"></a>

#### discover.start()
Start UDP scan

**Kind**: instance method of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
<a name="module_DiscoveryClient.Discover+stop"></a>

#### discover.stop()
Stop UDP scan

**Kind**: instance method of [<code>Discover</code>](#module_DiscoveryClient.Discover)  
<a name="module_DiscoveryClient.Discover+send"></a>

#### discover.send(msg, port, host)
Send message

**Kind**: instance method of [<code>Discover</code>](#module_DiscoveryClient.Discover)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> \| <code>Buffer</code> \| <code>object</code> | Message to send |
| port | <code>Number</code> | Port number |
| host | <code>string</code> | Host to send message to |

<a name="module_DiscoveryClient.discover"></a>

### discovery.discover(configOrPort, cb)
Simple way to discover/broadcast message with callback

**Kind**: static method of [<code>DiscoveryClient</code>](#module_DiscoveryClient)  

| Param | Type | Description |
| --- | --- | --- |
| configOrPort | <code>DiscoverConfig</code> \| <code>Number</code> | DiscoverConfig object or port number to run discovery on |
| cb | <code>function</code> | callback |

<a name="module_DiscoveryClient..DiscoverConfig"></a>

### DiscoveryClient~DiscoverConfig : <code>object</code>
Default UDP discovery config

**Kind**: inner namespace of [<code>DiscoveryClient</code>](#module_DiscoveryClient)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| port | <code>Number</code> | <code>10001</code> | Default port to scan network nodes on |
| tomeout | <code>Number</code> | <code>1500</code> | Default length of scan in ms |
| broadcast | <code>string</code> | <code>&quot;&#x27;255.255.255.255&#x27;&quot;</code> | Network broadcast address. Use default to broadcast initla messages thtough all available interfaces (tested on Linux), or calculate you own broadcast  address for specific interface using its IP and netmask via following formula `broadcast = (~netmask) | (IP)`. IPv6 should use `ff:ff:ff:ff:ff:ff` as a broadcast address |
| handshake | <code>string</code> |  | Message to broadcast |

