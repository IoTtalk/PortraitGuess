//main
var group_list = [];

$(function(){
    $(document).on("change", "#grouplist_select", show_edit_window);
    $(document).on("click", "#group_edit_btn", function(event){ update_group(event, class_item); });
    $(document).on("click", "#group_delete_btn", function(event){ show_confirmModal(); });
    $(document).on("click", ".member_delete_btn", function(event){ delete_member(event); });
    $(document).on("click", ".member_add_btn", function(event){ add_member(event); });
    $(document).on("click", ".group_card_btn", function(event){ show_group_card(event, class_item); });

    $(document).on("click", "#confirmModal_confirm_btn", function(event){ confirmModal_confirm_btn_handler(delete_group_cb, null); });
    $(document).on("click", "#confirmModal_cancel_btn", function(event){ close_confirmModal(); });

    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=all&class_id=" + class_item.id,
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){
            show_msgModal("系統錯誤", "無法進入'編輯群組'頁面");
            console.log(e);
        },
        success: function(payload){
            let data = payload
            console.log(data);

            group_list = data.group_list;

            render_group_selector(data.group_list);
        }
    });
});

function render_group_selector(group_list){
    let classification_selector_str = '';
    group_list.forEach((group) => {
        if(group.id != "none"){
            if(group.status){
                classification_selector_str += '\
                    <option class="group_option" using="1" value="' + group.id + '">' + group.name + '(使用中)</option>\
                ';
            }
            else{
                classification_selector_str += '\
                    <option class="group_option" using="0" value="' + group.id + '">' + group.name + '</option>\
                ';
            }
        }
    });

    $("#grouplist_select").append(classification_selector_str);
}

function render_groupinfo(group_title, groupContentList, old_group){
    let groupContent_str = "";

    if(typeof groupContentList !== 'undefined' && groupContentList.length > 0){
        groupContentList.forEach((content) => {
            let status_str = "";
            if(content.status == "0"){
                status_str = '待審';
            }
            groupContent_str += '\
                <tr>\
                    <td width="70%"><label question_id="' + content.question_id + '" status="' + content.status + '">' + content.name + '</label></td>\
                    <td width="20%">' + status_str + '</td>\
                    <td width="10%"><button class="btn btn-outline-danger member_delete_btn">移除</button></td>\
                </tr>\
            ';
        });
    }
    else{
        groupContent_str += '<tr><td><label question_id="none">群組內尚無成員</label></td></tr>';
    }
    // check if those btn should change function for old/new group
    if(old_group){
        $("#group_edit_btn").attr("newgroup_flag", "0");
        $("#group_delete_btn").attr("newgroup_flag", "0");
    }
    else{
        $("#group_edit_btn").attr("newgroup_flag", "1");
        $("#group_delete_btn").attr("newgroup_flag", "1");
    }

    $("#group_title").text(group_title);
    $("#groupContent_table").html(groupContent_str);
    $("#group_info").show();
}

function add_member(event){
    let question_id = event.target.id,
        info = $(event.target).parent().next().find('label').text();
    console.log(question_id, info);

    //check the first added
    let $tablerow_label = $('#groupContent_table').find('label');
    if($tablerow_label.length == 1){
        $tablerow_label.each(function(){
        if($(this).attr("question_id") == "none"){
                $(this).parent().remove();
            }
        });
    }

    // check duplicate added
    let check_duplicate = false;
    $tablerow_label.each(function(){
        // console.log($this.text(), info);
        if($(this).text() == info){
            check_duplicate = true;
        }
    });

    if(check_duplicate){
        show_msgModal("系統訊息", "已添加過了");
        return false;
    }
    else{
        //append to grouptable
        let newQuestion_tablerow_str = '\
            <tr>\
                <td width="70%"><label question_id="' + question_id + '">' + info + '</label></td>\
                <td width="20%"></td>\
                <td width="10%"><button class="btn btn-outline-danger member_delete_btn">移除</button></td>\
            </tr>';

        if($("#groupContent_table").find('tbody').length){
            $("#groupContent_table").find('tbody').append(newQuestion_tablerow_str);
        }
        else{
            $("#groupContent_table").append(newQuestion_tablerow_str);
        }
    }
}

function delete_member(event){
    let $this = $(event.target);
    
    //check if the last one question
    let $tablerow_label = $('#groupContent_table').find('label');
    if($tablerow_label.length == 1){
        //add empty_str
        $this.parent().parent().remove();
        $("#groupContent_table").append('<tr><td><label question_id="none">群組內尚無成員</label></td></tr>');
    }
    else{
        $this.parent().parent().remove();
    }
}

function setpageToStartUp(){
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#confirmModal").modal("hide");

    $("#group_info").hide();
    $("#group_accordion").html("");

    //reset option select
    $("#grouplist_select").val("none");
}

