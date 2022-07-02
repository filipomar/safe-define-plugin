import { ExposureFunction, ExposureStrategy, SafeDefinePluginOptions } from '.';

const buildExposureFunction = (strategy = ExposureStrategy.NONE): ExposureFunction => {
    switch (strategy) {
    case ExposureStrategy.NONE:
        return (name) => name;
    case ExposureStrategy.WINDOW:
        return buildArrayExposureFunction(['window']);
    }
};

const buildArrayExposureFunction =
    (paths: string[]): ExposureFunction =>
        (name) =>
            [...paths, name].join('.');

export const resolveExposureFunction = (exposureStrategy: SafeDefinePluginOptions['exposureStrategy']): ExposureFunction => {
    if (exposureStrategy instanceof Function) {
        return exposureStrategy;
    }

    if (Array.isArray(exposureStrategy)) {
        return buildArrayExposureFunction(exposureStrategy);
    }

    return buildExposureFunction(exposureStrategy);
};
