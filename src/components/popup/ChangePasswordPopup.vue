<template>
  <div class="popup_dim" v-bind:class="{ hide: !is_open }">
    <div class="popup login_popup">
      <div class="popup_title_top">
        <span>비밀번호 변경</span>
        <span class="delete_btn" v-on:click.stop="closePopup"></span>
      </div>
      <div class="popup_contents">
        <form>
          <div class="message" v-if="message" v-html="message"></div>
          <div class="error_message">{{ error_message }}</div>
          <template v-if="!is_change_complete">
            <template v-if="!is_admin_modify">
              <div class="member_label" style="align-self: start; color:#2A6533; font-weight: 600;">현재 비밀번호를 입력해 주세요.</div>
              <div class="input_row">
                <div class="member_input" style="border-bottom: 1px solid #ccc; width: 100%"><input type="password" v-model="change_password.old_password"
                                                  ref="old_password" v-on:keypress="onChangePasswordKeyPress"
                                                  placeholder="비밀번호" spellcheck="false"></div>
              </div>
            </template>
            <div class="member_label"  style="align-self: start; color:#2A6533; font-weight: 600;" :class="{ top_margin: !is_admin_modify }">새로운 비밀번호를 입력해 주세요.</div>
            <div class="input_row">
              <div class="member_input" style="border-bottom: 1px solid #ccc; width: 100%"><input type="password" v-model="change_password.password" ref="change_password"
                                                v-on:keypress="onChangePasswordKeyPress" placeholder="새 비밀번호"
                                                spellcheck="false"></div>
            </div>
            <div class="input_row">
              <div class="member_input" style="border-bottom: 1px solid #ccc; width: 100%"><input type="password" v-model="change_password.password_confirm"
                                                ref="change_password_confirm" v-on:keypress="onChangePasswordKeyPress"
                                                placeholder="비밀번호 확인" spellcheck="false"></div>
            </div>
            <div v-show="!c_is_verify_password_confirm" style="color: red;">비밀번호는 영문, 숫자 및 특수문자를 모두 포함하여 8자 이상 16자 이하로
              설정해 주세요.
            </div>
            <div class="password_guide">
              <div>
                <span class="verify_icon" v-bind:class="{ done: c_is_verify_password_english }"></span>
                <span class="verify_text">영문</span>
              </div>
              <div>
                <span class="verify_icon" v-bind:class="{ done: c_is_verify_password_number }"></span>
                <span class="verify_text">숫자</span>
              </div>
              <div>
                <span class="verify_icon" v-bind:class="{ done: c_is_verify_password_special_char }"></span>
                <span class="verify_text">특수문자</span>
              </div>
              <div>
                <span class="verify_icon" v-bind:class="{ done: c_is_verify_password_length }"></span>
                <span class="verify_text">8자 이상 16자 이하</span>
              </div>
              <div>
                <span class="verify_icon" v-bind:class="{ done: c_is_verify_password_confirm }"></span>
                <span class="verify_text red" v-bind:class="{ done: c_is_verify_password_confirm }">비밀번호 일치</span>
              </div>
            </div>
            <div class="button_layer">
              <template v-if="is_loading">
                <div class="lds-facebook">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </template>
              <template v-else>
                <div class="btn newgreen w100p h40 f15" v-on:click="onChangePasswordClick"><span>확인</span></div>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="complete_text">비밀번호 변경이 완료되었습니다.</div>
            <div class="button_layer">
              <div class="btn newgreen w100p h40 f15" v-on:click="closePopup"><span>확인</span></div>
            </div>
          </template>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import util from '../../utils/util';
import api_user from '../../api/ApiUser';
import _ from 'lodash';

