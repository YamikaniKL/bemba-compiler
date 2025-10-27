// Component wrapper registry
import * as reactWrapper from './react-wrapper.js';
import * as shadcnWrapper from './shadcn-wrapper.js';
import * as muiWrapper from './mui-wrapper.js';

/**
 * Wrapper registry for different UI libraries
 */
export const WRAPPER_REGISTRY = {
    react: reactWrapper,
    shadcn: shadcnWrapper,
    mui: muiWrapper
};

/**
 * Get wrapper for a component from a specific library
 */
export function getWrapper(library, componentName) {
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
export function wrapComponent(library, componentName, bembaProps) {
    const wrapper = getWrapper(library, componentName);
    return wrapper(bembaProps);
}

/**
 * Register custom wrapper
 */
export function registerWrapper(library, componentName, wrapperFunction) {
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

// Export individual wrappers
export { reactWrapper, shadcnWrapper, muiWrapper };

// Export wrapper functions
export * from './react-wrapper.js';
export * from './shadcn-wrapper.js';
export * from './mui-wrapper.js';

export default {
    getWrapper,
    wrapComponent,
    registerWrapper,
    WRAPPER_REGISTRY
};

