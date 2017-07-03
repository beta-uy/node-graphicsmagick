var app = require('./app');
var PORT = process.env.port || 80;

app.listen(PORT);
console.log(`Listening on port ${PORT}`);

process.on('SIGTERM', function() {
  console.log("Bye!");
  process.exit();
});
