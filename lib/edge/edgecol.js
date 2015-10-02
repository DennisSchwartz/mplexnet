var Backbone = require("backbone");
var _ = require("lodash");
var Edge = require("./edge");

var EdgeCol = Backbone.Collection.extend({
    model: Edge
});


module.exports = EdgeCol;