var lang = fis.compile.lang;
var rRequire = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(require\.async|require)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;

module.exports = function(info) {
  var content = info.content;
  var file = info.file;

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
