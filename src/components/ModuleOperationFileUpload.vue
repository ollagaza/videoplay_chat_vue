<template>
  <div class='upload_drop' ref="upload_drop" id="upload_drop">
    <template v-if="files.length > 0">
      <div class="w100per" v-on:click.stop="onAddFilesClick">
        <template v-for="(file, idx) in c_sorted_file_list">
          <ul class="file_info"
            v-bind:class="{ idle: !is_upload_progress && !is_upload_complete, progress: is_upload_progress && idx === current_idx, complete: isFileUploadComplete(idx) }"
            v-bind:style="{ backgroundSize: is_upload_progress && idx === current_idx ? c_current_progress_bar : '0% 100%' }">
            <li class="f_w_50 center">{{ idx+1 }}</li>
            <li class="flex"><div class="ellipsis max_100p pr_5" v-bind:title="file.name">{{ file.name }}</div></li>
            <template v-if="!is_upload_progress">
              <li class="f_w_60 right">
                <template v-if="isFileUploadComplete(idx)">완료</template>
                <template v-else-if="isFileUploadFail(idx)">실패</template>
                <template v-else>
                  <template v-if="is_upload_progress && idx === current_idx">{{ c_current_progress }}</template>
                  <template v-else>대기중</template>
                </template>
              </li>
            </template>
            <li class="f_w_70 right">{{ file.file_size_str }}</li>
            <li class="f_w_20 ml_15 mr_15" v-on:click.stop="fileDelete(idx)">
              <span class="delete_btn" v-bind:class="{ disable: is_upload_progress || isFileUploadComplete(idx) }"></span>
            </li>
          </ul>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="no_files" v-on:click.stop="onAddFilesClick" v-bind:style="{ maxHeight: c_max_height }">
        <div class="flex_row_vcenter">
          <div class="btn pad_5 empty_blue h26 r4" v-on:click.stop="onAddFilesClick">{{ '파일추가' }}</div>
        </div>
        <div class="upload_message">
          <div class="sub_message">
            <div v-if="c_sub_message" v-html="c_sub_message"></div>
          </div>
        </div>
      </div>
    </template>
    <div class="hidden_input_file"><input type="file" ref="input_file" v-on:change="onFileSelected" :accept="c_file_accept" multiple /></div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import axios from 'axios';
  import natsort from 'natsort';
  import api_operation from '../api/ApiOperation';
  import * as Constants from '../constants';
  import util from '../utils/util';
  import BaseMixin from '../components/Mixins/BaseMixin';
  // import ChangeLang from './ModuleOperationFileUpload.vue.lang';

  const video_type_regexp = /^video/i;

  export default {
    name: 'ModuleOperationFileUpload',
    props: ['upload_type', 'remain_size', 'max_height'],
    mixins: [BaseMixin],
    data() {
      return {
        MODE_VIDEO: Constants.MODE_VIDEO,
        MODE_REFER: Constants.MODE_REFER,
        dragAndDropCapable: false,
        files: [],
        file_name_map: {},
        file_complete_map: {},
        current_idx: 0,
        current_progress: 0,
        is_upload_progress: false,
        is_upload_complete: false,
        is_upload_error: false,
        is_file_uploaded: false,
        total_progress: 0,
        total_file_count: 0,
        upload_count: 0,
        upload_file_size: 0,
        cancel_source: null,
        disable_map: {},
        is_cancel: false,
        api: null,
        api_key: null,
        api_type: null,
        media_info: null,
      };
    },
    computed: {
      c_is_video_upload() {
        return this.upload_type === this.MODE_VIDEO;
      },
      c_sorted_file_list() {
        const sorter = natsort();
        return this.files.sort((a, b) => sorter(a.name, b.name));
      },
      c_total_file_size() {
        let file_size = 0;
        this.files.forEach((file) => {
          file_size += file.size;
        });
        return file_size;
      },
      c_total_file_count() {
        return this.files.length;
      },
      c_current_progress() {
        return `${this.current_progress}%`;
      },
      c_current_progress_bar() {
        return `${this.c_current_progress} 31px`;
      },
      c_sub_message() {
        let message = '동일한 이름의 파일은 업로드가 불가능 합니다.';
        if (this.c_is_video_upload) {
          message = `${message} 동영상 파일만 업로드 가능합니다.`;
        }
        return `${message}<br/>여러개의 파일을 마우스로 끌어놓으세요.`;
      },
      c_file_accept() {
        if (this.c_is_video_upload) {
          return 'video/mp4,video/x-m4v,video/*,.mts';
        }
        return '*';
      },
      c_max_height() {
        if (this.max_height) {
          return `${this.max_height}px`;
        }
        return null;
      },
    },
    created() {
      // this.lang_map = ChangeLang;
    },
    mounted() {
      this.dragAndDropCapable = this.determineDragAndDropCapable();
      if (this.dragAndDropCapable) {
        this.setEventListener();
      }
      this.onProgressChange();
    },
    beforeDestroy() {
      if (this.dragAndDropCapable) {
        this.removeEventListener();
      }
      if (this.cancel_source) {
        this.cancel_source.cancel('cancel');
      }
    },
    methods: {
      determineDragAndDropCapable() {
        const div = document.createElement('div');

        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
          && 'FormData' in window && 'FileReader' in window;
      },
      setEventListener() {
        ['dragover', 'dragenter'].forEach((event_name) => {
          this.$refs.upload_drop.addEventListener(event_name, this.preventDragEvent, false);
        });
        this.$refs.upload_drop.addEventListener('drop', this.onFileDrop);
      },
      removeEventListener() {
        ['dragover', 'dragenter'].forEach((event_name) => {
          this.$refs.upload_drop.removeEventListener(event_name, this.preventDragEvent);
        });
        this.$refs.upload_drop.removeEventListener('drop', this.onFileDrop);
      },
      preventDragEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        return false;
      },
      onFileDrop({ dataTransfer }) {
        if (dataTransfer && dataTransfer.files) {
          this.startAddFile(dataTransfer.files, 0);
        }
      },
      onAddFilesClick(event) {
        if (this.$refs.input_file) {
          this.$refs.input_file.click();
        }
      },
      onFileSelected() {
        if (this.$refs.input_file && this.$refs.input_file.files) {
          this.startAddFile(this.$refs.input_file.files, 0);
        }
      },

      startAddFile(file_list, index) {
        if (!file_list || file_list.length <= index) {
          this.showLoading(false);
          return;
        }
        if (this.c_is_video_upload) {
          this.showLoading();
        }
        this.addFile(file_list, index);
      },

      addFile(file_list, index) {
        const file = file_list[index];
        if (this.file_name_map[file.name] !== true) {
          if (!this.c_is_video_upload || video_type_regexp.test(file.type)) {
            if (this.disable_map && this.disable_map[file.name]) {
              this.startAddFile(file_list, index + 1);
              return;
            }
            const file_size_str = util.fileSizeText(file.size);
            // this.$log.debug(file.size);
            // this.$log.debug(this.remain_size);
            // if (file.size > this.remain_size) {
            //   this.onError(`용량이 ${util.fileSizeText(this.remain_size)} 이하인 파일만 업로드 가능합니다.\n${file.name} (${file_size_str})`);
            //   return;
            // }
            file.file_size_str = file_size_str;
            if (this.c_is_video_upload) {
              this.getMediaInfo(file, file_list, index);
            } else {
              this.onAddFile(file, file_list, index);
            }
          }
        } else {
          this.startAddFile(file_list, index + 1);
        }
      },
      onAddFile(file, file_list, index) {
        this.files.push(file);
        this.file_name_map[file.name] = true;
        this.onProgressChange();
        this.$nextTick(() => {
          this.startAddFile(file_list, index + 1);
        });
      },

      getMediaInfo(file, file_list, index) {
        if (window.getMediaInfo) {
          // Promise
          window.getMediaInfo(file, (media_info) => {
            if (!media_info || !media_info.has_video) {
              this.onError('동영상 파일만 등록 가능합니다.');
              return;
            }
            if (!this.media_info || _.isEqual(this.media_info, media_info)) {
              this.media_info = media_info;
              this.onAddFile(file, file_list, index);
            } else {
              this.onError('동일한 유형의 동영상만 등록 가능합니다.');
            }
          });
        }
      },

      uploadStart(api_key, api = null, api_type = null) {
        if (this.is_upload_progress) {
          return false;
        }
        this.api_key = api_key;
        this.api_type = api_type;
        if (api) {
          this.api = api;
        } else {
          this.api = api_operation;
        }
        if (this.is_upload_error) {
          this.is_upload_error = false;
          this.onUploadStart();
          return true;
        }

        if (this.c_total_file_size <= 0) {
          this.onUploadComplete();
          return false;
        }

        this.onUploadStart();
        return true;
      },

      uploadCancel() {
        this.is_cancel = true;
        if (this.is_upload_progress) {
          if (this.cancel_source) {
            this.cancel_source.cancel('cancel');
          }
        } else {
          this.$emit('onUploadCancel', this.upload_type);
        }
      },

      onUploadStart() {
        this.is_upload_progress = true;
        this.uploadNextFile();
      },

      onUploadProgress(e) {
        this.current_progress = Math.round((e.loaded * 1000) / e.total) / 10 || 0;
        this.total_progress = Math.round((this.upload_file_size + e.loaded) * 1000 / this.c_total_file_size) / 10;
        this.onProgressChange();
      },

      async uploadNextFile() {
        this.upload_count++;
        this.is_upload_progress = true;
        const target_file = this.files[this.current_idx];
        if (!target_file) {
          this.onUploadComplete();
          return;
        }
        const file_name = target_file.name;
        const upload_form_data = new FormData();
        upload_form_data.append('target', target_file);
        upload_form_data.append('upload_count', this.upload_count);

        this.$refs.upload_drop.scrollTop = (this.current_idx - 1) * 30;

        this.onProgressChange();

        this.current_progress = 0;

        try {
          const cancel_token = axios.CancelToken;
          this.cancel_source = cancel_token.source();

          let result = null;
          if (this.api_type) {
            result = await this.api.addFile(this.api_type, this.api_key, this.upload_type, upload_form_data, this.onUploadProgress, this.cancel_source);
          } else {
            result = await this.api.createOperationFile(this.api_key, this.upload_type, upload_form_data, this.onUploadProgress, this.cancel_source);
          }
          this.cancel_source = null;
          if (result.error) {
            if (this.is_cancel) {
              this.$emit('onUploadCancel', this.upload_type);
            } else {
              this.onUploadFail(result, file_name);
            }
            return;
          }
        } catch (e) {
          this.cancel_source = null;
          if (this.is_cancel) {
            this.$emit('onUploadCancel', this.upload_type);
          } else {
            this.onUploadFail(e, file_name);
          }
          return;
        }

        this.is_file_uploaded = true;
        this.file_complete_map[this.current_idx] = true;
        this.upload_file_size += target_file.size;

        this.current_idx++;
        if (this.current_idx >= this.files.length) {
          this.onUploadComplete();
        } else {
          this.uploadNextFile();
        }
      },

      onUploadFail(error, file_name) {
        this.is_upload_error = true;
        this.is_upload_progress = false;
        this.current_progress = 0;
        const message = `${file_name} 파일 업로드에 실패하였습니다.\\n 재시작을 클릭하면 실패한 파일부터 업로드가 다시 시작됩니다.`;
        this.$emit('onUploadStatusChange', this.upload_type, true, message);
      },

      onUploadComplete() {
        setTimeout(() => {
          this.is_upload_complete = true;
          this.is_upload_progress = false;
          this.$emit('onUploadStatusChange', this.upload_type, false);
        }, 500);
      },

      isFileUploadComplete(idx) {
        return this.file_complete_map[idx];
      },

      isFileUploadFail(idx) {
        return this.is_upload_error && this.is_upload_progress && this.current_idx === idx;
      },

      fileDelete(idx) {
        if (this.is_upload_progress) return;
        const file = this.files.splice(idx, 1);
        this.file_name_map[file[0].name] = false;
        this.onProgressChange();
        if (this.c_total_file_count <= 0) {
          this.media_info = null;
        }
      },

      isUploadProgress() {
        return this.is_upload_progress;
      },

      isUploadComplete() {
        if (this.c_total_file_count <= 0) return true;
        return this.is_upload_complete;
      },

      getFileCount() {
        return this.files.length;
      },

      reSet() {
        this.files = [];
        this.file_name_map = {};
        this.file_complete_map = {};
        this.current_idx = 0;
        this.current_progress = 0;
        this.is_upload_progress = false;
        this.is_upload_complete = false;
        this.is_upload_error = false;
        this.is_file_uploaded = false;
        this.total_progress = 0;
        this.total_file_count = 0;
        this.upload_count = 0;
        this.upload_file_size = 0;
        this.cancel_source = null;
        this.disable_map = {};
        this.is_cancel = false;
        this.api = null;
        this.api_key = null;
        this.api_type = null;
        this.media_info = null;
      },

      setDisableFileList(file_list = null) {
        if (file_list) {
          for (let i = 0; i < file_list.length; i++) {
            this.disable_map[file_list[i].file_name] = true;
          }
        }
      },

      onProgressChange() {
        this.$emit('onProgressChange', this.upload_type, this.is_upload_progress, this.c_total_file_count, this.upload_count, this.total_progress, this.c_total_file_size);
      },
    },
  };
