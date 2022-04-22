import util from './util';

class LocalStorageClass {
  constructor() {
    this.LOCAL_STORAGE_KEY = 'LOCAL_STORAGE';
    this.LOCAL_STORAGE_LAST_UPDATE_KEY = 'LOCAL_STORAGE_LAST_UPDATE';
    this.storage_map = {};
    this.last_update = '-';
  }
  loadStorageData() {
    const last_update = util.trim(localStorage.getItem(this.LOCAL_STORAGE_LAST_UPDATE_KEY));
    if (last_update !== this.last_update) {
      const storage_data = util.trim(localStorage.getItem(this.LOCAL_STORAGE_KEY));
      this.storage_map = storage_data !== '' ? JSON.parse(storage_data) : {};
      if (last_update === '') {
        this.saveLastUpdateStr();
      }
    }
  }
  saveLastUpdateStr() {
    this.last_update = util.getCurrentTimestamp().toString();
    localStorage.setItem(this.LOCAL_STORAGE_LAST_UPDATE_KEY, this.last_update);
  }
  saveStorageData() {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.storage_map));
    this.saveLastUpdateStr();
  }
  clearCategoryData = (category) => {
    delete this.storage_map[category];
    this.saveStorageData();
  }
  setData = (category, key, value) => {
    this.getCategoryData(category)[key] = value;
    this.saveStorageData();
  }
  getData = (category, key) => this.getCategoryData(category)[key]
  hasData = (category, key) => this.getCategoryData(category)[key] !== undefined;
  getCategoryData = (category) => {
    this.loadStorageData();
    if (!this.storage_map[category]) {
      this.storage_map[category] = {};
    }
    return this.storage_map[category];
  }
}

const LocalStorage = new LocalStorageClass();
export default LocalStorage;
