define([], function() {
    dom = {};
    /**
     * @param {Document=} d
     * @constructor
     */
    dom.DomHelper = function (d) {
        this.document_ = d || document;
    };
    /**
     * @return {!Document}
     */
    dom.DomHelper.prototype.getDocument = function () {
        return this.document_;
    };

    /**
     * Creates a new element.
     * @param {string} name Tag name.
     * @return {!Element}
     */
    dom.DomHelper.prototype.createElement = function (name) {
        return this.document_.createElement(name);
    };

    /**
     * Creates a new document fragment.
     * @return {!DocumentFragment}
     */
    dom.DomHelper.prototype.createDocumentFragment = function () {
        return this.document_.createDocumentFragment();
    };

    return dom;
});