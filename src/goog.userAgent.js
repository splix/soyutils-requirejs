define([], function() {
    return function() {
        var userAgent = "";
        if ("undefined" !== typeof navigator && navigator
            && "string" == typeof navigator.userAgent) {
            userAgent = navigator.userAgent;
        }
        var isOpera = userAgent.indexOf('Opera') == 0;
        return {
            jscript: {
                /**
                 * @type {boolean}
                 */
                HAS_JSCRIPT: 'ScriptEngine' in this
            },
            /**
             * @type {boolean}
             */
            OPERA: isOpera,
            /**
             * @type {boolean}
             */
            IE: !isOpera && userAgent.indexOf('MSIE') != -1,
            /**
             * @type {boolean}
             */
            WEBKIT: !isOpera && userAgent.indexOf('WebKit') != -1
        };
    }
});