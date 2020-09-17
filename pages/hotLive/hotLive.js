// pages/hotLive/hotLive.js
//  const app = getApp()
import getUrl from '../../utils/api.js'
import compare from '../../utils/compare.js'
Page({ 
  /**
   * 页面的初始数据
   */
  data: {
    liveInfo:{},
    title:null,
    videoUrl:'',
    topic_id: null,
    tabArr:["直播","聊天室"],
    twArr:{
      datalist:[],
      offset:0
    },
    chatArr:{
      datalist:[],
      offset:0
    },
    currentTab:0,
    isHideLoadMore:true,
    avatar: null,
    commentCnt:'',
    cmmtFlag:false,
    errorFlag:false,
    tipsContent: null,
    token:'',
    reply_id:'',
    thread_id:'',
    respondFlag:false,
    dataCnt: null,
    dataZb: true,
    cmmtCnt:'',
    circulateTw:'',
    circulateCt:'',
    imgUrl:'',
    showFalg:false,
    is_modal_Hidden: true,  
    is_modal_Msg: '当前操作需要登录哦,是否登录？',
    maskDisplay: false,
    member_id:''
  },
  init:function(){
    wx.setNavigationBarTitle({
      title: this.data.title
    })
    // 直播详情
    wx.request({
      url:getUrl('fjlive','detail'),
      data:{
        id:this.data.topic_id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        this.setData({
          liveInfo:res.data
        })
      }
    })
    // 直播信息列表
    wx.request({
      url:getUrl('fjlive','msg_list'),
      data:{
        topic_id:this.data.topic_id,
        offset:this.data.twArr.offset,
        count:20,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // 验证登陆
        var access_token = wx.getStorageSync('token');
        if (access_token == '') {
          this.setData({
            "is_modal_Hidden": false,
            "maskDisplay": true,
          })
        }
        var data = res.data;
        if (res.data != '') {
          this.setData({
            'dataZb': true
          })
        }else{
          this.setData({
            'dataZb': false
          })
        }
        var compareFlag = compare(data, this.data.twArr.datalist);
        if (!compareFlag) {
          var lastArray = this.data.twArr.datalist.concat(data);
          this.setData({
            "twArr.datalist": lastArray
          })
        }
        this.setData({
          "showFalg":true
        })
        wx.hideLoading()
      }
    })
    // wx.request({
    //   url:`http://hotlive-dev.tw.live.hoge.cn/index.php`,
    //   data:{
    //     m:'Apituwenol',
    //     c:'tuwenol',
    //     a:'detail',
    //     custom_appid:'83',
    //     custom_appkey:'G8FHXedPgl4i7sA2rfUISxfaB0NB5WJC',
    //     id:this.data.topic_id
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success:(res)=>{
    //     console.log(res)
    //   }
    // })
    this.getcomment()
    this.zbRefesh()
  },
  // 直播，聊天室选择Tab
  navbarTap:function(e){
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx
      })
    } else {
      this.setData({
        "currentTab": e.currentTarget.dataset.idx
      })
      if (this.data.currentTab == 0){
        this.gettw()
        this.zbRefesh()
        clearInterval(this.data.circulateCt) 
      } else if (this.data.currentTab == 1){
        this.getcomment()
        this.ctRefesh()
        clearInterval(this.data.circulateTw)
      }
    }
  },
  // 获取直播信息
  gettw:function(){
    wx.request({
      url:getUrl('fjlive','msg_list'),
      data:{
        topic_id:this.data.topic_id,
        offset:this.data.twArr.offset,
        count:20,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log(res)
        var data =res.data;
        if (res.data != '') {
          this.setData({
            'dataZb': true
          })
        }
        // else{
        //   this.setData({
        //     'dataZb': false
        //   })
        // }
        var compareFlag = compare(data, this.data.twArr.datalist);
        if (!compareFlag){
          var lastArray = this.data.twArr.datalist.concat(data);
          this.setData({
            "twArr.datalist": lastArray
          })
        }
      }
    })
  },
  // 获取聊天室信息
  getcomment:function(){
    wx.request({
      url:getUrl('fjlive','comment_list'),
      data:{
        topic_id:this.data.topic_id,
        offset:this.data.twArr.offset,
        count:20,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log(res)
        if(res.data != ''){
            this.setData({
              'dataCnt': true
            })
        }
        var data = res.data;        
        var compareFlag = compare(data, this.data.chatArr.datalist);
        if (!compareFlag){
            var lastArray = this.data.chatArr.datalist.concat(data);
            this.setData({
              "chatArr.datalist": lastArray
            })
        }       
      }
    })
  },
  //图文消息详情
  twDetail:function(e){
    const twId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../hotTw/hotTw?id=${twId}&title=${this.data.title}`
    })
  },
  // 加载更多
  lower:function(){
    if (this.data.currentTab == 0) {
      this.setData({
        'twArr.offset': this.data.twArr.offset + 20
      })
      this.gettw()
    } else if (this.data.currentTab == 1){
      this.setData({
        'chatArr.offset': this.data.chatArr.offset + 20
      })
      this.getcomment()
    }
  },
  // 显示输入框
  modalCmmt:function(e){
    var token = wx.getStorageSync("token")
    var replayId = e.currentTarget.dataset.replayid; 
    var threadId = e.currentTarget.dataset.threadid;
    if(token == ''){
      this.setData({
        "is_modal_Hidden": false,
        "maskDisplay": true
      })
    } else if (replayId){
      this.setData({
        "cmmtFlag": true,
        "cmmtCnt":"回复",
        "reply_id": replayId,
        "respondFlag":true
      })
    } else if (threadId){
      this.setData({
        "cmmtFlag": true,
        "cmmtCnt": "回复",
        "thread_id": threadId,
        "respondFlag": true
      })
    }else{
      this.setData({
        "cmmtFlag": true,
        "cmmtCnt": "评论",
        "respondFlag": false
      })
    }
  },
  // 绑定输入框
  bindinput:function(e){
      // console.log(e)
      this.setData({
        "commentCnt": e.detail.value
      })
  },
  // 返回评论
  backBtn:function(){
    this.setData({
      "cmmtFlag": false
    })
  },
  // 完成评论
  formSubmit:function(){
    const _this = this;
    let respond = this.data.respondFlag;
    if (_this.data.commentCnt == '') {
      _this.setData({
        "tipsContent":"评论失败",
        "errorFlag": true,
        "cmmtFlag": false
      })
      setTimeout(function(){
        _this.setData({
          "errorFlag": false
        })
      },1000)
    } else if (respond){
      const currentFlag = this.data.currentTab;
      if (currentFlag == 0){
        wx.request({
          url:getUrl('fjlive','comment_send'),
          // method: 'POST',
          data: {
            topic_id: _this.data.topic_id,
            access_token: _this.data.token,
            content: _this.data.commentCnt,
            thread_id: _this.data.thread_id,
          },
          // header: {
          //   "Content-Type": "application/x-www-form-urlencoded"
          // },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            var data = res.data;
            if (data.length != 0) {
              _this.setData({
                "tipsContent": '评论成功',
                "errorFlag": true,
                "cmmtFlag": false,
                "commentCnt": ''
              })
              setTimeout(function () {
                _this.setData({
                  "errorFlag": false
                })
              }, 1000)
            }
          }
        })
      } else if (currentFlag == 1){
        wx.request({
          url:getUrl('fjlive','comment_send'),
          // method: 'POST',
          data: {
            topic_id: _this.data.topic_id,
            access_token: _this.data.token,
            content: _this.data.commentCnt,
            thread_id: _this.data.thread_id,
            reply_id:_this.data.reply_id,
          },
          // header: {
          //   "Content-Type": "application/x-www-form-urlencoded"
          // },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            // console.log(res)
            var data = res.data;
            if (data.length != 0) {
              _this.setData({
                "tipsContent": '评论成功',
                "errorFlag": true,
                "cmmtFlag": false,
                "commentCnt":''
              })
              setTimeout(function () {
                _this.setData({
                  "errorFlag": false
                })
              }, 1000)
            }
          }
        })
      }
    } else {
       wx.request({
        url:getUrl('fjlive','comment_send'),
        data: {
          topic_id: _this.data.topic_id,
          access_token: _this.data.token,
          content: _this.data.commentCnt,
          // thread_id: _this.data.thread_id
        },
        // header: {
        //   "Content-Type": "application/x-www-form-urlencoded"
        // },
        header: {
          'content-type': 'application/json' // 默认值
        },
         success:function(res){
          //  console.log(res)
           var data = res.data;
           if(data.length != 0){
            //  console.log(data[0].copywriting)
             _this.setData({
               "tipsContent": '评论成功',
               "errorFlag": true,
               "cmmtFlag": false,
               "commentCnt": ''
             })
             setTimeout(function(){
               _this.setData({
                 "errorFlag": false
               })
             },1000)
           }
         }
       }) 
    }
    
  },
  // 下拉刷新
  upper:function(){
    this.setData({
      'isHideLoadMore': false,
      'twArr.offset':0,
      'chatArr.offset':0
    })
    if (this.data.currentTab == 0) {
      wx.request({
        url:getUrl('fjlive','msg_list'),
        data:{
          topic_id:this.data.topic_id,
          offset:this.data.twArr.offset,
          count:20,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          var data = res.data;
          this.setData({
            "twArr.datalist": data,
            "isHideLoadMore": true
          })
        }
      })
    } else if (this.data.currentTab == 1) {
      wx.request({
        url:getUrl('fjlive','comment_list'),
        data:{
          topic_id:this.data.topic_id,
          offset:this.data.twArr.offset,
          count:20,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          var data = res.data;
          this.setData({
            "chatArr.datalist": data,
            "isHideLoadMore": true
            })          
        }
      })
    }
  },
  //  直播自动刷新
  zbRefesh:function(){
    this.setData({
      "circulateTw": setInterval(function(){
        wx.request({
          url:getUrl('fjlive','msg_list'),
          data:{
            topic_id:this.data.topic_id,
            offset:this.data.twArr.offset,
            count:20,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            if(res.data != ''){
              var data = res.data;
              var array = data.concat(this.data.twArr.datalist);
              var result = [array[0]];
              for (var i = 1; i < array.length; i++) {
                var item = array[i];
                var repeat = false;
                for (var j = 0; j < result.length; j++) {
                  if (item.id == result[j].id) {
                    repeat = true;
                    break;
                  }
                }
                if (!repeat) {
                  result.push(item);
                }
              }
              this.setData({
                "twArr.datalist": result,
                'dataZb': true
              })
            }           
          }
        })
      }.bind(this), 5000),
    })    
  },
  // 聊天室自动刷新
  ctRefesh: function () {
    this.setData({
      "circulateCt": setInterval(function(){
        wx.request({
          url:getUrl('fjlive','comment_list'),
          data:{
            topic_id:this.data.topic_id,
            offset:this.data.twArr.offset,
            count:20,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => { 
            if(res.data != ''){
              var data = res.data;
              var array = data.concat(this.data.chatArr.datalist);
              var result = [array[0]];
              for (var i = 1; i < array.length; i++) {
                var item = array[i];
                var repeat = false;
                for (var j = 0; j < result.length; j++) {
                  if (item.id == result[j].id) {
                    repeat = true;
                    break;
                  }
                }
                if (!repeat) {
                  result.push(item);
                }
              }
              this.setData({
                "chatArr.datalist": result,
                'dataCnt': true
              })
            }
          }
        })
      }.bind(this), 5000)
    })   
  },
  startTap: function(){

  },
  //登陆遮罩层隐藏
  onGetCode: function (e) {
    if (e.detail) {
      this.setData({
        "maskDisplay": false
      })
    }
  },
  onGetToken:function(e){
    var data = e.detail;
    var token = data.access_token;
    var avatar = data.avatar;
    var member_id = data.member_id;
    this.setData({
      "avatar": avatar,
      "token": token,
      "member_id": member_id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.showLoading({
        title: '加载中...',
      })
      if(options.pic != ''){
        var imgUrl = options.pic + "?imageView2/1/w/375/h/200";
      }else{
        var imgUrl = options.pic
      }     
      this.setData({
          "videoUrl":options.liveurl,
          "topic_id":options.id,
          "title":options.title,
          "imgUrl":imgUrl
      })
      this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取微信登陆的access_token
    // console.log(wx.getStorageSync('token'))
    var token = wx.getStorageSync('token');
    var avatar = wx.getStorageSync('avatar');
    var member_id = wx.getStorageSync('member_id');
    this.setData({
      "avatar": avatar,
      "token": token,
      "member_id": member_id
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
    clearInterval(this.data.circulateCt)
    clearInterval(this.data.circulateTw)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.circulateCt)
    clearInterval(this.data.circulateTw)
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
    let liveurl = this.data.videoUrl;
    let id = this.data.topic_id;
    let title = this.data.title;
    let pic = this.data.imgUrl;
    let path = `/pages/hotLive/hotLive?liveurl=${liveurl}&id=${id}&title=${title}&pic=${pic}`;
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