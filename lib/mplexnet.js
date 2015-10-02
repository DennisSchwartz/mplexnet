/*
    This File creates a namespace containing all the different modules for the mplexnet component
 */

var exports = {};

exports.Network = require('./network');
exports.Node = require('./node/node');
exports.NodeCollection = require('./node/nodecol');
exports.Layer = require('./layer/layer');
exports.LayerCollection = require('./layer/layercol');
exports.Nodelayer = require('./nodelayer/nodelayer');
exports.NodelayerCollection = require('./nodelayer/nodelayers');
exports.Edge = require('./edge/edge');
exports.EdgeCollection = require('./edge/edgecol');

module.exports = exports;