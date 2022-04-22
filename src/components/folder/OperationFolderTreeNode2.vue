<template>
  <div v-if="c_folder_info.status === 'Y'" class="no_select">
    <div v-if="is_visible" class="tree_node" :class="{ root: c_folder_info.is_root, depth: !is_root, selected: selected }" :style="c_depth" v-on:click="onFolderClick()" v-on:dblclick.stop="onExtendClick()" :title="c_folder_name">
      <div class="node_name" v-bind:class="{ selected: selected }">
        <div v-if="c_folder_info.is_root !== true && c_has_children" v-on:click.stop="onExtendClick()">
          <Svg_Control
            v-bind:svg_file_path="'/img/renewal/new_channel/folder_arrow.svg'"
            v-bind:svg_class="c_folder_arrow_icon_class"
          />
        </div>
        <img v-else-if="c_folder_info.is_root !== true && !c_has_children" src onerror class="empty_image" />
        <div>
          <Svg_Control
            v-bind:svg_file_path="c_folder_img"
            v-bind:svg_class="'folder_icon'"
          />
        </div>
        <span class="ellipsis">{{ c_folder_name }}</span>
      </div>
    </div>
    <template v-if="c_has_children">
      <div class="node_children_wrapper" v-bind:class="{ on: c_is_show_children }">
        <template v-for="(key, index) in c_children_keys">
          <OperationFolderTreeNode2
            v-bind:folder_info="c_children[key]"
            v-bind:is_root="false"
            v-bind:is_visible="true"
            v-bind:is_last="index === c_last_child_index"
            v-bind:drive_event_bus="drive_event_bus"
            v-bind:options="options">
          </OperationFolderTreeNode2>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
  import EventBus from '../../../utils/eventbus';
  import _ from 'lodash';
  import util from '../../../utils/util';
  import Svg_Control from '../../../components/Svg_Control';

  export default {
    name: 'OperationFolderTreeNode2',
    props: ['folder_info', 'is_last', 'is_root', 'is_visible', 'options', 'drive_event_bus'],
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
          depth_padding = (this.c_folder_info.depth * 10) + default_padding;
          return `--depth: ${depth_padding}px`;
        }
        return `--depth: ${default_padding}px`;
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
      c_has_children() {
        return this.c_children_count > 0;
      },
      c_is_show_children() {
        if (!this.is_visible && (this.c_folder_info.is_root || this.is_root)) {
          this.extend = true;
        }
        return this.extend && this.c_has_children;
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
          this.drive_event_bus.emit('onHideChild', this.c_folder_info);
        }
      },
      onFolderClick(force = false, is_select = false) {
        if (this.options.event_type) {
          this.drive_event_bus.emit(this.options.event_type, this.selected, this.c_folder_info);
        } else {
          this.selected = force ? is_select : !this.selected;
          this.drive_event_bus.emit('onFolderSelect', this.selected, this.c_folder_info);
        }
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
}
.tree_node.depth.selected,
.tree_node.depth:hover {
  background-color: #f5f5f5;
}
.tree_node.root.selected,
.tree_node.depth.selected .node_name,
.tree_node.depth:hover .node_name {
  filter: invert(34%) sepia(88%) saturate(707%) hue-rotate(181deg) brightness(70%) contrast(93%);
}
.tree_node.root img {
  padding: 0;
  transform-origin: center;
  object-fit: none;
}
.tree_node.depth img {
  padding: 5px;
  transform-origin: center;
  object-fit: none;
  min-width: 24px !important;
}
.rotate_90 {
  transform: rotate(90deg);
}
.folder_arrow_icon {
  width: 10px;
  height: 10px;
  fill: #888888;
  margin: 0 4px 0 10px;
}
.folder_icon {
  width: 14px;
  height: 12px;
  fill: #888888;
  margin: 0 6px 0 10px;
}
.node_name > .empty_image {
  width: 24px;
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
.tree_node.root .node_name {
  height: 40px;
}
.tree_node.depth .node_name {
  height: 30px;
}
.tree_node.root .node_name span {
  display: block;
  padding-left: 17px;
}
.tree_node.depth .node_name span {
  display: block;
  padding-left: 3px;
}
.node_children_wrapper {
  position: relative;
  flex-direction: column;
  display: none;
}
.node_children_wrapper.on {
  display: flex;
}
</style>
