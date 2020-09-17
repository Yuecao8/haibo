//index.js
//获取应用实例
const app = getApp()
import getUrl from '../../utils/api.js'
Page({
  data: {
    option_id:undefined,
    listData:undefined,
    index:undefined,
    is_modal_Hidden: true,
    is_modal_Msg: '当前操作需要登录哦,是否登录？',
    maskDisplay: false,
    verifyDisplay:false,
    verifyType:'',
    detail_id:undefined,
    verifyState: 0,
    verifyStaus:undefined,
    verifySession:undefined,
    inputValue:'',
    hasVote:false,
    voteStausMessage:'',
    votepic:'',
    pub_info:[],
    personalData:{
      audio:[],
      video:[],
      pic:[]
    }
  },
  initData:function(){
    // var id = app.globalData.detail_id; 
    var id = this.data.detail_id;
    // console.log(id)
    wx.request({
      url: getUrl('vote','personal'),
      data:{
        id:id,
        a:'getVoteOption',
        option_id:this.data.option_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        var info=res.data[0].vote_info;
        if (res.data[0].hasOwnProperty("pub_info") && res.data[0].pub_info !=""){
          this.setData({
            'pub_info': res.data[0].pub_info
          })
        }
        if (info.hasOwnProperty("audio") && res.data[0].vod_info.audio != "") {
          this.setData({
            'personalData.audio': res.data[0].vod_info.audio
          })
        }
        if (info.hasOwnProperty("video") && res.data[0].vod_info.video != "") {
          this.setData({
            'personalData.video': res.data[0].vod_info.video
          })
        }
        if (res.data[0].hasOwnProperty("pic") && res.data[0].pic != "") {
          this.setData({
            'personalData.pic': res.data[0].pic
          })
        }
          // this.setData({
          //   'personalData.audio': res.data[0].vod_info.audio,
          //   'personalData.video': res.data[0].vod_info.video,
          //   'personalData.pic': res.data[0].pic
          // })     
        if(info.start_time != 0 && info.end_time != 0){
          var nowTime = Date.parse(new Date());
          var startTime = Date.parse(new Date(info.start_time));
          var endTime = Date.parse(new Date(info.end_time));
          var totalSecond = (nowTime - startTime) / 1000; 
          var endSecond = (endTime - nowTime) / 1000; 
          if(totalSecond > 0 && endSecond > 0){            
          }else if(totalSecond < 0){
            this.setData({
              'voteStausMessage':"即将开始",
              'hasVote':true
            })
          }else if(endSecond<0){
            this.setData({
              'voteStausMessage': "已结束",
              'hasVote': true
            })
          }
        }     
        // if (info.status_flag == 'will' || info.status_flag == 'over'){
        //   this.setData({
        //     'voteStausMessage':info.status_text,
        //     'hasVote':true
        //   })
        // }
        this.setData({
          listData:res.data[0],
          verifyStaus: res.data[0].vote_info.is_verify_code,
          verifyType: res.data[0].vote_info.verify_type,
          votepic: res.data[0].vote_info.index_img
        })
      }
    })
  },
  //投票提交
  submit:function(){
    if (this.data.verifyStaus == 1 && this.data.verifyState == 0) {
      this.setData({
        'verifyDisplay': true,
        'verifyState': 1
      })
      this.selectComponent('#verify1').xhrVerify();      
    } else {
      this.xhrButton()
    }
  },
  // 提交请求
  xhrButton: function () {
    // var id = app.globalData.detail_id;  
    var id = this.data.detail_id;     
    wx.request({
      url: getUrl('permissionVote', 'submit'),
      data:{
        id:id,
        a:'vote_add',
        option_id:this.data.option_id,
        verify_code:this.data.inputValue,
        session_id:this.data.verifySession,
        access_token:wx.getStorageSync('token')
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.ErrorCode == "NO_ACCESS_TOKEN") {
          this.setData({
            is_modal_Hidden: false,
            maskDisplay: true
          })
        } else if (res.data.ErrorCode == '会员未登录') {
          this.setData({
            is_modal_Hidden: false,
            maskDisplay: true
          })
        } else {         
          if (res.data[0] == 'success') {
            this.setData({
              'verifyDisplay': false,
              'verifyState': 0,
              'hasVote':true,
              'voteStausMessage':'已投票'
            })
            wx.showToast({
              title: '投票成功',
              icon: 'success',
              duration: 1500
            })
            this.initData()
          } else {
            if (this.data.verifyStaus == 1) {
              this.selectComponent('#verify1').xhrVerify();
              this.setData({
                'inputValue': ''
              })
            }
            var dataError = res.data.ErrorCode;
            var that = this;
            wx.showModal({
              title: '提示',
              content: dataError,
              shoowCancel: false,
              success: function (res) {
                if (res.confirm) {
                  that.selectComponent('#verify1').emptyInput()
                  if (dataError.indexOf('同一用户最多') != -1) {
                    that.setData({
                      'inputValue': '',
                      'verifyDisplay': false
                    })
                  }
                } else if (res.cancel) {
                  that.selectComponent('#verify1').emptyInput()
                  if (dataError.indexOf('同一用户最多') != -1) {
                    that.setData({                  
                      'verifyDisplay': false
                    })
                  }
                }
              }
            })
          }
        }
      }
    })
  },
  //引用跳转
  toArticle: function (e) {
    wx.navigateTo({
      url: `../voteNews/index?id=${e.currentTarget.dataset.id}&type=${e.currentTarget.dataset.type}`
    })
  },
  //返回到活动页面
  toReturn:function(e){
    // wx.navigateBack({ changed: true });
    if (this.data.detail_id == app.globalData.detail_id){
      wx.navigateBack({ changed: true });
    }else{
      wx.navigateTo({
        url: `../home/index?time=1&detailId=${this.data.detail_id}`
      })
    }   
  },
  //遮罩层隐藏
  onGetCode: function (e) {
    if (e.detail) {
      this.setData({
        maskDisplay: false
      })
    }
  },
  params:function(e){
    this.setData({
      inputValue: e.detail.inputValue,
      verifySession: e.detail.verifySession
    })
  },
  onLoad: function (options) {
    this.setData({
      option_id: options.optionId,
      index: options.indexId,
      detail_id: options.detailId
    })
    this.initData()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let title = this.data.title;
    let path = `/pages/personal/index?optionId=${this.data.option_id}&indexId=${this.data.index}&detailId=${this.data.detail_id}`
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
