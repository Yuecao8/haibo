//index.js
//获取应用实例
const app = getApp()
import getUrl from '../../utils/api.js'
Page({
  data: {
    newsData:{
      listData: [],
      dataOffset: 0,
      isHideLoadMore: true,
      HideLoadMore: true,
      hasData: false
    }
  },
  initData_news:function(){
    var id = app.globalData.detail_id;
    wx.request({
      url: getUrl('vote', 'news'),
      data:{
        a:'getSingleVote',
        operation_name:'new',
        vote_id:id,
        count:10,
        offset:this.data.newsData.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        var data=res.data[0].data;
        if (data.ErrorCode =='0x000001'){
            this.setData({
              'newsData.hasData':true
            })
        }else{
        var arr=[]
        //判断数据请求是否为空
        if (data.length==0){
          this.setData({
            'newsData.isHideLoadMore':true,
            'newsData.HideLoadMore':false
          })
        }else{
        for(let result in data){ 
          var arr = arr.concat(data[result])
        }
        for(let val of arr){
          var currentTime = new Date().getTime();
          var dataTime = parseInt(val.publish_time_default) * 1000;
          var seconds = parseInt((currentTime - dataTime) / 60000)
          if (seconds < 1) {
              val.forwardTime='1分钟前'
          } else if (seconds < 60 && seconds>1){
              val.forwardTime=seconds + '分钟前'
          } else if (seconds > 60 &&seconds<1440) {
              val.forwardTime=parseInt(seconds / 60) + '小时前'
          } else if (seconds > 1440 ){
              val.forwardTime=parseInt(seconds/1440)+'天以前'
          }
        }
          var lastArr = this.datanewsData.listData.concat(arr)
        this.setData({
          'newsData.listData': lastArr
        })
      }}}
    })
  },
  //跳转到详情页
  jumpDetail_news:function(e){
    wx.navigateTo({
      url: `../voteNews/index?id=${e.currentTarget.dataset.id}&type=$  {e.currentTarget.dataset.type}`
    })
  },
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    this.setData({
      'newsData.listData':[],
      'newsData.dataOffset': 0,
      'newsData.HideLoadMore':true
    })
    this.initData_news();
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
      'newsData.isHideLoadMore': false
    })
    this.setData({
      'newsData.dataOffset': this.data.newsData.dataOffset + 1
    })
    this.initData_news()
  },
  onShow: function () {
    this.initData_news()
  },
  onReady: function () {
    // this.tarBar = this.selectComponent("#tarBar");
    // this.tarBar.initData(3)
  }
})
