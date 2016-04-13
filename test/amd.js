/**
 * @file 测试 lib/visitors/amd 中各种 case
 * @author liaoxuezhi
 */
var jstransform = require('jstransform');
var createVisitors = require('../lib/visitors/amd');
var should = require('should');

describe('amd 2 commonjs', function () {

    it('(factory) & return simple variable', function () {

        var input = 'define(function(){return 1;});';
        var expected = 'module.exports = 1;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(factory) & return object.', function () {

        var input = 'define(function(){return {a:1};});';
        var expected = 'module.exports = {a:1};';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(deps, factory) & return number.', function () {

        var input = 'define(["a", "b"], function(){return 1;});';
        var expected = 'require("a");\nrequire("b");\nmodule.exports = 1;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(deps, factory with args) & return number.', function () {

        var input = 'define(["a", "b"], function(a){return 1;});';
        var expected = 'var a = require("a");\nrequire("b");\n'
            + 'module.exports = 1;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(number)', function () {

        var input = 'define(1);';
        var expected = 'module.exports = 1;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(string)', function () {

        var input = 'define("a");';
        var expected = 'module.exports = "a";';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(object)', function () {

        var input = 'define({a: 1});';
        var expected = 'module.exports = {a: 1};';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(Identifier ref to a function)', function () {

        var input = 'function a(){};define(a);';
        var expected = 'function a(){};module.exports = typeof '
            + 'a === \'function\' ? a() : a;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(deps, Identifier ref to a function)', function () {

        var input = 'function a(){};define(["cc"], a);';
        var expected = 'function a(){};module.exports = typeof '
            + 'a === \'function\' ? a(require("cc")) : a;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('(deps, Identifier ref to a variable)', function () {

        var input = 'var a = 1;define(a);';
        var expected = 'var a = 1;module.exports = typeof a === \'function\''
            + ' ? a() : a;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('ignore local amd.', function () {

        var input = '(function(){var define = function() {}; define({})})();';
        var expected = '(function(){var define = function() {}; '
            + 'define({})})();';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });
});
