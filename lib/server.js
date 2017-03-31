// Modified from the MIT licensed https://github.com/Operational-Transformation/ot.js
// This works in a node environment, for client you need Quill and can call: var Delta = Quill.import('delta');
var Delta = require('quill-delta');

if (typeof ot === 'undefined') {
  var ot = {};
}

ot.Server = (function (global) {
  'use strict';

  /**
   * Creates a quill-ot server
   * @param {String} Initial quill document (get with quill.getContents())
   * @param {Object} Document The current state of the document as a delta
   */
  function Server(document, deltas) {
    this.document = new Delta(document);
    // Array of quill deltas that show past changes
    this.deltas = deltas || [];
  }

  /**
   * Call on receive of a delta from a client.
   * @param {Number} version The version sent from the client
   * @param {Object} Delta Delta received from client
   */
  Server.prototype.receiveDelta = function(version, delta) {
    if (version < 0 || this.deltas.length < version) {
      throw new Error("given delta version not in history");
    }

    // Find all deltas that the client didn't know of when it sent the
    // delta ...
    var concurrentDeltas = this.deltas.slice(version);

    var recievedDelta = new Delta(delta);

    // ... and transform the delta against all these deltas ...
    for (var i = 0; i < concurrentDeltas.length; i++) {
      var currentConcurrentDelta = new Delta(concurrentDeltas[i]);
      recievedDelta = currentConcurrentDelta.transform(recievedDelta, true);
    }

    // ... and apply that on the document
    this.document = this.document.compose(recievedDelta);

    // Store delta in history.
    this.deltas.push(recievedDelta);

    // It's the caller's responsibility to send the delta to all connected
    // clients and an acknowledgement to the creator.
    return recievedDelta;
  };

  return Server;

}(this));

if (typeof module === 'object') {
  module.exports = ot.Server;
}