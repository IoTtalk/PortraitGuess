//main
$(function (){
    // use these class_list to render homepage DOM <a>
    console.log("class_list:", class_list);

    //navbar brand
    $(".navbar-brand").on("click", function(){
        location.reload();
    });

    //render homepage list link
    render_homepage_list_link();

    //bind all homepage_link
    $(".homepage_link").on('click', function(){
        let args = $(this).attr('value'),
            dic = {};
        console.log(args);
        args.split('&').forEach((data) => {
            data = data.split('=');
            dic[data[0]] = data[1];
        });
        if (dic.type == 'upload') {
            if (dic.id) {
                console.log('upload id:', dic.id);
                if(dic.id != "new"){
                    $("#navbar").show();
                    $("#navbar-upload-btn").parent().addClass('active').siblings().removeClass('active');
                }
                show_class_upload_management(dic.id);
            }
        }
    });
});

function render_homepage_list_link(){
    //for upload
    let homepage_upload_list_str = "";
    class_list.forEach((class_item)=>{
        homepage_upload_list_str += '\
            <a href="#" class="list-group-item list-group-item-action homepage_link" \
            value="type=upload&id=' + class_item.id + '">' + class_item.name + '</a>';
    });
    $("#homepage_upload_link").html(homepage_upload_list_str);
}

function show_class_upload_management(class_id) {
    if(class_id != "new"){
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroup?mode=all&class_id=" + class_id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                //show msgModal
                show_msgModal("系統錯誤", "無法進入'上傳檔案'頁面");

                console.log(e);
            },
            success: function(payload){
                data = JSON.parse(payload);
                console.log(data);
                
                $("#display").html(render_upload_div(data.class_item, render_group_table(data.group_list)));
                make_img_movable();
                
                add_new_group_btn_handler("add_new_group", "new_group_name", "add_new_group_row");
                set_new_group_btn_handler(data.class_item, "add_new_group", "set_new_group", "new_group_name", "group_table", "add_new_group_row", "group");
                set_new_group_cancel_btn_handler("add_new_group", "set_new_group_cancel", "add_new_group_row");
                
                uplaod_btn_handler(data.class_item);
            }
        });
    }
}

function show_msgModal(title, msg){
    $("#my_modal_backdrop").addClass("my_modal_backdrop");
    $("#messageModal_title").text(title);
    $("#messageModal_body").html(msg);
    $("#messageModal").modal("show");
}

function close_msgModal(){
    $("#my_modal_backdrop").removeClass("my_modal_backdrop");
    $("#messageModal").modal("hide");
}
