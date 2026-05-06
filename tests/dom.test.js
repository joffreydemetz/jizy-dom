import { describe, it, expect, beforeEach, vi } from 'vitest';
import DOM from '../lib/index.js';

const setBody = (html) => { document.body.innerHTML = html; };

describe('DOM constructor', () => {
    beforeEach(() => setBody(''));

    it('wraps elements matching a CSS selector', () => {
        setBody('<p class="x"></p><p class="x"></p>');
        const $p = new DOM('.x');
        expect($p.size()).toBe(2);
        expect($p.exists()).toBe(true);
    });

    it('returns the same DOM instance when given a DOM instance', () => {
        setBody('<p></p>');
        const $a = new DOM('p');
        const $b = new DOM($a);
        expect($b).toBe($a);
    });

    it('wraps a raw Element', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const $d = new DOM(div);
        expect($d.size()).toBe(1);
        expect($d.toArray()[0]).toBe(div);
    });

    it('uses parent.find when parent is a DOM instance', () => {
        setBody('<section id="r"><span></span><span></span></section><span></span>');
        const $root = new DOM('#r');
        const $spans = new DOM('span', $root);
        expect($spans.size()).toBe(2);
    });

    it('size() returns 0 and exists() is false for unmatched selectors', () => {
        setBody('<div></div>');
        const $none = new DOM('.nope');
        expect($none.size()).toBe(0);
        expect($none.exists()).toBe(false);
    });
});

describe('traversal & access', () => {
    beforeEach(() => setBody(''));

    describe('toArray()', () => {
        it('returns the underlying elements array', () => {
            setBody('<a></a><a></a>');
            const arr = new DOM('a').toArray();
            expect(arr).toHaveLength(2);
            expect(arr[0].tagName).toBe('A');
        });
    });

    describe('each()', () => {
        it('iterates elements with index', () => {
            setBody('<i></i><i></i><i></i>');
            const seen = [];
            new DOM('i').each((el, i) => seen.push([el.tagName, i]));
            expect(seen).toEqual([['I', 0], ['I', 1], ['I', 2]]);
        });

        it('returns the DOM instance for chaining', () => {
            setBody('<i></i>');
            const $i = new DOM('i');
            expect($i.each(() => {})).toBe($i);
        });
    });

    describe('map()', () => {
        it('collects callback return values', () => {
            setBody('<li>a</li><li>b</li>');
            const out = new DOM('li').map((el) => el.textContent);
            expect(out).toEqual(['a', 'b']);
        });

        it('skips entries where callback returns false', () => {
            setBody('<li>a</li><li>b</li>');
            const out = new DOM('li').map((el) => el.textContent === 'a' ? 'a' : false);
            expect(out).toEqual(['a']);
        });
    });

    describe('filter()', () => {
        it('filters by selector string', () => {
            setBody('<p class="a"></p><p class="b"></p><p class="a"></p>');
            const $a = new DOM('p').filter('.a');
            expect($a.size()).toBe(2);
        });

        it('filters by callback', () => {
            setBody('<i data-n="1"></i><i data-n="2"></i><i data-n="3"></i>');
            const $odd = new DOM('i').filter((el) => Number(el.dataset.n) % 2 ? el : false);
            expect($odd.size()).toBe(2);
        });
    });

    describe('not()', () => {
        it('excludes elements matching a selector', () => {
            setBody('<p class="a"></p><p class="b"></p><p class="a"></p>');
            const $notA = new DOM('p').not('.a');
            expect($notA.size()).toBe(1);
            expect($notA.toArray()[0].className).toBe('b');
        });

        it('excludes specific element references', () => {
            setBody('<i id="x"></i><i id="y"></i>');
            const x = document.getElementById('x');
            const $rest = new DOM('i').not(x);
            expect($rest.size()).toBe(1);
            expect($rest.toArray()[0].id).toBe('y');
        });
    });

    describe('get()', () => {
        it('returns a DOM wrapping the nth element', () => {
            setBody('<i id="a"></i><i id="b"></i>');
            expect(new DOM('i').get(1).toArray()[0].id).toBe('b');
        });

        it('supports negative indices', () => {
            setBody('<i id="a"></i><i id="b"></i>');
            expect(new DOM('i').get(-1).toArray()[0].id).toBe('b');
        });

        it('returns the original DOM instance when out of range', () => {
            setBody('<i></i>');
            const $i = new DOM('i');
            expect($i.get(99)).toBe($i);
        });
    });

    describe('getElement()', () => {
        it('returns the first underlying Element', () => {
            setBody('<b id="z"></b>');
            expect(new DOM('b').getElement().id).toBe('z');
        });

        it('returns a fresh element of the requested tag when empty', () => {
            const el = new DOM('.nope').getElement('span');
            expect(el.tagName).toBe('SPAN');
        });
    });

    describe('is()', () => {
        beforeEach(() => setBody('<p class="a"></p>'));

        it('matches a CSS selector against the first element', () => {
            expect(new DOM('p').is('.a')).toBe(true);
            expect(new DOM('p').is('.b')).toBe(false);
        });

        it('matches an HTMLElement reference', () => {
            const p = document.querySelector('p');
            expect(new DOM('p').is(p)).toBe(true);
        });

        it('matches a DOM instance', () => {
            const $p = new DOM('p');
            expect(new DOM('p').is($p)).toBe(true);
        });

        it('returns false when there are no elements', () => {
            expect(new DOM('.none').is('.a')).toBe(false);
        });
    });

    describe('find()', () => {
        it('finds descendants by selector', () => {
            setBody('<section id="r"><span></span><span></span></section>');
            const $found = new DOM('#r').find('span');
            expect($found.size()).toBe(2);
        });

        it('handles comma-separated selectors', () => {
            setBody('<section id="r"><b></b><i></i></section>');
            const $found = new DOM('#r').find('b, i');
            expect($found.size()).toBe(2);
        });
    });
});

