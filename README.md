# fis3-hook-commonjs

fis3 已经默认不自带模块化开发支持，那么如果需要采用 commonjs 规范作为模块化开发，请使用此插件。

请配合 [mod.js](https://github.com/fex-team/mod/blob/master/mod.js) 一起使用。

注意：需要对目标文件设置 `isMod` 属性，说明这些文件是模块化代码。


```js
fis.match('/modules/**.js', {
  isMod: true
})
``` 

这样才会被自动包装成 `amd`，才能在浏览器里面运行（当然还得依靠 mod.js）。

另外：如果发现某些 js 已经设置了 `isMod` 但是没有包装成 amd, 莫急，一定是那个 js 里面已经写了 `define` 语句了，这个插件认为他已经是模块化了的。
但是如果坚持一定要包装成 amd 怎么办？加个 `wrap` 为 `true` 的属性就行了。

```js
fis.match('/xxxx.js', {
  isMod: true,
  wrap: true
})
```

## 安装

全局安装或者本地安装都可以。

```
npm install -g fis3-hook-commonjs
```

或者

```
npm install fis3-hook-commonjs
```

## 用法

在 fis-conf.js 中加入以下代码。


```js
fis.hook('commonjs', {
  // 配置项
});
```

## 配置项

* `baseUrl` 默认为 `.` 即项目根目录。用来配置模块查找根目录。
* `paths` 用来设置别名，路径基于 `baseUrl` 设置。
  
  ```js
  fis.hook('commonjs', {
    paths: {
      $: '/modules/jquery/jquery-1.11.2.js'
    }
  });
  ```
* `packages` 用来配置包信息，方便项目中引用。
  
  ```js
  fis.hook('commonjs', {
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
