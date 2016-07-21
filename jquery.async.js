(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function(root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {

  var slice = Array.prototype.slice;

  /**
   * run deferreds collection of functions in parallel
   *
   * @param [function] deferreds
   * function return deferred
   *
   * @returns {promise}
   */
  $.parallel = function(deferreds) {
    if (!Array.isArray(deferreds)) {
      deferreds = slice.call(arguments);
    }

    deferreds = deferreds.map(function(deferred) {
      return deferred();
    });

    var defer = $.Deferred();
    $.when.apply(null, deferreds).done(function() {
      defer.resolve(slice.call(arguments));
    });

    return defer.promise();
  };

  /**
   * run deferreds collection of functions in series
   * each function consumes the return value of the previous function
   *
   * @param [function] deferreds
   * function return deferred
   *
   * @returns {promise}
   */
  $.series = function(deferreds) {
    if (!Array.isArray(deferreds)) {
      deferreds = Array.prototype.slice.call(arguments);
    }

    var defer = $.Deferred();
    var initDefer = $.Deferred();
    deferreds.reduce(function(prev, next) {
      return prev.then(next, defer.reject);
    }, initDefer.promise()).then(defer.resolve, defer.reject);
    initDefer.resolve('');

    return defer.promise();
  };
}));
