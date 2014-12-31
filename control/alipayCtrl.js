/**
 * Created by zzy on 2014/11/27.
 */

var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');
var async = require('async');
var https = require('https');
var ejs = require('ejs');
var fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
var OrderCtrl = require('./orderCtrl');
var CustomerCtrl = require('./customerCtrl');
var ProductCtrl = require('./productCtrl');
var AddressCtrl = require('./addressCtrl');
var PayLogCtrl = require('./payLogCtrl');
var timeZone = ' 00:00:00 +08:00';
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

AlipayCtrl.wapCreateUrl = function(pid,key,account,notifyUrl,returnUrl,orderID,productName,totalPrice,oid,fn){
    async.auto({
        'createDirect':function(cb){
            var str = fs.readFileSync('./views/wapAuthXml.ejs').toString();
            var reqDate = ejs.render(str,{
                'productName':productName,
                'orderID':orderID,
                'totalPrice':totalPrice,
                'callbackUrl':returnUrl,
                'notifyUrl':notifyUrl,
                'account':account
            });
            var params = {
                'service':'alipay.wap.trade.create.direct',
                'format':'xml',
                'v':'2.0',
                'partner':pid,
                'req_id': Date.now()+orderID,
                'sec_id':'MD5',
                'req_data':reqDate
            };
            var sign = AlipayCtrl.sign(params,key);
            params.sign = sign;
            var url = 'http://wappaygw.alipay.com/service/rest.htm?'+qs.stringify(params);
            request({
                url:url,
                timeout:3000
            },function(err,response,body){
                cb(err,qs.parse(body));
            });
        },
        "createUrl":['createDirect',function(cb,results){
            var authResult = results.createDirect;
            if(authResult.res_error){
                cb(null,null);
            } else {
                var res_data = authResult.res_data;
                parseString(res_data, function (err, result) {
                    if(err){
                        cb(err,null);
                    } else {
                        var request_token = result.direct_trade_create_res.request_token[0];
                        var params = {
                            'service':'alipay.wap.auth.authAndExecute',
                            'format':'xml',
                            'v':'2.0',
                            'partner':pid,
                            'sec_id':'MD5',
                            'req_data':'<auth_and_execute_req><request_token>'+request_token+'</request_token></auth_and_execute_req>'
                        };
                        var sign = AlipayCtrl.sign(params,key);
                        params.sign = sign;
                        var url = 'http://wappaygw.alipay.com/service/rest.htm?'+qs.stringify(params);
                        cb(null,url);
                    }
                });
            }
        }]
    },function(err,results){
        fn(err,results.createUrl);
    });
};

