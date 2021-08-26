<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }" style="z-index: 1500;">
    <div class="popup confirm_popup" v-bind:style="{ width: width, minWidth: minWidth }">
      <div class="popup_contents">
        <div class="popup_image" v-if="popup_image"><img :src="popup_image" /></div>
        <div class="message_wrapper">
          <div class="title" v-if="title" v-html="title"></div>
          <div class="sub_message" v-if="sub_message" v-bind:style="sub_message_style" v-html="sub_message"></div>
          <div class="sub_message2" v-if="sub_message2" v-bind:style="sub_message_style2" v-html="sub_message2"></div>
          <div class="message" v-if="message" v-html="message"></div>
          <div class="sub_message3" v-if="sub_message3" v-bind:style="sub_message_style3" v-html="sub_message3"></div>
        </div>
      </div>
      <div class="popup_buttons">
        <div class="btn blue w100" v-on:click="closePopup"><span>{{ btn_message }}</span></div>
      </div>
      <div class="warring" v-if="warring" v-html="warring"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertPopup',
  data() {
    return {
      is_open: false,
      confirm_target: null,
      message: null,
      title: null,
      sub_message: null,
      sub_message_style: null,
      sub_message2: null,
      sub_message_style2: null,
      sub_message3: null,
      sub_message_style3: null,
      warring: null,
      popup_image: null,
      callback: null,
      btn_message: '확인',
      width: 'auto',
      minWidth: '400px',
    };
  },
  created() {
  },
  computed: {
  },
  methods: {
    openPopup(confirm_target, message, callback, options = {}) {
      // this.$log.debug('+ openpopup');
      this.confirm_target = confirm_target;
      this.callback = callback;
      this.message = message || null;
      this.title = options.title || null;
      this.sub_message = options.sub_message || null;
      this.sub_message_style = options.sub_message_style || null;
      this.sub_message2 = options.sub_message2 || null;
      this.sub_message_style2 = options.sub_message_style2 || null;
      this.sub_message3 = options.sub_message3 || null;
      this.sub_message_style3 = options.sub_message_style3 || null;
      this.popup_image = options.popup_image || null;
      this.warring = options.warring || null;
      this.minWidth = options.width || '400px';
      this.btn_message = options.btn_message ? options.btn_message : '확인';
      this.is_open = true;
    },
    closePopup() {
      if (this.callback) {
        this.callback(this.confirm_target);
      }
      this.is_open = false;
      this.confirm_target = null;
      this.callback = null;
      this.message = null;
      this.title = null;
      this.sub_message = null;
      this.sub_message_style = null;
      this.sub_message2 = null;
      this.sub_message_style2 = null;
      this.warring = null;
      this.minWidth = '400px';
      this.popup_image = null;
    },
  },
};
</script>

<style scoped>
</style>
