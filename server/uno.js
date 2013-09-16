

var express = require('express') ,
	app = express(),
	args = process.argv.splice(2),
	base = '',
	port = 3000,
	deadTimerInterval = 5000,
	clientTimeout = 60 ;

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
app.enable('trust proxy');
app.disable('x-powered-by');


require('./lib/utils');
require('./lib/deck');
require('./lib/game');
require('./lib/player');


var players = [],
    _pid = 0,
    adminCode = require('crypto').randomBytes(4).toString('hex');
    game = new Game();



/***********************************************************************
 *	Functions
 ***********************************************************************/

function getSamePlayer(pid)
{
	var player = game.getPlayer();

	if(    player 
		&& player.id === pid
		&& !player.onQueue )
	{
		player.updateTime();
		return player;
	}

	return false;
}

function addCrossDomainHeaders(res)
{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'Cookie');
	res.setHeader('Access-Control-Max-Age', '1000');
}

function respondZero(res, statusCode)
{
	addCrossDomainHeaders(res);
	
	res.writeHead(statusCode, {'Content-Length': 0});

	res.end();
}

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
	
	addCrossDomainHeaders(res);

	res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8',
						'Content-Length': size});

	res.write(out);
	res.end();
}

function checkGameEnded()
{
	if( ( game.playersOut + 1 ) >= game.activePlayers.length )
	{
		game.moveToNextPlayer();
		var player = game.getPlayer();

		if( player && !player.onQueue )
		{
			player.reset();

			game.playerQueue.push( player );
		}

		player = undefined;

		game.reset();
		game.gamesPlayed++;

		console.log( "Game ended" );

		for( var j = 0; j < Game.PLAYER_LIMIT && j < game.playerQueue.length ; j++ )
		{
			player = game.playerQueue.shift();

			if( player )
				game.addPlayer( player );
		}

		return true;
	}

	return false;
}


function removeQueuedPlayer(player)
{
	if(    player
		&& player instanceof Player
		&& player.onQueue )
	{
		var i,p;

		for(i = 0; i < game.playerQueue.length; i++)
		{
			p = game.playerQueue[i];

			if( p && p.id === player.id )
			{
				player.reset();

				game.playerQueue.splice(i, 1);


				if( players[player.id] )
					players[player.id] = null ;

				return true;
			}

		}

	}

	return false;
}

function removeActivePlayer(player, i)
{
	if(    player
		&& player instanceof Player
		&& !player.onQueue )
	{
		var j,card,p,found = false;

		if( i === undefined )
		{
			for(i = 0; i < game.activePlayers.length; i++ )
			{
				p = game.activePlayers[i];

				if( p && p.id === player.id )
				{
					found = true;
					break;
				}
			}
		}
		else
		{
			if(    i >= 0
				&& i < game.activePlayers.length
				&& game.activePlayers[i].id === player.id )
				found = true;
		}

		if( found )
		{
			if( game.isStopped() )
			{
				game.activePlayers.splice(i, 1);
				game.buildPlayerNamesCache();

				player.reset();
			}
			else
			{
				for( j = 0; j < player.hand.length ; j++ )
				{
					card = player.hand[j];

					if( card )
						game.discard.cards.push( card );
				}

				game.playersOut++;
				
				player.reset();
				game.countPlayerCards();
			}

			if( players[player.id] )
				players[player.id] = null ;
			
			return true;
		}
	}

	return false;
}


/***********************************************************************
 *	Routes
 ***********************************************************************/

app.get('/status', function (req, res) {

	var pid = req.session.pid,
	    player = ( pid !== undefined ) ? players[pid] : false ;

	if( player )
		player.updateTime();

	/*if( game.isStopped() )
	{
		respondZero(res, 204);

		return;
	}

	if(    req.session.lround === game.round
		&& req.query.force !== 'true' )
	{
		respondZero(res, 304);

		return;
	}*/

	var cPlayer = game.getPlayer(),
	    hand = ( player && !player.onQueue ) ? player.hand : [] ,

	    out = { g: game.gamesPlayed,
	    		s: game.state,
	    		r: game.round,
				t: ( cPlayer && cPlayer.id === pid ) ? true : false , //pq raio em js uma condição não avalia logo para boleano !? tamanha estupidez!
				p: game.curPlayer ,
				h: game.discard.head ? game.discard.head : null ,
				l: hand,
				c: game.handsCache,
				b: this.bufferSize };


	req.session.lround = game.round ;

	respond(res, out, req.query.callback);

});