AlipayCtrl.wapNotify = function (pid,key,params,fn){
    async.auto({
        'verfiy':function(cb){
            var reqSign = params.sign;
            delete params.sign;
            var sign = AlipayCtrl.wapNotifySign(params,key);
            if(sign==reqSign){
                cb(null,true);
            } else {
                cb(null,false);
            }
        },
        'savePayLog':['verfiy',function(cb,results){
            if(results.verfiy){
                params.type = 0;
                PayLogCtrl.save(params,function(err,res){
                    cb(null,null);
                });
            } else {
                cb(null,null);
            }
        }],
        'changeOrderStatus':['verfiy',function(cb,results){
            if(results.verfiy){
                var notify_data = params.notify_data;
                parseString(notify_data, function (err, result) {
                    if(err){
                        cb(err,false);
                    } else {
                        var trade_status = result.notify.trade_status[0];
                        if(trade_status=="TRADE_FINISHED"||trade_status=="TRADE_SUCCESS"){
                            var id = result.notify.out_trade_no[0];
                            OrderCtrl.pay(id,function(err,res){
                                if(err){
                                    cb(err,null);
                                } else {
                                    if(res.error!=0){
                                        cb(new Error(res.errMsg),false);
                                    } else {
                                        if(res.data){
                                            cb(null,true);
                                        } else {
                                            cb(null,false);
                                        }
                                    }
                                }
                            })
                        } else {
                            cb(null,false);
                        }
                    }
                });
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

AlipayCtrl.qrPay = function(productId,productName,price,returnUrl,notifyUrl,partner,method,key){
    var biz_data = {
        'trade_type':'1',
        'need_address':'T',
        'goods_info':{
            'id':productId,
            'name':productName,
            'price':price,
            'sku_title':'出发日期',
            'sku':[
                {
                    "sku_id": "1",
                    "sku_name": "2014-12-05",
                    "sku_price": "0.01",
                    "sku_inventory": "20"
                },
                {
                    "sku_id": "2",
                    "sku_name": "2014-12-06",
                    "sku_price": "0.01",
                    "sku_inventory": "10"
                }
            ]
        },
        'return_url':returnUrl,
        'notify_url':notifyUrl,
        'ext_info':{
            'single_limit':'10',
            'ext_field':[
                {
                    'input_title': '请输入联系人',
                    'input_regex':'[^\\s]+'
                },
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

AlipayCtrl.scanOrder = function(pid,key,params,token,ent,fn){
    async.auto({
        'verifySign':function(cb){
            var reqSign = params.sign;
            delete params.sign;
            delete params.sign_type;
            var sign = AlipayCtrl.sign(params,key);
            if(sign==reqSign){
                cb(null,true);
            } else {
                cb(null,false);
            }
        },
        'getCustomer':['verifySign',function(cb,results){
            if(results.verifySign){
                var context_data = JSON.parse(params.context_data);
                CustomerCtrl.getOrRegister(context_data.value2,context_data.value1,ent,function(err,res){
                    if(err){
                        cb(err,null);
                    } else {
                        if(res.error!=0){
                            cb(new Error(res.errMsg),null);
                        } else {
                            if(res.data){
                                cb(null,res.data)
                            } else {
                                cb(new Error('未找到用户'),null);
                            }
                        }
                    }
                });
            } else {
                cb(null,null);
            }
        }],
        'getPrice':['verifySign',function(cb,results){
            if(results.verifySign){
                var product = params.goods_id;
                var startDateStr = params.sku_name;
                var startDate = startDateStr?new Date(startDateStr.substr(0,10)+timeZone).getTime():null;
                ProductCtrl.getDatePrice(product,startDate,function(err,res){
                    if(err){
                        cb(err,null);
                    } else {
                        if(res.error==0){
                            if(res.data){
                                if(parseFloat(res.data.price)!=parseFloat(params.price)){
                                    cb(new Error('价格错误',2),null);
                                } else if(res.data.inventory<parseInt(params.quantity)) {
                                    cb(new Error('库存不足',1),null);
                                } else {
                                    cb(null,res.data);
                                }
                            } else {
                                cb(new Error('价格错误',2),null);
                            }
                        } else {
                            cb(new Error(res.errMsg),null)
                        }
                    }
                });
            }
        }],
        'getAddress':['verifySign','getCustomer',function(cb,results){
            if(results.verifySign){
                var customer=results.getCustomer._id;
                var prov=params.prov;
                var city=params.city;
                var area=params.area;
                var address=params.address;
                var name=params.buyer_name;
                var phone=params.phone;
                AddressCtrl.getOrSave(customer,prov,city,area,address,name,phone,function(err,res){
                    cb(err,res);
                });
            } else {
                cb(null,null);
            }
        }],
        'saveOrder':['verifySign','getCustomer','getPrice','getAddress',function(cb,results){
            if(results.verifySign){
                var context_data = JSON.parse(params.context_data);
                var startDate = params.sku_name;;
                var quantity = params.quantity;
                var remark = null;
                var product = params.goods_id;
                var liveName = context_data.value1;
                var contactPhone = context_data.value2;
                var priceId=results.getPrice._id;
                var customer=results.getCustomer._id;
                var payway=3;
                var iTitle = null;
                var coupon = null;
                var deliveryAddress=results.getAddress._id;;
                OrderCtrl.save(token, startDate, quantity, remark, product, liveName, contactPhone, priceId,customer,payway,iTitle,coupon,deliveryAddress,function(err,result){
                    if(err){
                        cb(null,{is_success:'F',error_code:'OUT_SYSTEM_ERROR'});
                    } else {
                        if(result.error==0&&result.data){
                            console.log(result.data);
                            cb(null,{is_success:'T',out_trade_no:result.data.orderID});
                        } else {
                            cb(null,{is_success:'F',error_code:'CREATE_TRADE_FAILURE'});
                        }
                    }
                });
            } else {
                cb(null,null);
            }
        }]
    }, function (err, results) {
        if(err){
            if(err.id == 1){
                fn(null,{is_success:'F',error_code:'INVENTORY_NOT_ENOUGH'});
            } else if(err.id == 2){
                fn(null,{is_success:'F',error_code:'PRICE_NOT_MATCH'});
            } else {
                fn(null,{is_success:'F',error_code:'CREATE_TRADE_FAILURE'});
            }
        } else {
            if(results.verifySign){
                fn(null,results.saveOrder);
            } else{
                fn(null,null);
            }
        }
    });
      //            /*
      //            * user_id 买家支付宝账号
      //            * qrcode 二维码
      //            * goods_id 商品编号
      //            * goods_name 商品名称
      //            * quantity 购买数量
      //            * price 价格
      //            * sku_id 商品属性id
      //            * sku_name 商品属性名称
      //            * context_data 通知上下文数据
      //            * prov 省
      //            * city 市
      //            * area 区
      //            * address 地址
      //            * buyer_name 收货人
      //            * post_code 邮编
      //            * phone 电话
      //            * */
      //
      //
      //            //INVENTORY_NOT_ENOUGH 库存不足
      //            //PRICE_NOT_MATCH 价格不匹配
      //            //CREATE_TRADE_FAILURE 订单创建失败
      //            //OUT_SYSTEM_ERROR 系统异常
      //            //PARAM_ILLEGAL 参数不合法

};

AlipayCtrl.scanPay = function(pid,key,params,fn){
    async.auto({
        'parseXml':function(cb){
            parseString(params.notify_data, function (err, result) {
                cb(err,result);
            });
        },
        'Verify':function(cb){
            var reqSign = params.sign;
            delete params.sign;
            delete params.sign_type;
            var sign = AlipayCtrl.sign(params,key);
            if(sign==reqSign){
                cb(null,true);
            } else {
                cb(null,false);
            }
        },
        'savePayLog':['Verify',function(cb,results){
            if(results.Verify){
                params.type = 0;
                PayLogCtrl.save(params,function(err,res){
                    cb(null,null);
                });
            } else {
                cb(null,null);
            }
        }],
        'changeOrderStatus':['Verify','parseXml',function(cb,results){
            var notifyData = results.parseXml;
            if(results.Verify){
                if(notifyData.notify.trade_status[0]=="TRADE_FINISHED"||notifyData.notify.trade_status[0]=="TRADE_SUCCESS"){
                    var id = notifyData.notify.out_trade_no[0];
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
                    });
                } else {
                    cb(null,false);
                }
            }
        }]
    },function(err,results){
        console.log(err,results);
        if(err){
            fn(err,null);
        } else {
            fn(null,results.Verify&&results.changeOrderStatus);
        }
    });
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

AlipayCtrl.wapNotifySign = function(params,key){
    var signStr='';
    signStr+="service="+params.service;
    signStr+="&v="+params.v;
    signStr+="&sec_id="+params.sec_id;
    signStr+="&notify_data="+params.notify_data;
    var hasher = crypto.createHash("md5");
    hasher.update(signStr+key,'utf8');
    return hasher.digest("hex");
};
module.exports = AlipayCtrl;

Date.prototype.Format = function (fmt) {
    function getWeek(w){
        var x;
        switch(w){
            case 0:
                x="周日";
                break;
            case 1:
                x="周一";
                break;
            case 2:
                x="周二";
                break;
            case 3:
                x="周三";
                break;
            case 4:
                x="周四";
                break;
            case 5:
                x="周五";
                break;
            case 6:
                x="周六";
                break;
        }
        return x;
    }
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds(), //毫秒
        "W": getWeek(this.getDay()) //星期
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
