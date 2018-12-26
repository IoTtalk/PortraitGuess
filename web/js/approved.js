function render_approved_div(class_item, approved_list){
    var approved_table_str = '<table class="table table-hover">';
    approved_table_str += "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>"
    approved_list.forEach((approved_item) => {
        var id = approved_item.id,
            name = approved_item.name,
            description = approved_item.description;

        approved_table_str += '\
            <tr id="' + id + '">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button id="' + id + '_approvedbtn" class="btn btn-secondary approvedbtn">編輯</button></td>\
            </tr>';
    });
    approved_table_str += "</table>";

    var approved_div = '\
        <h2 class="center top">已審' + class_item.name + '檔案</h2>\
        <br>\
        <h3 class="center">請點選欲編輯的' + class_item.name + '檔案</h3>\
        <br>\
        <div class="margin_table approved_table">\
        ' + approved_table_str + ' \
        </div>\
        ';
    return approved_div;
}

function approvedbtn_handler(class_item){
    $(".approvedbtn").on("click", function(){
        var id = this.id.split("_")[0];
        console.log(id);
        
        $.ajax({
            type: "GET",
            url: location.origin + "/getQuestion?mode=one&class_id=" + class_item.id + "&question_id=" + id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var questionData = JSON.parse(data)
                console.log(questionData);

                //set modal content by questionData
                setupEditModal(class_item, questionData, 1);

                add_new_category_btn_handler(class_item, "editModal_add_new_category", "editModal_category_table");

                question_update_btn_handler(class_item, id, 1);
                question_delete_btn_handler(id);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}
