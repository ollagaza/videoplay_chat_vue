<template>
  <div>
    <template>
      <div class="custom_main" v-bind:style="{ backgroundImage: c_custom_main_bg_url }">
<!--        <div class="custom_main_vacs">수술 동영상 아카이빙 시스템 - VACS</div>-->
        <div class="custom_main_surgstory">A.I 바우쳐 수술 동영상관리</div>
        <div class="custom_main_site_name">{{ site_name }}</div>
        <div class="custom_main_start_btn" v-on:click.stop="onUseServiceClick"><span>시작하기</span><img src="/img/vacs/common/arrow.png"></div>
        <div class="custom_main_service_info_layer">
          <div class="custom_main_service_info">
            <div class="custom_main_service_info_img">
              <img src="/img/vacs/common/function_icon1.png" alt="동영상 관리">
            </div>
            <div class="custom_main_service_info_name">동영상 관리</div>
            <div class="custom_main_service_info_desc">
              <div>수술 동영상 보관, 관리, 폴더별 정리를</div>
              <div>위한 시스템 및 솔루션을 제공합니다.</div>
            </div>
          </div>
          <div class="custom_main_service_info">
            <div class="custom_main_service_info_img">
              <img src="/img/vacs/common/function_icon2.png" alt="어노테이션">
            </div>
            <div class="custom_main_service_info_name">어노테이션</div>
            <div class="custom_main_service_info_desc">
              <div>수술 동영상의 주요 구간에 어노테이션</div>
              <div>한 후 쉽게 검색할 수 있습니다.</div>
            </div>
          </div>
          <div class="custom_main_service_info">
            <div class="custom_main_service_info_img">
              <img src="/img/vacs/common/function_icon3.png" alt="동영상 웹 편집기">
            </div>
            <div class="custom_main_service_info_name">동영상 웹 편집기</div>
            <div class="custom_main_service_info_desc">
              <div>별도의 프로그램 설치 없이 간단한</div>
              <div>컷 편집과 자막입력 등을 할 수 있습니다.</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import util from '../utils/util';
import Footer from '../components/Footer';
import EventBus from '../utils/eventbus';
import config from '../config';
import BaseMixin from '../components/Mixins/BaseMixin';

export default {
  name: 'IndexPage',
  mixins: [BaseMixin],
  components: { Footer },
  data() {
    return {
      current_index: 1,
      min_index: 1,
      max_index: 4,
      is_able_scroll: true,
      is_open_popup: false,
      page_height: 0,
      is_top: true,
      show_top_btn: false,
      solution_type: 0,
    };
  },
  computed: {
    ...mapGetters(['logged_info', 'is_logged', 'is_ie', 'lang', 'group_info', 'group_seq', 'use_custom_main_page', 'site_name', 'main_bg_url']),
    c_rotate_class_name() {
      return `rotate${this.solution_type}`;
    },
    c_custom_main_bg_url() {
      return `url(${this.main_bg_url})`;
    },
  },
  created() {
    EventBus.emit('onIndexScroll', true);
  },
  mounted() {
    // window.addEventListener('resize', this.onWindowResize);
    // window.addEventListener('scroll', this.handleScroll);
    // this.onWindowResize();
  },
  beforeDestroy() {
    // window.removeEventListener('scroll', this.handleScroll);
    // window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    onWindowResize() {
      const target = this.$refs.index_main;
      if (target) {
        this.page_height = target.clientHeight;
      }
    },
    handleScroll() {
      const scroll_y = window.scrollY;
      const is_top = scroll_y < 10;
      if (this.is_top !== is_top) {
        EventBus.emit('onIndexScroll', is_top);
      }
      this.is_top = is_top;
      this.show_top_btn = scroll_y >= this.page_height;
      const solution_type = Math.round(scroll_y / this.page_height - 0.25);
      this.solution_type = solution_type > 3 ? 3 : solution_type;
    },
    routeDrive() {
      const page_name = this.group_seq ? 'drive' : 'plan_select';
      this.$router.push({ name: page_name });
    },
    onUseServiceClick() {
      if (this.is_logged) {
        this.routeDrive();
      } else {
        EventBus.emit('loginPopupOpen');
      }
    },
    onJoinClick() {
      this.$router.push({ name: 'join' });
    },
    onInformationMoveClick(mode) {
      this.$router.push({ name: 'information', params: { mode } });
    },
  },
};
</script>

