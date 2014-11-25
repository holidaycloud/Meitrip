/**
 * Created by zzy on 2014/11/24.
 */
var request = require('request');
var config = require('./../config/config.json');
var WeiXinCtrl = function(){};

WeiXinCtrl.codeAccessToken = function(ent,code,state,fn){
    var url = config.weixin.host+':'+config.weixin.port+'/weixin/codeAccesstoken/'+ent+'?code='+code;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
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

module.exports = WeiXinCtrl;