/**
 * Created by zzy on 2014/11/30.
 */
var request = require('request');
var config = require('./../config/config.json');
var async = require('async');
var CouponCtrl = function(){};

CouponCtrl.getCoupons = function(customer,ent,product,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/coupon/canUseList?customer='+customer+'&ent='+ent+'&product='+product;
    request({
        url:url,
        method:'GET',
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

module.exports=CouponCtrl;