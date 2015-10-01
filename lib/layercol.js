var Backbone = require("backbone");
var Layer = require("./layer");

var LayerCol = Backbone.Collection.extend({
    model: Layer
});


module.exports = LayerCol;