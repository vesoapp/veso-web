var requirejs, require, define;
! function(global, Promise, undef) {
    function commentReplace(match, singlePrefix) {
        return singlePrefix || ""
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop)
    }

    function getOwn(obj, prop) {
        return obj && hasProp(obj, prop) && obj[prop]
    }

    function obj() {
        return Object.create(null)
    }

    function eachProp(obj, func) {
        var prop;
        for (prop in obj)
            if (hasProp(obj, prop) && func(obj[prop], prop)) break
    }

    function mixin(target, source, force, deepStringMixin) {
        return source && eachProp(source, function(value, prop) {
            !force && hasProp(target, prop) || (!deepStringMixin || "object" != typeof value || !value || Array.isArray(value) || "function" == typeof value || value instanceof RegExp ? target[prop] = value : (target[prop] || (target[prop] = {}), mixin(target[prop], value, force, deepStringMixin)))
        }), target
    }

    function getGlobal(value) {
        if (!value) return value;
        var g = global;
        return value.split(".").forEach(function(part) {
            g = g[part]
        }), g
    }

    function newContext(contextName) {
        function trimDots(ary) {
            var i, part, length = ary.length;
            for (i = 0; i < length; i++)
                if ("." === (part = ary[i])) ary.splice(i, 1), i -= 1;
                else if (".." === part) {
                if (0 === i || 1 === i && ".." === ary[2] || ".." === ary[i - 1]) continue;
                i > 0 && (ary.splice(i - 1, 2), i -= 2)
            }
        }

        function normalize(name, baseName, applyMap) {
            var mapValue, nameParts, i, j, nameSegment, lastIndex, foundMap, foundI, foundStarMap, starI, baseParts = baseName && baseName.split("/"),
                normalizedBaseParts = baseParts,
                map = config.map,
                starMap = map && map["*"];
            if (name && (name = name.split("/"), lastIndex = name.length - 1, config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex]) && (name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, "")), "." === name[0].charAt(0) && baseParts && (normalizedBaseParts = baseParts.slice(0, baseParts.length - 1), name = normalizedBaseParts.concat(name)), trimDots(name), name = name.join("/")), applyMap && map && (baseParts || starMap)) {
                nameParts = name.split("/");
                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    if (nameSegment = nameParts.slice(0, i).join("/"), baseParts)
                        for (j = baseParts.length; j > 0; j -= 1)
                            if ((mapValue = getOwn(map, baseParts.slice(0, j).join("/"))) && (mapValue = getOwn(mapValue, nameSegment))) {
                                foundMap = mapValue, foundI = i;
                                break outerLoop
                            }! foundStarMap && starMap && getOwn(starMap, nameSegment) && (foundStarMap = getOwn(starMap, nameSegment), starI = i)
                }!foundMap && foundStarMap && (foundMap = foundStarMap, foundI = starI), foundMap && (nameParts.splice(0, foundI, foundMap), name = nameParts.join("/"))
            }
            return getOwn(config.pkgs, name) || name
        }

        function makeShimExports(value) {
            function fn() {
                var ret;
                return value.init && (ret = value.init.apply(global, arguments)), ret || value.exports && getGlobal(value.exports)
            }
            return fn
        }

        function takeQueue(anonId) {
            var i, id, args, shim;
            for (i = 0; i < queue.length; i += 1) {
                if ("string" != typeof queue[i][0]) {
                    if (!anonId) break;
                    queue[i].unshift(anonId), anonId = undef
                }
                args = queue.shift(), id = args[0], i -= 1, id in defined || id in waiting || (id in deferreds ? main.apply(undef, args) : waiting[id] = args)
            }
            anonId && (shim = getOwn(config.shim, anonId) || {}, main(anonId, shim.deps || [], shim.exportsFn))
        }

        function makeRequire(relName, topLevel) {
            var req = function(deps, callback, errback, alt) {
                var name, cfg;
                if (topLevel && takeQueue(), "string" == typeof deps) {
                    if (handlers[deps]) return handlers[deps](relName);
                    if (!((name = makeMap(deps, relName, !0).id) in defined)) throw new Error("Not loaded: " + name);
                    return defined[name]
                }
                return deps && !Array.isArray(deps) && (cfg = deps, deps = undef, Array.isArray(callback) && (deps = callback, callback = errback, errback = alt), topLevel) ? req.config(cfg)(deps, callback, errback) : (callback = callback || function() {
                    return slice.call(arguments, 0)
                }, asyncResolve.then(function() {
                    return takeQueue(), main(undef, deps || [], callback, errback, relName)
                }))
            };
            return req.isBrowser = "undefined" != typeof document && "undefined" != typeof navigator, req.nameToUrl = function(moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url, parentPath, bundleId, pkgMain = getOwn(config.pkgs, moduleName);
                if (pkgMain && (moduleName = pkgMain), bundleId = getOwn(bundlesMap, moduleName)) return req.nameToUrl(bundleId, ext, skipExt);
                if (urlRegExp.test(moduleName)) url = moduleName + (ext || "");
                else {
                    for (paths = config.paths, syms = moduleName.split("/"), i = syms.length; i > 0; i -= 1)
                        if (parentModule = syms.slice(0, i).join("/"), parentPath = getOwn(paths, parentModule)) {
                            Array.isArray(parentPath) && (parentPath = parentPath[0]), syms.splice(0, i, parentPath);
                            break
                        } url = syms.join("/"), url += ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? "" : ".js"), url = ("/" === url.charAt(0) || url.match(/^[\w\+\.\-]+:/) ? "" : config.baseUrl) + url
                }
                return config.urlArgs && !/^blob\:/.test(url) ? url + config.urlArgs(moduleName, url) : url
            }, req.toUrl = function(moduleNamePlusExt) {
                var ext, index = moduleNamePlusExt.lastIndexOf("."),
                    segment = moduleNamePlusExt.split("/")[0],
                    isRelative = "." === segment || ".." === segment;
                return -1 !== index && (!isRelative || index > 1) && (ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length), moduleNamePlusExt = moduleNamePlusExt.substring(0, index)), req.nameToUrl(normalize(moduleNamePlusExt, relName), ext, !0)
            }, req.defined = function(id) {
                return makeMap(id, relName, !0).id in defined
            }, req.specified = function(id) {
                return (id = makeMap(id, relName, !0).id) in defined || id in deferreds
            }, req
        }

        function resolve(name, d, value) {
            name && (defined[name] = value, requirejs.onResourceLoad && requirejs.onResourceLoad(context, d.map, d.deps)), d.finished = !0, d.resolve(value)
        }

        function reject(d, err) {
            d.finished = !0, d.rejected = !0, d.reject(err)
        }

        function makeNormalize(relName) {
            return function(name) {
                return normalize(name, relName, !0)
            }
        }

        function defineModule(d) {
            d.factoryCalled = !0;
            var ret, name = d.map.id;
            try {
                ret = context.execCb(name, d.factory, d.values, defined[name])
            } catch (err) {
                return reject(d, err)
            }
            name ? ret === undef && (d.cjsModule ? ret = d.cjsModule.exports : d.usingExports && (ret = defined[name])) : requireDeferreds.splice(requireDeferreds.indexOf(d), 1), resolve(name, d, ret)
        }

        function depFinished(val, i) {
            this.rejected || this.depDefined[i] || (this.depDefined[i] = !0, this.depCount += 1, this.values[i] = val, this.depending || this.depCount !== this.depMax || defineModule(this))
        }

        function makeDefer(name, calculatedMap) {
            var d = {};
            return d.promise = new Promise(function(resolve, reject) {
                d.resolve = resolve, d.reject = function(err) {
                    name || requireDeferreds.splice(requireDeferreds.indexOf(d), 1), reject(err)
                }
            }), d.map = name ? calculatedMap || makeMap(name) : {}, d.depCount = 0, d.depMax = 0, d.values = [], d.depDefined = [], d.depFinished = depFinished, d.map.pr && (d.deps = [makeMap(d.map.pr)]), d
        }

        function getDefer(name, calculatedMap) {
            var d;
            return name ? (d = name in deferreds && deferreds[name]) || (d = deferreds[name] = makeDefer(name, calculatedMap)) : (d = makeDefer(), requireDeferreds.push(d)), d
        }

        function makeErrback(d, name) {
            return function(err) {
                d.rejected || (err.dynaId || (err.dynaId = "id" + (errCount += 1), err.requireModules = [name]), reject(d, err))
            }
        }

        function waitForDep(depMap, relName, d, i) {
            d.depMax += 1, callDep(depMap, relName).then(function(val) {
                d.depFinished(val, i)
            }, makeErrback(d, depMap.id)).catch(makeErrback(d, d.map.id))
        }

        function makeLoad(id) {
            function load(value) {
                fromTextCalled || resolve(id, getDefer(id), value)
            }
            var fromTextCalled;
            return load.error = function(err) {
                reject(getDefer(id), err)
            }, load.fromText = function(text, textAlt) {
                var execError, d = getDefer(id),
                    map = makeMap(makeMap(id).n),
                    plainId = map.id;
                fromTextCalled = !0, d.factory = function(p, val) {
                    return val
                }, textAlt && (text = textAlt), hasProp(config.config, id) && (config.config[plainId] = config.config[id]);
                try {
                    req.exec(text)
                } catch (e) {
                    execError = new Error("fromText eval for " + plainId + " failed: " + e), execError.requireType = "fromtexteval", reject(d, execError)
                }
                takeQueue(plainId), d.deps = [map], waitForDep(map, null, d, d.deps.length)
            }, load
        }

        function callPlugin(plugin, map, relName) {
            plugin.load(map.n, makeRequire(relName), makeLoad(map.id), config)
        }

        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf("!") : -1;
            return index > -1 && (prefix = name.substring(0, index), name = name.substring(index + 1, name.length)), [prefix, name]
        }

        function breakCycle(d, traced, processed) {
            var id = d.map.id;
            traced[id] = !0, !d.finished && d.deps && d.deps.forEach(function(depMap) {
                var depId = depMap.id,
                    dep = !hasProp(handlers, depId) && getDefer(depId, depMap);
                !dep || dep.finished || processed[depId] || (hasProp(traced, depId) ? d.deps.forEach(function(depMap, i) {
                    depMap.id === depId && d.depFinished(defined[depId], i)
                }) : breakCycle(dep, traced, processed))
            }), processed[id] = !0
        }

        function check(d) {
            var err, mid, dfd, notFinished = [],
                waitInterval = 1e3 * config.waitSeconds,
                expired = waitInterval && startTime + waitInterval < (new Date).getTime();
            if (0 === loadCount && (d ? d.finished || breakCycle(d, {}, {}) : requireDeferreds.length && requireDeferreds.forEach(function(d) {
                    breakCycle(d, {}, {})
                })), expired) {
                for (mid in deferreds) dfd = deferreds[mid], dfd.finished || notFinished.push(dfd.map.id);
                err = new Error("Timeout for modules: " + notFinished), err.requireModules = notFinished, err.requireType = "timeout", notFinished.forEach(function(id) {
                    reject(getDefer(id), err)
                })
            } else(loadCount || requireDeferreds.length) && (checkingLater || (checkingLater = !0, setTimeout(function() {
                checkingLater = !1, check()
            }, 70)))
        }

        function delayedError(e) {
            console.log(e.stack);
            return setTimeout(function() {
                e.dynaId && trackedErrors[e.dynaId] || (trackedErrors[e.dynaId] = !0, req.onError(e))
            }), e
        }
        var req, main, makeMap, callDep, handlers, checkingLater, load, context, defined = obj(),
            waiting = obj(),
            config = {
                waitSeconds: 7,
                baseUrl: "./",
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            mapCache = obj(),
            requireDeferreds = [],
            deferreds = obj(),
            calledDefine = obj(),
            calledPlugin = obj(),
            loadCount = 0,
            startTime = (new Date).getTime(),
            errCount = 0,
            trackedErrors = obj(),
            urlFetched = obj(),
            bundlesMap = obj(),
            asyncResolve = Promise.resolve(undefined);
        return load = "function" == typeof importScripts ? function(map) {
            var url = map.url;
            urlFetched[url] || (urlFetched[url] = !0, getDefer(map.id), importScripts(url), takeQueue(map.id))
        } : function(map) {
            var script, id = map.id,
                url = map.url;
            urlFetched[url] || (urlFetched[url] = !0, script = document.createElement("script"), script.setAttribute("data-requiremodule", id), script.type = config.scriptType || "text/javascript", script.charset = "utf-8", script.async = !0, loadCount += 1, script.addEventListener("load", function() {
                loadCount -= 1, takeQueue(id)
            }, !1), script.addEventListener("error", function() {
                loadCount -= 1;
                var err, pathConfig = getOwn(config.paths, id);
                if (pathConfig && Array.isArray(pathConfig) && pathConfig.length > 1) {
                    script.parentNode.removeChild(script), pathConfig.shift();
                    var d = getDefer(id);
                    d.map = makeMap(id), d.map.url = req.nameToUrl(id), load(d.map)
                } else err = new Error("Load failed: " + id + ": " + script.src), err.requireModules = [id], err.requireType = "scripterror", reject(getDefer(id), err)
            }, !1), script.src = url, 10 === document.documentMode ? asap.then(function() {
                document.head.appendChild(script)
            }) : document.head.appendChild(script))
        }, callDep = function(map, relName) {
            var args, bundleId, name = map.id,
                shim = config.shim[name];
            if (name in waiting) args = waiting[name], delete waiting[name], main.apply(undef, args);
            else if (!(name in deferreds))
                if (map.pr) {
                    if (!(bundleId = getOwn(bundlesMap, name))) return callDep(makeMap(map.pr)).then(function(plugin) {
                        var newMap = map.prn ? map : makeMap(name, relName, !0),
                            newId = newMap.id,
                            shim = getOwn(config.shim, newId);
                        return newId in calledPlugin || (calledPlugin[newId] = !0, shim && shim.deps ? req(shim.deps, function() {
                            callPlugin(plugin, newMap, relName)
                        }) : callPlugin(plugin, newMap, relName)), getDefer(newId).promise
                    });
                    map.url = req.nameToUrl(bundleId), load(map)
                } else shim && shim.deps ? req(shim.deps, function() {
                    load(map)
                }) : load(map);
            return getDefer(name).promise
        }, makeMap = function(name, relName, applyMap) {
            if ("string" != typeof name) return name;
            var plugin, url, parts, prefix, result, prefixNormalized, cacheKey = name + " & " + (relName || "") + " & " + !!applyMap;
            return parts = splitPrefix(name), prefix = parts[0], name = parts[1], !prefix && cacheKey in mapCache ? mapCache[cacheKey] : (prefix && (prefix = normalize(prefix, relName, applyMap), plugin = prefix in defined && defined[prefix]), prefix ? plugin && plugin.normalize ? (name = plugin.normalize(name, makeNormalize(relName)), prefixNormalized = !0) : name = -1 === name.indexOf("!") ? normalize(name, relName, applyMap) : name : (name = normalize(name, relName, applyMap), parts = splitPrefix(name), prefix = parts[0], name = parts[1], url = req.nameToUrl(name)), result = {
                id: prefix ? prefix + "!" + name : name,
                n: name,
                pr: prefix,
                url: url,
                prn: prefix && prefixNormalized
            }, prefix || (mapCache[cacheKey] = result), result)
        }, handlers = {
            require: function(name) {
                return makeRequire(name)
            },
            exports: function(name) {
                var e = defined[name];
                return void 0 !== e ? e : defined[name] = {}
            },
            module: function(name) {
                return {
                    id: name,
                    uri: "",
                    exports: handlers.exports(name),
                    config: function() {
                        return getOwn(config.config, name) || {}
                    }
                }
            }
        }, main = function(name, deps, factory, errback, relName) {
            if (name) {
                if (name in calledDefine) return;
                calledDefine[name] = !0
            }
            var d = getDefer(name);
            return deps && !Array.isArray(deps) && (factory = deps, deps = []), deps = deps ? slice.call(deps, 0) : null, errback || (hasProp(config, "defaultErrback") ? config.defaultErrback && (errback = config.defaultErrback) : errback = delayedError), errback && d.promise.catch(errback), relName = relName || name, "function" == typeof factory ? (!deps.length && factory.length && (factory.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function(match, dep) {
                deps.push(dep)
            }), deps = (1 === factory.length ? ["require"] : ["require", "exports", "module"]).concat(deps)), d.factory = factory, d.deps = deps, d.depending = !0, deps.forEach(function(depName, i) {
                var depMap;
                deps[i] = depMap = makeMap(depName, relName, !0), depName = depMap.id, "require" === depName ? d.values[i] = handlers.require(name) : "exports" === depName ? (d.values[i] = handlers.exports(name), d.usingExports = !0) : "module" === depName ? d.values[i] = d.cjsModule = handlers.module(name) : void 0 === depName ? d.values[i] = void 0 : waitForDep(depMap, relName, d, i)
            }), d.depending = !1, d.depCount === d.depMax && defineModule(d)) : name && resolve(name, d, factory), startTime = (new Date).getTime(), name || check(d), d.promise
        }, req = makeRequire(null, !0), req.config = function(cfg) {
            if (cfg.context && cfg.context !== contextName) {
                var existingContext = getOwn(contexts, cfg.context);
                return existingContext ? existingContext.req.config(cfg) : newContext(cfg.context).config(cfg)
            }
            if (mapCache = obj(), cfg.baseUrl && "/" !== cfg.baseUrl.charAt(cfg.baseUrl.length - 1) && (cfg.baseUrl += "/"), "string" == typeof cfg.urlArgs) {
                var urlArgs = cfg.urlArgs;
                cfg.urlArgs = function(id, url) {
                    return (-1 === url.indexOf("?") ? "?" : "&") + urlArgs
                }
            }
            var shim = config.shim,
                objs = {
                    paths: !0,
                    bundles: !0,
                    config: !0,
                    map: !0
                };
            return eachProp(cfg, function(value, prop) {
                objs[prop] ? (config[prop] || (config[prop] = {}), mixin(config[prop], value, !0, !0)) : config[prop] = value
            }), cfg.bundles && eachProp(cfg.bundles, function(value, prop) {
                value.forEach(function(v) {
                    v !== prop && (bundlesMap[v] = prop)
                })
            }), cfg.shim && (eachProp(cfg.shim, function(value, id) {
                Array.isArray(value) && (value = {
                    deps: value
                }), !value.exports && !value.init || value.exportsFn || (value.exportsFn = makeShimExports(value)), shim[id] = value
            }), config.shim = shim), cfg.packages && cfg.packages.forEach(function(pkgObj) {
                var location, name;
                pkgObj = "string" == typeof pkgObj ? {
                    name: pkgObj
                } : pkgObj, name = pkgObj.name, location = pkgObj.location, location && (config.paths[name] = pkgObj.location), config.pkgs[name] = pkgObj.name + "/" + (pkgObj.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "")
            }), (cfg.deps || cfg.callback) && req(cfg.deps, cfg.callback), req
        }, req.onError = function(err) {
            throw err
        }, context = {
            id: contextName,
            defined: defined,
            waiting: waiting,
            config: config,
            deferreds: deferreds,
            req: req,
            execCb: function(name, callback, args, exports) {
                return callback.apply(exports, args)
            }
        }, contexts[contextName] = context, req
    }
    if (!Promise) throw new Error("No Promise implementation available");
    var topReq, dataMain, src, subPath, bootstrapConfig = requirejs || require,
        hasOwn = Object.prototype.hasOwnProperty,
        contexts = {},
        queue = [],
        currDirRegExp = /^\.\//,
        urlRegExp = /^\/|\:|\?|\.js$/,
        commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        slice = Array.prototype.slice;
    if ("function" != typeof requirejs) {
        var asap = Promise.resolve(void 0);
        requirejs = topReq = newContext("_"), "function" != typeof require && (require = topReq), topReq.exec = function(text) {
            return eval(text)
        }, topReq.contexts = contexts, define = function() {
            queue.push(slice.call(arguments, 0))
        }, define.amd = {
            jQuery: !0
        }, bootstrapConfig && topReq.config(bootstrapConfig), topReq.isBrowser && !contexts._.config.skipDataMain && (dataMain = document.querySelectorAll("script[data-main]")[0], (dataMain = dataMain && dataMain.getAttribute("data-main")) && (dataMain = dataMain.replace(jsSuffixRegExp, ""), bootstrapConfig && bootstrapConfig.baseUrl || -1 !== dataMain.indexOf("!") || (src = dataMain.split("/"), dataMain = src.pop(), subPath = src.length ? src.join("/") + "/" : "./", topReq.config({
            baseUrl: subPath
        })), topReq([dataMain])))
    }
}(this, "undefined" != typeof Promise ? Promise : void 0);
