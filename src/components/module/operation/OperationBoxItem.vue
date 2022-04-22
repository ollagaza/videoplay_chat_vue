<template>
  <div class="box_item_wrapper" v-on:contextmenu.stop.prevent="OpenContextMenu($event)" v-bind:class="{ not_clickable: menu === 'trash', hide_buttons: c_is_hide_button, box_select_bg: checked }">
    <div class="box_thumbnail pointer" v-on:click="onItemClick" >
      <div class="video">
        <img :src="c_operation_thumbnail" onerror="this.style.display = 'none'">
        <div class="box_thumbnail_cover" v-bind:class="{ play: c_is_operation_mode, encoding: c_is_encoding }"></div>
        <template v-if="c_is_operation_mode">
          <div class="videotime">{{c_video_time}}</div>
        </template>
      </div>
    </div>
    <div class="box_content">
      <div class="content_top pointer" v-on:click="onItemClick" >
        <div class="content_row">
          <span class="content_number">{{ operation_info.seq }}</span>
        </div>
        <div class="content_row">
          <div class="content_title vertical_ellipsis" :title="operation_info.operation_name">{{ operation_info.operation_name }}<span class="comment_count">{{ c_comment_count }}</span><span class="ml_6" v-bind:class="{ anno_icon: c_is_annotation }"></span><span class="ml_10" v-bind:class="{ new_icon: c_is_new }"></span></div>
        </div>
      </div>
      <div class="box_bottom under_border pointer" v-on:click="onItemClick" >
        <div class="content_date">{{ c_reg_date }}</div>
        <div class="bottom_blank"></div>
        <div class="box_status" v-bind:class="{ no_boarder: c_is_progress }">
          <template v-if="c_is_upload">
            <span>업로드 중</span>
          </template>
          <template v-else-if="c_is_progress_error">
            <span style="color: #dddddd;" v-bind:title="c_progress_error_message">보류</span>
          </template>
          <template v-else-if="c_is_progress">
            <img src="/img/renewal/drive/analysis_icon.gif" style="transform: scale(0.7);"><span>&nbsp;{{ c_process_title }}</span>
          </template>
          <template v-else>
            <span>{{ c_file_size }}</span>
          </template>
        </div>
      </div>
      <template v-if="!c_is_hide_button">
        <div class="box_bottom">
          <template>
<!--            <template v-if="drive_permission.admin">-->
<!--              <span class="check_box right_margin" v-bind:class="{ on: checked }" v-on:click.stop="onCheckBoxClick"></span>-->
<!--            </template>-->
            <div class="upload_user_name pointer" v-on:click="onMemberContextPopup($event)">{{ c_name }}</div>
            <div class="bottom_blank"></div>
