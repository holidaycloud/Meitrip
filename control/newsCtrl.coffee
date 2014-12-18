class NewsCtrl
  request = require "request"
  config = require "./../config/config.json"
  @list = (page,pageSize,ent,fn) ->
    url = "#{config.inf.host}:#{config.inf.port}/api/news/list?ent=#{ent}&page=#{page}&pageSize=#{pageSize}"
    request({url:url,timeout:3000},(err,response,body) ->
      fn err,if body then JSON.parse(body) else {}
    )

  @detail = (id,fn) ->
    url = "#{config.inf.host}:#{config.inf.port}/api/news/detail?id=#{id}"
    request({url:url,timeout:3000},(err,response,body) ->
      fn err,if body then JSON.parse(body) else {}
    )

module.exports =  NewsCtrl