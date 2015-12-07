!function(name) {
  var that;
  var $;
  $ = {
    /**
     * @param {Array} object
     * @param {Function} callback
     * @return {undefined}
     */
    each : function(object, callback) {
      var index;
      var length;
      /** @type {number} */
      index = 0;
      length = object.length;
      for (;length > index;index++) {
        callback(object[index], index);
      }
    },
    /**
     * @param {Object} a
     * @return {?}
     */
    extend : function(a) {
      var b;
      var i;
      var k;
      var s;
      /** @type {number} */
      var l = arguments.length;
      a = a || {};
      /** @type {number} */
      i = 1;
      for (;l > i;i++) {
        if (s = arguments[i], void 0 !== s && null !== s) {
          for (k in s) {
            b = s[k];
            if (a !== b) {
              if (void 0 !== b) {
                a[k] = b;
              }
            }
          }
        }
      }
      return a;
    }
  };
  $.extend($, {
    /**
     * @param {Element} elem
     * @param {string} c
     * @return {undefined}
     */
    addClass : function(elem, c) {
      if (!$.hasClass(elem, c)) {
        /** @type {string} */
        elem.className = (elem.className ? elem.className + " " : "") + c;
      }
    },
    /**
     * @param {Object} allow
     * @param {string} string
     * @param {string} param
     * @return {?}
     */
    attrValues : function(allow, string, param) {
      return param = param || " ", string = allow[string], string ? string.split(param) : [];
    },
    /**
     * @param {Function} fn
     * @param {Object} scope
     * @return {?}
     */
    bind : function(fn, scope) {
      return function() {
        return fn.apply(scope, arguments);
      };
    },
    browser : function() {
      var b;
      var o = {};
      /** @type {Array.<string>} */
      var which = navigator.userAgent.toLowerCase().replace(/\s*[()]\s*/g, "; ").replace(/(\/[\w.]+)\s+/g, "$1; ").replace(/\;\s*$/, "").split(/;\s*/);
      return $.each(which, function(a) {
        b = (/[\/ :]([^\/ :]+)$/.exec(a) || [])[1];
        o[b ? a.substr(0, a.length - b.length - 1).replace(/\d*$/, "") : a] = b || true;
      }), {
        aol : o.aol,
        blackberry : o.blackberry,
        ie : o.msie,
        ios : o.mobile && o.safari,
        opera : o.opera,
        playstation : o.playstation,
        version : parseFloat(o.version) || false
      };
    }(),
    cache : function() {
      var m = {};
      /** @type {string} */
      var name = "vglnk_" + (new Date).getTime();
      /** @type {number} */
      var _k = 0;
      return function(t, path, root) {
        if (t) {
          var i = t[name];
          if (i || void 0 !== root) {
            return i || (i = ++_k), m[i] || (t[name] = i, m[i] = {}), void 0 !== root && (m[i][path] = root), "string" == typeof path ? m[i][path] : m[i];
          }
        }
      };
    }(),
    /**
     * @param {string} components
     * @return {?}
     */
    canonicalizeHostname : function(components) {
      return "string" == typeof components && (components = $.createA(components)), components.hostname ? components.hostname.toString().toLowerCase().replace(/^www\./, "").replace(/:.*$/, "") : "";
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    clone : function(obj) {
      return $.extend({}, obj);
    },
    /**
     * @param {?} other
     * @param {string} child
     * @return {?}
     */
    contains : function(other, child) {
      return-1 !== $.indexOf(other, child);
    },
    /**
     * @param {Window} activeXObj
     * @return {?}
     */
    contextIsAncestor : function(activeXObj) {
      /** @type {Window} */
      var win = window.self;
      for (;win.parent && win.parent !== win;) {
        if (win = win.parent, win === activeXObj) {
          return true;
        }
      }
      return false;
    },
    /**
     * @param {string} url
     * @return {undefined}
     */
    cors : function(url) {
      var xhr;
      /**
       * @return {undefined}
       */
      var processResp = function() {
        eval(xhr.responseText);
      };
      /** @type {XMLHttpRequest} */
      xhr = new window.XMLHttpRequest;
      /**
       * @return {undefined}
       */
      xhr.onreadystatechange = function() {
        if (4 === xhr.readyState) {
          if (200 === xhr.status) {
            processResp();
          }
        }
      };
      xhr.open("GET", url);
      /** @type {boolean} */
      xhr.withCredentials = true;
      xhr.send();
    },
    /**
     * @param {string} path
     * @param {Object} text
     * @return {?}
     */
    createA : function(path, text) {
      return $.createEl("a", {
        href : path,
        target : text
      });
    },
    /**
     * @param {string} tag
     * @param {Object} options
     * @param {Object} prop
     * @param {Object} doc
     * @return {?}
     */
    createEl : function(tag, options, prop, doc) {
      var i;
      var e = (doc || document).createElement(tag);
      options = options || {};
      prop = prop || {};
      for (i in options) {
        if (void 0 !== options[i]) {
          e[i] = options[i];
        }
      }
      return $.css(e, prop), e;
    },
    /**
     * @param {Element} el
     * @param {Object} prop
     * @return {?}
     */
    css : function(el, prop) {
      var n;
      for (n in prop) {
        try {
          el.style[n] = prop[n];
        } catch (d) {
        }
      }
      return el;
    },
    /**
     * @param {Function} orig
     * @return {?}
     */
    destructing : function(orig) {
      return function(matcherFunction) {
        var result;
        /** @type {boolean} */
        var n = false;
        return function() {
          return n || (result = matcherFunction.apply(null, arguments), n = true), result;
        };
      }(orig);
    },
    escapeRegExp : function() {
      var rreturn;
      return function(ret) {
        return rreturn = rreturn || new RegExp("([.*+?^${}()|[\\]\\\\])", "g"), ret.replace(rreturn, "\\$1");
      };
    }(),
    /**
     * @param {Object} event
     * @return {?}
     */
    eventLink : function(event) {
      var a;
      var B;
      var n = event.target || event.srcElement;
      do {
        try {
          a = n.nodeType;
        } catch (e) {
          return;
        }
        if (1 === a && (B = n.tagName.toUpperCase(), "A" === B || "AREA" === B)) {
          return n;
        }
        n = n.parentNode;
      } while (n);
    },
    exceptionLogger : function() {
      /** @type {boolean} */
      var text = false;
      /**
       * @return {undefined}
       */
      var isUndefined = function() {
      };
      return function(matcherFunction, textAlt) {
        return void 0 === textAlt ? function() {
          if (!text) {
            return matcherFunction.apply(this, arguments);
          }
          try {
            return matcherFunction.apply(this, arguments);
          } catch (suiteView) {
            isUndefined(suiteView);
          }
        } : (text = textAlt, void(isUndefined = matcherFunction));
      };
    }(),
    /**
     * @param {string} baseName
     * @return {?}
     */
    fromQuery : function(baseName) {
      if ("?" === baseName.substr(0, 1)) {
        baseName = baseName.substr(1);
      }
      var which = baseName.split("&");
      var params = {};
      return $.each(which, function(pair) {
        var part = pair.split("=");
        /** @type {string} */
        params[decodeURIComponent(part[0])] = decodeURIComponent(part[1]);
      }), params;
    },
    /**
     * @param {?} element
     * @param {string} node
     * @param {string} result
     * @param {string} param
     * @return {?}
     */
    hasAttrValue : function(element, node, result, param) {
      return node ? $.contains($.attrValues(element, node, param), result) : false;
    },
    /**
     * @param {Element} selector
     * @param {string} n
     * @return {?}
     */
    hasClass : function(selector, n) {
      return $.hasAttrValue(selector, "className", n);
    },
    /**
     * @param {?} string
     * @param {string} scope
     * @return {?}
     */
    hasRel : function(string, scope) {
      return $.hasAttrValue(string, "rel", scope);
    },
    indexOf : function() {
      return Array.prototype.indexOf ? function(next_scope, mapper) {
        return Array.prototype.indexOf.call(next_scope, mapper);
      } : function(rawParams, item) {
        var i;
        var len;
        /** @type {number} */
        i = 0;
        len = rawParams.length;
        for (;len > i;i++) {
          if (rawParams[i] === item) {
            return i;
          }
        }
        return-1;
      };
    }(),
    /**
     * @param {number} obj
     * @return {?}
     */
    isArray : function(obj) {
      return "array" === $.type(obj);
    },
    /**
     * @param {Object} event
     * @return {?}
     */
    isDefaultPrevented : function(event) {
      return event.isDefaultPrevented && event.isDefaultPrevented() || (event.returnValue === false || event.defaultPrevented === true);
    },
    /**
     * @param {string} url
     * @return {undefined}
     */
    jsonp : function(url) {
      var insertAt = document.getElementsByTagName("script")[0];
      var scriptEl = $.createEl("script", {
        type : "text/javascript",
        src : url
      });
      insertAt.parentNode.insertBefore(scriptEl, insertAt);
    },
    /**
     * @param {Object} elems
     * @param {?} iterator
     * @return {?}
     */
    map : function(elems, iterator) {
      /** @type {Array} */
      var $cookies = [];
      return $.each(elems, function(value, key) {
        if (void 0 !== value) {
          $cookies[key] = iterator(value);
        }
      }), $cookies;
    },
    on : function() {
      var obj;
      return function(el, type, matcherFunction) {
        var fn;
        var onResize;
        if (1 === arguments.length) {
          return void(obj = el);
        }
        if (2 === arguments.length) {
          if (!obj) {
            return;
          }
          /** @type {Object} */
          matcherFunction = type;
          /** @type {Object} */
          type = el;
          el = obj;
        }
        try {
          fn = el["on" + type];
        } catch (g) {
        }
        if ("function" == typeof fn) {
          el["on" + type] = $.bind(function(event) {
            event = event || window.event;
            var ret = fn.apply(el, arguments);
            this.exceptionLogger(function() {
              return event ? (void 0 !== ret && (event.returnValue !== false && (event.returnValue = ret)), $.isDefaultPrevented(event) && ("function" === $.type(event.preventDefault) && event.preventDefault()), event.returnValue) : ret;
            })();
          }, this);
        }
        onResize = $.exceptionLogger(function() {
          return obj.enabled() ? matcherFunction.apply(null, arguments) : void 0;
        });
        if (el.addEventListener) {
          el.addEventListener(type, onResize, false);
        } else {
          if (el.attachEvent) {
            el.attachEvent("on" + type, onResize);
          }
        }
      };
    }(),
    /**
     * @param {Object} element
     * @return {?}
     */
    position : function(element) {
      var parent;
      /** @type {number} */
      var x = 0;
      /** @type {number} */
      var y = 0;
      /** @type {number} */
      var sl = 0;
      /** @type {number} */
      var st = 0;
      if (!element.offsetParent) {
        return false;
      }
      /** @type {Object} */
      parent = element;
      do {
        x += parent.offsetLeft;
        y += parent.offsetTop;
        parent = parent.offsetParent;
      } while (parent);
      /** @type {Object} */
      parent = element;
      do {
        sl += parent.scrollLeft;
        st += parent.scrollTop;
        parent = parent.parentNode;
      } while (parent && parent !== document.body);
      return{
        x : x - sl,
        y : y - st
      };
    },
    /**
     * @param {Object} e
     * @return {?}
     */
    preventDefault : function(e) {
      return e.preventDefault && e.preventDefault(), e.returnValue = false, false;
    },
    ready : function() {
      var init;
      var check;
      var completed;
      var contentLoaded;
      var ready;
      /** @type {boolean} */
      var f = false;
      /** @type {Array} */
      var scripts = [];
      /** @type {boolean} */
      var h = false;
      return document.addEventListener ? completed = function() {
        document.removeEventListener("DOMContentLoaded", completed, false);
        ready();
      } : document.attachEvent && (contentLoaded = function() {
        if ("complete" === document.readyState) {
          document.detachEvent("onreadystatechange", contentLoaded);
          ready();
        }
      }), init = function() {
        if (!f) {
          if (f = true, "complete" === document.readyState) {
            return ready();
          }
          if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", completed, false);
          } else {
            if (document.attachEvent) {
              document.attachEvent("onreadystatechange", contentLoaded);
              /** @type {boolean} */
              var a = false;
              try {
                /** @type {boolean} */
                a = null === window.frameElement;
              } catch (g) {
              }
              if (document.documentElement.doScroll) {
                if (a) {
                  check();
                }
              }
            }
          }
          $.on(window, "load", ready);
        }
      }, check = function() {
        if (!h) {
          try {
            document.documentElement.doScroll("left");
          } catch (a) {
            return void setTimeout($.exceptionLogger(check), 1);
          }
          ready();
        }
      }, ready = function() {
        if (!h) {
          if (!document.body) {
            return setTimeout($.exceptionLogger(ready), 13);
          }
          /** @type {boolean} */
          h = true;
          if (scripts) {
            $.each(scripts, function(callback) {
              callback();
            });
            /** @type {null} */
            scripts = null;
          }
        }
      }, function(i) {
        init();
        if (h) {
          i();
        } else {
          scripts.push(i);
        }
      };
    }(),
    /**
     * @param {Object} p
     * @return {?}
     */
    reformatKeys : function(p) {
      var i;
      var f;
      /**
       * @param {Object} b
       * @return {?}
       */
      var t = function(b) {
        return "_" + b.toLowerCase();
      };
      for (i in p) {
        /** @type {string} */
        f = i.replace(/([A-Z])/g, t);
        if ("object" === $.type(p[i])) {
          p[i] = $.reformatKeys(p[i]);
        }
        if (f !== i) {
          p[f] = p[i];
          delete p[i];
        }
      }
      return p;
    },
    /**
     * @param {Element} element
     * @param {string} name
     * @return {undefined}
     */
    removeClass : function(element, name) {
      if ($.hasClass(element, name)) {
        var i;
        var l;
        var classes = $.attrValues(element, "className");
        /** @type {number} */
        i = 0;
        l = classes.length;
        for (;l > i;i++) {
          if (classes[i] === name) {
            delete classes[i];
          }
        }
        element.className = classes.join(" ");
      }
    },
    /**
     * @param {string} url
     * @param {string} query
     * @param {Object} options
     * @return {?}
     */
    request : function(url, query, options) {
      var r;
      var e;
      return options = $.extend({
        /**
         * @return {undefined}
         */
        fn : function() {
        },
        "return" : false,
        timeout : null
      }, options), "string" == typeof options.fn ? query = $.extend(query, {
        jsonp : options.fn
      }) : "function" == typeof options.fn && (r = $.destructing(options.fn), e = $.uniqid("vglnk_jsonp_"), query = $.extend(query, {
        jsonp : e
      }), window[e] = $.exceptionLogger(function() {
        r.apply(this, arguments);
        window[e] = void 0;
      }), null !== options.timeout && setTimeout($.exceptionLogger(r), options.timeout)), query = $.extend({
        format : "jsonp"
      }, query), query = $.toQuery(query), url = url + (query.length ? "?" : "") + query, options["return"] ? url : $.traits.cors ? $.cors(url) : $.jsonp(url);
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    toQuery : function(obj) {
      var key;
      /** @type {string} */
      var headBuffer = "";
      for (key in obj) {
        if (null !== obj[key]) {
          if (void 0 !== obj[key]) {
            headBuffer += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
          }
        }
      }
      return headBuffer.substr(1);
    },
    /**
     * @param {number} obj
     * @return {?}
     */
    type : function(obj) {
      return null === obj ? "null" : void 0 === obj ? "undefined" : Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    },
    /**
     * @param {string} e
     * @param {?} data
     * @return {?}
     */
    updateUrl : function(e, data) {
      return $.extend($.createA(e), data).href;
    },
    uniqid : function() {
      /** @type {number} */
      var a = 0;
      return function(classNames) {
        return(classNames || "") + (new Date).getTime() + a++;
      };
    }()
  });
  $.traits = {
    basicCompatibility : !($.browser.blackberry || $.browser.playstation),
    cors : window.XMLHttpRequest && void 0 !== (new window.XMLHttpRequest).withCredentials,
    crossWindowCommunication : !($.browser.ios && ($.browser.version && ($.browser.version < 5 || $.browser.version > 5))),
    jsRedirectSetsReferrer : $.browser.aol || !($.browser.ie || $.browser.opera),
    quirksMode : !Boolean(window.addEventListener),
    windowLevelHandlers : Boolean(window.addEventListener)
  };
  var options;
  var old;
  var obj;
  that = {
    /**
     * @param {string} type
     * @param {Object} params
     * @param {?} opt_attributes
     * @return {?}
     */
    api : function(type, params, opt_attributes) {
      /** @type {string} */
      var url = options.api_url + "/" + type;
      return params = $.extend({
        cuid : options.cuid,
        key : options.key,
        drKey : options.key ? null : options.dr_key,
        loc : location.href,
        subId : options.sub_id,
        v : 1
      }, params), params.subId && (params.key !== options.key && (params.subId = null)), $.request(url, params, opt_attributes);
    },
    /**
     * @param {string} event
     * @param {?} listener
     * @return {undefined}
     */
    addEventListener : function(event, listener) {
      this.fire(event, listener);
    },
    click : function() {
      /**
       * @param {Window} event
       * @param {string} el
       * @return {?}
       */
      var s = function(event, el) {
        if (!("_self" === el || $.traits.crossWindowCommunication && $.traits.jsRedirectSetsReferrer)) {
          return "go";
        }
        try {
          if (void 0 === event.document) {
            throw true;
          }
          return "jsonp";
        } catch (c) {
          return "go";
        }
      };
      /**
       * @param {string} target
       * @return {?}
       */
      var handler = function(target) {
        if ("_self" === target) {
          return window.self;
        }
        if ($.traits.crossWindowCommunication && $.traits.jsRedirectSetsReferrer) {
          /** @type {(Window|null)} */
          var name = window.open("", target);
          return name.focus(), name;
        }
      };
      /**
       * @param {Object} elem
       * @return {undefined}
       */
      var get = function(elem) {
        var value;
        var parent = elem.previousSibling;
        var options = elem.nextSibling;
        /** @type {Array} */
        var parts = ["", elem.textContent, ""];
        /** @type {number} */
        var i = 10;
        /**
         * @param {string} res
         * @param {string} b
         * @param {string} name
         * @return {?}
         */
        var fn = function(res, b, name) {
          /**
           * @param {string} s
           * @return {?}
           */
          var quote = function(s) {
            return s.replace(/\s+/g, " ");
          };
          return res = quote(res), b = quote(b), name = quote(name), res = res.replace(/^\s+/, ""), " " === b.substr(0, 1) && (b = b.substr(1), res += " " !== res.substr(res.length - 1, 1) ? " " : ""), " " === b.substr(b.length - 1, 1) && (b = b.substr(0, b.length - 1), name = (" " !== name.substr(0, 1) ? " " : "") + name), name = name.replace(/\s+$/, ""), [res, b, name];
        };
        if (void 0 !== parts[1]) {
          parts[0] = parent && 3 === parent.nodeType ? parent.data : "";
          parts[2] = options && 3 === options.nodeType ? options.data : "";
          parts = fn.apply(this, parts);
          if ("" !== parts[0]) {
            if ("" !== parts[2]) {
              parts[0] = parts[0].split(" ").reverse().slice(0, i + (" " === parts[0].substr(parts[0].length - 1, 1) ? 1 : 0)).reverse().join(" ");
              parts[2] = parts[2].split(" ").slice(0, i).join(" ");
              value = {
                type : "context",
                itype : ($.cache(elem, "params") || {}).type,
                before : parts[0],
                after : parts[2],
                txt : parts[1],
                loc : location.href,
                out : elem.href,
                v : 2
              };
              that.log("info", $.toQuery(value));
            }
          }
        }
      };
      return function(p, e) {
        e = p.target || e;
        e = !e || (e === window.name || ("_top" === e && window.top === window.self || "_parent" === e && window.parent === window.self)) ? "_self" : e;
        var callback;
        var path;
        var obj = handler(e);
        var x = s(obj, e);
        if (callback = $.destructing($.bind(function() {
          if (options.time_click) {
            if (arguments.length) {
              this.logTime("clk");
            }
          }
          /** @type {Array.<?>} */
          var args = Array.prototype.slice.call(arguments);
          args.unshift(p, obj, e);
          this.onApiClick.apply(this, args);
        }, this)), $.cache(this, "link", "string" == typeof p ? p : p.href), "string" == typeof p && (p = $.createA(p, e), !this.preprocessLink(p))) {
          return callback();
        }
        if (!options.enabled) {
          return callback();
        }
        if (path = this.clickParams(p, x), this.logTime(), options.log_context && get(p), "go" === x) {
          this.redirect(this.api("click", path, {
            "return" : true
          }), obj, e);
        } else {
          if (obj === window.self) {
            this.api("click", path, {
              fn : callback,
              timeout : options.click_timeout
            });
          } else {
            if ($.contextIsAncestor(obj)) {
              return this.redirect(p.href, obj, e);
            }
            callback = $.exceptionLogger(callback);
            setTimeout(function() {
              callback();
            }, options.click_timeout);
            obj.document.open();
            obj.callback = callback;
            obj.document.write("<html><head><title>" + p.href + '</title><script type="text/javascript" src="' + this.api("click", path, {
              fn : "callback",
              "return" : true
            }) + '">\x3c/script></head></html>');
            obj.document.close();
          }
        }
      };
    }(),
    /**
     * @param {Object} url
     * @param {string} type
     * @return {?}
     */
    clickParams : function(url, type) {
      var self = $.extend($.cache(url, "params"), {
        format : type,
        libid : options.library_id,
        out : url.href,
        ref : document.referrer || null,
        reaf : options.reaffiliate || null,
        title : document.title,
        txt : url.innerHTML
      });
      return self.txt.length > 128 && (self.txt = self.txt.replace(/<[^>]+>/g, ""), self.txt = self.txt.length > 128 ? self.txt.substr(0, 125) + "..." : self.txt), self;
    },
    /**
     * @return {?}
     */
    enabled : function() {
      return options.enabled && (old !== window && (window.vglnk && ((window.vglnk.key || "function" == typeof window.vglnk) && (options.enabled = false)))), options.enabled;
    },
    /**
     * @param {string} name
     * @param {Object} path
     * @return {undefined}
     */
    expose : function(name, path) {
      path = path || this[name];
      if (path) {
        if ("function" == typeof path) {
          path = $.exceptionLogger($.bind(path, this));
        } else {
          if ("object" == typeof path) {
            path = $.clone(path);
          }
        }
        if (!obj[name]) {
          /** @type {Object} */
          obj[name] = path;
        }
      }
    },
    fire : function() {
      var self = {};
      return function(evt, name) {
        evt = evt.toLowerCase();
        var e = self[evt] || {
          fired : false,
          listeners : []
        };
        /**
         * @param {?} fn
         * @return {undefined}
         */
        var ondata = function(fn) {
          fn({
            type : evt
          });
        };
        if ("function" == typeof name) {
          if (e.fired) {
            ondata(name);
          } else {
            e.listeners.push(name);
          }
        } else {
          /** @type {boolean} */
          e.fired = true;
          $.each(e.listeners, function(name) {
            if ("function" == typeof name) {
              ondata(name);
            }
          });
          /** @type {Array} */
          e.listeners = [];
        }
        self[evt] = e;
      };
    }(),
    /**
     * @param {Object} url
     * @param {string} callback
     * @return {undefined}
     */
    handleRightClick : function(url, callback) {
      if (options.rewrite_modified && (url && callback)) {
        switch(callback) {
          case "setup":
            if (!$.cache(url, "href")) {
              $.cache(url, "href", url.href);
            }
            url.href = this.api("click", this.clickParams(url, "go"), {
              "return" : true
            });
            setTimeout($.exceptionLogger($.bind(function() {
              this.handleRightClick(url, "teardown");
            }, this)), 0);
            break;
          case "teardown":
            url.href = $.cache(url, "href");
            $.cache(url, "href", null);
        }
      }
    },
    harmony : function() {
      return $.harmony = {
        UNSAFE_QUIRKSMODE_HANDLERS : 1
      }, function(dataAndEvents) {
        return options.harmony_level < dataAndEvents;
      };
    }(),
    init : $.exceptionLogger(function() {
      this.initLibEvents();
      this.initNamespace();
      this.initOptions();
      $.exceptionLogger($.bind(this.logException, this), !options.dev);
      this.initDRApi();
      this.initApi();
      if (this.enabled()) {
        this.initLegacyCallbacks();
        this.ping();
      }
    }),
    /**
     * @return {undefined}
     */
    initApi : function() {
      var key;
      var item = {};
      if (window.vglnk) {
        for (key in window.vglnk) {
          if ("_plugin" === key.substr(-7)) {
            item[key] = window.vglnk[key];
          }
        }
      }
      /** @type {function (): undefined} */
      obj = old[name] = function() {
      };
      this.expose("click");
      this.expose("link", that.preprocessLink);
      this.expose("opt");
      this.expose("$", $.clone($));
      $.extend(obj, obj === window.vglnk ? item : {});
    },
    /**
     * @return {undefined}
     */
    initDRApi : function() {
      /** @type {boolean} */
      var a = false;
      window.DrivingRevenue = $.exceptionLogger($.destructing($.bind(function() {
        /** @type {boolean} */
        a = true;
        options.dr_key = window.DR_id;
        if (this.enabled()) {
          this.ping();
        }
      }, this)));
      $.on("DOMReady", function() {
        if (!a) {
          try {
            delete window.DrivingRevenue;
          } catch (b) {
            window.DrivingRevenue = void 0;
          }
        }
      });
    },
    /**
     * @return {undefined}
     */
    initLibEvents : function() {
      $.on(that);
      $.ready($.bind(function() {
        this.fire("DOMReady");
      }, this));
    },
    /**
     * @return {undefined}
     */
    initNamespace : function() {
      if (window.vglnk) {
        if (window.vglnk.key) {
          /** @type {string} */
          name = "vglnk";
        }
      }
      var dir;
      /** @type {Window} */
      var cur = window;
      var stack = name.split(".");
      name = stack.pop();
      for (;stack.length > 0;) {
        dir = stack.shift();
        cur[dir] = cur[dir] || {};
        cur = cur[dir];
      }
      old = cur;
      obj = old[name] = old[name] || {};
    },
    /**
     * @return {undefined}
     */
    initOptions : function() {
      var option;
      this.initLegacyOptions();
      options = $.extend(this.publicOptions({
        api_url : "//api.viglink.com/api",
        cuid : null,
        dev : false,
        dr_key : null,
        enabled : $.traits.basicCompatibility,
        key : null,
        partner : null,
        sub_id : null,
        reaffiliate : false,
        harmony_level : 0,
        rewrite_original : true,
        rewrite_modified : false
      }), options, obj, {
        click_timeout : 1E3,
        hop_timeout : 2E3,
        debug : false,
        library_id : null,
        log_context : true,
        nofollow : {},
        norewrite : {},
        plugins : {
          link_affiliation : {},
          modified_clicks : {}
        },
        swap : {},
        time_click : false,
        time_ping : false
      });
      for (option in options) {
        if ("_plugin" === option.substr(-7)) {
          delete options[option];
        }
      }
    },
    /**
     * @return {undefined}
     */
    initLegacyOptions : function() {
      var i;
      var items = {
        DR_id : "dr_key",
        vglnk_api_key : "key",
        vglnk_cuid : "cuid",
        vglnk_domain : "api_url",
        vglnk_reaf : "reaffiliate",
        vglnk_subid : "sub_id"
      };
      for (i in items) {
        if (void 0 !== window[i]) {
          obj[items[i]] = window[i];
          if ("vglnk_domain" === i) {
            obj[items[i]] += "/api";
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    initLegacyCallbacks : function() {
      var key;
      var iterable = {
        vl_cB : $.bind(this.onApiClick, this),
        /**
         * @return {undefined}
         */
        vl_disable : function() {
          /** @type {boolean} */
          options.enabled = false;
        }
      };
      for (key in iterable) {
        window[key] = iterable[key];
      }
    },
    /**
     * @return {undefined}
     */
    initLinks : function() {
      $.each(document.links, $.bind(this.preprocessLink, this));
    },
    initPlugins : function() {
      var tref;
      /** @type {number} */
      var domain_2i = 100;
      /** @type {number} */
      var olen = 5E3;
      /** @type {number} */
      var pow = 1;
      /** @type {Array} */
      var tests = [];
      /**
       * @return {undefined}
       */
      var init = function() {
        /** @type {Array} */
        var exp = [];
        /**
         * @param {?} res
         * @return {?}
         */
        var cb = function(res) {
          return function() {
            if (res) {
              /** @type {Array.<?>} */
              var args = Array.prototype.slice.call(arguments);
              args.unshift("custom", res);
              that.log.apply(this, args);
            }
          };
        };
        /** @type {null} */
        tref = null;
        $.each(tests, function(o) {
          var func;
          var callback;
          var k = o[0];
          var arg = o[1];
          var current = o[2];
          var opts = window.vglnk && window.vglnk[k + "_plugin"];
          if (opts) {
            func = "function" === $.type(opts.run) ? opts.run : opts;
            callback = "function" === $.type(opts.setup) ? opts.setup : null;
            if (arg && 1 === arg.mode) {
              if (callback) {
                callback(arg, $.clone($), obj, cb(arg.key));
              }
              delete arg.mode;
            } else {
              if (func) {
                if (callback) {
                  if (!current) {
                    callback(arg, $.clone($), obj, cb(arg.key));
                  }
                }
                func(arg, $.clone($), obj, cb(arg.key));
              }
            }
          } else {
            exp.push(o);
          }
        });
        /** @type {Array} */
        tests = exp;
        if (tests.length > 0) {
          /** @type {number} */
          tref = setTimeout($.exceptionLogger(init), Math.min(Math.max(Math.pow(2, ++pow), domain_2i), olen));
        }
      };
      /**
       * @param {?} name
       * @param {?} task
       * @return {?}
       */
      var fn = function(name, task) {
        return function(name, fn) {
          return function() {
            tests.push([name, fn, true]);
            /** @type {number} */
            pow = 1;
            clearTimeout(tref);
            init();
          };
        }(name, task);
      };
      return function(data) {
        var name;
        for (name in data) {
          if ("object" == typeof data[name]) {
            if (data[name].enabled !== false) {
              tests.push([name, data[name]]);
              if (1 === data[name].mode) {
                this.expose("init_" + name, fn(name, data[name]));
              }
            }
          }
        }
        init();
      };
    }(),
    isRewritable : function() {
      var animating = $.canonicalizeHostname(document.location);
      return function(node) {
        var v;
        /** @type {string} */
        var segment = "";
        try {
          v = node.hostname;
          segment = node.protocol;
          v.charAt(0);
        } catch (e) {
          return false;
        }
        return "" !== v && (v = $.canonicalizeHostname(node)), !("" === v || (animating === v || (!segment.match(/^https?:$/i) || (options.norewrite[v] || (!options.rewrite_original && !$.cache(node, "type") || ($.hasRel(node, "norewrite") || $.hasRel(node, "noskim")))))));
      };
    }(),
    initEvents : $.destructing(function() {
      /** @type {(HTMLDocument|Window)} */
      var target = $.traits.windowLevelHandlers ? window : document;
      $.on(target, "mousedown", function(event) {
        event = event || window.event;
        var events = $.eventLink(event);
        if (events) {
          if (!$.cache(events, "evented")) {
            $.on(events, "click", function() {
            });
            $.cache(events, "evented", true);
          }
        }
      });
      if (!$.traits.quirksMode || that.harmony($.harmony.UNSAFE_QUIRKSMODE_HANDLERS)) {
        $.on(target, "click", $.bind(that.onClick, that));
        $.on(target, "contextmenu", $.bind(that.onContextmenu, that));
      }
    }),
    /**
     * @param {string} str
     * @param {string} text
     * @param {string} c
     * @param {number} value
     * @return {undefined}
     */
    log : function(str, text, c, value) {
      var message;
      var input;
      var chunk = $.toQuery({
        nocache : $.uniqid()
      });
      /** @type {string} */
      var tag = "pixel.gif";
      if ("custom" === str) {
        /** @type {string} */
        input = text;
        /** @type {string} */
        str = c;
        chunk += "&" + $.toQuery({
          key : input,
          type : str
        });
        $.each("array" === $.type(value) ? value : [value], function(contexts) {
          $.each(["e", "i", "o"], function(i) {
            delete contexts[i];
          });
          chunk += "&" + $.toQuery(contexts);
        });
      } else {
        if (chunk += "&" + $.toQuery({
          key : options.key,
          drKey : options.key ? null : options.dr_key
        }), "time" === str) {
          /** @type {string} */
          tag = "time.gif";
          message = {
            libId : options.library_id,
            time : c,
            type : text
          };
        } else {
          if ("exception" === str) {
            message = {
              e : text,
              o : c
            };
          } else {
            if ("info" !== str) {
              return;
            }
            message = {
              i : text
            };
          }
        }
        chunk += "&" + $.toQuery(message);
      }
      $.createEl("img").src = options.api_url + "/" + tag + "?" + chunk;
    },
    /**
     * @param {string} e
     * @return {undefined}
     */
    logException : function(e) {
      if (options.debug) {
        var a = {
          link : $.cache(this, "link"),
          loc : document.location.href,
          UA : navigator.userAgent
        };
        if ("string" == typeof e) {
          /** @type {string} */
          a.message = e;
        } else {
          a = $.extend(a, e);
        }
        this.log("exception", e, $.toQuery(a));
      }
    },
    logTime : function() {
      var from;
      return function(msg) {
        if (0 === arguments.length) {
          /** @type {number} */
          from = (new Date).getTime();
        } else {
          this.log("time", msg, (new Date).getTime() - from);
        }
      };
    }(),
    /**
     * @param {StyleSheet} a
     * @param {string} walkers
     * @param {string} optgroup
     * @param {string} j
     * @param {Object} data
     * @return {undefined}
     */
    onApiClick : function(a, walkers, optgroup, j, data) {
      var responseFrame;
      var href = j || a.href;
      var self = $.bind(function() {
        this.redirect(href, walkers, optgroup);
      }, this);
      if ("object" == typeof data && (data.tracking || data.image)) {
        responseFrame = $.createEl(data.tracking ? "iframe" : "img", {
          src : data.tracking || data.image
        }, {
          height : 0,
          width : 0,
          visibility : "hidden"
        });
        document.body.appendChild(responseFrame);
        setTimeout($.exceptionLogger(self), data.timeout || options.hop_timeout);
      } else {
        self();
      }
    },
    /**
     * @param {?} uri
     * @param {Object} Box
     * @param {?} v
     * @param {?} obj
     * @param {Object} opts
     * @param {?} p
     * @return {undefined}
     */
    onApiPing : function(uri, Box, v, obj, opts, p) {
      /** @type {boolean} */
      options.rewrite_original = false;
      opts = $.reformatKeys(opts || {});
      var i;
      var fn;
      var r20;
      /**
       * @param {?} prop
       * @return {?}
       */
      fn = function(prop) {
        var cache = {};
        /**
         * @param {number} data
         * @return {undefined}
         */
        var fn = function(data) {
          if ($.isArray(data)) {
            cache[data[0]] = data[1];
          } else {
            /** @type {number} */
            cache[data] = 1;
          }
        };
        return $.isArray(prop) && $.each(prop, fn), cache;
      };
      r20 = $.extend(options.plugins, opts.plugins);
      options = $.extend(options, opts);
      delete options.plugins;
      options.library_id = uri;
      /** @type {Object} */
      options.click_timeout = Box;
      if (options.time_ping) {
        this.logTime("png");
      }
      $.extend(options.norewrite, fn(v));
      $.extend(options.swap, fn(obj));
      $.extend(options.nofollow, fn(p));
      for (i in options) {
        if ("on" === i.toLowerCase().substr(0, 2)) {
          if (i.length > 2) {
            if ("function" === $.type(options[i])) {
              $.on(that, i.toLowerCase().substr(2), $.bind(options[i], window));
              delete options[i];
            }
          }
        }
      }
      this.initPlugins(r20);
      this.initLinks();
      this.initEvents();
      this.fire("libready");
    },
    /**
     * @param {Object} e
     * @return {?}
     */
    onClick : function(e) {
      e = e || window.event;
      var dot = e.ctrlKey || (e.metaKey || (e.altKey || e.shiftKey));
      var type = e.which && 1 === e.which || 0 === e.button;
      var evt = $.eventLink(e);
      if (evt && (this.isRewritable(evt) && (!dot && (type && !$.isDefaultPrevented(e))))) {
        return this.click(evt), $.preventDefault(e);
      }
    },
    /**
     * @param {Object} event
     * @return {undefined}
     */
    onContextmenu : function(event) {
      var requestString = $.eventLink(event || window.event);
      if (requestString) {
        if (this.isRewritable(requestString)) {
          this.handleRightClick(requestString, "setup");
        }
      }
    },
    /**
     * @param {string} v
     * @param {boolean} dataAndEvents
     * @return {?}
     */
    opt : function(v, dataAndEvents) {
      return void 0 !== dataAndEvents && (void 0 !== this.publicOptions()[v] && (options[v] = dataAndEvents)), options[v];
    },
    ping : function() {
      /** @type {boolean} */
      var a = false;
      return function() {
        if (!a) {
          if (!(!options.key && !options.dr_key)) {
            /** @type {boolean} */
            a = true;
            this.logTime();
            this.api("ping", null, {
              fn : $.bind(this.onApiPing, this)
            });
          }
        }
      };
    }(),
    /**
     * @param {Object} a
     * @return {?}
     */
    preprocessLink : function(a) {
      if (this.isRewritable(a)) {
        var data;
        var host = $.createA(options.api_url);
        return "/api/click" != a.pathname || (a.hostname != host.hostname && !a.hostname.match(/(^|\.)(api|cdn|apicdn)\.viglink\.com$/) || (data = $.fromQuery(a.search), void 0 !== data.out && (a.href = data.out, delete data.out, $.cache(a, "params", data)))), options.swap[a.href] && (a.href = options.swap[a.href]), options.nofollow[a.href] && (!$.hasRel(a, "nofollow") && (a.rel = (a.rel ? a.rel + " " : "") + "nofollow")), window.IPBoard && (window.IPBoard.prototype && (window.IPBoard.prototype.delegate && 
        ($.hasRel(a, "external") && (a.rel = a.rel.replace(/(^| )external( |$)/, ""), a.target = "_blank")))), a;
      }
    },
    publicOptions : function() {
      var dict = {};
      return function(arg) {
        return "object" === $.type(arg) && (dict = arg), $.extend({}, dict);
      };
    }(),
    /**
     * @param {(Object|string)} url
     * @param {Window} obj
     * @param {string} name
     * @return {undefined}
     */
    redirect : function(url, obj, name) {
      var el;
      var h;
      if ($.traits.crossWindowCommunication || obj) {
        if ($.traits.jsRedirectSetsReferrer) {
          setTimeout($.exceptionLogger(function() {
            if (obj && obj !== window.self) {
              if ($.contextIsAncestor(obj)) {
                /** @type {(Object|string)} */
                obj.location = url;
              } else {
                obj.location.replace(url);
              }
            } else {
              /** @type {(Object|string)} */
              window.location = url;
            }
          }), 0);
        } else {
          if ("_blank" === name) {
            name = $.uniqid("win_");
          }
          el = $.createA(url, name);
          /** @type {string} */
          el.rel = "norewrite";
          document.body.appendChild(el);
          el.click();
          el.parentNode.removeChild(el);
        }
      } else {
        /** @type {(Window|null)} */
        h = window.open(url, name);
        h.focus();
      }
    }
  };
  that.init();
}("undefined" == typeof vglnk_self ? "vglnk" : vglnk_self), window.vglnk = window.vglnk || {}, window.vglnk.link_affiliation_plugin = {
  /**
   * @param {number} target
   * @param {?} dataType
   * @param {Function} t
   * @return {undefined}
   */
  run : function(target, dataType, t) {
    t.opt("rewrite_original", true);
  }
}, window.vglnk = window.vglnk || {}, window.vglnk.modified_clicks_plugin = {
  /**
   * @param {number} target
   * @param {?} dataType
   * @param {Function} t
   * @return {undefined}
   */
  run : function(target, dataType, t) {
    t.opt("rewrite_modified", true);
  }
};