<!--            <template v-if="!c_is_progress">-->
<!--              <span class="share_btn left_margin" v-bind:class="{ on: c_link }" v-on:click.stop="onLinkClick"></span>-->
<!--            </template>-->
<!--            <span class="favorite_btn left_margin2" v-bind:class="{ on: c_favorite }" v-on:click.stop="onFavoriteClick"></span>-->
<!--            <span class="delete_btn left_margin" v-on:click.stop="onDeleteClick(TRASH)" v-bind:class="{ disable: !c_has_delete_permission }"></span>-->
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
  .box_item_wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 210px;
    height: 250px;
    margin: 0 10px 30px 10px;
    box-shadow: 0 5px 7px -5px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
  }
  .box_item_wrapper.hide_buttons {
    height: 170px;
  }
  .box_item_wrapper .box_thumbnail {
    position: relative;
    display: flex;
    flex: 1;
    width: 100%;
    height: 118px;
    flex-direction: column;
    overflow: hidden;
  }
  .box_item_wrapper:hover .box_thumbnail .box_thumbnail_cover {
    border-top-color: #2e6bb8;
    border-left-color: #2e6bb8;
    border-right-color: #2e6bb8;
  }
  .box_item_wrapper .box_thumbnail .box_thumbnail_cover.encoding {
    background-image: url('/img/renewal/drive/encoding.png');
    background-repeat: no-repeat;
    background-position: center center;
  }
  .box_item_wrapper .box_thumbnail .box_thumbnail_cover.play {
    background-image: url('/img/renewal/new_channel/play_icon.png');
    background-repeat: no-repeat;
    background-position: center center;
  }
  .box_item_wrapper:hover .box_content {
    border-bottom-color: #2e6bb8;
    border-left-color: #2e6bb8;
    border-right-color: #2e6bb8;
  }
  .box_item_wrapper .box_thumbnail .box_thumbnail_cover {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  .box_select_bg {
    background-color: #f6fcff;
  }
  .box_item_wrapper.box_select_bg .box_thumbnail .box_thumbnail_cover {
    border-top-color: #2e6bb8;
    border-left-color: #2e6bb8;
    border-right-color: #2e6bb8;
  }
  .box_item_wrapper.box_select_bg .box_content {
    border-bottom-color: #2e6bb8;
    border-left-color: #2e6bb8;
    border-right-color: #2e6bb8;
  }
  .box_item_wrapper.not_clickable .box_thumbnail {
    cursor: default;
  }
  .box_item_wrapper .box_thumbnail > .video {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('/img/renewal/mentoring/mteg_icon.png');
  }
  .box_item_wrapper .box_thumbnail > .video > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    background-color: #ffffff;
  }
  .box_item_wrapper .box_thumbnail > .video .videotime {
    position: absolute;
    height: 18px;
    right: 6px;
    bottom: 6px;
    background-color: rgba(0, 0, 0, 0.5);
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    padding: 0 4px;
  }
  .box_item_wrapper .box_content {
    border-style: solid;
    border-width: 0 1px 1px;
    border-color: #dddddd;
  }
  .box_item_wrapper .box_content .content_top {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 10px 16px 6px 16px;
    margin: 0;
  }
  .box_item_wrapper .box_content .content_top .content_row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
  }
  .box_item_wrapper .box_content .content_top .content_number {
    color: #555555;
    margin-right: 10px;
    font-weight: 400;
    font-size: 12px;
  }
  .box_item_wrapper .box_content .content_top .content_code {
    flex: 1;
    color: #aaaaaa;
    font-weight: 300;
    font-size: 12px;
  }
  .box_item_wrapper .box_content .content_title {
    font-size: 15px;
    line-height: 1.2;
    height: 36px;
    color: #333333;
    /* autoprefixer: ignore next */
    -webkit-line-clamp: 3;
    /* autoprefixer: ignore next */
  }
  .box_item_wrapper:hover .box_content .content_title {
    color: #2e6bb8;
  }
  .box_item_wrapper .box_content .content_patient_info {
    font-size: 12px;
    color: #aaaaaa;
    font-weight: 300;
    margin-top: 5px;
  }
  .box_item_wrapper .box_content .box_bottom .content_date {
    font-size: 12px;
    line-height: 1.6;
    color: #888888;
    font-weight: 300;
    letter-spacing: 0.05em;
  }
  .box_item_wrapper .box_content .box_status {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;
    font-weight: 300;
  }
  .box_item_wrapper .box_content .box_status span {
    color: #888888;
  }
  .box_item_wrapper .box_content .box_status.no_boarder span {
    color: #ffa00f;
  }
  .box_item_wrapper.not_clickable .box_content .box_status {
    cursor: default;
  }
  /*.box_item_wrapper .box_status .status_btn {*/
  /*  margin-left: 20px;*/
  /*}*/
  .box_item_wrapper .box_content .box_bottom {
    display: flex;
    flex-basis: 35px;
    height: 35px;
    flex-direction: row;
    padding: 0 10px;
    align-items: center;
  }
  .box_item_wrapper .box_content .box_bottom .upload_user_name {
    font-weight: 300;
    font-size: 13px;
    color: #555555;
  }
  .box_item_wrapper .box_content .box_bottom.under_border {
    border-bottom: 1px solid #dddddd;
  }
  .box_item_wrapper .box_content .box_bottom  > .btn {
    height: 24px;
    font-size: 13px;
  }
  .box_item_wrapper .box_content .box_bottom .bottom_blank {
    flex: 1;
  }
  .box_item_wrapper .box_content .box_bottom > span.left_margin {
    margin-left: 5px;
  }
  .box_item_wrapper .box_content .box_bottom > span.left_margin2 {
    margin-left: 7px;
  }
  .box_item_wrapper .box_content .box_bottom > span.right_margin {
    margin-right: 5px;
  }
</style>

