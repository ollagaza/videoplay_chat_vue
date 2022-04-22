<template>
  <div class="annotation_canvas_wrapper" v-bind:class="{ active: is_active }">
    <canvas class="annotation_canvas_hit" ref="annotation_canvas_hit" v-bind:width="width" v-bind:height="height"></canvas>
    <canvas class="annotation_canvas" ref="annotation_canvas" v-bind:width="width" v-bind:height="height"></canvas>
  </div>
</template>

<script>
  import AnnotationDrawMixin from './AnnotationDrawMixin';

  export default {
    name: 'AnnotationDrawPen',
    mixins: [AnnotationDrawMixin],
    data() {
      return {
        rect: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        origin_rect: {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        origin_shape_data: [],
      };
    },
    computed: {
    },
    watch: {
    },
    methods: {
      onBeforeInit() {
        this.canvas = this.$refs.annotation_canvas;
        this.hit_canvas = this.$refs.annotation_canvas_hit;
        this.use_edit_mode = true;
      },
      onBeforeDestroy() {
      },
      getShapeData(e) {
        const point = this.getMousePoint(e);
        const shape_data = {
          point_list: [],
          width: 0,
          height: 0,
        };
        shape_data.point_list.push(point);
        this.initRect(point);
        return shape_data;
      },
      initRect(point) {
        this.rect.left = point.x;
        this.rect.right = point.x;
        this.rect.top = point.y;
        this.rect.bottom = point.y;
        this.rect.x = point.x;
        this.rect.y = point.y;
        this.rect.width = 0;
        this.rect.height = 0;
        this.origin_rect.left = point.x;
        this.origin_rect.top = point.y;
        this.origin_rect.width = 0;
        this.origin_rect.height = 0;
        this.origin_shape_data = [];
        this.origin_shape_data.push({ x: point.x, y: point.y });
      },
      getMoveInfo(point) {
        const move_info = this.getTransformMode(point, this.rect);
        if (move_info) {
          this.diff_point = {
            x: point.x - move_info.x,
            y: point.y - move_info.y,
            left: this.rect.x - this.origin_rect.left,
            top: this.rect.y - this.origin_rect.top,
            width: this.rect.width,
            height: this.rect.height,
          };
          return move_info;
        }
        return null;
      },
      onMouseMove(e) {
        if (e.type === 'touchmove') {
          e.preventDefault();
          e.stopPropagation();
        }
        const point = this.getMousePoint(e);
        // this.$log.debug(this.$options.name, point);
        if (this.is_draw_start) {
          if (!this.isTouchEvent(e) && !this.ablePulling()) return;
          if (this.isEditMode()) {
            if (!this.onEditModeMove(this.shape_data.point_list, point, this.move_info.type)) {
              return;
            }
          } else {
            this.shape_data.point_list.push(point);
            this.origin_shape_data.push({ x: point.x, y: point.y });
            this.resetRect(point, true);
          }
          this.onDraw();
        } else if (this.isEditMode()) {
          this.move_info = this.getTransformMode(point, this.rect);
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
            if (!this.onEditModeMove(this.shape_data.point_list, point, this.move_info.type)) {
              return;
            }
          } else {
            this.shape_data.point_list.push(point);
            this.origin_shape_data.push({ x: point.x, y: point.y });
            this.resetRect(point, true);
            this.onFirstDrawComplete(e);
            this.setEditMode(false);
          }
          this.onDraw();
        }
      },
      resetRect(point, set_origin) {
        this.rect.left = Math.min(point.x, this.rect.left);
        this.rect.right = Math.max(point.x, this.rect.right);
        this.rect.top = Math.min(point.y, this.rect.top);
        this.rect.bottom = Math.max(point.y, this.rect.bottom);
        this.rect.x = this.rect.left;
        this.rect.y = this.rect.top;
        this.rect.width = this.rect.right - this.rect.left;
        this.rect.height = this.rect.bottom - this.rect.top;
        if (set_origin) {
          this.origin_rect.left = this.rect.left;
          this.origin_rect.top = this.rect.top;
          this.origin_rect.width = this.rect.width;
          this.origin_rect.height = this.rect.height;
        }
        this.shape_data.width = this.rect.width;
        this.shape_data.height = this.rect.height;
      },
      onEditModeMove(shape_data, point, move_info) {
        const x = point.x - this.diff_point.x;
        const y = point.y - this.diff_point.y;
        const diff_left = this.diff_point.left;
        const diff_top = this.diff_point.top;

        const left = this.origin_rect.left + diff_left;
        const top = this.origin_rect.top + diff_top;
        const right = left + this.diff_point.width;
        const bottom = top + this.diff_point.height;
        const width = this.origin_rect.width;
        const height = this.origin_rect.height;
        const origin_left = this.origin_rect.left;
        const origin_top = this.origin_rect.top;

        let scale_x = this.rect.width / width;
        let scale_y = this.rect.height / height;
        let margin_x = 0;
        let margin_y = 0;

        switch (move_info) {
          case this.TOP:
            margin_y = y - top;
            scale_y = (bottom - y) / height;
            break;
          case this.LEFT:
            margin_x = x - left;
            scale_x = (right - x) / width;
            break;
          case this.RIGHT:
            scale_x = (x - left) / width;
            break;
          case this.BOTTOM:
            scale_y = (y - top) / height;
            break;
          case this.TOP_LEFT:
            margin_x = x - left;
            scale_x = (right - x) / width;
            margin_y = y - top;
            scale_y = (bottom - y) / height;
            break;
          case this.TOP_RIGHT:
            scale_x = (x - left) / width;
            margin_y = y - top;
            scale_y = (bottom - y) / height;
            break;
          case this.BOTTOM_LEFT:
            margin_x = x - left;
            scale_x = (right - x) / width;
            scale_y = (y - top) / height;
            break;
          case this.BOTTOM_RIGHT:
            scale_x = (x - left) / width;
            scale_y = (y - top) / height;
            break;
          case this.MOVE:
            margin_x = x - left;
            margin_y = y - top;
            break;
          default:
            return false;
        }

        this.rect.x = left + margin_x;
        this.rect.y = top + margin_y;
        this.rect.width = width * scale_x;
        this.rect.height = height * scale_y;

        for (let i = 0; i < this.origin_shape_data.length; i++) {
          const origin_x = this.origin_shape_data[i].x;
          const origin_y = this.origin_shape_data[i].y;
          const x = left + (origin_x - origin_left) * scale_x + margin_x;
          const y = top + (origin_y - origin_top) * scale_y + margin_y;
          this.shape_data.point_list[i].x = x;
          this.shape_data.point_list[i].y = y;
        }
        return true;
      },
      draw(shape_data) {
        if (!shape_data || !shape_data.point_list || shape_data.point_list.length < 1) {
          this.is_empty = true;
          return;
        }
        const point_list = shape_data.point_list;
        const start_point = point_list[0];
        this.ctx.beginPath();
        this.hit_ctx.beginPath();
        if (point_list.length < 2) {
          this.ctx.arc(start_point.x, start_point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
          this.ctx.closePath();
          this.ctx.fill();
          this.hit_ctx.arc(start_point.x, start_point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
          this.hit_ctx.closePath();
          this.hit_ctx.fill();
          return;
        }
        this.ctx.moveTo(start_point.x, start_point.y);
        this.hit_ctx.moveTo(start_point.x, start_point.y);
        let x = 0;
        let y = 0;
        for (let i = 1; i < point_list.length - 1; i++) {
          x = (point_list[i].x + point_list[i + 1].x) / 2;
          y = (point_list[i].y + point_list[i + 1].y) / 2;
          this.ctx.quadraticCurveTo(point_list[i].x, point_list[i].y, x, y);
          this.hit_ctx.quadraticCurveTo(point_list[i].x, point_list[i].y, x, y);
        }
        this.ctx.stroke();
        this.hit_ctx.stroke();
        if (this.isEditMode()) {
          this.drawEditRect(true, this.rect);
        }
        this.is_empty = false;
      },
      onRestoreData() {
        if (!this.shape_data || !this.shape_data.point_list || this.shape_data.point_list.length < 1) {
          this.has_shape = false;
          return;
        }
        const point_list = this.shape_data.point_list;
        this.initRect(point_list[0]);
        for (let i = 1; i < point_list.length; i++) {
          const point = point_list[i];
          this.origin_shape_data.push({ x: point.x, y: point.y });
          this.resetRect(point, true);
        }
        this.has_shape = true;
      },
      setCopyShapePosition(shape, gap) {
        if (shape && shape.point_list) {
          for (let i = 0; i < shape.point_list.length; i++) {
            const point = shape.point_list[i];
            if (point) {
              point.x += gap;
              point.y += gap;
            }
          }
        }
      },
    },
  };
</script>

<style scoped>
</style>
