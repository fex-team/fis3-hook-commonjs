/**
 * @file 用来聚集常用的函数。
 * @author liaoxuezhi
 */

var Syntax = require('jstransform').Syntax;
var escope = require('escope');

function eachScope(paths, iterator) {
    var rootAst = paths[paths.length - 1];
    var scopeManager = rootAst.__sm || (rootAst.__sm = escope.analyze(rootAst));

    paths.every(function (node) {
        if (node.type === Syntax.FunctionExpression
            || node.type === Syntax.Program) {

            var scope = scopeManager.acquire(node);

            // 返回 false 可以中断循环
            if (iterator(scope, node)) {
                return false;
            }
        }
        return true;
    });
}

/**
 * 检查某个变量是否在当前作用域中定义过。
 *
 * @param {Array} paths ast node 节点路径。
 * @param {Object} identifier 需要查找的标识节点。
 * @return {boolean} true or false
 */
exports.existsVariable = function (paths, identifier) {
    var found = false;
    eachScope(paths, function (scope) {
        scope.references.every(function (reference) {
            if (reference.identifier === identifier) {
                found = !!reference.resolved;
                return false;
            }

            return true;
        });

        // if not resolved, check the vaiables set.
        if (!found) {
            scope.variables.every(function (variable) {
                if (variable.name === identifier.name) {
                    found = true;
                    return false;
                }

                return true;
            });
        }

        return found;
    });

    return found;
};

/**
 * 检查某个方法是否在当前作用域中定义。
 *
 * @param {Array} paths ast node 节点路径。
 * @param {Object} identifier 需要查找的标识节点。
 * @return {boolean} true or false
 */
exports.existsFunction = function (paths, identifier) {
    var found = false;

    eachScope(paths, function (scope) {
        scope.references.every(function (reference) {
            if (reference.identifier === identifier) {
                found = !!reference.resolved;
                return false;
            }

            return true;
        });

        return found;
    });

    return found;
};
