import webpack from 'webpack';
import path from 'path';
import { readFileSync } from 'fs';

import SafeDefinePlugin, { ExposureStrategy, StringifiableObject } from '.';

/**
 * Simple utility to simulate webpack
 *
 * @todo validate if there is a way to output this into memory instead of a file
 *
 * @param data
 * @param entrypoint
 * @param outputPath
 */
const buildWebpackFile = (data: StringifiableObject, entrypoint: string, outputPath: string): Promise<void> => {
    const { dir, base } = path.parse(outputPath);

    return new Promise((resolve, reject) => {
        webpack(
            {
                mode: 'development',
                entry: entrypoint,
                devtool: false,
                module: { rules: [{ test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }] },
                plugins: [new SafeDefinePlugin(data)],
                output: {
                    clean: true,
                    path: path.join(process.cwd(), dir),
                    filename: base,
                },
            },
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
};

describe(SafeDefinePlugin.name, () => {
    it('accepts custom exposure functions', () => {
        const plugin = new SafeDefinePlugin(
            { hello: 'there', bold: 'one' },
            {
                exposureStrategy: (name) => {
                    switch (name) {
                    case 'bold':
                        return 'anakin is the';
                    case 'hello':
                        return 'hello';
                    }

                    fail('Should never reach here');
                },
            }
        );

        expect(plugin.definitions).toStrictEqual({ hello: JSON.stringify('there'), ['anakin is the']: JSON.stringify('one') });
    });

    it('accepts custom exposure arrays', () => {
        const plugin = new SafeDefinePlugin({ hello: 'there', bold: 'one' }, { exposureStrategy: ['sw'] });

        expect(plugin.definitions).toStrictEqual({ ['sw.hello']: JSON.stringify('there'), ['sw.bold']: JSON.stringify('one') });
    });

    it('accepts window pre-made strategy', () => {
        const plugin = new SafeDefinePlugin({ hello: 'there', bold: 'one' }, { exposureStrategy: ExposureStrategy.WINDOW });

        expect(plugin.definitions).toStrictEqual({ ['window.hello']: JSON.stringify('there'), ['window.bold']: JSON.stringify('one') });
    });

    it('accepts window pre-made strategy', () => {
        const plugin = new SafeDefinePlugin({ hello: 'there', bold: 'one' }, { exposureStrategy: ExposureStrategy.WINDOW });

        expect(plugin.definitions).toStrictEqual({ ['window.hello']: JSON.stringify('there'), ['window.bold']: JSON.stringify('one') });
    });

    it('defaults to global variable exposure', () => {
        const plugin = new SafeDefinePlugin({ hello: 'there', bold: 'one' });

        expect(plugin.definitions).toStrictEqual({ hello: JSON.stringify('there'), bold: JSON.stringify('one') });
    });

    it('exposes only root definition if top exposures are not also set', () => {
        const plugin = new SafeDefinePlugin({ hello: 'there', bold: 'one' }, { rootExposureStrategy: ['iAm(G)root'] });

        expect(plugin.definitions).toStrictEqual({ 'iAm(G)root': JSON.stringify({ hello: 'there', bold: 'one' }) });
    });

    it('exposes only root definition if top exposures are not also set', () => {
        const plugin = new SafeDefinePlugin(
            { hello: 'there', bold: 'one' },
            { exposureStrategy: ExposureStrategy.WINDOW, rootExposureStrategy: ['iAm(G)root'] }
        );

        expect(plugin.definitions).toStrictEqual({
            ['window.hello']: JSON.stringify('there'),
            ['window.bold']: JSON.stringify('one'),
            'iAm(G)root': JSON.stringify({ hello: 'there', bold: 'one' }),
        });
    });

    it('bundles complex objects only when they are listed', async () => {
        const OUTPUT_PATH = './test/build/entrypoint.js';

        await expect(
            buildWebpackFile(
                { customArray: ['first', { second: 'third' }, ['fourth'], { five: 6 }], shouldNotBeenThere: 'WHERE AM I??' },
                './test/entrypoint.ts',
                OUTPUT_PATH
            )
        ).resolves.toBeUndefined();

        const logSpy = jest.spyOn(console, 'log').mockReturnValue();

        /**
         * Execute the output
         */
        require(path.join(process.cwd(), OUTPUT_PATH));

        /**
         * Expect the correct info to have been logged into console.log as is on the entrypoint
         */
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(['first', { second: 'third' }, ['fourth'], { five: 6 }]);

        /**
         * Read output file
         */
        const fileContent = String(readFileSync('./test/build/entrypoint.js'));

        /**
         * Make sure it does not contain what was not mentioned
         */
        expect(fileContent).not.toContain('WHERE AM I??');
        expect(fileContent).not.toContain(JSON.stringify('WHERE AM I??'));

        /**
         * Make sure it does contain the mentioned variable
         */
        expect(fileContent).toContain(JSON.stringify(['first', { second: 'third' }, ['fourth'], { five: 6 }]));
    });
});
