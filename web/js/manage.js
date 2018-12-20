function render_dropdownlist_div(functiontype, class_list){
    var dropdownlist_str = "";
    class_list.forEach((class_item) => {
        var id = "dropdown-" + functiontype + "-" + class_item.name;
        dropdownlist_str += '\
            <a class="dropdown-item" href="#" id="' + id + '">' + class_item.name + '</a>\
            ';
    });

    if(functiontype == "upload"){
        dropdownlist_str += '<a class="dropdown-item" href="#" id="dropdown-upload-add">新增</a>';
    }

    return dropdownlist_str;
}

function upload_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        var dropdownlist_id = "#dropdown-upload-" + class_item.name;

        //render_upload_div
        $(dropdownlist_id).on("click", function(){
            $.ajax({
                type: "GET",
                url: location.origin + "/getCategory?mode=all&class_name=" + class_item.name,
                cache: false,
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    category_list = JSON.parse(data);
                    console.log(category_list);
                    
                    $("#display").html(render_upload_div(class_item, render_category_table(category_list)));
                    make_img_movable();
                    add_new_category_btn_handler(class_item, "add_new_category", "category_table");
                    uplaod_btn_handler(class_item);
                }
            });
        });
    });

    //[TODO] add NEW class
    $("#dropdown-upload-add").on("click", function(){
        alert("尚未完成");
    });
}

function pending_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        var dropdownlist_id = "#dropdown-pending-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            $.ajax({
                type: "GET",
                url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=0",
                cache: false,
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var pending_list = JSON.parse(data);
                    console.log(pending_list);

                    $('#display').html(render_pending_div(class_item, pending_list));
                    pendingbtn_handler(class_item);
                }
            });
        });
    });
}

function approved_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        var dropdownlist_id = "#dropdown-approved-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            $.ajax({
                type: "GET",
                url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=1",
                cache: false,
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var approved_list = JSON.parse(data);
                    console.log(approved_list);

                    $('#display').html(render_approved_div(class_item, approved_list));
                    approvedbtn_handler(class_item);
                }
            });
        });
    });
}

function classification_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        var dropdownlist_id = "#dropdown-classification-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            $.ajax({
                type: "GET",
                url: location.origin + "/getGroup?mode=all",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(group_list){
                    console.log(group_list);

                    $("#display").html(render_classification_div(class_item, render_classification_selector(group_list)));
                    option_handler(class_item, group_list);
                }
            });
        });
    });
}

//main
$(function (){
    /* navbar btn */

    //navbar active
    $("nav li").on("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
    });

    //navbar brand
    $(".navbar-brand").on("click", function(){
        //[TODO] edutalk main page ui
        var defaultt = "\
            <h2 class='top center'>管理頁面首頁</h2>\
            <br>\
            <h3 class='center'>For now only supports Google Chrome browser</h3>\
            <br>\
            <div class='margin_center'>\
                <ul>\
                    <li><h3>上傳檔案</h3></li>\
                        <ul>\
                            <li><h4>建立新人物畫像檔案</h4></li>\
                        </ul>\
                    <li><h3>待審檔案</h3></li>\
                        <ul>\
                            <li><h4>審核使用者上傳的檔案</h4></li>\
                        </ul>\
                    <li><h3>已審檔案</h3></li>\
                        <ul>\
                            <li><h4>瀏覽已審的檔案</h4></li>\
                        </ul>\
                    <li><h3>建立群組</h3></li>\
                        <ul>\
                            <li><h4>根據主題可建立不同群組</h4></li>\
                        </ul>\
                    <li><h3>播放清單</h3></li>\
                        <ul>\
                            <li><h4>列出所有群組並可搭配決定遊戲內容</h4></li>\
                        </ul>\
                </ul>\
            </div>";
        $("#display").html(defaultt);
    });

    //navbar-upload-btn
    $("#navbar-upload-btn").on("click", function(){
        if($(this).attr("aria-expanded") == "false"){
            //ajax get all classes
            $.ajax({
                type: "GET",
                url: location.origin + "/getClass?mode=all",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    $("#dropdown-menu-upload").html(render_dropdownlist_div("upload", class_list));
                    upload_dropdownlist_handler(class_list);
                }
            });
        }
    });

    //navbar-pending-btn
    $("#navbar-pending-btn").on("click", function(){
        //ajax get those classes with pending questions
        if($(this).attr("aria-expanded") == "false"){
            $.ajax({
                type: "GET",
                url: location.origin + "/getClass?mode=pending",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more pending question in the system
                        alert("沒有待審檔案!\n所有檔案皆以審核完畢\n");
                        return false;
                    }
                    else{
                        $("#dropdown-menu-pending").html(render_dropdownlist_div("pending", class_list));
                        pending_dropdownlist_handler(class_list);
                    }
                }
            });
        }
    });

    //navbar-approved-btn
    $("#navbar-approved-btn").on("click", function(){
        //ajax get all classes with approved questions
        if($(this).attr("aria-expanded") == "false"){
            $.ajax({
                type: "GET",
                url: location.origin + "/getClass?mode=approved",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more approved question in the system
                        alert("沒有已審的檔案！\n請至'待審檔案'開始審核喔\n");
                        return false;
                    }
                    else{
                        $("#dropdown-menu-approved").html(render_dropdownlist_div("approved", class_list));
                        approved_dropdownlist_handler(class_list);
                    }
                }
            });
        }
    });

    //navbar-classification-btn
    $("#navbar-classification-btn").on("click", function(){
        //ajax get all class with approved questions
        if($(this).attr("aria-expanded") == "false"){
            $.ajax({
                type: "GET",
                url: location.origin + "/getClass?mode=approved",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more approved question in the system
                        alert("沒有已審的檔案！\n請至'待審檔案'開始審核喔\n");
                        return false;
                    }
                    else{
                        $("#dropdown-menu-classification").html(render_dropdownlist_div("classification", class_list));
                        classification_dropdownlist_handler(class_list);
                    }
                }
            });
        }
    });

    //navbar-display-btn
    $("#navbar-display-btn").on("click", function(){
        //render_display_div
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroup?mode=all",
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
});
