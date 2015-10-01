/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */


var Parser = require("./lib/parser");
var Network = require("./lib/network");

var fs = require('fs');

// mock data for tests:

//var aspects = fs.readFileSync('./data/Aspects.txt', 'utf8');
//var nodes = fs.readFileSync('./data/Nodes.txt', 'utf8');
//var edges = fs.readFileSync('./data/edges.txt', 'utf8');
//
//input = {};
//input.aspects = aspects;
//input.nodes = nodes;
//input.edges = edges;

var input = fs.readFileSync('./data/single.txt', 'utf8');

var network = new Network(input);

var nodelayers = network.get("nodes");
nodelayers.each(function(nlayer) {
   console.log("Nodelayer Id: " + nlayer.get("id"));
});
var edges_ = network.get("edges");
edges_.each(function (edge) {
   console.log("Source: " + edge.get("source") + ", Target: " + edge.get("target"));
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


