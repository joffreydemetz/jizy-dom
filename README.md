# jizy-dom

A lightweight, chainable DOM manipulation library — a small jQuery-like wrapper over native DOM APIs, with no runtime dependencies.

## Installation

```sh
npm install jizy-dom
```

## Usage

ESM (Node / bundlers):

```js
import DOM from 'jizy-dom';

const $items = new DOM('.item');
$items.addClass('active').on('click', (e) => console.log(e.target));
```

Browser (UMD/IIFE bundle, exposes the `DOM` global):

```html
<script src="node_modules/jizy-dom/dist/js/jizy-dom.min.js"></script>
<script>
    new DOM('.item').show();
</script>
```

## Constructor

```js
new DOM(selector, parent)
```

`selector` may be a CSS string, a single `Element`, an array/NodeList of elements, or another `DOM` instance. `parent` is optional and may be a CSS string, an `Element`, or another `DOM` instance — when given, the lookup is scoped to it. Passing a `DOM` instance as `selector` returns it as-is.

## `lib/js` directory

- **dom.js** — the `DOM` class (chainable API), CSS/data/class helpers, and a small `slide` animation primitive.
- **selector.js** — lightweight selector engine that normalizes the input (string, node, NodeList, window/document) and returns a flat array of elements.

## API

All chainable methods return the `DOM` instance. Read methods return the requested value (or `null`/`false`/`undefined` when nothing matches).

### Traversal & access

- `toArray()` — underlying elements as a plain array.
- `exists()` / `size()` — has matches / count.
- `each(cb)` — iterate `(el, i)`.
- `map(cb)` — collect callback return values; entries returning `false` are skipped.
- `filter(cbOrSelector)` — keep elements matching a selector or for which the callback returns truthy.
- `not(selector)` — inverse of `filter`.
- `get(index)` — single-element `DOM` at `index` (negative indexes count from the end).
- `getElement(tag)` — the first raw `Element`, or a freshly created `<tag>` (default `div`) when empty.
- `is(selector)` — match against a selector, an `Element`, a `DOM` instance, or the pseudo-selectors `:visible` / `:hidden`.
- `find(selector)` — descendants matching the selector; supports comma lists and a leading `>` for direct children.
- `parent(selector?)`, `children(selector?)`, `closest(selector)`, `prev(selector?)`, `next(selector?)`, `first(selector?)`, `last(selector?)`.

### Mutation

- `insert(newEl, position)` — `position` accepts `before` / `after` / `prepend` / `append` (mapped to `insertAdjacent*`). `newEl` may be a `DOM`, an `Element`, or an HTML string.
- `before(newEl)`, `after(newEl)`, `append(newEl)`, `prepend(newEl)`.
- `replaceWith(newEl)`, `remove()`, `wrap(wrapper)`.

### Content

- `text(value?)`, `html(value?)`, `content(value?)` — getter when called with no argument, setter otherwise.

### Classes

- `addClass(name)`, `removeClass(name)`, `toggleClass(name)`, `replaceClass(oldClass, newClass)`.
- `hasClass(name)`, `hasClasses(names)` (any), `hasAllClasses(names)` (all), `containsClass(substring)`.

### CSS / visibility

- `css(prop)` — read computed/inline value.
- `css(prop, value, important?)` — set; numeric values get `px` appended for size/spacing properties; pass `null` to remove.
- `css(['prop1','prop2'])` — read multiple values into an object.
- `show()`, `hide()`, `toggle()` — track the original `display` via `data-css-initial-display`.
- `offset()` — `{ top, left }` relative to the document.
- `outerHeight()`, `outerWidth()` — content + padding + margin.

### Data & attributes

- `data()` / `data(key)` / `data(key, value)` — read all dataset values, read one, or write one. Values are deserialized: `"true"`/`"false"`/`"null"`, numbers, and JSON literals are parsed; everything else stays a string. Object values are written as `data-key-subkey`.
- `attr(name)` / `attr(name, value)` — `setAttribute` / `getAttribute`; passing `null` removes the attribute.
- `prop(name)` / `prop(name, value)` — DOM property access with HTML→DOM remapping (`class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`, etc.).
- `tagName(uppercase?)` — tag name of the first element.
- `val(value?)` — form-control value getter/setter.

### Events

- `on(events, listener, options?)` — space-separated event list; `options` is forwarded to `addEventListener`.
- `off(events, listener)`.
- `delegate(events, selector, listener, options?)` — runs `listener` only when `event.target` matches `selector`.
- `trigger(eventName, eventData?, bubbles?, cancellable?)` — dispatches a `CustomEvent` when `eventData` is given, otherwise a plain `Event`.
- `submit()`, `focus()`.
- `swipe(swipeCb, ignoreCb?, params?)` — touch-swipe detector. `swipeCb(event, dir)` receives `'left' | 'right' | 'up' | 'down' | 'none'`. `params` overrides `{ scrolling: false, threshold: 10, restraint: 100, allowedTime: 300 }`. Uses passive listeners when supported.

### Animation & scroll

- `slideDown(speed?, easing?, delay?, display?)`.
- `slideUp(speed?, easing?, delay?)`.
- `slideToggle(speed?, easing?, delay?, display?)` — falls back to `show`/`hide`/`toggle` when `Promise` is unavailable. Defaults: `speed=500`, `easing='cubic-bezier(0.25, 0.1, 0.44, 1.4)'`, `delay=200`. Hidden state is tracked via the `slider-hidden` class.
- `scrollTop(position?)` — read or smooth-scroll the first element.

### Forms

- `serialize()` — first matched form serialized as a URL-encoded query string via `FormData` + `URLSearchParams`.

## Per-element helpers

Inside `each`/`map` callbacks, the raw `Element` is decorated with shorthand methods bound to that element: `el.data`, `el.css`, `el.addClass`, `el.removeClass`, `el.hasClass`, `el.hasClasses`, `el.hasAllClasses`. They behave like their `DOM` counterparts but operate on the single element.

## Build

This package follows the standard `jizy-*` packer layout. Build commands:

```bash
npm run jpack:dist        # build dist/ from lib/
npm run jpack:export      # consumer-specific build (--name perso)
```

The browser bundle exposes the global `DOM` (configured in `config/jpack.js`).

## Tests

Vitest + happy-dom. Tests live under `tests/`.

```bash
npm run test              # watch mode
npm run test:run          # one-shot
npm run test:coverage     # with coverage
```

## License

MIT — see [LICENSE](LICENSE).
