$(function () {
    //navbar brand
    $(".navbar-brand").on("click", function(){
        var defaultt = "\
            <h2 class='top center'>管理頁面首頁</h2>\
            <br>\
            <h3 class='center'>For now only supports Google Chrome browser</h3>\
            <br>\
            <ul class='margin_left'>\
                <li><h3>上傳檔案</h3></li>\
                    <ul>\
                        <li><h4>上傳新人物畫像</h4></li>\
                    </ul>\
                <li><h3>建立播放名單</h3></li>\
                    <ul>\
                        <li><h4>選取人物並建立人物播放名單</h4></li>\
                    </ul>\
                <li><h3>選取播放名單</h3></li>\
                    <ul>\
                        <li><h4>選取已建立的人物播放名單</h4></li>\
                    </ul>\
            </ul>";
        $("#display").html(defaultt);
    });

    //render_upload_div
    $("#dropdown-human-upload").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getHumanCategory",
            cache: false,
            contentType: "application/json",
            dataType: 'json',
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(humanCategory_list){
                console.log(humanCategory_list);
                
                $("#display").html(render_upload_div(render_category_table(humanCategory_list)));
                make_img_movable();
                add_new_category_btn_handler("add_new_category", "category_table");
                uplaod_btn_handler();
            }
        });
    });

    //render_pending_div
    $("#dropdown-human-pending").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getHuman",
            cache: false,
            data: JSON.stringify(
            {
                status : 0
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var pendingHuman_list = JSON.parse(data);
                console.log(pendingHuman_list);

                $('#display').html(render_pending_div(pendingHuman_list));
                pendingbtn_handler();
            }
        });
    });

    //render_approved_div
    $("#dropdown-human-approved").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getHuman",
            cache: false,
            data: JSON.stringify(
            {
                status : 1
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var approvedHuman_list = JSON.parse(data);
                console.log(approvedHuman_list);

                $('#display').html(render_approved_div(approvedHuman_list));
                approvedbtn_handler();
            }
        });
    });

    //render_classification_div
    $("#dropdown-human-classification").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getGroup",
            cache: false,
            contentType: "application/json",
            dataType: 'json',
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(group_list){
                console.log(group_list);

                $("#display").html(render_classification_div(render_classification_selector(group_list)));
                option_handler(group_list);
            }
        });
    });

    //render_display_div
    $("#dropdown-display").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getGroup",
            cache: false,
            contentType: "application/json",
            dataType: 'json',
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(group_list){
                console.log(group_list);
                
                $("#display").html(render_display_div(render_grouplist_table(group_list)));
                // make grouplist modal handler
                displayModal_btn_handler();
                
                // set using group
                set_display_btn_handler();
            }
        });
    });

    //navbar
    $("nav li").on("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
    });
});
