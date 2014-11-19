/**
 * Created by zzy on 7/31/14.
 */
require('./../app');
var ProductMatch = require('./../model/productMatch');

var match = new ProductMatch({
    'ent':'5434d488a1efc590111dd8f1',
    'providerProductId':'541251de999f1fd61a1d0f7d',
    'traderProductId':'h62523'
});

match.save(function(err,res){
    console.log(err,res);
})

db.orders.find().forEach(function(o){
    print(o.orderID+","+ new Date(o.startDate).Format('yyyy-MM-dd')+","+ o.quantity+","+ o.totalPrice+","+ new Date(o.orderDate).Format('yyyy-MM-dd hh:mm:ss')+","+ o.liveName+","+ o.contactPhone);
});