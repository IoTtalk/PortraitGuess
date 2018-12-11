function render_pending_div(pendingHuman_list){
    var pending_table_str = '<table class="table table-hover">';
    pendingHuman_list.forEach((pendingHuman) => {
        var id = pendingHuman["id"],
            info = pendingHuman["info"]["chi_name"] + " , " + pendingHuman["info"]["eng_name"] + " , " +
                   pendingHuman["info"]["birth_year"] + " - " + pendingHuman["info"]["death_year"];

        pending_table_str += '\
            <tr id="' + id + '">\
                <td>' + info + '</td>\
                <td><button id="' + id + '_pendingbtn" class="btn btn-secondary pendingbtn">審核</button></td>\
            </tr>';
    });
    pending_table_str += "</table>";

    var pending_div = '\
        <h2 class="center top">待審檔案</h2>\
        <br>\
        <h3 class="center">請點選欲審核的檔案</h3>\
        <br>\
        <div class="margin_center pending_table">\
        ' + pending_table_str + ' \
        </div>\
        ';
    return pending_div;
}

function setupEditModal(humanData, status){
    var editModal_body_str = "",
        category_str = "",
        picture_str = "";

    //render human category
    var category_list = humanData.category;
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
    var picture_list = humanData.picture;
    for(var i = 0; i < picture_list.length; i++){
        picture_str += '\
            <tr>\
                <td width="50%"><img id="' + picture_list[i] + '" src="/img/' + picture_list[i] + '" class="img-thumbnail"></td>\
                <td width="30%"></td>\
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
        $("#editModalLabel").text("人物編輯");
    }
    else{
        $("#editModalLabel").text("人物審核");
    }

    /* set modal body */
    //set human info
    $('#editModal_chi_name').val(humanData.human.chi_name);
    $('#editModal_eng_name').val(humanData.human.eng_name);
    $('#editModal_birth_year').val(humanData.human.birth_year);
    $('#editModal_death_year').val(humanData.human.death_year);

    //set all category and mark those used
    $('#editModal_category_table').html(category_str);

    //ser picture
    $('#editModal_picture_table').html(picture_str);

    /* set modal footer */
    $('#editModal_footer').html(footer_str);
}

function pendingbtn_handler(){
    $(".pendingbtn").on("click", function(){
        var id = this.id.split("_")[0];
        console.log(id);
        
        $.ajax({
            type: "POST",
            url: location.origin + "/getHumanAllData",
            cache: false,
            data: JSON.stringify(
            {
                questionId : id,
                status : 0
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var humanData = JSON.parse(data)
                console.log(humanData);

                //set modal content by humanData
                setupEditModal(humanData, 0);

                add_new_category_btn_handler("editModal_add_new_category", "editModal_category_table");

                human_update_btn_handler(id, 0);
                human_delete_btn_handler("pending", id);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}

function human_update_btn_handler(id, status){
    $("#editModal_update").on("click", function(){
        event.preventDefault();
        event.stopPropagation();

        // Get the data from input, create new FormData.
        var formData = new FormData(),
            chi_name = $('#editModal_chi_name').val(),
            eng_name = $('#editModal_eng_name').val(),
            birth_year = $('#editModal_birth_year').val(),
            death_year = $('#editModal_death_year').val(),
            img_order = {},
            data = {},
            selected_category = [];

        //chech input
        if($.trim(chi_name) == '' && $.trim(eng_name) == ''){
            alert("中英文名字須至少填入一個");
            return false;
        }

        if($.trim(birth_year) == ''){
            alert("請填入出生年份");
            return false;
        }

        var $selected_list = $('input[name=editModalcategory]:checked');
        if($selected_list.length < 1){
            alert('至少選取 1 個人物分類');
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
        data["chi_name"] = chi_name;
        data["eng_name"] = eng_name;
        data["birth_year"] = birth_year;
        data["death_year"] = death_year;
        // formData.append("user_upload_data", JSON.stringify(data));

        console.log(data);

        //ajax
        $.ajax({
            type: "POST",
            url: location.origin + "/humanUpdate",
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
                    //remove this human from pending table
                    $('#'+ id).remove();
                }
                else{
                    //set new human info into approvd table
                    var new_info = chi_name + " , " + eng_name + " , " + birth_year + " - " + death_year;
                    $('#'+ id).find('td:first-child').html(new_info);
                }

                //close edit modal
                $('#editModal').modal("hide");

                alert("審核成功!!");
            }
        });
    });
}

function human_delete_btn_handler(mode, id){
    $("#editModal_delete").on("click", function(){
        event.preventDefault();
        event.stopPropagation();

        //popup confirm box
        var warning_str;
        if(mode == "pending"){
            warning_str = "確定要刪除嗎?";
        }
        else{
            warning_str = "如果該人物在播放清單中\n可能會導致人數不足的錯誤\n請先確認該人物是否使用中喔\n確定要刪除嗎?";
        }

        if(confirm(warning_str)){
            //ajax
            $.ajax({
                type: "POST",
                url: location.origin + "/humanDelete",
                cache: false,
                data: JSON.stringify(
                {
                    delete_human_id : id
                }),
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    //remove this human from pending table
                    $('#'+ id).remove();

                    //close edit modal
                    $('#editModal').modal("hide");

                    alert("刪除成功!!");
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
