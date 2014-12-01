/**
 * Created by zzy on 2014/11/27.
 */

var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');
var async = require('async');
var https = require('https');
var OrderCtrl = require('./orderCtrl');
var PayLogCtrl = require('./payLogCtrl');
var AlipayCtrl = function(){};
AlipayCtrl.createUrl = function(pid,key,notifyUrl,returnUrl,orderID,productName,totalPrice,oid){
    var params = {
        'service':'create_direct_pay_by_user',
        'partner':pid,
        '_input_charset':'utf-8',
        'notify_url':notifyUrl,
        'return_url':returnUrl,
        'out_trade_no':orderID,
        'subject':productName,
        'payment_type':1,
        'total_fee':totalPrice,
        'seller_id':pid,
        'extra_common_param':oid
    };
    var sign = AlipayCtrl.sign(params,key);
    params.sign = sign;
    params.sign_type = "MD5";
    var url = 'https://mapi.alipay.com/gateway.do?'+qs.stringify(params);
    return url;
};

AlipayCtrl.qrPay = function(productId,productName,price,returnUrl,notifyUrl,partner,method,key){
    var biz_data = {
        'trade_type':'1',
        'need_address':'F',
        'goods_info':{
            'id':productId,
            'name':'test',
            'price':'0.01'
        },
        'return_url':returnUrl,
        'notify_url':notifyUrl,
        'ext_info':{
            'single_limit':'10',
            'ext_field':[
                {
                    'input_title': '请输入手机号码',
                    'input_regex':'^[1][3-8]+\\d{9}$'
                }
            ]
        }
    };
    var params = {
        'service':'alipay.mobile.qrcode.manage',
        'partner':partner,
        '_input_charset':'utf-8',
        'timestamp':new Date().Format('yyyy-MM-dd hh:mm:ss'),
        'method':method,
        'biz_type':10,
        'biz_data':JSON.stringify(biz_data)
    };
    var sign = AlipayCtrl.sign(params,key);
    params.sign = sign;
    params.sign_type = "MD5";
    var url = 'https://mapi.alipay.com/gateway.do?'+qs.stringify(params);
    return url;
};

AlipayCtrl.notifyVerify = function(pid,notifyId,fn){
    var options = {
        hostname: 'mapi.alipay.com',
        port: 443,
        path: '/gateway.do?service=notify_verify&partner='+pid+'&notify_id='+notifyId,
        method: 'GET'
    };
    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var _data="";
        res.on('data', function(chunk) {
            _data+=chunk;
        });
        res.on('end',function(){
            fn(null,_data=='true');
        });
    });
    req.end();
    req.on('error', function(e) {
        fn(e,null);
    });
};

AlipayCtrl.notify = function(pid,key,params,fn){
    async.auto({
        'Verify':function(cb){
            AlipayCtrl.notifyVerify(pid,params.notify_id,function(err,res){
                if(err){
                    cb(err,null);
                } else {
                    if(res){
                        var reqSign = params.sign;
                        delete params.sign;
                        delete params.sign_type;
                        var sign = AlipayCtrl.sign(params,key);
                        if(sign==reqSign){
                            cb(null,true);
                        } else {
                            cb(null,false);
                        }
                    } else {
                        cb(new Error('支付宝请求验证错误'),null);
                    }
                }
            });
        },
        'savePayLog':['Verify',function(cb){
            params.type = 0;
            PayLogCtrl.save(params,function(err,res){
               cb(null,null);
            });
        }],
        'changeOrderStatus':['Verify',function(cb){
            if(params.trade_status=="TRADE_FINISHED"||params.trade_status=="TRADE_SUCCESS"){
                var id = params.extra_common_param;
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
            fn(null,results.Verify&&results.changeOrderStatus);
        }
    });
}

AlipayCtrl.sign = function(params,key){
    var keys = _.keys(params);
    keys.sort();
    var signStr='';
    for(var i in keys){
        if(i==0){
            signStr+=keys[i]+"="+params[keys[i]];
        } else {
            signStr+='&'+keys[i]+"="+params[keys[i]];
        }
    }
    var hasher = crypto.createHash("md5");
    hasher.update(signStr+key,'utf8');
    return hasher.digest("hex");
};
module.exports = AlipayCtrl;
//https://mapi.alipay.com/gateway.do?_input_charset=utf-8&out_trade_no=123456&partner=2088611202683801&payment_type=1&seller_id=2088611202683801&service=create_direct_pay_by_use&subject=test&total_fee=0.01&sign_typ=MD5&sign399ffba0c276ffd1e07aeecc133469a1