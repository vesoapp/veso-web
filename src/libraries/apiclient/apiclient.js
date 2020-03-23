//TODO: (vitorsemeano) modify this lines for webpack
define(["libraries/apiclient/apiclientcore", "localassetmanager"], function(ApiClient, localassetmanager) {
    "use strict";

    if ("cordova" !== window.appMode && "android" !== window.appMode) {
        return ApiClient;
    }

    function isLocalId(str) {
        return startsWith(str, localPrefix)
    }

    function isLocalViewId(str) {
        return startsWith(str, localViewPrefix)
    }

    function isTopLevelLocalViewId(str) {
        return "localview" === str
    }

    function stripLocalPrefix(str) {
        var res = stripStart(str, localPrefix);
        return res = stripStart(res, localViewPrefix)
    }

    function startsWith(str, find) {
        return !!(str && find && str.length > find.length && 0 === str.indexOf(find))
    }

    function stripStart(str, find) {
        return startsWith(str, find) ? str.substr(find.length) : str
    }

    function createEmptyList() {
        return {
            Items: [],
            TotalRecordCount: 0
        }
    }

    function convertGuidToLocal(guid) {
        return guid ? isLocalId(guid) ? guid : "local:" + guid : null
    }

    function adjustGuidProperties(downloadedItem) {
        downloadedItem.Id = convertGuidToLocal(downloadedItem.Id), downloadedItem.SeriesId = convertGuidToLocal(downloadedItem.SeriesId), downloadedItem.SeasonId = convertGuidToLocal(downloadedItem.SeasonId), downloadedItem.AlbumId = convertGuidToLocal(downloadedItem.AlbumId), downloadedItem.ParentId = convertGuidToLocal(downloadedItem.ParentId), downloadedItem.ParentThumbItemId = convertGuidToLocal(downloadedItem.ParentThumbItemId), downloadedItem.ParentPrimaryImageItemId = convertGuidToLocal(downloadedItem.ParentPrimaryImageItemId), downloadedItem.PrimaryImageItemId = convertGuidToLocal(downloadedItem.PrimaryImageItemId), downloadedItem.ParentLogoItemId = convertGuidToLocal(downloadedItem.ParentLogoItemId), downloadedItem.ParentBackdropItemId = convertGuidToLocal(downloadedItem.ParentBackdropItemId), downloadedItem.ParentBackdropImageTags = null
    }

    function getLocalView(instance, serverId, userId) {
        return instance.getLocalFolders(serverId, userId).then(function(views) {
            var localView = null;
            return views.length > 0 && (localView = {
                Name: instance.downloadsTitleText || "Downloads",
                ServerId: serverId,
                Id: "localview",
                Type: "localview",
                IsFolder: !0
            }), Promise.resolve(localView)
        })
    }

    function ApiClientEx(serverAddress, clientName, applicationVersion, deviceName, deviceId) {
        ApiClient.call(this, serverAddress, clientName, applicationVersion, deviceName, deviceId)
    }
    var localPrefix = "local:",
        localViewPrefix = "localview:";
    return Object.assign(ApiClientEx.prototype, ApiClient.prototype), ApiClientEx.prototype.getPlaybackInfo = function(itemId, options, deviceProfile) {
        var onFailure = function() {
            return ApiClient.prototype.getPlaybackInfo.call(instance, itemId, options, deviceProfile)
        };
        if (isLocalId(itemId)) return localassetmanager.getLocalItem(this.serverId(), stripLocalPrefix(itemId)).then(function(item) {
            return {
                MediaSources: item.Item.MediaSources.map(function(m) {
                    return m.SupportsDirectPlay = !0, m.SupportsDirectStream = !1, m.SupportsTranscoding = !1, m.IsLocal = !0, m
                })
            }
        }, onFailure);
        var instance = this;
        return localassetmanager.getLocalItem(this.serverId(), itemId).then(function(item) {
            if (item) {
                var mediaSources = item.Item.MediaSources.map(function(m) {
                    return m.SupportsDirectPlay = !0, m.SupportsDirectStream = !1, m.SupportsTranscoding = !1, m.IsLocal = !0, m
                });
                return localassetmanager.fileExists(item.LocalPath).then(function(exists) {
                    if (exists) {
                        var res = {
                            MediaSources: mediaSources
                        };
                        return Promise.resolve(res)
                    }
                    return ApiClient.prototype.getPlaybackInfo.call(instance, itemId, options, deviceProfile)
                }, onFailure)
            }
            return ApiClient.prototype.getPlaybackInfo.call(instance, itemId, options, deviceProfile)
        }, onFailure)
    }, ApiClientEx.prototype.getItems = function(userId, options) {
        var i, serverInfo = this.serverInfo();
        if (serverInfo && "localview" === options.ParentId) return this.getLocalFolders(serverInfo.Id, userId).then(function(items) {
            var result = {
                Items: items,
                TotalRecordCount: items.length
            };
            return Promise.resolve(result)
        });
        if (serverInfo && options && (isLocalId(options.ParentId) || isLocalId(options.SeriesId) || isLocalId(options.SeasonId) || isLocalViewId(options.ParentId) || isLocalId(options.AlbumIds))) return localassetmanager.getViewItems(serverInfo.Id, userId, options).then(function(items) {
            items.forEach(function(item) {
                adjustGuidProperties(item)
            });
            var result = {
                Items: items,
                TotalRecordCount: items.length
            };
            return Promise.resolve(result)
        });
        if (options && options.ExcludeItemIds && options.ExcludeItemIds.length) {
            var exItems = options.ExcludeItemIds.split(",");
            for (i = 0; i < exItems.length; i++)
                if (isLocalId(exItems[i])) return Promise.resolve(createEmptyList())
        } else if (options && options.Ids && options.Ids.length) {
            var ids = options.Ids.split(","),
                hasLocal = !1;
            for (i = 0; i < ids.length; i++) isLocalId(ids[i]) && (hasLocal = !0);
            if (hasLocal) return localassetmanager.getItemsFromIds(serverInfo.Id, ids).then(function(items) {
                items.forEach(function(item) {
                    adjustGuidProperties(item)
                });
                var result = {
                    Items: items,
                    TotalRecordCount: items.length
                };
                return Promise.resolve(result)
            })
        }
        return ApiClient.prototype.getItems.call(this, userId, options)
    }, ApiClientEx.prototype.getUserViews = function(options, userId) {
        var instance = this;
        options = options || {};
        var basePromise = ApiClient.prototype.getUserViews.call(instance, options, userId);
        return options.enableLocalView ? basePromise.then(function(result) {
            var serverInfo = instance.serverInfo();
            return serverInfo ? getLocalView(instance, serverInfo.Id, userId).then(function(localView) {
                return localView && (result.Items.push(localView), result.TotalRecordCount++), Promise.resolve(result)
            }) : Promise.resolve(result)
        }) : basePromise
    }, ApiClientEx.prototype.getItem = function(userId, itemId) {
        if (!itemId) throw new Error("null itemId");
        itemId && (itemId = itemId.toString());
        var serverInfo;
        return isTopLevelLocalViewId(itemId) && (serverInfo = this.serverInfo()) ? getLocalView(this, serverInfo.Id, userId) : isLocalViewId(itemId) && (serverInfo = this.serverInfo()) ? this.getLocalFolders(serverInfo.Id, userId).then(function(items) {
            var views = items.filter(function(item) {
                return item.Id === itemId
            });
            return views.length > 0 ? Promise.resolve(views[0]) : Promise.reject()
        }) : isLocalId(itemId) && (serverInfo = this.serverInfo()) ? localassetmanager.getLocalItem(serverInfo.Id, stripLocalPrefix(itemId)).then(function(item) {
            return adjustGuidProperties(item.Item), Promise.resolve(item.Item)
        }) : ApiClient.prototype.getItem.call(this, userId, itemId)
    }, ApiClientEx.prototype.getLocalFolders = function(userId) {
        var serverInfo = this.serverInfo();
        return userId = userId || serverInfo.UserId, localassetmanager.getViews(serverInfo.Id, userId)
    }, ApiClientEx.prototype.getNextUpEpisodes = function(options) {
        return options.SeriesId && isLocalId(options.SeriesId) ? Promise.resolve(createEmptyList()) : ApiClient.prototype.getNextUpEpisodes.call(this, options)
    }, ApiClientEx.prototype.getSeasons = function(itemId, options) {
        return isLocalId(itemId) ? (options.SeriesId = itemId, options.IncludeItemTypes = "Season", options.SortBy = "SortName", this.getItems(this.getCurrentUserId(), options)) : ApiClient.prototype.getSeasons.call(this, itemId, options)
    }, ApiClientEx.prototype.getEpisodes = function(itemId, options) {
        return isLocalId(options.SeasonId) || isLocalId(options.seasonId) ? (options.SeriesId = itemId, options.IncludeItemTypes = "Episode", options.SortBy = "SortName", this.getItems(this.getCurrentUserId(), options)) : isLocalId(itemId) ? (options.SeriesId = itemId, options.IncludeItemTypes = "Episode", options.SortBy = "SortName", this.getItems(this.getCurrentUserId(), options)) : ApiClient.prototype.getEpisodes.call(this, itemId, options)
    }, ApiClientEx.prototype.getLatestOfflineItems = function(options) {
        options.SortBy = "DateCreated", options.SortOrder = "Descending";
        var serverInfo = this.serverInfo();
        return serverInfo ? localassetmanager.getViewItems(serverInfo.Id, null, options).then(function(items) {
            return items.forEach(function(item) {
                adjustGuidProperties(item)
            }), Promise.resolve(items)
        }) : Promise.resolve([])
    }, ApiClientEx.prototype.getThemeMedia = function(userId, itemId, inherit) {
        return isLocalViewId(itemId) || isLocalId(itemId) || isTopLevelLocalViewId(itemId) ? Promise.reject() : ApiClient.prototype.getThemeMedia.call(this, userId, itemId, inherit)
    }, ApiClientEx.prototype.getSpecialFeatures = function(userId, itemId) {
        return isLocalId(itemId) ? Promise.resolve([]) : ApiClient.prototype.getSpecialFeatures.call(this, userId, itemId)
    }, ApiClientEx.prototype.getSimilarItems = function(itemId, options) {
        return isLocalId(itemId) ? Promise.resolve(createEmptyList()) : ApiClient.prototype.getSimilarItems.call(this, itemId, options)
    }, ApiClientEx.prototype.updateFavoriteStatus = function(userId, itemId, isFavorite) {
        return isLocalId(itemId) ? Promise.resolve() : ApiClient.prototype.updateFavoriteStatus.call(this, userId, itemId, isFavorite)
    }, ApiClientEx.prototype.getScaledImageUrl = function(itemId, options) {
        if (isLocalId(itemId) || options && options.itemid && isLocalId(options.itemid)) {
            var serverInfo = this.serverInfo(),
                id = stripLocalPrefix(itemId);
            return localassetmanager.getImageUrl(serverInfo.Id, id, options)
        }
        return ApiClient.prototype.getScaledImageUrl.call(this, itemId, options)
    }, ApiClientEx.prototype.reportPlaybackStart = function(options) {
        if (!options) throw new Error("null options");
        return isLocalId(options.ItemId) ? Promise.resolve() : ApiClient.prototype.reportPlaybackStart.call(this, options)
    }, ApiClientEx.prototype.reportPlaybackProgress = function(options) {
        if (!options) throw new Error("null options");
        if (isLocalId(options.ItemId)) {
            var serverInfo = this.serverInfo();
            return serverInfo ? localassetmanager.getLocalItem(serverInfo.Id, stripLocalPrefix(options.ItemId)).then(function(item) {
                var libraryItem = item.Item;
                return "Video" === libraryItem.MediaType || "AudioBook" === libraryItem.Type ? (libraryItem.UserData = libraryItem.UserData || {}, libraryItem.UserData.PlaybackPositionTicks = options.PositionTicks, libraryItem.UserData.PlayedPercentage = Math.min(libraryItem.RunTimeTicks ? (options.PositionTicks || 0) / libraryItem.RunTimeTicks * 100 : 0, 100), localassetmanager.addOrUpdateLocalItem(item)) : Promise.resolve()
            }) : Promise.resolve()
        }
        return ApiClient.prototype.reportPlaybackProgress.call(this, options)
    }, ApiClientEx.prototype.reportPlaybackStopped = function(options) {
        if (!options) throw new Error("null options");
        if (isLocalId(options.ItemId)) {
            var serverInfo = this.serverInfo(),
                action = {
                    Date: (new Date).getTime(),
                    ItemId: stripLocalPrefix(options.ItemId),
                    PositionTicks: options.PositionTicks,
                    ServerId: serverInfo.Id,
                    Type: 0,
                    UserId: this.getCurrentUserId()
                };
            return localassetmanager.recordUserAction(action)
        }
        return ApiClient.prototype.reportPlaybackStopped.call(this, options)
    }, ApiClientEx.prototype.getIntros = function(itemId) {
        return isLocalId(itemId) ? Promise.resolve({
            Items: [],
            TotalRecordCount: 0
        }) : ApiClient.prototype.getIntros.call(this, itemId)
    }, ApiClientEx.prototype.getInstantMixFromItem = function(itemId, options) {
        return isLocalId(itemId) ? Promise.resolve({
            Items: [],
            TotalRecordCount: 0
        }) : ApiClient.prototype.getInstantMixFromItem.call(this, itemId, options)
    }, ApiClientEx.prototype.getItemDownloadUrl = function(itemId) {
        if (isLocalId(itemId)) {
            var serverInfo = this.serverInfo();
            if (serverInfo) return localassetmanager.getLocalItem(serverInfo.Id, stripLocalPrefix(itemId)).then(function(item) {
                return Promise.resolve(item.LocalPath)
            })
        }
        return ApiClient.prototype.getItemDownloadUrl.call(this, itemId)
    }, ApiClientEx
});
