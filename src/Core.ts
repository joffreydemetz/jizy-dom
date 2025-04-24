import { domUtils } from './utils';
import { Selector } from './Selector';

type ElementWithExtensions = HTMLElement & {
    data?: (key?: string, val?: any) => any;
    css?: (prop: string, val?: string | null, important?: boolean) => any;
    addClass?: (cls: string) => void;
    removeClass?: (cls: string) => void;
    hasClass?: (cls: string) => boolean;
    hasClasses?: (clsList: string[]) => boolean;
    hasAllClasses?: (clsList: string[]) => boolean;
};

export class DOM {
    elems: Array<Element>;

    constructor(selector: string | Element | NodeList | Array<Element>, context: Document | Element = document) {
        this.elems = Selector(selector, context) as Array<Element>;
        this.elems.forEach(el => this._patchElement(el as ElementWithExtensions));
    }

    static instance(selector: string | Element | NodeList, context?: Document | Element): DOM {
        return new DOM(selector, context);
    }
    
    static create(tag: string, attrs: Record<string, any> = {}): DOM {
        const el = document.createElement(tag);
        const wrapped = new DOM([el]);

        if (attrs.className) {
            wrapped.addClass(attrs.className);
            delete attrs.className;
        }

        if (attrs.text) {
            wrapped.text(attrs.text);
            delete attrs.text;
        }

        if (attrs.html) {
            wrapped.html(attrs.html);
            delete attrs.html;
        }

        for (const [key, val] of Object.entries(attrs)) {
            wrapped.attr(key, val);
        }

        return wrapped;
    }
    
    static plugin(name: string, fn: (...args: any[]) => void): void {
        (DOM.prototype as any)[name] = fn;
    }

