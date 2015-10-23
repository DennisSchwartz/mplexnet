/**
 * Created by ds on 22/10/15.
 */

var _ = require('lomath');

var createTensor = function (network) {

    var currLayer;
    var sizeV = network.get('V').length;
    var numLayers = network.get('layers').size();
    //console.log(network.get('V'));
    var edges = network.get('edges');

    var intra = function (e) {
        //TODO: There has to be a better way!!
        var sourceLayerID = network.get('nodes').get(e.get('source')).get('layer').get('id');
        var targetLayerID = network.get('nodes').get(e.get('target')).get('layer').get('id');
        return targetLayerID === sourceLayerID;
    };

    console.log('Hello!');

    // Create adjacency matrices for layers

    var matrices = [];
    network.get('layers').each(function (l) { // for each layer
        var nodes = network.get('nodes').byLayer(l); // get all nodelayers of current layer
        m = [];
        for (var i = 0; i < sizeV; i++) { // for all nodes
            var n = Array.apply(null, new Array(sizeV)).map(Number.prototype.valueOf,0);
            //console.log(network.get('V').at(i).get('id'));
            //console.log(nodes.byNode(nodes.first().get('node')).first().get('id'));
            var node = nodes.byNode(network.get('V').at(i)).first(); // get current nodelayer by node
            if (node) console.log(node.cid);
            if (node) var edges = network.get('edges').byNode(node.get('id')); // get all edges coming from this nodelayer
            var targets = [];
            if (edges) edges.each(function (e) { // extract the targets from these edges
               targets.push(e.get('target'));
            });
            //console.log(targets);
            // for all targets, get index of its node in V
            // First: get nodelayer with target id
            // Then: get node id from this nodelayer
            // Then: get index of this node id in V
            // Then: Set this index 1 in matrix
            for (var j=0;j<targets.length;j++) {
                var t = targets[j];
                var current = nodes.get(t); // Only select from nodelayers in this layer
                if (!current) continue;
                var id = current.get('node');
                //console.log('id: ' +  id);
                var index = network.get('V').indexOf(id);
                //console.log('index: ' +  index);
                n[index] = 1;
            }
            m[i] = n;
        }
        matrices.push(m);
    });

    console.log(matrices);


    //network.get('layers').each(function (l) {
    //    var m = [];
    //    var nodes = network.get('nodes').byLayer(l);
    //    //var s = nodes.size();
    //    for (var i = 0; i < sizeV; i++) {
    //        var id = nodes.at(i).get('id');
    //        var edges = network.get('edges').byNode(id);
    //        var n = [];
    //        edges.each(function (e) {
    //            n.push(e.get('target'));
    //        });
    //        m[i] = n;
    //    }
    //    matrices.push(m);
    //});

    //console.log(matrices);

    //network.get('layers').each(function (l) {
    //    var currNodes = network.get('nodes').byLayer(l);
    //    currNodes.each(function (n) {
    //        var id = n.get('id');
    //        var edges = network.get('edges').byNode(id);
    //        edges.each(function (e) {
    //            var s = e.get('source');
    //            m[s] = id;
    //            console.log(id, s, m);
    //           // m[id][s] = 1;
    //        });
    //    });
    //});

    //console.log(m);

    /**
     * 1. Go through layers
     * 2. For each, save intralayer edges
     */

    //edges.each(function (e) {
    //    e.set('intra', intra(e));
    //});

    /**
     * For each layer, create a |V|x|V| matrix
     */

    //for (var n=0;n<sizeV;n++) {
    //    for (var m=0;m<sizeV;m++) {
    //
    //    }
    //}

    /**
     * For each layerCOMBINATION, create a |V|x|V| matrix
     */
    //var numCom = _.combination(numLayers, 2);
    //console.log(numCom + numLayers + 'x' + sizeV + 'x' + sizeV);

};

var rec = function(d, numV) {
    if (d === 0) {
        res = [];
        for (var i=0; i < numV;i++) {
            res.push(_.numeric(numV));
        }
        return res;
    } else {

    }

};

module.exports = createTensor;