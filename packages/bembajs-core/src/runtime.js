// Runtime library for BembaJS framework - provides Bemba hooks and component utilities
const { BEMBA_SYNTAX } = require('./constants');

class BembaRuntime {
    constructor() {
        this.hooks = new Map();
        this.components = new Map();
        this.routes = new Map();
        this.contexts = new Map();
    }
    
    // Hook implementations
    bomfyaFyakubika(initialValue) {
        // useState equivalent
        const [state, setState] = React.useState(initialValue);
        return [state, setState];
    }
    
    bomfyaCintikoLya(effect, dependencies = []) {
        // useEffect equivalent
        React.useEffect(effect, dependencies);
    }
    
    bomfyaUkwikala(context) {
        // useContext equivalent
        return React.useContext(context);
    }
    
    bomfyaUkusangula(initialValue) {
        // useRef equivalent
        return React.useRef(initialValue);
    }
    
    bomfyaUkukonkelesha(reducer, initialState) {
        // useReducer equivalent
        return React.useReducer(reducer, initialState);
    }
    
    bomfyaUkwipaya(factory, dependencies) {
        // useMemo equivalent
        return React.useMemo(factory, dependencies);
    }
    
    bomfyaUkubomfya(callback, dependencies) {
        // useCallback equivalent
        return React.useCallback(callback, dependencies);
    }
    
    // Component utilities
    fyambaIcipanda(name, config) {
        // Component factory
        const component = {
            name,
            config,
            hooks: [],
            lifecycle: {},
            methods: {}
        };
        
        this.components.set(name, component);
        return component;
    }
    
    pangaIpepa(config) {
        // Page factory
        const page = {
            config,
            component: null,
            dataFetching: null,
            isDynamic: false
        };
        
        return page;
    }
    
    // Routing utilities
    ukuya(path) {
        // Navigate to path
        if (typeof window !== 'undefined' && window.router) {
            window.router.push(path);
        }
    }
    
    ukubwelela() {
        // Go back
        if (typeof window !== 'undefined' && window.router) {
            window.router.back();
        }
    }
    
    // State management utilities
    pangaCibukisho(initialState) {
        // Create store
        const store = {
            state: initialState,
            listeners: new Set(),
            getState: () => store.state,
            setState: (newState) => {
                store.state = { ...store.state, ...newState };
                store.listeners.forEach(listener => listener(store.state));
            },
            subscribe: (listener) => {
                store.listeners.add(listener);
                return () => store.listeners.delete(listener);
            }
        };
        
        return store;
    }
    
    // Event handling utilities
    umfwikisha(element, event, handler) {
        // Add event listener
        if (element && element.addEventListener) {
            element.addEventListener(event, handler);
        }
    }
    
    fumyaKumfwa(element, event, handler) {
        // Remove event listener
        if (element && element.removeEventListener) {
            element.removeEventListener(event, handler);
        }
    }
    
    // DOM utilities
    sanga(selector) {
        // Query selector
        if (typeof document !== 'undefined') {
            return document.querySelector(selector);
        }
        return null;
    }
    
    sangaFyonse(selector) {
        // Query selector all
        if (typeof document !== 'undefined') {
            return document.querySelectorAll(selector);
        }
        return [];
    }
    
    pangaCipandwa(tagName) {
        // Create element
        if (typeof document !== 'undefined') {
            return document.createElement(tagName);
        }
        return null;
    }
    
    bikapoMwana(parent, child) {
        // Append child
        if (parent && child) {
            parent.appendChild(child);
        }
    }
    
    fumyaMwana(parent, child) {
        // Remove child
        if (parent && child) {
            parent.removeChild(child);
        }
    }
    
    // Utility functions
    londolola(message) {
        // Alert
        if (typeof window !== 'undefined') {
            alert(message);
        }
    }
    
    monako(message) {
        // Console log
        console.log(message);
    }
    
    soka(message) {
        // Console warn
        console.warn(message);
    }
    
    ububi(message) {
        // Console error
        console.error(message);
    }
    
    // Data fetching utilities
    ukutuma(url, options = {}) {
        // Fetch wrapper
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
    }
    
