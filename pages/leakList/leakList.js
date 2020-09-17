// pages/leakList/leakList.js
import getUrl from '../../utils/api.js'
import compare from '../../utils/compare.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid:undefined,
    leakdetail:{
      listData:[],
      dataOffset:0
    },
    name:undefined,
    isHideLoadMore: true,
    leakFlag:true
  },
  init:function(){
    wx.setNavigationBarTitle({
      title: this.data.name
    })
    wx.request({
      url: getUrl('request', 'sub_column'),
      data:{
        column_id:this.data.fid,
        count:10,
        offset:this.data.leakdetail.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // this.setData({
        //   "leakdetail.listData": leakdetail
        // })
        var data = res.data; 
        var arr = [];
        for (let result in data) {
          var arr = arr.concat(data[result])
        }
        for (let val of arr) {
          var currentTime = new Date().getTime();
          var formatEnd = val.publish_time_stamp;
          var EndTime = formatEnd*1000;
          // var endtimeData = val.date;
          // var formatEnd = endtimeData.replace(/-/g, '/')
          // var EndTime = Date.parse(new Date(formatEnd));
          var seconds = parseInt((currentTime - EndTime) / 60000)
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
        var compareFlag = compare(arr, this.data.leakdetail.listData);
        if (!compareFlag) {
          var lastArr = this.data.leakdetail.listData.concat(arr)
          this.setData({
            'leakdetail.listData': lastArr
          })
        }
        // var lastArr = this.data.leakdetail.listData.concat(arr)
        this.setData({
          // 'leakdetail.listData': lastArr,
          'isHideLoadMore':true
        })
        if (this.data.leakdetail.listData == ''){
          this.setData({
            'leakFlag':false
          })
        }
        wx.hideLoading()
      }
    })
  },
  toLeakVideo:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../leakVideo/leakVideo?id=${id}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        "fid": options.fid,
        "name": options.title
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
      this.setData({
        "isHideLoadMore":false
      })
      this.setData({
        'leakdetail.dataOffset': this.data.leakdetail.dataOffset + 10
      })
      this.init()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let fid = this.data.fid
    let name = this.data.name
    let path = `/pages/leakList/leakList?fid=${fid}&title=${name}`
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