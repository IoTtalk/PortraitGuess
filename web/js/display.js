$(function(){
    $(document).on("click", ".displayModal_btn", function(event){ show_displayModal(event); });
    $(document).on("click", "#set_display_btn", set_display_group);
    $(document).on("click", "#select_all_btn", select_all_to_display);
    $(document).on("click", "#cancel_all_btn", cancel_all_to_display);

    $.ajax({
        type: "GET",
        url: location.origin + "/getGroup?mode=approved&class_id=all",
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){
            show_msgModal("系統錯誤", "無法進入'播放清單'頁面");
            console.log(e);
        },
        success: function(payload){
            let data = payload;
            console.log(data);
            
            render_grouplist_table(data.class_list, data.group_list);
        }
    });
});

function render_grouplist_table(class_list, group_list){
    let grouplist_table_str = "";
    class_list.forEach((classs) => {
        let id = classs.id,
            name = classs.name;

        grouplist_table_str += "\
            <tr><td class='mycheckbox'><input style='display:none;' type='checkbox' value='" + id + "'/></td>\
            <td><label>" + name + "</label></td>\
            <td><button class='btn btn-outline-dark displayModal_btn' data-toggle='modal' data-target='#displayModal'>內容</button></td></tr>";
    });

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

    $("#display_table").html(grouplist_table_str);
}

function set_display_group(){
    let $selected_group = $('input[name=display]:checked');
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
            show_msgModal("系統錯誤", "無法取得群組列表");
            console.log(e);
        },
        success: function(){
            show_msgModal("系統訊息", "建立播放清單成功");
        }
    });
}

function select_all_to_display(){
    $("input:checkbox[name='display']").prop("checked", true);
}

function cancel_all_to_display(){
    $("input:checkbox[name='display']").prop("checked", false);
}
