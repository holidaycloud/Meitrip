$(() ->
  priceID=$(".active").attr "data-price"
  cid=null
  addressID=null
  addressList=null
  startDate = $(".active").attr "data-startDate"
  #获取地址
  getAddress = () ->
    $.ajax(
      type:"GET"
      url:"/ajax/address"
    ).done((data) ->
      $("#address_list").html ""
      addressList = data.data
      for address,i in data.data
        str = """
              <div class="radio">
                  <label>
                      <input type="radio" name="optionsRadios" value="#{address._id}" #{if i is 0 then "checked" else ""}>
                      收货人:#{address.name} #{address.phone}<br/>
                      收货地址:#{address.showtext}
                  </label>
              </div>
              """
        $("#address_list").append str
        $("#address-box").html """
                                  <span>
                                      收货人:#{address.name} #{address.phone}
                                  </span>
                                  <br/>
                                  <span>
                                      收货地址:#{address.showtext}
                                  </span>
                                 """ if i is 0
        addressID = address._id if i is 0
    )
  getAddress() if $.cookie("lgi") is "1"

  #点击产品详情
  $("#btn_proDetail").click () ->
    $("#main-box").addClass "hidden"
    $("#content-box").removeClass "hidden"

  #点击产品详情返回
  $("#btn_contentReturn").click () ->
    $("#content-box").addClass "hidden"
    $("#main-box").removeClass "hidden"

  #新增地址点击
  $("#btn_addAddress").click () ->
    if $.cookie("lgi") is "1"
      $("#modal_address").modal("show")
    else
      $("#myModal").modal("show")

  #保存地址点击
  $("#btn_submitAdd").click ()->
    $.ajax(
      url:"/ajax/address/save"
      method:"POST"
      data:
        province:$("#province").val()
        city:$("#city").val()
        district:$("#district").val()
        address:$("#address").val()
        name:$("#name").val()
        phone:$("#phone").val()
        isDefault:$("#isDefault").attr("checked") is "checked"
    ).done((data) ->
      addressList.push data
      addressID = data._id
      $("#address-box").html """
                              <span>
                                  收货人:#{data.name} #{data.phone}
                              </span>
                              <br/>
                              <span>
                                  收货地址:#{data.showtext}
                              </span>
                             """
      str = """
              <div class="radio">
                  <label>
                      <input type="radio" name="optionsRadios" value="#{data._id}" checked="checked"}>
                      收货人:#{data.name} #{data.phone}<br/>
                      收货地址:#{data.showtext}
                  </label>
              </div>
              """
      $("#address_list").append str
      $("#modal_address").modal("hide")
    )

  #地址radioChange
  $("#address_list").on("change","input:radio",() ->
    addressID = $(this).val()
    addObj = null
    for address in addressList
      if address._id is $(this).val()
        addObj = address
    $("#address-box").html """
                              <span>
                                  收货人:#{addObj.name} #{addObj.phone}
                              </span>
                              <br/>
                              <span>
                                  收货地址:#{addObj.showtext}
                              </span>
                             """
    $("#modal_add_list").modal("hide")
  )

  #选择地址点击
  $("#btn_changeAddress").click () ->
    if $.cookie("lgi") is "1"
      $("#modal_add_list").modal("show")
    else
      $("#myModal").modal("show")

  #类型选择
  $(".kind").click () ->
    $(".kind").removeClass "active"
    $(this).addClass "active"
    priceID = $(this).attr "data-price"
    startDate = $(this).attr "data-startDate"
    $.ajax({
      type:"GET"
      url:"/ajax/getPrice?id=#{priceID}"
    }).done((data) ->
      $("#qty").html ""
      count = if data.data.inventory<=10 then data.data.inventory else 10;
      $("#qty").append("<option value='#{i}'>#{i}</option>") for i in [1..count]
      $("#price").text data.data.price
      $("#totalPrice").text data.data.price*parseFloat($("#qty").val())
      $("#inventory_text").text data.data.inventory
    )

  #数量变化
  $("#qty").change () ->
    $("#totalPrice").text parseFloat($("#price").text())*parseFloat($(this).val())

  #注销
  $("#logout").click () ->
    $.ajax(
      type:"POST"
      url:"/ajax/logout"
    ).done(() ->
      cid = null
      $("#user_mobile").text ""
      $(".user-box").addClass "hidden"
    )

  #立即购买点击
  $("#btn_buy").click () ->
    if $.cookie("lgi") isnt "1"
      $("#myModal").modal("show")
    else
      $(this).attr "disabled","disabled"
      $.ajax(
        type:"POST"
        url:"/ajax/saveOrder"
        data:
          startDate:startDate
          quantity:$("#qty").val()
          product:$("#btn_proDetail").attr "data-pid"
          productName:$("#btn_proDetail").attr "data-pname"
          contactName:$("#contact").val()
          contactMobile:$("#contactMobile").val()
          priceID:priceID
          deliveryAddress:addressID
      ).done( (data) ->
        console.log data
        if data.error is 1
          alert data.errMsg
        else
          location.href = data.data
      )

  #点击登陆
  $("#btn_login").click () ->
    $.ajax(
      type:"POST"
      url:"/ajax/login"
      data:
        mobile:$("#mobile").val()
        passwd:faultylabs.MD5($("#passwd").val())
    ).done((data) ->
      if data.error is 1
        alert data.errMsg
      else
        cid = data.data._id
        $("#user_mobile").text data.data.mobile
        $("#contact").val if data.data.name then data.data.name else ""
        $("#contactMobile").val data.data.mobile
        $(".user-box").removeClass "hidden"
        $("#myModal").modal("hide")
        getAddress()
    )

  #选择省
  $("#province").change () ->
    $("#city").html ""
    $("#district").html ""
    $.ajax(
      url:"/ajax/getCities"
      method:"GET"
      data:
        pid:$(this).val()
    ).done((msg) ->
      $("#city").append "<option>- 请选择 -</option>"
      if msg.error is 1
        alert "网络异常"
      else
        $("#city").append "<option value='#{city.cid}'>#{city.cityName}</option>" for city in msg.data
    )

  #选择市
  $("#city").change () ->
    $("#district").html ""
    $.ajax(
      url:"/ajax/getDistricts"
      method:"GET"
      data:
        cid:$(this).val()
    ).done((msg) ->
      $("#district").append "<option>- 请选择 -</option>"
      if msg.error is 1
        alert "网络异常"
      else
        $("#district").append "<option value='#{district.did}'>#{district.districtName}</option>" for district in msg.data
    )

  #点击注册按钮弹注册框
  $("#btn_register").click () ->
    $("#myModal").modal("hide")
    $("#modal_reg").modal("show")

  #点击登录按钮跳回登录框
  $("#btn_tologin").click () ->
    $("#myModal").modal("show")
    $("#modal_reg").modal("hide")

  #点击执行注册
  $("#btn_doregister").click () ->
    mobile = $("#reg_mobile").val()
    passwd = $("#reg_passwd").val()
    repasswd = $("#reg_repasswd").val()
    if passwd is repasswd
      $.ajax(
        type:"POST"
        url:"/ajax/register"
        data:
          mobile:mobile
          passwd:faultylabs.MD5(passwd)
      ).done((data) ->
        if data.error is 1
          alert data.errMsg
        else
          cid = data.data._id
          $("#user_mobile").text data.data.mobile
          $("#contact").val if data.data.name then data.data.name else ""
          $("#contactMobile").val data.data.mobile
          $(".user-box").removeClass "hidden"
          $("#modal_reg").modal("hide")
          getAddress()
      )
  return
)