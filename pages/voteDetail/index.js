// pages/detail/detail.js
import getUrl from '../../utils/api.js'
var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detailId:null,
    detailImg: undefined,
    describes: undefined,
    title: undefined,
    option_type: undefined,
    status_text: undefined,
    options: [],
    indicatorDots: true,
    checkVal: '',
    articleId: undefined,
    result: [],
    voteTotal: undefined,
    resultDisplay: false,
    butDisplay: true,
    verifyImg: undefined,
    inputValue: undefined,
    verifyDisplay: false,
    verifyState: 0,
    verifySession: undefined,
    is_modal_Hidden: true,
    is_modal_Msg: '当前操作需要登录哦,是否登录？',
    maskDisplay: false,
    checkStaus: false,
    voteTotal: 0,
    percentDisplay: true,
    columnData:[],
    tabData:[],
    currentTab:1,
    tabDisplay:true,
    currentType:undefined,
    currentColumnId:'detail',
    other_info: undefined,  
    loadTime:undefined,
    quoteData: {}, 
    detail_flag:true,
    start_time:undefined,
    end_time:undefined, 
    clock:undefined,
    isActive:undefined,
    // countDownDay: undefined,
    // countDownHour: undefined,
    // countDownMinute: undefined,
    // countDownSecond: undefined, 
    loadingTime:'', 
    newList:{},
    ruleData: {     
      listData:[],   //投票规则数据
      hasData: false,
      img:'',
      ruleKind: 1
    },
    newsData: {
      listData: [],
      dataOffset: 0,
      isHideLoadMore: true,
      HideLoadMore: true,
      hasData: false,
      ruleKind:undefined
    },
    rule_img:{},
  },
  init: function (detailId) {
    wx.request({
      url: getUrl('vote', 'detail'),
      data:{
        id:detailId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var detailData = res.data[0]; 
        var token = wx.getStorageSync('token');
        if (detailData.is_user_login == 1 && token == '') {
          this.setData({
            is_modal_Hidden: false,
            maskDisplay: true
          })
        }
        //判投票程序是否需要倒计时
        if (detailData.status_flag == "will" || detailData.start_time == 0 || detailData.end_time == 0){
          this.setData({
            detail_flag:false
          })
        }else{
          var StartTime = Date.parse(new Date());
          var endtimeData = detailData.end_time;
          var formatEnd = endtimeData.replace(/-/g, '/')
          var EndTime = Date.parse(new Date(formatEnd));
          var totalSecond = (EndTime - StartTime)/ 1000;
          this.setData({
            loadingtime:setInterval(function () {
              // 秒数
              var second = totalSecond;
              // 天数位
              var day = Math.floor(second / 3600 / 24);
              var dayStr = day.toString();
              if (dayStr.length == 1) dayStr = '0' + dayStr;
              // 小时位
              var hr = Math.floor((second - day * 3600 * 24) / 3600);
              var hrStr = hr.toString();
              if (hrStr.length == 1) hrStr = '0' + hrStr;
              // 分钟位
              var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
              var minStr = min.toString();
              if (minStr.length == 1) minStr = '0' + minStr;
              // 秒位
              var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
              var secStr = sec.toString();
              var countClock = dayStr + "天" + hrStr + "小时" + minStr + "分" + secStr +"秒";
              if (secStr.length == 1) secStr = '0' + secStr;
              this.setData({
                // countDownDay: dayStr,
                // countDownHour: hrStr,
                // countDownMinute: minStr,
                // countDownSecond: secStr,
                clock: countClock
              });
              totalSecond--;
              if (totalSecond < 0) {
                clearInterval(this.data.loadingtime);
                // wx.showToast({
                //   title: '活动已结束',
                // });
                this.setData({
                  // countDownDay: '00',
                  // countDownHour: '00',
                  // countDownMinute: '00',
                  // countDownSecond: '00',
                  clock: "活动已结束",
                  isActive: 'd_active'
                });
              }
            }.bind(this), 1000)
          })
        }
        //为投票列表数据增加索引
        var arr = [];
        for (let index in detailData.options) {
          detailData.options[index].percent = Math.round(`${detailData.options[index].ini_single}` / `${detailData.question_total_ini}` * 100)
          detailData.options[index].indexId = parseInt(index) + 1
          detailData.options[index].display = false
          arr.push(detailData.options[index])
        }
        //判断投票状态进行结果展示
        if (detailData.status_flag == 'over' || detailData.status_flag == 'close') {
          this.setData({
            'resultDisplay': true,
            'butDisplay': false
          })
        } else {
          this.setData({
            'butDisplay': true
          })
        }
        //判断是否有缩略图
        if (detailData.pictures_info == false) {
          this.setData({
            imgStaus: false
          })
        }        
        var obj = {}
        obj.videoData = detailData.other_info.videos
        obj.audioData = detailData.other_info.audios
        obj.publishData = detailData.other_info.publishcontents
        if (detailData.other_info.pictures != undefined){
          detailData.other_info.pictures.unshift(detailData.pictures_info)
        }
        this.setData({
           'detailImg': `${detailData.pictures_info.host}${detailData.pictures_info.dir}${detailData.pictures_info.imgwidth}x${detailData.pictures_info.imgheight}/${detailData.pictures_info.filepath}${detailData.pictures_info.filename}`, 
          describes: detailData.describes,
          title: detailData.title,
          option_type: detailData.option_type,
          status_text: detailData.status_text,
          options: arr,
          voteTotal: detailData.question_total_ini,
          verifyStaus: detailData.is_verify_code,
          verifyType: detailData.verify_type,
          voteTotal: detailData.question_total_ini,
          other_info: detailData.other_info  ,
          'quoteData': obj        
        }) 
      }
    })
  },
  //选择触发事件
  checkboxChange: function (e) {
    var type = e.currentTarget.dataset.type
    if (type == 1) {      
      this.setData({
        'checkVal': e.detail.value.join()
      })
    } else {
      this.setData({
        'checkVal': e.detail.value
      })
    }

  },
  //个人详情页
  jumpPersonal: function (e) {
    clearInterval(this.data.loadingtime)   //清楚倒计时的计时器
    wx.navigateTo({
      url: `../personal/index?optionId=${e.currentTarget.dataset.id}&indexId=${e.currentTarget.dataset.index}&detailId=${this.data.detailId}`
    })
  },
  //引用跳转
  toArticle: function (e) {
    wx.navigateTo({
      url: `../voteNews/index?id=${e.currentTarget.dataset.id}&type=${e.currentTarget.dataset.type}`
    })
  },
  //切换验证码
  changeVerify: function () {
    this.xhrVerify();
  },
  //提交
  submit: function () {
    if (this.data.checkVal.split('').length == 0) {
      wx.showToast({
        title: '请选择后提交',
        icon: 'none',
        duration: 2000
      })
    } else {
      if (this.data.verifyStaus == 1 && this.data.verifyState == 0) {
        this.xhrVerify()
        this.setData({
          'verifyDisplay': true,
          'verifyState': 1
        })
      } else {
        this.xhrButton()        
      }
      // wx.navigateTo({
      //     url: `../out/out`
      //   })
    }

  },
  // 提交请求
  xhrButton: function () {
    wx.request({
      url: getUrl('permissionVote', 'submit'),
      data:{
        id:this.data.articleId,
        a:'vote_add',
        option_id:this.data.checkVal,
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
            var that = this;
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
  xhrVerify: function () {
    wx.request({
      url: getUrl('vote', 'verify'),
      data:{
        type:this.data.verifyType
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var data = res.data[0];
        this.setData({
          'verifyImg': data.img,
          'verifySession': data.session_id
        })
      }
    })
  },
  //验证码校验
  checkVerify: function () {
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
        if (data == 'SUCCESS') {
          this.xhrButton()
        } else {
          wx.showToast({
            title: '验证码输入错误',
            icon: 'loading',
            duration: 300
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
  voteResult: function () {
    wx.request({
      url: getUrl('vote', 'detail'),
      data:{
        id:this.data.articleId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
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
      fail: function () {
        console.log('接口调用失败')
      }
    })

  },
  //切换
  switch: function (e) {
    var index = e.currentTarget.dataset.index;
    var disAttr = this.data.options[index].display
    var arr = this.data.options
    arr[index].display = !arr[index].display
    this.setData({
      "options": arr
    })
  },
  //遮罩层隐藏
  onGetCode: function (e) {
    if (e.detail) {
      this.setData({
        maskDisplay: false
      })
    }
  },
  //n_newsrule数据
  initData_news: function () {
    var id = app.globalData.detail_id;
    wx.request({
      url: getUrl('vote', 'news'),
      data:{
        a:'getSingleVote',
        column_id:this.data.currentColumnId,
        vote_id:id,
        count:10,
        offset:this.data.newsData.dataOffset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => { 
        var data = res.data[0].data
        if(data.length>1){
          this.setData({
            'newsData.ruleKind': 2
          })
          if (data.ErrorCode == '0x000001') {
            this.setData({
              'newsData.hasData': true
            })
          } else {
              var arr =data;
              for (let val of arr) {
                var indexpic = val.indexpic
                val.picSrc = `${indexpic.host}${indexpic.dir}190x134/${indexpic.filepath}${indexpic.filename}`
                var currentTime = new Date().getTime();
                var dataTime = parseInt(val.publish_time_stamp) * 1000;
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
              var lastArr = this.data.newsData.listData.concat(arr)
              this.setData({
                'newsData.listData': lastArr
              })
          }
      }else if(data.length==1){
          this.setData({
            'newsData.ruleKind': 1
          })
          this.xhrOneList(data[0].id, data[0].module_id)
      }else{
          //判断数据请求是否为空
          if (data.length == 0 && this.data.newsData.dataOffset !=1) {
            this.setData({
              'newsData.isHideLoadMore': true,
              'newsData.HideLoadMore': false
            })
          } else if (data.length == 0 && this.data.newsData.dataOffset == 1){ 
            this.setData({
              'newsData.hasData': true
            })
          }
      }
      }
    })
  },
  //请求单条数据
  xhrOneList:function(id,type){
    var that = this;
    wx.request({
      url: getUrl('permissionVote', 'article'),
      data:{
        id:id,
        app_uniqueid:type,
        access_token:wx.getStorageSync('token')
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      dataType: 'json',
      success: function (res) { 
        var data = res.data; 
        var ruledata = data.content;
        var img = data.indexpic  
        // console.log(img) 
          that.setData({
            "rule_img":img
          })
        WxParse.wxParse('rule', 'html', ruledata ,that, 5);
      },
      fail: function (data) {
        console.log(data, 'data')
      }
    })
  },
  //跳转到详情页
  jumpDetail_news: function (e) {
    wx.navigateTo({
      url: `../voteNews/index?id=${e.currentTarget.dataset.id}&type=${e.currentTarget.dataset.type}`
    })
  },
  /**
* 页面相关事件处理函数--监听用户下拉动作
*/
  onPullDownRefresh: function () {
    if (this.data.currentColumnId !='detail'){
      this.setData({
        'newsData.listData': [],
        'newsData.dataOffset': 0,
        'newsData.HideLoadMore': true
      })
      this.initData_news();
      wx.showNavigationBarLoading()
      //模拟加载
      setTimeout(function () {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }, 500)
    }
  },
  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    if (this.data.currentColumnId != 'detail' && this.data.newsData.ruleKind !=1) {  
      this.setData({
        'newsData.isHideLoadMore': false
      })
      this.setData({
        'newsData.dataOffset': this.data.newsData.dataOffset + 10
      })
      this.initData_news()
    }
  },
  //tab栏事件
  home_tarEvent:function(e){
    clearInterval(this.data.loadingtime)   //清楚倒计时的计时器
    var id=e.detail.id
    var type = e.detail.type   
    var columnId = e.detail.columnId       
    this.setData({
      "currentTab": id,
      "currentType":type,
      // 'currentColumnId': columnId,
      // 'newsData.listData': [],
      // 'newsData.dataOffset': 0,
      'newsData.HideLoadMore': true
    })
    if (columnId=='detail'){
      this.init(this.data.articleId);
    }else{
      if (this.data.currentColumnId == columnId){
        this.setData({
          'currentColumnId': columnId
        })
      }else{
        this.setData({
          'currentColumnId': columnId,
          'newsData.listData': [],
          'newsData.dataOffset': 0
        })
        this.initData_news(); 
      }            
    }
  },
  //栏目初始化
  columnInit:function(){
    wx.request({
      url: getUrl('vote', 'detailColumn'),
      data:{
        vote_id:this.data.articleId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        var data = res.data[0].more_info
        var arr=[];
        var newList = {}
        newList.typeA = []
        newList.typeB = []
        newList.typeC = [] 
        for (let index in data){
          var obj={}
          obj.title = data[index].name
          obj.id=parseInt(index)+1
          obj.typeCid = parseInt(index) + 2         
          obj.type = data[index].column_type
          if (data[index].column_type==1){
            obj.src = '../detail/detail.wxml'  
            obj.columnId ='detail'             
            newList.typeA.push(obj)  
            if (this.data.loadTime==1){
              this.setData({
                'currentTab': obj.id
              })
              //初始化tab栏目默认选中项
              this.tarBar = this.selectComponent("#tarBar");
              this.tarBar.initData(obj.id) 
            }                
          } else{
            obj.src = '../news/index.wxml'  
            obj.columnId = data[index].column_id
            newList.typeB.push(obj)
            newList.typeC.push(obj)                                
          }
          arr.push(obj)
        } 
        this.setData({
          'tabData':arr,
          'newList':newList
        })
        if(arr.length<=1){
          this.setData({
            'tabDisplay': false,
          })
        }
        this.setData({
          'loadTime':this.data.loadTime+1
        })
      },
      fail: function () {
        console.log('接口调用失败')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    // var param_id = getApp().globalData.detail_id
    this.setData({
      'loadTime':options.time,
      'detailId': options.detailId
    })
    // this.init(param_id);
  },
  //获取用户信息
  onGotUserInfo: function (e) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.tarBar = this.selectComponent("#tarBar");
    // this.tarBar.initData(1)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // if (!getApp().globalData.detail_id){    
      var param_id = this.data.detailId 
    // }else{
    //   var param_id = getApp().globalData.detail_id
    // } 
    this.setData({
      'articleId': param_id
    })
    this.columnInit()
    this.init(param_id);
    // this.initData_news() 
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.loadingtime)   //清楚倒计时的计时器
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.loadingtime)   //清楚倒计时的计时器
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let title = this.data.title;
    let path = `/list/voteIndex/index?time=1&detailId=${this.data.detailId}` 
    return{
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