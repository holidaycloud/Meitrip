/**
 * Created by zzy on 2014/10/30.
 */
    
var async = require('async');
var ProductCtrl = require('./../control/productCtrl');
var CustomerCtrl = require('./../control/customerCtrl');
var AreaCtrl = require('./../control/areaCtrl');
var OrderCtrl = require('./../control/orderCtrl');
var WeiXinCtrl = require('./../control/weixinCtrl');
var AlipayCtrl = require('./../control/alipayCtrl');
var CouponCtrl = require('./../control/couponCtrl');
var AddressCtrl = require('./../control/addressCtrl');
var NewsCtrl = require('./../control/newsCtrl');
exports.home = function(req,res){
    var ent = res.locals.domain.ent;
    async.auto({
        'getHot':function(cb){
            ProductCtrl.hotList(ent,function(err,result){
                cb(err,result)
            });
        }
        ,'getRecommend':function(cb){
            ProductCtrl.recommendList(ent,function(err,result){
                cb(err,result)
            });
        }
    },function(err,results){
        var userAgent = req.header('user-agent');
        res.render('index',{'hot':results.getHot.data,'recommend':results.getRecommend.data});
    });
};

exports.checkLogin = function(req,res,next){
    if(req.url=='/cart'&&req.method=='POST'){
        req.session.body=req.body;
    }
    if(req.session.user){
        next();
    } else {
        req.flash('url',req.url);
        res.redirect('/login');
    }
};

exports.product = function(req,res){
    var id = req.params.id;
    ProductCtrl.detail(id,function(err,result){
        if(err){
            res.render('500');
        } else {
            var classify ={'_id':'default','name':'所有产品'};
            res.locals.domain.classify.forEach(function(c){
                if(c._id==result.product.classify){
                    classify = c;
                }
            });
            result.classify = classify;
            res.render('product',result);
        }
    });
};

exports.categoryGrid = function(req,res){
    var id = req.params.id;
    var page = req.query.page||0;
    var pageSize = req.query.pageSize||9;
    var ent = res.locals.domain.ent;
    ProductCtrl.classifyList(page,pageSize,ent,id,function(err,result){
        var classify ={'_id':'default','name':'所有产品'};
        res.locals.domain.classify.forEach(function(c){
            if(c._id==id){
                classify = c;
            }
        });
        res.render('category-grid',{'product':result.data,'classify':classify,'page':parseInt(page),'totalPage':Math.ceil(result.data.totalSize/pageSize)});
    });
};

exports.categoryList = function(req,res){
    var id = req.params.id;
    var page = req.query.page||0;
    var pageSize = req.query.pageSize||9;
    var ent = res.locals.domain.ent;
    ProductCtrl.classifyList(page,pageSize,ent,id,function(err,result){
        var classify ={'_id':'default','name':'所有产品'};
        res.locals.domain.classify.forEach(function(c){
            if(c._id==id){
                classify = c;
            }
        });
        res.render('category-list',{'product':result.data,'classify':classify,'page':parseInt(page),'totalPage':Math.ceil(result.data.totalSize/pageSize)});
    });
};

exports.login = function(req,res){
    req.session.referer = req.flash('url');
    if(req.session.referer==""){
        req.session.referer=req.header('Referer');
    }
    res.render('login',{'reg_msg':'','lgn_msg':''});
};

exports.register = function(req,res){
    var mobile = req.body.reg_mobile;
    var passwd = req.body.reg_passwd;
    var ent = res.locals.domain.ent;
    CustomerCtrl.register(mobile,passwd,ent,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                req.session.user = result.data;
                res.redirect(req.session.referer?req.session.referer:'/');
            } else {
                res.render('login',{'reg_msg':result.errMsg,'lgn_msg':''});
            }
        }
    });
};

exports.userInfo = function(req,res){
    res.render('userInfo');
};

exports.changePasswd = function(req,res){
    res.render('changePasswd');
};

exports.myOrders = function(req,res){
    var page = req.query.page||0;
    var pageSize = req.query.pageSize||10;
    var customer = req.session.user._id;
    OrderCtrl.list(page,pageSize,customer,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                res.render('myOrders',{'page':parseInt(page),'totalPage':Math.ceil(result.data.totalSize/pageSize),'orders':result.data.orders});
            } else {
                res.render('500');
            }
        }
    });
};

