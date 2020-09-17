// pages/leakVideo/leakVideo.js
import getUrl from '../../utils/api.js'
import compare from '../../utils/compare.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoDetail:undefined,
    videoUrl: undefined, 
    datacontent :[],
    contentVideo:[],
    title:undefined,
    newTitle:'',
    duration: undefined,
    videoImage:undefined,
    imageUrl:undefined,
    isWifi:false,    
    coverImageClass:'reveal',
    videoClass:'conceal',
    loadTrue: undefined,  
    isHidden: false, 
    column_id:null,
    name:undefined,
    isHideLoadMore: true,
    dataOffset:0
  },
  init:function(){ 
    const _this = this;
    wx.request({
      url: getUrl('request', 'vod'),
      data:{
          id:_this.data.column_id,
        // count:1,
        // offset:0
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data != '' || res.data.length > 0){
            var dataContent = res.data;
            var title = dataContent.title;
            var name = dataContent.file_name;
            var newName = name.split("/")[0];
            var newTitle = title + "•" + newName;
            var image = dataContent.indexpic.host + dataContent.indexpic.dir + "375x211" + "/" + dataContent.indexpic.filepath + dataContent.indexpic.filename;
            var video = dataContent.video.host + dataContent.video.dir + "/" + dataContent.video.filepath + dataContent.video.filename
            _this.setData({
              "videoUrl": video,
              "imageUrl": image,
              'loadTrue': true,
              'newTitle': newTitle
            })
            wx.setNavigationBarTitle({
              title: newTitle
            })
            _this.torelatedVideo();  
          }else{
            _this.setData({
              "loadTrue":false
            })
          }
        }
        
      })
  },
  //相关视频
  torelatedVideo:function(){
    const _this = this;
    wx.request({
      url: getUrl('request', 'related'),
      data:{
        column_id:_this.data.column_id,
        count:10,
        offset:_this.data.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:function(res){
        var data = res.data;
        var arr = [];
        for (let result in data) {
          var arr = arr.concat(data[result])
        }
        for (let val of arr) {
          var fileName = val.file_name;
          var name = fileName.split("/")[0];
          var videoDuration = val.video.duration;
          var videoHours = parseInt((videoDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          var videoMinutes = parseInt((videoDuration % (1000 * 60 * 60)) / (1000 * 60));
          var videoSecond = parseInt((videoDuration % (1000 * 60)) / 1000);
          if (videoHours < 1) {
            if (videoSecond < 10) {
              val.duration = videoMinutes + ":" + "0" + videoSecond;
            } else {
              val.duration = videoMinutes + ":" + videoSecond;
            }
          } else {
            if (videoSecond < 10 && videoMinutes < 10) {
              val.duration = videoHours + "0" + videoMinutes + ":" + "0" + videoSecond;
            } else if (videoSecond < 10) {
              val.duration = videoHours + ":" + videoMinutes + ":" + "0" + videoSecond;
            }
            val.duration = videoHours + ":" + videoMinutes + ":" + videoSecond;
          }
          val.date_name = name;
        }
        var compareFlag = compare(arr, _this.data.contentVideo);
        if (!compareFlag) {
          var lastArr = _this.data.contentVideo.concat(arr);
          _this.setData({
            'contentVideo': lastArr
          })
        }      
        _this.setData({
          "isHidden": true,
          "loadTrue": true,
          "isHideLoadMore":true
        })
      }
    }) 
    
  },
  toCurrentVideo: function (e) {
    if(e.currentTarget.dataset.type === 'livmedia'){
      var newVideo = e.currentTarget.dataset.video;
      var newTitle = e.currentTarget.dataset.title;
      var newName = e.currentTarget.dataset.name;
      // var newImage = e.currentTarget.dataset.image;
      // var newImg = newImage.host + newImage.dir + "375x211" + "/" + newImage.filepath + newImage.filename;
      var newFileName = newTitle + "•" + newName;
      var video = newVideo.host + newVideo.dir + '/' + newVideo.filepath + newVideo.filename;
      this.setData({
        "videoUrl": video
        // "imageUrl": newImg
      })
      wx.setNavigationBarTitle({
        title: newFileName
      })    
    } else {
      wx.navigateTo({
        url: `../item/item?id=${e.currentTarget.dataset.id}`
      })
    }
  },
  // 加载视频
  // showVideo: function (event) {
  //   var that = this
  //   that.setData({
  //     coverImageClass: 'conceal',
  //     videoClass: 'reveal',
  //     coverVideoSrc: that.data.videoUrl
  //   }, function () {
  //     that.videoContext.play()
  //   })
  // },
  // getWifiEnv: function () {
  //   var that = this
  //   wx.getNetworkType({
  //     success: function (res) {
  //       if (res.networkType == 'wifi') {
  //         that.setData({
  //           isWifi: true
  //         })
  //       }
  //     }
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
      this.setData({
        "column_id": options.id
      })
      // this.getWifiEnv();
      this.init();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('showVideoBox')
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
      "isHideLoadMore":false,
      "dataOffset": this.data.dataOffset + 10
    })
    this.torelatedVideo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let title = this.data.newTitle;
    let id = this.data.column_id;
    let path = `/pages/leakVideo/leakVideo?id=${id}`
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