<template>
  <div class="dim_bg" v-on:click="() => false">
    <div class="loading_wrapper" :style="{ transform: `scale(${scaleData})` }">
      <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="100px" height="100px" viewBox="0 0 128 128" xml:space="preserve"><g><circle cx="16" cy="64" r="16" fill="#009cdf" fill-opacity="1"/><circle cx="16" cy="64" r="14.344" fill="#009cdf" fill-opacity="1" transform="rotate(45 64 64)"/><circle cx="16" cy="64" r="12.531" fill="#009cdf" fill-opacity="1" transform="rotate(90 64 64)"/><circle cx="16" cy="64" r="10.75" fill="#009cdf" fill-opacity="1" transform="rotate(135 64 64)"/><circle cx="16" cy="64" r="10.063" fill="#009cdf" fill-opacity="1" transform="rotate(180 64 64)"/><circle cx="16" cy="64" r="8.063" fill="#009cdf" fill-opacity="1" transform="rotate(225 64 64)"/><circle cx="16" cy="64" r="6.438" fill="#009cdf" fill-opacity="1" transform="rotate(270 64 64)"/><circle cx="16" cy="64" r="5.375" fill="#009cdf" fill-opacity="1" transform="rotate(315 64 64)"/><animateTransform attributeName="transform" type="rotate" values="0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64" calcMode="discrete" dur="800ms" repeatCount="indefinite"></animateTransform></g></svg>
    </div>
    <template v-if="c_has_comment">
      <div class="loading_comment">
        {{ c_comment }}
      </div>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'NowLoading',
    props: ['scaleData', 'comment'],
    computed: {
      c_has_comment() {
        return this.comment;
      },
      c_comment() {
        return this.comment || '잠시만 기다려 주세요.';
      },
    },
  };
</script>

<style media="screen">
  .dim_bg {
    position: absolute;
    left:0;
    top:0;
    width: 100vw;
    height: 100vh;
    cursor: default;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    background-color: rgba(0,0,0,0.2);
  }

  .dim_bg .loading_wrapper {
    width: 100px;
    height: 100px;
    transform-origin: center;
  }
  .dim_bg .loading_comment {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 10px;
    padding: 0 15px;
    height: 26px;
    border-radius: 13px;
    font-size: 12px;
    color: #ffffff;
    font-weight: 300;
    background-color: rgba(0,0,0,0.6);
  }
</style>
