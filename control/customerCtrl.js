/**
 * Created by zzy on 2014/11/1.
 */
var request = require('request');
var config = require('./../config/config.json');
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
module.exports = CustomerCtrl;