    private static propMap: Record<string, string> = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        for: 'htmlFor',
        class: 'className',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        cellpadding: 'cellPadding',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        usemap: 'useMap',
        frameborder: 'frameBorder',
        contenteditable: 'contentEditable'
    };
    
    private _patchElement(el: ElementWithExtensions): void {
        el.data = (key?: string, val?: any): any => {
            if (!key) return this._getAllData(el);
            return arguments.length === 2 ? this._setData(el, key, val) : this._getData(el, key);
        };

        el.css = (prop: string, val?: string | null, important: boolean = false): any =>
            arguments.length === 1 ? this._getCss(el, prop) : this._setCss(el, prop, val ?? null, important);

        el.addClass = (cls: string): void => this._class(el, 'add', cls);
        el.removeClass = (cls: string): void => this._class(el, 'remove', cls);
        el.hasClass = (cls: string): boolean => el.classList.contains(cls);
        el.hasClasses = (clsList: string[]): boolean => clsList.some(cls => el.classList.contains(cls));
        el.hasAllClasses = (clsList: string[]): boolean => clsList.every(cls => el.classList.contains(cls));
    }

    private _getCss(el: HTMLElement, prop: string): string {
        return el.style[domUtils.camelize(prop) as any] || getComputedStyle(el).getPropertyValue(domUtils.dasherize(prop));
    }

    private _setCss(el: HTMLElement, prop: string, val: string | null, important: boolean): void {
        if (val === null) {
            el.style.removeProperty(domUtils.dasherize(prop));
        } else if (important) {
            el.style.setProperty(domUtils.dasherize(prop), String(this._maybeAddPx(prop, val)), 'important');
        } else {
            el.style[domUtils.camelize(prop) as any] = String(this._maybeAddPx(prop, val));
        }
    }

    private _getData(el: HTMLElement, key: string): any {
        const attr = el.getAttribute(`data-${domUtils.dasherize(key)}`);
        return attr !== null ? domUtils.deserializeValue(attr) : undefined;
    }

    private _setData(el: HTMLElement, key: string, val: any): void {
        if (typeof val === 'object') {
            for (const k in val) this._setData(el, `${key}-${k}`, val[k]);
        } else {
            domUtils.setAttr(el, `data-${domUtils.dasherize(key)}`, val);
        }
    }

    private _getAllData(el: HTMLElement): Record<string, any> {
        const data: Record<string, any> = {};
        for (const key in el.dataset) {
            data[key] = this._getData(el, key);
        }
        return data;
    }

    private _class(el: HTMLElement, action: 'add' | 'remove', cls: string): void {
        cls.split(' ').forEach(c => c && el.classList[action](c));
    }

    private _maybeAddPx(prop: string, value: string | number): string | number {
        const cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        };

        return typeof value === 'number' && !cssNumber[prop as keyof typeof cssNumber] ? `${value}px` : value;
    }
    
    each(callback: (el: Element, index: number) => void): this {
        this.elems.forEach((el, i) => callback.call(this, el, i));
        return this;
    }

    toArray(): Array<Element> {
        return this.elems;
    }

    exists(): boolean {
        return this.elems.length > 0;
    }

    size(): number {
        return this.elems.length;
    }

    map<T>(callback: (el: Element, index: number) => T): Array<T> {
        const results: Array<T> = [];
        this.elems.forEach((el, i) => {
            const result = callback.call(this, el, i);
            if (result !== false) results.push(result);
        });
        return results;
    }

    filter(callback: ((el: Element, index: number) => boolean) | string): DOM {
        if (typeof callback !== 'function') {
            const selector = callback;
            callback = (el: Element) => el.matches(selector);
        }
        const filtered = this.elems.filter((el, i) => callback.call(this, el, i) !== false);
        return new DOM(filtered);
    }

    not(selector: ((el: Element, index: number) => boolean) | string): DOM {
        let exclude: Array<Element> = [];
        if (typeof selector === 'function') {
            this.each((el, i) => {
                if (!selector.call(this, el, i)) exclude.push(el);
            });
        } else {
            exclude = new DOM(selector).toArray();
        }
        const result = this.elems.filter(el => !exclude.includes(el));
        return new DOM(result);
    }

    get(index: number = 0): DOM {
        const idx = index >= 0 ? index : this.elems.length + index;
        return this.elems[idx] ? new DOM(this.elems[idx]) : this;
    }

    getElement(tag: string = 'div'): Element {
        return this.elems[0] || document.createElement(tag);
    }

    is(selector: string | Element | DOM): boolean {
        const el = this.elems[0];
        if (!el) return false;

        if (selector instanceof Element) return el === selector;
        if (selector instanceof DOM) return el === selector.getElement();
        if (typeof selector === 'string') {
            if (selector === ':visible') return getComputedStyle(el).display !== 'none';
            if (selector === ':hidden') return getComputedStyle(el).display === 'none';
            return el.matches(selector);
        }

        return false;
    }

    // attributes

    attr(name: string, value?: string | null): string | void {
        if (value === undefined) {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            if (!el) return undefined;
            const propName = DOM.propMap[name] || name; // Updated reference
            const propValue = el[propName as keyof HTMLElement];
            return typeof propValue === 'string' ? propValue : el.getAttribute(name) || undefined;
        }

        this.elems.forEach(el => {
            const propName = DOM.propMap[name] || name; // Updated reference
            if (value === null) {
                el.removeAttribute(name);
            } else {
                el.setAttribute(name, value);
            }
        });
    }

    prop(name: string, value?: any): any {
        if (value === undefined) {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            if (!el) return undefined;
            const propName = DOM.propMap[name] || name; // Updated reference
            return el[propName as keyof HTMLElement];
        }

        this.elems.forEach(el => {
            const propName = DOM.propMap[name] || name; // Updated reference
            if (el instanceof HTMLElement && propName in el && !(Object.getOwnPropertyDescriptor(el, propName)?.writable === false)) {
                (el as any)[propName] = value;
            }
        });
    }

    css(prop: string | string[], value?: string | null, important: boolean = false): string | Record<string, string> | null {
        const { dasherize, camelize } = domUtils;

        const css = (el: HTMLElement, key: string, val?: string | null, important = false): void | string => {
            if (val !== undefined) {
                if (val === null) {
                    el.style.removeProperty(dasherize(key));
                } else {
                    val = this._maybeAddPx(key, val) as string;
                    if (important) {
                        el.style.setProperty(dasherize(key), val, 'important');
                    } else {
                        el.style[camelize(key) as any] = val;
                    }
                }
                return;
            }
            return el.style[camelize(key) as any] || getComputedStyle(el).getPropertyValue(dasherize(key));
        };

        if (typeof prop === 'string' && value !== undefined) {
            this.elems
                .filter((el): el is HTMLElement => el instanceof HTMLElement)
                .forEach(el => css(el, prop, value, important));
            return null;
        }

        if (typeof prop === 'string') {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            return el ? (css(el, prop) ?? null) : null;
        }

        if (Array.isArray(prop)) {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            if (el) {
                const result: Record<string, string> = {};
                prop.forEach(key => {
                    result[key] = css(el, key) as string;
                });
                return result;
            }
            return null;
        }

        return null;
    }

    data(key?: string, value?: any): any {
        const { dasherize, deserializeValue } = domUtils;

        if (key !== undefined) {
            if (value !== undefined) {
                this.elems
                    .filter((el): el is HTMLElement => el instanceof HTMLElement)
                    .forEach(el => {
                        if (el instanceof HTMLElement) {
                            if (typeof value === 'object' && value !== null) {
                                Object.entries(value).forEach(([subKey, subVal]) => {
                                    el.setAttribute(`data-${dasherize(`${key}-${subKey}`)}`, subVal as string);
                                });
                            } else {
                                el.setAttribute(`data-${dasherize(key)}`, value as string);
                            }
                        }
                    });
                return;
            }

            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            if (el) {
                const val = el.getAttribute(`data-${dasherize(key)}`);
                return val !== null ? deserializeValue(val) : undefined;
            }
            return undefined;
        }

        const dataset: Record<string, any> = {};
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (el && el.dataset) {
            for (const k in el.dataset) {
                if (el.dataset[k] !== undefined) {
                    dataset[k] = deserializeValue(el.dataset[k] as string);
                }
            }
        }
        return dataset;
    }

    tagName(): string | null {
        return this.elems.length > 0 ? this.elems[0].tagName : null;
    }

    val(value?: string): string | null {
        if (value !== undefined) {
            this.elems
                .filter((el): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
                    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
                )
                .forEach(el => {
                    el.value = value ?? '';
                });
            return null;
        }

        const el = this.elems.find((el): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
            el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
        );
        return el?.value || null;
    }

    outerHeight(): number {
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (!el) return 0;

        const style = getComputedStyle(el);
        return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
    }

    outerWidth(): number {
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (!el) return 0;

        const style = getComputedStyle(el);
        return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    }

    addClass(className: string): void {
        this.elems.forEach(el => {
            el.classList.add(className);
        });
    }

    removeClass(className: string): void {
        this.elems.forEach(el => {
            el.classList.remove(className);
        });
    }

    toggleClass(className: string): void {
        this.elems.forEach(el => {
            el.classList.toggle(className);
        });
    }

    replaceClass(oldClass: string, newClass: string): void {
        this.elems.forEach(el => {
            el.classList.replace(oldClass, newClass);
        });
    }

    hasClass(className: string): boolean {
        return this.elems[0].classList.contains(className);
    }

    hasClasses(classNames: string[]): boolean {
        return classNames.every(className => this.elems[0].classList.contains(className));
    }

    containsClass(search: string): boolean {
        return Array.from(this.elems[0].classList).some(className => className.includes(search));
    }
    
    // contents
    empty(): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.innerHTML = '';
            });
    }

    remove(): void {
        this.elems.forEach(el => {
            el.parentElement?.removeChild(el);
        });
    }

    replaceWith(content: Element | string): void {
        this.elems.forEach(el => {
            if (typeof content === 'string') {
                el.outerHTML = content;
            } else {
                el.replaceWith(content);
            }
        });
    }

    wrap(wrapper: Element): void {
        this.elems.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.insertBefore(wrapper, el);
                wrapper.appendChild(el);
            }
        });
    }

    insert(newEl: Element | string | DOM, position: 'before' | 'after' | 'prepend' | 'append'): this {
        const map = {
            before: 'beforebegin',
            after: 'afterend',
            prepend: 'afterbegin',
            append: 'beforeend'
        };
        const pos = map[position] as InsertPosition;

        this.elems.forEach(el => {
            if (newEl instanceof DOM) {
                newEl.elems.forEach(child => el.insertAdjacentElement(pos, child));
            } else if (newEl instanceof Element) {
                el.insertAdjacentElement(pos, newEl);
            } else {
                el.insertAdjacentHTML(pos, newEl);
            }
        });

        return this;
    }

    before(newEl: Element | string | DOM): this {
        return this.insert(newEl, 'before');
    }

    after(newEl: Element | string | DOM): this {
        return this.insert(newEl, 'after');
    }

    append(newEl: Element | string | DOM): this {
        return this.insert(newEl, 'append');
    }

    prepend(newEl: Element | string | DOM): this {
        return this.insert(newEl, 'prepend');
    }

    // traversal

    parent(): DOM {
        const parents = this.elems.map(el => el.parentElement).filter(el => el) as Element[];
        return new DOM(parents);
    }

    children(): DOM {
        const children: Element[] = [];
        this.elems.forEach(el => {
            children.push(...Array.from(el.children));
        });
        return new DOM(children);
    }

    find(selector: string): DOM {
        const found: Element[] = [];
        this.elems.forEach(el => {
            found.push(...Array.from(el.querySelectorAll(selector)));
        });
        return new DOM(found);
    }

    next(): DOM {
        const nextSiblings = this.elems.map(el => el.nextElementSibling).filter(el => el) as Element[];
        return new DOM(nextSiblings);
    }

    prev(): DOM {
        const prevSiblings = this.elems.map(el => el.previousElementSibling).filter(el => el) as Element[];
        return new DOM(prevSiblings);
    }

    first(): DOM {
        const el = this.elems[0];
        return el ? new DOM(el) : new DOM([]);
    }

    last(): DOM {
        const el = this.elems[this.elems.length - 1];
        return el ? new DOM(el) : new DOM([]);
    }
    
    // manipulations
    
    html(htmlString?: string): string | void {
        if (arguments.length === 0) {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            return el?.innerHTML || '';
        }
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.innerHTML = htmlString || '';
            });
    }

    text(textString?: string): string | void {
        if (arguments.length === 0) {
            const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
            return el?.innerText || '';
        }
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.innerText = textString || '';
            });
    }

    content(textString?: string): string | void {
        if (arguments.length === 0) {
            return this.elems[0]?.textContent || '';
        }
        this.elems.forEach(el => {
            el.textContent = textString || '';
        });
    }

    show(): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.style.display = el.dataset.originalDisplay || '';
                if (getComputedStyle(el).display === 'none') {
                    el.style.display = 'block';
                }
            });
    }
    
    hide(): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                if (!el.dataset.originalDisplay) {
                    el.dataset.originalDisplay = getComputedStyle(el).display;
                }
                el.style.display = 'none';
            });
    }

    toggle(): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                if (getComputedStyle(el).display === 'none') {
                    this.show();
                } else {
                    this.hide();
                }
            });
    }
    
    slideDown(duration: number = 400): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.style.display = el.dataset.originalDisplay || 'block';
                el.style.overflow = 'hidden';
                el.style.height = '0';
                el.style.transition = `height ${duration}ms ease`;

                const fullHeight = el.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    el.style.height = fullHeight;
                });

                setTimeout(() => {
                    el.style.height = '';
                    el.style.overflow = '';
                }, duration);
            });
    }

    slideUp(duration: number = 400): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.style.overflow = 'hidden';
                el.style.height = el.scrollHeight + 'px';
                el.style.transition = `height ${duration}ms ease`;

                requestAnimationFrame(() => {
                    el.style.height = '0';
                });

                setTimeout(() => {
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = '';
                }, duration);
            });
    }

    slideToggle(duration: number = 400): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                if (getComputedStyle(el).display === 'none') {
                    this.slideDown(duration);
                } else {
                    this.slideUp(duration);
                }
            });
    }
    
    // events

    on(event: string, handler: EventListener): void {
        this.elems.forEach(el => {
            el.addEventListener(event, handler);
        });
    }

    off(event: string, handler: EventListener): void {
        this.elems.forEach(el => {
            el.removeEventListener(event, handler);
        });
    }

    delegate(event: string, selector: string, handler: EventListener): void {
        this.elems.forEach(el => {
            el.addEventListener(event, (e: Event) => {
                const target = e.target as Element;
                if (target && target.matches(selector)) {
                    handler.call(target, e);
                }
            });
        });
    }

    trigger(event: string): void {
        const evt = new Event(event, { bubbles: true, cancelable: true });
        this.elems.forEach(el => {
            el.dispatchEvent(evt);
        });
    }

    submit(): void {
        const el = this.elems.find((el): el is HTMLFormElement => el instanceof HTMLFormElement);
        if (el) {
            el.submit();
        }
    }

    focus(): void {
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (el) {
            el.focus();
        }
    }
    
    // animations

    fadeIn(duration: number = 400): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                el.style.opacity = '0';
                el.style.display = 'block';
                let start: number | null = null; // Explicitly declare the type

                const step = (timestamp: number) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    el.style.opacity = progress.toString();
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    }
                };

                requestAnimationFrame(step);
            });
    }

    fadeOut(duration: number = 400): void {
        this.elems
            .filter((el): el is HTMLElement => el instanceof HTMLElement)
            .forEach(el => {
                let start: number | null = null; // Explicitly declare the type

                const step = (timestamp: number) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    el.style.opacity = (1 - progress).toString();
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.style.display = 'none';
                    }
                };

                requestAnimationFrame(step);
            });
    }

    // swipe
    onSwipe(callback: (direction: 'left' | 'right' | 'up' | 'down') => void): void {
        this.elems.forEach(el => {
            let startX = 0, startY = 0, endX = 0, endY = 0;

            el.addEventListener('touchstart', (e) => {
                const touchEvent = e as TouchEvent;
                startX = touchEvent.touches[0].clientX;
                startY = touchEvent.touches[0].clientY;
            });

            el.addEventListener('touchend', (e) => {
                const touchEvent = e as TouchEvent;
                endX = touchEvent.changedTouches[0].clientX;
                endY = touchEvent.changedTouches[0].clientY;

                const diffX = endX - startX;
                const diffY = endY - startY;

                if (Math.abs(diffX) > Math.abs(diffY)) {
                    callback(diffX > 0 ? 'right' : 'left');
                } else {
                    callback(diffY > 0 ? 'down' : 'up');
                }
            });
        });
    }

    // misc
    
    serialize(): string {
        const el = this.elems.find((el): el is HTMLFormElement => el instanceof HTMLFormElement);
        if (!el) return '';

        const formData = new FormData(el);
        return Array.from(formData.entries())
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
            .join('&');
    }
    
    clone(): DOM {
        const clones = this.elems.map(el => el.cloneNode(true) as Element);
        return new DOM(clones);
    }

    matchesAny(selector: string): boolean {
        return this.elems.some(el => el.matches(selector));
    }

    index(): number {
        const el = this.elems[0];
        if (!el || !el.parentElement) return -1;
        return Array.from(el.parentElement.children).indexOf(el);
    }

    isEmpty(): boolean {
        const el = this.elems[0];
        return el ? el.childNodes.length === 0 : true;
    }

    closest(selector: string): DOM {
        const el = this.elems[0];
        const closestEl = el?.closest(selector);
        return closestEl ? new DOM(closestEl) : new DOM([]);
    }

    offset(): { top: number; left: number } | null {
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

    position(): { top: number; left: number } | null {
        const el = this.elems.find((el): el is HTMLElement => el instanceof HTMLElement);
        if (!el) return null;

        const offsetParent = el.offsetParent as HTMLElement;
        const offset = this.offset();
        const parentOffset = offsetParent ? new DOM(offsetParent).offset() : { top: 0, left: 0 };

        return {
            top: (offset?.top || 0) - (parentOffset?.top || 0) - parseInt(getComputedStyle(el).marginTop),
            left: (offset?.left || 0) - (parentOffset?.left || 0) - parseInt(getComputedStyle(el).marginLeft)
        };
    }

    scrollIntoView(options?: ScrollIntoViewOptions): void {
        const el = this.elems[0];
        if (el) {
            el.scrollIntoView(options);
        }
    }

    scrollTop(value?: number): number | void {
        const el = this.elems[0];
        if (!el) return 0;

        if (value !== undefined) {
            if (el instanceof HTMLElement) {
                el.scrollTop = value;
            } else if (el === document.documentElement || el === document.body) {
                window.scrollTo({ top: value });
            }
        } else {
            return el instanceof HTMLElement ? el.scrollTop : window.pageYOffset;
        }
    }

    scrollLeft(value?: number): number | void {
        const el = this.elems[0];
        if (!el) return 0;

        if (value !== undefined) {
            if (el instanceof HTMLElement) {
                el.scrollLeft = value;
            } else if (el === document.documentElement || el === document.body) {
                window.scrollTo({ left: value });
            }
        } else {
            return el instanceof HTMLElement ? el.scrollLeft : window.pageXOffset;
        }
    }
}