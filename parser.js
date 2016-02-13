var lang = fis.compile.lang;
var rRequire = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(require\.async|require)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;
var path = require('path')

var vars = {
  process: function () {
    return 'var process = require(\'process/browser\')';
  },
  global: function () {
    return 'var global = typeof global !== "undefined" ? global : '
        + 'typeof self !== "undefined" ? self : '
        + 'typeof window !== "undefined" ? window : {}'
        ;
  },
  'Buffer.isBuffer': function () {
    return 'Buffer = Buffer || {}; Buffer.isBuffer = require("is-buffer")';
  },
  Buffer: function () {
    return 'var assign = require("object-assign"); ' +
           'var Buffer = assign(Buffer || {}, require("buffer").Buffer)';
  },
  __filename: function (file, basedir) {
    var filename = '/' + path.relative(basedir, file);
    return JSON.stringify(filename);
  },
  __dirname: function (file, basedir) {
    var dir = path.dirname('/' + path.relative(basedir, file));
    return JSON.stringify(dir);
  }
};

module.exports = function(info) {
  var content = info.content;

  if (fis.get('component.type') === 'node_modules') {
    var pushContent = [];

    Object.keys(vars).forEach(function (name) {
      if (RegExp('\\b' + name + '\\b').test(content)) {
        pushContent.push(vars[name]())
      }
    })

    content = pushContent.join('\n') + '\n' + content;
  }

  info.content = content.replace(rRequire, function(m, comment, type, params) {
    if (type) {
      switch (type) {
        case 'require.async':
          var info = parseParams(params);

          m = 'require.async([' + info.params.map(function(v) {
            var type = lang.jsAsync;
            return type.ld + v + type.rd;
          }).join(',') + ']';
          break;

        case 'require':
          var info = parseParams(params);
          var async = info.hasBrackets;

          m = 'require(' + (async ? '[' : '') + info.params.map(function(v) {
            var type = lang[async ? 'jsAsync' : 'jsRequire'];
            return type.ld + v + type.rd;
          }).join(',') + (async ? ']' : '');
          break;
      }
    }

    return m;
  });
}

function parseParams(value) {
  var hasBrackets = false;
  var params = [];

  value = value.trim().replace(/(^\[|\]$)/g, function(m, v) {
    if (v) {
      hasBrackets = true;
    }
    return '';
  });
  params = value.split(/\s*,\s*/);

  return {
    params: params,
    hasBrackets: hasBrackets
  };
}
