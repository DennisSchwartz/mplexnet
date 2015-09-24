var Backbone = require("backbone");
var _ = require("lodash");
var Edge = require("./edge");

var EdgeCol = Backbone.Collection.extend({
    model: Edge,
    initialize: function(nodes) {
        this.nodes = nodes;
    },
    newEdge: function (src, dest) {
        //console.log("Src: " + src);
        //console.log("Dest: " + dest);
        var node1 = this.nodes.find(function (x) { return x.id === src }); // This may work?!!
        var node2 = this.nodes.find(function (x) { return x.id === dest }); // This may work?!!
        //console.log("Trying to create edge!");
        var data = {
            "name": node1.name + "-" + node2.name,
            "src": node1.name,
            "dest": node2.name
        };
        var newEdge = new Edge(data);
        //console.log("Edge created!");
        //console.log("Data: " + data);
        //newEdge.initialize(data);
        this.add(newEdge);
    }
});


module.exports = EdgeCol;