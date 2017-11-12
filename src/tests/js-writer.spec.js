
var jsWriter = require('../index');
var functions = require('./fixtures/functions');
var Module = require('module');
var mockFs = require('mock-fs');
var unexpected = require('unexpected');
var fs = require('fs');

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

  it('outputs true', function () {
    expect(jsWriter(true), 'to equal', 'true');
  });
  
  it('outputs false', function () {
    expect(jsWriter(false), 'to equal', 'false');
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
  
  it('creates the same text from a bound function that has been evaled', function () {
    var boundFunctionString = jsWriter(functions.boundContentArgs);
    
    // Look away now
    var reinterpretedFunction;
    eval('reinterpretedFunction = ' + boundFunctionString);
    // You can look back now.
    
    var rereadFunctionString = jsWriter(reinterpretedFunction);
    expect(rereadFunctionString, 'to equal', boundFunctionString);
  });
  
  describe('using Module.load', function () {
    beforeEach(function () {
      mockFs({
        'tmp': {}
      });
    });
    
    afterEach(function () {
      mockFs.restore();
    });
  
    it('creates the same text from a bound function that has been read in via Module.load', function () {
      var original = jsWriter(functions.boundContentArgs);
      fs.writeFileSync('tmp/func.js', 'module.exports = { f: ' + original + ' };');
      var tempModule = new Module('/tmp/func.js', null);
      tempModule.load('tmp/func.js');
      expect(jsWriter(tempModule.exports.f), 'to equal', original);
      expect(jsWriter(functions.boundAndWritten), 'to equal', 'function bound3() { /* bound - native code */ }')
    });
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
  
  it('uses a given handler to write a Date', function () {
    const obj = {
      str: 'foo',
      dt: new Date(2016, 5, 22)
    };
    const options = {
      handlers: {
        'date': function (dt) {
          return 'new Date(' + dt.getTime() + ')';
        }
      }
    };
    expect(jsWriter(obj, options), 'to equal', '{dt:new Date(' + new Date(2016, 5, 22).getTime() + '),str:"foo"}');
  });
  
  it('uses a given handler to write a function', function () {
    const obj = {
      str: 'foo',
      func: function foo(a, b) { return a + b; }
    };
    const options = {
      handlers: {
        'function': function (func) {
          return '"FUNC:' + func.name + '"';
        }
      }
    }
    expect(jsWriter(obj, options), 'to equal', '{func:"FUNC:foo",str:"foo"}');
  });

  it('outpus a Symbol.for', function () {
    const obj = {
      sym: Symbol.for('foo')
    };
    expect(jsWriter(obj), 'to equal', '{sym:Symbol.for("foo")}');
  });

  it('outputs a normal symbol', function () {
    const obj = {
      sym: Symbol('foo')
    };
    // There's no way to serialise a symbol, so we'll just serialise it so it comes back a symbol
    expect(jsWriter(obj), 'to equal', '{sym:Symbol("foo")}');
  });

  it('outputs a symbol without a name', function () {
    const obj = {
      sym: Symbol()
    };
    // There's no way to serialise a symbol, so we'll just serialise it so it comes back a symbol
    expect(jsWriter(obj), 'to equal', '{sym:Symbol()}');
  });
});
