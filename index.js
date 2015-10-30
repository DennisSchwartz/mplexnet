/**
 * Created by ds on 27/10/15.
 */

var zerorpc = require("zerorpc");
var Baby = require("babyparse");
var fs = require('fs');
var _ = require('lodash');

var file = fs.readFileSync('../Thesis/dataprep/python-test.txt', 'utf-8');

file = file.replace(/ /g, '');
var data = Baby.parse(file, {header: true, skipEmptyLines: true}).data;

//console.log(data);
var nodes = [];
var layers = [];
for (var i=0;i<data.length;i++) {
    nodes.push(data[i].source);
    nodes.push(data[i].target);
    layers.push(data[i].layer);
}
nodes = _.uniq(nodes);
layers = _.uniq(layers);

console.log(layers);

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");
client.invoke("initialize", nodes, data, layers,  function(error, res, more) {

        if (error) console.log(error);
        console.log(res);
});

