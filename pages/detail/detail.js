// pages/detail/detail.js
import getUrl from '../../utils/api.js'
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detailImg:undefined,
    describes:undefined,
    title:undefined,
    option_type:undefined,
    status_text:undefined,
    options:[],
    indicatorDots:true,
    checkVal:'',
    articleId:undefined,
    result:[],
    voteTotal:undefined,
    resultDisplay:false,
    butDisplay:true,
    verifyImg:undefined,
    inputValue:undefined,
    verifyDisplay:false,
    verifyState:0,
    verifySession:undefined,
    is_modal_Hidden: true,
    is_modal_Msg: '当前操作需要登录哦,是否登录？',
    maskDisplay:false,
    checkStaus:false,
    voteTotal:0,
    percentDisplay:true,
    quoteData: {}
  },
  init:function(detailId){
    wx.request({
      url: getUrl('vote', 'detail'), 
      data:{
        id:detailId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{ 
        var detailData=res.data[0];
        var token =wx.getStorageSync('token')
        if (detailData.is_user_login == 1 && token ==''){
            this.setData({
              is_modal_Hidden:false,
              maskDisplay:true
            })
        }
        //为投票列表数据增加索引
        var arr=[];
        for (let index in detailData.options){
          detailData.options[index].percent = Math.round(`${detailData.options[index].ini_single}` / `${detailData.question_total_ini}` * 100)
          detailData.options[index].indexId = parseInt(index)+1
          detailData.options[index].display=false
          arr.push(detailData.options[index])
        }
        //判断投票状态进行结果展示
        if (detailData.status_flag == 'over' || detailData.status_flag == 'close' ){
          this.setData({
            'resultDisplay':true,
            'butDisplay':false
          })
        }else{
          this.setData({
            'butDisplay': true
          })
        }
        //判断是否有缩略图
        if (detailData.pictures_info == false){
            this.setData({
              imgStaus:false
            })
        }
        var obj={}
        obj.videoData = detailData.other_info.videos
        obj.audioData = detailData.other_info.audios
        obj.publishData = detailData.other_info.publishcontents        
        this.setData({
          'detailImg': `${detailData.pictures_info.host}${detailData.pictures_info.dir}${detailData.pictures_info.imgwidth}x${detailData.pictures_info.imgheight}/${detailData.pictures_info.filepath}${detailData.pictures_info.filename}`,
          describes: detailData.describes,
          title: detailData.title,
          option_type: detailData.option_type,
          status_text: detailData.status_text,
          options:arr,
          voteTotal: detailData.question_total_ini,
          verifyStaus: detailData.is_verify_code,
          verifyType: detailData.verify_type,
          voteTotal: detailData.question_total_ini,
          other_info: detailData.other_info, 
          'quoteData':obj
        })
        console.log(this.data.quoteData,'quoteData')
      }
    })
  },
  //选择触发事件
  checkboxChange:function(e){
   var type=e.currentTarget.dataset.type
    if(type==1){
      this.setData({
        'checkVal': e.detail.value.join()
      })
    }else{
      this.setData({
        'checkVal': e.detail.value
      })
    }
    
  },
  //个人详情页
  jumpPersonal:function(e){
    wx.navigateTo({
      url: `../personal/index?optionId=${e.currentTarget.dataset.id}&indexId=${e.currentTarget.dataset.index}`
    })
  },
  //引用跳转
  toArticle:function(e){
    wx.navigateTo({
      url: `../article/index?id=${e.currentTarget.dataset.id}&type=${e.currentTarget.dataset.type}`
    })
  },
  //切换验证码
  changeVerify:function(){
    this.xhrVerify();
  },
  //提交
  submit:function(){

    if (this.data.checkVal.split('').length == 0){
      wx.showToast({
        title: '请选择后提交',
        icon: 'none',
        duration: 2000
      })
    }else{
      if (this.data.verifyStaus == 1 && this.data.verifyState == 0) {
        this.xhrVerify()
        this.setData({
          'verifyDisplay': true,
          'verifyState': 1
        })
      } else {
        this.xhrButton()
      }
    }

  },
  // 提交请求
  xhrButton:function(){
    wx.request({
      url: getUrl('permissionVote', 'submit'),
      data:{
        id:this.data.articleId,
        a:'vote_add',
        option_id:this.data.checkVal,
        verify_code:this.data.inputValue,
        session_id:this.data.verifySession
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.ErrorCode =="NO_ACCESS_TOKEN"){
          this.setData({
            is_modal_Hidden: false,
            maskDisplay: true
          })
        } else if (res.data.ErrorCode =='会员未登录'){
          this.setData({
            is_modal_Hidden: false,
            maskDisplay: true
          })
        }else{
          if (res.data[0] == 'success') {
            this.setData({
              'verifyDisplay': false,
              'verifyState': 0
            })
            this.voteResult();
          } else {
            if (this.data.verifyStaus == 1) {
              this.xhrVerify()
              this.setData({
                'inputValue': ''
              })
            }
            var dataError = res.data.ErrorCode;
            var that=this;
            wx.showModal({
              title: '提示',
              content: res.data.ErrorCode,
              shoowCancel: false,
              success: function (res) {
                if (res.confirm) {
                  if (dataError.indexOf('同一用户最多') != -1) {
                    that.setData({
                      'verifyDisplay': false,
                      'butDisplay': false,
                      'resultDisplay': true
                    })
                  }
                } else if (res.cancel) {
                  if (dataError.indexOf('同一用户最多') != -1) {
                    that.setData({
                      'verifyDisplay': false,
                      'butDisplay': false,
                      'resultDisplay': true
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
  //验证码请求
  xhrVerify:function(){
    wx.request({
      url: getUrl('vote', 'verify'), 
      data:{
        type:this.data.verifyType
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res)=> {
        var data=res.data[0];
        this.setData({
          'verifyImg':data.img,
          'verifySession': data.session_id
        })
      }
    })
  },
  //验证码校验
  checkVerify:function(){
    wx.request({
      url: getUrl('vote', 'verifySubmit'),
      data:{
        session_id:this.data.verifySession,
        code:this.data.inputValue,
        access_token:wx.getStorageSync('token')
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var data = res.data[0];
        if (data =='SUCCESS'){
          this.xhrButton()
        }else{
          wx.showToast({
            title: '验证码输入错误',
            icon: 'loading',
            duration:300
          }) 
          this.setData({
            'verifyState': 0
          })
          this.submit()
        }
      }
    })
  },
  //验证码输入双向绑定
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //投票结果
  voteResult:function(){
    wx.request({
      url: getUrl('vote', 'detail'),
      data:{
        id:this.data.articleId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=> {
        var detailData = res.data[0];
        var arr = [];
        for (let index in detailData.options) {
          detailData.options[index].percent = Math.round(`${detailData.options[index].ini_single}` / `${detailData.question_total_ini}` * 100)
          detailData.options[index].indexId = parseInt(index) + 1
          detailData.options[index].display = false
          arr.push(detailData.options[index])
        }
        this.setData({
          'voteTotal': detailData.question_total_ini,
          'butDisplay': false,
          'options': arr,
          'resultDisplay': true
        })
      },
      fail:function(){
        console.log('接口调用失败')
      }
    })

  },
  //切换
  switch:function(e){
    var index = e.currentTarget.dataset.index;
    var disAttr = this.data.options[index].display
    var arr = this.data.options
    arr[index].display = !arr[index].display
    this.setData({
     "options":arr
    })
  },
  //遮罩层隐藏
  onGetCode: function (e) {
    if(e.detail){
      this.setData({
        maskDisplay:false
      })
    }
  },
  //投票规则数据
  initData_rule: function () {
    var id = app.globalData.detail_id;
    wx.request({
      url: getUrl('vote', 'news'),
      data:{
        a:'getSingleVote',
        operation_name:'site',
        vote_id:id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res.data.ErrorCode == '0x000001') {
          this.setData({
            'ruleData.hasData': true
          })
        } else {
          var ruledata = res.data[0][0].content_info;
          WxParse.wxParse('rule', 'html', ruledata, this, 5);
        }
      }
    })
  },
  //新闻热点数据
  initData_news: function () {
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
      success: (res) => {
        var data = res.data
        if (data.ErrorCode == '0x000001') {
          this.setData({
            'newsData.hasData': true
          })
        } else {
          var arr = []
          //判断数据请求是否为空
          if (data[0].content_data.length == 0) {
            this.setData({
              'newsData.isHideLoadMore': true,
              'newsData.HideLoadMore': false
            })
          } else {
            for (let result in data) {
              var arr = arr.concat(data[result].content_data)
            }
            for (let val of arr) {
              var currentTime = new Date().getTime();
              var dataTime = parseInt(val.publish_time_default) * 1000;
              var seconds = parseInt((currentTime - dataTime) / 60000)
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
            var lastArr = this.datanewsData.listData.concat(arr)
            this.setData({
              'newsData.listData': lastArr
            })
          }
        }
      }
    })
  },
  //跳转到详情页
  jumpDetail_news: function (e) {
    wx.navigateTo({
      url: `../article/index?id=${e.currentTarget.dataset.id}&type=$  {e.currentTarget.dataset.type}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //获取用户信息
  onGotUserInfo:function(e){
    console.log(e)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.tarBar = this.selectComponent("#tarBar");
    // this.tarBar.initData(2)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var param_id = getApp().globalData.detail_id
    this.setData({
      'articleId': param_id
    })
    this.init(param_id);
  },
  empty:function(e){

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
  
  }
})