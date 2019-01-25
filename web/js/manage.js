//main
$(function (){
    // use these class_list to render homepage DOM <a>
    console.log("class_list:", class_list);
    console.log("pendingClass_list:", pendingClass_list);
    console.log("approvedClass_list:", approvedClass_list);

    //render homepage list link
    render_homepage_list_link();

    //navbar active
    $("nav li").on("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
    });

    //navbar brand
    $(".navbar-brand").on("click", function(){
        location.reload();
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
                    //show msgModal
                    show_msgModal("系統錯誤", "無法取得下拉式選單內容");

                    console.log(e);
                },
                success: function(data){
                    class_list = data;
                    console.log(data);
                    console.log("get new class_list: ", class_list);

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
                    //show msgModal
                    show_msgModal("系統錯誤", "無法取得下拉式選單內容");

                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more pending question in the system
                        //show msgModal
                        show_msgModal("系統訊息", "沒有待審檔案<br>所有檔案皆審核完畢");

                        //close dropdown list
                        $("#dropdown-menu-pending").removeClass("show");

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
                    //show msgModal
                    show_msgModal("系統錯誤", "無法取得下拉式選單內容");

                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more approved question in the system
                        
                        //show msgModal
                        show_msgModal("系統訊息", "尚無已審的檔案<br>請至'待審檔案'頁面，開始審核");

                        //close dropdown list
                        $("#dropdown-menu-approved").removeClass("show");

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
                    //show msgModal
                    show_msgModal("系統錯誤", "無法取得下拉式選單內容");

                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    if(class_list.length == 0){ //no more approved question in the system
                        //show msgModal
                        show_msgModal("系統訊息", "尚無已審的檔案<br>請至'待審檔案'頁面，開始審核");

                        //close dropdown list
                        $("#dropdown-menu-classification").removeClass("show");

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
        show_class_display_management();
    });

    //bind one time add new class
    $("#classModal_add").on("click", function(){
        addnewclass_handler();
    });

    //bind all homepage_link
    $(".homepage_link").on('click', function(){
        let args = $(this).attr('value'),
            dic = {};
        console.log(args);
        args.split('&').forEach((data) => {
            data = data.split('=');
            dic[data[0]] = data[1];
        });
        if (dic.type == 'upload') {
            if (dic.id) {
                console.log('upload id:', dic.id);
                if(dic.id != "new"){
                    $("#navbar").show();
                    $("#navbar-upload-btn").parent().addClass('active').siblings().removeClass('active');
                }
                show_class_upload_management(dic.id);
            }
        }
        else if(dic.type == 'pending') {
            if (dic.id) {
                console.log('pending id:', dic.id);
                $("#navbar").show();
                $("#navbar-pending-btn").parent().addClass('active').siblings().removeClass('active');
                show_class_pending_management(dic.id);
            }
        }
        else if(dic.type == 'approved') {
            if (dic.id) {
                console.log('approved id:', dic.id);
                $("#navbar").show();
                $("#navbar-approved-btn").parent().addClass('active').siblings().removeClass('active');
                show_class_approved_management(dic.id);
            }
        }
        else if(dic.type == 'classification') {
            if (dic.id) {
                console.log('classification id:', dic.id);
                $("#navbar").show();
                $("#navbar-classification-btn").parent().addClass('active').siblings().removeClass('active');
                show_class_classfication_management(dic.id);
            }
        }
        else if(dic.type == 'display') {
            console.log('display id:', dic.id);
            $("#navbar").show();
            $("#navbar-display-btn").parent().addClass('active').siblings().removeClass('active');
            show_class_display_management();
        }
    });

    // parse location hash
    // if (location.hash) {
    //     let dic = {};
    //     location.hash.substr(1).split('&').forEach((data)=>{
    //         data = data.split('=');
    //         dic[data[0]] = data[1];
    //     });
    //     if (dic.type == 'upload') {
    //         if (dic.id) {
    //             console.log('upload id:', dic.id);
    //             $("#navbar-upload-btn").parent().addClass('active').siblings().removeClass('active');
    //             show_class_upload_management(dic.id);
    //         }
    //     }
    //     else if(dic.type == 'pending') {
    //         if (dic.id) {
    //             console.log('pending id:', dic.id);
    //             $("#navbar-pending-btn").parent().addClass('active').siblings().removeClass('active');
    //             show_class_pending_management(dic.id);
    //         }
    //     }
    //     else if(dic.type == 'approved') {
    //         if (dic.id) {
    //             console.log('approved id:', dic.id);
    //             $("#navbar-approved-btn").parent().addClass('active').siblings().removeClass('active');
    //             show_class_approved_management(dic.id);
    //         }
    //     }
    //     else if(dic.type == 'classification') {
    //         if (dic.id) {
    //             console.log('classification id:', dic.id);
    //             $("#navbar-classification-btn").parent().addClass('active').siblings().removeClass('active');
    //             show_class_classfication_management(dic.id);
    //         }
    //     }
    //     else if(dic.type == 'display') {
    //         console.log('display id:', dic.id);
    //         $("#navbar-display-btn").parent().addClass('active').siblings().removeClass('active');
    //         show_class_display_management();
    //     }
    // }
});

