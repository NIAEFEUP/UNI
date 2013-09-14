

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
app.use(express.bodyParser());
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
	playerNames = [],
    pid = 0,
    game = new Game();



function respond(res , obj, callback, size)
{
	var out = JSON.stringify(obj),
		len;

	if (callback)
		out=callback+'('+out+')';

	len = Buffer.byteLength(out, 'UTF-8');

	if ( size === undefined )
		size = len;
	else
		size += len;
	
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
		    hand = ( pid !== undefined && game.isPlaying() && !players[pid].onQueue ) ? players[pid].hand : [] ,

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


app.get('/lobby', function (req, res) {

	var out,
		pid = req.session.pid,
		player = (pid !== undefined ) ? players[pid] : false ;

	if( playerNames.length !== game.activePlayers.length )
	{
		playerNames = [];

		for(var i = 0; i < game.activePlayers.length; i++ )
			playerNames.push( game.activePlayers[i].name );
	}

    out = { s: game.state,
			p: playerNames,
			ps: playerNames.length,
			pl: Game.PLAYER_LIMIT,
			qs: game.playerQueue.length,
			q: player ? player.onQueue : null,
			v: player ? player.startVote : null,
			tv: game.startVotes };

	respond(res, out, req.query.callback);

});


app.post('/lobby', function (req, res) {

	var c, id = req.session.pid, name = '';

	if( id !== undefined )
	{
		c = players[id];
		name = c.name;
	}
	else
	{
		name = req.body.name ;

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

			game.addPlayer( c );

			console.log( 'New client received [' + c.name + ', ' + c.id + ', ' + (!c.onQueue  ? 'OK' : 'Queue') + ']' );
		}
	}

	var out = { n: name,
		  		q: c.onQueue };

	respond(res, out, req.body.callback);
});

app.post('/vote-start', function (req, res) {

	if( game.isStopped() )
	{
		var pid = req.session.pid,
			player = (pid !== undefined ) ? players[pid] : false ;

		if( player && !player.onQueue )
		{
			if( !player.startVote )
			{
				player.startVote = true;
				game.startVotes++;

				if( game.activePlayers.length === game.startVotes )
				{
					for(var i = 0; i < game.activePlayers.length; i++ )
						game.giveCard(game.activePlayers[i], 7);


					//TODO: carta da mesa

					game.state = Game.STATE.PLAYING;
				}
				
			}

			res.writeHead(200);
			res.end();
		}


	}

	res.writeHead(403);
	res.end();
});



app.all('*', function (req, res) {

	console.log('Wrong request received: ' + req.path);

	res.writeHead(404, {'Content-Length': 0});
	res.end();
});


app.listen(port);

console.log('Listening on port ' + port);
