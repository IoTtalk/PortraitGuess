/**
 * Created by kuan on 2017/5/21.
 */

$(function () {
    var bar = new ProgressBar.Circle(loadingIndicator, {
        color: '#3cb371',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 500,
        text: {
          autoStyleContainer: false
        },
        from: { color: '#228b22', width: 1 },
        to: { color: '#3cb371', width: 4 },
        // Set default step function for all animate calls
        step: function(state, circle) {
    	      circle.path.setAttribute('stroke', state.color);
    	      circle.path.setAttribute('stroke-width', state.width);

    	      var value = Math.round(circle.value() * 100);
    	      if (value === 0) {
    	        circle.setText('');
    	      } else {
    	        circle.setText(value);
    	      }
        	}
      	});
   bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif'; 
   bar.text.style.fontSize = '5rem';
   bar.animate(0.5);  // Number from 0.0 to 0.5


    $("#successAlert").hide();  // 猜對頁 訊息
    $("#successName").hide();  // 猜對頁人名
    $("#successImage").hide();  // 猜對頁 讚讚圖片
    $("#wrongAlert").hide();  // 猜謎頁 猜錯訊息
    $("#prompt").hide();  // 猜謎頁 "WHO AM I ?"
    $("#prompt2").hide();  // 猜謎頁 "Choose an answer"
    $("#chance").hide();
    $("#endButton").hide();
    $("#playButton").prop('disabled', true);
    $("#endButton").prop('disabled', true);
    var lastClickTime = new Date(); //record last click optionBtn time
    const timeout = 60; // if over 150 seconds not click optionBtn then disconnect WebSocket	
    const optionLength = 5;  // 選項數目
    const chance = 5;  // 猜錯機會
    var chance_count = chance;
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };

	var socket = io();
	var playedNameNumber = [];
    var answerNameNumber;
    var answerOptionIndex;
    var randomOptions;
    var isMePlaying = false;
    var urlCorrect = false;
    var enterPlay = function(){
    	if(gameList.length <= 5){
			alert("Can not play, lack of painting");
			return;
		}
		$("#playButton").hide();
		$("#endButton").hide();
		$("#successAlert").hide();
		$("#successName").hide();
		$("#successImage").hide();
		$("#wrongAlert").hide();

		answerNameNumber = 0;
		answerOptionIndex = Math.floor((Math.random() * optionLength));
		// playedNameNumber.push(answerNameNumber);	
		randomOptions = [];

		// dan.push("Name-I",[answerNameNumber]);
        socket.emit("Name-I", gameList[0]);

		for (var i = 0; i < optionLength; i++) {
			var r = Math.floor((Math.random() * gameList.length));
			// console.log(r);
			while (randomOptions.contains(r) || r == answerNameNumber) {
				r = Math.floor((Math.random() * gameList.length));
			}
			randomOptions.push(r);
		}

        console.log(randomOptions);

		for (var i = 0; i < optionLength; i++) {
			if (i != answerOptionIndex) {
				$("li").each(function (index) {
					if (index == i) {
						$(this).find("button").html(gameList[randomOptions[i]]);
					}
				});
			}
			else {
				$("li").each(function (index) {
					if (index == i) {
						$(this).find("button").html(gameList[answerNameNumber]);
					}
				});
			}
		}
		$(".optionBtn").unbind('click');
		$(".optionBtn").click(function () {
			lastClickTime = new Date(); 
			var index = $('.optionBtn').index(this);
			if (index == answerOptionIndex) {  // 猜對
				socket.emit("Correct", "1");
				// dan.push("Correct",[1]);
				// ws.send("Correct");
				chance_count = chance;
				$("#successAlert").html("You got it! I am");
				$("#successAlert").show();
				$("#successName").html(gameList[answerNameNumber]);
				$("#successName").show();
				$("#successImage").show();
				$("#wrongAlert").hide();
				$("#options").hide();
				$("#prompt").hide();
				$("#prompt2").hide();
				$("#chance").hide();
				$("#playButton").show().prop('disabled', true);
				$("#playButton").html("Play in 1 sec.");
				$("#playButton").css("font-size","30px");
				$("#playButton").css("width","250px");
				$("#playButton").css("height","80px");
				$("#playButton").css("height","80px");
				$("#endButton").show();
				var count = 1; //count down 1 second
				var countDown = function(){ 
					if(count == 1){
						$("#playButton").show().prop("disabled", false);
						$("#playButton").css("font-size","50px");
						$("#playButton").html("Play Again");
						$("#playButton").css("width","300px");
						$("#playButton").css("height","100px");
					}
					else{
						count--;
						$("#playButton").html("Play in " + count + " sec.");
						setTimeout(countDown, 1000);
					}
				};
				setTimeout(countDown, 1000);
				console.log("correct!");
			}
			else {  // 猜錯                   
				chance_count--;

				if (chance_count <= 0) {  // 猜錯次數超過上限
					// dan.push("Correct",[1]);
					// ws.send("Correct");
					socket.emit("Correct", "1");
					chance_count = chance;
					$("#successAlert").html("Oops... I am");
					$("#successAlert").show();
					$("#successName").html(gameList[answerNameNumber]);
					$("#successName").show();
					$("#wrongAlert").hide();
					$("#options").hide();
					$("#prompt").hide();
					$("#prompt2").hide();
					$("#chance").hide();
					$("#playButton").show().prop('disabled', true);
					$("#playButton").html("Play in 1 sec.");
					$("#playButton").css("font-size","30px");
					$("#playButton").css("width","250px");
					$("#playButton").css("height","80px");
					$("#playButton").css("height","80px");
					$("#endButton").show();
					var count = 1; //count down 1 second
					var countDown = function(){ 
						if(count == 1){
							$("#playButton").show().prop("disabled", false);
							$("#playButton").css("font-size","50px");
							$("#playButton").html("Try Again");
							$("#playButton").css("width","300px");
							$("#playButton").css("height","100px");
						}
						else{
							count--;
							$("#playButton").html("Play in " + count + " sec.");
							setTimeout(countDown, 1000);
						}
					};
					setTimeout(countDown, 1000);
					console.log("game over!");
				}
				else {  // 猜錯次數沒超過上限
					socket.emit("Wrong", "1");
					// dan.push("Wrong",[1]);
					// ws.send("Wrong");
					$("#wrongAlert").show();
					$("#chance").html("<span class='badge' style='background-color:blue'>" + chance_count + "</span> chances left");
					$("#chance").show();
					$("#prompt2").hide();
					$("#successAlert").hide();
					$("#successName").hide();
					$("#successImage").hide();
					console.log("wrong answer!");
				}           
			}       
		});
		$("#options").show();
        $("#prompt").show();
        $("#prompt2").show();
        $("#chance").html("<span class='badge' style='background-color:blue'>" + chance_count + "</span> chances left");
        $("#chance").show();

    };

	$("#endButton").click(function(){
		window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
	});
	socket.on("isGamePlaying", function(msg){
		console.log(msg);
		if(msg.isGamePlaying){
			window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
		}
		else{
			isMePlaying = true;
			enterPlay();
    	}
		
	});
	window.onpageshow = function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    };
    if (!!window.performance && window.performance.navigation.type === 2) {
            // value 2 means "The page was accessed by navigating into the history"
            console.log('Reloading');
            window.location.reload(); // reload whole page

        }
	socket.on("checkUrl", function(msg){
		var url = window.location.href;
		socket.emit("checkUrl", url.substring(url.lastIndexOf('/')+1));
    });
    socket.on("checkUrlACK", function(msg){
    	urlCorrect = msg.urlCorrect;
    	if(urlCorrect == false){
    		window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
    	}
    	else{
    		bar.animate(1.0);
    		setTimeout(function(){
	    		$("#playButton").show();
	    		$("#loadingIndicator").hide();
	    		$("#playButton").prop('disabled', false);
	    		$("#endButton").prop('disabled', false);
    		},1000);
    	}
    });
    $("#playButton").click(function () {
    	if(urlCorrect == false)
    		return;
		if(isMePlaying == false)
			socket.emit("playACK", "");
		else
			enterPlay();
    });
    $("#voiceButton").click(function(){
        if (!('webkitSpeechRecognition' in window)) {
            console.log( "not support!" );
        } 
        else {
            var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang="cmn-Hant-TW";
            recognition.onstart=function(){
                console.log("on start");
            };
            recognition.onend=function(){
                console.log("on end");
                recognition.start();
            };
            recognition.onresult=function(event){
                console.log(event);
            };
            recognition.start();
        }
    });

	// var checkTimeout = setInterval(function(){
	// 	var now = new Date();
	// 	if( (now - lastClickTime)/1000 >= timeout ){
	// 		console.log("timeout");
	// 		clearInterval(checkTimeout);
	// 		window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
	// 	}	
	// }, 1000);
});
