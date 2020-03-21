define(["layoutManager", "loading", "libraryBrowser", "cardBuilder", "lazyLoader", "apphost", "globalize", "appRouter", "dom", "emby-button"], function(layoutManager, loading, libraryBrowser, cardBuilder, lazyLoader, appHost, globalize, appRouter, dom) {
    "use strict";
    return function(view, params, tabContent) {
        function getPageData() {
            var key = getSavedQueryKey(),
                pageData = data[key];
            return pageData || (pageData = data[key] = {
                query: {
                    SortBy: "SortName",
                    SortOrder: "Ascending",
                    IncludeItemTypes: "Series",
                    Recursive: !0,
                    EnableTotalRecordCount: !1
                },
                view: "Poster"
            }, pageData.query.ParentId = params.topParentId, libraryBrowser.loadSavedQueryValues(key, pageData.query)), pageData
        }

        function getQuery() {
            return getPageData().query
        }

        function getSavedQueryKey() {
            return libraryBrowser.getSavedQueryKey("seriesgenres")
        }

        function getPromise() {
            loading.show();
            var query = getQuery();
            return ApiClient.getGenres(ApiClient.getCurrentUserId(), query)
        }

        function enableScrollX() {
            return !layoutManager.desktop
        }

        function getThumbShape() {
            return enableScrollX() ? "overflowBackdrop" : "backdrop"
        }

        function getPortraitShape() {
            return enableScrollX() ? "overflowPortrait" : "portrait"
        }

        function fillItemsContainer(elem) {
            var id = elem.getAttribute("data-id"),
                viewStyle = self.getCurrentViewStyle(),
                limit = "Thumb" == viewStyle || "ThumbCard" == viewStyle ? 5 : 9;
            enableScrollX() && (limit = 10);
            var enableImageTypes = "Thumb" == viewStyle || "ThumbCard" == viewStyle ? "Primary,Backdrop,Thumb" : "Primary",
                query = {
                    SortBy: "SortName",
                    SortOrder: "Ascending",
                    IncludeItemTypes: "Series",
                    Recursive: !0,
                    Fields: "PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo",
                    ImageTypeLimit: 1,
                    EnableImageTypes: enableImageTypes,
                    Limit: limit,
                    GenreIds: id,
                    EnableTotalRecordCount: !1,
                    ParentId: params.topParentId
                };
            ApiClient.getItems(ApiClient.getCurrentUserId(), query).then(function(result) {
                var supportsImageAnalysis = appHost.supports("imageanalysis");
                "Thumb" == viewStyle ? cardBuilder.buildCards(result.Items, {
                    itemsContainer: elem,
                    shape: getThumbShape(),
                    preferThumb: !0,
                    showTitle: !0,
                    scalable: !0,
                    centerText: !0,
                    overlayMoreButton: !0,
                    allowBottomPadding: !1
                }) : "ThumbCard" == viewStyle ? cardBuilder.buildCards(result.Items, {
                    itemsContainer: elem,
                    shape: getThumbShape(),
                    preferThumb: !0,
                    showTitle: !0,
                    scalable: !0,
                    centerText: !1,
                    cardLayout: !0,
                    showYear: !0
                }) : "PosterCard" == viewStyle ? cardBuilder.buildCards(result.Items, {
                    itemsContainer: elem,
                    shape: getPortraitShape(),
                    showTitle: !0,
                    scalable: !0,
                    centerText: !1,
                    cardLayout: !0,
                    showYear: !0
                }) : "Poster" == viewStyle && cardBuilder.buildCards(result.Items, {
                    itemsContainer: elem,
                    shape: getPortraitShape(),
                    scalable: !0,
                    overlayMoreButton: !0,
                    allowBottomPadding: !1
                }), result.Items.length >= query.Limit && tabContent.querySelector(".btnMoreFromGenre" + id + " i").classList.remove("hide")
            })
        }

        function reloadItems(context, promise) {
            var query = getQuery();
            promise.then(function(result) {
                for (var elem = context.querySelector("#items"), html = "", items = result.Items, i = 0, length = items.length; i < length; i++) {
                    var item = items[i];
                    if (html += '<div class="verticalSection">', html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">', html += '<a is="emby-linkbutton" href="' + appRouter.getRouteUrl(item, {
                            context: "tvshows",
                            parentId: params.topParentId
                        }) + '" class="more button-flat button-flat-mini sectionTitleTextButton btnMoreFromGenre' + item.Id + '">', html += '<h2 class="sectionTitle sectionTitle-cards">', html += item.Name, html += "</h2>", html += '<i class="md-icon hide">&#xE5CC;</i>', html += "</a>", html += "</div>", enableScrollX()) {
                        var scrollXClass = "scrollX hiddenScrollX";
                        layoutManager.tv && (scrollXClass += " smoothScrollX"), html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' lazy padded-left padded-right" data-id="' + item.Id + '">'
                    } else html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap lazy padded-left padded-right" data-id="' + item.Id + '">';
                    html += "</div>", html += "</div>"
                }
                elem.innerHTML = html, lazyLoader.lazyChildren(elem, fillItemsContainer), libraryBrowser.saveQueryValues(getSavedQueryKey(), query), loading.hide()
            })
        }

        function fullyReload() {
            self.preRender(), self.renderTab()
        }
        var self = this,
            data = {};
        self.getViewStyles = function() {
            return "Poster,PosterCard,Thumb,ThumbCard".split(",")
        }, self.getCurrentViewStyle = function() {
            return getPageData(tabContent).view
        }, self.setCurrentViewStyle = function(viewStyle) {
            getPageData(tabContent).view = viewStyle, libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent), viewStyle), fullyReload()
        }, self.enableViewSelection = !0;
        var promise;
        self.preRender = function() {
            promise = getPromise()
        }, self.renderTab = function() {
            reloadItems(tabContent, promise)
        }
    }
});