var Backbone = require("backbone");
var Node = require("./node");

var NodeCol = Backbone.Collection.extend({
    model: Node
});


module.exports = NodeCol;