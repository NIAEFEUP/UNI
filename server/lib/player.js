


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

// Player.prototype.isTimeValid = function(secs) {
	
// 	if( t === undefined )
// 		t = Utils.getTime() ;

// 	return this._time >= ( t - secs ) ;
// }
