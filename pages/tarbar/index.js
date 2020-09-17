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
    },
    tarBarData:{
      type:'Array',
      value:[]
    }
  },
  data: {
    // 这里是一些组件内部数据  
    selectIndex:1
  },
  methods: {
    // 这里放置自定义方法  
    initData: function (index) {
      this.setData({
        'selectIndex':index
      })
    },
    jump:function(e){  
      var obj={}
      var tabId = e.currentTarget.dataset.id; 
      var tabType = e.currentTarget.dataset.type; 
      var tabColumnId = e.currentTarget.dataset.columnid;          
      obj.id = tabId   
      obj.type = tabType         
      obj.columnId = tabColumnId               
      this.setData({
        "selectIndex": tabId
      })
      this.triggerEvent('tarEvent',obj)
    }
  }
})