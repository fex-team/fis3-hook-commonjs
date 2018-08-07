const SourceMap = require('source-map');

module.exports = function(file, opts) {
  // 不是 js 文件不处理。
  if (!file.isJsLike || file.isPartial) {
    return;
  }

  let content = file.getContent();
  const forceNoWrap = file.wrap === false;

  if (!forceNoWrap && file.isMod) {
    let deps = '';
    if (opts.forwardDeclaration) {
      const reqs = opts.skipBuiltinModules ? [] : ['\'require\'', '\'exports\'', '\'module\''];

      file.requires.forEach(function(id) {
        const dep = fis.uri(id, file.dirname);
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

    const originContent = content;

    if (opts.tab) {
      content = fis.util.pad(' ', opts.tab) + content.split(/\n|\r\n|\r/g).join('\n' + fis.util.pad(' ', opts.tab));
    }

    const prefix = 'define(\'' + (file.moduleId || file.id) + '\',' + deps + ' function(require, exports, module) {\n\n';
    const affix = '\n\n});\n';

    content = prefix + content + affix;

    if (file.moduleId !== file.id) {
      file.extras.moduleId = file.moduleId;
    }

    // 同时修改 sourcemap 文件内容。
    const derived = file.derived;
    if (!derived || !derived.length) {
      derived = file.extras && file.extras.derived;
    }

    if (derived && derived[0] && derived[0].rExt === '.map') {
      try {
        const sourcemap = derived[0];
        const json = JSON.parse(sourcemap.getContent());

        new SourceMap.SourceMapConsumer(json).then((smc => {
          const sourceNode = new SourceMap.SourceNode();

          sourceNode.add(prefix);
          sourceNode.add(SourceMap.SourceNode.fromStringWithSourceMap(originContent, smc));
          sourceNode.add(affix);

          const code_map = sourceNode.toStringWithSourceMap({
            file: smc.file
          });

          new SourceMap.SourceMapConsumer(code_map.map.toJSON()).then(smp => {
            const generater = SourceMap.SourceMapGenerator.fromSourceMap(smp);
            sourcemap.setContent(generater.toString());
            // file.setContent(content);
          });
        }));
      } catch (e) {
        fis.log.warn('SourceMap Merge Error: %s\n%s', e.message, e.stack);
      }
    }

    file.setContent(content);
  }
}
