const choo = require('./choo');
const duet = require('duet');
const duetLocationChannel = require('duet-location/channel');
const duetVirtualDOMChannel = require('duet-virtual-dom/channel');

module.exports = chooet;

function chooet (cb, opts) {
  opts = typeof opts === 'object' ? opts : {};
  opts.channels = Array.isArray(opts.channels) ? opts.channels : [];
  const channels = opts.channels.concat(duetLocationChannel, duetVirtualDOMChannel);
  delete opts.channels;
  duet(channels, cb.bind(null, choo), opts);
}
