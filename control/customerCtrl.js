/**
 * Created by zzy on 2014/11/1.
 */
var request = require('request');
var config = require('./../config/config.json');
var async = require('async');
var CustomerCtrl = function(){};
CustomerCtrl.login = function(mobile,passwd,ent,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/login?mobile='+mobile+'&passwd='+passwd+'&ent='+ent;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CustomerCtrl.register = function(mobile,passwd,ent,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/register';
    request({
        url:url,
        method:'POST',
        form: {mobile:mobile,passwd:passwd,ent:ent},
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CustomerCtrl.getOrRegister = function(mobile,name,ent,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/getOrRegister?ent='+ent+'&mobile='+mobile+'&name='+name;
    request({
        url:url,
        method:'GET',
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CustomerCtrl.update = function(id,loginName,email,name,address,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/update';
    request({
        url:url,
        method:'POST',
        form: {
            id:id,
            loginName:loginName,
            email:email,
            name:name,
            address:address
        },
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CustomerCtrl.chagePasswd = function(id,oldPasswd,newPasswd,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/changePasswd';
    request({
        url:url,
        method:'POST',
        form: {
            id:id,
            loginName:loginName,
            email:email,
            name:name,
            address:address
        },
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

CustomerCtrl.weixinBind = function(ent,mobile,passwd,openID,fn){
    async.auto({
        'getUserInfo':function(cb){
            var url = config.weixin.host+':'+config.weixin.port+'/weixin/userInfo/'+ent+'?openid='+openID;
            request({
                url:url,
                timeout:3000
            },function(err,response,body){
                if(err){
                    cb(err,null);
                } else {
                    var res = body?JSON.parse(body):{};
                    if(res.error==0&&res.data){
                        cb(null,res.data);
                    } else {
                        cb(new Error(res.errMsg),null);
                    }
                }
            });
        },
        'bindCustomer':['getUserInfo',function(cb,results){
            var url = config.inf.host+':'+config.inf.port+'/api/customer/weixinBind';
            request({
                url:url,
                method:'POST',
                form: {
                    ent:ent,
                    mobile:mobile,
                    passwd:passwd,
                    openId:openID,
                    headimgurl:results.getUserInfo.headimgurl,
                    loginName:results.getUserInfo.nickname,
                    sex:parseInt(results.getUserInfo.sex)
                },
                timeout:3000
            },function(err,response,body){
                cb(err,body?JSON.parse(body):{});
            });
        }]
    },function(err,results){
        console.log(err,results);
        fn(err,results.bindCustomer);
    });

};

CustomerCtrl.detail = function(id,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/customer/detail?id='+id;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        console.log(err,body);
        if(err){
            fn(err,null);
        } else {
            var res = body?JSON.parse(body):{};
            if(res.error==0&&res.data){
                fn(null,res.data);
            } else {
                fn(new Error(res.errMsg),null);
            }
        }
    });
};
module.exports = CustomerCtrl;