<template>
  <div class="layout"><!--  style="margin-top: 80px;" -->
<!--    <div class="right_content_layer" ref="right_content_layer">-->
<!--      <div class="right_content_wrapper">-->
<!--        <div class="contents_container">-->
<!--          <div class="right_content_title">-->
<!--            <div class="folder_wrapper">-->
<!--              <template>-->
<!--                <span>동영상관리</span>-->
<!--                <img src="/img/renewal/drive/locator_arrow.png" alt=">" class="title_arrow">-->
<!--                <span class="now non-pointer">수술정보</span>-->
<!--              </template>-->
<!--            </div>-->
<!--          </div>-->
          <template>
            <ModuleOperationView
              ref="moduleOperationView"
              v-bind:type="create_type"
              v-bind:hide_button="false"
              v-bind:operation_seq="operation_seq"
              v-on:onOperationCreateComplete="onOperationCreateComplete"
              v-on:scrollMove="onScrollMove"
            ></ModuleOperationView>
          </template>
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

  </div>


</template>
<script>
import ModuleOperationView from '../components/operation/module/ModuleOperationView';
import * as Constants from '../constants';
import util from '../utils/util';
import BaseMixin from '../components/Mixins/BaseMixin';
import ModuleOperationCreate from '../components/operation/module/ModuleOperationCreate';

export default {
  name: 'OperationView',
  components: { ModuleOperationView },
  mixins: [BaseMixin],
  data() {
    return {
      create_type: Constants.CREATE_OPERATION,
      is_open: false,
      operation_seq: null,
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
  },
  mounted() {
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
    if (this.$route.params) {
      this.operation_seq = this.$route.params.operation_seq;
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
