var REFLECTWIDGETS;
var reflect_domain;
var reflect_shortname;
if (typeof REFLECTWIDGETS == "undefined") {
  REFLECTWIDGETS = function() {
    var item = {};
    var svg = document.getElementsByTagName("HEAD")[0] || document.body;
    var rules = {};
    var options = {
      identifier : 1,
      url : 2
    };
    /** @type {string} */
    item.domain = "ryflection.com";
    /** @type {string} */
    item.forum = "";
    /**
     * @param {Object} s
     * @return {undefined}
     */
    item.getCount = function(s) {
      var hash;
      /** @type {function (string): string} */
      hash = encodeURIComponent;
      /** @type {string} */
      var host = document.location.protocol + "//" + item.forum + "." + item.domain + "/count-data.js?";
      /** @type {Array} */
      var models = [];
      /** @type {number} */
      var indexOf = 0;
      /** @type {number} */
      var characters = 10;
      /** @type {string} */
      var port = "";
      s = s || {};
      if (s.reset) {
        rules = {};
        /** @type {string} */
        port = "&_=" + +new Date;
      }
      /** @type {Array} */
      s = [document.getElementsByTagName("A"), document.getElementsByClassName && document.getElementsByClassName("reflect-comment-count") || []];
      var b;
      var node;
      var key;
      var identifier;
      /** @type {number} */
      var i = 0;
      for (;i < s.length;i++) {
        b = s[i];
        /** @type {number} */
        var j = 0;
        for (;j < b.length;j++) {
          node = b[j];
          key = node.getAttribute("data-reflect-identifier");
          identifier = node.hash === "#reflect_thread" && node.href.replace("#reflect_thread", "") || node.getAttribute("data-reflect-url");
          if (key) {
            /** @type {number} */
            identifier = options.identifier;
          } else {
            if (identifier) {
              key = identifier;
              /** @type {number} */
              identifier = options.url;
            } else {
              continue;
            }
          }
          var rule;
          if (rules.hasOwnProperty(key)) {
            rule = rules[key];
          } else {
            rule = rules[key] = {
              elements : [],
              type : identifier
            };
            models.push(hash(identifier) + "=" + hash(key));
          }
          rule.elements.push(node);
        }
      }
      models.sort();
      /** @type {Array.<?>} */
      hash = models.slice(indexOf, characters);
      for (;hash.length;) {
        /** @type {Element} */
        s = document.createElement("script");
        /** @type {boolean} */
        s.async = true;
        /** @type {string} */
        s.src = host + hash.join("&") + port;
        svg.appendChild(s);
        indexOf += 10;
        characters += 10;
        /** @type {Array.<?>} */
        hash = models.slice(indexOf, characters);
      }
    };
    /**
     * @param {Object} scope
     * @return {undefined}
     */
    item.displayCount = function(scope) {
      var item;
      var els;
      var index;
      var args = scope.counts;
      scope = scope.text.comments;
      for (;item = args.shift();) {
        if (els == rules[item.id]) {
          switch(item.comments) {
            case 0:
              index = scope.zero;
              break;
            case 1:
              index = scope.one;
              break;
            default:
              index = scope.multiple;
          }
          item = index.replace("{num}", item.comments);
          els = els.elements;
          /** @type {number} */
          index = els.length - 1;
          for (;index >= 0;index--) {
            els[index].innerHTML = item;
          }
        }
      }
    };
    return item;
  }();
}
(function() {
  if (typeof reflect_domain != "undefined") {
    REFLECTWIDGETS.domain = reflect_domain;
  }
  REFLECTWIDGETS.forum = reflect_shortname;
  REFLECTWIDGETS.getCount();
})();
