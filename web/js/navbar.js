//main
$(function(){
    $(document).on("click", "nav li", set_navbar_tab_active_handler);
    $(document).on("click", ".navbar-brand", back_home_page);
    $(document).on("click", ".dropdown_list_btn", redirect_page);
    $(document).on("click", "#dropdown-show-classModal-btn", show_classModal);
    $(document).on("click", "#classModal_add", addnewclass_handler);
});

function set_navbar_tab_active_handler(){
    $(this).addClass('active').siblings().removeClass('active');
}

function back_home_page(){
    location.href= location.origin + '/manage';
}
