type PrimitiveValue = undefined | null | string | number | boolean;
type RecursivePrimitiveObject<T> = { [index: string]: RecursivePrimitiveObject<T> } | RecursivePrimitiveObject<T>[] | T;

/**
 * A simple JSON-like that will be acessible on the outputted code
 */
export type StringifiableObject = Record<string, RecursivePrimitiveObject<PrimitiveValue>>;

export enum ExposureStrategy {
    /**
     * Objects can be referenced by their name
     *
     * @example `{ hello: 'there' }` can be referenced bt `hello`
     */
    NONE = 'NONE',

    /**
     * Objects can be referenced by accessing the window object
     *
     * @example `{ hello: 'there' }` can be referenced bt `window.hello`
     */
    WINDOW = 'WINDOW',
}

export type ExposureFunction = (name: string) => string;

export type SafeDefinePluginOptions = {
    /**
     * Define how the top level entries of the given object can be exposed in the bundle
     *
     * See `ExposureStrategy` for default options
     */
    readonly exposureStrategy?: ExposureStrategy | string[] | ExposureFunction;
};