</script>

<style scoped>
  .upload_drop {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-height: 80px;
    border: 1px solid #dddddd;
    border-radius: 5px;
    overflow-y: auto;
    user-select: none;
    cursor: pointer;
  }
  .upload_drop .file_info {
    display: flex;
    flex-basis: 30px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-direction: row;
    width: 100%;
    height: 30px;
    border-bottom: 1px solid #f5f5f5;
    align-items: center;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .upload_drop .file_info.idle:hover {background-color: #FFFFFF;}
  .upload_drop .file_info.progress {transition: 0.3s; background-position: 0 0; background-image: url('/img/renewal/upload_bar.png'); background-repeat: no-repeat;}
  .upload_drop .file_info.complete {background-color: #f5f5f5;}

  .upload_drop .file_info > li {
    display: flex;
    font-size: 13px;
    list-style: none;
  }
  .upload_drop .file_info > li.center {
    align-items: center;
    justify-content: center;
  }
  .upload_drop .file_info > li.right {
    align-items: center;
    justify-content: flex-end;
  }

  .upload_drop > .no_files {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    /*background-image: url("/img/renewal/drive/layer_add.png");*/
    /*background-position: center 30%;*/
    /*background-repeat: no-repeat;*/
    align-items: center;
    justify-content: center;
  }
  .upload_drop > .no_files .upload_message {
    margin-top: 14px;
  }
  .upload_drop > .no_files .upload_message .main_message {
    font-size: 13px;
    color: #888888;
    text-align: center;
  }
  .upload_drop > .no_files .upload_message .sub_message {
    color: #888888;
    font-size: 12px;
    text-align: center;
  }

  .upload_drop .text_btn {
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    margin: 0 15px;
    color: #2e6bb8;
    border-bottom: 1px solid #2e6bb8;
  }
  .upload_drop .text_btn:hover {
    color: #ffa00f;
    border-bottom: 1px solid #ffa00f;
  }
</style>
