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

    //render_upload_div
    $("#dropdown-human-upload").on("click", function(){
        $.ajax({
            type: "POST",
            url: location.origin + "/getHumanCategory",
            cache: false,
            contentType: "application/json",
            dataType: 'json',
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(humanCategory_list){
                console.log(humanCategory_list);
                
                $("#display").html(render_upload_div(render_category_table(humanCategory_list)));
                make_img_movable();
                add_new_category_btn_handler("add_new_category", "category_table");
                uplaod_btn_handler();
            }
        });
    });
});