describe('relations', () => {
    beforeEach(() => setBody(''));

    it('parent() returns the parent node', () => {
        setBody('<section id="r"><span id="c"></span></section>');
        const $p = new DOM('#c').parent();
        expect($p.toArray()[0].id).toBe('r');
    });

    it('parent(selector) filters parents', () => {
        setBody('<section id="r"><span id="c"></span></section>');
        expect(new DOM('#c').parent('#r').size()).toBe(1);
        expect(new DOM('#c').parent('.no').size()).toBe(0);
    });

    it('children() returns child nodes', () => {
        setBody('<section id="r"><b></b><i></i></section>');
        const $kids = new DOM('#r').children();
        expect($kids.size()).toBeGreaterThanOrEqual(2);
    });

    it('closest() returns nearest matching ancestor', () => {
        setBody('<section id="r"><div><span id="c"></span></div></section>');
        const $closest = new DOM('#c').closest('#r');
        expect($closest.toArray()[0].id).toBe('r');
    });

    it('prev() and next() return siblings', () => {
        setBody('<i id="a"></i><i id="b"></i><i id="c"></i>');
        expect(new DOM('#b').prev().toArray()[0].id).toBe('a');
        expect(new DOM('#b').next().toArray()[0].id).toBe('c');
    });

    it('first() and last() return first/last child elements', () => {
        setBody('<section id="r"><b id="a"></b><b id="b"></b><b id="c"></b></section>');
        expect(new DOM('#r').first().toArray()[0].id).toBe('a');
        expect(new DOM('#r').last().toArray()[0].id).toBe('c');
    });
});

describe('mutation', () => {
    beforeEach(() => setBody(''));

    describe('insert variants', () => {
        it('append() inserts HTML at the end', () => {
            setBody('<div id="r"><b></b></div>');
            new DOM('#r').append('<i></i>');
            expect(document.querySelector('#r').lastElementChild.tagName).toBe('I');
        });

        it('prepend() inserts HTML at the start', () => {
            setBody('<div id="r"><b></b></div>');
            new DOM('#r').prepend('<i></i>');
            expect(document.querySelector('#r').firstElementChild.tagName).toBe('I');
        });

        it('before() inserts HTML before the target', () => {
            setBody('<div id="r"><b id="t"></b></div>');
            new DOM('#t').before('<i></i>');
            expect(document.querySelector('#r').firstElementChild.tagName).toBe('I');
        });

        it('after() inserts HTML after the target', () => {
            setBody('<div id="r"><b id="t"></b></div>');
            new DOM('#t').after('<i></i>');
            expect(document.querySelector('#r').lastElementChild.tagName).toBe('I');
        });

        it('append() accepts a raw Element', () => {
            setBody('<div id="r"></div>');
            const span = document.createElement('span');
            new DOM('#r').append(span);
            expect(document.querySelector('#r').lastElementChild).toBe(span);
        });

        it('append() accepts a DOM instance', () => {
            setBody('<div id="r"></div><span class="moveme"></span>');
            const $span = new DOM('.moveme');
            new DOM('#r').append($span);
            expect(document.querySelector('#r').firstElementChild.className).toBe('moveme');
        });
    });

    it('remove() detaches elements', () => {
        setBody('<i></i><i></i>');
        new DOM('i').remove();
        expect(document.querySelectorAll('i')).toHaveLength(0);
    });

    it('replaceWith() replaces an element with new content', () => {
        setBody('<div id="r"><b id="t"></b></div>');
        new DOM('#t').replaceWith('<i id="x"></i>');
        expect(document.querySelector('#r').innerHTML).toBe('<i id="x"></i>');
    });
});

