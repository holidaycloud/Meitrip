/**
 * Created by zzy on 2014/11/30.
 */
var request = require('request');
var config = require('./../config/config.json');
var async = require('async');
var CouponCtrl = function(){};

CouponCtrl.getCanUseCoupons = function(customer,ent,product,totalPrice,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/coupon/canUseList?customer='+customer+'&ent='+ent+'&product='+product+'&totalPrice='+totalPrice;
    request({
        url:url,
        method:'GET',
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CouponCtrl.getCoupons = function(customer,ent,fn){
    async.auto({
        'used':function(cb){
            var url = config.inf.host+':'+config.inf.port+'/api/coupon/customerCoupons?customer='+customer+'&ent='+ent+'&status=1';
            request({
                url:url,
                method:'GET',
                timeout:3000
            },function(err,response,body){
                cb(err,body?JSON.parse(body):{});
            });
        },
        'unuse':function(cb){
            var url = config.inf.host+':'+config.inf.port+'/api/coupon/customerCoupons?customer='+customer+'&ent='+ent+'&status=0';
            request({
                url:url,
                method:'GET',
                timeout:3000
            },function(err,response,body){
                cb(err,body?JSON.parse(body):{});
            });
        }
    },function(err,results){
        if(err){
            fn(err,null);
        } else {
            if(results.used.error==1){
                fn(new Error(results.used.errMsg),null);
            } else if(results.unuse.error==1){
                fn(new Error(results.unuse.errMsg),null);
            } else {
                fn(null,{
                   'used':results.used.data,
                    'unuse':results.unuse.data
                });
            }
        }
    });
};
module.exports=CouponCtrl;