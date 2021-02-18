import { DefinePlugin } from 'webpack';

import { SafeDefinePluginOptions, StringifiableObject } from '.';
import { resolveExposureFunction } from './ExposureFunction';

const escapeValues = (definitions: StringifiableObject, { exposureStrategy }: SafeDefinePluginOptions): Record<string, string> => {
    /**
     * Define how variables should be exposed
     */
    const exposureFunction = resolveExposureFunction(exposureStrategy);

    return Object.entries(definitions).reduce<Record<string, string>>(
        (escaped, [propName, value]) => ({ ...escaped, [exposureFunction(propName)]: JSON.stringify(value) }),
        {}
    );
};

/**
 * This plugin exposes as variables any objects given to it to the code in the outputted webpack bundle
 *
 * It is just a wrapper of the webpack `DefinePlugin` with some typescript/value escaping rails
 * This can be used along side the `DefinePlugin`
 */
export class SafeDefinePlugin extends DefinePlugin {
    constructor(definitions: StringifiableObject, options: SafeDefinePluginOptions = {}) {
        super(escapeValues(definitions, options));
    }
}

export default SafeDefinePlugin;
