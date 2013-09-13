var joingameurl="";
var joinrndgameurl="";
var playurl="";
//texto: [0-9]/<=> reverse/Stop/+2/+4/Wild

function Card(color,value) {
	
	this.color = color;
	this.value = value;
	switch(color)
	{
		case 0:colortext="Red";break;
		case 1:colortext="Green";break;
		case 2:colortext="Blue";break;
		case 3:colortext="Yellow";break;
		case 4:colortext:"Wild";break;
		default:colortext="Error";
	}
	switch(value)
	{
		case 10:this.valuetext="<i class='icon-blocked'></i>";break;
		case 11:this.valuetext="+2";break;
		case 12:this.valuetext="<i class='icon-loop'></i>";break;
		case 13:this.valuetext="Wild";break;
		case 14:this.valuetext="+4";break;
		default:this.valuetext=value;
	}
}

Card.prototype.html = function() {
	return 	'<div class="card ">' +
			'<div class='+this.colortext+'>' +
			'<div class="cardtext">' +
			this.valuetext +
			'</div>' +
			'</div>' +
			'</div>';
}


$(document).ready(function() {
	
	$("#gamejoin").click(function(){
		$("#loadmsg").text("A carregar o jogo.");
		$("#loading").show();
		
		$.post(joingameurl,{/*args*/},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheiro
				{
					$('#lobbyerrormsg').text("Jogo cheio. Por favor tente outro jogo.");
					$('#lobbyerrormsg').show();
				}else{
					/*TODO joinar o jogo*/
				}
		}).error(
		function(){
			$('#lobbyerrormsg').text("Erro a entrar no jogo. Por favor tente outra vez.");
			$('#lobbyerrormsg').show();
		});
	});
	
	$("#gameauto").click(function(){
		$("#loadmsg").text("A carregar o jogo.");
		$("#loading").show();
		
		$.post(joinrndgameurl,{/*args*/},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio
				{
					$('#lobbyerrormsg').text("Jogo cheio. Por favor tente outro jogo.");
					$('#lobbyerrormsg').show();
				}else{
					/*TODO joinar o jogo*/
				}
		}).error(
		function(){
			$('#lobbyerrormsg').text("Erro a entrar no jogo. Por favor tente outra vez.");
			$('#lobbyerrormsg').show();
		});
	});
	
	$("#drawcard").click(function(){
		/*$("#loadmsg").text("A carregar o jogo.");
		$("#loading").show();*/
		
		$.post(playurl,{/*args*/},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio
				{

				}else{
					/*TODO  sacar as cartas*/
				}
		}).error(
		function(){
			
		});
	});
	
	/*teste*/
	$("#lobby").hide();
	$("#game").show();
	var c1=new Card("0","10");
	var c2=new Card("1","3");
	var c3=new Card("2","11");
	var c4=new Card("3","12");
	var c5=new Card("4","14");
	
	$("#game").append(c1.html());
	$("#game").append(c2.html());
	$("#game").append(c3.html());
	$("#game").append(c4.html());
	$("#game").append(c5.html());
});

