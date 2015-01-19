/*
 * JavaScript Pretty Date
 * Modified 2013 by Alfred Xing (alfredxing.com)
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

function prettyDate(time) {
    var date = new Date(time);

    var diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400),
            out = "Some time ago";

    switch (true) {
        case diff < 60:
            out = "Just now";
            break;
        case diff < 120:
            out = "1 minute ago";
            break;
        case diff < 3600:
            out = Math.floor(diff / 60) + " minutes ago";
            break;
        case diff < 7200:
            out = "1 hour ago";
            break;
        case diff < 86400:
            out = Math.floor(diff / 3600) + " hours ago";
            break;
        case day_diff == 1:
            out = "Yesterday";
            break;
        case day_diff < 7:
            out = day_diff + " days ago";
            break;
        case day_diff < 31:
            var day = date.getDate();
            var month = date.getMonth();
            var x = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            out = day + " " + x[month];
            break;
        case day_diff < 366:
            var day = date.getDate();
            var month = date.getMonth();
            var x = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            out = day + " " + x[month];
            break;
        case day_diff > 365:
            var day = date.getDate();
            var month = date.getMonth();
            var x = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            out = day + " " + x[month] + " " + date.getFullYear();
            break;
    }

    return out;

}

if (typeof jQuery != "undefined") {
    jQuery.fn.prettyDate = function () {
        return this.each(function () {
            var date = prettyDate(this.text);
            if (date) {
                jQuery(this).text(date);
            }
        });
    };
}
