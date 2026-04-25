// Shadcn/ui component wrappers
const { wrapReactComponent } = require('./react-wrapper.js');

/**
 * Wrap Shadcn/ui Button component
 */
function wrapShadcnButton(bembaProps) {
    const props = {
        ...bembaProps,
        onClick: bembaProps.pakuKlikisha,
        className: bembaProps.imikalile || 'inline-flex items-center justify-center rounded-md text-sm font-medium',
        variant: bembaProps.variant || 'default',
        size: bembaProps.size || 'default',
        children: bembaProps.ifika || bembaProps.ilembo
    };
    
    return props;
}

/**
 * Wrap Shadcn/ui Input component
 */
function wrapShadcnInput(bembaProps) {
    const props = {
        ...bembaProps,
        onChange: bembaProps.pakuLemba,
        onFocus: bembaProps.pakuIngia,
        onBlur: bembaProps.pakuFuma,
        className: bembaProps.imikalile || 'flex h-10 w-full rounded-md border',
        placeholder: bembaProps.placeholder,
        value: bembaProps.value,
        defaultValue: bembaProps.defaultValue,
        type: bembaProps.type || 'text'
    };
    
    return props;
}

/**
 * Wrap Shadcn/ui Card component
 */
function wrapShadcnCard(bembaProps) {
    const props = {
        ...bembaProps,
        className: bembaProps.imikalile || 'rounded-lg border bg-card text-card-foreground shadow-sm',
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Wrap Shadcn/ui Dialog component
 */
function wrapShadcnDialog(bembaProps) {
    const props = {
        ...bembaProps,
        open: bembaProps.open || bembaProps.wasalwa,
        onOpenChange: bembaProps.pakuCinja,
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Wrap Shadcn/ui Select component
 */
function wrapShadcnSelect(bembaProps) {
    const props = {
        ...bembaProps,
        onValueChange: bembaProps.pakuCinja,
        defaultValue: bembaProps.defaultValue,
        value: bembaProps.value,
        children: bembaProps.ifika
    };
    
    return props;
}

/**
 * Get wrapper for Shadcn/ui component
 */
function getShadcnWrapper(componentName) {
    const wrappers = {
        Button: wrapShadcnButton,
        Input: wrapShadcnInput,
        Card: wrapShadcnCard,
        Dialog: wrapShadcnDialog,
        Select: wrapShadcnSelect
    };
    
    return wrappers[componentName] || wrapReactComponent;
}

module.exports = {
    wrapShadcnButton,
    wrapShadcnInput,
    wrapShadcnCard,
    wrapShadcnDialog,
    wrapShadcnSelect,
    getShadcnWrapper
};

module.exports.default = module.exports;

