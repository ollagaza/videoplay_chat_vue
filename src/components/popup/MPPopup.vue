<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }" style="">
    <div class="popup newdata" v-on:click.stop="() => false" v-on:mousedown.stop="() => false">
      <template v-if="c_modeType === 'c' || c_modeType===''">
        <div class="table_title">
          작물 입력
        </div>
      </template>
      <template v-if="c_modeType === 'e'">
        <div class="table_title">
          작물 수정
        </div>
      </template>
      <div style="padding-top: 20px;">
        <div class="item_title">
          <div class="item">별칭</div>
          <div><input type="text" ref="othername" v-model="othername" style="width: 400px;"></div>
        </div>
        <div class="item_title">
          <div class="item">작물</div>
          <div>
            <select class="text" v-model="groupcode" style="width: 200px; padding-right: 5px;">
              <template v-for="(item, idx) in c_group_item">
                <option v-bind:value="item.itemcode">{{item.itemname}}</option>
              </template>
            </select>
          </div>
        </div>
        <div class="item_title">
          <div class="item">노지/시설</div>
          <div>
            <select class="text" v-model="wherename" style="width: 200px; padding-right: 5px;">
              <option value="0">노지</option>
              <option value="1">시설</option>
            </select>
          </div>
        </div>
        <div class="item_title">
          <div class="item">파종/정식일</div>
          <div class="datepicker_icon" style="border: 1px solid #ccc;">
            <datepicker v-model="m_day" :language="date_locale_ko" :format="dateFormatter" style="width: 200px;padding: 12px 0 0 10px;height: 40px;"></datepicker>
          </div>
        </div>
        <div class="item_title">
          <div class="item">지역</div>
          <div>
            <select class="text" v-model="sido"  style="width: 100px; padding-right: 5px;" v-on:change="onSidoChange">
              <template v-for="(item, idx) in c_sido">
                <option v-bind:value="item.item_seq">{{item.item_name}}</option>
              </template>
            </select>
            <select class="text" v-model="gugun"  style="width: 100px; padding-right: 5px;">
              <option value="0">선택</option>
              <template v-for="(item, idx) in c_gugun">
                <option v-bind:value="item.item_seq">{{item.item_name}}</option>
              </template>
            </select>
          </div>
        </div>
        <div class="item_title">
          <div class="item">생육상태</div>
          <div>
            <select class="text" v-model="plantstatus"  style="width: 100px; padding-right: 5px;">
              <option value="0">선택</option>
              <option value="1">활착기</option>
              <option value="2">성장기</option>
              <option value="3">수확기</option>
            </select>
          </div>
        </div>
      </div>
      <div style="padding-top: 20px;">
        <div style="display: flex; flex-direction: row;">
          <div style="flex: 1"></div>
          <div class="btn newgreen" style="width:160px; height: 50px;" v-on:click="onVerify">확인</div>
          <div class="btn_cancel" style="width:160px; height: 50px;" v-on:click="onCancel">취소</div>
          <div style="flex: 1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { ko } from 'vuejs-datepicker/dist/locale';
import moment from 'moment/moment';
import Datepicker from 'vuejs-datepicker';
import apiitem from '../../api/ApiItem';
import apilist from '../../api/ApiList';
import BaseMixin from '../Mixins/BaseMixin';

