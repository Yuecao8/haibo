var app = getApp()
// const token = wx.getStorageSync('token')
const common = 'https://mobile.fjtv.net'
const appid = 23
const appkey = 'hsvhZ6UyJMQqElQLQaVDNN7uvOwsx6jF'
// 福建热点直播
const common1 = 'https://hotlive-dev.tw.live.hoge.cn'
const baseUrl = 'https://mobile.fjtv.net/zbx'
// const custom_appid = 83,
// const custom_appkey = 'G8FHXedPgl4i7sA2rfUISxfaB0NB5WJC' 
function getUrl(type, key) { 
  let c 
  constant[type][key].indexOf('?') == -1 ? c = '?' : c = '&'
  if( type == 'fjlive') {
    return `${common1}` + '/' + constant[type][key] + `${c}` + 'custom_appid' + '=' + '83' + '&' + 'custom_appkey' + '=' + 'G8FHXedPgl4i7sA2rfUISxfaB0NB5WJC'
  } else if (type == 'anchorShow') {
    return `${baseUrl}` + '/' + constant[type][key] + `${c}` + 'appid' + '=' + '27' + '&' + 'appkey' + '=' + '26tH3egpvfUdHjSWRAc2IauLxMu2dmV6'
  }else {
    return `${common}` + '/' + constant[type][key] + `${c}` + 'appid' + '=' + appid + '&' + 'appkey' + '=' + appkey
  }
}
const constant = {
  host: '{common}',
  // 首页
  home: {
    news:'tlive/news.php',
    news_list: 'tlive/news_list.php',
    news_slide: 'tlive/news_top_pic.php',
    item: 'tlive/item.php',
    comment:'tlive/comment.php',
    comment_create:'tlive/comment_create.php',
    m_login:'tlive/m_login.php',
  },  
  // 热点直播
  live: {
    live:'tlive/hotlive.php',
    index:'tlive/index.php',
    twapi:'tlive/twapi.php',
    comment:'tlive/comment.php',
    publish:'tlive/publish.php',
    replay:'tlive/replay.php',
    replay_thread:'tlive/replay_thread.php',
    twdetail:'tlive/twdetail.php'
  },
  // 海博 热点直播
  fjlive:{
    detail:'index.php?m=Apituwenol&c=tuwenol&a=detail', 
    msg_list:'index.php?m=Apituwenol&c=thread&a=show',
    comment_list:'index.php?c=thread&a=show_comment&m=Apituwenol',
    comment_send:'index.php?m=Apituwenol&c=interact&a=show'
  },
  // 点播
  request: {
    ccolumn:'tlive/ccolumn.php',
    sub_column:'tlive/vod.php',
    vod:'tlive/item.php',
    related:"tlive/related_content.php",
    dianbo_news:'tlive/dianbo_news.php',
    dianbo_news_list: 'tlive/dianbo_news_list.php',
    dianbo_news_slide: 'tlive/dianbo_news_slide.php',
    date_list:'tlive/date_list.php'
  },
  // 电视广播
  television: {
    channel:'tlive/channel.php',
    channel_copy:'tlive/channel_copy.php',
    program:'tlive/program.php',
    channel_detail:'tlive/channel_detail.php'
  },
  // 投票接口
  vote: {
    list:'vote/vote_list.php',
    detail:'vote/vote_detail.php',
    result:'vote/vote_detail.php',
    login:'vote/m_login.php',
    verify: 'vote/verify.php',
    column:'vote/vote.php',
    news:'vote/c_vote.php',
    personal:'vote/vote_option.php',
    detailColumn:'vote/vote_column.php'
  },
  permissionVote:{
    submit: `vote/vote_add.php`,
    article: `vote/item.php`,
    verifySubmit: `vote/verify_code.php`   
  },
  vote_vf:{
    decodeUserInfo: 'vote_vf/verify.php'  
  },
  // 主播秀
  anchorShow: {
    // 静态图
    slider: 'zbx_news_slide_.php',
    // 列表数据
    list: 'zbx_activity_recommend.php',
    // 栏目数据 
    column: 'zbx_sort.php',
    detail: 'zbx_activity_detail.php',
    comment: '?m=Apicloud_live&c=share&a=comment',
    create: 'zbx_comment_create.php',
    love: 'zbx_activity_xin.php',
    notice: 'http://cloud_livesc.cloud.hoge.cn/index.php?m=Apicloud_live&c=announcement&a=getAnnouncementList&app_secret=phI3a2T1wh8UXl1SWLk4LN5P0lJ9ZqFn'
  }
}
module.exports = getUrl