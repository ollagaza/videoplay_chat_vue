<template>
  <div class="tree_node no_select">
    <template v-if="is_root !== true">
      <div class="node_v_line" v-bind:class="{ last: is_last === true }"></div>
      <div class="node_h_line"></div>
    </template>
    <div class="node_wrapper" v-bind:class="{ root: is_root }">
      <div class="node_name"
           v-bind:class="{ selected: c_selected, disable: !c_is_enable }"
           v-on:click="onFolderClick()"
           v-on:dblclick.stop="onExtendClick()"
           v-bind:style="{ maxWidth: c_max_width }"
           v-bind:title="c_folder_name"
      >
        <template v-if="c_show_extend_icon">
          <img src="/img/renewal/common/arrow_side_icon.png" class="point_cursor" v-bind:class="{ rotate_90: c_is_show_children }" v-on:click.stop="onExtendClick()" title="extend folder">
        </template>
        <div v-else-if="c_show_empty_icon" class="empty_image"></div>
        <img v-bind:src="c_folder_img">
        <span class="ellipsis">{{ c_folder_name }}</span>
        <template v-if="c_is_show_add_btn && c_is_enable">
          <img src="/img/renewal/common/add_icon.png" title="add new folder" v-on:click.stop="onAddClick()">
        </template>
      </div>
      <template v-if="c_has_children">
        <div class="node_children_wrapper" v-bind:class="{ on: c_is_show_children }">
          <template v-for="(key, index) in c_children_keys">
            <OperationFolderTreeNode
              v-bind:folder_info="c_children[key]"
              v-bind:is_root="false"
              v-bind:is_last="index === c_last_child_index"
              v-bind:options="options"
              v-bind:grade="grade"
              v-bind:key="key"
            >
            </OperationFolderTreeNode>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.tree_node {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.tree_node > .node_v_line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dddddd;
}
.tree_node > .node_v_line.last {
  bottom: unset;
  height: 20px;
}
.tree_node > .node_h_line {
  flex: 0 0 20px;
  height: 1px;
  width: 20px;
  background-color: #dddddd;
  margin-top: 19px;
}
.tree_node > .node_wrapper {
  display: flex;
  flex-direction: column;
  padding-top: 5px;
}
.tree_node > .node_wrapper.root {
  padding-top: 0;
}
.tree_node > .node_wrapper > .node_name {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #e4f0f5;
  padding: 0 7px;
  border-radius: 6px;
  flex: 0 0 30px;
  height: 30px;
  width: fit-content;
  cursor: pointer;
  color: #333333;
  font-size: 13px;
  overflow: hidden;
}
.tree_node > .node_wrapper > .node_name.disable {
  /*pointer-events: none;*/
  cursor: default;
  opacity: 0.7;
  background-color: #eeeeee;
}
.tree_node > .node_wrapper > .node_name.selected {
  color: #ffffff;
  background-color: #2e6bb8;
}
.tree_node > .node_wrapper > .node_name > img {
  padding: 5px;
  transform-origin: center;
  /*transition-duration: 0.2s;*/
  /*transition-property: transform;*/
}
.tree_node > .node_wrapper > .node_name.selected > img {
  filter: brightness(1000%);
}
.tree_node > .node_wrapper > .node_name > img.rotate_90 {
  transform: rotate(90deg);
}
.tree_node > .node_wrapper > .node_name > span {
  flex: 1 0 0;
  margin: 0 10px 0 5px;
  font-size: 14px;
  font-weight: 400;
  padding-right: 5px;
  padding-bottom: 2px;
}
.empty_image {
  width: 20px;
  height: 20px;
}
.tree_node > .node_wrapper > .node_children_wrapper {
  position: relative;
  flex-direction: column;
  margin-left: 20px;
  display: none;
}
.tree_node > .node_wrapper > .node_children_wrapper.on {
  display: flex;
}
</style>

<script>
import EventBus from '../../utils/eventbus';
import _ from 'lodash';
import util from '../../utils/util';
import * as Constants from '../../constants';

