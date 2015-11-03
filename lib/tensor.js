/**
 * Created by ds on 22/10/15.
 */

var _ = require('lomath');
var math = require('mathjs').create({matrix: 'array'});
var time = require('node-tictoc');

var createTensor = function (network) {

    //var currLayer;
    var sizeV = network.get('V').length;
    var numLayers = network.get('layers').size();
    //console.log(network.get('V'));
    var edges = network.get('edges');

    //var intra = function (e) {
    //    //TODO: There has to be a better way!!
    //    var sourceLayerID = network.get('nodes').get(e.get('source')).get('layer').get('id');
    //    var targetLayerID = network.get('nodes').get(e.get('target')).get('layer').get('id');
    //    return targetLayerID === sourceLayerID;
    //};


    // Create adjacency matrices for layers
    time.tic();

    //var matrices = [];
    var nodeTensors = [];
    network.get('layers').each(function (l) { // for each layer
        var t = math.zeros(sizeV,sizeV);
        var e = network.get('edges').inLayer(l, network); // get all edges in current layer
        e.each(function (e) {
            var snl = network.get('nodes').get(e.get('source'));
            var tnl = network.get('nodes').get(e.get('target'));
            var srcIndex = network.get('V').indexOf(snl.get('node'));
            var tgtIndex = network.get('V').indexOf(tnl.get('node'));
            t[srcIndex][tgtIndex] = 1;
        });
        t = _.add(t, _.transpose(t)); // This is only for undirected networks, written in directed format
        nodeTensors[network.get('layers').indexOf(l)] = t;
        //
        //    m = [];
        //    for (var i = 0; i < sizeV; i++) { // for all nodes
        //        var n = Array.apply(null, new Array(sizeV)).map(Number.prototype.valueOf,0);
        //        var node = nodes.byNode(network.get('V').at(i)).first(); // get current nodelayer by node
        //        if (node) var edges = network.get('edges').byNode(node.get('id')); // get all edges coming from this nodelayer
        //        var targets = [];
        //        if (edges) edges.each(function (e) { // extract the targets from these edges
        //            targets.push(e.get('target'));
        //        });
        //        // for all targets, get index of its node in V
        //        // First: get nodelayer with target id
        //        // Then: get node id from this nodelayer
        //        // Then: get index of this node id in V
        //        // Then: Set this index 1 in matrix
        //        for (var j=0;j<targets.length;j++) {
        //            var t = targets[j];
        //            var current = nodes.get(t); // Only select from nodelayers in this layer
        //            if (!current) continue;
        //            var id = current.get('node');
        //            var index = network.get('V').indexOf(id);
        //            n[index] = 1;
        //        }
        //        m[i] = n;
        //    }
        //    matrices.push(_.add(m,_.transpose(m)));
    });

    time.toc();
    console.log('Nodetensors created from network');
    //console.log(nodeTensors);

    time.tic();
    // createNetwork layertensor
    var layersTensor = [];
    if (numLayers > 1) {
        layersTensor = math.ones(numLayers,numLayers); //TODO: Multiply with weights for inter-layer edges
        layersTensor = _.subtract(layersTensor, math.diag(math.diag(layersTensor))); //TODO: This is only for categorical layers
    } else {
        layersTensor = 0;
    }

    time.toc();
    console.log('Layerstensor created from network');

    // createNetwork supra adjacency matrix

    var identity = math.eye(sizeV);
    //var m = require('mathjs').createNetwork().zeros(sizeV,sizeV);
    //var m = math.zeros(sizeV,sizeV);
    //console.log(m);
    //var m2 = math.subset(m, math.index([1,2],[0,1,2,3]), [[1,2,3,4],[1,2,3,4]]);
    //console.log(m2);
    time.tic();
    var block = blkdiag(nodeTensors, sizeV);
    //console.log(identity);
    time.toc();
    console.log('Blocks created');
    time.tic();
    var kron = kronecker_product(layersTensor, identity);
    var sam = math.add(block, kron);
    time.toc();
    console.log('Kronecker product');
    //console.log(sam);

    return sam;
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

    /**
     * 1. Go through layers
     * 2. For each, save intralayer edges
     */

    //edges.each(function (e) {
    //    e.set('intra', intra(e));
    //});

    /**
     * For each layer, createNetwork a |V|x|V| matrix
     */

    //for (var n=0;n<sizeV;n++) {
    //    for (var m=0;m<sizeV;m++) {
    //
    //    }
    //}

    /**
     * For each layerCOMBINATION, createNetwork a |V|x|V| matrix
     */
    //var numCom = _.combination(numLayers, 2);
    //console.log(numCom + numLayers + 'x' + sizeV + 'x' + sizeV);
    //
    //
    //var m = [];
    //for (var j=0;j<numCom+numLayers;j++) {
    //    var n = [];
    //    for (var k=0;k<sizeV;k++) {
    //        n[k] = Array.apply(null, new Array(sizeV)).map(Number.prototype.valueOf,0);
    //    }
    //    m[j] = n;
    //}
    //console.log(m);


    /**
     * Another new approach: Like in the paper
     */

};

