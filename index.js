/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

/**
 @class mplexnet
 */

var Parser = require("./lib/parser");
var Network = require("./lib/mplexnet");

var fs = require('fs');

// mock data for tests:

var aspects = fs.readFileSync('./data/Aspects.txt', 'utf8');
var nodes = fs.readFileSync('./data/Nodes.txt', 'utf8');
var edges = fs.readFileSync('./data/edges.txt', 'utf8');


var parser = new Parser();
aspects = parser.readAspects(aspects);
nodes = parser.readNodes(nodes);
edges = parser.readEdges(edges);
var network = new Network(nodes, edges, aspects);

var nodelayers = network.nodelayers;
nodelayers.each(function(nlayer) {
   console.log("Nodelayer Id: " + nlayer.get("id"));
});


/**
 * Private Methods
 */

/*
 * Public Methods
 */

/**
 * Method responsible to say Hello
 *
 * @example
 *
 *     mplexnet.hello('biojs');
 *
 * @method hello
 * @param {String} name Name of a person
 * @return {String} Returns hello name
 */


