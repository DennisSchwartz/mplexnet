var Backbone = require("backbone");
var Node = require("./node");
var NodeCol = require("./nodecol");
var Layer = require("./layer");
var LayerCol = require("./layercol");
var Edge = require("./edge");
var EdgeCol = require("./edgecol");
var Nodelayer = require("./nodelayer");
var Nodelayers = require("./nodelayers");
var Parser = require("./parser");
var Options = require("./options.js");
var _ = require('lodash');
var uuid = require('uuid');


var Network = Backbone.Model.extend({

    // initialize with String from Parser Module
    initialize: function(input) {

        var parser = new Parser();

        if (Options.inputFiles === 'multiple') {
            inputNodes = parser.readNodes(input.nodes);
            inputEdges = parser.readEdges(input.edges);
            inputAspects = parser.readAspects(input.aspects);
            this.createNetFromMultipleFiles(inputNodes, inputEdges, inputAspects);
        } else if (Options.inputFiles === 'single') {
            // Create new format
            this.createNetFromSingleFile(input);
        } else {
            throw 'Please specify a correct input format!';
        }
    },
    createNetFromSingleFile: function (input) {

        var data = input.data;
        var fields = data.shift();
        var sin = fields.indexOf('source');
        var tin = fields.indexOf('target');

        var nodes = new NodeCol();
        var layers = new LayerCol();
        var nodelayers = new Nodelayers();

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
            
        }

        for (i=0;i<data.length;i++) {
            var line = data[i];
            /*
                Source node
             */
            var sourceID = line[sin];
            var source;
            if (nodeIDs.indexOf(sourceID) === -1) {
                source = new Node(sourceID);
                nodeIDs.push(sourceID);
                nodes.add(source);
            } else {
                source = nodes.where({name: sourceID});
            }
            var obj = {};
            var lid = '';
            for (var j=sin+1;j<=sin+aspects_.length;j++) {
                obj[fields[j]] = line[j];
                lid = lid + line[j];
            }
            var layer;
            if (layerIDs.indexOf(lid) === -1) {
                layerIDs.push(lid);
                layer = new Layer(aspects_, obj, lid);
                layers.add(layer);
            } else {
                layer = layers.get(lid);
            }
            var nid = sourceID + lid;
            var snl;
            if (nodelayerIDs.indexOf(nid) === -1) {
                snl = new Nodelayer(nid, source, layer);
                nodelayers.add(snl);
                nodelayerIDs.push(nid);
            } else {
                snl = nodelayers.get(nid);
            }
            /*
                Target node
             */
            var targetID = line[tin];
            var target;
            if (nodeIDs.indexOf(targetID) === -1) {
                target = new Node(targetID);
                nodeIDs.push(targetID);
                nodes.add(target);
            } else {
                target = nodes.where({name: targetID});
            }
            obj = {};
            lid = '';
            for (j=tin+1;j<=tin+aspects_.length;j++) {
                obj[fields[j]] = line[j];
                lid = lid + line[j];
            }
            layer = {};
            if (layerIDs.indexOf(lid) === -1) {
                layerIDs.push(lid);
                layer = new Layer(aspects_, obj, lid);
                layers.add(layer);
            } else {
                layer = layers.get(lid);
            }
            nid = targetID + lid;
            var tnl;
            if (node)




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

        console.log(fields);
        console.log(aspects_);
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

module.exports = Network;