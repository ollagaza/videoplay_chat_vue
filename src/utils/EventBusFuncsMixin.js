import EventBus from './eventbus';

const EventBusFuncsMixin = {
  data() {
    return {
    };
  },
  beforeDestroy() {
    EventBus.off();
  },
  computed: {
  },
  methods: {
    init_EventBus() {
      this.$log.debug('init_EventBus...');
      EventBus.on('nowLoading', this.onNowLoading);
      EventBus.on('loginPopupOpen', this.onLoginPopupOpen);
      EventBus.on('alertPopupOpen', this.onAlertPopupOpen);
      EventBus.on('confirmPopupOpen', this.onConfirmPopupOpen);
      EventBus.on('confirmPopupClose', this.onConfirmPopupClose);
    },
    onConfirmPopupOpen(confirm_target, message, callback, options = {}, cancel_callback = null) {
      this.$refs.confirmPopup.openPopup(confirm_target, message, callback, options, cancel_callback);
    },
    onConfirmPopupClose(complete = false, message = null, is_error = false) {
      if (complete) {
        this.$refs.confirmPopup.onComplete(message, is_error);
      } else {
        this.$refs.confirmPopup.closePopup();
      }
    },
    onNowLoading(start_loading = true, scale = 1.0, comment = null) {
      this.$log.debug('loading...');
      this.is_nowLoading = start_loading;
      if (this.is_nowLoading) {
        this.nowLoading_scale = scale;
        this.nowLoading_comment = comment;
      }
    },
    onLoginPopupOpen(open_callback = null, close_callback = null) {
      this.$refs.loginPopup.openPopup(open_callback, close_callback);
    },
    onAlertPopupOpen(confirm_target, message, callback, options = {}) {
      // this.$log.debug('onAlertPopupOpen', confirm_target, message, callback, options);
      // this.$log.debug(this.$refs.alertPopup);
      this.$refs.alertPopup.openPopup(confirm_target, message, callback, options);
    },
  },
};

export default EventBusFuncsMixin;
