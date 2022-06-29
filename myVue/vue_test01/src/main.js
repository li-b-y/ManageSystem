// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import 'element-ui/lib/theme-chalk/index.css'
import axios from "axios"
axios.defaults.baseURL = "http://www.tangxiaoyang.vip:8888/api/v2/"
//拦截所有请求，为请求头添加token认证
axios.interceptors.request.use(config => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  config.headers.Authorization = userInfo ? userInfo.token : '';
  return config;
})

import "./assets/css/global.css"
import "./assets/fonts/iconfont.css"
import ZKtable from 'vue-table-with-tree-grid'
import utils from  "./libs/utils"
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$http = axios
Vue.component('tree-table',ZKtable)
Vue.prototype.$utils = utils
Vue.use(VueQuillEditor)
Vue.use(VueLazyload)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
}).$mount('#app') //手动挂载
//   components: { App },
//   template: '<App/>'
// })
