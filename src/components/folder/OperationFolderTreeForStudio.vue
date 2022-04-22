<template>
  <div v-if="c_folder_info.status === 'Y' && data_manager.is_init_complete" class="no_select">
    <div v-if="is_visible" class="tree_node" :class="{ root: c_folder_info.is_root, depth: !is_root, selected: selected, white: is_white }" :style="c_depth" v-on:click="onFolderClick()" v-on:dblclick.stop="onExtendClick()" :title="c_folder_name">
      <div class="node_name" v-bind:class="{ selected: selected }">
        <div v-if="c_folder_info.is_root !== true && c_has_children_arrow" v-on:click.stop="onExtendClick()" class="folder_arrow">
          <img v-bind:class="c_folder_arrow_icon_class" src="/img/renewal/studio_new/studio_arrow.png" alt="arrow">
        </div>
        <div v-if="c_folder_info.is_root !== true && !c_has_children_arrow">
          <img src onerror class="empty_image" />
        </div>
        <div class="folder_icon_wrap">
          <img src="/img/renewal/studio_new/studio_folder.png" alt="folder">
        </div>
        <span class="ellipsis">{{ c_folder_name }}</span>
      </div>
    </div>
    <template v-if="c_has_children">
      <div class="node_children_wrapper" v-bind:class="{ on: c_is_show_children }">
        <template v-for="(key, index) in c_children_keys">
          <OperationFolderTreeForStudio
            v-bind:folder_info="c_children[key]"
            v-bind:is_root="false"
            v-bind:is_visible="true"
            v-bind:is_white="is_white"
            v-bind:is_last="index === c_last_child_index"
            v-bind:drive_event_bus="drive_event_bus"
            v-bind:data_manager="data_manager"
            v-bind:options="options">
          </OperationFolderTreeForStudio>
        </template>
      </div>
    </template>
    <div class="operation_list_wrap" v-bind:class="{ on: c_is_show_children }">
      <template v-for="(operation, index) in onFolderInOperationList(c_folder_info.seq)">
        <template v-if="operation.is_visible">
          <div class="operation_info" :class="{ white: is_white }" :style="onDepthOperation(c_folder_info)" :key="index" v-on:click="onOperationListClick(operation)" v-on:mousemove="onHoverOperationList($event, operation.seq)" v-on:mouseleave="onMouseLeaveOperationList">
            <div class="video_icon"><img src="/img/renewal/studio_new/studio_video_icon.png" :alt="operation.operation_name" /></div>
            <div class="ellipsis operation_name">{{ operation.operation_name }}</div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import EventBus from '../../../utils/eventbus';
import _ from 'lodash';
import util from '../../../utils/util';
import Svg_Control from '../../../components/Svg_Control';
import natsort from 'natsort';

