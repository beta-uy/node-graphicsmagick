var app = require("express")();
var bodyParser = require("body-parser");
var gmUtils = require("./gmUtils.js");
var addRequestId = require("express-request-id")();
var lengthStream = require("length-stream");
var Promise = require("bluebird");

app.use(bodyParser.json());
app.use(addRequestId);

/*
  curl localhost:85/gm/composite \
    -d "$(cat example.composite.json | sed s/\"/\\\"/g)" \
    -H 'Content-Type: application/json'
*/
app.post("/gm/composite", (req, res) =>
  gmUtils.composite()(req.body).then(
    outputStream => {
      res.setHeader("Content-Type", "image");
      outputStream.pipe(res);
    },
    error => {
      res.status(500);
      res.send(error.message);
    },
  ),
);

/*
  curl localhost:85/gm/pipe \
    -d "$(cat example.pipe.json | sed s/\"/\\\"/g)" \
    -H 'Content-Type: application/json'
*/
app.post("/gm/pipe", (req, res) => {
  var requestName = `[${req.id}] /gm/pipe "${req.body.operationName || "Anonymous"}"`;
  console.time(requestName);

  var pipe = req.body.pipe || [];
  var context = {};

  Promise.reduce(
    pipe,
    ({ ref: prevRef, outputStream: prevStream }, action) => {
      context[prevRef || "$_"] = prevStream;
      return gmUtils[action.utility](context)(action).then(outputStream => ({
        ref: action.ref,
        outputStream,
      }));
    },
    Promise.resolve(context),
  )
    .then(({ outputStream }) => {
      res.setHeader("Content-Type", "image/png");
      outputStream.pipe(res);
    })
    .catch(error => {
      res.status(500);
      res.send(error.message);
    })
    .then(() => console.timeEnd(requestName));
});

app.get("/resize", (req, res) => {
  var requestName = `[${req.id}] /resize "${req.body.operationName || "Anonymous"}"`;
  console.time(requestName);

  res.setHeader("Content-Type", "image/jpeg");
  if (req.query.refresh) {
    res.setHeader("Cache-Control", "max-age=" + req.query.refresh);
  }

  var resizeParams = {
    image: req.query.url,
    width: req.query.resize_w,
    height: req.query.resize_h,
  };

  var earlyExitIfEmptyStream = lengthStream(length => {
    if (length > 0) return;

    console.error(`[${req.id}] Got empty stream for query: ${JSON.stringify(req.query)}`);
    res.setHeader("Cache-Control", "no-cache");
    res.status(503).end();
  });

  gmUtils.resize()(resizeParams)
    .then(outputStream =>
      outputStream
        .pipe(earlyExitIfEmptyStream)
        .pipe(res)
        .on("finish", () => console.timeEnd(requestName)),
    )
    .catch(error => {
      res.setHeader("Cache-Control", "no-cache");
      res.status(500);
      res.send(error.message);
      console.timeEnd(requestName);
    });
});

app.listen(80);
console.log("Listening on port 80");

process.on("SIGTERM", function() {
  console.log("Bye!");
  process.exit();
});
