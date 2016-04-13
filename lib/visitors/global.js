/**
 * @file 将 node 中的 global.xxx 的写法换成 window.xxx
 * @author liaoxuezhi
 */

var Syntax = require('jstransform').Syntax;
var utils = require('jstransform/src/utils');
var util = require('../util');

module.exports = function () {

    /**
     * 当 visitGlobal.test 判断正确后，进出此逻辑
     *
     * 用来将 global.xxx 换成 window.xxx
     *
     * @param  {Function} traverse  可用来继续处理子节点。
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @param  {Object} state state 对象，用来保存对 node 修改状态。
     * @return {boolean} false   [description]
     */
    function visitGlobal(traverse, node, path, state) {

        // 如果当前 scope 中存在 global 变量，则忽略。
        if (util.existsVariable(path, node)) {
            return false;
        }

        utils.catchup(node.range[0], state);
        utils.append('window', state);
        utils.move(node.range[1], state);
        return false;
    }

    /**
     * 判断当前  ast 树是否为 global.xxx 的用法。
     *
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @return {boolean} 返回判断结果。
     */
    visitGlobal.test = function (node, path) {
        return (
            node.type === Syntax.Identifier
                && path[0].type === Syntax.MemberExpression
                && path[0].object === node
                && node.name === 'global'
        );
    };

    return [
        visitGlobal
    ];
};
