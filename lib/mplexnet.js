var _ = require("lodash");
var Backbone = require("backbone");
var Baby = require('babyparse');

/*
    Specify the options here
 */
var Options = {
    inputFiles: 'multiple',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target',
    loglevel: 4
};

/**
 @class Node
 This is the model for a node
 */
var Node = Backbone.Model.extend({

    initialize: function(id) {
        // Check if id is of correct type
        if (Options.inputFiles === 'single' && Options.loglevel > 2) console.log("id: " + id + " type: " + typeof id);
        if (typeof id === 'string' || typeof id === 'number') {
            this.set("id", id);
        } else {
            throw new TypeError('This is not a valid id. Please use strings or numbers');
        }

    }

});

var NodeCol = Backbone.Collection.extend({
    model: Node
});

/**
 @class Layer
 This is the model for a layer
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

/**
 @class Nodelayer
 This is the model for a node-layer
 */
var Nodelayer = Backbone.Model.extend({
    initialize: function(id, node, layer) {
        this.set("id", id);
        this.set("node", node);
        this.set("layer", layer);
    }
});

var NodelayerCol = Backbone.Collection.extend({
    model: Nodelayer
});


/**
 @class Edge
 This is the model for an edge
 */
var Edge = Backbone.Model.extend({
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


/**
 @class Network
 This is the main model creating the network
 */
var Network = Backbone.Model.extend({

    initialize: function(input) {

        // Update Options file according to input.options
        if (input.options) {
            _.forOwn(input.options, function (value, key) {
                    Options[key] = value;
                })
        }

        if (Options.loglevel > 0) console.log('The input format was specified as: ' + Options.inputFiles + " file(s)."); // logging level 1

        if (Options.inputFiles === 'multiple') {

            // Input is specified as multiple files
            inputNodes = parse(input.nodes, true);
            inputEdges = parse(input.edges, true);
            inputAspects = parse(input.aspects)[0];

            this.createNetFromMultipleFiles(inputNodes, inputEdges, inputAspects);

        } else if (Options.inputFiles === 'single') {

            // Input is specified as one single file
            var data = input.data.replace(/ /g, '');
            var parseOptions = {
                delimiter: Options.inputFileDelimiter,
                skipEmptyLines: true
            };
            var temp = Baby.parse(data, parseOptions);
            if (Options.loglevel > 3) console.log('The input data was given as: ' + data); //logging level 4
            if (Options.loglevel > 3) console.log('The input data was parsed as: ' + temp.data); //logging level 4

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
        var nodelayers = new NodelayerCol();
        var edges = new EdgeCol();

        var aspects_ = [];
        for (var i=sin+1;i<tin;i++) {
            aspects_.push(fields[i]);
        }
        if (Options.loglevel > 3) console.log('The parsed aspects are: ' + aspects_);
        if (Options.loglevel > 3) console.log('Lines parsed: ' + data.length);

        /*
         Go through every line and build nodes, layers and nodelayers
         */

        for (i=0;i<data.length;i++) {
            var line = data[i];
            /*
             Source node
             */
            var sourceID = line[sin];
            var node = undefined;
            node = nodes.findWhere({name: sourceID});
            if (!node) {
                if (Options.loglevel > 3) console.log('Info: Creating new node: ' + sourceID);
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
                if (Options.loglevel > 3) console.log('Info: Creating new node: ' + targetID);
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
            if (Options.loglevel > 3) console.log('Info: Creating new edge: ' + source.get('node').get('id') + "  " +
                target.get('node').get('id'));
            edges.add(new Edge(source.get('node').get('id'), target.get('node').get('id'), '', snlid + tnlid));
        }
        this.set("nodes", nodelayers);
        this.set("aspects", aspects_);
        this.set("edges", edges);
        this.set("layers", layers);
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
        var nodelayers = new NodelayerCol();
        var layer = {};
        var node = {};
        for (i=0;i<inputNodes.length;i++) {
            layer = new Layer(aspects, inputNodes[i]);
            var getFromNodes = function (cur) {
                return nodes.find(function(x) {
                    return x.get("id") === cur;
                });
            };
            var curid = _(inputNodes[i]).get("id");
            node = getFromNodes(_(inputNodes[i]).get("name"));
            var temp = new Nodelayer(curid, node, layer);
            nodelayers.add(temp);
        }

        /*
         edges
         */
        edges = new EdgeCol();
        for (i=0;i<inputEdges.length;i++) {
            var getFromNodelayers = function (cur, from) {
                return nodelayers.find(function(x) {
                    return _(x).get("id") === _(cur).get(from);
                });
            };
            var source = getFromNodelayers(inputEdges[i], 'source');
            var target = getFromNodelayers(inputEdges[i], 'target');
            edges.add(source.get('node').get('id'), target.get('node').get('id'), "undirected"); // all undirected and unweighted for now
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

exports.Options = Options;
exports.Node = Node;
exports.NodeCollection = NodeCol;
exports.Layer = Layer;
exports.LayerCollection = LayerCol;
exports.Nodelayer = Nodelayer;
exports.NodelayerCollection = NodelayerCol;
exports.Edge = Edge;
exports.EdgeCollection = EdgeCol;
exports.Network = Network;
exports.parse = parse; // For testing only

module.exports = exports;