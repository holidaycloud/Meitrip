/**
 * Created by zzy on 2014/11/24.
 */
var request = require('request');
var config = require('./../config/config.json');
var parseString = require('xml2js').parseString;
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

module.exports = WeiXinCtrl;