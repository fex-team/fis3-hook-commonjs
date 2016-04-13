/**
 * @file 将 process.env 换成指定的值。为了在浏览器中能正确运行。
 * @author liaoxuezhi
 */
var Syntax = require('jstransform').Syntax;
var utils = require('jstransform/src/utils');

module.exports = function (env) {

    /**
     * jstransform 回调函数
     *
     * 当前 ast 树满足 visitProcessEnv.test 时进入此方法。
     * 用来将 process.env.xxx 替换成指定的值。
     *
     * @param  {Function} traverse  可用来继续处理子节点。
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @param  {Object} state state 对象，用来保存对 node 修改状态。
     * @return {boolean} false
     */
    function visitProcessEnv(traverse, node, path, state) {
        var key = node.property.name || node.property.value;

        var value = env[key];
        if (value !== undefined) {
            replaceEnv(node, state, value);
        }

        return false;
    }

    /**
     * 内部方法，用来替换 env 语句
     *
     * @inner
     * @param  {Object} node  节点
     * @param  {Object} state state 对象
     * @param  {string} value 用来替换的值
     */
    function replaceEnv(node, state, value) {
        utils.catchup(node.range[0], state);
        utils.append(JSON.stringify(value), state);
        utils.move(node.range[1], state);
    }

    /**
     * 判断当前 ast 节点是否为 process.env 语句
     *
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @return {boolean} 返回判断结果。
     */
    visitProcessEnv.test = function (node, path) {
        return node.type === Syntax.MemberExpression

            // 忽略赋值语句
            && !(path[0].type === Syntax.AssignmentExpression

            // 必须是 process.env 而不是 xxx.process.env
            && path[0].left === node)
            && node.property.type === (node.computed
                ? Syntax.Literal : Syntax.Identifier)

            // 检测 process.env ast 树
            && node.object.computed === false
            && node.object.type === Syntax.MemberExpression
            && node.object.object.type === Syntax.Identifier
            && node.object.object.name === 'process'
            && node.object.property.type === Syntax.Identifier
            && node.object.property.name === 'env';
    };

    return [
        visitProcessEnv
    ];
};
