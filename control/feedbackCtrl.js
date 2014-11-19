/**
 * Created by zzy on 2014/11/4.
 */
var request = require('request');
var config = require('./../config/config.json');
var FeedbackCtrl = function(){};
FeedbackCtrl.save = function(name,email,title,msg,ent,fn){
    request({
        url:config.inf.host+':'+config.inf.port+'/api/feedback/save',
        method:'POST',
        timeout:3000,
        form: {
            ent:ent,
            email:email,
            name:name,
            title:title,
            msg:msg
        }
    }, function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};
module.exports = FeedbackCtrl;