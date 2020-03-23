define(["jQuery", "loading", "emby-checkbox", "listViewStyle", "emby-input", "emby-select", "emby-button", "flexStyles"], function ($, loading) {
    "use strict";

    return function (page, providerId, options) {
        function reload() {
            loading.show();
            ApiClient.getNamedConfiguration("livetv").then(function (config) {
                var info = config.ListingProviders.filter(function (i) {
                    return i.Id === providerId;
                })[0] || {};
                listingsId = info.ListingsId;
                $("#selectListing", page).val(info.ListingsId || "");
                page.querySelector(".txtUser").value = info.Username || "";
                page.querySelector(".txtPass").value = "";
                page.querySelector(".txtZipCode").value = info.ZipCode || "";

                if (info.Username && info.Password) {
                    page.querySelector(".listingsSection").classList.remove("hide");
                } else {
                    page.querySelector(".listingsSection").classList.add("hide");
                }

                page.querySelector(".chkAllTuners").checked = info.EnableAllTuners;

                if (info.EnableAllTuners) {
                    page.querySelector(".selectTunersSection").classList.add("hide");
                } else {
                    page.querySelector(".selectTunersSection").classList.remove("hide");
                }

                setCountry(info);
                refreshTunerDevices(page, info, config.TunerHosts);
            });
        }

        function setCountry(info) {
            ApiClient.getJSON(ApiClient.getUrl("LiveTv/ListingProviders/SchedulesDirect/Countries")).then(function (result) {
                var i;
                var length;
                var countryList = [];

                for (var region in result) {
                    var countries = result[region];

                    if (countries.length && "ZZZ" !== region) {
                        for (i = 0, length = countries.length; i < length; i++) {
                            countryList.push({
                                name: countries[i].fullName,
                                value: countries[i].shortName
                            });
                        }
                    }
                }

                countryList.sort(function (a, b) {
                    if (a.name > b.name) {
                        return 1;
                    }

                    if (a.name < b.name) {
                        return -1;
                    }

                    return 0;
                });
                $("#selectCountry", page).html(countryList.map(function (c) {
                    return '<option value="' + c.value + '">' + c.name + "</option>";
                }).join("")).val(info.Country || "");
                $(page.querySelector(".txtZipCode")).trigger("change");
            }, function () { // ApiClient.getJSON() error handler
                Dashboard.alert({
                    message: Globalize.translate("ErrorGettingTvLineups")
                });
            });
            loading.hide();
        }

        function sha256(str) {
            if (!self.TextEncoder) {
                return Promise.resolve("");
            }

            var buffer = new TextEncoder("utf-8").encode(str);
            return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
                return hex(hash);
            });
        }

        function hex(buffer) {
            var hexCodes = [];
            var view = new DataView(buffer);

            for (var i = 0; i < view.byteLength; i += 4) {
                var value = view.getUint32(i);
                var stringValue = value.toString(16);
                var paddedValue = ("00000000" + stringValue).slice(-"00000000".length);
                hexCodes.push(paddedValue);
            }

            return hexCodes.join("");
        }

        function submitLoginForm() {
            loading.show();
            sha256(page.querySelector(".txtPass").value).then(function (passwordHash) {
                var info = {
                    Type: "SchedulesDirect",
                    Username: page.querySelector(".txtUser").value,
                    EnableAllTuners: true,
                    Password: passwordHash,
                    Pw: page.querySelector(".txtPass").value
                };
                var id = providerId;

                if (id) {
                    info.Id = id;
                }

                ApiClient.ajax({
                    type: "POST",
                    url: ApiClient.getUrl("LiveTv/ListingProviders", {
                        ValidateLogin: true
                    }),
                    data: JSON.stringify(info),
                    contentType: "application/json",
                    dataType: "json"
                }).then(function (result) {
                    Dashboard.processServerConfigurationUpdateResult();
                    providerId = result.Id;
                    reload();
                }, function () {
                    Dashboard.alert({ // ApiClient.ajax() error handler
                        message: Globalize.translate("ErrorSavingTvProvider")
                    });
                });
            });
        }

        function submitListingsForm() {
            var selectedListingsId = $("#selectListing", page).val();

            if (!selectedListingsId) {
                return void Dashboard.alert({
                    message: Globalize.translate("ErrorPleaseSelectLineup")
                });
            }

            loading.show();
            var id = providerId;
            ApiClient.getNamedConfiguration("livetv").then(function (config) {
                var info = config.ListingProviders.filter(function (i) {
                    return i.Id === id;
                })[0];
                info.ZipCode = page.querySelector(".txtZipCode").value;
                info.Country = $("#selectCountry", page).val();
                info.ListingsId = selectedListingsId;
                info.EnableAllTuners = page.querySelector(".chkAllTuners").checked;
                info.EnabledTuners = info.EnableAllTuners ? [] : $(".chkTuner", page).get().filter(function (i) {
                    return i.checked;
                }).map(function (i) {
                    return i.getAttribute("data-id");
                });
                ApiClient.ajax({
                    type: "POST",
                    url: ApiClient.getUrl("LiveTv/ListingProviders", {
                        ValidateListings: true
                    }),
                    data: JSON.stringify(info),
                    contentType: "application/json"
                }).then(function (result) {
                    loading.hide();

                    if (options.showConfirmation) {
                        Dashboard.processServerConfigurationUpdateResult();
                    }

                    Events.trigger(self, "submitted");
                }, function () {
                    loading.hide();
                    Dashboard.alert({
                        message: Globalize.translate("ErrorAddingListingsToSchedulesDirect")
                    });
                });
            });
        }

        function refreshListings(value) {
            if (!value) {
                return void $("#selectListing", page).html("");
            }

            loading.show();
            ApiClient.ajax({
                type: "GET",
                url: ApiClient.getUrl("LiveTv/ListingProviders/Lineups", {
                    Id: providerId,
                    Location: value,
                    Country: $("#selectCountry", page).val()
                }),
                dataType: "json"
            }).then(function (result) {
                $("#selectListing", page).html(result.map(function (o) {
                    return '<option value="' + o.Id + '">' + o.Name + "</option>";
                }));

                if (listingsId) {
                    $("#selectListing", page).val(listingsId);
                }

                loading.hide();
            }, function (result) {
                Dashboard.alert({
                    message: Globalize.translate("ErrorGettingTvLineups")
                });
                refreshListings("");
                loading.hide();
            });
        }

        function getTunerName(providerId) {
            switch (providerId = providerId.toLowerCase()) {
                case "m3u":
                    return "M3U Playlist";
                case "hdhomerun":
                    return "HDHomerun";
                case "satip":
                    return "DVB";
                default:
                    return "Unknown";
            }
        }

        function refreshTunerDevices(page, providerInfo, devices) {
            var html = "";

            for (var i = 0, length = devices.length; i < length; i++) {
                var device = devices[i];
                html += '<div class="listItem">';
                var enabledTuners = providerInfo.EnabledTuners || [];
                var isChecked = providerInfo.EnableAllTuners || -1 !== enabledTuners.indexOf(device.Id);
                var checkedAttribute = isChecked ? " checked" : "";
                html += '<label class="checkboxContainer listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" data-id="' + device.Id + '" class="chkTuner" ' + checkedAttribute + "/><span></span></label>";
                html += '<div class="listItemBody two-line">';
                html += '<div class="listItemBodyText">';
                html += device.FriendlyName || getTunerName(device.Type);
                html += "</div>";
                html += '<div class="listItemBodyText secondary">';
                html += device.Url;
                html += "</div>";
                html += "</div>";
                html += "</div>";
            }

            page.querySelector(".tunerList").innerHTML = html;
        }

        var listingsId;
        var self = this;

        self.submit = function () {
            page.querySelector(".btnSubmitListingsContainer").click();
        };

        self.init = function () {
            options = options || {};

            // Only hide the buttons if explicitly set to false; default to showing if undefined or null
            // FIXME: rename this option to clarify logic
            var hideCancelButton = options.showCancelButton === false;
            page.querySelector(".btnCancel").classList.toggle("hide", hideCancelButton);

            var hideSubmitButton = options.showSubmitButton === false;
            page.querySelector(".btnSubmitListings").classList.toggle("hide", hideSubmitButton);

            $(".formLogin", page).on("submit", function () {
                submitLoginForm();
                return false;
            });
            $(".formListings", page).on("submit", function () {
                submitListingsForm();
                return false;
            });
            $(".txtZipCode", page).on("change", function () {
                refreshListings(this.value);
            });
            page.querySelector(".chkAllTuners").addEventListener("change", function (e) {
                if (e.target.checked) {
                    page.querySelector(".selectTunersSection").classList.add("hide");
                } else {
                    page.querySelector(".selectTunersSection").classList.remove("hide");
                }
            });
            $(".createAccountHelp", page).html(Globalize.translate("MessageCreateAccountAt", '<a is="emby-linkbutton" class="button-link" href="http://www.schedulesdirect.org" target="_blank">http://www.schedulesdirect.org</a>'));
            reload();
        };
    };
});
