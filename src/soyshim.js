define([], function() {
    var soyshim = { $$DEFAULT_TEMPLATE_DATA_: {} };


    /**
     * Helper function to render a Soy template into a single node or a document
     * fragment. If the rendered HTML string represents a single node, then that
     * node is returned. Otherwise a document fragment is created and returned
     * (wrapped in a DIV element if #opt_singleNode is true).
     *
     * @param {Function} template The Soy template defining the element's content.
     * @param {Object=} opt_templateData The data for the template.
     * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
     *     nodes will be created.
     * @param {boolean=} opt_asElement Whether to wrap the fragment in an
     *     element if the template does not render a single element. If true,
     *     result is always an Element.
     * @param {Object=} opt_injectedData The injected data for the template.
     * @return {!Node} The resulting node or document fragment.
     * @private
     */
    soyshim.$$renderWithWrapper_ = function(
        template, opt_templateData, opt_dom, opt_asElement, opt_injectedData) {

      var dom = opt_dom || document;
      var wrapper = dom.createElement('div');
      wrapper.innerHTML = template(
        opt_templateData || soyshim.$$DEFAULT_TEMPLATE_DATA_, undefined,
        opt_injectedData);

      // If the template renders as a single element, return it.
      if (wrapper.childNodes.length == 1) {
        var firstChild = wrapper.firstChild;
        if (!opt_asElement || firstChild.nodeType == 1 /* Element */) {
          return /** @type {!Node} */ (firstChild);
        }
      }

      // If we're forcing it to be a single element, return the wrapper DIV.
      if (opt_asElement) {
        return wrapper;
      }

      // Otherwise, create and return a fragment.
      var fragment = dom.createDocumentFragment();
      while (wrapper.firstChild) {
        fragment.appendChild(wrapper.firstChild);
      }
      return fragment;
    };


    /**
     * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
     * directionality or the exit directionality of text are opposite to
     * bidiGlobalDir. Otherwise returns the empty string.
     * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
     * in text, making the logic suitable for HTML and HTML-escaped text.
     * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
     *     if rtl, 0 if unknown.
     * @param {number} dir text's directionality: 1 if ltr, -1 if rtl, 0 if unknown.
     * @param {string} text The text whose directionality is to be estimated.
     * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
     *     Default: false.
     * @return {string} A Unicode bidi mark matching bidiGlobalDir, or
     *     the empty string when text's overall and exit directionalities both match
     *     bidiGlobalDir, or bidiGlobalDir is 0 (unknown).
     * @private
     */
    soyshim.$$bidiMarkAfterKnownDir_ = function(
        bidiGlobalDir, dir, text, opt_isHtml) {
      return (
          bidiGlobalDir > 0 && (dir < 0 ||
              soyshim.$$bidiIsRtlExitText_(text, opt_isHtml)) ? '\u200E' : // LRM
          bidiGlobalDir < 0 && (dir > 0 ||
              soyshim.$$bidiIsLtrExitText_(text, opt_isHtml)) ? '\u200F' : // RLM
          '');
    };


    /**
     * Strips str of any HTML mark-up and escapes. Imprecise in several ways, but
     * precision is not very important, since the result is only meant to be used
     * for directionality detection.
     * @param {string} str The string to be stripped.
     * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
     *     Default: false.
     * @return {string} The stripped string.
     * @private
     */
    soyshim.$$bidiStripHtmlIfNecessary_ = function(str, opt_isHtml) {
      return opt_isHtml ? str.replace(soyshim.$$BIDI_HTML_SKIP_RE_, ' ') : str;
    };


    /**
     * Simplified regular expression for am HTML tag (opening or closing) or an HTML
     * escape - the things we want to skip over in order to ignore their ltr
     * characters.
     * @type {RegExp}
     * @private
     */
    soyshim.$$BIDI_HTML_SKIP_RE_ = /<[^>]*>|&[^;]+;/g;


    /**
     * A practical pattern to identify strong LTR character. This pattern is not
     * theoretically correct according to unicode standard. It is simplified for
     * performance and small code size.
     * @type {string}
     * @private
     */
    soyshim.$$bidiLtrChars_ =
        'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
        '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';


    /**
     * A practical pattern to identify strong neutral and weak character. This
     * pattern is not theoretically correct according to unicode standard. It is
     * simplified for performance and small code size.
     * @type {string}
     * @private
     */
    soyshim.$$bidiNeutralChars_ =
        '\u0000-\u0020!-@[-`{-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF';


    /**
     * A practical pattern to identify strong RTL character. This pattern is not
     * theoretically correct according to unicode standard. It is simplified for
     * performance and small code size.
     * @type {string}
     * @private
     */
    soyshim.$$bidiRtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';


    /**
     * Regular expressions to check if a piece of text is of RTL directionality
     * on first character with strong directionality.
     * @type {RegExp}
     * @private
     */
    soyshim.$$bidiRtlDirCheckRe_ = new RegExp(
        '^[^' + soyshim.$$bidiLtrChars_ + ']*[' + soyshim.$$bidiRtlChars_ + ']');


    /**
     * Regular expressions to check if a piece of text is of neutral directionality.
     * Url are considered as neutral.
     * @type {RegExp}
     * @private
     */
    soyshim.$$bidiNeutralDirCheckRe_ = new RegExp(
        '^[' + soyshim.$$bidiNeutralChars_ + ']*$|^http://');


    /**
     * Check the directionality of the a piece of text based on the first character
     * with strong directionality.
     * @param {string} str string being checked.
     * @return {boolean} return true if rtl directionality is being detected.
     * @private
     */
    soyshim.$$bidiIsRtlText_ = function(str) {
      return soyshim.$$bidiRtlDirCheckRe_.test(str);
    };


    /**
     * Check the directionality of the a piece of text based on the first character
     * with strong directionality.
     * @param {string} str string being checked.
     * @return {boolean} true if all characters have neutral directionality.
     * @private
     */
    soyshim.$$bidiIsNeutralText_ = function(str) {
      return soyshim.$$bidiNeutralDirCheckRe_.test(str);
    };


    /**
     * This constant controls threshold of rtl directionality.
     * @type {number}
     * @private
     */
    soyshim.$$bidiRtlDetectionThreshold_ = 0.40;


    /**
     * Returns the RTL ratio based on word count.
     * @param {string} str the string that need to be checked.
     * @return {number} the ratio of RTL words among all words with directionality.
     * @private
     */
    soyshim.$$bidiRtlWordRatio_ = function(str) {
      var rtlCount = 0;
      var totalCount = 0;
      var tokens = str.split(' ');
      for (var i = 0; i < tokens.length; i++) {
        if (soyshim.$$bidiIsRtlText_(tokens[i])) {
          rtlCount++;
          totalCount++;
        } else if (!soyshim.$$bidiIsNeutralText_(tokens[i])) {
          totalCount++;
        }
      }

      return totalCount == 0 ? 0 : rtlCount / totalCount;
    };


    /**
     * Regular expressions to check if the last strongly-directional character in a
     * piece of text is LTR.
     * @type {RegExp}
     * @private
     */
    soyshim.$$bidiLtrExitDirCheckRe_ = new RegExp(
        '[' + soyshim.$$bidiLtrChars_ + '][^' + soyshim.$$bidiRtlChars_ + ']*$');


    /**
     * Regular expressions to check if the last strongly-directional character in a
     * piece of text is RTL.
     * @type {RegExp}
     * @private
     */
    soyshim.$$bidiRtlExitDirCheckRe_ = new RegExp(
        '[' + soyshim.$$bidiRtlChars_ + '][^' + soyshim.$$bidiLtrChars_ + ']*$');


    /**
     * Check if the exit directionality a piece of text is LTR, i.e. if the last
     * strongly-directional character in the string is LTR.
     * @param {string} str string being checked.
     * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
     *     Default: false.
     * @return {boolean} Whether LTR exit directionality was detected.
     * @private
     */
    soyshim.$$bidiIsLtrExitText_ = function(str, opt_isHtml) {
      str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
      return soyshim.$$bidiLtrExitDirCheckRe_.test(str);
    };


    /**
     * Check if the exit directionality a piece of text is RTL, i.e. if the last
     * strongly-directional character in the string is RTL.
     * @param {string} str string being checked.
     * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
     *     Default: false.
     * @return {boolean} Whether RTL exit directionality was detected.
     * @private
     */
    soyshim.$$bidiIsRtlExitText_ = function(str, opt_isHtml) {
      str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
      return soyshim.$$bidiRtlExitDirCheckRe_.test(str);
    };

    return soyshim;
});