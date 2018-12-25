function render_dropdownlist_div(functiontype, class_list){
    var dropdownlist_str = "";
    class_list.forEach((class_item) => {
        var id = "dropdown-" + functiontype + "-" + class_item.name;
        dropdownlist_str += '\
            <a class="dropdown-item" href="#" id="' + id + '">' + class_item.name + '</a>\
            ';
    });

    return dropdownlist_str;
}

function upload_dropdownlist_handler(class_list){
    class_list.forEach((class_item) => {
        var dropdownlist_id = "#dropdown-upload-" + class_item.name;

        //render_upload_div
        $(dropdownlist_id).on("click", function(){
            $.ajax({
                type: "GET",
                url: location.origin + "/getCategory?mode=all&class_name=" + class_item.name,
                cache: false,
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    category_list = JSON.parse(data);
                    console.log(category_list);
                    
                    $("#display").html(render_upload_div(class_item, render_category_table(category_list)));
                    make_img_movable();
                    add_new_category_btn_handler(class_item, "add_new_category", "category_table");
                    uplaod_btn_handler(class_item);
                }
            });
        });
    });
}

//main
$(function () {
    //navbar-brand info
    $("#navbar-brand").on("click", function(){
        var info = "\
            <h2 class='top center'>猜猜我是誰-上傳頁面</h2>\
            <br>\
            <h3 class='top center'>點選上方標籤<br>上傳你的檔案<br>讓大家一起看見你!</h3>\
            ";
        $("#display").html(info);
    });

    //navbar-upload-btn
    $("#navbar-upload-btn").on("click", function(){
        if($(this).attr("aria-expanded") == "false"){
            //ajax get all classes
            $.ajax({
                type: "GET",
                url: location.origin + "/getClass?mode=all",
                cache: false,
                contentType: "application/json",
                dataType: 'json',
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(class_list){
                    console.log(class_list);

                    $("#dropdown-menu-upload").html(render_dropdownlist_div("upload", class_list));
                    upload_dropdownlist_handler(class_list);
                }
            });
        }
    });
});
