function render_pending_div(pending_table_str){
    let pending_div = '\
        <h2 class="center top">待審檔案</h2>\
        <br>\
        <h3 class="center">請點選欲審核的檔案</h3>\
        <br>\
        <div class="center">\
            <button id="refresh" class="btn btn-secondary">&#8635;</button>\
            <button id="ascending" class="btn btn-secondary">&#9650;</button>\
            <button id="descending" class="btn btn-secondary">&#9660;</button>\
        </div>\
        <br>\
        <div class="margin_table pending_table">\
            <table id="pending_table" class="table table-hover">\
                ' + pending_table_str + ' \
            </table>\
        </div>\
        ';
    return pending_div;
}

function render_pending_table(class_item, pending_list){
    let pending_table_str = "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>";
    if(pending_list.length == 0){
        pending_table_str += "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>"
    }

    pending_list.forEach((pending_item) => {
        let id = pending_item.id,
            name = pending_item.name,
            description = pending_item.description;

        pending_table_str += '\
            <tr id="' + id + '">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button id="' + id + '_pendingbtn" class="btn btn-secondary pendingbtn">審核</button></td>\
            </tr>';
    });

    return pending_table_str;
}

function setupEditModal(class_item, questionData, status){
    let editModal_body_str = "",
        group_str = "",
        picture_str = "";

    //render question group
    let group_list = questionData.group;
    for(let i = 0; i < group_list.length; i++){
        let id = group_list[i].id,
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
    let picture_list = questionData.picture;
    for(let i = 0; i < picture_list.length; i++){
        picture_str += '\
            <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">\
                <img id="' + picture_list[i] + '" src="/img/' + picture_list[i] + '" class="img-thumbnail">\
                </img>\
            </div>';
    }

    //render footer btn
    let footer_str = '\
        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>\
        <button type="button" id="editModal_delete" class="btn btn-danger">刪除</button>\
        <button type="button" id="editModal_update" class="btn btn-warning">完成</button>\
        ';

    /* check modal mode */
    let mode;
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
    $('#editModal_picture_row').html(picture_str);
    $("#editModal_picture_row").sortable();
    $("#movable_pic_row").disableSelection();

    /* set modal footer */
    $('#editModal_footer').html(footer_str);
}

function pendingbtn_handler(class_item, mode){
    $(".pendingbtn").on("click", function(){
        let id = this.id.split("_")[0];
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
                let questionData = JSON.parse(data)
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
        let formData = new FormData(),
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

        let $selected_list = $('input[name=editModalgroup]:checked');
        $selected_list.each(function (){
            selected_group.push($(this).val());
            // console.log($(this).val());
        });

        //get img order
        $("#editModal_picture_row img").each(function(index){
            img_order[$(this).attr('id')] = index + 1;
        });
        console.log(img_order);

        //append data in formData
        data["id"] = id;
        data["class_id"] = class_item.id;
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
                    let msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
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
        let warning_str = "確定要刪除嗎?";
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
                    let response = JSON.parse(data);
                    if(mode == "approved"){
                        if(response.using){
                            alert("該檔案正在播放清單中，無法刪除\n請編輯使用中的群組!");
                        }
                        else{
                            //remove this question from table
                            $('#'+ id).remove();

                            alert("刪除成功!!");

                            //close edit modal
                            $('#editModal').modal("hide");
                        }
                    }
                    else if(mode == "pending"){
                        //remove this question from table
                        $('#'+ id).remove();

                        //display no more pending files in this class
                        let msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
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

function refreshbtn_handler(class_item, mode){
    $("#refresh").on("click", function(){
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
                alert("something wrong");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload);
                console.log(data);

                if(mode == "pending"){
                    $('#pending_table').html(render_pending_table(data.class_item, data.question_list));
                    pendingbtn_handler(data.class_item, "pending");
                }
                else{
                    $('#approved_table').html(render_approved_table(data.class_item, data.question_list));
                    approvedbtn_handler(data.class_item, "approved");
                }
            }
        });
    });
}

function ascendingbtn_handler(class_item, question_list, mode){
    $("#ascending").on("click", function(){
        if(mode == "pending"){
            $('#pending_table').html(render_pending_table(class_item, question_list));
            pendingbtn_handler(class_item, "pending");
        }
        else if(mode == "approved"){
            $('#approved_table').html(render_approved_table(class_item, question_list));
            approvedbtn_handler(class_item, "pending");
        }
    });
}

function descendingbtn_handler(class_item, question_list, mode){
    $("#descending").on("click", function(){
        let reverse_question_list = question_list.slice();
        if(mode == "pending"){
            $('#pending_table').html(render_pending_table(class_item, reverse_question_list.reverse()));
            pendingbtn_handler(class_item, "pending");
        }
        else if(mode == "approved"){
            $('#approved_table').html(render_approved_table(class_item, reverse_question_list.reverse()));
            approvedbtn_handler(class_item, "approved");
        }
    });
}