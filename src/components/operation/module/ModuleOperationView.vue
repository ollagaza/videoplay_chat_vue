<template>
  <div class="contents_editor_wrapper curation" v-bind:class="c_screen_mode_class_name">
    <div class="curation_contents_wrapper" ref="curation_contents_wrapper">
      <div class="curation_contents_mid" ref="content_mid" style="background-color: #fff;padding: 30px 0 0 40px;"><!-- width:1610px; -->
        <div class="center_flex_container">
          <div class="curation_player_wrapper" style="width: 100%;">
            <template v-if="c_is_disable"></template>
            <template v-else-if="c_is_process">
              <div><img src="/img/renewal/common/encoding_icon.gif" /></div>
              <div style="margin-top: 30px; font-weight: 400; font-size: 15px; color: #ffffff;">인코딩 중입니다.</div>
            </template>
            <template v-else-if="c_is_data_load_complete">
              <AnnotationToolBar v-bind:draw_event_bus="draw_event_bus" v-bind:is_editable="c_is_curation_editable"></AnnotationToolBar>
              <div class="curation_video_player">
                <VideoPlayer ref="videoPlayer"
                             v-on:onPlayerReady="onPlayerReady"
                             v-on:onCanPlay="onCanPlay"
                             v-on:onPlayBtnClick="onPlayBtnClick"
                             v-on:onCurrentTimeChange="onCurrentTimeChange"
                             v-on:onRangePlayComplete="onRangePlayComplete"
                             v-on:onRangeChange="onRangeChange"
                             v-on:onStreamSourceChange="onStreamSourceChange"
                             v-on:onFullscreenBtnClick="onFullscreenBtnClick"
                             v-on:onWideScreenBtnClick="onWideScreenBtnClick"
                ></VideoPlayer>
                <div class="addon_container" ref="addon_container" v-bind:class="{ event: is_drawer_active && !is_drawer_edit_mode }" v-on:click.stop="onDrawerClick">
                  <template><!--  v-if="show_addons" -->
                    <div class="addon" v-bind:style="c_addon_style" v-bind:class="{ active: is_drawer_active, disable_event: !is_drawer_edit_mode }">
                      <AnnotationDraw ref="annotationDraw" v-bind:draw_event_bus="draw_event_bus" v-bind:width="c_media_width" v-bind:height="c_media_height"></AnnotationDraw>
                    </div>
                  </template>
                </div>
                <div class="addon_container" ref="addon_container">
                  <div class="addon full point_cursor" v-bind:class="{ active: is_drawer_timer_active }" v-on:click.s.stop="onDrawerTimerClick">
                    <div class="timer_wrapper" v-bind:style="c_drawer_timer_style">
                      <div class="timer" v-bind:class="{ on: is_drawer_timer_active && is_drawer_timer_start }">
                        <div class="timer_bg"></div>
                        <div class="block left"><div class="time_bar"></div></div>
                        <div class="block right"><div class="time_bar"></div></div>
                        <div class="remain"><span>{{ drawer_pause_time }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <template v-if="c_is_curation_editable"><!--  v-if="c_is_curation_editable" -->
                <div class="curation_annotation_input">
                  <div class="center_flex_container">
                    <div class="input_wrapper">
                      <input type="text" v-model="clip_text" v-on:focus="onFocusClipText(true)" v-on:blur="onFocusClipText(false)" placeholder="Clip Annotation" v-bind:disabled="c_disable_add_clip">
                    </div>
                    <div class="btn blue w90 h35" v-on:click="onCreateClipClick" v-bind:class="{ disable: c_disable_add_clip }">
                      클립저장</div>
                  </div>
                </div>
              </template>
            </template>
          </div>
          <template v-if="!is_wide_mode && !is_fullscreen">
            <div class="curation_annotation_list_wrapper">
              <div class="curation_annotation_title">어노테이션</div>
              <div class="curation_annotation_search">
                <div class="search_wrapper">
                  <img src="/img/renewal/common/annotation_search_icon.png" alt="search annotation">
                  <input type="text" class="flex" :placeholder="'검색어를 입력하세요.'" v-model="annotation_search_input" ref="annotation_search_text" v-on:keyup.stop="onAnnotationKeyUp">
                </div>
                <div class="btn h100p w80 ml_10" v-on:click.stop="onAnnotationSearch">검색</div>
              </div>
              <template v-if="c_is_data_load_complete && !c_is_personal_group">
                <div class="annotation_tab_wrapper">
                  <div class="move_arrow" v-bind:class="{ disable: !c_has_annotation_user_left }" v-on:click.stop="onAnnotationTabMove(false)"><img src="/img/renewal/common/annotation_arrow_left.png" alt="move left"></div>
                  <div class="annotation_tab_container">
                    <div class="annotation_tab_list" v-bind:style="c_tab_list_style">
                      <template v-for="annotation_user in c_annotation_user_list">
                        <div class="annotation_tab" v-on:click="onAnnotationUserClick(annotation_user)"
                             v-bind:class="{ selected: annotation_user.selected, all: annotation_user.is_all }"
                             v-bind:style="{
                               backgroundColor: annotation_user.selected ? annotation_user.color : null,
                               borderColor: annotation_user.selected ? annotation_user.color : null,
                             }"
                             v-bind:title="annotation_user.display_name"
                        >
                          <div class="user_name ellipsis">{{ annotation_user.user_name }}</div>
                          <div class="annotation_count">({{ annotation_user.count }})</div>
                        </div>
                      </template>
                    </div>
                  </div>
                  <div class="move_arrow" v-bind:class="{ disable: !c_has_annotation_user_right }" v-on:click.stop="onAnnotationTabMove(true)"><img src="/img/renewal/common/annotation_arrow_right.png" alt="move right"></div>
                </div>
              </template>
              <div class="curation_annotation" v-bind:style="{ borderColor: annotation_user.color }">
                <template v-if="c_is_curation_editable && c_is_creatable_phase">
                  <div class="curation_annotation_phase">
                    <div class="input_wrapper">
                      <input type="text" v-model="add_phase_text" :placeholder="'체크한 클립을 Phase로 묶기'" v-on:focus="onFocusPhaseText(true)" v-on:blur="onFocusPhaseText(false)" v-bind:disabled="!c_has_checked_clip">
                    </div>
                    <div class="btn orange w90 h40" v-on:click="onCreatePhaseClick" v-bind:class="{ disable: !c_has_checked_clip }"><span>단계저장</span></div>
                  </div>
                </template>
                <AnnotationList
                  ref="annotationListTop"
                  v-bind:clip_list="c_clip_list"
                  v-bind:operation_info="operation_info"
                  v-bind:has_checked_clip="c_has_checked_clip"
                  v-bind:selected_clip_id="selected_clip_id"
                  v-bind:mode="c_curation_list_view_mode"
                  v-bind:current_time="current_time"
                  v-bind:annotation_user_map="annotation_user_map"
                  v-bind:is_creatable_phase="c_is_creatable_phase"
                  v-bind:is_annotation_search="c_is_annotation_search"
                  v-on:onPhaseClick="onPhaseClick"
                  v-on:onPhaseModifyClick="onPhaseModifyClick"
                  v-on:onPhaseDeleteClick="onPhaseDeleteClick"
                  v-on:onPhaseSaveClick="onPhaseSaveClick"
                  v-on:onPhaseModifyCancelClick="onPhaseModifyCancelClick"
                  v-on:onSetPhaseClick="onSetPhaseClick"
                  v-on:onClipModifyClick="onClipModifyClick"
                  v-on:onClipDeleteClick="onClipDeleteClick"
                  v-on:onClipReplyClick="onClipReplyClick"
                  v-on:onClipSaveClick="onClipSaveClick"
                  v-on:onClipModifyCancelClick="onClipModifyCancelClick"
                  v-on:onClipClick="onClipClick"
                  v-on:setRangeInfo="setRangeInfo"
                  v-on:onUnSetPhaseClick="onUnSetPhaseClick"
                  v-on:onClipRowSelected="onClipRowSelected"
                  v-on:onClipRowMounted="onClipRowMounted"
                  v-on:onClipEditorFocus="onClipEditorFocus"
                ></AnnotationList>
              </div>
            </div>
          </template>
        </div>
      </div>
      <template v-if="c_is_data_load_complete">
        <div class="data_viewer">
          <div class="center_flex_container">
            <div class="data_viewer_wrapper">
              <div class="divider">
                <div class="folder_navigation">
