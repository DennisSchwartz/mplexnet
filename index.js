/**
 * Created by ds on 27/10/15.
 */

var mplexnet = require('./lib/mplexnet');
var createTensor = require('./lib/tensor');
var fs = require('fs');
var Network = mplexnet.Network;

var file = fs.readFileSync('../Thesis/dataprep/mplex-format.txt', 'utf-8');
var input = {};
input.data = file;
//file = file.replace(/ /g, ''); //remove whitespace
//var input = Baby.parse(file);//, { header: true });
input.options = {
    inputFiles: 'single',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target'
};
var network = new Network(input);

createTensor(network);