import * as Constant from '../../../constants';
import util from '../../../utils/util';

export default {
  name: 'AnnotationDrawPen',
  props: ['shape_info', 'options', 'selected_id', 'index'],
  data() {
    return {
      ...Constant,
      type: null,
      size: 10,
      scale: 1,
      width: 1920,
      height: 1080,
      is_check: false,
      canvas: null,
      ctx: null,
      use_hit_box: true,
      hit_canvas: null,
      hit_ctx: null,
      shape_data: null,
      color: {
        color_id: 1,
        red: 255,
        green: 0,
        blue: 0,
      },
      alpha: 1,
      mode: Constant.MODE_DRAW,
      is_draw_start: false,
      last_pulling_time: 0,
      pulling_delay: 25,
      use_edit_mode: false,
      offsetX: 0,
      offsetY: 0,
      radius: 5,
      min_radius: 5,
      hit_check_margin: 5,
      diff_point: null,
      move_info: null,
      is_active: false,
      is_empty: true,
      id: util.getRandomId(),
      min_width: 100,
      min_height: 100,
      has_shape: false,
    };
  },
  mounted() {
    this.onBeforeInit();
    this.init();
  },
  beforeDestroy() {
    this.onBeforeDestroy();
    this.setDrawStartEvent(false);
    this.setDrawEvent(false);
    this.setCursorEvent(false);
  },
  computed: {
    c_shape_id() {
      if (!this.shape_info || !this.shape_info.id) return null;
      return this.shape_info.id;
    },
    c_is_selected() {
      return this.c_shape_id === this.selected_id;
    },
    c_draw_option() {
      return {
        color: this.color,
        alpha: this.alpha,
        size: this.size,
        type: this.type,
      };
    },
  },
  watch: {
  },
  methods: {
    isDrawShape() {
      return this.has_shape || this.isEditMode();
    },
    onBeforeInit() {
    },
    onBeforeDestroy() {
    },
    init() {
      this.type = this.shape_info.type;
      if (!this.shape_info.shape) {
        this.onColorChange(this.options);
        this.onAlphaChange(this.options);
        this.onSizeChange(this.options);
      }
      this.onResize(this.options);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.width = this.width;
      this.ctx.height = this.height;

      if (this.use_hit_box) {
        this.hit_ctx = this.hit_canvas.getContext('2d');
        this.hit_ctx.lineJoin = 'round';
        this.hit_ctx.lineCap = 'round';
        this.hit_ctx.width = this.width;
        this.hit_ctx.height = this.height;
        this.hit_ctx.fillStyle = '#000000';
        this.hit_ctx.strokeStyle = '#000000';
      }

      this.onModeChange(this.MODE_DRAW);
      this.onRestore(this.shape_info);
      this.$nextTick()
        .then(() => {
          this.$emit('onInitComplete', this.shape_info, this);
        });
    },
    setActive(is_active) {
      this.applyDrawOptions();
      this.onActive(is_active);
      this.setDrawStartEvent(is_active);
      this.is_active = is_active;
      this.onDraw();
      if (!this.is_active) {
        this.is_draw_start = false;
        if (this.canvas) this.canvas.style.cursor = 'default';
      } else {
        if (this.shape_info.is_force_start === true) {
          this.onMouseDown(this.shape_info.event);
        }
        delete this.shape_info.is_force_start;
        delete this.shape_info.event;
      }
    },
    isActive() {
      return this.is_active;
    },
    onActive(is_active) {
      if (is_active) {
        this.setEditMode(!util.isEmpty(this.shape_info.shape));
      } else {
        this.setEditMode(false);
      }
    },
    setDrawStartEvent(is_add = true) {
      if (is_add) {
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('touchstart', this.onMouseDown);
      } else {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('touchstart', this.onMouseDown);
      }
    },
    setDrawEvent(is_add = false) {
      if (is_add) {
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('mouseup', this.onMouseUp, false);

        document.addEventListener('touchmove', this.onMouseMove, { passive: false });
        document.addEventListener('touchend', this.onMouseUp, false);
      } else {
        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        document.removeEventListener('touchmove', this.onMouseMove, false);
        document.removeEventListener('touchend', this.onMouseUp, false);
      }
    },
    setCursorEvent(is_add = false) {
      if (is_add) {
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('touchmove', this.onMouseMove, false);
      } else {
        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
        this.canvas.removeEventListener('touchmove', this.onMouseMove, false);
      }
    },
    ablePulling() {
      const timestamp = Date.now();
      const diff = timestamp - this.last_pulling_time;
      if (diff >= this.pulling_delay) {
        this.last_pulling_time = timestamp;
        return true;
      }
      return false;
    },
    isTouchEvent(e) {
      return e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend';
    },
    getMousePoint(e) {
      let x = 0;
      let y = 0;
      if (this.isTouchEvent(e)) {
        let _offsetX = this.offsetX;
        let _offsetY = this.offsetY;
        if (e.changedTouches[0].target) {
          _offsetX = e.changedTouches[0].target.getClientRects()[0].x + e.view.pageXOffset;
          _offsetY = e.changedTouches[0].target.getClientRects()[0].y + e.view.pageYOffset;
        }
        x = Math.round((e.changedTouches[0].pageX - _offsetX) / this.scale);
        y = Math.round((e.changedTouches[0].pageY - _offsetY) / this.scale);
      } else {
        x = Math.round((e.pageX - this.offsetX) / this.scale);
        y = Math.round((e.pageY - this.offsetY) / this.scale);
      }
      return { x, y };
    },
    getShapeData(e) {
      throw new Error('must implement getShapeData method');
    },
    getBaseData(shape_data) {
      return {
        draw_mode: this.mode,
        color: this.color,
        alpha: this.alpha,
        size: this.size,
        data: shape_data,
      };
    },
    onResize(options) {
      this.scale = options.scale;
      this.width = options.width;
      this.height = options.height;
      this.offsetX = options.offsetX;
      this.offsetY = options.offsetY;
    },
    onColorChange(options, re_draw = false) {
      const color_info = options.color;
      this.color.color_id = color_info.color_id;
      this.color.red = color_info.red;
      this.color.green = color_info.green;
      this.color.blue = color_info.blue;
      if (re_draw) {
        this.applyDrawOptions();
        this.onDraw();
      }
    },
    onSizeChange(options, re_draw = false) {
      this.size = options.size;
      this.setRadius();
      if (re_draw) {
        this.applyDrawOptions();
        this.onDraw();
      }
    },
    onAlphaChange(options, re_draw = false) {
      this.alpha = options.alpha;
      if (re_draw) {
        this.applyDrawOptions();
        this.onDraw();
      }
    },
    applyDrawOptions() {
      const color = this.getColor(this.color, this.alpha);
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this.size;
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      if (this.use_hit_box) {
        let hit_size = Math.min(Math.ceil(this.size * 3), 30);
        hit_size = Math.max(hit_size, this.size);
        this.hit_ctx.lineJoin = 'round';
        this.hit_ctx.lineCap = 'round';
        this.hit_ctx.lineWidth = hit_size;
      }
      if (this.shape_info.shape) {
        this.shape_info.shape.size = this.size;
        this.shape_info.shape.alpha = this.alpha;
        if (this.shape_info.shape.color) {
          this.shape_info.shape.color.color_id = this.color.color_id;
          this.shape_info.shape.color.red = this.color.red;
          this.shape_info.shape.color.green = this.color.green;
          this.shape_info.shape.color.blue = this.color.blue;
        }
      }
    },
    onMouseDown(e) {
      if (this.is_check) return;
      if (e.which !== 1 && e.type === 'mousedown') return;

      const point = this.getMousePoint(e);
      // this.$log.debug(this.$options.name, e, point);
      if (this.isEditMode()) {
        if (!this.shape_data) return;
        this.move_info = this.getMoveInfo(point);
        if (!this.move_info) {
          this.setActive(false);
          this.$emit('onEditCancel', this.shape_info, point, e);
          return;
        }
        this.canvas.style.cursor = this.move_info.cursor;
      } else {
        this.shape_data = this.getShapeData(e);
        this.setShapeInfo(this.shape_data);
        this.has_shape = true;
      }
      this.applyDrawOptions();
      this.onDraw();
      this.setDrawEvent(true);
      this.is_draw_start = true;
      this.onDrawStart();
      this.$emit('onDrawStart');
    },
    onDrawStart() {},
    onDrawEnd() {
      this.$emit('onDrawEnd');
    },
    getMoveInfo(point) {
      const move_info = this.getTransformMode(point);
      if (move_info) {
        this.diff_point = {
          x: point.x - move_info.x,
          y: point.y - move_info.y,
        };
        return move_info;
      }
      return null;
    },
    onMouseMove(e) {
      throw new Error('must implement onMouseMove method');
    },
    onMouseUp(e) {
      throw new Error('must implement onMouseMove method');
    },
    setShapeInfo(shape_data) {
      this.shape_info.shape = this.getBaseData(shape_data);
    },
    clearScreen() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (this.use_hit_box) {
        this.hit_ctx.clearRect(0, 0, this.width, this.height);
      }
    },
    clearData() {
      this.clearScreen();
      this.shape_info.data = null;
      this.shape_data = null;
    },
    onDraw() {
      if (this.mode !== this.MODE_ERASER) {
        this.clearScreen();
      }
      this.draw(this.shape_data);
    },
    draw(shape_data) {
      throw new Error('must implement draw method');
    },
    drawEditRect(draw_line = false, rect_info = null, draw_move_point = true) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#aaaaaa';
      if (draw_line) {
        this.ctx.lineWidth = 4;
        this.drawRect(rect_info, true, null);
      }

      if (draw_move_point) {
        this.ctx.lineWidth = 1;
        this.drawMovePoint(this.getPositionPoint(this.TOP_LEFT, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.TOP, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.TOP_RIGHT, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.RIGHT, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.BOTTOM_RIGHT, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.BOTTOM, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.BOTTOM_LEFT, rect_info));
        this.drawMovePoint(this.getPositionPoint(this.LEFT, rect_info));
      }
      this.applyDrawOptions();
    },
    drawRect(rect_info = null, line_dash = false, context = null, padding = 0) {
      if (!context) context = this.ctx;
      if (line_dash) context.setLineDash([5, 15]);

      if (!rect_info) rect_info = this.shape_data;
      let left_margin = padding;
      let top_margin = padding;
      if (rect_info.width < 0) left_margin = -left_margin;
      if (rect_info.height < 0) top_margin = -top_margin;
      const top_left_point = this.getPositionPoint(this.TOP_LEFT, rect_info);
      context.beginPath();
      context.moveTo(top_left_point.x + left_margin, top_left_point.y + top_margin);
      this.drawLine(this.getPositionPoint(this.TOP_RIGHT, rect_info), context, -left_margin, top_margin);
      this.drawLine(this.getPositionPoint(this.BOTTOM_RIGHT, rect_info), context, -left_margin, -top_margin);
      this.drawLine(this.getPositionPoint(this.BOTTOM_LEFT, rect_info), context, left_margin, -top_margin);
      this.drawLine(top_left_point, context, left_margin, top_margin);
      context.stroke();
      context.closePath();
      if (line_dash) context.setLineDash([]);
    },
    drawMovePoint(target_point) {
      this.ctx.beginPath();
      this.ctx.arc(target_point.x, target_point.y, this.radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    },
    drawLine(target_point, context = null, left_margin = 0, top_margin = 0) {
      if (!context) context = this.ctx;
      context.lineTo(target_point.x + left_margin, target_point.y + top_margin);
    },
    onEditModeMove(rect_info, point, move_info) {
      const end_x = rect_info.x + rect_info.width;
      const end_y = rect_info.y + rect_info.height;
      const x = point.x - this.diff_point.x;
      const y = point.y - this.diff_point.y;
      switch (move_info) {
        case this.TOP:
          rect_info.y = y;
          rect_info.height = end_y - rect_info.y;
          break;
        case this.LEFT:
          rect_info.x = x;
          rect_info.width = end_x - rect_info.x;
          break;
        case this.RIGHT:
          rect_info.width = x - rect_info.x;
          break;
        case this.BOTTOM:
          rect_info.height = y - rect_info.y;
          break;
        case this.TOP_LEFT:
          rect_info.x = x;
          rect_info.width = end_x - rect_info.x;
          rect_info.y = y;
          rect_info.height = end_y - rect_info.y;
          break;
        case this.TOP_RIGHT:
          rect_info.width = x - rect_info.x;
          rect_info.y = y;
          rect_info.height = end_y - rect_info.y;
          break;
        case this.BOTTOM_LEFT:
          rect_info.x = x;
          rect_info.width = end_x - rect_info.x;
          rect_info.height = y - rect_info.y;
          break;
        case this.BOTTOM_RIGHT:
          rect_info.width = x - rect_info.x;
          rect_info.height = y - rect_info.y;
          break;
        case this.MOVE:
          rect_info.x = x;
          rect_info.y = y;
          break;
        default:
          return false;
      }
      return true;
    },
    onModeChange(mode, change_mode = true) {
      if (mode === this.MODE_ERASER) {
        this.ctx.globalCompositeOperation = 'destination-out';
        if (this.use_hit_box) {
          this.hit_ctx.globalCompositeOperation = 'destination-out';
        }
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        if (this.use_hit_box) {
          this.hit_ctx.globalCompositeOperation = 'source-over';
        }
      }
      if (change_mode) {
        this.mode = mode;
      }
    },
    onRestore(shape_info = null) {
      if (!shape_info || !shape_info.shape) {
        return;
      }
      const shape = shape_info.shape;
      this.shape_data = shape.data;
      this.onColorChange(shape);
      this.onSizeChange(shape);
      this.onAlphaChange(shape);
      this.applyDrawOptions();
      this.onRestoreData();
      this.onModeChange(this.MODE_DRAW);
      this.has_shape = true;
    },
    onRestoreData() {},
    getColor(color, alpha) {
      return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
    },
    setRadius() {
      // this.radius = Math.max(Math.round(this.size * 0.8), this.min_radius);
      this.radius = 8;
    },
    isHitMovePoint(mouse_point, target_point) {
      return Math.sqrt((mouse_point.x - target_point.x) ** 2 + (mouse_point.y - target_point.y) ** 2) <= this.radius + this.hit_check_margin;
    },
    isShapeHit(point) {
      let pixel = null;
      if (this.use_hit_box) {
        pixel = this.hit_ctx.getImageData(point.x, point.y, 1, 1).data;
      } else {
        pixel = this.ctx.getImageData(point.x, point.y, 1, 1).data;
      }
      return pixel && pixel[3] !== 0;
    },
    getTransformMode(point, rect_info = null) {
      const result = { type: null, cursor: 'default', x: 0, y: 0 };
      let position_point = null;
      if (!rect_info) rect_info = this.shape_data;
      const reverse_x = rect_info.width < 0;
      const reverse_y = rect_info.height < 0;
      let type = null;
      let vertical = null;
      let horizon = null;
      let cursor = null;
      if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.TOP, rect_info)))) {
        type = this.TOP;
        vertical = reverse_y ? 's' : 'n';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.LEFT, rect_info)))) {
        type = this.LEFT;
        horizon = reverse_x ? 'e' : 'w';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.RIGHT, rect_info)))) {
        type = this.RIGHT;
        horizon = reverse_x ? 'w' : 'e';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.BOTTOM, rect_info)))) {
        type = this.BOTTOM;
        vertical = reverse_y ? 'n' : 's';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.TOP_LEFT, rect_info)))) {
        type = this.TOP_LEFT;
        horizon = reverse_x ? 'e' : 'w';
        vertical = reverse_y ? 's' : 'n';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.TOP_RIGHT, rect_info)))) {
        type = this.TOP_RIGHT;
        horizon = reverse_x ? 'w' : 'e';
        vertical = reverse_y ? 's' : 'n';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.BOTTOM_LEFT, rect_info)))) {
        type = this.BOTTOM_LEFT;
        horizon = reverse_x ? 'e' : 'w';
        vertical = reverse_y ? 'n' : 's';
      } else if (this.isHitMovePoint(point, (position_point = this.getPositionPoint(this.BOTTOM_RIGHT, rect_info)))) {
        type = this.BOTTOM_RIGHT;
        horizon = reverse_x ? 'w' : 'e';
        vertical = reverse_y ? 'n' : 's';
      } else if (this.isShapeHit(point)) {
        type = this.MOVE;
        cursor = 'move';
        position_point = this.getPositionPoint(this.TOP_LEFT, rect_info);
      } else {
        return false;
      }
      if (!cursor) {
        let prefix = '';
        if (vertical) {
          prefix = `${vertical}`;
        }
        if (horizon) {
          prefix = `${prefix}${horizon}`;
        }
        cursor = `${prefix}-resize`;
      }
      result.type = type;
      result.cursor = cursor;
      result.x = position_point.x;
      result.y = position_point.y;
      return result;
    },
    getPositionPoint(type, rect_info) {
      const point = {
        x: 0,
        y: 0,
      };
      if (!rect_info) rect_info = this.shape_data;
      switch (type) {
        case this.TOP:
          point.x = rect_info.x + rect_info.width / 2;
          point.y = rect_info.y;
          break;
        case this.LEFT:
          point.x = rect_info.x;
          point.y = rect_info.y + rect_info.height / 2;
          break;
        case this.RIGHT:
          point.x = rect_info.x + rect_info.width;
          point.y = rect_info.y + rect_info.height / 2;
          break;
        case this.BOTTOM:
          point.x = rect_info.x + rect_info.width / 2;
          point.y = rect_info.y + rect_info.height;
          break;
        case this.TOP_LEFT:
          point.x = rect_info.x;
          point.y = rect_info.y;
          break;
        case this.TOP_RIGHT:
          point.x = rect_info.x + rect_info.width;
          point.y = rect_info.y;
          break;
        case this.BOTTOM_LEFT:
          point.x = rect_info.x;
          point.y = rect_info.y + rect_info.height;
          break;
        case this.BOTTOM_RIGHT:
          point.x = rect_info.x + rect_info.width;
          point.y = rect_info.y + rect_info.height;
          break;
        default:
          return null;
      }
      return point;
    },
    isEditMode() {
      return this.mode === this.MODE_EDIT;
    },
    setEditMode(is_edit_mode) {
      if (is_edit_mode === (this.mode === this.MODE_EDIT)) return;
      this.mode = is_edit_mode ? this.MODE_EDIT : this.MODE_DRAW;
      this.setCursorEvent(is_edit_mode);
    },
    getShapeInfo() {
      return this.shape_info;
    },
    getCopyShapeInfo() {
      return JSON.stringify(this.shape_info);
    },
    isEmpty() {
      return this.is_empty;
    },
    getCurrentOptions() {
      return this.c_draw_option;
    },
    onFirstDrawComplete(event) {
      this.$emit('onFirstDrawComplete', this.shape_info, event, this.is_draw, this.shape_info._id, this.index);
    },
  },
};
