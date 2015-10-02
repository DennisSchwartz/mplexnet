var Backbone = require("backbone");
var Node = require("./../node/node");
var _ = require("lodash");

var Nodelayer = Backbone.Model.extend({
    initialize: function(id, node, layer) {
        this.set("id", id);
        this.set("node", node);
        this.set("layer", layer);
    }
});

module.exports = Nodelayer;