    // Storage utilities
    ukubikaMucibukisho(key, value) {
        // Local storage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
    
    ukutolaMucibukisho(key) {
        // Get from local storage
        if (typeof localStorage !== 'undefined') {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        }
        return null;
    }
    
    ukubikaPanshita(key, value) {
        // Session storage
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    }
    
    ukutolaPanshita(key) {
        // Get from session storage
        if (typeof sessionStorage !== 'undefined') {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        }
        return null;
    }
    
    // Timer utilities
    panshita(callback, delay) {
        // Set timeout
        return setTimeout(callback, delay);
    }
    
    lyonse(callback, interval) {
        // Set interval
        return setInterval(callback, interval);
    }
    
    lekaPanshita(id) {
        // Clear timeout
        clearTimeout(id);
    }
    
    lekaLyonse(id) {
        // Clear interval
        clearInterval(id);
    }
    
    // Array utilities
    bikapo(array, ...items) {
        // Push
        return array.push(...items);
    }
    
    fumyapo(array) {
        // Pop
        return array.pop();
    }
    
    tandikila(array, ...items) {
        // Unshift
        return array.unshift(...items);
    }
    
    fumyatanshi(array) {
        // Shift
        return array.shift();
    }
    
    pilibula(array) {
        // Reverse
        return array.reverse();
    }
    
    sankanisha(array, compareFn) {
        // Sort
        return array.sort(compareFn);
    }
    
    lungika(array, predicate) {
        // Filter
        return array.filter(predicate);
    }
    
    pilibwila(array, mapper) {
        // Map
        return array.map(mapper);
    }
    
    konkelesha(array, reducer, initialValue) {
        // Reduce
        return array.reduce(reducer, initialValue);
    }
    
    fikishapo(array, item) {
        // Includes
        return array.includes(item);
    }
    
    sangapo(array, predicate) {
        // Find
        return array.find(predicate);
    }
    
    sangapoPo(array, predicate) {
        // Find index
        return array.findIndex(predicate);
    }
    
    ilambalamba(array, start, end) {
        // Slice
        return array.slice(start, end);
    }
    
    bikamoPo(array, start, deleteCount, ...items) {
        // Splice
        return array.splice(start, deleteCount, ...items);
    }
    
    lampanya(array, ...arrays) {
        // Concat
        return array.concat(...arrays);
    }
    
    lumbula(array, separator) {
        // Join
        return array.join(separator);
    }
    
    // Context utilities
    pangaCintiko(defaultValue) {
        // Create context
        const context = React.createContext(defaultValue);
        this.contexts.set(context, defaultValue);
        return context;
    }
    
    // Error handling utilities
    esha(tryBlock) {
        // Try block
        try {
            return tryBlock();
        } catch (error) {
            this.ububi(`Error: ${error.message}`);
            throw error;
        }
    }
    
    ikata(catchBlock) {
        // Catch block
        return (error) => {
            this.ububi(`Caught error: ${error.message}`);
            return catchBlock(error);
        };
    }
    
    pwishako(finallyBlock) {
        // Finally block
        return () => {
            try {
                return finallyBlock();
            } catch (error) {
                this.ububi(`Finally block error: ${error.message}`);
            }
        };
    }
    
    posaUbubi(error) {
        // Throw error
        throw new Error(error);
    }
    
    // Type checking utilities
    icishilano(value) {
        // Check if string
        return typeof value === 'string';
    }
    
    impendwa(value) {
        // Check if number
        return typeof value === 'number' && !isNaN(value);
    }
    
    icilonganino(value) {
        // Check if object
        return typeof value === 'object' && value !== null;
    }
    
    ukukwata(value) {
        // Check if boolean
        return typeof value === 'boolean';
    }
    
    // Initialize runtime
    initialize() {
        // Set up global Bemba runtime
        if (typeof global !== 'undefined') {
            global.BembaRuntime = this;
        }
        
        if (typeof window !== 'undefined') {
            window.BembaRuntime = this;
        }
        
        // Set up React integration
        if (typeof React !== 'undefined') {
            this.setupReactIntegration();
        }
    }
    
    setupReactIntegration() {
        // Create React context for Bemba runtime
        const BembaContext = React.createContext(this);
        
        // Create provider component
        const BembaProvider = ({ children }) => {
            return React.createElement(BembaContext.Provider, { value: this }, children);
        };
        
        // Create hook to use Bemba runtime
        const useBemba = () => {
            return React.useContext(BembaContext);
        };
        
        // Export utilities
        this.BembaProvider = BembaProvider;
        this.useBemba = useBemba;
    }
}

// Create global instance
const bembaRuntime = new BembaRuntime();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bembaRuntime;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.BembaRuntime = bembaRuntime;
}

// Auto-initialize
bembaRuntime.initialize();
