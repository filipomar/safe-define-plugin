import { DefinePlugin } from 'webpack';

import { SafeDefinePluginOptions, StringifiableObject } from '.';
import { resolveExposureFunction } from './ExposureFunction';

const escapeValues = (definitions: StringifiableObject, { exposureStrategy, rootExposureStrategy = [] }: SafeDefinePluginOptions): Record<string, string> => {
    /**
     * Define how variables should be exposed
     */
    const exposureFunction = resolveExposureFunction(exposureStrategy);

    /**
     * Expose the root if there are any
     * They are more limited in scope, as only an array of names is sensible here
     */
    const rootExposure = rootExposureStrategy.reduce<Record<string, string>>(
        (escaped, rootName) => ({ ...escaped, [rootName]: JSON.stringify(definitions) }),
        {}
    );

    if (rootExposureStrategy.length && !exposureStrategy) {
        /**
         * Stop if there is root exposure but no definitions exposure
         */
        return rootExposure;
    }

    /**
     * Expose regular defnitions if there are any
     */
    return Object.entries(definitions).reduce<Record<string, string>>(
        (escaped, [propName, value]) => ({ ...escaped, [exposureFunction(propName)]: JSON.stringify(value) }),
        rootExposure
    );
};

/**
 * This plugin exposes as variables any objects given to it to the code in the outputted webpack bundle
 *
 * It is just a wrapper of the webpack `DefinePlugin` with some typescript/value escaping rails
 * This can be used along side the `DefinePlugin`
 */
export class SafeDefinePlugin<D extends StringifiableObject = StringifiableObject> extends DefinePlugin {
    constructor(definitions: D, options: SafeDefinePluginOptions = {}) {
        super(escapeValues(definitions, options));
    }
}

export default SafeDefinePlugin;
