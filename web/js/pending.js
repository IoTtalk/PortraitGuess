function render_pending_div(class_item, pending_list){
    var pending_table_str = '<table id="pending_table" class="table table-hover">';
    
    if(pending_list.length == 0){
        pending_table_str += "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>"
    }

    pending_list.forEach((pending_item) => {
        var id = pending_item.id,
            info = pending_item.name;

        pending_table_str += '\
            <tr id="' + id + '">\
                <td>' + info + '</td>\
                <td><button id="' + id + '_pendingbtn" class="btn btn-secondary pendingbtn">審核</button></td>\
            </tr>';
    });
    pending_table_str += "</table>";

    var pending_div = '\
        <h2 class="center top">待審' + class_item.name + '檔案</h2>\
        <br>\
        <h3 class="center">請點選欲審核的' + class_item.name + '檔案</h3>\
        <br>\
        <div class="margin_center pending_table">\
        ' + pending_table_str + ' \
        </div>\
        ';
    return pending_div;
}

function setupEditModal(class_item, questionData, status){
    var editModal_body_str = "",
        category_str = "",
        picture_str = "";

    //render human category
    var category_list = questionData.category;
    for(var i = 0; i < category_list.length; i++){
        var id = category_list[i].id,
            name = category_list[i].name,
            used = category_list[i].used;
        
        //mark this category checked
        if(used){
            category_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='editModal_" + id + "_checkbox' name='editModalcategory' value='" + id + "' checked/></td>\
                    <td><label for='editModal_" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        }
        else{
            category_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='editModal_" + id + "_checkbox' name='editModalcategory' value='" + id + "' /></td>\
                    <td><label for='editModal_" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        }
    }

    //render human picture
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

    /* set modal title */
    if(status){
        $("#editModalLabel").text(class_item.name + "編輯");
    }
    else{
        $("#editModalLabel").text(class_item.name + "審核");
    }

    /* set modal body */
    //set human info
    $('#editModal_name').val(questionData.name);
    $('#editModal_description').val(questionData.description);

    //set all category and mark those used
    $('#editModal_category_table').html(category_str);

    //ser picture
    $('#editModal_picture_table').html(picture_str);

    /* set modal footer */
    $('#editModal_footer').html(footer_str);
}

function pendingbtn_handler(class_item){
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

                //set modal content by humanData
                setupEditModal(class_item, questionData, 0);

                add_new_category_btn_handler(class_item, "editModal_add_new_category", "editModal_category_table");

                question_update_btn_handler(class_item, id, 0);
                question_delete_btn_handler(id);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}

function question_update_btn_handler(class_item, id, status){
    $("#editModal_update").on("click", function(){
        event.preventDefault();
        event.stopPropagation();

        // Get the data from input, create new FormData.
        var formData = new FormData(),
            name = $('#editModal_name').val(),
            description = $('#editModal_description').val(),
            img_order = {},
            data = {},
            selected_category = [];

        //chech input
        if($.trim(name) == ''){
            alert("名字必需填入");
            return false;
        }

        var $selected_list = $('input[name=editModalcategory]:checked');
        if($selected_list.length < 1){
            alert('至少選取 1 個分類');
            return false;
        }
        else{
            $selected_list.each(function (){
                selected_category.push($(this).val());
                // console.log($(this).val());
            });
        }

        //get img order
        $("#editModal_picture_table img").each(function(index){
            img_order[$(this).attr('id')] = index + 1;
        });
        // console.log(img_order);

        //append data in formData
        data["id"] = id;
        data["img_order"] = img_order;
        data["selected_category"] = selected_category;
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
                if(!status){
                    //remove this question from pending table
                    $('#'+ id).remove();
                    
                    //display no more pending files in this class
                    if($("#pending_table tbody").find('tr').length == 0){
                        console.log('the last pending files');
                        var msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
                        $("tbody").append(msg);
                    }
                    else if($("#pending_table table").find('tr').length == 0){
                        console.log('the last pending files');
                        var msg = "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>";
                        $("table").append(msg);
                    }
                    
                    alert(name + " 審核成功!!");
                }
                else{
                    //set new question info into approvd table
                    $('#'+ id).find('td:first-child').html(name + description);
                    alert(name + " 編輯成功!!");
                }

                //close edit modal
                $('#editModal').modal("hide");
            }
        });
    });
}

function question_delete_btn_handler(id){
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

                    if(response.using){
                        alert("該檔案正在使用中，無法刪除\n請編輯使用中的群組!");
                    }
                    else{
                        //remove this question from table
                        $('#'+ id).remove();

                        //close edit modal
                        $('#editModal').modal("hide");

                        alert("刪除成功!!");
                        //[TODO]
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
