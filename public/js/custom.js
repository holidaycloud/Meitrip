//MAGNIFIC POPUP
$(document).ready(function() {
    $('.images-block').magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery: {
            enabled: true
        }
    });

    $('.btn-cart').click(function(){
        window.location = "/cart"
    });

});

(function($) {

    "use strict";

    // TOOLTIP
    $(".header-links .fa, .tool-tip").tooltip({
        placement: "bottom"
    });
    $(".btn-wishlist, .btn-compare, .display .fa").tooltip('hide');

    // TABS
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

})(jQuery);

Date.prototype.Format = function (fmt) { //author: wucho
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

