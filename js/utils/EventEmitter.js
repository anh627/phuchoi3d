export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, onceWrapper);
        };
        onceWrapper.listener = listener;
        return this.on(event, onceWrapper);
    }

    off(event, listener) {
        if (!this.events[event]) return this;
        
        this.events[event] = this.events[event].filter(l => {
            return l !== listener && l.listener !== listener;
        });
        
        return this;
    }

    emit(event, ...args) {
        if (!this.events[event]) return false;
        
        this.events[event].forEach(listener => {
            listener.apply(this, args);
        });
        
        return true;
    }

    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
        return this;
    }

    listenerCount(event) {
        if (!this.events[event]) return 0;
        return this.events[event].length;
    }

    listeners(event) {
        if (!this.events[event]) return [];
        return this.events[event].slice();
    }
}