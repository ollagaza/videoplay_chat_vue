<template>
  <div class="curation_annotation_list" ref="annotation_list">
    <template v-for="clip_info in clip_list">
      <template v-if="clip_info.is_phase">
        <template v-if="clip_info.child_list.length >= 1">
          <AnnotationPhaseRow
            ref="annotations"
            v-bind:phase_info="clip_info"
            v-bind:index="clip_info._id"
            v-bind:has_checked_clip="has_checked_clip"
            v-bind:type="PHASE"
            v-bind:id="clip_info._id"
            v-bind:item="clip_info"
            v-bind:key="clip_info._id"
            v-bind:selected_clip_id="selected_clip_id"
            v-bind:mode="mode"
            v-bind:current_time="current_time"
            v-bind:width="width"
            v-bind:is_annotation_search="is_annotation_search"
            v-on:onPhaseClick="onPhaseClick"
            v-on:onPhaseModifyClick="onPhaseModifyClick"
            v-on:onPhaseDeleteClick="onPhaseDeleteClick"
            v-on:onPhaseSaveClick="onPhaseSaveClick"
            v-on:onPhaseModifyCancelClick="onPhaseModifyCancelClick"
            v-on:onSetPhaseClick="onSetPhaseClick"
            v-on:onClipRowSelected="onClipRowSelected"
            v-on:onClipEditorFocus="onClipEditorFocus"
          ></AnnotationPhaseRow>
          <template v-for="(child_clip_info, index) in clip_info.child_list">
            <AnnotationClipRow
              ref="annotations"
              v-bind:media_info="operation_info.media_info"
              v-bind:clip_info="child_clip_info"
              v-bind:index="child_clip_info._id"
              v-bind:phase_info="clip_info"
              v-bind:enable_unset="index === 0 || index === clip_info.child_list.length - 1"
              v-bind:selected_clip_id="selected_clip_id"
              v-bind:mode="mode"
              v-bind:current_time="current_time"
              v-bind:item="child_clip_info"
              v-bind:key="child_clip_info._id"
              v-bind:type="CLIP"
              v-bind:id="child_clip_info._id"
              v-bind:annotation_user_map="annotation_user_map"
              v-bind:is_creatable_phase="is_creatable_phase"
              v-bind:width="width"
              v-bind:type_map="type_map"
              v-bind:is_annotation_search="is_annotation_search"
              v-on:onClipModifyClick="onClipModifyClick"
              v-on:onClipDeleteClick="onClipDeleteClick"
              v-on:onClipReplyClick="onClipReplyClick"
              v-on:onClipSaveClick="onClipSaveClick"
              v-on:onClipModifyCancelClick="onClipModifyCancelClick"
              v-on:onClipClick="onClipClick"
              v-on:setRangeInfo="setRangeInfo"
              v-on:onUnSetPhaseClick="onUnSetPhaseClick"
              v-on:onClipRowSelected="onClipRowSelected"
              v-on:onClipEditorFocus="onClipEditorFocus"
              v-on:onClipOn="onClipOn"
              v-on:onClipRowMounted="onClipRowMounted"
            ></AnnotationClipRow>
          </template>
        </template>
      </template>
      <template v-else>
        <AnnotationClipRow
          ref="annotations"
          v-bind:media_info="operation_info.media_info"
          v-bind:clip_info="clip_info"
          v-bind:index="clip_info._id"
          v-bind:selected_clip_id="selected_clip_id"
          v-bind:mode="mode"
          v-bind:item="clip_info"
          v-bind:key="clip_info._id"
          v-bind:current_time="current_time"
          v-bind:type="CLIP"
          v-bind:id="clip_info._id"
          v-bind:annotation_user_map="annotation_user_map"
          v-bind:is_creatable_phase="is_creatable_phase"
          v-bind:width="width"
          v-bind:type_map="type_map"
          v-bind:is_annotation_search="is_annotation_search"
          v-on:onClipModifyClick="onClipModifyClick"
          v-on:onClipDeleteClick="onClipDeleteClick"
          v-on:onClipReplyClick="onClipReplyClick"
          v-on:onClipSaveClick="onClipSaveClick"
          v-on:onClipModifyCancelClick="onClipModifyCancelClick"
          v-on:onClipClick="onClipClick"
          v-on:setRangeInfo="setRangeInfo"
          v-on:onUnSetPhaseClick="onUnSetPhaseClick"
          v-on:onClipRowSelected="onClipRowSelected"
          v-on:onClipEditorFocus="onClipEditorFocus"
          v-on:onClipOn="onClipOn"
          v-on:onClipRowMounted="onClipRowMounted"
        ></AnnotationClipRow>
      </template>
    </template>
  </div>