exports.orderDetails = function(req,res){
    var id = req.params.id;
    var customer = req.session.user._id;
    OrderCtrl.detail(id,customer,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                var isWeixin = false;
                if(req.headers['user-agent'].indexOf('MicroMessenger')>-1){
                    isWeixin = true;
                }
                var obj = {
                    'order':result.data,
                    'isWeixin':isWeixin
                };
                res.render('orderDetails',obj);
            } else {
                res.render('500');
            }
        }
    });
};

exports.doLogin = function(req,res){
    var mobile = req.body.mobile;
    var passwd = req.body.passwd;
    var ent = res.locals.domain.ent;
    CustomerCtrl.login(mobile,passwd,ent,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                req.session.user = result.data;
                res.redirect(req.session.referer);
            } else {
                res.render('login',{'reg_msg':'','lgn_msg':result.errMsg});
            }
        }
    });
};

exports.updateInfo = function(req,res){
    var id = req.body.uid;
    var loginName = req.body.loginName;
    var email = req.body.email;
    var name = req.body.name;
    var address = req.body.address;
    CustomerCtrl.update(id,loginName,email,name,address,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                req.session.user = result.data;
                res.render('userInfo');
            } else {
                res.render('login',{'reg_msg':'','lgn_msg':result.errMsg});
            }
        }
    });
};

exports.logout = function(req,res){
    req.session.user = null;
    res.redirect('/');
};

exports.contact = function(req,res){
    res.render('contact');
};

exports.saveOrder = function(req,res,next){
    var token = res.locals.domain.longToken;
    var startDate = req.body.startDate==""?null:req.body.startDate;
    var quantity = req.body.quantity;
    var remark = null;
    var product = req.body.product;
    var productName = req.body.productName;
    var liveName = req.body.contactName;
    var contactPhone = req.body.contactMobile;
    var priceId = req.body.priceID;
    var customer = req.session.user._id;
    var payway = req.body.payway;
    var ckb_invoice = req.body.ckb_invoice;
    var invoiceType = req.body.invoiceType;
    var invoiceTitle = req.body.invoiceTitle;
    var couponCode = req.body.couponCode;
    var deliveryAddress = req.body.deliveryAddress;
    var iTitle = null;
    var coupon = null;
    if(ckb_invoice){
        if(invoiceType=='0'){
            iTitle='个人';
        } else {
            iTitle = invoiceTitle;
        }
    }
    if(couponCode!=""){
        coupon = couponCode.split('|')[0];
    }
    OrderCtrl.save(token, startDate, quantity, remark, product, liveName, contactPhone, priceId,customer,payway,iTitle,coupon,deliveryAddress,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                if(payway==3&&res.locals.domain.alipay){
                    res.locals.order = result.data;
                    res.locals.productName = productName;
                    next();
                } else if(payway==4&&res.locals.domain.weixin) {
                    var appID = res.locals.domain.weixin.appID;
                    var orderID = result.data._id;
                    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appID+'&redirect_uri=http://www.meitrip.net/weixinPay/pay?orderID='+orderID+'&response_type=code&scope=snsapi_base&state=pay#wechat_redirect');
                } else {
                    res.redirect('/orderDetails/'+result.data._id);
                }
            } else {
                res.render('500');
            }
        }
    });
};

