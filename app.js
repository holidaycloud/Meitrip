var express = require('express');
var session = require('cookie-session')
var path = require('path');
var favicon = require('static-favicon');
var DomainCtrl = require('./control/domainCtrl');
var CustomerCtrl = require('./control/customerCtrl');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var log4js = require('log4js');
var compression = require('compression');
//log4js config
log4js.configure({
    appenders : [ {
        type : 'console'
    }],
    replaceConsole : true
});
var logger = log4js.getLogger('normal');

var index = require('./routes/index');
var ajax = require('./routes/ajax');
var qr = require('./routes/qr');
var app = express();
global.ents={};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.orderStatus = {
    '0':'未支付',
    '1':'已支付',
    '2':'已确认',
    '3':'已取消',
    '4':'退款中',
    '4':'已退款'
}
app.enable('trust proxy');
app.use(compression());
app.use(favicon());

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxAge:2592000000}));
app.use(log4js.connectLogger(logger, {
    level : log4js.levels.INFO
}));
app.use(session({
    secret:'meitrip'
}));
app.use(function(req,res,next){
    var userAgent = req.header('user-agent');
    //console.log(userAgent.match(/(iPhone|iPod|Android|ios)/i));
    res.set('X-Powered-By','Server');
    next();
});

app.use(function(req,res,next){
    if(req.hostname=='meitrip.net'){
        res.redirect('http://www.meitrip.net');
    } else {
        next();
    }
});
app.use(flash());

//获取网站配置
app.use(function(req,res,next){
    var domain = req.hostname=='test.meitrip.net'||req.hostname=='mall.holidaycloud.cn'?'www.meitrip.net':req.hostname;
    //var domain = 'www.meitrip.net';
    //var domain = 'pinyuan.holidaycloud.cn'
    DomainCtrl.getEnt(domain,function(err,result){
        if(err){
            res.redirect('/404.html');
        } else {
            res.locals.domain = result;
            next();
        }
    });
});

//自动登陆
app.use(function(req,res,next){
    if((!req.session.user)&&req.cookies.pt!=null){
        console.log('----开始自动登陆----',req.cookies.pt);
        CustomerCtrl.detail(req.cookies.pt,function(err,result){
            if(!err){
                res.cookie('lgi','1');
                req.session.user = result;
            }
            next();
        });
    } else {
        next();
    }
});

//写入user到res.locals
app.use(function(req,res,next){
    if(req.session.user){
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
});

app.use('/', index);
app.use('/ajax', ajax);
app.use('/qr', qr);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.message);
        res.redirect('/404.html');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err.message);
    res.redirect('/404.html');
});

app.set('port', process.env.PORT || 3333);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

Date.prototype.Format = function (fmt) {
    function getWeek(w){
        var x;
        switch(w){
            case 0:
                x="周日";
                break;
            case 1:
                x="周一";
                break;
            case 2:
                x="周二";
                break;
            case 3:
                x="周三";
                break;
            case 4:
                x="周四";
                break;
            case 5:
                x="周五";
                break;
            case 6:
                x="周六";
                break;
        }
        return x;
    }
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds(), //毫秒
        "W": getWeek(this.getDay()) //星期
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

module.exports = app;
