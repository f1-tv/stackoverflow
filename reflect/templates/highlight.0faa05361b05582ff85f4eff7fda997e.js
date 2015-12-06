var hljs = new function() {
  /**
   * @param {string} value
   * @return {?}
   */
  function escape(value) {
    return value.replace(/&/gm, "&amp;").replace(/</gm, "&lt;");
  }
  /**
   * @param {?} language
   * @param {?} value
   * @param {boolean} global
   * @return {?}
   */
  function langRe(language, value, global) {
    return RegExp(value, "m" + (language.case_insensitive ? "i" : "") + (global ? "g" : ""));
  }
  /**
   * @param {Node} pre
   * @return {?}
   */
  function findCode(pre) {
    /** @type {number} */
    var i = 0;
    for (;i < pre.childNodes.length;i++) {
      var node = pre.childNodes[i];
      if ("CODE" == node.nodeName) {
        return node;
      }
      if (3 != node.nodeType || !node.nodeValue.match(/\s+/)) {
        break;
      }
    }
  }
  /**
   * @param {Node} block
   * @param {?} ignoreNewLines
   * @return {?}
   */
  function blockText(block, ignoreNewLines) {
    /** @type {string} */
    var d = "";
    /** @type {number} */
    var i = 0;
    for (;i < block.childNodes.length;i++) {
      if (3 == block.childNodes[i].nodeType) {
        var chunk = block.childNodes[i].nodeValue;
        if (ignoreNewLines) {
          chunk = chunk.replace(/\n/g, "");
        }
        d += chunk;
      } else {
        d += "BR" == block.childNodes[i].nodeName ? "\n" : blockText(block.childNodes[i]);
      }
    }
    return round && (d = d.replace(/\r/g, "\n")), d;
  }
  /**
   * @param {Node} block
   * @return {?}
   */
  function blockLanguage(block) {
    var codeSegments = block.className.split(/\s+/);
    codeSegments = codeSegments.concat(block.parentNode.className.split(/\s+/));
    /** @type {number} */
    var i = 0;
    for (;i < codeSegments.length;i++) {
      var class_ = codeSegments[i].replace(/^language-/, "");
      if (languages[class_] || "no-highlight" == class_) {
        return class_;
      }
    }
  }
  /**
   * @param {Node} node
   * @return {?}
   */
  function nodeStream(node) {
    /** @type {Array} */
    var result = [];
    return function _nodeStream(node, offset) {
      /** @type {number} */
      var i = 0;
      for (;i < node.childNodes.length;i++) {
        if (3 == node.childNodes[i].nodeType) {
          offset += node.childNodes[i].nodeValue.length;
        } else {
          if ("BR" == node.childNodes[i].nodeName) {
            offset += 1;
          } else {
            if (1 == node.childNodes[i].nodeType) {
              result.push({
                event : "start",
                offset : offset,
                node : node.childNodes[i]
              });
              offset = _nodeStream(node.childNodes[i], offset);
              result.push({
                event : "stop",
                offset : offset,
                node : node.childNodes[i]
              });
            }
          }
        }
      }
      return offset;
    }(node, 0), result;
  }
  /**
   * @param {string} stream1
   * @param {string} stream2
   * @param {string} value
   * @return {?}
   */
  function mergeStreams(stream1, stream2, value) {
    /**
     * @return {?}
     */
    function selectStream() {
      return stream1.length && stream2.length ? stream1[0].offset != stream2[0].offset ? stream1[0].offset < stream2[0].offset ? stream1 : stream2 : "start" == stream2[0].event ? stream1 : stream2 : stream1.length ? stream1 : stream2;
    }
    /**
     * @param {Node} target
     * @return {?}
     */
    function open(target) {
      var c = "<" + target.nodeName.toLowerCase();
      /** @type {number} */
      var i = 0;
      for (;i < target.attributes.length;i++) {
        var attribute = target.attributes[i];
        c += " " + attribute.nodeName.toLowerCase();
        if (void 0 !== attribute.value) {
          if (attribute.value !== false) {
            if (null !== attribute.value) {
              c += '="' + escape(attribute.value) + '"';
            }
          }
        }
      }
      return c + ">";
    }
    /** @type {number} */
    var processed = 0;
    /** @type {string} */
    var result = "";
    /** @type {Array} */
    var nodeStack = [];
    for (;stream1.length || stream2.length;) {
      var current = selectStream().splice(0, 1)[0];
      if (result += escape(value.substr(processed, current.offset - processed)), processed = current.offset, "start" == current.event) {
        result += open(current.node);
        nodeStack.push(current.node);
      } else {
        if ("stop" == current.event) {
          var node;
          /** @type {number} */
          var i = nodeStack.length;
          do {
            i--;
            node = nodeStack[i];
            result += "</" + node.nodeName.toLowerCase() + ">";
          } while (node != current.node);
          nodeStack.splice(i, 1);
          for (;i < nodeStack.length;) {
            result += open(nodeStack[i]);
            i++;
          }
        }
      }
    }
    return result + escape(value.substr(processed));
  }
  /**
   * @param {string} i
   * @return {undefined}
   */
  function has(i) {
    /**
     * @param {Object} mode
     * @param {?} language
     * @param {boolean} recurring
     * @return {undefined}
     */
    function compileMode(mode, language, recurring) {
      /**
       * @param {string} className
       * @param {string} input
       * @return {undefined}
       */
      function flatten(className, input) {
        var codeSegments = input.split(" ");
        /** @type {number} */
        var i = 0;
        for (;i < codeSegments.length;i++) {
          var pair = codeSegments[i].split("|");
          /** @type {Array} */
          compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          keywords.push(pair[0]);
        }
      }
      if (!mode.compiled) {
        /** @type {Array} */
        var keywords = [];
        if (mode.keywords) {
          var compiled_keywords = {};
          if (mode.lexemsRe = langRe(language, mode.lexems || hljs.IDENT_RE, true), "string" == typeof mode.keywords) {
            flatten("keyword", mode.keywords);
          } else {
            var className;
            for (className in mode.keywords) {
              if (mode.keywords.hasOwnProperty(className)) {
                flatten(className, mode.keywords[className]);
              }
            }
          }
          mode.keywords = compiled_keywords;
        }
        if (!recurring) {
          if (mode.beginWithKeyword) {
            /** @type {string} */
            mode.begin = "\\b(" + keywords.join("|") + ")\\s";
          }
          mode.beginRe = langRe(language, mode.begin ? mode.begin : "\\B|\\b");
          if (!mode.end) {
            if (!mode.endsWithParent) {
              /** @type {string} */
              mode.end = "\\B|\\b";
            }
          }
          if (mode.end) {
            mode.endRe = langRe(language, mode.end);
          }
        }
        if (mode.illegal) {
          mode.illegalRe = langRe(language, mode.illegal);
        }
        if (void 0 === mode.relevance) {
          /** @type {number} */
          mode.relevance = 1;
        }
        if (!mode.contains) {
          /** @type {Array} */
          mode.contains = [];
        }
        /** @type {boolean} */
        mode.compiled = true;
        /** @type {number} */
        var i = 0;
        for (;i < mode.contains.length;i++) {
          if ("self" == mode.contains[i]) {
            /** @type {Object} */
            mode.contains[i] = mode;
          }
          compileMode(mode.contains[i], language, false);
        }
        if (mode.starts) {
          compileMode(mode.starts, language, false);
        }
      }
    }
    compileMode(languages[i].defaultMode, languages[i], true);
  }
  /**
   * @param {string} name
   * @param {string} value
   * @return {?}
   */
  function highlight(name, value) {
    /**
     * @param {string} lexem
     * @param {Object} mode
     * @return {?}
     */
    function subMode(lexem, mode) {
      /** @type {number} */
      var i = 0;
      for (;i < mode.contains.length;i++) {
        var match = mode.contains[i].beginRe.exec(lexem);
        if (match && 0 == match.index) {
          return mode.contains[i];
        }
      }
    }
    /**
     * @param {number} mode_index
     * @param {string} lexem
     * @return {?}
     */
    function endOfMode(mode_index, lexem) {
      if (modes[mode_index].end && modes[mode_index].endRe.test(lexem)) {
        return 1;
      }
      if (modes[mode_index].endsWithParent) {
        var level = endOfMode(mode_index - 1, lexem);
        return level ? level + 1 : 0;
      }
      return 0;
    }
    /**
     * @param {string} lexem
     * @param {?} mode
     * @return {?}
     */
    function isIllegal(lexem, mode) {
      return mode.illegal && mode.illegalRe.test(lexem);
    }
    /**
     * @param {Object} mode
     * @param {?} language
     * @return {?}
     */
    function compileTerminators(mode, language) {
      /** @type {Array} */
      var terminators = [];
      /** @type {number} */
      var i = 0;
      for (;i < mode.contains.length;i++) {
        terminators.push(mode.contains[i].begin);
      }
      /** @type {number} */
      var index = modes.length - 1;
      do {
        if (modes[index].end) {
          terminators.push(modes[index].end);
        }
        index--;
      } while (modes[index + 1].endsWithParent);
      return mode.illegal && terminators.push(mode.illegal), terminators.length ? langRe(language, terminators.join("|"), true) : null;
    }
    /**
     * @param {string} value
     * @param {number} index
     * @return {?}
     */
    function eatModeChunk(value, index) {
      var mode = modes[modes.length - 1];
      if (void 0 === mode.terminators) {
        mode.terminators = compileTerminators(mode, language);
      }
      var pos;
      return mode.terminators && (mode.terminators.lastIndex = index, pos = mode.terminators.exec(value)), pos ? [value.substr(index, pos.index - index), pos[0], false] : [value.substr(index), "", true];
    }
    /**
     * @param {Object} mode
     * @param {Array} match
     * @return {?}
     */
    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      var value = mode.keywords[match_str];
      return value && value instanceof Array ? value : false;
    }
    /**
     * @param {string} buffer
     * @param {Object} mode
     * @return {?}
     */
    function processKeywords(buffer, mode) {
      if (buffer = escape(buffer), !mode.keywords) {
        return buffer;
      }
      /** @type {string} */
      var result = "";
      /** @type {number} */
      var last_index = 0;
      /** @type {number} */
      mode.lexemsRe.lastIndex = 0;
      var match = mode.lexemsRe.exec(buffer);
      for (;match;) {
        result += buffer.substr(last_index, match.index - last_index);
        var keyword_match = keywordMatch(mode, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="' + keyword_match[0] + '">' + match[0] + "</span>";
        } else {
          result += match[0];
        }
        /** @type {number} */
        last_index = mode.lexemsRe.lastIndex;
        match = mode.lexemsRe.exec(buffer);
      }
      return result + buffer.substr(last_index);
    }
    /**
     * @param {string} text
     * @param {Object} mode
     * @return {?}
     */
    function processSubLanguage(text, mode) {
      var result;
      return result = "" == mode.subLanguage ? highlightAuto(text) : highlight(mode.subLanguage, text), mode.relevance > 0 && (keyword_count += result.keyword_count, relevance += result.relevance), '<span class="' + result.language + '">' + result.value + "</span>";
    }
    /**
     * @param {string} buffer
     * @param {Object} mode
     * @return {?}
     */
    function processBuffer(buffer, mode) {
      return mode.subLanguage && languages[mode.subLanguage] || "" == mode.subLanguage ? processSubLanguage(buffer, mode) : processKeywords(buffer, mode);
    }
    /**
     * @param {Object} mode
     * @param {string} lexem
     * @return {undefined}
     */
    function startNewMode(mode, lexem) {
      /** @type {string} */
      var markup = mode.className ? '<span class="' + mode.className + '">' : "";
      if (mode.returnBegin) {
        result += markup;
        /** @type {string} */
        mode.buffer = "";
      } else {
        if (mode.excludeBegin) {
          result += escape(lexem) + markup;
          /** @type {string} */
          mode.buffer = "";
        } else {
          result += markup;
          /** @type {string} */
          mode.buffer = lexem;
        }
      }
      modes.push(mode);
      relevance += mode.relevance;
    }
    /**
     * @param {?} buffer
     * @param {string} lexem
     * @param {?} dataAndEvents
     * @return {?}
     */
    function processLexem(buffer, lexem, dataAndEvents) {
      var current_mode = modes[modes.length - 1];
      if (dataAndEvents) {
        return result += processBuffer(current_mode.buffer + buffer, current_mode), false;
      }
      var new_mode = subMode(lexem, current_mode);
      if (new_mode) {
        return result += processBuffer(current_mode.buffer + buffer, current_mode), startNewMode(new_mode, lexem), new_mode.returnBegin;
      }
      var end_level = endOfMode(modes.length - 1, lexem);
      if (end_level) {
        /** @type {string} */
        var markup = current_mode.className ? "</span>" : "";
        result += current_mode.returnEnd ? processBuffer(current_mode.buffer + buffer, current_mode) + markup : current_mode.excludeEnd ? processBuffer(current_mode.buffer + buffer, current_mode) + markup + escape(lexem) : processBuffer(current_mode.buffer + buffer + lexem, current_mode) + markup;
        for (;end_level > 1;) {
          /** @type {string} */
          markup = modes[modes.length - 2].className ? "</span>" : "";
          result += markup;
          end_level--;
          modes.length--;
        }
        var last_ended_mode = modes[modes.length - 1];
        return modes.length--, modes[modes.length - 1].buffer = "", last_ended_mode.starts && startNewMode(last_ended_mode.starts, ""), current_mode.returnEnd;
      }
      if (isIllegal(lexem, current_mode)) {
        throw "Illegal";
      }
    }
    if (!old[name]) {
      has(name);
      /** @type {boolean} */
      old[name] = true;
    }
    var language = languages[name];
    /** @type {Array} */
    var modes = [language.defaultMode];
    /** @type {number} */
    var relevance = 0;
    /** @type {number} */
    var keyword_count = 0;
    /** @type {string} */
    var result = "";
    try {
      var match;
      /** @type {number} */
      var index = 0;
      /** @type {string} */
      language.defaultMode.buffer = "";
      do {
        match = eatModeChunk(value, index);
        var B = processLexem(match[0], match[1], match[2]);
        index += match[0].length;
        if (!B) {
          index += match[1].length;
        }
      } while (!match[2]);
      return{
        relevance : relevance,
        keyword_count : keyword_count,
        value : result,
        language : name
      };
    } catch (Illegal) {
      if ("Illegal" == Illegal) {
        return{
          relevance : 0,
          keyword_count : 0,
          value : escape(value)
        };
      }
      throw Illegal;
    }
  }
  /**
   * @param {string} text
   * @return {?}
   */
  function highlightAuto(text) {
    var result = {
      keyword_count : 0,
      relevance : 0,
      value : escape(text)
    };
    var second_best = result;
    var key;
    for (key in languages) {
      if (languages.hasOwnProperty(key)) {
        var current = highlight(key, text);
        /** @type {string} */
        current.language = key;
        if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
          second_best = current;
        }
        if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
          second_best = result;
          result = current;
        }
      }
    }
    return second_best.language && (result.second_best = second_best), result;
  }
  /**
   * @param {string} value
   * @param {?} tabReplace
   * @param {?} useBR
   * @return {?}
   */
  function fixMarkup(value, tabReplace, useBR) {
    return tabReplace && (value = value.replace(/^((<[^>]+>|\t)+)/gm, function(dataAndEvents, p1) {
      return p1.replace(/\t/g, tabReplace);
    })), useBR && (value = value.replace(/\n/g, "<br>")), value;
  }
  /**
   * @param {Node} block
   * @param {?} tabReplace
   * @param {?} useBR
   * @return {undefined}
   */
  function highlightBlock(block, tabReplace, useBR) {
    var result;
    var pre;
    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if ("no-highlight" != language) {
      if (language) {
        result = highlight(language, text);
      } else {
        result = highlightAuto(text);
        language = result.language;
      }
      var original = nodeStream(block);
      if (original.length) {
        /** @type {Element} */
        pre = document.createElement("pre");
        pre.innerHTML = result.value;
        result.value = mergeStreams(original, nodeStream(pre), text);
      }
      result.value = fixMarkup(result.value, tabReplace, useBR);
      var class_name = block.className;
      if (class_name.match("(\\s|^)(language-)?" + language + "(\\s|$)") || (class_name = class_name ? class_name + " " + language : language), round && ("CODE" == block.tagName && "PRE" == block.parentNode.tagName)) {
        pre = block.parentNode;
        /** @type {Element} */
        var container = document.createElement("div");
        /** @type {string} */
        container.innerHTML = "<pre><code>" + result.value + "</code></pre>";
        /** @type {(Node|null)} */
        block = container.firstChild.firstChild;
        container.firstChild.className = pre.className;
        pre.parentNode.replaceChild(container.firstChild, pre);
      } else {
        block.innerHTML = result.value;
      }
      block.className = class_name;
      block.result = {
        language : language,
        kw : result.keyword_count,
        re : result.relevance
      };
      if (result.second_best) {
        block.second_best = {
          language : result.second_best.language,
          kw : result.second_best.keyword_count,
          re : result.second_best.relevance
        };
      }
    }
  }
  /**
   * @return {undefined}
   */
  function initHighlighting() {
    if (!initHighlighting.called) {
      /** @type {boolean} */
      initHighlighting.called = true;
      /** @type {NodeList} */
      var codeSegments = document.getElementsByTagName("pre");
      /** @type {number} */
      var i = 0;
      for (;i < codeSegments.length;i++) {
        var code = findCode(codeSegments[i]);
        if (code) {
          highlightBlock(code, hljs.tabReplace);
        }
      }
    }
  }
  /**
   * @return {undefined}
   */
  function initHighlightingOnLoad() {
    if (window.addEventListener) {
      window.addEventListener("DOMContentLoaded", initHighlighting, false);
      window.addEventListener("load", initHighlighting, false);
    } else {
      if (window.attachEvent) {
        window.attachEvent("onload", initHighlighting);
      } else {
        /** @type {function (): undefined} */
        window.onload = initHighlighting;
      }
    }
  }
  /** @type {boolean} */
  var round = "undefined" != typeof navigator && /MSIE [678]/.test(navigator.userAgent);
  var old = {};
  var languages = {};
  this.LANGUAGES = languages;
  /** @type {function (string, string): ?} */
  this.highlight = highlight;
  /** @type {function (string): ?} */
  this.highlightAuto = highlightAuto;
  /** @type {function (string, ?, ?): ?} */
  this.fixMarkup = fixMarkup;
  /** @type {function (Node, ?, ?): undefined} */
  this.highlightBlock = highlightBlock;
  /** @type {function (): undefined} */
  this.initHighlighting = initHighlighting;
  /** @type {function (): undefined} */
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  /** @type {string} */
  this.IDENT_RE = "[a-zA-Z][a-zA-Z0-9_]*";
  /** @type {string} */
  this.UNDERSCORE_IDENT_RE = "[a-zA-Z_][a-zA-Z0-9_]*";
  /** @type {string} */
  this.NUMBER_RE = "\\b\\d+(\\.\\d+)?";
  /** @type {string} */
  this.C_NUMBER_RE = "(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
  /** @type {string} */
  this.BINARY_NUMBER_RE = "\\b(0b[01]+)";
  /** @type {string} */
  this.RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
  this.BACKSLASH_ESCAPE = {
    begin : "\\\\[\\s\\S]",
    relevance : 0
  };
  this.APOS_STRING_MODE = {
    className : "string",
    begin : "'",
    end : "'",
    illegal : "\\n",
    contains : [this.BACKSLASH_ESCAPE],
    relevance : 0
  };
  this.QUOTE_STRING_MODE = {
    className : "string",
    begin : '"',
    end : '"',
    illegal : "\\n",
    contains : [this.BACKSLASH_ESCAPE],
    relevance : 0
  };
  this.C_LINE_COMMENT_MODE = {
    className : "comment",
    begin : "//",
    end : "$"
  };
  this.C_BLOCK_COMMENT_MODE = {
    className : "comment",
    begin : "/\\*",
    end : "\\*/"
  };
  this.HASH_COMMENT_MODE = {
    className : "comment",
    begin : "#",
    end : "$"
  };
  this.NUMBER_MODE = {
    className : "number",
    begin : this.NUMBER_RE,
    relevance : 0
  };
  this.C_NUMBER_MODE = {
    className : "number",
    begin : this.C_NUMBER_RE,
    relevance : 0
  };
  this.BINARY_NUMBER_MODE = {
    className : "number",
    begin : this.BINARY_NUMBER_RE,
    relevance : 0
  };
  /**
   * @param {?} iterable
   * @param {?} opt_attributes
   * @return {?}
   */
  this.inherit = function(iterable, opt_attributes) {
    var object = {};
    var key;
    for (key in iterable) {
      object[key] = iterable[key];
    }
    if (opt_attributes) {
      for (key in opt_attributes) {
        object[key] = opt_attributes[key];
      }
    }
    return object;
  };
};
hljs.LANGUAGES.bash = function(hljs) {
  /** @type {string} */
  var literal = "true false";
  var NUMBER = {
    className : "variable",
    begin : "\\$[a-zA-Z0-9_]+\\b"
  };
  var VAR2 = {
    className : "variable",
    begin : "\\${([^}]|\\\\})+}"
  };
  var STRING = {
    className : "string",
    begin : '"',
    end : '"',
    illegal : "\\n",
    contains : [hljs.BACKSLASH_ESCAPE, NUMBER, VAR2],
    relevance : 0
  };
  var APOS_STRING = {
    className : "string",
    begin : "'",
    end : "'",
    contains : [{
      begin : "''"
    }],
    relevance : 0
  };
  var TEST_CONDITION = {
    className : "test_condition",
    begin : "",
    end : "",
    contains : [STRING, APOS_STRING, NUMBER, VAR2],
    keywords : {
      literal : literal
    },
    relevance : 0
  };
  return{
    defaultMode : {
      keywords : {
        keyword : "if then else fi for break continue while in do done echo exit return set declare",
        literal : literal
      },
      contains : [{
        className : "shebang",
        begin : "(#!\\/bin\\/bash)|(#!\\/bin\\/sh)",
        relevance : 10
      }, NUMBER, VAR2, hljs.HASH_COMMENT_MODE, STRING, APOS_STRING, hljs.inherit(TEST_CONDITION, {
        begin : "\\[ ",
        end : " \\]",
        relevance : 0
      }), hljs.inherit(TEST_CONDITION, {
        begin : "\\[\\[ ",
        end : " \\]\\]"
      })]
    }
  };
}(hljs), hljs.LANGUAGES.cpp = function(hljs) {
  var CPP_KEYWORDS = {
    keyword : "false int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long throw volatile static protected bool template mutable if public friend do return goto auto void enum else break new extern using true class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype noexcept nullptr static_assert thread_local restrict _Bool complex",
    built_in : "std string cin cout cerr clog stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr"
  };
  return{
    defaultMode : {
      keywords : CPP_KEYWORDS,
      illegal : "</",
      contains : [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.QUOTE_STRING_MODE, {
        className : "string",
        begin : "'\\\\?.",
        end : "'",
        illegal : "."
      }, {
        className : "number",
        begin : "\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"
      }, hljs.C_NUMBER_MODE, {
        className : "preprocessor",
        begin : "#",
        end : "$"
      }, {
        className : "stl_container",
        begin : "\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",
        end : ">",
        keywords : CPP_KEYWORDS,
        relevance : 10,
        contains : ["self"]
      }]
    }
  };
}(hljs), hljs.LANGUAGES.cs = function(hljs) {
  return{
    defaultMode : {
      keywords : "abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while ascending descending from get group into join let orderby partial select set value var where yield",
      contains : [{
        className : "comment",
        begin : "///",
        end : "$",
        returnBegin : true,
        contains : [{
          className : "xmlDocTag",
          begin : "///|\x3c!--|--\x3e"
        }, {
          className : "xmlDocTag",
          begin : "</?",
          end : ">"
        }]
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className : "preprocessor",
        begin : "#",
        end : "$",
        keywords : "if else elif endif define undef warning error line region endregion pragma checksum"
      }, {
        className : "string",
        begin : '@"',
        end : '"',
        contains : [{
          begin : '""'
        }]
      }, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE]
    }
  };
}(hljs), hljs.LANGUAGES.css = function(hljs) {
  var FUNCTION = {
    className : "function",
    begin : hljs.IDENT_RE + "\\(",
    end : "\\)",
    contains : [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
  };
  return{
    case_insensitive : true,
    defaultMode : {
      illegal : "[=/|']",
      contains : [hljs.C_BLOCK_COMMENT_MODE, {
        className : "id",
        begin : "\\#[A-Za-z0-9_-]+"
      }, {
        className : "class",
        begin : "\\.[A-Za-z0-9_-]+",
        relevance : 0
      }, {
        className : "attr_selector",
        begin : "\\[",
        end : "\\]",
        illegal : "$"
      }, {
        className : "pseudo",
        begin : ":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"
      }, {
        className : "at_rule",
        begin : "@(font-face|page)",
        lexems : "[a-z-]+",
        keywords : "font-face page"
      }, {
        className : "at_rule",
        begin : "@",
        end : "[{;]",
        excludeEnd : true,
        keywords : "import page media charset",
        contains : [FUNCTION, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE]
      }, {
        className : "tag",
        begin : hljs.IDENT_RE,
        relevance : 0
      }, {
        className : "rules",
        begin : "{",
        end : "}",
        illegal : "[^\\s]",
        relevance : 0,
        contains : [hljs.C_BLOCK_COMMENT_MODE, {
          className : "rule",
          begin : "[^\\s]",
          returnBegin : true,
          end : ";",
          endsWithParent : true,
          contains : [{
            className : "attribute",
            begin : "[A-Z\\_\\.\\-]+",
            end : ":",
            excludeEnd : true,
            illegal : "[^\\s]",
            starts : {
              className : "value",
              endsWithParent : true,
              excludeEnd : true,
              contains : [FUNCTION, hljs.NUMBER_MODE, hljs.QUOTE_STRING_MODE, hljs.APOS_STRING_MODE, hljs.C_BLOCK_COMMENT_MODE, {
                className : "hexcolor",
                begin : "\\#[0-9A-F]+"
              }, {
                className : "important",
                begin : "!important"
              }]
            }
          }]
        }]
      }]
    }
  };
}(hljs), hljs.LANGUAGES.diff = function() {
  return{
    case_insensitive : true,
    defaultMode : {
      contains : [{
        className : "chunk",
        begin : "^\\@\\@ +\\-\\d+,\\d+ +\\+\\d+,\\d+ +\\@\\@$",
        relevance : 10
      }, {
        className : "chunk",
        begin : "^\\*\\*\\* +\\d+,\\d+ +\\*\\*\\*\\*$",
        relevance : 10
      }, {
        className : "chunk",
        begin : "^\\-\\-\\- +\\d+,\\d+ +\\-\\-\\-\\-$",
        relevance : 10
      }, {
        className : "header",
        begin : "Index: ",
        end : "$"
      }, {
        className : "header",
        begin : "=====",
        end : "=====$"
      }, {
        className : "header",
        begin : "^\\-\\-\\-",
        end : "$"
      }, {
        className : "header",
        begin : "^\\*{3} ",
        end : "$"
      }, {
        className : "header",
        begin : "^\\+\\+\\+",
        end : "$"
      }, {
        className : "header",
        begin : "\\*{5}",
        end : "\\*{5}$"
      }, {
        className : "addition",
        begin : "^\\+",
        end : "$"
      }, {
        className : "deletion",
        begin : "^\\-",
        end : "$"
      }, {
        className : "change",
        begin : "^\\!",
        end : "$"
      }]
    }
  };
}(hljs), hljs.LANGUAGES.http = function() {
  return{
    defaultMode : {
      illegal : "\\S",
      contains : [{
        className : "status",
        begin : "^HTTP/[0-9\\.]+",
        end : "$",
        contains : [{
          className : "number",
          begin : "\\b\\d{3}\\b"
        }]
      }, {
        className : "request",
        begin : "^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",
        returnBegin : true,
        end : "$",
        contains : [{
          className : "string",
          begin : " ",
          end : " ",
          excludeBegin : true,
          excludeEnd : true
        }]
      }, {
        className : "attribute",
        begin : "^\\w",
        end : ": ",
        excludeEnd : true,
        illegal : "\\n",
        starts : {
          className : "string",
          end : "$"
        }
      }, {
        begin : "\\n\\n",
        starts : {
          subLanguage : "",
          endsWithParent : true
        }
      }]
    }
  };
}(hljs), hljs.LANGUAGES.ini = function(hljs) {
  return{
    case_insensitive : true,
    defaultMode : {
      illegal : "[^\\s]",
      contains : [{
        className : "comment",
        begin : ";",
        end : "$"
      }, {
        className : "title",
        begin : "^\\[",
        end : "\\]"
      }, {
        className : "setting",
        begin : "^[a-z0-9_\\[\\]]+[ \\t]*=[ \\t]*",
        end : "$",
        contains : [{
          className : "value",
          endsWithParent : true,
          keywords : "on off true false yes no",
          contains : [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE]
        }]
      }]
    }
  };
}(hljs), hljs.LANGUAGES.java = function(hljs) {
  return{
    defaultMode : {
      keywords : "false synchronized int abstract float private char boolean static null if const for true while long throw strictfp finally protected import native final return void enum else break transient new catch instanceof byte super volatile case assert short package default double public try this switch continue throws",
      contains : [{
        className : "javadoc",
        begin : "/\\*\\*",
        end : "\\*/",
        contains : [{
          className : "javadoctag",
          begin : "@[A-Za-z]+"
        }],
        relevance : 10
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, {
        className : "class",
        beginWithKeyword : true,
        end : "{",
        keywords : "class interface",
        illegal : ":",
        contains : [{
          beginWithKeyword : true,
          keywords : "extends implements",
          relevance : 10
        }, {
          className : "title",
          begin : hljs.UNDERSCORE_IDENT_RE
        }]
      }, hljs.C_NUMBER_MODE, {
        className : "annotation",
        begin : "@[A-Za-z]+"
      }]
    }
  };
}(hljs), hljs.LANGUAGES.javascript = function(hljs) {
  return{
    defaultMode : {
      keywords : {
        keyword : "in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield",
        literal : "true false null undefined NaN Infinity"
      },
      contains : [hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.C_NUMBER_MODE, {
        begin : "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords : "return throw case",
        contains : [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
          className : "regexp",
          begin : "/",
          end : "/[gim]*",
          contains : [{
            begin : "\\\\/"
          }]
        }],
        relevance : 0
      }, {
        className : "function",
        beginWithKeyword : true,
        end : "{",
        keywords : "function",
        contains : [{
          className : "title",
          begin : "[A-Za-z$_][0-9A-Za-z$_]*"
        }, {
          className : "params",
          begin : "\\(",
          end : "\\)",
          contains : [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE],
          illegal : "[\"'\\(]"
        }],
        illegal : "\\[|%"
      }]
    }
  };
}(hljs), hljs.LANGUAGES.json = function(hljs) {
  var LITERALS = {
    literal : "true false null"
  };
  /** @type {Array} */
  var TYPES = [hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE];
  var VALUE_CONTAINER = {
    className : "value",
    end : ",",
    endsWithParent : true,
    excludeEnd : true,
    contains : TYPES,
    keywords : LITERALS
  };
  var OBJECT = {
    begin : "{",
    end : "}",
    contains : [{
      className : "attribute",
      begin : '\\s*"',
      end : '"\\s*:\\s*',
      excludeBegin : true,
      excludeEnd : true,
      contains : [hljs.BACKSLASH_ESCAPE],
      illegal : "\\n",
      starts : VALUE_CONTAINER
    }],
    illegal : "\\S"
  };
  var ARRAY = {
    begin : "\\[",
    end : "\\]",
    contains : [hljs.inherit(VALUE_CONTAINER, {
      className : null
    })],
    illegal : "\\S"
  };
  return TYPES.splice(TYPES.length, 0, OBJECT, ARRAY), {
    defaultMode : {
      contains : TYPES,
      keywords : LITERALS,
      illegal : "\\S"
    }
  };
}(hljs), hljs.LANGUAGES.perl = function(hljs) {
  /** @type {string} */
  var SH_KEYWORDS = "getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0";
  var SUBST = {
    className : "subst",
    begin : "[$@]\\{",
    end : "\\}",
    keywords : SH_KEYWORDS,
    relevance : 10
  };
  var VAR1 = {
    className : "variable",
    begin : "\\$\\d"
  };
  var VAR2 = {
    className : "variable",
    begin : "[\\$\\%\\@\\*](\\^\\w\\b|#\\w+(\\:\\:\\w+)*|[^\\s\\w{]|{\\w+}|\\w+(\\:\\:\\w*)*)"
  };
  /** @type {Array} */
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR1, VAR2];
  var METHOD = {
    begin : "->",
    contains : [{
      begin : hljs.IDENT_RE
    }, {
      begin : "{",
      end : "}"
    }]
  };
  var COMMENT = {
    className : "comment",
    begin : "^(__END__|__DATA__)",
    end : "\\n$",
    relevance : 5
  };
  /** @type {Array} */
  var PERL_DEFAULT_CONTAINS = [VAR1, VAR2, hljs.HASH_COMMENT_MODE, COMMENT, {
    className : "comment",
    begin : "^\\=\\w",
    end : "\\=cut",
    endsWithParent : true
  }, METHOD, {
    className : "string",
    begin : "q[qwxr]?\\s*\\(",
    end : "\\)",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "q[qwxr]?\\s*\\[",
    end : "\\]",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "q[qwxr]?\\s*\\{",
    end : "\\}",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "q[qwxr]?\\s*\\|",
    end : "\\|",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "q[qwxr]?\\s*\\<",
    end : "\\>",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "qw\\s+q",
    end : "q",
    contains : STRING_CONTAINS,
    relevance : 5
  }, {
    className : "string",
    begin : "'",
    end : "'",
    contains : [hljs.BACKSLASH_ESCAPE],
    relevance : 0
  }, {
    className : "string",
    begin : '"',
    end : '"',
    contains : STRING_CONTAINS,
    relevance : 0
  }, {
    className : "string",
    begin : "`",
    end : "`",
    contains : [hljs.BACKSLASH_ESCAPE]
  }, {
    className : "string",
    begin : "{\\w+}",
    relevance : 0
  }, {
    className : "string",
    begin : "-?\\w+\\s*\\=\\>",
    relevance : 0
  }, {
    className : "number",
    begin : "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
    relevance : 0
  }, {
    begin : "(" + hljs.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
    keywords : "split return print reverse grep",
    relevance : 0,
    contains : [hljs.HASH_COMMENT_MODE, COMMENT, {
      className : "regexp",
      begin : "(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",
      relevance : 10
    }, {
      className : "regexp",
      begin : "(m|qr)?/",
      end : "/[a-z]*",
      contains : [hljs.BACKSLASH_ESCAPE],
      relevance : 0
    }]
  }, {
    className : "sub",
    beginWithKeyword : true,
    end : "(\\s*\\(.*?\\))?[;{]",
    keywords : "sub",
    relevance : 5
  }, {
    className : "operator",
    begin : "-\\w\\b",
    relevance : 0
  }];
  return SUBST.contains = PERL_DEFAULT_CONTAINS, METHOD.contains[1].contains = PERL_DEFAULT_CONTAINS, {
    defaultMode : {
      keywords : SH_KEYWORDS,
      contains : PERL_DEFAULT_CONTAINS
    }
  };
}(hljs), hljs.LANGUAGES.php = function(hljs) {
  var VARIABLE = {
    className : "variable",
    begin : "\\$+[a-zA-Z_\u007f-\u00c3\u00bf][a-zA-Z0-9_\u007f-\u00c3\u00bf]*"
  };
  /** @type {Array} */
  var caseSensitive = [hljs.inherit(hljs.APOS_STRING_MODE, {
    illegal : null
  }), hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal : null
  }), {
    className : "string",
    begin : 'b"',
    end : '"',
    contains : [hljs.BACKSLASH_ESCAPE]
  }, {
    className : "string",
    begin : "b'",
    end : "'",
    contains : [hljs.BACKSLASH_ESCAPE]
  }];
  /** @type {Array} */
  var VARS = [hljs.C_NUMBER_MODE, hljs.BINARY_NUMBER_MODE];
  var COMMAND1 = {
    className : "title",
    begin : hljs.UNDERSCORE_IDENT_RE
  };
  return{
    case_insensitive : true,
    defaultMode : {
      keywords : "and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return implements parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception php_user_filter default die require __FUNCTION__ enddeclare final try this switch continue endfor endif declare unset true false namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ __halt_compiler",
      contains : [hljs.C_LINE_COMMENT_MODE, hljs.HASH_COMMENT_MODE, {
        className : "comment",
        begin : "/\\*",
        end : "\\*/",
        contains : [{
          className : "phpdoc",
          begin : "\\s@[A-Za-z]+"
        }]
      }, {
        className : "comment",
        excludeBegin : true,
        begin : "__halt_compiler.+?;",
        endsWithParent : true
      }, {
        className : "string",
        begin : "<<<['\"]?\\w+['\"]?$",
        end : "^\\w+;",
        contains : [hljs.BACKSLASH_ESCAPE]
      }, {
        className : "preprocessor",
        begin : "<\\?php",
        relevance : 10
      }, {
        className : "preprocessor",
        begin : "\\?>"
      }, VARIABLE, {
        className : "function",
        beginWithKeyword : true,
        end : "{",
        keywords : "function",
        illegal : "\\$|\\[|%",
        contains : [COMMAND1, {
          className : "params",
          begin : "\\(",
          end : "\\)",
          contains : ["self", VARIABLE, hljs.C_BLOCK_COMMENT_MODE].concat(caseSensitive).concat(VARS)
        }]
      }, {
        className : "class",
        beginWithKeyword : true,
        end : "{",
        keywords : "class",
        illegal : "[:\\(\\$]",
        contains : [{
          beginWithKeyword : true,
          endsWithParent : true,
          keywords : "extends",
          contains : [COMMAND1]
        }, COMMAND1]
      }, {
        begin : "=>"
      }].concat(caseSensitive).concat(VARS)
    }
  };
}(hljs), hljs.LANGUAGES.python = function(hljs) {
  /** @type {Array} */
  var COMMENTS = [{
    className : "string",
    begin : "(u|b)?r?'''",
    end : "'''",
    relevance : 10
  }, {
    className : "string",
    begin : '(u|b)?r?"""',
    end : '"""',
    relevance : 10
  }, {
    className : "string",
    begin : "(u|r|ur)'",
    end : "'",
    contains : [hljs.BACKSLASH_ESCAPE],
    relevance : 10
  }, {
    className : "string",
    begin : '(u|r|ur)"',
    end : '"',
    contains : [hljs.BACKSLASH_ESCAPE],
    relevance : 10
  }, {
    className : "string",
    begin : "(b|br)'",
    end : "'",
    contains : [hljs.BACKSLASH_ESCAPE]
  }, {
    className : "string",
    begin : '(b|br)"',
    end : '"',
    contains : [hljs.BACKSLASH_ESCAPE]
  }].concat([hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]);
  var YARDOCTAG = {
    className : "title",
    begin : hljs.UNDERSCORE_IDENT_RE
  };
  var PARAMS = {
    className : "params",
    begin : "\\(",
    end : "\\)",
    contains : ["self", hljs.C_NUMBER_MODE].concat(COMMENTS)
  };
  var FUNC_CLASS_PROTO = {
    beginWithKeyword : true,
    end : ":",
    illegal : "[${=;\\n]",
    contains : [YARDOCTAG, PARAMS],
    relevance : 10
  };
  return{
    defaultMode : {
      keywords : {
        keyword : "and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10",
        built_in : "None True False Ellipsis NotImplemented"
      },
      illegal : "(</|->|\\?)",
      contains : COMMENTS.concat([hljs.HASH_COMMENT_MODE, hljs.inherit(FUNC_CLASS_PROTO, {
        className : "function",
        keywords : "def"
      }), hljs.inherit(FUNC_CLASS_PROTO, {
        className : "class",
        keywords : "class"
      }), hljs.C_NUMBER_MODE, {
        className : "decorator",
        begin : "@",
        end : "$"
      }, {
        begin : "\\b(print|exec)\\("
      }])
    }
  };
}(hljs), hljs.LANGUAGES.ruby = function(hljs) {
  /** @type {string} */
  var RUBY_IDENT_RE = "[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?";
  /** @type {string} */
  var SIMPLE_NUMBER_RE = "[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";
  var RUBY_KEYWORDS = {
    keyword : "and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or def",
    keymethods : "__id__ __send__ abort abs all? allocate ancestors any? arity assoc at at_exit autoload autoload? between? binding binmode block_given? call callcc caller capitalize capitalize! casecmp catch ceil center chomp chomp! chop chop! chr class class_eval class_variable_defined? class_variables clear clone close close_read close_write closed? coerce collect collect! compact compact! concat const_defined? const_get const_missing const_set constants count crypt default default_proc delete delete! delete_at delete_if detect display div divmod downcase downcase! downto dump dup each each_byte each_index each_key each_line each_pair each_value each_with_index empty? entries eof eof? eql? equal? eval exec exit exit! extend fail fcntl fetch fileno fill find find_all first flatten flatten! floor flush for_fd foreach fork format freeze frozen? fsync getc gets global_variables grep gsub gsub! has_key? has_value? hash hex id include include? included_modules index indexes indices induced_from inject insert inspect instance_eval instance_method instance_methods instance_of? instance_variable_defined? instance_variable_get instance_variable_set instance_variables integer? intern invert ioctl is_a? isatty iterator? join key? keys kind_of? lambda last length lineno ljust load local_variables loop lstrip lstrip! map map! match max member? merge merge! method method_defined? method_missing methods min module_eval modulo name nesting new next next! nil? nitems nonzero? object_id oct open pack partition pid pipe pop popen pos prec prec_f prec_i print printf private_class_method private_instance_methods private_method_defined? private_methods proc protected_instance_methods protected_method_defined? protected_methods public_class_method public_instance_methods public_method_defined? public_methods push putc puts quo raise rand rassoc read read_nonblock readchar readline readlines readpartial rehash reject reject! remainder reopen replace require respond_to? reverse reverse! reverse_each rewind rindex rjust round rstrip rstrip! scan seek select send set_trace_func shift singleton_method_added singleton_methods size sleep slice slice! sort sort! sort_by split sprintf squeeze squeeze! srand stat step store strip strip! sub sub! succ succ! sum superclass swapcase swapcase! sync syscall sysopen sysread sysseek system syswrite taint tainted? tell test throw times to_a to_ary to_f to_hash to_i to_int to_io to_proc to_s to_str to_sym tr tr! tr_s tr_s! trace_var transpose trap truncate tty? type ungetc uniq uniq! unpack unshift untaint untrace_var upcase upcase! update upto value? values values_at warn write write_nonblock zero? zip"
  };
  var YARDOCTAG = {
    className : "yardoctag",
    begin : "@[A-Za-z]+"
  };
  /** @type {Array} */
  var COMMENTS = [{
    className : "comment",
    begin : "#",
    end : "$",
    contains : [YARDOCTAG]
  }, {
    className : "comment",
    begin : "^\\=begin",
    end : "^\\=end",
    contains : [YARDOCTAG],
    relevance : 10
  }, {
    className : "comment",
    begin : "^__END__",
    end : "\\n$"
  }];
  var SUBST = {
    className : "subst",
    begin : "#\\{",
    end : "}",
    lexems : RUBY_IDENT_RE,
    keywords : RUBY_KEYWORDS
  };
  /** @type {Array} */
  var STR_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST];
  /** @type {Array} */
  var STRINGS = [{
    className : "string",
    begin : "'",
    end : "'",
    contains : STR_CONTAINS,
    relevance : 0
  }, {
    className : "string",
    begin : '"',
    end : '"',
    contains : STR_CONTAINS,
    relevance : 0
  }, {
    className : "string",
    begin : "%[qw]?\\(",
    end : "\\)",
    contains : STR_CONTAINS
  }, {
    className : "string",
    begin : "%[qw]?\\[",
    end : "\\]",
    contains : STR_CONTAINS
  }, {
    className : "string",
    begin : "%[qw]?{",
    end : "}",
    contains : STR_CONTAINS
  }, {
    className : "string",
    begin : "%[qw]?<",
    end : ">",
    contains : STR_CONTAINS,
    relevance : 10
  }, {
    className : "string",
    begin : "%[qw]?/",
    end : "/",
    contains : STR_CONTAINS,
    relevance : 10
  }, {
    className : "string",
    begin : "%[qw]?%",
    end : "%",
    contains : STR_CONTAINS,
    relevance : 10
  }, {
    className : "string",
    begin : "%[qw]?-",
    end : "-",
    contains : STR_CONTAINS,
    relevance : 10
  }, {
    className : "string",
    begin : "%[qw]?\\|",
    end : "\\|",
    contains : STR_CONTAINS,
    relevance : 10
  }];
  var FUNCTION = {
    className : "function",
    begin : "\\bdef\\s+",
    end : " |$|;",
    lexems : RUBY_IDENT_RE,
    keywords : RUBY_KEYWORDS,
    contains : [{
      className : "title",
      begin : SIMPLE_NUMBER_RE,
      lexems : RUBY_IDENT_RE,
      keywords : RUBY_KEYWORDS
    }, {
      className : "params",
      begin : "\\(",
      end : "\\)",
      lexems : RUBY_IDENT_RE,
      keywords : RUBY_KEYWORDS
    }].concat(COMMENTS)
  };
  var IDENTIFIER = {
    className : "identifier",
    begin : RUBY_IDENT_RE,
    lexems : RUBY_IDENT_RE,
    keywords : RUBY_KEYWORDS,
    relevance : 0
  };
  /** @type {Array} */
  var RUBY_DEFAULT_CONTAINS = COMMENTS.concat(STRINGS.concat([{
    className : "class",
    beginWithKeyword : true,
    end : "$|;",
    keywords : "class module",
    contains : [{
      className : "title",
      begin : "[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?",
      relevance : 0
    }, {
      className : "inheritance",
      begin : "<\\s*",
      contains : [{
        className : "parent",
        begin : "(" + hljs.IDENT_RE + "::)?" + hljs.IDENT_RE
      }]
    }].concat(COMMENTS)
  }, FUNCTION, {
    className : "constant",
    begin : "(::)?([A-Z]\\w*(::)?)+",
    relevance : 0
  }, {
    className : "symbol",
    begin : ":",
    contains : STRINGS.concat([IDENTIFIER]),
    relevance : 0
  }, {
    className : "number",
    begin : "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
    relevance : 0
  }, {
    className : "number",
    begin : "\\?\\w"
  }, {
    className : "variable",
    begin : "(\\$\\W)|((\\$|\\@\\@?)(\\w+))"
  }, IDENTIFIER, {
    begin : "(" + hljs.RE_STARTERS_RE + ")\\s*",
    contains : COMMENTS.concat([{
      className : "regexp",
      begin : "/",
      end : "/[a-z]*",
      illegal : "\\n",
      contains : [hljs.BACKSLASH_ESCAPE]
    }]),
    relevance : 0
  }]));
  return SUBST.contains = RUBY_DEFAULT_CONTAINS, FUNCTION.contains[1].contains = RUBY_DEFAULT_CONTAINS, {
    defaultMode : {
      lexems : RUBY_IDENT_RE,
      keywords : RUBY_KEYWORDS,
      contains : RUBY_DEFAULT_CONTAINS
    }
  };
}(hljs), hljs.LANGUAGES.sql = function(hljs) {
  return{
    case_insensitive : true,
    defaultMode : {
      illegal : "[^\\s]",
      contains : [{
        className : "operator",
        begin : "(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant)\\b",
        end : ";",
        endsWithParent : true,
        keywords : {
          keyword : "all partial global month current_timestamp using go revoke smallint indicator end-exec disconnect zone with character assertion to add current_user usage input local alter match collate real then rollback get read timestamp session_user not integer bit unique day minute desc insert execute like ilike|2 level decimal drop continue isolation found where constraints domain right national some module transaction relative second connect escape close system_user for deferred section cast current sqlstate allocate intersect deallocate numeric public preserve full goto initially asc no key output collation group by union session both last language constraint column of space foreign deferrable prior connection unknown action commit view or first into float year primary cascaded except restrict set references names table outer open select size are rows from prepare distinct leading create only next inner authorization schema corresponding option declare precision immediate else timezone_minute external varying translation true case exception join hour default double scroll value cursor descriptor values dec fetch procedure delete and false int is describe char as at in varchar null trailing any absolute current_time end grant privileges when cross check write current_date pad begin temporary exec time update catalog user sql date on identity timezone_hour natural whenever interval work order cascade diagnostics nchar having left call do handler load replace truncate start lock show pragma",
          aggregate : "count sum min max avg"
        },
        contains : [{
          className : "string",
          begin : "'",
          end : "'",
          contains : [hljs.BACKSLASH_ESCAPE, {
            begin : "''"
          }],
          relevance : 0
        }, {
          className : "string",
          begin : '"',
          end : '"',
          contains : [hljs.BACKSLASH_ESCAPE, {
            begin : '""'
          }],
          relevance : 0
        }, {
          className : "string",
          begin : "`",
          end : "`",
          contains : [hljs.BACKSLASH_ESCAPE]
        }, hljs.C_NUMBER_MODE]
      }, hljs.C_BLOCK_COMMENT_MODE, {
        className : "comment",
        begin : "--",
        end : "$"
      }]
    }
  };
}(hljs), hljs.LANGUAGES.xml = function() {
  /** @type {string} */
  var SIMPLE_NUMBER_RE = "[A-Za-z0-9\\._:-]+";
  var TAG_INTERNALS = {
    endsWithParent : true,
    contains : [{
      className : "attribute",
      begin : SIMPLE_NUMBER_RE,
      relevance : 0
    }, {
      begin : '="',
      returnBegin : true,
      end : '"',
      contains : [{
        className : "value",
        begin : '"',
        endsWithParent : true
      }]
    }, {
      begin : "='",
      returnBegin : true,
      end : "'",
      contains : [{
        className : "value",
        begin : "'",
        endsWithParent : true
      }]
    }, {
      begin : "=",
      contains : [{
        className : "value",
        begin : "[^\\s/>]+"
      }]
    }]
  };
  return{
    case_insensitive : true,
    defaultMode : {
      contains : [{
        className : "pi",
        begin : "<\\?",
        end : "\\?>",
        relevance : 10
      }, {
        className : "doctype",
        begin : "<!DOCTYPE",
        end : ">",
        relevance : 10,
        contains : [{
          begin : "\\[",
          end : "\\]"
        }]
      }, {
        className : "comment",
        begin : "\x3c!--",
        end : "--\x3e",
        relevance : 10
      }, {
        className : "cdata",
        begin : "<\\!\\[CDATA\\[",
        end : "\\]\\]>",
        relevance : 10
      }, {
        className : "tag",
        begin : "<style(?=\\s|>|$)",
        end : ">",
        keywords : {
          title : "style"
        },
        contains : [TAG_INTERNALS],
        starts : {
          end : "</style>",
          returnEnd : true,
          subLanguage : "css"
        }
      }, {
        className : "tag",
        begin : "<script(?=\\s|>|$)",
        end : ">",
        keywords : {
          title : "script"
        },
        contains : [TAG_INTERNALS],
        starts : {
          end : "\x3c/script>",
          returnEnd : true,
          subLanguage : "javascript"
        }
      }, {
        begin : "<%",
        end : "%>",
        subLanguage : "vbscript"
      }, {
        className : "tag",
        begin : "</?",
        end : "/?>",
        contains : [{
          className : "title",
          begin : "[^ />]+"
        }, TAG_INTERNALS]
      }]
    }
  };
}(hljs);
