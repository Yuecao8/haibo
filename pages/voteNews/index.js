// pages/detail/index.js
import getUrl from '../../utils/api.js'
var WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId:undefined,
    articleType:undefined,
    id:0,
    title:'',
    source:undefined,
    author:undefined,
    time:undefined,
    Introduction:undefined,
    article: undefined,
    article1:undefined,
    subtitle: undefined,
    keyword: undefined,
    column: undefined,
    label: undefined,
    link: undefined,
    adder: undefined,
    oplog:{},
    mockDay:'04-04',
    mockTime:'12:00',
    hiddenmodalput:true,
    userInput:undefined,
    requestUrl:undefined,
    auditStaus:0,
    returnStaus:0,
    flow_status:undefined,
    app_uniqueid:undefined,
    reviewRecord:false,
    detailStaus:undefined,
    detailIndex:undefined,
    video_m3u8:undefined,
    videoImg:undefined,
    tuji:[],
    showFlag:false
  },
  //页面初始化
  init: function () {
    wx.showLoading({
      title: '正在加载中...',
    })
    var that = this;
    wx.request({
      url: getUrl('permissionVote', 'article'),
      data:{
        id:that.data.articleId,
        app_uniqueid:that.data.articleType,
        // access_token:wx.getStorageSync('token')
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      dataType: 'json',
      success: function (res) {
        var data = res.data;
        if (data.ErrorCode) {
          wx.showToast({
            title: data.ErrorCode,
            icon: 'none',    //如果要纯文本，不要icon，将值设为'none'
            duration: 2000     
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1 // 1返回上一个界面，2返回上上个页面
            })
          }, 2000)
          return
        }
        //判断稿件的类型 文稿or视频or图集
        if (that.data.articleType == 'news') {
          var detailContent = data.content;
          var reg = /\<div[^\>]+m2o_mark=\"(.*?)_(.*?)\"+.*?>[\r\n.]*\<\/div\>/gi;
          var detailContentNew = detailContent.replace(reg, function (match, val, num, index, str) {
            if (val == "pic") {
              return '<img src=' + '"' + data.material[num].pic.host + data.material[num].pic.dir + data.material[num].pic.filepath + data.material[num].pic.filename + '"' + '/>'
            } else {
              var url = val + "_" + num;
              return '<video src=' + '"' + data.content_material_list[url].video_url + '"' + '></video>'
            }
          })
          WxParse.wxParse('article1', 'html', detailContentNew , that, 5);
        } else if (that.data.articleType == 'vod') {            
          that.setData({
            video_m3u8: `${data.video.host}${data.video.dir}${data.video.filepath}${data.video.filename}`,
            videoImg: `${data.indexpic.host}${data.indexpic.dir}${data.indexpic.imgwidth}x${data.indexpic.imgheight}/${data.indexpic.filepath}${data.indexpic.filename}`
          })
        } else if (that.data.articleType == 'tuji') {              
          that.setData({
            tuji: data.childs_data
          })
        }
        //初始化赋值
        that.setData({
          id: data.id,
          title: data.title,
          source: data.source,
          author: data.author,
          Introduction: data.brief,
          article: data.content,
          showFlag:true
        })  
        wx.hideLoading()            
      },
      fail: function (data) {
        console.log(data, 'data')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      articleId: options.id,
      articleType:options.type
    })  
    this.init();           
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
    let id = this.data.articleId;
    let type = this.data.articleType;
    let title = this.data.title;
    let path = `/pages/voteDetail/index?id=${id}&type=${type}&title=${title}`
    return {
      title: title,
      path: path,
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