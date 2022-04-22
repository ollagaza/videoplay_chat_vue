<template>
  <div class="popup_dim" v-if="is_open">
    <div class="popup group_folder_select">
      <div class="popup_title_top title">
        <span>{{ '폴더 선택' }}</span>
        <span class="delete_btn" v-on:click.stop="closePopup"></span>
      </div>
      <div>
        <div class="selector_wrapper">
          <select v-on:change="onGroupChange" v-model="selected_group_info">
            <template v-for="group_info in group_list">
              <option v-bind:value="group_info" v-bind:selected="group_info.group_seq === selected_group_info.group_seq">{{ group_info.group_name }}</option>
            </template>
          </select>
        </div>
      </div>
      <div class="folder_tree_wrapper">
        <OperationFolderTree ref="operationFolderTree" v-bind:options="folder_options" v-bind:grade="team_grade"></OperationFolderTree>
      </div>
      <div class="buttons">
        <div class="btn w100 h30 blue space6" v-on:click.stop="onSelectFolderConfirm">{{ '확인' }}</div>
        <div class="btn w100 h30 space6" v-on:click.stop="closePopup">{{ '취소' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiGroup from '../../api/ApiGroup';
  import ApiFolder from '../../api/ApiFolder';
  import OperationFolderTree from './OperationFolderTree';
  import BaseMixin from '../../../components/Mixins/BaseMixin';
  import { mapGetters } from 'vuex';
  import ChangeLang from './GroupFolderSelectPopup.vue.lang';

  export default {
    name: 'GroupFolderSelectPopup',
    components: { OperationFolderTree },
    mixins: [BaseMixin],
    data() {
      return {
        is_open: false,
        folder_options: {
          empty_tree: false,
          extend_all: true,
          show_add_btn: false,
          node_max_width: 300,
          select_folder_seq: null,
          none_display_folder: null,
          hide_empty_icon: false,
          display_node_css: {
            boxing: true,
          },
          check_auth: true,
        },
        folder_map: {},
        target_data: null,
        callback: null,
        group_list: [],
        current_group_seq: null,
        selected_group_info: null,
        team_grade: 0,
        extra_options: null,
      };
    },
    computed: {
      ...mapGetters(['folder_info', 'group_seq']),
    },
    created() {
      this.lang_map = ChangeLang;
    },
    mounted() {
    },
    methods: {
      openPopup(target_data, callback = null, extra_options = null, open_tree = true) {
        this.resetData();
        this.showLoading(true);
        this.target_data = target_data;
        this.callback = callback;
        this.folder_options.extend_all = open_tree;
        this.folder_options.extra_options = extra_options;
        this.current_group_seq = `${this.group_seq}`;
        this.folder_map[this.current_group_seq] = this.folder_info;
        this.is_open = true;
        this.$log.debug(this.$options.name, '[this.folder_options]', this.folder_options);
        this.$nextTick(() => {
          this.loadGroupList();
        });
      },
      loadGroupList() {
        ApiGroup.getUserGroupList()
          .then((result) => {
            if (result.error || !result.member_group_list) {
              this.onError('플랜 목록을 불러올 수 없습니다.', result, 'loadGroupList');
              this.closePopup();
            } else {
              const group_list = [];
              for (let i = 0; i < result.member_group_list.length; i++) {
                const member_group_info = result.member_group_list[i];
                const group_seq = `${member_group_info.group_seq}`;
                const group_info = {
                  group_seq,
                  group_name: member_group_info.group_name,
                  grade: `${member_group_info.grade}`,
                };
                if (group_seq === this.current_group_seq) {
                  this.selected_group_info = group_info;
                }
                group_list.push(group_info);
              }
              this.group_list = group_list;
              this.onGroupChange();
            }
          });
      },
      onSelectFolderConfirm() {
        const selected_folder_info = this.$refs.operationFolderTree.getSelectedFolder();
        if (!selected_folder_info && !this.$refs.operationFolderTree.isRootSelected()) {
          this.onError('복사할 폴더를 선택하세요.');
          return;
        }
        this.callback({
          group_seq: this.current_group_seq,
          group_name: this.selected_group_info.group_name,
          folder_info: selected_folder_info,
          target_data: this.target_data,
        });
      },
      onGroupChange() {
        this.current_group_seq = this.selected_group_info.group_seq;
        this.loadFolderInfo(this.current_group_seq);
      },
      loadFolderInfo(group_seq) {
        this.showLoading(true);
        if (this.folder_map[group_seq]) {
          this.changeFolderTree(this.folder_map[group_seq]);
          this.$nextTick(() => {
            this.onSuccess();
          });
          return;
        }
        ApiFolder.getGroupFolderInfoByGroupSeq(group_seq)
          .then((result) => {
            if (result.error || !result.folder_map) {
              this.onError('폴더 목록을 불러올 수 없습니다.<br/>잠시후에 다시 시도해 주세요.', result, 'loadFolderInfo');
            } else {
              const folder_info = { folder_map: result.folder_map, last_update: result.last_update };
              this.folder_map[group_seq] = folder_info;
              this.changeFolderTree(folder_info);
              this.$nextTick(() => {
                this.onSuccess();
              });
            }
          });
      },
      changeFolderTree(folder_info) {
        this.$refs.operationFolderTree.changeFolderInfo(folder_info, this.selected_group_info);
      },
      closePopup() {
        this.is_open = false;
        this.$nextTick(() => {
          this.resetData();
        });
      },
      resetData() {
        this.folder_map = {};
        this.target_data = null;
        this.callback = null;
        this.group_list = [];
        this.current_group_seq = null;
        this.selected_group_info = null;
        this.extra_options = null;
      },
    },
  };
</script>

<style scoped>
  .popup.group_folder_select {
    width: 600px;
  }
  .popup_title_top.title {
    border-bottom: 0;
    font-size: 15px;
    font-weight: 300;
    color: #1a1a1a;
  }
  .selector_wrapper {
    margin: 0 0 10px 0;
    border-radius: 4px;
    border: 1px solid #dddddd;
  }
  .selector_wrapper > select {
    padding: 10px;
    background-position: right 10px center;
  }
  .folder_tree_wrapper {
    border: 1px solid #dddddd;
    flex: 0 0 200px;
    height: 200px;
  }
  .buttons {
    display: flex;
    margin: 20px 0;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
</style>
