var awsServerlessExpress = require('aws-serverless-express');
var app = require('./app');

// via https://github.com/awslabs/aws-serverless-express/pull/37/commits/aebc6ce81407989d5af76c15324e5ba826e7d296#diff-168726dbe96b3ce427e7fedce31bb0bcR122
var server = awsServerlessExpress.createServer(app, null, ['image/png', 'image/jpeg']);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
