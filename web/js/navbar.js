//main
$(function(){
    $(document).on("click", "nav li", set_navbar_tab_active_handler);
    $(document).on("click", "#dropdown-show-classModal-btn", show_classModal);
    $(document).on("click", "#classModal_add", addnewclass_handler);

    add_active_for_page();

    $("#navbar-pending-btn").on("click", function(event){ update_dropdown_list("pending", "pending"); });
    $("#navbar-approved-btn").on("click", function(event){ update_dropdown_list("approved", "approved"); });
    $("#navbar-group-btn").on("click", function(event){ update_dropdown_list("approved", "group"); });
});

function update_dropdown_list(query_class_mode, functionpage){
    $.ajax({
        type: "GET",
        url: location.origin + "/getClass?mode=" + query_class_mode,
        cache: false,
        contentType: "application/json",
        dataType: 'json',
        error: function(e){
            show_msgModal("系統錯誤", "無法取得下拉選單");
            console.log(e);
        },
        success: function(class_list){
            console.log(class_list);

            render_updated_dropdown_list(functionpage, class_list);

            if(class_list.length == 0){ 
                show_msgModal("系統訊息", "無待審檔案<br>所有檔案皆以審核完畢");
                $("#dropdown-menu-" + functionpage).removeClass("show");
            }
            else{
                add_active_for_page();
            }
        }
    });
}

function set_navbar_tab_active_handler(){
    $(this).addClass('active').siblings().removeClass('active');
}

function render_updated_dropdown_list(functionpage, class_list){
    if(class_list.length == 0){
        $("#dropdown-menu-" + functionpage).html('');
    }
    else{
        let dropdown_list_str = '';
        class_list.forEach((class_item) => {
            dropdown_list_str += '<a class="dropdown-item" href="/' + role + '/' + functionpage + '/' + class_item.id + '">' + class_item.name + '</a>';
        });
        $("#dropdown-menu-" + functionpage).html(dropdown_list_str);
    }
}

function add_active_for_dropdown($this){
    let class_id = location.pathname.split("/")[3];
    $this.find("div a").each(function(class_idx){
        if((class_idx+1) == class_id){
            $(this).addClass("active");
        }
    });
}

function add_active_for_page(){
    let functionpage = location.pathname.split("/")[2];
    console.log(functionpage);
    $("nav li").each(function(idx){
        if(functionpage == "upload" && idx == 0){
            $(this).addClass("active");
            add_active_for_dropdown($(this));
        }
        else if(functionpage == "pending" && idx == 1){
            $(this).addClass("active");
            add_active_for_dropdown($(this));
        }
        else if(functionpage == "approved" && idx == 2){
            $(this).addClass("active");
            add_active_for_dropdown($(this));
        }
        else if(functionpage == "group" && idx == 3){
            $(this).addClass("active");
            let class_id = location.pathname.split("/")[2];
            add_active_for_dropdown($(this));
        }
        else if(functionpage == "display" && idx == 4){
            $(this).addClass("active");
        }
    });
}
