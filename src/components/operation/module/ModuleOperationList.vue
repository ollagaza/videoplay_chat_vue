<template>
  <div class="operation_create" id="prevent_drag" ref="prevent_drag">
    <template>
      <div class="content_layer" ref="contentWrapper">
        <div class="content_top">
          <div class="top_left_menu">
<!--            <template>-->
              <div class="btn w35 h35 pad5" v-on:click="onCheckAllClick"><span class="check_box" v-bind:class="{ on: c_is_all_checked }"></span></div>
<!--              <div class="btn h35 pad10 red_line_text" v-bind:class="{ hide: !c_has_checked_operation }" v-on:click="onRemoveItemsClick(false)"><span>영구 삭제</span></div>-->
<!--              <div class="btn h35 pad10 red_line_text" v-on:click="onRemoveItemsClick(true)"><img src="/img/renewal/drive/red_delete_icon.png"/><span>휴지통 비우기</span></div>-->

<!--            </template>-->
<!--            <template v-if="drive_permission.delete">-->
            <div class="btn blue h35 pad10" v-on:click="onRegClick"><span>업로드</span></div>
<!--            <div class="btn h35 pad10" v-on:click="onDeleteSelectedClick"><span>사용중지</span></div>-->
<!--            </template>-->
          </div>
          <div class="top_menu_blank"></div>
          <div class="top_search">
            <input type="text" v-model="search_input" :placeholder="'검색'" v-on:keyup.prevent="onSearchKeyPress"/>
            <span class="clear_btn on" v-on:click="onClearSearchClick"></span>
            <span class="search_btn" v-on:click="search"></span>
          </div>
          <template>
            <div class="top_right_menu">
              <div class="btn w35 h35" v-bind:class="{on: c_view_mode !== VIEW_MODE_ICON}"
                   v-on:click="onViewModeChange(VIEW_MODE_LIST)"><img src='/img/renewal/drive/view_list.png'/></div>
              <div class="btn w35 h35" v-bind:class="{on: c_view_mode === VIEW_MODE_ICON}"
                   v-on:click="onViewModeChange(VIEW_MODE_ICON)"><img src='/img/renewal/drive/view_thumbnail.png'/></div>
            </div>
          </template>
        </div>
        <div class="search_info">
          <template v-if="search_keyword">
            <span v-html="c_search_keyword_result_text"></span>
          </template>
          <span>전체 </span><span class="orange_text">{{c_total_count}}</span><span> 개 </span>
        </div>
        <template>
          <div class="content">
            <div class="drive_list_container">
              <OperationListHeader
                v-bind:sort_options="sort_options"
                v-bind:view_mode="c_view_mode"
                v-bind:selected_sort_option="selected_sort_option"
                v-on:onSortItemSelect="onSortItemSelect"
                v-bind:key="'list_header'">
              </OperationListHeader>
            </div>
            <div :class="c_folder_class">
              <template v-if="c_view_mode === VIEW_MODE_ICON" v-for="(operation_info, index) in c_operation_infos">
                <OperationBoxItem
                  ref="operationListItem"
                  v-bind:operation_info="operation_info"
                  v-bind:index="index"
                  v-bind:item="operation_info"
                  v-bind:key="`box_item_${operation_info.seq}`"
                  v-on:videoplay="videoplay"
                  v-on:onItemClick="onItemClick"
                  v-on:onLinkClick="onLinkClick"
                  v-on:onItemFavoriteClick="onItemFavoriteClick"
                  v-on:onItemDeleteClick="onItemDeleteClick"
                  v-on:onItemButtonClick="onItemButtonClick"
                  v-on:onItemCheckClick="onItemCheckClick"
                  v-on:removeSelectedItems="removeSelectedItems"
                ></OperationBoxItem>
              </template>
              <template v-if="c_view_mode === VIEW_MODE_LIST" v-for="(operation_info, index) in c_operation_infos">
                <OperationListItem style="width: 1610px;"
                  ref="operationListItem"
                  v-bind:operation_info="operation_info"
                  v-bind:index="index"
                  v-bind:list_no="c_list_length - index"
                  v-bind:item="operation_info"
                  v-bind:key="`list_item_${operation_info.seq}`"
                  v-bind:is_right_click="true"
                  v-on:videoplay="videoplay"
                  v-on:onItemClick="onItemClick"
                  v-on:onLinkClick="onLinkClick"
                  v-on:onItemFavoriteClick="onItemFavoriteClick"
                  v-on:onItemDeleteClick="onItemDeleteClick"
                  v-on:onItemButtonClick="onItemButtonClick"
                  v-on:onItemCheckClick="onItemCheckClick"
                  v-on:removeSelectedItems="removeSelectedItems"
                ></OperationListItem>
              </template>
            </div>
          </div>
        </template>

      </div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash';