<style scoped>
.custom_main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  line-height: 1.4;
  font-weight: 500;
  min-height: 800px;
}
.custom_main .custom_main_vacs {
  font-size: 18px;
  color: #555555;
}
.custom_main .custom_main_surgstory {
  font-size: 42px;
  color: #2e6bb8;
  margin-top: -6px;
  font-weight: 600;
}
.custom_main .custom_main_site_name {
  font-size: 75px;
  color: #106bbc;
  margin-top: 14px;
  font-weight: 600;
}
.custom_main .custom_main_start_btn {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 60px;
  font-size: 18px;
  font-weight: 400;
  color: #ffffff;
  margin-top: 50px;
  padding: 0 30px;
  background-color: #106bbc;
  border-radius: 30px;
  height: 60px;
  width: 210px;
  cursor: pointer;
}
.custom_main .custom_main_start_btn:hover {
  background-color: #2e6bb8;
}
.custom_main .custom_main_service_info_layer {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 40px;
}
.custom_main .custom_main_service_info_layer .custom_main_service_info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 280px;
  width: 280px;
}
.custom_main .custom_main_service_info_layer .custom_main_service_info .custom_main_service_info_img {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 0 0 100px;
  width: 100px;
  height: 100px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 50px;
}
.custom_main .custom_main_service_info_layer .custom_main_service_info .custom_main_service_info_name {
  margin-top: 20px;
  font-weight: 600;
  font-size: 18px;
  color: #333333;
}
.custom_main .custom_main_service_info_layer .custom_main_service_info .custom_main_service_info_desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
  font-weight: 400;
  font-size: 15px;
  color: #333333;
  line-height: 1.6;
}
.index_page_wrapper .index_page > .background > img {
  width: 100%;
  object-fit: none;
}
.index_page_wrapper .index_page > .index_contents.youtube iframe {
  box-shadow: 20px 20px 30px -2px rgba(0,0,0,.2);
  background-image: url("/img/renewal/main/video_still.jpg");
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  max-width: 800px;
}
.index_page_wrapper .index_page > .index_contents > .background_video > video {
  height: 100%;
  width: 100%;
  object-fit: cover;
  z-index: -100;
}
.index_page_wrapper .index_page > .index_contents .content .solution_function_list > li {
  list-style: none;
  font-weight: 300;
  font-size: 18px;
  line-height: 2;
  color: rgba(255, 255, 255, 0.7);
  padding-left: 24px;
  background-position: 0 center;
  background-repeat: no-repeat;
  background-image: url("/img/renewal/main/point_icon.png");
  word-break: keep-all;
}
.index_page_wrapper .index_page > .index_contents.social_link .content > a {
  margin: 0 6px;
  display: block;
  width: 40px;
  height: 40px;
  background-repeat: no-repeat;
  background-position: center center;
}
@media (max-width: 1200px) {
  .index_page_wrapper .img_full[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_960[alt="surgbox"] {
    display: block;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    column-gap: 60px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item {
    flex: 1;
    max-width: 320px;
  }
  .index_page_wrapper .index_page > .index_contents .link_list {
    display: none;
  }
  .index_page_wrapper .index_page > .index_contents.press .content .press_item_list > .press_item > .item_img {

  }
}

@media (max-width: 960px) {
  .index_page_wrapper .img_960[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_768[alt="surgbox"] {
    display: block;
  }
  .index_page_wrapper .img_600[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_480[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_375[alt="surgbox"] {
    display: none;
  }

  .index_page_wrapper .index_page > .index_contents {
    height: auto;
    min-height: 100vh;
  }

  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    flex-direction: column;
    row-gap: 80px;
    padding: 130px 30px 80px 30px;
    align-items: center;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex: none;
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_img {
    flex: 1;
    max-width: 254px;
    height: unset;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap {
    flex: 1;
    padding-top: 0;
    max-width: 290px;
  }

  .index_page_wrapper .index_page > .index_contents .content.solution {
    padding: 80px 60px;
    flex-direction: column;
    row-gap: 60px;
  }
  .index_page_wrapper .index_page > .index_contents .content .solution_name {
    font-size: 60px;
  }
  .index_page_wrapper .index_page > .index_contents .content .solution_info.etc {
    padding-top: 60px;
  }
  .index_page_wrapper .index_page > .index_contents .content .solution_copy.column {
    padding-top: 40px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table {
    grid-template-columns: 220px 1fr 1fr;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table .cell.head {
    font-size: 20px;
  }


  .index_page_wrapper .index_page > .index_contents.used .content {
    padding: 100px 30px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .solution_info {
    padding-top: 24px;
    color: #434d59;
    max-width: 650px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list {
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
    row-gap: 50px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item {
    flex-direction: row;
    max-width: 550px;
    row-gap: 0;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list.three > .used_item {
    width: 100%;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .item_img {
    flex: 0 0 140px;
    align-items: flex-start;
    height: 96px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .desc_wrap {
    width: 100%;
    text-align: left;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .desc_wrap > .item_desc {
  }

  .index_page_wrapper .index_page > .index_contents.press .content .press_item_list > .press_item > .item_img {

  }

  .index_page_wrapper .index_page > .index_contents.contact_us {
    padding: 100px 0 70px 0;
    height: fit-content;
  }
  .index_page_wrapper .index_page > .index_contents.contact_us .content {
    flex-direction: column;
    row-gap: 60px;
  }
  .index_page_wrapper .index_page > .index_contents.contact_us .content .contact_us_label {
    flex: none;
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents.contact_us .content .contact_us_label > .info {
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents.contact_us .content .contact_us {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 768px) {
  .index_page_wrapper .index_page > .background {
    display: none;
  }
  .index_page_wrapper .index_page > .background + .index_contents {
    margin-top: 0;
  }
  .index_page_wrapper .img_full {
    display: none;
  }
  .index_page_wrapper .img_600 {
    display: block;
  }
  .index_page_wrapper .img_480 {
    display: none;
  }
  .index_page_wrapper .img_960[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_768[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_600[alt="surgbox"] {
    display: block;
  }
  .index_page_wrapper .img_480[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_375[alt="surgbox"] {
    display: none;
  }

  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    row-gap: 70px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_img {
    max-width: 220px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap {
    max-width: 280px;
  }
  .index_page_wrapper .index_page > .index_contents .content.solution {
    padding: 100px 50px;
    row-gap: 40px;
  }
  .index_page_wrapper .index_page > .index_contents .content .feature_title {
    font-weight: 600;
    font-size: 44px;
    color: #434d59;
    line-height: 1.4;
    position: relative;
    padding-bottom: 32px;
  }
  .index_page_wrapper .index_page > .index_contents .content .feature_list {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 25px;
  }
  .index_page_wrapper .index_page > .index_contents .content .feature_list > .feature_item {
    flex: none;
    max-width: 108px;
    min-width: 84px;
    width: calc((100vw - 60px) / 5);
  }
  .index_page_wrapper .index_page > .index_contents .content .feature_list > .feature_item > .item_name {
    font-size: 14px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table {
    grid-template-columns: 200px 1fr 1fr;
  }
  .index_page_wrapper .index_page > .index_contents.press .content .press_item_list {
    flex-direction: column;
    row-gap: 30px;
  }
}

@media (max-width: 600px) {
  .index_page_wrapper .img_600 {
    display: none;
  }
  .index_page_wrapper .img_480 {
    display: block;
  }
  .index_page_wrapper .img_960[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_768[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_600[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_480[alt="surgbox"] {
    display: block;
  }
  .index_page_wrapper .img_375[alt="surgbox"] {
    display: none;
  }

  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    row-gap: 50px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_img {
    max-width: 180px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap {
    max-width: 260px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap > .move_btn {
    margin-top: 20px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap > .item_name {
    font-size: 30px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table {
    grid-template-columns: 150px 1fr 1fr;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table .cell {
    font-size: 16px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table .cell.head {
    font-size: 16px;
  }
  .index_page_wrapper .index_page > .index_contents.used .hospital_list {
    column-gap: 40px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .item_img {
    flex-basis: 120px;
  }
}

@media (max-width: 500px) {
  .index_page_wrapper .img_960[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_768[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_600[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_480[alt="surgbox"] {
    display: none;
  }
  .index_page_wrapper .img_375[alt="surgbox"] {
    display: block;
  }

  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    padding: 120px 30px 100px 30px;
    row-gap: 70px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    flex: none;
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_img {
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap {
    padding-top: 30px;
    max-width: 300px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table {
    grid-template-columns: 105px 1fr 1fr;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table .cell {
    font-size: 14px;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table .cell.head {
    font-size: 14px;
  }

  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item {
    flex-direction: column;
    max-width: unset;
    row-gap: 30px;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .item_img {
    flex: none;
    height: fit-content;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .desc_wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .index_page_wrapper .index_page > .index_contents.used .content .used_item_list > .used_item > .desc_wrap > .item_desc {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 375px) {
  .index_page_wrapper .index_page > .index_contents .content .main_item_list {
    padding: 120px 30px 100px 30px;
    row-gap: 70px;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    flex: none;
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents.feature .table {
    grid-template-columns: 80px 1fr 1fr;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_img {
    max-width: unset;
  }
  .index_page_wrapper .index_page > .index_contents .content .main_item_list > .main_item > .item_desc_wrap {
    padding-top: 30px;
    max-width: 300px;
  }
  .index_page_wrapper .index_page > .index_contents.used .hospital_list {
    flex-direction: column;
  }
}
</style>
