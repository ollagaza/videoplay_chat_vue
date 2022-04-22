<template>
  <div style="background-color: #fff; width:580px; height:870px;margin-bottom: 30px;">
    <div style="padding:50px 50px 50px 50px ">
      <template v-if="c_is_type === 'c'">
        <div class="member_title">회원가입</div>
      </template>
      <template v-else>
        <div class="member_title">회원정보수정</div>
      </template>
      <div class="member_sub">* 필수사항입니다.</div>
      <div style="margin-top: 30px;">
        <div class="member_label">아이디*</div>
        <div class="member_input" style="padding-top: 6px;">
          <template v-if="c_is_type === 'c'">
            <input type="text" name="" placeholder="아이디를 영문소문자 숫자 혼용 (4 ~ 16자)" value="" style="width: 350px;" ref="user_id" v-model="user_id" v-on:keyup="onVerifyCheck('userid')">
            <div class="btn_idauth" v-on:click="onVerifyUserId">ID중복확인</div>
          </template>
          <template v-else>
            <div style="height: 30px; margin-top: 10px; width: 100%; border-bottom: 1px solid #ccc; font-weight: 600; color:#aaa;">
              {{user_id}}
            </div>
          </template>
        </div>
        <template v-if="c_is_type === 'c'">
          <div>{{user_id_error}}</div>
        </template>
      </div>
      <template v-if="c_is_type === 'c'">
      <div style="padding-top: 20px;">
        <div style="display: flex; flex-direction: row;">
          <div>
            <div class="member_label">비밀번호*</div>
            <div class="member_input" style="padding-top: 6px;">
              <input type="password" name="" value="" ref="password" v-model="password"  placeholder="" style="width: 235px;">
            </div>
          </div>
          <div style="margin-left: 10px;">
            <div class="member_label">비밀번호 확인*</div>
            <div class="member_input" style="padding-top: 6px;">
              <input type="password" name="" value="" v-model="password_confirm"  style="width: 235px;" v-on:keyup="onVerifyPassword()">
            </div>
          </div>
        </div>
        <div>
          {{password_error}}
        </div>
      </div>
      </template>
      <div style="margin-top: 20px;">
        <div class="member_label">이름*</div>
        <div class="member_input" style="padding-top: 6px;">
          <template v-if="c_is_type === 'c'">
            <input type="text" name="" ref="user_name" v-model="user_name" value="" style="width: 480px;">
          </template>
          <template v-else>
            <div style="height: 30px; margin-top: 10px; width: 100%; border-bottom: 1px solid #ccc; font-weight: 600; color:#aaa;">
              {{user_name}}
            </div>
          </template>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="member_label">생년월일*</div>
        <div class="member_input" style="padding-top: 6px;">
          <div class="input_wra datepicker_icon">
            <datepicker v-model="birth_day" :language="date_locale_ko" :format="dateFormatter" style="width: 480px;"></datepicker>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="member_label">이메일*</div>
        <div class="member_input" style="padding-top: 6px;">
          <input type="text" name="" value=""  placeholder="이메일을 입력하세요."  style="width: 480px;" v-model="email_address" ref="email_address">
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="member_label">핸드폰번호*</div>
        <div class="member_input" style="padding-top: 6px;">
          <input type="text" name="" value="" placeholder="' - ' 없이 입력" v-model="cellphone" ref="cellphone" maxlength="11" style="width: 480px;">
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="member_label">전화번호</div>
        <div class="member_input" style="padding-top: 6px;">
          <input type="text" name="" value="" placeholder="' - ' 없이 입력" v-model="tel" ref="tel" maxlength="11" style="width: 480px;">
        </div>
      </div>

      <div style="margin-top: 30px;">
        <div style="display: flex; flex-direction: row; padding-top: 6px;">
          <div style="flex: 1"></div>
          <template v-if="c_is_type === 'c'">
            <div class="btn newgreen" style="width:160px; height: 50px;" v-on:click="onVerify">가입</div>
          </template>
          <template v-else>
            <div class="btn newgreen" style="width:160px; height: 50px;" v-on:click="onModify">수정</div>
          </template>
          <div class="btn_cancel" style="width:160px; height: 50px;" v-on:click="onCancel">취소</div>
          <div style="flex: 1"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import BaseMixin from '../Mixins/BaseMixin';
