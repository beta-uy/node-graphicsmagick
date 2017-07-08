var request = require('request');
var gm = require('gm').subClass({ imageMagick: true });

exports.handler = (event, context, callback) => {
  console.log(process.env);

  const { url, resize_w, resize_h } = event.queryStringParameters;
  const params = {
    image: url,
    width: resize_w,
    height: resize_h,
  };

  const noop = () => {};
  const log = string => (fn = noop) => (...args) => { console.log(string); fn(...args) };

  try {
    var outputStream =
      gm(request(params.image))
        .resize(params.width, params.height)
        .background('#FFF')
        .flatten()
        .stream('jpg');

    const buffers = [];
    const append = b => buffers.push(b);

    outputStream.on('data', log('appending data...')(append));
    outputStream.on('end', log('end')(() => callback(
      null, 
      {
        isBase64Encoded: true,
        statusCode: 200,
        headers: { "Content-Type": "image/jpeg" },
        body: Buffer.concat(buffers).toString('base64')
      }
    )));
  } catch (err) {
    console.error(err),
    callback(err);
  }
};
