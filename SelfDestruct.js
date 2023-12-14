/**
 * Enchanced timer which allows for pause, resetting, and determining (approximate) time left.
 */
class Timer {
  #id;
  #startedAt;
  #msRemaining;
  #isRunning;
  #callback;
  #delay;

  constructor(callback, delay) {
    this.#msRemaining = delay;
    this.#callback = callback;
    this.#delay = delay;
    this.start();
  }

  get timeLeft() {
    if (this.#isRunning) {
      this.pause();
      this.start();
    }
    return this.#msRemaining;
  }

  get isRunning() {
    return this.#isRunning;
  }

  pause() {
    this.#isRunning = false;
    clearTimeout(this.#id);
    this.#msRemaining -= new Date() - this.#startedAt;
  }

  reset() {
    this.stop();
    this.#msRemaining = this.#delay;
  }

  start() {
    this.#isRunning = true;
    this.#startedAt = new Date();
    this.#id = setTimeout(this.#callback, this.#msRemaining);
  }

  stop() {
    this.#isRunning = false;
    clearTimeout(this.#id);
    this.#msRemaining = 0;
  }
}

class SelfDestruct extends HTMLElement {
  /**
   * Build a horizontal progress bar.
   */
  buildBar(percentage) {
    percentage = Math.min(1, Math.max(0, percentage)); // ensure 0 <= percentage <= 1
    return `<span class="self-destruct-progress-bar" style="width:${percentage * 100}%;"></span>`;
  }

  /**
   * Build an SVG pie chart.
   */
  buildPie(percentage) {
    percentage = Math.min(1, Math.max(0, percentage)); // ensure 0 <= percentage <= 1
    const x = Math.cos(2 * Math.PI * percentage);
    const y = Math.sin(2 * Math.PI * percentage);
    const pie = percentage > 0 && percentage < 1 ? `<path d="M1 0A1 1 0 ${percentage > 0.5 ? 1 : 0} 1 ${x} ${y}L0 0" class="self-destruct-svg-fg" fill="#f009" transform="rotate(-90)"/>` : '';
    return `<svg width="1em" height="1em" class="self-destruct-svg" viewBox="-1 -1 2 2" aria-hidden="true"><circle r="1" cx="0" cy="0" class="self-destruct-svg-bg" fill="#0000"/>${pie}</svg>`;
  }

  constructor() {
    super();
    this.defaultTtl = 5000; // default time to live in ms (seconds * 1000)
    this.reduceMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
    this.progress = null;
  }

  /**
   * Runs when the element is added to the DOM.
   */
  connectedCallback() {
    // how long until self-destruction?
    this.ttl = this.hasAttribute('ttl') ? this.parseTime(this.getAttribute('ttl')) : this.defaultTtl;
    // allow animation?
    this.animate = !this.reduceMotion && !this.hasAttribute('no-animation') && this.ttl >= 250;
    // show a progress indicator?
    this.progressType = this.getAttribute('progress') ?? false;
    // build the progress indicator if more than 1 second remaining and progress type is specified
    if (this.ttl > 1000 && this.progressType) {
      this.initProgress();
    }
    // init the countdown
    this.initTimer();
    // add event handling
    this.addEventListener('click', this);
    this.addEventListener('mouseenter', this);
    this.addEventListener('mouseleave', this);
  }

  /**
   * Remove any progress indicator.
   */
  destroyProgress() {
    this.updater && clearInterval(this.updater);
    this.progressContainer && this.progressContainer.remove();
  }

  /**
   * Handle the self-destruction.
   */
  destruct() {
    this.destroyProgress();
    this.timer && this.timer.stop();
    this.remove();
  }

  /**
   * Runs when the element is removed from the DOM.
   */
  disconnectedCallback() {
    // stop the countdown timer
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
    // remove the progress indicator
    this.destroyProgress();
    // remove event handling
    this.removeEventListener('click', this);
    this.removeEventListener('mouseenter', this);
    this.removeEventListener('mouseleave', this);
  }

  /**
   * Delegate events to class methods.
   */
  handleEvent(ev) {
    return this['on' + ev.type] && this['on' + ev.type](ev);
  }

  /**
   * Build the specified progress indicator.
   */
  initProgress() {
    // figure out where to add the progress indicator
    let el = this.childElementCount ? this.firstElementChild : this;
    const useTarget = this.hasAttribute('progress-target') && this.querySelector(this.getAttribute('progress-target'));
    if (useTarget) {
      el = this.querySelector(this.getAttribute('progress-target'));
      el.textContent = ''; // clear any existing content
    }
    // build the progress indicator container and fill it with the initial state
    this.progressContainer = document.createElement('span');
    this.progressContainer.className = 'self-destruct-progress';
    if (this.progressType === 'pie') {
      this.progressContainer.innerHTML = this.buildPie(1);
      this.progress = this.progressContainer;
    } else if (this.progressType === 'bar') {
      this.progressContainer.innerHTML = this.buildBar(1);
      this.progress = this.progressContainer.querySelector('.self-destruct-progress-bar');
      el = this;
    } else if (this.progressType === 'seconds') {
      this.progressContainer.textContent = this.ttl;
      this.progress = this.progressContainer;
    }
    // add the progress indicator to the main element
    el.appendChild(this.progressContainer);
    // start the progress indicator updating
    this.updater = setInterval(this.updateProgress.bind(this), 50);
  }

  /**
   * Start the timer.
   */
  initTimer() {
    const el = this; // cache 'this' to avoid scope issues
    if (el.ttl > 0) {
      const ttl = el.animate ? el.ttl - 250 : el.ttl; // shave off 250ms for fade out if animating
      el.timer = new Timer(() => {
        if (el.animate) {
          el.style.transition = `opacity 250ms ease`;
          el.style.opacity = '0';
          el.timer = new Timer(el.destruct.bind(el), 250);
        } else {
          el.destruct();
        }
      }, ttl);
    }
  }

  /**
   * Click event handler.
   */
  onclick(ev) {
    const type = this.getAttribute('on-click');
    if (ev.target.matches('.self-destruct') || type === 'destroy') {
      this.destruct();
    } else if (type === 'pause' && this.timer.isRunning) {
      this.timer.pause();
    } else if (type === 'pause' && !this.timer.isRunning) {
      this.timer.start();
    } else if (type === 'prevent') {
      this.preventDestruct();
    } else if (type === 'reset') {
      this.timer.reset();
      this.timer.start();
    }
  }

  /**
   * Mouse enter event handler.
   */
  onmouseenter(ev) {
    const type = this.getAttribute('on-hover');
    if (type === 'pause') {
      this.timer.pause();
    } else if (type === 'prevent') {
      this.preventDestruct();
    } else if (type === 'reset') {
      this.timer.reset();
    }
  }

  /**
   * Mouse leave event handler.
   */
  onmouseleave(ev) {
    const type = this.getAttribute('on-hover');
    if (type === 'pause' || type === 'reset') {
      this.timer.start();
    }
  }

  /**
   * Parse time into ms.
   * E.g., .2s, 0.3s, 1s, 5.1s, 80ms, 100
   */
  parseTime(text) {
    const parts = text.match(/((?:\d?\.)?\d+) ?(m?s)?/);
    let r = parts ? parseFloat(parts[1]) : this.defaultTtl;
    if (parts && parts[2] === 's') {
      r *= 1000;
    }
    return r;
  }

  /**
   * Prevent the self-destruct from happening.
   */
  preventDestruct() {
    this.timer.stop();
    this.updater && clearInterval(this.updater);
    this.destroyProgress();
  }

  /**
   * Update the progress indicator.
   */
  updateProgress() {
    if (this.progressType === 'pie') {
      this.progressContainer.innerHTML = this.buildPie(this.timer.timeLeft / this.ttl);
    } else if (this.progressType === 'bar') {
      this.progress.style.width = String(this.timer.timeLeft / this.ttl * 100) + '%';
    } else if (this.progressType === 'seconds') {
      this.progressContainer.textContent = Math.ceil(this.timer.timeLeft / 1000);
    }
  }
}

if ("customElements" in window) {
  window.customElements.define('self-destruct', SelfDestruct);
}
