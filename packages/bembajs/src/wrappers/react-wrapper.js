// Generic React component wrapper
// Converts Bemba prop names to React prop names

/**
 * Map of Bemba prop names to React prop names
 */
const PROP_MAP = {
    // Event handlers
    pakuKlikisha: 'onClick',
    pakuLemba: 'onChange',
    pakuTumina: 'onSubmit',
    pakuCinja: 'onChange',
    pakuIngia: 'onFocus',
    pakuFuma: 'onBlur',
    pakuKwesha: 'onMouseEnter',
    pakuSiya: 'onMouseLeave',
    
    // Common props
    imikalile: 'className',
    izina: 'name',
    umutwe: 'title',
    ilyashi: 'description',
    ifika: 'children',
    
    // Attributes
    required: 'required',
    disabled: 'disabled',
    placeholder: 'placeholder',
    value: 'value',
    defaultValue: 'defaultValue'
};

/**
 * Wrap Bemba props for React component
 */
export function wrapReactComponent(Component, bembaProps) {
    const reactProps = {};
    
    // Convert Bemba props to React props
    for (const [key, value] of Object.entries(bembaProps)) {
        const reactKey = PROP_MAP[key] || key;
        reactProps[reactKey] = value;
    }
    
    return { Component, props: reactProps };
}

/**
 * Convert event handler string to function
 */
export function convertEventHandler(handlerString) {
    if (typeof handlerString === 'function') {
        return handlerString;
    }
    
    // Wrap handler string in function
    return new Function('event', handlerString);
}

/**
 * Validate component props
 */
export function validateProps(props, schema) {
    const errors = [];
    
    for (const [key, definition] of Object.entries(schema)) {
        const value = props[key];
        
        // Check required props
        if (definition.required && (value === undefined || value === null)) {
            errors.push(`Required prop "${key}" is missing`);
        }
        
        // Check prop types
        if (value !== undefined && definition.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== definition.type) {
                errors.push(`Prop "${key}" expected type "${definition.type}" but got "${actualType}"`);
            }
        }
    }
    
    if (errors.length > 0) {
        console.warn('[BembaJS Wrapper] Validation errors:', errors);
    }
    
    return errors.length === 0;
}

export default {
    wrapReactComponent,
    convertEventHandler,
    validateProps,
    PROP_MAP
};

