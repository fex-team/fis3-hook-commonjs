var path = require('path');
var inited = false;
var root, baseUrl, pkgs, paths, opts;
var moitJsExtension;

function getJsExtensionMoited() {
  if (typeof moitJsExtension === 'undefined') {
    var testFile = fis.file(fis.project.getProjectPath() + '/test.js');
    // console.log(testFile);

    moitJsExtension = testFile.id !== testFile.moduleId;
  }

  return moitJsExtension;
}

// find package base on folder name
// 根据目录位置查找是否属于某个 package 配置
function findPkgByFolder(folder, list) {
  var ret = null;

  if (list && list.length) {
    list.every(function(item) {
      if (item.folder === folder || path.resolve(baseUrl, item.folder) === folder) {
        ret = item;
        return false;
      }

      return true;
    });
  }

  return ret;
}

// 判读是否为 fis id 格式的路径
function isFISID(filepath) {
  var nsConnector = fis.media().get('namespaceConnector', ':');
  return !!~filepath.indexOf(nsConnector);
}

// 当 require 没有指定后缀时，用来根据后缀查找模块定义。
function findResource(name, filepath, extList) {
  var candidates = [name, path.join(name, 'index')];
  var baseName = path.basename(name);
  if (baseName && baseName !== '.' && baseName !== '..') {
    candidates.push(path.join(name, baseName));
  }
  var info = null;

  candidates.every(function(candidate) {
    info = fis.uri(candidate, filepath);

    for (var i = 0, len = extList.length; i < len && !info.file; i++) {
      info = fis.uri(candidate + extList[i], filepath);
    }

    if (info && info.file) {
      return false;
    }

    return true;
  });

  return info;
}

// -------------------
// 各种查找
// -------------------

// 无后缀查找
function tryNoExtLookUp(info, file, opts) {
  // 支持没有指定后缀的 require 查找。
  return findResource(info.rest, file ? file.dirname : fis.project.getProjectPath(), opts.extList);
}

// fis id 查找
function tryFisIdLookUp(info, file, opts) {
  // 如果是 fis id 路径且属于当前 namespace，也同样做一次查找，从根目录查起
  var nsConnector = fis.media().get('namespaceConnector', ':');
  var idx = info.rest.indexOf(nsConnector);

  if (~idx) {
    info.isFisId = true;

    var ns = info.rest.substring(0, idx);
    var subpath = info.rest.substring(idx + 1);

    if (ns === fis.media().get('namespace')) {
      return findResource(subpath, root, opts.extList);
    }
  }
}

// 基于 BaseUrl 查找
function tryBaseUrlLookUp(info, file, opts) {
  if (root !== baseUrl) {
    return findResource(info.rest, baseUrl, opts.extList);
  }
}

// 基于 Root 查找
function tryRootLookUp(info, file, opts) {
  return findResource(info.rest, root, opts.extList);
}

// 在 Paths 中查找
function tryPathsLookUp(info, file, opts) {
  var id = info.rest;
  var test;

  if (/^([^\/]+)(?:\/(.*))?$/.test(id)) {
    var parts = id.split('/');
    var idx = parts.length;

    while (idx > 0) {
      var prefix = parts.slice(0, idx).join('/');
      var subpath = parts.slice(idx).join('/');

      var dirs;
      if ((dirs = paths[prefix])) {
        for (var i = 0, len = dirs.length;
          (!test || !test.file) && i < len; i++) {
          test = subpath ? findResource(subpath, path.join(baseUrl, dirs[i]), opts.extList) : findResource(dirs[i], baseUrl, opts.extList);
        }
      }
      idx--;
    }
  }

  return test;
}

function tryFolderLookUp(info, file, opts) {
  var id = info.rest;

  if (id === '.' || opts.packages) {
    // 真麻烦，还得去查找当前目录是不是 match 一个 packages。
    // 如果是，得找到 main 的设置。
    var folderName = id[0] === '/' ? path.join(baseUrl, id) : path.join(file.dirname, id);

    var pkg = findPkgByFolder(folderName, opts.packages);

    if (pkg) {
      return findResource(pkg.main || 'main', pkg.folder, opts.extList);
    }
  }
}

