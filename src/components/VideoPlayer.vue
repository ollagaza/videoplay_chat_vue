<template>
  <div id="videoContainer" ref="videoContainer" v-bind:class="{ on: is_player_ready }" v-on:contextmenu.stop.prevent="preventEvent">
    <div class="video_content_wrapper" ref="content_wrapper" v-bind:style="{ bottom: use_out_controller ? '4em' : 0 }">
      <div class="video_player_wrapper" v-bind:class="{ full_hd_container: is_fix_ratio || use_resource_ratio }" v-bind:style="c_video_player_wrapper_style">
        <video id="mteg_video_player" ref="mteg_video_player" class="video-js" tabindex="-1" playsinline="playsinline"></video>
      </div>
      <div class="full_hd_container" v-bind:style="c_content_style">
        <div class="preview_clip_text" v-if="clip_text"><div v-html="c_clip_text"></div></div>
        <img class="mteg_water_mark" src="/img/renewal/logo.png" />
      </div>
    </div>
    <div id="videoUI" ref='videoUI' v-on:contextmenu.stop.prevent="preventEvent">
      <div class="controller-bg" v-if="!use_out_controller"></div>
      <div class="play_large_icon_layer" v-bind:style="{ bottom: use_out_controller ? '4em' : 0 }" v-bind:class="{ on: now_loading }" v-on:click="onPlayerClick">
        <div>
          <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="100px" height="100px" viewBox="0 0 128 128" xml:space="preserve">
            <g>
              <circle cx="16" cy="64" r="16" fill="#2e6bb8" fill-opacity="1"/>
              <circle cx="16" cy="64" r="14.344" fill="#2e6bb8" fill-opacity="1" transform="rotate(45 64 64)"/>
              <circle cx="16" cy="64" r="12.531" fill="#2e6bb8" fill-opacity="1" transform="rotate(90 64 64)"/>
              <circle cx="16" cy="64" r="10.75" fill="#2e6bb8" fill-opacity="1" transform="rotate(135 64 64)"/>
              <circle cx="16" cy="64" r="10.063" fill="#2e6bb8" fill-opacity="1" transform="rotate(180 64 64)"/>
              <circle cx="16" cy="64" r="8.063" fill="#2e6bb8" fill-opacity="1" transform="rotate(225 64 64)"/>
              <circle cx="16" cy="64" r="6.438" fill="#2e6bb8" fill-opacity="1" transform="rotate(270 64 64)"/><circle cx="16" cy="64" r="5.375" fill="#2e6bb8" fill-opacity="1" transform="rotate(315 64 64)"/>
              <animateTransform attributeName="transform" type="rotate" values="0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64" calcMode="discrete" dur="800ms" repeatCount="indefinite">
              </animateTransform>
            </g>
          </svg>
        </div>
      </div>
      <div class="play_large_icon_layer" v-bind:style="{ bottom: use_out_controller ? '4em' : 0 }" v-bind:class="{ on: duration && !is_drawer_active }" v-on:click.stop="onPlayerClick">
        <div class="play_large_icon" v-bind:class="{ play: play_status === STATUS_PLAY || progress_move_start, on: is_player_click }" v-on:animationend="onPlayerIconAnimationEnd"></div>
      </div>
      <div class="controller">
        <div class="progress-control" ref="progressControl">
          <div class="progress-container">
            <div class="progress-bg"></div>
            <div class="load-bar" ref="loadBar" v-bind:style="{ width: load_progress_percent }"></div>
            <div class="progress-bar" ref="progressBar" v-bind:style="{ width: progress_percent }"></div>
            <!--<div class="progress-time" ref="progressTime" v-bind:style="{ left: progress_percent }">{{ current_time_str }}</div>-->
            <div class="progress-over-line" ref="progressOverLine" v-bind:style="{ left: progress_over_percent }"></div>
            <div class="progress-over-time" ref="progressOverTime" v-if="this.object_offset_info.progressTimeOver" v-bind:style="{ left: progress_over_percent }">{{ progress_over_time }}</div>
            <div class="progress-range-bar" ref="progressRangeBar" v-bind:class="{ on: show_range_selector || show_range_bar }" v-bind:style="{ left: c_range_start_percent, width: c_range_width }"></div>
            <div class="progress-handle" ref="progressHandle" v-bind:style="{ left: progress_percent }"></div>
          </div>
          <div class="progress-event-target" ref="progressEventTarget"></div>
          <div class="progress-range start" ref="progressRangeStart" v-bind:class="{ on: !is_drawer_active && show_range_selector }" v-bind:style="{ left: c_range_start_percent, display: (hide_range_selector_handle ? 'none' : '') }" v-on:mousedown="onRangeDown(RANGE_TYPE_START, $event)">{{ c_range_start_time_str }}</div>
          <div class="progress-range end" ref="progressRangeEnd" v-bind:class="{ on: !is_drawer_active && show_range_selector }" v-bind:style="{ left: c_range_end_percent, display: (hide_range_selector_handle ? 'none' : '') }" v-on:mousedown="onRangeDown(RANGE_TYPE_END, $event)">{{ c_range_end_time_str }}</div>
        </div>
        <div class="control-divider">
          <div class="control-left">
            <div class="button play" title="Play" ref='btnVideoPlay' v-bind:class="{ off: play_status === STATUS_PLAY, disable: is_drawer_active && !is_drawer_view_mode }" v-on:click.stop.prevent="onPlayBtnClick"><span class=""></span></div>
            <div class="button repeat" title="Repeat" ref='btnRepeat' v-bind:class="{ off: !is_loop, disable: is_drawer_active }" v-on:click.stop.prevent="setRangeLoop"><span class=""></span></div>
            <div class="button sound" title="Sound" ref='btnSound' v-bind:class="c_sound_btn_class" v-on:click.stop.prevent="onSoundBtnClick"><span class=""></span></div>
            <div class="volume-bar"><!--  v-if="!is_mobile" -->
              <div class="volume-slider" ref="volumeSlider">
                <div class="volume-slider-handle" ref="volumeSliderHandle" v-bind:style="{ left: volume_percent_str }"></div>
              </div>
              <div class="volume-event-target" ref="volumeEventTarget" v-on:click.stop.prevent=""></div>
            </div>
            <div class="play-time" ref="currentTime">{{ c_play_time_str }}</div>
          </div>
          <div class="control-right">
            <div v-if="show_shortcut_button" class="shortcut_button" title="단축키" v-on:click.stop.prevent="onShortcutBtnClick"><img src="/img/renewal/common/shortcut_icon.png"><span>{{ '단축키' }}</span></div>
            <div v-if="show_add_index_button" class="add_index_button" v-on:click.stop.prevent="onAddIndexBtnClick"><div class="button add_index" title="Add Index"><span class=""></span></div><span>인덱스 추가</span></div>
            <div v-if="show_option_button" class="button setting" title="Setting" ref="btnSetting" v-bind:class="{ on: is_setting_menu_on, hd: is_hd }" v-on:click.stop.prevent="onSettingBtnClick"><span class="gear"></span><div class="hd-text"></div></div>
            <div v-if="show_wide_screen_button && !is_fullscreen" class="button wide_screen" title="Wide Screen" ref="btnWideScreen" v-bind:class="{ on: is_wide_screen }" v-on:click.stop.prevent="onWideScreenBtnClick"><span class=""></span></div>
            <div v-if="show_fullscreen_button" class="button fullscreen" title="Fullscreen" ref="btnFullscreen" v-bind:class="{ off: is_fullscreen }" v-on:click.stop.prevent="onFullscreenBtnClick"><span class=""></span></div>
            <div v-if="show_change_timeline_save" class="btn w65 h24 time_change_btn" v-on:click="onConfirmTimeChange()">
              {{ '시간 수정' }}</div>
          </div>
        </div>
      </div>
      <div class="setting-menu" ref="settingMenu" v-bind:class="{ on: is_setting_menu_on }">
        <div class="menu-wrapper" ref="menuMain" v-bind:class="{ on: current_menu === MENU_TYPE_MAIN }">
          <div class="menu-item" ref="menuSpeed" v-on:click.stop.prevent="onMenuClick(MENU_TYPE_SPEED)">
            <div class="menu-label">재생 속도</div>
            <div class="menu-content"><div ref="menuSpeedText">{{ selected_speed.name }}</div></div>
          </div>
          <div class="menu-item" ref="menuQuality" v-on:click.stop.prevent="onMenuClick(MENU_TYPE_QUALITY)">
            <div class="menu-label">동영상 품질</div>
            <div class="menu-content"><div ref="menuQualityText" v-bind:class="{ hd: selected_quality.is_hd }">{{ selected_quality.name }}</div></div>
          </div>
        </div>
        <div class="menu-wrapper" ref="menuQualityList" v-bind:class="{ on: current_menu === MENU_TYPE_QUALITY }">
          <div class="menu-header" v-on:click.stop="onMenuBackClick">품질</div>
          <template v-for="quality in c_quality_list">
            <div class="menu-item" v-bind:class="{ selected: quality.value === selected_quality.value }" v-on:click.stop.prevent="onQualityMenuClick(quality)">
              <div class="menu-label"></div>
              <div class="menu-quality" v-bind:class="{ hd: quality.is_hd }">{{ quality.name }}</div>
            </div>
          </template>
        </div>
        <div class="menu-wrapper" ref="menuSpeedList" v-bind:class="{ on: current_menu === MENU_TYPE_SPEED }">
          <div class="menu-header" v-on:click.stop="onMenuBackClick">속도</div>
          <template v-for="speed in c_speed_list">
            <div class="menu-item" v-bind:class="{ selected: speed.value === selected_speed.value }" v-on:click.stop.prevent="onSpeedMenuClick(speed)">
              <div class="menu-label"></div>
              <div class="menu-quality">{{ speed.name }}</div>
            </div>
          </template>
        </div>
      </div>
      <template v-if="shortcut_list">
      </template>
    </div>
    <div class='global-event-target' ref="globalEventTarget" v-bind:class="{ on: is_global_event_on }"></div>
    <template v-if="show_shortcut_list">
      <div class="shortcut_position">
        <Shortcut v-bind:shortcut_list="shortcut_list" v-on:onCloseShortcut="onShortcutBtnClick"></Shortcut>
      </div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import BaseMixin from '../components/Mixins/BaseMixin';
