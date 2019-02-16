function addnewclass_handler(){
    let class_name = $("#classModal_class_name").val(),
        sample_name = $("#classModal_sample_name").val(),
        sample_description = $("#classModal_sample_description").val();

    console.log(class_name, sample_name, sample_description);
    
    //check input
    if($.trim(class_name) == ""){
        $("#classModal_msg").text("請輸入名稱");
        return false;
    }

    if($.trim(sample_name) == ""){
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
            $("#classModal_msg").text("");
            $("#classModal").modal("hide");
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
            $("#classModal_msg").text("");
            $('#classModal').modal("hide");

            // show_msgModal("系統訊息", "新增類別 " + class_name + " 成功");

            // redirect upload page
            location.href= location.origin + '/upload/' + data.class_id;
        }
    });
}

function show_classModal(){
    $("#classModal").modal("show");
}

function show_msgModal(title, msg1, msg2=""){
    $("#my_modal_backdrop").addClass("my_modal_backdrop");
    $("#messageModal_title").text(title);
    $("#messageModal_body1").html(msg1);
    $("#messageModal_body2").html(msg2);
    $("#messageModal").modal("show");
}

function close_msgModal(){
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#messageModal").modal("hide");
}


function setupEditModal(class_item, questionData, status){
    let editModal_body_str = "",
        group_str = "",
        picture_str = "";

    //clear msg field
    $("#editModal_msg").text("");

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
                    <td class='mycheckbox'><input type='checkbox' id='" + id + "_checkbox' name='editModalgroup' value='" + id + "' checked/></td>\
                    <td><label for='" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        }
        else{
            group_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='" + id + "_checkbox' name='editModalgroup' value='" + id + "' /></td>\
                    <td><label for='" + id + "_checkbox'>" + name + "</label></td>\
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
}

function show_confirmModal(){
    //popup confirmModal
    $("#my_modal_backdrop").addClass("my_modal_backdrop");
    $("#confirmModal_title").text("確定要刪除嗎？");
    $("#confirmModal").modal("show");
}

function update_question(event, class_id, mode){
    // Get the data from input, create new FormData.
    let formData = new FormData(),
        question_id = $(event.target).attr("question_id"),
        name = $('#editModal_name').val(),
        description = $('#editModal_description').val(),
        img_order = {},
        data = {},
        selected_group = [];

    //chech input
    if($.trim(name) == ''){
        $("#editModal_msg").text("名字必需填入");
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
    data["id"] = question_id;
    data["class_id"] = class_id;
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
            $("#editModal_msg").text("[系統錯誤]<br>無法編輯檔案");
            console.log(e);
        },
        success: function(data){
            //close edit modal
            $('#editModal').modal("hide");

            if(mode == "pending"){
                //remove this question from pending table
                $('#'+ question_id + '_row').remove();
                
                //display no more pending files in this class
                let msg = "<tr><td>所有" + class_item.name + "檔案皆審核完畢</td></tr>";
                if($("#pending_table").find('tr').length == 1){
                    console.log('the last pending files');
                    $("#pending_table").append(msg);
                }

                
                $("#editModal_msg").text("");
                show_msgModal("系統訊息", name +" 審核成功");
            }
            else if(mode == "approved"){
                //set new question info into approvd table
                $('#'+ question_id + '_row').find('td:first-child').html(name);
                $('#'+ question_id + '_row').find('td:nth-child(2)').html(description);

                $("#editModal_msg").text("");
                show_msgModal("系統訊息", name +" 編輯成功");
            }
        }
    });
}

function confirmModal_confirm_btn_handler(cb,args){
    cb(args);
}

function close_confirmModal(){
    $("#confirmModal").modal("hide");
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
}

function show_editModal(event, class_item, mode){
    let $this = $(event.target),
        question_id = $this.attr("question_id");
    console.log("checking: ", question_id);
    
    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=one&class_id=" + class_item.id + "&question_id=" + question_id,
        cache: false,
        contentType: "application/json",
        error: function(e){
            show_msgModal("系統錯誤", "無法取得檔案資訊");
            console.log(e);
        },
        success: function(data){
            let questionData = JSON.parse(data)
            console.log(questionData);

            //set modal content by questionData
            setupEditModal(class_item, questionData, 0);

            //set question_id into delete(confirm) and update btn
            $("#confirmModal_confirm_btn").attr("question_id", question_id);
            $("#editModal_update").attr("question_id", question_id);

            //show edit modal
            $('#editModal').modal("show");
        }
    });
}

function setup_displayModal(group_name, groupMembertList){
    let groupmember_table_str = '';
    groupmember_table_str += '<tr><th width="40%">名字</th><th>敘述</th></tr>';
    groupMembertList.forEach((content) => {
        groupmember_table_str += '\
            <tr>\
                <td><label>' + content.name + '</label></td>\
                <td><label>' + content.description + '</label></td>\
            </tr>';
    });

    $("#displayModal_title").text(group_name);
    $("#displayModal_table").html(groupmember_table_str);
}

function show_displayModal(event){
    let type = $(event.target).parent().parent().find('input').attr('name'),
        display_group_id = $(event.target).parent().parent().find('input').attr('value'),
        display_group_name = $(event.target).parent().parent().find('label').text();

    console.log(type, display_group_id, display_group_name);

    if(type == 'display'){
        //ajax get this groupmember
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroupMember?mode=approved&group_id=" + display_group_id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                show_msgModal("系統錯誤", "無法取得群組資訊");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload)
                console.log(data);

                //set modal content by groupMembertList
                setup_displayModal(display_group_name, data.groupMember_list);

                //show display modal
                $('#displayModal').modal("show");
            }
        });
    }
    else{ //get class default groupmember
        $.ajax({
            type: "GET",
            url: location.origin + "/getQuestion?mode=all&class_id=" + display_group_id + "&status=1",
            cache: false,
            contentType: "application/json",
            error: function(e){
                show_msgModal("系統錯誤", "無法取得群組資訊");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload);
                console.log(data);

                //set modal content by groupMembertList
                setup_displayModal(display_group_name, data.question_list);

                //show display modal
                $('#displayModal').modal("show");
            }
        });
    }
}

