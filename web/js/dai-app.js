/**
 * Created by kuan on 2017/5/21.
 */

$(function () {
    $("#successAlert").hide();  // 猜對頁 訊息
    $("#successName").hide();  // 猜對頁人名
    $("#successImage").hide();  // 猜對頁 讚讚圖片
    $("#wrongAlert").hide();  // 猜謎頁 猜錯訊息
    $("#prompt").hide();  // 猜謎頁 "WHO AM I ?"
    $("#prompt2").hide();  // 猜謎頁 "Choose an answer"
    $("#chance").hide();
    var lastClickTime = new Date(); //record last click optionBtn time
    const timeout = 150; // if over 150 seconds not click optionBtn then disconnect WebSocket	
    const optionLength = 5;  // 選項數目
    const chance = 5;  // 猜錯機會
    var chance_count = chance;
    function Name_I(){}  // IDF 人名
    function Correct(){}  // IDF 猜對
    function Wrong(){}  // IDF 猜錯
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
    function iot_app (dan) {
            var ws = new WebSocket("ws://" + "140.113.169.227" + ":" + webSocketPort);
			var playedNameNumber = [];
            ws.onopen=function(){
                $("#startButton").click(function () {
                    if(nameList.length < 5){
                        alert("Can not play, lack of pating");
                        return;
                    }
                    $("#startButton").hide();
                    $("#successAlert").hide();
                    $("#successName").hide();
                    $("#successImage").hide();
                    $("#wrongAlert").hide();
                    var answerNameNumber = Math.floor((Math.random() * nameList.length));
                    var answerOptionIndex = Math.floor((Math.random() * optionLength));
					while(playedNameNumber.length != nameList.length && playedNameNumber.contains(answerNameNumber))
						Math.floor((Math.random() * nameList.length));
					playedNameNumber.push(answerNameNumber);	
                    var randomOptions = [];
                    dan.push("Name-I",[answerNameNumber]);
                    ws.send(answerNameNumber);
                    for (var i = 0; i < optionLength; i++) {
                        var r = Math.floor((Math.random() * nameList.length));
                        console.log(r);
                        while (randomOptions.contains(r) || r == answerNameNumber) {
                            r = Math.floor((Math.random() * nameList.length));
                        }
                        randomOptions.push(r);
                    }
                    for (var i = 0; i < optionLength; i++) {
                        if (i != answerOptionIndex) {
                            $("li").each(function (index) {
                                if (index == i) {
                                    $(this).find("button").html(nameList[randomOptions[i]]);
                                }
                            });
                        }
                        else {
                            $("li").each(function (index) {
                                if (index == i) {
                                    $(this).find("button").html(nameList[answerNameNumber]);
                                }
                            });
                        }
                    }
                    $(".optionBtn").unbind('click');
                    $(".optionBtn").click(function () {
						lastClickTime = new Date(); 
                        var index = $('.optionBtn').index(this);
                        if (index == answerOptionIndex) {  // 猜對
                            dan.push("Correct",[1]);
                            ws.send("Correct");
                            chance_count = chance;
                            $("#successAlert").html("You got it! I am");
                            $("#successAlert").show();
                            $("#successName").html(nameList[answerNameNumber]);
                            $("#successName").show();
                            $("#successImage").show();
                            $("#wrongAlert").hide();
                            $("#options").hide();
                            $("#prompt").hide();
                            $("#prompt2").hide();
                            $("#chance").hide();
                            $("#startButton").show().prop('disabled', true);
                            $("#startButton").html("Play in 1 sec.");
                            $("#startButton").css("font-size","30px");
                            $("#startButton").css("width","250px");
                            $("#startButton").css("height","80px");
                            $("#startButton").css("height","80px");
                            var count = 1; //count down 1 second
                            var countDown = function(){ 
                                if(count == 1){
                                    $("#startButton").show().prop("disabled", false);
                                    $("#startButton").css("font-size","50px");
                                    $("#startButton").html("Play Again");
                                    $("#startButton").css("width","300px");
                                    $("#startButton").css("height","100px");
                                }
                                else{
                                    count--;
                                    $("#startButton").html("Play in " + count + " sec.");
                                    setTimeout(countDown, 1000);
                                }
                            };
                            setTimeout(countDown, 1000);
                            console.log("correct!");
                        }
                        else {  // 猜錯                   
                            chance_count--;

                            if (chance_count <= 0) {  // 猜錯次數超過上限
                                dan.push("Correct",[1]);
                                ws.send("Correct");
                                chance_count = chance;
                                $("#successAlert").html("Oops... I am");
                                $("#successAlert").show();
                                $("#successName").html(nameList[answerNameNumber]);
                                $("#successName").show();
                                $("#wrongAlert").hide();
                                $("#options").hide();
                                $("#prompt").hide();
                                $("#prompt2").hide();
                                $("#chance").hide();

                                $("#startButton").show().prop('disabled', true);
                                $("#startButton").html("Play in 1 sec.");
                                $("#startButton").css("font-size","30px");
                                $("#startButton").css("width","250px");
                                $("#startButton").css("height","80px");
                                $("#startButton").css("height","80px");
                                var count = 1; //count down 1 second
                                var countDown = function(){ 
                                    if(count == 1){
                                        $("#startButton").show().prop("disabled", false);
                                        $("#startButton").css("font-size","50px");
                                        $("#startButton").html("Try Again");
                                        $("#startButton").css("width","300px");
                                        $("#startButton").css("height","100px");
                                    }
                                    else{
                                        count--;
                                        $("#startButton").html("Play in " + count + " sec.");
                                        setTimeout(countDown, 1000);
                                    }
                                };
                                setTimeout(countDown, 1000);
                                console.log("game over!");
                            }
                            else {  // 猜錯次數沒超過上限
                                dan.push("Wrong",[1]);
                                ws.send("Wrong");
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
                });
				var checkTimeout = setInterval(function(){
					var now = new Date();
					if( (now - lastClickTime)/1000 >= timeout ){
						console.log("timeout");
						clearInterval(checkTimeout);
						ws.close();
						location.reload();
					}	
				}, 1000);
				
            };
    };
    var profile = {
        'dm_name': 'Riddle',
        'd_name' : 'Riddle',
        'df_list': [Name_I, Correct, Wrong],

    };

    var ida = {
        'iot_app': iot_app,
    };

    dai(profile, ida);

});