export default {
  name: 'MPPopup',
  components: { Datepicker },
  props: ['modeType'],
  mixins: [BaseMixin],
  created() {
  },
  data() {
    return {
      seq: -1,
      group_item: [],
      item_sido: [],
      item_gugun: [],
      is_open: false,
      date_locale_ko: ko,
      othername: '',
      groupcode: 'AA',
      wherename: '1',
      m_day: moment().format('YYYY-MM-DD'),
      sido: '1',
      gugun: '1',
      plantstatus: '',
    };
  },
  computed: {
    ...mapGetters(['is_logged']),
    c_sido() {
      return this.item_sido;
    },
    c_gugun() {
      return this.item_gugun;
    },
    c_group_item() {
      return this.group_item;
    },
    c_modeType() {
      if (this.modeType) {
        return this.modeType;
      } else {
        return 'c';
      }
    },
  },
  methods: {
    onRest() {
      this.othername = '';
      this.groupcode = 'AA';
      this.wherename = '1';
      this.m_day = moment().format('YYYY-MM-DD');
      this.sido = '1';
      this.gugun = '0';
      this.plantstatus = '0';
    },
    onVerify() {
      if (!this.othername || this.othername.length < 1) {
        this.onError('별칭을 입력하세요.');
        this.$refs.othername.focus();
      }
      const data = {};
      if (this.modeType === 'e') {
        data.seq = this.seq;
      }
      data.othername = this.othername;
      data.groupcode = this.groupcode;
      data.wherename = this.wherename;
      data.m_day = this.m_day;
      data.sido = this.sido;
      data.gugun = this.gugun;
      data.plantstatus = this.plantstatus;
      apilist.createMyplant(data, this.modeType)
      .then( (result) => {
        if (result.error === 0) {
          if (this.modeType === 'c') {
            this.onSuccess('등록되었습니다. ');
          } else {
            this.onSuccess('수정되었습니다. ');
          }
          this.$emit('onDataChange');
          this.is_open = false;
        } else {
          this.onError(`에러 발생함.${result.message}`);
        }
      })
      .catch((e) => {
        this.onError(e);
      });
    },
    onCancel() {
      this.closePopup();
    },
    dateFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    async openPopupBySeq(seq) {
      await this.getGroup();
      await this.getSido();
      await this.geGugun(this.sido);
      this.seq = seq;
      if (this.modeType === 'e') {
        await apilist.getMyplantInfo(seq)
        .then(async (result) => {
          if (result.error === 0) {
            const info = result.data[0];
            this.othername = info.othername;
            this.groupcode = info.groupcode;
            this.wherename = info.wherename;
            this.m_day = info.m_day;
            this.sido = info.sido;
            if (this.sido) {
              await this.geGugun(this.sido);
            }
            this.gugun = info.gugun;
            this.plantstatus = info.plantstatus;
            this.is_open = true;
          } else {
            this.onError(result.message);
            this.is_open = false;
          }
        })
        .catch((e) => {

        })
      }
    },
    async openPopup() {
      this.$log.debug('openPopup');
      this.is_open = true;
      await this.getGroup();
      await this.getSido();
      await this.geGugun(this.sido);
      this.onRest();
    },
    closePopup() {
      this.is_open = false;
    },
    async onSidoChange(event) {
      this.sido = event.target.value;
      await this.geGugun(this.sido);
      this.gugun = 0;
    },
    async getGroup() {
      await apiitem.getGroup()
        .then((result) => {
          this.group_item = result.group;
        })
        .catch((e) => {
          this.$log.error(e);
        });
    },
    async getSido() {
      await apiitem.getSido()
        .then((result) => {
          this.$log.debug(result);
          this.item_sido = result.sido;
        })
        .catch((e) => {
          this.$log.error(e);
        });
    },
    async geGugun(sido) {
      await apiitem.getGugun(sido)
        .then((result) => {
          // this.$log.debug(result);
          this.item_gugun = result.gugun;
          this.gugun = '';
        })
        .catch((e) => {
          this.$log.error(e);
        });
    },
  },

};
</script>

<style scoped>
.newdata {
  width: 580px;
  padding: 50px;
}
input{
  border-bottom:1px solid #ccc;
  height: 40px;
  font-weight: 400;
  font-size: 14px;
  color: #333;
  letter-spacing: -0.5px;
}

input::placeholder{
  color:#aaa297;
}
.item{
  width:100px;font-weight: 400; font-size: 14px; color: #504637; letter-spacing: -0.5px; padding-top: 12px;
}
.item_title{
  display: flex; flex-direction: row; padding-top: 10px;
}
</style>
