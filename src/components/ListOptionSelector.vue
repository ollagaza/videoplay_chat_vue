<template>
  <div class="select_box_wrapper" ref="select_box_wrapper" v-bind:style="{ width: c_width, zIndex: default_zIndex, height: c_selector_height }" v-bind:class="[theme, { extend: is_clicked }]">
    <div class="select_list_close_bg" v-on:click.stop="closeSelect" v-bind:style="{ zIndex: close_zIndex }"></div>
    <div class="selected_item" v-on:click.stop="onSelectBoxClick" v-bind:style="{ ...c_disable_style }">
      <div class="selected_item_text ellipsis" v-html="c_selected_text"></div>
      <div class="select_icon_arrow" v-bind:class="{ on: is_clicked }"></div>
    </div>
    <div class="select_list_item" :tabindex="tabindex" ref="select_list_item" v-bind:class="{ 'y-overflow': y_overflow, 'x-overflow': x_overflow, type: c_is_option_type, reverse: is_reverse }" v-bind:style="{ height: c_option_list_height, maxHeight: c_max_height, c_reverse_top }">
      <template v-for="item in c_list_item">
        <template v-if="item.type && item.type === 'empty_line'">
          <div class="selectable_list_item empty_line" />
        </template>
        <template v-else-if="!item.type && (!item.is_show && item.is_show !== false)">
          <div class="selectable_list_item" v-bind:key="item.index" v-bind:class="{ selected: c_selected_id === item.index }" v-bind:style="{ height: c_option_height, flexBasis: c_option_height }" v-on:click.stop="onItemSelect(item)">
            <div class="item_text ellipsis" v-html="item.text"></div>
            <template v-if="item.count">
              <div class="item_count" v-bind:title="item.text">{{ item.count }}</div>
            </template>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import util from '../utils/util';
import Datepicker from 'vuejs-datepicker';
import { ko } from 'vuejs-datepicker/dist/locale';
import moment from 'moment/moment';
import BaseMixin from './Mixins/BaseMixin';

