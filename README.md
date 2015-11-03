# mplexnet

[![NPM version](http://img.shields.io/npm/v/mplexnet.svg)](https://www.npmjs.org/package/mplexnet) 
[![Build Status](https://secure.travis-ci.org/DennisSchwartz/mplexnet.png?branch=master)](http://travis-ci.org/DennisSchwartz/mplexnet) 

> A model for Multilayer/Multiplex/Complex Networks

It is still very much work in progress so beware 
of updates as your code might break. To visualise a multilayer network, 
check out [mplexviz-ngraph](https://github.com/DennisSchwartz/mplexviz-ngraph).

This module implements the multilayer network framework put forward here: 
> Kivelä et al. 2014. Multilayer Networks. Journal of Complex Networks (2014) 2, 203-271. DOI:10.1093/comnet/cnu016

## Getting Started

Install the module with: `npm install mplexnet`

```javascript
var mplexnet = require('mplexnet');
var Network = mplexnet.Network;
```

## Documentation

Create the input for the network:

```javascript

// Input parsed from csv file of edges
var input = {};
input.data = 'source,l1,l2,target,l1,l2\n1,A,X,2,A,X\n1,A,X,1,B,X\n1,A,X,4,B,X\n1,B,X,1,B,Y\n1,B,X,3,B,X\n1,B,X,4,B,X\n3,B,X,4,B,X\n4,B,X,3,A,Y\n3,A,Y,3,A,X\n3,A,Y,2,A,Y';

// default options for network model
input.options = {
    inputFiles: 'csv',
    inputFileDelimiter: ',',
    sourceFieldLabel: 'source',
    targetFieldLabel: 'target',
    loglevel: 0
};

```

Then instantiate the network model

```javascript
var mplexnet = require('mplexnet');
var Network = mplexnet.Network;
// createNetwork a new network
var myNetwork = new Network(input);
```

## Contributing

All contributions are welcome.

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/DennisSchwartz/mplexnet/issues).

## License 

The MIT License

Copyright (c) 2015, Dennis Schwartz

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
