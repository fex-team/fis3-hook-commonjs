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
          /(\..+)$/.test(id) ? (~opts.extList.indexOf(RegExp.$1) ? reqs.push('\'' + id.replace(/\.js$/i, '') + '\'') : '') : reqs.push('\'' + id + '\'');
        }
      });

      deps = ' [' + reqs.join(', ') + '],';
    }

    if (opts.tab) {
      content = fis.util.pad(' ', opts.tab) + content.split(/\n|\r\n|\r/g).join('\n' + fis.util.pad(' ', opts.tab));
    }

    content = 'define(\'' + (file.moduleId || file.id) + '\',' + deps + ' function(require, exports, module) {\n\n' + content + '\n\n});\n';

    if (file.moduleId !== file.id) {
      file.extras.moduleId = file.moduleId;
    }

    file.setContent(content);
  }
}
