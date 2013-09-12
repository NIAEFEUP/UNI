var pileElement = "#cardPile";

function Card(color,value) {
	this.color = color;
	this.value = value;
	if (value=="stop") {
		this.value="<i class='icon-blocked'></i>";
	}
	else if (value=="reverse") {
		this.value="<i class='icon-loop'></i>";
	}
}

Card.prototype.render = function() {
	$(pileElement).html(
		'<div class="card '+this.color+'">' +
		'<div class="cardsmall cardtop">' +
		this.value +
		'</div>' +
		'<div class="cardbody">' +
		this.value +
		'</div>' +
		'<div class="cardsmall cardbot">' +
		this.value +
		'</div>' +
		'</div>');
}
