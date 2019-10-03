import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'
import store from './store'
import VueJsonPretty from 'vue-json-pretty'
import VueMoment from 'vue-moment'
import VueTimers from 'vue-timers'

Vue.config.productionTip = false;
Vue.use(VueMoment);
Vue.use(VueTimers)
Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

new Vue({
  VueJsonPretty,
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