import EventBus from '../utils/eventbus';
import Shortcut from './Shortcut';
// import ChangeLang from './VideoPlayer.vue.lang';

export default {
  name: 'VideoPlayer',
  mixins: [BaseMixin],
  props: ['clip_text'],
  components: { Shortcut },
  data() {
    return {
      RANGE_TYPE_NONE: 0,
      RANGE_TYPE_START: 1,
      RANGE_TYPE_END: 2,
      STATUS_PAUSE: 0,
      STATUS_PLAY: 1,
      MENU_TYPE_MAIN: 0,
      MENU_TYPE_SPEED: 1,
      MENU_TYPE_QUALITY: 2,
      player: null,
      is_hd: false,
      is_setting_menu_on: false,
      is_volume_mouse_down: false,
      is_progress_mouse_over: false,
      is_auto: true,
      is_fullscreen: false,
      is_wide_screen: false,
      is_muted: false,
      is_player_ready: false,
      is_loop: false,
      is_play_one: false,
      is_play_one_complete_pause: false,
      prev_volume: 0,
      current_time: 0,
      current_time_str: '',
      total_time: '',
      duration: null,
      current_menu: 0,
      quality_level_list: [],
      progress_bar_start_x: 0,
      progress_bar_width: 0,
      move_range_type: 0,
      range_start_x: 0,
      range_end_x: 0,
      playback_rates: [0.5, 1, 1.5, 2, 4],
      play_status: 0,
      progress_percent: 0,
      selected_speed: {},
      selected_quality: {},
      volume_percent_str: '0',
      progress_over_percent: 0,
      progress_over_time: 0,
      is_global_event_on: false,
      load_progress_percent: '0',
      range_id: null,
      limit_resolution: 0,
      default_resolution: 0,
      start_time: 0,
      show_range_selector: false,
      show_range_bar: false,
      use_out_controller: true,
      show_option_button: false,
      show_add_index_button: false,
      show_shortcut_button: false,
      shortcut_list: null,
      show_fullscreen_button: false,
      is_auto_play: true,
      editor_mode: false,
      current_stream_source: null,
      options: {},
      content_width: 0,
      content_height: 0,
      range_action_gap: 0,
      range_selector_width: 0,
      is_fix_ratio: false,
      use_resource_ratio: false,
      media_width: 0,
      media_height: 0,
      use_screen_mode_change_event: false,
      show_wide_screen_button: false,
      hide_range_selector_handle: false,
      is_drawer_active: false,
      is_drawer_view_mode: false,
      progress_move_start: false,
      progress_x_diff: 0,
      progress_x: 0,
      progress_last_status: null,
      progress_last_update_time: 0,
      now_loading: false,
      is_player_click: false,
      object_offset_info: {
        progressHandle: 0,
        progressRangeStart: 0,
        progressRangeEnd: 0,
        volumeSliderHandle: 0,
        is_check: false,
        progressTimeOver: true,
      },
      show_change_timeline_save: false,
      show_shortcut_list: false,
    };
  },
  created() {
    // this.lang_map = ChangeLang;
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
    this.progress_bar_start_x = this.$refs.progressControl.offsetLeft;
    this.range_selector_width = this.$refs.progressRangeStart.clientWidth;

    this.player = window.videojs('mteg_video_player', {
      html5: {
        vhs: {
          overrideNative: true,
        },
      },
      preload: true,
      playbackRates: this.playback_rates,
      techOrder: ['html5'],
      textTrackSettings: false,
    });
    // videojs 플레이어 초기화 완료 이벤트
    this.player.ready(() => {
      this.prev_volume = this.player.volume();
      this.setVolume(this.player.muted() ? 0 : this.prev_volume, this.player.muted());
      this.is_player_ready = true;
      // this.debug('video player ready');
      this.$emit('onPlayerReady');
    });
    this.player.on('error', (error) => {
      this.$log.error('video player error', error);
    });

    this.quality_levels = this.player.qualityLevels();
    this.quality_levels.on('change', () => {
      const current_quality = this.quality_levels[this.quality_levels.selectedIndex];
      // this.$log.debug('this.quality_levels.on(\'change\')', this.quality_levels, this.quality_levels.selectedIndex, 'current_quality.height:', current_quality.height);
      this.is_hd = current_quality.height >= 720;
    });
    this.quality_levels.on('addqualitylevel', (event) => {
      const quality_level = event.qualityLevel;
      if (!quality_level) {
        return;
      }
      if (this.limit_resolution > 0 && quality_level.height > this.limit_resolution) {
        quality_level.enabled = false;
        return;
      }
      const quality_info = {
        value: quality_level.height,
        name: `${quality_level.height}p`,
        is_hd: quality_level.height >= 720,
        is_auto: false,
        info: quality_level,
      };
      quality_level.enabled = true;
      this.quality_level_list.push(quality_info);
      // this.$log.debug('this.quality_levels.on(\'addqualitylevel\')', quality_level.height, quality_level);
      // if (this.default_resolution) {
      //   if (quality_level.height <= this.default_resolution) {
      //     if (!this.selected_quality) {
      //       quality_level.enabled = true;
      //       this.selected_quality = quality_info;
      //     } else if (this.selected_quality.value < quality_level.height) {
      //       if (this.selected_quality.info) {
      //         this.selected_quality.info.enable = false;
      //       }
      //       quality_level.enabled = true;
      //       this.selected_quality = quality_info;
      //     }
      //     this.debug(quality_level.height, this.default_resolution, this.selected_quality);
      //   }
      // }
    });

    const video_js_events = [
      'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'loadedmetadata', 'loadeddata',
      'canplay', 'canplaythrough', 'playing', 'waiting', 'seeking', 'seeked', 'ended', 'durationchange',
      'timeupdate', 'play', 'pause', 'ratechange', 'resize', 'volumechange',
    ];
    for (let i = 0; i < video_js_events.length; i++) {
      if (video_js_events[i] === 'canplay') {
        this.player.on(video_js_events[i], this.videoJSEventHandler);
      } else {
        this.player.on(video_js_events[i], this.videoJSEventHandler);
      }
    }
    this.progress_bar_width = this.$refs.progressControl.clientWidth;
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    this.removeEventListener();
    if (this.player) {
      this.player.dispose();
    }
  },
  watch: {
  },
  computed: {
    c_play_time_str() {
      if (this.current_time_str && this.total_time) {
        return `${this.current_time_str} / ${this.total_time}`;
      }
      return '';
    },

    c_quality_list() {
      return _.sortBy(this.quality_level_list, quality => -quality.value);
    },

    c_speed_list() {
      const speed_list = [];
      for (let i = 0; i < this.playback_rates.length; i++) {
        speed_list.push({
          value: this.playback_rates[i],
          name: this.playback_rates[i] === 1 ? '보통' : this.playback_rates[i],
          index: this.playback_rates.length - i - 1,
        });
      }
      return _.sortBy(speed_list, speed => -speed.value);
    },

    c_sound_btn_class() {
      const class_info = { off: false, low: false, mid: false };
      if (this.prev_volume <= 0) {
        class_info.low = true;
        class_info.off = true;
      } else if (this.prev_volume <= 0.33) {
        class_info.low = true;
      } else if (this.prev_volume <= 0.66) {
        class_info.mid = true;
      }
      if (this.is_muted) {
        class_info.off = true;
      }
      return class_info;
    },

    c_range_start() {
      if (this.progress_bar_width <= 0) {
        return 0;
      }
      return this.range_start_x / this.progress_bar_width;
    },
    c_range_end() {
      if (this.progress_bar_width <= 0) {
        return 0;
      }
      return this.range_end_x / this.progress_bar_width;
    },
    c_range_start_time() {
      return this.c_range_start * this.duration;
    },
    c_range_end_time() {
      return this.c_range_end * this.duration;
    },
    c_range_start_percent() {
      return `${(this.c_range_start * 100).toFixed(2)}%`;
    },
    c_range_end_percent() {
      return `${(this.c_range_end * 100).toFixed(2)}%`;
    },
    c_range_start_time_str() {
      return this.getTimeStr(this.c_range_start_time);
    },
    c_range_end_time_str() {
      return this.getTimeStr(this.c_range_end_time);
    },
    c_range_width() {
      return this.getPercent(this.range_end_x - this.range_start_x, this.progress_bar_width);
    },
    c_clip_text() {
      return this.nl2br(this.clip_text);
    },
    c_content_style() {
      let style = '';
      const width_scale = this.content_width / this.c_media_width;
      const height_scale = this.content_height / this.c_media_height;
      const scale = Math.min(width_scale, height_scale);
      style = ` transform: translate(-50%, -50%) scale(${scale}); width: ${this.c_media_width}px; height: ${this.c_media_height}px;`;
      return style;
    },
    c_video_player_wrapper_style() {
      if (!this.is_fix_ratio && !this.use_resource_ratio) {
        return '';
      }
      let style = '';
      const width_scale = this.content_width / this.c_media_width;
      const height_scale = this.content_height / this.c_media_height;
      const scale = Math.min(width_scale, height_scale);
      style = ` transform: translate(-50%, -50%) scale(${scale}); width: ${this.c_media_width}px; height: ${this.c_media_height}px;`;
      return style;
    },
    c_media_width() {
      if (this.use_resource_ratio) {
        return this.media_width;
      }
      return 1920;
    },
    c_media_height() {
      if (this.use_resource_ratio) {
        return this.media_height;
      }
      return 1080;
    },
  },
  methods: {
    onWindowResize() {
      if (this.$refs.content_wrapper) {
        this.content_width = this.$refs.content_wrapper.clientWidth;
        this.content_height = this.$refs.content_wrapper.clientHeight;
        if (!this.object_offset_info.is_check) {
          this.object_offset_info.is_check = true;
          if (this.$refs.progressControl && this.$refs.progressControl.getClientRects().length > 0) {
            this.object_offset_info.progressHandle = this.$refs.progressControl.getClientRects()[0].x;
            this.object_offset_info.progressRangeStart = this.$refs.progressControl.getClientRects()[0].x;
            this.object_offset_info.progressRangeEnd = this.$refs.progressControl.getClientRects()[0].x;
          } else {
            this.object_offset_info.is_check = false;
          }
        }
        if (this.$refs.volumeSlider) {
          if (this.$refs.volumeSlider.getClientRects().length > 0) {
            this.object_offset_info.volumeSliderHandle = this.$refs.volumeSlider.getClientRects()[0].x;
          }
        }
      }
    },
    preventEvent() {
      return false;
    },
    play() {
      this.player.play();
    },
    pause() {
      this.player.pause();
    },
    onDrawerActive(is_active, is_view_mode) {
      this.is_drawer_active = is_active;
      this.is_drawer_view_mode = is_view_mode;
    },
    reset() {
      this.is_hd = false;
      this.is_setting_menu_on = false;
      this.is_volume_mouse_down = false;
      this.is_progress_mouse_over = false;
      this.is_auto = true;
      this.is_fullscreen = false;
      this.is_wide_screen = false;
      this.is_loop = false;
      this.is_play_one = false;
      this.is_play_one_complete_pause = false;
      this.current_time_str = '';
      this.total_time = '';
      this.duration = null;
      this.current_menu = 0;
      this.quality_level_list = [];
      this.progress_bar_width = this.$refs.progressControl.clientWidth;
      this.move_range_type = 0;
      this.range_start_x = 0;
      this.range_end_x = 0;
      this.playback_rates = [0.5, 1, 1.5, 2, 4];
      this.play_status = 0;
      this.progress_percent = 0;
      this.selected_quality = {};
      this.progress_over_percent = 0;
      this.progress_over_time = 0;
      this.is_global_event_on = false;
      this.load_progress_percent = '0';
      this.range_id = null;
      this.limit_resolution = 0;
      this.start_time = 0;
      this.show_range_selector = false;
      this.show_range_bar = false;
      this.use_out_controller = true;
      this.show_option_button = false;
      this.show_add_index_button = false;
      this.show_shortcut_button = false;
      this.shortcut_list = null;
      this.show_fullscreen_button = false;
      this.is_auto_play = true;
      this.selected_speed = _.find(this.c_speed_list, speed_info => speed_info.value === 1);
      const default_level_info = { value: -1, name: '자동', is_hd: false, is_auto: true };
      this.quality_level_list.push(default_level_info);
      this.selected_quality = default_level_info;
      this.current_time_str = this.getTimeStr(this.current_time);
      this.range_action_gap = 0;
      this.use_screen_mode_change_event = false;
      this.hide_range_selector_handle = false;
      this.is_drawer_active = false;
      this.now_loading = false;
      this.is_player_click = false;
      this.show_change_timeline_save = false;
    },
    initPlayer(stream_source, options = {}, media_info = null) {
      if (!this.player || !stream_source) {
        return;
      }
      if (this.current_stream_source) {
        if (this.current_stream_source[0].src === stream_source[0].src) {
          return;
        }
      }
      this.current_stream_source = stream_source;
      this.reset();

      this.options = options;
      this.limit_resolution = options.limit_resolution || 0;
      this.default_resolution = options.default_resolution || 0;
      this.player.src(stream_source);
      this.start_time = this.options.start_time || 0;
      this.show_range_selector = this.options.show_range_selector || false;
      this.show_range_bar = this.options.show_range_bar || false;
      this.hide_range_selector_handle = this.options.hide_range_selector_handle || false;
      if (this.options.use_out_controller === false) {
        this.use_out_controller = this.options.use_out_controller;
      }
      this.show_option_button = this.options.show_option_button !== false;
      this.show_fullscreen_button = this.options.show_fullscreen_button !== false;
      this.show_add_index_button = this.options.show_add_index_button === true;
      this.show_shortcut_button = this.options.show_shortcut_button === true;
      this.shortcut_list = this.options.shortcut_list || null;
      this.is_fix_ratio = this.options.is_fix_ratio ? this.options.is_fix_ratio : false;
      if (media_info) {
        this.media_width = media_info.width;
        this.media_height = media_info.height;
        this.use_resource_ratio = this.options.use_resource_ratio ? this.options.use_resource_ratio : false;
      } else {
        this.use_resource_ratio = false;
      }
      this.editor_mode = this.options.editor_mode === true;
      this.use_screen_mode_change_event = this.options.use_screen_mode_change_event === true;
      this.show_wide_screen_button = this.options.show_wide_screen_button === true;
      this.show_change_timeline_save = this.options.show_change_timeline_save === true;
      this.$nextTick().then(() => {
        this.onWindowResize();
      });
    },
    setNewRange(start_time, end_time, range_id, is_play_one = false, set_start_time = true, on_complete_pause = false, attach_event = false) {
      if (!this.is_player_ready || !this.duration) {
        return;
      }

      this.range_id = range_id;
      this.is_play_one = is_play_one;
      this.is_play_one_complete_pause = on_complete_pause;
      this.show_change_timeline_save = this.options.show_change_timeline_save === true;

      this.progress_bar_width = this.$refs.progressControl.clientWidth;
      const new_start_x = (start_time / this.duration * this.progress_bar_width);
      if (end_time > this.duration) {
        end_time = this.duration;
      }
      const new_end_x = (end_time / this.duration * this.progress_bar_width);
      if (this.range_start_x !== new_start_x || this.range_end_x !== new_end_x) {
        this.range_start_x = new_start_x;
        this.range_end_x = new_end_x;
      }
      if (set_start_time) {
        this.player.currentTime(start_time);
      }
      if (attach_event) {
        this.$emit('onRangeChange', this.getSelectedRange());
      }
    },
    setRangeLoop(is_loop) {
      if (!this.is_player_ready) {
        return false;
      }
      if (Math.abs(this.range_start_x - this.range_end_x) <= 1) {
        return false;
      }
      this.is_loop = !this.is_loop;
      if (!this.is_loop) {
        return false;
      }
      this.is_play_one = false;
      this.setCurrentTimeByRange();
      this.play();
      return is_loop;
    },
    getCurrentTime() {
      if (!this.is_player_ready) {
        return 0;
      }
      return this.player ? this.player.currentTime() : this.current_time;
    },
    setCurrentTime(current_time) {
      this.player.currentTime(current_time);
    },
    getSelectedRange() {
      if (!this.is_player_ready) {
        return {
          error: true,
          message: 'player not ready',
        };
      }
      return {
        error: false,
        startTime: this.c_range_start_time,
        endTime: this.c_range_end_time,
        range_id: this.range_id,
      };
    },
    onCurrentTimeChange() {
      this.$emit('onCurrentTimeChange', this.current_time, this.play_status === this.STATUS_PLAY);
      if (this.is_loop) {
        this.setCurrentTimeByRange();
      } else if (this.is_play_one) {
        if (this.current_time >= this.c_range_end_time) {
          this.is_play_one = false;
          if (this.is_play_one_complete_pause) {
            this.pause();
          }
          this.is_play_one_complete_pause = false;
          this.$emit('onRangePlayComplete', this.range_id);
        }
      }
    },
    setCurrentTimeByRange() {
      if (this.current_time < this.c_range_start_time || this.current_time >= this.c_range_end_time) {
        this.player.currentTime(this.c_range_start_time);
      }
    },
    changePlayTime(change_time) {
      if (!this.is_player_ready) {
        return;
      }
      this.player.currentTime(this.player.currentTime() + change_time);
    },
    changePlayTimeByRage(rate) {
      if (rate > 1) {
        rate = 1;
      } else if (rate < 0) {
        rate = 0;
      }
      this.player.currentTime(this.duration * rate);
    },
    changePlayStatus() {
      if (this.play_status === this.STATUS_PLAY) {
        this.player.pause();
      } else {
        this.player.play();
      }
    },
    changeRangePosition(is_start) {
      let start_time = this.c_range_start_time;
      let end_time = this.c_range_end_time;
      const current_time = this.player.currentTime();
      // const time_gap = end_time - start_time;
      if (is_start) {
        if (current_time >= end_time) {
          start_time = end_time;
          end_time = current_time;
          if (end_time > this.duration) {
            end_time = this.duration;
          }
        } else {
          start_time = current_time;
        }
      } else if (current_time <= start_time) {
        end_time = start_time;
        start_time = current_time;
        if (start_time < 0) {
          start_time = 0;
        }
      } else {
        end_time = current_time;
      }
      this.setNewRange(start_time, end_time, null, false, false, false, true);
    },

    videoJSEventHandler(event) {
      const event_type = event.type;
      if (event_type === 'play' || event_type === 'pause') {
        this.$emit('onPlayerEventHandler', event_type);
      }
      // this.$log.debug('[videoJSEventHandler]', 'event_type:', event_type);
      if (event.type === 'timeupdate') {
        // 플레이 시간 업데이트
        this.now_loading = false;
        if (this.progress_move_start) return;
        this.setProgress();
        this.onCurrentTimeChange();
      } else if (event.type === 'progress') {
        // 로딩 업데이트
        this.load_progress_percent = this.duration <= 0 ? 0 : this.getPercent(this.player.bufferedEnd(), this.duration);
      } else if (event.type === 'loadedmetadata') {
        this.setDuration();
      } else if (event.type === 'durationchange') {
        this.setDuration();
      } else if (event_type === 'play') {
        this.play_status = this.STATUS_PLAY;
      } else if (event_type === 'pause') {
        this.play_status = this.STATUS_PAUSE;
      } else if (event_type === 'canplay') {
        this.onCanPlay();
        if (this.is_auto_play) {
          // this.play();
        }
      } else if (event_type === 'seeked') {
        // if (this.play_status === this.STATUS_PLAY) {
        //   this.now_loading = true;
        // }
        this.now_loading = false;
      } else if (event_type === 'ended') {
        this.$emit('onPlayEnded');
        if (this.is_loop) {
          this.player.currentTime(this.c_range_start_time);
          this.play();
        }
      }
    },

    onCanPlay() {
      this.$emit('onCanPlay');
    },
    setEventListener() {
      // progress event
      this.$refs.progressEventTarget.addEventListener('mousedown', this.onProgressMouseDown);
      this.$refs.progressEventTarget.addEventListener('mouseover', this.onProgressMouseAction);
      this.$refs.progressEventTarget.addEventListener('mouseout', this.onProgressMouseAction);
      this.$refs.progressEventTarget.addEventListener('mousemove', this.onProgressMouseAction);

      // progress touch event
      this.$refs.progressEventTarget.addEventListener('touchstart', this.onProgressMouseDown);

      // start, end range event
      this.$refs.progressRangeStart.addEventListener('touchstart', () => { this.onRangeDown(this.RANGE_TYPE_START, event); }, false);
      this.$refs.progressRangeEnd.addEventListener('touchstart', () => { this.onRangeDown(this.RANGE_TYPE_END, event); }, false);


      // volume
      if (this.$refs.volumeEventTarget) {
        this.$refs.volumeEventTarget.addEventListener('mouseup', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.addEventListener('mousedown', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.addEventListener('mouseout', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.addEventListener('mousemove', this.onVolumeMouseAction);
        // touch event
        this.$refs.volumeEventTarget.addEventListener('touchstart', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.addEventListener('touchend', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.addEventListener('touchmove', this.onVolumeMouseAction);
      }
    },

    removeEventListener() {
      this.$refs.progressEventTarget.removeEventListener('mousedown', this.onProgressMouseDown);
      this.$refs.progressEventTarget.removeEventListener('mouseover', this.onProgressMouseAction);
      this.$refs.progressEventTarget.removeEventListener('mouseout', this.onProgressMouseAction);
      this.$refs.progressEventTarget.removeEventListener('mousemove', this.onProgressMouseAction);
      this.$refs.progressEventTarget.removeEventListener('touchstart', this.onProgressMouseDown);
      this.$refs.progressEventTarget.removeEventListener('touchmove', this.onProgressMouseAction);
      this.$refs.progressEventTarget.removeEventListener('touchend', this.onProgressMouseAction);

      this.$refs.progressRangeStart.removeEventListener('touchstart', () => { this.onRangeDown(this.RANGE_TYPE_START, event); }, false);
      this.$refs.progressRangeEnd.removeEventListener('touchstart', () => { this.onRangeDown(this.RANGE_TYPE_END, event); }, false);

      if (this.$refs.volumeEventTarget) {
        this.$refs.volumeEventTarget.removeEventListener('mouseup', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('mousedown', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('mouseout', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('mousemove', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('touchstart', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('touchmove', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('touchend', this.onVolumeMouseAction);

        this.$refs.volumeEventTarget.removeEventListener('touchstart', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('touchend', this.onVolumeMouseAction);
        this.$refs.volumeEventTarget.removeEventListener('touchmove', this.onVolumeMouseAction);
      }
    },

    // UI Mouse Event Start ==================================================

    // 재생버튼 클릭 이벤트. 재생 / 일시정지
    onPlayerClick() {
      if (this.is_drawer_active) return;
      this.is_player_click = true;
      this.onPlayBtnClick();
    },
    onPlayerIconAnimationEnd() {
      this.is_player_click = false;
    },
    onPlayBtnClick() {
      if (this.play_status === this.STATUS_PLAY) {
        this.pause();
      } else {
        this.play();
        this.$emit('onPlayBtnClick');
      }
    },

    // 볼륨조정 버튼 클릭 이벤트. (음소거 / 원래대로)
    onSoundBtnClick() {
      if (this.is_muted) {
        this.setVolume(this.prev_volume, false);
      } else {
        this.setVolume(0, true);
      }
    },

    onAddIndexBtnClick() {
      this.$emit('onAddIndexBtnClick', this.getCurrentTime());
    },
    onShortcutBtnClick() {
      this.show_shortcut_list = !this.show_shortcut_list;
    },

    // 설정메뉴 버튼 클릭 이벤트
    onSettingBtnClick() {
      if (this.is_setting_menu_on) {
        this.hideSettingMenu();
      } else {
        this.showSettingMenu();
      }
    },

    // 전체화면 버튼 클릭 이벤트
    onFullscreenBtnClick() {
      this.object_offset_info.is_check = false;
      if (this.use_screen_mode_change_event) {
        this.$emit('onFullscreenBtnClick');
        return;
      }
      if (this.is_fullscreen) {
        this.closeFullscreen();
      } else {
        this.openFullscreen(this.$refs.videoContainer);
      }
    },
    onWideScreenBtnClick() {
      this.$emit('onWideScreenBtnClick');
    },

    // 볼륨조정 마우스 이벤트
    onVolumeMouseAction(event) {
      event.stopPropagation();
      event.preventDefault();
      const event_type = event.type;
      if (event_type === 'mousedown' || event_type === 'touchstart') {
        this.is_volume_mouse_down = true;
      } else if (event_type === 'mouseup' || event_type === 'touchend') {
        this.is_volume_mouse_down = false;
      } else if (event_type === 'mouseout' || event_type === 'touchend') {
        this.is_volume_mouse_down = false;
        return;
      } else if (event_type === 'mousemove' || event_type === 'touchmove') {
        if (!this.is_volume_mouse_down) {
          return;
        }
      } else {
        return;
      }
      if (event_type === 'touchstart' || event_type === 'touchend' || event_type === 'touchmove') {
        let offset_x = event.changedTouches[0].clientX - this.object_offset_info.volumeSliderHandle;
        const bar_width = this.$refs.volumeEventTarget.clientWidth;
        const em = bar_width / 5;
        const max_width = em * 3;
        offset_x -= em;
        let volume = offset_x / max_width;
        if (volume > 1) { volume = 1; } else if (volume < 0) { volume = 0; }
        this.setVolume(volume, false);
      } else {
        let offset_x = event.offsetX;
        const bar_width = this.$refs.volumeEventTarget.clientWidth;
        const em = bar_width / 5;
        const max_width = em * 3;
        offset_x -= em;
        const volume = offset_x / max_width;
        this.setVolume(volume, false);
      }
    },

    onProgressMouseDown(event) {
      if (this.progress_move_start) return;
      event.stopPropagation();
      event.preventDefault();
      if (event.type === 'touchstart') {
        this.object_offset_info.progressTimeOver = true;
        const offset_x = event.changedTouches[0].clientX - this.object_offset_info.progressHandle;
        const page_x = event.changedTouches[0].pageX;
        this.progress_x_diff = page_x - offset_x;
        this.progress_x = page_x;
      } else {
        const offset_x = event.offsetX;
        const page_x = event.pageX;
        this.progress_x_diff = page_x - offset_x;
        this.progress_x = page_x;
      }
      this.onProgressMoveStart(event);
    },
    onProgressMoveStart(event) {
      if (event.type === 'touchstart') {
        document.addEventListener('touchmove', this.onProgressMouseAction, { passive: false });
        document.addEventListener('touchend', this.onProgressMouseUp);
      } else {
        document.addEventListener('mousemove', this.onProgressMouseMove);
        document.addEventListener('mouseup', this.onProgressMouseUp);
      }
      this.progress_move_start = true;
      this.progress_last_status = this.play_status;
      this.pause();
      this.changeProgress(true);
    },
    onProgressMouseMove(event) {
      if (!this.progress_move_start) {
        this.onProgressMouseEventEnd(event);
        return;
      }
      this.progress_x = event.pageX;
      this.changeProgress();
    },
    onProgressMouseUp(event) {
      if (!this.progress_move_start) {
        this.onProgressMouseEventEnd(event);
        return;
      }
      this.changeProgress(true);
      if (this.progress_last_status === this.STATUS_PLAY) {
        this.now_loading = true;
        this.play();
      }
      this.onProgressMouseEventEnd(event);
    },
    changeProgress(update_force = false) {
      const timestamp = Date.now();
      const time_diff = timestamp - this.progress_last_update_time;
      this.progress_last_update_time = timestamp;
      let offset_x = this.progress_x - this.progress_x_diff;
      const progress_bar_width = this.$refs.progressControl.clientWidth;
      if (offset_x < 0) offset_x = 0;
      if (offset_x > progress_bar_width) offset_x = progress_bar_width;
      const change_time = this.duration * (offset_x / progress_bar_width);
      this.current_time = change_time;
      this.current_time_str = this.getTimeStr(this.current_time);
      this.progress_percent = this.duration <= 0 ? 0 : this.getPercent(this.current_time, this.duration);
      this.$emit('onCurrentTimeChange', this.current_time, false, true);
      if (!update_force) {
        if (time_diff < 100) {
          // return;
        }
      }
      this.player.currentTime(change_time);
    },
    onProgressMouseEventEnd(event) {
      this.progress_move_start = false;
      this.progress_x_diff = 0;
      this.progress_x = 0;
      this.progress_last_status = null;
      this.progress_last_update_time = 0;
      if (event.type === 'touchend' || event.type === 'touchmove') {
        this.object_offset_info.progressTimeOver = false;
        document.removeEventListener('touchmove', this.onProgressMouseAction, { passive: false });
        document.removeEventListener('touchend', this.onProgressMouseUp);
      } else {
        document.removeEventListener('mousemove', this.onProgressMouseMove);
        document.removeEventListener('mouseup', this.onProgressMouseUp);
      }
    },

    // 진행상태 막대 마우스 이벤트(클릭 제외).
    onProgressMouseAction(event) {
      if (event.type === 'touchmove') {
        event.preventDefault();
        const offset_x = event.changedTouches[0].clientX - this.object_offset_info.progressHandle;
        const progress_bar_width = this.$refs.progressControl.clientWidth;

        let percent = offset_x / progress_bar_width;
        if (percent > 100) {
          percent = 100;
        } else if (percent < 0) {
          percent = 0;
        }
        this.progress_over_percent = `${(percent * 100).toFixed(2)}%`;
        this.progress_over_time = this.getTimeStr(this.duration * percent);
        if (event.type === 'touchmove') {
          const offset_x = event.changedTouches[0].clientX - this.object_offset_info.progressHandle;
          const page_x = event.changedTouches[0].pageX;
          this.progress_x_diff = page_x - offset_x;
          this.progress_x = page_x;
          this.progress_move_start = true;
          this.changeProgress(true);
        } else {
          this.progress_move_start = false;
        }
      } else {
        const event_type = event.type;
        if (event_type !== 'mouseover' && event_type !== 'mousemove' && event_type !== 'touchmove' && event_type !== 'touchend') {
          return;
        }
        const offset_x = event.offsetX;
        const progress_bar_width = this.$refs.progressControl.clientWidth;
        const percent = offset_x / progress_bar_width;
        this.progress_over_percent = `${(percent * 100).toFixed(2)}%`;
        this.progress_over_time = this.getTimeStr(this.duration * percent);
      }
    },

    // UI Buttons Mouse Event End ==================================================

    // Setting Menu Mouse Event Start ==============================================
    // 메인 메뉴 클릭 이벤트
    onMenuClick(menu_type) {
      if (menu_type === this.MENU_TYPE_SPEED) {
        this.current_menu = this.MENU_TYPE_SPEED;
      } else if (menu_type === this.MENU_TYPE_QUALITY) {
        this.current_menu = this.MENU_TYPE_QUALITY;
      }
    },

    // 각 목록 상단의 < ## 항목의 클릭 이벤트
    onMenuBackClick() {
      this.current_menu = this.MENU_TYPE_MAIN;
    },

    // 재생 속도 목록 클릭 이벤트. player.playbackRate 로 재생 속도 조절
    onSpeedMenuClick(speed_info) {
      if (!speed_info || this.selected_speed.value === speed_info.value) {
        return;
      }
      this.selected_speed = speed_info;
      this.player.playbackRate(speed_info.value);
      this.hideSettingMenu();
    },
    onSpeedUp() {
      if (this.selected_speed.index <= 0) {
        return;
      }
      this.onSpeedMenuClick(this.c_speed_list[this.selected_speed.index - 1]);
    },
    onSpeedDown() {
      if (this.selected_speed.index >= this.c_speed_list.length - 1) {
        return;
      }
      this.onSpeedMenuClick(this.c_speed_list[this.selected_speed.index + 1]);
    },

    // 동영상 품질 목록 클릭 이벤트.
    onQualityMenuClick(quality_info) {
      this.selected_quality = quality_info;
      for (let i = 0; i < this.quality_levels.length; i++) {
        const quality = this.quality_levels[i];
        quality.enabled = quality_info.is_auto || quality.height === quality_info.value;
      }
      this.hideSettingMenu();
    },
    // Setting Menu Mouse Event End ==============================================

    // RangeSelect Mouse Event Start =============================================
    // 구간선택 마우스 다운 이벤트.
    // 마우스 이벤트가 시작 되었음을 플레그에 설정하고 플레이어 전체 화면 구간 선택 마우스 이벤트를 등록한다.
    onRangeDown(range_type, event) {
      this.pause();
      this.setCurrentRangPosition();
      this.move_range_type = range_type;
      if (event.type !== 'touchstart') {
        if (this.move_range_type === this.RANGE_TYPE_END) {
          this.range_action_gap = -event.layerX;
        } else {
          this.range_action_gap = this.range_selector_width - event.layerX;
        }
      } else {
        event.preventDefault();
      }
      this.setGlobalRangeMouseEvent(event);
    },

    // 구간선택 현재 값 저장
    setCurrentRangPosition() {
      this.range_start_x = this.$refs.progressRangeStart.offsetLeft;
      this.range_end_x = this.$refs.progressRangeEnd.offsetLeft;
      this.progress_bar_width = this.$refs.progressControl.clientWidth;
    },

    // 플레이어 전체 화면 구간 선택 마우스 이벤트를 등록한다.
    setGlobalRangeMouseEvent(event) {
      if (event.type === 'touchstart') {
        document.addEventListener('touchmove', this.globalRangeMouseMoveEvent, { passive: false });
        document.addEventListener('touchend', this.globalRangeMouseEventEnd);
      } else {
        this.$refs.globalEventTarget.addEventListener('mousemove', this.globalRangeMouseMoveEvent);
        this.$refs.globalEventTarget.addEventListener('mouseup', this.globalRangeMouseEventEnd);
        this.$refs.globalEventTarget.addEventListener('mouseout', this.globalRangeMouseEventEnd);
      }
      this.is_global_event_on = true;
    },

    // 구간선택 클릭 후 플레이어 화면 전체의 마우스 움직임 이벤트 처리
    globalRangeMouseMoveEvent(event) {
      if (event.type === 'touchmove') {
        event.preventDefault();
        if (this.move_range_type === this.RANGE_TYPE_START) {
          this.setRangeStart(event.changedTouches[0].clientX - this.object_offset_info.progressRangeStart);
        } else if (this.move_range_type === this.RANGE_TYPE_END) {
          this.setRangeEnd(event.changedTouches[0].clientX - this.object_offset_info.progressRangeEnd);
        } else {
          this.globalRangeMouseEventEnd();
        }
      } else {
        let relative_x = event.offsetX - this.progress_bar_start_x + this.range_action_gap;
        if (relative_x < 0) {
          relative_x = 0;
        } else if (relative_x > this.progress_bar_width) {
          relative_x = this.progress_bar_width;
        }
        if (this.move_range_type === this.RANGE_TYPE_START) {
          this.setRangeStart(relative_x);
        } else if (this.move_range_type === this.RANGE_TYPE_END) {
          this.setRangeEnd(relative_x);
        } else {
          this.globalRangeMouseEventEnd();
        }
      }
    },
    // 플레이어 전체 구간선택 이벤트 종료
    globalRangeMouseEventEnd(event) {
      this.is_global_event_on = false;
      if (this.move_range_type === this.RANGE_TYPE_START) {
        this.player.currentTime(this.c_range_start_time);
      } else {
        this.player.currentTime(this.c_range_end_time);
      }
      this.move_range_type = this.RANGE_TYPE_NONE;
      if (event.type === 'touchend') {
        document.removeEventListener('touchmove', this.globalRangeMouseMoveEvent, { passive: false });
        document.removeEventListener('touchend', this.globalRangeMouseEventEnd);
      } else {
        this.$refs.globalEventTarget.removeEventListener('mousemove', this.globalRangeMouseMoveEvent);
        this.$refs.globalEventTarget.removeEventListener('mouseup', this.globalRangeMouseEventEnd);
        this.$refs.globalEventTarget.removeEventListener('mouseout', this.globalRangeMouseEventEnd);
      }
      this.$emit('onRangeChange', this.getSelectedRange());
    },
    // RangeSelect Mouse Event Start =============================================

    // UI Control Functions Start ================================================
    // 볼륨 변경사항 ui 반영. player.volume 으로 볼륨 조정
    setVolume(volume, is_mute) {
      if (volume < 0) {
        volume = 0;
      } else if (volume > 1) {
        volume = 1;
      }
      this.volume_percent_str = `${(volume * 3).toFixed(2)}em`;
      if (!is_mute) {
        this.prev_volume = volume;
        this.player.volume(volume);
      }
      this.player.muted(is_mute);
      this.is_muted = is_mute;
    },

    // 구간선택 시작 엘리먼트 위치 변경
    setRangeStart(relative_mouse_x) {
      if (relative_mouse_x === this.range_start_x) {
        // pass
        return;
      } else if (relative_mouse_x > this.range_end_x) {
        this.range_start_x = this.range_end_x;
        this.move_range_type = this.RANGE_TYPE_END;
      } else {
        if (relative_mouse_x < 0) {
          relative_mouse_x = 0;
        }
        this.range_start_x = relative_mouse_x;
      }
      this.player.currentTime(this.c_range_start_time);
    },

    // 구간선택 종료 엘리먼트 위치 변경
    setRangeEnd(relative_mouse_x) {
      if (relative_mouse_x === this.range_end_x) {
        return;
      } else if (relative_mouse_x < this.range_start_x) {
        this.range_end_x = this.range_start_x;
        this.move_range_type = this.RANGE_TYPE_START;
      } else {
        if (relative_mouse_x > this.progress_bar_width) {
          relative_mouse_x = this.progress_bar_width;
        }
        this.range_end_x = relative_mouse_x;
      }
      this.player.currentTime(this.c_range_end_time);
    },

    // 진행상태 ui에 반영
    setProgress() {
      this.current_time = this.player.currentTime();
      this.current_time_str = this.getTimeStr(this.current_time);
      this.progress_percent = this.duration <= 0 ? 0 : this.getPercent(this.current_time, this.duration);
    },

    setDuration() {
      if (!this.duration && this.player.duration()) {
        this.duration = this.player.duration();
        this.total_time = this.getTimeStr(this.duration);
        this.$emit('onStreamSourceChange', this.duration);
        if (this.start_time > 0) {
          this.player.currentTime(this.start_time);
        }
        this.setEventListener();
        this.play();
      }
    },

    // 설정메뉴 열기
    showSettingMenu() {
      this.is_setting_menu_on = true;
    },

    // 설정메뉴 닫기
    hideSettingMenu() {
      this.onMenuBackClick(null);
      this.is_setting_menu_on = false;
    },

    // 전체화면
    openFullscreen(target_element) {
      if (target_element.requestFullscreen) {
        target_element.requestFullscreen();
      } else if (target_element.mozRequestFullScreen) { /* Firefox */
        target_element.mozRequestFullScreen();
      } else if (target_element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        target_element.webkitRequestFullscreen();
      } else if (target_element.msRequestFullscreen) { /* IE/Edge */
        target_element.msRequestFullscreen();
      } else {
        return;
      }
      this.is_fullscreen = true;

      document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
      document.addEventListener('mozfullscreenchange', this.onFullScreenChange, false);
      document.addEventListener('MSFullscreenChange', this.onFullScreenChange, false);
      document.addEventListener('fullscreenchange', this.onFullScreenChange, false);
    },

    onFullScreenChange() {
      const fullscreen_element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
      if (!fullscreen_element) {
        this.onCloseFullScreen();
      }
    },

    // 전체화면 닫기
    closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      } else {
        return;
      }
      this.onCloseFullScreen();
    },

    onCloseFullScreen() {
      this.is_fullscreen = false;

      document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange, false);
      document.removeEventListener('mozfullscreenchange', this.onFullScreenChange, false);
      document.removeEventListener('MSFullscreenChange', this.onFullScreenChange, false);
      document.removeEventListener('fullscreenchange', this.onFullScreenChange, false);
    },

    changeFullScreenStatus(is_fullscreen) {
      this.is_fullscreen = is_fullscreen;
    },

    changeWideScreenStatus(is_wide_screen) {
      this.is_wide_screen = is_wide_screen;
    },

    getPercent(current, total) {
      const _current = current.toFixed(3);
      const _total = total.toFixed(3);
      // this.$log.debug(current, total, (_current / _total) * 100);
      if (total <= 0) {
        return '0%';
      }
      return `${((_current / _total) * 100).toFixed(2)}%`;
    },

    getTimeStr(time) {
      if (!time) {
        time = 0;
      }
      const hour = Math.floor(time / 3600);
      const minute = Math.floor((time % 3600) / 60);
      const second = Math.floor(time % 60);
      let time_str = '';

      if (hour > 0) {
        time_str += `${hour}:`;
        if (minute >= 10) {
          time_str += minute;
        } else if (minute > 0) {
          time_str += `0${minute}`;
        } else {
          time_str += '00';
        }
      } else {
        time_str += minute;
      }

      time_str += ':';
      if (second >= 10) {
        time_str += second;
      } else if (second > 0) {
        time_str += `0${second}`;
      } else {
        time_str += '00';
      }

      return time_str;
    },

    nl2br(str) {
      if (typeof str === 'undefined' || str === null) {
        return '';
      }
      const breakTag = '<br />';
      const replaced = (`${str}`).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`);
      return replaced;
    },
    onConfirmTimeChange() {
      EventBus.emit('onConfirmTimeChange', 'modify');
    },
  },
};
</script>

<style scoped>
.shortcut_position {
  position: absolute;
  bottom: 3em;
  right: 1em;
  width: 320px;
  z-index: 1500;
  max-height: 500px;
  min-height: 200px;
  height: 50%;
}

.play_large_icon_layer {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 10;
  opacity: 0;
  cursor: default;
}
.play_large_icon_layer.on {
  cursor: pointer;
  opacity: 1;
}
.play_large_icon_layer > .play_large_icon {
  position: relative;
  color: #ffffff;
  font-size: 50px;
  width: 60px;
  height: 60px;
  line-height: 1;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 30px;
  transform-origin: center center;
  transform: scale(0.5, 0.5);
}
.play_large_icon_layer > .play_large_icon.on {
  animation: ani_play_large_icon 0.8s;
}
@keyframes ani_play_large_icon {
  0% { opacity: 0; transform: scale(0.5, 0.5); }
  80% { opacity: 1; transform: scale(1, 1); }
  100% { opacity: 0; transform: scale(1.2, 1.2); }
}
/*.play_large_icon_layer:hover > .play_large_icon {*/
/*  opacity: 1;*/
/*  transition-duration: 1s;*/
/*}*/
.play_large_icon_layer > .play_large_icon::after {
  position: absolute;
  content: '';
  background-image: url("/img/icon/player/btn_play.png");
  background-size: contain;
  left: 30%;
  top: 25%;
  width: 50%;
  height: 50%;
}
/*.play_large_icon_layer > .play_large_icon.play {*/
/*  opacity: 0;*/
/*}*/
/*.play_large_icon_layer:hover > .play_large_icon.play {*/
/*  opacity: 1;*/
/*}*/
.play_large_icon_layer > .play_large_icon.play::after {
  left: 25%;
  content: '';
  background-image: url("/img/icon/player/btn_stop.png");
}

.view_wrapper {

}
.mteg_water_mark {position: absolute; bottom: 18px; right: 48px; opacity: 0.3; transform-origin: right bottom; z-index: 10; transform: scale(1.5);}
.preview_clip_text {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: 1920px;
  text-align: center;
  transform-origin: center bottom;
  z-index: 4;
}
.preview_clip_text>div {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 36px;
  color: #fff;
  max-width: 1200px;
  padding: 18px;
  text-align: left;
}

.addon_container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 10;
  pointer-events: none;
}

.addon_container .addon {
  display: flex;
  flex-direction: column;
  pointer-events: none;
  opacity: 0;
}
.addon_container .addon.active {
  pointer-events: all;
  opacity: 1;
}
.control-right .time_change_btn {
  /*margin-right: 7px;*/
  font-weight: 400;
  font-size: 12px;
  color: #FFFFFF;
  display: inline-flex;
}
</style>
