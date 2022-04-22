import _ from 'lodash';
import numeral from 'numeral';
import language from '../language';
import string_template from 'string-template';
import moment from 'moment-timezone';
// import fuzzysort from 'fuzzysort';
import logger from '../utils/logger';
import * as Constants from '../constants';
import Vue from 'vue';

const getLanguage = (lang, name) => {
  let language_map = null;
  if (lang && language[name]) {
    lang = lang.toLowerCase();
    language_map = language[name][lang];
    if (!language_map) {
      language_map = language[name].kor;
    }
  }
  return !language_map ? {} : language_map;
};

const replaceByTemplate = (template, template_data) => string_template(template, template_data);

const trim = (value) => {
  if (!value) {
    return '';
  }
  return _.trim(value);
};
const getInt = (str, on_error_result = 0) => {
  if (isNumber(str)) {
    try {
      return parseInt(str, 10);
    } catch (e) {
      return on_error_result;
    }
  } else {
    return on_error_result;
  }
};

const getFloat = (str, on_error_result = 0) => {
  if (isNumber(str)) {
    try {
      return parseFloat(str);
    } catch (e) {
      return on_error_result;
    }
  } else {
    return on_error_result;
  }
};

const isNumber = (str) => {
  try {
    return !isNaN(parseFloat(str)) && isFinite(str);
  } catch (e) {
    return false;
  }
};

const getCurrentTimestamp = () => {
  const now = Date.now();
  return Math.floor(now / 1000);
};

const fileSizeText = (size, zero = '-') => {
  size = getFloat(size, 0);
  if (size === 0) {
    return zero;
  }
  const kb = 1024;
  const mb = 1024 * kb;
  const gb = 1024 * mb;
  const tb = 1024 * gb;

  let file_size = size;
  let suffix = '';
  if (size >= tb) {
    file_size = size / tb;
    suffix = ' TB';
  } else if (size >= gb) {
    file_size = size / gb;
    suffix = ' GB';
  } else if (size >= mb) {
    file_size = size / mb;
    suffix = ' MB';
  } else if (size >= kb) {
    file_size = size / kb;
    suffix = ' KB';
  }

  if (file_size >= 100) {
    return `${numeral(Math.round(file_size)).format('0,0')} ${suffix}`;
  }
  return `${numeral(Math.floor(file_size * 10) / 10).format('0,0.[0]')} ${suffix}`;
};

function getExtensionOfFilename(filename) {
  const _fileLen = filename.length;
  const _lastDot = filename.lastIndexOf('.');
  // 확장자 명만 추출한 후 소문자로 변경
  const _fileExt = filename.substring(_lastDot, _fileLen).toLowerCase();

  return _fileExt;
}

function getExtNoDot(filename) {
  const dotext = getExtensionOfFilename(filename);
  const ext = dotext.replace(/\./gi, '');
  return ext;
}

const isEmpty = (value) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'object') {
    return _.isEmpty(value);
  }
  if (isNumber(value)) {
    return false;
  }
  if (_.isString(value)) {
    return _.trim(value) === '';
  }
  return _.isEmpty(value);
};

const getStrSec = (str) => {
  Vue.$log.debug('getStrSec', str);
  if (!str) {
    return 0;
  }
  const astr = str.split(':');
  Vue.$log.debug('astr.length', astr.length);
  let iTime = 0;
  if (astr.length > 2) {
    iTime = parseInt(astr[0], 0) * 3600 + parseInt(astr[1], 0) * 60 + parseInt(astr[2], 0);
    Vue.$log.debug('astr.iTime', iTime);
    return iTime;
  }
  if (astr.length > 1) {
    iTime = parseInt(astr[0], 0) * 60 + parseInt(astr[1], 0);
    Vue.$log.debug('astr.iTime', iTime);
    return iTime;
  }
  return iTime;
};

const getTimeStr = (time) => {
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
    if (minute >= 10) {
      time_str += minute;
    } else if (minute > 0) {
      time_str += `0${minute}`;
    } else {
      time_str += '00';
    }
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
};

const getTimeStrHan = (time) => {
  if (!time) {
    time = 0;
  }
  const hour = Math.floor(time / 3600);
  const minute = Math.floor((time % 3600) / 60);
  const second = Math.floor(time % 60);
  let time_str = '';

  if (hour > 0) {
    time_str += `${hour} 시간 `;
    if (minute >= 10) {
      time_str += `${minute} 분 `;
    } else if (minute > 0) {
      time_str += `0${minute} 분 `;
    } else {
      time_str += '00 분 ';
    }
  } else {
    time_str += `${minute} 분 `;
  }

  time_str += '';
  if (second >= 10) {
    time_str += `${second} 초`;
  } else if (second > 0) {
    time_str += `0${second} 초`;
  } else {
    time_str += '00 초';
  }

  return time_str;
};

const downloadFile = (document, file_name, download_url) => {
  let link = document.createElement('a');
  link.download = `${file_name}`;
  link.href = download_url;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link = null;
};

const rgbToHex = (red, green, blue) => {
  let color = red;
  color = color * 256 + green;
  color = color * 256 + blue;

  return `#${color.toString(16).substr(-6).toLowerCase()}`;
};

const RANDOM_KEY_SPACE = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const getRandomString = (length = 10) => {
  let str = '';
  const space_length = RANDOM_KEY_SPACE.length;
  for (let i = 0; i < length; i++) {
    str += RANDOM_KEY_SPACE[Math.floor(Math.random() * space_length)];
  }
  return str;
};
const getRandomId = () => `${Math.floor(Date.now() / 1000)}_${getRandomString(5)}`;
const getRandomIdNoDash = () => `A${Math.floor(Date.now() / 1000)}${getRandomString(5)}`;
const getRandomNum = () => `${Math.floor(Date.now() / 1000)}`;

