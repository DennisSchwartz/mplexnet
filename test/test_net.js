/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

// chai is an assertion library
var chai = require('chai');
// register alternative styles
// @see http://chaijs.com/api/bdd/
var expect = require('chai').expect;
var should = chai.should();
var _ = require('lodash');
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

// mock data for tests:

var aspects = fs.readFileSync('./data/Aspects.txt', 'utf8');
var nodes = fs.readFileSync('./data/Nodes.txt', 'utf8');
var edges = fs.readFileSync('./data/edges.txt', 'utf8');

var input = {};
input.aspects = aspects;
input.nodes = nodes;
input.edges = edges;


/*
    Test the network module
 */

describe('Multilayer Network', function () {
    describe('Node module', function () {
        describe('Node', function () {
            var good;
            beforeEach(function () {
                good = new Node('test');
            });
            it('should exist', function () {
                should.exist(good);
            });
            it('should have an id', function () {
                good.get('id').should.not.equal('undefined');
            });
            it('should have the right id', function () {
                good.get('id').should.equal('test');
            });
            it('should be an instance of the Node model', function() {
                expect(good).to.be.an.instanceOf(Node);
            });
            it('should reject ids that are not strings or numbers', function () {
                var bad = function () { new Node([]) };
                expect(bad).to.throw(TypeError);
            });
        });
        describe('Node collection', function () {

        })
    });
    describe('Layer module', function () {

    })
});



describe('Nodelayer module', function (){
    describe('Nodelayer', function() {
        before(function () {
            this.aspects = mplexnet.parse(aspects)[0];
            this.nodes = mplexnet.parse(nodes, true);
            this.edges = mplexnet.parse(edges, true);
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
            this.aspects = mplexnet.parse(aspects)[0];
            this.nodes = mplexnet.parse(nodes, true);
            this.edges = mplexnet.parse(edges, true);
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
            expect(this.edge.get('name')).to.be.defined;
        });

        it('should assign an name automatically based on the node ids', function() {
            (this.edge.get('id')).should.eql('1-2');
        });
    })
});

describe('Mplexnet Module:', function() {
    describe('Network from multiple files', function() {
        beforeEach(function(){
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

        it('should create the right number of edges', function () {
            var edges = this.network.get('edges');
            expect(edges.length).to.equal(10);
        });
    });
    describe('Network from single file', function () {
        var network;
        before(function () {
            //var file = fs.readFileSync('./data/single.txt', 'utf-8');
            var file = fs.readFileSync('../Thesis/dataprep/500.csv', 'utf-8');
            var input = {};
            //var test = 'source,l1,l2,target,l1,l2\n1,A,X,2,A,X\n1,A,X,1,B,X\n1,A,X,4,B,X\n1,B,X,1,B,Y\n1,B,X,3,B,X\n\
            //            1,B,X,4,B,X\n3,B,X,4,B,X\n4,B,X,3,A,Y\n3,A,Y,3,A,X\n3,A,Y,2,A,Y';

            input.data = file;
            //file = file.replace(/ /g, ''); //remove whitespace
            //var input = Baby.parse(file);//, { header: true });
            input.options = {
                inputFiles: 'single',
                inputFileDelimiter: ';',
                sourceFieldLabel: 'source_name',
                targetFieldLabel: 'target_name'
            };
            network = new Network(input);
        });
        it('should do sth', function () {
            network.get('edges').each(function (x) {
                console.log('Source: ' + x.get('source'));
                console.log('Target: ' + x.get('target'));
            })
        });
    });
});
