import getUrl from '../../utils/api.js'
Component({
  properties: {
    modalHidden: {
      type: Boolean,
      value: true
    }, //这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden  
    modalMsg: {
      type: String,
      value: ' ',
    }
  },
  data: {
    // 这里是一些组件内部数据  
    text: "text",
  },
  methods: {
    // 这里放置自定义方法  
    modal_click_Hidden: function (e) {
      var param = 1
      this.setData({
        modalHidden: true
      })
      this.triggerEvent('myevent', param)
    },
    //获取用户信息
    onGotUserInfo: function (e) {
      console.log(e)
      wx.showLoading({
        title: '正在登录',
        mask:true
      })
      var param=1
      this.setData({
        modalHidden: true
      })
      this.triggerEvent('myevent', param)
      var eData =encodeURIComponent(e.detail.encryptedData)
      var eIv = encodeURIComponent(e.detail.iv)
      var that=this; 
      //请求用户信息
      wx.login({
        success: function (r) {       
          var code = r.code;//登录凭证
          if (code) {
            wx.request({
              url: `${getUrl('vote_vf', 'decodeUserInfo')}&encryptedData=${eData}&iv=${eIv}&code=${code}`,
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: (res) => {
                console.log(res)
                if (res.statusCode==200){
                  var nick,avatar,openId;
                  nick=res.data.nickName;
                  avatar = res.data.avatarUrl;
                  openId = res.data.openId;
                  that.xhrToken(nick, avatar, openId)
                }
              }
            })

          } else {
            console.log('获取用户登录态失败！' + r.errMsg)
          }
        },
        fail: function () {
          
        }
      })
    },
   // 请求access_token
    xhrToken: function (nick, avatar, openId){
      wx.request({
        url: `${getUrl('vote', 'login')}&nick_name=${nick}&platform_id=${openId}&avatar_url=${avatar}`,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (res) => {
          var data = res.data[0]
          if (data.access_token){
            wx.hideLoading()
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 800
            })
            wx.setStorageSync('token', data.access_token)
          }else{
            wx.showToast({
              title: '登录失败',
              icon: 'success',
              duration: 500
            })
          }
        }
      })
    },
    // 确定  
    Sure: function () {

    },
    bindCode: function (e) {
      this.triggerEvent('myevent', myEventDetail)
    }
  }
})