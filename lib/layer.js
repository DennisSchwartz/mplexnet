var Backbone = require("backbone");
var Edge = require("./edge");
var Node = require("./node");
var EdgeCol = require("./edgecol");
var NodeCol = require("./nodecol");
var _ = require('lodash');


var Layer = Backbone.Model.extend({

    initialize: function(aspects, node) {
        console.log(node);
        for (var i=0;i<aspects.length;i++) {
            this.set(aspects[i], _(node).get(aspects[i]));
        }
    }
});


module.exports = Layer;