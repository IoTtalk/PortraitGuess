//main
var question_list = [];

$(function(){
    $(document).on("click", ".approvedbtn", function(event){ show_editModal(event, class_item, "approved"); });
    $(document).on("click", "#editModal_delete", function(event){ show_confirmModal(); });
    $(document).on("click", "#editModal_update", function(event){ update_question(event, class_item.id, "approved"); });

    $(document).on("click", "#refresh", function(event){ refresh_question(class_item, "approved"); });
    $(document).on("click", "#ascending", function(event){ display_ascending_question(class_item, "approved"); });
    $(document).on("click", "#descending", function(event){ display_descending_question(class_item, "approved"); });

    $(document).on("click", "#editModal_add_new_group", function(event){ show_new_group_edit_row(event, "editModal_new_group_name", "editModal_add_new_group_row"); });
    $(document).on("click", "#editModal_set_new_group", function(event){ exec_add_new_group(class_item, "editModal_add_new_group", "editModal_new_group_name", "editModal_group_table", "editModal_add_new_group_row", "editModalgroup"); });
    $(document).on("click", "#editModal_set_new_group_cancel", function(event){ cancel_add_new_group("editModal_add_new_group", "editModal_add_new_group_row"); });

    $(document).on("click", "#confirmModal_confirm_btn", function(event){ confirmModal_confirm_btn_handler(delete_question_cb, {"class_item": class_item, "$this": $(event.target), "mode": "approved"}); });
    $(document).on("click", "#confirmModal_cancel_btn", function(event){ close_confirmModal(); });

    $.ajax({
        type: "GET",
        url: location.origin + "/getQuestion?mode=all&class_id=" + class_item.id + "&status=1",
        cache: false,
        contentType: "application/json",
        error: function(e){
            show_msgModal("系統錯誤", "無法進入'已審檔案'頁面");
            console.log(e);
        },
        success: function(payload){
            let data = JSON.parse(payload);
            console.log(data);

            question_list = data.question_list;

            render_approved_table(data.class_item, data.question_list);
        }
    });
});

function render_approved_table(class_item, approved_list){
    let approved_table_str = "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>"
    approved_list.forEach((approved_item) => {
        let id = approved_item.id,
            name = approved_item.name,
            description = approved_item.description;

        approved_table_str += '\
            <tr id="' + id + '_row">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button question_id="' + id + '" class="btn btn-secondary approvedbtn">編輯</button></td>\
            </tr>';
    });

    $("#approved_table").html(approved_table_str);
}
