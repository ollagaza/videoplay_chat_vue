<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }">
    <div class="popup upload_popup" v-on:click.stop="() => false" v-on:mousedown.stop="() => false" ref="prevent_drag">
      <div class="popup_title_top">
        <template v-if="mode==='new'">
          <span>새 작물생육모습 올리기</span>
        </template>
        <template v-if="mode==='mod'">
          <span>작물생육모습 수정하기</span>
        </template>
      </div>
      <div style="display: flex; flex-direction: row;">
        <div style="margin-top: 10px;">
          <FileUpload
            ref="refFileupload"
            v-on:onDataChange="onDataChange"
          ></FileUpload>
        </div>
        <div style="width: 200px; margin-left: 30px;">
          <div class="input_box">
            <div>
              <input type="text" ref="title" placeholder="제목을 입력하세요." v-model="upinfo.title" style="width: 200px; height: 40px; border-bottom: 1px solid #ccc">
            </div>
          </div>
          <div class="input_box">
            <div>
              <select v-model="upinfo.item_seq" ref="item_seq" style="width: 200px; border: 1px solid #ccc; height: 40px;padding-left: 10px;">
                <option value="0">작물을 선택하세요.</option>
                <template v-for="(item, idx) in myplant">
                  <option v-bind:value="item.seq">{{item.othername}}</option>
                </template>
              </select>
            </div>
          </div>
          <div class="input_box">
            <div>
              <select v-model="upinfo.plantstatus"  ref="plantstatus" style="width: 200px; border: 1px solid #ccc; height: 40px;padding-left: 10px;">
                <option value="0">생육단계를 선택하세요.</option>
                <option value="1">활착기</option>
                <option value="2">성장기</option>
                <option value="3">수확기</option>
              </select>
            </div>
          </div>
          <div class="input_box">
            <div class="datepicker_icon" style="border: 1px solid #dddddd;">
              <datepicker v-model="upinfo.plant_day" :language="date_locale_ko" :format="dateFormatter" style="width: 200px;padding: 12px 0 0 10px;height: 40px;"></datepicker>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:30px;">
        <div style="display: flex; flex-direction: row; padding-top: 6px;">
          <div style="flex:2"></div>
          <div class="btn newgreen next" v-on:click="onVerify">다음</div>
          <div class="btn_cancel" style="width:160px;" v-on:click="onCancel">취소</div>
          <div style="flex:2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ko } from 'vuejs-datepicker/dist/locale';
import moment from 'moment/moment';
import Datepicker from 'vuejs-datepicker';
import axios from 'axios';
import apilist from '../../api/ApiList';
import BaseMixin from '../Mixins/BaseMixin';
import EventBus from '../../utils/eventbus';
import util from '../../utils/util';
import FileUpload from '../report/FileUpload';

