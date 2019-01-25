function render_grouplist_table(group_list){
    let grouplist_table_str = "<table class='table table-hover'>";
    group_list.forEach((group) => {
        let id = group.id,
            name = group.name,
            status = group.status,
            class_id = group.class_id;

        //checkbox value modify
        if(status){
            grouplist_table_str += "<tr><td class='mycheckbox'><input type='checkbox' id='" + id + "_display_checkbox' name='display' class_id='" + class_id + "' value='" + id + "' checked/></td>";
        }
        else{
            grouplist_table_str += "<tr><td class='mycheckbox'><input type='checkbox' id='" + id + "_display_checkbox' name='display' class_id='" + class_id + "' value='" + id + "'/></td>";
        }

        grouplist_table_str += "\
            <td><label for='" + id + "_display_checkbox'>" + name + "</label></td>\
            <td><button class='btn btn-outline-dark displayModal_btn' data-toggle='modal' data-target='#displayModal'>內容</button></td></tr>";
    });
    grouplist_table_str += "</table>";

    return grouplist_table_str;
}

function render_groupmember_table(groupMembertList){
    let groupmember_table_str = '<table id="displayModal_table" class="table table-hover">',
        info = "";

    groupmember_table_str += '<tr><th width="40%">名字</th><th>敘述</th></tr>';
    groupMembertList.forEach((content) => {
        groupmember_table_str += '\
            <tr>\
                <td><label>' + content.name + '</label></td>\
                <td><label>' + content.description + '</label></td>\
            </tr>\
        ';
    });

    groupmember_table_str += '</table>';

    return groupmember_table_str;
}

function displayModal_btn_handler(){
    $(".displayModal_btn").on('click', function(req, res){
        let display_group_id = $(this).parent().parent().find('input').attr('value'),
            display_group_name = $(this).parent().parent().find('label').text();

        console.log(display_group_id, display_group_name);

        //ajax get this groupmember
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroupMember?mode=approved&group_id=" + display_group_id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                //show msgModal
                show_msgModal("系統錯誤", "無法取得群組資訊");
                console.log(e);
            },
            success: function(payload){
                let data = JSON.parse(payload)
                console.log(data);

                //set moadl title by groupname
                $('#displayModal_title').text(display_group_name);

                //set modal content by groupMembertList
                $('#displayModal_info').html(render_groupmember_table(data.groupMember_list));

                //show display modal
                $('#displayModal').modal("show");
            }
        });
    });
}

function render_display_div(grouplist_table_str){
    let display_div = '\
        <h2 class="center">播放名單</h2>\
        <br>\
        <h3 class="center">請勾選欲播放的群組(可多選)</h3>\
        <br>\
        <div class="center">\
            <button id="select_all" class="btn btn-secondary">全選</button>\
            <button id="cancal_all" class="btn btn-secondary">全不選</button>\
        </div>\
        <br>\
        <div class="margin_center display_table">' + grouplist_table_str + '</div>\
        <br>\
        <div class="center">\
            <button id="set_display_btn" class="btn btn-primary">確認</button>\
        </div>';

    return display_div;
}

function set_display_btn_handler(){
    $('#set_display_btn').on('click', function(){
        let $selected_group = $('input[name=display]:checked');
        if($selected_group.length < 1){
            //show msgModal
            show_msgModal("系統訊息", "至少需勾選 1 個群組");
            return false;
        }
        else{
            let selected_group_list = [];

            $selected_group.each(function (){
                selected_group_list.push({
                    id : $(this).val(),
                    class_id : $(this).attr("class_id")
                });
            });
            
            console.log(selected_group_list);

            $.ajax({
                type: "PUT",
                url: location.origin + "/setDisplayGroup",
                cache: false,
                data: JSON.stringify(
                {
                    selected_group_list : selected_group_list
                }),
                contentType: "application/json",
                error: function(e){
                    //show msgModal
                    show_msgModal("系統錯誤", "無法取得群組列表");
                    console.log(e);
                },
                success: function(){
                    //show msgModal
                    show_msgModal("系統訊息", "建立播放清單成功");
                }
            });
        }
    });
}

//make protrait selection all or none
function select_and_cancel_handler(){
    $('#select_all').on('click',function(){
        $("input:checkbox[name='display']").prop("checked", true);
    });

    $('#cancal_all').on('click',function(){
        $("input:checkbox[name='display']").prop("checked", false);
    });
}
