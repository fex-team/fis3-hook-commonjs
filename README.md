# fis3-hook-commonJs

fis3 已经默认不自带模块化开发支持，那么如果需要采用 commonJs 规范作为模块化开发，请使用此插件。

请配合 [mod.js](https://github.com/fex-team/mod/blob/master/mod.js) 一起使用。

## 安装

全局安装或者本地安装都可以。

```
npm install -g fis3-hook-commonJs
```

或者

```
npm install fis3-hook-commonJs
```

## 用法

在 fis-conf.js 中加入以下代码。


```js
fis.hook('commonJs', {
  // 配置项
});
```

## 配置项

* `baseUrl` 默认为 `.` 即项目根目录。用来配置模块查找根目录。
* `paths` 用来设置别名，路径基于 `baseUrl` 设置。
  
  ```js
  fis.hook('commonJs', {
    paths: {
      $: '/modules/jquery/jquery-1.11.2.js'
    }
  });
  ```
* `packages` 用来配置包信息，方便项目中引用。
  
  ```js
  fis.hook('commonJs', {
    packages: [
      {
        name: 'foo',
        location: './modules/foo',
        main: 'index.js'
      }
    ]
  });
  ```

  * 当 `require('foo')` 的时候等价于 `require('/modules/foo/index.js')`.
  * 当 `require('foo/a.js')` 的时候，等价于 `require('/modules/foo/a.js')`.
* `forwardDeclaration` 默认为 `false`, 用来设置是否开启依赖前置，根据前端加载器来定，mod.js 是不需要的。
* `skipBuiltinModules` 默认为 `true`, 只有在 `forwardDeclaration` 启动的时候才有效，用来设置前置依赖列表中是否跳过内置模块如： `require`, `module`, `exports`。
* `extList` 默认为 `['.js', '.coffee', '.jsx', '.es6']`，当引用模块时没有指定后缀，该插件会尝试这些后缀。
* `tab` 默认为 `2`, 用来设置包裹时，内容缩进的空格数。
