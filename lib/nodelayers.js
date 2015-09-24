var Backbone = require("backbone");
var Nodelayer = require("./nodelayer");

var Nodelayers = Backbone.Collection.extend({
    model: Nodelayer
});


module.exports = Nodelayers;