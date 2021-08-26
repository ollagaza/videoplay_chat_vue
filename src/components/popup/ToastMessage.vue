<template>
  <div v-if="toast_message">
    <div class="toast_message" v-bind:class="c_class_name" v-bind:style="{ animationDuration: c_duration }" v-on:click="hideToast" v-on:animationend="hideToast">
      <div v-bind:class="c_text_class_name" v-html="toast_message"></div>
    </div>
  </div>
</template>

<script>
  import EventBus from '../../utils/eventbus';
  import util from '../../utils/util';
  import * as Constants from '../../constants';

  export default {
    name: 'ToastMessage',
    data() {
      return {
        toast_message: null,
        duration: 3,
        vertical: null,
        horizon: null,
        text_align: null,
        color_type: null,
      };
    },
    computed: {
      c_position_class() {
        const no_gnb = this.$route && this.$route.meta && this.$route.meta.navigation === false;
        let vertical_name = null;
        let horizon_name = null;
        if (this.vertical === Constants.CENTER && this.horizon === Constants.CENTER) {
          return 'center';
        }
        if (this.vertical) {
          if (this.vertical === Constants.TOP) {
            if (no_gnb) {
              vertical_name = 'top';
            } else {
              vertical_name = 'top gnb';
            }
          } else if (this.vertical === Constants.CENTER) {
            vertical_name = 'v_center';
          }
        }
        if (!vertical_name) {
          vertical_name = 'bottom';
        }
        if (this.horizon) {
          if (this.horizon === Constants.LEFT) {
            horizon_name = 'left';
          } else if (this.horizon === Constants.RIGHT) {
            horizon_name = 'right';
          }
        }
        if (!horizon_name) {
          horizon_name = 'h_center';
        }
        return `animation ${vertical_name} ${horizon_name}`;
      },
      c_color_class() {
        if (this.color_type === Constants.RED) {
          return 'red';
        }
        if (this.color_type === Constants.BLUE) {
          return 'blue';
        }
        return null;
      },
      c_class_name() {
        let class_name = this.c_position_class;
        if (this.c_color_class) {
          class_name = `${class_name} ${this.c_color_class}`;
        }
        return class_name;
      },
      c_text_class_name() {
        let class_name = null;
        if (this.text_align === Constants.LEFT) {
          class_name = 'left';
        } else if (this.text_align === Constants.RIGHT) {
          class_name = 'right';
        }
        if (!class_name) {
          class_name = 'center';
        }
        return class_name;
      },
      c_duration() {
        return `${this.duration}s`;
      },
    },
    created() {
      // this.$log.debug('toast crate');
      EventBus.on('showToastMessage', this.showToastMessage);
      EventBus.on('showRedToast', this.showRedToast);
      EventBus.on('showGreenToast', this.showGreenToast);
      EventBus.on('showBlueToast', this.showBlueToast);
    },
    methods: {
      /*
        사용법

        const message = 'sadasdasdasdas<br/>ㅁㄴㅇㄴㅁㅇㅁ너ㅏ어ㅏㅁㄴ ';
        const options = {
          duration: 3,
          vertical: Constants.BOTTOM,
          horizon: Constants.CENTER,
          color_type: null || Constants.RED || Constants.BLUE,
          text_align: Constants.CENTER,
        }
        EventBus.emit('showToastMessage', message, options);
       */
      showRedToast(message, duration = 3) {
        this.showToast(message, duration, Constants.RED);
      },
      showGreenToast(message, duration = 3) {
        this.showToast(message, duration, null);
      },
      showBlueToast(message, duration = 3) {
        this.showToast(message, duration, Constants.BLUE);
      },
      showToast(message, duration, color_type) {
        const options = {
          duration,
          color_type,
          vertical: Constants.BOTTOM,
          horizon: Constants.CENTER,
          text_align: Constants.CENTER,
        };
        this.showToastMessage(message, options);
      },
      showToastMessage(message, options = null) {
        this.reset();
        this.$nextTick(() => {
          this.toast_message = message;
          if (options) {
            this.vertical = options.vertical ? options.vertical : Constants.BOTTOM;
            this.horizon = options.horizon ? options.horizon : Constants.CENTER;
            this.text_align = options.text_align ? options.text_align : Constants.CENTER;
            this.color_type = options.color_type ? options.color_type : null;
            this.duration = options.duration ? util.getFloat(options.duration, 3) : 3;
          }
        });
      },
      hideToast() {
        this.$nextTick(this.reset);
      },
      reset() {
        this.toast_message = null;
        this.duration = 3;
        this.vertical = Constants.BOTTOM;
        this.horizon = Constants.CENTER;
        this.text_align = Constants.CENTER;
        this.color_type = null;
      },
    },
  };
</script>

<style scoped>
  .toast_message {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 13px;
    padding: 20px 30px;
    min-width: 300px;
    transform-origin: center center;
    background-color: rgba(60, 173, 161, 0.9);
    color: #ffffff;
    line-height: 1.4;
    font-size: 15px;
    font-weight: 400;
    z-index: 4000;
    opacity: 0;
    cursor: pointer;
  }
  .toast_message.red {
    background-color: rgba(255, 100, 104, 0.89);
  }
  .toast_message.blue {
    background-color: rgba(0, 188, 253, 0.85);
  }
  .toast_message.animation {
    animation-name: toast_message_fade;
    animation-iteration-count: 1;
  }
  .toast_message.top {
    top: 20px;
  }
  .toast_message.top.gnb {
    top: 90px;
  }
  .toast_message.bottom {
    bottom: 20px;
  }
  .toast_message.left {
    left: 20px;
  }
  .toast_message.right {
    right: 20px;
  }
  .toast_message.h_center {
    transform: translateX(-50%);
    left: 50%;
  }
  .toast_message.v_center {
    transform: translateY(-50%);
    top: 50%;
  }
  .toast_message.center {
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }

  .toast_message > div {
    text-align: center;
  }
  .toast_message > div.left {
    text-align: left;
  }
  .toast_message > div.right {
    text-align: right;
  }
  .toast_message > div.center {
    text-align: center;
  }

  @keyframes toast_message_fade {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; display: none; }
  }
</style>
