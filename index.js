var app = require('express')();
var bodyParser = require('body-parser');
var gmUtils = require('./gmUtils.js')
var Promise = require('bluebird');

app.use(bodyParser.json());

/* 
  curl localhost:85/gm/composite \
    -d "$(cat example.composite.json | sed s/\"/\\\"/g)" \
    -H 'Content-Type: application/json'
*/
app.post('/gm/composite', (req, res) =>
  gmUtils.composite()(req.body).then(
    outputStream => {
      res.setHeader('Content-Type', 'image');
      outputStream.pipe(res);
    },
    error => {
      res.status(500);
      res.send(error.message);
    }
  ));

/*
  curl localhost:85/gm/pipe \
    -d "$(cat example.pipe.json | sed s/\"/\\\"/g)" \
    -H 'Content-Type: application/json'
*/
app.post('/gm/pipe', (req, res) => {
  var pipe = req.body.pipe || [];

  Promise.reduce(
    pipe,
    (inputStream, action) => gmUtils[action.utility]({ inputStream })(action),
    Promise.resolve(null)
  ).then(
    outputStream => {
      res.setHeader('Content-Type', 'image');
      outputStream.pipe(res);
    }
  ).catch(
    error => {
      res.status(500);
      res.send(error.message);
    }
  );
});

app.listen(80);
console.log("Listening on port 80");

process.on('SIGTERM', function() {
  console.log("Bye!");
  process.exit();
});
