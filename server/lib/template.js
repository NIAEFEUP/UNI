
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
		out  = '<html><head></head><body>Enter Code:<br>';
		out += '<form method="POST"><input type="text" name="code"/><br><input type="submit" value="Enviar"></form>';
		out += '</body></html>';

		respondHTML(res, req, out, false);
};