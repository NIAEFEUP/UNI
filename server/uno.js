

var express = require('express') ,
	app = express(),
	Player  = require('./lib/player'),
	Deck = require('./lib/deck');

app.use(express.cookieParser());
app.use(express.session({ secret: 'ni is the best, so fuck the rest'}));
app.use(app.router);

var clients = [];
var cid = 0;

var deck = new Deck();
deck.shuffle();
var player1 = new Player(),
	player2 = new Player(),
	player3 = new Player(),
	player4 = new Player();


player1.getCards(deck, 7);
player2.getCards(deck, 7);
player3.getCards(deck, 7);
player4.getCards(deck, 7);


console.log("deck: " + deck + ", " + deck.cards.length);

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
