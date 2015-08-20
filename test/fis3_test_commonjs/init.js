// define(function(require, exports, module) {
//     // var $ = require('./module/jquery.js');
//     var $ = require("abc");
//     var data = require('module');
//     var b  = require('module/b');

//     b();
//     $('.author').html(data.author);
//     $('.blog').attr('href', data.blog);
// });


// require.config({
//     paths: {
//         jquery: './module/jquery',
//         data: 'module/data',
//         b: 'module/b'
//     }
// });

require(['abc','module','./module/b',"./module2/cc","cc2"], function($,data,b,cp,cc2) {
  	console.log("123");
  	var x = require("./module/b");
  	console.log(x);
  	b();
  	cp();
    $('.author').html(data.author);
    $('.blog').attr('href', data.blog);
});

//require(["cc2"]);
