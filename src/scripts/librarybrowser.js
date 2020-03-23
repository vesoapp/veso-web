define(["userSettings"], function (userSettings) {
    "use strict";

    var libraryBrowser = {
        getSavedQueryKey: function (modifier) {
            return window.location.href.split("#")[0] + (modifier || "");
        },
        loadSavedQueryValues: function (key, query) {
            var values = userSettings.get(key);

            if (values) {
                values = JSON.parse(values);
                return Object.assign(query, values);
            }

            return query;
        },
        saveQueryValues: function (key, query) {
            var values = {};

            if (query.SortBy) {
                values.SortBy = query.SortBy;
            }

            if (query.SortOrder) {
                values.SortOrder = query.SortOrder;
            }

            userSettings.set(key, JSON.stringify(values));
        },
        saveViewSetting: function (key, value) {
            userSettings.set(key + "-_view", value);
        },
        getSavedView: function (key) {
            return userSettings.get(key + "-_view");
        },
        showLayoutMenu: function (button, currentLayout, views) {
            var dispatchEvent = true;

            if (!views) {
                dispatchEvent = false;
                views = button.getAttribute("data-layouts");
                views = views ? views.split(",") : ["List", "Poster", "PosterCard", "Thumb", "ThumbCard"];
            }

            var menuItems = views.map(function (v) {
                return {
                    name: Globalize.translate("Option" + v),
                    id: v,
                    selected: currentLayout == v
                };
            });

            require(["actionsheet"], function (actionsheet) {
                actionsheet.show({
                    items: menuItems,
                    positionTo: button,
                    callback: function (id) {
                        button.dispatchEvent(new CustomEvent("layoutchange", {
                            detail: {
                                viewStyle: id
                            },
                            bubbles: true,
                            cancelable: false
                        }));

                        if (!dispatchEvent) {
                            if (window.$) {
                                $(button).trigger("layoutchange", [id]);
                            }
                        }
                    }
                });
            });
        },
        getQueryPagingHtml: function (options) {
            var startIndex = options.startIndex;
            var limit = options.limit;
            var totalRecordCount = options.totalRecordCount;
            var html = "";
            var recordsEnd = Math.min(startIndex + limit, totalRecordCount);
            var showControls = limit < totalRecordCount;

            if (html += '<div class="listPaging">', showControls) {
                html += '<span style="vertical-align:middle;">';
                html += (totalRecordCount ? startIndex + 1 : 0) + "-" + recordsEnd + " of " + totalRecordCount;
                html += "</span>";
            }

            if (showControls || options.viewButton || options.filterButton || options.sortButton || options.addLayoutButton) {
                html += '<div style="display:inline-block;">';

                if (showControls) {
                    html += '<button is="paper-icon-button-light" class="btnPreviousPage autoSize" ' + (startIndex ? "" : "disabled") + '><i class="material-icons arrow_back"></i></button>';
                    html += '<button is="paper-icon-button-light" class="btnNextPage autoSize" ' + (startIndex + limit >= totalRecordCount ? "disabled" : "") + '><i class="material-icons arrow_forward"></i></button>';
                }

                if (options.addLayoutButton) {
                    html += '<button is="paper-icon-button-light" title="' + Globalize.translate("ButtonSelectView") + '" class="btnChangeLayout autoSize" data-layouts="' + (options.layouts || "") + '" onclick="LibraryBrowser.showLayoutMenu(this, \'' + (options.currentLayout || "") + '\');"><i class="material-icons view_comfy"></i></button>';
                }

                if (options.sortButton) {
                    html += '<button is="paper-icon-button-light" class="btnSort autoSize" title="' + Globalize.translate("ButtonSort") + '"><i class="material-icons sort_by_alpha"></i></button>';
                }

                if (options.filterButton) {
                    html += '<button is="paper-icon-button-light" class="btnFilter autoSize" title="' + Globalize.translate("ButtonFilter") + '"><i class="material-icons filter_list"></i></button>';
                }

                html += "</div>";
            }

            return html += "</div>";
        },
        showSortMenu: function (options) {
            require(["dialogHelper", "emby-radio"], function (dialogHelper) {
                function onSortByChange() {
                    var newValue = this.value;

                    if (this.checked) {
                        var changed = options.query.SortBy != newValue;
                        options.query.SortBy = newValue.replace("_", ",");
                        options.query.StartIndex = 0;

                        if (options.callback && changed) {
                            options.callback();
                        }
                    }
                }

                function onSortOrderChange() {
                    var newValue = this.value;

                    if (this.checked) {
                        var changed = options.query.SortOrder != newValue;
                        options.query.SortOrder = newValue;
                        options.query.StartIndex = 0;

                        if (options.callback && changed) {
                            options.callback();
                        }
                    }
                }

                var dlg = dialogHelper.createDialog({
                    removeOnClose: true,
                    modal: false,
                    entryAnimationDuration: 160,
                    exitAnimationDuration: 200
                });
                dlg.classList.add("ui-body-a");
                dlg.classList.add("background-theme-a");
                dlg.classList.add("formDialog");
                var html = "";
                html += '<div style="margin:0;padding:1.25em 1.5em 1.5em;">';
                html += '<h2 style="margin:0 0 .5em;">';
                html += Globalize.translate("HeaderSortBy");
                html += "</h2>";
                var i;
                var length;
                var isChecked;
                html += '<div>';
                for (i = 0, length = options.items.length; i < length; i++) {
                    var option = options.items[i];
                    var radioValue = option.id.replace(",", "_");
                    isChecked = (options.query.SortBy || "").replace(",", "_") == radioValue ? " checked" : "";
                    html += '<label class="radio-label-block"><input type="radio" is="emby-radio" name="SortBy" data-id="' + option.id + '" value="' + radioValue + '" class="menuSortBy" ' + isChecked + " /><span>" + option.name + "</span></label>";
                }

                html += "</div>";
                html += '<h2 style="margin: 1em 0 .5em;">';
                html += Globalize.translate("HeaderSortOrder");
                html += "</h2>";
                html += "<div>";
                isChecked = "Ascending" == options.query.SortOrder ? " checked" : "";
                html += '<label class="radio-label-block"><input type="radio" is="emby-radio" name="SortOrder" value="Ascending" class="menuSortOrder" ' + isChecked + " /><span>" + Globalize.translate("OptionAscending") + "</span></label>";
                isChecked = "Descending" == options.query.SortOrder ? " checked" : "";
                html += '<label class="radio-label-block"><input type="radio" is="emby-radio" name="SortOrder" value="Descending" class="menuSortOrder" ' + isChecked + " /><span>" + Globalize.translate("OptionDescending") + "</span></label>";
                html += "</div>";
                html += "</div>";
                dlg.innerHTML = html;
                dialogHelper.open(dlg);
                var sortBys = dlg.querySelectorAll(".menuSortBy");

                for (i = 0, length = sortBys.length; i < length; i++) {
                    sortBys[i].addEventListener("change", onSortByChange);
                }

                var sortOrders = dlg.querySelectorAll(".menuSortOrder");

                for (i = 0, length = sortOrders.length; i < length; i++) {
                    sortOrders[i].addEventListener("change", onSortOrderChange);
                }
            });
        }
    };
    window.LibraryBrowser = libraryBrowser;
    return libraryBrowser;
});
