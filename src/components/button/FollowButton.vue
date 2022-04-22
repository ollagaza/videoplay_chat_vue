<template>
  <div v-show="is_visible">
    <template v-if="(follow_member.following_chk !== null && follow_member.following_chk !== undefined) && !follow_member.following_chk">
      <div class="btn orange follow" v-bind:class="c_btn_class" v-on:click="onFollow"></div>
    </template>
    <template v-else>
      <div class="btn following" v-bind:class="c_btn_class" v-on:click="onFollowCancel"></div>
    </template>
  </div>
</template>

<script>
  import EventBus from '../../utils/eventbus';
  import ApiFollow from '../../_front/api/ApiFollow';
  import * as Constants from '../../constants';

  export default {
    name: 'FollowButton',
    props: ['is_visible', 'follow_member', 'btn_type'],
    computed: {
      c_btn_class() {
        if (this.btn_type === Constants.SMALL) {
          return 'h24 w80 f13 r12';
        }
        return 'w120 h40 r20 f15';
      },
    },
    methods: {
      onFollow() {
        ApiFollow.registFollow(this.follow_member.group_seq)
          .then(({ error, message }) => {
            if (error === 0) {
              this.$emit('callback', this.follow_member.group_seq, 'A');
              this.$set(this.follow_member, 'following_chk', true);
            } else {
              EventBus.emit('alertPopupOpen', null, message);
            }
          });
      },
      onFollowCancel() {
        EventBus.emit('confirmPopupOpen', this.follow_member, `${this.follow_member.group_name}님을 팔로우를 취소 하시겠습니까 ?`, this.CancelFollowData);
      },
      CancelFollowData() {
        ApiFollow.unregistFollow(this.follow_member.group_seq)
          .then(({ error, message }) => {
            if (error === 0) {
              EventBus.emit('confirmPopupClose', true);
              this.$emit('callback', this.follow_member.group_seq, 'C');
              this.$set(this.follow_member, 'following_chk', false);
            } else {
              EventBus.emit('alertPopupOpen', null, message);
            }
          });
      },
    },
  };
</script>

<style scoped>
  .follow:after {
    content: '팔로우';
  }
  .following:after {
    content: '팔로잉';
  }
  .following:hover:after {
    content: '팔로잉 취소';
  }
</style>
