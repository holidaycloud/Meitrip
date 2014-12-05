/**
 * Created by zzy on 2014/11/28.
 */
var request = require('request');
var config = require('./../config/config.json');
var PayLogCtrl = function(){};
PayLogCtrl.save = function(params,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/payLog/save";
    request({
        url:url,
        timeout:3000,
        method:'POST',
        form: params
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};
module.exports = PayLogCtrl;