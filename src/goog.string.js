define(['goog.userAgent.js'], function(goog_userAgent) {

    var goog = {};

    goog.string = {

        /**
         * Converts \r\n, \r, and \n to <br>s
         * @param {*} str The string in which to convert newlines.
         * @param {boolean=} opt_xml Whether to use XML compatible tags.
         * @return {string} A copy of {@code str} with converted newlines.
         */
        newLineToBr: function (str, opt_xml) {

            str = String(str);

            // This quick test helps in the case when there are no chars to replace,
            // in the worst case this makes barely a difference to the time taken.
            if (!goog.string.NEWLINE_TO_BR_RE_.test(str)) {
                return str;
            }

            return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
        },
        urlEncode: encodeURIComponent,
        /**
         * Regular expression used within newlineToBr().
         * @type {RegExp}
         * @private
         */
        NEWLINE_TO_BR_RE_: /[\r\n]/
    };


    /**
     * Utility class to facilitate much faster string concatenation in IE,
     * using Array.join() rather than the '+' operator. For other browsers
     * we simply use the '+' operator.
     *
     * @param {Object|number|string|boolean=} opt_a1 Optional first initial item
     *     to append.
     * @param {...Object|number|string|boolean} var_args Other initial items to
     *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
     * @constructor
     */
    goog.string.StringBuffer = function (opt_a1, var_args) {
        /**
         * Internal buffer for the string to be concatenated.
         * @type {string|Array}
         * @private
         */
        this.buffer_ = goog_userAgent.jscript.HAS_JSCRIPT ? [] : '';

        if (opt_a1 != null) {
            this.append.apply(this, arguments);
        }
    };


    /**
     * Length of internal buffer (faster than calling buffer_.length).
     * Only used for IE.
     * @type {number}
     * @private
     */
    goog.string.StringBuffer.prototype.bufferLength_ = 0;

    /**
     * Appends one or more items to the string.
     *
     * Calling this with null, undefined, or empty arguments is an error.
     *
     * @param {Object|number|string|boolean} a1 Required first string.
     * @param {Object|number|string|boolean=} opt_a2 Optional second string.
     * @param {...Object|number|string|boolean} var_args Other items to append,
     *     e.g., sb.append('foo', 'bar', 'baz').
     * @return {goog.string.StringBuffer} This same StringBuilder object.
     */
    goog.string.StringBuffer.prototype.append = function (a1, opt_a2, var_args) {

        if (goog_userAgent.jscript.HAS_JSCRIPT) {
            if (opt_a2 == null) {  // no second argument (note: undefined == null)
                // Array assignment is 2x faster than Array push. Also, use a1
                // directly to avoid arguments instantiation, another 2x improvement.
                this.buffer_[this.bufferLength_++] = a1;
            } else {
                var arr = /**@type {Array.<number|string|boolean>}*/(this.buffer_);
                arr.push.apply(arr, arguments);
                this.bufferLength_ = this.buffer_.length;
            }

        } else {

            // Use a1 directly to avoid arguments instantiation for single-arg case.
            this.buffer_ += a1;
            if (opt_a2 != null) {  // no second argument (note: undefined == null)
                for (var i = 1; i < arguments.length; i++) {
                    this.buffer_ += arguments[i];
                }
            }
        }

        return this;
    };


    /**
     * Clears the string.
     */
    goog.string.StringBuffer.prototype.clear = function () {

        if (goog_userAgent.jscript.HAS_JSCRIPT) {
            this.buffer_.length = 0;  // reuse array to avoid creating new object
            this.bufferLength_ = 0;

        } else {
            this.buffer_ = '';
        }
    };


    /**
     * Returns the concatenated string.
     *
     * @return {string} The concatenated string.
     */
    goog.string.StringBuffer.prototype.toString = function () {

        if (goog_userAgent.jscript.HAS_JSCRIPT) {
            var str = this.buffer_.join('');
            // Given a string with the entire contents, simplify the StringBuilder by
            // setting its contents to only be this string, rather than many fragments.
            this.clear();
            if (str) {
                this.append(str);
            }
            return str;

        } else {
            return /** @type {string} */ (this.buffer_);
        }
    };

});