app.get('/lobby', function (req, res) {

	var out,
		pid = req.session.pid,
		player = (pid !== undefined ) ? players[pid] : false ;


    out = { g: game.gamesPlayed,
    		s: game.state,
			p: game.namesCache,
			ps: game.activePlayers.length,
			pl: Game.PLAYER_LIMIT,
			qs: game.playerQueue.length,
			q: player ? player.onQueue : null,
			v: player ? player.startVote : null,
			tv: game.startVotes };

	if( player )
		player.updateTime();

	respond(res, out, req.query.callback);

});


app.post('/lobby', function (req, res) {

	var player, id = req.session.pid, name = '';

	if(    id !== undefined
		&& players[id] !== null )
	{
		player = players[id];
		name = player.name;

		if( player )
			player.updateTime();
	}
	else
	{
		name = req.body.name ;

		if( !name )
		{
			respondZero(res, 400);

			return;
		}
		else
		{
			req.session.pid = id = _pid++;
			players[id] = player = new Player(name, id);

			game.addPlayer( player );
			playerNames = [];

			console.log( 'New client received [' + player.name + ', ' + player.id + ', ' + (!player.onQueue  ? 'OK' : 'Queue') + ']' );
		}
	}

	var out = { n: name,
		  		q: player.onQueue };

	respond(res, out, req.body.callback);
});

app.post('/vote-start', function (req, res) {

	if( game.isStopped() )
	{
		var pid = req.session.pid,
			player = (pid !== undefined ) ? players[pid] : false ;

		if( player )
		{
			player.updateTime();


			if(    !player.onQueue
				&& game.activePlayers.length >= Game.MIN_PLAYER )
			{
				if( !player.startVote )
				{
					player.startVote = true;
					game.startVotes++;

					console.log("Votes: " + game.startVotes + "/" + game.activePlayers.length );

					if( game.canStart() && game.start() )
						console.log("Game started");

				}

				respondZero(res, 200);

				return;
			}
		}
	}

	respondZero(res, 403);
});



app.get('/accept-draw', function (req, res) {

	if( game.isPlaying() )
	{
		var pid = req.session.pid,
			cPlayer = getSamePlayer( pid );

		if( cPlayer && game.acceptDraw() )
		{
			respondZero(res, 200);

			return;
		}
	}

	respondZero(res, 403);
});

app.get('/get-one', function (req, res) {

	if( game.isPlaying() )
	{
		var pid = req.session.pid,
			cPlayer = getSamePlayer( pid );

		if( cPlayer && !cPlayer.hasDrawn )
		{
			game.acceptDraw();

			game.giveCard( cPlayer, 1 );
			cPlayer.hasDrawn = true;

			respondZero(res, 200);

			return;
		}
	}

	respondZero(res, 403);
});

app.get('/skip-turn', function (req, res) {

	if( game.isPlaying() )
	{
		var pid = req.session.pid,
			cPlayer = getSamePlayer( pid );

		if( cPlayer && cPlayer.hasDrawn )
		{
			game.acceptDraw();
			game.moveToNextRound();

			respondZero(res, 200);

			return;
		}
	}

	respondZero(res, 403);
});




app.post('/play/:type/:color', function (req, res) {

	if( game.isPlaying() )
	{
		var pid = req.session.pid,
			cPlayer = getSamePlayer( pid );

		if( cPlayer )
		{

			var type = req.params.type,
				color = req.params.color;

			console.log( "Player '" + cPlayer.name + "' [id: " + cPlayer.id + "] played card of type: " + type + " and color: " + color );

			if(    type !== undefined
				&& color !== undefined )
			{
				type = parseInt(type);
				color = parseInt(color);

				var i = 0, card, found = false, nextRound = true;

				for(; i < cPlayer.hand.length; i++ )
				{
					card = cPlayer.hand[i];

					if(    card.t === type
						&& (    card.isWild() 
							 || card.c === color ) )
					{
						found = true;
						break;
					}
				}

				if( !found )
					console.log("Card not found");

				else
				if( !game.playCard( card, color ) )
					console.log("Card cannot be played");

				else
				{
					cPlayer.hand.splice(i, 1);

					if( cPlayer.hand.length === 0 )
					{
						console.log( "Player won");

						cPlayer.reset();

						game.playerQueue.push( cPlayer );

						game.playersOut++;


						nextRound = !checkGameEnded();
					}

					if( nextRound )
						game.moveToNextRound();

					respondZero(res, 200);

					return;
				}
			

			}
		}
	}

	respondZero(res, 403);
});


