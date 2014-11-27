/**
 * Created by zzy on 2014/11/27.
 */
var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');
var AlipayCtrl = function(){};
AlipayCtrl.createUrl = function(pid,key,notifyUrl,returnUrl,orderID,productName,totalPrice){
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
        'seller_id':pid
    };
    var sign = AlipayCtrl.sign(params,key);
    params.sign = sign;
    params.sign_type = "MD5";
    var url = 'https://mapi.alipay.com/gateway.do?'+qs.stringify(params);
    return url;
};

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