<!--                  <div class="folder_wrapper">-->
<!--                    <span v-on:click="onFolderClick(null)" class="point_cursor">{{ '드라이브' }}</span>-->
<!--                    <template v-for="folder_info in c_folder_name">-->
<!--                      <img src="/img/renewal/drive/locator_arrow.png" alt=">" class="title_arrow">-->
<!--                      <span :class="{ now: folder_info.seq !== null && `${folder_info.seq}` === `${c_folder_seq}` }"-->
<!--                            v-on:click="onFolderClick(folder_info, $event, true)">{{ folder_info.folder_name }}</span>-->
<!--                    </template>-->
<!--                  </div>-->
                </div>
                <div class="data_info">
                  <div class="data_info_title">
                    <span>{{ operation_info.seq }}</span> {{ operation_info.operation_name }}
                  </div>
                  <div class="data_info_others">
                    <span>{{ c_operation_date }}</span>
                    <span class="bar_h12"></span>
                    <span>{{ c_reg_date }}</span>

                    <template v-if="c_is_operation_owner">
                      <div class="toggleWrapper" v-on:click="setOpenVideo">
                        <input type="checkbox" :checked="!is_open_video">
                        <label class="toggle" :data-label-on="'공개'" :data-label-off="'비공개'" ><span class="toggle__handler"></span></label>
                      </div>
                    </template>
                    <div class="data_info_edit_btn_list">
                      <!--                      <template v-if="!is_doc_edit">-->
                      <!--                        <div class="btn w60 h30 f13" v-on:click="onModifyOperationDocClick"><span>수정</span></div>-->
                      <!--                      </template>-->
                      <template v-if="c_is_drive && c_is_operation_owner">
                        <div class="btn red_text f13 w60 h30" v-on:click="onDeleteClick"><span>삭제</span></div>
                      </template>
                      <template v-if="c_is_drive && c_is_operation_owner">
                        <div class="btn f13 w60 h30" v-on:click="onLinkClick"><span>공유</span></div>
                      </template>
                      <div class="btn f13 w80 h30 blue_line_text" v-on:click="onMoveToListClick"><span class="list_icon">목록</span></div>
                    </div>
                  </div>
                </div>
                <div class="divider">
                  <img :src="operation_info.thumbnail" style="width:160px;height:100px;" >
                </div>
                <div class="divider" :class="{ no_border: !operation_data_info.doc_html }">
                  <template v-if="!is_doc_edit">
                    <div class="data_document editor_out_blue_line">
                      <TinyEditorBasicMode
                        ref="operation_doc_editor"
                        set_select_id=".data_document"
                        set_contentid="operation_doc"
                        set_mode="basic"
                        set_toolbar="basic"
                        set_height="400px"
                        set_resize="true"
                        v-bind:set_overflow="true"
                        v-bind:set_desc="operation_data_info.doc_html"
                        v-bind:callback_focus="onEditorFocus"
                        v-bind:callback_blur="onEditorBlur"
                      ></TinyEditorBasicMode>
                      <div class="right_align_buttons mt10">
                        <div class="btn w60 h30 r15" v-on:click="onModifyOperationDocCancel"><span>취소</span></div>
                        <div class="btn w60 h30 r15 blue" v-on:click="onModifyOperationDocConfirm"><span>확인</span></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="data_document editor_viewer" v-html="operation_data_info.doc_html"></div>
                  </template>
                </div>

              </div>
              <template v-if="c_write_comment">
                <div class="divider">
                  <div class="comment_count">
                    {{ c_comment_count }}
                  </div>
                  <template v-if="comment_clip_info">
                    <div class="comment_clip">
                      <div class="comment_clip_thumbnail"><img v-bind:src="comment_clip_info.thumbnail_url"></div>
                      <div class="comment_clip_info">
                        <div class="comment_clip_info_top">
                          <div class="comment_clip_info_time">{{ formatSecToTime(comment_clip_info.start_time) }} ~ {{ formatSecToTime(comment_clip_info.end_time) }}</div>
                          <div class="comment_clip_info_writer">{{ comment_clip_info.user_name }}</div>
                        </div>
                        <div class="comment_clip_info_desc">{{ comment_clip_info.desc }}</div>
                      </div>
                      <div class="comment_clip_delete"><div class="f_btn trash_btn" v-on:click="onAddCommentClipDelete()"></div></div>
                    </div>
                  </template>
                  <div class="comment_editor" ref="comment_editor" v-bind:class="{ add_clip: comment_clip_info !== null }">
                    <TinyEditorBasicMode ref="editor_add_comment"
                                         set_min_height="240"
                                         set_height="250px"
                                         set_toolbar="comment"
                                         v-bind:callback_focus="onEditorFocus"
                                         v-bind:callback_blur="onEditorBlur"
                                         set_file_picker_types="file image"
                    ></TinyEditorBasicMode>
                  </div>
                  <div class="flex_row_between">
                    <div></div>
                    <div class="right_align_buttons">
                      <div class="btn w60 h30 r15" v-on:click="onAddCommentCancel"><span>취소</span></div>
                      <div class="btn pad_10 h30 r15 blue min_w60" v-on:click="onAddCommentClick(false)"><span>댓글</span></div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-if="c_has_comment">
                <template v-for="(comment_info, index) in comment_list">
                  <div class="divider comment">
                    <ModuleOperationComment
                      v-bind:comment_info="comment_info"
                      v-bind:index="index"
                      v-bind:color_list="c_color_list"
                      v-bind:key="comment_info.seq"
                      v-bind:api_key="api_key"
                      v-bind:api_type="api_type"
                      ref="operation_comment"
                      v-bind:annotation_user_map="annotation_user_map"
                      v-on:onCommentClipClick="onCommentClipClick"
                      v-on:onCommentDelete="onCommentDelete"
                      v-on:onEditorFocus="onEditorFocus"
                      v-on:onEditorBlur="onEditorBlur"
                      v-on:onClipCommentCountChange="onClipCommentCountChange"
                      v-on:onCommentCountChange="onCommentCountChange"
                    ></ModuleOperationComment>
                  </div>
                </template>
              </template>

            </div>
            <template v-if="is_wide_mode || is_fullscreen">
              <div class="curation_annotation_list_wrapper">
                <div class="curation_annotation_title">어노테이션</div>
                <div class="curation_annotation_search">
                  <div class="search_wrapper">
                    <img src="/img/renewal/common/annotation_search_icon.png" alt="search annotation">
                    <input type="text" class="flex" :placeholder="'검색어를 입력하세요.'" v-model="annotation_search_input" ref="annotation_search_text" v-on:keyup.stop="onAnnotationKeyUp">
                  </div>
                  <div class="btn h100p w80 ml_10" v-on:click.stop="onAnnotationSearch">검색</div>
                </div>
                <template v-if="c_is_data_load_complete && !c_is_personal_group">
                  <div class="annotation_tab_wrapper">
                    <div class="move_arrow" v-bind:class="{ disable: !c_has_annotation_user_left }" v-on:click.stop="onAnnotationTabMove(false)"><img src="/img/renewal/common/annotation_arrow_left.png" alt="move left"></div>
                    <div class="annotation_tab_container">
                      <div class="annotation_tab_list" v-bind:style="c_tab_list_style">
                        <template v-for="annotation_user in c_annotation_user_list">
                          <div class="annotation_tab" v-on:click="onAnnotationUserClick(annotation_user)"
                               v-bind:class="{ selected: annotation_user.selected, all: annotation_user.is_all }"
                               v-bind:style="{
                               backgroundColor: annotation_user.selected ? annotation_user.color : null,
                               borderColor: annotation_user.selected ? annotation_user.color : null,
                             }"
                               v-bind:title="annotation_user.display_name"
                          >
                            <div class="user_name ellipsis">{{ annotation_user.user_name }}</div>
                            <div class="annotation_count">({{ annotation_user.count }})</div>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div class="move_arrow" v-bind:class="{ disable: !c_has_annotation_user_right }" v-on:click.stop="onAnnotationTabMove(true)"><img src="/img/renewal/common/annotation_arrow_right.png" alt="move right"></div>
                  </div>
                </template>
                <div class="curation_annotation" v-bind:style="{ borderColor: annotation_user.color }">
                  <template v-if="c_is_curation_editable && c_is_creatable_phase">
                    <div class="curation_annotation_phase">
                      <div class="input_wrapper">
                        <input type="text" v-model="add_phase_text" :placeholder="'체크한 클립을 Phase로 묶기'" v-on:focus="onFocusPhaseText(true)" v-on:blur="onFocusPhaseText(false)" v-bind:disabled="!c_has_checked_clip">
                      </div>
                      <div class="btn orange w90 h40" v-on:click="onCreatePhaseClick" v-bind:class="{ disable: !c_has_checked_clip }"><span>단계저장</span></div>
                    </div>
                  </template>
                  <AnnotationList
                    ref="annotationListTop"
                    v-bind:clip_list="c_clip_list"
                    v-bind:operation_info="operation_info"
                    v-bind:has_checked_clip="c_has_checked_clip"
                    v-bind:selected_clip_id="selected_clip_id"
                    v-bind:mode="c_curation_list_view_mode"
                    v-bind:current_time="current_time"
                    v-bind:annotation_user_map="annotation_user_map"
                    v-bind:is_creatable_phase="c_is_creatable_phase"
                    v-bind:is_annotation_search="c_is_annotation_search"
                    v-on:onPhaseClick="onPhaseClick"
                    v-on:onPhaseModifyClick="onPhaseModifyClick"
                    v-on:onPhaseDeleteClick="onPhaseDeleteClick"
                    v-on:onPhaseSaveClick="onPhaseSaveClick"
                    v-on:onPhaseModifyCancelClick="onPhaseModifyCancelClick"
                    v-on:onSetPhaseClick="onSetPhaseClick"
                    v-on:onClipModifyClick="onClipModifyClick"
                    v-on:onClipDeleteClick="onClipDeleteClick"
                    v-on:onClipReplyClick="onClipReplyClick"
                    v-on:onClipSaveClick="onClipSaveClick"
                    v-on:onClipModifyCancelClick="onClipModifyCancelClick"
                    v-on:onClipClick="onClipClick"
                    v-on:setRangeInfo="setRangeInfo"
                    v-on:onUnSetPhaseClick="onUnSetPhaseClick"
                    v-on:onClipRowSelected="onClipRowSelected"
                    v-on:onClipRowMounted="onClipRowMounted"
                    v-on:onClipEditorFocus="onClipEditorFocus"
                  ></AnnotationList>
                </div>
              </div>
            </template>

          </div>
        </div>
      </template>
    </div>
<!--    <OperationLinkPopup ref="operationLinkPopup" v-on:onLinkPopupClose="onLinkPopupClose"></OperationLinkPopup>-->
<!--    <SubFolderLayer ref="subFolderLayer" v-on:onFolderClick="onFolderClick"></SubFolderLayer>-->
  </div>
</template>

<style scoped>
.contents_editor_wrapper.curation {
  background-color: #f5f5f5;
}
.curation_contents_mid {
  padding-bottom: 0;
}
.list_icon {
  background-image: url('/img/renewal/drive/list_icon.png');
  background-repeat: no-repeat;
  background-position: left;
  width: auto;
  padding-left: 18px;
}
.min_w60 {
  min-width: 60px;
}
.data_viewer .center_flex_container .data_viewer_wrapper .divider .folder_navigation .folder_wrapper {
  padding: 10px 0;
  align-items: center;
  justify-content: flex-start;
}
.data_viewer .center_flex_container .data_viewer_wrapper .divider .folder_navigation .folder_wrapper > span {
  font-weight: 300;
  font-size: 13px;
  color: #555555;
}
.data_viewer .center_flex_container .data_viewer_wrapper .divider .folder_navigation .folder_wrapper > span.now {
  font-weight: 400;
}
</style>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import VLazyImage from 'v-lazy-image/v2';

import * as Constants from '../../../constants';
import util from '../../../utils/util';
import EventBus from '../../../utils/eventbus';
import AnnotationList from '../../../components/annotation/clip/AnnotationList';
import api_operation_data from '../../../api/ApiOperationData';
// import api_follow from '../../../api/ApiFollow';
import TinyEditorBasicMode from '../../../components/editor/TinyEditorBasicMode';
// import ModuleOperationComment from '../../../components/operation/module/ModuleOperationComment';
// import OperationLinkPopup from '../../../components/module/operation/OperationLinkPopup';
// import FollowButton from '../components/Button/FollowButton';
import AnnotationDrawEventBus from '../../../utils/event_emitter';
import AnnotationToolBar from '../../../components/annotation/draw/AnnotationToolBar';
import AnnotationDraw from '../../../components/annotation/draw/AnnotationDraw';
import VideoPlayer from '../../../components/VideoPlayer';
import BaseMixin from '../../../components/Mixins/BaseMixin';
// import ApiDynamic from '../../../../api/ApiDynamic';
// import SubFolderLayer from '../../folder/SubFolderLayer';
// import ChangeLang from './ModuleOperationView.vue.lang';

