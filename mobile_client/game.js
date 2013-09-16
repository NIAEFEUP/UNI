var playurl="ni.fe.up.pt/uno/";
var room="1";

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
		case 13:this.valuetext="<i class='icon-wild'></i>";break;
		case 14:this.valuetext="<i class='icon-hand'></i>";break;
		default:this.valuetext=value;
	}
}

Card.prototype.html = function() {
	return 	'<div class="card" data-color="'+this.color+'" data-value="'+this.value+'">' +
			'<div class='+this.colortext+'>' +
			'<div class="cardtext">' +
			this.valuetext +
			'</div>' +
			'</div>' +
			'</div>';
}


$(document).ready(function() {
	
	/*
	getjson a cada sala para saber lugares
	*/
	
	
	$("#gamejoin").click(function(){
		$("#loadmsg").append("A carregar o jogo.");
		$("#lobby").hide();
		$("#loading").show();
		$.post(playurl,{/*args*/},function(data){
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
		$("#lobby").hide();
		$("#loading").show();
		
		$.post(playurl,{/*args*/},function(data){
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
		console.log("pick a card");
		/*
		$.post(playurl,{//args
		},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio
				{

				}else{
					//TODO  sacar as cartas
				}
		}).error(
		function(){
			
		});*/
	});
	
	$(document).on('click','.card',function(event){
		
		console.log($(this).data("color")+" "+$(this).data("value"));
		
	});
	
	/*teste*/
	$("#lobby").hide();
	$("#game").show();
	var c1=new Card("0","11");
	var c2=new Card("1","13");
	var c3=new Card("2","10");
	var c4=new Card("3","12");
	var c5=new Card("4","14");
	
	$("#cardsdiv").append(c1.html());
	$("#cardsdiv").append(c2.html());
	$("#cardsdiv").append(c3.html());
	$("#cardsdiv").append(c4.html());
	$("#cardsdiv").append(c5.html());
	$("#cardsdiv").append(c1.html());
	$("#cardsdiv").append(c2.html());
	$("#cardsdiv").append(c3.html());
	$("#cardsdiv").append(c4.html());
	$("#cardsdiv").append(c5.html());
	$("#cardsdiv").append(c1.html());
	$("#cardsdiv").append(c2.html());
	$("#cardsdiv").append(c3.html());
	$("#cardsdiv").append(c4.html());
	$("#cardsdiv").append(c5.html());
});

