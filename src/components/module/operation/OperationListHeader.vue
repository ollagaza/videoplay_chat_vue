<template>
  <div v-if="view_mode === 'list'">
    <ul class="list_item_wrapper header">
      <template v-if="!c_is_trash">
        <li class="f_w_40">선택</li>
      </template>
      <li class="f_w_80 pointer" v-on:click.stop="onSortChange('seq')">관리번호<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow on" > </li>
      <li class="f_w_40">종류</li>
      <li class="flex ellipsis pointer" v-on:click.stop="onSortChange('operation_name')">제목<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
      <template>
        <li class="f_w_110 pointer" v-on:click.stop="onSortChange('user_name')">올린 사람<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
      </template>
      <li class="f_w_110 pointer" v-on:click.stop="onSortChange('operation_date')">수술 일자<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
      <li class="f_w_110 pointer" v-on:click.stop="onSortChange('reg_date')">업로드 일자<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
<!--      <template v-if="c_is_trash">-->
<!--        <li class="f_w_80 pointer" v-on:click.stop="onSortChange('delete_user_name')">삭제한 사람<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow" ></li>-->
<!--        <li class="f_w_80 pointer" v-on:click.stop="onSortChange('modify_date')">삭제 일자<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"></li>-->
<!--      </template>-->
      <template>
        <li class="f_w_80 pointer" v-on:click.stop="onSortChange('anno_count')">어노테이션<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
<!--        <li class="f_w_40 pointer" v-on:click.stop="onSortChange('age')">나이<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow" :class="{ on: select_info.id === 'age', desc: sort_desc }"> </li>-->
<!--        <li class="f_w_40 pointer" v-on:click.stop="onSortChange('sex')">성별<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow" :class="{ on: select_info.id === 'sex', desc: sort_desc }"> </li>-->

      </template>
      <li class="f_w_80 pointer" v-on:click.stop="onSortChange('total_file_size')">용량<img src="/img/renewal/common/sort_arrow.png" class="sort_arrow"> </li>
      <template v-if="c_is_trash">
        <li class="f_w_60">복원</li>
      </template>
<!--      <template v-else>-->
<!--        <li class="f_w_30">삭제</li>-->
<!--      </template>-->
    </ul>
  </div>
  <div v-else>
    <div class="top_selector_wrapper">
      <ListOptionSelector :list_item="sort_options" :default_item="select_info" v-on:onItemSelect="onSortChange"></ListOptionSelector>
      <div style="width: 6px;"></div>
      <div class="btn w36 h36" v-on:click="onSortChangeBtn"><img src="/img/renewal/common/sort_arrow.png" class="sort_arrow on" :class="{ desc: sort_desc }"></div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import util from '../../../utils/util';
import ListOptionSelector from '../../../components/ListOptionSelector';
import BaseMixin from '../../../components/Mixins/BaseMixin';

export default {
  name: 'OperationListHeader',
  mixins: [BaseMixin],
  components: { ListOptionSelector },
  props: ['menu', 'sort_options', 'view_mode', 'selected_sort_option'],
  data() {
    return {
      checked: false,
      sort_desc: true,
      select_info: null,
    };
  },
  created() {
    this.select_info = this.selected_sort_option;
    // if(!this.$cookies.get('cookie_sort_option')) {
    //   this.$cookies.set('cookie_sort_option', this.selected_sort_option.fields);
    // }
    if (this.select_info) {
      this.select_info.text = this.select_info.lang;
    }
    // this.sort_desc = this.select_info.order === 'desc';
  },
  computed: {
    c_is_trash() {
      return this.menu === 'trash';
    },
  },
  watch: {
  },
  methods: {
    onCheckBoxClick() {
      this.checked = !this.checked;
      this.$emit('onHeaderCheckBoxClick', this.checked);
    },
    onSortChange(item) {
      this.$log.debug('onSortChange');
      this.$log.debug(item);
      if (this.view_mode === 'list') {
        this.sort_desc = !this.sort_desc;
        this.select_info = JSON.parse(JSON.stringify((_.filter(this.sort_options, { id: item }))[0]));
        this.select_info.order = this.sort_desc ? 'desc' : 'asc';
      } else {
        this.sort_desc = true;
        this.select_info = JSON.parse(JSON.stringify(item));
      }
      this.$log.debug(this.select_info);
      this.$emit('onSortItemSelect', this.select_info);
    },
    onSortChangeBtn() {
      this.$log.debug('onSortChangeBtn');
      this.sort_desc = !this.sort_desc;
      this.select_info = JSON.parse(JSON.stringify(this.select_info));
      this.select_info.order = this.sort_desc ? 'desc' : 'asc';
      this.$emit('onSortItemSelect', this.select_info);
    },
  },
};
</script>
<style scoped>
  .pointer:hover {
    color: #555555;
  }
  .sort_arrow {
    display: none;
    transform-origin: center;
    margin-top: 2px;
    margin-left: 4px;
    transform: none;
  }
  .sort_arrow.on {
    display: block;
  }
  .sort_arrow.on.desc {
    transform: rotate(180deg);
  }
  .top_selector_wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    flex: 0;
    width: 100%;
    height: 36px;
    margin-bottom: 14px;
    z-index: 10;
    margin-top: -41px;
  }
</style>
