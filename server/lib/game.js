

global.Game = Game;

function Game()
{
	this.playerQueue = [];
	this.gamesPlayed = 0;

	this.reset();
}

Game.STATE = {
	STOP	: 0,
	PLAYING	: 1,
	PAUSED	: 2,
}

Game.PLAYER_LIMIT = 10;
Game.MIN_PLAYER = 4;

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

	this.round = 0;

	this.activePlayers = [];

	this.curPlayer = 0;
	this.direction = 1;

	this.bufferType = -1;
	this.bufferSize = 0;

	this.startVotes = 0;

	this.handsCache = [];
	this.namesCache = [];

	this.playersOut = 0;

	this.deck = new Deck();
	this.discard = new DiscardPile();

	this.state = Game.STATE.STOP;
}

Game.prototype.isStopped = function() {

	return this.state === Game.STATE.STOP ;
}
Game.prototype.isPlaying = function() {

	return this.state === Game.STATE.PLAYING ;
}



Game.prototype.canStart = function() {

	return     this.isStopped()
			&& this.activePlayers.length >= Game.MIN_PLAYER
			&& this.startVotes === this.activePlayers.length ;
}


Game.prototype.start = function() {

	if( !this.isStopped() )
		return false;

	this.deck.shuffle();
	Utils.arrayShuffle(this.activePlayers);
	this.buildPlayerNamesCache();

	for(var i = 0; i < this.activePlayers.length; i++ )
		this.giveCard( this.activePlayers[i], 7 );

	//TODO: carta da mesa
	this.discard.push( this.deck.cards.pop() );

	this.countPlayerCards();

	this.state = Game.STATE.PLAYING;

	return true;
}


Game.prototype.canAddPlayer = function() {

	return     this.isStopped()
			&& this.activePlayers.length < Game.PLAYER_LIMIT ;

}

Game.prototype.addPlayer = function(player) {

	if(    player instanceof Player
		&& player.id >= 0 )
	{
		player.reset();

		if( this.canAddPlayer() )
		{
			player.onQueue = false;
			this.activePlayers.push( player );

			for(var i = 0; i < this.activePlayers.length; i++ )
				this.activePlayers[i].startVote = false;

			this.startVotes = 0;

			this.buildPlayerNamesCache();

			return true;
		}
		else
			this.playerQueue.push( player );
	}

	return false;
}


Game.prototype.calculateNextPlayer = function() {

	if( this.activePlayers.length > 0 )
		return ( this.curPlayer + this.direction ).mod( this.activePlayers.length ) ;

	return -1;
}

Game.prototype.getPlayer = function() {

	if(    this.curPlayer >= 0
		&& this.curPlayer < this.activePlayers.length )
		return this.activePlayers[this.curPlayer];
}
// Game.prototype.pollNextPlayer = function() {

// 	var poll = this.calculateNextPlayer();

// 	if(    poll >= 0
// 		&& poll < this.activePlayers.length )
// 		return this.activePlayers[poll];
// }


Game.prototype.moveToNextPlayer = function() {

	if( this.isPlaying() )
	{
		var i,player;

		for(i = 0; i < this.activePlayers.length; i++ )
		{
			this.curPlayer = this.calculateNextPlayer();
			player = this.getPlayer();

			if( player && player.hand.length > 0 )
			{
				player.hasDrawn = false;

				break;
			}
		}
	}
}


Game.prototype.countPlayerCards = function() {

	this.handsCache = [];
	
	for( var i = 0; i < this.activePlayers.length; i++ )
		this.handsCache.push( this.activePlayers[i].hand.length )
}

Game.prototype.buildPlayerNamesCache = function() {

	this.namesCache = [];
	
	for( var i = 0; i < this.activePlayers.length; i++ )
		this.namesCache.push( this.activePlayers[i].name )
}


Game.prototype.moveToNextRound = function() {

	if( this.isPlaying() )
	{
		this.round++;
		this.moveToNextPlayer();

		if( this.bufferSize > 0 )
		{
			var found = false,
				player = this.getPlayer();

			for(var i = 0; i < player.hand.length; i++)
			{
				if(player.hand[i].t === this.bufferType)
				{
					found = true;
					break;
				}
			}
		
			if( !found )
				this.acceptDraw();
		}


		this.countPlayerCards();
	}
}


Game.prototype.canSkipPlay = function() {

	return this.getPlayer().hasDrawn ;
}

Game.prototype.acceptDraw = function() {

	if( this.isPlaying() && this.bufferSize > 0 )
	{
		this.giveCard(this.getPlayer(), this.bufferSize);
		this.bufferSize = 0;

		return true;
	}

	return false;
}


Game.prototype.reverseDirection = function() {

	this.direction *= -1;
}

Game.prototype.canPlayCard = function(card) {

	return this.discard.canPlayCard( card ) ;
}


Game.prototype.playCard = function(card, color) {

	if(    !this.isPlaying()
		|| !this.discard.canPlayCard( card ) )
		return false;

	if( card.isWild() )
	{
		if( !Game.isColorValid(color) )
			return false;

	    card.c = color;
	}

	this.discard.push( card );

	if(    this.bufferSize > 0
		&& card.t !== this.bufferType )
		this.acceptDraw();

	switch( card.t )
	{
		case Card.TYPE.SKIP:

			this.moveToNextPlayer();
			break;

		case Card.TYPE.REVERSE:
			
			if( ( this.activePlayers - this.playersOut ) === 2 )
				this.moveToNextPlayer();
			else
				this.reverseDirection();
			break;

		case Card.TYPE.DRAW2:

			this.bufferType = Card.TYPE.DRAW2;
			this.bufferSize += 2;
			break;

		case Card.TYPE.WILD_DRAW4:

			this.bufferType = Card.TYPE.WILD_DRAW4;
			this.bufferSize += 4;
			break;
	}


	return true;
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






Game.prototype.startTimer = function(callback, time) {

	var game = this,
		_check = function() {

		callback();

		setTimeout(_check, time);
	};

	setTimeout(function(){
		_check();
	}, time);

}
