<template>
  <div v-if="options">
    <template v-for="(option_info, type_id) in options">
      <div class="info_row">
        <label>
          <span v-html="option_info.label"></span>
          <span v-if="option_info.sub_label" v-html="option_info.sub_label" class="sub_label"></span>
        </label>
        <div class="info selector_wrapper">
          <div v-if="option_info.comment" class="option_comment">{{ option_info.comment }}</div>
          <template v-if="option_info.format === 'text'">
            <div class="input_wrapper input_option">
              <InputTextItem v-on:onTextChange="onTextChange" v-bind:item="option_info" :type_id="type_id" :option_info="option_info" :text="meta_data_map[type_id]"></InputTextItem>
            </div>
          </template>
          <template v-else>
            <div class="input_wrapper transparent check_list">
              <template v-for="(option, option_id) in option_info.data">
                <template v-if="option.child">
                  <ChildSelectableItem v-on:onSelect="onSelect" v-bind:item="option" :option="option" :option_id="option_id" :type_id="type_id" :meta_data_map="meta_data_map[type_id]"></ChildSelectableItem>
                </template>
                <template v-else>
                  <SelectableItem v-on:onSelect="onSelect" v-bind:item="option" :option="option" :option_id="option_id" :type_id="type_id" :meta_data_map="meta_data_map[type_id]"></SelectableItem>
                </template>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .sub_label {
    font-size: 12px;
    font-weight: 300;
    color: #aaaaaa !important;
  }
  .popup .popup_contents .info_table .info_row > .info.selector_wrapper {
    flex-direction: column;
    padding: 3px 10px;
  }
  .popup .popup_contents .info_table .info_row > .info.selector_wrapper .input_wrapper {
    /*border: none;*/
  }
  .popup .popup_contents .info_table .info_row > .info.selector_wrapper .input_wrapper.input_option {
    margin: 2px 0;
  }
  .popup .popup_contents .info_table .info_row > .info.selector_wrapper .input_wrapper.check_list {
    padding: 0;
    flex-wrap: wrap;
    position: relative;
  }
  .option_comment {
    width: 100%;
    padding: 5px 0 0 0;
    color: #2e6bb8;
    font-size: 13px;
  }
</style>

<script>
  import SelectableItem from './SelectableItem';
  import ChildSelectableItem from './ChildSelectableItem';
  import InputTextItem from '../../../../components/module/operation/InputTextItem';

  export default {
    name: 'MetaGastroesophagealEndoscopy',
    components: { SelectableItem, ChildSelectableItem, InputTextItem },
    data() {
      return {
        options: null,
        meta_data_map: null,
        parent_data_map: null,
        selected_type: null,
        selected_parent: null,
        child_list: null,
        parent_name: null,
        select_layer_top: 0,
      };
    },
    created() {},
    methods: {
      reset() {
        this.options = null;
        this.meta_data_map = null;
        this.parent_data_map = null;
      },
      getSelectedOptions() {
        const selected_option = {};
        Object.keys(this.meta_data_map).forEach((type_id) => {
          if (this.options[type_id].format === 'text') {
            selected_option[type_id] = this.meta_data_map[type_id];
          } else {
            selected_option[type_id] = [];
            Object.keys(this.meta_data_map[type_id]).forEach((option_id) => {
              if (this.meta_data_map[type_id][option_id] === true) {
                selected_option[type_id].push(option_id);
              }
            });
          }
        });
        return selected_option;
      },
      setOptions(new_options, stored_options = null) {
        this.options = null;
        this.meta_data_map = null;
        this.parent_data_map = null;
        this.$nextTick(() => {
          this.meta_data_map = {};
          this.parent_data_map = {};
          this.options = new_options;
          if (new_options) {
            if (stored_options) {
              Object.keys(stored_options).forEach((type_id) => {
                const stored = stored_options[type_id];
                if (!this.options[type_id]) {
                  return;
                }
                if (this.options[type_id].format === 'text') {
                  this.meta_data_map[type_id] = stored;
                } else {
                  this.meta_data_map[type_id] = {};
                  stored.forEach((option_id) => {
                    this.$set(this.meta_data_map[type_id], option_id, true);
                  });
                }
              });
            }

            Object.keys(this.options).forEach((type_id) => {
              if (this.options[type_id].format === 'text') {
                return;
              }
              if (!this.meta_data_map[type_id]) {
                this.meta_data_map[type_id] = {};
              }
              if (!this.parent_data_map[type_id]) {
                this.parent_data_map[type_id] = {};
              }
              if (this.options[type_id].has_child) {
                Object.keys(this.options[type_id].data).forEach((option_id) => {
                  const option = this.options[type_id].data[option_id];
                  if (option.child) {
                    this.parent_data_map[type_id][option_id] = 0;
                    Object.keys(option.child).forEach((child_id) => {
                      if (this.meta_data_map[type_id][child_id]) {
                        this.parent_data_map[type_id][option_id]++;
                      }
                    });
                  }
                });
              }
            });
          }
        });
      },
      onTextChange(type_id, text) {
        this.$set(this.meta_data_map, type_id, text);
        this.$emit('onSelectedItemChange');
      },
      onSelect(type_id, option_id, parent_id, child_list) {
        const multi_select = this.options[type_id].multi_select;
        const select = this.meta_data_map[type_id][option_id] !== true;
        if (!multi_select) {
          if (select) {
            Object.keys(this.meta_data_map[type_id]).forEach((key) => {
              if (key === option_id) return;
              this.$set(this.meta_data_map[type_id], key, false);
            });
          }
          this.$set(this.meta_data_map[type_id], option_id, select);
        } else {
          this.$set(this.meta_data_map[type_id], option_id, select);
        }
        if (!select && child_list) {
          Object.keys(child_list).forEach((child_id) => {
            this.$set(this.meta_data_map[type_id], child_id, false);
          });
        }
        if (parent_id) {
          if (!this.parent_data_map[type_id][parent_id]) {
            this.parent_data_map[type_id][parent_id] = 0;
          }
          if (select) {
            this.parent_data_map[type_id][parent_id]++;
          } else {
            this.parent_data_map[type_id][parent_id]--;
          }
          const is_parent_select = this.parent_data_map[type_id][parent_id] > 0;
          this.$set(this.meta_data_map[type_id], parent_id, is_parent_select);
        }
        this.$emit('onSelectedItemChange');
      },
    },
  };
</script>
