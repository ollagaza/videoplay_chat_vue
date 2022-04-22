<template>
  <ul class="list_item_wrapper" v-on:contextmenu.stop.prevent="OpenContextMenu($event)" v-bind:class="{ not_clickable: menu === 'trash', checked: checked }">
    <template v-if="!c_is_trash">
      <template><!--  v-if="drive_permission.admin" -->
        <li class="f_w_40 p_a_5" v-on:click.stop="onCheckBoxClick"><span class="check_box" v-bind:class="{ on: checked }"></span></li>
      </template>
      <li class="f_w_80 small_font">{{ operation_info.seq }}</li>
      <li class="f_w_40"><img v-bind:src="c_mode_image"> </li>
      <li class="flex pointer" v-on:click="onItemClick"><div class="ellipsis max_100p hover_point pr_5" v-bind:title="operation_info.operation_name">{{ operation_info.operation_name }}<span class="comment_count">{{ c_comment_count }}</span></div><div v-bind:class="{ new_icon: c_is_new }"></div></li>
      <li class="f_w_110 small_font pointer" v-on:click="onMemberContextPopup($event)"><div class="ellipsis max_100p" v-bind:title="c_name">{{ c_name }}</div></li>
      <li class="f_w_110 small_font">{{ c_operation_date }}</li>
      <li class="f_w_110 small_font">{{ c_reg_date }}</li>
      <li class="f_w_80 small_font" v-html="c_anno_count"></li>
<!--      <li class="f_w_40 small_font" v-html="c_patient_info_age"></li>-->
<!--      <li class="f_w_40 small_font" v-html="c_patient_info_sex"></li>-->
      <template v-if="c_is_upload">
        <li class="f_w_80 small_font">업로드 중</li>
      </template>
      <template v-else-if="c_is_progress_error">
        <li class="f_w_80 small_font" style="color: #dddddd;" v-bind:title="c_progress_error_message">보류</li>
      </template>
      <template v-else-if="c_is_progress">
        <li class="f_w_80 small_font" style="color: #ffa00f;"><img src="/img/renewal/drive/analysis_icon.gif">&nbsp;{{ c_process_title }}</li>
      </template>
      <template v-else>
        <li class="f_w_80 small_font">{{ c_file_size }}</li>
      </template>
<!--      <li class="f_w_30"><div class="delete_btn" v-on:click.stop="onDeleteClick(TRASH)" v-bind:class="{ disable: !c_has_delete_permission }"></div></li>-->
    </template>
    <template v-else>
      <li class="f_w_40 p_a_5" v-on:click.stop="onCheckBoxClick"><span class="check_box" v-bind:class="{ on: checked, disable: !c_has_remove_permission }"></span></li>
      <li class="f_w_70 small_font">{{ operation_info.seq }}</li>
      <li class="f_w_30"><img v-bind:src="c_mode_image"> </li>
      <li class="flex"><div class="ellipsis max_100p hover_point pr_5" v-bind:title="operation_info.operation_name">{{ operation_info.operation_name }}</div><div v-bind:class="{ new_icon: c_is_new }"></div></li>
      <li class="f_w_80 small_font"><div class="ellipsis max_100p" v-bind:title="c_name">{{ c_name }}</div></li>
      <li class="f_w_80 small_font">{{ c_operation_date }}</li>
      <li class="f_w_80 small_font">{{ c_reg_date }}</li>
      <li class="f_w_80 small_font">{{ c_delete_user_name }}</li>
      <li class="f_w_80 small_font">{{ c_modify_date }}</li>
      <template v-if="c_is_upload">
        <li class="f_w_70 small_font">업로드 중</li>
      </template>
      <template v-else-if="c_is_progress_error">
        <li class="f_w_70 small_font" style="color: #dddddd;" v-bind:title="c_progress_error_message">보류</li>
      </template>
      <template v-else-if="c_is_progress">
        <li class="f_w_70 small_font" style="color: #ffa00f;"><img src="/img/renewal/drive/analysis_icon.gif">&nbsp;{{ c_process_title }}</li>
      </template>
      <template v-else>
        <li class="f_w_70 small_font">{{ c_file_size }}</li>
      </template>
    </template>
  </ul>
</template>

