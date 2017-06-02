var gm = require('gm');
var request = require('request');

var gmFromRemoteUrl = url => gm(request(url));

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
      "gravity": ["SouthEast"]
    }
  }
*/
var composite = (params = {}) => new Promise((resolve, reject) => {
  // console.log(params);

  var imageA = params.imageA;
  var imageB = params.imageB;

  var addOptions = (options, gmImage) =>
    Object.entries(options)
          .reduce((acc, [utility, args]) => acc[utility](...args), gmImage);

  var gmA = addOptions(imageA.options, gmFromRemoteUrl(imageA.url));
  var gmB = addOptions(imageB.options, gmFromRemoteUrl(imageB.url));

  var result = addOptions(params.options, gmA.composite(gmB));
  // var result = gm().command('composite')
  //                  .in('-gravity', 'SouthEast')
  //                  .in(gmA)
  //                  .in(gmB);

  result.toBuffer('PNG', (err, buffer) => {
    if (err) return reject(err);
    resolve(buffer);
  });

  // result.stream((err, outputStream, errorStream) => {
  //   // if (errorStream) return reject(errorStream);
  //   resolve(outputStream);
  // });
});

module.exports = {
  composite: composite,
};
