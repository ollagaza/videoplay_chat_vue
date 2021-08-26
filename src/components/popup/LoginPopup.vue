<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }">
    <div class="popup login_popup" v-on:click.stop="() => false" v-on:mousedown.stop="() => false">
      <div class="popup_title_top">
        <span>{{ c_title }}</span>
        <span class="delete_btn" v-on:click.stop="closePopup"></span>
      </div>
      <div class="popup_contents">
        <form>
          <template v-if="visible.find_id_result">
            <div class="find_result_id">{{ find_id_result.user_id }}</div>
            <div class="find_result_email" v-html="c_find_id"></div>
          </template>
          <template v-if="visible.login">
            <div class="input_title m30">아이디</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="login.user_id" ref="login_id" v-on:keypress="onLoginKeyPress($event)" placeholder="아이디를 입력하세요." autocomplete="username" spellcheck="false">
              </div>
            </div>
            <div class="input_title m20">비밀번호</div>
            <div class="input_row">
                <div class="input_wra">
                  <input type="password" v-model="login.password" ref="login_password" v-on:keypress="onLoginKeyPress($event)" placeholder="비밀번호를 입력하세요." autocomplete="current-password" spellcheck="false">
                </div>
            </div>
            <div class="check">
              <div class="check_wrapper" v-on:click="onCheckClick">
                <span class="check_box" v-bind:class="{ on: save_id }"></span>
                <span class="check_text">아이디 기억하기</span>
              </div>
            </div>
            <div class="display_text" v-if="message || error_message">
              <div class="message" v-if="message" v-html="message"></div>
              <div class="error_message" v-if="error_message" v-html="error_message"></div>
            </div>
            <div class="button_layer">
              <template v-if="is_loading">
                <div class="lds-facebook"><div></div><div></div><div></div></div>
              </template>
              <template v-else>
                <div class="btn newgreen login"  v-on:click="onLoginClick"><span>로그인</span></div>
              </template>
            </div>
          </template>
          <template v-if="visible.find_id">
            <div class="input_title m30">이메일 주소</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_id.email_address" ref="find_id_email" v-on:keypress="onFindIdKeyPress" placeholder="이메일 주소를 입력하세요." spellcheck="false">
              </div>
            </div>
            <div class="input_title m20">이름</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_id.user_name" ref="find_id_name" v-on:keypress="onFindIdKeyPress" placeholder="이름을 입력하세요." spellcheck="false">
              </div>
            </div>
            <div class="display_text" v-if="message || error_message">
              <div class="message" v-if="message" v-html="message"></div>
              <div class="error_message" v-if="error_message" v-html="error_message"></div>
            </div>
            <div class="button_layer">
              <template v-if="is_loading">
                <div class="lds-facebook"><div></div><div></div><div></div></div>
              </template>
              <template v-else>
                <div class="btn newgreen login mbottom5" v-on:click="onFindIdClick"><span>아이디 찾기</span></div>
              </template>
            </div>
          </template>
          <template v-if="visible.find_password">
            <div class="input_title m30">아이디</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_password.user_id" ref="find_password_id" v-on:keypress="onFindPasswordKeyPress" placeholder="아이디를 입력하세요." spellcheck="false">
              </div>
            </div>
            <div class="input_title m30">이메일 주소</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_password.email_address" ref="find_password_email" v-on:keypress="onFindPasswordKeyPress" placeholder="이메일 주소를 입력하세요." spellcheck="false">
              </div>
            </div>
            <div class="input_title m30">이름</div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_password.user_name" ref="find_password_name" v-on:keypress="onFindPasswordKeyPress" placeholder="이름을 입력하세요" spellcheck="false">
              </div>
              <span class="right_box">
                <div class="btn w100p" v-on:click="onAuthMailSendClick"><span>{{ is_send_code ? '인증번호 재발송' : '인증번호 발송' }}</span></div>
              </span>
            </div>
            <div class="input_row">
              <div class="input_wra">
                <input type="text" v-model="find_password.input_code"ref="find_password_code" v-on:keypress="onFindPasswordKeyPress" placeholder="전송받은 인증번호를 입력해 주세요." spellcheck="false">
              </div>
              <span class="right_box">
                {{ remain_time_str ? remain_time_str : '' }}
              </span>
            </div>
            <div class="display_text" v-if="message || error_message">
              <div class="message" v-if="message" v-html="message"></div>
              <div class="error_message" v-if="error_message" v-html="error_message"></div>
            </div>
            <div class="button_layer">
              <template v-if="is_loading">
                <div class="lds-facebook"><div></div><div></div><div></div></div>
              </template>
              <template v-else>
                <div class="btn newgreen login mbottom5" v-on:click="onCheckCodeClick" v-bind:class="{ disable: !is_send_code }"><span>확인</span></div>