// 在 Pacakges 里面查找
function tryPackagesLookUp(info, file, opts) {
  var id = info.rest;

  if (/^([^\/]+)(?:\/(.*))?$/.test(id)) {
    var prefix = RegExp.$1;
    var subpath = RegExp.$2;
    var pkg = pkgs[prefix];

    if (pkg) {
      if (pkg.isFISID) {
        info.isFISID = true;
        info.id = path.join(pkg.folder, subpath || pkg.main || 'main').replace(/\\/g, '/');
        if (!/\.[^\.]+$/.test(info.id)) {
          info.id += '.js';
        }
        info.moduleId = info.id.replace(/\.[^\.]+$/, '');
      } else {
        return findResource(subpath || pkg.main || 'main', pkg.folder, opts.extList);
      }
    }
  }
}

var lookup = module.exports = function(info, file, silent) {
  if (!inited) {
    throw new Error('Please make sure init is called before this.');
  }

  var originPath = info.rest;
  var lookupList = lookup.lookupList || [];

  lookupList.every(function(finder) {
    if (info.file) {
      return false;
    }

    var ret = finder(info, file, opts);

    if (ret && ret.file) {
      info.id = ret.file.getId();
      info.file = ret.file;
      return false;
    } else if (ret === false) {
      return false;
    }

    return true;
  });

  // if (!silent && (!info.file || !info.moduleId)) {
  //   fis.log.warn('Can\'t find resource %s', info.rest.red);
  // }
  //


  // 跨模块引用 js
  if (info.isFISID && !info.file && (/\.js$/.test(info.rest) || !/\.\w+$/.test(info.rest))) {
    info.id = info.rest;
    var mod = getJsExtensionMoited();

    // 只有在省略后缀的模式下才启用。
    if (mod) {
      info.moduleId = info.id.replace(/\.js$/, '');
      info.id = info.moduleId + '.js';
    }
  }

  return info;
}

lookup.lookupList = [
  tryFisIdLookUp,
  tryPathsLookUp,
  tryPackagesLookUp,
  tryFolderLookUp,
  tryNoExtLookUp,
  tryBaseUrlLookUp,
  tryRootLookUp
];

lookup.tryFisIdLookUp = tryFisIdLookUp;
lookup.tryPathsLookUp = tryPathsLookUp;
lookup.tryPackagesLookUp = tryPackagesLookUp;
lookup.tryFolderLookUp = tryFolderLookUp;
lookup.tryNoExtLookUp = tryNoExtLookUp;
lookup.tryBaseUrlLookUp = tryBaseUrlLookUp;
lookup.tryRootLookUp = tryRootLookUp;

lookup.findResource = findResource;

/**
 * 初始化 lookup
 */
lookup.init = function(fis, conf) {
  inited = true;
  opts = conf;
  root = fis.project.getProjectPath();
  baseUrl = path.join(root, opts.baseUrl || '.');
  pkgs = {};
  paths = {};

  // normalize packages.
  // 规整，方便后续查找
  function normalizePackage(parent) {
    parent.packages = parent.packages && parent.packages.map(function (item) {
      if (typeof item === 'string') {
        item = {
          name: item
        };
      }

      var folder = item.location || item.name;

      item.isFISID = isFISID(folder);
      item.folder = item.isFISID ? folder : path.join(baseUrl, item.location || item.name);
      pkgs[item.name] = item;

      if (item.packages) {
        normalizePackage(item)
      }

      return item;
    });
  }

    normalizePackage(opts)

  // normalize paths.
  // 规整，方便后续查找
  opts.paths && (function(obj) {
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];

      if (!Array.isArray(val)) {
        val = [val];
      }

      paths[key] = val;
    });
  })(opts.paths);
}
