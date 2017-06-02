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
      "options": {
        "gravity": ["SouthEast"]
      }
    }
  }
*/
var composite = (options = {}) => new Promise((resolve, reject) => {
  console.log(options);

  var imageA = options.imageA;
  var imageB = options.imageB;

  var gmFromJsonRepresentation = image =>
    Object.entries(image.options)
          .reduce(
            (acc, [utility, args]) => acc[utility](...args),
            gmFromRemoteUrl(image.url)
          );

  var gmA = gmFromJsonRepresentation(imageA);
  var gmB = gmFromJsonRepresentation(imageB);

  var result = gmA.composite(gmB);

  result.toBuffer('jpg', (err, buffer) => {
    if (err) return reject(err);
    resolve(buffer);
  });
});

module.exports = {
  composite: composite,
};
