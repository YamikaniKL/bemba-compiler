// Material-UI (MUI) component wrappers
import { wrapReactComponent } from './react-wrapper.js';

/**
 * Wrap MUI Button component
 */
export function wrapMuiButton(bembaProps) {
    const props = {
        ...bembaProps,
        onClick: bembaProps.pakuKlikisha,
        className: bembaProps.imikalile,
        variant: bembaProps.variant || 'contained',
        color: bembaProps.color || 'primary',
        size: bembaProps.size || 'medium',
        disabled: bembaProps.disabled,
        children: bembaProps.ifika || bembaProps.ilembo
    };
    
    return props;
}

/**
 * Wrap MUI TextField component
 */
export function wrapMuiTextField(bembaProps) {
    const props = {
        ...bembaProps,
        onChange: bembaProps.pakuLemba,
        onFocus: bembaProps.pakuIngia,
        onBlur: bembaProps.pakuFuma,
        className: bembaProps.imikalile,
        label: bembaProps.umutwe,
        placeholder: bembaProps.placeholder,
        value: bembaProps.value,
        defaultValue: bembaProps.defaultValue,
        type: bembaProps.type || 'text',
        variant: bembaProps.variant || 'outlined',
        fullWidth: bembaProps.fullWidth !== false
    };
    
    return props;
}

/**
 * Wrap MUI Card component
 */
export function wrapMuiCard(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        elevation: bembaProps.elevation || 1,
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Wrap MUI Dialog component
 */
export function wrapMuiDialog(bembaProps) {
    const props = {
        ...bembaProps,
        open: bembaProps.open || bembaProps.wasalwa,
        onClose: bembaProps.pakuFuma,
        fullWidth: bembaProps.fullWidth,
        maxWidth: bembaProps.maxWidth || 'sm',
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Wrap MUI Select component
 */
export function wrapMuiSelect(bembaProps) {
    const props = {
        ...bembaProps,
        onChange: bembaProps.pakuCinja,
        value: bembaProps.value,
        defaultValue: bembaProps.defaultValue,
        label: bembaProps.umutwe,
        variant: bembaProps.variant || 'outlined',
        fullWidth: bembaProps.fullWidth !== false,
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Wrap MUI Typography component
 */
export function wrapMuiTypography(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile,
        variant: bembaProps.variant || 'body1',
        color: bembaProps.color,
        children: bembaProps.ifika || bembaProps.ilyashi
    };
    
    return props;
}

/**
 * Get wrapper for MUI component
 */
export function getMuiWrapper(componentName) {
    const wrappers = {
        Button: wrapMuiButton,
        TextField: wrapMuiTextField,
        Card: wrapMuiCard,
        Dialog: wrapMuiDialog,
        Select: wrapMuiSelect,
        Typography: wrapMuiTypography
    };
    
    return wrappers[componentName] || wrapReactComponent;
}

export default {
    wrapMuiButton,
    wrapMuiTextField,
    wrapMuiCard,
    wrapMuiDialog,
    wrapMuiSelect,
    wrapMuiTypography,
    getMuiWrapper
};

