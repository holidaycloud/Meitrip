/**
 * Created by zzy on 2014/10/31.
 */
var ProductCtrl = require('./../control/productCtrl');
var CustomerCtrl = require('./../control/customerCtrl');
var AreaCtrl = require('./../control/areaCtrl');
var FeedbackCtrl = require('./../control/feedbackCtrl');
var OrderCtrl = require('./../control/orderCtrl');
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