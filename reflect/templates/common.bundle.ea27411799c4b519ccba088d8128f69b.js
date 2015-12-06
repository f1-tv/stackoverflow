var REFLECT = function(options) {
  return REFLECT = options.REFLECT || {}, REFLECT.define = function(name, callback) {
    if ("function" == typeof name) {
      /** @type {(Function|string)} */
      callback = name;
      /** @type {string} */
      name = "";
    }
    var pathConfig = name.split(".");
    var escaped = pathConfig.shift();
    var result = REFLECT;
    var attrs = (callback || function() {
      return{};
    }).call({
      /**
       * @param {?} dataAndEvents
       * @return {?}
       */
      overwrites : function(dataAndEvents) {
        return dataAndEvents.__overwrites__ = true, dataAndEvents;
      }
    }, options);
    for (;escaped;) {
      result = result[escaped] ? result[escaped] : result[escaped] = {};
      escaped = pathConfig.shift();
    }
    var attr;
    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        if (!attrs.__overwrites__ && (null !== result[attr] && result.hasOwnProperty(attr))) {
          if (REFLECT.log) {
            REFLECT.log("Unsafe attempt to redefine existing module: " + attr);
          }
        } else {
          result[attr] = attrs[attr];
        }
      }
    }
    return result;
  }, REFLECT.use = function(name) {
    return REFLECT.define(name);
  }, REFLECT.define("next"), REFLECT;
}(window);
define("shared/foundation", function(dataAndEvents) {
  return function() {
    var REFLECT;
    return REFLECT || dataAndEvents.REFLECT;
  };
}(this)), REFLECT.define(function(win, dataAndEvents) {
  var $ = win.REFLECT;
  var doc = win.document;
  var svg = doc.head || (doc.getElementsByTagName("head")[0] || doc.body);
  /** @type {number} */
  var ccNum = 0;
  /**
   * @param {?} pre
   * @return {?}
   */
  $.getUid = function(pre) {
    /** @type {string} */
    var id = String(++ccNum);
    return pre ? pre + id : id;
  };
  /**
   * @param {Object} obj
   * @param {string} index
   * @return {?}
   */
  $.isOwn = function(obj, index) {
    return Object.prototype.hasOwnProperty.call(obj, index);
  };
  /**
   * @param {string} obj
   * @return {?}
   */
  $.isString = function(obj) {
    return "[object String]" === Object.prototype.toString.call(obj);
  };
  /**
   * @param {Function} opt_attributes
   * @param {Function} callback
   * @return {undefined}
   */
  $.each = function(opt_attributes, callback) {
    var l = opt_attributes.length;
    /** @type {function (this:(Array.<T>|string|{length: number}), (function (this:S, T, number, Array.<T>): ?|null), S=): ?} */
    var _forEach = Array.prototype.forEach;
    if (isNaN(l)) {
      var index;
      for (index in opt_attributes) {
        if ($.isOwn(opt_attributes, index)) {
          callback(opt_attributes[index], index, opt_attributes);
        }
      }
    } else {
      if (_forEach) {
        _forEach.call(opt_attributes, callback);
      } else {
        /** @type {number} */
        var i = 0;
        for (;l > i;i++) {
          callback(opt_attributes[i], i, opt_attributes);
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
   * @param {Function} attributes
   * @return {?}
   */
  $.serializeArgs = function(attributes) {
    /** @type {Array} */
    var columns = [];
    return $.each(attributes, function(match, id) {
      if (match !== dataAndEvents) {
        columns.push(id + (null !== match ? "=" + encodeURIComponent(match) : ""));
      }
    }), columns.join("&");
  };
  /**
   * @param {string} object
   * @param {Function} opt_attributes
   * @param {boolean} opt
   * @return {?}
   */
  $.serialize = function(object, opt_attributes, opt) {
    if (opt_attributes && (-1 === object.indexOf("?") ? object += "?" : "&" !== object.charAt(object.length - 1) && (object += "&"), object += $.serializeArgs(opt_attributes)), opt) {
      var attributes = {};
      return attributes[(new Date).getTime()] = null, $.serialize(object, attributes);
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
   * @param {Function} attributes
   * @param {boolean} arg
   * @param {Object} success
   * @param {Object} fail
   * @return {?}
   */
  $.require = function(name, attributes, arg, success, fail) {
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
    return s.src = $.serialize(name, attributes, arg), s.async = true, s.charset = "UTF-8", (success || fail) && loadScript(s, load, onLoad), fail && (p = win.setTimeout(function() {
      fail();
    }, time)), svg.appendChild(s), $;
  };
}), define("shared/corefuncs", ["shared/foundation"], function(dataAndEvents) {
  return function() {
    var REFLECT;
    return REFLECT || dataAndEvents.REFLECT;
  };
}(this)), REFLECT.define("next.host.urls", function() {
  /** @type {string} */
  var result = "default";
  var ps = {
    lounge : "http://ryflection.com/embed/comments/",
    onboard : "http://ryflection.com/embed/onboard/",
    home : "https://ryflection.com/home/".replace("home/", "")
  };
  /**
   * @param {string} collection
   * @param {(number|string)} selector
   * @return {?}
   */
  var clean = function(collection, selector) {
    return/^http/.test(selector) || (selector = "http:"), selector + "//" + collection.replace(/^\s*(\w+:)?\/\//, "");
  };
  /**
   * @param {string} name
   * @param {Object} o
   * @param {boolean} id
   * @return {?}
   */
  var request = function(name, o, id) {
    var key = ps[name];
    if (!key) {
      throw new Error("Unknown app: " + name);
    }
    var object = clean(key, document.location.protocol);
    var attributes = REFLECT.extend({
      base : result
    }, o || {});
    /** @type {string} */
    var barId = id ? "#" + encodeURIComponent(JSON.stringify(id)) : "";
    return REFLECT.serialize(object, attributes) + barId;
  };
  return{
    BASE : result,
    apps : ps,
    /** @type {function (string, Object, boolean): ?} */
    get : request,
    /** @type {function (string, (number|string)): ?} */
    ensureHttpBasedProtocol : clean
  };
}), define("shared/urls", ["shared/foundation", "shared/corefuncs"], function(dataAndEvents) {
  return function() {
    var urls;
    return urls || dataAndEvents.REFLECT.next.host.urls;
  };
}(this)), function(obj, forOwn) {
  if ("object" == typeof module && "object" == typeof module.exports) {
    module.exports = obj.document ? forOwn(obj, true) : function(obj) {
      if (!obj.document) {
        throw new Error("jQuery requires a window with a document");
      }
      return forOwn(obj);
    };
  } else {
    forOwn(obj);
  }
}("undefined" != typeof window ? window : this, function(win, dataAndEvents) {
  /**
   * @param {?} exports
   * @return {?}
   */
  function isArraylike(exports) {
    var value = "length" in exports && exports.length;
    var type = jQuery.type(exports);
    return "function" === type || jQuery.isWindow(exports) ? false : 1 === exports.nodeType && value ? true : "array" === type || (0 === value || "number" == typeof value && (value > 0 && value - 1 in exports));
  }
  /**
   * @param {Object} elements
   * @param {Function} ok
   * @param {Object} value
   * @return {?}
   */
  function winnow(elements, ok, value) {
    if (jQuery.isFunction(ok)) {
      return jQuery.grep(elements, function(that, x) {
        return!!ok.call(that, x, that) !== value;
      });
    }
    if (ok.nodeType) {
      return jQuery.grep(elements, function(result) {
        return result === ok !== value;
      });
    }
    if ("string" == typeof ok) {
      if (QUnit.test(ok)) {
        return jQuery.filter(ok, elements, value);
      }
      ok = jQuery.filter(ok, elements);
    }
    return jQuery.grep(elements, function(arg) {
      return jQuery.inArray(arg, ok) >= 0 !== value;
    });
  }
  /**
   * @param {Object} cur
   * @param {string} dir
   * @return {?}
   */
  function sibling(cur, dir) {
    do {
      cur = cur[dir];
    } while (cur && 1 !== cur.nodeType);
    return cur;
  }
  /**
   * @param {string} options
   * @return {?}
   */
  function createOptions(options) {
    var buf = optionsCache[options] = {};
    return jQuery.each(options.match(core_rnotwhite) || [], function(dataAndEvents, off) {
      /** @type {boolean} */
      buf[off] = true;
    }), buf;
  }
  /**
   * @return {undefined}
   */
  function domReady() {
    if (doc.addEventListener) {
      doc.removeEventListener("DOMContentLoaded", init, false);
      win.removeEventListener("load", init, false);
    } else {
      doc.detachEvent("onreadystatechange", init);
      win.detachEvent("onload", init);
    }
  }
  /**
   * @return {undefined}
   */
  function init() {
    if (doc.addEventListener || ("load" === event.type || "complete" === doc.readyState)) {
      domReady();
      jQuery.ready();
    }
  }
  /**
   * @param {Function} QUnit
   * @param {Object} optgroup
   * @param {string} data
   * @return {?}
   */
  function dataAttr(QUnit, optgroup, data) {
    if (void 0 === data && 1 === QUnit.nodeType) {
      var name = "data-" + optgroup.replace(rreturn, "-$1").toLowerCase();
      if (data = QUnit.getAttribute(name), "string" == typeof data) {
        try {
          data = "true" === data ? true : "false" === data ? false : "null" === data ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
        } catch (e) {
        }
        jQuery.data(QUnit, optgroup, data);
      } else {
        data = void 0;
      }
    }
    return data;
  }
  /**
   * @param {Object} obj
   * @return {?}
   */
  function filter(obj) {
    var name;
    for (name in obj) {
      if (("data" !== name || !jQuery.isEmptyObject(obj[name])) && "toJSON" !== name) {
        return false;
      }
    }
    return true;
  }
  /**
   * @param {Object} elem
   * @param {string} name
   * @param {boolean} object
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  function get(elem, name, object, dataAndEvents) {
    if (jQuery.acceptData(elem)) {
      var src;
      var data;
      var internalKey = jQuery.expando;
      var isNode = elem.nodeType;
      var cache = isNode ? jQuery.cache : elem;
      var id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
      if (id && (cache[id] && (dataAndEvents || cache[id].data)) || (void 0 !== object || "string" != typeof name)) {
        return id || (id = isNode ? elem[internalKey] = core_deletedIds.pop() || jQuery.guid++ : internalKey), cache[id] || (cache[id] = isNode ? {} : {
          toJSON : jQuery.noop
        }), ("object" == typeof name || "function" == typeof name) && (dataAndEvents ? cache[id] = jQuery.extend(cache[id], name) : cache[id].data = jQuery.extend(cache[id].data, name)), data = cache[id], dataAndEvents || (data.data || (data.data = {}), data = data.data), void 0 !== object && (data[jQuery.camelCase(name)] = object), "string" == typeof name ? (src = data[name], null == src && (src = data[jQuery.camelCase(name)])) : src = data, src;
      }
    }
  }
  /**
   * @param {Object} elem
   * @param {string} val
   * @param {boolean} skipped
   * @return {undefined}
   */
  function cb(elem, val, skipped) {
    if (jQuery.acceptData(elem)) {
      var cache;
      var i;
      var isNode = elem.nodeType;
      var response = isNode ? jQuery.cache : elem;
      var id = isNode ? elem[jQuery.expando] : jQuery.expando;
      if (response[id]) {
        if (val && (cache = skipped ? response[id] : response[id].data)) {
          if (jQuery.isArray(val)) {
            val = val.concat(jQuery.map(val, jQuery.camelCase));
          } else {
            if (val in cache) {
              /** @type {Array} */
              val = [val];
            } else {
              val = jQuery.camelCase(val);
              val = val in cache ? [val] : val.split(" ");
            }
          }
          i = val.length;
          for (;i--;) {
            delete cache[val[i]];
          }
          if (skipped ? !filter(cache) : !jQuery.isEmptyObject(cache)) {
            return;
          }
        }
        if (skipped || (delete response[id].data, filter(response[id]))) {
          if (isNode) {
            jQuery.cleanData([elem], true);
          } else {
            if (support.deleteExpando || response != response.window) {
              delete response[id];
            } else {
              /** @type {null} */
              response[id] = null;
            }
          }
        }
      }
    }
  }
  /**
   * @return {?}
   */
  function returnTrue() {
    return true;
  }
  /**
   * @return {?}
   */
  function returnFalse() {
    return false;
  }
  /**
   * @return {?}
   */
  function safeActiveElement() {
    try {
      return doc.activeElement;
    } catch (a) {
    }
  }
  /**
   * @param {(Document|DocumentFragment)} a
   * @return {?}
   */
  function t(a) {
    /** @type {Array.<string>} */
    var braceStack = uHostName.split("|");
    var t = a.createDocumentFragment();
    if (t.createElement) {
      for (;braceStack.length;) {
        t.createElement(braceStack.pop());
      }
    }
    return t;
  }
  /**
   * @param {Node} context
   * @param {string} tag
   * @return {?}
   */
  function getAll(context, tag) {
    var opt_nodes;
    var node;
    /** @type {number} */
    var i = 0;
    var ret = typeof context.getElementsByTagName !== text ? context.getElementsByTagName(tag || "*") : typeof context.querySelectorAll !== text ? context.querySelectorAll(tag || "*") : void 0;
    if (!ret) {
      /** @type {Array} */
      ret = [];
      opt_nodes = context.childNodes || context;
      for (;null != (node = opt_nodes[i]);i++) {
        if (!tag || jQuery.nodeName(node, tag)) {
          ret.push(node);
        } else {
          jQuery.merge(ret, getAll(node, tag));
        }
      }
    }
    return void 0 === tag || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
  }
  /**
   * @param {Element} elem
   * @return {undefined}
   */
  function callback(elem) {
    if (manipulation_rcheckableType.test(elem.type)) {
      elem.defaultChecked = elem.checked;
    }
  }
  /**
   * @param {Node} elem
   * @param {Object} content
   * @return {?}
   */
  function manipulationTarget(elem, content) {
    return jQuery.nodeName(elem, "table") && jQuery.nodeName(11 !== content.nodeType ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
  }
  /**
   * @param {Object} elem
   * @return {?}
   */
  function restoreScript(elem) {
    return elem.type = (null !== jQuery.find.attr(elem, "type")) + "/" + elem.type, elem;
  }
  /**
   * @param {Object} elem
   * @return {?}
   */
  function fn(elem) {
    /** @type {(Array.<string>|null)} */
    var match = rscriptTypeMasked.exec(elem.type);
    return match ? elem.type = match[1] : elem.removeAttribute("type"), elem;
  }
  /**
   * @param {(Array|NodeList)} elems
   * @param {Array} refElements
   * @return {undefined}
   */
  function setGlobalEval(elems, refElements) {
    var elem;
    /** @type {number} */
    var i = 0;
    for (;null != (elem = elems[i]);i++) {
      jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"));
    }
  }
  /**
   * @param {Object} src
   * @param {Object} exports
   * @return {undefined}
   */
  function cloneCopyEvent(src, exports) {
    if (1 === exports.nodeType && jQuery.hasData(src)) {
      var type;
      var i;
      var ilen;
      var oldData = jQuery._data(src);
      var curData = jQuery._data(exports, oldData);
      var events = oldData.events;
      if (events) {
        delete curData.handle;
        curData.events = {};
        for (type in events) {
          /** @type {number} */
          i = 0;
          ilen = events[type].length;
          for (;ilen > i;i++) {
            jQuery.event.add(exports, type, events[type][i]);
          }
        }
      }
      if (curData.data) {
        curData.data = jQuery.extend({}, curData.data);
      }
    }
  }
  /**
   * @param {Element} src
   * @param {Object} dest
   * @return {undefined}
   */
  function cloneFixAttributes(src, dest) {
    var name;
    var type;
    var pdataCur;
    if (1 === dest.nodeType) {
      if (name = dest.nodeName.toLowerCase(), !support.noCloneEvent && dest[jQuery.expando]) {
        pdataCur = jQuery._data(dest);
        for (type in pdataCur.events) {
          jQuery.removeEvent(dest, type, pdataCur.handle);
        }
        dest.removeAttribute(jQuery.expando);
      }
      if ("script" === name && dest.text !== src.text) {
        restoreScript(dest).text = src.text;
        fn(dest);
      } else {
        if ("object" === name) {
          if (dest.parentNode) {
            dest.outerHTML = src.outerHTML;
          }
          if (support.html5Clone) {
            if (src.innerHTML) {
              if (!jQuery.trim(dest.innerHTML)) {
                dest.innerHTML = src.innerHTML;
              }
            }
          }
        } else {
          if ("input" === name && manipulation_rcheckableType.test(src.type)) {
            dest.defaultChecked = dest.checked = src.checked;
            if (dest.value !== src.value) {
              dest.value = src.value;
            }
          } else {
            if ("option" === name) {
              dest.defaultSelected = dest.selected = src.defaultSelected;
            } else {
              if ("input" === name || "textarea" === name) {
                dest.defaultValue = src.defaultValue;
              }
            }
          }
        }
      }
    }
  }
  /**
   * @param {?} name
   * @param {Document} doc
   * @return {?}
   */
  function actualDisplay(name, doc) {
    var result;
    var elem = jQuery(doc.createElement(name)).appendTo(doc.body);
    var f = win.getDefaultComputedStyle && (result = win.getDefaultComputedStyle(elem[0])) ? result.display : jQuery.css(elem[0], "display");
    return elem.detach(), f;
  }
  /**
   * @param {?} nodeName
   * @return {?}
   */
  function defaultDisplay(nodeName) {
    var d = doc;
    var display = elemdisplay[nodeName];
    return display || (display = actualDisplay(nodeName, d), "none" !== display && display || (iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(d.documentElement), d = (iframe[0].contentWindow || iframe[0].contentDocument).document, d.write(), d.close(), display = actualDisplay(nodeName, d), iframe.detach()), elemdisplay[nodeName] = display), display;
  }
  /**
   * @param {?} require
   * @param {Function} hookFn
   * @return {?}
   */
  function addGetHookIf(require, hookFn) {
    return{
      /**
       * @return {?}
       */
      get : function() {
        var Block = require();
        if (null != Block) {
          return Block ? void delete this.get : (this.get = hookFn).apply(this, arguments);
        }
      }
    };
  }
  /**
   * @param {Object} style
   * @param {string} name
   * @return {?}
   */
  function vendorPropName(style, name) {
    if (name in style) {
      return name;
    }
    var capName = name.charAt(0).toUpperCase() + name.slice(1);
    /** @type {string} */
    var origName = name;
    /** @type {number} */
    var i = cssPrefixes.length;
    for (;i--;) {
      if (name = cssPrefixes[i] + capName, name in style) {
        return name;
      }
    }
    return origName;
  }
  /**
   * @param {Array} elements
   * @param {boolean} show
   * @return {?}
   */
  function showHide(elements, show) {
    var display;
    var elem;
    var hidden;
    /** @type {Array} */
    var values = [];
    /** @type {number} */
    var index = 0;
    var length = elements.length;
    for (;length > index;index++) {
      elem = elements[index];
      if (elem.style) {
        values[index] = jQuery._data(elem, "olddisplay");
        display = elem.style.display;
        if (show) {
          if (!values[index]) {
            if (!("none" !== display)) {
              /** @type {string} */
              elem.style.display = "";
            }
          }
          if ("" === elem.style.display) {
            if (ok(elem)) {
              values[index] = jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
            }
          }
        } else {
          hidden = ok(elem);
          if (display && "none" !== display || !hidden) {
            jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
          }
        }
      }
    }
    /** @type {number} */
    index = 0;
    for (;length > index;index++) {
      elem = elements[index];
      if (elem.style) {
        if (!(show && ("none" !== elem.style.display && "" !== elem.style.display))) {
          elem.style.display = show ? values[index] || "" : "none";
        }
      }
    }
    return elements;
  }
  /**
   * @param {string} val
   * @param {Object} recurring
   * @param {Function} keepData
   * @return {?}
   */
  function setPositiveNumber(val, recurring, keepData) {
    /** @type {(Array.<string>|null)} */
    var parts = rrelNum.exec(recurring);
    return parts ? Math.max(0, parts[1] - (keepData || 0)) + (parts[2] || "px") : recurring;
  }
  /**
   * @param {string} elem
   * @param {string} prop
   * @param {string} extra
   * @param {boolean} isBorderBox
   * @param {?} styles
   * @return {?}
   */
  function augmentWidthOrHeight(elem, prop, extra, isBorderBox, styles) {
    /** @type {number} */
    var i = extra === (isBorderBox ? "border" : "content") ? 4 : "width" === prop ? 1 : 0;
    /** @type {number} */
    var val = 0;
    for (;4 > i;i += 2) {
      if ("margin" === extra) {
        val += jQuery.css(elem, extra + cssExpand[i], true, styles);
      }
      if (isBorderBox) {
        if ("content" === extra) {
          val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
        }
        if ("margin" !== extra) {
          val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
        }
      } else {
        val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
        if ("padding" !== extra) {
          val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
        }
      }
    }
    return val;
  }
  /**
   * @param {Object} elem
   * @param {string} name
   * @param {string} extra
   * @return {?}
   */
  function getWidthOrHeight(elem, name, extra) {
    /** @type {boolean} */
    var valueIsBorderBox = true;
    var val = "width" === name ? elem.offsetWidth : elem.offsetHeight;
    var styles = getStyles(elem);
    var isBorderBox = support.boxSizing && "border-box" === jQuery.css(elem, "boxSizing", false, styles);
    if (0 >= val || null == val) {
      if (val = curCSS(elem, name, styles), (0 > val || null == val) && (val = elem.style[name]), rnumnonpx.test(val)) {
        return val;
      }
      valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
      /** @type {number} */
      val = parseFloat(val) || 0;
    }
    return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
  }
  /**
   * @param {string} selector
   * @param {string} context
   * @param {string} prop
   * @param {string} end
   * @param {string} easing
   * @return {?}
   */
  function Tween(selector, context, prop, end, easing) {
    return new Tween.prototype.init(selector, context, prop, end, easing);
  }
  /**
   * @return {?}
   */
  function createFxNow() {
    return setTimeout(function() {
      fxNow = void 0;
    }), fxNow = jQuery.now();
  }
  /**
   * @param {number} type
   * @param {boolean} includeWidth
   * @return {?}
   */
  function genFx(type, includeWidth) {
    var which;
    var attrs = {
      height : type
    };
    /** @type {number} */
    var i = 0;
    /** @type {number} */
    includeWidth = includeWidth ? 1 : 0;
    for (;4 > i;i += 2 - includeWidth) {
      which = cssExpand[i];
      attrs["margin" + which] = attrs["padding" + which] = type;
    }
    return includeWidth && (attrs.opacity = attrs.width = type), attrs;
  }
  /**
   * @param {?} b
   * @param {Error} name
   * @param {string} arg
   * @return {?}
   */
  function extend(b, name, arg) {
    var result;
    var q = (cache[name] || []).concat(cache["*"]);
    /** @type {number} */
    var i = 0;
    var l = q.length;
    for (;l > i;i++) {
      if (result = q[i].call(arg, name, b)) {
        return result;
      }
    }
  }
  /**
   * @param {Function} elem
   * @param {Object} props
   * @param {Object} opts
   * @return {undefined}
   */
  function defaultPrefilter(elem, props, opts) {
    var prop;
    var value;
    var thisp;
    var tween;
    var hooks;
    var oldfire;
    var oldDisplay;
    var type;
    var settings = this;
    var orig = {};
    var style = elem.style;
    var hidden = elem.nodeType && ok(elem);
    var dataShow = jQuery._data(elem, "fxshow");
    if (!opts.queue) {
      hooks = jQuery._queueHooks(elem, "fx");
      if (null == hooks.unqueued) {
        /** @type {number} */
        hooks.unqueued = 0;
        /** @type {function (): undefined} */
        oldfire = hooks.empty.fire;
        /**
         * @return {undefined}
         */
        hooks.empty.fire = function() {
          if (!hooks.unqueued) {
            oldfire();
          }
        };
      }
      hooks.unqueued++;
      settings.always(function() {
        settings.always(function() {
          hooks.unqueued--;
          if (!jQuery.queue(elem, "fx").length) {
            hooks.empty.fire();
          }
        });
      });
    }
    if (1 === elem.nodeType) {
      if ("height" in props || "width" in props) {
        /** @type {Array} */
        opts.overflow = [style.overflow, style.overflowX, style.overflowY];
        oldDisplay = jQuery.css(elem, "display");
        type = "none" === oldDisplay ? jQuery._data(elem, "olddisplay") || defaultDisplay(elem.nodeName) : oldDisplay;
        if ("inline" === type) {
          if ("none" === jQuery.css(elem, "float")) {
            if (support.inlineBlockNeedsLayout && "inline" !== defaultDisplay(elem.nodeName)) {
              /** @type {number} */
              style.zoom = 1;
            } else {
              /** @type {string} */
              style.display = "inline-block";
            }
          }
        }
      }
    }
    if (opts.overflow) {
      /** @type {string} */
      style.overflow = "hidden";
      if (!support.shrinkWrapBlocks()) {
        settings.always(function() {
          style.overflow = opts.overflow[0];
          style.overflowX = opts.overflow[1];
          style.overflowY = opts.overflow[2];
        });
      }
    }
    for (prop in props) {
      if (value = props[prop], rplusequals.exec(value)) {
        if (delete props[prop], thisp = thisp || "toggle" === value, value === (hidden ? "hide" : "show")) {
          if ("show" !== value || (!dataShow || void 0 === dataShow[prop])) {
            continue;
          }
          /** @type {boolean} */
          hidden = true;
        }
        orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
      } else {
        oldDisplay = void 0;
      }
    }
    if (jQuery.isEmptyObject(orig)) {
      if ("inline" === ("none" === oldDisplay ? defaultDisplay(elem.nodeName) : oldDisplay)) {
        style.display = oldDisplay;
      }
    } else {
      if (dataShow) {
        if ("hidden" in dataShow) {
          hidden = dataShow.hidden;
        }
      } else {
        dataShow = jQuery._data(elem, "fxshow", {});
      }
      if (thisp) {
        /** @type {boolean} */
        dataShow.hidden = !hidden;
      }
      if (hidden) {
        jQuery(elem).show();
      } else {
        settings.done(function() {
          jQuery(elem).hide();
        });
      }
      settings.done(function() {
        var optgroup;
        jQuery._removeData(elem, "fxshow");
        for (optgroup in orig) {
          jQuery.style(elem, optgroup, orig[optgroup]);
        }
      });
      for (prop in orig) {
        tween = extend(hidden ? dataShow[prop] : 0, prop, settings);
        if (!(prop in dataShow)) {
          dataShow[prop] = tween.start;
          if (hidden) {
            tween.end = tween.start;
            /** @type {number} */
            tween.start = "width" === prop || "height" === prop ? 1 : 0;
          }
        }
      }
    }
  }
  /**
   * @param {Object} obj
   * @param {Object} members
   * @return {undefined}
   */
  function propFilter(obj, members) {
    var key;
    var name;
    var member;
    var value;
    var hooks;
    for (key in obj) {
      if (name = jQuery.camelCase(key), member = members[name], value = obj[key], jQuery.isArray(value) && (member = value[1], value = obj[key] = value[0]), key !== name && (obj[name] = value, delete obj[key]), hooks = jQuery.cssHooks[name], hooks && "expand" in hooks) {
        value = hooks.expand(value);
        delete obj[name];
        for (key in value) {
          if (!(key in obj)) {
            obj[key] = value[key];
            members[key] = member;
          }
        }
      } else {
        members[name] = member;
      }
    }
  }
  /**
   * @param {string} elem
   * @param {?} options
   * @param {Object} opts
   * @return {?}
   */
  function Animation(elem, options, opts) {
    var result;
    var e;
    /** @type {number} */
    var index = 0;
    /** @type {number} */
    var length = animationPrefilters.length;
    var deferred = jQuery.Deferred().always(function() {
      delete tick.elem;
    });
    /**
     * @return {?}
     */
    var tick = function() {
      if (e) {
        return false;
      }
      var currentTime = fxNow || createFxNow();
      /** @type {number} */
      var remaining = Math.max(0, animation.startTime + animation.duration - currentTime);
      /** @type {number} */
      var temp = remaining / animation.duration || 0;
      /** @type {number} */
      var percent = 1 - temp;
      /** @type {number} */
      var index = 0;
      var startOffset = animation.tweens.length;
      for (;startOffset > index;index++) {
        animation.tweens[index].run(percent);
      }
      return deferred.notifyWith(elem, [animation, percent, remaining]), 1 > percent && startOffset ? remaining : (deferred.resolveWith(elem, [animation]), false);
    };
    var animation = deferred.promise({
      elem : elem,
      props : jQuery.extend({}, options),
      opts : jQuery.extend(true, {
        specialEasing : {}
      }, opts),
      originalProperties : options,
      originalOptions : opts,
      startTime : fxNow || createFxNow(),
      duration : opts.duration,
      tweens : [],
      /**
       * @param {string} prop
       * @param {string} end
       * @return {?}
       */
      createTween : function(prop, end) {
        var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
        return animation.tweens.push(tween), tween;
      },
      /**
       * @param {boolean} gotoEnd
       * @return {?}
       */
      stop : function(gotoEnd) {
        /** @type {number} */
        var index = 0;
        var length = gotoEnd ? animation.tweens.length : 0;
        if (e) {
          return this;
        }
        /** @type {boolean} */
        e = true;
        for (;length > index;index++) {
          animation.tweens[index].run(1);
        }
        return gotoEnd ? deferred.resolveWith(elem, [animation, gotoEnd]) : deferred.rejectWith(elem, [animation, gotoEnd]), this;
      }
    });
    var props = animation.props;
    propFilter(props, animation.opts.specialEasing);
    for (;length > index;index++) {
      if (result = animationPrefilters[index].call(animation, elem, props, animation.opts)) {
        return result;
      }
    }
    return jQuery.map(props, extend, animation), jQuery.isFunction(animation.opts.start) && animation.opts.start.call(elem, animation), jQuery.fx.timer(jQuery.extend(tick, {
      elem : elem,
      anim : animation,
      queue : animation.opts.queue
    })), animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
  }
  /**
   * @param {Object} structure
   * @return {?}
   */
  function addToPrefiltersOrTransports(structure) {
    return function(v, method) {
      if ("string" != typeof v) {
        /** @type {Object} */
        method = v;
        /** @type {string} */
        v = "*";
      }
      var node;
      /** @type {number} */
      var i = 0;
      var elem = v.toLowerCase().match(core_rnotwhite) || [];
      if (jQuery.isFunction(method)) {
        for (;node = elem[i++];) {
          if ("+" === node.charAt(0)) {
            node = node.slice(1) || "*";
            (structure[node] = structure[node] || []).unshift(method);
          } else {
            (structure[node] = structure[node] || []).push(method);
          }
        }
      }
    };
  }
  /**
   * @param {?} structure
   * @param {?} options
   * @param {Object} originalOptions
   * @param {?} jqXHR
   * @return {?}
   */
  function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
    /**
     * @param {string} key
     * @return {?}
     */
    function inspect(key) {
      var oldName;
      return old[key] = true, jQuery.each(structure[key] || [], function(dataAndEvents, prefilterOrFactory) {
        var name = prefilterOrFactory(options, originalOptions, jqXHR);
        return "string" != typeof name || (seekingTransport || old[name]) ? seekingTransport ? !(oldName = name) : void 0 : (options.dataTypes.unshift(name), inspect(name), false);
      }), oldName;
    }
    var old = {};
    /** @type {boolean} */
    var seekingTransport = structure === transports;
    return inspect(options.dataTypes[0]) || !old["*"] && inspect("*");
  }
  /**
   * @param {(Object|string)} target
   * @param {Object} src
   * @return {?}
   */
  function ajaxExtend(target, src) {
    var deep;
    var key;
    var flatOptions = jQuery.ajaxSettings.flatOptions || {};
    for (key in src) {
      if (void 0 !== src[key]) {
        (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
      }
    }
    return deep && jQuery.extend(true, target, deep), target;
  }
  /**
   * @param {Object} s
   * @param {XMLHttpRequest} jqXHR
   * @param {Object} responses
   * @return {?}
   */
  function ajaxHandleResponses(s, jqXHR, responses) {
    var firstDataType;
    var ct;
    var finalDataType;
    var type;
    var contents = s.contents;
    var dataTypes = s.dataTypes;
    for (;"*" === dataTypes[0];) {
      dataTypes.shift();
      if (void 0 === ct) {
        ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
      }
    }
    if (ct) {
      for (type in contents) {
        if (contents[type] && contents[type].test(ct)) {
          dataTypes.unshift(type);
          break;
        }
      }
    }
    if (dataTypes[0] in responses) {
      finalDataType = dataTypes[0];
    } else {
      for (type in responses) {
        if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
          /** @type {string} */
          finalDataType = type;
          break;
        }
        if (!firstDataType) {
          /** @type {string} */
          firstDataType = type;
        }
      }
      /** @type {(string|undefined)} */
      finalDataType = finalDataType || firstDataType;
    }
    return finalDataType ? (finalDataType !== dataTypes[0] && dataTypes.unshift(finalDataType), responses[finalDataType]) : void 0;
  }
  /**
   * @param {Object} s
   * @param {Object} response
   * @param {?} jqXHR
   * @param {Object} isSuccess
   * @return {?}
   */
  function ajaxConvert(s, response, jqXHR, isSuccess) {
    var conv2;
    var current;
    var conv;
    var tmp;
    var prev;
    var converters = {};
    var dataTypes = s.dataTypes.slice();
    if (dataTypes[1]) {
      for (conv in s.converters) {
        converters[conv.toLowerCase()] = s.converters[conv];
      }
    }
    current = dataTypes.shift();
    for (;current;) {
      if (s.responseFields[current] && (jqXHR[s.responseFields[current]] = response), !prev && (isSuccess && (s.dataFilter && (response = s.dataFilter(response, s.dataType)))), prev = current, current = dataTypes.shift()) {
        if ("*" === current) {
          current = prev;
        } else {
          if ("*" !== prev && prev !== current) {
            if (conv = converters[prev + " " + current] || converters["* " + current], !conv) {
              for (conv2 in converters) {
                if (tmp = conv2.split(" "), tmp[1] === current && (conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]])) {
                  if (conv === true) {
                    conv = converters[conv2];
                  } else {
                    if (converters[conv2] !== true) {
                      /** @type {string} */
                      current = tmp[0];
                      dataTypes.unshift(tmp[1]);
                    }
                  }
                  break;
                }
              }
            }
            if (conv !== true) {
              if (conv && s["throws"]) {
                response = conv(response);
              } else {
                try {
                  response = conv(response);
                } catch (e) {
                  return{
                    state : "parsererror",
                    error : conv ? e : "No conversion from " + prev + " to " + current
                  };
                }
              }
            }
          }
        }
      }
    }
    return{
      state : "success",
      data : response
    };
  }
  /**
   * @param {string} prefix
   * @param {Function} exports
   * @param {boolean} traditional
   * @param {Function} add
   * @return {undefined}
   */
  function buildParams(prefix, exports, traditional, add) {
    var name;
    if (jQuery.isArray(exports)) {
      jQuery.each(exports, function(i, v) {
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v);
        } else {
          buildParams(prefix + "[" + ("object" == typeof v ? i : "") + "]", v, traditional, add);
        }
      });
    } else {
      if (traditional || "object" !== jQuery.type(exports)) {
        add(prefix, exports);
      } else {
        for (name in exports) {
          buildParams(prefix + "[" + name + "]", exports[name], traditional, add);
        }
      }
    }
  }
  /**
   * @return {?}
   */
  function createStandardXHR() {
    try {
      return new win.XMLHttpRequest;
    } catch (b) {
    }
  }
  /**
   * @return {?}
   */
  function createActiveXHR() {
    try {
      return new win.ActiveXObject("Microsoft.XMLHTTP");
    } catch (b) {
    }
  }
  /**
   * @param {Object} elem
   * @return {?}
   */
  function getWindow(elem) {
    return jQuery.isWindow(elem) ? elem : 9 === elem.nodeType ? elem.defaultView || elem.parentWindow : false;
  }
  /** @type {Array} */
  var core_deletedIds = [];
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var core_slice = core_deletedIds.slice;
  /** @type {function (this:*, ...[*]): Array} */
  var core_concat = core_deletedIds.concat;
  /** @type {function (this:(Array.<T>|{length: number}), ...[T]): number} */
  var core_push = core_deletedIds.push;
  /** @type {function (this:(Array.<T>|string|{length: number}), T, number=): number} */
  var core_indexOf = core_deletedIds.indexOf;
  var _ = {};
  /** @type {function (this:*): string} */
  var objectToString = _.toString;
  /** @type {function (this:Object, *): boolean} */
  var core_hasOwn = _.hasOwnProperty;
  var support = {};
  /** @type {string} */
  var core_version = "1.11.3";
  /**
   * @param {string} selector
   * @param {string} context
   * @return {?}
   */
  var jQuery = function(selector, context) {
    return new jQuery.fn.init(selector, context);
  };
  /** @type {RegExp} */
  var badChars = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  /** @type {RegExp} */
  var rmsPrefix = /^-ms-/;
  /** @type {RegExp} */
  var emptyParagraphRegexp = /-([\da-z])/gi;
  /**
   * @param {?} all
   * @param {string} letter
   * @return {?}
   */
  var fcamelCase = function(all, letter) {
    return letter.toUpperCase();
  };
  jQuery.fn = jQuery.prototype = {
    jquery : core_version,
    /** @type {function (string, string): ?} */
    constructor : jQuery,
    selector : "",
    length : 0,
    /**
     * @return {?}
     */
    toArray : function() {
      return core_slice.call(this);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return null != name ? 0 > name ? this[name + this.length] : this[name] : core_slice.call(this);
    },
    /**
     * @param {Array} elems
     * @return {?}
     */
    pushStack : function(elems) {
      var ret = jQuery.merge(this.constructor(), elems);
      return ret.prevObject = this, ret.context = this.context, ret;
    },
    /**
     * @param {Function} opt_attributes
     * @param {Function} args
     * @return {?}
     */
    each : function(opt_attributes, args) {
      return jQuery.each(this, opt_attributes, args);
    },
    /**
     * @param {Function} callback
     * @return {?}
     */
    map : function(callback) {
      return this.pushStack(jQuery.map(this, function(el, node) {
        return callback.call(el, node, el);
      }));
    },
    /**
     * @return {?}
     */
    slice : function() {
      return this.pushStack(core_slice.apply(this, arguments));
    },
    /**
     * @return {?}
     */
    first : function() {
      return this.eq(0);
    },
    /**
     * @return {?}
     */
    last : function() {
      return this.eq(-1);
    },
    /**
     * @param {number} i
     * @return {?}
     */
    eq : function(i) {
      var len = this.length;
      var n = +i + (0 > i ? len : 0);
      return this.pushStack(n >= 0 && len > n ? [this[n]] : []);
    },
    /**
     * @return {?}
     */
    end : function() {
      return this.prevObject || this.constructor(null);
    },
    /** @type {function (this:(Array.<T>|{length: number}), ...[T]): number} */
    push : core_push,
    /** @type {function (this:(Array.<T>|{length: number}), function (T, T): number=): ?} */
    sort : core_deletedIds.sort,
    /** @type {function (this:(Array.<T>|{length: number}), *=, *=, ...[T]): Array.<T>} */
    splice : core_deletedIds.splice
  };
  /** @type {function (): ?} */
  jQuery.extend = jQuery.fn.extend = function() {
    var src;
    var copyIsArray;
    var copy;
    var name;
    var options;
    var clone;
    var target = arguments[0] || {};
    /** @type {number} */
    var index = 1;
    /** @type {number} */
    var length = arguments.length;
    /** @type {boolean} */
    var deep = false;
    if ("boolean" == typeof target) {
      /** @type {boolean} */
      deep = target;
      target = arguments[index] || {};
      index++;
    }
    if (!("object" == typeof target)) {
      if (!jQuery.isFunction(target)) {
        target = {};
      }
    }
    if (index === length) {
      target = this;
      index--;
    }
    for (;length > index;index++) {
      if (null != (options = arguments[index])) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (target !== copy) {
            if (deep && (copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy))))) {
              if (copyIsArray) {
                /** @type {boolean} */
                copyIsArray = false;
                clone = src && jQuery.isArray(src) ? src : [];
              } else {
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }
              target[name] = jQuery.extend(deep, clone, copy);
            } else {
              if (void 0 !== copy) {
                target[name] = copy;
              }
            }
          }
        }
      }
    }
    return target;
  };
  jQuery.extend({
    expando : "jQuery" + (core_version + Math.random()).replace(/\D/g, ""),
    isReady : true,
    /**
     * @param {Function} a
     * @return {?}
     */
    error : function(a) {
      throw new Error(a);
    },
    /**
     * @return {undefined}
     */
    noop : function() {
    },
    /**
     * @param {Function} config
     * @return {?}
     */
    isFunction : function(config) {
      return "function" === jQuery.type(config);
    },
    /** @type {function (*): boolean} */
    isArray : Array.isArray || function(ok) {
      return "array" === jQuery.type(ok);
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    isWindow : function(obj) {
      return null != obj && obj == obj.window;
    },
    /**
     * @param {string} val
     * @return {?}
     */
    isNumeric : function(val) {
      return!jQuery.isArray(val) && val - parseFloat(val) + 1 >= 0;
    },
    /**
     * @param {?} obj
     * @return {?}
     */
    isEmptyObject : function(obj) {
      var prop;
      for (prop in obj) {
        return false;
      }
      return true;
    },
    /**
     * @param {Function} exports
     * @return {?}
     */
    isPlainObject : function(exports) {
      var key;
      if (!exports || ("object" !== jQuery.type(exports) || (exports.nodeType || jQuery.isWindow(exports)))) {
        return false;
      }
      try {
        if (exports.constructor && (!core_hasOwn.call(exports, "constructor") && !core_hasOwn.call(exports.constructor.prototype, "isPrototypeOf"))) {
          return false;
        }
      } catch (c) {
        return false;
      }
      if (support.ownLast) {
        for (key in exports) {
          return core_hasOwn.call(exports, key);
        }
      }
      for (key in exports) {
      }
      return void 0 === key || core_hasOwn.call(exports, key);
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    type : function(a) {
      return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? _[objectToString.call(a)] || "object" : typeof a;
    },
    /**
     * @param {string} data
     * @return {undefined}
     */
    globalEval : function(data) {
      if (data) {
        if (jQuery.trim(data)) {
          (win.execScript || function(expr) {
            win.eval.call(win, expr);
          })(data);
        }
      }
    },
    /**
     * @param {string} string
     * @return {?}
     */
    camelCase : function(string) {
      return string.replace(rmsPrefix, "ms-").replace(emptyParagraphRegexp, fcamelCase);
    },
    /**
     * @param {Node} elem
     * @param {string} name
     * @return {?}
     */
    nodeName : function(elem, name) {
      return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    },
    /**
     * @param {Function} opt_attributes
     * @param {Function} fn
     * @param {(Error|string)} args
     * @return {?}
     */
    each : function(opt_attributes, fn, args) {
      var value;
      /** @type {number} */
      var i = 0;
      var l = opt_attributes.length;
      var isArray = isArraylike(opt_attributes);
      if (args) {
        if (isArray) {
          for (;l > i && (value = fn.apply(opt_attributes[i], args), value !== false);i++) {
          }
        } else {
          for (i in opt_attributes) {
            if (value = fn.apply(opt_attributes[i], args), value === false) {
              break;
            }
          }
        }
      } else {
        if (isArray) {
          for (;l > i && (value = fn.call(opt_attributes[i], i, opt_attributes[i]), value !== false);i++) {
          }
        } else {
          for (i in opt_attributes) {
            if (value = fn.call(opt_attributes[i], i, opt_attributes[i]), value === false) {
              break;
            }
          }
        }
      }
      return opt_attributes;
    },
    /**
     * @param {(number|string)} text
     * @return {?}
     */
    trim : function(text) {
      return null == text ? "" : (text + "").replace(badChars, "");
    },
    /**
     * @param {?} arr
     * @param {Array} results
     * @return {?}
     */
    makeArray : function(arr, results) {
      var ret = results || [];
      return null != arr && (isArraylike(Object(arr)) ? jQuery.merge(ret, "string" == typeof arr ? [arr] : arr) : core_push.call(ret, arr)), ret;
    },
    /**
     * @param {?} elem
     * @param {Array} arr
     * @param {number} i
     * @return {?}
     */
    inArray : function(elem, arr, i) {
      var len;
      if (arr) {
        if (core_indexOf) {
          return core_indexOf.call(arr, elem, i);
        }
        len = arr.length;
        i = i ? 0 > i ? Math.max(0, len + i) : i : 0;
        for (;len > i;i++) {
          if (i in arr && arr[i] === elem) {
            return i;
          }
        }
      }
      return-1;
    },
    /**
     * @param {(Function|string)} first
     * @param {?} second
     * @return {?}
     */
    merge : function(first, second) {
      /** @type {number} */
      var jlen = +second.length;
      /** @type {number} */
      var j = 0;
      var i = first.length;
      for (;jlen > j;) {
        first[i++] = second[j++];
      }
      if (jlen !== jlen) {
        for (;void 0 !== second[j];) {
          first[i++] = second[j++];
        }
      }
      return first.length = i, first;
    },
    /**
     * @param {Array} elems
     * @param {Function} callback
     * @param {?} inv
     * @return {?}
     */
    grep : function(elems, callback, inv) {
      var val;
      /** @type {Array} */
      var ret = [];
      /** @type {number} */
      var i = 0;
      var l = elems.length;
      /** @type {boolean} */
      var skip = !inv;
      for (;l > i;i++) {
        /** @type {boolean} */
        val = !callback(elems[i], i);
        if (val !== skip) {
          ret.push(elems[i]);
        }
      }
      return ret;
    },
    /**
     * @param {Object} elems
     * @param {Function} callback
     * @param {Function} arg
     * @return {?}
     */
    map : function(elems, callback, arg) {
      var value;
      /** @type {number} */
      var i = 0;
      var l = elems.length;
      var isArray = isArraylike(elems);
      /** @type {Array} */
      var args = [];
      if (isArray) {
        for (;l > i;i++) {
          value = callback(elems[i], i, arg);
          if (null != value) {
            args.push(value);
          }
        }
      } else {
        for (i in elems) {
          value = callback(elems[i], i, arg);
          if (null != value) {
            args.push(value);
          }
        }
      }
      return core_concat.apply([], args);
    },
    guid : 1,
    /**
     * @param {Object} fn
     * @param {Object} context
     * @return {?}
     */
    proxy : function(fn, context) {
      var args;
      var proxy;
      var tmp;
      return "string" == typeof context && (tmp = fn[context], context = fn, fn = tmp), jQuery.isFunction(fn) ? (args = core_slice.call(arguments, 2), proxy = function() {
        return fn.apply(context || this, args.concat(core_slice.call(arguments)));
      }, proxy.guid = fn.guid = fn.guid || jQuery.guid++, proxy) : void 0;
    },
    /**
     * @return {?}
     */
    now : function() {
      return+new Date;
    },
    support : support
  });
  jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(dataAndEvents, m3) {
    _["[object " + m3 + "]"] = m3.toLowerCase();
  });
  var Sizzle = function(win) {
    /**
     * @param {string} selector
     * @param {Node} context
     * @param {Array} recurring
     * @param {Array} seed
     * @return {?}
     */
    function Sizzle(selector, context, recurring, seed) {
      var match;
      var elem;
      var m;
      var type;
      var i;
      var groups;
      var old;
      var nid;
      var newContext;
      var newSelector;
      if ((context ? context.ownerDocument || context : preferredDoc) !== doc && setDocument(context), context = context || doc, recurring = recurring || [], type = context.nodeType, "string" != typeof selector || (!selector || 1 !== type && (9 !== type && 11 !== type))) {
        return recurring;
      }
      if (!seed && documentIsHTML) {
        if (11 !== type && (match = rquickExpr.exec(selector))) {
          if (m = match[1]) {
            if (9 === type) {
              if (elem = context.getElementById(m), !elem || !elem.parentNode) {
                return recurring;
              }
              if (elem.id === m) {
                return recurring.push(elem), recurring;
              }
            } else {
              if (context.ownerDocument && ((elem = context.ownerDocument.getElementById(m)) && (contains(context, elem) && elem.id === m))) {
                return recurring.push(elem), recurring;
              }
            }
          } else {
            if (match[2]) {
              return push.apply(recurring, context.getElementsByTagName(selector)), recurring;
            }
            if ((m = match[3]) && support.getElementsByClassName) {
              return push.apply(recurring, context.getElementsByClassName(m)), recurring;
            }
          }
        }
        if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
          if (nid = old = expando, newContext = context, newSelector = 1 !== type && selector, 1 === type && "object" !== context.nodeName.toLowerCase()) {
            groups = tokenize(selector);
            if (old = context.getAttribute("id")) {
              nid = old.replace(r20, "\\$&");
            } else {
              context.setAttribute("id", nid);
            }
            /** @type {string} */
            nid = "[id='" + nid + "'] ";
            i = groups.length;
            for (;i--;) {
              /** @type {string} */
              groups[i] = nid + toSelector(groups[i]);
            }
            newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            newSelector = groups.join(",");
          }
          if (newSelector) {
            try {
              return push.apply(recurring, newContext.querySelectorAll(newSelector)), recurring;
            } catch (q) {
            } finally {
              if (!old) {
                context.removeAttribute("id");
              }
            }
          }
        }
      }
      return select(selector.replace(rtrim, "$1"), context, recurring, seed);
    }
    /**
     * @return {?}
     */
    function createCache() {
      /**
       * @param {string} key
       * @param {?} value
       * @return {?}
       */
      function cache(key, value) {
        return buf.push(key + " ") > Expr.cacheLength && delete cache[buf.shift()], cache[key + " "] = value;
      }
      /** @type {Array} */
      var buf = [];
      return cache;
    }
    /**
     * @param {Object} fn
     * @return {?}
     */
    function markFunction(fn) {
      return fn[expando] = true, fn;
    }
    /**
     * @param {Function} fn
     * @return {?}
     */
    function assert(fn) {
      var t = doc.createElement("div");
      try {
        return!!fn(t);
      } catch (c) {
        return false;
      } finally {
        if (t.parentNode) {
          t.parentNode.removeChild(t);
        }
        /** @type {null} */
        t = null;
      }
    }
    /**
     * @param {string} attrs
     * @param {Function} handler
     * @return {undefined}
     */
    function addHandle(attrs, handler) {
      var arr = attrs.split("|");
      var i = attrs.length;
      for (;i--;) {
        /** @type {Function} */
        Expr.attrHandle[arr[i]] = handler;
      }
    }
    /**
     * @param {Object} a
     * @param {Object} b
     * @return {?}
     */
    function siblingCheck(a, b) {
      var cur = b && a;
      var diff = cur && (1 === a.nodeType && (1 === b.nodeType && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE)));
      if (diff) {
        return diff;
      }
      if (cur) {
        for (;cur = cur.nextSibling;) {
          if (cur === b) {
            return-1;
          }
        }
      }
      return a ? 1 : -1;
    }
    /**
     * @param {?} type
     * @return {?}
     */
    function createInputPseudo(type) {
      return function(elem) {
        var b = elem.nodeName.toLowerCase();
        return "input" === b && elem.type === type;
      };
    }
    /**
     * @param {?} type
     * @return {?}
     */
    function createButtonPseudo(type) {
      return function(elem) {
        var NULL = elem.nodeName.toLowerCase();
        return("input" === NULL || "button" === NULL) && elem.type === type;
      };
    }
    /**
     * @param {Function} fn
     * @return {?}
     */
    function createPositionalPseudo(fn) {
      return markFunction(function(argument) {
        return argument = +argument, markFunction(function(seed, matches) {
          var j;
          var matchIndexes = fn([], seed.length, argument);
          var i = matchIndexes.length;
          for (;i--;) {
            if (seed[j = matchIndexes[i]]) {
              /** @type {boolean} */
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }
    /**
     * @param {Object} context
     * @return {?}
     */
    function testContext(context) {
      return context && ("undefined" != typeof context.getElementsByTagName && context);
    }
    /**
     * @return {undefined}
     */
    function setFilters() {
    }
    /**
     * @param {Array} tokens
     * @return {?}
     */
    function toSelector(tokens) {
      /** @type {number} */
      var i = 0;
      var nTokens = tokens.length;
      /** @type {string} */
      var selector = "";
      for (;nTokens > i;i++) {
        selector += tokens[i].value;
      }
      return selector;
    }
    /**
     * @param {Function} matcher
     * @param {Object} combinator
     * @param {boolean} dataAndEvents
     * @return {?}
     */
    function addCombinator(matcher, combinator, dataAndEvents) {
      var dir = combinator.dir;
      var e = dataAndEvents && "parentNode" === dir;
      /** @type {number} */
      var doneName = done++;
      return combinator.first ? function(elem, context, xml) {
        for (;elem = elem[dir];) {
          if (1 === elem.nodeType || e) {
            return matcher(elem, context, xml);
          }
        }
      } : function(elem, context, xml) {
        var oldCache;
        var outerCache;
        /** @type {Array} */
        var newCache = [dirruns, doneName];
        if (xml) {
          for (;elem = elem[dir];) {
            if ((1 === elem.nodeType || e) && matcher(elem, context, xml)) {
              return true;
            }
          }
        } else {
          for (;elem = elem[dir];) {
            if (1 === elem.nodeType || e) {
              if (outerCache = elem[expando] || (elem[expando] = {}), (oldCache = outerCache[dir]) && (oldCache[0] === dirruns && oldCache[1] === doneName)) {
                return newCache[2] = oldCache[2];
              }
              if (outerCache[dir] = newCache, newCache[2] = matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        }
      };
    }
    /**
     * @param {Object} matchers
     * @return {?}
     */
    function elementMatcher(matchers) {
      return matchers.length > 1 ? function(elem, context, xml) {
        var i = matchers.length;
        for (;i--;) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }
        return true;
      } : matchers[0];
    }
    /**
     * @param {string} selector
     * @param {Array} contexts
     * @param {?} recurring
     * @return {?}
     */
    function multipleContexts(selector, contexts, recurring) {
      /** @type {number} */
      var i = 0;
      var len = contexts.length;
      for (;len > i;i++) {
        Sizzle(selector, contexts[i], recurring);
      }
      return recurring;
    }
    /**
     * @param {Array} unmatched
     * @param {Object} map
     * @param {Object} filter
     * @param {Object} context
     * @param {Object} xml
     * @return {?}
     */
    function condense(unmatched, map, filter, context, xml) {
      var elem;
      /** @type {Array} */
      var newUnmatched = [];
      /** @type {number} */
      var i = 0;
      var len = unmatched.length;
      /** @type {boolean} */
      var j = null != map;
      for (;len > i;i++) {
        if (elem = unmatched[i]) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);
            if (j) {
              map.push(i);
            }
          }
        }
      }
      return newUnmatched;
    }
    /**
     * @param {Object} preFilter
     * @param {string} selector
     * @param {boolean} matcher
     * @param {Object} postFilter
     * @param {Object} postFinder
     * @param {string} postSelector
     * @return {?}
     */
    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      return postFilter && (!postFilter[expando] && (postFilter = setMatcher(postFilter))), postFinder && (!postFinder[expando] && (postFinder = setMatcher(postFinder, postSelector))), markFunction(function(seed, optgroup, context, xml) {
        var exports;
        var i;
        var elem;
        /** @type {Array} */
        var preMap = [];
        /** @type {Array} */
        var postMap = [];
        var preexisting = optgroup.length;
        var elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []);
        var matcherIn = !preFilter || !seed && selector ? elems : condense(elems, preMap, preFilter, context, xml);
        var matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : optgroup : matcherIn;
        if (matcher && matcher(matcherIn, matcherOut, context, xml), postFilter) {
          exports = condense(matcherOut, postMap);
          postFilter(exports, [], context, xml);
          i = exports.length;
          for (;i--;) {
            if (elem = exports[i]) {
              /** @type {boolean} */
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }
        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              /** @type {Array} */
              exports = [];
              i = matcherOut.length;
              for (;i--;) {
                if (elem = matcherOut[i]) {
                  exports.push(matcherIn[i] = elem);
                }
              }
              postFinder(null, matcherOut = [], exports, xml);
            }
            i = matcherOut.length;
            for (;i--;) {
              if (elem = matcherOut[i]) {
                if ((exports = postFinder ? getDistance(seed, elem) : preMap[i]) > -1) {
                  /** @type {boolean} */
                  seed[exports] = !(optgroup[exports] = elem);
                }
              }
            }
          }
        } else {
          matcherOut = condense(matcherOut === optgroup ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
          if (postFinder) {
            postFinder(null, optgroup, matcherOut, xml);
          } else {
            push.apply(optgroup, matcherOut);
          }
        }
      });
    }
    /**
     * @param {Object} tokens
     * @return {?}
     */
    function matcherFromTokens(tokens) {
      var target;
      var matcher;
      var j;
      var len = tokens.length;
      var leadingRelative = Expr.relative[tokens[0].type];
      var implicitRelative = leadingRelative || Expr.relative[" "];
      /** @type {number} */
      var i = leadingRelative ? 1 : 0;
      var matchContext = addCombinator(function(value) {
        return value === target;
      }, implicitRelative, true);
      var matchAnyContext = addCombinator(function(walkers) {
        return getDistance(target, walkers) > -1;
      }, implicitRelative, true);
      /** @type {Array} */
      var matchers = [function(elem, context, xml) {
        var e = !leadingRelative && (xml || context !== outermostContext) || ((target = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
        return target = null, e;
      }];
      for (;len > i;i++) {
        if (matcher = Expr.relative[tokens[i].type]) {
          /** @type {Array} */
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          if (matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches), matcher[expando]) {
            /** @type {number} */
            j = ++i;
            for (;len > j && !Expr.relative[tokens[j].type];j++) {
            }
            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({
              value : " " === tokens[i - 2].type ? "*" : ""
            })).replace(rtrim, "$1"), matcher, j > i && matcherFromTokens(tokens.slice(i, j)), len > j && matcherFromTokens(tokens = tokens.slice(j)), len > j && toSelector(tokens));
          }
          matchers.push(matcher);
        }
      }
      return elementMatcher(matchers);
    }
    /**
     * @param {Array} elementMatchers
     * @param {Array} setMatchers
     * @return {?}
     */
    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      /** @type {boolean} */
      var bySet = setMatchers.length > 0;
      /** @type {boolean} */
      var triggerElem = elementMatchers.length > 0;
      /**
       * @param {HTMLElement} dataAndEvents
       * @param {string} context
       * @param {?} xml
       * @param {Object} results
       * @param {Element} seed
       * @return {?}
       */
      var superMatcher = function(dataAndEvents, context, xml, results, seed) {
        var elem;
        var j;
        var matcher;
        /** @type {number} */
        var matchedCount = 0;
        /** @type {string} */
        var i = "0";
        var unmatched = dataAndEvents && [];
        /** @type {Array} */
        var setMatched = [];
        var contextBackup = outermostContext;
        var elems = dataAndEvents || triggerElem && Expr.find.TAG("*", seed);
        var dirrunsUnique = dirruns += null == contextBackup ? 1 : Math.random() || 0.1;
        var len = elems.length;
        if (seed) {
          outermostContext = context !== doc && context;
        }
        for (;i !== len && null != (elem = elems[i]);i++) {
          if (triggerElem && elem) {
            /** @type {number} */
            j = 0;
            for (;matcher = elementMatchers[j++];) {
              if (matcher(elem, context, xml)) {
                results.push(elem);
                break;
              }
            }
            if (seed) {
              dirruns = dirrunsUnique;
            }
          }
          if (bySet) {
            if (elem = !matcher && elem) {
              matchedCount--;
            }
            if (dataAndEvents) {
              unmatched.push(elem);
            }
          }
        }
        if (matchedCount += i, bySet && i !== matchedCount) {
          /** @type {number} */
          j = 0;
          for (;matcher = setMatchers[j++];) {
            matcher(unmatched, setMatched, context, xml);
          }
          if (dataAndEvents) {
            if (matchedCount > 0) {
              for (;i--;) {
                if (!unmatched[i]) {
                  if (!setMatched[i]) {
                    setMatched[i] = pop.call(results);
                  }
                }
              }
            }
            setMatched = condense(setMatched);
          }
          push.apply(results, setMatched);
          if (seed) {
            if (!dataAndEvents) {
              if (setMatched.length > 0) {
                if (matchedCount + setMatchers.length > 1) {
                  Sizzle.uniqueSort(results);
                }
              }
            }
          }
        }
        return seed && (dirruns = dirrunsUnique, outermostContext = contextBackup), unmatched;
      };
      return bySet ? markFunction(superMatcher) : superMatcher;
    }
    var i;
    var support;
    var Expr;
    var getText;
    var objectToString;
    var tokenize;
    var compile;
    var select;
    var outermostContext;
    var sortInput;
    var m;
    var setDocument;
    var doc;
    var docElem;
    var documentIsHTML;
    var rbuggyQSA;
    var rbuggyMatches;
    var matches;
    var contains;
    /** @type {string} */
    var expando = "sizzle" + 1 * new Date;
    var preferredDoc = win.document;
    /** @type {number} */
    var dirruns = 0;
    /** @type {number} */
    var done = 0;
    var classCache = createCache();
    var tokenCache = createCache();
    var compilerCache = createCache();
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    var sortOrder = function(a, b) {
      return a === b && (m = true), 0;
    };
    /** @type {number} */
    var MAX_NEGATIVE = 1 << 31;
    /** @type {function (this:Object, *): boolean} */
    var hasOwn = {}.hasOwnProperty;
    /** @type {Array} */
    var arr = [];
    /** @type {function (this:(Array.<T>|{length: number})): T} */
    var pop = arr.pop;
    /** @type {function (this:(Array.<T>|{length: number}), ...[T]): number} */
    var push_native = arr.push;
    /** @type {function (this:(Array.<T>|{length: number}), ...[T]): number} */
    var push = arr.push;
    /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
    var slice = arr.slice;
    /**
     * @param {Array} a
     * @param {Object} obj
     * @return {?}
     */
    var getDistance = function(a, obj) {
      /** @type {number} */
      var i = 0;
      var l = a.length;
      for (;l > i;i++) {
        if (a[i] === obj) {
          return i;
        }
      }
      return-1;
    };
    /** @type {string} */
    var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped";
    /** @type {string} */
    var whitespace = "[\\x20\\t\\r\\n\\f]";
    /** @type {string} */
    var characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+";
    /** @type {string} */
    var identifier = characterEncoding.replace("w", "w#");
    /** @type {string} */
    var attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]";
    /** @type {string} */
    var pattern = ":(" + characterEncoding + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|.*)\\)|)";
    /** @type {RegExp} */
    var regexp = new RegExp(whitespace + "+", "g");
    /** @type {RegExp} */
    var rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g");
    /** @type {RegExp} */
    var rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*");
    /** @type {RegExp} */
    var rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*");
    /** @type {RegExp} */
    var rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g");
    /** @type {RegExp} */
    var rgx = new RegExp(pattern);
    /** @type {RegExp} */
    var ridentifier = new RegExp("^" + identifier + "$");
    var matchExpr = {
      ID : new RegExp("^#(" + characterEncoding + ")"),
      CLASS : new RegExp("^\\.(" + characterEncoding + ")"),
      TAG : new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
      ATTR : new RegExp("^" + attributes),
      PSEUDO : new RegExp("^" + pattern),
      CHILD : new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
      bool : new RegExp("^(?:" + booleans + ")$", "i"),
      needsContext : new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
    };
    /** @type {RegExp} */
    var rinputs = /^(?:input|select|textarea|button)$/i;
    /** @type {RegExp} */
    var rheader = /^h\d$/i;
    /** @type {RegExp} */
    var rnative = /^[^{]+\{\s*\[native \w/;
    /** @type {RegExp} */
    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
    /** @type {RegExp} */
    var rsibling = /[+~]/;
    /** @type {RegExp} */
    var r20 = /'|\\/g;
    /** @type {RegExp} */
    var runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig");
    /**
     * @param {?} _
     * @param {(number|string)} escaped
     * @param {boolean} escapedWhitespace
     * @return {?}
     */
    var funescape = function(_, escaped, escapedWhitespace) {
      /** @type {number} */
      var high = "0x" + escaped - 65536;
      return high !== high || escapedWhitespace ? escaped : 0 > high ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, 1023 & high | 56320);
    };
    /**
     * @return {undefined}
     */
    var onComplete = function() {
      setDocument();
    };
    try {
      push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
      arr[preferredDoc.childNodes.length].nodeType;
    } catch (yb) {
      push = {
        /** @type {function (?, ?): undefined} */
        apply : arr.length ? function(recurring, actual) {
          push_native.apply(recurring, slice.call(actual));
        } : function(recurring, actual) {
          var j = recurring.length;
          /** @type {number} */
          var endPos = 0;
          for (;recurring[j++] = actual[endPos++];) {
          }
          /** @type {number} */
          recurring.length = j - 1;
        }
      };
    }
    support = Sizzle.support = {};
    /** @type {function (?): ?} */
    objectToString = Sizzle.isXML = function(elem) {
      var node = elem && (elem.ownerDocument || elem).documentElement;
      return node ? "HTML" !== node.nodeName : false;
    };
    /** @type {function (Node): ?} */
    setDocument = Sizzle.setDocument = function(node) {
      var hasCompare;
      var parent;
      var d = node ? node.ownerDocument || node : preferredDoc;
      return d !== doc && (9 === d.nodeType && d.documentElement) ? (doc = d, docElem = d.documentElement, parent = d.defaultView, parent && (parent !== parent.top && (parent.addEventListener ? parent.addEventListener("unload", onComplete, false) : parent.attachEvent && parent.attachEvent("onunload", onComplete))), documentIsHTML = !objectToString(d), support.attributes = assert(function(div) {
        return div.className = "i", !div.getAttribute("className");
      }), support.getElementsByTagName = assert(function(div) {
        return div.appendChild(d.createComment("")), !div.getElementsByTagName("*").length;
      }), support.getElementsByClassName = rnative.test(d.getElementsByClassName), support.getById = assert(function(div) {
        return docElem.appendChild(div).id = expando, !d.getElementsByName || !d.getElementsByName(expando).length;
      }), support.getById ? (Expr.find.ID = function(id, context) {
        if ("undefined" != typeof context.getElementById && documentIsHTML) {
          var m = context.getElementById(id);
          return m && m.parentNode ? [m] : [];
        }
      }, Expr.filter.ID = function(id) {
        var attrId = id.replace(runescape, funescape);
        return function(elem) {
          return elem.getAttribute("id") === attrId;
        };
      }) : (delete Expr.find.ID, Expr.filter.ID = function(id) {
        var attrId = id.replace(runescape, funescape);
        return function(elem) {
          var node = "undefined" != typeof elem.getAttributeNode && elem.getAttributeNode("id");
          return node && node.value === attrId;
        };
      }), Expr.find.TAG = support.getElementsByTagName ? function(selector, el) {
        return "undefined" != typeof el.getElementsByTagName ? el.getElementsByTagName(selector) : support.qsa ? el.querySelectorAll(selector) : void 0;
      } : function(tag, from) {
        var elem;
        /** @type {Array} */
        var tmp = [];
        /** @type {number} */
        var index = 0;
        var results = from.getElementsByTagName(tag);
        if ("*" === tag) {
          for (;elem = results[index++];) {
            if (1 === elem.nodeType) {
              tmp.push(elem);
            }
          }
          return tmp;
        }
        return results;
      }, Expr.find.CLASS = support.getElementsByClassName && function(m, c) {
        return documentIsHTML ? c.getElementsByClassName(m) : void 0;
      }, rbuggyMatches = [], rbuggyQSA = [], (support.qsa = rnative.test(d.querySelectorAll)) && (assert(function(div) {
        /** @type {string} */
        docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a><select id='" + expando + "-\f]' msallowcapture=''><option selected=''></option></select>";
        if (div.querySelectorAll("[msallowcapture^='']").length) {
          rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
        }
        if (!div.querySelectorAll("[selected]").length) {
          rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
        }
        if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
          rbuggyQSA.push("~=");
        }
        if (!div.querySelectorAll(":checked").length) {
          rbuggyQSA.push(":checked");
        }
        if (!div.querySelectorAll("a#" + expando + "+*").length) {
          rbuggyQSA.push(".#.+[+~]");
        }
      }), assert(function(div) {
        var input = d.createElement("input");
        input.setAttribute("type", "hidden");
        div.appendChild(input).setAttribute("name", "D");
        if (div.querySelectorAll("[name=d]").length) {
          rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
        }
        if (!div.querySelectorAll(":enabled").length) {
          rbuggyQSA.push(":enabled", ":disabled");
        }
        div.querySelectorAll("*,:x");
        rbuggyQSA.push(",.*:");
      })), (support.matchesSelector = rnative.test(matches = docElem.matches || (docElem.webkitMatchesSelector || (docElem.mozMatchesSelector || (docElem.oMatchesSelector || docElem.msMatchesSelector))))) && assert(function(div) {
        support.disconnectedMatch = matches.call(div, "div");
        matches.call(div, "[s!='']:x");
        rbuggyMatches.push("!=", pattern);
      }), rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|")), rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|")), hasCompare = rnative.test(docElem.compareDocumentPosition), contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
        var adown = 9 === a.nodeType ? a.documentElement : a;
        var bup = b && b.parentNode;
        return a === bup || !(!bup || (1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup))));
      } : function(a, b) {
        if (b) {
          for (;b = b.parentNode;) {
            if (b === a) {
              return true;
            }
          }
        }
        return false;
      }, sortOrder = hasCompare ? function(a, b) {
        if (a === b) {
          return m = true, 0;
        }
        /** @type {number} */
        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
        return compare ? compare : (compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & compare || !support.sortDetached && b.compareDocumentPosition(a) === compare ? a === d || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ? -1 : b === d || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ? 1 : sortInput ? getDistance(sortInput, a) - getDistance(sortInput, b) : 0 : 4 & compare ? -1 : 1);
      } : function(a, b) {
        if (a === b) {
          return m = true, 0;
        }
        var cur;
        /** @type {number} */
        var i = 0;
        var aup = a.parentNode;
        var bup = b.parentNode;
        /** @type {Array} */
        var ap = [a];
        /** @type {Array} */
        var bp = [b];
        if (!aup || !bup) {
          return a === d ? -1 : b === d ? 1 : aup ? -1 : bup ? 1 : sortInput ? getDistance(sortInput, a) - getDistance(sortInput, b) : 0;
        }
        if (aup === bup) {
          return siblingCheck(a, b);
        }
        /** @type {HTMLElement} */
        cur = a;
        for (;cur = cur.parentNode;) {
          ap.unshift(cur);
        }
        /** @type {HTMLElement} */
        cur = b;
        for (;cur = cur.parentNode;) {
          bp.unshift(cur);
        }
        for (;ap[i] === bp[i];) {
          i++;
        }
        return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
      }, d) : doc;
    };
    /**
     * @param {Function} expr
     * @param {Array} elements
     * @return {?}
     */
    Sizzle.matches = function(expr, elements) {
      return Sizzle(expr, null, null, elements);
    };
    /**
     * @param {Object} elem
     * @param {string} expr
     * @return {?}
     */
    Sizzle.matchesSelector = function(elem, expr) {
      if ((elem.ownerDocument || elem) !== doc && setDocument(elem), expr = expr.replace(rattributeQuotes, "='$1']"), !(!support.matchesSelector || (!documentIsHTML || (rbuggyMatches && rbuggyMatches.test(expr) || rbuggyQSA && rbuggyQSA.test(expr))))) {
        try {
          var ret = matches.call(elem, expr);
          if (ret || (support.disconnectedMatch || elem.document && 11 !== elem.document.nodeType)) {
            return ret;
          }
        } catch (e) {
        }
      }
      return Sizzle(expr, doc, null, [elem]).length > 0;
    };
    /**
     * @param {?} a
     * @param {string} b
     * @return {?}
     */
    Sizzle.contains = function(a, b) {
      return(a.ownerDocument || a) !== doc && setDocument(a), contains(a, b);
    };
    /**
     * @param {Object} elem
     * @param {string} name
     * @return {?}
     */
    Sizzle.attr = function(elem, name) {
      if ((elem.ownerDocument || elem) !== doc) {
        setDocument(elem);
      }
      var fn = Expr.attrHandle[name.toLowerCase()];
      var val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
      return void 0 !== val ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    };
    /**
     * @param {Function} a
     * @return {?}
     */
    Sizzle.error = function(a) {
      throw new Error("Syntax error, unrecognized expression: " + a);
    };
    /**
     * @param {Array} results
     * @return {?}
     */
    Sizzle.uniqueSort = function(results) {
      var elem;
      /** @type {Array} */
      var duplicates = [];
      /** @type {number} */
      var j = 0;
      /** @type {number} */
      var i = 0;
      if (m = !support.detectDuplicates, sortInput = !support.sortStable && results.slice(0), results.sort(sortOrder), m) {
        for (;elem = results[i++];) {
          if (elem === results[i]) {
            /** @type {number} */
            j = duplicates.push(i);
          }
        }
        for (;j--;) {
          results.splice(duplicates[j], 1);
        }
      }
      return sortInput = null, results;
    };
    /** @type {function (Function): ?} */
    getText = Sizzle.getText = function(a) {
      var node;
      /** @type {string} */
      var ret = "";
      /** @type {number} */
      var ia = 0;
      var type = a.nodeType;
      if (type) {
        if (1 === type || (9 === type || 11 === type)) {
          if ("string" == typeof a.textContent) {
            return a.textContent;
          }
          a = a.firstChild;
          for (;a;a = a.nextSibling) {
            ret += getText(a);
          }
        } else {
          if (3 === type || 4 === type) {
            return a.nodeValue;
          }
        }
      } else {
        for (;node = a[ia++];) {
          ret += getText(node);
        }
      }
      return ret;
    };
    Expr = Sizzle.selectors = {
      cacheLength : 50,
      /** @type {function (Object): ?} */
      createPseudo : markFunction,
      match : matchExpr,
      attrHandle : {},
      find : {},
      relative : {
        ">" : {
          dir : "parentNode",
          first : true
        },
        " " : {
          dir : "parentNode"
        },
        "+" : {
          dir : "previousSibling",
          first : true
        },
        "~" : {
          dir : "previousSibling"
        }
      },
      preFilter : {
        /**
         * @param {Array} match
         * @return {?}
         */
        ATTR : function(match) {
          return match[1] = match[1].replace(runescape, funescape), match[3] = (match[3] || (match[4] || (match[5] || ""))).replace(runescape, funescape), "~=" === match[2] && (match[3] = " " + match[3] + " "), match.slice(0, 4);
        },
        /**
         * @param {Array} match
         * @return {?}
         */
        CHILD : function(match) {
          return match[1] = match[1].toLowerCase(), "nth" === match[1].slice(0, 3) ? (match[3] || Sizzle.error(match[0]), match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * ("even" === match[3] || "odd" === match[3])), match[5] = +(match[7] + match[8] || "odd" === match[3])) : match[3] && Sizzle.error(match[0]), match;
        },
        /**
         * @param {Array} match
         * @return {?}
         */
        PSEUDO : function(match) {
          var excess;
          var unquoted = !match[6] && match[2];
          return matchExpr.CHILD.test(match[0]) ? null : (match[3] ? match[2] = match[4] || (match[5] || "") : unquoted && (rgx.test(unquoted) && ((excess = tokenize(unquoted, true)) && ((excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length) && (match[0] = match[0].slice(0, excess), match[2] = unquoted.slice(0, excess))))), match.slice(0, 3));
        }
      },
      filter : {
        /**
         * @param {string} nodeNameSelector
         * @return {?}
         */
        TAG : function(nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return "*" === nodeNameSelector ? function() {
            return true;
          } : function(elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
        },
        /**
         * @param {string} className
         * @return {?}
         */
        CLASS : function(className) {
          var pattern = classCache[className + " "];
          return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
            return pattern.test("string" == typeof elem.className && elem.className || ("undefined" != typeof elem.getAttribute && elem.getAttribute("class") || ""));
          });
        },
        /**
         * @param {string} name
         * @param {string} not
         * @param {string} check
         * @return {?}
         */
        ATTR : function(name, not, check) {
          return function(elem) {
            var result = Sizzle.attr(elem, name);
            return null == result ? "!=" === not : not ? (result += "", "=" === not ? result === check : "!=" === not ? result !== check : "^=" === not ? check && 0 === result.indexOf(check) : "*=" === not ? check && result.indexOf(check) > -1 : "$=" === not ? check && result.slice(-check.length) === check : "~=" === not ? (" " + result.replace(regexp, " ") + " ").indexOf(check) > -1 : "|=" === not ? result === check || result.slice(0, check.length + 1) === check + "-" : false) : true;
          };
        },
        /**
         * @param {string} type
         * @param {string} argument
         * @param {?} dataAndEvents
         * @param {number} first
         * @param {number} last
         * @return {?}
         */
        CHILD : function(type, argument, dataAndEvents, first, last) {
          /** @type {boolean} */
          var simple = "nth" !== type.slice(0, 3);
          /** @type {boolean} */
          var forward = "last" !== type.slice(-4);
          /** @type {boolean} */
          var value = "of-type" === argument;
          return 1 === first && 0 === last ? function(contestant) {
            return!!contestant.parentNode;
          } : function(elem, dataAndEvents, computed) {
            var cache;
            var outerCache;
            var node;
            var diff;
            var nodeIndex;
            var eventPath;
            /** @type {string} */
            var which = simple !== forward ? "nextSibling" : "previousSibling";
            var parent = elem.parentNode;
            var attrNames = value && elem.nodeName.toLowerCase();
            /** @type {boolean} */
            var useCache = !computed && !value;
            if (parent) {
              if (simple) {
                for (;which;) {
                  /** @type {Object} */
                  node = elem;
                  for (;node = node[which];) {
                    if (value ? node.nodeName.toLowerCase() === attrNames : 1 === node.nodeType) {
                      return false;
                    }
                  }
                  /** @type {(boolean|string)} */
                  eventPath = which = "only" === type && (!eventPath && "nextSibling");
                }
                return true;
              }
              if (eventPath = [forward ? parent.firstChild : parent.lastChild], forward && useCache) {
                outerCache = parent[expando] || (parent[expando] = {});
                cache = outerCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = cache[0] === dirruns && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];
                for (;node = ++nodeIndex && (node && node[which]) || ((diff = nodeIndex = 0) || eventPath.pop());) {
                  if (1 === node.nodeType && (++diff && node === elem)) {
                    /** @type {Array} */
                    outerCache[type] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }
              } else {
                if (useCache && ((cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns)) {
                  diff = cache[1];
                } else {
                  for (;(node = ++nodeIndex && (node && node[which]) || ((diff = nodeIndex = 0) || eventPath.pop())) && ((value ? node.nodeName.toLowerCase() !== attrNames : 1 !== node.nodeType) || (!++diff || (useCache && ((node[expando] || (node[expando] = {}))[type] = [dirruns, diff]), node !== elem)));) {
                  }
                }
              }
              return diff -= last, diff === first || diff % first === 0 && diff / first >= 0;
            }
          };
        },
        /**
         * @param {string} pseudo
         * @param {?} context
         * @return {?}
         */
        PSEUDO : function(pseudo, context) {
          var args;
          var fn = Expr.pseudos[pseudo] || (Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo));
          return fn[expando] ? fn(context) : fn.length > 1 ? (args = [pseudo, pseudo, "", context], Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(el, event) {
            var id;
            var ret = fn(el, context);
            var i = ret.length;
            for (;i--;) {
              id = getDistance(el, ret[i]);
              /** @type {boolean} */
              el[id] = !(event[id] = ret[i]);
            }
          }) : function(err) {
            return fn(err, 0, args);
          }) : fn;
        }
      },
      pseudos : {
        not : markFunction(function(selector) {
          /** @type {Array} */
          var elem = [];
          /** @type {Array} */
          var memory = [];
          var matcher = compile(selector.replace(rtrim, "$1"));
          return matcher[expando] ? markFunction(function(seed, qs, dataAndEvents, xml) {
            var val;
            var unmatched = matcher(seed, null, xml, []);
            var i = seed.length;
            for (;i--;) {
              if (val = unmatched[i]) {
                /** @type {boolean} */
                seed[i] = !(qs[i] = val);
              }
            }
          }) : function(value, dataAndEvents, xml) {
            return elem[0] = value, matcher(elem, null, xml, memory), elem[0] = null, !memory.pop();
          };
        }),
        has : markFunction(function(selector) {
          return function(elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),
        contains : markFunction(function(id) {
          return id = id.replace(runescape, funescape), function(elem) {
            return(elem.textContent || (elem.innerText || getText(elem))).indexOf(id) > -1;
          };
        }),
        lang : markFunction(function(lang) {
          return ridentifier.test(lang || "") || Sizzle.error("unsupported lang: " + lang), lang = lang.replace(runescape, funescape).toLowerCase(), function(elem) {
            var elemLang;
            do {
              if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                return elemLang = elemLang.toLowerCase(), elemLang === lang || 0 === elemLang.indexOf(lang + "-");
              }
            } while ((elem = elem.parentNode) && 1 === elem.nodeType);
            return false;
          };
        }),
        /**
         * @param {Function} a
         * @return {?}
         */
        target : function(a) {
          var models = win.location && win.location.hash;
          return models && models.slice(1) === a.id;
        },
        /**
         * @param {string} elem
         * @return {?}
         */
        root : function(elem) {
          return elem === docElem;
        },
        /**
         * @param {Function} a
         * @return {?}
         */
        focus : function(a) {
          return a === doc.activeElement && ((!doc.hasFocus || doc.hasFocus()) && !!(a.type || (a.href || ~a.tabIndex)));
        },
        /**
         * @param {EventTarget} a
         * @return {?}
         */
        enabled : function(a) {
          return a.disabled === false;
        },
        /**
         * @param {EventTarget} elem
         * @return {?}
         */
        disabled : function(elem) {
          return elem.disabled === true;
        },
        /**
         * @param {Function} a
         * @return {?}
         */
        checked : function(a) {
          var b = a.nodeName.toLowerCase();
          return "input" === b && !!a.checked || "option" === b && !!a.selected;
        },
        /**
         * @param {Node} elem
         * @return {?}
         */
        selected : function(elem) {
          return elem.parentNode && elem.parentNode.selectedIndex, elem.selected === true;
        },
        /**
         * @param {string} elem
         * @return {?}
         */
        empty : function(elem) {
          elem = elem.firstChild;
          for (;elem;elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }
          return true;
        },
        /**
         * @param {string} elem
         * @return {?}
         */
        parent : function(elem) {
          return!Expr.pseudos.empty(elem);
        },
        /**
         * @param {Node} elem
         * @return {?}
         */
        header : function(elem) {
          return rheader.test(elem.nodeName);
        },
        /**
         * @param {Node} elem
         * @return {?}
         */
        input : function(elem) {
          return rinputs.test(elem.nodeName);
        },
        /**
         * @param {Node} elem
         * @return {?}
         */
        button : function(elem) {
          var b = elem.nodeName.toLowerCase();
          return "input" === b && "button" === elem.type || "button" === b;
        },
        /**
         * @param {Function} a
         * @return {?}
         */
        text : function(a) {
          var evt;
          return "input" === a.nodeName.toLowerCase() && ("text" === a.type && (null == (evt = a.getAttribute("type")) || "text" === evt.toLowerCase()));
        },
        first : createPositionalPseudo(function() {
          return[0];
        }),
        last : createPositionalPseudo(function(dataAndEvents, deepDataAndEvents) {
          return[deepDataAndEvents - 1];
        }),
        eq : createPositionalPseudo(function(dataAndEvents, length, index) {
          return[0 > index ? index + length : index];
        }),
        even : createPositionalPseudo(function(assigns, dataAndEvents) {
          /** @type {number} */
          var vvar = 0;
          for (;dataAndEvents > vvar;vvar += 2) {
            assigns.push(vvar);
          }
          return assigns;
        }),
        odd : createPositionalPseudo(function(assigns, dataAndEvents) {
          /** @type {number} */
          var vvar = 1;
          for (;dataAndEvents > vvar;vvar += 2) {
            assigns.push(vvar);
          }
          return assigns;
        }),
        lt : createPositionalPseudo(function(assigns, length, index) {
          var vvar = 0 > index ? index + length : index;
          for (;--vvar >= 0;) {
            assigns.push(vvar);
          }
          return assigns;
        }),
        gt : createPositionalPseudo(function(input, length, index) {
          var j = 0 > index ? index + length : index;
          for (;++j < length;) {
            input.push(j);
          }
          return input;
        })
      }
    };
    Expr.pseudos.nth = Expr.pseudos.eq;
    for (i in{
      radio : true,
      checkbox : true,
      file : true,
      password : true,
      image : true
    }) {
      Expr.pseudos[i] = createInputPseudo(i);
    }
    for (i in{
      submit : true,
      reset : true
    }) {
      Expr.pseudos[i] = createButtonPseudo(i);
    }
    return setFilters.prototype = Expr.filters = Expr.pseudos, Expr.setFilters = new setFilters, tokenize = Sizzle.tokenize = function(QUnit, parseOnly) {
      var matched;
      var match;
      var tokens;
      var type;
      var soFar;
      var groups;
      var preFilters;
      var cached = tokenCache[QUnit + " "];
      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }
      /** @type {Function} */
      soFar = QUnit;
      /** @type {Array} */
      groups = [];
      preFilters = Expr.preFilter;
      for (;soFar;) {
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            soFar = soFar.slice(match[0].length) || soFar;
          }
          groups.push(tokens = []);
        }
        /** @type {boolean} */
        matched = false;
        if (match = rcombinators.exec(soFar)) {
          /** @type {string} */
          matched = match.shift();
          tokens.push({
            value : matched,
            type : match[0].replace(rtrim, " ")
          });
          soFar = soFar.slice(matched.length);
        }
        for (type in Expr.filter) {
          if (!!(match = matchExpr[type].exec(soFar))) {
            if (!(preFilters[type] && !(match = preFilters[type](match)))) {
              matched = match.shift();
              tokens.push({
                value : matched,
                type : type,
                matches : match
              });
              soFar = soFar.slice(matched.length);
            }
          }
        }
        if (!matched) {
          break;
        }
      }
      return parseOnly ? soFar.length : soFar ? Sizzle.error(QUnit) : tokenCache(QUnit, groups).slice(0);
    }, compile = Sizzle.compile = function(selector, group) {
      var i;
      /** @type {Array} */
      var setMatchers = [];
      /** @type {Array} */
      var elementMatchers = [];
      var cached = compilerCache[selector + " "];
      if (!cached) {
        if (!group) {
          group = tokenize(selector);
        }
        i = group.length;
        for (;i--;) {
          cached = matcherFromTokens(group[i]);
          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        }
        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
        /** @type {string} */
        cached.selector = selector;
      }
      return cached;
    }, select = Sizzle.select = function(selector, optgroup, results, ok) {
      var i;
      var tokens;
      var token;
      var type;
      var find;
      /** @type {(Function|boolean)} */
      var compiled = "function" == typeof selector && selector;
      var match = !ok && tokenize(selector = compiled.selector || selector);
      if (results = results || [], 1 === match.length) {
        if (tokens = match[0] = match[0].slice(0), tokens.length > 2 && ("ID" === (token = tokens[0]).type && (support.getById && (9 === optgroup.nodeType && (documentIsHTML && Expr.relative[tokens[1].type]))))) {
          if (optgroup = (Expr.find.ID(token.matches[0].replace(runescape, funescape), optgroup) || [])[0], !optgroup) {
            return results;
          }
          if (compiled) {
            optgroup = optgroup.parentNode;
          }
          selector = selector.slice(tokens.shift().value.length);
        }
        i = matchExpr.needsContext.test(selector) ? 0 : tokens.length;
        for (;i-- && (token = tokens[i], !Expr.relative[type = token.type]);) {
          if ((find = Expr.find[type]) && (ok = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(optgroup.parentNode) || optgroup))) {
            if (tokens.splice(i, 1), selector = ok.length && toSelector(tokens), !selector) {
              return push.apply(results, ok), results;
            }
            break;
          }
        }
      }
      return(compiled || compile(selector, match))(ok, optgroup, !documentIsHTML, results, rsibling.test(selector) && testContext(optgroup.parentNode) || optgroup), results;
    }, support.sortStable = expando.split("").sort(sortOrder).join("") === expando, support.detectDuplicates = !!m, setDocument(), support.sortDetached = assert(function(div1) {
      return 1 & div1.compareDocumentPosition(doc.createElement("div"));
    }), assert(function(div) {
      return div.innerHTML = "<a href='#'></a>", "#" === div.firstChild.getAttribute("href");
    }) || addHandle("type|href|height|width", function(elem, name, flag_xml) {
      return flag_xml ? void 0 : elem.getAttribute(name, "type" === name.toLowerCase() ? 1 : 2);
    }), support.attributes && assert(function(div) {
      return div.innerHTML = "<input/>", div.firstChild.setAttribute("value", ""), "" === div.firstChild.getAttribute("value");
    }) || addHandle("value", function(target, dataAndEvents, defaultValue) {
      return defaultValue || "input" !== target.nodeName.toLowerCase() ? void 0 : target.defaultValue;
    }), assert(function(div) {
      return null == div.getAttribute("disabled");
    }) || addHandle(booleans, function(elem, name, dataAndEvents) {
      var val;
      return dataAndEvents ? void 0 : elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    }), Sizzle;
  }(win);
  jQuery.find = Sizzle;
  jQuery.expr = Sizzle.selectors;
  jQuery.expr[":"] = jQuery.expr.pseudos;
  jQuery.unique = Sizzle.uniqueSort;
  jQuery.text = Sizzle.getText;
  jQuery.isXMLDoc = Sizzle.isXML;
  jQuery.contains = Sizzle.contains;
  var rneedsContext = jQuery.expr.match.needsContext;
  /** @type {RegExp} */
  var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
  /** @type {RegExp} */
  var QUnit = /^.[^:#\[\.,]*$/;
  /**
   * @param {Function} a
   * @param {Object} name
   * @param {Object} value
   * @return {?}
   */
  jQuery.filter = function(a, name, value) {
    var elem = name[0];
    return value && (a = ":not(" + a + ")"), 1 === name.length && 1 === elem.nodeType ? jQuery.find.matchesSelector(elem, a) ? [elem] : [] : jQuery.find.matches(a, jQuery.grep(name, function(dest) {
      return 1 === dest.nodeType;
    }));
  };
  jQuery.fn.extend({
    /**
     * @param {string} selector
     * @return {?}
     */
    find : function(selector) {
      var i;
      /** @type {Array} */
      var ret = [];
      var self = this;
      var len = self.length;
      if ("string" != typeof selector) {
        return this.pushStack(jQuery(selector).filter(function() {
          /** @type {number} */
          i = 0;
          for (;len > i;i++) {
            if (jQuery.contains(self[i], this)) {
              return true;
            }
          }
        }));
      }
      /** @type {number} */
      i = 0;
      for (;len > i;i++) {
        jQuery.find(selector, self[i], ret);
      }
      return ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret), ret.selector = this.selector ? this.selector + " " + selector : selector, ret;
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    filter : function(a) {
      return this.pushStack(winnow(this, a || [], false));
    },
    /**
     * @param {Array} selector
     * @return {?}
     */
    not : function(selector) {
      return this.pushStack(winnow(this, selector || [], true));
    },
    /**
     * @param {string} selector
     * @return {?}
     */
    is : function(selector) {
      return!!winnow(this, "string" == typeof selector && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
    }
  });
  var rootjQuery;
  var doc = win.document;
  /** @type {RegExp} */
  var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
  /** @type {function (string, Object): ?} */
  var T = jQuery.fn.init = function(selector, context) {
    var match;
    var elem;
    if (!selector) {
      return this;
    }
    if ("string" == typeof selector) {
      if (match = "<" === selector.charAt(0) && (">" === selector.charAt(selector.length - 1) && selector.length >= 3) ? [null, selector, null] : rquickExpr.exec(selector), !match || !match[1] && context) {
        return!context || context.jquery ? (context || rootjQuery).find(selector) : this.constructor(context).find(selector);
      }
      if (match[1]) {
        if (context = context instanceof jQuery ? context[0] : context, jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : doc, true)), rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
          for (match in context) {
            if (jQuery.isFunction(this[match])) {
              this[match](context[match]);
            } else {
              this.attr(match, context[match]);
            }
          }
        }
        return this;
      }
      if (elem = doc.getElementById(match[2]), elem && elem.parentNode) {
        if (elem.id !== match[2]) {
          return rootjQuery.find(selector);
        }
        /** @type {number} */
        this.length = 1;
        this[0] = elem;
      }
      return this.context = doc, this.selector = selector, this;
    }
    return selector.nodeType ? (this.context = this[0] = selector, this.length = 1, this) : jQuery.isFunction(selector) ? "undefined" != typeof rootjQuery.ready ? rootjQuery.ready(selector) : selector(jQuery) : (void 0 !== selector.selector && (this.selector = selector.selector, this.context = selector.context), jQuery.makeArray(selector, this));
  };
  T.prototype = jQuery.fn;
  rootjQuery = jQuery(doc);
  /** @type {RegExp} */
  var eventSplitter = /^(?:parents|prev(?:Until|All))/;
  var guaranteedUnique = {
    children : true,
    contents : true,
    next : true,
    prev : true
  };
  jQuery.extend({
    /**
     * @param {Object} elems
     * @param {string} dir
     * @param {number} until
     * @return {?}
     */
    dir : function(elems, dir, until) {
      /** @type {Array} */
      var matched = [];
      var elem = elems[dir];
      for (;elem && (9 !== elem.nodeType && (void 0 === until || (1 !== elem.nodeType || !jQuery(elem).is(until))));) {
        if (1 === elem.nodeType) {
          matched.push(elem);
        }
        elem = elem[dir];
      }
      return matched;
    },
    /**
     * @param {Object} n
     * @param {Object} elem
     * @return {?}
     */
    sibling : function(n, elem) {
      /** @type {Array} */
      var r = [];
      for (;n;n = n.nextSibling) {
        if (1 === n.nodeType) {
          if (n !== elem) {
            r.push(n);
          }
        }
      }
      return r;
    }
  });
  jQuery.fn.extend({
    /**
     * @param {Object} target
     * @return {?}
     */
    has : function(target) {
      var i;
      var targets = jQuery(target, this);
      var l = targets.length;
      return this.filter(function() {
        /** @type {number} */
        i = 0;
        for (;l > i;i++) {
          if (jQuery.contains(this, targets[i])) {
            return true;
          }
        }
      });
    },
    /**
     * @param {string} selectors
     * @param {Node} context
     * @return {?}
     */
    closest : function(selectors, context) {
      var cur;
      /** @type {number} */
      var i = 0;
      var l = this.length;
      /** @type {Array} */
      var matched = [];
      var pos = rneedsContext.test(selectors) || "string" != typeof selectors ? jQuery(selectors, context || this.context) : 0;
      for (;l > i;i++) {
        cur = this[i];
        for (;cur && cur !== context;cur = cur.parentNode) {
          if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : 1 === cur.nodeType && jQuery.find.matchesSelector(cur, selectors))) {
            matched.push(cur);
            break;
          }
        }
      }
      return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    index : function(elem) {
      return elem ? "string" == typeof elem ? jQuery.inArray(this[0], jQuery(elem)) : jQuery.inArray(elem.jquery ? elem[0] : elem, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
    },
    /**
     * @param {Object} a
     * @param {string} val
     * @return {?}
     */
    add : function(a, val) {
      return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(a, val))));
    },
    /**
     * @param {Function} QUnit
     * @return {?}
     */
    addBack : function(QUnit) {
      return this.add(null == QUnit ? this.prevObject : this.prevObject.filter(QUnit));
    }
  });
  jQuery.each({
    /**
     * @param {Node} elem
     * @return {?}
     */
    parent : function(elem) {
      var parent = elem.parentNode;
      return parent && 11 !== parent.nodeType ? parent : null;
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    parents : function(elem) {
      return jQuery.dir(elem, "parentNode");
    },
    /**
     * @param {Object} elem
     * @param {?} i
     * @param {number} until
     * @return {?}
     */
    parentsUntil : function(elem, i, until) {
      return jQuery.dir(elem, "parentNode", until);
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    next : function(a) {
      return sibling(a, "nextSibling");
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    prev : function(elem) {
      return sibling(elem, "previousSibling");
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    nextAll : function(elem) {
      return jQuery.dir(elem, "nextSibling");
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    prevAll : function(elem) {
      return jQuery.dir(elem, "previousSibling");
    },
    /**
     * @param {Object} elem
     * @param {?} i
     * @param {number} until
     * @return {?}
     */
    nextUntil : function(elem, i, until) {
      return jQuery.dir(elem, "nextSibling", until);
    },
    /**
     * @param {Object} elem
     * @param {?} i
     * @param {number} until
     * @return {?}
     */
    prevUntil : function(elem, i, until) {
      return jQuery.dir(elem, "previousSibling", until);
    },
    /**
     * @param {HTMLElement} elem
     * @return {?}
     */
    siblings : function(elem) {
      return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
    },
    /**
     * @param {Element} elem
     * @return {?}
     */
    children : function(elem) {
      return jQuery.sibling(elem.firstChild);
    },
    /**
     * @param {Element} elem
     * @return {?}
     */
    contents : function(elem) {
      return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes);
    }
  }, function(name, fn) {
    /**
     * @param {Function} until
     * @param {Function} QUnit
     * @return {?}
     */
    jQuery.fn[name] = function(until, QUnit) {
      var optgroup = jQuery.map(this, fn, until);
      return "Until" !== name.slice(-5) && (QUnit = until), QUnit && ("string" == typeof QUnit && (optgroup = jQuery.filter(QUnit, optgroup))), this.length > 1 && (guaranteedUnique[name] || (optgroup = jQuery.unique(optgroup)), eventSplitter.test(name) && (optgroup = optgroup.reverse())), this.pushStack(optgroup);
    };
  });
  /** @type {RegExp} */
  var core_rnotwhite = /\S+/g;
  var optionsCache = {};
  /**
   * @param {Object} options
   * @return {?}
   */
  jQuery.Callbacks = function(options) {
    options = "string" == typeof options ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
    var r;
    var memory;
    var d;
    var i;
    var firingIndex;
    var firingStart;
    /** @type {Array} */
    var list = [];
    /** @type {(Array|boolean)} */
    var stack = !options.once && [];
    /**
     * @param {Array} data
     * @return {undefined}
     */
    var fire = function(data) {
      memory = options.memory && data;
      /** @type {boolean} */
      d = true;
      firingIndex = firingStart || 0;
      /** @type {number} */
      firingStart = 0;
      i = list.length;
      /** @type {boolean} */
      r = true;
      for (;list && i > firingIndex;firingIndex++) {
        if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
          /** @type {boolean} */
          memory = false;
          break;
        }
      }
      /** @type {boolean} */
      r = false;
      if (list) {
        if (stack) {
          if (stack.length) {
            fire(stack.shift());
          }
        } else {
          if (memory) {
            /** @type {Array} */
            list = [];
          } else {
            self.disable();
          }
        }
      }
    };
    var self = {
      /**
       * @return {?}
       */
      add : function() {
        if (list) {
          var start = list.length;
          !function add(attributes) {
            jQuery.each(attributes, function(dataAndEvents, exports) {
              var type = jQuery.type(exports);
              if ("function" === type) {
                if (!(options.unique && self.has(exports))) {
                  list.push(exports);
                }
              } else {
                if (exports) {
                  if (exports.length) {
                    if ("string" !== type) {
                      add(exports);
                    }
                  }
                }
              }
            });
          }(arguments);
          if (r) {
            i = list.length;
          } else {
            if (memory) {
              firingStart = start;
              fire(memory);
            }
          }
        }
        return this;
      },
      /**
       * @return {?}
       */
      remove : function() {
        return list && jQuery.each(arguments, function(dataAndEvents, arg) {
          var index;
          for (;(index = jQuery.inArray(arg, list, index)) > -1;) {
            list.splice(index, 1);
            if (r) {
              if (i >= index) {
                i--;
              }
              if (firingIndex >= index) {
                firingIndex--;
              }
            }
          }
        }), this;
      },
      /**
       * @param {Object} obj
       * @return {?}
       */
      has : function(obj) {
        return obj ? jQuery.inArray(obj, list) > -1 : !(!list || !list.length);
      },
      /**
       * @return {?}
       */
      empty : function() {
        return list = [], i = 0, this;
      },
      /**
       * @return {?}
       */
      disable : function() {
        return list = stack = memory = void 0, this;
      },
      /**
       * @return {?}
       */
      disabled : function() {
        return!list;
      },
      /**
       * @return {?}
       */
      lock : function() {
        return stack = void 0, memory || self.disable(), this;
      },
      /**
       * @return {?}
       */
      locked : function() {
        return!stack;
      },
      /**
       * @param {?} context
       * @param {Object} args
       * @return {?}
       */
      fireWith : function(context, args) {
        return!list || (d && !stack || (args = args || [], args = [context, args.slice ? args.slice() : args], r ? stack.push(args) : fire(args))), this;
      },
      /**
       * @return {?}
       */
      fire : function() {
        return self.fireWith(this, arguments), this;
      },
      /**
       * @return {?}
       */
      fired : function() {
        return!!d;
      }
    };
    return self;
  };
  jQuery.extend({
    /**
     * @param {Function} func
     * @return {?}
     */
    Deferred : function(func) {
      /** @type {Array} */
      var attributes = [["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]];
      /** @type {string} */
      var state = "pending";
      var promise = {
        /**
         * @return {?}
         */
        state : function() {
          return state;
        },
        /**
         * @return {?}
         */
        always : function() {
          return deferred.done(arguments).fail(arguments), this;
        },
        /**
         * @return {?}
         */
        then : function() {
          /** @type {Arguments} */
          var fns = arguments;
          return jQuery.Deferred(function(newDefer) {
            jQuery.each(attributes, function(i, tuple) {
              var fn = jQuery.isFunction(fns[i]) && fns[i];
              deferred[tuple[1]](function() {
                var returned = fn && fn.apply(this, arguments);
                if (returned && jQuery.isFunction(returned.promise)) {
                  returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                } else {
                  newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                }
              });
            });
            /** @type {null} */
            fns = null;
          }).promise();
        },
        /**
         * @param {string} attributes
         * @return {?}
         */
        promise : function(attributes) {
          return null != attributes ? jQuery.extend(attributes, promise) : promise;
        }
      };
      var deferred = {};
      return promise.pipe = promise.then, jQuery.each(attributes, function(dataAndEvents, tuple) {
        var list = tuple[2];
        var stateString = tuple[3];
        promise[tuple[1]] = list.add;
        if (stateString) {
          list.add(function() {
            state = stateString;
          }, attributes[1 ^ dataAndEvents][2].disable, attributes[2][2].lock);
        }
        /**
         * @return {?}
         */
        deferred[tuple[0]] = function() {
          return deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments), this;
        };
        deferred[tuple[0] + "With"] = list.fireWith;
      }), promise.promise(deferred), func && func.call(deferred, deferred), deferred;
    },
    /**
     * @param {Object} subordinate
     * @return {?}
     */
    when : function(subordinate) {
      var progressValues;
      var progressContexts;
      var resolveContexts;
      /** @type {number} */
      var i = 0;
      /** @type {Array.<?>} */
      var resolveValues = core_slice.call(arguments);
      /** @type {number} */
      var length = resolveValues.length;
      /** @type {number} */
      var remaining = 1 !== length || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0;
      var deferred = 1 === remaining ? subordinate : jQuery.Deferred();
      /**
       * @param {number} i
       * @param {(Array|NodeList)} contexts
       * @param {Array} values
       * @return {?}
       */
      var updateFunc = function(i, contexts, values) {
        return function(value) {
          contexts[i] = this;
          values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
          if (values === progressValues) {
            deferred.notifyWith(contexts, values);
          } else {
            if (!--remaining) {
              deferred.resolveWith(contexts, values);
            }
          }
        };
      };
      if (length > 1) {
        /** @type {Array} */
        progressValues = new Array(length);
        /** @type {Array} */
        progressContexts = new Array(length);
        /** @type {Array} */
        resolveContexts = new Array(length);
        for (;length > i;i++) {
          if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
            resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
          } else {
            --remaining;
          }
        }
      }
      return remaining || deferred.resolveWith(resolveContexts, resolveValues), deferred.promise();
    }
  });
  var readyList;
  /**
   * @param {Function} QUnit
   * @return {?}
   */
  jQuery.fn.ready = function(QUnit) {
    return jQuery.ready.promise().done(QUnit), this;
  };
  jQuery.extend({
    isReady : false,
    readyWait : 1,
    /**
     * @param {?} hold
     * @return {undefined}
     */
    holdReady : function(hold) {
      if (hold) {
        jQuery.readyWait++;
      } else {
        jQuery.ready(true);
      }
    },
    /**
     * @param {boolean} wait
     * @return {?}
     */
    ready : function(wait) {
      if (wait === true ? !--jQuery.readyWait : !jQuery.isReady) {
        if (!doc.body) {
          return setTimeout(jQuery.ready);
        }
        /** @type {boolean} */
        jQuery.isReady = true;
        if (!(wait !== true && --jQuery.readyWait > 0)) {
          readyList.resolveWith(doc, [jQuery]);
          if (jQuery.fn.triggerHandler) {
            jQuery(doc).triggerHandler("ready");
            jQuery(doc).off("ready");
          }
        }
      }
    }
  });
  /**
   * @param {string} obj
   * @return {?}
   */
  jQuery.ready.promise = function(obj) {
    if (!readyList) {
      if (readyList = jQuery.Deferred(), "complete" === doc.readyState) {
        setTimeout(jQuery.ready);
      } else {
        if (doc.addEventListener) {
          doc.addEventListener("DOMContentLoaded", init, false);
          win.addEventListener("load", init, false);
        } else {
          doc.attachEvent("onreadystatechange", init);
          win.attachEvent("onload", init);
          /** @type {boolean} */
          var t = false;
          try {
            t = null == win.frameElement && doc.documentElement;
          } catch (d) {
          }
          if (t) {
            if (t.doScroll) {
              !function doScrollCheck() {
                if (!jQuery.isReady) {
                  try {
                    t.doScroll("left");
                  } catch (a) {
                    return setTimeout(doScrollCheck, 50);
                  }
                  domReady();
                  jQuery.ready();
                }
              }();
            }
          }
        }
      }
    }
    return readyList.promise(obj);
  };
  var i;
  /** @type {string} */
  var text = "undefined";
  for (i in jQuery(support)) {
    break;
  }
  /** @type {boolean} */
  support.ownLast = "0" !== i;
  /** @type {boolean} */
  support.inlineBlockNeedsLayout = false;
  jQuery(function() {
    var xhrSupported;
    var div;
    var body;
    var container;
    body = doc.getElementsByTagName("body")[0];
    if (body) {
      if (body.style) {
        div = doc.createElement("div");
        container = doc.createElement("div");
        /** @type {string} */
        container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
        body.appendChild(container).appendChild(div);
        if (typeof div.style.zoom !== text) {
          /** @type {string} */
          div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";
          /** @type {boolean} */
          support.inlineBlockNeedsLayout = xhrSupported = 3 === div.offsetWidth;
          if (xhrSupported) {
            /** @type {number} */
            body.style.zoom = 1;
          }
        }
        body.removeChild(container);
      }
    }
  });
  (function() {
    var closer = doc.createElement("div");
    if (null == support.deleteExpando) {
      /** @type {boolean} */
      support.deleteExpando = true;
      try {
        delete closer.test;
      } catch (b) {
        /** @type {boolean} */
        support.deleteExpando = false;
      }
    }
    /** @type {null} */
    closer = null;
  })();
  /**
   * @param {Node} elem
   * @return {?}
   */
  jQuery.acceptData = function(elem) {
    var noData = jQuery.noData[(elem.nodeName + " ").toLowerCase()];
    /** @type {number} */
    var code = +elem.nodeType || 1;
    return 1 !== code && 9 !== code ? false : !noData || noData !== true && elem.getAttribute("classid") === noData;
  };
  /** @type {RegExp} */
  var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
  /** @type {RegExp} */
  var rreturn = /([A-Z])/g;
  jQuery.extend({
    cache : {},
    noData : {
      "applet " : true,
      "embed " : true,
      "object " : "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
    },
    /**
     * @param {Object} elem
     * @return {?}
     */
    hasData : function(elem) {
      return elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando], !!elem && !filter(elem);
    },
    /**
     * @param {Function} a
     * @param {Object} name
     * @param {Object} replacementHash
     * @return {?}
     */
    data : function(a, name, replacementHash) {
      return get(a, name, replacementHash);
    },
    /**
     * @param {Object} elem
     * @param {string} key
     * @return {?}
     */
    removeData : function(elem, key) {
      return cb(elem, key);
    },
    /**
     * @param {Object} a
     * @param {string} name
     * @param {boolean} expectedNumberOfNonCommentArgs
     * @return {?}
     */
    _data : function(a, name, expectedNumberOfNonCommentArgs) {
      return get(a, name, expectedNumberOfNonCommentArgs, true);
    },
    /**
     * @param {Object} elem
     * @param {string} name
     * @return {?}
     */
    _removeData : function(elem, name) {
      return cb(elem, name, true);
    }
  });
  jQuery.fn.extend({
    /**
     * @param {Function} a
     * @param {Object} value
     * @return {?}
     */
    data : function(a, value) {
      var i;
      var name;
      var data;
      var QUnit = this[0];
      var types = QUnit && QUnit.attributes;
      if (void 0 === a) {
        if (this.length && (data = jQuery.data(QUnit), 1 === QUnit.nodeType && !jQuery._data(QUnit, "parsedAttrs"))) {
          i = types.length;
          for (;i--;) {
            if (types[i]) {
              name = types[i].name;
              if (0 === name.indexOf("data-")) {
                name = jQuery.camelCase(name.slice(5));
                dataAttr(QUnit, name, data[name]);
              }
            }
          }
          jQuery._data(QUnit, "parsedAttrs", true);
        }
        return data;
      }
      return "object" == typeof a ? this.each(function() {
        jQuery.data(this, a);
      }) : arguments.length > 1 ? this.each(function() {
        jQuery.data(this, a, value);
      }) : QUnit ? dataAttr(QUnit, a, jQuery.data(QUnit, a)) : void 0;
    },
    /**
     * @param {string} key
     * @return {?}
     */
    removeData : function(key) {
      return this.each(function() {
        jQuery.removeData(this, key);
      });
    }
  });
  jQuery.extend({
    /**
     * @param {Object} elem
     * @param {string} type
     * @param {?} data
     * @return {?}
     */
    queue : function(elem, type, data) {
      var queue;
      return elem ? (type = (type || "fx") + "queue", queue = jQuery._data(elem, type), data && (!queue || jQuery.isArray(data) ? queue = jQuery._data(elem, type, jQuery.makeArray(data)) : queue.push(data)), queue || []) : void 0;
    },
    /**
     * @param {string} elem
     * @param {string} type
     * @return {undefined}
     */
    dequeue : function(elem, type) {
      type = type || "fx";
      var queue = jQuery.queue(elem, type);
      var ln = queue.length;
      var fn = queue.shift();
      var hooks = jQuery._queueHooks(elem, type);
      /**
       * @return {undefined}
       */
      var next = function() {
        jQuery.dequeue(elem, type);
      };
      if ("inprogress" === fn) {
        fn = queue.shift();
        ln--;
      }
      if (fn) {
        if ("fx" === type) {
          queue.unshift("inprogress");
        }
        delete hooks.stop;
        fn.call(elem, next, hooks);
      }
      if (!ln) {
        if (hooks) {
          hooks.empty.fire();
        }
      }
    },
    /**
     * @param {Object} elem
     * @param {string} type
     * @return {?}
     */
    _queueHooks : function(elem, type) {
      /** @type {string} */
      var key = type + "queueHooks";
      return jQuery._data(elem, key) || jQuery._data(elem, key, {
        empty : jQuery.Callbacks("once memory").add(function() {
          jQuery._removeData(elem, type + "queue");
          jQuery._removeData(elem, key);
        })
      });
    }
  });
  jQuery.fn.extend({
    /**
     * @param {string} type
     * @param {string} data
     * @return {?}
     */
    queue : function(type, data) {
      /** @type {number} */
      var setter = 2;
      return "string" != typeof type && (data = type, type = "fx", setter--), arguments.length < setter ? jQuery.queue(this[0], type) : void 0 === data ? this : this.each(function() {
        var queue = jQuery.queue(this, type, data);
        jQuery._queueHooks(this, type);
        if ("fx" === type) {
          if ("inprogress" !== queue[0]) {
            jQuery.dequeue(this, type);
          }
        }
      });
    },
    /**
     * @param {string} type
     * @return {?}
     */
    dequeue : function(type) {
      return this.each(function() {
        jQuery.dequeue(this, type);
      });
    },
    /**
     * @param {string} type
     * @return {?}
     */
    clearQueue : function(type) {
      return this.queue(type || "fx", []);
    },
    /**
     * @param {string} type
     * @param {string} obj
     * @return {?}
     */
    promise : function(type, obj) {
      var body;
      /** @type {number} */
      var d = 1;
      var defer = jQuery.Deferred();
      var elements = this;
      var i = this.length;
      /**
       * @return {undefined}
       */
      var tail = function() {
        if (!--d) {
          defer.resolveWith(elements, [elements]);
        }
      };
      if ("string" != typeof type) {
        /** @type {string} */
        obj = type;
        type = void 0;
      }
      type = type || "fx";
      for (;i--;) {
        body = jQuery._data(elements[i], type + "queueHooks");
        if (body) {
          if (body.empty) {
            d++;
            body.empty.add(tail);
          }
        }
      }
      return tail(), defer.promise(obj);
    }
  });
  /** @type {string} */
  var core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
  /** @type {Array} */
  var cssExpand = ["Top", "Right", "Bottom", "Left"];
  /**
   * @param {Object} b
   * @param {Function} a
   * @return {?}
   */
  var ok = function(b, a) {
    return b = a || b, "none" === jQuery.css(b, "display") || !jQuery.contains(b.ownerDocument, b);
  };
  /** @type {function (string, Function, Function, Function, boolean, string, boolean): ?} */
  var access = jQuery.access = function(elems, fn, ok, value, chainable, emptyGet, raw) {
    /** @type {number} */
    var i = 0;
    var length = elems.length;
    /** @type {boolean} */
    var bulk = null == ok;
    if ("object" === jQuery.type(ok)) {
      /** @type {boolean} */
      chainable = true;
      for (i in ok) {
        jQuery.access(elems, fn, i, ok[i], true, emptyGet, raw);
      }
    } else {
      if (void 0 !== value && (chainable = true, jQuery.isFunction(value) || (raw = true), bulk && (raw ? (fn.call(elems, value), fn = null) : (bulk = fn, fn = function(elem, a, value) {
        return bulk.call(jQuery(elem), value);
      })), fn)) {
        for (;length > i;i++) {
          fn(elems[i], ok, raw ? value : value.call(elems[i], i, fn(elems[i], ok)));
        }
      }
    }
    return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], ok) : emptyGet;
  };
  /** @type {RegExp} */
  var manipulation_rcheckableType = /^(?:checkbox|radio)$/i;
  !function() {
    var input = doc.createElement("input");
    var div = doc.createElement("div");
    var fragment = doc.createDocumentFragment();
    if (div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", support.leadingWhitespace = 3 === div.firstChild.nodeType, support.tbody = !div.getElementsByTagName("tbody").length, support.htmlSerialize = !!div.getElementsByTagName("link").length, support.html5Clone = "<:nav></:nav>" !== doc.createElement("nav").cloneNode(true).outerHTML, input.type = "checkbox", input.checked = true, fragment.appendChild(input), support.appendChecked = input.checked, div.innerHTML = 
    "<textarea>x</textarea>", support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue, fragment.appendChild(div), div.innerHTML = "<input type='radio' checked='checked' name='t'/>", support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked, support.noCloneEvent = true, div.attachEvent && (div.attachEvent("onclick", function() {
      /** @type {boolean} */
      support.noCloneEvent = false;
    }), div.cloneNode(true).click()), null == support.deleteExpando) {
      /** @type {boolean} */
      support.deleteExpando = true;
      try {
        delete div.test;
      } catch (d) {
        /** @type {boolean} */
        support.deleteExpando = false;
      }
    }
  }();
  (function() {
    var i;
    var eventName;
    var div = doc.createElement("div");
    for (i in{
      submit : true,
      change : true,
      focusin : true
    }) {
      /** @type {string} */
      eventName = "on" + i;
      if (!(support[i + "Bubbles"] = eventName in win)) {
        div.setAttribute(eventName, "t");
        /** @type {boolean} */
        support[i + "Bubbles"] = div.attributes[eventName].expando === false;
      }
    }
    /** @type {null} */
    div = null;
  })();
  /** @type {RegExp} */
  var rformElems = /^(?:input|select|textarea)$/i;
  /** @type {RegExp} */
  var rmouseEvent = /^key/;
  /** @type {RegExp} */
  var rkeyEvent = /^(?:mouse|pointer|contextmenu)|click/;
  /** @type {RegExp} */
  var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
  /** @type {RegExp} */
  var self = /^([^.]*)(?:\.(.+)|)$/;
  jQuery.event = {
    global : {},
    /**
     * @param {Object} a
     * @param {Object} val
     * @param {Function} handler
     * @param {Object} node
     * @param {Object} selector
     * @return {undefined}
     */
    add : function(a, val, handler, node, selector) {
      var segmentMatch;
      var events;
      var n;
      var handleObjIn;
      var special;
      var eventHandle;
      var handleObj;
      var handlers;
      var type;
      var namespaces;
      var origType;
      var elemData = jQuery._data(a);
      if (elemData) {
        if (handler.handler) {
          /** @type {Function} */
          handleObjIn = handler;
          handler = handleObjIn.handler;
          selector = handleObjIn.selector;
        }
        if (!handler.guid) {
          /** @type {number} */
          handler.guid = jQuery.guid++;
        }
        if (!(events = elemData.events)) {
          events = elemData.events = {};
        }
        if (!(eventHandle = elemData.handle)) {
          /** @type {function (Object): ?} */
          eventHandle = elemData.handle = function(event) {
            return typeof jQuery === text || event && jQuery.event.triggered === event.type ? void 0 : jQuery.event.dispatch.apply(eventHandle.elem, arguments);
          };
          /** @type {Object} */
          eventHandle.elem = a;
        }
        val = (val || "").match(core_rnotwhite) || [""];
        n = val.length;
        for (;n--;) {
          /** @type {Array} */
          segmentMatch = self.exec(val[n]) || [];
          type = origType = segmentMatch[1];
          namespaces = (segmentMatch[2] || "").split(".").sort();
          if (type) {
            special = jQuery.event.special[type] || {};
            type = (selector ? special.delegateType : special.bindType) || type;
            special = jQuery.event.special[type] || {};
            handleObj = jQuery.extend({
              type : type,
              origType : origType,
              data : node,
              /** @type {Function} */
              handler : handler,
              guid : handler.guid,
              selector : selector,
              needsContext : selector && jQuery.expr.match.needsContext.test(selector),
              namespace : namespaces.join(".")
            }, handleObjIn);
            if (!(handlers = events[type])) {
              /** @type {Array} */
              handlers = events[type] = [];
              /** @type {number} */
              handlers.delegateCount = 0;
              if (!(special.setup && special.setup.call(a, node, namespaces, eventHandle) !== false)) {
                if (a.addEventListener) {
                  a.addEventListener(type, eventHandle, false);
                } else {
                  if (a.attachEvent) {
                    a.attachEvent("on" + type, eventHandle);
                  }
                }
              }
            }
            if (special.add) {
              special.add.call(a, handleObj);
              if (!handleObj.handler.guid) {
                handleObj.handler.guid = handler.guid;
              }
            }
            if (selector) {
              handlers.splice(handlers.delegateCount++, 0, handleObj);
            } else {
              handlers.push(handleObj);
            }
            /** @type {boolean} */
            jQuery.event.global[type] = true;
          }
        }
        /** @type {null} */
        a = null;
      }
    },
    /**
     * @param {Object} a
     * @param {Object} val
     * @param {Function} handler
     * @param {string} selector
     * @param {boolean} keepData
     * @return {undefined}
     */
    remove : function(a, val, handler, selector, keepData) {
      var j;
      var handleObj;
      var tmp;
      var origCount;
      var n;
      var events;
      var special;
      var handlers;
      var type;
      var header;
      var origType;
      var elemData = jQuery.hasData(a) && jQuery._data(a);
      if (elemData && (events = elemData.events)) {
        val = (val || "").match(core_rnotwhite) || [""];
        n = val.length;
        for (;n--;) {
          if (tmp = self.exec(val[n]) || [], type = origType = tmp[1], header = (tmp[2] || "").split(".").sort(), type) {
            special = jQuery.event.special[type] || {};
            type = (selector ? special.delegateType : special.bindType) || type;
            handlers = events[type] || [];
            tmp = tmp[2] && new RegExp("(^|\\.)" + header.join("\\.(?:.*\\.|)") + "(\\.|$)");
            origCount = j = handlers.length;
            for (;j--;) {
              handleObj = handlers[j];
              if (!(!keepData && origType !== handleObj.origType)) {
                if (!(handler && handler.guid !== handleObj.guid)) {
                  if (!(tmp && !tmp.test(handleObj.namespace))) {
                    if (!(selector && (selector !== handleObj.selector && ("**" !== selector || !handleObj.selector)))) {
                      handlers.splice(j, 1);
                      if (handleObj.selector) {
                        handlers.delegateCount--;
                      }
                      if (special.remove) {
                        special.remove.call(a, handleObj);
                      }
                    }
                  }
                }
              }
            }
            if (origCount) {
              if (!handlers.length) {
                if (!(special.teardown && special.teardown.call(a, header, elemData.handle) !== false)) {
                  jQuery.removeEvent(a, type, elemData.handle);
                }
                delete events[type];
              }
            }
          } else {
            for (type in events) {
              jQuery.event.remove(a, type + val[n], handler, selector, true);
            }
          }
        }
        if (jQuery.isEmptyObject(events)) {
          delete elemData.handle;
          jQuery._removeData(a, "events");
        }
      }
    },
    /**
     * @param {Object} event
     * @param {Object} a
     * @param {Object} object
     * @param {boolean} expr
     * @return {?}
     */
    trigger : function(event, a, object, expr) {
      var handle;
      var ontype;
      var cur;
      var bubbleType;
      var special;
      var tmp;
      var i;
      /** @type {Array} */
      var eventPath = [object || doc];
      var type = core_hasOwn.call(event, "type") ? event.type : event;
      var namespaces = core_hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
      if (cur = tmp = object = object || doc, 3 !== object.nodeType && (8 !== object.nodeType && (!rfocusMorph.test(type + jQuery.event.triggered) && (type.indexOf(".") >= 0 && (namespaces = type.split("."), type = namespaces.shift(), namespaces.sort()), ontype = type.indexOf(":") < 0 && "on" + type, event = event[jQuery.expando] ? event : new jQuery.Event(type, "object" == typeof event && event), event.isTrigger = expr ? 2 : 3, event.namespace = namespaces.join("."), event.namespace_re = event.namespace ? 
      new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, event.result = void 0, event.target || (event.target = object), a = null == a ? [event] : jQuery.makeArray(a, [event]), special = jQuery.event.special[type] || {}, expr || (!special.trigger || special.trigger.apply(object, a) !== false))))) {
        if (!expr && (!special.noBubble && !jQuery.isWindow(object))) {
          bubbleType = special.delegateType || type;
          if (!rfocusMorph.test(bubbleType + type)) {
            cur = cur.parentNode;
          }
          for (;cur;cur = cur.parentNode) {
            eventPath.push(cur);
            tmp = cur;
          }
          if (tmp === (object.ownerDocument || doc)) {
            eventPath.push(tmp.defaultView || (tmp.parentWindow || win));
          }
        }
        /** @type {number} */
        i = 0;
        for (;(cur = eventPath[i++]) && !event.isPropagationStopped();) {
          event.type = i > 1 ? bubbleType : special.bindType || type;
          handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
          if (handle) {
            handle.apply(cur, a);
          }
          handle = ontype && cur[ontype];
          if (handle) {
            if (handle.apply) {
              if (jQuery.acceptData(cur)) {
                event.result = handle.apply(cur, a);
                if (event.result === false) {
                  event.preventDefault();
                }
              }
            }
          }
        }
        if (event.type = type, !expr && (!event.isDefaultPrevented() && ((!special._default || special._default.apply(eventPath.pop(), a) === false) && (jQuery.acceptData(object) && (ontype && (object[type] && !jQuery.isWindow(object))))))) {
          tmp = object[ontype];
          if (tmp) {
            /** @type {null} */
            object[ontype] = null;
          }
          jQuery.event.triggered = type;
          try {
            object[type]();
          } catch (p) {
          }
          jQuery.event.triggered = void 0;
          if (tmp) {
            object[ontype] = tmp;
          }
        }
        return event.result;
      }
    },
    /**
     * @param {Object} event
     * @return {?}
     */
    dispatch : function(event) {
      event = jQuery.event.fix(event);
      var i;
      var ret;
      var handleObj;
      var matched;
      var j;
      /** @type {Array} */
      var handlerQueue = [];
      /** @type {Array.<?>} */
      var args = core_slice.call(arguments);
      var handlers = (jQuery._data(this, "events") || {})[event.type] || [];
      var special = jQuery.event.special[event.type] || {};
      if (args[0] = event, event.delegateTarget = this, !special.preDispatch || special.preDispatch.call(this, event) !== false) {
        handlerQueue = jQuery.event.handlers.call(this, event, handlers);
        /** @type {number} */
        i = 0;
        for (;(matched = handlerQueue[i++]) && !event.isPropagationStopped();) {
          event.currentTarget = matched.elem;
          /** @type {number} */
          j = 0;
          for (;(handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped();) {
            if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
              event.handleObj = handleObj;
              event.data = handleObj.data;
              ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
              if (void 0 !== ret) {
                if ((event.result = ret) === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            }
          }
        }
        return special.postDispatch && special.postDispatch.call(this, event), event.result;
      }
    },
    /**
     * @param {Event} event
     * @param {Object} handlers
     * @return {?}
     */
    handlers : function(event, handlers) {
      var sel;
      var handleObj;
      var matches;
      var j;
      /** @type {Array} */
      var handlerQueue = [];
      var delegateCount = handlers.delegateCount;
      var cur = event.target;
      if (delegateCount && (cur.nodeType && (!event.button || "click" !== event.type))) {
        for (;cur != this;cur = cur.parentNode || this) {
          if (1 === cur.nodeType && (cur.disabled !== true || "click" !== event.type)) {
            /** @type {Array} */
            matches = [];
            /** @type {number} */
            j = 0;
            for (;delegateCount > j;j++) {
              handleObj = handlers[j];
              /** @type {string} */
              sel = handleObj.selector + " ";
              if (void 0 === matches[sel]) {
                matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
              }
              if (matches[sel]) {
                matches.push(handleObj);
              }
            }
            if (matches.length) {
              handlerQueue.push({
                elem : cur,
                handlers : matches
              });
            }
          }
        }
      }
      return delegateCount < handlers.length && handlerQueue.push({
        elem : this,
        handlers : handlers.slice(delegateCount)
      }), handlerQueue;
    },
    /**
     * @param {Object} exports
     * @return {?}
     */
    fix : function(exports) {
      if (exports[jQuery.expando]) {
        return exports;
      }
      var i;
      var prop;
      var copy;
      var type = exports.type;
      /** @type {Object} */
      var optgroup = exports;
      var fixHook = this.fixHooks[type];
      if (!fixHook) {
        this.fixHooks[type] = fixHook = rkeyEvent.test(type) ? this.mouseHooks : rmouseEvent.test(type) ? this.keyHooks : {};
      }
      copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
      exports = new jQuery.Event(optgroup);
      i = copy.length;
      for (;i--;) {
        prop = copy[i];
        exports[prop] = optgroup[prop];
      }
      return exports.target || (exports.target = optgroup.srcElement || doc), 3 === exports.target.nodeType && (exports.target = exports.target.parentNode), exports.metaKey = !!exports.metaKey, fixHook.filter ? fixHook.filter(exports, optgroup) : exports;
    },
    props : "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
    fixHooks : {},
    keyHooks : {
      props : "char charCode key keyCode".split(" "),
      /**
       * @param {Function} a
       * @param {Object} name
       * @return {?}
       */
      filter : function(a, name) {
        return null == a.which && (a.which = null != name.charCode ? name.charCode : name.keyCode), a;
      }
    },
    mouseHooks : {
      props : "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
      /**
       * @param {Function} a
       * @param {Object} name
       * @return {?}
       */
      filter : function(a, name) {
        var b;
        var d;
        var de;
        var old = name.button;
        var fromElement = name.fromElement;
        return null == a.pageX && (null != name.clientX && (d = a.target.ownerDocument || doc, de = d.documentElement, b = d.body, a.pageX = name.clientX + (de && de.scrollLeft || (b && b.scrollLeft || 0)) - (de && de.clientLeft || (b && b.clientLeft || 0)), a.pageY = name.clientY + (de && de.scrollTop || (b && b.scrollTop || 0)) - (de && de.clientTop || (b && b.clientTop || 0)))), !a.relatedTarget && (fromElement && (a.relatedTarget = fromElement === a.target ? name.toElement : fromElement)), a.which || 
        (void 0 === old || (a.which = 1 & old ? 1 : 2 & old ? 3 : 4 & old ? 2 : 0)), a;
      }
    },
    special : {
      load : {
        noBubble : true
      },
      focus : {
        /**
         * @return {?}
         */
        trigger : function() {
          if (this !== safeActiveElement() && this.focus) {
            try {
              return this.focus(), false;
            } catch (a) {
            }
          }
        },
        delegateType : "focusin"
      },
      blur : {
        /**
         * @return {?}
         */
        trigger : function() {
          return this === safeActiveElement() && this.blur ? (this.blur(), false) : void 0;
        },
        delegateType : "focusout"
      },
      click : {
        /**
         * @return {?}
         */
        trigger : function() {
          return jQuery.nodeName(this, "input") && ("checkbox" === this.type && this.click) ? (this.click(), false) : void 0;
        },
        /**
         * @param {Object} a
         * @return {?}
         */
        _default : function(a) {
          return jQuery.nodeName(a.target, "a");
        }
      },
      beforeunload : {
        /**
         * @param {Object} event
         * @return {undefined}
         */
        postDispatch : function(event) {
          if (void 0 !== event.result) {
            if (event.originalEvent) {
              event.originalEvent.returnValue = event.result;
            }
          }
        }
      }
    },
    /**
     * @param {string} type
     * @param {string} elem
     * @param {Event} event
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    simulate : function(type, elem, event, dataAndEvents) {
      var e = jQuery.extend(new jQuery.Event, event, {
        type : type,
        isSimulated : true,
        originalEvent : {}
      });
      if (dataAndEvents) {
        jQuery.event.trigger(e, null, elem);
      } else {
        jQuery.event.dispatch.call(elem, e);
      }
      if (e.isDefaultPrevented()) {
        event.preventDefault();
      }
    }
  };
  /** @type {function (Object, ?, ?): undefined} */
  jQuery.removeEvent = doc.removeEventListener ? function(elem, type, handle) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, handle, false);
    }
  } : function(elem, keepData, listener) {
    /** @type {string} */
    var type = "on" + keepData;
    if (elem.detachEvent) {
      if (typeof elem[type] === text) {
        /** @type {null} */
        elem[type] = null;
      }
      elem.detachEvent(type, listener);
    }
  };
  /**
   * @param {Object} src
   * @param {boolean} props
   * @return {?}
   */
  jQuery.Event = function(src, props) {
    return this instanceof jQuery.Event ? (src && src.type ? (this.originalEvent = src, this.type = src.type, this.isDefaultPrevented = src.defaultPrevented || void 0 === src.defaultPrevented && src.returnValue === false ? returnTrue : returnFalse) : this.type = src, props && jQuery.extend(this, props), this.timeStamp = src && src.timeStamp || jQuery.now(), void(this[jQuery.expando] = true)) : new jQuery.Event(src, props);
  };
  jQuery.Event.prototype = {
    /** @type {function (): ?} */
    isDefaultPrevented : returnFalse,
    /** @type {function (): ?} */
    isPropagationStopped : returnFalse,
    /** @type {function (): ?} */
    isImmediatePropagationStopped : returnFalse,
    /**
     * @return {undefined}
     */
    preventDefault : function() {
      var e = this.originalEvent;
      /** @type {function (): ?} */
      this.isDefaultPrevented = returnTrue;
      if (e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          /** @type {boolean} */
          e.returnValue = false;
        }
      }
    },
    /**
     * @return {undefined}
     */
    stopPropagation : function() {
      var e = this.originalEvent;
      /** @type {function (): ?} */
      this.isPropagationStopped = returnTrue;
      if (e) {
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        /** @type {boolean} */
        e.cancelBubble = true;
      }
    },
    /**
     * @return {undefined}
     */
    stopImmediatePropagation : function() {
      var e = this.originalEvent;
      /** @type {function (): ?} */
      this.isImmediatePropagationStopped = returnTrue;
      if (e) {
        if (e.stopImmediatePropagation) {
          e.stopImmediatePropagation();
        }
      }
      this.stopPropagation();
    }
  };
  jQuery.each({
    mouseenter : "mouseover",
    mouseleave : "mouseout",
    pointerenter : "pointerover",
    pointerleave : "pointerout"
  }, function(orig, fix) {
    jQuery.event.special[orig] = {
      delegateType : fix,
      bindType : fix,
      /**
       * @param {Object} event
       * @return {?}
       */
      handle : function(event) {
        var returnValue;
        var target = this;
        var related = event.relatedTarget;
        var handleObj = event.handleObj;
        return(!related || related !== target && !jQuery.contains(target, related)) && (event.type = handleObj.origType, returnValue = handleObj.handler.apply(this, arguments), event.type = fix), returnValue;
      }
    };
  });
  if (!support.submitBubbles) {
    jQuery.event.special.submit = {
      /**
       * @return {?}
       */
      setup : function() {
        return jQuery.nodeName(this, "form") ? false : void jQuery.event.add(this, "click._submit keypress._submit", function(e) {
          var elem = e.target;
          var QUnit = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : void 0;
          if (QUnit) {
            if (!jQuery._data(QUnit, "submitBubbles")) {
              jQuery.event.add(QUnit, "submit._submit", function(event) {
                /** @type {boolean} */
                event._submit_bubble = true;
              });
              jQuery._data(QUnit, "submitBubbles", true);
            }
          }
        });
      },
      /**
       * @param {Event} event
       * @return {undefined}
       */
      postDispatch : function(event) {
        if (event._submit_bubble) {
          delete event._submit_bubble;
          if (this.parentNode) {
            if (!event.isTrigger) {
              jQuery.event.simulate("submit", this.parentNode, event, true);
            }
          }
        }
      },
      /**
       * @return {?}
       */
      teardown : function() {
        return jQuery.nodeName(this, "form") ? false : void jQuery.event.remove(this, "._submit");
      }
    };
  }
  if (!support.changeBubbles) {
    jQuery.event.special.change = {
      /**
       * @return {?}
       */
      setup : function() {
        return rformElems.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (jQuery.event.add(this, "propertychange._change", function(event) {
          if ("checked" === event.originalEvent.propertyName) {
            /** @type {boolean} */
            this._just_changed = true;
          }
        }), jQuery.event.add(this, "click._change", function(event) {
          if (this._just_changed) {
            if (!event.isTrigger) {
              /** @type {boolean} */
              this._just_changed = false;
            }
          }
          jQuery.event.simulate("change", this, event, true);
        })), false) : void jQuery.event.add(this, "beforeactivate._change", function(opt_e) {
          var tail = opt_e.target;
          if (rformElems.test(tail.nodeName)) {
            if (!jQuery._data(tail, "changeBubbles")) {
              jQuery.event.add(tail, "change._change", function(event) {
                if (!!this.parentNode) {
                  if (!event.isSimulated) {
                    if (!event.isTrigger) {
                      jQuery.event.simulate("change", this.parentNode, event, true);
                    }
                  }
                }
              });
              jQuery._data(tail, "changeBubbles", true);
            }
          }
        });
      },
      /**
       * @param {Object} event
       * @return {?}
       */
      handle : function(event) {
        var current = event.target;
        return this !== current || (event.isSimulated || (event.isTrigger || "radio" !== current.type && "checkbox" !== current.type)) ? event.handleObj.handler.apply(this, arguments) : void 0;
      },
      /**
       * @return {?}
       */
      teardown : function() {
        return jQuery.event.remove(this, "._change"), !rformElems.test(this.nodeName);
      }
    };
  }
  if (!support.focusinBubbles) {
    jQuery.each({
      focus : "focusin",
      blur : "focusout"
    }, function(orig, name) {
      /**
       * @param {Object} event
       * @return {undefined}
       */
      var handler = function(event) {
        jQuery.event.simulate(name, event.target, jQuery.event.fix(event), true);
      };
      jQuery.event.special[name] = {
        /**
         * @return {undefined}
         */
        setup : function() {
          var doc = this.ownerDocument || this;
          var win = jQuery._data(doc, name);
          if (!win) {
            doc.addEventListener(orig, handler, true);
          }
          jQuery._data(doc, name, (win || 0) + 1);
        },
        /**
         * @return {undefined}
         */
        teardown : function() {
          var node = this.ownerDocument || this;
          /** @type {number} */
          var value = jQuery._data(node, name) - 1;
          if (value) {
            jQuery._data(node, name, value);
          } else {
            node.removeEventListener(orig, handler, true);
            jQuery._removeData(node, name);
          }
        }
      };
    });
  }
  jQuery.fn.extend({
    /**
     * @param {string} name
     * @param {Object} selector
     * @param {Object} data
     * @param {Object} fn
     * @param {number} expectedNumberOfNonCommentArgs
     * @return {?}
     */
    on : function(name, selector, data, fn, expectedNumberOfNonCommentArgs) {
      var key;
      var origFn;
      if ("object" == typeof name) {
        if ("string" != typeof selector) {
          data = data || selector;
          selector = void 0;
        }
        for (key in name) {
          this.on(key, selector, data, name[key], expectedNumberOfNonCommentArgs);
        }
        return this;
      }
      if (null == data && null == fn ? (fn = selector, data = selector = void 0) : null == fn && ("string" == typeof selector ? (fn = data, data = void 0) : (fn = data, data = selector, selector = void 0)), fn === false) {
        /** @type {function (): ?} */
        fn = returnFalse;
      } else {
        if (!fn) {
          return this;
        }
      }
      return 1 === expectedNumberOfNonCommentArgs && (origFn = fn, fn = function(event) {
        return jQuery().off(event), origFn.apply(this, arguments);
      }, fn.guid = origFn.guid || (origFn.guid = jQuery.guid++)), this.each(function() {
        jQuery.event.add(this, name, fn, data, selector);
      });
    },
    /**
     * @param {string} name
     * @param {Function} selector
     * @param {Object} data
     * @param {Object} fn
     * @return {?}
     */
    one : function(name, selector, data, fn) {
      return this.on(name, selector, data, fn, 1);
    },
    /**
     * @param {Object} types
     * @param {Object} selector
     * @param {Object} fn
     * @return {?}
     */
    off : function(types, selector, fn) {
      var handleObj;
      var type;
      if (types && (types.preventDefault && types.handleObj)) {
        return handleObj = types.handleObj, jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler), this;
      }
      if ("object" == typeof types) {
        for (type in types) {
          this.off(type, selector, types[type]);
        }
        return this;
      }
      return(selector === false || "function" == typeof selector) && (fn = selector, selector = void 0), fn === false && (fn = returnFalse), this.each(function() {
        jQuery.event.remove(this, types, fn, selector);
      });
    },
    /**
     * @param {string} type
     * @param {Object} a
     * @return {?}
     */
    trigger : function(type, a) {
      return this.each(function() {
        jQuery.event.trigger(type, a, this);
      });
    },
    /**
     * @param {string} type
     * @param {Object} args
     * @return {?}
     */
    triggerHandler : function(type, args) {
      var callback = this[0];
      return callback ? jQuery.event.trigger(type, args, callback, true) : void 0;
    }
  });
  /** @type {string} */
  var uHostName = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video";
  /** @type {RegExp} */
  var normalizr = / jQuery\d+="(?:null|\d+)"/g;
  /** @type {RegExp} */
  var regexp = new RegExp("<(?:" + uHostName + ")[\\s/>]", "i");
  /** @type {RegExp} */
  var rtagName = /^\s+/;
  /** @type {RegExp} */
  var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
  /** @type {RegExp} */
  var matches = /<([\w:]+)/;
  /** @type {RegExp} */
  var rhtml = /<tbody/i;
  /** @type {RegExp} */
  var selector = /<|&#?\w+;/;
  /** @type {RegExp} */
  var rRadial = /<(?:script|style|link)/i;
  /** @type {RegExp} */
  var BEGIN_TAG_REGEXP = /checked\s*(?:[^=]|=\s*.checked.)/i;
  /** @type {RegExp} */
  var stopParent = /^$|\/(?:java|ecma)script/i;
  /** @type {RegExp} */
  var rscriptTypeMasked = /^true\/(.*)/;
  /** @type {RegExp} */
  var rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
  var wrapMap = {
    option : [1, "<select multiple='multiple'>", "</select>"],
    legend : [1, "<fieldset>", "</fieldset>"],
    area : [1, "<map>", "</map>"],
    param : [1, "<object>", "</object>"],
    thead : [1, "<table>", "</table>"],
    tr : [2, "<table><tbody>", "</tbody></table>"],
    col : [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
    td : [3, "<table><tbody><tr>", "</tr></tbody></table>"],
    _default : support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
  };
  var el = t(doc);
  var fragmentDiv = el.appendChild(doc.createElement("div"));
  /** @type {Array} */
  wrapMap.optgroup = wrapMap.option;
  /** @type {Array} */
  wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
  /** @type {Array} */
  wrapMap.th = wrapMap.td;
  jQuery.extend({
    /**
     * @param {Object} node
     * @param {boolean} dataAndEvents
     * @param {boolean} deepDataAndEvents
     * @return {?}
     */
    clone : function(node, dataAndEvents, deepDataAndEvents) {
      var destElements;
      var elem;
      var clone;
      var i;
      var tmp;
      var inPage = jQuery.contains(node.ownerDocument, node);
      if (support.html5Clone || (jQuery.isXMLDoc(node) || !regexp.test("<" + node.nodeName + ">")) ? clone = node.cloneNode(true) : (fragmentDiv.innerHTML = node.outerHTML, fragmentDiv.removeChild(clone = fragmentDiv.firstChild)), !(support.noCloneEvent && support.noCloneChecked || (1 !== node.nodeType && 11 !== node.nodeType || jQuery.isXMLDoc(node)))) {
        destElements = getAll(clone);
        tmp = getAll(node);
        /** @type {number} */
        i = 0;
        for (;null != (elem = tmp[i]);++i) {
          if (destElements[i]) {
            cloneFixAttributes(elem, destElements[i]);
          }
        }
      }
      if (dataAndEvents) {
        if (deepDataAndEvents) {
          tmp = tmp || getAll(node);
          destElements = destElements || getAll(clone);
          /** @type {number} */
          i = 0;
          for (;null != (elem = tmp[i]);i++) {
            cloneCopyEvent(elem, destElements[i]);
          }
        } else {
          cloneCopyEvent(node, clone);
        }
      }
      return destElements = getAll(clone, "script"), destElements.length > 0 && setGlobalEval(destElements, !inPage && getAll(node, "script")), destElements = tmp = elem = null, clone;
    },
    /**
     * @param {Array} elems
     * @param {Document} context
     * @param {boolean} scripts
     * @param {Object} selection
     * @return {?}
     */
    buildFragment : function(elems, context, scripts, selection) {
      var j;
      var elem;
      var contains;
      var tmp;
      var tag;
      var tbody;
      var wrap;
      var l = elems.length;
      var safe = t(context);
      /** @type {Array} */
      var nodes = [];
      /** @type {number} */
      var i = 0;
      for (;l > i;i++) {
        if (elem = elems[i], elem || 0 === elem) {
          if ("object" === jQuery.type(elem)) {
            jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
          } else {
            if (selector.test(elem)) {
              tmp = tmp || safe.appendChild(context.createElement("div"));
              tag = (matches.exec(elem) || ["", ""])[1].toLowerCase();
              wrap = wrapMap[tag] || wrapMap._default;
              tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
              j = wrap[0];
              for (;j--;) {
                tmp = tmp.lastChild;
              }
              if (!support.leadingWhitespace && (rtagName.test(elem) && nodes.push(context.createTextNode(rtagName.exec(elem)[0]))), !support.tbody) {
                elem = "table" !== tag || rhtml.test(elem) ? "<table>" !== wrap[1] || rhtml.test(elem) ? 0 : tmp : tmp.firstChild;
                j = elem && elem.childNodes.length;
                for (;j--;) {
                  if (jQuery.nodeName(tbody = elem.childNodes[j], "tbody")) {
                    if (!tbody.childNodes.length) {
                      elem.removeChild(tbody);
                    }
                  }
                }
              }
              jQuery.merge(nodes, tmp.childNodes);
              /** @type {string} */
              tmp.textContent = "";
              for (;tmp.firstChild;) {
                tmp.removeChild(tmp.firstChild);
              }
              tmp = safe.lastChild;
            } else {
              nodes.push(context.createTextNode(elem));
            }
          }
        }
      }
      if (tmp) {
        safe.removeChild(tmp);
      }
      if (!support.appendChecked) {
        jQuery.grep(getAll(nodes, "input"), callback);
      }
      /** @type {number} */
      i = 0;
      for (;elem = nodes[i++];) {
        if ((!selection || -1 === jQuery.inArray(elem, selection)) && (contains = jQuery.contains(elem.ownerDocument, elem), tmp = getAll(safe.appendChild(elem), "script"), contains && setGlobalEval(tmp), scripts)) {
          /** @type {number} */
          j = 0;
          for (;elem = tmp[j++];) {
            if (stopParent.test(elem.type || "")) {
              scripts.push(elem);
            }
          }
        }
      }
      return tmp = null, safe;
    },
    /**
     * @param {Array} elems
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    cleanData : function(elems, dataAndEvents) {
      var elem;
      var type;
      var id;
      var data;
      /** @type {number} */
      var i = 0;
      var expando = jQuery.expando;
      var cache = jQuery.cache;
      /** @type {boolean} */
      var deleteExpando = support.deleteExpando;
      var special = jQuery.event.special;
      for (;null != (elem = elems[i]);i++) {
        if ((dataAndEvents || jQuery.acceptData(elem)) && (id = elem[expando], data = id && cache[id])) {
          if (data.events) {
            for (type in data.events) {
              if (special[type]) {
                jQuery.event.remove(elem, type);
              } else {
                jQuery.removeEvent(elem, type, data.handle);
              }
            }
          }
          if (cache[id]) {
            delete cache[id];
            if (deleteExpando) {
              delete elem[expando];
            } else {
              if (typeof elem.removeAttribute !== text) {
                elem.removeAttribute(expando);
              } else {
                /** @type {null} */
                elem[expando] = null;
              }
            }
            core_deletedIds.push(id);
          }
        }
      }
    }
  });
  jQuery.fn.extend({
    /**
     * @param {Function} a
     * @return {?}
     */
    text : function(a) {
      return access(this, function(text) {
        return void 0 === text ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || doc).createTextNode(text));
      }, null, a, arguments.length);
    },
    /**
     * @return {?}
     */
    append : function() {
      return this.domManip(arguments, function(elem) {
        if (1 === this.nodeType || (11 === this.nodeType || 9 === this.nodeType)) {
          var target = manipulationTarget(this, elem);
          target.appendChild(elem);
        }
      });
    },
    /**
     * @return {?}
     */
    prepend : function() {
      return this.domManip(arguments, function(elem) {
        if (1 === this.nodeType || (11 === this.nodeType || 9 === this.nodeType)) {
          var target = manipulationTarget(this, elem);
          target.insertBefore(elem, target.firstChild);
        }
      });
    },
    /**
     * @return {?}
     */
    before : function() {
      return this.domManip(arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this);
        }
      });
    },
    /**
     * @return {?}
     */
    after : function() {
      return this.domManip(arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this.nextSibling);
        }
      });
    },
    /**
     * @param {Object} a
     * @param {string} val
     * @return {?}
     */
    remove : function(a, val) {
      var node;
      var b = a ? jQuery.filter(a, this) : this;
      /** @type {number} */
      var attribute = 0;
      for (;null != (node = b[attribute]);attribute++) {
        if (!val) {
          if (!(1 !== node.nodeType)) {
            jQuery.cleanData(getAll(node));
          }
        }
        if (node.parentNode) {
          if (val) {
            if (jQuery.contains(node.ownerDocument, node)) {
              setGlobalEval(getAll(node, "script"));
            }
          }
          node.parentNode.removeChild(node);
        }
      }
      return this;
    },
    /**
     * @return {?}
     */
    empty : function() {
      var elem;
      /** @type {number} */
      var unlock = 0;
      for (;null != (elem = this[unlock]);unlock++) {
        if (1 === elem.nodeType) {
          jQuery.cleanData(getAll(elem, false));
        }
        for (;elem.firstChild;) {
          elem.removeChild(elem.firstChild);
        }
        if (elem.options) {
          if (jQuery.nodeName(elem, "select")) {
            /** @type {number} */
            elem.options.length = 0;
          }
        }
      }
      return this;
    },
    /**
     * @param {boolean} dataAndEvents
     * @param {boolean} deepDataAndEvents
     * @return {?}
     */
    clone : function(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents = null == dataAndEvents ? false : dataAndEvents, deepDataAndEvents = null == deepDataAndEvents ? dataAndEvents : deepDataAndEvents, this.map(function() {
        return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
      });
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    html : function(a) {
      return access(this, function(value) {
        var elem = this[0] || {};
        /** @type {number} */
        var i = 0;
        var l = this.length;
        if (void 0 === value) {
          return 1 === elem.nodeType ? elem.innerHTML.replace(normalizr, "") : void 0;
        }
        if (!("string" != typeof value || (rRadial.test(value) || (!support.htmlSerialize && regexp.test(value) || (!support.leadingWhitespace && rtagName.test(value) || wrapMap[(matches.exec(value) || ["", ""])[1].toLowerCase()]))))) {
          /** @type {string} */
          value = value.replace(rxhtmlTag, "<$1></$2>");
          try {
            for (;l > i;i++) {
              elem = this[i] || {};
              if (1 === elem.nodeType) {
                jQuery.cleanData(getAll(elem, false));
                /** @type {string} */
                elem.innerHTML = value;
              }
            }
            /** @type {number} */
            elem = 0;
          } catch (e) {
          }
        }
        if (elem) {
          this.empty().append(value);
        }
      }, null, a, arguments.length);
    },
    /**
     * @return {?}
     */
    replaceWith : function() {
      var arg = arguments[0];
      return this.domManip(arguments, function(s) {
        arg = this.parentNode;
        jQuery.cleanData(getAll(this));
        if (arg) {
          arg.replaceChild(s, this);
        }
      }), arg && (arg.length || arg.nodeType) ? this : this.remove();
    },
    /**
     * @param {Object} exports
     * @return {?}
     */
    detach : function(exports) {
      return this.remove(exports, true);
    },
    /**
     * @param {Object} args
     * @param {Function} callback
     * @return {?}
     */
    domManip : function(args, callback) {
      /** @type {Array} */
      args = core_concat.apply([], args);
      var first;
      var node;
      var _len;
      var scripts;
      var doc;
      var fragment;
      /** @type {number} */
      var i = 0;
      var l = this.length;
      var set = this;
      /** @type {number} */
      var iNoClone = l - 1;
      var html = args[0];
      var isFunction = jQuery.isFunction(html);
      if (isFunction || l > 1 && ("string" == typeof html && (!support.checkClone && BEGIN_TAG_REGEXP.test(html)))) {
        return this.each(function(index) {
          var self = set.eq(index);
          if (isFunction) {
            args[0] = html.call(this, index, self.html());
          }
          self.domManip(args, callback);
        });
      }
      if (l && (fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this), first = fragment.firstChild, 1 === fragment.childNodes.length && (fragment = first), first)) {
        scripts = jQuery.map(getAll(fragment, "script"), restoreScript);
        _len = scripts.length;
        for (;l > i;i++) {
          node = fragment;
          if (i !== iNoClone) {
            node = jQuery.clone(node, true, true);
            if (_len) {
              jQuery.merge(scripts, getAll(node, "script"));
            }
          }
          callback.call(this[i], node, i);
        }
        if (_len) {
          doc = scripts[scripts.length - 1].ownerDocument;
          jQuery.map(scripts, fn);
          /** @type {number} */
          i = 0;
          for (;_len > i;i++) {
            node = scripts[i];
            if (stopParent.test(node.type || "")) {
              if (!jQuery._data(node, "globalEval")) {
                if (jQuery.contains(doc, node)) {
                  if (node.src) {
                    if (jQuery._evalUrl) {
                      jQuery._evalUrl(node.src);
                    }
                  } else {
                    jQuery.globalEval((node.text || (node.textContent || (node.innerHTML || ""))).replace(rcleanScript, ""));
                  }
                }
              }
            }
          }
        }
        /** @type {null} */
        fragment = first = null;
      }
      return this;
    }
  });
  jQuery.each({
    appendTo : "append",
    prependTo : "prepend",
    insertBefore : "before",
    insertAfter : "after",
    replaceAll : "replaceWith"
  }, function(original, method) {
    /**
     * @param {string} scripts
     * @return {?}
     */
    jQuery.fn[original] = function(scripts) {
      var resp;
      /** @type {number} */
      var i = 0;
      /** @type {Array} */
      var ret = [];
      var insert = jQuery(scripts);
      /** @type {number} */
      var segments = insert.length - 1;
      for (;segments >= i;i++) {
        resp = i === segments ? this : this.clone(true);
        jQuery(insert[i])[method](resp);
        core_push.apply(ret, resp.get());
      }
      return this.pushStack(ret);
    };
  });
  var iframe;
  var elemdisplay = {};
  !function() {
    var shrinkWrapBlocks;
    /**
     * @return {?}
     */
    support.shrinkWrapBlocks = function() {
      if (null != shrinkWrapBlocks) {
        return shrinkWrapBlocks;
      }
      /** @type {boolean} */
      shrinkWrapBlocks = false;
      var div;
      var target;
      var container;
      return target = doc.getElementsByTagName("body")[0], target && target.style ? (div = doc.createElement("div"), container = doc.createElement("div"), container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", target.appendChild(container).appendChild(div), typeof div.style.zoom !== text && (div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1", div.appendChild(doc.createElement("div")).style.width = 
      "5px", shrinkWrapBlocks = 3 !== div.offsetWidth), target.removeChild(container), shrinkWrapBlocks) : void 0;
    };
  }();
  var getStyles;
  var curCSS;
  /** @type {RegExp} */
  var rparentsprev = /^margin/;
  /** @type {RegExp} */
  var rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i");
  /** @type {RegExp} */
  var IDENTIFIER = /^(top|right|bottom|left)$/;
  if (win.getComputedStyle) {
    /**
     * @param {Object} a
     * @return {?}
     */
    getStyles = function(a) {
      return a.ownerDocument.defaultView.opener ? a.ownerDocument.defaultView.getComputedStyle(a, null) : win.getComputedStyle(a, null);
    };
    /**
     * @param {Function} QUnit
     * @param {Object} name
     * @param {Object} computed
     * @return {?}
     */
    curCSS = function(QUnit, name, computed) {
      var width;
      var minWidth;
      var maxWidth;
      var ret;
      var style = QUnit.style;
      return computed = computed || getStyles(QUnit), ret = computed ? computed.getPropertyValue(name) || computed[name] : void 0, computed && ("" !== ret || (jQuery.contains(QUnit.ownerDocument, QUnit) || (ret = jQuery.style(QUnit, name))), rnumnonpx.test(ret) && (rparentsprev.test(name) && (width = style.width, minWidth = style.minWidth, maxWidth = style.maxWidth, style.minWidth = style.maxWidth = style.width = ret, ret = computed.width, style.width = width, style.minWidth = minWidth, style.maxWidth = 
      maxWidth))), void 0 === ret ? ret : ret + "";
    };
  } else {
    if (doc.documentElement.currentStyle) {
      /**
       * @param {Object} a
       * @return {?}
       */
      getStyles = function(a) {
        return a.currentStyle;
      };
      /**
       * @param {Object} elem
       * @param {string} name
       * @param {Object} computed
       * @return {?}
       */
      curCSS = function(elem, name, computed) {
        var left;
        var rs;
        var rsLeft;
        var ret;
        var style = elem.style;
        return computed = computed || getStyles(elem), ret = computed ? computed[name] : void 0, null == ret && (style && (style[name] && (ret = style[name]))), rnumnonpx.test(ret) && (!IDENTIFIER.test(name) && (left = style.left, rs = elem.runtimeStyle, rsLeft = rs && rs.left, rsLeft && (rs.left = elem.currentStyle.left), style.left = "fontSize" === name ? "1em" : ret, ret = style.pixelLeft + "px", style.left = left, rsLeft && (rs.left = rsLeft))), void 0 === ret ? ret : ret + "" || "auto";
      };
    }
  }
  (function() {
    /**
     * @return {undefined}
     */
    function getSize() {
      var div;
      var body;
      var container;
      var marginDiv;
      body = doc.getElementsByTagName("body")[0];
      if (body) {
        if (body.style) {
          div = doc.createElement("div");
          container = doc.createElement("div");
          /** @type {string} */
          container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
          body.appendChild(container).appendChild(div);
          /** @type {string} */
          div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute";
          /** @type {boolean} */
          stack = memory = false;
          /** @type {boolean} */
          i = true;
          if (win.getComputedStyle) {
            /** @type {boolean} */
            stack = "1%" !== (win.getComputedStyle(div, null) || {}).top;
            /** @type {boolean} */
            memory = "4px" === (win.getComputedStyle(div, null) || {
              width : "4px"
            }).width;
            marginDiv = div.appendChild(doc.createElement("div"));
            /** @type {string} */
            marginDiv.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0";
            /** @type {string} */
            marginDiv.style.marginRight = marginDiv.style.width = "0";
            /** @type {string} */
            div.style.width = "1px";
            /** @type {boolean} */
            i = !parseFloat((win.getComputedStyle(marginDiv, null) || {}).marginRight);
            div.removeChild(marginDiv);
          }
          /** @type {string} */
          div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
          marginDiv = div.getElementsByTagName("td");
          /** @type {string} */
          marginDiv[0].style.cssText = "margin:0;border:0;padding:0;display:none";
          /** @type {boolean} */
          h = 0 === marginDiv[0].offsetHeight;
          if (h) {
            /** @type {string} */
            marginDiv[0].style.display = "";
            /** @type {string} */
            marginDiv[1].style.display = "none";
            /** @type {boolean} */
            h = 0 === marginDiv[0].offsetHeight;
          }
          body.removeChild(container);
        }
      }
    }
    var div;
    var style;
    var domNode;
    var stack;
    var memory;
    var h;
    var i;
    div = doc.createElement("div");
    /** @type {string} */
    div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
    domNode = div.getElementsByTagName("a")[0];
    style = domNode && domNode.style;
    if (style) {
      /** @type {string} */
      style.cssText = "float:left;opacity:.5";
      /** @type {boolean} */
      support.opacity = "0.5" === style.opacity;
      /** @type {boolean} */
      support.cssFloat = !!style.cssFloat;
      /** @type {string} */
      div.style.backgroundClip = "content-box";
      /** @type {string} */
      div.cloneNode(true).style.backgroundClip = "";
      /** @type {boolean} */
      support.clearCloneStyle = "content-box" === div.style.backgroundClip;
      /** @type {boolean} */
      support.boxSizing = "" === style.boxSizing || ("" === style.MozBoxSizing || "" === style.WebkitBoxSizing);
      jQuery.extend(support, {
        /**
         * @return {?}
         */
        reliableHiddenOffsets : function() {
          return null == h && getSize(), h;
        },
        /**
         * @return {?}
         */
        boxSizingReliable : function() {
          return null == memory && getSize(), memory;
        },
        /**
         * @return {?}
         */
        pixelPosition : function() {
          return null == stack && getSize(), stack;
        },
        /**
         * @return {?}
         */
        reliableMarginRight : function() {
          return null == i && getSize(), i;
        }
      });
    }
  })();
  /**
   * @param {Element} elem
   * @param {Object} options
   * @param {Function} callback
   * @param {Array} args
   * @return {?}
   */
  jQuery.swap = function(elem, options, callback, args) {
    var ret;
    var name;
    var old = {};
    for (name in options) {
      old[name] = elem.style[name];
      elem.style[name] = options[name];
    }
    ret = callback.apply(elem, args || []);
    for (name in options) {
      elem.style[name] = old[name];
    }
    return ret;
  };
  /** @type {RegExp} */
  var ralpha = /alpha\([^)]*\)/i;
  /** @type {RegExp} */
  var emptyType = /opacity\s*=\s*([^)]*)/;
  /** @type {RegExp} */
  var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
  /** @type {RegExp} */
  var rrelNum = new RegExp("^(" + core_pnum + ")(.*)$", "i");
  /** @type {RegExp} */
  var ATTR_RE = new RegExp("^([+-])=(" + core_pnum + ")", "i");
  var props = {
    position : "absolute",
    visibility : "hidden",
    display : "block"
  };
  var object = {
    letterSpacing : "0",
    fontWeight : "400"
  };
  /** @type {Array} */
  var cssPrefixes = ["Webkit", "O", "Moz", "ms"];
  jQuery.extend({
    cssHooks : {
      opacity : {
        /**
         * @param {string} name
         * @param {Object} index
         * @return {?}
         */
        get : function(name, index) {
          if (index) {
            var ret = curCSS(name, "opacity");
            return "" === ret ? "1" : ret;
          }
        }
      }
    },
    cssNumber : {
      columnCount : true,
      fillOpacity : true,
      flexGrow : true,
      flexShrink : true,
      fontWeight : true,
      lineHeight : true,
      opacity : true,
      order : true,
      orphans : true,
      widows : true,
      zIndex : true,
      zoom : true
    },
    cssProps : {
      "float" : support.cssFloat ? "cssFloat" : "styleFloat"
    },
    /**
     * @param {Object} a
     * @param {string} name
     * @param {string} recurring
     * @param {Object} extra
     * @return {?}
     */
    style : function(a, name, recurring, extra) {
      if (a && (3 !== a.nodeType && (8 !== a.nodeType && a.style))) {
        var ret;
        var current;
        var hooks;
        var origName = jQuery.camelCase(name);
        var style = a.style;
        if (name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName)), hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName], void 0 === recurring) {
          return hooks && ("get" in hooks && void 0 !== (ret = hooks.get(a, false, extra))) ? ret : style[name];
        }
        if (current = typeof recurring, "string" === current && ((ret = ATTR_RE.exec(recurring)) && (recurring = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(a, name)), current = "number")), null != recurring && (recurring === recurring && ("number" !== current || (jQuery.cssNumber[origName] || (recurring += "px")), support.clearCloneStyle || ("" !== recurring || (0 !== name.indexOf("background") || (style[name] = "inherit"))), !(hooks && ("set" in hooks && void 0 === (recurring = hooks.set(a, recurring, 
        extra))))))) {
          try {
            /** @type {string} */
            style[name] = recurring;
          } catch (j) {
          }
        }
      }
    },
    /**
     * @param {string} name
     * @param {string} prop
     * @param {boolean} recurring
     * @param {?} arg
     * @return {?}
     */
    css : function(name, prop, recurring, arg) {
      var val;
      var value;
      var property;
      var origName = jQuery.camelCase(prop);
      return prop = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(name.style, origName)), property = jQuery.cssHooks[prop] || jQuery.cssHooks[origName], property && ("get" in property && (value = property.get(name, true, recurring))), void 0 === value && (value = curCSS(name, prop, arg)), "normal" === value && (prop in object && (value = object[prop])), "" === recurring || recurring ? (val = parseFloat(value), recurring === true || jQuery.isNumeric(val) ? val || 0 : value) : 
      value;
    }
  });
  jQuery.each(["height", "width"], function(dataAndEvents, prop) {
    jQuery.cssHooks[prop] = {
      /**
       * @param {string} name
       * @param {Object} index
       * @param {Object} extra
       * @return {?}
       */
      get : function(name, index, extra) {
        return index ? rdisplayswap.test(jQuery.css(name, "display")) && 0 === name.offsetWidth ? jQuery.swap(name, props, function() {
          return getWidthOrHeight(name, prop, extra);
        }) : getWidthOrHeight(name, prop, extra) : void 0;
      },
      /**
       * @param {string} object
       * @param {Object} recurring
       * @param {Object} extra
       * @return {?}
       */
      set : function(object, recurring, extra) {
        var styles = extra && getStyles(object);
        return setPositiveNumber(object, recurring, extra ? augmentWidthOrHeight(object, prop, extra, support.boxSizing && "border-box" === jQuery.css(object, "boxSizing", false, styles), styles) : 0);
      }
    };
  });
  if (!support.opacity) {
    jQuery.cssHooks.opacity = {
      /**
       * @param {string} name
       * @param {boolean} index
       * @return {?}
       */
      get : function(name, index) {
        return emptyType.test((index && name.currentStyle ? name.currentStyle.filter : name.style.filter) || "") ? 0.01 * parseFloat(RegExp.$1) + "" : index ? "1" : "";
      },
      /**
       * @param {string} value
       * @param {Object} recurring
       * @return {undefined}
       */
      set : function(value, recurring) {
        var style = value.style;
        var currentStyle = value.currentStyle;
        /** @type {string} */
        var opacity = jQuery.isNumeric(recurring) ? "alpha(opacity=" + 100 * recurring + ")" : "";
        var filter = currentStyle && currentStyle.filter || (style.filter || "");
        /** @type {number} */
        style.zoom = 1;
        if (!((recurring >= 1 || "" === recurring) && ("" === jQuery.trim(filter.replace(ralpha, "")) && (style.removeAttribute && (style.removeAttribute("filter"), "" === recurring || currentStyle && !currentStyle.filter))))) {
          style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity;
        }
      }
    };
  }
  jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(cur, value) {
    return value ? jQuery.swap(cur, {
      display : "inline-block"
    }, curCSS, [cur, "marginRight"]) : void 0;
  });
  jQuery.each({
    margin : "",
    padding : "",
    border : "Width"
  }, function(prefix, suffix) {
    jQuery.cssHooks[prefix + suffix] = {
      /**
       * @param {string} str
       * @return {?}
       */
      expand : function(str) {
        /** @type {number} */
        var i = 0;
        var expanded = {};
        /** @type {Array} */
        var tokens = "string" == typeof str ? str.split(" ") : [str];
        for (;4 > i;i++) {
          expanded[prefix + cssExpand[i] + suffix] = tokens[i] || (tokens[i - 2] || tokens[0]);
        }
        return expanded;
      }
    };
    if (!rparentsprev.test(prefix)) {
      /** @type {function (string, Object, Function): ?} */
      jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
    }
  });
  jQuery.fn.extend({
    /**
     * @param {Function} name
     * @param {string} value
     * @return {?}
     */
    css : function(name, value) {
      return access(this, function(exports, name, value) {
        var styles;
        var l;
        var map = {};
        /** @type {number} */
        var i = 0;
        if (jQuery.isArray(name)) {
          styles = getStyles(exports);
          l = name.length;
          for (;l > i;i++) {
            map[name[i]] = jQuery.css(exports, name[i], false, styles);
          }
          return map;
        }
        return void 0 !== value ? jQuery.style(exports, name, value) : jQuery.css(exports, name);
      }, name, value, arguments.length > 1);
    },
    /**
     * @return {?}
     */
    show : function() {
      return showHide(this, true);
    },
    /**
     * @return {?}
     */
    hide : function() {
      return showHide(this);
    },
    /**
     * @param {?} state
     * @return {?}
     */
    toggle : function(state) {
      return "boolean" == typeof state ? state ? this.show() : this.hide() : this.each(function() {
        if (ok(this)) {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
    }
  });
  /** @type {function (string, string, string, string, string): ?} */
  jQuery.Tween = Tween;
  Tween.prototype = {
    /** @type {function (string, string, string, string, string): ?} */
    constructor : Tween,
    /**
     * @param {?} allBindingsAccessor
     * @param {Object} options
     * @param {?} prop
     * @param {number} to
     * @param {string} easing
     * @param {string} unit
     * @return {undefined}
     */
    init : function(allBindingsAccessor, options, prop, to, easing, unit) {
      this.elem = allBindingsAccessor;
      this.prop = prop;
      this.easing = easing || "swing";
      /** @type {Object} */
      this.options = options;
      this.start = this.now = this.cur();
      /** @type {number} */
      this.end = to;
      this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
    },
    /**
     * @return {?}
     */
    cur : function() {
      var hooks = Tween.propHooks[this.prop];
      return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
    },
    /**
     * @param {number} percent
     * @return {?}
     */
    run : function(percent) {
      var eased;
      var hooks = Tween.propHooks[this.prop];
      return this.pos = eased = this.options.duration ? jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration) : percent, this.now = (this.end - this.start) * eased + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), hooks && hooks.set ? hooks.set(this) : Tween.propHooks._default.set(this), this;
    }
  };
  Tween.prototype.init.prototype = Tween.prototype;
  Tween.propHooks = {
    _default : {
      /**
       * @param {string} name
       * @return {?}
       */
      get : function(name) {
        var node;
        return null == name.elem[name.prop] || name.elem.style && null != name.elem.style[name.prop] ? (node = jQuery.css(name.elem, name.prop, ""), node && "auto" !== node ? node : 0) : name.elem[name.prop];
      },
      /**
       * @param {string} value
       * @return {undefined}
       */
      set : function(value) {
        if (jQuery.fx.step[value.prop]) {
          jQuery.fx.step[value.prop](value);
        } else {
          if (value.elem.style && (null != value.elem.style[jQuery.cssProps[value.prop]] || jQuery.cssHooks[value.prop])) {
            jQuery.style(value.elem, value.prop, value.now + value.unit);
          } else {
            value.elem[value.prop] = value.now;
          }
        }
      }
    }
  };
  Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
    /**
     * @param {string} value
     * @return {undefined}
     */
    set : function(value) {
      if (value.elem.nodeType) {
        if (value.elem.parentNode) {
          value.elem[value.prop] = value.now;
        }
      }
    }
  };
  jQuery.easing = {
    /**
     * @param {?} t
     * @return {?}
     */
    linear : function(t) {
      return t;
    },
    /**
     * @param {number} p
     * @return {?}
     */
    swing : function(p) {
      return 0.5 - Math.cos(p * Math.PI) / 2;
    }
  };
  /** @type {function (?, Object, ?, number, string, string): undefined} */
  jQuery.fx = Tween.prototype.init;
  jQuery.fx.step = {};
  var fxNow;
  var scrollIntervalId;
  /** @type {RegExp} */
  var rplusequals = /^(?:toggle|show|hide)$/;
  /** @type {RegExp} */
  var rfxnum = new RegExp("^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i");
  /** @type {RegExp} */
  var numbers = /queueHooks$/;
  /** @type {Array} */
  var animationPrefilters = [defaultPrefilter];
  var cache = {
    "*" : [function(prop, value) {
      var tween = this.createTween(prop, value);
      var l0 = tween.cur();
      /** @type {(Array.<string>|null)} */
      var parts = rfxnum.exec(value);
      /** @type {string} */
      var unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px");
      var start = (jQuery.cssNumber[prop] || "px" !== unit && +l0) && rfxnum.exec(jQuery.css(tween.elem, prop));
      /** @type {number} */
      var scale = 1;
      /** @type {number} */
      var i = 20;
      if (start && start[3] !== unit) {
        unit = unit || start[3];
        /** @type {Array} */
        parts = parts || [];
        /** @type {number} */
        start = +l0 || 1;
        do {
          /** @type {(number|string)} */
          scale = scale || ".5";
          start /= scale;
          jQuery.style(tween.elem, prop, start + unit);
        } while (scale !== (scale = tween.cur() / l0) && (1 !== scale && --i));
      }
      return parts && (start = tween.start = +start || (+l0 || 0), tween.unit = unit, tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2]), tween;
    }]
  };
  jQuery.Animation = jQuery.extend(Animation, {
    /**
     * @param {Object} props
     * @param {Function} callback
     * @return {undefined}
     */
    tweener : function(props, callback) {
      if (jQuery.isFunction(props)) {
        /** @type {Object} */
        callback = props;
        /** @type {Array} */
        props = ["*"];
      } else {
        props = props.split(" ");
      }
      var prop;
      /** @type {number} */
      var i = 0;
      var l = props.length;
      for (;l > i;i++) {
        prop = props[i];
        cache[prop] = cache[prop] || [];
        cache[prop].unshift(callback);
      }
    },
    /**
     * @param {string} callback
     * @param {?} prepend
     * @return {undefined}
     */
    prefilter : function(callback, prepend) {
      if (prepend) {
        animationPrefilters.unshift(callback);
      } else {
        animationPrefilters.push(callback);
      }
    }
  });
  /**
   * @param {Object} speed
   * @param {Object} easing
   * @param {Object} fn
   * @return {?}
   */
  jQuery.speed = function(speed, easing, fn) {
    var opt = speed && "object" == typeof speed ? jQuery.extend({}, speed) : {
      complete : fn || (!fn && easing || jQuery.isFunction(speed) && speed),
      duration : speed,
      easing : fn && easing || easing && (!jQuery.isFunction(easing) && easing)
    };
    return opt.duration = jQuery.fx.off ? 0 : "number" == typeof opt.duration ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default, (null == opt.queue || opt.queue === true) && (opt.queue = "fx"), opt.old = opt.complete, opt.complete = function() {
      if (jQuery.isFunction(opt.old)) {
        opt.old.call(this);
      }
      if (opt.queue) {
        jQuery.dequeue(this, opt.queue);
      }
    }, opt;
  };
  jQuery.fn.extend({
    /**
     * @param {number} speed
     * @param {(number|string)} to
     * @param {Object} callback
     * @param {Object} _callback
     * @return {?}
     */
    fadeTo : function(speed, to, callback, _callback) {
      return this.filter(ok).css("opacity", 0).show().end().animate({
        opacity : to
      }, speed, callback, _callback);
    },
    /**
     * @param {?} prop
     * @param {number} speed
     * @param {Object} easing
     * @param {Object} callback
     * @return {?}
     */
    animate : function(prop, speed, easing, callback) {
      var empty = jQuery.isEmptyObject(prop);
      var optall = jQuery.speed(speed, easing, callback);
      /**
       * @return {undefined}
       */
      var doAnimation = function() {
        var anim = Animation(this, jQuery.extend({}, prop), optall);
        if (empty || jQuery._data(this, "finish")) {
          anim.stop(true);
        }
      };
      return doAnimation.finish = doAnimation, empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
    },
    /**
     * @param {Object} type
     * @param {Object} clearQueue
     * @param {Object} gotoEnd
     * @return {?}
     */
    stop : function(type, clearQueue, gotoEnd) {
      /**
       * @param {Object} e
       * @return {undefined}
       */
      var stop = function(e) {
        var stop = e.stop;
        delete e.stop;
        stop(gotoEnd);
      };
      return "string" != typeof type && (gotoEnd = clearQueue, clearQueue = type, type = void 0), clearQueue && (type !== false && this.queue(type || "fx", [])), this.each(function() {
        /** @type {boolean} */
        var dequeue = true;
        var i = null != type && type + "queueHooks";
        /** @type {Array} */
        var timers = jQuery.timers;
        var gradient = jQuery._data(this);
        if (i) {
          if (gradient[i]) {
            if (gradient[i].stop) {
              stop(gradient[i]);
            }
          }
        } else {
          for (i in gradient) {
            if (gradient[i]) {
              if (gradient[i].stop) {
                if (numbers.test(i)) {
                  stop(gradient[i]);
                }
              }
            }
          }
        }
        /** @type {number} */
        i = timers.length;
        for (;i--;) {
          if (!(timers[i].elem !== this)) {
            if (!(null != type && timers[i].queue !== type)) {
              timers[i].anim.stop(gotoEnd);
              /** @type {boolean} */
              dequeue = false;
              timers.splice(i, 1);
            }
          }
        }
        if (dequeue || !gotoEnd) {
          jQuery.dequeue(this, type);
        }
      });
    },
    /**
     * @param {string} type
     * @return {?}
     */
    finish : function(type) {
      return type !== false && (type = type || "fx"), this.each(function() {
        var index;
        var data = jQuery._data(this);
        var array = data[type + "queue"];
        var event = data[type + "queueHooks"];
        /** @type {Array} */
        var timers = jQuery.timers;
        var length = array ? array.length : 0;
        /** @type {boolean} */
        data.finish = true;
        jQuery.queue(this, type, []);
        if (event) {
          if (event.stop) {
            event.stop.call(this, true);
          }
        }
        /** @type {number} */
        index = timers.length;
        for (;index--;) {
          if (timers[index].elem === this) {
            if (timers[index].queue === type) {
              timers[index].anim.stop(true);
              timers.splice(index, 1);
            }
          }
        }
        /** @type {number} */
        index = 0;
        for (;length > index;index++) {
          if (array[index]) {
            if (array[index].finish) {
              array[index].finish.call(this);
            }
          }
        }
        delete data.finish;
      });
    }
  });
  jQuery.each(["toggle", "show", "hide"], function(dataAndEvents, name) {
    var matcherFunction = jQuery.fn[name];
    /**
     * @param {number} speed
     * @param {Object} callback
     * @param {Object} next_callback
     * @return {?}
     */
    jQuery.fn[name] = function(speed, callback, next_callback) {
      return null == speed || "boolean" == typeof speed ? matcherFunction.apply(this, arguments) : this.animate(genFx(name, true), speed, callback, next_callback);
    };
  });
  jQuery.each({
    slideDown : genFx("show"),
    slideUp : genFx("hide"),
    slideToggle : genFx("toggle"),
    fadeIn : {
      opacity : "show"
    },
    fadeOut : {
      opacity : "hide"
    },
    fadeToggle : {
      opacity : "toggle"
    }
  }, function(original, props) {
    /**
     * @param {number} speed
     * @param {Object} callback
     * @param {Object} next_callback
     * @return {?}
     */
    jQuery.fn[original] = function(speed, callback, next_callback) {
      return this.animate(props, speed, callback, next_callback);
    };
  });
  /** @type {Array} */
  jQuery.timers = [];
  /**
   * @return {undefined}
   */
  jQuery.fx.tick = function() {
    var last;
    /** @type {Array} */
    var timers = jQuery.timers;
    /** @type {number} */
    var i = 0;
    fxNow = jQuery.now();
    for (;i < timers.length;i++) {
      last = timers[i];
      if (!last()) {
        if (!(timers[i] !== last)) {
          timers.splice(i--, 1);
        }
      }
    }
    if (!timers.length) {
      jQuery.fx.stop();
    }
    fxNow = void 0;
  };
  /**
   * @param {string} callback
   * @return {undefined}
   */
  jQuery.fx.timer = function(callback) {
    jQuery.timers.push(callback);
    if (callback()) {
      jQuery.fx.start();
    } else {
      jQuery.timers.pop();
    }
  };
  /** @type {number} */
  jQuery.fx.interval = 13;
  /**
   * @return {undefined}
   */
  jQuery.fx.start = function() {
    if (!scrollIntervalId) {
      /** @type {number} */
      scrollIntervalId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
    }
  };
  /**
   * @return {undefined}
   */
  jQuery.fx.stop = function() {
    clearInterval(scrollIntervalId);
    /** @type {null} */
    scrollIntervalId = null;
  };
  jQuery.fx.speeds = {
    slow : 600,
    fast : 200,
    _default : 400
  };
  /**
   * @param {Function} time
   * @param {string} type
   * @return {?}
   */
  jQuery.fn.delay = function(time, type) {
    return time = jQuery.fx ? jQuery.fx.speeds[time] || time : time, type = type || "fx", this.queue(type, function(next, event) {
      /** @type {number} */
      var timeout = setTimeout(next, time);
      /**
       * @return {undefined}
       */
      event.stop = function() {
        clearTimeout(timeout);
      };
    });
  };
  (function() {
    var input;
    var d;
    var select;
    var e;
    var opt;
    d = doc.createElement("div");
    d.setAttribute("className", "t");
    /** @type {string} */
    d.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
    e = d.getElementsByTagName("a")[0];
    select = doc.createElement("select");
    opt = select.appendChild(doc.createElement("option"));
    input = d.getElementsByTagName("input")[0];
    /** @type {string} */
    e.style.cssText = "top:1px";
    /** @type {boolean} */
    support.getSetAttribute = "t" !== d.className;
    /** @type {boolean} */
    support.style = /top/.test(e.getAttribute("style"));
    /** @type {boolean} */
    support.hrefNormalized = "/a" === e.getAttribute("href");
    /** @type {boolean} */
    support.checkOn = !!input.value;
    support.optSelected = opt.selected;
    /** @type {boolean} */
    support.enctype = !!doc.createElement("form").enctype;
    /** @type {boolean} */
    select.disabled = true;
    /** @type {boolean} */
    support.optDisabled = !opt.disabled;
    input = doc.createElement("input");
    input.setAttribute("value", "");
    /** @type {boolean} */
    support.input = "" === input.getAttribute("value");
    /** @type {string} */
    input.value = "t";
    input.setAttribute("type", "radio");
    /** @type {boolean} */
    support.radioValue = "t" === input.value;
  })();
  /** @type {RegExp} */
  var r20 = /\r/g;
  jQuery.fn.extend({
    /**
     * @param {Function} html
     * @return {?}
     */
    val : function(html) {
      var hooks;
      var ret;
      var isFunction;
      var elem = this[0];
      if (arguments.length) {
        return isFunction = jQuery.isFunction(html), this.each(function(i) {
          var recurring;
          if (1 === this.nodeType) {
            recurring = isFunction ? html.call(this, i, jQuery(this).val()) : html;
            if (null == recurring) {
              /** @type {string} */
              recurring = "";
            } else {
              if ("number" == typeof recurring) {
                recurring += "";
              } else {
                if (jQuery.isArray(recurring)) {
                  recurring = jQuery.map(recurring, function(month) {
                    return null == month ? "" : month + "";
                  });
                }
              }
            }
            hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
            if (!(hooks && ("set" in hooks && void 0 !== hooks.set(this, recurring, "value")))) {
              this.value = recurring;
            }
          }
        });
      }
      if (elem) {
        return hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()], hooks && ("get" in hooks && void 0 !== (ret = hooks.get(elem, "value"))) ? ret : (ret = elem.value, "string" == typeof ret ? ret.replace(r20, "") : null == ret ? "" : ret);
      }
    }
  });
  jQuery.extend({
    valHooks : {
      option : {
        /**
         * @param {?} exports
         * @return {?}
         */
        get : function(exports) {
          var text = jQuery.find.attr(exports, "value");
          return null != text ? text : jQuery.trim(jQuery.text(exports));
        }
      },
      select : {
        /**
         * @param {string} name
         * @return {?}
         */
        get : function(name) {
          var value;
          var option;
          var options = name.options;
          var index = name.selectedIndex;
          /** @type {boolean} */
          var one = "select-one" === name.type || 0 > index;
          /** @type {(Array|null)} */
          var values = one ? null : [];
          var max = one ? index + 1 : options.length;
          var i = 0 > index ? max : one ? index : 0;
          for (;max > i;i++) {
            if (option = options[i], !(!option.selected && i !== index || ((support.optDisabled ? option.disabled : null !== option.getAttribute("disabled")) || option.parentNode.disabled && jQuery.nodeName(option.parentNode, "optgroup")))) {
              if (value = jQuery(option).val(), one) {
                return value;
              }
              values.push(value);
            }
          }
          return values;
        },
        /**
         * @param {string} value
         * @param {boolean} recurring
         * @return {?}
         */
        set : function(value, recurring) {
          var selected;
          var optgroup;
          var tokenized = value.options;
          var selection = jQuery.makeArray(recurring);
          var index = tokenized.length;
          for (;index--;) {
            if (optgroup = tokenized[index], jQuery.inArray(jQuery.valHooks.option.get(optgroup), selection) >= 0) {
              try {
                /** @type {boolean} */
                optgroup.selected = selected = true;
              } catch (h) {
                optgroup.scrollHeight;
              }
            } else {
              /** @type {boolean} */
              optgroup.selected = false;
            }
          }
          return selected || (value.selectedIndex = -1), tokenized;
        }
      }
    }
  });
  jQuery.each(["radio", "checkbox"], function() {
    jQuery.valHooks[this] = {
      /**
       * @param {string} val
       * @param {Object} recurring
       * @return {?}
       */
      set : function(val, recurring) {
        return jQuery.isArray(recurring) ? val.checked = jQuery.inArray(jQuery(val).val(), recurring) >= 0 : void 0;
      }
    };
    if (!support.checkOn) {
      /**
       * @param {string} name
       * @return {?}
       */
      jQuery.valHooks[this].get = function(name) {
        return null === name.getAttribute("value") ? "on" : name.value;
      };
    }
  });
  var nodeHook;
  var boolHook;
  var map = jQuery.expr.attrHandle;
  /** @type {RegExp} */
  var exclude = /^(?:checked|selected)$/i;
  var getSetAttribute = support.getSetAttribute;
  var str = support.input;
  jQuery.fn.extend({
    /**
     * @param {string} name
     * @param {string} val
     * @return {?}
     */
    attr : function(name, val) {
      return access(this, jQuery.attr, name, val, arguments.length > 1);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    removeAttr : function(name) {
      return this.each(function() {
        jQuery.removeAttr(this, name);
      });
    }
  });
  jQuery.extend({
    /**
     * @param {string} elem
     * @param {Object} name
     * @param {Object} recurring
     * @return {?}
     */
    attr : function(elem, name, recurring) {
      var hooks;
      var ret;
      var nodeType = elem.nodeType;
      if (elem && (3 !== nodeType && (8 !== nodeType && 2 !== nodeType))) {
        return typeof elem.getAttribute === text ? jQuery.prop(elem, name, recurring) : (1 === nodeType && jQuery.isXMLDoc(elem) || (name = name.toLowerCase(), hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook)), void 0 === recurring ? hooks && ("get" in hooks && null !== (ret = hooks.get(elem, name))) ? ret : (ret = jQuery.find.attr(elem, name), null == ret ? void 0 : ret) : null !== recurring ? hooks && ("set" in hooks && void 0 !== (ret = hooks.set(elem, 
        recurring, name))) ? ret : (elem.setAttribute(name, recurring + ""), recurring) : void jQuery.removeAttr(elem, name));
      }
    },
    /**
     * @param {Object} elem
     * @param {string} value
     * @return {undefined}
     */
    removeAttr : function(elem, value) {
      var name;
      var propName;
      /** @type {number} */
      var i = 0;
      var attrNames = value && value.match(core_rnotwhite);
      if (attrNames && 1 === elem.nodeType) {
        for (;name = attrNames[i++];) {
          propName = jQuery.propFix[name] || name;
          if (jQuery.expr.match.bool.test(name)) {
            if (str && getSetAttribute || !exclude.test(name)) {
              /** @type {boolean} */
              elem[propName] = false;
            } else {
              /** @type {boolean} */
              elem[jQuery.camelCase("default-" + name)] = elem[propName] = false;
            }
          } else {
            jQuery.attr(elem, name, "");
          }
          elem.removeAttribute(getSetAttribute ? name : propName);
        }
      }
    },
    attrHooks : {
      type : {
        /**
         * @param {string} object
         * @param {Object} recurring
         * @return {?}
         */
        set : function(object, recurring) {
          if (!support.radioValue && ("radio" === recurring && jQuery.nodeName(object, "input"))) {
            var length = object.value;
            return object.setAttribute("type", recurring), length && (object.value = length), recurring;
          }
        }
      }
    }
  });
  boolHook = {
    /**
     * @param {string} value
     * @param {boolean} recurring
     * @param {Object} name
     * @return {?}
     */
    set : function(value, recurring, name) {
      return recurring === false ? jQuery.removeAttr(value, name) : str && getSetAttribute || !exclude.test(name) ? value.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name) : value[jQuery.camelCase("default-" + name)] = value[name] = true, name;
    }
  };
  jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(dataAndEvents, name) {
    var dataAttr = map[name] || jQuery.find.attr;
    /** @type {function (string, string, Object): ?} */
    map[name] = str && getSetAttribute || !exclude.test(name) ? function(elem, name, recurring) {
      var source;
      var value;
      return recurring || (value = map[name], map[name] = source, source = null != dataAttr(elem, name, recurring) ? name.toLowerCase() : null, map[name] = value), source;
    } : function(dataAndEvents, name, deepDataAndEvents) {
      return deepDataAndEvents ? void 0 : dataAndEvents[jQuery.camelCase("default-" + name)] ? name.toLowerCase() : null;
    };
  });
  if (!(str && getSetAttribute)) {
    jQuery.attrHooks.value = {
      /**
       * @param {string} object
       * @param {Object} recurring
       * @param {Object} name
       * @return {?}
       */
      set : function(object, recurring, name) {
        return jQuery.nodeName(object, "input") ? void(object.defaultValue = recurring) : nodeHook && nodeHook.set(object, recurring, name);
      }
    };
  }
  if (!getSetAttribute) {
    nodeHook = {
      /**
       * @param {string} object
       * @param {string} recurring
       * @param {string} name
       * @return {?}
       */
      set : function(object, recurring, name) {
        var ret = object.getAttributeNode(name);
        return ret || object.setAttributeNode(ret = object.ownerDocument.createAttribute(name)), ret.value = recurring += "", "value" === name || recurring === object.getAttribute(name) ? recurring : void 0;
      }
    };
    /** @type {function (Object, ?, boolean): ?} */
    map.id = map.name = map.coords = function(elem, name, isXML) {
      var weight;
      return isXML ? void 0 : (weight = elem.getAttributeNode(name)) && "" !== weight.value ? weight.value : null;
    };
    jQuery.valHooks.button = {
      /**
       * @param {string} name
       * @param {Object} index
       * @return {?}
       */
      get : function(name, index) {
        var node = name.getAttributeNode(index);
        return node && node.specified ? node.value : void 0;
      },
      /** @type {function (string, string, string): ?} */
      set : nodeHook.set
    };
    jQuery.attrHooks.contenteditable = {
      /**
       * @param {string} object
       * @param {Object} recurring
       * @param {Object} name
       * @return {undefined}
       */
      set : function(object, recurring, name) {
        nodeHook.set(object, "" === recurring ? false : recurring, name);
      }
    };
    jQuery.each(["width", "height"], function(dataAndEvents, name) {
      jQuery.attrHooks[name] = {
        /**
         * @param {string} val
         * @param {Object} recurring
         * @return {?}
         */
        set : function(val, recurring) {
          return "" === recurring ? (val.setAttribute(name, "auto"), recurring) : void 0;
        }
      };
    });
  }
  if (!support.style) {
    jQuery.attrHooks.style = {
      /**
       * @param {string} name
       * @return {?}
       */
      get : function(name) {
        return name.style.cssText || void 0;
      },
      /**
       * @param {string} val
       * @param {Object} recurring
       * @return {?}
       */
      set : function(val, recurring) {
        return val.style.cssText = recurring + "";
      }
    };
  }
  /** @type {RegExp} */
  var rchecked = /^(?:input|select|textarea|button|object)$/i;
  /** @type {RegExp} */
  var R_FOCUSABLE = /^(?:a|area)$/i;
  jQuery.fn.extend({
    /**
     * @param {?} value
     * @param {?} name
     * @return {?}
     */
    prop : function(value, name) {
      return access(this, jQuery.prop, value, name, arguments.length > 1);
    },
    /**
     * @param {Text} name
     * @return {?}
     */
    removeProp : function(name) {
      return name = jQuery.propFix[name] || name, this.each(function() {
        try {
          this[name] = void 0;
          delete this[name];
        } catch (b) {
        }
      });
    }
  });
  jQuery.extend({
    propFix : {
      "for" : "htmlFor",
      "class" : "className"
    },
    /**
     * @param {string} header
     * @param {Object} name
     * @param {Object} recurring
     * @return {?}
     */
    prop : function(header, name, recurring) {
      var ret;
      var hooks;
      var n;
      var type = header.nodeType;
      if (header && (3 !== type && (8 !== type && 2 !== type))) {
        return n = 1 !== type || !jQuery.isXMLDoc(header), n && (name = jQuery.propFix[name] || name, hooks = jQuery.propHooks[name]), void 0 !== recurring ? hooks && ("set" in hooks && void 0 !== (ret = hooks.set(header, recurring, name))) ? ret : header[name] = recurring : hooks && ("get" in hooks && null !== (ret = hooks.get(header, name))) ? ret : header[name];
      }
    },
    propHooks : {
      tabIndex : {
        /**
         * @param {string} name
         * @return {?}
         */
        get : function(name) {
          var tabindex = jQuery.find.attr(name, "tabindex");
          return tabindex ? parseInt(tabindex, 10) : rchecked.test(name.nodeName) || R_FOCUSABLE.test(name.nodeName) && name.href ? 0 : -1;
        }
      }
    }
  });
  if (!support.hrefNormalized) {
    jQuery.each(["href", "src"], function(dataAndEvents, property) {
      jQuery.propHooks[property] = {
        /**
         * @param {string} name
         * @return {?}
         */
        get : function(name) {
          return name.getAttribute(property, 4);
        }
      };
    });
  }
  if (!support.optSelected) {
    jQuery.propHooks.selected = {
      /**
       * @param {string} name
       * @return {?}
       */
      get : function(name) {
        var elem = name.parentNode;
        return elem && (elem.selectedIndex, elem.parentNode && elem.parentNode.selectedIndex), null;
      }
    };
  }
  jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
    jQuery.propFix[this.toLowerCase()] = this;
  });
  if (!support.enctype) {
    /** @type {string} */
    jQuery.propFix.enctype = "encoding";
  }
  /** @type {RegExp} */
  var rclass = /[\t\r\n\f]/g;
  jQuery.fn.extend({
    /**
     * @param {string} value
     * @return {?}
     */
    addClass : function(value) {
      var classes;
      var elem;
      var cur;
      var clazz;
      var j;
      var finalValue;
      /** @type {number} */
      var i = 0;
      var l = this.length;
      /** @type {(boolean|string)} */
      var proceed = "string" == typeof value && value;
      if (jQuery.isFunction(value)) {
        return this.each(function(j) {
          jQuery(this).addClass(value.call(this, j, this.className));
        });
      }
      if (proceed) {
        classes = (value || "").match(core_rnotwhite) || [];
        for (;l > i;i++) {
          if (elem = this[i], cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ")) {
            /** @type {number} */
            j = 0;
            for (;clazz = classes[j++];) {
              if (cur.indexOf(" " + clazz + " ") < 0) {
                cur += clazz + " ";
              }
            }
            finalValue = jQuery.trim(cur);
            if (elem.className !== finalValue) {
              elem.className = finalValue;
            }
          }
        }
      }
      return this;
    },
    /**
     * @param {string} value
     * @return {?}
     */
    removeClass : function(value) {
      var res;
      var elem;
      var cur;
      var apn;
      var resLength;
      var finalValue;
      /** @type {number} */
      var i = 0;
      var l = this.length;
      /** @type {(boolean|string)} */
      var j = 0 === arguments.length || "string" == typeof value && value;
      if (jQuery.isFunction(value)) {
        return this.each(function(j) {
          jQuery(this).removeClass(value.call(this, j, this.className));
        });
      }
      if (j) {
        res = (value || "").match(core_rnotwhite) || [];
        for (;l > i;i++) {
          if (elem = this[i], cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "")) {
            /** @type {number} */
            resLength = 0;
            for (;apn = res[resLength++];) {
              for (;cur.indexOf(" " + apn + " ") >= 0;) {
                /** @type {string} */
                cur = cur.replace(" " + apn + " ", " ");
              }
            }
            finalValue = value ? jQuery.trim(cur) : "";
            if (elem.className !== finalValue) {
              elem.className = finalValue;
            }
          }
        }
      }
      return this;
    },
    /**
     * @param {Function} value
     * @param {?} stateVal
     * @return {?}
     */
    toggleClass : function(value, stateVal) {
      /** @type {string} */
      var type = typeof value;
      return "boolean" == typeof stateVal && "string" === type ? stateVal ? this.addClass(value) : this.removeClass(value) : this.each(jQuery.isFunction(value) ? function(i) {
        jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
      } : function() {
        if ("string" === type) {
          var className;
          /** @type {number} */
          var i = 0;
          var self = jQuery(this);
          var classNames = value.match(core_rnotwhite) || [];
          for (;className = classNames[i++];) {
            if (self.hasClass(className)) {
              self.removeClass(className);
            } else {
              self.addClass(className);
            }
          }
        } else {
          if (type === text || "boolean" === type) {
            if (this.className) {
              jQuery._data(this, "__className__", this.className);
            }
            this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
          }
        }
      });
    },
    /**
     * @param {string} selector
     * @return {?}
     */
    hasClass : function(selector) {
      /** @type {string} */
      var tval = " " + selector + " ";
      /** @type {number} */
      var i = 0;
      var l = this.length;
      for (;l > i;i++) {
        if (1 === this[i].nodeType && (" " + this[i].className + " ").replace(rclass, " ").indexOf(tval) >= 0) {
          return true;
        }
      }
      return false;
    }
  });
  jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(dataAndEvents, name) {
    /**
     * @param {Object} data
     * @param {Object} fn
     * @return {?}
     */
    jQuery.fn[name] = function(data, fn) {
      return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
    };
  });
  jQuery.fn.extend({
    /**
     * @param {undefined} fnOver
     * @param {Object} fnOut
     * @return {?}
     */
    hover : function(fnOver, fnOut) {
      return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    },
    /**
     * @param {string} name
     * @param {Function} obj
     * @param {Object} fn
     * @return {?}
     */
    bind : function(name, obj, fn) {
      return this.on(name, null, obj, fn);
    },
    /**
     * @param {string} type
     * @param {Object} fn
     * @return {?}
     */
    unbind : function(type, fn) {
      return this.off(type, null, fn);
    },
    /**
     * @param {Function} selector
     * @param {string} ev
     * @param {Object} fn
     * @param {Object} callback
     * @return {?}
     */
    delegate : function(selector, ev, fn, callback) {
      return this.on(ev, selector, fn, callback);
    },
    /**
     * @param {string} selector
     * @param {string} event
     * @param {string} fn
     * @return {?}
     */
    undelegate : function(selector, event, fn) {
      return 1 === arguments.length ? this.off(selector, "**") : this.off(event, selector || "**", fn);
    }
  });
  var iIdCounter = jQuery.now();
  /** @type {RegExp} */
  var rquery = /\?/;
  /** @type {RegExp} */
  var rSlash = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
  /**
   * @param {(number|string)} data
   * @return {?}
   */
  jQuery.parseJSON = function(data) {
    if (win.JSON && win.JSON.parse) {
      return win.JSON.parse(data + "");
    }
    var result;
    /** @type {null} */
    var deferred = null;
    var s = jQuery.trim(data + "");
    return s && !jQuery.trim(s.replace(rSlash, function(promise, err2, err, dataAndEvents) {
      return result && (err2 && (deferred = 0)), 0 === deferred ? promise : (result = err || err2, deferred += !dataAndEvents - !err, "");
    })) ? Function("return " + s)() : jQuery.error("Invalid JSON: " + data);
  };
  /**
   * @param {string} data
   * @return {?}
   */
  jQuery.parseXML = function(data) {
    var xml;
    var tmp;
    if (!data || "string" != typeof data) {
      return null;
    }
    try {
      if (win.DOMParser) {
        /** @type {DOMParser} */
        tmp = new DOMParser;
        /** @type {(Document|null)} */
        xml = tmp.parseFromString(data, "text/xml");
      } else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        /** @type {string} */
        xml.async = "false";
        xml.loadXML(data);
      }
    } catch (e) {
      xml = void 0;
    }
    return xml && (xml.documentElement && !xml.getElementsByTagName("parsererror").length) || jQuery.error("Invalid XML: " + data), xml;
  };
  var prop;
  var ajaxLocation;
  /** @type {RegExp} */
  var currDirRegExp = /#.*$/;
  /** @type {RegExp} */
  var rts = /([?&])_=[^&]*/;
  /** @type {RegExp} */
  var re = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm;
  /** @type {RegExp} */
  var fnTest = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
  /** @type {RegExp} */
  var rnoContent = /^(?:GET|HEAD)$/;
  /** @type {RegExp} */
  var rprotocol = /^\/\//;
  /** @type {RegExp} */
  var quickExpr = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/;
  var prefilters = {};
  var transports = {};
  /** @type {string} */
  var Sc = "*/".concat("*");
  try {
    /** @type {string} */
    ajaxLocation = location.href;
  } catch (Tc) {
    ajaxLocation = doc.createElement("a");
    /** @type {string} */
    ajaxLocation.href = "";
    /** @type {string} */
    ajaxLocation = ajaxLocation.href;
  }
  /** @type {Array} */
  prop = quickExpr.exec(ajaxLocation.toLowerCase()) || [];
  jQuery.extend({
    active : 0,
    lastModified : {},
    etag : {},
    ajaxSettings : {
      url : ajaxLocation,
      type : "GET",
      isLocal : fnTest.test(prop[1]),
      global : true,
      processData : true,
      async : true,
      contentType : "application/x-www-form-urlencoded; charset=UTF-8",
      accepts : {
        "*" : Sc,
        text : "text/plain",
        html : "text/html",
        xml : "application/xml, text/xml",
        json : "application/json, text/javascript"
      },
      contents : {
        xml : /xml/,
        html : /html/,
        json : /json/
      },
      responseFields : {
        xml : "responseXML",
        text : "responseText",
        json : "responseJSON"
      },
      converters : {
        /** @type {function (new:String, *=): string} */
        "* text" : String,
        "text html" : true,
        /** @type {function ((number|string)): ?} */
        "text json" : jQuery.parseJSON,
        /** @type {function (string): ?} */
        "text xml" : jQuery.parseXML
      },
      flatOptions : {
        url : true,
        context : true
      }
    },
    /**
     * @param {(Object|string)} target
     * @param {Object} settings
     * @return {?}
     */
    ajaxSetup : function(target, settings) {
      return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
    },
    ajaxPrefilter : addToPrefiltersOrTransports(prefilters),
    ajaxTransport : addToPrefiltersOrTransports(transports),
    /**
     * @param {Object} url
     * @param {Object} options
     * @return {?}
     */
    ajax : function(url, options) {
      /**
       * @param {number} status
       * @param {Node} nativeStatusText
       * @param {Object} responses
       * @param {string} total
       * @return {undefined}
       */
      function done(status, nativeStatusText, responses, total) {
        var isSuccess;
        var success;
        var error;
        var response;
        var modified;
        /** @type {Node} */
        var statusText = nativeStatusText;
        if (2 !== number) {
          /** @type {number} */
          number = 2;
          if (tref) {
            clearTimeout(tref);
          }
          transport = void 0;
          value = total || "";
          /** @type {number} */
          jqXHR.readyState = status > 0 ? 4 : 0;
          /** @type {boolean} */
          isSuccess = status >= 200 && 300 > status || 304 === status;
          if (responses) {
            response = ajaxHandleResponses(s, jqXHR, responses);
          }
          response = ajaxConvert(s, response, jqXHR, isSuccess);
          if (isSuccess) {
            if (s.ifModified) {
              modified = jqXHR.getResponseHeader("Last-Modified");
              if (modified) {
                jQuery.lastModified[cacheURL] = modified;
              }
              modified = jqXHR.getResponseHeader("etag");
              if (modified) {
                jQuery.etag[cacheURL] = modified;
              }
            }
            if (204 === status || "HEAD" === s.type) {
              /** @type {string} */
              statusText = "nocontent";
            } else {
              if (304 === status) {
                /** @type {string} */
                statusText = "notmodified";
              } else {
                statusText = response.state;
                success = response.data;
                error = response.error;
                /** @type {boolean} */
                isSuccess = !error;
              }
            }
          } else {
            error = statusText;
            if (status || !statusText) {
              /** @type {string} */
              statusText = "error";
              if (0 > status) {
                /** @type {number} */
                status = 0;
              }
            }
          }
          /** @type {number} */
          jqXHR.status = status;
          /** @type {string} */
          jqXHR.statusText = (nativeStatusText || statusText) + "";
          if (isSuccess) {
            deferred.resolveWith(context, [success, statusText, jqXHR]);
          } else {
            deferred.rejectWith(context, [jqXHR, statusText, error]);
          }
          jqXHR.statusCode(statusCode);
          statusCode = void 0;
          if (i) {
            globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
          }
          completeDeferred.fireWith(context, [jqXHR, statusText]);
          if (i) {
            globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
            if (!--jQuery.active) {
              jQuery.event.trigger("ajaxStop");
            }
          }
        }
      }
      if ("object" == typeof url) {
        /** @type {Object} */
        options = url;
        url = void 0;
      }
      options = options || {};
      var d;
      var p;
      var cacheURL;
      var value;
      var tref;
      var i;
      var transport;
      var target;
      var s = jQuery.ajaxSetup({}, options);
      var context = s.context || s;
      var globalEventContext = s.context && (context.nodeType || context.jquery) ? jQuery(context) : jQuery.event;
      var deferred = jQuery.Deferred();
      var completeDeferred = jQuery.Callbacks("once memory");
      var statusCode = s.statusCode || {};
      var requestHeaders = {};
      var requestHeadersNames = {};
      /** @type {number} */
      var number = 0;
      /** @type {string} */
      var strAbort = "canceled";
      var jqXHR = {
        readyState : 0,
        /**
         * @param {string} key
         * @return {?}
         */
        getResponseHeader : function(key) {
          var src;
          if (2 === number) {
            if (!target) {
              target = {};
              for (;src = re.exec(value);) {
                /** @type {string} */
                target[src[1].toLowerCase()] = src[2];
              }
            }
            src = target[key.toLowerCase()];
          }
          return null == src ? null : src;
        },
        /**
         * @return {?}
         */
        getAllResponseHeaders : function() {
          return 2 === number ? value : null;
        },
        /**
         * @param {string} name
         * @param {?} value
         * @return {?}
         */
        setRequestHeader : function(name, value) {
          var lname = name.toLowerCase();
          return number || (name = requestHeadersNames[lname] = requestHeadersNames[lname] || name, requestHeaders[name] = value), this;
        },
        /**
         * @param {(Object|number)} type
         * @return {?}
         */
        overrideMimeType : function(type) {
          return number || (s.mimeType = type), this;
        },
        /**
         * @param {Object} map
         * @return {?}
         */
        statusCode : function(map) {
          var letter;
          if (map) {
            if (2 > number) {
              for (letter in map) {
                /** @type {Array} */
                statusCode[letter] = [statusCode[letter], map[letter]];
              }
            } else {
              jqXHR.always(map[jqXHR.status]);
            }
          }
          return this;
        },
        /**
         * @param {string} statusText
         * @return {?}
         */
        abort : function(statusText) {
          var finalText = statusText || strAbort;
          return transport && transport.abort(finalText), done(0, finalText), this;
        }
      };
      if (deferred.promise(jqXHR).complete = completeDeferred.add, jqXHR.success = jqXHR.done, jqXHR.error = jqXHR.fail, s.url = ((url || (s.url || ajaxLocation)) + "").replace(currDirRegExp, "").replace(rprotocol, prop[1] + "//"), s.type = options.method || (options.type || (s.method || s.type)), s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(core_rnotwhite) || [""], null == s.crossDomain && (d = quickExpr.exec(s.url.toLowerCase()), s.crossDomain = !(!d || d[1] === prop[1] && (d[2] === 
      prop[2] && (d[3] || ("http:" === d[1] ? "80" : "443")) === (prop[3] || ("http:" === prop[1] ? "80" : "443"))))), s.data && (s.processData && ("string" != typeof s.data && (s.data = jQuery.param(s.data, s.traditional)))), inspectPrefiltersOrTransports(prefilters, s, options, jqXHR), 2 === number) {
        return jqXHR;
      }
      i = jQuery.event && s.global;
      if (i) {
        if (0 === jQuery.active++) {
          jQuery.event.trigger("ajaxStart");
        }
      }
      s.type = s.type.toUpperCase();
      /** @type {boolean} */
      s.hasContent = !rnoContent.test(s.type);
      cacheURL = s.url;
      if (!s.hasContent) {
        if (s.data) {
          /** @type {string} */
          cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data;
          delete s.data;
        }
        if (s.cache === false) {
          s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + iIdCounter++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + iIdCounter++;
        }
      }
      if (s.ifModified) {
        if (jQuery.lastModified[cacheURL]) {
          jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
        }
        if (jQuery.etag[cacheURL]) {
          jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
        }
      }
      if (s.data && (s.hasContent && s.contentType !== false) || options.contentType) {
        jqXHR.setRequestHeader("Content-Type", s.contentType);
      }
      jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + ("*" !== s.dataTypes[0] ? ", " + Sc + "; q=0.01" : "") : s.accepts["*"]);
      for (p in s.headers) {
        jqXHR.setRequestHeader(p, s.headers[p]);
      }
      if (s.beforeSend && (s.beforeSend.call(context, jqXHR, s) === false || 2 === number)) {
        return jqXHR.abort();
      }
      /** @type {string} */
      strAbort = "abort";
      for (p in{
        success : 1,
        error : 1,
        complete : 1
      }) {
        jqXHR[p](s[p]);
      }
      if (transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR)) {
        /** @type {number} */
        jqXHR.readyState = 1;
        if (i) {
          globalEventContext.trigger("ajaxSend", [jqXHR, s]);
        }
        if (s.async) {
          if (s.timeout > 0) {
            /** @type {number} */
            tref = setTimeout(function() {
              jqXHR.abort("timeout");
            }, s.timeout);
          }
        }
        try {
          /** @type {number} */
          number = 1;
          transport.send(requestHeaders, done);
        } catch (e) {
          if (!(2 > number)) {
            throw e;
          }
          done(-1, e);
        }
      } else {
        done(-1, "No Transport");
      }
      return jqXHR;
    },
    /**
     * @param {string} optgroup
     * @param {Object} name
     * @param {Object} callback
     * @return {?}
     */
    getJSON : function(optgroup, name, callback) {
      return jQuery.get(optgroup, name, callback, "json");
    },
    /**
     * @param {string} optgroup
     * @param {Object} callback
     * @return {?}
     */
    getScript : function(optgroup, callback) {
      return jQuery.get(optgroup, void 0, callback, "script");
    }
  });
  jQuery.each(["get", "post"], function(dataAndEvents, method) {
    /**
     * @param {string} requestUrl
     * @param {Object} html
     * @param {Object} success
     * @param {boolean} dataType
     * @return {?}
     */
    jQuery[method] = function(requestUrl, html, success, dataType) {
      return jQuery.isFunction(html) && (dataType = dataType || success, success = html, html = void 0), jQuery.ajax({
        url : requestUrl,
        type : method,
        dataType : dataType,
        data : html,
        success : success
      });
    };
  });
  /**
   * @param {string} url
   * @return {?}
   */
  jQuery._evalUrl = function(url) {
    return jQuery.ajax({
      url : url,
      type : "GET",
      dataType : "script",
      async : false,
      global : false,
      "throws" : true
    });
  };
  jQuery.fn.extend({
    /**
     * @param {Function} html
     * @return {?}
     */
    wrapAll : function(html) {
      if (jQuery.isFunction(html)) {
        return this.each(function(i) {
          jQuery(this).wrapAll(html.call(this, i));
        });
      }
      if (this[0]) {
        var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
        if (this[0].parentNode) {
          wrap.insertBefore(this[0]);
        }
        wrap.map(function() {
          var sandbox = this;
          for (;sandbox.firstChild && 1 === sandbox.firstChild.nodeType;) {
            sandbox = sandbox.firstChild;
          }
          return sandbox;
        }).append(this);
      }
      return this;
    },
    /**
     * @param {Function} html
     * @return {?}
     */
    wrapInner : function(html) {
      return this.each(jQuery.isFunction(html) ? function(i) {
        jQuery(this).wrapInner(html.call(this, i));
      } : function() {
        var self = jQuery(this);
        var contents = self.contents();
        if (contents.length) {
          contents.wrapAll(html);
        } else {
          self.append(html);
        }
      });
    },
    /**
     * @param {Function} html
     * @return {?}
     */
    wrap : function(html) {
      var isFunction = jQuery.isFunction(html);
      return this.each(function(i) {
        jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
      });
    },
    /**
     * @return {?}
     */
    unwrap : function() {
      return this.parent().each(function() {
        if (!jQuery.nodeName(this, "body")) {
          jQuery(this).replaceWith(this.childNodes);
        }
      }).end();
    }
  });
  /**
   * @param {Function} a
   * @return {?}
   */
  jQuery.expr.filters.hidden = function(a) {
    return a.offsetWidth <= 0 && a.offsetHeight <= 0 || !support.reliableHiddenOffsets() && "none" === (a.style && a.style.display || jQuery.css(a, "display"));
  };
  /**
   * @param {Function} QUnit
   * @return {?}
   */
  jQuery.expr.filters.visible = function(QUnit) {
    return!jQuery.expr.filters.hidden(QUnit);
  };
  /** @type {RegExp} */
  var rQuot = /%20/g;
  /** @type {RegExp} */
  var rbracket = /\[\]$/;
  /** @type {RegExp} */
  var rCRLF = /\r?\n/g;
  /** @type {RegExp} */
  var mouseTypeRegex = /^(?:submit|button|image|reset|file)$/i;
  /** @type {RegExp} */
  var rsubmittable = /^(?:input|select|textarea|keygen)/i;
  /**
   * @param {Object} a
   * @param {Object} traditional
   * @return {?}
   */
  jQuery.param = function(a, traditional) {
    var prefix;
    /** @type {Array} */
    var klass = [];
    /**
     * @param {?} key
     * @param {Object} value
     * @return {undefined}
     */
    var add = function(key, value) {
      value = jQuery.isFunction(value) ? value() : null == value ? "" : value;
      /** @type {string} */
      klass[klass.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };
    if (void 0 === traditional && (traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional), jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
      jQuery.each(a, function() {
        add(this.name, this.value);
      });
    } else {
      for (prefix in a) {
        buildParams(prefix, a[prefix], traditional, add);
      }
    }
    return klass.join("&").replace(rQuot, "+");
  };
  jQuery.fn.extend({
    /**
     * @return {?}
     */
    serialize : function() {
      return jQuery.param(this.serializeArray());
    },
    /**
     * @return {?}
     */
    serializeArray : function() {
      return this.map(function() {
        var elements = jQuery.prop(this, "elements");
        return elements ? jQuery.makeArray(elements) : this;
      }).filter(function() {
        var type = this.type;
        return this.name && (!jQuery(this).is(":disabled") && (rsubmittable.test(this.nodeName) && (!mouseTypeRegex.test(type) && (this.checked || !manipulation_rcheckableType.test(type)))));
      }).map(function(dataAndEvents, elem) {
        var val = jQuery(this).val();
        return null == val ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
          return{
            name : elem.name,
            value : val.replace(rCRLF, "\r\n")
          };
        }) : {
          name : elem.name,
          value : val.replace(rCRLF, "\r\n")
        };
      }).get();
    }
  });
  /** @type {function (): ?} */
  jQuery.ajaxSettings.xhr = void 0 !== win.ActiveXObject ? function() {
    return!this.isLocal && (/^(get|post|head|put|delete|options)$/i.test(this.type) && createStandardXHR()) || createActiveXHR();
  } : createStandardXHR;
  /** @type {number} */
  var rafHandle = 0;
  var requests = {};
  var nativeXHR = jQuery.ajaxSettings.xhr();
  if (win.attachEvent) {
    win.attachEvent("onunload", function() {
      var i;
      for (i in requests) {
        requests[i](void 0, true);
      }
    });
  }
  /** @type {boolean} */
  support.cors = !!nativeXHR && "withCredentials" in nativeXHR;
  /** @type {boolean} */
  nativeXHR = support.ajax = !!nativeXHR;
  if (nativeXHR) {
    jQuery.ajaxTransport(function(s) {
      if (!s.crossDomain || support.cors) {
        var callback;
        return{
          /**
           * @param {Object} headers
           * @param {Function} complete
           * @return {undefined}
           */
          send : function(headers, complete) {
            var i;
            var xhr = s.xhr();
            /** @type {number} */
            var callbackHandle = ++rafHandle;
            if (xhr.open(s.type, s.url, s.async, s.username, s.password), s.xhrFields) {
              for (i in s.xhrFields) {
                xhr[i] = s.xhrFields[i];
              }
            }
            if (s.mimeType) {
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType(s.mimeType);
              }
            }
            if (!s.crossDomain) {
              if (!headers["X-Requested-With"]) {
                /** @type {string} */
                headers["X-Requested-With"] = "XMLHttpRequest";
              }
            }
            for (i in headers) {
              if (void 0 !== headers[i]) {
                xhr.setRequestHeader(i, headers[i] + "");
              }
            }
            xhr.send(s.hasContent && s.data || null);
            /**
             * @param {?} opt_attributes
             * @param {boolean} isAbort
             * @return {undefined}
             */
            callback = function(opt_attributes, isAbort) {
              var e;
              var statusText;
              var responses;
              if (callback && (isAbort || 4 === xhr.readyState)) {
                if (delete requests[callbackHandle], callback = void 0, xhr.onreadystatechange = jQuery.noop, isAbort) {
                  if (4 !== xhr.readyState) {
                    xhr.abort();
                  }
                } else {
                  responses = {};
                  e = xhr.status;
                  if ("string" == typeof xhr.responseText) {
                    /** @type {string} */
                    responses.text = xhr.responseText;
                  }
                  try {
                    statusText = xhr.statusText;
                  } catch (k) {
                    /** @type {string} */
                    statusText = "";
                  }
                  if (e || (!s.isLocal || s.crossDomain)) {
                    if (1223 === e) {
                      /** @type {number} */
                      e = 204;
                    }
                  } else {
                    /** @type {number} */
                    e = responses.text ? 200 : 404;
                  }
                }
              }
              if (responses) {
                complete(e, statusText, responses, xhr.getAllResponseHeaders());
              }
            };
            if (s.async) {
              if (4 === xhr.readyState) {
                setTimeout(callback);
              } else {
                /** @type {function (?, boolean): undefined} */
                xhr.onreadystatechange = requests[callbackHandle] = callback;
              }
            } else {
              callback();
            }
          },
          /**
           * @return {undefined}
           */
          abort : function() {
            if (callback) {
              callback(void 0, true);
            }
          }
        };
      }
    });
  }
  jQuery.ajaxSetup({
    accepts : {
      script : "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents : {
      script : /(?:java|ecma)script/
    },
    converters : {
      /**
       * @param {string} value
       * @return {?}
       */
      "text script" : function(value) {
        return jQuery.globalEval(value), value;
      }
    }
  });
  jQuery.ajaxPrefilter("script", function(s) {
    if (void 0 === s.cache) {
      /** @type {boolean} */
      s.cache = false;
    }
    if (s.crossDomain) {
      /** @type {string} */
      s.type = "GET";
      /** @type {boolean} */
      s.global = false;
    }
  });
  jQuery.ajaxTransport("script", function(s) {
    if (s.crossDomain) {
      var script;
      var head = doc.head || (jQuery("head")[0] || doc.documentElement);
      return{
        /**
         * @param {string} _
         * @param {Function} callback
         * @return {undefined}
         */
        send : function(_, callback) {
          script = doc.createElement("script");
          /** @type {boolean} */
          script.async = true;
          if (s.scriptCharset) {
            script.charset = s.scriptCharset;
          }
          script.src = s.url;
          /** @type {function (Function, Function): undefined} */
          script.onload = script.onreadystatechange = function(a, name) {
            if (name || (!script.readyState || /loaded|complete/.test(script.readyState))) {
              /** @type {null} */
              script.onload = script.onreadystatechange = null;
              if (script.parentNode) {
                script.parentNode.removeChild(script);
              }
              /** @type {null} */
              script = null;
              if (!name) {
                callback(200, "success");
              }
            }
          };
          head.insertBefore(script, head.firstChild);
        },
        /**
         * @return {undefined}
         */
        abort : function() {
          if (script) {
            script.onload(void 0, true);
          }
        }
      };
    }
  });
  /** @type {Array} */
  var eventPath = [];
  /** @type {RegExp} */
  var rjsonp = /(=)\?(?=&|$)|\?\?/;
  jQuery.ajaxSetup({
    jsonp : "callback",
    /**
     * @return {?}
     */
    jsonpCallback : function() {
      var unlock = eventPath.pop() || jQuery.expando + "_" + iIdCounter++;
      return this[unlock] = true, unlock;
    }
  });
  jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
    var name;
    var copy;
    var a;
    /** @type {(boolean|string)} */
    var jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : "string" == typeof s.data && (!(s.contentType || "").indexOf("application/x-www-form-urlencoded") && (rjsonp.test(s.data) && "data")));
    return jsonProp || "jsonp" === s.dataTypes[0] ? (name = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback, jsonProp ? s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + name) : s.jsonp !== false && (s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + name), s.converters["script json"] = function() {
      return a || jQuery.error(name + " was not called"), a[0];
    }, s.dataTypes[0] = "json", copy = win[name], win[name] = function() {
      /** @type {Arguments} */
      a = arguments;
    }, jqXHR.always(function() {
      win[name] = copy;
      if (s[name]) {
        s.jsonpCallback = originalSettings.jsonpCallback;
        eventPath.push(name);
      }
      if (a) {
        if (jQuery.isFunction(copy)) {
          copy(a[0]);
        }
      }
      a = copy = void 0;
    }), "script") : void 0;
  });
  /**
   * @param {?} data
   * @param {boolean} context
   * @param {boolean} keepScripts
   * @return {?}
   */
  jQuery.parseHTML = function(data, context, keepScripts) {
    if (!data || "string" != typeof data) {
      return null;
    }
    if ("boolean" == typeof context) {
      /** @type {boolean} */
      keepScripts = context;
      /** @type {boolean} */
      context = false;
    }
    context = context || doc;
    /** @type {(Array.<string>|null)} */
    var parsed = rsingleTag.exec(data);
    /** @type {(Array|boolean)} */
    var scripts = !keepScripts && [];
    return parsed ? [context.createElement(parsed[1])] : (parsed = jQuery.buildFragment([data], context, scripts), scripts && (scripts.length && jQuery(scripts).remove()), jQuery.merge([], parsed.childNodes));
  };
  /** @type {function (Function, Object, Object): ?} */
  var matcherFunction = jQuery.fn.load;
  /**
   * @param {Function} a
   * @param {Object} name
   * @param {Object} attributes
   * @return {?}
   */
  jQuery.fn.load = function(a, name, attributes) {
    if ("string" != typeof a && matcherFunction) {
      return matcherFunction.apply(this, arguments);
    }
    var selector;
    var response;
    var type;
    var self = this;
    var b = a.indexOf(" ");
    return b >= 0 && (selector = jQuery.trim(a.slice(b, a.length)), a = a.slice(0, b)), jQuery.isFunction(name) ? (attributes = name, name = void 0) : name && ("object" == typeof name && (type = "POST")), self.length > 0 && jQuery.ajax({
      /** @type {Function} */
      url : a,
      type : type,
      dataType : "html",
      data : name
    }).done(function(responseText) {
      /** @type {Arguments} */
      response = arguments;
      self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
    }).complete(attributes && function(a, name) {
      self.each(attributes, response || [a.responseText, name, a]);
    }), this;
  };
  jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(dataAndEvents, name) {
    /**
     * @param {Function} selector
     * @return {?}
     */
    jQuery.fn[name] = function(selector) {
      return this.on(name, selector);
    };
  });
  /**
   * @param {string} elem
   * @return {?}
   */
  jQuery.expr.filters.animated = function(elem) {
    return jQuery.grep(jQuery.timers, function(fn) {
      return elem === fn.elem;
    }).length;
  };
  var docElem = win.document.documentElement;
  jQuery.offset = {
    /**
     * @param {string} elem
     * @param {Object} options
     * @param {?} i
     * @return {undefined}
     */
    setOffset : function(elem, options, i) {
      var curPosition;
      var curLeft;
      var curCSSTop;
      var curTop;
      var curOffset;
      var curCSSLeft;
      var j;
      var position = jQuery.css(elem, "position");
      var curElem = jQuery(elem);
      var props = {};
      if ("static" === position) {
        /** @type {string} */
        elem.style.position = "relative";
      }
      curOffset = curElem.offset();
      curCSSTop = jQuery.css(elem, "top");
      curCSSLeft = jQuery.css(elem, "left");
      /** @type {boolean} */
      j = ("absolute" === position || "fixed" === position) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1;
      if (j) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;
      } else {
        /** @type {number} */
        curTop = parseFloat(curCSSTop) || 0;
        /** @type {number} */
        curLeft = parseFloat(curCSSLeft) || 0;
      }
      if (jQuery.isFunction(options)) {
        options = options.call(elem, i, curOffset);
      }
      if (null != options.top) {
        /** @type {number} */
        props.top = options.top - curOffset.top + curTop;
      }
      if (null != options.left) {
        /** @type {number} */
        props.left = options.left - curOffset.left + curLeft;
      }
      if ("using" in options) {
        options.using.call(elem, props);
      } else {
        curElem.css(props);
      }
    }
  };
  jQuery.fn.extend({
    /**
     * @param {number} options
     * @return {?}
     */
    offset : function(options) {
      if (arguments.length) {
        return void 0 === options ? this : this.each(function(dataName) {
          jQuery.offset.setOffset(this, options, dataName);
        });
      }
      var doc;
      var win;
      var animation = {
        top : 0,
        left : 0
      };
      var b = this[0];
      var elem = b && b.ownerDocument;
      if (elem) {
        return doc = elem.documentElement, jQuery.contains(doc, b) ? (typeof b.getBoundingClientRect !== text && (animation = b.getBoundingClientRect()), win = getWindow(elem), {
          top : animation.top + (win.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
          left : animation.left + (win.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
        }) : animation;
      }
    },
    /**
     * @return {?}
     */
    position : function() {
      if (this[0]) {
        var offsetParent;
        var offset;
        var parentOffset = {
          top : 0,
          left : 0
        };
        var which = this[0];
        return "fixed" === jQuery.css(which, "position") ? offset = which.getBoundingClientRect() : (offsetParent = this.offsetParent(), offset = this.offset(), jQuery.nodeName(offsetParent[0], "html") || (parentOffset = offsetParent.offset()), parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true), parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true)), {
          top : offset.top - parentOffset.top - jQuery.css(which, "marginTop", true),
          left : offset.left - parentOffset.left - jQuery.css(which, "marginLeft", true)
        };
      }
    },
    /**
     * @return {?}
     */
    offsetParent : function() {
      return this.map(function() {
        var offsetParent = this.offsetParent || docElem;
        for (;offsetParent && (!jQuery.nodeName(offsetParent, "html") && "static" === jQuery.css(offsetParent, "position"));) {
          offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || docElem;
      });
    }
  });
  jQuery.each({
    scrollLeft : "pageXOffset",
    scrollTop : "pageYOffset"
  }, function(name, prop) {
    /** @type {boolean} */
    var top = /Y/.test(prop);
    /**
     * @param {Function} isXML
     * @return {?}
     */
    jQuery.fn[name] = function(isXML) {
      return access(this, function(elem, method, val) {
        var win = getWindow(elem);
        return void 0 === val ? win ? prop in win ? win[prop] : win.document.documentElement[method] : elem[method] : void(win ? win.scrollTo(top ? jQuery(win).scrollLeft() : val, top ? val : jQuery(win).scrollTop()) : elem[method] = val);
      }, name, isXML, arguments.length, null);
    };
  });
  jQuery.each(["top", "left"], function(dataAndEvents, prop) {
    jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, val) {
      return val ? (val = curCSS(elem, prop), rnumnonpx.test(val) ? jQuery(elem).position()[prop] + "px" : val) : void 0;
    });
  });
  jQuery.each({
    Height : "height",
    Width : "width"
  }, function(name, value) {
    jQuery.each({
      padding : "inner" + name,
      content : value,
      "" : "outer" + name
    }, function(defaultExtra, original) {
      /**
       * @param {?} margin
       * @param {boolean} dataAndEvents
       * @return {?}
       */
      jQuery.fn[original] = function(margin, dataAndEvents) {
        var chainable = arguments.length && (defaultExtra || "boolean" != typeof margin);
        var extra = defaultExtra || (margin === true || dataAndEvents === true ? "margin" : "border");
        return access(this, function(exports, optgroup, value) {
          var doc;
          return jQuery.isWindow(exports) ? exports.document.documentElement["client" + name] : 9 === exports.nodeType ? (doc = exports.documentElement, Math.max(exports.body["scroll" + name], doc["scroll" + name], exports.body["offset" + name], doc["offset" + name], doc["client" + name])) : void 0 === value ? jQuery.css(exports, optgroup, extra) : jQuery.style(exports, optgroup, value, extra);
        }, value, chainable ? margin : void 0, chainable, null);
      };
    });
  });
  /**
   * @return {?}
   */
  jQuery.fn.size = function() {
    return this.length;
  };
  jQuery.fn.andSelf = jQuery.fn.addBack;
  if ("function" == typeof define) {
    if (define.amd) {
      define("jquery", [], function() {
        return jQuery;
      });
    }
  }
  var $ = win.jQuery;
  var _$ = win.$;
  return jQuery.noConflict = function(deep) {
    return win.$ === jQuery && (win.$ = _$), deep && (win.jQuery === jQuery && (win.jQuery = $)), jQuery;
  }, typeof dataAndEvents === text && (win.jQuery = win.$ = jQuery), jQuery;
}), function() {
  /**
   * @param {number} step
   * @return {?}
   */
  function loop(step) {
    /**
     * @param {Function} array
     * @param {Function} callback
     * @param {(RegExp|string)} basis
     * @param {Array} list
     * @param {number} value
     * @param {number} x
     * @return {?}
     */
    function loop(array, callback, basis, list, value, x) {
      for (;value >= 0 && x > value;value += step) {
        var index = list ? list[value] : value;
        basis = callback(basis, array[index], index, array);
      }
      return basis;
    }
    return function(g, callback, basis, thisArg) {
      callback = createCallback(callback, thisArg, 4);
      var list = !isArray(g) && _.keys(g);
      var ll = (list || g).length;
      /** @type {number} */
      var value = step > 0 ? 0 : ll - 1;
      return arguments.length < 3 && (basis = g[list ? list[value] : value], value += step), loop(g, callback, basis, list, value, ll);
    };
  }
  /**
   * @param {number} expectedNumberOfNonCommentArgs
   * @return {?}
   */
  function format(expectedNumberOfNonCommentArgs) {
    return function(obj, callback, thisObj) {
      callback = makeIterator(callback, thisObj);
      var y = value(obj);
      /** @type {number} */
      var x = expectedNumberOfNonCommentArgs > 0 ? 0 : y - 1;
      for (;x >= 0 && y > x;x += expectedNumberOfNonCommentArgs) {
        if (callback(obj[x], x, obj)) {
          return x;
        }
      }
      return-1;
    };
  }
  /**
   * @param {number} nodeLength
   * @param {?} $
   * @param {number} f
   * @return {?}
   */
  function init(nodeLength, $, f) {
    return function(node, y, x) {
      /** @type {number} */
      var i = 0;
      var end = value(node);
      if ("number" == typeof x) {
        if (nodeLength > 0) {
          /** @type {number} */
          i = x >= 0 ? x : Math.max(x + end, i);
        } else {
          end = x >= 0 ? Math.min(x + 1, end) : x + end + 1;
        }
      } else {
        if (f && (x && end)) {
          return x = f(node, y), node[x] === y ? x : -1;
        }
      }
      if (y !== y) {
        return x = $(slice.call(node, i, end), _.isNaN), x >= 0 ? x + i : -1;
      }
      /** @type {number} */
      x = nodeLength > 0 ? i : end - 1;
      for (;x >= 0 && end > x;x += nodeLength) {
        if (node[x] === y) {
          return x;
        }
      }
      return-1;
    };
  }
  /**
   * @param {Object} obj
   * @param {Array} arr
   * @return {undefined}
   */
  function remove(obj, arr) {
    /** @type {number} */
    var index = tokenized.length;
    var c = obj.constructor;
    var extention = _.isFunction(c) && c.prototype || ObjProto;
    /** @type {string} */
    var key = "constructor";
    if (_.has(obj, key)) {
      if (!_.contains(arr, key)) {
        arr.push(key);
      }
    }
    for (;index--;) {
      key = tokenized[index];
      if (key in obj) {
        if (obj[key] !== extention[key]) {
          if (!_.contains(arr, key)) {
            arr.push(key);
          }
        }
      }
    }
  }
  var root = this;
  var previousUnderscore = root._;
  var ArrayProto = Array.prototype;
  var ObjProto = Object.prototype;
  var FuncProto = Function.prototype;
  /** @type {function (this:(Array.<T>|{length: number}), ...[T]): number} */
  var push = ArrayProto.push;
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var slice = ArrayProto.slice;
  /** @type {function (this:*): string} */
  var toString = ObjProto.toString;
  /** @type {function (this:Object, *): boolean} */
  var hasOwnProperty = ObjProto.hasOwnProperty;
  /** @type {function (*): boolean} */
  var nativeIsArray = Array.isArray;
  /** @type {function (Object): Array.<string>} */
  var nativeKeys = Object.keys;
  /** @type {function (this:Function, (Object|null|undefined), ...[*]): Function} */
  var nativeBind = FuncProto.bind;
  /** @type {function ((Object|null), (Object|null)=): Object} */
  var freeze = Object.create;
  /**
   * @return {undefined}
   */
  var Contact = function() {
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  var _ = function(obj) {
    return obj instanceof _ ? obj : this instanceof _ ? void(this._wrapped = obj) : new _(obj);
  };
  if ("undefined" != typeof exports) {
    if ("undefined" != typeof module) {
      if (module.exports) {
        /** @type {function (?): ?} */
        exports = module.exports = _;
      }
    }
    /** @type {function (?): ?} */
    exports._ = _;
  } else {
    /** @type {function (?): ?} */
    root._ = _;
  }
  /** @type {string} */
  _.VERSION = "1.8.3";
  /**
   * @param {Function} func
   * @param {string} thisArg
   * @param {number} deepDataAndEvents
   * @return {?}
   */
  var createCallback = function(func, thisArg, deepDataAndEvents) {
    if (void 0 === thisArg) {
      return func;
    }
    switch(null == deepDataAndEvents ? 3 : deepDataAndEvents) {
      case 1:
        return function(name) {
          return func.call(thisArg, name);
        };
      case 2:
        return function(name, index) {
          return func.call(thisArg, name, index);
        };
      case 3:
        return function(name, index, object) {
          return func.call(thisArg, name, index, object);
        };
      case 4:
        return function(name, index, object, collection) {
          return func.call(thisArg, name, index, object, collection);
        };
    }
    return function() {
      return func.apply(thisArg, arguments);
    };
  };
  /**
   * @param {Object} func
   * @param {string} thisObj
   * @param {number} deepDataAndEvents
   * @return {?}
   */
  var makeIterator = function(func, thisObj, deepDataAndEvents) {
    return null == func ? _.identity : _.isFunction(func) ? createCallback(func, thisObj, deepDataAndEvents) : _.isObject(func) ? _.matcher(func) : _.property(func);
  };
  /**
   * @param {Object} callback
   * @param {string} thisObj
   * @return {?}
   */
  _.iteratee = function(callback, thisObj) {
    return makeIterator(callback, thisObj, 1 / 0);
  };
  /**
   * @param {Function} fun
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  var bind = function(fun, dataAndEvents) {
    return function(old) {
      /** @type {number} */
      var l = arguments.length;
      if (2 > l || null == old) {
        return old;
      }
      /** @type {number} */
      var i = 1;
      for (;l > i;i++) {
        var node = arguments[i];
        var r = fun(node);
        var a = r.length;
        /** @type {number} */
        var b = 0;
        for (;a > b;b++) {
          var name = r[b];
          if (!(dataAndEvents && void 0 !== old[name])) {
            old[name] = node[name];
          }
        }
      }
      return old;
    };
  };
  /**
   * @param {Object} QUnit
   * @return {?}
   */
  var create = function(QUnit) {
    if (!_.isObject(QUnit)) {
      return{};
    }
    if (freeze) {
      return freeze(QUnit);
    }
    /** @type {Object} */
    Contact.prototype = QUnit;
    var contact = new Contact;
    return Contact.prototype = null, contact;
  };
  /**
   * @param {string} key
   * @return {?}
   */
  var property = function(key) {
    return function($cookies) {
      return null == $cookies ? void 0 : $cookies[key];
    };
  };
  /** @type {number} */
  var max = Math.pow(2, 53) - 1;
  var value = property("length");
  /**
   * @param {?} obj
   * @return {?}
   */
  var isArray = function(obj) {
    var val = value(obj);
    return "number" == typeof val && (val >= 0 && max >= val);
  };
  /** @type {function (Object, Function, string): ?} */
  _.each = _.forEach = function(obj, callback, thisArg) {
    callback = createCallback(callback, thisArg);
    var i;
    var l;
    if (isArray(obj)) {
      /** @type {number} */
      i = 0;
      l = obj.length;
      for (;l > i;i++) {
        callback(obj[i], i, obj);
      }
    } else {
      var items = _.keys(obj);
      /** @type {number} */
      i = 0;
      l = items.length;
      for (;l > i;i++) {
        callback(obj[items[i]], items[i], obj);
      }
    }
    return obj;
  };
  /** @type {function (Object, Function, string): ?} */
  _.map = _.collect = function(obj, callback, thisObj) {
    callback = makeIterator(callback, thisObj);
    var indices = !isArray(obj) && _.keys(obj);
    var indents = (indices || obj).length;
    /** @type {Array} */
    var result = Array(indents);
    /** @type {number} */
    var i = 0;
    for (;indents > i;i++) {
      var index = indices ? indices[i] : i;
      result[i] = callback(obj[index], index, obj);
    }
    return result;
  };
  _.reduce = _.foldl = _.inject = loop(1);
  _.reduceRight = _.foldr = loop(-1);
  /** @type {function (Object, ?, string): ?} */
  _.find = _.detect = function(obj, f, a) {
    var val;
    return val = isArray(obj) ? _.findIndex(obj, f, a) : _.findKey(obj, f, a), void 0 !== val && -1 !== val ? obj[val] : void 0;
  };
  /** @type {function (Function, Function, string): ?} */
  _.filter = _.select = function(a, callback, thisObj) {
    /** @type {Array} */
    var bucket = [];
    return callback = makeIterator(callback, thisObj), _.each(a, function(value, mongoObject, arg) {
      if (callback(value, mongoObject, arg)) {
        bucket.push(value);
      }
    }), bucket;
  };
  /**
   * @param {Function} ok
   * @param {Function} iterator
   * @param {Object} options
   * @return {?}
   */
  _.reject = function(ok, iterator, options) {
    return _.filter(ok, _.negate(makeIterator(iterator)), options);
  };
  /** @type {function (?, Object, string): ?} */
  _.every = _.all = function(object, callback, thisObj) {
    callback = makeIterator(callback, thisObj);
    var list = !isArray(object) && _.keys(object);
    var cnl = (list || object).length;
    /** @type {number} */
    var value = 0;
    for (;cnl > value;value++) {
      var index = list ? list[value] : value;
      if (!callback(object[index], index, object)) {
        return false;
      }
    }
    return true;
  };
  /** @type {function (string, Object, string): ?} */
  _.some = _.any = function(collection, callback, thisObj) {
    callback = makeIterator(callback, thisObj);
    var indices = !isArray(collection) && _.keys(collection);
    var l = (indices || collection).length;
    /** @type {number} */
    var i = 0;
    for (;l > i;i++) {
      var index = indices ? indices[i] : i;
      if (callback(collection[index], index, collection)) {
        return true;
      }
    }
    return false;
  };
  /** @type {function (?, string, (number|string), boolean): ?} */
  _.contains = _.includes = _.include = function(val, item, id, msg) {
    return isArray(val) || (val = _.values(val)), ("number" != typeof id || msg) && (id = 0), _.indexOf(val, item, id) >= 0;
  };
  /**
   * @param {Object} scripts
   * @param {?} method
   * @return {?}
   */
  _.invoke = function(scripts, method) {
    /** @type {Array.<?>} */
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(scripts, function(recurring) {
      var wrapper = isFunc ? method : recurring[method];
      return null == wrapper ? wrapper : wrapper.apply(recurring, args);
    });
  };
  /**
   * @param {?} val
   * @param {(number|string)} key
   * @return {?}
   */
  _.pluck = function(val, key) {
    return _.map(val, _.property(key));
  };
  /**
   * @param {Function} QUnit
   * @param {boolean} val
   * @return {?}
   */
  _.where = function(QUnit, val) {
    return _.filter(QUnit, _.matcher(val));
  };
  /**
   * @param {string} extra
   * @param {Object} item
   * @return {?}
   */
  _.findWhere = function(extra, item) {
    return _.find(extra, _.matcher(item));
  };
  /**
   * @param {number} attributes
   * @param {number} iterator
   * @param {string} thisObj
   * @return {?}
   */
  _.max = function(attributes, iterator, thisObj) {
    var value;
    var temp;
    /** @type {number} */
    var result = -1 / 0;
    /** @type {number} */
    var compare = -1 / 0;
    if (null == iterator && null != attributes) {
      attributes = isArray(attributes) ? attributes : _.values(attributes);
      /** @type {number} */
      var name = 0;
      var aLength = attributes.length;
      for (;aLength > name;name++) {
        value = attributes[name];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iterator = makeIterator(iterator, thisObj);
      _.each(attributes, function(value, index, arr) {
        temp = iterator(value, index, arr);
        if (temp > compare || temp === -1 / 0 && result === -1 / 0) {
          /** @type {number} */
          result = value;
          compare = temp;
        }
      });
    }
    return result;
  };
  /**
   * @param {?} attributes
   * @param {number} iterator
   * @param {string} thisObj
   * @return {?}
   */
  _.min = function(attributes, iterator, thisObj) {
    var part;
    var temp;
    /** @type {number} */
    var value = 1 / 0;
    /** @type {number} */
    var max = 1 / 0;
    if (null == iterator && null != attributes) {
      attributes = isArray(attributes) ? attributes : _.values(attributes);
      /** @type {number} */
      var i = 0;
      var l = attributes.length;
      for (;l > i;i++) {
        part = attributes[i];
        if (value > part) {
          value = part;
        }
      }
    } else {
      iterator = makeIterator(iterator, thisObj);
      _.each(attributes, function(x, index, arr) {
        temp = iterator(x, index, arr);
        if (max > temp || 1 / 0 === temp && 1 / 0 === value) {
          /** @type {number} */
          value = x;
          max = temp;
        }
      });
    }
    return value;
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.shuffle = function(obj) {
    var index;
    var value = isArray(obj) ? obj : _.values(obj);
    var length = value.length;
    /** @type {Array} */
    var result = Array(length);
    /** @type {number} */
    var i = 0;
    for (;length > i;i++) {
      index = _.random(0, i);
      if (index !== i) {
        result[i] = result[index];
      }
      result[index] = value[i];
    }
    return result;
  };
  /**
   * @param {?} obj
   * @param {number} n
   * @param {boolean} guard
   * @return {?}
   */
  _.sample = function(obj, n, guard) {
    return null == n || guard ? (isArray(obj) || (obj = _.values(obj)), obj[_.random(obj.length - 1)]) : _.shuffle(obj).slice(0, Math.max(0, n));
  };
  /**
   * @param {Object} obj
   * @param {Object} callback
   * @param {string} thisObj
   * @return {?}
   */
  _.sortBy = function(obj, callback, thisObj) {
    return callback = makeIterator(callback, thisObj), _.pluck(_.map(obj, function(value, index, collection) {
      return{
        value : value,
        index : index,
        criteria : callback(value, index, collection)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || void 0 === a) {
          return 1;
        }
        if (b > a || void 0 === b) {
          return-1;
        }
      }
      return left.index - right.index;
    }), "value");
  };
  /**
   * @param {Function} behavior
   * @return {?}
   */
  var group = function(behavior) {
    return function(attributes, callback, thisObj) {
      var result = {};
      return callback = makeIterator(callback, thisObj), _.each(attributes, function(key, i) {
        var value = callback(key, i, attributes);
        behavior(result, key, value);
      }), result;
    };
  };
  _.groupBy = group(function(obj, v, key) {
    if (_.has(obj, key)) {
      obj[key].push(v);
    } else {
      /** @type {Array} */
      obj[key] = [v];
    }
  });
  _.indexBy = group(function(qs, val, i) {
    qs[i] = val;
  });
  _.countBy = group(function(obj, dataAndEvents, key) {
    if (_.has(obj, key)) {
      obj[key]++;
    } else {
      /** @type {number} */
      obj[key] = 1;
    }
  });
  /**
   * @param {Object} val
   * @return {?}
   */
  _.toArray = function(val) {
    return val ? _.isArray(val) ? slice.call(val) : isArray(val) ? _.map(val, _.identity) : _.values(val) : [];
  };
  /**
   * @param {string} obj
   * @return {?}
   */
  _.size = function(obj) {
    return null == obj ? 0 : isArray(obj) ? obj.length : _.keys(obj).length;
  };
  /**
   * @param {Function} attributes
   * @param {Error} iterator
   * @param {string} thisObj
   * @return {?}
   */
  _.partition = function(attributes, iterator, thisObj) {
    iterator = makeIterator(iterator, thisObj);
    /** @type {Array} */
    var trues = [];
    /** @type {Array} */
    var falses = [];
    return _.each(attributes, function(value, index, list) {
      (iterator(value, index, list) ? trues : falses).push(value);
    }), [trues, falses];
  };
  /** @type {function (string, number, boolean): ?} */
  _.first = _.head = _.take = function(array, n, guard) {
    return null == array ? void 0 : null == n || guard ? array[0] : _.initial(array, array.length - n);
  };
  /**
   * @param {string} array
   * @param {number} t
   * @param {boolean} r
   * @return {?}
   */
  _.initial = function(array, t, r) {
    return slice.call(array, 0, Math.max(0, array.length - (null == t || r ? 1 : t)));
  };
  /**
   * @param {string} array
   * @param {number} n
   * @param {boolean} guard
   * @return {?}
   */
  _.last = function(array, n, guard) {
    return null == array ? void 0 : null == n || guard ? array[array.length - 1] : _.rest(array, Math.max(0, array.length - n));
  };
  /** @type {function (string, number, boolean): ?} */
  _.rest = _.tail = _.drop = function(array, t, r) {
    return slice.call(array, null == t || r ? 1 : t);
  };
  /**
   * @param {Function} QUnit
   * @return {?}
   */
  _.compact = function(QUnit) {
    return _.filter(QUnit, _.identity);
  };
  /**
   * @param {(Arguments|Array)} obj
   * @param {boolean} shallow
   * @param {boolean} recurring
   * @param {number} dataAndEvents
   * @return {?}
   */
  var flatten = function(obj, shallow, recurring, dataAndEvents) {
    /** @type {Array} */
    var result = [];
    /** @type {number} */
    var ri = 0;
    var argsIndex = dataAndEvents || 0;
    var val = value(obj);
    for (;val > argsIndex;argsIndex++) {
      var iterable = obj[argsIndex];
      if (isArray(iterable) && (_.isArray(iterable) || _.isArguments(iterable))) {
        if (!shallow) {
          iterable = flatten(iterable, shallow, recurring);
        }
        /** @type {number} */
        var i = 0;
        var len = iterable.length;
        result.length += len;
        for (;len > i;) {
          result[ri++] = iterable[i++];
        }
      } else {
        if (!recurring) {
          result[ri++] = iterable;
        }
      }
    }
    return result;
  };
  /**
   * @param {Array} array
   * @param {boolean} shallow
   * @return {?}
   */
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };
  /**
   * @param {Function} array
   * @return {?}
   */
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };
  /** @type {function (Array, string, string, string): ?} */
  _.uniq = _.unique = function(results, isSorted, callback, thisObj) {
    if (!_.isBoolean(isSorted)) {
      /** @type {string} */
      thisObj = callback;
      /** @type {string} */
      callback = isSorted;
      /** @type {boolean} */
      isSorted = false;
    }
    if (null != callback) {
      callback = makeIterator(callback, thisObj);
    }
    /** @type {Array} */
    var arr = [];
    /** @type {Array} */
    var keys = [];
    /** @type {number} */
    var i = 0;
    var val = value(results);
    for (;val > i;i++) {
      var item = results[i];
      var key = callback ? callback(item, i, results) : item;
      if (isSorted) {
        if (!(i && keys === key)) {
          arr.push(item);
        }
        keys = key;
      } else {
        if (callback) {
          if (!_.contains(keys, key)) {
            keys.push(key);
            arr.push(item);
          }
        } else {
          if (!_.contains(arr, item)) {
            arr.push(item);
          }
        }
      }
    }
    return arr;
  };
  /**
   * @return {?}
   */
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };
  /**
   * @param {Array} array
   * @return {?}
   */
  _.intersection = function(array) {
    /** @type {Array} */
    var result = [];
    /** @type {number} */
    var l = arguments.length;
    /** @type {number} */
    var index = 0;
    var idx = value(array);
    for (;idx > index;index++) {
      var item = array[index];
      if (!_.contains(result, item)) {
        /** @type {number} */
        var i = 1;
        for (;l > i && _.contains(arguments[i], item);i++) {
        }
        if (i === l) {
          result.push(item);
        }
      }
    }
    return result;
  };
  /**
   * @param {Function} QUnit
   * @return {?}
   */
  _.difference = function(QUnit) {
    var props = flatten(arguments, true, true, 1);
    return _.filter(QUnit, function(value) {
      return!_.contains(props, value);
    });
  };
  /**
   * @return {?}
   */
  _.zip = function() {
    return _.unzip(arguments);
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.unzip = function(obj) {
    var indents = obj && _.max(obj, value).length || 0;
    /** @type {Array} */
    var result = Array(indents);
    /** @type {number} */
    var key = 0;
    for (;indents > key;key++) {
      result[key] = _.pluck(obj, key);
    }
    return result;
  };
  /**
   * @param {Array} list
   * @param {Array} values
   * @return {?}
   */
  _.object = function(list, values) {
    var result = {};
    /** @type {number} */
    var i = 0;
    var val = value(list);
    for (;val > i;i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };
  _.findIndex = format(1);
  _.findLastIndex = format(-1);
  /**
   * @param {Array} obj
   * @param {?} context
   * @param {Error} iterator
   * @param {string} thisObj
   * @return {?}
   */
  _.sortedIndex = function(obj, context, iterator, thisObj) {
    iterator = makeIterator(iterator, thisObj, 1);
    var key = iterator(context);
    /** @type {number} */
    var low = 0;
    var high = value(obj);
    for (;high > low;) {
      /** @type {number} */
      var mid = Math.floor((low + high) / 2);
      if (iterator(obj[mid]) < key) {
        /** @type {number} */
        low = mid + 1;
      } else {
        /** @type {number} */
        high = mid;
      }
    }
    return low;
  };
  _.indexOf = init(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = init(-1, _.findLastIndex);
  /**
   * @param {number} start
   * @param {number} stop
   * @param {number} step
   * @return {?}
   */
  _.range = function(start, stop, step) {
    if (null == stop) {
      stop = start || 0;
      /** @type {number} */
      start = 0;
    }
    step = step || 1;
    /** @type {number} */
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    /** @type {Array} */
    var result = Array(length);
    /** @type {number} */
    var i = 0;
    for (;length > i;i++, start += step) {
      /** @type {number} */
      result[i] = start;
    }
    return result;
  };
  /**
   * @param {Function} func
   * @param {Function} type
   * @param {(Error|string)} context
   * @param {?} value
   * @param {?} args
   * @return {?}
   */
  var func = function(func, type, context, value, args) {
    if (!(value instanceof type)) {
      return func.apply(context, args);
    }
    var thisBinding = create(func.prototype);
    var result = func.apply(thisBinding, args);
    return _.isObject(result) ? result : thisBinding;
  };
  /**
   * @param {string} name
   * @param {Function=} obj
   * @return {function (...[?]): ?}
   */
  _.bind = function(name, obj) {
    if (nativeBind && name.bind === nativeBind) {
      return nativeBind.apply(name, slice.call(arguments, 1));
    }
    if (!_.isFunction(name)) {
      throw new TypeError("Bind must be called on a function");
    }
    /** @type {Array.<?>} */
    var args = slice.call(arguments, 2);
    /**
     * @return {?}
     */
    var e = function() {
      return func(name, e, obj, this, args.concat(slice.call(arguments)));
    };
    return e;
  };
  /**
   * @param {Function} name
   * @return {?}
   */
  _.partial = function(name) {
    /** @type {Array.<?>} */
    var parsed = slice.call(arguments, 1);
    /**
     * @return {?}
     */
    var after = function() {
      /** @type {number} */
      var x = 0;
      /** @type {number} */
      var l = parsed.length;
      /** @type {Array} */
      var args = Array(l);
      /** @type {number} */
      var i = 0;
      for (;l > i;i++) {
        args[i] = parsed[i] === _ ? arguments[x++] : parsed[i];
      }
      for (;x < arguments.length;) {
        args.push(arguments[x++]);
      }
      return func(name, after, this, this, args);
    };
    return after;
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  _.bindAll = function(obj) {
    var i;
    var f;
    /** @type {number} */
    var l = arguments.length;
    if (1 >= l) {
      throw new Error("bindAll must be passed function names");
    }
    /** @type {number} */
    i = 1;
    for (;l > i;i++) {
      f = arguments[i];
      obj[f] = _.bind(obj[f], obj);
    }
    return obj;
  };
  /**
   * @param {Function} matcherFunction
   * @param {Function} func
   * @return {?}
   */
  _.memoize = function(matcherFunction, func) {
    /**
     * @param {Function} val
     * @return {?}
     */
    var require = function(val) {
      var cache = require.cache;
      /** @type {string} */
      var key = "" + (func ? func.apply(this, arguments) : val);
      return _.has(cache, key) || (cache[key] = matcherFunction.apply(this, arguments)), cache[key];
    };
    return require.cache = {}, require;
  };
  /**
   * @param {Function} callback
   * @param {number} wait
   * @return {?}
   */
  _.delay = function(callback, wait) {
    /** @type {Array.<?>} */
    var args = slice.call(arguments, 2);
    return setTimeout(function() {
      return callback.apply(null, args);
    }, wait);
  };
  _.defer = _.partial(_.delay, _, 1);
  /**
   * @param {Function} func
   * @param {number} wait
   * @param {Object} options
   * @return {?}
   */
  _.throttle = function(func, wait, options) {
    var recurring;
    var args;
    var value;
    /** @type {null} */
    var timeout = null;
    /** @type {number} */
    var previous = 0;
    if (!options) {
      options = {};
    }
    /**
     * @return {undefined}
     */
    var later = function() {
      /** @type {number} */
      previous = options.leading === false ? 0 : _.now();
      /** @type {null} */
      timeout = null;
      value = func.apply(recurring, args);
      if (!timeout) {
        /** @type {null} */
        recurring = args = null;
      }
    };
    return function() {
      /** @type {number} */
      var now = _.now();
      if (!previous) {
        if (!(options.leading !== false)) {
          /** @type {number} */
          previous = now;
        }
      }
      /** @type {number} */
      var remaining = wait - (now - previous);
      return recurring = this, args = arguments, 0 >= remaining || remaining > wait ? (timeout && (clearTimeout(timeout), timeout = null), previous = now, value = func.apply(recurring, args), timeout || (recurring = args = null)) : timeout || (options.trailing === false || (timeout = setTimeout(later, remaining))), value;
    };
  };
  /**
   * @param {Function} func
   * @param {number} wait
   * @param {boolean} immediate
   * @return {?}
   */
  _.debounce = function(func, wait, immediate) {
    var timeout;
    var args;
    var recurring;
    var lastAnimationTime;
    var value;
    /**
     * @return {undefined}
     */
    var delayed = function() {
      /** @type {number} */
      var timeDiff = _.now() - lastAnimationTime;
      if (wait > timeDiff && timeDiff >= 0) {
        /** @type {number} */
        timeout = setTimeout(delayed, wait - timeDiff);
      } else {
        /** @type {null} */
        timeout = null;
        if (!immediate) {
          value = func.apply(recurring, args);
          if (!timeout) {
            /** @type {null} */
            recurring = args = null;
          }
        }
      }
    };
    return function() {
      recurring = this;
      /** @type {Arguments} */
      args = arguments;
      /** @type {number} */
      lastAnimationTime = _.now();
      var callNow = immediate && !timeout;
      return timeout || (timeout = setTimeout(delayed, wait)), callNow && (value = func.apply(recurring, args), recurring = args = null), value;
    };
  };
  /**
   * @param {Function} str
   * @param {Function} wrapper
   * @return {?}
   */
  _.wrap = function(str, wrapper) {
    return _.partial(wrapper, str);
  };
  /**
   * @param {Function} matcherFunction
   * @return {?}
   */
  _.negate = function(matcherFunction) {
    return function() {
      return!matcherFunction.apply(this, arguments);
    };
  };
  /**
   * @return {?}
   */
  _.compose = function() {
    /** @type {Arguments} */
    var functions = arguments;
    /** @type {number} */
    var i = functions.length - 1;
    return function() {
      /** @type {number} */
      var k = i;
      var result = functions[i].apply(this, arguments);
      for (;k--;) {
        result = functions[k].call(this, result);
      }
      return result;
    };
  };
  /**
   * @param {string} method
   * @param {Function} matcherFunction
   * @return {?}
   */
  _.after = function(method, matcherFunction) {
    return function() {
      return--method < 1 ? matcherFunction.apply(this, arguments) : void 0;
    };
  };
  /**
   * @param {?} fn
   * @param {(Function|number)} matcherFunction
   * @return {?}
   */
  _.before = function(fn, matcherFunction) {
    var returnValue;
    return function() {
      return--fn > 0 && (returnValue = matcherFunction.apply(this, arguments)), 1 >= fn && (matcherFunction = null), returnValue;
    };
  };
  _.once = _.partial(_.before, 2);
  /** @type {boolean} */
  var str = !{
    toString : null
  }.propertyIsEnumerable("toString");
  /** @type {Array} */
  var tokenized = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
  /**
   * @param {?} obj
   * @return {?}
   */
  _.keys = function(obj) {
    if (!_.isObject(obj)) {
      return[];
    }
    if (nativeKeys) {
      return nativeKeys(obj);
    }
    /** @type {Array} */
    var listeners = [];
    var key;
    for (key in obj) {
      if (_.has(obj, key)) {
        listeners.push(key);
      }
    }
    return str && remove(obj, listeners), listeners;
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) {
      return[];
    }
    /** @type {Array} */
    var listeners = [];
    var prop;
    for (prop in obj) {
      listeners.push(prop);
    }
    return str && remove(obj, listeners), listeners;
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    /** @type {Array} */
    var result = Array(length);
    /** @type {number} */
    var i = 0;
    for (;length > i;i++) {
      result[i] = obj[keys[i]];
    }
    return result;
  };
  /**
   * @param {Object} obj
   * @param {Error} callback
   * @param {string} thisObj
   * @return {?}
   */
  _.mapObject = function(obj, callback, thisObj) {
    callback = makeIterator(callback, thisObj);
    var key;
    var keys = _.keys(obj);
    var len = keys.length;
    var result = {};
    /** @type {number} */
    var j = 0;
    for (;len > j;j++) {
      key = keys[j];
      result[key] = callback(obj[key], key, obj);
    }
    return result;
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    /** @type {Array} */
    var result = Array(length);
    /** @type {number} */
    var i = 0;
    for (;length > i;i++) {
      /** @type {Array} */
      result[i] = [keys[i], obj[keys[i]]];
    }
    return result;
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    /** @type {number} */
    var i = 0;
    var len = keys.length;
    for (;len > i;i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };
  /** @type {function (Object): ?} */
  _.functions = _.methods = function(obj) {
    /** @type {Array} */
    var keys = [];
    var key;
    for (key in obj) {
      if (_.isFunction(obj[key])) {
        keys.push(key);
      }
    }
    return keys.sort();
  };
  _.extend = bind(_.allKeys);
  _.extendOwn = _.assign = bind(_.keys);
  /**
   * @param {Object} obj
   * @param {?} callback
   * @param {string} thisObj
   * @return {?}
   */
  _.findKey = function(obj, callback, thisObj) {
    callback = makeIterator(callback, thisObj);
    var key;
    var keys = _.keys(obj);
    /** @type {number} */
    var j = 0;
    var len = keys.length;
    for (;len > j;j++) {
      if (key = keys[j], callback(obj[key], key, obj)) {
        return key;
      }
    }
  };
  /**
   * @param {Function} obj
   * @param {Function} type
   * @param {string} thisArg
   * @return {?}
   */
  _.pick = function(obj, type, thisArg) {
    var callback;
    var params;
    var data = {};
    /** @type {Function} */
    var object = obj;
    if (null == object) {
      return data;
    }
    if (_.isFunction(type)) {
      params = _.allKeys(object);
      callback = createCallback(type, thisArg);
    } else {
      params = flatten(arguments, false, false, 1);
      /**
       * @param {?} success
       * @param {?} k
       * @param {Object} value
       * @return {?}
       */
      callback = function(success, k, value) {
        return k in value;
      };
      object = Object(object);
    }
    /** @type {number} */
    var i = 0;
    var l = params.length;
    for (;l > i;i++) {
      var param = params[i];
      var value = object[param];
      if (callback(value, param, object)) {
        data[param] = value;
      }
    }
    return data;
  };
  /**
   * @param {Function} obj
   * @param {Function} method
   * @param {string} thisArg
   * @return {?}
   */
  _.omit = function(obj, method, thisArg) {
    if (_.isFunction(method)) {
      method = _.negate(method);
    } else {
      var js = _.map(flatten(arguments, false, false, 1), String);
      /**
       * @param {?} str
       * @param {string} value
       * @return {?}
       */
      method = function(str, value) {
        return!_.contains(js, value);
      };
    }
    return _.pick(obj, method, thisArg);
  };
  _.defaults = bind(_.allKeys, true);
  /**
   * @param {Function} a
   * @param {Object} name
   * @return {?}
   */
  _.create = function(a, name) {
    var ap = create(a);
    return name && _.extendOwn(ap, name), ap;
  };
  /**
   * @param {Object} value
   * @return {?}
   */
  _.clone = function(value) {
    return _.isObject(value) ? _.isArray(value) ? value.slice() : _.extend({}, value) : value;
  };
  /**
   * @param {?} n
   * @param {?} t
   * @return {?}
   */
  _.tap = function(n, t) {
    return t(n), n;
  };
  /**
   * @param {?} value
   * @param {?} obj
   * @return {?}
   */
  _.isMatch = function(value, obj) {
    var keys = _.keys(obj);
    var len = keys.length;
    if (null == value) {
      return!len;
    }
    var t = Object(value);
    /** @type {number} */
    var j = 0;
    for (;len > j;j++) {
      var k = keys[j];
      if (obj[k] !== t[k] || !(k in t)) {
        return false;
      }
    }
    return true;
  };
  /**
   * @param {?} a
   * @param {?} b
   * @param {Array} stack
   * @param {Object} bStack
   * @return {?}
   */
  var eq = function(a, b, stack, bStack) {
    if (a === b) {
      return 0 !== a || 1 / a === 1 / b;
    }
    if (null == a || null == b) {
      return a === b;
    }
    if (a instanceof _) {
      a = a._wrapped;
    }
    if (b instanceof _) {
      b = b._wrapped;
    }
    /** @type {string} */
    var array = toString.call(a);
    if (array !== toString.call(b)) {
      return false;
    }
    switch(array) {
      case "[object RegExp]":
      ;
      case "[object String]":
        return "" + a == "" + b;
      case "[object Number]":
        return+a !== +a ? +b !== +b : 0 === +a ? 1 / +a === 1 / b : +a === +b;
      case "[object Date]":
      ;
      case "[object Boolean]":
        return+a === +b;
    }
    /** @type {boolean} */
    var isArray = "[object Array]" === array;
    if (!isArray) {
      if ("object" != typeof a || "object" != typeof b) {
        return false;
      }
      var aCtor = a.constructor;
      var bCtor = b.constructor;
      if (aCtor !== bCtor && (!(_.isFunction(aCtor) && (aCtor instanceof aCtor && (_.isFunction(bCtor) && bCtor instanceof bCtor))) && ("constructor" in a && "constructor" in b))) {
        return false;
      }
    }
    stack = stack || [];
    bStack = bStack || [];
    var i = stack.length;
    for (;i--;) {
      if (stack[i] === a) {
        return bStack[i] === b;
      }
    }
    if (stack.push(a), bStack.push(b), isArray) {
      if (i = a.length, i !== b.length) {
        return false;
      }
      for (;i--;) {
        if (!eq(a[i], b[i], stack, bStack)) {
          return false;
        }
      }
    } else {
      var key;
      var keys = _.keys(a);
      if (i = keys.length, _.keys(b).length !== i) {
        return false;
      }
      for (;i--;) {
        if (key = keys[i], !_.has(b, key) || !eq(a[key], b[key], stack, bStack)) {
          return false;
        }
      }
    }
    return stack.pop(), bStack.pop(), true;
  };
  /**
   * @param {?} a
   * @param {Object} b
   * @return {?}
   */
  _.isEqual = function(a, b) {
    return eq(a, b);
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  _.isEmpty = function(obj) {
    return null == obj ? true : isArray(obj) && (_.isArray(obj) || (_.isString(obj) || _.isArguments(obj))) ? 0 === obj.length : 0 === _.keys(obj).length;
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  _.isElement = function(obj) {
    return!(!obj || 1 !== obj.nodeType);
  };
  /** @type {function (*): boolean} */
  _.isArray = nativeIsArray || function(obj) {
    return "[object Array]" === toString.call(obj);
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  _.isObject = function(obj) {
    /** @type {string} */
    var type = typeof obj;
    return "function" === type || "object" === type && !!obj;
  };
  _.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function(name) {
    /**
     * @param {string} checkSet
     * @return {?}
     */
    _["is" + name] = function(checkSet) {
      return toString.call(checkSet) === "[object " + name + "]";
    };
  });
  if (!_.isArguments(arguments)) {
    /**
     * @param {Object} obj
     * @return {?}
     */
    _.isArguments = function(obj) {
      return _.has(obj, "callee");
    };
  }
  if ("function" != typeof/./) {
    if ("object" != typeof Int8Array) {
      /**
       * @param {Function} obj
       * @return {?}
       */
      _.isFunction = function(obj) {
        return "function" == typeof obj || false;
      };
    }
  }
  /**
   * @param {?} obj
   * @return {?}
   */
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };
  /**
   * @param {number} i
   * @return {?}
   */
  _.isNaN = function(i) {
    return _.isNumber(i) && i !== +i;
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  _.isBoolean = function(obj) {
    return obj === true || (obj === false || "[object Boolean]" === toString.call(obj));
  };
  /**
   * @param {number} obj
   * @return {?}
   */
  _.isNull = function(obj) {
    return null === obj;
  };
  /**
   * @param {number} obj
   * @return {?}
   */
  _.isUndefined = function(obj) {
    return void 0 === obj;
  };
  /**
   * @param {Object} obj
   * @param {string} key
   * @return {?}
   */
  _.has = function(obj, key) {
    return null != obj && hasOwnProperty.call(obj, key);
  };
  /**
   * @return {?}
   */
  _.noConflict = function() {
    return root._ = previousUnderscore, this;
  };
  /**
   * @param {?} value
   * @return {?}
   */
  _.identity = function(value) {
    return value;
  };
  /**
   * @param {?} value
   * @return {?}
   */
  _.constant = function(value) {
    return function() {
      return value;
    };
  };
  /**
   * @return {undefined}
   */
  _.noop = function() {
  };
  /** @type {function (string): ?} */
  _.property = property;
  /**
   * @param {Object} buf
   * @return {?}
   */
  _.propertyOf = function(buf) {
    return null == buf ? function() {
    } : function(off) {
      return buf[off];
    };
  };
  /** @type {function (Object): ?} */
  _.matcher = _.matches = function(item) {
    return item = _.extendOwn({}, item), function(methodNames) {
      return _.isMatch(methodNames, item);
    };
  };
  /**
   * @param {number} n
   * @param {?} callback
   * @param {string} thisArg
   * @return {?}
   */
  _.times = function(n, callback, thisArg) {
    /** @type {Array} */
    var result = Array(Math.max(0, n));
    callback = createCallback(callback, thisArg, 1);
    /** @type {number} */
    var i = 0;
    for (;n > i;i++) {
      result[i] = callback(i);
    }
    return result;
  };
  /**
   * @param {number} min
   * @param {number} max
   * @return {?}
   */
  _.random = function(min, max) {
    return null == max && (max = min, min = 0), min + Math.floor(Math.random() * (max - min + 1));
  };
  /** @type {function (): number} */
  _.now = Date.now || function() {
    return(new Date).getTime();
  };
  var obj = {
    "&" : "&amp;",
    "<" : "&lt;",
    ">" : "&gt;",
    '"' : "&quot;",
    "'" : "&#x27;",
    "`" : "&#x60;"
  };
  var keys = _.invert(obj);
  /**
   * @param {Object} obj
   * @return {?}
   */
  var process = function(obj) {
    /**
     * @param {string} val
     * @return {?}
     */
    var next = function(val) {
      return obj[val];
    };
    /** @type {string} */
    var keyword1 = "(?:" + _.keys(obj).join("|") + ")";
    /** @type {RegExp} */
    var hChars = RegExp(keyword1);
    /** @type {RegExp} */
    var r20 = RegExp(keyword1, "g");
    return function(s) {
      return s = null == s ? "" : "" + s, hChars.test(s) ? s.replace(r20, next) : s;
    };
  };
  _.escape = process(obj);
  _.unescape = process(keys);
  /**
   * @param {Object} object
   * @param {string} property
   * @param {Object} x
   * @return {?}
   */
  _.result = function(object, property, x) {
    var value = null == object ? void 0 : object[property];
    return void 0 === value && (value = x), _.isFunction(value) ? value.call(object) : value;
  };
  /** @type {number} */
  var idCounter = 0;
  /**
   * @param {?} prefix
   * @return {?}
   */
  _.uniqueId = function(prefix) {
    /** @type {string} */
    var id = ++idCounter + "";
    return prefix ? prefix + id : id;
  };
  _.templateSettings = {
    evaluate : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape : /<%-([\s\S]+?)%>/g
  };
  /** @type {RegExp} */
  var noMatch = /(.)^/;
  var escapes = {
    "'" : "'",
    "\\" : "\\",
    "\r" : "r",
    "\n" : "n",
    "\u2028" : "u2028",
    "\u2029" : "u2029"
  };
  /** @type {RegExp} */
  var r20 = /\\|'|\r|\n|\u2028|\u2029/g;
  /**
   * @param {?} match
   * @return {?}
   */
  var escapeStringChar = function(match) {
    return "\\" + escapes[match];
  };
  /**
   * @param {string} text
   * @param {Object} settings
   * @param {Object} data
   * @return {?}
   */
  _.template = function(text, settings, data) {
    if (!settings) {
      if (data) {
        /** @type {Object} */
        settings = data;
      }
    }
    settings = _.defaults({}, settings, _.templateSettings);
    /** @type {RegExp} */
    var reDelimiters = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g");
    /** @type {number} */
    var index = 0;
    /** @type {string} */
    var source = "__p+='";
    text.replace(reDelimiters, function(match, dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, offset) {
      return source += text.slice(index, offset).replace(r20, escapeStringChar), index = offset + match.length, dataAndEvents ? source += "'+\n((__t=(" + dataAndEvents + "))==null?'':_.escape(__t))+\n'" : deepDataAndEvents ? source += "'+\n((__t=(" + deepDataAndEvents + "))==null?'':__t)+\n'" : ignoreMethodDoesntExist && (source += "';\n" + ignoreMethodDoesntExist + "\n__p+='"), match;
    });
    source += "';\n";
    if (!settings.variable) {
      /** @type {string} */
      source = "with(obj||{}){\n" + source + "}\n";
    }
    /** @type {string} */
    source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
    try {
      /** @type {Function} */
      var render = new Function(settings.variable || "obj", "_", source);
    } catch (details) {
      throw details.source = source, details;
    }
    /**
     * @param {Object} data
     * @return {?}
     */
    var template = function(data) {
      return render.call(this, data, _);
    };
    var obj = settings.variable || "obj";
    return template.source = "function(" + obj + "){\n" + source + "}", template;
  };
  /**
   * @param {string} obj
   * @return {?}
   */
  _.chain = function(obj) {
    var s = _(obj);
    return s._chain = true, s;
  };
  /**
   * @param {?} dataAndEvents
   * @param {string} obj
   * @return {?}
   */
  var result = function(dataAndEvents, obj) {
    return dataAndEvents._chain ? _(obj).chain() : obj;
  };
  /**
   * @param {Object} obj
   * @return {undefined}
   */
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var wrapper = _[name] = obj[name];
      /**
       * @return {?}
       */
      _.prototype[name] = function() {
        /** @type {Array} */
        var args = [this._wrapped];
        return push.apply(args, arguments), result(this, wrapper.apply(_, args));
      };
    });
  };
  _.mixin(_);
  _.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name) {
    var method = ArrayProto[name];
    /**
     * @return {?}
     */
    _.prototype[name] = function() {
      var wrapped = this._wrapped;
      return method.apply(wrapped, arguments), "shift" !== name && "splice" !== name || (0 !== wrapped.length || delete wrapped[0]), result(this, wrapped);
    };
  });
  _.each(["concat", "join", "slice"], function(name) {
    var method = ArrayProto[name];
    /**
     * @return {?}
     */
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });
  /**
   * @return {?}
   */
  _.prototype.value = function() {
    return this._wrapped;
  };
  /** @type {function (): ?} */
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
  /**
   * @return {?}
   */
  _.prototype.toString = function() {
    return "" + this._wrapped;
  };
  if ("function" == typeof define) {
    if (define.amd) {
      define("underscore", [], function() {
        return _;
      });
    }
  }
}.call(this), function(root, factory) {
  if ("function" == typeof define && define.amd) {
    define("backbone.original", ["underscore", "jquery", "exports"], function(_, $, Backbone) {
      root.Backbone = factory(root, Backbone, _, $);
    });
  } else {
    if ("undefined" != typeof exports) {
      var _ = require("underscore");
      factory(root, exports, _);
    } else {
      root.Backbone = factory(root, {}, root._, root.jQuery || (root.Zepto || (root.ender || root.$)));
    }
  }
}(this, function(root, Backbone, _, $) {
  var previousBackbone = root.Backbone;
  /** @type {Array} */
  var args = [];
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var splice = (args.push, args.slice);
  args.splice;
  /** @type {string} */
  Backbone.VERSION = "1.1.2";
  /** @type {Function} */
  Backbone.$ = $;
  /**
   * @return {?}
   */
  Backbone.noConflict = function() {
    return root.Backbone = previousBackbone, this;
  };
  /** @type {boolean} */
  Backbone.emulateHTTP = false;
  /** @type {boolean} */
  Backbone.emulateJSON = false;
  var Events = Backbone.Events = {
    /**
     * @param {string} name
     * @param {Function} callback
     * @param {string} context
     * @return {?}
     */
    on : function(name, callback, context) {
      if (!eventsApi(this, "on", name, [callback, context]) || !callback) {
        return this;
      }
      if (!this._events) {
        this._events = {};
      }
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
      var el = this;
      var selector = _.once(function() {
        el.off(name, selector);
        callback.apply(this, arguments);
      });
      return selector._callback = callback, this.on(name, selector, context);
    },
    /**
     * @param {string} name
     * @param {Function} callback
     * @param {string} context
     * @return {?}
     */
    off : function(name, callback, context) {
      var retain;
      var ev;
      var list;
      var names;
      var i;
      var l;
      var j;
      var _len;
      if (!this._events || !eventsApi(this, "off", name, [callback, context])) {
        return this;
      }
      if (!name && (!callback && !context)) {
        return this._events = void 0, this;
      }
      names = name ? [name] : _.keys(this._events);
      /** @type {number} */
      i = 0;
      l = names.length;
      for (;l > i;i++) {
        if (name = names[i], list = this._events[name]) {
          if (this._events[name] = retain = [], callback || context) {
            /** @type {number} */
            j = 0;
            _len = list.length;
            for (;_len > j;j++) {
              ev = list[j];
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
     * @param {string} type
     * @return {?}
     */
    trigger : function(type) {
      if (!this._events) {
        return this;
      }
      /** @type {Array.<?>} */
      var args = splice.call(arguments, 1);
      if (!eventsApi(this, "trigger", type, args)) {
        return this;
      }
      var events = this._events[type];
      var allEvents = this._events.all;
      return events && triggerEvents(events, args), allEvents && triggerEvents(allEvents, arguments), this;
    },
    /**
     * @param {Object} obj
     * @param {string} name
     * @param {Object} callback
     * @return {?}
     */
    stopListening : function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) {
        return this;
      }
      /** @type {boolean} */
      var f = !name && !callback;
      if (!callback) {
        if (!("object" != typeof name)) {
          callback = this;
        }
      }
      if (obj) {
        /** @type {Object} */
        (listeningTo = {})[obj._listenId] = obj;
      }
      var id;
      for (id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (f || _.isEmpty(obj._events)) {
          delete this._listeningTo[id];
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
      var names = name.split(eventSplitter);
      /** @type {number} */
      var i = 0;
      var len = names.length;
      for (;len > i;i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
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
    var a1 = args[0];
    var pageX = args[1];
    var next = args[2];
    switch(args.length) {
      case 0:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx);
        }
        return;
      case 1:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, a1);
        }
        return;
      case 2:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, a1, pageX);
        }
        return;
      case 3:
        for (;++i < l;) {
          (ev = events[i]).callback.call(ev.ctx, a1, pageX, next);
        }
        return;
      default:
        for (;++i < l;) {
          (ev = events[i]).callback.apply(ev.ctx, args);
        }
        return;
    }
  };
  var listenMethods = {
    listenTo : "on",
    listenToOnce : "once"
  };
  _.each(listenMethods, function(implementation, method) {
    /**
     * @param {Array} obj
     * @param {?} name
     * @param {Node} callback
     * @return {?}
     */
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId("l"));
      return listeningTo[id] = obj, callback || ("object" != typeof name || (callback = this)), obj[implementation](name, callback, this), this;
    };
  });
  /** @type {function (string, Function, string): ?} */
  Events.bind = Events.on;
  /** @type {function (string, Function, string): ?} */
  Events.unbind = Events.off;
  _.extend(Backbone, Events);
  /** @type {function (Function, Object): undefined} */
  var Model = Backbone.Model = function(a, recurring) {
    var reqUrl = a || {};
    if (!recurring) {
      recurring = {};
    }
    this.cid = _.uniqueId("c");
    this.attributes = {};
    if (recurring.collection) {
      this.collection = recurring.collection;
    }
    if (recurring.parse) {
      reqUrl = this.parse(reqUrl, recurring) || {};
    }
    reqUrl = _.defaults({}, reqUrl, _.result(this, "defaults"));
    this.set(reqUrl, recurring);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };
  _.extend(Model.prototype, Events, {
    changed : null,
    validationError : null,
    idAttribute : "id",
    /**
     * @return {undefined}
     */
    initialize : function() {
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      return _.clone(this.attributes);
    },
    /**
     * @return {?}
     */
    sync : function() {
      return Backbone.sync.apply(this, arguments);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return this.attributes[name];
    },
    /**
     * @param {string} optgroup
     * @return {?}
     */
    escape : function(optgroup) {
      return _.escape(this.get(optgroup));
    },
    /**
     * @param {string} vvar
     * @return {?}
     */
    has : function(vvar) {
      return null != this.get(vvar);
    },
    /**
     * @param {string} val
     * @param {boolean} recurring
     * @param {boolean} options
     * @return {?}
     */
    set : function(val, recurring, options) {
      var attr;
      var attrs;
      var unset;
      var changes;
      var silent;
      var changing;
      var prev;
      var current;
      if (null == val) {
        return this;
      }
      if ("object" == typeof val ? (attrs = val, options = recurring) : (attrs = {})[val] = recurring, options || (options = {}), !this._validate(attrs, options)) {
        return false;
      }
      unset = options.unset;
      silent = options.silent;
      /** @type {Array} */
      changes = [];
      changing = this._changing;
      /** @type {boolean} */
      this._changing = true;
      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes;
      prev = this._previousAttributes;
      if (this.idAttribute in attrs) {
        this.id = attrs[this.idAttribute];
      }
      for (attr in attrs) {
        recurring = attrs[attr];
        if (!_.isEqual(current[attr], recurring)) {
          changes.push(attr);
        }
        if (_.isEqual(prev[attr], recurring)) {
          delete this.changed[attr];
        } else {
          /** @type {boolean} */
          this.changed[attr] = recurring;
        }
        if (unset) {
          delete current[attr];
        } else {
          /** @type {boolean} */
          current[attr] = recurring;
        }
      }
      if (!silent) {
        if (changes.length) {
          /** @type {boolean} */
          this._pending = options;
        }
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        var l = changes.length;
        for (;l > i;i++) {
          this.trigger("change:" + changes[i], this, current[changes[i]], options);
        }
      }
      if (changing) {
        return this;
      }
      if (!silent) {
        for (;this._pending;) {
          options = this._pending;
          /** @type {boolean} */
          this._pending = false;
          this.trigger("change", this, options);
        }
      }
      return this._pending = false, this._changing = false, this;
    },
    /**
     * @param {string} objId
     * @param {?} options
     * @return {?}
     */
    unset : function(objId, options) {
      return this.set(objId, void 0, _.extend({}, options, {
        unset : true
      }));
    },
    /**
     * @param {?} options
     * @return {?}
     */
    clear : function(options) {
      var objId = {};
      var key;
      for (key in this.attributes) {
        objId[key] = void 0;
      }
      return this.set(objId, _.extend({}, options, {
        unset : true
      }));
    },
    /**
     * @param {string} attr
     * @return {?}
     */
    hasChanged : function(attr) {
      return null == attr ? !_.isEmpty(this.changed) : _.has(this.changed, attr);
    },
    /**
     * @param {Object} diff
     * @return {?}
     */
    changedAttributes : function(diff) {
      if (!diff) {
        return this.hasChanged() ? _.clone(this.changed) : false;
      }
      var val;
      /** @type {boolean} */
      var changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var attr;
      for (attr in diff) {
        if (!_.isEqual(old[attr], val = diff[attr])) {
          (changed || (changed = {}))[attr] = val;
        }
      }
      return changed;
    },
    /**
     * @param {string} attr
     * @return {?}
     */
    previous : function(attr) {
      return null != attr && this._previousAttributes ? this._previousAttributes[attr] : null;
    },
    /**
     * @return {?}
     */
    previousAttributes : function() {
      return _.clone(this._previousAttributes);
    },
    /**
     * @param {Object} recurring
     * @return {?}
     */
    fetch : function(recurring) {
      recurring = recurring ? _.clone(recurring) : {};
      if (void 0 === recurring.parse) {
        /** @type {boolean} */
        recurring.parse = true;
      }
      var QUnit = this;
      /** @type {function (Function): ?} */
      var success = recurring.success;
      return recurring.success = function(a) {
        return QUnit.set(QUnit.parse(a, recurring), recurring) ? (success && success(QUnit, a, recurring), void QUnit.trigger("sync", QUnit, a, recurring)) : false;
      }, wrapError(this, recurring), this.sync("read", this, recurring);
    },
    /**
     * @param {number} key
     * @param {Object} value
     * @param {Object} recurring
     * @return {?}
     */
    save : function(key, value, recurring) {
      var reqUrl;
      var method;
      var xhr;
      var attributes = this.attributes;
      if (null == key || "object" == typeof key ? (reqUrl = key, recurring = value) : (reqUrl = {})[key] = value, recurring = _.extend({
        validate : true
      }, recurring), reqUrl && !recurring.wait) {
        if (!this.set(reqUrl, recurring)) {
          return false;
        }
      } else {
        if (!this._validate(reqUrl, recurring)) {
          return false;
        }
      }
      if (reqUrl) {
        if (recurring.wait) {
          this.attributes = _.extend({}, attributes, reqUrl);
        }
      }
      if (void 0 === recurring.parse) {
        /** @type {boolean} */
        recurring.parse = true;
      }
      var exports = this;
      /** @type {function (Function): ?} */
      var success = recurring.success;
      return recurring.success = function(a) {
        exports.attributes = attributes;
        var prop = exports.parse(a, recurring);
        return recurring.wait && (prop = _.extend(reqUrl || {}, prop)), _.isObject(prop) && !exports.set(prop, recurring) ? false : (success && success(exports, a, recurring), void exports.trigger("sync", exports, a, recurring));
      }, wrapError(this, recurring), method = this.isNew() ? "create" : recurring.patch ? "patch" : "update", "patch" === method && (recurring.attrs = reqUrl), xhr = this.sync(method, this, recurring), reqUrl && (recurring.wait && (this.attributes = attributes)), xhr;
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    destroy : function(options) {
      options = options ? _.clone(options) : {};
      var QUnit = this;
      var success = options.success;
      /**
       * @return {undefined}
       */
      var destroy = function() {
        QUnit.trigger("destroy", QUnit, QUnit.collection, options);
      };
      if (options.success = function(a) {
        if (options.wait || QUnit.isNew()) {
          destroy();
        }
        if (success) {
          success(QUnit, a, options);
        }
        if (!QUnit.isNew()) {
          QUnit.trigger("sync", QUnit, a, options);
        }
      }, this.isNew()) {
        return options.success(), false;
      }
      wrapError(this, options);
      var xhr = this.sync("delete", this, options);
      return options.wait || destroy(), xhr;
    },
    /**
     * @return {?}
     */
    url : function() {
      var selector = _.result(this, "urlRoot") || (_.result(this.collection, "url") || urlError());
      return this.isNew() ? selector : selector.replace(/([^\/])$/, "$1/") + encodeURIComponent(this.id);
    },
    /**
     * @param {string} object
     * @return {?}
     */
    parse : function(object) {
      return object;
    },
    /**
     * @return {?}
     */
    clone : function() {
      return new this.constructor(this.attributes);
    },
    /**
     * @return {?}
     */
    isNew : function() {
      return!this.has(this.idAttribute);
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    isValid : function(options) {
      return this._validate({}, _.extend(options || {}, {
        validate : true
      }));
    },
    /**
     * @param {Object} attrs
     * @param {Object} attributes
     * @return {?}
     */
    _validate : function(attrs, attributes) {
      if (!attributes.validate || !this.validate) {
        return true;
      }
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, attributes) || null;
      return error ? (this.trigger("invalid", this, error, _.extend(attributes, {
        validationError : error
      })), false) : true;
    }
  });
  /** @type {Array} */
  var modelMethods = ["keys", "values", "pairs", "invert", "pick", "omit"];
  _.each(modelMethods, function(method) {
    /**
     * @return {?}
     */
    Model.prototype[method] = function() {
      /** @type {Array.<?>} */
      var args = splice.call(arguments);
      return args.unshift(this.attributes), _[method].apply(_, args);
    };
  });
  /** @type {function (Function, Object): undefined} */
  var Collection = Backbone.Collection = function(a, name) {
    if (!name) {
      name = {};
    }
    if (name.model) {
      this.model = name.model;
    }
    if (void 0 !== name.comparator) {
      this.comparator = name.comparator;
    }
    this._reset();
    this.initialize.apply(this, arguments);
    if (a) {
      this.reset(a, _.extend({
        silent : true
      }, name));
    }
  };
  var setOptions = {
    add : true,
    remove : true,
    merge : true
  };
  var addOptions = {
    add : true,
    remove : false
  };
  _.extend(Collection.prototype, Events, {
    /** @type {function (Function, Object): undefined} */
    model : Model,
    /**
     * @return {undefined}
     */
    initialize : function() {
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    toJSON : function(a) {
      return this.map(function(model) {
        return model.toJSON(a);
      });
    },
    /**
     * @return {?}
     */
    sync : function() {
      return Backbone.sync.apply(this, arguments);
    },
    /**
     * @param {Object} a
     * @param {string} val
     * @return {?}
     */
    add : function(a, val) {
      return this.set(a, _.extend({
        merge : false
      }, val, addOptions));
    },
    /**
     * @param {Object} a
     * @param {Object} val
     * @return {?}
     */
    remove : function(a, val) {
      /** @type {boolean} */
      var b = !_.isArray(a);
      a = b ? [a] : _.clone(a);
      if (!val) {
        val = {};
      }
      var i;
      var l;
      var index;
      var model;
      /** @type {number} */
      i = 0;
      l = a.length;
      for (;l > i;i++) {
        model = a[i] = this.get(a[i]);
        if (model) {
          delete this._byId[model.id];
          delete this._byId[model.cid];
          index = this.indexOf(model);
          this.models.splice(index, 1);
          this.length--;
          if (!val.silent) {
            val.index = index;
            model.trigger("remove", model, this, val);
          }
          this._removeReference(model, val);
        }
      }
      return b ? a[0] : a;
    },
    /**
     * @param {string} value
     * @param {Object} recurring
     * @return {?}
     */
    set : function(value, recurring) {
      recurring = _.defaults({}, recurring, setOptions);
      if (recurring.parse) {
        value = this.parse(value, recurring);
      }
      /** @type {boolean} */
      var isArray = !_.isArray(value);
      value = isArray ? value ? [value] : [] : _.clone(value);
      var i;
      var l;
      var optgroup;
      var model;
      var requestUrl;
      var existing;
      var sort;
      var at = recurring.at;
      var targetModel = this.model;
      var sortable = this.comparator && (null == at && recurring.sort !== false);
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      /** @type {Array} */
      var toAdd = [];
      /** @type {Array} */
      var ok = [];
      var modelMap = {};
      var add = recurring.add;
      var merge = recurring.merge;
      var remove = recurring.remove;
      /** @type {(Array|boolean)} */
      var order = !sortable && (add && remove) ? [] : false;
      /** @type {number} */
      i = 0;
      l = value.length;
      for (;l > i;i++) {
        if (requestUrl = value[i] || {}, optgroup = requestUrl instanceof Model ? model = requestUrl : requestUrl[targetModel.prototype.idAttribute || "id"], existing = this.get(optgroup)) {
          if (remove) {
            /** @type {boolean} */
            modelMap[existing.cid] = true;
          }
          if (merge) {
            requestUrl = requestUrl === model ? model.attributes : requestUrl;
            if (recurring.parse) {
              requestUrl = existing.parse(requestUrl, recurring);
            }
            existing.set(requestUrl, recurring);
            if (sortable) {
              if (!sort) {
                if (existing.hasChanged(sortAttr)) {
                  /** @type {boolean} */
                  sort = true;
                }
              }
            }
          }
          value[i] = existing;
        } else {
          if (add) {
            if (model = value[i] = this._prepareModel(requestUrl, recurring), !model) {
              continue;
            }
            toAdd.push(model);
            this._addReference(model, recurring);
          }
        }
        model = existing || model;
        if (!!order) {
          if (!(!model.isNew() && modelMap[model.id])) {
            order.push(model);
          }
        }
        /** @type {boolean} */
        modelMap[model.id] = true;
      }
      if (remove) {
        /** @type {number} */
        i = 0;
        l = this.length;
        for (;l > i;++i) {
          if (!modelMap[(model = this.models[i]).cid]) {
            ok.push(model);
          }
        }
        if (ok.length) {
          this.remove(ok, recurring);
        }
      }
      if (toAdd.length || order && order.length) {
        if (sortable && (sort = true), this.length += toAdd.length, null != at) {
          /** @type {number} */
          i = 0;
          /** @type {number} */
          l = toAdd.length;
          for (;l > i;i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) {
            /** @type {number} */
            this.models.length = 0;
          }
          /** @type {(Array|boolean)} */
          var orderedModels = order || toAdd;
          /** @type {number} */
          i = 0;
          /** @type {number} */
          l = orderedModels.length;
          for (;l > i;i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }
      if (sort && this.sort({
        silent : true
      }), !recurring.silent) {
        /** @type {number} */
        i = 0;
        /** @type {number} */
        l = toAdd.length;
        for (;l > i;i++) {
          (model = toAdd[i]).trigger("add", model, this, recurring);
        }
        if (sort || order && order.length) {
          this.trigger("sort", this, recurring);
        }
      }
      return isArray ? value[0] : value;
    },
    /**
     * @param {Object} ok
     * @param {Object} options
     * @return {?}
     */
    reset : function(ok, options) {
      if (!options) {
        options = {};
      }
      /** @type {number} */
      var i = 0;
      var l = this.models.length;
      for (;l > i;i++) {
        this._removeReference(this.models[i], options);
      }
      return options.previousModels = this.models, this._reset(), ok = this.add(ok, _.extend({
        silent : true
      }, options)), options.silent || this.trigger("reset", this, options), ok;
    },
    /**
     * @param {string} value
     * @param {string} options
     * @return {?}
     */
    push : function(value, options) {
      return this.add(value, _.extend({
        at : this.length
      }, options));
    },
    /**
     * @param {string} ar
     * @return {?}
     */
    pop : function(ar) {
      var QUnit = this.at(this.length - 1);
      return this.remove(QUnit, ar), QUnit;
    },
    /**
     * @param {Object} config
     * @param {?} options
     * @return {?}
     */
    unshift : function(config, options) {
      return this.add(config, _.extend({
        at : 0
      }, options));
    },
    /**
     * @param {string} ar
     * @return {?}
     */
    shift : function(ar) {
      var QUnit = this.at(0);
      return this.remove(QUnit, ar), QUnit;
    },
    /**
     * @return {?}
     */
    slice : function() {
      return splice.apply(this.models, arguments);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return null == name ? void 0 : this._byId[name] || (this._byId[name.id] || this._byId[name.cid]);
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    at : function(a) {
      return this.models[a];
    },
    /**
     * @param {Object} attrs
     * @param {boolean} first
     * @return {?}
     */
    where : function(attrs, first) {
      return _.isEmpty(attrs) ? first ? void 0 : [] : this[first ? "find" : "filter"](function(doc) {
        var optgroup;
        for (optgroup in attrs) {
          if (attrs[optgroup] !== doc.get(optgroup)) {
            return false;
          }
        }
        return true;
      });
    },
    /**
     * @param {Object} attrs
     * @return {?}
     */
    findWhere : function(attrs) {
      return this.where(attrs, true);
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    sort : function(options) {
      if (!this.comparator) {
        throw new Error("Cannot sort a set without a comparator");
      }
      return options || (options = {}), _.isString(this.comparator) || 1 === this.comparator.length ? this.models = this.sortBy(this.comparator, this) : this.models.sort(_.bind(this.comparator, this)), options.silent || this.trigger("sort", this, options), this;
    },
    /**
     * @param {?} attr
     * @return {?}
     */
    pluck : function(attr) {
      return _.invoke(this.models, "get", attr);
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    fetch : function(options) {
      options = options ? _.clone(options) : {};
      if (void 0 === options.parse) {
        /** @type {boolean} */
        options.parse = true;
      }
      /** @type {function (Function): undefined} */
      var success = options.success;
      var exports = this;
      return options.success = function(a) {
        /** @type {string} */
        var method = options.reset ? "reset" : "set";
        exports[method](a, options);
        if (success) {
          success(exports, a, options);
        }
        exports.trigger("sync", exports, a, options);
      }, wrapError(this, options), this.sync("read", this, options);
    },
    /**
     * @param {Function} a
     * @param {Object} object
     * @return {?}
     */
    create : function(a, object) {
      if (object = object ? _.clone(object) : {}, !(a = this._prepareModel(a, object))) {
        return false;
      }
      if (!object.wait) {
        this.add(a, object);
      }
      var api = this;
      /** @type {function (Function, Object): undefined} */
      var callback = object.success;
      return object.success = function(a, name) {
        if (object.wait) {
          api.add(a, object);
        }
        if (callback) {
          callback(a, name, object);
        }
      }, a.save(null, object), a;
    },
    /**
     * @param {string} object
     * @return {?}
     */
    parse : function(object) {
      return object;
    },
    /**
     * @return {?}
     */
    clone : function() {
      return new this.constructor(this.models);
    },
    /**
     * @return {undefined}
     */
    _reset : function() {
      /** @type {number} */
      this.length = 0;
      /** @type {Array} */
      this.models = [];
      this._byId = {};
    },
    /**
     * @param {string} attrs
     * @param {Object} options
     * @return {?}
     */
    _prepareModel : function(attrs, options) {
      if (attrs instanceof Model) {
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      return model.validationError ? (this.trigger("invalid", this, model.validationError, options), false) : model;
    },
    /**
     * @param {Object} model
     * @return {undefined}
     */
    _addReference : function(model) {
      /** @type {Object} */
      this._byId[model.cid] = model;
      if (null != model.id) {
        /** @type {Object} */
        this._byId[model.id] = model;
      }
      if (!model.collection) {
        model.collection = this;
      }
      model.on("all", this._onModelEvent, this);
    },
    /**
     * @param {Object} model
     * @return {undefined}
     */
    _removeReference : function(model) {
      if (this === model.collection) {
        delete model.collection;
      }
      model.off("all", this._onModelEvent, this);
    },
    /**
     * @param {string} collection
     * @param {Object} exports
     * @param {string} options
     * @param {string} ar
     * @return {undefined}
     */
    _onModelEvent : function(collection, exports, options, ar) {
      if ("add" !== collection && "remove" !== collection || options === this) {
        if ("destroy" === collection) {
          this.remove(exports, ar);
        }
        if (exports) {
          if (collection === "change:" + exports.idAttribute) {
            delete this._byId[exports.previous(exports.idAttribute)];
            if (null != exports.id) {
              /** @type {Object} */
              this._byId[exports.id] = exports;
            }
          }
        }
        this.trigger.apply(this, arguments);
      }
    }
  });
  /** @type {Array} */
  var methods = ["forEach", "each", "map", "collect", "reduce", "foldl", "inject", "reduceRight", "foldr", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "toArray", "size", "first", "head", "take", "initial", "rest", "tail", "drop", "last", "without", "difference", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "chain", "sample"];
  _.each(methods, function(method) {
    /**
     * @return {?}
     */
    Collection.prototype[method] = function() {
      /** @type {Array.<?>} */
      var args = splice.call(arguments);
      return args.unshift(this.models), _[method].apply(_, args);
    };
  });
  /** @type {Array} */
  var attributes = ["groupBy", "countBy", "sortBy", "indexBy"];
  _.each(attributes, function(method) {
    /**
     * @param {string} optgroup
     * @param {?} context
     * @return {?}
     */
    Collection.prototype[method] = function(optgroup, context) {
      var iterator = _.isFunction(optgroup) ? optgroup : function(doc) {
        return doc.get(optgroup);
      };
      return _[method](this.models, iterator, context);
    };
  });
  /** @type {function (Object): undefined} */
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId("view");
    if (!options) {
      options = {};
    }
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };
  /** @type {RegExp} */
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;
  /** @type {Array} */
  var viewOptions = ["model", "collection", "el", "id", "attributes", "className", "tagName", "events"];
  _.extend(View.prototype, Events, {
    tagName : "div",
    /**
     * @param {string} selector
     * @return {?}
     */
    $ : function(selector) {
      return this.$el.find(selector);
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
    },
    /**
     * @return {?}
     */
    render : function() {
      return this;
    },
    /**
     * @return {?}
     */
    remove : function() {
      return this.$el.remove(), this.stopListening(), this;
    },
    /**
     * @param {Object} element
     * @param {boolean} delegate
     * @return {?}
     */
    setElement : function(element, delegate) {
      return this.$el && this.undelegateEvents(), this.$el = element instanceof Backbone.$ ? element : Backbone.$(element), this.el = this.$el[0], delegate !== false && this.delegateEvents(), this;
    },
    /**
     * @param {Object} events
     * @return {?}
     */
    delegateEvents : function(events) {
      if (!events && !(events = _.result(this, "events"))) {
        return this;
      }
      this.undelegateEvents();
      var key;
      for (key in events) {
        var method = events[key];
        if (_.isFunction(method) || (method = this[events[key]]), method) {
          /** @type {(Array.<string>|null)} */
          var match = key.match(delegateEventSplitter);
          /** @type {string} */
          var eventName = match[1];
          /** @type {string} */
          var selector = match[2];
          method = _.bind(method, this);
          eventName += ".delegateEvents" + this.cid;
          if ("" === selector) {
            this.$el.on(eventName, method);
          } else {
            this.$el.on(eventName, selector, method);
          }
        }
      }
      return this;
    },
    /**
     * @return {?}
     */
    undelegateEvents : function() {
      return this.$el.off(".delegateEvents" + this.cid), this;
    },
    /**
     * @return {undefined}
     */
    _ensureElement : function() {
      if (this.el) {
        this.setElement(_.result(this, "el"), false);
      } else {
        var attrs = _.extend({}, _.result(this, "attributes"));
        if (this.id) {
          attrs.id = _.result(this, "id");
        }
        if (this.className) {
          attrs["class"] = _.result(this, "className");
        }
        var $el = Backbone.$("<" + _.result(this, "tagName") + ">").attr(attrs);
        this.setElement($el, false);
      }
    }
  });
  /**
   * @param {string} method
   * @param {Object} model
   * @param {Object} exports
   * @return {?}
   */
  Backbone.sync = function(method, model, exports) {
    var type = methodMap[method];
    _.defaults(exports || (exports = {}), {
      emulateHTTP : Backbone.emulateHTTP,
      emulateJSON : Backbone.emulateJSON
    });
    var params = {
      type : type,
      dataType : "json"
    };
    if (exports.url || (params.url = _.result(model, "url") || urlError()), null != exports.data || (!model || ("create" !== method && ("update" !== method && "patch" !== method) || (params.contentType = "application/json", params.data = JSON.stringify(exports.attrs || model.toJSON(exports))))), exports.emulateJSON && (params.contentType = "application/x-www-form-urlencoded", params.data = params.data ? {
      model : params.data
    } : {}), exports.emulateHTTP && ("PUT" === type || ("DELETE" === type || "PATCH" === type))) {
      /** @type {string} */
      params.type = "POST";
      if (exports.emulateJSON) {
        params.data._method = type;
      }
      var matcherFunction = exports.beforeSend;
      /**
       * @param {Object} xhr
       * @return {?}
       */
      exports.beforeSend = function(xhr) {
        return xhr.setRequestHeader("X-HTTP-Method-Override", type), matcherFunction ? matcherFunction.apply(this, arguments) : void 0;
      };
    }
    if (!("GET" === params.type)) {
      if (!exports.emulateJSON) {
        /** @type {boolean} */
        params.processData = false;
      }
    }
    if ("PATCH" === params.type) {
      if (w) {
        /**
         * @return {?}
         */
        params.xhr = function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        };
      }
    }
    var resp = exports.xhr = Backbone.ajax(_.extend(params, exports));
    return model.trigger("request", model, resp, exports), resp;
  };
  /** @type {boolean} */
  var w = !("undefined" == typeof window || (!window.ActiveXObject || window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent));
  var methodMap = {
    create : "POST",
    update : "PUT",
    patch : "PATCH",
    "delete" : "DELETE",
    read : "GET"
  };
  /**
   * @return {?}
   */
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };
  /** @type {function (Object): undefined} */
  var EA = Backbone.Router = function(options) {
    if (!options) {
      options = {};
    }
    if (options.routes) {
      this.routes = options.routes;
    }
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };
  /** @type {RegExp} */
  var rSlash = /\((.*?)\)/g;
  /** @type {RegExp} */
  var rLt = /(\(\?)?:\w+/g;
  /** @type {RegExp} */
  var splatParam = /\*\w+/g;
  /** @type {RegExp} */
  var rclass = /[\-{}\[\]+?.,\\\^$|#\s]/g;
  _.extend(EA.prototype, Events, {
    /**
     * @return {undefined}
     */
    initialize : function() {
    },
    /**
     * @param {string} route
     * @param {Object} name
     * @param {Object} callback
     * @return {?}
     */
    route : function(route, name, callback) {
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }
      if (_.isFunction(name)) {
        /** @type {Object} */
        callback = name;
        /** @type {string} */
        name = "";
      }
      if (!callback) {
        callback = this[name];
      }
      var model = this;
      return Backbone.history.route(route, function(fragment) {
        var options = model._extractParameters(route, fragment);
        model.execute(callback, options);
        model.trigger.apply(model, ["route:" + name].concat(options));
        model.trigger("route", name, options);
        Backbone.history.trigger("route", model, name, options);
      }), this;
    },
    /**
     * @param {Function} callback
     * @param {?} args
     * @return {undefined}
     */
    execute : function(callback, args) {
      if (callback) {
        callback.apply(this, args);
      }
    },
    /**
     * @param {string} fragment
     * @param {Object} options
     * @return {?}
     */
    navigate : function(fragment, options) {
      return Backbone.history.navigate(fragment, options), this;
    },
    /**
     * @return {undefined}
     */
    _bindRoutes : function() {
      if (this.routes) {
        this.routes = _.result(this, "routes");
        var route;
        var routes = _.keys(this.routes);
        for (;null != (route = routes.pop());) {
          this.route(route, this.routes[route]);
        }
      }
    },
    /**
     * @param {string} route
     * @return {?}
     */
    _routeToRegExp : function(route) {
      return route = route.replace(rclass, "\\$&").replace(rSlash, "(?:$1)?").replace(rLt, function(match, optional) {
        return optional ? match : "([^/?]+)";
      }).replace(splatParam, "([^?]*?)"), new RegExp("^" + route + "(?:\\?([\\s\\S]*))?$");
    },
    /**
     * @param {string} route
     * @param {?} fragment
     * @return {?}
     */
    _extractParameters : function(route, fragment) {
      var scripts = route.exec(fragment).slice(1);
      return _.map(scripts, function(param, dataAndEvents) {
        return dataAndEvents === scripts.length - 1 ? param || null : param ? decodeURIComponent(param) : null;
      });
    }
  });
  /** @type {function (): undefined} */
  var History = Backbone.History = function() {
    /** @type {Array} */
    this.handlers = [];
    _.bindAll(this, "checkUrl");
    if ("undefined" != typeof window) {
      /** @type {Location} */
      this.location = window.location;
      /** @type {History} */
      this.history = window.history;
    }
  };
  /** @type {RegExp} */
  var r20 = /^[#\/]|\s+$/g;
  /** @type {RegExp} */
  var rreturn = /^\/+|\/+$/g;
  /** @type {RegExp} */
  var rquickExpr = /msie [\w.]+/;
  /** @type {RegExp} */
  var trailingSlash = /\/$/;
  /** @type {RegExp} */
  var pathStripper = /#.*$/;
  /** @type {boolean} */
  History.started = false;
  _.extend(History.prototype, Events, {
    interval : 50,
    /**
     * @return {?}
     */
    atRoot : function() {
      return this.location.pathname.replace(/[^\/]$/, "$&/") === this.root;
    },
    /**
     * @param {string} sUrl
     * @return {?}
     */
    getHash : function(sUrl) {
      var namespaceMatch = (sUrl || this).location.href.match(/#(.*)$/);
      return namespaceMatch ? namespaceMatch[1] : "";
    },
    /**
     * @param {string} fragment
     * @param {boolean} forcePushState
     * @return {?}
     */
    getFragment : function(fragment, forcePushState) {
      if (null == fragment) {
        if (this._hasPushState || (!this._wantsHashChange || forcePushState)) {
          /** @type {string} */
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, "");
          if (!fragment.indexOf(root)) {
            /** @type {string} */
            fragment = fragment.slice(root.length);
          }
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(r20, "");
    },
    /**
     * @param {?} options
     * @return {?}
     */
    start : function(options) {
      if (History.started) {
        throw new Error("Backbone.history has already been started");
      }
      /** @type {boolean} */
      History.started = true;
      this.options = _.extend({
        root : "/"
      }, this.options, options);
      this.root = this.options.root;
      /** @type {boolean} */
      this._wantsHashChange = this.options.hashChange !== false;
      /** @type {boolean} */
      this._wantsPushState = !!this.options.pushState;
      /** @type {boolean} */
      this._hasPushState = !!(this.options.pushState && (this.history && this.history.pushState));
      var fragment = this.getFragment();
      var docMode = document.documentMode;
      /** @type {(boolean|null)} */
      var oldIE = rquickExpr.exec(navigator.userAgent.toLowerCase()) && (!docMode || 7 >= docMode);
      if (this.root = ("/" + this.root + "/").replace(rreturn, "/"), oldIE && this._wantsHashChange) {
        var poster = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = poster.hide().appendTo("body")[0].contentWindow;
        this.navigate(fragment);
      }
      if (this._hasPushState) {
        Backbone.$(window).on("popstate", this.checkUrl);
      } else {
        if (this._wantsHashChange && ("onhashchange" in window && !oldIE)) {
          Backbone.$(window).on("hashchange", this.checkUrl);
        } else {
          if (this._wantsHashChange) {
            /** @type {number} */
            this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
          }
        }
      }
      this.fragment = fragment;
      var location = this.location;
      if (this._wantsHashChange && this._wantsPushState) {
        if (!this._hasPushState && !this.atRoot()) {
          return this.fragment = this.getFragment(null, true), this.location.replace(this.root + "#" + this.fragment), true;
        }
        if (this._hasPushState) {
          if (this.atRoot()) {
            if (location.hash) {
              this.fragment = this.getHash().replace(r20, "");
              this.history.replaceState({}, document.title, this.root + this.fragment);
            }
          }
        }
      }
      return this.options.silent ? void 0 : this.loadUrl();
    },
    /**
     * @return {undefined}
     */
    stop : function() {
      Backbone.$(window).off("popstate", this.checkUrl).off("hashchange", this.checkUrl);
      if (this._checkUrlInterval) {
        clearInterval(this._checkUrlInterval);
      }
      /** @type {boolean} */
      History.started = false;
    },
    /**
     * @param {(Function|string)} route
     * @param {Function} callback
     * @return {undefined}
     */
    route : function(route, callback) {
      this.handlers.unshift({
        route : route,
        /** @type {Function} */
        callback : callback
      });
    },
    /**
     * @return {?}
     */
    checkUrl : function() {
      var current = this.getFragment();
      return current === this.fragment && (this.iframe && (current = this.getFragment(this.getHash(this.iframe)))), current === this.fragment ? false : (this.iframe && this.navigate(current), void this.loadUrl());
    },
    /**
     * @param {(number|string)} fragment
     * @return {?}
     */
    loadUrl : function(fragment) {
      return fragment = this.fragment = this.getFragment(fragment), _.any(this.handlers, function(handler) {
        return handler.route.test(fragment) ? (handler.callback(fragment), true) : void 0;
      });
    },
    /**
     * @param {string} fragment
     * @param {Object} options
     * @return {?}
     */
    navigate : function(fragment, options) {
      if (!History.started) {
        return false;
      }
      if (!(options && options !== true)) {
        options = {
          trigger : !!options
        };
      }
      var url = this.root + (fragment = this.getFragment(fragment || ""));
      if (fragment = fragment.replace(pathStripper, ""), this.fragment !== fragment) {
        if (this.fragment = fragment, "" === fragment && ("/" !== url && (url = url.slice(0, -1))), this._hasPushState) {
          this.history[options.replace ? "replaceState" : "pushState"]({}, document.title, url);
        } else {
          if (!this._wantsHashChange) {
            return this.location.assign(url);
          }
          this._updateHash(this.location, fragment, options.replace);
          if (this.iframe) {
            if (fragment !== this.getFragment(this.getHash(this.iframe))) {
              if (!options.replace) {
                this.iframe.document.open().close();
              }
              this._updateHash(this.iframe.location, fragment, options.replace);
            }
          }
        }
        return options.trigger ? this.loadUrl(fragment) : void 0;
      }
    },
    /**
     * @param {string} location
     * @param {string} fragment
     * @param {?} replace
     * @return {undefined}
     */
    _updateHash : function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, "");
        location.replace(href + "#" + fragment);
      } else {
        /** @type {string} */
        location.hash = "#" + fragment;
      }
    }
  });
  Backbone.history = new History;
  /**
   * @param {?} opt_attributes
   * @param {?} replacementHash
   * @return {?}
   */
  var extend = function(opt_attributes, replacementHash) {
    var child;
    var parent = this;
    child = opt_attributes && _.has(opt_attributes, "constructor") ? opt_attributes.constructor : function() {
      return parent.apply(this, arguments);
    };
    _.extend(child, parent, replacementHash);
    /**
     * @return {undefined}
     */
    var Surrogate = function() {
      this.constructor = child;
    };
    return Surrogate.prototype = parent.prototype, child.prototype = new Surrogate, opt_attributes && _.extend(child.prototype, opt_attributes), child.__super__ = parent.prototype, child;
  };
  /** @type {function (?, ?): ?} */
  Model.extend = Collection.extend = EA.extend = View.extend = History.extend = extend;
  /**
   * @return {?}
   */
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };
  /**
   * @param {Function} exports
   * @param {Object} options
   * @return {undefined}
   */
  var wrapError = function(exports, options) {
    /** @type {function (Function): undefined} */
    var error = options.error;
    /**
     * @param {Function} a
     * @return {undefined}
     */
    options.error = function(a) {
      if (error) {
        error(exports, a, options);
      }
      exports.trigger("error", exports, a, options);
    };
  };
  return Backbone;
}), define("common/vendor_extensions/backbone.overrides", ["backbone.original"], function(Backbone) {
  return Backbone.ajax = function(options) {
    return "jsonp" === options.dataType && (options.cache = true), require("core/api").ajax(options);
  }, Backbone.Collection.prototype.parse = function(callback) {
    return callback.response;
  }, Backbone;
}), define("common/vendor_extensions/backbone.extensions", ["backbone.original", "underscore"], function(dataAndEvents, dust) {
  return dataAndEvents.collectionAddNormalizer = function(type, t) {
    return function(callback) {
      return function(value, data, parent) {
        var node;
        if (value instanceof type) {
          /** @type {Object} */
          parent = data;
          /** @type {Object} */
          data = value;
          node = data.models;
        } else {
          if (value instanceof t) {
            /** @type {Array} */
            node = [value];
          } else {
            if (!dust.isArray(value)) {
              throw new Error("Unknown model: " + typeof value);
            }
            /** @type {Object} */
            node = value;
          }
        }
        return callback.call(this, node, data, parent || {});
      };
    };
  }, dataAndEvents;
}), define("backbone", ["backbone.original", "common/vendor_extensions/backbone.overrides", "common/vendor_extensions/backbone.extensions"], function(dataAndEvents) {
  return dataAndEvents;
}), define("common/urls", ["shared/corefuncs"], function($) {
  /** @type {boolean} */
  var b = "https:" === window.location.protocol;
  var attributes = {
    root : "http://ryflection.com",
    media : "//a.disquscdn.com/next/current/embed",
    loading : "//a.disquscdn.com/next/embed/assets/html/loading.735f44a88ca13ab823f1ea2527b9e70a.html",
    realertime : "//realtime.services.ryflection.com",
    jester : "https://referrer.ryflection.com/juggler",
    glitter : "https://glitter.services.ryflection.com/urls/",
    login : "https://ryflection.com/next/login/",
    dotcomLogin : "https://ryflection.com/profile/login/",
    api : "http://ryflection.com/api/3.0/",
    apiSecure : "https://ryflection.com/api/3.0/",
    logout : "http://ryflection.com/logout/",
    editProfile : "https://ryflection.com/home/settings/account/",
    verifyEmail : "https://ryflection.com/next/verify/",
    authorize : "https://ryflection.com/api/oauth/2.0/authorize/",
    homeInbox : "https://ryflection.com/home/inbox/",
    moderate : "https://ryflection.com/admin/moderate/",
    oauth : {
      twitter : "http://ryflection.com/_ax/twitter/begin/",
      google : "http://ryflection.com/_ax/google/begin/",
      facebook : "http://ryflection.com/_ax/facebook/begin/"
    },
    avatar : {
      generic : "//a.disquscdn.com/next/embed/assets/img/noavatar92.b677f9ddbee6f4bb22f473ae3bd61b85.png"
    },
    linkAffiliatorClient : "//www.ryflection.com/next/embed/alfie.f51946af45e0b561c60f768335c9eb79.js",
    linkAffiliatorAPI : "https://links.services.ryflection.com/api"
  };
  return b && (attributes = $.extend(attributes, {
    root : "https://ryflection.com",
    api : attributes.apiSecure,
    logout : "https://ryflection.com/logout/",
    editProfile : "https://ryflection.com/home/settings/account/",
    moderate : "https://ryflection.com/admin/moderate/",
    oauth : {
      twitter : "https://ryflection.com/_ax/twitter/begin/",
      google : "https://ryflection.com/_ax/google/begin/",
      facebook : "https://ryflection.com/_ax/facebook/begin/"
    }
  })), attributes;
}), define("common/keys", [], function() {
  var googleAnalytics = {
    embedAPI : "E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F",
    viglinkAPI : "cfdfcf52dffd0a702a61bad27507376d",
    googleAnalytics : "UA-1410476-6"
  };
  return googleAnalytics;
}), define("common/defines", [], function() {
  return{
    debug : false
  };
}), define("core/config", ["common/urls", "common/keys", "common/defines"], function(options, dataAndEvents, emailMessage) {
  return{
    urls : {
      avatar : {
        generic : options.avatar.generic
      },
      api : options.api,
      apiSecure : options.apiSecure,
      media : options.media,
      verifyEmail : options.verifyEmail
    },
    keys : {
      api : dataAndEvents.embedAPI
    },
    TLDS : "abb|abbott|abogado|ac|academy|accenture|accountant|accountants|active|actor|ad|ads|adult|ae|aeg|aero|af|afl|ag|agency|ai|aig|airforce|airtel|al|allfinanz|alsace|am|amsterdam|android|ao|apartments|app|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|auto|autos|aw|ax|axa|az|azure|ba|band|bank|bar|barcelona|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bcn|bd|be|beer|bentley|berlin|best|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|bloomberg|blue|bm|bmw|bn|bnl|bnpparibas|bo|boats|bond|boo|boots|boutique|br|bradesco|bridgestone|broker|brother|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|camera|camp|cancerresearch|canon|capetown|capital|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cba|cbn|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|chat|cheap|chloe|christmas|chrome|church|ci|cisco|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|cloud|club|cm|cn|co|coach|codes|coffee|college|cologne|com|commbank|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|corsica|country|coupons|courses|cr|credit|creditcard|cricket|crown|crs|cruises|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|deals|degree|delivery|delta|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|doosan|download|drive|durban|dvag|dz|earth|eat|ec|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fage|fail|faith|family|fan|fans|farm|fashion|feedback|fi|film|finance|financial|firmdale|fish|fishing|fit|fitness|fj|fk|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|forex|forsale|forum|foundation|fr|frl|frogans|fund|furniture|futbol|fyi|ga|gal|gallery|game|garden|gb|gbiz|gd|gdn|ge|gent|genting|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|group|gs|gt|gu|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|hoteles|hotmail|house|how|hr|hsbc|ht|hu|ibm|icbc|ice|icu|id|ie|ifm|iinet|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insure|int|international|investments|io|ipiranga|iq|ir|irish|is|ist|istanbul|it|itau|iwc|java|jcb|je|jetzt|jewelry|jlc|jll|jm|jo|jobs|joburg|jp|jprs|juegos|kaufen|kddi|ke|kg|kh|ki|kim|kitchen|kiwi|km|kn|koeln|komatsu|kp|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|lancaster|land|lasalle|lat|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|legal|lexus|lgbt|li|liaison|lidl|life|lighting|limited|limo|link|live|lixil|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|man|management|mango|market|marketing|markets|marriott|mba|mc|md|me|media|meet|melbourne|meme|memorial|men|menu|mg|mh|miami|microsoft|mil|mini|mk|ml|mm|mma|mn|mo|mobi|moda|moe|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|movistar|mp|mq|mr|ms|mt|mtn|mtpc|mu|museum|mv|mw|mx|my|mz|na|nadex|nagoya|name|navy|nc|ne|nec|net|netbank|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|ninja|nissan|nl|no|nokia|np|nr|nra|nrw|ntt|nu|nyc|nz|office|okinawa|om|omega|one|ong|onl|online|ooo|oracle|orange|org|organic|osaka|otsuka|ovh|pa|page|panerai|paris|partners|parts|party|pe|pet|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pink|pizza|pk|pl|place|play|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|ps|pt|pub|pw|py|qa|qpon|quebec|racing|re|realtor|realty|recipes|red|redstone|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rich|ricoh|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|run|rw|ryukyu|sa|saarland|sakura|sale|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|saxo|sb|sc|sca|scb|schmidt|scholarships|school|schule|schwarz|science|scor|scot|sd|se|seat|seek|sener|services|sew|sex|sexy|sg|sh|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|sky|skype|sl|sm|sn|sncf|so|soccer|social|software|sohu|solar|solutions|sony|soy|space|spiegel|spreadbetting|sr|srl|st|starhub|statoil|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiss|sx|sy|sydney|systems|sz|taipei|tatamotors|tatar|tattoo|tax|taxi|tc|td|team|tech|technology|tel|telefonica|temasek|tennis|tf|tg|th|thd|theater|tickets|tienda|tips|tires|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toyota|toys|tr|trade|trading|training|travel|trust|tt|tui|tv|tw|tz|ua|ubs|ug|uk|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|video|villas|vin|vision|vista|vistaprint|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|walter|wang|watch|webcam|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|wme|work|works|world|ws|wtc|wtf|xbox|xerox|xin|xn--11b4c3d|xn--1qqw23a|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3pxu8k|xn--42c2d9a|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--55qw42g|xn--55qx5d|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80asehdb|xn--80aswg|xn--90a3ac|xn--90ais|xn--9dbq2a|xn--9et52u|xn--b4w605ferd|xn--c1avg|xn--c2br7g|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--estv75g|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--gecrj9c|xn--h2brj9c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbpl2fh|xn--mgbx4cd0ab|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--pssy2u|xn--q9jyb4c|xn--qcka1pmc|xn--rhqv96g|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xperia|xxx|xyz|yachts|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zip|zm|zone|zuerich|zw",
    debug : emailMessage.debug
  };
}), define("core/utils", ["underscore", "core/config"], function(self, dataAndEvents) {
  /**
   * @param {string} data
   * @return {?}
   */
  function toString(data) {
    /**
     * @param {string} value
     * @return {?}
     */
    function pad(value) {
      return value = Number(value).toString(16), 1 === value.length ? "0" + value : value;
    }
    if ("#" === data.substr(0, 1)) {
      return data;
    }
    /** @type {(Array.<string>|null)} */
    var newState = /.*?rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(data);
    if (!newState || 4 !== newState.length) {
      return "";
    }
    var r = pad(newState[1]);
    var g = pad(newState[2]);
    var b = pad(newState[3]);
    return "#" + r + g + b;
  }
  /**
   * @param {string} str
   * @return {?}
   */
  function trim(str) {
    return toString(str).replace(/[^#A-Fa-f0-9]/g, "");
  }
  /**
   * @param {Function} matcherFunction
   * @return {?}
   */
  function fn(matcherFunction) {
    return function(types) {
      return types && (types.preventDefault && types.preventDefault()), matcherFunction.apply(this, arguments);
    };
  }
  /**
   * @param {Function} matcherFunction
   * @return {?}
   */
  function addEvent(matcherFunction) {
    return function(event) {
      return event && (event.stopPropagation && event.stopPropagation()), matcherFunction.apply(this, arguments);
    };
  }
  /**
   * @param {Function} b
   * @return {?}
   */
  function load(b) {
    return fn(addEvent(b));
  }
  /**
   * @param {string} filename
   * @return {?}
   */
  function success(filename) {
    if (!filename) {
      return "";
    }
    /** @type {string} */
    filename = "http://" + filename.replace(/^([a-z+.-]+:)?\/+/i, "");
    /** @type {Element} */
    var a = document.createElement("a");
    /** @type {string} */
    a.href = filename;
    var evt = a.hostname.replace(/^www\d*\./i, "");
    return evt = evt.toLowerCase();
  }
  /**
   * @param {Function} attributes
   * @return {?}
   */
  function encode(attributes) {
    /** @type {Array} */
    var columns = [];
    return self.each(attributes, function(match, id) {
      if (void 0 !== match) {
        columns.push(id + (null !== match ? "=" + encodeURIComponent(match) : ""));
      }
    }), columns.join("&");
  }
  /**
   * @param {string} s
   * @param {Function} opt_attributes
   * @param {boolean} var_args
   * @return {?}
   */
  function extend(s, opt_attributes, var_args) {
    if (opt_attributes && (-1 === s.indexOf("?") ? s += "?" : "&" !== s.charAt(s.length - 1) && (s += "&"), s += this.serializeArgs(opt_attributes)), var_args) {
      var attributes = {};
      return attributes[(new Date).getTime()] = null, this.serialize(s, attributes);
    }
    var len = s.length;
    return "&" === s.charAt(len - 1) ? s.slice(0, len - 1) : s;
  }
  /**
   * @param {string} url
   * @param {string} name
   * @param {Object} attributes
   * @return {?}
   */
  function post(url, name, attributes) {
    if (attributes) {
      self.extend(attributes, {
        location : 1,
        status : 1,
        resizable : 1,
        scrollbars : 1
      });
    } else {
      attributes = {};
    }
    if (attributes.width) {
      if (attributes.height) {
        self.defaults(attributes, {
          left : window.screen.width / 2 - attributes.width / 2,
          top : window.screen.height / 2 - attributes.height / 2
        });
      }
    }
    var popup_options = self.map(attributes, function(ctag, otag) {
      return otag + "=" + ctag;
    }).join(",");
    return window.open(url, name, popup_options);
  }
  /**
   * @return {?}
   */
  function CustomColor() {
    return self.reduce(document.location.search.substr(1).split("&"), function(dst, pair) {
      var src = pair.split("=").map(decodeURIComponent);
      return src[0] && (dst[src[0]] = src[1]), dst;
    }, {});
  }
  /**
   * @param {string} a
   * @param {number} b
   * @param {?} n
   * @return {?}
   */
  function e(a, b, n) {
    if (0 > b) {
      /** @type {number} */
      b = 0;
    }
    var p = a.substring(0, b);
    var f = a.substring(b);
    return p.length && (!/\s$/.test(p) && (p += " ")), /^\s/.test(f) || (f = " " + f), p + n + f;
  }
  /** @type {RegExp} */
  var rchecked = /^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  /**
   * @param {?} value
   * @return {?}
   */
  var validateEmail = function(value) {
    return rchecked.test(value);
  };
  var p = dataAndEvents.TLDS || "zw|zuerich|zone|zm|zip|za|yt|youtube|yokohama|yoga|yodobashi|ye|yandex|yachts|xyz|xxx|xin|xerox|wtf|wtc|ws|world|works|work|wme|win|williamhill|wiki|wien|whoswho|wf|weir|wedding|wed|website|webcam|watch|wang|wales|vu|voyage|voto|voting|vote|vodka|vn|vlaanderen|vision|villas|video|viajes|vi|vg|vet|versicherung|ventures|vegas|ve|vc|vacations|va|uz|uy|us|uol|uno|university|uk|ug|ua|tz|tw|tv|tui|tt|trust|travel|training|trading|trade|tr|toys|town|tours|toshiba|toray|top|tools|tokyo|today|to|tn|tm|tl|tk|tj|tirol|tires|tips|tienda|tickets|theater|th|tg|tf|tennis|temasek|tel|technology|tech|team|td|tc|taxi|tax|tattoo|tatar|taipei|sz|systems|sydney|sy|sx|swiss|sv|suzuki|surgery|surf|support|supply|supplies|sucks|su|style|study|st|sr|spreadbetting|spiegel|space|soy|sony|solutions|solar|sohu|software|social|so|sn|sm|sl|sky|sk|sj|site|singles|si|shriram|show|shoes|shiksha|sh|sg|sexy|sex|sew|services|sener|seat|se|sd|scot|science|schwarz|schule|school|scholarships|schmidt|scb|sca|sc|sb|saxo|sarl|sap|samsung|sale|saarland|sa|ryukyu|rw|run|ruhr|ru|rsvp|rs|rodeo|rocks|ro|rip|rio|rich|reviews|review|restaurant|rest|republican|report|repair|rentals|rent|ren|reit|reisen|reise|rehab|redstone|red|recipes|realtor|re|racing|quebec|qpon|qa|py|pw|pub|pt|ps|property|properties|prof|productions|prod|pro|press|praxi|pr|post|porn|poker|pohl|pn|pm|plus|plumbing|place|pl|pk|pizza|pink|pictures|pictet|pics|piaget|physio|photos|photography|photo|philips|pharmacy|ph|pg|pf|pe|party|parts|partners|paris|panerai|page|pa|ovh|otsuka|osaka|organic|org|oracle|ooo|online|onl|ong|one|om|okinawa|nz|nyc|nu|ntt|nrw|nra|nr|np|no|nl|nissan|ninja|nico|ni|nhk|ngo|ng|nf|nexus|news|new|neustar|network|net|nec|ne|nc|navy|name|nagoya|nadex|na|mz|my|mx|mw|mv|museum|mu|mtpc|mtn|mt|ms|mr|mq|mp|movie|mov|motorcycles|moscow|mortgage|mormon|money|monash|moe|moda|mobi|mo|mn|mma|mm|ml|mk|mini|mil|miami|mh|mg|menu|memorial|meme|melbourne|meet|media|me|md|mc|marriott|markets|marketing|market|mango|management|maison|maif|madrid|ma|ly|lv|luxury|luxe|lu|ltda|lt|ls|lr|love|lotto|lotte|london|lol|loans|loan|lk|link|limo|limited|lighting|life|lidl|liaison|li|lgbt|legal|leclerc|lease|lds|lc|lb|lawyer|latrobe|lat|land|lacaixa|la|kz|kyoto|ky|kw|kred|krd|kr|kp|komatsu|koeln|kn|km|kiwi|kitchen|kim|ki|kh|kg|ke|kddi|kaufen|juegos|jp|joburg|jobs|jo|jm|jewelry|jetzt|je|jcb|java|iwc|it|is|irish|ir|iq|io|investments|international|int|insure|institute|ink|ing|info|infiniti|industries|in|immobilien|immo|im|il|ifm|ie|id|icu|ibm|hu|ht|hr|how|house|hosting|host|horse|honda|homes|holiday|holdings|hockey|hn|hm|hk|hiv|hitachi|hiphop|hermes|here|help|healthcare|haus|hangout|hamburg|gy|gw|guru|guitars|guide|guge|gu|gt|gs|gripe|green|gratis|graphics|gr|gq|gp|gov|gop|google|goog|goo|golf|goldpoint|gold|gn|gmx|gmo|gmail|gm|globo|global|gle|glass|gl|gives|gifts|gift|gi|gh|ggee|gg|gf|gent|ge|gdn|gd|gbiz|gb|garden|gallery|gal|ga|futbol|furniture|fund|frogans|frl|fr|foundation|forsale|forex|football|foo|fo|fm|fly|flsmidth|flowers|florist|flights|fk|fj|fitness|fit|fishing|fish|firmdale|financial|finance|film|fi|feedback|fashion|farm|fans|fan|faith|fail|express|exposed|expert|exchange|everbank|events|eus|eurovision|eu|et|estate|esq|es|erni|er|equipment|epson|enterprises|engineering|engineer|energy|emerck|email|eg|ee|education|edu|ec|eat|dz|dvag|durban|download|doosan|domains|doha|dog|docs|do|dnp|dm|dk|dj|discount|directory|direct|digital|diet|diamonds|dev|design|desi|dentist|dental|democrat|delivery|degree|deals|de|dclk|day|datsun|dating|date|dance|dad|dabur|cz|cyou|cymru|cy|cx|cw|cv|cuisinella|cu|cruises|crs|cricket|creditcard|credit|cr|courses|country|coop|cool|cooking|contractors|consulting|construction|condos|computer|company|community|com|cologne|college|coffee|codes|coach|co|cn|cm|club|clothing|clinic|click|cleaning|claims|cl|ck|city|citic|ci|church|chrome|christmas|chloe|cheap|chat|channel|ch|cg|cfd|cfa|cf|cern|ceo|center|cd|cc|cbn|catering|cat|casino|cash|casa|cartier|cars|careers|career|care|cards|caravan|capital|capetown|canon|cancerresearch|camp|camera|cal|cafe|cab|ca|bzh|bz|by|bw|bv|buzz|business|builders|build|budapest|bt|bs|brussels|brother|broker|bridgestone|br|boutique|boo|bond|boats|bo|bnpparibas|bn|bmw|bm|blue|bloomberg|blackfriday|black|bj|biz|bio|bingo|bike|bid|bi|bh|bg|bf|best|berlin|beer|be|bd|bbc|bb|bayern|bauhaus|bargains|barclays|barclaycard|bar|bank|band|ba|az|axa|ax|aw|autos|auto|audio|auction|au|attorney|at|associates|asia|as|arpa|army|archi|ar|aquarelle|aq|apartments|ao|android|an|amsterdam|am|alsace|allfinanz|al|airforce|aig|ai|agency|ag|afl|af|aero|ae|adult|ads|ad|actor|active|accountants|accountant|accenture|academy|ac|abogado|abbott|abb";
  /** @type {RegExp} */
  var chunker = new RegExp("([^@.]|^)\\b(?:\\w[\\w-]*:/{0,3}(?:(?:\\w+:)?\\w+@)?)?([\\w-]+\\.)+(?:" + p + ')(?!\\.\\w)\\b(?::\\d+)?(?:[/?][^\\s\\{\\}\\|\\\\\\^\\[\\]`<>"\\x80-\\xFF\\x00-\\x1F\\x7F]*)?', "g");
  /**
   * @param {string} query
   * @return {?}
   */
  var find = function(query) {
    return Boolean(query.match(chunker));
  };
  /** @type {RegExp} */
  var rparentsprev = /^[\w-]+:\/{0,3}/;
  /** @type {RegExp} */
  var pat = /([\.,]+)$/g;
  /**
   * @param {?} selector
   * @return {?}
   */
  var add = function(selector) {
    var match;
    var name;
    var matches;
    var opts;
    var token;
    /** @type {Array} */
    var results = [];
    if (!selector) {
      return results;
    }
    for (;match = chunker.exec(selector);) {
      /** @type {string} */
      name = match[0];
      /** @type {string} */
      token = match[1];
      /** @type {string} */
      name = name.slice(token.length);
      /** @type {number} */
      pat.lastIndex = 0;
      /** @type {(Array.<string>|null)} */
      matches = pat.exec(name);
      if (matches) {
        /** @type {string} */
        name = name.slice(0, name.length - matches[0].length);
      }
      /** @type {string} */
      opts = rparentsprev.test(name) ? name : "http://" + name;
      /** @type {number} */
      var start = match.index + token.length;
      results.push({
        text : name,
        url : opts,
        index : start,
        endIndex : start + name.length
      });
    }
    return results;
  };
  /** @type {RegExp} */
  var regexp = new RegExp("[\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E\\u00A1-\\u00BF\\u2010-\\u2027\\u2030-\\u205E\\u2300-\\u23FF\\u2E00-\\u2E7F\\u3001-\\u303F\\uFE10-\\uFE19\\uFE30-\\uFE4F\\uFE50-\\uFE6B\\uFF01-\\uFF0F\\uFF1A-\\uFF20\\uFF3B-\\uFF40\\uFF5B-\\uFF60\\uFF5F-\\uFF64]+$");
  /**
   * @param {string} str
   * @param {number} max
   * @return {?}
   */
  var split = function(str, max) {
    if (str.length <= max) {
      return str;
    }
    str = str.slice(0, max - 1);
    /** @type {string} */
    var arr = str;
    /** @type {(Array.<string>|null)} */
    var res = /(^.*\S)\s/.exec(str);
    if (res) {
      /** @type {string} */
      str = res[1];
    }
    /** @type {(Array.<string>|null)} */
    var m = regexp.exec(str);
    return m && (str = str.slice(0, str.length - m[0].length)), str.length < 0.5 * arr.length && (str = arr), str + "\u00e2\u20ac\u00a6";
  };
  var a = function() {
    /** @type {Element} */
    var el = document.createElement("fakeelement");
    return function(dataAndEvents, cssprop) {
      return void 0 !== el.style[cssprop];
    };
  }();
  var transitionEndEvent = function() {
    var sel = {
      transition : "transitionend",
      OTransition : "otransitionend",
      MozTransition : "transitionend",
      WebkitTransition : "webkitTransitionEnd"
    };
    return self.find(sel, a) || null;
  }();
  var animationEndEvent = function() {
    var animations = {
      animation : "animationend",
      OAnimation : "oAnimationEnd",
      MozAnimation : "animationend",
      WebkitAnimation : "webkitAnimationEnd"
    };
    return self.find(animations, a) || null;
  }();
  /**
   * @param {Object} win
   * @return {?}
   */
  var init = function(win) {
    return win = win || window, /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(win.navigator.userAgent || (win.navigator.vendor || win.opera));
  };
  return{
    /** @type {function (?): ?} */
    validateEmail : validateEmail,
    /** @type {function (string): ?} */
    isUrl : find,
    /** @type {function (?): ?} */
    bleachFindUrls : add,
    /** @type {function (string, number): ?} */
    niceTruncate : split,
    transitionEndEvent : transitionEndEvent,
    animationEndEvent : animationEndEvent,
    /** @type {function (Object): ?} */
    isMobileUserAgent : init,
    /** @type {function (string): ?} */
    escapeColor : trim,
    /** @type {function (Function): ?} */
    preventDefaultHandler : fn,
    /** @type {function (Function): ?} */
    stopPropagationHandler : addEvent,
    /** @type {function (Function): ?} */
    stopEventHandler : load,
    /** @type {function (string): ?} */
    getDomain : success,
    /** @type {function (Function): ?} */
    serializeArgs : encode,
    /** @type {function (string, Function, boolean): ?} */
    serialize : extend,
    /** @type {function (string, string, Object): ?} */
    openWindow : post,
    /** @type {function (): ?} */
    getQueryParams : CustomColor,
    /** @type {function (string, number, ?): ?} */
    insertWithWhitespace : e
  };
}), define("core/api", ["jquery", "underscore", "backbone", "core/config", "core/utils"], function($, _, Backbone, self, item) {
  /**
   * @param {string} uri
   * @return {?}
   */
  function parse(uri) {
    return link.href = uri, _.pick(link, "hostname", "protocol", "port");
  }
  /**
   * @param {Object} task
   * @return {?}
   */
  function build(task) {
    return attributes.xhrSupportsCredentialedRequests ? false : callback(window.location, task.url);
  }
  /**
   * @param {string} v
   * @param {string} value
   * @return {?}
   */
  function callback(v, value) {
    var url = parse(v);
    var parts = parse(value);
    /** @type {string} */
    var protocol = window.location.protocol;
    return ":" === url.protocol && (url.protocol = protocol), ":" === parts.protocol && (parts.protocol = protocol), parts.protocol !== url.protocol || (parts.hostname !== url.hostname || parts.port !== url.port);
  }
  /**
   * @param {string} item
   * @return {?}
   */
  function pushQueue(item) {
    return'<iframe name="' + item + '"></iframe>';
  }
  /**
   * @param {Object} options
   * @return {?}
   */
  function init(options) {
    /**
     * @param {KeyboardEvent} event
     * @return {undefined}
     */
    function fn(event) {
      var to = event.originalEvent.origin;
      if (self.urls.apiSecure.slice(0, to.length) === to) {
        /** @type {*} */
        var ok = JSON.parse(event.originalEvent.data);
        if (ok.requestId === tapCallback) {
          var cb;
          if (0 === ok.code) {
            defer.resolve(ok);
            cb = options.success;
          } else {
            defer.reject(ok);
            cb = options.error;
          }
          /** @type {function (): undefined} */
          cb = cb || function() {
          };
          delete ok.requestId;
          cb(ok);
          document.body.removeChild(childEl);
          document.body.removeChild(form);
          $(window).off("message", fn);
        }
      }
    }
    options = _.defaults(options, opts);
    if (options.secure) {
      options.url = appendQuery(options.url);
    }
    var childEl;
    var tapCallback = _.uniqueId("ft_");
    /** @type {Element} */
    var elem = document.createElement("div");
    /** @type {Element} */
    var form = document.createElement("form");
    /** @type {string} */
    var item = "frame_" + tapCallback;
    var defer = new $.Deferred;
    return elem.innerHTML = attributes.getIframe(item), childEl = elem.childNodes[0], form.target = item, form.action = options.url.replace(".json", ".pm"), form.method = options.method || "GET", options.data = _.extend(options.data, {
      callback : tapCallback,
      referrer : document.referrer
    }), _.each(options.data, function(attributes, name) {
      if (attributes === true) {
        /** @type {Array} */
        attributes = [1];
      } else {
        if (attributes === false) {
          /** @type {Array} */
          attributes = [0];
        } else {
          if (null === attributes) {
            /** @type {Array} */
            attributes = [""];
          } else {
            if (!_.isArray(attributes)) {
              /** @type {Array} */
              attributes = [attributes];
            }
          }
        }
      }
      _.each(attributes, function(newValue) {
        /** @type {Element} */
        var field = document.createElement("input");
        /** @type {string} */
        field.type = "hidden";
        /** @type {string} */
        field.name = name;
        field.value = newValue;
        form.appendChild(field);
      });
    }), $(window).on("message", fn), document.body.appendChild(childEl), document.body.appendChild(form), form.submit(), defer.promise();
  }
  /**
   * @param {string} query
   * @return {?}
   */
  function appendQuery(query) {
    return query.replace(/^(http\:)?\/\//, "https://");
  }
  /**
   * @param {Object} options
   * @return {?}
   */
  function request(options) {
    options = _.defaults(options, opts);
    if (options.secure) {
      options.url = appendQuery(options.url);
    }
    /** @type {boolean} */
    options.traditional = true;
    /** @type {Location} */
    var location = window.location;
    link.href = options.url;
    if (location.host !== link.host || location.protocol !== link.protocol) {
      options.xhrFields = {
        withCredentials : true
      };
    }
    if (!options.omitReflectApiKey) {
      options.data = options.data || {};
      if (window.FormData && options.data instanceof window.FormData) {
        options.url = item.serialize(options.url, {
          api_key : self.keys.api
        });
      } else {
        options.data.api_key = self.keys.api;
      }
    }
    /** @type {function (Function): undefined} */
    var html = options.error;
    return options.error = function(a) {
      attributes.trigger("error", a);
      if (_.isFunction(html)) {
        html(a);
      }
    }, $.ajax(options);
  }
  /**
   * @param {string} value
   * @param {Object} name
   * @return {?}
   */
  function initialize(value, name) {
    name = name || {};
    name.url = load(value, {
      secure : name.secure
    });
    name.data = _.extend(name.data || {}, {
      api_key : self.keys.api
    });
    attributes.trigger("call", name);
    var dfd = (build(name) ? init : request)(name);
    return dfd && dfd.always(_.bind(this.trigger, this, "complete", name)), dfd;
  }
  /**
   * @param {string} path
   * @param {Object} options
   * @return {?}
   */
  function load(path, options) {
    return options = options || {}, /(https?\:)?\/\//.test(path) ? path : (void 0 !== options.secure ? options.secure : opts.secure) || "https:" === window.location.protocol ? self.urls.apiSecure + path : self.urls.api + path;
  }
  /** @type {Element} */
  var link = document.createElement("a");
  var opts = {};
  /** @type {boolean} */
  var supports_cors = "withCredentials" in new window.XMLHttpRequest;
  var attributes = {
    /** @type {function (Object): ?} */
    ajax : request,
    /** @type {function (string, Object): ?} */
    call : initialize,
    /** @type {function (string, Object): ?} */
    getURL : load,
    /**
     * @param {Object} object
     * @return {undefined}
     */
    defaults : function(object) {
      var key;
      var value;
      var attributes;
      for (key in object) {
        value = object[key];
        attributes = opts[key];
        if (_.isObject(value) && _.isObject(attributes)) {
          _.extend(attributes, value);
        } else {
          opts[key] = value;
        }
      }
    },
    /**
     * @param {?} data
     * @return {?}
     */
    headers : function(data) {
      var result = _.extend({}, opts.headers, data);
      return opts.headers = _.pick(result, Boolean), opts.headers;
    },
    /** @type {function (Object): ?} */
    useFormTransport : build,
    xhrSupportsCredentialedRequests : supports_cors,
    /** @type {function (string): ?} */
    makeHttps : appendQuery,
    /** @type {function (Object): ?} */
    formTransport : init,
    /** @type {function (string): ?} */
    getIframe : pushQueue
  };
  return _.extend(attributes, Backbone.Events), attributes;
}), define("core/utils/urls", [], function() {
  var t = {};
  /** @type {Element} */
  var link = document.createElement("a");
  return t.getOrigin = function(url) {
    /** @type {string} */
    link.href = url;
    var paths = link.href.split("/");
    return paths[0] + "//" + paths[2];
  }, t.getHostName = function(optHref) {
    return link.href = optHref, link.hostname;
  }, t;
}), define("core/frameBus", ["jquery", "underscore", "backbone", "core/utils/urls"], function($, _, Backbone, t) {
  /**
   * @param {Location} val
   * @return {?}
   */
  function getHash(val) {
    return val.hash.slice(1).replace(/(^\d+).*/, "$1");
  }
  var phoneNumber = getHash(window.location);
  /** @type {Window} */
  var sender = window.opener || window.parent;
  /** @type {string} */
  var e = document.referrer;
  var r = {};
  r.client = t.getOrigin(document.location.href);
  r.host = e ? t.getOrigin(e) : r.client;
  var attributes = {
    /** @type {function (Location): ?} */
    getUID : getHash,
    origins : r,
    /**
     * @param {Object} e
     * @return {undefined}
     */
    messageHandler : function(e) {
      e = e.originalEvent;
      var self;
      try {
        /** @type {*} */
        self = JSON.parse(e.data);
      } catch (c) {
        return;
      }
      if (!self.name || ("!" !== self.name[0] || e.origin === r.client)) {
        switch(self.scope) {
          case "host":
            break;
          case "client":
            attributes.trigger(self.name, self.data);
        }
      }
    },
    /**
     * @param {string} message
     * @return {undefined}
     */
    postMessage : function(message) {
      message.sender = phoneNumber;
      /** @type {string} */
      message = JSON.stringify(message);
      sender.postMessage(message, "*");
    },
    /**
     * @param {string} eventName
     * @param {Node} keys
     * @return {undefined}
     */
    sendHostMessage : function(eventName, keys) {
      keys = keys || [];
      attributes.postMessage({
        scope : "host",
        name : eventName,
        data : keys
      });
    }
  };
  return _.extend(attributes, Backbone.Events), $(window).on("message", attributes.messageHandler), $(window).on("unload", function() {
    attributes.sendHostMessage("die");
  }), window.REFLECT = window.REFLECT || {}, window.REFLECT.Bus = attributes, attributes;
}), define("core/bus", ["backbone", "underscore", "core/frameBus"], function(Backbone, _, frame) {
  var self = _.extend({}, Backbone.Events);
  return self.frame = frame, self;
}), function(name) {
  /**
   * @param {string} yr
   * @param {string} dataAndEvents
   * @param {string} val
   * @return {?}
   */
  function fixYear(yr, dataAndEvents, val) {
    switch(arguments.length) {
      case 2:
        return null != yr ? yr : dataAndEvents;
      case 3:
        return null != yr ? yr : null != dataAndEvents ? dataAndEvents : val;
      default:
        throw new Error("Implement me");;
    }
  }
  /**
   * @return {?}
   */
  function validateTransport() {
    return{
      empty : false,
      unusedTokens : [],
      unusedInput : [],
      overflow : -2,
      charsLeftOver : 0,
      nullInput : false,
      invalidMonth : null,
      invalidFormat : false,
      userInvalidated : false,
      iso : false
    };
  }
  /**
   * @param {string} message
   * @return {undefined}
   */
  function log(message) {
    if (moment.suppressDeprecationWarnings === false) {
      if ("undefined" != typeof console) {
        if (console.warn) {
          console.warn("Deprecation warning: " + message);
        }
      }
    }
  }
  /**
   * @param {string} message
   * @param {Function} fn
   * @return {?}
   */
  function timeout(message, fn) {
    /** @type {boolean} */
    var c = true;
    return extend(function() {
      return c && (log(message), c = false), fn.apply(this, arguments);
    }, fn);
  }
  /**
   * @param {string} index
   * @param {string} data
   * @return {undefined}
   */
  function done(index, data) {
    if (!viewItems[index]) {
      log(data);
      /** @type {boolean} */
      viewItems[index] = true;
    }
  }
  /**
   * @param {Function} func
   * @param {number} opt_attributes
   * @return {?}
   */
  function padToken(func, opt_attributes) {
    return function(a) {
      return leftZeroFill(func.call(this, a), opt_attributes);
    };
  }
  /**
   * @param {Function} func
   * @param {?} period
   * @return {?}
   */
  function ordinalizeToken(func, period) {
    return function(a) {
      return this.localeData().ordinal(func.call(this, a), period);
    };
  }
  /**
   * @return {undefined}
   */
  function Language() {
  }
  /**
   * @param {null} config
   * @param {boolean} isUTC
   * @return {undefined}
   */
  function Moment(config, isUTC) {
    if (isUTC !== false) {
      checkOverflow(config);
    }
    sendMessage(this, config);
    /** @type {Date} */
    this._d = new Date(+config._d);
  }
  /**
   * @param {Object} duration
   * @return {undefined}
   */
  function Duration(duration) {
    var normalizedInput = normalizeObjectUnits(duration);
    var c = normalizedInput.year || 0;
    var HOUR_MS = normalizedInput.quarter || 0;
    var d = normalizedInput.month || 0;
    var isAdding = normalizedInput.week || 0;
    var mom = normalizedInput.day || 0;
    var h = normalizedInput.hour || 0;
    var i = normalizedInput.minute || 0;
    var _oneDayInMilliseconds = normalizedInput.second || 0;
    var _now = normalizedInput.millisecond || 0;
    /** @type {number} */
    this._milliseconds = +_now + 1E3 * _oneDayInMilliseconds + 6E4 * i + 36E5 * h;
    /** @type {number} */
    this._days = +mom + 7 * isAdding;
    /** @type {number} */
    this._months = +d + 3 * HOUR_MS + 12 * c;
    this._data = {};
    this._locale = moment.localeData();
    this._bubble();
  }
  /**
   * @param {Object} a
   * @param {Object} b
   * @return {?}
   */
  function extend(a, b) {
    var i;
    for (i in b) {
      if (b.hasOwnProperty(i)) {
        a[i] = b[i];
      }
    }
    return b.hasOwnProperty("toString") && (a.toString = b.toString), b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf), a;
  }
  /**
   * @param {Function} config
   * @param {Function} m
   * @return {?}
   */
  function sendMessage(config, m) {
    var letter;
    var k;
    var v;
    if ("undefined" != typeof m._isAMomentObject && (config._isAMomentObject = m._isAMomentObject), "undefined" != typeof m._i && (config._i = m._i), "undefined" != typeof m._f && (config._f = m._f), "undefined" != typeof m._l && (config._l = m._l), "undefined" != typeof m._strict && (config._strict = m._strict), "undefined" != typeof m._tzm && (config._tzm = m._tzm), "undefined" != typeof m._isUTC && (config._isUTC = m._isUTC), "undefined" != typeof m._offset && (config._offset = m._offset), "undefined" != 
    typeof m._pf && (config._pf = m._pf), "undefined" != typeof m._locale && (config._locale = m._locale), map.length > 0) {
      for (letter in map) {
        k = map[letter];
        v = m[k];
        if ("undefined" != typeof v) {
          config[k] = v;
        }
      }
    }
    return config;
  }
  /**
   * @param {number} number
   * @return {?}
   */
  function absRound(number) {
    return 0 > number ? Math.ceil(number) : Math.floor(number);
  }
  /**
   * @param {number} number
   * @param {number} opt_attributes
   * @param {boolean} forceSign
   * @return {?}
   */
  function leftZeroFill(number, opt_attributes, forceSign) {
    /** @type {string} */
    var n = "" + Math.abs(number);
    /** @type {boolean} */
    var sign = number >= 0;
    for (;n.length < opt_attributes;) {
      /** @type {string} */
      n = "0" + n;
    }
    return(sign ? forceSign ? "+" : "" : "-") + n;
  }
  /**
   * @param {string} row
   * @param {string} start
   * @return {?}
   */
  function init(row, start) {
    var d = {
      milliseconds : 0,
      months : 0
    };
    return d.months = start.month() - row.month() + 12 * (start.year() - row.year()), row.clone().add(d.months, "M").isAfter(start) && --d.months, d.milliseconds = +start - +row.clone().add(d.months, "M"), d;
  }
  /**
   * @param {string} data
   * @param {Text} i
   * @return {?}
   */
  function addNode(data, i) {
    var d;
    return i = makeAs(i, data), data.isBefore(i) ? d = init(data, i) : (d = init(i, data), d.milliseconds = -d.milliseconds, d.months = -d.months), d;
  }
  /**
   * @param {number} deepDataAndEvents
   * @param {string} options
   * @return {?}
   */
  function update(deepDataAndEvents, options) {
    return function(exports, ar) {
      var dur;
      var otherModuleExports;
      return null === ar || (isNaN(+ar) || (done(options, "moment()." + options + "(period, number) is deprecated. Please use moment()." + options + "(number, period)."), otherModuleExports = exports, exports = ar, ar = otherModuleExports)), exports = "string" == typeof exports ? +exports : exports, dur = moment.duration(exports, ar), addOrSubtractDurationFromMoment(this, dur, deepDataAndEvents), this;
    };
  }
  /**
   * @param {string} mom
   * @param {?} duration
   * @param {?} deepDataAndEvents
   * @param {boolean} count
   * @return {undefined}
   */
  function addOrSubtractDurationFromMoment(mom, duration, deepDataAndEvents, count) {
    var milliseconds = duration._milliseconds;
    var days = duration._days;
    var months = duration._months;
    count = null == count ? true : count;
    if (milliseconds) {
      mom._d.setTime(+mom._d + milliseconds * deepDataAndEvents);
    }
    if (days) {
      set(mom, "Date", get(mom, "Date") + days * deepDataAndEvents);
    }
    if (months) {
      fn(mom, get(mom, "Month") + months * deepDataAndEvents);
    }
    if (count) {
      moment.updateOffset(mom, days || months);
    }
  }
  /**
   * @param {string} input
   * @return {?}
   */
  function isArray(input) {
    return "[object Array]" === Object.prototype.toString.call(input);
  }
  /**
   * @param {?} d
   * @return {?}
   */
  function isDate(d) {
    return "[object Date]" === Object.prototype.toString.call(d) || d instanceof Date;
  }
  /**
   * @param {Array} array1
   * @param {Array} array2
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  function compareArrays(array1, array2, dataAndEvents) {
    var i;
    /** @type {number} */
    var l = Math.min(array1.length, array2.length);
    /** @type {number} */
    var arr = Math.abs(array1.length - array2.length);
    /** @type {number} */
    var inner = 0;
    /** @type {number} */
    i = 0;
    for (;l > i;i++) {
      if (dataAndEvents && array1[i] !== array2[i] || !dataAndEvents && toInt(array1[i]) !== toInt(array2[i])) {
        inner++;
      }
    }
    return inner + arr;
  }
  /**
   * @param {string} units
   * @return {?}
   */
  function normalizeUnits(units) {
    if (units) {
      var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
      units = unitAliases[units] || (camelFunctions[lowered] || lowered);
    }
    return units;
  }
  /**
   * @param {Object} obj
   * @return {?}
   */
  function normalizeObjectUnits(obj) {
    var j;
    var i;
    var o = {};
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        j = normalizeUnits(i);
        if (j) {
          o[j] = obj[i];
        }
      }
    }
    return o;
  }
  /**
   * @param {string} field
   * @return {undefined}
   */
  function makeList(field) {
    var pivotElem;
    var objId;
    if (0 === field.indexOf("week")) {
      /** @type {number} */
      pivotElem = 7;
      /** @type {string} */
      objId = "day";
    } else {
      if (0 !== field.indexOf("month")) {
        return;
      }
      /** @type {number} */
      pivotElem = 12;
      /** @type {string} */
      objId = "month";
    }
    /**
     * @param {Object} parent
     * @param {Object} node
     * @return {?}
     */
    moment[field] = function(parent, node) {
      var elem;
      var getter;
      var method = moment._locale[field];
      /** @type {Array} */
      var nodes = [];
      if ("number" == typeof parent && (node = parent, parent = name), getter = function(recurring) {
        var el = moment().utc().set(objId, recurring);
        return method.call(moment._locale, el, parent || "");
      }, null != node) {
        return getter(node);
      }
      /** @type {number} */
      elem = 0;
      for (;pivotElem > elem;elem++) {
        nodes.push(getter(elem));
      }
      return nodes;
    };
  }
  /**
   * @param {(number|string)} obj
   * @return {?}
   */
  function toInt(obj) {
    /** @type {number} */
    var num = +obj;
    /** @type {number} */
    var c = 0;
    return 0 !== num && (isFinite(num) && (c = num >= 0 ? Math.floor(num) : Math.ceil(num))), c;
  }
  /**
   * @param {?} year
   * @param {number} month
   * @return {?}
   */
  function daysInMonth(year, month) {
    return(new Date(Date.UTC(year, month + 1, 0))).getUTCDate();
  }
  /**
   * @param {?} type
   * @param {number} deepDataAndEvents
   * @param {number} opt_attributes
   * @return {?}
   */
  function createDom(type, deepDataAndEvents, opt_attributes) {
    return weekOfYear(moment([type, 11, 31 + deepDataAndEvents - opt_attributes]), deepDataAndEvents, opt_attributes).week;
  }
  /**
   * @param {number} year
   * @return {?}
   */
  function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }
  /**
   * @param {number} year
   * @return {?}
   */
  function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  /**
   * @param {number} m
   * @return {undefined}
   */
  function checkOverflow(m) {
    var overflow;
    if (m._a) {
      if (-2 === m._pf.overflow) {
        /** @type {number} */
        overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
        if (m._pf._overflowDayOfYear) {
          if (YEAR > overflow || overflow > DATE) {
            /** @type {number} */
            overflow = DATE;
          }
        }
        /** @type {number} */
        m._pf.overflow = overflow;
      }
    }
  }
  /**
   * @param {?} m
   * @return {?}
   */
  function isValid(m) {
    return null == m._isValid && (m._isValid = !isNaN(m._d.getTime()) && (m._pf.overflow < 0 && (!m._pf.empty && (!m._pf.invalidMonth && (!m._pf.nullInput && (!m._pf.invalidFormat && !m._pf.userInvalidated))))), m._strict && (m._isValid = m._isValid && (0 === m._pf.charsLeftOver && 0 === m._pf.unusedTokens.length))), m._isValid;
  }
  /**
   * @param {Object} key
   * @return {?}
   */
  function normalizeLanguage(key) {
    return key ? key.toLowerCase().replace("_", "-") : key;
  }
  /**
   * @param {Array} key
   * @return {?}
   */
  function getLangDefinition(key) {
    var j;
    var next;
    var v;
    var split;
    /** @type {number} */
    var i = 0;
    for (;i < key.length;) {
      split = normalizeLanguage(key[i]).split("-");
      j = split.length;
      next = normalizeLanguage(key[i + 1]);
      next = next ? next.split("-") : null;
      for (;j > 0;) {
        if (v = walk(split.slice(0, j).join("-"))) {
          return v;
        }
        if (next && (next.length >= j && compareArrays(split, next, true) >= j - 1)) {
          break;
        }
        j--;
      }
      i++;
    }
    return null;
  }
  /**
   * @param {string} key
   * @return {?}
   */
  function walk(key) {
    /** @type {null} */
    var camelKey = null;
    if (!languages[key] && Gb) {
      try {
        camelKey = moment.locale();
        require("./locale/" + key);
        moment.locale(camelKey);
      } catch (c) {
      }
    }
    return languages[key];
  }
  /**
   * @param {string} input
   * @param {string} model
   * @return {?}
   */
  function makeAs(input, model) {
    return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
  }
  /**
   * @param {string} line
   * @return {?}
   */
  function func(line) {
    return line.match(/\[[\s\S]/) ? line.replace(/^\[|\]$/g, "") : line.replace(/\\/g, "");
  }
  /**
   * @param {string} format
   * @return {?}
   */
  function makeFormatFunction(format) {
    var i;
    var _len;
    var array = format.match(formattingTokens);
    /** @type {number} */
    i = 0;
    _len = array.length;
    for (;_len > i;i++) {
      array[i] = formatTokenFunctions[array[i]] ? formatTokenFunctions[array[i]] : func(array[i]);
    }
    return function(checkSet) {
      /** @type {string} */
      var output = "";
      /** @type {number} */
      i = 0;
      for (;_len > i;i++) {
        output += array[i] instanceof Function ? array[i].call(checkSet, format) : array[i];
      }
      return output;
    };
  }
  /**
   * @param {?} m
   * @param {string} format
   * @return {?}
   */
  function formatMoment(m, format) {
    return m.isValid() ? (format = expandFormat(format, m.localeData()), formatFunctions[format] || (formatFunctions[format] = makeFormatFunction(format)), formatFunctions[format](m)) : m.localeData().invalidDate();
  }
  /**
   * @param {string} format
   * @param {?} lang
   * @return {?}
   */
  function expandFormat(format, lang) {
    /**
     * @param {string} input
     * @return {?}
     */
    function replaceLongDateFormatTokens(input) {
      return lang.longDateFormat(input) || input;
    }
    /** @type {number} */
    var i = 5;
    /** @type {number} */
    localFormattingTokens.lastIndex = 0;
    for (;i >= 0 && localFormattingTokens.test(format);) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
      /** @type {number} */
      localFormattingTokens.lastIndex = 0;
      i -= 1;
    }
    return format;
  }
  /**
   * @param {string} token
   * @param {number} config
   * @return {?}
   */
  function getParseRegexForToken(token, config) {
    var reValidator;
    var strict = config._strict;
    switch(token) {
      case "Q":
        return parseTokenTimestampMs;
      case "DDDD":
        return parseTokenFourDigits;
      case "YYYY":
      ;
      case "GGGG":
      ;
      case "gggg":
        return strict ? parseTokenTwoDigits : parseTokenOneToSixDigits;
      case "Y":
      ;
      case "G":
      ;
      case "g":
        return parseTokenOneToThreeDigits;
      case "YYYYYY":
      ;
      case "YYYYY":
      ;
      case "GGGGG":
      ;
      case "ggggg":
        return strict ? parseTokenOneDigit : parseTokenOneToFourDigits;
      case "S":
        if (strict) {
          return parseTokenTimestampMs;
        }
      ;
      case "SS":
        if (strict) {
          return parseTokenThreeDigits;
        }
      ;
      case "SSS":
        if (strict) {
          return parseTokenFourDigits;
        }
      ;
      case "DDD":
        return parseTokenSixDigits;
      case "MMM":
      ;
      case "MMMM":
      ;
      case "dd":
      ;
      case "ddd":
      ;
      case "dddd":
        return rchecked;
      case "a":
      ;
      case "A":
        return config._locale._meridiemParse;
      case "X":
        return parseTokenWord;
      case "Z":
      ;
      case "ZZ":
        return parseTokenTimezone;
      case "T":
        return parseTokenT;
      case "SSSS":
        return parseTokenDigits;
      case "MM":
      ;
      case "DD":
      ;
      case "YY":
      ;
      case "GG":
      ;
      case "gg":
      ;
      case "HH":
      ;
      case "hh":
      ;
      case "mm":
      ;
      case "ss":
      ;
      case "ww":
      ;
      case "WW":
        return strict ? parseTokenThreeDigits : parseTokenOneOrTwoDigits;
      case "M":
      ;
      case "D":
      ;
      case "d":
      ;
      case "H":
      ;
      case "h":
      ;
      case "m":
      ;
      case "s":
      ;
      case "w":
      ;
      case "W":
      ;
      case "e":
      ;
      case "E":
        return parseTokenOneOrTwoDigits;
      case "Do":
        return a;
      default:
        return reValidator = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
    }
  }
  /**
   * @param {string} string
   * @return {?}
   */
  function timezoneMinutesFromString(string) {
    string = string || "";
    var codeSegments = string.match(parseTokenTimezone) || [];
    var tzchunk = codeSegments[codeSegments.length - 1] || [];
    /** @type {Array} */
    var parts = (tzchunk + "").match(parseTimezoneChunker) || ["-", 0, 0];
    var e = +(60 * parts[1]) + toInt(parts[2]);
    return "+" === parts[0] ? -e : e;
  }
  /**
   * @param {string} token
   * @param {string} input
   * @param {?} config
   * @return {undefined}
   */
  function addTimeToArrayFromToken(token, input, config) {
    var a;
    var datePartArray = config._a;
    switch(token) {
      case "Q":
        if (null != input) {
          /** @type {number} */
          datePartArray[MONTH] = 3 * (toInt(input) - 1);
        }
        break;
      case "M":
      ;
      case "MM":
        if (null != input) {
          /** @type {number} */
          datePartArray[MONTH] = toInt(input) - 1;
        }
        break;
      case "MMM":
      ;
      case "MMMM":
        a = config._locale.monthsParse(input);
        if (null != a) {
          datePartArray[MONTH] = a;
        } else {
          /** @type {string} */
          config._pf.invalidMonth = input;
        }
        break;
      case "D":
      ;
      case "DD":
        if (null != input) {
          datePartArray[DATE] = toInt(input);
        }
        break;
      case "Do":
        if (null != input) {
          datePartArray[DATE] = toInt(parseInt(input, 10));
        }
        break;
      case "DDD":
      ;
      case "DDDD":
        if (null != input) {
          config._dayOfYear = toInt(input);
        }
        break;
      case "YY":
        datePartArray[YEAR] = moment.parseTwoDigitYear(input);
        break;
      case "YYYY":
      ;
      case "YYYYY":
      ;
      case "YYYYYY":
        datePartArray[YEAR] = toInt(input);
        break;
      case "a":
      ;
      case "A":
        config._isPm = config._locale.isPM(input);
        break;
      case "H":
      ;
      case "HH":
      ;
      case "h":
      ;
      case "hh":
        datePartArray[HOUR] = toInt(input);
        break;
      case "m":
      ;
      case "mm":
        datePartArray[SECOND] = toInt(input);
        break;
      case "s":
      ;
      case "ss":
        datePartArray[MINUTE] = toInt(input);
        break;
      case "S":
      ;
      case "SS":
      ;
      case "SSS":
      ;
      case "SSSS":
        datePartArray[MILLISECOND] = toInt(1E3 * ("0." + input));
        break;
      case "X":
        /** @type {Date} */
        config._d = new Date(1E3 * parseFloat(input));
        break;
      case "Z":
      ;
      case "ZZ":
        /** @type {boolean} */
        config._useUTC = true;
        config._tzm = timezoneMinutesFromString(input);
        break;
      case "dd":
      ;
      case "ddd":
      ;
      case "dddd":
        a = config._locale.weekdaysParse(input);
        if (null != a) {
          config._w = config._w || {};
          config._w.d = a;
        } else {
          /** @type {string} */
          config._pf.invalidWeekday = input;
        }
        break;
      case "w":
      ;
      case "ww":
      ;
      case "W":
      ;
      case "WW":
      ;
      case "d":
      ;
      case "e":
      ;
      case "E":
        token = token.substr(0, 1);
      case "gggg":
      ;
      case "GGGG":
      ;
      case "GGGGG":
        token = token.substr(0, 2);
        if (input) {
          config._w = config._w || {};
          config._w[token] = toInt(input);
        }
        break;
      case "gg":
      ;
      case "GG":
        config._w = config._w || {};
        config._w[token] = moment.parseTwoDigitYear(input);
    }
  }
  /**
   * @param {?} config
   * @return {undefined}
   */
  function dateFromConfig(config) {
    var w;
    var value;
    var week;
    var y;
    var x;
    var attributes;
    var temp;
    w = config._w;
    if (null != w.GG || (null != w.W || null != w.E)) {
      /** @type {number} */
      x = 1;
      /** @type {number} */
      attributes = 4;
      value = fixYear(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
      week = fixYear(w.W, 1);
      y = fixYear(w.E, 1);
    } else {
      x = config._locale._week.dow;
      attributes = config._locale._week.doy;
      value = fixYear(w.gg, config._a[YEAR], weekOfYear(moment(), x, attributes).year);
      week = fixYear(w.w, 1);
      if (null != w.d) {
        y = w.d;
        if (x > y) {
          ++week;
        }
      } else {
        y = null != w.e ? w.e + x : x;
      }
    }
    temp = dayOfYearFromWeeks(value, week, y, attributes, x);
    config._a[YEAR] = temp.year;
    config._dayOfYear = temp.dayOfYear;
  }
  /**
   * @param {?} config
   * @return {undefined}
   */
  function dateFromArray(config) {
    var i;
    var date;
    var currentDate;
    var yearToUse;
    /** @type {Array} */
    var input = [];
    if (!config._d) {
      currentDate = currentDateArray(config);
      if (config._w) {
        if (null == config._a[DATE]) {
          if (null == config._a[MONTH]) {
            dateFromConfig(config);
          }
        }
      }
      if (config._dayOfYear) {
        yearToUse = fixYear(config._a[YEAR], currentDate[YEAR]);
        if (config._dayOfYear > daysInYear(yearToUse)) {
          /** @type {boolean} */
          config._pf._overflowDayOfYear = true;
        }
        date = makeUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
      }
      /** @type {number} */
      i = 0;
      for (;3 > i && null == config._a[i];++i) {
        config._a[i] = input[i] = currentDate[i];
      }
      for (;7 > i;i++) {
        config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
      }
      config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
      if (null != config._tzm) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
      }
    }
  }
  /**
   * @param {number} config
   * @return {undefined}
   */
  function dateFromObject(config) {
    var normalizedInput;
    if (!config._d) {
      normalizedInput = normalizeObjectUnits(config._i);
      /** @type {Array} */
      config._a = [normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond];
      dateFromArray(config);
    }
  }
  /**
   * @param {?} config
   * @return {?}
   */
  function currentDateArray(config) {
    /** @type {Date} */
    var today = new Date;
    return config._useUTC ? [today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()] : [today.getFullYear(), today.getMonth(), today.getDate()];
  }
  /**
   * @param {number} config
   * @return {?}
   */
  function makeDateFromStringAndFormat(config) {
    if (config._f === moment.ISO_8601) {
      return void makeDateFromString(config);
    }
    /** @type {Array} */
    config._a = [];
    /** @type {boolean} */
    config._pf.empty = true;
    var i;
    var parsedInput;
    var codeSegments;
    var token;
    var combinator;
    /** @type {string} */
    var string = "" + config._i;
    /** @type {number} */
    var stringLength = string.length;
    /** @type {number} */
    var totalParsedInputLength = 0;
    codeSegments = expandFormat(config._f, config._locale).match(formattingTokens) || [];
    /** @type {number} */
    i = 0;
    for (;i < codeSegments.length;i++) {
      token = codeSegments[i];
      parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
      if (parsedInput) {
        /** @type {string} */
        combinator = string.substr(0, string.indexOf(parsedInput));
        if (combinator.length > 0) {
          config._pf.unusedInput.push(combinator);
        }
        /** @type {string} */
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
        totalParsedInputLength += parsedInput.length;
      }
      if (formatTokenFunctions[token]) {
        if (parsedInput) {
          /** @type {boolean} */
          config._pf.empty = false;
        } else {
          config._pf.unusedTokens.push(token);
        }
        addTimeToArrayFromToken(token, parsedInput, config);
      } else {
        if (config._strict) {
          if (!parsedInput) {
            config._pf.unusedTokens.push(token);
          }
        }
      }
    }
    /** @type {number} */
    config._pf.charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
      config._pf.unusedInput.push(string);
    }
    if (config._isPm) {
      if (config._a[HOUR] < 12) {
        config._a[HOUR] += 12;
      }
    }
    if (config._isPm === false) {
      if (12 === config._a[HOUR]) {
        /** @type {number} */
        config._a[HOUR] = 0;
      }
    }
    dateFromArray(config);
    checkOverflow(config);
  }
  /**
   * @param {string} s
   * @return {?}
   */
  function unescapeFormat(s) {
    return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(dataAndEvents, error, e, err, err2) {
      return error || (e || (err || err2));
    });
  }
  /**
   * @param {string} s
   * @return {?}
   */
  function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  /**
   * @param {Object} config
   * @return {?}
   */
  function makeDateFromStringAndArray(config) {
    var tempConfig;
    var bestMoment;
    var scoreToBeat;
    var i;
    var currentScore;
    if (0 === config._f.length) {
      return config._pf.invalidFormat = true, void(config._d = new Date(0 / 0));
    }
    /** @type {number} */
    i = 0;
    for (;i < config._f.length;i++) {
      /** @type {number} */
      currentScore = 0;
      tempConfig = sendMessage({}, config);
      tempConfig._pf = validateTransport();
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      if (isValid(tempConfig)) {
        currentScore += tempConfig._pf.charsLeftOver;
        currentScore += 10 * tempConfig._pf.unusedTokens.length;
        tempConfig._pf.score = currentScore;
        if (null == scoreToBeat || scoreToBeat > currentScore) {
          scoreToBeat = currentScore;
          bestMoment = tempConfig;
        }
      }
    }
    extend(config, bestMoment || tempConfig);
  }
  /**
   * @param {number} config
   * @return {undefined}
   */
  function makeDateFromString(config) {
    var i;
    var len;
    var string = config._i;
    /** @type {(Array.<string>|null)} */
    var ast = spaceRe.exec(string);
    if (ast) {
      /** @type {boolean} */
      config._pf.iso = true;
      /** @type {number} */
      i = 0;
      /** @type {number} */
      len = codeSegments.length;
      for (;len > i;i++) {
        if (codeSegments[i][1].exec(string)) {
          config._f = codeSegments[i][0] + (ast[6] || " ");
          break;
        }
      }
      /** @type {number} */
      i = 0;
      /** @type {number} */
      len = rawParams.length;
      for (;len > i;i++) {
        if (rawParams[i][1].exec(string)) {
          config._f += rawParams[i][0];
          break;
        }
      }
      if (string.match(parseTokenTimezone)) {
        config._f += "Z";
      }
      makeDateFromStringAndFormat(config);
    } else {
      /** @type {boolean} */
      config._isValid = false;
    }
  }
  /**
   * @param {number} config
   * @return {undefined}
   */
  function prepareSandboxFromConfig(config) {
    makeDateFromString(config);
    if (config._isValid === false) {
      delete config._isValid;
      moment.createFromInputFallback(config);
    }
  }
  /**
   * @param {number} config
   * @return {undefined}
   */
  function makeDateFromInput(config) {
    var urlConfigCheckboxes;
    var input = config._i;
    if (input === name) {
      /** @type {Date} */
      config._d = new Date;
    } else {
      if (isDate(input)) {
        /** @type {Date} */
        config._d = new Date(+input);
      } else {
        if (null !== (urlConfigCheckboxes = aspNetJsonRegex.exec(input))) {
          /** @type {Date} */
          config._d = new Date(+urlConfigCheckboxes[1]);
        } else {
          if ("string" == typeof input) {
            prepareSandboxFromConfig(config);
          } else {
            if (isArray(input)) {
              config._a = input.slice(0);
              dateFromArray(config);
            } else {
              if ("object" == typeof input) {
                dateFromObject(config);
              } else {
                if ("number" == typeof input) {
                  /** @type {Date} */
                  config._d = new Date(input);
                } else {
                  moment.createFromInputFallback(config);
                }
              }
            }
          }
        }
      }
    }
  }
  /**
   * @param {number} y
   * @param {number} m
   * @param {number} day
   * @param {number} h
   * @param {number} M
   * @param {number} s
   * @param {number} ms
   * @return {?}
   */
  function makeDate(y, m, day, h, M, s, ms) {
    /** @type {Date} */
    var date = new Date(y, m, day, h, M, s, ms);
    return 1970 > y && date.setFullYear(y), date;
  }
  /**
   * @param {number} y
   * @return {?}
   */
  function makeUTCDate(y) {
    /** @type {Date} */
    var date = new Date(Date.UTC.apply(null, arguments));
    return 1970 > y && date.setUTCFullYear(y), date;
  }
  /**
   * @param {(number|string)} input
   * @param {?} language
   * @return {?}
   */
  function parseWeekday(input, language) {
    if ("string" == typeof input) {
      if (isNaN(input)) {
        if (input = language.weekdaysParse(input), "number" != typeof input) {
          return null;
        }
      } else {
        /** @type {number} */
        input = parseInt(input, 10);
      }
    }
    return input;
  }
  /**
   * @param {?} string
   * @param {number} number
   * @param {?} withoutSuffix
   * @param {?} isFuture
   * @param {?} lang
   * @return {?}
   */
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
    return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  /**
   * @param {Object} exports
   * @param {boolean} m13
   * @param {?} m22
   * @return {?}
   */
  function preset(exports, m13, m22) {
    var assert = moment.duration(exports).abs();
    /** @type {number} */
    var seconds = parseInt(assert.as("s"));
    /** @type {number} */
    var minutes = parseInt(assert.as("m"));
    /** @type {number} */
    var hours = parseInt(assert.as("h"));
    /** @type {number} */
    var i = parseInt(assert.as("d"));
    /** @type {number} */
    var idx = parseInt(assert.as("M"));
    /** @type {number} */
    var charCodeToReplace = parseInt(assert.as("y"));
    /** @type {Array} */
    var a = seconds < data.s && ["s", seconds] || (1 === minutes && ["m"] || (minutes < data.m && ["mm", minutes] || (1 === hours && ["h"] || (hours < data.h && ["hh", hours] || (1 === i && ["d"] || (i < data.d && ["dd", i] || (1 === idx && ["M"] || (idx < data.M && ["MM", idx] || (1 === charCodeToReplace && ["y"] || ["yy", charCodeToReplace])))))))));
    return a[2] = m13, a[3] = +exports > 0, a[4] = m22, substituteTimeAgo.apply({}, a);
  }
  /**
   * @param {Object} mom
   * @param {number} deepDataAndEvents
   * @param {number} opt_attributes
   * @return {?}
   */
  function weekOfYear(mom, deepDataAndEvents, opt_attributes) {
    var t;
    /** @type {number} */
    var e = opt_attributes - deepDataAndEvents;
    /** @type {number} */
    var QUnit = opt_attributes - mom.day();
    return QUnit > e && (QUnit -= 7), e - 7 > QUnit && (QUnit += 7), t = moment(mom).add(QUnit, "d"), {
      week : Math.ceil(t.dayOfYear() / 7),
      year : t.year()
    };
  }
  /**
   * @param {number} year
   * @param {number} week
   * @param {number} cy
   * @param {?} opt_attributes
   * @param {?} a
   * @return {?}
   */
  function dayOfYearFromWeeks(year, week, cy, opt_attributes, a) {
    var f;
    var dayOfYear;
    var b = makeUTCDate(year, 0, 1).getUTCDay();
    return b = 0 === b ? 7 : b, cy = null != cy ? cy : a, f = a - b + (b > opt_attributes ? 7 : 0) - (a > b ? 7 : 0), dayOfYear = 7 * (week - 1) + (cy - a) + f + 1, {
      year : dayOfYear > 0 ? year : year - 1,
      dayOfYear : dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
    };
  }
  /**
   * @param {number} config
   * @return {?}
   */
  function makeMoment(config) {
    var input = config._i;
    var format = config._f;
    return config._locale = config._locale || moment.localeData(config._l), null === input || format === name && "" === input ? moment.invalid({
      nullInput : true
    }) : ("string" == typeof input && (config._i = input = config._locale.preparse(input)), moment.isMoment(input) ? new Moment(input, true) : (format ? isArray(format) ? makeDateFromStringAndArray(config) : makeDateFromStringAndFormat(config) : makeDateFromInput(config), new Moment(config)));
  }
  /**
   * @param {string} name
   * @param {Array} val
   * @return {?}
   */
  function reduce(name, val) {
    var x;
    var j;
    if (1 === val.length && (isArray(val[0]) && (val = val[0])), !val.length) {
      return moment();
    }
    x = val[0];
    /** @type {number} */
    j = 1;
    for (;j < val.length;++j) {
      if (val[j][name](x)) {
        x = val[j];
      }
    }
    return x;
  }
  /**
   * @param {string} m
   * @param {number} value
   * @return {?}
   */
  function fn(m, value) {
    var r20;
    return "string" == typeof value && (value = m.localeData().monthsParse(value), "number" != typeof value) ? m : (r20 = Math.min(m.date(), daysInMonth(m.year(), value)), m._d["set" + (m._isUTC ? "UTC" : "") + "Month"](value, r20), m);
  }
  /**
   * @param {string} input
   * @param {string} name
   * @return {?}
   */
  function get(input, name) {
    return input._d["get" + (input._isUTC ? "UTC" : "") + name]();
  }
  /**
   * @param {string} m
   * @param {string} name
   * @param {number} key
   * @return {?}
   */
  function set(m, name, key) {
    return "Month" === name ? fn(m, key) : m._d["set" + (m._isUTC ? "UTC" : "") + name](key);
  }
  /**
   * @param {string} name
   * @param {boolean} recurring
   * @return {?}
   */
  function setTick(name, recurring) {
    return function(part) {
      return null != part ? (set(this, name, part), moment.updateOffset(this, recurring), this) : get(this, name);
    };
  }
  /**
   * @param {number} str
   * @return {?}
   */
  function isNumeric(str) {
    return 400 * str / 146097;
  }
  /**
   * @param {number} a
   * @return {?}
   */
  function array_to_hash(a) {
    return 146097 * a / 400;
  }
  /**
   * @param {string} name
   * @return {undefined}
   */
  function makeDurationGetter(name) {
    /**
     * @return {?}
     */
    moment.duration.fn[name] = function() {
      return this._data[name];
    };
  }
  /**
   * @param {boolean} dataAndEvents
   * @return {undefined}
   */
  function clone(dataAndEvents) {
    if ("undefined" == typeof ender) {
      previous_async = root.moment;
      root.moment = dataAndEvents ? timeout("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.", moment) : moment;
    }
  }
  var moment;
  var previous_async;
  var i;
  /** @type {string} */
  var VERSION = "2.8.1";
  var root = "undefined" != typeof global ? global : this;
  /** @type {function (*): number} */
  var parseInt = Math.round;
  /** @type {number} */
  var YEAR = 0;
  /** @type {number} */
  var MONTH = 1;
  /** @type {number} */
  var DATE = 2;
  /** @type {number} */
  var HOUR = 3;
  /** @type {number} */
  var SECOND = 4;
  /** @type {number} */
  var MINUTE = 5;
  /** @type {number} */
  var MILLISECOND = 6;
  var languages = {};
  /** @type {Array} */
  var map = [];
  var Gb = "undefined" != typeof module && module.exports;
  /** @type {RegExp} */
  var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
  /** @type {RegExp} */
  var handlers = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;
  /** @type {RegExp} */
  var rgb = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
  /** @type {RegExp} */
  var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g;
  /** @type {RegExp} */
  var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g;
  /** @type {RegExp} */
  var parseTokenOneOrTwoDigits = /\d\d?/;
  /** @type {RegExp} */
  var parseTokenSixDigits = /\d{1,3}/;
  /** @type {RegExp} */
  var parseTokenOneToSixDigits = /\d{1,4}/;
  /** @type {RegExp} */
  var parseTokenOneToFourDigits = /[+\-]?\d{1,6}/;
  /** @type {RegExp} */
  var parseTokenDigits = /\d+/;
  /** @type {RegExp} */
  var rchecked = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
  /** @type {RegExp} */
  var parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi;
  /** @type {RegExp} */
  var parseTokenT = /T/i;
  /** @type {RegExp} */
  var parseTokenWord = /[\+\-]?\d+(\.\d{1,3})?/;
  /** @type {RegExp} */
  var a = /\d{1,2}/;
  /** @type {RegExp} */
  var parseTokenTimestampMs = /\d/;
  /** @type {RegExp} */
  var parseTokenThreeDigits = /\d\d/;
  /** @type {RegExp} */
  var parseTokenFourDigits = /\d{3}/;
  /** @type {RegExp} */
  var parseTokenTwoDigits = /\d{4}/;
  /** @type {RegExp} */
  var parseTokenOneDigit = /[+-]?\d{6}/;
  /** @type {RegExp} */
  var parseTokenOneToThreeDigits = /[+-]?\d+/;
  /** @type {RegExp} */
  var spaceRe = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
  /** @type {string} */
  var isoFormat = "YYYY-MM-DDTHH:mm:ssZ";
  /** @type {Array} */
  var codeSegments = [["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/], ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/], ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/], ["GGGG-[W]WW", /\d{4}-W\d{2}/], ["YYYY-DDD", /\d{4}-\d{3}/]];
  /** @type {Array} */
  var rawParams = [["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]];
  /** @type {RegExp} */
  var parseTimezoneChunker = /([\+\-]|\d\d)/gi;
  var j = ("Date|Hours|Minutes|Seconds|Milliseconds".split("|"), {
    Milliseconds : 1,
    Seconds : 1E3,
    Minutes : 6E4,
    Hours : 36E5,
    Days : 864E5,
    Months : 2592E6,
    Years : 31536E6
  });
  var unitAliases = {
    ms : "millisecond",
    s : "second",
    m : "minute",
    h : "hour",
    d : "day",
    D : "date",
    w : "week",
    W : "isoWeek",
    M : "month",
    Q : "quarter",
    y : "year",
    DDD : "dayOfYear",
    e : "weekday",
    E : "isoWeekday",
    gg : "weekYear",
    GG : "isoWeekYear"
  };
  var camelFunctions = {
    dayofyear : "dayOfYear",
    isoweekday : "isoWeekday",
    isoweek : "isoWeek",
    weekyear : "weekYear",
    isoweekyear : "isoWeekYear"
  };
  var formatFunctions = {};
  var data = {
    s : 45,
    m : 45,
    h : 22,
    d : 26,
    M : 11
  };
  /** @type {Array.<string>} */
  var braceStack = "DDD w W M D d".split(" ");
  /** @type {Array.<string>} */
  var eventPath = "M D H h m s w W".split(" ");
  var formatTokenFunctions = {
    /**
     * @return {?}
     */
    M : function() {
      return this.month() + 1;
    },
    /**
     * @param {?} format
     * @return {?}
     */
    MMM : function(format) {
      return this.localeData().monthsShort(this, format);
    },
    /**
     * @param {?} format
     * @return {?}
     */
    MMMM : function(format) {
      return this.localeData().months(this, format);
    },
    /**
     * @return {?}
     */
    D : function() {
      return this.date();
    },
    /**
     * @return {?}
     */
    DDD : function() {
      return this.dayOfYear();
    },
    /**
     * @return {?}
     */
    d : function() {
      return this.day();
    },
    /**
     * @param {?} format
     * @return {?}
     */
    dd : function(format) {
      return this.localeData().weekdaysMin(this, format);
    },
    /**
     * @param {?} format
     * @return {?}
     */
    ddd : function(format) {
      return this.localeData().weekdaysShort(this, format);
    },
    /**
     * @param {?} format
     * @return {?}
     */
    dddd : function(format) {
      return this.localeData().weekdays(this, format);
    },
    /**
     * @return {?}
     */
    w : function() {
      return this.week();
    },
    /**
     * @return {?}
     */
    W : function() {
      return this.isoWeek();
    },
    /**
     * @return {?}
     */
    YY : function() {
      return leftZeroFill(this.year() % 100, 2);
    },
    /**
     * @return {?}
     */
    YYYY : function() {
      return leftZeroFill(this.year(), 4);
    },
    /**
     * @return {?}
     */
    YYYYY : function() {
      return leftZeroFill(this.year(), 5);
    },
    /**
     * @return {?}
     */
    YYYYYY : function() {
      var y = this.year();
      /** @type {string} */
      var sign = y >= 0 ? "+" : "-";
      return sign + leftZeroFill(Math.abs(y), 6);
    },
    /**
     * @return {?}
     */
    gg : function() {
      return leftZeroFill(this.weekYear() % 100, 2);
    },
    /**
     * @return {?}
     */
    gggg : function() {
      return leftZeroFill(this.weekYear(), 4);
    },
    /**
     * @return {?}
     */
    ggggg : function() {
      return leftZeroFill(this.weekYear(), 5);
    },
    /**
     * @return {?}
     */
    GG : function() {
      return leftZeroFill(this.isoWeekYear() % 100, 2);
    },
    /**
     * @return {?}
     */
    GGGG : function() {
      return leftZeroFill(this.isoWeekYear(), 4);
    },
    /**
     * @return {?}
     */
    GGGGG : function() {
      return leftZeroFill(this.isoWeekYear(), 5);
    },
    /**
     * @return {?}
     */
    e : function() {
      return this.weekday();
    },
    /**
     * @return {?}
     */
    E : function() {
      return this.isoWeekday();
    },
    /**
     * @return {?}
     */
    a : function() {
      return this.localeData().meridiem(this.hours(), this.minutes(), true);
    },
    /**
     * @return {?}
     */
    A : function() {
      return this.localeData().meridiem(this.hours(), this.minutes(), false);
    },
    /**
     * @return {?}
     */
    H : function() {
      return this.hours();
    },
    /**
     * @return {?}
     */
    h : function() {
      return this.hours() % 12 || 12;
    },
    /**
     * @return {?}
     */
    m : function() {
      return this.minutes();
    },
    /**
     * @return {?}
     */
    s : function() {
      return this.seconds();
    },
    /**
     * @return {?}
     */
    S : function() {
      return toInt(this.milliseconds() / 100);
    },
    /**
     * @return {?}
     */
    SS : function() {
      return leftZeroFill(toInt(this.milliseconds() / 10), 2);
    },
    /**
     * @return {?}
     */
    SSS : function() {
      return leftZeroFill(this.milliseconds(), 3);
    },
    /**
     * @return {?}
     */
    SSSS : function() {
      return leftZeroFill(this.milliseconds(), 3);
    },
    /**
     * @return {?}
     */
    Z : function() {
      /** @type {number} */
      var a = -this.zone();
      /** @type {string} */
      var b = "+";
      return 0 > a && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
    },
    /**
     * @return {?}
     */
    ZZ : function() {
      /** @type {number} */
      var a = -this.zone();
      /** @type {string} */
      var b = "+";
      return 0 > a && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
    },
    /**
     * @return {?}
     */
    z : function() {
      return this.zoneAbbr();
    },
    /**
     * @return {?}
     */
    zz : function() {
      return this.zoneName();
    },
    /**
     * @return {?}
     */
    X : function() {
      return this.unix();
    },
    /**
     * @return {?}
     */
    Q : function() {
      return this.quarter();
    }
  };
  var viewItems = {};
  /** @type {Array} */
  var lists = ["months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin"];
  for (;braceStack.length;) {
    /** @type {string} */
    i = braceStack.pop();
    formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  for (;eventPath.length;) {
    /** @type {string} */
    i = eventPath.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  extend(Language.prototype, {
    /**
     * @param {string} object
     * @return {undefined}
     */
    set : function(object) {
      var val;
      var key;
      for (key in object) {
        val = object[key];
        if ("function" == typeof val) {
          /** @type {Function} */
          this[key] = val;
        } else {
          this["_" + key] = val;
        }
      }
    },
    _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    /**
     * @param {number} m
     * @return {?}
     */
    months : function(m) {
      return this._months[m.month()];
    },
    _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    /**
     * @param {string} m
     * @return {?}
     */
    monthsShort : function(m) {
      return this._monthsShort[m.month()];
    },
    /**
     * @param {(number|string)} monthName
     * @return {?}
     */
    monthsParse : function(monthName) {
      var i;
      var mom;
      var requestUrl;
      if (!this._monthsParse) {
        /** @type {Array} */
        this._monthsParse = [];
      }
      /** @type {number} */
      i = 0;
      for (;12 > i;i++) {
        if (this._monthsParse[i] || (mom = moment.utc([2E3, i]), requestUrl = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, ""), this._monthsParse[i] = new RegExp(requestUrl.replace(".", ""), "i")), this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    /**
     * @param {Object} m
     * @return {?}
     */
    weekdays : function(m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    /**
     * @param {Object} m
     * @return {?}
     */
    weekdaysShort : function(m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    /**
     * @param {Object} m
     * @return {?}
     */
    weekdaysMin : function(m) {
      return this._weekdaysMin[m.day()];
    },
    /**
     * @param {string} weekdayName
     * @return {?}
     */
    weekdaysParse : function(weekdayName) {
      var i;
      var mom;
      var requestUrl;
      if (!this._weekdaysParse) {
        /** @type {Array} */
        this._weekdaysParse = [];
      }
      /** @type {number} */
      i = 0;
      for (;7 > i;i++) {
        if (this._weekdaysParse[i] || (mom = moment([2E3, 1]).day(i), requestUrl = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, ""), this._weekdaysParse[i] = new RegExp(requestUrl.replace(".", ""), "i")), this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat : {
      LT : "h:mm A",
      L : "MM/DD/YYYY",
      LL : "MMMM D, YYYY",
      LLL : "MMMM D, YYYY LT",
      LLLL : "dddd, MMMM D, YYYY LT"
    },
    /**
     * @param {string} key
     * @return {?}
     */
    longDateFormat : function(key) {
      var output = this._longDateFormat[key];
      return!output && (this._longDateFormat[key.toUpperCase()] && (output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(models) {
        return models.slice(1);
      }), this._longDateFormat[key] = output)), output;
    },
    /**
     * @param {(number|string)} input
     * @return {?}
     */
    isPM : function(input) {
      return "p" === (input + "").toLowerCase().charAt(0);
    },
    _meridiemParse : /[ap]\.?m?\.?/i,
    /**
     * @param {number} hour
     * @param {?} isUpper
     * @param {boolean} isLower
     * @return {?}
     */
    meridiem : function(hour, isUpper, isLower) {
      return hour > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
    },
    _calendar : {
      sameDay : "[Today at] LT",
      nextDay : "[Tomorrow at] LT",
      nextWeek : "dddd [at] LT",
      lastDay : "[Yesterday at] LT",
      lastWeek : "[Last] dddd [at] LT",
      sameElse : "L"
    },
    /**
     * @param {string} key
     * @param {?} recurring
     * @return {?}
     */
    calendar : function(key, recurring) {
      var fn = this._calendar[key];
      return "function" == typeof fn ? fn.apply(recurring) : fn;
    },
    _relativeTime : {
      future : "in %s",
      past : "%s ago",
      s : "a few seconds",
      m : "a minute",
      mm : "%d minutes",
      h : "an hour",
      hh : "%d hours",
      d : "a day",
      dd : "%d days",
      M : "a month",
      MM : "%d months",
      y : "a year",
      yy : "%d years"
    },
    /**
     * @param {?} number
     * @param {boolean} withoutSuffix
     * @param {?} string
     * @param {?} isFuture
     * @return {?}
     */
    relativeTime : function(number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return "function" == typeof output ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    },
    /**
     * @param {number} diff
     * @param {?} output
     * @return {?}
     */
    pastFuture : function(diff, output) {
      var format = this._relativeTime[diff > 0 ? "future" : "past"];
      return "function" == typeof format ? format(output) : format.replace(/%s/i, output);
    },
    /**
     * @param {?} number
     * @return {?}
     */
    ordinal : function(number) {
      return this._ordinal.replace("%d", number);
    },
    _ordinal : "%d",
    /**
     * @param {?} string
     * @return {?}
     */
    preparse : function(string) {
      return string;
    },
    /**
     * @param {?} string
     * @return {?}
     */
    postformat : function(string) {
      return string;
    },
    /**
     * @param {Object} mom
     * @return {?}
     */
    week : function(mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week : {
      dow : 0,
      doy : 6
    },
    _invalidDate : "Invalid date",
    /**
     * @return {?}
     */
    invalidDate : function() {
      return this._invalidDate;
    }
  });
  /**
   * @param {string} input
   * @param {?} res
   * @param {(Function|string)} parent
   * @param {(Function|string)} item
   * @return {?}
   */
  moment = function(input, res, parent, item) {
    var config;
    return "boolean" == typeof parent && (item = parent, parent = name), config = {}, config._isAMomentObject = true, config._i = input, config._f = res, config._l = parent, config._strict = item, config._isUTC = false, config._pf = validateTransport(), makeMoment(config);
  };
  /** @type {boolean} */
  moment.suppressDeprecationWarnings = false;
  moment.createFromInputFallback = timeout("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function(config) {
    /** @type {Date} */
    config._d = new Date(config._i);
  });
  /**
   * @return {?}
   */
  moment.min = function() {
    /** @type {Array.<?>} */
    var size = [].slice.call(arguments, 0);
    return reduce("isBefore", size);
  };
  /**
   * @return {?}
   */
  moment.max = function() {
    /** @type {Array.<?>} */
    var size = [].slice.call(arguments, 0);
    return reduce("isAfter", size);
  };
  /**
   * @param {string} date
   * @param {?} format
   * @param {(Function|string)} parent
   * @param {(Function|string)} node
   * @return {?}
   */
  moment.utc = function(date, format, parent, node) {
    var config;
    return "boolean" == typeof parent && (node = parent, parent = name), config = {}, config._isAMomentObject = true, config._useUTC = true, config._isUTC = true, config._l = parent, config._i = date, config._f = format, config._strict = node, config._pf = validateTransport(), makeMoment(config).utc();
  };
  /**
   * @param {number} timestamp
   * @return {?}
   */
  moment.unix = function(timestamp) {
    return moment(1E3 * timestamp);
  };
  /**
   * @param {Object} a
   * @param {string} val
   * @return {?}
   */
  moment.duration = function(a, val) {
    var sign;
    var ret;
    var parseIso;
    var d;
    /** @type {Object} */
    var duration = a;
    /** @type {null} */
    var match = null;
    return moment.isDuration(a) ? duration = {
      ms : a._milliseconds,
      d : a._days,
      M : a._months
    } : "number" == typeof a ? (duration = {}, val ? duration[val] = a : duration.milliseconds = a) : (match = handlers.exec(a)) ? (sign = "-" === match[1] ? -1 : 1, duration = {
      y : 0,
      d : toInt(match[DATE]) * sign,
      h : toInt(match[HOUR]) * sign,
      m : toInt(match[SECOND]) * sign,
      s : toInt(match[MINUTE]) * sign,
      ms : toInt(match[MILLISECOND]) * sign
    }) : (match = rgb.exec(a)) ? (sign = "-" === match[1] ? -1 : 1, parseIso = function(inp) {
      var res = inp && parseFloat(inp.replace(",", "."));
      return(isNaN(res) ? 0 : res) * sign;
    }, duration = {
      y : parseIso(match[2]),
      M : parseIso(match[3]),
      d : parseIso(match[4]),
      h : parseIso(match[5]),
      m : parseIso(match[6]),
      s : parseIso(match[7]),
      w : parseIso(match[8])
    }) : "object" == typeof duration && (("from" in duration || "to" in duration) && (d = addNode(moment(duration.from), moment(duration.to)), duration = {}, duration.ms = d.milliseconds, duration.M = d.months)), ret = new Duration(duration), moment.isDuration(a) && (a.hasOwnProperty("_locale") && (ret._locale = a._locale)), ret;
  };
  /** @type {string} */
  moment.version = VERSION;
  /** @type {string} */
  moment.defaultFormat = isoFormat;
  /**
   * @return {undefined}
   */
  moment.ISO_8601 = function() {
  };
  /** @type {Array} */
  moment.momentProperties = map;
  /**
   * @return {undefined}
   */
  moment.updateOffset = function() {
  };
  /**
   * @param {?} key
   * @param {string} val
   * @return {?}
   */
  moment.relativeTimeThreshold = function(key, val) {
    return data[key] === name ? false : val === name ? data[key] : (data[key] = val, true);
  };
  moment.lang = timeout("moment.lang is deprecated. Use moment.locale instead.", function(storageKey, isXML) {
    return moment.locale(storageKey, isXML);
  });
  /**
   * @param {string} key
   * @param {string} value
   * @return {?}
   */
  moment.locale = function(key, value) {
    var VERSION;
    return key && (VERSION = "undefined" != typeof value ? moment.defineLocale(key, value) : moment.localeData(key), VERSION && (moment.duration._locale = moment._locale = VERSION)), moment._locale._abbr;
  };
  /**
   * @param {string} key
   * @param {string} objId
   * @return {?}
   */
  moment.defineLocale = function(key, objId) {
    return null !== objId ? (objId.abbr = key, languages[key] || (languages[key] = new Language), languages[key].set(objId), moment.locale(key), languages[key]) : (delete languages[key], null);
  };
  moment.langData = timeout("moment.langData is deprecated. Use moment.localeData instead.", function(input) {
    return moment.localeData(input);
  });
  /**
   * @param {string} key
   * @return {?}
   */
  moment.localeData = function(key) {
    var v;
    if (key && (key._locale && (key._locale._abbr && (key = key._locale._abbr))), !key) {
      return moment._locale;
    }
    if (!isArray(key)) {
      if (v = walk(key)) {
        return v;
      }
      /** @type {Array} */
      key = [key];
    }
    return getLangDefinition(key);
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  moment.isMoment = function(obj) {
    return obj instanceof Moment || null != obj && obj.hasOwnProperty("_isAMomentObject");
  };
  /**
   * @param {?} obj
   * @return {?}
   */
  moment.isDuration = function(obj) {
    return obj instanceof Duration;
  };
  /** @type {number} */
  i = lists.length - 1;
  for (;i >= 0;--i) {
    makeList(lists[i]);
  }
  /**
   * @param {string} units
   * @return {?}
   */
  moment.normalizeUnits = function(units) {
    return normalizeUnits(units);
  };
  /**
   * @param {Object} flags
   * @return {?}
   */
  moment.invalid = function(flags) {
    var m = moment.utc(0 / 0);
    return null != flags ? extend(m._pf, flags) : m._pf.userInvalidated = true, m;
  };
  /**
   * @return {?}
   */
  moment.parseZone = function() {
    return moment.apply(null, arguments).parseZone();
  };
  /**
   * @param {string} input
   * @return {?}
   */
  moment.parseTwoDigitYear = function(input) {
    return toInt(input) + (toInt(input) > 68 ? 1900 : 2E3);
  };
  extend(moment.fn = Moment.prototype, {
    /**
     * @return {?}
     */
    clone : function() {
      return moment(this);
    },
    /**
     * @return {?}
     */
    valueOf : function() {
      return+this._d + 6E4 * (this._offset || 0);
    },
    /**
     * @return {?}
     */
    unix : function() {
      return Math.floor(+this / 1E3);
    },
    /**
     * @return {?}
     */
    toString : function() {
      return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    },
    /**
     * @return {?}
     */
    toDate : function() {
      return this._offset ? new Date(+this) : this._d;
    },
    /**
     * @return {?}
     */
    toISOString : function() {
      var m = moment(this).utc();
      return 0 < m.year() && m.year() <= 9999 ? formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
    },
    /**
     * @return {?}
     */
    toArray : function() {
      var m = this;
      return[m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds()];
    },
    /**
     * @return {?}
     */
    isValid : function() {
      return isValid(this);
    },
    /**
     * @return {?}
     */
    isDSTShifted : function() {
      return this._a ? this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0 : false;
    },
    /**
     * @return {?}
     */
    parsingFlags : function() {
      return extend({}, this._pf);
    },
    /**
     * @return {?}
     */
    invalidAt : function() {
      return this._pf.overflow;
    },
    /**
     * @param {Object} isXML
     * @return {?}
     */
    utc : function(isXML) {
      return this.zone(0, isXML);
    },
    /**
     * @param {Object} isXML
     * @return {?}
     */
    local : function(isXML) {
      return this._isUTC && (this.zone(0, isXML), this._isUTC = false, isXML && this.add(this._d.getTimezoneOffset(), "m")), this;
    },
    /**
     * @param {string} inputString
     * @return {?}
     */
    format : function(inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.localeData().postformat(output);
    },
    add : update(1, "add"),
    subtract : update(-1, "subtract"),
    /**
     * @param {string} input
     * @param {string} units
     * @param {boolean} asFloat
     * @return {?}
     */
    diff : function(input, units, asFloat) {
      var diff;
      var output;
      var that = makeAs(input, this);
      /** @type {number} */
      var zoneDiff = 6E4 * (this.zone() - that.zone());
      return units = normalizeUnits(units), "year" === units || "month" === units ? (diff = 432E5 * (this.daysInMonth() + that.daysInMonth()), output = 12 * (this.year() - that.year()) + (this.month() - that.month()), output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff, output -= 6E4 * (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) / diff, "year" === units && (output /= 12)) : (diff = this - 
      that, output = "second" === units ? diff / 1E3 : "minute" === units ? diff / 6E4 : "hour" === units ? diff / 36E5 : "day" === units ? (diff - zoneDiff) / 864E5 : "week" === units ? (diff - zoneDiff) / 6048E5 : diff), asFloat ? output : absRound(output);
    },
    /**
     * @param {number} currency
     * @param {?} withoutSuffix
     * @return {?}
     */
    from : function(currency, withoutSuffix) {
      return moment.duration({
        to : this,
        from : currency
      }).locale(this.locale()).humanize(!withoutSuffix);
    },
    /**
     * @param {?} withoutSuffix
     * @return {?}
     */
    fromNow : function(withoutSuffix) {
      return this.from(moment(), withoutSuffix);
    },
    /**
     * @param {(Object|boolean|number|string)} key
     * @return {?}
     */
    calendar : function(key) {
      var input = key || moment();
      var sod = makeAs(input, this).startOf("day");
      var diff = this.diff(sod, "days", true);
      /** @type {string} */
      var format = -6 > diff ? "sameElse" : -1 > diff ? "lastWeek" : 0 > diff ? "lastDay" : 1 > diff ? "sameDay" : 2 > diff ? "nextDay" : 7 > diff ? "nextWeek" : "sameElse";
      return this.format(this.localeData().calendar(format, this));
    },
    /**
     * @return {?}
     */
    isLeapYear : function() {
      return isLeapYear(this.year());
    },
    /**
     * @return {?}
     */
    isDST : function() {
      return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
    },
    /**
     * @param {number} input
     * @return {?}
     */
    day : function(input) {
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      return null != input ? (input = parseWeekday(input, this.localeData()), this.add(input - day, "d")) : day;
    },
    month : setTick("Month", true),
    /**
     * @param {string} units
     * @return {?}
     */
    startOf : function(units) {
      switch(units = normalizeUnits(units)) {
        case "year":
          this.month(0);
        case "quarter":
        ;
        case "month":
          this.date(1);
        case "week":
        ;
        case "isoWeek":
        ;
        case "day":
          this.hours(0);
        case "hour":
          this.minutes(0);
        case "minute":
          this.seconds(0);
        case "second":
          this.milliseconds(0);
      }
      return "week" === units ? this.weekday(0) : "isoWeek" === units && this.isoWeekday(1), "quarter" === units && this.month(3 * Math.floor(this.month() / 3)), this;
    },
    /**
     * @param {string} units
     * @return {?}
     */
    endOf : function(units) {
      return units = normalizeUnits(units), this.startOf(units).add(1, "isoWeek" === units ? "week" : units).subtract(1, "ms");
    },
    /**
     * @param {string} input
     * @param {number} units
     * @return {?}
     */
    isAfter : function(input, units) {
      return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) > +moment(input).startOf(units);
    },
    /**
     * @param {string} input
     * @param {number} units
     * @return {?}
     */
    isBefore : function(input, units) {
      return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) < +moment(input).startOf(units);
    },
    /**
     * @param {string} input
     * @param {string} units
     * @return {?}
     */
    isSame : function(input, units) {
      return units = units || "ms", +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
    },
    min : timeout("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function(memo) {
      return memo = moment.apply(null, arguments), this > memo ? this : memo;
    }),
    max : timeout("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function(other) {
      return other = moment.apply(null, arguments), other > this ? this : other;
    }),
    /**
     * @param {number} input
     * @param {Object} isXML
     * @return {?}
     */
    zone : function(input, isXML) {
      var reporter;
      var offset = this._offset || 0;
      return null == input ? this._isUTC ? offset : this._d.getTimezoneOffset() : ("string" == typeof input && (input = timezoneMinutesFromString(input)), Math.abs(input) < 16 && (input = 60 * input), !this._isUTC && (isXML && (reporter = this._d.getTimezoneOffset())), this._offset = input, this._isUTC = true, null != reporter && this.subtract(reporter, "m"), offset !== input && (!isXML || this._changeInProgress ? addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, false) : 
      this._changeInProgress || (this._changeInProgress = true, moment.updateOffset(this, true), this._changeInProgress = null)), this);
    },
    /**
     * @return {?}
     */
    zoneAbbr : function() {
      return this._isUTC ? "UTC" : "";
    },
    /**
     * @return {?}
     */
    zoneName : function() {
      return this._isUTC ? "Coordinated Universal Time" : "";
    },
    /**
     * @return {?}
     */
    parseZone : function() {
      return this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i), this;
    },
    /**
     * @param {(Object|string)} input
     * @return {?}
     */
    hasAlignedHourOffset : function(input) {
      return input = input ? moment(input).zone() : 0, (this.zone() - input) % 60 === 0;
    },
    /**
     * @return {?}
     */
    daysInMonth : function() {
      return daysInMonth(this.year(), this.month());
    },
    /**
     * @param {number} d
     * @return {?}
     */
    dayOfYear : function(d) {
      /** @type {number} */
      var b = parseInt((moment(this).startOf("day") - moment(this).startOf("year")) / 864E5) + 1;
      return null == d ? b : this.add(d - b, "d");
    },
    /**
     * @param {number} dataAndEvents
     * @return {?}
     */
    quarter : function(dataAndEvents) {
      return null == dataAndEvents ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (dataAndEvents - 1) + this.month() % 3);
    },
    /**
     * @param {number} max
     * @return {?}
     */
    weekYear : function(max) {
      var min = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
      return null == max ? min : this.add(max - min, "y");
    },
    /**
     * @param {number} max
     * @return {?}
     */
    isoWeekYear : function(max) {
      var min = weekOfYear(this, 1, 4).year;
      return null == max ? min : this.add(max - min, "y");
    },
    /**
     * @param {number} t
     * @return {?}
     */
    week : function(t) {
      var b = this.localeData().week(this);
      return null == t ? b : this.add(7 * (t - b), "d");
    },
    /**
     * @param {number} max
     * @return {?}
     */
    isoWeek : function(max) {
      var min = weekOfYear(this, 1, 4).week;
      return null == max ? min : this.add(7 * (max - min), "d");
    },
    /**
     * @param {number} max
     * @return {?}
     */
    weekday : function(max) {
      /** @type {number} */
      var min = (this.day() + 7 - this.localeData()._week.dow) % 7;
      return null == max ? min : this.add(max - min, "d");
    },
    /**
     * @param {number} dataAndEvents
     * @return {?}
     */
    isoWeekday : function(dataAndEvents) {
      return null == dataAndEvents ? this.day() || 7 : this.day(this.day() % 7 ? dataAndEvents : dataAndEvents - 7);
    },
    /**
     * @return {?}
     */
    isoWeeksInYear : function() {
      return createDom(this.year(), 1, 4);
    },
    /**
     * @return {?}
     */
    weeksInYear : function() {
      var expectation = this.localeData()._week;
      return createDom(this.year(), expectation.dow, expectation.doy);
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return name = normalizeUnits(name), this[name]();
    },
    /**
     * @param {string} callback
     * @param {boolean} recurring
     * @return {?}
     */
    set : function(callback, recurring) {
      return callback = normalizeUnits(callback), "function" == typeof this[callback] && this[callback](recurring), this;
    },
    /**
     * @param {string} key
     * @return {?}
     */
    locale : function(key) {
      return key === name ? this._locale._abbr : (this._locale = moment.localeData(key), this);
    },
    lang : timeout("moment().lang() is deprecated. Use moment().localeData() instead.", function(input) {
      return input === name ? this.localeData() : (this._locale = moment.localeData(input), this);
    }),
    /**
     * @return {?}
     */
    localeData : function() {
      return this._locale;
    }
  });
  moment.fn.millisecond = moment.fn.milliseconds = setTick("Milliseconds", false);
  moment.fn.second = moment.fn.seconds = setTick("Seconds", false);
  moment.fn.minute = moment.fn.minutes = setTick("Minutes", false);
  moment.fn.hour = moment.fn.hours = setTick("Hours", true);
  moment.fn.date = setTick("Date", true);
  moment.fn.dates = timeout("dates accessor is deprecated. Use date instead.", setTick("Date", true));
  moment.fn.year = setTick("FullYear", true);
  moment.fn.years = timeout("years accessor is deprecated. Use year instead.", setTick("FullYear", true));
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.quarters = moment.fn.quarter;
  moment.fn.toJSON = moment.fn.toISOString;
  extend(moment.duration.fn = Duration.prototype, {
    /**
     * @return {undefined}
     */
    _bubble : function() {
      var seconds;
      var minutes;
      var hours;
      var milliseconds = this._milliseconds;
      var days = this._days;
      var months = this._months;
      var data = this._data;
      /** @type {number} */
      var years = 0;
      /** @type {number} */
      data.milliseconds = milliseconds % 1E3;
      seconds = absRound(milliseconds / 1E3);
      /** @type {number} */
      data.seconds = seconds % 60;
      minutes = absRound(seconds / 60);
      /** @type {number} */
      data.minutes = minutes % 60;
      hours = absRound(minutes / 60);
      /** @type {number} */
      data.hours = hours % 24;
      days += absRound(hours / 24);
      years = absRound(isNumeric(days));
      days -= absRound(array_to_hash(years));
      months += absRound(days / 30);
      days %= 30;
      years += absRound(months / 12);
      months %= 12;
      data.days = days;
      data.months = months;
      data.years = years;
    },
    /**
     * @return {?}
     */
    abs : function() {
      return this._milliseconds = Math.abs(this._milliseconds), this._days = Math.abs(this._days), this._months = Math.abs(this._months), this._data.milliseconds = Math.abs(this._data.milliseconds), this._data.seconds = Math.abs(this._data.seconds), this._data.minutes = Math.abs(this._data.minutes), this._data.hours = Math.abs(this._data.hours), this._data.months = Math.abs(this._data.months), this._data.years = Math.abs(this._data.years), this;
    },
    /**
     * @return {?}
     */
    weeks : function() {
      return absRound(this.days() / 7);
    },
    /**
     * @return {?}
     */
    valueOf : function() {
      return this._milliseconds + 864E5 * this._days + this._months % 12 * 2592E6 + 31536E6 * toInt(this._months / 12);
    },
    /**
     * @param {boolean} lowFirstLetter
     * @return {?}
     */
    humanize : function(lowFirstLetter) {
      var output = preset(this, !lowFirstLetter, this.localeData());
      return lowFirstLetter && (output = this.localeData().pastFuture(+this, output)), this.localeData().postformat(output);
    },
    /**
     * @param {Object} a
     * @param {string} val
     * @return {?}
     */
    add : function(a, val) {
      var dur = moment.duration(a, val);
      return this._milliseconds += dur._milliseconds, this._days += dur._days, this._months += dur._months, this._bubble(), this;
    },
    /**
     * @param {Object} exports
     * @param {string} val
     * @return {?}
     */
    subtract : function(exports, val) {
      var dur = moment.duration(exports, val);
      return this._milliseconds -= dur._milliseconds, this._days -= dur._days, this._months -= dur._months, this._bubble(), this;
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return name = normalizeUnits(name), this[name.toLowerCase() + "s"]();
    },
    /**
     * @param {string} x
     * @return {?}
     */
    as : function(x) {
      var ms;
      var r;
      if (x = normalizeUnits(x), ms = this._days + this._milliseconds / 864E5, "month" === x || "year" === x) {
        return r = this._months + 12 * isNumeric(ms), "month" === x ? r : r / 12;
      }
      switch(ms += array_to_hash(this._months / 12), x) {
        case "week":
          return ms / 7;
        case "day":
          return ms;
        case "hour":
          return 24 * ms;
        case "minute":
          return 24 * ms * 60;
        case "second":
          return 24 * ms * 60 * 60;
        case "millisecond":
          return 24 * ms * 60 * 60 * 1E3;
        default:
          throw new Error("Unknown unit " + x);;
      }
    },
    lang : moment.fn.lang,
    locale : moment.fn.locale,
    toIsoString : timeout("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", function() {
      return this.toISOString();
    }),
    /**
     * @return {?}
     */
    toISOString : function() {
      /** @type {number} */
      var years = Math.abs(this.years());
      /** @type {number} */
      var months = Math.abs(this.months());
      /** @type {number} */
      var days = Math.abs(this.days());
      /** @type {number} */
      var hours = Math.abs(this.hours());
      /** @type {number} */
      var minutes = Math.abs(this.minutes());
      /** @type {number} */
      var seconds = Math.abs(this.seconds() + this.milliseconds() / 1E3);
      return this.asSeconds() ? (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || (minutes || seconds) ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "") : "P0D";
    },
    /**
     * @return {?}
     */
    localeData : function() {
      return this._locale;
    }
  });
  for (i in j) {
    if (j.hasOwnProperty(i)) {
      makeDurationGetter(i.toLowerCase());
    }
  }
  /**
   * @return {?}
   */
  moment.duration.fn.asMilliseconds = function() {
    return this.as("ms");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asSeconds = function() {
    return this.as("s");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asMinutes = function() {
    return this.as("m");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asHours = function() {
    return this.as("h");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asDays = function() {
    return this.as("d");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asWeeks = function() {
    return this.as("weeks");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asMonths = function() {
    return this.as("M");
  };
  /**
   * @return {?}
   */
  moment.duration.fn.asYears = function() {
    return this.as("y");
  };
  moment.locale("en", {
    /**
     * @param {number} number
     * @return {?}
     */
    ordinal : function(number) {
      /** @type {number} */
      var b = number % 10;
      /** @type {string} */
      var output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
      return number + output;
    }
  });
  if (Gb) {
    /** @type {function (string, ?, (Function|string), (Function|string)): ?} */
    module.exports = moment;
  } else {
    if ("function" == typeof define && define.amd) {
      define("moment", ["require", "exports", "module"], function(dataAndEvents, deepDataAndEvents, module) {
        return module.config && (module.config() && (module.config().noGlobal === true && (root.moment = previous_async))), moment;
      });
      clone(true);
    } else {
      clone();
    }
  }
}.call(this), define("core/time", [], function() {
  /**
   * @param {string} path
   * @return {?}
   */
  function ignored(path) {
    return path.indexOf("+") >= 0 ? path : path + "+00:00";
  }
  /** @type {string} */
  var ISO_8601 = "YYYY-MM-DDTHH:mm:ssZ";
  return{
    ISO_8601 : ISO_8601,
    /** @type {function (string): ?} */
    assureTzOffset : ignored
  };
}), define("core/utils/cookies", ["underscore"], function(exports) {
  /** @type {Document} */
  var doc = window.document;
  var $ = {
    /**
     * @param {Function} a
     * @param {Function} name
     * @param {Object} value
     * @return {undefined}
     */
    create : function(a, name, value) {
      if (!value) {
        value = {};
      }
      /** @type {string} */
      var text = a + "=" + name + "; path=" + (value.path || "/");
      var domain = value.domain;
      var duration = value.expiresIn;
      if (domain && (text += "; domain=." + domain), exports.isNumber(duration)) {
        /** @type {Date} */
        var expires_date = new Date((new Date).getTime() + duration);
        text += "; expires=" + expires_date.toGMTString();
      }
      /** @type {string} */
      doc.cookie = text;
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    read : function(a) {
      var c;
      /** @type {string} */
      var nameEQ = a + "=";
      /** @type {Array.<string>} */
      var codeSegments = doc.cookie.split(";");
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        if (c = codeSegments[i].replace(/^\s+/, ""), 0 === c.indexOf(nameEQ)) {
          return c.substring(nameEQ.length);
        }
      }
      return null;
    },
    /**
     * @param {Function} QUnit
     * @param {?} options
     * @return {?}
     */
    erase : function(QUnit, options) {
      return $.create(QUnit, "", exports.extend({}, options, {
        expiresIn : -1
      }));
    }
  };
  return $;
}), define("core/utils/fingerprint", [], function() {
  /**
   * @return {?}
   */
  function init() {
    try {
      /** @type {number} */
      var r = (new Date).getTimezoneOffset();
      /** @type {number} */
      var g = 1;
      /** @type {(Screen|null)} */
      var target = window.screen;
      if (target && target.availWidth) {
        /** @type {number} */
        g = target.availWidth * target.availHeight + target.colorDepth;
      } else {
        if (target) {
          if (target.width) {
            /** @type {number} */
            g = target.width * target.height;
          }
        }
      }
      /** @type {Element} */
      var el = document.documentElement;
      /** @type {number} */
      var actualValue = el.clientWidth * el.clientHeight;
      return Math.abs(17 * r + 25 * g - actualValue);
    } catch (f) {
      return 1;
    }
  }
  return{
    /** @type {function (): ?} */
    get : init
  };
}), define("core/utils/guid", ["core/utils/fingerprint"], function($templateCache) {
  /**
   * @return {?}
   */
  function f() {
    try {
      /** @type {Uint32Array} */
      var _rnds = new Uint32Array(1);
      return window.crypto.getRandomValues(_rnds)[0];
    } catch (b) {
      return Math.floor(1E9 * Math.random());
    }
  }
  /**
   * @return {?}
   */
  function calcFirstPaintTimeResults() {
    if (window.performance && window.performance.timing) {
      /** @type {PerformanceTiming} */
      var t = window.performance.timing;
      /** @type {number} */
      var r = t.domainLookupEnd - t.domainLookupStart;
      /** @type {number} */
      var g = t.connectEnd - t.connectStart;
      /** @type {number} */
      var d = t.responseStart - t.navigationStart;
      return 11 * r + 13 * g + 17 * d;
    }
    return 1E5;
  }
  /**
   * @return {?}
   */
  function process() {
    /** @type {number} */
    var b = Number((new Date).getTime().toString().substring(3));
    /** @type {string} */
    var e = Math.abs(b + calcFirstPaintTimeResults() - $templateCache.get()).toString(32);
    return e += f().toString(32);
  }
  return{
    /** @type {function (): ?} */
    generate : process
  };
}), define("core/models/BaseUser", ["backbone", "core/config"], function(Backbone, p) {
  var c = Backbone.Model.extend({
    defaults : {
      about : null,
      avatar : {
        cache : p.urls.avatar.generic,
        permalink : p.urls.avatar.generic
      },
      connections : {},
      email : null,
      isAnonymous : true,
      isFollowedBy : null,
      isFollowing : null,
      joinedAt : null,
      name : null,
      profileUrl : null,
      url : null,
      username : null,
      numPosts : null,
      numFollowing : null,
      numForumsFollowing : null,
      numFollowers : null,
      numLikesReceived : null
    },
    /**
     * @param {boolean} options
     * @return {?}
     */
    hasValidAvatar : function(options) {
      var opts = options ? options.avatar : this.get("avatar");
      return opts && opts.cache;
    },
    /**
     * @return {?}
     */
    isAnonymous : function() {
      return!this.get("id");
    },
    /**
     * @return {?}
     */
    isRegistered : function() {
      return!this.isAnonymous();
    },
    /**
     * @param {boolean} instance
     * @return {?}
     */
    validate : function(instance) {
      return this.hasValidAvatar(instance) ? void 0 : "None of the avatar related properties can be null, undefined or empty on User models.";
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
      return data.thread = {}, this.hasValidAvatar() || (data.avatar = this.defaults.avatar), data.isRegistered = this.isRegistered(), data;
    }
  });
  return c;
}), function(global, factory) {
  if ("object" == typeof module && (module.exports && "function" == typeof require)) {
    module.exports = factory();
  } else {
    if ("function" == typeof define && "object" == typeof define.amd) {
      define("loglevel", factory);
    } else {
      global.log = factory();
    }
  }
}(this, function() {
  /**
   * @param {string} type
   * @return {?}
   */
  function _log(type) {
    return typeof console === object ? false : void 0 !== console[type] ? log(console, type) : void 0 !== console.log ? log(console, "log") : min;
  }
  /**
   * @param {Object} o
   * @param {string} type
   * @return {?}
   */
  function log(o, type) {
    var value = o[type];
    if ("function" == typeof value.bind) {
      return value.bind(o);
    }
    try {
      return Function.prototype.bind.call(value, o);
    } catch (d) {
      return function() {
        return Function.prototype.apply.apply(value, [o, arguments]);
      };
    }
  }
  /**
   * @param {string} name
   * @param {number} arg
   * @return {?}
   */
  function fn(name, arg) {
    return function() {
      if (typeof console !== object) {
        resolve(arg);
        t[name].apply(t, arguments);
      }
    };
  }
  /**
   * @param {number} val
   * @return {undefined}
   */
  function resolve(val) {
    /** @type {number} */
    var i = 0;
    for (;i < levels.length;i++) {
      var pattern = levels[i];
      t[pattern] = val > i ? min : t.methodFactory(pattern, val);
    }
  }
  /**
   * @param {number} level
   * @return {?}
   */
  function initialize(level) {
    var loglevel = (levels[level] || "silent").toUpperCase();
    try {
      return void(window.localStorage.loglevel = loglevel);
    } catch (c) {
    }
    try {
      /** @type {string} */
      window.document.cookie = "loglevel=" + loglevel + ";";
    } catch (c) {
    }
  }
  /**
   * @return {undefined}
   */
  function handler() {
    var key;
    try {
      key = window.localStorage.loglevel;
    } catch (b) {
    }
    if (typeof key === object) {
      try {
        /** @type {string} */
        key = /loglevel=([^;]+)/.exec(window.document.cookie)[1];
      } catch (b) {
      }
    }
    if (void 0 === t.levels[key]) {
      /** @type {string} */
      key = "WARN";
    }
    t.setLevel(t.levels[key], false);
  }
  var t = {};
  /**
   * @return {undefined}
   */
  var min = function() {
  };
  /** @type {string} */
  var object = "undefined";
  /** @type {Array} */
  var levels = ["trace", "debug", "info", "warn", "error"];
  t.levels = {
    TRACE : 0,
    DEBUG : 1,
    INFO : 2,
    WARN : 3,
    ERROR : 4,
    SILENT : 5
  };
  /**
   * @param {string} elem
   * @param {number} key
   * @return {?}
   */
  t.methodFactory = function(elem, key) {
    return _log(elem) || fn(elem, key);
  };
  /**
   * @param {number} val
   * @param {boolean} deepDataAndEvents
   * @return {?}
   */
  t.setLevel = function(val, deepDataAndEvents) {
    if ("string" == typeof val && (void 0 !== t.levels[val.toUpperCase()] && (val = t.levels[val.toUpperCase()])), !("number" == typeof val && (val >= 0 && val <= t.levels.SILENT))) {
      throw "log.setLevel() called with invalid level: " + val;
    }
    return deepDataAndEvents !== false && initialize(val), resolve(val), typeof console === object && val < t.levels.SILENT ? "No console available for logging" : void 0;
  };
  /**
   * @param {boolean} deepDataAndEvents
   * @return {undefined}
   */
  t.enableAll = function(deepDataAndEvents) {
    t.setLevel(t.levels.TRACE, deepDataAndEvents);
  };
  /**
   * @param {boolean} deepDataAndEvents
   * @return {undefined}
   */
  t.disableAll = function(deepDataAndEvents) {
    t.setLevel(t.levels.SILENT, deepDataAndEvents);
  };
  var data = typeof window !== object ? window.log : void 0;
  return t.noConflict = function() {
    return typeof window !== object && (window.log === t && (window.log = data)), t;
  }, handler(), t;
}), define("core/strings", ["loglevel"], function($log) {
  var settings = {
    translations : {}
  };
  return settings.get = function(name) {
    var existingNode = settings.translations[name];
    return void 0 !== existingNode ? existingNode : name;
  }, settings.interpolate = function(optgroup, opt_attributes) {
    /**
     * @param {string} id
     * @return {?}
     */
    function toString(id) {
      /** @type {string} */
      var desc = "";
      return id in opt_attributes ? desc = void 0 !== opt_attributes[id] && null !== opt_attributes[id] ? opt_attributes[id].toString() : "" : $log.error("Key `" + id + "` not found in context for: ", optgroup), desc;
    }
    return optgroup.replace(/%\(\w+\)s/g, function(models) {
      return toString(models.slice(2, -2));
    });
  }, settings;
}), define("core/models/User", ["jquery", "underscore", "backbone", "moment", "core/config", "core/time", "core/utils", "core/strings", "core/api", "core/models/BaseUser"], function(buf, _, dataAndEvents, on, dojo, values, helpers, c, $, Model) {
  /**
   * @param {Object} info
   * @param {string} name
   * @param {string} style
   * @return {undefined}
   */
  function callback(info, name, style) {
    info[name] = info[name] || [];
    info[name].push(style);
  }
  var cl = c.get;
  var opts = Model.extend({
    url : $.getURL("users/details"),
    /**
     * @param {Object} data
     * @return {?}
     */
    validate : function(data) {
      var result = {};
      return data.display_name && (data.display_name = buf.trim(data.display_name)), data.display_name || callback(result, "display_name", cl("Please enter your name.")), data.email || callback(result, "email", cl("Please enter your email address.")), helpers.validateEmail(data.email) || callback(result, "email", cl("Invalid email address.")), this.isNew() && (data.password ? data.password.length < opts.MIN_PASSWORD_LEN && callback(result, "password", cl("Password must have at least 6 characters.")) : 
      callback(result, "password", cl("Please enter a password."))), data.name && (data.name.length < opts.MIN_NAME_LEN && callback(result, "name", c.interpolate(cl("Name must have at least %(minLength)s characters."), {
        minLength : opts.MIN_NAME_LEN
      })), data.name.length > opts.MAX_NAME_LEN && callback(result, "name", c.interpolate(cl("Name must have less than %(maxLength)s characters."), {
        maxLength : opts.MAX_NAME_LEN
      }))), data.location && (data.location.length > opts.MAX_LOCATION_LEN && callback(result, "location", c.interpolate(cl("Location must have less than %(maxLength)s characters."), {
        maxLength : opts.MAX_LOCATION_LEN
      }))), data.url && (data.url.length > opts.MAX_URL_LEN && callback(result, "url", c.interpolate(cl("Site must have less than %(maxLength)s characters."), {
        maxLength : opts.MAX_URL_LEN
      })), helpers.isUrl(data.url) || callback(result, "url", cl("Please enter a valid site."))), _.isEmpty(result) ? void 0 : result;
    },
    /**
     * @param {Object} node
     * @return {?}
     */
    prepareFetchOptions : function(node) {
      node = node ? _.clone(node) : {};
      var attributes = {};
      return this.get("id") ? attributes.user = this.get("id") : this.get("username") && (attributes.user = "username:" + this.get("username")), _.extend(attributes, node.data), node.data = attributes, node;
    },
    /**
     * @param {Object} tag
     * @return {?}
     */
    fetch : function(tag) {
      return tag = this.prepareFetchOptions(tag), Model.prototype.fetch.call(this, tag);
    },
    /**
     * @param {Object} callback
     * @return {?}
     */
    parse : function(callback) {
      return callback.response || callback;
    },
    /**
     * @param {Object} callbacks
     * @return {?}
     */
    register : function(callbacks) {
      var that = this;
      return callbacks = callbacks || {}, $.call("internal/users/register.json", {
        secure : true,
        data : this.toRegisterJSON(),
        method : "POST",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          that.set(a.response);
          if (callbacks.success) {
            callbacks.success(a);
          }
        },
        error : callbacks.error
      });
    },
    /**
     * @param {?} c
     * @return {?}
     */
    saveAvatar : function(c) {
      var me = new window.FormData;
      return me.append("avatar_file", c), me.append("api_key", dojo.keys.api), $.call("internal/users/updateAvatar.json", {
        method : "post",
        data : me,
        cache : false,
        contentType : false,
        processData : false
      });
    },
    /**
     * @return {?}
     */
    saveProfile : function() {
      return $.call("users/updateProfile.json", {
        method : "POST",
        data : {
          name : this.get("name"),
          about : this.get("about"),
          location : this.get("location"),
          url : this.get("url")
        }
      });
    },
    /**
     * @return {?}
     */
    toRegisterJSON : function() {
      return _.pick(this.toJSON(), "display_name", "email", "password");
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    isSession : function(obj) {
      return obj.user.id && obj.user.id === this.id;
    },
    /**
     * @param {Object} walkers
     * @return {?}
     */
    isEditable : function(walkers) {
      return this.isSession(walkers) && !this.get("remote");
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    toJSON : function(a) {
      a = a || {};
      var exports = Model.prototype.toJSON.call(this);
      var retval = this.collection && this.collection.thread;
      return exports.thread.canModerate = Boolean(retval) && retval.isModerator(this), a.session && (exports.isSession = this.isSession(a.session), exports.isEditable = this.isEditable(a.session)), exports;
    },
    /**
     * @param {boolean} recurring
     * @return {?}
     */
    _changeFollowState : function(recurring) {
      this.set({
        isFollowing : recurring,
        numFollowers : Math.max(0, this.get("numFollowers") + (recurring ? 1 : -1))
      });
      /** @type {string} */
      var c = "users/" + (recurring ? "follow" : "unfollow");
      var d = this;
      return $.call(c + ".json", {
        data : {
          target : this.get("id")
        },
        method : "POST",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          d.trigger("sync", d, a, {});
        }
      });
    },
    /**
     * @return {?}
     */
    follow : function() {
      return this._changeFollowState(true);
    },
    /**
     * @return {?}
     */
    unfollow : function() {
      return this._changeFollowState(false);
    },
    /**
     * @return {?}
     */
    toggleFollowState : function() {
      return this._changeFollowState(!this.get("isFollowing"));
    },
    /**
     * @param {number} deepDataAndEvents
     * @param {string} day
     * @return {?}
     */
    registeredLessThan : function(deepDataAndEvents, day) {
      var failuresLink = values.assureTzOffset(this.get("joinedAt"));
      var environment = on().subtract(deepDataAndEvents, day);
      return on(failuresLink).isAfter(environment);
    },
    /**
     * @return {?}
     */
    registeredToday : function() {
      return this.registeredLessThan(1, "day");
    },
    /**
     * @return {?}
     */
    registeredThisWeek : function() {
      return this.registeredLessThan(1, "week");
    }
  }, {
    MIN_PASSWORD_LEN : 6,
    MIN_NAME_LEN : 2,
    MAX_NAME_LEN : 30,
    MAX_LOCATION_LEN : 255,
    MAX_URL_LEN : 200
  });
  return opts;
}), define("core/models/Session", ["underscore", "backbone", "moment", "core/api", "core/config", "core/time", "core/utils", "core/utils/cookies", "core/utils/guid", "core/models/BaseUser", "core/models/User"], function(Events, Backbone, sum, test, deepDataAndEvents, buf, ignoreMethodDoesntExist, $, UUID, dataAndEvents, Selector) {
  /** @type {string} */
  var QUnit = "reflectauth";
  var m = Backbone.Model.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      this._fromCookie = Events.once(this._fromCookie, this);
      this.user = this.getAnonUserInstance();
    },
    /**
     * @param {Function} QUnit
     * @return {undefined}
     */
    setUser : function(QUnit) {
      if (this.user) {
        this.stopListening(this.user);
      }
      /** @type {Function} */
      this.user = QUnit;
      this.setIfNewUser();
      this.listenTo(QUnit, "all", this.trigger);
      this.trigger("change:id", QUnit);
    },
    /**
     * @return {?}
     */
    isLoggedOut : function() {
      return!this.isLoggedIn();
    },
    /**
     * @return {?}
     */
    isKnownToBeLoggedOut : function() {
      return!this._fromCookie().id;
    },
    /**
     * @return {?}
     */
    _fromCookie : function() {
      var data = ($.read(QUnit) || "").replace(/$\"|\"$/g, "").split("|");
      return data[1] && (data[6] && data[8]) ? {
        username : data[1],
        id : parseInt(data[6], 10),
        isModerator : parseInt(data[8], 10) > 0
      } : (data && $.erase(QUnit, {}), {
        username : void 0,
        id : 0,
        isModerator : false
      });
    },
    /**
     * @return {?}
     */
    isLoggedIn : function() {
      return Boolean(this.user.get("id"));
    },
    /**
     * @param {Object} callbacks
     * @return {?}
     */
    fetch : function(callbacks) {
      callbacks = callbacks || {};
      var params = {};
      return params["_" + (new Date).getTime()] = 1, test.call("users/details.json", {
        data : params,
        success : Events.bind(function(QUnit) {
          QUnit = QUnit.response;
          if (QUnit.id) {
            this.setUser(this.getUserInstance(QUnit));
          }
          if (callbacks.success) {
            callbacks.success(QUnit);
          }
          if (callbacks.complete) {
            callbacks.complete(QUnit);
          }
        }, this),
        error : Events.bind(function(QUnit) {
          if (callbacks.error) {
            callbacks.error(QUnit);
          }
          if (callbacks.complete) {
            callbacks.complete(QUnit);
          }
        }, this)
      });
    },
    /**
     * @param {Object} deepDataAndEvents
     * @return {?}
     */
    getAnonUserInstance : function(deepDataAndEvents) {
      return new dataAndEvents(deepDataAndEvents);
    },
    /**
     * @param {Object} a
     * @return {?}
     */
    getUserInstance : function(a) {
      return new Selector(a);
    },
    /**
     * @return {?}
     */
    getCsrfToken : function() {
      var optgroup = $.read("csrftoken");
      return optgroup || (optgroup = UUID.generate().replace(/\W/g, ""), $.create("csrftoken", optgroup, {
        expiresIn : 31536E6
      })), optgroup;
    },
    /**
     * @return {?}
     */
    setIfNewUser : function() {
      var prefix = this.user.get("joinedAt");
      if (this.user.get("isAnonymous") || !prefix) {
        return void this.user.set("joinedRecently", false);
      }
      var c = buf.assureTzOffset(prefix);
      this.user.set("joinedRecently", sum().subtract(10, "seconds").isBefore(c));
    }
  });
  return m;
}), define("core/UniqueModel", ["underscore"], function(callback) {
  /**
   * @param {string} optgroup
   * @param {string} reqUrl
   * @param {string} index
   * @return {?}
   */
  function self(optgroup, reqUrl, index) {
    var shapes = self.pool(optgroup);
    var name = reqUrl && reqUrl[optgroup.prototype.idAttribute];
    if (!name) {
      return new optgroup(reqUrl, index);
    }
    var el = self.get(optgroup, name);
    return el ? shapes[name].set(reqUrl) : shapes[name] = new optgroup(reqUrl, index), shapes[name];
  }
  return self.pool = {}, self.pool = function(name) {
    var pool = self.pool[name.__type__];
    if (!pool) {
      throw new Error("Model not registered. Use UniqueModel.addType");
    }
    return pool;
  }, self.get = function(name, index) {
    return self.pool(name)[index];
  }, self.set = function(methodName, recurring) {
    var actual = self.pool(methodName);
    var index = recurring && recurring.get(methodName.prototype.idAttribute);
    if (!index) {
      return recurring;
    }
    var element = self.get(methodName, index);
    return element ? element.set(recurring.attributes) : element = actual[index] = recurring, element;
  }, self.addType = function(name, type) {
    if (!(type.__type__ && self.pool[name])) {
      /** @type {string} */
      type.__type__ = name;
      self.pool[name] = {};
    }
  }, self.boundModel = function(value) {
    var result = callback.bind(self, self, value);
    return result.prototype = value.prototype, result;
  }, self.wrap = self.boundModel, self;
}), window.Modernizr = function(a, doc, dataAndEvents) {
  /**
   * @param {string} str
   * @return {undefined}
   */
  function setCss(str) {
    /** @type {string} */
    mStyle.cssText = str;
  }
  /**
   * @param {Function} obj
   * @param {string} type
   * @return {?}
   */
  function is(obj, type) {
    return typeof obj === type;
  }
  var inputElem;
  var featureName;
  var hasOwn;
  /** @type {string} */
  var version = "2.6.2";
  var Modernizr = {};
  /** @type {boolean} */
  var enableClasses = true;
  /** @type {Element} */
  var docElement = doc.documentElement;
  /** @type {string} */
  var mod = "modernizr";
  /** @type {Element} */
  var modElem = doc.createElement(mod);
  /** @type {(CSSStyleDeclaration|null)} */
  var mStyle = modElem.style;
  /** @type {Array.<string>} */
  var prefixes = ({}.toString, " -webkit- -moz- -o- -ms- ".split(" "));
  var obj = {};
  /** @type {Array} */
  var classes = [];
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var __slice = classes.slice;
  /**
   * @param {string} rule
   * @param {Function} callback
   * @param {number} nodes
   * @param {boolean} testnames
   * @return {?}
   */
  var injectElementWithStyles = function(rule, callback, nodes, testnames) {
    var style;
    var ret;
    var node;
    var docOverflow;
    /** @type {Element} */
    var div = doc.createElement("div");
    /** @type {(HTMLElement|null)} */
    var body = doc.body;
    /** @type {Element} */
    var fakeBody = body || doc.createElement("body");
    if (parseInt(nodes, 10)) {
      for (;nodes--;) {
        /** @type {Element} */
        node = doc.createElement("div");
        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        div.appendChild(node);
      }
    }
    return style = ["&#173;", '<style id="s', mod, '">', rule, "</style>"].join(""), div.id = mod, (body ? div : fakeBody).innerHTML += style, fakeBody.appendChild(div), body || (fakeBody.style.background = "", fakeBody.style.overflow = "hidden", docOverflow = docElement.style.overflow, docElement.style.overflow = "hidden", docElement.appendChild(fakeBody)), ret = callback(div, rule), body ? div.parentNode.removeChild(div) : (fakeBody.parentNode.removeChild(fakeBody), docElement.style.overflow = 
    docOverflow), !!ret;
  };
  /** @type {function (this:Object, *): boolean} */
  var _hasOwnProperty = {}.hasOwnProperty;
  /** @type {function (Object, string): ?} */
  hasOwn = is(_hasOwnProperty, "undefined") || is(_hasOwnProperty.call, "undefined") ? function(object, property) {
    return property in object && is(object.constructor.prototype[property], "undefined");
  } : function(object, key) {
    return _hasOwnProperty.call(object, key);
  };
  if (!Function.prototype.bind) {
    /**
     * @param {(Object|null|undefined)} events
     * @return {Function}
     */
    Function.prototype.bind = function(events) {
      /** @type {Function} */
      var Base = this;
      if ("function" != typeof Base) {
        throw new TypeError;
      }
      /** @type {Array.<?>} */
      var args = __slice.call(arguments, 1);
      /**
       * @return {?}
       */
      var bound = function() {
        if (this instanceof bound) {
          /**
           * @return {undefined}
           */
          var F = function() {
          };
          F.prototype = Base.prototype;
          var recurring = new F;
          var result = Base.apply(recurring, args.concat(__slice.call(arguments)));
          return Object(result) === result ? result : recurring;
        }
        return Base.apply(events, args.concat(__slice.call(arguments)));
      };
      return bound;
    };
  }
  /**
   * @return {?}
   */
  obj.touch = function() {
    var c;
    return "ontouchstart" in a || a.DocumentTouch && doc instanceof DocumentTouch ? c = true : injectElementWithStyles(["@media (", prefixes.join("touch-enabled),("), mod, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(td) {
      /** @type {boolean} */
      c = 9 === td.offsetTop;
    }), c;
  };
  /**
   * @return {?}
   */
  obj.localstorage = function() {
    try {
      return localStorage.setItem(mod, mod), localStorage.removeItem(mod), true;
    } catch (a) {
      return false;
    }
  };
  /**
   * @return {?}
   */
  obj.sessionstorage = function() {
    try {
      return sessionStorage.setItem(mod, mod), sessionStorage.removeItem(mod), true;
    } catch (a) {
      return false;
    }
  };
  var key;
  for (key in obj) {
    if (hasOwn(obj, key)) {
      /** @type {string} */
      featureName = key.toLowerCase();
      Modernizr[featureName] = obj[key]();
      classes.push((Modernizr[featureName] ? "" : "no-") + featureName);
    }
  }
  return Modernizr.addTest = function(feature, test) {
    if ("object" == typeof feature) {
      var key;
      for (key in feature) {
        if (hasOwn(feature, key)) {
          Modernizr.addTest(key, feature[key]);
        }
      }
    } else {
      if (feature = feature.toLowerCase(), Modernizr[feature] !== dataAndEvents) {
        return Modernizr;
      }
      test = "function" == typeof test ? test() : test;
      if ("undefined" != typeof enableClasses) {
        if (enableClasses) {
          docElement.className += " " + (test ? "" : "no-") + feature;
        }
      }
      /** @type {boolean} */
      Modernizr[feature] = test;
    }
    return Modernizr;
  }, setCss(""), modElem = inputElem = null, Modernizr._version = version, Modernizr._prefixes = prefixes, Modernizr.testStyles = injectElementWithStyles, docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (enableClasses ? " js " + classes.join(" ") : ""), Modernizr;
}(this, this.document), Modernizr.addTest("contenteditable", "contentEditable" in document.documentElement), define("modernizr", function(win) {
  return function() {
    var event;
    return event || win.Modernizr;
  };
}(this)), define("core/WindowBus", ["jquery", "underscore", "backbone", "modernizr"], function($, $swipe, Backbone, Modernizr) {
  var e = Backbone.Model.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      if (Modernizr.localstorage) {
        $(window).on("storage", $swipe.bind(this.onStorageEvent, this));
      }
    },
    /**
     * @param {string} key
     * @param {Object} message
     * @return {undefined}
     */
    broadcast : function(key, message) {
      if (Modernizr.localstorage) {
        /** @type {string} */
        var pdataCur = JSON.stringify({
          name : key,
          data : message,
          time : (new Date).getTime()
        });
        try {
          window.localStorage.setItem(this.constructor.STORAGE_KEY, pdataCur);
        } catch (e) {
          return;
        }
      }
    },
    /**
     * @param {KeyboardEvent} e
     * @return {undefined}
     */
    onStorageEvent : function(e) {
      var id = e.originalEvent.key;
      var header = e.originalEvent.newValue;
      if (header && id === this.constructor.STORAGE_KEY) {
        try {
          /** @type {*} */
          header = JSON.parse(header);
          this.trigger(header.name, header.data);
        } catch (d) {
          return;
        }
      }
    }
  }, {
    STORAGE_KEY : "reflect.bus"
  });
  return e;
}), define("core/utils/storage", [], function() {
  var result = function(w) {
    /** @type {string} */
    var camelKey = "_refstorage_";
    try {
      return w.localStorage.setItem(camelKey, camelKey), w.localStorage.getItem(camelKey), w.localStorage.removeItem(camelKey), true;
    } catch (c) {
      return false;
    }
  }(window);
  var failed = function() {
    var $cookies = {};
    return{
      /**
       * @param {string} key
       * @return {?}
       */
      getItem : function(key) {
        return $cookies.hasOwnProperty(key) ? $cookies[key] : null;
      },
      /**
       * @param {string} key
       * @param {string} value
       * @return {undefined}
       */
      setItem : function(key, value) {
        /** @type {string} */
        $cookies[key] = String(value);
      },
      /**
       * @param {string} key
       * @return {undefined}
       */
      removeItem : function(key) {
        delete $cookies[key];
      },
      /**
       * @return {undefined}
       */
      clear : function() {
        $cookies = {};
      }
    };
  }();
  return{
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      /** @type {null} */
      var prop = null;
      try {
        return prop = this.backend.getItem(name), JSON.parse(prop);
      } catch (c) {
        return prop;
      }
    },
    /**
     * @param {string} value
     * @param {boolean} recurring
     * @return {undefined}
     */
    set : function(value, recurring) {
      try {
        this.backend.setItem(value, JSON.stringify(recurring));
      } catch (c) {
      }
    },
    /**
     * @param {Object} a
     * @return {undefined}
     */
    remove : function(a) {
      this.backend.removeItem(a);
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      this.backend.clear();
    },
    backend : result ? window.localStorage : failed,
    isPersistent : result
  };
}), define("common/cached-storage", ["underscore", "core/utils/storage"], function(_, namespace) {
  /**
   * @param {string} namespace
   * @param {number} options
   * @return {undefined}
   */
  var Store = function(namespace, options) {
    /** @type {string} */
    this.namespace = namespace;
    this.ttl = options || 300;
    this.cache = this.getFromStorage();
  };
  return _.extend(Store.prototype, {
    /**
     * @param {string} key
     * @return {?}
     */
    getItem : function(key) {
      var cache = this.cache[key];
      if (cache) {
        if (!this.isExpired(cache)) {
          return cache.value;
        }
        delete this.cache[key];
      }
    },
    /**
     * @return {?}
     */
    getCurrentTime : function() {
      return Math.floor((new Date).getTime() / 1E3);
    },
    /**
     * @return {undefined}
     */
    persist : function() {
      namespace.set(this.namespace, this.cache);
    },
    /**
     * @return {?}
     */
    getFromStorage : function() {
      var result = namespace.get(this.namespace);
      return _.isObject(result) ? result : {};
    },
    /**
     * @param {(Object|string)} obj
     * @return {?}
     */
    isExpired : function(obj) {
      return this.getCurrentTime() > obj.expiry;
    },
    /**
     * @param {string} key
     * @param {string} data
     * @return {undefined}
     */
    setItem : function(key, data) {
      this.cache[key] = {
        value : data,
        expiry : this.getCurrentTime() + this.ttl
      };
      this.persist();
    },
    /**
     * @param {string} key
     * @return {undefined}
     */
    removeItem : function(key) {
      delete this.cache[key];
      this.persist();
    },
    /**
     * @return {?}
     */
    getAll : function() {
      var b = _.compact(_.map(this.cache, function(dataAndEvents, storageKey) {
        return this.getItem(storageKey);
      }, this));
      return this.persist(), b;
    }
  }), Store;
}), function(dataAndEvents, factory) {
  if ("function" == typeof define && define.amd) {
    define("handlebars", [], factory);
  } else {
    if ("object" == typeof exports) {
      module.exports = factory();
    } else {
      dataAndEvents.Handlebars = dataAndEvents.Handlebars || factory();
    }
  }
}(this, function() {
  var dataAndEvents = function() {
    /**
     * @param {string} string
     * @return {undefined}
     */
    function SafeString(string) {
      /** @type {string} */
      this.string = string;
    }
    var __exports__;
    return SafeString.prototype.toString = function() {
      return "" + this.string;
    }, __exports__ = SafeString;
  }();
  var r20 = function(dataAndEvents) {
    /**
     * @param {?} off
     * @return {?}
     */
    function r(off) {
      return buf[off];
    }
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    function extend(opt_attributes) {
      /** @type {number} */
      var i = 1;
      for (;i < arguments.length;i++) {
        var prop;
        for (prop in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], prop)) {
            opt_attributes[prop] = arguments[i][prop];
          }
        }
      }
      return opt_attributes;
    }
    /**
     * @param {string} s
     * @return {?}
     */
    function filter(s) {
      return s instanceof Observable ? s.toString() : null == s ? "" : s ? (s = "" + s, hChars.test(s) ? s.replace(r20, r) : s) : s + "";
    }
    /**
     * @param {Object} value
     * @return {?}
     */
    function isEmpty(value) {
      return value || 0 === value ? isArray(value) && 0 === value.length ? true : false : true;
    }
    /**
     * @param {boolean} parent
     * @param {string} item
     * @return {?}
     */
    function parse(parent, item) {
      return(parent ? parent + "." : "") + item;
    }
    var __exports__ = {};
    /** @type {string} */
    var Observable = dataAndEvents;
    var buf = {
      "&" : "&amp;",
      "<" : "&lt;",
      ">" : "&gt;",
      '"' : "&quot;",
      "'" : "&#x27;",
      "`" : "&#x60;"
    };
    /** @type {RegExp} */
    var r20 = /[&<>"'`]/g;
    /** @type {RegExp} */
    var hChars = /[&<>"'`]/;
    /** @type {function (?): ?} */
    __exports__.extend = extend;
    /** @type {function (this:*): string} */
    var core_toString = Object.prototype.toString;
    /** @type {function (this:*): string} */
    __exports__.toString = core_toString;
    /**
     * @param {Function} obj
     * @return {?}
     */
    var isFunction = function(obj) {
      return "function" == typeof obj;
    };
    if (isFunction(/x/)) {
      /**
       * @param {Function} obj
       * @return {?}
       */
      isFunction = function(obj) {
        return "function" == typeof obj && "[object Function]" === core_toString.call(obj);
      };
    }
    /** @type {function (Function): ?} */
    __exports__.isFunction = isFunction;
    /** @type {function (*): boolean} */
    var isArray = Array.isArray || function(obj) {
      return obj && "object" == typeof obj ? "[object Array]" === core_toString.call(obj) : false;
    };
    return __exports__.isArray = isArray, __exports__.escapeExpression = filter, __exports__.isEmpty = isEmpty, __exports__.appendContextPath = parse, __exports__;
  }(dataAndEvents);
  var not = function() {
    /**
     * @param {string} message
     * @param {Object} node
     * @return {undefined}
     */
    function Exception(message, node) {
      var line;
      if (node) {
        if (node.firstLine) {
          line = node.firstLine;
          message += " - " + line + ":" + node.firstColumn;
        }
      }
      var tmp = Error.prototype.constructor.call(this, message);
      /** @type {number} */
      var idx = 0;
      for (;idx < errorProps.length;idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
      }
      if (line) {
        this.lineNumber = line;
        this.column = node.firstColumn;
      }
    }
    var __exports__;
    /** @type {Array} */
    var errorProps = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
    return Exception.prototype = new Error, __exports__ = Exception;
  }();
  var failuresLink = function(regex, not) {
    /**
     * @param {Object} selector
     * @param {?} elems
     * @return {undefined}
     */
    function HandlebarsEnvironment(selector, elems) {
      this.helpers = selector || {};
      this.partials = elems || {};
      registerDefaultHelpers(this);
    }
    /**
     * @param {Object} instance
     * @return {undefined}
     */
    function registerDefaultHelpers(instance) {
      instance.registerHelper("helperMissing", function() {
        if (1 === arguments.length) {
          return void 0;
        }
        throw new Exception("Missing helper: '" + arguments[arguments.length - 1].name + "'");
      });
      instance.registerHelper("blockHelperMissing", function(attributes, options) {
        var inverse = options.inverse;
        var fn = options.fn;
        if (attributes === true) {
          return fn(this);
        }
        if (attributes === false || null == attributes) {
          return inverse(this);
        }
        if (isArray(attributes)) {
          return attributes.length > 0 ? (options.ids && (options.ids = [options.name]), instance.helpers.each(attributes, options)) : inverse(this);
        }
        if (options.data && options.ids) {
          var frame = createFrame(options.data);
          frame.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
          options = {
            data : frame
          };
        }
        return fn(attributes, options);
      });
      instance.registerHelper("each", function(a, options) {
        if (!options) {
          throw new Exception("Must pass iterator to #each");
        }
        var data;
        var _;
        var fn = options.fn;
        var inverse = options.inverse;
        /** @type {number} */
        var i = 0;
        /** @type {string} */
        var ret = "";
        if (options.data && (options.ids && (_ = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + ".")), isFunction(a) && (a = a.call(this)), options.data && (data = createFrame(options.data)), a && "object" == typeof a) {
          if (isArray(a)) {
            var l = a.length;
            for (;l > i;i++) {
              if (data) {
                /** @type {number} */
                data.index = i;
                /** @type {boolean} */
                data.first = 0 === i;
                /** @type {boolean} */
                data.last = i === a.length - 1;
                if (_) {
                  data.contextPath = _ + i;
                }
              }
              ret += fn(a[i], {
                data : data
              });
            }
          } else {
            var id;
            for (id in a) {
              if (a.hasOwnProperty(id)) {
                if (data) {
                  /** @type {string} */
                  data.key = id;
                  /** @type {number} */
                  data.index = i;
                  /** @type {boolean} */
                  data.first = 0 === i;
                  if (_) {
                    /** @type {string} */
                    data.contextPath = _ + id;
                  }
                }
                ret += fn(a[id], {
                  data : data
                });
                i++;
              }
            }
          }
        }
        return 0 === i && (ret = inverse(this)), ret;
      });
      instance.registerHelper("if", function(a, options) {
        return isFunction(a) && (a = a.call(this)), !options.hash.includeZero && !a || Utils.isEmpty(a) ? options.inverse(this) : options.fn(this);
      });
      instance.registerHelper("unless", function(fake, options) {
        return instance.helpers["if"].call(this, fake, {
          fn : options.inverse,
          inverse : options.fn,
          hash : options.hash
        });
      });
      instance.registerHelper("with", function(context, options) {
        if (isFunction(context)) {
          context = context.call(this);
        }
        var fn = options.fn;
        if (Utils.isEmpty(context)) {
          return options.inverse(this);
        }
        if (options.data && options.ids) {
          var frame = createFrame(options.data);
          frame.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
          options = {
            data : frame
          };
        }
        return fn(context, options);
      });
      instance.registerHelper("log", function(context, options) {
        /** @type {number} */
        var level = options.data && null != options.data.level ? parseInt(options.data.level, 10) : 1;
        instance.log(level, context);
      });
      instance.registerHelper("lookup", function(buf, off) {
        return buf && buf[off];
      });
    }
    var __exports__ = {};
    /** @type {Object} */
    var Utils = regex;
    var Exception = not;
    /** @type {string} */
    var VERSION = "2.0.0";
    /** @type {string} */
    __exports__.VERSION = VERSION;
    /** @type {number} */
    var COMPILER_REVISION = 6;
    /** @type {number} */
    __exports__.COMPILER_REVISION = COMPILER_REVISION;
    var REVISION_CHANGES = {
      1 : "<= 1.0.rc.2",
      2 : "== 1.0.0-rc.3",
      3 : "== 1.0.0-rc.4",
      4 : "== 1.x.x",
      5 : "== 2.0.0-alpha.x",
      6 : ">= 2.0.0-beta.1"
    };
    __exports__.REVISION_CHANGES = REVISION_CHANGES;
    var isArray = Utils.isArray;
    var isFunction = Utils.isFunction;
    var toString = Utils.toString;
    /** @type {string} */
    var objectType = "[object Object]";
    /** @type {function (Object, ?): undefined} */
    __exports__.HandlebarsEnvironment = HandlebarsEnvironment;
    HandlebarsEnvironment.prototype = {
      /** @type {function (Object, ?): undefined} */
      constructor : HandlebarsEnvironment,
      logger : logger,
      log : log,
      /**
       * @param {string} name
       * @param {Function} helper
       * @return {undefined}
       */
      registerHelper : function(name, helper) {
        if (toString.call(name) === objectType) {
          if (helper) {
            throw new Exception("Arg not supported with multiple helpers");
          }
          Utils.extend(this.helpers, name);
        } else {
          /** @type {Function} */
          this.helpers[name] = helper;
        }
      },
      /**
       * @param {?} name
       * @return {undefined}
       */
      unregisterHelper : function(name) {
        delete this.helpers[name];
      },
      /**
       * @param {string} name
       * @param {?} str
       * @return {undefined}
       */
      registerPartial : function(name, str) {
        if (toString.call(name) === objectType) {
          Utils.extend(this.partials, name);
        } else {
          this.partials[name] = str;
        }
      },
      /**
       * @param {?} name
       * @return {undefined}
       */
      unregisterPartial : function(name) {
        delete this.partials[name];
      }
    };
    var logger = {
      methodMap : {
        0 : "debug",
        1 : "info",
        2 : "warn",
        3 : "error"
      },
      DEBUG : 0,
      INFO : 1,
      WARN : 2,
      ERROR : 3,
      level : 3,
      /**
       * @param {number} level
       * @param {?} obj
       * @return {undefined}
       */
      log : function(level, obj) {
        if (logger.level <= level) {
          var method = logger.methodMap[level];
          if ("undefined" != typeof console) {
            if (console[method]) {
              console[method].call(console, obj);
            }
          }
        }
      }
    };
    __exports__.logger = logger;
    /** @type {function (number, ?): undefined} */
    var log = logger.log;
    /** @type {function (number, ?): undefined} */
    __exports__.log = log;
    /**
     * @param {Object} object
     * @return {?}
     */
    var createFrame = function(object) {
      var item = Utils.extend({}, object);
      return item._parent = object, item;
    };
    return __exports__.createFrame = createFrame, __exports__;
  }(r20, not);
  var udataCur = function(regex, not, __dependency3__) {
    /**
     * @param {Object} compilerInfo
     * @return {undefined}
     */
    function checkRevision(compilerInfo) {
      var unlock = compilerInfo && compilerInfo[0] || 1;
      var revision = COMPILER_REVISION;
      if (unlock !== revision) {
        if (revision > unlock) {
          var versions = REVISION_CHANGES[revision];
          var cache = REVISION_CHANGES[unlock];
          throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + versions + ") or downgrade your runtime to an older version (" + cache + ").");
        }
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + compilerInfo[1] + ").");
      }
    }
    /**
     * @param {Object} options
     * @param {Object} env
     * @return {?}
     */
    function template(options, env) {
      if (!env) {
        throw new Exception("No environment passed to template");
      }
      if (!options || !options.main) {
        throw new Exception("Unknown template object: " + typeof options);
      }
      env.VM.checkRevision(options.compiler);
      /**
       * @param {string} node
       * @param {?} prefix
       * @param {string} name
       * @param {Text} data
       * @param {?} body
       * @param {Object} d
       * @param {?} partials
       * @param {Object} f
       * @param {Array} r
       * @return {?}
       */
      var template = function(node, prefix, name, data, body, d, partials, f, r) {
        if (body) {
          data = Utils.extend({}, data, body);
        }
        var result = env.VM.invokePartial.call(this, node, name, data, d, partials, f, r);
        if (null == result && env.compile) {
          var value = {
            helpers : d,
            partials : partials,
            data : f,
            depths : r
          };
          partials[name] = env.compile(node, {
            data : void 0 !== f,
            compat : options.compat
          }, env);
          result = partials[name](data, value);
        }
        if (null != result) {
          if (prefix) {
            var args = result.split("\n");
            /** @type {number} */
            var i = 0;
            var len = args.length;
            for (;len > i && (args[i] || i + 1 !== len);i++) {
              args[i] = prefix + args[i];
            }
            result = args.join("\n");
          }
          return result;
        }
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      };
      var self = {
        /**
         * @param {Array} keys
         * @param {?} y
         * @return {?}
         */
        lookup : function(keys, y) {
          var len = keys.length;
          /** @type {number} */
          var x = 0;
          for (;len > x;x++) {
            if (keys[x] && null != keys[x][y]) {
              return keys[x][y];
            }
          }
        },
        /**
         * @param {(Function|string)} arg
         * @param {string} space
         * @return {?}
         */
        lambda : function(arg, space) {
          return "function" == typeof arg ? arg.call(space) : arg;
        },
        escapeExpression : Utils.escapeExpression,
        /** @type {function (string, ?, string, Text, ?, Object, ?, Object, Array): ?} */
        invokePartial : template,
        /**
         * @param {Function} key
         * @return {?}
         */
        fn : function(key) {
          return options[key];
        },
        programs : [],
        /**
         * @param {Function} fn
         * @param {Function} context
         * @param {boolean} callback
         * @return {?}
         */
        program : function(fn, context, callback) {
          var programWrapper = this.programs[fn];
          var restoreScript = this.fn(fn);
          return context || callback ? programWrapper = program(this, fn, restoreScript, context, callback) : programWrapper || (programWrapper = this.programs[fn] = program(this, fn, restoreScript)), programWrapper;
        },
        /**
         * @param {Function} a
         * @param {Function} name
         * @return {?}
         */
        data : function(a, name) {
          for (;a && name--;) {
            a = a._parent;
          }
          return a;
        },
        /**
         * @param {?} first
         * @param {?} common
         * @return {?}
         */
        merge : function(first, common) {
          var ret = first || common;
          return first && (common && (first !== common && (ret = Utils.extend({}, common, first)))), ret;
        },
        noop : env.VM.noop,
        compilerInfo : options.compiler
      };
      /**
       * @param {string} name
       * @param {Object} args
       * @return {?}
       */
      var build = function(name, args) {
        args = args || {};
        var params = args.data;
        build._setup(args);
        if (!args.partial) {
          if (options.useData) {
            params = extend(name, params);
          }
        }
        var t;
        return options.useDepths && (t = args.depths ? [name].concat(args.depths) : [name]), options.main.call(self, name, self.helpers, self.partials, params, t);
      };
      return build.isTop = true, build._setup = function(data) {
        if (data.partial) {
          self.helpers = data.helpers;
          self.partials = data.partials;
        } else {
          self.helpers = self.merge(data.helpers, env.helpers);
          if (options.usePartial) {
            self.partials = self.merge(data.partials, env.partials);
          }
        }
      }, build._child = function(className, isXML, inplace) {
        if (options.useDepths && !inplace) {
          throw new Exception("must pass parent depths");
        }
        return program(self, className, options[className], isXML, inplace);
      }, build;
    }
    /**
     * @param {Object} self
     * @param {Function} i
     * @param {Function} callback
     * @param {Function} value
     * @param {boolean} data
     * @return {?}
     */
    function program(self, i, callback, value, data) {
      /**
       * @param {Object} err
       * @param {Object} options
       * @return {?}
       */
      var prog = function(err, options) {
        return options = options || {}, callback.call(self, err, self.helpers, self.partials, options.data || value, data && [err].concat(data));
      };
      return prog.program = i, prog.depth = data ? data.length : 0, prog;
    }
    /**
     * @param {number} partial
     * @param {string} name
     * @param {?} context
     * @param {Object} helpers
     * @param {?} partials
     * @param {Object} data
     * @param {Array} dataAndEvents
     * @return {?}
     */
    function invokePartial(partial, name, context, helpers, partials, data, dataAndEvents) {
      var options = {
        partial : true,
        helpers : helpers,
        partials : partials,
        data : data,
        depths : dataAndEvents
      };
      if (void 0 === partial) {
        throw new Exception("The partial " + name + " could not be found");
      }
      return partial instanceof Function ? partial(context, options) : void 0;
    }
    /**
     * @return {?}
     */
    function noop() {
      return "";
    }
    /**
     * @param {string} source
     * @param {Object} target
     * @return {?}
     */
    function extend(source, target) {
      return target && "root" in target || (target = target ? isFunction(target) : {}, target.root = source), target;
    }
    var __exports__ = {};
    /** @type {string} */
    var Utils = regex;
    var Exception = not;
    var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
    var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
    var isFunction = __dependency3__.createFrame;
    return __exports__.checkRevision = checkRevision, __exports__.template = template, __exports__.program = program, __exports__.invokePartial = invokePartial, __exports__.noop = noop, __exports__;
  }(r20, not, failuresLink);
  var f = function(el, dataAndEvents, not, regex, value) {
    var __exports__;
    var base = el;
    var SafeString = dataAndEvents;
    var Exception = not;
    /** @type {string} */
    var Utils = regex;
    /** @type {Object} */
    var runtime = value;
    /**
     * @return {?}
     */
    var create = function() {
      var hb = new base.HandlebarsEnvironment;
      return Utils.extend(hb, base), hb.SafeString = SafeString, hb.Exception = Exception, hb.Utils = Utils, hb.escapeExpression = Utils.escapeExpression, hb.VM = runtime, hb.template = function(name) {
        return runtime.template(name, hb);
      }, hb;
    };
    var Handlebars = create();
    return Handlebars.create = create, Handlebars["default"] = Handlebars, __exports__ = Handlebars;
  }(failuresLink, dataAndEvents, not, r20, udataCur);
  return f;
}), define("core/config/urls", ["common/urls"], function(dataAndEvents) {
  return dataAndEvents;
}), define("core/extensions/handlebars.helpers", ["handlebars", "moment", "core/strings", "core/config/urls"], function(Handlebars, gm, doc, initVal) {
  var Utils = Handlebars.Utils;
  return Handlebars.registerHelper("any", function() {
    /** @type {number} */
    var argLength = arguments.length;
    /** @type {number} */
    var elementArgumentPos = 0;
    for (;argLength - 1 > elementArgumentPos;elementArgumentPos++) {
      if (arguments[elementArgumentPos]) {
        return arguments[elementArgumentPos];
      }
    }
  }), Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  }), Handlebars.registerHelper("ne", function(newValue, oldValue) {
    return newValue !== oldValue;
  }), Handlebars.registerHelper("gt", function(a, b) {
    return a > b;
  }), Handlebars.registerHelper("lt", function(b, a) {
    return a > b;
  }), Handlebars.registerHelper("ge", function(dataAndEvents, deepDataAndEvents) {
    return dataAndEvents >= deepDataAndEvents;
  }), Handlebars.registerHelper("le", function(dataAndEvents, deepDataAndEvents) {
    return deepDataAndEvents >= dataAndEvents;
  }), Handlebars.registerHelper("typeof", function(mL, number) {
    return typeof mL === number;
  }), Handlebars.registerHelper("notNull", function(dataAndEvents) {
    return null !== dataAndEvents;
  }), Handlebars.registerHelper("if_any", function() {
    /** @type {number} */
    var n = arguments.length;
    var options = arguments[n - 1];
    /** @type {number} */
    var j = 0;
    for (;n - 1 > j;j++) {
      if (arguments[j]) {
        return options.fn(this);
      }
    }
    return options.inverse(this);
  }), Handlebars.registerHelper("if_all", function() {
    /** @type {number} */
    var n = arguments.length;
    var options = arguments[n - 1];
    /** @type {number} */
    var j = 0;
    for (;n - 1 > j;j++) {
      if (!arguments[j]) {
        return options.inverse(this);
      }
    }
    return options.fn(this);
  }), Handlebars.registerHelper("getPartial", function(name, attributes, options) {
    return "undefined" == typeof options && (options = attributes, attributes = this, Handlebars.Utils.extend(attributes, options.hash)), new Handlebars.SafeString(Handlebars.partials[name](attributes, options));
  }), Handlebars.registerHelper("gettext", function() {
    var result;
    var tagRegex;
    var dataItem;
    var line;
    /** @type {number} */
    var argLength = arguments.length;
    var that = arguments[argLength - 1];
    var data = that.hash;
    var optgroup = arguments[0];
    var callbacks = Handlebars.partials;
    optgroup = doc.get(optgroup);
    for (dataItem in data) {
      if (data.hasOwnProperty(dataItem)) {
        /** @type {RegExp} */
        tagRegex = new RegExp("%\\((" + dataItem + ")\\)s", "gm");
        result = data[dataItem];
        line = result && result.executePartial;
        if (line) {
          result = callbacks[result.partial].call(this, result.context, that);
        }
        if (void 0 === result || (null === result || "number" == typeof result && isNaN(result))) {
          /** @type {string} */
          result = "";
        } else {
          if (!line) {
            result = Utils.escapeExpression(result);
          }
        }
        optgroup = optgroup.replace(tagRegex, result.toString());
      }
    }
    return new Handlebars.SafeString(optgroup);
  }), Handlebars.registerHelper("urlfor", function(pair) {
    var splits = pair.split(".");
    var l = splits.length;
    /** @type {Object} */
    var curr = initVal;
    /** @type {number} */
    var i = 0;
    for (;curr.hasOwnProperty(splits[i]) && l > i;) {
      curr = curr[splits[i]];
      i++;
    }
    return curr;
  }), Handlebars.registerHelper("html", function(classNames) {
    return new Handlebars.SafeString(classNames || "");
  }), Handlebars.registerHelper("partial", function(name, options) {
    Handlebars.registerPartial(name, options.fn);
  }), Handlebars.registerHelper("with", function() {
    /** @type {number} */
    var argLength = arguments.length;
    var template = arguments[argLength - 1];
    var data = arguments[0];
    return 3 === argLength ? (data = {}, data[arguments[0]] = arguments[1]) : "_window_" === data && (data = window), template.fn(data);
  }), Handlebars.registerHelper("each", function(context, options) {
    var data;
    var fn = options.fn;
    var inverse = options.inverse;
    /** @type {number} */
    var i = 0;
    /** @type {string} */
    var ret = "";
    if (options.data && (data = Handlebars.createFrame(options.data)), context && "object" == typeof context) {
      if ("[object Array]" === Object.prototype.toString.call(context)) {
        var j = context.length;
        for (;j > i;i++) {
          if (data) {
            /** @type {number} */
            data.index = i;
            data.length = context.length;
          }
          ret += fn(context[i], {
            data : data
          });
        }
      } else {
        var key;
        for (key in context) {
          if (context.hasOwnProperty(key)) {
            if (data) {
              /** @type {string} */
              data.key = key;
            }
            ret += fn(context[key], {
              data : data
            });
            i++;
          }
        }
      }
    }
    return 0 === i && (ret = inverse(this)), ret;
  }), Handlebars.registerHelper("log", function(val) {
    window.console.log(val, this);
  }), Handlebars.registerHelper("debug", function() {
  }), Handlebars.registerHelper("geturl", function(dataAndEvents) {
    return dataAndEvents;
  }), Handlebars.registerHelper("truncate", function(input, limit) {
    return input.length <= limit ? input : new Handlebars.SafeString(Utils.escapeExpression(input.slice(0, limit)) + "&hellip;");
  }), Handlebars.registerHelper("tag", function(dataAndEvents, el) {
    /** @type {Array} */
    var tagNameArr = ["<" + dataAndEvents];
    var title = el.hash.text;
    delete el.hash.text;
    var prop;
    for (prop in el.hash) {
      if (el.hash.hasOwnProperty(prop)) {
        tagNameArr.push(" " + prop + '="' + el.hash[prop] + '"');
      }
    }
    return tagNameArr.push(">" + title + "</" + dataAndEvents + ">"), new Handlebars.SafeString(tagNameArr.join(""));
  }), Handlebars.registerHelper("now", function(value) {
    return gm().format(value);
  }), Handlebars;
}), define("common/templates", ["handlebars", "core/extensions/handlebars.helpers"], function(instance) {
  /**
   * @param {string} name
   * @param {Object} opt_attributes
   * @return {?}
   */
  function del(name, opt_attributes) {
    return instance.partials[name](opt_attributes || {});
  }
  /**
   * @param {?} name
   * @return {?}
   */
  function getTemplate(name) {
    return instance.partials[name];
  }
  return{
    /** @type {function (string, Object): ?} */
    render : del,
    /** @type {function (?): ?} */
    getTemplate : getTemplate
  };
}), define("lounge/views/recommend-button", ["jquery", "underscore", "backbone", "core/utils/storage", "common/templates"], function(dataAndEvents, deepDataAndEvents, Backbone, b, res) {
  var self = Backbone.View.extend({
    className : "thread-likes",
    events : {
      "click [data-action=recommend]" : "recommendHandler"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
      this.thread = req.thread;
      this.loggedOutRecommendFlag = this.session.getLoggedOutUserFlags().get(self.ONBOARDING_KEY);
      this.listenTo(this.thread, "change:userScore", this.render);
      this.listenTo(this.thread, "change:likes", this.render);
      this.listenTo(this.session, "change:id", this.startRecommendOnboarding);
      this.setTooltipEnabled();
    },
    /**
     * @return {undefined}
     */
    setTooltipEnabled : function() {
      this.tooltipEnabled = this.session.isLoggedIn() ? b.get(self.ONBOARDING_KEY) : !this.loggedOutRecommendFlag.isRead();
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(res.render("threadVotes", {
        thread : this.thread.toJSON(),
        user : this.session.toJSON(),
        loggedIn : this.session.isLoggedIn()
      })), this;
    },
    /**
     * @return {undefined}
     */
    startRecommendOnboarding : function() {
      if (this.session.user.get("joinedRecently")) {
        b.set(self.ONBOARDING_KEY, "true");
      }
      this.setTooltipEnabled();
    },
    /**
     * @param {?} event
     * @return {undefined}
     */
    recommendHandler : function(event) {
      event.stopPropagation();
      event.preventDefault();
      /** @type {boolean} */
      var udataCur = 0 === this.thread.get("userScore");
      this.trigger(udataCur ? "vote:like" : "vote:unlike");
      this.thread.vote(udataCur ? 1 : 0);
      this.toggleTooltip(udataCur);
      if (this.tooltipEnabled) {
        if (udataCur) {
          this.markAsSeen();
        }
      }
    },
    /**
     * @return {undefined}
     */
    markAsSeen : function() {
      if (this.session.isLoggedIn()) {
        b.remove(self.ONBOARDING_KEY);
      } else {
        this.loggedOutRecommendFlag.markRead();
      }
    },
    /**
     * @param {boolean} value
     * @return {undefined}
     */
    toggleTooltip : function(value) {
      if (this.tooltipEnabled) {
        if (value) {
          this.$el.parent().addClass("open");
        } else {
          this.$el.parent().removeClass("open");
        }
      }
    }
  }, {
    ONBOARDING_KEY : "showRecommendOnboarding"
  });
  return self;
}), define("common/collections/LoggedOutCache", ["underscore", "backbone", "common/cached-storage", "lounge/views/recommend-button"], function(deepDataAndEvents, Backbone, dataAndEvents, $routeParams) {
  /** @type {Array} */
  var LOGGED_OUT_NOTES = [{
    id : "welcome",
    title : "",
    body : ""
  }];
  /** @type {Array} */
  var LOGGED_OUT_FLAGS = [{
    id : $routeParams.ONBOARDING_KEY
  }];
  var storageObject = new dataAndEvents("notes", 7776E3);
  var Model = Backbone.Model.extend({
    /**
     * @return {undefined}
     */
    markRead : function() {
      storageObject.setItem(this.id, true);
    },
    /**
     * @return {?}
     */
    isRead : function() {
      return Boolean(storageObject.getItem(this.id));
    }
  });
  var Collection = Backbone.Collection.extend({
    /**
     * @param {?} contentHTML
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(contentHTML, req) {
      this.session = req.session;
    },
    model : Model,
    /**
     * @return {?}
     */
    markAllRead : function() {
      return this.each(function(dataAndEvents) {
        dataAndEvents.markRead();
      }), this.session.set("notificationCount", 0), this;
    },
    /**
     * @return {?}
     */
    getUnread : function() {
      return this.filter(function(messageItem) {
        return!messageItem.isRead();
      });
    }
  });
  return{
    storage : storageObject,
    Collection : Collection,
    Model : Model,
    LOGGED_OUT_NOTES : LOGGED_OUT_NOTES,
    LOGGED_OUT_FLAGS : LOGGED_OUT_FLAGS
  };
}), define("core/utils/html", ["jquery", "underscore"], function(value, _) {
  var unCamelCase = function() {
    var val = value("<div>");
    return _.bind(val.html, val);
  }();
  /** @type {RegExp} */
  var trimLeft = /<\/?p>|<br\/?>/gi;
  return{
    /**
     * @param {string} str
     * @return {?}
     */
    stripTags : function(str) {
      return str = str.replace(trimLeft, " ").replace(/<[\/\w!\[][^>]*>/g, "\u00e2\u20ac\u2039"), value.trim(unCamelCase(str).text().replace(/\u200b/g, ""));
    },
    /**
     * @param {?} s
     * @param {?} proceed
     * @return {?}
     */
    replaceAnchors : function(s, proceed) {
      var doc;
      try {
        /** @type {(Document|null)} */
        doc = (new window.DOMParser).parseFromString(s, "text/html");
      } catch (e) {
      }
      return doc || (doc = document.implementation.createHTMLDocument(""), doc.body.innerHTML = s), _.each(doc.querySelectorAll("a"), function(element) {
        var title = element.getAttribute("href") || "";
        var text = element.innerHTML;
        var value = proceed(element);
        if (0 === title.indexOf(text.slice(0, -3))) {
          text = value;
        } else {
          if (title.length && -1 !== text.indexOf(title)) {
            text = text.replace(title, value);
          } else {
            text += " " + value;
          }
        }
        element.insertAdjacentHTML("afterend", text);
        element.parentNode.removeChild(element);
      }), doc.body.innerHTML.trim();
    }
  };
}), define("core/advice", ["underscore"], function(_) {
  /**
   * @return {undefined}
   */
  function longscroll() {
    _.each(["before", "after", "around"], function(m) {
      /**
       * @param {?} method
       * @param {?} fn
       * @return {?}
       */
      this[m] = function(method, fn) {
        return this[method] = "function" == typeof this[method] ? advice[m](this[method], fn) : fn;
      };
    }, this);
  }
  var advice = {
    /**
     * @param {string} method
     * @param {Function} fn
     * @return {?}
     */
    around : function(method, fn) {
      return function() {
        var args = _.toArray(arguments);
        return fn.apply(this, [_.bind(method, this)].concat(args));
      };
    },
    /**
     * @param {string} base
     * @param {Function} fn
     * @return {?}
     */
    before : function(base, fn) {
      return advice.around(base, function() {
        var args = _.toArray(arguments);
        var wrapper = args.shift();
        return fn.apply(this, args), wrapper.apply(this, args);
      });
    },
    /**
     * @param {string} base
     * @param {Function} fn
     * @return {?}
     */
    after : function(base, fn) {
      return advice.around(base, function() {
        var args = _.toArray(arguments);
        var wrapper = args.shift();
        var params = wrapper.apply(this, args);
        return fn.apply(this, args), params;
      });
    }
  };
  return{
    /** @type {function (): undefined} */
    withAdvice : longscroll
  };
}), define("core/models/mixins", ["underscore", "moment", "core/time"], function(_, callback, model) {
  /**
   * @return {undefined}
   */
  function setup() {
    this._getCreatedMoment = _.memoize(function() {
      var value = this.get("createdAt");
      if (value) {
        return callback(model.assureTzOffset(value), model.ISO_8601);
      }
    }, function() {
      return this.get("createdAt");
    });
    /**
     * @return {?}
     */
    this.getRelativeCreatedAt = function() {
      var message = this._getCreatedMoment();
      return message && message.from(Number(new Date));
    };
    this.getFormattedCreatedAt = _.memoize(function() {
      var stringPrettyPrinter = this._getCreatedMoment();
      return stringPrettyPrinter && stringPrettyPrinter.format("LLLL");
    }, function() {
      return this.get("createdAt");
    });
  }
  return{
    /** @type {function (): undefined} */
    withCreatedAt : setup
  };
}), define("core/collections/UserCollection", ["jquery", "underscore", "backbone", "core/models/User"], function($q, dataAndEvents, Backbone, associatedModel) {
  var e = Backbone.Collection.extend({
    /** @type {Function} */
    model : associatedModel,
    /**
     * @param {?} contentHTML
     * @param {Object} data
     * @return {undefined}
     */
    initialize : function(contentHTML, data) {
      Backbone.Collection.prototype.initialize.apply(this, arguments);
      this.thread = data && data.thread;
    },
    /**
     * @return {?}
     */
    fetch : function() {
      return $q.when(true);
    }
  });
  return e;
}), define("core/collections/UpvotersUserCollection", ["underscore", "backbone", "core/api", "core/collections/UserCollection"], function(model, Backbone, compilationUnit, $) {
  var e = $.extend({
    LIMIT : 50,
    /**
     * @return {?}
     */
    url : function() {
      return compilationUnit.getURL("posts/listUsersVotedPost");
    },
    /**
     * @param {?} contentHTML
     * @param {?} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      this.postId = options.postId;
      this.threadId = options.threadId;
    },
    /**
     * @param {?} options
     * @return {?}
     */
    fetch : function(options) {
      return Backbone.Collection.prototype.fetch.call(this, model.extend({
        data : {
          post : this.postId,
          thread : this.threadId,
          vote : 1,
          limit : this.LIMIT
        }
      }, options));
    }
  });
  return e;
}), define("core/models/Vote", ["backbone"], function(Backbone) {
  var b = Backbone.Model.extend({
    defaults : {
      score : 0
    }
  });
  return b;
}), define("core/collections/VoteCollection", ["backbone", "core/models/Vote"], function(Backbone, associatedModel) {
  var c = Backbone.Collection.extend({
    /** @type {Function} */
    model : associatedModel
  });
  return c;
}), define("core/models/Post", ["jquery", "underscore", "backbone", "moment", "core/api", "core/strings", "core/time", "core/utils", "core/utils/html", "core/advice", "core/models/mixins", "core/models/User", "core/collections/UserCollection", "core/collections/UpvotersUserCollection", "core/collections/VoteCollection"], function(params, _, Backbone, done, test, instance, results, User, gridStore, advice, testEnvironment, deepDataAndEvents, ignoreMethodDoesntExist, dataAndEvents, AppRouter) {
  /** @type {number} */
  var p = 1E3;
  /** @type {number} */
  var aux = 0;
  /**
   * @return {?}
   */
  var throttled = function() {
    var max = params.now();
    return p > max - aux ? false : (aux = max, true);
  };
  var validator = instance.get;
  var JsonWorker = Backbone.Model.extend({
    /** @type {Function} */
    upvotersCollectionClass : dataAndEvents,
    /**
     * @return {?}
     */
    defaults : function() {
      return{
        createdAt : done().format(results.ISO_8601),
        dislikes : 0,
        isApproved : true,
        isDeleted : false,
        isEdited : false,
        isFlagged : false,
        isFlaggedByUser : false,
        isHighlighted : false,
        isRealtime : false,
        isImmediateReply : false,
        isMinimized : null,
        hasMedia : false,
        message : null,
        raw_message : null,
        likes : 0,
        media : [],
        parent : null,
        points : 0,
        depth : 0,
        userScore : 0
      };
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      this.votes = new AppRouter;
    },
    /**
     * @return {?}
     */
    messageText : function() {
      var data = this.get("message");
      return data && gridStore.stripTags(data);
    },
    /**
     * @return {?}
     */
    relatedIds : function() {
      var result = this.get("forum");
      if (_.isObject(result)) {
        result = result.id;
      }
      var t = this.get("thread");
      return _.isObject(t) && (t = t.id), {
        forum : result,
        thread : t,
        post : this.id
      };
    },
    /**
     * @param {Function} a
     * @param {Function} name
     * @return {?}
     */
    permalink : function(a, name) {
      var id = this.id;
      if (!id || !a) {
        return "";
      }
      var TS_CSS = name !== false && a.currentUrl || a.permalink();
      /** @type {Element} */
      var link = document.createElement("a");
      return link.href = TS_CSS, link.hash = "#comment-" + id, link.href;
    },
    /**
     * @param {Array} newlines
     * @return {?}
     */
    twitterText : function(newlines) {
      /** @type {number} */
      var camelKey = 140;
      var codeSegments = this.author.get("name") || this.author.get("username");
      camelKey -= codeSegments.length + 3;
      camelKey -= newlines.length + 1;
      camelKey -= 2;
      var data = User.niceTruncate(this.messageText(), camelKey);
      return'"' + data + '" \u00e2\u20ac\u201d ' + codeSegments;
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    toJSON : function(a) {
      var result = Backbone.Model.prototype.toJSON.call(this);
      if (a) {
        var e = a.session;
        var QUnit = a.thread;
        result.canBeEdited = this.canBeEdited(e, QUnit);
        result.canBeRepliedTo = this.canBeRepliedTo(e, QUnit);
        result.canBeShared = this.canBeShared();
        result.permalink = this.permalink(QUnit);
      }
      return result.isMinimized = this.isMinimized(), result.plaintext = this.messageText(), result.relativeCreatedAt = this.getRelativeCreatedAt(), result.formattedCreatedAt = this.getFormattedCreatedAt(), result.cid = this.cid, result;
    },
    /**
     * @return {?}
     */
    isPublic : function() {
      return this.get("isHighlighted") || this.get("isSponsored") ? true : this.get("isDeleted") ? false : this.get("isApproved");
    },
    /**
     * @return {?}
     */
    isMinimized : function() {
      return this.get("isHighlighted") ? false : this.get("isMinimized") === false ? false : !this.get("isApproved");
    },
    /**
     * @return {?}
     */
    isAuthorSessionUser : function() {
      return false;
    },
    /**
     * @return {?}
     */
    canBeEdited : function() {
      return false;
    },
    /**
     * @return {?}
     */
    canBeRepliedTo : function() {
      return false;
    },
    /**
     * @return {?}
     */
    canBeShared : function() {
      return false;
    },
    /**
     * @param {Object} data
     * @return {?}
     */
    validate : function(data) {
      if (!this.id && !data.id) {
        if (_.isString(data.raw_message)) {
          if ("" === data.raw_message) {
            return validator("Comments can't be blank.");
          }
          if (data.raw_message.length < 2) {
            return validator("Comments must have at least 2 characters.");
          }
        }
        return data.author_email && (data.author_email = params.trim(data.author_email)), data.author_name && (data.author_name = params.trim(data.author_name)), "" === data.author_email && "" === data.author_name ? validator("Please sign in or enter a name and email address.") : "" === data.author_email || "" === data.author_name ? validator("Please enter both a name and email address.") : _.isString(data.author_email) && !this.validateEmail(data.author_email) ? validator("Invalid email address format.") : 
        void 0;
      }
    },
    /**
     * @param {?} email
     * @return {?}
     */
    validateEmail : function(email) {
      return User.validateEmail(email);
    },
    /**
     * @return {undefined}
     */
    report : function() {
      this.set("isFlagged", true);
      test.call("posts/report.json", {
        data : {
          post : this.id
        },
        method : "POST"
      });
    },
    /**
     * @param {boolean} recurring
     * @return {undefined}
     */
    _highlight : function(recurring) {
      this.set("isHighlighted", recurring);
      test.call("posts/" + (recurring ? "highlight" : "unhighlight") + ".json", {
        data : {
          post : this.id
        },
        method : "POST"
      });
    },
    /**
     * @return {undefined}
     */
    highlight : function() {
      this._highlight(true);
    },
    /**
     * @return {undefined}
     */
    unhighlight : function() {
      this._highlight(false);
    },
    /**
     * @return {?}
     */
    getThreadId : function() {
      return this.get("thread");
    },
    getUpvotersUserCollection : _.memoize(function() {
      var upvotersCollectionClass = this.upvotersCollectionClass;
      return new upvotersCollectionClass(void 0, {
        postId : this.id,
        threadId : this.getThreadId()
      });
    }, function() {
      return this.id;
    }),
    /**
     * @param {number} recurring
     * @param {number} n
     * @param {(Node|string)} protoProps
     * @return {?}
     */
    _vote : function(recurring, n, protoProps) {
      /** @type {number} */
      var i = recurring - n;
      var reqUrl = {
        likes : this.get("likes"),
        dislikes : this.get("dislikes"),
        points : this.get("points")
      };
      return 0 === i ? i : (recurring > 0 ? (reqUrl.likes += recurring, reqUrl.dislikes += n) : 0 > recurring ? (reqUrl.dislikes -= recurring, reqUrl.likes -= n) : n > 0 ? reqUrl.likes -= n : reqUrl.dislikes += n, reqUrl.points += i, protoProps && this.getUpvotersUserCollection()[recurring > 0 ? "add" : "remove"](protoProps), this.set(reqUrl), i);
    },
    /**
     * @param {Object} recurring
     * @return {?}
     */
    vote : function(recurring) {
      if (!throttled()) {
        return 0;
      }
      var $scope = this;
      var c = $scope._vote(recurring, $scope.get("userScore"));
      if (0 !== c) {
        $scope.set("userScore", recurring);
        test.call("posts/vote.json", {
          data : {
            post : $scope.id,
            vote : recurring
          },
          method : "POST",
          /**
           * @param {Function} a
           * @return {undefined}
           */
          success : function(a) {
            $scope.votes.add({
              id : a.response.id,
              score : recurring
            }, {
              merge : true
            });
          }
        });
      }
    },
    /**
     * @return {?}
     */
    _delete : function() {
      return this.set({
        isApproved : false,
        isDeleted : true
      }), test.call("posts/remove.json", {
        data : {
          post : this.id
        },
        method : "POST"
      });
    },
    /**
     * @return {undefined}
     */
    spam : function() {
      this.set({
        isApproved : false,
        isDeleted : true,
        isSpam : true
      });
      this.trigger("spam");
      test.call("posts/spam.json", {
        data : {
          post : this.id
        },
        method : "POST"
      });
    },
    /**
     * @param {Object} element
     * @param {Object} options
     * @return {?}
     */
    _create : function(element, options) {
      var that = this;
      var data = element.attributes;
      var params = {
        thread : data.thread,
        message : data.raw_message
      };
      if (data.parent) {
        params.parent = data.parent;
      }
      if (data.author_name) {
        params.author_name = data.author_name;
        params.author_email = data.author_email;
      }
      var i = options.uploadTokens;
      return i && (i.length && (params.upload_token = i)), test.call("posts/create.json", {
        data : params,
        method : "POST",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          that.set(a.response);
          if (options.success) {
            options.success();
          }
        },
        error : options.error
      });
    },
    /**
     * @param {Object} element
     * @param {Object} options
     * @return {?}
     */
    _update : function(element, options) {
      var that = this;
      var attributes = element.attributes;
      var data = {
        post : attributes.id,
        message : attributes.raw_message
      };
      return test.call("posts/update.json", {
        data : data,
        method : "POST",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          that.set(a.response);
          if (options.success) {
            options.success();
          }
        },
        error : options.error
      });
    },
    /**
     * @param {Object} path
     * @param {Object} options
     * @return {?}
     */
    _read : function(path, options) {
      var that = this;
      return options = options || {}, test.call("posts/details.json", {
        data : {
          post : that.id
        },
        method : "GET",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          that.set(a.response);
          if (options.success) {
            options.success();
          }
        },
        error : options.error
      });
    },
    /**
     * @param {string} method
     * @param {Object} target
     * @param {Object} options
     * @return {?}
     */
    sync : function(method, target, options) {
      options = options || {};
      var error = options.error;
      switch(error && (options.error = function(a) {
        error(JSON.parse(a.responseText || "{}"));
      }), method) {
        case "create":
          return this._create(target, options);
        case "update":
          return this._update(target, options);
        case "delete":
          return this._delete();
        case "read":
          return this._read(target, options);
      }
    },
    /**
     * @param {string} index
     * @return {?}
     */
    storageKey : function(index) {
      return this.isNew() && this.getThreadId() ? [index || "drafts", "thread", this.getThreadId(), "parent", this.get("parent") || 0].join(":") : void 0;
    }
  }, {
    formatMessage : function() {
      /** @type {RegExp} */
      var slashSplit = /(?:\r\n|\r|\n){2,}/;
      /** @type {RegExp} */
      var item = /\r\n|\r|\n/;
      return function(s) {
        var scripts = _.chain(s.split(slashSplit)).compact().value();
        var f = _.map(scripts, function(accessor) {
          return _.chain(accessor.split(item)).compact().map(_.escape).join("<br>").value();
        }).join("</p><p>");
        return "<p>" + f + "</p>";
      };
    }()
  });
  return testEnvironment.withCreatedAt.call(JsonWorker.prototype), advice.withAdvice.call(JsonWorker.prototype), JsonWorker.withAuthor = function(Todo) {
    this.around("set", function(callback, arg, value, tasks) {
      var data;
      if (null == arg) {
        return this;
      }
      if ("object" == typeof arg) {
        /** @type {(number|string)} */
        data = arg;
        /** @type {Element} */
        tasks = value;
      } else {
        data = {};
        /** @type {Element} */
        data[arg] = value;
      }
      var item = data.author;
      if (item) {
        if (_.isString(item) || _.isNumber(item)) {
          var result = item;
          item = {};
          item[Todo.prototype.idAttribute || "id"] = result;
        }
        this.author = new Todo(item);
        delete data.author;
      }
      return callback.call(this, data, tasks);
    });
    this.around("toJSON", function(matcherFunction) {
      var data = matcherFunction.apply(this, _.rest(arguments));
      return this.author && (data.author = this.author.toJSON()), data;
    });
  }, JsonWorker.withMediaCollection = function(media) {
    this.after("set", function(v) {
      if (v) {
        if ("string" != typeof v) {
          if (!_.isUndefined(v.media)) {
            if (this.media) {
              this.media.reset(v.media);
            } else {
              this.media = new media(v.media);
            }
            delete v.media;
          }
        }
      }
    });
    this.around("toJSON", function(matcherFunction) {
      var event = matcherFunction.apply(this, _.rest(arguments));
      return this.media && (event.media = this.media.toJSON()), event;
    });
  }, JsonWorker;
}), define("core/models/Thread", ["underscore", "backbone", "loglevel", "core/utils", "core/api", "core/config", "core/advice", "core/UniqueModel", "core/models/User"], function(_, Backbone, logger, async, test, utils, advice, c, object) {
  var $ = Backbone.Model;
  var that = $.prototype;
  var w = $.extend({
    defaults : {
      author : null,
      category : null,
      createdAt : null,
      forum : null,
      identifiers : [],
      ipAddress : null,
      isClosed : false,
      isDeleted : false,
      hasStreaming : false,
      link : null,
      message : null,
      slug : null,
      title : null,
      userSubscription : false,
      posts : 0,
      likes : 0,
      dislikes : 0,
      userScore : 0
    },
    /**
     * @param {?} contentHTML
     * @param {Object} parent
     * @return {undefined}
     */
    initialize : function(contentHTML, parent) {
      parent = parent || {};
      this.moderators = parent.moderators;
      this.forum = parent.forum;
      this.on("change:userScore", function() {
        var recurring = this.get("userScore");
        if (recurring > 0) {
          if (0 === this.get("likes")) {
            this.set("likes", recurring);
          }
        }
      }, this);
    },
    /**
     * @param {string} recurring
     * @param {number} max
     * @return {?}
     */
    _vote : function(recurring, max) {
      /** @type {number} */
      var n = recurring - max;
      return 0 === n ? n : (this.set("likes", this.get("likes") + n), n);
    },
    /**
     * @param {Object} recurring
     * @return {undefined}
     */
    vote : function(recurring) {
      var content = this;
      var c = content._vote(recurring, content.get("userScore"));
      if (0 !== c) {
        this.set("userScore", recurring);
        test.call("threads/vote.json", {
          data : {
            thread : this.id,
            vote : recurring
          },
          method : "POST",
          /**
           * @param {Function} a
           * @return {undefined}
           */
          success : function(a) {
            if (a.response.id) {
              content.trigger("vote:success", a);
            }
          }
        });
      }
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    fetch : function(options) {
      var thread;
      var self = this;
      var req = self.attributes;
      options = options || {};
      /** @type {string} */
      thread = req.identifier ? "ident:" + req.identifier : "link:" + req.url;
      test.call("threads/details.json", {
        data : {
          thread : thread,
          forum : req.forum
        },
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          self.set(a.response);
          if (options.success) {
            options.success();
          }
        },
        /**
         * @return {undefined}
         */
        error : function() {
          if (utils.debug) {
            self.save({}, {
              success : options.success
            });
          } else {
            logger.info("Couldn't find thread; not creating in production.");
          }
        }
      });
    },
    /**
     * @param {boolean} recurring
     * @param {Object} options
     * @return {?}
     */
    _toggleState : function(recurring, options) {
      if (!options) {
        options = {};
      }
      /** @type {string} */
      var _header = recurring ? "open.json" : "close.json";
      return this.set("isClosed", !recurring), test.call("threads/" + _header, {
        method : "POST",
        data : {
          thread : this.id
        },
        success : options.success,
        error : options.error
      });
    },
    /**
     * @param {string} method
     * @return {?}
     */
    open : function(method) {
      return this._toggleState(true, method);
    },
    /**
     * @param {Object} reason
     * @return {?}
     */
    close : function(reason) {
      return this._toggleState(false, reason);
    },
    /**
     * @return {undefined}
     */
    sync : function() {
      var self = this;
      var e = self.attributes;
      test.call("threads/create.json", {
        data : {
          title : e.title,
          forum : e.forum,
          identifier : e.identifier,
          url : e.url
        },
        method : "POST",
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          self.set(a.response);
        }
      });
    },
    /**
     * @param {number} opt_attributes
     * @return {undefined}
     */
    incrementPostCount : function(opt_attributes) {
      var v = this.get("posts") + opt_attributes;
      this.set("posts", v > 0 ? v : 0);
    },
    /**
     * @param {Object} item
     * @return {?}
     */
    isModerator : function(item) {
      var color;
      if (this.moderators) {
        return color = item instanceof object || _.isObject(item) ? item.id : item, color = parseInt(color, 10), _(this.moderators).contains(color);
      }
    },
    /**
     * @param {boolean} fn
     * @param {boolean} url
     * @return {?}
     */
    subscribe : function(fn, url) {
      /** @type {boolean} */
      fn = fn !== false;
      var el = this.get("userSubscription");
      if (el !== fn) {
        if (fn) {
          this.set("userSubscription", url || true);
        } else {
          this.set("userSubscription", false);
        }
        /** @type {string} */
        var value = fn ? "subscribe.json" : "unsubscribe.json";
        var result = {
          thread : this.id
        };
        return url ? result.email = url : fn || ("string" != typeof el || (result.email = el)), test.call("threads/" + value, {
          data : result,
          method : "POST"
        });
      }
    },
    /**
     * @return {?}
     */
    relatedIds : function() {
      var result = this.get("forum");
      return _.isObject(result) && (result = result.id), {
        forum : this.get("forum"),
        thread : this.id
      };
    },
    /**
     * @param {Array} newlines
     * @return {?}
     */
    twitterText : function(newlines) {
      /** @type {number} */
      var limit = 140 - (newlines.length + 1);
      var values = this.get("clean_title");
      return values = async.niceTruncate(values, limit);
    },
    /**
     * @return {?}
     */
    permalink : function() {
      return this.get("url") || (this.get("link") || this.currentUrl);
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      var item = that.toJSON.call(this);
      return item.permalink = this.permalink(), item;
    },
    /**
     * @param {Object} result
     * @return {?}
     */
    getDiscussionRoute : function(result) {
      /** @type {Array} */
      var expected = ["", "home", "discussion", this.forum.id, this.get("slug"), ""];
      return result = result || this.forum.channel, result && (result = result.attributes || result, expected.splice(2, 0, "channel", result.slug)), expected.join("/");
    }
  });
  return advice.withAdvice.call(w.prototype), w.withThreadVoteCollection = function(dataAndEvents) {
    this.after("initialize", function() {
      this.votes = new dataAndEvents;
      this.on("vote:success", function(e) {
        if (!this.votes.get(e.response.id)) {
          this.votes.add({
            id : e.response.id,
            score : e.response.vote,
            currentUser : true
          });
        }
      }, this);
    });
  }, w.withPostCollection = function(posts) {
    this.after("initialize", function(data) {
      data = data || {};
      this.posts = new posts(data.posts, {
        thread : this,
        cursor : data.postCursor,
        order : data.order,
        perPage : this.postsPerPage
      });
      this.listenTo(this.posts, "add reset", function(attributes) {
        attributes = attributes.models ? attributes.models : [attributes];
        if (this.users) {
          _.each(attributes, function(data) {
            if (!this.users.get(data.author.id)) {
              this.users.add(data.author);
            }
          });
        }
        this.recalculatePostCount();
      });
      this.listenTo(this.posts, "change:isDeleted change:isFlagged", function(dataAndEvents, deepDataAndEvents) {
        if (deepDataAndEvents) {
          this.incrementPostCount(-1);
        }
      });
    });
    /**
     * @return {undefined}
     */
    this.recalculatePostCount = function() {
      var recurring = this.get("posts");
      if (!(recurring > 50)) {
        recurring = this.posts.reduce(function(dataAndEvents, memDef) {
          return memDef.isPublic() ? dataAndEvents + 1 : dataAndEvents;
        }, 0);
        this.set("posts", recurring);
      }
    };
  }, c.addType("Thread", w), w;
}), define("core/models/Forum", ["backbone", "core/UniqueModel", "core/api"], function(Backbone, store, api) {
  var passedQuery = Backbone.Model.extend({
    defaults : {
      settings : {},
      followUrl : "forums/follow",
      unfollowUrl : "forums/unfollow",
      isFollowing : false
    },
    /**
     * @param {?} contentHTML
     * @param {?} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      if (options) {
        if (options.channel) {
          this.channel = options.channel;
        }
      }
    },
    /**
     * @param {string} one
     * @return {?}
     */
    _changeFollowingState : function(one) {
      return api.call(one, {
        method : "POST",
        data : {
          target : this.get("id")
        }
      });
    },
    /**
     * @return {?}
     */
    follow : function() {
      return this.set("isFollowing", true), this._changeFollowingState(this.get("followUrl"));
    },
    /**
     * @return {?}
     */
    unfollow : function() {
      return this.set("isFollowing", false), this._changeFollowingState(this.get("unfollowUrl"));
    },
    /**
     * @return {?}
     */
    toggleFollowed : function() {
      return this.channel && this.channel.get("options").isCurationOnlyChannel ? this.channel.toggleFollowed() : this.get("isFollowing") ? this.unfollow() : this.follow();
    }
  });
  return store.addType("Forum", passedQuery), passedQuery;
}), define("core/models/Media", ["underscore", "backbone", "core/api", "core/UniqueModel"], function(collection, Backbone, next_callback, store) {
  var passedQuery = Backbone.Model.extend({
    idAttribute : "url",
    defaults : {
      mediaType : null,
      html : "",
      htmlWidth : null,
      htmlHeight : null,
      thumbnailUrl : "",
      thumbnailWidth : null,
      thumbnailHeight : null,
      url : "",
      resolvedUrl : "",
      title : "",
      description : "",
      providerName : ""
    },
    /**
     * @param {Function} callback
     * @return {?}
     */
    parse : function(callback) {
      return callback.response;
    },
    /**
     * @param {string} method
     * @param {Object} model
     * @param {Object} options
     * @return {?}
     */
    sync : function(method, model, options) {
      if ("read" !== method) {
        throw new Error('Media models do not support methods other than "read".');
      }
      return next_callback.call("media/details.json", collection.extend({
        method : "POST",
        data : {
          url : this.get("url")
        }
      }, options));
    }
  }, {
    MEDIA_TYPES : {
      IMAGE : "1",
      IMAGE_UPLOAD : "2",
      YOUTUBE_VIDEO : "3",
      WEBPAGE : "4",
      TWITTER_STATUS : "5",
      FACEBOOK_PAGE : "6",
      FACEBOOK_POST : "7",
      FACEBOOK_PHOTO : "8",
      FACEBOOK_VIDEO : "9",
      SOUNDCLOUD_SOUND : "10",
      GOOGLE_MAP : "11",
      VIMEO_VIDEO : "12",
      VINE_VIDEO : "14"
    },
    WEBPAGE_TYPES : ["4", "6", "7"]
  });
  return store.addType("Media", passedQuery), passedQuery;
}), define("core/collections/MediaCollection", ["backbone", "core/models/Media"], function(Backbone, associatedModel) {
  var c = Backbone.Collection.extend({
    /** @type {Function} */
    model : associatedModel
  });
  return c;
}), define("common/utils", ["jquery", "underscore", "loglevel", "common/urls", "core/utils/cookies"], function($, _, utils, tree, res) {
  /** @type {HTMLDocument} */
  var doc = document;
  var self = {};
  /**
   * @param {?} y
   * @return {?}
   */
  self.globalUniqueId = function(y) {
    return _.uniqueId(y) + "_" + Number(new Date);
  };
  /**
   * @param {Array} hashtable
   * @return {undefined}
   */
  self.addStylesheetRules = function(hashtable) {
    /**
     * @return {?}
     */
    function process() {
      var sheet = _.find(doc.styleSheets, function(sheet) {
        var map = sheet.ownerNode || sheet.owningElement;
        return map.id === id;
      });
      if (!sheet) {
        return void window.setTimeout(process, 50);
      }
      /** @type {number} */
      var index = 0;
      var startOffset = hashtable.length;
      for (;startOffset > index;index++) {
        /** @type {number} */
        var i = 1;
        var matches = hashtable[index];
        var selector = matches[0];
        /** @type {string} */
        var declaration = "";
        if ("[object Array]" === Object.prototype.toString.call(matches[1][0])) {
          matches = matches[1];
          /** @type {number} */
          i = 0;
        }
        var l = matches.length;
        for (;l > i;i++) {
          var match = matches[i];
          declaration += match[0] + ":" + match[1] + (match[2] ? " !important" : "") + ";\n";
        }
        if (sheet.insertRule) {
          sheet.insertRule(selector + "{" + declaration + "}", sheet.cssRules.length);
        } else {
          sheet.addRule(selector, declaration, -1);
        }
      }
    }
    /** @type {string} */
    var id = "css_" + (new Date).getTime();
    /** @type {Element} */
    var element = doc.createElement("style");
    /** @type {string} */
    element.id = id;
    doc.getElementsByTagName("head")[0].appendChild(element);
    if (!window.createPopup) {
      element.appendChild(doc.createTextNode(""));
    }
    process();
  };
  var event = self.CORS = {
    /**
     * @param {boolean} event
     * @param {?} done
     * @param {number} token
     * @return {undefined}
     */
    handler : function(event, done, token) {
      if (event && (token >= 200 && 300 > token)) {
        event();
      } else {
        if (done) {
          if (200 > token || token >= 300) {
            done();
          }
        }
      }
    },
    /**
     * @param {string} method
     * @param {?} src
     * @param {Object} qualifier
     * @param {?} complete
     * @return {?}
     */
    XHR2 : function(method, src, qualifier, complete) {
      /** @type {function (boolean, ?, number): undefined} */
      var callback = event.handler;
      /** @type {XMLHttpRequest} */
      var xhr = new XMLHttpRequest;
      return xhr.open(method, src, true), xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          callback(qualifier, complete, xhr.status);
        }
      }, xhr;
    },
    /**
     * @param {string} method
     * @param {?} url
     * @param {Object} d
     * @param {Object} attributeName
     * @return {?}
     */
    XDR : function(method, url, d, attributeName) {
      if ("GET" !== method && "POST" !== method) {
        return null;
      }
      /** @type {function (boolean, ?, number): undefined} */
      var self = event.handler;
      /** @type {XDomainRequest} */
      var req = new XDomainRequest;
      return req.open(method, url), req.onload = _.bind(self, window, d, attributeName, 200), req.ontimeout = req.onerror = _.bind(self, window, d, attributeName, 500), req;
    }
  };
  event.request = function() {
    return "withCredentials" in new XMLHttpRequest ? event.XHR2 : window.XDomainRequest ? event.XDR : function() {
      return null;
    };
  }();
  /**
   * @param {Object} callback
   * @return {?}
   */
  self.isWindowClosed = function(callback) {
    if (!callback) {
      return true;
    }
    try {
      return callback.closed || void 0 === callback.closed;
    } catch (b) {
      return true;
    }
    return false;
  };
  /**
   * @param {string} str
   * @param {?} length
   * @param {string} truncateStr
   * @return {?}
   */
  self.truncate = function(str, length, truncateStr) {
    return truncateStr = truncateStr || "...", str.length > length ? str.slice(0, length) + truncateStr : str;
  };
  /**
   * @param {string} baseName
   * @return {?}
   */
  self.extractDomainForCookies = function(baseName) {
    return baseName.split("/")[2].replace(/\:[0-9]+/, "");
  };
  self.cookies = {
    domain : self.extractDomainForCookies(tree.root),
    /**
     * @param {Function} a
     * @param {Object} name
     * @return {undefined}
     */
    create : function(a, name) {
      /** @type {number} */
      var fbExpires = 31536E6;
      res.create(a, name, {
        domain : self.cookies.domain,
        expiresIn : fbExpires
      });
    },
    read : res.read,
    /**
     * @param {?} key
     * @return {undefined}
     */
    erase : function(key) {
      res.erase(key, {
        domain : self.cookies.domain
      });
    }
  };
  /**
   * @param {?} path
   * @param {Object} options
   * @return {?}
   */
  self.updateURL = function(path, options) {
    var req;
    /** @type {Element} */
    var a = doc.createElement("a");
    return options = options || {}, a.href = path, options.hostname && (options.hostname.match(/\.$/) && (options.hostname = options.hostname + a.hostname)), req = _.extend({
      protocol : a.protocol,
      hostname : a.hostname,
      pathname : a.pathname,
      search : a.search
    }, options), req.pathname.match(/^\//) || (req.pathname = "/" + req.pathname), req.protocol + "//" + req.hostname + req.pathname + req.search;
  };
  /**
   * @param {?} inUrl
   * @param {Object} d
   * @return {undefined}
   */
  self.injectBaseElement = function(inUrl, d) {
    d = d || doc;
    var a = d.getElementsByTagName("base")[0] || d.createElement("base");
    /** @type {string} */
    a.target = "_parent";
    if (inUrl) {
      a.href = inUrl;
    } else {
      a.removeAttribute("href");
    }
    if (!a.parentNode) {
      (d.head || d.getElementsByTagName("head")[0]).appendChild(a);
    }
  };
  self.syntaxHighlighter = function() {
    /**
     * @return {undefined}
     */
    function Deferred() {
      /** @type {null} */
      this.state = null;
      /** @type {Array} */
      this.queue = [];
    }
    /** @type {number} */
    var TRUE = 1;
    /** @type {number} */
    var state = 2;
    return _.extend(Deferred.prototype, {
      /**
       * @param {string} path
       * @return {undefined}
       */
      highlight : function(path) {
        if (null === this.state) {
          this._load();
        }
        this.queue.push(path);
        if (this.state === state) {
          this.scheduleHighlight();
        }
      },
      /**
       * @param {boolean} e
       * @return {undefined}
       */
      _highlight : function(e) {
        var requestUrl = $(e).html();
        $(e).html(requestUrl.replace(/^<br>/, ""));
        this._hljs.highlightBlock(e);
        this.scheduleHighlight();
      },
      /**
       * @return {undefined}
       */
      scheduleHighlight : function() {
        var item = this.queue.shift();
        if (item) {
          window.requestAnimationFrame(_.bind(this._highlight, this, item));
        }
      },
      /**
       * @return {undefined}
       */
      _load : function() {
        var e = this;
        /** @type {number} */
        e.state = TRUE;
        require(["highlight"], function(xhtml) {
          /** @type {number} */
          e.state = state;
          e._hljs = xhtml;
          e.scheduleHighlight();
        });
      }
    }), new Deferred;
  }();
  var dummy = $("body");
  /**
   * @return {?}
   */
  self.getPageHeight = function() {
    return dummy.height();
  };
  /**
   * @return {?}
   */
  self.calculatePositionFullscreen = function() {
    return{
      pageOffset : $(window).scrollTop(),
      height : doc.documentElement.clientHeight,
      frameOffset : {
        left : 0,
        top : 0
      }
    };
  };
  self.clickShouldBeLogged = function() {
    var style = {};
    /** @type {RegExp} */
    var r20 = /\#.*/;
    /**
     * @param {(Object|string)} $elem
     * @return {?}
     */
    var parseTransform = function($elem) {
      var tr = $elem.attr("data-tid");
      return tr || (tr = _.uniqueId(), $elem.attr("data-tid", tr)), tr;
    };
    return function(event, $elem) {
      if (event.isDefaultPrevented()) {
        return false;
      }
      if (!$elem.is("a")) {
        return false;
      }
      var pagerNum = ($elem.attr("href") || "").replace(r20, "");
      if (!pagerNum) {
        return false;
      }
      var transform = parseTransform($elem);
      /** @type {number} */
      var css = (new Date).getTime();
      return style[transform] && css - style[transform] < 500 ? void 0 : (style[transform] = css, true);
    };
  }();
  /**
   * @param {Event} e
   * @param {Element} $el
   * @return {?}
   */
  self.willOpenNewWindow = function(e, $el) {
    return $el || ($el = $(e.currentTarget)), "_blank" === $el.attr("target") || (e.ctrlKey || (e.metaKey || (e.shiftKey || e.altKey)));
  };
  /**
   * @param {string} $el
   * @param {Object} props
   * @return {undefined}
   */
  self.triggerClick = function($el, props) {
    var event;
    var p;
    var el = $el[0];
    var o = {
      altKey : false,
      button : 0,
      ctrlKey : false,
      metaKey : false,
      shiftKey : false
    };
    if (doc.createEvent) {
      if (event = doc.createEvent("MouseEvents"), props) {
        for (p in o) {
          if (o.hasOwnProperty(p)) {
            if (props.hasOwnProperty(p)) {
              o[p] = props[p];
            }
          }
        }
      }
      event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, o.ctrlKey, o.altKey, o.shiftKey, o.metaKey, 0, null);
      if (el.dispatchEvent) {
        el.dispatchEvent(event);
      }
    } else {
      if (doc.createEventObject) {
        if (event = doc.createEventObject(), event.eventType = "click", props) {
          for (p in o) {
            if (o.hasOwnProperty(p)) {
              if (props.hasOwnProperty(p)) {
                event[p] = props[p];
              }
            }
          }
        }
        el.fireEvent("onclick", event);
      }
    }
  };
  /**
   * @param {KeyboardEvent} options
   * @param {Object} d
   * @return {undefined}
   */
  self.delayLinkClick = function(options, d) {
    options.preventDefault();
    _.delay(_.bind(self.triggerClick, this, d, options.originalEvent), 100);
  };
  /**
   * @param {Function} data
   * @param {?} options
   * @param {?} configuration
   * @return {undefined}
   */
  self.mixin = function(data, options, configuration) {
    var to = data.prototype;
    var config = _.extend({}, options, configuration);
    if (_.defaults(to, config), _.defaults(to.events, config.events), void 0 !== to.initialize && void 0 !== config.initialize) {
      var matcherFunction = to.initialize;
      /**
       * @return {?}
       */
      to.initialize = function() {
        var a = matcherFunction.apply(this, arguments);
        return config.initialize.apply(this, arguments), a;
      };
    }
  };
  /**
   * @param {?} param
   * @param {string} dataAndEvents
   * @return {?}
   */
  self.extractService = function(param, dataAndEvents) {
    /** @type {string} */
    var selector = "[data-action^=" + dataAndEvents + "]";
    var target = $(param);
    target = target.is(selector) && target || target.closest(selector);
    var uHostName = target.attr("data-action") || ":";
    var extractService = uHostName.split(":")[1];
    return extractService;
  };
  /**
   * @return {?}
   */
  self.getFingerprint = function() {
    try {
      /** @type {number} */
      var r = (new Date).getTimezoneOffset();
      /** @type {number} */
      var g = 1;
      /** @type {(Screen|null)} */
      var target = window.screen;
      if (target && target.availWidth) {
        /** @type {number} */
        g = target.availWidth * target.availHeight + target.colorDepth;
      } else {
        if (target) {
          if (target.width) {
            /** @type {number} */
            g = target.width * target.height;
          }
        }
      }
      var el = el.documentElement;
      /** @type {number} */
      var actualValue = el.clientWidth * el.clientHeight;
      return Math.abs(17 * r + 25 * g - actualValue);
    } catch (f) {
      return 1;
    }
  };
  /**
   * @return {?}
   */
  self.random = function() {
    try {
      /** @type {Uint32Array} */
      var _rnds = new Uint32Array(1);
      return window.crypto.getRandomValues(_rnds)[0];
    } catch (b) {
      return Math.floor(1E9 * Math.random());
    }
  };
  /**
   * @return {?}
   */
  self.getNavigationTime = function() {
    if (window.performance && window.performance.timing) {
      /** @type {PerformanceTiming} */
      var t = window.performance.timing;
      /** @type {number} */
      var r = t.domainLookupEnd - t.domainLookupStart;
      /** @type {number} */
      var g = t.connectEnd - t.connectStart;
      /** @type {number} */
      var d = t.responseStart - t.navigationStart;
      return 11 * r + 13 * g + 17 * d;
    }
    return 1E5;
  };
  /**
   * @param {Object} elem
   * @return {?}
   */
  self.isIframed = function(elem) {
    try {
      return elem.self !== elem.top;
    } catch (b) {
      return true;
    }
  };
  /**
   * @param {Object} global
   * @return {?}
   */
  self.getConfigFromHash = function(global) {
    var result;
    var to = global.location.hash;
    try {
      /** @type {*} */
      result = JSON.parse(decodeURIComponent(String(to).substr(1)));
    } catch (key) {
      utils.debug("Failed to parse config from URL hash", key);
    }
    return _.isObject(result) ? result : {};
  };
  /** @type {RegExp} */
  var core_rnotwhite = /[<>]|\:\/\//;
  /**
   * @param {string} value
   * @return {?}
   */
  self.isPlainText = function(value) {
    return!value.match(core_rnotwhite);
  };
  /**
   * @param {Object} root
   * @return {?}
   */
  self.isDNTEnabled = function(root) {
    return root || (root = window), "1" === root.navigator.doNotTrack || ("yes" === root.navigator.doNotTrack || "1" === root.navigator.msDoNotTrack);
  };
  /**
   * @param {?} m1
   * @return {?}
   */
  self.shouldSample = function(m1) {
    /** @type {number} */
    var charCodeToReplace = parseInt(m1, 10);
    return charCodeToReplace ? charCodeToReplace > 100 ? false : Math.random() < charCodeToReplace / 100 : false;
  };
  /**
   * @return {?}
   */
  self.decorate = function() {
    var context;
    var msgs = _.toArray(arguments);
    var method = msgs.pop();
    return _.isFunction(method) || (context = method, method = msgs.pop()), _.reduceRight(msgs, function(name, fn) {
      return fn.call(context || this, name);
    }, function() {
      return method.apply(context || this, arguments);
    });
  };
  var $body = $("body");
  return self.loadPixels = function(attributes) {
    _.each(attributes, function(request) {
      var emitter = request.tag;
      var path = request.url;
      if ("img" === emitter || "iframe" === emitter) {
        $("<" + emitter + ">").hide().attr("src", path).appendTo($body);
      }
    });
  }, self;
}), function(root, factory) {
  if ("function" == typeof define && define.amd) {
    define("backbone.uniquemodel", ["backbone"], function(Backbone) {
      Backbone.UniqueModel = factory(Backbone);
    });
  } else {
    if ("undefined" != typeof exports) {
      var Backbone = require("backbone");
      Backbone.UniqueModel = factory(Backbone);
    } else {
      root.Backbone.UniqueModel = factory(root.Backbone);
    }
  }
}(this, function(Backbone) {
  /**
   * @param {string} name
   * @param {(Array|string)} value
   * @param {string} type
   * @return {?}
   */
  function attributes(name, value, type) {
    value = value || _.uniqueId("UniqueModel_");
    type = type || attributes.STORAGE_DEFAULT_ADAPTER;
    var index = attributes.addModel(name, value, type);
    return index.modelConstructor;
  }
  /**
   * @param {Function} router
   * @param {string} name
   * @param {string} models
   * @return {undefined}
   */
  function Collection(router, name, models) {
    var data_user = this;
    this.instances = {};
    /** @type {Function} */
    this.Model = router;
    /** @type {string} */
    this.modelName = name;
    /** @type {null} */
    this.storage = null;
    if ("localStorage" === models) {
      this.storage = new self(this.modelName, localStorage);
    } else {
      if ("sessionStorage" === models) {
        this.storage = new self(this.modelName, sessionStorage);
      }
    }
    if (this.storage) {
      this.storage.on("sync", this.storageSync, this);
      this.storage.on("destroy", this.storageDestroy, this);
    }
    /**
     * @param {string} optgroup
     * @param {Object} name
     * @return {?}
     */
    var attributes = function(optgroup, name) {
      return data_user.get(optgroup, name);
    };
    _.extend(attributes, Backbone.Events);
    attributes.prototype = this.Model.prototype;
    /** @type {function (string, Object): ?} */
    this.modelConstructor = attributes;
  }
  /**
   * @param {string} name
   * @param {Object} value
   * @return {undefined}
   */
  function self(name, value) {
    /** @type {string} */
    this.modelName = name;
    /** @type {Object} */
    this.store = value;
    self.instances[name] = this;
    if (!self.listener) {
      self.listener = window.addEventListener ? window.addEventListener("storage", self.onStorage, false) : window.attachEvent("onstorage", self.onStorage);
    }
  }
  var types = {};
  return attributes.STORAGE_DEFAULT_ADAPTER = "memory", attributes.STORAGE_KEY_DELIMETER = ".", attributes.STORAGE_NAMESPACE = "UniqueModel", attributes.getModelCache = function(t) {
    var idx = types[t];
    if (!idx) {
      throw "Unrecognized model: " + t;
    }
    return idx;
  }, attributes.addModel = function(path, name, keepData) {
    if (types[name]) {
      return types[name];
    }
    var c = new Collection(path, name, keepData);
    return types[name] = c, c;
  }, attributes.clear = function() {
    var type;
    for (type in types) {
      if (types.hasOwnProperty(type)) {
        delete types[type];
      }
    }
  }, _.extend(Collection.prototype, {
    /**
     * @param {string} factor
     * @param {Function} resolvedValue
     * @return {?}
     */
    newModel : function(factor, resolvedValue) {
      var self = new this.Model(factor, resolvedValue);
      return this.storage && (self.id && this.storage.save(self.id, self.attributes), self.on("sync", this.instanceSync, this), self.on("destroy", this.instanceDestroy, this)), self;
    },
    /**
     * @param {Element} user
     * @return {undefined}
     */
    instanceSync : function(user) {
      if (this.storage) {
        this.storage.save(user.id, user.attributes);
      }
    },
    /**
     * @param {Element} cmp
     * @return {undefined}
     */
    instanceDestroy : function(cmp) {
      if (this.storage) {
        this.storage.remove(cmp.id);
      }
    },
    /**
     * @param {?} dataAndEvents
     * @param {string} optgroup
     * @return {undefined}
     */
    storageSync : function(dataAndEvents, optgroup) {
      this.get(optgroup, {
        fromStorage : true
      });
    },
    /**
     * @param {?} i
     * @return {undefined}
     */
    storageDestroy : function(i) {
      var model = this.instances[i];
      if (model) {
        model.trigger("destroy", model);
        delete this.instances[i];
      }
    },
    /**
     * @param {Object} a
     * @param {string} val
     * @param {Function} object
     * @return {?}
     */
    add : function(a, val, object) {
      var obj = this.newModel(val, object);
      return this.instances[a] = obj, obj;
    },
    /**
     * @param {string} name
     * @param {Object} value
     * @return {?}
     */
    get : function(name, value) {
      value = value || {};
      var Model = this.Model;
      var ok = name && name[Model.prototype.idAttribute];
      if (!ok) {
        return this.newModel(name, value);
      }
      var result = this.instances[ok];
      if (this.storage && (!value.fromStorage && !result)) {
        var ar = this.storage.getFromStorage(this.storage.getStorageKey(ok));
        if (ar) {
          result = this.add(ok, ar, value);
        }
      }
      return result ? (result.set(name), value.fromStorage || this.instanceSync(result)) : (result = this.add(ok, name, value), value.fromStorage && this.modelConstructor.trigger("uniquemodel.add", result)), result;
    }
  }), self.instances = {}, self.listener = null, self.onStorage = function(e) {
    var key = e.key;
    /** @type {RegExp} */
    var delegateEventSplitter = new RegExp([attributes.STORAGE_NAMESPACE, "(\\w+)", "(.+)"].join("\\" + attributes.STORAGE_KEY_DELIMETER));
    var match = key.match(delegateEventSplitter);
    if (match) {
      var name = match[1];
      var target = match[2];
      var orig = self.instances[name];
      if (orig) {
        orig.handleStorageEvent(key, target);
      }
    }
  }, _.extend(self.prototype, {
    /**
     * @param {string} dataName
     * @param {Object} old
     * @return {undefined}
     */
    handleStorageEvent : function(dataName, old) {
      var data = this.getFromStorage(dataName);
      if (data) {
        this.trigger("sync", old, data);
      } else {
        this.trigger("destroy", old);
      }
    },
    /**
     * @param {string} i
     * @return {?}
     */
    getFromStorage : function(i) {
      try {
        return JSON.parse(this.store.getItem(i));
      } catch (b) {
        return;
      }
    },
    /**
     * @param {Object} result
     * @return {?}
     */
    getStorageKey : function(result) {
      /** @type {string} */
      var getStorageKey = [attributes.STORAGE_NAMESPACE, this.modelName, result].join(attributes.STORAGE_KEY_DELIMETER);
      return getStorageKey;
    },
    /**
     * @param {Object} key
     * @param {?} obj
     * @return {undefined}
     */
    save : function(key, obj) {
      if (!key) {
        throw "Cannot save without id";
      }
      /** @type {string} */
      var val = JSON.stringify(obj);
      this.store.setItem(this.getStorageKey(key), val);
    },
    /**
     * @param {Object} a
     * @return {undefined}
     */
    remove : function(a) {
      if (!a) {
        throw "Cannot remove without id";
      }
      this.store.removeItem(this.getStorageKey(a));
    }
  }, Backbone.Events), _.extend(attributes, {
    /** @type {function (Function, string, string): undefined} */
    ModelCache : Collection,
    /** @type {function (string, Object): undefined} */
    StorageAdapter : self
  }), attributes;
}), define("common/models", ["require", "jquery", "underscore", "backbone", "moment", "modernizr", "core/api", "core/UniqueModel", "core/models/User", "core/models/Post", "core/models/Thread", "core/models/Forum", "core/collections/MediaCollection", "core/utils/guid", "common/utils", "core/utils", "common/urls", "shared/corefuncs", "shared/urls", "backbone.uniquemodel"], function(require, FauxtonAPI, $, Backbone, textAlt, dataAndEvents, api, store, data, Component, result, Observable, fake, UUID, 
e, ignoreMethodDoesntExist, deepDataAndEvents, o, response) {
  var Forum = Observable.extend({
    defaults : {
      settings : {}
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      return $.extend(Backbone.Model.prototype.toJSON.apply(this, arguments), {
        homeUrl : response.apps.home + "home/forums/" + this.id + "/"
      });
    }
  });
  var Probe = result.extend({
    /**
     * @param {?} contentHTML
     * @param {Object} data
     * @return {undefined}
     */
    initialize : function(contentHTML, data) {
      result.prototype.initialize.apply(this, arguments);
      data = data || {};
      var $scope = this;
      var posts = require("common/collections");
      $scope.users = new posts.UserCollection(data.users, {
        thread : $scope
      });
      if ($scope.forum) {
        $scope.moderatorList = new posts.ModeratorCollection(null, {
          forum : $scope.forum.get("id")
        });
      }
      $scope.posts = new posts.SubpaginatedPostCollection(data.posts, {
        thread : $scope,
        cursor : data.postCursor,
        order : data.order,
        perPage : ignoreMethodDoesntExist.isMobileUserAgent() ? 20 : 50
      });
      $scope.votes = new posts.ThreadVoteCollection;
      $scope.posts.on("add reset", function(attributes) {
        attributes = attributes.models ? attributes.models : [attributes];
        $.each(attributes, function(data) {
          if (!$scope.users.get(data.author.id)) {
            $scope.users.add(data.author);
          }
        });
        $scope.recalculatePostCount();
      });
      $scope.listenTo($scope.posts, "change:isDeleted change:isFlagged", function(dataAndEvents, deepDataAndEvents) {
        if (deepDataAndEvents) {
          $scope.incrementPostCount(-1);
        }
      });
      $scope.queue = new posts.QueuedPostCollection(null, {
        thread : $scope
      });
    },
    /**
     * @return {undefined}
     */
    recalculatePostCount : function() {
      var recurring = this.get("posts");
      if (!(recurring > 50)) {
        recurring = this.posts.buffer.reduce(function(dataAndEvents, memDef) {
          return memDef.isPublic() ? dataAndEvents + 1 : dataAndEvents;
        }, 0);
        this.set("posts", recurring);
      }
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      return $.extend(result.prototype.toJSON.apply(this, arguments), {
        homeUrl : response.apps.home + "home/discussions/" + this.relatedIds().forum + "/" + this.get("slug") + "/"
      });
    }
  });
  result.withThreadVoteCollection.call(Probe.prototype, Backbone.Collection);
  var TopThread = Probe.extend({
    defaults : $.extend({
      postsInInterval : 0,
      posts : 0,
      topPost : null
    }, Probe.prototype.defaults)
  });
  var Text = Component.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      Component.prototype.initialize.apply(this, arguments);
      var Block = require("common/collections");
      this.usersTyping = new Block.TypingUserCollection;
    },
    /**
     * @param {Object} d
     * @return {?}
     */
    isAuthorSessionUser : function(d) {
      return d.user.id && (this.author && this.author.id) ? this.author.id === d.user.id : false;
    },
    /**
     * @param {Object} obj
     * @param {Node} a
     * @return {?}
     */
    canBeEdited : function(obj, a) {
      return!a.get("isClosed") && (!this.get("isDeleted") && (obj.isLoggedIn() && (this.isAuthorSessionUser(obj) && (this.get("raw_message") && (!this.get("isHighlighted") && !this.get("isSponsored"))))));
    },
    /**
     * @param {Object} a
     * @param {Node} b
     * @return {?}
     */
    canBeRepliedTo : function(a, b) {
      return!b.get("isClosed") && (a.get("canReply") && (!this.get("isDeleted") && (this.get("isApproved") || b.isModerator(a.user))));
    },
    /**
     * @return {?}
     */
    canBeShared : function() {
      return!this.get("isDeleted") && !this.get("isSponsored");
    },
    /**
     * @return {?}
     */
    getParent : function() {
      var result = this.get("parent");
      if (result) {
        return new store(Text, {
          id : String(result)
        });
      }
    }
  }, {
    /**
     * @param {Function} a
     * @param {Object} name
     * @param {Object} replacementHash
     * @return {?}
     */
    fetchContext : function(a, name, replacementHash) {
      replacementHash = replacementHash || {};
      var result = FauxtonAPI.Deferred();
      return api.call("posts/getContext.json", {
        method : "GET",
        data : {
          /** @type {Function} */
          post : a
        },
        /**
         * @param {Function} a
         * @return {?}
         */
        success : function(a) {
          var attributes = $.filter(a.response, function(exports) {
            return exports.thread === name.get("id");
          });
          return attributes ? ($.each(attributes, function(exports) {
            exports = new store(Text, exports);
            if (replacementHash.requestedByPermalink) {
              /** @type {boolean} */
              exports.requestedByPermalink = true;
            }
            name.posts.add(exports);
          }), void result.resolve(attributes)) : void result.reject();
        }
      }), result.promise();
    }
  });
  Component.withAuthor.call(Text.prototype, store.wrap(data));
  Component.withMediaCollection.call(Text.prototype, fake);
  store.addType("Post", Text);
  var QueuedPost = Backbone.Model.extend({
    defaults : {
      user : null,
      message : null,
      parentId : null,
      immedReply : false,
      createdAt : void 0
    },
    /**
     * @param {?} item
     * @return {?}
     */
    getVisibleParent : function(item) {
      var vMarker;
      var Dom = this;
      for (;Dom.get("parentId");) {
        if (vMarker = item.posts.get(Dom.get("parentId"))) {
          return vMarker;
        }
        if (Dom = item.queue.get(Dom.get("parentId")), !Dom) {
          return null;
        }
      }
      return null;
    },
    /**
     * @param {Element} result
     * @return {?}
     */
    toPost : function(result) {
      var self = this;
      var c = result.posts.get(self.get("parentId"));
      var n = c ? c.get("depth") + 1 : 0;
      var $scope = new store(Text, {
        id : self.id,
        thread : result.id,
        message : self.get("message"),
        parent : self.get("parentId"),
        depth : n,
        createdAt : self.get("createdAt"),
        isRealtime : true,
        media : self.get("media"),
        isImmediateReply : self.get("immedReply")
      });
      return $scope.author = self.get("user"), $scope;
    }
  });
  var passedQuery = Backbone.Model.extend({
    defaults : {
      user : null,
      post : null,
      thread : null,
      client_context : null,
      typing : true
    },
    idAttribute : "client_context",
    /**
     * @return {?}
     */
    set : function() {
      return this.lastModified = new Date, Backbone.Model.prototype.set.apply(this, arguments);
    },
    /**
     * @return {undefined}
     */
    sync : function() {
      var attributes = this.toJSON();
      var url = o.serialize(deepDataAndEvents.realertime + "/api/typing", attributes);
      try {
        e.CORS.request("GET", url).send();
      } catch (c) {
      }
    }
  }, {
    /**
     * @param {EventTarget} attributes
     * @return {?}
     */
    make : function(attributes) {
      return attributes.client_context || (attributes.client_context = UUID.generate()), new store(passedQuery, attributes);
    }
  });
  store.addType("TypingUser", passedQuery);
  $.extend(data.prototype, {
    /**
     * @return {?}
     */
    getFollowing : function() {
      var Block = require("common/collections/profile");
      return this.following || (this.following = new Block.FollowingCollection(null, {
        user : this
      }));
    }
  });
  store.addType("User", data);
  var element = data.extend({
    defaults : $.extend({
      numPosts : 0
    }, data.prototype.defaults)
  });
  /** @type {(null|string)} */
  var options = dataAndEvents.sessionstorage ? "sessionStorage" : null;
  var str = Backbone.UniqueModel(data, "User", options);
  var child = Backbone.UniqueModel(element, "User", options);
  var Switch = Backbone.Model.extend({});
  return{
    Forum : Forum,
    Thread : Probe,
    TopThread : TopThread,
    Post : Text,
    QueuedPost : QueuedPost,
    TypingUser : passedQuery,
    User : data,
    TopUser : element,
    Switch : Switch,
    SyncedUser : str,
    SyncedTopUser : child
  };
}), define("common/Session", ["jquery", "underscore", "backbone", "core/api", "core/bus", "core/models/Session", "core/strings", "core/UniqueModel", "core/utils", "core/utils/cookies", "core/WindowBus", "common/collections/LoggedOutCache", "common/models", "common/urls", "common/utils", "shared/corefuncs"], function(FauxtonAPI, _, dataAndEvents, test, view, $, deepDataAndEvents, ProjectModel, Strobe, gridStore, ignoreMethodDoesntExist, enyo, ServerAPI, c, jQuery, util) {
  var details;
  var QUnit = new ignoreMethodDoesntExist;
  var self = $.extend({
    _defaults : {
      canReply : true,
      canModerate : false,
      audienceSyncVerified : false,
      sso : null
    },
    /**
     * @return {?}
     */
    defaults : function() {
      var getUnread = new enyo.Collection(enyo.LOGGED_OUT_NOTES, {
        session : this
      });
      return _.extend(this._defaults, {
        notificationCount : getUnread.getUnread().length
      });
    },
    /**
     * @param {string} url
     * @param {number} val
     * @param {number} value
     * @return {?}
     */
    openAuthWindow : function(url, val, value) {
      return Strobe.openWindow(url, "_blank", {
        width : val,
        height : value
      });
    },
    /**
     * @param {string} objId
     * @return {undefined}
     */
    start : function(objId) {
      this.set(objId);
      this.listenTo(QUnit, "auth:success", this.fetch);
      this.listenTo(view.frame, {
        /**
         * @param {Object} response
         * @return {undefined}
         */
        "!auth:success" : function(response) {
          if (response) {
            if (response.sessionId) {
              test.headers({
                "X-Sessionid" : response.sessionId
              });
            }
            if (response.message) {
              this.trigger("alert", response.message, {
                type : "info"
              });
            }
            if (response.logEvent) {
              view.trigger("uiAction:" + response.logEvent);
            }
          }
          QUnit.broadcast("auth:success");
          this.fetch();
        }
      });
      this.bindAudienceSyncHandlers();
    },
    /**
     * @return {undefined}
     */
    stop : function() {
      this.stopListening();
      this.off();
    },
    /**
     * @return {?}
     */
    shouldFetchSession : function() {
      return this.get("remoteAuthS3") || gridStore.read("reflectauth");
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    getUserInstance : function(a) {
      return new ProjectModel(ServerAPI.User, a);
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      var req = this.user.toJSON.apply(this.user, arguments);
      return req.thread.canReply = this.get("canReply"), req.thread.canModerate || (req.thread.canModerate = this.get("canModerate")), req;
    },
    /**
     * @return {?}
     */
    fetch : function() {
      var todo = this.has("thread") ? this.fetchThreadDetails(this.get("thread")) : $.prototype.fetch.apply(this, arguments);
      var namespace = this;
      return todo.done(function() {
        namespace.set("notificationCount", 0);
      }), todo;
    },
    /**
     * @return {?}
     */
    fetchNotificationCount : function() {
      var $scope = this;
      return $scope.isLoggedIn() ? test.call("timelines/getUnreadCount.json", {
        data : {
          type : "notifications"
        }
      }).done(function(data) {
        $scope.set("notificationCount", data.response);
      }) : FauxtonAPI.Deferred().resolve();
    },
    /**
     * @param {Object} $scope
     * @return {?}
     */
    fetchThreadDetails : function($scope) {
      var self = this;
      if (self._request) {
        self._request.abort();
        /** @type {null} */
        self._request = null;
      }
      var params = {
        thread : $scope.id,
        post : $scope.posts.pluck("id")
      };
      return params["_" + (new Date).getTime()] = 1, self._request = test.call("embed/threadDetails.json", {
        data : params,
        /**
         * @param {Function} a
         * @return {undefined}
         */
        success : function(a) {
          var data = a.response;
          var attributes = {};
          if (data.user) {
            _.extend(attributes, data.user, {
              votes : data.votes
            });
          }
          self.set(data.session);
          if (attributes.id) {
            self.setUser(new ProjectModel(ServerAPI.User, attributes));
            $scope.users.add(self.user);
            if (data.thread) {
              $scope.set("userScore", data.thread.userScore);
              $scope.set("userSubscription", data.thread.userSubscription);
            }
          } else {
            self.setUser(self.getAnonUserInstance());
          }
        },
        /**
         * @return {undefined}
         */
        complete : function() {
          /** @type {null} */
          self._request = null;
        }
      }), self._request;
    },
    /**
     * @return {undefined}
     */
    logout : function() {
      var data = this.get("sso");
      if (this.isSSO() && (data && data.logout)) {
        view.frame.sendHostMessage("navigate", data.logout);
      } else {
        this.locationReplace(util.serialize(c.logout, {
          redirect : window.location.href
        }));
      }
    },
    /**
     * @param {?} url
     * @return {undefined}
     */
    locationReplace : function(url) {
      window.location.replace(url);
    },
    /**
     * @return {?}
     */
    isSSO : function() {
      return this.user && "sso" === this.user.get("user_type");
    },
    /**
     * @param {Object} key
     * @return {?}
     */
    authenticate : function(key) {
      var value = this.authServices[key];
      if (value) {
        if (_.isFunction(value)) {
          return value.call(this);
        }
        view.trigger("uiAction:openLogin", key);
        var attributes = {
          forum : this.get("thread") && this.get("thread").forum.id
        };
        if ("https:" === window.location.protocol) {
          /** @type {number} */
          attributes.redirect_secure = 1;
        }
        if (value.csrf) {
          attributes.ctkn = this.getCsrfToken();
        }
        _.extend(attributes, value.params);
        this.openAuthWindow(util.serialize(value.url, attributes), value.width, value.height);
      }
    },
    authServices : {
      reflect : {
        url : c.login,
        width : 460,
        height : 355
      },
      reflectDotcom : {
        url : c.dotcomLogin,
        width : 478,
        height : 590,
        params : {
          next : c.login + ("https:" === window.location.protocol ? "?redirect_secure=1" : "")
        }
      },
      twitter : {
        url : c.oauth.twitter,
        width : 650,
        height : 680,
        csrf : true
      },
      facebook : {
        url : c.oauth.facebook,
        width : 550,
        height : 300,
        csrf : true
      },
      google : {
        url : c.oauth.google,
        width : 445,
        height : 635,
        csrf : true
      },
      /**
       * @return {undefined}
       */
      sso : function() {
        var request = this.get("sso");
        /** @type {number} */
        var seq = parseInt(request.width || "800", 10);
        /** @type {number} */
        var udataCur = parseInt(request.height || "500", 10);
        var which = this.openAuthWindow(request.url, seq, udataCur);
        !function timeout() {
          if (jQuery.isWindowClosed(which)) {
            view.frame.sendHostMessage("reload");
          } else {
            _.delay(timeout, 500);
          }
        }();
      }
    },
    /**
     * @return {undefined}
     */
    bindAudienceSyncHandlers : function() {
      this.listenTo(this, "change:id change:audienceSyncVerified", function() {
        if (this.get("audienceSyncVerified")) {
          view.frame.sendHostMessage("session.identify", this.user.id);
        }
      });
      this.listenTo(view.frame, {
        /**
         * @return {undefined}
         */
        "!audiencesync:grant" : function() {
          this.set("audienceSyncVerified", true);
        }
      });
    },
    /**
     * @return {?}
     */
    getAudienceSyncUrl : function() {
      var attributes = {
        client_id : this.get("apiKey"),
        response_type : "audiencesync",
        forum_id : this.get("thread").forum.id
      };
      return "https:" === window.location.protocol && (attributes.ssl = 1), util.serialize(c.authorize, attributes);
    },
    /**
     * @return {undefined}
     */
    audienceSync : function() {
      this.openAuthWindow(this.getAudienceSyncUrl(), 460, 355);
    },
    /**
     * @param {Node} lock
     * @return {?}
     */
    needsAudienceSyncAuth : function(lock) {
      return lock.get("settings").audienceSyncEnabled && (this.isLoggedIn() && !this.get("audienceSyncVerified"));
    },
    /**
     * @return {?}
     */
    getLoggedOutUserFlags : function() {
      return this._loggedOutUserFlags ? this._loggedOutUserFlags : (this._loggedOutUserFlags = new enyo.Collection(enyo.LOGGED_OUT_FLAGS, {
        session : this
      }), this._loggedOutUserFlags);
    }
  });
  return{
    /**
     * @return {?}
     */
    get : function() {
      return details = details || new self;
    },
    /**
     * @param {?} options
     * @return {?}
     */
    setDefaults : function(options) {
      if (details) {
        throw new Error("Session defaults cannot be changed after a session instance is created!");
      }
      return self._defaults = _.extend(self.prototype._defaults, options), self._defaults;
    },
    /**
     * @return {undefined}
     */
    forget : function() {
      if (details) {
        details.stop();
        /** @type {null} */
        details = null;
      }
    }
  };
}), define("common/analytics/google", ["require", "common/keys", "common/defines"], function(when, c, utils) {
  var toJson;
  /**
   * @param {?} dataAndEvents
   * @return {undefined}
   */
  var clone = function(dataAndEvents) {
    toJson = dataAndEvents;
  };
  /**
   * @param {(Array|string)} arg
   * @return {undefined}
   */
  var push = function(arg) {
    if (toJson) {
      toJson(arg);
    } else {
      window._gaq.push(arg);
    }
  };
  /**
   * @return {undefined}
   */
  var init = function() {
    /** @type {string} */
    var optsData = "";
    if (!utils.debug || optsData) {
      report(c.googleAnalytics);
      getEnumerableProperties(".ryflection.com");
      /**
       * @return {undefined}
       */
      var noop = function() {
      };
      when([optsData ? "ga-debug" : "ga"], noop, noop);
    }
  };
  var data = {
    component : 1,
    "package" : 2,
    forum : 3,
    version : 4,
    userType : 5
  };
  /**
   * @param {string} name
   * @param {?} child
   * @return {undefined}
   */
  var contains = function(name, child) {
    push(["_setCustomVar", data[name], name, child]);
  };
  /**
   * @return {undefined}
   */
  var trackPageview = function() {
    push(["_trackPageview"]);
  };
  /**
   * @param {?} category
   * @param {?} opt_noninteraction
   * @param {?} opt_value
   * @return {undefined}
   */
  var trackEvent = function(category, opt_noninteraction, opt_value) {
    push(["_trackEvent", opt_noninteraction, category, opt_value, 1]);
  };
  /**
   * @param {?} failing_message
   * @return {undefined}
   */
  var report = function(failing_message) {
    push(["_setAccount", failing_message]);
  };
  /**
   * @param {string} object
   * @return {undefined}
   */
  var getEnumerableProperties = function(object) {
    push(["_setDomainName", object]);
  };
  return window._gaq || (window._gaq = []), init(), {
    /** @type {function (?): undefined} */
    setCaller : clone,
    /** @type {function (?): undefined} */
    setAccount : report,
    /** @type {function (string, ?): undefined} */
    setCustomVar : contains,
    /** @type {function (): undefined} */
    trackPageview : trackPageview,
    /** @type {function (?, ?, ?): undefined} */
    trackEvent : trackEvent,
    /** @type {function (string): undefined} */
    setDomainName : getEnumerableProperties
  };
}), define("core/models/Channel", ["underscore", "backbone", "remote/config", "core/UniqueModel", "core/api", "core/models/Forum", "core/strings"], function(_, Backbone, deepDataAndEvents, store, model, dataAndEvents, r) {
  var fn = r.get;
  var passedQuery = Backbone.Model.extend({
    defaults : {
      primaryForum : {},
      slug : null,
      name : null,
      options : {},
      followUrl : "channels/follow",
      unfollowUrl : "channels/unfollow"
    },
    idAttribute : "slug",
    /**
     * @param {?} contentHTML
     * @param {?} callbacks
     * @return {undefined}
     */
    initialize : function(contentHTML, callbacks) {
      this.buildPrimaryForum(callbacks);
      this.listenTo(this, "change:primaryForum", this.updatePrimaryForum);
    },
    /**
     * @return {undefined}
     */
    buildPrimaryForum : function() {
      if (!this.primaryForum) {
        var cookies = this.get("primaryForum");
        if (cookies) {
          this.primaryForum = new store(dataAndEvents, cookies, {
            channel : this
          });
          this.unset("primaryForum");
        }
      }
    },
    /**
     * @return {undefined}
     */
    updatePrimaryForum : function() {
      var objId = this.get("primaryForum");
      if (objId) {
        if (!this.primaryForum) {
          this.buildPrimaryForum();
        }
        this.primaryForum.set(objId);
        this.unset("primaryForum");
      }
    },
    /**
     * @param {Object} node
     * @return {?}
     */
    fetch : function(node) {
      return node = node ? _.clone(node) : {}, node.data = this.buildFetchData(node.data), Backbone.Model.prototype.fetch.call(this, node);
    },
    /**
     * @param {Object} node
     * @return {?}
     */
    buildFetchData : function(node) {
      var config = node ? _.clone(node) : {};
      return this.id && (config.channel = this.id), config;
    },
    /**
     * @param {Function} a
     * @return {?}
     */
    url : function(a) {
      return model.getURL(this.constructor.URLS[a] || this.constructor.URLS.read);
    },
    /**
     * @param {Function} QUnit
     * @param {Object} model
     * @param {Object} options
     * @return {?}
     */
    sync : function(QUnit, model, options) {
      var data = model.attributes;
      options = _.extend({
        url : this.url(QUnit),
        emulateHTTP : true
      }, options);
      var message = {
        bannerColor : data.bannerColor,
        description : data.description
      };
      switch("default" === options.avatarType ? message.avatar = "" : data.avatar && (!_.isString(data.avatar) && (message.avatar = data.avatar)), QUnit) {
        case "create":
          /** @type {boolean} */
          options.processData = false;
          /** @type {boolean} */
          options.contentType = false;
          message.name = data.name;
          options.data = this.toFormData(_.extend({}, message, options.data));
          break;
        case "update":
          /** @type {boolean} */
          options.processData = false;
          /** @type {boolean} */
          options.contentType = false;
          message.channel = data.slug;
          options.data = this.toFormData(_.extend({}, message, options.data));
      }
      return Backbone.sync(QUnit, model, options);
    },
    /**
     * @param {Function} results
     * @return {?}
     */
    toFormData : function(results) {
      return _.reduce(results, function(stringBuffer, data, lineSeparator) {
        return stringBuffer.append(lineSeparator, _.isString(data) ? data.trim() : data), stringBuffer;
      }, new window.FormData);
    },
    /**
     * @param {Object} callback
     * @return {?}
     */
    parse : function(callback) {
      return callback.response || callback;
    },
    /**
     * @return {?}
     */
    shouldFetch : function() {
      return!this.get("name") || !this.get("dateAdded");
    },
    /**
     * @return {undefined}
     */
    ensureFetched : function() {
      if (this.shouldFetch()) {
        this.fetch();
      }
    },
    /**
     * @param {Function} attrs
     * @return {?}
     */
    validate : function(attrs) {
      /** @type {Array} */
      var errors = [];
      var constructor = attrs.name.trim();
      if (constructor.length < this.constructor.MIN_NAME_LENGTH) {
        errors.push({
          attrName : "name",
          message : r.interpolate(fn("Name must have at least %(minLength)s characters."), {
            minLength : this.constructor.MIN_NAME_LENGTH
          })
        });
      } else {
        if (constructor.length > this.constructor.MAX_NAME_LENGTH) {
          errors.push({
            attrName : "name",
            message : r.interpolate(fn("Name must have less than %(maxLength)s characters."), {
              maxLength : this.constructor.MAX_NAME_LENGTH
            })
          });
        }
      }
      var codeSegments = attrs.description.trim();
      return codeSegments.length < this.constructor.MIN_DESCRIPTION_LENGTH ? errors.push({
        attrName : "description",
        message : r.interpolate(fn("Description must have at least %(minLength)s characters."), {
          minLength : this.constructor.MIN_DESCRIPTION_LENGTH
        })
      }) : codeSegments.length > this.constructor.MAX_DESCRIPTION_LENGTH && errors.push({
        attrName : "description",
        message : r.interpolate(fn("Description must have less than %(maxLength)s characters."), {
          maxLength : this.constructor.MAX_DESCRIPTION_LENGTH
        })
      }), this.constructor.BANNER_COLORS[attrs.bannerColor] || errors.push({
        attrName : "bannerColor",
        message : r.interpolate(fn("Banner color must be one of " + _.invoke(_.values(this.constructor.BANNER_COLORS), "toLowerCase").join(", ")) + ".")
      }), _.isEmpty(errors) ? void 0 : errors;
    },
    /**
     * @param {string} resp
     * @param {Object} options
     * @return {?}
     */
    _changeFollowingState : function(resp, options) {
      return options = options || {}, options.type = "POST", options.data = _.extend({
        target : this.get("slug")
      }, options.data), model.call(resp, options);
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    follow : function(obj) {
      return this.primaryForum.set("isFollowing", true), this._changeFollowingState(this.get("followUrl"), obj);
    },
    /**
     * @param {Object} obj
     * @return {?}
     */
    unfollow : function(obj) {
      return this.primaryForum.set("isFollowing", false), this._changeFollowingState(this.get("unfollowUrl"), obj);
    },
    /**
     * @return {?}
     */
    toggleFollowed : function() {
      return this.get("options").isCurationOnlyChannel && this.primaryForum ? this.primaryForum.get("isFollowing") ? this.unfollow() : this.follow() : void 0;
    }
  }, {
    URLS : {
      read : "channels/details",
      create : "channels/create",
      update : "channels/update"
    },
    BANNER_COLORS : {
      gray : fn("Gray"),
      blue : fn("Blue"),
      green : fn("Green"),
      yellow : fn("Yellow"),
      orange : fn("Orange"),
      red : fn("Red"),
      purple : fn("Purple")
    },
    MIN_NAME_LENGTH : 3,
    MAX_NAME_LENGTH : 100,
    MIN_DESCRIPTION_LENGTH : 5,
    MAX_DESCRIPTION_LENGTH : 200
  });
  return store.addType("Channel", passedQuery), passedQuery;
}), define("core/utils/objectExpander", ["underscore", "backbone", "core/UniqueModel", "core/models/Channel", "core/models/Thread"], function(match, ignoreMethodDoesntExist, Group, dataAndEvents, deepDataAndEvents) {
  return{
    Channel : dataAndEvents,
    Thread : deepDataAndEvents,
    /**
     * @param {Object} obj
     * @param {string} prop
     * @return {?}
     */
    parseObject : function(obj, prop) {
      return match.isString(prop) ? obj[prop] : prop;
    },
    /**
     * @param {Object} result
     * @param {string} item
     * @return {?}
     */
    buildThread : function(result, item) {
      if (item instanceof this.Thread) {
        return item;
      }
      if (item = this.parseObject(result, item), match.isString(item.author)) {
        var attr = item.author.replace("auth.User?id=", "");
        item.author = result["auth.User?id=" + attr] || attr;
      }
      return new Group(this.Thread, item, {
        forum : this.parseObject(result, item.forum),
        author : item.author
      });
    },
    /**
     * @param {Object} walkers
     * @param {string} pattern
     * @return {?}
     */
    buildChannel : function(walkers, pattern) {
      return pattern instanceof this.Channel ? pattern : (pattern = this.parseObject(walkers, pattern), new Group(this.Channel, pattern));
    }
  };
}), define("core/collections/PaginatedCollection", ["underscore", "backbone"], function($, Backbone) {
  var c = Backbone.Collection.extend({
    PER_PAGE : 30,
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      options = options || {};
      this.cursor = options.cursor || {};
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    fetch : function(options) {
      return options = options || {}, options.data = $.defaults(options.data || {}, {
        cursor : options.cursor || "",
        limit : options.PER_PAGE || this.PER_PAGE
      }), Backbone.Collection.prototype.fetch.call(this, options);
    },
    /**
     * @return {?}
     */
    hasNext : function() {
      return this.cursor.hasNext;
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    more : function(options) {
      /**
       * @param {string} arg
       * @return {undefined}
       */
      function selector(arg) {
        args.push(arg);
      }
      var self = this;
      if (options = options || {}, !this.cursor.hasNext) {
        return void self.trigger("nodata");
      }
      /** @type {Array} */
      var args = [];
      return this.on("add", selector), this.fetch($.extend({}, options, {
        add : true,
        remove : false,
        cursor : this.cursor.next,
        limit : this.PER_PAGE,
        /**
         * @return {undefined}
         */
        success : function() {
          self.trigger("add:many", args, self, options);
          self.off("add", selector);
          if (options.success) {
            options.success.apply(this, arguments);
          }
        }
      }));
    },
    /**
     * @param {Object} config
     * @return {?}
     */
    parse : function(config) {
      return this.cursor = config.cursor || {
        hasNext : false
      }, config.response;
    },
    /**
     * @return {?}
     */
    getLength : function() {
      return this.length;
    }
  });
  return c;
}), define("core/collections/ChannelCollection", ["underscore", "core/collections/PaginatedCollection", "core/UniqueModel", "core/api", "core/models/Channel", "core/utils/objectExpander"], function(_, $, list, compilationUnit, arg, arr) {
  var g = $.extend({
    url : compilationUnit.getURL("channels/list"),
    model : list.boundModel(arg),
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      options = options || {};
      this.listName = options.listName;
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    fetch : function(options) {
      return options = options || {}, this.listName && (options.data = _.extend({
        listName : this.listName
      }, options.data)), $.prototype.fetch.call(this, options);
    },
    /**
     * @param {Object} object
     * @return {?}
     */
    parse : function(object) {
      return object = $.prototype.parse.call(this, object), object.items ? _.map(object.items, function(aRecord) {
        return arr.buildChannel(object.objects, aRecord.reference);
      }) : object;
    }
  });
  return g;
}), define("core/models/ThreadVote", ["backbone"], function(Backbone) {
  var b = Backbone.Model.extend({
    defaults : {
      score : 0
    }
  });
  return b;
}), define("common/collections", ["underscore", "backbone", "moment", "core/api", "core/utils/objectExpander", "core/collections/UserCollection", "core/collections/PaginatedCollection", "core/collections/ChannelCollection", "core/models/ThreadVote", "core/UniqueModel", "common/models", "common/cached-storage"], function(_, Backbone, $timeout, compilationUnit, arr, matchersClass, $, dataAndEvents, associatedModel, relationships, models, AppRouter) {
  var ThreadVoteCollection = Backbone.Collection.extend({
    /** @type {Function} */
    model : associatedModel
  });
  var model = $.extend({
    PER_PAGE : 50,
    model : relationships.wrap(models.Post),
    url : compilationUnit.getURL("threads/listPostsThreaded"),
    /**
     * @param {?} contentHTML
     * @param {Object} data
     * @return {undefined}
     */
    initialize : function(contentHTML, data) {
      $.prototype.initialize.apply(this, arguments);
      data = data || {};
      this.thread = data.thread;
      this.setOrder(data.order);
    },
    /**
     * @param {Object} attributes
     * @return {?}
     */
    fetch : function(attributes) {
      return attributes = attributes || {}, _.extend(attributes, {
        data : {
          limit : this.PER_PAGE,
          thread : this.thread.id,
          forum : this.thread.get("forum"),
          order : this.getOrder()
        }
      }), $.prototype.fetch.call(this, attributes);
    },
    /**
     * @return {?}
     */
    getOrder : function() {
      return this.order;
    },
    /**
     * @param {?} order
     * @return {undefined}
     */
    setOrder : function(order) {
      this.order = order;
    }
  });
  var self = Backbone.Collection.extend({
    collection : Backbone.Collection,
    /**
     * @param {Function} buffer
     * @param {Object} height
     * @return {undefined}
     */
    initialize : function(buffer, height) {
      this.thread = height.thread;
      this.perPage = height.perPage || 20;
      this.buffer = new this.collection(buffer, height);
      this.resetPage();
      this.listenTo(this.buffer, "reset", this.resetPage);
    },
    /**
     * @param {?} dataAndEvents
     * @param {Error} page
     * @param {?} graphics
     * @return {?}
     */
    resetPage : function(dataAndEvents, page, graphics) {
      return page = this.buffer.slice(0, this.perPage), Backbone.Collection.prototype.reset.call(this, page, graphics);
    },
    /**
     * @return {?}
     */
    currentPage : function() {
      /** @type {number} */
      var a = Math.floor(this.length / this.perPage);
      return this.length % this.perPage && a++, a;
    },
    /**
     * @param {string} optgroup
     * @param {string} ar
     * @return {undefined}
     */
    setPageFor : function(optgroup, ar) {
      var line = this.buffer.get(optgroup);
      var end = this.perPage;
      if (line) {
        /** @type {number} */
        end = Math.floor(this.buffer.indexOf(line) / this.perPage + 1) * this.perPage;
      }
      this.add(this.buffer.slice(0, end), ar);
    },
    /**
     * @return {?}
     */
    hasNext : function() {
      return this.buffer.length > this.length || this.buffer.hasNext();
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    more : function(e) {
      e = e || {};
      var output = this;
      var end = output.length + this.perPage;
      /** @type {function (): undefined} */
      var callback = e.success;
      /**
       * @return {undefined}
       */
      e.success = function() {
        output.add(output.buffer.slice(0, end));
        if (callback) {
          callback();
        }
      };
      if (output.buffer.length < output.length + this.perPage && output.buffer.hasNext()) {
        output.add(output.buffer.slice(0, end));
        output.buffer.more(e);
      } else {
        e.success();
      }
    }
  });
  _.each(["setOrder", "getOrder", "fetch", "reset"], function(i) {
    /**
     * @return {?}
     */
    self.prototype[i] = function() {
      return this.buffer[i].apply(this.buffer, arguments);
    };
  });
  _.each(["add", "remove"], function(i) {
    /**
     * @return {?}
     */
    self.prototype[i] = function() {
      return this.buffer[i].apply(this.buffer, arguments), Backbone.Collection.prototype[i].apply(this, arguments);
    };
  });
  var SubpaginatedPostCollection = self.extend({
    model : model.prototype.model,
    collection : model,
    /**
     * @return {undefined}
     */
    initialize : function() {
      self.prototype.initialize.apply(this, arguments);
      this.submittedPostsCache = new AppRouter("submitted_posts_cache");
    },
    /**
     * @return {undefined}
     */
    restoreFromCache : function() {
      var reversed = this.submittedPostsCache.getAll();
      var game = this;
      this.add(_.chain(reversed).reject(function($scope) {
        return game.thread.get("id") !== $scope.thread || $scope.parent && !game.get($scope.parent);
      }).map(function(dataAndEvents) {
        return dataAndEvents.isCached = true, dataAndEvents;
      }).value());
    },
    /**
     * @param {Element} _params
     * @return {undefined}
     */
    removeFromCache : function(_params) {
      this.submittedPostsCache.removeItem(_params.id);
    },
    /**
     * @param {Object} that
     * @return {undefined}
     */
    saveToCache : function(that) {
      this.submittedPostsCache.setItem(that.id, that.toJSON());
    }
  });
  var QueuedPostCollection = Backbone.Collection.extend({
    model : models.QueuedPost,
    /**
     * @param {?} contentHTML
     * @param {Object} data
     * @return {undefined}
     */
    initialize : function(contentHTML, data) {
      var $scope = this;
      $scope.thread = data.thread;
      $scope.counters = {
        comments : 0,
        replies : {}
      };
      $scope.on("add", function(config) {
        var cmp = config.getVisibleParent($scope.thread);
        var dupMatcher = $scope.counters.replies;
        if (cmp) {
          dupMatcher[cmp.id] = (dupMatcher[cmp.id] || 0) + 1;
          if (cmp.id === config.get("parentId")) {
            config.set("immedReply", true);
          }
        } else {
          $scope.counters.comments += 1;
        }
      });
    },
    /**
     * @param {Element} a
     * @return {?}
     */
    comparator : function(a) {
      return parseInt(a.id, 10);
    },
    /**
     * @param {Object} parent
     * @param {?} attributes
     * @return {?}
     */
    isDescendant : function(parent, attributes) {
      var optgroup = parent.get("parentId");
      var registry = optgroup ? this.get(optgroup) : null;
      var tagMap = {};
      _.each(attributes, function(value) {
        /** @type {boolean} */
        tagMap[value] = true;
      });
      for (;registry;) {
        if (tagMap[registry.get("id")] === true) {
          return true;
        }
        optgroup = registry.get("parentId");
        registry = optgroup ? this.get(optgroup) : null;
      }
      return false;
    },
    /**
     * @param {(Function|boolean)} number
     * @return {?}
     */
    drain : function(number) {
      /**
       * @param {Function} callback
       * @return {undefined}
       */
      function save(callback) {
        /** @type {Array} */
        var nodes = [];
        data.each(function(registry) {
          if (null === registry.get("parentId")) {
            nodes.push(registry.get("id"));
          }
        });
        data.reset(data.filter(function(path) {
          return null === path.get("parentId") || data.isDescendant(path, nodes) ? void callback(path) : path;
        }));
        /** @type {number} */
        data.counters.comments = 0;
      }
      /**
       * @param {Function} cb
       * @return {undefined}
       */
      function refresh(cb) {
        var value;
        /** @type {Array} */
        var attributes = [];
        value = data.filter(function(items) {
          var params = items.getVisibleParent(data.thread);
          return params && params.get("id") === number ? void attributes.push(items) : items;
        });
        attributes = _.sortBy(attributes, function(ids) {
          return parseInt(ids.get("id"), 10);
        });
        _.each(attributes, function(outErr) {
          cb(outErr);
        });
        data.reset(value);
        /** @type {number} */
        data.counters.replies[number] = 0;
      }
      var data = this;
      /** @type {function (Function): undefined} */
      var throttledUpdate = number ? refresh : save;
      return throttledUpdate(function(content) {
        data.thread.posts.add(content.toPost(data.thread));
      });
    }
  });
  var TypingUserCollection = Backbone.Collection.extend({
    models : models.TypingUser,
    /**
     * @return {undefined}
     */
    initialize : function() {
      var self = this;
      /** @type {null} */
      self.gc = null;
      self.on("add remove reset", function() {
        var c = self.count();
        return c > 0 && null === self.gc ? void(self.gc = window.setInterval(_.bind(self.cleanup, self), 6E4)) : void(0 >= c && (null !== self.gc && (window.clearInterval(self.gc), self.gc = null)));
      }, self);
    },
    /**
     * @param {boolean} id
     * @return {?}
     */
    count : function(id) {
      var items = this.filter(function(map) {
        return!(id && map.id === id) && map.get("typing");
      });
      return items.length;
    },
    /**
     * @return {undefined}
     */
    cleanup : function() {
      var now = $timeout();
      this.reset(this.filter(function(blobResult) {
        return now.diff(blobResult.lastModified, "minutes") < 5;
      }));
    }
  });
  var PostActivityCollection = $.extend({
    model : relationships.wrap(models.Post),
    url : compilationUnit.getURL("users/listPostActivity")
  });
  var RankedThreadCollection = $.extend({
    model : models.Thread,
    url : compilationUnit.getURL("timelines/ranked"),
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      options = options || {};
      this.type = options.type;
      this.target = options.target;
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    fetch : function(options) {
      return options = options || {}, options.data = _.extend({
        type : this.type,
        target : this.target
      }, options.data), $.prototype.fetch.call(this, options);
    },
    /**
     * @param {string} object
     * @return {?}
     */
    parse : function(object) {
      return object = $.prototype.parse.call(this, object), _.map(object.activities, function(pressed) {
        return arr.buildThread(object.objects, pressed.items[0].object);
      });
    }
  });
  var TopThreadCollection = Backbone.Collection.extend({
    model : models.TopThread,
    url : compilationUnit.getURL("threads/listPopular"),
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      this.forum = options.forum;
      this.limit = options.limit;
    },
    /**
     * @param {string} value
     * @param {Object} recurring
     * @return {undefined}
     */
    set : function(value, recurring) {
      if (recurring.parse) {
        value = this.parse(value, recurring);
        delete recurring.parse;
      }
      if (!_.isArray(value)) {
        /** @type {Array} */
        value = value ? [value] : [];
      }
      value = _.reject(value, function(err) {
        return err.title.match(/^http/i);
      });
      Backbone.Collection.prototype.set.call(this, value, recurring);
    },
    /**
     * @param {?} options
     * @return {?}
     */
    fetch : function(options) {
      return Backbone.Collection.prototype.fetch.call(this, _.extend({
        data : {
          forum : this.forum,
          limit : this.limit,
          interval : "7d",
          with_top_post : true
        }
      }, options));
    }
  });
  var TopUserCollection = Backbone.Collection.extend({
    model : models.SyncedTopUser,
    url : compilationUnit.getURL("forums/listMostActiveUsers"),
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      this.forum = options.forum;
      this.limit = options.limit;
    },
    /**
     * @param {?} options
     * @return {?}
     */
    fetch : function(options) {
      return Backbone.Collection.prototype.fetch.call(this, _.extend({
        data : {
          forum : this.forum,
          limit : this.limit
        }
      }, options));
    },
    /**
     * @param {Function} config
     * @return {?}
     */
    parse : function(config) {
      return _.filter(config.response, function(obj) {
        return parseFloat(obj.rep) > 0.7 ? obj : void 0;
      });
    }
  });
  matchersClass.prototype.model = relationships.wrap(models.User);
  var ModeratorCollection = Backbone.Collection.extend({
    model : models.SyncedUser,
    url : compilationUnit.getURL("forums/listModerators"),
    /**
     * @param {?} contentHTML
     * @param {?} parent
     * @return {undefined}
     */
    initialize : function(contentHTML, parent) {
      this.forum = parent.forum;
    },
    /**
     * @param {?} options
     * @return {?}
     */
    fetch : function(options) {
      return Backbone.Collection.prototype.fetch.call(this, _.extend({
        data : {
          forum : this.forum
        }
      }, options));
    },
    /**
     * @param {Function} object
     * @return {?}
     */
    parse : function(object) {
      return _.map(object.response, function(cred2) {
        return cred2.user;
      });
    }
  });
  return{
    PaginatedCollection : $,
    /** @type {Function} */
    UserCollection : matchersClass,
    ChannelCollection : dataAndEvents,
    PostCollection : model,
    SubpaginatedPostCollection : SubpaginatedPostCollection,
    TypingUserCollection : TypingUserCollection,
    TopUserCollection : TopUserCollection,
    RankedThreadCollection : RankedThreadCollection,
    TopThreadCollection : TopThreadCollection,
    ThreadVoteCollection : ThreadVoteCollection,
    PostActivityCollection : PostActivityCollection,
    QueuedPostCollection : QueuedPostCollection,
    ModeratorCollection : ModeratorCollection
  };
}), define("common/collections/profile", ["underscore", "backbone", "core/api", "common/models", "common/collections"], function(dataAndEvents, deepDataAndEvents, compilationUnit, params, Backbone) {
  var Base = Backbone.PaginatedCollection.extend({
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      this.user = options.user;
      Backbone.PaginatedCollection.prototype.initialize.apply(this, arguments);
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    fetch : function(options) {
      return options = options || {}, options.data = options.data || {}, options.data.user = this.user.id, Backbone.PaginatedCollection.prototype.fetch.call(this, options);
    }
  });
  var FollowingCollection = Base.extend({
    model : params.SyncedUser,
    url : compilationUnit.getURL("users/listFollowing"),
    PER_PAGE : 20
  });
  return{
    SessionPaginatedCollection : Base,
    FollowingCollection : FollowingCollection
  };
}), define("common/intelligence", ["underscore", "common/analytics/google"], function(param, $) {
  /**
   * @param {Object} target
   * @return {?}
   */
  function handler(target) {
    return target.has("remote") ? target.get("remote").domain : target.id ? "reflect" : "not_logged_in";
  }
  /**
   * @param {?} var_args
   * @return {?}
   */
  function concat(var_args) {
    return var_args.support_preferred ? "plus" : var_args.support_priority ? "pro" : var_args.support_vip ? "vip" : "free";
  }
  /**
   * @return {undefined}
   */
  function trackPageview() {
    $.trackPageview();
  }
  /**
   * @param {string} name
   * @param {(Error|string)} label
   * @return {undefined}
   */
  function callback(name, label) {
    $.setCustomVar(name, label);
  }
  /**
   * @return {undefined}
   */
  function Keyboard() {
    /** @type {string} */
    this.version = "next";
    /** @type {null} */
    this.forum = null;
    /** @type {null} */
    this.userType = null;
  }
  return Keyboard.prototype.init = function(config) {
    config = config || {};
    callback("component", "embed");
    if (config.version) {
      this.version = config.version;
    }
    callback("version", this.version);
    if (config.forum) {
      this.forum = config.forum;
      callback("forum", config.forum);
    }
    if (config.features) {
      callback("package", concat(config.features));
    }
    this.setSession(config.session || "not_logged_in");
    trackPageview();
  }, Keyboard.prototype.setSession = function(value) {
    var key = param.isString(value) ? value : handler(value);
    if (key !== this.userType) {
      this.userType = key;
      callback("userType", key);
    }
  }, Keyboard.prototype.trackEvent = function(category) {
    $.trackEvent(category, this.version, this.forum);
  }, {
    /** @type {function (): undefined} */
    Intelligence : Keyboard,
    /** @type {function (string, (Error|string)): undefined} */
    setCustomVar : callback,
    /** @type {function (): undefined} */
    trackPageview : trackPageview,
    /** @type {function (Object): ?} */
    getUserType : handler,
    /** @type {function (?): ?} */
    getPackageType : concat
  };
}), define("core/utils/hash", [], function() {
  /**
   * @param {string} a
   * @return {?}
   */
  var m = function(a) {
    var z;
    var _len;
    var s;
    /** @type {number} */
    var f = 0;
    if (0 === a.length) {
      return f;
    }
    /** @type {number} */
    z = 0;
    _len = a.length;
    for (;_len > z;z++) {
      s = a.charCodeAt(z);
      f = (f << 5) - f + s;
      f |= 0;
    }
    return f;
  };
  return{
    /** @type {function (string): ?} */
    calculate : m
  };
}), define("core/analytics/identity", ["backbone", "core/utils/cookies", "core/utils/guid", "core/utils/hash", "core/utils/fingerprint"], function(Backbone, request, UUID, ptp, $templateCache) {
  var impression = function() {
    var d = Backbone.Model.extend({
      COOKIE_NAME : "__jid",
      TTL : 18E5,
      /**
       * @return {undefined}
       */
      initialize : function() {
        this.prevImp = request.read(this.COOKIE_NAME);
        this.impId = UUID.generate();
        this.persist();
      },
      /**
       * @return {undefined}
       */
      persist : function() {
        request.create(this.COOKIE_NAME, this.impId, {
          expiresIn : this.TTL
        });
      }
    });
    return new d;
  }();
  var value = function() {
    var d = Backbone.Model.extend({
      COOKIE_NAME : "reflect_unique",
      TTL : 31536E6,
      /**
       * @return {?}
       */
      isPersistent : function() {
        return request.read(this.COOKIE_NAME) === this.get("value");
      },
      /**
       * @return {undefined}
       */
      initialize : function() {
        var recurring = request.read(this.COOKIE_NAME) || UUID.generate();
        request.create(this.COOKIE_NAME, recurring, {
          domain : window.location.host.split(":")[0],
          expiresIn : this.TTL
        });
        this.set("value", recurring);
      }
    });
    return new d;
  }();
  /**
   * @return {?}
   */
  var filter = function() {
    var isFunction;
    var ret = value;
    return ret.isPersistent() && (isFunction = ret.get("value")), isFunction || $templateCache.get().toString();
  };
  /**
   * @return {?}
   */
  var calculate = function() {
    return Math.abs(ptp.calculate(this.clientId()) % 100);
  };
  return{
    unique : value,
    impression : impression,
    /** @type {function (): ?} */
    clientId : filter,
    /** @type {function (): ?} */
    clientPercent : calculate
  };
}), define("common/juggler", ["core/analytics/identity", "shared/corefuncs"], function(dataAndEvents, $) {
  var collection = {};
  /**
   * @param {?} method
   * @return {undefined}
   */
  var f = function(method) {
    collection[method] = this;
    /** @type {null} */
    this._emit = null;
    this.meta = {};
    /** @type {Array} */
    this.allowedOverwrites = ["thread", "forum", "forum_id", "user_id"];
    /** @type {Array} */
    this.reservedKeys = this.allowedOverwrites.slice().concat(["imp", "event", "prev_imp"]);
    /** @type {Array} */
    this.preloadBuffer = [];
  };
  return $.extend(f.prototype, {
    /**
     * @return {?}
     */
    copySettings : function() {
      return $.extend({}, this.settings, this.meta);
    },
    /**
     * @param {?} o
     * @return {undefined}
     */
    overwrite : function(o) {
      /** @type {number} */
      var model = 0;
      var cnl = this.allowedOverwrites.length;
      for (;cnl > model;model++) {
        var i = this.allowedOverwrites[model];
        if (o.hasOwnProperty(i)) {
          this.meta[i] = o[i];
        }
      }
    },
    /**
     * @param {Function} a
     * @return {undefined}
     */
    load : function(a) {
      var self = this;
      /** @type {Function} */
      self.settings = a;
      self.url = a.url;
      if ("https:" === window.location.protocol) {
        self.url = self.url.replace("http:", "https:");
      }
      $.each(self.allowedOverwrites, function(name) {
        self.meta[name] = a[name];
      });
      self.meta.imp = dataAndEvents.impression.impId;
      self.meta.prev_imp = dataAndEvents.impression.prevImp;
      /**
       * @param {Object} fn
       * @return {undefined}
       */
      self._emit = function(fn) {
        $.each(self.meta, function(dataAndEvents, key) {
          fn[key] = self.meta[key];
        });
        $.require(self.url, fn, false);
      };
      $.each(self.preloadBuffer, function(type) {
        self._emit(type);
      });
    },
    /**
     * @param {Object} value
     * @param {Object} options
     * @return {undefined}
     */
    emit : function(value, options) {
      var log = this;
      options = $.extend({}, options);
      $.each(log.reservedKeys, function(flag) {
        if (null != options[flag]) {
          throw new Error('Error: cannot overwrite event context "' + flag + '"');
        }
      });
      /** @type {Object} */
      options.event = value;
      if (null == log._emit) {
        log.preloadBuffer.push(options);
      } else {
        log._emit(options);
      }
    }
  }), {
    /**
     * @param {?} method
     * @param {(Node|string)} s
     * @return {?}
     */
    client : function(method, s) {
      return collection[method] || s && new f(method);
    }
  };
}), define("common/outboundlinkhandler", ["jquery", "underscore", "common/utils"], function($, _, self) {
  /**
   * @return {undefined}
   */
  function Tooltip() {
    /** @type {Array} */
    this.handlers = [];
    this.locked = {};
    /** @type {number} */
    this.timeout = 1E3;
  }
  return _.extend(Tooltip.prototype, {
    /**
     * @param {Event} evt
     * @return {undefined}
     */
    handleClick : function(evt) {
      var $elem = $(evt.currentTarget);
      var udataCur = this.getLinkTrackingId($elem);
      if (this.shouldHandleClick(evt, $elem, udataCur)) {
        var typePattern = _.chain(this.handlers).map(function(object) {
          return object[0].call(object[1], evt, $elem);
        }).compact().value();
        if (!self.willOpenNewWindow(evt, $elem)) {
          evt.preventDefault();
          this.setLatestClick(udataCur);
          this.delayNavigation(evt, $elem, typePattern);
        }
      }
    },
    /**
     * @param {Event} e
     * @param {string} $elem
     * @param {?} args
     * @return {undefined}
     */
    delayNavigation : function(e, $elem, args) {
      this.lockLink(this.getLinkTrackingId($elem));
      var callback = _.bind(function() {
        if (this.isLatestClick(this.getLinkTrackingId($elem))) {
          self.triggerClick($elem, e.originalEvent);
        }
      }, this);
      _.delay(callback, this.timeout);
      $.when.apply($, args).always(callback);
    },
    /**
     * @param {?} event
     * @param {?} callback
     * @return {undefined}
     */
    registerBeforeNavigationHandler : function(event, callback) {
      this.handlers.push([event, callback]);
    },
    /**
     * @param {(Object|string)} $elem
     * @return {?}
     */
    getLinkTrackingId : function($elem) {
      var tr = $elem.attr("data-tid");
      return tr || (tr = _.uniqueId(), $elem.attr("data-tid", tr)), tr;
    },
    /**
     * @param {Event} evt
     * @param {(Object|string)} $elem
     * @return {?}
     */
    shouldHandleClick : function(evt, $elem) {
      if (!this.isLinkLocked(this.getLinkTrackingId($elem))) {
        if (evt.isDefaultPrevented()) {
          return false;
        }
        if (!$elem.is("a")) {
          return false;
        }
        /** @type {RegExp} */
        var r20 = /\#.*/;
        var pagerNum = ($elem.attr("href") || "").replace(r20, "");
        return pagerNum ? true : false;
      }
    },
    /**
     * @param {?} value
     * @return {undefined}
     */
    setLatestClick : function(value) {
      this.latestLinkId = value;
    },
    /**
     * @param {?} dataAndEvents
     * @return {?}
     */
    isLatestClick : function(dataAndEvents) {
      return this.latestLinkId === dataAndEvents;
    },
    /**
     * @param {?} timeoutKey
     * @return {undefined}
     */
    lockLink : function(timeoutKey) {
      /** @type {boolean} */
      this.locked[timeoutKey] = true;
    },
    /**
     * @param {?} timeoutKey
     * @return {?}
     */
    isLinkLocked : function(timeoutKey) {
      return this.locked[timeoutKey];
    }
  }), Tooltip;
}), define("common/views/mixins", ["jquery", "modernizr", "underscore", "core/bus", "core/utils", "common/Session"], function($, dataAndEvents, model, result, deepDataAndEvents, $templateCache) {
  /**
   * @return {undefined}
   */
  function appliesPublisherClasses() {
    /**
     * @param {string} item
     * @return {?}
     */
    this._getStyleProperty = function(item) {
      var result = this.forum.get("settings");
      return this.config.forceAutoStyles || "auto" === result[item] ? this.config[item] : result[item];
    };
    /**
     * @return {?}
     */
    this.getTypeface = function() {
      return this._getStyleProperty("typeface");
    };
    /**
     * @return {?}
     */
    this.getColorScheme = function() {
      return this._getStyleProperty("colorScheme");
    };
    /**
     * @return {undefined}
     */
    this.applyPublisherClasses = function() {
      var $body = $("body");
      if ("serif" === this.getTypeface()) {
        $body.addClass("serif");
      }
      if ("dark" === this.getColorScheme()) {
        $body.addClass("dark");
      }
    };
  }
  var UiActionEventProxy = {
    /**
     * @param {Function} QUnit
     * @return {undefined}
     */
    proxyViewEvents : function(QUnit) {
      this.listenTo(QUnit, "all", function(whitespace) {
        if (0 === whitespace.indexOf("uiAction:")) {
          this.trigger.apply(this, arguments);
        }
      }, this);
    }
  };
  var OnboardHelper = {
    /**
     * @param {Object} options
     * @return {undefined}
     */
    showOnboardApp : function(options) {
      if (dataAndEvents.sessionstorage) {
        window.sessionStorage.setItem("onboard.session", JSON.stringify(options.session.user.toJSON()));
      }
      var app = model.pick(options, "threadId", "forumId", "forumPk", "activeSection");
      if (deepDataAndEvents.isMobileUserAgent()) {
        window.open("", options.windowName);
        app.windowName = options.windowName;
      }
      result.frame.sendHostMessage("onboard.show", app);
      this.trigger("uiAction:onboardOpen");
    }
  };
  var bindProfileUIListeners = {
    /**
     * @param {string} dataAndEvents
     * @param {string} tr
     * @return {undefined}
     */
    updateUserAvatarHelper : function(dataAndEvents, tr) {
      $("img[data-user=" + dataAndEvents + '][data-role="user-avatar"]').attr("src", tr);
    },
    /**
     * @param {string} dataAndEvents
     * @param {string} key
     * @return {undefined}
     */
    updateUserNameHelper : function(dataAndEvents, key) {
      /** @type {string} */
      var p = '[data-username="' + dataAndEvents + '"][data-role=username]';
      $("a" + p + ", span" + p).html(model.escape(key));
    },
    /**
     * @param {Function} QUnit
     * @return {undefined}
     */
    bindProfileUIListeners : function(QUnit) {
      this.listenTo(QUnit, {
        /**
         * @return {undefined}
         */
        "change:avatar" : function() {
          this.updateUserAvatarHelper(QUnit.user.id, QUnit.user.get("avatar").cache);
        },
        /**
         * @return {undefined}
         */
        "change:name" : function() {
          this.updateUserNameHelper(QUnit.user.get("username"), QUnit.user.get("name"));
        }
      });
    }
  };
  var ret = {
    /**
     * @param {Object} event
     * @return {?}
     */
    toggleFollow : function(event) {
      event.preventDefault();
      event.stopPropagation();
      var optgroup = event && $(event.target).closest("a[data-user]").attr("data-user");
      var suiteView = this.collection && optgroup ? this.collection.get(optgroup) : this.user;
      var User = $templateCache.get();
      return User.isLoggedOut() ? (this.trigger("authenticating"), this.listenToOnce(User, "change:id", function() {
        if (User.isLoggedIn()) {
          this.follow(suiteView);
        }
      }), void User.authenticate("reflectDotcom")) : void(suiteView.get("isFollowing") ? this.unfollow(suiteView) : this.follow(suiteView));
    },
    /**
     * @param {Object} obj
     * @return {undefined}
     */
    unfollow : function(obj) {
      obj.unfollow();
      result.trigger("uiAction:unfollowUser", obj);
    },
    /**
     * @param {Object} obj
     * @return {undefined}
     */
    follow : function(obj) {
      obj.follow();
      result.trigger("uiAction:followUser", obj);
    }
  };
  return{
    FollowButtonMixin : ret,
    UiActionEventProxy : UiActionEventProxy,
    /** @type {function (): undefined} */
    appliesPublisherClasses : appliesPublisherClasses,
    ProfileHtmlHelpers : bindProfileUIListeners,
    OnboardHelper : OnboardHelper
  };
}), define("common/views/popup", ["jquery", "underscore", "backbone", "core/bus", "core/utils", "common/models", "common/utils", "common/Session"], function($, model, Backbone, view, number, dataAndEvents, sTo, $templateCache) {
  var PopupManager = Backbone.View.extend({
    el : document.body,
    events : {
      "click .overlay" : "handleClick",
      keydown : "handleKeyPress",
      "click [data-action=close]" : "close"
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      /** @type {null} */
      this.user = null;
      this.session = $templateCache.get();
      /** @type {boolean} */
      this.fullscreen = true;
      this.$overlay = this.$el.find(".overlay");
      var $ = this;
      if (sTo.isIframed(window)) {
        this.listenTo(view.frame, "init", this.bootstrap);
        this.listenTo(view.frame, "open", this._open);
      } else {
        var QUnit = sTo.getConfigFromHash(window);
        $.bootstrap(QUnit);
        $.load(QUnit);
      }
    },
    /**
     * @param {Event} ev
     * @return {undefined}
     */
    handleClick : function(ev) {
      if (!$(ev.target).closest(this.containerId).length) {
        this.close();
      }
    },
    /**
     * @param {Event} event
     * @return {?}
     */
    handleKeyPress : function(event) {
      return 27 === event.which ? (event.preventDefault(), event.stopPropagation(), void this.close()) : void 0;
    },
    /**
     * @return {undefined}
     */
    open : function() {
      if (sTo.isIframed(window)) {
        view.frame.sendHostMessage("openReady");
      } else {
        this._open();
      }
    },
    /**
     * @return {undefined}
     */
    _open : function() {
      this.trigger("open");
      this.$overlay.addClass("active");
      window.focus();
    },
    /**
     * @return {undefined}
     */
    close : function() {
      var options = this;
      if (options.fullscreen) {
        options.$overlay.removeClass("active");
        var n = number.transitionEndEvent;
        if (n) {
          options.$overlay.one(n, function() {
            options._closeWindow();
          });
        } else {
          model.defer(model.bind(options._closeWindow, options));
        }
      }
    },
    /**
     * @return {undefined}
     */
    _closeWindow : function() {
      if (sTo.isIframed(window)) {
        view.frame.sendHostMessage("close");
      } else {
        window.close();
      }
    },
    bootstrap : $.noop,
    load : $.noop
  });
  return{
    PopupManager : PopupManager
  };
}), function(define) {
  define("when", [], function() {
    /**
     * @param {?} value
     * @param {Function} done
     * @param {Function} onRejected
     * @param {?} progressed
     * @return {?}
     */
    function when(value, done, onRejected, progressed) {
      return resolve(value).then(done, onRejected, progressed);
    }
    /**
     * @param {?} a
     * @return {?}
     */
    function resolve(a) {
      var promise;
      var deferred;
      return a instanceof Promise ? promise = a : isPromise(a) ? (deferred = defer(), a.then(function(config) {
        deferred.resolve(config);
      }, function(value) {
        deferred.reject(value);
      }, function(deepDataAndEvents) {
        deferred.progress(deepDataAndEvents);
      }), promise = deferred.promise) : promise = fulfilled(a), promise;
    }
    /**
     * @param {?} a
     * @return {?}
     */
    function reject(a) {
      return when(a, complete);
    }
    /**
     * @param {Function} then
     * @return {undefined}
     */
    function Promise(then) {
      /** @type {Function} */
      this.then = then;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    function fulfilled(value) {
      var p = new Promise(function(valueMapper) {
        try {
          return resolve(valueMapper ? valueMapper(value) : value);
        } catch (success) {
          return complete(success);
        }
      });
      return p;
    }
    /**
     * @param {?} success
     * @return {?}
     */
    function complete(success) {
      var result = new Promise(function(dataAndEvents, done) {
        try {
          return done ? resolve(done(success)) : complete(success);
        } catch (onSuccess) {
          return complete(onSuccess);
        }
      });
      return result;
    }
    /**
     * @return {?}
     */
    function defer() {
      /**
       * @param {Function} onFulfilled
       * @param {Function} onRejected
       * @param {?} fn
       * @return {?}
       */
      function then(onFulfilled, onRejected, fn) {
        return _then(onFulfilled, onRejected, fn);
      }
      /**
       * @param {?} a
       * @return {?}
       */
      function success(a) {
        return reject(a);
      }
      /**
       * @param {?} a
       * @return {?}
       */
      function resolve(a) {
        return reject(complete(a));
      }
      /**
       * @param {string} deepDataAndEvents
       * @return {?}
       */
      function progress(deepDataAndEvents) {
        return complete(deepDataAndEvents);
      }
      var deferred;
      var promise;
      var vec;
      var progressValues;
      var _then;
      var complete;
      var reject;
      return promise = new Promise(then), deferred = {
        /** @type {function (Function, Function, ?): ?} */
        then : then,
        /** @type {function (?): ?} */
        resolve : success,
        /** @type {function (?): ?} */
        reject : resolve,
        /** @type {function (string): ?} */
        progress : progress,
        promise : promise,
        resolver : {
          /** @type {function (?): ?} */
          resolve : success,
          /** @type {function (?): ?} */
          reject : resolve,
          /** @type {function (string): ?} */
          progress : progress
        }
      }, vec = [], progressValues = [], _then = function(onFulfilled, onRejected, fn) {
        var deferred;
        var one;
        return deferred = defer(), one = "function" == typeof fn ? function(err) {
          try {
            deferred.progress(fn(err));
          } catch (response) {
            deferred.progress(response);
          }
        } : function(deepDataAndEvents) {
          deferred.progress(deepDataAndEvents);
        }, vec.push(function(promise) {
          promise.then(onFulfilled, onRejected).then(deferred.resolve, deferred.reject, one);
        }), progressValues.push(one), deferred.promise;
      }, complete = function(deepDataAndEvents) {
        return fn(progressValues, deepDataAndEvents), deepDataAndEvents;
      }, reject = function(a) {
        return a = resolve(a), _then = a.then, reject = resolve, complete = noop, fn(vec, a), progressValues = vec = recurring, a;
      }, deferred;
    }
    /**
     * @param {Object} obj
     * @return {?}
     */
    function isPromise(obj) {
      return obj && "function" == typeof obj.then;
    }
    /**
     * @param {?} obj
     * @param {number} val
     * @param {Function} onFulfilled
     * @param {?} onRejected
     * @param {?} fn
     * @return {?}
     */
    function some(obj, val, onFulfilled, onRejected, fn) {
      return checkCallbacks(2, arguments), when(obj, function(arr2) {
        /**
         * @param {string} deepDataAndEvents
         * @return {undefined}
         */
        function rejecter(deepDataAndEvents) {
          rejectOne(deepDataAndEvents);
        }
        /**
         * @param {string} val
         * @return {undefined}
         */
        function fulfiller(val) {
          fulfillOne(val);
        }
        var istart;
        var k;
        var out;
        var ok;
        var promise;
        var fulfillOne;
        var rejectOne;
        var progress;
        var value;
        var i;
        if (value = arr2.length >>> 0, istart = Math.max(0, Math.min(val, value)), out = [], k = value - istart + 1, ok = [], promise = defer(), istart) {
          progress = promise.progress;
          /**
           * @param {string} deepDataAndEvents
           * @return {undefined}
           */
          rejectOne = function(deepDataAndEvents) {
            ok.push(deepDataAndEvents);
            if (!--k) {
              /** @type {function (): undefined} */
              fulfillOne = rejectOne = noop;
              promise.reject(ok);
            }
          };
          /**
           * @param {string} val
           * @return {undefined}
           */
          fulfillOne = function(val) {
            out.push(val);
            if (!--istart) {
              /** @type {function (): undefined} */
              fulfillOne = rejectOne = noop;
              promise.resolve(out);
            }
          };
          /** @type {number} */
          i = 0;
          for (;value > i;++i) {
            if (i in arr2) {
              when(arr2[i], fulfiller, rejecter, progress);
            }
          }
        } else {
          promise.resolve(out);
        }
        return promise.then(onFulfilled, onRejected, fn);
      });
    }
    /**
     * @param {?} obj
     * @param {Function} onFulfilled
     * @param {?} onRejected
     * @param {?} n
     * @return {?}
     */
    function any(obj, onFulfilled, onRejected, n) {
      /**
       * @param {Array} val
       * @return {?}
       */
      function unwrapSingleResult(val) {
        return onFulfilled ? onFulfilled(val[0]) : val[0];
      }
      return some(obj, 1, unwrapSingleResult, onRejected, n);
    }
    /**
     * @param {?} val
     * @param {Function} onFulfilled
     * @param {Function} onRejected
     * @param {?} assert
     * @return {?}
     */
    function all(val, onFulfilled, onRejected, assert) {
      return checkCallbacks(1, arguments), map(val, restoreScript).then(onFulfilled, onRejected, assert);
    }
    /**
     * @return {?}
     */
    function join() {
      return map(arguments, restoreScript);
    }
    /**
     * @param {Function} callback
     * @param {Function} object
     * @return {?}
     */
    function map(callback, object) {
      return when(callback, function(arr2) {
        var ok;
        var j;
        var origCount;
        var resolveOne;
        var i;
        var opened;
        if (origCount = j = arr2.length >>> 0, ok = [], opened = defer(), origCount) {
          /**
           * @param {?} item
           * @param {?} i
           * @return {undefined}
           */
          resolveOne = function(item, i) {
            when(item, object).then(function(offsetPosition) {
              ok[i] = offsetPosition;
              if (!--origCount) {
                opened.resolve(ok);
              }
            }, opened.reject);
          };
          /** @type {number} */
          i = 0;
          for (;j > i;i++) {
            if (i in arr2) {
              resolveOne(arr2[i], i);
            } else {
              --origCount;
            }
          }
        } else {
          opened.resolve(ok);
        }
        return opened.promise;
      });
    }
    /**
     * @param {Function} promise
     * @param {Object} cb
     * @return {?}
     */
    function reduce(promise, cb) {
      var args = slice.call(arguments, 1);
      return when(promise, function(recurring) {
        var pending;
        return pending = recurring.length, args[0] = function(promise, isXML, files) {
          return when(promise, function(outErr) {
            return when(isXML, function(srcFiles) {
              return cb(outErr, srcFiles, files, pending);
            });
          });
        }, wrapper.apply(recurring, args);
      });
    }
    /**
     * @param {?} obj
     * @param {Object} resolver
     * @param {string} value
     * @return {?}
     */
    function chain(obj, resolver, value) {
      /** @type {boolean} */
      var r = arguments.length > 2;
      return when(obj, function(v) {
        return v = r ? value : v, resolver.resolve(v), v;
      }, function(value) {
        return resolver.reject(value), complete(value);
      }, resolver.progress);
    }
    /**
     * @param {Array} values
     * @param {?} deepDataAndEvents
     * @return {undefined}
     */
    function fn(values, deepDataAndEvents) {
      var value;
      /** @type {number} */
      var index = 0;
      for (;value = values[index++];) {
        value(deepDataAndEvents);
      }
    }
    /**
     * @param {number} expectedNumberOfNonCommentArgs
     * @param {(Arguments|Array)} arrayOfCallbacks
     * @return {undefined}
     */
    function checkCallbacks(expectedNumberOfNonCommentArgs, arrayOfCallbacks) {
      var fn;
      var i = arrayOfCallbacks.length;
      for (;i > expectedNumberOfNonCommentArgs;) {
        if (fn = arrayOfCallbacks[--i], null != fn && "function" != typeof fn) {
          throw new Error("arg " + i + " must be a function");
        }
      }
    }
    /**
     * @return {undefined}
     */
    function noop() {
    }
    /**
     * @param {?} elem
     * @return {?}
     */
    function restoreScript(elem) {
      return elem;
    }
    var wrapper;
    var slice;
    var recurring;
    return when.defer = defer, when.resolve = resolve, when.reject = reject, when.join = join, when.all = all, when.map = map, when.reduce = reduce, when.any = any, when.some = some, when.chain = chain, when.isPromise = isPromise, Promise.prototype = {
      /**
       * @param {Function} cb
       * @param {?} sqlt
       * @return {?}
       */
      always : function(cb, sqlt) {
        return this.then(cb, cb, sqlt);
      },
      /**
       * @param {Function} onRejected
       * @return {?}
       */
      otherwise : function(onRejected) {
        return this.then(recurring, onRejected);
      },
      /**
       * @param {Function} fulfilled
       * @return {?}
       */
      spread : function(fulfilled) {
        return this.then(function(objId) {
          return all(objId, function(value) {
            return fulfilled.apply(recurring, value);
          });
        });
      }
    }, slice = [].slice, wrapper = [].reduce || function(reduceFunc) {
      var arr;
      var args;
      var reduced;
      var len;
      var i;
      if (i = 0, arr = Object(this), len = arr.length >>> 0, args = arguments, args.length <= 1) {
        for (;;) {
          if (i in arr) {
            reduced = arr[i++];
            break;
          }
          if (++i >= len) {
            throw new TypeError;
          }
        }
      } else {
        reduced = args[1];
      }
      for (;len > i;++i) {
        if (i in arr) {
          reduced = reduceFunc(reduced, arr[i], i, arr);
        }
      }
      return reduced;
    }, when;
  });
}("function" == typeof define && define.amd ? define : function(factory) {
  if ("object" == typeof exports) {
    module.exports = factory();
  } else {
    this.when = factory();
  }
}), function(global, tmp) {
  /**
   * @param {string} name
   * @param {Object} values
   * @return {undefined}
   */
  function callback(name, values) {
    var event;
    var key;
    values = values || {};
    name = "raven" + name.substr(0, 1).toUpperCase() + name.substr(1);
    if (document.createEvent) {
      /** @type {(Event|null)} */
      event = document.createEvent("HTMLEvents");
      event.initEvent(name, true, true);
    } else {
      event = document.createEventObject();
      /** @type {string} */
      event.eventType = name;
    }
    for (key in values) {
      if (hasOwnProperty(values, key)) {
        event[key] = values[key];
      }
    }
    if (document.createEvent) {
      document.dispatchEvent(event);
    } else {
      try {
        document.fireEvent("on" + event.eventType.toLowerCase(), event);
      } catch (e) {
      }
    }
  }
  /**
   * @param {string} selector
   * @return {undefined}
   */
  function ctor(selector) {
    /** @type {string} */
    this.name = "RavenConfigError";
    /** @type {string} */
    this.message = selector;
  }
  /**
   * @param {string} fn
   * @return {?}
   */
  function init(fn) {
    /** @type {(Array.<string>|null)} */
    var args = reName.exec(fn);
    var result = {};
    /** @type {number} */
    var l = 7;
    try {
      for (;l--;) {
        /** @type {string} */
        result[key[l]] = args[l] || "";
      }
    } catch (f) {
      throw new ctor("Invalid DSN: " + fn);
    }
    if (result.pass) {
      throw new ctor("Do not specify your private key in the DSN!");
    }
    return result;
  }
  /**
   * @param {Function} obj
   * @return {?}
   */
  function isUndefined(obj) {
    return void 0 === obj;
  }
  /**
   * @param {Function} obj
   * @return {?}
   */
  function isFunction(obj) {
    return "function" == typeof obj;
  }
  /**
   * @param {string} value
   * @return {?}
   */
  function isObject(value) {
    return "[object String]" === objProto.toString.call(value);
  }
  /**
   * @param {Object} fn
   * @return {?}
   */
  function keys(fn) {
    return "object" == typeof fn && null !== fn;
  }
  /**
   * @param {Object} value
   * @return {?}
   */
  function ok(value) {
    var k;
    for (k in value) {
      return false;
    }
    return true;
  }
  /**
   * @param {?} object
   * @return {?}
   */
  function objectToString(object) {
    return keys(object) && "[object Error]" === objProto.toString.call(object) || object instanceof Error;
  }
  /**
   * @param {Object} object
   * @param {string} prop
   * @return {?}
   */
  function hasOwnProperty(object, prop) {
    return objProto.hasOwnProperty.call(object, prop);
  }
  /**
   * @param {Object} obj
   * @param {Function} callback
   * @return {undefined}
   */
  function each(obj, callback) {
    var key;
    var id;
    if (isUndefined(obj.length)) {
      for (key in obj) {
        if (hasOwnProperty(obj, key)) {
          callback.call(null, key, obj[key]);
        }
      }
    } else {
      if (id = obj.length) {
        /** @type {number} */
        key = 0;
        for (;id > key;key++) {
          callback.call(null, key, obj[key]);
        }
      }
    }
  }
  /**
   * @return {undefined}
   */
  function checkAliasConflict() {
    post = "?sentry_version=4&sentry_client=raven-js/" + config.VERSION + "&sentry_key=" + user;
  }
  /**
   * @param {Object} stackInfo
   * @param {Object} options
   * @return {undefined}
   */
  function handler(stackInfo, options) {
    /** @type {Array} */
    var frames = [];
    if (stackInfo.stack) {
      if (stackInfo.stack.length) {
        each(stackInfo.stack, function(dataAndEvents, data) {
          var frame = normalizeFrame(data);
          if (frame) {
            frames.push(frame);
          }
        });
      }
    }
    callback("handle", {
      stackInfo : stackInfo,
      options : options
    });
    processException(stackInfo.name, stackInfo.message, stackInfo.url, stackInfo.lineno, frames, options);
  }
  /**
   * @param {Object} frame
   * @return {?}
   */
  function normalizeFrame(frame) {
    if (frame.url) {
      var i;
      var normalized = {
        filename : frame.url,
        lineno : frame.line,
        colno : frame.column,
        "function" : frame.func || "?"
      };
      var context = extractContextFromFrame(frame);
      if (context) {
        /** @type {Array} */
        var keys = ["pre_context", "context_line", "post_context"];
        /** @type {number} */
        i = 3;
        for (;i--;) {
          normalized[keys[i]] = context[i];
        }
      }
      return normalized.in_app = !(!globalOptions.includePaths.test(normalized.filename) || (/(Raven|TraceKit)\./.test(normalized["function"]) || /raven\.(min\.)?js$/.test(normalized.filename))), normalized;
    }
  }
  /**
   * @param {Object} frame
   * @return {?}
   */
  function extractContextFromFrame(frame) {
    if (frame.context && globalOptions.fetchContext) {
      var context = frame.context;
      /** @type {number} */
      var pivot = ~~(context.length / 2);
      var j = context.length;
      /** @type {boolean} */
      var e = false;
      for (;j--;) {
        if (context[j].length > 300) {
          /** @type {boolean} */
          e = true;
          break;
        }
      }
      if (e) {
        if (isUndefined(frame.column)) {
          return;
        }
        return[[], context[pivot].substr(frame.column, 50), []];
      }
      return[context.slice(0, pivot), context[pivot], context.slice(pivot + 1)];
    }
  }
  /**
   * @param {string} type
   * @param {string} message
   * @param {(Object|string)} filename
   * @param {boolean} lineno
   * @param {?} frames
   * @param {Object} options
   * @return {undefined}
   */
  function processException(type, message, filename, lineno, frames, options) {
    var stacktrace;
    var label;
    message += "";
    if ("Error" !== type || message) {
      if (!globalOptions.ignoreErrors.test(message)) {
        if (frames && frames.length) {
          filename = frames[0].filename || filename;
          frames.reverse();
          stacktrace = {
            frames : frames
          };
        } else {
          if (filename) {
            stacktrace = {
              frames : [{
                filename : filename,
                lineno : lineno,
                in_app : true
              }]
            };
          }
        }
        message = f(message, globalOptions.maxMessageLength);
        if (!(globalOptions.ignoreUrls && globalOptions.ignoreUrls.test(filename))) {
          if (!globalOptions.whitelistUrls || globalOptions.whitelistUrls.test(filename)) {
            label = lineno ? message + " at " + lineno : message;
            send(arrayMerge({
              exception : {
                type : type,
                value : message
              },
              stacktrace : stacktrace,
              culprit : filename,
              message : label
            }, options));
          }
        }
      }
    }
  }
  /**
   * @param {?} opt_attributes
   * @param {Object} arr2
   * @return {?}
   */
  function arrayMerge(opt_attributes, arr2) {
    return arr2 ? (each(arr2, function(i, offsetPosition) {
      opt_attributes[i] = offsetPosition;
    }), opt_attributes) : opt_attributes;
  }
  /**
   * @param {string} text
   * @param {number} maxLength
   * @return {?}
   */
  function f(text, maxLength) {
    return text.length <= maxLength ? text : text.substr(0, maxLength) + "\u00e2\u20ac\u00a6";
  }
  /**
   * @return {?}
   */
  function require() {
    return+new Date;
  }
  /**
   * @return {?}
   */
  function getHttpData() {
    var http = {
      url : document.location.href,
      headers : {
        "User-Agent" : navigator.userAgent
      }
    };
    return document.referrer && (http.headers.Referer = document.referrer), http;
  }
  /**
   * @param {Object} data
   * @return {undefined}
   */
  function send(data) {
    if (log()) {
      data = arrayMerge({
        project : globalProject,
        logger : globalOptions.logger,
        platform : "javascript",
        request : getHttpData()
      }, data);
      data.tags = arrayMerge(arrayMerge({}, globalOptions.tags), data.tags);
      data.extra = arrayMerge(arrayMerge({}, globalOptions.extra), data.extra);
      data.extra = arrayMerge({
        "session:duration" : require() - Block
      }, data.extra);
      if (ok(data.tags)) {
        delete data.tags;
      }
      if (result) {
        data.user = result;
      }
      if (globalOptions.release) {
        data.release = globalOptions.release;
      }
      if (isFunction(globalOptions.dataCallback)) {
        data = globalOptions.dataCallback(data) || data;
      }
      if (data) {
        if (!ok(data)) {
          if (!isFunction(globalOptions.shouldSendCallback) || globalOptions.shouldSendCallback(data)) {
            lastEventId = data.event_id || (data.event_id = guid());
            ajax(data);
          }
        }
      }
    }
  }
  /**
   * @param {Object} postData
   * @return {undefined}
   */
  function ajax(postData) {
    var img = _createElementNS();
    /** @type {string} */
    var imgSrc = code + post + "&sentry_data=" + encodeURIComponent(JSON.stringify(postData));
    /** @type {string} */
    img.crossOrigin = "anonymous";
    /**
     * @return {undefined}
     */
    img.onload = function() {
      callback("success", {
        data : postData,
        src : imgSrc
      });
    };
    /** @type {function (): undefined} */
    img.onerror = img.onabort = function() {
      callback("failure", {
        data : postData,
        src : imgSrc
      });
    };
    /** @type {string} */
    img.src = imgSrc;
  }
  /**
   * @return {?}
   */
  function _createElementNS() {
    return document.createElement("img");
  }
  /**
   * @return {?}
   */
  function log() {
    return elsecase ? code ? true : (assert("error", "Error: Raven has not been configured."), false) : false;
  }
  /**
   * @param {Array} args
   * @return {?}
   */
  function add(args) {
    var expression;
    /** @type {Array} */
    var scope = [];
    /** @type {number} */
    var i = 0;
    var len = args.length;
    for (;len > i;i++) {
      expression = args[i];
      if (isObject(expression)) {
        scope.push(expression.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"));
      } else {
        if (expression) {
          if (expression.source) {
            scope.push(expression.source);
          }
        }
      }
    }
    return new RegExp(scope.join("|"), "i");
  }
  /**
   * @return {?}
   */
  function guid() {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c_name) {
      /** @type {number} */
      var val = 16 * Math.random() | 0;
      /** @type {number} */
      var iterator = "x" == c_name ? val : 3 & val | 8;
      return iterator.toString(16);
    });
  }
  /**
   * @param {string} type
   * @param {string} message
   * @return {undefined}
   */
  function assert(type, message) {
    if (global.console) {
      if (console[type]) {
        if (config.debug) {
          console[type](message);
        }
      }
    }
  }
  /**
   * @return {undefined}
   */
  function start() {
    var options = global.RavenConfig;
    if (options) {
      config.config(options.dsn, options.config).install();
    }
  }
  var TraceKit = {
    remoteFetching : false,
    collectWindowErrors : true,
    linesOfContext : 7
  };
  /** @type {function (this:(Array.<T>|string|{length: number}), *=, *=): Array.<T>} */
  var __slice = [].slice;
  /** @type {string} */
  var UNKNOWN_FUNCTION = "?";
  /**
   * @param {Function} fn
   * @return {?}
   */
  TraceKit.wrap = function(fn) {
    /**
     * @return {?}
     */
    function wrapped() {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        throw TraceKit.report(e), e;
      }
    }
    return wrapped;
  };
  TraceKit.report = function() {
    /**
     * @param {Function} callback
     * @return {undefined}
     */
    function subscribe(callback) {
      sendAPIRequest();
      list.push(callback);
    }
    /**
     * @param {?} callback
     * @return {undefined}
     */
    function unsubscribe(callback) {
      /** @type {number} */
      var i = list.length - 1;
      for (;i >= 0;--i) {
        if (list[i] === callback) {
          list.splice(i, 1);
        }
      }
    }
    /**
     * @return {undefined}
     */
    function ok() {
      fail();
      /** @type {Array} */
      list = [];
    }
    /**
     * @param {Array} stack
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    function notifyHandlers(stack, dataAndEvents) {
      /** @type {null} */
      var bulk = null;
      if (!dataAndEvents || TraceKit.collectWindowErrors) {
        var name;
        for (name in list) {
          if (hasOwnProperty(list, name)) {
            try {
              list[name].apply(null, [stack].concat(__slice.call(arguments, 2)));
            } catch (fn) {
              bulk = fn;
            }
          }
        }
        if (bulk) {
          throw bulk;
        }
      }
    }
    /**
     * @param {string} message
     * @param {string} url
     * @param {number} lineNo
     * @param {number} column
     * @param {?} ex
     * @return {?}
     */
    function traceKitWindowOnError(message, url, lineNo, column, ex) {
      /** @type {null} */
      var stack = null;
      if (lastExceptionStack) {
        TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
        apply();
      } else {
        if (ex) {
          stack = TraceKit.computeStackTrace(ex);
          notifyHandlers(stack, true);
        } else {
          var location = {
            url : url,
            line : lineNo,
            column : column
          };
          location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
          location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
          stack = {
            message : message,
            url : document.location.href,
            stack : [location]
          };
          notifyHandlers(stack, true);
        }
      }
      return fn ? fn.apply(this, arguments) : false;
    }
    /**
     * @return {undefined}
     */
    function sendAPIRequest() {
      if (!n) {
        /** @type {(function (string, string, number): ?|null)} */
        fn = global.onerror;
        /** @type {function (string, string, number, number, ?): ?} */
        global.onerror = traceKitWindowOnError;
        /** @type {boolean} */
        n = true;
      }
    }
    /**
     * @return {undefined}
     */
    function fail() {
      if (n) {
        global.onerror = fn;
        /** @type {boolean} */
        n = false;
        /** @type {Function} */
        fn = tmp;
      }
    }
    /**
     * @return {undefined}
     */
    function apply() {
      var s = lastExceptionStack;
      var args = anonymousDefine;
      /** @type {null} */
      anonymousDefine = null;
      /** @type {null} */
      lastExceptionStack = null;
      /** @type {null} */
      lastException = null;
      notifyHandlers.apply(null, [s, false].concat(args));
    }
    /**
     * @param {Error} ex
     * @param {boolean} failing_message
     * @return {undefined}
     */
    function report(ex, failing_message) {
      /** @type {Array.<?>} */
      var args = __slice.call(arguments, 1);
      if (lastExceptionStack) {
        if (lastException === ex) {
          return;
        }
        apply();
      }
      var stack = TraceKit.computeStackTrace(ex);
      if (lastExceptionStack = stack, lastException = ex, anonymousDefine = args, global.setTimeout(function() {
        if (lastException === ex) {
          apply();
        }
      }, stack.incomplete ? 2E3 : 0), failing_message !== false) {
        throw ex;
      }
    }
    var fn;
    var n;
    /** @type {Array} */
    var list = [];
    /** @type {null} */
    var anonymousDefine = null;
    /** @type {null} */
    var lastException = null;
    /** @type {null} */
    var lastExceptionStack = null;
    return report.subscribe = subscribe, report.unsubscribe = unsubscribe, report.uninstall = ok, report;
  }();
  TraceKit.computeStackTrace = function() {
    /**
     * @param {string} path
     * @return {?}
     */
    function loadSource(path) {
      if (!TraceKit.remoteFetching) {
        return "";
      }
      try {
        /**
         * @return {?}
         */
        var getXHR = function() {
          try {
            return new global.XMLHttpRequest;
          } catch (b) {
            return new global.ActiveXObject("Microsoft.XMLHTTP");
          }
        };
        var xhr = getXHR();
        return xhr.open("GET", path, false), xhr.send(""), xhr.responseText;
      } catch (e) {
        return "";
      }
    }
    /**
     * @param {string} url
     * @return {?}
     */
    function getSource(url) {
      if (!isObject(url)) {
        return[];
      }
      if (!hasOwnProperty(sourceCache, url)) {
        /** @type {string} */
        var source = "";
        if (-1 !== url.indexOf(document.domain)) {
          source = loadSource(url);
        }
        sourceCache[url] = source ? source.split("\n") : [];
      }
      return sourceCache[url];
    }
    /**
     * @param {string} url
     * @param {number} lineNo
     * @return {?}
     */
    function guessFunctionName(url, lineNo) {
      var matched;
      /** @type {RegExp} */
      var quickExpr = /function ([^(]*)\(([^)]*)\)/;
      /** @type {RegExp} */
      var rquickExpr = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
      /** @type {string} */
      var selector = "";
      /** @type {number} */
      var l = 10;
      var source = getSource(url);
      if (!source.length) {
        return UNKNOWN_FUNCTION;
      }
      /** @type {number} */
      var i = 0;
      for (;l > i;++i) {
        if (selector = source[lineNo - i] + selector, !isUndefined(selector)) {
          if (matched = rquickExpr.exec(selector)) {
            return matched[1];
          }
          if (matched = quickExpr.exec(selector)) {
            return matched[1];
          }
        }
      }
      return UNKNOWN_FUNCTION;
    }
    /**
     * @param {string} url
     * @param {number} line
     * @return {?}
     */
    function gatherContext(url, line) {
      var args = getSource(url);
      if (!args.length) {
        return null;
      }
      /** @type {Array} */
      var paths = [];
      /** @type {number} */
      var linesBefore = Math.floor(TraceKit.linesOfContext / 2);
      /** @type {number} */
      var linesAfter = linesBefore + TraceKit.linesOfContext % 2;
      /** @type {number} */
      var fromIndex = Math.max(0, line - linesBefore - 1);
      /** @type {number} */
      var l = Math.min(args.length, line + linesAfter - 1);
      line -= 1;
      /** @type {number} */
      var i = fromIndex;
      for (;l > i;++i) {
        if (!isUndefined(args[i])) {
          paths.push(args[i]);
        }
      }
      return paths.length > 0 ? paths : null;
    }
    /**
     * @param {string} str
     * @return {?}
     */
    function escapeRegExp(str) {
      return str.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, "\\$&");
    }
    /**
     * @param {string} str
     * @return {?}
     */
    function escape(str) {
      return escapeRegExp(str).replace("<", "(?:<|&lt;)").replace(">", "(?:>|&gt;)").replace("&", "(?:&|&amp;)").replace('"', '(?:"|&quot;)').replace(/\s+/g, "\\s+");
    }
    /**
     * @param {RegExp} re
     * @param {Array} urls
     * @return {?}
     */
    function findSourceInUrls(re, urls) {
      var source;
      var m;
      /** @type {number} */
      var i = 0;
      var l = urls.length;
      for (;l > i;++i) {
        if ((source = getSource(urls[i])).length && (source = source.join("\n"), m = re.exec(source))) {
          return{
            url : urls[i],
            line : source.substring(0, m.index).split("\n").length,
            column : m.index - source.lastIndexOf("\n", m.index) - 1
          };
        }
      }
      return null;
    }
    /**
     * @param {string} fragment
     * @param {?} url
     * @param {?} line
     * @return {?}
     */
    function findSourceInLine(fragment, url, line) {
      var m;
      var source = getSource(url);
      /** @type {RegExp} */
      var re = new RegExp("\\b" + escapeRegExp(fragment) + "\\b");
      return line -= 1, source && (source.length > line && (m = re.exec(source[line]))) ? m.index : null;
    }
    /**
     * @param {string} func
     * @return {?}
     */
    function findSourceByFunctionBody(func) {
      var key;
      var re;
      var match;
      var result;
      /** @type {Array} */
      var urls = [global.location.href];
      /** @type {NodeList} */
      var codeSegments = document.getElementsByTagName("script");
      /** @type {string} */
      var selector = "" + func;
      /** @type {RegExp} */
      var quickExpr = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/;
      /** @type {RegExp} */
      var rquickExpr = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/;
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;++i) {
        var script = codeSegments[i];
        if (script.src) {
          urls.push(script.src);
        }
      }
      if (match = quickExpr.exec(selector)) {
        /** @type {string} */
        var name = match[1] ? "\\s+" + match[1] : "";
        /** @type {string} */
        var r = match[2].split(",").join("\\s*,\\s*");
        key = escapeRegExp(match[3]).replace(/;$/, ";?");
        /** @type {RegExp} */
        re = new RegExp("function" + name + "\\s*\\(\\s*" + r + "\\s*\\)\\s*{\\s*" + key + "\\s*}");
      } else {
        /** @type {RegExp} */
        re = new RegExp(escapeRegExp(selector).replace(/\s+/g, "\\s+"));
      }
      if (result = findSourceInUrls(re, urls)) {
        return result;
      }
      if (match = rquickExpr.exec(selector)) {
        /** @type {string} */
        var eventName = match[1];
        if (key = escape(match[2]), re = new RegExp("on" + eventName + "=[\\'\"]\\s*" + key + "\\s*[\\'\"]", "i"), result = findSourceInUrls(re, urls[0])) {
          return result;
        }
        if (re = new RegExp(key), result = findSourceInUrls(re, urls)) {
          return result;
        }
      }
      return null;
    }
    /**
     * @param {Object} ex
     * @return {?}
     */
    function computeStackTraceFromStackProp(ex) {
      if (!ex.stack) {
        return null;
      }
      var parts;
      var element;
      /** @type {RegExp} */
      var c = /^\s*at (.*?) ?\(?((?:file|https?|chrome-extension):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
      /** @type {RegExp} */
      var rtypenamespace = /^\s*(.*?)(?:\((.*?)\))?@((?:file|https?|chrome).*?):(\d+)(?::(\d+))?\s*$/i;
      var types = ex.stack.split("\n");
      /** @type {Array} */
      var stack = [];
      /** @type {(Array.<string>|null)} */
      var reference = /^(.*) is undefined$/.exec(ex.message);
      /** @type {number} */
      var t = 0;
      var jlen = types.length;
      for (;jlen > t;++t) {
        if (parts = rtypenamespace.exec(types[t])) {
          element = {
            url : parts[3],
            func : parts[1] || UNKNOWN_FUNCTION,
            args : parts[2] ? parts[2].split(",") : "",
            line : +parts[4],
            column : parts[5] ? +parts[5] : null
          };
        } else {
          if (!(parts = c.exec(types[t]))) {
            continue;
          }
          element = {
            url : parts[2],
            func : parts[1] || UNKNOWN_FUNCTION,
            line : +parts[3],
            column : parts[4] ? +parts[4] : null
          };
        }
        if (!element.func) {
          if (element.line) {
            element.func = guessFunctionName(element.url, element.line);
          }
        }
        if (element.line) {
          element.context = gatherContext(element.url, element.line);
        }
        stack.push(element);
      }
      return stack.length ? (stack[0].line && (!stack[0].column && reference) ? stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line) : stack[0].column || (isUndefined(ex.columnNumber) || (stack[0].column = ex.columnNumber + 1)), {
        name : ex.name,
        message : ex.message,
        url : document.location.href,
        stack : stack
      }) : null;
    }
    /**
     * @param {Error} ex
     * @return {?}
     */
    function computeStackTraceFromStacktraceProp(ex) {
      var parts;
      var stacktrace = ex.stacktrace;
      /** @type {RegExp} */
      var regAttr = / line (\d+), column (\d+) in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\) in (.*):\s*$/i;
      var types = stacktrace.split("\n");
      /** @type {Array} */
      var stack = [];
      /** @type {number} */
      var i = 0;
      var j = types.length;
      for (;j > i;i += 2) {
        if (parts = regAttr.exec(types[i])) {
          var element = {
            line : +parts[1],
            column : +parts[2],
            func : parts[3] || parts[4],
            args : parts[5] ? parts[5].split(",") : [],
            url : parts[6]
          };
          if (!element.func && (element.line && (element.func = guessFunctionName(element.url, element.line))), element.line) {
            try {
              element.context = gatherContext(element.url, element.line);
            } catch (l) {
            }
          }
          if (!element.context) {
            /** @type {Array} */
            element.context = [types[i + 1]];
          }
          stack.push(element);
        }
      }
      return stack.length ? {
        name : ex.name,
        message : ex.message,
        url : document.location.href,
        stack : stack
      } : null;
    }
    /**
     * @param {Object} ex
     * @return {?}
     */
    function computeStackTraceFromOperaMultiLineMessage(ex) {
      var lines = ex.message.split("\n");
      if (lines.length < 4) {
        return null;
      }
      var parts;
      var i;
      var len;
      var source;
      /** @type {RegExp} */
      var lineRE = /^\s*Line (\d+) of linked script ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i;
      /** @type {RegExp} */
      var lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i;
      /** @type {RegExp} */
      var lineRE1 = /^\s*Line (\d+) of function script\s*$/i;
      /** @type {Array} */
      var stack = [];
      /** @type {NodeList} */
      var scripts = document.getElementsByTagName("script");
      /** @type {Array} */
      var inlineScriptBlocks = [];
      for (i in scripts) {
        if (hasOwnProperty(scripts, i)) {
          if (!scripts[i].src) {
            inlineScriptBlocks.push(scripts[i]);
          }
        }
      }
      /** @type {number} */
      i = 2;
      len = lines.length;
      for (;len > i;i += 2) {
        /** @type {null} */
        var item = null;
        if (parts = lineRE.exec(lines[i])) {
          item = {
            url : parts[2],
            func : parts[3],
            line : +parts[1]
          };
        } else {
          if (parts = lineRE2.exec(lines[i])) {
            item = {
              url : parts[3],
              func : parts[4]
            };
            /** @type {number} */
            var relativeLine = +parts[1];
            var script = inlineScriptBlocks[parts[2] - 1];
            if (script && (source = getSource(item.url))) {
              source = source.join("\n");
              var end = source.indexOf(script.innerText);
              if (end >= 0) {
                item.line = relativeLine + source.substring(0, end).split("\n").length;
              }
            }
          } else {
            if (parts = lineRE1.exec(lines[i])) {
              /** @type {string} */
              var url = global.location.href.replace(/#.*$/, "");
              /** @type {string} */
              var line = parts[1];
              /** @type {RegExp} */
              var re = new RegExp(escape(lines[i + 1]));
              source = findSourceInUrls(re, [url]);
              item = {
                url : url,
                line : source ? source.line : line,
                func : ""
              };
            }
          }
        }
        if (item) {
          if (!item.func) {
            item.func = guessFunctionName(item.url, item.line);
          }
          var context = gatherContext(item.url, item.line);
          var midline = context ? context[Math.floor(context.length / 2)] : null;
          item.context = context && midline.replace(/^\s*/, "") === lines[i + 1].replace(/^\s*/, "") ? context : [lines[i + 1]];
          stack.push(item);
        }
      }
      return stack.length ? {
        name : ex.name,
        message : lines[0],
        url : document.location.href,
        stack : stack
      } : null;
    }
    /**
     * @param {Object} stackInfo
     * @param {string} url
     * @param {number} lineNo
     * @param {string} arg
     * @return {?}
     */
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, arg) {
      var initial = {
        url : url,
        line : lineNo
      };
      if (initial.url && initial.line) {
        /** @type {boolean} */
        stackInfo.incomplete = false;
        if (!initial.func) {
          initial.func = guessFunctionName(initial.url, initial.line);
        }
        if (!initial.context) {
          initial.context = gatherContext(initial.url, initial.line);
        }
        /** @type {(Array.<string>|null)} */
        var keyName = / '([^']+)' /.exec(arg);
        if (keyName && (initial.column = findSourceInLine(keyName[1], initial.url, initial.line)), stackInfo.stack.length > 0 && stackInfo.stack[0].url === initial.url) {
          if (stackInfo.stack[0].line === initial.line) {
            return false;
          }
          if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
            return stackInfo.stack[0].line = initial.line, stackInfo.stack[0].context = initial.context, false;
          }
        }
        return stackInfo.stack.unshift(initial), stackInfo.partial = true, true;
      }
      return stackInfo.incomplete = true, false;
    }
    /**
     * @param {Object} ex
     * @param {number} depth
     * @return {?}
     */
    function computeStackTraceByWalkingCallerChain(ex, depth) {
      var parts;
      var item;
      var source;
      /** @type {RegExp} */
      var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i;
      /** @type {Array} */
      var stack = [];
      var funcs = {};
      /** @type {boolean} */
      var recursion = false;
      /** @type {(Function|null)} */
      var curr = computeStackTraceByWalkingCallerChain.caller;
      for (;curr && !recursion;curr = curr.caller) {
        if (curr !== computeStackTrace && curr !== TraceKit.report) {
          if (item = {
            url : null,
            func : UNKNOWN_FUNCTION,
            line : null,
            column : null
          }, curr.name ? item.func = curr.name : (parts = functionName.exec(curr.toString())) && (item.func = parts[1]), source = findSourceByFunctionBody(curr)) {
            item.url = source.url;
            item.line = source.line;
            if (item.func === UNKNOWN_FUNCTION) {
              item.func = guessFunctionName(item.url, item.line);
            }
            /** @type {(Array.<string>|null)} */
            var reference = / '([^']+)' /.exec(ex.message || ex.description);
            if (reference) {
              item.column = findSourceInLine(reference[1], source.url, source.line);
            }
          }
          if (funcs["" + curr]) {
            /** @type {boolean} */
            recursion = true;
          } else {
            /** @type {boolean} */
            funcs["" + curr] = true;
          }
          stack.push(item);
        }
      }
      if (depth) {
        stack.splice(0, depth);
      }
      var result = {
        name : ex.name,
        message : ex.message,
        url : document.location.href,
        stack : stack
      };
      return augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description), result;
    }
    /**
     * @param {Error} ex
     * @param {number} depth
     * @return {?}
     */
    function computeStackTrace(ex, depth) {
      /** @type {null} */
      var stack = null;
      /** @type {number} */
      depth = null == depth ? 0 : +depth;
      try {
        if (stack = computeStackTraceFromStacktraceProp(ex)) {
          return stack;
        }
      } catch (d) {
        if (t) {
          throw d;
        }
      }
      try {
        if (stack = computeStackTraceFromStackProp(ex)) {
          return stack;
        }
      } catch (d) {
        if (t) {
          throw d;
        }
      }
      try {
        if (stack = computeStackTraceFromOperaMultiLineMessage(ex)) {
          return stack;
        }
      } catch (d) {
        if (t) {
          throw d;
        }
      }
      try {
        if (stack = computeStackTraceByWalkingCallerChain(ex, depth + 1)) {
          return stack;
        }
      } catch (d) {
        if (t) {
          throw d;
        }
      }
      return{};
    }
    /** @type {boolean} */
    var t = false;
    var sourceCache = {};
    return computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement, computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp, computeStackTrace.guessFunctionName = guessFunctionName, computeStackTrace.gatherContext = gatherContext, computeStackTrace;
  }();
  var declarationError;
  var lastEventId;
  var code;
  var result;
  var user;
  var globalProject;
  var post;
  var previousKey = global.Raven;
  /** @type {boolean} */
  var elsecase = !("object" != typeof JSON || !JSON.stringify);
  var globalOptions = {
    logger : "javascript",
    ignoreErrors : [],
    ignoreUrls : [],
    whitelistUrls : [],
    includePaths : [],
    collectWindowErrors : true,
    tags : {},
    maxMessageLength : 100,
    extra : {}
  };
  /** @type {boolean} */
  var R = false;
  var objProto = Object.prototype;
  var Block = require();
  var config = {
    VERSION : "1.1.19",
    debug : true,
    /**
     * @return {?}
     */
    noConflict : function() {
      return global.Raven = previousKey, config;
    },
    /**
     * @param {string} options
     * @param {Object} c
     * @return {?}
     */
    config : function(options, c) {
      if (code) {
        return assert("error", "Error: Raven has already been configured"), config;
      }
      if (!options) {
        return config;
      }
      var req = init(options);
      var lastSlash = req.path.lastIndexOf("/");
      var path = req.path.substr(1, lastSlash);
      return c && each(c, function(key, value) {
        globalOptions[key] = value;
      }), globalOptions.ignoreErrors.push(/^Script error\.?$/), globalOptions.ignoreErrors.push(/^Javascript error: Script error\.? on line 0$/), globalOptions.ignoreErrors = add(globalOptions.ignoreErrors), globalOptions.ignoreUrls = globalOptions.ignoreUrls.length ? add(globalOptions.ignoreUrls) : false, globalOptions.whitelistUrls = globalOptions.whitelistUrls.length ? add(globalOptions.whitelistUrls) : false, globalOptions.includePaths = add(globalOptions.includePaths), user = req.user, globalProject = 
      req.path.substr(lastSlash + 1), code = "//" + req.host + (req.port ? ":" + req.port : "") + "/" + path + "api/" + globalProject + "/store/", req.protocol && (code = req.protocol + ":" + code), globalOptions.fetchContext && (TraceKit.remoteFetching = true), globalOptions.linesOfContext && (TraceKit.linesOfContext = globalOptions.linesOfContext), TraceKit.collectWindowErrors = !!globalOptions.collectWindowErrors, checkAliasConflict(), config;
    },
    /**
     * @return {?}
     */
    install : function() {
      return log() && (!R && (TraceKit.report.subscribe(handler), R = true)), config;
    },
    /**
     * @param {Function} a
     * @param {Function} name
     * @param {Function} value
     * @return {?}
     */
    context : function(a, name, value) {
      return isFunction(a) && (value = name || [], name = a, a = tmp), config.wrap(a, name).apply(this, value);
    },
    /**
     * @param {Object} options
     * @param {Function} func
     * @return {?}
     */
    wrap : function(options, func) {
      /**
       * @return {?}
       */
      function wrapped() {
        /** @type {Array} */
        var args = [];
        /** @type {number} */
        var i = arguments.length;
        var lastSubject = !options || options && options.deep !== false;
        for (;i--;) {
          args[i] = lastSubject ? config.wrap(options, arguments[i]) : arguments[i];
        }
        try {
          return func.apply(this, args);
        } catch (name) {
          throw config.captureException(name, options), name;
        }
      }
      if (isUndefined(func) && !isFunction(options)) {
        return options;
      }
      if (isFunction(options) && (func = options, options = tmp), !isFunction(func)) {
        return func;
      }
      if (func.__raven__) {
        return func;
      }
      var key;
      for (key in func) {
        if (hasOwnProperty(func, key)) {
          wrapped[key] = func[key];
        }
      }
      return wrapped.__raven__ = true, wrapped.__inner__ = func, wrapped;
    },
    /**
     * @return {?}
     */
    uninstall : function() {
      return TraceKit.report.uninstall(), R = false, config;
    },
    /**
     * @param {?} e
     * @param {Object} options
     * @return {?}
     */
    captureException : function(e, options) {
      if (!objectToString(e)) {
        return config.captureMessage(e, options);
      }
      declarationError = e;
      try {
        TraceKit.report(e, options);
      } catch (dom) {
        if (e !== dom) {
          throw dom;
        }
      }
      return config;
    },
    /**
     * @param {(number|string)} name
     * @param {Object} options
     * @return {?}
     */
    captureMessage : function(name, options) {
      return globalOptions.ignoreErrors.test && globalOptions.ignoreErrors.test(name) ? void 0 : (send(arrayMerge({
        message : name + ""
      }, options)), config);
    },
    /**
     * @param {?} subKey
     * @return {?}
     */
    setUserContext : function(subKey) {
      return result = subKey, config;
    },
    /**
     * @param {?} dataAndEvents
     * @return {?}
     */
    setExtraContext : function(dataAndEvents) {
      return globalOptions.extra = dataAndEvents || {}, config;
    },
    /**
     * @param {Object} dataAndEvents
     * @return {?}
     */
    setTagsContext : function(dataAndEvents) {
      return globalOptions.tags = dataAndEvents || {}, config;
    },
    /**
     * @param {?} release
     * @return {?}
     */
    setReleaseContext : function(release) {
      return globalOptions.release = release, config;
    },
    /**
     * @param {?} dataAndEvents
     * @return {?}
     */
    setDataCallback : function(dataAndEvents) {
      return globalOptions.dataCallback = dataAndEvents, config;
    },
    /**
     * @param {?} dataAndEvents
     * @return {?}
     */
    setShouldSendCallback : function(dataAndEvents) {
      return globalOptions.shouldSendCallback = dataAndEvents, config;
    },
    /**
     * @return {?}
     */
    lastException : function() {
      return declarationError;
    },
    /**
     * @return {?}
     */
    lastEventId : function() {
      return lastEventId;
    },
    /**
     * @return {?}
     */
    isSetup : function() {
      return log();
    }
  };
  /** @type {function (?): ?} */
  config.setUser = config.setUserContext;
  /** @type {Array.<string>} */
  var key = "source protocol user pass host port path".split(" ");
  /** @type {RegExp} */
  var reName = /^(?:(\w+):)?\/\/(\w+)(:\w+)?@([\w\.-]+)(?::(\d+))?(\/.*)/;
  /** @type {Error} */
  ctor.prototype = new Error;
  /** @type {function (string): undefined} */
  ctor.prototype.constructor = ctor;
  start();
  if ("function" == typeof define && define.amd) {
    global.Raven = config;
    define("raven", [], function() {
      return config;
    });
  } else {
    if ("object" == typeof module) {
      module.exports = config;
    } else {
      if ("object" == typeof exports) {
        exports = config;
      } else {
        global.Raven = config;
      }
    }
  }
}("undefined" != typeof window ? window : this), function() {
  /** @type {number} */
  var lastTime = 0;
  /** @type {Array} */
  var vendors = ["webkit", "moz"];
  /** @type {number} */
  var x = 0;
  for (;x < vendors.length && !window.requestAnimationFrame;++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    /**
     * @param {function (number): ?} callback
     * @return {number}
     */
    window.requestAnimationFrame = function(callback) {
      /** @type {number} */
      var currTime = (new Date).getTime();
      /** @type {number} */
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      /** @type {number} */
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      return lastTime = currTime + timeToCall, id;
    };
  }
  if (!window.cancelAnimationFrame) {
    /**
     * @param {number} id
     * @return {?}
     */
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}(), define("common/vendor/requestAnimationFrame", function() {
}), define("common.bundle", function() {
});
