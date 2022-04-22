<template>
  <div class="popup_dim" v-if="is_open">
    <div class="popup folder_select">
      <div class="popup_title_top title">
        <span v-html="getLang(title)"></span>
        <span class="delete_btn" v-on:click.stop="closePopup"></span>
      </div>
      <div class="folder_tree">
        <OperationFolderTree ref="operationFolderTree" :options="folder_options" v-bind:grade="group_grade"></OperationFolderTree>
      </div>
      <div class="buttons">
        <div class="btn w120 h36 f15 r20 blue space10" v-on:click.stop="onSelectFolderConfirm">{{ getLang('확인') }}</div>
        <div class="btn w120 h36 f15 r20" v-on:click.stop="closePopup">{{ getLang('취소') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import OperationFolderTree from './OperationFolderTree';
  import * as Constants from '../../../constants';
  import util from '../../../utils/util';
  import { mapGetters } from 'vuex';
  import BaseMixin from '../../../components/Mixins/BaseMixin';
  import ChangeLang from './OperationFolderSelect.vue.lang';

  export default {
    name: 'OperationFolderSelect',
    components: { OperationFolderTree },
    mixins: [BaseMixin],
    data() {
      return {
        is_open: false,
        target_data: null,
        callback: null,
        contains_type: null,
        folder_options: null,
        title: '',
      };
    },
    computed: {
      ...mapGetters(['group_grade']),
    },
    created() {
      this.lang_map = ChangeLang;
    },
    methods: {
      onSelectFolderConfirm() {
        const selectedFolder = this.$refs.operationFolderTree.getSelectedFolder();
        const is_root_select = this.$refs.operationFolderTree.isRootSelected();
        if (!selectedFolder && !is_root_select) {
          this.showRedToast(this.getLang('폴더를 선택하세요.'));
          return;
        }
        if (this.callback) {
          this.callback({ target_data: this.target_data, folder_info: selectedFolder, is_root_select }, this.contains_type);
        }
      },
      openPopup(title, target_data, contains_type, callback = null, extra_options = null, open_tree = true) {
        this.title = util.trim(title) !== '' ? util.trim(title) : '폴더 선택';
        this.is_open = true;
        this.target_data = target_data;
        this.callback = callback;
        this.contains_type = contains_type;
        this.folder_options = {
          extend_all: open_tree,
          show_add_btn: true,
          node_max_width: 200,
          select_folder_seq: null,
          none_display_folder: null,
          display_node_css: {
            boxing: true,
          },
          check_auth: true,
          extra_options,
        };
        this.$log.debug(this.$options.name, this.folder_options);
      },
      closePopup() {
        this.is_open = false;
        this.target_data = null;
        this.callback = null;
        this.contains_type = null;
        this.folder_options = null;
      },
    },
  };
</script>

<style scoped>
  .folder_select {
    display: flex;
    flex-direction: column;
    width: 500px;
  }
  .popup_title_top.title {
    border-bottom: 0;
    font-size: 15px;
    font-weight: 400;
    color: #1a1a1a;
  }
  .folder_tree {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 230px;
    border: 1px solid #dddddd;
    border-radius: 6px;
    overflow: auto;
  }
  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding-top: 15px;
  }
</style>
