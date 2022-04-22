<template>
  <div class="operation_create" id="prevent_drag" ref="prevent_drag">
    <template>
      <div class="content_layer" ref="contentWrapper">
        <div class="table_info">
          <span class="title">업로드</span>
          <span class="require_label">*</span>
          <span>이 표시는 필수입력 사항입니다.</span>
        </div>
        <ul class="operation_info" style="background-color: #fff;">
          <li class="info_row popup_dim hide">
            <label>
              <div><span>종류</span><span class="require_label">*</span></div>
            </label>
            <div class="info">
              <div class="input_wrapper f_w_140">
                <select v-model="mode">
                  <option v-for="type_info in mode_list" v-bind:value="type_info.id">{{ type_info.name }}</option>
                </select>
              </div>
            </div>
          </li>
          <li class="info_row">
            <label>
              <div><span>제목</span><span class="require_label">*</span></div>
            </label>
            <div class="info">
              <div class="input_wrapper">
                <input type="text" :placeholder="'제목을 입력하세요. (최대 100자)'" maxlength="100" ref="operation_name" v-model="operation_info.operation_name" />
                <!--                <span class="verify_icon" v-bind:class="{ done: c_verify_operation_name }"></span>-->
              </div>
            </div>
          </li>
          <li class="info_row">
            <label>
              <div><span>상세 내용</span></div>
            </label>
            <div class="info">
              <TinyEditorBasicMode ref="editor" v-bind:set_desc="operation_data.doc_html" set_height="250px"></TinyEditorBasicMode>
            </div>
          </li>
          <li class="info_row">
            <label>
              <div>
                <span>
                  <template v-if="mode === 'file'">이미지 업로드</template>
                  <template v-else>영상 업로드</template>
                </span>
                <span class="require_label">*</span>
              </div>
            </label>
            <div class="info direction_column">
              <div class="upload_info mb_10">
                <div class="flex_row_vcenter mr_10">
                  <div class="btn pad_5 empty_blue h26 r4" v-on:click="addUploadFile">파일추가</div>
                  <template v-if="mode === MODE_FILE">
                    <div class="btn pad_5 empty_blue h26 r4 ml_6" v-on:click="addUploadFolder">폴더추가</div>
                  </template>
                </div>
                <div class="upload_progress_info">
                  <div class="upload_progress_percent_text" v-bind:class="{ on: video_upload_progress.is_upload_progress }">{{ c_video_upload_progress_percent }}</div>
                  <div class="upload_progress_percent_bar_bg" v-bind:class="{ on: video_upload_progress.is_upload_progress }">
                    <div class="upload_progress_percent_bar" v-bind:style="{ width: c_video_upload_progress_percent }"></div>
                  </div>
                  <div class="file_info" v-html="c_video_upload_file_info"></div>
                </div>
              </div>
              <div class="file_upload_wrapper">
                <template v-if="mode === MODE_FILE">
                  <ModuleOperationFolderUpload ref="folderUploader" v-bind:upload_type="MODE_FILE" v-bind:file_types="mode_file_accept_list" v-bind:remain_size="c_remain_size" v-on:onUploadStatusChange="onUploadStatusChange" v-on:onProgressChange="onProgressChange"></ModuleOperationFolderUpload>
                </template>
                <template v-else>
                  <ModuleOperationFileUpload ref="videoFileUploader"  v-bind:upload_type="MODE_VIDEO" v-bind:remain_size="c_remain_size" v-on:onUploadStatusChange="onUploadStatusChange" v-on:onProgressChange="onProgressChange"></ModuleOperationFileUpload>
                </template>
              </div>
            </div>
          </li>
          <li class="divider"></li>

          <li class="info_row">
            <label>
              <div><span>수술 일자</span></div>
            </label>
            <div class="info" style="overflow: visible;">
              <div class="input_wrapper datepicker_icon f_w_130">
                <datepicker v-model="selected_date" :language="date_locale_ko" :format="dateFormatter"></datepicker>
              </div>
              <div class="input_wrapper time_select">
                <select v-model="operation_info.hour">
                  <option v-for="num of hours" :value="num">{{ num }}시</option>
                </select>
              </div>
              <div class="input_wrapper time_select">
                <select v-model="operation_info.minute">
                  <option v-for="num of minutes" :value="num">{{ num }}분</option>
                </select>
              </div>

            </div>
          </li>
          <li class="info_row">
            <label>
              <div><span>환자 정보</span></div>
            </label>
            <div class="info">
              <div class="label mr_10">나이</div>
              <div class="input_wrapper f_w_50">
                <input type="text" maxlength="3" v-model="operation_info.patient_age"
                       v-on:keydown="keyDown($event)" v-on:keyup="keyUp($event)" v-on:focusout="focusOut($event, 'patient_age', 'operation_info')" placeholder="" />
              </div>
              <div class="label ml_20 mr_10">성별</div>
              <div class="flex_row_vcenter flex">
                <div class="radio" v-on:click="onPatientSexSelect('M')"><span class="check_round" v-bind:class="{ on: operation_info.patient_sex === 'M' }"></span><span class="radio_text">남성</span></div>
                <div class="radio" v-on:click="onPatientSexSelect('F')"><span class="check_round" v-bind:class="{ on: operation_info.patient_sex === 'F' }"></span><span class="radio_text">여성</span></div>
              </div>
            </div>
          </li>
          <li class="info_row">
            <label>
              <div><span>카테고리</span></div>
            </label>
            <div class="info direction_column">
              <template v-for="medical_list in c_medical_info">
                <div class="select_option_list">
                  <template v-for="medical_info in medical_list">
                    <div class="select_option">
                      <div v-on:click="onMedicalClick(medical_info)">
                        <template v-if="medical_info.sub">
                          <span class="toggle_medical_sub" :class="{ on: medical_info.open_sub || onMedicalSubCheck(medical_info) }"></span>
                        </template>
                        <template v-else>
                          <span class="check_box select_check_box" v-bind:class="{ on: medical_info.selected }"></span>
                        </template>
                        <span class="select_text" v-bind:class="{ on: medical_info.selected }">{{ medical_info.text }}</span>
                      </div>
                    </div>
                  </template>
                </div>
                <template v-for="medical_info in medical_list">
                  <div class="select_option_list" style="background-color: #f5f5f5;" v-if="medical_info.sub" v-show="medical_info.open_sub">
                    <template v-for="(medical_sub, sub_key) in medical_info.sub">
                      <div class="select_option">
                        <div v-on:click="onMedicalClick(medical_sub)">
                          <span class="check_box select_check_box" v-bind:class="{ on: medical_sub.selected }"></span>
                          <span class="select_text" v-bind:class="{ on: medical_sub.selected }">{{ medical_sub.text }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </template>
            </div>
          </li>
<!--          <li class="info_row">-->
<!--            <label>-->
<!--              <div><span>대표 썸네일</span></div>-->
<!--            </label>-->
<!--            <div class="info">-->
<!--              <div class="thumbnail_wrapper">-->
<!--                <div class="thumbnail_image_box" id="thumbnail_image_box" ref="thumbnail_image_box" v-on:click="onAddThumbnailImageClick" v-bind:class="{ selected: c_thumbnail_image }">-->
<!--                  <img v-if="c_thumbnail_image" v-bind:src="c_thumbnail_image" id="thumbnail_image" alt="대표 이미지" />-->
<!--                </div>-->
<!--                <div class="desc_text" v-html="'파일을 선택하거나 마우스로 끌어놓으세요.<br/>(등록하지 않을시 임의로 지정됩니다.)'"></div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </li>-->
        </ul>
        <div class="hidden_input_file"><input type="file" id="thumbnail_input_file" ref="thumbnail_input_file" v-on:change="onThumbnailFileSelected" accept="image/x-png,image/jpeg" /></div>
      </div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash';
import Datepicker from 'vuejs-datepicker';
import { ko, en } from 'vuejs-datepicker/dist/locale';
import moment from 'moment/moment';
import { mapActions, mapGetters } from 'vuex';
import api_operation from '../../../api/ApiOperation';
import api_data from '../../../api/ApiData';
// import api_static_data from '../../../api/ApiStaticData';
import ModuleOperationFileUpload from '../../../components/ModuleOperationFileUpload';
import ModuleOperationFolderUpload from '../../../components/ModuleOperationFolderUpload';
// import OperationOptionSelector from '../../../components/operation/module/option/OperationOptionSelector';
import TinyEditorBasicMode from '../../../components/editor/TinyEditorBasicMode';
import * as Constants from '../../../constants';
import util from '../../../utils/util';
import EventBus from '../../../utils/eventbus';
import BaseMixin from '../../../components/Mixins/BaseMixin';

export default {
  name: 'OperationCreate',
  components: {  Datepicker, TinyEditorBasicMode, ModuleOperationFileUpload,  ModuleOperationFolderUpload },
  props: ['folder_seq', 'type'],
  mixins: [BaseMixin],
  data() {
    return {
      MODE_VIDEO: Constants.MODE_VIDEO,
      MODE_REFER: Constants.MODE_REFER,
      MODE_FILE: Constants.MODE_FILE,
      dragAndDropCapable: false,
      is_verify_operation_code_error: false,
      is_verify_operation_code: true,
      is_operation_created: false,
      is_upload_progress: false,
      is_video_upload_progress: false,
      is_refer_upload_progress: false,
      is_upload_complete: false,
      is_upload_error: false,
      upload_target: Constants.MODE_VIDEO,
      total_file_size: 0,
      total_progress: 0,
      date_locale_ko: ko,
      operation_type: null,
      operation_types: {},
      operation_info: {
        operation_type: null,
        operation_name: null,
        operation_code: '',
        operation_date: null,
        patient_age: null,
        patient_sex: '',
        hour: 0,
        minute: 0,
        folder_seq: null,
      },
      operation_data: {
        type: Constants.OPERATION_TYPE_NORMAL,
        doc_html: null,
        category_list: [],
        mento_group_seq: null,
        hashtag: null,
        is_open_video: false,
        video_download: false,
        file_download: false,
        mode: 'operation',
      },
      selected_date: moment().format('YYYY-MM-DD'),
      operation_seq: 0,
      upload_count: 0,
      verify_text: '',
      verify_class: '',
      last_check_code: null,
      is_open: false,
      hours: [],
      minutes: [],
      video_upload_progress: {
        is_upload_progress: false,
        total_file_count: 0,
        upload_count: 0,
        total_progress: 0,
      },
      is_alert: false,
      alert_message: null,
      video_file_size: 0,
      refer_file_size: 0,
      medical_info: null,
      folder_options: {
        extend_all: false,
        show_add_btn: true,
        // width: 480,
        // height: 400,
        node_max_width: 300,
        select_folder_seq: null,
        none_display_folder: null,
        display_node_css: {
          boxing: true,
        },
        check_auth: true,
      },
      select_thumbnail_file_info: null,
      thumbnail_image: null,
      doc_html: null,
      is_extra_hide: true,
      mode: 'operation',
      mode_list: [
        { id: 'operation', name: '동영상' },
        // { id: 'file', name: '이미지' },
      ],
      // mode_file_accept_list: [Constants.IMAGE, Constants.PDF],
      mode_file_accept_list: [Constants.IMAGE],
      tag_map: {},
      tag_list: [],
      tag: null,
    };
  },
  created() {
    for (let i = 0; i < 60; i++) {
      if (i < 24) {
        this.hours.push(i);
      }
      this.minutes.push(i);
    }
    this.folder_options.select_folder_seq = util.getInt(this.folder_seq, null);
    this.operation_data.type = this.c_is_mentoring ? Constants.OPERATION_TYPE_MENTORING : Constants.OPERATION_TYPE_NORMAL;
    this.onChangeDatepickerLang();
  },
  mounted() {
    this.dragAndDropCapable = this.determineDragAndDropCapable();
    this.operation_info.operation_type = this.operation_type;
    this.initData();
  },
  beforeDestroy() {
    this.removeEventListener();
  },
  computed: {
    ...mapGetters(['operation_options', 'user_stored_data', 'lang', 'group_seq', 'lang']),
    c_tag_list() {
      const tag_list = [
        new Array(5),
        new Array(5),
      ];
      let index = 0;
      for (let tag_index = 0; tag_index < this.tag_list.length; tag_index++) {
        const tag = this.tag_list[tag_index];
        if (this.tag_map[tag] !== true) {
          continue;
        }
        const i = Math.floor(index / 5);
        const j = index % 5;
        tag_list[i][j] = tag;
        index++;
        if (index >= 10) break;
      }
      return tag_list;
    },
    c_is_max_tag() {
      if (this.c_tag_list[1][4]) return true;
      return false;
    },
    c_is_mentoring() {
      return this.type === Constants.CREATE_MENTORING;
    },
    c_verify_operation_name() {
      return _.trim(this.operation_info.operation_name) !== '';
    },
    c_video_upload_progress_percent() {
      if (!this.video_upload_progress.is_upload_progress) {
        return '0';
      }
      return `${Math.floor(this.video_upload_progress.total_progress)}%`;
    },
    c_video_upload_file_info() {
      let size_info;
      if (this.c_file_size <= this.c_max_size) {
        size_info = `<span class='common_text_blue'>${this.c_file_size_str}</span>`;
      } else {
        size_info = `<span class='common_text_red'>${this.c_file_size_str}</span>`;
      }
      size_info = `${size_info}<span> / ${this.c_max_size_str}</span>`;
      if (this.video_upload_progress.total_file_count === 0) {
        return size_info;
      }
      return `<span class="pr_10">${this.video_upload_progress.upload_count} / ${this.video_upload_progress.total_file_count}</span>${size_info}`;
    },
    c_remain_size() {
      return this.c_max_size - this.c_file_size;
    },
    c_remain_size_str() {
      return util.fileSizeText(this.c_remain_size);
    },
    c_file_size() {
      return this.video_file_size + this.refer_file_size;
    },
    c_file_size_str() {
      return util.fileSizeText(this.c_file_size, 0);
    },
    c_max_size() {
      if (!this.group_info) {
        return 0;
      }
      return this.group_info.group_max_storage_size - this.group_info.group_used_storage_size;
    },
    c_max_size_str() {
      return util.fileSizeText(this.c_max_size);
    },
    c_medical_info() {
      const medical_info_list = [];
      if (!this.medical_info || !this.medical_info.length) {
        return medical_info_list;
      }
      for (let i = 0; i < this.medical_info.length; i += 4) {
        const sub_list = [];
        for (let j = 0; j < 4; j++) {
          const index = i + j;
          if (index >= this.medical_info.length) {
            break;
          }
          sub_list.push(this.medical_info[index]);
        }
        medical_info_list.push(sub_list);
      }
      return medical_info_list;
    },
    c_thumbnail_image() {
      if (this.thumbnail_image) {
        return this.thumbnail_image;
      }
      return null;
    },
  },
  watch: {
    lang() {
      this.onChangeDatepickerLang();
      this.getMedicalData();
    },
    // operation_type(type) {
    //   if (!this.$refs.operationOptionSelector) return;
    //   if (this.operation_options) {
    //     this.$refs.operationOptionSelector.setOptions(this.operation_options.options[type]);
    //   } else {
    //     this.$refs.operationOptionSelector.setOptions(null);
    //   }
    //   this.operation_info.operation_type = type;
    // },
  },
  methods: {
    ...mapActions(['ReloadMyGroupInfo']),
    onChangeDatepickerLang() {
      if (this.lang === 'kor') {
        this.date_locale_ko = ko;
      } else {
        this.date_locale_ko = en;
      }
    },
    onMedicalSubCheck(medical) {
      return _.every(medical.sub, { selected: true });
    },
    async initData() {
      this.showLoading();
      try {
        // if (this.user_stored_data.operation_mode) {
        this.mode = 'operation';
        // }
        await this.getMedicalData();
        this.addEventListener();
        this.is_open = true;
        this.showLoading(false);
      } catch (e) {
        this.onInitDataError('정보를 확인할 수 없습니다. 잠시후에 다시 시도해 주세요.', e, 'initData');
      }
    },
    setOpenVideo() {
      this.operation_data.is_open_video = !this.operation_data.is_open_video;
    },
    determineDragAndDropCapable() {
      const div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window && 'FileReader' in window;
    },
    addEventListener() {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
        this.$refs.prevent_drag.addEventListener(event_name, this.preventDragDefault, false);
      });
      // this.$refs.thumbnail_image_box.addEventListener('drop', this.onFileDrag, false);
    },
    removeEventListener() {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
        this.$refs.prevent_drag.removeEventListener(event_name, this.preventDragDefault);
      });
      // this.$refs.thumbnail_image_box.removeEventListener('drop', this.onFileDrag);
    },
    preventDragDefault($event) {
      $event.preventDefault();
      $event.stopPropagation();
      if ($event.dataTransfer) {
        if ($event.target.id !== 'thumbnail_image_box' && $event.target.id !== 'thumbnail_image') {
          $event.dataTransfer.effectAllowed = 'none';
          $event.dataTransfer.dropEffect = 'none';
        } else {
          $event.dataTransfer.effectAllowed = 'copy';
          $event.dataTransfer.dropEffect = 'copy';
        }
      }
      return false;
    },
    onFileDrag({ dataTransfer }) {
      if (dataTransfer && dataTransfer.files) {
        const file_info = dataTransfer.files[0];
        if (file_info && Constants.IMAGE_TYPE_REGEXP.test(file_info.type)) {
          this.changeThumbnailPreviewSrc(file_info);
        }
      }
    },

    onAddThumbnailImageClick() {
      if (this.$refs.thumbnail_input_file) {
        this.$refs.thumbnail_input_file.click();
      }
    },
    onThumbnailFileSelected() {
      if (this.$refs.thumbnail_input_file && this.$refs.thumbnail_input_file.files) {
        this.changeThumbnailPreviewSrc(this.$refs.thumbnail_input_file.files[0]);
      }
    },
    changeThumbnailPreviewSrc(file_info) {
      if (file_info) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.thumbnail_image = e.target.result;
          this.select_thumbnail_file_info = file_info;
        };

        reader.readAsDataURL(file_info);
      }
    },
    onMedicalClick(medical_info) {
      if (medical_info.sub) {
        this.$set(medical_info, 'open_sub', !medical_info.open_sub);
      } else {
        this.$set(medical_info, 'selected', !medical_info.selected);
      }
    },
    onInitDataError(message, error = null) {
      this.onError(message, error);
      this.onClosePopup();
    },
    async getOperationOptions() {
      const operation_options = await api_static_data.getOperationOptions();
      this.$store.commit('setOperationOptions', operation_options);
      this.setOperationType();
    },
    async getMedicalData() {
      try {
        const result = await api_data.getMedicalInfo();
        this.$log.debug(result);
        if (result) {
          this.medical_info = result.medical_info;
        }
      } catch (e) {
        this.$log.error(e);
      }
    },
    setOperationType() {
      this.operation_types = this.operation_options.operation_types;
      if (this.user_stored_data.operation_type) {
        const find_result = _.find(this.operation_types, { type: this.user_stored_data.operation_type });
        if (find_result) {
          this.operation_type = this.user_stored_data.operation_type;
          return;
        }
      }
      this.operation_type = this.operation_types[0].type;
      this.$store.commit('updateUserStoredData', { operation_type: this.operation_type });
    },
    onPatientSexSelect(value) {
      this.operation_info.patient_sex = value;
    },
    dateFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },

    async onConfirmClick() {
      this.upload_count = 0;
      if (this.is_upload_progress) {
        return;
      }
      if (this.is_upload_error) {
        this.is_upload_error = false;
        this.uploadStart();
        return;
      }

      if (!this.checkForm()) {
        return;
      }

      this.showLoading(true, '동영상을 등록중입니다. 잠시만 기다려주세요.', 0.7);
      this.is_upload_progress = true;

      if (this.operation_info.patient_age) {
        const patient_age = this.operation_info.patient_age.replace(/[^0-9]/g, '');
        if (patient_age) {
          this.operation_info.patient_age = patient_age;
        } else {
          this.operation_info.patient_age = null;
        }
      } else {
        this.operation_info.patient_age = null;
      }
      this.operation_info.mode = this.mode;
      // const selected_options = this.$refs.operationOptionSelector.getSelectedOptions();
      const selected_options = {};
      const data = {
        operation_info: this.operation_info,
        meta_data: selected_options,
        operation_data: this.operation_data,
      };
      api_operation.createOperationReg(data)
        .then((result) => {
          this.$log.debug(result);
          if (result.error !== 0 || !result.operation_seq) {
            this.onCreateError(result, '동영상등록에 실패하였습니다.');
            return;
          }

          this.operation_seq = result.operation_seq;
          this.is_operation_created = true;

          this.$store.commit('updateUserStoredData', { operation_type: this.operation_type, operation_mode: this.mode });

          this.uploadThumbnail(this.operation_seq);
          this.uploadStart();
        })
        .catch((error) => {
          this.onCreateError(error, '동영상등록에 실패하였습니다.');
        });
    },
    onCreateError(error, message) {
      this.is_upload_progress = false;
      this.onError(message, error);
    },
    showErrorToast(message) {
      this.showToast(message, true);
    },
    showCompleteToast(message) {
      this.showToast(message, false);
    },
    showToast(message, is_error = false) {
      const options = {
        duration: 3,
        vertical: Constants.BOTTOM,
        horizon: Constants.CENTER,
        color_type: is_error ? Constants.RED : Constants.BLUE,
        text_align: Constants.CENTER,
      };
      EventBus.emit('showToastMessage', message, options);
    },
    uploadThumbnail(operation_seq) {
      if (!this.select_thumbnail_file_info) return;
      const upload_form_data = new FormData();
      upload_form_data.append('thumbnail', this.select_thumbnail_file_info);

      api_operation.uploadThumbnailImage(operation_seq, upload_form_data)
        .then(async (result) => {
          if (!result || result.error !== 0 || !result.thumbnail_url) {
            this.$log.error(result);
          } else {
            this.$log.debug(result);
          }
        });
    },

    checkForm() {
      let message = null;
      if (!this.c_verify_operation_name) {
        message = '제목을 입력해 주세요.';
        // message = this.getLang(message);
        this.$refs.operation_name.focus();
      }
      if (!message) {
        let target = null;
        if (this.mode === this.MODE_FILE) {
          target = this.$refs.folderUploader;
        } else {
          target = this.$refs.videoFileUploader;
        }
        if (!target || target.getFileCount() <= 0) {
          message = this.mode === this.MODE_FILE ? '파일이 한 개 이상이어야 합니다.' : '동영상이 한 개 이상이어야 합니다.';
          // message = this.getLang(message);
          this.$emit('scrollMove', 0);
        }
      }

      if (message) {
        this.onError(message);
        return false;
      }

      const editor_content = this.$refs.editor.getEditorContent();
      this.operation_data.doc_html = editor_content.editor_desc;

      if (_.trim(this.selected_date) !== '') {
        this.operation_info.operation_date = this.dateFormatter(this.selected_date);
      } else {
        this.operation_info.operation_date = null;
      }

      return true;
    },

    uploadStart() {
      if (this.is_upload_complete) {
        this.requestAnalysis();
        return;
      }
      this.showLoading(true, '파일을 업로드중입니다. 잠시만 기다려주세요.', 0.7);
      this.is_upload_progress = true;
      if (this.mode === this.MODE_FILE) {
        if (this.$refs.folderUploader.isUploadComplete() === false) {
          this.$refs.folderUploader.uploadStart(this.operation_seq);
          this.$emit('scrollMove', 400);
          return;
        }
      } else if (this.$refs.videoFileUploader.isUploadComplete() === false) {
        this.$refs.videoFileUploader.uploadStart(this.operation_seq);
        this.$emit('scrollMove', 400);
        return;
      }
      this.onUploadComplete();
      // if (this.$refs.referFileUploader.isUploadComplete() === false) {
      //   this.$refs.referFileUploader.uploadStart(this.operation_seq);
      //   this.$emit('scrollMove', 400);
      // } else {
      //   this.onUploadComplete();
      // }
    },

    onUploadCancel() {
      if (this.is_upload_progress) {
        if (!confirm('업로드가 완료되지 않았습니다. 업로드를 종료하시겠습니까?')) {
          return;
        }
      }
      if (this.$refs.videoFileUploader) {
        this.$refs.videoFileUploader.uploadCancel();
      }
      if (this.$refs.referFileUploader) {
        this.$refs.referFileUploader.uploadCancel();
      }
      this.onClosePopup();
    },

    onUploadComplete() {
      this.showLoading(true, '동영상등록을 마무리중입니다. 잠시만 기다려주세요.');
      api_operation.onUploadComplete(this.operation_seq, { on_create: true })
        .then((result) => {
          if (result.error) {
            this.is_upload_error = true;
            this.is_upload_progress = false;
            this.is_upload_complete = false;
            this.onError('동영상등록이 마무리되지 않았습니다.<br/>확인 버튼을 클릭하여 등록을 마무리 하세요.', result, 'onUploadComplete');
          } else {
            this.is_upload_complete = true;
            this.requestAnalysis();
          }
        });
    },

    requestAnalysis() {
      this.showLoading(true, '동영상등록을 마무리중입니다. 잠시만 기다려주세요.');
      api_operation.createAnalysisRequest(this.operation_seq)
        .then((result) => {
          this.is_upload_error = true;
          this.is_upload_progress = false;
          if (result.error !== 0) {
            this.onError('동영상등록이 마무리되지 않았습니다.<br/>확인 버튼을 클릭하여 등록을 마무리 하세요.', result, 'requestAnalysis');
          } else {
            this.$emit('onOperationCreateComplete', this.operation_seq, this.operation_info.folder_seq);
            this.onSuccess('동영상이 등록되었습니다.');

            const params = {};
            params.is_list = '1';
            this.$router.push({ name: 'operation', params });

          }
        });
    },

    onUploadStatusChange(upload_type, is_error, message = null) {
      if (is_error) {
        this.is_upload_error = true;
        this.is_upload_progress = false;
        this.onError(message);
      } else if (upload_type === this.MODE_VIDEO || upload_type === this.MODE_FILE) {
        this.uploadStart();
      } else if (upload_type === this.MODE_REFER) {
        this.onUploadComplete();
      }
    },
    onProgressChange(upload_type, is_upload_progress, total_file_count, upload_count, total_progress, total_file_size) {
      if (upload_type === this.MODE_VIDEO || upload_type === this.MODE_FILE) {
        this.video_upload_progress.upload_type = upload_type;
        this.video_upload_progress.is_upload_progress = is_upload_progress;
        this.video_upload_progress.total_file_count = total_file_count;
        this.video_upload_progress.upload_count = upload_count;
        this.video_upload_progress.total_progress = total_progress;
        this.video_file_size = total_file_size;
      } else if (upload_type === this.MODE_REFER) {
        this.refer_file_size = total_file_size;
      }
    },

    keyDown($event) {
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
    keyUp($event) {
      const keyCode = ($event.keyCode ? $event.keyCode : $event.which);
      if (keyCode === 8 || keyCode === 46 || keyCode === 37 || keyCode === 39) {
        return;
      }
      $event.target.value = $event.target.value.replace(/[^0-9]/g, '');
    },
    focusOut($event, target, object_name = null) {
      const value = $event.target.value.replace(/[^0-9]/g, '');
      $event.target.value = value;
      if (object_name) {
        this[object_name][target] = value;
      } else {
        this[target] = value;
      }
    },

    onClosePopup() {
      this.showLoading(false);
      this.$emit('onOperationCreatePopupClose', this.operation_seq);
    },

    verifyOperationCode() {
      if (this.last_check_code === this.operation_info.operation_code) {
        return;
      }

      this.is_verify_operation_code_error = false;
      this.is_verify_operation_code = false;

      if (_.trim(this.operation_info.operation_code) === '') {
        return;
      }
      this.last_check_code = this.operation_info.operation_code;
      this.is_verify_operation_code = true;
    },

    onExtraInfoHideClick() {
      this.is_extra_hide = !this.is_extra_hide;
    },

    addReferUploadFile() {
      const target = this.$refs.referFileUploader;
      if (target && target.onAddFilesClick) {
        target.onAddFilesClick();
      }
    },
    addUploadFile() {
      let target = null;
      if (this.mode === this.MODE_FILE) {
        target = this.$refs.folderUploader;
      } else {
        target = this.$refs.videoFileUploader;
      }
      if (target && target.onAddFilesClick) {
        target.onAddFilesClick();
      }
    },
    addUploadFolder() {
      let target = null;
      if (this.mode === this.MODE_FILE) {
        target = this.$refs.folderUploader;
      } else {
        target = this.$refs.videoFileUploader;
      }
      if (target && target.onAddFolder) {
        target.onAddFolder();
      }
    },
  },
};
</script>

