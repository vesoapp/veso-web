define([], function() {
    "use strict";

    function processForgotPasswordResult(result) {
        if (result.Success) {
            var msg = Globalize.translate("MessagePasswordResetForUsers");
            return msg += "<br/>", msg += "<br/>", msg += result.UsersReset.join("<br/>"), void Dashboard.alert({
                message: msg,
                title: Globalize.translate("HeaderPasswordReset"),
                callback: function() {
                    window.location.href = "index.html"
                }
            })
        }
        Dashboard.alert({
            message: Globalize.translate("MessageInvalidForgotPasswordPin"),
            title: Globalize.translate("HeaderPasswordReset")
        })
    }
    return function(view, params) {
        function onSubmit(e) {
            return ApiClient.ajax({
                type: "POST",
                url: ApiClient.getUrl("Users/ForgotPassword/Pin"),
                dataType: "json",
                data: {
                    Pin: view.querySelector("#txtPin").value
                }
            }).then(processForgotPasswordResult), e.preventDefault(), !1
        }
        view.querySelector("form").addEventListener("submit", onSubmit)
    }
});