export default {
  name: 'OperationFolderTreeForStudio',
  props: ['folder_info', 'is_last', 'is_root', 'is_visible', 'options', 'drive_event_bus', 'data_manager', 'is_white'],
  components: { Svg_Control },
  data() {
    return {
      extend: false,
      selected: false,
    };
  },
  created() {
    if (this.options) {
      this.extend = this.options.extend_all === true;
      if (this.options.extend_map && this.options.extend_map[this.c_folder_seq]) {
        this.extend = true;
      }
      if (this.is_root && this.options.default_root_selected) {
        this.selected = true;
      }
      if (!this.is_root && `${this.c_folder_info.seq}` === `${this.options.select_folder_seq}`) {
        this.selected = true;
      }
    }
  },
  mounted() {
  },
  beforeDestroy() {
  },
  computed: {
    c_folder_info() {
      return this.folder_info;
    },
    c_depth() {
      const default_padding = 20;
      let depth_padding = 30;
      if (this.c_folder_info.depth > 0) {
        depth_padding = ((this.c_folder_info.depth - 1) * 20) + default_padding;
        return `--depth: ${depth_padding}px`;
      }
      return '--depth: -20px';
    },
    c_folder_img() {
      if (this.c_folder_info.is_root) {
        return '/img/icon/menu/menu_icon01.png';
      }
      return '/img/renewal/new_channel/lnb_folder_icon.svg';
    },
    c_max_width() {
      return this.options && this.options.node_max_width ? `${this.options.node_max_width}px` : null;
    },
    c_is_show_add_btn() {
      return this.options && this.options.show_add_btn;
    },
    c_folder_name() {
      return this.c_folder_info.folder_name;
    },
    c_folder_seq() {
      return util.getInt(this.c_folder_info.seq, null);
    },
    c_children() {
      if (!this.c_folder_info || !this.c_folder_info.children) {
        return null;
      }

      return _.filter(this.c_folder_info.children, item => item.status === 'Y');
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
    c_has_children_arrow() {
      if (this.data_manager) {
        const get_folder_in_operation = this.data_manager.loadOperationInFolder(this.c_folder_info.seq);
        if (this.c_children_count > 0 || get_folder_in_operation.length > 0) {
          return true;
        }
      } else if (this.c_children_count > 0) {
        return true;
      }
      return false;
    },
    c_has_children() {
      return this.c_children_count > 0;
    },
    c_is_show_children() {
      if (!this.is_visible && (this.c_folder_info.is_root || this.is_root)) {
        this.extend = true;
      }
      return this.extend;
    },
    c_last_child_index() {
      return this.c_children_count - 1;
    },
    c_folder_arrow_icon_class() {
      return this.c_is_show_children ? 'folder_arrow_icon rotate_90' : 'folder_arrow_icon';
    },
  },
  methods: {
    onExtendClick() {
      this.extend = !this.extend;
      if (!this.extend) {
        // this.drive_event_bus.emit('onHideChild', this.c_folder_info);
      }
    },
    onFolderClick(force = false, is_select = false) {
      // if (this.options.event_type) {
      //   this.drive_event_bus.emit(this.options.event_type, this.selected, this.c_folder_info);
      // } else {
      //   this.selected = force ? is_select : !this.selected;
      //   this.drive_event_bus.emit('onFolderSelect', this.selected, this.c_folder_info);
      // }
    },
    onFolderSelect(selected, folder_info) {
      if (this.c_folder_seq !== folder_info.seq) {
        this.selected = false;
      }
    },
    onFolderCreateComplete(folder_info) {
      if (this.c_folder_seq === folder_info.seq) {
        this.extend = true;
      }
    },
    onHideChild(folder_info) {
      const seq = folder_info.seq;
      const parent_list = this.c_folder_info.parent_folder_list;
      if (_.indexOf(parent_list, seq) >= 0) {
        if (this.selected) {
          this.onFolderClick(true, false);
        }
      }
    },
    onFolderInOperationList(folder_seq) {
      if (this.data_manager) {
        const operation_list = this.data_manager.loadOperationInFolder(folder_seq);
        // this.$log.debug(this.$options.name, folder_seq, operation_list);
        const sorter = natsort();
        operation_list.sort((a, b) => sorter(b.operation_name, a.operation_name));
        return operation_list;
      }
      return [];
    },
    onDepthOperation(folder_info) {
      let depth = 20;
      if (folder_info.seq) {
        depth *= (folder_info.depth + 2);
      } else {
        return '--depth: 20px';
      }
      return `--depth: ${depth}px`;
    },
    onOperationListClick(operation) {
      this.data_manager.select_vid_name = operation.operation_name;
      EventBus.emit('onSaveBtnActivation');
      EventBus.emit('onOperationListClick', operation.seq, false);
    },
    onHoverOperationList(event, operation_seq) {
      EventBus.emit('onHoverOperationList', event, operation_seq);
    },
    onMouseLeaveOperationList() {
      EventBus.emit('onMouseLeaveOperationList');
    },
  },
};
</script>

<style scoped>

</style>

<style scoped>
.tree_node {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 0 10px 0 20px;
  color: #555555;
  cursor: pointer;
}
.tree_node.root {
  font-weight: 400;
  font-size: 16px;
}
.tree_node.depth {
  padding-left: var(--depth);
  font-weight: 400;
  font-size: 14px;
  border-bottom: 1px solid #292929;
}
.tree_node.depth.white {
  border-bottom: 1px solid #f5f5f5;
}
.tree_node.depth.selected,
.tree_node.depth:hover {
  /* background-color: #f5f5f5; */
  cursor: auto;
}
.tree_node.root.selected,
.tree_node.depth.selected .node_name,
.tree_node.depth:hover .node_name {
  /* filter: invert(34%) sepia(88%) saturate(707%) hue-rotate(181deg) brightness(70%) contrast(93%); */
}
.tree_node.root img {
  padding: 0;
  transform-origin: center;
  object-fit: none;
}
.tree_node.depth img {
  transform-origin: center;
  object-fit: none;
}
.rotate_90 {
  transform: rotate(90deg);
}
.folder_arrow_icon {
  width: 10px;
  height: 10px;
  fill: #888888;
}
.folder_icon {
  width: 14px;
  height: 12px;
  fill: #888888;
  margin: 0 6px 0 10px;
}
.node_name > .empty_image {
  width: 20px;
  height: 20px;
}
.tree_node .node_name {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 1;
  overflow: hidden;
}
.tree_node .node_name .folder_arrow {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.tree_node .node_name .folder_icon_wrap {
  width: 20px;
}
.tree_node.root .node_name {
  height: 40px;
}
.tree_node.depth .node_name {
  height: 30px;
}
.tree_node.depth .node_name > div:first-child {
  width: 20px !important;
}
.tree_node.root .node_name span {
  display: block;
  padding-left: 17px;
}
.tree_node.depth .node_name span {
  display: block;
  color: #888888;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.3px;
}
.node_children_wrapper {
  position: relative;
  flex-direction: column;
  display: none;
}
.node_children_wrapper.on {
  display: flex;
}
.operation_list_wrap {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.operation_list_wrap.on {
  display: flex;
}
.operation_list_wrap .operation_info {
  padding-left: var(--depth);
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  border-bottom: 1px solid #292929;
}
.operation_list_wrap .operation_info.white {
  border-bottom: 1px solid #f5f5f5;
  color: #888888;
}
.operation_list_wrap .operation_info:hover {
  background-color: #292929;
  cursor: pointer;
}
.operation_list_wrap .operation_info.white:hover {
  background-color: #f5f5f5;
  cursor: pointer;
  color: #2e6bb8;
}
.operation_list_wrap .operation_info .empty_image {
  flex: 0 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.operation_list_wrap .operation_info .video_icon {
  flex: 0 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.operation_list_wrap .operation_info .operation_name {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.3px;
}
</style>
