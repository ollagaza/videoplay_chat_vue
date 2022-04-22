<template>
  <div ref="file_row">
    <ul class="file_info"
        v-bind:class="{ idle: c_is_idle, progress: c_is_upload, complete: c_is_upload_complete }"
        v-bind:style="{ backgroundSize: c_background_size }" >
      <li class="pad" v-bind:style="c_pad_style">
        <template v-if="c_has_children">
          <div class="pad_5" v-on:click.stop="showChildren">
            <div class="common_arrow pointer" v-bind:class="{ right: !is_show_children, bottom: is_show_children }" style="--size: 10px; --color: #aaaaaa; --thick: 2px;"><div></div></div>
          </div>
        </template>
      </li>
      <template v-if="c_is_folder">
        <li class="mr_5" v-on:click.stop="showChildren"><img src="/img/renewal/folder/lnb_folder_icon.png" /></li>
        <li class="file_name" v-on:click.stop="showChildren"><div class="ellipsis max_100p pr_5" v-bind:title="c_file_name">{{ c_file_name }}</div></li>
      </template>
      <template v-else>
        <li class="file_name"><div class="ellipsis max_100p pr_5" v-bind:title="c_file_name">{{ c_file_name }}</div></li>
      </template>
      <template v-if="c_is_folder">
        <template v-if="c_is_upload_complete">
          <li class="f_w_60 right">완료</li>
        </template>
        <li class="f_w_70 right">{{ c_upload_count_str }} / {{ c_file_count_str }}</li>
        <li class="f_w_20 ml_15 mr_15" v-on:click.stop="fileDelete()">
          <span class="delete_btn" v-bind:class="{ disable: is_upload_progress || c_is_upload_complete }"></span>
        </li>
      </template>
      <template v-else>
        <template v-if="is_upload_progress">
          <li class="f_w_60 right">
            <template v-if="c_is_upload_complete">완료</template>
            <template v-else-if="file_info.is_upload_fail">실패</template>
            <template v-else>
              <template v-if="c_is_upload">{{ c_progress }}</template>
              <template v-else>대기중</template>
            </template>
          </li>
        </template>
        <li class="f_w_70 right">{{ c_file_size }}</li>
        <li class="f_w_20 ml_15 mr_15" v-on:click.stop="fileDelete()">
          <span class="delete_btn" v-bind:class="{ disable: is_upload_progress || c_is_upload_complete }"></span>
        </li>

<!--        <li class="f_w_70 right">{{ c_file_size }}</li>-->
<!--        <li class="f_w_70 center" v-on:click.stop="fileDelete()">-->
<!--          <template v-if="c_is_upload_complete">완료</template>-->
<!--          <template v-else-if="file_info.is_upload_fail">실패</template>-->
<!--          <template v-else-if="!is_upload_progress"><span class="delete_btn"></span></template>-->
<!--          <template v-else>-->
<!--            <template v-if="c_is_upload">{{ c_progress }}</template>-->
<!--            <template v-else>대기중</template>-->
<!--          </template>-->
<!--        </li>-->
      </template>
    </ul>
    <template v-if="c_show_children">
      <template v-for="(file_info, idx) in c_children">
        <ModuleOperationFolderUploadItem
          v-bind:file_info="file_info"
          v-bind:idx="idx"
          v-bind:upload_event_bus="upload_event_bus"
        ></ModuleOperationFolderUploadItem>
      </template>
    </template>
  </div>
</template>

