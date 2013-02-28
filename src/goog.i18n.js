define(['soyshim', 'soy'], function(soyshim, soy) {

    var goog = {};
    goog.i18n = {
        bidi: {
            /**
             * Check the directionality of a piece of text, return true if the piece
             * of text should be laid out in RTL direction.
             * @param {string} text The piece of text that need to be detected.
             * @param {boolean=} opt_isHtml Whether {@code text} is HTML/HTML-escaped.
             *     Default: false.
             * @return {boolean}
             * @private
             */
            detectRtlDirectionality: function (text, opt_isHtml) {
                text = soyshim.$$bidiStripHtmlIfNecessary_(text, opt_isHtml);
                return soyshim.$$bidiRtlWordRatio_(text)
                    > soyshim.$$bidiRtlDetectionThreshold_;
            }
        }
    };

    /**
     * Directionality enum.
     * @enum {number}
     */
    goog.i18n.bidi.Dir = {
        RTL: -1,
        UNKNOWN: 0,
        LTR: 1
    };


    /**
     * Convert a directionality given in various formats to a goog.i18n.bidi.Dir
     * constant. Useful for interaction with different standards of directionality
     * representation.
     *
     * @param {goog.i18n.bidi.Dir|number|boolean} givenDir Directionality given in
     *     one of the following formats:
     *     1. A goog.i18n.bidi.Dir constant.
     *     2. A number (positive = LRT, negative = RTL, 0 = unknown).
     *     3. A boolean (true = RTL, false = LTR).
     * @return {goog.i18n.bidi.Dir} A goog.i18n.bidi.Dir constant matching the given
     *     directionality.
     */
    goog.i18n.bidi.toDir = function (givenDir) {
        if (typeof givenDir == 'number') {
            return givenDir > 0 ? goog.i18n.bidi.Dir.LTR :
                givenDir < 0 ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.UNKNOWN;
        } else {
            return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
        }
    };


    /**
     * Utility class for formatting text for display in a potentially
     * opposite-directionality context without garbling. Provides the following
     * functionality:
     *
     * @param {goog.i18n.bidi.Dir|number|boolean} dir The context
     *     directionality as a number
     *     (positive = LRT, negative = RTL, 0 = unknown).
     * @constructor
     */
    goog.i18n.BidiFormatter = function (dir) {
        this.dir_ = goog.i18n.bidi.toDir(dir);
    };


    /**
     * Returns 'dir="ltr"' or 'dir="rtl"', depending on {@code text}'s estimated
     * directionality, if it is not the same as the context directionality.
     * Otherwise, returns the empty string.
     *
     * @param {string} text Text whose directionality is to be estimated.
     * @param {boolean=} opt_isHtml Whether {@code text} is HTML / HTML-escaped.
     *     Default: false.
     * @return {string} 'dir="rtl"' for RTL text in non-RTL context; 'dir="ltr"' for
     *     LTR text in non-LTR context; else, the empty string.
     */
    goog.i18n.BidiFormatter.prototype.dirAttr = function (text, opt_isHtml) {
        var dir = soy.$$bidiTextDir(text, opt_isHtml);
        return dir && dir != this.dir_ ? dir < 0 ? 'dir="rtl"' : 'dir="ltr"' : '';
    };

    /**
     * Returns the trailing horizontal edge, i.e. "right" or "left", depending on
     * the global bidi directionality.
     * @return {string} "left" for RTL context and "right" otherwise.
     */
    goog.i18n.BidiFormatter.prototype.endEdge = function () {
        return this.dir_ < 0 ? 'left' : 'right';
    };

    /**
     * Returns the Unicode BiDi mark matching the context directionality (LRM for
     * LTR context directionality, RLM for RTL context directionality), or the
     * empty string for neutral / unknown context directionality.
     *
     * @return {string} LRM for LTR context directionality and RLM for RTL context
     *     directionality.
     */
    goog.i18n.BidiFormatter.prototype.mark = function () {
        return (
            (this.dir_ > 0) ? '\u200E' /*LRM*/ :
                (this.dir_ < 0) ? '\u200F' /*RLM*/ :
                    '');
    };

    /**
     * Returns a Unicode BiDi mark matching the context directionality (LRM or RLM)
     * if the directionality or the exit directionality of {@code text} are opposite
     * to the context directionality. Otherwise returns the empty string.
     *
     * @param {string} text The input text.
     * @param {boolean=} opt_isHtml Whether {@code text} is HTML / HTML-escaped.
     *     Default: false.
     * @return {string} A Unicode bidi mark matching the global directionality or
     *     the empty string.
     */
    goog.i18n.BidiFormatter.prototype.markAfter = function (text, opt_isHtml) {
        var dir = soy.$$bidiTextDir(text, opt_isHtml);
        return soyshim.$$bidiMarkAfterKnownDir_(this.dir_, dir, text, opt_isHtml);
    };

    /**
     * Formats a string of unknown directionality for use in HTML output of the
     * context directionality, so an opposite-directionality string is neither
     * garbled nor garbles what follows it.
     *
     * @param {string} str The input text.
     * @param {boolean=} placeholder This argument exists for consistency with the
     *     Closure Library. Specifying it has no effect.
     * @return {string} Input text after applying the above processing.
     */
    goog.i18n.BidiFormatter.prototype.spanWrap = function (str, placeholder) {
        str = String(str);
        var textDir = soy.$$bidiTextDir(str, true);
        var reset = soyshim.$$bidiMarkAfterKnownDir_(this.dir_, textDir, str, true);
        if (textDir > 0 && this.dir_ <= 0) {
            str = '<span dir="ltr">' + str + '</span>';
        } else if (textDir < 0 && this.dir_ >= 0) {
            str = '<span dir="rtl">' + str + '</span>';
        }
        return str + reset;
    };

    /**
     * Returns the leading horizontal edge, i.e. "left" or "right", depending on
     * the global bidi directionality.
     * @return {string} "right" for RTL context and "left" otherwise.
     */
    goog.i18n.BidiFormatter.prototype.startEdge = function () {
        return this.dir_ < 0 ? 'right' : 'left';
    };

    /**
     * Formats a string of unknown directionality for use in plain-text output of
     * the context directionality, so an opposite-directionality string is neither
     * garbled nor garbles what follows it.
     * As opposed to {@link #spanWrap}, this makes use of unicode BiDi formatting
     * characters. In HTML, its *only* valid use is inside of elements that do not
     * allow mark-up, e.g. an 'option' tag.
     *
     * @param {string} str The input text.
     * @param {boolean=} placeholder This argument exists for consistency with the
     *     Closure Library. Specifying it has no effect.
     * @return {string} Input text after applying the above processing.
     */
    goog.i18n.BidiFormatter.prototype.unicodeWrap = function (str, placeholder) {
        str = String(str);
        var textDir = soy.$$bidiTextDir(str, true);
        var reset = soyshim.$$bidiMarkAfterKnownDir_(this.dir_, textDir, str, true);
        if (textDir > 0 && this.dir_ <= 0) {
            str = '\u202A' + str + '\u202C';
        } else if (textDir < 0 && this.dir_ >= 0) {
            str = '\u202B' + str + '\u202C';
        }
        return str + reset;
    };


    return goog.i18n
});