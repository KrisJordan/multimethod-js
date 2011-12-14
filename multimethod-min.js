// multimethod.js 0.1.0
//
// (c) 2011 Kris Jordan
//
// Multimethod is freely distributable under the MIT license.
// For details and documentation: 
// [http://krisjordan.com/multimethod-js](http://krisjordan.com/multimethod-js)
(function(){var j=function(){},k=function(g){return g},h=function(g,c){for(var d in c){var b=c[d][0];if(f(g).isEqual(b))return d}return false},l=function(b){return function(c){return c[b]}},b=function(b){var c,d=[],i=j,m=function(){var a=c.apply(this,arguments),a=h(a,d),a=a!==false?d[a][1]:false;return a!==false?a:i},e=function(){var a=m.apply(this,arguments);return f.isFunction(a)?a.apply(this,arguments):a};e.dispatch=function(a){if(f.isFunction(a))c=a;else if(f.isString(a))c=l(a);else throw"dispatch requires a function or a string.";
return this};e.dispatch(b||k);e.when=function(a,b){var c=h(a,d);c!==false?d[c]=[a,b]:d.push([a,b]);return this};e.remove=function(a){a=h(a,d);a!==false&&d.splice(a,1);return this};e["default"]=function(a){i=a;return this};return e};if(typeof exports!=="undefined"){if(typeof module!=="undefined"&&module.exports){exports=module.exports=b;var f=require("underscore")}exports.multimethod=b}else typeof define==="function"&&define.amd?define("multimethod",function(){return b}):(this.multimethod=b,f=this._);
b.version="0.1.0"}).call(this);
