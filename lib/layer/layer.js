var Backbone = require("backbone");
var Edge = require("./../edge/edge");
var Node = require("./../node/node");
var EdgeCol = require("./../edge/edgecol");
var NodeCol = require("./../node/nodecol");
var _ = require('lodash');


var Layer = Backbone.Model.extend({

    initialize: function(aspects, node, id) {
        //console.log(node);
        for (var i=0;i<aspects.length;i++) {
            this.set(aspects[i], _(node).get(aspects[i]));
        }
        if (id) this.set("id", id);
    }
});


module.exports = Layer;