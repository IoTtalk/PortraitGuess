function render_classification_selector(group_list){
    var classification_selector_str = '<select class="form-control" id="grouplist_select">';

    classification_selector_str += '<option value="none">---</option>'
    classification_selector_str += '<option value="newgroup">新增群組</option>'
    
    group_list.forEach((group) => {
        if(group.id != "none"){
            classification_selector_str += '\
                <option class="group_option" value="' + group.id + '">' + group.name + '</option>\
            ';
        }
    });

    classification_selector_str += "</select>";

    return classification_selector_str;
}

function render_groupinfo(group_title, groupContentList, old_group){
    var groupinfo_str = "",
        groupContent_str = "",
        info = "";

        groupContentList.forEach((content) => {
            info = content.chi_name + ',' + content.eng_name + ',' + content.birth_year + '-' + content.death_year;
            groupContent_str += '\
                <tr>\
                    <td width="90%"><label question_id="' + content.question_id + '">' + info + '</label></td>\
                    <td width="10%"><button class="btn btn-outline-danger grouplist_delete">移除</button></td>\
                </tr>\
                <tr>\
            ';
        });

        var left_btn_id = "addNewGroup_btn",
            right_bth_id = "abortNow_btn";

        // check if those btn should change function for old/new group
        if(old_group){
            left_btn_id = "updateOldGroup_btn";
            right_bth_id = "deleteNow_btn";
        }

        groupinfo_str +='\
            <h2 id="group_title" class="center">' + group_title + '</h2>\
            <div class="groupContent_table">\
                <table id="groupContent_table" class="table table-hover ">\
                    ' + groupContent_str + '\
                </table>\
            </div>\
            <br>\
            <div class="center bottom">\
                <button id="' + left_btn_id + '" class="btn btn-primary">確認</button>\
                <button id="' + right_bth_id + '" class="btn btn-danger">刪除</button>\
            </div>\
        ';

    return groupinfo_str;
}

function render_human_accordion(humanCategory_list){
    var human_accordion_str = "",
        human_accordion = "";

    humanCategory_list.forEach((category) => {
        var id = category.id,
            name = category.name;

        //create category card
        human_accordion += '\
            <div class="card">\
                <div class="card-header" id="' + id +'_heading">\
                    <h5 class="mb-0">\
                        <button id="' + id + '" class="btn btn-link collapsed class_card_btn" \
                                data-toggle="collapse" data-target="#collapse_'+ id +'" \
                                aria-expanded="false" aria-controls="collapse_'+ id +'">\
                            ' + name + '\
                        </button>\
                    </h5>\
                </div>\
                <div id="collapse_'+ id +'" class="collapse" aria-labelledby="' + id +'_heading" data-parent="#accordion">\
                    <div class="card-body">\
                        <table id="' + id + '_class_table" class="table table-hover"></table>\
                    </div>\
                </div>\
            </div>\
        ';
    });

    human_accordion_str = '\
        <h3 class="center">請勾選想要加入群組的人像</h3>\
        <br>\
        <div id="accordion" class="accordion">\
            ' + human_accordion + '\
        </div>\
        ';
    return human_accordion_str;
}

function render_categoryHuman_table(category_id, categoryHuman_list){
    var categoryHuman_table_str = "";

    categoryHuman_list.forEach((human) => {
        categoryHuman_table_str += '\
            <tr>\
                <td><button id="' + human.id + '" class="btn btn-outline-info addhuman_btn">添加</button>\
                <td><label>' + human.info + '</label></td>\
            </tr>\
        ';
    });

    //no  human belongs to this category
    if(categoryHuman_table_str == ""){
        categoryHuman_table_str = "<tr><td>此分類尚無人物喔</td></tr>";
    }

    return categoryHuman_table_str;
}

function groupinfo_delete_handler(){
    $(".grouplist_delete").on('click', function(){
        console.log(this.id);
        $(this).parent().parent().remove();
    });
}

