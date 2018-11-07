$(function () {
    //select_div
    function render_select_div(dbList, usingDB){
        console.log("now usingDB: " + usingDB);
        
        var dblist_table_str = "<table class='table table-hover'>";
        dbList.forEach((name) => {
            if(usingDB == name){
                dblist_table_str += "\
                    <tr>\
                        <td class='mycheckbox'>\
                            <input type='checkbox' id='" + name + "_checkbox' name='db' value='" + name + "' />\
                        </td>\
                        <td>\
                            <label for='" + name + "_checkbox'>" + name + "<span class='warning'> (使用中) </span></label>\
                        </td>\
                    </tr>";
            }
            else{
                dblist_table_str += "\
                    <tr>\
                        <td class='mycheckbox'>\
                            <input type='checkbox' id='" + name + "_checkbox' name='db' value='" + name + "' />\
                        </td>\
                        <td>\
                            <label for='" + name + "_checkbox'>" + name + "</label>\
                        </td>\
                    </tr>";
            }
        });
        dblist_table_str += "</table>";

        var select_div = '\
            <h2 class="center top">選取名單</h2>\
            <br>\
            <h3 class="center">請勾選欲播放的人物清單</h3>\
            <br>\
            <div id="dblist_table" class="table_border overflow">' + dblist_table_str + '</div>\
            <br>\
            <div class="center bottom">\
                <button id="select_db_btn" class="btn btn-primary">確認</button>\
            </div>';

        return select_div;
    }

    //upload_div
    function render_upload_div(dbList){
        var dbList_option_str = "<option value='0'> --- </option>";
        dbList.forEach((name) => {
            dbList_option_str += "<option value='" + name + "'>" + name + "</option>";
        });

        var upload_div ='\
            <div id="upload" class="display">\
                <h2 class="center">上傳檔案</h2>\
                <br>\
                <form id="upload-photos" method="post" action="/upload_photos" enctype="multipart/form-data">\
                    <div class="form-group">\
                        <h3>輸入人物中文名字</h3>\
                        <input type="text" id="chiName" class="form-control" size="35" placeholder="ex: 伊麗莎白一世" required/>\
                    </div>\
                    <div class="form-group">\
                        <h3>輸入人物英文名字</h3>\
                        <input type="text" id="engName" class="form-control" size="35" placeholder="ex: Elizabeth I" required/>\
                    </div>\
                    <div class="form-group">\
                        <h3>輸入人物出生年份(西元)</h3>\
                        <input type="text" id="birth" class="form-control" size="35" placeholder="ex: 1533" required/>\
                    </div>\
                    <div class="form-group">\
                        <h3>輸入人物逝世年份(西元)</h3>\
                        <p class="help-block">選填</p>\
                        <input type="text" id="die" class="form-control" size="35" placeholder="ex: 1603"/>\
                    </div>\
                    <div class="form-group">\
                        <h3>選取資料夾</h3>\
                        <p class="help-block">資料夾內檔案請依照數字序號或英文字母命名</p>\
                        <p class="help-block">ex: a.jpg b.jpg c.jpg ...</p>\
                        <p class="help-block">ex: 1.jpg 2.jpg 3.jpg ...</p>\
                        <input class="center" id="photos-input" type="file" name="photos[]" multiple="multiple" webkitdirectory>\
                        <input type="hidden" name="csrf_token" value="just_a_text_field" />\
                    </div>\
                    <!-- <div class="form-group">\
                        <h3>添加至已建立名單</h3>\
                        <select class="form-control" id="selector">\
                            '+ dbList_option_str + '\
                        </select>\
                    </div> -->\
                    <div class="form-group center">\
                        <input class="btn btn-warning" type="submit" name="Photo Uploads" value="上傳" />\
                    </div>\
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
            //alert(info);
            //alert("Set successfully!");
            alert("上傳成功!!");
        } else {
            //alert('No images were uploaded.');
            alert("上傳失敗QQ");
        }
    }

    function moveToNewFilename(filename, newFname){
        var tmp,
            fname = "";

        //split filename to name and ext
        tmp = filename.split(".");
        if(tmp.length != 2){
            return "wrong";
        }

        //not single character
        fname = tmp[0];
        if(fname.length != 1){
            return "wrong";
        }

        if("A" <= fname && fname <= "Z"){
            console.log(filename,"get newFname:", String(newFname), ".", tmp[1]);
            return String(newFname) + "." + tmp[1];
        }
        else if("a" <= fname && fname <= "z"){
            console.log(filename,"get newFname:", String(newFname), ".", tmp[1]);
            return String(newFname) + "." + tmp[1];
        }
        else if("1" <= fname && fname <= "9"){
            console.log(filename,"get newFname:", String(newFname), ".", tmp[1]);
            return String(newFname) + "." + tmp[1];
        }
        else{
            return "wrong";
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
                chiName = $('#chiName').val(),
                engName = $('#engName').val(),
                birth = $('#birth').val(),
                die = $('#die').val(),
                targetDB = $('#selector').val(),
                dirName = "";

            //chech input
            if($.trim(chiName) == '' || $.trim(engName) == '' || $.trim(birth) == ''){
                //alert('Input can not be blank');
                alert("欄位不得空白");
                return false;
            }

            if (files.length < 6) {
                //alert('Select at least 6 files to upload.');
                alert('至少需要上傳 6 張圖片');
                return false;
            }

            // Add dirName to the formData
            dirName = chiName + "," + engName + "," + birth + "-" + die;
            console.log(dirName);
            formData.append("dirName", dirName);

            // Append the files to the formData.
            myArray = Array.from(files);
            console.log(myArray);
            myArray = myArray.sort(function(a,b) {
                return a.name > b.name ? 1 : -1;
            });
            console.log(myArray);

            for(var i = 0; i < myArray.length; i++){
                var file,newfilename;

                file = myArray[i];
                newfilename = moveToNewFilename(file.name, i+1);
                if(newfilename == "wrong"){
                    alert("有檔名錯誤!!");
                    return false;
                }
                formData.append('photos[]', file, newfilename);
            }

            // Append target painting_db to the formData
            console.log(targetDB);
            formData.append("targetDB", targetDB);

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
        var namelist_table_str = "<table class='table table-hover'";
        nameList.forEach((name) => {
            namelist_table_str += "\
                <tr>\
                    <td class='mycheckbox'>\
                        <input  type='checkbox' id='" + name + "_checkbox' name='portrait' value='" + name + "' />\
                    </td>\
                    <td>\
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
    function select_btn_handler(dbList){
        $("#select_db_btn").on("click", function(){
            var $selected_db = $('input[name=db]:checked');
            if($selected_db.length != 1){
                alert("請勾選想要的人物名單");
            }
            else{
                var selected_db;
                $selected_db.each(function (){
                    selected_db = $(this).val();
                });
                
                usingDB = selected_db;
                console.log("update usingDB: " + usingDB);

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
                        alert("選取名單成功!!");
                        //update usingDB red span words
                        $('#display').html(render_select_div(dbList, selected_db));
                        select_btn_handler(dbList);
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
                //alert("at least 6 person!!");
                alert('至少需要選取 6 位人物');
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
                        alert("建立名單成功!!");
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
            <h3 class='center'>For now only supports Google Chrome browser</h3>\
            <br>\
            <ul class='margin_left'>\
                <li><h3>上傳檔案</h3></li>\
                    <ul>\
                        <li><h4>上傳新人物畫像</h4></li>\
                    </ul>\
                <li><h3>建立播放名單</h3></li>\
                    <ul>\
                        <li><h4>選取人物並建立人物播放名單</h4></li>\
                    </ul>\
                <li><h3>選取播放名單</h3></li>\
                    <ul>\
                        <li><h4>選取已建立的人物播放名單</h4></li>\
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
                    usingDB = data.usingDB;
                    console.log(usingDB);
                    $('#display').html(render_select_div(dbList, usingDB));
                    checkbox_onlyone_handler();
                    select_btn_handler(dbList);
                }
            });
        }
        else if(target_div == "upload"){
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
                    $('#display').html(render_upload_div(dbList));
                    upload_btn_handler();
                }
            });
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
