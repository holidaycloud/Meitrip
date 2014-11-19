/**
 * Created by zzy on 2014/11/3.
 */
var config = require('./../config/config.json');
var request = require('request');
var AreaCtrl = function(){};
AreaCtrl.provinceList = function(fn){
    var url = config.inf.host+":"+config.inf.port+"/api/province/list";
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

AreaCtrl.cityList = function(pid,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/city/list?pid="+pid;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

AreaCtrl.districtList = function(cid,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/district/list?cid="+cid;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

module.exports = AreaCtrl;