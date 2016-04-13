/**
 * @file 测试 lib/visitors/global 中各种 case
 * @author liaoxuezhi
 */
var jstransform = require('jstransform');
var createVisitors = require('../lib/visitors/global');
var should = require('should');

describe('Globl => window', function () {

    it('convert `global.myvar` = `window.myvar`', function () {

        var input = 'global.myvar = 123;';
        var expected = 'window.myvar = 123;';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });

    it('Do not convert `global.myvar` = `window.myvar` while there is a '
        + 'variable named with `global`', function () {

            var input = 'var global = {};global.myvar = 123;';
            var expected = 'var global = {};global.myvar = 123;';
            var output = jstransform.transform(createVisitors(), input).code;

            should(output).be.exactly(expected);
        });

    it('Do not convert `global.myvar` = `window.myvar` while there is a '
        + 'variable named with `global` in global scope.', function () {

            var input = 'var global = {};(function() {global.myvar = 123;})();';
            var expected = 'var global = {};(function() {global.myvar = 123;})();';
            var output = jstransform.transform(createVisitors(), input).code;

            should(output).be.exactly(expected);
        });

    it('Do not conflict in different scopes.', function () {

        var input = '(function() {var global = {};global.myvar = 123;})();'
            + '(function() {global.myvar = 123;})();';
        var expected = '(function() {var global = {};global.myvar = 123;})();'
            + '(function() {window.myvar = 123;})();';
        var output = jstransform.transform(createVisitors(), input).code;

        should(output).be.exactly(expected);
    });
});