function delete_group_cb(args){
    let newgroup_flag = $("#group_delete_btn").attr("newgroup_flag"),
        delete_group_id = $("option:selected").val();
    console.log(newgroup_flag, delete_group_id);

    if(newgroup_flag == "0"){ //delete old group
        //check is this group is using 
        let using = $("option:selected").attr("using");
        if(using == "1"){
            show_msgModal("系統訊息", "該群組正在'使用中'，無法刪除<br>請至'播放清單'頁面，將其取消勾選");
            return false;
        }
        else{
            //ajax
            $.ajax({
                type: "DELETE",
                url: location.origin + "/deleteGroup",
                cache: false,
                data: JSON.stringify(
                {
                    delete_group_id : delete_group_id
                }),
                contentType: "application/json",
                error: function(e){
                    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
                    $("#confirmModal").modal("hide");

                    //show msgModal
                    show_msgModal("系統錯誤", "刪除群組失敗");
                    console.log(e);
                },
                success: function(){
                    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
                    $("#confirmModal").modal("hide");

                    //show msgModal
                    show_msgModal("系統訊息", "刪除群組成功");
                    setpageToStartUp();

                    //remove this group from select option
                    $('#grouplist_select option[value="' + delete_group_id + '"]').remove();
                }
            });
        }
    }
    else{ //delete new group(clear edit window)
        close_confirmModal();
        show_msgModal("系統訊息", "刪除群組成功");
        setpageToStartUp();
    }
}

function render_group_accordion(class_item, option, group_list){
    let group_accordion_str = "",
        group_accordion = "";

    //default for "all question" in this class_id
    group_accordion += '\
        <div class="card">\
            <div id="all_heading" class="card-header group_card_btn" group_id="all"\
                data-toggle="collapse" data-target="#collapse_all" \
                aria-expanded="false" aria-controls="collapse_all">\
                <button class="btn btn-link">全部' + class_item.name + '</button>\
            </div>\
            <div id="collapse_all" class="collapse" aria-labelledby="all_heading" data-parent="#accordion">\
                <div class="card-body">\
                    <table id="all_class_table" class="table table-hover"></table>\
                </div>\
            </div>\
        </div>';

    group_list.forEach((group) => {
        let id = group.id,
            name = group.name;

        if(id == option){ //filter user selected option(group)
            return;
        }

        //create group card
        group_accordion += '\
            <div class="card">\
                <div id="' + id +'_heading" class="card-header group_card_btn" group_id="' + id + '"\
                    data-toggle="collapse" data-target="#collapse_'+ id +'" \
                    aria-expanded="false" aria-controls="collapse_'+ id +'">\
                    <button group_id="' + id + '" class="btn btn-link">' + name + '</button>\
                </div>\
                <div id="collapse_'+ id +'" class="collapse" aria-labelledby="' + id +'_heading" data-parent="#accordion">\
                    <div class="card-body">\
                        <table id="' + id + '_class_table" class="table table-hover"></table>\
                    </div>\
                </div>\
            </div>\
        ';
    });

    group_accordion_str = '\
        <h3 class="center">請勾選想要加入群組的' + class_item.name + '</h3>\
        <br>\
        <div id="accordion" class="accordion">\
            ' + group_accordion + '\
        </div>';

    $("#group_accordion").html(group_accordion_str)
}

function render_member_in_group_card(cardId, question_in_group_list){
    let question_in_group_table_str = "";

    question_in_group_table_str += '<tr><th width="20%">加入群組</th><th  width="35%">名字</th><th  width="45%">敘述</th></tr>'
    question_in_group_list.forEach((question) => {
        question_in_group_table_str += '\
            <tr>\
                <td><button id="' + question.id + '" class="btn btn-outline-info member_add_btn">加入</button>\
                <td><label>' + question.name + '</label></td>\
                <td><label>' + question.description + '</label></td>\
            </tr>\
        ';
    });

    $("#" + cardId).html(question_in_group_table_str);
}

function show_group_card(event, class_item){
    let $this = $(event.target),
        group_id = $this.attr("group_id") || $this.parent().attr("group_id"),
        expanded_check = $this.attr("aria-expanded") || $this.parent().attr("aria-expanded");
    
    console.log(group_id);
    console.log(expanded_check);
    
    if(expanded_check == "true"){
        if(group_id == "all"){
            $.ajax({
                type: "GET",
                url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=1",
                cache: false,
                contentType: "application/json",
                error: function(e){
                    show_msgModal("系統錯誤", "無法取得檔案資料");
                    console.log(e);
                },
                success: function(payload){
                    let data = JSON.parse(payload);
                    console.log(data);

                    //append into table
                    render_member_in_group_card("all_class_table", data.question_list);
                }
            });
        }
        else{
            $.ajax({
                type: "GET",
                url: location.origin + "/getGroupMember?mode=approved&group_id=" + group_id,
                cache: false,
                contentType: "application/json",
                error: function(e){
                    show_msgModal("系統錯誤", "無法取得群組資料");
                    console.log(e);
                },
                success: function(payload){
                    let data = JSON.parse(payload);
                    console.log(data);

                    //append into table
                    render_member_in_group_card(group_id + "_class_table", data.groupMember_list);
                }
            });
        }
    }
}

