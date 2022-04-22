<template>
  <input type="text" v-model="input_text" :placeholder="option_info.placeholder" :maxlength="option_info.maxlength">
</template>

<script>
  export default {
    name: 'InputTextItem',
    props: ['type_id', 'text', 'option_info'],
    data() {
      return {
        input_text: this.text,
      };
    },
    watch: {
      input_text(new_val) {
        this.$emit('onTextChange', this.type_id, new_val);
      },
    },
  };
</script>

<style scoped>

</style>
