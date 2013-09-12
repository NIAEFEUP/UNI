
var player = require('./player');


module.exports = Deck;
module.exports.Card = Card;

function Card(type, color) {
	this.type = type;
	this.color = color;
}

// Card.prototype.getType = function() {
// 	return this.type;
// }

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
	WILD_DRAW4	: 14 };

Card.COLOR = {
	RED		: 0,
	GREEN	: 1,
	BLUE	: 2,
	YELLOW	: 3,
	NONE	: 4 };


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

function Deck() {
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


}


Deck.prototype.shuffle = function() {

	var i,swap, temp;

	for (i = this.cards.length - 1; i > 0; i--)
	{ 
    	swap = (Math.random() * i) | 0 ;
    	temp = this.cards[i];
    	this.cards[i] = this.cards[swap];
    	this.cards[swap] = temp;
	}
};
