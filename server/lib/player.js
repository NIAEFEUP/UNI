


global.Player = Player;



function getTime()
{
	return ( new Date() / 1000 ) | 0 ;
}



function Player(name) {
	this.name = name;
	this.hand = [];

	this.updateTime();
}



Player.prototype.updateTime = function() {
	this._time = getTime();
}

Player.prototype.isTimeValid = function(secs) {
	return this._time >= ( getTime() - secs ) ;
}
