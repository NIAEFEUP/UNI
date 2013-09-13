

var express = require('express') ,
	app = express();

app.use(express.cookieParser());
app.use(express.session({ key: 'uno',
						  secret: 'ni is the best, so fuck the rest',
						  cookie: { path: '/' }
						  } ));
app.use(app.router);
app.disable('x-powered-by');


require('./lib/utils');
require('./lib/deck');
require('./lib/game');
require('./lib/player');


var players = [],
    pid = 0,
    game = new Game();


app.get('/enter', function (req, res) {

	var c, id = req.session.c;

	if( id !== undefined )
		c = players[id];

	else
	{
		req.session.c = id = pid++;
		players[id] = c = new Player("Unknown", id);

		console.log( 'New client received [' + c.name + ', ' + c.id + ']' );
	}


	res.end('Welcome player: '+ c.name + ', id: ' + c.id );

});


app.get('*', function (req, res) {

	res.writeHead(404);
	res.end();
});

app.listen(3000);

console.log('Listening on port 3000');