import { ko, en } from 'vuejs-datepicker/dist/locale';
import moment from 'moment/moment';
import { mapActions, mapGetters } from 'vuex';
import api_operation from '../../../api/ApiOperation';
import * as Constants from '../../../constants';
import OperationListHeader from '../../../components/module/operation/OperationListHeader';
import OperationBoxItem from '../../../components/module/operation/OperationBoxItem';
import OperationListItem from '../../../components/module/operation/OperationListItem';
import OperationActions from '../../../components/module/mixins/OperationActions';

import util from '../../../utils/util';
import EventBus from '../../../utils/eventbus';
import BaseMixin from '../../../components/Mixins/BaseMixin';
// import ModuleOperationCreate from './ModuleOperationCreate';
// import Pages3 from '../../../pages/OperationView';

export default {
  name: 'OperationList',
  components: { OperationListHeader, OperationBoxItem, OperationListItem },
  props: ['type'],
  mixins: [OperationActions, BaseMixin],
  data() {
    return {
      search_input: '',
      view_mode: this.$cookies.get('cookie_view_mode'),
      VIEW_MODE_ICON: 'icon',
      VIEW_MODE_LIST: 'list',
      search_keyword: null,
      my_list: false,
      operation_info_list: [],
      mode: 'operationlist',
      selected_sort_option: null,
      sort_options: [
        { id: 'seq', text: '관리번호', lang: '관리번호', fields: 'seq', order: 'desc' },
        { id: 'operation_name', text: '제목', lang: '제목', fields: 'operation_name', order: 'desc' },
        { id: 'user_name', text: '올린 사람', lang: '올린 사람', fields: 'user_name', order: 'desc' },
        { id: 'operation_date', text: '수술 일자', lang: '수술 일자', fields: 'operation_date', order: 'desc' },
        { id: 'reg_date', text: '업로드 일자', lang: '업로드 일자', fields: 'reg_date', order: 'desc' },
        { id: 'age', text: '나이', lang: '나이', fields: 'patient_age', order: 'desc' },
        { id: 'sex', text: '성별', lang: '성별', fields: 'patient_sex', order: 'desc' },
        { id: 'total_file_size', text: '용량', lang: '용량', fields: 'total_file_size', order: 'desc' },
      ],
    };
  },
  created() {
    if (!this.selected_sort_option) {
      this.selected_sort_option = _.clone(this.sort_options[0]);
    }
  },
  mounted() {
    this.initData();
  },
  beforeDestroy() {
    // this.removeEventListener();
  },
  computed: {
    ...mapGetters([]),
    c_operation_list() {
      return this.operation_info_list;
    },
    c_folder_class() {
      let class_name = '';
      if (this.c_view_mode === this.VIEW_MODE_ICON) {
        class_name = 'drive_icon_container';
      } else {
        class_name = 'drive_list_container';
      }
      return class_name;
    },
    c_view_mode() {
      if (!this.view_mode) {
        this.view_mode = this.VIEW_MODE_LIST;
        this.$cookies.set('cookie_view_mode', this.view_mode);
      }
      return this.$cookies.get('cookie_view_mode');
    },
    c_total_count() {
      if (!this.c_operation_list) return 0;
      const video_count = _.filter(this.c_operation_list, item => item.mode === 'operation').length;
      const file_count = _.filter(this.c_operation_list, item => item.mode === 'file').length;
      return util.numberFormat(video_count + file_count, 0);
    },
    c_list_length() {
      return this.c_operation_infos.length;
    },
    c_operation_infos() {
      if (this.selected_sort_option.fields === 'operation_name') {
        return _.orderBy(this.c_operation_list, field => field[this.selected_sort_option.fields].toString().toLowerCase(), this.selected_sort_option.order);
      }
      // this.$log.debug(this.selected_sort_option.fields);
      // this.$cookies.set('cookie_sort_option', this.selected_sort_option.fields);

      return _.orderBy(this.c_operation_list, field => field[this.selected_sort_option.fields], this.selected_sort_option.order);
    },
    c_is_all_checked() {
      let rtn_bool = false;
      if (this.is_all_check) {
        if (this.$refs.operationListItem) {
          if (this.$refs.operationListItem.length) {
            let check_count = 0;
            for (let i = 0; i < this.$refs.operationListItem.length; i++) {
              if (this.$refs.operationListItem[i].isChecked()) {
                check_count++;
              }
            }
            if (check_count > 0) {
              rtn_bool = true;
            }
          }
        }
      }
      if (!rtn_bool) {
        this.is_all_check = false;
      }
      return rtn_bool;
    },
  },
  watch: {
  },
  methods: {
    ...mapActions(['UpdateUserData']),
    async initData() {
      this.showLoading();
      try {
        const params = {
          no_paging: 'y',
          summary: 'n',
          day: 7,
        };
        if (this.my_list === true) params.member_seq = this.member_seq;
        if (this.search_keyword) params.search_keyword = this.search_keyword;
        api_operation.getOperationList(params)
          .then((result) => {
            if (result.error || !result.data) {
              this.onError(result.message, result, 'loadOperationList');
              this.is_data_load_complete = true;
              return null;
            }
            this.operation_info_list = result.data;
            if (this.my_list) this.folder_list_visible = false;
            else this.folder_list_visible = true;
            if (callback) {
              return callback(null);
            }
            this.showLoading(false);
            return null;
          })
          .catch((error) => {
            this.is_data_load_complete = true;
            this.onError(this.getLang('수술정보를 불러올 수 없습니다.<br/>잠시후에 다시 시도해주세요.'), error, 'loadOperationList');
            this.showLoading(false);
          });

        // if (this.user_stored_data.operation_mode) {
        this.mode = 'operationlist';
        // }
        this.addEventListener();
        this.is_open = true;
        this.showLoading(false);
      } catch (e) {
        this.onInitDataError('정보를 확인할 수 없습니다. 잠시후에 다시 시도해 주세요.', e, 'initData');
      }
    },
    videoplay(operation_info) {
      // this.$log.debug(operation_info);
      const params = { operation_seq: operation_info.seq };
      params.is_List = '3';
      this.$router.push({ name: 'operationview', params });
    },
    addEventListener() {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
        this.$refs.prevent_drag.addEventListener(event_name, this.preventDragDefault, false);
      });
    },
    // removeEventListener() {
    //   ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((event_name) => {
    //     this.$refs.prevent_drag.removeEventListener(event_name, this.preventDragDefault);
    //   });
    //   this.$refs.thumbnail_image_box.removeEventListener('drop', this.onFileDrag);
    // },
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

    onInitDataError(message, error = null) {
      this.onError(message, error);
      this.onClosePopup();
    },
    onRegClick() {
      const params = {};
      params.is_list = '2';
      this.$router.push({ name: 'operation', params });

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
    onSearchKeyPress(event) {
      if (event.keyCode === 13) {
        this.search();
      } else if (event.keyCode === 27) {
        this.onClearSearchClick();
      }
    },
    onClearSearchClick() {
      this.search_keyword = '';
      this.search_input = '';
      this.search();
    },
    search() {
      const search = util.trim(this.search_input);
      this.$emit('loadOperationSearchList', search, this.my_list);
    },
    onItemClick(data, index, type) {
      this.$emit('showVideo', data.seq);
    },
    onLinkClick(operation_info) {
      this.$emit('onLinkClick', operation_info);
    },
    onItemButtonClick(operation_info) {
      if (operation_info.analysis_status === 'Y') {
        this.showVideo(operation_info.seq);
      } else if (operation_info.analysis_status === 'N') {
        const options = {};
        options.sub_message = this.c_lang.S_0001;
        options.sub_message2 = this.c_lang.S_0002;
        const message = this.c_lang.S_0003;
        EventBus.emit('confirmPopupOpen', operation_info, message, this.requestAnalysis, options);
      }
    },
    onItemFavoriteClick(operation_info, index) {
      this.operationStatusFavorite(operation_info);
    },
    onItemCheckClick(checked) {
      this.is_all_check = false;
      if (checked) {
        this.i_check_cnt++;
      } else {
        this.i_check_cnt--;
      }
    },
    onCheckAllClick() {
      this.changeAllChecked(!this.is_all_check);
    },
    changeAllChecked(checked) {
      this.i_folder_check_cnt = 0;
      this.i_check_cnt = 0;

      if (this.$refs.operationListItem && this.$refs.operationListItem.length) {
        for (let i = 0; i < this.$refs.operationListItem.length; i++) {
          this.$refs.operationListItem[i].check(checked);
          if (checked) this.i_check_cnt++;
        }
      }
      this.is_all_check = checked;
    },
    onViewModeChange(change_view_mode) {
      if (this.c_view_mode !== change_view_mode) {
        this.is_all_check = false;
        this.i_folder_check_cnt = 0;
        this.i_check_cnt = 0;
        this.view_mode = change_view_mode;
        this.is_change = false;
        this.$cookies.set('cookie_view_mode', change_view_mode);
      }
    },
    onSortItemSelect(item) {
      // this.$cookies.set('cookie_sort_option', item.fields);
      this.selected_sort_option = item;
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
.top_right_menu .btn {
  margin-left: 5px;
  background-color: #ffffff;
  border-color: #dddddd;
}
.top_right_menu .btn > img {
  opacity: 0.2;
}
.top_right_menu .btn:hover {
  opacity: 1;
  border-color: #aaaaaa;
}
.top_right_menu .btn:hover > img {
  opacity: 1;
}
.top_right_menu .btn.on {
  opacity: 1;
  cursor: default;
  background-color: #f5f5f5;
  border-color: #aaaaaa;
}
.top_right_menu .btn.on > img {
  opacity: 1;
}
.drive_icon_container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.drive_list_container {
  padding: 0 10px;
}
</style>