export default {
  name: 'OperationFolderTreeNode',
  props: ['folder_info', 'is_last', 'is_root', 'options', 'grade'],
  components: {},
  data() {
    return {
      extend: false,
      selected: false,
    };
  },
  created() {
    EventBus.on('onFolderSelect', this.onFolderSelect);
    EventBus.on('onFolderCreateComplete', this.onFolderCreateComplete);
    EventBus.on('onHideChild', this.onHideChild);
    if (this.options) {
      this.extend = this.options.extend_all === true;
      if (this.options.extend_map && this.options.extend_map[this.c_folder_seq]) {
        this.extend = true;
      }
      this.selected = this.options.select_folder_seq === this.c_folder_seq;
    }
  },
  beforeDestroy() {
    EventBus.off('onFolderSelect', this.onFolderSelect);
    EventBus.off('onFolderCreateComplete', this.onFolderCreateComplete);
    EventBus.off('onHideChild', this.onHideChild);
  },
  computed: {
    c_folder_img() {
      if (!this.folder_info) return '/img/renewal/common/hard_icon.png';
      if (this.folder_info.is_root) {
        return '/img/renewal/common/hard_icon.png';
      }
      return '/img/renewal/common/folder_icon.png';
    },
    c_max_width() {
      return this.options && this.options.node_max_width ? `${this.options.node_max_width}px` : null;
    },
    c_is_show_add_btn() {
      return this.options && this.options.show_add_btn;
    },
    c_folder_name() {
      if (!this.folder_info) return '';
      return this.folder_info.folder_name;
    },
    c_folder_seq() {
      return util.getInt(this.folder_info.seq, null);
    },
    c_children() {
      if (!this.folder_info || !this.folder_info.children) {
        return null;
      }
      return _.filter(this.folder_info.children, item => item.status === 'Y');
    },
    c_children_keys() {
      if (!this.c_children) {
        return null;
      }
      return Object.keys(this.c_children);
    },
    c_children_count() {
      return this.c_children_keys ? this.c_children_keys.length : 0;
    },
    c_has_children() {
      return this.c_children_count > 0;
    },
    c_show_extend_icon() {
      return this.is_root === false && this.c_has_children;
    },
    c_show_empty_icon() {
      if (this.options) {
        if (this.options.hide_empty_icon === true) {
          return false;
        }
      }
      return this.is_root === false && !this.c_has_children;
    },
    c_is_show_children() {
      if (this.c_is_disable_show_children) return false;
      return this.is_root || (this.extend && this.c_has_children);
    },
    c_last_child_index() {
      return this.c_children_count - 1;
    },
    c_grade() {
      return `${util.trim(this.grade)}`;
    },
    c_is_group_admin() {
      if (!this.c_grade) return false;
      return this.c_grade === Constants.GROUP_GRADE_OWNER || this.c_grade === Constants.GROUP_GRADE_MANAGER || this.c_grade === Constants.GROUP_GRADE_ADMIN;
    },
    c_grade_num() {
      if (this.c_is_group_admin) {
        return 99;
      }
      return util.getInt(this.c_grade, 1);
    },
    c_is_check_auth() {
      if (!this.options) return false;
      return this.options.check_auth === true;
    },
    c_folder_grade() {
      if (!this.folder_info) return '1';
      return `${this.folder_info.access_type}`;
    },
    c_folder_grade_num() {
      if (this.is_root) return 99;
      if (this.c_folder_grade === Constants.GROUP_GRADE_OWNER || this.c_folder_grade === Constants.GROUP_GRADE_MANAGER || this.c_folder_grade === Constants.GROUP_GRADE_ADMIN) {
        return 99;
      }
      return util.getInt(this.c_folder_grade, 1);
    },
    c_is_enable() {
      if (this.c_is_disable) return false;
      if (!this.c_is_check_auth) return true;
      if (this.is_root) {
        return this.c_is_group_admin;
      }
      return this.c_grade_num >= this.c_folder_grade_num;
    },
    c_selected() {
      this.selected = this.options.select_folder_seq === this.c_folder_seq;
      return this.c_is_enable && this.selected;
    },
    c_disable_folder_map() {
      if (this.is_root) return null;
      if (this.options.extra_options && this.options.extra_options.disable_folder_map) {
        return this.options.extra_options.disable_folder_map[this.c_folder_seq];
      }
      return null;
    },
    c_is_disable() {
      if (this.c_disable_folder_map) {
        return this.c_disable_folder_map.disable === true;
      }
      return false;
    },
    c_is_disable_show_children() {
      if (!this.c_is_disable) return false;
      if (this.c_disable_folder_map) {
        return this.c_disable_folder_map.disable_show_children === true;
      }
      return false;
    },
  },
  methods: {
    onExtendClick() {
      this.extend = !this.extend;
      if (!this.extend) {
        EventBus.emit('onHideChild', this.folder_info);
      }
    },
    onFolderClick(force = false, is_select = false) {
      if (!this.c_is_enable) return;
      this.selected = force ? is_select : !this.selected;
      EventBus.emit('onFolderSelect', this.selected, this.folder_info);
    },
    onAddClick() {
      if (!this.c_is_enable) return;
      EventBus.emit('onFolderAdd', this.folder_info);
    },
    onFolderSelect(selected, folder_info) {
      if (!this.c_is_enable) return;
      if (this.c_folder_seq !== folder_info.seq) {
        this.selected = false;
      } else {
        this.selected = selected;
      }
    },
    onFolderCreateComplete(folder_info) {
      if (this.c_folder_seq === folder_info.seq) {
        this.extend = true;
      }
    },
    onHideChild(folder_info) {
      const seq = folder_info.seq;
      const parent_list = this.folder_info.parent_folder_list;
      if (_.indexOf(parent_list, seq) >= 0) {
        if (this.selected) {
          this.onFolderClick(true, false);
        }
      }
    },
    isSelected() {
      return this.c_selected;
    },
    getFolderInfo() {
      return this.folder_info;
    },
  },
};
</script>

<style scoped>

</style>
