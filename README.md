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
yarn package
```

- `yarn dev` runs TypeScript in watch mode.
- `yarn build` compiles the module to `dist`.
- `yarn lint` runs ESLint and Prettier checks.
- `yarn package` builds a Companion package archive.

The module manifest targets Companion's `node26` runtime. The local development
toolchain is managed by Yarn and the Companion module tools declared in
[package.json](./package.json).

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

The action and feedback helper types are intentionally a little richer than this module currently needs. They wrap Companion API 2.1 features such as typed action results, subscribe hooks, value feedbacks, advanced feedback `affectedProperties`, and callback abort signals so new actions and feedbacks remain easy to write.

[build-config.cjs](./build-config.cjs) keeps `digest-fetch` external during packaging. This avoids adding `node-fetch` only to satisfy an optional fallback path in a transitive dependency; Companion's supported Node runtimes provide global `fetch`.
