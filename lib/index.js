/**
 * @file 这一个 js 代码转换小工具。
 *
 * 用在 fis-components 将现有 npm 包同步过来时使用。
 *
 * 包含以下功能：
 *
 * - envify  将 process.env.xxx 转换成指定的值。
 * - 全局 global.xxx 转换成 window.xxx, 注意只是全局，如果存在局部变量 global 不处理。
 * - amd => commonjs
 *
 *  @example
 *  define({a:1}) => module.exports = {a:1}
 *
 *  @example
 *  define(function() {return 1;}) => module.exports = 1
 *
 *  @example
 *  define(['a', 'b'], function(a) {
 *      return a;
 *  })
 *
 *  =>
 *
 *  var a = require("a");
 *  require("b");
 *  module.exports = a;
 *
 * 更多转换请查看  test case.
 * @author liaoxuezhi
 */
var jstransform = require('jstransform');
var createEnvifyVisitors = require('./visitors/envify');
var createGlobalVisitors = require('./visitors/global');
var createAmdVisitors = require('./visitors/amd');

module.exports = function (content) {
    var visitors = []
        .concat(createEnvifyVisitors({
            NODE_ENV: 'production'
        }))
        .concat(createGlobalVisitors())
        .concat(createAmdVisitors());

    return jstransform.transform(visitors, content).code;
};
