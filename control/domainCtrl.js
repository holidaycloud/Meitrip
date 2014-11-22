/**
 * Created by zzy on 2014/11/3.
 */
var async = require('async');
var request = require('request');
var config = require('./../config/config.json');
var DomainCtrl = function(){};
DomainCtrl.getEnt = function(domain,fn){
    async.auto({
        'getConfig':function(cb){
            DomainCtrl.getWebConf(domain,function(err,res){
                if(err){
                    cb(err,null);
                } else if(res.error!=0){
                    cb(new Error('网络异常'),null);
                } else {
                    cb(null,res);
                }
            });
        },
        'getClassify':['getConfig',function(cb,results){
            if(results.getConfig.data){
                DomainCtrl.classify(results.getConfig.data.ent,function(err,res){
                    if(err){
                        cb(err,null);
                    } else if(res.error!=0){
                        cb(new Error('网络异常'),null);
                    } else {
                        cb(null,res);
                    }
                });
            } else {
                cb(null,null);
            }
        }]
    },function(err,results){
        if(err){
            fn(err,null);
        } else {
            if(results.getConfig.data){
                var obj = results.getConfig.data;
                obj.classify = results.getClassify.data;
                fn(null,obj);
            } else {
                fn(null,null);
            }
        }
    });
};

DomainCtrl.classify = function(ent,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/classify/list?ent="+ent;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

DomainCtrl.getWebConf = function(domain,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/domain/get?domain="+domain;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};
module.exports = DomainCtrl;