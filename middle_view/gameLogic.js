var turn=0;
var activePlayer="";
var cards=new Array();

function Card(color,value) {
	
	this.color = color;
	this.value = value;
	switch(parseInt(color))
	{
		case 0:this.colortext="Red";break;
		case 1:this.colortext="Green";break;
		case 2:this.colortext="Blue";break;
		case 3:this.colortext="Yellow";break;
		case 4:this.colortext="Wild";break;
		default:this.colortext="Error";
	}
	switch(parseInt(value))
	{
		case 10:this.valuetext="<i class='icon-blocked'></i>";break;
		case 11:this.valuetext="+2";break;
		case 12:this.valuetext="<i class='icon-loop'></i>";break;
		case 13:this.valuetext="Wild";break;
		case 14:this.valuetext="+4";break;
		default:this.valuetext=value;
	}
}

Card.prototype.render = function() {
	$("#cardPile").html(
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

function updateCurrentPlayers(players,cards) {
	$("#currentPlayers").html("");
	for (x in players) {
		var active="";
		if (players[x]==activePlayer) {active=" active";}
		$("#currentPlayers").append(
			"<span class='player"+active+"'>"
			+players[x]
			+((cards && cards.length>x)?(" ("+cards[x]+")"):"")
			+"</span>"
		);
	}
}


function recieveCard(color,value) {
	(new Card(color,value)).render();
}

function update() {
	$.getJSON("http://localhost:3000/status?callback=?", function(data) {
		console.log(data);
		if (data.h) {
			recieveCard(data.h.c,data.h.t);
		}
		if (data.p) {
			activePlayer=data.p;
		}
		cards=data.c;
	});
	$.getJSON("http://localhost:3000/lobby?callback=?", function(data) {
		if (data.p) {
			updateCurrentPlayers(data.p)
		}
	});
	setTimeout(update,1000);
}

update();