describe('content', () => {
    beforeEach(() => setBody(''));

    it('text() reads innerText of the first element', () => {
        setBody('<p>hello</p>');
        expect(new DOM('p').text()).toBe('hello');
    });

    it('text(value) sets innerText on every element', () => {
        setBody('<p></p><p></p>');
        new DOM('p').text('hi');
        expect([...document.querySelectorAll('p')].map((p) => p.innerText)).toEqual(['hi', 'hi']);
    });

    it('html() reads/writes innerHTML', () => {
        setBody('<div><b>x</b></div>');
        const $d = new DOM('div');
        expect($d.html()).toBe('<b>x</b>');
        $d.html('<i>y</i>');
        expect(document.querySelector('div').innerHTML).toBe('<i>y</i>');
    });
});

describe('attributes / properties', () => {
    beforeEach(() => setBody(''));

    it('attr() reads and writes attributes', () => {
        setBody('<a href="/x"></a>');
        const $a = new DOM('a');
        expect($a.attr('href')).toBe('/x');
        $a.attr('title', 'hello');
        expect(document.querySelector('a').getAttribute('title')).toBe('hello');
    });

    it('attr(name, null) removes the attribute', () => {
        setBody('<a title="t"></a>');
        new DOM('a').attr('title', null);
        expect(document.querySelector('a').hasAttribute('title')).toBe(false);
    });

    it('prop() maps via propMap (e.g. "for" -> "htmlFor")', () => {
        setBody('<label></label>');
        const $l = new DOM('label');
        $l.prop('for', 'field-a');
        expect(document.querySelector('label').htmlFor).toBe('field-a');
        expect($l.prop('for')).toBe('field-a');
    });

    it('val() reads and writes input values', () => {
        setBody('<input type="text" value="initial" />');
        const $i = new DOM('input');
        expect($i.val()).toBe('initial');
        $i.val('changed');
        expect(document.querySelector('input').value).toBe('changed');
    });

    it('val(null) clears the value', () => {
        setBody('<input type="text" value="x" />');
        new DOM('input').val(null);
        expect(document.querySelector('input').value).toBe('');
    });

    it('tagName() returns lowercase tag name', () => {
        setBody('<section></section>');
        expect(new DOM('section').tagName()).toBe('section');
    });

    it('tagName(true) returns uppercase', () => {
        setBody('<section></section>');
        expect(new DOM('section').tagName(true)).toBe('SECTION');
    });
});

