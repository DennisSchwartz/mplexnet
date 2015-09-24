var Backbone = require("backbone");
var Baby = require("babyparse");

var Parser = Backbone.Model.extend({

    readAspects: function (aspects) {
        aspects = aspects.replace(/ /g, ''); //remove whitespace
        return Baby.parse(aspects).data[0];
    },

    readNodes: function (nodes) {
        nodes = nodes.replace(/ /g, ''); //remove whitespace
        return Baby.parse(nodes, {header: true}).data;
    },

    readEdges: function (edges) {
        edges = edges.replace(/ /g, ''); //remove whitespace
        return Baby.parse(edges, {header: true}).data;
    }

});

module.exports = Parser;