


global.Player = Player;




function Player(name, id) {
	this.name = name;
	this.id = id;


	this.reset();

	this.updateTime();
}


Player.prototype.reset = function() {

	this.hand = [];
	this.hasDrawn = false;
	this.onQueue = true;
	this.startVote = false;
}



Player.prototype.updateTime = function() {
	this._time = Utils.getTime();
}

Player.prototype.isTimeValid = function(secs) {
	return this._time >= ( Utils.getTime() - secs ) ;
}
