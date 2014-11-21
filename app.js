var express = require('express');
var session = require('cookie-session')
var path = require('path');
var favicon = require('static-favicon');
var DomainCtrl = require('./control/domainCtrl');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var log4js = require('log4js');
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
app.use(favicon());

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(log4js.connectLogger(logger, {
    level : log4js.levels.INFO
}));
app.use(session({
    secret:'meitrip'
}));
app.use(function(req,res,next){
    res.set('X-Powered-By','Server');
    next();
});
app.use(flash());
app.use(function(req,res,next){
    if(req.session.user){
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
});

app.use(function(req,res,next){
    var domain = req.hostname;
    DomainCtrl.getEnt(domain,function(err,result){
        if(err){
            res.redirect('/404.html');
        } else {
            res.locals.domain = result;
            next();
        }
    });
});
app.use('/', index);
app.use('/ajax', ajax);

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

Date.prototype.Format = function (fmt) { //author: wucho
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

module.exports = app;
