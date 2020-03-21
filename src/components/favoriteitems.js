define(["loading", "libraryBrowser", "cardBuilder", "dom", "apphost", "imageLoader", "globalize", "layoutManager", "scrollStyles", "emby-itemscontainer"], function(loading, libraryBrowser, cardBuilder, dom, appHost, imageLoader, globalize, layoutManager) {
    "use strict";

    function enableScrollX() {
        return !layoutManager.desktop
    }

    function getThumbShape() {
        return enableScrollX() ? "overflowBackdrop" : "backdrop"
    }

    function getPosterShape() {
        return enableScrollX() ? "overflowPortrait" : "portrait"
    }

    function getSquareShape() {
        return enableScrollX() ? "overflowSquare" : "square"
    }

    function getSections() {
        return [{
            name: "HeaderFavoriteMovies",
            types: "Movie",
            id: "favoriteMovies",
            shape: getPosterShape(),
            showTitle: !1,
            overlayPlayButton: !0
        }, {
            name: "HeaderFavoriteShows",
            types: "Series",
            id: "favoriteShows",
            shape: getPosterShape(),
            showTitle: !1,
            overlayPlayButton: !0
        }, {
            name: "HeaderFavoriteEpisodes",
            types: "Episode",
            id: "favoriteEpisode",
            shape: getThumbShape(),
            preferThumb: !1,
            showTitle: !0,
            showParentTitle: !0,
            overlayPlayButton: !0,
            overlayText: !1,
            centerText: !0
        }, {
            name: "HeaderFavoriteVideos",
            types: "Video,MusicVideo",
            id: "favoriteVideos",
            shape: getThumbShape(),
            preferThumb: !0,
            showTitle: !0,
            overlayPlayButton: !0,
            overlayText: !1,
            centerText: !0
        }, {
            name: "HeaderFavoriteArtists",
            types: "MusicArtist",
            id: "favoriteArtists",
            shape: getSquareShape(),
            preferThumb: !1,
            showTitle: !0,
            overlayText: !1,
            showParentTitle: !1,
            centerText: !0,
            overlayPlayButton: !0,
            coverImage: !0
        }, {
            name: "HeaderFavoriteAlbums",
            types: "MusicAlbum",
            id: "favoriteAlbums",
            shape: getSquareShape(),
            preferThumb: !1,
            showTitle: !0,
            overlayText: !1,
            showParentTitle: !0,
            centerText: !0,
            overlayPlayButton: !0,
            coverImage: !0
        }, {
            name: "HeaderFavoriteSongs",
            types: "Audio",
            id: "favoriteSongs",
            shape: getSquareShape(),
            preferThumb: !1,
            showTitle: !0,
            overlayText: !1,
            showParentTitle: !0,
            centerText: !0,
            overlayMoreButton: !0,
            action: "instantmix",
            coverImage: !0
        }]
    }

    function loadSection(elem, userId, topParentId, section, isSingleSection) {
        var screenWidth = dom.getWindowSize().innerWidth,
            options = {
                SortBy: "SortName",
                SortOrder: "Ascending",
                Filters: "IsFavorite",
                Recursive: !0,
                Fields: "PrimaryImageAspectRatio,BasicSyncInfo",
                CollapseBoxSetItems: !1,
                ExcludeLocationTypes: "Virtual",
                EnableTotalRecordCount: !1
            };
        topParentId && (options.ParentId = topParentId), isSingleSection || (options.Limit = screenWidth >= 1920 ? 10 : screenWidth >= 1440 ? 8 : 6, enableScrollX() && (options.Limit = 20));
        var promise;
        return "MusicArtist" === section.types ? promise = ApiClient.getArtists(userId, options) : (options.IncludeItemTypes = section.types, promise = ApiClient.getItems(userId, options)), promise.then(function(result) {
            var html = "";
            if (result.Items.length) {
                if (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">', !layoutManager.tv && options.Limit && result.Items.length >= options.Limit) {
                    html += '<a is="emby-linkbutton" href="' + ("list.html?serverId=" + ApiClient.serverId() + "&type=" + section.types + "&IsFavorite=true") + '" class="more button-flat button-flat-mini sectionTitleTextButton">', html += '<h2 class="sectionTitle sectionTitle-cards">', html += globalize.translate(section.name), html += "</h2>", html += '<i class="md-icon">&#xE5CC;</i>', html += "</a>"
                } else html += '<h2 class="sectionTitle sectionTitle-cards">' + globalize.translate(section.name) + "</h2>";
                if (html += "</div>", enableScrollX()) {
                    var scrollXClass = "scrollX hiddenScrollX";
                    layoutManager.tv && (scrollXClass += " smoothScrollX"), html += '<div is="emby-itemscontainer" class="itemsContainer ' + scrollXClass + ' padded-left padded-right">'
                } else html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">';
                var supportsImageAnalysis = appHost.supports("imageanalysis"),
                    cardLayout = (appHost.preferVisualCards || supportsImageAnalysis) && section.autoCardLayout && section.showTitle;
                cardLayout = !1, html += cardBuilder.getCardsHtml(result.Items, {
                    preferThumb: section.preferThumb,
                    shape: section.shape,
                    centerText: section.centerText && !cardLayout,
                    overlayText: !1 !== section.overlayText,
                    showTitle: section.showTitle,
                    showParentTitle: section.showParentTitle,
                    scalable: !0,
                    coverImage: section.coverImage,
                    overlayPlayButton: section.overlayPlayButton,
                    overlayMoreButton: section.overlayMoreButton && !cardLayout,
                    action: section.action,
                    allowBottomPadding: !enableScrollX(),
                    cardLayout: cardLayout
                }), html += "</div>"
            }
            elem.innerHTML = html, imageLoader.lazyChildren(elem)
        })
    }

    function loadSections(page, userId, topParentId, types) {
        loading.show();
        var sections = getSections(),
            sectionid = getParameterByName("sectionid");
        sectionid && (sections = sections.filter(function(s) {
            return s.id === sectionid
        })), types && (sections = sections.filter(function(s) {
            return -1 !== types.indexOf(s.id)
        }));
        var i, length, elem = page.querySelector(".favoriteSections");
        if (!elem.innerHTML) {
            var html = "";
            for (i = 0, length = sections.length; i < length; i++) html += '<div class="verticalSection section' + sections[i].id + '"></div>';
            elem.innerHTML = html
        }
        var promises = [];
        for (i = 0, length = sections.length; i < length; i++) {
            var section = sections[i];
            elem = page.querySelector(".section" + section.id), promises.push(loadSection(elem, userId, topParentId, section, 1 === sections.length))
        }
        Promise.all(promises).then(function() {
            loading.hide()
        })
    }
    return {
        render: loadSections
    }
});
