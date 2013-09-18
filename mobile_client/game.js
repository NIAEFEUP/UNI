var playurl="http://ni.fe.up.pt/uni";
var room="";
var playerName="";
var status;
var active=false; //boolean para bloquear inputs durante chamadas ao servidor

//flags
var colorSelBuffer="";
var cardupdate=false;
var drawbuffer=false;
var skipdraw=false;
var readychecked=false;
var inlobby=false;
var ingame=false;
var inqueue=true;
var gameactive=true;
//pointer ao set timeout para o desativar quando fizer /quit
var timerfunc;
//milisegundos para fazer novo request de status/lobby
var timerms=2000; 


function Card(color,value) {
	
	this.color = color;
	this.value = value;
	switch(color)
	{
		case 0:this.colortext="Red";break;
		case 1:this.colortext="Green";break;
		case 2:this.colortext="Blue";break;
		case 3:this.colortext="Yellow";break;
		case 4:this.colortext="Wild";break;
		default:this.colortext="Error";
	}
	switch(value)
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
	for (var i=0;i< mao.length;i++)
	{
		card=new Card(mao[i].c,mao[i].t);
		htmlstr+=card.html();
	}
	return htmlstr;
}

function QueryStatus()
{
	ingame=true;
	if (skipdraw)
	{
		$("#drawcard").hide();
		$("#skipturn").show();
	}
	else
	{
		
		$("#drawcard").show();
		$("#skipturn").hide();
	}
	
	$.ajax({
		url: playurl+room+'status',
		type: 'GET',
		success: function(data, cenas, res){
			
			if( res )
			{
				if( res.status === 204 )
				{	
					gameactive=false;
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
							if (!cardupdate){
							$("#cardsdiv").html(ParseMao(data.l));	
							console.log('done cardsupdate');
							cardupdate=true;
							}
						}

						else

						{

							$("#statusmsg").text("Jogo pausado");

							$("#statusmsg").show();		

						}

					}	

					else{
						cardupdate=false;
						active=true;
						if (data.b>0){
							$("#statusmsg").text("Tem "+data.b+" cartas em espera.");
							$("acceptdraw").show();
							$("#statusmsg").show();	
						}
						else
						{
							$("#statusmsg").text("É a sua vez");
							$("#statusmsg").show();		
							$("acceptdraw").hide();
						
						}
						$("#cardsdiv").html(ParseMao(data.l));	
						console.log('done');

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

function playCard(card){
	active=false;
	clearTimeout(timerfunc);
	var color=card.data("color");
	var value=card.data("value");
	
	if ((value==13||value==14)&&colorSelBuffer=="")
	{
		colorSelBuffer=	$("#cardsdiv").html();
		var c1=new Card(0,value);
		var c2=new Card(1,value);
		var c3=new Card(2,value);
		var c4=new Card(3,value);
		$("#cardsdiv").html(c1.html()+c2.html()+c3.html()+c4.html());
		$("#statusmsg").text("Escolha uma cor");
		$("#statusmsg").show();	
		active=true;
	}else
	{
		$.post(playurl+room+"play/"+value+"/"+color,{},function(data){
			//fixe
		
			skipdraw=false;
			console.log("play sucessefull with "+color+" "+value+" ");
		},'json').fail(function(jqxhr, textStatus, error ) {
			var err = textStatus + ', ' + error;
			console.log( "playRequest with "+color+" "+value+" Failed: " + err);
			active=true; 
			$("#statusmsg").text("Jogada inválida.");
			$("#statusmsg").show();
		}).always(function(){
			if (colorSelBuffer!="")
			{
				$("#statusmsg").text("Boa escolha");//troll :)
				$("#statusmsg").show();	
				$("#cardsdiv").html(colorSelBuffer);	
				colorSelBuffer="";
			}
			active=true;
			QueryStatus();
		});
	}
}


function skipPlay(){
	active=false;
	clearTimeout(timerfunc);
	$.getJSON(playurl+room+"skip-turn",{},function(data){
		//fixe
		
		skipdraw=false;
		console.log("skip sucessefull");
	},'json').fail(function(jqxhr, textStatus, error ) {
		var err = textStatus + ', ' + error;
		console.log( "skipRequest Failed: " + err);
		active=true;
		$("#statusmsg").text("Erro a comunicar passagem. Por favor tente outra vez.");
		$("#statusmsg").show();
	}).always(function(){
		active=true;
		QueryStatus();
	});
}

function drawOne(){
	active=false;
	clearTimeout(timerfunc);
	$.getJSON(playurl+room+"get-one",{},function(data){
		//fixe
		
		skipdraw=true;
		console.log("draw sucessefull");
	},'json').fail(function(jqxhr, textStatus, error ) {
		var err = textStatus + ', ' + error;
		console.log( "drawRequest Failed: " + err);
		
		$("#statusmsg").text("Erro a comunicar pedido. Por favor tente outra vez.");
		$("#statusmsg").show();
	}).always(function(){
		active=true;
		QueryStatus();
	});
}

function acceptDraw(){
	active=false;
	clearTimeout(timerfunc);
	$.getJSON(playurl+room+"accept-draw",{},function(data){
		//fixe
		
		
		console.log("acceptdraw sucessefull");
	},'json').fail(function(jqxhr, textStatus, error ) {
		var err = textStatus + ', ' + error;
		console.log( "acceptdrawRequest Failed: " + err);
		
		$("#statusmsg").text("Erro a comunicar pedido. Por favor tente outra vez.");
		$("#statusmsg").show();
	}).always(function(){
		active=true;
		QueryStatus();
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
	

	
	
	$('#game').on('click','.card',function(event){
		if (active==true&&gameactive==true){	
			$("#statusmsg").text("A processar jogada");
		$("#statusmsg").show();
			playCard($(this));
			
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
		if (active && gameactive && skipdraw){
			skipPlay();	
		
		}
		console.log("skipturn "+active);
		
	});
	
		
	$("#drawcard").click(function(){
		if (active && gameactive && !skipdraw){
			drawOne();	
		
		}
		console.log("drawcard "+active);
		
	});
	
	$("#acceptdraw").click(function(){
		if (active==true&&gameactive==true){
			acceptDraw();
		}
		console.log("acceptdraw "+active);
		
	});
	
	$("#exitbtn").click(function(){
		if (active==true||!gameactive){
			active=false;
		$.post(playurl+room+"quit",function(data){
				active=true;
				ingame=false;
				inlobby=false;
				clearTimeout(timerfunc);
				console.log("sucesso sair");
				$("#readycheck").hide();
				$("#skipturn").hide();
				$("#drawcard").hide();
				$("#acceptdraw").hide();
				$("#game").hide();
				$("#statusmsg").hide();
				$("#lobby").show();
				$("#lobbyerrormsg").hide();
				$("#cardsdiv").html("");
				});
		}
		
		console.log("exitbtn "+active);
		
	});
	
	active=true; //ativar os campos
	
	//teste
	/*$("#lobby").hide();
	$("#game").show();
	var c1=new Card(0,11);
	var c2=new Card(1,9);
	var c3=new Card(2,10);
	var c4=new Card(3,5);
	var c5=new Card(3,2);
	var c6=new Card(1,6);
	var c7=new Card(4,13);
	var c8=new Card(4,14);
	$("#cardsdiv").append(c1.html());
	$("#cardsdiv").append(c2.html());
	$("#cardsdiv").append(c3.html());
	$("#cardsdiv").append(c4.html());
	$("#cardsdiv").append(c5.html());
	$("#cardsdiv").append(c6.html());
	$("#cardsdiv").append(c7.html());
	$("#cardsdiv").append(c8.html());
	*/
	
});



