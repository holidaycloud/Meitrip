/**
 * Created by zzy on 2014/12/2.
 */
var config = require('./../config/config.json');
var request = require('request');
var AddressCtrl = function(){};
AddressCtrl.get = function(customer,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/address/get?customer='+customer;
    request({
        url:url,
        method:'GET',
        timeout:3000
    },function(err,response,body){
        if(err){
            fn(err,null);
        } else {
            if(body){
                var res = JSON.parse(body);
                if(res.error==0){
                    fn(null,res.data);
                } else {
                    fn(new Error(res.errMsg),null);
                }
            } else {
                fn(new Error('网络错误'),null);
            }
        }
    });
};

AddressCtrl.getOrSave = function(customer,prov,city,area,address,name,phone,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/address/getOrSaveAddress';
    request({
        url:url,
        method:'POST',
        timeout:3000,
        form:{
            prov:prov,
            city:city,
            area:area,
            address:address,
            customer:customer,
            name:name,
            phone:phone
        }
    },function(err,response,body){
        if(err){
            fn(err,null);
        } else {
            if(body){
                var res = JSON.parse(body);
                if(res.error==0){
                    fn(null,res.data);
                } else {
                    fn(new Error(res.errMsg),null);
                }
            } else {
                fn(new Error('网络错误'),null);
            }
        }
    });
};

AddressCtrl.save = function(province,city,district,address,customer,name,phone,isDefault,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/address/save';
    request({
        url:url,
        method:'POST',
        timeout:3000,
        form:{
            province:province,
            city:city,
            district:district,
            address:address,
            customer:customer,
            name:name,
            phone:phone,
            isDefault:isDefault
        }
    },function(err,response,body){
        if(err){
            fn(err,null);
        } else {
            if(body){
                var res = JSON.parse(body);
                if(res.error==0){
                    fn(null,res.data);
                } else {
                    fn(new Error(res.errMsg),null);
                }
            } else {
                fn(new Error('网络错误'),null);
            }
        }
    });
};
module.exports = AddressCtrl;