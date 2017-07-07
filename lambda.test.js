// docker run -v "$PWD":/var/task -ti --entrypoint node lambci/lambda:nodejs6.10

var gmUtils = require('./gmUtils');

const resizeParams = {
  image: 'http://s3.amazonaws.com/want-content-production/images/53046.?1495148046',
  width: 200
};

gmUtils.resize()(resizeParams).
  then(outputStream => new Promise((resolve, reject) => {
    const buffers = [];
    const append = b => buffers.push(b);
    outputStream.on('data', append);
    outputStream.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
  })).
  // then(body => callback(null, {
  then(body => console.log({
    isBase64Encoded: true,
    statusCode: 200,
    headers: { "Content-Type": "image/jpeg" },
    body
  })).
  catch(error => {
    console.error(error.message);
  });
};