<!--                btn blue w100p h40 f15-->
              </template>
            </div>
          </template>
          <template v-if="visible.reset_password">
            <div class="input_row"><div class="input_wra"><input type="password" v-model="reset_password.password" ref="reset_password" v-on:keypress="onResetPasswordKeyPress" placeholder="새 비밀번호" spellcheck="false"></div></div>
            <div class="input_row"><div class="input_wra"><input type="password" v-model="reset_password.password_confirm" ref="reset_password_confirm" v-on:keypress="onResetPasswordKeyPress" placeholder="비밀번호 확인" spellcheck="false"></div></div>
            <div class="display_text" v-if="message || error_message">
              <div class="message" v-if="message" v-html="message"></div>
              <div class="error_message" v-if="error_message" v-html="error_message"></div>
            </div>
            <div class="button_layer">
              <template v-if="is_loading">
                <div class="lds-facebook"><div></div><div></div><div></div></div>
              </template>
              <template v-else>
                <div class="btn newgreen login mbottom5" v-on:click="onResetPasswordClick"><span>완료</span></div>
              </template>
            </div>
          </template>
          <template v-if="visible.find_id_pw_text">
            <div class="find_wrapper">
              <span class="bar" v-on:click="findId">아이디 찾기</span>
              <span class="bar" v-on:click="findPassword">비밀번호 찾기</span>
              <span class="inmember" v-on:click="onJoinClick">회원가입</span>
            </div>
          </template>
          <template v-if="visible.find_pw_text">
            <div class="find_wrapper">
              <span  class="bar" v-on:click="findPassword">비밀번호 찾기</span>
              <span class="inmember" v-on:click="onJoinClick">회원가입</span>
            </div>
          </template>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import util from '../../utils/util';
import api_user from '../../api/ApiUser';
import config from '../../config';
import EventBus from '../../utils/eventbus';

