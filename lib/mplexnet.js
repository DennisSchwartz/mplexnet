/*
 * mplexnet
 * https://github.com/DennisSchwartz/mplexnet
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */


var Backbone = require("backbone");
var _ = require("lodash");
var Baby = require('babyparse');
var DOMParser = require('xmldom').DOMParser;

/*
 * These are the default options for a network
 *
 *   Log levels:
 *       1: Errors and important info
 *       2: More info
 *       3: Detail debug messages incl. data
 */
var Options = {
    inputFiles: 'csv',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target',
    loglevel: 0
};


/*
 Node
 */

var Node = Backbone.Model.extend({
    initialize: function(id) {
        if (Options.loglevel > 2) console.log('Node created with id: ' + id);
        this.set("id", id);
    }
});

var NodeCol = Backbone.Collection.extend({
    model: Node
});

/*
 Layer
 */

var Layer = Backbone.Model.extend({
    defaults: {
        group: "layers"
    },
    initialize: function(aspects, values, id, label) {
        var s = '';
        for (var i=0;i<aspects.length;i++) {
            this.set(aspects[i], _(values).get(aspects[i]));
            s += _(values).get(aspects[i]);
        }
        if (id) {
            this.set("id", id);
        } else {
            this.set('id', s.toString());
        }
        if (label) this.set('label', label);
        if (Options.loglevel > 2) console.log('Layer created: ' + this);
    }
});

var LayerCol = Backbone.Collection.extend({
    model: Layer,
    byAspect: function (aspect) {
        filtered = this.filter(function (layer) {
            return layer.get(aspect);
        });
        return new LayerCol(filtered);
    }
});

/*
 Nodelayer
 */

var Nodelayer = Backbone.Model.extend({
    defaults: {
        group: "nodes"
    },
    initialize: function(id, node, layer) {
        this.set("id", id);
        this.set("node", node);
        this.set("layer", layer);
        if (Options.loglevel > 2) console.log('Nodelayer created: ' + this);
    }
});

var Nodelayers = Backbone.Collection.extend({
    model: Nodelayer,
    byLayer: function(layer) {
        var filtered = this.filter(function (nodelayer) {
            return nodelayer.get('layer') === layer;
        });
        return new Nodelayers(filtered);
    },
    byNode: function(node) {
        var filtered = this.filter(function (nodelayer) {
            return nodelayer.get('node') === node;
        });
        return new Nodelayers(filtered);
    }
});

/*
 Edge
 */

var Edge = Backbone.Model.extend({
    defaults: {
        group: "edges"
    },
    initialize: function(source, target, type, id) {
        this.set("source", source);
        this.set("target", target);
        if (type === 'directed' || type === 'undirected') {
            this.set("type", type);
        } else {
            this.set("type", 'undirected');
        }
        if (typeof id != 'undefined') {
            this.set("id", id);
        } else {
            id = source + '-' + target;
            this.set("id", id);
        }
        if (Options.loglevel > 2) console.log('Edge created: ' + this);
    }
});

var EdgeCol = Backbone.Collection.extend({
    model: Edge,
    byNode: function (id) {
        var filtered = this.filter(function (edge) {
            return edge.get('source') === id || edge.get('target') === id;
        });
        return new EdgeCol(filtered);
    },
    inLayer: function(l, net) {
        var filtered = this.filter(function (edge) {
            return net.get('nodes').get(edge.get('source')).get('layer') === l && net.get('nodes').get(edge.get('target')).get('layer') === l;
        });
        return new EdgeCol(filtered);
    },
    byLayer: function(l, net) {
        var filtered = this.filter(function (edge) {
            return net.get('nodes').get(edge.get('source')).get('layer') === l || net.get('nodes').get(edge.get('target')).get('layer') === l;
        });
        return new EdgeCol(filtered);
    },
    update: function(id) {
        // get all edges associated with the node with this id
        var edges = this.byNode(id);
        edges.each(function (e) {
            this.remove(e);
        });
    }
});

/*
 Network
 */

