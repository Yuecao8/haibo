// const app = getApp()
// pages/home/home.js
import getUrl from '../../utils/api.js'
Page({ 
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    imgUrls: [],
    ishidden:false,
    newsData: {
      listData: [],
      hasData: false,
      dataOffset: 0
    },
    isHideLoadMore: true,
    HideLoadMore: true,
    dataOffset: 0,
    // is_modal_Hidden: false,
    // is_modal_Msg: '当前操作需要登录哦,是否登录？',
    // maskDisplay: true
  },
  // 跳转投票和直播页
  goPage:function(e){
    if(e.currentTarget.dataset.flag == 'vote') {
      wx.navigateTo({
        url: '../voteIndex/list',
      })
    } else {
      wx.navigateTo({
        url: '../liveIndex/home',
      })
    }
  },
  init:function(){
    wx.showLoading({
      title: '加载中...',
    })
    this.homelistContent();
    // 获取轮播图
    wx.request({
      url: getUrl('home', 'news_slide'),
      data:{
        column_id:1731,
        weight:90
      },
      success: (res) => { 
        var arrImg = res.data;
        this.setData({
            'imgUrls':arrImg,
            'ishidden':false
        }) 
      }
    })
  },
  // 获取新闻列表
  homelistContent:function(){
    wx.request({
      url: getUrl('home', 'news'),
      data:{
        site_id:1,
        count:5,
        offset:this.data.newsData.dataOffset,
        column_id:1731,
      },
      success: (res) => {
        var data = res.data.list;
        if (data.ErrorCode == '0x000001') {
          this.setData({
            'newsData.hasData': true
          })
        } else {
          var arr = []
          for (let result in data) {
            var arr = arr.concat(data[result])
          }
          for (let val of arr) {
            var currentTime = new Date().getTime();
            var dataTime = parseInt(val.publish_time_stamp) * 1000;
            var seconds = parseInt((currentTime - dataTime) / 60000);
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
          this.setData({
            'newsData.listData': lastArr,
            'isHideLoadMore': true,
            'ishidden': true
          })
          wx.hideLoading()
        }
      }
    })
  },
  // 跳转详情页
  goDetail: function (e) { 
    wx.navigateTo({
      url: `../item/item?id=${e.currentTarget.dataset.id}`
    })
  },
  //遮罩层隐藏
  // onGetCode: function (e) {
  //   if(e.detail){
  //     this.setData({
  //       maskDisplay:false
  //     })
  //   }
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    // this.setData({
    //   'dataOffset': 0
    // })
    // this.init();
    // wx.showNavigationBarLoading()
    // // //模拟加载
    // setTimeout(function () {
    //   wx.hideNavigationBarLoading() //完成停止加载
    //   wx.stopPullDownRefresh() //停止下拉刷新
    // }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      'isHideLoadMore': false,
      'newsData.dataOffset': this.data.newsData.dataOffset + 5
    })
    this.homelistContent();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let title = "海博TV";
    let path = `/pages/home/home`;
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