export default {
  name: 'LoginPopup',
  components: { },
  data() {
    return {
      visible: {
        find_id_result: false,
        login: true,
        find_id: false,
        find_password: false,
        find_id_pw_text: true,
        find_pw_text: false,
        reset_password: false,
        join_message: true,
      },
      title: 'T_0001',
      is_open: false,
      save_id: false,
      error_message: null,
      message: null,
      login: {
        user_id: null,
        password: null,
      },
      find_id: {
        user_name: null,
        email_address: null,
      },
      find_password: {
        user_id: null,
        user_name: null,
        email_address: null,
        input_code: null,
      },
      reset_password: {
        password: null,
        password_confirm: null,
      },
      find_id_result: null,
      send_code_result: null,
      url_prefix: null,
      request_domain: null,
      is_send_code: false,
      remain_time: null,
      remain_time_str: '',
      is_loading: false,
      close_callback: null,
      // is_vacs: config.isVacs(),
    };
  },
  created() {
    this.url_prefix = `${this.current_domain}/v2/index`;
    this.request_domain = this.current_domain;
  },
  computed: {
    ...mapGetters(['current_domain', 'lang', 'group_invite_code', 'link_code']),
    c_lang() {
      return util.getLanguage(this.lang, this.$options.name);
    },
    c_title() {
      return this.c_lang[this.title];
    },
    c_find_id() {
      return util.replaceByTemplate(this.c_lang.C_0006, { user_name: this.find_id_result.user_name });
    },
  },
  watch: {
  },
  mounted() {
    this.addKeyboardEvent();
  },
  beforeDestroy() {
    this.removeKeyboardEvent();
  },
  methods: {
    ...mapActions(['Login']),
    onJoinClick (){
      this.$router.push({ name: 'join' });
      this.closePopup();
    },
    addKeyboardEvent() {
      document.addEventListener('keyup', this.onKeyUp);
    },
    removeKeyboardEvent() {
      document.removeEventListener('keyup', this.onKeyUp);
    },
    onKeyUp($event) {
      if (!this.is_open) {
        return;
      }
      if ($event.keyCode === 27) {
        this.closePopup();
      }
    },
    onLoginKeyPress($event) {
      if (this.is_loading) {
        return;
      }
      if ($event.keyCode === 13) {
        if (util.trim(this.login.user_id) === '') {
          this.$nextTick(() => this.$refs.login_id.focus());
        } else if (util.trim(this.login.password) === '') {
          this.$nextTick(() => this.$refs.login_password.focus());
        } else {
          this.onLoginClick();
        }
      }
    },
    onLoginClick() {
      if (this.is_loading) {
        return;
      }
      if (util.trim(this.login.user_id) === '') {
        this.error_message = this.c_lang.S_0001;
        this.$nextTick(() => this.$refs.login_id.focus());
        return;
      }
      if (util.trim(this.login.password) === '') {
        this.error_message = this.c_lang.S_0002;
        this.$nextTick(() => this.$refs.login_password.focus());
        return;
      }
      this.is_loading = true;
      const params = { user_id: this.login.user_id, password: this.login.password };
      this.Login(params)
        .then((result) => {
          this.$log.debug(result);
          if (result.error) {
            this.error_message = '아이디, 비밀번호를 확인해 주세요...';
            this.is_loading = false;

            // if (result.error === -101.1) {
            //   this.$router.push({ name: 'LoginErrorPage', params: { user_info: { user_type: 'P' } } });
            // } else if (result.error === -101.2) {
            //   this.$router.push({ name: 'LoginErrorPage', params: { user_info: { user_type: 'H' } } });
            // } else {
            this.error_message = result.message;
            // }
            return null;
          }
          this.error_message = null;
          if (this.save_id) {
            localStorage.setItem('user_id', this.login.user_id);
          } else {
            localStorage.removeItem('user_id');
          }
          this.getUserData(result.member_seq);
          return null;
        })
        .catch((e) => {
          this.$log.error(e);
          this.error_message = this.c_lang.S_0003;
          this.is_loading = false;
        });
    },
    getUserData(member_seq) {
      api_user.getUserData(member_seq)
        .then((result) => {
          this.$log.debug('getUserData', result);
          if (result.user_data) {
            this.$store.commit('setUserStoredData', result.user_data);
          }
        })
        .catch((error) => {
          this.$log.error(error);
        })
        .then(() => {
          this.routeLogin();
        });
    },
    onCheckClick() {
      this.save_id = !this.save_id;
    },
    findId() {
      this.resetInputs();
      this.visible.find_id_result = false;
      this.visible.login = false;
      this.visible.find_id = true;
      this.visible.find_password = false;
      this.visible.reset_password = false;
      this.visible.find_id_pw_text = false;
      this.visible.find_pw_text = false;
      this.visible.join_message = true;
      this.error_message = null;
      this.title = 'T_0002';
      this.message = null;
      this.$nextTick(() => this.$refs.find_id_email.focus());
    },
    onFindIdKeyPress($event) {
      if (this.is_loading) {
        return;
      }
      if ($event.keyCode === 13) {
        if (util.trim(this.find_id.email_address) === '') {
          this.$nextTick(() => this.$refs.find_id_email.focus());
        } else if (util.trim(this.find_id.user_name) === '') {
          this.$nextTick(() => this.$refs.find_id_name.focus());
        } else {
          this.onFindIdClick();
        }
      }
    },
    onFindIdClick() {
      if (this.is_loading) {
        return;
      }
      if (util.trim(this.find_id.email_address) === '') {
        this.error_message = this.c_lang.S_0004;
        this.$nextTick(() => this.$refs.find_id_email.focus());
        return;
      }
      if (util.trim(this.find_id.user_name) === '') {
        this.error_message = this.c_lang.S_0005;
        this.$nextTick(() => this.$refs.find_id_name.focus());
        return;
      }
      this.is_loading = true;
      this.find_id_result = null;
      const params = {
        user_name: this.find_id.user_name,
        email_address: this.find_id.email_address,
      };
      api_user.findUserId(params)
        .then((result) => {
          this.$log.error(result);
          if (!result || result.error !== 0 || !result.is_find) {
            this.error_message = this.c_lang.S_0006;
            this.is_loading = false;
            return;
          }
          this.error_message = null;
          this.find_id_result = {
            user_id: result.user_id,
            user_name: result.user_name,
            email_address: result.email_address,
          };
          this.onFindIdComplete();
        })
        .catch((error) => {
          this.$log.error(error);
          this.error_message = this.c_lang.S_0006;
          this.is_loading = false;
        });
    },
    onFindIdComplete() {
      this.resetInputs();
      this.visible.find_id_result = true;
      this.visible.login = true;
      this.visible.find_id = false;
      this.visible.find_password = false;
      this.visible.reset_password = false;
      this.visible.find_id_pw_text = false;
      this.visible.find_pw_text = true;
      this.visible.join_message = false;
      this.error_message = null;
      this.title = 'T_0002';
      this.message = null;
      this.clearSavedId();
      if (this.find_id_result) {
        this.login.user_id = this.find_id_result.user_id;
        this.$nextTick(() => this.$refs.login_password.focus());
      } else {
        this.$nextTick(() => this.$refs.login_id.focus());
      }
    },
    findPassword() {
      this.resetInputs();
      this.visible.find_id_result = false;
      this.visible.login = false;
      this.visible.find_id = false;
      this.visible.find_password = true;
      this.visible.reset_password = false;
      this.visible.find_id_pw_text = false;
      this.visible.find_pw_text = false;
      this.visible.join_message = true;
      this.error_message = null;
      this.title = 'T_0003';
      this.message = null;
      if (this.find_id_result) {
        this.find_password.user_id = this.find_id_result.user_id;
        this.find_password.user_name = this.find_id_result.user_name;
        this.find_password.email_address = this.find_id_result.email_address;
        this.$nextTick(() => this.$refs.find_password_name.focus());
      } else {
        this.$nextTick(() => this.$refs.find_password_id.focus());
      }
    },
    onFindPasswordKeyPress($event) {
      if (this.is_loading) {
        return;
      }
      if ($event.keyCode === 13) {
        if (this.is_send_code) {
          this.onCheckCodeClick();
          return;
        }
        if (util.trim(this.find_password.user_id) === '') {
          this.$nextTick(() => this.$refs.find_password_id.focus());
        } else if (util.trim(this.find_password.email_address) === '') {
          this.$nextTick(() => this.$refs.find_password_email.focus());
        } else if (util.trim(this.find_password.user_name) === '') {
          this.$nextTick(() => this.$refs.find_password_name.focus());
        } else {
          this.onAuthMailSendClick();
        }
      }
    },
    onAuthMailSendClick() {
      if (this.is_loading) {
        return;
      }
      if (util.trim(this.find_password.user_id) === '') {
        this.error_message = this.c_lang.S_0001;
        this.$nextTick(() => this.$refs.find_password_id.focus());
        return;
      }
      if (util.trim(this.find_password.email_address) === '') {
        this.error_message = this.c_lang.S_0004;
        this.$nextTick(() => this.$refs.find_password_email.focus());
        return;
      }
      if (util.trim(this.find_password.user_name) === '') {
        this.error_message = this.c_lang.S_0005;
        this.$nextTick(() => this.$refs.find_password_name.focus());
        return;
      }
      this.is_loading = true;
      this.is_send_code = false;
      this.send_code_result = null;
      this.error_message = null;
      this.stopRemainTimer();
      const params = {
        user_id: this.find_password.user_id,
        user_name: this.find_password.user_name,
        email_address: this.find_password.email_address,
        url_prefix: this.url_prefix,
        request_domain: this.request_domain,
      };
      api_user.sendAuthCode(params)
        .then((result) => {
          if (!result || !result.is_send) {
            this.$log.error(result);
            this.error_message = this.c_lang.S_0006;
            this.is_loading = false;
            return;
          }
          this.error_message = null;
          this.send_code_result = result;
          this.remain_time = this.send_code_result.remain_time;
          this.remain_time_str = util.getTimeStr(this.remain_time);
          this.startRemainTimer();
          this.is_send_code = true;
          this.is_loading = false;
          this.$nextTick(() => this.$refs.find_password_code.focus());
        })
        .catch((error) => {
          this.$log.error(error);
          this.error_message = this.c_lang.S_0006;
          this.is_loading = false;
        });
    },
    startRemainTimer() {
      this.remain_timer_id = setInterval(() => {
        this.remain_time--;
        this.remain_time_str = util.getTimeStr(this.remain_time);
        if (this.remain_time <= 0) {
          this.stopRemainTimer();
          this.remain_time_str = this.c_lang.S_0007;
          this.error_message = this.c_lang.S_0008;
        }
      }, 1000);
    },
    stopRemainTimer() {
      if (this.remain_timer_id) {
        clearInterval(this.remain_timer_id);
      }
    },
    onCheckCodeClick() {
      alert('checker code');
      if (this.remain_time <= 0) {
        this.error_message = this.c_lang.S_0008;
        return;
      }
      if (util.trim(this.find_password.input_code) === '') {
        this.error_message = this.c_lang.S_0009;
        this.$nextTick(() => this.$refs.find_password_code.focus());
        return;
      }
      this.is_loading = true;
      this.send_code_result.send_code = this.find_password.input_code;
      api_user.checkAuthCode(this.send_code_result)
        .then((result) => {
          if (!result || !result.is_verify) {
            this.$log.error(result);
            this.error_message = this.c_lang.S_0010;
            this.is_loading = false;
            return;
          }
          this.stopRemainTimer();
          this.error_message = null;
          this.find_id_result = {
            user_id: this.find_password.user_id,
            user_name: this.find_password.user_name,
            email_address: this.find_password.email_address,
          };
          this.resetPassword();
        })
        .catch((error) => {
          this.$log.error(error);
          this.error_message = this.c_lang.S_0010;
          this.is_loading = false;
        });
    },
    resetPassword() {
      this.clearSavedId();
      this.message = util.replaceByTemplate(this.c_lang.S_0011, { user_name: this.find_password.user_name });
      this.resetInputs();
      this.visible.find_id_result = false;
      this.visible.login = false;
      this.visible.find_id = false;
      this.visible.find_password = false;
      this.visible.reset_password = true;
      this.visible.find_id_pw_text = false;
      this.visible.find_pw_text = false;
      this.visible.join_message = false;
      this.error_message = null;
      this.title = 'T_0004';
      this.$nextTick(() => this.$refs.reset_password.focus());
    },
    onResetPasswordKeyPress($event) {
      if (this.is_loading) {
        return;
      }
      if ($event.keyCode === 13) {
        if (util.trim(this.reset_password.password) === '') {
          this.$nextTick(() => this.$refs.reset_password.focus());
        } else if (util.trim(this.reset_password.password_confirm) === '') {
          this.$nextTick(() => this.$refs.reset_password_confirm.focus());
        } else {
          this.onResetPasswordClick();
        }
      }
    },
    onResetPasswordClick() {
      alert('pass');
      if (util.trim(this.reset_password.password) === '') {
        this.error_message = this.c_lang.S_0012;
        this.$nextTick(() => this.$refs.reset_password.focus());
        return;
      }
      if (util.trim(this.reset_password.password_confirm) === '') {
        this.error_message = this.c_lang.S_0013;
        this.$nextTick(() => this.$refs.reset_password_confirm.focus());
        return;
      }
      if (util.trim(this.reset_password.password) !== util.trim(this.reset_password.password_confirm)) {
        this.error_message = this.c_lang.S_0014;
        this.$nextTick(() => this.$refs.reset_password_confirm.focus());
        return;
      }
      this.is_loading = true;
      this.send_code_result.password = this.reset_password.password;
      this.send_code_result.password_confirm = this.reset_password.password_confirm;
      api_user.resetPassword(this.send_code_result)
        .then((result) => {
          if (!result || !result.is_change) {
            this.$log.error(result);
            this.error_message = this.c_lang.S_0015;
            this.is_loading = false;
            return;
          }
          this.error_message = null;
          this.onResetPasswordComplete();
        })
        .catch((error) => {
          this.$log.error(error);
          this.error_message = this.c_lang.S_0015;
          this.is_loading = false;
        });
    },
    onResetPasswordComplete() {
      this.resetInputs();
      this.visible.find_id_result = false;
      this.visible.login = true;
      this.visible.find_id = false;
      this.visible.find_password = false;
      this.visible.reset_password = false;
      this.visible.find_id_pw_text = false;
      this.visible.find_pw_text = false;
      this.visible.join_message = false;
      this.error_message = null;
      this.title = 'T_0004';
      this.message = this.c_lang.S_0016;
      if (this.find_id_result) {
        this.login.user_id = this.find_id_result.user_id;
        this.$nextTick(() => this.$refs.login_password.focus());
      } else {
        this.$nextTick(() => this.$refs.login_id.focus());
      }
    },
    onJoinClick() {
      this.$router.push({ name: 'Member_Info' });
      this.closePopup();
    },
    routeLogin() {
      if (this.$route.name === 'payment') {
        this.closePopup();
        return;
      }
      this.$router.push({ name: 'list' });
      this.closePopup();
    },
    setSavedId() {
      if (localStorage.getItem('user_id')) {
        this.login.user_id = localStorage.getItem('user_id');
        this.save_id = true;
      } else {
        this.save_id = false;
      }
    },
    clearSavedId() {
      localStorage.removeItem('user_id');
      this.save_id = false;
    },
    openPopup(open_callback = null, close_callback = null) {
      this.setSavedId();
      this.is_open = true;
      if (this.save_id) {
        this.$nextTick(() => this.$refs.login_password.focus());
      } else {
        this.$nextTick(() => this.$refs.login_id.focus());
      }
      if (open_callback) {
        open_callback();
      }
      this.close_callback = close_callback;
    },
    closePopup() {
      this.$emit('onPopupClose');
      this.is_open = false;
      if (this.close_callback) {
        this.close_callback();
      }
      this.$nextTick(this.reset);
    },
    reset() {
      this.stopRemainTimer();
      this.resetInputs();
      this.visible.find_id_result = false;
      this.visible.login = true;
      this.visible.find_id = false;
      this.visible.find_password = false;
      this.visible.find_id_pw_text = true;
      this.visible.find_pw_text = false;
      this.visible.reset_password = false;
      this.visible.join_message = true;
      this.title = 'T_0001';
      this.save_id = false;
      this.remain_time = null;
      this.remain_time_str = null;
      this.find_id_result = null;
      this.send_code_result = null;
      this.close_callback = null;
    },
    resetInputs() {
      this.is_loading = false;
      this.error_message = null;
      this.message = null;
      this.login.user_id = null;
      this.login.password = null;
      this.find_id.user_name = null;
      this.find_id.email_address = null;
      this.find_password.user_id = null;
      this.find_password.user_name = null;
      this.find_password.email_address = null;
      this.find_password.input_code = null;
      this.reset_password.password = null;
      this.reset_password.password_confirm = null;
      this.is_send_code = false;
    },
  },
};
</script>

