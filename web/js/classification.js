function render_classification_selector(group_list){
    var classification_selector_str = '<select class="form-control" id="grouplist_select">';

    classification_selector_str += '<option value="none">---</option>'
    classification_selector_str += '<option value="newgroup">新增群組</option>'
    
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

    classification_selector_str += "</select>";

    return classification_selector_str;
}

function render_groupinfo(group_title, groupContentList, old_group){
    var groupinfo_str = "",
        groupContent_str = "",
        info = "";

        if(typeof groupContentList !== 'undefined' && groupContentList.length > 0){
            groupContentList.forEach((content) => {
                var status_str = "";
                if(content.status == "0"){
                    status_str = '待審';
                }
                groupContent_str += '\
                    <tr>\
                        <td width="70%"><label question_id="' + content.question_id + '" status="' + content.status + '">' + content.name + '</label></td>\
                        <td width="20%">' + status_str + '</td>\
                        <td width="10%"><button class="btn btn-outline-danger grouplist_delete">移除</button></td>\
                    </tr>\
                ';
            });
        }
        else{
            groupContent_str += '<tr><td><label question_id="none">群組內尚無成員</label></td></tr>';
        }

        var left_btn_id = "addNewGroup_btn",
            right_bth_id = "abortNow_btn";

        // check if those btn should change function for old/new group
        if(old_group){
            left_btn_id = "updateOldGroup_btn";
            right_bth_id = "deleteNow_btn";
        }

        groupinfo_str +='\
            <h2 id="group_title" class="center">' + group_title + '</h2>\
            <div class="groupContent_table">\
                <table id="groupContent_table" class="table table-hover ">\
                    ' + groupContent_str + '\
                </table>\
            </div>\
            <br>\
            <div class="center bottom">\
                <button id="' + left_btn_id + '" class="btn btn-primary">確認</button>\
                <button id="' + right_bth_id + '" class="btn btn-danger">刪除</button>\
            </div>\
        ';

    return groupinfo_str;
}

function render_group_accordion(class_item, option, group_list){
    var group_accordion_str = "",
        group_accordion = "";

    //default for "all question" in this class_id
    group_accordion += '\
        <div class="card">\
            <div id="all_heading" class="card-header collapsed class_card_btn" group_id="all"\
                data-toggle="collapse" data-target="#collapse_all" \
                aria-expanded="false" aria-controls="collapse_all">\
                <button class="btn btn-link">全部' + class_item.name + '</button>\
            </div>\
            <div id="collapse_all" class="collapse" aria-labelledby="all_heading" data-parent="#accordion">\
                <div class="card-body">\
                    <table id="all_class_table" class="table table-hover"></table>\
                </div>\
            </div>\
        </div>\
    ';

    group_list.forEach((group) => {
        var id = group.id,
            name = group.name;

        if(id == option){ //filter user selected option(group)
            return;
        }

        //create group card
        group_accordion += '\
            <div class="card">\
                <div id="' + id +'_heading" class="card-header collapsed class_card_btn" group_id="' + id + '"\
                    data-toggle="collapse" data-target="#collapse_'+ id +'" \
                    aria-expanded="false" aria-controls="collapse_'+ id +'">\
                    <button class="btn btn-link collapsed class_card_btn">' + name + '</button>\
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
        </div>\
        ';
    return group_accordion_str;
}

function render_question_in_group_table(category_id, question_in_group_list){
    var question_in_group_table_str = "";

    question_in_group_table_str += '<tr><th width="10%"></th><th  width="40%">名字</th><th  width="50%">敘述</th></tr>'
    question_in_group_list.forEach((question) => {
        question_in_group_table_str += '\
            <tr>\
                <td><button id="' + question.id + '" class="btn btn-outline-info addhuman_btn">添加</button>\
                <td><label>' + question.name + '</label></td>\
                <td><label>' + question.description + '</label></td>\
            </tr>\
        ';
    });

    return question_in_group_table_str;
}

function groupinfo_delete_handler(){
    $(".grouplist_delete").on('click', function(){
        console.log(this.id);
        
        //check if the last one question
        var $tablerow_label = $('#groupContent_table').find('label');
        if($tablerow_label.length == 1){
            //add empty_str
            $(this).parent().parent().remove();
            $("#groupContent_table").append('<tr><td><label question_id="none">群組內尚無成員</label></td></tr>');
        }
        else{
            $(this).parent().parent().remove();
        }
    });
}

function updateOldGroup_btn_handler(class_item, using){
    $("#updateOldGroup_btn").on('click', function(){
        var update_group_id = $("#grouplist_select").val(),
            newgroup_list = [];

        $('#groupContent_table').find('label').each(function(){
            if($(this).attr("question_id") != "none"){
                newgroup_list.push({
                    question_id: $(this).attr("question_id")
                });
            }
        });

        if(using == "1"){
            if(newgroup_list.length <= 0){
                alert("使用中的群組\n至少選取 1 位");
                return false;
            }
        }

        console.log(update_group_id);
        console.log(newgroup_list);

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
                alert("something wrong");
                console.log(e);
            },
            success: function(){
                //alert success and reload page
                alert("更新成功!!");
                // location.reload();
                setpageToStartUp();
            }
        });
    });
}

