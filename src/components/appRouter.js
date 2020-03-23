define(['loading', 'globalize', 'events', 'viewManager', 'layoutManager', 'skinManager', 'pluginManager', 'backdrop', 'browser', 'page', 'appSettings', 'apphost', 'connectionManager'], function (loading, globalize, events, viewManager, layoutManager, skinManager, pluginManager, backdrop, browser, page, appSettings, appHost, connectionManager) {
    'use strict';

    var appRouter = {
        showLocalLogin: function (serverId, manualLogin) {
            var pageName = manualLogin ? 'manuallogin' : 'login';
            show('/startup/' + pageName + '.html?serverid=' + serverId);
        },
        showSelectServer: function () {
            show('/startup/selectserver.html');
        },
        showWelcome: function () {
            show('/startup/welcome.html');
        },
        showSettings: function () {
            show('/settings/settings.html');
        },
        showNowPlaying: function () {
            show("/nowplaying.html");
        }
    };

    function beginConnectionWizard() {
        backdrop.clear();
        loading.show();
        connectionManager.connect({
            enableAutoLogin: appSettings.enableAutoLogin()
        }).then(function (result) {
            handleConnectionResult(result, loading);
        });
    }

    function handleConnectionResult(result, loading) {
        switch (result.State) {
            case 'SignedIn':
                loading.hide();
                skinManager.loadUserSkin();
                break;
            case 'ServerSignIn':
                result.ApiClient.getPublicUsers().then(function (users) {
                    if (users.length) {
                        appRouter.showLocalLogin(result.Servers[0].Id);
                    } else {
                        appRouter.showLocalLogin(result.Servers[0].Id, true);
                    }
                });
                break;
            case 'ServerSelection':
                appRouter.showSelectServer();
                break;
            case 'ConnectSignIn':
                appRouter.showWelcome();
                break;
            case 'ServerUpdateNeeded':
                require(['alert'], function (alert) {
                    alert({
                        text: globalize.translate('ServerUpdateNeeded', 'https://github.com/jellyfin/jellyfin'),
                        html: globalize.translate('ServerUpdateNeeded', '<a href="https://github.com/jellyfin/jellyfin">https://github.com/jellyfin/jellyfin</a>')
                    }).then(function () {
                        appRouter.showSelectServer();
                    });
                });
                break;
            default:
                break;
        }
    }

    function loadContentUrl(ctx, next, route, request) {
        var url;
        if (route.contentPath && typeof (route.contentPath) === 'function') {
            url = route.contentPath(ctx.querystring);
        } else {
            url = route.contentPath || route.path;
        }

        if (url.indexOf('://') === -1) {
            // Put a slash at the beginning but make sure to avoid a double slash
            if (url.indexOf('/') !== 0) {
                url = '/' + url;
            }

            url = baseUrl() + url;
        }

        if (ctx.querystring && route.enableContentQueryString) {
            url += '?' + ctx.querystring;
        }

        require(['text!' + url], function (html) {
            loadContent(ctx, route, html, request);
        });
    }

    function handleRoute(ctx, next, route) {
        authenticate(ctx, route, function () {
            initRoute(ctx, next, route);
        });
    }

    function initRoute(ctx, next, route) {
        var onInitComplete = function (controllerFactory) {
            sendRouteToViewManager(ctx, next, route, controllerFactory);
        };

        if (route.controller) {
            require(['controllers/' + route.controller], onInitComplete);
        } else {
            onInitComplete();
        }
    }

    function cancelCurrentLoadRequest() {
        var currentRequest = currentViewLoadRequest;
        if (currentRequest) {
            currentRequest.cancel = true;
        }
    }

    var currentViewLoadRequest;
    function sendRouteToViewManager(ctx, next, route, controllerFactory) {
        if (isDummyBackToHome && route.type === 'home') {
            isDummyBackToHome = false;
            return;
        }

        cancelCurrentLoadRequest();
        var isBackNav = ctx.isBack;

        var currentRequest = {
            url: baseUrl() + ctx.path,
            transition: route.transition,
            isBack: isBackNav,
            state: ctx.state,
            type: route.type,
            fullscreen: route.fullscreen,
            controllerFactory: controllerFactory,
            options: {
                supportsThemeMedia: route.supportsThemeMedia || false,
                enableMediaControl: route.enableMediaControl !== false
            },
            autoFocus: route.autoFocus
        };
        currentViewLoadRequest = currentRequest;

        var onNewViewNeeded = function () {
            if (typeof route.path === 'string') {
                loadContentUrl(ctx, next, route, currentRequest);
            } else {
                // ? TODO
                next();
            }
        };

        if (!isBackNav) {
            // Don't force a new view for home due to the back menu
            //if (route.type !== 'home') {
            onNewViewNeeded();
            return;
            //}
        }
        viewManager.tryRestoreView(currentRequest, function () {

            // done
            currentRouteInfo = {
                route: route,
                path: ctx.path
            };

        }).catch(function (result) {
            if (!result || !result.cancelled) {
                onNewViewNeeded();
            }
        });
    }

    var msgTimeout;
    var forcedLogoutMsg;
    function onForcedLogoutMessageTimeout() {
        var msg = forcedLogoutMsg;
        forcedLogoutMsg = null;

        if (msg) {
            require(['alert'], function (alert) {
                alert(msg);
            });
        }
    }

    function showForcedLogoutMessage(msg) {
        forcedLogoutMsg = msg;
        if (msgTimeout) {
            clearTimeout(msgTimeout);
        }

        msgTimeout = setTimeout(onForcedLogoutMessageTimeout, 100);
    }

    function onRequestFail(e, data) {

        var apiClient = this;

        if (data.status === 401) {
            if (data.errorCode === "ParentalControl") {

                var isCurrentAllowed = currentRouteInfo ? (currentRouteInfo.route.anonymous || currentRouteInfo.route.startup) : true;

                // Bounce to the login screen, but not if a password entry fails, obviously
                if (!isCurrentAllowed) {
                    showForcedLogoutMessage(globalize.translate('AccessRestrictedTryAgainLater'));
                    appRouter.showLocalLogin(apiClient.serverId());
                }

            }
        }
    }

    function onBeforeExit(e) {
        if (browser.web0s) {
            page.restorePreviousState();
        }
    }

    function normalizeImageOptions(options) {
        var scaleFactor = browser.tv ? 0.8 : 1;

        var setQuality;
        if (options.maxWidth) {
            options.maxWidth = Math.round(options.maxWidth * scaleFactor);
            setQuality = true;
        }

        if (options.width) {
            options.width = Math.round(options.width * scaleFactor);
            setQuality = true;
        }

        if (options.maxHeight) {
            options.maxHeight = Math.round(options.maxHeight * scaleFactor);
            setQuality = true;
        }

        if (options.height) {
            options.height = Math.round(options.height * scaleFactor);
            setQuality = true;
        }

        if (setQuality) {

            var quality = 100;

            var type = options.type || 'Primary';

            if (browser.tv || browser.slow) {

                if (browser.chrome) {
                    // webp support
                    quality = type === 'Primary' ? 40 : 50;
                } else {
                    quality = type === 'Backdrop' ? 60 : 50;
                }
            } else {
                quality = type === 'Backdrop' ? 70 : 90;
            }

            options.quality = quality;
        }
    }

    function getMaxBandwidth() {
        if (navigator.connection) {
            var max = navigator.connection.downlinkMax;
            if (max && max > 0 && max < Number.POSITIVE_INFINITY) {

                max /= 8;
                max *= 1000000;
                max *= 0.7;
                max = parseInt(max);
                return max;
            }
        }

        return null;
    }

    function getMaxBandwidthIOS() {
        return 800000;
    }

    function onApiClientCreated(e, newApiClient) {

        newApiClient.normalizeImageOptions = normalizeImageOptions;

        if (browser.iOS) {
            newApiClient.getMaxBandwidth = getMaxBandwidthIOS;
        } else {
            newApiClient.getMaxBandwidth = getMaxBandwidth;
        }

        events.off(newApiClient, 'requestfail', onRequestFail);
        events.on(newApiClient, 'requestfail', onRequestFail);
    }

    function initApiClient(apiClient) {

        onApiClientCreated({}, apiClient);
    }

    function initApiClients() {

        connectionManager.getApiClients().forEach(initApiClient);

        events.on(connectionManager, 'apiclientcreated', onApiClientCreated);
    }

    function onAppResume() {
        var apiClient = connectionManager.currentApiClient();

        if (apiClient) {
            apiClient.ensureWebSocket();
        }
    }

    var firstConnectionResult;
    function start(options) {

        loading.show();

        initApiClients();

        events.on(appHost, 'beforeexit', onBeforeExit);
        events.on(appHost, 'resume', onAppResume);

        connectionManager.connect({
            enableAutoLogin: appSettings.enableAutoLogin()

        }).then(function (result) {

            firstConnectionResult = result;

            options = options || {};

            page({
                click: options.click !== false,
                hashbang: options.hashbang !== false,
                enableHistory: enableHistory()
            });
        }).catch().then(function() {
            loading.hide();
        });
    }

    function enableHistory() {

        //if (browser.edgeUwp) {
        //    return false;
        //}

        // shows status bar on navigation
        if (browser.xboxOne) {
            return false;
        }

        // Does not support history
        if (browser.orsay) {
            return false;
        }

        return true;
    }

    function enableNativeHistory() {
        return page.enableNativeHistory();
    }

    function authenticate(ctx, route, callback) {

        var firstResult = firstConnectionResult;
        if (firstResult) {

            firstConnectionResult = null;

            if (firstResult.State !== 'SignedIn' && !route.anonymous) {

                handleConnectionResult(firstResult, loading);
                return;
            }
        }

        var apiClient = connectionManager.currentApiClient();
        var pathname = ctx.pathname.toLowerCase();

        console.debug('appRouter - processing path request ' + pathname);

        var isCurrentRouteStartup = currentRouteInfo ? currentRouteInfo.route.startup : true;
        var shouldExitApp = ctx.isBack && route.isDefaultRoute && isCurrentRouteStartup;

        if (!shouldExitApp && (!apiClient || !apiClient.isLoggedIn()) && !route.anonymous) {
            console.debug('appRouter - route does not allow anonymous access, redirecting to login');
            beginConnectionWizard();
            return;
        }

        if (shouldExitApp) {
            if (appHost.supports('exit')) {
                appHost.exit();
                return;
            }
            return;
        }

        if (apiClient && apiClient.isLoggedIn()) {

            console.debug('appRouter - user is authenticated');

            if (route.isDefaultRoute) {
                console.debug('appRouter - loading skin home page');
                loadUserSkinWithOptions(ctx);
                return;
            } else if (route.roles) {

                validateRoles(apiClient, route.roles).then(function () {

                    callback();

                }, beginConnectionWizard);
                return;
            }
        }

        console.debug('appRouter - proceeding to ' + pathname);
        callback();
    }

    function loadUserSkinWithOptions(ctx) {
        require(['queryString'], function (queryString) {
            var params = queryString.parse(ctx.querystring);
            skinManager.loadUserSkin({
                start: params.start
            });
        });
    }

    function validateRoles(apiClient, roles) {
        return Promise.all(roles.split(',').map(function (role) {
            return validateRole(apiClient, role);
        }));
    }

    function validateRole(apiClient, role) {
        if (role === 'admin') {
            return apiClient.getCurrentUser().then(function (user) {
                if (user.Policy.IsAdministrator) {
                    return Promise.resolve();
                }
                return Promise.reject();
            });
        }

        // Unknown role
        return Promise.resolve();
    }

    var isHandlingBackToDefault;
    var isDummyBackToHome;

    function loadContent(ctx, route, html, request) {

        html = globalize.translateDocument(html, route.dictionary);
        request.view = html;

        viewManager.loadView(request);

        currentRouteInfo = {
            route: route,
            path: ctx.path
        };

        ctx.handled = true;
    }

    function getRequestFile() {
        var path = self.location.pathname || '';

        var index = path.lastIndexOf('/');
        if (index !== -1) {
            path = path.substring(index);
        } else {
            path = '/' + path;
        }

        if (!path || path === '/') {
            path = '/index.html';
        }

        return path;
    }

    function endsWith(str, srch) {
        return str.lastIndexOf(srch) === srch.length - 1;
    }

    var baseRoute = self.location.href.split('?')[0].replace(getRequestFile(), '');
    // support hashbang
    baseRoute = baseRoute.split('#')[0];
    if (endsWith(baseRoute, '/') && !endsWith(baseRoute, '://')) {
        baseRoute = baseRoute.substring(0, baseRoute.length - 1);
    }

    function baseUrl() {
        return baseRoute;
    }

    function getHandler(route) {
        return function (ctx, next) {
            handleRoute(ctx, next, route);
        };
    }

    function getWindowLocationSearch(win) {

        var currentPath = currentRouteInfo ? (currentRouteInfo.path || '') : '';

        var index = currentPath.indexOf('?');
        var search = '';

        if (index !== -1) {
            search = currentPath.substring(index);
        }

        return search || '';
    }

    function param(name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS, "i");

        var results = regex.exec(url || getWindowLocationSearch());
        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    function back() {
        page.back();
    }

    /**
     * Pages of "no return" (when "Go back" should behave differently, probably quitting the application).
     */
    var startPages = ['home', 'login', 'selectserver'];

    function canGoBack() {
        var curr = current();
        if (!curr) {
            return false;
        }

        if (!document.querySelector('.dialogContainer') && startPages.indexOf(curr.type) !== -1) {
            return false;
        }
        return page.canGoBack();
    }

    function showDirect(path) {
        return new Promise(function(resolve, reject) {
            resolveOnNextShow = resolve, page.show(baseUrl()+path)
        })
    }

    function show(path, options) {
        if (path.indexOf('/') !== 0 && path.indexOf('://') === -1) {
            path = '/' + path;
        }

        var baseRoute = baseUrl();
        path = path.replace(baseRoute, '');

        if (currentRouteInfo && currentRouteInfo.path === path) {
            // can't use this with home right now due to the back menu
            if (currentRouteInfo.route.type !== 'home') {
                loading.hide();
                return Promise.resolve();
            }
        }

        return new Promise(function (resolve, reject) {
            resolveOnNextShow = resolve;
            page.show(path, options);
        });
    }

    var resolveOnNextShow;
    document.addEventListener('viewshow', function () {
        var resolve = resolveOnNextShow;
        if (resolve) {
            resolveOnNextShow = null;
            resolve();
        }
    });

    var currentRouteInfo;
    function current() {
        return currentRouteInfo ? currentRouteInfo.route : null;
    }

    function showItem(item, serverId, options) {
        if (typeof (item) === 'string') {
            var apiClient = serverId ? connectionManager.getApiClient(serverId) : connectionManager.currentApiClient();
            apiClient.getItem(apiClient.getCurrentUserId(), item).then(function (item) {
                appRouter.showItem(item, options);
            });
        } else {
            if (arguments.length === 2) {
                options = arguments[1];
            }

            var url = appRouter.getRouteUrl(item, options);
            appRouter.show(url, {
                item: item
            });
        }
    }

    var allRoutes = [];

    function addRoute(path, newRoute) {
        page(path, getHandler(newRoute));
        allRoutes.push(newRoute);
    }

    function getRoutes() {
        return allRoutes;
    }

    var backdropContainer;
    var backgroundContainer;
    function setTransparency(level) {
        if (!backdropContainer) {
            backdropContainer = document.querySelector('.backdropContainer');
        }
        if (!backgroundContainer) {
            backgroundContainer = document.querySelector('.backgroundContainer');
        }

        if (level === 'full' || level === 2) {
            backdrop.clear(true);
            document.documentElement.classList.add('transparentDocument');
            backgroundContainer.classList.add('backgroundContainer-transparent');
            backdropContainer.classList.add('hide');
        } else if (level === 'backdrop' || level === 1) {
            backdrop.externalBackdrop(true);
            document.documentElement.classList.add('transparentDocument');
            backgroundContainer.classList.add('backgroundContainer-transparent');
            backdropContainer.classList.add('hide');
        } else {
            backdrop.externalBackdrop(false);
            document.documentElement.classList.remove('transparentDocument');
            backgroundContainer.classList.remove('backgroundContainer-transparent');
            backdropContainer.classList.remove('hide');
        }
    }

    function pushState(state, title, url) {
        state.navigate = false;
        page.pushState(state, title, url);
    }

    function setBaseRoute() {
        var baseRoute = self.location.pathname.replace(getRequestFile(), '');
        if (baseRoute.lastIndexOf('/') === baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.debug('setting page base to ' + baseRoute);
        page.base(baseRoute);
    }

    setBaseRoute();

    function invokeShortcut(id) {
        if (id.indexOf('library-') === 0) {
            id = id.replace('library-', '');
            id = id.split('_');

            appRouter.showItem(id[0], id[1]);
        } else if (id.indexOf('item-') === 0) {
            id = id.replace('item-', '');
            id = id.split('_');

            appRouter.showItem(id[0], id[1]);
        } else {
            id = id.split('_');
            appRouter.show(appRouter.getRouteUrl(id[0], {
                serverId: id[1]
            }));
        }
    }

    appRouter.addRoute = addRoute;
    appRouter.param = param;
    appRouter.back = back;
    appRouter.show = show;
    appRouter.showDirect = showDirect;
    appRouter.start = start;
    appRouter.baseUrl = baseUrl;
    appRouter.canGoBack = canGoBack;
    appRouter.current = current;
    appRouter.beginConnectionWizard = beginConnectionWizard;
    appRouter.invokeShortcut = invokeShortcut;
    appRouter.showItem = showItem;
    appRouter.setTransparency = setTransparency;
    appRouter.getRoutes = getRoutes;
    appRouter.pushState = pushState;
    appRouter.enableNativeHistory = enableNativeHistory;
    appRouter.handleAnchorClick = page.handleAnchorClick;
    appRouter.TransparencyLevel = {
        None: 0,
        Backdrop: 1,
        Full: 2
    };

    return appRouter;
});
