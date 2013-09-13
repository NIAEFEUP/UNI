


global.Player = Player;



function getTime()
{
	return ( new Date() / 1000 ) | 0 ;
}



function Player(name, id) {
	this.name = name;
	this.id = id;
	this.hand = [];
	this.hasDrawn = false;
	this.onQueue = false;

	this.updateTime();
}



Player.prototype.updateTime = function() {
	this._time = getTime();
}

Player.prototype.isTimeValid = function(secs) {
	return this._time >= ( getTime() - secs ) ;
}
