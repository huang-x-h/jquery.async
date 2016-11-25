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

  function isDeferred(obj) {
    return typeof obj.promise === 'function';
  }

  /**
   * run deferreds collection of functions in parallel
   *
   * if deferred function success handler has more than one argument,
   * it will only return the first argument
   *
   * because jQuery ajax success handler has three arguments,
   * but users are focus the data returned from the server,
   * so we just return the first argument
   *
   * @param {function} deferreds
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
      defer.resolve(slice.call(arguments).map(function(item) {
        return Array.isArray(item) ? item[0] : item;
      }));
    });

    return defer.promise();
  };

  /**
   * run deferreds collection of functions in series
   * each function consumes the return value of the previous function
   *
   * @param {function|array} deferreds
   * @param {object} initialValue
   * when deferreds is array, initialValue is the first deferred function param
   * function return deferred
   *
   * @returns {promise}
   */
  $.series = function(deferreds, initialValue) {
    if (!Array.isArray(deferreds)) {
      deferreds = slice.call(arguments);
      initialValue = '';
    }

    var defer = $.Deferred();
    var initDefer = $.Deferred();
    deferreds.reduce(function(prev, next) {
      return prev.then(function() {
          return next.apply(null, slice.call(arguments));
      }, defer.reject);
    }, initDefer.promise()).then(defer.resolve, defer.reject);
    initDefer.resolve(initialValue);

    return defer.promise();
  };

  /**
   * wrapper value and return promise object
   * @param {object} value
   * @return {promise}
   */
  $.promisify = function(value) {
    if (isDeferred(value)) {
      return value;
    }

    var defer = $.Deferred();
    defer.resolve(value);
    return defer.promise();
  };

  /**
   * Applies the function iteratee to each item in coll
   * @param {array} coll coll a collection to iterate over
   * @param {function} iteratee a function to apply to each item in coll and return a Promise object
   * @return {promise}
   */
  $.asyncEach = function(coll, iteratee) {
    var defer = $.Deferred();
    $.when(coll.map(function(item, coll) {
      return iteratee(item, coll);
    })).done(function() {
      defer.resolve(slice.call(arguments).map(function(item) {
        return Array.isArray(item) ? item[0] : item;
      }));
    });

    return defer.promise();
  };
}));
