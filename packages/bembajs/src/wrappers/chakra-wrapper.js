// Chakra UI component wrappers
import { wrapReactComponent } from './react-wrapper.js';

/**
 * Wrap Chakra Button component
 */
export function wrapChakraButton(bembaProps) {
    const props = {
        ...bembaProps,
        onClick: bembaProps.pakuKlikisha,
        className: bembaProps.imikalile,
        colorScheme: bembaProps.colorScheme || bembaProps.color || 'blue',
        variant: bembaProps.variant || 'solid',
        size: bembaProps.size || 'md',
        isDisabled: bembaProps.disabled || bembaProps.isDisabled,
        isLoading: bembaProps.loading || bembaProps.isLoading,
        children: bembaProps.ifika || bembaProps.ilembo
    };
    
    // Remove Bemba-specific props
    delete props.pakuKlikisha;
    delete props.imikalile;
    delete props.ifika;
    delete props.ilembo;
    
    return props;
}

/**
 * Wrap Chakra Input component
 */
export function wrapChakraInput(bembaProps) {
    const props = {
        ...bembaProps,
        onChange: bembaProps.pakuLemba,
        onFocus: bembaProps.pakuIngia,
        onBlur: bembaProps.pakuFuma,
        className: bembaProps.imikalile,
        placeholder: bembaProps.placeholder,
        value: bembaProps.value,
        defaultValue: bembaProps.defaultValue,
        type: bembaProps.type || 'text',
        size: bembaProps.size || 'md',
        variant: bembaProps.variant || 'outline',
        isDisabled: bembaProps.disabled || bembaProps.isDisabled,
        isReadOnly: bembaProps.readOnly || bembaProps.isReadOnly,
        isRequired: bembaProps.required || bembaProps.isRequired
    };
    
    // Remove Bemba-specific props
    delete props.pakuLemba;
    delete props.pakuIngia;
    delete props.pakuFuma;
    delete props.imikalile;
    
    return props;
}

/**
 * Wrap Chakra Box component
 */
export function wrapChakraBox(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        children: bembaProps.ifika
    };
    
    // Chakra Box supports style props directly
    if (bembaProps.width) props.w = bembaProps.width;
    if (bembaProps.height) props.h = bembaProps.height;
    if (bembaProps.padding) props.p = bembaProps.padding;
    if (bembaProps.margin) props.m = bembaProps.margin;
    
    delete props.imikalile;
    delete props.ifika;
    
    return props;
}

/**
 * Wrap Chakra Stack component
 */
export function wrapChakraStack(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        direction: bembaProps.direction || 'column',
        spacing: bembaProps.spacing || 4,
        align: bembaProps.align,
        justify: bembaProps.justify,
        children: bembaProps.ifika
    };
    
    delete props.imikalile;
    delete props.ifika;
    
    return props;
}

/**
 * Wrap Chakra Modal component
 */
export function wrapChakraModal(bembaProps) {
    const props = {
        ...bembaProps,
        isOpen: bembaProps.open || bembaProps.wasalwa || bembaProps.isOpen,
        onClose: bembaProps.pakuFuma || bembaProps.onClose,
        size: bembaProps.size || 'md',
        isCentered: bembaProps.isCentered !== false,
        children: bembaProps.ifika
    };
    
    delete props.pakuFuma;
    delete props.wasalwa;
    delete props.ifika;
    
    return props;
}

/**
 * Wrap Chakra Select component
 */
export function wrapChakraSelect(bembaProps) {
    const props = {
        ...bembaProps,
        onChange: bembaProps.pakuCinja,
        value: bembaProps.value,
        defaultValue: bembaProps.defaultValue,
        placeholder: bembaProps.placeholder,
        size: bembaProps.size || 'md',
        variant: bembaProps.variant || 'outline',
        isDisabled: bembaProps.disabled || bembaProps.isDisabled,
        isRequired: bembaProps.required || bembaProps.isRequired,
        children: bembaProps.ifika
    };
    
    delete props.pakuCinja;
    delete props.imikalile;
    delete props.ifika;
    
    return props;
}

/**
 * Wrap Chakra Text component
 */
export function wrapChakraText(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        fontSize: bembaProps.fontSize || bembaProps.size,
        fontWeight: bembaProps.fontWeight,
        color: bembaProps.color,
        children: bembaProps.ifika || bembaProps.ilyashi
    };
    
    delete props.imikalile;
    delete props.ifika;
    delete props.ilyashi;
    
    return props;
}

/**
 * Wrap Chakra Heading component
 */
export function wrapChakraHeading(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        size: bembaProps.size || 'md',
        as: bembaProps.as || 'h2',
        children: bembaProps.ifika || bembaProps.umutwe
    };
    
    delete props.imikalile;
    delete props.ifika;
    delete props.umutwe;
    
    return props;
}

/**
 * Get wrapper for Chakra UI component
 */
export function getChakraWrapper(componentName) {
    const wrappers = {
        Button: wrapChakraButton,
        Input: wrapChakraInput,
        Box: wrapChakraBox,
        Stack: wrapChakraStack,
        Modal: wrapChakraModal,
        Select: wrapChakraSelect,
        Text: wrapChakraText,
        Heading: wrapChakraHeading
    };
    
    return wrappers[componentName] || wrapReactComponent;
}

export default {
    wrapChakraButton,
    wrapChakraInput,
    wrapChakraBox,
    wrapChakraStack,
    wrapChakraModal,
    wrapChakraSelect,
    wrapChakraText,
    wrapChakraHeading,
    getChakraWrapper
};

