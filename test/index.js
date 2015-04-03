// mocha & chai
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var DELAY = 77; //for asnync test

var Promise = require('../src/promise.js').Promise;
// console.info(Promise)

describe('Test: Instance Method', function() {
  describe('#then()', function() {

    it('Usage: then', function(done) {
      var promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('fired');
        }, DELAY);
      });
      promise.then(function(ret) {
        ret.should.equal('fired')
        done();
      });
    });
  });

  describe('#catch()', function() {

    it('Usage: catch', function(done) {
      var promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
          reject('error');
        }, DELAY);
      });
      promise.catch(function(message) {
        message.should.equal('error');
        done();
      });
    });
  });
});

describe('Test: Class Method', function() {

  describe('.isPromise', function() {
    it('It should return the exact value', function() {
      [false, 1, 'abc', {
          foo: true
        },
        [1]
      ].forEach(function(item) {
        Promise.isPromise(item).should.equal(false);
      });
      var promise = new Promise();
      Promise.isPromise(promise).should.equal(true);
    });
  });

  describe('.all', function() {
    it('the argument passed the function that is then\'s first argument should have three element', function(done) {
      var promises = [];
      var temp = [0, 1, 2];
      temp.forEach(function(item, index) {
        promises.push(new Promise(function(resolve) {
          setTimeout((function(j) {
            resolve(j);
          })(item), DELAY);
        }));
      });

      Promise.all(promises).then(function(data) {
        data.should.be.a('array').with.length(3);
        data.forEach(function(val, index) {
          val.should.equal(temp[index]);
        });
        done();
      })
    });
  });

  describe('.race', function() {
    it('should trow an error as long as one promise rejected', function(done) {
      var promises = [];
      var temp = [0, 1, 2];
      var rejected_promise_index = 2;

      temp.forEach(function(item, index) {
        promises.push(new Promise(function(resolve, reject) {
          if (index == rejected_promise_index) {
            reject(index);
            return;
          }
          setTimeout((function(j) {
            resolve(j);
          })(item), 10 * index);
        }));
      });

      Promise.race(promises).then(function(data) {
        data.should.equal(temp[0]);
        done();
      });
    });
  });

  describe('.resolve', function(){

  });

  describe('.reject', function(){

  });

})

describe('Chaining Asynchronous Functions', function() {

  it('multi instance', function(done) {
    new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('p1');
        }, DELAY);
      }).then(function(val) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve('p2');
          }, DELAY);
        });
      })
      .then(function(val) {
        val.should.equal('p2')
        done();
      });
  });
});



function noop() {}

function bounce() {
  console.log('bounce')
}
