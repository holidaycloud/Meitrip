var express = require('express');
var router = express.Router();
var PageAction =  require('./../action/pageAction');
/* GET home page. */
router.get('/', PageAction.home);
router.get('/login', PageAction.login);
router.get('/product/:id', PageAction.product);
router.get('/category/:id', PageAction.categoryGrid);
router.get('/category-list/:id', PageAction.categoryList);
router.get('/logout', PageAction.logout);
router.get('/contact', PageAction.contact);
router.get('/userInfo', PageAction.checkLogin,PageAction.userInfo);
router.get('/changePasswd', PageAction.checkLogin,PageAction.changePasswd);
router.get('/myOrders', PageAction.checkLogin,PageAction.myOrders);
router.get('/orderDetails/:id', PageAction.checkLogin,PageAction.orderDetails);
router.post('/doLogin', PageAction.doLogin);
router.post('/register', PageAction.register);
router.post('/updateInfo', PageAction.updateInfo);
router.all('/cart', PageAction.checkLogin,PageAction.cart);
router.post('/saveOrder', PageAction.checkLogin,PageAction.saveOrder,PageAction.alipay);
router.post('/orderPay',PageAction.checkLogin,PageAction.orderDetailPay,PageAction.alipay);
router.get('/customerWeixinBind', PageAction.weixinBind);
router.post('/weixinBind', PageAction.doWeixinBind);
router.get('/coupons',PageAction.checkLogin,PageAction.coupons);
router.get('/address',PageAction.checkLogin,PageAction.address);

router.post('/alipay/notify',PageAction.alipayNotify);
router.post('/alipay/scan/order',PageAction.alipayScanOrderNotify);
module.exports = router;
