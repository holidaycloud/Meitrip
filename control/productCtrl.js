/**
 * Created by zzy on 2014/10/30.
 */
var ProductCtrl = function(){};
var async = require('async');
var request = require('request');
var config = require('./../config/config.json');
var timeZone = ' 00:00:00 +08:00';

ProductCtrl.hotList = function(ent,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/product/hotList?ent="+ent;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

ProductCtrl.recommendList = function(ent,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/product/recommendList?ent="+ent;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

ProductCtrl.classifyList = function(page,pageSize,ent,classify,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/product/classifyList?ent="+ent+"&page="+page+"&pageSize="+pageSize;
    if(classify!='default'){
        url += '&classify='+classify;
    }
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

ProductCtrl.detail = function(id,fn){
    async.auto({
        'productDetail':function(cb){
            var url = config.inf.host+":"+config.inf.port+"/api/product/detail?id="+id;
            request({
                url:url,
                timeout:3000
            },function(err,response,body){
                if(err){
                    cb(err,null);
                } else {
                    if(body){
                        var res = JSON.parse(body);
                        if(res.error==0){
                            if(res.data){
                                cb(null,res.data);
                            } else {
                                cb(new Error('网络错误'),null);
                            }
                        } else {
                            cb(new Error(res.errMsg),null);
                        }
                    } else {
                        cb(new Error('网络错误'),null);
                    }
                }
            });
        }
        ,'productPrice':['productDetail',function(cb,results){
            var url;
            if(results.productDetail){
                if(results.productDetail.productType==3){
                    url = config.inf.host+":"+config.inf.port+"/api/price/list?product="+id;
                } else {
                    var now = new Date();
                    var todayStr = now.Format('yyyy-MM-dd');
                    todayStr+=timeZone;
                    var startDate = new Date(todayStr).getTime();
                    now.setDate(now.getDate()+90);
                    var endDateStr = now.Format('yyyy-MM-dd');
                    endDateStr += timeZone;
                    var endDate = new Date(endDateStr).getTime();
                    url = config.inf.host+":"+config.inf.port+"/api/price/list?product="+id+"&startDate="+startDate+"&endDate="+endDate;
                }
                request({
                    url:url,
                    timeout:3000
                },function(err,response,body){
                    if(err){
                        cb(err,null);
                    } else {
                        if(body){
                            var res = JSON.parse(body);
                            if(res.error==0){
                                cb(null,res.data);
                            } else {
                                cb(new Error(res.errMsg),null);
                            }
                        } else {
                            cb(new Error('网络错误'),null);
                        }
                    }
                });
            }else {
                cb(new Error('网络错误'),null);
            }
        }]
    },function(err,results){
        var res = {};
        if(err){
            fn(err,null);
        } else {
            fn(null,{
                'product':results.productDetail,
                'price':results.productPrice
            });
        }
    });
};

ProductCtrl.getProduct = function(id,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/product/detail?id="+id;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

ProductCtrl.getDatePrice = function(product,date,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/price/getDatePrice?product="+product;
    if(date){
        url += '&startDate='+date;
    }
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

ProductCtrl.getPrice = function(id,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/price/get?id="+id;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

module.exports = ProductCtrl;