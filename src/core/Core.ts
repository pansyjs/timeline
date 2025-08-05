import type { Body, Dom, TimelineOptions } from './types';

export class Core {
  dom: Dom | null = null;
  body: Body | null = null;
  options: Required<TimelineOptions> = {} as Required<TimelineOptions>;

  _create(container: HTMLElement) {
    if (!container)
      throw new Error('No container provided');

    this.dom = {} as Dom;

    const { prefixCls } = this.options;
    this.dom.container = container;
    this.dom.container.style.position = 'relative';

    this.dom.root = document.createElement('div');
    this.dom.top = document.createElement('div');

    this.dom.root.className = `${prefixCls}`;
    this.dom.top.className = `${prefixCls}-top`;

    this.dom.root.appendChild(this.dom.top);

    container.appendChild(this.dom.root);
  }

  setOptions(options: TimelineOptions) {
    // eslint-disable-next-line no-console
    console.log(options);
  }

  destroy() {
    if (this.dom) {
      if (this.dom.root.parentNode) {
        this.dom.root.parentNode.removeChild(this.dom.root);
      }

      this.dom = null;
    }
  }

  _initAutoResize() {

  }
}
