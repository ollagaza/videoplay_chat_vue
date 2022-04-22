<template>
  <div class="child_selector_wrapper">
    <SelectableItem v-on:onSelect="onSelect" v-bind:item="option" :option="option" :option_id="option_id" :type_id="type_id" :meta_data_map="meta_data_map" :fixed="true"></SelectableItem>
    <div class="child_list">
      <template v-for="(child_info, child_id) in option.child">
        <SelectableItem v-on:onSelect="onChildSelect" v-bind:item="child_info" :option="child_info" :option_id="child_id" :type_id="type_id" :meta_data_map="meta_data_map"></SelectableItem>
      </template>
    </div>
  </div>
</template>

<script>
  import SelectableItem from './SelectableItem';

  export default {
    name: 'ChildSelectableItem',
    props: ['option', 'option_id', 'type_id', 'meta_data_map'],
    components: { SelectableItem },
    data() {
      return {
        map: this.meta_data_map,
      };
    },
    computed: {
      c_is_on() {
        return this.map[this.option_id] === true;
      },
    },
    watch: {
    },
    methods: {
      onChildSelect(type_id, child_id) {
        this.$emit('onSelect', this.type_id, child_id, this.option_id);
      },
      onSelect() {
        this.$emit('onSelect', this.type_id, this.option_id, null, this.option.child);
      },
    },
  };
</script>

<style scoped>
  .child_selector_wrapper {
    display: flex;
    flex-shrink: 0;
    flex-grow: 1;
    align-items: flex-start;
    width: 100%;
    padding-top: 5px;
    margin-top: 3px;
    padding-bottom: 2px;
    border-top: 1px solid #eeeeee;
  }
  .child_selector_wrapper > .child_list {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    background-color: #f3f7f9;
    /*border: 1px solid #dddddd;*/
    padding: 3px 5px;
  }
  .child_selector_wrapper > .child_list::after {
    position: absolute;
    content: '';
    width: 8px;
    height: 8px;
    left: -8px;
    top: 4px;
    clip-path: polygon(0 0, 100% 0, 0 100%);
    transform-origin: right top;
    transform: rotate(-45deg);
    overflow: hidden;
    /*border-style: solid;*/
    /*border-color: #dddddd;*/
    /*border-width: 1px 0 0 1px;*/
    background-color: #f5f5f5;
  }
</style>
