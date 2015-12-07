define("discovery/exceptions", [], function() {
  /**
   * @param {string} name
   * @param {string} timeout
   * @return {?}
   */
  var __extends = function(name, timeout) {
    /**
     * @return {?}
     */
    var ctor = function() {
      var e = Error.apply(this, arguments);
      return e.name = this.name = name, this.reflectCode = timeout || "uncaught", this.message = e.message, this.stack = e.stack, this;
    };
    /**
     * @return {undefined}
     */
    var Ctor = function() {
    };
    return Ctor.prototype = Error.prototype, ctor.prototype = new Ctor, ctor;
  };
  return{
    NoAds : __extends("NoAds", "no_ads"),
    NoBinError : __extends("NoBinError", "no_bin"),
    AdsExhaustedError : __extends("AdsExhaustedError", "ads_exhausted"),
    RenderError : __extends("RenderError", "render_error"),
    FetchError : __extends("FetchError", "fetch_error"),
    TimeoutError : __extends("TimeoutError", "timeout"),
    ValidationError : __extends("ValidationError", "validation_error")
  };
}), define("discovery/models", ["underscore", "backbone", "moment", "core/analytics/identity", "core/time", "shared/corefuncs"], function($, Backbone, callback, dataAndEvents, data, model) {
  var e = function($) {
    var that = $.prototype;
    return $.extend({
      defaults : {
        redirectUrl : null,
        signedUrl : null,
        userId : null,
        sourceThreadId : null,
        forumId : null,
        forum : null,
        majorVersion : null,
        requestBin : null
      },
      /**
       * @return {?}
       */
      redirectPayload : function() {
        var data = {
          url : this.get("signedUrl"),
          imp : dataAndEvents.impression.impId,
          prev_imp : dataAndEvents.impression.prevImp,
          forum_id : this.get("forumId"),
          forum : this.get("forum"),
          thread_id : this.get("sourceThreadId")
        };
        return $.extend(data, this.get("service")), this.has("requestBin") && (data.bin = this.get("requestBin")), this.has("userId") && (data.user_id = this.get("userId")), data;
      },
      /**
       * @return {?}
       */
      redirectUrl : function() {
        var object = this.get("redirectUrl");
        var options = this.redirectPayload();
        return model.serialize(object, options);
      },
      /**
       * @return {?}
       */
      toJSON : function() {
        var options = that.toJSON.call(this);
        return options.redirectUrl = this.redirectUrl(), options;
      },
      /**
       * @return {?}
       */
      toString : function() {
        return this.get("title") + " " + this.get("link") + " (id = " + this.id + ")";
      }
    });
  }(Backbone.Model);
  var coord = function(Class) {
    var proto = Class.prototype;
    return Class.extend({
      defaults : $.defaults({
        createdAgo : false
      }, proto.defaults),
      /**
       * @param {?} contentHTML
       * @param {?} selector
       * @return {undefined}
       */
      initialize : function(contentHTML, selector) {
        if (selector && selector.humanFriendlyTimestamp) {
          var basis = data.assureTzOffset(this.get("createdAt"));
          basis = callback(basis, data.ISO_8601);
          this.set("createdAgo", basis.fromNow());
        }
      },
      /**
       * @return {?}
       */
      redirectPayload : function() {
        var deep = proto.redirectPayload.call(this);
        return $.extend(deep, {
          thread : this.id,
          zone : "thread",
          area : "discovery"
        }), deep;
      },
      /**
       * @return {?}
       */
      toJSON : function() {
        var result = proto.toJSON.call(this);
        return result.thumbnailUrl = result.thumbnail, result.preview && (result.preview = result.preview.toJSON()), result;
      },
      /**
       * @return {?}
       */
      toString : function() {
        return "organic link: " + proto.toString.call(this);
      }
    });
  }(e);
  var $e = function(Class) {
    var proto = Class.prototype;
    return Class.extend({
      idAttribute : "advertisement_id",
      defaults : $.defaults({
        brand : null,
        headline : null,
        text : null,
        url : null,
        signedUrl : null,
        advertisement_id : null,
        tracking_pixels_onview : null
      }, proto.defaults),
      /**
       * @param {string} file
       * @return {?}
       */
      parse : function(file) {
        return file.signedUrl = file.signed_url, file.thumbnailUrl = file.thumbnail_url, delete file.signed_url, file;
      },
      /**
       * @param {string} name
       * @return {?}
       */
      get : function(name) {
        return{
          title : this.attributes.headline,
          link : this.attributes.url
        }[name] || proto.get.call(this, name);
      },
      /**
       * @return {?}
       */
      redirectPayload : function() {
        var deep = proto.redirectPayload.call(this);
        return $.extend(deep, {
          zone : "thread",
          area : "discovery",
          advertisement_id : this.get("advertisement_id"),
          brand : this.get("brand"),
          headline : this.get("headline"),
          ad_product_name : "sponsored_links",
          ad_product_layout : this.get("layout")
        }), deep;
      },
      /**
       * @return {?}
       */
      toJSON : function() {
        var data = proto.toJSON.call(this);
        return data.title = data.headline, data.link = data.url, data;
      },
      /**
       * @return {?}
       */
      toString : function() {
        return "promoted link: " + proto.toString.call(this);
      }
    });
  }(e);
  var a = {
    RelatedThread : coord,
    Advertisement : $e
  };
  return REFLECT.testing && (a.BaseContentModel = e), a;
}), define("discovery/custom-comments", ["jquery", "underscore", "when", "core/models/Media", "core/utils", "shared/urls", "shared/corefuncs", "common/urls", "common/templates", "discovery/exceptions", "exports"], function(params, util, $q, dataAndEvents, defer, deferred, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, err, $) {
  /**
   * @param {string} url
   * @return {?}
   */
  $.getProtocol = function(url) {
    var segmentMatch = (url || "").match(/^\s*(\w+:)?\/\//);
    return segmentMatch ? (segmentMatch[1] || "").toLowerCase() : null;
  };
  /**
   * @return {?}
   */
  $.getPageProtocol = function() {
    return window.location.protocol;
  };
  /**
   * @param {?} contexts
   * @param {boolean} dataAndEvents
   * @return {?}
   */
  $.forceWebProtocol = function(contexts, dataAndEvents) {
    var deep = $.getProtocol(contexts);
    if (null === deep) {
      return "";
    }
    var target = $.getPageProtocol();
    return deep || (deep = target), "http:" === target && (dataAndEvents = true), "http:" === deep && dataAndEvents || (deep = "https:"), deferred.ensureHttpBasedProtocol(contexts, deep);
  };
  /** @type {RegExp} */
  var rquickExpr = /<(\S+)[^<]+$/;
  /**
   * @param {?} val
   * @return {?}
   */
  $.extractTrackingTags = function(val) {
    if (util.isArray(val)) {
      return util.map(val, function(requestUrl) {
        return{
          tag : "img",
          url : requestUrl
        };
      });
    }
    var branchDataJSON = defer.bleachFindUrls(val);
    /** @type {Array} */
    var tokens = [];
    /** @type {number} */
    var conditionIndex = 0;
    for (;conditionIndex < branchDataJSON.length;++conditionIndex) {
      var options = branchDataJSON[conditionIndex];
      var i = options.index;
      /** @type {number} */
      var index = 0;
      if (conditionIndex > 0) {
        index = branchDataJSON[conditionIndex - 1].endIndex;
      }
      var selector = val.substr(index, i - index);
      /** @type {(Array.<string>|null)} */
      var parsed = rquickExpr.exec(selector);
      if (parsed) {
        /** @type {string} */
        var tag = parsed[1].toLowerCase();
        if ("img" === tag || "iframe" === tag) {
          var appFrontendUrl = $.forceWebProtocol(options.url);
          if (appFrontendUrl) {
            tokens.push({
              tag : tag,
              url : appFrontendUrl
            });
          }
        }
      }
    }
    return tokens;
  };
  /**
   * @param {?} options
   * @return {?}
   */
  $.ajax = function(options) {
    var original = $q.defer();
    var button = original.promise;
    return params.ajax(options).done(function() {
      original.resolve.apply(original, arguments);
    }).fail(function(dataAndEvents, deepDataAndEvents, line) {
      original.reject(new err.FetchError(line));
    }), button;
  };
  $.handlers = {};
  /**
   * @param {Object} data
   * @return {?}
   */
  var handler = function(data) {
    var progressContexts = (data.main_media && data.main_media[0] || {}).url;
    var brand_name = (data.custom || {}).brand_name;
    var target_url = $.forceWebProtocol(decodeURIComponent(data.click_url));
    return{
      title : data.title,
      summary : data.description,
      target_url : target_url,
      brand_name : brand_name,
      thumbnail_url : $.forceWebProtocol(progressContexts),
      layout : "image_target",
      tracking_pixels_onload : $.extractTrackingTags(data.impression_trackers),
      tracking_pixels_onclick : $.extractTrackingTags(data.click_trackers)
    };
  };
  /**
   * @param {Object} obj
   * @return {?}
   */
  var update = function(obj) {
    var progressContexts = (obj.main_media && obj.main_media[0] || {}).url;
    return{
      media_url : $.forceWebProtocol(progressContexts),
      target_url : $.forceWebProtocol(obj.click_url, true),
      brand_name : (obj.custom || {}).brand_name || obj.title,
      brand_image_url : $.forceWebProtocol(obj.icon_img_url),
      summary : obj.description,
      layout : "iframe",
      tracking_pixels_onload : $.extractTrackingTags(obj.impression_trackers),
      tracking_pixels_onclick : $.extractTrackingTags(obj.click_trackers)
    };
  };
  /**
   * @param {HTMLElement} namespace
   * @param {string} dataAndEvents
   * @return {?}
   */
  $.handlers.appnexus = function(namespace, dataAndEvents) {
    return namespace.get("placement_id") ? $.ajax({
      url : "https://mobile.adnxs.com/mob",
      data : {
        id : namespace.get("placement_id"),
        size : "1x1",
        st : "web",
        version : 1,
        referrer : dataAndEvents
      },
      xhrFields : {
        withCredentials : true
      }
    }).then(function($scope) {
      if (!$scope) {
        throw new err.NoAds("Provider response had no data.");
      }
      var item = ($scope["native"] || ($scope.ads || [null]))[0];
      if (!item) {
        throw new err.NoAds("Neither 'native' nor 'ads' fields were found in response.");
      }
      /** @type {boolean} */
      var hasIndex = false;
      try {
        hasIndex = JSON.parse(item.custom.object).is_video;
      } catch (e) {
      }
      return namespace.set(hasIndex ? update(item) : handler(item)), namespace;
    }) : $q.reject(new err.ValidationError("No placement_id specified."));
  };
  /**
   * @param {HTMLElement} module
   * @return {?}
   */
  $.handlers.criteo_dr = function(module) {
    return $.ajax({
      url : "https://cas.criteo.com/delivery/0.1/napi.jsonp",
      data : {
        zoneid : module.get("zoneid") || 269381
      },
      dataType : "jsonp",
      timeout : 1E4
    }).then(function(response) {
      if (0 !== response.response_status) {
        throw new err.NoAds(response.status_message || "No offer from Criteo.");
      }
      var xml = response.advertiser;
      var item = response.products && response.products[0];
      if (!item || !xml) {
        throw new err.NoAds("No ad found.");
      }
      return util.each(response.impression_pixels, function(p) {
        /** @type {string} */
        p.tag = "img";
      }), module.set({
        title : item.title,
        summary : item.description,
        target_url : item.click_url,
        brand_name : xml.description,
        layout : "image_target",
        tracking_pixels_onload : response.impression_pixels,
        privacy_click_url : response.privacy.optout_click_url,
        thumbnail_url : $.forceWebProtocol(item.image.url),
        privacy_image_url : $.forceWebProtocol(response.privacy.optout_image_url)
      }), module;
    });
  };
  /**
   * @param {HTMLElement} element
   * @param {string} dataAndEvents
   * @return {?}
   */
  $.handlers.appnexus_dr = function(element, dataAndEvents) {
    return element.get("placement_id") ? $.ajax({
      url : "https://ib.adnxs.com/mob",
      data : {
        id : element.get("placement_id"),
        st : "web",
        referrer : dataAndEvents,
        format : "json",
        psa : 0
      }
    }).then(function($scope) {
      if (!($scope && ($scope.ads && $scope.ads.length))) {
        throw new err.NoAds("No data in response found.");
      }
      var opts = $scope.ads[0];
      if (!(opts.content && (opts.width && opts.height))) {
        throw new err.ValidationError("Ad is missing some of the required fields.");
      }
      return element.set({
        content : opts.content,
        width : opts.width,
        height : opts.height
      }), element;
    }) : $q.reject(new err.ValidationError("No placement_id specified."));
  };
}), define("discovery/helpers", ["underscore", "jquery", "loglevel", "raven", "remote/config", "core/switches"], function(_, jQuery, logger, Raven, child, dataAndEvents) {
  /**
   * @param {?} o
   * @param {Node} token
   * @param {Object} body
   * @return {?}
   */
  var action = function(o, token, body) {
    var extraParams = child.discovery || {};
    var level = dataAndEvents.isFeatureActive("discovery_override") && token.get("discoveryOverride");
    var filename = level || o.discoveryVariant;
    var d = extraParams.variantSpecific || {};
    if (filename) {
      filename = _.extend(_.omit(extraParams, "variantSpecific"), {
        name : filename,
        thumbnailsEnabled : o.discoveryThumbnailsEnabled
      }, d[filename]);
    } else {
      if (!o.adsVideoEnabled && !o.adsDRNativeEnabled) {
        return;
      }
      filename = {
        organicEnabled : false,
        promotedEnabled : false
      };
    }
    return body.disable_promoted && (!o.discoveryLocked && (filename.promotedEnabled = false, filename.thumbnailsEnabled = false)), filename;
  };
  /**
   * @param {Object} el
   * @param {Object} opts
   * @return {?}
   */
  var fn = function(el, opts) {
    /**
     * @return {?}
     */
    function close() {
      return element.scrollHeight - element.offsetHeight > 0.2 * amount;
    }
    /**
     * @return {undefined}
     */
    function done() {
      if (node.lastChild) {
        if (!_.contains(["...", "\u00e2\u20ac\u00a6"], node.lastChild.nodeValue)) {
          script = node.appendChild(window.document.createTextNode(" " + css));
          if (close()) {
            node.removeChild(script);
            node.removeChild(node.lastChild);
            done();
          }
        }
      }
    }
    if (!el.closest("body").length) {
      return void logger.info("lineTruncate called on el not on DOM");
    }
    if (el.text().length < 1) {
      return void logger.info("lineTruncated called on empty el");
    }
    /**
     * @param {Object} token
     * @return {?}
     */
    var handler = function(token) {
      return 3 !== token.nodeType;
    };
    if (_.any(el.children(), handler)) {
      return void logger.info("lineTruncate called on non-flat el");
    }
    var node = el[0];
    var element = node;
    if ("block" !== el.css("display")) {
      for (;element.parentNode && (element = element.parentNode, "block" !== jQuery(element).css("display"));) {
      }
    }
    /** @type {number} */
    var amount = parseFloat(el.css("font-size"), 10);
    if (close()) {
      opts = opts || {};
      var script;
      var SAMPLE_RATE = opts.lines || 1;
      var css = opts.ellipsis;
      var oldClasses = el.text();
      if (oldClasses.length) {
        /** @type {number} */
        var pct = el.width() / amount;
        /** @type {number} */
        var sec = parseInt(pct * SAMPLE_RATE, 10);
        var codeSegments = oldClasses.split(/\s/);
        /** @type {number} */
        var ms = 0;
        el.empty();
        var i;
        var l = codeSegments.length;
        /** @type {number} */
        i = 0;
        for (;l > i && (ms += codeSegments[i].length + 1, !(ms >= sec));i++) {
          node.appendChild(document.createTextNode(" " + codeSegments[i]));
        }
        if (close()) {
          for (;node.lastChild && close();) {
            script = node.removeChild(node.lastChild);
          }
        } else {
          do {
            script = node.appendChild(document.createTextNode(" " + codeSegments[i++]));
          } while (!close() && l > i);
          node.removeChild(script);
        }
        if (css) {
          if (!_.isString(css)) {
            /** @type {string} */
            css = "\u00e2\u20ac\u00a6";
          }
          done();
        }
      }
    }
  };
  /**
   * @param {Object} attrs
   * @return {?}
   */
  var parse = function(attrs) {
    /**
     * @param {number} a
     * @param {number} b
     * @return {?}
     */
    function text(a, b) {
      return a + b;
    }
    var i;
    var j;
    var keys = _.keys(attrs);
    /** @type {number} */
    var type = Math.floor(_.reduce(attrs, text, 0) / 2);
    var len = keys.length + 1;
    /** @type {number} */
    var key = type + 1;
    /** @type {Array} */
    var arr = new Array(len);
    /** @type {number} */
    i = 0;
    for (;len > i;i++) {
      /** @type {Array} */
      arr[i] = new Array(key);
      arr[i][0] = {};
    }
    /** @type {number} */
    j = 1;
    for (;key > j;j++) {
      /** @type {boolean} */
      arr[0][j] = false;
    }
    var k;
    var v;
    var cache;
    var removeTags = {};
    /** @type {number} */
    j = 1;
    for (;key > j;j++) {
      /** @type {number} */
      i = 1;
      for (;len > i;i++) {
        k = keys[i - 1];
        v = attrs[k];
        cache = _.clone(arr[i - 1][j]);
        if (!cache) {
          if (j >= v) {
            cache = _.clone(arr[i - 1][j - v]);
            if (cache) {
              cache[k] = v;
              removeTags = cache;
            }
          }
        }
        arr[i][j] = cache;
      }
    }
    return[removeTags, _.omit(attrs, _.keys(removeTags))];
  };
  /** @type {Array} */
  var state = ["product", "zone", "service", "experiment", "variant"];
  /**
   * @param {string} opt
   * @return {?}
   */
  var animate = function(opt) {
    opt = opt || "";
    var style = _.object(state, opt.split(":"));
    return{
      bin : opt,
      experiment : style.experiment || "",
      variant : style.variant || ""
    };
  };
  /**
   * @param {?} e
   * @param {?} listener
   * @return {undefined}
   */
  var removeListener = function(e, listener) {
    if (e) {
      logger.debug(e);
      if (!e.reflectCode) {
        Raven.captureException(e);
      }
      if (listener) {
        if (e.reflectCode) {
          listener.reportError(e);
        }
      }
    }
  };
  /**
   * @return {?}
   */
  var getFlashVersion = function() {
    /** @type {boolean} */
    var all = false;
    try {
      /** @type {boolean} */
      all = Boolean(new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash"));
    } catch (b) {
      /** @type {boolean} */
      all = "undefined" != typeof window.navigator.mimeTypes["application/x-shockwave-flash"];
    }
    return all;
  };
  return{
    /** @type {function (?, Node, Object): ?} */
    generateVariantConfig : action,
    /** @type {function (Object, Object): ?} */
    lineTruncate : fn,
    /** @type {function (Object): ?} */
    balancedPartition : parse,
    /** @type {function (string): ?} */
    binToEventParams : animate,
    /** @type {function (?, ?): undefined} */
    reportError : removeListener,
    /** @type {function (): ?} */
    hasFlash : getFlashVersion
  };
}), define("discovery/models/BaseAd", ["underscore", "backbone", "when", "loglevel", "discovery/custom-comments", "discovery/helpers", "core/analytics/jester", "common/utils"], function(util, Backbone, dfd, utils, player, values, options, async) {
  var obj = {
    iframe : "video",
    image_target : "native_dr",
    video_vast : "video",
    video_iframe : "video"
  };
  return Backbone.Model.extend({
    idAttribute : "advertisement_id",
    /**
     * @return {?}
     */
    getProvider : function() {
      return this.get("provider") || this.get("ad_provider");
    },
    /**
     * @return {?}
     */
    toLogString : function() {
      return "[" + this.getProvider() + ":" + this.get("layout") + "]";
    },
    /**
     * @param {?} params
     * @return {?}
     */
    fetch : function(params) {
      params = params || {};
      var uid = this.getProvider();
      var value = player.handlers[uid];
      var request = util.isFunction(value) ? value(this, params.sourceThreadUrl) : dfd.resolve(this);
      return request;
    },
    /**
     * @return {undefined}
     */
    reportRequest : function() {
      this._report({
        verb : "call",
        object_type : "provider",
        object_id : this.getProvider(),
        adjective : 1
      });
    },
    /**
     * @return {undefined}
     */
    reportLoad : function() {
      utils.debug(this.toLogString() + ": Unit is ready.");
      this._fireLoadPixels();
      this._report({
        verb : "load"
      });
    },
    /**
     * @param {?} reason
     * @return {undefined}
     */
    reportError : function(reason) {
      this._report({
        verb : "fail",
        object_type : "provider",
        object_id : this.getProvider(),
        adverb : reason.reflectCode
      });
    },
    /**
     * @return {undefined}
     */
    reportIABView : function() {
      this._fireViewPixels();
      this._report({
        verb : "view",
        adverb : "iab-scroll"
      });
    },
    /**
     * @return {undefined}
     */
    reportView : function() {
      this._report({
        verb : "view",
        adverb : "0ms-no50perc"
      });
    },
    /**
     * @return {undefined}
     */
    reportPlayStart : function() {
      utils.debug(this.toLogString() + ": Video player reported play started.");
      this._report({
        verb : "start-playing"
      });
    },
    /**
     * @return {undefined}
     */
    reportPlayEnd : function() {
      utils.debug(this.toLogString() + ": Video player reported play ended.");
      this._report({
        verb : "finish-playing"
      });
    },
    /**
     * @param {?} opt_attributes
     * @return {?}
     */
    _report : function(opt_attributes) {
      var val = this.get("layout");
      return options.client.emit(util.defaults(opt_attributes, {
        object_type : "advertisement",
        object_id : "[" + this.id + "]",
        advertisement_id : this.id,
        ad_product_name : obj[val] || val,
        ad_product_layout : val,
        zone : "thread",
        area : "sponsored_comment"
      }, values.binToEventParams(this.get("bin"))));
    },
    /**
     * @return {undefined}
     */
    fireClickPixels : function() {
      var reversed = this.get("tracking_pixels_onclick");
      async.loadPixels(reversed);
    },
    /**
     * @return {undefined}
     */
    _fireViewPixels : function() {
      var tokens = this.get("tracking_pixels_onview") || [];
      var uri = this.get("tracking_pixel_url");
      if (uri) {
        tokens.push({
          tag : "img",
          url : uri
        });
      }
      async.loadPixels(tokens);
    },
    /**
     * @return {undefined}
     */
    _fireLoadPixels : function() {
      var reversed = this.get("tracking_pixels_onload") || [];
      async.loadPixels(reversed);
    }
  });
}), define("discovery/models/SponsoredLinkAd", ["underscore", "backbone", "when", "loglevel", "core/analytics/jester", "discovery/helpers", "discovery/models/BaseAd", "discovery/exceptions"], function(_, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, options, dataAndEvents, BaseModel, err) {
  return BaseModel.extend({
    defaults : {
      provider : "Reflect"
    },
    /**
     * @param {?} contentHTML
     * @param {Object} opts
     * @return {undefined}
     */
    initialize : function(contentHTML, opts) {
      var self = this;
      self.sponsoredLinks = opts.sponsoredLinks;
      self.threads = opts.threads;
      /** @type {Array} */
      self.collections = [];
      self.app = opts.app;
      _.bindAll(self, "validateCollectionMin", "prepareData");
      self.set("sectionNames", ["col-organic", "col-promoted"]);
      self.set("sectionIds", _.map(self.get("sectionNames"), function(namespace) {
        return namespace + "-" + self.cid;
      }));
      self.sequenceDataCollections();
    },
    /**
     * @return {undefined}
     */
    sequenceDataCollections : function() {
      var app = this.app;
      this.collections.push(this.threads);
      if ("headlines_2x4" === this.get("layout")) {
        this.collections.pop();
      }
      if (app.get("promotedEnabled")) {
        this.collections.push(this.sponsoredLinks);
      }
      this.collections = _.compact(this.collections);
      var inverse = app.get("promotedEnabled") && 1 === this.collections.length;
      var program = app.get("promotedEnabled") && "left" === app.get("promotedSide");
      if (program || inverse) {
        if (this.get("sectionNames")) {
          this.get("sectionNames").reverse();
        }
        if (this.get("sectionIds")) {
          this.get("sectionIds").reverse();
        }
        this.collections.reverse();
      }
    },
    /**
     * @return {?}
     */
    hasData : function() {
      return _.some(this.collections, function(newlines) {
        return newlines.length;
      });
    },
    /**
     * @return {undefined}
     */
    validateCollectionMin : function() {
      var value;
      var length;
      var self = this.collections;
      var vals = this.get("sectionNames").slice(0);
      var segments = this.get("sectionIds").slice(0);
      var i = self.length;
      for (;i > 0;) {
        value = self[--i];
        length = value.minLength;
        if (value.length < length) {
          self.splice(i, 1);
          vals.splice(i, 1);
          segments.splice(i, 1);
          i = self.length;
        }
      }
      if (_.isNumber(this.app.get("numColumns")) && _.isNumber(this.app.get("minPerColumn"))) {
        /** @type {number} */
        var ms = this.app.get("numColumns") * this.app.get("minPerColumn");
        var s = _.reduce(self, function(prev, cur) {
          return prev + cur.length;
        }, 0);
        if (ms > s) {
          self.splice(0, self.length);
          vals.splice(0, vals.length);
          segments.splice(0, segments.length);
        }
      }
      this.set("sectionNames", vals);
      this.set("sectionIds", segments);
    },
    /**
     * @return {undefined}
     */
    prepareData : function() {
      var arg = this.commonClickMetadata();
      this.sponsoredLinks.addClickMetadata(_.defaults({
        layout : this.getLayout()
      }, arg));
      this.threads.addClickMetadata(arg);
    },
    /**
     * @return {undefined}
     */
    trimOrganic : function() {
      var p = this.threads;
      if (p.length > p.maxLength) {
        p.reset(p.slice(0, p.maxLength));
      }
    },
    /**
     * @return {undefined}
     */
    validateData : function() {
      var self = this;
      if (self.threads.maxLength = self.app.getCollectionMax("Organic"), 1 === self.collections.length && self.deactivateThumbnails(), this.sponsoredLinks.validate(), this.validateCollectionMin(), this.prepareData(), !self.hasData()) {
        throw new err.ValidationError("Not enough data");
      }
    },
    /**
     * @return {undefined}
     */
    deactivateThumbnails : function() {
      this.app.set({
        contentPreviews : true
      });
    },
    /**
     * @return {?}
     */
    commonClickMetadata : function() {
      var req = this.app;
      var model = req.get("sourceForum");
      var result = {
        redirectUrl : req.get("redirectUrl"),
        sourceThreadId : req.get("sourceThread").id,
        forumId : model.pk,
        forum : model.id,
        requestBin : req.get("requestBin"),
        service : req.get("service")
      };
      return req.session.isLoggedIn() && (result.userId = req.session.user.id), result;
    },
    /**
     * @param {?} protoProps
     * @return {undefined}
     */
    report : function(protoProps) {
      if (!_.isEmpty(protoProps)) {
        options.client.emit(_.extend(this.snapshot(), protoProps));
      }
    },
    /**
     * @return {?}
     */
    snapshot : function() {
      var msgs = this.threads;
      var req = this.app;
      var staticProps = dataAndEvents.binToEventParams(req.get("requestBin"));
      var user = req.session;
      /** @type {({userId: ??}|{})} */
      var protoProps = user && user.isLoggedIn() ? {
        userId : user.user.id
      } : {};
      var child = _.extend({
        internal_organic : msgs && msgs.length,
        external_organic : 0,
        promoted : 0,
        display : true,
        placement : this.get("placement"),
        zone : "thread",
        area : "discovery",
        thread_id : req.get("sourceThread").id,
        forum_id : req.get("sourceForum").pk
      }, protoProps, staticProps, this.getAdData());
      return child;
    },
    /**
     * @return {?}
     */
    getAdData : function() {
      var app = this.app;
      if (!app.get("promotedEnabled")) {
        return{
          object_type : "link"
        };
      }
      /** @type {string} */
      var object_id = JSON.stringify(this.sponsoredLinks.pluck("advertisement_id"));
      return{
        promoted : this.sponsoredLinks.length,
        promoted_ids : object_id,
        object_type : "advertisement",
        object_id : object_id,
        advertisement_id : object_id,
        ad_product_name : "sponsored_links",
        ad_product_layout : this.getLayout()
      };
    },
    /**
     * @return {?}
     */
    getLayout : function() {
      var layout = this.get("layout");
      return "links" === layout && (layout = this.areThumbnailsEnabled() ? "thumbnails" : "headlines"), layout;
    },
    /**
     * @return {?}
     */
    areThumbnailsEnabled : function() {
      return this.app.get("maxPromotedThumbnailLinks");
    }
  });
}), define("discovery/collections", ["jquery", "backbone", "underscore", "when", "loglevel", "core/api", "core/utils", "core/utils/html", "discovery/exceptions", "discovery/models", "discovery/models/BaseAd", "discovery/models/SponsoredLinkAd"], function(ignoreMethodDoesntExist, Backbone, me, callback, logger, layer, deepDataAndEvents, text, textAlt, dataAndEvents, WebSocket, Session) {
  var Class = Backbone.Collection.extend({
    /**
     * @param {?} path
     * @return {?}
     */
    url : function(path) {
      return layer.getURL(path);
    }
  });
  var AppRouter = function(Class) {
    var proto = Class.prototype;
    return Class.extend({
      /**
       * @return {?}
       */
      url : function() {
        return proto.url.call(this, "discovery/listTopPost.json");
      },
      /**
       * @param {string} expr
       * @return {?}
       */
      parse : function(expr) {
        var result = proto.parse.call(this, expr);
        /** @type {number} */
        var key = 0;
        var id = result.length;
        for (;id > key;key++) {
          result[key].plaintext = text.stripTags(result[key].message);
        }
        return result;
      }
    });
  }(Class);
  var $ = Class.extend({
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      this.model = dataAndEvents[this.modelName];
      this.name = options.name;
      this.minLength = options.minLength;
      this.maxLength = options.maxLength;
    },
    /**
     * @param {?} target
     * @return {undefined}
     */
    addClickMetadata : function(target) {
      this.invoke("set", target);
    }
  });
  var options = $.extend({
    modelName : "RelatedThread",
    /**
     * @param {?} cfg
     * @param {?} graphics
     * @return {undefined}
     */
    initialize : function(cfg, graphics) {
      $.prototype.initialize.call(this, cfg, graphics);
      this.previews = new AppRouter;
    },
    /**
     * @return {?}
     */
    url : function() {
      return $.prototype.url.call(this, "discovery/listRelated.json");
    },
    /**
     * @param {?} query
     * @param {(Node|string)} round
     * @return {?}
     */
    fetch : function(query, round) {
      /** @type {number} */
      query.data.limit = 2 * this.maxLength;
      var num = callback($.prototype.fetch.call(this, query));
      var getContentPreviews = this;
      return round && (num = num.then(function() {
        return getContentPreviews.getContentPreviews().otherwise(function(opt_exception) {
          logger.info("There was a problem getting snippets: ", opt_exception);
        });
      })), num;
    },
    /**
     * @return {?}
     */
    getContentPreviews : function() {
      var results = this.map(function(ids) {
        return parseInt(ids.get("id"), 10);
      });
      if (results.length < this.minLength) {
        return callback.resolve();
      }
      results.sort(function(far, near) {
        return far - near;
      });
      var value = callback(this.previews.fetch({
        data : {
          thread : results
        },
        timeout : options.CONTENT_PREVIEWS_FETCH_TIMEOUT
      }));
      return value.then(me.bind(this.attachPreviews, this));
    },
    /**
     * @return {undefined}
     */
    attachPreviews : function() {
      this.previews.each(function(parent) {
        var cookieName = parent.get("thread");
        var m = this.get(cookieName);
        if (m) {
          m.set("preview", parent);
        }
      }, this);
    }
  }, {
    CONTENT_PREVIEWS_FETCH_TIMEOUT : 5E3
  });
  var Server = $.extend({
    modelName : "Advertisement",
    /**
     * @param {?} cfg
     * @param {Text} param
     * @return {undefined}
     */
    initialize : function(cfg, param) {
      param = me.extend({
        name : "Promoted",
        minLength : 1
      }, param);
      $.prototype.initialize.call(this, cfg, param);
    },
    /**
     * @param {string} resp
     * @return {?}
     */
    parse : function(resp) {
      return resp;
    },
    /**
     * @return {undefined}
     */
    validate : function() {
      if (deepDataAndEvents.isMobileUserAgent()) {
        if (this.length > 0) {
          this.remove(this.where({
            mobile : false
          }));
        }
      }
    }
  });
  var AdvertisementCollection = Class.extend({
    url : "//tempest.services.disqus.com/listPromoted",
    /**
     * @param {?} contentHTML
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(contentHTML, options) {
      options = options || {};
      this._top = new Backbone.Collection;
      this._bottom = new Backbone.Collection;
    },
    /**
     * @param {?} protoProps
     * @return {?}
     */
    fetch : function(protoProps) {
      return callback(Class.prototype.fetch.call(this, protoProps));
    },
    /**
     * @return {?}
     */
    getTopAds : function() {
      return this._top;
    },
    /**
     * @return {?}
     */
    getBottomAds : function() {
      return this._bottom;
    },
    /**
     * @param {Object} data
     * @param {Object} options
     * @return {undefined}
     */
    parse : function(data, options) {
      /**
       * @param {Object} req
       * @return {?}
       */
      function fn(req) {
        switch(req.bin = bin, req.layout) {
          case "headlines_2x4":
          ;
          case "thumbnails_3x2":
          ;
          case "links":
            var maxLength = "links" === req.layout ? options.sponsoredLinksMaxLength : req.ads.length;
            return new Session(req, {
              sponsoredLinks : new Server(req.ads, {
                parse : true,
                maxLength : maxLength
              }),
              threads : options.threads,
              app : options.app
            });
          default:
            return new WebSocket(req);
        }
      }
      var bin = data.bin;
      this._top.reset(me.map(data.top_placement || data.big_unit, fn, this));
      this._bottom.reset(me.map(data.bottom_placement, fn, this));
    }
  });
  var module = {
    PostCollection : AppRouter,
    RelatedThreadCollection : options,
    AdvertisementCollection : AdvertisementCollection,
    SponsoredLinksCollection : Server
  };
  return REFLECT.testing && (module.BaseCollection = Class, module.BaseContentCollection = $), module;
}), define("discovery/variants", [], function() {
  return{
    "default" : {
      maxPerColumn : 2,
      inlineMeta : false,
      contentPreviews : true,
      promotedEnabled : false,
      topPlacementEnabled : false
    },
    promoted : {
      maxPerColumn : 4,
      inlineMeta : true,
      contentPreviews : false,
      promotedEnabled : true,
      topPlacementEnabled : false,
      promotedSide : "right"
    },
    max : {
      maxPerColumn : 4,
      inlineMeta : true,
      contentPreviews : false,
      promotedEnabled : true,
      topPlacementEnabled : true,
      promotedSide : "left"
    },
    thumbnails : {
      maxPromotedThumbnailLinks : 4,
      promotedSide : "left",
      numLinesHeadline : 4
    }
  };
}), define("discovery/views/BaseUnit", ["backbone", "underscore", "stance", "stance/utils", "when", "discovery/exceptions"], function(Backbone, _, decode, nv, $q, errors) {
  /**
   * @param {?} next
   * @param {?} quietMillis
   * @return {undefined}
   */
  var PerfMeasurement = function(next, quietMillis) {
    /** @type {null} */
    var timeout = null;
    /** @type {boolean} */
    var d = false;
    /**
     * @return {undefined}
     */
    this.start = function() {
      if (!d) {
        /** @type {number} */
        timeout = window.setTimeout(function() {
          /** @type {boolean} */
          d = true;
          next();
        }, quietMillis);
      }
    };
    /**
     * @return {undefined}
     */
    this.clear = function() {
      window.clearTimeout(timeout);
    };
  };
  return Backbone.View.extend({
    className : "generic-ad__wrapper",
    /**
     * @return {undefined}
     */
    initialize : function() {
      this._isReady = $q.defer();
      this._isReady.promise.then(_.bind(this._onResolve, this));
    },
    /**
     * @return {?}
     */
    isReady : function() {
      return this._isReady.promise;
    },
    /**
     * @return {undefined}
     */
    _onResolve : function() {
      this.listenTo(this, {
        "view:iab" : _.bind(this.model.reportIABView, this.model)
      });
      this._setupViewEvents();
      this.model.reportLoad();
    },
    /**
     * @param {?} error
     * @return {undefined}
     */
    _rejectReadyPromise : function(error) {
      this._isReady.reject(error);
    },
    /**
     * @return {undefined}
     */
    handleReady : function() {
      this._isReady.resolve();
    },
    /**
     * @param {string} maxLength
     * @return {undefined}
     */
    handleRenderError : function(maxLength) {
      this._rejectReadyPromise(new errors.RenderError(maxLength));
    },
    /**
     * @param {?} maxLength
     * @return {undefined}
     */
    handleTimeoutError : function(maxLength) {
      this._rejectReadyPromise(new errors.TimeoutError(maxLength));
    },
    /**
     * @param {string} maxLength
     * @return {undefined}
     */
    handleNoOfferError : function(maxLength) {
      this._rejectReadyPromise(new errors.NoAds(maxLength));
    },
    /**
     * @return {undefined}
     */
    _setupViewEvents : function() {
      var self = this;
      /** @type {boolean} */
      var matchedChildOrEnd = false;
      var scope = new PerfMeasurement(_.bind(this.trigger, this, "view:iab"), 1E3);
      self.on("view:50in", scope.start, scope);
      self.on("view:50out", scope.clear, scope);
      self.listenTo(decode({
        el : self.el
      }), {
        /**
         * @return {undefined}
         */
        enter : function() {
          self.trigger("view:enter", self);
        },
        /**
         * @return {undefined}
         */
        exit : function() {
          self.trigger("view:exit", self);
          if (matchedChildOrEnd) {
            /** @type {boolean} */
            matchedChildOrEnd = false;
            self.trigger("view:50out", self);
          }
        },
        /**
         * @param {Object} a
         * @param {?} v
         * @return {undefined}
         */
        visible : function(a, v) {
          var pos = nv.visiblePercent(v, a.offset());
          if (pos >= 50 && !matchedChildOrEnd) {
            /** @type {boolean} */
            matchedChildOrEnd = true;
            self.trigger("view:50in", self);
          } else {
            if (50 > pos) {
              if (matchedChildOrEnd) {
                /** @type {boolean} */
                matchedChildOrEnd = false;
                self.trigger("view:50out", self);
              }
            }
          }
          self.trigger("view", self, {
            percentViewable : pos
          });
        }
      });
    }
  });
}), define("discovery/views/HostUnit", ["discovery/views/BaseUnit"], function(BaseView) {
  return BaseView.extend({
    /**
     * @return {?}
     */
    injectable : function() {
      return this.model.get("content");
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.handleReady(), this;
    }
  });
}), define("discovery/views/Iframe", ["jquery", "underscore", "backbone", "core/utils/urls"], function($, c, Backbone, ret) {
  var e = Backbone.View.extend({
    tagName : "iframe",
    /**
     * @param {Element} src
     * @return {undefined}
     */
    initialize : function(src) {
      var rreturn = src.src || this.el.src;
      this._source = rreturn;
      this._origin = ret.getOrigin(rreturn);
      this._onMessage = c.bind(this._onMessage, this);
      $(window).on("message", this._onMessage);
      /** @type {boolean} */
      this._ready = false;
      /** @type {Array} */
      this._buffer = [];
      this.once("message", this._onLoad);
    },
    /**
     * @return {undefined}
     */
    _onLoad : function() {
      /** @type {boolean} */
      this._ready = true;
      c.each(this._buffer, this.postMessage, this);
    },
    /**
     * @param {Object} e
     * @return {undefined}
     */
    _onMessage : function(e) {
      e = e.originalEvent;
      if (e) {
        if (e.origin === this._origin) {
          this.trigger("message", e.data, this);
        }
      }
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.attr("src", this._source), this;
    },
    /**
     * @param {?} data
     * @return {undefined}
     */
    postMessage : function(data) {
      if (this._ready) {
        try {
          this.el.contentWindow.postMessage(data, this._origin);
        } catch (b) {
        }
      } else {
        this._buffer.push(data);
      }
    },
    /**
     * @return {?}
     */
    remove : function() {
      return $(window).off("message", this._onMessage), Backbone.View.prototype.remove.apply(this, arguments);
    }
  });
  return e;
}), define("discovery/views/IframeUnit", ["jquery", "underscore", "backbone", "core/bus", "core/strings", "common/templates", "discovery/views/BaseUnit", "discovery/views/Iframe"], function(jQuery, _, dataAndEvents, view, deepDataAndEvents, context, BasicView, AssetListView) {
  var i = BasicView.extend({
    readyTimeout : 1E4,
    proxyEvents : {
      "view:iab" : 1,
      "view:50in" : 1,
      "view:50out" : 1,
      "view:enter" : 1,
      "view:exit" : 1,
      view : 1
    },
    templateName : "videoAd",
    /**
     * @return {undefined}
     */
    initialize : function() {
      BasicView.prototype.initialize.apply(this, arguments);
      this.listenTo(this, "all", this._proxyEvents);
      this.listenTo(view.frame, "embed.resized", _.debounce(_.bind(this.render, this), 100));
    },
    /**
     * @return {?}
     */
    isEmbedHidden : function() {
      return!jQuery("body").width();
    },
    /**
     * @param {string} type
     * @param {?} deepDataAndEvents
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    _proxyEvents : function(type, deepDataAndEvents, dataAndEvents) {
      if (this.proxyEvents[type]) {
        if ("view" === type) {
          this._postMessage({
            event : "view",
            percentViewable : dataAndEvents.percentViewable
          });
        } else {
          this._postMessage("reflect." + type);
          this._postMessage({
            event : type
          });
          if ("view:iab" === type) {
            this._postMessage("reflect.inView");
          }
        }
      }
    },
    /**
     * @param {number} el
     * @param {string} opts
     * @return {undefined}
     */
    startTimeout : function(el, opts) {
      this.cancelTimeout();
      this._timeout = _.delay(_.bind(this.handleTimeoutError, this, opts || "Unit timed out."), el);
    },
    /**
     * @return {undefined}
     */
    cancelTimeout : function() {
      window.clearTimeout(this._timeout);
    },
    /**
     * @return {?}
     */
    remove : function() {
      return this.cancelTimeout(), this._removeFrame(), BasicView.prototype.remove.apply(this, arguments);
    },
    /**
     * @return {undefined}
     */
    _removeFrame : function() {
      if (this.frame) {
        this.stopListening(this.frame);
        this.frame.remove();
      }
    },
    /**
     * @return {?}
     */
    render : function() {
      if (this.isEmbedHidden()) {
        return this;
      }
      this.stopListening(view.frame, "embed.resized");
      this._removeFrame();
      var data = this.serializeData();
      return this.$el.html(context.render(this.templateName, data)), this.frame = new AssetListView({
        el : this.$("iframe")[0],
        src : data.iframeUrl
      }), this.listenTo(this.frame, "message", this.handleMessage), this.model.reportRequest(), this.frame.render(), this.startTimeout(this.readyTimeout, "Provider timed out."), this;
    },
    /**
     * @param {(number|string)} elementDef
     * @return {undefined}
     */
    _postMessage : function(elementDef) {
      this.frame.postMessage(_.isString(elementDef) ? elementDef : JSON.stringify(elementDef));
    },
    /**
     * @return {?}
     */
    serializeData : function() {
      return this.model.toJSON();
    },
    /**
     * @return {undefined}
     */
    handleMessage : function() {
    }
  });
  return i;
}), define("discovery/views/IABDisplayUnit", ["jquery", "underscore", "remote/config", "discovery/views/IframeUnit"], function(dataAndEvents, deepDataAndEvents, child, BaseView) {
  /** @type {RegExp} */
  var delegateEventSplitter = /(%|px)$/;
  /**
   * @param {string} str
   * @return {?}
   */
  var resize = function(str) {
    if ("auto" === str) {
      return str;
    }
    /** @type {(Array.<string>|null)} */
    var match = String(str).match(delegateEventSplitter);
    return str = parseFloat(str, 10) || 0, match ? str + match[1] : str;
  };
  var g = BaseView.extend({
    className : "iab-ad__wrapper",
    templateName : "iabAd",
    /**
     * @return {?}
     */
    getIframeUrl : function() {
      return child.discovery.iabDisplayUrl || "";
    },
    /**
     * @return {?}
     */
    serializeData : function() {
      var iframeUrl = this.getIframeUrl();
      return{
        iframeUrl : iframeUrl
      };
    },
    /**
     * @param {?} event
     * @return {undefined}
     */
    handleMessage : function(event) {
      switch(event.eventName) {
        case "iframeLoaded":
          this.initAd();
          break;
        case "ready":
          this.cancelTimeout();
          this.handleReady();
          break;
        case "resize":
          this.handleResize(event);
      }
    },
    /**
     * @param {?} e
     * @return {undefined}
     */
    handleResize : function(e) {
      var width = resize(e.width);
      var height = resize(e.height);
      if (width) {
        if (this._currentWidth !== width) {
          this._currentWidth = width;
          this.$("[data-role=iab-ad]").css("width", width);
        }
      }
      if (height) {
        if (this._currentHeight !== height) {
          this._currentHeight = height;
          this.frame.$el.css("height", height);
        }
      }
    },
    /**
     * @return {undefined}
     */
    initAd : function() {
      var imgHeight = this.model.get("height");
      this.handleResize({
        width : this.model.get("width"),
        height : imgHeight
      });
      this._postMessage({
        method : "initAd",
        content : this.model.get("content"),
        autoResize : "auto" === imgHeight
      });
    }
  }, {
    /** @type {function (string): ?} */
    cleanStyleValues : resize
  });
  return g;
}), define("discovery/views/ImageUnit", ["underscore", "loglevel", "discovery/views/BaseUnit", "common/templates"], function(dataAndEvents, deepDataAndEvents, BaseView, sass) {
  var e = BaseView.extend({
    className : "style-variant-default",
    events : {
      "click a" : "handleLinkClick"
    },
    /**
     * @return {undefined}
     */
    handleLinkClick : function() {
      this.model.fireClickPixels();
    },
    /**
     * @return {?}
     */
    serializeData : function() {
      var model = this.model;
      return{
        title : model.get("title"),
        summary : model.get("summary"),
        targetUrl : model.get("target_url"),
        brandName : model.get("brand_name"),
        thumbnailUrl : model.get("thumbnail_url"),
        privacyClickUrl : model.get("privacy_click_url"),
        privacyImageUrl : model.get("privacy_image_url")
      };
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.$el.html(sass.render("imageAd", this.serializeData())), this.handleReady(), this;
    }
  });
  return e;
}), define("discovery/views/VastUnit", ["jquery", "underscore", "stance", "loglevel", "remote/config", "discovery/exceptions", "discovery/helpers", "discovery/views/IframeUnit"], function(jQuery, _, require, log, child, err, dataAndEvents, BaseView) {
  /** @type {number} */
  var quietMillis = 2E3;
  /** @type {number} */
  var failuresLink = 1E4;
  var k = BaseView.extend({
    events : {
      "mouseenter [data-role=iframe-wrapper]" : "turnSoundOn",
      "mouseleave [data-role=iframe-wrapper]" : "turnSoundOff"
    },
    templateName : "videoAd",
    supportedSizes : [{
      width : 320,
      height : 180
    }, {
      width : 480,
      height : 352
    }, {
      width : 640,
      height : 360
    }],
    /**
     * @return {undefined}
     */
    initialize : function() {
      BaseView.prototype.initialize.apply(this, arguments);
      this.listenTo(this, {
        "view:50in" : this.startAd,
        "view:50out" : this.pauseAd
      });
    },
    /**
     * @return {?}
     */
    getIframeUrl : function() {
      return child.discovery.videoPlayerUrl || "";
    },
    /**
     * @return {undefined}
     */
    handleAlmostReady : function() {
      var Events = require({
        el : this.el
      });
      this.listenToOnce(Events, "enter", function() {
        this.model.reportView();
        this.startAd();
      });
    },
    /**
     * @param {?} event
     * @return {undefined}
     */
    handleMessage : function(event) {
      switch(event.eventName) {
        case "iframeLoaded":
          this.initVideoPlayer();
          break;
        case "ready":
          this.cancelTimeout();
          this.handleAlmostReady();
          log.debug(this.model.toLogString() + ': Got "ready" event from ' + (event.isVast ? "VAST" : "VPAID") + " player.");
          break;
        case "play":
          this.cancelTimeout();
          this.handleReady();
          /** @type {boolean} */
          this.hasStarted = true;
          this.model.reportPlayStart();
          break;
        case "error":
          this.handleRenderError("Cannot play video.");
          break;
        case "ended":
          if (this.hasStarted) {
            this.model.reportPlayEnd();
          }
        ;
      }
    },
    /**
     * @param {?} err
     * @return {undefined}
     */
    _rejectReadyPromise : function(err) {
      this.cancelTimeout();
      var label = this.model.toLogString();
      if (log.debug(label + ": " + err), !this._rejectTimeout) {
        var uniqs = this;
        log.debug(label + ": Waiting " + quietMillis + "ms before removing player from DOM.");
        /** @type {number} */
        uniqs._rejectTimeout = window.setTimeout(function() {
          BaseView.prototype._rejectReadyPromise.call(uniqs, err);
        }, quietMillis);
      }
    },
    /**
     * @return {?}
     */
    getSize : function() {
      /** @type {number} */
      var w = Math.min(_.last(this.supportedSizes).width, this.getBodyWidth());
      /** @type {number} */
      var base = w / 1.6;
      return{
        width : w,
        height : base
      };
    },
    /**
     * @return {?}
     */
    serializeData : function() {
      var msgs = this.getIframeUrl();
      var size = this.getSize();
      if (!msgs) {
        throw new err.ValidationError("Video player url is not specified");
      }
      return{
        iframeUrl : _.template(msgs)({
          width : size.width,
          height : size.height
        }),
        height : size.height,
        width : size.width
      };
    },
    /**
     * @return {?}
     */
    getBodyWidth : function() {
      return jQuery("body").width();
    },
    /**
     * @return {undefined}
     */
    initVideoPlayer : function() {
      var size = this.getSize();
      this._postMessage({
        method : "initPlayer",
        url : this.model.get("media_url"),
        width : size.width,
        height : size.height
      });
    },
    /**
     * @return {undefined}
     */
    startAd : function() {
      log.debug(this.model.toLogString() + ": Starting to play.");
      if (!this.hasStarted) {
        this.startTimeout(failuresLink, "Player took too long to play video.");
      }
      this._postMessage({
        method : "playVideo"
      });
    },
    /**
     * @return {undefined}
     */
    pauseAd : function() {
      this._postMessage({
        method : "pauseVideo"
      });
    },
    /**
     * @return {undefined}
     */
    turnSoundOn : function() {
      this._postMessage({
        method : "turnSoundOn"
      });
    },
    /**
     * @return {undefined}
     */
    turnSoundOff : function() {
      this._postMessage({
        method : "turnSoundOff"
      });
    }
  });
  return k;
}), define("discovery/views/VideoIframeUnit", ["jquery", "underscore", "backbone", "loglevel", "core/bus", "core/analytics/jester", "core/strings", "core/utils/urls", "core/switches", "common/templates", "discovery/views/IframeUnit"], function(jQuery, _, dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, keepData, t, res, opt_attributes, ComponentView) {
  /** @type {string} */
  var ready = "ready";
  /** @type {string} */
  var noOffer = "noOffer";
  var defaults = {
    ready : ready,
    noOffer : noOffer,
    "viroolWidget.playerReady" : ready,
    "viroolWidget.noOffers" : noOffer,
    "viroolWidget.offerConfigLoaded" : ready,
    vrl_not_found : noOffer,
    ad_ready : ready,
    ad_failed : noOffer
  };
  var o = ComponentView.extend({
    templateName : "videoAd",
    /**
     * @param {?} attrs
     * @return {undefined}
     */
    initialize : function(attrs) {
      ComponentView.prototype.initialize.apply(this, arguments);
      var extended_ready_timeout = res.isFeatureActive("extended_ready_timeout", {
        domain : t.getHostName(attrs.sourceThreadUrl)
      });
      if (extended_ready_timeout) {
        /** @type {number} */
        this.readyTimeout = 2E4;
      }
    },
    /**
     * @return {?}
     */
    getIframeUrl : function() {
      return this.model.get("media_url");
    },
    /**
     * @return {?}
     */
    serializeData : function() {
      var newHeight;
      var msgs = this.getIframeUrl();
      var newWidth = this.model.get("width") || 640;
      return newWidth = Math.min(newWidth, jQuery("body").width()), newHeight = newWidth / 1.6, {
        iframeUrl : _.template(msgs)({
          width : newWidth,
          height : newHeight
        }),
        height : newHeight,
        width : "100%",
        title : this.model.get("title"),
        summary : this.model.get("summary"),
        targetUrl : this.model.get("target_url"),
        brandName : this.model.get("brand_name"),
        brandImageUrl : this.model.get("brand_image_url")
      };
    },
    /**
     * @param {string} data
     * @return {undefined}
     */
    handleMessage : function(data) {
      try {
        data = JSON.parse(data).event;
      } catch (b) {
      }
      switch(defaults[data]) {
        case ready:
          this.cancelTimeout();
          this.handleReady();
          break;
        case noOffer:
          this.handleNoOfferError("No offer from the provider");
      }
    }
  });
  return o;
}), define("discovery/views/links/TwoColumn", ["jquery", "underscore", "discovery/helpers"], function($, _, buf) {
  /**
   * @param {Array} opt_str
   * @param {Array} element
   * @return {undefined}
   */
  var Tooltip = function(opt_str, element) {
    this.modelIds = opt_str || [];
    this.$elements = $(element || []);
  };
  _.extend(Tooltip.prototype, {
    /**
     * @return {?}
     */
    height : function() {
      var data = this;
      /** @type {Array} */
      data.heights = [];
      var sections = $(data.$elements);
      var min = sections.first().offset().top;
      var max = function() {
        var j = sections.last();
        return j.offset().top + j.height();
      }();
      /** @type {number} */
      var total = max - min;
      /** @type {number} */
      var d = 0;
      return _.each(sections, function(floor) {
        var chunk = $(floor).height();
        data.heights.push(chunk);
        d += chunk;
      }), this.interstice = (total - d) / (sections.length - 1), total;
    }
  });
  /**
   * @return {undefined}
   */
  var conditional = function() {
    /**
     * @return {undefined}
     */
    this.divideIntoColumns = function() {
      var view = this;
      var self = view.subviews[0];
      view.left = new Tooltip;
      view.right = new Tooltip;
      /** @type {number} */
      var c = 0;
      self.collection.each(function(worker, timeoutKey) {
        /** @type {string} */
        var name = c++ % 2 === 0 ? "left" : "right";
        view[name].modelIds.push(worker.id);
        Array.prototype.push.call(view[name].$elements, self.$elements[timeoutKey]);
      });
    };
    /**
     * @param {?} self
     * @param {number} dataAndEvents
     * @return {undefined}
     */
    this.removeOneFromColumn = function(self, dataAndEvents) {
      var type;
      var i = _.chain(self.modelIds).map(function(dataAndEvents, timeoutKey) {
        return[dataAndEvents, self.heights[timeoutKey]];
      }).sortBy(function(dataAndEvents) {
        return-1 * dataAndEvents[1];
      }).find(function(deepDataAndEvents) {
        return deepDataAndEvents[1] <= dataAndEvents;
      }).value()[0];
      var col = this.subviews[0].collection;
      var models = col.models;
      var item = col.get(i);
      var $item = models.indexOf(item);
      /** @type {Array} */
      var BYWEEKNO = [];
      /** @type {Array} */
      var BYDAY = [];
      /** @type {Array} */
      var rules = [BYDAY, BYWEEKNO];
      var l = models.length;
      /** @type {number} */
      type = 0;
      for (;l > type;type++) {
        rules[type % 2].push(models[type]);
      }
      var that = rules[$item % 2];
      that.splice(_.indexOf(that, item), 1);
      /** @type {Array} */
      models = [];
      /** @type {number} */
      var queueHooks = ($item + 1) % 2;
      /** @type {number} */
      type = 0;
      for (;l - 1 > type;type++) {
        models.push(rules[(type + queueHooks) % 2].shift());
      }
      col.reset(models);
    };
    /**
     * @return {undefined}
     */
    this.balanceColumns = function() {
      var db = this.subviews[0];
      var collection = db.collection;
      var prefix = {};
      collection.each(function(dataAndEvents, index) {
        prefix[index] = db.$elements.eq(index).height();
      });
      var data = buf.balancedPartition(prefix);
      data = _.sortBy(data, "length");
      var which = data[1];
      var hooks = data[0];
      var items = collection.models;
      /** @type {Array} */
      var hash = new Array(items.length);
      _.each(which, function(dataAndEvents, i) {
        hash[2 * i] = items[i];
      });
      _.each(hooks, function(dataAndEvents, k) {
        hash[2 * k + 1] = items[k];
      });
      collection.reset(items);
    };
    /**
     * @param {undefined} cl
     * @param {number} clone
     * @return {undefined}
     */
    this.shortenColumn = function(cl, clone) {
      var collections = this.subviews[0].collection;
      if (collections.length % 2 !== 0 && cl === this.left) {
        this.removeOneFromColumn(cl, this.fudge * clone);
      } else {
        this.balanceColumns();
      }
    };
  };
  /**
   * @return {undefined}
   */
  var next_callback = function() {
    /**
     * @return {undefined}
     */
    this.divideIntoColumns = function() {
      var view = this;
      var models = view.subviews;
      var model = models[0];
      var options = models[1];
      var idAttribute = model.collection.model.prototype.idAttribute;
      view.left = new Tooltip(model.collection.pluck(idAttribute), model.$elements);
      var people = options.collection.model.prototype.idAttribute;
      view.right = new Tooltip(options.collection.pluck(people), options.$elements);
    };
    /**
     * @param {boolean} target
     * @param {number} count
     * @return {undefined}
     */
    this.shortenColumn = function(target, count) {
      var db = target === this.left ? this.subviews[0] : this.subviews[1];
      var left = target === this.left ? this.right : this.left;
      var selector = left;
      /** @type {number} */
      var x = count / selector.$elements.length;
      var collection = db.collection;
      var braceStack = _.chain(target.modelIds).map(function(dataAndEvents, index) {
        return[dataAndEvents, target.heights[index]];
      }).sortBy(function(dataAndEvents) {
        return dataAndEvents[1];
      }).value();
      /** @type {Array} */
      var events = [];
      /** @type {number} */
      var sum = 0;
      /** @type {number} */
      var j = count;
      /** @type {number} */
      var maxX = x;
      for (;braceStack.length;) {
        var args = braceStack.pop();
        var handler = args[0];
        var pageY = args[1];
        var value = pageY + target.interstice;
        if (sum + value > count && (selector = target), j = Math.abs(count - (sum + value)), maxX = j / selector.$elements.length, !(maxX >= x)) {
          /** @type {number} */
          x = maxX;
          var index = target.modelIds.indexOf(handler);
          target.modelIds.splice(index, 1);
          Array.prototype.splice.call(target.$elements, index, 1);
          sum += value;
          events.push(handler);
        }
      }
      collection.remove(events);
    };
  };
  /**
   * @param {?} $scope
   * @return {undefined}
   */
  var Controller = function($scope) {
    this.fudge = $scope.fudge;
    this.subviews = $scope.views.slice(0, 2);
    if (1 === this.subviews.length) {
      conditional.call(this);
    } else {
      next_callback.call(this);
    }
  };
  return _.extend(Controller.prototype, {
    /**
     * @return {?}
     */
    ascendingByHeight : function() {
      var left = this.left;
      var right = this.right;
      /** @type {Array} */
      var reversed = [[left, left.height()], [right, right.height()]];
      return _.sortBy(reversed, function(dataAndEvents) {
        return dataAndEvents[1];
      });
    },
    /**
     * @param {string} u
     * @return {?}
     */
    evenColumns : function(u) {
      var ascendingByHeight = this.ascendingByHeight();
      var udataCur = ascendingByHeight[0][0];
      var from = ascendingByHeight[0][1];
      var data = ascendingByHeight[1][0];
      var to = ascendingByHeight[1][1];
      if (from !== to) {
        /** @type {number} */
        var i = to - from;
        /** @type {number} */
        var n = this.fudge * i;
        var a = _.find(data.heights, function(viewgroup) {
          return viewgroup + data.interstice < n;
        });
        return!u && a ? (this.shortenColumn(data, i), this.divideIntoColumns(), this.evenColumns("do not recurse again")) : void this.increaseMargins(udataCur, i);
      }
    },
    /**
     * @param {?} value
     * @param {number} i
     * @return {undefined}
     */
    increaseMargins : function(value, i) {
      var n = value.$elements.length;
      if (!(2 > n)) {
        /** @type {number} */
        var delta = i / n;
        _.each(value.$elements, function(selector) {
          var elem = $(selector);
          /** @type {number} */
          var x = parseInt(elem.css("margin-bottom"), 10);
          /** @type {number} */
          var value = x + delta;
          elem.css("margin-bottom", value + "px");
        });
        var left = value === this.left ? this.right : this.left;
        /** @type {string} */
        var align = value === this.right ? "left" : "right";
        left.$elements.css("clear", align);
      }
    },
    /**
     * @return {?}
     */
    render : function() {
      return this.divideIntoColumns(), this.evenColumns(), this;
    }
  }), Controller;
}), define("discovery/views/links/BaseView", ["underscore", "backbone", "when", "common/templates"], function(dataAndEvents, Backbone, $q, template) {
  return Backbone.View.extend({
    /**
     * @return {undefined}
     */
    initialize : function() {
      this._isReady = $q.defer();
    },
    /**
     * @return {?}
     */
    isReady : function() {
      return this._isReady.promise;
    },
    /**
     * @return {?}
     */
    getTemplateContext : function() {
      return this.appContext || (this.appContext = this.model.app.toJSON()), {
        variant : this.appContext
      };
    },
    /**
     * @param {?} data
     * @param {string} context
     * @return {?}
     */
    template : function(data, context) {
      return context = context || this.templateName, template.render(context, data);
    },
    /**
     * @param {?} error
     * @return {undefined}
     */
    _rejectReadyPromise : function(error) {
      this._isReady.reject(error);
    },
    /**
     * @return {undefined}
     */
    handleReady : function() {
      this._isReady.resolve();
    }
  });
}), define("discovery/views/links/BaseCollectionView", ["underscore", "jquery", "stance", "common/utils", "discovery/helpers", "discovery/views/links/BaseView"], function(utils, $, Event, ret, tuple, BaseView) {
  var g = BaseView.extend({
    events : {
      "click [data-redirect]" : "handleClick"
    },
    templateName : "discoveryCollection",
    /**
     * @param {Event} event
     * @return {undefined}
     */
    handleClick : function(event) {
      this.swapHref(event.currentTarget);
    },
    /**
     * @param {Element} e
     * @return {undefined}
     */
    swapHref : function(e) {
      e.setAttribute("data-href", e.getAttribute("href"));
      e.setAttribute("href", e.getAttribute("data-redirect"));
      utils.delay(function() {
        e.setAttribute("href", e.getAttribute("data-href"));
      }, 100);
    },
    /**
     * @param {Object} selector
     * @return {undefined}
     */
    initialize : function(selector) {
      /** @type {string} */
      this.elementsSelector = "li.discovery-post";
      this.$elements = this.$el.find(this.elementsSelector);
      this.initContext = selector.context;
      var collection = this.collection;
      this.listenTo(collection, {
        remove : this.remove,
        reset : this.render
      });
      this.visibilityTrackers = {};
      this.queueViewEvents();
    },
    /**
     * @return {undefined}
     */
    queueViewEvents : function() {
      if (this.model.app.get("promotedEnabled")) {
        /**
         * @return {?}
         */
        var displayWindowSize = function() {
          return $(this.el).height() / 2;
        };
        utils.each(this.visibilityTrackers, function(inListener, name) {
          if (inListener) {
            if (!this.collection.get(name)) {
              this.stopListening(inListener);
              /** @type {null} */
              this.visibilityTrackers[name] = null;
            }
          }
        }, this);
        utils.each(this.$elements, function(elem) {
          var id = elem.getAttribute("data-id");
          if (!this.visibilityTrackers[id]) {
            var targetNode = this.collection.get(id);
            if (targetNode) {
              var self = Event({
                el : elem,
                timer : null,
                /** @type {function (): ?} */
                topEdgeOffset : displayWindowSize,
                /** @type {function (): ?} */
                bottomEdgeOffset : displayWindowSize
              });
              this.visibilityTrackers[id] = self;
              var d = utils.bind(function() {
                this.reportIABView(id);
                this.stopListening(self);
              }, this);
              this.listenTo(self, {
                /**
                 * @return {undefined}
                 */
                enter : function() {
                  self.timer = utils.delay(d, 1E3);
                },
                /**
                 * @return {undefined}
                 */
                exit : function() {
                  window.clearTimeout(self.timer);
                }
              });
            }
          }
        }, this);
      }
    },
    /**
     * @param {string} name
     * @return {undefined}
     */
    reportIABView : function(name) {
      var cookie = this.collection.get(name);
      var rreturn = cookie.get("tracking_pixels_onview") || [];
      ret.loadPixels(rreturn);
    },
    /**
     * @return {undefined}
     */
    loadOnLoadPixels : function() {
      this.collection.each(function($templateCache) {
        var rreturn = $templateCache.get("tracking_pixels_onload") || [];
        ret.loadPixels(rreturn);
      }, this);
    },
    /**
     * @return {undefined}
     */
    truncate : function() {
      var which = this.$el.find(".line-truncate");
      utils.each(which, function(input) {
        var dummy = $(input);
        tuple.lineTruncate(dummy, {
          lines : parseInt(dummy.attr("data-line-truncate"), 10),
          ellipsis : true
        });
      });
    },
    /**
     * @return {?}
     */
    getTemplateContext : function() {
      var opts = BaseView.prototype.getTemplateContext.call(this);
      utils.extend(opts, this.initContext);
      opts.collection = this.collection.toJSON();
      var collection = this.collection.at(0);
      if (collection) {
        /** @type {string} */
        var on = collection.has("id") ? "organic-" : "promoted-";
        var e = collection.idAttribute;
        utils.each(opts.collection, function(event) {
          event.advertisement_id = event[e];
          event.domIdSuffix = event[e];
          /** @type {string} */
          event.domIdSuffix = on + event.domIdSuffix;
        });
      }
      return opts;
    },
    /**
     * @return {?}
     */
    render : function() {
      var json = this.getTemplateContext();
      return this.$el.html(this.template(json)), this.$elements = this.$el.find(this.elementsSelector), this.truncate(), this.loadOnLoadPixels(), this.queueViewEvents(), this;
    },
    /**
     * @param {Array} keepData
     * @param {?} stopHere
     * @param {Object} e
     * @return {?}
     */
    remove : function(keepData, stopHere, e) {
      if (0 === arguments.length) {
        return BaseView.prototype.remove.call(this);
      }
      var results = utils.toArray(this.$elements);
      var backdrop = results.splice(e.index, 1)[0];
      return $(backdrop).remove(), this.$elements = $(results), this.queueViewEvents(), this;
    }
  });
  return g;
}), define("discovery/views/links/MainView", ["jquery", "underscore", "when", "stance", "core/strings", "core/analytics/jester", "discovery/helpers", "discovery/views/links/TwoColumn", "discovery/views/links/BaseView", "discovery/views/links/BaseCollectionView"], function($$, _, dataAndEvents, $sanitize, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, SidebarView, BaseView, View) {
  /** @type {number} */
  var k = 440;
  var l = BaseView.extend({
    templateName : "discoveryMain",
    topEdgeOffset : 0,
    bottomEdgeOffset : 1 / 0,
    events : {
      /**
       * @param {?} types
       * @return {undefined}
       */
      "click [data-action=discovery-help]" : function(types) {
        types.preventDefault();
        this.model.app.set("help", true);
      },
      /**
       * @param {?} types
       * @return {undefined}
       */
      "click [data-action=discovery-help-close]" : function(types) {
        types.preventDefault();
        this.model.app.set("help", false);
      }
    },
    /**
     * @return {undefined}
     */
    toggleHelp : function() {
      var self = this;
      self.$el.find("#discovery-note").toggle();
    },
    /**
     * @return {undefined}
     */
    rerenderHelp : function() {
      var footer = this.$el.find("#discovery-note");
      if (footer.length) {
        footer.html(this.template(this.getTemplateContext(), "discoveryNote"));
      }
    },
    /**
     * @return {undefined}
     */
    initialize : function() {
      BaseView.prototype.initialize.apply(this, arguments);
      var app = this.model.app;
      this.listenTo(app, {
        "change:help" : this.toggleHelp
      });
      this.listenTo(app.session, "change", this.rerenderHelp);
      this.$el.css({
        display : "block",
        width : "100%"
      });
      _.bindAll(this, "reportIfVisible");
    },
    /**
     * @return {?}
     */
    createSections : function() {
      var data = this.model;
      var orig = this.model.app;
      var prevSources = data.get("sectionNames");
      var ids = data.get("sectionIds");
      return _.map(data.collections, function(consumed, i) {
        var paramType;
        return consumed === data.threads ? paramType = "organic" : consumed === data.sponsoredLinks && (paramType = "promoted"), {
          id : ids[i],
          className : prevSources[i],
          showThumbnailsInRows : "promoted" === paramType && orig.getThumbnailLinksMobile("Promoted"),
          collection : consumed,
          type : paramType
        };
      });
    },
    /**
     * @return {?}
     */
    getTemplateContext : function() {
      var data = this.model.app;
      var sections = this.createSections();
      return{
        id : data.get("innerContainerId"),
        sections : sections,
        forum : data.get("sourceForum"),
        discoverySettingsUrl : data.get("promotedEnabled") && data.get("discoverySettingsUrl"),
        session : data.session.toJSON(),
        thumbnailsEnabled : this.model.areThumbnailsEnabled()
      };
    },
    /**
     * @return {undefined}
     */
    render : function() {
      var res = this;
      res.model.validateData();
      if (res.model.app.get("trackAdVisibility")) {
        res.trackVisibility();
      }
      res.renderViews();
      res.handleReady();
    },
    /**
     * @return {undefined}
     */
    renderViews : function() {
      var data = this.getTemplateContext();
      var app = this.model.app;
      var self = this;
      this.$el.html(this.template(data));
      /** @type {boolean} */
      var program = !self.isTwoColumnLayout();
      /** @type {boolean} */
      var inverse = 1 === self.model.collections.length;
      if (program || inverse) {
        self.model.trimOrganic();
      }
      var reversed = _.map(data.sections, function(item) {
        /** @type {boolean} */
        var has_search_bar = Boolean(app.get("max" + item.collection.name + "ThumbnailLinks"));
        return new View({
          model : self.model,
          collection : item.collection,
          el : $$("#" + item.id + "> [data-role=discovery-posts]"),
          context : {
            thumbnailsEnabled : has_search_bar
          }
        });
      });
      if (app.get("maxPromotedThumbnailLinks")) {
        this.$el.find("#" + app.get("innerContainerId")).addClass("doublethumbnails");
      } else {
        if (2 === reversed.length) {
          this.$el.find("#" + app.get("innerContainerId")).addClass("doublesection");
        }
      }
      var w = this.$el.width();
      this.$el.width(w - 20);
      _.invoke(reversed, "render");
      this.$el.width("100%");
      this.views = reversed;
      this.evenColumns();
      if (app.get("promotedEnabled")) {
        if (self.model.sponsoredLinks.length) {
          self.model.report({
            event : "activity.load_advertisement",
            verb : "load"
          });
        }
      }
    },
    /**
     * @return {?}
     */
    getWidth : function() {
      return this.$el.width();
    },
    /**
     * @return {?}
     */
    isTwoColumnLayout : function() {
      return!this.model.areThumbnailsEnabled() && this.getWidth() >= k;
    },
    /**
     * @return {undefined}
     */
    evenColumns : function() {
      if (this.isTwoColumnLayout()) {
        var sidebarView = new SidebarView({
          views : this.views,
          fudge : 1.2
        });
        sidebarView.render();
      }
    },
    /**
     * @return {undefined}
     */
    reportIfVisible : function() {
      if (this.visibilityTracker) {
        if (this.visibilityTracker.isVisible()) {
          if (this.model.sponsoredLinks) {
            if (this.model.sponsoredLinks.length) {
              this.stopListening(this.visibilityTracker);
              /** @type {null} */
              this.visibilityTracker = null;
              this.model.report({
                verb : "view"
              });
            }
          }
        }
      }
    },
    /**
     * @return {undefined}
     */
    trackVisibility : function() {
      var app = this.model.app;
      this.debouncedReportIfVisible = _.debounce(this.reportIfVisible, app.get("seenByUserThresholdTime"));
      this.visibilityTracker = $sanitize(this);
      this.listenTo(this.visibilityTracker, "enter", this.debouncedReportIfVisible);
    }
  });
  return l;
}), define("discovery/views/links/SponsoredLinks3x2Unit", ["discovery/views/links/MainView"], function(actualObject) {
  /** @type {Object} */
  var object = actualObject;
  var parent = object.prototype;
  return object.extend({
    /**
     * @return {?}
     */
    render : function() {
      return parent.render.call(this), this.$(".discovery-main").addClass("six-ads"), this;
    }
  });
}), define("discovery/views/Placement", ["jquery", "underscore", "backbone", "when", "core/bus", "discovery/exceptions", "discovery/views/HostUnit", "discovery/views/IABDisplayUnit", "discovery/views/ImageUnit", "discovery/views/VastUnit", "discovery/views/VideoIframeUnit", "discovery/views/links/MainView", "discovery/views/links/SponsoredLinks3x2Unit"], function(opt_attributes, cb, Backbone, $q, exec_state, err, dataAndEvents, deepDataAndEvents, ignoreMethodDoesntExist, textAlt, iframe, links, keepData) {
  var n = Backbone.View.extend({
    className : "post-list",
    LAYOUT_TO_CLASS : {
      on_host : dataAndEvents,
      iab_display : deepDataAndEvents,
      iframe : iframe,
      image_target : ignoreMethodDoesntExist,
      video_iframe : iframe,
      video_vast : textAlt,
      links : links,
      thumbnails_3x2 : keepData,
      headlines_2x4 : links
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      options = options || {};
      this.placement = options.placement;
      this.sourceThreadUrl = options.sourceThreadUrl;
      /** @type {boolean} */
      this._enabled = true;
      this._collapse();
    },
    /**
     * @param {?} dataAndEvents
     * @return {undefined}
     */
    setRequestBin : function(dataAndEvents) {
      this._bin = dataAndEvents;
    },
    /**
     * @param {Function} obj
     * @return {undefined}
     */
    _inject : function(obj) {
      exec_state.frame.sendHostMessage("ads.inject", {
        placement : this.placement,
        /** @type {Function} */
        html : obj
      });
    },
    /**
     * @param {Object} item
     * @return {?}
     */
    tryAd : function(item) {
      this._unsetAd();
      var unlock = item.get("layout");
      var cache = this.LAYOUT_TO_CLASS[unlock];
      if (!cache) {
        return $q.reject(new err.ValidationError('Specified ad layout "' + unlock + '" was not found.'));
      }
      item.set("placement", this.placement);
      this._adView = new cache({
        model : item,
        sourceThreadUrl : this.sourceThreadUrl
      });
      this.$el.html(this._adView.el);
      this._adView.render();
      var suiteView = cb.result(this._adView, "injectable");
      return suiteView && this._inject(suiteView), this._adView.isReady().then(cb.bind(this._expand, this)), this._adView.isReady();
    },
    /**
     * @return {?}
     */
    getCurrentUnit : function() {
      return this._adView;
    },
    /**
     * @return {undefined}
     */
    disable : function() {
      /** @type {boolean} */
      this._enabled = false;
      this._collapse();
    },
    /**
     * @return {undefined}
     */
    enable : function() {
      /** @type {boolean} */
      this._enabled = true;
      this._expand();
    },
    /**
     * @return {?}
     */
    remove : function() {
      return this._unsetAd(), Backbone.View.prototype.remove.apply(this, arguments);
    },
    /**
     * @return {undefined}
     */
    _unsetAd : function() {
      if (this._adView) {
        this._adView.model.unset("placement");
        this._adView.remove();
        /** @type {null} */
        this._adView = null;
      }
    },
    /**
     * @return {undefined}
     */
    _expand : function() {
      if (this._enabled) {
        this.$el.css({
          height : "auto",
          visibility : "visible"
        });
      }
    },
    /**
     * @return {undefined}
     */
    _collapse : function() {
      this.$el.css({
        height : 0,
        visibility : "hidden"
      });
    }
  });
  return n;
}), define("templates/discovery", ["handlebars"], function(_) {
  return _.template({
    /**
     * @param {string} object
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
     * @param {Object} value
     * @param {?} cursor
     * @param {?} dataAndEvents
     * @param {Object} task
     * @param {?} data
     * @return {?}
     */
    11 : function(value, cursor, dataAndEvents, task, data) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = cursor.each.call(value, null != value ? value.collection : value, {
        name : "each",
        hash : {},
        fn : this.program(12, task, data),
        inverse : this.noop,
        data : task
      }), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} options
     * @param {number} label
     * @return {?}
     */
    12 : function(elem, helpers, deepDataAndEvents, options, label) {
      var data;
      var manipulationTarget = this.lambda;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<li class="discovery-post';
      return data = helpers["if"].call(elem, null != label[1] ? label[1].thumbnailsEnabled : label[1], {
        name : "if",
        hash : {},
        fn : this.program(13, options, label),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out += " post-" + getAll(manipulationTarget(options && options.index, elem)) + '" id="discovery-link-' + getAll(manipulationTarget(null != elem ? elem.domIdSuffix : elem, elem)) + '" data-id="' + getAll(manipulationTarget(null != elem ? elem.advertisement_id : elem, elem)) + '">\n<a ', data = this.invokePartial(deepDataAndEvents.linkAttributes, "", "linkAttributes", elem, void 0, helpers, deepDataAndEvents, options), null != data && (out += data), out += ' class="publisher-anchor-color">\n', 
      data = helpers["if"].call(elem, null != label[1] ? label[1].thumbnailsEnabled : label[1], {
        name : "if",
        hash : {},
        fn : this.program(15, options, label),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out += '\n<header class="discovery-post-header">\n<h3 title="' + getAll(manipulationTarget(null != elem ? elem.title : elem, elem)) + '">\n<span data-role="discovery-thread-title" class="title line-truncate" data-line-truncate="' + getAll(manipulationTarget(null != (data = null != label[1] ? label[1].variant : label[1]) ? data.numLinesHeadline : data, elem)) + '">\n' + getAll(helpers.html.call(elem, null != elem ? elem.title : elem, {
        name : "html",
        hash : {},
        data : options
      })) + "\n</span>\n\n", data = helpers["if"].call(elem, null != (data = null != label[1] ? label[1].variant : label[1]) ? data.inlineMeta : data, {
        name : "if",
        hash : {},
        fn : this.program(17, options, label),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out += "\n</h3>\n\n", data = helpers.unless.call(elem, null != (data = null != label[1] ? label[1].variant : label[1]) ? data.inlineMeta : data, {
        name : "unless",
        hash : {},
        fn : this.program(25, options, label),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out += "</header>\n\n", data = helpers.if_all.call(elem, null != (data = null != label[1] ? label[1].variant : label[1]) ? data.contentPreviews : data, null != elem ? elem.preview : elem, {
        name : "if_all",
        hash : {},
        fn : this.program(30, options, label),
        inverse : this.noop,
        data : options
      }), null != data && (out += data), out + "</a>\n</li>\n";
    },
    /**
     * @return {?}
     */
    13 : function() {
      return " hasthumbnail";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    15 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="thumbnail"\nstyle="background-image: url(' + escapeExpression(lambda(null != t ? t.thumbnailUrl : t, t)) + ');">\n</div>\n';
    },
    /**
     * @param {string} data
     * @param {Object} step
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    17 : function(data, step, dataAndEvents, context) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = step["if"].call(data, step.gt.call(data, null != data ? data.posts : data, 0, {
        name : "gt",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(18, context),
        inverse : this.program(20, context),
        data : context
      }), null != buf && (optsData += buf), buf = step["if"].call(data, null != data ? data.brand : data, {
        name : "if",
        hash : {},
        fn : this.program(23, context),
        inverse : this.noop,
        data : context
      }), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    18 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var chunk;
      /** @type {string} */
      var d = '<span class="inline-meta">\n';
      return chunk = this.invokePartial(deepDataAndEvents.discoveryPostCount, "", "discoveryPostCount", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != chunk && (d += chunk), d + "</span>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    20 : function(elem, helpers, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(elem, null != elem ? elem.createdAgo : elem, {
        name : "if",
        hash : {},
        fn : this.program(21, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer;
    },
    /**
     * @param {string} t
     * @return {?}
     */
    21 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="inline-meta">' + escapeExpression(lambda(null != t ? t.createdAgo : t, t)) + "</span>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    23 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<span class="inline-meta">\n' + escapeExpression(lambda(null != t ? t.brand : t, t)) + "\n</span>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} step
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    25 : function(elem, step, dataAndEvents, task) {
      var data;
      /** @type {string} */
      var out = '<ul class="meta">\n';
      return data = step["if"].call(elem, step.gt.call(elem, null != elem ? elem.posts : elem, 0, {
        name : "gt",
        hash : {},
        data : task
      }), {
        name : "if",
        hash : {},
        fn : this.program(26, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), data = step["if"].call(elem, null != elem ? elem.createdAgo : elem, {
        name : "if",
        hash : {},
        fn : this.program(28, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</ul>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    26 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var chunk;
      /** @type {string} */
      var d = '<li class="comments">\n';
      return chunk = this.invokePartial(deepDataAndEvents.discoveryPostCount, "", "discoveryPostCount", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != chunk && (d += chunk), d + "</li>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    28 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<li class="time">' + escapeExpression(lambda(null != t ? t.createdAgo : t, t)) + "</li>\n";
    },
    /**
     * @param {?} opt_obj2
     * @param {?} walkers
     * @param {?} deepDataAndEvents
     * @param {?} isXML
     * @return {?}
     */
    30 : function(opt_obj2, walkers, deepDataAndEvents, isXML) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = this.invokePartial(deepDataAndEvents.discoveryContentPreview, "", "discoveryContentPreview", opt_obj2, void 0, walkers, deepDataAndEvents, isXML), null != buf && (optsData += buf), optsData;
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    32 : function(elem, helpers, dataAndEvents, task) {
      var data;
      var manipulationTarget = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var out = 'href="' + escapeExpression(manipulationTarget(null != elem ? elem.redirectUrl : elem, elem)) + '" ';
      return data = helpers["if"].call(elem, null != elem ? elem.brand : elem, {
        name : "if",
        hash : {},
        fn : this.program(33, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "\n";
    },
    /**
     * @return {?}
     */
    33 : function() {
      return'target="_blank" rel="nofollow norewrite"';
    },
    /**
     * @param {string} value
     * @param {?} _super
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    35 : function(value, _super, deepDataAndEvents, task) {
      var data;
      var group = this.lambda;
      var finishNode = this.escapeExpression;
      /** @type {string} */
      var out = "<a ";
      return data = this.invokePartial(deepDataAndEvents.linkAttributes, "", "linkAttributes", value, void 0, _super, deepDataAndEvents, task), null != data && (out += data), out + ' class="top-comment" data-role="discovery-top-comment">\n<img data-src="' + finishNode(group(null != (data = null != (data = null != (data = null != value ? value.preview : value) ? data.author : data) ? data.avatar : data) ? data.cache : data, value)) + '" alt="' + finishNode(_super.gettext.call(value, "Avatar", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" data-role="discovery-avatar">\n<p><span class="user" data-role="discovery-top-comment-author">' + finishNode(group(null != (data = null != (data = null != value ? value.preview : value) ? data.author : data) ? data.name : data, value)) + '</span> &#8212; <span data-role="discovery-top-comment-snippet" class="line-truncate" data-line-truncate="3">' + finishNode(group(null != (data = null != value ? value.preview : value) ? data.plaintext : data, value)) + "</span></p>\n</a>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} context
     * @return {?}
     */
    37 : function(elem, helpers, dataAndEvents, context) {
      var data;
      /** @type {string} */
      var headBuffer = "";
      return data = helpers["if"].call(elem, helpers.eq.call(elem, null != elem ? elem.posts : elem, 1, {
        name : "eq",
        hash : {},
        data : context
      }), {
        name : "if",
        hash : {},
        fn : this.program(38, context),
        inverse : this.program(40, context),
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
    38 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "1 comment", {
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
    40 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return escapeExpression(testEnvironment.gettext.call(next_scope, "%(numPosts)s comments", {
        name : "gettext",
        hash : {
          numPosts : null != next_scope ? next_scope.posts : next_scope
        },
        data : task
      })) + "\n";
    },
    /**
     * @param {Object} elem
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @param {?} label
     * @return {?}
     */
    42 : function(elem, helpers, deepDataAndEvents, task, label) {
      var data;
      var manipulationTarget = this.lambda;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div id="' + getAll(manipulationTarget(null != elem ? elem.id : elem, elem)) + '" class="discovery-main';
      return data = helpers["if"].call(elem, null != elem ? elem.thumbnailsEnabled : elem, {
        name : "if",
        hash : {},
        fn : this.program(43, task, label),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '">\n<div id="discovery-note" class="discovery-note">\n', data = this.invokePartial(deepDataAndEvents.discoveryNote, "", "discoveryNote", elem, void 0, helpers, deepDataAndEvents, task), null != data && (out += data), out += '</div>\n\n<div class="discovery-options">\n<button class="discovery-help" data-action="discovery-help">\n' + getAll(helpers.gettext.call(elem, "What's this?", {
        name : "gettext",
        hash : {},
        data : task
      })) + "\n</button>\n</div>\n\n", data = helpers.each.call(elem, null != elem ? elem.sections : elem, {
        name : "each",
        hash : {},
        fn : this.program(45, task, label),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "\n</div>\n";
    },
    /**
     * @return {?}
     */
    43 : function() {
      return " discovery-thumbnails";
    },
    /**
     * @param {Object} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} options
     * @param {?} data
     * @return {?}
     */
    45 : function(elem, helpers, dataAndEvents, options, data) {
      var c;
      var manipulationTarget = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var tagName = '<section id="' + escapeExpression(manipulationTarget(null != elem ? elem.id : elem, elem)) + '" class="' + escapeExpression(manipulationTarget(null != elem ? elem.className : elem, elem)) + " discovery-col-" + escapeExpression(manipulationTarget(options && options.index, elem)) + " ";
      return c = helpers["if"].call(elem, null != elem ? elem.showThumbnailsInRows : elem, {
        name : "if",
        hash : {},
        fn : this.program(46, options, data),
        inverse : this.noop,
        data : options
      }), null != c && (tagName += c), tagName += '" >\n<header class="discovery-col-header">\n\n', c = helpers["if"].call(elem, helpers.eq.call(elem, null != elem ? elem.type : elem, "organic", {
        name : "eq",
        hash : {},
        data : options
      }), {
        name : "if",
        hash : {},
        fn : this.program(48, options, data),
        inverse : this.noop,
        data : options
      }), null != c && (tagName += c), tagName += "\n", c = helpers["if"].call(elem, helpers.eq.call(elem, null != elem ? elem.type : elem, "promoted", {
        name : "eq",
        hash : {},
        data : options
      }), {
        name : "if",
        hash : {},
        fn : this.program(50, options, data),
        inverse : this.noop,
        data : options
      }), null != c && (tagName += c), tagName + '\n</header>\n<ul class="discovery-posts" data-role="discovery-posts">\n</ul>\n</section>\n';
    },
    /**
     * @return {?}
     */
    46 : function() {
      return " thumbnails-rows";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @param {Array} dataAndEvents
     * @return {?}
     */
    48 : function(next_scope, testEnvironment, deepDataAndEvents, task, dataAndEvents) {
      var escapeExpression = this.escapeExpression;
      return "<h2>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Also on %(forumName)s", {
        name : "gettext",
        hash : {
          forumName : testEnvironment.getPartial.call(next_scope, "forumName", null != dataAndEvents[2] ? dataAndEvents[2].forum : dataAndEvents[2], {
            name : "getPartial",
            hash : {},
            data : task
          })
        },
        data : task
      })) + "</h2>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    50 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return "<h2>" + escapeExpression(testEnvironment.gettext.call(next_scope, "Around The Web", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</h2>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    52 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a href="https://help.disqus.com/customer/portal/articles/666278-introducing-promoted-discovery-and-f-a-q-"\ntarget="_blank">' + escapeExpression(testEnvironment.gettext.call(next_scope, "Learn more", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    54 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<a href="https://www.surveymonkey.com/s/GHK872T" target="_blank">\n' + escapeExpression(testEnvironment.gettext.call(next_scope, "give us feedback", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>";
    },
    /**
     * @param {Object} t
     * @return {?}
     */
    56 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return "<strong>" + escapeExpression(lambda(null != t ? t.name : t, t)) + "</strong>\n";
    },
    /**
     * @param {string} elem
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    58 : function(elem, testEnvironment, dataAndEvents, task) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="alert">\n<button class="close" data-action="discovery-help-close" title="' + getAll(testEnvironment.gettext.call(elem, "Close this box", {
        name : "gettext",
        hash : {},
        data : task
      })) + '">\u00c3\u2014</button>\n' + getAll(testEnvironment.gettext.call(elem, "Reflect helps you find new and interesting content, discussions and products. Some sponsors and ecommerce sites may pay us for these recommendations and links. %(learnMore)s or %(feedback)s.", {
        name : "gettext",
        hash : {
          feedback : testEnvironment.getPartial.call(elem, "feedback", {
            name : "getPartial",
            hash : {},
            data : task
          }),
          learnMore : testEnvironment.getPartial.call(elem, "learnMore", {
            name : "getPartial",
            hash : {},
            data : task
          })
        },
        data : task
      })) + "\n";
      return data = testEnvironment.if_all.call(elem, null != (data = null != (data = null != elem ? elem.session : elem) ? data.thread : data) ? data.canModerate : data, null != elem ? elem.discoverySettingsUrl : elem, {
        name : "if_all",
        hash : {},
        fn : this.program(59, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</div>\n";
    },
    /**
     * @param {string} t
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    59 : function(t, testEnvironment, dataAndEvents, task) {
      var left;
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<br/>\n<a href="' + escapeExpression(lambda(null != t ? t.discoverySettingsUrl : t, t)) + '" target="_blank" class="btn">' + escapeExpression(testEnvironment.gettext.call(t, "Change %(Discovery)s settings for %(forumName)s", {
        name : "gettext",
        hash : {
          forumName : null != (left = null != t ? t.forum : t) ? left.name : left,
          Discovery : "Discovery"
        },
        data : task
      })) + "</a>\n";
    },
    /**
     * @param {string} elem
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    61 : function(elem, testEnvironment, dataAndEvents, task) {
      var data;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="generic-ad__block">\n<div class="icon__block text-subheading">\n<span class="icon-trophy icon"></span> ' + getAll(testEnvironment.gettext.call(elem, "Sponsored", {
        name : "gettext",
        hash : {},
        data : task
      })) + '\n</div>\n<div data-role="iframe-wrapper" class="iframe-ad__wrapper">\n<iframe class="iframe-ad" frameborder="0" allowfullscreen overflow="hidden" scrolling="no" data-role="iframe-ad"></iframe>\n</div>\n<div class="sponsored">\n';
      return data = testEnvironment.if_all.call(elem, null != elem ? elem.targetUrl : elem, null != elem ? elem.brandName : elem, null != elem ? elem.summary : elem, {
        name : "if_all",
        hash : {},
        fn : this.program(62, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + "</div>\n</div>\n";
    },
    /**
     * @param {string} elem
     * @param {Object} helpers
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    62 : function(elem, helpers, dataAndEvents, task) {
      var data;
      var manipulationTarget = this.lambda;
      var getAll = this.escapeExpression;
      /** @type {string} */
      var out = '<div class="footer clickable-footer ';
      return data = helpers["if"].call(elem, null != elem ? elem.brandImageUrl : elem, {
        name : "if",
        hash : {},
        fn : this.program(63, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out += '">\n', data = helpers["if"].call(elem, null != elem ? elem.brandImageUrl : elem, {
        name : "if",
        hash : {},
        fn : this.program(65, task),
        inverse : this.noop,
        data : task
      }), null != data && (out += data), out + '<div class="brand-content">\n<a href="' + getAll(manipulationTarget(null != elem ? elem.targetUrl : elem, elem)) + '" target="_blank" class="text-default">\n<small class="text-subheading">\n' + getAll(helpers.gettext.call(elem, "Sponsored By %(name)s", {
        name : "gettext",
        hash : {
          name : helpers.tag.call(elem, "strong", {
            name : "tag",
            hash : {
              text : null != elem ? elem.brandName : elem
            },
            data : task
          })
        },
        data : task
      })) + '\n</small>\n<p class="brand-summary">\n' + getAll(manipulationTarget(null != elem ? elem.summary : elem, elem)) + '\n</p>\n</a>\n</div>\n<div class="learn-more">\n<a href="' + getAll(manipulationTarget(null != elem ? elem.targetUrl : elem, elem)) + '" target="_blank" class="learn-more-btn" data-role="learn-more">\n' + getAll(helpers.gettext.call(elem, "Learn More", {
        name : "gettext",
        hash : {},
        data : task
      })) + ' <i class="icon-arrow-forward"></i>\n</a>\n</div>\n</div>\n';
    },
    /**
     * @return {?}
     */
    63 : function() {
      return "has-brand-logo";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    65 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<div class="brand-logo avatar">\n<a href="' + escapeExpression(lambda(null != t ? t.targetUrl : t, t)) + '" target="_blank">\n<img src="' + escapeExpression(lambda(null != t ? t.brandImageUrl : t, t)) + '" />\n</a>\n</div>\n';
    },
    /**
     * @param {?} next_scope
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    67 : function(next_scope, testEnvironment, dataAndEvents, task) {
      var escapeExpression = this.escapeExpression;
      return'<div data-role="iab-ad" class="iab-ad">\n<div class="icon__block text-subheading">\n<span class="icon-trophy icon"></span> ' + escapeExpression(testEnvironment.gettext.call(next_scope, "Sponsored", {
        name : "gettext",
        hash : {},
        data : task
      })) + '\n</div>\n<iframe width="100%" frameborder="0" allowfullscreen overflow="hidden" scrolling="no"></iframe>\n</div>\n';
    },
    /**
     * @param {string} elem
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    69 : function(elem, testEnvironment, dataAndEvents, task) {
      var data;
      var manipulationTarget = this.lambda;
      var escapeExpression = this.escapeExpression;
      /** @type {string} */
      var headBuffer = "";
      return data = testEnvironment.if_all.call(elem, null != elem ? elem.privacyClickUrl : elem, null != elem ? elem.privacyImageUrl : elem, {
        name : "if_all",
        hash : {},
        fn : this.program(70, task),
        inverse : this.noop,
        data : task
      }), null != data && (headBuffer += data), headBuffer + '<a href="' + escapeExpression(manipulationTarget(null != elem ? elem.targetUrl : elem, elem)) + '" target="_blank"><img src="' + escapeExpression(manipulationTarget(null != elem ? elem.thumbnailUrl : elem, elem)) + '"></a>\n';
    },
    /**
     * @param {string} node
     * @param {?} testEnvironment
     * @param {?} dataAndEvents
     * @param {Object} task
     * @return {?}
     */
    70 : function(node, testEnvironment, dataAndEvents, task) {
      var lambda = this.lambda;
      var each = this.escapeExpression;
      return'<a class="ad-dr__thumb-privacy-link" href="' + each(lambda(null != node ? node.privacyClickUrl : node, node)) + '" target="_blank"><img src="' + each(lambda(null != node ? node.privacyImageUrl : node, node)) + '" alt="' + each(testEnvironment.gettext.call(node, "Privacy", {
        name : "gettext",
        hash : {},
        data : task
      })) + '" /></a>\n';
    },
    /**
     * @param {string} a
     * @param {Object} helpers
     * @param {?} deepDataAndEvents
     * @param {Object} task
     * @return {?}
     */
    72 : function(a, helpers, deepDataAndEvents, task) {
      var b;
      var expect = this.escapeExpression;
      var $ = this.lambda;
      /** @type {string} */
      var response = '<div class="ad-dr -thumb-right clearfix">\n<div class="ad-dr__thumb">\n';
      return b = this.invokePartial(deepDataAndEvents.adThumbnail, "", "adThumbnail", a, void 0, helpers, deepDataAndEvents, task), null != b && (response += b), response += '</div>\n<div class="ad-dr__content">\n<div class="ad-dr__company">\n', b = helpers["if"].call(a, null != a ? a.brandName : a, {
        name : "if",
        hash : {},
        fn : this.program(73, task),
        inverse : this.noop,
        data : task
      }), null != b && (response += b), response += '<span class="icon-trophy" aria-hidden="true"></span><span>' + expect(helpers.gettext.call(a, "Sponsored", {
        name : "gettext",
        hash : {},
        data : task
      })) + '</span>\n</div>\n<div class="ad-dr__thumb--mobile">\n', b = this.invokePartial(deepDataAndEvents.adThumbnail, "", "adThumbnail", a, void 0, helpers, deepDataAndEvents, task), null != b && (response += b), response + '</div>\n<h2 class="ad-dr__title">\n<a class="publisher-anchor-color" href="' + expect($(null != a ? a.targetUrl : a, a)) + '" target="_blank">' + expect($(null != a ? a.title : a, a)) + '</a>\n</h2>\n<div class="ad-dr__message">\n' + expect($(null != a ? a.summary : a, a)) + 
      '\n</div>\n<div class="ad-dr__cta">\n<a class="btn" href="' + expect($(null != a ? a.targetUrl : a, a)) + '" target="_blank">' + expect(helpers.gettext.call(a, "Learn More", {
        name : "gettext",
        hash : {},
        data : task
      })) + "</a>\n</div>\n</div>\n</div>\n";
    },
    /**
     * @param {string} t
     * @return {?}
     */
    73 : function(t) {
      var lambda = this.lambda;
      var escapeExpression = this.escapeExpression;
      return'<a class="publisher-anchor-color" href="' + escapeExpression(lambda(null != t ? t.targetUrl : t, t)) + '" target="_blank">\n' + escapeExpression(lambda(null != t ? t.brandName : t, t)) + '\n</a><span class="bullet" aria-hidden="true">\u00e2\u20ac\u00a2</span>\n';
    },
    compiler : [6, ">= 2.0.0-beta.1"],
    /**
     * @param {?} value
     * @param {Object} test
     * @param {?} environment
     * @param {Object} options
     * @param {?} inName
     * @return {?}
     */
    main : function(value, test, environment, options, inName) {
      var buf;
      /** @type {string} */
      var optsData = "";
      return buf = test.partial.call(value, "followButton", {
        name : "partial",
        hash : {},
        fn : this.program(1, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "discoveryCollection", {
        name : "partial",
        hash : {},
        fn : this.program(11, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "linkAttributes", {
        name : "partial",
        hash : {},
        fn : this.program(32, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "discoveryContentPreview", {
        name : "partial",
        hash : {},
        fn : this.program(35, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "discoveryPostCount", {
        name : "partial",
        hash : {},
        fn : this.program(37, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "discoveryMain", {
        name : "partial",
        hash : {},
        fn : this.program(42, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "learnMore", {
        name : "partial",
        hash : {},
        fn : this.program(52, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "feedback", {
        name : "partial",
        hash : {},
        fn : this.program(54, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "forumName", {
        name : "partial",
        hash : {},
        fn : this.program(56, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n\n", buf = test.partial.call(value, "discoveryNote", {
        name : "partial",
        hash : {},
        fn : this.program(58, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "videoAd", {
        name : "partial",
        hash : {},
        fn : this.program(61, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "iabAd", {
        name : "partial",
        hash : {},
        fn : this.program(67, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "adThumbnail", {
        name : "partial",
        hash : {},
        fn : this.program(69, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData += "\n", buf = test.partial.call(value, "imageAd", {
        name : "partial",
        hash : {},
        fn : this.program(72, options, inName),
        inverse : this.noop,
        data : options
      }), null != buf && (optsData += buf), optsData;
    },
    usePartial : true,
    useData : true,
    useDepths : true
  });
}), define("discovery/main", ["backbone", "underscore", "jquery", "loglevel", "stance", "when", "core/switches", "core/analytics/identity", "core/analytics/jester", "core/utils", "core/utils/storage", "core/utils/urls", "common/utils", "common/Session", "remote/config", "discovery/collections", "discovery/helpers", "discovery/variants", "discovery/exceptions", "discovery/views/Placement", "discovery/models/SponsoredLinkAd", "templates/discovery"], function(Backbone, _, $, utils, ignoreMethodDoesntExist, 
when, res, deepDataAndEvents, topic, textAlt, $templateCache, vec, keepData, otherMap, opt_attributes, mathy, $injector, allsettings, dataAndEvents, AppRouter, ctor, $sanitize) {
  $sanitize();
  var proto = {};
  /** @type {number} */
  var timedout = 1E4;
  return proto.DiscoveryApp = Backbone.Model.extend({
    defaults : {
      name : "promoted",
      inlineMeta : true,
      contentPreviews : false,
      organicEnabled : true,
      promotedEnabled : true,
      topPlacementEnabled : false,
      redirectUrl : "http://disq.us/url",
      sourceThread : null,
      sourceForum : null,
      sourceThreadUrl : null,
      discoverySettingsUrl : null,
      numColumns : 2,
      maxPerColumn : null,
      maxOrganicTextLinks : null,
      maxPromotedTextLinks : null,
      maxPromotedThumbnailLinks : null,
      maxPromotedThumbnailLinksMobile : null,
      innerContainerName : "discovery-main",
      promotedSide : "right",
      hasHighlightedPost : true,
      lineTruncationEnabled : true,
      session : null,
      numLinesHeadline : 2,
      requestBinOverride : null,
      js : null,
      css : null,
      seenByUserThresholdTime : 2E3,
      trackAdVisibility : null,
      pageUrl : null,
      pageReferrer : null
    },
    /**
     * @param {string} name
     * @return {?}
     */
    get : function(name) {
      return _.has(this.constructor.loggedinOverrides, name) && this.session.isLoggedIn() ? this.constructor.loggedinOverrides[name] : Backbone.Model.prototype.get.apply(this, arguments);
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    initialize : function(options) {
      var self = this;
      self.session = otherMap.get();
      self.triedAds = {};
      self.topPlacement = new AppRouter({
        placement : "top",
        sourceThreadUrl : this.get("sourceThreadUrl")
      });
      $("#placement-top").html(self.topPlacement.$el);
      self.listenTo(self, "change:hasHighlightedPost", function(dataAndEvents, deepDataAndEvents) {
        if (deepDataAndEvents) {
          self.topPlacement.disable();
        } else {
          self.topPlacement.enable();
        }
      });
      self.bottomPlacement = new AppRouter({
        placement : "bottom"
      });
      $("#placement-bottom").html(self.bottomPlacement.$el);
      self.configure(options);
      self.createDataCollections();
    },
    /**
     * @return {undefined}
     */
    createDataCollections : function() {
      this.ads = new mathy.AdvertisementCollection;
      /** @type {string} */
      var from = "Organic";
      this.threads = new mathy.RelatedThreadCollection([], {
        name : from,
        minLength : this.get("promotedEnabled") ? 1 : 2,
        maxLength : this.getCollectionMax(from)
      });
    },
    /**
     * @param {Object} args
     * @return {undefined}
     */
    configure : function(args) {
      args = args || {};
      var model = this;
      var options = allsettings[model.get("name")] || {};
      if (model.get("thumbnailsEnabled") && _.extend(options, allsettings.thumbnails), model.set(_.defaults(args, options)), model.has("maxPerColumn")) {
        /** @type {number} */
        var window_width = model.get("promotedEnabled") ? 1 : 2;
        model.set("maxOrganicTextLinks", window_width * model.get("maxPerColumn"));
        model.set("maxPromotedTextLinks", model.get("maxPerColumn"));
      } else {
        if (model.has("maxOrganicTextLinks")) {
          model.set("maxPerColumn", model.get("maxOrganicTextLinks"));
        }
      }
      model.set("innerContainerId", model.get("innerContainerName") + "-" + model.cid);
    },
    /**
     * @return {?}
     */
    getViewportWidth : function() {
      return $(document).width();
    },
    /**
     * @param {string} min
     * @return {?}
     */
    getThumbnailLinksMobile : function(min) {
      return this.getViewportWidth() <= 480 && this.get("max" + min + "ThumbnailLinksMobile");
    },
    /**
     * @param {string} min
     * @return {?}
     */
    getCollectionMax : function(min) {
      return this.getThumbnailLinksMobile(min) || (this.get("max" + min + "ThumbnailLinks") || this.get("max" + min + "TextLinks"));
    },
    /**
     * @return {?}
     */
    run : function() {
      var sprite = this;
      var result = when(this.get("organicEnabled") && this.getDataOrganic());
      return this.get("promotedEnabled") || (this.get("adsVideoEnabled") || this.get("adsDRNativeEnabled")) ? (utils.debug("Ads enabled, making request to listPromoted"), this.getDataPromoted().then(function() {
        return result.always(function() {
          return sprite.runAdDaisyChain();
        });
      }).otherwise(function() {
        return utils.debug("Ad daisy chain failed, falling back to organic only links"), result.then(function() {
          return sprite.renderOrganicLinks();
        });
      }).otherwise(function(value) {
        utils.debug("Organic-only fallback failed, too");
        $injector.reportError(value);
      })) : (utils.debug("Ads disabled, starting organic-only Discovery"), result.then(function() {
        return sprite.threads.length ? sprite.renderOrganicLinks() : void utils.debug("No organic links, bailing out");
      }).otherwise(function(value) {
        utils.debug("Organic-only Discovery failed");
        $injector.reportError(value);
      }));
    },
    /**
     * @return {undefined}
     */
    renderOrganicLinks : function() {
      var child = new ctor({
        layout : "links"
      }, {
        sponsoredLinks : new mathy.SponsoredLinksCollection([], {
          maxLength : this.getCollectionMax("Promoted")
        }),
        threads : this.threads,
        app : this
      });
      this.bottomPlacement.tryAd(child);
    },
    /**
     * @return {?}
     */
    runAdDaisyChain : function() {
      /**
       * @param {?} obj
       * @return {?}
       */
      function a(obj) {
        return obj instanceof ctor;
      }
      /**
       * @param {?} options
       * @return {?}
       */
      function objectToString(options) {
        return options.any(a);
      }
      /**
       * @param {?} e
       * @param {Array} data
       * @return {?}
       */
      function error(e, data) {
        try {
          return response.chainAds(e, data, 0);
        } catch (a) {
          return $injector.reportError(a), when.reject(a);
        }
      }
      var response = this;
      var e = response.ads.getTopAds();
      var options = response.ads.getBottomAds();
      var html = e.find(a) || options.find(a);
      if (html) {
        if (html.hasData()) {
          if (response.get("topPlacementEnabled")) {
            if (!objectToString(e)) {
              e.push(html);
            }
          }
          if (!objectToString(options)) {
            options.push(html);
          }
        }
      }
      var killedP;
      var x = error(response.topPlacement, e);
      var v = _.partial(error, response.bottomPlacement, options);
      return killedP = response.get("topPlacementEnabled") ? x.always(v) : v(), when.any([x, killedP]);
    },
    /**
     * @return {?}
     */
    getAllowedTopUnits : function() {
      /** @type {Array} */
      var queuedVideos = [];
      return this.get("hasHighlightedPost") || (this.get("adsVideoEnabled") && queuedVideos.push("video"), this.get("adsDRNativeEnabled") && queuedVideos.push("native_dr")), this.get("topPlacementEnabled") && queuedVideos.push("sponsored_links"), queuedVideos;
    },
    /**
     * @return {?}
     */
    getAllowedBottomUnits : function() {
      return this.get("promotedEnabled") ? ["sponsored_links"] : [];
    },
    /**
     * @return {?}
     */
    getDataOrganic : function() {
      var params = {
        timeout : timedout,
        data : {
          thread : this.get("sourceThread").id
        },
        reset : true,
        humanFriendlyTimestamp : true
      };
      return this.threads.fetch(params, this.get("contentPreviews"));
    },
    /**
     * @return {?}
     */
    getDataPromoted : function() {
      var self = this;
      if (self.get("preview")) {
        if (self.has("previewQueryParam")) {
          self.ads.url = "//tempest.services.disqus.com/preview/serve/" + self.get("previewQueryParam");
        }
      }
      var params = {
        timeout : timedout,
        data : {
          imp : deepDataAndEvents.impression.impId,
          doc_width : this.getViewportWidth(),
          is_logged_out : this.session.isKnownToBeLoggedOut(),
          has_flash : $injector.hasFlash(),
          has_highlighted_post : this.get("hasHighlightedPost"),
          page_url : this.get("pageUrl"),
          page_referrer : this.get("pageReferrer"),
          forum : this.get("sourceForum").id,
          forum_id : this.get("sourceForum").pk,
          thread_id : this.get("sourceThread").id,
          top_placement : this.getAllowedTopUnits(),
          bottom_placement : this.getAllowedBottomUnits(),
          color_scheme : this.get("colorScheme"),
          typeface : this.get("typeface")
        },
        dataType : "jsonp",
        omitReflectApiKey : true,
        reset : true,
        sponsoredLinksMaxLength : this.getCollectionMax("Promoted"),
        threads : this.threads,
        app : this
      };
      var attrs = $templateCache.get("lp:headers");
      return _.isEmpty(attrs) || (params.data.HTTP_X_DEBUG = 1, _.each(attrs, function(exception) {
        params.data["HTTP_X_" + exception.name] = exception.value;
      })), self.has("gutterSwitch") && (params.data.HTTP_X_DEBUG = 1, params.data["HTTP_X_GUTTER_" + self.get("gutterSwitch").replace(":", "__")] = 1), null !== self.get("requestBinOverride") && (params.data.HTTP_X_DEBUG = 1, params.data.HTTP_X_DEBUG_BIN = self.get("requestBinOverride")), this.get("adsFixture") && (params.data.ads_fixture = this.get("adsFixture"), params.data.top_placement = params.data.top_placement.concat(["video", "native_dr"])), this.get("pdFixture") && (params.data.pd_fixture = 
      this.get("pdFixture")), this.ads.fetch(params).then(function(data) {
        utils.debug("Response from listPromoted:", data);
        var length = data.bin;
        if (!length) {
          throw new dataAndEvents.NoBinError("No bin specified");
        }
        self.set("requestBin", length);
        self.topPlacement.setRequestBin(self.get("requestBin"));
        self.bottomPlacement.setRequestBin(self.get("requestBin"));
        var dest;
        var obj = data.extra;
        if (obj) {
          if (obj.service) {
            if (obj.service_version) {
              dest = _.pick(obj, "service", "service_version");
              topic.client.set(dest);
              self.set("service", dest);
            }
          }
        }
      });
    },
    /**
     * @param {?} curr
     * @param {Array} data
     * @param {number} idx
     * @return {?}
     */
    chainAds : function(curr, data, idx) {
      var self = this;
      if (idx >= data.length) {
        return when.defer().reject(new dataAndEvents.AdsExhaustedError("No more ads available."));
      }
      var item = data.at(idx);
      return utils.debug(item.toLogString() + ": Processing ad " + (idx + 1) + " ad out of " + data.length + " ads"), self.triedAds[item.id] || item.get("placement") ? (utils.debug("Ad has already been tried, skipping"), self.chainAds(curr, data, idx + 1)) : item.fetch({
        sourceThreadUrl : self.get("sourceThreadUrl")
      }).then(function() {
        var result = curr.tryAd(item);
        return result.always(function() {
          if (item.id) {
            /** @type {boolean} */
            self.triedAds[item.id] = true;
          }
        }), result;
      }).otherwise(function(value) {
        return $injector.reportError(value, item), self.chainAds(curr, data, idx + 1);
      });
    }
  }, {
    loggedinOverrides : {
      topPlacementEnabled : false,
      promotedSide : "right"
    }
  }), proto.init = function(config, controller, base, options) {
    var result = config.forum.get("settings");
    var serverAttrs = $injector.generateVariantConfig(result, controller, base);
    if (serverAttrs) {
      var target = _.extend({}, serverAttrs, {
        sourceThread : config.toJSON(),
        sourceForum : config.forum.toJSON(),
        sourceThreadUrl : config.currentUrl || document.referrer,
        discoverySettingsUrl : result.discoverySettingsUrl,
        adsDRNativeEnabled : result.adsDRNativeEnabled,
        adsVideoEnabled : result.adsVideoEnabled,
        organicEnabled : result.organicDiscoveryEnabled,
        topPlacementEnabled : serverAttrs.topPlacementEnabled && !options.hasHighlightedPost,
        hasHighlightedPost : options.hasHighlightedPost,
        pageUrl : options.pageUrl,
        pageReferrer : options.pageReferrer,
        colorScheme : options.colorScheme,
        typeface : options.typeface
      });
      if (base.preview) {
        /** @type {Element} */
        var location = document.createElement("a");
        location.href = target.sourceThreadUrl;
        target.previewQueryParam = location.search;
        /** @type {boolean} */
        target.preview = true;
      }
      var source = controller.get("discoveryRequestBin");
      if (source) {
        target.requestBinOverride = source;
      }
      if (controller.get("gutterSwitch")) {
        target.gutterSwitch = controller.get("gutterSwitch");
      }
      var list_promoted_fixtures = res.isFeatureActive("list_promoted_fixtures", {
        domain : vec.getHostName(target.sourceThreadUrl)
      });
      if (base.adsFixture || base.pdFixture) {
        if (list_promoted_fixtures) {
          target.adsFixture = base.adsFixture;
          target.pdFixture = base.pdFixture;
        }
      }
      var d = new proto.DiscoveryApp(target);
      return d.run(), d;
    }
  }, proto;
}), define("adclient.bundle", function() {
});
