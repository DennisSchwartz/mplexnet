/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
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

// requires your main app (specified in index.js)
var net = require('../');

var Node = require('../lib/node');
var NodeCol = require('../lib/nodecol');
var Edge = require('../lib/edge');
var EdgeCol = require('../lib/edgecol');
var Layer = require('../lib/layer');
var Nodelayer = require('../lib/nodelayer');
var Nodelayers = require('../lib/nodelayers');
var Network = require('../lib/mplexnet');
var Parser = require('../lib/parser');
var fs = require('fs');

// mock data for tests:

var aspects = fs.readFileSync('./data/Aspects.txt', 'utf8');
var nodes = fs.readFileSync('./data/Nodes.txt', 'utf8');
var edges = fs.readFileSync('./data/edges.txt', 'utf8');


//var nodes = 'Time,node\n now,1\n now,2\n now,3\n now,4\n then, 1\n then, 2\n then, 3\n then, 4';

//var edges = [
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "1"
//            },
//            "dest": {
//                "aspect1": "now",
//                "name": "4"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "2"
//            },
//            "dest": {
//                "aspect1": "now",
//                "name": "3"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "2"
//            },
//            "dest": {
//                "aspect1": "now",
//                "name": "4"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "1"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "1"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "2"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "2"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "3"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "3"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "now",
//                "name": "4"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "4"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "then",
//                "name": "1"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "2"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "then",
//                "name": "1"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "3"
//            }
//        },
//        {
//            "src": {
//                "aspect1": "then",
//                "name": "2"
//            },
//            "dest": {
//                "aspect1": "then",
//                "name": "3"
//            }
//        }
//    ];

//var edges = 'now, 1, now, 4\n now, 2, now, 3\n now, 2, now, 4\n now, 1, then, 1\n now, 2, then, 2\n now, 3, then, 3\n \
//now, 4, then, 4\n then, 1, then, 2\n then, 1, then, 3\n then, 2, then, 3';



/*
 Parser
 */

describe('Parser Module: ', function() {
    before(function () {
        this.parser = new Parser();
        this.aspects = this.parser.readAspects(aspects);
        this.nodes = this.parser.readNodes(nodes);
        this.edges = this.parser.readEdges(edges);
    });
    describe('Parser', function() {
        it('should create a csv parser object', function() {
            expect(this.parser).to.exist;
        });
    })
});

/*
 Node Model
 */

describe('Node Model', function() {
    describe('Node', function() {
        beforeEach(function() {
            this.name = 1;
            this.node = new Node(this.name);
        });

        it('should be created', function() {
            should.exist(this.node);
        });

        it('should contain a name', function() {
            should.exist(this.node.get('name'));
        });

        it('should have a name as has been set', function() {
            expect(this.node.get("name")).to.equal(this.name);
        });

        it('should be an instance of the Node model', function() {
            expect(this.node).to.be.an.instanceOf(Node);
        })
    });
});

describe('Nodelayer module', function (){
    describe('Nodelayer', function() {
        before(function () {
            this.parser = new Parser();
            this.aspects = this.parser.readAspects(aspects);
            this.nodes = this.parser.readNodes(nodes);
            this.edges = this.parser.readEdges(edges);
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
            this.parser = new Parser();
            this.aspects = this.parser.readAspects(aspects);
            this.nodes = this.parser.readNodes(nodes);
            this.edges = this.parser.readEdges(edges);
            this.node1 = new Node(this.nodes[0].name);
            this.layer1 = new Layer(this.aspects, this.nodes[0]);
            this.nodelayer1 = new Nodelayer(this.nodes[0].id, this.node1, this.layer1);
            this.node2 = new Node(this.nodes[1].name);
            this.layer2 = new Layer(this.aspects, this.nodes[1]);
            this.nodelayer2 = new Nodelayer(this.nodes[1].id, this.node2, this.layer2);
            this.edge = new Edge(this.nodelayer1, this.nodelayer2);
        });

        it('should contain a src node of type Nodelayer', function() {
            should.exist(this.edge.get('src'));
            expect(this.edge.get('src')).to.be.instanceOf(Nodelayer);
        });

        it('should contain a target node of type Nodelayer', function() {
            should.exist(this.edge.get('target'));
            expect(this.edge.get('target')).to.be.instanceOf(Nodelayer);
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
    describe('Network', function() {
        beforeEach(function(){
            this.parser = new Parser();
            this.aspects = this.parser.readAspects(aspects);
            this.nodes = this.parser.readNodes(nodes);
            this.edges = this.parser.readEdges(edges);
            this.network = new Network(this.nodes, this.edges, this.aspects);
        });

        it('should contain nodes as nodelayers', function() {
            expect(this.network.nodelayers).to.be.an.instanceof(Nodelayers);
        });

        it('should contain edges', function() {
            expect(this.network.edges).to.be.defined;
            expect(this.network.edges).to.be.an.instanceof(EdgeCol);
        });

        it('should contain the aspects of the network', function() {
            expect(this.network.aspects).to.be.defined;
        });
    })
});