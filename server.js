var app = require('./config/setup-app'),
    http = require('http');

http.createServer(app).listen(app.get('port'), function() {
  console.log('Server up http://localhost:' + app.get('port'));
})