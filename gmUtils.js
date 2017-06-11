var fs = require('fs');
var gm = require('gm');
var request = require('request');
var tmp = require('tmp');
var url = require('url');
var Promise = require('bluebird');

var compact = xs => xs.filter(x => !!x);

var isUrlRemote = urlString => {
  var parsedUrl = url.parse(urlString);
  return parsedUrl && !!parsedUrl.protocol.match(/https?:/);
}

var commandifyOptions = options => 
  Object.entries(options || {}).reduce((acc, [k, v]) => [...acc, `-${k}`, v], []);

var getTmpFilePath = () =>
  new Promise((resolve, reject) => {
    tmp.file((tmpError, path, fd, cleanup) => {
      if (tmpError) return reject(tmpError);
      resolve(path);
    });
  });

var downloadImage = url => 
  getTmpFilePath().then(
    path => new Promise((resolve, reject) => {
      var response = request(url);
      response.pipe(fs.createWriteStream(path));
      response.on('end', () => resolve(path));
      response.on('error', reject);
    })
  );

var dumpStreamToTmpFile = stream => 
  getTmpFilePath().then(
    path => new Promise((resolve, reject) => {
      if (!stream) return reject(`stream is ${stream}`);
      stream.pipe(fs.createWriteStream(path));
      stream.on('end', () => resolve(path));
      stream.on('error', reject);
    })
  );
  
var imageWithOptions = (context = {}) => ({ options, url: imageUrl = '' }) => {
  var getImagePath = Promise.resolve(imageUrl);
  if (imageUrl === "$_") {
    getImagePath = dumpStreamToTmpFile(context.inputStream);
  } else if (isUrlRemote(imageUrl)) {
    getImagePath = downloadImage(imageUrl);
  }
  return getImagePath.then(path => compact([ path, ...commandifyOptions(options) ]));
}

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
var composite = (context = {}) => (params = {}) => new Promise((resolve, reject) => {
  Promise.all([params.imageA, params.imageB].map(imageWithOptions(context))).then(
    ([ imageA, imageB ]) => {
      // gm.composite only supports paths for now
      // See https://github.com/aheckmann/gm/blame/c6a6c5a18a65e9b9344955a5cf9d7417db25dff3/README.md#L587
      var result = gm().command('composite')
                       .in(...commandifyOptions(params.options))
                       .in(...imageA)
                       .in(...imageB);

      result.stream((err, outputStream, _) => {
        if (err) return reject(err);
        resolve(outputStream);
      });
    },
    error => {
      console.error(error.message)
      reject(error)
    }
  );
});

var convert = (context = {}) => (params = {}) =>
  imageWithOptions(params.image).then(
    image => {
      // TODO
    }
  );

var drawText = (context = {}) => (params = {}) => {
  var options = params.options || {};

  return gm(1080, 100, '#FFF').transparent('#FFF')
    .fill(options.fill) // srsly? https://stackoverflow.com/a/28701493
    .drawText(0, 0, params.text || '', options.gravity || "East")
    .font(options.font || 'Helvetica', options.fontSize || 72)
    .trim().stream('png');
}

module.exports = {
  composite,
  convert,
  drawText,
};
