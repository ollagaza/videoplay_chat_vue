<template>
  <div>
    <nav class="header" >
      <div class="logo">
        <img src="/img/surg_project/img/mteglogo_on.png" alt="A.I 바우처 수술 동영상관리" v-on:click="routeMain">
      </div>
      <div class="site_menu">
        <div class="on channel" v-on:click="Menu2">동영상관리</div>
      </div>
<!--      <div class="site_menu">-->
<!--        <div class="on channel" v-on:click="Menu1">Code</div>-->
<!--      </div>-->
      <div class="site_menu">
        <div class="on channel" v-on:click="Menu3">휴지통</div>
      </div>
      <div class="site_menu">
        <div class="on channel" v-on:click="Menu1">회원관리</div>
      </div>
      <div class="site_menu">
        <div class="on channel" v-on:click="Menu1">공지사항</div>
      </div>
      <div class="flex_blank"></div>
      <div class="sub_menu">
<!--        <div class="sub_menu_item" v-on:click="onContactUsClick">Contact Us</div>-->
<!--        <div class="sub_menu_item blank_line" v-if="!is_logged"></div>-->
        <div class="sub_menu_item login_text" v-if="!is_logged" v-on:click="login">로그인</div>
        <div class="sub_menu_item login_text" v-if="!is_logged" v-on:click="join('c')">회원가입</div>
<!--        <div class="sub_menu_item" v-if="is_logged">-->
<!--          <div class="nav_profile" v-on:click="onProfileClick">-->
<!--            <img :src="c_profile_image" alt="프로필 사진" v-on:error="onProfileImgError" />-->
<!--                        <div class="profile_alarm_count" v-if="c_profile_alarm_count > 0">{{ c_profile_alarm_count }}</div>-->
<!--          </div>-->
<!--        </div>-->
        <div class="sub_menu_item login_text" v-if="is_logged" v-on:click="infoMod">회원정보수정</div>
        <div class="sub_menu_item login_text" v-if="is_logged" v-on:click="logout">로그아웃</div>
      </div>
    </nav>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import EventBus from '../utils/eventbus';
import util from '../utils/util';