function render_homepage_list_link(){
    //for upload
    let homepage_upload_list_str = "";
    if(class_list.length == 0){
        homepage_upload_list_str += '<a href="#" class="list-group-item list-group-item-action homepage_link" value="type=upload&id=new">新增</a>';
    }
    else{
        class_list.forEach((class_item)=>{
            homepage_upload_list_str += '\
                <a href="#" class="list-group-item list-group-item-action homepage_link" \
                value="type=upload&id=' + class_item.id + '">' + class_item.name + '</a>';
        });
        homepage_upload_list_str += '<a href="#" class="list-group-item list-group-item-action homepage_link" value="type=upload&id=new">新增</a>';
    }
    $("#homepage_upload_link").html(homepage_upload_list_str);

    //for pending
    let homepage_pending_list_str = "";
    if(pendingClass_list.length == 0){
        homepage_pending_list_str += '<a href="#" class="list-group-item-action">無</a>';
    }
    else{
        pendingClass_list.forEach((class_item)=>{
            homepage_pending_list_str += '\
                <a href="#" class="list-group-item list-group-item-action homepage_link" \
                value="type=pending&id=' + class_item.id + '">' + class_item.name + '</a>';
        });
    }
    $("#homepage_pending_link").html(homepage_pending_list_str);

    //for approved
    let homepage_approved_list_str = "";
    if(approvedClass_list.length == 0){
        homepage_approved_list_str += '<a href="#" class="list-group-item-action">無</a>';
    }
    else{
        approvedClass_list.forEach((class_item)=>{
            homepage_approved_list_str += '\
                <a href="#" class="list-group-item list-group-item-action homepage_link" \
                value="type=approved&id=' + class_item.id + '">' + class_item.name + '</a>';
        });
    }
    $("#homepage_approved_link").html(homepage_approved_list_str);

    //for classification
    let homepage_classification_list_str = "";
    if(approvedClass_list.length == 0){
        homepage_approved_list_str += '<a href="#" class="list-group-item-action">無</a>';
    }
    else{
        approvedClass_list.forEach((class_item)=>{
            homepage_classification_list_str += '\
                <a href="#" class="list-group-item list-group-item-action homepage_link" \
                value="type=classification&id=' + class_item.id + '">' + class_item.name + '</a>';
        });
    }
    $("#homepage_classification_link").html(homepage_classification_list_str);

    //for display
    let homepage_display_list_str = '<a href="#" class="list-group-item list-group-item-action homepage_link" \
                                    value="type=display">播放清單</a>';
    $("#homepage_display_link").html(homepage_display_list_str);
}

function render_dropdownlist_div(functiontype, class_list){
    let dropdownlist_str = "";
    class_list.forEach((class_item) => {
        let id = "dropdown-" + functiontype + "-" + class_item.name;
        dropdownlist_str += '\
            <a class="dropdown-item" href="#" id="' + id + '">' + class_item.name + '</a>\
            ';
    });

    if(functiontype == "upload"){
        dropdownlist_str += '<a class="dropdown-item" href="#" id="dropdown-upload-add">新增</a>';
    }

    return dropdownlist_str;
}

function show_class_upload_management(class_id) {
    if(class_id != "new"){
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroup?mode=all&class_id=" + class_id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                //show msgModal
                show_msgModal("系統錯誤", "無法進入'上傳檔案'頁面");

                console.log(e);
            },
            success: function(payload){
                data = JSON.parse(payload);
                console.log(data);
                
                $("#display").html(render_upload_div(data.class_item, render_group_table(data.group_list)));
                make_img_movable();
                
                add_new_group_btn_handler("add_new_group", "new_group_name", "add_new_group_row");
                set_new_group_btn_handler(data.class_item, "add_new_group", "set_new_group", "new_group_name", "group_table", "add_new_group_row", "group");
                set_new_group_cancel_btn_handler("add_new_group", "set_new_group_cancel", "add_new_group_row");
                
                uplaod_btn_handler(data.class_item);
            }
        });
    }
    else{
        // setup sample_name and sample_description
        $("#classModal_class_name").prop("placeholder", "ex: 人物");
        $("#classModal_sample_name").prop("placeholder", "ex: 伊麗莎白一世,Elizabeth I");
        $("#classModal_sample_description").prop("placeholder", "出生-死亡\nex: 1961-1988");

        //add_new_class_handler();
        $("#classModal").modal("show");
    }
}

function upload_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        let dropdownlist_id = "#dropdown-upload-" + class_item.name;

        //render_upload_div
        $(dropdownlist_id).on("click", function(){
            show_class_upload_management(class_item.id);
        });
    });

    // add NEW class
    $("#dropdown-upload-add").on("click", function(){
        // setup sample_name and sample_description
        $("#classModal_class_name").prop("placeholder", "ex: 人物");
        $("#classModal_sample_name").prop("placeholder", "ex: 伊麗莎白一世,Elizabeth I");
        $("#classModal_sample_description").prop("placeholder", "出生-死亡\nex: 1961-1988");

        //add_new_class_handler();
        $("#classModal").modal("show");
    });
}

