

global.Game = Game;

function Game()
{
	this.playerQueue = [];
	this.activePlayers = [];

	this.reset();
}

Game.STATE = {
	STOP	: 0,
	PLAYING	: 1,
}

Game.isColorValid = function(color) {

	switch(color)
	{
		case Card.COLOR.RED:
		case Card.COLOR.GREEN:
		case Card.COLOR.BLUE:
		case Card.COLOR.YELLOW:
			return true;
	}

	return false;
}

Game.prototype.reset = function() {

	this.curPlayer = 0;
	this.direction = 1;
	this.plusBuffer = 0;

	this.deck = new Deck();
	this.discard = new DiscardPile();

	this.stat = Game.STATE.STOP;
}

Game.prototype.isPlaying = function() {

	return this.state === Game.STATE.PLAYING ;
}

Game.prototype.canAddPlayer = function() {

	return     !this.isPlaying()
			&& this.activePlayers.length < 15 ;

}

Game.prototype.addPlayer = function(player) {

	if(    player instanceof Player
		&& this.canAddPlayer() )
	{
		this.activePlayers.push( player );

		return true;
	}

	return false;
}

Game.prototype.queuePlayer = function(player) {

	this.playerQueue.push( player );
}

Game.prototype.moveToNextPlayer = function() {

	this.curPlayer = this.calculateNextPlayer() ;
}

Game.prototype.calculateNextPlayer = function() {

	if( this.activePlayers.length > 0 )
		return ( this.curPlayer + this.direction ).mod( this.activePlayers.length ) ;

	return -1;
}

Game.prototype.getPlayer = function() {

	if(    this.curPlayer > 0
		&& this.curPlayer < this.activePlayers.length )
	return this.activePlayers[this.curPlayer];
}

Game.prototype.pollNextPlayer = function() {

	var poll = this.calculateNextPlayer();

	if(    poll > 0
		&& poll < this.activePlayers.length )
	return this.activePlayers[poll];
}

Game.prototype.reverseDirection = function() {

	this.direction *= -1;
}



Game.prototype.playCard = function(card, color) {

	if(    !this.isPlaying()
		|| !this.discard.canPlayCard( card ) )
		return false;

	if( card.isWild() )
	{
		if( !Game.isColorValid(color) )
			return false;

	    card.color = color;
	}

	this.discard.push( card );

	switch( card.type )
	{
		case Card.TYPE.SKIP:

			this.moveToNextPlayer();
			break;

		case Card.TYPE.REVERSE:
			
			this.reverseDirection();
			break;

		case Card.TYPE.DRAW2:

			break;

		case Card.TYPE.WILD_DRAW4:

			break;
	}

	this.moveToNextPlayer();

};

Game.prototype.giveCard = function(player, n) {

	if( !(player instanceof Player) )
		return -1;

	if( !n )
		n = 1;

	var i,card,r=0;

	for(i = 0; i < n; i++)
	{
		if( this.deck.size() === 0 )
		{
			this.deck.absorb( this.discard );

			if( this.deck.size() === 0 )	
				break;
		}

		card = this.deck.cards.pop();

		if( card instanceof Card )
		{
			player.hand.push( card );
			r++;
		}
	}

	return r;
}
