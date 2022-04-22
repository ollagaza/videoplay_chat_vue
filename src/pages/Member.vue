<template>
  <div class="layout">
    <div class="right_content_layer" ref="right_content_layer">
      <div class="right_content_wrapper" v-on:contextmenu.stop.prevent="onOpenContextMenu($event, 'body')">
        <div class="contents_container"              >
          <div class="right_content_title">
            <div class="folder_wrapper">
              <template>
                <span>회원관리</span>
                <img src="/img/renewal/drive/locator_arrow.png" alt=">" class="title_arrow">
                <span class="now non-pointer">{{ c_menu_mode_name }}</span>
              </template>
            </div>
          </div>
          <template v-if="c_list==='1'">
            <ModuleMemberList  style="width: 1610px;"
              ref="moduleMemberList"
              v-bind:type="create_type"
              v-bind:hide_button="false"
              v-on:onOperationCreateComplete="onOperationCreateComplete"
              v-on:scrollMove="onScrollMove"
            ></ModuleMemberList>
          </template>
          <template v-else>
            <div>
              <ModuleMemberJoin
                ref="moduleMemberJoin"
                v-bind:type="create_type"
                v-bind:hide_button="false"
                v-on:onOperationCreateComplete="onOperationCreateComplete"
                v-on:scrollMove="onScrollMove"
              ></ModuleMemberJoin>
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
import ModuleMemberJoin from '../components/member/module/ModuleMemberJoin';
import ModuleMemberList from '../components/member/module/ModuleMemberList';
import { mapGetters } from 'vuex';
import Pages3 from './OperationView';
import * as Constants from '../constants';
import util from '../utils/util';
import BaseMixin from '../components/Mixins/BaseMixin';

export default {
  name: 'Member',
  components: { ModuleMemberJoin, ModuleMemberList, Pages3 },
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
      let menu_name = '회원등록';
      if(this.is_list === '1') {
        menu_name = '회원리스트';
      }
      return menu_name;
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
.layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  line-height: 1.4;
  font-weight: 500;
  min-height: 800px;
  margin-top: 70px;
}
.create_operation {
  width: 100%;
  max-width: 1190px;
  padding: 0 30px;
  overflow: hidden;
}

.create_operation .create_operation_wrapper {
  position: relative;
  width: 100%;
  overflow-x: hidden;
}

.create_operation .button_layer {
  position: relative;
  display: flex;
  margin: 30px 0 50px 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.create_operation .button_layer > .btn {
  margin: 0 5px;
}
</style>