<style scoped>
  .file_info {
    display: flex;
    flex-basis: 30px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-direction: row;
    width: 100%;
    height: 30px;
    /*border-bottom: 1px solid #dddddd;*/
    align-items: center;
    list-style-type: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
  .file_info.idle:hover {background-color: #FFFFFF;}
  .file_info.progress {transition: 0.3s; background-position: 0 0; background-image: url('/img/renewal/upload_bar.png'); background-repeat: no-repeat;}
  .file_info.complete {background-color: #f5f5f5;}

  .file_info > li {
    display: flex;
    font-size: 13px;
    list-style: none;
    align-items: center;
  }
  .file_info > li.pad {
    justify-content: flex-end;
    flex-grow: 0;
    flex-shrink: 0;
  }
  .file_info > li.center {
    align-items: center;
    justify-content: center;
  }
  .file_info > li.right {
    align-items: center;
    justify-content: flex-end;
  }
  .file_info > li.file_name {
    flex: 1;
    overflow: hidden;
  }
</style>

<script>
  import util from '../utils/util';

  export default {
    name: 'ModuleOperationFolderUploadItem',
    props: ['upload_event_bus', 'file_info', 'idx'],
    data() {
      return {
        is_upload_progress: false,
        is_upload_complete: false,
        is_upload_error: false,
        is_show_children: false,
      };
    },
    mounted() {
      this.upload_event_bus.on('onStatusChange', this.onStatusChange);
      this.file_info.element = this.$refs.file_row;
    },
    beforeDestroy() {
      this.upload_event_bus.off('onStatusChange', this.onStatusChange);
    },
    computed: {
      c_is_folder() {
        if (!this.file_info) return false;
        return this.file_info.is_directory;
      },
      c_file_name() {
        if (!this.file_info) return '';
        return this.file_info.name;
      },
      c_file_size() {
        if (!this.file_info) return '';
        return this.file_info.file_size_str;
      },
      c_is_idle() {
        return !this.is_upload_progress && !this.is_upload_complete;
      },
      c_is_upload() {
        if (!this.file_info) return false;
        return this.is_upload_progress && this.file_info.is_upload;
      },
      c_progress() {
        if (!this.file_info || !this.c_is_upload) return '0%';
        let progress = Math.round((this.file_info.upload * 1000) / this.file_info.file_size) / 10;
        if (progress > 100) progress = 100;
        return `${progress}%`;
      },
      c_background_size() {
        return this.c_is_upload ? `${this.c_progress} 100%` : '0 100%';
      },
      c_is_upload_complete() {
        if (!this.file_info) return false;
        if (this.c_is_folder) {
          return this.c_upload_count === this.c_file_count;
        }
        return this.file_info.is_complete;
      },
      c_has_children() {
        return this.c_child_count > 0;
      },
      c_pad_style() {
        if (!this.file_info) return null;
        const width = `${20 + this.file_info.depth * 20}px`;
        return {
          width,
          flexBasis: width,
        };
      },
      c_child_count() {
        if (!this.c_is_folder) return 0;
        if (!this.file_info.children) return 0;
        return this.file_info.children.length;
      },
      c_children() {
        if (!this.file_info || !this.c_has_children) return null;
        return this.file_info.children;
      },
      c_show_children() {
        if (!this.file_info || !this.c_has_children) return false;
        return this.file_info.show_children;
      },
      c_upload_count() {
        if (!this.c_is_folder) return 0;
        return this.file_info.upload_count;
      },
      c_file_count() {
        if (!this.c_is_folder) return 0;
        return this.file_info.file_count;
      },
      c_upload_count_str() {
        return util.numberFormat(this.c_upload_count);
      },
      c_child_count_str() {
        return util.numberFormat(this.c_child_count);
      },
      c_file_count_str() {
        return util.numberFormat(this.c_file_count);
      },
    },
    methods: {
      onStatusChange(is_upload_progress, is_upload_complete, is_upload_error) {
        this.is_upload_progress = is_upload_progress;
        this.is_upload_complete = is_upload_complete;
        this.is_upload_error = is_upload_error;
      },
      fileDelete() {
        this.upload_event_bus.emit('onDeleteBtnClick', this.file_info, this.idx);
      },
      showChildren() {
        this.file_info.show_children = !this.file_info.show_children;
      },
    },
  };
</script>

<style scoped>

</style>
