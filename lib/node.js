/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

/**
 @class Node
 This is the model for a node
 */


var Backbone = require("backbone");

var Node = Backbone.Model.extend({

    initialize: function(name) {
        this.set("name", name);
    }

});

module.exports = Node;