/**
 * Created by cloudbian on 14-5-5.
 */
    //generate time stamp
function getTimeStamp(){
    var timestamp=new Date().getTime();
    var timestampstring = timestamp.toString();//一定要转换字符串
    return timestampstring;
}

//generate nonce string
function getNonceStr(){
    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = $chars.length;
    var noceStr = "";
    for (i = 0; i < 32; i++) {
        noceStr += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
}

//微支付已经废弃这个方法
function getPackage(pName,orderId,order_id,partnerId,ip,totalFee,partnerKey){
    var banktype = "WX";
    var body = pName;//商品名称信息，这里由测试网页填入。
    var fee_type = "1";//费用类型，这里1为默认的人民币
    var input_charset = "UTF-8";//字符集
    var notify_url = "http://cloud.bingdian.com/wap/pay/paynotify/"+order_id;//支付成功后将通知该地址
    var out_trade_no = orderId;//订单号，商户需要保证该字段对于本商户的唯一性
    var partner = partnerId;//测试商户号
    var spbill_create_ip = ip;//用户浏览器的ip，这个需要在前端获取。这里使用127.0.0.1测试值
    var total_fee = totalFee;//总金额。
    var partnerKey = partnerKey;//这个值和以上其他值不一样是：签名需要它，而最后组成的传输字符串不能含有它。这个key是需要商户好好保存的。
    //首先第一步：对原串进行签名，注意这里不要对任何字段进行编码。这里是将参数按照key=value进行字典排序后组成下面的字符串,在这个字符串最后拼接上key=XXXX。由于这里的字段固定，因此只需要按照这个顺序进行排序即可。
    var signString = "bank_type="+banktype+"&body="+body+"&fee_type="+fee_type+"&input_charset="+input_charset+"&notify_url="+notify_url+"&out_trade_no="+out_trade_no+"&partner="+partner+"&spbill_create_ip="+spbill_create_ip+"&total_fee="+total_fee+"&key="+partnerKey;
    var md5SignValue =  faultylabs.MD5(signString).toUpperCase();
    //然后第二步，对每个参数进行url转码，如果您的程序是用js，那么需要使用encodeURIComponent函数进行编码。
    banktype = encodeURIComponent(banktype);
    body=encodeURIComponent(body);
    fee_type=encodeURIComponent(fee_type);
    input_charset = encodeURIComponent(input_charset);
    notify_url = encodeURIComponent(notify_url);
    out_trade_no = encodeURIComponent(out_trade_no);
    partner = encodeURIComponent(partner);
    spbill_create_ip = encodeURIComponent(spbill_create_ip);
    total_fee = encodeURIComponent(total_fee);
    //然后进行最后一步，这里按照key＝value除了sign外进行字典序排序后组成下列的字符串,最后再串接sign=value
    var completeString = "bank_type="+banktype+"&body="+body+"&fee_type="+fee_type+"&input_charset="+input_charset+"&notify_url="+notify_url+"&out_trade_no="+out_trade_no+"&partner="+partner+"&spbill_create_ip="+spbill_create_ip+"&total_fee="+total_fee;
    completeString = completeString + "&sign="+md5SignValue;
    return completeString;
}

function getSign(appId,signType,oldNonceStr,oldPackageString,oldTimeStamp,partnerKey){
    var app_id = appId;
    var signType = signType;
    var nonce_str = oldNonceStr;
    var package_string = oldPackageString;
    var time_stamp = oldTimeStamp;
    //第一步，对所有需要传入的参数加上appkey作一次key＝value字典序的排序
    var keyvaluestring = "appId="+app_id+"&nonceStr="+nonce_str+"&package="+package_string+"&signType="+signType+"&timeStamp="+time_stamp+"&key="+partnerKey;
    var sign = faultylabs.MD5(keyvaluestring).toUpperCase();
    return sign;
}