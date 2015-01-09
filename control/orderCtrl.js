/**
 * Created by zzy on 2014/11/13.
 */
var request = require('request');
var config = require('./../config/config.json');
var OrderCtrl = function(){};
var timeZone = ' 00:00:00 +08:00';
OrderCtrl.save = function(token, startDate, quantity, remark, product, liveName, contactPhone, priceId,customer,payway,invoiceTitle,coupon,deliveryAddress,fn){
    var url = config.inf.host+':'+config.inf.port+'/api/order/save';
    var form = {
        token:token,
        startDate:startDate?new Date(startDate.substr(0,10)+timeZone).getTime():Date.now(),
        quantity:quantity,
        remark:remark,
        product:product,
        liveName:liveName,
        contactPhone:contactPhone,
        price:priceId,
        customer:customer,
        payway:payway
    };
    if(deliveryAddress){
        form.deliveryAddress = deliveryAddress;
    }
    if(invoiceTitle){
        form.invoiceTitle = invoiceTitle;
    }
    if(coupon){
        form.coupon = coupon;
    }
    request({
        url:url,
        method:'POST',
        timeout:5000,
        form: form
    }, function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.list = function(page,pageSize,customer,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/cusList?page="+page+"&pageSize="+pageSize+"&customer="+customer;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.get = function(id,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/detail?id="+id;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.detail = function(id,customer,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/cusDetail?id="+id+"&customer="+customer;
    request({
        url:url,
        timeout:3000
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.cardPay = function(id,customer,token,ent,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/cardPay";
    request({
        url:url,
        timeout:3000,
        method:'POST',
        form: {
            id:id,
            customer:customer,
            token:token,
            ent:ent
        }
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.cancel = function(id,customer,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/cusCancel";
    request({
        url:url,
        timeout:3000,
        method:'POST',
        form: {
            id:id,
            customer:customer
        }
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.pay = function(id,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/pay";
    request({
        url:url,
        timeout:3000,
        method:'POST',
        form: {
            orderID:id
        }
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};

OrderCtrl.confirm = function(id,fn){
    var url = config.inf.host+":"+config.inf.port+"/api/order/confirm";
    request({
        url:url,
        timeout:3000,
        method:'POST',
        form: {
            orderID:id
        }
    },function(err,response,body){
        fn(err,body?JSON.parse(body):{});
    });
};
module.exports = OrderCtrl;