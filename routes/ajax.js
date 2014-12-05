/**
 * Created by zzy on 2014/10/31.
 */
var express = require('express');
var router = express.Router();
var AjaxAction =  require('./../action/ajaxAction');
/* GET home page. */
router.get('/getPrice', AjaxAction.getPrice);
router.get('/getCities', AjaxAction.getCities);
router.get('/getDistricts', AjaxAction.getDistricts);
router.post('/changePasswd', AjaxAction.changePasswd);
router.post('/feedback', AjaxAction.feedback);
router.post('/order/cancel', AjaxAction.orderCancel);
router.post('/order/cardPay', AjaxAction.cardPay);
router.post('/address/save', AjaxAction.saveAddress);
module.exports = router;
