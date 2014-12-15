/**
 * Created by zzy on 2014/12/12.
 */
var express = require('express');
var QrAction = require('./../action/qrAction');
var router = express.Router();
router.get('/product/:id',QrAction.product);
module.exports = router;