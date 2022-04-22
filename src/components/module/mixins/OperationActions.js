import _ from 'lodash';
import EventBus from '../../../utils/eventbus';
import * as Constants from '../../../constants';
import api_operation from '../../../api/ApiOperation';
import util from '../../../utils/util';
import { folder_info } from '../../../vuex/getters';
import BaseMixin from '../../../components/Mixins/BaseMixin';

const OperationActions = {
  mixins: [BaseMixin],
  data() {
    return {
    };
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {
  },
  methods: {
    closeConfirmPopup(message = null, is_error = false) {
      EventBus.emit('confirmPopupClose', true, message, is_error);
    },
    // 모든 폴더, 비디오 체크 해제
    removeSelectedItems() {
      if (this.$refs.operationFolderItem) {
        for (let i = 0; i < this.$refs.operationFolderItem.length; i++) {
          this.$refs.operationFolderItem[i].checked = false;
        }
      }
      if (this.$refs.operationListItem) {
        for (let i = 0; i < this.$refs.operationListItem.length; i++) {
          this.$refs.operationListItem[i].checked = false;
        }
      }
      this.i_folder_check_cnt = 0;
      this.i_check_cnt = 0;
    },
    // 폴더, 비디오 체크 리스트 Array Object return
    getSelectedItemList() {
      let count = 0;
      const operation_folder_list = [];
      const operation_info_list = [];

      if (this.$refs.operationFolderItem) {
        for (let i = 0; i < this.$refs.operationFolderItem.length; i++) {
          if (this.$refs.operationFolderItem[i].isChecked()) {
            operation_folder_list.push(this.$refs.operationFolderItem[i].getFolderInfo());
            count++;
          }
        }
      }
      if (this.$refs.operationListItem) {
        for (let i = 0; i < this.$refs.operationListItem.length; i++) {
          if (this.$refs.operationListItem[i].isChecked()) {
            operation_info_list.push(this.$refs.operationListItem[i].getOperationInfo());
            count++;
          }
        }
      }
      return { operation_folder_list, operation_info_list, select_count: count };
    },
    getSelectedItemSeqList() {
      let count = 0;
      const folder_seq_list = [];
      const operation_seq_list = [];

      if (this.$refs.operationFolderItem) {
        for (let i = 0; i < this.$refs.operationFolderItem.length; i++) {
          if (this.$refs.operationFolderItem[i].isChecked()) {
            if (!this.$refs.operationFolderItem[i] || !this.$refs.operationFolderItem[i].getFolderSeq()) continue;
            folder_seq_list.push(this.$refs.operationFolderItem[i].getFolderSeq());
            count++;
          }
        }
      }
      if (this.$refs.operationListItem) {
        for (let i = 0; i < this.$refs.operationListItem.length; i++) {
          if (this.$refs.operationListItem[i].isChecked()) {
            if (!this.$refs.operationListItem[i] || !this.$refs.operationListItem[i].getOperationSeq()) continue;
            operation_seq_list.push(this.$refs.operationListItem[i].getOperationSeq());
            count++;
          }
        }
      }
      return { folder_seq_list, operation_seq_list, select_count: count };
    },
    // 복사
    onCopySelectedClick() {
      if (this.i_folder_check_cnt > 0) return;
      EventBus.emit('onCopyMoveEvent', Constants.COPY);
    },
    // 이동
    onMoveSelectedClick() {
      EventBus.emit('onCopyMoveEvent', Constants.MOVE);
    },
    // 휴지통 데이터 삭제
    onRemoveItemsClick(all = false) {
      let counts = 0;
      let request_data = {};

      if (all) {
        request_data.folder_seq_list = [];
        request_data.operation_seq_list = [];
        if (this.$refs.operationFolderItem) {
          for (let i = 0; i < this.$refs.operationFolderItem.length; i++) {
            if (!this.$refs.operationFolderItem[i] || !this.$refs.operationFolderItem[i].getFolderSeq()) continue;
            request_data.folder_seq_list.push(this.$refs.operationFolderItem[i].getFolderSeq());
            counts++;
          }
        }
        if (this.$refs.operationListItem) {
          for (let i = 0; i < this.$refs.operationListItem.length; i++) {
            if (!this.$refs.operationListItem[i] || !this.$refs.operationListItem[i].getOperationSeq()) continue;
            request_data.operation_seq_list.push(this.$refs.operationListItem[i].getOperationSeq());
            counts++;
          }
        }
      } else {
        request_data = this.getSelectedItemSeqList();
        counts = request_data.select_count;
      }

      if (counts > 0) {
        const options = {};
        let message = '';
        const common_message = '<br/>휴지통에서 <span style="color: #ff0000">삭제</span>하신 항목은 복구 할 수 없습니다.';
        if (all) {
          message = '휴지통에 있는 전체항목 {counts}개를<br/>모두 <span style="color: #ff0000">삭제</span>하시겠습니까?{common_message}';
        } else {
          message = '{counts}개의 항목을 <span style="color: #ff0000">삭제</span>하시겠습니까?{common_message}';
        }
        this.$log.debug(this.$options.name, message);
        message = this.getLang(message);
        message = message.replace(/{counts}/g, counts);
        message = message.replace(/{common_message}/g, common_message);
        EventBus.emit('confirmPopupOpen', {
          type: Constants.REMOVE,
          info_list: request_data,
        }, message, this.actionOperationDatas, options);
      }
    },
    // 휴지통 전체 복원
    onRestoreAllClick() {
      if (this.c_operation_infos.length <= 0) {
        return;
      }
      const operation_info_list = [];
      for (let i = 0; i < this.c_operation_infos.length; i++) {
        operation_info_list.push(this.c_operation_infos[i]);
      }
      if (operation_info_list.length > 0) {
        const options = {};
        const message = '수술정보를 모두 <span style="color: #2e6bb8">복원</span>하시겠습니까?';
        EventBus.emit('confirmPopupOpen', {
          type: Constants.RESTORE,
          operation_info_list,
        }, message, this.actionOperationDatas, options);
      }
    },
    // 휴지통 복원
    onRestoreSelectedClick() {
      if (this.$refs.operationFolderItem || this.$refs.operationListItem) {
        const info_list = this.getSelectedItemList();
        const params = {
          type: Constants.RESTORE,
          info_list,
        };
        const options = {
          popup_image: '/img/renewal/drive/mark.png',
        };
        const message = '선택하신 수술정보를 모두 <span style="color: #2e6bb8">복원</span>하시겠습니까?';

        EventBus.emit('confirmPopupOpen', params, message, this.actionOperationDatas, options);
      }
    },
    // 선택 휴지통 이동
    onDeleteSelectedClick() {
      if (this.$refs.operationFolderItem || this.$refs.operationListItem) {
        const info_list = this.getSelectedItemList();
        if (info_list.select_count <= 0) {
          this.onError(this.getLang('선택된 항목이 없습니다.'));
          return;
        }
        const params = {
          type: Constants.TRASH,
          info_list,
        };
        const options = {
          popup_image: '/img/renewal/drive/mark.png',
        };
        let message = '';
        let chk_delete = true;

        if (this.folder_seq === null) {
          if (info_list.operation_folder_list.length === _.filter(this.folder_info.folder_map, item => util.getInt(item.depth) === 0 && item.status === 'Y').length) {
            chk_delete = false;
          }
        }
        if (chk_delete) {
          if (info_list.operation_folder_list.length > 0) {
            message = '선택한 항목을 삭제하시겠습니까?<br/>폴더내의 모든 파일과 클립도 함께 삭제되며<br/>중요목록에서도 삭제됩니다.<br/>삭제된 항목은 휴지통으로 이동합니다.';
          } else if (info_list.operation_info_list.length > 0) {
            message = '{operation_count}개의 항목을 삭제하시겠습니까?<br/>해당 동영상의 클립도 함께 삭제되며<br/>중요목록에서도 삭제됩니다.<br/>삭제된 항목은 휴지통으로 이동합니다.';
          }
          message = this.getLang(message);
          message = message.replace(/{operation_count}/g, info_list.operation_info_list.length);
          EventBus.emit('confirmPopupOpen', params, message, this.actionOperationDatas, options);
        } else {
          EventBus.emit('alertPopupOpen', null, '폴더 삭제가 불가능합니다.<br/>최소 한 개의 폴더가 존재해야 합니다.');
        }
      }
    },
    actionOperationDatas(data) {
      const params = { type: data.type, is_check_delete: true };
      if (data.info_list.operation_folder_list && data.info_list.operation_folder_list.length > 0) {
        params.operation_folder_list = data.info_list.operation_folder_list;
      }
      if (data.info_list.operation_info_list && data.info_list.operation_info_list.length > 0) {
        params.operation_info_list = data.info_list.operation_info_list;
      }
      if (data.info_list.folder_seq_list && data.info_list.folder_seq_list.length > 0) {
        params.folder_seq_list = data.info_list.folder_seq_list;
      }
      if (data.info_list.operation_seq_list && data.info_list.operation_seq_list.length > 0) {
        params.operation_seq_list = data.info_list.operation_seq_list;
      }

      if (data.type !== Constants.REMOVE) {
        if (params.operation_folder_list) {
          this.operationFolderStatusTrash(params);
        }
        if (params.operation_info_list) {
          this.operationVideoStatusTrash(params);
        }
      } else {
        this.operationTrashDataRemove(params);
      }
      EventBus.emit('onResetCheckCnt');
    },
    // 비디오 개별삭제
    onItemDeleteClick(operation_info, type) {
      let message;
      const options = {};
      let data = {};
      let callback = null;
      if (type === Constants.RESTORE) {
        this.checkOperationAbleRestore(operation_info, type);
        return;
      } else if (type === Constants.TRASH) {
        message = '수술정보가 휴지통으로 이동됩니다.<br/>수술정보를 <span style="color: #ff0000">삭제</span>하시겠습니까?';
        options.popup_image = '/img/renewal/drive/mark.png';
        callback = this.operationVideoStatusTrash;
        data = { type, operation_info_list: [operation_info] };
      } else if (type === Constants.REMOVE) {
        message = '수술정보를 영구삭제하면 복구가 불가능합니다.<br/>수술정보를 <span style="color: #ff0000">삭제</span>하시겠습니까?';
        options.popup_image = '/img/renewal/drive/mark.png';
        callback = this.operationDelete;
        data = operation_info;
      } else {
        return;
      }
      EventBus.emit('confirmPopupOpen', data, message, callback, options);
    },
    checkOperationAbleRestore(operation_info, type) {
      const data = { type, operation_info_list: [operation_info], folder_info: null };
      api_operation.isOperationAbleRestore(operation_info.seq)
        .then((result) => {
          if (result.is_able) {
            const message = this.getLang('수술정보를 <span style="color: #2e6bb8">복원</span>하시겠습니까?');
            EventBus.emit('confirmPopupOpen', data, message, this.operationVideoStatusTrash);
          } else if (result.error === 1) {
            this.showRedToast(this.getLang('수술정보가 존재하지 않습니다.'));
            this.$emit('removeOperation', operation_info.seq);
          } else if (result.error === 2) {
            this.showRedToast(this.getLang('상위폴더가 삭제되었습니다.<br/>수술을 복구할 폴더를 선택하세요.'));
            // this.$emit('removeOperation', operation_info.seq);
            EventBus.emit('onOperationFolderSelectOpen', '수술을 복구할 폴더를 선택하세요.', data, type, this.onOperationRestoreFolderSelect);
          } else if (result.error === 3) {
            this.showRedToast(this.getLang('상위폴더에 접근 권한이 없습니다.<br/>수술을 복구할 폴더를 선택하세요.'));
            // this.$emit('removeOperation', operation_info.seq);
            EventBus.emit('onOperationFolderSelectOpen', '수술을 복구할 폴더를 선택하세요.', data, type, this.onOperationRestoreFolderSelect);
          } else {
            this.showRedToast(this.getLang('수술을 복원할 수 없습니다.<br/>잠시후에 다시 시도해 주세요.'));
          }
          this.$log.debug(this.$options.name, '[checkOperationAbleRestore]', result);
        });
    },
    onOperationRestoreFolderSelect(data) {
      const request_data = data.target_data;
      request_data.folder_info = data.folder_info;
      const folder_name = data.folder_info.folder_name;
      const message = `<span style="color: #2e6bb8">'${folder_name}' 폴더에</span><br/>수술정보를 <span style="color: #2e6bb8">복원</span>하시겠습니까?`;
      EventBus.emit('confirmPopupOpen', request_data, message, this.operationVideoStatusTrash);
    },
    // 비디오 API Call
    operationVideoStatusTrash(data) {
      EventBus.emit('groupFolderSelectPopupClose');
      const operation_seq_list = [];
      for (let i = 0; i < data.operation_info_list.length; i++) {
        operation_seq_list.push(data.operation_info_list[i].seq);
      }
      const folder_info = data.folder_info;
      const is_trash = data.type === Constants.TRASH;
      const api = is_trash ? api_operation.updateOperationTrash : api_operation.deleteOperationTrash;
      api(operation_seq_list, folder_info)
        .then(({ error, message, status }) => {
          if (error !== 0) {
            this.closeConfirmPopup(message, true);
          } else {
            const store_folder_params = {};
            const store_params = {};
            for (let i = 0; i < data.operation_info_list.length; i++) {
              data.operation_info_list[i].status = status;
              store_folder_params.operation_info = data.operation_info_list[i];
              store_params.field_name = data.operation_info_list[i].mode === 'operation' ? 'video_count' : 'file_count';
              if (status.toString() === 'Y') {
                this.$store.commit('increase_folder_count', store_folder_params);
                this.$store.commit('increase_group_info_count', store_params);
              } else {
                this.$store.commit('decrease_folder_count', store_folder_params);
                this.$store.commit('decrease_group_info_count', store_params);
              }
            }
            if (data.is_check_delete && this.is_all_check) {
              this.onCheckAllClick();
            }
            this.closeConfirmPopup();
          }
        })
        .catch((error) => {
          this.$log.error(error);
          this.closeConfirmPopup(error.message, true);
        });
    },
    // 선택한 비디오 삭제
    operationTrashDataRemove(data) {
      /*
      request_data.folder_seq_list = [];
        request_data.operation_seq_list = [];
       */
      api_operation.deleteOperations(data)
        .then(({ error, message }) => {
          if (error !== 0) {
            this.closeConfirmPopup(message, true);
          } else {
            if (data.operation_seq_list) {
              for (let i = 0; i < data.operation_seq_list.length; i++) {
                this.$emit('removeOperation', data.operation_seq_list[i]);
              }
            }
            if (data.folder_seq_list) {
              this.$store.commit('deleteFolderInfoBySeq', { folder_seq_list: data.folder_seq_list, last_update: new Date() });
              this.folder_update_date = this.folder_last_update;
            }
            this.closeConfirmPopup();
          }
        })
        .catch((error) => {
          this.$log.error(error);
          this.closeConfirmPopup(error.message, true);
        });
    },
    // 비디오 완전 삭제
    operationDelete(operation_info) {
      const operation_seq = operation_info.seq;
      api_operation.deleteOperation(operation_seq)
        .then(({ error, message }) => {
          if (error !== 0) {
            this.closeConfirmPopup(message, true);
          } else {
            operation_info.status = 'D';
            this.$emit('removeOperation', operation_info.seq);
            this.closeConfirmPopup();
          }
        })
        .catch((error) => {
          this.$log.error(error);
          this.closeConfirmPopup(error.message, true);
        });
    },
  },
};

export default OperationActions;
