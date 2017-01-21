
function bound1() { /* stuff */ }
function bound2() { return 42; }
function bound3(a, b) { return a + b; }

var someObject = {};

module.exports = {
  anonymous: function () { /* stuff */ },
  anonymousContent: function () { return 42; },
  anonymousContentArgs: function (a, b) { return a + b; },
  named: function doStuff() { /* stuff */ },
  namedContent: function doStuff() { return 42; },
  namedContentArgs: function doStuff(a, b) { return a + b; },
  bound: bound1.bind(someObject),
  boundContent: bound2.bind(someObject),
  boundContentArgs: bound3.bind(someObject),
  boundAndWritten: function bound3() { /* bound - native code */ }
};