function update_group(event, class_item){
    let newgroup_flag = $(event.target).attr("newgroup_flag");
    if(newgroup_flag == "0"){ //update old groupmember
        let update_group_id = $("#grouplist_select").val(),
            using = $("option:selected").attr("using"),
            newgroup_list = [];

        $('#groupContent_table').find('label').each(function(){
            if($(this).attr("question_id") != "none"){
                newgroup_list.push({
                    question_id: $(this).attr("question_id")
                });
            }
        });

        console.log("using", using);
        if(using == "1"){
            if(newgroup_list.length <= 0){
                show_msgModal("系統訊息", "編輯'使用中'的群組<br>至少需選取 1 個");
                return false;
            }
        }

        console.log(update_group_id);
        console.log(newgroup_list);

        if(newgroup_list.length == 0){
            show_msgModal("系統訊息", "群組內需至少一位成員，或點選'刪除'完成操作");
            return false;
        }

        //ajax
        $.ajax({
            type: "PUT",
            url: location.origin + "/updateGroup",
            cache: false,
            data: JSON.stringify(
            {
                update_group_id : update_group_id,
                group_list : newgroup_list,
                class_id: class_item.id
            }),
            contentType: "application/json",
            error: function(e){
                show_msgModal("系統錯誤", "更新群組失敗");
                console.log(e);
            },
            success: function(){
                show_msgModal("系統訊息", "更新群組成功");
                setpageToStartUp();
            }
        });
    }
    else{ //add new group
        let newgroup_list = [],
            newgroup_name = $("#group_title").text();

        $('#groupContent_table').find('label').each(function(){
            // console.log($(this).attr("question_id"));
            if($(this).attr("question_id") != "none"){
                newgroup_list.push({
                    QuestionId: $(this).attr("question_id")
                });
            }
        });

        console.log(newgroup_name);
        console.log(newgroup_list);

        if(newgroup_list.length == 0){
            show_msgModal("系統訊息", "群組內需至少一位成員");
            return false;
        }

        //ajax
        $.ajax({
            type: "POST",
            url: location.origin + "/addNewGroup",
            cache: false,
            data: JSON.stringify(
            {
                newgroup_name : newgroup_name,
                group_list : newgroup_list,
                class_id : class_item.id
            }),
            contentType: "application/json",
            error: function(e){
                show_msgModal("系統錯誤", "無法新增群組");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload);
                console.log(data);

                //append this new group info to select option
                let new_option_str = '\
                    <option class="group_option" using="0" value="' + data.id + '">' + data.name + '</option>'
                $("#grouplist_select").append(new_option_str);

                show_msgModal("系統訊息", "新增群組 " + newgroup_name +" 成功");
                setpageToStartUp();
            }
        });
    }
}

function show_edit_window(){
    let option = $(this).val(),
        using = $('option:selected', this).attr('using');
    console.log($(this).val());
    console.log(using);
    
    if(option == "none"){ //user doesn't choose
        setpageToStartUp();
        return false;
    }
    else if(option == "newgroup"){ // add new group
        //get new group name
        let new_group_name = prompt("輸入群組名字");
        console.log(new_group_name);
        if(new_group_name != null){
            if($.trim(new_group_name) == ''){
                show_msgModal("系統訊息", "欄位不得空白");
                $(this).val("none");
                return false;
            }

            let duplicate_flag = false;
            for(let i = 0; i < group_list.length; i++){
                if(group_list[i].name == new_group_name){
                    duplicate_flag = true;
                    break;
                }
            }

            if(duplicate_flag == true){
                show_msgModal("系統訊息", "群組名字不得重複");
                $(this).val("none");
                return false;
            }
            else{
                //render group-content
                render_groupinfo(new_group_name, [], 0);
            }
        }
        else{
            $(this).val("none");
            return false;
        }
    }
    else{ //ajax get group info
        let old_group_name = $("#grouplist_select option[value='" + option + "']").text();
        console.log(old_group_name);

        //ajax
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroupMember?mode=all&group_id=" + option,
            cache: false,
            contentType: "application/json",
            error: function(e){
                show_msgModal("系統錯誤", "無法取得群組資料");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload);
                console.log(data);

                //render group content into table
                render_groupinfo(old_group_name, data.groupMember_list, 1);
            }
        });
    }

    //show group with corresponding class
    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=approved&class_id=" + class_item.id,
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){
            show_msgModal("系統錯誤", "無法取得其他群組資料");
            console.log(e);
        },
        success: function(data){
            console.log(data);
            render_group_accordion(class_item, option, data.group_list);
        }
    });
}
