define(["loading", "libraryMenu", "emby-button"], function(loading, libraryMenu) {
    "use strict";

    function loadUser(page, params) {
        var userid = params.userId;
        ApiClient.getUser(userid).then(function(user) {
            Dashboard.getCurrentUser().then(function(loggedInUser) {
                libraryMenu.setTitle(user.Name), page.querySelector(".username").innerHTML = user.Name;
                var showPasswordSection = !0,
                    showLocalAccessSection = !1;
                "Guest" == user.ConnectLinkType ? (page.querySelector(".localAccessSection").classList.add("hide"), showPasswordSection = !1) : user.HasConfiguredPassword ? (page.querySelector("#btnResetPassword").classList.remove("hide"), page.querySelector("#fldCurrentPassword").classList.remove("hide"), showLocalAccessSection = !0) : (page.querySelector("#btnResetPassword").classList.add("hide"), page.querySelector("#fldCurrentPassword").classList.add("hide")), showPasswordSection && (loggedInUser.Policy.IsAdministrator || user.Policy.EnableUserPreferenceAccess) ? page.querySelector(".passwordSection").classList.remove("hide") : page.querySelector(".passwordSection").classList.add("hide"), showLocalAccessSection && (loggedInUser.Policy.IsAdministrator || user.Policy.EnableUserPreferenceAccess) ? page.querySelector(".localAccessSection").classList.remove("hide") : page.querySelector(".localAccessSection").classList.add("hide");
                var txtEasyPassword = page.querySelector("#txtEasyPassword");
                txtEasyPassword.value = "", user.HasConfiguredEasyPassword ? (txtEasyPassword.placeholder = "******", page.querySelector("#btnResetEasyPassword").classList.remove("hide")) : (txtEasyPassword.removeAttribute("placeholder"), txtEasyPassword.placeholder = "", page.querySelector("#btnResetEasyPassword").classList.add("hide")), page.querySelector(".chkEnableLocalEasyPassword").checked = user.Configuration.EnableLocalPassword
            })
        }), page.querySelector("#txtCurrentPassword").value = "", page.querySelector("#txtNewPassword").value = "", page.querySelector("#txtNewPasswordConfirm").value = ""
    }
    return function(view, params) {
        function saveEasyPassword() {
            var userId = params.userId,
                easyPassword = view.querySelector("#txtEasyPassword").value;
            easyPassword ? ApiClient.updateEasyPassword(userId, easyPassword).then(function() {
                onEasyPasswordSaved(userId)
            }) : onEasyPasswordSaved(userId)
        }

        function onEasyPasswordSaved(userId) {
            ApiClient.getUser(userId).then(function(user) {
                user.Configuration.EnableLocalPassword = view.querySelector(".chkEnableLocalEasyPassword").checked, ApiClient.updateUserConfiguration(user.Id, user.Configuration).then(function() {
                    loading.hide(), require(["toast"], function(toast) {
                        toast(Globalize.translate("MessageSettingsSaved"))
                    }), loadUser(view, params)
                })
            })
        }

        function savePassword() {
            var userId = params.userId,
                currentPassword = view.querySelector("#txtCurrentPassword").value,
                newPassword = view.querySelector("#txtNewPassword").value;
            if (view.querySelector("#fldCurrentPassword").classList.contains("hide")) {
                // Firefox does not respect autocomplete=off, so clear it if the field is supposed to be hidden (and blank)
                // This should only happen when user.HasConfiguredPassword is false, but this information is not passed on
                currentPassword = "";
            }
            ApiClient.updateUserPassword(userId, currentPassword, newPassword).then(function() {
                loading.hide(), require(["toast"], function(toast) {
                    toast(Globalize.translate("PasswordSaved"))
                }), loadUser(view, params)
            }, function() {
                loading.hide(), Dashboard.alert({
                    title: Globalize.translate("HeaderLoginFailure"),
                    message: Globalize.translate("MessageInvalidUser")
                })
            })
        }

        function onSubmit(e) {
            var form = this;
            return form.querySelector("#txtNewPassword").value != form.querySelector("#txtNewPasswordConfirm").value ? require(["toast"], function(toast) {
                toast(Globalize.translate("PasswordMatchError"))
            }) : (loading.show(), savePassword()), e.preventDefault(), !1
        }

        function onLocalAccessSubmit(e) {
            return loading.show(), saveEasyPassword(), e.preventDefault(), !1
        }

        function resetPassword() {
            var msg = Globalize.translate("PasswordResetConfirmation");
            require(["confirm"], function(confirm) {
                confirm(msg, Globalize.translate("PasswordResetHeader")).then(function() {
                    var userId = params.userId;
                    loading.show(), ApiClient.resetUserPassword(userId).then(function() {
                        loading.hide(), Dashboard.alert({
                            message: Globalize.translate("PasswordResetComplete"),
                            title: Globalize.translate("PasswordResetHeader")
                        }), loadUser(view, params)
                    })
                })
            })
        }

        function resetEasyPassword() {
            var msg = Globalize.translate("PinCodeResetConfirmation");
            require(["confirm"], function(confirm) {
                confirm(msg, Globalize.translate("HeaderPinCodeReset")).then(function() {
                    var userId = params.userId;
                    loading.show(), ApiClient.resetEasyPassword(userId).then(function() {
                        loading.hide(), Dashboard.alert({
                            message: Globalize.translate("PinCodeResetComplete"),
                            title: Globalize.translate("HeaderPinCodeReset")
                        }), loadUser(view, params)
                    })
                })
            })
        }
        view.querySelector(".updatePasswordForm").addEventListener("submit", onSubmit), view.querySelector(".localAccessForm").addEventListener("submit", onLocalAccessSubmit), view.querySelector("#btnResetEasyPassword").addEventListener("click", resetEasyPassword), view.querySelector("#btnResetPassword").addEventListener("click", resetPassword), view.addEventListener("viewshow", function() {
            loadUser(view, params)
        })
    }
});
