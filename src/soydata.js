define(['goog.soy', 'goog.inherits'], function(goog_soy, goog_inherits) {
    var soydata = {};

    soydata.VERY_UNSAFE = {};

        // -----------------------------------------------------------------------------
    // soydata: Defines typed strings, e.g. an HTML string {@code "a<b>c"} is
    // semantically distinct from the plain text string {@code "a<b>c"} and smart
    // templates can take that distinction into account.

    /**
     * A type of textual content.
     *
     * This is an enum of type Object so that these values are unforgeable.
     *
     * @enum {!Object}
     */
    soydata.SanitizedContentKind = goog_soy.data.SanitizedContentKind;


    /**
     * Content of type {@link soydata.SanitizedContentKind.HTML}.
     *
     * The content is a string of HTML that can safely be embedded in a PCDATA
     * context in your app.  If you would be surprised to find that an HTML
     * sanitizer produced {@code s} (e.g.  it runs code or fetches bad URLs) and
     * you wouldn't write a template that produces {@code s} on security or privacy
     * grounds, then don't pass {@code s} here.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedHtml = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedHtml, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedHtml.prototype.contentKind = soydata.SanitizedContentKind.HTML;


    /**
     * Content of type {@link soydata.SanitizedContentKind.JS}.
     *
     * The content is Javascript source that when evaluated does not execute any
     * attacker-controlled scripts.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedJs = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedJs, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedJs.prototype.contentKind =
        soydata.SanitizedContentKind.JS;


    /**
     * Content of type {@link soydata.SanitizedContentKind.JS_STR_CHARS}.
     *
     * The content can be safely inserted as part of a single- or double-quoted
     * string without terminating the string.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedJsStrChars = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedJsStrChars, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedJsStrChars.prototype.contentKind =
        soydata.SanitizedContentKind.JS_STR_CHARS;


    /**
     * Content of type {@link soydata.SanitizedContentKind.URI}.
     *
     * The content is a URI chunk that the caller knows is safe to emit in a
     * template.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedUri = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedUri, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;


    /**
     * Content of type {@link soydata.SanitizedContentKind.ATTRIBUTES}.
     *
     * The content should be safely embeddable within an open tag, such as a
     * key="value" pair.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedHtmlAttribute = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedHtmlAttribute, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedHtmlAttribute.prototype.contentKind =
        soydata.SanitizedContentKind.ATTRIBUTES;


    /**
     * Content of type {@link soydata.SanitizedContentKind.CSS}.
     *
     * The content is non-attacker-exploitable CSS, such as {@code color:#c3d9ff}.
     *
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.SanitizedCss = function() {
      goog_soy.data.SanitizedContent.call(this);  // Throws an exception.
    };
    goog_inherits(soydata.SanitizedCss, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.SanitizedCss.prototype.contentKind =
        soydata.SanitizedContentKind.CSS;


    /**
     * Unsanitized plain text string.
     *
     * While all strings are effectively safe to use as a plain text, there are no
     * guarantees about safety in any other context such as HTML. This is
     * sometimes used to mark that should never be used unescaped.
     *
     * @param {*} content Plain text with no guarantees.
     * @constructor
     * @extends {goog_soy.data.SanitizedContent}
     */
    soydata.UnsanitizedText = function(content) {
      /** @override */
      this.content = String(content);
    };
    goog_inherits(soydata.UnsanitizedText, goog_soy.data.SanitizedContent);

    /** @override */
    soydata.UnsanitizedText.prototype.contentKind =
        soydata.SanitizedContentKind.TEXT;


    /**
     * Creates a factory for SanitizedContent types.
     *
     * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
     * instantiate Sanitized* classes, without making the Sanitized* constructors
     * publicly usable. Requiring all construction to use the VERY_UNSAFE names
     * helps callers and their reviewers easily tell that creating SanitizedContent
     * is not always safe and calls for careful review.
     *
     * @param {function(new: T, string)} ctor A constructor.
     * @return {!function(*): T} A factory that takes content and returns a
     *     new instance.
     * @template T
     * @private
     */
    soydata.$$makeSanitizedContentFactory_ = function(ctor) {
      /** @constructor */
      function InstantiableCtor() {}
      InstantiableCtor.prototype = ctor.prototype;
      return function(content) {
        var result = new InstantiableCtor();
        result.content = String(content);
        return result;
      };
    };


    // -----------------------------------------------------------------------------
    // Sanitized content ordainers. Please use these with extreme caution (with the
    // exception of markUnsanitizedText). A good recommendation is to limit usage
    // of these to just a handful of files in your source tree where usages can be
    // carefully audited.


    /**
     * Protects a string from being used in an noAutoescaped context.
     *
     * This is useful for content where there is significant risk of accidental
     * unescaped usage in a Soy template. A great case is for user-controlled
     * data that has historically been a source of vulernabilities.
     *
     * @param {*} content Text to protect.
     * @return {!soydata.UnsanitizedText} A wrapper that is rejected by the
     *     Soy noAutoescape print directive.
     */
    soydata.markUnsanitizedText = function(content) {
      return new soydata.UnsanitizedText(content);
    };


    /**
     * Takes a leap of faith that the provided content is "safe" HTML.
     *
     * @param {*} content A string of HTML that can safely be embedded in
     *     a PCDATA context in your app. If you would be surprised to find that an
     *     HTML sanitizer produced {@code s} (e.g. it runs code or fetches bad URLs)
     *     and you wouldn't write a template that produces {@code s} on security or
     *     privacy grounds, then don't pass {@code s} here.
     * @return {!soydata.SanitizedHtml} Sanitized content wrapper that
     *     indicates to Soy not to escape when printed as HTML.
     */
    soydata.VERY_UNSAFE.ordainSanitizedHtml =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedHtml);


    /**
     * Takes a leap of faith that the provided content is "safe" (non-attacker-
     * controlled, XSS-free) Javascript.
     *
     * @param {*} content Javascript source that when evaluated does not
     *     execute any attacker-controlled scripts.
     * @return {!soydata.SanitizedJs} Sanitized content wrapper that indicates to
     *     Soy not to escape when printed as Javascript source.
     */
    soydata.VERY_UNSAFE.ordainSanitizedJs =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedJs);


    // TODO: This function is probably necessary, either externally or internally
    // as an implementation detail. Generally, plain text will always work here,
    // as there's no harm to unescaping the string and then re-escaping when
    // finally printed.
    /**
     * Takes a leap of faith that the provided content can be safely embedded in
     * a Javascript string without re-esacping.
     *
     * @param {*} content Content that can be safely inserted as part of a
     *     single- or double-quoted string without terminating the string.
     * @return {!soydata.SanitizedJsStrChars} Sanitized content wrapper that
     *     indicates to Soy not to escape when printed in a JS string.
     */
    soydata.VERY_UNSAFE.ordainSanitizedJsStrChars =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedJsStrChars);


    /**
     * Takes a leap of faith that the provided content is "safe" to use as a URI
     * in a Soy template.
     *
     * This creates a Soy SanitizedContent object which indicates to Soy there is
     * no need to escape it when printed as a URI (e.g. in an href or src
     * attribute), such as if it's already been encoded or  if it's a Javascript:
     * URI.
     *
     * @param {*} content A chunk of URI that the caller knows is safe to
     *     emit in a template.
     * @return {!soydata.SanitizedUri} Sanitized content wrapper that indicates to
     *     Soy not to escape or filter when printed in URI context.
     */
    soydata.VERY_UNSAFE.ordainSanitizedUri =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedUri);


    /**
     * Takes a leap of faith that the provided content is "safe" to use as an
     * HTML attribute.
     *
     * @param {*} content An attribute name and value, such as
     *     {@code dir="ltr"}.
     * @return {!soydata.SanitizedHtmlAttribute} Sanitized content wrapper that
     *     indicates to Soy not to escape when printed as an HTML attribute.
     */
    soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedHtmlAttribute);


    /**
     * Takes a leap of faith that the provided content is "safe" to use as CSS
     * in a style attribute or block.
     *
     * @param {*} content CSS, such as {@code color:#c3d9ff}.
     * @return {!soydata.SanitizedCss} Sanitized CSS wrapper that indicates to
     *     Soy there is no need to escape or filter when printed in CSS context.
     */
    soydata.VERY_UNSAFE.ordainSanitizedCss =
        soydata.$$makeSanitizedContentFactory_(soydata.SanitizedCss);

    return soydata;    
});
