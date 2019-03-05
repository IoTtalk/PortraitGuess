//main
$(function(){
    $(document).on("click", "#add_new_group", function(event){ show_new_group_edit_row(event, "new_group_name", "add_new_group_row"); });
    $(document).on("click", "#set_new_group", function(event){ exec_add_new_group(class_item, "add_new_group", "new_group_name", "group_table", "add_new_group_row", "group"); });
    $(document).on("click", "#set_new_group_cancel", function(event){ cancel_add_new_group("add_new_group", "add_new_group_row"); });
    $(document).on("submit", "#upload-photos", function(event){ uplaod_btn_handler(event, class_item.id); });

    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=all&class_id=" + class_item.id,
        cache: false,
        contentType: "application/json",
        error: function(e){
            show_msgModal("系統錯誤", "無法進入'上傳檔案'頁面");
            console.log(e);
        },
        success: function(payload){
            data = JSON.parse(payload);
            console.log(data);

            $("#name").prop("placeholder", "ex: " + data.class_item.sample_name);
            $("#description").prop("placeholder", data.class_item.description);
            
            render_group_table(data.group_list);
            make_img_movable();
        }
    });
});

function render_group_table(group_list){
    let group_table_str = '<table class="table table-hover">';
    if(group_list.length < 1){
        group_table_str += "<tr><td class='none'>尚無群組，請點上方新增按鈕</td></tr>"
    }
    else{
        group_list.forEach((group) => {
            let id = group.id,
                name = group.name;
            group_table_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='" + id + "_checkbox' name='group' value='" + id + "' /></td>\
                    <td><label for='" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        });
    }
    group_table_str += "</table>";

    $("#group_table").html(group_table_str);
}

//show movable img
function make_img_movable(){
    $("#upload_file").change(function(){
        //flush old files
        $(".preview_img").remove();

        //Preview upload image
        Array.from(this.files).forEach((file, idx) => {
            let div = $("<div>", {"class": "preview_img col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"});
            div.append($("<img>", {"id": "img" + idx, 
                    "class": "img-thumbnail", 
                    "oriname": file.name}));
            // div.append($("<span>", {"src": "/img/cancel.png", "class": "remove_tag", "text": "✖️"}));
            $("#movable_pic_row").append(div);

            //load image
            let reader = new FileReader();
            reader.onload = function (event) {
                $("#img" + idx).attr("src", event.target.result);
            };
            reader.readAsDataURL(file);
        });
    });
    
    //make image movable
    $( "#movable_pic_row" ).sortable();
    $( "#movable_pic_row" ).disableSelection();
}

//upload btn handler
function uplaod_btn_handler(event, class_id){
    //prevent form auto redirect after submit
    event.preventDefault();

    // Get the data from input, create new FormData.
    let formData = new FormData(),
        files = $('#upload_file').get(0).files,
        name = $('#name').val(),
        description = $('#description').val(),
        img_order = {},
        data = {},
        selected_group = [];

    //chech input
    if($.trim(name) == ''){
        show_msgModal("系統訊息", "請填入名字");
        return false;
    }
    else if(files.length < 1){ //check file input
        show_msgModal("系統訊息", "至少需要上傳 1 張圖片");
        return false;
    }

    let $selected_list = $('input[name=group]:checked');
    $selected_list.each(function(){
        selected_group.push({
            group_id : $(this).val()
        });
        console.log($(this).val());
    });

    //get img order
    $("img").each(function(index){
        img_order[$(this).attr('oriname')] = index + 1;
    });
    console.log(img_order);

    //append data in formData
    data["class_id"] = class_id;
    data["name"] = name;
    data["description"] = description;
    data["img_order"] = img_order;
    data["selected_group"] = selected_group;
    formData.append("user_upload_data", JSON.stringify(data));

    for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(file.name == ".DS_Store"){
            show_msgModal("系統訊息", "無法上傳檔案<br>圖片檔案不支援<br>僅限圖片為: png, jpeg, jpg");
            return false;
        }
        formData.append('photos[]', file, file.name);
    }
    console.log("upload:", data);

    // show progressbar
    $("#my_modal_backdrop").addClass("my_modal_backdrop");
    $("#progressbarModal").addClass("manually-show-modal");

    //ajax
    $.ajax({
        url: '/questionUpload',
        method: 'post',
        data: formData,
        processData: false,
        contentType: false,
    }).done(handleUploadSuccess).fail(function (xhr, status) {
        //close progressbar
        $("#my_modal_backdrop").removeClass("my_modal_backdrop");
        $("#progressbarModal").removeClass("manually-show-modal");
        show_msgModal("系統錯誤", "無法上傳檔案");
    });
}


//upload success handler
function handleUploadSuccess(data){
    let res = JSON.parse(data);
    console.log(res.photo_status);

    //close progressbar
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#progressbarModal").removeClass("manually-show-modal");

    if(res.photo_status){
        //show msgModal with selected_group
        let selected_group = "";
        let $selected_list = $('input[name=group]:checked');
        $selected_list.each(function(){
            console.log($(this).parent().parent().find('label').text());
            selected_group = selected_group + " " + $(this).parent().parent().find('label').text();
        });
        if($selected_list.length > 0){
            show_msgModal("系統訊息", "上傳檔案成功", "加入至群組：" + selected_group);
        }
        else{
            show_msgModal("系統訊息", "上傳檔案成功", "加入至群組：全部");
        }

        // clear all input
        $('#upload_file').val('');
        $('#name').val('');
        $('#description').val('');
        $(".preview_img").remove();
        $('input[name=group]:checked').prop("checked", false);
    }
    else{
        //show msgModal
        show_msgModal("系統訊息", "上傳檔案失敗<br>圖片檔案不支援<br>僅限圖片為: png, jpeg, jpg");
    }
}