export default {
  name: 'ChangePasswordPopup',
  props: ['is_admin_modify'],
  components: {},
  data() {
    return {
      is_open: false,
      error_message: null,
      message: null,
      change_password: {
        old_password: null,
        password: null,
        password_confirm: null,
      },
      is_loading: false,
      is_change_complete: false,
      member_seq: -1,
    };
  },
  created() {
  },
  computed: {
    ...mapGetters(['logged_info']),
    c_is_complexity_password() {
      return _.trim(this.change_password.password) !== '' ? util.checkPasswordComplexity(this.change_password.password) : false;
    },
    c_is_verify_password() {
      return _.trim(this.change_password.password) !== '' && this.c_is_complexity_password;
    },
    c_is_verify_password_english() {
      const regexp = /[a-zA-Z]/;
      return this.change_password.password !== null ? regexp.test(this.change_password.password) : false;
    },
    c_is_verify_password_number() {
      const regexp = /[0-9]/;
      return this.change_password.password !== null ? regexp.test(this.change_password.password) : false;
    },
    c_is_verify_password_special_char() {
      const regexp = /[!@#$%^&*\-_=+~/\\|]/;
      return this.change_password.password !== null ? regexp.test(this.change_password.password) : false;
    },
    c_is_verify_password_length() {
      return this.change_password.password !== null && (this.change_password.password.length >= 8 && this.change_password.password.length <= 16);
    },
    c_is_verify_password_confirm() {
      return !(!this.c_is_verify_password || this.change_password.password !== this.change_password.password_confirm) && this.c_is_complexity_password;
    },
    c_is_verify_password_all_check() {
      return this.c_is_verify_password_confirm && this.c_is_verify_password_english && this.c_is_verify_password_number && this.c_is_verify_password_special_char && this.c_is_verify_password_length;
    },
  },
  watch: {},
  mounted() {
    this.addKeyboardEvent();
  },
  beforeDestroy() {
    this.removeKeyboardEvent();
  },
  methods: {
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
    onChangePasswordKeyPress($event) {
      if (this.is_loading) {
        return;
      }
      if ($event.keyCode === 13) {
        if (util.trim(this.change_password.old_password) === '') {
          this.$nextTick(() => this.$refs.old_password.focus());
        } else if (util.trim(this.change_password.password) === '') {
          this.$nextTick(() => this.$refs.change_password.focus());
        } else if (util.trim(this.change_password.password_confirm) === '') {
          this.$nextTick(() => this.$refs.change_password_confirm.focus());
        } else {
          this.onChangePasswordClick();
        }
      }
    },
    onChangePasswordClick() {
      const params = {};
      if (util.trim(this.change_password.old_password) === '' && !this.is_admin_modify) {
        this.error_message = '현재 비밀번호를 정확하게 입력하세요.';
        this.change_password.old_password = '';
        this.$nextTick(() => this.$refs.old_password.focus());
        return;
      }
      params.old_password = this.change_password.old_password;

      if (util.trim(this.change_password.password) === '') {
        this.error_message = '새 비밀번호를 정확하게 입력하세요.';
        this.change_password.password = '';
        this.$nextTick(() => this.$refs.change_password.focus());
        return;
      }

      if (!this.c_is_verify_password_all_check) {
        this.error_message = '바밀번호 조건에 맞게 작성해주세요';
        return;
      }

      params.password = this.change_password.password;
      params.password_confirm = this.change_password.password_confirm;
      params.is_admin_modify = this.is_admin_modify;

      this.is_loading = true;
      api_user.changePassword(this.member_seq, params)
        .then((result) => {
          if (!result || !result.is_change) {
            this.$log.error(result);
            this.error_message = '비밀번호를 변경할 수 없습니다.';
            this.is_loading = false;
            return;
          }
          this.error_message = null;
          this.onChangePasswordComplete();
        })
        .catch((error) => {
          this.$log.error(error);
          this.error_message = '비밀번호를 변경할 수 없습니다.';
          this.is_loading = false;
        });
    },
    onChangePasswordComplete() {
      this.is_change_complete = true;
      this.reset();
    },
    openPopup(seq) {
      this.is_open = true;
      if (this.is_admin_modify) {
        this.member_seq = seq;
        this.$nextTick(() => this.$refs.change_password.focus());
      } else {
        this.member_seq = this.logged_info.seq;
        this.$nextTick(() => this.$refs.old_password.focus());
      }
    },
    closePopup() {
      this.is_open = false;
      this.$emit('onPopupClose');
      this.$nextTick(this.reset);
      this.is_change_complete = false;
    },
    reset() {
      this.is_loading = false;
      this.error_message = null;
      this.message = null;
      this.change_password.old_password = null;
      this.change_password.password = null;
      this.change_password.password_confirm = null;
    },
  },
};
</script>

<style scoped>
.login_popup {
  width: 400px;
  padding-bottom: 50px;
}

.error_message {
  height: 15px;
  color: #ff0000;
}

.login_popup form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.info_text {
  font-size: 13px;
  color: #555555;
}

.complete_text {
  font-size: 15px;
  color: #555555;
}

.info_text.top_margin {
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

.login_popup .input_wrapper {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 40px;
  border: 1px solid #dddddd;
  border-radius: 5px;
  padding: 0 10px;
  align-items: center;
  background-color: #f5f5f5;
  width: 100%;
}

.login_popup .input_wrapper input {
  flex: 1;
  width: 100%;
  font-size: 13px;
  color: #555555;
}

.login_popup .input_wrapper input::placeholder {
  font-size: 12px;
  color: #aaaaaa;
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

.password_guide {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  justify-content: center;
  margin-top: 20px;
}

.password_guide > div {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
</style>
