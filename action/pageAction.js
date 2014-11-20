/**
 * Created by zzy on 2014/10/30.
 */
    
var async = require('async');
var ProductCtrl = require('./../control/productCtrl');
var CustomerCtrl = require('./../control/customerCtrl');
var AreaCtrl = require('./../control/areaCtrl');
var OrderCtrl = require('./../control/orderCtrl');
exports.home = function(req,res){
    var ent = global.ents[req.hostname].ent;
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
        var classify ={'_id':'default','name':'所有产品'};
        global.ents[req.hostname].classify.forEach(function(c){
            if(c._id==result.product.classify){
                classify = c;
            }
        });
        result.classify = classify;
        res.render('product',result);
    });
};

exports.categoryGrid = function(req,res){
    var id = req.params.id;
    var page = req.query.page||0;
    var pageSize = req.query.pageSize||9;
    var ent = global.ents[req.hostname].ent;
    ProductCtrl.classifyList(page,pageSize,ent,id,function(err,result){
        var classify ={'_id':'default','name':'所有产品'};
        global.ents[req.hostname].classify.forEach(function(c){
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
    var ent = global.ents[req.hostname].ent;
    ProductCtrl.classifyList(page,pageSize,ent,id,function(err,result){
        var classify ={'_id':'default','name':'所有产品'};
        global.ents[req.hostname].classify.forEach(function(c){
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
    var ent = global.ents[req.hostname].ent;
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
    var isNew = req.query.isNew?true:false;
    var customer = req.session.user._id;
    OrderCtrl.detail(id,customer,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                var obj = {
                    'order':result.data,
                    'newOrder':isNew
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
    var ent = global.ents[req.hostname].ent;
    CustomerCtrl.login(mobile,passwd,ent,function(err,result){
        if(err){
            res.render('500');
        } else {
            console.log(result);
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

exports.saveOrder = function(req,res){
    var token = res.locals.domain.longToken;
    var startDate = req.body.startDate==""?null:req.body.startDate;
    var quantity = req.body.quantity;
    var remark = null;
    var product = req.body.product;
    var liveName = req.body.contactName;
    var contactPhone = req.body.contactMobile;
    var priceId = req.body.priceID;
    var customer = req.session.user._id;
    var payway = req.body.payway;
    OrderCtrl.save(token, startDate, quantity, remark, product, liveName, contactPhone, priceId,customer,payway,function(err,result){
        if(err){
            res.render('500');
        } else {
            if(result.error==0&&result.data){
                res.redirect('/orderDetails/'+result.data._id+"?isNew=true");
            } else {
                res.render('500');
            }
        }
    });
};

exports.cart = function(req,res){
    var pid = req.body.productID;
    var name = req.body.productName;
    var qty = req.body.productQty;
    var priceID = req.body.priceID;
    var startDate = req.body.startDate;
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
        }
    },function(err,results){
        res.render('cart',{
            'provinces':results.getProvince,
            'orderInfo':{
                'qty':qty,
                'startDate':startDate
            },
            'product':results.getProduct,
            'price':results.getPrice
        });
    });
};