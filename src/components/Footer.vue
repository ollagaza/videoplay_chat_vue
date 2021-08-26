<template>
  <footer class="footer" >
    <div class="footer_wrapper" style="border-top: 1px solid #CCC;">
      <div class="footer_copyright">copyright©2021 . All rights reserved.</div>
    </div>
  </footer>
</template>

<script>
import * as Constants from '../constants';
import EventBus from '../utils/eventbus';
import { mapGetters } from 'vuex';

export default {
  name: 'Footer',
  components: { },
  data() {
    return {
    };
  },
  computed: {
  },
  watch: {
    $route() {
      this.onRouteChange();
    },
  },
  created() {
    this.onRouteChange();
  },
  methods: {
    onRouteChange() {
      const route = this.$route;
      this.route_name = route.name;
    },
  },
};
</script>

<style scoped>
.footer {
  z-index: 100;
  /*!*position: absolute;*!*/
  /*position: fixed;*/
  /*left: 0;*/
  /*bottom: 0;*/
  /*width: 100%;*/
  /*padding: 5px 0;*/
  /*text-align: center;*/
}

.footer > .footer_wrapper {
  display: flex;
  /*flex-grow: 0;*/
  /*flex-shrink: 0;*/
  /*flex-basis: 0;*/
  flex-direction: column;
  align-items: center;
}
.footer_copyright{
  font-weight: 400;
  font-size: 14px;
  font-color: #888;
  letter-spacing: -0.5px;
}



</style>
