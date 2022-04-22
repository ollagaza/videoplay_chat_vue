<template>
  <div class="annotation_toolbar_wrapper" draggable="false">
    <template v-if="is_pallet_active">
      <div class="pallet_close_layer" v-on:click.stop="closePallet"></div>
    </template>
    <div class="tool_button" :title="'선택'" v-bind:class="{ active: selected_object_type === null, disable: c_disable_buttons }" v-on:click.stop="onObjectAddClick(null)">
      <img src="/img/renewal/annotation/move.png">
    </div>
    <template v-for="(info, object_type) in object_type_options">
      <div class="tool_button" v-bind:title="info.title" v-bind:class="[info.extra_class, { active: object_type === selected_object_type, disable: c_disable_buttons }]" v-on:click.stop="onObjectAddClick(object_type)">
        <img v-bind:src="info.src" v-bind:alt="info.alt">
      </div>
    </template>
    <img src="/img/renewal/annotation/line.png" alt="line" class="line">
    <span class="selector_label">{{ '크기' }}</span>
    <ListOptionSelector
      ref="sizeOptionSelector"
      v-bind:list_item="size_options"
      v-bind:default_item="default_size_option"
      v-bind:extra_style="option_selector_style"
      v-bind:options="option_selector_options"
      v-on:onItemSelect="onSizeChange"
      width="60"
    ></ListOptionSelector>
    <span class="selector_label">{{ '투명' }}</span>
    <ListOptionSelector
      ref="alphaOptionSelector"
      v-bind:list_item="alpha_options"
      v-bind:default_item="default_alpha_option"
      v-bind:extra_style="option_selector_style"
      v-bind:options="option_selector_options"
      v-on:onItemSelect="onAlphaChange"
      width="60"
    ></ListOptionSelector>
    <div class="color_picker" v-bind:class="{ disable: c_disable_buttons }" v-on:click.stop.prevent="() => false">
      <div class="color" v-bind:style="{ backgroundColor: c_selected_color_style }" v-on:click.stop="onPalletClick"></div>
      <div class="pallet" v-bind:class="{ active: is_pallet_active }" v-on:click.stop.prevent="() => false">
        <template v-for="color_info in color_options">
          <div class="color" v-bind:class="{ selected: color_info.color_id === selected_color_id }" v-bind:style="{ backgroundColor: getBackgroundColor(color_info) }" v-on:click.stop.prevent="onColorChange(color_info)"></div>
        </template>
      </div>
    </div>
    <div class="flex"></div>
    <div class="right_tools">
      <template v-if="is_editable">
        <template v-if="is_view_mode">
          <div class="annotation_btn black" v-on:click="onModifyDrawAnnotationClick" title="어노테이션 수정"><img src="/img/renewal/annotation/modify.png" alt="어노테이션 수정"><span>{{ '수정' }}</span></div>
          <div class="tool_button right_radius" title="취소" v-on:click="onDrawCancelClick"><img src="/img/renewal/annotation/cancel.png" alt="취소"></div>
        </template>
        <template v-else-if="disable">
          <div class="annotation_btn" v-on:click="onAddNewDrawAnnotationClick" title="어노테이션 추가" v-bind:class="{ disable: force_block }"><img src="/img/renewal/annotation/marking_add.png" alt="어노테이션 추가"><span>{{ '마킹' }}</span></div>
        </template>
        <template v-else>
          <div class="tool_button" title="저장" v-on:click="onDrawSaveClick"><img src="/img/renewal/annotation/save.png" alt="저장"></div>
          <img src="/img/renewal/annotation/line.png" alt="line" class="line">
          <div class="tool_button" v-bind:class="{ disable: !is_shape_selected }" title="삭제" v-on:click.stop="onObjectDeleteClick"><img src="/img/renewal/annotation/trash.png" alt="삭제"></div>
          <div class="tool_button" title="초기화" v-on:click="onClearAllClick"><img src="/img/renewal/annotation/reset.png" alt="초기화"></div>
          <template v-if="is_new_annotation">
            <div class="tool_button" title="취소" v-on:click="onDrawCancelClick"><img src="/img/renewal/annotation/cancel.png" alt="취소"></div>
          </template>
        </template>
      </template>
      <template v-else>
        <template v-if="is_view_mode">
          <div class="tool_button" title="취소" v-on:click="onDrawCancelClick"><img src="/img/renewal/annotation/cancel.png" alt="취소"></div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
  import * as Constant from '../../../constants';
  import ListOptionSelector from '../../../components/ListOptionSelector';
  import util from '../../../utils/util';
  import BaseMixin from '../../../components/Mixins/BaseMixin';
  import ChangeLang from './AnnotationToolBar.vue.lang';
  import LocalStorage from '../../../utils/local_storage';

  export default {
    name: 'AnnotationToolBar',
    mixins: [BaseMixin],
    props: ['draw_event_bus', 'is_editable'],
    components: { ListOptionSelector },
    data() {
      return {
        object_type_options: {},
        color_options: {},
        size_options: {},
        alpha_options: {},
        selected_object_type: null,
        default_size_option: null,
        default_alpha_option: null,
        option_selector_style: {
          selector_height: 26,
          option_height: 26,
          theme: 'dark_gray',
          disable_key_event: true,
        },
        option_selector_options: {
          disable: true,
        },
        selected_color_id: null,
        is_pallet_active: false,
        size: 5,
        alpha: 1,
        disable: true,
        is_edit_mode: true,
        is_new_annotation: false,
        is_view_mode: false,
        is_shape_selected: false,
        force_block: false,
      };
    },
    created() {
      const stored_option = LocalStorage.getData(Constant.CATEGORY_DRAW, Constant.DRAW_SETTING);
      if (stored_option) {
        if (stored_option.alpha) this.alpha = stored_option.alpha;
        if (stored_option.size) this.size = stored_option.size;
        if (stored_option.color_id) this.selected_color_id = stored_option.color_id;
      }
      this.lang_map = ChangeLang;
      this.object_type_options[Constant.RECT] = {
        src: '/img/renewal/annotation/square.png',
        alt: 'draw square',
        // extra_class: 'left_radius',
        title: '직사각형',
      };
      this.object_type_options[Constant.CIRCLE] = {
        src: '/img/renewal/annotation/circle.png',
        alt: 'draw circle',
        title: '타원',
      };
      this.object_type_options[Constant.PEN] = {
        src: '/img/renewal/annotation/pen.png',
        alt: 'draw pen',
        title: '자유곡선',
      };
      this.object_type_options[Constant.TEXT] = {
        src: '/img/renewal/annotation/text.png',
        alt: 'draw text',
        title: '글상자',
      };
      for (let i = 1; i <= 6; i++) {
        const value = i * 5;
        const option = { text: value, id: value };
        this.size_options[value] = option;
        if (value === this.size) {
          this.default_size_option = option;
        }
      }
      for (let i = 5; i >= 1; i--) {
        const value = Math.floor(i * 0.2 * 10) / 10;
        const option = { text: value, id: value };
        this.alpha_options[value] = option;
        if (value === this.alpha) {
          this.default_alpha_option = option;
        }
      }
      const color_list = [
        [255, 255, 255],
        [237, 29, 50],
        [251, 146, 36],
        [251, 229, 85],
        [52, 171, 25],
        [82, 189, 202],
        [16, 137, 255],
        [87, 86, 214],
        [176, 48, 176],
      ];
      for (let i = 0; i < color_list.length; i++) {
        const color = color_list[i];
        const color_id = util.rgbToHex(color[0], color[1], color[2]);
        this.color_options[color_id] = {
          color_id,
          red: color[0],
          green: color[1],
          blue: color[2],
        };
        if (!this.selected_color_id) {
          this.selected_color_id = color_id;
        }
      }
      this.draw_event_bus.on('onOptionsChange', this.onOptionsChange);
      this.draw_event_bus.on('onDrawComplete', this.onDrawComplete);
      this.draw_event_bus.on('onDrawerActiveChange', this.onDrawerActiveChange);
      this.draw_event_bus.on('onEditModeChange', this.onEditModeChange);
      this.draw_event_bus.on('onShapeSelected', this.onShapeSelected);
      this.draw_event_bus.on('resetToolbarSelection', this.resetToolbarSelection);
    },
    mounted() {
    },
    computed: {
      c_selected_color() {
        if (!this.selected_color_id || !this.color_options[this.selected_color_id]) return null;
        return this.color_options[this.selected_color_id];
      },
      c_selected_color_style() {
        return this.getBackgroundColor(this.c_selected_color);
      },
      c_disable_buttons() {
        return this.disable || !this.is_edit_mode;
      },
    },
    methods: {
      onOptionChange() {
        LocalStorage.setData(Constant.CATEGORY_DRAW, Constant.DRAW_SETTING, {
          alpha: this.alpha,
          size: this.size,
          color_id: this.selected_color_id,
        });
      },
      onDrawCancelClick() {
        this.draw_event_bus.emit('onDrawCancelClick');
      },
      onAddNewDrawAnnotationClick() {
        if (!this.disable || !this.is_editable) return;
        this.draw_event_bus.emit('onAddNewDrawAnnotationClick');
      },
      onDrawSaveClick() {
        if (this.disable) return;
        if (this.is_new_annotation) {
          this.draw_event_bus.emit('onDrawSaveClick');
        } else {
          this.draw_event_bus.emit('onDrawModifySaveClick');
        }
      },
      onModifyDrawAnnotationClick() {
        if (!this.is_view_mode) return;
        this.draw_event_bus.emit('onModifyDrawAnnotationClick');
      },
      onClearAllClick() {
        if (this.disable) return;
        this.draw_event_bus.emit('onClearAllClick');
      },
      onObjectDeleteClick() {
        if (this.disable) return;
        this.draw_event_bus.emit('onDeleteObject');
      },
      onObjectAddClick(object_type) {
        if (this.c_disable_buttons) return;
        if (!this.draw_event_bus) return;
        if (this.selected_object_type === object_type) {
          this.selected_object_type = null;
          this.draw_event_bus.emit('onAddObject', null);
          return;
        }
        this.draw_event_bus.emit('onAddObject', object_type, this.getCurrentOptions());
        this.selected_object_type = object_type;
      },
      onSizeChange(selected_option) {
        if (this.c_disable_buttons) return;
        if (!this.draw_event_bus) return;
        this.size = selected_option.id;
        this.draw_event_bus.emit('onSizeChange', this.size);
        this.onOptionChange();
      },
      onAlphaChange(selected_option) {
        if (this.c_disable_buttons) return;
        if (!this.draw_event_bus) return;
        this.alpha = selected_option.id;
        this.draw_event_bus.emit('onAlphaChange', this.alpha);
        this.onOptionChange();
      },
      onColorChange(color) {
        if (this.c_disable_buttons) return;
        this.selected_color_id = color.color_id;
        this.closePallet();
        if (!this.draw_event_bus) return;
        this.draw_event_bus.emit('onColorChange', color);
        this.onOptionChange();
      },
      ignoreEvent() {
        return false;
      },
      getBackgroundColor(color) {
        if (!color) return null;
        return `rgb(${color.red}, ${color.green}, ${color.blue})`;
      },
      onOptionsChange(options) {
        this.selected_object_type = options.type;
        this.selected_color_id = options.color.color_id;
        this.$refs.sizeOptionSelector.onChangeSelectedItem(options.size);
        this.$refs.alphaOptionSelector.onChangeSelectedItem(options.alpha);
      },
      onPalletClick() {
        if (this.c_disable_buttons) return;
        this.is_pallet_active = !this.is_pallet_active;
      },
      closePallet() {
        this.is_pallet_active = false;
      },
      onDrawComplete() {
        this.selected_object_type = null;
      },
      getCurrentOptions() {
        return {
          color: this.color_options[this.selected_color_id],
          size: this.size,
          alpha: this.alpha,
        };
      },
      setDrawerActive(is_active) {
        this.draw_event_bus.emit('setDrawerActive', is_active);
      },
      onDrawerActiveChange(is_active) {
      },
      setDisable() {
        this.closePallet();
        this.selected_object_type = null;
        this.disable = true;
        this.is_shape_selected = true;
        this.$refs.sizeOptionSelector.setDisable();
        this.$refs.alphaOptionSelector.setDisable();
      },
      setEnable() {
        this.disable = false;
        this.$refs.sizeOptionSelector.setEnable();
        this.$refs.alphaOptionSelector.setEnable();
      },
      onEditModeChange(is_edit_mode, is_new_annotation, is_view_mode, force_block = false, caller = null) {
        this.is_edit_mode = is_edit_mode;
        this.is_new_annotation = is_new_annotation;
        this.is_view_mode = is_view_mode;
        this.force_block = force_block;
        if (is_edit_mode) {
          this.setEnable();
        } else {
          this.setDisable();
        }
      },
      onShapeSelected(is_select, reset_object_type = false) {
        this.is_shape_selected = is_select;
        if (!is_select && reset_object_type) {
          this.selected_object_type = null;
        }
      },
      resetToolbarSelection() {
        this.is_shape_selected = false;
        this.selected_object_type = null;
      },
    },
  };
