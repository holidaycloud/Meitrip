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
                } else {
                    res.redirect('/orderDetails/'+result.data._id);
                }

            } else {
                res.render('500');
            }
        }
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
    var code = req.query.code;
    var state = req.query.state;
    var ent = res.locals.domain.ent;
    WeiXinCtrl.codeAccessToken(ent,code,state,function(err,result){
        if(err){
            res.redirect('/500.html');
        } else {
            if(result&&result.error==0){
                var obj = {
                    'lgn_msg':'',
                    'openID':result.data.openid
                }
                res.render('weixinBind',obj);
            } else {
                res.redirect('/500.html');
            }
        }

    });
};

exports.doWeixinBind = function(req,res){
    var ent = res.locals.domain.ent;
    var openID = req.body.openID;
    var mobile = req.body.mobile;
    var passwd = req.body.passwd;
    CustomerCtrl.weixinBind(ent,mobile,passwd,openID,function(err,result){
        if(err){
            res.redirect('/500.html');
        } else {
            if(result&&result.error==0){
                req.session.user = result.data;
                res.render('weixinBindSuccess');
            } else {
                res.redirect('/500.html');
            }
        }
    });
};

exports.alipayNotify = function(req,res){
    AlipayCtrl.notify(res.locals.domain.alipay.pid,res.locals.domain.alipay.key,req.body,function(err,result){
        console.log(err,result);
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
    } else {
        res.redirect('/orderDetails/'+result.data._id);
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