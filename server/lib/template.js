
var allowCrossDomain = true;


module.exports = {zero: respondZero,
				  json: respond,
				  html: respondHTML,
				  redirect: respondRedirect,
				  view: Template };



function addCrossDomainHeaders(res, req)
{
	if( allowCrossDomain )
	{
		res.header('Access-Control-Allow-Origin',      req.headers.origin);
		res.header('Access-Control-Allow-Methods',     'GET, POST');
		res.header('Access-Control-Allow-Headers',     'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
		res.header('Access-Control-Allow-Credentials', true);
	}
}

function respondZero(res, req, statusCode, crossDomain)
{
	if(    crossDomain === undefined
		|| crossDomain === true )
		addCrossDomainHeaders(res, req);
	
	res.writeHead(statusCode, {'Content-Length': 0});

	res.end();
}

function respondRedirect(res, path)
{
	res.writeHead(302, {'Content-Type': 'application/json; charset=utf-8',
						'Location': path,
						'Content-Length': 0});
	res.end();
}

function respond(res , req, obj, crossDomain, callback, size)
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
	
	if(    crossDomain === undefined
		|| crossDomain === true )
		addCrossDomainHeaders(res, req);

	res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8',
						'Content-Length': size});

	res.write(out);
	res.end();
}

function respondHTML(res , req, out, crossDomain)
{
	var size = Buffer.byteLength(out, 'UTF-8');
	
	if(    crossDomain === undefined
		|| crossDomain === true )
		addCrossDomainHeaders(res, req);

	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8',
						'Content-Length': size});

	res.write(out);
	res.end();
}





function Template() {}

Template.login = function(res, req)
{
		var 
		out  = "<!DOCTYPE html>\n<html><head><title>UNO Admin Area</title></head><body>Admin Code:<br>";
		out += '<form method="POST"><input type="password" name="code"/> <input type="submit" value="Enviar"></form>';
		out += '</body></html>';

		respondHTML(res, req, out, false);
};

Template.index = function(res, req, game)
{

	var i,player,now = Utils.getTime(),

	out  = "<!DOCTYPE html>\n"

		+ '<html><head><meta http-equiv="refresh" content="5"><title>UNO Admin Area</title></head><body>'
		+ '<b>Game:</b> ' + game.gamesPlayed
		+ '<br><b>State:</b> ' + ( game.isStopped() ?
									'Stopped' :
									( game.isPlaying() ?
										'Playing' : 
										'Paused' ) )

		+ '<br><br><a href="adm-pause-toggle">Resume/Pause</a> | <a href="adm-stop">Stop</a> | <a href="adm-reset">Reset</a> '

		+ '<hr><b>Active Players:</b><br>';

	for( i = 0; i < game.activePlayers.length; i++ )
	{
		player = game.activePlayers[i] ;

		if( !player.onQueue )
		{
			out += '<div>* ' + player.name + ' | Iddle: ' + (now - player._time ) + 's ' ;

			if( !game.isStopped() )
			{
				out += ' | Cards: ' + player.hand.length
					+  ' | <a href="adm-give/' + i + '/2">Give +2</a>'
					+  ' | <a href="adm-give/' + i + '/4">Give +4</a>' ;
			}
			
			out += ' | <a href="adm-kick/' + player.id + '">Kick</a>'
				+  '</div>';
		}
	}

	out += '<hr><b>Queued Players:</b>';

	for( i = 0; i < game.playerQueue.length; i++ )
	{
		player = game.playerQueue[i] ;

		out += '<div>* ' + player.name + ' | ' + (now - player._time ) + 's '
				+ ' | <a href="adm-kick/' + player.id + '">Kick</a>'
				+ '</div>';
	}

	out += '<hr><a href="adm-logout">Logout</a></body></html>' ;

	respondHTML(res, req, out, false);
};