exports.weixinpay = function(req,res){
    var orderID = req.query.orderID;
    var code = req.query.code;
    var state = req.query.state;
    var ent = res.locals.domain.ent;
    function generateSign(params,pk){
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
    }
    function getNonceStr(){
        var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var maxPos = $chars.length;
        var noceStr = "";
        for (i = 0; i < 32; i++) {
            noceStr += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return noceStr;
    };
    function getUnifiedOrderXml(params,key){
        var xml = "<xml>";
        xml += "<out_trade_no><![CDATA["+params.out_trade_no+"]]></out_trade_no>";
        xml += "<body><![CDATA["+params.body+"]]></body>";
        xml += "<total_fee>"+params.total_fee+"</total_fee>";
        xml += "<notify_url><![CDATA["+params.notify_url+"]]></notify_url>";
        xml += "<trade_type><![CDATA["+params.trade_type+"]]></trade_type>";
        xml += "<openid><![CDATA["+params.openid+"]]></openid>";
        xml += "<appid><![CDATA["+params.appid+"]]></appid>";
        xml += "<mch_id><![CDATA["+params.mch_id+"]]></mch_id>";
        xml += "<spbill_create_ip><![CDATA["+params.spbill_create_ip+"]]></spbill_create_ip>";
        xml += "<nonce_str><![CDATA["+params.nonce_str+"]]></nonce_str>";
        xml += "<sign><![CDATA["+generateSign(params,key)+"]]></sign>";
        xml += "</xml>";
        return xml;
    };
    async.auto({
        'getOrder':function(cb){
            OrderCtrl.get(orderID,function(err,result){
                if(err){
                    cb(err,null);
                } else {
                    if(result.error==0&&result.data){
                        cb(null,result.data)
                    } else {
                        cb(new Error(result.errMsg))
                    }
                }
            })
        },
        'getOpenId':function(cb){
            WeiXinCtrl.codeAccessToken(ent,code,state,function(err,result){
                if(result.error==0&&result.data){
                    cb(null,result.data)
                } else {
                    cb(new Error(result.errMsg))
                }
            });
        },
        'getPrepayId':['getOrder','getOpenId',function(cb,results){
            var order = results.getOrder;
            var openID = results.getOpenId.openid;
            var appID = res.locals.domain.weixin.appID;
            var partnerId = res.locals.domain.weixin.partnerId;
            var partnerKey = res.locals.domain.weixin.partnerKey;
            var xml_params = {};
            xml_params.out_trade_no = order.orderID;
            xml_params.body = order.product.name;
            xml_params.total_fee = order.totalPrice*100;
            xml_params.notify_url = "http://www.meitrip.net/weixinPay/notify";
            xml_params.trade_type = "JSAPI";
            xml_params.appid = appID;
            xml_params.mch_id = partnerId;
            xml_params.openid = openID;
            xml_params.nonce_str = getNonceStr();
            xml_params.spbill_create_ip = req.ip;
            var xml = getUnifiedOrderXml(xml_params,partnerKey);
            WeiXinCtrl.getPrePayId(xml,function(err,result){
                cb(err,result);
            });
        }]
    },function(err,results){
        if(err){
            res.render('500');
        } else {
            var appID = res.locals.domain.weixin.appID;
            var partnerKey = res.locals.domain.weixin.partnerKey;
            res.render('weixinpay',{
                appID:appID,
                prepay_id:results.getPrepayId,
                partnerKey:partnerKey,
                orderID:orderID
            });
        }
    });

};

exports.weixinNotify = function(req,res){
    var partnerKey = res.locals.domain.weixin.partnerKey;
    var _data = "";
    req.on('data',function(chunk){
        _data+=chunk;
    });
    req.on('end',function(){
        WeiXinCtrl.notify(_data,partnerKey,function(err,result){
            if(err||!result){
                console.log('weixinNotify',false);
                res.send({'return_code':'FAIL','return_msg':'签名失败'});
            }else {
                console.log('weixinNotify',true);
                res.send({'return_code':'SUCCESS'});
            }
        });
    });
};

exports.cart = function(req,res){
    var pid = req.session.body.productID;
    var name = req.session.body.productName;
    var qty = req.session.body.productQty;
    var priceID = req.session.body.priceID;
    var startDate = req.session.body.startDate;
    req.session.body=null;
    async.auto({
        'getProduct':function(cb){
            ProductCtrl.getProduct(pid,function(err,result){
                if(err){
                    cb(err,null);
                } else {
                    if(result.error==0){
                        cb(null,result.data);
                    } else {
                        cb(new Error('网络错误'),null);
                    }
                }
            })
        },
        'getPrice':function(cb){
            ProductCtrl.getPrice(priceID,function(err,result){
                if(err){
                    cb(err,null);
                } else {
                    if(result.error==0){
                        cb(null,result.data);
                    } else {
                        cb(new Error('网络错误'),null);
                    }
                }
            });
        },
        'getCoupons':['getPrice',function(cb,results){
            var customer = req.session.user._id;
            var ent = res.locals.domain.ent;
            var totalPrice = results.getPrice.price*qty;
            CouponCtrl.getCanUseCoupons(customer,ent,pid,totalPrice,function(err,result){
                if(err){
                    cb(err,null);
                } else {
                    if(result.error==0){
                        cb(null,result.data);
                    } else {
                        cb(new Error(result.errMsg),null);
                    }
                }
            });
        }],
        'getProvince':function(cb){
            AreaCtrl.provinceList(function(err,result){
                if(err){
                    cb(err,null);
                } else {
                    if(result.error==0){
                        cb(null,result.data);
                    } else {
                        cb(new Error('网络错误'),null);
                    }
                }
            });
        },
        'getAddress':function(cb){
            AddressCtrl.get(req.session.user._id,function(err,result){
                cb(err,result);
            });
        }
    },function(err,results){
        var isWeixin = false;
        if(req.headers['user-agent'].indexOf('MicroMessenger')>-1){
            isWeixin = true;
        }
        res.render('cart',{
            'provinces':results.getProvince,
            'orderInfo':{
                'qty':qty,
                'startDate':startDate
            },
            'coupons':results.getCoupons,
            'product':results.getProduct,
            'price':results.getPrice,
            'address':results.getAddress,
            'isWeixin':isWeixin
        });
    });
};

exports.weixinBind = function(req,res){
    var openid = req.query.openid;
    var url = req.query.url;
    res.render('weixinBind',{'lgn_msg':'','openID':openid,'url':url});
};

exports.doWeixinBind = function(req,res){
    var ent = res.locals.domain.ent;
    var openID = req.body.openID;
    var url = req.body.url;
    var mobile = req.body.mobile;
    var passwd = req.body.passwd;

    console.log(openID,url,mobile,passwd);
    CustomerCtrl.weixinBind(ent,mobile,passwd,openID,function(err,result){
        console.log(err,result);
        if(err){
            res.redirect('/500.html');
        } else {
            if(result&&result.error==0){
                req.session.user = result.data;
                res.redirect(url);
            } else {
                res.redirect('/500.html');
            }
        }
    });
};

exports.alipayNotify = function(req,res){
    AlipayCtrl.notify(res.locals.domain.alipay.pid,res.locals.domain.alipay.key,req.body,function(err,result){
        if(err||!result){
            console.log('alipayNotify',false);
            res.send('');
        }else {
            console.log('alipayNotify',true);
            res.send('success');
        }
    });
};

exports.alipayWapNotify = function(req,res){
    AlipayCtrl.wapNotify(res.locals.domain.alipay.pid,res.locals.domain.alipay.key,req.body,function(err,result){
        if(err){
            console.log('alipayWapNotify error',false);
            res.send('');
        } else if(!result){
            console.log('alipayWapNotify',false);
            res.send('');
        } else {
            console.log('alipayWapNotify',true);
            res.send('success');
        }
    });
};

exports.alipayScanOrderNotify = function(req,res){
    var pid=res.locals.domain.alipay.pid;
    var key = res.locals.domain.alipay.key;
    var token = res.locals.domain.longToken;
    var ent = res.locals.domain.ent;
    AlipayCtrl.scanOrder(pid,key,req.body,token,ent,function(err,result){
        if(err){
            res.render('500');
        }  else {
            res.json(result);
        }
    })
};

exports.alipayScanPayNotify = function(req,res){
    var pid=res.locals.domain.alipay.pid;
    var key = res.locals.domain.alipay.key;
    AlipayCtrl.scanPay(pid,key,req.body,function(err,result){
        console.log(err,result);
        if(err||!result){
            console.log('alipaySacnNotify',false);
            res.send('');
        }else {
            console.log('alipaySacnNotify',true);
            res.send('success');
        }
    })
};

exports.alipay = function(req,res){
    var userAgent = req.header('user-agent');
    if(userAgent.match(/(iPhone|iPod|Android|ios)/i)){
        AlipayCtrl.wapCreateUrl(
        res.locals.domain.alipay.pid,
        res.locals.domain.alipay.key,
        res.locals.domain.alipay.account,
        'http://www.meitrip.net/alipay/wapnotify',
        'http://www.meitrip.net/orderDetails/'+res.locals.order._id,
        res.locals.order.orderID,
        res.locals.productName,
        res.locals.order.totalPrice,
        res.locals.order._id,
        function(err,result){
            res.redirect(result);
        });
    } else {
        var url = AlipayCtrl.createUrl(
            res.locals.domain.alipay.pid,
            res.locals.domain.alipay.key,
            'http://www.meitrip.net/alipay/notify',
            'http://www.meitrip.net/orderDetails/'+res.locals.order._id,
            res.locals.order.orderID,
            res.locals.productName,
            res.locals.order.totalPrice,
            res.locals.order._id);
        res.redirect(url);
    }

};

exports.coupons = function(req,res){
    var customer = req.session.user._id;
    var ent = res.locals.domain.ent;
    CouponCtrl.getCoupons(customer,ent,function(err,result){
       if(err){
           res.render('500');
       }  else {
           res.render('coupons',result);
       }
    });
};

exports.orderDetailPay = function(req,res,next){
    var payway = req.body.payway;
    var productName = req.body.productName;
    var order = {
        'orderID':req.body.orderID,
        '_id':req.body.oid,
        'totalPrice':req.body.totalPrice
    }
    if(payway==3&&res.locals.domain.alipay){
        res.locals.order = order;
        res.locals.productName = productName;
        next();
    } else if(payway==4&&res.locals.domain.weixin) {
        var appID = res.locals.domain.weixin.appID;
        var orderID = order._id;
        res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appID+'&redirect_uri=http://www.meitrip.net/weixinPay/pay?orderID='+orderID+'&response_type=code&scope=snsapi_base&state=pay#wechat_redirect');
    } else {
        res.redirect('/orderDetails/'+order._id);
    }
};

