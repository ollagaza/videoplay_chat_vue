<template>
  <div class='upload_drop' ref="upload_drop" id="upload_drop" v-bind:style="{ maxHeight: c_max_height }">
    <template v-if="c_has_file_list">
      <template v-for="(file_info, idx) in file_list">
        <div class="w100per" v-on:click.stop="onAddFolder">
          <ModuleOperationFolderUploadItem
            v-bind:file_info="file_info"
            v-bind:idx="idx"
            v-bind:upload_event_bus="upload_event_bus"
            v-bind:key="file_info.full_path"
          ></ModuleOperationFolderUploadItem>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="no_files">
        <div class="flex_row_vcenter">
          <div class="btn pad_5 empty_blue h26 r4" v-on:click.stop.prevent="onAddFilesClick">{{ '파일추가' }}</div>
          <div class="btn pad_5 empty_blue h26 r4 ml_6" v-on:click.stop.prevent="onAddFolder">{{ '폴더추가' }}</div>
        </div>
        <div class="upload_message">
          <div class="sub_message">
            <div v-if="c_sub_message" v-html="c_sub_message"></div>
          </div>
        </div>
      </div>
    </template>
    <div class="hidden_input_file"><input type="file" id="input_file" ref="input_file" v-on:change="onFileSelected" v-bind:accept="c_file_accept" multiple /></div>
    <div class="hidden_input_file"><input type="file" id="input_folder" ref="input_folder" v-on:change="onFolderSelected" v-bind:accept="c_file_accept" webkitdirectory mozdirectory /></div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import axios from 'axios';
  import api_operation from '../api/ApiOperation';
  import * as Constants from '../constants';
  import { mapGetters } from 'vuex';
  import util from '../utils/util';
  import path from 'path';
  import BaseMixin from '../components/Mixins/BaseMixin';
  import EventEmitter from '../utils/event_emitter';
  import ModuleOperationFolderUploadItem from './ModuleOperationFolderUploadItem';
  // import ChangeLang from './ModuleOperationFolderUpload.vue.lang';

  export default {
    name: 'ModuleOperationFolderUpload',
    props: ['upload_type', 'file_types', 'remain_size', 'max_height', 'root_directory'],
    mixins: [BaseMixin],
    components: { ModuleOperationFolderUploadItem },
    data() {
      return {
        dragAndDropCapable: false,
        file_map: {},
        file_list: [],
        is_upload_progress: false,
        is_upload_complete: false,
        is_upload_error: false,
        total_progress: 0,
        total_file_count: 0,
        upload_count: 0,
        upload_file_size: 0,
        current_idx: 0,
        current_file_info: null,
        cancel_source: null,
        disable_map: {},
        is_cancel: false,
        api: null,
        api_key: null,
        api_type: null,
        media_info: null,
        upload_event_bus: new EventEmitter(),
        top: 0,
        only_file_list: [],
        directory_list: [],
      };
    },
    computed: {
      ...mapGetters(['lang', '']),
      c_has_file_list() {
        return this.file_list && this.file_list.length > 0;
      },
      c_total_file_size() {
        let file_size = 0;
        this.only_file_list.forEach((file_info) => {
          file_size += file_info.file_size;
        });
        return file_size;
      },
      c_total_file_count() {
        return this.only_file_list.length;
      },
      c_sub_message() {
        if (this.file_types) {
          let message = '';
          this.file_types.forEach((file_type) => {
            if (file_type === Constants.VIDEO) {
              message = `${message}동영상, `;
            } else if (file_type === Constants.IMAGE) {
              message = `${message}이미지, `;
            } else if (file_type === Constants.PDF) {
              message = `${message}PDF, `;
            } else if (file_type === Constants.AUDIO) {
              message = `${message}오디오, `;
            }
          });
          message = message.replace(/, $/, '');
          this.$log.debug(this.$options.name, `${message} 파일만 업로드 가능합니다.<br/>여러개의 파일 또는 폴더를 마우스로 끌어놓으세요.`);
          return `${message} 파일만 업로드 가능합니다.<br/>여러개의 파일 또는 폴더를 마우스로 끌어놓으세요.`;
        }
        return null;
      },
      c_file_accept() {
        if (this.file_types) {
          let accept = '';
          this.file_types.forEach((file_type) => {
            if (file_type === Constants.VIDEO) {
              accept = `${accept}video/mp4,video/x-m4v,video/*,.mts,`;
            } else if (file_type === Constants.IMAGE) {
              accept = `${accept}image/*,`;
            } else if (file_type === Constants.PDF) {
              accept = `${accept}application/pdf,`;
            } else if (file_type === Constants.AUDIO) {
              accept = `${accept}audio/*,`;
            }
          });
          accept = accept.replace(/,$/, '');
          return `${accept}`;
        }
        return '*';
      },
      c_lang() {
        return util.getLanguage(this.lang, 'OperationPopup');
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
      this.upload_event_bus.on('onDeleteBtnClick', this.onDeleteBtnClick);
    },
    mounted() {
      this.dragAndDropCapable = this.determineDragAndDropCapable();
      if (this.dragAndDropCapable) {
        this.setEventListener();
      }
      this.onProgressChange();
    },
    beforeDestroy() {
      if (this.upload_event_bus) {
        this.upload_event_bus.clearEvent();
      }
      if (this.dragAndDropCapable) {
        this.removeEventListener();
      }
      if (this.cancel_source) {
        this.cancel_source.cancel('cancel');
      }
      this.clear();
    },
    methods: {
      sortFile(a, b) {
        if (a.is_directory && !b.is_directory) return -1;
        if (!a.is_directory && b.is_directory) return 1;
        return a.name > b.name;
      },
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
        if (dataTransfer && dataTransfer.items) {
          this.showLoading(true);
          this.getFilesWebkitDataTransferItems(dataTransfer.items)
            .then((file_list) => {
              this.startAddFile(file_list);
            })
            .catch((error) => {
              this.$log.debug(error);
              this.showLoading(false);
            });
        }
      },
      getFilesWebkitDataTransferItems(item_list) {
        const files = [];
        const traverseFileTreePromise = (item, parent_directory = '', reader = null) => new Promise((resolve) => {
          if (item.isFile) {
            item.file((file) => {
              file.file_path = `${parent_directory}/${file.name}`;
              files.push(file);
              resolve(file);
            }, (error) => {
              this.$log.debug('getFilesWebkitDataTransferItems.readFileError', error);
              resolve(false);
            });
          } else if (item.isDirectory) {
            const directory = `${parent_directory}/${item.name}`;
            const dir_reader = reader !== null ? reader : item.createReader();
            dir_reader.readEntries((entries) => {
              const entries_promises = [];
              // this.$log.error(entries.length);
              if (!entries || !entries.length) {
                resolve(true);
                return;
              }
              for (let i = 0; i < entries.length; i++) {
                // this.$log.error(i, `is_file: ${entries[i].isFile}, is_dir: ${entries[i].isDirectory}, path: ${entries[i].fullPath}`);
                entries_promises.push(traverseFileTreePromise(entries[i], directory));
              }
              entries_promises.push(traverseFileTreePromise(item, parent_directory, dir_reader));
              resolve(Promise.all(entries_promises));
            });
          } else {
            this.$log.debug('---- unknown item', item);
            resolve(true);
          }
        });

        return new Promise((resolve, reject) => {
          const entries_promises = [];
          for (let i = 0; i < item_list.length; i++) {
            entries_promises.push(traverseFileTreePromise(item_list[i].webkitGetAsEntry()));
          }
          Promise.all(entries_promises)
            .then(() => {
              resolve(files);
            });
        });
      },
      onAddFilesClick(event) {
        if (this.$refs.input_file) {
          this.$refs.input_file.click();
        }
      },
      onAddFolder(event) {
        if (this.$refs.input_folder) {
          this.$refs.input_folder.click();
        }
      },
      onFileSelected() {
        if (this.$refs.input_file && this.$refs.input_file.files) {
          this.startAddFile(this.$refs.input_file.files);
        }
      },
      onFolderSelected() {
        if (this.$refs.input_folder && this.$refs.input_folder.files) {
          this.startAddFile(this.$refs.input_folder.files);
        }
      },

      startAddFile(file_list) {
        if (!file_list || file_list.length <= 0) {
          return;
        }
        this.showLoading(true);
        let sum_file_size = 0;
        for (let i = 0; i < file_list.length; i++) {
          const file = file_list[i];
          const file_name = file.name;
          let file_path = file_name;
          if (file.file_path) {
            file_path = file.file_path;
          } else if (file.webkitRelativePath) {
            file_path = file.webkitRelativePath;
          }
          file_path = _.trim(file_path.replace(/^\/+/, ''));
          const ext = path.extname(file_name);
          const directory = file_path !== file_name ? path.dirname(_.trim(file_path.replace(/^\/+/, ''))) : null;
          const file_size = file.size;
          sum_file_size += file_size;
          // if (sum_file_size > this.remain_size) {
          //   this.onError('저장공간이 부족합니다.');
          //   break;
          // }
          const file_size_str = util.fileSizeText(file_size);
          const file_type = this.isValidFileType(file.type, ext);
          if (!file_type) {
            continue;
          }
          const full_path = `/${file_path}`;
          let file_info = this.file_map[full_path];
          if (file_info) {
            const size_diff = file_size - file_info.file_size;
            file_info.file = file;
            file_info.file_size = file_size;
            file_info.file_size_str = file_size_str;
            if (file_info.has_parent && size_diff !== 0) {
              for (let j = 0; j < file_info.parent_list.length; j++) {
                const parent = this.file_map[file_info.parent_list[j]];
                parent.file_size += size_diff;
                parent.file_size_str = util.fileSizeText(parent.file_size);
              }
            }
          } else {
            const parent_info = this.createParentInfo(directory, file_size);
            file_info = {
              has_parent: parent_info.has_parent,
              file_size,
              file_size_str,
              file_type,
              name: file.name,
              full_path,
              depth: parent_info.depth,
              is_directory: false,
              upload_size: 0,
              is_upload: false,
              is_upload_fail: false,
              is_complete: false,
              parent_directory: parent_info.parent_directory,
              parent_list: parent_info.parent_list,
              parent_map: parent_info.parent_map,
              file,
              file_count: 1,
              element: null,
            };
            if (parent_info.has_parent) {
              parent_info.parent.children.push(file_info);
            } else {
              this.file_list.push(file_info);
            }
            this.$set(this.file_map, full_path, file_info);
          }
        }
        this.reSortFileList();
        this.$nextTick()
          .then(() => {
            this.onProgressChange();
          })
          .then(() => {
            this.showLoading(false);
          });
      },
      reSortFileList() {
        this.only_file_list = [];
        this.directory_list = [];
        this.file_list = this.file_list.sort(this.sortFile);
        this.sortFileList(this.file_list);
      },
      sortFileList(file_list) {
        if (!file_list || file_list.length <= 0) return;
        for (let i = 0; i < file_list.length; i++) {
          const file_info = file_list[i];
          if (file_info.is_directory) {
            file_info.children = file_info.children.sort(this.sortFile);
            this.sortFileList(file_info.children);
            this.directory_list.push(file_info);
          } else {
            this.only_file_list.push(file_info);
          }
        }
      },
      createParentInfo(directory, file_size) {
        const result = {
          has_parent: false,
          depth: 0,
          parent: null,
          parent_directory: null,
          parent_list: [],
          parent_map: {},
        };
        if (!directory) {
          return result;
        }
        result.has_parent = true;
        const dir_list = directory.split('/');
        const parent_list = [];
        const parent_map = {};
        result.parent_list = parent_list;
        result.parent_map = parent_list;
        let parent_directory = '';
        let parent_info = null;
        let depth = 0;
        for (let i = 0; i < dir_list.length; i++) {
          const dir_name = util.trim(dir_list[i]);
          if (!dir_name) continue;
          const directory_name = `${parent_directory}/${dir_name}`;
          let directory_info = this.file_map[directory_name];
          if (!directory_info) {
            directory_info = {
              has_parent: false,
              file_count: 0,
              file_size: 0,
              file_size_str: '0',
              name: dir_name,
              full_path: directory_name,
              depth,
              is_directory: true,
              upload_count: 0,
              upload_size: 0,
              current_upload_size: 0,
              children: [],
              parent_directory,
              parent_list: _.clone(parent_list),
              parent_map: _.clone(parent_map),
              show_children: false,
            };
            this.file_map[directory_name] = directory_info;
            if (parent_info) {
              directory_info.has_parent = true;
              parent_info.children.push(directory_info);
            } else {
              this.file_list.push(directory_info);
            }
          }
          directory_info.file_count++;
          directory_info.file_size += file_size;
          directory_info.file_size_str = util.fileSizeText(directory_info.file_size);
          depth++;

          parent_directory = directory_name;
          parent_info = directory_info;

          parent_list.push(directory_name);
          parent_map[directory_name] = true;

          result.parent = parent_info;
          result.parent_list = parent_list;
          result.parent_map = parent_map;
          result.parent_directory = parent_directory;
          result.depth = depth;
        }
        return result;
      },
      isValidFileType(type, ext) {
        type = util.trim(type);
        if (!type) {
          return false;
        }
        let is_valid = false;
        for (let i = 0; i < this.file_types.length; i++) {
          const file_type = this.file_types[i];
          if (file_type === Constants.VIDEO) {
            is_valid = type.startsWith('video/');
            if (!is_valid) {
              is_valid = ext === 'mts';
            }
          } else if (file_type === Constants.IMAGE) {
            is_valid = type.startsWith('image/');
          } else if (file_type === Constants.PDF) {
            is_valid = type === 'application/pdf';
          } else if (file_type === Constants.AUDIO) {
            is_valid = type.startsWith('audio/');
          }
          if (is_valid) return file_type;
        }
        return false;
      },
      onDeleteBtnClick(file_info, idx = null, delete_child = true, notice_progress = true) {
        const full_path = file_info.full_path;
        const file_size = file_info.file_size;
        file_info.element = null;
        this.$delete(this.file_map, full_path);

        if (file_info.is_directory && delete_child) {
          const children = _.filter(this.file_map, file_info => file_info.parent_map[full_path]);
          if (children && children.length > 0) {
            for (let i = 0; i < children.length; i++) {
              const child = this.file_map[children[i].full_path];
              child.element = null;
              this.$delete(this.file_map, child.full_path);
            }
          }
        }

        if (!file_info.has_parent) {
          if (idx === null) {
            idx = _.indexOf(this.file_list, file_info);
          }
          this.$delete(this.file_list, idx);
          this.$delete(this.only_file_list, _.indexOf(this.only_file_list, file_info));
        } else {
          const parent_list = file_info.parent_list;
          if (parent_list && parent_list.length > 0) {
            for (let i = 0; i < parent_list.length; i++) {
              const parent = this.file_map[parent_list[i]];
              if (parent) {
                parent.file_count -= file_info.file_count;
                parent.file_size -= file_size;
                parent.file_size_str = util.fileSizeText(parent.file_size);
              }
            }
          }
          const parent = this.file_map[file_info.parent_directory];
          if (parent && parent.children) {
            if (idx === null) {
              idx = _.indexOf(parent.children, file_info);
            }
            this.$delete(parent.children, idx);
            if (parent.children.length <= 0) {
              this.onDeleteBtnClick(parent, null, false, false);
            }
          }
        }
        if (!notice_progress) return;
        this.$nextTick().then(() => {
          this.onProgressChange();
        });
      },

      uploadStart(api_key, api = null, api_type = null) {
        this.top = this.$refs.upload_drop.offsetTop;
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

      onStatusChange() {
        this.upload_event_bus.emit('onStatusChange', this.is_upload_progress, this.is_upload_complete, this.is_upload_error);
      },

      onUploadStart() {
        this.is_upload_progress = true;
        this.is_upload_complete = false;
        this.is_upload_error = false;
        this.onStatusChange();
        for (let i = 0; i < this.directory_list.length; i++) {
          this.directory_list[i].show_children = true;
        }
        this.$nextTick().then(() => {
          window.setTimeout(this.uploadNextFile, 100);
        });
      },

      async uploadNextFile() {
        this.is_upload_progress = true;
        const target_file = this.only_file_list[this.current_idx];
        if (!target_file) {
          this.onUploadComplete();
          return;
        }
        this.current_file_info = target_file;
        let directory = this.current_file_info.parent_directory;
        if (this.root_directory) {
          if (!directory) {
            directory = this.root_directory;
          } else {
            directory = `${this.root_directory}${directory}`;
          }
        }
        const upload_form_data = new FormData();
        upload_form_data.append('target', this.current_file_info.file);
        upload_form_data.append('upload_count', this.upload_count);
        upload_form_data.append('file_name', this.current_file_info.name);
        upload_form_data.append('directory', directory);

        this.current_file_info.is_upload = true;
        this.current_file_info.is_upload_error = false;
        this.current_file_info.is_upload_complete = false;
        this.current_file_info.upload = 0;
        this.$refs.upload_drop.scrollTop = this.current_file_info.element.offsetTop - this.top - 90;

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
              this.onUploadFail(result, this.current_file_info.name);
            }
            return;
          }
        } catch (e) {
          this.cancel_source = null;
          if (this.is_cancel) {
            this.$emit('onUploadCancel', this.upload_type);
          } else {
            this.onUploadFail(e, this.current_file_info.name);
          }
          return;
        }

        this.current_file_info.is_complete = true;
        this.upload_file_size += target_file.file_size;
        this.upload_count++;
        this.onProgressChange();
        this.current_idx++;
        this.updateUploadProgress(true);
        if (this.current_idx >= this.c_total_file_count) {
          this.onUploadComplete();
        } else {
          this.$nextTick().then(() => {
            this.uploadNextFile();
          });
        }
      },

      onUploadProgress(e) {
        this.current_file_info.upload_size = e.loaded;
        if (this.current_file_info.has_parent) {
          const parent_list = this.current_file_info.parent_list;
          if (parent_list && parent_list.length > 0) {
            for (let i = 0; i < parent_list.length; i++) {
              const parent = this.file_map[parent_list[i]];
              if (parent) {
                parent.current_upload_size = e.loaded;
              }
            }
          }
        }
        this.total_progress = Math.round((this.upload_file_size + e.loaded) * 1000 / this.c_total_file_size) / 10;
        this.onProgressChange();
      },
      updateUploadProgress(is_success) {
        if (this.current_file_info.has_parent) {
          const parent_list = this.current_file_info.parent_list;
          if (parent_list && parent_list.length > 0) {
            for (let i = 0; i < parent_list.length; i++) {
              const parent = this.file_map[parent_list[i]];
              if (parent) {
                parent.current_upload_size = 0;
                if (is_success) {
                  parent.upload_count++;
                  parent.upload_size += this.current_file_info.file_size;
                  this.current_file_info.is_complete = true;
                  this.current_file_info.is_upload_fail = false;
                }
              } else {
                this.current_file_info.is_complete = false;
                this.current_file_info.is_upload_fail = true;
              }
            }
          }
        }
      },

      onUploadFail(error, file_name) {
        this.is_upload_error = true;
        this.is_upload_progress = false;
        this.current_file_info.is_upload_error = true;
        this.current_file_info.upload_size = 0;
        this.total_progress = Math.round(this.upload_file_size * 1000 / this.c_total_file_size) / 10;
        this.onStatusChange();
        this.updateUploadProgress(false);
        const message = `${file_name} 파일 업로드에 실패하였습니다.<br/> 재시작을 클릭하면 실패한 파일부터 업로드가 다시 시작됩니다.`;
        this.$emit('onUploadStatusChange', this.upload_type, true, message);
      },

      onUploadComplete() {
        setTimeout(() => {
          this.is_upload_complete = true;
          this.is_upload_progress = false;
          this.onStatusChange();
          this.$emit('onUploadStatusChange', this.upload_type, false);
        }, 500);
      },

      isUploadProgress() {
        return this.is_upload_progress;
      },

      isUploadComplete() {
        return this.is_upload_complete;
      },

      getFileCount() {
        return this.c_total_file_count;
      },

      reSet() {
        this.files = [];
        this.file_name_map = {};
        this.file_complete_map = {};
        this.current_idx = 0;
        this.is_upload_progress = false;
        this.is_upload_complete = false;
        this.is_upload_error = false;
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

      clear() {
        this.file_map = {};
        this.file_list = [];
        this.is_upload_progress = false;
        this.is_upload_complete = false;
        this.is_upload_error = false;
        this.total_progress = 0;
        this.total_file_count = 0;
        this.upload_count = 0;
        this.upload_file_size = 0;
        this.current_idx = 0;
        this.current_file_info = null;
        this.cancel_source = null;
        this.disable_map = {};
        this.is_cancel = false;
        this.api = null;
        this.api_key = null;
        this.api_type = null;
        this.media_info = null;
        this.top = 0;
        this.only_file_list = [];
        this.directory_list = [];
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
  .upload_drop > .file_info {
    display: flex;
    flex-basis: 30px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-direction: row;
    width: 100%;
    height: 30px;
    border-bottom: 1px solid #dddddd;
    align-items: center;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .upload_drop > .file_info.idle:hover {background-color: #FFFFFF;}
  .upload_drop > .file_info.progress {transition: 0.3s; background-position: 0 0; background-image: url('/img/renewal/upload_bar.png'); background-repeat: no-repeat;}
  .upload_drop > .file_info.complete {background-color: #f5f5f5;}

  .upload_drop > .file_info > li {
    display: flex;
    font-size: 13px;
    list-style: none;
  }
  .upload_drop > .file_info > li.center {
    align-items: center;
    justify-content: center;
  }
  .upload_drop > .file_info > li.right {
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
    color: #2e6bb8;
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
