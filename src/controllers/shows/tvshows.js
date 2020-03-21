define(["layoutManager", "loading", "events", "libraryBrowser", "imageLoader", "listView", "cardBuilder", "alphaPicker", "emby-itemscontainer"], function(layoutManager, loading, events, libraryBrowser, imageLoader, listView, cardBuilder, alphaPicker) {
    "use strict";
    return function(view, params, tabContent) {
        function getPageData(context) {
            var key = getSavedQueryKey(context),
                pageData = data[key];
            return pageData || (pageData = data[key] = {
                query: {
                    SortBy: "SortName",
                    SortOrder: "Ascending",
                    IncludeItemTypes: "Series",
                    Recursive: !0,
                    Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
                    ImageTypeLimit: 1,
                    EnableImageTypes: "Primary,Backdrop,Banner,Thumb",
                    StartIndex: 0,
                    Limit: pageSize
                },
                view: libraryBrowser.getSavedView(key) || "Poster"
            }, pageData.query.ParentId = params.topParentId, libraryBrowser.loadSavedQueryValues(key, pageData.query)), pageData
        }

        function getQuery(context) {
            return getPageData(context).query
        }

        function getSavedQueryKey(context) {
            return context.savedQueryKey || (context.savedQueryKey = libraryBrowser.getSavedQueryKey("series")), context.savedQueryKey
        }

        function onViewStyleChange() {
            var viewStyle = self.getCurrentViewStyle(),
                itemsContainer = tabContent.querySelector(".itemsContainer");
            "List" == viewStyle ? (itemsContainer.classList.add("vertical-list"), itemsContainer.classList.remove("vertical-wrap")) : (itemsContainer.classList.remove("vertical-list"), itemsContainer.classList.add("vertical-wrap")), itemsContainer.innerHTML = ""
        }

        function reloadItems(page) {
            loading.show();
            isLoading = true;
            var query = getQuery(page);
            ApiClient.getItems(ApiClient.getCurrentUserId(), query).then(function(result) {
                function onNextPageClick() {
                    if (isLoading) return;
                    query.StartIndex += query.Limit;
                    reloadItems(tabContent);
                }

                function onPreviousPageClick() {
                    if (isLoading) return;
                    query.StartIndex -= query.Limit;
                    reloadItems(tabContent);
                }
                window.scrollTo(0, 0), updateFilterControls(page);
                var html, pagingHtml = libraryBrowser.getQueryPagingHtml({
                        startIndex: query.StartIndex,
                        limit: query.Limit,
                        totalRecordCount: result.TotalRecordCount,
                        showLimit: !1,
                        updatePageSizeSetting: !1,
                        addLayoutButton: !1,
                        sortButton: !1,
                        filterButton: !1
                    }),
                    viewStyle = self.getCurrentViewStyle();
                html = "Thumb" == viewStyle ? cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: !0,
                    context: "tvshows",
                    overlayMoreButton: !0,
                    showTitle: !0,
                    centerText: !0
                }) : "ThumbCard" == viewStyle ? cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: !0,
                    context: "tvshows",
                    cardLayout: !0,
                    showTitle: !0,
                    showYear: !0,
                    centerText: !0
                }) : "Banner" == viewStyle ? cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: "banner",
                    preferBanner: !0,
                    context: "tvshows"
                }) : "List" == viewStyle ? listView.getListViewHtml({
                    items: result.Items,
                    context: "tvshows",
                    sortBy: query.SortBy
                }) : "PosterCard" == viewStyle ? cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: "portrait",
                    context: "tvshows",
                    showTitle: !0,
                    showYear: !0,
                    centerText: !0,
                    cardLayout: !0
                }) : cardBuilder.getCardsHtml({
                    items: result.Items,
                    shape: "portrait",
                    context: "tvshows",
                    centerText: !0,
                    lazy: !0,
                    overlayMoreButton: !0,
                    showTitle: !0,
                    showYear: !0
                });
                var i, length, elems = tabContent.querySelectorAll(".paging");
                for (i = 0, length = elems.length; i < length; i++) elems[i].innerHTML = pagingHtml;
                for (elems = tabContent.querySelectorAll(".btnNextPage"), i = 0, length = elems.length; i < length; i++) elems[i].addEventListener("click", onNextPageClick);
                for (elems = tabContent.querySelectorAll(".btnPreviousPage"), i = 0, length = elems.length; i < length; i++) elems[i].addEventListener("click", onPreviousPageClick);
                var itemsContainer = tabContent.querySelector(".itemsContainer");
                itemsContainer.innerHTML = html;
                imageLoader.lazyChildren(itemsContainer);
                libraryBrowser.saveQueryValues(getSavedQueryKey(page), query);
                loading.hide();
                isLoading = false;
            })
        }

        function updateFilterControls(tabContent) {
            var query = getQuery(tabContent);
            self.alphaPicker.value(query.NameStartsWithOrGreater)
        }
        var self = this,
            pageSize = 100,
            data = {},
            isLoading = false;
        self.showFilterMenu = function() {
                require(["components/filterdialog/filterdialog"], function(filterDialogFactory) {
                    var filterDialog = new filterDialogFactory({
                        query: getQuery(tabContent),
                        mode: "series",
                        serverId: ApiClient.serverId()
                    });
                    events.on(filterDialog, "filterchange", function() {
                        getQuery(tabContent).StartIndex = 0, reloadItems(tabContent)
                    }), filterDialog.show()
                })
            }, self.getCurrentViewStyle = function() {
                return getPageData(tabContent).view
            },
            function(tabContent) {
                var alphaPickerElement = tabContent.querySelector(".alphaPicker");
                if (alphaPickerElement.addEventListener("alphavaluechanged", function(e) {
                        var newValue = e.detail.value,
                            query = getQuery(tabContent);
                        query.NameStartsWithOrGreater = newValue, query.StartIndex = 0, reloadItems(tabContent)
                    }), self.alphaPicker = new alphaPicker({
                        element: alphaPickerElement,
                        valueChangeEvent: "click"
                    }), layoutManager.desktop || layoutManager.mobile) {
                    tabContent.querySelector(".alphaPicker").classList.add("alphabetPicker-right");
                    var itemsContainer = tabContent.querySelector(".itemsContainer");
                    itemsContainer.classList.remove("padded-left-withalphapicker"), itemsContainer.classList.add("padded-right-withalphapicker")
                }
                tabContent.querySelector(".btnFilter").addEventListener("click", function() {
                    self.showFilterMenu()
                }), tabContent.querySelector(".btnSort").addEventListener("click", function(e) {
                    libraryBrowser.showSortMenu({
                        items: [{
                            name: Globalize.translate("OptionNameSort"),
                            id: "SortName"
                        }, {
                            name: Globalize.translate("OptionImdbRating"),
                            id: "CommunityRating,SortName"
                        }, {
                            name: Globalize.translate("OptionDateAdded"),
                            id: "DateCreated,SortName"
                        }, {
                            name: Globalize.translate("OptionDatePlayed"),
                            id: "DatePlayed,SortName"
                        }, {
                            name: Globalize.translate("OptionParentalRating"),
                            id: "OfficialRating,SortName"
                        }, {
                            name: Globalize.translate("OptionReleaseDate"),
                            id: "PremiereDate,SortName"
                        }],
                        callback: function() {
                            getQuery(tabContent).StartIndex = 0, reloadItems(tabContent)
                        },
                        query: getQuery(tabContent),
                        button: e.target
                    })
                });
                var btnSelectView = tabContent.querySelector(".btnSelectView");
                btnSelectView.addEventListener("click", function(e) {
                    libraryBrowser.showLayoutMenu(e.target, self.getCurrentViewStyle(), "Banner,List,Poster,PosterCard,Thumb,ThumbCard".split(","))
                }), btnSelectView.addEventListener("layoutchange", function(e) {
                    var viewStyle = e.detail.viewStyle;
                    getPageData(tabContent).view = viewStyle, libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent), viewStyle), getQuery(tabContent).StartIndex = 0, onViewStyleChange(), reloadItems(tabContent)
                })
            }(tabContent), onViewStyleChange(), self.renderTab = function() {
                reloadItems(tabContent), updateFilterControls(tabContent)
            }, self.destroy = function() {}
    }
});
