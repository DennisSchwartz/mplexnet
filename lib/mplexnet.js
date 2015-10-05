/*
 * mplexnet
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */


var Backbone = require("backbone");
var _ = require("lodash");
//var Options = require("./options.js");
var Baby = require('babyparse');

var Options = {
    inputFiles: 'multiple',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target'
};

/*
    Node
 */

var Node = Backbone.Model.extend({

    initialize: function(id) {
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
    model: Edge
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

        var aspects_ = [];
        for (var i=sin+1;i<tin;i++) {
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
            edges.add(new Edge(source.get('id'), target.get('id'), '', snlid+tnlid));


            this.set("nodes", nodelayers);
            this.set("aspects", aspects_);
            this.set("edges", edges);
            this.set("layers", layers);

        }
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
        var layers = new LayerCol();
        var nodelayers = new Nodelayers();
        var layer = {};
        var node = {};
        for (i=0;i<inputNodes.length;i++) {
            layer = new Layer(aspects, inputNodes[i]);
            layers.add(layer);
            var curname = _(inputNodes[i]).get("name");
            var curid = _(inputNodes[i]).get("id");
            node = nodes.find(function(x) {
                return x.get("id") === curname;
            });
            var temp = new Nodelayer(curid, node, layer);
            nodelayers.add(temp);
        }

        /*
         edges
         */
        var edges = new EdgeCol();
        for (i=0;i<inputEdges.length;i++) {
            var cur = inputEdges[i];
            edges.add(new Edge(_(cur).get('source'), _(cur).get("target"), '', _(cur).get('source') + _(cur).get("target")))
        }

        /*
         Attach to network model
         */
        this.set("nodes", nodelayers);
        this.set("aspects", aspects);
        this.set("edges", edges);
        this.set("layers", layers);
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