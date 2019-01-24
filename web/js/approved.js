function render_approved_div(approved_table_str){
    let approved_div = '\
        <h2 class="center top">已審檔案</h2>\
        <br>\
        <h3 class="center">請點選欲編輯的檔案</h3>\
        <br>\
        <div class="center">\
            <button id="refresh" class="btn btn-secondary">&#8635;</button>\
            <button id="ascending" class="btn btn-secondary">&#9650;</button>\
            <button id="descending" class="btn btn-secondary">&#9660;</button>\
        </div>\
        <br>\
        <div class="margin_table approved_table">\
            <table id="approved_table" class="table table-hover">\
                ' + approved_table_str + ' \
            </table>\
        </div>\
        ';
    return approved_div;
}

function render_approved_table(class_item, approved_list){
    let approved_table_str = "<tr><th width='40%'>名字</th><th width='50%'>敘述</th><th width='10%'></th></tr>"
    approved_list.forEach((approved_item) => {
        let id = approved_item.id,
            name = approved_item.name,
            description = approved_item.description;

        approved_table_str += '\
            <tr id="' + id + '">\
                <td>' + name + '</td>\
                <td>' + description + '</td>\
                <td><button id="' + id + '_approvedbtn" class="btn btn-secondary approvedbtn">編輯</button></td>\
            </tr>';
    });

    return approved_table_str;
}

function approvedbtn_handler(class_item, mode){
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

                add_new_group_btn_handler(class_item, "editModal_add_new_group", "editModal_group_table");

                question_update_btn_handler(class_item, id, mode);
                question_delete_btn_handler(class_item, id, mode);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}
