define([], function (require) {

    var goog = {};

    goog.DEBUG = false;

    goog.inherits = require('goog.inherits');

    goog.userAgent = require('goog.userAgent');

    goog.asserts = require('goog.asserts');

    goog.dom = require('goog.dom');

    goog.format = require('goog.format');

    goog.i18n = require('goog.i18n');

    goog.string = require('goog.string');

    goog.soy = require('goog.soy');

    return goog;
});
