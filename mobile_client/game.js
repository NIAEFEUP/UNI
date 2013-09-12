var joingameurl="";
var joinrndgameurl="";
var playurl="";
//texto: [0-9]/<=> reverse/Stop/+2/+4/Wild



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
	
	$("#drawcard").click(function(){
		/*$("#loadmsg").text("A carregar o jogo.");
		$("#loading").show();*/
		
		$.post(playurl,{/*args*/},function(data){
				//console.log(data);
				if (data=="null")//json de jogo cheiro
				{

				}else{
					/*TODO  sacar as cartas*/
				}
		}).error(
		function(){
			
		});
	});
	
});

