$(function () {
    //list all db
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
    $("#dblist_table").append(dblist_table_str);

    //make db selection only one
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

    //db select confirm button
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
                    alert("設定失敗Q");
                    console.log(e);
                },
                success: function(){
                    alert("設定成功! 請回主頁");
                }
            });
        }
    });

    /********************************************/

    

    /********************************************/

    //list all portraits
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
    $("#namelist_table").append(namelist_table_str);

    //portraits confirm button
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
                    alert("設定失敗Q");
                    console.log(e);
                },
                success: function () {
                    alert("設定成功! 請回主頁");
                }
            });
        }
    });
});
