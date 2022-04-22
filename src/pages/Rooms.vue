<template>
  <div class="operation_create">
    <div class="table_info">
      <span class="title">채팅방</span>
      <span class="require_label">*</span>
      <span>이 표시는 필수입력 사항입니다.</span>
    </div>
    <ul class="operation_info" style="background-color: #fff;">
      <li class="info_row">
        <label>
          <div><span>방이름</span><span class="require_label">*</span></div>
        </label>
        <div class="info">
          <div class="input_wrapper">
            <input type="text" :placeholder="this.roomName" v-model="roomName" disabled />
            <button class="md-primary md-raised" @click="leaveRoom()">나가기</button>
          </div>
        </div>
      </li>
      <li class="info_row">
        <label>
          <div style="margin: 5px 5px 5px 5px;"><span>Message</span></div>
        </label>
        <div class="info">
          <div class="input_wrapper">
            <textarea v-model="textarea" disabled v-auto-scroll-bottom></textarea>
          </div>
        </div>
        <div class="info">
          <div class="input_wrapper">
            <textarea v-model="userList" disabled v-auto-scroll-bottom></textarea>
          </div>
        </div>
      </li>
      <li class="info_row">
        <label>
          <div><span>Your Message</span><span class="require_label">*</span></div>
        </label>
        <div class="info">
          <div class="input_wrapper">
            <input type="text" :placeholder="'메시지를 입력하세요.'" v-model="message" />
            <button class="md-primary md-raised" @click="sendMessage()">보내기</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import BaseMixin from '../components/Mixins/BaseMixin';
import util from '../utils/util';
import { mapGetters } from 'vuex';

