# companion-module-sony-savona

Bitfocus Companion module for Sony cameras that expose the Savona API, using
[`@ckohen/savona`](https://www.npmjs.com/package/@ckohen/savona) as the camera client.

User-facing setup and operation notes live in [companion/HELP.md](./companion/HELP.md).

## Development

Install dependencies with:

```sh
yarn
```

Useful commands:

```sh
yarn dev
yarn build
yarn lint
yarn test
yarn package
```

- `yarn dev` runs TypeScript in watch mode.
- `yarn build` compiles the module to `dist`.
- `yarn lint` runs ESLint and Prettier checks.
- `yarn test` builds the module and runs regression tests with Node's test runner.
- `yarn package` builds a Companion package archive.

The module requires Companion 5.1 or newer and targets its `node26` runtime.
Development supports Node 22.22.1+ in the 22.x line, or Node 26.5+. CI checks both
release lines. The local toolchain is managed by Yarn and the Companion module
tools declared in [package.json](./package.json).

## Structure

- [src/main.ts](./src/main.ts) owns the Companion module lifecycle, Savona client setup, definitions, and cache coordinator binding.
- [src/actions](./src/actions) contains one action per file, grouped by camera area.
- [src/feedbacks](./src/feedbacks) contains reusable state feedbacks and the generic state matcher.
- [src/variables](./src/variables) exposes cached camera state as Companion variables.
- [src/state](./src/state) coordinates startup refreshes, notification-driven cache updates, feedback checks, and variable publishing.
- [src/presets](./src/presets) defines curated Companion presets.
- [companion/manifest.json](./companion/manifest.json) is the module manifest used by Companion packaging.

## Notes

`ModuleInstance.client` is the active `SavonaClient` instance. Prefer using that shared client and the cache coordinator rather than introducing separate state registries.

`ModuleInstance.readyClient` is available after authentication and the initial state
refresh, and should be used for camera actions. The coordinator listens for
`SavonaEvent.CacheUpdate` to publish completed cache updates. Explicit fetches must
still be awaited before publishing. It tracks which structures have initialized,
but all camera values remain in the Savona client.

The action and feedback helper types are intentionally a little richer than this
module currently needs. They support Companion API 2.2, including typed action and
value-feedback results, subscribe hooks, advanced feedback `affectedProperties`,
CSS colours, and callback abort signals. New actions and feedbacks remain easy to
write. Compile-time regression checks run as part of `yarn test`.

[build-config.cjs](./build-config.cjs) keeps `digest-fetch` external during packaging. This avoids adding `node-fetch` only to satisfy an optional fallback path in a transitive dependency; Companion's supported Node runtimes provide global `fetch`.
