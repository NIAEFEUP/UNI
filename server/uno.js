

var express = require('express') ,
	app = express();

require('./lib/utils');
require('./lib/deck');
require('./lib/game');
require('./lib/player'),

app.use(express.cookieParser());
app.use(express.session({ secret: 'ni is the best, so fuck the rest'}));
app.use(app.router);


var clients = [];
var cid = 0;

var game = new Game();

for(var i = 0; i < 4; i++)
{
	var a = game.canAddPlayer();
	console.log("Can add: " + a);

	if( a )
	{
		var p = new Player();
		game.addPlayer( p );

		game.giveCard(p, 7);
	}
}




console.log("deck: " + game + ", " + game.deck.size());

// for(var i = 0; i < deck.cards.length; i++)
// {
// 	console.log(deck.cards[i]);
// }

app.get('/*', function (req, res) {
    
	var id = req.session.c,
		c, plus;

	if( id !== undefined )
		c = clients[id];

	else
	{
		req.session.c = id = cid++;
		clients[id] = c = new Client(id);

		console.log( 'New client received, id: ' + id );
	}

	plus = 60000;

	// console.log(c._time);
	// console.log(c.isTimeValid(5));
	
	req.session.cookie.expires = new Date(Date.now() + plus);
	req.session.cookie.maxAge = plus;

	res.end('Welcome client: '+ c.name());

});

app.listen(3000);

console.log('Listening on port 3000');
