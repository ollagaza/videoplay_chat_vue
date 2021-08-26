<template>
  <Editor :style="{ width: width, height: height, minHeight: min_height, overflow: c_overflow }"
          ref="editor"
          api-key="no-api-key"
          v-model="editor_desc"
          :id="contentid"
          :init="{
              selector: select_id,
              inline: inline_mode,
              width: width,
              language: language,
              height: height,
              min_height: min_height,
              menubar: menubar,
              resize: resize,
              plugins: plugins,
              toolbar_mode: toolbar_mode,
              toolbar: toolbar,
              file_picker_types: 'image',
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
  import ApiEdit from '../../api/ApiEdit';

  export default {
    name: 'TinyEditorBasicMode',
    props: ['set_select_id', 'set_contentid',
      'set_width', 'set_height', 'set_min_height', 'set_overflow', 'set_resize',
      'set_menubar', 'set_mode', 'set_desc', 'set_toolbar',
      'set_auto_focus', 'set_cursor_end_on_load',
      'callback_focus', 'callback_blur',
    ],
    components: { Editor },
    data() {
      return {
        editor: null,
        select_id: '',
        contentid: '',
        inline_mode: false,
        editor_desc: '',
        width: '100%',
        height: 400,
        min_height: 300,
        overflow: true,
        language: 'ko_KR',
        auto_focus: false,
        menubar: false,
        resize: true,
        toolbar_mode: 'wrap',
        plugins: [
          'advlist autolink lists charmap preview searchreplace image media table wordcount',
        ],
        toolbar: '',
        basic_toolbar: 'searchreplace undo redo | fontsizeselect formatselect | bold italic underline | forecolor backcolor ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media preview ' +
          '| table charmap',
        profile_toolbar: 'undo redo | bold italic underline strikethrough | forecolor backcolor | fontsizeselect formatselect ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media preview ',
        comment_toolbar: 'undo redo | bold italic underline strikethrough | forecolor backcolor | fontsizeselect ' +
          '| alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image preview ',
        is_cursor_end_on_load: false,
      };
    },
    created() {
      if (this.set_select_id !== undefined) {
        this.select_id = this.set_select_id;
      }
      if (this.set_contentid !== undefined) {
        this.contentid = this.set_contentid;
      } else {
        this.$log.debug('CREATE ++++' + this.contentid);
        if (!this.contentid || this.contentid.length < 10) {
          ApiEdit.getContentId()
            .then(({ error, message, contentid }) => {
              if (error === 0) {
                this.contentid = contentid;
              } else {
                this.$log.debug(error, message);
              }
            });
        }
      }
      if (this.set_width !== undefined) {
        this.width = this.set_width;
      }
      if (this.set_height !== undefined) {
        this.height = this.set_height;
      }
      if (this.set_min_height !== undefined) {
        this.min_height = this.set_min_height;
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
      this.$log.debug('this.editor_desc', this.editor_desc);
      if (this.set_auto_focus !== undefined) {
        this.auto_focus = this.set_auto_focus;
      }
      if (this.set_cursor_end_on_load === true) {
        this.is_cursor_end_on_load = true;
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
            toolbar = 'undo redo | fontsizeselect | alignleft aligncenter alignright alignjustify | bold italic underline | forecolor backcolor | bullist numlist outdent indent';
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
      setEdiotrContentId(contentid) {
        this.$log.debug('contentid++++++++++++'+contentid);
        this.contentid = contentid;
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
        this.$log.debug('imageCheck');
        if (!this.editor_desc) {
          return;
        }
        const editor_regex = new RegExp('"\\/apis1\\/s1\\/edit\\/getimg\\/[\\w-]+\\/([\\w_/.]+)"', 'gi');
        const matches = this.editor_desc.match(editor_regex);
        if (matches) {
          const file_names = [];
          matches.forEach((item) => {
            const exec = editor_regex.exec(this.editor_desc);
            file_names.push(exec[1]);
            this.$log.debug(item);
          });
          ApiEdit.checkEditorImages(this.contentid, file_names)
            .then(({ error, message, result }) => {
              this.$log.debug(error, message, result);
            });
        } else {
          this.$log.debug('done done done...');
          this.deleteContentDirectory();
        }
      },
      deleteContentDirectory() {
        ApiEdit.deletecontentdirectory(this.contentid)
          .then(({ error, message, result }) => {
            this.$log.debug(error, message, result);
          });
      },
      onFileDialog(cb, value, meta) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        input.onchange = () => {
          const upload_form_data = new FormData();
          this.$log.debug('++++++++++++++++++' + this.contentid);
          upload_form_data.append('contentid', this.contentid);
          upload_form_data.append('editor', input.files[0]);

          ApiEdit.uploadEditorImage(this.contentid, upload_form_data)
            .then(({ error, message, result, path }) => {
              if (error === 0) {
                this.$log.debug(result, path);
                cb(path, { title: result.filename });
              } else {
                this.$log.debug(message);
                // EventBus.emit('alertPopupOpen', null, message);
              }
            });
        };

        input.click();
      },
    },
  };
</script>

<style>
.tox-statusbar__branding {
  display: none;
}
.tox-tinymce-inline {
  z-index: 500;
}
</style>