const checkPasswordComplexity = (password) => {
  if (!_.trim(password)) {
    return false;
  }
  const pass_regex = /(?=.*\d{1,})(?=.*[~`!@#$%^&*()-+=_]{1,})(?=.*[a-zA-Z]{1,}).{8,}$/;
  return pass_regex.test(password);
};

const getCurrentTimeZone = () => moment.tz.guess();

const getPlantStatusName = (idx) => {
  let result = '';
  switch (idx) {
    case 1:
      result = '활착기';
      break;
    case 2:
      result = '성장기';
      break;
    case 3:
      result = '수확기';
      break;
    default:
      result = '';
      break;
  }
  return result;
};

const getDateToStr = (date) => {
  if (!date || date.length < 10) {
    return date;
  }
  return date.substr(0,10).replaceAll('-','.');
};

const getDateTimeToStr = (date) => {
  if (!date || date.length < 18) {
    return date;
  }
  date = date.replace('T', ' ');
  const d = date.substr(0,10).replaceAll('-','.');
  const t = date.substr(11,8);
  return `${d} ${t}`;
};

const getMemberStatusStr = (status) => {
  let result = '가입대기';
  switch (status) {
    case 1:
      result = '가입완료';
      break;
    case 2:
      result = '강제탈퇴';
      break;
    case 3:
      result = '탈퇴';
      break;
    case 4:
      result = '휴면상태';
      break;
    case 5:
      result = '사용중지';
      break;
    case 6:
      result = '승인거절';
      break;
    default:
      result = '가입대기';
      break;
  }
  return result;
};

const formatSecToTime = (sec, zero_hour_remove = false) => {
  if (sec !== 0 && !sec) return null;

  const time = new Date(sec * 1000);
  if (zero_hour_remove) {
    if (time.getUTCHours() === 0) {
      return time.toISOString().substr(14, 5);
    }
  }
  return time.toISOString().substr(11, 8);
};

const formatSecToTimeKOR = (sec) => {
  const date_str = formatSecToTime(sec);
  if (!date_str) return null;
  return date_str.replace(/([0-9]+):([0-9]+):([0-9]+)/gi, '$1시$2분$3초');
};
const numberFormat = (num) => {
  if (!num) {
    return '0';
  }
  return numeral(num).format('0,0.[0]');
};

const numberString = (num) => {
  if (!num) {
    return '0';
  }
  let numstr = 0;
  if (num > 1000) {
    numstr = `${numberFormat((num / 1000).toFixed(1))}K`;
  } else {
    numstr = numberFormat(num);
  }
  return numstr;
};
const setNumberPad = (target_num, pad_length = 2) => {
  const target_num_length = target_num.toString().length;
  return target_num_length >= pad_length ? target_num : new Array(pad_length - target_num_length + 1).join('0') + target_num;
};

const getDateStr = date_str => date_str.substr(0, 10);

const getDateStr2 = (date_str, lang = 'Kor') => {
  let str = '';
  const date = new Date(date_str);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (lang === 'Kor') {
    str = `${year}년 ${month.toString().length === 1 ? `0${month}` : `${month}`}월 ${day.toString().length === 1 ? `0${day}` : `${day}`}일`;
  } else {
    str = `${year}.${month}.${day}`;
  }
  return str;
};

const getDateStr3 = (date_str, type) => {
  let str = '';
  const date = new Date(date_str);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (type === 'date') {
    str = `${year}-${setNumberPad(month)}-${setNumberPad(day)}`;
  } else if (type === 'datetime') {
    str = `${year}-${setNumberPad(month)}-${setNumberPad(day)} ${setNumberPad(hour)}:${setNumberPad(minute)}:${setNumberPad(second)}`;
  } else if (type === 'datetime_nosec') {
    str = `${year}-${setNumberPad(month)}-${setNumberPad(day)} ${setNumberPad(hour)}:${setNumberPad(minute)}`;
  }
  return str;
};

const getProfileImagePath = (image_path, seq = 0, is_group = false) => {
  let default_profile_image = '/img/renewal/mentoring/person.png';
  if (seq) {
    const no = seq % 5 + 1;
    if (is_group) {
      default_profile_image = `/img/renewal/profile/profile_no${no}.png`;
    } else {
      default_profile_image = `/img/renewal/profile/profile_no${no}.png`;
    }
  }
  image_path = trim(image_path);
  if (!image_path) {
    return default_profile_image;
  }
  return image_path;
};
export default {
  getLanguage,
  replaceByTemplate,
  trim,
  getInt,
  getFloat,
  isNumber,
  getCurrentTimestamp,
  fileSizeText,
  getExtensionOfFilename,
  getExtNoDot,
  isEmpty,
  getTimeStr,
  getTimeStrHan,
  getStrSec,
  downloadFile,
  rgbToHex,
  getRandomId,
  getRandomNum,
  getRandomIdNoDash,
  checkPasswordComplexity,
  getCurrentTimeZone,
  getPlantStatusName,
  getDateToStr,
  getMemberStatusStr,
  getDateTimeToStr,
  formatSecToTime,
  formatSecToTimeKOR,
  numberFormat,
  numberString,
  setNumberPad,
  getDateStr,
  getDateStr2,
  getDateStr3,
  getProfileImagePath,
};
