<template>
  <div class="annotation_draw_wrapper" ref="annotation_draw_wrapper" v-bind:class="{ active: c_is_active }" v-on:click.stop="setDrawerActive(true)">
    <template v-if="is_init">
      <div class="annotation_draw" v-bind:style="c_wrapper_style">
        <template v-for="(shape_info, index) in c_shape_info_list">
          <template v-if="shape_info.type === RECT">
            <AnnotationDrawRect
              v-bind:shape_info="shape_info"
              v-bind:options="c_draw_option"
              v-bind:key="shape_info.id"
              v-bind:index="index"
              v-on:onInitComplete="onComponentInitComplete"
              v-on:onEditCancel="onEditCancel"
              v-on:onFirstDrawComplete="onFirstDrawComplete"
            ></AnnotationDrawRect>
          </template>
          <template v-else-if="shape_info.type === CIRCLE">
            <AnnotationDrawCircle
              v-bind:shape_info="shape_info"
              v-bind:options="c_draw_option"
              v-bind:key="shape_info.id"
              v-bind:index="index"
              v-on:onInitComplete="onComponentInitComplete"
              v-on:onEditCancel="onEditCancel"
              v-on:onFirstDrawComplete="onFirstDrawComplete"
            ></AnnotationDrawCircle>
          </template>
          <template v-if="shape_info.type === PEN">
            <AnnotationDrawPen
              v-bind:shape_info="shape_info"
              v-bind:options="c_draw_option"
              v-bind:key="shape_info.id"
              v-bind:index="index"
              v-on:onInitComplete="onComponentInitComplete"
              v-on:onEditCancel="onEditCancel"
              v-on:onFirstDrawComplete="onFirstDrawComplete"
            ></AnnotationDrawPen>
          </template>
          <template v-if="shape_info.type === TEXT">
            <AnnotationDrawText
              v-bind:shape_info="shape_info"
              v-bind:options="c_draw_option"
              v-bind:key="shape_info.id"
              v-bind:index="index"
              v-on:onInitComplete="onComponentInitComplete"
              v-on:onEditCancel="onEditCancel"
              v-on:onFirstDrawComplete="onFirstDrawComplete"
              v-on:onTextFocus="onTextFocus"
            ></AnnotationDrawText>
          </template>
        </template>
        <div class="annotation_canvas_event_layer" v-on:click="onEventLayerClick"></div>
      </div>
    </template>
  </div>
</template>

