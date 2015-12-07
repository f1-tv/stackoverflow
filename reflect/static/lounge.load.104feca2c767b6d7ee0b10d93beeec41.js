var requirejs;
var require;
var define;
!function(context) {
  /**
   * @param {Function} it
   * @return {?}
   */
  function isFunction(it) {
    return "[object Function]" === ostring.call(it);
  }
  /**
   * @param {?} it
   * @return {?}
   */
  function isArray(it) {
    return "[object Array]" === ostring.call(it);
  }
  /**
   * @param {Array} collection
   * @param {Function} callback
   * @return {undefined}
   */
  function each(collection, callback) {
    if (collection) {
      var index;
      /** @type {number} */
      index = 0;
      for (;index < collection.length && (!collection[index] || !callback(collection[index], index, collection));index += 1) {
      }
    }
  }
  /**
   * @param {Array} ary
   * @param {Function} func
   * @return {undefined}
   */
  function eachReverse(ary, func) {
    if (ary) {
      var i;
      /** @type {number} */
      i = ary.length - 1;
      for (;i > -1 && (!ary[i] || !func(ary[i], i, ary));i -= 1) {
      }
    }
  }
  /**
   * @param {Object} obj
   * @param {string} prop
   * @return {?}
   */
  function hasProp(obj, prop) {
    return hasOwn.call(obj, prop);
  }
  /**
   * @param {Object} obj
   * @param {string} prop
   * @return {?}
   */
  function getOwn(obj, prop) {
    return hasProp(obj, prop) && obj[prop];
  }
  /**
   * @param {Object} obj
   * @param {Function} func
   * @return {undefined}
   */
  function eachProp(obj, func) {
    var prop;
    for (prop in obj) {
      if (hasProp(obj, prop) && func(obj[prop], prop)) {
        break;
      }
    }
  }
  /**
   * @param {Object} target
   * @param {?} source
   * @param {boolean} force
   * @param {boolean} deepStringMixin
   * @return {?}
   */
  function mixin(target, source, force, deepStringMixin) {
    return source && eachProp(source, function(value, prop) {
      if (force || !hasProp(target, prop)) {
        if (!deepStringMixin || ("object" != typeof value || (!value || (isArray(value) || (isFunction(value) || value instanceof RegExp))))) {
          target[prop] = value;
        } else {
          if (!target[prop]) {
            target[prop] = {};
          }
          mixin(target[prop], value, force, deepStringMixin);
        }
      }
    }), target;
  }
  /**
   * @param {?} scope
   * @param {Function} fn
   * @return {?}
   */
  function bind(scope, fn) {
    return function() {
      return fn.apply(scope, arguments);
    };
  }
  /**
   * @return {?}
   */
  function scripts() {
    return document.getElementsByTagName("script");
  }
  /**
   * @param {?} err
   * @return {?}
   */
  function defaultOnError(err) {
    throw err;
  }
  /**
   * @param {string} value
   * @return {?}
   */
  function getGlobal(value) {
    if (!value) {
      return value;
    }
    /** @type {global this} */
    var cur = context;
    return each(value.split("."), function(dir) {
      cur = cur[dir];
    }), cur;
  }
  /**
   * @param {string} id
   * @param {string} msg
   * @param {Error} err
   * @param {(Array|string)} requireModules
   * @return {?}
   */
  function makeError(id, msg, err, requireModules) {
    /** @type {Error} */
    var e = new Error(msg + "\nhttp://requirejs.org/docs/errors.html#" + id);
    return e.requireType = id, e.requireModules = requireModules, err && (e.originalError = err), e;
  }
  /**
   * @param {string} contextName
   * @return {?}
   */
  function newContext(contextName) {
    /**
     * @param {Array} ary
     * @return {undefined}
     */
    function trimDots(ary) {
      var i;
      var part;
      /** @type {number} */
      i = 0;
      for (;i < ary.length;i++) {
        if (part = ary[i], "." === part) {
          ary.splice(i, 1);
          i -= 1;
        } else {
          if (".." === part) {
            if (0 === i || (1 == i && ".." === ary[2] || ".." === ary[i - 1])) {
              continue;
            }
            if (i > 0) {
              ary.splice(i - 1, 2);
              i -= 2;
            }
          }
        }
      }
    }
    /**
     * @param {string} name
     * @param {string} baseName
     * @param {boolean} applyMap
     * @return {?}
     */
    function normalize(name, baseName, applyMap) {
      var pkgMain;
      var mapValue;
      var nameParts;
      var num;
      var j;
      var nameSegment;
      var lastIndex;
      var foundMap;
      var i;
      var foundStarMap;
      var arg;
      var l;
      var baseParts = baseName && baseName.split("/");
      var map = config.map;
      var starMap = map && map["*"];
      if (name && (name = name.split("/"), lastIndex = name.length - 1, config.nodeIdCompat && (jsSuffixRegExp.test(name[lastIndex]) && (name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, ""))), "." === name[0].charAt(0) && (baseParts && (l = baseParts.slice(0, baseParts.length - 1), name = l.concat(name))), trimDots(name), name = name.join("/")), applyMap && (map && (baseParts || starMap))) {
        nameParts = name.split("/");
        num = nameParts.length;
        a: for (;num > 0;num -= 1) {
          if (nameSegment = nameParts.slice(0, num).join("/"), baseParts) {
            j = baseParts.length;
            for (;j > 0;j -= 1) {
              if (mapValue = getOwn(map, baseParts.slice(0, j).join("/")), mapValue && (mapValue = getOwn(mapValue, nameSegment))) {
                foundMap = mapValue;
                i = num;
                break a;
              }
            }
          }
          if (!foundStarMap) {
            if (starMap) {
              if (getOwn(starMap, nameSegment)) {
                foundStarMap = getOwn(starMap, nameSegment);
                arg = num;
              }
            }
          }
        }
        if (!foundMap) {
          if (foundStarMap) {
            foundMap = foundStarMap;
            i = arg;
          }
        }
        if (foundMap) {
          nameParts.splice(0, i, foundMap);
          name = nameParts.join("/");
        }
      }
      return pkgMain = getOwn(config.pkgs, name), pkgMain ? pkgMain : name;
    }
    /**
     * @param {string} name
     * @return {undefined}
     */
    function removeScript(name) {
      if (isBrowser) {
        each(scripts(), function(scriptNode) {
          return scriptNode.getAttribute("data-requiremodule") === name && scriptNode.getAttribute("data-requirecontext") === context.contextName ? (scriptNode.parentNode.removeChild(scriptNode), true) : void 0;
        });
      }
    }
    /**
     * @param {string} id
     * @return {?}
     */
    function hasPathFallback(id) {
      var pathConfig = getOwn(config.paths, id);
      return pathConfig && (isArray(pathConfig) && pathConfig.length > 1) ? (pathConfig.shift(), context.require.undef(id), context.makeRequire(null, {
        skipMap : true
      })([id]), true) : void 0;
    }
    /**
     * @param {string} name
     * @return {?}
     */
    function splitPrefix(name) {
      var prefix;
      var index = name ? name.indexOf("!") : -1;
      return index > -1 && (prefix = name.substring(0, index), name = name.substring(index + 1, name.length)), [prefix, name];
    }
    /**
     * @param {string} name
     * @param {string} parentModuleMap
     * @param {boolean} recurring
     * @param {boolean} applyMap
     * @return {?}
     */
    function makeModuleMap(name, parentModuleMap, recurring, applyMap) {
      var url;
      var pluginModule;
      var suffix;
      var nameParts;
      /** @type {null} */
      var prefix = null;
      var parentName = parentModuleMap ? parentModuleMap.name : null;
      /** @type {string} */
      var originalName = name;
      /** @type {boolean} */
      var isDefine = true;
      /** @type {string} */
      var normalizedName = "";
      return name || (isDefine = false, name = "_@r" + (F += 1)), nameParts = splitPrefix(name), prefix = nameParts[0], name = nameParts[1], prefix && (prefix = normalize(prefix, parentName, applyMap), pluginModule = getOwn(defined, prefix)), name && (prefix ? normalizedName = pluginModule && pluginModule.normalize ? pluginModule.normalize(name, function(name) {
        return normalize(name, parentName, applyMap);
      }) : -1 === name.indexOf("!") ? normalize(name, parentName, applyMap) : name : (normalizedName = normalize(name, parentName, applyMap), nameParts = splitPrefix(normalizedName), prefix = nameParts[0], normalizedName = nameParts[1], recurring = true, url = context.nameToUrl(normalizedName))), suffix = !prefix || (pluginModule || recurring) ? "" : "_unnormalized" + (unnormalizedCounter += 1), {
        prefix : prefix,
        name : normalizedName,
        parentMap : parentModuleMap,
        unnormalized : !!suffix,
        url : url,
        originalName : originalName,
        isDefine : isDefine,
        id : (prefix ? prefix + "!" + normalizedName : normalizedName) + suffix
      };
    }
    /**
     * @param {Object} depMap
     * @return {?}
     */
    function getModule(depMap) {
      var id = depMap.id;
      var mod = getOwn(registry, id);
      return mod || (mod = registry[id] = new context.Module(depMap)), mod;
    }
    /**
     * @param {Object} depMap
     * @param {string} name
     * @param {?} fn
     * @return {undefined}
     */
    function on(depMap, name, fn) {
      var id = depMap.id;
      var mod = getOwn(registry, id);
      if (!hasProp(defined, id) || mod && !mod.defineEmitComplete) {
        mod = getModule(depMap);
        if (mod.error && "error" === name) {
          fn(mod.error);
        } else {
          mod.on(name, fn);
        }
      } else {
        if ("defined" === name) {
          fn(defined[id]);
        }
      }
    }
    /**
     * @param {boolean} err
     * @param {Function} errback
     * @return {undefined}
     */
    function onError(err, errback) {
      var ids = err.requireModules;
      /** @type {boolean} */
      var d = false;
      if (errback) {
        errback(err);
      } else {
        each(ids, function(id) {
          var mod = getOwn(registry, id);
          if (mod) {
            /** @type {boolean} */
            mod.error = err;
            if (mod.events.error) {
              /** @type {boolean} */
              d = true;
              mod.emit("error", err);
            }
          }
        });
        if (!d) {
          req.onError(err);
        }
      }
    }
    /**
     * @return {undefined}
     */
    function takeGlobalQueue() {
      if (globalDefQueue.length) {
        apsp.apply(defQueue, [defQueue.length, 0].concat(globalDefQueue));
        /** @type {Array} */
        globalDefQueue = [];
      }
    }
    /**
     * @param {string} id
     * @return {undefined}
     */
    function cleanRegistry(id) {
      delete registry[id];
      delete enabledRegistry[id];
    }
    /**
     * @param {Object} mod
     * @param {Object} traced
     * @param {Object} processed
     * @return {undefined}
     */
    function breakCycle(mod, traced, processed) {
      var id = mod.map.id;
      if (mod.error) {
        mod.emit("error", mod.error);
      } else {
        /** @type {boolean} */
        traced[id] = true;
        each(mod.depMaps, function(depMap, i) {
          var depId = depMap.id;
          var dep = getOwn(registry, depId);
          if (!!dep) {
            if (!mod.depMatched[i]) {
              if (!processed[depId]) {
                if (getOwn(traced, depId)) {
                  mod.defineDep(i, defined[depId]);
                  mod.check();
                } else {
                  breakCycle(dep, traced, processed);
                }
              }
            }
          }
        });
        /** @type {boolean} */
        processed[id] = true;
      }
    }
    /**
     * @return {?}
     */
    function checkLoaded() {
      var err;
      var b;
      /** @type {number} */
      var waitInterval = 1E3 * config.waitSeconds;
      /** @type {(boolean|number)} */
      var expired = waitInterval && context.startTime + waitInterval < (new Date).getTime();
      /** @type {Array} */
      var noLoads = [];
      /** @type {Array} */
      var keys = [];
      /** @type {boolean} */
      var i = false;
      /** @type {boolean} */
      var k = true;
      if (!s) {
        if (s = true, eachProp(enabledRegistry, function(mod) {
          var map = mod.map;
          var modId = map.id;
          if (mod.enabled && (map.isDefine || keys.push(mod), !mod.error)) {
            if (!mod.inited && expired) {
              if (hasPathFallback(modId)) {
                /** @type {boolean} */
                b = true;
                /** @type {boolean} */
                i = true;
              } else {
                noLoads.push(modId);
                removeScript(modId);
              }
            } else {
              if (!mod.inited && (mod.fetched && (map.isDefine && (i = true, !map.prefix)))) {
                return k = false;
              }
            }
          }
        }), expired && noLoads.length) {
          return err = makeError("timeout", "Load timeout for modules: " + noLoads, null, noLoads), err.contextName = context.contextName, onError(err);
        }
        if (k) {
          each(keys, function(mod) {
            breakCycle(mod, {}, {});
          });
        }
        if (!(expired && !b)) {
          if (!!i) {
            if (!(!isBrowser && !isWebWorker)) {
              if (!abortTimeout) {
                /** @type {number} */
                abortTimeout = setTimeout(function() {
                  /** @type {number} */
                  abortTimeout = 0;
                  checkLoaded();
                }, 50);
              }
            }
          }
        }
        /** @type {boolean} */
        s = false;
      }
    }
    /**
     * @param {Array} args
     * @return {undefined}
     */
    function callGetModule(args) {
      if (!hasProp(defined, args[0])) {
        getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
      }
    }
    /**
     * @param {HTMLDocument} node
     * @param {?} func
     * @param {string} name
     * @param {string} ieName
     * @return {undefined}
     */
    function removeListener(node, func, name, ieName) {
      if (node.detachEvent && !isOpera) {
        if (ieName) {
          node.detachEvent(ieName, func);
        }
      } else {
        node.removeEventListener(name, func, false);
      }
    }
    /**
     * @param {Event} evt
     * @return {?}
     */
    function getScriptData(evt) {
      var node = evt.currentTarget || evt.srcElement;
      return removeListener(node, context.onScriptLoad, "load", "onreadystatechange"), removeListener(node, context.onScriptError, "error"), {
        node : node,
        id : node && node.getAttribute("data-requiremodule")
      };
    }
    /**
     * @return {?}
     */
    function intakeDefines() {
      var args;
      takeGlobalQueue();
      for (;defQueue.length;) {
        if (args = defQueue.shift(), null === args[0]) {
          return onError(makeError("mismatch", "Mismatched anonymous define() module: " + args[args.length - 1]));
        }
        callGetModule(args);
      }
    }
    var s;
    var Module;
    var context;
    var handlers;
    var abortTimeout;
    var config = {
      waitSeconds : 7,
      baseUrl : "./",
      paths : {},
      bundles : {},
      pkgs : {},
      shim : {},
      config : {}
    };
    var registry = {};
    var enabledRegistry = {};
    var undefEvents = {};
    /** @type {Array} */
    var defQueue = [];
    var defined = {};
    var urlFetched = {};
    var bundlesMap = {};
    /** @type {number} */
    var F = 1;
    /** @type {number} */
    var unnormalizedCounter = 1;
    return handlers = {
      /**
       * @param {Object} mod
       * @return {?}
       */
      require : function(mod) {
        return mod.require ? mod.require : mod.require = context.makeRequire(mod.map);
      },
      /**
       * @param {Object} mod
       * @return {?}
       */
      exports : function(mod) {
        return mod.usingExports = true, mod.map.isDefine ? mod.exports ? defined[mod.map.id] = mod.exports : mod.exports = defined[mod.map.id] = {} : void 0;
      },
      /**
       * @param {Object} mod
       * @return {?}
       */
      module : function(mod) {
        return mod.module ? mod.module : mod.module = {
          id : mod.map.id,
          uri : mod.map.url,
          /**
           * @return {?}
           */
          config : function() {
            return getOwn(config.config, mod.map.id) || {};
          },
          exports : mod.exports || (mod.exports = {})
        };
      }
    }, Module = function(map) {
      this.events = getOwn(undefEvents, map.id) || {};
      /** @type {string} */
      this.map = map;
      this.shim = getOwn(config.shim, map.id);
      /** @type {Array} */
      this.depExports = [];
      /** @type {Array} */
      this.depMaps = [];
      /** @type {Array} */
      this.depMatched = [];
      this.pluginMaps = {};
      /** @type {number} */
      this.depCount = 0;
    }, Module.prototype = {
      /**
       * @param {Object} depMaps
       * @param {Function} factory
       * @param {Function} errback
       * @param {Object} options
       * @return {undefined}
       */
      init : function(depMaps, factory, errback, options) {
        options = options || {};
        if (!this.inited) {
          /** @type {Function} */
          this.factory = factory;
          if (errback) {
            this.on("error", errback);
          } else {
            if (this.events.error) {
              errback = bind(this, function(err) {
                this.emit("error", err);
              });
            }
          }
          this.depMaps = depMaps && depMaps.slice(0);
          /** @type {Function} */
          this.errback = errback;
          /** @type {boolean} */
          this.inited = true;
          this.ignore = options.ignore;
          if (options.enabled || this.enabled) {
            this.enable();
          } else {
            this.check();
          }
        }
      },
      /**
       * @param {?} i
       * @param {?} depExports
       * @return {undefined}
       */
      defineDep : function(i, depExports) {
        if (!this.depMatched[i]) {
          /** @type {boolean} */
          this.depMatched[i] = true;
          this.depCount -= 1;
          this.depExports[i] = depExports;
        }
      },
      /**
       * @return {?}
       */
      fetch : function() {
        if (!this.fetched) {
          /** @type {boolean} */
          this.fetched = true;
          /** @type {number} */
          context.startTime = (new Date).getTime();
          var map = this.map;
          return this.shim ? void context.makeRequire(this.map, {
            enableBuildCallback : true
          })(this.shim.deps || [], bind(this, function() {
            return map.prefix ? this.callPlugin() : this.load();
          })) : map.prefix ? this.callPlugin() : this.load();
        }
      },
      /**
       * @return {undefined}
       */
      load : function() {
        var url = this.map.url;
        if (!urlFetched[url]) {
          /** @type {boolean} */
          urlFetched[url] = true;
          context.load(this.map.id, url);
        }
      },
      /**
       * @return {?}
       */
      check : function() {
        if (this.enabled && !this.enabling) {
          var err;
          var cjsModule;
          var id = this.map.id;
          var depExports = this.depExports;
          var exports = this.exports;
          var factory = this.factory;
          if (this.inited) {
            if (this.error) {
              this.emit("error", this.error);
            } else {
              if (!this.defining) {
                if (this.defining = true, this.depCount < 1 && !this.defined) {
                  if (isFunction(factory)) {
                    if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) {
                      try {
                        exports = context.execCb(id, factory, depExports, exports);
                      } catch (backtrace) {
                        err = backtrace;
                      }
                    } else {
                      exports = context.execCb(id, factory, depExports, exports);
                    }
                    if (this.map.isDefine && (void 0 === exports && (cjsModule = this.module, cjsModule ? exports = cjsModule.exports : this.usingExports && (exports = this.exports))), err) {
                      return err.requireMap = this.map, err.requireModules = this.map.isDefine ? [this.map.id] : null, err.requireType = this.map.isDefine ? "define" : "require", onError(this.error = err);
                    }
                  } else {
                    exports = factory;
                  }
                  this.exports = exports;
                  if (this.map.isDefine) {
                    if (!this.ignore) {
                      defined[id] = exports;
                      if (req.onResourceLoad) {
                        req.onResourceLoad(context, this.map, this.depMaps);
                      }
                    }
                  }
                  cleanRegistry(id);
                  /** @type {boolean} */
                  this.defined = true;
                }
                /** @type {boolean} */
                this.defining = false;
                if (this.defined) {
                  if (!this.defineEmitted) {
                    /** @type {boolean} */
                    this.defineEmitted = true;
                    this.emit("defined", this.exports);
                    /** @type {boolean} */
                    this.defineEmitComplete = true;
                  }
                }
              }
            }
          } else {
            this.fetch();
          }
        }
      },
      /**
       * @return {undefined}
       */
      callPlugin : function() {
        var map = this.map;
        var id = map.id;
        var pluginMap = makeModuleMap(map.prefix);
        this.depMaps.push(pluginMap);
        on(pluginMap, "defined", bind(this, function(plugin) {
          var load;
          var normalizedMap;
          var normalizedMod;
          var bundleId = getOwn(bundlesMap, this.map.id);
          var name = this.map.name;
          var parentName = this.map.parentMap ? this.map.parentMap.name : null;
          var localRequire = context.makeRequire(map.parentMap, {
            enableBuildCallback : true
          });
          return this.map.unnormalized ? (plugin.normalize && (name = plugin.normalize(name, function(name) {
            return normalize(name, parentName, true);
          }) || ""), normalizedMap = makeModuleMap(map.prefix + "!" + name, this.map.parentMap), on(normalizedMap, "defined", bind(this, function(dataAndEvents) {
            this.init([], function() {
              return dataAndEvents;
            }, null, {
              enabled : true,
              ignore : true
            });
          })), normalizedMod = getOwn(registry, normalizedMap.id), void(normalizedMod && (this.depMaps.push(normalizedMap), this.events.error && normalizedMod.on("error", bind(this, function(err) {
            this.emit("error", err);
          })), normalizedMod.enable()))) : bundleId ? (this.map.url = context.nameToUrl(bundleId), void this.load()) : (load = bind(this, function(dataAndEvents) {
            this.init([], function() {
              return dataAndEvents;
            }, null, {
              enabled : true
            });
          }), load.error = bind(this, function(err) {
            /** @type {boolean} */
            this.inited = true;
            /** @type {boolean} */
            this.error = err;
            /** @type {Array} */
            err.requireModules = [id];
            eachProp(registry, function(mod) {
              if (0 === mod.map.id.indexOf(id + "_unnormalized")) {
                cleanRegistry(mod.map.id);
              }
            });
            onError(err);
          }), load.fromText = bind(this, function(text, textAlt) {
            var moduleName = map.name;
            var moduleMap = makeModuleMap(moduleName);
            var YYSTATE = YY_START;
            if (textAlt) {
              /** @type {Element} */
              text = textAlt;
            }
            if (YYSTATE) {
              /** @type {boolean} */
              YY_START = false;
            }
            getModule(moduleMap);
            if (hasProp(config.config, id)) {
              config.config[moduleName] = config.config[id];
            }
            try {
              req.exec(text);
            } catch (e) {
              return onError(makeError("fromtexteval", "fromText eval for " + id + " failed: " + e, e, [id]));
            }
            if (YYSTATE) {
              /** @type {boolean} */
              YY_START = true;
            }
            this.depMaps.push(moduleMap);
            context.completeLoad(moduleName);
            localRequire([moduleName], load);
          }), void plugin.load(map.name, localRequire, load, config));
        }));
        context.enable(pluginMap, this);
        this.pluginMaps[pluginMap.id] = pluginMap;
      },
      /**
       * @return {undefined}
       */
      enable : function() {
        enabledRegistry[this.map.id] = this;
        /** @type {boolean} */
        this.enabled = true;
        /** @type {boolean} */
        this.enabling = true;
        each(this.depMaps, bind(this, function(depMap, i) {
          var id;
          var mod;
          var handler;
          if ("string" == typeof depMap) {
            if (depMap = makeModuleMap(depMap, this.map.isDefine ? this.map : this.map.parentMap, false, !this.skipMap), this.depMaps[i] = depMap, handler = getOwn(handlers, depMap.id)) {
              return void(this.depExports[i] = handler(this));
            }
            this.depCount += 1;
            on(depMap, "defined", bind(this, function(depExports) {
              this.defineDep(i, depExports);
              this.check();
            }));
            if (this.errback) {
              on(depMap, "error", bind(this, this.errback));
            }
          }
          id = depMap.id;
          mod = registry[id];
          if (!hasProp(handlers, id)) {
            if (!!mod) {
              if (!mod.enabled) {
                context.enable(depMap, this);
              }
            }
          }
        }));
        eachProp(this.pluginMaps, bind(this, function(pluginMap) {
          var mod = getOwn(registry, pluginMap.id);
          if (mod) {
            if (!mod.enabled) {
              context.enable(pluginMap, this);
            }
          }
        }));
        /** @type {boolean} */
        this.enabling = false;
        this.check();
      },
      /**
       * @param {string} name
       * @param {Function} cb
       * @return {undefined}
       */
      on : function(name, cb) {
        var cbs = this.events[name];
        if (!cbs) {
          /** @type {Array} */
          cbs = this.events[name] = [];
        }
        cbs.push(cb);
      },
      /**
       * @param {string} name
       * @param {boolean} evt
       * @return {undefined}
       */
      emit : function(name, evt) {
        each(this.events[name], function(cb) {
          cb(evt);
        });
        if ("error" === name) {
          delete this.events[name];
        }
      }
    }, context = {
      config : config,
      contextName : contextName,
      registry : registry,
      defined : defined,
      urlFetched : urlFetched,
      defQueue : defQueue,
      /** @type {function (string): undefined} */
      Module : Module,
      /** @type {function (string, string, boolean, boolean): ?} */
      makeModuleMap : makeModuleMap,
      nextTick : req.nextTick,
      /** @type {function (boolean, Function): undefined} */
      onError : onError,
      /**
       * @param {Object} cfg
       * @return {undefined}
       */
      configure : function(cfg) {
        if (cfg.baseUrl) {
          if ("/" !== cfg.baseUrl.charAt(cfg.baseUrl.length - 1)) {
            cfg.baseUrl += "/";
          }
        }
        var shim = config.shim;
        var objs = {
          paths : true,
          bundles : true,
          config : true,
          map : true
        };
        eachProp(cfg, function(value, prop) {
          if (objs[prop]) {
            if (!config[prop]) {
              config[prop] = {};
            }
            mixin(config[prop], value, true, true);
          } else {
            config[prop] = value;
          }
        });
        if (cfg.bundles) {
          eachProp(cfg.bundles, function(object, prop) {
            each(object, function(v) {
              if (v !== prop) {
                bundlesMap[v] = prop;
              }
            });
          });
        }
        if (cfg.shim) {
          eachProp(cfg.shim, function(value, id) {
            if (isArray(value)) {
              value = {
                deps : value
              };
            }
            if (!(!value.exports && !value.init)) {
              if (!value.exportsFn) {
                value.exportsFn = context.makeShimExports(value);
              }
            }
            /** @type {Object} */
            shim[id] = value;
          });
          config.shim = shim;
        }
        if (cfg.packages) {
          each(cfg.packages, function(options) {
            var _ref1;
            var name;
            options = "string" == typeof options ? {
              name : options
            } : options;
            name = options.name;
            _ref1 = options.location;
            if (_ref1) {
              config.paths[name] = options.location;
            }
            /** @type {string} */
            config.pkgs[name] = options.name + "/" + (options.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "");
          });
        }
        eachProp(registry, function(mod, id) {
          if (!mod.inited) {
            if (!mod.map.unnormalized) {
              mod.map = makeModuleMap(id);
            }
          }
        });
        if (cfg.deps || cfg.callback) {
          context.require(cfg.deps || [], cfg.callback);
        }
      },
      /**
       * @param {Object} value
       * @return {?}
       */
      makeShimExports : function(value) {
        /**
         * @return {?}
         */
        function fn() {
          var memo;
          return value.init && (memo = value.init.apply(context, arguments)), memo || value.exports && getGlobal(value.exports);
        }
        return fn;
      },
      /**
       * @param {string} relMap
       * @param {?} options
       * @return {?}
       */
      makeRequire : function(relMap, options) {
        /**
         * @param {string} deps
         * @param {Function} callback
         * @param {Function} errback
         * @return {?}
         */
        function localRequire(deps, callback, errback) {
          var id;
          var map;
          var requireMod;
          return options.enableBuildCallback && (callback && (isFunction(callback) && (callback.__requireJsBuild = true))), "string" == typeof deps ? isFunction(callback) ? onError(makeError("requireargs", "Invalid require call"), errback) : relMap && hasProp(handlers, deps) ? handlers[deps](registry[relMap.id]) : req.get ? req.get(context, deps, relMap, localRequire) : (map = makeModuleMap(deps, relMap, false, true), id = map.id, hasProp(defined, id) ? defined[id] : onError(makeError("notloaded", 
          'Module name "' + id + '" has not been loaded yet for context: ' + contextName + (relMap ? "" : ". Use require([])")))) : (intakeDefines(), context.nextTick(function() {
            intakeDefines();
            requireMod = getModule(makeModuleMap(null, relMap));
            requireMod.skipMap = options.skipMap;
            requireMod.init(deps, callback, errback, {
              enabled : true
            });
            checkLoaded();
          }), localRequire);
        }
        return options = options || {}, mixin(localRequire, {
          isBrowser : isBrowser,
          /**
           * @param {string} moduleNamePlusExt
           * @return {?}
           */
          toUrl : function(moduleNamePlusExt) {
            var ext;
            var index = moduleNamePlusExt.lastIndexOf(".");
            var preceding = moduleNamePlusExt.split("/")[0];
            /** @type {boolean} */
            var isRelative = "." === preceding || ".." === preceding;
            return-1 !== index && ((!isRelative || index > 1) && (ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length), moduleNamePlusExt = moduleNamePlusExt.substring(0, index))), context.nameToUrl(normalize(moduleNamePlusExt, relMap && relMap.id, true), ext, true);
          },
          /**
           * @param {string} id
           * @return {?}
           */
          defined : function(id) {
            return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
          },
          /**
           * @param {string} id
           * @return {?}
           */
          specified : function(id) {
            return id = makeModuleMap(id, relMap, false, true).id, hasProp(defined, id) || hasProp(registry, id);
          }
        }), relMap || (localRequire.undef = function(id) {
          takeGlobalQueue();
          var map = makeModuleMap(id, relMap, true);
          var mod = getOwn(registry, id);
          removeScript(id);
          delete defined[id];
          delete urlFetched[map.url];
          delete undefEvents[id];
          eachReverse(defQueue, function(args, i) {
            if (args[0] === id) {
              defQueue.splice(i, 1);
            }
          });
          if (mod) {
            if (mod.events.defined) {
              undefEvents[id] = mod.events;
            }
            cleanRegistry(id);
          }
        }), localRequire;
      },
      /**
       * @param {Object} depMap
       * @return {undefined}
       */
      enable : function(depMap) {
        var mod = getOwn(registry, depMap.id);
        if (mod) {
          getModule(depMap).enable();
        }
      },
      /**
       * @param {string} moduleName
       * @return {?}
       */
      completeLoad : function(moduleName) {
        var b;
        var args;
        var mod;
        var shim = getOwn(config.shim, moduleName) || {};
        var shExports = shim.exports;
        takeGlobalQueue();
        for (;defQueue.length;) {
          if (args = defQueue.shift(), null === args[0]) {
            if (args[0] = moduleName, b) {
              break;
            }
            /** @type {boolean} */
            b = true;
          } else {
            if (args[0] === moduleName) {
              /** @type {boolean} */
              b = true;
            }
          }
          callGetModule(args);
        }
        if (mod = getOwn(registry, moduleName), !b && (!hasProp(defined, moduleName) && (mod && !mod.inited))) {
          if (!(!config.enforceDefine || shExports && getGlobal(shExports))) {
            return hasPathFallback(moduleName) ? void 0 : onError(makeError("nodefine", "No define call for " + moduleName, null, [moduleName]));
          }
          callGetModule([moduleName, shim.deps || [], shim.exportsFn]);
        }
        checkLoaded();
      },
      /**
       * @param {string} moduleName
       * @param {string} ext
       * @param {boolean} skipExt
       * @return {?}
       */
      nameToUrl : function(moduleName, ext, skipExt) {
        var paths;
        var words;
        var n;
        var parentModule;
        var url;
        var parentPath;
        var bundleId;
        var pkgMain = getOwn(config.pkgs, moduleName);
        if (pkgMain && (moduleName = pkgMain), bundleId = getOwn(bundlesMap, moduleName)) {
          return context.nameToUrl(bundleId, ext, skipExt);
        }
        if (req.jsExtRegExp.test(moduleName)) {
          url = moduleName + (ext || "");
        } else {
          paths = config.paths;
          words = moduleName.split("/");
          n = words.length;
          for (;n > 0;n -= 1) {
            if (parentModule = words.slice(0, n).join("/"), parentPath = getOwn(paths, parentModule)) {
              if (isArray(parentPath)) {
                parentPath = parentPath[0];
              }
              words.splice(0, n, parentPath);
              break;
            }
          }
          url = words.join("/");
          url += ext || (/^data\:|\?/.test(url) || skipExt ? "" : ".js");
          /** @type {string} */
          url = ("/" === url.charAt(0) || url.match(/^[\w\+\.\-]+:/) ? "" : config.baseUrl) + url;
        }
        return config.urlArgs ? url + ((-1 === url.indexOf("?") ? "?" : "&") + config.urlArgs) : url;
      },
      /**
       * @param {string} id
       * @param {string} url
       * @return {undefined}
       */
      load : function(id, url) {
        req.load(context, id, url);
      },
      /**
       * @param {?} name
       * @param {Function} callback
       * @param {?} args
       * @param {?} exports
       * @return {?}
       */
      execCb : function(name, callback, args, exports) {
        return callback.apply(exports, args);
      },
      /**
       * @param {Event} evt
       * @return {undefined}
       */
      onScriptLoad : function(evt) {
        if ("load" === evt.type || readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)) {
          /** @type {null} */
          doc = null;
          var data = getScriptData(evt);
          context.completeLoad(data.id);
        }
      },
      /**
       * @param {string} evt
       * @return {?}
       */
      onScriptError : function(evt) {
        var data = getScriptData(evt);
        return hasPathFallback(data.id) ? void 0 : onError(makeError("scripterror", "Script error for: " + data.id, evt, [data.id]));
      }
    }, context.require = context.makeRequire(), context;
  }
  /**
   * @return {?}
   */
  function getInteractiveScript() {
    return doc && "interactive" === doc.readyState ? doc : (eachReverse(scripts(), function(_doc) {
      return "interactive" === _doc.readyState ? doc = _doc : void 0;
    }), doc);
  }
  var req;
  var s;
  var head;
  var baseElement;
  var dataMain;
  var src;
  var doc;
  var currentlyAddingScript;
  var mainScript;
  var subPath;
  /** @type {string} */
  var version = "2.1.15";
  /** @type {RegExp} */
  var rclass = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm;
  /** @type {RegExp} */
  var r20 = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
  /** @type {RegExp} */
  var jsSuffixRegExp = /\.js$/;
  /** @type {RegExp} */
  var currDirRegExp = /^\.\//;
  var op = Object.prototype;
  /** @type {function (this:*): string} */
  var ostring = op.toString;
  /** @type {function (this:Object, *): boolean} */
  var hasOwn = op.hasOwnProperty;
  var ap = Array.prototype;
  /** @type {function (this:(Array.<T>|{length: number}), *=, *=, ...[T]): Array.<T>} */
  var apsp = ap.splice;
  /** @type {boolean} */
  var isBrowser = !("undefined" == typeof window || ("undefined" == typeof navigator || !window.document));
  /** @type {boolean} */
  var isWebWorker = !isBrowser && "undefined" != typeof importScripts;
  /** @type {RegExp} */
  var readyRegExp = isBrowser && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/;
  /** @type {string} */
  var defContextName = "_";
  /** @type {boolean} */
  var isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString();
  var contexts = {};
  var cfg = {};
  /** @type {Array} */
  var globalDefQueue = [];
  /** @type {boolean} */
  var YY_START = false;
  if ("undefined" == typeof define) {
    if ("undefined" != typeof requirejs) {
      if (isFunction(requirejs)) {
        return;
      }
      cfg = requirejs;
      requirejs = void 0;
    }
    if (!("undefined" == typeof require)) {
      if (!isFunction(require)) {
        cfg = require;
        require = void 0;
      }
    }
    /** @type {function (Object, string, string, string): ?} */
    req = requirejs = function(deps, callback, errback, optional) {
      var context;
      var config;
      /** @type {string} */
      var contextName = defContextName;
      return isArray(deps) || ("string" == typeof deps || (config = deps, isArray(callback) ? (deps = callback, callback = errback, errback = optional) : deps = [])), config && (config.context && (contextName = config.context)), context = getOwn(contexts, contextName), context || (context = contexts[contextName] = req.s.newContext(contextName)), config && context.configure(config), context.require(deps, callback, errback);
    };
    /**
     * @param {string} config
     * @return {?}
     */
    req.config = function(config) {
      return req(config);
    };
    /** @type {function (Function): undefined} */
    req.nextTick = "undefined" != typeof setTimeout ? function(fnc) {
      setTimeout(fnc, 4);
    } : function($sanitize) {
      $sanitize();
    };
    if (!require) {
      /** @type {function (Object, string, string, string): ?} */
      require = req;
    }
    /** @type {string} */
    req.version = version;
    /** @type {RegExp} */
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    /** @type {boolean} */
    req.isBrowser = isBrowser;
    s = req.s = {
      contexts : contexts,
      /** @type {function (string): ?} */
      newContext : newContext
    };
    req({});
    each(["toUrl", "undef", "defined", "specified"], function(prop) {
      /**
       * @return {?}
       */
      req[prop] = function() {
        var ctx = contexts[defContextName];
        return ctx.require[prop].apply(ctx, arguments);
      };
    });
    if (isBrowser) {
      head = s.head = document.getElementsByTagName("head")[0];
      baseElement = document.getElementsByTagName("base")[0];
      if (baseElement) {
        head = s.head = baseElement.parentNode;
      }
    }
    /** @type {function (?): ?} */
    req.onError = defaultOnError;
    /**
     * @param {?} config
     * @return {?}
     */
    req.createNode = function(config) {
      /** @type {Element} */
      var node = config.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
      return node.type = config.scriptType || "text/javascript", node.charset = "utf-8", node.async = true, node;
    };
    /**
     * @param {Object} context
     * @param {string} moduleName
     * @param {string} url
     * @return {?}
     */
    req.load = function(context, moduleName, url) {
      var node;
      var config = context && context.config || {};
      if (isBrowser) {
        return node = req.createNode(config, moduleName, url), node.setAttribute("data-requirecontext", context.contextName), node.setAttribute("data-requiremodule", moduleName), !node.attachEvent || (node.attachEvent.toString && node.attachEvent.toString().indexOf("[native code") < 0 || isOpera) ? (node.addEventListener("load", context.onScriptLoad, false), node.addEventListener("error", context.onScriptError, false)) : (YY_START = true, node.attachEvent("onreadystatechange", context.onScriptLoad)), 
        node.src = url, currentlyAddingScript = node, baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node), currentlyAddingScript = null, node;
      }
      if (isWebWorker) {
        try {
          importScripts(url);
          context.completeLoad(moduleName);
        } catch (e) {
          context.onError(makeError("importscripts", "importScripts failed for " + moduleName + " at " + url, e, [moduleName]));
        }
      }
    };
    if (isBrowser) {
      if (!cfg.skipDataMain) {
        eachReverse(scripts(), function(script) {
          return head || (head = script.parentNode), dataMain = script.getAttribute("data-main"), dataMain ? (mainScript = dataMain, cfg.baseUrl || (src = mainScript.split("/"), mainScript = src.pop(), subPath = src.length ? src.join("/") + "/" : "./", cfg.baseUrl = subPath), mainScript = mainScript.replace(jsSuffixRegExp, ""), req.jsExtRegExp.test(mainScript) && (mainScript = dataMain), cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript], true) : void 0;
        });
      }
    }
    /**
     * @param {Object} name
     * @param {Object} deps
     * @param {Function} callback
     * @return {undefined}
     */
    define = function(name, deps, callback) {
      var node;
      var context;
      if ("string" != typeof name) {
        /** @type {Object} */
        callback = deps;
        /** @type {Object} */
        deps = name;
        /** @type {null} */
        name = null;
      }
      if (!isArray(deps)) {
        /** @type {Object} */
        callback = deps;
        /** @type {null} */
        deps = null;
      }
      if (!deps) {
        if (isFunction(callback)) {
          /** @type {Array} */
          deps = [];
          if (callback.length) {
            callback.toString().replace(rclass, "").replace(r20, function(dataAndEvents, dep) {
              deps.push(dep);
            });
            /** @type {Array} */
            deps = (1 === callback.length ? ["require"] : ["require", "exports", "module"]).concat(deps);
          }
        }
      }
      if (YY_START) {
        node = currentlyAddingScript || getInteractiveScript();
        if (node) {
          if (!name) {
            name = node.getAttribute("data-requiremodule");
          }
          context = contexts[node.getAttribute("data-requirecontext")];
        }
      }
      (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };
    define.amd = {
      jQuery : true
    };
    /**
     * @param {Element} text
     * @return {?}
     */
    req.exec = function(text) {
      return eval(text);
    };
    req(cfg);
  }
}(this), require.config({
  waitSeconds : 0,
  enforceDefine : true,
  paths : {
    ga : "https://ssl.google-analytics.com/ga",
    "ga-debug" : "https://ssl.google-analytics.com/u/ga_debug"
  },
  shim : {
    ga : {
      exports : "_gat"
    },
    "ga-debug" : {
      exports : "_gat"
    },
    highlight : {
      exports : "hljs"
    }
  }
}), define("lounge/paths", [], function() {
  return{
    APP : "//www.ryflection.com/next/embed/lounge.bundle.2e1b127fc3fbc843564151b8659f9265.js".slice(0, -3),
    STYLES : "//www.ryflection.com/next/embed/styles/lounge.fcc2aae7ac79584a0849157bcc4b0f37.css",
    RTL_STYLES : "//www.ryflection.com/next/embed/styles/lounge_rtl.ee9161fd5bc5db11769dcef8c444bbd9.css"
  };
}), define("common/main", ["require", "exports"], function(jQuery, me) {
  /**
   * @return {?}
   */
  var _test = function() {
    return Number(new Date);
  };
  /** @type {HTMLDocument} */
  var doc = document;
  /** @type {boolean} */
  me.ready = false;
  me.timings = {};
  var info = function(rgb) {
    var obj = {};
    /** @type {Array.<string>} */
    var aHash = rgb.substr(1).split("&");
    /** @type {number} */
    var i = aHash.length - 1;
    for (;i >= 0;i--) {
      /** @type {Array.<string>} */
      var parts = aHash[i].split("=");
      /** @type {string} */
      obj[parts[0]] = decodeURIComponent((parts[1] || "").replace(/\+/g, "%20"));
    }
    return obj;
  }(window.location.search);
  me.params = info;
  me.version = info.version;
  /**
   * @param {string} url
   * @return {?}
   */
  me.loadCss = function(url) {
    /**
     * @return {undefined}
     */
    function process() {
      var c;
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        if (codeSegments[i].href) {
          if (codeSegments[i].href.indexOf(url) > -1) {
            /** @type {boolean} */
            c = true;
          }
        }
      }
      if (c) {
        /** @type {string} */
        css.media = "all";
      } else {
        window.setTimeout(process);
      }
    }
    /** @type {HTMLDocument} */
    var d = document;
    /** @type {(StyleSheetList|null)} */
    var codeSegments = d.styleSheets;
    /** @type {Element} */
    var css = d.createElement("link");
    return css.rel = "stylesheet", css.href = url, css.media = "only x", d.getElementsByTagName("head")[0].appendChild(css), process(), css;
  };
  /**
   * @param {string} j
   * @return {?}
   */
  me.getEmbeddedData = function(j) {
    /** @type {(HTMLElement|null)} */
    var oElement = doc.getElementById("reflect-" + j);
    try {
      return oElement && JSON.parse(oElement.textContent || oElement.innerHTML);
    } catch (c) {
      return null;
    }
  };
  /**
   * @return {undefined}
   */
  me.setReady = function() {
    jQuery(["core/bus"], function(exec_state) {
      exec_state.frame.sendHostMessage("ready");
      /** @type {boolean} */
      me.ready = true;
    });
  };
  /**
   * @param {Object} status
   * @return {undefined}
   */
  me.setFailure = function(status) {
    /** @type {(HTMLElement|null)} */
    var pre = doc.getElementById("error");
    if (pre) {
      /** @type {string} */
      pre.style.display = "block";
    }
    /** @type {Window} */
    var port = window.opener || window.parent;
    if (port) {
      if (jQuery.defined("core/bus")) {
        jQuery("core/bus").frame.sendHostMessage("fail", status);
      } else {
        port.postMessage(JSON.stringify({
          scope : "host",
          name : "fail",
          data : status,
          sender : window.location.hash.slice(1).replace(/(^\d+).*/, "$1")
        }), "*");
      }
    }
  };
  /**
   * @param {string} depMaps
   * @param {Function} factory
   * @return {?}
   */
  me.init = function(depMaps, factory) {
    /**
     * @return {undefined}
     */
    function init() {
      me.timings.downloadEnd = _test();
      jQuery(["jquery", depMaps + "/main", "loglevel", "raven", "remote/config"], function(options, data, enemy, Raven, dataAndEvents) {
        /** @type {string} */
        doc.body.style.display = "";
        enemy.setLevel("SILENT", false);
        var h = dataAndEvents.lounge.sentry_rate_limit || 0;
        /** @type {string} */
        var config = "//c27c205e742645ce987ed5ba2ef88af9@sentry.services.disqus.com/35";
        Raven.config(config, {
          whitelistUrls : ["//ryflection.com/next/embed"],
          release : me.version,
          /**
           * @return {?}
           */
          shouldSendCallback : function() {
            return h > 0 && Math.random() <= 1 / h;
          }
        }).install();
        var failure;
        try {
          failure = (data.init || options.noop)(me);
        } catch (realError) {
          Raven.captureException(realError);
          failure = {
            code : "js_exception"
          };
        }
        if (failure) {
          me.setFailure(failure);
        } else {
          me.setReady();
        }
      });
    }
    /**
     * @param {string} name
     * @param {Object} factory
     * @return {undefined}
     */
    function fn(name, factory) {
      require.undef(name);
      define(name, factory);
      jQuery([name]);
    }
    /**
     * @param {?} err
     * @return {?}
     */
    function complete(err) {
      if (window.console) {
        if (window.console.log) {
          window.console.log(err.toString());
        }
      }
      var context = err.requireModules || [];
      /** @type {number} */
      var i = 0;
      var j = context.length;
      for (;j > i;++i) {
        switch(context[i]) {
          case "lang/" + path:
            fn(context[i], null);
            break;
          case "remote/config":
            fn(context[i], {
              lounge : {},
              discovery : {},
              experiments : {}
            });
            break;
          default:
            return void me.setFailure({
              code : "module_load_error"
            });
        }
      }
    }
    if (info.n_s) {
      return void(doc.documentElement.className += " not-supported type-" + info.n_s);
    }
    me.timings.initStart = _test();
    /** @type {string} */
    var remoteconfig = "https:" === window.location.protocol ? "https://ryflection.com" : "http://ryflection.com";
    var config = {
      baseUrl : "//ryflection.com/next/current/embed",
      paths : {
        "remote/config" : remoteconfig + "/next/config",
        "common.bundle" : "//www.ryflection.com/next/embed/common.bundle.ea27411799c4b519ccba088d8128f69b.js".slice(0, -3),
        "discovery/main" : "//www.ryflection.com/next/embed/discovery.bundle.7e1ddeee2389924c7bd81848bd4b2811.js".slice(0, -3),
        highlight : "//www.ryflection.com/next/embed/highlight.0faa05361b05582ff85f4eff7fda997e.js".slice(0, -3)
      },
      shim : {
        "common.bundle" : {}
      }
    };
    config.shim[depMaps + ".bundle"] = {
      deps : ["common.bundle"]
    };
    config.paths[depMaps + ".bundle"] = factory.APP;
    require.config(config);
    me.loadCss("rtl" !== doc.documentElement.dir ? factory.STYLES : factory.RTL_STYLES);
    /** @type {Array} */
    var scripts = [depMaps + ".bundle", "remote/config"];
    /** @type {string} */
    var path = doc.documentElement.lang;
    if (path && "en" !== path) {
      /** @type {string} */
      var name = "lang/" + path;
      var res = {};
      res[name] = {
        deps : ["common.bundle"]
      };
      require.config({
        shim : res
      });
      scripts.push(name);
    }
    jQuery(scripts, init, complete);
  };
}), define("lounge.load", function() {
}), require(["lounge/paths", "common/main"], function(callback, _super) {
  _super.init("lounge", callback);
});