describe('class helpers', () => {
    beforeEach(() => setBody(''));

    it('hasClass() returns true when element has class', () => {
        setBody('<div class="a b"></div>');
        const $d = new DOM('div');
        expect($d.hasClass('a')).toBe(true);
        expect($d.hasClass('z')).toBe(false);
    });

    it('addClass() adds a class via the per-element injected method', () => {
        setBody('<div></div><div></div>');
        new DOM('div').addClass('on');
        expect([...document.querySelectorAll('div')].every((d) => d.classList.contains('on'))).toBe(true);
    });

    it('addClass() supports space-separated class names', () => {
        setBody('<div></div>');
        new DOM('div').addClass('a b');
        expect(document.querySelector('div').className).toBe('a b');
    });

    it('removeClass() removes a class', () => {
        setBody('<div class="a b"></div>');
        new DOM('div').removeClass('a');
        expect(document.querySelector('div').className).toBe('b');
    });

    it('toggleClass() toggles a single class', () => {
        setBody('<div></div>');
        const $d = new DOM('div');
        $d.toggleClass('on');
        expect(document.querySelector('div').className).toBe('on');
        $d.toggleClass('on');
        expect(document.querySelector('div').className).toBe('');
    });

    it('replaceClass() swaps one class for another', () => {
        setBody('<div class="a"></div>');
        new DOM('div').replaceClass('a', 'b');
        expect(document.querySelector('div').className).toBe('b');
    });

    it('hasClasses() returns true if any of the given classes is present', () => {
        setBody('<div class="a b"></div>');
        const $d = new DOM('div');
        expect($d.hasClasses(['a', 'z'])).toBe(true);
        expect($d.hasClasses(['x', 'y'])).toBe(false);
    });

    it('hasAllClasses() returns true only when every class is present', () => {
        setBody('<div class="a b"></div>');
        const $d = new DOM('div');
        expect($d.hasAllClasses(['a', 'b'])).toBe(true);
        expect($d.hasAllClasses(['a', 'z'])).toBe(false);
    });

    it('containsClass() finds substring match across classes', () => {
        setBody('<div class="prefix-foo other"></div>');
        const $d = new DOM('div');
        expect($d.containsClass('prefix-')).toBe(true);
        expect($d.containsClass('zzz')).toBe(false);
    });
});

describe('per-element injected methods', () => {
    beforeEach(() => setBody(''));

    it('el.addClass / el.removeClass / el.hasClass operate on that element', () => {
        setBody('<div></div>');
        const el = new DOM('div').toArray()[0];
        el.addClass('foo');
        expect(el.classList.contains('foo')).toBe(true);
        expect(el.hasClass('foo')).toBe(true);
        el.removeClass('foo');
        expect(el.classList.contains('foo')).toBe(false);
    });

    it('el.data() reads/writes data attributes on that element', () => {
        setBody('<div data-x="1"></div>');
        const el = new DOM('div').toArray()[0];
        expect(el.data('x')).toBe(1);
        el.data('y', 'hi');
        expect(el.getAttribute('data-y')).toBe('hi');
        expect(el.data()).toEqual({ x: 1, y: 'hi' });
    });

    it('el.css() reads/writes style on that element', () => {
        setBody('<div></div>');
        const el = new DOM('div').toArray()[0];
        el.css('color', 'red');
        expect(el.style.color).toBe('red');
        expect(el.css('color')).toBe('red');
    });
});

describe('show / hide / toggle', () => {
    beforeEach(() => setBody(''));

    it('hide() sets display:none', () => {
        setBody('<div></div>');
        new DOM('div').hide();
        expect(document.querySelector('div').style.display).toBe('none');
    });

    it('show() restores display after hide()', () => {
        setBody('<div></div>');
        const $d = new DOM('div');
        $d.hide();
        $d.show();
        expect(document.querySelector('div').style.display).not.toBe('none');
    });

    it('toggle() flips display between block and none', () => {
        setBody('<div></div>');
        const $d = new DOM('div');
        $d.toggle();
        expect(document.querySelector('div').style.display).toBe('none');
        $d.toggle();
        expect(document.querySelector('div').style.display).toBe('block');
    });
});

describe('data() (DOM-level helper)', () => {
    beforeEach(() => setBody(''));

    it('reads a single data attribute and deserializes it', () => {
        setBody('<div data-count="42"></div>');
        expect(new DOM('div').data('count')).toBe(42);
    });

    it('reads "true" / "false" / "null" as their literals', () => {
        setBody('<div data-a="true" data-b="false" data-c="null"></div>');
        const $d = new DOM('div');
        expect($d.data('a')).toBe(true);
        expect($d.data('b')).toBe(false);
        expect($d.data('c')).toBe(null);
    });

    it('keeps strings with leading zero as strings', () => {
        setBody('<div data-zip="08"></div>');
        expect(new DOM('div').data('zip')).toBe('08');
    });

    it('parses JSON-shaped values', () => {
        setBody('<div data-list="[1,2,3]" data-obj=\'{"a":1}\'></div>');
        const $d = new DOM('div');
        expect($d.data('list')).toEqual([1, 2, 3]);
        expect($d.data('obj')).toEqual({ a: 1 });
    });

    it('writes a data attribute', () => {
        setBody('<div></div>');
        new DOM('div').data('id', 7);
        expect(document.querySelector('div').getAttribute('data-id')).toBe('7');
    });

    it('returns {} when there are no elements and no key', () => {
        expect(new DOM('.nope').data()).toEqual({});
    });

    it('returns undefined when there are no elements and a key is asked', () => {
        expect(new DOM('.nope').data('k')).toBeUndefined();
    });
});

