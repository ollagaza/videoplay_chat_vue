<template>
  <div class="shortcut_info">
    <div class="shortcut_keys" v-html="c_shortcut_key_html"></div>
    <div class="shortcut_text">{{ c_shortcut_text }}</div>
  </div>
</template>

<script>
import util from '../utils/util';

const button_key_map = {
  space: true,
  shift: true,
  ctrl: true,
  alt: true,
};

export default {
  props: ['shortcut_info'],
  name: 'ShortcutItem',
  computed: {
    c_shortcut_text() {
      if (!this.shortcut_info || !util.trim(this.shortcut_info.text)) return '';
      return util.trim(this.shortcut_info.text);
    },
    c_shortcut_keys() {
      if (!this.shortcut_info || !this.shortcut_info.key) return [];
      return this.shortcut_info.key;
    },
    c_shortcut_key_html() {
      if (this.c_shortcut_keys.length <= 0) return '';
      let html = '';
      for (let i = 0; i < this.c_shortcut_keys.length; i++) {
        const key = this.c_shortcut_keys[i];
        let class_name = 'key';
        if (button_key_map[key.toLowerCase()]) {
          class_name = 'key button';
        }
        html += `<div class="${class_name}">${key}</div>`;
      }
      return html;
    },
  },
};
</script>

<style>
.shortcut_info {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  font-size: 12px;
  font-weight: 300;
  padding: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.shortcut_info:last-child {
  border-bottom: none;
}
.shortcut_info .shortcut_keys {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 0 0 90px;
  padding-right: 10px;
}
.shortcut_info .shortcut_keys > .key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 20px;
  margin-right: 6px;
}
.shortcut_info .shortcut_keys > .key.button {
  background-color: #333333;
  border-radius: 3px;
  border: 1px solid #555555;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  padding: 0 6px;
  font-size: 11px;
}

.shortcut_info .shortcut_text {
  flex: 1;
}
</style>
