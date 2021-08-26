<template>
<div>
  <div style="position:relative; width: 1180px; padding-top: 40px;">
    <div class="table_title">작물생육모습</div>
    <div style="display: flex; flex-direction: column; margin-top: 30px;">
      <div style="display: flex; flex-direction: row">
        <div>
          <select class="text" v-model="search_type" style="width: 180px;">
            <option value="0">제목</option>
            <option value="1">나의작물</option>
            <option value="2">단계</option>
            <option value="3">병충해</option>
          </select>
        </div>
        <div style="margin-left: 10px;">
          <input type="text" class="text" name="" value="" v-model="search" placeholder="검색어를 입력하세요." style="width: 180px;">
        </div>
        <div class="btn newgreen_se" style="width: 80px; height:40px;" v-on:click="onSearchClick">
          검색
        </div>
        <div style="flex:2"></div>
        <div class="btn newgreen"  style="width: 100px; height: 40px; border-radius: 6px;" v-on:click="Newupload">
          작물추가
        </div>
      </div>
      <div class="content_table">
        <table cellspacing="0" cellpadding="0" class="list_table">
          <colgroup>
            <col width="110px">
            <col width="280px">
            <col width="120px">
            <col width="120px">
            <col width="100px">
            <col width="120px">
            <col width="120px">
            <col width="90px">
            <col width="120px">
          </colgroup>
          <tbody>
          <tr class="head">
            <td>사진</td>
            <td>제목</td>
            <td>별칭</td>
            <td>작물</td>
            <td>단계</td>
            <td>병충해</td>
            <td>발견일</td>
            <td>상태</td>
            <td>작성일</td>
          </tr>
          <template v-if="info_list.length === 0">
            <tr class="content">
              <td class="text center" colspan="9">등록된 데이타가 없습니다.</td>
            </tr>
          </template>
          <template v-if="info_list.length > 0">
            <template v-for="(info, idx) in c_info_list">
              <tr class="content" v-on:click="onListClick(info.seq)">
                <td class="text" style="text-align: center;">
                  <img v-bind:src="`/apis1/s1/plant/getplantimg/${info.seq}`" style="max-width: 110px;max-height: 80px;">
                </td>
                <td class="title">{{info.title}}</td>
                <td class="text center">{{info.othername}}</td>
                <td class="text center">{{info.jitemname}}</td>
                <td class="text center">{{plant_statusTostr(info.plant_status)}}</td>
                <td class="text center">{{info.result_text}}</td>
                <td class="text center">{{info.plant_day}}</td>
                <td class="text center " v-bind:class="[{'status_end' : info.status === 9}, {'status_check' : info.status === 2}, {'status_work' : info.status !== 9 && info.status !== 2}]">{{info.status_str}}</td>
                <td class="text center">{{info.reg_day}}</td>
              </tr>
            </template>
          </template>
          </tbody>
        </table>
      </div>
      <div style="margin: 20px 0 40px 0;">
        <Pagination ref="Pagination"
                    :pageNationObj = "page_navigation"
                    v-on:onMovePage = "onMovePage"></Pagination>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import util from '../../utils/util';
import EventBus from '../../utils/eventbus';
import api_list from '../../api/ApiList';
import BaseMixin from '../../components/Mixins/BaseMixin';
import * as Constants from '../../constants';
import Pagination from '../../components/Pagination';

export default {
  name: 'ReportListPage',
  components: {
    Pagination,
  },
  props: ['roption', 'info_list', 'page_navigation'],
  mixins: [BaseMixin],
  created() {
    if (!this.roption.search_type) {
      this.roption.search_type = '0';
    }
    this.page = this.roption.page;
    this.search_type = this.roption.search_type;
    this.search = this.roption.search;
  },
  watch: {
    roption: {
      handler(value) {
        this.$log.debug(value);
        // this.loadData();
      }
    },
  },
  data() {
    return {
      mode: 'list',
      search_type: '0',
      search: '',
      // page_navigation: {
      // },
    };
  },
  computed: {
    c_info_list() {
      return this.info_list;
    },
  },
  methods: {
    plant_statusTostr(plant_status) {
      if (plant_status === 1) {
        return '활착기';
      }
      if (plant_status === 2) {
        return '성장기';
      }
      if (plant_status === 3) {
        return '수확기';
      }
      return '';
    },
    onListClick(seq) {
      this.$emit('onListClick', seq);
    },
    onMovePage(page) {
      this.page_navigation.cur_page = util.getInt(page, 1);
      this.pageMove(page);
    },
    Newupload() {
      this.$emit('onNewupload');
    },
    showLoading(is_show = true) {
      EventBus.emit('nowLoading', is_show);
    },
    onSearchClick() {
      this.roption.page = 1;
      this.roption.search = this.search;
      this.roption.search_type = this.search_type;
      this.$emit('onSearch', this.roption);
    },
  },
};

</script>

<style scoped>
.layout {
  min-height: 850px;
}

.center{
  text-align: center;
}

.status_work{
  font-weight: 400;
  font-size: 16px;
  color: #ccc;
}

.status_end{
  font-weight: 400;
  font-size: 16px;
  color: #ec503b;
}

.status_check{
  font-weight: 400;
  font-size: 16px;
  color: #000;
}

.page {
  font-weight: 400;
  font-size: 16px;
  color: #888;
  margin-left: 14px;
  cursor: pointer;
}

.page_first{
  cursor: pointer;
}

.page_pre{
  margin-left: 20px;
  margin-right: 16px;
  cursor: pointer;
}

.page_next{
  margin-left: 30px;
  margin-right: 20px;
  cursor: pointer;
}

.page_end{
  cursor: pointer;
}

.active{
  color: #030303;
}

.noimg{
  width:96px; height: 68px; background-color: #EAE5DF; color:#888; text-align: center; padding-top: 23px;
}

</style>
