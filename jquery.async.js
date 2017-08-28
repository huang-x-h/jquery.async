(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
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
}(function ($) {

  var slice = Array.prototype.slice;

  function isDeferred(obj) {
    return obj && typeof obj.promise === 'function';
  }

  function isAjax(obj) {
    return isDeferred(obj) && obj.hasOwnProperty('readyState');
  }

  /**
   * @namespace $
   */

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
  $.parallel = function (deferreds) {
    if (!Array.isArray(deferreds)) {
      deferreds = slice.call(arguments);
    }

    deferreds = deferreds.map(function (deferred) {
      return deferred();
    });

    var defer = $.Deferred();
    $.when.apply(null, deferreds).done(function () {
      if (deferreds.length === 1) {
        defer.resolve([arguments[0]]);
      } else {
        defer.resolve(slice.call(arguments).map(function (item, index) {
          return isAjax(deferreds[index]) ? item[0] : item;
        }));
      }
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
  $.series = function (deferreds, initialValue) {
    if (!Array.isArray(deferreds)) {
      deferreds = slice.call(arguments);
      initialValue = '';
    }

    var defer = $.Deferred();
    var initDefer = $.Deferred();
    deferreds.reduce(function (prev, next) {
      return prev.then(function () {
        return next.apply(null, slice.call(arguments));
      }, defer.reject);
    }, initDefer.promise()).then(defer.resolve, defer.reject);
    initDefer.resolve(initialValue);

    return defer.promise();
  };

  /**
   * 包装对象返回 promise 对象
   * @param {object} value
   * @return {promise}
   * @example
   *
   * $.promisify(1).then(function(data) {
   *   console.log(data); // 输出 1
   * });
   */
  $.promisify = function (value) {
    if (isDeferred(value)) {
      return value;
    }

    var defer = $.Deferred();
    defer.resolve(value);
    return defer.promise();
  };

  /**
   * 循环数组进行函数调用处理，返回各自调用结果
   * @param {array} coll 循环数组
   * @param {function} iteratee 调用函数，该函数即可以是普通函数，也可以是异步返回promise
   * @return {promise} 返回promise对象，返回值是数组，为各自处理返回值
   * @example
   *
   * $.asyncEach([1, 2, 3], function(item, coll) {
   *   var defer = $.Deferred();
   *   setTimeout(function() {
   *     defer.resolve(item + 1);
   *   }, 100);
   *   return defer.promise();
   * }).then(function(data) {
   *   console.log(data); //输出 2, 3, 4
   * });
   */
  $.asyncEach = function (coll, iteratee) {
    var defer = $.Deferred();
    $.when.apply(null, coll.map(function (item, coll) {
      return iteratee(item, coll);
    })).done(function () {
      defer.resolve(slice.call(arguments).map(function (item) {
        return Array.isArray(item) ? item[0] : item;
      }));
    });

    return defer.promise();
  };

  /**
   * 根据给定的时间和参数轮询执行函数
   * @param {function} func 该函数即可以是普通函数，也可以是异步返回promise
   * @param {number} wait 延长执行毫秒值
   * @return {object} polling 返回轮询对象
   * @return {function} polling.start 启动轮询
   * @return {function} polling.stop 结束轮询
   * @return {function} polling.times 返回轮询执行函数次数
   * @example
   *
   * var polling = $.polling(function() {
   *   console.log('polling');
   * }, 1000);
   *
   * // 启动轮询
   * polling.start();
   *
   * //结束轮询
   * polling.stop();
   *
   * // 查询轮询次数
   * polling.times();
   */
  $.polling = function (func, wait) {
    var args = slice.call(arguments, 2);
    var timer, times = 0;

    function startPolling() {
      timer = setTimeout(function () {
        times++;

        $.promisify(func.apply(null, args)).then(function () {
          if (timer) {
            startPolling();
          }
        });
      }, wait);
    }

    function stopPolliing() {
      clearTimeout(timer);
      timer = null;
    }

    function getTimes() {
      return times;
    }

    return {
      start: startPolling,
      stop: stopPolliing,
      times: getTimes
    }
  }
}));