<style scoped>
.operation_create {
  position: relative;
  margin-top: 30px;
}
.operation_create .require_label {
  font-size: 15px;
  line-height: 1;
}

.operation_create .table_info {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  font-size: 13px;
  color: #888888;
  font-weight: 400;
}
.operation_create .table_info .title {
  color: #555555;
  font-size: 18px;
  font-weight: 400;
  padding-right: 20px;
}
.operation_create .operation_info {
  margin: 10px 0 0 0;
  border: 1px solid #dddddd;
  border-radius: 10px;
  padding: 20px 30px;
}
.operation_create .operation_info .info_row {
  border-bottom: none;
  padding: 10px 0;
}
.operation_create .operation_info .info_row > label {
  background-color: transparent;
  font-weight: 400;
  font-size: 15px;
  color: #555555;
  justify-content: flex-start;
  flex: 0 0 130px;
  width: 130px;
}
.operation_create .operation_info .info_row > label > div {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.operation_create .operation_info .info_row > label > div .require_label {
  padding-left: 5px;
}
.operation_create .operation_info .info_row .info {
  padding: 0;
}
.operation_create .operation_info .info_row .info .label {
  flex-shrink: 0;
}
.operation_create .operation_info .info_row .input_wrapper {
  min-height: 36px;
  padding: 0 10px;
}
.operation_create .operation_info .info_row .upload_info {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  font-size: 13px;
}
.operation_create .thumbnail_wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #aaaaaa;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 300;
}
.operation_create .thumbnail_wrapper .thumbnail_image_box {
  width: 160px;
  height: 90px;
  border-radius: 4px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  background-image: url("/img/renewal/common/add_icon.png");
  background-repeat: no-repeat;
  background-position: center center;
  cursor: pointer;
  overflow: hidden;
  margin-right: 10px;
}
.operation_create .thumbnail_wrapper .thumbnail_image_box > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.operation_create .folder_selector_wrapper {
  border: 1px solid #dddddd;
  border-radius: 6px;
  width: 100%;
  min-height: 140px;
}
.operation_create .upload_progress_info > .file_info {
  text-align: right;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg {
  position: relative;
  height: 4px;
  width: 40px;
  background-color: #dddddd;
  opacity: 0;
  margin: 0 10px;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg.on {
  opacity: 1;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg > .upload_progress_percent_bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background-color: #2e6bb8;
}
.operation_create .upload_progress_info {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
}
.operation_create .upload_progress_info > .upload_progress_percent_text {
  color: #2e6bb8;
  opacity: 0;
  text-align: right;
}
.operation_create .upload_progress_info > .upload_progress_percent_text.on {
  opacity: 1;
}
.operation_create .desc_text {
  font-weight: 400;
  font-size: 12px;
  color: #888888;
}
.operation_create .file_upload_wrapper {
  flex: 0 0 140px;
  width: 100%;
  height: 140px;
  overflow: hidden;
}
.operation_create .divider {
  width: 100%;
  height: 1px;
  background-color: #dddddd;
  list-style: none;
  margin: 10px 0;
  padding: 0;
}
.operation_create .radio {
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  margin-right: 10px;
}
.operation_create .radio .radio_text {
  margin-left: 6px;
}
.operation_create .tag_wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex: 1;
  height: 30px;
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0 10px;
  overflow: hidden;
}
.operation_create .tag_wrapper.disable {
  background-color: #f5f5f5;
  justify-content: center;
}
.operation_create .tag_wrapper .tag {
  flex: 1;
  font-size: 13px;
  font-weight: 400;
  color: #555555;
  padding-right: 10px;
}
.operation_create .tag_wrapper.disable .tag {
  color: #aaaaaa;
  padding-right: 0;
  text-align: center;
}
.operation_create .space {
  flex: 0 0 10px;
  width: 10px;
}
.toggle_medical_sub {
  content: '';
  background-image: url('/img/renewal/mypage/open_icon.png');
  background-repeat: no-repeat;
  background-position: center center;
  width: 20px;
  height: 20px;
}

.toggle_medical_sub.on {
  content: '';
  background-image: url('/img/renewal/mypage/close_icon.png');
  background-repeat: no-repeat;
  background-position: center center;
}
.select_check_box {
  flex: 0 0 20px;
}
</style>
