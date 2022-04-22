<template>
  <div class="annotation_canvas_wrapper" v-bind:class="{ active: is_active }">
    <template v-if="shape_data">
      <span class="annotation_text" ref="annotation_text" role="textbox" contenteditable
          v-html="shape_data.text" v-bind:style="c_text_style" spellcheck="false"
          v-on:focus="onTextFocus(true)" v-on:blur="onTextFocus(false)"></span>
    </template>
    <canvas class="annotation_canvas" ref="annotation_canvas" v-bind:width="width" v-bind:height="height"></canvas>
  </div>
</template>

<script>
  import AnnotationDrawMixin from './AnnotationDrawMixin';

  export default {
    name: 'AnnotationDrawText',
    mixins: [AnnotationDrawMixin],
    data() {
      return {
        padding: 15,
        min_width: 100,
        min_height: 100,
      };
    },
    computed: {
      c_font_size() {
        if (!this.shape_data) {
          return 0;
        }
        return Math.round(this.size * 1.5);
      },
      c_color() {
        return this.getColor(this.color, this.alpha);
      },
      c_text_style() {
        let width = this.shape_data.width;
        let height = this.shape_data.height;
        const x = width > 0 ? this.shape_data.x + this.padding : this.shape_data.x + width + this.padding;
        const y = height > 0 ? this.shape_data.y + this.padding : this.shape_data.y + height + this.padding;
        width = Math.abs(width) - 2 * this.padding;
        height = Math.abs(height) - 2 * this.padding;
        // let opacity = 1;
        if (width < 0) {
          width = 0;
        }
        if (height < 0) {
          height = 0;
        }

        const min_size = this.c_font_size * 1.4;
        // if (height < min_size) opacity = 0;

        return {
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          fontSize: `${this.c_font_size}px`,
          color: this.c_color,
          // opacity,
        };
      },
    },
    watch: {
    },
    methods: {
      onBeforeInit() {
        this.canvas = this.$refs.annotation_canvas;
        this.use_hit_box = false;
        this.use_edit_mode = true;
        this.pulling_delay = 15;
      },
      onBeforeDestroy() {
      },
      getShapeData(e) {
        const point = this.getMousePoint(e);
        return {
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          text: '',
        };
      },
      onDrawStart() {
      },
      onMouseMove(e) {
        if (e.type === 'touchmove') {
          e.preventDefault();
          e.stopPropagation();
        }
        const point = this.getMousePoint(e);
        if (this.is_draw_start) {
          if (!this.isTouchEvent(e) && !this.ablePulling()) return;
          if (this.isEditMode()) {
            if (!this.onEditModeMove(this.shape_data, point, this.move_info.type)) {
              return;
            }
          } else {
            this.shape_data.width = point.x - this.shape_data.x;
            this.shape_data.height = point.y - this.shape_data.y;
          }
          this.onDraw();
        } else if (this.isEditMode()) {
          this.move_info = this.getTransformMode(point);
          if (!this.move_info) {
            this.canvas.style.cursor = 'default';
          } else {
            this.canvas.style.cursor = this.move_info.cursor;
          }
        }
      },
      onMouseUp(e) {
        if (e.which !== 1 && e.type === 'mouseup') return;
        this.canvas.style.cursor = 'default';
        if (this.is_draw_start) {
          const point = this.getMousePoint(e);
          this.setDrawEvent(false);
          this.is_draw_start = false;
          if (this.isEditMode()) {
            if (!this.onEditModeMove(this.shape_data, point, this.move_info.type)) {
              return;
            }
          } else {
            this.shape_data.width = point.x - this.shape_data.x;
            this.shape_data.height = point.y - this.shape_data.y;
            if (Math.abs(this.shape_data.width) < 1) this.shape_data.width = this.min_width;
            if (Math.abs(this.shape_data.height) < 1) this.shape_data.height = this.min_height;
            this.onFirstDrawComplete(e);
            this.$refs.annotation_text.focus();
            this.$emit('onTextFocus', true);
          }
          this.setEditMode(true);
          this.onDraw();
        }
      },
      draw(shape_data) {
        if (!shape_data) return;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(this.shape_data.x, this.shape_data.y, this.shape_data.width, this.shape_data.height);

        if (this.is_active) {
          this.drawEditRect(true, null, this.isEditMode());
        }
        this.is_empty = false;
      },
      applyDrawOptions() {
        if (this.shape_info.shape) {
          this.shape_info.shape.size = this.size;
          this.shape_info.shape.alpha = this.alpha;
        }
      },
      onTextFocus(is_focus) {
        this.$emit('onTextFocus', is_focus);
        this.shape_data.text = this.$refs.annotation_text.innerHTML;
      },
    },
  };
</script>

<style scoped>
  .annotation_canvas_wrapper .annotation_text {
    position: absolute;
    display: block;
    width: 100%;
    overflow: hidden;
    min-height: 1em;
    line-height: 1.4;
    top: 0;
    left: 0;
    background-color: transparent;
    border: none;
    z-index: 20;
  }
  .annotation_canvas_wrapper.active .annotation_text {
    /*border-color: #2e6bb8;*/
    z-index: 20;
  }
  .annotation_canvas_wrapper.active .annotation_text:focus {
    outline: none;
  }
  .annotation_draw_wrapper .annotation_draw .annotation_canvas_wrapper.active {
    cursor: text;
  }
</style>
