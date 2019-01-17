function render_pending_div(class_item, pending_list){
    var pending_table_str = '<table id="pending_table" class="table table-hover">';
    pending_table_str += "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>"

    if(pending_list.length == 0){
        pending_table_str += "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>"
    }

    pending_list.forEach((pending_item) => {
        var id = pending_item.id,
            name = pending_item.name,
            description = pending_item.description;

        pending_table_str += '\
            <tr id="' + id + '">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button id="' + id + '_pendingbtn" class="btn btn-secondary pendingbtn">審核</button></td>\
            </tr>';
    });
    pending_table_str += "</table>";

    var pending_div = '\
        <h2 class="center top">待審檔案</h2>\
        <br>\
        <h3 class="center">請點選欲審核的檔案</h3>\
        <br>\
        <div class="margin_table pending_table">\
        ' + pending_table_str + ' \
        </div>\
        ';
    return pending_div;
}

function setupEditModal(class_item, questionData, status){
    var editModal_body_str = "",
        group_str = "",
        picture_str = "";

    //render question group
    var group_list = questionData.group;
    for(var i = 0; i < group_list.length; i++){
        var id = group_list[i].id,
            name = group_list[i].name,
            used = group_list[i].used;
        
        //mark this group checked
        if(used){
            group_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='editModal_" + id + "_checkbox' name='editModalgroup' value='" + id + "' checked/></td>\
                    <td><label for='editModal_" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        }
        else{
            group_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='editModal_" + id + "_checkbox' name='editModalgroup' value='" + id + "' /></td>\
                    <td><label for='editModal_" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        }
    }

    //render question picture
    var picture_list = questionData.picture;
    for(var i = 0; i < picture_list.length; i++){
        picture_str += '\
            <tr style="height:20px">\
                <td width="40%"><img id="' + picture_list[i] + '" src="/img/' + picture_list[i] + '" class="img-thumbnail"></td>\
                <td width="40%"></td>\
                <td>\
                    <ul class="list-group">\
                        <li class="list-group-item" onclick="picture_order_move(this, true)">&#9650;</li>\
                        <li class="list-group-item" onclick="picture_order_move(this, false)">&#9660;</li>\
                        <!-- <li class="list-group-item" onclick="picture_delete(this)"><a style="color: red">&#10005;</a></li> -->\
                    </ul>\
                </td>\
            </tr>';
    }

    //render footer btn
    var footer_str = '\
        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>\
        <button type="button" id="editModal_delete" class="btn btn-danger">刪除</button>\
        <button type="button" id="editModal_update" class="btn btn-warning">完成</button>\
        ';

    /* check modal mode */
    var mode;
    if(status == 1){
        mode = "編輯";
    }
    else{
        mode = "審核";
    }

    /* set modal title and body */
    $("#editModalLabel_title").text(class_item.name + mode);
    $('#editModal_s_name').text("名字");
    $('#editModal_s_description').text("描述");
    $('#editModal_s_group').text("分類");
    $('#editModal_s_picture').text("圖片");

    //set class default placeholder
    $("#editModal_name").attr("placeholder", class_item.sample_name);
    $("#editModal_description").attr("placeholder", class_item.description);

    //set human info
    $('#editModal_name').val(questionData.name);
    $('#editModal_description').val(questionData.description);

    //set all category and mark those used
    $('#editModal_group_table').html(group_str);

    //ser picture
    $('#editModal_picture_table').html(picture_str);

    /* set modal footer */
    $('#editModal_footer').html(footer_str);
}

function pendingbtn_handler(class_item, mode){
    $(".pendingbtn").on("click", function(){
        var id = this.id.split("_")[0];
        console.log("checking: ", id);
        
        $.ajax({
            type: "GET",
            url: location.origin + "/getQuestion?mode=one&class_id=" + class_item.id + "&question_id=" + id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var questionData = JSON.parse(data)
                console.log(questionData);

                //set modal content by questionData
                setupEditModal(class_item, questionData, 0);

                add_new_group_btn_handler(class_item, "editModal_add_new_group", "editModal_group_table");

                question_update_btn_handler(class_item, id, mode);
                question_delete_btn_handler(class_item, id, mode);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}

function question_update_btn_handler(class_item, id, mode){
    $("#editModal_update").on("click", function(){
        event.preventDefault();
        event.stopPropagation();

        // Get the data from input, create new FormData.
        var formData = new FormData(),
            name = $('#editModal_name').val(),
            description = $('#editModal_description').val(),
            img_order = {},
            data = {},
            selected_group = [];

        //chech input
        if($.trim(name) == ''){
            alert("名字必需填入");
            return false;
        }

        var $selected_list = $('input[name=editModalgroup]:checked');
        $selected_list.each(function (){
            selected_group.push($(this).val());
            // console.log($(this).val());
        });

        //get img order
        $("#editModal_picture_table img").each(function(index){
            img_order[$(this).attr('id')] = index + 1;
        });
        // console.log(img_order);

        //append data in formData
        data["id"] = id;
        data["img_order"] = img_order;
        data["selected_group"] = selected_group;
        data["name"] = name;
        data["description"] = description;

        console.log(data);

        //ajax
        $.ajax({
            type: "PUT",
            url: location.origin + "/questionUpdate",
            cache: false,
            data: JSON.stringify(
            {
                user_update_data : data
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                if(mode == "pending"){
                    //remove this question from pending table
                    $('#'+ id).remove();
                    
                    //display no more pending files in this class
                    var msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
                    if($("#pending_table tbody").find('tr').length == 1){
                        console.log('the last pending files');
                        $("tbody").append(msg);
                        $("#dropdown-menu-pending").html("");
                    }
                    
                    alert(name + " 審核成功!!");
                }
                else if(mode == "approved"){
                    //set new question info into approvd table
                    $('#'+ id).find('td:first-child').html(name);
                    $('#'+ id).find('td:nth-child(2)').html(description);
                    alert(name + " 編輯成功!!");
                }
                else if(mode == "group"){
                    alert(name + " 審核成功!!");
                    //[TODO] make <label> with attr 'question_id'
                    //and UI to 移除

                }

                //close edit modal
                $('#editModal').modal("hide");
            }
        });
    });
}

function question_delete_btn_handler(class_item, id, mode){
    $("#editModal_delete").on("click", function(){
        event.preventDefault();
        event.stopPropagation();

        //popup confirm box
        var warning_str = "確定要刪除嗎?";
        if(confirm(warning_str)){
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
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var response = JSON.parse(data);
                    if(mode == "approved"){
                        if(response.using){
                            alert("該檔案正在播放清單中，無法刪除\n請編輯使用中的群組!");
                        }
                    }
                    else if(mode == "pending"){
                        //remove this question from table
                        $('#'+ id).remove();

                        //display no more pending files in this class
                        var msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
                        if($("#pending_table tbody").find('tr').length == 1){
                            console.log('the last pending files');
                            $("tbody").append(msg);
                            $("#dropdown-menu-pending").html("");
                        }

                        alert("刪除成功!!");

                        //close edit modal
                        $('#editModal').modal("hide");
                    }
                    else if(mode == "group"){
                        //remove this question from table
                        $('#'+ id + "_pendingbtn").parent().parent().remove();

                        alert("刪除成功!!");

                        //close edit modal
                        $('#editModal').modal("hide");
                    }
                }
            });
        }
        else{
            return false;
        }
    });
}

function picture_order_move(trigger, blnUp){
    let trigRow = $(trigger).parent().parent().parent();

    if(blnUp){
        trigRow.insertBefore(trigRow.prev());
    }
    else{
        trigRow.insertAfter(trigRow.next());
    }
}

function picture_delete(trigger){
    let trigRow = $(trigger).parent().parent().parent().addClass('d-none');
    //[TODO] delete editModal picture, need to warning manager
    //       and check total picture number

    // console.log("delete picture: ", $(trigger).parent().parent().parent().children('td img').attr('id'));
}