<script>
  import { mapGetters } from 'vuex';
  import util from '../../../utils/util';
  import * as Constants from '../../../constants';
  import ProgressBar from '../ProgressBar';
  import moment from 'moment/moment';
  import EventBus from '../../../utils/eventbus';
  import api_operation_data from '../../../api/ApiOperationData';
  import BaseMixin from '../../../components/Mixins/BaseMixin';

  export default {
    name: 'OperationListItem',
    mixins: [BaseMixin],
    props: ['operation_info', 'index', 'list_no', 'menu', 'is_right_click'],
    components: { ProgressBar },
    data() {
      return {
        checked: false,
        TRASH: Constants.TRASH,
        RESTORE: Constants.RESTORE,
        REMOVE: Constants.REMOVE,
      };
    },
    created() {
    },
    computed: {
      ...mapGetters(['member_seq']),
      c_is_trash() {
        return this.menu === 'trash';
      },
      c_is_image_mode() {
        return this.operation_info.mode === 'file';
      },
      c_mode_image() {
        if (this.c_is_image_mode) {
          return '/img/renewal/drive/img_icon.png';
        }
        return '/img/renewal/drive/video_icon.png';
      },
      c_name() {
        return this.use_nickname ? this.operation_info.user_nickname : this.operation_info.user_name;
      },
      c_process_title() {
        if (this.operation_info.mode === 'file') {
          return '작업중';
        }
        return '인코딩';
      },
      c_is_analysis_complete() {
        return this.operation_info.status === 'Y' && this.operation_info.analysis_status === 'Y';
      },
      c_link() {
        if (this.operation_info) {
          return this.operation_info.has_link > 0;
        }
        return false;
      },
      c_is_upload() {
        return this.operation_info.analysis_status === 'N';
      },
      c_is_progress_error() {
        return this.operation_info.analysis_status === 'E';
      },
      c_progress_error_message() {
        if (this.operation_info.encoding_info) {
          return this.operation_info.encoding_info.message;
        }
        return '';
      },
      c_is_progress() {
        if (this.operation_info.analysis_status === 'N' || this.operation_info.analysis_status === 'Y') {
          return false;
        }
        return true;
      },
      c_button_class() {
        if (this.operation_info.analysis_status === 'Y') {
          return 'blue';
        }
        return '';
      },
      c_button_text() {
        switch (this.operation_info.analysis_status) {
          case 'N':
            return '분석요청';
          case 'Y':
            return '분석완료';
          default:
            break;
        }
        if (this.operation_info.progress > 0) {
          return '분석중';
        }
        return '대기중';
      },
      c_favorite() {
        if (this.operation_info) {
          return this.operation_info.is_favorite;
        }
        return false;
      },
      c_sharing() {
        if (this.operation_info) {
          return this.operation_info.is_sharing;
        }
        return false;
      },
      c_operation_date() {
        const operation_date = this.operation_info.operation_date;
        if (!operation_date) {
          return '-';
        }
        return operation_date;
      },
      c_reg_date() {
        const reg_date = this.operation_info.reg_date;
        if (!reg_date) {
          return '-';
        }
        return `${util.getDateStr3(reg_date.substr(0, 10), 'date')}`;
      },
      c_modify_date() {
        const modify_date = this.operation_info.modify_date;
        if (!modify_date) {
          return '-';
        }
        return `${modify_date.substr(0, 10)}`;
      },
      c_patient_info() {
        const info_arr = [];
        let join_text = ' / ';
        if (this.operation_info.patient_age) {
          info_arr.push(this.operation_info.patient_age);
        } else {
          info_arr.push('N/A');
          join_text = '<br/>';
        }
        if (this.operation_info.patient_sex) {
          info_arr.push(util.getSexKr(this.operation_info.patient_sex));
        } else {
          info_arr.push('N/A');
          join_text = '<br/>';
        }
        return info_arr.join(join_text);
      },
      c_patient_info_age() {
        let rtn_text = '';
        if (this.operation_info.patient_age) {
          rtn_text = this.operation_info.patient_age;
        } else {
          rtn_text = 'N/A';
        }
        return rtn_text;
      },
      c_patient_info_sex() {
        let rtn_text = '';

        if (this.operation_info.patient_sex) {
          rtn_text = util.getSexKr(this.operation_info.patient_sex);
        } else {
          rtn_text = 'N/A';
        }
        return rtn_text;
      },
      c_file_size() {
        if (this.operation_info.total_file_size <= 0) {
          return '-';
        }
        return util.fileSizeText(this.operation_info.total_file_size);
      },
      c_file_count() {
        if (this.operation_info.total_file_count <= 0) {
          return '-';
        }
        return util.numberFormat(this.operation_info.total_file_count);
      },
      c_anno_count() {
        if (this.operation_info.anno_count <= 0) {
          return '-';
        }
        return util.numberFormat(this.operation_info.anno_count, 0);
      },
      c_comment_count() {
        if (this.operation_info.comment_count <= 0) {
          return '';
        }
        return ` (${util.numberFormat(this.operation_info.comment_count, 0)})`;
      },
      c_clip_count() {
        if (this.operation_info.clip_count <= 0) {
          return '-';
        }
        return util.numberFormat(this.operation_info.clip_count);
      },

      c_is_new() {
        // const time_diff = moment().diff(moment(this.operation_info.reg_date, 'YYYY-MM-DD HH:mm:dd'), 'hours');
        const time_diff = moment().diff(moment(this.c_reg_date, 'YYYY-MM-DD HH:mm:dd'), 'hours');
        return time_diff <= 24;
      },
      c_has_delete_permission() {
        return true;
        return this.operation_info.member_seq === this.member_seq;
      },
      c_delete_user_name() {
        const name = this.use_nickname ? this.operation_info.delete_user_nickname : this.operation_info.delete_user_name;
        if (this.operation_info.is_delete_by_admin) {
          if (name) return name;
          return '관리자';
        }
        return name || '-';
      },
    },
    methods: {
      onDownloadClick() {

        api_operation_data.getOperationVideoUrl(Constants.API_TYPE_DRIVE, this.operation_info.seq)
          .then((result) => {
            if (result.error !== 0) {
              this.onError(result.message, result, 'onDownloadClick');
            } else if (!result.download_url) {
              this.onError('수술/시술 동영상을 찾을 수 없습니다.', result, 'onDownloadClick');
            } else {
              const file_name = `${this.operation_info.operation_name ? this.operation_info.operation_name : this.operation_info.operation_code}.mp4`;
              util.downloadFile(document, file_name, result.download_url);
            }
          })
          .catch((error) => {
            this.$log.debug(error);
          });
      },
      onMemberContextPopup(event) {
        EventBus.emit('onMemberContextPopup', event, this.operation_info.member_seq);
      },
      OpenContextMenu(event) {
        if (this.is_right_click) {
          if (!this.checked) {
            this.$emit('removeSelectedItems');
            this.onCheckBoxClick();
          }
          if (this.c_is_trash) {
            return false;
          }
          EventBus.emit('onOpenContextMenu', event, 'video', this.operation_info);
          return false;
        }
        return false;
      },
      onItemClick() {
        this.$emit('videoplay', this.operation_info);
        // this.$emit('onItemClick', this.operation_info, this.index);
      },
      hasCheckPermission() {
        if (this.c_is_trash) {
          if (!this.c_has_remove_permission) return false;
        }
        return true;
      },
      onCheckBoxClick() {
        if (!this.hasCheckPermission()) return;
        this.checked = !this.checked;
        this.$emit('onItemCheckClick', this.checked);
      },
      isChecked() {
        return this.checked;
      },
      check(is_checked) {
        if (!this.hasCheckPermission()) return;
        this.checked = is_checked;
      },
      onButtonClick() {
        this.$emit('onItemButtonClick', this.operation_info, this.index);
      },
      onFavoriteClick() {
        this.$emit('onItemFavoriteClick', this.operation_info, this.index);
      },
      onShareClick() {
        this.$emit('onItemShareClick', this.operation_info, this.index);
      },
      onDeleteClick(type) {
        this.$emit('onItemDeleteClick', this.operation_info, type);
      },
      onLinkClick() {
        this.$emit('onLinkClick', this.operation_info, this.index);
      },
      preventEvent() {
        return false;
      },
      getOperationInfo() {
        return this.operation_info;
      },
      getOperationSeq() {
        if (!this.operation_info) return null;
        return this.operation_info.seq;
      },

      getPatientInfo() {
        const info_arr = [];
        if (this.operation_info.patient_age) {
          info_arr.push(this.operation_info.patient_age);
        }
        if (this.operation_info.patient_sex) {
          info_arr.push(util.getSexKr(this.operation_info.patient_sex));
        }
        return info_arr.join('/');
      },
    },
  };
</script>

<style scoped>
  .list_item_wrapper .list_icon_count > img {
    margin-right: 2px;
    margin-left: 4px;
  }
  .list_item_wrapper .list_icon_count > img.video {
    margin-right: 1px;
  }
  .list_item_wrapper .list_icon_count > img.report {
    margin-right: 3px;
  }
  .list_item_wrapper .list_icon_count > span {
    color: #aaaaaa;
    margin-right: 4px;
  }
</style>
