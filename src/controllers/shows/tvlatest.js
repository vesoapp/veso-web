define(["loading", "components/groupedcards", "cardBuilder", "apphost", "imageLoader"], function(loading, groupedcards, cardBuilder, appHost, imageLoader) {
    "use strict";

    function getLatestPromise(context, params) {
        loading.show();
        var userId = ApiClient.getCurrentUserId(),
            parentId = params.topParentId,
            options = {
                IncludeItemTypes: "Episode",
                Limit: 30,
                Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
                ParentId: parentId,
                ImageTypeLimit: 1,
                EnableImageTypes: "Primary,Backdrop,Thumb"
            };
        return ApiClient.getJSON(ApiClient.getUrl("Users/" + userId + "/Items/Latest", options))
    }

    function loadLatest(context, params, promise) {
        promise.then(function(items) {
            var html = "";
            appHost.supports("imageanalysis");
            html += cardBuilder.getCardsHtml({
                items: items,
                shape: "backdrop",
                preferThumb: !0,
                showTitle: !0,
                showSeriesYear: !0,
                showParentTitle: !0,
                overlayText: !1,
                cardLayout: !1,
                showUnplayedIndicator: !1,
                showChildCountIndicator: !0,
                centerText: !0,
                lazy: !0,
                overlayPlayButton: !0,
                lines: 2
            });
            var elem = context.querySelector("#latestEpisodes");
            elem.innerHTML = html, imageLoader.lazyChildren(elem), loading.hide()
        })
    }
    return function(view, params, tabContent) {
        var self = this;
        var latestPromise;
        self.preRender = function() {
            latestPromise = getLatestPromise(view, params)
        }, self.renderTab = function() {
            loadLatest(tabContent, params, latestPromise)
        }, tabContent.querySelector("#latestEpisodes").addEventListener("click", groupedcards.onItemsContainerClick)
    }
});