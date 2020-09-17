// pages/list/list.js
import getUrl from '../../utils/api.js'
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    listData:[],
    isHideLoadMore:true,
    HideLoadMore:true,
    dataOffset:0
  },
  //跳转到详情页
  jumpDetail:function(e){
    var detailId = e.currentTarget.dataset.id
     getApp().globalData.detail_id=detailId;
      wx.navigateTo({
         url: `../voteDetail/index?time=1&detailId=${detailId}`
      })
  },
  //初始化函数
  init: function (refresh) {
    wx.request({
      url: getUrl('vote', 'list'),
      data:{
        count:5,
        offset:this.data.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        if (refresh){
          var dataArr =res.data;      
        }else{
          var dataArr = this.data.listData.concat(res.data);       
        }
        this.setData({
          'listData':dataArr
        })
        this.setData({
          'isHideLoadMore':true
        })
        if(res.data.length==0){
          this.setData({
            'HideLoadMore':false
          })
        }
      },
      fail: () => {
        console.log('请求发送失败')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init(0);
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
    this.setData({
      'dataOffset':0
    })
    this.init(1);
    wx.showNavigationBarLoading()
    //模拟加载
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      'isHideLoadMore':false
    })
    this.setData({
      'dataOffset': this.data.dataOffset+5
    })
    this.init(0)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})