/* jshint -W084 */

(function() {

  var extend = function(target, source) {
    if (target && !source) {
      source = target;
      target = {};
    }

    for (var i in source) {
      if (!source.hasOwnProperty(i)) {
        continue;
      }
      target[i] = source[i];
    }

    return target;
  };

  var guid = 0;

  var resolve = function(val) {
    if (this._status !== STATUS.PENDING) {
      return;
    }
    this._value = val;
    this._status = STATUS.FULFILLED;
    var fn;
    while (fn = this._listener.shift()) {
      fn(this._value);
    }
  };

  var reject = function(val) {
    if (this._status !== STATUS.PENDING) {
      return;
    }
    this._value = val;
    this._status = STATUS.REJECTED;
    var fn;
    while (fn = this._listener.shift()) {
      fn(this._value);
    }
  };

  var STATUS = {
    PENDING: 'pending',
    FULFILLED: 'resolved',
    REJECTED: 'rejected'
  };

  var Promise = function(fn) {
    this._status = STATUS.PENDING;
    this._value = undefined;
    this._listener = [];
    this._id = guid++;

    if (typeof fn === 'function') {
      fn(resolve.bind(this), reject.bind(this));
    }
  };

  extend(Promise.prototype, {
    then: function(onFulfilled, onRejected) {
      var promise = new Promise();

      var fn = (function(data) {
        var ret = null;
        if (this._status === STATUS.FULFILLED) {
          ret = onFulfilled ? onFulfilled(data) : data;
        } else {
          ret = onRejected ? onRejected(data) : data;
        }

        if (Promise.isPromise(ret)) {
          ret.then(function(data) {
            resolve.call(promise, data);
          }, function(data) {
            reject.call(promise, data);
          });
        } else {
          if (this._status === STATUS.FULFILLED) {
            resolve.call(promise, data);
          } else {
            reject.call(promise, data);
          }
        }

        return ret;
      }).bind(this);

      if (this._status !== STATUS.PENDING) {
        fn(this._value);
      } else {
        this._listener.push(fn);
      }
      return promise;
    },
    catch: function(onRejected) {
      return this.then(null, onRejected);
    }
  });

  extend(Promise, {

    isPromise: function(obj) {
      return obj && typeof obj.then === 'function';
    },

    all: function(promises) {
      if (!Array.isArray(promises)) {
        throw new Error((promises || 'undefined').toString() + ' ISNOT a Array');
      }
      var lens = promises.length;
      var values = [];
      return new Promise(function(resolve, reject) {
        promises.forEach(function(promise, index) {

          if (!Promise.isPromise(promise)) {
            promise = Promise.resolve(promise);
          }
          promise.then(function(value) {
            values[index] = value;
            lens = lens - 1;
            if (lens === 0) {
              resolve(values);
            }
          }, function(err) {
            reject(err);
          });
        });
      });
    },

    race: function(promises) {
      if (!Array.isArray(promises)) {
        throw new Error((promises || 'undefined').toString() + ' ISNOT a Array');
      }
      return new Promise(function(resolve, reject) {
        promises.forEach(function(promise, index) {
          promise.then(function(value) {
            resolve(value);
          }, function(err) {
            reject(err);
          });
        });
      });
    },

    resolve: function(value) {

      if (Promise.isPromise(value)) {
        resolve.call(value);
        return value;
      }

      return new Promise(function(resolve) {
        resolve(value || undefined);
      });
    },

    reject: function(reason) {
      if (Promise.isPromise(reason)) {
        reject.call(reason);
        return reason;
      }

      return new Promise(function(undefined, reject) {
        reject(reason || undefined);
      });
    }
  });

  if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function(require, exports, module) {
      exports.Promise = Promise;
    });
  } else if (typeof module === 'object' && module.exports) {
    exports.Promise = Promise;
  }

  this.Promise = Promise;
})();