export default {
  name: 'Navigation',
  props: ['route_name', 'navview', 'menu_id'],
  data() {
    return {
      timer_id: 0,
      c_is_channel_visible: true,
      c_lang_popup_open: false,
      is_plan_select: true,
      c_member_open_check: true,
      is_profile_image_load_error: false,
    };
  },
  computed: {
    ...mapGetters(['logged_info', 'is_logged']),
    c_usrname() {
      if (this.logged_info) {
        return this.logged_info.user_name;
      }
      return '';
    },
    c_isadmin() {
      if (this.logged_info) {
        return this.logged_info.used_admin;
      }
      return '';
    },
    c_navview() {
      if (this.navview) {
        return this.navview;
      }
      return '';
    },
    c_profile_image() {
      const profile_path = this.is_profile_image_load_error === false && this.logged_info ? this.logged_info.profile_image_url : null;
      return util.getProfileImagePath(profile_path, this.member_seq);
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    ...mapActions(['LogOut']),
    Menu1() {
      const params = {};
      params.is_list = '1';
      this.$router.push({ name: 'member', params });
    },
    Menu2() {
      const params = {};
      params.is_list = '1';
      this.$router.push({ name: 'operation', params });
    },
    Menu3() {
      this.$router.push({ name: 'chat' });
    },
    routeMain() {
      this.$router.push({ name: 'index' });
    },
    logout() {
      this.LogOut();
      this.$router.push({ name: 'index' });
    },
    login() {
      EventBus.emit('loginPopupOpen');
    },
    join(isType) {
      const query = {};
      query.isType = isType;
      const params = {};
      this.$router.push({ name: 'Member_Info', params, query });
    },
    infoMod() {
      this.join('e');
    },
    adminMenu() {
      console.log('adminMenu');
    },
    onProfileClick() {
      if (this.$refs.userProfileLayer.isOpen()) {
        this.$refs.userProfileLayer.closeLayer();
      } else {
        this.$refs.userProfileLayer.openLayer();
      }
    },
  },
};
</script>

<style scoped>
/* header start */
.header {
  position: fixed;
  display: flex;
  flex-direction: row;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  align-items: center;
  justify-content: flex-start;
  z-index: 50;
  /*opacity: 0;*/
  transition: 0.4s;
  padding: 0 30px 0 30px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  min-width: 850px;
  background-color: #ffffff !important;
  border-bottom: 1px solid #dddddd;
}
.header.index {
  border-bottom: none;
}
.header.mini {
  height: 30px;
  padding: 0 20px 0 20px;
  background-color: #f5f5f5 !important;
  border-bottom: none;
}
.header .logo {
  flex: 0 0 182px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header.mini .logo {
  flex: none;
}
.header .site_menu {
  /*flex: 0 0 140px;*/
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: 30px;
}
.header .site_menu > div {
  font-weight: 600;
  font-size: 18px;
  color: #333333;
  cursor: pointer;
  line-height: 1;
}
.header.mini .site_menu {
  height: 100%;
}
.header.mini .site_menu > div {
  font-size: 14px;
  text-align: center;
  width: 100px;
  height: 100%;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0;
  letter-spacing: 0;
}
.header.mini .site_menu > div.on {
  position: relative;
  background-color: #FFFFFF;
  font-weight: 600;
  color: #1c3048;
  font-size: 14px;
  width: 80px;
}
.header.mini .site_menu > div:first-child {
  margin-right: 0;
}
.header .site_menu > div:hover {
  color: #2e6bb8;
  text-decoration: underline;
}
.header.mini .site_menu > div:hover {
  text-decoration: none;
}
.header.mini .site_menu > div:not(.on):hover {
  color: #6a4dbd;
  text-decoration: none;
}
.header .site_menu > div:first-child {
  margin-right: 20px;
}
.header .sub_menu {
  width: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.header .sub_menu .sub_menu_item {
  color: #888888;
  font-weight: 300;
  font-size: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 12px;
  cursor: pointer;
}
.header .sub_menu .sub_menu_item.login_text {
  font-weight: 400;
  color: #555555;
}
.header .sub_menu .sub_menu_item:hover {
  text-decoration: underline;
}
.header .sub_menu .sub_menu_item .nav_profile > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.channel_nav_wrap {
  position: fixed;
  top: 30px;
  left: 0;
  z-index: 50;
  width: 100%;
  height: 84px;
  background-color: #ffffff;
  border-bottom: 4px solid #1c3048;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-width: 850px;
  padding: 0 20px;
}
.channel_nav_wrap .channel_nav_info .channel_info .group .channel_name > div {
  width: fit-content;
  max-width: 100%;
  cursor: pointer;
  /*border-bottom: 1px solid transparent;*/
  line-height: 1.4;
}
.channel_nav_wrap .channel_nav_info .channel_info .group .channel_name:hover > div {
  /*border-color: rgba(255, 255, 255, 1);*/
  text-decoration: underline;
}
.channel_nav_wrap .channel_nav_info .channel_info .group .channel_name:hover > div {
  /*border-color: #333333;*/
}
.channel_nav_wrap .channel_nav_info .channel_sub_info .group_setting > img {
  margin-right: 6px;
}

.mobile_navigation {
  position: fixed;
  display: none;
  flex-direction: row;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: flex-start;
  z-index: 50;
  padding: 0 20px;
  border-bottom: 1px solid #dddddd;
  background-color: #ffffff !important;
}
.mobile_navigation .mobile_nav_logo {
  font-size: 0;
}
.mobile_navigation .btn_wrap {
  flex: 0 0 30px;
  display: flex;
  height: 30px;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .channel_nav_wrap .channel_nav_info .channel_info .group {
    max-width: 200px;
  }
}
/*@media screen and (min-width: 1201px) and (max-width: 1380px) {*/
/*  .channel_nav_wrap .channel_nav_info .channel_info .group {*/
/*    max-width: 310px;*/
/*  }*/
/*}*/
@media screen and (min-width: 1201px) and (max-width: 1610px) {
  .channel_nav_wrap .channel_nav_info .channel_info .group {
    max-width: 310px;
  }
}
@media screen and (min-width: 1381px) and (max-width: 1510px) {
  .channel_nav_wrap .channel_nav_info .channel_info .group {
    max-width: 480px;
  }
}
@media (max-width: 960px) {
  .responsive .header {
    display: none;
  }
  .responsive .channel_nav_wrap {
    display: none;
  }
  .responsive .mobile_navigation {
    display: flex;
  }
}

</style>
