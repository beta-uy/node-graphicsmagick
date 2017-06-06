// var fs = require('fs');
// var request = require('request');
var gm = require('gm');

/*
  {
    "imageA": {
      "url": "https://...",
      "options": { }
    },
    "imageB": {
      "url": "https://...",
      "options": { }
    },
    "options": {
      "gravity": "SouthEast"
    }
  }
*/

var compact = xs => xs.filter(x => !!x);

var composite = (params = {}) => new Promise((resolve, reject) => {
  // TODO https support

  var imageA = params.imageA;
  var imageB = params.imageB;

  // var addOptions = (options, gmImage) =>
  //   Object.entries(options)
  //         .reduce((acc, [utility, args]) => acc[utility](...args), gmImage);

  // var gmA = addOptions(imageA.options, gmFromRemoteUrl(imageA.url));
  // var gmB = addOptions(imageB.options, gmFromRemoteUrl(imageB.url));

  // var result = addOptions(params.options, gmA.composite(gmB));
  
  var serializeOptions = options => 
    Object.entries(options || {}).reduce((acc, [k, v]) => [...acc, `-${k}`, v], []);
    
  var imageWithOptions = ({ options, url }) => compact([ url, ...serializeOptions(options) ]);


  var result = gm().command('composite')
                   .in(...serializeOptions(params.options))
                   .in(...imageWithOptions(imageA))
                   .in(...imageWithOptions(imageB));

  // // buffer flavour
  // result.toBuffer((err, buffer) => {
  //   if (err) return reject(err);
  //   resolve(buffer);
  // });

  // stream flavour
  result.stream((err, outputStream, errorStream) => {
    if (err) return reject(errorStream);
    resolve(outputStream);
  });
});

module.exports = {
  composite: composite,
};
