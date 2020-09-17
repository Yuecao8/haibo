// pages/live/live.js
import getUrl from '../../utils/api.js'
const myaudio = wx.createInnerAudioContext();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title:undefined,
    channel_id:'',
    zone:0,
    videoUrl:undefined,
    dateArr:[],
    currentTab:5,
    videoMenu:[],
    currentMenu:null,
    currentFlag:false,
    tabNum:null,
    defaultFlag:true,
    isAudio:0,
    loadTrue:undefined,
    imgUrl: undefined,
    //音乐是不是开始
    music_on: false,
    //音乐是不是在播放
    music_playing: false,
    audio_state:false,
    scrollTop:null,
  },
  init:function(){
    const _this = this;
    wx.setNavigationBarTitle({
      title: _this.data.title
    })
    var dates = [];
    var tt = _this.getDateStr(1)
    dates.push({ date: tt });
    for(var i=0;i>-6;i--){
      var dt = _this.getDateStr(i)
      dates.push({date:dt})
    }
    var newDate = dates.reverse();
    _this.setData({
      "dateArr": newDate
    })
    _this.getTvshow();
    _this.getProgram();
  },
  //获取当天日期
  getDateStr:function(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    // var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);//获取当前月份的日期，不足10补0
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();//获取当前几号，不足10补0
    return  m + "月" + d + "日";
  },
  //获取当前节目
  getTvshow:function(){
    wx.request({
      url: getUrl('television', 'channel_detail'),
      data:{
        channel_id:this.data.channel_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log(res)
        var data = res.data[0];
        this.setData({
          "videoUrl":data.m3u8
        })       
      }
    })
  },
  // 获取节目单
  getProgram:function(){
    // console.log(this.data.currentTab)
    var tabFlag = this.data.currentTab;
    var zeFlag;
    switch (tabFlag)
    {
      case 0:
        zeFlag = -5;
        break;
      case 1:
        zeFlag = -4;
        break;
      case 2:
        zeFlag = -3;
        break;
      case 3:
        zeFlag = -2;
        break;
      case 4:
        zeFlag = -1;
        break;
      case 5:
        zeFlag = 0;
        break;
      case 6:
        zeFlag = 1;
        break;
    }
    this.setData({
      "zone": zeFlag
    })
    wx.request({
      url: getUrl('television', 'program'),
      data:{
        channel_id:this.data.channel_id,
        zone:this.data.zone
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log(res)
        var datamenu = res.data;
        var idx = res.data.findIndex(item=>item.now_play == 1)
        this.setData({
          "videoMenu": datamenu,
          "loadTrue":true,
          "scrollTop":idx>3 ? idx-2 : 0 // 当前播放的内容滚动到页面中间
        })
      }
    })
  },
  //选择节目
  checkProgram:function(e){
    // console.log(e)
    var tvUrl = e.currentTarget.dataset.tvurl;
    this.setData({
        "videoUrl":tvUrl,
        "currentMenu": e.currentTarget.dataset.num,
        "currentFlag": true,
        "defaultFlag": false,
        "music_on": false,
        "music_playing": true,
        "audio_state": false
    })
    if (this.data.currentFlag == true) {
      this.setData({
        "tabNum": this.data.currentTab
      })
    }
  },
  // 滚动事件
  scroll:function(e){
    // console.log(e)
  },
  // 选择日期
  navbarTap:function(e){
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx
      })
    } else {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx
      })
      // console.log(this.data.tabNum)
      // console.log(this.data.currentTab)
      if (this.data.tabNum != this.data.currentTab){
        this.setData({
          "currentFlag":false
        })
      }else{
        this.setData({
          "currentFlag": true
        })
      }
      this.getProgram()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // console.log(options)
      var imgUrl = JSON.parse(options.imgurl)
      this.setData({
        "channel_id":options.id,
        "isAudio": options.num,
        "imgUrl": imgUrl,
        "title":options.title
      })
      this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.audioCtx = wx.createAudioContext('myAudio');
    this.audioCtx.play();
    this.setData({
      "music_on":true,
      "music_playing":true,
      "audio_state":true
    })
  },
  // 广播播放暂停
  playAudio: function () {
    this.audioCtx.pause()
    //图片添加css样式，旋转样式
    this.setData({
      "music_on": true,
      "music_playing": false,
      "audio_state": false
    })
  },
  stopAudio: function () {
    this.audioCtx.play();
    this.setData({
      "music_on": true,
      "music_playing": true,
      "audio_state": true
    })
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
    let imgUrl = JSON.stringify(this.data.imgUrl)  
    let id = this.data.channel_id
    let num = this.data.isAudio
    let title = this.data.title
    let path = `/pages/live/live?id=${id}&num=${num}&imgurl=${imgUrl}&title=${title}`
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