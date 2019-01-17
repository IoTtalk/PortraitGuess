function render_group_table(group_list){
    var group_table_str = '<table class="table table-hover">';

    if(group_list.length < 1){
        group_table_str += "<tr><td class='none'>尚無群組，請點上方新增按鈕</td></tr>"
    }
    else{
        group_list.forEach((group) => {
            var id = group.id,
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
    var upload_div ='\
        <h2 class="center">上傳檔案</h2>\
        <br>\
        <form id="upload-photos" method="post" action="/upload_photos" enctype="multipart/form-data">\
            <div class="form-group margin_center">\
                <h3 class="required">名字</h3>\
                <input type="text" id="name" class="form-control" size="35" placeholder="ex: ' + class_item.sample_name + '"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3>描述</h3>\
                <textarea class="form-control" id="description" placeholder="' + class_item.description + '"></textarea>\
            </div>\
            <div class="form-group margin_center">\
                <h3 class="required">上傳資料夾</h3>\
                <p class="help-block">可拉動圖片以排序(由左至右，由上至下)</p>\
                <input id="upload_file" type="file" name="photos[]" accept="image/*" multiple="multiple" webkitdirectory/>\
            </div>\
            <div class="form-group">\
                <div name="form0" id="form0" >\
                    <div class="row" id="row"></div>\
                </div>\
            </div>\
            <div class="form-group margin_center">\
                <div class="row">\
                    <h3 class="col-md-10" >選擇群組</h3>\
                    <div class="col-md-2"><input type="button" value="新增" id="add_new_group" class="btn btn-secondary"></div>\
                </div>\
                <div id="group_table" class="group_table">\
                    ' + group_table_str + '\
                </div>\
            </div>\
            <div class="form-group center">\
                <input class="btn btn-warning" type="submit" value="上傳" />\
            </div>\
            <br>\
        </form>\
        ';
    return upload_div;
}

//show movable img
function make_img_movable(){
    //Preview upload image
    $("#upload_file").change(function(){
        Array.from(this.files).forEach((file, idx) => {
            let div = $("<div>", {"class": "col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"});
            div.append($("<img>", {
                "id": "img" + idx, 
                "class": "img-thumbnail", 
                "oriname": file.name}));
            $("#row").append(div);

            //load image
            let reader = new FileReader();
            reader.onload = function (event) {
                $("#img" + idx).attr("src", event.target.result);
            };
            reader.readAsDataURL(file);
        });
    });
    
    //make image moable
    $( "#row" ).sortable();
    $( "#row" ).disableSelection();
}

function render_new_group_tablerow(table_id, new_group_item){
    var new_id = new_group_item.id,
        new_name = new_group_item.name,
        newGroupTableRow = "";

    console.log(new_id, new_name);
    newGroupTableRow += "\
        <tr>\
            <td class='mycheckbox'><input type='checkbox' id='" + new_id + "_checkbox' name='group' value='" + new_id + "' /></td>\
            <td><label for='" + new_id + "_checkbox'>" + new_name + "</label></td>\
        </tr>";

    // console.log(newGroupId, newGroupName);

    //check if tbody is existed
    var $table_id = "#" + table_id;
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
function add_new_group_btn_handler(class_item, btnId, tableId){
    $("#" + btnId).on("click", function(){
        
        var new_group_name = prompt("輸入新群組名字");
        console.log(new_group_name);
        if(new_group_name == null || $.trim(new_group_name) == ''){
            alert("欄位不得空白");
            return false;
        }
        else if($('#' + tableId + ' label:contains("' + new_group_name + '")').length){
            alert("群組名稱不得重複");
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
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var new_group_item = JSON.parse(data);
                    console.log("add: ", new_group_item);

                    render_new_group_tablerow(tableId, new_group_item);
                    alert(new_group_name + " 新增成功!");
                }
            });
        }
    });
}

//upload success handler
function handleUploadSuccess(data){
    var res = JSON.parse(data);
    console.log(res.photo_status);

    if(res.photo_status){
        alert("上傳成功!!\n");

        // clear all input
        $('#upload_file').val('');
        $('#name').val('');
        $('#description').val('');
        $('#row').html('');
        $('input[name=group]:checked').prop("checked", false);
    }
    else{
        alert("上傳失敗\n圖片檔案不支援!!\n僅限圖片為: png, jpeg, jpg");
    }
}

//upload btn handler
function uplaod_btn_handler(class_item){
    $('#upload-photos').on('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        // Get the data from input, create new FormData.
        var formData = new FormData(),
            files = $('#upload_file').get(0).files,
            name = $('#name').val(),
            description = $('#description').val(),
            img_order = {},
            data = {},
            selected_group = [];

        //chech input
        if($.trim(name) == ''){
            alert("請填入名字");
            return false;
        }
        else if(files.length < 6){ //check file input
            alert('至少需要上傳 6 張圖片');
            return false;
        }

        var $selected_list = $('input[name=group]:checked');
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

        for(var i = 0; i < files.length; i++){
            var file;
            file = files[i];

            if(file.name == ".DS_Store"){
                alert("上傳失敗\n資料夾內有檔案格式不合!!\n請檢查是否有隱藏檔案");
                return false;
            }

            formData.append('photos[]', file, file.name);
        }

        console.log("upload:", data);

        //ajax
        $.ajax({
            url: '/questionUpload',
            method: 'post',
            data: formData,
            processData: false,
            contentType: false,
        }).done(handleUploadSuccess).fail(function (xhr, status) {
            alert(status);
        });
    });
}
