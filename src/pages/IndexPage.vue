<template>
  <div class="layout">
    <div style="position:relative; width: 1180px; height:100%; left: 0px; padding-top: 10px;">
      <div style="height: 100%; ">
        <div class="center">
          Index Page
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'IndexPage',
  componets: [],
  created() {
    this.$log.debug('index ', this.is_logged);
    // this.list_data();
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters(['is_logged']),
  },
  methods: {
    // list_data() {
    //   if (this.is_logged) {
    //     this.$router.push({ name: 'list' });
    //   }
    // },
  },
};
</script>

<style scoped>
.layout {
  position: absolute;
  height: 85%;
}

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
