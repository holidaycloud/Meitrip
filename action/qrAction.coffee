ProductCtrl = require "./../control/productCtrl"
AreaCtrl = require "./../control/areaCtrl"
async = require "async"
exports.product = (req,res)->
  id = req.params.id
  async.auto({
    getProduct:(cb) ->
      ProductCtrl.detail(id,(err,result) ->
        if err?
          cb err
        else
          price = ( {id:o._id,price:o.price,inventory:o.inventory,date:new Date(o.date).Format("yyyy-MM-dd")} for o in result.price when o.inventory>0)
          obj =
            price:price
            pid:result.product._id
            name:result.product.name
            content:result.product.content
            image: if result.product.images.length>0 then result.product.images[0].url else ""
          cb null,obj
      )
    getProvince:(cb) ->
      AreaCtrl.provinceList (err,result) ->
        if err?
          cb err
        else
          if result.error is 0
            cb null,result.data
          else
            cb(new Error "网络错误")
  },(err,results) ->
    obj = results.getProduct
    obj.provinces = results.getProvince
    if err
      res.render "500"
    else
      res.render "qrScanProduct",obj
  )
