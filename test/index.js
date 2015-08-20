/**
 * Created by ryan on 15/8/17.
 */

var fs = require('fs'),
  path   = require('path');
var fis = require('fis3');
var _      = fis.util,
  config = fis.config;
var expect = require('chai').expect;
var _release = fis.require('command-release/lib/release.js');
var _deploy = fis.require('command-release/lib/deploy.js');
var _self = require('../');

function release(opts, cb) {
  opts = opts || {};

  _release(opts, function(error, info) {
    _deploy(info, cb);
  });
}

function hookSelf(opts) {
  var key = 'modules.hook';
  var origin = fis.get(key);

  if (origin) {
    origin = typeof origin === 'string' ? origin.split(/\s*,\s*/) : (Array.isArray(origin) ? origin : [origin]);
  } else {
    origin = [];
  }

  origin.push(function(fis) {
    var options = {};
    _.assign(options, _self.defaultOptions);
    _.assign(options, opts);
    return _self.call(this, fis, options);
  });

  fis.set(key, origin);
}

describe('fis3-hook-commonjs ', function() {
  var root = path.join(__dirname, 'fis3_test_commonjs');
  fis.project.setProjectRoot(root);
  beforeEach(function() {
    // default settings. fis3 release
    var root2 = path.join(__dirname, 'xpy');
    _.del(root2);

    fis.match('*', {
      deploy: fis.plugin('local-deliver', {
        to: root2
      })
    });
    fis.media().set("namespaceConnector",":");
    
    hookSelf({
      baseUrl: ".",
      forwardDeclaration: true,//依赖前置,
      skipBuiltinModules: false,
      paths: {
        abc: '/module/jquery.js'
      },
      packages: [
        {
          name: 'module',
          location: './module',
          main: 'data.js',
          common: 'module/data.js'

        },
        {
          name: 'abc',
          location: './module',
          main: 'jquery.js'
        },
        {
          name: 'cc',
          location: './module2/cc',
          main: 'c.js'
        },
        {
          name: 'cc2',
          location: 'common:module2/cc',
          main: 'c.js'
        }
      ],
      shim: {
        'module/b.js': {
          deps: ['module/a.js'],
          exports: 'xc'
        }
      }
    });
    fis.match('::packager', {
      postpackager: fis.plugin('loader', {
        //allInOne: {
        //  ignore: '**/a.js',
        //  includeAsyncs: true,
        //  css:"pkg/aa.css"
        //
        //},
        scriptPlaceHolder: "<!--SCRIPT_PLACEHOLDER-->",
        stylePlaceHolder: '<!--STYLE_PLACEHOLDER-->',
        resourcePlaceHolder: '<!--RESOURCEMAP_PLACEHOLDER-->',
        resourceType: 'auto',
        processor: {
          '.html': 'html'
        },
        obtainScript: true,
        obtainStyle: true,
        useInlineMap: false
      })

    });
// fis3 release production
    fis
      .match('**', {
        useHash: false,
        release: '/static/$0'
        // domain: 'http://aaaaa.baidu.com/xpy'

      })

      .match('demo.js', {
        //optimizer: fis.plugin('uglify-js'),
        packTo: "x.js",
        isMod: true
      })
      .match('demo2.js', {
        //optimizer: fis.plugin('uglify-js'),
        packTo: "x.js",
        isMod: false
      })
      .match('init.js', {
        //optimizer: fis.plugin('uglify-js'),
        packTo: "x.js",
        isMod: true
      })
      .match('module/a.js', {
        // packTo: "x.js",
        isMod: true
      })
      .match('module/b.js', {
        //optimizer: fis.plugin('uglify-js'),
        packTo: "x.js",
        isMod: true
      })
      .match('module2/**.js', {
        // optimizer: fis.plugin('uglify-js'),
        // packTo: "x.js",
        isMod: true
      })
      .match('*.{css,scss}', {
        optimizer: fis.plugin('clean-css')
      })

      .match('*.png', {
        optimizer: fis.plugin('png-compressor')
      });

  });

  it('compile cmd JS file', function() {
    release({
      unique: true
    }, function() {
      console.log('Done');
    });
    var pathx = path.join(__dirname, 'xpy' , 'static' , 'map.json');
    var file = fis.file.wrap(pathx);
    var con = file.getContent()

    //console.log(JSON.parse(con).res["demo.js"].extras);
    var xpath = JSON.stringify(JSON.parse(con).res["demo.js"].extras);
    expect(xpath).to.equal('{"async":["demo3.js","common:module2/cc/c.js"],"moduleId":"demo"}');

    //console.log(JSON.parse(con).res["init.js"].deps);
    var xpath = JSON.stringify(JSON.parse(con).res["init.js"].deps);
    expect(xpath).to.equal('["module/b.js"]');

    var xpath = JSON.stringify(JSON.parse(con).res["init.js"].extras);
    expect(xpath).to.equal('{"async":["module/jquery.js","module/data.js","module/b.js","module2/cc/c.js","common:module2/cc/c.js"],"moduleId":"init"}');

    var xpath = JSON.stringify(JSON.parse(con).pkg);
    expect(xpath).to.equal('{"p0":{"uri":"/static/x.js","type":"js","has":["demo.js","demo2.js","module/b.js","init.js"],"deps":["common:module2/cc/c.js","common:static/a.js","module/a.js"]}}');

    //console.log(JSON.parse(con).res["init.js"].deps);
    var xpath = JSON.stringify(JSON.parse(con).res["mod.js"].uri);
    expect(xpath).to.equal('"/static/mod.js"');

    //console.log(JSON.parse(con).res["init.js"].deps);
    var xpath = JSON.stringify(JSON.parse(con).res["module2/111.js"]);
    expect(xpath).to.equal('{"uri":"/static/module2/111.js","type":"js","extras":{"moduleId":"module2/111"},"deps":["module2/asyncmore/1.js"]}');

    //console.log(JSON.parse(con).res["init.js"].deps);
    var xpath = JSON.stringify(JSON.parse(con).res["demo2.js"].extras);
    expect(xpath).to.equal('{"async":["data.js"]}');

  });

});