function deleteNow_btn_handler(group_list){
    $("#deleteNow_btn").on('click', function(){
        var delete_group_id = $("#grouplist_select").val();

        for(var i = 0; i < group_list.length; i++){
            if(group_list[i].id == delete_group_id && group_list[i].status){
                alert("該群組正在使用中，無法刪除\n請至'播放清單'將其取消勾選");
                return false;
            }
        }

        //popup confirm box
        if(confirm("確定要刪除嗎?")){
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
                    alert("something wrong");
                    console.log(e);
                },
                success: function(){
                    alert("刪除成功");
                    // location.reload();
                    setpageToStartUp();

                    //remove this group from select option
                    $('#grouplist_select option[value="' + delete_group_id + '"]').remove();
                }
            });
        }
        else{
            return false;
        }
    });
}

function addquestion_btn_handler(){
    $(".addhuman_btn").on('click', function(){
        var question_id = this.id,
            info = $(this).parent().next().find('label').text();
        console.log(question_id, info);

        //check the first added
        var $tablerow_label = $('#groupContent_table').find('label');
        if($tablerow_label.length == 1){
            $tablerow_label.each(function(){
            if($(this).attr("question_id") == "none"){
                    $(this).parent().remove();
                }
            });
        }

        // check duplicate added
        var check_duplicate = false;
        $tablerow_label.each(function(){
            if($(this).text() == info){
                check_duplicate = true;
            }
        });

        if(check_duplicate){
            alert("已添加過了!!");
            return false;
        }

        //append to grouptable
        var newQuestion_tablerow_str = '\
            <tr>\
                <td width="70%"><label question_id="' + question_id + '">' + info + '</label></td>\
                <td width="20%"></td>\
                <td width="10%"><button class="btn btn-outline-danger grouplist_delete">移除</button></td>\
            </tr>\
        ';

        if($("#groupContent_table").find('tbody').length){
            $("#groupContent_table").find('tbody').append(newQuestion_tablerow_str);
        }
        else{
            $("#groupContent_table").append(newQuestion_tablerow_str);
        }

        // add handler for new human
        groupinfo_delete_handler();
    });
}

function class_card_btn_handler(class_item){
    $(".class_card_btn").on("click", function(){
        var group_id = $(this).attr("group_id");
        console.log(group_id);

        if($(this).hasClass("collapsed")){
            if(group_id == "all"){
                $.ajax({
                    type: "GET",
                    url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=1",
                    cache: false,
                    contentType: "application/json",
                    error: function(e){
                        alert("something wrong");
                        console.log(e);
                    },
                    success: function(payload){
                        var data = JSON.parse(payload);
                        console.log(data);

                        //append into table
                        $("#all_class_table").html(render_question_in_group_table("all", data.question_list));
                        
                        //add_btn_handler
                        addquestion_btn_handler();
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
                        alert("something wrong");
                        console.log(e);
                    },
                    success: function(payload){
                        var data = JSON.parse(payload);
                        console.log(data);

                        //append into table
                        var target_table = "#" + group_id + "_class_table";
                        $(target_table).html(render_question_in_group_table(group_id, data.groupMember_list));
                        
                        //add_btn_handler
                        addquestion_btn_handler();
                    }
                });
            }
        }
    });
}

