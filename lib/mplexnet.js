var Backbone = require("backbone");
var Node = require("./node");
var NodeCol = require("./nodecol");
var Layer = require("./layer");
var Edge = require("./edge");
var EdgeCol = require("./edgecol");
var Nodelayer = require("./nodelayer");
var Nodelayers = require("./nodelayers");
var Parser = require("./parser");
var _ = require('lodash');


var Mplexnet = Backbone.Model.extend({

    // initialize with String from Parser Module
    initialize: function(nodes_, edges_, aspects_) {

        var parser = new Parser();

        // First: Parse content of files to JS Objects
        inputNodes = parser.readNodes(nodes_);
        inputEdges = parser.readEdges(edges_);
        inputAspects = parser.readAspects(aspects_);


        // aspects
        aspects = [];
        var dims = inputAspects.length;
        for (var i=0;i<dims;i++) {
            aspects.push(inputAspects[i]);
        }

        // Do nodes first. (One per name)
        var names = [];
        for (i=0;i<inputNodes.length;i++) {
            names.push(_(inputNodes[i]).get("name"));
        }
        names = _.uniq(names);

        nodes = new NodeCol();
        for (i=0;i<names.length;i++) {
            nodes.add(new Node(names[i]));
        }


        // Then do nodelayers (one per ID)
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


        edges = new EdgeCol();
        //var counter = 1;
        //this.edges.on("add", function (x) {
        //   console.log(counter++);
        //});

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

        this.set("nodes", nodelayers);
        this.set("aspects", aspects);
        this.set("edges", edges);

    }
});

module.exports = Mplexnet;