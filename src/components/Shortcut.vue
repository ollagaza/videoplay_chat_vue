<template>
  <div class="shortcut_wrapper">
    <div class="top_btn">
      <div class="delete_btn" v-on:click.stop="onCloseShortcut"></div>
    </div>
    <div class="shortcut_list_wrapper">
      <template v-for="shortcut_info in shortcut_list">
        <ShortcutItem v-bind:shortcut_info="shortcut_info"></ShortcutItem>
      </template>
    </div>
  </div>
</template>

<script>
import ShortcutItem from './ShortcutItem';

export default {
  name: 'Shortcut',
  components: { ShortcutItem },
  props: ['shortcut_list'],
  methods: {
    onCloseShortcut() {
      this.$emit('onCloseShortcut');
    },
  },
};
</script>

<style scoped>
.shortcut_wrapper {
  width: 100%;
  height: 100%;
  padding: 0 5px 0 0px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  /*cursor: pointer;*/
  display: flex;
  flex-direction: column;
}
.shortcut_wrapper > .top_btn {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
  flex-shrink: 0;
}
.shortcut_wrapper > .shortcut_list_wrapper {
  flex: 1;
  width: 100%;
  overflow: auto;
  padding-right: 5px;
}
</style>