import moment from 'moment/moment';
import { ko } from 'vuejs-datepicker/dist/locale';
import Datepicker from 'vuejs-datepicker';
import api_user from '../../api/ApiUser';
//import { mapGetters } from 'vuex';
import { mapActions, mapGetters } from 'vuex';

import store from '../../vuex/store';

export default {
  name: 'Member_Info',
  components: { Datepicker },
  props: ['isType'],
  data() {
    return {
      user_id: '',
      verify_user_id: '',
      user_id_error: 'ID중복확인 해주세요',
      password: '',
      password_confirm: '',
      password_error: '영문, 숫자, 특수문자 모두포함(8~16자)',
      birth_day: moment().format('YYYY-MM-DD'),
      user_name: '',
      cellphone: '',
      tel: '',
      email_address: '',
      date_locale_ko: ko,
      //c_is_type: this.$route.query.isType
    };
  },
  beforeCreate() { 
    const isLoggedIn = store.getters['is_logged'];
    //alert(this.is_logged);
    // Login 체크
    //console.log(isLoggedIn);
    //if(!isLoggedIn) {
    //  this.$router.push({ name: 'index' });
    //}    
    //alert(this.is_logged);
  },
  mounted() {
    //console.log('111')
    //console.log(this.c_is_type)
    if (this.c_is_type === 'e') {
      //const isLoggedIn = store.getters['is_logged'];
      //alert(this.is_logged);
      // Login 체크
      if(!this.is_logged) {
        this.$router.push({ name: 'index' });
      }


      //console.log('222')
      this.loadData();
    }
    //console.log('333')
  },  
  mixins: [BaseMixin],
  computed: {
    ...mapGetters(['logged_info', 'is_logged']),
    c_is_type() {
      //return 'this.isType';
      return this.$route.query.isType;
    },
    c_is_verify_user_name() {
      return this.user_name && this.user_name.length > 1;
    },
    c_is_verify_user_id() {
      return this.user_id && this.verify_user_id === this.user_id;
    },
    c_is_verify_password() {
      if (this.password === null) {
        return false;
      }
      if (!(this.password.length >= 8 && this.password.length <= 16)) {
        this.password_error = '비밀번호는 8자이상 16자리 미만 입니다.';
        return false;
      }

      if (this.password !== this.password_confirm){
        this.password_error = '비밀번호가 같지 않습니다.';
        return false;
      } else {
        const regexp_eng = /[a-zA-Z]/;
        const regexp_num = /[0-9]/;
        const regexp_spc = /[!@#$%^&*\-_=+~/\\|]/;
        if (!regexp_eng.test(this.password)) {
          this.password_error = '비밀번호에 영문이 포함되어야 합니다.';
          return false;
        }
        if (!regexp_num.test(this.password)) {
          this.password_error = '비밀번호에 숫자가 포함되어야 합니다.';
          return false;
        }
        if (!regexp_spc.test(this.password)) {
          this.password_error = '비밀번호에 특수문자가 포함되어야 합니다.';
          return false;
        }
        this.password_error = '사용가능합니다.';
        return true;
      }
    },
  },
  methods: {
    ...mapActions(['GetUserInfo']),
    loadData() {
      if (this.logged_info) {
        this.member_seq = this.logged_info.seq;
        this.user_id = this.logged_info.user_id;
        this.birth_day = this.logged_info.birth_day;// '2011-2-2';
        this.user_name = this.logged_info.user_name;
        this.cellphone = this.logged_info.cellphone;// '010222555';
        this.tel = this.logged_info.tel; // '0255553333';
        this.email_address = this.logged_info.email_address;

        //console.log(this.cellphone);
        //console.log(this.birth_day);
        //this.$refs.cellphone.value = this.cellphone;
        //this.user_id = "test!!!";
        
        //this.birth_day = "2000-02-13";
        //this.$refs.email_address.value = this.email_address;
        //this.$refs.cellphone.value = this.cellphone;
        //this.$refs.tel.value = this.tel;
      }
      //this.user_id = "USERID";
    },
    isCreateMode() {
      this.$log.debug('isType', this.isType);
      if (this.c_is_type === 'c') {
        return true;
      }
      return false;
    },
    dateFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    onModify(){
      if (!this.c_is_verify_user_name) {
        this.$refs.user_name.focus();
        this.onError('이름을 입력해주세요.');
        return;
      }
      if (!this.birth_day || this.birth_day.length < 2) {
        this.$refs.birth_day.focus();
        this.onError('생일을 입력해주세요.');
        return;
      }
      if (!this.email_address || this.email_address.length < 10) {
        this.$refs.email_address.focus();
        this.onError('email을 입력해주세요.');
        return;
      }
      if (!this.isCheckEmail(this.email_address)){
        this.$refs.email_address.focus();
        this.onError('email형식을 확인해주세요.');
        return;
      }
      if (!this.cellphone || this.cellphone.length < 10) {
        this.$refs.cellphone.focus();
        this.onError('핸드폰번호를 입력해주세요.');
        return;
      }
      const regexp_num = /^[0-9]+$/;
      if (!regexp_num.test(this.cellphone)) {
        this.$refs.cellphone.focus();
        this.onError('핸드폰번호를 확인해주세요.');
        return;
      }
      this.onNext();
    },
    onVerify() {
      alert(this.user_name);
      this.$log.debug(this.isCreateMode());
      if (!this.c_is_verify_user_id) {
        this.$refs.user_id.focus();
        this.onError('ID를 확인해주세요.');
        return;
      }
      if (!this.c_is_verify_password) {
        this.$refs.password.focus();
        this.onError('Password를 확인해주세요.');
        return;
      }
      if (!this.c_is_verify_user_name) {
        this.$refs.user_name.focus();
        this.onError('이름을 입력해주세요.');
        return;
      }
      if (!this.birth_day || this.birth_day.length < 2) {
        this.$refs.birth_day.focus();
        this.onError('생일을 입력해주세요.');
        return;
      }
      if (!this.email_address || this.email_address.length < 10) {
        this.$refs.email_address.focus();
        this.onError('email을 입력해주세요.');
        return;
      }
      if (!this.isCheckEmail(this.email_address)){
        this.$refs.email_address.focus();
        this.onError('email형식을 확인해주세요.');
        return;
      }
      if (!this.cellphone || this.cellphone.length < 10) {
        this.$refs.cellphone.focus();
        this.onError('핸드폰번호를 입력해주세요.');
        return;
      }
      const regexp_num = /^[0-9]+$/;
      if (!regexp_num.test(this.cellphone)) {
        this.$refs.cellphone.focus();
        this.onError('핸드폰번호를 확인해주세요.');
        return;
      }
      this.onNext();
    },
    async onNext() {
      const bday = this.dateFormatter(this.birth_day);
      const member_info = {
        user_id: this.user_id,
        user_name: this.user_name,
        password: this.password,
        birth_day: bday,
        cellphone: this.cellphone,
        tel: this.tel,
        email_address: this.email_address,
      };
      this.$log.debug(member_info);
      let result = '';
      if (this.isCreateMode()) {
        await api_user.createUser(member_info)
          .then((result) => {
            if (result.error === 0) {
              this.onSuccess('가입완료되었습니다. 로그인후 사용하시기 바랍니다.');
              this.$router.push({ name: 'index' });
            } else {
              this.onError(`가입에 실패하였습니다. (${this.result.message})`);
            }
            this.$log.debug(result);
          })
          .catch((e) => {
            this.onError(`가입에 실패하였습니다. (${e})`);
          });
      } else {
        //alert(this.member_seq);
        result = await api_user.updateUser(this.member_seq, member_info);
        if (result.error === 0){
          this.onSuccess('정보가 수정되었습니다.');
          this.GetUserInfo(member_info);

          //commit('SET_LOGGED_INFO', member_info);
          //commit('SET_LOGGED_UPDATE', member_info);
          //this.getUserData(this.member_seq);
        } else {
                  this.onError('정보 수정 실패하였습니다.');
        }
        // this.setData(result);
      }
    },
    onCancel() {
      this.$router.push({ name: 'index' });
    },
    isCheckEmail(myValue) {
      const email = myValue;
      const exptext = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
      if (exptext.test(email) === false) {
        // 이메일 형식이 알파벳+숫자@알파벳+숫자.알파벳+숫자 형식이 아닐경우
        // alert('이메일형식이 올바르지 않습니다.');
        return false;
      }
      return true;
    },
    onVerifyPassword() {
      if (this.c_is_verify_password) {
      }
    },
    onVerifyCheck(verify_postion) {
      switch (verify_postion) {
        case 'userid':
          if (!this.c_is_verify_user_id && this.user_id !== '') {
            this.user_id_error = '아이디 중복확인을 해주세요.';
          } else {
            this.user_id_error = null;
          }
          break;
        default:
          break;
      }
    },
    onVerifyUserId() {
      if (this.c_is_verify_user_id) {
        return;
      }
      // const options = {};
      // options.popup_image = '/img/renewal/drive/mark.png';
      const check = this.user_id.replace(/[a-zA-Z0-9]/gi, '');
      const user_id = this.user_id.replace(/[^a-zA-Z0-9]/gi, '');
      // alert(check + ',' +user_id);
      if (check.length > 0) {
        this.user_id_error = '아이디는 영문 숫자만 가능합니다.';
        this.user_id = user_id;
        return;
      }
      if (user_id.length < 4) {
        this.user_id_error = '4자이상 입력해주세요.';
        this.user_id = user_id;
        return;
      }
      api_user.verifyUserId(user_id)
        .then((result) => {
          if (!result || result.co > 0) {
            this.$log.debug(result);
            this.user_id_error = '이미 사용 중입니다. 다른 아이디를 입력해주세요.';
            return;
          }
          this.user_id_error = '사용 가능한 아이디 입니다.';
          this.onVerifyIdComplete(user_id);
        })
        .catch((error) => {
          this.$log.error(error);
          this.user_id_error = '이미 사용 중입니다. 다른 아이디를 입력해주세요.';
        });
    },
    onVerifyIdComplete(user_id) {
      this.verify_user_id = user_id;
      this.user_id = user_id;
    },
    getUserData(member_seq) {
      //console.log('666');
      api_user.getUserData(member_seq)
        .then((result) => {
          this.$log.debug('getUserData', result);
          //console.log('777');
          if (result.user_data) {
            this.$store.commit('setUserStoredData', result.user_data);
            //console.log(result);
          }
          
        })
        .catch((error) => {
          this.$log.error(error);
        })
        .then(() => {
          this.routeLogin();
        });
    },

  },
};
</script>

<style scoped>
.member_title{
  font-weight: 600;
  font-size: 27px;
  color: #030303;
  letter-spacing: -1px;
}
.member_sub{
  padding-top:14px;
  font-weight: 300;
  font-size: 18px;
  color: #504637;
  letter-spacing: -0.5px;
}
.member_input{
  display: flex;
  flex-direction: row;
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

.btn_idauth{
  width: 120px;
  height: 40px;
  font-weight: 400;
  font-size: 14px;
  color: #fff;
  letter-spacing: -0.5px;
  background-color: #878374;
  text-align: center;
  padding-top: 10px;
  margin-left: 10px;
  cursor: pointer;
}

.btn_idauth:hover {
  background-color: #6e5f49;
}

.member_label{
  font-weight: 400;
  font-size: 12px;
  color: #504637;
  letter-spacing: -0.5px;
}

.input_wra {
  position: relative;
  display: flex;
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 1;
  min-height: 30px;
  border-bottom: 1px solid #dddddd;
  padding: 0 10px;
  align-items: center;
  width: 100%;
}

</style>
