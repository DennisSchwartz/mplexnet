/*
    This File creates a namespace containing all the different modules for the mplexnet component
 */

var exports = {};

exports.Network = require('./network');
exports.Layer = require('./layer');
exports.Node = require('./node');
exports.NodeCollection = require('./nodecol');
exports.Nodelayer = require('./nodelayer');
exports.NodelayerCollection = require('./nodelayers');
exports.Edge = require('./edge');
exports.EdgeCollection = require('./edgecol');

module.exports = exports;