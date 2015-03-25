// bind

// isArray

// forEach

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

  var resolve = function(val) {
    if (this._status !== Promise.PENDING) {
      return;
    }
    this._value = val;
    this._status = Promise.FULFILLED;
    var fn;
    while (fn = this._listener.shift()) {
      fn(this._value);
    }
  };

  var reject = function(val) {
    if (this._status !== Promise.PENDING) {
      return;
    }
    this._value = val;
    this._status = Promise.REJECTED;
    var fn;
    while (fn = this._listener.shift()) {
      fn(this._value);
    }
  };

  var Promise = function(fn) {
    this._status = Promise.PENDING;
    this._value = undefined;
    this._listener = [];

    if (typeof fn === 'function') {
      fn(resolve.bind(this), reject.bind(this));
    }
  };

  extend(Promise.prototype, {
    then: function(onFulfilled, onRejected) {

      var promise = new Promise();
      var fn = (function(data) {
        var ret = null;
        if (this._status === Promise.FULFILLED) {
          ret = onFulfilled ? onFulfilled(data) : data
        } else {
          ret = onRejected ? onRejected(data) : data
        }

        if (Promise.isPromise(ret)) {
          ret.then(function() {
            resolve.call(promise, data);
          }, function() {
            reject.call(promise, data);
          })
        } else {
          if (this._status === Promise.FULFILLED) {
            resolve.call(promise, data);
          } else {
            reject.call(promise, data);
          }
        }
      }).bind(this);

      if (this._status !== Promise.PENDING) {
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

    PENDING: 'pending',
    FULFILLED: 'resolved',
    REJECTED: 'rejected',

    isPromise: function(obj) {
      return obj && typeof obj.then === 'function';
    },

    // TODO: 转换
    all: function(promises) {
      if(!Array.isArray(promises)) {
        throw new Error((promises || 'undefined').toString() + ' ISNOT a Array' );
      }
      var lens = promises.length;
      var values = [];
      return new Promise(function(resolve, reject){
        promises.forEach(function(promise, index) {
          promise.then(function(value){
            values[index] = value;
            lens = lens - 1;
            if(lens === 0) {
              resolve(values);
            }
          }, function(err){
            reject(err);
          });
        });
      });
    },

    race: function(promises) {
      if(!Array.isArray(promises)) {
        throw new Error((promises || 'undefined').toString() + ' ISNOT a Array' );
      }
      return new Promise(function(resolve, reject){
        promises.forEach(function(promise, index) {
          promise.then(function(value){
            resolve(value);
          }, function(err){
            reject(err);
          })
        });
      });
    },

    resolve: function(value) {

      if (Promise.isPromise(value)) {
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
  })

  this.Promise = Promise;
})();
