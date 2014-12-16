/**
 * Created by zzy on 2014/10/31.
 */
var ProductCtrl = require('./../control/productCtrl');
var CustomerCtrl = require('./../control/customerCtrl');
var AreaCtrl = require('./../control/areaCtrl');
var FeedbackCtrl = require('./../control/feedbackCtrl');
var OrderCtrl = require('./../control/orderCtrl');
var AddressCtrl = require('./../control/addressCtrl');
var AlipayCtrl = require('./../control/alipayCtrl')
exports.getPrice = function(req,res){
    var id = req.query.id;
    ProductCtrl.getPrice(id,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.getCities = function(req,res){
    var pid = req.query.pid;
    AreaCtrl.cityList(pid,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.getDistricts = function(req,res){
    var cid = req.query.cid;
    AreaCtrl.districtList(cid,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.changePasswd = function(req,res){
    var id = req.body.id;
    var oldPasswd = req.body.oldPasswd;
    var newPasswd = req.body.newPasswd;
    CustomerCtrl.chagePasswd(id,oldPasswd,newPasswd,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.feedback = function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var title = req.body.title;
    var msg = req.body.msg;
    var ent = global.ents[req.hostname].ent;
    FeedbackCtrl.save(name,email,title,msg,ent,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.orderCancel = function(req,res){
    var id = req.body.id;
    var customer = req.session.user._id;
    OrderCtrl.cancel(id,customer,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.cardPay = function(req,res){
    var id = req.body.id;
    var customer = req.session.user._id;
    var token = res.locals.domain.longToken;
    var ent = res.locals.domain.ent;
    OrderCtrl.cardPay(id,customer,token,ent,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            if(result.error==0&&result.data){
                req.session.user.cardBalance = result.data.balance;
            }
            res.json(result);
        }
    });
};

exports.saveAddress = function(req,res){
    var customer = req.session.user._id;
    var province = req.body.province;
    var city = req.body.city;
    var district = req.body.district;
    var address = req.body.address;
    var name = req.body.name;
    var phone = req.body.phone;
    var isDefault = req.body.isDefault;
    console.log(isDefault);
    AddressCtrl.save(province,city,district,address,customer,name,phone,isDefault,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            res.json(result);
        }
    });
};

exports.login = function(req,res){
    var mobile = req.body.mobile;
    var passwd = req.body.passwd;
    var ent = res.locals.domain.ent;
    CustomerCtrl.login(mobile,passwd,ent,function(err,result){
        if(err){
            res.json({'error':1,'errMsg':err.message});
        } else {
            if(result.error==0&&result.data){
                res.cookie('pt',result.data._id,{'maxAge':604800000});
                res.cookie('lgi','1');
                req.session.user = result.data;
                res.json({'error':0,'data':result.data});
            } else {
                res.json({'error':1,'errMsg':result.errMsg});
            }
        }
    });
};

exports.getAddress = function(req,res){
    if(req.session.user){
        AddressCtrl.get(req.session.user._id,function(err,result){
            if(err){
                res.json({'error':1,'errMsg':err.message});
            } else {
                res.json({'error':0,'data':result});
            }
        });
    } else {
        res.json({});
    }

};

exports.logout = function(req,res){
    req.session.user = null;
    res.clearCookie('pt');
    res.clearCookie('lgi');
    res.send('');
};

exports.saveOrder = function(req,res,next){
    var token = res.locals.domain.longToken;
    var customer = req.session.user._id;

    var startDate = req.body.startDate==""?null:req.body.startDate;
    var quantity = req.body.quantity;
    var remark = null;
    var product = req.body.product;
    var productName = req.body.productName;
    var liveName = req.body.contactName;
    var contactPhone = req.body.contactMobile;
    var priceId = req.body.priceID;
    var deliveryAddress = req.body.deliveryAddress;

    var payway = 3;
    var ckb_invoice = null;
    var invoiceType = null;
    var invoiceTitle = null;
    var couponCode = null;
    var iTitle = null;
    var coupon = null;
    OrderCtrl.save(token, startDate, quantity, remark, product, liveName, contactPhone, priceId,customer,payway,iTitle,coupon,deliveryAddress,function(err,result){
        if(err){
            res.json({error:1,errMsg:err.message});
        } else {
            if(result.error==0&&result.data){
                res.locals.order = result.data;
                res.locals.productName = productName;
                next();
            } else {
                res.json({error:1,errMsg:result.errMsg});
            }
        }
    });
};

exports.alipay = function(err,res){
    AlipayCtrl.wapCreateUrl(
        res.locals.domain.alipay.pid,
        res.locals.domain.alipay.key,
        'http://www.meitrip.net/alipay/wapnotify',
        'http://www.meitrip.net/orderDetails/'+res.locals.order._id,
        res.locals.order.orderID,
        res.locals.productName,
        res.locals.order.totalPrice,
        res.locals.order._id,function(err,results){
            res.json({error:0,data:results});
        });


};