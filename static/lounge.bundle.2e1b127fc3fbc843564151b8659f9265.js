define("stance/utils", ["underscore", "exports"], function(_, field) {
  /**
   * @param {Element} parent
   * @return {?}
   */
  field.getElement = function(parent) {
    return _.isElement(parent) ? parent : parent && parent.el;
  };
  /** @type {string} */
  field.EL_ID_ATTR = "data-visibility-id";
  /** @type {string} */
  field.OBJ_ID_PROP = "_visibility_id";
  /**
   * @param {Element} data
   * @return {?}
   */
  field.getId = function(data) {
    /** @type {null} */
    var list = null;
    return _.isElement(data) ? (list = data.getAttribute(field.EL_ID_ATTR) || null, list || (list = _.uniqueId(), data.setAttribute(field.EL_ID_ATTR, list))) : data && (list = data[field.OBJ_ID_PROP] || null, list || (list = data[field.OBJ_ID_PROP] = _.uniqueId())), list;
  };
  /**
   * @param {?} self
   * @param {?} node
   * @return {?}
   */
  field.visiblePercent = function(self, node) {
    /** @type {number} */
    var change = 0;
    if (!node) {
      return change;
    }
    var pos = self.top;
    var height = pos + self.height;
    /** @type {boolean} */
    var a = node.visibleTop < pos;
    /** @type {boolean} */
    var b = node.visibleBottom > height;
    return!a && !b || a && b ? change = 1 : a ? change = (node.height - (pos - node.visibleTop)) / node.height : b && (change = (height - node.visibleTop) / node.height), Math.round(100 * change);
  };
}), define("stance/tracking", ["underscore", "jquery", "./utils", "exports"], function(_, $, component, self) {
  /** @type {Array} */
  self.events = [];
  /** @type {null} */
  self.lastPos = null;
  /**
   * @param {string} callback
   * @return {undefined}
   */
  self.clearCache = function(callback) {
    if (void 0 !== callback) {
      var id = component.getId(callback);
      if (id) {
        /** @type {null} */
        self.getElementOffset.cache[id] = null;
      }
    } else {
      self.getElementOffset.cache = {};
    }
  };
  /**
   * @param {?} el
   * @return {?}
   */
  self.calculateOffset = function(el) {
    var box = $(el).filter(":visible").offset();
    return box ? {
      top : box.top,
      height : $(el).height()
    } : null;
  };
  /**
   * @param {Element} parent
   * @return {?}
   */
  self._getElementOffset = function(parent) {
    var c = component.getElement(parent);
    if (!c) {
      return null;
    }
    var pos = self.calculateOffset(c);
    return pos ? {
      visibleTop : pos.top + (_.result(parent, "topEdgeOffset") || 0),
      visibleBottom : pos.top + pos.height - (_.result(parent, "bottomEdgeOffset") || 0),
      offsetTop : pos.top,
      height : pos.height
    } : null;
  };
  self.getElementOffset = function() {
    /**
     * @param {Element} item
     * @return {?}
     */
    var require = function(item) {
      var cache = require.cache;
      var id = component.getId(item);
      if (id && cache[id]) {
        return cache[id];
      }
      var src = self._getElementOffset(item);
      return id && (src && (cache[id] = src)), src;
    };
    return require.cache = {}, require;
  }();
  /** @type {Array} */
  self.EVENT_NAMES = ["enter", "exit", "visible", "invisible", "all"];
  /**
   * @param {Object} num
   * @return {undefined}
   */
  self.updateTracking = function(num) {
    var index;
    /**
     * @param {Object} buf
     * @return {?}
     */
    var append = function(buf) {
      return buf ? function(off) {
        return buf[off];
      } : _.constant(void 0);
    };
    if (_.any(self.EVENT_NAMES, append(num._events))) {
      index = _.indexOf(self.events, num);
      if (-1 === index) {
        self.events.push(num);
      }
    } else {
      index = _.indexOf(self.events, num);
      if (-1 !== index) {
        self.events.splice(index, 1);
      }
    }
  };
  /**
   * @param {Function} item
   * @return {undefined}
   */
  self.processEvents = function(item) {
    /** @type {Function} */
    self.lastPos = item;
    var codeSegments = self.events;
    if (codeSegments.length) {
      /** @type {number} */
      var i = codeSegments.length - 1;
      for (;i >= 0;--i) {
        var me = codeSegments[i];
        var val = me.isVisible(item);
        if (null !== val) {
          if (val !== me.lastVisible) {
            me.trigger(val ? "enter" : "exit", me, item);
          }
          me.trigger(val ? "visible" : "invisible", me, item);
          me.lastVisible = val;
        }
      }
    }
  };
}), define("stance/main", ["underscore", "jquery", "backbone", "./tracking"], function($, jQuery, Backbone, me) {
  /**
   * @param {string} n
   * @return {?}
   */
  function w(n) {
    return this instanceof w ? (this.obj = n, void(this.lastVisible = false)) : new w(n);
  }
  var removeListener = $.debounce(function() {
    me.processEvents(me.lastPos);
  }, 250);
  return $.extend(w.prototype, Backbone.Events, {
    /**
     * @param {string} type
     * @return {?}
     */
    on : function(type) {
      /** @type {boolean} */
      var b = !(this._events && this._events[type]);
      var props = Backbone.Events.on.apply(this, arguments);
      return b && me.updateTracking(this), removeListener(), props;
    },
    /**
     * @param {string} type
     * @return {?}
     */
    off : function(type) {
      var props = Backbone.Events.off.apply(this, arguments);
      return this._events && this._events[type] || me.updateTracking(this), props;
    },
    /**
     * @return {?}
     */
    offset : function() {
      return me.getElementOffset(this.obj);
    },
    /**
     * @param {Object} args
     * @return {?}
     */
    isVisible : function(args) {
      if (args = args || me.lastPos, !args) {
        return null;
      }
      var start = args.top;
      var end = start + args.height;
      var pos = this.offset();
      return pos ? pos.offsetTop >= start && pos.visibleTop < end || pos.offsetTop + pos.height <= end && pos.visibleBottom > start : null;
    },
    /**
     * @return {?}
     */
    invalidate : function() {
      return me.clearCache(this.obj), this;
    }
  }), $.extend(w, {
    invalidate : me.clearCache,
    scroll : me.processEvents,
    _windowScrollHandlerBound : false,
    _windowScrollHandler : $.throttle(function() {
      me.processEvents({
        top : jQuery(window).scrollTop(),
        height : jQuery(window).height()
      });
    }, 250),
    /**
     * @return {undefined}
     */
    bindWindowEvents : function() {
      if (!this._windowScrollHandlerBound) {
        jQuery(window).on("scroll", this._windowScrollHandler).on("resize", this._windowScrollHandler);
        /** @type {boolean} */
        this._windowScrollHandlerBound = true;
      }
    },
    /**
     * @return {undefined}
     */
    unbindWindowEvents : function() {
      jQuery(window).off("scroll", this._windowScrollHandler).off("resize", this._windowScrollHandler);
      /** @type {boolean} */
      this._windowScrollHandlerBound = false;
    }
  }), w;
}), define("stance", ["stance/main"], function(dataAndEvents) {
  return dataAndEvents;
}), define("core/templates/handlebars.partials", ["handlebars"], function(engine) {
  engine.registerPartial("cardGuestUpvoterText", engine.template({
    /**
     * @param {string} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    1 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "%(guestCount)s Guest Votes", {
        name : "gettext",
        hash : {
          guestCount : null != next_scope ? next_scope.guestCount : next_scope
        },
        data : task
      })) + " ";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    3 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "1 Guest Vote", {
        name : "gettext",
        hash : {},
        data : task
      })) + " ";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} value
     * @param {Object} options
     * @param {?} environment
     * @param {Object} context
     * @return {?}
     */
    main : function(value, options, environment, context) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = options["if"].call(value, options.gt.call(value, null != value ? value.guestCount : value, 1, {
        name : "gt",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(1, context),
        inverse : this.program(3, context),
        data : context
      }), null != buf && (optsData += buf), optsData + "\n";
    },
    useData : true
  }));
  engine.registerPartial("cardGuestUser", engine.template({
    /**
     * @param {string} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    1 : function(node, helpers, dataAndEvents, task) {
      var c;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      /** @type {string} */
      var tagName = '<li class="user ';
      return c = helpers["if"].call(node, null != node ? node.highlight : node, {
        name : "if",
        hash : {},
        fn : this.program(2, task),
        inverse : this.noop,
        data : task
      }), null != c && (tagName += c), tagName + '" data-role="guest">\n<span class="avatar" title="' + each(lambda(null != node ? node.guestText : node, node)) + '">\n<img src="' + each(lambda(null != node ? node.guestAvatarUrl : node, node)) + '" alt="' + each(helpers.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" />\n</span>\n<span class="username" title="' + each(lambda(null != node ? node.guestText : node, node)) + '">\n' + each(lambda(null != node ? node.guestText : node, node)) + "\n</span>\n</li>\n";
    },
    /**
     * @return {?}
     */
    2 : function() {
      return "highlight";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} elem
     * @param {Object} callback
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(elem, callback, environment, options) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = callback["if"].call(elem, null != elem ? elem.guestCount : elem, {
        name : "if",
        hash : {},
        fn : this.program(1, options),
        inverse : this.noop,
        data : options
      }), null != data && (headBuffer += data), headBuffer;
    },
    useData : true
  }));
  engine.registerPartial("cardOtherUserText", engine.template({
    /**
     * @param {string} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    1 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "%(guestCount)s Others", {
        name : "gettext",
        hash : {
          guestCount : null != next_scope ? next_scope.guestCount : next_scope
        },
        data : task
      })) + " ";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    3 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "1 Other", {
        name : "gettext",
        hash : {},
        data : task
      })) + " ";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} value
     * @param {Object} options
     * @param {?} environment
     * @param {Object} context
     * @return {?}
     */
    main : function(value, options, environment, context) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = options["if"].call(value, options.gt.call(value, null != value ? value.guestCount : value, 1, {
        name : "gt",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(1, context),
        inverse : this.program(3, context),
        data : context
      }), null != buf && (optsData += buf), optsData + "\n";
    },
    useData : true
  }));
  engine.registerPartial("cardUser", engine.template({
    /**
     * @return {?}
     */
    1 : function() {
      return "highlight";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} args
     * @param {Object} options
     * @param {?} environment
     * @param {Object} opt_data
     * @return {?}
     */
    main : function(args, options, environment, opt_data) {
      var result;
      var callback = this.lambda;
      var when = this.escapeExpression;
      /** @type {string} */
      var _result = '<li class="user ';
      return result = options["if"].call(args, null != args ? args.highlight : args, {
        name : "if",
        hash : {},
        fn : this.program(1, opt_data),
        inverse : this.noop,
        data : opt_data
      }), null != result && (_result += result), _result + '" data-action="profile" data-username="' + when(callback(null != args ? args.username : args, args)) + '">\n<a class="avatar" href="' + when(callback(null != args ? args.profileUrl : args, args)) + '" title="' + when(callback(null != args ? args.name : args, args)) + '">\n<img src="' + when(callback(null != (result = null != args ? args.avatar : args) ? result.cache : result, args)) + '" alt="' + when(options.gettext.call(args, "Avatar", 
      {
        name : "gettext",
        hash : {},
        data : opt_data
      })) + '" />\n</a>\n<a class="username" href="' + when(callback(null != args ? args.profileUrl : args, args)) + '" title="' + when(callback(null != args ? args.name : args, args)) + '">\n' + when(callback(null != args ? args.name : args, args)) + "\n</a>\n</li>\n";
    },
    useData : true
  }));
  engine.registerPartial("genericFollowButton", engine.template({
    /**
     * @return {?}
     */
    1 : function() {
      return " active";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} elem
     * @param {Object} options
     * @param {?} environment
     * @param {Object} opt_data
     * @return {?}
     */
    main : function(elem, options, environment, opt_data) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<button class="btn-follow';
      return data = options["if"].call(elem, null != elem ? elem.isFollowing : elem, {
        name : "if",
        hash : {},
        fn : this.program(1, opt_data),
        inverse : this.noop,
        data : opt_data
      }), null != data && (out += data), out + '" data-action="toggle-follow">\n<span class="symbol-default"><span class="icon-plus"></span></span><span class="text-default">' + getAll(options.gettext.call(elem, "Follow", {
        name : "gettext",
        hash : {},
        data : opt_data
      })) + '</span><span class="symbol-following"><span class="icon-checkmark"></span></span><span class="text-following">' + getAll(options.gettext.call(elem, "Following", {
        name : "gettext",
        hash : {},
        data : opt_data
      })) + "</span>\n</button>\n";
    },
    useData : true
  }));
}), define("core/templates/alert", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @return {?}
     */
    1 : function() {
      return'<span class="icon icon-warning"></span>\n';
    },
    /**
     * @param {?} t
     * @return {?}
     */
    3 : function(t) {
      var buf;
      var lambda = this.lambda;
      /** @type {string} */
      var optsData = "";
      return buf = lambda(null != t ? t.message : t, t), null != buf && (optsData += buf), optsData + "\n";
    },
    /**
     * @param {?} t
     * @return {?}
     */
    5 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(lambda(null != t ? t.message : t, t)) + "\n";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {Object} value
     * @param {Object} options
     * @param {?} environment
     * @param {Object} context
     * @return {?}
     */
    main : function(value, options, environment, context) {
      var buf;
      var callback = this.escapeExpression;
      /** @type {string} */
      var optsData = '<a class="close" data-action="dismiss" title="' + callback(options.gettext.call(value, "Dismiss", {
        name : "gettext",
        hash : {},
        data : context
      })) + '">\u00c3\u2014</a>\n<span>\n';
      return buf = options["if"].call(value, null != value ? value.icon : value, {
        name : "if",
        hash : {},
        fn : this.program(1, context),
        inverse : this.noop,
        data : context
      }), null != buf && (optsData += buf), buf = options["if"].call(value, null != value ? value.safe : value, {
        name : "if",
        hash : {},
        fn : this.program(3, context),
        inverse : this.program(5, context),
        data : context
      }), null != buf && (optsData += buf), optsData + "</span>\n";
    },
    useData : true
  });
}), define("core/views/AlertView", ["underscore", "backbone", "core/templates/alert"], function(dataAndEvents, Backbone, template) {
  var d = Backbone.View.extend({
    className : "alert",
    events : {
      "click [data-action=dismiss]" : "dismiss"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      /** @type {Object} */
      this.options = options;
      this.message = options.message;
      this.safe = options.safe;
      this.type = options.type;
    },
    /**
     * @return {?}
     */
    render : function() {
      var el = this.$el;
      return el.html(template({
        message : this.message,
        safe : this.safe,
        icon : "error" === this.type
      })), el.attr("class", this.className), this.type && el.addClass(this.type), this;
    },
    /**
     * @param {?} event
     * @return {undefined}
     */
    dismiss : function(event) {
      if (event) {
        if (event.preventDefault) {
          event.preventDefault();
        }
      }
      this.remove();
      this.trigger("dismiss");
    }
  });
  return d;
}), define("core/mixins/withAlert", ["underscore", "core/views/AlertView"], function(util, dataAndEvents) {
  var data = {
    /**
     * @param {?} message
     * @param {?} opt_attributes
     * @return {?}
     */
    alert : function(message, opt_attributes) {
      if (!util.isObject(opt_attributes)) {
        opt_attributes = {};
      }
      var selector = opt_attributes.target || this._alertSelector;
      this.dismissAlert();
      var view = this._alert = new dataAndEvents(util.extend({
        message : message
      }, opt_attributes));
      return view.render(), selector ? this.$el.find(selector).prepend(view.el) : this.el.parentNode && this.el.parentNode.insertBefore(view.el, this.el), view;
    },
    /**
     * @param {Function} $sanitize
     * @return {undefined}
     */
    dismissAlert : function($sanitize) {
      if (this._alert) {
        if (!$sanitize || $sanitize(this._alert)) {
          this._alert.dismiss();
        }
      }
    },
    /**
     * @param {Object} layout
     * @return {undefined}
     */
    setAlertSelector : function(layout) {
      /** @type {Object} */
      this._alertSelector = layout;
    }
  };
  /**
   * @return {?}
   */
  var merge = function() {
    return util.extend(this, data);
  };
  return merge;
}), define("core/analytics/jester", ["jquery", "underscore", "backbone", "core/analytics/identity", "core/config/urls"], function($, _, Backbone, deepDataAndEvents, dataAndEvents) {
  var Client = Backbone.Model.extend({
    url : dataAndEvents.jester + "/event.js",
    defaults : {
      experiment : "default",
      variant : "control"
    },
    /**
     * @param {string} loc
     * @return {undefined}
     */
    setHostReferrer : function(loc) {
      if (loc) {
        if (-1 !== loc.indexOf("http")) {
          this.set("page_referrer", loc);
        }
      }
    },
    /**
     * @param {Object} options
     * @return {?}
     */
    decoratePayload : function(options) {
      if (!options.event) {
        /** @type {string} */
        options.event = "activity";
      }
      options = _.extend(this.toJSON(), options);
      _.extend(options, {
        imp : deepDataAndEvents.impression.impId,
        prev_imp : deepDataAndEvents.impression.prevImp
      });
      if (!options.section) {
        /** @type {string} */
        options.section = "default";
      }
      if (!options.area) {
        /** @type {string} */
        options.area = "n/a";
      }
      var cnl = $.param(options).length;
      if (cnl > 2048 && this.has("page_referrer")) {
        /** @type {Element} */
        var input = document.createElement("a");
        input.href = this.get("page_referrer");
        var url = input.hostname;
        if (url) {
          options.page_referrer_domain = url;
        }
        delete options.page_referrer;
      }
      return options;
    },
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    emit : function(opt_attributes) {
      return $.ajax({
        url : _.result(this, "url"),
        data : this.decoratePayload(opt_attributes),
        dataType : "script",
        cache : true
      });
    }
  });
  /**
   * @param {string} name
   * @return {?}
   */
  var getImage = function(name) {
    var g = new window.Image;
    return g.src = dataAndEvents.jester + "/stat.gif?" + $.param({
      event : name
    }), g;
  };
  /**
   * @param {string} allBindingsAccessor
   * @param {Array} names
   * @return {?}
   */
  var update = function(allBindingsAccessor, names) {
    if (!_.any(names, function(dataAndEvents) {
      return 0 >= dataAndEvents;
    })) {
      _.each(names, function(b, testname) {
        /** @type {number} */
        names[testname] = Math.round(b);
      });
      var g = new window.Image;
      return g.src = dataAndEvents.jester + "/telemetry/" + allBindingsAccessor + ".gif?" + $.param(names), g;
    }
  };
  var client = new Client;
  return{
    ActivityClient : Client,
    client : client,
    /** @type {function (string): ?} */
    logStat : getImage,
    /** @type {function (string, Array): ?} */
    telemetry : update
  };
}), define("core/switches", ["underscore", "remote/config", "core/analytics/identity", "core/utils/cookies", "core/utils/storage"], function(_, dataAndEvents, deepDataAndEvents, Cookie, model) {
  /** @type {string} */
  var sum = "switch:";
  /** @type {string} */
  var cookieName = "reflectauth";
  var self = {};
  return self._getKey = function(value) {
    return sum + value;
  }, self.getReflectAuth = function() {
    var data = (Cookie.read(cookieName) || "").replace(/\"/g, "").split("|");
    return data[1] && data[6] ? {
      username : data[1],
      id : parseInt(data[6], 10),
      staff : Boolean(parseInt(data[2], 10))
    } : {};
  }, self.disableFeature = function(resp) {
    model.set(this._getKey(resp), false);
  }, self.unsetFeature = function(resp) {
    model.remove(this._getKey(resp), true);
  }, self.forceFeature = function(resp) {
    model.set(this._getKey(resp), true);
  }, self.isFeatureActive = function(name, data) {
    var key = this._getKey(name);
    var values = model.get(key);
    if (_.isBoolean(values)) {
      return values;
    }
    var previous = (dataAndEvents.lounge && dataAndEvents.lounge.switches || {})[name];
    if (!previous) {
      return false;
    }
    var user = self.getReflectAuth();
    return data = _.defaults(data || {}, {
      percent : deepDataAndEvents.clientPercent() + 1,
      user_id : user.id,
      username : user.username,
      is_staff : user.staff
    }), _.any(previous, function(c, i) {
      return/percent$/.test(i) && _.isNumber(c) ? c >= data[i] : _.isArray(c) ? _.contains(c, data[i]) : c === data[i];
    });
  }, self;
}), define("core/mixins/withEmailVerifyLink", ["jquery", "underscore", "core/config", "core/utils"], function($, _, p, Strobe) {
  var throttledUpdate = Strobe.preventDefaultHandler;
  var options = {
    events : {
      "click [data-action=verify-email]" : "showVerifyEmailPopup"
    },
    showVerifyEmailPopup : throttledUpdate(function(ev) {
      var query = $(ev.target).attr("data-forum");
      var url = p.urls.verifyEmail;
      return query && (url = url + "?f=" + query), Strobe.openWindow(url, "_blank", {
        width : 460,
        height : 355
      });
    })
  };
  return function() {
    this.events = _.defaults({}, this.events, options.events);
    _.extend(this, _.pick(options, "showVerifyEmailPopup"));
  };
}), define("lounge/common", [], function() {
  var elem;
  /**
   * @param {?} dataAndEvents
   * @return {undefined}
   */
  var clone = function(dataAndEvents) {
    elem = dataAndEvents;
  };
  /**
   * @return {?}
   */
  var restoreScript = function() {
    return elem;
  };
  return{
    /** @type {function (?): undefined} */
    setLounge : clone,
    /** @type {function (): ?} */
    getLounge : restoreScript
  };
}), define("lounge/menu-handler", ["jquery", "core/bus"], function($, e) {
  return{
    /**
     * @return {undefined}
     */
    init : function() {
      /**
       * @return {undefined}
       */
      function done() {
        $(".dropdown").removeClass("open");
      }
      $("html").on("click", done);
      $("body").delegate("[data-toggle]", "click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        var element = $(event.currentTarget);
        var first = element.closest("." + element.attr("data-toggle"));
        /** @type {boolean} */
        var f = "disabled" !== first.attr("data-dropdown") && !first.hasClass("open");
        first.attr("data-dropdown", "enabled");
        done();
        if (f) {
          first.addClass("open");
        }
      });
      e.frame.on("window.click", done);
    }
  };
}), define("lounge/mixins", ["backbone", "underscore", "core/api", "common/urls", "shared/corefuncs"], function(dataAndEvents, result, $, data, res) {
  var sharers = {
    /**
     * @param {Function} next_callback
     * @return {undefined}
     */
    _getShortUrl : function(next_callback) {
      var next_scope = this;
      var uri = this._shareUrl();
      var u = uri;
      var task = result.extend({
        url : uri,
        source : "reflect_embed_next"
      }, this.model.relatedIds());
      $.call("shortener/create.json", {
        method : "POST",
        data : task,
        timeout : 5E3,
        /**
         * @param {Object} result
         * @return {undefined}
         */
        success : function(result) {
          var code = result.code;
          var data = result.response;
          if (0 === code) {
            u = data.url;
          }
        },
        /**
         * @return {undefined}
         */
        complete : function() {
          next_callback.call(next_scope, u);
        }
      });
    },
    /**
     * @param {string} dataAndEvents
     * @return {?}
     */
    _shareWaitPopup : function(dataAndEvents) {
      return window.open(data.loading, "_blank", dataAndEvents || "width=550,height=520");
    },
    /**
     * @param {?} name
     * @return {undefined}
     */
    share : function(name) {
      this.sharers[name].call(this);
    },
    sharers : {
      /**
       * @return {undefined}
       */
      twitter : function() {
        /** @type {string} */
        var val = "https://twitter.com/intent/tweet";
        var calendarItem = this._shareWaitPopup();
        this._getShortUrl(function(id) {
          calendarItem.location = res.serialize(val, {
            url : id,
            text : this.model.twitterText(id)
          });
        });
      },
      /**
       * @return {undefined}
       */
      facebook : function() {
        /** @type {string} */
        var val = "https://www.facebook.com/sharer.php";
        var calendarItem = this._shareWaitPopup("width=655,height=352");
        this._getShortUrl(function(u) {
          calendarItem.location = res.serialize(val, {
            u : u
          });
        });
      }
    }
  };
  var asCollapsible = function() {
    /**
     * @return {?}
     */
    function onError() {
      return this.collapseTarget && this.collapseTarget.length || (this.collapseTarget = this.collapseTargetSelector ? this[this.collapseScope].find(this.collapseTargetSelector) : this[this.collapseScope]), this.collapseTarget;
    }
    /**
     * @return {undefined}
     */
    function s() {
      var that = this;
      if (that.isCollapseAllowed) {
        var sibling = onError.call(that);
        if (sibling) {
          if (sibling.length) {
            sibling.height(that.collapsedHeight);
            onSuccess.call(that);
          }
        }
      }
    }
    /**
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    function start(dataAndEvents) {
      var elems = this;
      if (elems.collapseTarget && elems.collapseTarget.length) {
        var el = elems.collapseTarget;
        el.css("height", "auto");
        el.css("maxHeight", "none");
        fn.call(elems);
        if (!dataAndEvents) {
          /** @type {boolean} */
          elems.isCollapseAllowed = false;
        }
      }
    }
    /**
     * @return {?}
     */
    function showMenu() {
      return this.seeMoreButton && this.seeMoreButton.length || (this.seeMoreButton = onError.call(this).siblings("[data-action=see-more]")), this.seeMoreButton;
    }
    /**
     * @return {undefined}
     */
    function onSuccess() {
      var node = this;
      showMenu.call(this).removeClass("hidden").on("click", function() {
        node.expand();
      });
    }
    /**
     * @return {undefined}
     */
    function fn() {
      showMenu.call(this).addClass("hidden").off("click");
    }
    return function(origOptions) {
      var options = this;
      /** @type {boolean} */
      options.isCollapseAllowed = true;
      options.collapsedHeight = origOptions.collapsedHeight;
      options.collapseTargetSelector = origOptions.collapseTargetSelector;
      options.collapseScope = origOptions.collapseScope || "$el";
      /** @type {function (): undefined} */
      options.collapse = s;
      /** @type {function (boolean): undefined} */
      options.expand = start;
    };
  }();
  return{
    ShareMixin : sharers,
    asCollapsible : asCollapsible
  };
}), define("lounge/realtime", ["jquery", "underscore", "backbone", "loglevel", "common/utils", "common/urls", "shared/corefuncs"], function(jQuery, $, Backbone, logger, e, dataAndEvents, model) {
  /**
   * @return {undefined}
   */
  function init() {
    self.apply(this, arguments);
    /** @type {number} */
    this.reqCounter = 0;
    /** @type {number} */
    this.marker = 0;
    /** @type {number} */
    this.interval = 1;
    this._boundOnError = $.bind(this.onError, this);
    this._boundOnLoad = $.bind(this.onLoad, this);
    this._boundOnProgress = $.bind(this.onProgress, this);
  }
  /**
   * @return {undefined}
   */
  function Timer() {
    self.apply(this, arguments);
    /** @type {null} */
    this.handshakeSuccess = null;
    /** @type {number} */
    this.interval = 1;
    this._boundOnOpen = $.bind(this.onOpen, this);
    this._boundError = $.bind(this.onError, this);
    this._boundClose = $.bind(this.onClose, this);
    this._boundMessage = $.compose($.bind(this.onMessage, this), function(event) {
      return JSON.parse(event.data);
    });
  }
  /** @type {number} */
  var interval = 2;
  /** @type {number} */
  var k = 120;
  /**
   * @return {undefined}
   */
  var trigger = function() {
  };
  /**
   * @return {?}
   */
  var parseError = function() {
    throw new Error("Pipe class cannot be used directly.");
  };
  /**
   * @param {?} channel
   * @param {string} since
   * @return {undefined}
   */
  var self = function(channel, since) {
    this.channel = channel;
    /** @type {string} */
    this.since = since;
    /** @type {null} */
    this.connection = null;
    /** @type {boolean} */
    this.paused = false;
    /** @type {Array} */
    this._msgBuffer = [];
    this._boundOpen = $.bind(this.open, this);
  };
  $.extend(self.prototype, Backbone.Events, {
    /**
     * @param {?} opts
     * @return {?}
     */
    getUrl : function(opts) {
      var options = {};
      return this.since && (options.since = this.since), $.extend(options, opts), model.serialize(this.baseUrl + this.channel, options);
    },
    /**
     * @param {?} message
     * @return {undefined}
     */
    onMessage : function(message) {
      var name = message.message_type;
      var code = message.firehose_id;
      this.lastEventId = code;
      logger.debug("RT: new message:", name, code);
      var err = {
        type : name,
        data : message.message_body,
        lastEventId : code
      };
      this.trigger(name, err);
    },
    /**
     * @return {undefined}
     */
    _msgToBuffer : function() {
      this._msgBuffer.push($.toArray(arguments));
    },
    /**
     * @param {boolean} who
     * @return {undefined}
     */
    pause : function(who) {
      if (!this.paused) {
        /** @type {boolean} */
        this.paused = true;
        this._trigger = this.trigger;
        this.trigger = who === false ? trigger : this._msgToBuffer;
        logger.debug("RT: paused, buffered: %s", who !== false);
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      if (this.paused) {
        /** @type {boolean} */
        this.paused = false;
        this.trigger = this._trigger;
        logger.debug("RT: resumed, buffered messages: %s", this._msgBuffer.length);
        var args;
        for (;args = this._msgBuffer.shift();) {
          this.trigger.apply(this, args);
        }
      }
    },
    /** @type {function (): ?} */
    open : parseError,
    /**
     * @return {?}
     */
    close : function() {
      var connection = this.connection;
      return connection ? (this.connection = null, connection) : false;
    }
  });
  $.extend(init.prototype, self.prototype, {
    baseUrl : dataAndEvents.realertime + "/api/2/",
    /**
     * @return {undefined}
     */
    onError : function() {
      if (this.connection) {
        /** @type {null} */
        this.connection = null;
        this.trigger("error", this);
        if (this.interval <= k) {
          this.interval *= interval;
        }
        logger.info("RT: Connection error, backing off %s secs", this.interval);
        $.delay(this._boundOpen, 1E3 * this.interval);
      }
    },
    /**
     * @return {undefined}
     */
    onLoad : function() {
      if (this.connection) {
        /** @type {null} */
        this.connection = null;
        /** @type {null} */
        this.since = null;
        this.trigger("success", this);
        $.defer(this._boundOpen);
      }
    },
    /**
     * @return {undefined}
     */
    onProgress : function() {
      if (this.connection) {
        var styleSheets;
        var responseText = this.connection.responseText;
        /** @type {number} */
        var marker = 0;
        if (responseText && !(this.marker >= responseText.length)) {
          styleSheets = responseText.slice(this.marker).split("\n");
          var path;
          var result;
          var errors;
          var l = styleSheets.length;
          /** @type {number} */
          var i = 0;
          for (;l > i;i++) {
            if (path = styleSheets[i], marker += path.length + 1, result = path.replace(/^\s+|\s+$/g, "")) {
              try {
                /** @type {*} */
                errors = JSON.parse(result);
              } catch (j) {
                if (i === l - 1) {
                  marker -= path.length + 1;
                  break;
                }
                logger.debug("RT: unable to parse: ", result, path);
                continue;
              }
              this.onMessage(errors);
            } else {
              logger.debug("RT: ignoring empty row...");
            }
          }
          if (marker > 0) {
            this.marker += marker - 1;
          }
        }
      }
    },
    /**
     * @return {?}
     */
    open : function() {
      this.close();
      var connection = this.connection = e.CORS.request("GET", this.getUrl({
        bust : ++this.reqCounter
      }), this._boundOnLoad, this._boundOnError);
      if (!connection) {
        return void logger.debug("RT: Cannot use any cross-domain request tool with StreamPipe. Bailing out.");
      }
      connection.onprogress = this._boundOnProgress;
      this.connection = connection;
      /** @type {number} */
      this.marker = 0;
      try {
        connection.send();
      } catch (b) {
        /** @type {null} */
        this.connection = null;
        logger.debug("RT: Attempt to send a CORS request failed.");
      }
    },
    /**
     * @return {?}
     */
    close : function() {
      var handler = self.prototype.close.apply(this);
      return handler && handler.abort();
    }
  });
  $.extend(Timer.prototype, self.prototype, {
    baseUrl : ("https:" === window.location.protocol ? "wss:" : "ws:") + dataAndEvents.realertime + "/ws/2/",
    /**
     * @return {undefined}
     */
    onOpen : function() {
      logger.debug("RT: [Socket] Connection established.");
      /** @type {boolean} */
      this.handshakeSuccess = true;
      /** @type {null} */
      this.since = null;
    },
    /**
     * @return {?}
     */
    onError : function() {
      if (this.connection) {
        if (this.connection = null, !this.handshakeSuccess) {
          return logger.debug("RT: [Socket] Error before open, bailing out."), void this.trigger("fail");
        }
        this.trigger("error");
        if (this.interval <= k) {
          this.interval *= interval;
        }
        logger.error("RT: Connection error, backing off %s secs", this.interval);
        $.delay(this._boundOpen, 1E3 * this.interval);
      }
    },
    /**
     * @param {Object} closeEvent
     * @return {?}
     */
    onClose : function(closeEvent) {
      if (this.connection) {
        if (!closeEvent.wasClean) {
          return void this.onError();
        }
        /** @type {null} */
        this.connection = null;
        logger.debug("RT: [Socket] Connection closed. Restarting...");
        this.trigger("close");
        this.open();
      }
    },
    /**
     * @return {undefined}
     */
    open : function() {
      this.close();
      var connection = this.connection = new window.WebSocket(this.getUrl());
      connection.onopen = this._boundOnOpen;
      connection.onerror = this._boundError;
      connection.onmessage = this._boundMessage;
      connection.onclose = this._boundClose;
    },
    /**
     * @return {?}
     */
    close : function() {
      var srv = self.prototype.close.apply(this);
      return srv && srv.close();
    }
  });
  var events = {
    _wsSupported : window.WebSocket && 2 === window.WebSocket.CLOSING,
    /**
     * @param {string} contentHTML
     * @param {string} callback
     * @param {?} models
     * @param {?} scope
     * @return {undefined}
     */
    initialize : function(contentHTML, callback, models, scope) {
      this.close();
      /** @type {Array} */
      this._initArgs = [contentHTML, callback, models, scope];
      var skip = this._wsSupported;
      /** @type {function (): undefined} */
      var acc = skip ? Timer : init;
      var self = this.pipe = new acc(contentHTML, callback);
      $.chain(models).pairs().each(function(obj) {
        self.on(obj[0], obj[1], scope);
      });
      if (skip) {
        self.on("fail", function() {
          /** @type {boolean} */
          this._wsSupported = false;
          self.off();
          this.initialize.apply(this, this._initArgs);
        }, this);
      }
      self.open();
    },
    /**
     * @param {boolean} who
     * @return {undefined}
     */
    pause : function(who) {
      if (this.pipe) {
        this.pipe.pause(who);
      }
    },
    /**
     * @return {undefined}
     */
    resume : function() {
      if (this.pipe) {
        this.pipe.resume();
      }
    },
    /**
     * @return {undefined}
     */
    close : function() {
      if (this.pipe) {
        this.pipe.close();
        /** @type {null} */
        this.pipe = null;
      }
    }
  };
  return jQuery(window).on("unload", $.bind(events.close, events)), {
    /** @type {function (?, string): undefined} */
    Pipe : self,
    /** @type {function (): undefined} */
    StreamPipe : init,
    /** @type {function (): undefined} */
    SocketPipe : Timer,
    Manager : events
  };
}), define("core/utils/releaseUtils", ["underscore", "exports", "remote/config"], function(path, r, dataAndEvents) {
  /** @type {Array} */
  r.REFLECT_ADMIN_USERNAMES = ["Jason", "danielha", "ryanvalentin", "kimskitchensink", "TaltonFiggins", "gabalafou", "SamParker", "noodlezrulez", "davidericfleck", "NorthIsUp", "nfluxx", "mpattyfly", "mls888", "jono", "tkaemming", "madBYK", "fuziontech", "SteveRoy44", "mandytong", "chaseneil", "iamfrancisyo", "mattrobenolt", "chazcb", "podlipensky", "qarly", "met48", "davidzabowski", "Rsadi", "ernestwaynewong", "kalail610", "jimwaggoner", "alec_schmidt", "zaizhuang", "nicoleallard", "annmony", "brandenr", 
  "cynthiacgutierrez88", "kaelibain", "sayshelen", "vexillifer", "wedamija", "ryan04", "ProductNate", "tonyhue", "Bravado_General", "michaelmaltese", "paulivanov", "Jameslm86", "min_diesel", "anna_vu", "colekowalski", "tithonis", "SteiNYSF", "webrender", "kaitlynnonaka", "jeff_lien", "saeedoday", "jason_heron", "katfs"];
  /**
   * @param {Node} user
   * @return {?}
   */
  r.isReflectAdmin = function(user) {
    return path.contains(r.REFLECT_ADMIN_USERNAMES, user.get("username")) || path.contains(dataAndEvents.lounge.home_other_admin_accounts, user.get("username"));
  };
}), define("core/models/MediaUpload", ["backbone", "core/models/Media"], function(Backbone, dataAndEvents) {
  var c = Backbone.Model.extend({
    defaults : {
      token : null,
      original_url : null,
      thumbnail_url : null,
      expires : null
    },
    /**
     * @param {Object} data
     * @return {?}
     */
    validate : function(data) {
      if (null === data.expires) {
        return new Error("Upload is missing expiry timestamp");
      }
      /** @type {number} */
      var b = Number(new Date);
      return data.expires < b / 1E3 ? new Error("Expired upload") : void 0;
    },
    /**
     * @return {?}
     */
    toMediaJSON : function() {
      return{
        mediaType : dataAndEvents.MEDIA_TYPES.IMAGE_UPLOAD,
        thumbnailUrl : this.get("original_url"),
        url : this.get("original_url")
      };
    }
  });
  return c;
}), define("core/utils/media/upload", ["jquery", "underscore", "when", "exports", "core/api", "core/models/Media", "core/models/MediaUpload", "core/strings", "core/UniqueModel"], function(ignoreMethodDoesntExist, t, callback, item, _, deepDataAndEvents, response, textAlt, dataAndEvents) {
  /** @type {boolean} */
  item.uploadSupported = Boolean(window.FormData);
  /**
   * @param {string} selector
   * @return {?}
   */
  item._extractFirstImageFile = function(selector) {
    return t.find(selector, function(token) {
      return token.type.match(/^image\//);
    });
  };
  /**
   * @param {string} obj
   * @param {Object} message
   * @param {Object} cb
   * @return {?}
   */
  item._uploadViaApi = function(obj, message, cb) {
    return callback(_.call(obj, {
      data : message,
      contentType : false,
      processData : false,
      method : "POST",
      /**
       * @return {?}
       */
      xhr : function() {
        /** @type {XMLHttpRequest} */
        var xhr = new window.XMLHttpRequest;
        var startNotify = cb && cb.onProgress;
        return startNotify && xhr.upload.addEventListener("progress", function(t) {
          if (t.total) {
            startNotify(100 * t.loaded / t.total);
          }
        }), xhr;
      }
    }));
  };
  /** @type {string} */
  item.UPLOAD_URL = "https://uploads.services.disqus.com/api/3.0/media/create.json";
  /**
   * @param {string} target
   * @param {Object} cb
   * @return {?}
   */
  item.uploadMediaUrl = function(target, cb) {
    var self = new window.FormData;
    var targets = item._extractFirstImageFile(target);
    return targets ? (self.append("upload", targets), self.append("permanent", 1), item._uploadViaApi(item.UPLOAD_URL, self, cb).then(function(res) {
      var data = res.response;
      var response = t.first(t.values(data));
      if (!response || !response.ok) {
        throw new Error("Upload failed");
      }
      return new dataAndEvents(deepDataAndEvents, {
        mediaType : deepDataAndEvents.MEDIA_TYPES.IMAGE_UPLOAD,
        url : response.url,
        thumbnailUrl : response.url
      });
    })) : callback.reject(new Error("No image file to upload"));
  };
  /**
   * @param {string} option
   * @param {Object} cb
   * @return {?}
   */
  item.uploadMedia = function(option, cb) {
    var output = new window.FormData;
    var e = item._extractFirstImageFile(option);
    return output.append("attachment", e), item._uploadViaApi("media/upload", output, cb).otherwise(function(jqXHR) {
      var operation = jqXHR.responseJSON || {};
      throw new Error(operation.response || "Upload failed");
    }).then(function(operation) {
      return new response(operation.response);
    });
  };
}), define("core/views/media/DragDropUploadView", ["underscore", "backbone", "core/utils"], function(wo, Backbone, dataAndEvents) {
  var throttledUpdate = dataAndEvents.stopEventHandler;
  var e = Backbone.View.extend({
    events : {
      dragover : "_dragOn",
      dragenter : "_dragOn",
      dragleave : "_dragOff",
      dragexit : "_dragOff",
      drop : "_drop"
    },
    _dragOn : throttledUpdate(function() {
      this.trigger("uploader:dragEnter");
      this._toggleDragPlaceholder(true);
    }),
    _dragOff : throttledUpdate(function() {
      this._toggleDragPlaceholder(false);
    }),
    _drop : throttledUpdate(function(e) {
      this._toggleDragPlaceholder(false);
      var files = e.originalEvent.dataTransfer.files;
      return files.length ? void this.trigger("uploader:attachMedia", files) : void this.trigger("uploader:dropError", "No files");
    }),
    _toggleDragPlaceholder : wo.throttle(function(isNew) {
      this.trigger(isNew ? "uploader:showPlaceholder" : "uploader:hidePlaceholder");
    }, 50)
  });
  return e;
}), define("core/templates/postMediaUploadButton", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} el
     * @param {?} event
     * @param {?} environment
     * @param {Object} request
     * @return {?}
     */
    main : function(el, event, environment, request) {
      var callback = this.escapeExpression;
      return'<a href="#" tabindex="-1" data-action="attach" class="attach" title="' + callback(event.gettext.call(el, "Upload Images", {
        name : "gettext",
        hash : {},
        data : request
      })) + '"><span>' + callback(event.gettext.call(el, "Attach", {
        name : "gettext",
        hash : {},
        data : request
      })) + '</span></a>\n<input type="file" data-role="media-upload" tabindex="-1" accept="image/*">\n';
    },
    useData : true
  });
}), define("core/views/media/UploadButtonView", ["jquery", "underscore", "backbone", "core/templates/postMediaUploadButton", "core/utils"], function($, deepDataAndEvents, Backbone, memory, dataAndEvents) {
  var throttledUpdate = dataAndEvents.stopEventHandler;
  /** @type {string} */
  var container = "input[type=file][data-role=media-upload]";
  var h = Backbone.View.extend({
    events : function() {
      var _selectorChange = {
        "click [data-action=attach]" : "_attachMedia"
      };
      return _selectorChange["change " + container] = "_selectorChange", _selectorChange;
    }(),
    /**
     * @param {?} config
     * @return {undefined}
     */
    initialize : function(config) {
      this.template = config && config.template || memory;
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(this.template()), this;
    },
    _attachMedia : throttledUpdate(function() {
      this.$(container).click();
    }),
    /**
     * @param {Event} e
     * @return {undefined}
     */
    _selectorChange : function(e) {
      var el = e.target;
      var files = el.files;
      if (files.length) {
        this.trigger("uploader:attachMedia", files);
        $(el).replaceWith(el.cloneNode());
      }
    }
  });
  return h;
}), define("core/templates/postMediaUploadProgress", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @param {string} t
     * @return {?}
     */
    1 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<li>\n<div class="media-progress-box">\n<div class="media-progress">\n<div class="bar" style="right: ' + escapeExpression(lambda(null != t ? t.remainingPerc : t, t)) + '%"></div>\n</div>\n</div>\n</li>\n';
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {Object} args
     * @param {?} stream
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(args, stream, environment, options) {
      var fragment;
      /** @type {string} */
      var optsData = "";
      return fragment = stream.each.call(args, null != args ? args.collection : args, {
        name : "each",
        hash : {},
        fn : this.program(1, options),
        inverse : this.noop,
        data : options
      }), null != fragment && (optsData += fragment), optsData;
    },
    useData : true
  });
}), define("core/views/media/UploadsProgressSubView", ["backbone", "core/templates/postMediaUploadProgress"], function(Backbone, Template) {
  var c = Backbone.View.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      this.collection = new Backbone.Collection;
      this.listenTo(this.collection, "add remove change", this.render);
    },
    /**
     * @return {?}
     */
    hasVisible : function() {
      return Boolean(this.collection.length);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(Template({
        collection : this.collection.toJSON()
      })), this;
    }
  });
  return c;
}), define("core/collections/MediaUploadCollection", ["backbone", "core/models/MediaUpload"], function(Backbone, associatedModel) {
  var c = Backbone.Collection.extend({
    /** @type {Function} */
    model : associatedModel
  });
  return c;
}), define("core/utils/media/MediaStore", ["underscore", "core/utils/storage"], function($, data_priv) {
  /**
   * @param {?} key
   * @return {undefined}
   */
  var self = function(key) {
    if (!key) {
      throw new Error("Cannot instantiate MediaStore without a valid storageKey!");
    }
    this._storageKey = key;
  };
  return $.extend(self.prototype, {
    /**
     * @return {?}
     */
    getItems : function() {
      return data_priv.get(this._storageKey) || {};
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      data_priv.remove(this._storageKey);
    },
    /**
     * @param {string} index
     * @return {?}
     */
    getItem : function(index) {
      return this.getItems()[index];
    },
    /**
     * @param {string} key
     * @param {string} value
     * @return {?}
     */
    setItem : function(key, value) {
      var pdataOld = this.getItems();
      return pdataOld[key] = value, data_priv.set(this._storageKey, pdataOld), value;
    },
    /**
     * @param {string} item
     * @return {?}
     */
    removeItem : function(item) {
      var pdataOld = this.getItems();
      return item in pdataOld ? (delete pdataOld[item], data_priv.set(this._storageKey, pdataOld), true) : false;
    }
  }), self;
}), define("core/templates/postMediaUploadLegacy", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} obj
     * @param {?} event
     * @param {?} environment
     * @param {Object} request
     * @return {?}
     */
    main : function(obj, event, environment, request) {
      var fn = this.lambda;
      var isNaN = this.escapeExpression;
      return'<li class="publisher-border-color" data-media-id="' + isNaN(fn(null != obj ? obj.original_url : obj, obj)) + '">\n<div class="media-box">\n<div class="media-ct">\n<div class="media-surface">\n<img src="' + isNaN(fn(null != obj ? obj.original_url : obj, obj)) + '?w=128&h=128" alt="' + isNaN(event.gettext.call(obj, "Media attachment", {
        name : "gettext",
        hash : {},
        data : request
      })) + '">\n<a href="#" class="media-delete" data-action="detach">&#10005;</a>\n</div>\n</div>\n</div>\n</li>\n';
    },
    useData : true
  });
}), define("core/views/media/UploadsLegacySubView", ["jquery", "underscore", "backbone", "core/collections/MediaUploadCollection", "core/utils", "core/utils/media/MediaStore", "core/templates/postMediaUploadLegacy"], function($, item, Backbone, Events, dataAndEvents, Document, template) {
  var throttledUpdate = dataAndEvents.stopEventHandler;
  var i = Backbone.View.extend({
    events : {
      "click [data-action=detach]" : "onDetach"
    },
    /**
     * @param {string} cfg
     * @return {undefined}
     */
    initialize : function(cfg) {
      this.collection = new Events;
      var elem = cfg.mediaStorageKey;
      this.mediaStore = elem && new Document(elem);
      if (this.mediaStore) {
        this.collection.reset(item.values(this.mediaStore.getItems()), {
          validate : true
        });
      }
      this.listenTo(this.collection, {
        add : this.onAdd,
        remove : this.onRemove,
        reset : this.onReset
      });
    },
    /**
     * @return {?}
     */
    setElement : function() {
      var props = Backbone.View.prototype.setElement.apply(this, arguments);
      return this.collection && this.collection.each(this._addElement, this), props;
    },
    /**
     * @return {?}
     */
    hasVisible : function() {
      return Boolean(this.collection.length);
    },
    onDetach : throttledUpdate(function(ev) {
      var el = $(ev.target).closest("li");
      var url = el.attr("data-media-id");
      var doc = this.collection.where({
        original_url : url
      });
      this.collection.remove(doc, {
        $el : el
      });
    }),
    /**
     * @param {Object} model
     * @return {undefined}
     */
    _addElement : function(model) {
      var $template = $(template(model.toJSON()));
      $template.attr("data-media-id", model.get("original_url"));
      this.$el.append($template);
    },
    /**
     * @param {?} value
     * @return {undefined}
     */
    onAdd : function(value) {
      if (this.mediaStore) {
        this.mediaStore.setItem(value.get("original_url"), value);
      }
      this._addElement(value);
    },
    /**
     * @param {?} a
     * @param {boolean} expectedNumberOfNonCommentArgs
     * @param {?} sprite
     * @return {undefined}
     */
    onRemove : function(a, expectedNumberOfNonCommentArgs, sprite) {
      if (sprite.$el) {
        sprite.$el.remove();
      }
      var mediaStore = this.mediaStore && this.mediaStore.getItem(a.get("original_url"));
      if (mediaStore) {
        this.mediaStore.removeItem(a.get("original_url"));
      }
    },
    /**
     * @return {undefined}
     */
    onReset : function() {
      this.$el.empty();
      if (this.mediaStore) {
        this.mediaStore.clear();
      }
    }
  });
  return i;
}), define("core/templates/postMediaUploadRich", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @param {Object} t
     * @return {?}
     */
    1 : function(t) {
      var suite;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(lambda(null != (suite = null != t ? t.media : t) ? suite.title : suite, t));
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    3 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Media attachment", {
        name : "gettext",
        hash : {},
        data : task
      }));
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} value
     * @param {Object} callback
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(value, callback, environment, options) {
      var data;
      var mixin = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var out = '<li class="publisher-border-color">\n<div class="media-box">\n<div class="media-ct">\n<div class="media-surface">\n<a href="' + escapeExpression(mixin(null != (data = null != value ? value.media : value) ? data.url : data, value)) + '" target="_blank">\n<img src="' + escapeExpression(mixin(null != (data = null != value ? value.media : value) ? data.thumbnailUrl : data, value)) + '" alt="';
      return data = callback["if"].call(value, null != (data = null != value ? value.media : value) ? data.title : data, {
        name : "if",
        hash : {},
        fn : this.program(1, options),
        inverse : this.program(3, options),
        data : options
      }), null != data && (out += data), out + '">\n</a>\n</div>\n</div>\n</div>\n</li>\n';
    },
    useData : true
  });
}), define("core/views/media/UploadsRichSubView", ["jquery", "underscore", "backbone", "core/models/Media", "core/UniqueModel", "core/utils", "core/templates/postMediaUploadRich"], function(dataAndEvents, _, Backbone, elem, context, results, template) {
  var h = Backbone.View.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      /** @type {boolean} */
      this._hasVisible = false;
      this.collection = new Backbone.Collection([], {
        model : elem,
        comparator : "index"
      });
      this.listenTo(this.collection, "add remove reset sort change:thumbnailUrl change:mediaType change:editsFinished", this.render);
      this.listenTo(this.collection, "change:index", _.bind(this.collection.sort, this.collection));
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.empty(), this._hasVisible = false, this.collection.each(function(model) {
        if (model.get("thumbnailUrl")) {
          if (!_.contains(elem.WEBPAGE_TYPES, model.get("mediaType"))) {
            if (model.get("editsFinished")) {
              this.$el.append(template({
                media : model.toJSON()
              }));
              /** @type {boolean} */
              this._hasVisible = true;
            }
          }
        }
      }, this), this;
    },
    /**
     * @return {?}
     */
    hasVisible : function() {
      return this._hasVisible;
    },
    /**
     * @param {string} data
     * @return {?}
     */
    addMedia : function(data) {
      var obj = context.get(elem, data.url);
      if (obj) {
        obj.set(data);
      } else {
        if (!data.editsFinished) {
          return;
        }
        obj = new context(elem, data);
        obj.fetch();
      }
      return this.collection.add(obj), obj;
    },
    /**
     * @param {?} result
     * @param {?} value
     * @param {?} opt_attributes
     * @return {?}
     */
    updateFromText : function(result, value, opt_attributes) {
      if (!result) {
        return void this.collection.reset();
      }
      var nodes = results.bleachFindUrls(result);
      nodes = _.uniq(nodes, false, function($location) {
        return $location.url;
      });
      var cache = {};
      _.each(nodes, function(options) {
        /** @type {boolean} */
        cache[options.url] = true;
        var args = _.pick(options, "index", "url");
        /** @type {boolean} */
        var isPasteEvent = options.index < value && value <= options.endIndex || "." === result[options.endIndex];
        if (!isPasteEvent || opt_attributes.isPasteEvent) {
          /** @type {boolean} */
          args.editsFinished = true;
        }
        this.addMedia(args);
      }, this);
      var obj = this.collection.pluck("url");
      cache = _.keys(cache);
      var keys = _.difference(obj, cache);
      this.collection.remove(this.collection.filter(function(requestCache) {
        return _.contains(keys, requestCache.get("url"));
      }));
    }
  });
  return h;
}), define("core/templates/postMediaUploads", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} el
     * @param {?} event
     * @param {?} environment
     * @param {Object} request
     * @return {?}
     */
    main : function(el, event, environment, request) {
      var callback = this.escapeExpression;
      return'<ul data-role="media-legacy-list"></ul>\n<ul data-role="media-progress-list"></ul>\n<ul data-role="media-rich-list"></ul>\n<div class="media-expanded empty" data-role="media-preview-expanded">\n<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="\ndata-role="media-preview-expanded-image" alt="' + callback(event.gettext.call(el, "Media preview placeholder", {
        name : "gettext",
        hash : {},
        data : request
      })) + '">\n</div>\n';
    },
    useData : true
  });
}), define("core/views/media/UploadsView", ["backbone", "core/views/media/UploadsProgressSubView", "core/views/media/UploadsLegacySubView", "core/views/media/UploadsRichSubView", "core/templates/postMediaUploads"], function(Backbone, FooterView, AppRouter, MainRouter, Template) {
  var f = Backbone.View.extend({
    /**
     * @param {string} contentHTML
     * @return {undefined}
     */
    initialize : function(contentHTML) {
      this.legacyView = new AppRouter({
        mediaStorageKey : contentHTML.mediaStorageKey
      });
      this.legacy = this.legacyView.collection;
      this.richView = new MainRouter;
      this.rich = this.richView.collection;
      this.uploadProgressView = new FooterView;
      this.uploadProgress = this.uploadProgressView.collection;
      this.listenTo(this.legacy, "all", this._updateEmpty);
      this.listenTo(this.rich, "all", this._updateEmpty);
      this.listenTo(this.uploadProgress, "all", this._updateEmpty);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.legacyView.$el.detach(), this.richView.$el.detach(), this.uploadProgressView.$el.detach(), this.$el.html(Template()), this._updateEmpty(), this.legacyView.setElement(this.$("[data-role=media-legacy-list]")[0]), this.richView.setElement(this.$("[data-role=media-rich-list]")[0]), this.uploadProgressView.setElement(this.$("[data-role=media-progress-list]")[0]), this;
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      this.legacy.reset();
      this.rich.reset();
      this.uploadProgress.reset();
    },
    /**
     * @return {undefined}
     */
    _updateEmpty : function() {
      if (this.legacyView.hasVisible() || (this.richView.hasVisible() || this.uploadProgressView.hasVisible())) {
        this.$el.removeClass("empty");
      } else {
        this.$el.addClass("empty");
      }
    }
  });
  return f;
}), define("core/mixins/withUploadForm", ["jquery", "underscore", "backbone", "core/strings", "core/utils", "core/utils/media/upload", "core/utils/storage", "core/views/media/DragDropUploadView", "core/views/media/UploadButtonView", "core/views/media/UploadsView"], function(deepDataAndEvents, _, Backbone, http, dataAndEvents, $injector, attr, Base64Img, Users, PageEditView) {
  var getter = http.get;
  /**
   * @return {undefined}
   */
  var options = function() {
    _.defaults(this, options.bothProto, options.uploadsProto, options.previewsProto);
  };
  return options.previewsProto = {
    /**
     * @param {Array} $element
     * @param {string} dataAndEvents
     * @param {Object} e
     * @return {undefined}
     */
    initMediaPreviews : function($element, dataAndEvents, e) {
      this.mediaUploadsView = new PageEditView({
        el : $element[0],
        mediaStorageKey : dataAndEvents
      });
      this.mediaUploadsView.render();
      this.updateLiveMediaDebounced = _.partial(_.debounce(this.updateLiveMedia, 500), e, false);
      this.listenTo(e, {
        keychange : this.updateLiveMediaDebounced,
        /**
         * @param {?} vim
         * @param {string} context
         * @return {undefined}
         */
        paste : function(vim, context) {
          if (!(context && context.fake)) {
            _.defer(_.bind(this.updateLiveMedia, this, e, true));
          }
        }
      });
      this.updateLiveMedia(e, true);
    },
    /**
     * @return {undefined}
     */
    clearMediaPreviews : function() {
      if (this.mediaUploadsView) {
        this.mediaUploadsView.clear();
      }
    },
    /**
     * @param {Object} error
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    updateLiveMedia : function(error, dataAndEvents) {
      if (this.mediaUploadsView) {
        var expectationResult = error.get();
        var udataCur = error.offset();
        this.mediaUploadsView.richView.updateFromText(expectationResult, udataCur, {
          isPasteEvent : dataAndEvents
        });
      }
    }
  }, options.uploadsProto = {
    /**
     * @param {Object} loading
     * @param {Array} $element
     * @param {Array} el
     * @return {undefined}
     */
    initMediaUploads : function(loading, $element, el) {
      this.mediaDragDropView = new Base64Img({
        el : $element[0]
      });
      this.listenTo(this.mediaDragDropView, {
        /**
         * @return {undefined}
         */
        "uploader:attachMedia" : function() {
          attr.set("usedDragDrop", 1);
          this.handleAttachMedia.apply(this, arguments);
        },
        /**
         * @return {undefined}
         */
        "uploader:dragEnter" : function() {
          this.$el.addClass("expanded");
        },
        /**
         * @return {undefined}
         */
        "uploader:showPlaceholder" : function() {
          loading.show();
        },
        /**
         * @return {undefined}
         */
        "uploader:hidePlaceholder" : function() {
          loading.hide();
        },
        /**
         * @return {undefined}
         */
        "uploader:dropError" : function() {
          var message = getter("Sorry we didn't catch that. Try again?");
          this.alert(message, {
            type : "error",
            isUploadError : true
          });
        }
      });
      this.mediaUploadButtonView = new Users({
        el : el[0]
      });
      this.listenTo(this.mediaUploadButtonView, {
        "uploader:attachMedia" : this.handleUploadViaButton
      });
      this.mediaUploadButtonView.render();
    },
    /**
     * @param {boolean} deepDataAndEvents
     * @return {undefined}
     */
    handleUploadViaButton : function(deepDataAndEvents) {
      if (deepDataAndEvents && (attr.isPersistent && (!attr.get("usedDragDrop") && !dataAndEvents.isMobileUserAgent()))) {
        var Events = this.alert(getter("Did you know you can drag and drop images too? Try it now!"));
        this.listenToOnce(Events, "dismiss", function() {
          attr.set("usedDragDrop", 1);
        });
      }
      this.handleAttachMedia.apply(this, arguments);
    },
    /**
     * @param {string} value
     * @param {Object} locals
     * @return {undefined}
     */
    handleAttachMedia : function(value, locals) {
      var self = this;
      var doc = new Backbone.Model({
        remainingPerc : 100
      });
      self.mediaUploadsView.uploadProgress.add(doc);
      locals = _.extend(locals || {}, {
        /**
         * @param {number} fileName
         * @return {undefined}
         */
        onProgress : function(fileName) {
          doc.set("remainingPerc", 100 - fileName);
        }
      });
      var jqXHR;
      jqXHR = _.result(self, "areUploadUrlsEnabled") ? $injector.uploadMediaUrl(value, locals).then(function(agent) {
        agent.fetch();
        self.textarea.insertAtCursor(agent.get("url"));
        self.updateLiveMedia(self.textarea, true);
        self.dismissUploadError();
      }).otherwise(function() {
        var e = getter("Unfortunately your image upload failed. Please verify that your image is in a supported format (JPEG, PNG, or GIF). If you continue seeing this error, please try again later.");
        self.alert(e, {
          type : "error",
          isUploadError : true
        });
      }) : $injector.uploadMedia(value, locals).then(function(build) {
        self.mediaUploadsView.legacy.add(build);
        self.dismissUploadError();
      }).otherwise(function() {
        var e = getter("Unfortunately your image upload failed. Please verify that your image is under 2MB. If you continue seeing this error, please try again later.");
        self.alert(e, {
          type : "error",
          isUploadError : true
        });
      });
      jqXHR.always(function() {
        self.mediaUploadsView.uploadProgress.remove(doc);
      });
    },
    /**
     * @return {undefined}
     */
    dismissUploadError : function() {
      this.dismissAlert(function(elem) {
        return elem.options && elem.options.isUploadError;
      });
    },
    uploadSupported : $injector.uploadSupported,
    /**
     * @return {?}
     */
    isUploadInProgress : function() {
      return this.mediaUploadsView && this.mediaUploadsView.uploadProgress.length;
    },
    /**
     * @return {?}
     */
    getMediaUploadTokens : function() {
      return this.mediaUploadsView ? this.mediaUploadsView.legacy.pluck("token") : [];
    }
  }, options.bothProto = {
    /**
     * @param {Object} $scope
     * @return {undefined}
     */
    initMediaViews : function($scope) {
      if ($scope.allowMedia) {
        this.initMediaPreviews(this.$("[data-role=media-preview]"), $scope.storageKey, $scope.textarea);
      }
      if ($scope.allowUploads) {
        this.initMediaUploads(this.$("[data-role=drag-drop-placeholder]"), this.$("[data-role=textarea]"), this.$("[data-role=media-uploader]"));
      }
    }
  }, options;
}), define("core/editable", [], function() {
  /**
   * @param {?} param
   * @return {?}
   */
  function fn(param) {
    return param.replace(reg, " ");
  }
  /**
   * @param {Array} nodes
   * @param {boolean} test
   * @param {string} c
   * @return {?}
   */
  function callback(nodes, test, c) {
    var nodeName;
    var node;
    var tag;
    var i;
    /** @type {string} */
    var result = "";
    /** @type {Array} */
    var results = [];
    if ("string" != typeof c) {
      /** @type {string} */
      c = "\n\n";
    }
    /** @type {number} */
    i = 0;
    for (;i < nodes.length;++i) {
      node = nodes[i];
      nodeName = node.nodeName.toLowerCase();
      if (1 === node.nodeType) {
        tag = test && test(node);
        if (tag) {
          result += tag;
        } else {
          if (data.hasOwnProperty(nodeName)) {
            if (result) {
              results.push(result);
            }
            result = callback(node.childNodes, test, c);
          } else {
            result += "br" === nodeName ? "\n" : callback(node.childNodes, test, c);
          }
        }
      } else {
        if (3 === node.nodeType) {
          result += fn(node.nodeValue);
        }
      }
    }
    return results.push(result), results.join(c);
  }
  /**
   * @param {HTMLElement} el
   * @param {string} type
   * @param {Function} fn
   * @return {undefined}
   */
  function addListener(el, type, fn) {
    if (el.addEventListener) {
      el.addEventListener(type, fn, false);
    } else {
      if (!el.attachEvent) {
        throw new Error("No event support.");
      }
      el.attachEvent("on" + type, fn);
    }
  }
  /** @type {Document} */
  var doc = window.document;
  /** @type {string} */
  var CHARACTER = "character";
  /** @type {RegExp} */
  var reg = new RegExp(String.fromCharCode(160), "gi");
  /** @type {Array.<string>} */
  var codeSegments = "h1 h2 h3 h4 h5 h6 p pre blockquote address ul ol dir menu li dl div form".split(" ");
  var data = {};
  /** @type {number} */
  var i = 0;
  /** @type {number} */
  i = 0;
  for (;i < codeSegments.length;i++) {
    /** @type {boolean} */
    data[codeSegments[i]] = true;
  }
  /**
   * @param {Node} el
   * @param {string} token
   * @param {Object} modified
   * @return {undefined}
   */
  var handler = function(el, token, modified) {
    var thisObject = this;
    if (!el || !el.contentEditable) {
      throw new Error("First argument must be contentEditable");
    }
    /** @type {Node} */
    this.elem = el;
    this.emulateTextarea = el.getAttribute("plaintext-only") || token;
    if (this.emulateTextarea) {
      /**
       * @return {undefined}
       */
      this.pasteHandler = function() {
        var block = thisObject.plainTextReformat;
        /**
         * @return {undefined}
         */
        var run = function() {
          /** @type {null} */
          block.timeout = null;
          block.call(thisObject);
        };
        if (block.timeout) {
          window.clearTimeout(block.timeout);
        }
        /** @type {number} */
        block.timeout = window.setTimeout(run, 0);
      };
      addListener(el, "paste", this.pasteHandler);
    }
    var field;
    for (field in modified) {
      if (modified.hasOwnProperty(field)) {
        this[field] = modified[field];
      }
    }
  };
  return handler.prototype = {
    /**
     * @param {string} param
     * @return {?}
     */
    insertHTML : function(param) {
      if (doc.all) {
        /** @type {(ControlRange|TextRange|null)} */
        var $range = doc.selection.createRange();
        return $range.pasteHTML(param), $range.collapse(false), $range.select();
      }
      return doc.execCommand("insertHTML", false, param);
    },
    /**
     * @param {Node} node
     * @return {undefined}
     */
    insertNode : function(node) {
      var selection;
      var range;
      var html;
      if (window.getSelection) {
        /** @type {(Selection|null)} */
        selection = window.getSelection();
        if (selection.getRangeAt) {
          if (selection.rangeCount) {
            /** @type {(Range|null)} */
            range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(node);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } else {
        if (doc.selection) {
          if (doc.selection.createRange) {
            /** @type {(ControlRange|TextRange|null)} */
            range = doc.selection.createRange();
            html = 3 === node.nodeType ? node.data : node.outerHTML;
            range.pasteHTML(html);
            range.collapse(false);
          }
        }
      }
    },
    /**
     * @param {Array} nodes
     * @return {?}
     */
    getTextNodes : function(nodes) {
      var el = this.elem;
      if (nodes && nodes.nodeType) {
        /** @type {Array} */
        nodes = [nodes];
      } else {
        if (!nodes) {
          nodes = el.childNodes;
        }
      }
      var node;
      /** @type {Array} */
      var acc = [];
      /** @type {number} */
      var i = 0;
      for (;i < nodes.length;++i) {
        if (node = nodes[i]) {
          switch(node.nodeType) {
            case 1:
              /** @type {Array} */
              acc = acc.concat(this.getTextNodes(node.childNodes));
              break;
            case 3:
              if (!/^\n\s+/.test(node.nodeValue)) {
                acc.push(node);
              }
            ;
          }
        }
      }
      return acc;
    },
    /**
     * @param {Object} text
     * @return {?}
     */
    text : function(text) {
      var value;
      var results;
      var j;
      var elem = this.elem;
      try {
        /** @type {Array.<?>} */
        results = Array.prototype.slice.call(elem.childNodes);
      } catch (g) {
        /** @type {Array} */
        results = [];
        /** @type {number} */
        j = 0;
        for (;j < elem.childNodes.length;++j) {
          results.push(elem.childNodes[j]);
        }
      }
      return value = callback(results, text, this.emulateTextarea && "\n"), value.replace(/^\s+|\s+$/g, "");
    },
    /**
     * @param {string} text
     * @return {undefined}
     */
    setText : function(text) {
      text = text || "";
      var root;
      var args;
      var fragment;
      /** @type {DocumentFragment} */
      var grid = doc.createDocumentFragment();
      var item = this.emulateTextarea ? [text.replace(/(?:\r\n|\r|\n){2,}/g, "\n\n")] : text.split(/(?:\r\n|\r|\n){2,}/);
      var handler = item && item.length;
      /** @type {number} */
      root = 0;
      for (;handler > root;root++) {
        args = item[root];
        fragment = this.createParagraph(args);
        grid.appendChild(fragment);
      }
      grid.lastChild.appendChild(doc.createElement("br"));
      /** @type {string} */
      this.elem.innerHTML = "";
      this.elem.appendChild(grid);
      /** @type {(Selection|null)} */
      var selection = window.getSelection && window.getSelection();
      if (selection) {
        if (selection.anchorNode === this.elem) {
          if (selection.modify) {
            selection.modify("move", "forward", "line");
          }
        }
      }
    },
    /**
     * @param {string} text
     * @return {?}
     */
    createParagraph : function(text) {
      var i;
      var j;
      var parts;
      var part;
      var subLn;
      var _len;
      var elements;
      /** @type {Element} */
      var parent = doc.createElement("p");
      parts = text.split(/\r\n|\r|\n/);
      /** @type {number} */
      j = 0;
      subLn = parts.length;
      for (;subLn > j;j++) {
        part = parts[j];
        elements = this.getHtmlElements(part);
        /** @type {number} */
        i = 0;
        _len = elements.length;
        for (;_len > i;i++) {
          parent.appendChild(elements[i]);
        }
        parent.appendChild(doc.createElement("br"));
      }
      return parent.lastChild && parent.removeChild(parent.lastChild), parent;
    },
    /**
     * @param {?} text
     * @return {?}
     */
    getHtmlElements : function(text) {
      return[doc.createTextNode(text)];
    },
    /**
     * @return {undefined}
     */
    plainTextReformat : function() {
      if (!(this.elem.getElementsByTagName("p").length <= 1)) {
        /** @type {boolean} */
        this.emulateTextarea = false;
        var text = this.text();
        /** @type {boolean} */
        this.emulateTextarea = true;
        this.setText(text);
      }
    },
    /**
     * @param {Node} node
     * @return {undefined}
     */
    removeNode : function(node) {
      var prev;
      var selection;
      var range;
      if (window.getSelection) {
        prev = node.previousSibling;
        node.parentNode.removeChild(node);
        /** @type {(Selection|null)} */
        selection = window.getSelection();
        /** @type {(Range|null)} */
        range = doc.createRange();
        if (prev) {
          range.setStart(prev, prev.length);
          range.setEnd(prev, prev.length);
        }
        selection.addRange(range);
      } else {
        node.parentNode.removeChild(node);
      }
    },
    /**
     * @return {?}
     */
    selectedTextNode : function() {
      var sel;
      var node;
      var elem = this.elem;
      if (window.getSelection) {
        return sel = window.getSelection(), sel.anchorNode;
      }
      if (doc.selection.createRange) {
        node = doc.selection.createRange().duplicate();
        for (;-1E3 === node.moveStart(CHARACTER, -1E3);) {
          continue;
        }
        var param;
        var e;
        var codeSegments;
        var declarationError;
        var cx;
        var j;
        var i;
        var text = node.text;
        /** @type {number} */
        j = 0;
        for (;j < elem.childNodes.length;++j) {
          param = elem.childNodes[j];
          codeSegments = this.getTextNodes(param);
          /** @type {number} */
          i = 0;
          for (;i < codeSegments.length;++i) {
            if (e = codeSegments[i], cx = fn(e.nodeValue), text.indexOf(cx) > -1) {
              declarationError = e;
              text = text.replace(cx, "");
            } else {
              if (cx.indexOf(text) > -1) {
                return e;
              }
            }
          }
        }
        return declarationError;
      }
    },
    /**
     * @param {HTMLElement} b
     * @return {?}
     */
    selectedTextNodeOffset : function(b) {
      var textRange;
      var state;
      if (window.getSelection) {
        /** @type {(Selection|null)} */
        var pop = window.getSelection();
        if (pop) {
          if (pop.anchorOffset) {
            /** @type {number} */
            state = pop.anchorOffset;
          }
        }
      } else {
        if (b && doc.selection.createRange) {
          /** @type {(ControlRange|TextRange|null)} */
          textRange = doc.selection.createRange();
          var r = fn(b.nodeValue);
          var range3 = textRange.duplicate();
          var j = range3.parentElement();
          /** @type {number} */
          var IN_TAG = 0;
          for (;0 !== textRange.moveStart(CHARACTER, -1) && (++IN_TAG && (0 !== r.indexOf(fn(textRange.text)) && j === textRange.parentElement()));) {
            range3 = textRange.duplicate();
            j = range3.parentElement();
          }
          /** @type {number} */
          state = IN_TAG;
        }
      }
      return isNaN(state) ? 0 : state;
    },
    /**
     * @return {?}
     */
    offset : function() {
      /**
       * @param {Array} nodes
       * @param {string} string
       * @return {?}
       */
      function walk(nodes, string) {
        /**
         * @param {Array} codeSegments
         * @return {undefined}
         */
        function _walk(codeSegments) {
          result += codeSegments[0];
          /** @type {number} */
          var i = 1;
          for (;i < codeSegments.length;++i) {
            queryString.push(result);
            result = codeSegments[i];
          }
        }
        if ("string" != typeof string) {
          /** @type {string} */
          string = "\n\n";
        }
        /** @type {Array} */
        var queryString = [];
        /** @type {string} */
        var result = "";
        /** @type {number} */
        var i = 0;
        for (;i < nodes.length;++i) {
          var node = nodes[i];
          var nodeName = node.nodeName.toLowerCase();
          if (1 === node.nodeType) {
            if (data.hasOwnProperty(nodeName)) {
              if (result) {
                result += string;
              }
              _walk(walk(node.childNodes, string));
            } else {
              if ("br" === nodeName) {
                result += "\n";
              } else {
                _walk(walk(node.childNodes, string));
              }
            }
          } else {
            if (3 === node.nodeType) {
              if (node === sel.anchorNode) {
                result += fn(node.nodeValue.slice(0, sel.anchorOffset));
                queryString.push(result);
                result = fn(node.nodeValue.slice(sel.anchorOffset));
              } else {
                result += fn(node.nodeValue);
              }
            }
          }
        }
        return queryString.push(result), queryString;
      }
      if (!window.getSelection) {
        return 0;
      }
      /** @type {(Selection|null)} */
      var sel = window.getSelection();
      if (!sel || (!sel.anchorNode || 3 !== sel.anchorNode.nodeType)) {
        return 0;
      }
      var nodes;
      var elem = this.elem;
      try {
        /** @type {Array.<?>} */
        nodes = Array.prototype.slice.call(elem.childNodes);
      } catch (f) {
        /** @type {Array} */
        nodes = [];
        /** @type {number} */
        var i = 0;
        for (;i < elem.childNodes.length;++i) {
          nodes.push(elem.childNodes[i]);
        }
      }
      var result = walk(nodes, this.emulateTextarea && "\n");
      if (1 === result.length) {
        return 0;
      }
      var minLength = result[0].length;
      var str = result.join("");
      var codeSegments = str.match(/\s+$/);
      if (codeSegments) {
        var at = codeSegments[0].length;
        /** @type {number} */
        minLength = Math.min(minLength, str.length - at);
      }
      var captures = str.match(/^\s+/);
      if (captures) {
        var cnl = captures[0].length;
        minLength -= cnl;
      }
      return minLength;
    },
    /**
     * @param {Node} b
     * @param {number} startOffset
     * @param {number} i
     * @return {?}
     */
    selectNodeText : function(b, startOffset, i) {
      var selection;
      var range;
      var elem = this.elem;
      if (window.getSelection) {
        return selection = window.getSelection(), selection.removeAllRanges(), range = doc.createRange(), range.setStart(b, startOffset), range.setEnd(b, i), selection.addRange(range), selection;
      }
      if (doc.selection.createRange) {
        /** @type {(ControlRange|TextRange|null)} */
        range = doc.selection.createRange();
        var arr = fn(b.nodeValue);
        if ("body" === range.parentElement().nodeName.toLowerCase()) {
          elem.focus();
          /** @type {(ControlRange|TextRange|null)} */
          range = doc.selection.createRange();
          for (;-1E3 === range.moveStart(CHARACTER, -1E3);) {
            continue;
          }
          for (;1E3 === range.moveEnd(CHARACTER, 1E3);) {
            continue;
          }
          var data = fn(range.text);
          var j = data.indexOf(arr);
          if (j > 0) {
            range.moveStart(CHARACTER, j + 2);
          }
          range.collapse();
        }
        for (;-1 === range.moveStart(CHARACTER, -1) && 0 !== arr.indexOf(fn(range.text));) {
          continue;
        }
        for (;1 === range.moveEnd(CHARACTER, 1) && arr !== fn(range.text);) {
          continue;
        }
        return range.moveStart(CHARACTER, startOffset), range.moveEnd(CHARACTER, -1 * (i - startOffset - range.text.length)), range.select(), range;
      }
    }
  }, handler.normalizeSpace = fn, handler;
}), define("core/CappedStorage", ["core/utils/storage"], function(model) {
  /**
   * @param {number} max
   * @param {string} queueKey
   * @return {undefined}
   */
  var QueuedStorage = function(max, queueKey) {
    this.max = max || 10;
    this.queueKey = queueKey || "__queue";
    if (!this.getQueue()) {
      this.setQueue([]);
    }
  };
  return QueuedStorage.prototype.set = function(value, recurring) {
    var queue = this.getQueue() || this.setQueue([]);
    if (queue.length === this.max) {
      model.remove(queue.shift());
    }
    model.set(value, recurring);
    queue.push(value);
    this.setQueue(queue);
  }, QueuedStorage.prototype.get = function(name) {
    return model.get(name);
  }, QueuedStorage.prototype.remove = function(doc) {
    model.remove(doc);
    var drop = this.getQueue() || [];
    /** @type {number} */
    var i = 0;
    for (;i < drop.length;i++) {
      if (drop[i] === doc) {
        drop.splice(i, 1);
        break;
      }
    }
    this.setQueue(drop);
  }, QueuedStorage.prototype.clear = function() {
    model.clear();
    this.setQueue([]);
  }, QueuedStorage.prototype.getQueue = function() {
    return model.get(this.queueKey);
  }, QueuedStorage.prototype.setQueue = function(recurring) {
    return model.set(this.queueKey, recurring), recurring;
  }, QueuedStorage;
}), define("core/extensions/jquery.autoresize", ["jquery", "underscore"], function($, _) {
  return $.fn.autoresize = function(protoProps) {
    var config = _.extend({
      extraSpace : 0,
      maxHeight : 1E3
    }, protoProps);
    return this.each(function() {
      var element = $(this).css({
        resize : "none",
        overflow : "hidden"
      });
      /** @type {string} */
      var method = "true" === String(element[0].contentEditable) ? "html" : "val";
      /** @type {string} */
      var path = "html" === method ? "<br>" : "\n";
      var rh = element.height();
      var container = function() {
        var obj = {};
        _.each(obj, function(dataAndEvents, val) {
          obj[val] = element.css(val);
        });
        var panel = $(element[0].cloneNode(true));
        return panel.removeAttr("id").removeAttr("name").css({
          visibility : "hidden",
          position : "absolute",
          top : "-9999px",
          left : "-9999px",
          contentEditable : false
        }).css(obj).attr("tabIndex", "-1"), panel.insertAfter(element[0]), panel;
      }();
      /** @type {null} */
      var prevScollTop = null;
      /**
       * @return {undefined}
       */
      var update = function() {
        /** @type {number} */
        container[0].style.height = 0;
        container[method](element[method]() + path);
        container.scrollTop(container[0].scrollHeight);
        /** @type {number} */
        var scrollTop = Math.max(container[0].scrollHeight, rh) + parseInt(config.extraSpace, 10);
        if (config.maxHeight) {
          if (scrollTop >= config.maxHeight) {
            element.css("overflow", "");
            scrollTop = config.maxHeight;
          } else {
            element.css("overflow", "hidden");
          }
        }
        if (prevScollTop !== scrollTop) {
          /** @type {number} */
          prevScollTop = scrollTop;
          element.height(scrollTop);
          if (element.trigger) {
            element.trigger("resize");
          }
        }
      };
      var throttledUpdate = _.throttle(update, 500);
      /**
       * @param {?} e
       * @return {undefined}
       */
      var onKeyDown = function(e) {
        if (13 === e.keyCode) {
          update();
        } else {
          throttledUpdate();
        }
      };
      element.bind("keyup", onKeyDown).bind("paste", update).css("overflow", "hidden");
      update();
    });
  }, $;
}), define("core/views/TextareaView", ["underscore", "jquery", "backbone", "core/utils", "core/CappedStorage", "core/extensions/jquery.autoresize"], function(Debounce, $, Backbone, console, dataAndEvents) {
  var f = Backbone.View.extend({
    events : {
      "keydown  [data-role=editable]" : "handleKeyDown",
      "keyup    [data-role=editable]" : "handleKeyUp",
      "paste    [data-role=editable]" : "handlePaste",
      "focusin  [data-role=editable]" : "handleFocusIn",
      "blur     [data-role=editable]" : "handleBlur"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      options = options || {};
      this.storageKey = options.storageKey;
      this.value = options.value || this.getDraft()[0];
      this.placeholder = options.placeholder;
      this.listenTo(this, "keychange", Debounce.debounce(this.saveDraft, this.constructor.SAVE_DRAFT_INTERVAL));
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$input = this.createInput(), this.set(this.value), this.$el.append(this.$input), this.$input.autoresize({
        maxHeight : this.constructor.MAX_TEXTAREA_HEIGHT
      }), this;
    },
    /**
     * @return {?}
     */
    createInput : function() {
      return $("<textarea>").attr({
        "class" : "textarea",
        placeholder : this.placeholder,
        "data-role" : "editable"
      });
    },
    /**
     * @return {undefined}
     */
    resize : function() {
      this.$input.trigger("paste", {
        fake : true
      });
    },
    /**
     * @return {?}
     */
    get : function() {
      return this.$input.val();
    },
    /**
     * @return {?}
     */
    getSelected : function() {
      var elem = this.$input[0];
      if ("number" == typeof elem.selectionStart) {
        var that = this.$input.val();
        return that.substring(elem.selectionStart, elem.selectionEnd);
      }
      return "";
    },
    /**
     * @return {?}
     */
    offset : function() {
      var options = this.$input[0];
      return "number" == typeof options.selectionStart ? options.selectionStart : 0;
    },
    /**
     * @param {Array} a
     * @return {undefined}
     */
    insertAtCursor : function(a) {
      this.focus();
      var menu = this.get();
      var pos = this.offset();
      var header = console.insertWithWhitespace(menu, pos, a);
      var targetElement = this.$input[0];
      if (this.set(header), targetElement.setSelectionRange) {
        var length = header.indexOf(a, pos) + a.length + 1;
        targetElement.setSelectionRange(length, length);
      }
    },
    /**
     * @param {Array} value
     * @param {?} _
     * @return {undefined}
     */
    insertAroundSelection : function(value, _) {
      this.focus();
      var start;
      var end;
      var textarea = this.$input[0];
      if ("number" == typeof textarea.selectionStart) {
        /** @type {number} */
        start = textarea.selectionStart;
        end = textarea.selectionEnd;
      } else {
        /** @type {number} */
        start = end = 0;
      }
      var b = this.get();
      var pdataOld = b.substring(0, start) + value + b.substring(start, end) + _ + b.substring(end);
      this.set(pdataOld);
      if (textarea.setSelectionRange) {
        textarea.setSelectionRange(start + value.length, end + value.length);
      }
    },
    /**
     * @param {string} value
     * @return {undefined}
     */
    set : function(value) {
      this.$input.val(value);
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      this.set("");
    },
    /**
     * @return {undefined}
     */
    focus : function() {
      this.$input[0].focus();
    },
    /**
     * @param {?} e
     * @return {undefined}
     */
    handleKeyDown : function(e) {
      this.trigger("keydown", e);
    },
    /**
     * @param {?} e
     * @return {undefined}
     */
    handleKeyUp : function(e) {
      this.trigger("keychange", e);
    },
    /**
     * @param {?} dataAndEvents
     * @param {Object} e
     * @return {undefined}
     */
    handlePaste : function(dataAndEvents, e) {
      e = e || {};
      this.trigger(e.fake ? "paste" : "paste keychange");
      this.$input.trigger("resize");
    },
    /**
     * @return {undefined}
     */
    handleFocusIn : function() {
      this.trigger("focus");
    },
    /**
     * @return {undefined}
     */
    handleBlur : function() {
      this.trigger("blur");
    },
    /**
     * @return {?}
     */
    saveDraft : function() {
      return this.storageKey ? $.trim(this.get()) ? void this.constructor.storage.set(this.storageKey, this.toJSON()) : void this.removeDraft() : void 0;
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      return[this.get(), $.now()];
    },
    /**
     * @return {?}
     */
    getDraft : function() {
      /** @type {Array} */
      var response = [""];
      if (!this.storageKey) {
        return response;
      }
      var res = this.constructor.storage.get(this.storageKey);
      if (!res) {
        return response;
      }
      if (response = res, !response.length) {
        return[""];
      }
      /** @type {boolean} */
      var selector = $.now() - response[1] >= this.constructor.DRAFT_MAX_AGE;
      return selector ? (this.removeDraft(), [""]) : response;
    },
    /**
     * @return {undefined}
     */
    removeDraft : function() {
      if (this.storageKey) {
        this.constructor.storage.remove(this.storageKey);
      }
    }
  }, {
    MAX_TEXTAREA_HEIGHT : 350,
    SAVE_DRAFT_INTERVAL : 500,
    DRAFT_MAX_AGE : 864E5,
    storage : new dataAndEvents(5, "drafts.queue")
  });
  return f;
}), define("core/views/ContentEditableView", ["jquery", "underscore", "core/editable", "core/views/TextareaView"], function($, a, MessageService, dataAndEvents) {
  /** @type {Object} */
  var BaseView = dataAndEvents;
  var p = BaseView.prototype;
  var g = BaseView.extend({
    /**
     * @return {?}
     */
    events : function() {
      return a.extend({}, p.events, {
        "focusout [data-role=editable]" : "handleFocusOut",
        "click .placeholder" : "handlePlaceholderClick"
      });
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      p.initialize.apply(this, arguments);
      /** @type {boolean} */
      this.hasFocus = false;
      /** @type {null} */
      this._selectionRange = null;
    },
    /**
     * @return {undefined}
     */
    saveSelection : function() {
      if (window.getSelection) {
        /** @type {(Selection|null)} */
        var sel = window.getSelection();
        /** @type {(Range|null|number)} */
        var range = sel && (sel.rangeCount && sel.getRangeAt(0));
        /** @type {(Range|null|number)} */
        this._selectionRange = range;
      }
    },
    /**
     * @return {undefined}
     */
    restoreSelection : function() {
      if (this._selectionRange) {
        /** @type {(Selection|null)} */
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this._selectionRange);
        /** @type {null} */
        this._selectionRange = null;
      }
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$input = this.createInput(), this.$el.append(this.$input), this.set(this.value), this.renderPlaceholder(), this;
    },
    /**
     * @return {?}
     */
    createInput : function() {
      var services = $("<div>").attr({
        "class" : "textarea",
        tabIndex : 0,
        role : "textbox",
        "aria-multiline" : "true",
        contenteditable : "true",
        "data-role" : "editable"
      }).css({
        overflow : "auto",
        "max-height" : this.constructor.MAX_TEXTAREA_HEIGHT + "px"
      });
      return this.content = new MessageService(services[0], true), services;
    },
    /**
     * @return {undefined}
     */
    renderPlaceholder : function() {
      var placeholder = this.placeholder;
      if (placeholder) {
        this.$input.attr("aria-label", placeholder);
        this.$placeholder = $('<span class="placeholder">' + placeholder + "</span>");
        this.updatePlaceholderDisplay();
      }
    },
    /**
     * @return {undefined}
     */
    updatePlaceholderDisplay : function() {
      if (this.$placeholder) {
        if (this.hasFocus || this.content.text()) {
          this.$placeholder.remove();
        } else {
          this.$el.prepend(this.$placeholder);
        }
      }
    },
    /**
     * @return {undefined}
     */
    handlePlaceholderClick : function() {
      this.$input.focus();
    },
    /**
     * @return {undefined}
     */
    handleFocusIn : function() {
      p.handleFocusIn.call(this);
      this.restoreSelection();
      /** @type {boolean} */
      this.hasFocus = true;
      this.updatePlaceholderDisplay();
    },
    /**
     * @return {undefined}
     */
    handleFocusOut : function() {
      this.saveSelection();
      /** @type {boolean} */
      this.hasFocus = false;
      this.updatePlaceholderDisplay();
    },
    /**
     * @return {?}
     */
    get : function() {
      return this.content.text();
    },
    /**
     * @return {?}
     */
    getSelected : function() {
      return this.hasFocus && window.getSelection ? window.getSelection().toString() : this._selectionRange ? this._selectionRange.toString() : "";
    },
    /**
     * @return {?}
     */
    offset : function() {
      return this.content.offset();
    },
    /**
     * @param {string} value
     * @return {undefined}
     */
    set : function(value) {
      this.content.setText(value);
      this.resize();
      this.updatePlaceholderDisplay();
    },
    /**
     * @param {string} collapse
     * @return {undefined}
     */
    insertAtCursor : function(collapse) {
      this.focus();
      /** @type {string} */
      var content = " " + collapse + " ";
      if (!(document.queryCommandSupported && (document.queryCommandSupported("insertText") && document.execCommand("insertText", false, content)))) {
        this.content.insertNode(document.createTextNode(content));
      }
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      p.clear.call(this);
      a.defer(function(ui) {
        ui.$input.blur();
      }, this);
    },
    /**
     * @param {Array} item
     * @param {?} tail
     * @return {undefined}
     */
    insertAroundSelection : function(item, tail) {
      if (window.getSelection) {
        this.focus();
        /** @type {(Selection|null)} */
        var selection = window.getSelection();
        if (selection.rangeCount) {
          /** @type {(Range|null)} */
          var range = selection.getRangeAt(0);
          /** @type {(Range|null)} */
          var clone1 = range.cloneRange();
          clone1.collapse(false);
          /** @type {Text} */
          var endNode = document.createTextNode(tail);
          clone1.insertNode(endNode);
          /** @type {(Range|null)} */
          var self = range.cloneRange();
          self.collapse(true);
          /** @type {Text} */
          var newNode = document.createTextNode(item);
          self.insertNode(newNode);
          range.setStart(newNode, item.length);
          range.setEnd(endNode, 0);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  });
  return g;
}), define("core/views/PostReplyView", ["jquery", "underscore", "backbone", "modernizr", "core/UniqueModel", "core/mixins/withAlert", "core/mixins/withUploadForm", "core/models/Post", "core/models/User", "core/utils", "core/views/ContentEditableView", "core/views/TextareaView", "core/strings"], function($, _, Backbone, deepDataAndEvents, XTemplate, fn, connect, Post, User, dataAndEvents, ignoreMethodDoesntExist, textAlt, http) {
  var getter = http.get;
  var throttledUpdate = dataAndEvents.preventDefaultHandler;
  var self = Backbone.View.extend({
    tagName : "form",
    className : "reply",
    events : {
      submit : "submitForm"
    },
    postboxAlertSelector : "[role=postbox-alert]",
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      this.session = options.session;
      this.parent = options.parent;
      this.thread = options.thread;
      this.post = this.makePostInstance();
      this.setAlertSelector("[role=alert]");
      this.shouldShowEmailAlertInForm = options.shouldShowEmailAlertInForm;
      this.parentView = options.parentView;
      /** @type {boolean} */
      this._isHidden = false;
      if (this.parent) {
        self.open[this.parent.cid] = this;
      }
      this.allowMedia = this.thread.forum.get("settings").allowMedia;
      this.allowUploads = this.allowMedia && this.uploadSupported;
      this.listenTo(this.session, "change:id", this.redraw);
    },
    /**
     * @return {undefined}
     */
    redraw : function() {
      var doToggle = this.$el.hasClass("expanded");
      var el = this.el;
      var oldPagerPosition = this.$el.find("textarea").val();
      this.render();
      this.$el.find("textarea").val(oldPagerPosition);
      if (doToggle) {
        this.$el.addClass("expanded");
      }
      if (0 !== $(el).parent().length) {
        el.parentNode.replaceChild(this.el, el);
      }
    },
    /**
     * @return {?}
     */
    getPlaceholderText : function() {
      return getter(this.thread.get("posts") ? "Join the discussion\u00e2\u20ac\u00a6" : "Start the discussion\u00e2\u20ac\u00a6");
    },
    /**
     * @return {?}
     */
    getTemplateData : function() {
      return{
        user : this.session.toJSON(),
        displayMediaPreviews : this.allowMedia,
        displayMediaUploadButton : this.allowUploads
      };
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(this.template(this.getTemplateData())), this.parent ? this.$el.addClass("expanded") : this.$el.removeClass("expanded"), this.initTextarea(), this.initMediaViews({
        allowMedia : this.allowMedia,
        allowUploads : this.allowUploads,
        storageKey : this.post.storageKey("media"),
        textarea : this.textarea
      }), this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum) && this._alertMustVerify(this.shouldShowEmailAlertInForm), this._isHidden && this.$el.addClass("hidden"), this;
    },
    /**
     * @return {?}
     */
    createTextarea : function() {
      var attrs = {
        placeholder : this.getPlaceholderText(),
        storageKey : this.post.storageKey()
      };
      return this.constructor.canUseContentEditable ? new this.constructor.ContentEditableView(attrs) : new this.constructor.TextareaView(attrs);
    },
    /**
     * @return {undefined}
     */
    initTextarea : function() {
      var ta = this.textarea = this.createTextarea();
      this.$("[data-role=textarea]").prepend(ta.render().el);
      this.listenTo(ta, {
        /**
         * @param {Object} e
         * @return {undefined}
         */
        keydown : function(e) {
          if (!!e) {
            if (!(!e.ctrlKey && !e.metaKey)) {
              if (!(13 !== e.keyCode && 10 !== e.keyCode)) {
                this.submitForm();
              }
            }
          }
        },
        /**
         * @return {undefined}
         */
        focus : function() {
          if (!this.$el.hasClass("expanded")) {
            this.$el.addClass("expanded");
          }
        }
      });
    },
    /**
     * @return {undefined}
     */
    resize : function() {
      this.textarea.resize();
    },
    /**
     * @return {undefined}
     */
    focus : function() {
      this.textarea.focus();
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      var self = this;
      self.textarea.clear();
      self.clearMediaPreviews();
      self.$el.removeClass("expanded");
      _.delay(function() {
        self.resize();
      }, 200);
      if (self.parent) {
        self.hide();
      }
    },
    /**
     * @param {Node} state
     * @return {undefined}
     */
    restore : function(state) {
      var panel = this;
      panel.textarea.set(state.get("raw_message"));
      panel.textarea.handleFocusIn();
      _.delay(function() {
        panel.resize();
      }, 200);
      if (panel.parent) {
        panel.show();
      }
    },
    /**
     * @param {boolean} dataAndEvents
     * @return {undefined}
     */
    _alertMustVerify : function(dataAndEvents) {
      var message = this.emailVerifyAlertTemplate({
        user : this.session.user.toJSON(),
        forumName : this.thread.forum.get("name"),
        forumId : this.thread.forum.id
      });
      this.alert(message, {
        safe : true,
        type : dataAndEvents ? "error" : "warn",
        target : dataAndEvents ? this.postboxAlertSelector : null
      });
    },
    submitForm : throttledUpdate(function() {
      return this.dismissAlert(), this.initiatePost();
    }),
    /**
     * @return {?}
     */
    makePostInstance : function() {
      return new XTemplate(this.constructor.Post, {
        thread : this.thread.id,
        depth : this.parent ? this.parent.get("depth") + 1 : 0,
        parent : this.parent ? this.parent.id : null
      });
    },
    /**
     * @return {?}
     */
    getPostParams : function() {
      var deep = {
        raw_message : this.textarea.get()
      };
      _.extend(deep, this.getAuthorParams());
      var actual = this.mediaUploadsView;
      return actual && (deep.media = actual.legacy.invoke("toMediaJSON").concat(actual.rich.invoke("toJSON"))), deep;
    },
    /**
     * @return {?}
     */
    getAuthorParams : function() {
      return{
        author_id : this.session.user.id
      };
    },
    /**
     * @return {undefined}
     */
    initiatePost : function() {
      this.createPost(this.getPostParams());
    },
    /**
     * @param {string} type
     * @return {?}
     */
    createPost : function(type) {
      var message = this.post;
      this.dismissAlert();
      var classes = $.now();
      if (!this.shouldAbortCreatePost(message, type)) {
        return this.listenTo(message, {
          error : this._onCreateError,
          sync : _.partial(this._onCreateSync, classes)
        }), message.save(type, {
          uploadTokens : this.getMediaUploadTokens()
        }), this.attachAuthorToPost(message, type), message.created = true, this.addPostToThread(message), this.clear(), this.trigger("uiAction:createPost", message), message;
      }
    },
    /**
     * @param {(Node|string)} model
     * @param {string} object
     * @return {?}
     */
    shouldAbortCreatePost : function(model, object) {
      return this.isUploadInProgress() ? (this.alert(getter("Please wait until your images finish uploading."), {
        type : "error",
        target : this.postboxAlertSelector
      }), true) : model.set(object, {
        validate : true
      }) ? false : (this.alert(model.validationError, {
        type : "error",
        target : this.postboxAlertSelector
      }), true);
    },
    /**
     * @param {string} doc
     * @param {Object} err
     * @return {undefined}
     */
    _onCreateError : function(doc, err) {
      if (12 === err.code && /not have permission to post on this thread/.test(err.response)) {
        var message = this.blacklistErrorMessageTemplate({
          forumName : this.thread.forum.get("name")
        });
        this.alert(message, {
          type : "error",
          target : this.postboxAlertSelector,
          safe : true
        });
      } else {
        if (12 === err.code && /verify/.test(err.response)) {
          this._alertMustVerify(true);
        } else {
          if (_.isString(err.response)) {
            this.alert(err.response, {
              type : "error",
              target : this.postboxAlertSelector
            });
          } else {
            this.alert(getter("Oops! We're having trouble posting your comment. Check your internet connection and try again."), {
              type : "error",
              target : this.postboxAlertSelector
            });
          }
        }
      }
      this.thread.posts.remove(doc);
      this.restore(doc);
    },
    /**
     * @param {?} time
     * @param {?} model
     * @return {undefined}
     */
    _onCreateSync : function(time, model) {
      this.textarea.removeDraft();
      this.thread.trigger("create", model);
      this.trigger("uiCallback:postCreated", model, {
        duration : $.now() - time
      });
      if (this.parentView) {
        this.parentView.toggleReplyLink(false);
      }
      this.stopListening(model, "error", this._onCreateError);
      this.stopListening(model, "sync", this._onCreateSync);
      this.post = this.makePostInstance();
      this.trigger("domReflow");
    },
    /**
     * @param {Object} data
     * @param {string} options
     * @return {undefined}
     */
    attachAuthorToPost : function(data, options) {
      data.author = this.session.isLoggedIn() ? this.session.user : new XTemplate(this.constructor.User, {
        name : options.author_name,
        email : options.author_email
      });
    },
    /**
     * @param {?} bytes
     * @return {undefined}
     */
    addPostToThread : function(bytes) {
      this.thread.posts.add(bytes);
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      if (this.parent) {
        delete self.open[this.parent.cid];
      }
      Backbone.View.prototype.remove.call(this);
    },
    /**
     * @return {undefined}
     */
    toggle : function() {
      if (this.isOpen()) {
        this.hide();
      } else {
        this.show();
      }
    },
    /**
     * @return {undefined}
     */
    show : function() {
      var self = this;
      /** @type {boolean} */
      self._isHidden = false;
      self.$el.removeClass("hidden");
      self.trigger("show");
    },
    /**
     * @return {undefined}
     */
    hide : function() {
      var self = this;
      /** @type {boolean} */
      self._isHidden = true;
      self.dismissAlert();
      self.$el.addClass("hidden");
      self.trigger("hide");
    },
    /**
     * @return {?}
     */
    isOpen : function() {
      return!this._isHidden;
    }
  }, {
    /**
     * @param {?} target
     * @param {?} lock
     * @return {?}
     */
    mustVerifyEmailToPost : function(target, lock) {
      if (target.isAnonymous()) {
        return false;
      }
      var _tryInitOnFocus = lock.get("settings").mustVerifyEmail;
      var _isFocused = target.get("isVerified");
      return _tryInitOnFocus && !_isFocused;
    },
    canUseContentEditable : deepDataAndEvents.contenteditable && (!dataAndEvents.isMobileUserAgent() && !(window.opera && window.opera.version)),
    TextareaView : textAlt,
    ContentEditableView : ignoreMethodDoesntExist,
    User : User,
    Post : Post,
    open : {}
  });
  return fn.call(self.prototype), connect.call(self.prototype), self;
}), define("lounge/mixins/post-reply", ["underscore", "common/models", "lounge/common"], function(_, B, dataAndEvents) {
  var methods = {
    /**
     * @return {undefined}
     */
    initialize : function() {
      if (this.canBindTypingHandlers()) {
        this.bindTypingHandlers();
      }
    },
    /**
     * @return {?}
     */
    canBindTypingHandlers : function() {
      return this.parent && (dataAndEvents.getLounge().isRealtimeEnabled() && (this.session && (this.thread && this.thread.forum)));
    },
    /**
     * @return {?}
     */
    bindTypingHandlers : function() {
      return _.map([[this, "show", this.typingStart], [this, "hide", this.typingStop]], function(checkSet) {
        return this.listenTo.apply(this, checkSet), checkSet;
      }, this);
    },
    /**
     * @param {boolean} recurring
     * @return {undefined}
     */
    syncTyping : function(recurring) {
      if (this.typingUser) {
        if (void 0 !== recurring) {
          this.typingUser.set("typing", recurring);
        }
        this.typingUser.sync();
      }
    },
    /**
     * @return {undefined}
     */
    typingStart : function() {
      var p = this.parent;
      if (!this.typingUser) {
        this.typingUser = B.TypingUser.make({
          user : this.session.user.id,
          post : p.id,
          thread : this.thread.id,
          forum : this.thread.forum.id
        });
        p.usersTyping.add(this.typingUser);
      }
      this.syncTyping(true);
    },
    /**
     * @return {undefined}
     */
    typingStop : function() {
      this.syncTyping(false);
    }
  };
  /**
   * @param {Object} config
   * @return {undefined}
   */
  var initialize = function(config) {
    /** @type {function (): undefined} */
    var matcherFunction = config.initialize;
    /** @type {function (): ?} */
    var _remove = config.remove;
    _.extend(config, methods);
    /**
     * @return {undefined}
     */
    config.initialize = function() {
      matcherFunction.apply(this, arguments);
      methods.initialize.call(this);
    };
    /**
     * @return {?}
     */
    config.remove = function() {
      return this.parent && this.typingStop(), _remove.call(this);
    };
  };
  return{
    /** @type {function (Object): undefined} */
    asRealtimeTyping : initialize
  };
}), define("lounge/views/posts/SuggestionView", ["jquery", "underscore", "backbone", "common/templates"], function($, array, Backbone, self) {
  var e = Backbone.View.extend({
    events : {
      "click li" : "handleClick"
    },
    /**
     * @param {string} contentHTML
     * @return {undefined}
     */
    initialize : function(contentHTML) {
      /** @type {boolean} */
      this.active = false;
      this.mentionsCache = contentHTML.mentions;
      this.userSuggestions = contentHTML.userSuggestions;
      this.userHtmlCache = {};
    },
    /**
     * @param {string} data
     * @return {?}
     */
    suggest : function(data) {
      var msgs = this.userSuggestions.find(data, this.mentionsCache);
      return msgs && msgs.length ? (this.renderUsers(msgs), this.active = true, void this.$el.show()) : void this.clear();
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(self.render("suggestions")), this.active || this.$el.hide(), this;
    },
    /**
     * @param {?} data
     * @return {undefined}
     */
    renderUsers : function(data) {
      var e = array.reduce(data, function(value, datum) {
        var elems = this.userHtmlCache[datum.cid];
        return void 0 === elems && (this.userHtmlCache[datum.cid] = elems = $(this.renderSingleUser(datum))), value.appendChild(elems[0]), value;
      }, document.createDocumentFragment(), this);
      this.$(".header").siblings().remove().end().after(e).siblings().removeClass("active").first().addClass("active");
    },
    /**
     * @param {Object} e
     * @return {?}
     */
    renderSingleUser : function(e) {
      var record = e.toJSON();
      return record.cid = e.cid, self.render("suggestedUser", record);
    },
    /**
     * @return {undefined}
     */
    clear : function() {
      /** @type {boolean} */
      this.active = false;
      this.$el.hide();
    },
    /**
     * @param {Event} e
     * @return {undefined}
     */
    handleClick : function(e) {
      var el = $(e.currentTarget);
      this.select(el.attr("data-cid"));
    },
    /**
     * @param {Text} slide
     * @return {undefined}
     */
    select : function(slide) {
      if (this.active) {
        if (!slide) {
          slide = this.$el.find(".active").attr("data-cid");
        }
        this.trigger("select", slide);
        this.clear();
      }
    },
    /**
     * @param {string} direction
     * @return {undefined}
     */
    move : function(direction) {
      if (this.active) {
        var container = this.$el.find(".active");
        /** @type {string} */
        var siblingName = "up" === direction ? "prev" : "next";
        var el = container[siblingName]();
        if (el.length) {
          if (el.attr("data-cid")) {
            container.removeClass("active");
            el.addClass("active");
          }
        }
      }
    }
  }, {
    MAX_SUGGESTIONS : 5
  });
  return e;
}), define("lounge/views/posts/ContentEditableView", ["jquery", "underscore", "core/editable", "core/views/ContentEditableView", "common/collections", "common/Session", "lounge/views/posts/SuggestionView"], function($, _, div, Scene, Backbone, $templateCache, AppRouter) {
  /** @type {Object} */
  var BasicView = Scene;
  var p = BasicView.prototype;
  var test = BasicView.extend({
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      p.initialize.call(this, options);
      options = options || {};
      this.userSuggestions = options.userSuggestions;
      this.mentionsCache = new Backbone.UserCollection;
      this.restoreMentionedUsers();
      this.suggestions = new AppRouter({
        userSuggestions : this.userSuggestions,
        mentions : this.mentionsCache
      });
      this.listenTo(this.suggestions, "select", this.insertMention);
      this.reset();
      /** @type {null} */
      this.$input = null;
    },
    /**
     * @return {undefined}
     */
    restoreMentionedUsers : function() {
      var attrs = this.getDraft()[2];
      if (attrs) {
        if (!_.isEmpty(attrs)) {
          this.userSuggestions.addRemote(new Backbone.UserCollection(attrs));
        }
      }
    },
    /**
     * @return {undefined}
     */
    reset : function() {
      /** @type {null} */
      this.anchorNode = null;
      /** @type {null} */
      this.anchorOffset = null;
      /** @type {number} */
      this.anchorLength = 0;
      this.suggestions.clear();
    },
    /**
     * @return {?}
     */
    render : function() {
      return Scene.prototype.render.call(this), this.$el.append(this.suggestions.render().el), this;
    },
    /**
     * @return {?}
     */
    createInput : function() {
      var a = Scene.prototype.createInput.call(this);
      return this.content.getHtmlElements = _.bind(this.getHtmlElements, this), a;
    },
    /**
     * @param {?} text
     * @return {?}
     */
    getHtmlElements : function(text) {
      if (!text) {
        return text;
      }
      /** @type {Array} */
      var keys = [text];
      var which = this.getMentionNodes(text);
      return _.each(which, function(a, separator) {
        /** @type {number} */
        var i = 0;
        for (;i < keys.length;i++) {
          var index;
          var key = keys[i];
          /** @type {number} */
          var j = i;
          if (_.isString(key)) {
            for (;(index = key.indexOf(separator)) > -1;) {
              if (index > 0) {
                keys.splice(i++, 0, key.substring(0, index));
              }
              keys.splice(i++, 0, a.cloneNode(true));
              key = key.substring(index + separator.length);
            }
            if (key) {
              if (key !== keys[j]) {
                keys.splice(i++, 0, key);
              }
            }
            if (j !== i) {
              keys.splice(i, 1);
            }
          }
        }
      }), keys = _.map(keys, function(child) {
        return _.isString(child) ? document.createTextNode(child) : child;
      });
    },
    /**
     * @param {?} elem
     * @return {?}
     */
    getMentionNodes : function(elem) {
      var result = test.MENTIONS_RE_GROUPED;
      var benchmarks = {};
      /** @type {number} */
      result.lastIndex = 0;
      var queue = result.exec(elem);
      for (;queue;) {
        var username = queue[1];
        var e = this.userSuggestions.all().findWhere({
          username : username
        });
        if (e) {
          var ref = test.getMentionDom(e);
          var name = queue[0];
          benchmarks[name] = ref;
          this.updateCache(e, e.cid);
        }
        queue = result.exec(elem);
      }
      return benchmarks;
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    handleKeyDown : function(e) {
      switch(Scene.prototype.handleKeyDown.call(this, e), e.keyCode) {
        case 9:
          if (this.suggestions.active) {
            this.suggestions.select();
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case 10:
        ;
        case 13:
        ;
        case 38:
        ;
        case 40:
          if (this.suggestions.active) {
            e.preventDefault();
            e.stopPropagation();
          }
        ;
      }
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    handleKeyUp : function(e) {
      switch(Scene.prototype.handleKeyUp.call(this, e), e.preventDefault(), e.stopPropagation(), this.checkExistingMentions(), $templateCache.get().isLoggedIn() && this.userSuggestions.fetch(), e.keyCode) {
        case 10:
        ;
        case 13:
          this.suggestions.select();
          break;
        case 27:
          this.reset(e);
          break;
        case 38:
          this.suggestions.move("up");
          break;
        case 40:
          this.suggestions.move("down");
          break;
        default:
          this.throttledSuggest(e);
      }
    },
    /**
     * @return {undefined}
     */
    suggest : function() {
      var pdataCur = this.parseSearchTerms();
      this.suggestions.suggest(pdataCur);
    },
    throttledSuggest : _.throttle(function() {
      this.suggest();
    }, 250),
    /**
     * @param {string} _name
     * @return {undefined}
     */
    insertMention : function(_name) {
      var id = this.userSuggestions.get(_name);
      if (id) {
        this.selectSearchString(id);
        this.updateCache(id, _name);
        var node = test.getMentionDom(id);
        this.content.insertNode(node);
        var which = this.$el.find("span[data-cid]");
        _.each(which, function(Env) {
          if (Env.contentEditable !== false) {
            /** @type {boolean} */
            Env.contentEditable = false;
          }
        });
      }
    },
    /**
     * @param {?} data
     * @param {string} _name
     * @return {undefined}
     */
    updateCache : function(data, _name) {
      if (!this.mentionsCache.get(_name)) {
        this.mentionsCache.add(data);
      }
    },
    /**
     * @return {undefined}
     */
    selectSearchString : function() {
      this.content.selectNodeText(this.anchorNode, this.anchorOffset - 1, this.anchorOffset + this.anchorLength);
    },
    /**
     * @return {?}
     */
    get : function() {
      /**
       * @param {Object} parent
       * @return {?}
       */
      function node(parent) {
        return promote(parent, true) ? __hasProp.mentionToText(parent) : null;
      }
      var __hasProp = this;
      var promote = test.isMention;
      return this.content.text(node);
    },
    /**
     * @return {?}
     */
    parseSearchTerms : function() {
      var node = this.content.selectedTextNode();
      var view = node ? node.nodeValue : "";
      var s = div.normalizeSpace;
      if (view) {
        var end = this.content.selectedTextNodeOffset(node);
        var excludes = div.normalizeSpace(view.slice(0, end).split("").reverse().join(""));
        var start = excludes.indexOf("@");
        if (-1 === start) {
          return null;
        }
        this.anchorNode = node;
        /** @type {number} */
        this.anchorOffset = end - start;
        this.anchorLength = start;
        var classes = s(view.slice(this.anchorOffset - 1, end)).match(test.MENTIONS_RE);
        return classes ? classes[0].slice(1).split(" ") : 0 === start ? [""] : void 0;
      }
    },
    /**
     * @return {undefined}
     */
    checkExistingMentions : function() {
      var template = div.normalizeSpace;
      var ret = this.$el.find("span");
      var which = _.filter(ret, test.isMention);
      var users = this.mentionsCache;
      var seen = {};
      _.each(which, function(node) {
        var index = $(node).attr("data-cid");
        var val = _.reduce(this.content.getTextNodes(node), function(dataAndEvents, post) {
          return dataAndEvents + template(post.nodeValue);
        }, "");
        var record = users.get(index);
        if (record && record.get("name") !== val) {
          this.mentionsCache.remove(record);
          this.content.removeNode(node);
          this.content.insertHTML(" ");
          this.reset();
        } else {
          /** @type {Node} */
          seen[index] = node;
        }
      }, this);
      users.each(function(doc) {
        if (!seen[doc.cid]) {
          users.remove(doc);
        }
      });
    },
    /**
     * @param {HTMLElement} element
     * @return {?}
     */
    mentionToText : function(element) {
      var cookieName = $(element).attr("data-cid");
      var User = this.mentionsCache.get(cookieName);
      var user = element.innerText || element.textContent;
      return User && (User.get("username") && (user = User.get("username"))), ["@", user, ":", "reflect"].join("");
    },
    /**
     * @return {?}
     */
    toJSON : function() {
      var filtered = Scene.prototype.toJSON.call(this);
      return filtered.push(this.mentionsCache.models), filtered;
    }
  }, {
    MENTIONS_RE : new RegExp("@\\w+\\s?(?:\\w+\\s?){0,5}(?:\\w+)?$"),
    MENTIONS_RE_GROUPED : /@([\d\w]+)\s?(\:\s?(\w+))?/gi,
    /**
     * @param {Object} element
     * @param {Object} dataAndEvents
     * @return {?}
     */
    isMention : function(element, dataAndEvents) {
      var el;
      do {
        if (el = $(element), el.hasClass("mention") && el.attr("data-cid")) {
          return true;
        }
        element = element.parentElement;
      } while (dataAndEvents && element);
      return false;
    },
    /**
     * @param {Object} model
     * @return {?}
     */
    getMentionDom : function(model) {
      /** @type {DocumentFragment} */
      var docFrag = document.createDocumentFragment();
      /** @type {Element} */
      var body = document.createElement("span");
      /** @type {Element} */
      var el = document.createElement("span");
      /** @type {Text} */
      var childEl = document.createTextNode(model.get("name") || model.get("username"));
      return body.setAttribute("contenteditable", true), el.setAttribute("contenteditable", false), el.setAttribute("data-cid", model.cid), el.className = "mention", el.appendChild(childEl), body.appendChild(el), docFrag.appendChild(body), docFrag.appendChild(document.createTextNode(" ")), docFrag;
    }
  });
  return test;
}), define("lounge/views/posts/LoginFormView", ["underscore", "backbone", "common/models", "core/strings", "core/bus", "common/templates", "lounge/common"], function(_, Backbone, ServerAPI, http, c, res, dataAndEvents) {
  var getter = http.get;
  var i = Backbone.View.extend({
    events : {
      "click input[name=author-guest]" : "updateLoginForm",
      "focusin input[name=display_name]" : "expandGuestForm"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.thread = req.thread;
      this.session = req.session;
      this.alert = req.alert;
    },
    /**
     * @return {undefined}
     */
    expandGuestForm : function() {
      this.$("[data-role=guest-details]").addClass("expanded");
    },
    /**
     * @return {?}
     */
    shouldRegisterUser : function() {
      return this.session.isLoggedOut() && !this.$("input[name=author-guest]").is(":checked");
    },
    /**
     * @return {?}
     */
    render : function() {
      var self = dataAndEvents.getLounge();
      return this.$el.html(res.render("loginForm", {
        user : this.session.toJSON(),
        forumName : this.thread.forum.get("name"),
        audienceSyncRequired : this.session.needsAudienceSyncAuth(this.thread.forum),
        allowAnonPost : this.thread.forum.get("settings").allowAnonPost,
        apiKey : self.config && self.config.apiKey || "",
        sso : this.session.get("sso"),
        cid : this.cid
      })), this;
    },
    /**
     * @param {string} event
     * @return {?}
     */
    parseRegistrationErrorResponse : function(event) {
      if (event.responseJSON) {
        var nType = event.responseJSON.response;
        return/Unable to create user/i.test(nType) ? {
          email : [getter("That email address is already registered with a Reflect account. Log in or enter another email.")]
        } : /The e-mail address you specified is already in use./i.test(nType) ? {
          email : [getter("The e-mail address you specified is already in use.") + '<br><a class="link" href="#" data-action="auth:reflect">' + getter("Try logging in.") + "</a>"]
        } : {
          all : [nType]
        };
      }
    },
    /**
     * @param {Object} methods
     * @return {undefined}
     */
    handleRegistrationError : function(methods) {
      var evt = this;
      evt.clearRegistrationErrors();
      if (_.isString(methods)) {
        methods = {
          all : [methods]
        };
      }
      if (_.has(methods, "all")) {
        if (evt.alert) {
          evt.alert(methods.all[0], {
            type : "error"
          });
        }
        methods = _.omit(methods, "all");
      }
      _.each(methods, function(deepDataAndEvents, dataAndEvents) {
        var input = evt.$("input[name=" + dataAndEvents + "]");
        input.attr("aria-invalid", "true").after('<label for="' + input.attr("id") + '" class="input-label">' + deepDataAndEvents[0] + "</label>").parent(".input-wrapper").addClass("has-error");
      });
      evt.$("[aria-invalid]").first().focus();
    },
    /**
     * @return {undefined}
     */
    updateLoginForm : function() {
      var $el = this.$el;
      var restoreScript = $el.find("input[name=author-guest]").is(":checked");
      var jQuery = $el.find(".guest");
      var inputsVariables = $el.find("input[name=password]");
      inputsVariables.val("");
      jQuery.toggleClass("is-guest", restoreScript);
      this.clearRegistrationErrors();
    },
    /**
     * @return {undefined}
     */
    clearRegistrationErrors : function() {
      this.$(".input-wrapper.has-error").removeClass("has-error").find(".input-label").remove();
      this.$("[aria-invalid]").removeAttr("aria-invalid");
    },
    /**
     * @return {?}
     */
    getPassword : function() {
      var textEl = this.$el.find("input[name=password]");
      return textEl.length ? textEl.val() : null;
    },
    /**
     * @return {?}
     */
    getDisplayName : function() {
      return this.$el.find("input[name=display_name]").val();
    },
    /**
     * @return {?}
     */
    getEmail : function() {
      return this.$el.find("input[name=email]").val();
    },
    /**
     * @return {?}
     */
    registerUser : function() {
      var self = this;
      var model = new ServerAPI.User({
        display_name : self.$el.find("input[name=display_name]").val(),
        email : self.$el.find("input[name=email]").val(),
        password : self.getPassword()
      });
      if (!model.isValid()) {
        return void self.handleRegistrationError(model.validationError);
      }
      var $delegate = self.$("[data-role=submit-btn-container]");
      $delegate.addClass("is-submitting");
      model.register({
        /**
         * @param {string} arg
         * @return {undefined}
         */
        error : function(arg) {
          self.handleRegistrationError(self.parseRegistrationErrorResponse(arg));
        },
        /**
         * @return {undefined}
         */
        success : function() {
          self.session.setUser(model);
          c.frame.trigger("onboardAlert.show");
          dataAndEvents.getLounge().trigger("uiAction:finishRegistrationEmbed");
        }
      }).always(function() {
        $delegate.removeClass("is-submitting");
      });
    }
  });
  return i;
}), define("lounge/views/posts/PostReplyView", ["jquery", "underscore", "core/utils", "core/utils/releaseUtils", "core/bus", "core/switches", "core/views/PostReplyView", "common/models", "common/Session", "common/templates", "lounge/mixins/post-reply", "lounge/common", "lounge/views/posts/ContentEditableView", "lounge/views/posts/LoginFormView"], function($, element, context, test, exec_state, data_user, dataAndEvents, Models, $templateCache, contextElem, _, deepDataAndEvents, ignoreMethodDoesntExist, 
AppRouter) {
  var j = context.preventDefaultHandler;
  /** @type {Object} */
  var BaseView = dataAndEvents;
  var p = BaseView.prototype;
  var EA = BaseView.extend({
    /**
     * @param {string} cfg
     * @return {undefined}
     */
    initialize : function(cfg) {
      p.initialize.call(this, cfg);
      this.listenTo(this.session, "change:audienceSyncVerified", this.redraw);
      this.userSuggestions = cfg.userSuggestions;
      this.loginFormView = new AppRouter({
        thread : this.thread,
        session : this.session,
        alert : element.bind(this.alert, this)
      });
      var handler = deepDataAndEvents.getLounge();
      element.each(["uiCallback:postCreated", "domReflow", "uiAction:createPost"], function(scope) {
        this.listenTo(this, scope, element.bind(handler.trigger, handler, scope));
      }, this);
      this.template = contextElem.getTemplate("form");
      this.blacklistErrorMessageTemplate = contextElem.getTemplate("blacklistErrorMessage");
      this.emailVerifyAlertTemplate = contextElem.getTemplate("emailVerifyAlert");
    },
    /**
     * @return {?}
     */
    getTemplateData : function() {
      var audienceSyncRequired = p.getTemplateData.call(this);
      return audienceSyncRequired.audienceSyncRequired = this.session.needsAudienceSyncAuth(this.thread.forum), audienceSyncRequired;
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.loginFormView.$el.detach(), p.render.call(this), this.loginFormView.render(), this.loginFormView.$el.appendTo(this.$("[data-role=login-form]")), this.session.user.id ? this.$el.addClass("authenticated") : this.$el.removeClass("authenticated"), this;
    },
    /**
     * @return {?}
     */
    areUploadUrlsEnabled : function() {
      var userId = $templateCache.get().user;
      var udataCur = {
        isAdmin : test.isReflectAdmin(userId)
      };
      return data_user.isFeatureActive("embed_upload_urls", udataCur) || deepDataAndEvents.getLounge().isInHome() && data_user.isFeatureActive("home_upload_urls", udataCur);
    },
    /**
     * @return {?}
     */
    createTextarea : function() {
      var attrs = {
        placeholder : this.getPlaceholderText(),
        storageKey : this.post.storageKey()
      };
      return this.constructor.canUseContentEditable ? (attrs.userSuggestions = this.userSuggestions, new this.constructor.ContentEditableView(attrs)) : new this.constructor.TextareaView(attrs);
    },
    /**
     * @return {?}
     */
    getPostParams : function() {
      var deferred = $.Deferred();
      var translation = p.getPostParams.call(this);
      return data_user.isFeatureActive("before_comment_callback", {
        forum : this.thread.forum.id
      }) ? (exec_state.frame.sendHostMessage("posts.beforeCreate", {
        raw_message : translation.raw_message
      }), this.listenToOnce(exec_state.frame, "posts.beforeCreate.response", function(msgid) {
        if (msgid) {
          translation.raw_message = msgid;
        }
        deferred.resolve(translation);
      })) : deferred.resolve(translation), deferred.promise();
    },
    /**
     * @return {?}
     */
    getAuthorParams : function() {
      return this.session.isLoggedIn() ? {
        author_id : this.session.user.id
      } : {
        author_name : this.loginFormView.getDisplayName(),
        author_email : this.loginFormView.getEmail()
      };
    },
    /**
     * @return {undefined}
     */
    initiatePost : function() {
      var testDone = element.bind(this.createPost, this);
      this.getPostParams().done(testDone);
    },
    /**
     * @param {?} bytes
     * @param {string} graphics
     * @return {?}
     */
    shouldAbortCreatePost : function(bytes, graphics) {
      return this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum) ? (this.session.fetch().always(element.bind(function() {
        if (this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum)) {
          this._alertMustVerify(true);
        } else {
          this.createPost(graphics);
        }
      }, this)), true) : p.shouldAbortCreatePost.call(this, bytes, graphics);
    },
    /**
     * @param {string} mapper
     * @param {?} graphics
     * @return {undefined}
     */
    _onCreateError : function(mapper, graphics) {
      p._onCreateError.call(this, mapper, graphics);
      this.thread.incrementPostCount(-1);
    },
    /**
     * @param {?} mapper
     * @param {?} graphics
     * @return {undefined}
     */
    _onCreateSync : function(mapper, graphics) {
      p._onCreateSync.call(this, mapper, graphics);
      this.thread.posts.saveToCache(graphics);
    },
    /**
     * @param {?} bytes
     * @return {undefined}
     */
    addPostToThread : function(bytes) {
      this.thread.incrementPostCount(1);
      this.thread.posts.add(bytes);
    },
    /**
     * @return {?}
     */
    remove : function() {
      return this.loginFormView && (this.loginFormView.remove(), this.loginFormView = null), p.remove.call(this);
    },
    submitForm : j(function() {
      return this.dismissAlert(), this.loginFormView.shouldRegisterUser() ? void this.loginFormView.registerUser() : this.initiatePost();
    })
  }, {
    ContentEditableView : ignoreMethodDoesntExist,
    User : Models.User,
    Post : Models.Post
  });
  return _.asRealtimeTyping(EA.prototype), EA;
}), define("core/mediaConfig", ["underscore", "backbone"], function(rule, Y) {
  /**
   * @return {?}
   */
  function fix() {
    /** @type {number} */
    var x = document.body.offsetWidth;
    /** @type {Array} */
    var paths = normalized;
    /** @type {number} */
    var len = paths.length;
    return rule.find(paths, function(dataAndEvents, i) {
      return i + 1 === len || Math.abs(paths[i + 1] - x) > Math.abs(paths[i] - x);
    });
  }
  /** @type {Array} */
  var normalized = [320, 480, 600, 800];
  var e = new Y.Model({
    collapsed : false,
    defaultIframeHeight : 300,
    mediaPersistedWidths : normalized,
    loadedThumbnailWidth : fix()
  });
  return e.findClosestThumbnailSize = fix, e;
}), define("core/models/RichMediaViewModel", ["backbone"], function(Backbone) {
  return Backbone.Model.extend({
    defaults : {
      deferred : true,
      showButtons : true,
      activated : false,
      kind : "image",
      deferredHeight : 0,
      providerExpandMessage : "",
      providerCollapseMessage : "",
      providerIcon : "icon-proceed",
      respectSettings : true
    }
  });
}), define("core/templates/postMediaInlineLink", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    1 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(elem, null != elem ? elem.hasUserText : elem, {
        name : "if",
        hash : {},
        fn : this.program(2, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    2 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != t ? t.href : t, t)) + '" rel="nofollow">' + escapeExpression(lambda(null != t ? t.text : t, t)) + "</a>\n";
    },
    /**
     * @param {Object} scope
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    4 : function(scope, helpers, dataAndEvents, task) {
      var start;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var liveOffset = '<a href="' + escapeExpression(lambda(null != scope ? scope.href : scope, scope)) + '" class="post-media-link" data-action="expand-collapse-media" rel="nofollow">';
      return start = helpers["if"].call(scope, null != (start = null != scope ? scope.model : scope) ? start.providerIcon : start, {
        name : "if",
        hash : {},
        fn : this.program(5, task),
        inverse : this.noop,
        data : task
      }), null != start && (liveOffset += start), liveOffset += escapeExpression(lambda(null != scope ? scope.mediaLinkText : scope, scope)), start = helpers["if"].call(scope, null != scope ? scope.domain : scope, {
        name : "if",
        hash : {},
        fn : this.program(7, task),
        inverse : this.noop,
        data : task
      }), null != start && (liveOffset += start), liveOffset + "</a>\n";
    },
    /**
     * @param {?} $rootScope
     * @return {?}
     */
    5 : function($rootScope) {
      var scope;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<i class="' + escapeExpression(lambda(null != (scope = null != $rootScope ? $rootScope.model : $rootScope) ? scope.providerIcon : scope, $rootScope)) + '"></i>';
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    7 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="post-media-link-domain"> &mdash; ' + escapeExpression(lambda(null != t ? t.domain : t, t)) + "</span>";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} value
     * @param {Object} callback
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(value, callback, environment, options) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = callback["if"].call(value, null != (data = null != value ? value.model : value) ? data.deferred : data, {
        name : "if",
        hash : {},
        fn : this.program(1, options),
        inverse : this.program(4, options),
        data : options
      }), null != data && (headBuffer += data), headBuffer;
    },
    useData : true
  });
}), define("core/views/RichMediaLinkView", ["backbone", "handlebars", "core/utils", "core/templates/postMediaInlineLink"], function(Backbone, dataAndEvents, assert, template) {
  return Backbone.View.extend({
    tagName : "span",
    events : {
      "click [data-action=expand-collapse-media]" : "handleToggle"
    },
    /**
     * @param {Object} o
     * @return {undefined}
     */
    initialize : function(o) {
      this.media = o.media;
      var $link = o.$link;
      this.linkText = $link.text();
      this.linkHref = $link.attr("href");
      this.linkDomain = assert.getDomain(this.linkHref);
      this.linkHasUserText = this.isUserText($link);
      /** @type {boolean} */
      this.hasGenericMessage = false;
      if (this.linkHasUserText) {
        this.mediaLinkText = this.linkText;
      } else {
        if (this.media.get("title")) {
          this.mediaLinkText = assert.niceTruncate(this.media.get("title"), 60);
        } else {
          /** @type {boolean} */
          this.hasGenericMessage = true;
          this.mediaLinkText = this.model.get("providerExpandMessage");
        }
      }
      this.listenTo(this.model, "change:deferred", this.render);
      this.listenTo(this.model, "change:activated", this.onChangeActivated);
    },
    /**
     * @param {HTMLElement} link
     * @return {?}
     */
    isUserText : function(link) {
      if ("A" !== link[0].nodeName) {
        return false;
      }
      var url = (link.text() || "").toLowerCase();
      if (!url) {
        return false;
      }
      if (0 === url.indexOf("http") || 0 === url.indexOf("www")) {
        return false;
      }
      url = url.replace(/\.\.\.$/, "");
      var $$ = (link.attr("href") || "").toLowerCase();
      return-1 === $$.indexOf(url);
    },
    /**
     * @return {?}
     */
    render : function() {
      var activated = this.mediaLinkText;
      return this.hasGenericMessage && (this.model.get("activated") && (activated = this.model.get("providerCollapseMessage"))), this.$el.html(template({
        model : this.model.toJSON(),
        text : this.linkText,
        href : this.linkHref,
        mediaLinkText : activated,
        domain : this.linkDomain,
        hasUserText : this.linkHasUserText
      })), this;
    },
    /**
     * @return {undefined}
     */
    onChangeActivated : function() {
      if (this.hasGenericMessage) {
        this.render();
      }
    },
    /**
     * @param {?} e
     * @return {undefined}
     */
    handleToggle : function(e) {
      if (!this.model.get("deferred")) {
        this.model.set("activated", !this.model.get("activated"));
        if (e) {
          if (e.preventDefault) {
            e.preventDefault();
          }
        }
      }
    }
  });
}), define("core/templates/postMedia", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @param {string} t
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    1 : function(t, helpers, dataAndEvents, task) {
      var value;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var sanitized = "";
      return value = helpers["if"].call(t, null != (value = null != t ? t.media : t) ? value.providerName : value, {
        name : "if",
        hash : {},
        fn : this.program(2, task),
        inverse : this.noop,
        data : task
      }), null != value && (sanitized += value), sanitized + escapeExpression(lambda(null != (value = null != t ? t.media : t) ? value.title : value, t));
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    2 : function(t) {
      var prop;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(lambda(null != (prop = null != t ? t.media : t) ? prop.providerName : prop, t)) + " &ndash; ";
    },
    /**
     * @param {?} $rootScope
     * @return {?}
     */
    4 : function($rootScope) {
      var scope;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<i class="' + escapeExpression(lambda(null != (scope = null != $rootScope ? $rootScope.model : $rootScope) ? scope.providerIcon : scope, $rootScope)) + ' publisher-background-color"></i>';
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} value
     * @param {Object} callback
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(value, callback, environment, options) {
      var data;
      var mixin = this.lambda;
      var fn = this.escapeExpression;
      /** @type {string} */
      var out = '\n<a class="media-button media-button-expand publisher-color publisher-border-color" href="' + fn(mixin(null != (data = null != value ? value.media : value) ? data.url : data, value)) + '" rel="nofollow" target="_blank" data-action="expand"\ntitle="';
      return data = callback["if"].call(value, null != (data = null != value ? value.media : value) ? data.title : data, {
        name : "if",
        hash : {},
        fn : this.program(1, options),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out += '">\n', data = callback["if"].call(value, null != (data = null != value ? value.model : value) ? data.providerIcon : data, {
        name : "if",
        hash : {},
        fn : this.program(4, options),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out + "\n" + fn(mixin(null != (data = null != value ? value.model : value) ? data.providerExpandMessage : data, value)) + '\n</a>\n<a class="media-button media-button-contract publisher-color publisher-border-color" href="#" target="_blank" data-action="contract">\n<i class="icon-cancel publisher-background-color"></i> ' + fn(mixin(null != (data = null != value ? value.model : value) ? data.providerCollapseMessage : data, value)) + '\n</a>\n<div class="media-content-loader" data-role="content-loader"></div>\n<div data-role="content-placeholder" class="media-content-placeholder"></div>\n';
    },
    useData : true
  });
}), define("core/templates/postMediaPlaceholder", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} next
     * @return {?}
     */
    main : function(next) {
      var cur;
      var req = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="#" class="media-force-load" data-action="force-load"><i class="' + escapeExpression(req(null != (cur = null != next ? next.model : next) ? cur.providerIcon : cur, next)) + '"></i></a>\n';
    },
    useData : true
  });
}), define("core/views/RichMediaView", ["underscore", "jquery", "backbone", "core/utils", "core/mediaConfig", "core/views/RichMediaLinkView", "core/templates/postMedia", "core/templates/postMediaPlaceholder"], function(deepDataAndEvents, proceed, Backbone, dataAndEvents, column, AppView, templateUrl, cb) {
  var throttledUpdate = dataAndEvents.preventDefaultHandler;
  /**
   * @param {Object} el
   * @param {Node} model
   * @param {string} value
   * @param {string} k
   * @return {undefined}
   */
  var callback = function(el, model, value, k) {
    el[model.get(value) ? "addClass" : "removeClass"](k);
  };
  return Backbone.View.extend({
    className : "media-container",
    events : {
      "click [data-action=expand]" : "handleExpand",
      "click [data-action=contract]" : "handleContract",
      "click [data-action=force-load]" : "handleForceLoad"
    },
    template : templateUrl,
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      /** @type {Object} */
      this.options = options;
      this.media = options.media;
      this.template = options.template || this.template;
      /** @type {null} */
      this.$linkEl = null;
      this.setupMode();
      this.listenTo(this.model, "change:activated", this.applyState);
      this.listenTo(this.model, "change:deferredHeight", this.onChangeDeferredHeight);
      this.listenTo(this.model, "change:showButtons", this.updateElementClass);
      this.listenTo(this.model, "change:deferred", this.render);
      this.listenTo(column, "change:collapsed", this.setupMode);
    },
    /**
     * @return {?}
     */
    getMediaDimensions : function() {
      return{
        width : null,
        height : null
      };
    },
    /**
     * @return {?}
     */
    getAvailableWidth : function() {
      return this.$el.parent().width() || column.get("loadedThumbnailWidth");
    },
    /**
     * @return {undefined}
     */
    updateDeferredHeight : function() {
      this.model.set("deferredHeight", this.calculateDeferredHeight());
    },
    /**
     * @return {?}
     */
    calculateDeferredHeight : function() {
      var ev = this.getMediaDimensions();
      var d = ev.width;
      var t = ev.height;
      if (!d || !t) {
        return t;
      }
      var c = this.getAvailableWidth();
      /** @type {number} */
      var id = c * t / d;
      return id;
    },
    /**
     * @param {Object} c
     * @return {undefined}
     */
    convertToButton : function(c) {
      this.model.set("showButtons", false);
      if (this.linkSubview) {
        this.linkSubview.remove();
      }
      this.linkSubview = new AppView({
        model : this.model,
        media : this.media,
        $link : c
      });
      c.replaceWith(this.linkSubview.$el);
      this.linkSubview.render();
    },
    /**
     * @param {string} recurring
     * @return {undefined}
     */
    applyContentNodeHeight : function(recurring) {
      this.contentNode.height(recurring || "auto");
    },
    /**
     * @return {?}
     */
    shouldAutoplay : function() {
      return!this.model.get("deferred");
    },
    /**
     * @return {?}
     */
    generateContentHtml : function() {
      return this.media.get("html");
    },
    /**
     * @param {?} element
     * @return {?}
     */
    createContentNode : function(element) {
      return proceed(element);
    },
    /**
     * @param {?} str
     * @return {undefined}
     */
    insertContentNode : function(str) {
      this.contentNode.html(str);
    },
    /**
     * @return {undefined}
     */
    prepareElementEvents : function() {
    },
    /**
     * @return {undefined}
     */
    displayContent : function() {
      this.updateDeferredHeight();
      var activeClassName = this.generateContentHtml();
      var popup = this.createContentNode(activeClassName);
      this.prepareElementEvents(popup);
      this.insertContentNode(popup);
      this.applyContentNodeHeight(null);
    },
    /**
     * @return {undefined}
     */
    configureDeferred : function() {
      this.enterViewport();
    },
    /**
     * @return {undefined}
     */
    configureContentFromActivated : function() {
      if (this.model.get("activated")) {
        this.displayContent();
      } else {
        this.displayPlaceholder();
      }
    },
    /**
     * @return {undefined}
     */
    displayPlaceholder : function() {
      this.contentNode.html(cb({
        model : this.model.toJSON()
      }));
    },
    /**
     * @return {undefined}
     */
    updateElementClass : function() {
      var e = this.$el;
      var model = this.model;
      callback(e, model, "deferred", "media-mode-deferred");
      callback(e, model, "activated", "media-activated");
      callback(e, model, "showButtons", "media-show-buttons");
    },
    /**
     * @return {undefined}
     */
    applyState : function() {
      this.configureDeferred();
      this.configureContentFromActivated();
      this.updateElementClass();
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(this.template({
        model : this.model.toJSON(),
        media : this.media.toJSON()
      })), this.contentNode = this.$el.find("[data-role=content-placeholder]"), this.applyState(), this;
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      if (this.linkSubview) {
        this.linkSubview.remove();
      }
      Backbone.View.prototype.remove.apply(this, arguments);
    },
    /**
     * @return {undefined}
     */
    enterViewport : function() {
      if (this.model.get("deferred")) {
        this.activate();
      }
    },
    /**
     * @return {undefined}
     */
    activate : function() {
      this.model.set("activated", true);
    },
    /**
     * @return {undefined}
     */
    setupMode : function() {
      if (this.model.get("respectSettings")) {
        this.model.set("activated", false);
        var collapsed = column.get("collapsed");
        if (collapsed) {
          this.model.set("deferred", false);
        } else {
          this.model.set("deferred", true);
        }
      }
    },
    /**
     * @return {undefined}
     */
    onChangeDeferredHeight : function() {
      if (this.model.get("deferred")) {
        if (!this.model.get("activated")) {
          this.applyContentNodeHeight(this.model.get("deferredHeight"));
        }
      }
    },
    handleExpand : throttledUpdate(function() {
      this.model.set("activated", true);
    }),
    handleContract : throttledUpdate(function() {
      this.model.set("activated", false);
    }),
    handleForceLoad : throttledUpdate(function() {
      if (this.model.get("deferred")) {
        this.model.set("activated", true);
      }
    })
  });
}), define("core/templates/postMediaImage", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @param {?} $rootScope
     * @return {?}
     */
    1 : function($rootScope) {
      var scope;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return' height="' + escapeExpression(lambda(null != (scope = null != $rootScope ? $rootScope.model : $rootScope) ? scope.deferredHeight : scope, $rootScope)) + '" ';
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {Object} params
     * @param {Object} options
     * @param {?} environment
     * @param {Object} opt_data
     * @return {?}
     */
    main : function(params, options, environment, opt_data) {
      var data;
      var transition = this.lambda;
      var equals = this.escapeExpression;
      /** @type {string} */
      var out = '<a href="' + equals(transition(null != params ? params.imageUrl : params, params)) + '" target="_blank" rel="nofollow">\n<img src="' + equals(transition(null != params ? params.thumbnailUrl : params, params)) + '" alt="' + equals(options.gettext.call(params, "Thumbnail", {
        name : "gettext",
        hash : {},
        data : opt_data
      })) + '" ';
      return data = options["if"].call(params, null != (data = null != params ? params.model : params) ? data.deferredHeight : data, {
        name : "if",
        hash : {},
        fn : this.program(1, opt_data),
        inverse : this.noop,
        data : opt_data
      }), null != data && (out += data), out + ">\n</a>\n";
    },
    useData : true
  });
}), define("core/views/ImageRichMediaView", ["core/views/RichMediaView", "core/utils", "core/config", "core/mediaConfig", "core/templates/postMediaImage"], function(Router, resourceConstructor, d, $templateCache, cb) {
  /** @type {RegExp} */
  var reWhitespace = new RegExp("(^|\\.)" + resourceConstructor.getDomain(d.urls.media).split(".").slice(-2).join("\\.") + "$");
  return Router.extend({
    /**
     * @return {?}
     */
    getMediaDimensions : function() {
      return{
        width : this.media.get("thumbnailWidth"),
        height : this.media.get("thumbnailHeight")
      };
    },
    /**
     * @return {?}
     */
    getImageUrl : function() {
      return this.media.get("resolvedUrl") || (this.media.get("url") || this.media.get("thumbnailUrl"));
    },
    /**
     * @return {?}
     */
    getImageThumbnailUrl : function() {
      var httpConfig = this.media.get("thumbnailUrl");
      return this.constructor.isOnReflectCDN(httpConfig) && (httpConfig = resourceConstructor.serialize(httpConfig, {
        w : $templateCache.get("loadedThumbnailWidth"),
        h : this.model.get("deferredHeight")
      })), httpConfig;
    },
    /**
     * @return {?}
     */
    generateContentHtml : function() {
      return cb({
        model : this.model.toJSON(),
        media : this.media.toJSON(),
        thumbnailUrl : this.getImageThumbnailUrl(),
        imageUrl : this.getImageUrl()
      });
    },
    /**
     * @param {Object} element
     * @return {undefined}
     */
    prepareElementEvents : function(element) {
      var obj = this;
      var image = element.find("img");
      image.on("load.richMediaView error.richMediaView", function(evt) {
        obj.trigger(evt.type);
        image.off(".richMediaView");
      });
    },
    /**
     * @return {?}
     */
    calculateDeferredHeight : function() {
      /** @type {number} */
      var olen = Math.floor(Router.prototype.calculateDeferredHeight.apply(this, arguments));
      var oldHeight = this.getMediaDimensions().height;
      return Math.min(oldHeight, olen) || null;
    }
  }, {
    /**
     * @param {?} httpConfig
     * @return {?}
     */
    isOnReflectCDN : function(httpConfig) {
      var left = resourceConstructor.getDomain(httpConfig);
      return reWhitespace.test(left);
    }
  });
}), define("core/views/IframeRichMediaView", ["underscore", "core/mediaConfig", "core/views/RichMediaView"], function(next, $templateCache, Router) {
  return Router.extend({
    /**
     * @return {?}
     */
    getMediaDimensions : function() {
      return{
        width : this.media.get("htmlWidth"),
        height : this.media.get("htmlHeight")
      };
    },
    /**
     * @param {Object} popup
     * @return {?}
     */
    _findIframe : function(popup) {
      return popup.is("iframe") ? popup : popup.find("iframe");
    },
    /**
     * @return {undefined}
     */
    configureContentFromActivated : function() {
      Router.prototype.configureContentFromActivated.apply(this, arguments);
      if (!this.model.get("activated")) {
        this.$el.removeClass("media-loading");
      }
    },
    /**
     * @return {?}
     */
    createContentNode : function() {
      var ret = Router.prototype.createContentNode.apply(this, arguments);
      return ret.attr({
        width : "100%",
        height : this.model.get("deferredHeight")
      }), ret;
    },
    /**
     * @param {?} e
     * @return {undefined}
     */
    insertContentNode : function(e) {
      this.loaderNode = this.$el.find("[data-role=content-loader]");
      this.loaderHeight = this.model.get("deferredHeight") || $templateCache.get("defaultIframeHeight");
      this.loaderNode.height(this.loaderHeight);
      this.$el.addClass("media-loading");
      Router.prototype.insertContentNode.call(this, e);
    },
    /**
     * @param {Object} popup
     * @return {undefined}
     */
    prepareElementEvents : function(popup) {
      var doc = this._findIframe(popup);
      doc.one("load", next.bind(this.finishLoad, this, doc));
    },
    /**
     * @param {?} content
     * @return {undefined}
     */
    finishLoad : function(content) {
      this.$el.removeClass("media-loading");
      content.height(this.loaderHeight);
      this.trigger("load");
    }
  });
}), define("core/views/FacebookPhotoRichMediaView", ["core/views/ImageRichMediaView"], function(Router) {
  return Router.extend({
    /**
     * @return {?}
     */
    getImageThumbnailUrl : function() {
      return this.media.get("metadata").imageUrl || Router.prototype.getImageThumbnailUrl.call(this);
    }
  });
}), define("core/views/AutoplayRichMediaView", ["underscore", "jquery", "core/utils", "core/views/IframeRichMediaView"], function(_, $, b, Router) {
  return Router.extend({
    /**
     * @return {?}
     */
    createContentNode : function() {
      var el = Router.prototype.createContentNode.apply(this, arguments);
      var src = el.attr("src");
      return this.shouldAutoplay() && (src && (!this.model.get("playerjs") && (src = b.serialize(src, {
        auto_play : true,
        autoplay : 1
      }), el.attr("src", src)))), el;
    },
    /**
     * @param {Object} popup
     * @return {?}
     */
    insertContentNode : function(popup) {
      if (this.model.get("playerjs")) {
        var element = this._findIframe(popup);
        var src = element.attr("src");
        if ("//" === src.substr(0, 2)) {
          /** @type {string} */
          src = window.location.protocol + src;
        }
        var child = src.split("/");
        child = child[0] + "//" + child[2];
        this.playerjs = {
          ready : false,
          queue : [],
          origin : child,
          $iframe : element
        };
        if (this.model.get("mute")) {
          this.send("mute");
        }
        if (this.shouldAutoplay()) {
          this.send("play");
        }
        var throttledUpdate = _.once(_.bind(function() {
          /** @type {boolean} */
          this.playerjs.ready = true;
          var which = this.playerjs.queue;
          /** @type {Array} */
          this.playerjs.queue = [];
          _.each(which, this.send, this);
        }, this));
        $(window).on("message", function(e) {
          if (e = e.originalEvent, e.origin === child) {
            var _this;
            try {
              /** @type {*} */
              _this = JSON.parse(e.data);
            } catch (c) {
              return;
            }
            if ("ready" === _this.event) {
              if (_this.value) {
                if (_this.value.src === src) {
                  throttledUpdate();
                }
              }
            }
          }
        });
      }
      return Router.prototype.insertContentNode.apply(this, arguments);
    },
    /**
     * @param {string} key
     * @return {?}
     */
    send : function(key) {
      if (this.playerjs) {
        if (!this.playerjs.ready) {
          return void this.playerjs.queue.push(key);
        }
        var data = {
          context : "player.js",
          version : "0.0.10",
          method : key
        };
        this.playerjs.$iframe[0].contentWindow.postMessage(JSON.stringify(data), this.playerjs.origin);
      }
    }
  });
}), define("core/views/DynamicHeightRichMediaView", ["underscore", "core/views/RichMediaView"], function(timer, Router) {
  return Router.extend({
    /**
     * @return {undefined}
     */
    insertContentNode : function() {
      Router.prototype.insertContentNode.apply(this, arguments);
      this.finishLoad();
    },
    /**
     * @return {undefined}
     */
    finishLoad : function() {
      var dialog = this;
      /** @type {number} */
      var b = 0;
      /** @type {number} */
      var delay = 150;
      /** @type {number} */
      var a = 20;
      /**
       * @return {undefined}
       */
      var fn = function() {
        ++b;
        if (a > b) {
          timer.delay(fn, delay);
        } else {
          dialog.trigger("load");
        }
      };
      fn();
    }
  });
}), define("core/templates/postMediaTwitterContent", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {Object} options
     * @return {?}
     */
    main : function(options) {
      var compute = this.lambda;
      var fn = this.escapeExpression;
      return'<meta name="twitter:widgets:csp" content="on">\n<blockquote class="twitter-tweet" data-theme="' + fn(compute(null != options ? options.theme : options, options)) + '" data-link-color="' + fn(compute(null != options ? options.linkColor : options, options)) + '" lang="' + fn(compute(null != options ? options.language : options, options)) + '">\n<a href="' + fn(compute(null != options ? options.url : options, options)) + '"></a>\n</blockquote>\n<script src="//platform.twitter.com/widgets.js">\x3c/script>\n';
    },
    useData : true
  });
}), define("core/views/TwitterRichMediaView", ["underscore", "core/views/DynamicHeightRichMediaView", "core/templates/postMediaTwitterContent", "core/utils"], function(d, Router, func, digits) {
  var v = Router.extend({
    /**
     * @return {?}
     */
    generateContentHtml : function() {
      /** @type {string} */
      var lang = document.documentElement.lang;
      /** @type {string} */
      lang = lang && lang.substring(0, 2);
      var file = this.media.get("url");
      return-1 !== this.media.get("resolvedUrl").indexOf("/status") && (file = this.media.get("resolvedUrl")), func({
        url : file,
        theme : d.result(v, "theme"),
        linkColor : digits.escapeColor(d.result(v, "linkColor")),
        language : lang
      });
    }
  }, {
    theme : "light",
    linkColor : "rgb(46, 159, 255)"
  });
  return v;
}), define("core/views/SoundCloudRichMediaView", ["core/views/AutoplayRichMediaView"], function(Router) {
  return Router.extend({
    /**
     * @return {?}
     */
    getMediaDimensions : function() {
      return{
        width : null,
        height : this.media.get("htmlHeight")
      };
    }
  });
}), define("core/views/VineRichMediaView", ["core/views/AutoplayRichMediaView", "core/utils"], function(Router, b) {
  return Router.extend({
    /**
     * @return {?}
     */
    createContentNode : function() {
      var el = Router.prototype.createContentNode.apply(this, arguments);
      var src = el.attr("src");
      return this.shouldAutoplay() && (src && (src = b.serialize(src, {
        audio : 1
      }), el.attr("src", src))), el;
    }
  });
}), define("core/media", ["underscore", "core/strings", "core/mediaConfig", "core/models/Media", "core/models/RichMediaViewModel", "core/views/RichMediaView", "core/views/ImageRichMediaView", "core/views/IframeRichMediaView", "core/views/FacebookPhotoRichMediaView", "core/views/AutoplayRichMediaView", "core/views/TwitterRichMediaView", "core/views/SoundCloudRichMediaView", "core/views/VineRichMediaView"], function(exports, http, dataAndEvents, el, Model, deepDataAndEvents, AppView, text_, optionLabel, 
source, textAlt, status, anchorLocation) {
  var getter = http.get;
  var cache = {
    PLAY_HIDE : {
      kind : "html",
      providerExpandMessage : getter("Play"),
      providerCollapseMessage : getter("Hide")
    },
    VIEW_HIDE : {
      kind : "html",
      providerExpandMessage : getter("View"),
      providerCollapseMessage : getter("Hide")
    },
    VIEW_IMAGE : {
      kind : "image",
      providerIcon : "icon-images",
      providerExpandMessage : getter("View"),
      providerCollapseMessage : getter("Hide")
    }
  };
  /**
   * @param {Node} canvas
   * @return {?}
   */
  var render = function(canvas) {
    /**
     * @param {string} k
     * @param {string} value
     * @return {?}
     */
    var removeAttr = function(k, value) {
      return exports.defaults({
        providerIcon : value
      }, cache[k]);
    };
    /** @type {null} */
    var options = null;
    /** @type {null} */
    var text = null;
    var s = el.MEDIA_TYPES;
    switch(canvas.get("mediaType")) {
      case s.IMAGE:
      ;
      case s.IMAGE_UPLOAD:
        options = cache.VIEW_IMAGE;
        break;
      case s.FACEBOOK_PHOTO:
        /** @type {null} */
        text = optionLabel;
        options = cache.VIEW_IMAGE;
        break;
      case s.VIMEO_VIDEO:
      ;
      case s.YOUTUBE_VIDEO:
        /** @type {null} */
        text = source;
        options = removeAttr("PLAY_HIDE", "icon-video");
        break;
      case s.TWITTER_STATUS:
        /** @type {Function} */
        text = textAlt;
        options = removeAttr("VIEW_HIDE", "icon-twitter");
        break;
      case s.VINE_VIDEO:
        /** @type {(Date|string)} */
        text = anchorLocation;
        options = removeAttr("PLAY_HIDE", "icon-video");
        break;
      case s.FACEBOOK_VIDEO:
        options = removeAttr("VIEW_HIDE", "icon-video");
        break;
      case s.SOUNDCLOUD_SOUND:
        /** @type {Function} */
        text = status;
        options = removeAttr("PLAY_HIDE", "icon-music");
        break;
      case s.GOOGLE_MAP:
        options = removeAttr("VIEW_HIDE", "icon-map");
        break;
      default:
        return null;
    }
    if (null === text) {
      switch(options.kind) {
        case "webpage":
          return null;
        case "html":
          /** @type {Function} */
          text = text_;
          break;
        case "image":
          /** @type {Function} */
          text = AppView;
      }
    }
    var model = new Model(options);
    return{
      Cls : text,
      mediaViewModel : model
    };
  };
  /**
   * @param {Node} type
   * @return {?}
   */
  var execute = function(type) {
    var model = render(type);
    return model ? new model.Cls({
      model : model.mediaViewModel,
      media : type
    }) : null;
  };
  /**
   * @param {?} q
   * @return {?}
   */
  var load = function(q) {
    return new AppView({
      model : new Model(cache.VIEW_IMAGE),
      media : q
    });
  };
  return{
    /** @type {function (Node): ?} */
    instantiateRichMediaView : execute,
    /** @type {function (?): ?} */
    instantiateRichMediaThumbnail : load,
    /** @type {function (Node): ?} */
    getRichMediaViewConfig : render
  };
}), define("core/mixins/withRichMedia", ["underscore", "jquery", "core/collections/MediaCollection", "core/media"], function(data_priv, $, type, nv) {
  /**
   * @param {string} o
   * @return {?}
   */
  function addEvents(o) {
    var data = {};
    return o.length ? (o.find("a").each(function(dataAndEvents, element) {
      var index = element.href;
      if (!data[index]) {
        data[index] = $(element);
      }
    }), data) : data;
  }
  /**
   * @return {undefined}
   */
  function cycle() {
    data_priv.extend(this, pdataOld);
  }
  var pdataOld = {
    /**
     * @param {Element} data
     * @param {Object} result
     * @param {Object} plugin
     * @return {?}
     */
    renderRichMedia : function(data, result, plugin) {
      return plugin = plugin || {}, data = data instanceof type ? data : new type(data), data.chain().map(function(v) {
        return nv.instantiateRichMediaView(v);
      }).without(null).map(function(options) {
        var id = options.media.get("url");
        if (plugin.normalize) {
          id = plugin.normalize.call(this, id);
        }
        var cache = addEvents(this.$("[data-role=message]"));
        var c = cache[id];
        return plugin.beforeRender && plugin.beforeRender.call(this, options), options.render(), c ? plugin.convertLinkToButton ? (c.after(options.$el), options.convertToButton(c)) : c.replaceWith(options.$el) : (result = result || this.$("[data-role=post-media-list]"), result.append($("<li>").append(options.$el))), options;
      }, this).value();
    }
  };
  return cycle;
}), define("core/mixins/asScrollableContainer", ["underscore"], function(_) {
  var self = {
    /**
     * @param {?} value
     * @return {?}
     */
    getScrollEvents : function(value) {
      /** @type {Array} */
      var state = [["mousewheel", "handleScrollEvent"], ["wheel", "handleScrollEvent"]];
      return value && (state = _.map(state, function(result) {
        return result[0] = result[0] + " " + value, result;
      })), _.object(state);
    },
    /**
     * @return {?}
     */
    getScrollMeasure : function() {
      return this.scrollMeasure && this.scrollMeasure.parent().length || (this.scrollMeasure = this.$el, this.scrollMeasureSelector && (this.scrollMeasure = this.$el.find(this.scrollMeasureSelector))), this.scrollMeasure;
    },
    /**
     * @param {KeyboardEvent} event
     * @return {undefined}
     */
    handleScrollEvent : function(event) {
      var orgEvent = event.originalEvent;
      var i = orgEvent.wheelDeltaY || -orgEvent.deltaY;
      var $el = this.$el;
      var b = $el.height();
      var ch = this.getScrollMeasure();
      var a = ch.height();
      var currentScroll = ch.parent()[0].scrollTop;
      /** @type {boolean} */
      var fn = currentScroll >= a - b;
      /** @type {boolean} */
      var easing = 0 === currentScroll;
      if (fn && 0 > i || easing && i > 0) {
        event.preventDefault();
      }
    }
  };
  /**
   * @param {?} data
   * @return {undefined}
   */
  var build = function(data) {
    this.scrollMeasureSelector = data.scrollMeasureSelector;
    this.events = _.extend(self.getScrollEvents(data.childSelector), this.events);
    _.extend(this, _.pick(self, "getScrollMeasure", "handleScrollEvent"));
  };
  return build;
}), define("core/views/common/HoverCard", ["jquery", "underscore", "backbone", "core/bus", "core/utils"], function($, _, Backbone, b, dataAndEvents) {
  var self = Backbone.View.extend({
    events : {
      mouseenter : "enter",
      mouseleave : "leave"
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      this._id = _.uniqueId();
      /** @type {boolean} */
      this._rendered = false;
      /** @type {string} */
      this._hoverState = "out";
      /** @type {boolean} */
      this._visible = false;
      /** @type {null} */
      this._enterTimeout = null;
      /** @type {null} */
      this._leaveTimeout = null;
      self.open = {};
      this.events = this.events || {};
      /** @type {string} */
      this.events["click [data-action=profile]"] = "handleShowProfile";
      this.listenTo(this, "authenticating", this.keepOpen);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.hide(), $("body").append(this.el), this;
    },
    /**
     * @param {Object} elem
     * @return {undefined}
     */
    target : function(elem) {
      elem.on("mouseenter", _.bind(this.enter, this, elem));
      elem.on("mouseleave", _.bind(this.leave, this));
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    enter : function(e) {
      var data = this;
      if (e.originalEvent) {
        /** @type {null} */
        e = null;
      }
      if (e) {
        /** @type {Object} */
        data.$target = e;
      }
      if (data._leaveTimeout) {
        window.clearTimeout(data._leaveTimeout);
      }
      if ("in" !== data._hoverState) {
        /** @type {string} */
        data._hoverState = "in";
        data._enterTimeout = _.delay(function() {
          if ("in" === data._hoverState) {
            data.show();
          }
          /** @type {null} */
          data._enterTimeout = null;
        }, self.DELAY_ENTER);
        self.open[this.uid] = this;
      }
    },
    /**
     * @return {undefined}
     */
    leave : function() {
      var that = this;
      if (that._enterTimeout) {
        window.clearTimeout(that._enterTimeout);
      }
      if ("out" !== that._hoverState) {
        /** @type {string} */
        that._hoverState = "out";
        that._leaveTimeout = _.delay(function() {
          if ("out" === that._hoverState) {
            that.hide();
          }
          /** @type {null} */
          that._leaveTimeout = null;
        }, self.DELAY_LEAVE);
        if (self.open[this.uid]) {
          delete self.open[this.uid];
        }
      }
    },
    /**
     * @return {undefined}
     */
    show : function() {
      var self = this;
      if (!self._rendered) {
        /** @type {boolean} */
        self._rendered = true;
        self.render();
      }
      self.moveTo(self.$target);
      self.$el.show();
      /** @type {boolean} */
      self._visible = true;
      self.trigger("show");
    },
    /**
     * @param {?} bounds
     * @return {undefined}
     */
    moveTo : function(bounds) {
      if (bounds) {
        var offset = self.POSITION_OFFSET;
        var position = bounds.offset();
        var buildMenu = this.$el;
        var offsetY = buildMenu.height();
        var that = this.getContainerPosition();
        position.top -= offset;
        var yDelta = position.top + offsetY + that.containerOffset.top;
        var xDelta = that.pageOffset + that.containerHeight;
        if (xDelta >= yDelta) {
          buildMenu.css("top", position.top);
        } else {
          buildMenu.css("top", position.top - offsetY + 2 * offset);
        }
        buildMenu.css("left", position.left + offset);
      }
    },
    /**
     * @return {?}
     */
    getContainerPosition : function() {
      return{
        pageOffset : $(window).scrollTop(),
        containerOffset : {
          top : 0,
          height : $(window).height()
        },
        containerHeight : $(window).height()
      };
    },
    /**
     * @return {undefined}
     */
    hide : function() {
      if (!this._keepOpen) {
        if (this._enterTimeout) {
          window.clearTimeout(this._enterTimeout);
        }
        this.$el.hide();
        /** @type {boolean} */
        this._visible = false;
      }
    },
    /**
     * @return {undefined}
     */
    keepOpen : function() {
      /** @type {boolean} */
      this._keepOpen = true;
      this.setupKeepOpenCanceler();
    },
    /**
     * @return {undefined}
     */
    setupKeepOpenCanceler : function() {
      var self = this;
      /**
       * @return {undefined}
       */
      var callback = function() {
        if ("out" === self._hoverState) {
          self.stopListening(b, "window.click", callback);
          $("body").off("click", callback);
          /** @type {boolean} */
          self._keepOpen = false;
          self.hide();
        }
      };
      _.delay(function() {
        self.listenTo(b, "window.click", callback);
        $("body").on("click", callback);
      }, 100);
    },
    /**
     * @return {?}
     */
    isVisible : function() {
      return this._visible;
    },
    handleShowProfile : dataAndEvents.preventDefaultHandler(function() {
      this.hide();
    })
  }, {
    open : {},
    instances : {},
    DELAY_ENTER : 350,
    DELAY_LEAVE : 175,
    POSITION_OFFSET : 20,
    /**
     * @return {undefined}
     */
    exitAll : function() {
      _.invoke(self.open, "leave");
    },
    /**
     * @param {?} opt_attributes
     * @param {?} attributes
     * @param {string} id
     * @param {?} model
     * @return {?}
     */
    create : function(opt_attributes, attributes, id, model) {
      var wrapper = self.instances[id];
      if (!wrapper) {
        self.instances[id] = wrapper = {};
      }
      var value = wrapper[opt_attributes];
      return value || (value = new model(attributes), wrapper[opt_attributes] = value), attributes.targetElement && value.target(attributes.targetElement), value;
    }
  });
  return function() {
    $(document).on("mouseout", _.debounce(function(e) {
      var node = e.relatedTarget || e.toElement;
      if (!(node && "HTML" !== node.nodeName)) {
        self.exitAll();
      }
    }, 10));
  }(), self;
}), define("core/utils/views", ["underscore"], function(_) {
  /**
   * @param {Function} a
   * @param {?} protoProps
   * @param {?} configuration
   * @return {undefined}
   */
  var create = function(a, protoProps, configuration) {
    var to = a.prototype;
    var config = _.extend({}, protoProps, configuration);
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
  return{
    /** @type {function (Function, ?, ?): undefined} */
    mixin : create
  };
}), define("core/views/common/mixins/LocalScroll", [], function() {
  var stickySource = {
    events : {
      mousewheel : "handleScrollEvent",
      wheel : "handleScrollEvent"
    },
    scrollMeasureSelector : "",
    /**
     * @return {?}
     */
    getScrollMeasure : function() {
      return this.scrollMeasure || (this.scrollMeasure = this.$el, this.scrollMeasureSelector && (this.scrollMeasure = this.$el.find(this.scrollMeasureSelector))), this.scrollMeasure;
    },
    /**
     * @param {KeyboardEvent} event
     * @return {undefined}
     */
    handleScrollEvent : function(event) {
      var orgEvent = event.originalEvent;
      var numRings = orgEvent.wheelDeltaY || -orgEvent.deltaY;
      var $el = this.$el;
      var b = $el.height();
      var ch = this.getScrollMeasure();
      var a = ch.height();
      var newY = ch.parent()[0].scrollTop;
      /** @type {boolean} */
      var withinMinBoundY = newY >= a - b;
      /** @type {boolean} */
      var contained = 0 === newY;
      if (withinMinBoundY && 0 > numRings || contained && numRings > 0) {
        event.preventDefault();
      }
    }
  };
  return stickySource;
}), define("core/templates/usersCard", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @return {?}
     */
    1 : function() {
      return "guests-only";
    },
    /**
     * @param {Object} t
     * @param {?} cursor
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    3 : function(t, cursor, dataAndEvents, task) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = cursor.each.call(t, null != t ? t.users : t, {
        name : "each",
        hash : {},
        fn : this.program(4, task),
        inverse : this.noop,
        data : task
      }), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    4 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.cardUser, "", "cardUser", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} ctx
     * @param {Object} helpers
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(ctx, helpers, environment, options) {
      var t;
      /** @type {string} */
      var text = '<div class="tooltip upvoters ';
      return t = helpers.unless.call(ctx, null != (t = null != ctx ? ctx.users : ctx) ? t.length : t, {
        name : "unless",
        hash : {},
        fn : this.program(1, options),
        inverse : this.noop,
        data : options
      }), null != t && (text += t), text += '">\n<ul class="scroll-measure" data-role="content">\n', t = helpers["if"].call(ctx, null != (t = null != ctx ? ctx.users : ctx) ? t.length : t, {
        name : "if",
        hash : {},
        fn : this.program(3, options),
        inverse : this.noop,
        data : options
      }), null != t && (text += t), text + '</ul>\n</div>\n<div class="tooltip-point hidden"></div>\n';
    },
    usePartial : true,
    useData : true
  });
}), define("core/views/UsersCard", ["jquery", "underscore", "handlebars", "core/config", "core/bus", "core/utils/views", "core/views/common/HoverCard", "core/views/common/mixins/LocalScroll", "core/templates/usersCard"], function(jQuery, _, data, p, handle, exports, $, params, Template) {
  var obj = $.extend({
    guestTextPartialName : "cardOtherUserText",
    className : "tooltip-outer upvoters-outer",
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      $.prototype.initialize.call(this, req);
      this.collection = this.collection || req.collection;
      this.session = req.session;
      this.numUsers = req.numUsers;
      this.listenTo(this.collection, "add", this.addUser);
      this.listenTo(this.collection, "remove", this.removeUser);
      this.listenTo(this.collection, "reset", this.render);
    },
    /**
     * @param {Object} user
     * @return {undefined}
     */
    addUser : function(user) {
      if (user.get("isAnonymous")) {
        this.updateGuests();
      } else {
        if (this.$listEl) {
          if (this.$listEl.length) {
            this.$listEl.prepend(data.partials.cardUser(_.extend({
              highlight : true
            }, user.toJSON())));
            this.stopHighlightUsername();
          }
        }
      }
    },
    /**
     * @param {Node} user
     * @return {undefined}
     */
    removeUser : function(user) {
      if (user.get("isAnonymous")) {
        this.updateGuests();
      } else {
        var controlRange = this.$el.find("[data-username=" + user.get("username") + "]");
        if (controlRange.length) {
          controlRange.remove();
        }
      }
    },
    stopHighlightUsername : _.debounce(function() {
      var $li = this.$el.find(".highlight");
      $li.removeClass("highlight");
    }, 1100),
    /**
     * @return {?}
     */
    getGuestCount : function() {
      return Math.max(this.numUsers - this.collection.length, 0);
    },
    /**
     * @return {undefined}
     */
    updateGuests : function() {
      var highlight = this.$el.find("[data-role=guest]");
      var guestCount = this.getGuestCount();
      var guestText = data.partials[this.guestTextPartialName]({
        guestCount : guestCount
      });
      var sheetName = {
        guestCount : guestCount,
        guestAvatarUrl : p.urls.avatar.generic,
        highlight : highlight.length,
        guestText : guestText
      };
      var input = data.partials.cardGuestUser(sheetName);
      if (highlight.length) {
        highlight.replaceWith(input);
        this.stopHighlightUsername();
      } else {
        if (this.$listEl) {
          if (this.$listEl.length) {
            this.$listEl.append(input);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    render : function() {
      delete this.pointEl;
      this.$el.html(Template({
        users : this.collection.toJSON(),
        highlight : false
      }));
      $.prototype.render.call(this);
      this.$listEl = this.$el.find(".upvoters ul");
      this.updateGuests();
    },
    /**
     * @return {undefined}
     */
    show : function() {
      if (this.numUsers) {
        if (!this.isVisible()) {
          $.prototype.show.call(this);
          handle.trigger("uiAction:userCardShow");
        }
      }
    },
    /**
     * @param {string} position
     * @return {undefined}
     */
    showPoint : function(position) {
      /** @type {Array} */
      var which = ["tl", "bl"];
      if (!this.pointEl) {
        this.pointEl = this.$el.find(".tooltip-point");
        this.pointEl.removeClass("hidden");
      }
      _.each(which, function(reverse) {
        this.pointEl.removeClass("point-position-" + reverse);
      }, this);
      this.pointEl.addClass("point-position-" + position);
    },
    /**
     * @param {?} bounds
     * @param {boolean} obj
     * @return {undefined}
     */
    moveTo : function(bounds, obj) {
      if (bounds) {
        var pos = $.POSITION_OFFSET;
        var start_pos = bounds.offset();
        var el = this.$el;
        var topHeight = el.height();
        var that = this.getContainerPosition();
        if (obj) {
          topHeight += el.find("li.user").height() + 10;
        }
        if (start_pos.top - topHeight - pos >= 0 && start_pos.top - topHeight + that.containerOffset.top >= that.pageOffset) {
          el.css({
            bottom : that.containerOffset.height - start_pos.top + pos,
            top : "inherit"
          });
          this.showPoint("bl");
        } else {
          el.css({
            bottom : "inherit",
            top : start_pos.top + 2 * pos
          });
          this.showPoint("tl");
        }
        el.css("left", start_pos.left - pos);
      }
    },
    /**
     * @param {Event} $event
     * @return {undefined}
     */
    handleShowProfile : function($event) {
      $.prototype.handleShowProfile.call(this, $event);
      var parent = jQuery($event.currentTarget);
      var data = parent.attr("data-username");
      handle.trigger("uiCallback:showProfile", data);
    }
  }, {
    /**
     * @param {?} opt_attributes
     * @param {?} attributes
     * @return {?}
     */
    create : function(opt_attributes, attributes) {
      return $.create(opt_attributes, attributes, "UsersCard", obj);
    }
  });
  return exports.mixin(obj, params, {
    scrollMeasureSelector : "[data-role=content]"
  }), obj;
}), define("core/views/UpvotersCard", ["underscore", "core/views/common/HoverCard", "core/views/UsersCard", "core/bus", "core/utils"], function(_, test, $, selectedElement, dataAndEvents) {
  var throttledUpdate = dataAndEvents.preventDefaultHandler;
  var obj = $.extend({
    guestTextPartialName : "cardGuestUpvoterText",
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      var model = options.model;
      var notifications_collection = model.getUpvotersUserCollection();
      _.extend(options, {
        collection : notifications_collection,
        numUsers : model.get("likes")
      });
      $.prototype.initialize.call(this, options);
      this.model = model;
      this.session = options.session;
      this.likes = model.get("likes");
      /** @type {boolean} */
      this.hadLikes = Boolean(this.likes);
      /** @type {boolean} */
      this._fetched = false;
      /** @type {boolean} */
      this._rendered = false;
      this.listenTo(this.model, "change:userScore", this.updateUserSet);
      this.listenTo(this.model, "change:likes", this.updateGuests);
    },
    /**
     * @return {undefined}
     */
    updateGuests : function() {
      this.numUsers = this.model.get("likes") || 0;
      $.prototype.updateGuests.call(this);
    },
    /**
     * @return {undefined}
     */
    updateUserSet : function() {
      var id = this.session.user;
      var likes = this.likes;
      /** @type {boolean} */
      var suiteView = false;
      this.likes = this.model.get("likes");
      if (this.model.get("userScore") > 0) {
        if (this.session.isLoggedIn()) {
          this.collection.add(id);
        }
        if (this.likes && !likes) {
          /** @type {boolean} */
          this._rendered = false;
          this.show();
        } else {
          /** @type {boolean} */
          suiteView = this.session.isLoggedOut() ? true : Boolean(this.likes - 1 - this.collection.length);
        }
      } else {
        this.collection.remove(id);
        if (!this.likes) {
          this.hide();
        }
      }
      this.updateGuests();
      this.moveTo(this.$target, suiteView);
    },
    /**
     * @return {?}
     */
    show : function() {
      if (this.likes && !this.isVisible()) {
        if (this.hadLikes || (this._fetched = true), !this._fetched) {
          return void this.collection.fetch().done(_.bind(function() {
            /** @type {boolean} */
            this._fetched = true;
            this.show();
          }, this));
        }
        var id = this.session.user;
        if (this.model.get("userScore") > 0) {
          if (this.session.isLoggedIn()) {
            if (!this.collection.contains(id)) {
              this.collection.add(id);
            }
          }
        }
        $.prototype.show.call(this);
        selectedElement.trigger("uiAction:upvotersCardShow");
      }
    },
    handleShowProfile : throttledUpdate(function(mapper) {
      $.prototype.handleShowProfile.call(this, mapper);
      selectedElement.trigger("uiAction:showProfileFromUpvotes");
    })
  }, {
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    create : function(opt_attributes) {
      var target = opt_attributes.model;
      if (target.has("id")) {
        return test.create(target.get("id"), opt_attributes, "UpvotersCard", obj);
      }
    }
  });
  return obj;
}), define("lounge/views/cards", ["jquery", "underscore", "backbone", "lounge/common", "core/utils", "common/collections", "common/models", "common/templates", "core/bus", "common/urls", "common/views/mixins", "core/mixins/asScrollableContainer", "core/views/common/HoverCard", "core/views/UpvotersCard"], function($, _, textAlt, deepDataAndEvents, tags, keepData, dataAndEvents, res, opt_attributes, matcherFunction, allsettings, execResult, BaseView, ignoreMethodDoesntExist) {
  /**
   * @return {?}
   */
  BaseView.prototype.getContainerPosition = function() {
    var elemSize = deepDataAndEvents.getLounge().getPosition();
    return{
      pageOffset : elemSize.pageOffset,
      containerOffset : elemSize.frameOffset,
      containerHeight : elemSize.height
    };
  };
  (function() {
    $(document).on("mouseout", _.debounce(function(e) {
      var node = e.relatedTarget || e.toElement;
      if (!(node && "HTML" !== node.nodeName)) {
        BaseView.exitAll();
      }
    }, 10));
  })();
  var parent = BaseView.extend({
    className : "tooltip-outer",
    events : _.defaults({
      "click [data-action=toggleFollow]" : "toggleFollow"
    }, BaseView.prototype.events),
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      var self = this;
      BaseView.prototype.initialize.call(self, req);
      self.session = req.session;
      self.user = req.user;
      /** @type {boolean} */
      self._fetched = false;
      self.listenTo(self.session, "change:id", function() {
        if (this._rendered) {
          this.render();
        }
      });
    },
    /**
     * @param {Object} results
     * @return {undefined}
     */
    onFetch : function(results) {
      this.user = new dataAndEvents.SyncedUser(results.attributes);
      this.updateCounters();
      this.updateActions();
      this.listenTo(this.user, {
        "change:numPosts change:numLikesReceived" : _.debounce(function() {
          this.updateCounters();
        }),
        "change:isFollowing" : this.updateActions
      });
    },
    /**
     * @return {?}
     */
    serialize : function() {
      var my_user_data = this.user.toJSON({
        session : this.session
      });
      return my_user_data.numLikesReceived = my_user_data.numLikesReceived || (this.user.get("numVotes") || 0), {
        user : my_user_data,
        showFollowButton : this.user.has("isFollowing") || this.session.isLoggedOut()
      };
    },
    /**
     * @return {undefined}
     */
    render : function() {
      this.$el.html(res.render("hovercard", this.serialize()));
      BaseView.prototype.render.call(this);
    },
    /**
     * @return {undefined}
     */
    updateCounters : function() {
      this.$el.find("[data-role=counters]").html(res.render("hovercardCounters", this.serialize()));
    },
    /**
     * @return {undefined}
     */
    updateActions : function() {
      this.$el.find("[data-role=actions]").html(res.render("hovercardActions", this.serialize()));
    },
    /**
     * @return {undefined}
     */
    show : function() {
      if (!this._fetched) {
        /** @type {boolean} */
        this._fetched = true;
        this.user.fetch({
          success : _.bind(this.onFetch, this)
        });
      }
      BaseView.prototype.show.call(this);
    }
  }, {
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    create : function(opt_attributes) {
      var user = opt_attributes.user;
      return BaseView.create(user.id, opt_attributes, "ProfileCard", parent);
    }
  });
  _.extend(parent.prototype, allsettings.FollowButtonMixin);
  var model = BaseView.extend({
    className : "context-card tooltip-outer",
    /**
     * @param {string} data
     * @return {undefined}
     */
    initialize : function(data) {
      var $scope = this;
      BaseView.prototype.initialize.call($scope, data);
      $scope.post = data.post;
    },
    /**
     * @return {undefined}
     */
    render : function() {
      var model = this.post;
      var post = model.toJSON();
      post.excerpt = tags.niceTruncate(post.plaintext, 40);
      this.$el.html(res.render("contextCard", {
        post : post
      }));
      BaseView.prototype.render.call(this);
    }
  }, {
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    create : function(opt_attributes) {
      var post = opt_attributes.post;
      return BaseView.create(post.id, opt_attributes, "ContextCard", model);
    }
  });
  return{
    HoverCard : BaseView,
    ProfileCard : parent,
    ContextCard : model,
    UpvotersCard : ignoreMethodDoesntExist
  };
}), define("core/views/SourcelessIframeRichMediaView", ["jquery", "core/mediaConfig", "core/views/RichMediaView"], function($, $templateCache, Router) {
  return Router.extend({
    /**
     * @param {?} element
     * @return {?}
     */
    createContentNode : function(element) {
      return $("<iframe>").attr({
        frameBorder : 0,
        scrolling : "no",
        width : "100%",
        height : this.model.get("deferredHeight"),
        "data-src" : element,
        src : 'javascript:window.frameElement.getAttribute("data-src");'
      });
    },
    /**
     * @param {?} popup
     * @return {undefined}
     */
    insertContentNode : function(popup) {
      Router.prototype.insertContentNode.apply(this, arguments);
      var top = this.model.get("deferredHeight") || $templateCache.get("defaultIframeHeight");
      popup.height(top);
    }
  });
}), define("lounge/views/media", ["underscore", "stance", "core/utils", "core/utils/storage", "core/strings", "common/urls", "core/media", "core/mediaConfig", "core/models/RichMediaViewModel", "core/views/RichMediaLinkView", "core/views/RichMediaView", "core/views/IframeRichMediaView", "core/views/SoundCloudRichMediaView", "core/views/AutoplayRichMediaView", "core/views/SourcelessIframeRichMediaView", "core/views/DynamicHeightRichMediaView", "core/views/TwitterRichMediaView", "core/views/ImageRichMediaView", 
"core/views/FacebookPhotoRichMediaView", "core/views/VineRichMediaView", "lounge/common"], function(_, $sanitize, opt_uri, namespace, failing_message, nextStack, dataAndEvents, settings, deepDataAndEvents, ignoreMethodDoesntExist, Router, textAlt, keepData, opt_attributes, matcherFunction, execResult, options, opt_keys, positionError, oFunctionBody, _$timeout_) {
  /**
   * @return {?}
   */
  function _set() {
    var reversed = namespace.get("reflect.collapse-media");
    return _.isBoolean(reversed) || (reversed = opt_uri.isMobileUserAgent()), reversed;
  }
  return _.extend(Router.prototype, {
    /**
     * @return {?}
     */
    topEdgeOffset : function() {
      return-_$timeout_.getLounge().getPosition().height;
    },
    /**
     * @return {undefined}
     */
    configureDeferred : function() {
      if (this.model.get("deferred")) {
        if (!this.model.get("activated")) {
          this.listenToOnce($sanitize(this), "enter", function() {
            if (this.relatedPost) {
              this.listenToOnce(this, "load error", function() {
                _$timeout_.getLounge().postsView.onDeferredViewReady(this.relatedPost);
              });
            }
            this.enterViewport();
          });
        }
      }
      this.listenToOnce(_$timeout_.getLounge().postsView, "render:end", this.updateDeferredHeight);
    }
  }), options.theme = function() {
    return _$timeout_.getLounge().config.colorScheme;
  }, options.linkColor = function() {
    return _$timeout_.getLounge().config.anchorColor;
  }, settings.set({
    collapsed : _set()
  }), settings.on("change:collapsed", function(dataAndEvents, items) {
    namespace.set("reflect.collapse-media", items);
  }), {
    settings : settings,
    /** @type {function (): ?} */
    getCollapseDefault : _set,
    getDomain : opt_uri.getDomain,
    RichMediaLinkView : ignoreMethodDoesntExist,
    RichMediaViewModel : deepDataAndEvents,
    /** @type {Function} */
    RichMediaView : Router,
    IframeRichMediaView : textAlt,
    SoundCloudRichMediaView : keepData,
    AutoplayRichMediaView : opt_attributes,
    SourcelessIframeRichMediaView : matcherFunction,
    DynamicHeightRichMediaView : execResult,
    TwitterRichMediaView : options,
    ImageRichMediaView : opt_keys,
    FacebookPhotoRichMediaView : positionError,
    VineRichMediaView : oFunctionBody,
    instantiateRichMediaView : dataAndEvents.instantiateRichMediaView,
    getRichMediaViewConfig : dataAndEvents.getRichMediaViewConfig
  };
}), define("lounge/views/posts/BlacklistView", ["jquery", "underscore", "backbone", "core/api", "core/utils", "common/templates"], function($, stream, Backbone, api, item, res) {
  var proxy = item.preventDefaultHandler;
  var h = Backbone.View.extend({
    tagName : "form",
    className : "moderate",
    events : {
      submit : "submit",
      "click [data-action=cancel]" : "cancel"
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      this.loading = this.model.get("ipAddress") && this.model.get("email") ? (new $.Deferred).resolve().promise() : this.model.fetch();
    },
    /**
     * @return {?}
     */
    render : function() {
      var $el = this.$el;
      return $el.addClass("loading"), this.loading.done(stream.bind(function() {
        $el.removeClass("loading");
        $el.html(res.render("blacklist", {
          post : this.model.toJSON()
        }));
      }, this)), this;
    },
    cancel : proxy(function() {
      this.trigger("cancel");
    }),
    submit : proxy(function() {
      var data = {};
      var _self = this;
      _self.$el.find("input").each(function() {
        if (this.checked) {
          data[this.name] = this.value;
        }
      });
      if (!stream.isEmpty(data)) {
        data.forum = _self.model.get("forum");
        api.call("blacklists/add.json", {
          method : "POST",
          data : data,
          /**
           * @return {undefined}
           */
          success : function() {
            _self.trigger("success");
          }
        });
      }
    })
  });
  return h;
}), define("lounge/views/posts/PostEditView", ["backbone", "core/views/TextareaView", "common/templates"], function(Backbone, TextareaView, res) {
  var d = Backbone.View.extend({
    tagName : "form",
    className : "edit",
    events : {
      submit : "submitForm",
      "click [data-action=cancel]" : "cancel"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.post = req.post;
      this.session = req.session;
    },
    /**
     * @return {undefined}
     */
    cancel : function() {
      this.trigger("cancel");
    },
    /**
     * @return {?}
     */
    render : function() {
      var params = this.post.toJSON();
      this.$el.html(res.render("edit", {
        post : params,
        user : this.session.toJSON()
      }));
      var ta = this.textarea = new TextareaView({
        value : params.raw_message
      });
      return this.$("[data-role=textarea]").prepend(ta.render().el), this;
    },
    /**
     * @return {undefined}
     */
    resize : function() {
      this.textarea.resize();
    },
    /**
     * @param {?} event
     * @return {?}
     */
    submitForm : function(event) {
      if (event) {
        if (event.preventDefault()) {
          event.preventDefault();
        }
      }
      var self = this;
      var d = {
        raw_message : this.textarea.get()
      };
      var warningMessage = self.post.validate(d);
      return void 0 !== warningMessage ? window.alert(warningMessage) : (self.trigger("submitted"), void self.post.save(d, {
        /**
         * @return {undefined}
         */
        success : function() {
        }
      }));
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      this.$el.remove();
    }
  });
  return d;
}), define("lounge/views/posts/TypingUserView", ["backbone", "core/strings"], function(Backbone, nameMap) {
  var getName = nameMap.get;
  var d = Backbone.View.extend({
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      /** @type {Object} */
      this.options = options;
    },
    /**
     * @return {?}
     */
    render : function() {
      var name;
      var reply = this.options.parentView.reply;
      var childElem = reply && reply.typingUser;
      var n = this.model.usersTyping.count(childElem && childElem.id);
      return 0 >= n ? void this.$el.hide() : (1 === n ? name = getName("One other person is typing\u00e2\u20ac\u00a6") : (name = getName("%(num)s other people are typing\u00e2\u20ac\u00a6"), name = nameMap.interpolate(name, {
        num : n
      })), this.$el.text(name), this.$el.show(), this);
    }
  });
  return d;
}), define("core/views/ClickTooltip", ["underscore", "core/views/common/HoverCard"], function(callback, $) {
  var obj = $.extend({
    className : "tooltip-outer",
    /**
     * @param {(Object|string)} config
     * @return {undefined}
     */
    initialize : function(config) {
      $.prototype.initialize.call(this, config);
      this.template = config.template;
    },
    /**
     * @return {undefined}
     */
    render : function() {
      this.$el.html(this.template());
      $.prototype.render.call(this);
    },
    /**
     * @param {?} bounds
     * @return {undefined}
     */
    moveTo : function(bounds) {
      if (bounds) {
        var find = $.POSITION_OFFSET;
        var offset = bounds.offset();
        var that = this.getContainerPosition();
        this.$el.css({
          bottom : that.containerOffset.height - offset.top + find,
          top : "inherit",
          left : offset.left
        });
      }
    },
    /**
     * @param {Object} el
     * @return {undefined}
     */
    target : function(el) {
      el.on("click", callback.bind(this.targetClicked, this, el));
      el.on("mouseleave", callback.bind(this.leave, this));
    },
    /**
     * @param {Function} $target
     * @return {undefined}
     */
    targetClicked : function($target) {
      if ($target) {
        /** @type {Function} */
        this.$target = $target;
      }
      if ("in" !== this._hoverState) {
        /** @type {string} */
        this._hoverState = "in";
        this.show();
        $.open[this.uid] = this;
      }
    }
  }, {
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    create : function(opt_attributes) {
      return $.create(opt_attributes.id, opt_attributes, "ClickTooltip", obj);
    }
  });
  return obj;
}), define("lounge/views/post", ["jquery", "underscore", "backbone", "stance", "core/strings", "core/utils", "core/mixins/withAlert", "core/mixins/withRichMedia", "common/templates", "common/urls", "common/utils", "lounge/common", "lounge/mixins", "lounge/views/cards", "lounge/views/media", "lounge/views/posts/BlacklistView", "lounge/views/posts/PostEditView", "lounge/views/posts/PostReplyView", "lounge/views/posts/TypingUserView", "core/views/ClickTooltip"], function($, _, Backbone, converter, entity, 
c, fn, connect, res, acct, Widget, dataAndEvents, config, Parse, field, AppView, _EditManager, widget, HelloWorldView, User) {
  var cl = c.preventDefaultHandler;
  var text = entity.get;
  var self = Backbone.View.extend({
    tagName : "li",
    className : "post",
    events : {
      /**
       * @param {Event} ev
       * @return {?}
       */
      "click > [data-role=post-content] [data-action]" : function(ev) {
        var node = this;
        var j = $(ev.currentTarget).attr("data-action");
        var method = node.actions[j];
        return method ? (_.isFunction(method) ? method : node[method]).call(node, ev) : void 0;
      }
    },
    actions : {
      upvote : cl(function(deepDataAndEvents) {
        this.handleVote(deepDataAndEvents, 1);
      }),
      downvote : cl(function(deepDataAndEvents) {
        this.handleVote(deepDataAndEvents, -1);
      }),
      reply : "handleReply",
      flag : "handleFlag",
      edit : "handleEdit",
      "delete" : "handleDelete",
      spam : "handleSpam",
      blacklist : "handleBlacklist",
      highlight : "handleHighlight",
      unhighlight : "handleUnhighlight",
      collapse : "handleCollapse",
      reveal : "handleReveal",
      "share:twitter" : "_onShare",
      "share:facebook" : "_onShare"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      this.thread = options.thread;
      this.session = options.session;
      /** @type {boolean} */
      this.created = Boolean(options.created);
      /** @type {Object} */
      this.options = options;
      this.userSuggestions = options.userSuggestions;
      this.setAlertSelector("> [role=alert]");
      this.listenTo(this.model, {
        "change:isDeleted spam" : this.removeAsDeleted,
        "change:message" : this.stopLoading,
        "change:points" : this.updateVotePoints,
        "change:userScore" : this.updateActiveUserVote,
        "change:isFlaggedByUser" : this.updateUserFlagged,
        /**
         * @return {undefined}
         */
        "change:isHighlighted" : function() {
          this.redraw();
        },
        /**
         * @return {undefined}
         */
        change : function() {
          var er = this.model.changedAttributes();
          if (er.id || er.message) {
            this.redraw();
          }
        }
      });
      this.listenTo(this.model.usersTyping, "add remove reset change", this.updateTypingCount);
      this.listenTo(this.session, "change:id", function() {
        this.updateFooter();
        this.updateMenu();
        this.updateSessionClass();
      });
      /** @type {null} */
      this.reply = null;
      /** @type {null} */
      this.edit = null;
      this.parent = options.parent;
      /** @type {boolean} */
      this.trackPosition = false;
      this.offset = {
        top : -1,
        height : -1
      };
      this.dim = {
        height : -1,
        width : -1
      };
      this.listenTo(dataAndEvents.getLounge(), "domReflow", this.calcRect);
      /** @type {boolean} */
      this.isCollapseAllowed = true;
      /** @type {boolean} */
      this.haveSubscribedToRichMediaEvents = false;
    },
    /**
     * @return {?}
     */
    calcRect : function() {
      if (!this.trackPosition || !this.visible) {
        return this.offset = {
          top : -1,
          height : -1
        }, void(this.dim = {
          height : -1,
          width : -1
        });
      }
      var n = this.contentNode;
      this.offset = n.offset();
      this.dim = {
        height : n.height(),
        width : n.width()
      };
    },
    /**
     * @return {undefined}
     */
    createTypingUserView : function() {
      var tag = this.$el.find("[data-role=realtime-notification\\:" + this.model.id + "] .realtime-replies");
      this.typingUserView = new HelloWorldView({
        parentView : this,
        model : this.model,
        el : tag
      });
    },
    /**
     * @return {undefined}
     */
    updateTypingCount : function() {
      if (!this.typingUserView) {
        this.createTypingUserView();
      }
      this.typingUserView.render();
    },
    /**
     * @return {undefined}
     */
    stopLoading : function() {
      this.contentNode.find(".loading").removeClass("loading");
    },
    /**
     * @return {undefined}
     */
    updateRelativeTime : function() {
      this.contentNode.find("[data-role=relative-time]").text(this.model.getRelativeCreatedAt());
    },
    /**
     * @return {undefined}
     */
    updateSessionClass : function() {
      /** @type {string} */
      var activeClassName = "authored-by-session-user";
      if (this.model.isAuthorSessionUser(this.session)) {
        this.contentNode.addClass(activeClassName);
      } else {
        this.contentNode.removeClass(activeClassName);
      }
    },
    /**
     * @return {undefined}
     */
    updateActiveUserVote : function() {
      var model = this.model;
      var $delegate = this.contentNode.find("[data-action=upvote]");
      var $animate = this.contentNode.find("[data-action=downvote]");
      $animate.removeClass("downvoted");
      $delegate.removeClass("upvoted");
      if (model.get("userScore") > 0) {
        $delegate.addClass("upvoted");
      } else {
        if (model.get("userScore") < 0) {
          $animate.addClass("downvoted");
        }
      }
    },
    /**
     * @return {undefined}
     */
    updateVotePoints : function() {
      var model = this.model;
      var which = this.contentNode.find("[data-role=likes], [data-role=dislikes]");
      var _queries = this.contentNode.find("[data-action=upvote], [data-action=downvote]");
      /**
       * @param {Object} player
       * @return {undefined}
       */
      var init = function(player) {
        _.delay(function() {
          player.addClass("update");
          _.delay(function() {
            player.removeClass("update");
          }, 1E3);
        }, 500);
      };
      _.each(which, function(el, j) {
        el = $(el);
        var i = el.html();
        var r = model.get(el.attr("data-role"));
        var d = $(_queries[j]);
        /** @type {string} */
        r = Math.max(r, 0).toString();
        if (i !== r) {
          d.removeClass("count-" + i);
          d.addClass("count-" + r);
          el.html(r);
          init(el);
        }
      });
    },
    /**
     * @return {undefined}
     */
    updateFooter : function() {
      var footer = this.contentNode.find("footer");
      var out = res.render("postFooter", {
        post : this.getPostAttributes(),
        session : this.session.toJSON()
      });
      if (widget.open[this.model.cid]) {
        this.toggleReplyLink(true);
      }
      footer.html(out);
      this.initUpvotersCard();
    },
    /**
     * @return {undefined}
     */
    updateMenu : function() {
      var ret = this.contentNode.find("[data-role=menu]");
      var rreturn = res.render("postMenu", {
        session : this.session.toJSON(),
        post : this.getPostAttributes()
      });
      ret.replaceWith(rreturn);
    },
    /**
     * @return {undefined}
     */
    updatePostStateClasses : function() {
      var model = this.model;
      var retval = model.get("isHighlighted") || model.get("isSponsored");
      this.$el.toggleClass("highlighted", Boolean(retval));
      this.contentNode.toggleClass("disabled", !model.id);
    },
    /**
     * @return {undefined}
     */
    updateUserFlagged : function() {
      if (this.model.get("isFlaggedByUser")) {
        this.contentNode.addClass("user-reported");
      } else {
        this.contentNode.removeClass("user-reported");
      }
    },
    /**
     * @return {?}
     */
    getMessageContent : function() {
      return this.messageContent && this.messageContent.length || (this.messageContent = this.contentNode.find("[data-role=message-content]")), this.messageContent;
    },
    /**
     * @param {number} value
     * @return {undefined}
     */
    manageMessageHeight : function(value) {
      var options = this;
      var testNode = options.getMessageContent();
      /** @type {number} */
      var b = 1.5 * options.collapsedHeight;
      var a = testNode && (testNode.length && testNode.height()) || 0;
      a += value || 0;
      if (a > b && !options.$el.hasClass("collapsed")) {
        options.collapse();
      } else {
        options.expand(true);
      }
    },
    /**
     * @param {Node} promise
     * @return {undefined}
     */
    preventCollapsing : function(promise) {
      if (!promise.get("deferred")) {
        this.expand();
        /** @type {boolean} */
        this.isCollapseAllowed = false;
      }
    },
    /**
     * @return {undefined}
     */
    markSeen : function() {
      /**
       * @return {undefined}
       */
      function keyup() {
        self.contentNode.addClass("seen");
        _.delay(function() {
          self.contentNode.removeClass("seen");
          self.contentNode.removeClass("new");
        }, 1E4);
        /** @type {boolean} */
        self.trackPosition = false;
      }
      var self = this;
      var v = converter(self);
      if (v.isVisible()) {
        keyup();
      } else {
        this.listenToOnce(v, "enter", keyup);
      }
    },
    /**
     * @return {undefined}
     */
    renderMedia : function() {
      var msgs = this.model.media;
      if (msgs && msgs.length) {
        var expectationResult = this.$el.find("[data-role=post-media-list]");
        this.richMediaViews = this.renderRichMedia(msgs, expectationResult, {
          convertLinkToButton : true,
          /**
           * @param {Object} model
           * @return {undefined}
           */
          beforeRender : function(model) {
            this.listenTo(model.model, "change:activated", this.preventCollapsing);
            model.relatedPost = this.model.cid;
          },
          /**
           * @param {(Function|string)} a
           * @return {?}
           */
          normalize : function(a) {
            var $a = c.bleachFindUrls(a);
            return $a.length && (a = $a[0].url), a;
          }
        });
        if (!this.haveSubscribedToRichMediaEvents) {
          if (this.richMediaViews.length) {
            this.listenTo(field.settings, "change:collapsed", function(dataAndEvents, deepDataAndEvents) {
              if (deepDataAndEvents) {
                this.manageMessageHeight();
              } else {
                var udataCur = _.reduce(this.richMediaViews, function(dataAndEvents, d) {
                  return dataAndEvents + (d.model.get("deferredHeight") || 0);
                }, 0);
                this.manageMessageHeight(udataCur);
              }
            });
            /** @type {boolean} */
            this.haveSubscribedToRichMediaEvents = true;
          }
        }
      }
    },
    /**
     * @return {?}
     */
    getStateByline : function() {
      var data;
      var model = this.model;
      return model.get("isHighlighted") ? data = {
        icon : "trophy",
        text : text("Featured by %(forum)s"),
        style : "default"
      } : model.get("isSponsored") ? data = {
        icon : "trophy",
        text : text("Sponsored on Reflect"),
        style : "sponsored"
      } : model.isAuthorSessionUser(this.session) && (model.get("isApproved") || (data = {
        icon : "clock",
        text : text("Hold on, this is waiting to be approved by %(forum)s."),
        style : "default"
      })), data && (data.text = entity.interpolate(data.text, {
        forum : this.thread.forum.get("name")
      })), data;
    },
    /**
     * @param {string} item
     * @return {?}
     */
    getTemplate : function(item) {
      return item.isDeleted ? "postDeleted" : this.model.isAuthorSessionUser(this.session) && !item.isApproved ? "post" : item.isMinimized ? "postMinimized" : "post";
    },
    /**
     * @return {?}
     */
    getPostAttributes : function() {
      var os = this.model.toJSON({
        session : this.session,
        thread : this.thread
      });
      var name = this.model.getParent();
      return name && (name.get("isSponsored") && (os.canBeRepliedTo = false, os.hideViewAllComments = name.get("hideViewAllComments"))), os;
    },
    /**
     * @return {?}
     */
    render : function() {
      var $container = this.$el;
      var templateName = this.getPostAttributes();
      var listenToOnce = dataAndEvents.getLounge();
      var options = this.thread.forum.get("avatar");
      var model = this.model.getParent();
      var template = this.getTemplate(templateName);
      return!templateName.message && (templateName.raw_message && (Widget.isPlainText(templateName.raw_message) && (templateName.message = this.model.constructor.formatMessage(templateName.raw_message)))), $container.html(res.render(template, {
        post : templateName,
        forumName : this.thread.forum.get("name"),
        session : this.session.toJSON(),
        thread : this.thread.toJSON(),
        created : this.created,
        parentPost : model && model.toJSON({
          session : this.session,
          thread : this.thread
        }),
        defaultAvatarUrl : options ? options.large.cache : acct.avatar.generic,
        stateByline : this.getStateByline()
      })), "postMinimized" === template || "postDeleted" === template ? $container.addClass("minimized") : $container.removeClass("minimized"), !this.options.excludeAnchor && (this.model.id && $container.attr("id", "post-" + this.model.id)), this.contentNode = $container.find("[data-role=post-content]"), this.childrenNode = $container.find("[data-role=children]"), this.messageNode = this.contentNode.find("[data-role=message]"), this.highlightSyntax(), this.processMentions(), this.initCards(), this.updatePostStateClasses(), 
      this.renderMedia(), this.model.get("isRealtime") && (this.trackPosition = true, this.listenToOnce(listenToOnce.postsView, "render:end", this.markSeen)), this.listenToOnce(listenToOnce.postsView, "render:end", function() {
        this.markSeen();
        this.manageMessageHeight();
      }), this;
    },
    /**
     * @return {undefined}
     */
    highlightSyntax : function() {
      var others = this.contentNode.find("pre code");
      if (others.length) {
        others.each(function() {
          Widget.syntaxHighlighter.highlight(this);
        });
      }
    },
    /**
     * @return {undefined}
     */
    redraw : function() {
      /** @type {DocumentFragment} */
      var ol = document.createDocumentFragment();
      this.childrenNode.children().appendTo(ol);
      this.render();
      this.childrenNode.append(ol);
      dataAndEvents.getLounge().postsView.trigger("render:end");
      dataAndEvents.getLounge().trigger("domReflow");
    },
    /**
     * @return {undefined}
     */
    processMentions : function() {
      this.contentNode.find("[data-ref-mention]").each(function() {
        var post = $(this);
        var title = post.attr("data-ref-mention").split(":")[0];
        post.attr("data-action", "profile");
        post.attr("data-username", title);
        post.addClass("mention");
      });
    },
    /**
     * @param {Object} view
     * @return {undefined}
     */
    attachChild : function(view) {
      var model = view.model;
      if (model.created || (!model.id || model.get("isImmediateReply"))) {
        this.childrenNode.prepend(view.el);
      } else {
        this.childrenNode.append(view.el);
      }
    },
    /**
     * @return {undefined}
     */
    toggleReply : function() {
      if (this.reply && this.reply.isOpen()) {
        this.hideReply();
      } else {
        this.showReply();
      }
    },
    /**
     * @param {boolean} recurring
     * @return {undefined}
     */
    toggleReplyLink : function(recurring) {
      this.contentNode.find("[data-role=reply-link]").toggleClass("active", recurring);
    },
    /**
     * @return {undefined}
     */
    showReply : function() {
      if (this.reply) {
        this.$el.find("[data-role=reply-form]").first().prepend(this.reply.$el);
        this.reply.show();
        this.reply.focus();
      } else {
        this.getReplyView();
      }
      this.toggleReplyLink(true);
    },
    /**
     * @return {undefined}
     */
    hideReply : function() {
      if (this.reply) {
        this.reply.hide();
        this.toggleReplyLink(false);
      }
    },
    /**
     * @return {?}
     */
    toggleEdit : function() {
      return this.contentNode.find("[data-role=edit-link]").toggleClass("active"), this.edit ? (this.edit.remove(), this.edit = null, void this.messageNode.show()) : void this.showEdit();
    },
    /**
     * @return {?}
     */
    showEdit : function() {
      if (this.session.isLoggedOut()) {
        return void this.listenToOnce(this.session, "change:id", this.toggleEdit);
      }
      if (this.model.canBeEdited(this.session, this.thread) && !this.edit) {
        this.edit = new _EditManager({
          post : this.model,
          session : this.session
        });
        this.edit.render();
        this.listenTo(this.edit, "submitted cancel", this.toggleEdit);
        this.expand(true);
        var output = this.messageNode;
        output.parent().prepend(this.edit.$el);
        output.hide();
        this.edit.resize();
        var url = dataAndEvents.getLounge();
        if (url) {
          url.scrollToPost(this.model.id);
        }
      }
    },
    /**
     * @return {undefined}
     */
    removeAsDeleted : function() {
      this.redraw();
    },
    /**
     * @return {undefined}
     */
    initCards : function() {
      var initUpvotersCard = this;
      initUpvotersCard.initProfileCard();
      initUpvotersCard.initContextCard();
      initUpvotersCard.initUpvotersCard();
      initUpvotersCard.initAnonVoteCards();
    },
    /**
     * @return {undefined}
     */
    initProfileCard : function() {
      if (!c.isMobileUserAgent()) {
        var targetElement = this.$el.find(".hovercard");
        if (targetElement.length) {
          this.profileCard = Parse.ProfileCard.create({
            session : this.session,
            user : this.model.author,
            targetElement : targetElement
          });
        }
      }
    },
    /**
     * @return {undefined}
     */
    initContextCard : function() {
      if (!c.isMobileUserAgent()) {
        var post = this.parent && this.parent.model;
        if (post) {
          if (!post.get("isDeleted")) {
            this.contextCard = Parse.ContextCard.create({
              post : post,
              targetElement : this.$el.find("[data-role=parent-link]")
            });
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    initUpvotersCard : function() {
      if (!c.isMobileUserAgent()) {
        var targetElement = this.$el.find("[data-action=upvote]");
        if (targetElement.length) {
          this.upvotersCard = Parse.UpvotersCard.create({
            session : this.session,
            model : this.model,
            targetElement : targetElement
          });
        }
      }
    },
    /**
     * @return {undefined}
     */
    initAnonVoteCards : function() {
      if (this.session.isLoggedOut()) {
        if (!this.thread.forum.get("settings").allowAnonVotes) {
          this.anonVoteCards = this.anonVoteCards || {};
          _.each({
            upvote : "anonUpvoteCard",
            downvote : "anonDownvoteCard"
          }, function(template, id) {
            if (this.anonVoteCards[id]) {
              this.anonVoteCards[id].remove();
              /** @type {null} */
              this.anonVoteCards[id] = null;
            }
            var targetElement = this.$("[data-action=" + id + "]");
            if (targetElement.length) {
              this.anonVoteCards[id] = User.create({
                targetElement : targetElement,
                template : res.getTemplate(template),
                id : "anon" + id + this.model.id
              });
            }
          }, this);
          if (this.anonVoteCards.upvote) {
            this.listenTo(this.anonVoteCards.upvote, "show", this.closeUpvotersCard);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    closeUpvotersCard : function() {
      if (this.upvotersCard) {
        this.upvotersCard.hide();
      }
    },
    _onShare : cl(function(evt) {
      var elem = Widget.extractService(evt.target, "share");
      if (elem) {
        dataAndEvents.getLounge().trigger("uiAction:postShare", this.model, elem);
        this.share(elem);
      }
    }),
    /**
     * @return {?}
     */
    _shareUrl : function() {
      return this.model.permalink(this.thread);
    },
    handleBlacklist : cl(function() {
      if (!this.blacklist) {
        var view = this.blacklist = new AppView({
          model : this.model
        });
        view.render();
        this.listenTo(view, "success cancel", function() {
          this.blacklist.remove();
          /** @type {null} */
          this.blacklist = null;
        });
        this.contentNode.find("[data-role=blacklist-form]").first().append(view.el);
      }
    }),
    /**
     * @param {?} loading
     * @return {undefined}
     */
    toggleCollapse : function(loading) {
      this.$el.toggleClass("collapsed", loading);
    },
    handleCollapse : cl(function() {
      this.toggleCollapse();
    }),
    handleHighlight : cl(function() {
      this.model.highlight();
      this.alert(res.render("highlightedSuccessMessage"), {
        safe : true,
        type : "success"
      });
      this.thread.set("highlightedPost", this.model);
      var url = dataAndEvents.getLounge();
      if (url) {
        url.scrollToPost(this.model.id);
      }
    }),
    handleUnhighlight : cl(function() {
      this.model.unhighlight();
      this.dismissAlert();
      this.thread.unset("highlightedPost");
    }),
    /**
     * @param {?} deepDataAndEvents
     * @param {number} expectedNumberOfNonCommentArgs
     * @return {?}
     */
    handleVote : function(deepDataAndEvents, expectedNumberOfNonCommentArgs) {
      if (!this.thread.forum.get("settings").allowAnonVotes && this.session.isLoggedOut()) {
        return void this.handleLoggedOutVote(deepDataAndEvents, expectedNumberOfNonCommentArgs);
      }
      var view = dataAndEvents.getLounge();
      /** @type {boolean} */
      var vote = this.model.get("userScore") === expectedNumberOfNonCommentArgs;
      if (vote) {
        view.trigger("uiAction:postUnvote", this.model, deepDataAndEvents);
      } else {
        if (1 === expectedNumberOfNonCommentArgs) {
          view.trigger("uiAction:postUpvote", this.model, deepDataAndEvents);
        } else {
          if (-1 === expectedNumberOfNonCommentArgs) {
            view.trigger("uiAction:postDownvote", this.model, deepDataAndEvents);
          }
        }
      }
      this.model.vote(vote ? 0 : expectedNumberOfNonCommentArgs);
    },
    /**
     * @param {?} deepDataAndEvents
     * @param {number} expectedNumberOfNonCommentArgs
     * @return {undefined}
     */
    handleLoggedOutVote : function(deepDataAndEvents, expectedNumberOfNonCommentArgs) {
      this.listenToOnce(this.session, "change:id", function() {
        if (this.session.isLoggedIn()) {
          this.handleVote(deepDataAndEvents, expectedNumberOfNonCommentArgs);
        }
      });
      this.session.authenticate("reflectDotcom");
    },
    /**
     * @return {?}
     */
    getReplyView : function() {
      return this.reply ? this.reply : (this.reply = new widget({
        parentView : this,
        parent : this.model,
        thread : this.thread,
        session : this.options.session,
        userSuggestions : this.userSuggestions,
        shouldShowEmailAlertInForm : true
      }), this.reply.render(), this.showReply(), this.reply);
    },
    handleReply : cl(function() {
      this.toggleReply();
    }),
    handleFlag : cl(function() {
      if (!this.model.get("isFlaggedByUser")) {
        var confirm = text("Are you sure you want to flag this comment?");
        if (window.confirm(confirm)) {
          this.model.report();
          this.model.set("isFlaggedByUser", true);
        }
      }
    }),
    handleEdit : cl(function() {
      this.toggleEdit();
    }),
    handleDelete : cl(function() {
      var confirm = text("Are you sure you want to delete this comment? You cannot undo this action.");
      if (this.session.user.id !== this.model.author.id || window.confirm(confirm)) {
        if (this.model.get("isHighlighted")) {
          this.model.set("isHighlighted", false);
          this.thread.unset("highlightedPost");
        }
        this.model._delete();
      }
    }),
    handleSpam : cl(function() {
      this.model.spam();
    }),
    handleReveal : cl(function() {
      this.model.set("isMinimized", false);
      this.redraw();
    }),
    handleExpandMessage : cl(function() {
      return this.expand();
    })
  });
  return _.extend(self.prototype, config.ShareMixin), fn.call(self.prototype), config.asCollapsible.call(self.prototype, {
    collapsedHeight : 374,
    collapseTargetSelector : "[data-role=message-container]",
    collapseScope : "contentNode"
  }), connect.call(self.prototype), self;
}), define("lounge/views/posts/collection", ["jquery", "underscore", "backbone", "moment", "core/bus", "core/strings", "common/models", "common/utils", "lounge/views/posts/PostReplyView", "lounge/views/post"], function($, _, Backbone, moment, exec_state, http, Models, b, todo, Collection) {
  var getter = http.get;
  var options = Backbone.View.extend({
    STREAMING_MAX_VISIBLE : 250,
    events : {
      "click [data-action=more-posts]" : "handleLoadMore"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.lounge = req.lounge;
      this.thread = req.thread;
      this.userSuggestions = req.userSuggestions;
      this.posts = req.posts;
      /** @type {Array} */
      this.postsToAppend = [];
      /** @type {Array} */
      this.postsToPrepend = [];
      this.session = req.session;
      this.subViews = {};
      this.state = {
        nextPassTimeoutId : null,
        renderedPosts : [],
        clearDomAfterRender : false,
        totalPostsProcessed : 0,
        totalElapsedTime : 0
      };
      this.listenTo(this.posts, {
        reset : this.redrawPosts,
        add : this.addPosts,
        remove : this.removePost
      });
      this.listenTo(this.thread, "change:highlightedPost", this.handleHasHighlightedState);
      this.listenTo(this.thread, "change:isClosed", this.toggleNoPosts);
      this.listenTo(this.session, "change:id", this.toggleNoPosts);
      this.listenTo(this.posts, "reset add", this.toggleNoPosts);
      this.listenTo(this.posts, "reset add", this.enableTimestampUpdates);
      this.listenTo(this, "render:end", this.toggleLoadMorePosts);
      this.listenTo(this, "render:end", this.handleHasHighlightedState);
    },
    /**
     * @return {undefined}
     */
    handleHasHighlightedState : function() {
      this.$el.toggleClass("has-highlighted-post", this.thread.has("highlightedPost"));
    },
    /**
     * @param {?} timeoutKey
     * @return {?}
     */
    getPostView : function(timeoutKey) {
      return this.subViews[timeoutKey];
    },
    /**
     * @param {?} self
     * @param {?} params
     * @return {undefined}
     */
    bootstrap : function(self, params) {
      this.permalinkOptions = params;
      this.listenTo(this.posts, "reset", _.bind(this.posts.restoreFromCache, this.posts));
      this.listenTo(this.posts, "change:isDeleted", _.bind(this.posts.removeFromCache, this.posts));
      this.posts.reset(self.posts);
      _.invoke(this.subViews, "manageMessageHeight");
    },
    /**
     * @return {undefined}
     */
    bindUIUpdateHandlers : function() {
      var view = this;
      var $window = $(window);
      var $win = $(document.body);
      var newVal = $win.width();
      var onWindowResize = _.debounce(function() {
        var oldVal = $win.width();
        if (newVal !== oldVal) {
          if (view.subViews) {
            newVal = oldVal;
            _.each(view.subViews, function(dataAndEvents) {
              dataAndEvents.manageMessageHeight();
            });
          }
        }
      }, 50);
      $window.on("resize", onWindowResize);
    },
    /**
     * @return {?}
     */
    updateTimestamps : function() {
      return!this.subViews || _.size(this.subViews) < 1 ? false : (_.invoke(this.subViews, "updateRelativeTime"), true);
    },
    /**
     * @return {undefined}
     */
    enableTimestampUpdates : function() {
      var self = this;
      /** @type {number} */
      var delay = 6E4;
      if (!self.timestampUpdateTimer) {
        /**
         * @return {?}
         */
        var timeout = function() {
          return self.updateTimestamps() ? void(self.timestampUpdateTimer = _.delay(timeout, delay)) : void(self.timestampUpdateTimer = null);
        };
        self.timestampUpdateTimer = _.delay(timeout, delay);
      }
    },
    /**
     * @param {string} id
     * @return {undefined}
     */
    openReply : function(id) {
      var obj = this.posts.get(id);
      if (obj) {
        var subViews = this.subViews[obj.cid];
        subViews.showReply();
      }
    },
    /**
     * @param {string} name
     * @return {undefined}
     */
    openEdit : function(name) {
      var obj = this.posts.get(name);
      if (obj) {
        var scope = this.subViews[obj.cid];
        scope.showEdit();
      }
    },
    /**
     * @return {undefined}
     */
    toggleLoadMorePosts : function() {
      var loading = this.$el.find("#posts [data-role=more]");
      var b = this.posts.hasNext();
      if (b) {
        loading.show();
      } else {
        loading.hide();
      }
    },
    /**
     * @param {Event} event
     * @return {undefined}
     */
    handleLoadMore : function(event) {
      event.preventDefault();
      var self = this;
      var root = $(event.currentTarget);
      var trigger = self.posts.currentPage();
      root.addClass("busy");
      self.posts.more({
        /**
         * @return {undefined}
         */
        success : function() {
          self.posts.restoreFromCache();
          self.once("render:end", function() {
            root.removeClass("busy");
          });
        },
        /**
         * @return {undefined}
         */
        error : function() {
          root.removeClass("busy");
        }
      });
      self.lounge.trigger("uiAction:seeMore", trigger + 1);
      exec_state.frame.sendHostMessage("posts.paginate");
    },
    renderLayout : $.noop,
    /**
     * @return {undefined}
     */
    toggleNoPosts : function() {
      var text;
      var $label = $("#no-posts");
      if (this.posts.models.length) {
        $label.hide();
      } else {
        text = getter(this.thread.get("isClosed") ? "This discussion has been closed." : this.session.get("canReply") ? "Be the first to comment." : "Nothing in this discussion yet.");
        $label.text(text);
        $label.show();
      }
    },
    /**
     * @return {undefined}
     */
    handleSort : function() {
      $("#posts [data-role=more]").hide();
      $("#no-posts").hide();
      $("#post-list").addClass("loading").empty();
    },
    /**
     * @return {undefined}
     */
    redrawPosts : function() {
      var options = this;
      options.subViews = {};
      options.once("render:end", function() {
        _.each(todo.open, function(panel, ti) {
          var token = options.subViews[ti];
          if (token) {
            var self = token.getReplyView();
            self.textarea.set(panel.textarea.get());
            if (panel.isOpen()) {
              self.show();
            } else {
              self.hide();
            }
          }
        });
      });
      if (options.posts.setPageFor) {
        if (options.permalinkOptions) {
          if (options.permalinkOptions.postId) {
            options.posts.setPageFor(options.permalinkOptions.postId, {
              silent : true
            });
          }
        }
      }
      options.addPosts(options.posts, {
        clearDom : true
      });
    },
    /**
     * @param {(Array|number)} array
     * @return {?}
     */
    postsShouldBePrepended : function(array) {
      var lock = array.length && array[0];
      return Boolean(lock && (lock.created || (!lock.id || (lock.get("isRealtime") || (lock.get("isCached") || lock.requestedByPermalink)))));
    },
    /**
     * @return {?}
     */
    hasQueuedPosts : function() {
      return this.postsToAppend.length || this.postsToPrepend.length;
    },
    addPosts : b.decorate(Backbone.collectionAddNormalizer(Backbone.Collection, Models.Post), function(results, dataAndEvents, child) {
      var self = this;
      if (child.clearDom && (self.postsToAppend = [], self.postsToPrepend = [], self.postsShouldClearDom = true), self.postsShouldBePrepended(results)) {
        /** @type {Array} */
        var r = [];
        _.each(results, function(c) {
          var res = c.get("parent");
          if (res && self.posts.get(res)) {
            self.postsToPrepend.push(c);
          } else {
            r.push(c);
          }
        });
        /** @type {Array} */
        self.postsToPrepend = r.concat(self.postsToPrepend);
      } else {
        self.postsToAppend = self.postsToAppend.concat(results);
      }
      if (!self.state.nextPassTimeoutId) {
        /** @type {number} */
        self.state.nextPassTimeoutId = window.requestAnimationFrame(function() {
          self.trigger("render:start");
          self.addPostsIncremental();
        });
      }
    }),
    /**
     * @param {?} selector
     * @return {undefined}
     */
    onDeferredViewReady : function(selector) {
      var css = this.subViews;
      if (css.hasOwnProperty(selector)) {
        css[selector].manageMessageHeight();
      }
    },
    /**
     * @param {?} a
     * @return {?}
     */
    removePost : function(a) {
      if (this.hasQueuedPosts()) {
        return void this.once("render:end", _.bind(this.removePost, this, a));
      }
      var selfObj = this.subViews[a.cid];
      if (selfObj) {
        selfObj.remove();
        delete this.subViews[a.cid];
      }
    },
    /**
     * @param {(Array|string)} deepDataAndEvents
     * @return {undefined}
     */
    addPostsIncremental : function(deepDataAndEvents) {
      /** @type {null} */
      this.state.nextPassTimeoutId = null;
      this.discardRenderProgressIfClearDomRequested();
      var which = this.getPostModelsForThePass();
      if (which.length) {
        this.renderPass(which, deepDataAndEvents);
      }
      this.finishPass(which);
      this.scheduleNextPass();
    },
    /**
     * @return {undefined}
     */
    discardRenderProgressIfClearDomRequested : function() {
      if (this.postsShouldClearDom) {
        /** @type {boolean} */
        this.state.clearDomAfterRender = true;
        /** @type {boolean} */
        this.postsShouldClearDom = false;
        /** @type {Array} */
        this.state.renderedPosts = [];
      }
    },
    /**
     * @return {?}
     */
    getPostModelsForThePass : function() {
      return this.postsToAppend.length ? this.postsToAppend : this.postsToPrepend;
    },
    /**
     * @param {Array} callback
     * @param {Array} deepDataAndEvents
     * @return {undefined}
     */
    renderPass : function(callback, deepDataAndEvents) {
      var which = options.TARGET_PROCESS_TIME;
      var idx = deepDataAndEvents || (this.calculatePostsForNextRun(which) || options.MINIMUM_POSTS_PER_RUN);
      for (;idx > 0;) {
        var data = callback.splice(0, idx);
        var newState = this.timedRenderPosts(data);
        if (null === newState) {
          break;
        }
        which -= newState;
        idx = this.calculatePostsForNextRun(which);
      }
    },
    /**
     * @param {Array} results
     * @return {?}
     */
    timedRenderPosts : function(results) {
      if (!results.length) {
        return null;
      }
      /** @type {number} */
      var start = Number(new Date);
      Array.prototype.push.apply(this.state.renderedPosts, _.map(results, this.createPostView, this));
      /** @type {number} */
      var duration = Number(new Date) - start;
      return 0 > duration && (duration = 0), this.state.totalElapsedTime += duration, this.state.totalPostsProcessed += results.length, duration || null;
    },
    /**
     * @param {Object} item
     * @return {?}
     */
    createPostView : function(item) {
      var topPanel;
      var klass = item.get("parent");
      if (klass) {
        klass = this.posts.get(klass);
        topPanel = klass && this.getPostView(klass.cid);
      }
      var ret = new Collection({
        parent : topPanel,
        model : item,
        thread : this.thread,
        session : this.session,
        created : item.created,
        userSuggestions : this.userSuggestions
      });
      return this.subViews[item.cid] = ret, ret.render(), ret;
    },
    /**
     * @param {?} object
     * @return {?}
     */
    calculatePostsForNextRun : function(object) {
      return 0 >= object ? 0 : this.state.totalElapsedTime <= 0 ? this.state.totalPostsProcessed : Math.floor(object * this.state.totalPostsProcessed / this.state.totalElapsedTime);
    },
    /**
     * @param {Array} object
     * @return {undefined}
     */
    finishPass : function(object) {
      if (!object.length) {
        if (this.$postList = $("#post-list"), this.state.clearDomAfterRender && (this.$postList.empty(), this.state.clearDomAfterRender = false), this.state.renderedPosts.length) {
          this.removeOldPostsIfRealtime();
          this.enablePostTracking(this.state.renderedPosts);
          /** @type {boolean} */
          var udataCur = object === this.postsToAppend;
          this.insertPostElements(this.state.renderedPosts, udataCur);
          /** @type {Array} */
          this.state.renderedPosts = [];
        }
        this.$postList.removeClass("loading");
        if (!this.postsToPrepend.length) {
          if (!this.postsToAppend.length) {
            this.trigger("render:end");
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    removeOldPostsIfRealtime : function() {
      var a = _.any(this.state.renderedPosts, function(d) {
        return d.model.get("isRealtime");
      });
      if (a) {
        this.removeOldPosts();
      }
    },
    /**
     * @return {undefined}
     */
    removeOldPosts : function() {
      /** @type {number} */
      var val = _.size(this.subViews) - this.STREAMING_MAX_VISIBLE;
      if (!(0 >= val)) {
        var el;
        var codeSegments = this.posts.sortBy(function(row) {
          return moment(row.get("createdAt")).valueOf();
        });
        /** @type {number} */
        var i = 0;
        /** @type {number} */
        var prev = 0;
        for (;i < codeSegments.length && val >= prev;i++) {
          el = this.getPostView(codeSegments[i].cid);
          if (el) {
            if (0 === el.childrenNode.children().length) {
              this.posts.remove(codeSegments[i]);
              prev += 1;
            }
          }
        }
      }
    },
    /**
     * @param {?} which
     * @return {undefined}
     */
    enablePostTracking : function(which) {
      _.each(which, function(v3) {
        /** @type {boolean} */
        v3.visible = true;
      });
    },
    /**
     * @param {?} json
     * @param {boolean} value
     * @return {undefined}
     */
    insertPostElements : function(json, value) {
      var response = _.groupBy(json, function(result) {
        return Boolean(result.parent);
      });
      _.each(response["true"], function(token) {
        token.parent.attachChild(token);
      });
      var row = _.pluck(response["false"], "$el");
      if (value) {
        this.$postList.append(row);
      } else {
        this.$postList.prepend(row);
      }
    },
    /**
     * @return {undefined}
     */
    scheduleNextPass : function() {
      if (this.postsToPrepend.length || this.postsToAppend.length) {
        var a = this.calculatePostsForNextRun(options.TARGET_FIRST_ATTEMPT_TIME);
        /** @type {number} */
        a = Math.max(a, options.MINIMUM_POSTS_PER_RUN);
        /** @type {number} */
        this.state.nextPassTimeoutId = window.requestAnimationFrame(_.bind(this.addPostsIncremental, this, a));
      }
    }
  });
  return options.TARGET_PROCESS_TIME = 30, options.TARGET_FIRST_ATTEMPT_TIME = Math.floor(0.8 * options.TARGET_PROCESS_TIME), options.MINIMUM_POSTS_PER_RUN = 2, {
    PostCollectionView : options
  };
}), define("lounge/views/onboard-alert", ["jquery", "backbone", "remote/config", "common/collections", "common/utils", "common/templates"], function(dataAndEvents, Backbone, deepDataAndEvents, ignoreMethodDoesntExist, that, sass) {
  var params = Backbone.View.extend({
    events : {
      "click [data-action=close]" : "handleClose",
      "click [data-action=show-home]" : "handleShowHome"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.session.isLoggedIn() && (this.shouldShow() && (this.$el.html(sass.render("onboard", {
        displayedSection : this.session.user.isEditable(this.session) ? "complete-profile" : "follow",
        showHome : this.getCookie() === params.COOKIE_HOME
      })), this.trigger("uiAction:onboardAlertShow"))), this;
    },
    /**
     * @return {?}
     */
    shouldShow : function() {
      var value = this.getCookie();
      return value ? value === params.COOKIE_NEW_USER || (value === params.COOKIE_POPUP || value === params.COOKIE_HOME) : false;
    },
    /**
     * @return {?}
     */
    shouldPopup : function() {
      var value = this.getCookie();
      return value ? value === params.COOKIE_NEW_USER : false;
    },
    /**
     * @return {?}
     */
    getCookie : function() {
      return that.cookies.read(params.COOKIE_NAME);
    },
    /**
     * @return {undefined}
     */
    setInitialCookie : function() {
      if (this.session.user.get("joinedRecently")) {
        this.createCookie(params.COOKIE_NEW_USER);
      }
    },
    /**
     * @param {?} name
     * @return {undefined}
     */
    createCookie : function(name) {
      that.cookies.create(params.COOKIE_NAME, name, {
        expiresIn : 2592E6
      });
    },
    /**
     * @return {undefined}
     */
    setPopupCookie : function() {
      if (this.shouldPopup()) {
        this.createCookie(params.COOKIE_POPUP);
      }
    },
    /**
     * @return {undefined}
     */
    showHomeMessage : function() {
      this.createCookie(params.COOKIE_HOME);
      this.render();
    },
    /**
     * @return {undefined}
     */
    eraseCookie : function() {
      that.cookies.erase(params.COOKIE_NAME);
    },
    /**
     * @return {undefined}
     */
    handleShowHome : function() {
      this.remove();
    },
    /**
     * @param {?} types
     * @return {undefined}
     */
    handleClose : function(types) {
      types.preventDefault();
      this.remove();
      this.trigger("uiAction:onboardAlertDismiss");
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      this.eraseCookie();
      /** @type {null} */
      this.session = null;
      Backbone.View.prototype.remove.call(this);
    }
  }, {
    COOKIE_NAME : "reflect.onboarding",
    COOKIE_NEW_USER : "newUser",
    COOKIE_POPUP : "popup",
    COOKIE_HOME : "home"
  });
  return{
    OnboardAlert : params
  };
}), define("lounge/views/notification-menu", ["jquery", "underscore", "backbone", "stance", "core/api", "core/bus", "remote/config", "shared/corefuncs", "common/templates", "common/urls", "common/utils"], function($, element, Backbone, next, dataAndEvents, handle, deepDataAndEvents, ignoreMethodDoesntExist, sass, textAlt, monitor) {
  var NotificationMenuView = Backbone.View.extend({
    events : {
      "click [data-action=home]" : "handleShowHome"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      var readyList = $.Deferred();
      this.listenToOnce(next(this), "enter", function() {
        readyList.resolveWith(this);
      });
      var handler = this.session = req.session;
      this.forum = req.forum;
      /** @type {string} */
      this.language = document.documentElement.lang;
      this.listenTo(handler, "change:id", this.render);
      this.listenTo(handler, "change:notificationCount", this.updateCount);
      this.listenTo(handler, "change:id", function() {
        readyList.done(element.bind(handler.fetchNotificationCount, handler));
        readyList.done(this.preloadSidebar);
      });
      this.listenTo(this, {
        "sidebar:open:start" : this.startLoadingAnimation,
        "sidebar:open:done" : this.stopLoadingAnimation
      });
    },
    /**
     * @return {undefined}
     */
    startLoadingAnimation : function() {
      this.$el.addClass("notification-loading");
    },
    /**
     * @return {undefined}
     */
    stopLoadingAnimation : function() {
      this.$el.removeClass("notification-loading");
    },
    /**
     * @return {undefined}
     */
    preloadSidebar : function() {
      handle.trigger("sidebar:preload");
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.forum.get("settings").ssoRequired && this.session.isLoggedOut() ? void this.$el.hide() : (this.$el.html(sass.render("notificationMenu", {})), this.updateCount(), this.$el.show(), this);
    },
    /**
     * @param {Event} evt
     * @return {undefined}
     */
    handleShowHome : function(evt) {
      if (this.session.set("notificationCount", 0), !monitor.willOpenNewWindow(evt)) {
        evt.preventDefault();
        var data = $(evt.currentTarget).attr("data-home-path");
        handle.trigger("sidebar:open", data, this);
      }
    },
    /**
     * @return {undefined}
     */
    updateCount : function() {
      var response = this.session.get("notificationCount") || 0;
      if (response > 0) {
        this.$("[data-role=notification-count]").html(response > 9 ? '9<i class="icon icon-plus"></i>' : response);
        this.$el.addClass("unread");
      } else {
        this.$("[data-role=notification-count]").html("");
        this.$el.removeClass("unread");
      }
    }
  });
  return{
    NotificationMenuView : NotificationMenuView
  };
}), define("lounge/views/highlighted-post", ["backbone", "underscore", "jquery", "core/UniqueModel", "common/models", "common/templates", "lounge/views/post"], function(Backbone, _, $, Type, exports, templateEngine, Router) {
  var HighlightedPostView = Backbone.View.extend({
    template : "highlightedPost",
    itemViewContainer : ".post-list",
    /**
     * @param {string} options
     * @return {undefined}
     */
    initialize : function(options) {
      _.extend(this, _.pick(options, ["thread", "session", "userSuggestions"]));
      this.listenTo(this.thread, "change:highlightedPost", this.reset);
    },
    /**
     * @return {?}
     */
    getPost : function() {
      return this.post ? $.Deferred().resolve(this.post) : this.getHighlightedPost();
    },
    /**
     * @return {?}
     */
    _getHighlightedPost : function() {
      var object = this.thread.get("highlightedPost");
      return object ? (object instanceof exports.Post || (object = new Type(exports.Post, object)), object.get("isDeleted") ? null : object.get("isHighlighted") ? object : null) : null;
    },
    /**
     * @return {?}
     */
    getHighlightedPost : function() {
      var data;
      var logger2sibling1 = this.post = this._getHighlightedPost();
      var self = $.Deferred();
      return logger2sibling1 ? (data = logger2sibling1.getParent()) && !data.author ? exports.Post.fetchContext(data.id, this.thread).always(_.bind(self.resolve, self)) : self.resolve() : self.reject(), self.promise();
    },
    /**
     * @return {undefined}
     */
    reset : function() {
      delete this.post;
      this.getPost().always(_.bind(this.render, this));
    },
    /**
     * @return {?}
     */
    createPostView : function() {
      return this.post ? (new AppView({
        model : this.post,
        thread : this.thread,
        session : this.session,
        userSuggestions : this.userSuggestions,
        excludeAnchor : true
      })).stopListening(this.post.usersTyping) : null;
    },
    /**
     * @return {?}
     */
    render : function() {
      var view = this.createPostView();
      return view ? (view.render(), this.$el.html(templateEngine.render(this.template)), this.$(this.itemViewContainer).append(view.el), this.$el.show(), this) : (this.$el.hide(), this);
    }
  });
  var AppView = Router.extend({
    /**
     * @return {?}
     */
    getPostAttributes : function() {
      var props = Router.prototype.getPostAttributes.apply(this, arguments);
      return props.canBeRepliedTo = false, props;
    },
    /**
     * @return {?}
     */
    getStateByline : function() {
      return false;
    }
  });
  return{
    HighlightedPostView : HighlightedPostView,
    FeaturedPostView : AppView
  };
}), define("lounge/views/realtime", ["underscore", "backbone", "core/utils", "common/templates", "lounge/common"], function(changes, Backbone, dataAndEvents, res, deepDataAndEvents) {
  var throttledUpdate = dataAndEvents.preventDefaultHandler;
  var BaseView = Backbone.View.extend({
    events : {
      click : "handleDrain"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      /** @type {Object} */
      this.options = options;
    },
    /**
     * @param {?} target
     * @return {?}
     */
    getDirection : function(target) {
      if (this.offset && this.dim) {
        var t = target.pageOffset;
        var b = t + target.height;
        var a = this.offset.top + target.frameOffset.top;
        var d = a + this.dim.height;
        return t > d ? 1 : a > b ? -1 : 0;
      }
    },
    /**
     * @param {?} val
     * @return {undefined}
     */
    setCount : function(val) {
      this.options.count = val;
    },
    /**
     * @return {?}
     */
    render : function() {
      return 0 === this.options.count ? void this.$el.hide() : (this.$el.html(res.render("realtimeCommentNotification", {
        comments : this.options.count
      })), this.listenTo(deepDataAndEvents.getLounge(), "domReflow", changes.throttle(function() {
        if (0 !== this.options.count) {
          this.offset = this.$el.offset();
          this.dim = {
            height : this.$el.height(),
            width : this.$el.width()
          };
        }
      }, 400)), this.$el.show(), this);
    },
    handleDrain : throttledUpdate(function() {
      this.model.queue.drain();
      this.setCount(this.model.queue.counters.comments);
      this.render();
    })
  });
  var QueuedReplyView = BaseView.extend({
    events : {
      click : "handleDrain"
    },
    /**
     * @param {?} target
     * @return {?}
     */
    getDirection : function(target) {
      if (this.options.postView.visible) {
        this.offset = this.options.postView.offset;
        this.dim = this.options.postView.dim;
        var options = BaseView.prototype.getDirection.call(this, target);
        return delete this.offset, delete this.dim, options;
      }
    },
    /**
     * @return {?}
     */
    render : function() {
      var self = this;
      var parser = self.options.postView;
      return 0 === self.options.count ? (self.$el.hide(), void(parser.trackPosition = false)) : (parser.trackPosition = true, parser.calcRect(), self.$el.html(res.render("realtimeReplyNotification", {
        replies : self.options.count
      })), self.$el.show(), void changes.delay(function() {
        self.$el.addClass("reveal");
      }, 13));
    },
    handleDrain : throttledUpdate(function() {
      var id = this.model.id;
      var len = this.options.postView;
      var queue = this.options.thread.queue;
      queue.drain(id);
      this.setCount(queue.counters.replies[id]);
      /** @type {boolean} */
      len.trackPosition = false;
      this.render();
    })
  });
  return{
    QueuedPostView : BaseView,
    QueuedReplyView : QueuedReplyView
  };
}), define("lounge/views/posts/UserSuggestionsManager", ["underscore", "jquery", "backbone", "common/collections"], function(_, d, deepDataAndEvents, dataAndEvents) {
  /**
   * @return {undefined}
   */
  function EA() {
    /** @type {Array} */
    this.remotes = [];
  }
  return _.extend(EA.prototype, {
    /**
     * @return {?}
     */
    fetch : function() {
      return this._fetchPromise || (this._fetchPromise = d.when.apply(d, _.chain(this.remotes).filter(function(newlines) {
        return!newlines.length;
      }).map(function(collection) {
        return collection.fetch();
      }).value())), this._fetchPromise;
    },
    /**
     * @param {?} spaceName
     * @return {undefined}
     */
    addRemote : function(spaceName) {
      this.remotes.push(spaceName);
    },
    /**
     * @return {?}
     */
    all : function() {
      var previous = new dataAndEvents.UserCollection;
      return previous.add(_.chain(this.remotes).pluck("models").flatten().value()), previous;
    },
    /**
     * @param {string} obj
     * @param {Object} col
     * @return {?}
     */
    find : function(obj, col) {
      if (obj && obj.length) {
        var model;
        /** @type {RegExp} */
        var regexp = new RegExp(obj.join(" ").replace(/[^\w\s]/, ""), "i");
        /** @type {number} */
        var length = 5;
        var result = this.all();
        /** @type {Array} */
        var results = [];
        /** @type {number} */
        var index = 0;
        /** @type {Function} */
        var success = 1 === obj.length && "" === obj[0] ? function() {
          return true;
        } : function(model) {
          return regexp.test(model.get("name")) || regexp.test(model.get("username"));
        };
        /** @type {number} */
        index = 0;
        for (;index < result.models.length && results.length < length;index++) {
          model = result.models[index];
          if (!model.get("isAnonymous")) {
            if (!col.get(model.cid)) {
              if (success(model)) {
                results.push(model);
              }
            }
          }
        }
        return results;
      }
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return this.all().get(name);
    }
  }), EA;
}), define("lounge/views/viglink", ["jquery", "underscore", "backbone", "core/bus"], function($, _, Backbone, view) {
  var e = Backbone.Model.extend({
    /**
     * @param {string} options
     * @return {undefined}
     */
    initialize : function(options) {
      this.handlers = {};
      this.listenTo(view.frame, "viglink:getaffiliatelink:response", this.handleViglinkResponse);
      view.frame.sendHostMessage("viglink:init", {
        clientUrl : options.linkAffiliatorClient,
        apiUrl : options.linkAffiliatorAPI,
        key : options.viglinkAPI,
        id : options.forumPk
      });
    },
    /**
     * @param {Object} defs
     * @return {undefined}
     */
    handleViglinkResponse : function(defs) {
      defs = defs || {};
      var MAP = this.handlers[defs.linkId];
      if (MAP) {
        MAP(defs);
      }
    },
    /**
     * @param {Event} completeEvent
     * @param {HTMLElement} link
     * @return {?}
     */
    fetchAffiliateLink : function(completeEvent, link) {
      var invokeDfd = $.Deferred();
      if (!this.shouldFetchAffiliateLink(completeEvent)) {
        return invokeDfd.resolve();
      }
      var guid = _.uniqueId("viglink_");
      return view.frame.sendHostMessage("viglink:getaffiliatelink", {
        linkId : guid,
        url : link[0].href
      }), this.handlers[guid] = function(data) {
        data = data || {};
        if (data.url) {
          link.attr("href", data.url);
        }
        invokeDfd.resolve();
      }, invokeDfd.promise();
    },
    /**
     * @param {Event} e
     * @return {?}
     */
    shouldFetchAffiliateLink : function(e) {
      if ("_blank" === e.currentTarget.getAttribute("target")) {
        return false;
      }
      var _isFocused = e.ctrlKey || (e.metaKey || (e.altKey || e.shiftKey));
      var _tryInitOnFocus = e.which && 1 === e.which || 0 === e.button;
      return _isFocused || !_tryInitOnFocus ? false : "nofollow" !== e.currentTarget.getAttribute("rel") ? false : true;
    }
  });
  return e;
}), define("lounge/views/sidebar", ["jquery", "underscore", "backbone", "modernizr", "core/bus", "remote/config", "shared/corefuncs", "shared/urls", "core/utils", "common/views/mixins"], function(deepDataAndEvents, cb, Backbone, dataAndEvents, collection, ignoreMethodDoesntExist, element, response, rootWindow) {
  var j = Backbone.View.extend({
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.forum = req.forum;
      this.session = req.session;
      /** @type {string} */
      this.language = document.documentElement.lang;
      if ("en" === this.language) {
        this.language = void 0;
      }
      this.listenTo(this.session, "change:id", this.destroyHome);
      this.listenTo(collection, {
        "sidebar:open" : this.open,
        "sidebar:preload" : this.preload
      });
      /** @type {boolean} */
      this.iframeAlive = true;
      this.listenToOnce(collection.frame, "home.timeout", this.handleTimeout);
    },
    /**
     * @return {?}
     */
    isIE9 : function() {
      return 9 === document.documentMode;
    },
    /**
     * @return {?}
     */
    shouldUseIframe : function() {
      if (this.isIE9() && !this.session.isSSO()) {
        return false;
      }
      if (!this.iframeAlive) {
        return false;
      }
      var val = rootWindow.isMobileUserAgent();
      return!val || val && this.session.isSSO();
    },
    /**
     * @return {undefined}
     */
    handleTimeout : function() {
      /** @type {boolean} */
      this.iframeAlive = false;
    },
    /**
     * @param {?} method
     * @param {Object} fn
     * @return {undefined}
     */
    open : function(method, fn) {
      if (this.shouldUseIframe()) {
        if (this.storeHomeSession(), collection.frame.sendHostMessage("home.show", {
          path : method,
          language : this.language
        }), fn) {
          fn.trigger("sidebar:open:start");
          var matched = cb.bind(fn.trigger, fn, "sidebar:open:done");
          this.listenToOnce(collection.frame, {
            "home.opened" : matched,
            "home.timeout" : matched
          });
        }
      } else {
        rootWindow.openWindow(element.serialize(response.apps.home + method, {
          l : this.language
        }), "reflecthome");
      }
      collection.trigger("uiAction:openHome");
    },
    /**
     * @return {undefined}
     */
    destroyHome : function() {
      collection.frame.sendHostMessage("home.destroy");
    },
    /**
     * @return {undefined}
     */
    preload : function() {
      if (!this.session.isLoggedOut()) {
        if (this.shouldUseIframe()) {
          this.storeHomeSession();
          collection.frame.sendHostMessage("home.preload", {
            language : this.language
          });
        }
      }
    },
    /**
     * @return {undefined}
     */
    storeHomeSession : function() {
      if (dataAndEvents.sessionstorage) {
        window.sessionStorage.setItem("home.session", JSON.stringify(this.session.user.toJSON()));
      }
    }
  });
  return j;
}), define("lounge/tracking", ["jquery", "underscore", "core/analytics/identity", "core/analytics/jester", "core/bus", "remote/config", "common/intelligence", "common/juggler", "common/urls", "common/utils", "common/main"], function($, _, dataAndEvents, options, Y, wink, stats, res, elem, request, pkg) {
  /**
   * @param {Window} w
   * @param {Object} req
   * @return {undefined}
   */
  function init(w, req) {
    var self = new stats.Intelligence;
    var obj = req.forum;
    var item_select = obj.id;
    var record = obj.get("pk");
    var doc = req.thread;
    var remote = doc.id;
    req.session.on("change:id", function(cmp) {
      options.client.set("user_id", cmp.id);
    });
    req.session.once("change:id", function() {
      var data = this;
      var userID = data.user.id;
      var dnt = request.isDNTEnabled();
      var keys = test.shouldTrack(obj, data.user);
      if (userID) {
        if ("0" !== userID) {
          res.client("jester", true).overwrite({
            user_id : userID
          });
        }
      }
      var params = {
        thread_slug : doc.get("slug"),
        user_type : data.user.get("user_type") || "anon",
        referrer : w.document.referrer,
        theme : "next",
        dnt : dnt ? "1" : "0",
        tracking_enabled : keys ? "1" : "0"
      };
      var result = obj.get("settings");
      if (result) {
        if (_.has(result, "organicDiscoveryEnabled")) {
          _.extend(params, {
            organic_enabled : result.organicDiscoveryEnabled,
            promoted_enabled : result.promotedDiscoveryEnabled,
            max_enabled : result.discoveryMax,
            thumbnails_enabled : result.discoveryThumbnailsEnabled
          });
        }
      }
      res.client("jester", true).emit("init_embed", params);
      if (keys) {
        test.load3rdParties(doc);
      }
      self.init({
        version : "next",
        forum : item_select,
        features : req.initialData.features,
        session : data.user
      });
      req.session.on("change:id", function(doc) {
        self.setSession(doc);
        self.trackEvent(doc.id ? "login" : "logout");
      });
    });
    res.client("jester", true).load({
      url : elem.jester + "/event.js",
      thread : remote,
      forum : item_select,
      forum_id : record,
      imp : dataAndEvents.impression.impId,
      prev_imp : dataAndEvents.impression.prevImp
    });
    options.client.set({
      product : "embed",
      thread : remote,
      thread_id : remote,
      forum : item_select,
      forum_id : record,
      zone : "thread",
      version : pkg.version
    });
    req.once("bootstrap:complete", function() {
      options.client.set({
        page_url : req.config.referrer
      });
      options.client.setHostReferrer(req.config.hostReferrer);
    });
    var EVENT_READY = {
      /**
       * @return {undefined}
       */
      inViewport : function() {
        var cfg = req.config;
        self.trackEvent("view_embed");
        var object = {
          color_scheme : cfg.colorScheme,
          anchor_color : cfg.anchorColor,
          typeface : cfg.typeface,
          width : $(document).width()
        };
        object = _.pick(object, function(i, e) {
          switch(e) {
            case "width":
              return _.isNumber(i);
            default:
              return _.isString(i) && "" !== i;
          }
        });
        options.client.emit({
          verb : "view",
          object_type : "product",
          object_id : "embed",
          extra_data : JSON.stringify(object)
        });
        req.off("inViewport");
      },
      /**
       * @param {Node} $rootElement
       * @return {undefined}
       */
      "uiAction:createPost" : function($rootElement) {
        if (!req.session.user.id) {
          self.setSession("guest");
        }
        self.trackEvent(null != $rootElement.get("parent") ? "post_comment_reply" : "post_comment");
      },
      /**
       * @param {Object} self
       * @param {Object} attributes
       * @return {undefined}
       */
      "uiCallback:postCreated" : function(self, attributes) {
        attributes = attributes || {};
        _.extend(attributes, {
          object_type : "post",
          object_id : self.id,
          verb : "post"
        });
        if (self.has("parent")) {
          /** @type {string} */
          attributes.target_type = "post";
          attributes.target_id = self.get("parent");
        }
        options.client.emit(attributes);
      },
      /**
       * @param {string} dataAndEvents
       * @return {undefined}
       */
      "uiAction:seeMore" : function(dataAndEvents) {
        options.client.emit({
          verb : "open",
          object_type : "section",
          object_id : "thread/page-" + dataAndEvents
        });
      },
      /**
       * @param {Element} ignores
       * @param {Event} express
       * @return {undefined}
       */
      "uiAction:postUpvote" : function(ignores, express) {
        self.trackEvent("like_comment");
        options.client.emit({
          verb : "like",
          object_type : "post",
          object_id : ignores.id,
          area : test.getEventTrackingArea(express)
        });
      },
      /**
       * @param {Element} self
       * @param {Event} express
       * @return {undefined}
       */
      "uiAction:postUnvote" : function(self, express) {
        options.client.emit({
          verb : "unlike",
          object_type : "post",
          object_id : self.id,
          area : test.getEventTrackingArea(express)
        });
      },
      /**
       * @param {Element} ignores
       * @param {Event} express
       * @return {undefined}
       */
      "uiAction:postDownvote" : function(ignores, express) {
        self.trackEvent("dislike_comment");
        options.client.emit({
          verb : "dislike",
          object_type : "post",
          object_id : ignores.id,
          area : test.getEventTrackingArea(express)
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:upvotersCardShow" : function() {
        self.trackEvent("upvoters_card_shown");
      },
      /**
       * @return {undefined}
       */
      "uiAction:showProfileFromUpvotes" : function() {
        self.trackEvent("upvoters_profile_click");
      },
      /**
       * @return {undefined}
       */
      "uiAction:threadUnlike" : function() {
        options.client.emit({
          verb : "unlike",
          object_type : "thread",
          zone : "thread"
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:threadLike" : function() {
        self.trackEvent("like_thread");
        options.client.emit({
          verb : "like",
          object_type : "thread"
        });
      },
      /**
       * @param {Element} ignores
       * @param {string} err
       * @return {undefined}
       */
      "uiAction:postShare" : function(ignores, err) {
        self.trackEvent("share_comment_" + err);
        options.client.emit({
          verb : "share",
          object_type : "post",
          object_id : ignores.id,
          target_type : "service",
          target_id : err
        });
      },
      /**
       * @param {string} err
       * @return {undefined}
       */
      "uiAction:threadShare" : function(err) {
        self.trackEvent("share_thread_" + err);
        options.client.emit({
          verb : "share",
          object_type : "thread",
          target_type : "service",
          target_id : err
        });
      },
      /**
       * @param {Array} r
       * @param {Event} express
       * @return {undefined}
       */
      "uiAction:clickLink" : function(r, express) {
        options.client.emit({
          verb : "click",
          object_type : "link",
          object_id : r[0].href,
          area : test.getEventTrackingArea(express)
        });
      },
      /**
       * @param {Element} ignores
       * @return {undefined}
       */
      "uiAction:followUser" : function(ignores) {
        self.trackEvent("follow_user");
        options.client.emit({
          verb : "follow",
          object_type : "user",
          object_id : ignores.id
        });
      },
      /**
       * @param {Element} self
       * @return {undefined}
       */
      "uiAction:unfollowUser" : function(self) {
        options.client.emit({
          verb : "stop-following",
          object_type : "user",
          object_id : self.id
        });
      },
      /**
       * @param {string} err
       * @return {undefined}
       */
      "uiAction:openLogin" : function(err) {
        self.trackEvent("open_login_" + err);
        options.client.emit({
          verb : "open",
          object_type : "login",
          object_id : err
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:finishRegistrationEmbed" : function() {
        self.trackEvent("finish_registration_embed");
      },
      /**
       * @return {undefined}
       */
      "uiAction:finishRegistrationWindow" : function() {
        self.trackEvent("finish_registration_window");
      },
      /**
       * @return {undefined}
       */
      "uiAction:finishAccountComplete" : function() {
        self.trackEvent("finish_account_complete");
      },
      /**
       * @return {undefined}
       */
      "uiAction:onboardAlertShow" : function() {
        options.client.emit({
          verb : "view",
          object_type : "area",
          object_id : "onboard_alert"
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:onboardOpen" : function() {
        options.client.emit({
          verb : "open",
          object_type : "zone",
          object_id : "onboard"
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:onboardAlertDismiss" : function() {
        options.client.emit({
          verb : "close",
          object_type : "area",
          object_id : "onboard_alert"
        });
      },
      /**
       * @return {undefined}
       */
      "uiAction:openHome" : function() {
        options.client.emit({
          verb : "open",
          object_type : "product",
          object_id : "bridge"
        });
      },
      /**
       * @param {string} dataAndEvents
       * @param {?} deepDataAndEvents
       * @return {undefined}
       */
      viewActivity : function(dataAndEvents, deepDataAndEvents) {
        var attributes = {
          verb : "view",
          object_type : dataAndEvents,
          object_id : deepDataAndEvents
        };
        options.client.emit(attributes);
      }
    };
    req.on(EVENT_READY);
    Y.on(EVENT_READY);
  }
  var test = {};
  return test.init = function(options) {
    init(window, options);
  }, test.getEventTrackingArea = function(expr) {
    return $(expr.currentTarget).closest("[data-tracking-area]").attr("data-tracking-area");
  }, test.load3rdParties = function(evt) {
    if (elem.glitter) {
      var iframe_limit = wink.lounge.tracking || {};
      var e = iframe_limit.iframe_limit || 0;
      $.ajax({
        dataType : "jsonp",
        cache : true,
        url : elem.glitter,
        data : {
          forum_shortname : evt.forum.id,
          thread_id : evt.id
        },
        jsonpCallback : "refGlitterResponseHandler",
        /**
         * @param {?} events
         * @return {undefined}
         */
        success : function(events) {
          var div = $("body");
          _.each(events, function(entry) {
            if ("img" === entry.type || "iframe" === entry.type) {
              if (!("iframe" === entry.type && --e < 0)) {
                div.append($("<" + entry.type + ">").hide().attr("src", entry.url));
              }
            }
          });
        }
      });
    }
  }, test.shouldTrack = function(lock, $templateCache) {
    return!(lock && lock.get("settings").disable3rdPartyTrackers || ($templateCache && $templateCache.get("disable3rdPartyTrackers") || ("1" === request.cookies.read("reflect_tracking_optout") || request.isDNTEnabled())));
  }, test;
}), define("templates/lounge", ["handlebars"], function(_) {
  return _.template({
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    1 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var out = '<div class="follow-btn-wrap">\n';
      return data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isSession : data, {
        name : "if",
        hash : {},
        fn : this.program(2, context),
        inverse : this.program(5, context),
        data : context
      }), null != data && (out += data), out + "</div>\n";
    },
    /**
     * @param {Object} parent
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    2 : function(parent, helpers, dataAndEvents, task) {
      var obj;
      /** @type {string} */
      var optsData = "";
      return obj = helpers["if"].call(parent, null != (obj = null != parent ? parent.user : parent) ? obj.isEditable : obj, {
        name : "if",
        hash : {},
        fn : this.program(3, task),
        inverse : this.noop,
        data : task
      }), null != obj && (optsData += obj), optsData + "\n";
    },
    /**
     * @param {Object} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    3 : function(node, testEnvironment, dataAndEvents, task) {
      var str;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      return'<a href="' + each(lambda(null != (str = null != node ? node.user : node) ? str.profileUrl : str, node)) + '" data-action="edit-profile" target="_blank" class="btn follow-btn edit-profile">' + each(testEnvironment.gettext.call(node, "Edit profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    5 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isPrivate : data, {
        name : "if",
        hash : {},
        fn : this.program(6, context),
        inverse : this.program(8, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    6 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="btn follow-btn private">\n<i aria-hidden="true" class="icon-lock"></i>\n<span class="btn-text">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Private", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</span>\n</span>\n";
    },
    /**
     * @param {string} depth0
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    8 : function(depth0, helpers, dataAndEvents, task) {
      var stack1;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var buffer = '<a href="' + escapeExpression(lambda(null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.profileUrl : stack1, depth0)) + '" class="btn follow-btn ';
      return stack1 = helpers["if"].call(depth0, null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.isFollowing : stack1, {
        name : "if",
        hash : {},
        fn : this.program(9, task),
        inverse : this.noop,
        data : task
      }), null != stack1 && (buffer += stack1), buffer + '" data-action="follow-user" data-user="' + escapeExpression(lambda(null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.id : stack1, depth0)) + '">\n<span class="btn-text following-text">' + escapeExpression(helpers.gettext.call(depth0, "Following", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n<span class="btn-text follow-text">' + escapeExpression(helpers.gettext.call(depth0, "Follow", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n<i aria-hidden="true" class="icon-plus"></i> \n<i aria-hidden="true" class="icon-checkmark"></i>\n</a>\n';
    },
    /**
     * @return {?}
     */
    9 : function() {
      return "following";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    11 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<div class="vote-action tooltip">\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "You must sign in to down-vote this post.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</div>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    13 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<div class="vote-action tooltip">\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "You must sign in to up-vote this post.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</div>\n";
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    15 : function(object, helpers, dataAndEvents, task) {
      var data;
      var expect = this.escapeExpression;
      var $ = this.lambda;
      /** @type {string} */
      var out = "<h5>" + expect(helpers.gettext.call(object, "Add to blacklist", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h5>\n\n";
      return data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(16, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '\n<label><input type="checkbox" name="email" value="' + expect($(null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.email : data, object)) + '"> ' + expect(helpers.gettext.call(object, "Email", {
        name : "gettext",
        hash : {},
        data : task
      })) + ": " + expect($(null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.email : data, object)) + '</label>\n\n<label><input type="checkbox" name="ip" value="' + expect($(null != (data = null != object ? object.post : object) ? data.ipAddress : data, object)) + '"> ' + expect(helpers.gettext.call(object, "IP Address", {
        name : "gettext",
        hash : {},
        data : task
      })) + ": " + expect($(null != (data = null != object ? object.post : object) ? data.ipAddress : data, object)) + '</label>\n\n<label><input type="checkbox" name="retroactive" value="1"/> ' + expect(helpers.gettext.call(object, "Apply retroactively", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</label>\n\n<div class="actions">\n<button class="btn btn-small" type="submit">' + expect(helpers.gettext.call(object, "Save", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</button>\n<button class="btn btn-small" data-action="cancel">' + expect(helpers.gettext.call(object, "Cancel", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n</div>\n";
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    16 : function(t, testEnvironment, dataAndEvents, task) {
      var object;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<label><input type="checkbox" name="user" value="' + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.id : object, t)) + '" checked="checked"/> ' + escapeExpression(testEnvironment.gettext.call(t, "User", {
        name : "gettext",
        hash : {},
        data : task
      })) + ": " + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.username : object, t)) + "</label>\n";
    },
    /**
     * @param {string} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    18 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "We are unable to post your comment because you have been blocked by %(forumName)s.", {
        name : "gettext",
        hash : {
          forumName : null != next_scope ? next_scope.forumName : next_scope
        },
        data : task
      })) + '\n<a target="_blank" href="https://help.disqus.com/customer/portal/articles/466223-who-deleted-or-removed-my-comment-">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Find out more.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    20 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return "<strong>" + escapeExpression(lambda(null != t ? t.name : t, t)) + "</strong>\n";
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    22 : function(object, helpers, dataAndEvents, context) {
      var data;
      var $ = this.lambda;
      var expect = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="tooltip">\n<div class="notch"></div>\n\n';
      return data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isAnonymous : data, {
        name : "if",
        hash : {},
        fn : this.program(23, context),
        inverse : this.program(25, context),
        data : context
      }), null != data && (out += data), out += '\n<img src="' + expect($(null != (data = null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.avatar : data) ? data.cache : data, object)) + '" class="user" alt="' + expect(helpers.gettext.call(object, "Avatar", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" />\n\n', data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isAnonymous : data, {
        name : "if",
        hash : {},
        fn : this.program(27, context),
        inverse : this.program(29, context),
        data : context
      }), null != data && (out += data), out += '\n<div class="content">\n<h3>\n', data = helpers.unless.call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isAnonymous : data, {
        name : "unless",
        hash : {},
        fn : this.program(31, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += "\n<h3>" + expect($(null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.name : data, object)) + "</h3>\n\n", data = helpers.unless.call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isAnonymous : data, {
        name : "unless",
        hash : {},
        fn : this.program(29, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out + "</h3>\n\n<p>" + expect($(null != (data = null != object ? object.post : object) ? data.excerpt : data, object)) + "</p>\n</div>\n</div>\n";
    },
    /**
     * @return {?}
     */
    23 : function() {
      return'<div class="avatar">\n';
    },
    /**
     * @param {string} t
     * @return {?}
     */
    25 : function(t) {
      var object;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.profileUrl : object, t)) + '" class="avatar" data-action="profile" data-username="' + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.username : object, t)) + '">\n';
    },
    /**
     * @return {?}
     */
    27 : function() {
      return "</div>\n";
    },
    /**
     * @return {?}
     */
    29 : function() {
      return "</a>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    31 : function(t) {
      var object;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.profileUrl : object, t)) + '" data-action="profile" data-username="' + escapeExpression(lambda(null != (object = null != (object = null != t ? t.post : t) ? object.author : object) ? object.username : object, t)) + '">\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    33 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<div class="textarea-wrapper" data-role="textarea">\n<div class="post-actions">\n<div class="logged-in">\n<section>\n<div class="temp-post">\n<button class="btn" type="submit">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Save Edit", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</button>\n<a class="cancel" href="#" data-action="edit">\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "Cancel", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</a>\n</div>\n</section>\n</div>\n</div>\n</div>\n";
    },
    /**
     * @param {string} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    35 : function(node, testEnvironment, dataAndEvents, task) {
      var result;
      var each = this.escapeExpression;
      var lambda = this.lambda;
      return each(testEnvironment.gettext.call(node, "%(forumName)s requires you to verify your email address before posting.", {
        name : "gettext",
        hash : {
          forumName : null != node ? node.forumName : node
        },
        data : task
      })) + '\n<a data-action="verify-email" data-forum="' + each(lambda(null != node ? node.forumId : node, node)) + '" title="' + each(testEnvironment.gettext.call(node, "Verify Email", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" href="/verify">\n' + each(testEnvironment.gettext.call(node, "Send verification email to %(email)s", {
        name : "gettext",
        hash : {
          email : null != (result = null != node ? node.user : node) ? result.email : result
        },
        data : task
      })) + "\n</a>\n";
    },
    /**
     * @param {Object} parent
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    37 : function(parent, helpers, dataAndEvents, context) {
      var obj;
      /** @type {string} */
      var optsData = "";
      return obj = helpers["if"].call(parent, null != (obj = null != parent ? parent.user : parent) ? obj.isSession : obj, {
        name : "if",
        hash : {},
        fn : this.program(38, context),
        inverse : this.program(44, context),
        data : context
      }), null != obj && (optsData += obj), optsData;
    },
    /**
     * @param {Object} parent
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    38 : function(parent, helpers, dataAndEvents, task) {
      var obj;
      /** @type {string} */
      var optsData = "";
      return obj = helpers["if"].call(parent, null != (obj = null != parent ? parent.user : parent) ? obj.isEditable : obj, {
        name : "if",
        hash : {},
        fn : this.program(39, task),
        inverse : this.noop,
        data : task
      }), null != obj && (optsData += obj), optsData;
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    39 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<a href="' + getAll(helpers.urlfor.call(elem, "editProfile", {
        name : "urlfor",
        hash : {},
        data : context
      })) + '"\ntarget="_blank"\nclass="\n';
      return data = helpers["if"].call(elem, null != elem ? elem.buttonAsLink : elem, {
        name : "if",
        hash : {},
        fn : this.program(40, context),
        inverse : this.program(42, context),
        data : context
      }), null != data && (out += data), out + '">\n' + getAll(helpers.gettext.call(elem, "Edit profile", {
        name : "gettext",
        hash : {},
        data : context
      })) + "\n</a>\n";
    },
    /**
     * @return {?}
     */
    40 : function() {
      return "publisher-anchor-color follow-link\n";
    },
    /**
     * @return {?}
     */
    42 : function() {
      return "btn btn-small\n";
    },
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    44 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isPrivate : data, {
        name : "if",
        hash : {},
        fn : this.program(45, context),
        inverse : this.program(47, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    45 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span\nclass="btn btn-small follow-btn private">\n<i aria-hidden="true" class="icon-lock"></i>\n<span class="btn-text">\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "Private", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</span>\n</span>\n";
    },
    /**
     * @param {string} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    47 : function(node, helpers, dataAndEvents, context) {
      var n;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      /** @type {string} */
      var sum = '<a href="' + each(lambda(null != (n = null != node ? node.user : node) ? n.profileUrl : n, node)) + '" class="\n';
      return n = helpers["if"].call(node, null != node ? node.buttonAsLink : node, {
        name : "if",
        hash : {},
        fn : this.program(40, context),
        inverse : this.program(48, context),
        data : context
      }), null != n && (sum += n), n = helpers["if"].call(node, null != (n = null != node ? node.user : node) ? n.isFollowing : n, {
        name : "if",
        hash : {},
        fn : this.program(9, context),
        inverse : this.noop,
        data : context
      }), null != n && (sum += n), sum + '"\ndata-action="toggleFollow"\ndata-user="' + each(lambda(null != (n = null != node ? node.user : node) ? n.id : n, node)) + '">\n<span class="btn-text following-text">' + each(helpers.gettext.call(node, "Following", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</span>\n<span class="btn-text follow-text">' + each(helpers.gettext.call(node, "Follow", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</span>\n<i aria-hidden="true" class="icon-checkmark"></i>\n</a>\n';
    },
    /**
     * @return {?}
     */
    48 : function() {
      return "btn btn-small follow-btn\n";
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    50 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span data-username="' + escapeExpression(lambda(null != t ? t.username : t, t)) + '" data-role="username">' + escapeExpression(lambda(null != t ? t.name : t, t)) + "</span>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    52 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '\n<div class="postbox">\n<div role="alert"></div>\n<div class="avatar">\n';
      return data = helpers["if"].call(elem, null != (data = null != elem ? elem.user : elem) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(53, context),
        inverse : this.program(55, context),
        data : context
      }), null != data && (out += data), out += '</div>\n\n<div class="textarea-wrapper" data-role="textarea" dir="auto">\n<div data-role="drag-drop-placeholder" class="media-drag-hover" style="display: none">\n<div class="drag-text">\n&#11015; ' + getAll(helpers.gettext.call(elem, "Drag and drop your images here to upload them.", {
        name : "gettext",
        hash : {},
        data : context
      })) + "\n</div>\n</div>\n", data = helpers["if"].call(elem, null != elem ? elem.displayMediaPreviews : elem, {
        name : "if",
        hash : {},
        fn : this.program(57, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '<div class="edit-alert" role="postbox-alert"></div>\n<div class="post-actions">\n<ul class="wysiwyg">\n', data = helpers["if"].call(elem, null != elem ? elem.displayMediaUploadButton : elem, {
        name : "if",
        hash : {},
        fn : this.program(59, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += "</ul>\n", data = helpers["if"].call(elem, null != (data = null != elem ? elem.user : elem) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(61, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out + '</div>\n</div>\n\n<div data-role="login-form"></div>\n</div>\n';
    },
    /**
     * @param {string} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    53 : function(node, testEnvironment, dataAndEvents, task) {
      var p;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      return'<a href="' + each(lambda(null != (p = null != node ? node.user : node) ? p.profileUrl : p, node)) + '" class="user" data-action="profile" data-username="' + each(lambda(null != (p = null != node ? node.user : node) ? p.username : p, node)) + '">\n<img data-role="user-avatar" data-user="' + each(lambda(null != (p = null != node ? node.user : node) ? p.id : p, node)) + '" src="' + each(lambda(null != (p = null != (p = null != node ? node.user : node) ? p.avatar : p) ? p.cache : p, node)) + 
      '" alt="' + each(testEnvironment.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n</a>\n';
    },
    /**
     * @param {Object} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    55 : function(node, testEnvironment, dataAndEvents, task) {
      var context;
      var f = this.lambda;
      var expect = this.escapeExpression;
      return'<span class="user">\n<img data-role="user-avatar" src="' + expect(f(null != (context = null != (context = null != node ? node.user : node) ? context.avatar : context) ? context.cache : context, node)) + '" alt="' + expect(testEnvironment.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n</span>\n';
    },
    /**
     * @return {?}
     */
    57 : function() {
      return'<div class="media-preview empty" data-role="media-preview"></div>\n';
    },
    /**
     * @return {?}
     */
    59 : function() {
      return'<li data-role="media-uploader"></li>\n';
    },
    /**
     * @param {string} elem
     * @param {?} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    61 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers.unless.call(elem, null != elem ? elem.audienceSyncRequired : elem, {
        name : "unless",
        hash : {},
        fn : this.program(62, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {Object} elem
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    62 : function(elem, testEnvironment, dataAndEvents, task) {
      var getAll = this.escapeExpression;
      return'<div class="logged-in">\n<section>\n<div class="temp-post" style="text-align: right">\n<button class="btn">\n' + getAll(testEnvironment.gettext.call(elem, "Post as %(name)s", {
        name : "gettext",
        hash : {
          name : testEnvironment.getPartial.call(elem, "formUser", null != elem ? elem.user : elem, {
            name : "getPartial",
            hash : {},
            data : task
          })
        },
        data : task
      })) + "\n</button>\n</div>\n</section>\n</div>\n";
    },
    /**
     * @param {Object} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    64 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(elem, null != (data = null != elem ? elem.user : elem) ? data.isAnonymous : data, {
        name : "if",
        hash : {},
        fn : this.program(65, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer += "\n", data = helpers["if"].call(elem, null != elem ? elem.audienceSyncRequired : elem, {
        name : "if",
        hash : {},
        fn : this.program(67, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} _super
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    65 : function(next_scope, _super, deepDataAndEvents, task) {
      var chunk;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var d = '<section class="auth-section logged-out">\n<div class="connect">\n<h6>' + escapeExpression(_super.gettext.call(next_scope, "Log in with", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h6>\n";
      return chunk = this.invokePartial(deepDataAndEvents.loginButtons, "", "loginButtons", next_scope, void 0, _super, deepDataAndEvents, task), null != chunk && (d += chunk), d += "</div>\n", chunk = this.invokePartial(deepDataAndEvents.guestForm, "", "guestForm", next_scope, void 0, _super, deepDataAndEvents, task), null != chunk && (d += chunk), d + "</section>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    67 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var chunk;
      /** @type {string} */
      var d = '<section class="auth-section">\n';
      return chunk = this.invokePartial(deepDataAndEvents.audienceSync, "", "audienceSync", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != chunk && (d += chunk), d + "</section>\n";
    },
    /**
     * @param {string} ev
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    69 : function(ev, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<ul data-role="login-menu" class="services login-buttons">\n\n';
      return data = helpers["if"].call(ev, null != (data = null != ev ? ev.sso : ev) ? data.url : data, {
        name : "if",
        hash : {},
        fn : this.program(70, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '\n<li class="auth-reflect">\n<button type="button" data-action="auth:reflect" title="Reflect"><i class="icon-reflect"></i></button>\n</li>\n<li class="auth-facebook">\n<button type="button" data-action="auth:facebook" title="Facebook"><i class="icon-facebook-circle"></i></button>\n</li>\n<li class="auth-twitter">\n<button type="button" data-action="auth:twitter" title="Twitter"><i class="icon-twitter-circle"></i></button>\n</li>\n<li class="auth-google">\n<button type="button" data-action="auth:google" title="Google"><i class="icon-google-plus-circle"></i></button>\n</li>\n</ul>\n';
    },
    /**
     * @param {string} t
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    70 : function(t, helpers, dataAndEvents, context) {
      var value;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var sum = '<li class="sso">\n<button type="button" data-action="auth:sso"\ntitle="' + escapeExpression(lambda(null != (value = null != t ? t.sso : t) ? value.name : value, t)) + '"\nclass="';
      return value = helpers["if"].call(t, null != (value = null != t ? t.sso : t) ? value.button : value, {
        name : "if",
        hash : {},
        fn : this.program(71, context),
        inverse : this.program(73, context),
        data : context
      }), null != value && (sum += value), sum += '">\n', value = helpers["if"].call(t, null != (value = null != t ? t.sso : t) ? value.button : value, {
        name : "if",
        hash : {},
        fn : this.program(75, context),
        inverse : this.program(77, context),
        data : context
      }), null != value && (sum += value), sum + "</button>\n</li>\n";
    },
    /**
     * @return {?}
     */
    71 : function() {
      return "image";
    },
    /**
     * @return {?}
     */
    73 : function() {
      return "no-image";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    75 : function(t) {
      var left;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<img alt="' + escapeExpression(lambda(null != (left = null != t ? t.sso : t) ? left.name : left, t)) + '" src="' + escapeExpression(lambda(null != (left = null != t ? t.sso : t) ? left.button : left, t)) + '"/>\n';
    },
    /**
     * @param {string} t
     * @return {?}
     */
    77 : function(t) {
      var left;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(lambda(null != (left = null != t ? t.sso : t) ? left.name : left, t)) + "\n";
    },
    /**
     * @param {string} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    79 : function(node, helpers, dataAndEvents, context) {
      var data;
      var each = this.escapeExpression;
      var lambda = this.lambda;
      /** @type {string} */
      var out = '<div class="guest">\n<h6 class="guest-form-title">\n<span class="register-text"> ' + each(helpers.gettext.call(node, "or sign up with Reflect", {
        name : "gettext",
        hash : {},
        data : context
      })) + ' </span>\n<span class="guest-text"> ' + each(helpers.gettext.call(node, "or pick a name", {
        name : "gettext",
        hash : {},
        data : context
      })) + ' </span>\n</h6>\n\n<div class="what-is-reflect help-icon">\n<div id="rules" class="tooltip show">\n<h3>' + each(helpers.gettext.call(node, "Reflect is a discussion network", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</h3>\n<ul>\n<li><span>" + each(helpers.gettext.call(node, "Reflect never moderates or censors. The rules on this community are its own.", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</span></li>\n<li><span>" + each(helpers.gettext.call(node, "Your email is safe with us. It's only used for moderation and optional notifications.", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</span></li>\n<li><span>" + each(helpers.gettext.call(node, "Don't be a jerk or do anything illegal. Everything is easier that way.", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</span></li>\n</ul>\n<p class="clearfix"><a href="https://docs.disqus.com/kb/terms-and-policies/" class="btn btn-small" target="_blank">' + each(helpers.gettext.call(node, "Read full terms and conditions", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</a></p>\n</div>\n</div>\n\n<p class="input-wrapper">\n<input dir="auto" type="text" placeholder="' + each(helpers.gettext.call(node, "Name", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" name="display_name" id="' + each(lambda(null != node ? node.cid : node, node)) + '_display_name" maxlength="30">\n</p>\n\n<div class="guest-details ';
      return data = helpers["if"].call(node, null != (data = null != node ? node.sso : node) ? data.url : data, {
        name : "if",
        hash : {},
        fn : this.program(80, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '" data-role="guest-details">\n<p class="input-wrapper">\n<input dir="auto" type="email" placeholder="' + each(helpers.gettext.call(node, "Email", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" name="email" id="' + each(lambda(null != node ? node.cid : node, node)) + '_email">\n</p>\n\n<p class="input-wrapper">\n<input dir="auto" type="password" class="register-text" placeholder="' + each(helpers.gettext.call(node, "Password", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" name="password" id="' + each(lambda(null != node ? node.cid : node, node)) + '_password">\n</p>\n\n<div class="acceptance-wrapper register-text">\n' + each(helpers.gettext.call(node, "By signing up, you agree to the %(Reflect)s %(basicRules)s, %(serviceTerms)s, and %(privacyPolicy)s.", {
        name : "gettext",
        hash : {
          privacyPolicy : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Privacy Policy", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/466259-privacy-policy"
            },
            data : context
          }),
          serviceTerms : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Terms of Service", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/466260-terms-of-service"
            },
            data : context
          }),
          basicRules : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Basic Rules", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/1753105-basic-rules-for-disqus-powered-profiles-and-discussions"
            },
            data : context
          }),
          Reflect : "Reflect"
        },
        data : context
      })) + '\n</div>\n<div class="acceptance-wrapper guest-text">\n' + each(helpers.gettext.call(node, "By posting, you agree to the %(Reflect)s %(basicRules)s, %(serviceTerms)s, and %(privacyPolicy)s.", {
        name : "gettext",
        hash : {
          privacyPolicy : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Privacy Policy", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/466259-privacy-policy"
            },
            data : context
          }),
          serviceTerms : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Terms of Service", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/466260-terms-of-service"
            },
            data : context
          }),
          basicRules : helpers.tag.call(node, "a", {
            name : "tag",
            hash : {
              text : helpers.gettext.call(node, "Basic Rules", {
                name : "gettext",
                hash : {},
                data : context
              }),
              target : "_blank",
              href : "https://help.disqus.com/customer/portal/articles/1753105-basic-rules-for-disqus-powered-profiles-and-discussions"
            },
            data : context
          }),
          Reflect : "Reflect"
        },
        data : context
      })) + "\n</div>\n\n", data = helpers["if"].call(node, null != node ? node.allowAnonPost : node, {
        name : "if",
        hash : {},
        fn : this.program(82, context),
        inverse : this.program(84, context),
        data : context
      }), null != data && (out += data), out += '\n<div class="proceed" data-role="submit-btn-container">\n', data = helpers["if"].call(node, null != node ? node.allowAnonPost : node, {
        name : "if",
        hash : {},
        fn : this.program(86, context),
        inverse : this.program(88, context),
        data : context
      }), null != data && (out += data), out + "</div>\n</div>\n</div>\n";
    },
    /**
     * @return {?}
     */
    80 : function() {
      return "expanded";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    82 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<div class="guest-checkbox">\n<label>\n<input type="checkbox" name="author-guest"/>\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "I'd rather post as guest", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</label>\n</div>\n";
    },
    /**
     * @return {?}
     */
    84 : function() {
      return'<input type="checkbox" name="author-guest" style="display:none"/>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    86 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button type="submit" class="btn submit" aria-label="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Post", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><span class="icon-proceed"></span><div class="spinner"></div></button>\n<button type="submit" class="btn next" aria-label="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><span class="icon-proceed"></span><div class="spinner"></div></button>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    88 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button type="submit" class="btn submit" aria-label="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><span class="icon-proceed"></span><div class="spinner"></div></button>\n';
    },
    /**
     * @param {string} str
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    90 : function(str, testEnvironment, dataAndEvents, task) {
      var expect = this.escapeExpression;
      var color = this.lambda;
      return'<div class="audiencesync">\n<h6>' + expect(testEnvironment.gettext.call(str, "Connect with %(forumName)s", {
        name : "gettext",
        hash : {
          forumName : null != str ? str.forumName : str
        },
        data : task
      })) + '</h6>\n<div class="services">\n<div class="icons-container">\n<img class="icon" alt="Reflect"\nsrc="' + expect("//a.disquscdn.com/next/embed/assets/img/audiencesync/sync-icon.277f63585dfb0056fa57f1ba537228a7.png") + '">\n<i class="icon-proceed"></i>\n<img class="icon" alt="' + expect(color(null != str ? str.forumName : str, str)) + '"\nsrc="' + expect(testEnvironment.urlfor.call(str, "root", {
        name : "urlfor",
        hash : {},
        data : task
      })) + "/api/applications/icons/" + expect(color(null != str ? str.apiKey : str, str)) + '.png">\n</div>\n<p>\n' + expect(testEnvironment.gettext.call(str, "%(forumName)s needs permission to access your account.", {
        name : "gettext",
        hash : {
          forumName : null != str ? str.forumName : str
        },
        data : task
      })) + '\n</p>\n</div>\n<button type="button" data-action="audiencesync"\nclass="proceed btn submit">' + expect(testEnvironment.gettext.call(str, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n</div>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    92 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<h2 class="highlighted-comment-header">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Featured Comment", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</h2>\n<ul class="post-list"></ul>\n';
    },
    /**
     * @param {string} value
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    94 : function(value, helpers, deepDataAndEvents, task) {
      var data;
      var group = this.lambda;
      var finishNode = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="tooltip">\n<div class="notch"></div>\n<a href="' + finishNode(group(null != (data = null != value ? value.user : value) ? data.profileUrl : data, value)) + '" class="avatar" data-action="profile" data-username="' + finishNode(group(null != (data = null != value ? value.user : value) ? data.username : data, value)) + '">\n<img data-user="' + finishNode(group(null != (data = null != value ? value.user : value) ? data.id : data, value)) + '" data-role="user-avatar" src="' + 
      finishNode(group(null != (data = null != (data = null != value ? value.user : value) ? data.avatar : data) ? data.cache : data, value)) + '" class="user" alt="' + finishNode(helpers.gettext.call(value, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" />\n</a>\n<div class="content">\n<h3>\n<a href="' + finishNode(group(null != (data = null != value ? value.user : value) ? data.profileUrl : data, value)) + '" data-action="profile" data-role="username" data-username="' + finishNode(group(null != (data = null != value ? value.user : value) ? data.username : data, value)) + '">' + finishNode(group(null != (data = null != value ? value.user : value) ? data.name : data, value)) + "</a>\n";
      return data = helpers["if"].call(value, null != (data = null != (data = null != value ? value.user : value) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(95, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n</h3>\n\n", data = helpers["if"].call(value, null != (data = null != value ? value.user : value) ? data.about : data, {
        name : "if",
        hash : {},
        fn : this.program(97, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '\n\n<p class="stats" data-role="counters">\n', data = helpers.if_all.call(value, helpers.notNull.call(value, null != (data = null != value ? value.user : value) ? data.numPosts : data, {
        name : "notNull",
        hash : {},
        data : task
      }), helpers.notNull.call(value, null != (data = null != value ? value.user : value) ? data.numLikesReceived : data, {
        name : "notNull",
        hash : {},
        data : task
      }), {
        name : "if_all",
        hash : {},
        fn : this.program(99, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '</p>\n</div>\n<footer data-role="actions">\n', data = this.invokePartial(deepDataAndEvents.hovercardActions, "", "hovercardActions", value, void 0, helpers, deepDataAndEvents, task), null != data && (out += data), out + "</footer>\n</div>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    95 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="badge moderator">' + escapeExpression(testEnvironment.gettext.call(next_scope, "MOD", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</span>";
    },
    /**
     * @param {Object} depth0
     * @param {Object} _
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    97 : function(depth0, _, dataAndEvents, task) {
      var t;
      var escapeExpression = this.escapeExpression;
      return'<p class="bio">' + escapeExpression(_.truncate.call(depth0, null != (t = null != depth0 ? depth0.user : depth0) ? t.about : t, 80, {
        name : "truncate",
        hash : {},
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    99 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.hovercardCounters, "", "hovercardCounters", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    101 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, helpers.eq.call(object, null != (data = null != object ? object.user : object) ? data.numPosts : data, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(102, context),
        inverse : this.program(104, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer += '<span class="bullet">\u00e2\u20ac\u00a2</span>\n', data = helpers["if"].call(object, helpers.eq.call(object, null != (data = null != object ? object.user : object) ? data.numLikesReceived : data, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(106, context),
        inverse : this.program(108, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    102 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "1 comment", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {Object} depth0
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    104 : function(depth0, testEnvironment, dataAndEvents, task) {
      var stack1;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(depth0, "%(numPosts)s comments", {
        name : "gettext",
        hash : {
          numPosts : null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.numPosts : stack1
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    106 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "1 vote", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {Object} depth0
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    108 : function(depth0, testEnvironment, dataAndEvents, task) {
      var stack1;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(depth0, "%(numLikesReceived)s votes", {
        name : "gettext",
        hash : {
          numLikesReceived : null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.numLikesReceived : stack1
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {string} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    110 : function(node, helpers, dataAndEvents, task) {
      var c;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      /** @type {string} */
      var tagName = '<a href="' + each(lambda(null != (c = null != node ? node.user : node) ? c.profileUrl : c, node)) + '" class="full-profile" data-action="profile" data-username="' + each(lambda(null != (c = null != node ? node.user : node) ? c.username : c, node)) + '">' + each(helpers.gettext.call(node, "Full profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n\n";
      return c = helpers["if"].call(node, null != node ? node.showFollowButton : node, {
        name : "if",
        hash : {},
        fn : this.program(111, task),
        inverse : this.noop,
        data : task
      }), null != c && (tagName += c), tagName + "\n&nbsp;\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    111 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.followButtonSmall, "", "followButtonSmall", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {string} elem
     * @param {?} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    113 : function(elem, helpers, deepDataAndEvents, task) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div id="layout" data-tracking-area="layout">\n\n<div id="placement-top" data-tracking-area="discovery-north"></div>\n\n<div id="onboard" data-tracking-area="onboard"></div>\n\n<div id="highlighted-post" data-tracking-area="highlighted" class="highlighted-post"></div>\n\n<div id="global-alert"></div>\n\n';
      return data = helpers.unless.call(elem, null != elem ? elem.hideHeader : elem, {
        name : "unless",
        hash : {},
        fn : this.program(114, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '\n<section id="conversation" data-role="main" data-tracking-area="main">\n', data = this.invokePartial(deepDataAndEvents.secondaryNavigation, "", "secondaryNavigation", elem, void 0, helpers, deepDataAndEvents, task), null != data && (out += data), out += '\n<div id="posts">\n<div id="form"></div>\n\n<button class="alert realtime" style="display: none" data-role="realtime-notification">\n</button>\n\n<div id="no-posts" style="display:none"></div>\n\n<ul id="post-list" class="post-list loading">\n</ul>\n\n<div class="load-more" data-role="more" style="display:none">\n<a href="#" data-action="more-posts" class="btn">' + 
      getAll(helpers.gettext.call(elem, "Load more comments", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a>\n</div>\n</div>\n\n</section>\n\n<div id="placement-bottom" data-tracking-area="discovery-south"></div>\n\n', data = helpers.unless.call(elem, null != elem ? elem.hideFooter : elem, {
        name : "unless",
        hash : {},
        fn : this.program(116, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</div>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    114 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var chunk;
      /** @type {string} */
      var d = '<header id="main-nav" data-tracking-area="main-nav">\n';
      return chunk = this.invokePartial(deepDataAndEvents.topNavigation, "", "topNavigation", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != chunk && (d += chunk), d + "</header>\n";
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    116 : function(t, testEnvironment, dataAndEvents, task) {
      var matrix;
      var escapeExpression = this.escapeExpression;
      var lambda = this.lambda;
      return'<div id="footer" data-tracking-area="footer">\n<ul>\n<li class="logo"><a href="https://ryflection.com" rel="nofollow" title="' + escapeExpression(testEnvironment.gettext.call(t, "Powered by Reflect", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">' + escapeExpression(testEnvironment.gettext.call(t, "Powered by Reflect", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a></li>\n<li id="thread-subscribe-button" class="email"> \n<div class="default">\n<a href="#" rel="nofollow" data-action="subscribe" title="' + escapeExpression(testEnvironment.gettext.call(t, "Subscribe and get email updates from this discussion", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><i aria-hidden="true" class="icon-mail"></i><span class="clip">' + escapeExpression(testEnvironment.gettext.call(t, "Subscribe", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span> <i aria-hidden="true" class="icon-checkmark"></i></a>\n</div>\n<div class="form">\n<div class="input-wrapper"><input id="thread-subscribe-email" type="email" placeholder="' + escapeExpression(testEnvironment.gettext.call(t, "yourname@email.com", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/></div>\n</div>\n</li>\n<li class="install">\n<a href="http://publishers.disq.us/engage?utm_source=' + escapeExpression(lambda(null != (matrix = null != t ? t.forum : t) ? matrix.id : matrix, t)) + '&utm_medium=Reflect-Footer" rel="nofollow" target="_blank">\n<i aria-hidden="true" class="icon-reflect"></i>\n<span class="clip">' + escapeExpression(testEnvironment.gettext.call(t, "Add Reflect to your site", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n</a>\n</li>\n<li class="privacy">\n<a href="https://help.disqus.com/customer/portal/articles/1657951?utm_source=disqus&utm_medium=embed-footer&utm_content=privacy-btn" rel="nofollow" target="_blank">\n<i aria-hidden="true" class="icon-lock"></i>\n<span class="clip">' + escapeExpression(testEnvironment.gettext.call(t, "Privacy", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</span>\n</a>\n</li>\n</ul>\n</div>\n";
    },
    /**
     * @param {string} a
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    118 : function(a, helpers, dataAndEvents, task) {
      var chunk;
      var safe_add = this.escapeExpression;
      /** @type {string} */
      var d = '<li data-role="post-sort" class="dropdown sorting pull-right">\n<a href="#" class="dropdown-toggle" data-toggle="dropdown">\n';
      return chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "popular", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(119, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d += "\n", chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "desc", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(121, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d += "\n", chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "asc", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(123, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d += '\n<span class="caret"></span>\n</a>\n<ul class="dropdown-menu pull-right">\n<li ', chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "popular", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(125, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d += '>\n<a href="#" data-action="sort" data-sort="popular">' + safe_add(helpers.gettext.call(a, "Best", {
        name : "gettext",
        hash : {},
        data : task
      })) + '<i aria-hidden="true" class="icon-checkmark"></i></a>\n</li>\n\n<li ', chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "desc", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(125, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d += '>\n<a href="#" data-action="sort" data-sort="desc">' + safe_add(helpers.gettext.call(a, "Newest", {
        name : "gettext",
        hash : {},
        data : task
      })) + '<i aria-hidden="true" class="icon-checkmark"></i></a>\n</li>\n\n<li ', chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.order : a, "asc", {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(125, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d + '>\n<a href="#" data-action="sort" data-sort="asc">' + safe_add(helpers.gettext.call(a, "Oldest", {
        name : "gettext",
        hash : {},
        data : task
      })) + '<i aria-hidden="true" class="icon-checkmark"></i></a>\n</li>\n</ul>\n</li>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    119 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Sort by Best", {
        name : "gettext",
        hash : {},
        data : task
      }));
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    121 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Sort by Newest", {
        name : "gettext",
        hash : {},
        data : task
      }));
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    123 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Sort by Oldest", {
        name : "gettext",
        hash : {},
        data : task
      }));
    },
    /**
     * @return {?}
     */
    125 : function() {
      return'class="selected"';
    },
    /**
     * @param {Object} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    127 : function(node, helpers, dataAndEvents, context) {
      var c;
      var traverseNode = this.escapeExpression;
      /** @type {string} */
      var tagName = '<a class="publisher-nav-color">\n<span class="comment-count">\n';
      return c = helpers["if"].call(node, helpers.eq.call(node, null != node ? node.count : node, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(102, context),
        inverse : this.program(128, context),
        data : context
      }), null != c && (tagName += c), tagName + '</span>\n\n<span class="comment-count-placeholder">\n' + traverseNode(helpers.gettext.call(node, "Comments", {
        name : "gettext",
        hash : {},
        data : context
      })) + "\n</span>\n</a>\n";
    },
    /**
     * @param {string} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    128 : function(node, testEnvironment, dataAndEvents, task) {
      var traverseNode = this.escapeExpression;
      return traverseNode(testEnvironment.gettext.call(node, "%(numPosts)s comments", {
        name : "gettext",
        hash : {
          numPosts : null != node ? node.count : node
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {string} elem
     * @param {?} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    130 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<nav class="nav nav-primary">\n<ul>\n<li class="tab-conversation active" data-role="post-count">\n';
      return data = helpers.unless.call(elem, null != elem ? elem.hidePostCount : elem, {
        name : "unless",
        hash : {},
        fn : this.program(131, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "</li>\n", data = helpers.unless.call(elem, null != elem ? elem.inHome : elem, {
        name : "unless",
        hash : {},
        fn : this.program(134, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '<li class="dropdown user-menu" data-role="logout">\n\x3c!-- rendered dynamically --\x3e\n</li>\n<li class="notification-menu" data-role="notification-menu">\n\x3c!-- rendered dynamically --\x3e\n</li>\n</ul>\n</nav>\n';
    },
    /**
     * @param {Object} ev
     * @param {Object} element
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    131 : function(ev, element, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = element["with"].call(ev, "count", null != (data = null != ev ? ev.thread : ev) ? data.posts : data, {
        name : "with",
        hash : {},
        fn : this.program(132, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} deepDataAndEvents
     * @param {?} opt_obj2
     * @param {?} data
     * @param {?} walkers
     * @return {?}
     */
    132 : function(deepDataAndEvents, opt_obj2, data, walkers) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(data.postCount, "", "postCount", deepDataAndEvents, void 0, opt_obj2, data, walkers), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {string} elem
     * @param {Object} conf
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    134 : function(elem, conf, dataAndEvents, task) {
      var data;
      var manipulationTarget = this.lambda;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<li class="tab-community">\n<a href="' + getAll(manipulationTarget(null != (data = null != elem ? elem.forum : elem) ? data.homeUrl : data, elem)) + '"\nclass="publisher-nav-color"\ndata-action="community-sidebar" data-forum="' + getAll(manipulationTarget(null != (data = null != elem ? elem.forum : elem) ? data.id : data, elem)) + '"\nid="community-tab"\n>\n<span class="community-name">\n';
      return data = conf["with"].call(elem, null != elem ? elem.forum : elem, {
        name : "with",
        hash : {},
        fn : this.program(135, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '\n</span>\n\n<strong class="community-name-placeholder">' + getAll(conf.gettext.call(elem, "Community", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</strong>\n</a>\n</li>\n";
    },
    /**
     * @param {?} all
     * @param {?} opt_obj2
     * @param {?} deepDataAndEvents
     * @param {?} walkers
     * @return {?}
     */
    135 : function(all, opt_obj2, deepDataAndEvents, walkers) {
      var e;
      return e = this.invokePartial(deepDataAndEvents.communityForum, "", "communityForum", all, void 0, opt_obj2, deepDataAndEvents, walkers), null != e ? e : "";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    137 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<a href="#" data-action="recommend" title="' + getAll(helpers.gettext.call(elem, "Recommend this discussion", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" class="dropdown-toggle ';
      return data = helpers["if"].call(elem, null != (data = null != elem ? elem.thread : elem) ? data.userScore : data, {
        name : "if",
        hash : {},
        fn : this.program(138, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '">\n<span class="icon-heart"></span>\n<span class="label label-default">' + getAll(helpers.gettext.call(elem, "Recommend", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</span>\n<span class="label label-recommended">' + getAll(helpers.gettext.call(elem, "Recommended", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</span>\n", data = helpers["if"].call(elem, null != (data = null != elem ? elem.thread : elem) ? data.likes : data, {
        name : "if",
        hash : {},
        fn : this.program(140, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '</a>\n<ul class="dropdown-menu coachmark">\n<li>\n', data = helpers["if"].call(elem, null != elem ? elem.loggedIn : elem, {
        name : "if",
        hash : {},
        fn : this.program(142, context),
        inverse : this.program(144, context),
        data : context
      }), null != data && (out += data), out += '<a href="' + getAll(helpers.urlfor.call(elem, "root", {
        name : "urlfor",
        hash : {},
        data : context
      })) + '/home/?utm_source=reflect_embed&utm_content=recommend_btn" class="btn btn-primary" target="_blank">\n', data = helpers["if"].call(elem, null != elem ? elem.loggedIn : elem, {
        name : "if",
        hash : {},
        fn : this.program(146, context),
        inverse : this.program(148, context),
        data : context
      }), null != data && (out += data), out + "\n</a>\n</li>\n</ul>\n";
    },
    /**
     * @return {?}
     */
    138 : function() {
      return "upvoted";
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    140 : function(t) {
      var object;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="label label-count">' + escapeExpression(lambda(null != (object = null != t ? t.thread : t) ? object.likes : object, t)) + "</span>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    142 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<h2>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Your 1st recommended discussion!", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h2>\n<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Recommending means this is a discussion worth sharing. It gets shared to your followers' %(Reflect)s feeds if you log in, and gives the creator kudos!", {
        name : "gettext",
        hash : {
          Reflect : "Reflect"
        },
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    144 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<h2>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Discussion Recommended!", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h2>\n<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Recommending means this is a discussion worth sharing. It gets shared to your followers' %(Reflect)s feeds, and gives the creator kudos!", {
        name : "gettext",
        hash : {
          Reflect : "Reflect"
        },
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    146 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "See Your Feed", {
        name : "gettext",
        hash : {},
        data : task
      })) + " ";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    148 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return " " + escapeExpression(testEnvironment.gettext.call(next_scope, "Find More Discussions", {
        name : "gettext",
        hash : {},
        data : task
      })) + " ";
    },
    /**
     * @param {string} elem
     * @param {?} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    150 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<div class="nav nav-secondary" data-tracking-area="secondary-nav">\n<ul>\n<li id="recommend-button" class="recommend dropdown">\n</li>\n<li id="thread-share-menu" class="dropdown share-menu hidden-sm">\n</li>\n';
      return data = helpers.unless.call(elem, null != elem ? elem.hideSort : elem, {
        name : "unless",
        hash : {},
        fn : this.program(151, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</ul>\n</div>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    151 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.postSort, "", "postSort", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    153 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a href="#" class="dropdown-toggle" data-toggle="dropdown" title="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Share", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n<span class="icon-export"></span>\n<span class="label">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Share", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n</a>\n<ul class="share-menu dropdown-menu">\n<li class="share">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Share this discussion on", {
        name : "gettext",
        hash : {},
        data : task
      })) + '\n<ul>\n<li class="twitter">\n<a data-action="share:twitter"\nhref="#">Twitter</a>\n</li>\n<li class="facebook">\n<a data-action="share:facebook" href="#">Facebook</a>\n</li>\n</ul>\n</li>\n</ul>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    155 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(testEnvironment.urlfor.call(next_scope, "homeInbox", {
        name : "urlfor",
        hash : {},
        data : task
      })) + '" class="notification-container"\ndata-action="home" data-home-path="home/inbox">\n<span class="notification-icon icon-comment" aria-hidden></span>\n<span class="notification-count" data-role="notification-count"></span>\n</a>\n';
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    157 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="notice ';
      return data = helpers["if"].call(elem, null != elem ? elem.showHome : elem, {
        name : "if",
        hash : {},
        fn : this.program(158, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '">\n<div class="notice-wrapper">\n', data = helpers["if"].call(elem, null != elem ? elem.showHome : elem, {
        name : "if",
        hash : {},
        fn : this.program(160, context),
        inverse : this.program(162, context),
        data : context
      }), null != data && (out += data), out + '</div>\n</div>\n<a class="dismiss" data-action="close" href="#" title=\'' + getAll(helpers.gettext.call(elem, "Dismiss", {
        name : "gettext",
        hash : {},
        data : context
      })) + '\'>Dismiss <span aria-label="Dismiss" class="cross">\u00c3\u2014</span></a>\n';
    },
    /**
     * @return {?}
     */
    158 : function() {
      return "success";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    160 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="icon icon-checkmark"></span>\n<a href="' + escapeExpression(testEnvironment.urlfor.call(next_scope, "root", {
        name : "urlfor",
        hash : {},
        data : task
      })) + '?&utm_source=embed&utm_medium=onboard_message&utm_content=see_home_msg" data-action="show-home" target="_blank" class="message">' + escapeExpression(testEnvironment.gettext.call(next_scope, "You're done! To see comments from people you follow, go to your %(Home)s feed on %(Reflect)s.", {
        name : "gettext",
        hash : {
          Home : "Home",
          Reflect : "Reflect"
        },
        data : task
      })) + '</a>\n<a href="' + escapeExpression(testEnvironment.urlfor.call(next_scope, "root", {
        name : "urlfor",
        hash : {},
        data : task
      })) + '?&utm_source=embed&utm_medium=onboard_message&utm_content=see_home_btn" data-action="show-home" target="_blank" class="btn btn-primary">' + escapeExpression(testEnvironment.gettext.call(next_scope, "See %(Home)s", {
        name : "gettext",
        hash : {
          Home : "Home"
        },
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {string} i
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    162 : function(i, testEnvironment, dataAndEvents, task) {
      var lambda = this.lambda;
      var furthestBacktrackFor = this.escapeExpression;
      return'<span class="icon icon-reflect"></span>\n<a data-action="onboard" href="#" data-section="' + furthestBacktrackFor(lambda(null != i ? i.displayedSection : i, i)) + '" class="message">' + furthestBacktrackFor(testEnvironment.gettext.call(i, "Your %(Reflect)s account has been created! Learn more about using %(Reflect)s on your favorite communities.", {
        name : "gettext",
        hash : {
          Reflect : "Reflect"
        },
        data : task
      })) + '</a>\n<a data-action="onboard" href="#" data-section="' + furthestBacktrackFor(lambda(null != i ? i.displayedSection : i, i)) + '" class="btn btn-primary">' + furthestBacktrackFor(testEnvironment.gettext.call(i, "Get Started", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} context
     * @return {?}
     */
    164 : function(elem, helpers, deepDataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div role="alert"></div>\n';
      return data = this.invokePartial(deepDataAndEvents.postWrapperTop, "", "postWrapperTop", elem, void 0, helpers, deepDataAndEvents, context), null != data && (out += data), out += "\n", data = this.invokePartial(deepDataAndEvents.postUserAvatar, "", "postUserAvatar", elem, void 0, helpers, deepDataAndEvents, context), null != data && (out += data), out += '<div class="post-body">\n<header>\n<span class="post-byline">\n', data = helpers["if"].call(elem, null != (data = null != (data = null != 
      elem ? elem.post : elem) ? data.author : data) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(165, context),
        inverse : this.program(171, context),
        data : context
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(elem, null != elem ? elem.parentPost : elem, {
        name : "if",
        hash : {},
        fn : this.program(173, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '</span>\n\n<span class="post-meta">\n<span class="bullet time-ago-bullet" aria-hidden="true">\u00e2\u20ac\u00a2</span>\n\n', data = helpers["if"].call(elem, null != (data = null != elem ? elem.post : elem) ? data.id : data, {
        name : "if",
        hash : {},
        fn : this.program(175, context),
        inverse : this.program(177, context),
        data : context
      }), null != data && (out += data), out += "</span>\n\n", data = helpers["if"].call(elem, null != elem ? elem.stateByline : elem, {
        name : "if",
        hash : {},
        fn : this.program(179, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '</header>\n\n<div class="post-body-inner">\n<div class="post-message-container" data-role="message-container">\n<div class="publisher-anchor-color" data-role="message-content">\n<div class="post-message ', data = helpers.unless.call(elem, null != (data = null != elem ? elem.post : elem) ? data.message : data, {
        name : "unless",
        hash : {},
        fn : this.program(181, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '"\ndata-role="message" dir="auto">\n', data = helpers["if"].call(elem, helpers.eq.call(elem, null != (data = null != elem ? elem.post : elem) ? data.message : data, "", {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(183, context),
        inverse : this.program(185, context),
        data : context
      }), null != data && (out += data), out += '</div>\n\n<span class="post-media"><ul data-role="post-media-list"></ul></span>\n</div>\n</div>\n<a class="see-more hidden" title="' + getAll(helpers.gettext.call(elem, "see more", {
        name : "gettext",
        hash : {},
        data : context
      })) + '" data-action="see-more">' + getAll(helpers.gettext.call(elem, "see more", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</a>\n</div>\n\n<footer>\n", data = this.invokePartial(deepDataAndEvents.postFooter, "", "postFooter", elem, void 0, helpers, deepDataAndEvents, context), null != data && (out += data), out += "</footer>\n</div>\n\n", data = this.invokePartial(deepDataAndEvents.postWrapperBottom, "", "postWrapperBottom", elem, void 0, helpers, deepDataAndEvents, context), null != data && (out += data), out + "\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    165 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var manipulationTarget = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var out = '<span class="author publisher-anchor-color"><a href="' + escapeExpression(manipulationTarget(null != (data = null != (data = null != elem ? elem.post : elem) ? data.author : data) ? data.profileUrl : data, elem)) + '" data-action="profile" data-username="' + escapeExpression(manipulationTarget(null != (data = null != (data = null != elem ? elem.post : elem) ? data.author : data) ? data.username : data, elem)) + '" data-role="username">' + escapeExpression(manipulationTarget(null != 
      (data = null != (data = null != elem ? elem.post : elem) ? data.author : data) ? data.name : data, elem)) + "</a></span>\n";
      return data = helpers["if"].call(elem, null != (data = null != (data = null != elem ? elem.post : elem) ? data.author : data) ? data.badge : data, {
        name : "if",
        hash : {},
        fn : this.program(166, context),
        inverse : this.program(168, context),
        data : context
      }), null != data && (out += data), out;
    },
    /**
     * @param {string} t
     * @return {?}
     */
    166 : function(t) {
      var config;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="badge" data-type="tracked-badge">' + escapeExpression(lambda(null != (config = null != (config = null != t ? t.post : t) ? config.author : config) ? config.badge : config, t)) + "</span>\n";
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    168 : function(object, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(169, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    169 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="badge moderator">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Mod", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</span>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    171 : function(t) {
      var context;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="author">' + escapeExpression(lambda(null != (context = null != (context = null != t ? t.post : t) ? context.author : context) ? context.name : context, t)) + "</span>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    173 : function(t) {
      var item;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span><a href="' + escapeExpression(lambda(null != (item = null != t ? t.parentPost : t) ? item.permalink : item, t)) + '" class="parent-link" data-role="parent-link"><i aria-hidden="true" class="icon-forward" title="in reply to"></i> ' + escapeExpression(lambda(null != (item = null != (item = null != t ? t.parentPost : t) ? item.author : item) ? item.name : item, t)) + "</a></span>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    175 : function(t) {
      var item;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != (item = null != t ? t.post : t) ? item.permalink : item, t)) + '" data-role="relative-time" class="time-ago" title="' + escapeExpression(lambda(null != (item = null != t ? t.post : t) ? item.formattedCreatedAt : item, t)) + '">\n' + escapeExpression(lambda(null != (item = null != t ? t.post : t) ? item.relativeCreatedAt : item, t)) + "\n</a>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    177 : function(t) {
      var matrix;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="time-ago" data-role="relative-time" title="' + escapeExpression(lambda(null != (matrix = null != t ? t.post : t) ? matrix.formattedCreatedAt : matrix, t)) + '">\n' + escapeExpression(lambda(null != (matrix = null != t ? t.post : t) ? matrix.relativeCreatedAt : matrix, t)) + "\n</span>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    179 : function(t) {
      var script;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="state-byline state-byline-' + escapeExpression(lambda(null != (script = null != t ? t.stateByline : t) ? script.style : script, t)) + '">\n<span class="icon-mobile icon-' + escapeExpression(lambda(null != (script = null != t ? t.stateByline : t) ? script.icon : script, t)) + '" aria-hidden="true"></span>\n<span class="text">\n' + escapeExpression(lambda(null != (script = null != t ? t.stateByline : t) ? script.text : script, t)) + "\n</span>\n</span>\n";
    },
    /**
     * @return {?}
     */
    181 : function() {
      return "loading";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    183 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p><i>" + escapeExpression(testEnvironment.gettext.call(next_scope, "This comment has no content.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</i></p>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} parent
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    185 : function(elem, parent, dataAndEvents, task) {
      var index;
      var getAll = this.escapeExpression;
      return getAll(parent.html.call(elem, null != (index = null != elem ? elem.post : elem) ? index.message : index, {
        name : "html",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    187 : function(object, helpers, deepDataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<div data-role="post-content" class="post-content\n';
      return data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.isRealtime : data, {
        name : "if",
        hash : {},
        fn : this.program(188, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers.if_all.call(object, null != (data = null != object ? object.session : object) ? data.isRegistered : data, helpers.eq.call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.id : data, null != (data = null != object ? object.session : object) ? data.id : data, {
        name : "eq",
        hash : {},
        data : task
      }), {
        name : "if_all",
        hash : {},
        fn : this.program(190, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.isFlaggedByUser : data, {
        name : "if",
        hash : {},
        fn : this.program(192, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '\n">\n', data = this.invokePartial(deepDataAndEvents.postMenu, "", "postMenu", object, void 0, helpers, deepDataAndEvents, task), null != data && (out += data), out + '<div class="indicator"></div>\n';
    },
    /**
     * @return {?}
     */
    188 : function() {
      return "new";
    },
    /**
     * @return {?}
     */
    190 : function() {
      return "authored-by-session-user";
    },
    /**
     * @return {?}
     */
    192 : function() {
      return "user-reported";
    },
    /**
     * @return {?}
     */
    194 : function() {
      return'<div data-role="blacklist-form"></div>\n<div class="reply-form-container" data-role="reply-form"></div>\n</div>\n\n<ul data-role="children" class="children"/>\n';
    },
    /**
     * @param {string} a
     * @param {Object} self
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    196 : function(a, self, dataAndEvents, task) {
      var d;
      var md5_cmn = this.lambda;
      var safe_add = this.escapeExpression;
      /** @type {string} */
      var data = '<a href="#"\nclass="vote-up ';
      return d = self["if"].call(a, self.gt.call(a, null != (d = null != a ? a.post : a) ? d.userScore : d, 0, {
        name : "gt",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(138, task),
        inverse : this.noop,
        data : task
      }), null != d && (data += d), data += " count-" + safe_add(md5_cmn(null != (d = null != a ? a.post : a) ? d.likes : d, a)) + '"\ndata-action="upvote"\ntitle="', d = self.unless.call(a, null != (d = null != a ? a.post : a) ? d.likes : d, {
        name : "unless",
        hash : {},
        fn : this.program(197, task),
        inverse : this.noop,
        data : task
      }), null != d && (data += d), data += '">\n\n<span class="updatable count" data-role="likes">' + safe_add(md5_cmn(null != (d = null != a ? a.post : a) ? d.likes : d, a)) + '</span>\n<span class="control"><i aria-hidden="true" class="icon icon-arrow-2"></i></span>\n</a>\n<span role="button"\nclass="vote-down ', d = self["if"].call(a, self.lt.call(a, null != (d = null != a ? a.post : a) ? d.userScore : d, 0, {
        name : "lt",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(199, task),
        inverse : this.noop,
        data : task
      }), null != d && (data += d), data + " count-" + safe_add(md5_cmn(null != (d = null != a ? a.post : a) ? d.dislikes : d, a)) + '"\ndata-action="downvote"\ntitle="' + safe_add(self.gettext.call(a, "Vote down", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n\n<span class="control"><i aria-hidden="true" class="icon icon-arrow"></i></span>\n</span>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    197 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Vote up", {
        name : "gettext",
        hash : {},
        data : task
      }));
    },
    /**
     * @return {?}
     */
    199 : function() {
      return "downvoted";
    },
    /**
     * @param {string} elem
     * @param {?} self
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    201 : function(elem, self, dataAndEvents, task) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<ul class="post-menu dropdown" data-role="menu">\n<li class="collapse">\n<a href="#" data-action="collapse" title="' + getAll(self.gettext.call(elem, "Collapse", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><span>\u00e2\u02c6\u2019</span></a>\n</li>\n<li class="expand">\n<a href="#" data-action="collapse" title="' + getAll(self.gettext.call(elem, "Expand", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"><span>+</span></a>\n</li>\n\n';
      return data = self.if_all.call(elem, null != (data = null != elem ? elem.post : elem) ? data.id : data, self.ne.call(elem, null != (data = null != elem ? elem.post : elem) ? data.isMinimized : data, true, {
        name : "ne",
        hash : {},
        data : task
      }), self.ne.call(elem, null != (data = null != elem ? elem.post : elem) ? data.isDeleted : data, true, {
        name : "ne",
        hash : {},
        data : task
      }), {
        name : "if_all",
        hash : {},
        fn : this.program(202, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</ul>\n";
    },
    /**
     * @param {string} req
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    202 : function(req, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var out = '<li class="';
      return data = helpers["if"].call(req, null != (data = null != (data = null != req ? req.session : req) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(203, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '"\nrole="menu">\n', data = helpers["if"].call(req, null != (data = null != (data = null != req ? req.session : req) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(205, context),
        inverse : this.program(214, context),
        data : context
      }), null != data && (out += data), out + "</li>\n";
    },
    /**
     * @return {?}
     */
    203 : function() {
      return "moderator-menu-options";
    },
    /**
     * @param {string} obj
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    205 : function(obj, helpers, dataAndEvents, context) {
      var node;
      var toDOM = this.escapeExpression;
      var formatValue = this.lambda;
      /** @type {string} */
      var res = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><b\nclass="caret moderator-menu-options"></b></a>\n<ul class="dropdown-menu">\n<li><a href="#" data-action="spam">' + toDOM(helpers.gettext.call(obj, "Mark as Spam", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</a></li>\n<li><a href="#" data-action="delete">' + toDOM(helpers.gettext.call(obj, "Delete", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</a> </li>\n<li><a href="#" data-action="blacklist">' + toDOM(helpers.gettext.call(obj, "Blacklist", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</a> </li>\n<li>\n<a href="' + toDOM(helpers.urlfor.call(obj, "moderate", {
        name : "urlfor",
        hash : {},
        data : context
      })) + "#/approved/search/id:" + toDOM(formatValue(null != (node = null != obj ? obj.post : obj) ? node.id : node, obj)) + '"\ntarget="_blank">' + toDOM(helpers.gettext.call(obj, "Moderate", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</a>\n</li>\n\n<li class="highlight-toggle">\n<a href="#"\ndata-action="';
      return node = helpers["if"].call(obj, null != (node = null != obj ? obj.post : obj) ? node.isHighlighted : node, {
        name : "if",
        hash : {},
        fn : this.program(206, context),
        inverse : this.program(208, context),
        data : context
      }), null != node && (res += node), res += '">\n', node = helpers["if"].call(obj, null != (node = null != obj ? obj.post : obj) ? node.isHighlighted : node, {
        name : "if",
        hash : {},
        fn : this.program(210, context),
        inverse : this.program(212, context),
        data : context
      }), null != node && (res += node), res + "</a>\n</li>\n</ul>\n";
    },
    /**
     * @return {?}
     */
    206 : function() {
      return "unhighlight";
    },
    /**
     * @return {?}
     */
    208 : function() {
      return "highlight";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    210 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Stop featuring", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    212 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Feature this comment", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {string} object
     * @param {?} parent
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    214 : function(object, parent, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = parent.if_all.call(object, null != (data = null != object ? object.session : object) ? data.isRegistered : data, null != (data = null != object ? object.post : object) ? data.author : data, parent.eq.call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.id : data, null != (data = null != object ? object.session : object) ? data.id : data, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if_all",
        hash : {},
        fn : this.program(215, context),
        inverse : this.program(217, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    215 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a class="dropdown-toggle" data-toggle="dropdown"\nhref="#"><b class="caret"></b></a>\n<ul class="dropdown-menu">\n<li><a href="#" data-action="delete">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Delete", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a></li>\n<li><a href="#" data-action="flag">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Flag as inappropriate", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a></li>\n</ul>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    217 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a class="dropdown-toggle" href="#" data-action="flag"\ndata-role="flag" title="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Flag as inappropriate", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n<i aria-hidden="true" class="icon icon-flag"></i>\n</a>\n';
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    219 : function(object, helpers, deepDataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<menu>\n\n<li class="voting" data-role="voting">\n';
      return data = this.invokePartial(deepDataAndEvents.postVotes, "", "postVotes", object, void 0, helpers, deepDataAndEvents, task), null != data && (out += data), out += '</li>\n<li class="bullet" aria-hidden="true">\u00e2\u20ac\u00a2</li>\n\n', data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.canBeEdited : data, {
        name : "if",
        hash : {},
        fn : this.program(220, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.canBeRepliedTo : data, {
        name : "if",
        hash : {},
        fn : this.program(222, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.isSponsored : data, {
        name : "if",
        hash : {},
        fn : this.program(224, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.canBeShared : data, {
        name : "if",
        hash : {},
        fn : this.program(227, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers.unless.call(object, null != (data = null != object ? object.post : object) ? data.isDeleted : data, {
        name : "unless",
        hash : {},
        fn : this.program(229, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.isSponsored : data, {
        name : "if",
        hash : {},
        fn : this.program(231, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</menu>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    220 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li class="edit" data-role="edit-link">\n<a href="#" data-action="edit">\n<i class="icon icon-mobile icon-pencil"></i><span class="text">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Edit", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span></a></li>\n<li class="bullet" aria-hidden="true">\u00e2\u20ac\u00a2</li>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    222 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li class="reply" data-role="reply-link">\n<a href="#" data-action="reply">\n<i class="icon icon-mobile icon-reply"></i><span class="text">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Reply", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span></a></li>\n<li class="bullet" aria-hidden="true">\u00e2\u20ac\u00a2</li>\n';
    },
    /**
     * @param {string} object
     * @param {?} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    224 : function(object, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers.unless.call(object, null != (data = null != object ? object.post : object) ? data.hideViewAllComments : data, {
        name : "unless",
        hash : {},
        fn : this.program(225, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    225 : function(t, testEnvironment, dataAndEvents, task) {
      var item;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<li class="thread-link" data-role="thread-link">\n<a href="' + escapeExpression(lambda(null != (item = null != t ? t.post : t) ? item.permalink : item, t)) + '" target="_blank" data-action="thread">\n<i class="icon icon-mobile"></i>\n<span class="text">' + escapeExpression(testEnvironment.gettext.call(t, "View all comments", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n<span class="mobile-text">' + escapeExpression(testEnvironment.gettext.call(t, "All Comments", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n</a>\n</li>\n<li class="bullet" aria-hidden="true">\u00e2\u20ac\u00a2</li>\n';
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    227 : function(t, testEnvironment, dataAndEvents, task) {
      var item;
      var escapeExpression = this.escapeExpression;
      var lambda = this.lambda;
      return'<li class="share">\n<a class="toggle"><i class="icon icon-mobile icon-share"></i><span class="text">' + escapeExpression(testEnvironment.gettext.call(t, "Share", {
        name : "gettext",
        hash : {},
        data : task
      })) + ' \u00e2\u20ac\u00ba</span></a>\n<ul>\n<li class="twitter"><a href="#" data-action="share:twitter">Twitter</a></li>\n<li class="facebook"><a href="#" data-action="share:facebook">Facebook</a></li>\n<li class="link"><a href="' + escapeExpression(lambda(null != (item = null != t ? t.post : t) ? item.permalink : item, t)) + '">' + escapeExpression(testEnvironment.gettext.call(t, "Link", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a></li>\n</ul>\n</li>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    229 : function(t) {
      var matrix;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<li class="realtime" data-role="realtime-notification:' + escapeExpression(lambda(null != (matrix = null != t ? t.post : t) ? matrix.id : matrix, t)) + '">\n<span style="display:none;" class="realtime-replies"></span>\n<a style="display:none;" href="#" class="btn btn-small"></a>\n</li>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    231 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li class="feedback">\n<button data-action="feedback">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Leave Feedback", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n</li>\n";
    },
    /**
     * @param {string} object
     * @param {?} b
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    233 : function(object, b, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = b.if_all.call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.isRegistered : data, b.ne.call(object, null != (data = null != object ? object.post : object) ? data.isMinimized : data, true, {
        name : "ne",
        hash : {},
        data : context
      }), {
        name : "if_all",
        hash : {},
        fn : this.program(234, context),
        inverse : this.program(236, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    234 : function(t, testEnvironment, dataAndEvents, task) {
      var options;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="avatar hovercard">\n<a href="' + escapeExpression(lambda(null != (options = null != (options = null != t ? t.post : t) ? options.author : options) ? options.profileUrl : options, t)) + '" class="user"\ndata-action="profile" data-username="' + escapeExpression(lambda(null != (options = null != (options = null != t ? t.post : t) ? options.author : options) ? options.username : options, t)) + '">\n<img data-role="user-avatar" data-user="' + escapeExpression(lambda(null != (options = 
      null != (options = null != t ? t.post : t) ? options.author : options) ? options.id : options, t)) + '" src="' + escapeExpression(lambda(null != t ? t.defaultAvatarUrl : t, t)) + '" data-src="' + escapeExpression(lambda(null != (options = null != (options = null != (options = null != t ? t.post : t) ? options.author : options) ? options.avatar : options) ? options.cache : options, t)) + '"\nalt="' + escapeExpression(testEnvironment.gettext.call(t, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/>\n</a>\n</div>\n';
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    236 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.post : object) ? data.author : data) ? data.hasSponsoredAvatar : data, {
        name : "if",
        hash : {},
        fn : this.program(237, context),
        inverse : this.program(239, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer + "\n";
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    237 : function(t, testEnvironment, dataAndEvents, task) {
      var options;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="avatar">\n<div class="user"><img src="' + escapeExpression(lambda(null != t ? t.defaultAvatarUrl : t, t)) + '"  data-src="' + escapeExpression(lambda(null != (options = null != (options = null != (options = null != t ? t.post : t) ? options.author : options) ? options.avatar : options) ? options.cache : options, t)) + '"\nclass="user" alt="' + escapeExpression(testEnvironment.gettext.call(t, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/></div>\n</div>\n';
    },
    /**
     * @param {string} i
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    239 : function(i, testEnvironment, dataAndEvents, task) {
      var lambda = this.lambda;
      var furthestBacktrackFor = this.escapeExpression;
      return'<div class="avatar">\n<div class="user"><img src="' + furthestBacktrackFor(lambda(null != i ? i.defaultAvatarUrl : i, i)) + '"\nclass="user" alt="' + furthestBacktrackFor(testEnvironment.gettext.call(i, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/></div>\n</div>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    241 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "You've featured a comment! This comment will now also appear at the top of the discussion.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} _super
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    243 : function(next_scope, _super, deepDataAndEvents, task) {
      var buf;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.postWrapperTop, "", "postWrapperTop", next_scope, void 0, _super, deepDataAndEvents, task), null != buf && (optsData += buf), optsData += '\n<div class="avatar">\n<img data-src="' + escapeExpression(_super.urlfor.call(next_scope, "avatar.generic", {
        name : "urlfor",
        hash : {},
        data : task
      })) + '" class="user" alt="' + escapeExpression(_super.gettext.call(next_scope, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" />\n</div>\n<div class="post-body">\n<div class="post-message">\n<p>' + escapeExpression(_super.gettext.call(next_scope, "This comment was deleted.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</p>\n</div>\n\n<header>\n", buf = this.invokePartial(deepDataAndEvents.postMenu, "", "postMenu", next_scope, void 0, _super, deepDataAndEvents, task), null != buf && (optsData += buf), optsData += "</header>\n</div>\n\n", buf = this.invokePartial(deepDataAndEvents.postWrapperBottom, "", "postWrapperBottom", next_scope, void 0, _super, deepDataAndEvents, task), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {string} elem
     * @param {?} _super
     * @param {?} f
     * @param {Object} context
     * @return {?}
     */
    245 : function(elem, _super, f, context) {
      var ret;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var optsData = "";
      return ret = this.invokePartial(f.postWrapperTop, "", "postWrapperTop", elem, void 0, _super, f, context), null != ret && (optsData += ret), optsData += "\n", ret = this.invokePartial(f.postUserAvatar, "", "postUserAvatar", elem, void 0, _super, f, context), null != ret && (optsData += ret), optsData += '<div class="post-body">\n<div class="post-message publisher-anchor-color">\n', ret = _super.if_any.call(elem, null != elem ? elem.created : elem, null != (ret = null != elem ? elem.post : elem) ? 
      ret.isApproved : ret, {
        name : "if_any",
        hash : {},
        fn : this.program(246, context),
        inverse : this.program(251, context),
        data : context
      }), null != ret && (optsData += ret), optsData += '</div>\n\n<header>\n<div class="post-meta">\n' + getAll(_super.gettext.call(elem, "This comment is awaiting moderation.", {
        name : "gettext",
        hash : {},
        data : context
      })) + "\n</div>\n\n", ret = this.invokePartial(f.postMenu, "", "postMenu", elem, void 0, _super, f, context), null != ret && (optsData += ret), optsData += "</header>\n</div>\n\n", ret = this.invokePartial(f.postWrapperBottom, "", "postWrapperBottom", elem, void 0, _super, f, context), null != ret && (optsData += ret), optsData;
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    246 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != object ? object.post : object) ? data.isApproved : data, {
        name : "if",
        hash : {},
        fn : this.program(247, context),
        inverse : this.program(249, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    247 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "\n<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Comment score below threshold.", {
        name : "gettext",
        hash : {},
        data : task
      })) + ' <a href="#" data-action="reveal">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Show comment.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a></p>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    249 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "\n<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Your comment is awaiting moderation.", {
        name : "gettext",
        hash : {},
        data : task
      })) + ' <a href="#" data-action="reveal">' + escapeExpression(testEnvironment.gettext.call(next_scope, "See your comment.", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a>  <a href="https://help.disqus.com/customer/portal/articles/466223" class="help-icon" title="' + escapeExpression(testEnvironment.gettext.call(next_scope, "Why?", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" target="_blank"></a> </p>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    251 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "This comment is awaiting moderation.", {
        name : "gettext",
        hash : {},
        data : task
      })) + ' <a href="#" data-action="reveal">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Show comment.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a></p>\n";
    },
    /**
     * @param {Object} value
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    253 : function(value, helpers, dataAndEvents, context) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = helpers["if"].call(value, helpers.eq.call(value, null != value ? value.comments : value, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(254, context),
        inverse : this.program(256, context),
        data : context
      }), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    254 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Show One New Comment", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {Object} ret
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    256 : function(ret, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(ret, "Show %(comments)s New Comments", {
        name : "gettext",
        hash : {
          comments : null != ret ? ret.comments : ret
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    258 : function(elem, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(elem, helpers.eq.call(elem, null != elem ? elem.replies : elem, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(259, context),
        inverse : this.program(261, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    259 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="indicator"></span>' + escapeExpression(testEnvironment.gettext.call(next_scope, "Show 1 new reply", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {string} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    261 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<span class="indicator"></span>' + escapeExpression(testEnvironment.gettext.call(next_scope, "Show %(replies)s new replies", {
        name : "gettext",
        hash : {
          replies : null != next_scope ? next_scope.replies : next_scope
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {string} e
     * @return {?}
     */
    263 : function(e) {
      var s = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<!doctype html>\n<style>\nhtml * {\nmargin: 0;\npadding: 0;\ncursor: pointer;\n}\n\ndiv {\ntext-align: center;\nfont-family: "Helvetica Neue", Helvetica, sans-serif;\nborder: 2px solid #ccc;\nbackground: #f4f4f4;\ncolor: #777;\npadding: 7px 0;\nfilter: alpha(opacity=90);\nopacity: 0.9;\nfont-size: 13px;\nline-height: 1;\nz-index: 1000;\n}\n\ndiv.north {\nborder-top: 0;\nborder-radius: 0 0 4px 4px;\n}\n\ndiv.south {\nborder-bottom: 0;\nborder-radius: 4px 4px 0 0;\n}\n</style>\n<div class="' + 
      escapeExpression(s(null != e ? e.orientation : e, e)) + '" id="message">-</div>\n';
    },
    /**
     * @param {string} node
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    265 : function(node, helpers, dataAndEvents, context) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = helpers["if"].call(node, helpers.eq.call(node, null != node ? node.orientation : node, "north", {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(266, context),
        inverse : this.program(271, context),
        data : context
      }), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {Object} a
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    266 : function(a, helpers, dataAndEvents, context) {
      var chunk;
      /** @type {string} */
      var d = "";
      return chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.num : a, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(267, context),
        inverse : this.program(269, context),
        data : context
      }), null != chunk && (d += chunk), d;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    267 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "One new comment above.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {Object} obj
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    269 : function(obj, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(testEnvironment.gettext.call(obj, "%(num)s new comments above.", {
        name : "gettext",
        hash : {
          num : null != obj ? obj.num : obj
        },
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {Object} a
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    271 : function(a, helpers, dataAndEvents, context) {
      var chunk;
      /** @type {string} */
      var d = "";
      return chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.num : a, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(272, context),
        inverse : this.program(274, context),
        data : context
      }), null != chunk && (d += chunk), d;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    272 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(testEnvironment.gettext.call(next_scope, "One new comment below.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {Object} obj
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    274 : function(obj, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(testEnvironment.gettext.call(obj, "%(num)s new comments below.", {
        name : "gettext",
        hash : {
          num : null != obj ? obj.num : obj
        },
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    276 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<ul class="suggestions">\n<li class="header">\n<h5>' + escapeExpression(testEnvironment.gettext.call(next_scope, "in this conversation", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h5>\n</li>\n</ul>\n";
    },
    /**
     * @param {string} elem
     * @param {*} self
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    278 : function(elem, self, dataAndEvents, task) {
      var data_user;
      var manipulationTarget = this.lambda;
      var getAll = this.escapeExpression;
      return'<li data-cid="' + getAll(manipulationTarget(null != elem ? elem.cid : elem, elem)) + '">\n<img src="' + getAll(manipulationTarget(null != (data_user = null != elem ? elem.avatar : elem) ? data_user.cache : data_user, elem)) + '" class="avatar" alt="' + getAll(self.gettext.call(elem, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n<span>' + getAll(self.any.call(elem, null != elem ? elem.name : elem, null != elem ? elem.username : elem, {
        name : "any",
        hash : {},
        data : task
      })) + "</span>\n</li>\n";
    },
    /**
     * @param {Object} elem
     * @param {Object} obj
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    280 : function(elem, obj, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div>\n<div class="avatar">\n';
      return data = obj["if"].call(elem, null != (data = null != elem ? elem.author : elem) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(281, context),
        inverse : this.program(283, context),
        data : context
      }), null != data && (out += data), out += "</div>\n\n<div>\n<p>\n<strong>\n", data = obj["if"].call(elem, null != (data = null != elem ? elem.author : elem) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(285, context),
        inverse : this.program(287, context),
        data : context
      }), null != data && (out += data), out + "</strong>\n&mdash; " + getAll(obj.html.call(elem, null != elem ? elem.message : elem, {
        name : "html",
        hash : {},
        data : context
      })) + "\n</p>\n</div>\n</div>\n";
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    281 : function(t, testEnvironment, dataAndEvents, task) {
      var options;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != (options = null != t ? t.author : t) ? options.profileUrl : options, t)) + '" class="user" data-action="profile" data-username="' + escapeExpression(lambda(null != (options = null != t ? t.author : t) ? options.username : options, t)) + '">\n<img data-src="' + escapeExpression(lambda(null != (options = null != (options = null != t ? t.author : t) ? options.avatar : options) ? options.cache : options, t)) + '" alt="' + escapeExpression(testEnvironment.gettext.call(t, 
      "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/>\n</a>\n';
    },
    /**
     * @param {Object} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    283 : function(t, testEnvironment, dataAndEvents, task) {
      var options;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="user">\n<img data-src="' + escapeExpression(lambda(null != (options = null != (options = null != t ? t.author : t) ? options.avatar : options) ? options.cache : options, t)) + '" class="user" alt="' + escapeExpression(testEnvironment.gettext.call(t, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/>\n</div>\n';
    },
    /**
     * @param {string} t
     * @param {*} event
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    285 : function(t, event, dataAndEvents, task) {
      var elem;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a href="' + escapeExpression(lambda(null != (elem = null != t ? t.author : t) ? elem.profileUrl : elem, t)) + '" class="user" data-action="profile" data-username="' + escapeExpression(lambda(null != (elem = null != t ? t.author : t) ? elem.username : elem, t)) + '">\n' + escapeExpression(event.any.call(t, null != (elem = null != t ? t.author : t) ? elem.name : elem, null != (elem = null != t ? t.author : t) ? elem.username : elem, {
        name : "any",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {string} depth0
     * @param {*} event
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    287 : function(depth0, event, dataAndEvents, task) {
      var elem;
      var escapeExpression = this.escapeExpression;
      return'<span class="user">' + escapeExpression(event.any.call(depth0, null != (elem = null != depth0 ? depth0.author : depth0) ? elem.name : elem, null != (elem = null != depth0 ? depth0.author : depth0) ? elem.username : elem, {
        name : "any",
        hash : {},
        data : task
      })) + "</span>\n";
    },
    /**
     * @param {string} a
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} context
     * @return {?}
     */
    289 : function(a, helpers, deepDataAndEvents, context) {
      var b;
      /** @type {string} */
      var response = '<li class="top-user">\n<div class="avatar">\n';
      return b = helpers["if"].call(a, null != (b = null != a ? a.user : a) ? b.isRegistered : b, {
        name : "if",
        hash : {},
        fn : this.program(290, context),
        inverse : this.program(292, context),
        data : context
      }), null != b && (response += b), response += '</div>\n\n<div class="profile-card-text">\n<h5>\n<span>\n', b = helpers["if"].call(a, null != (b = null != a ? a.user : a) ? b.isRegistered : b, {
        name : "if",
        hash : {},
        fn : this.program(294, context),
        inverse : this.program(296, context),
        data : context
      }), null != b && (response += b), response += '</span>\n</h5>\n\n<span class="post-count">\n', b = helpers["if"].call(a, helpers.eq.call(a, null != (b = null != a ? a.user : a) ? b.numPosts : b, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(102, context),
        inverse : this.noop,
        data : context
      }), null != b && (response += b), response += "\n", b = helpers["if"].call(a, helpers.ge.call(a, null != (b = null != a ? a.user : a) ? b.numPosts : b, 2, {
        name : "ge",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(104, context),
        inverse : this.noop,
        data : context
      }), null != b && (response += b), response += "</span>\n\n", b = this.invokePartial(deepDataAndEvents.followButtonSmall, "", "followButtonSmall", a, void 0, helpers, deepDataAndEvents, context), null != b && (response += b), response + "\n</div>\n</li>\n";
    },
    /**
     * @param {string} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    290 : function(node, testEnvironment, dataAndEvents, task) {
      var p;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      return'<a href="#" class="user" data-action="profile" data-username="' + each(lambda(null != (p = null != node ? node.user : node) ? p.username : p, node)) + '">\n<img data-role="user-avatar" data-user="' + each(lambda(null != (p = null != node ? node.user : node) ? p.id : p, node)) + '" data-src="' + each(lambda(null != (p = null != (p = null != node ? node.user : node) ? p.avatar : p) ? p.cache : p, node)) + '" alt="' + each(testEnvironment.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/>\n</a>\n';
    },
    /**
     * @param {Object} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    292 : function(node, testEnvironment, dataAndEvents, task) {
      var context;
      var f = this.lambda;
      var expect = this.escapeExpression;
      return'<div class="user">\n<img data-src="' + expect(f(null != (context = null != (context = null != node ? node.user : node) ? context.avatar : context) ? context.cache : context, node)) + '" class="user" alt="' + expect(testEnvironment.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '"/>\n</div>\n';
    },
    /**
     * @param {string} node
     * @param {*} event
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    294 : function(node, event, dataAndEvents, task) {
      var elem;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      return'<a href="' + each(lambda(null != (elem = null != node ? node.user : node) ? elem.profileUrl : elem, node)) + '" data-action="profile" data-username="' + each(lambda(null != (elem = null != node ? node.user : node) ? elem.username : elem, node)) + '" data-role="username">\n' + each(event.any.call(node, null != (elem = null != node ? node.user : node) ? elem.name : elem, null != (elem = null != node ? node.user : node) ? elem.username : elem, {
        name : "any",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {string} depth0
     * @param {*} event
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    296 : function(depth0, event, dataAndEvents, task) {
      var elem;
      var escapeExpression = this.escapeExpression;
      return escapeExpression(event.any.call(depth0, null != (elem = null != depth0 ? depth0.author : depth0) ? elem.name : elem, null != (elem = null != depth0 ? depth0.author : depth0) ? elem.username : elem, {
        name : "any",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {string} a
     * @param {Object} self
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    298 : function(a, self, dataAndEvents, task) {
      var chunk;
      var md5_cmn = this.lambda;
      var safe_add = this.escapeExpression;
      /** @type {string} */
      var d = '<li data-role="thread-' + safe_add(md5_cmn(null != a ? a.id : a, a)) + '">\n\n\n<h4><span class="publisher-anchor-color"><a class="outbound-link" target="_blank" href="' + safe_add(md5_cmn(null != a ? a.url : a, a)) + '">' + safe_add(self.html.call(a, null != a ? a.title : a, {
        name : "html",
        hash : {},
        data : task
      })) + '<i aria-hidden="true" class="icon-expand"></i></a></span></h4>\n\n<ul class="meta">\n<li class="likes">\n<a href="' + safe_add(md5_cmn(null != a ? a.url : a, a)) + '">\n<span class="icon-star"></span>\n' + safe_add(self.gettext.call(a, "%(numLikes)s starred this", {
        name : "gettext",
        hash : {
          numLikes : null != a ? a.numLikes : a
        },
        data : task
      })) + "\n</a>\n</li>\n\n";
      return chunk = self["if"].call(a, self.gt.call(a, null != a ? a.numPosts : a, 0, {
        name : "gt",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(299, task),
        inverse : this.noop,
        data : task
      }), null != chunk && (d += chunk), d + '\n<li class="bullet">\u00e2\u20ac\u00a2</li>\n\n<li class="time">' + safe_add(md5_cmn(null != a ? a.timeAgo : a, a)) + '</li>\n</ul>\n\n<div class="top-thread-post" data-role="top-thread-post">\n</div>\n</li>\n';
    },
    /**
     * @param {string} a
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    299 : function(a, helpers, dataAndEvents, context) {
      var chunk;
      var md5_cmn = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var d = '<li class="bullet">\u00e2\u20ac\u00a2</li>\n\n<li class="comments">\n<a href="' + escapeExpression(md5_cmn(null != a ? a.url : a, a)) + '">\n';
      return chunk = helpers["if"].call(a, helpers.eq.call(a, null != a ? a.numPosts : a, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(102, context),
        inverse : this.program(300, context),
        data : context
      }), null != chunk && (d += chunk), d + "</a>\n</li>\n";
    },
    /**
     * @param {string} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    300 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "%(numPosts)s comments", {
        name : "gettext",
        hash : {
          numPosts : null != next_scope ? next_scope.numPosts : next_scope
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    302 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.user : object) ? data.thread : data) ? data.canReply : data, {
        name : "if",
        hash : {},
        fn : this.program(303, context),
        inverse : this.noop,
        data : context
      }), null != data && (headBuffer += data), headBuffer += '<ul class="dropdown-menu">\n', data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(308, context),
        inverse : this.program(311, context),
        data : context
      }), null != data && (headBuffer += data), headBuffer += "\n", data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.user : object) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(314, context),
        inverse : this.noop,
        data : context
      }), null != data && (headBuffer += data), headBuffer += "\n", data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isGlobalAdmin : data, {
        name : "if",
        hash : {},
        fn : this.program(321, context),
        inverse : this.noop,
        data : context
      }), null != data && (headBuffer += data), headBuffer += "\n", data = helpers.if_all.call(object, null != (data = null != object ? object.user : object) ? data.isRegistered : data, null != (data = null != (data = null != object ? object.user : object) ? data.thread : data) ? data.canReply : data, {
        name : "if_all",
        hash : {},
        fn : this.program(323, context),
        inverse : this.noop,
        data : context
      }), null != data && (headBuffer += data), headBuffer + "</ul>\n";
    },
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    303 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var out = '<a href="#" class="dropdown-toggle" data-toggle="dropdown">\n<span class="dropdown-toggle-wrapper">\n\n';
      return data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.isRegistered : data, {
        name : "if",
        hash : {},
        fn : this.program(304, context),
        inverse : this.program(306, context),
        data : context
      }), null != data && (out += data), out + '\n</span> <span class="caret"></span>\n</a>\n';
    },
    /**
     * @param {string} node
     * @param {*} self
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    304 : function(node, self, dataAndEvents, task) {
      var results;
      var callback = this.lambda;
      var each = this.escapeExpression;
      return'<span class="avatar">\n<img data-role="user-avatar" data-user="' + each(callback(null != (results = null != node ? node.user : node) ? results.id : results, node)) + '" data-src="' + each(callback(null != (results = null != (results = null != node ? node.user : node) ? results.avatar : results) ? results.cache : results, node)) + '" alt="' + each(self.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n</span>\n<span class="username" data-role="username" data-username="' + each(callback(null != (results = null != node ? node.user : node) ? results.username : results, node)) + '">\n' + each(self.any.call(node, null != (results = null != node ? node.user : node) ? results.name : results, null != (results = null != node ? node.user : node) ? results.username : results, {
        name : "any",
        hash : {},
        data : task
      })) + "\n</span>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    306 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<span>\n" + escapeExpression(testEnvironment.gettext.call(next_scope, "Login", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</span>\n";
    },
    /**
     * @param {string} node
     * @param {?} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    308 : function(node, helpers, dataAndEvents, task) {
      var val;
      var lambda = this.lambda;
      var each = this.escapeExpression;
      /** @type {string} */
      var total = '<li>\n<a href="' + each(lambda(null != (val = null != node ? node.user : node) ? val.profileUrl : val, node)) + '" data-role="user-profile-link" data-action="profile" data-username="' + each(lambda(null != (val = null != node ? node.user : node) ? val.username : val, node)) + '">\n' + each(helpers.gettext.call(node, "Your Profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + '\n</a>\n</li>\n<li>\n<a href="#" class="media-toggle-on" data-action="toggle-media">' + each(helpers.gettext.call(node, "Display Media", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a>\n<a href="#" class="media-toggle-off" data-action="toggle-media">' + each(helpers.gettext.call(node, "Hide Media", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</li>\n";
      return val = helpers.unless.call(node, null != (val = null != node ? node.user : node) ? val.remote : val, {
        name : "unless",
        hash : {},
        fn : this.program(309, task),
        inverse : this.noop,
        data : task
      }), null != val && (total += val), total;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    309 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li>\n<a href="' + escapeExpression(testEnvironment.urlfor.call(next_scope, "editProfile", {
        name : "urlfor",
        hash : {},
        data : task
      })) + '">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Edit Settings", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</li>\n";
    },
    /**
     * @param {string} ev
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    311 : function(ev, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = "\n";
      return data = helpers["if"].call(ev, null != (data = null != ev ? ev.sso : ev) ? data.url : data, {
        name : "if",
        hash : {},
        fn : this.program(312, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '\n<li>\n<a href="#" data-action="auth:reflect">Reflect</a>\n</li>\n<li>\n<a href="#" data-action="auth:facebook">Facebook</a>\n</li>\n<li>\n<a href="#" data-action="auth:twitter">Twitter</a>\n</li>\n<li>\n<a href="#" data-action="auth:google">Google</a>\n</li>\n';
    },
    /**
     * @param {string} t
     * @return {?}
     */
    312 : function(t) {
      var left;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<li class="sso">\n<a href="#" data-action="auth:sso">' + escapeExpression(lambda(null != (left = null != t ? t.sso : t) ? left.name : left, t)) + "</a>\n</li>\n";
    },
    /**
     * @param {Object} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    314 : function(object, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var out = '<li data-role="toggle-thread">\n<a href="#" data-action="toggle-thread">\n';
      return data = helpers["if"].call(object, null != (data = null != object ? object.thread : object) ? data.isClosed : data, {
        name : "if",
        hash : {},
        fn : this.program(315, context),
        inverse : this.program(317, context),
        data : context
      }), null != data && (out += data), out += "</a>\n</li>\n\n", data = helpers.unless.call(object, null != (data = null != object ? object.user : object) ? data.isGlobalAdmin : data, {
        name : "unless",
        hash : {},
        fn : this.program(319, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    315 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Open Thread", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    317 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Close Thread", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    319 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li>\n<a href="https://docs.disqus.com/kb/2012/">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Help", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</li>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    321 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li>\n<a href="#" data-action="debug">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Debug", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</a>\n</li>\n\n<li>\n<a href="#" data-action="repair">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Repair", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</li>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    323 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<li>\n<a href="#" data-action="logout">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Logout", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</li>\n";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} value
     * @param {Object} test
     * @param {?} environment
     * @param {Object} options
     * @return {?}
     */
    main : function(value, test, environment, options) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = test.partial.call(value, "followButton", {
        name : "partial",
        hash : {},
        fn : this.program(1, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "anonDownvoteCard", {
        name : "partial",
        hash : {},
        fn : this.program(11, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "anonUpvoteCard", {
        name : "partial",
        hash : {},
        fn : this.program(13, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "blacklist", {
        name : "partial",
        hash : {},
        fn : this.program(15, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "blacklistErrorMessage", {
        name : "partial",
        hash : {},
        fn : this.program(18, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "communityForum", {
        name : "partial",
        hash : {},
        fn : this.program(20, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "contextCard", {
        name : "partial",
        hash : {},
        fn : this.program(22, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "edit", {
        name : "partial",
        hash : {},
        fn : this.program(33, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "emailVerifyAlert", {
        name : "partial",
        hash : {},
        fn : this.program(35, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "followButtonSmall", {
        name : "partial",
        hash : {},
        fn : this.program(37, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "formUser", {
        name : "partial",
        hash : {},
        fn : this.program(50, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "form", {
        name : "partial",
        hash : {},
        fn : this.program(52, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "loginForm", {
        name : "partial",
        hash : {},
        fn : this.program(64, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "loginButtons", {
        name : "partial",
        hash : {},
        fn : this.program(69, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "guestForm", {
        name : "partial",
        hash : {},
        fn : this.program(79, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "audienceSync", {
        name : "partial",
        hash : {},
        fn : this.program(90, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "highlightedPost", {
        name : "partial",
        hash : {},
        fn : this.program(92, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "hovercard", {
        name : "partial",
        hash : {},
        fn : this.program(94, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "hovercardCounters", {
        name : "partial",
        hash : {},
        fn : this.program(101, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "hovercardActions", {
        name : "partial",
        hash : {},
        fn : this.program(110, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "layout", {
        name : "partial",
        hash : {},
        fn : this.program(113, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postSort", {
        name : "partial",
        hash : {},
        fn : this.program(118, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postCount", {
        name : "partial",
        hash : {},
        fn : this.program(127, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "topNavigation", {
        name : "partial",
        hash : {},
        fn : this.program(130, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "threadVotes", {
        name : "partial",
        hash : {},
        fn : this.program(137, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "secondaryNavigation", {
        name : "partial",
        hash : {},
        fn : this.program(150, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "threadShareMenu", {
        name : "partial",
        hash : {},
        fn : this.program(153, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "notificationMenu", {
        name : "partial",
        hash : {},
        fn : this.program(155, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "onboard", {
        name : "partial",
        hash : {},
        fn : this.program(157, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "post", {
        name : "partial",
        hash : {},
        fn : this.program(164, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postWrapperTop", {
        name : "partial",
        hash : {},
        fn : this.program(187, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postWrapperBottom", {
        name : "partial",
        hash : {},
        fn : this.program(194, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postVotes", {
        name : "partial",
        hash : {},
        fn : this.program(196, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postMenu", {
        name : "partial",
        hash : {},
        fn : this.program(201, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postFooter", {
        name : "partial",
        hash : {},
        fn : this.program(219, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postUserAvatar", {
        name : "partial",
        hash : {},
        fn : this.program(233, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "highlightedSuccessMessage", {
        name : "partial",
        hash : {},
        fn : this.program(241, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postDeleted", {
        name : "partial",
        hash : {},
        fn : this.program(243, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "postMinimized", {
        name : "partial",
        hash : {},
        fn : this.program(245, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "realtimeCommentNotification", {
        name : "partial",
        hash : {},
        fn : this.program(253, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "realtimeReplyNotification", {
        name : "partial",
        hash : {},
        fn : this.program(258, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "realtimeIndicator", {
        name : "partial",
        hash : {},
        fn : this.program(263, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "realtimeIndicatorText", {
        name : "partial",
        hash : {},
        fn : this.program(265, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "suggestions", {
        name : "partial",
        hash : {},
        fn : this.program(276, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "suggestedUser", {
        name : "partial",
        hash : {},
        fn : this.program(278, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "topThreadPost", {
        name : "partial",
        hash : {},
        fn : this.program(280, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "topUser", {
        name : "partial",
        hash : {},
        fn : this.program(289, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "topThread", {
        name : "partial",
        hash : {},
        fn : this.program(298, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "userMenu", {
        name : "partial",
        hash : {},
        fn : this.program(302, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData;
    },
    usePartial : true,
    useData : true
  });
}), define("lounge/views", ["jquery", "underscore", "backbone", "loglevel", "stance", "moment", "modernizr", "core/api", "core/UniqueModel", "core/mixins/withAlert", "core/models/ThreadVote", "core/models/Vote", "remote/config", "common/models", "common/collections", "common/utils", "core/bus", "core/strings", "common/urls", "core/analytics/jester", "common/views/mixins", "common/Session", "common/templates", "common/keys", "core/time", "core/utils", "core/switches", "core/WindowBus", "common/outboundlinkhandler", 
"shared/corefuncs", "core/mixins/withEmailVerifyLink", "shared/urls", "lounge/common", "lounge/menu-handler", "lounge/mixins", "lounge/realtime", "lounge/views/posts/PostReplyView", "lounge/views/posts/collection", "lounge/views/media", "lounge/views/onboard-alert", "lounge/views/notification-menu", "lounge/views/highlighted-post", "lounge/views/realtime", "lounge/views/posts/UserSuggestionsManager", "lounge/views/viglink", "lounge/views/sidebar", "lounge/views/recommend-button", "lounge/tracking", 
"templates/lounge", "common/main", "common/collections/profile"], function($, self, Backbone, utils, view, moment, _m, test, User, fn, Client, CommonModel, desc, thread, opt_keys, dojo, obj, http, thing, me, parent, store, res, textAlt, positionError, p, dataAndEvents, execResult, keepData, oFunctionBody, S, response, opt_attributes, loginController, info, Component, Form, posts, field, session, Mask, el, views, matcherFunction, deepDataAndEvents, sidebar, ignoreMethodDoesntExist, gridStore, forEach, 
elementData) {
  /**
   * @param {string} str
   * @return {?}
   */
  function log(str) {
    var n = {};
    if (!str) {
      return n;
    }
    var units = str.match(/discovery\-([\w\-]+)/);
    n.discoveryOverride = units && units[1];
    units = str.match(/\bsponsored-comment-ad-id=(\d+)/);
    n.sponsoredCommentAdId = units && units[1];
    units = str.match(/\brequest-bin=([\w:-]+)/);
    n.discoveryRequestBin = units && units[1];
    var cs = str.match(/\bgutter-switch=([\w:-]+)/);
    return cs && (cs[1] && (n.gutterSwitch = cs[1])), n;
  }
  var getter = http.get;
  var pl = p.preventDefaultHandler;
  var that = new execResult;
  var GameMsg = Backbone.View.extend({
    events : {
      "click [data-action=subscribe]" : "subscribe",
      "keydown #thread-subscribe-email" : "subscribeKeypress"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.thread = req.thread;
      this.session = req.session;
      this.listenTo(this.thread, "change:userSubscription", this.updateStatus);
      this.updateStatus();
      this._boundDocumentClickHandler = self.bind(this._documentClickHandler, this);
    },
    /**
     * @return {undefined}
     */
    updateStatus : function() {
      if (this.thread.get("userSubscription")) {
        this.$el.addClass("subscribed");
      } else {
        this.$el.removeClass("subscribed");
      }
    },
    subscribe : pl(function() {
      var subscribe = this.thread.get("userSubscription");
      if (this.session.isLoggedOut() && !subscribe) {
        this.showForm();
      } else {
        this.thread.subscribe(!subscribe);
      }
    }),
    /**
     * @return {undefined}
     */
    showForm : function() {
      var plugin = this;
      this._unbindDocumentClickHandler();
      self.defer(function() {
        $(document.body).on("click", plugin._boundDocumentClickHandler);
      });
      plugin.$el.addClass("show-form").find("input")[0].focus();
    },
    /**
     * @param {Event} evt
     * @return {undefined}
     */
    _documentClickHandler : function(evt) {
      if ("thread-subscribe-email" !== evt.target.id) {
        this.hideForm();
      }
    },
    /**
     * @return {undefined}
     */
    _unbindDocumentClickHandler : function() {
      $(document.body).off("click", this._boundDocumentClickHandler);
    },
    /**
     * @return {undefined}
     */
    hideForm : function() {
      this._unbindDocumentClickHandler();
      this.$el.removeClass("show-form").find("input")[0].blur();
    },
    /**
     * @param {Object} e
     * @return {?}
     */
    subscribeKeypress : function(e) {
      var $input = this.$el.find("input");
      if ($input.removeClass("alert error"), "Esc" === e.key || 27 === e.keyCode) {
        return void this.hideForm();
      }
      if ("Enter" === e.key || 13 === e.keyCode) {
        var target = e.target.value;
        if (!p.validateEmail(target)) {
          return void $input.addClass("alert error");
        }
        this.hideForm();
        this.thread.subscribe(true, target);
      }
    }
  });
  var subject = Backbone.View.extend({
    /**
     * @return {?}
     */
    topEdgeOffset : function() {
      return-opt_attributes.getLounge().getPosition().height;
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      /** @type {Object} */
      this.options = options;
      /** @type {null} */
      this.hasLoaded = null;
      this.listenToOnce(view(this), "enter", this.loadImage);
    },
    /**
     * @return {undefined}
     */
    loadImage : function() {
      var scope = this;
      if (!scope.hasLoaded) {
        /**
         * @param {string} type
         * @return {?}
         */
        var callback = function(type) {
          return function() {
            scope.trigger(type);
            scope.$el.off(".deferredMediaView");
            if (scope.relatedPost) {
              opt_attributes.getLounge().postsView.onDeferredViewReady(scope.relatedPost);
            }
          };
        };
        scope.$el.on("load.deferredMediaView", callback("load"));
        scope.$el.on("error.deferredMediaView", callback("error"));
        scope.$el.attr("src", scope.options.url);
        /** @type {boolean} */
        scope.hasLoaded = true;
      }
    }
  });
  var BlockType = Backbone.View.extend({
    tagName : "ul",
    className : "debug",
    /**
     * @param {(Array|string)} values
     * @return {undefined}
     */
    initialize : function(values) {
      /** @type {(Array|string)} */
      this.values = values;
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(self.reduce(this.values, function(otag, dataAndEvents, ctag) {
        return otag + "<li><strong>" + ctag + "</strong>: " + dataAndEvents + "</li>";
      }, "")), this;
    }
  });
  var PageEditView = Backbone.View.extend({
    /**
     * @param {string} param
     * @return {undefined}
     */
    initialize : function(param) {
      self.extend(this, param);
      this.listenTo(this.session, "change:id", this.render);
      this.listenTo(field.settings, "change:collapsed", this.onMediaCollapseChange);
    },
    /**
     * @return {?}
     */
    render : function() {
      var templateString = res.render("userMenu", {
        user : this.session.toJSON(),
        thread : this.thread.toJSON(),
        feedbackUrl : this.getSurveyMonkeyUrl(),
        sso : this.session.get("sso")
      });
      return this.$el.html(templateString), this.onMediaCollapseChange(), this;
    },
    /**
     * @return {undefined}
     */
    onMediaCollapseChange : function() {
      if (field.settings.get("collapsed")) {
        this.$el.addClass("media-collapsed");
      } else {
        this.$el.removeClass("media-collapsed");
      }
    },
    /**
     * @return {?}
     */
    getSurveyMonkeyUrl : function() {
      var dig;
      /** @type {string} */
      var inner = "https://www.surveymonkey.com/s/5RBPTTZ";
      var c = this.referrerUrl;
      var inset = this.session.user.id;
      /** @type {Array} */
      dig = inset ? [inset, c] : [c];
      /** @type {string} */
      var arr = "?c=" + encodeURIComponent(dig.join(";"));
      return inner + arr;
    }
  });
  var Collection = Backbone.View.extend({
    events : {
      "click [data-action=share\\:twitter]" : "_onShare",
      "click [data-action=share\\:facebook]" : "_onShare"
    },
    _onShare : pl(function(evt) {
      var model = dojo.extractService(evt.target, "share");
      if (model) {
        if (this.sharers[model]) {
          opt_attributes.getLounge().trigger("uiAction:threadShare", model);
          this.share(model);
        }
      }
    }),
    /**
     * @return {?}
     */
    _shareUrl : function() {
      return this.model.permalink();
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(res.render("threadShareMenu")), this;
    }
  });
  self.extend(Collection.prototype, info.ShareMixin);
  var config = Backbone.View.extend({
    events : {
      "click [data-action^=auth\\:]" : "handleAuth",
      "click [data-action=logout]" : "handleLogout",
      "click [data-action=audiencesync]" : "audienceSync",
      "click [data-action=profile]" : "handleShowProfile",
      "click [data-action=onboard]" : "handleShowOnboarding",
      "click [data-action=community-sidebar]" : "handleShowCommunitySidebar",
      "click [data-action=sort]" : "handleSort",
      "click [data-action=toggle-thread]" : "toggleThread",
      "click [data-action=debug]" : "renderDebugInfo",
      "click [data-action=repair]" : "repairThread",
      "click [data-action=toggle-media]" : "toggleMedia",
      "click a" : "handleLinkClick"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      opt_attributes.setLounge(this);
      options = options || {};
      var data = options.jsonData || {};
      /** @type {string} */
      this.language = document.documentElement.lang;
      this.initialData = data.response || {};
      this.cleanInitialData(this.initialData);
      this.onboardWindowName = dojo.globalUniqueId("reflect_");
      if (this.initialData.forum) {
        if (this.initialData.forum.id) {
          thing.moderate = dojo.updateURL(thing.moderate, {
            hostname : this.initialData.forum.id + "."
          });
        }
      }
      /** @type {Array} */
      this.deferredViews = [];
      /** @type {Array} */
      this.unsortedDeferredViews = [];
      store.setDefaults(this.initialData.session);
      this.session = store.get();
      this.forum = new thread.Forum;
      this.forum.set(this.initialData.forum);
      this.thread = new thread.Thread(this.initialData.thread, {
        forum : this.forum,
        postCursor : data.cursor,
        moderators : (this.initialData.thread || {}).moderators,
        order : data.order
      });
      this.initUserSuggestionsManager();
      this.postsView = new posts.PostCollectionView({
        posts : this.thread.posts,
        thread : this.thread,
        lounge : this,
        session : this.session,
        el : this.el,
        userSuggestions : this.userSuggestions
      });
      this.states = {
        realtimeIndicatorsCreated : false,
        streamingPaused : false,
        discoveryLoaded : false,
        inViewport : false
      };
      elementData.timings.loungeStart = $.now();
      var callback = self.bind(this.bootstrap, this);
      if (dojo.isIframed(window)) {
        this.listenTo(obj.frame, "init", callback);
      } else {
        self.defer(callback);
      }
      this.setAlertSelector("#layout");
      this.initResizeHandler();
      this.initAlertListeners();
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    cleanInitialData : function(data) {
      var currentItem = data.thread && data.thread.highlightedPost;
      if (currentItem) {
        /** @type {boolean} */
        currentItem.isHighlighted = true;
      }
      self.each(data.posts, function(sibling) {
        /** @type {boolean} */
        sibling.isHighlighted = currentItem ? sibling.id === currentItem.id : false;
      });
    },
    /**
     * @return {undefined}
     */
    initAlertListeners : function() {
      this.listenTo(this.session, "alert", this.alert);
    },
    /**
     * @return {undefined}
     */
    initOnboardAlert : function() {
      var view = this.onboardAlert = new session.OnboardAlert({
        session : this.session
      });
      this.proxyViewEvents(this.onboardAlert);
      this.listenTo(this.session, "change:id", function() {
        view.setInitialCookie();
        view.render().$el.appendTo("#onboard");
      });
      this.listenTo(obj.frame, {
        "onboard.complete" : self.bind(view.showHomeMessage, view),
        /**
         * @return {undefined}
         */
        "onboardAlert.show" : function() {
          view.render().$el.appendTo("#onboard");
        }
      });
      this.listenToOnce(this, "uiCallback:postCreated", function() {
        if (view.shouldPopup()) {
          view.setPopupCookie();
          /** @type {string} */
          var r20 = this.session.user.isEditable(this.session) ? "complete-profile" : "follow";
          this.showOnboarding(r20);
        }
      });
      this.listenTo(obj.frame, "onboard.profileUpdated", this.updateSessionUser);
    },
    /**
     * @return {undefined}
     */
    updateSessionUser : function() {
      if (!this.updateUserFromSession()) {
        this.session.user.fetch({
          reset : true
        });
      }
    },
    /**
     * @return {?}
     */
    updateUserFromSession : function() {
      var session = this.session.user;
      var key = _m.sessionstorage && window.sessionStorage.getItem("onboard.profileUpdated");
      if (!key) {
        return false;
      }
      try {
        /** @type {*} */
        var camelKey = JSON.parse(key);
        session.set(camelKey);
      } catch (d) {
        return false;
      } finally {
        window.sessionStorage.removeItem("onboard.profileUpdated");
      }
      return true;
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    bootstrap : function(options) {
      var data = this;
      var headers = {};
      data.config = options = options || dojo.getConfigFromHash(window);
      data.hashConfig = new Backbone.Model(log(options.parentWindowHash));
      data.listenTo(this.hashConfig, "change:discoveryOverride change:sponsoredCommentAdId", self.bind(data.session.fetch, data.session));
      if (!options.discovery) {
        options.discovery = {};
      }
      if (options.apiKey) {
        headers["X-Reflect-Publisher-API-Key"] = options.apiKey;
      }
      if (options.remoteAuthS3) {
        headers["X-Reflect-Remote-Auth"] = options.remoteAuthS3;
      }
      if (!self.isEmpty(headers)) {
        test.headers(headers);
      }
      if (data.isForceHttpsAPIEnabled()) {
        test.defaults({
          secure : true
        });
      }
      if (options.anchorColor) {
        !function() {
          var a = p.escapeColor(options.anchorColor);
          dojo.addStylesheetRules([[".publisher-anchor-color a", ["color", a, true]], ["a.publisher-anchor-color", ["color", a, true]], [".publisher-anchor-hover a:hover", ["color", a, true]], ["a.publisher-anchor-hover:hover", ["color", a, true]], [".active .publisher-nav-color:after", ["background", a, true]], [".media-preview .active.publisher-border-color", ["border-color", a, true]], [".publisher-color", ["color", a, false]], [".publisher-color:hover", ["color", a, false]], [".publisher-background-color", 
          ["background-color", a, false]], [".publisher-border-color", ["border-color", a, false]]]);
        }();
      }
      dojo.injectBaseElement();
      if (options.referrer) {
        data.thread.currentUrl = options.referrer;
      }
      if (options.width) {
        /** @type {string} */
        document.body.style.width = options.width + "px";
      }
      var params = this.getPermalinkOptions(options.parentWindowHash);
      if (params) {
        obj.frame.once("embed.rendered", self.bind(data.scrollToPost, data, params.postId, params.options));
      }
      if (options.sso) {
        data.session.set("sso", options.sso);
      }
      data.position = options.initialPosition ? options.initialPosition : dojo.calculatePositionFullscreen();
      data.updateModeratorText();
      data.initUI();
      data.bindBusListeners();
      data.initHighlightedPost();
      var timings = elementData.timings;
      timings.hostStart = options.timestamp || timings.initStart;
      data.listenToOnce(data.postsView, "render:start", function() {
        timings.renderStart = $.now();
      });
      data.listenToOnce(data.postsView, "render:end", data.sendTelemetry);
      timings.bootstrapStart = $.now();
      data.postsView.bootstrap(data.initialData, params);
      data.initAfterPostCreateHandler();
      data.initSession();
      data.initLinkHandler();
      /** @type {boolean} */
      data.initialized = true;
      data.trigger("bootstrap:complete", data);
    },
    /**
     * @param {string} result
     * @param {string} text
     * @return {?}
     */
    _isInHome : function(result, text) {
      /** @type {RegExp} */
      var cx = /^(?:https?:)?\/\/(?:www.)?/;
      return result = result.replace(cx, ""), text = text.replace(cx, ""), 0 === result.indexOf(text);
    },
    /**
     * @return {?}
     */
    isInHome : function() {
      var expectationResult = this.config.referrer;
      if (expectationResult) {
        return this._isInHome(expectationResult, response.apps.home + "home/");
      }
    },
    /**
     * @return {undefined}
     */
    initSession : function() {
      var config = this.config;
      this.session.start({
        remoteAuthS3 : config.remoteAuthS3,
        sso : config.sso,
        apiKey : config.apiKey,
        thread : this.thread
      });
      this.listenTo(this.session, "change:id", this.loadDiscovery);
      if (this.session.shouldFetchSession()) {
        this.session.fetch();
      } else {
        this.session.setUser(this.session.getAnonUserInstance());
      }
    },
    /**
     * @return {undefined}
     */
    initAfterPostCreateHandler : function() {
      this.listenTo(this.thread, "create", function(model) {
        var e = model.toJSON();
        obj.frame.sendHostMessage("posts.create", e);
        that.broadcast("posts.create", self.pick(e, "forum", "parent", "id"));
      });
    },
    /**
     * @return {?}
     */
    isForceHttpsAPIEnabled : function() {
      var base = desc.lounge;
      return "withCredentials" in new window.XMLHttpRequest && (base && (self.random(0, 100) < 100 * base.force_https_sample_rate || base.force_https_enabled_forums && base.force_https_enabled_forums.hasOwnProperty(this.forum.id)));
    },
    /**
     * @return {?}
     */
    sendTelemetry : function() {
      if (dojo.shouldSample(desc.lounge.telemetry_sample_percent)) {
        var render = $.now();
        var timings = elementData.timings;
        var c = {
          frame : timings.initStart - timings.hostStart,
          asset : timings.downloadEnd - timings.initStart,
          render : render - timings.renderStart,
          total : render - timings.hostStart - (timings.renderStart - timings.bootstrapStart)
        };
        /** @type {(Performance|null)} */
        var args = window.performance;
        if (args) {
          /** @type {(PerformanceTiming|null)} */
          var t = args.timing;
          if (t.responseStart) {
            /** @type {number} */
            c.frame_rtt = t.responseStart - t.navigationStart;
          }
          var wrapper = self.find(args.getEntries && args.getEntries() || [], function(exception) {
            return exception.name.indexOf("/next/config.js") > -1;
          });
          if (wrapper) {
            if (wrapper.responseStart) {
              /** @type {number} */
              c.config_rtt = wrapper.responseStart - wrapper.startTime;
            }
          }
        }
        return me.telemetry("lounge", c);
      }
    },
    /**
     * @return {undefined}
     */
    initUI : function() {
      this.applyPublisherClasses();
      forEach();
      this.renderLayout();
      this.setAlertSelector("#global-alert");
      this.bindUIUpdateHandlers();
      this.initDeferredViews();
      this.postsView.once("render:end", function() {
        var height = dojo.getPageHeight();
        obj.frame.sendHostMessage("rendered", {
          height : height
        });
        this._lastHeight = height;
        this.initRealtime();
      }, this);
      self.defer(self.bind(this.initUIComponents, this));
    },
    /**
     * @return {undefined}
     */
    initUIComponents : function() {
      this.initMainPostBox();
      this.updatePostCount();
      if (!this.isInHome()) {
        this.initUserMenu();
        this.initOnboardAlert();
        this.initNotificationMenu();
      }
      if (!(this.isInHome() && dataAndEvents.isFeatureActive("home_hide_recommend"))) {
        this.initRecommendButton();
      }
      if (!(this.isInHome() && dataAndEvents.isFeatureActive("home_hide_share"))) {
        this.initThreadShareMenu();
      }
      this.initThreadSubscribe();
      this.bindProfileUIListeners(this.session);
    },
    /**
     * @return {undefined}
     */
    initHighlightedPost : function() {
      var udataCur = this.thread.get("highlightedPost");
      if (udataCur) {
        this.thread.posts.add(udataCur);
      }
      this.highlightedPostView = new el.HighlightedPostView({
        el : $("#highlighted-post"),
        thread : this.thread,
        session : this.session,
        userSuggestions : this.userSuggestions
      });
      this.highlightedPostView.reset();
    },
    /**
     * @return {undefined}
     */
    bindUIUpdateHandlers : function() {
      var self = this;
      var b = self.thread;
      var e = self.session;
      self.listenTo(b, {
        "change:posts" : self.updatePostCount
      });
      self.listenTo(b.queue, "add reset", self.toggleRealtimeNotifications);
      self.postsView.bindUIUpdateHandlers();
      self.listenTo(e, "change:id", self.updateThreadSessionData);
      self.listenTo(self, "scrollOffViewport", function() {
        if (this.states.realtimeIndicatorsCreated) {
          obj.frame.sendHostMessage("indicator:hide");
        }
      });
      self.listenTo(self, "scroll", function(position) {
        this.position = position;
      });
      self.listenTo(self, "scroll", self.handleRealtimeScroll);
      self.listenTo(self.postsView, "render:end", self.toggleRealtimeNotifications);
    },
    /**
     * @param {?} obj
     * @return {undefined}
     */
    relayScrollToStance : function(obj) {
      view.scroll({
        top : obj.pageOffset - obj.frameOffset.top,
        height : obj.height
      });
    },
    /**
     * @return {undefined}
     */
    initDeferredViews : function() {
      this.listenTo(this, "scroll", this.createDeferredViewsForImages);
      this.listenTo(this, "domReflow", function() {
        view.invalidate();
        if (this.position) {
          this.createDeferredViewsForImages();
          this.relayScrollToStance(this.position);
        }
      });
    },
    /**
     * @return {undefined}
     */
    bindBusListeners : function() {
      this.listenTo(obj.frame, {
        /**
         * @param {string} data
         * @return {undefined}
         */
        "window.hashchange" : function(data) {
          this.hashConfig.set(log(data));
          var params = this.getPermalinkOptions(data);
          if (params) {
            this.scrollToPost(params.postId, params.options);
          }
        },
        /**
         * @param {?} walkers
         * @return {undefined}
         */
        "window.scroll" : function(walkers) {
          this.trigger("scroll", walkers);
          this.relayScrollToStance(walkers);
        },
        /**
         * @return {undefined}
         */
        "window.inViewport" : function() {
          /** @type {boolean} */
          this.states.inViewport = true;
          this.trigger("inViewport");
        },
        /**
         * @return {undefined}
         */
        "window.scrollOffViewport" : function() {
          /** @type {boolean} */
          this.states.inViewport = false;
          this.trigger("scrollOffViewport");
        },
        "window.resize" : this.resize,
        "indicator:click" : this.handleRealtimeClick
      });
      this.listenToOnce(this.session, "change:id", this.initSidebar);
    },
    /**
     * @return {?}
     */
    isLinkAffiliatorEnabled : function() {
      return this.forum.get("settings").linkAffiliationEnabled && !this.isInHome();
    },
    /**
     * @return {undefined}
     */
    initLinkHandler : function() {
      this.outboundLinkHandler = new keepData;
      this.outboundLinkHandler.registerBeforeNavigationHandler(this.logLinkClick, this);
      if (this.isLinkAffiliatorEnabled()) {
        if (!this.initLinkAffiliatorCalled) {
          this.viglink = new deepDataAndEvents({
            forumPk : this.forum.get("pk"),
            linkAffiliatorClient : thing.linkAffiliatorClient,
            linkAffiliatorAPI : thing.linkAffiliatorAPI,
            viglinkAPI : textAlt.viglinkAPI
          });
          this.listenTo(obj.frame, "viglink:change:timeout", function(options) {
            this.outboundLinkHandler.timeout = options.timeout;
          });
          /** @type {boolean} */
          this.initLinkAffiliatorCalled = true;
          this.outboundLinkHandler.registerBeforeNavigationHandler(this.viglink.fetchAffiliateLink, this.viglink);
        }
      }
    },
    /**
     * @param {Event} e
     * @return {undefined}
     */
    handleLinkClick : function(e) {
      this.outboundLinkHandler.handleClick(e);
    },
    /**
     * @return {undefined}
     */
    initRealtimeIndicators : function() {
      if (!this.states.realtimeIndicatorsCreated) {
        var entry = {
          contents : res.render("realtimeIndicator", {
            orientation : "north"
          })
        };
        var ret = {
          contents : res.render("realtimeIndicator", {
            orientation : "south"
          })
        };
        obj.frame.sendHostMessage("indicator:init", {
          north : entry,
          south : ret
        });
        /** @type {boolean} */
        this.states.realtimeIndicatorsCreated = true;
      }
    },
    insertStreamingComments : self.throttle(function() {
      var queue = this.thread.queue;
      queue.drain();
      self.each(queue.counters.replies, function(dataAndEvents, fn) {
        queue.drain(fn);
      });
    }, 1E3),
    /**
     * @return {undefined}
     */
    updateModeratorText : function() {
      var asJson = this.forum.get("settings");
      if (asJson.moderatorText) {
        http.translations.Mod = asJson.moderatorText;
      }
    },
    /**
     * @param {Event} data
     * @return {?}
     */
    logLinkClick : function(data) {
      var r = $(data.currentTarget);
      if (dojo.clickShouldBeLogged(data, r)) {
        return me.client.emit({
          verb : "click",
          object_type : "link",
          object_id : r[0].href,
          area : gridStore.getEventTrackingArea(data)
        });
      }
    },
    /**
     * @param {?} arg
     * @return {undefined}
     */
    handleRealtimeScroll : function(arg) {
      if (this.states.inViewport && this.states.realtimeIndicatorsCreated) {
        var which = self.union([this.queueView], self.values(this.postsView.subViews));
        /** @type {number} */
        var n = 0;
        /** @type {number} */
        var percentValue = 0;
        self.each(which, function(item) {
          if (item && (!item.getDirection && (item = item.queueView)), item && !(item.options.count <= 0)) {
            var keyName = item.getDirection(arg);
            if (1 === keyName) {
              n += item.options.count;
            } else {
              if (-1 === keyName) {
                percentValue += item.options.count;
              }
            }
          }
        });
        var r20;
        var tile;
        tile = {
          type : "north"
        };
        if (n > 0) {
          /** @type {string} */
          r20 = "indicator:show";
          tile.content = res.render("realtimeIndicatorText", {
            num : n,
            orientation : "north"
          });
        } else {
          /** @type {string} */
          r20 = "indicator:hide";
        }
        obj.frame.sendHostMessage(r20, tile);
        tile = {
          type : "south"
        };
        if (percentValue > 0) {
          tile.content = res.render("realtimeIndicatorText", {
            num : percentValue,
            orientation : "south"
          });
          /** @type {string} */
          r20 = "indicator:show";
        } else {
          /** @type {string} */
          r20 = "indicator:hide";
        }
        obj.frame.sendHostMessage(r20, tile);
      }
    },
    /**
     * @param {string} paramType
     * @return {undefined}
     */
    handleRealtimeClick : function(paramType) {
      var one = this;
      obj.frame.sendHostMessage("indicator:hide", {
        type : paramType
      });
      var scope;
      var lastValue;
      var pickWinTop;
      var results = self.union([one], self.toArray(one.postsView.subViews));
      results = self.filter(results, function(node) {
        if (node = node.queueView, !node || node.options.count <= 0) {
          return false;
        }
        /** @type {number} */
        var d = "north" === paramType ? 1 : -1;
        return node.getDirection(one.position) !== d ? false : true;
      });
      results = self.sortBy(results, function(scope) {
        return scope === one ? 0 : scope.offset.top;
      });
      scope = "north" === paramType ? self.last(results) : self.first(results);
      lastValue = scope.queueView;
      if (scope === one) {
        /** @type {number} */
        pickWinTop = 0;
        lastValue.handleDrain();
      } else {
        /** @type {number} */
        pickWinTop = scope.offset.top - 100;
        lastValue.handleDrain();
      }
      opt_attributes.getLounge().once("domReflow", self.bind(obj.frame.sendHostMessage, obj.frame, "scrollTo", {
        top : pickWinTop
      }));
    },
    /**
     * @return {?}
     */
    toggleRealtimeNotifications : function() {
      var data = this;
      var note = data.thread.queue;
      if (self.defer(function() {
        obj.frame.sendHostMessage("fakeScroll");
      }), !note.length) {
        return void $("[data-role=realtime-notification]").hide();
      }
      if (data.thread.get("hasStreaming")) {
        return void data.insertStreamingComments();
      }
      if (note.counters.comments) {
        var t = data.queueView || new views.QueuedPostView({
          model : data.thread,
          el : data.$el.find("button[data-role=realtime-notification]")
        });
        data.queueView = t;
        t.setCount(note.counters.comments);
        t.render();
      }
      self.each(note.counters.replies, function(opt_obj, cookieName) {
        var value = data.thread.posts.get(cookieName);
        if (value) {
          var self = data.postsView.getPostView(value.cid);
          if (self) {
            var f = self.queueView;
            if (!f) {
              f = new views.QueuedReplyView({
                thread : data.thread,
                postView : self,
                model : value,
                el : self.$el.find("[data-role=realtime-notification\\:" + cookieName + "] a")
              });
              self.queueView = f;
            }
            f.setCount(opt_obj);
            f.render();
          }
        }
      });
    },
    renderDebugInfo : pl(function() {
      if (this.session.user.get("isGlobalAdmin")) {
        var self = new BlockType({
          Shortname : this.thread.get("forum"),
          "Thread ID" : this.thread.get("id"),
          "Thread slug" : this.thread.get("slug"),
          "Anchor color" : p.escapeColor(this.config.anchorColor)
        });
        self.render();
        /** @type {(HTMLElement|null)} */
        var root = document.body;
        root.insertBefore(self.el, root.firstChild);
      }
    }),
    repairThread : pl(function() {
      if (this.session.user.get("isGlobalAdmin")) {
        test.call("internal/threads/repair.json", {
          method : "GET",
          data : {
            thread : this.thread.get("id")
          },
          success : self.bind(this.alert, this, "Thread repair has been queued. Refresh in a few seconds."),
          error : self.bind(this.alert, this, "An error occurred while repairing thread. Please try again.", {
            type : "error"
          })
        });
      }
    }),
    /**
     * @param {Object} value
     * @return {?}
     */
    getPermalinkOptions : function(value) {
      var attrNames = value && value.match(/(comment|reply|edit)\-([0-9]+)/);
      if (attrNames) {
        return{
          postId : attrNames[2],
          options : {
            highlight : true,
            openReply : "reply" === attrNames[1],
            openEdit : "edit" === attrNames[1]
          }
        };
      }
    },
    /**
     * @param {string} id
     * @param {Object} options
     * @return {?}
     */
    scrollToPost : function(id, options) {
      options = options || {};
      options.padding = options.padding || 90;
      var req = this;
      var $form = req.$el.find("#post-" + id);
      return $form.length ? (options.highlight && (req.$el.find(".post-content.target").removeClass("target"), $form.find(".post-content").first().addClass("target")), options.openReply && req.postsView.openReply(id), options.openEdit && req.postsView.openEdit(id), void obj.frame.sendHostMessage("scrollTo", {
        top : $form.offset().top - options.padding,
        force : options.force || null
      })) : void thread.Post.fetchContext(id, req.thread, {
        requestedByPermalink : true
      }).done(function() {
        obj.frame.once("embed.resized", self.bind(req.scrollToPost, req, id, options));
      });
    },
    /**
     * @param {Node} forum
     * @return {undefined}
     */
    updateThreadSessionData : function(forum) {
      if (forum) {
        if (forum.get("thread")) {
          this.thread.set(forum.get("thread"));
        }
        var arg = forum.get("votes");
        if (arg) {
          if ("object" == typeof arg) {
            self.each(arg, function(recurring, elem) {
              var queue = this.postsView.posts.get(elem);
              if (queue) {
                queue.set("userScore", recurring);
              }
            }, this);
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    initSidebar : function() {
      this.sidebar = new sidebar({
        session : this.session,
        forum : this.forum
      });
    },
    /**
     * @return {undefined}
     */
    initNotificationMenu : function() {
      var sass = this.notificationMenu = new Mask.NotificationMenuView({
        el : this.$el.find("[data-role=notification-menu]")[0],
        session : this.session,
        forum : this.forum
      });
      sass.render();
    },
    /**
     * @return {undefined}
     */
    initUserMenu : function() {
      var sass = this.userMenu = new PageEditView({
        el : this.$el.find("[data-role=logout]")[0],
        session : this.session,
        thread : this.thread,
        referrerUrl : this.config.referrer
      });
      sass.render();
    },
    /**
     * @return {undefined}
     */
    initThreadShareMenu : function() {
      var sass = this.threadShareMenu = new Collection({
        el : $("#thread-share-menu")[0],
        model : this.thread
      });
      sass.render();
    },
    /**
     * @return {?}
     */
    getFeaturedPostInTrophyPosition : function() {
      return this.highlightedPostView ? this.highlightedPostView.getPost() : $.Deferred().resolve();
    },
    /**
     * @return {undefined}
     */
    loadDiscovery : function() {
      var parent = this;
      if ((!parent.config.discovery || (!parent.config.discovery.disable_all || parent.forum.get("settings").discoveryLocked && !parent.isInHome())) && !parent.states.discoveryLoaded) {
        /** @type {boolean} */
        parent.states.discoveryLoaded = true;
        elementData.loadCss("rtl" !== document.documentElement.dir ? "//www.ryflection.com/next/embed/styles/discovery.1fe89d176a9928445563cdce9d8680d4.css" : "//www.ryflection.com/next/embed/styles/discovery_rtl.916d71fb6963105e91d0516bd34ad29a.css");
        var resolved;
        if (dataAndEvents.isFeatureActive("use_ads_namespace")) {
          resolved = {
            paths : {
              "discovery/main" : "//www.ryflection.com/next/embed/adclient.bundle.9e7c14d0b6675e0a0d79a343c80a0b8a.js".slice(0, -3)
            }
          };
        }
        require(resolved, ["discovery/main"], function(deepDataAndEvents) {
          parent.getFeaturedPostInTrophyPosition().always(function(node) {
            parent.initDiscovery(deepDataAndEvents, Boolean(node));
          });
        }, function() {
          me.logStat("lounge.discovery.module_load_fail");
        });
      }
    },
    /**
     * @param {Object} deepDataAndEvents
     * @param {boolean} dataAndEvents
     * @return {?}
     */
    initDiscovery : function(deepDataAndEvents, dataAndEvents) {
      var obj = deepDataAndEvents.init(this.thread, this.hashConfig, this.config.discovery, {
        hasHighlightedPost : dataAndEvents,
        pageUrl : this.config.referrer,
        pageReferrer : this.config.hostReferrer,
        colorScheme : this.getColorScheme(),
        typeface : this.getTypeface()
      });
      return obj ? (this.listenTo(this.thread, "change:highlightedPost", function(dataAndEvents, data) {
        obj.set("hasHighlightedPost", Boolean(data));
      }), obj) : void utils.debug("Discovery seems not enabled. Check switches or forum settings.");
    },
    /**
     * @return {?}
     */
    isRealtimeEnabled : function() {
      var nowDate = moment.unix(this.initialData.lastModified);
      return!this.thread.get("isClosed") && moment().diff(nowDate, "days") <= 7;
    },
    realtimeHandlers : {
      /**
       * @param {MessageEvent} event
       * @return {?}
       */
      Post : function(event) {
        var self = event.data;
        var $scope = this.thread;
        if (!this.thread.get("hasStreaming") || !this.states.streamingPaused) {
          if (!self.id) {
            return void utils.warn("RT: no post ID");
          }
          if (!self.author || !self.author.id) {
            return void utils.warn("RT: no author or author ID");
          }
          if (!self.author.name) {
            return void utils.warn("RT: no author name or email hash");
          }
          if (!self.post || !self.post.message) {
            return void utils.warn("RT: no post message");
          }
          if ($scope.posts.get(self.id) || $scope.queue.get(self.id)) {
            return void utils.info("RT: duplicate: ", self.id);
          }
          if ("approved" !== self.type) {
            return void utils.info("RT: unnaproved: ", self.id);
          }
          if (self.type === self.type_prev) {
            return void utils.info("RT: Post change message, ignoring for now ", self.id);
          }
          this.thread.incrementPostCount(1);
          var id = self.post.parent_post.id;
          if (id = "0" !== id ? id : null, id && (!$scope.posts.get(id) && !$scope.queue.get(id))) {
            return void utils.info("RT: parent is not on this page: ", self.id);
          }
          var username = self.author.name;
          var avatar = self.author.avatar;
          var pageId = self.author.id;
          if ("0" === pageId) {
            pageId = void 0;
          }
          var model = new User(thread.User, {
            id : pageId,
            name : username,
            profileUrl : thing.root + "/by/" + username + "/",
            isAnonymous : !pageId,
            avatar : {
              cache : avatar,
              permalink : avatar
            }
          });
          $scope.users.add(model, {
            merge : true
          });
          $scope.queue.add({
            id : self.id,
            user : model,
            parentId : id,
            message : self.post.message,
            createdAt : self.date,
            media : self.post.media
          });
        }
      },
      /**
       * @param {MessageEvent} browserEvent
       * @return {undefined}
       */
      Vote : function(browserEvent) {
        var data = browserEvent.data;
        if (data.id && data.vote) {
          var result = this.thread;
          var self = result.posts.get(data.vote.recipient_post_id);
          if (self) {
            utils.debug("RT: Vote for post ", self.id);
            var model = self.votes.get(data.id);
            if (!model) {
              utils.debug("RT: Creating new vote with id ", data.id);
              model = new CommonModel({
                id : data.id
              });
              self.votes.add(model);
            }
            var pdataOld = self._vote(data.vote.vote, model.get("score"), data.voter);
            if (0 !== pdataOld) {
              model.set("score", pdataOld);
            }
          }
        }
      },
      /**
       * @param {MessageEvent} browserEvent
       * @return {undefined}
       */
      ThreadVote : function(browserEvent) {
        var data = browserEvent.data;
        var item = this.thread;
        if (data.id && (data.vote && (!this.session.user.id || data.vote.voter_id !== this.session.user.id))) {
          var model = item.votes.get(data.id);
          if (model || (model = new Client({
            id : data.id
          }), item.votes.add(model)), !model.get("currentUser")) {
            var pdataOld = item._vote(data.vote.vote, model.get("score"));
            if (0 !== pdataOld) {
              model.set("score", pdataOld);
            }
          }
        }
      },
      /**
       * @param {MessageEvent} e
       * @return {undefined}
       */
      typing : function(e) {
        var data = e.data;
        var scope = this.thread;
        var method = data.typing;
        var elem = data.post;
        if (data.thread === scope.id && elem) {
          var item = scope.posts.get(elem);
          if (item) {
            if (!(item.usersTyping.count() <= 0 && !method)) {
              item.usersTyping.add(thread.TypingUser.make(self.extend({
                client_context : e.lastEventId
              }, data)));
            }
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    initRealtime : function() {
      var self = Component.Manager;
      if (!self.pipe && this.isRealtimeEnabled()) {
        this.initRealtimeIndicators();
        var which;
        if (dataAndEvents.isFeatureActive("aggressive_embed_cache")) {
          which = this.initialData.lastModified;
        }
        self.initialize("thread/" + this.thread.id, which, this.realtimeHandlers, this);
        /**
         * @param {Object} req
         * @return {?}
         */
        var methodOverride = function(req) {
          return "POST" === req.method && !req.secure;
        };
        /** @type {number} */
        var d = 0;
        this.listenTo(test, "call", function(req) {
          if (methodOverride(req)) {
            d++;
            self.pause();
          }
        });
        this.listenTo(test, "complete", function(req) {
          if (methodOverride(req)) {
            if (!(0 >= d)) {
              if (!--d) {
                self.resume();
              }
            }
          }
        });
      }
    },
    /**
     * @return {undefined}
     */
    initRecommendButton : function() {
      if (this.recommendButton) {
        this.recommendButton.remove();
      }
      var view = this.recommendButton = new ignoreMethodDoesntExist({
        thread : this.thread,
        session : this.session
      });
      this.listenTo(view, {
        "vote:like" : self.bind(this.trigger, this, "uiAction:threadLike"),
        "vote:unlike" : self.bind(this.trigger, this, "uiAction:threadUnlike")
      });
      view.render();
      $("#recommend-button").append(view.el);
    },
    /**
     * @return {undefined}
     */
    initThreadSubscribe : function() {
      this.threadSubscribeButton = new GameMsg({
        session : this.session,
        thread : this.thread,
        el : $("#thread-subscribe-button")[0]
      });
    },
    /**
     * @return {undefined}
     */
    updatePostCount : function() {
      var successCount = this.thread.get("posts");
      if (!dataAndEvents.isFeatureActive("home_hide_post_count")) {
        this.$postCountContainer = this.$postCountContainer || this.$("li[data-role=post-count]");
        this.$postCountContainer.html(res.render("postCount", {
          count : successCount
        }));
      }
      obj.frame.sendHostMessage("posts.count", successCount);
    },
    /**
     * @return {undefined}
     */
    renderLayout : function() {
      var data = this;
      var value = data.isInHome();
      var b = value && dataAndEvents.isFeatureActive("home_hide_sort");
      var attrNames = value && dataAndEvents.isFeatureActive("home_hide_post_count");
      var bup = b && (attrNames && (dataAndEvents.isFeatureActive("home_hide_recommend") && dataAndEvents.isFeatureActive("home_hide_share")));
      data.addFeatureDetectionClasses();
      loginController.init();
      var $el = $(res.render("layout", {
        thread : data.thread.toJSON(),
        forum : data.forum.toJSON(),
        order : data.thread.posts.getOrder(),
        inHome : value,
        hideFooter : value && dataAndEvents.isFeatureActive("home_hide_footer"),
        hideSort : b,
        hidePostCount : attrNames,
        hideHeader : bup
      }));
      $el.appendTo(data.$el);
      data.postsView.renderLayout();
      if (desc.readonly) {
        this.alert(getter("The Reflect comment system is temporarily in maintenance mode. You can still read comments during this time, however posting comments and other actions are temporarily delayed."), {
          type : "info"
        });
      }
    },
    /**
     * @return {undefined}
     */
    addFeatureDetectionClasses : function() {
      var self = $(document.documentElement);
      if (p.isMobileUserAgent()) {
        self.addClass("mobile");
      }
      if (!p.isMobileUserAgent()) {
        self.addClass("use-opacity-transitions");
      }
    },
    /**
     * @return {?}
     */
    initMainPostBox : function() {
      if (this.dismissAlert(), this.form && (this.form.remove(), this.form = null), this.thread.get("isClosed")) {
        return void this.alert(getter("Comments for this thread are now closed."));
      }
      if (!this.session.get("canReply")) {
        return void this.session.once("change:id", this.initMainPostBox, this);
      }
      var _this = this.form = new Form({
        thread : this.thread,
        userSuggestions : this.userSuggestions,
        session : this.session
      });
      _this.render();
      $("#form").prepend(_this.$el);
      _this.resize();
    },
    /**
     * @return {undefined}
     */
    initUserSuggestionsManager : function() {
      this.userSuggestions = new matcherFunction;
      this.userSuggestions.addRemote(this.thread.users);
      this.listenTo(this.session, "change:id", function() {
        if (this.session.isLoggedIn()) {
          this.session.user.getFollowing();
          /** @type {number} */
          this.session.user.following.PER_PAGE = 100;
          this.userSuggestions.addRemote(this.session.user.following);
        }
      });
    },
    /**
     * @param {string} regex
     * @return {undefined}
     */
    showOnboarding : function(regex) {
      this.showOnboardApp({
        threadId : this.thread.get("id"),
        forumId : this.forum.get("id"),
        forumPk : this.forum.get("pk").toString(),
        session : this.session,
        activeSection : regex,
        windowName : this.onboardWindowName
      });
    },
    handleShowOnboarding : pl(function(ev) {
      var r20 = $(ev.target).attr("data-section");
      this.showOnboarding(r20);
    }),
    /**
     * @param {Event} evt
     * @return {undefined}
     */
    handleShowProfile : function(evt) {
      if (!dojo.willOpenNewWindow(evt)) {
        evt.preventDefault();
        var camelKey = $(evt.currentTarget).attr("data-username");
        if (this.isInHome()) {
          obj.frame.sendHostMessage("home.open", response.apps.home + "by/" + camelKey);
        } else {
          this.showProfileSidebar(camelKey);
        }
      }
    },
    /**
     * @param {Event} evt
     * @return {undefined}
     */
    handleShowCommunitySidebar : function(evt) {
      if (!dojo.willOpenNewWindow(evt)) {
        evt.preventDefault();
        var sid = $(evt.currentTarget).attr("data-forum");
        obj.trigger("sidebar:open", "home/forums/" + sid);
      }
    },
    handleSort : pl(function(ev) {
      var order = $(ev.currentTarget).attr("data-sort");
      this.$el.find('[data-role="post-sort"]').replaceWith(res.render("postSort", {
        order : order
      }));
      this.thread.posts.setOrder(order);
      this.thread.posts.fetch({
        reset : true
      });
      obj.frame.sendHostMessage("change:sort", order);
      this.postsView.handleSort();
    }),
    toggleThread : pl(function() {
      var isClosed = this.thread.get("isClosed");
      var items = getter(isClosed ? "An error occurred while opening the thread. Please try again." : "An error occurred while closing the thread. Please try again.");
      var options = {
        /**
         * @return {undefined}
         */
        success : function() {
          window.location.reload(true);
        },
        error : self.bind(this.alert, this, items, {
          type : "error"
        })
      };
      if (isClosed) {
        this.thread.open(options);
      } else {
        this.thread.close(options);
      }
    }),
    /**
     * @return {undefined}
     */
    createDeferredViewsForImages : function() {
      $("img[data-src]").each(function(dataAndEvents, selector) {
        var elem = $(selector);
        var result = new subject({
          el : selector,
          url : elem.attr("data-src")
        });
        result.relatedPost = elem.attr("data-post");
        elem.removeAttr("data-src");
      });
    },
    /**
     * @return {?}
     */
    getPosition : function() {
      return this.position;
    },
    /**
     * @param {string} key
     * @return {undefined}
     */
    showProfileSidebar : function(key) {
      obj.trigger("sidebar:open", "by/" + key);
    },
    /**
     * @return {undefined}
     */
    initResizeHandler : function() {
      var a;
      var _this = this;
      if (window.MutationObserver) {
        (new window.MutationObserver(function() {
          if (!a) {
            /** @type {number} */
            a = window.requestAnimationFrame(function() {
              /** @type {null} */
              a = null;
              _this.resize();
            });
          }
        })).observe(document.body, {
          attributes : true,
          childList : true,
          subtree : true,
          attributeFilter : ["class", "style"]
        });
      } else {
        /**
         * @return {undefined}
         */
        var bindStartPlaying = function draw() {
          _this.resize();
          window.requestAnimationFrame(draw);
        };
        window.requestAnimationFrame(bindStartPlaying);
      }
    },
    /**
     * @return {undefined}
     */
    resize : function() {
      var height = dojo.getPageHeight();
      if (this._lastHeight !== height) {
        this._lastHeight = height;
        this.trigger("domReflow");
        obj.frame.sendHostMessage("resize", {
          height : height
        });
      }
    },
    handleAuth : pl(function(evt) {
      this.session.authenticate(dojo.extractService(evt.target, "auth"));
    }),
    handleLogout : pl(function() {
      this.session.logout();
    }),
    audienceSync : pl(function() {
      this.session.audienceSync();
    }),
    toggleMedia : pl(function() {
      var data_user = field.settings;
      /** @type {boolean} */
      var udataCur = !data_user.get("collapsed");
      data_user.set("collapsed", udataCur);
    })
  });
  return self.extend(config.prototype, info.ShareMixin), fn.call(config.prototype), dojo.mixin(config, parent.UiActionEventProxy), dojo.mixin(config, parent.OnboardHelper), parent.appliesPublisherClasses.call(config.prototype), dojo.mixin(config, parent.ProfileHtmlHelpers), S.call(config.prototype), {
    Lounge : config,
    UserMenuView : PageEditView,
    ThreadSubscribeButton : GameMsg,
    DeferredMediaView : subject,
    DebugInfoView : BlockType
  };
}), define("lounge/main", ["jquery", "lounge/views", "lounge/tracking", "common/main"], function($, views, self, dataAndEvents) {
  return{
    /**
     * @return {?}
     */
    init : function() {
      var evaluate = dataAndEvents.getEmbeddedData;
      var result = evaluate("threadData");
      if (!result) {
        return{
          code : "no_thread_data"
        };
      }
      if (result.code) {
        return 2 === result.code ? "Endpoint resource not valid." === result.response && (result.code = "invalid_endpoint_resource") : 15 === result.code && ("Thread creations from embed disabled." === result.response && (result.code = "thread_creations_disabled")), result;
      }
      $.extend(result.response, evaluate("forumData"));
      $("#postCompatContainer").remove();
      var conf = new views.Lounge({
        jsonData : result,
        el : document.body
      });
      self.init(conf);
    }
  };
}), define("lounge.bundle", function() {
});