</template>

<script>
  import AnnotationClipRow from './AnnotationClipRow';
  import AnnotationPhaseRow from './AnnotationPhaseRow';

  export default {
    name: 'AnnotationList',
    props: ['clip_list', 'operation_info', 'has_checked_clip', 'selected_clip_id', 'mode', 'current_time', 'annotation_user_map', 'is_creatable_phase', 'width', 'type_map', 'is_annotation_search'],
    data() {
      return {
        PHASE: 'phase',
        CLIP: 'clip',
        last_key: null,
        is_modify: false,
      };
    },
    components: { AnnotationClipRow, AnnotationPhaseRow },
    computed: {
      c_height() {
        return this.$refs.annotation_list.offsetHeight;
      },
    },
    methods: {
      onClipOn(id) {
        if (this.is_modify) return;
        if (this.current_time === null) return;
        const annotation_list = this.$refs.annotations;
        let top = 0;
        for (let i = 0; i < annotation_list.length; i++) {
          const annotation = annotation_list[i];
          const height = annotation.$el.offsetHeight;
          if (annotation.id === id) {
            if (this.last_key === annotation.id) return;
            this.last_key = annotation.key;
            this.$refs.annotation_list.scrollTop = top - this.c_height / 2 + height / 2;
            return;
          }
          top += height;
        }
      },
      setRangeInfo(clip_info) {
        this.$emit('setRangeInfo', clip_info);
      },
      onClipRowMounted(clip_row, clip_info) {
        this.$emit('onClipRowMounted', clip_row, clip_info);
      },
      onClipRowSelected(clip_row, clip_info) {
        this.$emit('onClipRowSelected', clip_row, clip_info);
      },
      onClipEditorFocus(is_focus) {
        this.$emit('onClipEditorFocus', is_focus);
      },
      onClipClick(clip_row, clip_info) {
        this.$emit('onClipClick', clip_row, clip_info);
      },
      onClipModifyClick(clip_row, clip_info) {
        this.$emit('onClipModifyClick', clip_row, clip_info);
        this.is_modify = true;
      },
      onClipDeleteClick(clip_info, phase_info, index) {
        this.$emit('onClipDeleteClick', clip_info, phase_info, index);
      },
      onClipReplyClick(clip_info) {
        this.$emit('onClipReplyClick', clip_info);
      },
      onClipSaveClick(clip_info, modify_info, index) {
        this.$emit('onClipSaveClick', clip_info, modify_info, index);
        this.is_modify = false;
      },
      onClipModifyCancelClick(clip_row, clip_info) {
        this.$emit('onClipModifyCancelClick', clip_row, clip_info);
        this.is_modify = false;
      },
      onPhaseClick(phase_info, index) {
        this.$emit('onPhaseClick', phase_info, index);
      },
      onPhaseModifyClick(phase_row, phase_info, index) {
        this.$emit('onPhaseModifyClick', phase_row, phase_info, index);
        this.is_modify = true;
      },
      onPhaseDeleteClick(phase_info, index) {
        this.$emit('onPhaseDeleteClick', phase_info, index);
      },
      onPhaseSaveClick(phase_info, modify_phase_text, index) {
        this.$emit('onPhaseSaveClick', phase_info, modify_phase_text, index);
        this.is_modify = false;
      },
      onPhaseModifyCancelClick(phase_info, index) {
        this.$emit('onPhaseModifyCancelClick', phase_info, index);
        this.is_modify = false;
      },
      onSetPhaseClick(phase_info, index) {
        this.$emit('onSetPhaseClick', phase_info, index);
      },
      onUnSetPhaseClick(clip_info, phase_info, index) {
        this.$emit('onUnSetPhaseClick', clip_info, phase_info, index);
      },
    },
  };
</script>

<style scoped>

</style>
