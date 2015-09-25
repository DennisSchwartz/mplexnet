var Backbone = require("backbone");
var _ = require("lodash");
var Edge = require("./edge");

var EdgeCol = Backbone.Collection.extend({
    model: Edge,
    newEdge: function (source, target, type, weight) {
        //console.log("Src: " + src);
        //console.log("Dest: " + dest);
        //var node1 = this.nodelayers.find(function (x) { return x.get("id") === src }); // This may work?!!
        //var node2 = this.nodelayers.find(function (x) { return x.get("id") === dest }); // This may work?!!
        //console.log("Trying to create edge!");
        //console.log(typeof source.get("id"));
        //console.log(target.get("id"));

        var edge = new Edge(source.get("id"), target.get("id"), type);
        //console.log("Edge created!");
        //console.log(edge.get("id"));
        //newEdge.initialize(data);
        this.add(edge);
    }
});


module.exports = EdgeCol;