export default {
  name: 'Rooms',
  mixins: [BaseMixin],
  computed: {
    ...mapGetters(['logged_info', 'is_logged']),
  },
  watch: {
    $route(to, form) {
      console.log(to, from);
      // this.$log.debug(to.path);
      // this.$log.debug(form.path);
      // alert('aaa');
      // if (to.path !== form.path) alert('aaa');
    },
  },
  created() {
    const params = this.$route.params;
    if (params) {
      if (params.room_name) {
        this.$log.debug(params.room_name);
        this.roomName = params.room_name;
      }
    }
    const query = this.$route.query;
    if (query) {
      if (query.userName) {
        this.$log.debug(query.userName);
        this.userName = query.userName;
      }
    }

    this.$socket.on('check room', (data) => {
      this.$log.debug('check room');
      // this.userList = data.user_info.users[data.userName].length;
      this.$log.debug(`check room(status)===${data.status}`);
      if(data.status === -1) {
        this.room_fail();
      } else {
        this.room_success(data.userName);
      }
    }),
    this.$socket.on('getRoomInfo', (data) => {
      this.$log.debug('getRoomInfo');
      this.$log.debug(data);

      // this.$log.debug(data.user_info.users);
      // this.$log.debug(data.user_info.users[data.userName].user_name);
      // this.userList = data.users;
      this.userList = '';
      _.forEach(data.users, (value, key) => {
        if (value) {
          // this.$log.debug(value.user_name);

          this.userList += `${value.user_name}\n`;
        }
      });

      if(data.chat_list) {
        this.textarea = '';
        _.forEach(data.chat_list, (value, key) => {
          if (value) {
            // this.$log.debug(value.user_name);
            if(value.type === 'IN') {
              this.textarea += `${value.comment}\n`;
            } else {
              this.textarea += `[${value.name}] ${value.comment}\n`;
            }
          }
        });
      };
    }),
    this.$socket.on('chat msg', (data) => {
      this.textarea += `[${data.userName}] ${data.message}\n`;
    }),
    this.$socket.on('leave room', (data) => {
      this.textarea += `${data.userName} 님이 퇴장했습니다.\n`;
    }),
    this.init();
  },
  mounted() {
    window.addEventListener('beforeunload', this.unLoadEvent);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.unLoadEvent);
  },
  data() {
    return {
      roomList: '',
      userList: '',
      textarea: '',
      message: '',
      socketId: '',
      userName: '',
      roomName: '',
      clients: 0,
      errMsg: '',
      isLeaveSite: false,
    }
  },
  // 페이지 이동할때 이벤트...
  beforeRouteLeave(to, from, next) {
    this.$log.debug(from);
    if (this.isLeaveSite) next();
    // this.$log.debug(to.path);
    // this.$log.debug(from.path);
    if (confirm('이 페이지에서 벗어날 경우 대화내용이 사라집니다.\n그래도 이동하시겠습니까?')) {
      this.isLeaveSite = true;
      this.$socket.emit('leave room', {
        userName: this.userName,
        room: this.roomName,
        socketId: this.$socket.id
      });
      this.$socket.emit('getRoomInfo', {
        room: this.roomName,
      });

      next();
    } else {
      this.isLeaveSite = false;
      next(false);
    }
  },
  methods: {
    // 새로고침, 브라우저 닫을때 이벤트...
    unLoadEvent: function (event) {
      // if (this.isLeaveSite) return;

      this.$socket.emit('disconnect', {
        userName: this.userName,
      });
      event.preventDefault();
      event.returnValue = '';
      this.leaveRoom();
      // this.beforeRouteLeave();
    },

    init() {
      this.$log.debug(`userId===${this.logged_info.user_id}`);

      this.$socket.emit('check room', {
        room: this.roomName,
        userId: this.logged_info.user_id,
        userName: this.userName,
      });
      // this.joinRoom();
    },
    room_fail() {
      this.onError('존재하지 않는 방정보입니다.');
      // history.go(-1);
      return;
    },
    room_success(nm) {
      this.$log.debug('room_success');
      this.$socket.emit('getRoomInfo', {
        room: this.roomName,
      });

      this.textarea += `${nm} 님이 입장했습니다.\n`;
    },
    sendMessage() {
      if (this.message === '') {
        this.errMsg = '메세지를 입력해 주세요.';
        this.onError(this.errMsg);
        return;
      }
      this.$socket.emit('chat msg', {
        message: this.message,
        userName: this.userName,
        room: this.roomName,
        socketId: this.$socket.id
      })
      // this.textarea += `[${this.$socket.id}]${this.message}[${this.room}]\n`;
      this.message = '';
      this.socketId = this.$socket.id;
      // this.$refs.msg.focus();
    },
    leaveRoom() {
      this.$log.debug('leaveRoom');
      this.$router.push({ name: 'chat' });
    },
  },
}
</script>
<style>
.md-app {
  height: 800px;
  border: 1px solid rgba(#000, .12);
}
textarea {
  width: 100%;
  height: 300px;
}

.operation_create {
  position: relative;
  margin-top: 30px;
}
.operation_create .require_label {
  font-size: 15px;
  line-height: 1;
}

.operation_create .table_info {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  font-size: 13px;
  color: #888888;
  font-weight: 400;
}
.operation_create .table_info .title {
  color: #555555;
  font-size: 18px;
  font-weight: 400;
  padding-right: 20px;
}
.operation_create .operation_info {
  margin: 10px 0 0 0;
  border: 1px solid #dddddd;
  border-radius: 10px;
  padding: 20px 30px;
}
.operation_create .operation_info .info_row {
  border-bottom: none;
  padding: 10px 0;
}
.operation_create .operation_info .info_row > label {
  background-color: transparent;
  font-weight: 400;
  font-size: 15px;
  color: #555555;
  justify-content: flex-start;
  flex: 0 0 130px;
  width: 130px;
}
.operation_create .operation_info .info_row > label > div {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.operation_create .operation_info .info_row > label > div .require_label {
  padding-left: 5px;
}
.operation_create .operation_info .info_row .info {
  padding: 0;
}
.operation_create .operation_info .info_row .info .label {
  flex-shrink: 0;
}
.operation_create .operation_info .info_row .input_wrapper {
  min-height: 36px;
  padding: 0 10px;
}
.operation_create .operation_info .info_row .upload_info {
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  font-size: 13px;
}
.operation_create .thumbnail_wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #aaaaaa;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 300;
}
.operation_create .thumbnail_wrapper .thumbnail_image_box {
  width: 160px;
  height: 90px;
  border-radius: 4px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  background-image: url("/img/renewal/common/add_icon.png");
  background-repeat: no-repeat;
  background-position: center center;
  cursor: pointer;
  overflow: hidden;
  margin-right: 10px;
}
.operation_create .thumbnail_wrapper .thumbnail_image_box > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.operation_create .folder_selector_wrapper {
  border: 1px solid #dddddd;
  border-radius: 6px;
  width: 100%;
  min-height: 140px;
}
.operation_create .upload_progress_info > .file_info {
  text-align: right;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg {
  position: relative;
  height: 4px;
  width: 40px;
  background-color: #dddddd;
  opacity: 0;
  margin: 0 10px;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg.on {
  opacity: 1;
}
.operation_create .upload_progress_info > .upload_progress_percent_bar_bg > .upload_progress_percent_bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background-color: #2e6bb8;
}
.operation_create .upload_progress_info {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
}
.operation_create .upload_progress_info > .upload_progress_percent_text {
  color: #2e6bb8;
  opacity: 0;
  text-align: right;
}
.operation_create .upload_progress_info > .upload_progress_percent_text.on {
  opacity: 1;
}
.operation_create .desc_text {
  font-weight: 400;
  font-size: 12px;
  color: #888888;
}
.operation_create .file_upload_wrapper {
  flex: 0 0 140px;
  width: 100%;
  height: 140px;
  overflow: hidden;
}
.operation_create .divider {
  width: 100%;
  height: 1px;
  background-color: #dddddd;
  list-style: none;
  margin: 10px 0;
  padding: 0;
}
.operation_create .radio {
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  margin-right: 10px;
}
.operation_create .radio .radio_text {
  margin-left: 6px;
}
.operation_create .tag_wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex: 1;
  height: 30px;
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0 10px;
  overflow: hidden;
}
.operation_create .tag_wrapper.disable {
  background-color: #f5f5f5;
  justify-content: center;
}
.operation_create .tag_wrapper .tag {
  flex: 1;
  font-size: 13px;
  font-weight: 400;
  color: #555555;
  padding-right: 10px;
}
.operation_create .tag_wrapper.disable .tag {
  color: #aaaaaa;
  padding-right: 0;
  text-align: center;
}
.operation_create .space {
  flex: 0 0 10px;
  width: 10px;
}
</style>

