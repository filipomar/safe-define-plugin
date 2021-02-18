# Webpack Safe Define Plugin

A typescript ready [webpack plugin](https://webpack.js.org/concepts/plugins/) to easily include global variables on your outputted bundles

---

It is much alike the [DotEnv plugin](https://www.npmjs.com/package/dotenv-webpack) but also comes with the bonus of

-   safely introducing your plain javascript objects (instances of Classes will get stringified in the process) to your webpack projects (such as configuration) on the front-end.
-   having the flexibiliy on how your output is built, no `process.env` shackles
-   leveraging typescript's type checking

### Usage:

###### webpack.config.ts

```ts
export default {
    // ....
    plugins: [
        /**
         * Any primitive values are allowed through
         **/
        new SafeDefinePlugin({
            variables: 'of',
            the: ['world', { unite: 1 }],
            bourgeoisie: null,
        }),
    ],
};
```

###### Your entrypoint.ts file

```ts
declare const variables: unknown;
declare const the: unknown;

console.log(variables, the);
```

###### Your output main.js file

```js
console.log('of', ['world', { unite: 1 }]);
```

### Further notes

-   Feel free to use this with other Define Plugin instances in the same webpack configuration, they work just as well (as long as outputed definitions do not compete)
-   Do you want your exposed variables to be under a specific path such as `process.env`? Just check out [`SafeDefinePluginOptions['exposureStrategy']`](./src/Args.ts), we accept custom names generators too!
-   Not all possible types have been introduced, if you have any issues, feel free to open a ticket

### Future improvements

-   Leverage `ts-morph` to generate typescript defintion files for your declared variables
-   Introduce a JSON.stringify spy to allows for more freedom
-   More data types allowed for input

### LICENSE

MIT
