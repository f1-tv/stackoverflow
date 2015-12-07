var REFLECT = function($window) {
  return REFLECT = $window.REFLECT || {},
  REFLECT.define = function(type, msg) {
    if ("function" == typeof type) { // if type is a function then this "if" statement
      /** @type {string} */
      msg = type;
      /** @type {string} */
      type = "";
    }
    var pathConfig = type.split("."); // splits . and eliminates . output to arrays
    var i = pathConfig.shift();
    var methods = REFLECT;
    var tests = (msg || function() {
      return{};
    }).call({
      /**
       * @param {?} dataAndEvents
       * @return {?}
       */
      overwrites : function(dataAndEvents) {
        return dataAndEvents.__overwrites__ = true, dataAndEvents;
      }
    }, $window);
    for (;i;) {
      methods = methods[i] ? methods[i] : methods[i] = {};
      i = pathConfig.shift();
    }
    var testName;
    for (testName in tests) {
      if (tests.hasOwnProperty(testName)) {
        if (!tests.__overwrites__ && (null !== methods[testName] && methods.hasOwnProperty(testName))) {
          if (REFLECT.log) {
            REFLECT.log("Unsafe attempt to redefine existing module: " + testName);
          }
        } else {
          methods[testName] = tests[testName];
        }
      }
    }
    return methods;
  }, REFLECT.use = function(type) {
    return REFLECT.define(type);
  }, REFLECT.define("next"), REFLECT;
}(window);
REFLECT.define(function(win, dataAndEvents) {
  var $ = win.REFLECT;
  var doc = win.document;
  var svg = doc.head || (doc.getElementsByTagName("head")[0] || doc.body);
  /** @type {number} */
  var ccNum = 0;
  /**
   * @param {?} prefix
   * @return {?}
   */
  $.getUid = function(prefix) {
    /** @type {string} */
    var id = String(++ccNum);
    return prefix ? prefix + id : id;
  };
  /**
   * @param {?} obj
   * @param {string} object
   * @return {?}
   */
  $.isOwn = function(obj, object) {
    return Object.prototype.hasOwnProperty.call(obj, object);
  };
  /**
   * @param {Element} obj
   * @return {?}
   */
  $.isString = function(obj) {
    return "[object String]" === Object.prototype.toString.call(obj);
  };
  /**
   * @param {Array} object
   * @param {Function} callback
   * @return {undefined}
   */
  $.each = function(object, callback) {
    var length = object.length;
    /** @type {function (this:(Array.<T>|string|{length: number}), (function (this:S, T, number, Array.<T>): ?|null), S=): ?} */
    var _forEach = Array.prototype.forEach;
    if (isNaN(length)) {
      var key;
      for (key in object) {
        if ($.isOwn(object, key)) {
          callback(object[key], key, object);
        }
      }
    } else {
      if (_forEach) {
        _forEach.call(object, callback);
      } else {
        /** @type {number} */
        var index = 0;
        for (;length > index;index++) {
          callback(object[index], index, object);
        }
      }
    }
  };
  /**
   * @param {?} opt_attributes
   * @return {?}
   */
  $.extend = function(opt_attributes) {
    return $.each(Array.prototype.slice.call(arguments, 1), function(iterable) {
      var key;
      for (key in iterable) {
        if ($.isOwn(iterable, key)) {
          opt_attributes[key] = iterable[key];
        }
      }
    }), opt_attributes;
  };
  /**
   * @param {Object} args
   * @return {?}
   */
  $.serializeArgs = function(args) {
    /** @type {Array} */
    var columns = [];
    return $.each(args, function(match, id) {
      if (match !== dataAndEvents) {
        columns.push(id + (null !== match ? "=" + encodeURIComponent(match) : ""));
      }
    }), columns.join("&");
  };
  /**
   * @param {string} object
   * @param {Object} callback
   * @param {boolean} opt
   * @return {?}
   */
  $.serialize = function(object, callback, opt) {
    if (callback && (-1 === object.indexOf("?") ? object += "?" : "&" !== object.charAt(object.length - 1) && (object += "&"), object += $.serializeArgs(callback)), opt) {
      var elems = {};
      return elems[(new Date).getTime()] = null, $.serialize(object, elems);
    }
    var length = object.length;
    return "&" === object.charAt(length - 1) ? object.slice(0, length - 1) : object;
  };
  var loadScript;
  var remove;
  /** @type {number} */
  var time = 2E4;
  if ("addEventListener" in win) {
    /**
     * @param {HTMLElement} s
     * @param {string} name
     * @param {Function} callback
     * @return {undefined}
     */
    loadScript = function(s, name, callback) {
      s.addEventListener(name, callback, false);
    };
    /**
     * @param {HTMLDocument} element
     * @param {string} name
     * @param {Function} handler
     * @return {undefined}
     */
    remove = function(element, name, handler) {
      element.removeEventListener(name, handler, false);
    };
  } else {
    /**
     * @param {HTMLElement} o
     * @param {string} e
     * @param {Function} evtHandler
     * @return {undefined}
     */
    loadScript = function(o, e, evtHandler) {
      o.attachEvent("on" + e, evtHandler);
    };
    /**
     * @param {Element} element
     * @param {string} method
     * @param {Function} callback
     * @return {undefined}
     */
    remove = function(element, method, callback) {
      element.detachEvent("on" + method, callback);
    };
  }
  /**
   * @param {string} name
   * @param {Object} names
   * @param {boolean} options
   * @param {Object} success
   * @param {Object} fail
   * @return {?}
   */
  $.require = function(name, names, options, success, fail) {
    /**
     * @param {Object} event
     * @return {undefined}
     */
    function onLoad(event) {
      event = event || win.event;
      if (!event.target) {
        event.target = event.srcElement;
      }
      if ("load" === event.type || /^(complete|loaded)$/.test(event.target.readyState)) {
        if (success) {
          success();
        }
        if (p) {
          win.clearTimeout(p);
        }
        remove(event.target, load, onLoad);
      }
    }
    var s = doc.createElement("script");
    /** @type {string} */
    var load = s.addEventListener ? "load" : "readystatechange";
    /** @type {null} */
    var p = null;
    return s.src = $.serialize(name, names, options), s.async = true, s.charset = "UTF-8", (success || fail) && loadScript(s, load, onLoad), fail && (p = win.setTimeout(function() {
      fail();
    }, time)), svg.appendChild(s), $;
  };
}), REFLECT.define("next.host.urls", function() {
  /** @type {string} */
  var result = "default";
  var viewItems = {
    lounge : "http://ryflection.com/embed/comments/",
    onboard : "http://ryflection.com/embed/onboard/",
    home : "https://ryflection.com/home/".replace("home/", "")
  };
  /**
   * @param {string} className
   * @param {string} value
   * @return {?}
   */
  var addClass = function(className, value) {
    return/^http/.test(value) || (value = "http:"), value + "//" + className.replace(/^\s*(\w+:)?\/\//, "");
  };
  /**
   * @param {string} index
   * @param {Object} options
   * @param {boolean} value
   * @return {?}
   */
  var save = function(index, options, value) {
    var item = viewItems[index];
    if (!item) {
      throw new Error("Unknown app: " + index);
    }
    var object = addClass(item, document.location.protocol);
    var restoreScript = REFLECT.extend({
      base : result
    }, options || {});
    /** @type {string} */
    var width = value ? "#" + encodeURIComponent(JSON.stringify(value)) : "";
    return REFLECT.serialize(object, restoreScript) + width;
  };
  return{
    BASE : result,
    apps : viewItems,
    /** @type {function (string, Object, boolean): ?} */
    get : save,
    /** @type {function (string, string): ?} */
    ensureHttpBasedProtocol : addClass
  };
}), REFLECT.define(function(win) {
  var log;
  return log = win.console ? "function" == typeof win.console.log ? function() {
    return win.console.log(Array.prototype.slice.call(arguments, 0).join(" "));
  } : function() {
    return win.console.log.apply(win.console, arguments);
  } : function() {
  }, {
    /** @type {Function} */
    log : log
  };
}), REFLECT.define("Events", function() {
  /**
   * @param {(Function|number)} matcherFunction
   * @return {?}
   */
  var after = function(matcherFunction) {
    var t;
    /** @type {boolean} */
    var r = false;
    return function() {
      return r ? t : (r = true, t = matcherFunction.apply(this, arguments), matcherFunction = null, t);
    };
  };
  var hasOwn = REFLECT.isOwn;
  /** @type {function (Object): Array.<string>} */
  var validateNameAndFn = Object.keys || function(obj) {
    if (obj !== Object(obj)) {
      throw new TypeError("Invalid object");
    }
    /** @type {Array} */
    var keys = [];
    var key;
    for (key in obj) {
      if (hasOwn(obj, key)) {
        /** @type {string} */
        keys[keys.length] = key;
      }
    }
    return keys;
  };
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var __slice = [].slice;
  var Events = {
    /**
     * @param {string} name
     * @param {Function} callback
     * @param {Object} context
     * @return {?}
     */
    on : function(name, callback, context) {
      if (!eventsApi(this, "on", name, [callback, context]) || !callback) {
        return this;
      }
      this._events = this._events || {};
      var events = this._events[name] || (this._events[name] = []);
      return events.push({
        /** @type {Function} */
        callback : callback,
        context : context,
        ctx : context || this
      }), this;
    },
    /**
     * @param {string} name
     * @param {Function} callback
     * @param {Object} context
     * @return {?}
     */
    once : function(name, callback, context) {
      if (!eventsApi(this, "once", name, [callback, context]) || !callback) {
        return this;
      }
      var self = this;
      var once = after(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      return once._callback = callback, this.on(name, once, context);
    },
    /**
     * @param {string} name
     * @param {boolean} callback
     * @param {boolean} context
     * @return {?}
     */
    off : function(name, callback, context) {
      var retain;
      var ev;
      var events;
      var names;
      var nameCounter;
      var l;
      var i;
      var k;
      if (!this._events || !eventsApi(this, "off", name, [callback, context])) {
        return this;
      }
      if (!name && (!callback && !context)) {
        return this._events = {}, this;
      }
      /** @type {Array} */
      names = name ? [name] : validateNameAndFn(this._events);
      /** @type {number} */
      nameCounter = 0;
      /** @type {number} */
      l = names.length;
      for (;l > nameCounter;nameCounter++) {
        if (name = names[nameCounter], events = this._events[name]) {
          if (this._events[name] = retain = [], callback || context) {
            /** @type {number} */
            i = 0;
            k = events.length;
            for (;k > i;i++) {
              ev = events[i];
              if (callback && (callback !== ev.callback && callback !== ev.callback._callback) || context && context !== ev.context) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) {
            delete this._events[name];
          }
        }
      }
      return this;
    },
    /**
     * @param {string} name
     * @return {?}
     */
    trigger : function(name) {
      if (!this._events) {
        return this;
      }
      /** @type {Array.<?>} */
      var args = __slice.call(arguments, 1);
      if (!eventsApi(this, "trigger", name, args)) {
        return this;
      }
      var events = this._events[name];
      var allEvents = this._events.all;
      return events && triggerEvents(events, args), allEvents && triggerEvents(allEvents, arguments), this;
    },
    /**
     * @param {?} obj
     * @param {string} name
     * @param {Object} callback
     * @return {?}
     */
    stopListening : function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) {
        return this;
      }
      /** @type {boolean} */
      var e = !name && !callback;
      if ("object" == typeof name) {
        callback = this;
      }
      if (obj) {
        (listeners = {})[obj._listenerId] = obj;
      }
      var id;
      for (id in listeners) {
        listeners[id].off(name, callback, this);
        if (e) {
          delete this._listeners[id];
        }
      }
      return this;
    }
  };
  /** @type {RegExp} */
  var eventSplitter = /\s+/;
  /**
   * @param {Object} obj
   * @param {string} action
   * @param {string} name
   * @param {Array} rest
   * @return {?}
   */
  var eventsApi = function(obj, action, name, rest) {
    if (!name) {
      return true;
    }
    if ("object" == typeof name) {
      var key;
      for (key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }
    if (eventSplitter.test(name)) {
      var employees = name.split(eventSplitter);
      /** @type {number} */
      var i = 0;
      var l = employees.length;
      for (;l > i;i++) {
        obj[action].apply(obj, [employees[i]].concat(rest));
      }
      return false;
    }
    return true;
  };
  /**
   * @param {Array} events
   * @param {Array} args
   * @return {undefined}
   */
  var triggerEvents = function(events, args) {
    var ev;
    /** @type {number} */
    var i = -1;
    var l = events.length;
    var next = args[0];
    var pageX = args[1];
    var a3 = args[2];
    switch(args.length) {
      case 0:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx);
        }
        return;
      case 1:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, next);
        }
        return;
      case 2:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, next, pageX);
        }
        return;
      case 3:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, next, pageX, a3);
        }
        return;
      default:
        for (;++i < l;) {
          (ev = events[i]).callback.apply(ev.ctx, args);
        }
      ;
    }
  };
  var which = {
    listenTo : "on",
    listenToOnce : "once"
  };
  return REFLECT.each(which, function(implementation, method) {
    /**
     * @param {Array} obj
     * @param {?} name
     * @param {Object} callback
     * @return {?}
     */
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = REFLECT.getUid("l"));
      return listeners[id] = obj, "object" == typeof name && (callback = this), obj[implementation](name, callback, this), this;
    };
  }), Events.bind = Events.on, Events.unbind = Events.off, Events;
}), REFLECT.define(function(global) {
  /**
   * @param {?} t
   * @return {?}
   */
  function domReady(t) {
    return doc.getElementById(t) || (doc.body || doc.documentElement);
  }
  var doc = global.document;
  var events = {};
  var parser = REFLECT.use("JSON");
  var hasKey = REFLECT.isOwn;
  var anchor = doc.createElement("a");
  var self = {};
  /**
   * @param {HTMLElement} el
   * @param {Object} context
   * @return {?}
   */
  self.getOffset = function(el, context) {
    context = context || doc.documentElement;
    /** @type {HTMLElement} */
    var cur = el;
    /** @type {number} */
    var left = 0;
    /** @type {number} */
    var top = 0;
    for (;cur && cur !== context;) {
      left += cur.offsetLeft;
      top += cur.offsetTop;
      cur = cur.offsetParent;
    }
    return{
      top : top,
      left : left,
      height : el.offsetHeight,
      width : el.offsetWidth
    };
  };
  /**
   * @param {string} url
   * @return {?}
   */
  self.getHost = function(url) {
    return anchor.href = url, anchor.hostname;
  };
  /**
   * @param {Object} obj
   * @param {string} type
   * @param {Function} f
   * @return {undefined}
   */
  self.addEvent = function(obj, type, f) {
    if (obj.addEventListener) {
      obj.addEventListener(type, f, false);
    } else {
      if (!obj.attachEvent) {
        throw new Error("No event support.");
      }
      obj.attachEvent("on" + type, f);
    }
  };
  /**
   * @param {HTMLDocument} obj
   * @param {string} type
   * @param {?} f
   * @return {undefined}
   */
  self.removeEvent = function(obj, type, f) {
    if (obj.removeEventListener) {
      obj.removeEventListener(type, f, false);
    } else {
      if (!obj.detachEvent) {
        throw new Error("No event support.");
      }
      obj.detachEvent("on" + type, f);
    }
  };
  /**
   * @param {Function} func
   * @param {number} wait
   * @param {number} opt_attributes
   * @return {?}
   */
  self.throttle = function(func, wait, opt_attributes) {
    if (!opt_attributes) {
      /** @type {number} */
      opt_attributes = 0;
    }
    var that;
    var args;
    var timeout;
    var value;
    /** @type {number} */
    var previous = 0;
    /**
     * @return {undefined}
     */
    var later = function() {
      /** @type {Date} */
      previous = new Date;
      /** @type {null} */
      timeout = null;
      value = func.apply(that, args);
    };
    return function() {
      /** @type {Date} */
      var now = new Date;
      /** @type {number} */
      var remaining = wait - (now - previous);
      return that = this, args = arguments, 0 >= remaining ? (global.clearTimeout(timeout), timeout = null, previous = now, value = func.apply(that, args)) : timeout || (timeout = global.setTimeout(later, remaining + opt_attributes)), value;
    };
  };
  self.addEvent(global, "message", function(e) {
    var o;
    try {
      o = parser.parse(e.data);
    } catch (c) {
      return;
    }
    var type = o.sender;
    var that = hasKey(events, type) && events[type];
    if (that) {
      if (self.getHost(e.origin) === that.host) {
        if (e.origin !== that.origin) {
          that.origin = e.origin;
        }
        if ("host" === o.scope) {
          that.trigger(o.name, o.data);
        }
      }
    }
  }, false);
  self.addEvent(global, "hashchange", function() {
    REFLECT.trigger("window.hashchange", {
      hash : global.location.hash
    });
  }, false);
  self.addEvent(global, "resize", self.throttle(function() {
    REFLECT.trigger("window.resize");
  }, 250, 50), false);
  self.addEvent(doc, "mousemove", self.throttle(function() {
    REFLECT.trigger("window.mousemove");
  }, 250, 50), false);
  /**
   * @return {undefined}
   */
  var update = function() {
    REFLECT.trigger("window.scroll");
  };
  self.addEvent(global, "scroll", self.throttle(update, 250, 50));
  self.addEvent(doc, "click", function() {
    REFLECT.trigger("window.click");
  });
  /** @type {function (Object): undefined} */
  var that = self.WindowBase = function(e) {
    e = e || {};
    this.state = that.INIT;
    this.uid = e.uid || REFLECT.getUid();
    this.origin = e.origin;
    this.host = self.getHost(this.origin);
    this.target = e.target;
    /** @type {null} */
    this.window = null;
    events[this.uid] = this;
    this.on("ready", function() {
      this.state = that.READY;
    }, this);
    this.on("die", function() {
      this.state = that.KILLED;
    }, this);
  };
  REFLECT.extend(that, {
    INIT : 0,
    READY : 1,
    KILLED : 2,
    /**
     * @param {string} message
     * @param {string} msg
     * @param {string} data
     * @return {?}
     */
    postMessage : function(message, msg, data) {
      return message.postMessage(msg, data);
    }
  });
  REFLECT.extend(that.prototype, REFLECT.Events);
  /**
   * @param {string} command
   * @param {?} data
   * @return {undefined}
   */
  that.prototype.sendMessage = function(command, data) {
    var fmt = parser.stringify({
      scope : "client",
      name : command,
      data : data
    });
    var selector = function(args, err) {
      return function() {
        var msg = args.window;
        if (msg) {
          that.postMessage(msg, err, args.origin);
        } else {
          global.setTimeout(selector, 500);
        }
      };
    }(this, fmt);
    if (this.isReady()) {
      selector();
    } else {
      this.on("ready", selector);
    }
  };
  /**
   * @return {undefined}
   */
  that.prototype.hide = function() {
  };
  /**
   * @return {undefined}
   */
  that.prototype.show = function() {
  };
  /**
   * @return {?}
   */
  that.prototype.url = function() {
    return this.target + "#" + this.uid;
  };
  /**
   * @return {undefined}
   */
  that.prototype.destroy = function() {
    this.state = that.KILLED;
    this.off();
  };
  /**
   * @return {?}
   */
  that.prototype.isReady = function() {
    return this.state === that.READY;
  };
  /**
   * @return {?}
   */
  that.prototype.isKilled = function() {
    return this.state === that.KILLED;
  };
  /** @type {function (?): undefined} */
  var Router = self.Popup = function(config) {
    that.call(this, config);
    this.windowName = config.windowName;
  };
  REFLECT.extend(Router.prototype, that.prototype);
  /**
   * @return {undefined}
   */
  Router.prototype.load = function() {
    this.window = global.open("", this.windowName || "_blank");
    this.window.location = this.url();
  };
  /**
   * @return {?}
   */
  Router.prototype.isKilled = function() {
    return that.prototype.isKilled() || this.window.closed;
  };
  /** @type {function (Object): undefined} */
  var _this = self.Iframe = function(el) {
    that.call(this, el);
    this.styles = el.styles || {};
    this.tabIndex = el.tabIndex || 0;
    this.title = el.title || "Reflect";
    this.container = el.container;
    /** @type {null} */
    this.elem = null;
  };
  REFLECT.extend(_this.prototype, that.prototype);
  /**
   * @return {undefined}
   */
  _this.prototype.load = function() {
    var iframe = this.elem = doc.createElement("iframe");
    iframe.setAttribute("id", "ref-" + this.uid);
    iframe.setAttribute("data-reflect-uid", this.uid);
    iframe.setAttribute("allowTransparency", "true");
    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("scrolling", "no");
    if (this.role) {
      iframe.setAttribute("role", this.role);
    }
    iframe.setAttribute("tabindex", this.tabIndex);
    iframe.setAttribute("title", this.title);
    this.setInlineStyle(this.styles);
  };
  /**
   * @param {?} event
   * @return {?}
   */
  _this.prototype.getOffset = function(event) {
    return self.getOffset(this.elem, event);
  };
  /**
   * @param {string} data
   * @param {string} value
   * @return {?}
   */
  _this.prototype.setInlineStyle = function(data, value) {
    var cache = {};
    if (REFLECT.isString(data)) {
      /** @type {string} */
      cache[data] = value;
    } else {
      /** @type {string} */
      cache = data;
    }
    var style = this.elem.style;
    return "setProperty" in style ? void REFLECT.each(cache, function(prop, name) {
      style.setProperty(name, String(prop), "important");
    }) : this._setInlineStyleCompat(cache);
  };
  /**
   * @param {?} obj
   * @return {undefined}
   */
  _this.prototype._setInlineStyleCompat = function(obj) {
    this._stylesCache = this._stylesCache || {};
    REFLECT.extend(this._stylesCache, obj);
    /** @type {Array} */
    var tagNameArr = [];
    REFLECT.each(this._stylesCache, function(ctag, otag) {
      tagNameArr.push(otag + ":" + ctag + " !important");
    });
    /** @type {string} */
    this.elem.style.cssText = tagNameArr.join(";");
  };
  /**
   * @param {string} propertyName
   * @return {?}
   */
  _this.prototype.removeInlineStyle = function(propertyName) {
    var style = this.elem.style;
    return "removeProperty" in style ? void style.removeProperty(propertyName) : this._removeInlineStyleCompat(propertyName);
  };
  /**
   * @param {string} functionName
   * @return {undefined}
   */
  _this.prototype._removeInlineStyleCompat = function(functionName) {
    if (this._stylesCache) {
      delete this._stylesCache[functionName];
      this._setInlineStyleCompat({});
    }
  };
  /**
   * @return {undefined}
   */
  _this.prototype.hide = function() {
    this.setInlineStyle("display", "none");
  };
  /**
   * @return {undefined}
   */
  _this.prototype.show = function() {
    this.removeInlineStyle("display");
  };
  /**
   * @return {?}
   */
  _this.prototype.destroy = function() {
    return this.elem && (this.elem.parentNode && (this.elem.parentNode.removeChild(this.elem), this.elem = null)), that.prototype.destroy.call(this);
  };
  /** @type {function (Object): undefined} */
  var Component = self.Channel = function(opts) {
    var obj = this;
    /** @type {null} */
    obj.window = null;
    _this.call(obj, opts);
    obj.styles = REFLECT.extend({
      width : "100%",
      border : "none",
      overflow : "hidden",
      height : "0"
    }, opts.styles || {});
  };
  REFLECT.extend(Component.prototype, _this.prototype);
  /**
   * @param {Function} parentRequire
   * @return {undefined}
   */
  Component.prototype.load = function(parentRequire) {
    var obj = this;
    _this.prototype.load.call(obj);
    var node = obj.elem;
    node.setAttribute("width", "100%");
    node.setAttribute("src", this.url());
    self.addEvent(node, "load", function() {
      obj.window = node.contentWindow;
      if (parentRequire) {
        parentRequire();
      }
    });
    var container = REFLECT.isString(this.container) ? domReady(this.container) : this.container;
    container.appendChild(node);
  };
  /**
   * @return {?}
   */
  Component.prototype.destroy = function() {
    return this.window = null, _this.prototype.destroy.call(this);
  };
  /** @type {function (Object): undefined} */
  var app = self.Sandbox = function(options) {
    _this.call(this, options);
    this.contents = options.contents || "";
    this.styles = REFLECT.extend({
      width : "100%",
      border : "none",
      overflow : "hidden"
    }, options.styles || {});
  };
  return REFLECT.extend(app.prototype, _this.prototype), app.prototype.load = function() {
    _this.prototype.load.call(this);
    var el = this.elem;
    var id = REFLECT.isString(this.container) ? domReady(this.container) : this.container;
    id.appendChild(el);
    this.window = el.contentWindow;
    try {
      this.window.document.open();
    } catch (e) {
      /** @type {string} */
      el.src = 'javascript:var d=document.open();d.domain="' + doc.domain + '";void(0);';
    }
    return this.document = this.window.document, this.document.write(this.contents), this.document.close(), this.updateHeight(), this;
  }, app.prototype.updateHeight = function() {
    var fullHeight;
    var b = this.document.body;
    if (b) {
      /** @type {string} */
      fullHeight = b.offsetHeight + "px";
      this.setInlineStyle({
        height : fullHeight,
        "min-height" : fullHeight,
        "max-height" : fullHeight
      });
    }
  }, app.prototype.show = function() {
    this.setInlineStyle("display", "block");
  }, app.prototype.click = function(fn) {
    var scope = this;
    var item = scope.document.body;
    self.addEvent(item, "click", function(Class) {
      fn.call(scope, Class);
    });
  }, app.prototype.setBodyClass = function(opt_className) {
    /** @type {string} */
    this.document.body.className = opt_className;
  }, self.on = REFLECT.Events.on, self.off = REFLECT.Events.off, self.trigger = REFLECT.Events.trigger, self;
}), REFLECT.define("JSON", function(Y) {
  var nativeJSON;
  if ("[object JSON]" === Y.Object.prototype.toString.call(Y.JSON)) {
    nativeJSON = Y.JSON;
  } else {
    var exports = new REFLECT.Sandbox({
      container : "reflect_thread",
      styles : {
        display : "none"
      }
    });
    try {
      nativeJSON = exports.load().window.JSON;
    } catch (d) {
    }
    if (!nativeJSON) {
      nativeJSON = Y.JSON;
    }
  }
  return nativeJSON ? {
    stringify : nativeJSON.stringify,
    parse : nativeJSON.parse
  } : {};
}), REFLECT.define("next.host.utils", function($window, skip) {
  /**
   * @param {string} field
   * @return {?}
   */
  function colourNameToHex(field) {
    field = field.toLowerCase();
    field = field.replace(/\s/, "");
    var _ColorsRef = {
      aliceblue : "#F0F8FF",
      antiquewhite : "#FAEBD7",
      aqua : "#00FFFF",
      aquamarine : "#7FFFD4",
      azure : "#F0FFFF",
      beige : "#F5F5DC",
      bisque : "#FFE4C4",
      black : "#000000",
      blanchedalmond : "#FFEBCD",
      blue : "#0000FF",
      blueviolet : "#8A2BE2",
      brown : "#A52A2A",
      burlywood : "#DEB887",
      cadetblue : "#5F9EA0",
      chartreuse : "#7FFF00",
      chocolate : "#D2691E",
      coral : "#FF7F50",
      cornflowerblue : "#6495ED",
      cornsilk : "#FFF8DC",
      crimson : "#DC143C",
      cyan : "#00FFFF",
      darkblue : "#00008B",
      darkcyan : "#008B8B",
      darkgoldenrod : "#B8860B",
      darkgray : "#A9A9A9",
      darkgreen : "#006400",
      darkgrey : "#A9A9A9",
      darkkhaki : "#BDB76B",
      darkmagenta : "#8B008B",
      darkolivegreen : "#556B2F",
      darkorange : "#FF8C00",
      darkorchid : "#9932CC",
      darkred : "#8B0000",
      darksalmon : "#E9967A",
      darkseagreen : "#8FBC8F",
      darkslateblue : "#483D8B",
      darkslategray : "#2F4F4F",
      darkslategrey : "#2F4F4F",
      darkturquoise : "#00CED1",
      darkviolet : "#9400D3",
      deeppink : "#FF1493",
      deepskyblue : "#00BFFF",
      dimgray : "#696969",
      dimgrey : "#696969",
      dodgerblue : "#1E90FF",
      firebrick : "#B22222",
      floralwhite : "#FFFAF0",
      forestgreen : "#228B22",
      fuchsia : "#FF00FF",
      gainsboro : "#DCDCDC",
      ghostwhite : "#F8F8FF",
      gold : "#FFD700",
      goldenrod : "#DAA520",
      gray : "#808080",
      green : "#008000",
      greenyellow : "#ADFF2F",
      grey : "#808080",
      honeydew : "#F0FFF0",
      hotpink : "#FF69B4",
      indianred : "#CD5C5C",
      indigo : "#4B0082",
      ivory : "#FFFFF0",
      khaki : "#F0E68C",
      lavender : "#E6E6FA",
      lavenderblush : "#FFF0F5",
      lawngreen : "#7CFC00",
      lemonchiffon : "#FFFACD",
      lightblue : "#ADD8E6",
      lightcoral : "#F08080",
      lightcyan : "#E0FFFF",
      lightgoldenrodyellow : "#FAFAD2",
      lightgray : "#D3D3D3",
      lightgreen : "#90EE90",
      lightgrey : "#D3D3D3",
      lightpink : "#FFB6C1",
      lightsalmon : "#FFA07A",
      lightseagreen : "#20B2AA",
      lightskyblue : "#87CEFA",
      lightslategray : "#778899",
      lightslategrey : "#778899",
      lightsteelblue : "#B0C4DE",
      lightyellow : "#FFFFE0",
      lime : "#00FF00",
      limegreen : "#32CD32",
      linen : "#FAF0E6",
      magenta : "#FF00FF",
      maroon : "#800000",
      mediumaquamarine : "#66CDAA",
      mediumblue : "#0000CD",
      mediumorchid : "#BA55D3",
      mediumpurple : "#9370DB",
      mediumseagreen : "#3CB371",
      mediumslateblue : "#7B68EE",
      mediumspringgreen : "#00FA9A",
      mediumturquoise : "#48D1CC",
      mediumvioletred : "#C71585",
      midnightblue : "#191970",
      mintcream : "#F5FFFA",
      mistyrose : "#FFE4E1",
      moccasin : "#FFE4B5",
      navajowhite : "#FFDEAD",
      navy : "#000080",
      oldlace : "#FDF5E6",
      olive : "#808000",
      olivedrab : "#6B8E23",
      orange : "#FFA500",
      orangered : "#FF4500",
      orchid : "#DA70D6",
      palegoldenrod : "#EEE8AA",
      palegreen : "#98FB98",
      paleturquoise : "#AFEEEE",
      palevioletred : "#DB7093",
      papayawhip : "#FFEFD5",
      peachpuff : "#FFDAB9",
      peru : "#CD853F",
      pink : "#FFC0CB",
      plum : "#DDA0DD",
      powderblue : "#B0E0E6",
      purple : "#800080",
      red : "#FF0000",
      rosybrown : "#BC8F8F",
      royalblue : "#4169E1",
      saddlebrown : "#8B4513",
      salmon : "#FA8072",
      sandybrown : "#F4A460",
      seagreen : "#2E8B57",
      seashell : "#FFF5EE",
      sienna : "#A0522D",
      silver : "#C0C0C0",
      skyblue : "#87CEEB",
      slateblue : "#6A5ACD",
      slategray : "#708090",
      slategrey : "#708090",
      snow : "#FFFAFA",
      springgreen : "#00FF7F",
      steelblue : "#4682B4",
      tan : "#D2B48C",
      teal : "#008080",
      thistle : "#D8BFD8",
      tomato : "#FF6347",
      turquoise : "#40E0D0",
      violet : "#EE82EE",
      wheat : "#F5DEB3",
      white : "#FFFFFF",
      whitesmoke : "#F5F5F5",
      yellow : "#FFFF00",
      yellowgreen : "#9ACD32"
    };
    return _ColorsRef[field] || "";
  }
  /**
   * @param {string} str
   * @return {?}
   */
  function isEmpty(str) {
    if (!str || "embed.js" !== str.substring(str.length - 8)) {
      return null;
    }
    var codeSegments;
    /** @type {Array} */
    var array = [/(https?:)?\/\/(www\.)?ryflection\.com\/forums\/([\w_\-]+)/i, /(https?:)?\/\/(www\.)?([\w_\-]+)\.ryflection\.com/i, /(https?:)?\/\/(www\.)?dev\.ryflection\.org\/forums\/([\w_\-]+)/i, /(https?:)?\/\/(www\.)?([\w_\-]+)\.dev\.ryflection\.org/i];
    /** @type {number} */
    var l = array.length;
    /** @type {number} */
    var i = 0;
    for (;l > i;i++) {
      if (codeSegments = str.match(array[i]), codeSegments && (codeSegments.length && 4 === codeSegments.length)) {
        return codeSegments[3];
      }
    }
    return null;
  }
  /**
   * @param {Node} doc
   * @param {Function} callback
   * @return {?}
   */
  function load(doc, callback) {
    var item;
    var errStr;
    var value;
    var items = doc.getElementsByTagName("script");
    var cnl = items.length;
    callback = callback || isEmpty;
    /** @type {number} */
    var x = cnl - 1;
    for (;x >= 0;x--) {
      if (item = items[x], errStr = item.getAttribute ? item.getAttribute("src") : item.src, value = callback(errStr), null !== value) {
        return value.toLowerCase();
      }
    }
    return null;
  }
  /**
   * @param {Array} result
   * @param {Array} b
   * @return {?}
   */
  function ondata(result, b) {
    var i;
    var j;
    /** @type {number} */
    var DATA = 0;
    /** @type {Array} */
    var matrix = new Array(result.length);
    /** @type {number} */
    i = 0;
    for (;i <= result.length;i++) {
      /** @type {Array} */
      matrix[i] = new Array(b.length);
      /** @type {number} */
      j = 0;
      for (;j <= b.length;j++) {
        /** @type {number} */
        matrix[i][j] = 0;
      }
    }
    /** @type {number} */
    i = 0;
    for (;i < result.length;i++) {
      /** @type {number} */
      j = 0;
      for (;j < b.length;j++) {
        if (result[i] === b[j]) {
          matrix[i + 1][j + 1] = matrix[i][j] + 1;
          if (matrix[i + 1][j + 1] > DATA) {
            DATA = matrix[i + 1][j + 1];
          }
        }
      }
    }
    return DATA;
  }
  /**
   * @return {?}
   */
  function runTest() {
    var codeSegments = doc.getElementsByTagName("h1");
    var name = doc.title;
    var sides = name.length;
    var result = name;
    /** @type {number} */
    var computed = 0.6;
    /**
     * @param {HTMLElement} root
     * @return {undefined}
     */
    var fn = function(root) {
      var current;
      var val = root.textContent || root.innerText;
      if (null !== val) {
        if (val !== skip) {
          /** @type {number} */
          current = ondata(name, val) / sides;
          if (current > computed) {
            /** @type {number} */
            computed = current;
            result = val;
          }
        }
      }
    };
    /** @type {number} */
    var i = 0;
    for (;i < codeSegments.length;i++) {
      fn(codeSegments[i]);
    }
    return result;
  }
  /**
   * @param {Object} element
   * @param {string} defaults
   * @param {Object} options
   * @return {?}
   */
  function parse(element, defaults, options) {
    if (options = options || defaults, element === doc) {
      return "";
    }
    var s = getComputedStyle(element, defaults, options);
    return "transparent" === s || ("" === s || /rgba\(\d+,\s*\d+,\s*\d+,\s*0\)/.test(s)) ? parse(element.parentNode, defaults, options) : s || null;
  }
  /**
   * @param {string} style
   * @return {?}
   */
  function set(style) {
    style = toHex(style);
    if ("#" === style.charAt(0)) {
      style = style.substr(1);
    }
    /** @type {number} */
    var r = parseInt(style.substr(0, 2), 16);
    /** @type {number} */
    var g = parseInt(style.substr(2, 2), 16);
    /** @type {number} */
    var charCodeToReplace = parseInt(style.substr(4, 2), 16);
    /** @type {number} */
    var values = (299 * r + 587 * g + 114 * charCodeToReplace) / 1E3;
    return values;
  }
  /**
   * @param {string} color
   * @return {?}
   */
  function toHex(color) {
    return color = color.replace(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i, "#$1$1$2$2$3$3"), /^#?[a-f0-9]{6}$/.test(color) ? color : format(color) || colourNameToHex(color);
  }
  /**
   * @param {string} string
   * @return {?}
   */
  function format(string) {
    /**
     * @param {string} arg
     * @return {?}
     */
    function process(arg) {
      /** @type {number} */
      var dstUri = Math.round(Number(arg) * multiplier + 255 * (1 - multiplier));
      /** @type {string} */
      var codeSegments = dstUri.toString(16);
      return 1 === codeSegments.length ? "0" + codeSegments : codeSegments;
    }
    /** @type {(Array.<string>|null)} */
    var match = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(string);
    if (!match || match.length < 4) {
      return "";
    }
    /** @type {number} */
    var multiplier = parseFloat(match[4]) || 1;
    var digits = process(match[1]);
    var result = process(match[2]);
    var reported_date = process(match[3]);
    return "#" + digits + result + reported_date;
  }
  /**
   * @param {Node} b
   * @param {Element} el
   * @param {string} key
   * @param {string} options
   * @return {?}
   */
  function ready(b, el, key, options) {
    if (REFLECT.isString(el)) {
      el = doc.createElement(el);
    }
    /** @type {null} */
    var data = null;
    return el.style.visibility = "hidden", b.appendChild(el), data = parse(el, key, options), b.removeChild(el), data;
  }
  /**
   * @param {Node} b
   * @return {?}
   */
  function initialize(b) {
    var a = doc.createElement("a");
    return a.href = Number(new Date), ready(b, a, "color");
  }
  /**
   * @param {Object} collection
   * @return {?}
   */
  function clean(collection) {
    return collection.toLowerCase().replace(/^\s+|\s+$/g, "").replace(/['"]/g, "");
  }
  /**
   * @param {Node} node
   * @return {?}
   */
  function check(node) {
    var attribKey;
    var rule = ready(node, "span", "font-family", "fontFamily");
    var codeSegments = rule.split(",");
    var keywords = {
      courier : 1,
      times : 1,
      "times new roman" : 1,
      georgia : 1,
      palatino : 1,
      serif : 1
    };
    /** @type {number} */
    var i = 0;
    for (;i < codeSegments.length;i++) {
      if (attribKey = clean(codeSegments[i]), keywords.hasOwnProperty(attribKey)) {
        return true;
      }
    }
    return false;
  }
  /**
   * @param {Window} win
   * @return {?}
   */
  function log(win) {
    if (!win.postMessage) {
      return 1;
    }
    if (!win.JSON) {
      return "Microsoft Internet Explorer" === win.navigator.appName ? 2 : 1;
    }
    try {
      win.postMessage("ping", "*");
    } catch (b) {
      return 2;
    }
    return 0;
  }
  /**
   * @param {string} e
   * @return {undefined}
   */
  function update(e) {
    (new $window.Image).src = REFLECT.serialize(serialize + "/stat.gif", {
      event : e
    });
  }
  /**
   * @param {Object} element
   * @param {string} name
   * @param {string} style
   * @return {?}
   */
  function getComputedStyle(element, name, style) {
    return $window.getComputedStyle ? doc.defaultView.getComputedStyle(element, null).getPropertyValue(name) : element.currentStyle ? element.currentStyle[name] ? element.currentStyle[name] : element.currentStyle[style] : void 0;
  }
  /** @type {string} */
  var serialize = "https://referrer.ryflection.com/juggler";
  var doc = $window.document;
  var pageVisibility = function() {
    var hidden;
    var visibilityChange;
    /**
     * @return {?}
     */
    var listen = function() {
      return false;
    };
    if ("undefined" != typeof doc.hidden) {
      /** @type {string} */
      hidden = "hidden";
      /** @type {string} */
      visibilityChange = "visibilitychange";
    } else {
      if ("undefined" != typeof doc.mozHidden) {
        /** @type {string} */
        hidden = "mozHidden";
        /** @type {string} */
        visibilityChange = "mozvisibilitychange";
      } else {
        if ("undefined" != typeof doc.msHidden) {
          /** @type {string} */
          hidden = "msHidden";
          /** @type {string} */
          visibilityChange = "msvisibilitychange";
        } else {
          if ("undefined" == typeof doc.webkitHidden) {
            return{
              /** @type {function (): ?} */
              isHidden : listen,
              /** @type {function (): ?} */
              listen : listen,
              /** @type {function (): ?} */
              stopListening : listen
            };
          }
          /** @type {string} */
          hidden = "webkitHidden";
          /** @type {string} */
          visibilityChange = "webkitvisibilitychange";
        }
      }
    }
    return{
      /**
       * @return {?}
       */
      isHidden : function() {
        return doc[hidden];
      },
      /**
       * @param {?} obj
       * @return {?}
       */
      listen : function(obj) {
        return REFLECT.addEvent(doc, visibilityChange, obj);
      },
      /**
       * @param {?} obj
       * @return {?}
       */
      stopListening : function(obj) {
        return REFLECT.removeEvent(doc, visibilityChange, obj);
      }
    };
  }();
  /**
   * @return {?}
   */
  var init = function() {
    var el = doc.createElement("div");
    /** @type {string} */
    el.style.visibility = "hidden";
    /** @type {string} */
    el.style.width = "100px";
    /** @type {string} */
    el.style.msOverflowStyle = "scrollbar";
    doc.body.appendChild(el);
    var w1 = el.offsetWidth;
    /** @type {string} */
    el.style.overflow = "scroll";
    var div = doc.createElement("div");
    /** @type {string} */
    div.style.width = "100%";
    el.appendChild(div);
    var w2 = div.offsetWidth;
    return el.parentNode.removeChild(el), w1 - w2;
  };
  /**
   * @param {string} item
   * @return {?}
   */
  var _forEach = function(item) {
    var codeSegments = item.split(".");
    var responseText = codeSegments.length > 2 ? codeSegments[codeSegments.length - 2] : "";
    return responseText.match(/^[0-9a-f]{32}$/i) && responseText;
  };
  var browser = {
    /**
     * @return {?}
     */
    isIE : function() {
      return Boolean(doc.documentMode);
    },
    /**
     * @return {?}
     */
    isSafari : function() {
      var strBrowser = $window.navigator.userAgent.toLowerCase();
      return strBrowser.indexOf("safari") > -1 && -1 === strBrowser.indexOf("chrome");
    }
  };
  var store = {
    /**
     * @param {string} storageKey
     * @return {?}
     */
    getItem : function(storageKey) {
      try {
        return $window.localStorage.getItem(storageKey);
      } catch (d) {
        return skip;
      }
    },
    /**
     * @param {string} storageKey
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    setItem : function(storageKey, deepDataAndEvents) {
      try {
        return $window.localStorage.setItem(storageKey, deepDataAndEvents);
      } catch (d) {
        return;
      }
    }
  };
  return{
    MAX_Z_INDEX : 2147483647,
    /** @type {function (string): ?} */
    getShortnameFromUrl : isEmpty,
    /** @type {function (Node, Function): ?} */
    getForum : load,
    /** @type {function (): ?} */
    guessThreadTitle : runTest,
    /** @type {function (string): ?} */
    getContrastYIQ : set,
    /** @type {function (string): ?} */
    ensureHexColor : toHex,
    /** @type {function (Node, Element, string, string): ?} */
    getElementStyle : ready,
    /** @type {function (Node): ?} */
    getAnchorColor : initialize,
    /** @type {function (Object): ?} */
    normalizeFontValue : clean,
    /** @type {function (Node): ?} */
    isSerif : check,
    /** @type {function (Window): ?} */
    getBrowserSupport : log,
    /** @type {function (string): undefined} */
    logStat : update,
    /** @type {function (Object, string, string): ?} */
    getComputedStyle : getComputedStyle,
    pageVisibility : pageVisibility,
    /** @type {function (): ?} */
    getScrollbarWidth : init,
    /** @type {function (string): ?} */
    getLoaderVersionFromUrl : _forEach,
    browser : browser,
    storage : store
  };
}), REFLECT.define("next.host.app", function($window) {
  var hasOwn = REFLECT.isOwn;
  var extend = REFLECT.extend;
  var self = REFLECT.use("next.host");
  var model = self.urls;
  /** @type {HTMLDocument} */
  var doc = document;
  /** @type {Element} */
  var docEl = doc.documentElement;
  /** @type {string} */
  var udataCur = doc.location.protocol;
  var defaults = {
    /**
     * @return {?}
     */
    getRegistry : function() {
      var firstByIndex = this._registry;
      return firstByIndex ? firstByIndex : this._registry = {};
    },
    /**
     * @param {Object} model
     * @return {undefined}
     */
    register : function(model) {
      var data = this.getRegistry();
      /** @type {Object} */
      data[model.uid] = model;
    },
    /**
     * @param {Object} el
     * @return {undefined}
     */
    unregister : function(el) {
      var uniques = this.getRegistry();
      delete uniques[el.uid];
    },
    /**
     * @return {?}
     */
    listByKey : function() {
      return this.getRegistry();
    },
    /**
     * @return {?}
     */
    list : function() {
      var obj = this.getRegistry();
      /** @type {Array} */
      var args = [];
      var key;
      for (key in obj) {
        if (hasOwn(obj, key)) {
          args.push(obj[key]);
        }
      }
      return args;
    },
    /**
     * @param {string} prop
     * @return {?}
     */
    get : function(prop) {
      var obj = this.getRegistry();
      return hasOwn(obj, prop) ? obj[prop] : null;
    }
  };
  /**
   * @param {Object} settings
   * @return {undefined}
   */
  var Class = function(settings) {
    var Entity = this.constructor;
    this.uid = REFLECT.getUid();
    if (Entity.register) {
      Entity.register(this);
    }
    this.settings = settings || {};
    /** @type {Array} */
    var objects = [];
    var object = this;
    do {
      objects.unshift(object);
      object = object.constructor.__super__;
    } while (object);
    /** @type {number} */
    var index = 0;
    /** @type {number} */
    var length = objects.length;
    for (;length > index;index++) {
      object = objects[index];
      if (object.events) {
        this.on(object.events, this);
      }
      if (object.onceEvents) {
        this.once(object.onceEvents, this);
      }
    }
  };
  extend(Class.prototype, REFLECT.Events);
  /**
   * @return {undefined}
   */
  Class.prototype.destroy = function() {
    var self = this.constructor;
    this.off();
    this.stopListening();
    if (self.unregister) {
      self.unregister(this);
    }
  };
  /**
   * @param {?} protoProps
   * @param {?} classProps
   * @return {?}
   */
  Class.extend = function(protoProps, classProps) {
    var child;
    var parent = this;
    child = protoProps && hasOwn(protoProps, "constructor") ? protoProps.constructor : function() {
      return parent.apply(this, arguments);
    };
    extend(child, parent, classProps);
    /**
     * @return {undefined}
     */
    var Surrogate = function() {
      this.constructor = child;
    };
    return Surrogate.prototype = parent.prototype, child.prototype = new Surrogate, protoProps && extend(child.prototype, protoProps), child.__super__ = parent.prototype, child;
  };
  var child = Class.extend({
    name : null,
    loaderVersion : null,
    frame : null,
    origin : model.ensureHttpBasedProtocol("http://ryflection.com", udataCur),
    state : null,
    /**
     * @param {Object} options
     * @param {boolean} callback
     * @return {?}
     */
    getUrl : function(options, callback) {
      return options = this.loaderVersion ? REFLECT.extend({
        version : this.loaderVersion
      }, options) : REFLECT.extend({
        ryflection_version : "f47ab617"
      }, options), model.ensureHttpBasedProtocol(model.get(this.name, options, callback), udataCur);
    },
    /**
     * @return {?}
     */
    getFrame : function() {
      var a;
      var config = this.settings;
      var item = {
        target : this.getUrl(),
        origin : this.origin,
        uid : this.uid
      };
      return config.windowName ? item.windowName = config.windowName : item.container = this.settings.container || doc.body, this.getFrameSettings && (item = this.getFrameSettings(item)), new (a = item.windowName ? REFLECT.Popup : REFLECT.Channel)(item);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    setState : function(name) {
      var self = this.constructor;
      return name in self.states ? (this.state = self.states[name], void this.trigger("state:" + name)) : false;
    },
    /**
     * @return {undefined}
     */
    init : function() {
      var e;
      var that = this;
      that.frame = e = this.getFrame();
      that.listenTo(e, "all", function(name, model) {
        that.trigger("frame:" + name, model, e);
      });
      that.trigger("change:frame", e);
      that.frame.load(function() {
        that.setState("LOADED");
      });
      that.setState("INIT");
    },
    /**
     * @return {undefined}
     */
    destroy : function() {
      var suiteView = this.frame;
      if (suiteView) {
        this.stopListening(suiteView);
        suiteView.destroy();
      }
      this.setState("KILLED");
      /** @type {null} */
      this.frame = null;
      Class.prototype.destroy.call(this);
    },
    events : {
      /**
       * @return {undefined}
       */
      "frame:ready" : function() {
        this.setState("READY");
      }
    }
  }, {
    states : {
      INIT : 0,
      LOADED : 1,
      READY : 2,
      RUNNING : 3,
      KILLED : 4
    }
  });
  extend(child, defaults);
  var ThreadBoundApp = child.extend({
    /**
     * @return {?}
     */
    getUrl : function() {
      var options = this.settings;
      var context = {
        f : options.forum,
        t_i : options.identifier,
        t_u : options.url || $window.location.href,
        t_s : options.slug,
        t_e : options.title,
        t_d : options.documentTitle,
        t_t : options.title || options.documentTitle,
        t_c : options.category,
        s_o : options.sortOrder,
        l : options.language
      };
      return options.unsupported && (context.n_s = options.unsupported), child.prototype.getUrl.call(this, context);
    },
    /**
     * @param {?} keepData
     * @param {Object} scope
     * @return {?}
     */
    getFrameInitParams : function(keepData, scope) {
      var config = this.settings;
      var settings = {
        permalink : config.permalink,
        anchorColor : config.anchorColor,
        referrer : $window.location.href,
        hostReferrer : doc.referrer,
        colorScheme : config.colorScheme,
        typeface : config.typeface,
        remoteAuthS3 : config.remoteAuthS3,
        apiKey : config.apiKey,
        sso : config.sso,
        parentWindowHash : $window.location.hash,
        forceAutoStyles : config.forceAutoStyles,
        layout : config.layout,
        timestamp : this.timestamp
      };
      return scope && (scope.elem && ($window.navigator.userAgent.match(/(iPad|iPhone|iPod)/) && (settings.width = scope.elem.offsetWidth))), settings.initialPosition = this.getViewportAndScrollStatus(), settings;
    },
    /**
     * @param {Function} fn
     * @return {?}
     */
    listenToScrollEvent : function(fn) {
      var self = this;
      var suiteView = self.getScrollContainer();
      if (suiteView === docEl) {
        return self.listenTo(REFLECT, "window.scroll", fn), function() {
          self.stopListening(REFLECT, "window.scroll", fn);
        };
      }
      var onKeyUp = REFLECT.throttle(function() {
        fn.call(self);
      }, 250, 50);
      return REFLECT.addEvent(suiteView, "scroll", onKeyUp), function() {
        REFLECT.removeEvent(suiteView, "scroll", onKeyUp);
      };
    },
    /**
     * @return {?}
     */
    getScrollContainer : function() {
      if (this.scrollContainer) {
        return this.scrollContainer;
      }
      if (!this.settings.enableScrollContainer) {
        return docEl;
      }
      var el = this.settings.container;
      do {
        var value = self.utils.getComputedStyle(el, "overflow-y", "overflowY");
        if (("scroll" === value || "auto" === value) && el.clientHeight < el.scrollHeight) {
          break;
        }
        el = el.parentNode;
      } while (el && el !== docEl);
      return el && el !== doc.body || (el = docEl), this.scrollContainer = el;
    },
    /**
     * @return {?}
     */
    getViewportCoords : function() {
      return this.getScrollContainer() === docEl ? this.getWindowCoords() : this.getScrollContainerCoords();
    },
    /**
     * @return {?}
     */
    getWindowCoords : function() {
      if ("number" == typeof $window.pageYOffset) {
        /**
         * @return {?}
         */
        this.getWindowScroll = function() {
          return $window.pageYOffset;
        };
        /**
         * @return {?}
         */
        this.getWindowHeight = function() {
          return $window.innerHeight;
        };
      } else {
        var doc = $window.document;
        doc = docEl.clientHeight || docEl.clientWidth ? docEl : doc.body;
        /**
         * @return {?}
         */
        this.getWindowScroll = function() {
          return doc.scrollTop;
        };
        /**
         * @return {?}
         */
        this.getWindowHeight = function() {
          return doc.clientHeight;
        };
      }
      return this.getWindowCoords = function() {
        return{
          top : this.getWindowScroll(),
          height : this.getWindowHeight()
        };
      }, this.getWindowCoords();
    },
    /**
     * @return {?}
     */
    getScrollContainerCoords : function() {
      var n = this.getScrollContainer();
      return{
        top : n.scrollTop,
        height : n.clientHeight
      };
    },
    /**
     * @return {?}
     */
    getDocumentHeight : function() {
      /** @type {(HTMLElement|null)} */
      var body = doc.body;
      /** @type {Element} */
      var html = doc.documentElement;
      return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    },
    /**
     * @return {?}
     */
    getViewportAndScrollStatus : function() {
      var frame = this.frame;
      if (!frame || !frame.getOffset) {
        return null;
      }
      var cs = this.getViewportCoords();
      return{
        frameOffset : frame.getOffset(this.getScrollContainer()),
        pageOffset : cs.top,
        height : cs.height
      };
    },
    /**
     * @return {undefined}
     */
    communicateViewportAndScrollStatus : function() {
      var data = this.getViewportAndScrollStatus();
      if (data) {
        var config = data.frameOffset;
        var height = config.top;
        var id = height + config.height;
        var key = data.pageOffset;
        var h = data.height;
        var y = key + h;
        /** @type {boolean} */
        var ontype = false;
        /** @type {boolean} */
        var handle = false;
        if (y + h >= height) {
          /** @type {boolean} */
          ontype = id >= key;
          /** @type {boolean} */
          handle = ontype && y >= height;
        }
        var client = this.frame;
        client.sendMessage("window.scroll.always", data);
        if (ontype) {
          client.sendMessage("window.scroll", data);
        }
        if (handle !== this.wasInViewport) {
          client.sendMessage(handle ? "window.inViewport" : "window.scrollOffViewport");
          /** @type {boolean} */
          this.wasInViewport = handle;
        }
      }
    },
    /**
     * @param {number} start
     * @return {?}
     */
    getBestNextFrameHeight : function(start) {
      var pos = this.getViewportAndScrollStatus();
      if (!pos || (this.settings.enableScrollContainer || !this.getScrollContainer())) {
        return start;
      }
      var c = pos.frameOffset;
      if (start >= c.height) {
        return start;
      }
      var l = this.getDocumentHeight();
      /** @type {number} */
      var e = l - (c.height + c.top);
      /** @type {number} */
      var lastClose = pos.pageOffset + pos.height - (c.top + e);
      return lastClose > start ? lastClose + 1 : start;
    },
    events : {
      /**
       * @return {undefined}
       */
      "state:INIT" : function() {
        if (!this.settings.unsupported) {
          if (!this.settings.windowName) {
            this.listenToScrollEvent(this.communicateViewportAndScrollStatus);
            this.listenTo(REFLECT, "window.resize", this.communicateViewportAndScrollStatus);
          }
          /** @type {number} */
          this.timestamp = Number(new Date);
        }
      },
      /**
       * @return {undefined}
       */
      "state:LOADED" : function() {
        var frame = this.frame;
        var iframe = frame.elem;
        if (this.settings.unsupported) {
          frame.setInlineStyle("height", "500px");
          iframe.setAttribute("scrolling", "yes");
          iframe.setAttribute("horizontalscrolling", "no");
          iframe.setAttribute("verticalscrolling", "yes");
          frame.show();
        } else {
          if (!this.settings.windowName) {
            /** @type {boolean} */
            this.rendered = false;
            frame.setInlineStyle("height", "0");
            iframe.setAttribute("scrolling", "no");
            iframe.setAttribute("horizontalscrolling", "no");
            iframe.setAttribute("verticalscrolling", "no");
          }
        }
      },
      /**
       * @param {?} key
       * @param {Object} $scope
       * @return {undefined}
       */
      "frame:ready" : function(key, $scope) {
        var camelKey = this.getFrameInitParams(key, $scope);
        $scope.sendMessage("init", camelKey);
      },
      /**
       * @param {?} con
       * @param {Object} self
       * @return {undefined}
       */
      "frame:resize" : function(con, self) {
        var y = con.height;
        if (self.elem) {
          if (this.rendered) {
            y = this.getBestNextFrameHeight(y);
            self.setInlineStyle("height", y + "px");
            self.sendMessage("embed.resized");
          }
        }
        this.communicateViewportAndScrollStatus();
      },
      /**
       * @param {?} extra
       * @param {Object} output
       * @return {undefined}
       */
      "frame:rendered" : function(extra, output) {
        /** @type {boolean} */
        this.rendered = true;
        /** @type {boolean} */
        this.wasInViewport = false;
        output.trigger("resize", extra);
        output.sendMessage("embed.rendered");
      },
      /**
       * @param {(number|string)} dim
       * @param {Object} b
       * @return {undefined}
       */
      "frame:fail" : function(dim, b) {
        if (b.elem) {
          b.setInlineStyle("height", dim && dim.height || "75px");
        }
      },
      /**
       * @param {Object} options
       * @param {Object} obj
       * @return {undefined}
       */
      "frame:scrollTo" : function(options, obj) {
        if (obj.elem && obj.getOffset) {
          var e = this.getScrollContainer();
          var coords = obj.getOffset(e);
          var y = "window" === options.relative ? options.top : coords.top + options.top;
          var pos = this.getViewportCoords();
          if (!(!options.force && (y > pos.top && y < pos.top + pos.height))) {
            if (e === docEl) {
              $window.scrollTo(0, y);
            } else {
              e.scrollTop = y;
            }
          }
        }
      }
    }
  });
  /**
   * @param {Array} el
   * @param {?} which
   * @param {Object} callback
   * @return {undefined}
   */
  var show = function(el, which, callback) {
    REFLECT.each(which, function(methodname) {
      /**
       * @return {?}
       */
      callback[methodname] = function() {
        return el[methodname].apply(el, arguments);
      };
    });
  };
  return{
    /** @type {function (Array, ?, Object): undefined} */
    expose : show,
    /** @type {function (Object): undefined} */
    BaseApp : Class,
    WindowedApp : child,
    ThreadBoundApp : ThreadBoundApp,
    PublicInterfaceMixin : defaults
  };
}), REFLECT.define("next.host.onboard", function(win) {
  var config = REFLECT.next.host;
  var utils = config.utils;
  var Select = config.app.WindowedApp;
  var View = Select.extend({
    name : "onboard",
    loaderVersion : utils.getLoaderVersionFromUrl("//www.ryflection.com/next/embed/onboard.load.74629aaa32655c2e6f4b24ea139b9588.js"),
    events : {
      /**
       * @param {?} dataAndEvents
       * @param {Object} $scope
       * @return {undefined}
       */
      "frame:ready" : function(dataAndEvents, $scope) {
        var params = this.settings;
        $scope.sendMessage("init", {
          referrer : win.location.href,
          fullscreen : params.fullscreen,
          forumPk : params.forumPk,
          forumId : params.forumId,
          threadId : params.threadId
        });
      },
      /**
       * @param {?} dataAndEvents
       * @param {Object} poster
       * @return {undefined}
       */
      "frame:close" : function(dataAndEvents, poster) {
        poster.hide();
        win.focus();
      },
      /**
       * @return {undefined}
       */
      "frame:profileUpdated" : function() {
        this.trigger("onboard.profileUpdated");
      },
      /**
       * @return {undefined}
       */
      "frame:onboard.complete" : function() {
        this.trigger("onboard.complete");
      },
      /**
       * @return {undefined}
       */
      "frame:openReady" : function() {
        var m = this.frame;
        m.show();
        m.sendMessage("open");
      }
    },
    /**
     * @return {?}
     */
    getUrl : function() {
      var settings = this.settings;
      return Select.prototype.getUrl.call(this, {
        f : settings.forum,
        l : settings.language
      });
    },
    /**
     * @param {Object} self
     * @return {?}
     */
    getFrameSettings : function(self) {
      return self.role = "dialog", self.styles = {
        height : "100%",
        position : "fixed",
        top : 0,
        left : 0,
        "z-index" : utils.MAX_Z_INDEX
      }, self;
    },
    /**
     * @return {undefined}
     */
    destroy : function() {
      /** @type {null} */
      View.instance = null;
      Select.prototype.destroy.call(this);
    },
    /**
     * @param {string} callback
     * @return {?}
     */
    show : function(callback) {
      var self = this.frame;
      return self.isReady() ? (self.sendMessage("showOnboard", callback), void self.show()) : void this.once("frame:ready", function() {
        this.show(callback);
      }, this);
    }
  }, {
    /**
     * @param {?} options
     * @return {?}
     */
    getInstance : function(options) {
      var view = View.instance;
      return view && ((view.frame.windowName || view.frame.isKilled()) && (view.destroy(), view = null)), view || (view = View.instance = new View(options), view.init()), view;
    }
  });
  return{
    Onboard : View.getInstance,
    _OnboardApp : View
  };
}), REFLECT.define("next.host.home", function(context) {
  var m = REFLECT.next.host;
  var overlay = m.utils;
  var $ = m.app.WindowedApp;
  /** @type {RegExp} */
  var str = /^calc\((.+)\)$/;
  var options = $.extend({
    name : "home",
    events : {
      /**
       * @param {?} dataAndEvents
       * @param {Object} poster
       * @return {undefined}
       */
      "frame:close" : function(dataAndEvents, poster) {
        poster.hide();
        context.focus();
      },
      /**
       * @return {undefined}
       */
      "frame:openReady" : function() {
        this.frame.show();
        this.frame.sendMessage("open");
        if (overlay.browser.isIE() || overlay.browser.isSafari()) {
          this.preventScrolling();
        }
      },
      /**
       * @return {undefined}
       */
      "state:LOADED" : function() {
        this.frame.removeInlineStyle("visibility");
      },
      /**
       * @return {undefined}
       */
      "frame:after:render" : function() {
        if (overlay.browser.isSafari()) {
          this.triggerHostReflow();
        }
      }
    },
    /**
     * @return {undefined}
     */
    preventScrolling : function() {
      var overflow = this.getBodyOverflow();
      /** @type {(number|string)} */
      var marginRight = document.body.style.marginRight;
      /** @type {(CSSStyleDeclaration|null)} */
      var ns = document.documentElement.style;
      /** @type {string} */
      var o = ns.overflow;
      this.listenToOnce(this, "frame:close", function() {
        this.setBodyStyles({
          overflow : overflow,
          marginRight : marginRight
        });
        /** @type {string} */
        ns.overflow = o;
      });
      this.setBodyStyles({
        overflow : "hidden",
        marginRight : this.calcMargin(overlay.getComputedStyle(document.body, "margin-right", "marginRight") || marginRight)
      });
      /** @type {string} */
      ns.overflow = "hidden";
    },
    /**
     * @return {undefined}
     */
    triggerHostReflow : function() {
      /** @type {Element} */
      var styles = document.createElement("style");
      document.body.appendChild(styles);
      document.body.removeChild(styles);
    },
    /**
     * @param {string} txt
     * @return {?}
     */
    calcMargin : function(txt) {
      var tmp = txt.match(str);
      return tmp && (txt = tmp[1]), txt ? "calc(" + txt + " + " + overlay.getScrollbarWidth() + "px)" : overlay.getScrollbarWidth() + "px";
    },
    /**
     * @param {Object} attrs
     * @return {undefined}
     */
    setBodyStyles : function(attrs) {
      var attr;
      for (attr in attrs) {
        document.body.style[attr] = attrs[attr];
      }
    },
    /**
     * @return {?}
     */
    getBodyOverflow : function() {
      return document.body.style.overflow;
    },
    /**
     * @return {?}
     */
    getSecureOrigin : function() {
      var baseName = m.urls.ensureHttpBasedProtocol("https://ryflection.com/home/", "https:");
      var parts = baseName.split("/");
      var part = parts[0];
      var last = parts[2];
      return part + "//" + last;
    },
    /**
     * @param {Object} self
     * @return {?}
     */
    getFrameSettings : function(self) {
      return self.role = "dialog", self.origin = this.getSecureOrigin(), self.styles = {
        height : "100%",
        position : "fixed",
        top : 0,
        right : 0,
        left : "auto",
        bottom : "auto",
        "z-index" : overlay.MAX_Z_INDEX,
        visibility : "hidden"
      }, self;
    },
    /**
     * @return {?}
     */
    getUrl : function() {
      var endpoint = this.settings.path || "";
      var l = this.settings.language;
      var restoreScript = {
        utm_source : "reflect_embed"
      };
      return l && ("en" !== l && (restoreScript.l = l)), REFLECT.serialize(m.urls.apps[this.name] + endpoint, restoreScript);
    },
    /**
     * @param {string} callback
     * @return {?}
     */
    show : function(callback) {
      if (!this.frame.isReady()) {
        return void this.once("frame:ready", function() {
          this.show(callback);
        }, this);
      }
      var data = {
        path : callback
      };
      if (this.settings.sso) {
        data.sso = this.settings.sso;
      }
      this.frame.sendMessage("showPath", data);
    }
  }, {
    READY_TIMEOUT : 1E4,
    /**
     * @param {Object} el
     * @return {?}
     */
    getInstanceOrLoad : function(el) {
      var self = options.instance;
      return self ? self : (self = options.instance = new options(el), el.preload && self.listenToOnce(self, "state:INIT", function() {
        self.frame.hide();
      }), options.setHomeTimeout(self), self.init(), self);
    },
    /**
     * @param {Object} self
     * @return {undefined}
     */
    setHomeTimeout : function(self) {
      if (options.homeTimeoutId) {
        context.clearTimeout(options.homeTimeoutId);
      }
      var deps = options.homeTimeoutId = context.setTimeout(function() {
        self.frame.destroy();
        self.trigger("timeout");
      }, options.READY_TIMEOUT);
      self.listenToOnce(self, "state:READY", function() {
        context.clearTimeout(deps);
      });
    },
    /**
     * @param {Object} el
     * @return {?}
     */
    preload : function(el) {
      return el.preload = true, options.getInstanceOrLoad(el);
    },
    /**
     * @return {undefined}
     */
    destroy : function() {
      var engine = options.instance;
      if (engine) {
        engine.destroy();
        /** @type {null} */
        options.instance = null;
      }
    },
    /**
     * @param {string} event
     * @return {?}
     */
    show : function(event) {
      var message = options.getInstanceOrLoad(event);
      return message.show(event.path), message;
    }
  });
  return{
    show : options.show,
    preload : options.preload,
    destroy : options.destroy,
    _HomeApp : options
  };
}), REFLECT.define("next.host.lounge", function(global) {
  var doc = global.document;
  var self = REFLECT.next.host;
  var app = self.utils;
  var Component = self.app.ThreadBoundApp;
  /**
   * @param {Element} root
   * @param {string} html
   * @return {?}
   */
  var init = function(root, html) {
    var d = doc.createElement("div");
    /** @type {string} */
    d.innerHTML = html;
    var collection = d.getElementsByTagName("script");
    /** @type {number} */
    var idx = 0;
    var e = collection.length;
    for (;e > idx;idx++) {
      var node = collection[idx];
      var n = doc.createElement("script");
      n.innerHTML = node.innerHTML;
      d.replaceChild(n, node);
    }
    return root.appendChild(d), d;
  };
  /**
   * @param {Element} cell
   * @param {string} element
   * @return {?}
   */
  var create = function(cell, element) {
    var text = init(cell, element);
    return cell.insertBefore(text, cell.firstChild), text;
  };
  var e = Component.extend({
    name : "lounge",
    loaderVersion : app.getLoaderVersionFromUrl("//www.ryflection.com/next/embed/lounge.load.104feca2c767b6d7ee0b10d93beeec41.js"),
    indicators : null,
    wasInViewport : false,
    triggeredSlowEvent : false,
    events : {
      /**
       * @return {undefined}
       */
      "state:INIT" : function() {
        var settings = this.settings;
        if (!settings.unsupported) {
          this.indicators = {};
          if (this.isContainerVisible()) {
            this.addLoadingAnim();
          } else {
            this.addLoadingAnimOnContainerVisible();
          }
          this.bindPublisherCallbacks();
          this.forwardGlobalEvents();
        }
      },
      /**
       * @return {undefined}
       */
      "state:LOADED" : function() {
        if (this.isContainerVisible()) {
          this.addLoadingAnim();
        }
      },
      /**
       * @return {undefined}
       */
      "frame:reload" : function() {
        global.location.reload();
      },
      /**
       * @param {string} loc
       * @return {undefined}
       */
      "frame:navigate" : function(loc) {
        /** @type {string} */
        global.location.href = loc;
      },
      /**
       * @param {?} err
       * @return {undefined}
       */
      "frame:session.identify" : function(err) {
        this.trigger("session.identify", err);
      },
      /**
       * @return {undefined}
       */
      "frame:posts.paginate" : function() {
        this.trigger("posts.paginate");
      },
      /**
       * @param {?} err
       * @return {undefined}
       */
      "frame:posts.count" : function(err) {
        this.trigger("posts.count", err);
      },
      /**
       * @param {Element} filter
       * @return {undefined}
       */
      "frame:posts.create" : function(filter) {
        this.trigger("posts.create", {
          id : filter.id,
          text : filter.raw_message
        });
      },
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      "frame:posts.beforeCreate" : function(deepDataAndEvents) {
        this.onBeforePostCreate(deepDataAndEvents);
      },
      /**
       * @param {Object} label
       * @return {undefined}
       */
      "frame:ads.inject" : function(label) {
        var copies = ("top" === label.placement ? create : init)(this.settings.container, label.html);
        this._injected = this._injected || [];
        this._injected.push(copies);
      },
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      "frame:onboard.show" : function(deepDataAndEvents) {
        this.showOnboard(deepDataAndEvents);
      },
      /**
       * @return {undefined}
       */
      "frame:home.destroy" : function() {
        this.destroyHome();
      },
      /**
       * @param {Error} deepDataAndEvents
       * @return {undefined}
       */
      "frame:home.preload" : function(deepDataAndEvents) {
        this.preloadHome(deepDataAndEvents);
      },
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      "frame:home.show" : function(deepDataAndEvents) {
        this.showHome(deepDataAndEvents);
      },
      /**
       * @param {Object} $location
       * @return {undefined}
       */
      "frame:home.open" : function($location) {
        /** @type {Object} */
        global.location = $location;
      },
      /**
       * @param {Object} $cookies
       * @param {Object} session
       * @return {undefined}
       */
      "frame:indicator:init" : function($cookies, session) {
        if (session.getOffset) {
          var element;
          var key;
          /** @type {Array} */
          var codeSegments = ["north", "south"];
          var data = this.indicators;
          /** @type {string} */
          var targetWidth = session.getOffset().width + "px";
          var defaults = {
            width : targetWidth,
            "min-width" : targetWidth,
            "max-width" : targetWidth,
            position : "fixed",
            "z-index" : app.MAX_Z_INDEX - 1
          };
          var locals = {
            north : {
              top : "0"
            },
            south : {
              bottom : "0"
            }
          };
          /**
           * @return {undefined}
           */
          var init = function() {
            session.sendMessage("indicator:click", this.uid.split("-")[1]);
          };
          /** @type {number} */
          var i = 0;
          for (;i < codeSegments.length;i++) {
            key = codeSegments[i];
            element = new REFLECT.Sandbox({
              uid : "indicator-" + key,
              container : this.settings.container,
              contents : $cookies[key].contents,
              styles : REFLECT.extend(locals[key], defaults),
              role : "alert",
              type : key
            });
            try {
              element.load();
            } catch (m) {
              continue;
            }
            element.hide();
            element.click(init);
            data[key] = element;
          }
          this.on({
            /**
             * @param {Object} h
             * @return {undefined}
             */
            "frame:indicator:show" : function(h) {
              var frame = data[h.type];
              if (frame) {
                frame.document.getElementById("message").innerHTML = h.content;
                frame.show();
              }
            },
            /**
             * @param {Object} opt_e
             * @return {undefined}
             */
            "frame:indicator:hide" : function(opt_e) {
              var id = opt_e && opt_e.type;
              var widget = id && data[id];
              if (widget) {
                widget.hide();
              } else {
                if (!id) {
                  /** @type {number} */
                  var i = 0;
                  for (;i < codeSegments.length;i++) {
                    id = codeSegments[i];
                    widget = data[id];
                    if (widget) {
                      widget.hide();
                    }
                  }
                }
              }
            }
          });
        }
      },
      /**
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      "frame:change:sort" : function(deepDataAndEvents) {
        app.storage.setItem("reflect.sort", deepDataAndEvents);
      },
      /**
       * @return {undefined}
       */
      "frame:fail frame:rendered" : function() {
        this.removeLoadingAnim();
        this.setState("RUNNING");
      },
      /**
       * @param {Error} err
       * @return {undefined}
       */
      "frame:fail" : function(err) {
        app.logStat("failed_embed.server." + err.code);
      },
      /**
       * @return {undefined}
       */
      "frame:rendered" : function() {
        if (this.triggeredSlowEvent) {
          app.logStat("rendered_embed.slow");
        }
      }
    },
    onceEvents : {
      /**
       * @param {Object} self
       * @param {Object} m
       * @return {undefined}
       */
      "frame:viglink:init" : function(self, m) {
        /**
         * @return {?}
         */
        var arrayContains = function() {
          var label;
          for (label in global) {
            if (0 === label.indexOf("skimlinks") || 0 === label.indexOf("skimwords")) {
              return true;
            }
          }
          return false;
        };
        if (!(global.vglnk_self || (global.vglnk || arrayContains()))) {
          var url = self.apiUrl;
          var key = self.key;
          /** @type {string} */
          var udataCur = String(self.id);
          if (null != self.clientUrl) {
            if (null != url) {
              if (null != key) {
                if (null != self.id) {
                  this.listenForAffiliationRequests(url, key, udataCur);
                  REFLECT.define("vglnk", function() {
                    return{
                      api_url : url,
                      key : key,
                      sub_id : udataCur,
                      /**
                       * @return {undefined}
                       */
                      onlibready : function() {
                        m.sendMessage("viglink:change:timeout", {
                          timeout : REFLECT.vglnk.opt("click_timeout")
                        });
                      }
                    };
                  });
                  /** @type {string} */
                  global.vglnk_self = "REFLECT.vglnk";
                  REFLECT.require(self.clientUrl);
                }
              }
            }
          }
        }
      }
    },
    /**
     * @param {?} protoProps
     * @param {Object} classProps
     * @return {?}
     */
    getFrameInitParams : function(protoProps, classProps) {
      var child = Component.prototype.getFrameInitParams.call(this, protoProps, classProps);
      return child.discovery = this.settings.discovery, child;
    },
    /**
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    onBeforePostCreate : function(deepDataAndEvents) {
      var data = {
        text : deepDataAndEvents.raw_message
      };
      try {
        var codeSegments = this.settings.callbacks.beforeComment;
        if (codeSegments) {
          /** @type {number} */
          var i = 0;
          for (;i < codeSegments.length;i++) {
            data = codeSegments[i](data);
          }
        }
      } catch (dstUri) {
        REFLECT.log("Error processing Reflect callback: ", dstUri.toString());
      } finally {
        this.frame.sendMessage("posts.beforeCreate.response", data && data.text);
      }
    },
    /**
     * @return {undefined}
     */
    destroyHome : function() {
      self.home.destroy();
    },
    /**
     * @param {Error} deepDataAndEvents
     * @return {undefined}
     */
    preloadHome : function(deepDataAndEvents) {
      /** @type {string} */
      deepDataAndEvents.path = "home/preload";
      var Events = this.home = self.home.preload(this.getHomeData(deepDataAndEvents));
      this.listenToOnce(Events, "frame:ready", function() {
        this.frame.sendMessage("home.ready");
      });
      this.handleHomeTimeout(Events);
    },
    /**
     * @param {?} Events
     * @return {undefined}
     */
    handleHomeTimeout : function(Events) {
      this.listenTo(Events, "timeout", function() {
        this.frame.sendMessage("home.timeout");
      });
    },
    /**
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    showHome : function(deepDataAndEvents) {
      var Events = this.home = self.home.show(this.getHomeData(deepDataAndEvents));
      this.listenToOnce(Events, "frame:openReady", function() {
        this.frame.sendMessage("home.opened");
      });
      this.handleHomeTimeout(Events);
    },
    /**
     * @param {Object} deepDataAndEvents
     * @return {?}
     */
    getHomeData : function(deepDataAndEvents) {
      var config = this.settings;
      return deepDataAndEvents.language || (deepDataAndEvents.language = config.language), config.apiKey && (config.remoteAuthS3 && (deepDataAndEvents.sso = {
        apiKey : config.apiKey,
        remoteAuthS3 : config.remoteAuthS3
      })), deepDataAndEvents;
    },
    /**
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    showOnboard : function(deepDataAndEvents) {
      var settings = this.settings;
      var Events = self.onboard.Onboard({
        windowName : deepDataAndEvents.windowName,
        language : settings.language,
        forum : settings.forum,
        forumId : deepDataAndEvents.forumId,
        threadId : deepDataAndEvents.threadId,
        forumPk : deepDataAndEvents.forumPk
      });
      this.stopListening(Events);
      this.listenToOnce(Events, "onboard.complete", function() {
        this.frame.sendMessage("onboard.complete");
      });
      this.listenTo(Events, "onboard.profileUpdated", function() {
        this.frame.sendMessage("onboard.profileUpdated");
      });
      Events.show({
        activeSection : deepDataAndEvents.activeSection
      });
    },
    /**
     * @param {?} url
     * @param {string} aKey
     * @param {string} value
     * @return {undefined}
     */
    listenForAffiliationRequests : function(url, aKey, value) {
      var node = this.frame;
      this.on("frame:viglink:getaffiliatelink", function(request) {
        /**
         * @param {?} res
         * @return {?}
         */
        function onSuccess(res) {
          return function(id) {
            var msg = {
              linkId : res
            };
            if (id) {
              /** @type {string} */
              msg.url = id;
            }
            node.sendMessage("viglink:getaffiliatelink:response", msg);
          };
        }
        var $ = REFLECT.vglnk.$;
        return $ ? void $.request(url + "/click", {
          format : "jsonp",
          out : request.url,
          key : aKey,
          loc : node.target,
          subId : value
        }, {
          fn : onSuccess(request.linkId),
          timeout : REFLECT.vglnk.opt("click_timeout")
        }) : void node.sendMessage("viglink:getaffiliatelink:response");
      });
    },
    /**
     * @return {undefined}
     */
    forwardGlobalEvents : function() {
      var self = this;
      if (!self.settings.windowName) {
        self.listenTo(REFLECT, "window.resize", function() {
          self.frame.sendMessage("window.resize");
        });
        self.listenTo(REFLECT, "window.click", function() {
          self.frame.sendMessage("window.click");
        });
        self.listenTo(REFLECT, "window.mousemove", function() {
          self.frame.sendMessage("window.mousemove");
        });
      }
      self.listenTo(REFLECT, "window.hashchange", function(item) {
        self.frame.sendMessage("window.hashchange", item.hash);
      });
    },
    /**
     * @return {undefined}
     */
    bindPublisherCallbacks : function() {
      var self = this;
      var options = self.settings;
      var obj = e.LEGACY_EVENTS_MAPPING;
      var which = options.callbacks;
      if (which) {
        REFLECT.each(which, function(which, i) {
          if (obj[i]) {
            REFLECT.each(which, function(listener) {
              self.on(obj[i], listener);
            });
          }
        });
      }
    },
    /**
     * @return {?}
     */
    isContainerVisible : function() {
      var s = this.getViewportCoords();
      var pos = REFLECT.getOffset(this.settings.container, this.getScrollContainer());
      /** @type {number} */
      var y = pos.top + pos.height - s.top;
      return y > 0 && y <= s.height;
    },
    /**
     * @return {?}
     */
    showSlowLoadingMessage : function() {
      var suiteView;
      var self = this;
      if (self.loadingElem) {
        if (app.pageVisibility.isHidden()) {
          return suiteView = function() {
            app.pageVisibility.stopListening(suiteView);
            self.setSlowLoadingMessageTimer(2E3);
          }, void app.pageVisibility.listen(suiteView);
        }
        /** @type {boolean} */
        self.triggeredSlowEvent = true;
        app.logStat(self.state === self.constructor.states.READY ? "slow_embed.got_ready" : self.state === self.constructor.states.LOADED ? "slow_embed.loaded" : "slow_embed.no_ready");
        self.loadingElem.firstChild.insertAdjacentHTML("afterend", '<p align="center">Reflect seems to be taking longer than usual. <a href="#" onclick="REFLECT.reset({reload: true}); return false;">Reload</a>?</p>');
      }
    },
    /**
     * @return {undefined}
     */
    clearSlowLoadingMessageTimer : function() {
      if (this.timeout) {
        global.clearTimeout(this.timeout);
        /** @type {null} */
        this.timeout = null;
      }
    },
    /**
     * @param {number} timeout
     * @return {undefined}
     */
    setSlowLoadingMessageTimer : function(timeout) {
      var config = this;
      config.clearSlowLoadingMessageTimer();
      config.timeout = global.setTimeout(function() {
        config.showSlowLoadingMessage();
      }, timeout);
    },
    /**
     * @return {undefined}
     */
    addLoadingAnimOnContainerVisible : function() {
      var throttledUpdate;
      var evt = this;
      throttledUpdate = evt.listenToScrollEvent(function() {
        var c = evt.isContainerVisible();
        if (c || evt.state >= evt.constructor.states.RUNNING) {
          throttledUpdate();
        }
        if (c) {
          evt.addLoadingAnim();
        }
      });
    },
    /**
     * @return {?}
     */
    addLoadingAnim : function() {
      var el;
      var div;
      var span;
      var options = this;
      var container = options.settings.container;
      if (options.loadingElem) {
        return options.loadingElem;
      }
      if (!(options.state >= options.constructor.states.RUNNING)) {
        var linkTag = doc.createElement("link");
        /** @type {string} */
        linkTag.rel = "stylesheet";
        /** @type {string} */
        linkTag.href = "//ryflection.com/next/embed/styles/loading.aaa873ed4a78106f29994d34d7eabec1.css";
        (doc.head || doc.getElementsByTagName("head")[0]).appendChild(linkTag);
        el = doc.createElement("div");
        div = doc.createElement("div");
        span = doc.createElement("div");
        div.appendChild(span);
        el.appendChild(div);
        /** @type {string} */
        el.dir = "ltr";
        /** @type {string} */
        el.style.overflow = "hidden";
        /** @type {boolean} */
        var name = "dark" === options.settings.colorScheme;
        /** @type {string} */
        div.className = "reflect-loader-bubble";
        var ds = div.style;
        /** @type {string} */
        ds.height = "52px";
        /** @type {string} */
        ds.width = "54px";
        /** @type {string} */
        ds.margin = "0 auto";
        /** @type {string} */
        ds.overflow = "hidden";
        /** @type {string} */
        ds.position = "relative";
        if (name) {
          /** @type {string} */
          ds.backgroundPosition = "0 -52px";
        }
        /** @type {number} */
        var width = 13;
        /** @type {string} */
        var nameSuffix = name ? "rgba(223, 228, 237, .4)" : "rgba(51, 54, 58, .4)";
        /** @type {string} */
        var index = name ? "#6D6F72" : "#A3A7AD";
        var style = span.style;
        return ds.boxSizing = style.boxSizing = "border-box", style.height = style.width = 2 * width + "px", style.position = "absolute", style.top = "13px", style.left = "15px", "borderRadius" in style ? (style.borderWidth = "3px", style.borderStyle = "solid", style.borderColor = nameSuffix + " transparent", style.borderRadius = width + "px", style.transformOrigin = "50% 50% 0px", span.className = "reflect-loader-spinner") : style.borderLeft = "3px solid " + index, container.appendChild(el), options.loadingElem = 
        el, app.logStat("lounge.loading.view"), options.setSlowLoadingMessageTimer(15E3), options.loadingElem;
      }
    },
    /**
     * @return {undefined}
     */
    removeLoadingAnim : function() {
      var childNode = this.loadingElem;
      var parentNode = this.settings.container;
      this.clearSlowLoadingMessageTimer();
      if (childNode) {
        if (childNode.parentNode === parentNode) {
          parentNode.removeChild(childNode);
          /** @type {null} */
          this.loadingElem = null;
        }
      }
    },
    /**
     * @return {undefined}
     */
    destroy : function() {
      var indicators = this.indicators;
      if (this.removeLoadingAnim(), indicators && (indicators.north && (indicators.north.destroy(), indicators.north = null)), this._injected) {
        /** @type {number} */
        var i = 0;
        for (;i < this._injected.length;i++) {
          this.settings.container.removeChild(this._injected[i]);
        }
      }
      if (indicators) {
        if (indicators.south) {
          indicators.south.destroy();
          /** @type {null} */
          indicators.south = null;
        }
      }
      Component.prototype.destroy.call(this);
    }
  }, {
    LEGACY_EVENTS_MAPPING : {
      onReady : "frame:rendered",
      onNewComment : "posts.create",
      onPaginate : "posts.paginate",
      onCommentCountChange : "posts.count",
      onIdentify : "session.identify"
    }
  });
  /**
   * @param {?} elem
   * @return {?}
   */
  var restoreScript = function(elem) {
    return new e(elem);
  };
  return self.app.expose(e, ["list", "listByKey", "get"], restoreScript), {
    /** @type {function (?): ?} */
    Lounge : restoreScript
  };
}), REFLECT.define("next.host.config", function(dataAndEvents, id) {
  var Y = REFLECT.use("next.host.utils");
  /**
   * @param {Window} n
   * @param {?} ctx
   * @return {undefined}
   */
  var f = function(n, ctx) {
    /** @type {Window} */
    this.win = n;
    this.configurator = ctx;
    this.config = {
      page : {
        url : id,
        title : id,
        slug : id,
        category_id : id,
        identifier : id,
        language : id,
        api_key : id,
        remote_auth_s3 : id,
        author_s3 : id
      },
      experiment : {
        enable_scroll_container : true,
        force_auto_styles : id,
        sort_order : id
      },
      discovery : {
        disable_all : id,
        disable_promoted : id,
        sponsored_comment_id : id,
        preview : false,
        adsFixture : id,
        pdFixture : id
      },
      strings : id,
      sso : {},
      callbacks : {
        preData : [],
        preInit : [],
        onInit : [],
        afterRender : [],
        onReady : [],
        onNewComment : [],
        preReset : [],
        onPaginate : [],
        onIdentify : [],
        beforeComment : []
      }
    };
  };
  /** @type {Array} */
  f.REFLECT_GLOBALS = ["shortname", "identifier", "url", "title", "category_id", "slug"];
  var m = f.prototype;
  return m.getContainer = function() {
    var win = this.win;
    return win.document.getElementById(win.reflect_container_id || "reflect_thread");
  }, m.runConfigurator = function() {
    var fn = this.configurator || this.win.reflect_config;
    if ("function" == typeof fn) {
      try {
        fn.call(this.config);
      } catch (b) {
      }
    }
  }, m.getValuesFromGlobals = function() {
    var field;
    var win = this.win;
    var config = this.config;
    var options = config.page;
    REFLECT.each(f.REFLECT_GLOBALS, function(name) {
      var value = win["reflect_" + name];
      if ("undefined" != typeof value) {
        options[name] = value;
      }
    });
    this.runConfigurator();
    if (!config.forum) {
      field = options.shortname;
      config.forum = field ? field.toLowerCase() : Y.getForum(win.document);
    }
  }, m.toJSON = function() {
    var win = this.win;
    var config = this.config;
    var data = config.page;
    var node = this.getContainer();
    return this.getValuesFromGlobals(), {
      container : node,
      forum : config.forum,
      sortOrder : config.experiment.sort_order || (Y.storage.getItem("reflect.sort") || "default"),
      language : config.language,
      typeface : Y.isSerif(node) ? "serif" : "sans-serif",
      anchorColor : Y.getAnchorColor(node),
      colorScheme : Y.getContrastYIQ(Y.getElementStyle(node, "span", "background-color", "backgroundColor")) < 128 ? "dark" : "light",
      url : data.url || win.location.href.replace(/#.*$/, ""),
      title : data.title,
      documentTitle : Y.guessThreadTitle(),
      slug : data.slug,
      category : data.category_id,
      identifier : data.identifier,
      discovery : config.discovery,
      apiKey : data.api_key,
      remoteAuthS3 : data.remote_auth_s3,
      sso : config.sso,
      unsupported : Y.getBrowserSupport(win),
      callbacks : config.callbacks,
      enableScrollContainer : config.experiment.enable_scroll_container,
      forceAutoStyles : config.experiment.force_auto_styles
    };
  }, {
    /** @type {function (Window, ?): undefined} */
    HostConfig : f
  };
}), REFLECT.define("next.host.loader", function(obj) {
  var options;
  var req = REFLECT.use("next.host.loader");
  var module = REFLECT.use("next.host");
  var item = new module.config.HostConfig(obj);
  /** @type {boolean} */
  var f = false;
  /**
   * @return {?}
   */
  var init = function() {
    var doc = obj.document;
    if (doc.getElementsByClassName) {
      if ("complete" !== doc.readyState) {
        return REFLECT.addEvent(obj, "load", init);
      }
      var lines = doc.getElementsByClassName("ref-brlink");
      var tabPage = lines && (lines.length && lines[0]);
      if (tabPage) {
        tabPage.parentNode.removeChild(tabPage);
      }
    }
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  var clear = function(obj) {
    if (options) {
      return reset({
        reload : true
      }), REFLECT.log("Use REFLECT.reset instead of reloading embed.js please."), void REFLECT.log("See https://help.disqus.com/customer/portal/articles/472107-using-disqus-on-ajax-sites");
    }
    item.configurator = obj;
    var self = item.toJSON();
    return f || (self.container.innerHTML = "", f = true), options = module.lounge.Lounge(self), options.init(), req.removeReflectLink(), options;
  };
  /**
   * @param {Object} opts
   * @return {undefined}
   */
  var reset = function(opts) {
    opts = opts || {};
    if (options) {
      if (options.triggeredSlowEvent) {
        if (options.state !== options.constructor.states.RUNNING) {
          module.utils.logStat("reset_embed.slow");
        }
      }
      options.destroy();
      /** @type {null} */
      options = null;
    }
    if (opts.reload) {
      req.loadEmbed(opts.config);
    }
  };
  return{
    configAdapter : item,
    /** @type {function (): ?} */
    removeReflectLink : init,
    /** @type {function (?): ?} */
    loadEmbed : clear,
    /** @type {function (Object): undefined} */
    reset : reset
  };
}), function() {
  REFLECT.reset = REFLECT.next.host.loader.reset;
  REFLECT.request = {
    /**
     * @param {string} module
     * @param {Object} id
     * @param {boolean} callback
     * @return {undefined}
     */
    get : function(module, id, callback) {
      REFLECT.require(module, id, callback);
    }
  };
}(), REFLECT.next.host.loader.loadEmbed();