<<<<<<< HEAD
app.options('/lobby', function (req, res) {
	respondZero(res, 200);
});
app.delete('/lobby', function (req, res) {
=======

app.post('/quit', function (req, res) {
>>>>>>> 5708a7faf4bf59cbdd25b023fbb3e48cf867a2d6

	var pid = req.session.pid,
		player = players[pid],p,
		removed = false,
		queue, playerTurn = false,
		playing = !game.isStopped();

	if( player )
	{
		queue = player.onQueue;

		if( queue )
			removed = removeQueuedPlayer( player ) ;

		else
		{
			if( playing )
			{
				p = game.getPlayer();
				if( p && p.id === pid )
					playerTurn = true;
			}

			removed = removeActivePlayer( player ) ;

			if(    playing
				&& removed
				&& !checkGameEnded()
			    && playerTurn )
				game.moveToNextRound();
		}
					

		var msg = "Player exited '" + player.name + "' [id: " + player.id + "]" ;

		if( removed )
		{
			console.log( msg + ( queue ? ": removed from queue" : '' ) );

			respondZero(res, 200);

			return;
		}

		console.log( msg + ": error exiting" );
	}

	respondZero(res, 403);
});






/***********************************************************************
 *	Admin
 ***********************************************************************/

function admLog(req, msg)
{
	console.log("[ADM " + req.ip + "] " + msg );

}
app.post('/adm-login', function (req, res) {

	var logged = req.session.logged,
		code = req.body.code;

	if(    logged
		|| (    code
			 && code === adminCode ) )
	{
		req.session.logged = true;

		admLog(req, "Successful login");

		respondZero(res, 200);
		return;
	}

	admLog(req, "Bad login");

	respondZero(res, 403);
});


app.post('/adm-logout', function (req, res) {

	var logged = req.session.logged

	if( req.session.logged )
	{
		req.session.logged = false;

		admLog(req, "Successful logout");

		respondZero(res, 200);
		return;
	}

	respondZero(res, 403);
});


app.post('/adm-give/:player/:count', function (req, res) {

	var id = parseInt(req.params.player),
		count = parseInt(req.params.count),
		i,player;

	if(    req.session.logged
		&& id !== undefined
		&& count !== undefined
		&& id >= 0
		&& id < game.activePlayers.length
		&& !game.isStopped() )
	{
		player = game.activePlayers[id];

		i=game.giveCard(player, count);
		game.countPlayerCards();

		admLog(req, "Gave player '" + player.name + "' " + i + " cards");

		respondZero(res, 200);
		return;
	}

	respondZero(res, 403);
});




/***********************************************************************
 *	Start server and dead client timer
 ***********************************************************************/


app.all('*', function (req, res) {

	console.log('Wrong request received: ' + req.path + " [" + req.method + "]");

	respondZero(res, 404);
});

app.listen(port);

console.log('Listening on port ' + port);


game.startTimer(function(){

	var i, player,
		disconnectedPlayerTurn = false,
		deadCount = 0,
		playing = !game.isStopped();
	    now = Utils.getTime() - clientTimeout;

	for( i = game.activePlayers.length - 1 ; i >= 0 ; i-- )
	{
		player = game.activePlayers[i];

		if(    !player.onQueue
			&& player._time < now )
		{

			console.log( "Player disconnected '" + player.name + "' [id: " + player.id + "]" );

			if( !removeActivePlayer(player, i) )
				console.log( "Error removing player!" );

			if(    playing
				&& game.curPlayer === i )
			{
				disconnectedPlayerTurn = true;
				console.log("* Disconnected player turn");
			}

			deadCount++;
		}
	}

	if(    deadCount > 0
		&& playing
		&& !checkGameEnded()
		&& disconnectedPlayerTurn )
		game.moveToNextRound();

}, deadTimerInterval);

console.log('Dead client timer started');
console.log('* Admin code is: ' + adminCode);
