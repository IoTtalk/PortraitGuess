function render_category_table(category_list){
    var category_table_str = '<table class="table table-hover">';
    category_list.forEach((humanCategory_pair) => {
        var humanCategory_id = humanCategory_pair["id"],
            humanCategory_name = humanCategory_pair["name"];
        // console.log(humanCategory_pair["id"]);
        // console.log(humanCategory_pair["name"]);
        category_table_str += "\
            <tr>\
                <td class='mycheckbox'><input type='checkbox' id='" + humanCategory_id + "_checkbox' name='category' value='" + humanCategory_id + "' /></td>\
                <td><label for='" + humanCategory_id + "_checkbox'>" + humanCategory_name + "</label></td>\
            </tr>";
    });
    category_table_str += "</table>";

    return category_table_str;
}

function render_upload_div(category_table_str){
    var upload_div ='\
        <h2 class="center">上傳人物檔案</h2>\
        <br>\
        <form id="upload-photos" method="post" action="/upload_photos" enctype="multipart/form-data">\
            <div class="form-group margin_center">\
                <h3 class="required">輸入人物中文名字</h3>\
                <input type="text" id="chi_name" class="form-control" size="35" placeholder="ex: 伊麗莎白一世"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3 class="required">輸入人物英文名字</h3>\
                <input type="text" id="eng_name" class="form-control" size="35" placeholder="ex: Elizabeth I"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3 class="required">輸入人物出生年份(西元)</h3>\
                <input type="text" id="birth_year" class="form-control" size="35" placeholder="ex: 1533"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3>輸入人物逝世年份(西元)</h3>\
                <input type="text" id="death_year" class="form-control" size="35" placeholder="ex: 1603"/>\
            </div>\
            <div class="form-group margin_center">\
                <h3 class="required">選取資料夾</h3>\
                <p class="help-block">支援檔案格式: jpg, jpeg, png</p>\
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
                    <h3 class="required col-md-10" >選擇分類</h3>\
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

function render_new_category_tablerow(table_id, category_list){
    var newCategoryId = category_list[category_list.length-1]["id"],
        newCategoryName = category_list[category_list.length-1]["name"],
        newCategoryTableRow = "";

    newCategoryTableRow += "\
            <tr>\
                <td class='mycheckbox'><input type='checkbox' id='" + newCategoryId + "_checkbox' name='category' value='" + newCategoryId + "' /></td>\
                <td><label for='" + newCategoryId + "_checkbox'>" + newCategoryName + "</label></td>\
            </tr>";

    // console.log(newCategoryId, newCategoryName);
    if($("#" + table_id).find('tbody').length){
        $("#" + table_id).find('tbody').append(newCategoryTableRow);
    }
    else{
        $("#" + table_id).append(newCategoryTableRow);
    }
}

//new category btn handler
function add_new_category_btn_handler(btnId, tableId,){
    $("#" + btnId).on("click", function(){
        
        var new_category_name = prompt("輸入新分類");
        if($.trim(new_category_name) == ''){
            alert("欄位不得空白");
            return false;
        }
        else{
            //create new category in db
            $.ajax({
                type: "POST",
                url: location.origin + "/addNewHumanCategory",
                cache: false,
                data: JSON.stringify(
                {
                    new_category_name : new_category_name
                }),
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    humanCategory_list = JSON.parse(data);
                    console.log("new ",humanCategory_list);
                    render_new_category_tablerow(tableId, JSON.parse(data));
                    alert(new_category_name + " 新增成功!");
                }
            });
        }
    });
}

//upload success handler
function handleUploadSuccess(photo_status) {
    if(photo_status){
        alert("上傳成功!!\n回首頁");
        location.reload();
    }
    else{
        alert("上傳失敗QQ\n有檔案格式不合!!");
    }
}

//upload btn handler
function uplaod_btn_handler(){
    $('#upload-photos').on('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        // Get the data from input, create new FormData.
        var formData = new FormData(),
            files = $('#upload_file').get(0).files,
            chi_name = $('#chi_name').val(),
            eng_name = $('#eng_name').val(),
            birth_year = $('#birth_year').val(),
            death_year = $('#death_year').val(),
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
        else if(files.length < 6){ //check file input
            alert('至少需要上傳 6 張圖片');
            return false;
        }

        var $selected_list = $('input[name=category]:checked');
        if($selected_list.length < 1){
            alert('至少選取 1 個人物分類');
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
        data["img_order"] = img_order;
        data["selected_category"] = selected_category;
        data["chi_name"] = chi_name;
        data["eng_name"] = eng_name;
        data["birth_year"] = birth_year;
        data["death_year"] = death_year;
        formData.append("user_upload_data", JSON.stringify(data));

        for(var i = 0; i < files.length; i++){
            var file;
            file = files[i];
            formData.append('photos[]', file, file.name);
        }

        //ajax
        $.ajax({
            url: '/humanUpload',
            method: 'post',
            data: formData,
            processData: false,
            contentType: false,
        }).done(handleUploadSuccess).fail(function (xhr, status) {
            alert(status);
        });
    });
}
