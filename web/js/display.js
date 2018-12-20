function render_grouplist_table(group_list){
    var grouplist_table_str = "";

    var grouplist_table_str = "<table class='table table-hover'>";
    group_list.forEach((group) => {
        var id = group.id,
            name = group.name,
            status = group.status;

        //checkbox value modify
        if(status){
            grouplist_table_str += "<tr><td class='mycheckbox'><input type='checkbox' id='" + id + "_display_checkbox' name='display' value='" + id + "' checked/></td>";
        }
        else{
            grouplist_table_str += "<tr><td class='mycheckbox'><input type='checkbox' id='" + id + "_display_checkbox' name='display' value='" + id + "'/></td>";
        }

        grouplist_table_str += "\
            <td><label for='" + id + "_display_checkbox'>" + name + "</label></td>\
            <td><button class='btn btn-outline-dark displayModal_btn' data-toggle='modal' data-target='#displayModal'>內容</button></td></tr>";
    });
    grouplist_table_str += "</table>";

    return grouplist_table_str;
}

function render_groupmember_table(groupMembertList){
    var groupmember_table_str = '<table id="displayModal_table" class="table table-hover">',
        info = "";

    groupMembertList.forEach((content) => {
        info = content.name + content.description;
        groupmember_table_str += '\
            <tr><td><label>' + info + '</label></td></tr>\
        ';
    });

    groupmember_table_str += '</table>';

    return groupmember_table_str;
}

function displayModal_btn_handler(){
    $(".displayModal_btn").on('click', function(req, res){
        var display_group_id = $(this).parent().parent().find('input').attr('value'),
            display_group_name = $(this).parent().parent().find('label').text();

        console.log(display_group_id, display_group_name);

        //ajax get this groupmember
        $.ajax({
            type: "GET",
            url: location.origin + "/getGroup?mode=one&group_id=" + display_group_id,
            cache: false,
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var groupMembertList = JSON.parse(data)
                console.log(groupMembertList);

                //set moadl title by groupname
                $('#displayModal_title').text(display_group_name);

                //set modal content by groupMembertList
                $('#displayModal_info').html(render_groupmember_table(groupMembertList));

                //show display modal
                $('#displayModal').modal("show");
            }
        });
    });
}

function render_display_div(grouplist_table_str){
    var display_div = '\
        <h2 class="center">播放名單</h2>\
        <br>\
        <h3 class="center">請勾選欲播放的群組(可多選)</h3>\
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
        var $selected_group = $('input[name=display]:checked');
        if($selected_group.length < 1){
            alert("至少勾選 1 個!");
            return false;
        }
        else{
            var selected_group_list = [];

            $selected_group.each(function (){
                selected_group_list.push({
                    id : $(this).val(),
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
                    alert("something wrong");
                    console.log(e);
                },
                success: function(){
                    alert("設定成功!!");
                }
            });
        }
    });
}

//make db selection only one
function checkbox_onlyone_handler(){
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
}

//make protrait selection all or none
function checkbox_all_or_clear_handler(){
    //TODO
    $('#select_all_portrait_btn').on('click',function(){
        $("input:checkbox[name='portrait']").prop("checked", true);
    });

    $('#select_clear_portrait_btn').on('click',function(){
        $("input:checkbox[name='portrait']").prop("checked", false);
    });
}
