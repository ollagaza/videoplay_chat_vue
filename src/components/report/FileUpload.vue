<template>
  <div style="width: 450px;">
    <div class="input_box">
      <div>
        <div class="filebox bs3-primary">
          <input class="upload-name" ref="imgfilename" id="imgfilename" value="" disabled="disabled" v-model="imgfilename" >
          <label for="ex_filename1">이미지선택</label>
          <input type="file" id="ex_filename1" ref="imgdata" class="upload-hidden" v-on:change="img_change" accept="image/*">
        </div>
<!--        <template v-if="c_img_isdata === true">-->
<!--          <div v-on:click="imgDel" style="cursor: pointer;">-->
<!--            {{this.ck_seq}}올린 이미지 삭제-->
<!--          </div>-->
<!--        </template>-->
      </div>
    </div>
    <div ref="upload_drop" style="position: relative; width: 450px; height:400px;border: 1px solid #bfb6a9; margin-top: 10px;text-align: center;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <img src="/img/jiin/leaf_icon.png" ref="imgref" style="max-width: 400px;max-height: 350px;">
      </div>
      <div class="imgtext"  v-bind:class="{hide: isHide}" >
        이미지를 마우스로 끌어놓으세요.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileUPload',
  components: { },
  props: [],
  created() {
  },
  data() {
    return {
      imgfilename: '',
      isHide: false,
    };
  },
  mounted() {
    this.dragAndDropCapable = this.determineDragAndDropCapable();
    this.$log.debug('dragAndDropCapable', this.dragAndDropCapable);
    if (this.dragAndDropCapable) {
      this.setEventListener();
    }
  },
  computed: {
  },
  methods: {
    resetm() {
      this.clearInputFile('ex_filename1');
      this.onFileChange('');
    },
    img_change() {
      this.imgfile = this.$refs.imgdata.files;
      if (this.imgfile && this.imgfile !== 'undefined') {
        this.imgfilename = this.imgfile[0].name;
        this.onFileChange(this.imgfile);
      } else {
        this.imgfilename = '';
      }
    },
    determineDragAndDropCapable() {
      const div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window && 'FileReader' in window;
    },
    setEventListener() {
      ['dragover', 'dragenter'].forEach((event_name) => {
        this.$refs.upload_drop.addEventListener(event_name, this.preventDragEvent, false);
      });
      this.$refs.upload_drop.addEventListener('drop', this.onFileDrop);
    },
    removeEventListener() {
      ['dragover', 'dragenter'].forEach((event_name) => {
        this.$refs.upload_drop.removeEventListener(event_name, this.preventDragEvent);
      });
      this.$refs.upload_drop.removeEventListener('drop', this.onFileDrop);
    },
    preventDragEvent(event) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.dropEffect = 'move';
      return false;
    },
    onFileDrop({ dataTransfer }) {
      this.$log.debug('file Drop', dataTransfer, dataTransfer.files);
      if (dataTransfer.files[0]) {
        this.onFileChange(dataTransfer.files);
      }
    },
    onFileChange(files) {
      this.imgfile = files;
      if (this.imgfile && this.imgfile !== 'undefined') {
        this.$log.debug('onDataChange');
        this.$emit('onDataChange', this.imgfile);
        const url = URL.createObjectURL(this.imgfile[0]);
        this.$refs.imgref.src = url;
        this.isHide = true;
        this.imgfilename = this.imgfile[0].name;
      } else {
        this.$refs.imgref.src = '/img/jiin/leaf_icon.png';
        this.isHide = false;
        this.imgfilename = '';
      }
    },
    clearInputFile(ele) {
      const elFileForm = document.getElementById(ele);
      const orgParent = elFileForm.parentNode;
      const orgNext = elFileForm.nextSibling;
      const tmp = document.createElement('form');
      tmp.appendChild(elFileForm);
      tmp.reset();
      orgParent.insertBefore(elFileForm,orgNext);
    },
  },
};
</script>

<style scoped>
.filebox input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip:rect(0,0,0,0);
  border: 0;
}

.filebox label {
  display: inline-block;
  padding: 10px 10px;
  color: #fff;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.5px;
  line-height: normal;
  vertical-align: middle;
  /*background-color: #f3873f;*/
  cursor: pointer;
  border: 1px solid #ebebeb;
  /*border-bottom-color: #e2e2e2;*/
  height: 40px;
  /*border-radius: .25em;*/
}

/* named upload */
.filebox .upload-name {
  height: 40px;
  width: 355px;
  display: inline-block;
  padding-left: 10px;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.5px;
  color: #888;
  line-height: normal;
  vertical-align: middle;
  /*background-color: #f5f5f5;*/
  border: 1px solid #ccc;
  border-bottom-color: #e2e2e2;
  /*border-radius: .25em;*/
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.filebox.bs3-primary.hidden {
  display: none;
}

.filebox.bs3-primary label {
  color: #fff;
  background-color: #8d8374;
  border-color: #8d8374;
}

.filebox.bs3-primary label:hover {
  color: #fff;
  background-color: #6e5f49;
  border-color: #6e5f49;
}

.imgtext{
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -80%);
  font-weight: 400;
  font-size: 14px;
  color: #aaa297;
  letter-spacing: -0.5px
}
.imgtext.hide{
  display: none;
}

</style>