<script>
  import { mapGetters } from 'vuex';
  import _ from 'lodash';
  import util from '../../../utils/util';
  import * as Constants from '../../../constants';
  import ProgressBar from '../ProgressBar';
  import moment from 'moment/moment';
  import EventBus from '../../../utils/eventbus';
  import BaseMixin from '../../../components/Mixins/BaseMixin';

  export default {
    name: 'OperationBoxItem',
    mixins: [BaseMixin],
    components: { ProgressBar },
    props: ['operation_info', 'index', 'menu', 'hide_buttons', 'select_item_seq', 'drive_permission'],
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
    watch: {
      select_item_seq() {
        this.checked = this.select_item_seq !== null ? this.select_item_seq === this.operation_info.seq : false;
      },
    },
    computed: {
      ...mapGetters(['member_seq']),
      c_has_delete_permission() {
        return true;
        return this.operation_info.member_seq === this.member_seq;
      },
      c_is_operation_mode() {
        return this.operation_info.mode === 'operation' && this.operation_info.analysis_status === 'Y';
      },
      c_is_encoding() {
        return this.operation_info.analysis_status !== 'Y';
      },
      c_is_image_mode() {
        return this.operation_info.mode === 'file';
      },
      c_name() {
        return this.operation_info.user_name;
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
      c_is_annotation() {
        if (this.operation_info.anno_count <= 0) {
          return false;
        }
        return true;
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
            return this.c_lang.S_0009;
          case 'Y':
            return this.c_lang.S_0010;
          default:
            break;
        }
        if (this.operation_info.progress > 0) {
          return this.c_lang.S_0011;
        }
        return this.c_lang.S_0012;
      },
      c_favorite() {
        if (this.operation_info) {
          return this.operation_info.is_favorite;
        }
        return false;
      },
      c_operation_date() {
        const operation_date = this.operation_info.operation_date;
        if (!operation_date) {
          return null;
        }
        return `${this.c_lang.C_0003}: ${operation_date} ${_.padStart(this.operation_info.hour, 2, '0')}:${_.padStart(this.operation_info.minute, 2, '0')}`;
      },
      c_reg_date() {
        const reg_date = this.operation_info.reg_date;
        if (!reg_date) {
          return '업로드 일자 없음';
        }
        return `업로드 ${reg_date.substr(0, 10)}`;
      },

      c_patient_info() {
        const info_arr = [];
        if (this.operation_info.patient_age) {
          info_arr.push(this.operation_info.patient_age);
        } else {
          info_arr.push(this.c_lang.C_0006);
        }
        if (this.operation_info.patient_sex) {
          info_arr.push(util.getSexKr(this.operation_info.patient_sex));
        } else {
          info_arr.push(this.c_lang.C_0007);
        }
        return info_arr.join(' / ');
      },

      c_is_new() {
        // const time_diff = moment().diff(moment(this.operation_info.reg_date, 'YYYY-MM-DD HH:mm:dd'), 'hours');
        const time_diff = moment().diff(moment(this.c_reg_date, 'YYYY-MM-DD HH:mm:dd'), 'hours');
        return time_diff <= 24;
      },
      c_is_hide_button() {
        return this.hide_buttons === true || this.hide_buttons === 'Y';
      },
      c_file_size() {
        if (this.operation_info.total_file_size <= 0) {
          return '-';
        }
        return util.fileSizeText(this.operation_info.total_file_size);
      },
      c_operation_thumbnail() {
        if (this.operation_info.thumbnail) {
          return this.operation_info.thumbnail;
        }
        return '';
      },
      c_video_time() {
        return util.formatSecToTime(this.operation_info.total_time, true);
      },
    },
    methods: {
      onMemberContextPopup(event) {
        EventBus.emit('onMemberContextPopup', event, this.operation_info.member_seq);
      },
      OpenContextMenu(event) {
        this.$emit('removeSelectedItems');
        this.onCheckBoxClick();
        EventBus.emit('onOpenContextMenu', event, 'video', this.operation_info);
      },
      onItemClick() {
        // this.$log.debug(this.operation_info);
        this.$emit('videoplay', this.operation_info);
        // this.$emit('onItemClick', this.operation_info, this.index);
      },
      onCheckBoxClick() {
        this.checked = !this.checked;
        this.$emit('onItemCheckClick', this.checked);
      },
      isChecked() {
        return this.checked;
      },
      check(is_checked) {
        this.checked = is_checked;
      },
      onButtonClick() {
        this.$emit('onItemButtonClick', this.operation_info, this.index);
      },
      onFavoriteClick() {
        this.$emit('onItemFavoriteClick', this.operation_info, this.index);
      },
      onLinkClick() {
        this.$emit('onLinkClick', this.operation_info, this.index);
      },
      onDeleteClick(type) {
        this.$emit('onItemDeleteClick', this.operation_info, type);
      },
      getOperationInfo() {
        return this.operation_info;
      },
      getOperationSeq() {
        if (!this.operation_info) return null;
        return this.operation_info.seq;
      },
    },
  };
</script>
