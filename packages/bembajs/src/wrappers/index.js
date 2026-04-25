// Component wrapper registry
const reactWrapper = require('./react-wrapper.js');
const shadcnWrapper = require('./shadcn-wrapper.js');
const muiWrapper = require('./mui-wrapper.js');
const chakraWrapper = require('./chakra-wrapper.js');

/**
 * Wrapper registry for different UI libraries
 */
const WRAPPER_REGISTRY = {
    react: reactWrapper,
    shadcn: shadcnWrapper,
    mui: muiWrapper,
    chakra: chakraWrapper
};

/**
 * Get wrapper for a component from a specific library
 */
function getWrapper(library, componentName) {
    const libraryWrappers = WRAPPER_REGISTRY[library];
    
    if (!libraryWrappers) {
        console.warn(`[BembaJS] Unknown library: ${library}`);
        return reactWrapper.wrapReactComponent;
    }
    
    // Try to get specific wrapper function
    const getWrapperFunc = libraryWrappers[`get${capitalize(library)}Wrapper`];
    if (getWrapperFunc) {
        return getWrapperFunc(componentName);
    }
    
    // Fallback to generic wrapper
    return reactWrapper.wrapReactComponent;
}

/**
 * Wrap a component with appropriate wrapper
 */
function wrapComponent(library, componentName, bembaProps) {
    const wrapper = getWrapper(library, componentName);
    return wrapper(bembaProps);
}

/**
 * Register custom wrapper
 */
function registerWrapper(library, componentName, wrapperFunction) {
    if (!WRAPPER_REGISTRY[library]) {
        WRAPPER_REGISTRY[library] = {};
    }
    
    WRAPPER_REGISTRY[library][`wrap${componentName}`] = wrapperFunction;
    console.log(`[BembaJS] Registered wrapper for ${library}.${componentName}`);
}

/**
 * Helper function to capitalize string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    reactWrapper,
    shadcnWrapper,
    muiWrapper,
    chakraWrapper,
    WRAPPER_REGISTRY,
    getWrapper,
    wrapComponent,
    registerWrapper
};

module.exports.default = module.exports;

