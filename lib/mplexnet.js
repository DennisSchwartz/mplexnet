/*
 * mplexnet
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */


var Backbone = require("backbone");
var _ = require("lodash");
var Options = require("./options.js");
var Baby = require('babyparse');

/*
    Node
 */

var Node = Backbone.Model.extend({

    initialize: function(name) {
        this.set("name", name);
    }

});

var NodeCol = Backbone.Collection.extend({
    model: Node
});

/*
    Layer
 */

var Layer = Backbone.Model.extend({

    initialize: function(aspects, node, id) {
        //console.log(node);
        for (var i=0;i<aspects.length;i++) {
            this.set(aspects[i], _(node).get(aspects[i]));
        }
        if (id) this.set("id", id);
    }
});

var LayerCol = Backbone.Collection.extend({
    model: Layer
});

/*
    Nodelayer
 */

var Nodelayer = Backbone.Model.extend({
    initialize: function(id, node, layer) {
        this.set("id", id);
        this.set("node", node);
        this.set("layer", layer);
    }
});

var Nodelayers = Backbone.Collection.extend({
    model: Nodelayer
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
    }

});

var EdgeCol = Backbone.Collection.extend({
    model: Edge,
    newEdge: function (source, target, type, id, weight) {
        //console.log("Src: " + src);
        //console.log("Dest: " + dest);
        //var node1 = this.nodelayers.find(function (x) { return x.get("id") === src }); // This may work?!!
        //var node2 = this.nodelayers.find(function (x) { return x.get("id") === dest }); // This may work?!!
        //console.log("Trying to create edge!");
        //console.log(typeof source.get("id"));
        //console.log(target.get("id"));

        var edge = new Edge(source.get("id"), target.get("id"), type, id);
        //console.log("Edge created!");
        //console.log(edge.get("id"));
        //newEdge.initialize(data);
        this.add(edge);
    }
});

/*
    Network
 */

