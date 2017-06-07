var fs = require('fs');
var gm = require('gm');
var request = require('request');
var tmp = require('tmp');
var Promise = require('bluebird');

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

var downloadImage = url => new Promise((resolve, reject) => {
  tmp.file((tmpError, path, fd, cleanup) => {
    if (tmpError) return reject(tmpError);

    var response = request(url);
    response.pipe(fs.createWriteStream(path));
    response.on('end', () => resolve(path));
    response.on('error', reject);
  });
});

var composite = (params = {}) => new Promise((resolve, reject) => {
  console.log(params)

  var serializeOptions = options => 
    Object.entries(options || {}).reduce((acc, [k, v]) => [...acc, `-${k}`, v], []);
    
  var imageWithOptions = ({ options, url }) => 
    downloadImage(url).then(path => compact([ path, ...serializeOptions(options) ]));

  Promise.all([params.imageA, params.imageB].map(imageWithOptions))
    .then(
      ([ imageA, imageB ]) => {
        var result = gm().command('composite')
                         .in(...serializeOptions(params.options))
                         .in(...imageA)
                         .in(...imageB);

        result.stream((err, outputStream, _) => {
          if (err) return reject(err);
          resolve(outputStream);
        });
      },
      error => console.err(error.message));
});

module.exports = {
  composite: composite,
};
