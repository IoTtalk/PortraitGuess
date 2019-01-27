//main
$(function (){
    console.log("class_list:", class_list);
    console.log("pendingClass_list:", pendingClass_list);
    console.log("approvedClass_list:", approvedClass_list);

    $(document).on("click", "#homepage_link_show_classModal_btn", show_classModal);
    $(document).on("click", "#classModal_add", addnewclass_handler);
    $(document).on("click", ".homepage_link", redirect_page);
});
