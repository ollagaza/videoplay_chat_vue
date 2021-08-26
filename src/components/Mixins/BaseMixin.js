import EventBus from '../../utils/eventbus';
import Vue from 'vue';


export default {
  methods: {
    showLoading(is_show = true, message = null, scale = 1.0) {
      EventBus.emit('nowLoading', is_show, scale, message);
    },
    onError(toast_message, error = null, method_name = 'onError') {
      Vue.$log.debug('error');
      if (error) {
        this.$log.error(method_name, error);
      }
      this.showLoading(false);
      if (toast_message) {
        EventBus.emit('showRedToast', toast_message);
      }
    },
    onSuccess(toast_message = null) {
      this.showLoading(false);
      if (toast_message) {
        EventBus.emit('showBlueToast', toast_message);
      }
    },
  },
};
