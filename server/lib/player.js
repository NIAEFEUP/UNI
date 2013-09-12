
var Deck = require('./deck');

module.exports = Player;



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

Player.prototype.getCards = function(deck, n) {

	if( !(deck instanceof Deck) )
		return -1;

	if( !n )
		n = 1;

	var i,card,r=0;

	for(i = 0; i < n; i++)
	{
		if( deck.cards.length == 0 )
			break;

		card = deck.cards.shift();

		if( card instanceof Deck.Card )
		{
			this.hand.push( card );
			r++;
		}
	}

	return r;
}

