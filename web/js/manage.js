$(function () {
    //select_div
    function render_select_div(dbList){
        var dblist_table_str = "<table>";
        dbList.forEach((name) => {
            dblist_table_str += "\
                <tr>\
                    <td width='50%' class='mycheckbox'>\
                        <input type='checkbox' id='" + name + "_checkbox' name='db' value='" + name + "' />\
                    </td>\
                    <td width='50%'>\
                        <label for='" + name + "_checkbox'>" + name + "</label>\
                    </td>\
                </tr>";
        });
        dblist_table_str += "</table>";

        var select_div = '\
            <h2 class="center top">選取名單</h2>\
            <div id="dblist_table">' + dblist_table_str + '</div>\
            <div class="center bottom">\
                <button id="select_db_btn" class="btn btn-success">確認</button>\
            </div>';

        return select_div;
    }

    //upload_div
    //TODO
    //change this upload function to ajax
    var myURL = location.origin + "/upload";
    var upload_div ='\
        <div id="upload" class="center display">\
            <h2>上傳檔案(資料夾)</h2>\
            <h3 class="warning">For now only supports Google Chrome browser</h3>\
            <form ref="uploadForm"\
                  id="uploadForm"\
                  action=' + myURL + '\
                  method="post"\
                  encType="multipart/form-data">\
                <h3>輸入名字</h3>\
                <input type="text" name="dirName" size="35" placeholder="伊麗莎白一世,Elizabeth I,1533-1603" />\
                <h3>選取資料夾</h3>\
                <input type="file" name="images" id="fileInput"  webkitdirectory class="center" />\
                <h3>上傳</h3>\
                <input class="btn btn-warning" type="submit" value="Upload!" />\
            </form>\
        </div>';

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
                <h2 class="center">請勾選想要顯示的人像(至少5位)</h2>\
                <div id="namelist_table">' + namelist_table_str + '</div>\
                <div class="center bottom">\
                    <button id="select_portrait_btn" class="btn btn-info">確認</button>\
                </div>\
            </div>';

        return create_div;
    }

    //make db selection only one
    function create_checkbox_handler(){
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
                        alert("Set successfully! Back to Home Page");
                        location.reload();
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
                        alert("Set successfully! Back to Home Page");
                        location.reload();
                    }
                });
            }
        });
    }

    //navbar brand
    $(".navbar-brand").on("click", function(){
        var defaultt = "<h2 class='center top'>請點選上方功能列表</h2>";
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
                }
            });

            $('#display').html(render_select_div(dbList));
            create_checkbox_handler();
            select_btn_handler();
        }
        else if(target_div == "upload"){
            $('#display').html(upload_div);
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
                }
            });

            $('#display').html(render_create_div(nameList));
            create_checkbox_handler();
            create_btn_handler();
        }
        //console.log(target_div);
    });
});