</script>

<style scoped>
  .annotation_toolbar_wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 40px;
    background-color: #192023;
    border-radius: 4px 4px 0 0;
    overflow: visible;
    z-index: 20;
    user-select: none;
    padding: 0 6px;
  }
  .annotation_toolbar_wrapper .disable {
    cursor: default !important;
    opacity: 0.5 !important;
    pointer-events: none !important;
  }
  .annotation_toolbar_wrapper .line {
    margin: 0 4px;
  }
  .annotation_toolbar_wrapper .tool_button {
    flex: 0 0 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 100%;
    cursor: pointer;
  }
  .annotation_toolbar_wrapper .tool_button.left_radius {
    border-radius: 4px 0 0 0;
  }
  .annotation_toolbar_wrapper .tool_button.right_radius {
    border-radius: 0 4px 0 0;
  }
  .annotation_toolbar_wrapper .tool_button:hover {
    background-color: #383f42;
  }
  .annotation_toolbar_wrapper .tool_button.active {
    background-color: #2e6bb8;
    cursor: default;
  }
  .annotation_toolbar_wrapper .tool_button.disable {
    background-color: transparent;
    opacity: 0.3;
    cursor: default;
  }
  .annotation_toolbar_wrapper .selector_label {
    font-weight: 400;
    font-size: 13px;
    color: #888888;
    padding: 0 6px 0 10px;
  }
  .annotation_toolbar_wrapper .color_picker {
    position: relative;
    margin-left: 9px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 4px;
    overflow: visible;
  }
  .annotation_toolbar_wrapper .color_picker:hover {
    background-color: #383f42;
  }
  .annotation_toolbar_wrapper .color_picker.disable:hover {
    background-color: transparent;
  }
  .annotation_toolbar_wrapper .color_picker .color {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    margin: 5px;
    border-radius: 10px;
    cursor: pointer;
    background-position: center center;
    background-repeat: no-repeat;
    transition-duration: 0.4s;
    transition-property: background-color;
  }
  .annotation_toolbar_wrapper .color_picker.disable .color {
    cursor: default;
  }
  .annotation_toolbar_wrapper .color_picker .color.selected {
    background-image: url("/img/renewal/annotation/color_check.png");
  }
  .annotation_toolbar_wrapper .color_picker .pallet {
    position: absolute;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    top: 30px;
    left: -5px;
    width: 100px;
    background-color: #282f32;
    opacity: 0;
    transition-duration: 0.2s;
    pointer-events: none;
    padding: 5px;
  }
  .annotation_toolbar_wrapper .color_picker .pallet.active {
    pointer-events: unset;
    opacity: 1;
  }
  .annotation_toolbar_wrapper .pallet_close_layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0);
    cursor: default;
  }
  .right_tools {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    color: #ffffff;
    height: 100%;
    flex-shrink: 0;
  }
  .right_tools > .annotation_btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    flex: 0 0 80px;
    width: fit-content;
    height: 26px;
    margin-right: 6px;
    background-color: #2e6bb8;
    border: 1px solid transparent;
    color: #ffffff;
    font-weight: 400;
    font-size: 13px;
  }
  .right_tools > .annotation_btn > img {
    margin-right: 8px;
  }
  .right_tools > .annotation_btn:hover {
    background-color: #5287c8;
  }
  .right_tools > .annotation_btn.black {
    background-color: transparent;
    border-color: #555555;
  }
  .right_tools > .annotation_btn.black:hover {
    border-color: #888888;
  }
  .annotation_toolbar_wrapper .right_tools > .tool_button {
    flex: 0 0 30px;
  }
</style>
