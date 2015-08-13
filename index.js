var path = require('path');
var lookup = require('./lookup.js');
var wrapJs = require('./wrap.js');
var parseJs = require('./parser.js');

// 程序入口
var entry = module.exports = function(fis, opts) {
  lookup.init(fis, opts);

  fis.on('lookup:file', lookup);
  fis.on('standard:js', parseJs);
  fis.on('compile:postprocessor', function(file) {
    wrapJs(file, opts);
  });
};

entry.defaultOptions = {

  // 是否前置依赖，如果是 mod.js 千万别配置成 true
  // 给那种自己实现 loader 的用户使用的。
  forwardDeclaration: false,

  // 当前置依赖启动的时候才有效，用来控制是否把内建的 `require`, `exports`, `module` 从第二个参数中去掉。
  skipBuiltinModules: true,

  // 用来查找无后缀资源的
  extList: ['.js', '.coffee', '.jsx', '.es6'],

  // 设置包裹时，内容缩进的空格数。
  tab: 2
};
