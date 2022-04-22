<template>
  <div class="select_item" v-on:click="onSelect" v-bind:class="{ fixed: fixed }" v-tooltip="c_tooltip_option">
    <span class="check_box" v-bind:class="{ on: c_is_on }"></span>
    <span class="select_text" v-bind:class="{ on: c_is_on }">{{ option.name }}</span>
  </div>
</template>

<script>
  export default {
    name: 'SelectableItem',
    props: ['option', 'option_id', 'type_id', 'meta_data_map', 'fixed'],
    data() {
      return {
        map: this.meta_data_map,
      };
    },
    computed: {
      c_is_on() {
        return this.map[this.option_id] === true;
      },
      c_tooltip_option() {
        return {
          content: this.option.tooltip,
          placement: 'bottom-center',
          classes: ['select_option_comment'],
          targetClasses: ['it-has-a-tooltip'],
          offset: 0,
          delay: {
            show: 200,
            hide: 300,
          },
        };
      },
    },
    watch: {
    },
    methods: {
      onSelect() {
        this.$emit('onSelect', this.type_id, this.option_id);
      },
    },
  };
</script>

<style scoped>

  .select_item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-right: 15px;
    cursor: pointer;
    flex-shrink: 0;
    padding: 2px 0;
  }
  .select_item.fixed {
    flex-basis: 160px;
    width: 160px;
    flex-shrink: 0;
    flex-grow: 0;
    margin-right: 5px;
  }
  .select_item .select_text {
    margin-left: 5px;
    flex-shrink: 0;
    flex-grow: 0;
  }
  .select_item.fixed .select_text {
    max-width: 130px;
  }
  .select_item .select_text.on {
    color: #2e6bb8;
  }
  .select_item .check_box {
    margin-top: 1px;
  }
</style>
