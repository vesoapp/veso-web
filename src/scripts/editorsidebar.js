define(["datetime", "jQuery", "material-icons"], function (datetime, $) {
    "use strict";

    function getNode(item, folderState, selected) {
        var htmlName = getNodeInnerHtml(item);
        var node = {
            id: item.Id,
            text: htmlName,
            state: {
                opened: item.IsFolder && folderState == "open",
                selected: selected
            },
            li_attr: {
                serveritemtype: item.Type,
                collectiontype: item.CollectionType
            }
        };
        if (item.IsFolder) {
            node.children = [{
                text: "Loading...",
                icon: false
            }];
            node.icon = false;
        } else {
            node.icon = false;
        }
        if (node.state.opened) {
            node.li_attr.loadedFromServer = true;
        }
        if (selected) {
            selectedNodeId = item.Id;
        }
        return node;
    }

    function getNodeInnerHtml(item) {
        var name = item.Name;
        if (item.Number) {
            name = item.Number + " - " + name;
        }
        if (item.IndexNumber != null && item.Type != "Season") {
            name = item.IndexNumber + " - " + name;
        }
        var htmlName = "<div class='editorNode'>";
        if (item.IsFolder) {
            htmlName += '<i class="material-icons metadataSidebarIcon">folder</i>';
        } else if (item.MediaType === "Video") {
            htmlName += '<i class="material-icons metadataSidebarIcon">movie</i>';
        } else if (item.MediaType === "Audio") {
            htmlName += '<i class="material-icons metadataSidebarIcon">audiotrack</i>';
        } else if (item.Type === "TvChannel") {
            htmlName += '<i class="material-icons metadataSidebarIcon live_tv"></i>';
        } else if (item.MediaType === "Photo") {
            htmlName += '<i class="material-icons metadataSidebarIcon">photo</i>';
        } else if (item.MediaType === "Book") {
            htmlName += '<i class="material-icons metadataSidebarIcon">book</i>';
        }
        if (item.LockData) {
            htmlName += '<i class="material-icons metadataSidebarIcon">lock</i>';
        }
        htmlName += name;
        htmlName += "</div>";
        return htmlName;
    }

    function loadChildrenOfRootNode(page, scope, callback) {
        ApiClient.getLiveTvChannels({
            limit: 0
        }).then(function (result) {
            var nodes = [];
            nodes.push({
                id: "MediaFolders",
                text: Globalize.translate("HeaderMediaFolders"),
                state: {
                    opened: true
                },
                li_attr: {
                    itemtype: "mediafolders",
                    loadedFromServer: true
                },
                icon: false
            });
            if (result.TotalRecordCount) {
                nodes.push({
                    id: "livetv",
                    text: Globalize.translate("HeaderLiveTV"),
                    state: {
                        opened: false
                    },
                    li_attr: {
                        itemtype: "livetv"
                    },
                    children: [{
                        text: "Loading...",
                        icon: false
                    }],
                    icon: false
                });
            }
            callback.call(scope, nodes);
            nodesToLoad.push("MediaFolders");
        });
    }

    function loadLiveTvChannels(service, openItems, callback) {
        ApiClient.getLiveTvChannels({
            ServiceName: service,
            AddCurrentProgram: false
        }).then(function (result) {
            var nodes = result.Items.map(function (i) {
                var state = openItems.indexOf(i.Id) == -1 ? "closed" : "open";
                return getNode(i, state, false);
            });
            callback(nodes);
        });
    }

    function loadMediaFolders(page, scope, openItems, callback) {
        ApiClient.getJSON(ApiClient.getUrl("Library/MediaFolders")).then(function (result) {
            var nodes = result.Items.map(function (n) {
                var state = openItems.indexOf(n.Id) == -1 ? "closed" : "open";
                return getNode(n, state, false);
            });
            callback.call(scope, nodes);
            for (var i = 0, length = nodes.length; i < length; i++) {
                if (nodes[i].state.opened) {
                    nodesToLoad.push(nodes[i].id);
                }
            }
        });
    }

    function loadNode(page, scope, node, openItems, selectedId, currentUser, callback) {
        var id = node.id;
        if (id == "#") {
            loadChildrenOfRootNode(page, scope, callback);
            return;
        }
        if (id == "livetv") {
            loadLiveTvChannels(id, openItems, callback);
            return;
        }
        if (id == "MediaFolders") {
            loadMediaFolders(page, scope, openItems, callback);
            return;
        }
        var query = {
            ParentId: id,
            Fields: "Settings",
            IsVirtualUnaired: false,
            IsMissing: false,
            EnableTotalRecordCount: false,
            EnableImages: false,
            EnableUserData: false
        };
        var itemtype = node.li_attr.itemtype;
        if (itemtype != "Season" && itemtype != "Series") {
            query.SortBy = "SortName";
        }
        ApiClient.getItems(Dashboard.getCurrentUserId(), query).then(function (result) {
            var nodes = result.Items.map(function (n) {
                var state = openItems.indexOf(n.Id) == -1 ? "closed" : "open";
                return getNode(n, state, n.Id == selectedId);
            });
            callback.call(scope, nodes);
            for (var i = 0, length = nodes.length; i < length; i++) {
                if (nodes[i].state.opened) {
                    nodesToLoad.push(nodes[i].id);
                }
            }
        });
    }

    function scrollToNode(id) {
        var elem = $("#" + id)[0];
        if (elem) {
            elem.scrollIntoView();
        }
    }

    function initializeTree(page, currentUser, openItems, selectedId) {
        require(["jstree"], function () {
            initializeTreeInternal(page, currentUser, openItems, selectedId);
        });
    }

    function onNodeSelect(event, data) {
        var node = data.node;
        var eventData = {
            id: node.id,
            itemType: node.li_attr.itemtype,
            serverItemType: node.li_attr.serveritemtype,
            collectionType: node.li_attr.collectiontype
        };
        if (eventData.itemType != "livetv" && eventData.itemType != "mediafolders") {
            {
                this.dispatchEvent(new CustomEvent("itemclicked", {
                    detail: eventData,
                    bubbles: true,
                    cancelable: false
                }));
            }
            document.querySelector(".editPageSidebar").classList.add("editPageSidebar-withcontent");
        } else {
            document.querySelector(".editPageSidebar").classList.remove("editPageSidebar-withcontent");
        }
    }

    function onNodeOpen(event, data) {
        var page = $(this).parents(".page")[0];
        var node = data.node;
        if (node.children && node.children) {
            loadNodesToLoad(page, node);
        }
        if (node.li_attr && node.id != "#" && !node.li_attr.loadedFromServer) {
            node.li_attr.loadedFromServer = true;
            $.jstree.reference(".libraryTree", page).load_node(node.id, loadNodeCallback);
        }
    }

    function onNodeLoad(event, data) {
        var page = $(this).parents(".page")[0];
        var node = data.node;
        if (node.children && node.children) {
            loadNodesToLoad(page, node);
        }
        if (node.li_attr && node.id != "#" && !node.li_attr.loadedFromServer) {
            node.li_attr.loadedFromServer = true;
            $.jstree.reference(".libraryTree", page).load_node(node.id, loadNodeCallback);
        }
    }

    function initializeTreeInternal(page, currentUser, openItems, selectedId) {
        nodesToLoad = [];
        selectedNodeId = null;
        $.jstree.destroy();
        $(".libraryTree", page).jstree({
            "plugins": ["wholerow"],
            core: {
                check_callback: true,
                data: function (node, callback) {
                    loadNode(page, this, node, openItems, selectedId, currentUser, callback);
                },
                themes: {
                    variant: "large"
                }
            }
        }).off("select_node.jstree", onNodeSelect).on("select_node.jstree", onNodeSelect).off("open_node.jstree", onNodeOpen).on("open_node.jstree", onNodeOpen).off("load_node.jstree", onNodeLoad).on("load_node.jstree", onNodeLoad);
    }

    function loadNodesToLoad(page, node) {
        var children = node.children;
        for (var i = 0, length = children.length; i < length; i++) {
            var child = children[i];
            if (nodesToLoad.indexOf(child) != -1) {
                nodesToLoad = nodesToLoad.filter(function (n) {
                    return n != child;
                });
                $.jstree.reference(".libraryTree", page).load_node(child, loadNodeCallback);
            }
        }
    }

    function loadNodeCallback(node) {
        if (selectedNodeId && node.children && node.children.indexOf(selectedNodeId) != -1) {
            setTimeout(function () {
                scrollToNode(selectedNodeId);
            }, 500);
        }
    }

    function updateEditorNode(page, item) {
        var elem = $("#" + item.Id + ">a", page)[0];
        if (elem == null) {
            return;
        }
        $(".editorNode", elem).remove();
        $(elem).append(getNodeInnerHtml(item));
        if (item.IsFolder) {
            var tree = jQuery.jstree._reference(".libraryTree");
            var currentNode = tree._get_node(null, false);
            tree.refresh(currentNode);
        }
    }

    function setCurrentItemId(id) {
        itemId = id;
    }

    function getCurrentItemId() {
        if (itemId) {
            return itemId;
        }
        var url = window.location.hash || window.location.href;
        return getParameterByName("id", url);
    }
    var nodesToLoad = [];
    var selectedNodeId;
    $(document).on("itemsaved", ".metadataEditorPage", function (e, item) {
        updateEditorNode(this, item);
    }).on("pagebeforeshow", ".metadataEditorPage", function () {
        require(["css!assets/css/metadataeditor.css"]);
    }).on("pagebeforeshow", ".metadataEditorPage", function () {
        var page = this;
        Dashboard.getCurrentUser().then(function (user) {
            var id = getCurrentItemId();
            if (id) {
                ApiClient.getAncestorItems(id, user.Id).then(function (ancestors) {
                    var ids = ancestors.map(function (i) {
                        return i.Id;
                    });
                    initializeTree(page, user, ids, id);
                });
            } else {
                initializeTree(page, user, []);
            }
        });
    }).on("pagebeforehide", ".metadataEditorPage", function () {
        var page = this;
        $(".libraryTree", page).off("select_node.jstree", onNodeSelect).off("open_node.jstree", onNodeOpen).off("load_node.jstree", onNodeLoad);
    });
    var itemId;
    window.MetadataEditor = {
        getItemPromise: function () {
            var currentItemId = getCurrentItemId();
            if (currentItemId) {
                return ApiClient.getItem(Dashboard.getCurrentUserId(), currentItemId);
            }
            return ApiClient.getRootFolder(Dashboard.getCurrentUserId());
        },
        getCurrentItemId: getCurrentItemId,
        setCurrentItemId: setCurrentItemId
    };
});