exports.address = function(req,res){
    var customer = req.session.user._id;
    AddressCtrl.get(customer,function(err,result){
        if(err){
            res.render('500');
        }  else {
            console.log(err,result);
            res.send('');
        }
    });
};

exports.news = function(req,res){
    var ent = res.locals.domain.ent;
    var page = req.query.page||0;
    var pageSize = req.query.pageSize||9;
    NewsCtrl.list(page,pageSize,ent,function(err,result){
        if(err){
            res.render('500');
        }  else {
            res.render('news',{'newses':result.data.news,'page':parseInt(page),'totalPage':Math.ceil(result.data.totalSize/pageSize)});
        }
    });
};

exports.newsDetail = function(req,res){
    var id = req.params.id;
    NewsCtrl.detail(id,function(err,result){
        if(err){
            res.render('500');
        }  else {
            res.render('newsDetail',{'news':result.data});
        }
    });
};
exports.isBind = function(req,res,next){
    console.log("url is",req.url);
    if(req.url.indexOf('/customerWeixinBind')>-1||req.url.indexOf('/weixinBind')>-1){
        res.locals.isBind = true;
    } else {
        res.locals.isBind = false;
    }
    next();
};
exports.weixinAutoLogin = function(req,res,next){
    var ent = res.locals.domain.ent;
    var isBind =  res.locals.isBind;
    var isWeixin = req.headers['user-agent'].indexOf('MicroMessenger')>-1;
    console.log("user is",req.session.user);
    var isLogined = req.session.user != null;
    console.log(isBind,isWeixin,isLogined,isWeixin&&!isLogined&&!isBind);
    if(isWeixin&&!isLogined&&!isBind){
        //微信跳转回来的页面
        if(req.query.code||req.query.openid){
            var code = req.query.code;
            var openid = req.query.openid;
            if(code){
                async.auto({
                    'getOpenid':function(cb){
                        WeiXinCtrl.codeAccessToken(ent,code,"",function(err,res){
                            cb(err,res);
                        });
                    },
                    'weixinlogin':["getOpenid",function(cb,results){
                        var authData = results.getOpenid;
                        if(authData.error==0&&authData.data){
                            var openid = authData.data.openid;
                            CustomerCtrl.weixinAutoLogin(ent,openid,function(err,res){
                                if(!err&&res.error==0&&res.data){
                                    cb(null,res.data);
                                } else {
                                    cb(null,null);
                                }
                            });
                        } else {
                            cb(null,null);
                        }
                    }]
                },function(err,results){
                    console.log(err,results);
                    var authData = results.getOpenid;
                    var customer = results.weixinlogin;
                    if(customer){
                        req.session.user = customer;
                        next();
                    } else {
                        res.redirect("/customerWeixinBind?openid="+authData.data.openid+"&url="+req.url);
                    }
                });
            }
        } else { //请求微信页面，然后跳转
            async.auto({
                getWeixinConf:function(cb){
                    WeiXinCtrl.config(ent,function(err,res){
                        cb(err,res);
                    });
                },
                createUrl:["getWeixinConf",function(cb,results){
                    var conf = results.getWeixinConf;
                    if(conf){
                        var url = encodeURIComponent("http://"+req.hostname+req.url);
                        cb(null,"https://open.weixin.qq.com/connect/oauth2/authorize?appid="+conf.appID+"&redirect_uri="+url+"&response_type=code&scope=snsapi_base&state=weixinLogin#wechat_redirect")
                    }
                }]
            },function(err,results){
                console.log(err,results);
                if(err){
                    next();
                } else {
                    var url = results.createUrl;
                    if(url){
                        res.redirect(url);
                    } else {
                        next();
                    }
                }
            });
        }
    } else {
        next();
    }
};