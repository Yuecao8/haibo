// pages/hotTw/hotTw.js
import getUrl from '../../utils/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:null,
    title:'',
    imageArr:[],
    twAvatar:'',
    twContent:'',
    twUser:'',
    twTime:null,
    showFalg:false
  },
  init:function(){
    wx.setNavigationBarTitle({
      title: this.data.title
    })
    wx.request({
      url: getUrl('live', 'twdetail'),
      data:{
        id:this.data.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        let data = res.data[0];
        const dataTime = data.create_time;
        const dataContent = data.content;
        if (data.hasOwnProperty('material')){
            const dataArr = data.material;
            this.setData({
                "imageArr": dataArr 
            })
        }       
        const dataUser = data.user_name;
        const dataAvatar = data.avatar;
        this.setData({          
          "twTime": dataTime,
          "twContent": dataContent,
          "twUser": dataUser,
          "twAvatar": dataAvatar,
          "showFalg": true
        })
      }
    })
  },
  previewImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var oldImg = this.data.imageArr;
    var imgArr = [];
    for (var i = 0; i < oldImg.length;i++){
      imgArr[i] = oldImg[i].host + oldImg[i].dir + oldImg[i].filepath + oldImg[i].filename
    }
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      const twId = options.id;
      const twTitle = options.title;
      this.setData({
        "title": twTitle,
        "id": twId
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
    let id = this.data.id;
    let title = this.data.title;
    let path = `/pages/hotTw/hotTw?id=${id}&title=${title}`;
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