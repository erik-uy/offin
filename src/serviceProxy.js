var express = require('express');
var axios = require('axios');
var app = express();
var proxy = require('express-http-proxy');

app.use(express.static('dist'));


app.use('/v1', proxy('https://api.transport.nsw.gov.au/', {
    proxyReqPathResolver: function (req) {
        return '/v1' + req.url;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
      // you can update headers
      proxyReqOpts.headers['Content-Type'] = 'text/json';

      // apply api key
      proxyReqOpts.headers['Authorization'] = 'apikey fDHe0e8rguQmXsSYvNn04W4ROqJ8dLt3wIii';
      return proxyReqOpts;
    }}));



app.listen(3000);