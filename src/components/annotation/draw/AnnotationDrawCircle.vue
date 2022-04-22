<template>
  <div class="annotation_canvas_wrapper" v-bind:class="{ active: is_active }">
    <canvas class="annotation_canvas_hit" ref="annotation_canvas_hit" v-bind:width="width" v-bind:height="height"></canvas>
    <canvas class="annotation_canvas" ref="annotation_canvas" v-bind:width="width" v-bind:height="height"></canvas>
  </div>
</template>

<script>
  import AnnotationDrawMixin from './AnnotationDrawMixin';

  export default {
    name: 'AnnotationDrawCircle',
    mixins: [AnnotationDrawMixin],
    data() {
      return {};
    },
    computed: {
    },
    watch: {
    },
    methods: {
      onBeforeInit() {
        this.$log.debug('44');
        this.canvas = this.$refs.annotation_canvas;
        this.hit_canvas = this.$refs.annotation_canvas_hit;
        this.use_edit_mode = true;
        this.pulling_delay = 15;
      },
      onBeforeDestroy() {
      },
      getShapeData(e) {
        this.$log.debug('55');
        const point = this.getMousePoint(e);
        return {
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
        };
      },
      onMouseMove(e) {
        this.$log.debug('66');
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
        this.$log.debug('77');
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
          }
          this.setEditMode(true);
          this.onDraw();
        }
      },
      draw(shape_data) {
        this.$log.debug('88');
        if (!shape_data) return;

        const width = this.shape_data.width / 2;
        const height = this.shape_data.height / 2;
        const padding = this.size / 2;
        const radius_x = Math.abs(width) - padding;
        const radius_y = Math.abs(height) - padding;
        const angle = 2 * Math.PI;

        if (radius_x > 0 && radius_y > 0) {
          this.ctx.beginPath();
          this.ctx.ellipse(this.shape_data.x + width, this.shape_data.y + height, radius_x, radius_y, 0, 0, angle);
          this.ctx.stroke();
          this.ctx.closePath();

          this.hit_ctx.beginPath();
          this.hit_ctx.ellipse(this.shape_data.x + width, this.shape_data.y + height, radius_x, radius_y, 0, 0, angle);
          this.hit_ctx.stroke();
          this.hit_ctx.closePath();
          this.is_empty = false;
        } else {
          this.is_empty = true;
        }

        if (this.isEditMode()) {
          this.drawEditRect(true);
        }
      },
    },
  };
</script>

<style scoped>
</style>
