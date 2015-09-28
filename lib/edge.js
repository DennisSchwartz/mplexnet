/*
 * mplex-net
 * https://github.com/DennisSchwartz/mplex-net
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

/**
 @class Edge
 This is the model for an edge
 */


var Backbone = require("backbone");
var Node = require("./node");
var _ = require("lodash");

var Edge = Backbone.Model.extend({
    defaults: {
        group: "edges"
    },
    initialize: function(source, target, type, id) {
        this.set("source", source);
        this.set("target", target);
        if (type === 'directed' || type === 'undirected') {
            this.set("type", type);
        } else {
            this.set("type", 'undirected');
        }
        if (typeof id != 'undefined') {
            this.set("id", id);
        } else {
            id = source + '-' + target;
            this.set("id", id);
        }
    }

});

module.exports = Edge;