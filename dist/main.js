!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.falx=t():e.falx=t()}(window,function(){return function(e){var t={};function n(u){if(t[u])return t[u].exports;var r=t[u]={i:u,l:!1,exports:{}};return e[u].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,u){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:u})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.factory=function(e){return function(t){var n={cb:t,unsubscribe:function(){var t=e.indexOf(n);e.splice(t,1)}};return e.push(n),n}}},function(e,t){var n="\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",u="["+n+"]",r="\\d+",f="[\\u2700-\\u27bf]",o="[a-z\\xdf-\\xf6\\xf8-\\xff]",i="[^\\ud800-\\udfff"+n+r+"\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde]",c="(?:\\ud83c[\\udde6-\\uddff]){2}",a="[\\ud800-\\udbff][\\udc00-\\udfff]",s="[A-Z\\xc0-\\xd6\\xd8-\\xde]",d="(?:"+o+"|"+i+")",l="(?:"+s+"|"+i+")",p="(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?",b="[\\ufe0e\\ufe0f]?"+p+("(?:\\u200d(?:"+["[^\\ud800-\\udfff]",c,a].join("|")+")[\\ufe0e\\ufe0f]?"+p+")*"),x="(?:"+[f,c,a].join("|")+")"+b,v=RegExp([s+"?"+o+"+(?:['’](?:d|ll|m|re|s|t|ve))?(?="+[u,s,"$"].join("|")+")",l+"+(?:['’](?:D|LL|M|RE|S|T|VE))?(?="+[u,s+d,"$"].join("|")+")",s+"?"+d+"+(?:['’](?:d|ll|m|re|s|t|ve))?",s+"+(?:['’](?:D|LL|M|RE|S|T|VE))?","\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])","\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])",r,x].join("|"),"g");e.exports=function(e){return e.match(v)||[]}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.BehaviorSubject=void 0;var u=n(0);t.BehaviorSubject=function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),r.call(this),this.value=t};var r=function(){var e=this;this.value=void 0,this.getValue=function(){return e.value},this.subscriptions=[],this.subscribe=(0,u.factory)(this.subscriptions),this.next=function(t,n){e.value=t,e.subscriptions.forEach(function(e){e.cb(t,n)})}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.store=void 0;var u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var u in n)Object.prototype.hasOwnProperty.call(n,u)&&(e[u]=n[u])}return e};t.register=function(e,t){s[e]=new f.BehaviorSubject(t.state),b[e]={},v(e),p.dispatch({type:"REGISTER_REDUCER",payload:[t.state]});var n=function(n){b[e][n]=function(){var u,r=Promise.resolve((u=t.actions[n]).call.apply(u,[null,s[e].getValue()].concat(function(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}(Array.from(arguments))))),f={type:y(n),payload:Array.from(arguments)};return function(e,t){return x.reduce(function(e,n){return e.then(function(e){return n(p,Promise.resolve(e),t)})},Promise.resolve(e))}(r,f).then(function(t){s[e].next(t,f),p.dispatch(f)})}};for(var u in t.actions)n(u)},t.subscribe=function(e,t){return s[e].subscribe(function(n){t(u(a({},e,n),b[e]))})},t.use=h,t.unuse=function(e){x=x.filter(function(t){return t!=e})},t.enhanceStore=function e(n,u){void 0!==u&&(t.store=p=u(e)(n),function(){for(var e in s)v(e)}());"function"==typeof n&&h(function(e,t,u){return t.then(function(e){return n(e,u)})});return p};var r,f=n(2),o=n(1),i=(r=o)&&r.__esModule?r:{default:r},c=n(0);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var s={},d=[];function l(){var e={};for(var t in s)e[t]=s[t].getValue();return e}var p=t.store={getState:l,subscribe:(0,c.factory)(d),dispatch:function(e){d.forEach(function(t){t.cb(l(),e)})}},b={},x=[];function v(e){Object.defineProperty(p,e,{get:function(){return function(e){return u(a({},e,s[e].getValue()),b[e])}(e)}})}function h(e){x.push(e)}var y=function(e){return(0,i.default)(e).map(function(e){return e.toUpperCase()}).join("_")}}])});