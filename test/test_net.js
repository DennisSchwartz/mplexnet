/*
 * mplexnet
 * https://github.com/DennisSchwartz/mplexnet
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

// chai is an assertion library
var chai = require('chai');

// @see http://chaijs.com/api/assert/
var assert = chai.assert;

var _ = require('lodash');

// register alternative styles
// @see http://chaijs.com/api/bdd/
var expect = require('chai').expect;
var should = chai.should();

// requires your main app (specified in mplexnet.js)

var mplexnet = require('../lib/mplexnet');
var Node = mplexnet.Node;
var Edge = mplexnet.Edge;
var EdgeCol = mplexnet.EdgeCollection;
var Layer = mplexnet.Layer;
var Nodelayer = mplexnet.Nodelayer;
var Nodelayers = mplexnet.NodelayerCollection;
var Network = mplexnet.Network;
var fs = require('fs');
var Options = mplexnet.Options;
var Baby = require("babyparse");

var parse = function (input, header) {
    input = input.replace(/ /g, ''); //remove whitespace
    if (!header) header = false;
    return Baby.parse(input, {
        header: header,
        skipEmptyLines: true
    }).data;
};


// mock data for tests:

var aspects = fs.readFileSync('./data/Aspects.txt', 'utf8');
var nodes = fs.readFileSync('./data/Nodes.txt', 'utf8');
var edges = fs.readFileSync('./data/edges.txt', 'utf8');

var input = {};
input.aspects = aspects;
input.nodes = nodes;
input.edges = edges;


/*
 Node Model
 */

describe('Node Model', function() {
    describe('Node', function() {
        beforeEach(function() {
            this.id = 1;
            this.node = new Node(this.id);
        });

        it('should be created', function() {
            should.exist(this.node);
        });

        it('should contain a name', function() {
            should.exist(this.node.get('id'));
        });

        it('should have a name as has been set', function() {
            expect(this.node.get("id")).to.equal(this.id);
        });

        it('should be an instance of the Node model', function() {
            expect(this.node).to.be.an.instanceOf(Node);
        })
    });
});

describe('Nodelayer module', function (){
    describe('Nodelayer', function() {
        before(function () {
            this.aspects = parse(input.aspects)[0];
            this.nodes = parse(input.nodes, true);
            this.edges = parse(input.edges, true);
            this.node = new Node(this.nodes[0].name);
            this.layer = new Layer(this.aspects, this.nodes[0]);
            this.nodelayer = new Nodelayer(this.nodes[0].id, this.node, this.layer);
        });

        it('should not be undefined', function() {
            should.exist(this.nodelayer);
        });

        it('should contain a node', function() {
            var node = this.nodelayer.get("node");
            should.exist(node);
            expect(node).to.be.an.instanceOf(Node);
        });

        it('should contain a layer object', function() {
            expect(this.nodelayer.get("layer")).not.to.be.undefined;
        });

        it('should contain the right layer object', function() {
            var layer = this.nodelayer.get("layer");
            expect(layer.get("Time")).to.eql("now");
        });
    });
});


describe('Edge Module:', function() {
    describe('Edge', function() {
        before(function() {
            this.aspects = parse(input.aspects)[0];
            this.nodes = parse(input.nodes, true);
            this.edges = parse(input.edges, true);
            var node1 = new Node(this.nodes[0].name);
            var node2 = new Node(this.nodes[1].name);
            var layer1 = new Layer(this.aspects, this.nodes[0]);
            var layer2 = new Layer(this.aspects, this.nodes[1]);
            var nodelayer1 = new Nodelayer(this.nodes[0].id, node1, layer1);
            var nodelayer2 = new Nodelayer(this.nodes[1].id, node2, layer2);
            this.edge = new Edge(nodelayer1.get("id"), nodelayer2.get("id"), 'undirected');
        });

        it('should contain a source nodelayer id of type String', function() {
            should.exist(this.edge.get('source'));
            expect(this.edge.get('source')).to.be.a('string');
        });

        it('should contain a target nodelayer id of type String', function() {
            should.exist(this.edge.get('target'));
            expect(this.edge.get('target')).to.be.a('string');
        });

        it('should have a defined name', function() {
            expect(this.edge.get('id')).to.be.defined;
        });

        it('should assign an name automatically based on the node ids', function() {
            (this.edge.get('id')).should.eql('1-2');
        });
    })
});

