// const app = getApp()
// pages/home/home.js
import getUrl from '../../utils/api.js'
import compare from '../../utils/compare.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['热点直播', '点播', '电视广播', '主播秀'],
    hotList: [],
    currentTab: 0,
    imgUrls: [],
    ishidden: false,
    liveData: [],
    columnData: { //点播
      listData: [],
      dataOffset: 0
    },
    televisionData: { //电视广播
      tvData: [],
      radioData: [],
      tvFlag: false,
      radioFlag: false,
      dataOffset: 0
    },
    id: null,
    isHideLoadMore: true,
    dataOffset: 0,
    clickFlag: true,
    // 主播秀
    tabList: [],
    currentIndex: 0,
    swiperList: [],
    liveBroadcastList: [],
    currntPage: 1,
    count: 6,
    isHideLoadMore: true,
    sort_id: 0,
    hidden: true,
  },
  getImg(filename,width,height) {
    if (!filename) {
      return ''
    }
    filename = filename.replace("\{$hgPicSizeStart\}", "")
    filename = filename.replace("\{$hgPicSizeEnd\}", "")
    filename = filename.replace("\{$hgPicSizeWidth\}", width)
    filename = filename.replace("\{$hgPicSizeHeight\}", height)
    return filename
  },
  // 主播秀
  initAchorShow(data) {
    const _this = this;
    const showList = new Promise((resolve, reject) => {
      if (data) {
        _this.getList(resolve, 0, this.data.sort_id)
      } else {
        _this.getList(resolve, 1, this.data.sort_id)
      }
    })
    const slider = new Promise((resolve, reject) => {
      _this.getSlider(resolve)
    })
    const columnList = new Promise((resolve, reject) => {
      _this.getColumnList(resolve)
    })
    Promise.all([showList, slider, columnList]).then((res) => {
      wx.hideLoading()
      if (res[0] != '') {
        this.setData({
          liveBroadcastList: res[0]
        })
      }
      if (res[1] != '') {
        this.setData({
          swiperList: res[1]
        })
      }
      if (res[2] != '') {
        this.setData({
          tabList: res[2]
        })
      }
      this.setData({
        'isHideLoadMore': true,
        hidden: true
      })
    })
  },
  changeColumn: function (e) {
    var that = this;
    let id = e.currentTarget.dataset.sortId
    that.setData({
      currentIndex: e.currentTarget.dataset.id,
      sort_id: id,
      currntPage: 1,
      hidden: false
    })
    this.getList('', 0, id)
  },
  goDetail: function (e) {
    var that = this;
    var detailId = e.currentTarget.dataset.id;
    getApp().globalData.detail_id = detailId;
    wx.navigateTo({
      url: `../achorShow/index?detailId=${detailId}`
    })
  },
  getList: function (resolve, onReachBottom, id) {
    const that = this
    wx.request({
      url: getUrl('anchorShow', 'list'),
      data: {
        count: that.data.count,
        offset: (that.data.currntPage - 1) * that.data.count,
        sort_id: id,
        is_recommend: id == 0 ? 1 : 0
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        result.data.forEach(item => {
          item.indexpic.filename = this.getImg(item.indexpic.filename,188,106)
        });
        var dataArr = []
        if (onReachBottom) {
          dataArr = this.data.liveBroadcastList.concat(result.data);
        } else {
          dataArr = result.data
        }
        if (resolve) {
          resolve(dataArr)
        } else {
          this.setData({
            liveBroadcastList: dataArr
          })
          if (dataArr.length == 0) {
            this.setData({
              'isHideLoadMore': false
            })
          }
        }
        this.setData({
          'isHideLoadMore': true
        })
      },
      fail: () => {},
      complete: () => {}
    });
  },
  getSlider: function (resolve) {
    const that = this
    wx.request({
      url: getUrl('anchorShow', 'slider'),
      data: {},
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        resolve(result.data[0].childs_data)
      },
      fail: () => {},
      complete: () => {}
    })
  },
  getColumnList: function (resolve) {
    const that = this
    wx.request({
      url: getUrl('anchorShow', 'column'),
      data: {},
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        resolve(result.data)
      },
      fail: () => {},
      complete: () => {}
    });
  },
  init: function () {
    if (this.data.liveData == '') {
      wx.showLoading({
        title: '加载中...'
      })
    }
    this.initData()
    // this.getList(0,this.data.sort_id)
    // this.getColumnList()
    // this.getSlider()
  },
  toLvie: function (e) {
    var imgUrl = e.currentTarget.dataset.pic.host + e.currentTarget.dataset.pic.dir + e.currentTarget.dataset.pic.filepath + e.currentTarget.dataset.pic.filename;
    if (e.currentTarget.dataset.pic == '') {
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
  initData: function () {
    wx.request({
      url: getUrl('live', 'live'),
      data: {
        offset: this.data.dataOffset,
        count: 20
      },
      success: (res) => {
        var arr = this.data.hotList.concat(res.data)
        this.setData({
          'hotList': arr
        })
        wx.hideLoading()
      }
    })
  },
  toHotLive: function (e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: `../hotList/hotList?id=${id}&name=${name}`
    })
  },
  // 选择栏目
  navbarTap: function (e) {
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx
      })
    } else {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx,
        currentIndex: 0,
        sort_id: 0
      })
      this.gethomeList()
      this.getList('', 1, this.data.sort_id)
    }
  },
  // 获取首页，点播
  gethomeList: function () {
    this.setData({
      "columnData.dataOffset": 0,
      "televisionData.dataOffset": 0
    })
    if (this.data.currentTab == 0) {
      this.init();
    } else if (this.data.currentTab == 1) {
      if (this.data.columnData.listData == '') {
        wx.showLoading({
          title: '加载中...',
        })
      }
      this.getClDetails();
    } else if (this.data.currentTab == 2) {
      if (this.data.televisionData.radioData == '' && this.data.televisionData.tvData == '')
        wx.showLoading({
          title: '加载中...',
        })
      this.getTvDetails();
    } else if (this.data.currentTab == 3) {
      if (this.data.swiperList == '' && this.data.tabList == '' && this.data.liveBroadcastList == '')
        wx.showLoading({
          title: '加载中...',
        })
      this.initAchorShow(1)
    }
  },
  //点播
  getClDetails: function () {
    wx.request({
      url: getUrl('request', 'ccolumn'),
      data: {
        count: 20,
        offset: this.data.columnData.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var columnArr = res.data;
        var compareFlag = compare(columnArr, this.data.columnData.listData);
        if (!compareFlag) {
          var lastArr = this.data.columnData.listData.concat(columnArr);
          this.setData({
            "columnData.listData": lastArr
          })
        }
        this.setData({
          'isHideLoadMore': true
        })
        wx.hideLoading()
      }
    })
  },
  toDetail_leak: function (e) {
    var fid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../leakList/leakList?fid=${fid}&title=${e.currentTarget.dataset.title}`
    })
  },
  //电视广播
  getTvDetails: function () {
    const _this = this;
    const tvList = new Promise((resolve, reject) => {
      _this.getTvList(resolve)
    })
    const radioList = new Promise((resolve, reject) => {
      _this.getRadioList(resolve)
    })
    Promise.all([tvList, radioList]).then((res) => {
      //  console.log(res[0].data)
      wx.hideLoading()
      if (res[0].data != '') {
        this.setData({
          "televisionData.tvData": res[0].data,
          "televisionData.tvFlag": true
        })
      }
      if (res[1].data != '') {
        this.setData({
          "televisionData.radioData": res[1].data,
          "televisionData.radioFlag": true
        })
      }
      this.setData({
        'isHideLoadMore': true
      })
    })
  },
  //电视广播电视接口
  getTvList: function (resolve) {
    wx.request({
      url: getUrl('television', 'channel'),
      data: {
        count: 20,
        offset: this.data.televisionData.dataOffset
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
  //电视广播广播接口
  getRadioList: function (resolve) {
    wx.request({
      url: getUrl('television', 'channel_copy'),
      data: {
        count: 20,
        offset: this.data.televisionData.dataOffset
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
  //电视广播
  toLive: function (e) {
    // console.log(e)
    var imgUrl = JSON.stringify(e.currentTarget.dataset.imgurl)
    wx.navigateTo({
      url: `../live/live?id=${e.currentTarget.dataset.id}&num=${e.currentTarget.dataset.num}&imgurl=${imgUrl}&title=${e.currentTarget.dataset.title}&m3u8=${e.currentTarget.dataset.videourl}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取微信登陆的access_token
    var token = wx.getStorageSync('token');
    var avatar = wx.getStorageSync('avatar');
    var oldTime = wx.getStorageSync('timestamp');
    // var nowTime = Date.parse(new Date());
    // nowTime = nowTime / 1000;
    // var catchTime = 259200;
    // if (nowTime - oldTime > catchTime){
    //   wx.clearStorageSync()
    // }
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
    // //模拟加载
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
      'isHideLoadMore': false
    })
    if (this.data.currentTab == 0) {
      this.setData({
        'dataOffset': this.data.dataOffset + 20
      })
      this.initData() //热点直播
    } else if (this.data.currentTab == 1) {
      this.setData({
        'columnData.dataOffset': this.data.columnData.dataOffset + 20
      })
      this.getClDetails() //点播
    } else if (this.data.currentTab == 2) {
      this.setData({
        'televisionData.dataOffset': this.data.televisionData.dataOffset + 20
      })
      this.getTvDetails() //主播秀
    } else if (this.data.currentTab == 3) {
      this.setData({
        currntPage: this.data.currntPage + 1
      })
      this.getList('', 1, this.data.sort_id)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let title = "海博TV";
    let path = `/pages/liveIndex/home`;
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