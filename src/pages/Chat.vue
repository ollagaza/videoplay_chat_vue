<template>
  <div class="operation_create">
    <div class="table_info">
      <span class="title">채팅</span>
      <span class="require_label">*</span>
      <span>이 표시는 필수입력 사항입니다.</span>
    </div>
    <ul class="operation_info" style="background-color: #fff;">
      <li class="info_row">
        <label>
          <div><span>이름</span><span class="require_label">*</span></div>
        </label>
        <div class="info">
          <div class="input_wrapper">
            <input type="hidden" v-model="userId" />
            <input type="text" :placeholder="'이름을 입력하세요.'" maxlength="20" v-model="userName" />
          </div>
        </div>
      </li>
      <li class="info_row">
        <label>
          <div><span>방이름</span><span class="require_label">*</span></div>
        </label>
        <div class="info">
          <div class="input_wrapper">
            <input type="text" :placeholder="'방이름을 입력하세요.'" maxlength="100" v-model="roomName" @keyup="enabledJoin()" />
            <button class="md-primary md-raised" :disabled="is_join" @click="joinRoom()">방생성</button>
<!--            <button class="md-primary md-raised" :disabled="!is_join" @click="leaveRoom()">나가기{{ clients }}</button>-->
          </div>
        </div>
      </li>
      <li class="info_row">
        <label>
          <div><span>Room List</span></div>
        </label>
        <div class="info">
          <select v-model="selRoom" multiple="multiple" @dblclick="goRoom()">
            <option style="padding: 5px 0 5px 10px;" v-for="room in roomList" v-bind:value="room.room_name">- {{ room.room_name }}({{room.userCount}})</option>
          </select>
        </div>

      </li>
<!--      <li class="info_row">-->
<!--        <label>-->
<!--          <div style="margin: 5px 5px 5px 5px;"><span>{{ 'Message' }}</span></div>-->
<!--        </label>-->
<!--        <div class="info">-->
<!--          <div class="input_wrapper">-->
<!--            <textarea v-model="textarea" disabled v-auto-scroll-bottom></textarea>-->
<!--          </div>-->
<!--        </div>-->
<!--      </li>-->
<!--      <li class="info_row">-->
<!--        <label>-->
<!--          <div><span>{{ 'Your Message' }}</span><span class="require_label">*</span></div>-->
<!--        </label>-->
<!--        <div class="info">-->
<!--          <div class="input_wrapper">-->
<!--            <input type="text" :placeholder="'메시지를 입력하세요.'" v-model="message" />-->
<!--            <button class="md-primary md-raised" @click="sendMessage()">보내기</button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </li>-->
    </ul>
  </div>
</template>
<script>
import BaseMixin from '../components/Mixins/BaseMixin';
import { mapGetters } from 'vuex';

export default {
  name: 'Chat',
  mixins: [BaseMixin],
  computed: {
    ...mapGetters(['logged_info', 'is_logged']),
  },
  created() {
    this.$socket.on('room list', (data) => {
      this.roomList = data.roomList;
      this.$log.debug(this.roomList);
      data.roomList.forEach((_, key) => {
        // this.$log.debug(key);
        // this.roomList += `${data.roomList[key]}\n`;
      })
    }),
    // this.$socket.on('chat msg', (data) => {
    //   this.textarea += `[${data.userName}] ${data.message}[${data.room}]\n`;
    // }),
    this.$socket.on('join room', (data) => {
      // this.$log.debug('1111111111111111');
      // this.$log.debug(data.status);
      if(data.status === 0) { // 성공
        this.join_success(data.room);
      } else {
        this.join_fail();
      }
      this.clients = data.clients;
    }),
    this.$socket.on('getRoomInfo', (data) => {
      this.$log.debug('getRoomInfo');
      this.$log.debug(data);

      // this.userList = data.users;
      this.roomList = data;
      _.forEach(data, (value, key) => {
        if (value) {
          // this.$log.debug(value.user_name);
          // this.roomList += `${value}\n`;
        }
      });
    }),
    // this.$socket.on('leave room', (data) => {
    //   this.textarea += `${data.userName} 님이 퇴장했습니다.\n`;
    // }),
    this.init();
  },
  data() {
    return {
      roomList: '',
      selRoom: [0],
      // textarea: '',
      message: '',
      socketId: '',
      userId: '',
      userName: '',
      roomName: '',
      is_join: false,
      clients: 0,
      errMsg: '',
    }
  },
  methods: {
    init() {
      this.userId = this.logged_info.user_id;
      this.userName = this.logged_info.user_name;
      // this.$socket.emit('room list', {
      //   message: this.message,
      //   userId: this.userId,
      //   userName: this.userName,
      //   room: this.roomName,
      //   socketId: this.$socket.id
      // });

      this.$socket.emit('getRoomInfo', {
        room: '',
      });
    },
    goRoom() {
      if (this.userName === '') {
        this.errMsg = '이름을 입력해 주세요.';
        this.onError(this.errMsg);
        return;
      }

      if (this.selRoom[0] === undefined) return;
      // this.$log.debug(this.selRoom);
      // return;
      const query = {};
      const params = {};
      query.userId = this.userId;
      query.userName = this.userName;
      params.room_name = this.selRoom[0];

      this.$log.debug(`room_name===${this.selRoom}`);
      // this.$log.debug(params);
      // return;

      this.$socket.emit('join room', {
        userId: this.userId,
        userName: this.userName,
        room: this.selRoom[0],
        socketId: this.$socket.id
      });

      // this.$router.push({ name: 'rooms', query, params }).catch(() => {});
    },
    sendMessage() {

      if (!this.is_join) {
        this.errMsg = '먼저 방에 입장해주세요.';
        this.onError(this.errMsg);
        return;
      }

      if (this.message === '') {
        this.errMsg = '메세지를 입력해 주세요.';
        this.onError(this.errMsg);
        return;
      }
      this.$socket.emit('chat msg', {
        message: this.message,
        userId: this.userId,
        userName: this.userName,
        room: this.roomName,
        socketId: this.$socket.id
      });
      // this.textarea += `[${this.$socket.id}]${this.message}[${this.room}]\n`;
      this.message = '';
      this.socketId = this.$socket.id;
      // this.$refs.msg.focus();
    },
    enabledJoin() {
      this.is_join = false;
    },
    joinRoom() {
      if (this.userName === '') {
        this.errMsg = '이름을 입력해 주세요.';
        this.onError(this.errMsg);
        return;
      }
      if (this.roomName === '') {
        this.errMsg = '방이름을 입력해 주세요.';
        this.onError(this.errMsg);
        return;
      }

      this.$socket.emit('join room', {
        userId: this.userId,
        userName: this.userName,
        room: this.roomName,
        socketId: this.$socket.id
      });
    },
    join_success(roomName) {
      this.$log.debug('join room');
      // this.$socket.emit('room list', {
      //   userId: this.userId,
      //   userName: this.userName,
      //   room: roomName,
      //   socketId: this.$socket.id
      // })
      this.$socket.emit('getRoomInfo', {
        room: '',
      });

      this.is_join = true;
      this.$log.debug(this.is_join);
      this.socketId = this.$socket.id;

      const query = {};
      const params = {};
      query.userId = this.userId;
      query.userName = this.userName;
      params.room_name = roomName;
      this.$router.push({ name: 'rooms', query, params }).catch(() => {});
    },
    join_fail() {
      this.errMsg = '이미 존재하는 방입니다.';
      this.onError(this.errMsg);
      return;
    },
  },

}
</script>
<style>
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