function updateOldGroup_btn_handler(){
    $("#updateOldGroup_btn").on('click', function(){
        var update_group_id = $("#grouplist_select").val(),
            newgroup_list = [];

        $('#groupContent_table').find('label').each(function(){
            newgroup_list.push({
                question_id: $(this).attr("question_id")
            });
        });

        console.log(update_group_id);
        console.log(newgroup_list);

        //ajax
        $.ajax({
            type: "POST",
            url: location.origin + "/updateOldHumanGroup",
            cache: false,
            data: JSON.stringify(
            {
                update_group_id : update_group_id,
                group_list : newgroup_list
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(){
                //alert success and reload page
                alert("更新成功!!\n 回首頁");
                location.reload();
            }
        });
    });
}

function deleteNow_btn_handler(){
    $("#deleteNow_btn").on('click', function(){
        //popup confirm box
        if(confirm("確定要刪除嗎?")){
            var delete_group_id = $("#grouplist_select").val();

            //ajax
            $.ajax({
                type: "POST",
                url: location.origin + "/deleteOldGroup",
                cache: false,
                data: JSON.stringify(
                {
                    delete_group_id : delete_group_id
                }),
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(){
                    alert("刪除成功!! \n 回首頁");
                    location.reload();
                }
            });
        }
        else{
            return false;
        }
    });
}

function addhuman_btn_handler(){
    $(".addhuman_btn").on('click', function(){
        var question_id = this.id,
            info = $(this).parent().next().find('label').text();
        // console.log(question_id, info);

        // check duplicate added
        var check_duplicate = false;
        $('#groupContent_table').find('label').each(function(){
            if($(this).text() == info){
                check_duplicate = true;
            }
        });

        if(check_duplicate){
            alert("已添加過了!!");
            return false;
        }

        //append to grouptable
        var newHuman_tablerow_str = '\
            <tr>\
                <td width="90%"><label question_id="' + question_id + '">' + info + '</label></td>\
                <td width="10%"><button class="btn btn-outline-danger grouplist_delete">移除</button></td>\
            </tr>\
        ';

        if($("#groupContent_table").find('tbody').length){
            $("#groupContent_table").find('tbody').append(newHuman_tablerow_str);
        }
        else{
            $("#groupContent_table").append(newHuman_tablerow_str);
        }

        // add handler for new human
        groupinfo_delete_handler();
    });
}

function class_card_btn_handler(){
    $(".class_card_btn").on("click", function(){
        var category_id = this.id;
        // console.log(this.id);

        $.ajax({
            type: "POST",
            url: location.origin + "/getHumanByCategory",
            cache: false,
            data: JSON.stringify(
            {
                category_id : category_id
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(data){
                var categoryHuman_list = JSON.parse(data);
                console.log(categoryHuman_list);

                //append into table
                var target_table = "#" + category_id + "_class_table";
                $(target_table).html(render_categoryHuman_table(category_id, categoryHuman_list));
                
                //add_btn_handler
                addhuman_btn_handler();
            }
        });
    });
}

//create new group ajax for new group
function addNewGroup_btn_handler(){ 
    $("#addNewGroup_btn").on('click',function(){
        var newgroup_list = [],
            newgroup_name = $("#group_title").text();

        $('#groupContent_table').find('label').each(function(){
            // console.log($(this).attr("question_id"));
            newgroup_list.push({
                question_id: $(this).attr("question_id")
            });
        });

        console.log(newgroup_name);
        console.log(newgroup_list);

        //ajax
        $.ajax({
            type: "POST",
            url: location.origin + "/addNewHumanGroup",
            cache: false,
            data: JSON.stringify(
            {
                newgroup_name : newgroup_name,
                group_list : newgroup_list
            }),
            contentType: "application/json",
            error: function(e){
                alert("something wrong");
                console.log(e);
            },
            success: function(){
                //alert success and reload page
                alert("建立成功!!\n 回首頁");
                location.reload();
            }
        });
    });
}

function setpageToStartUp(){
    $("#group_info").html("");
    $("#human_accordion").html("");
}

//abortion for new group
function abortNow_btn_handler(){
    $("#abortNow_btn").on('click',function(){
        //remove all div
        setpageToStartUp();

        //reset option select
        $("#grouplist_select").val("none");
    });
}

function option_handler(){
    $("#grouplist_select").on("change", function(){
        var option = $(this).val();
        // console.log($(this).val());
        
        if(option == "none"){ //user doesn't choose
            setpageToStartUp();
            return false;
        }
        else if(option == "newgroup"){ // add new group
            //get new group name
            var new_group_name = prompt("輸入新群組名稱");
            if($.trim(new_group_name) == ''){
                alert("欄位不得空白");
                return false;
            }
            else{
                //render group-content
                $('#group_info').html(render_groupinfo(new_group_name, [], 0));
                addNewGroup_btn_handler();
                abortNow_btn_handler();
            }
        }
        else{ //ajax get group info
            var old_group_name = $("#grouplist_select option[value='" + option + "']").text();
            console.log(old_group_name);

            //ajax
            $.ajax({
                type: "POST",
                url: location.origin + "/getGroupMember",
                cache: false,
                data: JSON.stringify(
                {
                    GroupId : option
                }),
                contentType: "application/json",
                error: function(e){
                    alert("something wrong");
                    console.log(e);
                },
                success: function(data){
                    var groupMember_list = JSON.parse(data);
                    console.log(groupMember_list);

                    //render group content into table
                    $('#group_info').html(render_groupinfo(old_group_name, groupMember_list, 1));

                    //let group member can be deleted
                    groupinfo_delete_handler();

                    //[TODO] update and delete bun handler
                    updateOldGroup_btn_handler();
                    deleteNow_btn_handler();
                }
            });
        }

        //show human category with corresponding human
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
                
                $("#human_accordion").html(render_human_accordion(humanCategory_list));
                class_card_btn_handler();
            }
        });
    });
}

//collapse test
function render_classification_div(classification_selector_str){
    var pending_div = '\
        <div class="row">\
            <div class="col-md-6">\
                <div class="form-group">\
                    <h2 class="center">建立群組</h2>\
                    <br>\
                    <h5>請點擊下拉選單</h5>\
                    ' + classification_selector_str + '\
                </div>\
                <br>\
                <div id="group_info"></div>\
            </div>\
            <div id="human_accordion" class="col-md-6"></div>\
        </div>\
    ';

    return pending_div;
}