// pages/hotList/hotList.js
import getUrl from '../../utils/api.js'
import compare from '../../utils/compare.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:null,
    sid: null , 
    liveOld: {
      listData: [],  //热点直播回顾
      liveFlag: false
    },
    liveNow: {
      listData: [],  //热点直播
      liveFlag: false
    },
    liveNew: {
      listData: [],  //热点直播预告
      liveFlag: false
    },
    isHideLoadMore:true,
    dataOffset:0
  },
  initData: function () {
    wx.setNavigationBarTitle({
      title: this.data.title
    })
    const _this = this;
    const liveold = new Promise((resolve, reject) => {
      _this.getliveold(resolve)
    })
    const livenow = new Promise((resolve, reject) => {
      _this.getlivenow(resolve)
    })
    const livenew = new Promise((resolve, reject) => {
      _this.getlivenew(resolve)
    })
    Promise.all([liveold, livenow, livenew]).then((res) => {
      if (res[0].data != '') {
        var liveOldArr = res[0].data;
        var liveOldFlag = compare(liveOldArr, this.data.liveOld.listData);
        if (!liveOldFlag) {
          var lastArr = this.data.liveOld.listData.concat(liveOldArr);
          this.setData({
            "liveOld.listData": lastArr,
            "liveOld.liveFlag": true
          })
        }
      }
      if (res[1].data != '') {
        var liveNowArr = res[1].data;
        var liveNowFlag = compare(liveNowArr, this.data.liveNow.listData);
        if (!liveNowFlag) {
          var lastArr = this.data.liveNow.listData.concat(liveNowArr);
          this.setData({
            "liveNow.listData": lastArr,
            "liveNow.liveFlag": true
          })
        }
      }
      if (res[2].data != '') {
        var liveNewArr = res[2].data;
        var liveNewFlag = compare(liveNewArr, this.data.liveNew.listData);
        if (!liveNowFlag) {
          var lastArr = this.data.liveNew.listData.concat(liveNewArr);
          this.setData({
            "liveNew.listData": lastArr,
            "liveNew.liveFlag": true
          })
        }
      }
      wx.hideLoading()
      this.setData({
        'isHideLoadMore': true
      })
    })
  },
  //回顾
  getliveold: function (resolve) {
    wx.request({
      url: getUrl('live', 'live'),
      // url:`http://hotlive-dev.tw.live.hoge.cn/index.php?m=Apituwenol&c=thread&a=show&custom_appid=83&custom_appkey=G8FHXedPgl4i7sA2rfUISxfaB0NB5WJC`,
      data:{
        show_tailer:0,
        offset:this.data.dataOffset,
        count:20,
        sid:this.data.sid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  },
  toLvie: function (e) {
    var imgUrl = e.currentTarget.dataset.pic.host + e.currentTarget.dataset.pic.dir + e.currentTarget.dataset.pic.filepath + e.currentTarget.dataset.pic.filename;
    if (e.currentTarget.dataset.pic == ''){
      var imgUrl = ''
    }
    var liveURL = e.currentTarget.dataset.liveurl;
    if (e.currentTarget.dataset.liveurl == undefined || e.currentTarget.dataset.liveurl == null || e.currentTarget.dataset.liveurl == '') {
      var liveURL = ''
    }
    wx.navigateTo({
      url: `../hotLive/hotLive?liveurl=${liveURL}&id=${e.currentTarget.dataset.id}&title=${e.currentTarget.dataset.title}&pic=${imgUrl}`
    })
  },
  // 直播
  getlivenow: function (resolve) {
    wx.request({
      url: getUrl('live', 'live'),
      data:{
        show_tailer:2,
        offset:this.data.dataOffset,
        count:2,
        sid:this.data.sid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  },
  // 预告
  getlivenew: function (resolve) {
    wx.request({
      url: getUrl('live', 'live'),
      data:{
        show_tailer:1,
        offset:this.data.dataOffset,
        count:20,
        side:this.data.sid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sid = options.id;
    var title = options.name;
    this.setData({
      'sid':sid,
      'title':title
    })
    this.initData()
    wx.showLoading({
      title: '加载中...',
    })
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
    this.setData({
      'dataOffset': this.data.dataOffset + 20,
      'isHideLoadMore':false
    })
    this.initData() //热点直播
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let id = this.data.sid;
    let name = this.data.title;
    let path = `/pages/hotList/hotList?id=${id}&name=${name}`;
    return {
      title: name,
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