//create new group ajax for new group
function addNewGroup_btn_handler(class_item){ 
    $("#addNewGroup_btn").on('click',function(){
        var newgroup_list = [],
            newgroup_name = $("#group_title").text();

        $('#groupContent_table').find('label').each(function(){
            // console.log($(this).attr("question_id"));
            if($(this).attr("question_id") != "none"){
                newgroup_list.push({
                    QuestionId: $(this).attr("question_id")
                });
            }
        });

        // if(newgroup_list.length <= 0){
        //     alert("至少選取 1 個喔");
        //     return false;
        // }

        console.log(newgroup_name);
        console.log(newgroup_list);

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
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var new_group_id = JSON.parse(data);
                console.log(new_group_id);

                //append this new group info to select option
                var new_option_str = '\
                    <option class="group_option" value="' + new_group_id + '">' + newgroup_name + '</option>'
                $("#grouplist_select").append(new_option_str);

                //alert success
                alert("群組建立成功!!");
                // location.reload();
                setpageToStartUp();
            }
        });
    });
}

function setpageToStartUp(){
    $("#group_info").html("");
    $("#human_accordion").html("");

    //reset option select
    $("#grouplist_select").val("none");
}

//abortion for new group
function abortNow_btn_handler(){
    $("#abortNow_btn").on('click',function(){
        if(confirm("確定要刪除嗎?")){
            //remove all div
            setpageToStartUp();
        }
    });
}

function option_handler(class_item, group_list){
    $("#grouplist_select").on("change", function(){
        var option = $(this).val(),
            using = $('option:selected', this).attr('using');
        // console.log($(this).val());
        console.log(using);
        
        if(option == "none"){ //user doesn't choose
            setpageToStartUp();
            return false;
        }
        else if(option == "newgroup"){ // add new group
            //get new group name
            var new_group_name = prompt("輸入新群組名稱");
            console.log(new_group_name);
            if(new_group_name != null){
                if($.trim(new_group_name) == ''){
                    alert("欄位不得空白");
                    $(this).val("none");
                    return false;
                }

                var duplicate_flag = false;
                for(var i = 0; i < group_list.length; i++){
                    if(group_list[i].name == new_group_name){
                        duplicate_flag = true;
                        break;
                    }
                }

                if(duplicate_flag == true){
                    alert("群組名字不得重複");
                    $(this).val("none");
                    return false;
                }
                else{
                    //render group-content
                    $('#group_info').html(render_groupinfo(new_group_name, [], 0));
                    addNewGroup_btn_handler(class_item);
                    abortNow_btn_handler();

                    //show something
                }
            }
            else{
                $(this).val("none");
                return false;
            }
        }
        else{ //ajax get group info
            var old_group_name = $("#grouplist_select option[value='" + option + "']").text();
            console.log(old_group_name);

            //ajax
            $.ajax({
                type: "GET",
                url: location.origin + "/getGroupMember?mode=all&group_id=" + option,
                cache: false,
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(payload){
                    var data = JSON.parse(payload);
                    console.log(data);

                    //render group content into table
                    $('#group_info').html(render_groupinfo(old_group_name, data.groupMember_list, 1));

                    //let group member can be deleted
                    groupinfo_delete_handler();

                    //update and delete btn handler
                    updateOldGroup_btn_handler(class_item, using);
                    deleteNow_btn_handler(group_list);
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
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                console.log(data);
                
                $("#human_accordion").html(render_group_accordion(class_item, option, data.group_list));
                class_card_btn_handler(class_item);
            }
        });
    });
}

function render_classification_div(class_item, classification_selector_str){
    var pending_div = '\
        <div class="row">\
            <div class="col-md-6">\
                <div class="form-group">\
                    <h2 class="center">編輯群組</h2>\
                    <br>\
                    <h5>請點擊下拉選單</h5>\
                    ' + classification_selector_str + '\
                </div>\
                <br>\
                <div id="group_info"></div>\
            </div>\
            <div id="human_accordion" class="col-md-6"></div>\
        </div>\
    ';

    return pending_div;
}
