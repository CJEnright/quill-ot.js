# Quill-ot  
An [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) implementation for use with the web based rich text editor [Quill](https://quilljs.com/).  This library was based on [Operational-Transformation](http://operational-transformation.github.io/) created by Tim Baumann.  As of right now I'm not sure if I'll try to add this library to the [Operational-Transformation Github group](https://github.com/Operational-Transformation) because I added some breaking changes and function renaming to better represent what each means.

About OT (Operational Transformation)
------
OT is a way to implement real time collaboration on data, and in this case specifically rich text from Quill.  In this library we use Quill's own operation representation (Deltas) to show that text has either been retained, inserted, or deleted.  If you want more in depth detail, you can again visit [Operational-Transformation](http://operational-transformation.github.io/) or read the [original paper on OT](http://dl.acm.org/citation.cfm?id=66963).

Future
------
As of right now I'm not sure if I'll try to add this library to the [Operational-Transformation group](https://github.com/Operational-Transformation) because I added some breaking changes and function renaming to better represent what each means (operation became delta).

Sample Code
------
On the server:
```javascript
var server = new ot.Server();

server.broadcast = function(delta) {
  // You're in charge of how you want to send out data
  // Websockets are probably your best bet, i like http://socketcluster.io/
}

function onReceiveDelta(version, delta) {
  var deltaToSend = server.receiveDelta(version, delta);
  server.broadcast(deltaToSend);
}

```


On the client:
```javascript
// Client joining at revision 0
var otClient = new ot.Client(0);

// Overridden method
otClient.sendDelta = function(version, delta) {
  // Send this delta to the server
  // Again, you choose how
}

// Overridden method
otClient.applyDelta = function(delta) {
  quillEditor.updateContents(delta, 'api');
}

// When the user makes a change
quillEditor.on('text-change', function(delta, oldDelta, source) {
  // Make sure the change came from a user (not the api)
  if (source === 'user') {
    otClient.applyFromClient(delta);
  }
});

function onReceiveDelta(delta) {
  // If this delta was sent by this client they need to call `otClient.serverAck()` instead
  otClient.applyFromServer(delta);
}
```  