describe('css() (string getter / setter)', () => {
    beforeEach(() => setBody(''));

    it('sets a string value', () => {
        setBody('<div></div>');
        new DOM('div').css('color', 'red');
        expect(document.querySelector('div').style.color).toBe('red');
    });

    it('reads back from element.style', () => {
        setBody('<div style="color: red;"></div>');
        expect(new DOM('div').css('color')).toBe('red');
    });

    it('sets with !important via the priority flag', () => {
        setBody('<div></div>');
        new DOM('div').css('color', 'red', true);
        expect(document.querySelector('div').style.getPropertyPriority('color')).toBe('important');
    });

    it('removes a property when value is null', () => {
        setBody('<div style="color: red;"></div>');
        new DOM('div').css('color', null);
        expect(document.querySelector('div').style.color).toBe('');
    });

    it('reads multiple properties when given an array', () => {
        setBody('<div style="color: red; background-color: blue;"></div>');
        const out = new DOM('div').css(['color', 'background-color']);
        expect(out).toEqual({ 'color': 'red', 'background-color': 'blue' });
    });
});

describe('events', () => {
    beforeEach(() => setBody(''));

    it('on() / trigger() fire a listener', () => {
        setBody('<button></button>');
        const handler = vi.fn();
        new DOM('button').on('click', handler).trigger('click');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('on() supports space-separated event names', () => {
        setBody('<div></div>');
        const handler = vi.fn();
        const $d = new DOM('div').on('foo bar', handler);
        $d.trigger('foo');
        $d.trigger('bar');
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('off() removes the listener', () => {
        setBody('<div></div>');
        const handler = vi.fn();
        const $d = new DOM('div').on('ping', handler);
        $d.off('ping', handler);
        $d.trigger('ping');
        expect(handler).not.toHaveBeenCalled();
    });

    it('trigger() dispatches a CustomEvent with detail when eventData is given', () => {
        setBody('<div></div>');
        let captured = null;
        const $d = new DOM('div').on('hi', (e) => { captured = e; });
        $d.trigger('hi', { who: 'world' });
        expect(captured).toBeInstanceOf(CustomEvent);
        expect(captured.detail).toEqual({ who: 'world' });
    });
});

describe('forms', () => {
    beforeEach(() => setBody(''));

    it('serialize() returns the form-encoded query string', () => {
        setBody(`
            <form>
                <input name="a" value="1" />
                <input name="b" value="hello world" />
            </form>
        `);
        const out = new DOM('form').serialize();
        expect(out).toBe('a=1&b=hello+world');
    });

    it('serialize() returns "" when there is no form', () => {
        expect(new DOM('form').serialize()).toBe('');
    });

    it('submit() invokes the form\'s submit method', () => {
        setBody('<form action="/x"></form>');
        const form = document.querySelector('form');
        const spy = vi.spyOn(form, 'submit').mockImplementation(() => {});
        new DOM('form').submit();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe('layout', () => {
    beforeEach(() => setBody(''));

    it('offset() returns top/left zeros for an empty set', () => {
        expect(new DOM('.nope').offset()).toEqual({ top: 0, left: 0 });
    });

    it('offset() returns top/left of getBoundingClientRect + scroll offsets', () => {
        setBody('<div></div>');
        const div = document.querySelector('div');
        vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({ top: 10, left: 20 });
        Object.defineProperty(window, 'pageYOffset', { configurable: true, get: () => 5 });
        Object.defineProperty(window, 'pageXOffset', { configurable: true, get: () => 7 });
        expect(new DOM('div').offset()).toEqual({ top: 15, left: 27 });
    });

    it('scrollTop() returns 0 by default', () => {
        setBody('<div></div>');
        expect(new DOM('div').scrollTop()).toBe(0);
    });

    it('scrollTop(value) sets scrollTop on each element', () => {
        setBody('<div></div>');
        new DOM('div').scrollTop(50);
        expect(document.querySelector('div').scrollTop).toBe(50);
    });
});
