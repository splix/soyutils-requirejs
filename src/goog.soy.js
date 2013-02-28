define(['soyshim'], function(soyshim) {
    var goog = {};

    goog.soy = {
        /**
         * Helper function to render a Soy template and then set the
         * output string as the innerHTML of an element. It is recommended
         * to use this helper function instead of directly setting
         * innerHTML in your hand-written code, so that it will be easier
         * to audit the code for cross-site scripting vulnerabilities.
         *
         * @param {Function} template The Soy template defining element's content.
         * @param {Object=} opt_templateData The data for the template.
         * @param {Object=} opt_injectedData The injected data for the template.
         * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
         *     nodes will be created.
         */
        renderAsElement: function (template, opt_templateData, opt_injectedData, opt_dom) {
            return /** @type {!Element} */ (soyshim.$$renderWithWrapper_(
                template, opt_templateData, opt_dom, true /* asElement */,
                opt_injectedData));
        },
        /**
         * Helper function to render a Soy template into a single node or
         * a document fragment. If the rendered HTML string represents a
         * single node, then that node is returned (note that this is
         * *not* a fragment, despite them name of the method). Otherwise a
         * document fragment is returned containing the rendered nodes.
         *
         * @param {Function} template The Soy template defining element's content.
         * @param {Object=} opt_templateData The data for the template.
         * @param {Object=} opt_injectedData The injected data for the template.
         * @param {(goog.dom.DomHelper|Document)=} opt_dom The context in which DOM
         *     nodes will be created.
         * @return {!Node} The resulting node or document fragment.
         */
        renderAsFragment: function (template, opt_templateData, opt_injectedData, opt_dom) {
            return soyshim.$$renderWithWrapper_(
                template, opt_templateData, opt_dom, false /* asElement */,
                opt_injectedData);
        },
        /**
         * Helper function to render a Soy template and then set the output string as
         * the innerHTML of an element. It is recommended to use this helper function
         * instead of directly setting innerHTML in your hand-written code, so that it
         * will be easier to audit the code for cross-site scripting vulnerabilities.
         *
         * NOTE: New code should consider using goog.soy.renderElement instead.
         *
         * @param {Element} element The element whose content we are rendering.
         * @param {Function} template The Soy template defining the element's content.
         * @param {Object=} opt_templateData The data for the template.
         * @param {Object=} opt_injectedData The injected data for the template.
         */
        renderElement: function (element, template, opt_templateData, opt_injectedData) {
            element.innerHTML = template(opt_templateData, null, opt_injectedData);
        },
        data: {}
    };


    /**
     * A type of textual content.
     *
     * This is an enum of type Object so that these values are unforgeable.
     *
     * @enum {!Object}
     */
    goog.soy.data.SanitizedContentKind = {

        /**
         * A snippet of HTML that does not start or end inside a tag, comment, entity,
         * or DOCTYPE; and that does not contain any executable code
         * (JS, {@code <object>}s, etc.) from a different trust domain.
         */
        HTML: {},

        /**
         * Executable Javascript code or expression, safe for insertion in a
         * script-tag or event handler context, known to be free of any
         * attacker-controlled scripts. This can either be side-effect-free
         * Javascript (such as JSON) or Javascript that entirely under Google's
         * control.
         */
        JS: goog.DEBUG ? {sanitizedContentJsStrChars: true} : {},

        /**
         * A sequence of code units that can appear between quotes (either kind) in a
         * JS program without causing a parse error, and without causing any side
         * effects.
         * <p>
         * The content should not contain unescaped quotes, newlines, or anything else
         * that would cause parsing to fail or to cause a JS parser to finish the
         * string its parsing inside the content.
         * <p>
         * The content must also not end inside an escape sequence ; no partial octal
         * escape sequences or odd number of '{@code \}'s at the end.
         */
        JS_STR_CHARS: {},

        /** A properly encoded portion of a URI. */
        URI: {},

        /**
         * Repeated attribute names and values. For example,
         * {@code dir="ltr" foo="bar" onclick="trustedFunction()" checked}.
         */
        ATTRIBUTES: goog.DEBUG ? {sanitizedContentHtmlAttribute: true} : {},

        // TODO: Consider separating rules, declarations, and values into
        // separate types, but for simplicity, we'll treat explicitly blessed
        // SanitizedContent as allowed in all of these contexts.
        /**
         * A CSS3 declaration, property, value or group of semicolon separated
         * declarations.
         */
        CSS: {},

        /**
         * Unsanitized plain-text content.
         *
         * This is effectively the "null" entry of this enum, and is sometimes used
         * to explicitly mark content that should never be used unescaped. Since any
         * string is safe to use as text, being of ContentKind.TEXT makes no
         * guarantees about its safety in any other context such as HTML.
         */
        TEXT: {}
    };


    /**
     * A string-like object that carries a content-type.
     *
     * IMPORTANT! Do not create these directly, nor instantiate the subclasses.
     * Instead, use a trusted, centrally reviewed library as endorsed by your team
     * to generate these objects. Otherwise, you risk accidentally creating
     * SanitizedContent that is attacker-controlled and gets evaluated unescaped in
     * templates.
     *
     * @constructor
     */
    goog.soy.data.SanitizedContent = function () {
        throw Error('Do not instantiate directly');
    };


    /**
     * The context in which this content is safe from XSS attacks.
     * @type {goog.soy.data.SanitizedContentKind}
     */
    goog.soy.data.SanitizedContent.prototype.contentKind;


    /**
     * The already-safe content.
     * @type {string}
     */
    goog.soy.data.SanitizedContent.prototype.content;


    /** @override */
    goog.soy.data.SanitizedContent.prototype.toString = function () {
        return this.content;
    };

    return goog.soy;
});