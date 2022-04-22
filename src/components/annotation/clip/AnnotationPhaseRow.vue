<template>
  <div class="row_phase" v-bind:class="{ edit: is_edit_mode, selected: c_is_selected, is_on: c_is_on }" v-bind:style="{ width: c_width }" v-on:click.stop="onPhaseClick">
<!--  <div class="row_phase" v-bind:class="{ edit: is_edit_mode }" v-on:click.stop="onPhaseModifyClick()">-->
    <div class="arrow"></div>
    <template v-if="is_edit_mode !== true">
      <template v-if="!c_is_file_phase">
        <div class="time_text">{{ c_start_time }} ~ {{ c_end_time }}</div>
      </template>
      <div class="annotation">{{ phase_info.desc }}</div>
      <template v-if="!c_is_view_mode">
        <div class="text_btn_wrapper">
          <div class="text_btn_row">
            <div class="text_btn" v-on:click.stop="onSetPhaseClick()" v-bind:class="{ enable: has_checked_clip, disable: !has_checked_clip }">
              {{ getLang('추가') }}</div>
            <div class="bar"></div>
            <div class="text_btn" v-on:click.stop="onPhaseModifyClick()">{{ getLang('수정') }}</div>
            <div class="bar"></div>
            <div class="text_btn" v-on:click.stop="onPhaseDeleteClick()">{{ getLang('삭제') }}</div>
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="input_wrapper"><input type="text" v-model="modify_phase_text" v-on:focus="onFocus(true)" v-on:blur="onFocus(false)"></div>
      <div class="text_btn" v-on:click.stop="onPhaseSaveClick()">{{ getLang('저장') }}</div>
      <div class="bar"></div>
      <div class="text_btn" v-on:click.stop="onPhaseModifyCancelClick()">{{ getLang('취소') }}</div>
    </template>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import util from '../../../utils/util';
  import * as Constants from '../../../constants';
  import BaseMixin from '../../../components/Mixins/BaseMixin';
  import ChangeLang from './AnnotationPhaseRow.vue.lang';

  export default {
    name: 'AnnotationPhaseRow',
    mixins: [BaseMixin],
    props: ['phase_info', 'index', 'has_checked_clip', 'selected_clip_id', 'mode', 'current_time', 'type', 'id', 'width'],
    data() {
      return {
        is_edit_mode: false,
        modify_phase_text: '',
      };
    },
    created() {
      this.lang_map = ChangeLang;
    },
    computed: {
      c_width() {
        if (!this.width) {
          return null;
        }
        return `${this.width}px`;
      },
      c_is_file_phase() {
        return this.phase_info.type === 'file';
      },
      c_is_view_mode() {
        return this.mode === Constants.VIEW;
      },
      c_start_time() {
        return util.formatSecToTime(this.phase_info.start_time);
      },
      c_end_time() {
        return util.formatSecToTime(this.phase_info.end_time);
      },
      c_is_selected() {
        if (this.is_edit_mode) {
          return false;
        }

        const is_selected = this.selected_clip_id === this.phase_info._id;
        if (is_selected) {
          this.$emit('onClipRowSelected', this, this.phase_info);
        }
        return is_selected;
      },
      c_is_on() {
        if (!this.phase_info || (this.current_time !== 0 && !this.current_time)) {
          return false;
        }
        return this.current_time >= this.phase_info.start_time && this.current_time < this.phase_info.end_time;
      },
    },
    methods: {
      clearEditorMode() {
        this.is_edit_mode = false;
        this.modify_phase_text = '';
      },
      save() {
        this.onPhaseSaveClick();
      },
      onFocus(focus) {
        this.$emit('onClipEditorFocus', focus);
      },
      onPhaseClick() {
        if (this.is_edit_mode) return;
        this.$emit('onPhaseClick', this.phase_info, this.index);
      },
      onPhaseModifyClick() {
        this.$emit('onPhaseModifyClick', this, this.phase_info, this.index);
        this.is_edit_mode = true;
        this.modify_phase_text = this.phase_info.desc;
      },
      onPhaseDeleteClick() {
        this.$emit('onPhaseDeleteClick', this.phase_info, this.index);
      },
      onPhaseSaveClick() {
        this.$emit('onPhaseSaveClick', this.phase_info, this.modify_phase_text, this.index);
      },
      onPhaseModifyCancelClick() {
        this.clearEditorMode();
        this.$emit('onPhaseModifyCancelClick', this.phase_info, this.index);
      },
      setEditMode() {
        this.onPhaseModifyClick();
      },
      onSetPhaseClick() {
        if (this.has_checked_clip) {
          this.$emit('onSetPhaseClick', this.phase_info, this.index);
        }
      },
    },
  };
</script>

<style scoped>

</style>
