import { describe, it, expect, beforeEach } from 'vitest';
import Selector from '../lib/js/selector.js';

describe('Selector', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('empty / falsy input', () => {
        it('returns [] for empty string', () => {
            expect(Selector('')).toEqual([]);
        });

        it('returns [] for null', () => {
            expect(Selector(null)).toEqual([]);
        });

        it('returns [] for undefined', () => {
            expect(Selector(undefined)).toEqual([]);
        });
    });

    describe('CSS string selector', () => {
        it('returns matching elements from the document by default', () => {
            document.body.innerHTML = '<p class="x"></p><p class="x"></p><p></p>';
            const result = Selector('.x');
            expect(result).toHaveLength(2);
            expect(result.every((el) => el instanceof HTMLElement)).toBe(true);
        });

        it('returns [] when nothing matches', () => {
            document.body.innerHTML = '<div></div>';
            expect(Selector('.does-not-exist')).toEqual([]);
        });

        it('scopes the search to opt_root when provided', () => {
            document.body.innerHTML =
                '<section id="r"><span></span><span></span></section><span></span>';
            const root = document.getElementById('r');
            expect(Selector('span', root)).toHaveLength(2);
        });

        it('accepts a string opt_root and resolves it as a selector', () => {
            document.body.innerHTML =
                '<section id="r"><b></b><b></b></section><b></b>';
            expect(Selector('b', '#r')).toHaveLength(2);
        });

        it('returns an Array (not a NodeList)', () => {
            document.body.innerHTML = '<i></i><i></i>';
            const result = Selector('i');
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Node selector', () => {
        it('wraps a single Element node into [node]', () => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            expect(Selector(div)).toEqual([div]);
        });

        it('returns [node] when node is a descendant of opt_root', () => {
            const root = document.createElement('section');
            const child = document.createElement('span');
            root.appendChild(child);
            document.body.appendChild(root);
            expect(Selector(child, root)).toEqual([child]);
        });

        it('returns [] when node is not a descendant of opt_root', () => {
            const a = document.createElement('div');
            const b = document.createElement('div');
            document.body.appendChild(a);
            document.body.appendChild(b);
            expect(Selector(a, b)).toEqual([]);
        });
    });

    describe('window / document selector', () => {
        it('returns [window] when given window without opt_root', () => {
            expect(Selector(window)).toEqual([window]);
        });

        it('returns [] when given window with opt_root', () => {
            expect(Selector(window, document.body)).toEqual([]);
        });

        it('returns [document] when given document without opt_root', () => {
            expect(Selector(document)).toEqual([document]);
        });
    });

    describe('array-like selector', () => {
        it('flattens a NodeList into an array', () => {
            document.body.innerHTML = '<u></u><u></u><u></u>';
            const list = document.querySelectorAll('u');
            const result = Selector(list);
            expect(result).toHaveLength(3);
        });

        it('flattens an array of arrays into a single array', () => {
            const a = document.createElement('a');
            const b = document.createElement('b');
            const c = document.createElement('c');
            const result = Selector([[a, b], [c]]);
            expect(result).toHaveLength(3);
        });
    });
});
