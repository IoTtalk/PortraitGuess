//main
var question_list = [];

$(function(){
    $(document).on("click", ".pendingbtn", function(event){ show_editModal(event, class_item, "pending"); });
    $(document).on("click", ".remove_tag", function(event){ remove_img(event) });
    $(document).on("click", "#editModal_delete", function(event){ show_confirmModal(); });
    $(document).on("click", "#editModal_update", function(event){ update_question(event, class_item.id, "pending"); });

    $(document).on("click", "#refresh", function(event){ refresh_question(class_item, "pending"); });
    $(document).on("click", "#ascending", function(event){ display_ascending_question(class_item, "pending"); });
    $(document).on("click", "#descending", function(event){ display_descending_question(class_item, "pending"); });

    $(document).on("click", "#editModal_add_new_group", function(event){ show_new_group_edit_row(event, "editModal_new_group_name", "editModal_add_new_group_row"); });
    $(document).on("click", "#editModal_set_new_group", function(event){ exec_add_new_group(class_item, "editModal_add_new_group", "editModal_new_group_name", "editModal_group_table", "editModal_add_new_group_row", "editModalgroup"); });
    $(document).on("click", "#editModal_set_new_group_cancel", function(event){ cancel_add_new_group("editModal_add_new_group", "editModal_add_new_group_row"); });

    $(document).on("click", "#confirmModal_confirm_btn", function(event){ confirmModal_confirm_btn_handler(delete_question_cb, {"class_item": class_item, "$this": $(event.target), "mode": "pending"}); });
    $(document).on("click", "#confirmModal_cancel_btn", function(event){ close_confirmModal(); });

    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=0",
        cache: false,
        contentType: "application/json",
        error: function(e){
            show_msgModal("系統錯誤", "無法進入'待審檔案'頁面");
            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log(data);

            question_list = data.question_list;

            render_pending_table(data.class_item, question_list);
        }
    });
});

function render_pending_table(class_item, pending_list){
    let pending_table_str = "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>";
    if(pending_list.length == 0){
        pending_table_str += "<tr><td>所有" + class_item.name + "檔案皆以審核完畢</td></tr>"
    }

    pending_list.forEach((pending_item) => {
        let id = pending_item.id,
            name = pending_item.name,
            description = pending_item.description;

        pending_table_str += '\
            <tr id="' + id + '_row">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button question_id="' + id + '" class="btn btn-secondary pendingbtn">審核</button></td>\
            </tr>';
    });

    $("#pending_table").html(pending_table_str);
}
