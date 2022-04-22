<template>
    <div class="module_progress_container">
      <div class="module_progress_text"><span>{{ c_progress }}</span></div>
      <div class="module_progress_bar">
        <div class="bar" v-bind:style="{ width: c_progress }"></div>
      </div>
    </div>
</template>

<script>
  export default {
    props: ['progress'],
    name: 'ProgressBar',
    computed: {
      c_progress() {
        return `${this.progress}%`;
      },
    },
  };
</script>

<style scoped>
  .module_progress_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    width: 100%;
    height: 100%;
  }
  .module_progress_container .module_progress_text {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-bottom: 10px;
  }
  .module_progress_container .module_progress_text > span {
    color: #ffa00f;
    font-size: 12px;
    font-weight: 400;
  }
  .module_progress_container .module_progress_bar {
    display: flex;
    flex: 0;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    height: 3px;
    background-color: #dddddd;
  }
  .module_progress_container .module_progress_bar > .bar {
    height: 3px;
    background-color: #ffa00f;
  }
</style>
