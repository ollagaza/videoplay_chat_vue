<template>
  <div style="background-color: #fff; width:580px; height:430px;box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2)">
    <div style="padding:50px 50px 50px 50px ">
      <div style="font-weight: 600; font-size: 27px;color: #030303; letter-spacing: -1px">회원가입</div>
      <div style="padding-top:14px; font-weight: 300; font-size: 18px; color: #504637; letter-spacing: -0.5px">본인인증및 가입여부 확인</div>
      <div class="jtitle">핸드폰번호</div>
      <div style="display: flex; flex-direction: row; padding-top: 6px;">
        <input type="text" class="jinput" name="" value="" ref="hphone" v-model="hphone" placeholder="핸드폰번호를 입력하세요." maxlength="11"  >
        <div class="hpcode" v-on:click="onHphone">인증번호받기</div>
      </div>
      <div class="jtitle">인증번호</div>
      <div style="padding-top: 6px;">
        <input type="text" class="jinput" name="" value="" ref="ref_hphone_code" v-model="hphone_code" v-bind:disabled="!isSendCode" placeholder="인증번호를 입력하세요.">
      </div>
      <div style="padding-top:30px;display: flex; flex-direction: row;">
        <div class="join_next" v-on:click="onNextPage">다음</div>
        <div class="join_cancel" v-on:click="onCancel">취소</div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseMixin from '../Mixins/BaseMixin';

export default {
  name: 'Join',
  componets: [],
  props: ['isType'],
  data() {
    return {
      step_page: '1',
      hphone: '',
      hphone_code: '',
      isSendCode: false,
    };
  },
  mixins: [BaseMixin],
  methods: {
    onNextPage() {
      if (this.hphone_code.length < 5) {
        this.$refs.ref_hphone_code.focus();
        this.onError('전화번호인증을 하셔야 합니다.');
        return;
      }
      // if (!this.read_confirm) {
      //   this.onError('약관을 읽고 동의해주세요.');
      //   return;
      // }
      this.step_page = '2';
      this.$emit('onNextStep', this.step_page);
    },
    onCancel() {
      this.$router.push({ name: 'index' });
    },
    onHphone() {
      if (this.hphone.length < 11) {
        this.$refs.hphone.focus();
        this.onError('전화번호를 입력하세요.');
        return;
      }
      this.isSendCode = true;
      this.$nextTick(() => {
        this.$refs.ref_hphone_code.focus();
      });
    },
  },
};
</script>

<style scoped>
.layout {
  /*height: 100%;*/
}

.join_next {
  width: 235px;
  height: 50px;
  font-weight: 400;
  font-size: 16px;
  color: #fff;
  border-radius: 6px;
  background-color: #336a3c;
  text-align: center;
  padding-top: 13px;
  cursor: pointer;
}

.join_next:hover {
  background-color: #81b247;
}
.join_cancel {
  width: 235px;
  height: 50px;
  font-weight: 400;
  font-size: 16px;
  color: #336a3c;
  border-radius: 6px;
  background-color: #fff;
  text-align: center;
  padding-top: 13px;
  margin-left: 10px;
  border: 1px solid #DEE7DF;
  cursor: pointer;
}

.join_cancel:hover{
  border: 1px solid #336a3c;
  color: #336a3c;
}

.hpcode {
  width: 120px;
  height: 40px;
  font-weight: 400;
  font-size: 14px;
  color: #fff;
  letter-spacing: -0.5px;
  background-color: #8d8374;
  text-align: center;
  padding-top: 10px;
  margin-left: 10px;
  cursor: pointer;
}
.hpcode:hover {
  background-color: #6e5f49;
}

.jinput{
  border-bottom:1px solid #ccc;
  height: 40px;
  width: 350px;
  font-weight: 400;
  font-size: 14px;
  color: #aaa297;
  letter-spacing: -0.5px;
}

.btn_authcode {
}
.jtitle{
  padding-top:20px;
  font-weight: 400;
  font-size: 12px;
  color: #504637;
  letter-spacing: -0.5px;
}

</style>
