

module.exports = Client;



function getTime()
{
	return ( new Date() / 1000 ) | 0 ;
}



function Client(name) {
	this._name = name;
	this.updateTime();
}




Client.prototype.name = function() {
	return this._name;
}

Client.prototype.updateTime = function() {
	this._time = getTime();
}

Client.prototype.isTimeValid = function(secs) {
	return this._time >= ( getTime() - secs ) ;
}