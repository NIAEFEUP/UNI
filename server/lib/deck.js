

global.Card = Card;
global.Deck = Deck;
global.DiscardPile = DiscardPile;


/***********************************************************************
 *	Card
 ***********************************************************************/

function Card(type, color)
{
	this.t = type;
	this.c = color;
}

Card.prototype.isWild = function() {
	return     this.t === Card.TYPE.WILD
			|| this.t === Card.TYPE.WILD_DRAW4 ;
};


Card.TYPE = {
	C0		: 0,
	C1		: 1,
	C2		: 2,
	C3		: 3,
	C4		: 4,
	C5		: 5,
	C6		: 6,
	C7		: 7,
	C8		: 8,
	C9		: 9,
	SKIP	: 10,
	DRAW2	: 11,
	REVERSE	: 12,
	WILD 	: 13,
	WILD_DRAW4	: 14
};

Card.COLOR = {
	RED		: 0,
	GREEN	: 1,
	BLUE	: 2,
	YELLOW	: 3,
	NONE	: 4
};



/***********************************************************************
 *	Deck
 ***********************************************************************/


function colorInitializer(type, stack)
{
	var r = new Card(type, Card.COLOR.RED),
		g = new Card(type, Card.COLOR.GREEN),
		b = new Card(type, Card.COLOR.BLUE),
		y = new Card(type, Card.COLOR.YELLOW);

	stack.push(r);
	stack.push(g);
	stack.push(b);
	stack.push(y);
}

function Deck()
{
	this.cards = [];
	

	var i,j,c;

	for(i = 0; i <= 12; i++)
	{
		colorInitializer(i, this.cards);

		if( i > 0 )
			colorInitializer(i, this.cards);
	}

	for(i = 13; i <= 14; i++)
	{
		for(j = 0; j < 4; j++)
		{
			c = new Card(i, Card.COLOR.NONE);
			this.cards.push(c);
		}
	}

	this.shuffle();
}

Deck.prototype.size = function() {
	return this.cards.length;
};


Deck.prototype.shuffle = function() {
	Utils.arrayShuffle(this.cards);
};

Deck.prototype.absorb = function(pile) {

	if( !(pile instanceof DiscardPile) )
		return false;

	var card, arr = pile.cards;
	
	while( arr.length > 0 )
	{
		card = arr.pop();

		this.cards.push( card );
	}

	this.shuffle();

	return true;
};






/***********************************************************************
 *	DiscardPile
 ***********************************************************************/

function DiscardPile()
{
	this.cards = [];
	this.head = undefined;
}

DiscardPile.prototype.size = function() {
	return this.cards.length;
};

DiscardPile.prototype.canPlayCard = function(card) {

	return  card instanceof Card &&
			(    this.head === undefined		// Primeira carta da mesa
			  || card.isWild() 					// Pode ser jogada em qualquer altura
			  || card.t === this.head.t 	// Carta é do mesmo tipo
			  || card.c === this.head.c // Carta é da mesma cor
			) ; 	
};

DiscardPile.prototype.push = function(card) {

	if( !(card instanceof Card) )
		return false;

	if( this.head !== undefined )
	{
		if( this.head.isWild() )
		    this.head.c = Card.COLOR.NONE;

		this.cards.push( this.head );
	}

	this.head = card;

	return true;
}