export default {
  name: 'ListOptionSelector',
  mixins: [BaseMixin],
  components: { Datepicker },
  props: ['list_item', 'width', 'default_item', 'max_height', 'y_overflow', 'x_overflow', 'tabindex', 'selector_id', 'extra_style', 'options', 'target_data'],
  data() {
    return {
      selected_item: null,
      is_clicked: false,
      close_zIndex: null,
      default_zIndex: null,
      font_color: null,
      background_color: null,
      selector_height: null,
      option_height: 30,
      theme: null,
      disable: false,
      disable_style: '',
      start_date: null,
      end_date: null,
      selected_date: null,
      date_locale_ko: ko,
      is_reverse: false,
    };
  },
  created() {
    this.selected_item = this.default_item;
  },
  computed: {
    c_is_option_type() {
      return _.filter(this.list_item, item => item.type && item.type !== 'empty_line').length > 0;
    },
    c_selected_id() {
      return this.c_selected_item.index;
    },
    c_selected_item() {
      if (this.selected_item) {
        return this.selected_item;
      }
      if (this.c_list_item.length > 0) {
        this.selected_item = this.c_list_item[0];
        return this.selected_item;
      }
      return {};
    },
    c_list_item() {
      if (!this.list_item) {
        return [];
      }
      const list = [];
      let index = 0;
      Object.keys(this.list_item).forEach((key) => {
        const item = this.list_item[key];
        item.index = index;
        if (!item.text) item.text = key;
        list.push(item);
        index++;
      });
      return list;
    },
    c_selected_text() {
      return this.c_selected_item.text ? this.c_selected_item.text : '';
    },
    c_width() {
      if (this.width) {
        if (util.isNumber(this.width)) {
          return `${this.width}px`;
        }
        return this.width;
      }
      return '120px';
    },
    c_selector_height() {
      if (this.selector_height) {
        return `${this.selector_height}px`;
      }
      return '100%';
    },
    c_option_list_height() {
      if (!this.is_clicked) {
        return 0;
      }
      if (!this.c_list_item) {
        return 0;
      }
      const item_cnt = _.filter(this.c_list_item, item => !item.type && (!item.is_show && item.is_show !== false));
      const item_line_cnt = _.filter(this.c_list_item, item => item.type && item.type === 'empty_line');
      const other_type = _.filter(this.c_list_item, item => item.type && item.type !== 'empty_line');
      return `${(item_cnt.length * this.option_height + 2) + (item_line_cnt.length) + (other_type.length * 65)}px`;
    },
    c_reverse_top() {
      return `--reverse_top: ${this.c_option_list_height}px`;
    },
    c_option_height() {
      return `${this.option_height}px`;
    },
    c_max_height() {
      if (this.max_height) {
        return `${this.max_height}px`;
      }
      return null;
    },
    c_disable_style() {
      if (!this.disable) return {};
      const style = {
        cursor: 'default',
        opacity: 0.5,
      };
      if (this.disable_style) {
        if (util.isNumber(this.disable_style.opacity)) style.opacity = this.disable_style.opacity;
      }
      return style;
    },
  },
  watch: {
    default_item(value) {
      if (value) {
        this.selected_item = value;
      }
    },
  },
  mounted() {
    let disable_key_event = false;
    if (this.extra_style) {
      if (this.extra_style.theme) this.theme = this.extra_style.theme;
      if (this.extra_style.selector_height) this.selector_height = this.extra_style.selector_height;
      if (this.extra_style.option_height) this.option_height = this.extra_style.option_height;
      disable_key_event = this.extra_style.disable_key_event === true;
    }
    if (this.options) {
      this.disable = this.options.disable === true;
      this.disable_style = this.options.disable_style;
    }
    if (disable_key_event) {
      this.$refs.select_list_item.addEventListener('keydown', this.onKeyDown);
    }
  },
  beforeDestroy() {
    if (this.extra_style && this.extra_style.disable_key_event === true) {
      this.$refs.select_list_item.removeEventListener('keydown', this.onKeyDown);
    }
  },
  methods: {
    dateFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    onSelectItemBG(in_out) {
      const select_list_item = this.$refs.select_list_item;
      if (in_out) {
        _.forEach(select_list_item.children, (value, key) => {
          if (_.find(value.classList, value_item => this.$log.debug(value_item))) {
            value.classList.remove('selected');
          }
        });
      } else {
        _.forEach(select_list_item.children, (value, key) => {
          if (_.find(value, value_item => value_item.key === this.selected_item.index)) {
            value.classList.add('selected');
          }
        });
      }
    },
    onKeyDown(event) {
      this.$emit('onKeyEvent', event, this.selector_id);
    },
    closeSelect() {
      this.default_zIndex = null;
      this.close_zIndex = null;
      this.is_clicked = false;
    },
    onSelectBoxClick() {
      if (this.disable) {
        this.is_clicked = false;
        return;
      }
      this.is_clicked = !this.is_clicked;
      this.default_zIndex = this.is_clicked ? 49 : null;
      this.close_zIndex = this.is_clicked ? 1 : null;
      this.$refs.select_box_wrapper.focus();
    },
    onKeyInput() {
      this.is_clicked = !this.is_clicked;
      this.default_zIndex = this.is_clicked ? 49 : null;
      this.close_zIndex = this.is_clicked ? 1 : null;
    },
    onItemSelect(item) {
      this.default_zIndex = null;
      this.close_zIndex = null;
      this.is_clicked = false;
      if (this.c_selected_item.index === item.index) {
        return;
      }
      this.selected_item = item;
      this.$emit('onItemSelect', item, this.target_data);
    },
    onChangeSelectItem(item) {
      this.selected_item = item;
    },
    onChangeSelectedItem(item_id) {
      this.selected_item = _.find(this.c_list_item, list_item => list_item.id === item_id);
    },
    setDisable() {
      this.disable = true;
      this.is_clicked = false;
    },
    setEnable() {
      this.disable = false;
    },
  },
};
</script>

<style scoped>
.select_box_wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: visible;
  /*z-index: 49;*/
}
.select_box_wrapper.dark_gray {

}

