<template>
  <div class="app_main">
    <div class="app_root" v-bind:class="{ no_pad: meta.no_pad }">
      <template v-if="is_data_load_complete">
        <div class="page_wrapper" v-bind:class="{ no_pad: meta.no_pad }">
          <template v-if="meta.border_line === 'bottom'">
            <div style="position: absolute;top: 99px; width:100%; height: 1px; border-bottom: 1px solid #ccc;"></div>
          </template>
          <div class="page_div">
            <Navigation :route_name="route_name" :navview="meta.navigation" :menu_id="meta.menu_id"></Navigation>
            <router-view/>
          </div>
        </div>
        <div class="page_bottom"></div>
      </template>
    </div>
    <Footer></Footer>
    <NowLoading v-show="is_nowLoading" :scaleData="nowLoading_scale" :comment="nowLoading_comment"></NowLoading>
    <AlertPopup ref="alertPopup"></AlertPopup>
    <ConfirmPopup ref="confirmPopup"></ConfirmPopup>
    <ToastMessage></ToastMessage>
    <LoginPopup ref="loginPopup"></LoginPopup>
  </div>
</template>

<script>
import './assets/css/app/base.css';
import './assets/css/app/popup.css';
import './assets/css/app/buttons.css';
import './assets/css/app/list.css';
import './assets/css/app/table.css';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import NowLoading from './components/popup/NowLoading';
import AlertPopup from './components/popup/AlertPopup';
import ConfirmPopup from './components/popup/ConfirmPopup';
import ToastMessage from './components/popup/ToastMessage';
import LoginPopup from './components/popup/LoginPopup';
import EventBusFuncsMixin from './utils/EventBusFuncsMixin';
import { mapActions, mapGetters } from 'vuex';
import store from './vuex/store';

export default {
  name: 'App',
  mixins: [EventBusFuncsMixin],
  components: {
    Navigation,
    Footer,
    NowLoading,
    AlertPopup,
    ConfirmPopup,
    ToastMessage,
    LoginPopup,
  },
  data() {
    return {
      is_nowLoading: false,
      nowLoading_scale: 1.0,
      nowLoading_comment: null,
      route_name: '',
      meta: {},
      is_data_load_complete: false,
    };
  },
  created() {
    this.init_EventBus();
    this.loadSystemData();
  },
  mounted() {
  },
  watch: {
    $route(to) {
      if (to.meta) {
        this.route_name = to.name;
        this.meta = to.meta;
        this.$log.debug('watch meta : ', this.meta);
        this.meta.route_name = this.route_name;
        // const body = document.getElementsByTagName('body')[0];
        // body.className = this.theme_name;
      }
      this.appendFavicon();
    },
  },
  computed: {},
  methods: {
    loadSystemData() {
      document.title = 'Data Management System';
      this.is_data_load_complete = true;
    },
    appendFavicon() {
      let is_new = false;
      let link = document.getElementById('favicon');

      if (link === null) {
        is_new = true;
        link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
      }

      link.href = '/favicon.ico';

      if (is_new) {
        document.head.appendChild(link);
      }
    },
  },
  store,
};
</script>

<style>
body { background-color: #f5f2ee; }
.app_main { background-color: #f5f2ee; }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.page_wrapper{
  width:100%;
  /*min-height:1500px;*/
  min-width:1180px;
}
.page_div{
  width:1180px;
  margin:0 auto;
}
</style>
