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

    initialize: function(id) {
        // Check if id is correct type
        if (typeof id === 'string' || typeof id === 'number') {
            this.set("id", id);
        } else {
            throw new TypeError('This is not a valid id. Please use strings or numbers');
        }

    }

});

module.exports = Node;