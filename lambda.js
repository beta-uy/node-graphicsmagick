var gmUtils = require('./gmUtils');

exports.handler = (event, context, callback) => {
  const { url, resize_w, resize_h } = event.queryStringParameters;
  const resizeParams = {
    image: url,
    width: resize_w,
    height: resize_h,
  };

  gmUtils.resize()(resizeParams).
    then(outputStream => new Promise((resolve, reject) => {
      const buffers = [];
      const append = b => buffers.push(b);
      outputStream.on('data', append);
      outputStream.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
    })).
    // then(body => callback(null, {
    then(body => context.succeed({
      isBase64Encoded: true,
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body
    })).
    catch(error => {
      res.status(500);
      res.send(error.message);
    });
};
