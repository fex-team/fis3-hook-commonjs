/*! http://mths.be/placeholder v2.1.2 by @mathias */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        console.log("wangrui3341");
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        console.log("wangrui3342");
        factory(require('asyncmore/1.js'));
    } else {
        console.log("wangrui3343");
        // Browser globals
        factory(jQuery);
    }
}(function($) {
    
}));