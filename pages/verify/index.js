import getUrl from '../../utils/api.js'
Component({
  properties: {
    modalHidden: {
      type: Boolean,
      value: true
    },
    verifyType:{
      type: String,
      value:''
    }
  },
  data: {
    // 这里是一些组件内部数据  
    inputValue: '',
    verifyImg:'',
    verifySession: ''
    },
  methods: {
    // 这里放置自定义方法  
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
    //验证码输入双向绑定
    bindKeyInput: function (e) {
      this.setData({
        inputValue: e.detail.value
      })
      var param = {
        verifySession: this.data.verifySession,
        inputValue: this.data.inputValue
      }
      this.triggerEvent('verifyEvent', param)
    },
    //清空输入框
    emptyInput:function(){
      this.setData({
        inputValue: ''
      })
    },
    //切换验证码
    changeVerify: function () {
      this.xhrVerify();
    }
  }
})