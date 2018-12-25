function render_category_table(category_list){
    var category_table_str = '<table class="table table-hover">';

    if(category_list.length < 1){
        category_table_str += "<tr><td class='none'>尚無分類，請點選由上方來新增</td></tr>"
    }
    else{
        category_list.forEach((category) => {
            var id = category.id,
                name = category.name;

            category_table_str += "\
                <tr>\
                    <td class='mycheckbox'><input type='checkbox' id='" + id + "_checkbox' name='category' value='" + id + "' /></td>\
                    <td><label for='" + id + "_checkbox'>" + name + "</label></td>\
                </tr>";
        });
    }

    category_table_str += "</table>";

    return category_table_str;
}

function render_upload_div(class_item, category_table_str){
    var upload_div ='\
        <h2 class="center">上傳' + class_item.name + '檔案</h2>\
        <br>\
        <form id="upload-photos" method="post" action="/upload_photos" enctype="multipart/form-data">\
            <div class="form-group margin_center">\
                <h3 class="required">輸入' + class_item.name + '名字</h3>\
                <input type="text" id="name" class="form-control" size="35" placeholder="ex: ' + class_item.sample_name + '"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3>輸入' + class_item.name + '描述</h3>\
                <textarea class="form-control" id="description" placeholder="' + class_item.description + '"></textarea>\
            </div>\
            <div class="form-group margin_center">\
                <h3 class="required">選取資料夾</h3>\
                <p class="help-block">拉動圖片以排序(由左至右，由上至下)</p>\
                <input id="upload_file" type="file" name="photos[]" accept="image/*" multiple="multiple" webkitdirectory/>\
            </div>\
            <div class="form-group">\
                <div name="form0" id="form0" >\
                    <div class="row" id="row"></div>\
                </div>\
            </div>\
            <div class="form-group margin_center">\
                <div class="row">\
                    <h3 class="col-md-10 required" >選擇' + class_item.name + '分類</h3>\
                    <div class="col-md-2"><input type="button" value="新增" id="add_new_category" class="btn btn-secondary"></div>\
                </div>\
                <div id="category_table" class="category_table">\
                    ' + category_table_str + '\
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

function render_new_category_tablerow(table_id, new_category_item){
    var new_id = new_category_item.id,
        new_name = new_category_item.name,
        newCategoryTableRow = "";

    console.log(new_id, new_name);
    newCategoryTableRow += "\
        <tr>\
            <td class='mycheckbox'><input type='checkbox' id='" + new_id + "_checkbox' name='category' value='" + new_id + "' /></td>\
            <td><label for='" + new_id + "_checkbox'>" + new_name + "</label></td>\
        </tr>";

    // console.log(newCategoryId, newCategoryName);

    //check if tbody is existed
    var $table_id = "#" + table_id;
    if($($table_id).find('tbody').length){
        //check this is the first category for this new class
        if($($table_id).find('tr').length == 1){
            //it is the first category
            if($($table_id).find('td').hasClass('none')){
                console.log("this is first category");
                console.log("should special deal with the IU");
                //first time adding category should clear table row
                $($table_id).find('tbody').html(newCategoryTableRow);
            }
            else{
                $($table_id).find('tbody').append(newCategoryTableRow);
            }
        }
        else{
            $($table_id).find('tbody').append(newCategoryTableRow);
        }
    }
    else{
        if($($table_id).find('tr').length == 1){
            //it is the first category
            if($($table_id).find('td').hasClass('none')){
                console.log("this is first category");
                console.log("should special deal with the IU");
                //first time adding category should clear table row
                $($table_id).html(newCategoryTableRow);
            }
            else{
                $($table_id).append(newCategoryTableRow);
            }
        }
        else{
            $($table_id).append(newCategoryTableRow);
        }
    }
}

//new category btn handler
function add_new_category_btn_handler(class_item, btnId, tableId){
    $("#" + btnId).on("click", function(){
        
        var new_category_name = prompt("輸入新分類");
        console.log(new_category_name);
        if(new_category_name == null || $.trim(new_category_name) == ''){
            alert("欄位不得空白");
            return false;
        }
        else if($('#' + tableId + ' label:contains("' + new_category_name + '")').length){
            alert("分類名稱不得重複");
            return false;
        }
        else{
            //create new category in db
            $.ajax({
                type: "POST",
                url: location.origin + "/addNewCategory",
                cache: false,
                data: JSON.stringify(
                {
                    class_id : class_item.id,
                    class_name : class_item.name,
                    new_category_name : new_category_name
                }),
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var new_category_item = JSON.parse(data);
                    console.log("add: ", new_category_item);

                    render_new_category_tablerow(tableId, new_category_item);
                    alert(new_category_name + " 新增成功!");
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
        $('input[name=category]:checked').prop("checked", false);
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
            selected_category = [];

        //chech input
        if($.trim(name) == ''){
            alert("請填入名字");
            return false;
        }
        else if(files.length < 6){ //check file input
            alert('至少需要上傳 6 張圖片');
            return false;
        }

        var $selected_list = $('input[name=category]:checked');
        if($selected_list.length < 1){
            alert('至少選取 1 個分類');
            return false;
        }
        else{
            $selected_list.each(function (){
                selected_category.push({
                    category_id : $(this).val()
                });
                // console.log($(this).val());
            });
        }

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
        data["selected_category"] = selected_category;
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
