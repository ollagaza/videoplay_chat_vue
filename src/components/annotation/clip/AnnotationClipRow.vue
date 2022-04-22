<template>
  <div class="row_clip" v-bind:class="{ edit: is_edit_mode, selected: c_is_selected, is_on: c_is_on }" v-bind:style="{ width: c_width }" v-on:click="onClipClick()">
    <template v-if="c_is_show_arrow">
      <div class="arrow"></div>
    </template>
    <template v-if="c_is_show_checkbox">
      <div class="check_box" v-on:click.stop="onCheckboxClick()" v-bind:class="{ on: clip_info.is_checked }"></div>
    </template>
    <div class="thumbnail">
      <img :src="clip_info.thumbnail_url">
      <div class="thumbnail_over_border"></div>
    </div>
    <div class="information">
      <div class="row time">
        <template v-if="is_edit_mode !== true">
          <template v-if="c_is_file_clip">
            <div class="flex">
              <div class="time_text ellipsis bold" v-bind:title="c_file_name" v-bind:style="{ color: c_file_name_color }">{{ c_file_name }}</div>
              <div class="time_text ellipsis" v-bind:title="c_file_path">{{ c_file_path }}</div>
            </div>
          </template>
          <template v-else>
            <div class="time_text">{{ c_start_time }}<template v-if="!c_is_shape"> ~ {{ c_end_time }}</template></div>
          </template>
          <div v-bind:style="{ color: c_name_color }">{{ c_user_name }}</div>
        </template>
        <template v-else>
          <template v-if="c_is_file_clip">
            <div class="time_text flex ellipsis">{{ c_file_path }}</div>
          </template>
          <template v-else>
            <div class="input_wrapper">
              <input type="text" v-model="modify_clip_start_hour" maxlength="2"
                     v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event, 24)" v-on:focusout="onNumberFocusOut($event, 24)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
            </div>
            <span>시</span>
            <div class="input_wrapper">
              <input type="text" v-model="modify_clip_start_minute" maxlength="2"
                     v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event)" v-on:focusout="onNumberFocusOut($event)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
            </div>
            <span>분</span>
            <div class="input_wrapper">
              <input type="text" v-model="modify_clip_start_second" maxlength="2"
                     v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event)" v-on:focusout="onNumberFocusOut($event)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
            </div>
            <span>초</span>
            <template v-if="!c_is_shape">
              <span>~</span>
              <div class="input_wrapper">
                <input type="text" v-model="modify_clip_end_hour" maxlength="2"
                       v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event, 24)" v-on:focusout="onNumberFocusOut($event, 24)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
              </div>
              <span>시</span>
              <div class="input_wrapper">
                <input type="text" v-model="modify_clip_end_minute" maxlength="2"
                       v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event)" v-on:focusout="onNumberFocusOut($event)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
              </div>
              <span>분</span>
              <div class="input_wrapper">
                <input type="text" v-model="modify_clip_end_second" maxlength="2"
                       v-on:keydown="onNumberKeyDown($event)" v-on:keyup="onNumberKeyUp($event)" v-on:focusout="onNumberFocusOut($event)" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)" >
              </div>
              <span>초</span>
            </template>
          </template>
        </template>
      </div>
      <div class="row annotation">
        <template v-if="is_edit_mode !== true">
          <div class="text">{{ clip_info.desc }}</div>
        </template>
        <template v-else>
          <div class="input_wrapper"><input type="text" v-model="modify_clip_text" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)"></div>
        </template>
      </div>
    </div>
    <div class="text_btn_wrapper">
      <template v-if="!c_is_view_mode">
        <template v-if="is_edit_mode !== true">
          <div class="text_btn_row">
            <template v-if="c_is_editable">
              <template v-if="enable_unset">
                <div class="text_btn" v-on:click.stop="onUnSetPhaseClick()">빼기</div>
                <div class="bar"></div>
              </template>
              <div class="text_btn" v-on:click.stop="onClipModifyClick()">수정</div>
              <div class="bar"></div>
              <div class="text_btn" v-on:click.stop="onClipDeleteClick()">삭제</div>
            </template>
          </div>
          <div class="text_btn" v-on:click.stop="onClipReplyClick()">댓글<template v-if="c_comment_count">(<span class="num">{{ c_comment_count }}</span>)</template></div>
        </template>
        <template v-else>
          <div style="display: flex; flex-direction: row; align-items: center;">
            <div class="text_btn" v-on:click.stop="onClipSaveClick()">저장</div>
            <div class="bar"></div>
            <div class="text_btn" v-on:click.stop="onClipModifyCancelClick()">취소</div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import util from '../../../utils/util';
  import * as Constants from '../../../constants';
  import BaseMixin from '../../../components/Mixins/BaseMixin';

  export default {
    name: 'AnnotationClipRow',
    mixins: [BaseMixin],
    props: ['media_info', 'clip_info', 'index', 'phase_info', 'enable_unset', 'selected_clip_id', 'mode', 'current_time', 'type', 'id', 'annotation_user_map', 'is_creatable_phase', 'width', 'type_map', 'is_annotation_search'],
    data() {
      return {
        is_edit_mode: false,
        modify_clip_text: '',
        modify_clip_start_time: 0,
        modify_clip_end_time: 0,
        modify_clip_start_hour: '00',
        modify_clip_start_minute: '00',
        modify_clip_start_second: '00',
        modify_clip_end_hour: '00',
        modify_clip_end_minute: '00',
        modify_clip_end_second: '00',
        is_on: false,
      };
    },
    created() {
    },
    computed: {
      ...mapGetters(['member_seq', 'group_seq']),
      c_is_show_arrow() {
        return !this.is_annotation_search && this.clip_info.phase_id;
      },
      c_is_show_checkbox() {
        if (this.is_annotation_search) {
          return false;
        }
        if (this.c_is_view_mode) {
          return false;
        }
        if (this.clip_info.phase_id) {
          return false;
        }
        return this.is_creatable_phase;
      },
      c_width() {
        if (!this.width) {
          return null;
        }
        return `${this.width}px`;
      },
      c_is_file_clip() {
        return this.clip_info.type === Constants.MODE_FILE;
      },
      c_file_name() {
        if (this.clip_info.file_info) {
          return this.clip_info.file_info.file_name;
        }
        return this.clip_info.file_name;
      },
      c_file_path() {
        if (this.clip_info.file_info) {
          return this.clip_info.file_info.directory;
        }
        return this.clip_info.directory;
      },
      c_file_type() {
        if (this.clip_info.file_info && this.clip_info.file_info.type) {
          if (this.type_map && this.type_map[this.clip_info.file_info.type]) {
            return this.clip_info.file_info.type;
          }
        }
        return null;
      },
      c_file_name_color() {
        if (!this.type_map || !this.c_file_type) return null;
        return this.type_map[this.c_file_type].color;
      },
      c_is_view_mode() {
        return this.mode === Constants.VIEW;
      },
      c_start_time() {
        return util.formatSecToTime(this.clip_info.start_time);
      },
      c_end_time() {
        return util.formatSecToTime(this.clip_info.end_time);
      },
      c_user_name() {
        return this.clip_info.user_name;
      },
      c_is_selected() {
        if (this.is_edit_mode) {
          return false;
        }
        const is_selected = this.selected_clip_id === this.clip_info._id;
        if (is_selected) {
          this.$emit('onClipRowSelected', this, this.clip_info);
        }
        return is_selected;
      },
      c_is_on() {
        if (!this.clip_info || (this.current_time !== 0 && !this.current_time)) {
          return false;
        }
        const is_on = this.current_time >= this.clip_info.start_time && this.current_time < this.clip_info.end_time;
        if (is_on && this.is_on !== is_on) {
          this.$emit('onClipOn', this.id);
        }
        this.is_on = is_on;
        return is_on;
      },
      c_is_editable() {
        if (this.c_is_view_mode) return false;
        if (!this.clip_info) return false;
        const group_seq = this.clip_info.group_seq;
        const member_seq = this.clip_info.member_seq;
        if (group_seq !== this.group_seq) return false;
        if (this.is_group_admin) return true;
        return member_seq === this.member_seq;
      },
      c_name_color() {
        if (this.annotation_user_map && this.annotation_user_map[this.clip_info.member_seq]) {
          return this.annotation_user_map[this.clip_info.member_seq].color;
        }
        return null;
      },
      c_comment_count() {
        if (!this.clip_info) return null;
        if (!this.clip_info.comment_count || this.clip_info.comment_count <= 0) return null;
        return util.numberFormat(this.clip_info.comment_count);
      },
      c_is_shape() {
        return this.clip_info && this.clip_info.is_shape;
      },
    },
    watch: {
      current_time(changed_time) {
        if (this.is_edit_mode && this.c_is_shape) {
          this.modify_clip_start_time = changed_time;
          this.modify_clip_end_time = changed_time;
          this.setModifyTime();
        }
      },
    },
    mounted() {
      this.$emit('onClipRowMounted', this, this.clip_info);
    },
    methods: {
      clearEditorMode() {
        this.is_edit_mode = false;
        this.modify_clip_text = '';
        this.modify_clip_start_time = 0;
        this.modify_clip_end_time = 0;
        this.modify_clip_start_hour = '00';
        this.modify_clip_start_minute = '00';
        this.modify_clip_start_second = '00';
        this.modify_clip_end_hour = '00';
        this.modify_clip_end_minute = '00';
        this.modify_clip_end_second = '00';
      },
      save() {
        this.onClipSaveClick();
      },
      cancel() {
        this.onClipModifyCancelClick();
      },
      onFocus(focus) {
        this.$emit('onClipEditorFocus', focus);
      },
      onClipClick() {
        if (this.is_edit_mode) return;
        this.$emit('onClipClick', this, this.clip_info);
      },
      onClipModifyClick() {
        this.is_edit_mode = true;
        if (!this.c_is_file_clip) {
          const new_range = {
            start_time: this.clip_info.start_time,
            end_time: this.clip_info.end_time,
          };
          this.setRangeInfo(new_range);
          this.modify_clip_start_time = this.clip_info.start_time;
          this.modify_clip_end_time = this.clip_info.end_time;
          this.setModifyTime();
        }
        this.modify_clip_text = this.clip_info.desc;
        this.$emit('onClipModifyClick', this, this.clip_info, this.index);
      },
      onClipDeleteClick() {
        this.$emit('onClipDeleteClick', this.clip_info, this.phase_info, this.index);
      },
      onClipReplyClick() {
        this.$emit('onClipReplyClick', this.clip_info);
      },
      onClipSaveClick() {
        const modify_info = {};
        modify_info.desc = this.modify_clip_text;
        if (!this.c_is_file_clip) {
          modify_info.start_time = this.modifyTimeToSec();
          modify_info.end_time = this.modifyTimeToSec(true);
        }
        this.$emit('onClipSaveClick', this.clip_info, modify_info, this.index);
      },
      onClipModifyCancelClick() {
        this.$log.debug(this.$options.name);
        this.clearEditorMode();
        this.$emit('onClipModifyCancelClick', this, this.clip_info);
      },
      onRangeChange(range) {
        if (!this.is_edit_mode) {
          return;
        }
        if (this.modify_clip_start_time === range.start_time && this.modify_clip_start_time === range.endTime) {
          return;
        }
        this.modify_clip_start_time = range.startTime;
        this.modify_clip_end_time = range.endTime;
        this.setModifyTime();
      },
      onChangeModifyRange() {
        if (this.c_is_file_clip) {
          return;
        }
        const max_time = this.media_info.total_time;
        let is_invalid_range = false;
        let new_start_time = this.modifyTimeToSec();
        let new_end_time = this.modifyTimeToSec(true);
        if (new_start_time < 0) new_start_time = 0;

        if (this.c_is_shape) {
          if (new_start_time > max_time) new_start_time = max_time;
          new_end_time = new_start_time;
        } else {
          if (this.modify_clip_start_time === new_start_time && this.modify_clip_start_time === new_end_time) {
            return;
          }
          if (new_end_time > max_time) {
            new_end_time = max_time;
            is_invalid_range = true;
          }
          if (new_start_time > new_end_time) {
            new_start_time = new_end_time;
            is_invalid_range = true;
          }
        }

        this.modify_clip_start_time = new_start_time;
        this.modify_clip_end_time = new_end_time;
        const new_range = {
          start_time: this.modify_clip_start_time,
          end_time: this.modify_clip_end_time,
        };
        if (is_invalid_range) {
          this.setModifyTime();
        }
        this.setRangeInfo(new_range);
      },
      onUnSetPhaseClick() {
        this.$emit('onUnSetPhaseClick', this.clip_info, this.phase_info, this.index);
      },
      setModifyTime() {
        const start_time_arr = util.formatSecToTime(this.modify_clip_start_time).split(':');
        const end_time_arr = util.formatSecToTime(this.modify_clip_end_time).split(':');
        this.modify_clip_start_hour = start_time_arr[0];
        this.modify_clip_start_minute = start_time_arr[1];
        this.modify_clip_start_second = start_time_arr[2];
        this.modify_clip_end_hour = end_time_arr[0];
        this.modify_clip_end_minute = end_time_arr[1];
        this.modify_clip_end_second = end_time_arr[2];
      },
      onNumberKeyDown($event) {
        const keyCode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keyCode === 0 || keyCode === 8 || keyCode === 46 || keyCode === 9) {
          if (typeof $event.stopPropagation !== 'undefined') {
            $event.stopPropagation();
          } else {
            $event.cancelBubble = true;
          }
          return;
        }
        if (keyCode < 48 || (keyCode > 57 && keyCode < 96) || keyCode > 105 || $event.shiftKey) {
          if ($event.preventDefault) {
            $event.preventDefault();
          } else {
            $event.returnValue = false;
          }
        }
      },
      onNumberKeyUp($event, limit = 60) {
        const keyCode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keyCode === 8 || keyCode === 46 || keyCode === 37 || keyCode === 39) {
          return;
        }
        const number = $event.target.value.replace(/[^0-9]/g, '');
        $event.target.value = number > limit ? limit : number;
        if (keyCode === 13) {
          this.onChangeModifyRange();
        }
      },
      onNumberFocusOut($event, limit = 60) {
        const number = $event.target.value.replace(/[^0-9]/g, '');
        $event.target.value = number > limit ? limit : number;
        this.onChangeModifyRange();
      },
      onCheckboxClick() {
        this.clip_info.is_checked = !this.clip_info.is_checked;
      },
      setEditMode() {
        this.onClipModifyClick();
      },
      setRangeInfo(new_range) {
        this.$emit('setRangeInfo', new_range);
      },
      modifyTimeToSec(is_end = false) {
        if (is_end) {
          return parseInt(this.modify_clip_end_hour, 10) * 3600 + parseInt(this.modify_clip_end_minute, 10) * 60 + parseInt(this.modify_clip_end_second, 10);
        }
        return parseInt(this.modify_clip_start_hour, 10) * 3600 + parseInt(this.modify_clip_start_minute, 10) * 60 + parseInt(this.modify_clip_start_second, 10);
      },
      isOn() {
        return this.c_is_on;
      },
    },
  };
</script>

<style scoped>

</style>
