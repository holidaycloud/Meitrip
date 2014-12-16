/**
 * Created by zzy on 7/31/14.
 */
//require('./../app');
//var ProductMatch = require('./../model/productMatch');
//
//var match = new ProductMatch({
//    'ent':'5434d488a1efc590111dd8f1',
//    'providerProductId':'541251de999f1fd61a1d0f7d',
//    'traderProductId':'h62523'
//});
//
//match.save(function(err,res){
//    console.log(err,res);
//})
//
//db.orders.find().forEach(function(o){
//    print(o.orderID+","+ new Date(o.startDate).Format('yyyy-MM-dd')+","+ o.quantity+","+ o.totalPrice+","+ new Date(o.orderDate).Format('yyyy-MM-dd hh:mm:ss')+","+ o.liveName+","+ o.contactPhone);
//});


var alipay = require('./../control/alipayCtrl');
//var url = alipay.qrPay('5476e70804321cba69f3b3cd','测试产品','0.01','http://test.meitrip.net/alipay/scan/order','http://test.meitrip.net/alipay/scan/pay','2088611202683801','add','572wffos12xculzbtwaveqh8mzvren9l');
//var url = alipay.createUrl('2088611202683801','572wffos12xculzbtwaveqh8mzvren9l','http://cloud.bingdian.com/web/notify/id','http://cloud.bingdian.com/web/callback/id','1234567890','测试产品','0.01');
var url = alipay.wapCreateUrl('2088611202683801','572wffos12xculzbtwaveqh8mzvren9l','http://cloud.bingdian.com/web/notify/id','http://cloud.bingdian.com/web/callback/id',Date.now()+"",'测试产品','0.01','oid');
//console.log(url);http://wappaygw.alipay.com/service/rest.htm?service=alipay.wap.auth.authAndExecute&format=xml&v=2.0&partner=2088611202683801&sec_id=MD5&req_data=%3Cauth_and_execute_req%3E%3Crequest_token%3E201412115158bf68895fa2e729324caecd50dca8%3C%2Frequest_token%3E%3C%2Fauth_and_execute_req%3E&sign=a9c05c70a91043fac2d1e23cf53970ad