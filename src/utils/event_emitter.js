import Events from 'events';

export default class {
  event_bus;

  constructor() {
    this.event_bus = new Events.EventEmitter();
    this.event_bus.setMaxListeners(0);
  }

  getEventBus = () => this.event_bus;

  clearEvent = () => {
    if (this.event_bus) {
      this.event_bus.removeAllListeners();
    }
    this.event_bus = null;
  }
  on = (event_type, handler) => {
    if (this.event_bus) {
      this.event_bus.on(event_type, handler);
    }
  }
  off = (event_type = null, handler = null) => {
    if (this.event_bus) {
      if (!event_type) {
        this.event_bus.removeAllListeners();
      } else if (!handler) {
        this.event_bus.removeAllListeners(event_type);
      } else {
        this.event_bus.removeListener(event_type, handler);
      }
    }
  }
  emit = (event_type, ...args) => {
    if (this.event_bus) {
      this.event_bus.emit(event_type, ...args);
    }
  }
}
