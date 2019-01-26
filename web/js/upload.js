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

    return group_table_str;
}

function render_upload_div(class_item, group_table_str){
    let upload_div ='\
        <h2 class="center">上傳檔案</h2>\
        <br>\
        <form id="upload-photos" class="row" method="post" action="/upload_photos" enctype="multipart/form-data">\
            <div class="col-md-6">\
                <div class="form-group ">\
                    <h3 class="required">名字</h3>\
                    <input type="text" id="name" class="form-control" size="35" placeholder="ex: ' + class_item.sample_name + '"/>\
                </div>\
                <div class="form-group ">\
                    <h3>描述</h3>\
                    <textarea class="form-control" id="description" rows="4" placeholder="' + class_item.description + '"></textarea>\
                </div>\
            </div>\
            <div class="col-md-6">\
                <div class="form-group ">\
                    <div class="row">\
                        <h3 style="width: 60%">選擇群組</h3>\
                        <input type="button" id="add_new_group" class="btn btn-secondary" value="新增群組">\
                    </div>\
                    <div id="add_new_group_row" class="row" style="display: none;">\
                        <input id="new_group_name" class="form-control" type="text" style="width: 50%" placeholder="新群組名字">\
                        <input id="set_new_group" type="button" class="btn btn-outline-success" value="確定">\
                        <input id="set_new_group_cancel" type="button" class="btn btn-outline-danger" value="取消">\
                    </div>\
                    <div id="group_table" class="group_table">\
                        ' + group_table_str + '\
                    </div>\
                </div>\
            </div>\
            <div class="col-md-12">\
                <div class="form-group ">\
                        <h3 class="required">上傳圖片</h3>\
                        <p class="help-block">拉動圖片來排序(由左至右，由上至下)</p>\
                        <input id="upload_file" type="file" name="photos[]" accept=".png,.jpg,.jpeg" multiple="multiple"/>\
                </div>\
                <div id="pic_row" >\
                    <div class="row" id="movable_pic_row"></div>\
                </div>\
                <div class="form-group center">\
                    <input class="btn btn-warning" type="submit" value="上傳"/>\
                </div>\
            </div>\
        </form>\
        ';
    return upload_div;
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

//new group btn handler
function add_new_group_btn_handler(btnId, nameId, rowId){
    $("#" + btnId).unbind("click");
    $("#" + btnId).on("click", function(){
        //show input text
        $("#" + rowId).show();
        $("#" + btnId).hide();
        $("#" + nameId).val("");
    });
}

function set_new_group_btn_handler(class_item, btnId, setbtnId, nameId, tableId, rowId, checkboxname){
    $("#" + setbtnId).unbind("click");
    $("#" + setbtnId).on("click", function(){
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
    });
}

function set_new_group_cancel_btn_handler(btnId, cancelbtnId, rowId){
    $("#" + cancelbtnId).unbind("click");
    $("#" + cancelbtnId).on("click", function(){
        $("#" + rowId).hide();
        $("#" + btnId).show();
    });
}

//upload success handler
function handleUploadSuccess(data){
    let res = JSON.parse(data);
    console.log(res.photo_status);

    //close progressbar
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#progressbarModal").removeClass("manually-show-modal");

    if(res.photo_status){;
        //show msgModal
        show_msgModal("系統訊息", "上傳檔案成功");

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

//upload btn handler
function uplaod_btn_handler(class_item){
    $('#upload-photos').on('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log("show");

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
            //show msgModal
            show_msgModal("系統訊息", "請填入名字");
            return false;
        }
        else if(files.length < 1){ //check file input
            //show msgModal
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
        // console.log(img_order);

        //append data in formData
        data["class_id"] = class_item.id;
        data["name"] = name;
        data["description"] = description;
        data["img_order"] = img_order;
        data["selected_group"] = selected_group;
        formData.append("user_upload_data", JSON.stringify(data));

        for(let i = 0; i < files.length; i++){
            let file = files[i];
            if(file.name == ".DS_Store"){
                //show msgModal
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
            
            //show msgModal
            show_msgModal("系統錯誤", "無法上傳檔案");
        });
    });
}