describe('Mplexnet Module:', function() {
    describe('Network from multiple files', function() {
        beforeEach(function(){
            input.options = {
                inputFormat: 'split',
                inputFileDelimiter: ',',
                sourceFieldLabel: 'source',
                targetFieldLabel: 'target',
                loglevel: 0
            };
            this.network = new Network(input);
        });

        it('should contain nodes as nodelayers', function() {
            expect(this.network.get('nodes')).to.be.an.instanceof(Nodelayers);
        });

        it('should contain edges', function() {
            var edges = this.network.get('edges');
            expect(edges).to.be.defined;
            expect(edges).to.be.an.instanceof(EdgeCol);
            expect(edges.length).to.be.above(1);
        });

        it('should contain the aspects of the network', function() {
            expect(this.network.get('aspects')).to.be.defined;
        });

        it('should createNetwork the right number of edges', function () {
            var edges = this.network.get('edges');
            expect(edges.length).to.equal(10);
        });
    });
    describe('Network from single file', function () {
        var network;
        before(function () {
            //var file = fs.readFileSync('./data/single.txt', 'utf-8');
            var file = fs.readFileSync('../Thesis/dataprep/data.csv', 'utf-8');
            var input = {};
            input.data = file;
            //file = file.replace(/ /g, ''); //remove whitespace
            //var input = Baby.parse(file);//, { header: true });
            input.options = {
                inputFormat: 'csv',
                inputFileDelimiter: ';',
                sourceFieldLabel: 'source_name',
                targetFieldLabel: 'target_name',
                loglevel: 0
            };
            network = new Network(input);
        });
        it('should contain nodes as nodelayers', function() {
            expect(network.get('nodes')).to.be.an.instanceof(Nodelayers);
        });

        it('should contain edges', function() {
            var edges = network.get('edges');
            expect(edges).to.be.defined;
            expect(edges).to.be.an.instanceof(EdgeCol);
            expect(edges.length).to.be.above(1);
        });

        it('should contain the aspects of the network', function() {
            expect(network.get('aspects')).to.be.defined;
        });

        it('should createNetwork the right number of edges', function () {
            var edges = network.get('edges');
            expect(edges.length).to.equal(66);
        });
    });
    describe('Network from XGMML file', function () {
        var network;
        before(function () {
            var file = fs.readFileSync('../Thesis/dataprep/test.xml', 'utf-8');
            var input = {};
            input.data = file;
            input.options = {
                inputFormat: 'xgmml',
                logLevel: 3
            };
            network = new Network(input);
        });
        it('should contain nodes as nodelayers', function() {
            expect(network.get('nodes')).to.be.an.instanceof(Nodelayers);
        });

        it('should contain edges', function() {
            var edges = network.get('edges');
            expect(edges).to.be.defined;
            expect(edges).to.be.an.instanceof(EdgeCol);
            expect(edges.length).to.be.above(1);
        });

        it('should contain the aspects of the network', function() {
            expect(network.get('aspects')).to.be.defined;
        });

        it('should createNetwork the right number of edges', function () {
            var edges = network.get('edges');
            expect(edges.length).to.equal(36);
        });
    });
    describe('Network manipulation', function () {
        var network;
        var node = [{
            group: 'nodes',
            data: {
                label: 'Test',
                layer: 1
            }
        }];
        var edge = [{
            group: 'edges',
            data: {
                source: 'A1',
                target: 'B2',
                weight: 2.3
            }
        }];
        var layer = [{
            group: 'layers',
            data: {
                label: 'newLayer',
                aspects: {
                    '1': '3'        // Does this actually work??
                }
            }
        }];
        before(function () {
            var file = fs.readFileSync('../Thesis/dataprep/test.xml', 'utf-8');
            var input = {};
            input.data = file;
            input.options = {
                inputFormat: 'xgmml',
                logLevel: 0
            };
            network = new Network(input);
        });
        it('should allow users to add nodes', function () {
            var before = network.get('nodes').length;
            network.add(node);
            var after = network.get('nodes').length;
            expect(after).to.equal( before + 1 );
        });
        it('should allow users to add edges', function () {
            var before = network.get('edges').length;
            network.add(edge);
            var after = network.get('edges').length;
            expect(after).to.equal( before + 1 );
        });
        it('should allow users to add layers', function () {
            var before = network.get('layers').length;
            network.add(layer);
            var after = network.get('layers').length;
            //console.log(network.get('layers'));
            expect(after).to.equal( before + 1 );
        });
        it('should allow users to remove nodes', function () {
            var before = network.get('nodes').length;
            var n = network.get('nodes').get(node[0].data.label + node[0].data.layer);
            expect(n).to.be.defined;
            network.remove([{ group: "nodes", id: n.get('id')}]);
            var after = network.get('nodes').length;
            n = network.get('nodes').get(node[0].data.label + node[0].data.layer);
            expect(after).to.equal(before - 1);
            expect(n).to.be.undefined;
        });
        it('should allow users to remove edges', function () {
            var before = network.get('edges').length;
            var e = network.get('edges').get(edge[0].data.source + '-' + edge[0].data.target);
            var id = e.get('id');
            expect(e).to.be.defined;
            network.remove([{ group: "edges", id: id }]);
            e = network.get('edges').get(edge[0].data.source + '-' + edge[0].data.target);
            expect(e).to.be.undefined;
            var after = network.get('edges').length;
            expect(after).to.equal(before - 1);
        });
        it('should allow users to remove layers', function () {
            var before = network.get('layers').length;
            var l = network.get('layers').get(layer[0].data.aspects['1']);
            var id = l.get('id');
            expect(l).to.be.defined;
            network.remove([{ group: "layers", id: id }]);
            l = network.get('layers').get(layer[0].data.aspects['1']);
            expect(l).to.be.undefined;
            var after = network.get('layers').length;
            expect(after).to.equal(before - 1);
        });
    });
});