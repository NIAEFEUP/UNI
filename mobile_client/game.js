var playurl="http://ni.fe.up.pt/uni";
var room="";
var playerName="";
var status;
var active=false; //boolean para bloquear inputs durante chamadas ao servidor

//flags
var inqueue=true;
var gameactive=false;
var drawbuffer=false;
var readychecked=false;
var inlobby=false;
var ingame=false;
//pointer ao set timeout para o desativar quando fizer /quit
var timerfunc;
//milisegundos para fazer novo request de status/lobby
var timerms=1000; 


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


function ParseMao(mao )
{
	var htmlstr="";
	var card;
	for (var i=0;i< mao.size;i++)
	{
		card=Card(mao[i].t,mao[i].c);
		htmlstr+=card.html();
	}
	return htmlstr;
}

function QueryStatus()
{
	ingame=true;
	$.ajax({
		url: playurl+room+'status',
		type: 'GET',
		success: function(data, cenas, res){
			
			if( res )
			{
				if( res.status === 204 )
				{	
					$("#statusmsg").text("Jogo terminado");
						$("#statusmsg").show();	
					console.log('Jogo desativado');
				}
				else
				if( res.status === 304 )
				{
					//não fazer nada
					console.log('Página não modificada.');
				}
				else if( res.status === 200 )
				{

					console.log('Jogo activo, e modificado.. Fazer cenas com os dados recolhidos...'+JSON.stringify(data));
					if (data.s==0||data.t==false)
					{
						active=false;
						if (data.t==false)
						{

						$("#statusmsg").text("À espera da sua vez");

						$("#statusmsg").show();		

						}

						else

						{

							$("#statusmsg").text("Jogo pausado");

							$("#statusmsg").show();		

						}

					}	

					else{
						active=true;

						$("#cardsdiv").html(ParseMao(data.l));	

					}
				}
				else
				{
					$("#statusmsg").text("Falha na comunicação com o servidor para atualizar o jogo");
					$("#statusmsg").show();		
				}
			}
			
		}
	}).fail(function(res){
		var st = ( res ? res.status : -1 ) ;
		
		$("#statusmsg").text("Falha a comunicar com o servidor para atualizar o jogo");
		$("#statusmsg").show();		
		console.log("Status Fail: " + st);
	}).always(function(res){
		if(ingame) timerfunc=setTimeout(QueryStatus, timerms);
	});
	
}

function QueryLobby()
{
	active=false;
	inlobby=true;
	$.getJSON(playurl+room+"lobby",{},function(data){
				
				
				console.log("sucesso querylobby "+JSON.stringify(data));
				
				
				if (data.q==false)
				{
					inqueue=false;
					if (data.v==false) {
						
						$("#readycheck").show();
						$("#statusmsg").text("Inicie o ready check");
						$("#statusmsg").show();
					}
					else{
						readychecked=true;
						$("#statusmsg").text("À espera dos outros jogadores");
						$("#statusmsg").show();
						$("#readycheck").hide();
						if (data.s==1)
						{
							inlobby=false;
							gameactive=true;
							QueryStatus();
						}
						
					}
				}
				else
				{
					$("#statusmsg").text("Em queue");
					$("#statusmsg").show();
					inqueue=true;
				}
			
		},'json').fail(
		function(jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "lobbyRequest Failed: " + err);
			
			$("#statusmsg").text("Falha a comunicar com o servidor para atualizar o estado");
			$("#statusmsg").show();		
	}).always(function(){
		active=true;
				if(inlobby) timerfunc=setTimeout(QueryLobby,timerms);	
	});
}

$(document).ready(function() {
	
	
	
	$.ajaxSetup({
		xhrFields: {
		withCredentials: true
		}
	});
	
	$("#gamejoin").click(function(){

		active=false;
		$("#loadmsg").html("<i class='icon-spinner icon-spin icon-4x'></i>A carregar o jogo.");
		$("#lobby").hide();
		$("#loading").show();
		
		
		room="/"+$("#roomslt").val()+"/";
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
						QueryLobby();
					}
					else
					{
						inqueue=true;
						QueryLobby();
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
	
	
	$("#drawcard").click(function(){
		if (active==true&&gameactive==true){
			
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
		if (active==true&&gameactive==true){	
			
		}
		console.log($(this).data("color")+" "+$(this).data("value")+" "+active);
	});
	
	$("#readycheck").click(function(){
		if (active==true){
			active=false;	
		
			$.post(playurl+room+"vote-start",{
			},function(data){
				$("#readycheck").hide();
				$("#statusmsg").text("À espera dos outros jogadores");
				$("#statusmsg").show();
							
			}).fail(
			function(){
			
			}).always(function(){
				active=true;
			});
		}
		console.log("readycheck "+active);
		
	});
	
	$("#skipturn").click(function(){
		if (active==true&&gameactive==true){
			
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
		if (active==true&&gameactive==true){
			
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
			
		$.post(playurl+room+"quit",function(data){
				active=true;
				ingame=false;
				inlobby=false;
				clearTimeout(timerfunc);
				console.log("sucesso sair");
				$("#game").hide();
				$("#statusmsg").hide();
				$("#lobby").show();
				$("#lobbyerrormsg").hide();
				
				});
		}
		
		console.log("exitbtn "+active);
		
	});
	
	active=true; //ativar os campos
	
	//teste
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
	$("#cardsdiv").append(c5.html());
	*/
});



