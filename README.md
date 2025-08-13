# jizy-dom
DOM js implementation

## `lib/js` Directory

This folder contains the core JavaScript modules for DOM manipulation:

- **dom.js**: Provides utility functions for deep object extension, CSS property handling, and other DOM-related helpers.
- **selector.js**: Implements a lightweight selector engine and helper functions for working with DOM elements and arrays.

## Build process

The build process is managed by `jpack`, which compiles and bundles the JavaScript files into a single output file. The configuration for the build can be found in `config/jpack.js`.

### Build Command

To build the project, run:

```sh
npm run build
```

This command executes `node cli/command.js`, which uses the `jpack` configuration to bundle the JavaScript source files.  
You can pass additional options:

- `--target <path>`: Set a custom output directory.
- `--zip`: Create a zip archive of the build.
- `--name <name>`: Set a custom build name.

Example:

```sh
npm run build -- --target test --name custom-build
```
