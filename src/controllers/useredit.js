define(["jQuery", "loading", "libraryMenu", "fnchecked"], function ($, loading, libraryMenu) {
    "use strict";

    function loadDeleteFolders(page, user, mediaFolders) {
        ApiClient.getJSON(ApiClient.getUrl("Channels", {
            SupportsMediaDeletion: true
        })).then(function (channelsResult) {
            var i;
            var length;
            var folder;
            var isChecked;
            var checkedAttribute;
            var html = "";

            for (i = 0, length = mediaFolders.length; i < length; i++) {
                folder = mediaFolders[i];
                isChecked = user.Policy.EnableContentDeletion || -1 != user.Policy.EnableContentDeletionFromFolders.indexOf(folder.Id);
                checkedAttribute = isChecked ? ' checked="checked"' : "";
                html += '<label><input type="checkbox" is="emby-checkbox" class="chkFolder" data-id="' + folder.Id + '" ' + checkedAttribute + "><span>" + folder.Name + "</span></label>";
            }

            for (i = 0, length = channelsResult.Items.length; i < length; i++) {
                folder = channelsResult.Items[i];
                isChecked = user.Policy.EnableContentDeletion || -1 != user.Policy.EnableContentDeletionFromFolders.indexOf(folder.Id);
                checkedAttribute = isChecked ? ' checked="checked"' : "";
                html += '<label><input type="checkbox" is="emby-checkbox" class="chkFolder" data-id="' + folder.Id + '" ' + checkedAttribute + "><span>" + folder.Name + "</span></label>";
            }

            $(".deleteAccess", page).html(html).trigger("create");
            $("#chkEnableDeleteAllFolders", page).checked(user.Policy.EnableContentDeletion).trigger("change");
        });
    }

    function loadAuthProviders(page, user, providers) {
        if (providers.length > 1) {
            page.querySelector(".fldSelectLoginProvider").classList.remove("hide");
        } else {
            page.querySelector(".fldSelectLoginProvider").classList.add("hide");
        }

        var currentProviderId = user.Policy.AuthenticationProviderId;
        page.querySelector(".selectLoginProvider").innerHTML = providers.map(function (provider) {
            var selected = provider.Id === currentProviderId || providers.length < 2 ? " selected" : "";
            return '<option value="' + provider.Id + '"' + selected + ">" + provider.Name + "</option>";
        });
    }

    function loadPasswordResetProviders(page, user, providers) {
        if (providers.length > 1) {
            page.querySelector(".fldSelectPasswordResetProvider").classList.remove("hide");
        } else {
            page.querySelector(".fldSelectPasswordResetProvider").classList.add("hide");
        }

        var currentProviderId = user.Policy.PasswordResetProviderId;
        page.querySelector(".selectPasswordResetProvider").innerHTML = providers.map(function (provider) {
            var selected = provider.Id === currentProviderId || providers.length < 2 ? " selected" : "";
            return '<option value="' + provider.Id + '"' + selected + ">" + provider.Name + "</option>";
        });
    }

    function loadUser(page, user) {
        currentUser = user;
        ApiClient.getJSON(ApiClient.getUrl("Auth/Providers")).then(function (providers) {
            loadAuthProviders(page, user, providers);
        });
        ApiClient.getJSON(ApiClient.getUrl("Auth/PasswordResetProviders")).then(function (providers) {
            loadPasswordResetProviders(page, user, providers);
        });
        ApiClient.getJSON(ApiClient.getUrl("Library/MediaFolders", {
            IsHidden: false
        })).then(function (folders) {
            loadDeleteFolders(page, user, folders.Items);
        });

        if (user.Policy.IsDisabled) {
            $(".disabledUserBanner", page).show();
        } else {
            $(".disabledUserBanner", page).hide();
        }

        $("#txtUserName", page).prop("disabled", "").removeAttr("disabled");
        $("#fldConnectInfo", page).show();
        $(".lnkEditUserPreferences", page).attr("href", "mypreferencesmenu.html?userId=" + user.Id);
        libraryMenu.setTitle(user.Name);
        page.querySelector(".username").innerHTML = user.Name;
        $("#txtUserName", page).val(user.Name);
        $("#chkIsAdmin", page).checked(user.Policy.IsAdministrator);
        $("#chkDisabled", page).checked(user.Policy.IsDisabled);
        $("#chkIsHidden", page).checked(user.Policy.IsHidden);
        $("#chkRemoteControlSharedDevices", page).checked(user.Policy.EnableSharedDeviceControl);
        $("#chkEnableRemoteControlOtherUsers", page).checked(user.Policy.EnableRemoteControlOfOtherUsers);
        $("#chkEnableDownloading", page).checked(user.Policy.EnableContentDownloading);
        $("#chkManageLiveTv", page).checked(user.Policy.EnableLiveTvManagement);
        $("#chkEnableLiveTvAccess", page).checked(user.Policy.EnableLiveTvAccess);
        $("#chkEnableMediaPlayback", page).checked(user.Policy.EnableMediaPlayback);
        $("#chkEnableAudioPlaybackTranscoding", page).checked(user.Policy.EnableAudioPlaybackTranscoding);
        $("#chkEnableVideoPlaybackTranscoding", page).checked(user.Policy.EnableVideoPlaybackTranscoding);
        $("#chkEnableVideoPlaybackRemuxing", page).checked(user.Policy.EnablePlaybackRemuxing);
        $("#chkForceRemoteSourceTranscoding", page).checked(user.Policy.ForceRemoteSourceTranscoding);
        $("#chkRemoteAccess", page).checked(null == user.Policy.EnableRemoteAccess || user.Policy.EnableRemoteAccess);
        $("#chkEnableSyncTranscoding", page).checked(user.Policy.EnableSyncTranscoding);
        $("#chkEnableConversion", page).checked(user.Policy.EnableMediaConversion || false);
        $("#chkEnableSharing", page).checked(user.Policy.EnablePublicSharing);
        $("#txtRemoteClientBitrateLimit", page).val(user.Policy.RemoteClientBitrateLimit / 1e6 || "");
        $("#txtLoginAttemptsBeforeLockout", page).val(user.Policy.LoginAttemptsBeforeLockout || "0");
        loading.hide();
    }

    function onSaveComplete(page, user) {
        Dashboard.navigate("userprofiles.html");
        loading.hide();

        require(["toast"], function (toast) {
            toast(Globalize.translate("SettingsSaved"));
        });
    }

    function saveUser(user, page) {
        user.Name = $("#txtUserName", page).val();
        user.Policy.IsAdministrator = $("#chkIsAdmin", page).checked();
        user.Policy.IsHidden = $("#chkIsHidden", page).checked();
        user.Policy.IsDisabled = $("#chkDisabled", page).checked();
        user.Policy.EnableRemoteControlOfOtherUsers = $("#chkEnableRemoteControlOtherUsers", page).checked();
        user.Policy.EnableLiveTvManagement = $("#chkManageLiveTv", page).checked();
        user.Policy.EnableLiveTvAccess = $("#chkEnableLiveTvAccess", page).checked();
        user.Policy.EnableSharedDeviceControl = $("#chkRemoteControlSharedDevices", page).checked();
        user.Policy.EnableMediaPlayback = $("#chkEnableMediaPlayback", page).checked();
        user.Policy.EnableAudioPlaybackTranscoding = $("#chkEnableAudioPlaybackTranscoding", page).checked();
        user.Policy.EnableVideoPlaybackTranscoding = $("#chkEnableVideoPlaybackTranscoding", page).checked();
        user.Policy.EnablePlaybackRemuxing = $("#chkEnableVideoPlaybackRemuxing", page).checked();
        user.Policy.ForceRemoteSourceTranscoding = $("#chkForceRemoteSourceTranscoding", page).checked();
        user.Policy.EnableContentDownloading = $("#chkEnableDownloading", page).checked();
        user.Policy.EnableSyncTranscoding = $("#chkEnableSyncTranscoding", page).checked();
        user.Policy.EnableMediaConversion = $("#chkEnableConversion", page).checked();
        user.Policy.EnablePublicSharing = $("#chkEnableSharing", page).checked();
        user.Policy.EnableRemoteAccess = $("#chkRemoteAccess", page).checked();
        user.Policy.RemoteClientBitrateLimit = parseInt(1e6 * parseFloat($("#txtRemoteClientBitrateLimit", page).val() || "0"));
        user.Policy.LoginAttemptsBeforeLockout = parseInt($("#txtLoginAttemptsBeforeLockout", page).val() || "0");
        user.Policy.AuthenticationProviderId = page.querySelector(".selectLoginProvider").value;
        user.Policy.PasswordResetProviderId = page.querySelector(".selectPasswordResetProvider").value;
        user.Policy.EnableContentDeletion = $("#chkEnableDeleteAllFolders", page).checked();
        user.Policy.EnableContentDeletionFromFolders = user.Policy.EnableContentDeletion ? [] : $(".chkFolder", page).get().filter(function (c) {
            return c.checked;
        }).map(function (c) {
            return c.getAttribute("data-id");
        });
        ApiClient.updateUser(user).then(function () {
            ApiClient.updateUserPolicy(user.Id, user.Policy).then(function () {
                onSaveComplete(page, user);
            });
        });
    }

    function onSubmit() {
        var page = $(this).parents(".page")[0];
        loading.show();
        getUser().then(function (result) {
            saveUser(result, page);
        });
        return false;
    }

    function getUser() {
        var userId = getParameterByName("userId");
        return ApiClient.getUser(userId);
    }

    function loadData(page) {
        loading.show();
        getUser().then(function (user) {
            loadUser(page, user);
        });
    }

    var currentUser;
    $(document).on("pageinit", "#editUserPage", function () {
        $(".editUserProfileForm").off("submit", onSubmit).on("submit", onSubmit);
        this.querySelector(".sharingHelp").innerHTML = Globalize.translate("OptionAllowLinkSharingHelp", 30);
        var page = this;
        $("#chkEnableDeleteAllFolders", this).on("change", function () {
            if (this.checked) {
                $(".deleteAccess", page).hide();
            } else {
                $(".deleteAccess", page).show();
            }
        });
        ApiClient.getServerConfiguration().then(function (config) {
            if (config.EnableRemoteAccess) {
                page.querySelector(".fldRemoteAccess").classList.remove("hide");
            } else {
                page.querySelector(".fldRemoteAccess").classList.add("hide");
            }
        });
    }).on("pagebeforeshow", "#editUserPage", function () {
        loadData(this);
    });
});