<style scoped>
.login_popup {
  width: 580px;
  padding-bottom: 50px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
}
.error_message {
  color: #ff0000;
}
.login_popup form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.login_popup .find_result_id {
  font-size: 18px;
  color: #009cdf;
  margin-top: 15px;
}
.login_popup .find_result_email {
  font-size: 13px;
  color: #aaaaaa;
  margin-top: 10px;
  margin-bottom: 10px;
}
.display_text {
  font-size: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}
input::placeholder{
  color:#aaa297;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.5px;
}

.input_title {
  text-align: left;
  width: 100%;
  font-weight: 400;
  font-size: 12px;
  color: #504637;
  letter-spacing: -0.5px;
}
.input_title.m30 {
  margin-top: 30px;
}
.input_title.m20 {
  margin-top: 20px;
}
.input_row {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-basis: 40px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 40px;
  width: 100%;
  margin-top: 10px;
}
.input_row > .right_box {
  display: flex;
  flex-basis: 100px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 100px;
  margin-left: 10px;
}

.login_popup .input_wra {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 40px;
  border-bottom: 1px solid #dddddd;
  padding: 0 10px;
  align-items: center;
  width: 100%;
  font-weight: 400;
  font-size: 12px;
  color:#3d3292;
  letter-spacing: -0.5px
}

