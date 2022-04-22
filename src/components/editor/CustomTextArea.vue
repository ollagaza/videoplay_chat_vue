<template>
  <textarea
    class="default"
    :class="{ resize: is_resize, overflow: overflow_visible }"
    :style="css_string"
    id="textarea_id"
    :autofocus="auto_focus"
    :ref="textarea_id"
    :placeholder="placeholder"
    :readonly="readonly"
    v-model="textarea_text"
    v-on:blur="eventEditorBlur"
    v-on:keyup="changeHeight"
  ></textarea>
</template>

<script>
  import util from '../../utils/util';

  export default {
    name: 'CustomTextArea',
    props: ['set_value', 'return_data', 'set_text'],
    data() {
      return {
        is_resize: false,
        auto_focus: false,
        overflow_visible: true,
        textarea_id: 'textarea',
        textarea_text: '',
        callback_blur: null,
        callback_auto_height: null,
        css_string: null,
        placeholder: '',
        readonly: false,
        text_el: null,
      };
    },
    created() {
      if (this.set_value) {
        this.is_resize = this.set_value.resize;
        this.auto_focus = this.set_value.auto_focus;
        this.overflow_visible = this.set_value.overflow;
        this.textarea_id = util.isEmpty(this.set_value.id) ? 'textarea' : this.set_value.id;
        if (this.set_text) {
          this.textarea_text = this.set_text;
        } else {
          this.textarea_text = this.set_value.text;
        }
        this.callback_blur = this.set_value.callback_blur;
        this.callback_auto_height = this.set_value.auto_height;
        this.css_string = this.set_value.css_string;
        this.placeholder = this.set_value.placeholder;
        this.readonly = this.set_value.is_readonly;
      }
    },
    mounted() {
      this.text_el = this.$refs[this.textarea_id];
      // const textarea_height = this.text_el.scrollHeight;
      // this.$refs[this.textarea_id].style.height = `${textarea_height}px`;
    },
    beforeDestroy() {
    },
    methods: {
      setFocus(id) {
        this.text_el.selectionStart = this.textarea_text ? this.textarea_text.length : 0;
        this.text_el.selectionEnd = this.textarea_text ? this.textarea_text.length : 0;
        this.text_el.focus();
      },
      getContent() {
        if (this.return_data) {
          return {
            return_data: this.return_data,
            textarea_text: this.textarea_text,
          };
        }
        return this.textarea_text;
      },
      setEditorContent(value) {
        this.textarea_text = value;
      },
      eventEditorBlur() {
        if (this.callback_blur) {
          this.callback_blur(this);
        }
      },
      changeHeight() {
        if (this.callback_auto_height) {
          this.callback_auto_height(this.$refs[this.textarea_id], this.$refs[this.textarea_id].scrollHeight);
        }
      },
    },
  };
</script>

<style scoped>
  .default {
    width: 100%;
    height: 100%;
    resize: none;
    word-wrap: break-word;
    overflow: hidden;
  }
  textarea {
    font-size: 15px;
    padding: 10px;
  }
  .resize {
    resize: inherit;
  }
  .overflow {
    overflow: scroll;
  }
</style>
