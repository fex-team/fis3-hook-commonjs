/**
 * @file amd to commonjs
 * @author liaoxuezhi
 */

var Syntax = require('jstransform').Syntax;
var utils = require('jstransform/src/utils');
var util = require('../util');

/**
 * 创建 jstransform 的 visitors
 *
 * @return {Array} visitors
 */
module.exports = function () {

    /**
     * jstransform 回调函数
     *
     * 当当前 ast 语句是 define 语句时，进入此逻辑。
     * 用来将 amd 转换成 commonjs
     *
     * @param  {Function} traverse 可用来继续处理子节点。
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @param  {Object} state state 对象，用来保存对 node 修改状态。
     * @return {boolean} false
     */
    function visitDefine(traverse, node, path, state) {

        // 获取 define 语句中的最后一个参数，一般为 factory
        var factory = node.arguments[node.arguments.length - 1];
        var deps;
        var elements;

        utils.catchup(node.range[0], state);

        // 如果是 factory function
        if (factory.type === Syntax.FunctionExpression) {
            var body = factory.body.body;
            deps = node.arguments[node.arguments.length - 2];

            if (deps && deps.type === Syntax.ArrayExpression) {
                elements = deps.elements;
                var params = factory.params;

                elements.forEach(function (element, index) {
                    if (params[index]) {
                        utils.append('var ', state);
                        utils.move(params[index].range[0], state);
                        utils.catchup(params[index].range[1], state);
                        utils.append(' = ', state);
                    }

                    utils.append('require(', state);
                    utils.move(element.range[0], state);
                    utils.catchup(element.range[1], state);
                    utils.append(');\n', state);
                });
            }

            utils.move(body[0].range[0], state);
            path.unshift(node);
            body.forEach(function (node) {
                utils.catchup(node.range[0], state);
                path.unshift(node);
                traverse(node, path, state);
                path.shift();
            });
            path.shift();
            utils.move(node.range[1], state);
        }

        // 如果最后一个参数是对象。
        else if (factory.type === Syntax.ObjectExpression
            || factory.type === Syntax.Literal) {
            utils.append('module.exports = ', state);
            utils.move(factory.range[0], state);
            utils.catchup(factory.range[1], state);
            utils.move(node.range[1], state);
        }

        // 如果最后一个参数是变量
        else if (factory.type === Syntax.Identifier) {
            utils.append('module.exports = typeof ' + factory.name, state);
            utils.append(' === \'function\' ? ', state);

            utils.append(factory.name + '(', state);

            deps = node.arguments[node.arguments.length - 2];
            if (deps && deps.type === Syntax.ArrayExpression) {
                elements = deps.elements;

                utils.append(elements.map(function (element) {
                    return 'require("' + element.value + '")';
                }).join(', '), state);
            }

            utils.append(')', state);

            utils.append(' : ', state);
            utils.move(factory.range[0], state);
            utils.catchup(factory.range[1], state);


            utils.move(node.range[1], state);
        }

        return false;
    }

    /**
     * 判断当前 ast 树是否为 define 语句。
     *
     * @param  {Object} node  节点
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @return {boolean} 返回判断结果
     */
    visitDefine.test = function (node, path) {
        return isDefine(node, path);
    };

    /**
     * jstransform 回调函数
     *
     * 当 ast 树为 define factory 中的 return 语句时进入。
     *
     * @param  {Function} traverse  可用来继续处理子节点。
     * @param  {Object} node 当前节点。
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @param  {Object} state state 对象，用来保存对 node 修改状态。
     * @return {boolean} false
     */
    function visitReturnInFactory(traverse, node, path, state) {
        utils.catchup(node.range[0], state);
        utils.move(node.argument.range[0], state);
        utils.append('module.exports = ', state);
        utils.catchup(node.range[1] - 1, state);
        return false;
    }

    /**
     * 判断当前 ast 树是否为 define factory 中的 return 语句。
     *
     * @param  {Object} node  节点
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @return {boolean} 返回判断结果
     */
    visitReturnInFactory.test = function (node, path) {
        if (isReturn(node) && isDefine(path[1], path.slice(1))) {
            return true;
        }

        return false;
    };

    /**
     * 判断是否为 define 语句
     *
     * @inner
     * @param  {Object} node 节点
     * @param  {Array} path 路径数组，包含进入该节点前的父级节点。
     * @return {boolean} 返回判断结果。
     */
    function isDefine(node, path) {
        if (node.type === Syntax.CallExpression
            && node.callee.type === Syntax.Identifier
            && node.callee.name === 'define') {

            // 查找当前作用域和父级作用域，如果存在 define 的定义，则不转换。
            // 此类情况一般都是内部 amd 实现。
            if (!util.existsFunction(path, node.callee)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 判断是否为 return 语句。
     *
     * @inner
     * @param  {Object} node  节点
     * @return {boolean} 返回判断结果。
     */
    function isReturn(node) {
        return node.type === Syntax.ReturnStatement;
    }

    return [
        visitDefine,
        visitReturnInFactory
    ];
};