export default {
  name: 'NewUploadPopup',
  components: { Datepicker, FileUpload },
  mixins: [BaseMixin],
  data() {
    return {
      myplant: [],
      mode: 'new',
      is_cancel: false,
      is_open: false,
      cancel_source: null,
      dragAndDropCapable: false,
      date_locale_ko: ko,
      imgfile: null,
      imgfilename: '',
      img_isdata: false,
      upinfo: {
        title: '',
        item_seq: '0',
        plantstatus: '0',
        plant_day: moment().format('YYYY-MM-DD'),
      },
    };
  },
  created() {
  },
  beforeDestroy() {
    if (this.cancel_source) {
      this.cancel_source.cancel('cancel');
    }
    this.removeEventListener();
  },
  computed: {
    c_img_isdata() {
      return this.img_isdata;
    },
  },
  watch: {
  },
  mounted() {
    this.addEventListener();
  },
  methods: {
    onDataChange(file) {
      this.$log.debug('onDataChange', file);
      this.imgfile = file;
      this.imgfilename = file[0].name;
    },
    addEventListener() {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
        this.$refs.prevent_drag.addEventListener(event_name, this.preventDragDefault, false);
      });
    },
    removeEventListener() {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
        this.$refs.prevent_drag.removeEventListener(event_name, this.preventDragDefault);
      });
    },
    preventDragDefault($event) {
      $event.preventDefault();
      $event.stopPropagation();
      if ($event.dataTransfer) {
        $event.dataTransfer.effectAllowed = 'none';
        $event.dataTransfer.dropEffect = 'none';
      }
      return false;
    },
    reset() {
      this.$log.debug('reset');
      this.upinfo.title = '';
      this.upinfo.item_seq = '0';
      this.upinfo.plantstatus = '0';
      this.upinfo.plant_day = moment().format('YYYY-MM-DD');
      this.$nextTick(() => {
        this.$refs.refFileupload.resetm();
      });
    },
    openPopup() {
      this.mode = 'new';
      this.$log.debug('opend');
      this.reset();
      this.load_myplant();
      this.is_open = true;
    },
    load_myplant() {
      this.$log.debug('load_myplant');
      apilist.getMyplantList()
        .then((result) => {
          this.myplant = result.data;
          this.$log.debug(this.myplant);
        })
        .catch((e) => {

        });
    },
    closePopup() {
      this.$log.debug('closePopup');
      this.is_open = false;
    },
    onCancel() {
      this.closePopup();
    },
    dateFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    // img_change() {
    //   this.imgfile = this.$refs.imgdata.files;
    //   this.$log.debug(this.imgfile);
    //   // this.$log.debug(this.imgfile.name);
    //   if (this.imgfile && this.imgfile !== 'undefined') {
    //     this.imgfilename = this.imgfile[0].name;
    //   } else {
    //     this.imgfilename = '';
    //   }
    // },
    async onVerify() {
      // this.$log.debug('onVerify');
      if (!this.upinfo.title || this.upinfo.title.length < 1) {
        this.onError('제목을 입력하세요.');
        this.$refs.title.focus();
        return;
      }
      if (this.upinfo.item_seq < 1) {
        this.onError('작물을 선택하세요.');
        return;
      }
      try {
        const data = {};
        this.$log.debug(this.upinfo);
        await apilist.createList(this.upinfo)
          .then((result) => {
            this.$log.debug(result);
            this.imgUpload(result);
          })
          .catch((e) => {
            this.$log.error(e);
            this.onError(e);
          });
      } catch (e) {
        EventBus.emit('nowLoading', false);
        this.cancel_source = null;
        if (!this.is_cancel) {
          this.onUploadFail(e, '');
        }
      }
    },
    async imgUpload(info) {
      try {
        let target_file = null;
        if (this.imgfile && this.imgfile !== 'undefined') {
          target_file = this.imgfile[0];
        }
        this.$log.debug('target_file ', target_file);
        const cancel_token = axios.CancelToken;
        this.cancel_source = cancel_token.source();
        const upload_form_data = new FormData();
        if (target_file && target_file.name) {
          upload_form_data.append('f1', target_file);
        } else {
          upload_form_data.append('f1', null);
        }
        EventBus.emit('nowLoading', true, 1.0, 'loading....');
        await apilist.createFile(upload_form_data, info.seq, this.onUploadProgress, this.cancel_source)
          .then((result) => {
            EventBus.emit('nowLoading', false);
            this.cancel_source = null;
            const file_name = '';
            this.$log.debug('result = ', result);
            if (result.error) {
              if (this.is_cancel) {
                // this.$emit('onUploadCancel');
              } else {
                this.onUploadFail(result, file_name);
              }
            } else {
              this.is_file_uploaded = true;
              this.onUploadComplete();
            }
          });
      } catch (e) {
        this.$log.error(e);
        this.onError(e);
      }
    },
    onUploadComplete() {
      setTimeout(() => {
        this.is_upload_complete = true;
        this.is_upload_progress = false;
        this.onSuccess('업로드 성공');
        this.$emit('onUploadSucess');
        this.closePopup();
      }, 500);
    },
    onUploadFail(error, file_name) {
      this.$log.debug(error);
      const message = `${file_name} 업로드 실패 하였습니다.`;
      this.onError(message);
    },
    onUploadProgress(e) {
      this.$log.debug('data ', e);
      // const file_seq = this.uploadFiles[this.current_idx].file_seq;
      // // this.$log.debug('data ', this.$refs[`p_${file_seq}`][0]);
      // const fileref = this.$refs[`p_${file_seq}`][0];
      // fileref.style.display = 'block';
      // this.current_progress = Math.round((e.loaded * 1000) / e.total) / 10 || 0;
      // this.total_progress = Math.round((this.upload_file_size + e.loaded) * 1000 / this.c_total_file_size) / 10;
      // this.progress_percent = this.getPercent(this.current_progress, 100);
      // fileref.style.width = this.progress_percent;
      // this.total_percent = this.getPercent(this.total_progress, 100);
      // this.$log.debug('data upload', file_seq, this.total_percent);
      // this.$log.debug('total', this.current_progress, this.total_progress);
    },
    uploadCancel() {
      this.is_cancel = true;
      if (this.cancel_source) {
        this.cancel_source.cancel('cancel');
      }
    },
  },
}
</script>

<style scoped>
.upload_popup {
  width: 780px;
  padding-bottom: 50px;
}

.input_box{
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}


.btn.newgreen.next {
  width: 160px;
  height: 50px;
  margin-left: 10px;
  border-radius: 6px;
}


</style>