var createNodeTensor = function (net, s) {
    var t = math.zeros(s,s);
    //console.log(t[1]);
    net.get('edges').each(function (e) {
        // For each edge, get the index of the node
        //console.log(net.get('nodes').indexOf((e.get('source'))));
        var source = net.get('V').indexOf(net.get('nodes').get(e.get('source')).get('node'));
        var target = net.get('V').indexOf(net.get('nodes').get(e.get('target')).get('node'));
        t[source][target] = 1;
        console.log(source + ' => ' + target);
    });
   // console.log(t);
    return t;
};

//TODO: Try to createNetwork the tensor using this
// Let each node be represented by a vector
// for all nodes sum up the kronecker product of these vectors (?)

var kronecker_product = function (a, b)
{
    //console.log(_.flatten(a));
    //console.log(_.flatten(b));

    var colsA = a[0].length, rowsA = a.length, colsB = b[0].length, rowsB = b.length;
    //var M = ma*mb, N = na*nb;
    var A = _.flatten(a);
    var B = _.flatten(b);
    //
    //for (var j=0;j<na;j++) {
    //    for (var i=0;i<ma;i++) {
    //        var I = i*mb;
    //        var J = j*nb;
    //        console.log(j,i);
    //    }
    //}

    // For each element in a
    //console.log(a);
    console.log(colsA + 'x' + rowsA);
    var size = A.length * B.length;
    var res = require('mathjs').create().zeros(colsA*colsB,rowsA*rowsB, 'sparse');
    console.log(res.size());
    for (var i=0;i<rowsA;i++) {
        console.log(i);
        for (var j=0;j<colsA;j++) {
            time.tic();
            var block = _.multiply(a[i][j], b);
            indexA = colsB * j; //indexA = width of a times colsA indexB = height of a * index row
            indexB = rowsB * i;
            var indices = math.index(math.range(indexA, indexA + colsB), math.range(indexB, indexB + rowsB));
            res = res.subset(indices, block);
            console.log('one block added');
            time.toc();
        }
    }
    return res;
    // multiply each element in b

    //return _.matMultiply(a, _.transpose(b));

    //var i, j, k, al = a.length, bl = b.length, abl = al*bl, ab = new Array(abl);
    //i = 0; j = 0;
    //for (k=0; k<abl; k++)
    //{
    //    if ( j>=bl) {j=0; i++;}
    //    ab[k] = [].concat(a[i],b[j]);
    //    j++;
    //}
    //return res;
};


var blkdiag = function (nodeTensors, size) {
    // createNetwork block diagonal matrix from nodeTensors
    //var n = 0, m = 0;
    var l = nodeTensors.length;
    var matSize = l * size;
    //var test = _.flatten(nodeTensors);
    //var res = [];
    var res = math.zeros(matSize, matSize);
    var indices = math.index(math.range(1,size), math.range(1,size));


    for (var i=0;i<l;i++) {
        for (var j=0;j<l;j++) {
            if (i===j) {
                res = math.subset(res, math.index(math.range(j*size, j*size + size), math.range(i*size, i*size + size)), nodeTensors[i]);
            }
        }
    }
    return res;

};


module.exports = createTensor;