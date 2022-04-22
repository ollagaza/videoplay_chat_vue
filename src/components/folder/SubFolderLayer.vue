<template>
  <div class="folder_layer_dim" v-on:click="closeLayer" v-bind:class="{ on: is_open }">
    <div class="folder_layer" ref="folder_layer">
      <div class="folder" v-on:click="onFolderClick(null)">
        <img src="/img/renewal/folder/lnb_folder_icon.png">
        <span>전체목록</span>
      </div>
      <template v-for="(folder_info, index) in folder_list">
        <div class="folder" :style="{ paddingLeft: `${(10 * (index + 1)) + 14}px` }" v-on:click="onFolderClick(folder_info)">
          <img src="/img/renewal/folder/lnb_folder_icon.png">
          <span>{{folder_info.folder_name}}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubFolderLayer',
  data() {
    return {
      is_open: false,
      folder_list: {},
    };
  },
  methods: {
    openLayer(folder_list, click_event) {
      this.is_open = true;
      this.folder_list = folder_list;
      this.$refs.folder_layer.style.top = `${click_event.getBoundingClientRect().bottom}px`;
      this.$refs.folder_layer.style.left = `${click_event.getBoundingClientRect().left}px`;
    },
    closeLayer() {
      this.is_open = false;
      this.folder_list = {};
    },
    onFolderClick(folder_info) {
      this.$emit('onFolderClick', folder_info);
    },
  },
};
</script>

<style scoped>
.folder_layer_dim {
  display: none;
  position: fixed;
  z-index: 150;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0);
}

.folder_layer_dim.on {
  display: block;
}

.folder_layer {
  position: fixed;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  min-height: 30px;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #aaaaaa;
  border-radius: 4px;
  box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  z-index: 160;
}
.folder_layer > .folder {
  display: flex;
  flex-direction: row;
  min-width: 92px;
  height: 30px;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 4px;
  background-color: #ffffff;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  font-weight: 300;
  font-size: 13px;
  color: #555555;
}
.folder_layer > .folder > img {
  width: 14px;
  height: 12px;
  object-fit: cover;
  margin-right: 8px;
}
.folder_layer > .folder:hover {
  background-color: #f5f5f5;
}
</style>
