define(["jQuery", "globalize", "loading", "libraryMenu", "listViewStyle", "emby-button"], function ($, globalize, loading, libraryMenu) {
    "use strict";

    function loadProfiles(page) {
        loading.show();
        ApiClient.getJSON(ApiClient.getUrl("Dlna/ProfileInfos")).then(function (result) {
            renderUserProfiles(page, result);
            renderSystemProfiles(page, result);
            loading.hide();
        });
    }

    function renderUserProfiles(page, profiles) {
        renderProfiles(page, page.querySelector(".customProfiles"), profiles.filter(function (p) {
            return "User" == p.Type;
        }));
    }

    function renderSystemProfiles(page, profiles) {
        renderProfiles(page, page.querySelector(".systemProfiles"), profiles.filter(function (p) {
            return "System" == p.Type;
        }));
    }

    function renderProfiles(page, element, profiles) {
        var html = "";

        if (profiles.length) {
            html += '<div class="paperList">';
        }

        for (var i = 0, length = profiles.length; i < length; i++) {
            var profile = profiles[i];
            html += '<div class="listItem listItem-border">';
            html += '<i class="listItemIcon material-icons live_tv"></i>';
            html += '<div class="listItemBody two-line">';
            html += "<a is='emby-linkbutton' style='padding:0;margin:0;' data-ripple='false' class='clearLink' href='dlnaprofile.html?id=" + profile.Id + "'>";
            html += "<div>" + profile.Name + "</div>";
            html += "</a>";
            html += "</div>";

            if ("User" == profile.Type) {
                html += '<button type="button" is="paper-icon-button-light" class="btnDeleteProfile" data-profileid="' + profile.Id + '" title="' + globalize.translate("ButtonDelete") + '"><i class="material-icons">delete</i></button>';
            }

            html += "</div>";
        }

        if (profiles.length) {
            html += "</div>";
        }

        element.innerHTML = html;
        $(".btnDeleteProfile", element).on("click", function () {
            var id = this.getAttribute("data-profileid");
            deleteProfile(page, id);
        });
    }

    function deleteProfile(page, id) {
        require(["confirm"], function (confirm) {
            confirm(globalize.translate("MessageConfirmProfileDeletion"), globalize.translate("HeaderConfirmProfileDeletion")).then(function () {
                loading.show();
                ApiClient.ajax({
                    type: "DELETE",
                    url: ApiClient.getUrl("Dlna/Profiles/" + id)
                }).then(function () {
                    loading.hide();
                    loadProfiles(page);
                });
            });
        });
    }

    function getTabs() {
        return [{
            href: "dlnasettings.html",
            name: globalize.translate("TabSettings")
        }, {
            href: "dlnaprofiles.html",
            name: globalize.translate("TabProfiles")
        }];
    }

    $(document).on("pageshow", "#dlnaProfilesPage", function () {
        libraryMenu.setTabs("dlna", 1, getTabs);
        loadProfiles(this);
    });
});
