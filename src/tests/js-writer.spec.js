
var jsWriter = require('../index');
var functions = require('./fixtures/functions');
var unexpected = require('unexpected');

var expect = unexpected.clone();


describe('js-writer', function () {
  
  it('outputs a number', function () {
    expect(jsWriter(42), 'to equal', '42');
  });
  
  it('outputs NaN', function () {
    expect(jsWriter(NaN), 'to equal', 'NaN');
  });
  
  it('outputs undefined', function () {
    expect(jsWriter(undefined), 'to equal', 'undefined');
  });
  
  it('outputs null', function () {
    expect(jsWriter(null), 'to equal', 'null');
  });
  
  it('outputs a string', function () {
    expect(jsWriter('foo'), 'to equal', '"foo"');
  });
  
  it('outputs a string with a apostrophe', function () {
    expect(jsWriter('foo\'d'), 'to equal', '"foo\'d"');
  });
  
  it('outputs a string with a line break', function () {
    expect(jsWriter('foo\nd'), 'to equal', '"foo\\nd"');
  });
  
  it('outputs an ES6 string with a line break', function () {
    var lineBreak = `big
string`;
    expect(jsWriter(lineBreak), 'to equal', '"big\\nstring"');
  })
  
  it('outputs an object with simple keys', function () {
    expect(jsWriter({ a: 1, b: 2 }), 'to equal', '{a:1,b:2}')
  });
  
  it('outputs an object with keys containing non-JS characters', function () {
    expect(jsWriter({ 'a-a': 1, 'b foo': 2, c: 3 }), 'to equal', '{"a-a":1,"b foo":2,c:3}')
  });
  
  it('outputs an object with keys starting with digits', function () {
    expect(jsWriter({ '0a': 1, '9foo': 2, c: 3 }), 'to equal', '{"0a":1,"9foo":2,c:3}')
  });
  
  it('outputs inherited enumerable keys of an object', function () {
    var base = { a: 1 };
    var inherited = Object.create(base);
    inherited.b = 2;
    expect(jsWriter(inherited), 'to equal', '{a:1,b:2}')
  });
  
  it('does not output non-enumerable keys of an object', function () {
    var base = { a: 1 };
    var inherited = Object.create(base, {
      b: {
        enumerable: false,
        writable: true
      },
      c: {
        enumerable: true,
        writable: true
      }
    });
    inherited.b = 2;
    inherited.c = 3;
    expect(jsWriter(inherited), 'to equal', '{a:1,c:3}')
  });
  
  it('outputs undefined properties of an object', function () {
    expect(jsWriter({ a: 1, b: undefined }), 'to equal', '{a:1,b:undefined}')
  });
  
  it('outputs null properties of an object', function () {
    expect(jsWriter({ a: 1, b: null }), 'to equal', '{a:1,b:null}')
  });
  
  it('outputs an array', function () {
    expect(jsWriter(['a', 'b', 'c']), 'to equal', '["a","b","c"]')
  });
  
  it('outputs an array of objects', function () {
    expect(jsWriter([{ a: 1, b: 2 }, { c: 2, d: 3 }]), 'to equal', '[{a:1,b:2},{c:2,d:3}]')
  });
  
  it('outputs an anonymous function', function () {
    expect(jsWriter(functions.anonymous), 'to equal', 'function () { /* stuff */ }')
  });
  
  it('outputs an anonymous function with content', function () {
    expect(jsWriter(functions.anonymousContent), 'to equal', 'function () { return 42; }')
  });
  
  it('outputs an anonymous function with args', function () {
    expect(jsWriter(functions.anonymousContentArgs), 'to equal', 'function (a, b) { return a + b; }')
  });
  
  it('outputs a named function with args', function () {
    expect(jsWriter(functions.namedContentArgs), 'to equal', 'function doStuff(a, b) { return a + b; }')
  });
  
  it('outputs a bound function', function () {
    expect(jsWriter(functions.bound), 'to equal', 'function bound1() { /* bound - native code */ }')
  });
  
  it('outputs a bound function with arguments', function () {
    // Note that we can't get access to the original arguments, so the function name will have to do
    expect(jsWriter(functions.boundContentArgs), 'to equal', 'function bound3() { /* bound - native code */ }')
  });
  
  it('outputs a UTC date', function () {
    expect(jsWriter(new Date(Date.parse('2016-10-16T14:00:30Z'))), 'to equal', 'new Date(Date.parse("2016-10-16T14:00:30.000Z"))')
  });
  
  it('outputs the example from the readme', function () {
  
    var stringRepresentation = jsWriter({
      a: 42,
      b: 'foo',
      'big-string': `an ES6 string
with line breaks`,
      getMagic: functions.anonymousContent
    });
    
    expect(stringRepresentation, 'to equal', '{a:42,b:"foo","big-string":"an ES6 string\\nwith line breaks",getMagic:function () { return 42; }}')
  });
});