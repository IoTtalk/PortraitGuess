function show_new_group_edit_row(event, nameId, rowId){
    //show input text
    $("#" + rowId).show();
    $(event.target).hide();
    $("#" + nameId).val("");
}

function exec_add_new_group(class_item, btnId, nameId, tableId, rowId, checkboxname){
    let new_group_name = $("#" + nameId).val();
    console.log(new_group_name);
    if(new_group_name == null || $.trim(new_group_name) == ''){
        //show msgModal
        show_msgModal("系統訊息", "請輸入新群組名字");
        return false;
    }
    else if($('#' + tableId + ' label:contains("' + new_group_name + '")').length){
        //show msgModal
        show_msgModal("系統訊息", "群組名稱不得重複");
        return false;
    }
    else{
        //create new category in db
        $.ajax({
            type: "POST",
            url: location.origin + "/addNewGroup",
            cache: false,
            data: JSON.stringify(
            {
                newgroup_name : new_group_name,
                group_list : [],
                class_id : class_item.id,
            }),
            contentType: "application/json",
            error: function(e){
                //show msgModal
                show_msgModal("系統錯誤", "無法新增群組");
                console.log(e);
            },
            success: function(data){
                let new_group_item = JSON.parse(data);
                console.log("add: ", new_group_item);

                render_new_group_tablerow(tableId, new_group_item, checkboxname);

                //show msgModal
                show_msgModal("系統訊息", "新增群組" + new_group_name + "成功");
                $("#" + btnId).show();
                $("#" + rowId).hide();
            }
        });
    }
}

function cancel_add_new_group(btnId, rowId){
    $("#" + rowId).hide();
    $("#" + btnId).show();
}

function render_new_group_tablerow(table_id, new_group_item, checkboxname){
    let new_id = new_group_item.id,
        new_name = new_group_item.name,
        newGroupTableRow = "";

    console.log(new_id, new_name);
    newGroupTableRow += "\
        <tr>\
            <td class='mycheckbox'><input type='checkbox' id='" + new_id + "_checkbox' name='" + checkboxname + "' value='" + new_id + "' checked/></td>\
            <td><label for='" + new_id + "_checkbox'>" + new_name + "</label></td>\
        </tr>";

    // console.log(newGroupId, newGroupName);

    //check if tbody is existed
    let $table_id = "#" + table_id;
    if($($table_id).find('tbody').length){
        //check this is the first Group for this new class
        if($($table_id).find('tr').length == 1){
            //it is the first Group
            if($($table_id).find('td').hasClass('none')){
                console.log("this is first Group");
                console.log("should special deal with the IU");
                //first time adding Group should clear table row
                $($table_id).find('tbody').html(newGroupTableRow);
            }
            else{
                $($table_id).find('tbody').append(newGroupTableRow);
            }
        }
        else{
            $($table_id).find('tbody').append(newGroupTableRow);
        }
    }
    else{
        if($($table_id).find('tr').length == 1){
            //it is the first Group
            if($($table_id).find('td').hasClass('none')){
                console.log("this is first Group");
                console.log("should special deal with the IU");
                //first time adding Group should clear table row
                $($table_id).html(newGroupTableRow);
            }
            else{
                $($table_id).append(newGroupTableRow);
            }
        }
        else{
            $($table_id).append(newGroupTableRow);
        }
    }
}

function refresh_question(class_item, mode){
    let status;
    if(mode == "pending"){
        status = 0;
    }
    else if(mode == "approved"){
        status = 1;
    }

    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=" + status,
        cache: false,
        contentType: "application/json",
        error: function(e){
            show_msgModal("系統錯誤", "無法更新檔案資料");
            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log(data);;

            if(mode == "pending"){
                render_pending_table(data.class_item, data.question_list);
            }
            else{
                render_approved_table(data.class_item, data.question_list);
            }
            
            question_list = data.question_list;
        }
    });
}

function display_ascending_question(class_item, mode){
    if(mode == "pending"){
        render_pending_table(class_item, question_list);
    }
    else if(mode == "approved"){
        render_approved_table(class_item, question_list);
    }
}

function display_descending_question(class_item, mode){
    let reverse_question_list = question_list.slice();
    if(mode == "pending"){
        render_pending_table(class_item, reverse_question_list.reverse());
    }
    else if(mode == "approved"){
        render_approved_table(class_item, reverse_question_list.reverse());
    }
}

function delete_question_cb(args){
    let class_item = args.class_item,
        id = args.$this.attr("question_id"),
        mode = args.mode;

    //ajax
    $.ajax({
        type: "DELETE",
        url: location.origin + "/questionDelete",
        cache: false,
        data: JSON.stringify(
        {
            delete_question_id : id
        }),
        contentType: "application/json",
        error: function(e){
            $("#editModal_msg").text("[系統錯誤]<br>檔案無法刪除");
            console.log(e);
        },
        success: function(data){
            let response = JSON.parse(data);
            console.log(data);
            if(mode == "approved"){
                console.log("approved");
                if(response.using){
                    $("#editModal_msg").text("[系統訊息]<br>該檔案正在播放清單中，無法刪除<br>請至'編輯群組'頁面<br>編輯使用中的群組");
                }
                else{
                    console.log("not using");
                    //remove this question from table
                    $('#'+ id + "_row").remove();

                    //display no more approved files in this class
                    let msg = "<tr><td>所有" + class_item.name + "檔案皆已刪除完畢</td></tr>";
                    if($("#approved_table").find('tr').length == 1){
                        console.log('the last pending files');
                        $("#approved_table").append(msg);
                    }

                    $("#confirmModal").modal("hide");
                    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
                    $('#editModal').modal("hide");
                    show_msgModal("系統訊息", "檔案刪除成功");
                }
            }
            else if(mode == "pending"){
                console.log("pending");
                //remove this question from table
                $('#'+ id + "_row").remove();

                //display no more pending files in this class
                let msg = "<tr><td>所有" + class_item.name + "檔案皆已審核完畢</td></tr>";
                if($("#pending_table").find('tr').length == 1){
                    console.log('the last pending files');
                    $("#pending_table").append(msg);
                }

                $("#confirmModal").modal("hide");
                $("#my_modal_backdrop").removeClass("my_modal_backdrop");
                $('#editModal').modal("hide");
                show_msgModal("系統訊息", "檔案刪除成功");
            }
        }
    });
}
