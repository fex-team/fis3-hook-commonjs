
function xx () {
	var x = require("1.js").test();
console.log("3.js");
console.log(x);
var p = require("../111.js");
console.log(p);
}

exports.test = xx;


