<template>
  <div class="folder_wrapper" v-bind:style="{ width: c_width, height: c_height }">
    <div class="folder_container">
      <template v-if="!c_is_empty">
        <OperationFolderTreeNode ref="operationFolderTreeNode" v-bind:folder_info="c_folder_info" v-bind:is_root="true" v-bind:options="options" v-bind:grade="team_grade"></OperationFolderTreeNode>
      </template>
    </div>
    <OperationFolderCreatePopup ref="folderCreatePopup" v-on:onFolderCreated="onFolderCreated"></OperationFolderCreatePopup>
  </div>
</template>

<style scoped>
  .folder_wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .folder_wrapper .folder_container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 20px;
    overflow: auto;
  }
</style>

<script>
  import { mapGetters } from 'vuex';
  import OperationFolderTreeNode from './OperationFolderTreeNode';
  import OperationFolderCreatePopup from './OperationFolderCreatePopup';
  import EventBus from '../../utils/eventbus';
  // import api_folder from '../../api/ApiFolder';
  import * as Constants from '../../constants';
  import _ from 'lodash';

  export default {
    name: 'OperationFolderTree',
    props: ['options', 'grade'],
    components: { OperationFolderTreeNode, OperationFolderCreatePopup },
    data() {
      return {
        selected_folder: null,
        target_folder_info: null,
        target_group_info: null,
        team_grade: null,
      };
    },
    computed: {
      ...mapGetters(['folder_info', 'group_info']),
      c_width() {
        return this.options && this.options.width ? `${this.options.width}px` : null;
      },
      c_height() {
        return this.options && this.options.height ? `${this.options.height}px` : null;
      },
      c_folder_info() {
        const folder_info = {
          seq: null,
          group_seq: null,
          folder_name: null,
          parent_seq: null,
          parent_folder_list: [],
          status: 'Y',
          depth: 0,
          access_type: Constants.GROUP_GRADE_MANAGER,
          access_users: null,
          is_root: true,
          children: {},
        };
        if (this.target_group_info) {
          folder_info.group_seq = this.target_group_info.group_seq;
          folder_info.folder_name = this.target_group_info.group_name;
        }

        if (this.target_folder_info) {
          Object.keys(this.target_folder_info.folder_map).forEach((key) => {
            const child_node = this.target_folder_info.folder_map[key];
            if (child_node.status !== 'Y') return;
            if (!child_node.parent_seq) {
              folder_info.children[key] = child_node;
            }
          });
        }
        folder_info.children = _.keyBy(_.orderBy(folder_info.children, 'sort', 'asc'), item => `folder_${item.seq}`);
        return folder_info;
      },
      c_is_empty() {
        return this.target_folder_info === null;
      },
    },
    created() {
      this.target_folder_info = null;
      this.target_group_info = null;
      const plan_type = this.group_info.group_type === 'P' ? '님의 개인플랜' : '';
      const group_info = {
        group_seq: this.group_info.group_seq,
        group_name: `${this.group_info.group_name}${plan_type}`,
      };
      if (this.options) {
        if (this.options.empty_tree !== true) {
          this.target_folder_info = this.folder_info;
          this.target_group_info = group_info;
        }
      } else {
        this.target_folder_info = this.folder_info;
        this.target_group_info = group_info;
      }
      this.team_grade = this.grade;
      this.setSelectFolder(this.options.select_folder_seq);
      EventBus.on('onFolderSelect', this.onFolderSelect);
      EventBus.on('onFolderAdd', this.onFolderAdd);
    },
    beforeDestroy() {
      EventBus.off('onFolderSelect', this.onFolderSelect);
      EventBus.off('onFolderAdd', this.onFolderAdd);
    },
    methods: {
      changeFolderInfo(folder_info, group_info = null) {
        this.target_folder_info = null;
        this.setSelectFolder(null);
        if (group_info) {
          this.target_group_info = group_info;
          this.team_grade = `${group_info.grade}`;
        }
        this.$nextTick(() => {
          this.target_folder_info = folder_info;
        });
      },
      setSelectFolder(select_folder_seq) {
        if (select_folder_seq) {
          const key = `folder_${select_folder_seq}`;
          const select_folder_info = this.target_folder_info.folder_map[key];
          if (select_folder_info) {
            if (select_folder_info.parent_folder_list) {
              this.options.extend_map = {};
              select_folder_info.parent_folder_list.forEach((seq) => {
                this.options.extend_map[seq] = true;
              });
            }
          }
          this.$set(this.options, 'select_folder_seq', select_folder_seq);
          this.selected_folder = select_folder_info;
        } else {
          this.options.select_folder_seq = null;
          this.selected_folder = null;
        }
      },
      getSelectedFolder() {
        if (this.$refs.operationFolderTreeNode.isSelected()) {
          return this.$refs.operationFolderTreeNode.getFolderInfo();
        }
        return this.selected_folder;
      },
      isRootSelected() {
        return this.$refs.operationFolderTreeNode.isSelected();
      },
      getRootFolderInfo() {
        return this.$refs.operationFolderTreeNode.getFolderInfo();
      },
      onFolderSelect(selected, folder_info) {
        if (selected) {
          this.selected_folder = folder_info;
          this.$set(this.options, 'select_folder_seq', folder_info.seq);
        } else {
          this.selected_folder = null;
          this.$set(this.options, 'select_folder_seq', null);
        }
        this.$emit('onFolderSelected', folder_info);
      },
      onFolderAdd(folder_info) {
        this.$refs.folderCreatePopup.openPopup(folder_info, true);
      },
      onFolderCreated(created_folder_info, parent_folder_info = null) {
        api_folder.getGroupFolderInfo()
          .then((result) => {
            if (result.error) {
              this.$log.error(result);
              return null;
            }
            this.$store.commit('setFolderInfo', { folder_map: result.folder_map, last_update: result.last_update });
            this.$nextTick(() => {
              EventBus.emit('onFolderCreateComplete', parent_folder_info);
              this.target_folder_info = this.folder_info;
            });
            return null;
          })
          .catch((error) => {
            this.$log.error(error);
          });
      },
    },
  };
</script>

<style scoped>

</style>
