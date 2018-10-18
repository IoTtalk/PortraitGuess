$(function () {
    //select_div
    function render_select_div(dbList){
        var dblist_table_str = "<table>";
        dbList.forEach((name) => {
            dblist_table_str += "\
                <tr>\
                    <td width='20%' class='mycheckbox'>\
                        <input type='checkbox' id='" + name + "_checkbox' name='db' value='" + name + "' />\
                    </td>\
                    <td width='80%'>\
                        <label for='" + name + "_checkbox'>" + name + "</label>\
                    </td>\
                </tr>";
        });
        dblist_table_str += "</table>";

        var select_div = '\
            <h2 class="center top">選取名單</h2>\
            <br>\
            <div id="dblist_table" class="table_border overflow">' + dblist_table_str + '</div>\
            <br>\
            <div class="center bottom">\
                <button id="select_db_btn" class="btn btn-primary">確認</button>\
            </div>';

        return select_div;
    }

    //upload_div
    function render_upload_div(){
        var upload_div ='\
            <div id="upload" class="center display">\
                <h2>上傳檔案</h2>\
                <h3 class="warning">For now only supports Google Chrome browser</h3>\
                <form id="upload-photos" method="post" action="/upload_photos" enctype="multipart/form-data">\
                    <h3>輸入名字</h3>\
                    <input type="text" id="dirName" size="35" placeholder="伊麗莎白一世,Elizabeth I,1533-1603" />\
                    <h3>選取資料夾(檔案請依照數字序號命名)</h3>\
                    <input class="center" id="photos-input" type="file" name="photos[]" multiple="multiple" webkitdirectory>\
                    <input type="hidden" name="csrf_token" value="just_a_text_field" />\
                    <br>\
                    <input class="btn btn-warning" type="submit" name="Photo Uploads" value="上傳" />\
                </form>\
            </div>';
        return upload_div;
    }

    function handleSuccess(data) {
        if (data.length > 0) {
            var info = '';
            for (var i=0; i < data.length; i++) {
                var img = data[i];
                if (img.status) {
                    info = info + "[ " + img.filename + " ] uploads success !\n";
                }
                else {
                    info = info + "[ " + img.filename + " ] uploads fail QQ\n";
                }
            }
            alert(info);
            alert("Set successfully!");
        } else {
            alert('No images were uploaded.');
        }
    }

    //upload confirm button
    function upload_btn_handler(){
        // On form submit, handle the file uploads.
        $('#upload-photos').on('submit', function (event) {
            event.preventDefault();

            // Get the files from input, create new FormData.
            var files = $('#photos-input').get(0).files,
                formData = new FormData(),
                dirName = $('#dirName').val();

            if (files.length === 0) {
                alert('Select at least 1 file to upload.');
                return false;
            }

            if (files.length < 6) {
                alert('Select at least 6 files to upload.');
                return false;
            }

            // Add dirName to the formData
            console.log(dirName);
            formData.append("dirName", dirName);

            // Append the files to the formData.
            for (var i=0; i < files.length; i++) {
                var file = files[i];
                formData.append('photos[]', file, file.name);
            }

            // Note: We are only appending the file inputs to the FormData.
            $.ajax({
                url: '/upload',
                method: 'post',
                data: formData,
                processData: false,
                contentType: false,
            }).done(handleSuccess).fail(function (xhr, status) {
                alert(status);
            });
        });
    }

    //create_div
    function render_create_div(nameList){
        var namelist_table_str = "<table>";
        nameList.forEach((name) => {
            namelist_table_str += "\
                <tr>\
                    <td width='20%' class='mycheckbox'>\
                        <input type='checkbox' id='" + name + "_checkbox' name='portrait' value='" + name + "' />\
                    </td>\
                    <td width='80%'>\
                        <label for='" + name + "_checkbox'>" + name + "</label>\
                    </td>\
                </tr>";
        });
        namelist_table_str += "</table>";

        var create_div = '\
            <div id="create" class="display">\
                <h2 class="center top">建立名單</h2>\
                <br>\
                <h3 class="center">請勾選想要顯示的人像(至少6位)</h3>\
                <br>\
                <div class="center">\
                    <button id="select_all_portrait_btn" class="btn btn-default">全選</button>\
                    <button id="select_clear_portrait_btn" class="btn btn-default">全不選</button>\
                </div>\
                <div id="namelist_table" class="overflow table_border">' + namelist_table_str + '</div>\
                <br>\
                <div class="center bottom">\
                    <button id="select_portrait_btn" class="btn btn-primary">確認</button>\
                </div>\
            </div>';

        return create_div;
    }

    //make db selection only one
    function checkbox_onlyone_handler(){
        $("input:checkbox[name='db']").on('click', function(){
            var $box = $(this);
            if($box.is(":checked")){
                var group = "input:checkbox[name='db']";
                $(group).prop("checked", false);
                $box.prop("checked", true);
            }
            else{
                $box.prop("checked", false);
            }
        });
    }

    //make protrait selection all or none
    function checkbox_all_or_clear_handler(){
        //TODO
        $('#select_all_portrait_btn').on('click',function(){
            $("input:checkbox[name='portrait']").prop("checked", true);
        });

        $('#select_clear_portrait_btn').on('click',function(){
            $("input:checkbox[name='portrait']").prop("checked", false);
        });
    }

    //db select confirm button
    function select_btn_handler(){
        $("#select_db_btn").on("click", function(){
            var $selected_db = $('input[name=db]:checked');
            if($selected_db.length != 1){
                alert("something wrong QQ");
            }
            else{
                var selected_db;
                $selected_db.each(function (){
                    selected_db = $(this).val();
                });
                
                console.log(selected_db);

                $.ajax({
                    type: "POST",
                    url: location.origin + "/loadDB",
                    cache: false,
                    data: JSON.stringify(
                    {
                        selected_db : selected_db
                    }),
                    contentType: "application/json",
                    error: function(e){
                        alert("something wrong");
                        console.log(e);
                    },
                    success: function(){
                        alert("Set successfully!");
                    }
                });
            }
        });
    }

    //portraits confirm button
    function create_btn_handler(){
        $("#select_portrait_btn").on("click", function(){
            var $selected_portrait_list = $('input[name=portrait]:checked');
            if($selected_portrait_list.length <= 5){
                alert("at least 6 person!!");
            }
            else{
                var selected = [];
                $selected_portrait_list.each(function (){
                    selected.push($(this).val());
                    //console.log($(this).val());
                });

                var regx = /^[A-Za-z0-9]+$/;
                do {
                    var selected_list_name = prompt("請為這次的名單命名(僅限英文數字)");
                } while(!regx.test(selected_list_name));

                console.log(selected_list_name, selected);

                $.ajax({
                    type: "POST",
                    url: location.origin + "/createDB",
                    cache: false,
                    data: JSON.stringify(
                    {
                        selected_list_name : selected_list_name, 
                        selected_portrait  : selected
                    }),
                    contentType: "application/json",
                    error: function(e) {
                        alert("something wrong");
                        console.log(e);
                    },
                    success: function () {
                        alert("Set successfully!");
                    }
                });
            }
        });
    }

    //navbar brand
    $(".navbar-brand").on("click", function(){
        var defaultt = "\
            <h2 class='top center'>管理頁面首頁</h2>\
            <br>\
            <ul class='margin_left'>\
                <li><h3>上傳檔案</h3></li>\
                    <ul>\
                        <li><h4>上傳新人物畫像</h4></li>\
                    </ul>\
                <li><h3>建立名單</h3></li>\
                    <ul>\
                        <li><h4>選取特定人物 並 建立人物畫像名單</h4></li>\
                    </ul>\
                <li><h3>選取名單</h3></li>\
                    <ul>\
                        <li><h4>選取已建立的人物畫像名單</h4></li>\
                    </ul>\
            </ul>";
        $("#display").html(defaultt);
    });

    //navbar
    $("nav li").on("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        var target_div = $(this).children('a').attr('at');
        if(target_div == "select"){
            $.ajax({
                type: "POST",
                url: location.origin + "/getAllDB",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e) {
                    alert("something wrong");
                    console.log(e);
                },
                success: function (data) {
                    dbList = data.dbList;
                    $('#display').html(render_select_div(dbList));
                    checkbox_onlyone_handler();
                    select_btn_handler();
                }
            });
        }
        else if(target_div == "upload"){
            $('#display').html(render_upload_div());
            upload_btn_handler();
        }
        else if(target_div == "create"){
            $.ajax({
                type: "POST",
                url: location.origin + "/getAllPortrait",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e) {
                    alert("something wrong");
                    console.log(e);
                },
                success: function (data) {
                    nameList = data.portraitList;
                    $('#display').html(render_create_div(nameList));
                    checkbox_all_or_clear_handler();
                    create_btn_handler();
                }
            });
        }
        //console.log(target_div);
    });
});
