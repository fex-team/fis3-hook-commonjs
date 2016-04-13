/**
 * @file 测试 lib/visitors/envify 中各种 case
 * @author liaoxuezhi
 */
var jstransform = require('jstransform');
var createVisitors = require('../lib/visitors/envify');
var should = require('should');

describe('Envify', function () {

    it('convert `process.env.NODE_ENV` to `"test"`?', function () {

        var input = 'if (process.env.NODE_ENV === "production") {alert(1);}';
        var expected = 'if ("test" === "production") {alert(1);}';
        var output = jstransform.transform(createVisitors({
            NODE_ENV: 'test'
        }), input).code;

        should(output).be.exactly(expected);
    });
});