.select_box_wrapper .select_list_close_bg {
  position: fixed;
  display: none;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
}
.select_box_wrapper.extend .select_list_close_bg {
  display: block;
}
.select_box_wrapper .selected_item {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid #dddddd;
  cursor: pointer;
  transition-duration: 0.3s;
  background-color: #ffffff;
  z-index: 5;
}
.select_box_wrapper.dark_gray .selected_item {
  border: 1px solid #383f42;
  background-color: #192023;
  color: #ffffff;
}
.select_box_wrapper.extend .selected_item {
  border-radius: 4px 4px 0 0;
}
.select_box_wrapper .selected_item .selected_item_text {
  flex: 1;
  width: 100%;
  margin-right: 5px;
}
.select_box_wrapper .selected_item .select_icon_arrow {
  flex-basis: 10px;
  flex-grow: 0;
  flex-shrink: 0;
  width: 10px;
  height: 8px;
  background-image: url("/img/icon/select_arrow.png");
  transition-duration: 0.3s;
  transform-origin: center center;
}
.select_box_wrapper.extend .selected_item .select_icon_arrow {
  transform: rotate(180deg);
}
.select_box_wrapper .select_list_item {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 100%;
  bottom: 0;
  margin-top: -1px;
  margin-bottom: 0px;
  opacity: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: #ffffff;
  transition-duration: 0.3s;
  border: 1px solid rgba(221, 221, 221, 0);
  border-radius: 0 0 4px 4px;
  z-index: 10;
}
.select_box_wrapper .select_list_item.reverse {
  left: 0;
  top: var(--reverse_top);
  bottom: 100%;
  margin-top: 0px;
  margin-bottom: -1px;
}
.select_box_wrapper.dark_gray .select_list_item {
  border-color: rgba(56, 63, 66, 0);
  background-color: #192023;
  color: #ffffff;
}
.select_box_wrapper .select_list_item.y-overflow {
  overflow-y: auto;
}
.select_box_wrapper .select_list_item.x-overflow {
  overflow-x: auto;
}
.select_box_wrapper .select_list_item.type {
  width: auto;
  overflow: visible;
}
.select_box_wrapper.extend .select_list_item {
  display: flex;
  opacity: 1;
  border: 1px solid rgba(221, 221, 221, 1);
}
.select_box_wrapper.extend.dark_gray .select_list_item {
  border-color: rgba(56, 63, 66, 1);
}
.select_box_wrapper .select_list_item .selectable_list_item {
  position: relative;
  display: flex;
  flex-basis: 30px;
  flex-shrink: 0;
  flex-grow: 0;
  height: 30px;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  color: #555555;
  font-size: 13px;
  cursor: pointer;
}
.select_box_wrapper .select_list_item .selectable_list_item.empty_line {
  flex-basis: 1px;
  height: 1px;
  background-color: #dddddd;
  padding: 0;
  cursor: default;
}
.select_box_wrapper .select_list_item .selectable_list_item.type {
  flex-direction: column;
  cursor: default;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
}
.select_box_wrapper.dark_gray .select_list_item .selectable_list_item {
  color: #ffffff;
}
.select_box_wrapper .select_list_item .selectable_list_item.selected {
  background-color: #f5f5f5;
  cursor: default;
}
.select_box_wrapper.dark_gray .select_list_item .selectable_list_item.selected {
  background-color: #383f42;
}
.select_box_wrapper .select_list_item .selectable_list_item:hover {
  background-color: #f5f5f5;
}
.select_box_wrapper .select_list_item .selectable_list_item.empty_line:hover {
  background-color: #dddddd;
}
.select_box_wrapper .select_list_item .selectable_list_item.type:hover {
  background-color: transparent;
}
.select_box_wrapper.dark_gray .select_list_item .selectable_list_item:hover {
  background-color: #383f42;
}
.select_box_wrapper .select_list_item .selectable_list_item > .item_text {
  position: relative;
  flex: 1;
}
.select_box_wrapper .select_list_item .selectable_list_item > .item_text.type {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.select_box_wrapper .select_list_item .selectable_list_item > .item_count {
  flex: 0 0 20px;
  text-align: right;
}
.space-right-6 {
  margin-right: 6px;
}
</style>
