<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }" style="z-index: 1500;">
    <div class="popup confirm_popup" v-bind:style="{ width: width, minWidth: minWidth }">
      <template v-if="is_close_btn">
        <div class="popup close_btn delete_btn" v-on:click="closePopup"></div>
      </template>
      <div class="popup_contents">
        <div class="popup_image" v-if="popup_image"><img :src="popup_image" /></div>
        <div class="message_wrapper">
          <div class="title" v-if="title" v-html="title"></div>
          <div class="sub_message" v-if="sub_message" v-html="sub_message"></div>
          <div class="sub_message2" v-if="sub_message2" v-html="sub_message2"></div>
          <div class="message" v-if="message" v-html="message"></div>
          <div class="sub_message3" v-if="sub_message3" v-html="sub_message3"></div>
        </div>
      </div>
      <div class="popup_buttons">
        <template v-if="!is_confirm_click">
          <div class="btn blue w100" v-on:click="onConfirm"><span>{{confirm_text}}</span></div>
          <div class="btn w100" v-on:click="onCancel"><span>{{ c_cancel_message }}</span></div>
        </template>
        <template v-else-if="is_complete">
          <div class="btn w100" v-on:click="closePopup"><span>{{ c_cancel_message }}</span></div>
        </template>
        <template v-else>
          <div class="lds-facebook"><div></div><div></div><div></div></div>
        </template>
      </div>
      <div class="warring" v-if="warring" v-html="warring"></div>
    </div>
  </div>
</template>

<script>
import util from '../../utils/util';

export default {
  name: 'ConfirmPopup',
  data() {
    return {
      is_open: false,
      is_close_btn: false,
      is_confirm_click: false,
      confirm_target: null,
      message: null,
      title: null,
      sub_message: null,
      sub_message2: null,
      sub_message3: null,
      warring: null,
      popup_image: null,
      callback: null,
      cancel_callback: null,
      width: 'auto',
      minWidth: '400px',
      is_complete: false,
      auto_close: false,
      confirm_text: '확인',
      cancel_text: null,
    };
  },
  created() {
  },
  computed: {
    c_cancel_message() {
      const default_text = (this.is_complete ? '닫기' : '취소');
      return (util.isEmpty(this.cancel_text) ? default_text : this.cancel_text);
    },
  },
  methods: {
    openPopup(confirm_target, message, callback, options = {}, cancel_callback = null) {
      this.confirm_target = confirm_target;
      this.callback = callback;
      this.message = message || null;
      if (!options) options = {};
      this.title = options.title || null;
      this.sub_message = options.sub_message || null;
      this.sub_message2 = options.sub_message2 || null;
      this.sub_message3 = options.sub_message3 || null;
      this.popup_image = options.popup_image || null;
      this.warring = options.warring || null;
      this.minWidth = options.width || '400px';
      this.auto_close = options.auto_close === true;
      this.cancel_callback = cancel_callback;
      this.is_open = true;
      this.confirm_text = options.confirm_text || '확인';
      this.cancel_text = options.cancel_text;
      this.is_close_btn = options.is_close_btn || false;
    },
    closePopup() {
      this.is_open = false;
      this.confirm_target = null;
      this.callback = null;
      this.cancel_callback = null;
      this.message = null;
      this.title = null;
      this.sub_message = null;
      this.sub_message2 = null;
      this.sub_message3 = null;
      this.warring = null;
      this.minWidth = '400px';
      this.popup_image = null;
      this.is_confirm_click = false;
      this.is_complete = false;
    },
    onConfirm() {
      this.is_confirm_click = true;
      if (this.callback) {
        this.callback(this.confirm_target);
        if (this.auto_close) {
          this.closePopup();
        }
      } else {
        this.closePopup();
      }
    },
    onCancel() {
      if (this.cancel_callback) {
        this.cancel_callback(this.confirm_target);
      }
      this.closePopup();
    },
    onComplete(message = null, is_error = false) {
      if (message) {
        this.title = null;
        this.sub_message = null;
        this.sub_message2 = null;
        this.sub_message3 = null;
        this.warring = null;
        this.message = message;
        this.is_complete = true;
        this.auto_close = false;
        if (is_error) {
          this.popup_image = '/img/renewal/drive/mark.png';
        } else {
          this.popup_image = null;
        }
      } else {
        this.closePopup();
      }
    },
  },
};
</script>

<style scoped>
</style>