export default {
  name: 'ModuleOperationView',
  components: { VideoPlayer, VLazyImage, AnnotationList, AnnotationToolBar, AnnotationDraw, TinyEditorBasicMode },
  mixins: [BaseMixin],
  data() {
    return {
      MODE_REFER: Constants.MODE_REFER,
      SMALL: Constants.SMALL,
      STOP: Constants.STOP,
      PAUSE: Constants.PAUSE,
      PLAY: Constants.PLAY,
      VIDEO: Constants.VIDEO,
      IMAGE: Constants.IMAGE,
      PDF: Constants.PDF,
      TEXT: Constants.TEXT,
      AUDIO: Constants.AUDIO,
      ARCHIVE: Constants.ARCHIVE,
      WORD: Constants.WORD,
      ETC: Constants.ETC,
      operation_seq: null,
      operation_info: null,
      index_list: [],
      index_list_length: 0,
      clip_list: {},
      asc: 1,
      desc: 2,
      is_player_init: false,
      last_search_index: -1,
      last_search_index_info: null,
      index_data_length: 0,
      is_data_load_complete: false,
      current_play_id: null,
      blank_index_info: null,
      is_edit_popup_open: false,
      clip_text: '',
      is_loop: false,
      is_focus_clip_text: false,
      is_focus_phase_text: false,
      stream_source: [],
      stream_options: {},
      index_list_width: 0,
      is_info_popup_open: false,
      is_wide_mode: false,
      is_edit_mode: false,
      is_focus_editor: false,
      add_phase_text: '',
      is_clip_edit_mode: false,
      modify_clip_row: null,
      modify_clip_target: null,
      is_phase_edit_mode: false,
      modify_phase_row: null,
      modify_phase_target: null,
      selected_clip_id: null,
      selected_clip_info: null,
      selected_clip_row: null,
      params_clip_id: null,
      play_params_clip: false,
      is_fullscreen: false,
      current_time: -1,
      comment_list_length: 20,
      comment_list_start: 0,
      comment_count: 0,
      comment_list: null,
      is_comment_loading: false,
      is_link: false,
      is_writer: false,
      is_editor_link: false,
      is_download_link: false,
      is_mentoring: false,
      disable_key_event: false,
      is_doc_edit: false,
      refer_file_list: null,
      is_open_video: false,
      follow_info: null,
      draw_event_bus: null,
      media_width: 0,
      media_height: 0,
      addon_width: 0,
      addon_height: 0,
      is_drawer_active: false,
      show_addons: false,
      media_info: null,
      comment_clip_info: null,
      api_key: null,
      api_type: null,
      comment_clip_map: {},
      template_grade: null,
      annotation_user_map: {
        all: {
          member_seq: 'all',
          user_name: '전체',
          user_nickname: '전체',
          name: '전체',
          display_name: '전체',
          modify_date: null,
          count: 0,
          is_me: false,
          order: 0,
          selected: true,
          color: Constants.PROFILE_COLOR_LIST[0],
          is_all: true,
        },
      },
      annotation_user: null,
      max_user_tab_count: 8,
      color_index: 0,
      disable_create_clip: false,
      shape_clip_list: [],
      clip_row_map: {},
      drawer_timer_start_time: 5,
      drawer_pause_time: 0,
      is_drawer_timer_active: false,
      is_drawer_timer_start: false,
      drawer_pause_timer_id: null,
      cid: null,
      writer_info: null,
      viewer_file_types: [Constants.IMAGE, Constants.PDF],
      viewer_file_type_map: {},
      operation_data_info: null,
      show_more_users: false,
      questionnaire_list: null,
      is_updater_open: null,
      annotation_search_input: null,
      annotation_search_text: null,
      annotation_user_index: 0,
      annotation_tab_size: 112,
      annotation_tab_count: 5,
      clip_member_map: {},
      is_drawer_edit_mode: false,
    };
  },
  computed: {
    ...mapGetters([]),
    c_drawer_timer_style() {
      return `--duration: ${this.drawer_timer_start_time}; --size: 40px; --line-size: 4px; --font-size:15px;`;
    },
    c_media_width() {
      // this.media_width = 1272;
      return this.media_width;
    },
    c_media_height() {
      // this.media_height = 720;
      return this.media_height;
    },
    c_addon_style() {
      const width_scale = this.addon_width / this.c_media_width;
      const height_scale = this.addon_height / this.c_media_height;
      const scale = Math.min(width_scale, height_scale);
      const scale_width = this.c_media_width * scale;
      const scale_height = this.c_media_height * scale;
      let margin_top = 0;
      let margin_left = 0;
      if (this.addon_width > scale_width) {
        margin_left = (this.addon_width - scale_width) / 2;
      }
      if (this.addon_height > scale_height) {
        margin_top = (this.addon_height - scale_height) / 2;
      }
      return { width: `${scale_width}px`, height: `${scale_height}px`, marginLeft: `${margin_left}px`, marginTop: `${margin_top}px` };
    },
    c_color_list() {
      return _.shuffle(Constants.PROFILE_COLOR_LIST);
    },
    c_has_comment() {
      return this.comment_list && this.comment_list.length > 0;
    },
    c_comment_count() {
      return `댓글 ${util.numberFormat(this.comment_count)}개`;
    },
    c_has_refer_files() {
      return this.refer_file_list && this.refer_file_list.length > 0;
    },
    c_has_refer_image_files() {
      return this.c_refer_image_files && this.c_refer_image_files.length > 0;
    },
    c_has_refer_other_files() {
      return this.c_refer_other_files && this.c_refer_other_files.length > 0;
    },
    c_refer_image_files() {
      if (!this.c_has_refer_files) return [];
      return _.filter(this.refer_file_list, refer_file => this.viewer_file_type_map[refer_file.file_type] === true);
    },
    c_refer_other_files() {
      if (!this.c_has_refer_files) return [];
      return _.filter(this.refer_file_list, refer_file => this.viewer_file_type_map[refer_file.file_type] !== true);
    },
    c_writer_profile_image() {
      const profile_path = this.writer_info ? this.writer_info.profile_image_url : null;
      const seq = this.writer_info ? this.writer_info.seq : null;
      return util.getProfileImagePath(profile_path, seq);
    },
    c_writer_follower_count() {
      return `팔로워: ${util.getInt(this.writer_info.follower, 0)}`;
    },
    c_operation_date() {
      const operation_date = this.operation_info.operation_date;
      if (!operation_date) {
        return null;
      }
      return `수술일: ${operation_date}`;
    },
    c_reg_date() {
      const reg_date = this.operation_info.reg_date;
      if (!reg_date) {
        return '등록일자 없음';
      }
      return `등록일: ${reg_date.substr(0, 10)}`;
    },
    c_screen_mode_class_name() {
      if (this.is_fullscreen) {
        return 'fullscreen';
      } else if (this.is_wide_mode) {
        return 'wide';
      }
      return '';
    },
    c_is_writer_group() {
      if (!this.is_writer) return false;
      if (!this.operation_info || !this.operation_info.group_seq) return false;
      return this.operation_info.group_seq === this.group_seq;
    },
    c_group_admin() {
      if (!this.c_is_writer_group) return false;
      return this.is_personal_group || this.is_group_admin;
    },
    c_is_personal_group() {
      if (!this.c_is_writer_group) return false;
      return this.is_personal_group;
    },
    c_is_operation_owner() {
      if (this.c_is_admin) return false;
      if (!this.c_is_writer_group) return false;
      if (!this.operation_info || !this.operation_info.member_seq) return false;
      if (this.c_group_admin) return true;
      return this.operation_info.member_seq === this.member_seq;
    },
    c_video_download() {
      if (this.c_is_admin) return true;
      if (this.c_is_operation_owner) return true;
      if (!this.operation_data_info.video_download) return false;
      if (this.c_is_writer_group) return true;
      return this.is_link && this.is_download_link === true;
    },
    c_file_download() {
      if (this.c_is_operation_owner) return true;
      if (!this.operation_data_info.file_download) return false;
      if (this.c_is_writer_group) return true;
      if (this.is_link && this.is_download_link === true) return true;
      return this.is_mentoring;
    },
    c_curation_list_view_mode() {
      if (this.c_is_admin) return Constants.EDIT;
      return Constants.EDIT;
    },
    c_is_data_load_complete() {
      return this.is_data_load_complete && this.operation_info;
    },
    c_is_process() {
      return this.c_is_data_load_complete && this.operation_info.status === 'Y' && this.operation_info.analysis_status !== 'Y';
    },
    c_is_disable() {
      // return true;
      return this.c_is_data_load_complete && this.operation_info.status !== 'Y';
    },
    c_is_drive() {
      return this.api_type === 'drive2';
    },
    c_is_admin() {
      return this.api_type === 'admin2';
    },
    c_is_curation_editable() {
      // return true;
      if (this.c_is_admin) return false;
      if (this.c_is_operation_owner) return true;
      if (this.c_is_writer_group) return true;
      if (this.is_link) return this.is_editor_link === true;
      return false;
    },
    c_write_comment() {
      if (this.c_is_admin) return false;
      if (this.is_link) return this.is_editor_link === true;
      return true;
    },

    c_has_checked_clip() {
      return this.c_checked_clip_list.length > 0;
    },
    c_checked_clip_list() {
      const checked_clip_list = [];
      if (!this.c_is_annotation_search && this.clip_list) {
        for (let i = 0; i < this.clip_list.length; i++) {
          if (this.clip_list[i].is_checked) {
            checked_clip_list.push(this.clip_list[i]);
          }
        }
      }
      return checked_clip_list;
    },
    c_is_annotation_search() {
      return _.trim(this.annotation_search_text) !== '';
    },
    c_clip_list() {
      let selected_member_seq = null;
      if (this.annotation_user) {
        selected_member_seq = this.annotation_user.member_seq !== 'all' ? this.annotation_user.member_seq : null;
      }
      const sort_list = _.orderBy(this.clip_list, ['start_time', 'end_time'], ['asc', 'asc']);
      const clip_map = {};
      this.clip_member_map = {
        all: 0,
      };
      if (this.c_is_annotation_search) {
        const search_regexp = new RegExp(this.annotation_search_text, 'g');
        sort_list.forEach((clip_info) => {
          if (!search_regexp.test(clip_info.desc)) {
            return;
          }
          clip_info.child_list = [];
          if (clip_info.is_phase) {
            return;
          }
          if (!clip_info.is_phase) {
            if (!this.clip_member_map[clip_info.member_seq]) {
              this.clip_member_map[clip_info.member_seq] = 1;
            } else {
              this.clip_member_map[clip_info.member_seq]++;
            }
            this.clip_member_map.all++;
          }
          if (selected_member_seq) {
            if (clip_info.member_seq !== selected_member_seq) {
              return;
            }
          }
          clip_map[clip_info._id] = clip_info;
        });
      } else {
        sort_list.forEach((clip_info) => {
          if (!clip_info.phase_id) {
            clip_info.child_list = [];
            if (clip_info.is_phase) {
              clip_info.start_time = -1;
              clip_info.end_time = -1;
            } else if (selected_member_seq) {
              if (clip_info.member_seq !== selected_member_seq) {
                return;
              }
            }
            clip_map[clip_info._id] = clip_info;
          }
        });
        sort_list.forEach((clip_info) => {
          if (!clip_info.is_phase && clip_info.phase_id) {
            const phase_info = clip_map[clip_info.phase_id];
            if (phase_info) {
              if (phase_info.start_time < 0 || phase_info.start_time > clip_info.start_time) {
                phase_info.start_time = clip_info.start_time;
              }
              if (phase_info.end_time < 0 || phase_info.end_time < clip_info.end_time) {
                phase_info.end_time = clip_info.end_time;
              }
              if (selected_member_seq) {
                if (clip_info.member_seq !== selected_member_seq) {
                  return;
                }
              }
              phase_info.child_list.push(clip_info);
            }
          }
        });
      }
      return _.orderBy(clip_map, ['start_time', 'end_time'], ['asc', 'asc']);
    },
    c_annotation_user_list() {
      this.annotation_user_map.all.user_name = '전체';
      const user_list = _.orderBy(this.annotation_user_map, ['order', 'name'], ['asc', 'asc']);
      if (this.is_data_load_complete) {
        for (let i = 0; i < user_list.length; i++) {
          const user_info = user_list[i];
          const clip_count = this.c_is_annotation_search ? util.getInt(this.clip_member_map[user_info.member_seq], 0) : user_info.count;
          user_info.display_name = `${user_info.name} (${clip_count})`;
          user_info.count = clip_count;
        }
      }
      return user_list;
    },
    c_has_annotation_user_left() {
      return this.annotation_user_index > 0;
    },
    c_has_annotation_user_right() {
      return this.annotation_user_index + this.annotation_tab_count < this.c_annotation_user_list.length;
    },
    c_tab_list_style() {
      let left = '0';
      if (this.annotation_user_index > 0) {
        left = `-${this.annotation_user_index * this.annotation_tab_size}px`;
      }
      return `--tab-left: ${left}; --tab-size: ${this.annotation_tab_size}px;`;
    },
    c_is_creatable_phase() {
      return this.annotation_user.is_me;
    },
    c_disable_add_clip() {
      return this.is_edit_mode;
    },
    c_questionnaire_list() {
      if (!util.isEmpty(this.questionnaire_list)) {
        return this.questionnaire_list;
      }
      return null;
    },
  },
  created() {
    // this.$log.debug(this.$route.params);
    if (this.$route.query) {
      if (this.$route.query.cid) this.cid = this.$route.query.cid;
    }
    if (this.$route.params) {
      if (this.$route.params.operation_seq) this.cid = this.$route.params.operation_seq;
    }
    this.annotation_user = this.annotation_user_map.all;
    this.draw_event_bus = new AnnotationDrawEventBus();
    this.draw_event_bus.on('onDrawerActiveChange', this.onDrawerActiveChange);
    this.draw_event_bus.on('onAddNewDrawAnnotationClick', this.onAddNewDrawAnnotationClick);
    this.draw_event_bus.on('onDrawCancelClick', this.onDrawCancelClick);
    this.draw_event_bus.on('onDrawSaveClick', this.onDrawSaveClick);
    this.draw_event_bus.on('onDrawModifySaveClick', this.onDrawModifySaveClick);
    this.draw_event_bus.on('onModifyDrawAnnotationClick', this.onModifyDrawAnnotationClick);

    EventBus.on('pushNotice', this.onPushNotice);
    EventBus.on('onOperationInfoPopupClose', this.onOperationInfoPopupClose);
    EventBus.on('onOperationFileChange', this.onOperationFileChange);
    EventBus.on('onOperationInfoChange', this.onOperationInfoChange);
    EventBus.on('onMoveToListClick', this.onMoveToListClick);

    this.loadData('drive2', this.$route.params.operation_seq);
    for (let i = 0; i < this.viewer_file_types.length; i++) {
      this.viewer_file_type_map[this.viewer_file_types[i]] = true;
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('scroll', this.onWindowScroll);
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
    window.templateReturn = this.templateReturn;
  },
  beforeDestroy() {
    EventBus.emit('hideScroll', false);
    document.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('scroll', this.onWindowScroll);
    window.removeEventListener('resize', this.onWindowResize);

    EventBus.off('pushNotice', this.onPushNotice);
    EventBus.off('onOperationInfoPopupClose', this.onOperationInfoPopupClose);
    EventBus.off('onOperationFileChange', this.onOperationFileChange);
    EventBus.off('onOperationInfoChange', this.onOperationInfoChange);
    EventBus.off('onMoveToListClick', this.onMoveToListClick);

    if (this.draw_event_bus) {
      this.draw_event_bus.clearEvent();
    }
    this.draw_event_bus = null;
    window.templateReturn = null;
  },
  watch: {
  },
  methods: {
    onFolderClick(folder_info, event, open_sub_layer = false) {
      const params = {};
      const query = {};

      if (folder_info !== null && !folder_info.seq && open_sub_layer) {
        this.$refs.subFolderLayer.openLayer(this.undisplay_folder_list, event.target);
      } else {
        if (folder_info) {
          const has_auth = this.checkFolderAuth(folder_info);
          if (!has_auth) {
            return;
          }
          if (folder_info.seq) {
            query.folder = folder_info.seq;
          }
        }
        this.$router.push({ name: 'drive', params, query });
      }
    },
    checkFolderAuth(folder_info) {
      return this.checkDriveFolderAuth(this.c_group_admin, this.c_grade_num, folder_info);
    },
    onAnnotationTabMove(move_right = false) {
      if (move_right) {
        if (!this.c_has_annotation_user_right) return;
        this.annotation_user_index++;
      } else {
        if (!this.c_has_annotation_user_left) return;
        this.annotation_user_index--;
      }
    },
    onAnnotationKeyUp(event) {
      if (!event.key) {
        return true;
      }
      const key = event.key.toLowerCase();
      const shift = event.shiftKey;
      const ctrl = event.ctrlKey;
      const is_escape = key === 'escape';
      if (key === 'enter') {
        this.onAnnotationSearch();
        return false;
      } else if (is_escape) {
        this.onAnnotationSearchCancel();
        return false;
      }
      return true;
    },
    onAnnotationSearchCancel() {
      this.annotation_search_input = '';
      this.onAnnotationSearch();
    },
    onAnnotationSearch() {
      this.annotation_search_text = _.trim(this.annotation_search_input);
    },
    templateReturn(template_result_list) {
      if (template_result_list && template_result_list.length > 0) {
        if (template_result_list[0].result_seq.toString() === this.operation_seq.toString()) {
          this.questionnaire_list = template_result_list;
        }
      }
    },
    onModifyQuestion(template_id, mongo_id) {
      const is_read = this.template_grade.is_grade ? this.is_admin || this.is_group_admin || _.includes(this.template_grade[template_id].read, this.member_seq) : true;
      const is_write = this.template_grade.is_grade ? this.is_admin || this.is_group_admin || _.includes(this.template_grade[template_id].write, this.member_seq) : true;

      if (this.is_admin || this.is_group_admin || is_read || is_write) {
        EventBus.emit('onDynamicTemplateViewPopupOpen', this.operation_seq, template_id, mongo_id, 'modify', this.templateReturn, true, is_write);
      } else {
        this.showRedToast('조사지를 보거나 수정할 수 있는 권한이 없습니다.');
      }
    },
    onDeleteQuestion(mongo_id, title) {
      const options = {
        is_close_btn: true,
        confirm_text: '삭제',
        cancel_text: '취소',
        popup_image: '/img/renewal/drive/mark.png',
      };
      let message = '{title}을(를)<br/>삭제하시겠습니까?';
      // message = this.getLang(message);
      message = message.replace(/{title}/g, this.title);
      EventBus.emit('confirmPopupOpen', mongo_id, message, this.deleteQuestion, options);
    },
    deleteQuestion(mongo_id) {
      ApiDynamic.deleteTemplateResult(mongo_id)
        .then((res) => {
          EventBus.emit('confirmPopupClose');
          const target_question = _.find(this.questionnaire_list, item => item._id === mongo_id);
          if (target_question) {
            this.questionnaire_list = _.reject(this.questionnaire_list, target_question);
          }
          // this.questionnaire_list = res.questionnaire_list;
        });
    },
    onQuestionUpdaterList(event, index) {
      if (this.is_updater_open === index) {
        this.is_updater_open = null;
      } else {
        this.is_updater_open = index;
      }
    },
    rtn_updater_last(updater_list) {
      const last = _.first(_.orderBy(updater_list, ['reg_date'], ['desc']));
      return `${last.reg_date} by ${last.updater}`;
    },
    rtn_updater_list(updater_list) {
      const list = _.orderBy(updater_list, ['reg_date'], ['desc']);
      return _.reject(list, _.first(list));
    },
    onPushNotice(received_data) {
      const data = received_data.data ? received_data.data : null;
      if (!data || data.action_type !== 'onChangeOperationState') {
        return;
      }
      if (data.operation_seq !== this.operation_seq) {
        return;
      }
      const extra_data = data.extra_data;
      if (!extra_data) {
        return;
      }
      const type = data.type;
      if (type === 'operation') {
        if (!extra_data.analysis_complete) return;
        if (this.c_is_process) {
          this.loadData(this.api_type, this.api_key);
        }
        return;
      }
      if (this.member_seq === extra_data.member_seq) return;
      if (type === 'clip') {
        this.onCreateClipComplete(extra_data.clip_info, true);
        this.showBlueToast(extra_data.message);
      } else if (type === 'comment') {
        if (extra_data.parent_seq) {
          const comment_list = this.$refs.operation_comment;
          if (comment_list) {
            for (let i = 0; i < comment_list.length; i++) {
              if (comment_list[i].getCommentSeq() === extra_data.parent_seq) {
                comment_list[i].getComment(extra_data.comment_seq, null, true);
                this.onCommentCountChange(1);
                this.showBlueToast(extra_data.message);
                break;
              }
            }
          }
        } else {
          this.onAddCommentComplete(extra_data, true);
          this.showBlueToast(extra_data.message);
          this.onCommentCountChange(1);
        }
      }
    },
    onWindowResize() {
      if (this.$refs.addon_container) {
        this.addon_width = this.$refs.addon_container.clientWidth;
        this.addon_height = this.$refs.addon_container.clientHeight;
      }
      this.$nextTick(() => {
        if (this.$refs.videoPlayer) this.$refs.videoPlayer.onWindowResize();
        if (this.$refs.annotationDraw) this.$refs.annotationDraw.onWindowResize();
      });
    },

    setVideoTime(time) {
      this.$refs.videoPlayer.setCurrentTime(time);
    },
    getVideoTime() {
      return this.$refs.videoPlayer.getCurrentTime();
    },
    setDrawEditMode(is_edit_mode = false, is_new_annotation = false, is_view_mode = false, force_block = false) {
      this.is_drawer_edit_mode = is_edit_mode;
      this.$refs.annotationDraw.setEditMode(is_edit_mode, is_new_annotation, is_view_mode, force_block);
    },
    onPlayBtnClick() {
      this.clearDrawerTimer();
      this.activeDraw(false);
    },
    resetDrawSelection() {
      this.$refs.annotationDraw.resetSelection();
    },
    clearAllDraw() {
      this.$refs.annotationDraw.clearShapes();
    },
    activeDraw(is_active) {
      this.$refs.annotationDraw.setDrawerActive(is_active);
    },
    getShapeInfoList() {
      return this.$refs.annotationDraw.getShapeInfoList();
    },
    setAnnotationShape(clip_info, change_time = true) {
      if (clip_info.is_shape) {
        this.changeVideoStatus(this.PAUSE);
        if (change_time) {
          this.setVideoTime(clip_info.start_time);
        }
        this.$refs.annotationDraw.setShapeInfoList(clip_info.shape_info_list);
      }
    },
    onAddNewDrawAnnotationClick() {
      this.clearClipEditorMode();
      this.clearDrawerTimer();
      this.changeVideoStatus(this.PAUSE);
      this.$refs.annotationDraw.setShapeInfoList([]);
      this.setDrawEditMode(true, true);
      this.activeDraw(true);
    },
    onDrawSaveClick() {
      this.onCreateClipClick();
    },
    onDrawModifySaveClick() {
      if (this.modify_clip_row) {
        this.modify_clip_row.save();
      }
    },
    onModifyDrawAnnotationClick() {
      if (this.selected_clip_id && this.clip_row_map[this.selected_clip_id]) {
        this.clearDrawerTimer();
        this.clip_row_map[this.selected_clip_id].setEditMode();
      }
    },
    onDrawCancelClick() {
      this.setDrawEditMode(false, false, false);
      this.activeDraw(false);
    },
    isDrawerEditMode() {
      return this.$refs.annotationDraw.isEditMode();
    },
    onDrawerActiveChange(is_active, is_view_mode) {
      this.disable_key_event = is_active;
      this.is_drawer_active = is_active;
      if (is_active) {
        this.changeVideoStatus(this.PAUSE);
      } else {
        this.$refs.annotationDraw.clearShapes();
      }
      this.$refs.videoPlayer.onDrawerActive(is_active, is_view_mode);
    },
    setOpenVideo() {
      this.showLoading();
      const is_open_video = !this.is_open_video;
      api_operation_data.changeOpenVideo(this.api_type, this.api_key, { is_open_video })
        .then((result) => {
          if (!result || result.error) {
            this.onError('공개설정 변경에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', result, 'setOpenVideo');
            return;
          }
          this.$set(this.operation_data_info, 'is_open_video', is_open_video);
          this.is_open_video = is_open_video;
          this.onSuccess(is_open_video ? '공개 처리되었습니다.' : '비공개 처리되었습니다.');
        })
        .catch((error) => {
          this.onError('공개설정 변경에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', error, 'onOperationDocModify');
        });
    },
    onMoveToListClick() {
      // this.$emit('onMoveToListClick', this.operation_info.folder_seq);
      const params = {};
      params.is_list = '1';
      this.$router.push({ name: 'operation', params });
    },
    onModifyOperationDocClick() {
      this.is_doc_edit = true;
    },
    onModifyOperationDocConfirm() {
      this.showLoading();
      const content = this.$refs.operation_doc_editor.getEditorContent();
      const comment = content.editor_desc;
      api_operation_data.changeDoc(this.api_type, this.api_key, { doc: comment })
        .then((result) => {
          if (!result || result.error) {
            this.onError('문서수정에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', result, 'onOperationDocModify');
            return;
          }
          this.$set(this.operation_data_info, 'doc_html', comment);
          this.onSuccess('문서가 수정되었습니다.');
          this.is_doc_edit = false;
        })
        .catch((error) => {
          this.onError('문서수정에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', error, 'onOperationDocModify');
        });
    },
    onModifyOperationDocCancel() {
      this.is_doc_edit = false;
    },
    onEditorFocus() {
      this.disable_key_event = true;
    },
    onEditorBlur() {
      this.disable_key_event = false;
    },
    loadData(api_type, api_key, options = {}) {
      this.api_type = api_type;
      this.api_key = api_key;
      this.showLoading();
      this.clip_count = 0;
      // 비디오 데이터 가지고 오는 부분
      api_operation_data.getViewData(this.api_type, this.api_key)
        .then((result) => {
          this.$log.debug(result);
          if (!result || result.error) {
            this.onError(result.message, result, 'loadData');
            this.onMoveToListClick();
            return;
          }
          this.operation_info = result.operation_info;
          this.operation_seq = this.operation_info.seq;
          this.operation_data_info = result.operation_data_info;
          this.media_info = this.operation_info.media_info;
          // this.$log.debug(this.media_info);
          this.media_width = this.media_info.width;
          this.media_height = this.media_info.height;
          this.is_open_video = this.operation_data_info.is_open_video;
          this.writer_info = result.writer_info;
          this.refer_file_list = result.refer_file_list;
          for (let i = 0; i < this.refer_file_list.length; i++) {
            util.setFileTypeInfo(this.refer_file_list[i]);
          }
          this.index_list = result.index_list;
          this.index_list_length = this.index_list.length;
          this.is_writer = result.is_writer;
          this.is_link = result.is_link;
          this.is_editor_link = result.is_editor_link;
          this.is_download_link = result.is_download_link;
          this.is_mentoring = options.is_mentoring === true;
          this.annotation_user.is_me = this.c_group_admin;
          this.questionnaire_list = result.questionnaire_list;
          this.template_grade = result.operation_data_info.template_grade;
          const clip_list = result.clip_list;
          clip_list.forEach((clip_info) => {
            clip_info.is_checked = false;
            clip_info.is_phase = clip_info.is_phase === true;
            clip_info.phase_id = clip_info.phase_id ? clip_info.phase_id : null;
            clip_info.child_list = [];
            if (clip_info.is_phase) {
              clip_info.start_time = -1;
              clip_info.end_time = -1;
            }
            if (this.params_clip_id && this.params_clip_id === clip_info._id) {
              this.selected_clip_id = clip_info._id;
              this.play_params_clip = true;
            }
            if (clip_info.is_shape) {
              this.shape_clip_list.push(clip_info);
            }
            this.addAnnotationUser(clip_info, false);
          });
          this.clip_list = clip_list;
          if (!this.is_writer) {
            this.loadFollowState();
          } else {
            this.onLoadComplete();
          }
          this.loadCommentList(false, true);
          // this.onPlayerReady();
        })
        .catch((error) => {
          this.onError('정보를 확인할 수 없습니다.', error, 'loadData');
          this.onMoveToListClick();
        });
    },
    onLoadComplete() {
      this.is_data_load_complete = true;
      this.$nextTick()
        .then(() => {
          this.onWindowResize();
          this.show_addons = true;
          this.showLoading(false);
        });
    },
    onWindowScroll() {
      if ((window.innerHeight + window.scrollY + 40) >= document.body.scrollHeight) {
        if (!this.c_has_more_comment) return;
        this.loadCommentList(true);
      }
    },
    showMoreUsers() {
      this.show_more_users = !this.show_more_users;
    },
    onAnnotationUserClick(annotation_user) {
      const member_seq = annotation_user.member_seq;
      if (this.annotation_user) {
        if (this.annotation_user.member_seq === member_seq) return;
        this.annotation_user.selected = false;
      }
      const member_info = this.annotation_user_map[member_seq];
      if (!member_info) return;

      this.clearClipEditorMode();
      this.clearClipSelection();
      member_info.selected = true;
      this.annotation_user = member_info;
    },
    addAnnotationUser(clip_info, is_delete = false) {
      if (clip_info.is_phase) return;
      const member_seq = clip_info.member_seq;
      const modify_date = clip_info.modify_date;
      if (is_delete) {
        if (this.annotation_user_map[member_seq]) {
          this.annotation_user_map[member_seq].count--;
          if (this.annotation_user_map[member_seq].count <= 0) {
            this.$delete(this.annotation_user_map, member_seq);
          }
        }
        this.clip_count--;
        this.annotation_user_map.all.count--;
        return;
      }
      if (!this.annotation_user_map[member_seq]) {
        const is_me = clip_info.member_seq === this.member_seq;
        let color;
        if (is_me) {
          color = Constants.PROFILE_COLOR_LIST[1];
        } else {
          color = Constants.PROFILE_COLOR_LIST[2 + this.color_index % (Constants.PROFILE_COLOR_LIST.length - 2)];
          this.color_index++;
        }
        this.$set(this.annotation_user_map, member_seq, {
          member_seq,
          user_name: clip_info.user_name,
          user_nickname: clip_info.user_nickname,
          name: clip_info.user_name,
          display_name: clip_info.user_name,
          modify_date,
          count: 0,
          is_me,
          order: is_me ? 1 : 101,
          selected: false,
          color,
        });
      } else if (this.annotation_user_map[member_seq].modify_date < modify_date && (clip_info.user_name || clip_info.user_nickname)) {
        this.annotation_user_map[member_seq].modify_date = modify_date;
        this.annotation_user_map[member_seq].user_name = clip_info.user_name;
        this.annotation_user_map[member_seq].user_nickname = clip_info.user_nickname;
        this.annotation_user_map[member_seq].name = clip_info.user_name;
      }
      this.annotation_user_map[member_seq].count++;
      this.annotation_user_map.all.count++;
      this.clip_count++;
    },

    loadCommentList(append_list = false, with_count = false) {
      if (this.is_comment_loading) {
        return;
      }
      this.is_comment_loading = true;
      const params = {
        start: this.comment_list_start,
        limit: this.comment_list_length,
        by_index: 'y',
      };
      if (with_count) {
        params.with_count = 'y';
      }
      api_operation_data.getCommentList(this.api_type, this.api_key, params)
        .then((result) => {
          if (!result || result.error) {
            this.$log.error('loadCommentList', result);
          } else {
            const comment_list = result.comment_list ? result.comment_list : [];
            if (!this.comment_list || !append_list) {
              this.comment_list = [];
            }
            for (let i = 0; i < comment_list.length; i++) {
              const comment_info = comment_list[i];
              this.comment_list.push(comment_info);
              this.addCommentClipInfo(comment_info);
            }
            if (with_count) {
              this.comment_count = util.getInt(result.comment_count, 0);
            }
            this.setCommentStart();
          }
          this.$nextTick(() => {
            this.is_comment_loading = false;
          });
        })
        .catch((error) => {
          this.$log.error('loadCommentList', error);
          this.$nextTick(() => {
            this.is_comment_loading = false;
          });
        });
    },
    addCommentClipInfo(comment_info) {
      const clip_id = comment_info.clip_id;
      const is_clip_deleted = comment_info.is_clip_deleted;
      if (!clip_id || is_clip_deleted) return;
      if (!this.comment_clip_map[clip_id]) {
        this.comment_clip_map[clip_id] = [];
      }
      this.comment_clip_map[clip_id].push(comment_info);
    },
    modifyCommentClipInfo(clip_info, is_delete = false) {
      const clip_id = clip_info._id;
      const comment_info_list = this.comment_clip_map[clip_id];
      if (!comment_info_list || comment_info_list.length <= 0) return;
      for (let i = 0; i < comment_info_list.length; i++) {
        const comment_info = comment_info_list[i];
        if (is_delete) {
          this.$set(comment_info, 'is_clip_deleted', true);
        } else {
          this.$set(comment_info, 'clip_info', clip_info);
        }
      }
      if (is_delete) {
        this.$delete(this.comment_clip_map, clip_id);
      }
    },
    onCommentModify(comment_info, comment, comment_module) {
      this.showLoading(true);
      const data = {
        comment,
      };
      api_operation_data.changeComment(this.api_type, this.api_key, comment_info.seq, data)
        .then((result) => {
          if (result.error) {
            this.onError('댓글 수정에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', result, 'onCommentModify');
            return;
          }
          this.$set(comment_info, 'comment_html', comment);
          comment_module.onModifyComplete();
          this.onSuccess('댓글이 수정되었습니다.');
        })
        .catch((error) => {
          this.onError('댓글 수정에 실패하였습니다.<br/>잠시후에 다시 시도해 주세요.', error, 'onCommentModify');
        });
    },
    onCommentClipClick(clip_info) {
      this.onClipClick(null, clip_info);
      window.scrollTo(0, 0);
    },
    onCommentDelete(comment_seq) {
      _.remove(this.comment_list, comment => comment.seq === comment_seq);
      this.getCommentCount();
    },
    getCommentCount() {
      api_operation_data.getCommentCount(this.api_type, this.api_key)
        .then((result) => {
          if (result.error) {
            this.$log.error('getCommentCount', result);
          } else {
            this.comment_count = util.getInt(result.comment_count, 0);
          }
        })
        .catch((error) => {
          this.$log.error('getCommentCount', error);
        });
    },
    onClipCommentCountChange(clip_id, comment_count) {
      if (!clip_id) return;
      const clip_info = _.find(this.clip_list, item => item._id === clip_id);
      if (!clip_info) return;
      this.$set(clip_info, 'comment_count', comment_count);
    },
    onCommentCountChange(change_count) {
      this.comment_count += change_count;
    },

    onClipReplyClick(clip_info) {
      const comment_editor = this.$refs.comment_editor;
      const comment_top = comment_editor.offsetTop;
      this.comment_clip_info = clip_info;
      window.scrollTo(0, comment_top - 100);
      this.$nextTick(() => {
        this.$refs.editor_add_comment.setFocus();
      });
    },
    onAddCommentClipDelete() {
      this.comment_clip_info = null;
    },
    onAddCommentCancel() {
      if (this.$refs.editor_add_comment) {
        this.$refs.editor_add_comment.setEditorContent('');
        this.comment_clip_info = null;
      }
    },
    onAddCommentClick() {
      if (!this.$refs.editor_add_comment) return;
      const content = this.$refs.editor_add_comment.getEditorContent();
      const comment = util.trim(content.editor_desc);
      const comment_text = util.trim(content.editor_desc_text);
      if (!comment_text) {
        this.onError('내용을 입력해 주세요.');
        return;
      }
      this.showLoading();
      const data = {
        comment,
        is_reply: false,
      };
      if (this.comment_clip_info) {
        data.clip_id = this.comment_clip_info._id;
        data.clip_info = this.comment_clip_info;
        data.comment_clip_id = this.comment_clip_info._id;
      }
      api_operation_data.createComment(this.api_type, this.api_key, data)
        .then((result) => {
          if (!result || result.error) {
            this.onError('댓글 등록에 실패하였습니다.', result, 'onAddCommentClick');
            return;
          }
          this.onAddCommentComplete(result);
        })
        .catch((error) => {
          this.onError('댓글 등록에 실패하였습니다.', error, 'onAddCommentClick');
        });
    },
    onAddCommentComplete(result, add_only = false) {
      this.getComment(result.comment_seq, add_only);
      if (!add_only) {
        this.comment_clip_info = null;
      }
      this.onClipCommentCountChange(result.comment_clip_id, result.clip_comment_count);
    },
    getComment(comment_seq, add_only = false) {
      const params = {
        with_count: 'y',
      };
      api_operation_data.getComment(this.api_type, this.api_key, comment_seq, params)
        .then((result) => {
          if (!result || result.error) {
            this.onError('일시적인 오류입니다.', result, 'getComment');
            return;
          }
          const comment_count = util.getInt(result.comment_count, 0);
          const comment_info = result.comment_info;
          this.comment_count = comment_count;
          if (!this.comment_list) {
            this.comment_list = [];
          }

          this.comment_list.unshift(comment_info);
          this.addCommentClipInfo(comment_info);
          if (!add_only) {
            this.onAddCommentCancel();
            this.onSuccess('댓글이 등록되었습니다.');
          }
          this.setCommentStart();
        })
        .catch((error) => {
          this.onError('일시적인 오류입니다.', error, 'getComment');
        });
    },
    setCommentStart() {
      if (this.comment_list && this.comment_list.length > 0) {
        this.comment_list_start = this.comment_list[this.comment_list.length - 1].seq;
      } else {
        this.comment_list_start = 0;
      }
    },
    onFileClick(file_info = null) {
      EventBus.emit('operationReferFileViewer', this.operation_info.operation_name, this.refer_file_list, this.c_file_download, file_info, this.viewer_file_types);
    },
    onFileDownloadClick(file_info) {
      if (!this.c_file_download) {
        this.onError('다운로드 권한이 없습니다.');
        return;
      }
      util.downloadFile(document, file_info.file_name, file_info.url);
    },

    onLinkClick() {
      if (!this.is_data_load_complete) return;
      this.beforePopupOpen();
      this.$refs.operationLinkPopup.openPopup(this.operation_info);
    },
    onLinkPopupClose() {
      this.is_info_popup_open = false;
    },
    beforePopupOpen() {
      if (this.$refs.videoPlayer) {
        this.changeVideoStatus(this.PAUSE);
      }
      this.is_doc_edit = false;
      this.is_info_popup_open = true;
    },
    onDownloadClick() {
      api_operation_data.getOperationVideoUrl(this.api_type, this.api_key)
        .then((result) => {
          if (result.error !== 0) {
            this.onError(result.message, result, 'onDownloadClick');
          } else if (!result.download_url) {
            this.onError('동영상을 찾을 수 없습니다.', result, 'onDownloadClick');
          } else {
            const file_name = `${this.operation_info.operation_name ? this.operation_info.operation_name : this.operation_info.operation_code}.mp4`;
            util.downloadFile(document, file_name, result.download_url);
          }
        })
        .catch((error) => {
          this.$log.debug(error);
        });
    },
    moveMainPage() {
      this.$router.push({ name: 'index' });
    },
    onCreateProjectClick() {
      const route = this.$router.resolve({ name: 'videoEditor', params: { project_seq: 'new' }, query: { operation_seq: this.operation_seq, created_by: 'curation' } });
      window.open(route.href, '_blank');
    },
    onOperationInfoClick() {
      if (!this.is_data_load_complete) return;
      this.beforePopupOpen();
      EventBus.emit('onOperationInfoPopupOpen', this.api_type, this.api_key);
    },
    onLoadQuestionnaireListPopup() {
      if (!this.is_data_load_complete) return;
      const is_grant_grade = this.is_admin || this.c_is_operation_owner;
      EventBus.emit('onDynamicTemplateListPopupOpen', this.operation_seq, this.templateReturn, '조사지', 'operation', true, is_grant_grade, this.template_grade);
    },
    onOperationInfoPopupClose() {
      this.is_info_popup_open = false;
    },
    onOperationFileChange(file_type, file_list) {
      if (file_type === this.MODE_REFER) {
        this.refer_file_list = file_list;
      }
    },
    onOperationInfoChange(operation_info, operation_data) {
      if (operation_info) {
        Object.keys(operation_info).forEach((key) => {
          this.$set(this.operation_info, key, operation_info[key]);
        });
      }
      if (operation_data) {
        Object.keys(operation_data).forEach((key) => {
          this.$set(this.operation_data_info, key, operation_data[key]);
        });
      }
    },

    onFocusClipText(is_focus) {
      this.is_focus_clip_text = is_focus;
    },
    onFocusPhaseText(is_focus) {
      this.is_focus_phase_text = is_focus;
    },

    onClipEditorFocus(is_focus) {
      this.is_focus_editor = is_focus;
    },

    onWindowKeyDown(event) {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return true;
      }
      if (this.disable_key_event) {
        return true;
      }
      if (this.is_info_popup_open) {
        return true;
      }
      if (!event.key) {
        return true;
      }
      const key = event.key.toLowerCase();
      const shift = event.shiftKey;
      const ctrl = event.ctrlKey;
      const is_escape = key === 'escape';
      const is_save = ctrl && key === 'enter';
      if (this.is_focus_clip_text || this.is_focus_phase_text || this.is_edit_mode) {
        let is_action = false;
        if (is_escape) {
          if (this.is_focus_clip_text) {
            this.clip_text = '';
            is_action = true;
          } else if (this.is_focus_phase_text) {
            this.add_phase_text = '';
            is_action = true;
          } else if (this.is_edit_mode) {
            this.clearClipEditorMode();
            is_action = true;
          }
        } else if (is_save) {
          if (this.is_focus_clip_text) {
            this.onCreateClipClick();
            is_action = true;
          } else if (this.is_focus_phase_text) {
            this.onCreatePhaseClick();
            is_action = true;
          } else if (this.is_edit_mode) {
            if (this.modify_clip_row) {
              this.modify_clip_row.save();
              is_action = true;
            }
            if (this.modify_phase_row) {
              this.modify_phase_row.save();
              is_action = true;
            }
          }
        }

        if (is_action) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        if (!this.is_edit_mode || this.is_focus_editor) {
          return true;
        }
        if (this.is_edit_mode && key === 'm') {
          return true;
        }
      }
      // shiftKey ctrlKey altKey
      switch (key) {
        case 'arrowleft' :
          this.$refs.videoPlayer.changePlayTime(-this.getSeekSecond(shift, ctrl));
          break;
        case 'arrowright' :
          this.$refs.videoPlayer.changePlayTime(this.getSeekSecond(shift, ctrl));
          break;
        case 'q' :
          this.$refs.videoPlayer.changeRangePosition(true);
          break;
        case 'w' :
          this.$refs.videoPlayer.changeRangePosition(false);
          break;
        case 'k' :
          this.changeVideoStatus();
          break;
        case 'j' :
          this.$refs.videoPlayer.onSpeedDown();
          break;
        case 'l' :
          this.$refs.videoPlayer.onSpeedUp();
          break;
        case 'm':
          if (this.selected_clip_row) {
            this.selected_clip_row.setEditMode();
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          break;
        case ' ' :
          this.changeVideoStatus();
          break;
        case 'f' :
          this.onFullscreenBtnClick();
          break;
        case 'g' :
          this.onWideScreenBtnClick();
          break;
        default:
          return true;
      }
      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    getSeekSecond(shift, ctrl) {
      if (shift) {
        return 10;
      } else if (ctrl) {
        return 30;
      }
      return 1;
    },

    onRangePlayComplete(range_id) {
      this.$log.debug('onRangePlayComplete:', range_id);
    },

    formatSecToTime(sec) {
      return util.formatSecToTime(sec);
    },

    closeConfirmPopup(message = null, is_error = false) {
      EventBus.emit('confirmPopupClose', true, message, is_error);
    },

    setRangeInfo(clip_info, set_start_time = true) {
      this.$refs.videoPlayer.setNewRange(clip_info.start_time, clip_info.end_time, clip_info._id, set_start_time);
      this.onCurrentTimeChange(clip_info.start_time);
    },

    modifyTimeToSec(is_end = false) {
      if (is_end) {
        return parseInt(this.modify_clip_end_hour, 10) * 3600 + parseInt(this.modify_clip_end_minute, 10) * 60 + parseInt(this.modify_clip_end_second, 10);
      }
      return parseInt(this.modify_clip_start_hour, 10) * 3600 + parseInt(this.modify_clip_start_minute, 10) * 60 + parseInt(this.modify_clip_start_second, 10);
    },

    clearClipEditorMode() {
      this.resetDrawSelection();
      this.setDrawEditMode();
      this.is_edit_mode = false;
      this.is_clip_edit_mode = false;
      this.is_phase_edit_mode = false;
      this.is_focus_editor = false;
      if (this.modify_clip_row) {
        this.modify_clip_row.clearEditorMode();
      }
      if (this.modify_phase_row) {
        this.modify_phase_row.clearEditorMode();
      }
      this.modify_clip_row = null;
      this.modify_clip_target = null;
      this.modify_phase_row = null;
      this.modify_phase_target = null;
      this.clearClipSelection();
    },
    clearClipSelection() {
      this.selected_clip_info = null;
      this.selected_clip_row = null;
      this.selected_clip_id = null;
    },

    onClipRowMounted(clip_row, clip_info) {
      this.clip_row_map[clip_info._id] = clip_row;
    },

    onClipRowSelected(clip_row, clip_info) {
      this.selected_clip_row = clip_row;
      this.selected_clip_info = clip_info;
    },

    onCreateClipClick() {
      if (this.c_disable_add_clip) return;
      this.resetDrawSelection();
      const clip_info = {};
      clip_info.desc = this.clip_text;
      if (this.is_drawer_active) {
        clip_info.is_shape = true;
        clip_info.shape_info_list = this.getShapeInfoList();
        const video_time = this.getVideoTime();
        clip_info.start_time = video_time;
        clip_info.end_time = video_time;

        if (!util.trim(clip_info.desc)) {
          clip_info.desc = 'Object marking';
        }
      } else {
        const selected_range = this.$refs.videoPlayer.getSelectedRange();
        clip_info.start_time = selected_range.startTime;
        clip_info.end_time = selected_range.endTime;
      }
      const search_index_info = this.linearSearch(clip_info.start_time, 0, this.asc).data;
      if (search_index_info) {
        clip_info.thumbnail_url = search_index_info.thumbnail_url;
      }
      const data = {
        clip_info,
        clip_count: this.clip_count + 1,
      };
      api_operation_data.createClip(this.api_type, this.api_key, data)
        .then((result) => {
          if (result.error === 0) {
            const clip_info = result.result;
            this.onCreateClipComplete(clip_info);
          } else {
            this.onError('클립 저장에 실패하였습니다.', result, '[onCreateClipClick]');
          }
        });
    },
    onCreateClipComplete(clip_info, add_only = false) {
      clip_info.is_checked = false;
      clip_info.is_phase = false;
      clip_info.phase_id = null;
      clip_info.child_list = [];
      this.clip_list.push(clip_info);
      this.clip_text = '';
      this.addAnnotationUser(clip_info);
      if (!add_only) {
        this.setDrawEditMode(false, false, clip_info.is_shape);
        if (clip_info.is_shape) {
          this.activeDraw(true);
          this.shape_clip_list.push(clip_info);
        }
        this.selected_clip_id = clip_info._id;
      }
    },
    changeVideoStatus(status = null) {
      switch (status) {
        case this.PAUSE:
          this.$refs.videoPlayer.pause();
          break;
        case this.STOP:
          this.$refs.videoPlayer.stop();
          break;
        case this.PLAY:
          this.$refs.videoPlayer.play();
          break;
        default:
          this.$refs.videoPlayer.changePlayStatus();
          break;
      }
    },
    onClipClick(clip_row, clip_info, is_view_mode = true) {
      this.clearClipEditorMode();
      const is_drawer_timer_active = this.is_drawer_timer_active;
      this.clearDrawerTimer();
      if (clip_info.is_shape) {
        this.setAnnotationShape(clip_info);
        this.setDrawEditMode(false, false, is_view_mode);
        this.activeDraw(true);
        if (is_drawer_timer_active) {
          setTimeout(() => {
            this.startDrawerTimer();
          }, 100);
        }
      } else {
        this.activeDraw(false);
        this.setRangeInfo(clip_info);
      }
      this.selected_clip_id = clip_info._id;
    },
    startDrawerTimer() {
      this.clearDrawerTimer(false, false);
      this.drawer_pause_time = this.drawer_timer_start_time;
      this.drawer_pause_timer_id = setInterval(this.onDrawerTimer, 1000);
      this.is_drawer_timer_active = true;
      this.is_drawer_timer_start = true;
    },
    onDrawerTimer() {
      this.drawer_pause_time--;
      if (this.drawer_pause_time <= 0) {
        this.clearDrawerTimer(true, false);
      }
    },
    clearDrawerTimer(is_play = false, active_timer = false) {
      if (this.drawer_pause_timer_id) {
        clearInterval(this.drawer_pause_timer_id);
      }
      this.drawer_pause_timer_id = null;
      this.is_drawer_timer_active = active_timer;
      this.is_drawer_timer_start = false;
      if (is_play) {
        this.changeVideoStatus(this.PLAY);
      }
    },
    onDrawerClick() {
      this.$log.debug(this.isDrawerEditMode());
      if (!this.isDrawerEditMode()) {
        this.changeVideoStatus(this.PLAY);
      }
    },
    onDrawerTimerClick() {
      if (!this.is_drawer_timer_active) {
        return;
      }
      if (this.is_drawer_timer_start) {
        this.clearDrawerTimer(true, false);
      } else {
        this.clearDrawerTimer(true, false);
      }
    },
    onSetPhaseClick(phase_info, index) {
      const phase_id = phase_info._id;
      const data = {
        clip_id_list: [],
      };
      const target_clip_list = [];
      for (let i = 0; i < this.c_checked_clip_list.length; i++) {
        data.clip_id_list.push(this.c_checked_clip_list[i]._id);
        target_clip_list.push(this.c_checked_clip_list[i]);
      }
      api_operation_data.setPhase(this.api_type, this.api_key, phase_id, data)
        .then((result) => {
          if (result.error === 0) {
            target_clip_list.forEach((clip_info) => {
              clip_info.is_checked = false;
              clip_info.phase_id = phase_id;
            });
          } else {
            this.onError(result.message, result, 'onSetPhaseClick');
          }
        });
    },
    onUnSetPhaseClick(clip_info, phase_info, index) {
      if (!phase_info || !phase_info.child_list || phase_info.child_list.length < 1) {
        return;
      }
      const clip_id = clip_info._id;
      const phase_id = phase_info._id;
      const remove_phase = phase_info.child_list.length === 1;
      const data = {
        clip_id,
        remove_phase,
      };
      const params = {
        clip_info,
        phase_id,
        data,
      };
      if (remove_phase) {
        const message = '단계에 남아있는 마지막 클립을 빼면<br/>단계도 삭제됩니다.';
        EventBus.emit('confirmPopupOpen', params, message, this.unsetPhase);
      } else {
        this.unsetPhase(params);
      }
    },
    onClipModifyClick(clip_row, clip_info) {
      if (this.modify_clip_target && this.modify_clip_target._id === clip_info._id) {
        return;
      }
      this.clearClipEditorMode();
      this.clearClipEditorMode();
      this.changeVideoStatus(this.PAUSE);
      this.modify_clip_row = clip_row;
      this.modify_clip_target = clip_info;
      this.is_edit_mode = true;
      this.is_clip_edit_mode = true;
      if (clip_info.is_shape) {
        this.setAnnotationShape(clip_info);
        this.setDrawEditMode(true, false, false);
        this.activeDraw(true);
      } else {
        this.activeDraw(false);
        this.setDrawEditMode(false, false, false, true);
      }
    },
    onClipDeleteClick(clip_info, phase_info, index) {
      let message = '선택한 클립을 삭제하시겠습니까?';
      const data = {
        clip_count: this.clip_count - 1,
        remove_phase: false,
        phase_id: null,
      };
      if (phase_info && phase_info.child_list && phase_info.child_list.length === 1) {
        data.phase_id = phase_info._id;
        data.remove_phase = true;
        message = '단계에 남아있는 마지막 클립을 삭제하면<br/>단계도 함께 삭제됩니다.';
      }
      EventBus.emit('confirmPopupOpen', { clip_info, data }, message, this.deleteClip);
    },
    deleteClip(params) {
      const clip_info = params.clip_info;
      api_operation_data.deleteClip(this.api_type, this.api_key, clip_info._id, params.data)
        .then((result) => {
          if (result.error === 0) {
            this.clip_list = _.filter(this.clip_list, item => item._id !== clip_info._id);
            this.shape_clip_list = _.filter(this.shape_clip_list, item => item._id !== clip_info._id);
            if (params.data.remove_phase) {
              this.clip_list = _.filter(this.clip_list, item => item._id !== params.data.phase_id);
            }
            delete this.clip_row_map[clip_info._id];
            this.addAnnotationUser(clip_info, true);
            this.modifyCommentClipInfo(clip_info, true);
            this.onSuccess('클립이 삭제되었습니다.');
          } else {
            this.onError('클립이 삭제되지 않았습니다.', result, 'deleteClip');
          }
          this.closeConfirmPopup();
          this.clearClipEditorMode();
        });
    },
    onClipSaveClick(clip_info, modify_info, index) {
      this.resetDrawSelection();
      if (clip_info.is_shape) {
        const video_time = this.getVideoTime();
        modify_info.is_shape = true;
        modify_info.start_time = video_time;
        modify_info.end_time = video_time;
        modify_info.shape_info_list = this.getShapeInfoList();
      }
      const search_index_info = this.linearSearch(modify_info.start_time, 0, this.asc).data;
      this.$log.debug(modify_info.start_time, search_index_info);
      modify_info.thumbnail_url = search_index_info.thumbnail_url;
      api_operation_data.updateClip(this.api_type, this.api_key, clip_info._id, modify_info)
        .then((result) => {
          const updated_clip_info = result.result;
          if (result.error === 0) {
            clip_info.start_time = updated_clip_info.start_time;
            clip_info.end_time = updated_clip_info.end_time;
            clip_info.desc = updated_clip_info.desc;
            clip_info.thumbnail_url = updated_clip_info.thumbnail_url;
            clip_info.shape_info_list = updated_clip_info.shape_info_list;
            this.onSuccess('수정되었습니다.');
          } else {
            this.onError(result.message, result, 'onClipSaveClick');
            return;
          }
          this.modifyCommentClipInfo(clip_info, false);
          this.clearClipEditorMode();
        });
    },
    onClipModifyCancelClick(clip_row, clip_info) {
      this.onClipClick(clip_row, clip_info);
    },
    onRangeChange(range) {
      if (this.is_clip_edit_mode && this.modify_clip_row) {
        this.modify_clip_row.onRangeChange(range);
      }
    },

    onCreatePhaseClick() {
      if (!this.c_has_checked_clip) {
        return;
      }
      const data = {
        phase_desc: this.add_phase_text,
        clip_id_list: [],
      };
      const target_clip_list = [];
      for (let i = 0; i < this.c_checked_clip_list.length; i++) {
        data.clip_id_list.push(this.c_checked_clip_list[i]._id);
        target_clip_list.push(this.c_checked_clip_list[i]);
      }
      api_operation_data.createPhase(this.api_type, this.api_key, data)
        .then((result) => {
          if (result.error === 0) {
            const phase = result.phase;
            phase.child_list = [];
            phase.start_time = -1;
            phase.end_time = -1;
            this.clip_list.push(phase);
            target_clip_list.forEach((clip_info) => {
              clip_info.is_checked = false;
              clip_info.phase_id = result.phase_id;
            });
            this.add_phase_text = '';
          } else {
            this.onError(result.message, result, 'onCreatePhaseClick');
          }
        });
    },
    onPhaseClick(phase_info, index) {
      this.clearClipEditorMode();
      this.activeDraw(false);
      this.setRangeInfo(phase_info);
      this.selected_clip_id = phase_info._id;
    },
    onPhaseModifyClick(phase_row, phase_info, index) {
      if (this.modify_phase_target && this.modify_phase_target._id === phase_info._id) {
        return;
      }
      this.clearClipEditorMode();
      this.modify_phase_row = phase_row;
      this.modify_phase_target = phase_info;
      this.is_edit_mode = true;
      this.is_phase_edit_mode = true;
      this.activeDraw(false);
      this.setDrawEditMode(false, false, false, true);
    },
    onPhaseDeleteClick(phase_info, index) {
      let message = '선택한 단계를 삭제하시겠습니까?';
      EventBus.emit('confirmPopupOpen', phase_info, message, this.deletePhase);
    },
    deletePhase(phase_info) {
      api_operation_data.deletePhase(this.api_type, this.api_key, phase_info._id)
        .then((result) => {
          if (result.error === 0) {
            if (phase_info.child_list) {
              phase_info.child_list.forEach((clip_info) => {
                clip_info.phase_id = null;
              });
            }
            this.clip_list = _.filter(this.clip_list, item => item._id !== phase_info._id);
            this.onSuccess('단계가 삭제되었습니다.');
          } else {
            this.onError('단계가 삭제되지 않았습니다.', result, 'deletePhase');
          }
          this.closeConfirmPopup();
          this.clearClipEditorMode();
        });
    },
    onPhaseSaveClick(phase_info, modify_phase_text, index) {
      api_operation_data.updatePhase(this.api_type, this.api_key, phase_info._id, modify_phase_text)
        .then((result) => {
          if (result.error === 0) {
            phase_info.desc = result.result.desc;
          } else {
            this.onError(result.message, result, 'onPhaseSaveClick');
          }
          this.clearClipEditorMode();
        });
    },
    onPhaseModifyCancelClick() {
      this.clearClipEditorMode();
    },
    onPlayerReady() {
      // this.loadData('drive2', this.$route.params.operation_seq);
      // this.$log.debug(this.media_info);
      // const poster = '/static/storage/enterprise/2836b830-d983-11eb-8695-4f1fba2797f5/operation/c7ea69c0-a337-11ec-a61d-e7b60111d4f4/image/thumb_1647222056_hNWiE.jpg';
      const poster = this.media_info.thumbnail_url;
      // alert('dash');
      this.stream_source = [];
      this.stream_source.push({
          type: 'video/mp4',
          src: this.media_info.streaming_url,
          // src: '/static/storage/enterprise/2836b830-d983-11eb-8695-4f1fba2797f5/operation/c7ea69c0-a337-11ec-a61d-e7b60111d4f4/video/Trans_c7ea69c0-a337-11ec-a61d-e7b60111d4f4_12000.mp4',
          poster,
        });
      // }
      // this.stream_options.limit_resolution = media_info.proxy_max_height;
      this.stream_options.default_resolution = 720;
      this.stream_options.show_range_selector = true;
      this.stream_options.use_out_controller = true;
      this.stream_options.show_add_index_button = false;
      this.stream_options.use_resource_ratio = true;
      this.stream_options.use_screen_mode_change_event = true;
      this.stream_options.show_wide_screen_button = true;
      this.stream_options.use_add_on = true;
      this.stream_options.use_draw_add_on = true;
      if (!this.c_is_curation_editable) {
        this.stream_options.show_range_selector = false;
        this.stream_options.show_range_bar = true;
      }
      this.stream_options.show_shortcut_button = true;
      this.stream_options.shortcut_list = [
        {
          key: ['Q'],
          text: '시작마커를 현재 플레이 지점으로 이동',
          lang: '시작마커를 현재 플레이 지점으로 이동',
        },
        {
          key: ['W'],
          text: '종료마커를 현재 플레이 지점으로 이동',
          lang: '종료마커를 현재 플레이 지점으로 이동',
        },
        {
          key: ['Spacebar'],
          text: '플레이, 일시정지',
          lang: '플레이, 일시정지',
        },
        {
          key: ['K'],
          text: '일시정지',
          lang: '일시정지',
        },
        {
          key: ['J'],
          text: '재생속도 느리게 (최소 0.5배속)',
          lang: '재생속도 느리게 (최소 0.5배속)',
        },
        {
          key: ['L'],
          text: '재생속도 빠르게 (최대 4배속)',
          lang: '재생속도 빠르게 (최대 4배속)',
        },
        {
          key: ['F'],
          text: '전체화면 토글',
          lang: '전체화면 토글',
        },
        {
          key: ['G'],
          text: '노말뷰, 와이드뷰 토글',
          lang: '노말뷰, 와이드뷰 토글',
        },
        {
          key: ['→'],
          text: '1초 앞으로',
          lang: '1초 앞으로',
        },
        {
          key: ['←'],
          text: '1초 뒤로',
          lang: '1초 뒤로',
        },
        {
          key: ['Shift', '+', '→'],
          text: '10초 앞으로',
          lang: '10초 앞으로',
        },
        {
          key: ['Shift', '+', '←'],
          text: '10초 뒤로',
          lang: '10초 뒤로',
        },
        {
          key: ['Ctrl', '+', '→'],
          text: '30초 앞으로',
          lang: '30초 앞으로',
        },
        {
          key: ['Ctrl', '+', '←'],
          text: '30초 뒤로',
          lang: '30초 뒤로',
        },
      ];
      this.$refs.videoPlayer.initPlayer(this.stream_source, this.stream_options, this.media_info);
    },
    onCanPlay() {
      if (this.cid) {
        const clip_info = _.find(this.c_clip_list, clip_info => clip_info._id === this.cid);
        if (clip_info) {
          this.onClipClick(null, clip_info);
        }
        this.cid = null;
      }
    },
    onStreamSourceChange() {
      if (this.play_params_clip && this.selected_clip_info) {
        this.setRangeInfo(this.selected_clip_info);
        this.play_params_clip = false;
      }
    },
    onCurrentTimeChange(current_time, is_play = false, is_seek = false) {
      if (this.current_time === current_time) return;
      this.current_time = current_time;
      if (this.is_edit_mode) return;
      if (this.isDrawerEditMode()) return;
      let shape_clip_info = null;
      if (is_play || is_seek) {
        shape_clip_info = this.checkShapeClip(current_time);
        if (!shape_clip_info) {
          this.activeDraw(false);
          return;
        }
      } else {
        return;
      }
      if (!is_play && is_seek) {
        if (shape_clip_info) {
          this.$refs.annotationDraw.setShapeInfoList(shape_clip_info.shape_info_list);
          this.selected_clip_id = shape_clip_info._id;
          this.setDrawEditMode(false, false, true);
          this.activeDraw(true);
        }
        return;
      }
      if (is_play && !this.is_edit_mode) {
        if (!this.is_focus_clip_text) {
          if (shape_clip_info) {
            this.changeVideoStatus(this.PAUSE);
            this.clip_row_map[shape_clip_info._id].onClipClick();
            this.startDrawerTimer();
          }
        }
      }
    },
    checkShapeClip() {
      const filter_list = _.filter(this.shape_clip_list, clip_info => clip_info.start_time >= this.current_time && clip_info.start_time < this.current_time + 0.5);
      if (!filter_list || filter_list.length <= 0) return null;
      const sort_list = _.orderBy(filter_list, ['start_time'], ['asc']);
      if (sort_list) {
        return sort_list[0];
      }
      return null;
    },

    isIndexTimestamp(timestamp, indexInfo) {
      if (indexInfo != null) {
        return timestamp >= indexInfo.start_time && timestamp < indexInfo.end_time;
      }

      return false;
    },

    linearSearch(timestamp, startIndex, mode) {
      const result = {
        index: -1,
        data: null,
      };

      if (this.index_list_length <= 0) {
        return result;
      }

      if (mode !== this.desc) {
        if (startIndex === 0 && timestamp < this.index_list[0].start_time) {
          result.index = 0;
          result.data = this.index_list[0];
          return result;
        }

        for (let i = startIndex; i < this.index_list_length; i++) {
          const indexInfo = this.index_list[i];
          if (this.isIndexTimestamp(timestamp, indexInfo) === true) {
            result.index = i;
            result.data = indexInfo;
            return result;
          }
        }

        result.index = this.index_list_length - 1;
        result.data = this.index_list[this.index_list_length - 1];
        return result;
      }

      for (let i = startIndex; i >= 0; i--) {
        const indexInfo = this.index_list[i];
        if (this.isIndexTimestamp(timestamp, indexInfo) === true) {
          result.index = i;
          result.data = indexInfo;
          return result;
        }
      }

      result.index = 0;
      result.data = this.index_list[0];
      return result;
    },

    // 전체화면 버튼 클릭 이벤트
    onFullscreenBtnClick() {
      if (this.is_fullscreen) {
        this.closeFullscreen();
      } else {
        this.openFullscreen(this.$refs.curation_contents_wrapper);
      }
      this.$refs.videoPlayer.changeFullScreenStatus(this.is_fullscreen);
    },
    onWideScreenBtnClick() {
      this.is_wide_mode = !this.is_wide_mode;
      this.$refs.videoPlayer.changeWideScreenStatus(this.is_wide_mode);
      this.resizeContents();
    },

    // 전체화면
    openFullscreen(target_element) {
      if (target_element.requestFullscreen) {
        target_element.requestFullscreen();
      } else if (target_element.mozRequestFullScreen) { /* Firefox */
        target_element.mozRequestFullScreen();
      } else if (target_element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        target_element.webkitRequestFullscreen();
      } else if (target_element.msRequestFullscreen) { /* IE/Edge */
        target_element.msRequestFullscreen();
      } else {
        return;
      }
      this.is_fullscreen = true;

      document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
      document.addEventListener('mozfullscreenchange', this.onFullScreenChange, false);
      document.addEventListener('MSFullscreenChange', this.onFullScreenChange, false);
      document.addEventListener('fullscreenchange', this.onFullScreenChange, false);
      this.resizeContents();
    },

    onFullScreenChange() {
      const fullscreen_element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
      if (!fullscreen_element) {
        this.onCloseFullScreen();
      }
    },

    // 전체화면 닫기
    closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      } else {
        return;
      }
      this.onCloseFullScreen();
    },

    onCloseFullScreen() {
      this.is_fullscreen = false;

      document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
      document.removeEventListener('mozfullscreenchange', this.onFullScreenChange, false);
      document.removeEventListener('MSFullscreenChange', this.onFullScreenChange, false);
      document.removeEventListener('fullscreenchange', this.onFullScreenChange, false);

      this.$refs.videoPlayer.changeFullScreenStatus(this.is_fullscreen);
      this.resizeContents();
    },

    resizeContents() {
      this.$nextTick(() => {
        this.onWindowResize();
      });
    },

    preventEvent() {
      return false;
    },
  },
};
</script>
