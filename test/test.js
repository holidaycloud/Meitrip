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
var url = alipay.qrPay('546d809648056c5f7336d8e8','【苏州十大美丽乡村】之新毛电站村生态园，感受秋收稻香、亲自采摘,草莓玉米、莴苣青菜',899,'http://test.meitrip.net/alipay/scan/order','http://test.meitrip.net/alipay/scan/order','2088611202683801','add','572wffos12xculzbtwaveqh8mzvren9l');
//var url = alipay.createUrl('2088611202683801','572wffos12xculzbtwaveqh8mzvren9l','http://cloud.bingdian.com/web/notify/id','http://cloud.bingdian.com/web/callback/id','1234567890','测试产品','0.01');
console.log(url);