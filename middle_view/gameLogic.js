var turn=0;
var activePlayer=-1;
var players=new Array();
var cards=new Array();
var gameNumber=0;
var votes=0;
var gameStatus=0;

function Card(color,value) {
	console.log(color);
	console.log(value);
	this.color = color;
	this.value = value;
	switch(parseInt(color))
	{
		case 0:this.color="red";break;
		case 1:this.color="green";break;
		case 2:this.color="blue";break;
		case 3:this.color="yellow";break;
		case 4:this.color="wild";break;
		default:this.color="error";
	}
	switch(parseInt(value))
	{
		case 10:this.valuetext="<i class='icon-blocked'></i>";break;
		case 11:this.valuetext="+2";break;
		case 12:this.valuetext="<i class='icon-loop'></i>";break;
		case 13:this.valuetext="<i class='icon-wild'></i>";break;
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

function updateCurrentPlayers() {
	$("#currentPlayers").html("");
	for (x in players) {
		var active="";
		if (gameStatus!=0 && x==activePlayer) {active=" active";}
		$("#currentPlayers").append(
			"<div class='player"+active+"'>"
			+"<i class='icon-user'></i><br/>"
			+players[x]+"<br/>"
			+((cards && cards.length>x)?("<i class='icon-hand'></i> "+cards[x]+""):"")
			+"</div>"
		);
	}
}

function updateVotes(votes,players) {
	if (votes<players) {
		$("#votes").html("Votos: "+votes+"/"+players);
	}
	else if (votes==players) {
		$("#votes").html("");
	}
}


function recieveCard(color,value) {
	(new Card(color,value)).render();
}

function updateStatus() {
	$.getJSON("http://localhost:3000/status?callback=?", function(data) {
		if (data.h) {
			recieveCard(data.h.c,data.h.t);
		}
		if (data.p!==undefined) {
			activePlayer=data.p;
			updateCurrentPlayers();
		}
		cards=data.c;
	}).always(function() {setTimeout(updateStatus,1000);});
}

function updateLobby() {
	$.getJSON("http://localhost:3000/lobby?callback=?", function(data) {
		if (data.p) {
			players=data.p;
			updateCurrentPlayers();
			updateVotes(data.tv,data.ps);
		}
		gameStatus=data.s;
	}).always(function() {
		if (gameStatus==0) {
			setTimeout(updateLobby,1000);
		}
	});
}


updateLobby();
updateStatus();
