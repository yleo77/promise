!function(){var a=function(a,b){a&&!b&&(b=a,a={});for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a},b=0,c=function(a){if(this._status===e.PENDING){this._value=a,this._status=e.FULFILLED;for(var b;b=this._listener.shift();)b(this._value)}},d=function(a){if(this._status===e.PENDING){this._value=a,this._status=e.REJECTED;for(var b;b=this._listener.shift();)b(this._value)}},e={PENDING:"pending",FULFILLED:"resolved",REJECTED:"rejected"},f=function(a){this._status=e.PENDING,this._value=void 0,this._listener=[],this._id=b++,"function"==typeof a&&a(c.bind(this),d.bind(this))};a(f.prototype,{then:function(a,b){var g=new f,h=function(h){var i=null;return i=this._status===e.FULFILLED?a?a(h):h:b?b(h):h,f.isPromise(i)?i.then(function(a){c.call(g,a)},function(a){d.call(g,a)}):this._status===e.FULFILLED?c.call(g,h):d.call(g,h),i}.bind(this);return this._status!==e.PENDING?h(this._value):this._listener.push(h),g},"catch":function(a){return this.then(null,a)}}),a(f,{isPromise:function(a){return a&&"function"==typeof a.then},all:function(a){if(!Array.isArray(a))throw new Error((a||"undefined").toString()+" ISNOT a Array");var b=a.length,c=[];return new f(function(d,e){a.forEach(function(a,f){a.then(function(a){c[f]=a,b-=1,0===b&&d(c)},function(a){e(a)})})})},race:function(a){if(!Array.isArray(a))throw new Error((a||"undefined").toString()+" ISNOT a Array");return new f(function(b,c){a.forEach(function(a,d){a.then(function(a){b(a)},function(a){c(a)})})})},resolve:function(a){return f.isPromise(a)?(c.call(a),a):new f(function(b){b(a||void 0)})},reject:function(a){return f.isPromise(a)?(d.call(a),a):new f(function(b,c){c(a||b)})}}),"function"==typeof define&&(define.amd||define.cmd)?define(function(a,b,c){b.Promise=f}):"object"==typeof module&&module.exports&&(exports.Promise=f),this.Promise=f}();