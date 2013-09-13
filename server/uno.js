

var express = require('express') ,
	app = express(),
	args = process.argv.splice(2),
	base = '',
	port = 3000;

for(var i = 0; i < args.length; i++)
{
	if( (i+1) < args.length )
	{
		if( args[i] === '-b' )
		{
			i++;
			base = ( args[i][0] !== '/' ? '/' : '' ) + args[i] ;
		}
		else
		if( args[i] === '-p' )
		{
			i++;
			port = args[i] ;
		}
	}
}


app.use(express.cookieParser());
app.use(express.session({ key: 'uno',
						  secret: 'ni is the best, so fuck the rest',
						  cookie: { path: '/' }
						  } ));
app.use(base, app.router);
app.disable('x-powered-by');


require('./lib/utils');
require('./lib/deck');
require('./lib/game');
require('./lib/player');


var players = [],
    pid = 0,
    game = new Game();



function respond(res , obj, callback, size)
{
	var out = JSON.stringify(obj) ;
	if (callback) {
		out=callback+'('+out+')';
	}
	if( size === undefined )
		size = out.length;
	else
		size += out.length;

	res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8',
						'Content-Length': size});

	res.write(out);

	res.end();
}


app.get('/status', function (req, res) {
	/*if(    req.query.force === 'true'
		|| req.session.lround !== game.round )
	{*/

		var pid = req.session.pid,
		    cPlayer = game.getPlayer(),
		    sPlayer = ( cPlayer && cPlayer.id === pid ) ? true : false,
		    hand = ( pid && game.isPlaying() && !players[pid].onQueue ) ? players[pid].hand : [] ,

		    out = { s: game.state,
		    		r: game.round,
					t: sPlayer,
					p: ( cPlayer ? cPlayer.name : null ),
					h: ( game.discard.head ? game.discard.head : null ),
					l: hand };

		req.session.lround = game.round ;

		respond(res, out, req.query.callback);

	/*}
	else
	{
		res.writeHead(304);
		res.end();
	}*/
});


app.get('/enter', function (req, res) {

	var c, id = req.session.pid,name,
		r = 0;

	if( id !== undefined )
	{
		c = players[id];
		name = c.name;
	}
	else
	{
		name = req.query.name ;

		if( !name )
		{
			res.writeHead(400);
			res.end();

			return;
		}
		else
		{
			req.session.pid = id = pid++;

			players[id] = c = new Player(name, id);

			if( game.addPlayer( c ) )
			{
				game.giveCard(c, 7);
				r = 1
			}
			else
				r = 2;

			console.log( 'New client received [' + c.name + ', ' + c.id + ', ' + (r == 1 ? 'OK' : 'WAITING') + ']' );
		}
	}

	respond(res, {r: r}, req.query.callback);
});


app.get('*', function (req, res) {

	console.log('Wrong request received: ' + req.path);

	res.writeHead(404, {'Content-Length': 0});
	res.end();
});


app.listen(port);

console.log('Listening on port ' + port);
