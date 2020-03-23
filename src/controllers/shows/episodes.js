define(["loading", "events", "libraryBrowser", "imageLoader", "listView", "cardBuilder", "emby-itemscontainer"], function (loading, events, libraryBrowser, imageLoader, listView, cardBuilder) {
    "use strict";

    return function (view, params, tabContent) {
        function getPageData(context) {
            var key = getSavedQueryKey(context);
            var pageData = data[key];

            if (!pageData) {
                pageData = data[key] = {
                    query: {
                        SortBy: "SeriesSortName,SortName",
                        SortOrder: "Ascending",
                        IncludeItemTypes: "Episode",
                        Recursive: true,
                        Fields: "PrimaryImageAspectRatio,MediaSourceCount,UserData",
                        IsMissing: false,
                        ImageTypeLimit: 1,
                        EnableImageTypes: "Primary,Backdrop,Thumb",
                        StartIndex: 0,
                        Limit: pageSize
                    },
                    view: libraryBrowser.getSavedView(key) || "Poster"
                };
                pageData.query.ParentId = params.topParentId;
                libraryBrowser.loadSavedQueryValues(key, pageData.query);
            }

            return pageData;
        }

        function getQuery(context) {
            return getPageData(context).query;
        }

        function getSavedQueryKey(context) {
            if (!context.savedQueryKey) {
                context.savedQueryKey = libraryBrowser.getSavedQueryKey("episodes");
            }

            return context.savedQueryKey;
        }

        function onViewStyleChange() {
            var viewStyle = self.getCurrentViewStyle();
            var itemsContainer = tabContent.querySelector(".itemsContainer");

            if ("List" == viewStyle) {
                itemsContainer.classList.add("vertical-list");
                itemsContainer.classList.remove("vertical-wrap");
            } else {
                itemsContainer.classList.remove("vertical-list");
                itemsContainer.classList.add("vertical-wrap");
            }

            itemsContainer.innerHTML = "";
        }

        function reloadItems(page) {
            loading.show();
            isLoading = true;
            var query = getQuery(page);
            ApiClient.getItems(Dashboard.getCurrentUserId(), query).then(function (result) {
                function onNextPageClick() {
                    if (isLoading) {
                        return;
                    }

                    query.StartIndex += query.Limit;
                    reloadItems(tabContent);
                }

                function onPreviousPageClick() {
                    if (isLoading) {
                        return;
                    }

                    query.StartIndex -= query.Limit;
                    reloadItems(tabContent);
                }

                window.scrollTo(0, 0);
                var html;
                var pagingHtml = libraryBrowser.getQueryPagingHtml({
                    startIndex: query.StartIndex,
                    limit: query.Limit,
                    totalRecordCount: result.TotalRecordCount,
                    showLimit: false,
                    updatePageSizeSetting: false,
                    addLayoutButton: false,
                    sortButton: false,
                    filterButton: false
                });
                var viewStyle = self.getCurrentViewStyle();
                var itemsContainer = tabContent.querySelector(".itemsContainer");
                if (viewStyle == "List") {
                    html = listView.getListViewHtml({
                        items: result.Items,
                        sortBy: query.SortBy,
                        showParentTitle: true
                    });
                } else if (viewStyle == "PosterCard") {
                    html = cardBuilder.getCardsHtml({
                        items: result.Items,
                        shape: "backdrop",
                        showTitle: true,
                        showParentTitle: true,
                        scalable: true,
                        cardLayout: true
                    });
                } else {
                    html = cardBuilder.getCardsHtml({
                        items: result.Items,
                        shape: "backdrop",
                        showTitle: true,
                        showParentTitle: true,
                        overlayText: false,
                        centerText: true,
                        scalable: true,
                        overlayPlayButton: true
                    });
                }
                var i;
                var length;
                var elems;

                elems = tabContent.querySelectorAll(".paging");
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].innerHTML = pagingHtml;
                }

                elems = tabContent.querySelectorAll(".btnNextPage");
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener("click", onNextPageClick);
                }

                elems = tabContent.querySelectorAll(".btnPreviousPage");
                for (i = 0, length = elems.length; i < length; i++) {
                    elems[i].addEventListener("click", onPreviousPageClick);
                }

                itemsContainer.innerHTML = html;
                imageLoader.lazyChildren(itemsContainer);
                libraryBrowser.saveQueryValues(getSavedQueryKey(page), query);
                loading.hide();
                isLoading = false;

                require(["autoFocuser"], function (autoFocuser) {
                    autoFocuser.autoFocus(page);
                });
            });
        }

        var self = this;
        var pageSize = 100;
        var data = {};
        var isLoading = false;

        self.showFilterMenu = function () {
            require(["components/filterdialog/filterdialog"], function (filterDialogFactory) {
                var filterDialog = new filterDialogFactory({
                    query: getQuery(tabContent),
                    mode: "episodes",
                    serverId: ApiClient.serverId()
                });
                events.on(filterDialog, "filterchange", function () {
                    reloadItems(tabContent);
                });
                filterDialog.show();
            });
        };

        self.getCurrentViewStyle = function () {
            return getPageData(tabContent).view;
        };

        function initPage(tabContent) {
            tabContent.querySelector(".btnFilter").addEventListener("click", function () {
                self.showFilterMenu();
            });
            tabContent.querySelector(".btnSort").addEventListener("click", function (e) {
                libraryBrowser.showSortMenu({
                    items: [{
                        name: Globalize.translate("OptionNameSort"),
                        id: "SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionTvdbRating"),
                        id: "CommunityRating,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionDateAdded"),
                        id: "DateCreated,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionPremiereDate"),
                        id: "PremiereDate,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionDatePlayed"),
                        id: "DatePlayed,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionParentalRating"),
                        id: "OfficialRating,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionPlayCount"),
                        id: "PlayCount,SeriesSortName,SortName"
                    }, {
                        name: Globalize.translate("OptionRuntime"),
                        id: "Runtime,SeriesSortName,SortName"
                    }],
                    callback: function () {
                        reloadItems(tabContent);
                    },
                    query: getQuery(tabContent),
                    button: e.target
                });
            });
            var btnSelectView = tabContent.querySelector(".btnSelectView");
            btnSelectView.addEventListener("click", function (e) {
                libraryBrowser.showLayoutMenu(e.target, self.getCurrentViewStyle(), "List,Poster,PosterCard".split(","));
            });
            btnSelectView.addEventListener("layoutchange", function (e) {
                var viewStyle = e.detail.viewStyle;
                getPageData(tabContent).view = viewStyle;
                libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent), viewStyle);
                onViewStyleChange();
                reloadItems(tabContent);
            });
        }

        initPage(tabContent);
        onViewStyleChange();

        self.renderTab = function () {
            reloadItems(tabContent);
        };

        self.destroy = function () {};
    };
});
