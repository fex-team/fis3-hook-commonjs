module.exports = function(file, opts) {
  // 不是 js 文件不处理。
  if (!file.isJsLike || file.isPartial) {
    return;
  }

  var content = file.getContent();
  var forceNoWrap = file.wrap === false;
  
  if (!forceNoWrap && file.isMod) {
    
    var deps = '';
    if (opts.forwardDeclaration) {
      var reqs = opts.skipBuiltinModules ? [] : ['\'require\'', '\'exports\'', '\'module\''];

      file.requires.forEach(function(id) {
        var dep = fis.uri(id, file.dirname);
        if (dep.file) {
          if (dep.file.isJsLike) {
            reqs.push('\'' + (dep.file.moduleId || dep.file.id) + '\'');
          }
        } else {
          /(\.\w+)$/.test(id) ? (~opts.extList.indexOf(RegExp.$1) ? reqs.push('\'' + id.replace(/\.js$/i, '') + '\'') : '') : reqs.push('\'' + id + '\'');
        }
      });

      deps = ' [' + reqs.join(', ') + '],';
    }

    var originContent = content;

    if (opts.tab) {
      content = fis.util.pad(' ', opts.tab) + content.split(/\n|\r\n|\r/g).join('\n' + fis.util.pad(' ', opts.tab));
    }

    var prefix = 'define(\'' + (file.moduleId || file.id) + '\',' + deps + ' function(require, exports, module) {\n\n';
    var affix = '\n\n});\n';

    content = prefix + content + affix;

    if (file.moduleId !== file.id) {
      file.extras.moduleId = file.moduleId;
    }

    // 同时修改 sourcemap 文件内容。
    var derived = file.derived;
    if (!derived || !derived.length) {
      derived = file.extras && file.extras.derived;
    }

    if (derived && derived[0] && derived[0].rExt === '.map') {
      var SourceMap = require('source-map');
      

      var sourcemap = derived[0];
      var json = JSON.parse(sourcemap.getContent());
      var smc = new SourceMap.SourceMapConsumer(json);

      var sourceNode = new SourceMap.SourceNode();

      sourceNode.add(prefix);
      sourceNode.add(SourceMap.SourceNode.fromStringWithSourceMap(originContent, smc));
      sourceNode.add(affix);

      var code_map = sourceNode.toStringWithSourceMap({
        file: smc.file
      });

      var generater = SourceMap.SourceMapGenerator.fromSourceMap(new SourceMap.SourceMapConsumer(code_map.map.toJSON()));
      sourcemap.setContent(generater.toString());
    }

    file.setContent(content);
  }
}
