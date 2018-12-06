function render_approved_div(approvedHuman_list){
    var approved_table_str = '<table class="table table-hover">';
    approvedHuman_list.forEach((approvedHuman) => {
        var id = approvedHuman["id"],
            info = approvedHuman["info"]["chi_name"] + " , " + approvedHuman["info"]["eng_name"] + " , " +
                   approvedHuman["info"]["birth_year"] + " - " + approvedHuman["info"]["death_year"];

        approved_table_str += '\
            <tr id="' + id + '">\
                <td>' + info + '</td>\
                <td><button id="' + id + '_approvedbtn" class="btn btn-secondary approvedbtn">編輯</button></td>\
            </tr>';
    });
    approved_table_str += "</table>";

    var approved_div = '\
        <h2 class="center top">編輯已審檔案</h2>\
        <br>\
        <h3 class="center">請點選欲編輯的檔案</h3>\
        <br>\
        <div class="margin_center approved_table">\
        ' + approved_table_str + ' \
        </div>\
        ';
    return approved_div;
}

function approvedbtn_handler(){
    $(".approvedbtn").on("click", function(){
        var id = this.id.split("_")[0];
        console.log(id);
        
        $.ajax({
            type: "POST",
            url: location.origin + "/getHumanAllData",
            cache: false,
            data: JSON.stringify(
            {
                questionId : id,
                status : 1
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var humanData = JSON.parse(data)
                console.log(humanData);

                //set modal content by humanData
                setupEditModal(humanData, 1);

                add_new_category_btn_handler("editModal_add_new_category", "editModal_category_table");

                human_update_btn_handler(id, 1);
                human_delete_btn_handler("approved", id);

                //show edit modal
                $('#editModal').modal("show");
            }
        });
    });
}
