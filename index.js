const { port } = require('./config');
const express = require('express');
const app = express();
const useragent  = require('express-useragent');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressip = require('express-ip');

const users = require('./routes/users');
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({limit: '1kb'}));
app.use(useragent.express());
app.use(expressip().getIpInfoMiddleware);

app.use(function(err, req, res, next) {
  console.log((new Date).toUTCString(),'Error!',err.type, req.headers, req.method, req.url);
  res.status(500).end();
});
app.use(users);



module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  })
}