.input_row > .right_box > .btn {
  height: 100%;
}
.login_popup .input_wrapper input {
  flex: 1;
  width: 100%;
  font-size: 13px;
  color: #555555;
}
.login_popup .input_wrapper input::placeholder {
  font-size: 14px;
  color: #888;
}
.login_popup .check {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  margin-top: 10px;
}

.check .check_box {
  display: block;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-image: url("/img/jiin/check_off.png");
  background-repeat: no-repeat;
  background-position: center;
}
.check .check_box.on {
  background-image: url("/img/jiin/check_on.png");
}

.login_popup .check .check_wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}
.login_popup .check .check_wrapper .check_text {
  margin-left: 10px;
  color: #333;
  font-size: 14px;
}
.find_wrapper {
  margin-top: 20px;
}
.find_wrapper > span {
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
}
.find_wrapper > span.bar {
  padding: 0 20px;
  border-right: 1px solid #ccc;
}
.find_wrapper > span.inmember {
  margin: 0 20px;
  color : #336a3c;
}
.find_wrapper > span.inmember:hover {
  border-bottom: 1px solid #336a3c;
}

.find_wrapper.text {
  width: 100%;
  text-align: left;
}
.divider {
  width: 100%;
  height: 1px;
  background-color: #dddddd;
  margin: 30px 0;
}
.join_text {
  width: 100%;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 20px;
}
.button_layer {
  display: flex;
  flex-basis: 40px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 20px;
}
.confirm_btn {
  margin-top: 20px;
}
.btn.newgreen.login {
  border-radius: 6px;
  width:480px;
  height: 50px;
  padding-top: 0;
  margin: 0;
  font-weight: 400;
  font-size: 16px ;
  color: #fff;
}

.btn.newgreen.login.mbottom5 {
  margin-bottom: 5px;
}

.login_popup .find_result_email > .user_name {
  color: #555555;
}
</style>

