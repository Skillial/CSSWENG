$(document).ready(function() {

    $("#userTypeSelect").change(function() {
        if ($(this).val() == "SEDO") {
            $("#addUser").load("addUser", { userType: "SEDO" });
        } else if ($(this).val() == "Treasurer") {
            $("#addUser").load("addUser", { userType: "Treasurer" });
        }
    });

});