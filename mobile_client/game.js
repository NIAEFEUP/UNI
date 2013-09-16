var playurl="http://localhost:3000/";
var room="";
var playerName="";
var status;
var active=false;
var inqueue=true;
var gamestarted=false;
var drawbuffer=false;
var callback="?callback=?";


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

function QueryStatus()
{

}

function QueryLobby()
{
	
}

$(document).ready(function() {
	
	
	
	
	$("#gamejoin").click(function(){

		active=false;
		$("#loadmsg").html("<i class='icon-spinner icon-spin icon-4x'></i>A carregar o jogo.");
		$("#lobby").hide();
		$("#loading").show();
		
		
		room="/"+$("#roomslt").val()+"/";
		room="";
		playerName=$("#name").val();
		console.log(playerName+" "+room);
		
		$.post(playurl+room+"lobby",{name:playerName},function(data){
				
				active=true;
				console.log("sucesso lobby");
				$("#loading").hide();
				if (data=="null")//json de jogo cheiro
				{
					$('#lobbyerrormsg').text("Jogo cheio. Por favor tente outro jogo.");
					$('#lobbyerrormsg').show();
				}else{
					//TODO joinar o jogo
					$("#game").show();
					console.log(data.q);
					if (data.q==false)
					{
						inqueue=false;
						QueryStatus();
					}
					else
					{
						inqueue=true;
						QueryStatus();
					}
				}
		},'json').fail(
		function(jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "lobbyRequest Failed: " + err);
			active=true;
			$("#loading").hide();
			$('#lobbyerrormsg').text("Erro a entrar no jogo. Por favor tente outra vez.");
			$('#lobbyerrormsg').show();
			$('#lobby').show();
		})/*.always(function(){
			alert("x3");
		})*/;
	});
	
	/*$("#gameauto").click(function(){
		if (active==true){	
			
			$("#loadmsg").text("A carregar o jogo.");
			$("#lobby").hide();
			$("#loading").show();
			active=false;
			$.post(playurl+room,{//args
			},function(data){
					//console.log(data);
					active=false;
					if (data=="null")//json de jogo cheio
					{
						$('#lobbyerrormsg').text("Jogo cheio. Por favor tente outro jogo.");
						$('#lobbyerrormsg').show();
					}else{
						//TODO joinar o jogo
					}
			}).fail(
			function(){
				$('#lobbyerrormsg').text("Erro a entrar no jogo. Por favor tente outra vez.");
				$('#lobbyerrormsg').show();
				active=true
			});
		}
	});*/
	
	$("#drawcard").click(function(){
		if (active==true){
			
		/*
		$.post(playurl,{//args
		},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio
				{

				}else{
					//TODO  sacar as cartas
				}
		}).fail(
		function(){
			
		});*/
		}
		console.log("pick a card "+active);
		
	});
	
	
	$(document).on('click','.card',function(event){
		if (active==true){	
			
		}
		console.log($(this).data("color")+" "+$(this).data("value")+" "+active);
	});
	
	$("#readycheck").click(function(){
		if (active==true){
			
		/*
		$.post(playurl,{//args

		},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio

				{

				}else{
					//TODO  sacar as cartas

				}
		}).fail(
		function(){
			
		});*/
		}
		console.log("readycheck "+active);
		
	});
	
	$("#skipturn").click(function(){
		if (active==true){
			
		/*
		$.post(playurl,{//args

		},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio

				{

				}else{
					//TODO  sacar as cartas

				}
		}).fail(
		function(){
			
		});*/
		}
		console.log("skipturn"+active);
		
	});
	
	$("#acceptdraw").click(function(){
		if (active==true){
			
		/*
		$.post(playurl,{//args

		},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheio

				{

				}else{
					//TODO  sacar as cartas

				}
		}).fail(
		function(){
			
		});*/
		}
		console.log("acceptdraw "+active);
		
	});
	
	$("#exitbtn").click(function(){
		if (active==true){
			
		$.ajax({type:'DELETE',url:playurl+"lobby",done:function(data){
				active=true;
				console.log("sucesso sair");
				$("#game").hide();
				$("#statusmsg").hide();
				$("#lobby").show();
				}});
		}
		console.log("exitbtn "+active);
		
	});
	
	active=true; //ativar os campos
	
	/*teste*/
	/*$("#lobby").hide();
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
	$("#cardsdiv").append(c5.html());*/
});



