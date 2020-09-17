//app.js
let socketMsgQueue = []
let isLoading = false
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    navHeight : '',
    userInfo: null,
    localSocket: {},
    callback: function () {}
  },
  initSocket(url) {
    let that = this
    // let url = config.appInfo.socketDomain + 'SOCKET_' + wx.getStorageSync('userId')
    that.globalData.localSocket = wx.connectSocket({
      url: url
    })
    console.log(that.globalData.localSocket)
    that.showLoad()
    that.globalData.localSocket.onOpen(function (res) {
      console.log('WebSocket连接已打开！readyState=' + that.globalData.localSocket.readyState)
      that.hideLoad()
      while (socketMsgQueue.length > 0) {
        var msg = socketMsgQueue.shift();
        that.sendSocketMessage(msg);
      }
    })
    that.globalData.localSocket.onMessage(function (res) {
      that.hideLoad()
      that.globalData.callback(res)
    })
    that.globalData.localSocket.onError(function (res) {
      console.log('error readyState=' + that.globalData.localSocket.readyState)
      setTimeout(function () {
        console.log('WebSocket连接错误！readyState=' + that.globalData.localSocket.readyState)
        that.initSocket()
      }, 1000)
    })
    that.globalData.localSocket.onClose(function (res) {
      console.log(res);
    })
  },
  closeSocket(){
    this.globalData.localSocket.close(function(res) {
      console.log('WebSocket 已关闭！')
    })
  },
  showLoad() {

    if (!isLoading) {

      wx.showLoading()

      isLoading = true

    }

  },
  hideLoad() {

    wx.hideLoading()

    isLoading = false

  },
  //统一发送消息

  sendSocketMessage: function (msg) {

    if (this.globalData.localSocket.readyState === 1) {

      this.showLoad()

      this.globalData.localSocket.send({

        data: JSON.stringify(msg)

      })

    } else {

      socketMsgQueue.push(msg)

    }

  },
})