var Network = Backbone.Model.extend({

    // initialize with String from Parser Module
    initialize: function(input) {

        // Update Options file according to input.options
        if (input.options) {
            _.forOwn(input.options, function (value, key) {
                    Options[key] = value;
                }

            )
        }

        console.log('The input format was specified as: ' + Options.inputFiles + " file(s).");

        if (Options.inputFiles === 'multiple') {
            inputNodes = parse(input.nodes, true);
            inputEdges = parse(input.edges, true);
            inputAspects = parse(input.aspects)[0];
            this.createNetFromMultipleFiles(inputNodes, inputEdges, inputAspects);
        } else if (Options.inputFiles === 'single') {
            // Create new format
            data = input.edges.replace(/ /g, '');
            //console.log('The input data was given as: ' + data);
            var temp = Baby.parse(data, { delimiter: Options.inputFileDelimiter});
            //console.log('The input data was parsed as: ' + temp.data);
            this.createNetFromSingleFile(temp);
        } else {
            throw 'Please specify a correct input format!';
        }
    },
    createNetFromSingleFile: function (input) {

        var sourceFieldLabel = Options.sourceFieldLabel;
        var targetFieldLabel = Options.targetFieldLabel;
        var data = input.data;
        var fields = data.shift();
        var sin = fields.indexOf(sourceFieldLabel);
        var tin = fields.indexOf(targetFieldLabel);

        var nodes = new NodeCol();
        var layers = new LayerCol();
        var nodelayers = new Nodelayers();
        var edges = new EdgeCol();

        var unique = function (collection, obj) {
            return collection.get(obj);
        };

        var aspects_ = [];
        for (var i=sin+1;i<tin;i++) {
            aspects_.push(fields[i]);
        }

        /*
         Go through every line and build nodes, layers and nodelayers
         */

        var nodeIDs = [];
        var layerIDs = [];
        var nodelayerIDs = [];

        var unique = function (col, id) {

        };

        for (i=0;i<data.length;i++) {
            var line = data[i];
            /*
             Source node
             */
            var sourceID = line[sin];
            var node = nodes.findWhere({name: sourceID});
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
            var source = nodelayers.get(snlid);
            if (!source) {
                source = new Nodelayer(snlid, node, layer);
                nodelayers.add(source);
            }
            /*
             Target node
             */
            var targetID = line[tin];
            node = undefined;
            node = nodes.findWhere({name: targetID});
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
            var target = nodelayers.get(tnlid);
            if (!target) {
                target = new Nodelayer(tnlid, node, layer);
                nodelayers.add(target);
            }
            /*
             Edge
             */
            edges.newEdge(source, target, '', snlid + tnlid);

            //if (nodeIDs.indexOf(sourceID) === -1) {
            //    source = new Node(sourceID);
            //    nodeIDs.push(sourceID);
            //    nodes.add(source);
            //} else {
            //    source = nodes.where({name: sourceID});
            //}
            //var obj = {};
            //var lid = '';
            //for (var j=sin+1;j<=sin+aspects_.length;j++) {
            //    obj[fields[j]] = line[j];
            //    lid = lid + line[j];
            //}
            //var layer;
            //if (layerIDs.indexOf(lid) === -1) {
            //    layerIDs.push(lid);
            //    layer = new Layer(aspects_, obj, lid);
            //    layers.add(layer);
            //} else {
            //    layer = layers.get(lid);
            //}
            //var nid = sourceID + lid;
            //var snl;
            //if (nodelayerIDs.indexOf(nid) === -1) {
            //    snl = new Nodelayer(nid, source, layer);
            //    nodelayers.add(snl);
            //    nodelayerIDs.push(nid);
            //} else {
            //    snl = nodelayers.get(nid);
            //}
            ///*
            //    Target node
            // */
            //var targetID = line[tin];
            //var target;
            //if (nodeIDs.indexOf(targetID) === -1) {
            //    target = new Node(targetID);
            //    nodeIDs.push(targetID);
            //    nodes.add(target);
            //} else {
            //    target = nodes.where({name: targetID});
            //}
            //obj = {};
            //lid = '';
            //for (j=tin+1;j<=tin+aspects_.length;j++) {
            //    obj[fields[j]] = line[j];
            //    lid = lid + line[j];
            //}
            //layer = {};
            //if (layerIDs.indexOf(lid) === -1) {
            //    layerIDs.push(lid);
            //    layer = new Layer(aspects_, obj, lid);
            //    layers.add(layer);
            //} else {
            //    layer = layers.get(lid);
            //}
            //nid = targetID + lid;
            //var tnl;
            //if (node)
            //

            this.set("nodes", nodelayers);
            this.set("aspects", aspects_);
            this.set("edges", edges);
            this.set("layers", layers);


        }


        ///*
        //    Go through input by lines and extract nodes
        // */
        //var nodes_ = [];
        //for (i=0;i<data.length;i++) {
        //    var line = data[i];
        //    var node = {}; //first node
        //    node.id = line[sin];
        //    for (var j=0;j<aspects_.length;j++) {
        //        node[aspects_[j]] = line[j+sin+1];
        //    }
        //    nodes_.push(node);
        //    node = {}; //second node
        //    node.id = line[tin];
        //    for (j=0;j<aspects_.length;j++) {
        //        node[aspects_[j]] = line[j+tin+1];
        //    }
        //    nodes_.push(node);
        //}
        ///*
        //    Remove non-unique nodes
        // */
        //var out = [];
        //var unique = function (n) {
        //    for (j=0;j<out.length;j++) {
        //        if (_.isEqual(n, out[j])) return false;
        //    }
        //    return true;
        //};
        //var ids = [];
        //for (i=0;i<nodes_.length;i++) {
        //    var n = nodes_[i];
        //    if (unique(n)) {
        //        out.push(n);
        //        ids.push(n.id);
        //    }
        //}
        //nodes_ = out;
        //ids = _.uniq(ids);
        //
        ///*
        //    Create node model for each unique id
        // */
        //var nodes = new NodeCol();
        //for (i=0;i<ids.length;i++) {
        //    nodes.add(new Node(ids[i]));
        //}
        //
        //var nodelayers = new Nodelayers();
        //console.log(uuid.v1());
        //for (i=0;i<data.length;i++) {
        //
        //}

        console.log(edges.length);
        // console.log(aspects_);
        //console.log(nodes_);
        //console.log(nodes);
        //console.log(data);
    },
    createNetFromMultipleFiles: function (inputNodes, inputEdges, inputAspects) {

        /*
         aspects
         */
        aspects = [];
        var dims = inputAspects.length;
        for (var i=0;i<dims;i++) {
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
        nodes = new NodeCol();
        for (i=0;i<names.length;i++) {
            nodes.add(new Node(names[i]));
        }

        /*
         nodelayers (one per ID)
         */
        nodelayers = new Nodelayers();
        var layer = {};
        var node = {};
        for (i=0;i<inputNodes.length;i++) {
            layer = new Layer(aspects, inputNodes[i]);
            var curname = _(inputNodes[i]).get("name");
            var curid = _(inputNodes[i]).get("id");
            node = nodes.find(function(x) {
                return x.get("name") === curname;
            });
            var temp = new Nodelayer(curid, node, layer);
            nodelayers.add(temp);
        }

        /*
         edges
         */
        edges = new EdgeCol();
        for (i=0;i<inputEdges.length;i++) {
            var cur = inputEdges[i];
            var source = nodelayers.find(function(x) {
                return _(x).get("id") === _(cur).get("source");
            });
            var target = nodelayers.find(function(x) {
                return _(x).get("id") === _(cur).get("target");
            });
            edges.newEdge(source, target, "undirected"); // all undirected and unweighted for now
        }

        /*
         Attach to network model
         */
        this.set("nodes", nodelayers);
        this.set("aspects", aspects);
        this.set("edges", edges);

    }
});

var parse = function (input, header) {
    input = input.replace(/ /g, ''); //remove whitespace
    if (!header) header = false;
    return Baby.parse(input, {header: header}).data;
};

var exports = {};

exports.Network = Network;
exports.Layer = Layer;
exports.Node = Node;
exports.NodeCollection = NodeCol;
exports.Nodelayer = Nodelayer;
exports.NodelayerCollection = Nodelayers;
exports.Edge = Edge;
exports.EdgeCollection = EdgeCol;
exports.parse = parse; // Just for testing

module.exports = exports;