type Listener = (data?: any) => void;

class ReactNativeEventEmitter {
  private events: Record<string, Listener[]> = {};

  emit(event: string, data?: any): void {
    this.events[event]?.forEach(listener => listener(data));
  }

  on(event: string, listener: Listener): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  removeAllListeners(event?: string): void {
    if (event) {   
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export enum FileEvents {
  FILES_UPDATED = 'FILES_UPDATED',
  CHECK_AUTH = 'CHECK_AUTH',
  CHECK_CONNECTED_USERS = 'CHECK_CONNECTED_USERS',
}

export const fileEventEmitter = new ReactNativeEventEmitter();