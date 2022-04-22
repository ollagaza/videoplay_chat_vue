<template>
  <div class="popup_dim" v-bind:class="{ inner_popup: inner_popup }" v-if="is_open" v-on:mousedown="onBackgroundClick">
    <div class="popup folder_popup" v-on:mousedown.stop="() => false">
      <div class="popup_contents">
        <div class="popup_title_top">
          <div class="popup_title">
            <img src="/img/renewal/drive/folder_layer_icon.png" alt="폴더 이름 변경">
            <span>{{ getLang('폴더 이름 변경') }}</span>
          </div>
          <span class="delete_btn" v-on:click.stop="onBackgroundClick"></span>
        </div>
        <div class="popup_contents">
          <div class="popup_input_row">
            <label>{{ getLang('폴더 이름') }}</label>
            <div class="input_wrapper"><input type="text" v-model="folder_name" ref="folder_name" :placeholder="getLang('폴더 이름을 지정해 주세요.')" spellcheck="true" v-on:keyup="onKeyUp"></div>
          </div>
        </div>
      </div>
      <div class="popup_buttons">
        <template v-if="!is_confirm_click || is_complete">
          <div class="btn blue w100" v-on:click="onConfirm" v-if="!is_complete"><span>{{ getLang('변경하기') }}</span></div>
          <div class="btn w100" v-on:click="onCancel"><span>{{ getLang('취소') }}</span></div>
        </template>
        <template v-else>
          <div class="lds-facebook"><div></div><div></div><div></div></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import api_folder from '../../api/ApiFolder';
  import BaseMixin from '../../../components/Mixins/BaseMixin';
  import ChangeLang from './OperationFolderRenamePopup.vue.lang';

  export default {
    name: 'OperationFolderCreatePopup',
    mixins: [BaseMixin],
    data() {
      return {
        is_open: false,
        is_confirm_click: false,
        is_complete: false,
        folder_info: null,
        folder_name: null,
        inner_popup: false,
      };
    },
    created() {
      this.lang_map = ChangeLang;
    },
    methods: {
      onKeyUp($event) {
        if ($event.keyCode === 13) {
          this.onConfirm();
        }
      },
      openPopup(folder_info) {
        this.folder_info = folder_info;
        this.folder_name = folder_info.folder_name;
        this.is_open = true;
      },
      onBackgroundClick() {
        this.closePopup();
      },
      onCancel() {
        this.closePopup();
      },
      onConfirm() {
        const folder_name = _.trim(this.folder_name);
        if (!folder_name) {
          alert(this.getLang('폴더이름을 정확하게 입력하세요.'));
          this.$refs.folder_name.focus();
          return;
        }
        api_folder.renameFolder(this.folder_info.seq, folder_name)
          .then((result) => {
            if (result.error) {
              this.onError(result, result.message);
              return;
            }
            this.$emit('onFolderRename', result.folder_info, this.parent_folder_info);
            this.closePopup();
          })
          .catch((error) => {
            this.onError(error, '폴더를 생성할 수 없습니다. 잠시후에 다시 시도해 주세요.');
          });
      },
      onError(error, message) {
        this.$log.error(error);
        alert(message);
      },
      closePopup() {
        this.is_open = false;
        this.parent_folder_info = null;
        this.folder_name = null;
        this.is_complete = false;
        this.is_confirm_click = false;
      },
    },
  };
</script>

<style scoped>

</style>
