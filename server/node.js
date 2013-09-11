

var express = require('express')
  , MemoryStore = require('express').session.MemoryStore
  , app = express();



app.use(express.cookieParser());
app.use(express.session({ secret: 'ni is the best, so fuck the rest'}));
app.use(app.router);




app.get('/*', function (req, res) {


	if( !req.session.message )
    	req.session.message = Math.random();


    //req.session = null;

    var id = req.session.message;



    res.end('Created session with message : '+ id);

});

app.listen(3000);
console.log('Listening on port 3000');