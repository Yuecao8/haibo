// pages/item/item.js
import getUrl from '../../utils/api.js'
var WxParse = require('../../wxParse/wxParse.js');
// const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailId:undefined,
    detailItem:undefined,
    title:undefined,
    detailVideo:undefined,
    detailVideoPoster:undefined,
    newsData:{
      listData:[]
    },
    isHidden:undefined,
    isComment:undefined,
    commentData:[],
    column_id:undefined,
    exclude_id:undefined,
    keywords:undefined,
    count:5,
    content_id:undefined,
    content:undefined,
    cmid:undefined,
    app_uniqueid:undefined,
    mod_uniqueid:undefined,
    ceshi:undefined,
    loadTrue:false
  },
  init: function (){
    wx.showLoading({
      title: '加载中...'
    })
  //  console.log(this.data.detailId)
    wx.request({
      url: getUrl('home', 'item'),
      data:{
        id:this.data.detailId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var token = wx.getStorageSync('token');
        var detailItem = res.data;
        if(detailItem.bundle_id == "livmedia"){
          var detailVideo = detailItem.video;
          var detailVideoPoster = detailItem.indexpic
          var column_id = detailItem.column_id;
          var exclude_id = detailItem.id;
          var keywords = detailItem.keywords;
          var content_id = detailItem.content_id;
          var cmid = detailItem.rid;
          var app_uniqueid = detailItem.bundle_id;
          var mod_uniqueid = detailItem.module_id;
          this.setData({
            "detailItem": detailItem,
            "detailVideo": detailVideo,
            "detailVideoPoster":detailVideoPoster,
            "column_id": column_id,
            "exclude_id": exclude_id,
            "keywords": keywords,
            "content_id": content_id,
            "app_uniqueid": app_uniqueid,
            "mod_uniqueid": mod_uniqueid,
            "cmid": cmid,
            "loadTrue":true
          })
          wx.hideLoading()
        } else if (detailItem.bundle_id == "news"){
          var detailContent = detailItem.content;
          var reg = /\<div[^\>]+m2o_mark=\"(.*?)_(.*?)\"+.*?>[\r\n.]*\<\/div\>/gi;
          var detailContentNew = detailContent.replace(reg, function (match, val,num,index,str){
           if(val == "pic"){
             return '<img src='+'"' + detailItem.material[num].pic.host + detailItem.material[num].pic.dir + detailItem.material[num].pic.filepath + detailItem.material[num].pic.filename+'"' +'/>'
           }else{
             var url = val + "_" + num;            
             return '<video src=' + '"' + detailItem.content_material_list[url].video_url+ '"'+'></video>'
           }               
          })             
          var title = res.data.title;
          var column_id = detailItem.column_id;
          var exclude_id = detailItem.id;
          var keywords = detailItem.keywords;
          var content_id = detailItem.content_id;
          var app_uniqueid = detailItem.bundle_id;
          var mod_uniqueid = detailItem.module_id;
          var cmid = detailItem.rid;
          this.setData({
            "detailItem": detailItem,
            "title": title,
            "column_id": column_id,
            "exclude_id": exclude_id,
            "keywords": keywords,
            "content_id": content_id,
            "app_uniqueid": app_uniqueid,
            "mod_uniqueid": mod_uniqueid,
            "cmid": cmid,
            "loadTrue":true
          })
          // console.log(detailContentNew)
          WxParse.wxParse('detailContentNew', 'html', detailContentNew, this, 0);
          wx.hideLoading()
          // this.related();
          // this.comment();
        }else{

        }       
      }
    })
  },
  // 我也有话说
  bindinput: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  formSubmit: function (e) {
    if(this.data.content == undefined || this.data.content == ''){
      wx.showToast({
        title: '请输入评论内容',
        icon: 'loading',
        duration: 1000
      })
    }else{
      wx.request({
        url: getUrl('home', 'comment_create'),
        data:{
          content:this.data.content,
          cmid:this.data.cmid,
          app_uniqueid:this.data.app_uniqueid,
          mod_uniqueid:this.data.mod_uniqueid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          wx.showToast({
            title: '已提交',
            icon: 'success',
            duration: 1000
          })
        }
      })
    }
  },
  //精彩推荐
  related:function(){
    wx.request({
      url: getUrl('request', 'related_content'),
      data:{
        count:this.data.count,
        title:this.data.title,
        column_id:this.data.column_id,
        exclude_id:this.data.exclude_id,
        keywords:this.data.keywords,
        bundle_id:'livmedia' // 只取内容是视频的
      },
      // url: `${getUrl('request', 'related_content')}&need_video=${this.data.need_video}&count=${this.data.count}&title=${this.data.title}`,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log(res)
        var data = res.data;
        if(data != ''){
          var data = res.data;
          var arr = [];
          for (let result in data) {
            var arr = arr.concat(data[result])
          }
          for (let val of arr) {
            var currentTime = new Date().getTime();
            var dataTime = parseInt(val.publish_time_stamp) * 1000;
            var seconds = parseInt((currentTime - dataTime) / 60000)
            if (seconds < 1) {
              val.forwardTime = '1分钟前'
            } else if (seconds < 60 && seconds > 1) {
              val.forwardTime = seconds + '分钟前'
            } else if (seconds > 60 && seconds < 1440) {
              val.forwardTime = parseInt(seconds / 60) + '小时前'
            } else if (seconds > 1440) {
              val.forwardTime = parseInt(seconds / 1440) + '天以前'
            }
          }
          var lastArr = this.data.newsData.listData.concat(arr)
          // this.setData({
          //   'leakData.listData': lastArr
          // })
          this.setData({
            "newsData.listData": lastArr,
            "isHidden": true,
            "loadTrue": true
          })
        }else{
          this.setData({
            "isHidden": false,
            "loadTrue": true
          })
        }      
      }
    })
  },
  //热门评论
  comment:function(){
    wx.request({
      url: getUrl('home', 'comment'),
      data:{
        column_id:this.data.column_id,
        content_title:this.data.title,
        offset:0,
        content_id:this.data.content_id,
        cmid:this.data.cmid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var data = res.data;
        if (data.hasOwnProperty("ErrorCode")){
          this.setData({
            "isComment": false
          })
        }else{
          if (data != '') {
            var data = res.data;
            var arr = [];
            for (let result in data) {
              var arr = arr.concat(data[result])
            }
            for (let val of arr) {
              var currentTime = new Date().getTime();
              var dataTime = parseInt(val.pubtime) * 1000;
              var seconds = parseInt((currentTime - dataTime) / 60000)
              if (seconds < 1) {
                val.forwardTime = '1分钟前'
              } else if (seconds < 60 && seconds > 1) {
                val.forwardTime = seconds + '分钟前'
              } else if (seconds > 60 && seconds < 1440) {
                val.forwardTime = parseInt(seconds / 60) + '小时前'
              } else if (seconds > 1440) {
                val.forwardTime = parseInt(seconds / 1440) + '天以前'
              }
            }
            var lastArr = this.data.commentData.concat(arr)
            this.setData({
              "commentData": lastArr,
              "isComment": true
            })
          } else {
            this.setData({
              "isComment": false
            })
          }  
        }     
      }
    })
  },
  toDetail_home: function (e) {
    wx.navigateTo({
      url: `../item/item?id=${e.currentTarget.dataset.id}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'detailId': options.id
    })
    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let id = this.data.detailId;
    let title = this.data.detailItem.title;
    let imageUrl = this.data.detailItem.indexpic.host + this.data.detailItem.indexpic.dir + this.data.detailItem.indexpic.filepath + this.data.detailItem.indexpic.filename;
    let path = `/pages/item/item?id=${id}`;
    return {
      title: title,
      path: path,
      imageUrl:imageUrl,
      success: function (res) {
        // 转发成功
        console.log(res)
      },
      fail: function (res) {
        // 转发失败
        console.log(res)
      }
    }
  }
})