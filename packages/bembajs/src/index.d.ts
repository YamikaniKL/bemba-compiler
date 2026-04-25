import type bembajsCore = require('bembajs-core');

export interface FrameworkMetadata {
    name: 'bembajs';
    runtime: 'react';
    renderer: 'react-dom';
    routing: 'app-router';
}

export interface BembaWrapperProps {
    pakuKlikisha?: (...args: unknown[]) => unknown;
    pakuLemba?: (...args: unknown[]) => unknown;
    pakuTumina?: (...args: unknown[]) => unknown;
    pakuCinja?: (...args: unknown[]) => unknown;
    pakuIngia?: (...args: unknown[]) => unknown;
    pakuFuma?: (...args: unknown[]) => unknown;
    pakuKwesha?: (...args: unknown[]) => unknown;
    pakuSiya?: (...args: unknown[]) => unknown;
    imikalile?: string;
    izina?: string;
    umutwe?: string;
    ilyashi?: string;
    ifika?: unknown;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    value?: unknown;
    defaultValue?: unknown;
    [key: string]: unknown;
}

export interface WrappedReactComponent<TProps extends Record<string, unknown> = Record<string, unknown>> {
    Component: unknown;
    props: TProps;
}

export interface ReactWrapperModule {
    PROP_MAP: Record<string, string>;
    wrapReactComponent(Component: unknown, bembaProps: BembaWrapperProps): WrappedReactComponent;
    convertEventHandler(handlerString: string | ((...args: unknown[]) => unknown)): (...args: unknown[]) => unknown;
    validateProps(
        props: Record<string, unknown>,
        schema: Record<string, { required?: boolean; type?: string }>
    ): boolean;
}

export type ComponentWrapperFunction<TProps extends BembaWrapperProps = BembaWrapperProps> = (bembaProps: TProps) => Record<string, unknown>;

export interface LibraryWrapperModule {
    [key: string]: unknown;
    getShadcnWrapper?: (componentName: string) => ComponentWrapperFunction;
    getMuiWrapper?: (componentName: string) => ComponentWrapperFunction;
    getChakraWrapper?: (componentName: string) => ComponentWrapperFunction;
}

export interface WrapperRegistry {
    react: ReactWrapperModule;
    shadcn: LibraryWrapperModule;
    mui: LibraryWrapperModule;
    chakra: LibraryWrapperModule;
}

export interface WrappersApi {
    reactWrapper: ReactWrapperModule;
    shadcnWrapper: LibraryWrapperModule;
    muiWrapper: LibraryWrapperModule;
    chakraWrapper: LibraryWrapperModule;
    WRAPPER_REGISTRY: WrapperRegistry;
    getWrapper(library: keyof WrapperRegistry | string, componentName: string): ComponentWrapperFunction;
    wrapComponent(
        library: keyof WrapperRegistry | string,
        componentName: string,
        bembaProps: BembaWrapperProps
    ): Record<string, unknown>;
    registerWrapper(
        library: string,
        componentName: string,
        wrapperFunction: ComponentWrapperFunction
    ): void;
}

export interface BembajsExports extends bembajsCore {
    wrappers: WrappersApi;
    framework: FrameworkMetadata;
    version: string;
}

declare const bembajs: BembajsExports & { default: BembajsExports };
export = bembajs;
