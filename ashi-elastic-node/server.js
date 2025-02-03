
const express = require('express');
const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');
const expressJwt = require('./security/jwt') ;

const config = require('./config.json')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());




//var uploadController = require('./api/client/client.controller') ;
//app.use ('/api/v1',  expressJwt({ secret: config.secret, algorithms: ["HS256"] })  ) ;
app.use('/api/v1/elastic',  require('./api/controllers/elastic.controller'));
app.use('/api/v1/reference',  require('./api/controllers/reference.controller'));
app.use('/api/v1/search',  require('./api/controllers/search.controller'));
app.use('/api/v1/s2s',  require('./api/controllers/s2s.controller'));
app.use('/api/v1/dotnet-to-elastic',  require('./api/controllers/dotnet-to-elastic.controller'));
app.use('/api/v1/test', (req, res) => res.send('Hello World!')) ;
const port = process.env.PORT;
//require("utils/mongo-pool").initPool();
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
    console.log('Server Check=in Version 1.0.0000') ;
});