# repro-vite-prefers-module-to-exports

minimal reproduction of https://github.com/vitejs/vite/issues/11676 .

## Summary

Vite prefers the file specified in `module` to `exports` under the following situations.

- The package is ESM
- There are `exports` and `module` fields on package.json
- The extension of the file specified in `exports.import` is `.mjs` (with `js`, the problem does not happen)

```json
{
  "exports": {
    "import": "./lib/index.mjs",
    "require": "./lib/index.cjs"
  },
  "type": "module",
  "module": "./lib/old.mjs",
  "main": "./lib/index.cjs"
}
```

Because of this behavior, we cannot build some libraries like `y18n`; a dependency of `yargs`.

https://github.com/yargs/y18n/blob/master/package.json#L8

## Reproduction

I created the minimum reproduction in https://github.com/tasshi-playground/repro-vite-prefers-module-to-exports .

```shell
$ git clone git@github.com:tasshi-playground/repro-vite-prefers-module-to-exports
$ cd repro-vite-prefers-module-to-exports
$ npm install
$ npm run build            # Run vite build
```

### Expected Behavior

The build should be done successfully.
Also, the output file should contain the file specified in `exports` field. (`index.mjs`)

```shell
$ node dist/index.vite.cjs
Loaded file is: index.mjs (ESM)
```

### Actual Behavior

Vite failed to build output.
That's because the file specified in `module` field is loaded. (`old.mjs`).
(To make it easier to understand the impact, the `./lib/old.mjs` is a deprecated file, and the interface is different from `./lib/index.mjs`.)

```shell
$ vite build
vite v4.0.4 building for production...
✓ 2 modules transformed.
"default" is not exported by "src/submodule/lib/old.mjs", imported by "src/index.mjs".
file: /Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/src/index.mjs:2:7
1: // eslint-disable-next-line node/no-extraneous-import
2: import submodule from "submodule-repro-vite-prefers-module-to-exports";
          ^
3:
4: console.log("Loaded file is:", submodule);
error during build:
RollupError: "default" is not exported by "src/submodule/lib/old.mjs", imported by "src/index.mjs".
    at error (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:2041:30)
    at Module.error (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:13062:16)
    at Module.traceVariable (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:13445:29)
    at ModuleScope.findVariable (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:11926:39)
    at Identifier.bind (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:7855:40)
    at CallExpression.bind (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:5649:28)
    at CallExpression.bind (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:9372:15)
    at ExpressionStatement.bind (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:5653:23)
    at Program.bind (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:5649:28)
    at Module.bindReferences (file:///Users/tasshi/git/mshrtsr/repro-vite-prefers-module-to-exports/node_modules/rollup/dist/es/shared/rollup.js:13058:18)
```

## Cause

I have not identified yet, but I think the cause is in the module resolving of Vite.

When I original entrypoint file with Node.js, Node.js picks the file specified in `exports` correctly.

```shell
$ node src/index.js
Loaded file is: index.cjs (CJS)
```

```shell
$ node src/index.mjs
Loaded file is: index.mjs (ESM)
```

## Workaround

This behavior is only happen, when the extension of the file specified in `exports` is `.mjs`.
If we rename the extension to `.js`, Vite starts pick the one in `exports`.

```diff
{
  "exports": {
-     "import": "./lib/index.mjs",
+     "import": "./lib/index.js",
    "require": "./lib/index.cjs"
  },
  "type": "module",
  "module": "./lib/old.mjs",
  "main": "./lib/index.cjs",
}
```

## Lisence

This project is licensed under the [MIT license.](./LICENSE)
