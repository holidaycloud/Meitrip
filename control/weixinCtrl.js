/**
 * Created by zzy on 2014/11/24.
 */
var request = require('request');
var async = require('async');
var config = require('./../config/config.json');
var parseString = require('xml2js').parseString;
var PayLogCtrl = require('./payLogCtrl');
var OrderCtrl = require('./orderCtrl');
var WeiXinCtrl = function(){};
WeiXinCtrl.config = function(ent,fn){
    var url = config.weixin.host+':'+config.weixin.port+'/weixin/configDetail/'+ent;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        if(err){
            fn(null,null);
        } else {
            obj = body?JSON.parse(body):null;
            if(obj&&obj.error==0){
                fn(null,obj.data);
            } else {
                fn(null,null);
            }
        }
    });
};
WeiXinCtrl.codeAccessToken = function(ent,code,state,fn){
    var url = config.weixin.host+':'+config.weixin.port+'/weixin/codeAccesstoken/'+ent+'?code='+code;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

WeiXinCtrl.getPrePayId = function(xml,fn){
    var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    request.post(url,{form:xml},function(err,response,body){
        if(err){
            fn(err,null);
        } else {
            if(body!=""){
                parseString(body,function(e,result){
                    if(e){
                        fn(e,null);
                    }else{
                        var data = {};
                        console.log("------------------------->get weixin prepay id",result);
                        if(result.xml.return_code[0]==="FAIL"){
                            fn(new Error(result.xml.return_msg[0]),null);
                        }else{
                            if(result.xml.result_code[0]==="SUCCESS"){
                                fn(null,result.xml.prepay_id[0]);
                            }else{
                                console.log("------------------------->get weixin prepay id，微信服务器异常无法支付");
                                fn(new Error('微信服务器异常无法支付'),null);
                            }
                        }
                    }
                });
            } else {
                fn(new Error(),null)
            }
        }
    });
};

WeiXinCtrl.login = function(ent,openID,fn){
    var url = config.weixin.host+':'+config.weixin.port+'/weixin//weixinLogin?ent='+ent+'&openId='+openID;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

//生成签名
WeiXinCtrl.generateSign = function(params,pk){
    var arrayKeys = [];
    var str = "";
    for(var key in params){
        arrayKeys.push(key);
    }
    arrayKeys.sort();
    for(var i=0;i<arrayKeys.length;i++){
        if(i==0){
            str = arrayKeys[i] +"="+ params[arrayKeys[i]];
        }else{
            str += "&" + arrayKeys[i] +"="+ params[arrayKeys[i]];
        }
    }
    str +="&key="+pk;
    var crypto = require('crypto');
    var shasum = crypto.createHash('md5');
    shasum.update(str,"utf8");
    var mySign = shasum.digest('hex');
    return mySign.toUpperCase();
};

WeiXinCtrl.notify = function(data,partnerKey,fn){
    async.auto({
        'parseXml':function(cb){
            parseString(data,function(err,res){
                if(err){
                    cb(err,null);
                } else {
                    var params = {};
                    for(var key in res.xml){
                        params[key] = res.xml[key][0];
                    }
                    cb(null,params);
                }
            });
        },
        'verfiy':['parseXml',function(cb,results){
            var params = results.parseXml;
            var reqSign = params.sign;
            delete params.sign;
            var sign = WeiXinCtrl.generateSign(params,partnerKey);
            if(sign==reqSign){
                cb(null,true);
            } else {
                cb(null,false);
            }
        }],
        'savePayLog':['parseXml','verfiy',function(cb,results){
            var params = results.parseXml;
            params.type = 1;
            PayLogCtrl.save(params,function(err,res){
                cb(null,null);
            });
        }],
        'changeOrderStatus':['parseXml','verfiy',function(cb,results){
            var params = results.parseXml;
            if(params.result_code=="SUCCESS"&&params.return_code=="SUCCESS"){
                var id = params.out_trade_no;
                OrderCtrl.pay(id,function(err,res){
                    if(err){
                        cb(err,null);
                    } else {
                        if(res.error!=0){
                            cb(new Error(res.errMsg),null);
                        } else {
                            if(res.data){
                                cb(null,true);
                            } else {
                                cb(null,false);
                            }
                        }
                    }
                    cb(err,res);
                })
            } else {
                cb(null,false);
            }
        }]
    },function(err,results){
        if(err){
            fn(err,null);
        } else {
            fn(null,results.verfiy&&results.changeOrderStatus);
        }
    });
};

module.exports = WeiXinCtrl;