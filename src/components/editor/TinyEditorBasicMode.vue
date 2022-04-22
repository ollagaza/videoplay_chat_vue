<template>
  <Editor :style="{ width: width, height: height, minHeight: min_height, overflow: c_overflow }"
          ref="editor"
          api-key="e1c6qhigezz8ur21c70fkxu3eohsm7m9u5ghdy82fpfuidxs"
          v-model="editor_desc"
          :id="contentid"
          :init="{
              selector: select_id,
              inline: inline_mode,
              width: width,
              language: c_language,
              height: height,
              min_height: min_height,
              menubar: menubar,
              resize: resize,
              plugins: plugins,
              toolbar_mode: toolbar_mode,
              toolbar: toolbar,
              file_picker_types: file_picker_types,
              file_picker_callback: onFileDialog,
              relative_urls: false,
              media_alt_source: false,
              media_dimensions: false,
              media_poster: false,
              fontsize_formats: '11px 12px 13px 14px 15px 16px 18px 24px 36px 48px',
              fullpage_default_font_size: '15px',
              auto_focus: auto_focus,
              content_css : '/css/tinymcs.css',
              setup: onSetup
            }"
          @onFocus="onFocus"
          @onBlur="onBlur"
  />
</template>

<script>
  import Editor from '@tinymce/tinymce-vue';
  import ApiCommon from '../../api/ApiCommon';
  import ApiEtc from '../../api/ApiEtc';
  import BaseMixin from '../Mixins/BaseMixin';
  import { mapGetters } from 'vuex';
  // import EventBus from '../../utils/eventbus';

  export default {
    name: 'TinyEditorBasicMode',
    props: ['set_select_id', 'set_contentid',
      'set_width', 'set_height', 'set_min_height', 'set_overflow', 'set_resize',
      'set_menubar', 'set_mode', 'set_desc', 'set_toolbar',
      'set_auto_focus', 'set_cursor_end_on_load', 'set_file_picker_types',
      'callback_focus', 'callback_blur',
    ],
    mixins: [BaseMixin],
    components: { Editor },
    data() {
      return {
        editor: null,
        select_id: '',
        contentid: '',
        inline_mode: false,
        editor_desc: '',
        width: '100%',
        height: 250,
        min_height: 200,
        overflow: true,
        language: 'ko_KR',
        auto_focus: false,
        menubar: false,
        resize: true,
        toolbar_mode: 'wrap',
        plugins: [
          'advlist autolink lists charmap preview searchreplace image media table wordcount link',
        ],
        toolbar: '',
        inline_toolbar: 'undo redo | fontsizeselect | alignleft aligncenter alignright alignjustify | bold italic underline | image | forecolor backcolor | bullist numlist outdent indent',
        basic_toolbar: 'searchreplace undo redo | fontsizeselect formatselect | bold italic underline | forecolor backcolor ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media | preview ' +
          '| table charmap',
        profile_toolbar: 'undo redo | bold italic underline strikethrough | forecolor backcolor | fontsizeselect formatselect ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media | preview ',
        comment_toolbar: 'undo redo | bold italic underline strikethrough | forecolor backcolor | fontsizeselect ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link | preview ',
        is_cursor_end_on_load: false,
        file_picker_types: 'image',
      };
    },
    created() {
      if (this.set_select_id !== undefined) {
        this.select_id = this.set_select_id;
      }
      if (this.set_contentid !== undefined) {
        this.contentid = this.set_contentid;
      } else {
        ApiCommon.getContentId()
          .then((result) => {
            if (result.error === 0) {
              this.contentid = result.contentid;
            }
          });
      }
      if (this.set_width !== undefined) {
        this.width = this.set_width;
      }
      if (this.set_height !== undefined) {
        this.height = this.set_height;
      }
      if (this.set_min_height !== undefined) {
        this.min_height = parseInt(this.set_min_height, 10);
      }
      if (this.set_overflow !== undefined) {
        this.overflow = this.set_overflow;
      }
      if (this.set_menubar !== undefined) {
        this.menubar = this.set_menubar;
      }
      if (this.set_resize !== undefined) {
        this.resize = this.set_resize;
      }
      if (this.set_desc !== undefined) {
        this.editor_desc = this.set_desc;
      }
      if (this.set_auto_focus !== undefined) {
        this.auto_focus = this.set_auto_focus;
      }
      if (this.set_cursor_end_on_load === true) {
        this.is_cursor_end_on_load = true;
      }
      if (this.set_file_picker_types) {
        this.file_picker_types = this.set_file_picker_types;
      }
      this.toolbar = this.getToolbar(this.set_toolbar ? this.set_toolbar : this.set_mode);
      switch (this.set_mode) {
        case 'inline':
          this.inline_mode = true;
          break;
        case 'profile':
          this.inline_mode = false;
          break;
        case 'basic':
        default:
          break;
      }
    },
    computed: {
      ...mapGetters(['lang']),
      c_language() {
        this.language = 'en_US';
        if (this.lang === 'kor') {
          this.language = 'ko_KR';
        }
        this.language = null;
        return this.language;
      },
      c_overflow() {
        return this.overflow ? 'scroll' : 'hidden';
      },
    },
    methods: {
      onSetup(editor) {
        this.editor = editor;
        editor.on('init', this.onEditorInitComplete);
      },
      onEditorInitComplete(args) {
      },
      getToolbar(type) {
        let toolbar = null;
        switch (type) {
          case 'inline':
            toolbar = this.inline_toolbar;
            break;
          case 'profile':
            toolbar = this.profile_toolbar;
            break;
          case 'comment':
            toolbar = this.comment_toolbar;
            break;
          case 'basic':
          default:
            toolbar = this.basic_toolbar;
            break;
        }
        return toolbar;
      },
      setFocus() {
        this.editor.execCommand(this.contentid, true, 'focus');
      },
      onFocus(event, editor) {
        if (this.callback_focus !== undefined) {
          this.callback_focus(event, editor);
        }
        if (this.is_cursor_end_on_load) {
          this.editor.execCommand('SelectAll');
          this.editor.selection.collapse(false);
        }
        this.is_cursor_end_on_load = false;
      },
      onBlur(event, editor) {
        if (this.callback_blur !== undefined) {
          this.callback_blur(event, editor);
        }
      },
      getEditorContentId() {
        return this.contentid;
      },
      getEditorContent() {
        this.imageCheck();
        let editor_desc_text = null;
        if (this.editor && this.editor.getContent) {
          editor_desc_text = this.editor.getContent({ format: 'text' });
        }
        const return_data = {
          contentid: this.contentid,
          editor_desc: this.editor_desc,
          editor_desc_text,
        };
        return return_data;
      },
      setEditorContent(value) {
        this.editor_desc = value;
      },
      imageCheck() {
        if (!this.editor_desc) {
          return;
        }
        const editor_regex = new RegExp('"\\/static\\/storage\\/editor\\/[\\w-]+\\/([\\w_/.]+)"', 'gi');
        const matches = this.editor_desc.match(editor_regex);
        if (matches) {
          const file_names = [];
          matches.forEach((item) => {
            const exec = editor_regex.exec(this.editor_desc);
            file_names.push(exec[1]);
          });

          ApiEtc.checkEditorImages(this.contentid, file_names)
            .then(({ error, message, result }) => {
              this.$log.debug(error, message, result);
            });
        }
      },
      deleteContentDirectory() {
        ApiEtc.deletecontentdirectory(this.contentid)
        .then(({ error, message, result }) => {
          this.$log.debug(error, message, result);
        });
      },
      onFileDialog(callback, value, meta) {
        const is_image = meta.filetype === 'image';
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (is_image) {
          input.setAttribute('accept', 'image/*');
        }

        input.onchange = () => {
          const file = input.files[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            this.onError('용량이 10MB이하인 파일만 업로드 가능합니다.');
            return;
          }
          const upload_form_data = new FormData();
          upload_form_data.append('contentid', this.contentid);
          upload_form_data.append('editor', file);
          if (!is_image) {
            upload_form_data.append('use_origin_name', 'y');
          }
          const api = is_image ? ApiEtc.uploadEditorImage : ApiEtc.uploadEditorFile;
          api(this.contentid, upload_form_data)
          .then((result) => {
            this.$log.debug(result);
            if (!result.error) {
              const data = {};
              if (is_image) {
                data.alt = result.result.filename;
              } else {
                data.text = result.result.filename;
              }
              callback(result.path, data);
            } else {
              this.onError('파일을 업로드 할 수 없습니다.<br>잠시후에 다시 시도해 주세요.', result, 'onFileDialog');
            }
          });
        };

        input.click();
      },
    },
  };
</script>

<style scoped>

</style>

<style>
  .tox-statusbar__branding {
    display: none;
  }
  .tox-tinymce-inline {
    z-index: 500;
  }
</style>
