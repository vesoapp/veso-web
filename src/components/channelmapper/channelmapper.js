define(["dialogHelper", "loading", "connectionManager", "globalize", "actionsheet", "emby-input", "paper-icon-button-light", "emby-button", "listViewStyle", "material-icons", "formDialogStyle"], function(dialogHelper, loading, connectionManager, globalize, actionsheet) {
    "use strict";
    return function(options) {
        function parentWithClass(elem, className) {
            for (; !elem.classList || !elem.classList.contains(className);)
                if (!(elem = elem.parentNode)) return null;
            return elem
        }

        function mapChannel(button, channelId, providerChannelId) {
            loading.show();
            var providerId = options.providerId;
            connectionManager.getApiClient(options.serverId).ajax({
                type: "POST",
                url: ApiClient.getUrl("LiveTv/ChannelMappings"),
                data: {
                    providerId: providerId,
                    tunerChannelId: channelId,
                    providerChannelId: providerChannelId
                },
                dataType: "json"
            }).then(function(mapping) {
                var listItem = parentWithClass(button, "listItem");
                button.setAttribute("data-providerid", mapping.ProviderChannelId), listItem.querySelector(".secondary").innerHTML = getMappingSecondaryName(mapping, currentMappingOptions.ProviderName), loading.hide()
            })
        }

        function onChannelsElementClick(e) {
            var btnMap = parentWithClass(e.target, "btnMap");
            if (btnMap) {
                var channelId = btnMap.getAttribute("data-id");
                var providerChannelId = btnMap.getAttribute("data-providerid");
                var menuItems = currentMappingOptions.ProviderChannels.map(function(m) {
                    return {
                        name: m.Name,
                        id: m.Id,
                        selected: m.Id.toLowerCase() === providerChannelId.toLowerCase()
                    }
                }).sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });

                actionsheet.show({
                    positionTo: btnMap,
                    items: menuItems
                }).then(function(newChannelId) {
                    mapChannel(btnMap, channelId, newChannelId)
                })
            }
        }

        function getChannelMappingOptions(serverId, providerId) {
            var apiClient = connectionManager.getApiClient(serverId);
            return apiClient.getJSON(apiClient.getUrl("LiveTv/ChannelMappingOptions", {
                providerId: providerId
            }))
        }

        function getMappingSecondaryName(mapping, providerName) {
            return (mapping.ProviderChannelName || "") + " - " + providerName
        }

        function getTunerChannelHtml(channel, providerName) {
            var html = "";
            return html += '<div class="listItem">', html += '<i class="md-icon listItemIcon">dvr</i>', html += '<div class="listItemBody two-line">', html += '<h3 class="listItemBodyText">', html += channel.Name, html += "</h3>", html += '<div class="secondary listItemBodyText">', channel.ProviderChannelName && (html += getMappingSecondaryName(channel, providerName)), html += "</div>", html += "</div>", html += '<button class="btnMap autoSize" is="paper-icon-button-light" type="button" data-id="' + channel.Id + '" data-providerid="' + channel.ProviderChannelId + '"><i class="md-icon">mode_edit</i></button>', html += "</div>"
        }

        function getEditorHtml() {
            var html = "";
            return html += '<div class="formDialogContent">', html += '<div class="dialogContentInner dialog-content-centered">', html += '<form style="margin:auto;">', html += "<h1>" + globalize.translate("HeaderChannels") + "</h1>", html += '<div class="channels paperList">', html += "</div>", html += "</form>", html += "</div>", html += "</div>"
        }

        function initEditor(dlg, options) {
            getChannelMappingOptions(options.serverId, options.providerId).then(function(result) {
                currentMappingOptions = result;
                var channelsElement = dlg.querySelector(".channels");
                channelsElement.innerHTML = result.TunerChannels.map(function(channel) {
                    return getTunerChannelHtml(channel, result.ProviderName)
                }).join(""), channelsElement.addEventListener("click", onChannelsElementClick)
            })
        }
        var currentMappingOptions, self = this;
        self.show = function() {
            var dialogOptions = {
                removeOnClose: !0
            };
            dialogOptions.size = "small";
            var dlg = dialogHelper.createDialog(dialogOptions);
            dlg.classList.add("formDialog"), dlg.classList.add("ui-body-a"), dlg.classList.add("background-theme-a");
            var html = "",
                title = globalize.translate("MapChannels");
            return html += '<div class="formDialogHeader">', html += '<button is="paper-icon-button-light" class="btnCancel autoSize" tabindex="-1"><i class="md-icon">&#xE5C4;</i></button>', html += '<h3 class="formDialogHeaderTitle">', html += title, html += "</h3>", html += "</div>", html += getEditorHtml(), dlg.innerHTML = html, initEditor(dlg, options), dlg.querySelector(".btnCancel").addEventListener("click", function() {
                dialogHelper.close(dlg)
            }), new Promise(function(resolve, reject) {
                dlg.addEventListener("close", resolve), dialogHelper.open(dlg)
            })
        }
    }
});