function show_class_pending_management(class_id) {
    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=all&class_id=" + class_id + "&status=0",
        cache: false,
        contentType: "application/json",
        error: function(e){
            //show msgModal
            show_msgModal("系統錯誤", "無法進入'待審檔案'頁面");

            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log(data);

            $('#display').html(render_pending_div(render_pending_table(data.class_item, data.question_list)));
            pendingbtn_handler(data.class_item, "pending");
            refreshbtn_handler(data.class_item, "pending");
            ascendingbtn_handler(data.class_item, data.question_list, "pending");
            descendingbtn_handler(data.class_item, data.question_list, "pending");
        }
    });
}

function pending_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        let dropdownlist_id = "#dropdown-pending-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            show_class_pending_management(class_item.id);
        });
    });
}

function show_class_approved_management(class_id){
    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=all&class_id=" + class_id + "&status=1",
        cache: false,
        contentType: "application/json",
        error: function(e){
            //show msgModal
            show_msgModal("系統錯誤", "無法進入'已審檔案'頁面");

            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log(data);

            $('#display').html(render_approved_div(render_approved_table(data.class_item, data.question_list)));
            approvedbtn_handler(data.class_item, "approved");
            refreshbtn_handler(data.class_item, "approved");
            ascendingbtn_handler(data.class_item, data.question_list, "approved");
            descendingbtn_handler(data.class_item, data.question_list, "approved");
        }
    });
}

function approved_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        let dropdownlist_id = "#dropdown-approved-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            show_class_approved_management(class_item.id);
        });
    });
}

function show_class_classfication_management(class_id){
    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=all&class_id=" + class_id,
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){
            //show msgModal
            show_msgModal("系統錯誤", "無法進入'編輯群組'頁面");

            console.log(e);
        },
        success: function(payload){
            let data = payload
            console.log(data);

            $("#display").html(render_classification_div(data.class_item, render_classification_selector(data.group_list)));
            option_handler(data.class_item, data.group_list);
        }
    });
}

function classification_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        let dropdownlist_id = "#dropdown-classification-" + class_item.name;

        //render_pending_div
        $(dropdownlist_id).on("click", function(){
            show_class_classfication_management(class_item.id);
        });
    });
}

function show_class_display_management(){
    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=approved&class_id=all",
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){

            //show msgModal
            show_msgModal("系統錯誤", "無法進入'播放清單'頁面");

            console.log(e);
        },
        success: function(payload){
            let data = payload;
            console.log(data.group_list);
            
            $("#display").html(render_display_div(render_grouplist_table(data.group_list)));

            // make grouplist modal handler
            displayModal_btn_handler();
            
            // set using group
            set_display_btn_handler();

            select_and_cancel_handler();
        }
    });
}

function addnewclass_handler(){
    let class_name = $("#classModal_class_name").val(),
        sample_name = $("#classModal_sample_name").val(),
        sample_description = $("#classModal_sample_description").val();

    console.log(class_name, sample_name, sample_description);
    
    //check input
    if($.trim(class_name) == ""){
        //show msg
        $("#classModal_msg").text("請輸入名稱");
        return false;
    }

    if($.trim(sample_name) == ""){
        //show msg
        $("#classModal_msg").text("請輸入檔案名字範例");
        return false;
    }

    let duplicate_flag = false;
    for(let i = 0; i < class_list.length; i++){
        if(class_list[i].name == class_name){
            duplicate_flag = true;
            break;
        }
    }
    if(duplicate_flag){
        //show msg
        $("#classModal_msg").text("類別名稱不得重複");
        return false;
    }

    //ajax
    $.ajax({
        type: "POST",
        url: location.origin + "/addNewClass",
        cache: false,
        data: JSON.stringify(
        {
            new_class_name : class_name,
            new_sample_name : sample_name,
            new_sample_description : sample_description
        }),
        contentType: "application/json",
        error: function(e){
            $("#classModal").modal("hide");

            //show msgModal
            $("#classModal_msg").text("");
            show_msgModal("系統錯誤", "新增類別 " + class_name + " 失敗");

            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log("create new class success, and its id: ", data.class_id);
            
            //hide classModal
            $("#classModal_class_name").val("");
            $("#classModal_sample_name").val("");
            $("#classModal_sample_description").val("");
            $('#classModal').modal("hide");

            //show msgModal
            $("#classModal_msg").text("");
            show_msgModal("系統訊息", "新增類別 " + class_name + " 成功");

            // directly show new class upload page
            $("#navbar").show();
            show_class_upload_management(data.class_id);
        }
    });
}

function show_msgModal(title, msg){
    $("#my_modal_backdrop").addClass("my_modal_backdrop");
    $("#messageModal_title").text(title);
    $("#messageModal_body").html(msg);
    $("#messageModal").modal("show");
}

function close_msgModal(){
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#messageModal").modal("hide");
}