define("core/analytics/jester", ["jquery", "underscore", "backbone", "core/analytics/identity", "core/config/urls"], function($, _, Backbone, deepDataAndEvents, dataAndEvents) {
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
  }, self.isFeatureActive = function(name, options) {
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
    return options = _.defaults(options || {}, {
      percent : deepDataAndEvents.clientPercent() + 1,
      user_id : user.id,
      username : user.username,
      is_staff : user.staff
    }), _.any(previous, function(c, i) {
      return/percent$/.test(i) && _.isNumber(c) ? c >= options[i] : _.isArray(c) ? _.contains(c, options[i]) : c === options[i];
    });
  }, self;
}), define("onboard/views/profileSection", ["jquery", "underscore", "backbone", "modernizr", "core/bus", "common/templates", "common/utils", "common/views/mixins"], function($, util, Backbone, dataAndEvents, exec_state, res, _, options) {
  var reversed = Backbone.View.extend({
    events : {
      "submit .profile-form" : "handleSaveProfile",
      "click [data-action=add-avatar]" : "handleClickAddAvatar",
      "click [data-action=dismiss-alert]" : "handleDismissAlert",
      "change #avatar-file" : "handleUploadAvatar"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
      this.user = this.session.user;
      this.bindProfileUIListeners(this.session);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(res.render("profileSection", {
        user : this.user.toJSON(),
        showAvatarForm : this.isFormDataSupported()
      })), this;
    },
    /**
     * @return {undefined}
     */
    handleUploadAvatar : function() {
      var getFileInput = this.getFileInput();
      if (getFileInput) {
        this.hideError();
        this.showLoading();
        this.user.saveAvatar(this.getFileInput()).done(util.bind(this.updateUserAvatarUrl, this)).fail(util.bind(this.showAvatarUploadError, this));
      }
    },
    /**
     * @return {undefined}
     */
    showLoading : function() {
      $(".profile-avatar").addClass("loading");
    },
    /**
     * @return {undefined}
     */
    hideLoading : function() {
      $(".profile-avatar").removeClass("loading");
    },
    /**
     * @param {string} deepDataAndEvents
     * @return {undefined}
     */
    showAvatarUploadError : function(deepDataAndEvents) {
      this.showApiError(deepDataAndEvents);
      this.hideLoading();
    },
    /**
     * @param {?} e
     * @return {?}
     */
    handleSaveProfile : function(e) {
      e.preventDefault();
      var rule = this.$el.find("form.profile-form");
      var appFrontendUrl = this.cleanWebsite(rule.find("input[name=url]").val());
      this.hideError();
      var json = {
        name : rule.find("input[name=name]").val(),
        about : rule.find("input[name=about]").val(),
        location : rule.find("input[name=location]").val(),
        url : appFrontendUrl
      };
      var map = this.user.changedAttributes(json);
      if (!map) {
        return this.trigger("navigateToSection", e);
      }
      json.display_name = json.name;
      var obj = this.user.set(json, {
        validate : true
      });
      if (!obj) {
        if (util.isString(this.user.validationError)) {
          this.user.validationError = {
            all : [this.user.validationError]
          };
        }
        var self = this;
        return void util.any(this.user.validationError, function(r) {
          return self.showError(r[0]), true;
        });
      }
      this.user.saveProfile().done(util.bind(this.triggerSuccessfulSave, this, e, map)).fail(util.bind(this.showApiError, this));
    },
    /**
     * @param {?} err
     * @param {Object} fn
     * @return {undefined}
     */
    triggerSuccessfulSave : function(err, fn) {
      this.trigger("navigateToSection", err);
      this.trigger("uiAction:profileUpdated", this.user);
      if ("name" in fn) {
        this.sendProfileUpdatedMessage(fn);
      }
    },
    /**
     * @return {undefined}
     */
    handleClickAddAvatar : function() {
      this.$("#avatar-file").click();
    },
    /**
     * @return {undefined}
     */
    handleDismissAlert : function() {
      this.hideError();
    },
    /**
     * @param {Function} obj
     * @return {undefined}
     */
    updateUserAvatarUrl : function(obj) {
      var pdataOld = util.extend({}, this.user.get("avatar"), {
        cache : obj.response
      });
      this.user.set("avatar", pdataOld);
      this.trigger("uiAction:avatarUpdated", this.user);
      this.hideLoading();
      this.sendProfileUpdatedMessage({
        avatar : this.user.get("avatar")
      });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    sendProfileUpdatedMessage : function(data) {
      if (dataAndEvents.sessionstorage) {
        window.sessionStorage.setItem("onboard.profileUpdated", JSON.stringify(data));
      }
      exec_state.frame.sendHostMessage("profileUpdated");
    },
    /**
     * @return {?}
     */
    isFormDataSupported : function() {
      return void 0 !== window.FormData;
    },
    /**
     * @return {?}
     */
    getFileInput : function() {
      return this.$("#avatar-file")[0].files[0];
    },
    /**
     * @param {string} message
     * @return {?}
     */
    cleanWebsite : function(message) {
      return message && 0 !== message.toLowerCase().indexOf("http") ? "http://" + message : message;
    },
    /**
     * @param {?} msg
     * @return {undefined}
     */
    showError : function(msg) {
      this.$(".alert.error").show().find("span").html(msg);
    },
    /**
     * @return {undefined}
     */
    hideError : function() {
      this.$(".alert.error").hide().find("span").empty();
    },
    /**
     * @param {string} deepDataAndEvents
     * @return {undefined}
     */
    showApiError : function(deepDataAndEvents) {
      var stackStartFunction = deepDataAndEvents.responseJSON.response.replace(/Invalid\sargument,\s'\w+':\s/, "");
      this.showError(stackStartFunction);
    }
  });
  return _.mixin(reversed, options.ProfileHtmlHelpers), {
    ProfileSectionView : reversed
  };
}), define("onboard/views/profileCard", ["backbone", "common/templates"], function(Backbone, res) {
  var ProfileCardView = Backbone.View.extend({
    tagName : "li",
    events : {
      "click [data-action=follow-user]" : "handleFollowUser"
    },
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
      this.user = req.user;
      this.listenTo(this.user, "change:isFollowing", this.renderFooter);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(res.render("profileCard", {
        user : this.user.toJSON({
          session : this.session
        }),
        sessionUserId : this.session.user.id
      })), this.renderFooter(), this;
    },
    /**
     * @return {?}
     */
    renderFooter : function() {
      return this.$("footer[data-role=profile-footer]").html(res.render("profileCardFooter", {
        user : this.user.toJSON({
          session : this.session
        }),
        sessionUserId : this.session.user.id
      })), this;
    },
    /**
     * @param {?} types
     * @return {undefined}
     */
    handleFollowUser : function(types) {
      types.preventDefault();
      this.user.toggleFollowState();
      this.trigger(this.user.get("isFollowing") ? "uiAction:followUser" : "uiAction:unfollowUser", this.user);
      this.renderFooter();
    }
  });
  return{
    ProfileCardView : ProfileCardView
  };
}), define("onboard/views/topcommenters", ["underscore", "backbone", "common/utils", "common/views/mixins", "onboard/views/profileCard"], function(col, Backbone, _, options, mongoose) {
  var reversed = Backbone.View.extend({
    tagName : "ol",
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
      this.listenTo(this.collection, "reset", this.render);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.profileCards = this.collection.map(this.renderProfileCard, this), this.$el.html(col.pluck(this.profileCards, "$el")), this;
    },
    /**
     * @param {Object} dbUser
     * @return {?}
     */
    renderProfileCard : function(dbUser) {
      var r20 = (new mongoose.ProfileCardView({
        user : dbUser,
        session : this.session
      })).render();
      return this.proxyViewEvents(r20), r20;
    }
  });
  return _.mixin(reversed, options.UiActionEventProxy), {
    TopCommentersView : reversed
  };
}), define("core/mixins/withChannelFollowing", ["underscore"], function(_) {
  /**
   * @param {Function} task
   * @return {?}
   */
  function build(task) {
    return{
      events : {
        "click [data-action=toggle-follow]" : "toggleFollow"
      },
      /**
       * @return {undefined}
       */
      initialize : function() {
        this.bindToPrimaryForum();
      },
      /**
       * @return {?}
       */
      templateHelpers : function() {
        return{
          isFollowing : this.getIsFollowing()
        };
      },
      /**
       * @return {?}
       */
      bindToPrimaryForum : function() {
        var Events = task.call(this);
        if (Events) {
          return Events.primaryForum ? void this.listenTo(Events.primaryForum, "change:isFollowing", this.updateFollowedState) : void this.listenToOnce(Events, "changeRelated:primaryForum", this.bindToPrimaryForum);
        }
      },
      /**
       * @return {undefined}
       */
      updateFollowedState : function() {
        this.$("[data-action=toggle-follow]").toggleClass("active", this.getIsFollowing());
      },
      /**
       * @return {?}
       */
      getIsFollowing : function() {
        var result = task.call(this);
        return result && (result.primaryForum && result.primaryForum.get("isFollowing"));
      },
      /**
       * @param {?} $e
       * @return {undefined}
       */
      toggleFollow : function($e) {
        if ($e) {
          $e.preventDefault();
        }
        var primaryForum = task.call(this);
        if (primaryForum) {
          if (primaryForum.primaryForum) {
            primaryForum.primaryForum.toggleFollowed();
            this.trigger("toggled:follow", $e);
          }
        }
      }
    };
  }
  /**
   * @param {Function} opt_options
   * @return {undefined}
   */
  function create(opt_options) {
    var options = opt_options || function() {
      return this.model;
    };
    var obj = build(options);
    this.initialize = _.wrap(this.initialize, function(matches, expr) {
      matches.call(this, expr);
      obj.initialize.call(this, expr);
    });
    this.templateHelpers = _.wrap(this.templateHelpers, function(value) {
      var serverAttrs = _.isFunction(value) ? value.call(this) : value;
      return _.extend(obj.templateHelpers.call(this), serverAttrs);
    });
    this.events = _.extend({}, obj.events, this.events);
    _.extend(this, _.pick(obj, "bindToPrimaryForum", "updateFollowedState", "getIsFollowing", "toggleFollow"));
  }
  return create;
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
}), define("core/templates/channelPromotion", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @return {?}
     */
    1 : function() {
      return'data-mix-location="tile"';
    },
    /**
     * @return {?}
     */
    3 : function() {
      return'target="_blank"';
    },
    /**
     * @param {?} config
     * @return {?}
     */
    5 : function(config) {
      var g;
      var exposeValue = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<img src="' + escapeExpression(exposeValue(null != (g = null != (g = null != config ? config.channel : config) ? g.options : g) ? g.tile : g, config)) + '" class="tile__media" />\n';
    },
    /**
     * @param {Object} config
     * @return {?}
     */
    7 : function(config) {
      var symbol;
      var exposeValue = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="tile__overlay">\n<h1 class="tile__name">' + escapeExpression(exposeValue(null != (symbol = null != config ? config.channel : config) ? symbol.name : symbol, config)) + '</h1>\n</div>\n<img src="https://media.disquscdn.com/home/blank_tile.png"\nclass="tile__media" />\n';
    },
    /**
     * @return {?}
     */
    9 : function() {
      return'data-mix-location="follow button"';
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} value
     * @param {Object} options
     * @param {?} inName
     * @param {Object} context
     * @return {?}
     */
    main : function(value, options, inName, context) {
      var data;
      var mixin = this.lambda;
      var fn = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="channels-module__inner" data-mix-location="channel promotion item">\n<a href="/home/channel/' + fn(mixin(null != (data = null != value ? value.channel : value) ? data.slug : data, value)) + '/" class="tile__wrapper"\n';
      return data = options["if"].call(value, null != value ? value.inHome : value, {
        name : "if",
        hash : {},
        fn : this.program(1, context),
        inverse : this.program(3, context),
        data : context
      }), null != data && (out += data), out += ">\n", data = options["if"].call(value, null != (data = null != (data = null != value ? value.channel : value) ? data.options : data) ? data.tile : data, {
        name : "if",
        hash : {},
        fn : this.program(5, context),
        inverse : this.program(7, context),
        data : context
      }), null != data && (out += data), out += '</a>\n<div class="channels-subheading">\n<div class="channels-subheading__description">\n<p>' + fn(mixin(null != (data = null != (data = null != value ? value.channel : value) ? data.options : data) ? data.description : data, value)) + '</p>\n</div>\n<div class="channels-subheading__action"\n', data = options["if"].call(value, null != value ? value.inHome : value, {
        name : "if",
        hash : {},
        fn : this.program(9, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out += '>\n<div class="channels-subheading__button">', data = this.invokePartial(inName.genericFollowButton, "", "genericFollowButton", value, void 0, options, inName, context), null != data && (out += data), out + '</div>\n</div>\n</div>\n<div class="channels-module__body">\n<h4 class="text-subheading">' + fn(options.gettext.call(value, "Recommended Discussions", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</h4>\n<section data-role="discussions" class="channels-module__discussions"></section>\n</div>\n</div>\n';
    },
    usePartial : true,
    useData : true
  });
}), define("core/views/common/mixins/asChannelPromotionView", ["underscore", "core/mixins/withChannelFollowing", "core/templates/channelPromotion"], function(args, callback, templateUrl) {
  var options = {
    className : "channels-module__block",
    template : templateUrl,
    regions : {
      discussionsRegion : "[data-role=discussions]"
    }
  };
  return function(operation, delegate) {
    callback = delegate || callback;
    callback.call(this, operation);
    /** @type {string} */
    this.className = [options.className, this.className].join(" ");
    if (!this.template) {
      this.template = options.template;
    }
    this.regions = args.extend({}, options.regions, this.regions);
  };
}), define("core/templates/channelPromotionDiscussion", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(_) {
  return _.template({
    /**
     * @return {?}
     */
    1 : function() {
      return'data-mix-location="recent discussion"';
    },
    /**
     * @return {?}
     */
    3 : function() {
      return'target="_blank"';
    },
    /**
     * @param {string} t
     * @return {?}
     */
    5 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="channel-item__description">\n<p class="truncate" data-truncate-lines="2">' + escapeExpression(lambda(null != t ? t.threadDescription : t, t)) + "</p>\n</div>\n";
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {string} el
     * @param {Object} options
     * @param {?} environment
     * @param {Object} context
     * @return {?}
     */
    main : function(el, options, environment, context) {
      var data;
      var $ = this.lambda;
      var callback = this.escapeExpression;
      /** @type {string} */
      var out = '<a href="' + callback($(null != el ? el.discussionRoute : el, el)) + '" class="channel-item__link"\n';
      return data = options["if"].call(el, null != el ? el.inHome : el, {
        name : "if",
        hash : {},
        fn : this.program(1, context),
        inverse : this.program(3, context),
        data : context
      }), null != data && (out += data), out += '>\n<div class="channel-item__heading">\n<h2 class="truncate" data-truncate-lines="2">' + callback($(null != (data = null != el ? el.thread : el) ? data.clean_title : data, el)) + "</h2>\n</div>\n", data = options["if"].call(el, null != el ? el.inHome : el, {
        name : "if",
        hash : {},
        fn : this.program(5, context),
        inverse : this.noop,
        data : context
      }), null != data && (out += data), out + '<div class="channel-item__footer">\n<span class="channel-item__count">' + callback($(null != (data = null != el ? el.thread : el) ? data.posts : data, el)) + '</span>\n<span class="channel-item__comment">' + callback(options.gettext.call(el, "Comments", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</span>\n</div>\n</a>\n";
    },
    useData : true
  });
}), define("core/views/common/mixins/asChannelPromotionDiscussionView", ["underscore", "core/templates/channelPromotionDiscussion"], function(_, templateUrl) {
  var options = {
    template : templateUrl,
    /**
     * @return {?}
     */
    templateHelpers : function() {
      var model = this.model.thread || this.model;
      return{
        discussionRoute : model.getDiscussionRoute()
      };
    }
  };
  return function() {
    if (!this.template) {
      this.template = options.template;
    }
    this.templateHelpers = _.wrap(this.templateHelpers, function(extra) {
      return _.isFunction(extra) && (extra = extra.call(this)), _.extend(options.templateHelpers.call(this), extra);
    });
  };
}), define("onboard/views/channelPromotionDiscussion", ["underscore", "backbone", "core/views/common/mixins/asChannelPromotionDiscussionView"], function(Router, Backbone, fn) {
  var cache = Backbone.View.extend({
    /**
     * @return {?}
     */
    templateHelpers : function() {
      return{
        thread : this.model.toJSON()
      };
    },
    /**
     * @return {?}
     */
    render : function() {
      var json = Router.extend(this.model.toJSON(), this.templateHelpers());
      return this.$el.html(this.template(json)), this;
    }
  });
  return fn.call(cache.prototype), cache;
}), define("onboard/views/channelPromotionDiscussionCollection", ["jquery", "underscore", "backbone", "onboard/views/channelPromotionDiscussion"], function($, _, Backbone, PrefixTrieNode) {
  var e = Backbone.View.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      this.listenTo(this.collection, "reset", this.render);
      this.children = {};
    },
    /**
     * @return {?}
     */
    render : function() {
      var $template = $("<ol>");
      return this.collection.each(function(value) {
        var view = this.createChildView(value);
        $template.append(view.render().$el);
      }, this), this.$el.html($template), this;
    },
    /**
     * @param {Object} view
     * @param {?} protoProps
     * @return {?}
     */
    createChildView : function(view, protoProps) {
      this.removeItemView(view);
      var v = this.children[view.id] = new PrefixTrieNode(_.extend({
        model : view,
        tagName : "li"
      }, protoProps));
      return v;
    },
    /**
     * @param {Object} item
     * @return {undefined}
     */
    removeItemView : function(item) {
      if (this.children[item.id]) {
        this.children[item.id].remove();
      }
    }
  });
  return e;
}), define("onboard/views/channelPromotion", ["underscore", "backbone", "core/views/common/mixins/asChannelPromotionView", "common/collections", "onboard/views/channelPromotionDiscussionCollection"], function(Events, Backbone, fn, dataAndEvents, LocationListView) {
  var cache = Backbone.View.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      this.initializeDiscussions();
      this.listenTo(this, "toggled:follow", this.onToggleFollow);
    },
    /**
     * @return {?}
     */
    initializeDiscussions : function() {
      return this.model.id ? (this.discussions = new dataAndEvents.RankedThreadCollection(null, {
        type : "default",
        target : "channel:" + this.model.id
      }), void this.discussions.fetch({
        reset : true,
        data : {
          limit : 2
        }
      }).then(Events.bind(this.renderDiscussions, this, this.discussions))) : void this.listenToOnce(this.model, "change:id", this.initializeDiscussions);
    },
    /**
     * @return {undefined}
     */
    remove : function() {
      if (this.discussionsView) {
        this.discussionsView.remove();
      }
      Backbone.View.prototype.remove.call(this);
    },
    /**
     * @return {?}
     */
    templateHelpers : function() {
      return{
        channel : this.model.toJSON()
      };
    },
    /**
     * @return {?}
     */
    render : function() {
      var json = Events.extend(this.model.toJSON(), this.templateHelpers());
      return this.$el.html(this.template(json)), this.discussions && this.renderDiscussions(this.discussions), this;
    },
    /**
     * @return {undefined}
     */
    onToggleFollow : function() {
      this.trigger(this.model.primaryForum.get("isFollowing") ? "uiAction:followChannel" : "uiAction:unfollowChannel", this.model);
    },
    /**
     * @param {Object} replies
     * @return {undefined}
     */
    renderDiscussions : function(replies) {
      this.discussionsView = new LocationListView({
        collection : replies
      });
      var $container = this.$(this.regions.discussionsRegion);
      $container.html(this.discussionsView.render().$el);
    }
  });
  return fn.call(cache.prototype), cache;
}), define("onboard/views/promotedChannels", ["underscore", "backbone", "common/utils", "common/views/mixins", "onboard/views/channelPromotion"], function(dataAndEvents, Backbone, oop, iSearch, AppView) {
  var ret = Backbone.View.extend({
    /**
     * @param {Object} req
     * @return {undefined}
     */
    initialize : function(req) {
      this.session = req.session;
      this.listenTo(this.collection, "reset", this.render);
    },
    /**
     * @return {?}
     */
    render : function() {
      /** @type {DocumentFragment} */
      var frag = document.createDocumentFragment();
      return this.collection.each(function(deepDataAndEvents) {
        var sass = this.createChannelCardView(deepDataAndEvents);
        frag.appendChild(sass.render().el);
      }, this), this.$el.html(frag), this;
    },
    /**
     * @param {string} deepDataAndEvents
     * @return {?}
     */
    createChannelCardView : function(deepDataAndEvents) {
      var App = new AppView({
        model : deepDataAndEvents,
        session : this.session
      });
      return this.proxyViewEvents(App), App;
    }
  });
  return oop.mixin(ret, iSearch.UiActionEventProxy), ret;
}), define("onboard/views/onboard", ["jquery", "backbone", "core/utils", "core/switches", "common/collections", "common/utils", "common/templates", "common/views/mixins", "onboard/views/profileSection", "onboard/views/topcommenters", "onboard/views/promotedChannels"], function($, Backbone, context, deepDataAndEvents, dataAndEvents, _, sass, options, session, el, NoteView) {
  var showChannel;
  var j = context.preventDefaultHandler;
  var reversed = Backbone.View.extend({
    events : {
      "click [data-action=nav]" : "handleNav",
      "click [data-action=close]" : "handleClose"
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      showChannel = deepDataAndEvents.isFeatureActive("onboard_follow_channels");
      /** @type {Object} */
      this.options = options;
      this.session = options.session;
      /** @type {string} */
      this.currentSection = "intro";
      this.profileEditingEnabled = this.session.user.isEditable(this.session);
      this.render();
      if (showChannel) {
        this.initChannels();
      } else {
        this.initTopCommenters();
      }
      if (this.profileEditingEnabled) {
        this.initProfileSection();
      }
    },
    /**
     * @return {undefined}
     */
    initProfileSection : function() {
      this.profileSectionView = new session.ProfileSectionView({
        session : this.session
      });
      this.proxyViewEvents(this.profileSectionView);
      this.profileSectionView.render().$el.appendTo(this.$("#complete-profile"));
      this.listenTo(this.profileSectionView, "navigateToSection", this.handleNav);
    },
    /**
     * @return {undefined}
     */
    initChannels : function() {
      this.promotedChannels = new dataAndEvents.ChannelCollection(null, {
        listName : "promoted"
      });
      this.promotedChannelsView = new NoteView({
        el : $("#promotedChannels")[0],
        session : this.session,
        collection : this.promotedChannels
      });
      this.proxyViewEvents(this.promotedChannelsView);
      this.promotedChannels.fetch({
        reset : true,
        data : {
          limit : 20
        }
      });
    },
    /**
     * @return {undefined}
     */
    initTopCommenters : function() {
      this.topCommenters = new dataAndEvents.TopUserCollection(null, {
        forum : this.options.forumId,
        limit : 20
      });
      this.topCommentersView = new el.TopCommentersView({
        el : $("#profileCards")[0],
        session : this.session,
        collection : this.topCommenters
      });
      this.proxyViewEvents(this.topCommentersView);
      this.topCommenters.fetch({
        reset : true
      });
    },
    /**
     * @return {undefined}
     */
    handleClose : function() {
      this.trigger("uiAction:complete");
    },
    handleNav : j(function(ev) {
      var modId = $(ev.target).attr("data-section");
      this.showSection(modId);
    }),
    /**
     * @param {string} id
     * @return {undefined}
     */
    showSection : function(id) {
      /** @type {string} */
      this.currentSection = id;
      var elem = this.$("[data-role=section]");
      var $this = this.$("#" + id);
      elem.removeClass("active");
      $this.addClass("active");
      this.trigger("uiAction:viewSection", this.currentSection);
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(sass.render("onboard", {
        profileEditingEnabled : this.profileEditingEnabled,
        showChannel : showChannel
      })), this;
    }
  });
  return _.mixin(reversed, options.UiActionEventProxy), {
    OnboardView : reversed
  };
}), define("templates/onboard", ["handlebars"], function(_) {
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
     * @param {string} parent
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
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    11 : function(elem, helpers, dataAndEvents, context) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div id="onboard">\n<section id="intro" class="modal-frame modal-frame-lg active" data-role="section">\n<figure class="modal-img modal-img-lg modal-img-dark">\n<img src="' + getAll("//a.disquscdn.com/next/embed/assets/img/onboarding/intro.58e0db2b6f143a1ceda0dae6ae2b07bb.png") + '" alt="Ryflection is the web\'s finest community !">\n</figure>\n<header class="modal-header">\n<img src="' + getAll("//a.disquscdn.com/next/embed/assets/img/onboarding/logo.f71bac4c0dd87b8284ba4ae9f681c0d0.png") + 
      '" class="logo" alt="Reflect">\n<h2>' + getAll(helpers.gettext.call(elem, "Reflect is the web's finest community . Use Reflect to discover more communities and talk about the things that you love. Set up your Reflect profile to get started.", {
        name : "gettext",
        hash : {},
        data : context
      })) + '</h2>\n</header>\n<footer class="modal-footer">\n';
      return data = helpers["if"].call(elem, null != elem ? elem.profileEditingEnabled : elem, {
        name : "if",
        hash : {},
        fn : this.program(12, context),
        inverse : this.program(14, context),
        data : context
      }), null != data && (out += data), out += '</footer>\n</section>\n<section id="complete-profile" class="modal-frame modal-frame-lg" data-role="section"></section>\n<section id="follow" class="modal-frame modal-frame-lg" data-role="section">\n<header class="modal-header modal-header-dark">\n<h1>' + getAll(helpers.gettext.call(elem, "Find More on Reflect", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</h1>\n<h2>\n", data = helpers["if"].call(elem, null != elem ? elem.showChannel : elem, {
        name : "if",
        hash : {},
        fn : this.program(16, context),
        inverse : this.program(18, context),
        data : context
      }), null != data && (out += data), out += '</h2>\n</header>\n<div class="modal-content-container">\n<section class="modal-content">\n', data = helpers["if"].call(elem, null != elem ? elem.showChannel : elem, {
        name : "if",
        hash : {},
        fn : this.program(20, context),
        inverse : this.program(22, context),
        data : context
      }), null != data && (out += data), out += '</section>\n</div>\n<footer class="modal-footer">\n', data = helpers["if"].call(elem, null != elem ? elem.profileEditingEnabled : elem, {
        name : "if",
        hash : {},
        fn : this.program(24, context),
        inverse : this.program(26, context),
        data : context
      }), null != data && (out += data), out + '<button data-action="close" class="btn btn-default btn-next btn-right">' + getAll(helpers.gettext.call(elem, "Finish", {
        name : "gettext",
        hash : {},
        data : context
      })) + "</button>\n</footer>\n</section>\n</div>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    12 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button data-action="nav" data-section="complete-profile" class="btn btn-default btn-next btn-right">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    14 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button data-action="nav" data-section="follow" class="btn btn-default btn-next btn-right">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    16 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Join interesting discussions or start your own", {
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
    18 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "Follow popular commenters to discover more discussions that you may care about.", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n";
    },
    /**
     * @return {?}
     */
    20 : function() {
      return'<div id="promotedChannels" class="card--onboarding"></div>\n';
    },
    /**
     * @return {?}
     */
    22 : function() {
      return'<ol id="profileCards" class="profile-cards-grid profile-cards-grid-2 profile-cards-grid-md"></ol>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    24 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button data-action="nav" data-section="complete-profile" class="btn btn-default btn-left">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Previous", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    26 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<button data-action="nav" data-section="intro" class="btn btn-default btn-left">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Previous", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</button>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    28 : function(elem, helpers, dataAndEvents, task) {
      var data;
      var getAll = this.escapeExpression;
      var manipulationTarget = this.lambda;
      /** @type {string} */
      var out = '<form class="profile-form" data-section="follow">\n<header class="modal-header modal-header-dark">\n<h1>' + getAll(helpers.gettext.call(elem, "Complete your profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h1>\n<h2>" + getAll(helpers.gettext.call(elem, "Your Reflect profile can be used to post on millions of sites on the web. Upload a photo and introduce yourself!", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</h2>\n</header>\n<section class="modal-content">\n<div class="alert error hide">\n<button type="button" class="close" title="close" data-action="dismiss-alert">\u00c3\u2014</button>\n<span></span>\n</div>\n';
      return data = helpers["if"].call(elem, null != elem ? elem.showAvatarForm : elem, {
        name : "if",
        hash : {},
        fn : this.program(29, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '<div class="profile-group" data-section="follow">\n<div class="form-group form-group-half">\n<label for="name">' + getAll(helpers.gettext.call(elem, "Your Name", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</label>\n<input type="text" id="name" name="name" placeholder="' + getAll(helpers.gettext.call(elem, "Bruce Wayne", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" value="' + getAll(manipulationTarget(null != (data = null != elem ? elem.user : elem) ? data.name : data, elem)) + '">\n</div>\n<div class="form-group form-group-full">\n<label for="about">' + getAll(helpers.gettext.call(elem, "About yourself", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</label>\n<input type="text" id="about" name="about" placeholder="' + getAll(helpers.gettext.call(elem, "Businessman, super hero, bat lover", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" value="' + getAll(manipulationTarget(null != (data = null != elem ? elem.user : elem) ? data.about : data, elem)) + '">\n</div>\n<div class="form-group form-group-half">\n<label for="location">' + getAll(helpers.gettext.call(elem, "Location", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</label>\n<input type="text" id="location" name="location" placeholder="' + getAll(helpers.gettext.call(elem, "Gotham City, NY", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" value="' + getAll(manipulationTarget(null != (data = null != elem ? elem.user : elem) ? data.location : data, elem)) + '">\n</div>\n<div class="form-group form-group-half">\n<label for="url">' + getAll(helpers.gettext.call(elem, "Site (if you have one)", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</label>\n<input type="text" id="url" name="url" placeholder="' + getAll(helpers.gettext.call(elem, "http://batman-news.com", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" value="' + getAll(manipulationTarget(null != (data = null != elem ? elem.user : elem) ? data.url : data, elem)) + '">\n</div>\n</div>\n</section>\n<footer class="modal-footer">\n<input type="submit" class="btn btn-default btn-next btn-right" value="' + getAll(helpers.gettext.call(elem, "Next", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\n<a class="btn-view-profile btn btn-default btn-right" href="' + getAll(manipulationTarget(null != (data = null != elem ? elem.user : elem) ? data.profileUrl : data, elem)) + '?utm_source=embed&utm_medium=onboard-modal&utm_content=view-profile-link" target="_blank">\n' + getAll(helpers.gettext.call(elem, "View Your Profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + '\n&nbsp;<i aria-hidden="true" class="icon-expand"></i>\n</a>\n</footer>\n</form>\n';
    },
    /**
     * @param {Object} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    29 : function(node, testEnvironment, dataAndEvents, task) {
      var context;
      var f = this.lambda;
      var expect = this.escapeExpression;
      return'<div class="profile-avatar">\n<img src="' + expect(f(null != (context = null != (context = null != node ? node.user : node) ? context.avatar : context) ? context.cache : context, node)) + '" class="user" alt="' + expect(testEnvironment.gettext.call(node, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" id="user-avatar" data-user="' + expect(f(null != (context = null != node ? node.user : node) ? context.id : context, node)) + '" data-role="user-avatar">\n<button type="button" data-action="add-avatar" class="btn-add">' + expect(testEnvironment.gettext.call(node, "Add photo", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</button>\n</div>\n<div class="avatar-group">\n<input type="file" name="avatar-file" id="avatar-file">\n</div>\n';
    },
    /**
     * @param {string} object
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    31 : function(object, helpers, dataAndEvents, task) {
      var data;
      var $ = this.lambda;
      var expect = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="profile-card">\n<div class="profile-info">\n<a href="' + expect($(null != (data = null != object ? object.user : object) ? data.profileUrl : data, object)) + '" class="profile-avatar" target="_blank" data-action="profile" data-username="' + expect($(null != (data = null != object ? object.user : object) ? data.username : data, object)) + '">\n<img data-user="' + expect($(null != (data = null != object ? object.user : object) ? data.id : data, object)) + '" data-role="user-avatar" src="' + 
      expect($(null != (data = null != (data = null != object ? object.user : object) ? data.avatar : data) ? data.cache : data, object)) + '" class="user" alt="' + expect(helpers.gettext.call(object, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" />\n</a>\n<div class="profile-description">\n<h3>\n<a href="' + expect($(null != (data = null != object ? object.user : object) ? data.profileUrl : data, object)) + '" target="_blank" data-action="profile" data-username="' + expect($(null != (data = null != object ? object.user : object) ? data.username : data, object)) + '" data-role="username">' + expect($(null != (data = null != object ? object.user : object) ? data.name : data, object)) + "</a>\n";
      return data = helpers["if"].call(object, null != (data = null != (data = null != object ? object.user : object) ? data.thread : data) ? data.canModerate : data, {
        name : "if",
        hash : {},
        fn : this.program(32, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += "\n</h3>\n", data = helpers["if"].call(object, null != (data = null != object ? object.user : object) ? data.about : data, {
        name : "if",
        hash : {},
        fn : this.program(34, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '</div>\n</div>\n<footer data-role="profile-footer" class="profile-footer">\n</footer>\n</div>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    32 : function(next_scope, testEnvironment, dataAndEvents, task) {
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
    34 : function(depth0, _, dataAndEvents, task) {
      var t;
      var escapeExpression = this.escapeExpression;
      return "<p>" + escapeExpression(_.truncate.call(depth0, null != (t = null != depth0 ? depth0.user : depth0) ? t.about : t, 64, {
        name : "truncate",
        hash : {},
        data : task
      })) + "</p>\n";
    },
    /**
     * @param {string} depth0
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    36 : function(depth0, helpers, dataAndEvents, context) {
      var stack1;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var buffer = '<ul class="profile-meta">\n<li class="meta-item total-comments">\n<span class="meta-count">' + escapeExpression(lambda(null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.numPosts : stack1, depth0)) + "</span>\n" + escapeExpression(helpers.gettext.call(depth0, "Comments", {
        name : "gettext",
        hash : {},
        data : context
      })) + '\n</li>\n<li class="meta-item total-followers">\n<span class="meta-count">' + escapeExpression(lambda(null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.numFollowers : stack1, depth0)) + "</span>\n" + escapeExpression(helpers.gettext.call(depth0, "Followers", {
        name : "gettext",
        hash : {},
        data : context
      })) + '\n</li>\n</ul>\n<div class="profile-follow">\n';
      return stack1 = helpers["if"].call(depth0, null != (stack1 = null != depth0 ? depth0.user : depth0) ? stack1.isSession : stack1, {
        name : "if",
        hash : {},
        fn : this.program(37, context),
        inverse : this.program(40, context),
        data : context
      }), null != stack1 && (buffer += stack1), buffer + "</div>\n";
    },
    /**
     * @param {Object} parent
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    37 : function(parent, helpers, dataAndEvents, task) {
      var obj;
      /** @type {string} */
      var optsData = "";
      return obj = helpers["if"].call(parent, null != (obj = null != parent ? parent.user : parent) ? obj.isEditable : obj, {
        name : "if",
        hash : {},
        fn : this.program(38, task),
        inverse : this.noop,
        data : task
      }), null != obj && (optsData += obj), optsData;
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    38 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a href="#" data-action="nav" data-section="complete-profile" class="btn follow-btn edit-profile">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Edit profile", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    40 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.followButton, "", "followButton", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
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
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "onboard", {
        name : "partial",
        hash : {},
        fn : this.program(11, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "profileSection", {
        name : "partial",
        hash : {},
        fn : this.program(28, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "profileCard", {
        name : "partial",
        hash : {},
        fn : this.program(31, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "profileCardFooter", {
        name : "partial",
        hash : {},
        fn : this.program(36, options),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData;
    },
    usePartial : true,
    useData : true
  });
}), define("onboard/views", ["underscore", "modernizr", "core/bus", "core/UniqueModel", "common/utils", "common/models", "core/analytics/jester", "common/views/popup", "common/views/mixins", "onboard/views/onboard", "templates/onboard"], function($, _m, view, dataAndEvents, _, ServerAPI, deepDataAndEvents, Backbone, options, el, ready) {
  var reversed = Backbone.PopupManager.extend({
    containerId : "#onboard",
    /**
     * @param {Object} options
     * @return {undefined}
     */
    bootstrap : function(options) {
      this.config = options || {};
      ready();
      this.activeSection = options.activeSection || "intro";
      this.forumId = options.forumId;
      this.listenTo(view.frame, "showOnboard", this.load);
      this.listenTo(this.session, "change:id", this.render);
      this.trigger("bootstrap:complete", this);
      this.fetchSession();
    },
    /**
     * @return {undefined}
     */
    fetchSession : function() {
      var actual = _m.sessionstorage && window.sessionStorage.getItem("onboard.session");
      /** @type {null} */
      var ok = null;
      if (actual) {
        try {
          /** @type {*} */
          ok = JSON.parse(actual);
          this.session.setUser(new dataAndEvents(ServerAPI.User, ok));
        } catch (g) {
        } finally {
          window.sessionStorage.removeItem("onboard.session");
        }
      }
      if (!ok) {
        this.session.fetch({
          reset : true
        }).fail($.bind(this.close, this));
      }
    },
    /**
     * @return {undefined}
     */
    render : function() {
      this.onboard = new el.OnboardView({
        el : document.getElementById("main"),
        forumId : this.forumId,
        session : this.session
      });
      this.proxyViewEvents(this.onboard);
      this.listenTo(this.onboard, "uiAction:complete", function() {
        view.frame.sendHostMessage("onboard.complete");
      });
    },
    /**
     * @param {?} context
     * @return {undefined}
     */
    show : function(context) {
      if (context && context.activeSection) {
        this.onboard.showSection(context.activeSection);
      } else {
        this.trigger("uiAction:viewSection", this.onboard.currentSection);
      }
      this.open();
    },
    /**
     * @param {?} options
     * @return {undefined}
     */
    load : function(options) {
      if (this.onboard) {
        this.show(options);
      } else {
        $.defer($.bind(this.load, this, options));
      }
    }
  });
  return _.mixin(reversed, options.UiActionEventProxy), {
    OnboardManager : reversed
  };
}), define("onboard/tracking", ["core/analytics/jester", "common/main"], function(res, pkg) {
  /**
   * @param {Object} req
   * @return {undefined}
   */
  function init(req) {
    req.once("bootstrap:complete", function() {
      res.client.set({
        product : "bridge",
        zone : "onboard",
        version : pkg.version,
        thread : req.config.threadId,
        forum : req.config.forumId,
        forum_id : req.config.forumPk
      });
    });
    req.session.on("change:id", function(cmp) {
      res.client.set("user_id", cmp.id);
    });
    req.on("uiAction:unfollowUser", function(self) {
      res.client.emit({
        verb : "stop-following",
        object_type : "user",
        object_id : self.id
      });
    });
    req.on("uiAction:followUser", function(self) {
      res.client.emit({
        verb : "follow",
        object_type : "user",
        object_id : self.id
      });
    });
    req.on("uiAction:followChannel", function(self) {
      res.client.emit({
        verb : "follow",
        object_type : "channel",
        object_id : self.id
      });
    });
    req.on("uiAction:unfollowChannel", function(self) {
      res.client.emit({
        verb : "stop-following",
        object_type : "channel",
        object_id : self.id
      });
    });
    req.on("uiAction:viewSection", function(page) {
      res.client.set("section", page);
      res.client.emit({
        verb : "view",
        object_type : "section",
        object_id : "onboard/" + page
      });
    });
    req.on("uiAction:complete", function() {
      res.client.emit({
        verb : "complete",
        object_type : "zone",
        object_id : "onboard"
      });
    });
    req.on("uiAction:profileUpdated", function(self) {
      res.client.emit({
        area : "info",
        verb : "update",
        object_type : "user",
        object_id : self.id
      });
    });
    req.on("uiAction:avatarUpdated", function(self) {
      res.client.emit({
        area : "avatar",
        verb : "update",
        object_type : "user",
        object_id : self.id
      });
    });
  }
  return{
    /** @type {function (Object): undefined} */
    init : init
  };
}), define("onboard/main", ["onboard/views", "onboard/tracking"], function(dataAndEvents, ret) {
  return{
    /**
     * @return {undefined}
     */
    init : function() {
      var route = new dataAndEvents.OnboardManager;
      ret.init(route);
    }
  };
}), define("onboard.bundle", function() {
});
