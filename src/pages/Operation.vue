<template>
  <div class="layout">
    <div class="right_content_layer" ref="right_content_layer">
      <div class="right_content_wrapper">
        <div class="contents_container">
          <div class="right_content_title">
            <div class="folder_wrapper">
              <template>
                <span>동영상관리</span>
                <img src="/img/renewal/drive/locator_arrow.png" alt=">" class="title_arrow">
                <span class="now non-pointer">{{ c_menu_mode_name }}</span>
              </template>
            </div>
          </div>
          <template v-if="c_list==='1'">
            <ModuleOperationList
              ref="moduleOperationList"
              v-bind:type="create_type"
              v-bind:hide_button="false"
              v-on:onOperationCreateComplete="onOperationCreateComplete"
              v-on:scrollMove="onScrollMove"
            ></ModuleOperationList>
          </template>
          <template v-else>
            <div>
            <ModuleOperationCreate
              ref="moduleOperationCreate"
              v-bind:type="create_type"
              v-bind:hide_button="false"
              v-on:onOperationCreateComplete="onOperationCreateComplete"
              v-on:scrollMove="onScrollMove"
            ></ModuleOperationCreate>
            </div>
            <div class="button_layer" style="margin: 20px;">
              <div class="btn w120 blue h36 r18 f15" v-on:click="onConfirmClick">
                <span>확인</span>
              </div>
              <div class="btn w120 h36 r18 f15" v-on:click="onCancelClick">
                <span>취소</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>


</template>
<script>
import ModuleOperationCreate from '../components/operation/module/ModuleOperationCreate';
import ModuleOperationList from '../components/operation/module/ModuleOperationList';
import OperationView from './OperationView';
import * as Constants from '../constants';
import util from '../utils/util';
import BaseMixin from '../components/Mixins/BaseMixin';

export default {
  name: 'Operation',
  components: { ModuleOperationCreate, ModuleOperationList, OperationView },
  mixins: [BaseMixin],
  data() {
    return {
      create_type: Constants.CREATE_OPERATION,
      is_open: false,
      is_list: '1',
    };
  },
  computed: {
    c_list() {
      const params = this.$route.params;
      if (params) {
        if (params.is_list) {
          this.is_list = params.is_list;
        }
      }
      return this.is_list;
    },
    c_menu_mode_name() {
      let menu_name = '수술정보등록';
      if (this.is_list === '1') {
        menu_name = '수술정보리스트';
      }
      return menu_name;
    },
  },
  created() {
    // debugger;
    const query = this.$route.query;
    const params = this.$route.params;
    if (query) {
      if (query.type) {
        this.create_type = query.type;
      }
    }
    if (params) {
      if (params.is_list) {
        this.is_list = params.is_list;
      }
    }
  },
  methods: {
    onConfirmClick() {
      this.$refs.moduleOperationCreate.onConfirmClick();
    },
    onRegClick() {
      this.$refs.moduleOperationList.onRegClick();
    },
    onOperationCreateComplete(operation_seq, folder_seq) {
      this.moveDrivePage(folder_seq);
    },
    onScrollMove(position) {
      if (position === Constants.TOP) {
        window.scrollTo(0, 0);
      } else if (position === Constants.BOTTOM) {
        window.scrollTo(0, document.body.scrollHeight);
      } else if (util.isNumber(position)) {
        window.scrollTo(0, position);
      }
    },
    onCancelClick() {
      const params = {};
      params.is_list = '1';
      this.$router.push({ name: 'operation', params });
    },
  },
  moveDrivePage(folder_seq) {
    const query = {};
    if (folder_seq) {
      query.folder = folder_seq;
    }
    this.$router.push({ name: 'drive', query });
  },
};
</script>

<style scoped>
/*.layout {*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*  justify-content: center;*/
/*  align-items: center;*/
/*  height: 100vh;*/
/*  line-height: 1.4;*/
/*  font-weight: 500;*/
/*  min-height: 800px;*/
/*  margin-top: 70px;*/
/*}*/
</style>