<script>
  import _ from 'lodash';
  import AnnotationDrawPen from './AnnotationDrawPen';
  import AnnotationDrawRect from './AnnotationDrawRect';
  import AnnotationDrawCircle from './AnnotationDrawCircle';
  import AnnotationDrawText from './AnnotationDrawText';
  import util from '../../../utils/util';
  import * as Constant from '../../../constants';
  import LocalStorage from '../../../utils/local_storage';

  export default {
    name: 'AnnotationDraw',
    props: ['draw_event_bus', 'width', 'height', 'viewer_id'],
    components: { AnnotationDrawPen, AnnotationDrawRect, AnnotationDrawCircle, AnnotationDrawText },
    data() {
      return {
        RECT: Constant.RECT,
        CIRCLE: Constant.CIRCLE,
        PEN: Constant.PEN,
        TEXT: Constant.TEXT,
        content_width: 0,
        content_height: 0,
        scale: 0,
        offsetX: 0,
        offsetY: 0,
        shape_info_list: [],
        shape_component_map: {},
        is_init: false,
        object_type_map: {},
        selected_id: null,
        selected_index: null,
        last_object_type: null,
        last_options: null,
        alpha: 1,
        size: 10,
        color: {
          color_id: 1,
          red: 255,
          green: 0,
          blue: 0,
        },
        is_key_event_active: false,
        is_active: false,
        is_add_active_event: false,
        is_edit_mode: false,
        is_view_mode: false,
        small_area: 1,
        list_length: 0,
      };
    },
    created() {
      this.object_type_map[this.PEN] = true;
      this.object_type_map[this.RECT] = true;
      this.object_type_map[this.CIRCLE] = true;
      this.object_type_map[this.TEXT] = true;
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {
      this.removeEventListener();
    },
    computed: {
      c_media_width() {
        return this.width ? this.width : 1920;
      },
      c_media_height() {
        return this.height ? this.height : 1080;
      },
      c_wrapper_width() {
        return this.c_media_width * this.scale;
      },
      c_wrapper_height() {
        return this.c_media_height * this.scale;
      },
      c_wrapper_transform_style() {
        return `translate(-50%, -50%) scale(${this.scale})`;
      },
      c_wrapper_style() {
        return {
          width: `${this.c_media_width}px`,
          height: `${this.c_media_height}px`,
          transform: this.c_wrapper_transform_style,
        };
      },
      c_draw_option() {
        return {
          scale: this.scale,
          width: this.c_media_width,
          height: this.c_media_height,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          size: this.size,
          alpha: this.alpha,
          color: this.color,
        };
      },
      c_is_active() {
        return this.is_active;
      },
      c_shape_info_list() {
        return this.shape_info_list.slice(0, this.list_length);
      },
    },
    methods: {
      init() {
        this.setEventListener();
        this.onWindowResize();
        this.is_init = true;
      },
      setEventListener() {
        window.addEventListener('resize', this.onWindowResize);
      },
      removeEventListener() {
        window.removeEventListener('resize', this.onWindowResize);
        this.setDrawerActive(false);
      },
      onWindowResize() {
        this.content_width = this.$refs.annotation_draw_wrapper.clientWidth;
        this.content_height = this.$refs.annotation_draw_wrapper.clientHeight;
        const width_scale = this.content_width / this.c_media_width;
        const height_scale = this.content_height / this.c_media_height;
        this.scale = Math.min(width_scale, height_scale);
        this.setOffset();
        this.noticeResize();
      },
      setOffset() {
        let offsetX = 0;
        let offsetY = 0;
        let element = this.$refs.annotation_draw_wrapper;
        if (element.offsetParent !== undefined) {
          do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
          } while ((element = element.offsetParent));
        }
        this.offsetX = offsetX + (this.content_width - this.c_wrapper_width) / 2;
        this.offsetY = offsetY + (this.content_height - this.c_wrapper_height) / 2;
      },
      onComponentInitComplete(shape_info, component) {
        const id = shape_info.id;
        this.shape_component_map[id] = component;

        this.setComponentActive(id, id === this.selected_id);
      },
      onEditCancel(shape_info, point, e) {
        this.setComponentActive(shape_info.id, false);
        this.onShapeSelected(false, true);
        // const is_hit = this.checkHitShape(point);
        // if (!is_hit && this.last_object_type) {
        //   this.onAddObject(this.last_object_type, this.last_options, true, e);
        // }
      },
      noticeResize() {
        _.each(this.shape_component_map, (component) => {
          if (component.onResize) {
            component.onResize(this.c_draw_option, true);
          }
        });
      },
      onAddObject(object_type, options, is_force_start = false, event = null) {
        this.$log.debug('1111');
        this.resetSelection();
        if (!object_type) {
          this.last_object_type = null;
          this.last_options = null;
          return;
        }
        if (!this.object_type_map[object_type]) return;
        this.setOptions(options);
        const shape_info = this.createShapeInfo(object_type, is_force_start, event);
        this.shape_info_list = this.c_shape_info_list;
        this.shape_info_list.push(shape_info);
        this.list_length = this.shape_info_list.length;
        this.selected_id = shape_info.id;
        this.last_object_type = object_type;
        this.is_active = true;
      },
      onDeleteObject() {
        this.deleteShape(this.selected_id, this.selected_index);
      },
      setOptions(options) {
        if (!options) return;
        this.size = options.size;
        this.alpha = options.alpha;
        const color_info = options.color;
        this.color.color_id = color_info.color_id;
        this.color.red = color_info.red;
        this.color.green = color_info.green;
        this.color.blue = color_info.blue;
        this.last_options = JSON.parse(JSON.stringify(options));
      },
      createShapeInfo(object_type, is_force_start = false, event = null) {
        return {
          id: util.getRandomId(),
          type: object_type,
          shape: null,
          is_force_start,
          event,
        };
      },
      clearSelection(id, is_active) {
        if (this.selected_id && this.shape_component_map[this.selected_id]) {
          if (!is_active && this.shape_component_map[this.selected_id].isDrawShape() === false) {
            const index = _.findIndex(this.shape_info_list, shape_info => shape_info.id === this.selected_id);
            this.deleteShape(this.selected_id, index);
          } else if (id !== this.selected_id) {
            this.shape_component_map[this.selected_id].setActive(false);
          }
        }
      },
      setComponentActive(id, is_active) {
        this.$log.debug('2222');
        this.clearSelection(id, is_active);

        this.selected_id = null;
        this.selected_index = null;
        if (id && this.shape_component_map[id]) {
          const component = this.shape_component_map[id];
          component.setActive(is_active);
          if (is_active) {
            this.selected_id = id;
            this.selected_index = _.findIndex(this.shape_info_list, shape_info => shape_info.id === id);
            const options = component.getCurrentOptions();
            this.onOptionsChange(options);
            this.is_key_event_active = true;
            this.setDrawerActive(true);
          }
        }
        if (!is_active) {
          this.onShapeSelected(false);
        }
      },
      onFirstDrawComplete(shape_info, event, is_draw, shape_id, index) {
        this.$log.debug('3333');
        if (shape_info.type === this.TEXT) {
          this.onShapeSelected(true);
        } else if (shape_info.type === this.PEN) {
          if (!is_draw) {
            this.deleteShape(shape_id, index);
          }
          this.onAddObject(this.last_object_type, this.last_options, false, null);
        } else {
          this.onShapeSelected(true);
        }
      },
      copyShape() {
        this.$log.debug('4444');
        if (this.selected_id && this.shape_component_map[this.selected_id]) {
          const shape = this.shape_component_map[this.selected_id].getCopyShapeInfo();
          if (shape) {
            LocalStorage.setData(Constant.CATEGORY_DRAW, Constant.DRAW_SHAPE, shape);
            return true;
          }
        }
        return false;
      },
      pasteShape() {
        let copy_shape_info = LocalStorage.getData(Constant.CATEGORY_DRAW, Constant.DRAW_SHAPE);
        if (!copy_shape_info) return false;
        if (typeof copy_shape_info === 'string') copy_shape_info = JSON.parse(copy_shape_info);
        if (copy_shape_info.type && copy_shape_info.shape) {
          const id = util.getRandomId();
          const shape = copy_shape_info.shape.data ? copy_shape_info.shape.data : null;
          let gap_info = LocalStorage.getData(Constant.CATEGORY_DRAW, Constant.DRAW_GAP);
          if (!gap_info || !gap_info.gap || gap_info.id !== copy_shape_info.id) {
            gap_info = {
              id: copy_shape_info.id,
              gap: 20,
            };
          } else {
            gap_info.gap += 20;
          }
          if (shape) {
            if (util.isNumber(shape.x) && util.isNumber(shape.y)) {
              shape.x += gap_info.gap;
              shape.y += gap_info.gap;
            } else if (util.isArray(shape.point_list)) {
              for (let i = 0; i < shape.point_list.length; i++) {
                const point = shape.point_list[i];
                if (point) {
                  point.x += gap_info.gap;
                  point.y += gap_info.gap;
                }
              }
            }
            LocalStorage.setData(Constant.CATEGORY_DRAW, Constant.DRAW_GAP, gap_info);
            this.clearSelection(id, false);
            copy_shape_info.id = id;
            this.selected_id = id;
            this.shape_info_list.push(copy_shape_info);
            this.list_length = this.shape_info_list.length;
            return true;
          }
        }
        return false;
      },
      onDrawerKeyUp(e) {
        this.$log.debug('5555');
        const tag_name = `${e.target.tagName}`.toLowerCase();
        if (`${e.target.role}`.toLowerCase() === 'textbox') return true;
        if (tag_name === 'input' || tag_name === 'textarea' || tag_name === 'select' || tag_name === 'span') return true;
        if (this.is_key_event_active) {
          const key = e.key.toLowerCase();
          const shift = e.shiftKey;
          const ctrl = e.ctrlKey;
          const is_escape = key === 'escape';
          const is_delete = key === 'delete';
          let disable_event = false;
          if (this.is_edit_mode) {
            if (ctrl && shift && key === 'z') {
              if (this.list_length < this.shape_info_list.length) {
                this.resetSelection();
                this.onShapeSelected(false, true);
                this.list_length++;
                disable_event = true;
              }
            } else if (ctrl && key === 'z') {
              if (this.list_length > 0) {
                this.resetSelection();
                this.onShapeSelected(false, true);
                this.list_length--;
                disable_event = true;
              }
            } else if (ctrl && key === 'c') {
              disable_event = this.copyShape();
            } else if (ctrl && key === 'v') {
              disable_event = this.pasteShape();
            }
          }
          if (!disable_event) {
            if (this.is_edit_mode && this.selected_id) {
              if (is_delete) {
                this.deleteShape(this.selected_id, this.selected_index);
                disable_event = true;
              } else if (is_escape) {
                this.resetSelection();
                this.onShapeSelected(false, true);
                disable_event = true;
              }
            } else if (!this.is_edit_mode) {
              if (is_escape) {
                this.setDrawerActive(false);
                disable_event = true;
              }
            } else if (this.is_view_mode) {
              if (key === ' ') {
                // this.$log.debug('space');
              }
            }
          }
          if (disable_event) {
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        }
        return true;
      },
      onEventLayerClick(e) {
        this.$log.debug('6666');
        if (!this.is_edit_mode) return;
        const point = this.getMousePoint(e);
        this.checkHitShape(point);
      },
      getMousePoint(e) {
        this.$log.debug('7777');
        const x = Math.round((e.pageX - this.offsetX) / this.scale);
        const y = Math.round((e.pageY - this.offsetY) / this.scale);
        return { x, y };
      },
      checkHitShape(point) {
        for (let i = this.c_shape_info_list.length - 1; i >= 0; i--) {
          const shape_info = this.c_shape_info_list[i];
          const id = shape_info.id;
          const component = this.shape_component_map[id];
          if (component.isShapeHit(point)) {
            this.setShapeSelect(id);
            return true;
          }
        }
        return false;
      },
      setShapeSelect(id) {
        this.$log.debug('8888');
        this.setComponentActive(id, true);
        this.onShapeSelected(true);
      },
      deleteShape(id, index) {
        if (id && this.shape_component_map[id] && index >= 0 && index < this.c_shape_info_list.length) {
          this.shape_component_map[id].setActive(false);
          this.shape_info_list = this.c_shape_info_list;
          this.$delete(this.shape_info_list, index);
          this.list_length = this.shape_info_list.length;
          delete this.shape_component_map[id];
          this.onShapeSelected(false, true);
        }
      },
      onSizeChange(size) {
        this.size = size;
        const id = this.selected_id;
        if (id && this.shape_component_map[id]) {
          if (this.shape_component_map[id].isActive()) {
            this.shape_component_map[id].onSizeChange(this.c_draw_option, true);
          }
        }
        if (this.last_options) {
          this.last_options.size = size;
        }
      },
      onAlphaChange(alpha) {
        this.$log.debug('9999');
        this.alpha = alpha;
        const id = this.selected_id;
        if (id && this.shape_component_map[id]) {
          if (this.shape_component_map[id].isActive()) {
            this.shape_component_map[id].onAlphaChange(this.c_draw_option, true);
          }
        }
        if (this.last_options) {
          this.last_options.alpha = alpha;
        }
      },
      onColorChange(color_info) {
        this.color.color_id = color_info.color_id;
        this.color.red = color_info.red;
        this.color.green = color_info.green;
        this.color.blue = color_info.blue;
        const id = this.selected_id;
        if (id && this.shape_component_map[id]) {
          if (this.shape_component_map[id].isActive()) {
            this.shape_component_map[id].onColorChange(this.c_draw_option, true);
          }
        }
        if (this.last_options) {
          this.last_options.color.color_id = color_info.color_id;
          this.last_options.color.red = color_info.red;
          this.last_options.color.green = color_info.green;
          this.last_options.color.blue = color_info.blue;
        }
      },
      ignoreEvent() {
        return false;
      },
      setEditMode(is_edit_mode, is_new_annotation = false, is_view_mode = false, force_block = false, caller = null) {
        // this.$log.debug(this.$options.name, '[setEditMode]', this.viewer_id, { is_edit_mode, is_new_annotation, is_view_mode, force_block, caller });
        this.is_edit_mode = is_edit_mode;
        this.is_view_mode = is_view_mode;
        this.draw_event_bus.emit('onEditModeChange', is_edit_mode, is_new_annotation, is_view_mode, force_block, `${this.$options.name}.setEditMode`);
      },
      onDocumentClick(event) {
        if (this.is_edit_mode) {
          this.resetSelection();
          this.onShapeSelected(false, true);
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
        return true;
      },
      onOptionsChange(options) {
        this.size = options.size;
        this.alpha = options.alpha;
        const color_info = options.color;
        this.color.color_id = color_info.color_id;
        this.color.red = color_info.red;
        this.color.green = color_info.green;
        this.color.blue = color_info.blue;
        this.last_object_type = options.type;
        this.last_options = JSON.parse(JSON.stringify(options));
        this.draw_event_bus.emit('onOptionsChange', options);
      },
      setDrawerActive(is_active, caller = null) {
        // this.$log.debug('11');
        // this.$log.debug(this.$options.name, '[setDrawerActive]', this.viewer_id, { is_active, caller });
        if (this.is_active === false && this.is_active === is_active) return;
        this.is_active = is_active;
        this.draw_event_bus.emit('onDrawerActiveChange', this.is_active, this.is_view_mode);
        if (is_active) {
          this.onDrawerActive();
        } else {
          this.onDrawerUnActive();
          this.clearShapes();
          this.setEditMode(false, false, false, false, `${this.$options.name}.setDrawerActive`);
        }
      },
      setDrawerEvent() {
        this.$log.debug('22');
        if (!this.is_add_active_event) {
          document.addEventListener('keyup', this.onDrawerKeyUp);
          document.addEventListener('click', this.onDocumentClick);
          this.draw_event_bus.on('onAddObject', this.onAddObject);
          this.draw_event_bus.on('onDeleteObject', this.onDeleteObject);
          this.draw_event_bus.on('onSizeChange', this.onSizeChange);
          this.draw_event_bus.on('onAlphaChange', this.onAlphaChange);
          this.draw_event_bus.on('onColorChange', this.onColorChange);
          this.draw_event_bus.on('onClearAllClick', this.clearShapes);
          this.is_add_active_event = true;
        }
      },
      unsetDrawerEvent() {
        document.removeEventListener('keyup', this.onDrawerKeyUp);
        document.removeEventListener('click', this.onDocumentClick);
        this.draw_event_bus.off('onAddObject', this.onAddObject);
        this.draw_event_bus.off('onDeleteObject', this.onDeleteObject);
        this.draw_event_bus.off('onSizeChange', this.onSizeChange);
        this.draw_event_bus.off('onAlphaChange', this.onAlphaChange);
        this.draw_event_bus.off('onColorChange', this.onColorChange);
        this.draw_event_bus.off('onClearAllClick', this.clearShapes);
        this.is_add_active_event = false;
      },
      onDrawerActive() {
        this.$log.debug('33');
        this.setDrawerEvent();
        this.is_key_event_active = true;
      },
      onDrawerUnActive() {
        this.unsetDrawerEvent();
        this.is_edit_mode = false;
        this.is_view_mode = false;
        this.is_add_active_event = false;
      },
      getShapeInfoList() {
        const result_list = [];
        if (!this.is_active) return null;
        for (let i = 0; i < this.c_shape_info_list.length; i++) {
          const shape_info = this.c_shape_info_list[i];
          if (!shape_info || !shape_info.shape || !shape_info.shape.data) continue;
          const shape_data = this.c_shape_info_list[i].shape.data;
          const area = Math.abs(shape_data.width * shape_data.height);
          result_list.push(this.c_shape_info_list[i]);
        }
        return result_list;
      },
      setShapeInfoList(shape_info_list) {
        this.resetSelection();
        this.$set(this, 'shape_info_list', []);
        this.$nextTick(() => {
          if (shape_info_list && shape_info_list.length > 0) {
            shape_info_list.forEach((shape_info) => {
              this.shape_info_list.push(JSON.parse(JSON.stringify(shape_info)));
            });
            this.list_length = this.shape_info_list.length;
          }
        });
      },
      clearShapes() {
        this.resetSelection();
        this.shape_info_list = [];
        this.list_length = 0;
        this.shape_component_map = {};
      },
      onTextFocus(is_focus) {
        this.is_key_event_active = !is_focus;
      },
      resetSelection() {
        this.setComponentActive(this.selected_id, false);
      },
      onShapeSelected(is_select, reset_object_type = false) {
        this.draw_event_bus.emit('onShapeSelected', is_select, reset_object_type);
      },
      isEditMode() {
        // this.$log.debug('aaaaaaaaaaaaaaaa');
        return this.is_edit_mode;
      },
    },
  };
</script>

<style scoped>
</style>
