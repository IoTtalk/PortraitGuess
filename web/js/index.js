/**
 * Created by kuan on 2017/5/21.
 */
$(function(){
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
    $("#playGroupButton").prop('disable', true);
    $("#endButton").prop('disabled', true);
    var lastClickTime = new Date(); //record last click optionBtn time
    const timeout = 30; // if over 150 seconds not click optionBtn then disconnect WebSocket    
    const optionLength = 5;  // 選項數目
    const chance = 5;  // 猜錯機會
    var playButton_first_play = true;  // 檢查是不是第一次玩
    var chance_count = chance;
    var playingGroup; // 玩家選好要玩的群組

    var socket = io();
    var isMePlaying = false;
    var urlCorrect = false;
    var enterPlay = function(gameInfo){
        var game_list = gameInfo.game_list,
            answer_description = gameInfo.answer_description,
            answer_idx = parseInt(gameInfo.answer_idx, 10);

        $("#group_options_div").hide();
        $("#playButton").hide();
        $("#playGroupButton").hide();
        $("#endButton").hide();
        $("#successAlert").hide();
        $("#successName").hide();
        $("#successImage").hide();
        $("#wrongAlert").hide();

        //8
        // dan.push("Name-I",[answerNameNumber]);
        console.log("8. game is ready to play and ask server to display answer pictures");
        socket.emit("Name-I", game_list[answer_idx]);

        var option_str = "";
        for(var i = 0; i < game_list.length; i++){
            /* <li><button class="optionBtn btn btn-danger center-block"></button></li> */
            option_str += '<li><button class="optionBtn btn btn-danger center-block">' + game_list[i] + '</button></li>';
        }
        $("#options").html(option_str);

        $(".optionBtn").unbind('click');
        $(".optionBtn").click(function () {
            lastClickTime = new Date(); 
            var index = $('.optionBtn').index(this);
            if(index == answer_idx){  // 猜對
                //9
                console.log("9. choose correct answer");
                socket.emit("Correct", "1");
                // dan.push("Correct",[1]);

                chance_count = chance;
                $("#successAlert").html("You got it! I am");
                $("#successAlert").show();
                $("#successName").html(game_list[answer_idx] + "<br>" + answer_description);
                $("#successName").show();
                $("#successImage").show();
                $("#wrongAlert").hide();
                $("#options").hide();
                $("#prompt").hide();
                $("#prompt2").hide();
                $("#prompt3").hide();
                $("#chance").hide();

                $("#playButton").show().prop("disabled", false);
                $("#playButton").css("font-size","35px");
                $("#playButton").html("Play Again");
                $("#playButton").css("width","275px");
                // $("#playButton").css("height","100px");
                $("#playGroupButton").show();
                $("#endButton").show();
                console.log("correct!");
            }
            else {  // 猜錯                   
                chance_count--;

                if(chance_count <= 0){  // 猜錯次數超過上限
                    // dan.push("Correct",[1]);
                    //9
                    console.log("9. choose correct answer");
                    socket.emit("Correct", "1");

                    chance_count = chance;
                    $("#successAlert").html("Oops... I am");
                    $("#successAlert").show();
                    $("#successName").html(game_list[answer_idx] + '<br>' + answer_description);
                    $("#successName").show();
                    $("#wrongAlert").hide();
                    $("#options").hide();
                    $("#prompt").hide();
                    $("#prompt2").hide();
                    $("#prompt3").hide();
                    $("#chance").hide();

                    $("#playButton").show().prop("disabled", false);
                    $("#playButton").css("font-size","35px");
                    $("#playButton").html("Play Again");
                    $("#playButton").css("width","275px");
                    // $("#playButton").css("height","100px");
                    $("#playGroupButton").show();
                    $("#endButton").show();
                    console.log("game over!");
                }
                else {  // 猜錯次數沒超過上限
                    // dan.push("Wrong",[1]);
                    //9
                    console.log("9. choose wrong answer");
                    socket.emit("Wrong", "1");
                    
                    $("#wrongAlert").show();
                    $("#chance").html("<span class='badge' style='background-color:blue;color:white'>" + chance_count + "</span> chances left");
                    $("#chance").show();
                    $("#prompt2").hide();
                    $("#prompt3").hide();
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
        $("#chance").html("<span class='badge' style='background-color:blue;color:white'>" + chance_count + "</span> chances left");
        $("#chance").show();
    };
    //display group li buttons
    var displayGroup = function(groupList){
        $("#playButton").hide();
        $("#playGroupButton").hide();
        $("#endButton").hide();
        $("#successAlert").hide();
        $("#successName").hide();
        $("#successImage").hide();
        $("#wrongAlert").hide();

        //show prompt3
        $("#prompt3").show();
        $("#group_options_div").show();

        //generate group buttons
        var group_list_item_str = "";
        for(var i = 0; i < groupList.length; i++){
            /* <li><button class="groupBtn btn btn-primary center-block"></button></li> */
            group_list_item_str += '\
                <li><button group_id="' + groupList[i].id + '" class="groupBtn btn btn-secondary center-block">' + groupList[i].name + '</button></li>\
            ';
        }
        $("#group_options").html(group_list_item_str);

        //bind functions for group buttons
        $(".groupBtn").unbind('click');
        $(".groupBtn").click(function(){
            lastClickTime = new Date(); 
            //get selected group_id, and then socket emit to server, and socket on receive game_list
            playingGroup = $(this).attr("group_id");
            console.log("playingGroup: ", playingGroup);
            //let other groups btn disable
            $("#prompt3").hide();
            $(".groupBtn").hide();
            //6
            console.log("6. choose one group I want to play");
            socket.emit("playGroup", playingGroup);
        });
    }

    
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
    $("#playButton").click(function () {
        if(urlCorrect == false){
            return;
        }
        if(isMePlaying == false){
            //4
            console.log("4. send play-game request");
            socket.emit("playACK", "");
        }
        else{
            if(playButton_first_play == false){
                console.log("playButton, playButton_first_play, false");
                //10
                console.log("10. send replay request");
                socket.emit("NewGameReq", playingGroup);
            }
        }
    });
    //player replay new group game
    $("#playGroupButton").click(function(){
        //12
        console.log("12. send replay other group request");
        socket.emit("NewGroupReq", "");
    });
    $("#endButton").click(function(){
        window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
    });
    //1
    socket.on("checkUrl", function(msg){
        console.log("1. server ask for checking my-url");
        var url = window.location.href;
        //2
        console.log("2. send my-url to server for checking");
        socket.emit("checkUrl", url.substring(url.lastIndexOf('/')+1));
    });
    //3
    socket.on("checkUrlACK", function(msg){
        console.log("3. receive the checking result from server");
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
                $("#playGroupButton").prop('disabled', false);
                $("#endButton").prop('disabled', false);
            },1000);
        }
    });
    //5
    socket.on("isGamePlaying", function(msg){
        console.log("5. get Frame status which is playing by other");
        if(msg.isGamePlaying){
            window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
        }
        else{
            isMePlaying = true;
            playButton_first_play = false;
            displayGroup(groupList);
        }
    });
    //7
    socket.on("GameStart", function(gameInfo){
        console.log("7. receive gameInfo and generate game options");
        enterPlay(gameInfo);
    });
    //11
    socket.on("NewGameRes", function(gameInfo){
        console.log("11. receive the next gameInfo and generate game options");
        enterPlay(gameInfo);
    });
    //13
    socket.on("NewGroupRes", function(groupList){
        console.log("13. receive the new groupList and display group_options");
        displayGroup(groupList);
    });

    var checkTimeout = setInterval(function(){
        var now = new Date();
        if( (now - lastClickTime)/1000 >= timeout ){
            console.log("timeout");
            clearInterval(checkTimeout);
            window.location = "http://" + paintingIP + ":" + webServerPort + "/endPage";
        }
    }, 1000);
});