var Network = Backbone.Model.extend({

    // initialize with String from Parser Module
    initialize: function(input) {
        if (Options.loglevel > 2) console.log("The input is this: " + input);
        // Update Options file according to input.options
        if (input.options) {
            _.forOwn(input.options, function (value, key) {
                Options[key] = value;
            })
        }

        var data = input.data;
        if (input.edges) data = {nodes: input.nodes, edges: input.edges, aspects: input.aspects };
        if (Options.loglevel > 0) console.log('The input format was specified as: ' + Options.inputFiles + " file(s).");
        this.createNetwork(data, Options.inputFiles);

    },
    createNetwork: function (data, format) {
        var nodes = new NodeCol();
        var layers = new LayerCol();
        var nodelayers = new Nodelayers();
        var edges = new EdgeCol();
        var sourceID, source, targetID, target, i;

        var parse = function (input, header) {
            input = input.replace(/ /g, ''); //remove whitespace
            if (!header) header = false;
            return Baby.parse(input, {
                header: header,
                skipEmptyLines: true,
                delimiter: Options.inputFileDelimiter
            }).data;
        };

        if (format === 'xgmml') {
            if (Options.loglevel > 2) console.log('Parsing input as XGMML!');
            var parser = new DOMParser();
            var xml = parser.parseFromString(data, 'text/xml');
            var graph = xml.documentElement;

            // Create network from xml data
            var layers_ = [];
            var nodes_ = [];
            var edges_ = [];

            // Parse XML
            var c = graph.childNodes;
            var directed = graph.getAttribute('directed') === 1;
            for (var e in graph.childNodes) {
                var element = graph.childNodes[e];
                // Get layers
                if (element.nodeName === 'att' && element.getAttribute('id') === 'layers') {
                    // Get child nodes
                    var l = element.childNodes;
                    for (i=0;i< l.length;i++) {
                        if (l[i].nodeName === 'att') {
                            var id = l[i].getAttribute('id');
                            layers_.push(id);
                            if (!layers.get(id)) layers.add(new Layer(['1'], { 1: id }, id))
                        }
                    }
                }
                // Get nodes
                if (element.nodeName === 'node') {
                    // Extract attributes
                    var attributes = element.attributes;
                    var res = {};
                    for (i=0;i<element.attributes.length;i++) {
                        res[attributes[i].name] = attributes[i].value;
                    }
                    nodes_.push(res);
                    if (!nodes.get(res['id'])) nodes.add(new Node(res['id']));
                }
                // Get edges
                if (element.nodeName === 'edge') {
                    // Extract attributes
                    attributes = element.attributes;
                    res = {};
                    for (i=0;i<element.attributes.length;i++) {
                        res[attributes[i].name] = attributes[i].value;
                    }
                    // Extract att node with layers
                    attributes = element.getElementsByTagName('att')[0].attributes;
                    for (i=0;i<attributes.length;i++) {
                        res[attributes[i].name] = attributes[i].value;
                    }
                    source = nodes.get(res['source']);
                    if (!source) {
                        source = new Node(res['source']);
                        nodes.add(source);
                    }
                    target = nodes.get(res['target']);
                    if (!target) {
                        target = new Node(res['target']);
                        nodes.add(target);
                    }
                    var sourcelayer = layers.get(res["sourcelayer"]);
                    if (!sourcelayer) {
                        sourcelayer = new Layer(['1'], res["sourcelayer"]);
                        layers.add(sourcelayer);
                    }
                    var targetlayer = layers.get(res["targetlayer"]);
                    if (!targetlayer) {
                        targetlayer = new Layer(['1'], res["targetlayer"]);

                        layers.add(targetlayer);
                    }
                    sourceID = res['source'] + res['sourcelayer'];
                    targetID = res['target'] + res['targetlayer'];
                    var sourceNL = nodelayers.get(sourceID);
                    if (!sourceNL) {
                        sourceNL = new Nodelayer(sourceID, source, sourcelayer);
                        nodelayers.add(sourceNL);
                    }
                    var targetNL = nodelayers.get(targetID);
                    if (!targetNL) {
                        targetNL = new Nodelayer(targetID, target, targetlayer);
                        nodelayers.add(targetNL);
                    }

                    var temp = new Edge(sourceID, targetID);
                    edges.add(temp);
                    edges_.push(res);

                }
            }

        } else if (format === 'csv') {

            var sourceFieldLabel = Options.sourceFieldLabel;
            var targetFieldLabel = Options.targetFieldLabel;
            //var data = input.data;
            data = parse(data);
            if (Options.loglevel > 2) { console.log('The input data was parsed as: '); console.log(data); }
            var fields = data.shift();
            var sin = fields.indexOf(sourceFieldLabel);
            var tin = fields.indexOf(targetFieldLabel);


            var aspects_ = [];
            for (i=sin+1;i<tin;i++) {
                aspects_.push(fields[i]);
            }

            /*
             Go through every line and build nodes, layers and nodelayers
             */

            for (i=0;i<data.length;i++) {
                var line = data[i];
                /*
                 Source node
                 */
                sourceID = line[sin];
                var node = nodes.findWhere({id: sourceID});
                if (!node) {
                    node = new Node(sourceID);
                    nodes.add(node);
                }
                var obj = {};
                var lid = '';
                for (var j=sin+1;j<=sin+aspects_.length;j++) {
                    obj[fields[j]] = line[j];
                    lid = lid + line[j];
                }
                var layer = layers.get(lid);
                if (!layer) {
                    layer = new Layer(aspects_, obj, lid);
                    layers.add(layer);
                }
                var snlid = sourceID + lid;
                source = nodelayers.get(snlid);
                if (!source) {
                    source = new Nodelayer(snlid, node, layer);
                    nodelayers.add(source);
                }
                /*
                 Target node
                 */
                targetID = line[tin];
                node = undefined;
                node = nodes.findWhere({id: targetID});
                if (!node) {
                    node = new Node(targetID);
                    nodes.add(node);
                }
                obj = {};
                lid = '';
                for (j=tin+1;j<=tin+aspects_.length;j++) {
                    obj[fields[j]] = line[j];
                    lid = lid + line[j];
                }
                layer = undefined;
                layer = layers.get(lid);
                if (!layer) {
                    layer = new Layer(aspects_, obj, lid);
                    layers.add(layer);
                }
                var tnlid = targetID + lid;
                target = nodelayers.get(tnlid);
                if (!target) {
                    target = new Nodelayer(tnlid, node, layer);
                    nodelayers.add(target);
                }
                /*
                 Edge
                 */
                edges.add(new Edge(source.get('id'), target.get('id'), '', snlid+tnlid));
            }
        } else if (format === 'split') { //TODO: Change format name to 'split'

            var inputNodes = parse(data.nodes, true);
            var inputEdges = parse(data.edges,true);
            var inputAspects = parse(data.aspects)[0];

            /*
             aspects
             */
            var aspects = [];
            var dims = inputAspects.length;
            for (i=0;i<dims;i++) {
                aspects.push(inputAspects[i]);
            }

            /*
             nodes (one per name)
             */
            var names = [];
            for (i=0;i<inputNodes.length;i++) {
                names.push(_(inputNodes[i]).get("name"));
            }
            names = _.uniq(names);
            for (i=0;i<names.length;i++) {
                nodes.add(new Node(names[i]));
            }

            /*
             nodelayers (one per ID)
             */
            for (i=0;i<inputNodes.length;i++) {
                layer = new Layer(aspects, inputNodes[i]);
                layers.add(layer);
                var curname = _(inputNodes[i]).get("name");
                var curid = _(inputNodes[i]).get("id");
                node = nodes.find(function(x) {
                    return x.get("id") === curname;
                });
                temp = new Nodelayer(curid, node, layer);
                nodelayers.add(temp);
            }

            /*
             edges
             */
            for (i=0;i<inputEdges.length;i++) {
                var cur = inputEdges[i];
                edges.add(new Edge(_(cur).get('source'), _(cur).get("target"), '', _(cur).get('source') + _(cur).get("target")))
            }

        } else {
            throw 'Please specify a supported input format!';
        }


        this.set("V", nodes);
        this.set("nodes", nodelayers);
        this.set("edges", edges);
        this.set("layers", layers);
    },
    add: function (data) {
        // Add every given entity
        var network = this;
        data.forEach(function (entity) {
            var grp = entity.group;
            var data = entity.data;
            if (grp === 'nodes') {
                //noinspection JSDuplicatedDeclaration
                var layers = network.get('layers');
                var layer = layers.get(data.layer);
                if (layer) {
                    var node = network.get('V').get(data.label);
                    if (!node) {
                        node = new Node(data.label);
                        var v = network.get('V');
                        v.add(node);
                        network.set('V', v);
                    }
                    var n = new Nodelayer(node.get('id') + layer.get('id'), node, layer);
                    var nodes = network.get('nodes');
                    nodes.add(n);
                    network.set('nodes', nodes);
                } else {
                    console.log('Layer of added node not found! Please create a new layer first.');
                    console.log(entity);
                }
            } else if (grp === 'edges') {
                var source = network.get('nodes').get(data.source).get('id');
                var target = network.get('nodes').get(data.target).get('id');
                if (source && target) {
                    var edges = network.get('edges');
                    edges.add(new Edge(source, target));
                    network.set('edges', edges);
                } else {
                    console.log('Error: Source or target of this edge don\'t exist!');
                    console.log(entity);
                }
            } else if (grp === 'layers') {
                var aspects = Object.keys(data.aspects);
                //noinspection JSDuplicatedDeclaration
                var layers = network.get('layers');
                layers.add(new Layer(aspects, data.aspects, undefined, data.label));
                network.set('layers', layers);
            } else {
                console.log('Error: Some entities are not part of a recognized group and will not be added!');
            }
        });
    },
    remove: function (data) {
        var network = this;
        var nodes = network.get('nodes');
        var edges = network.get('edges');
        var layers = network.get('layers');
        data.forEach(function (entity) {
            var grp = entity.group;
            var id = entity.id;
            if (grp === 'nodes') {
                var node = nodes.get(id).get('node');
                nodes.remove(id);
                edges.update(id);
                if (nodes.byNode(node).length < 1) {
                    var v = network.get('V');
                    v.remove(node);
                }
                network.trigger('changed:node');
            } else if (grp === 'edges') {
                edges.remove(id);
                network.trigger('changed:edge');
            } else if (grp === 'layers') {
                var l = network.get('layers').get(id);
                var rem = nodes.byLayer(l);
                rem.each(function (n) {
                    nodes.remove(n);
                });
                rem = edges.byLayer(l, network);
                rem.each(function (n) {
                    edges.remove(n);
                });
                layers.remove(l)
            }
        });
    }
});


//var h = function(input) {
//    var res = input? input : 'hello!';
//    console.log(res);
//};


var exports = {};

exports.Network = Network;
exports.Layer = Layer;
exports.Node = Node;
exports.NodeCollection = NodeCol;
exports.Nodelayer = Nodelayer;
exports.NodelayerCollection = Nodelayers;
exports.Edge = Edge;
exports.EdgeCollection = EdgeCol;
exports.Options = Options;

module.exports = exports;